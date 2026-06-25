# 01. FPGA Basics

## FPGA란 무엇인가

FPGA는 **Field Programmable Gate Array**의 약자입니다. 직역하면 "현장에서 프로그래밍 가능한 게이트 배열"입니다.

핵심은 다음과 같습니다.

- 제조된 뒤에도 사용자가 원하는 디지털 회로로 다시 구성할 수 있습니다.
- C 코드를 CPU가 실행하는 방식이 아니라, 칩 내부의 논리 자원을 연결해 실제 회로처럼 동작하게 만듭니다.
- 설정 정보는 보통 **bitstream**이라는 파일로 만들어져 FPGA에 다운로드됩니다.

즉 FPGA는 "프로그램을 실행하는 칩"이라기보다, **원하는 하드웨어 회로로 변신할 수 있는 칩**에 가깝습니다.

## CPU, GPU, FPGA의 사고방식 차이

| 구분 | CPU | GPU | FPGA |
|------|-----|-----|------|
| 기본 모델 | 명령어를 순차 실행 | 많은 스레드를 병렬 실행 | 회로 자체를 병렬 구성 |
| 강점 | 범용성, 제어 흐름 | 대량 데이터 병렬 처리 | 지연시간, 스트리밍, 맞춤형 병렬성 |
| 개발 언어 | C/C++, Rust, Python 등 | CUDA, OpenCL 등 | Verilog, VHDL, SystemVerilog, HLS |
| 변경 방식 | 소프트웨어 교체 | 커널/프로그램 교체 | bitstream으로 회로 재구성 |
| 예시 | OS, 앱, 제어 로직 | 행렬 연산, 그래픽 | 통신, 신호처리, 저지연 가속 |

## FPGA 내부 구조

FPGA는 수많은 작은 논리 블록과 배선 자원을 가지고 있습니다.

```text
          +--------------------------------------+
          |                FPGA                  |
          |                                      |
I/O ----> |  I/O Bank     Routing     I/O Bank   | ----> I/O
          |                                      |
          |  LUT + FF    LUT + FF    LUT + FF    |
          |                                      |
          |  BRAM        DSP        Clocking     |
          |                                      |
          |  Hard IP: PCIe, DDR, Ethernet, CPU   |
          +--------------------------------------+
```

대표 구성 요소는 아래와 같습니다.

| 구성 요소 | 설명 |
|-----------|------|
| LUT | Look-Up Table. 작은 진리표처럼 동작하며 조합논리를 구현합니다. |
| Flip-Flop | 클럭에 맞춰 값을 저장하는 1비트 레지스터입니다. |
| CLB/ALM | LUT와 플립플롭을 묶은 기본 논리 블록입니다. FPGA 제조사마다 이름이 다릅니다. |
| Routing | 논리 블록 사이를 연결하는 재구성 가능한 배선망입니다. |
| BRAM/URAM | 칩 내부에 있는 블록 메모리입니다. FIFO, 버퍼, 작은 RAM에 사용됩니다. |
| DSP Slice | 곱셈, 누산, 필터, 행렬 연산 등에 쓰이는 전용 산술 블록입니다. |
| Clocking | PLL, MMCM 같은 클럭 생성/분배 자원입니다. |
| I/O Bank | 외부 핀과 연결되는 영역입니다. 전압 표준과 타이밍 제약이 중요합니다. |
| Transceiver | 고속 직렬 통신용 하드 매크로입니다. PCIe, Ethernet, JESD 등에 사용됩니다. |
| Hard IP | 이미 칩에 내장된 고정 기능 블록입니다. CPU, DDR controller, PCIe 등이 대표적입니다. |

## FPGA는 어떻게 "프로그래밍"되는가

HDL로 작성한 RTL은 다음 과정을 거쳐 bitstream이 됩니다.

```text
RTL 작성
  |
  v
합성: HDL -> LUT, FF, RAM, DSP 같은 논리 자원
  |
  v
구현: 배치, 배선, 타이밍 최적화
  |
  v
bitstream 생성
  |
  v
FPGA 다운로드
```

여기서 "프로그래밍"은 CPU 명령어를 넣는 것이 아니라, FPGA 내부의 LUT 내용과 배선 스위치 설정을 지정하는 일입니다.

## FPGA의 장점

| 장점 | 설명 |
|------|------|
| 재구성 가능 | 설계 오류가 있어도 bitstream을 다시 만들면 수정할 수 있습니다. |
| 빠른 개발 | ASIC처럼 마스크 제작과 웨이퍼 생산을 기다릴 필요가 없습니다. |
| 병렬성 | 회로를 원하는 만큼 병렬로 만들 수 있습니다. |
| 낮은 지연시간 | 데이터가 들어오자마자 파이프라인을 통과하도록 설계할 수 있습니다. |
| 프로토타이핑 | ASIC 제작 전 RTL을 실제 하드웨어에서 검증하는 용도로 많이 씁니다. |

## FPGA의 단점

| 단점 | 설명 |
|------|------|
| 전력 효율 | 같은 기능을 ASIC으로 만들 때보다 전력을 더 많이 쓰는 경우가 많습니다. |
| 성능 한계 | 재구성 가능한 배선과 LUT 구조 때문에 ASIC보다 클럭이 낮을 수 있습니다. |
| 단가 | 대량 생산 제품에서는 ASIC보다 개당 단가가 높을 수 있습니다. |
| 자원 제약 | LUT, BRAM, DSP, I/O 개수가 정해져 있어 설계가 커지면 칩을 바꿔야 합니다. |
| 타이밍 난이도 | 고속 설계에서는 timing closure가 어렵습니다. |

## FPGA가 잘 맞는 분야

- 통신 장비: Ethernet, packet processing, baseband, radar
- 신호처리: FIR/IIR filter, FFT, image pipeline
- 저지연 시스템: 금융 거래, 네트워크 가속, 실시간 제어
- 하드웨어 가속: 압축, 암호화, 검색, AI inference 일부
- ASIC 프로토타이핑: 실제 칩 제작 전 RTL 검증
- 산업/항공/국방: 긴 수명주기와 특수 I/O 요구가 있는 제품

## FPGA 설계에서 중요한 개념

### 1. 클럭

대부분의 디지털 회로는 클럭에 맞춰 상태가 바뀝니다.

```verilog
always_ff @(posedge clk) begin
    q <= d;
end
```

이 코드는 "클럭 상승 에지마다 d 값을 q에 저장하는 플립플롭"을 의미합니다.

### 2. 조합논리와 순차논리

| 종류 | 특징 | 예시 |
|------|------|------|
| 조합논리 | 현재 입력만으로 출력이 결정됨 | AND, mux, adder |
| 순차논리 | 클럭과 이전 상태에 의해 출력이 결정됨 | register, counter, FSM |

### 3. 타이밍 제약

FPGA 도구는 사용자가 원하는 클럭 주파수와 I/O 타이밍을 알아야 합니다. 이를 constraints 파일에 적습니다.

대표적으로 Xilinx/AMD 계열에서는 XDC, ASIC/일부 흐름에서는 SDC 형식을 많이 사용합니다.

```text
create_clock -period 10.000 [get_ports clk]
```

위 의미는 `clk` 포트가 10ns 주기, 즉 100MHz 클럭이라는 뜻입니다.

### 4. Timing Closure

설계가 목표 클럭에서 안정적으로 동작하도록 만드는 과정입니다.

```text
데이터 출발 레지스터 -> 조합논리 -> 데이터 도착 레지스터

클럭 주기 안에 데이터가 도착해야 setup timing 만족
너무 빨리 변해도 hold timing 문제가 생길 수 있음
```

Timing closure는 FPGA 실무에서 매우 중요한 능력입니다.

## FPGA 프로젝트의 기본 산출물

| 산출물 | 설명 |
|--------|------|
| RTL | Verilog, VHDL, SystemVerilog 코드 |
| Testbench | RTL을 검증하는 시뮬레이션 코드 |
| Constraints | 클럭, 핀 배치, I/O 표준, 타이밍 제약 |
| IP 설정 | FIFO, RAM, DDR, PCIe 등 IP configuration |
| Bitstream | FPGA에 다운로드하는 최종 설정 파일 |
| Timing Report | 목표 주파수에서 동작 가능한지 보여주는 보고서 |
| Utilization Report | LUT, FF, BRAM, DSP 사용량 보고서 |

## FPGA를 배울 때의 추천 순서

1. LED blink
2. 버튼 입력과 debounce
3. counter, PWM
4. UART 송수신
5. FIFO와 BRAM
6. SPI 또는 I2C
7. FSM으로 간단한 프로토콜 구현
8. AXI-lite register
9. DMA 기반 데이터 이동
10. C 코드가 동작하는 embedded processor와 RTL accelerator 연결
