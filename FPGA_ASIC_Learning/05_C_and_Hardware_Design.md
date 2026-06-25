# 05. C/C++ and Hardware Design

## C언어를 FPGA나 ASIC에 "얹는다"는 말의 의미

C 코드는 기본적으로 CPU가 실행하는 소프트웨어입니다. FPGA나 ASIC의 순수 디지털 회로는 C 코드를 직접 실행하지 않습니다.

현업에서 "C를 FPGA/ASIC에 얹는다"는 말은 보통 다음 중 하나입니다.

| 방식 | 의미 |
|------|------|
| 내장 CPU에서 C firmware 실행 | FPGA/ASIC 안의 CPU core가 C 코드를 실행합니다. |
| HLS로 C/C++를 RTL로 변환 | C/C++ 알고리즘을 하드웨어 회로로 합성합니다. |
| C 모델을 golden reference로 사용 | RTL 검증 시 C 결과와 RTL 결과를 비교합니다. |
| C 드라이버로 하드웨어 제어 | memory-mapped register를 C 코드로 읽고 씁니다. |
| DPI/VPI로 C와 시뮬레이터 연동 | SystemVerilog testbench에서 C 함수를 호출합니다. |

## 방식 1: FPGA/ASIC 안에 CPU를 넣고 C 실행

FPGA나 ASIC 안에 CPU core를 넣으면 그 CPU가 C 코드를 실행할 수 있습니다.

```text
        +-------------------------+
        | FPGA / ASIC             |
        |                         |
        |  CPU Core               |
        |    |                    |
        |    | AXI/APB Bus        |
        |    v                    |
        |  Register Interface     |
        |    |                    |
        |    v                    |
        |  Custom RTL Accelerator |
        +-------------------------+
```

CPU 종류:

| 종류 | 예 |
|------|----|
| FPGA hard processor | ARM Cortex-A 계열이 들어간 SoC FPGA |
| FPGA soft processor | MicroBlaze, Nios II, RISC-V softcore 등 |
| ASIC embedded CPU | ARM, RISC-V, DSP core 등 |

이 방식에서 C 코드는 하드웨어 accelerator를 직접 계산하지 않고, 보통 다음을 수행합니다.

- 레지스터 설정
- DMA 시작
- 상태 확인
- interrupt 처리
- 메모리 버퍼 관리
- 오류 처리

## Memory-mapped I/O

하드웨어 블록은 보통 레지스터 주소 공간으로 CPU에 노출됩니다.

```text
Base address = 0x4000_0000

0x00 CONTROL
0x04 STATUS
0x08 SRC_ADDR
0x0C DST_ADDR
0x10 LENGTH
```

C 코드 예시:

```c
#include <stdint.h>

#define ACCEL_BASE   0x40000000u
#define REG_CONTROL  0x00u
#define REG_STATUS   0x04u
#define REG_SRC_ADDR 0x08u
#define REG_DST_ADDR 0x0Cu
#define REG_LENGTH   0x10u

static inline void write_reg(uint32_t offset, uint32_t value)
{
    volatile uint32_t *addr = (volatile uint32_t *)(ACCEL_BASE + offset);
    *addr = value;
}

static inline uint32_t read_reg(uint32_t offset)
{
    volatile uint32_t *addr = (volatile uint32_t *)(ACCEL_BASE + offset);
    return *addr;
}

void run_accelerator(uint32_t src, uint32_t dst, uint32_t length)
{
    write_reg(REG_SRC_ADDR, src);
    write_reg(REG_DST_ADDR, dst);
    write_reg(REG_LENGTH, length);
    write_reg(REG_CONTROL, 1u);

    while ((read_reg(REG_STATUS) & 1u) == 0u) {
        /* wait */
    }
}
```

여기서 `volatile`은 컴파일러가 하드웨어 레지스터 접근을 최적화로 제거하지 못하게 하는 데 중요합니다.

## 방식 2: HLS로 C/C++를 하드웨어로 변환

HLS는 High-Level Synthesis의 약자입니다. C/C++ 또는 유사한 고수준 언어를 RTL로 변환하는 흐름입니다.

```text
C/C++ algorithm
  |
  v
HLS tool
  |
  v
RTL: Verilog/SystemVerilog/VHDL
  |
  v
FPGA 또는 ASIC flow
```

간단한 HLS 스타일 예시:

```c
void add_vec(const int a[1024], const int b[1024], int c[1024])
{
    for (int i = 0; i < 1024; i++) {
        c[i] = a[i] + b[i];
    }
}
```

HLS 도구는 이 반복문을 어떻게 하드웨어로 만들지 결정해야 합니다.

- 한 사이클에 하나씩 처리할지
- 여러 개를 병렬 처리할지
- 파이프라인을 넣을지
- 메모리 포트를 어떻게 사용할지
- 배열을 BRAM으로 둘지 register로 펼칠지

## HLS에서 중요한 지시어 개념

HLS에서는 C 코드만으로 하드웨어 품질이 충분히 나오지 않는 경우가 많습니다. 그래서 pragma/directive를 사용합니다.

| 개념 | 의미 |
|------|------|
| Pipeline | 반복문 또는 함수가 매 사이클 새 데이터를 받도록 파이프라인화합니다. |
| Unroll | 반복문을 여러 하드웨어로 펼쳐 병렬화합니다. |
| Array partition | 배열을 여러 메모리 뱅크로 나눠 병렬 접근을 가능하게 합니다. |
| Interface pragma | AXI, stream, memory-mapped register 같은 인터페이스를 지정합니다. |
| Dataflow | 여러 함수/루프가 FIFO를 통해 동시에 동작하도록 만듭니다. |

HLS는 소프트웨어 개발자가 하드웨어에 접근하기 쉽게 해주지만, 좋은 결과를 내려면 결국 하드웨어 구조를 이해해야 합니다.

## 방식 3: C 모델을 golden reference로 사용

복잡한 알고리즘은 먼저 C/C++ 또는 Python으로 정확한 모델을 만듭니다.

```text
입력 벡터
  |
  +--> C golden model -> 기대 출력
  |
  +--> RTL simulation -> 실제 출력
                         |
                         v
                      비교
```

이 방식은 DSP, 영상처리, AI accelerator, 통신 알고리즘에서 많이 사용됩니다.

## 방식 4: SystemVerilog DPI로 C 함수 호출

SystemVerilog DPI를 사용하면 testbench에서 C 함수를 호출할 수 있습니다.

```systemverilog
import "DPI-C" function int c_model(input int x);

module tb;
    initial begin
        int expected;
        expected = c_model(10);
    end
endmodule
```

이 기능은 검증 환경에서 C reference model을 재사용할 때 유용합니다.

## C로 하드웨어를 다룰 때 핵심은 데이터 이동

가속기 설계에서 계산 블록만 빠르게 만드는 것으로는 충분하지 않습니다. 실제 병목은 데이터 이동일 때가 많습니다.

중요한 요소:

- CPU cache와 DMA coherency
- DDR bandwidth
- AXI burst length
- memory alignment
- buffer ownership
- interrupt latency
- backpressure
- FIFO depth

```text
느린 시스템:
CPU가 작은 데이터를 하나씩 register로 씀

빠른 시스템:
CPU가 큰 버퍼를 준비
DMA가 데이터를 streaming
accelerator가 pipeline으로 처리
DMA가 결과를 메모리에 저장
```

## FPGA에서 C와 RTL을 함께 쓰는 전형적 구조

```text
        DDR Memory
            |
            v
CPU ---- AXI Interconnect ---- DMA ---- AXI Stream ---- RTL Accelerator
 |              |
 |              v
 +-------- AXI-Lite Registers
```

CPU의 C firmware:

1. 입력 데이터를 DDR에 준비합니다.
2. accelerator register에 주소와 길이를 씁니다.
3. DMA를 시작합니다.
4. 완료 interrupt 또는 status bit를 기다립니다.
5. 결과 버퍼를 읽습니다.

RTL accelerator:

1. AXI stream으로 데이터를 받습니다.
2. 파이프라인으로 처리합니다.
3. 결과를 AXI stream으로 내보냅니다.
4. 완료 상태를 register에 표시합니다.

## C와 HDL의 차이

| 관점 | C | HDL |
|------|---|-----|
| 실행 모델 | CPU가 명령어를 순차 실행 | 회로가 동시에 동작 |
| 변수 | 메모리/레지스터에 저장되는 값 | wire, register, flip-flop, net |
| 반복문 | 실행 시간이 반복 횟수에 비례 | 합성 시 하드웨어 구조가 될 수 있음 |
| 함수 | 호출되어 실행 | module 또는 combinational logic으로 매핑 가능 |
| 시간 | 명령 실행 시간 | 클럭, cycle, setup/hold |
| 디버깅 | printf, debugger | waveform, logic analyzer, assertions |

## 실무 판단 기준

| 상황 | 추천 |
|------|------|
| 제어 로직이 많고 성능 요구가 낮음 | CPU + C firmware |
| 특정 계산이 반복되고 병렬화 가능 | RTL accelerator 또는 HLS |
| 알고리즘이 자주 바뀜 | C 모델, HLS, FPGA prototype |
| 극한 성능/전력 최적화 필요 | 수작업 RTL 또는 ASIC custom 설계 |
| 복잡한 소프트웨어 스택 필요 | embedded Linux + hardware accelerator |

## 결론

C는 FPGA/ASIC 세계에서 사라지지 않습니다. 다만 역할이 바뀝니다.

- C는 CPU firmware가 될 수 있습니다.
- C는 HLS를 통해 하드웨어가 될 수 있습니다.
- C는 RTL 검증의 기준 모델이 될 수 있습니다.
- C는 하드웨어를 제어하는 driver가 될 수 있습니다.

중요한 것은 **어떤 부분을 소프트웨어로 남기고, 어떤 부분을 하드웨어로 내릴 것인지**를 판단하는 능력입니다.

