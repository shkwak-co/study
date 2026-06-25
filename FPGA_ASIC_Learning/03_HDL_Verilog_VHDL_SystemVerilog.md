# 03. HDL, Verilog, VHDL, SystemVerilog

## HDL이란 무엇인가

HDL은 **Hardware Description Language**의 약자입니다. 하드웨어 기술 언어라는 뜻입니다.

HDL은 CPU에서 순서대로 실행되는 소프트웨어를 쓰는 언어가 아니라, **회로의 구조와 동작을 기술하는 언어**입니다.

```text
소프트웨어 언어:
명령어의 순서가 중요

HDL:
동시에 존재하는 회로와 클럭에 따른 상태 변화가 중요
```

## 대표 HDL

| 언어 | 특징 | 주 사용처 |
|------|------|-----------|
| Verilog | C와 비슷한 문법, 짧고 실용적 | FPGA, ASIC RTL |
| VHDL | 강한 타입 시스템, 엄격한 문법 | 항공, 국방, 유럽권, 안전성이 중요한 분야 |
| SystemVerilog | Verilog 확장, RTL과 검증 기능 강화 | 현대 ASIC 설계와 검증 |
| Chisel/SpinalHDL | Scala 기반 고수준 하드웨어 생성 언어 | 생성형 하드웨어, 연구, 일부 산업 |
| HLS C/C++ | C/C++에서 RTL 생성 | FPGA 가속기, 알고리즘 프로토타입 |

참고: 사용자가 적은 `Verlog`, `system verlog`는 보통 각각 **Verilog**, **SystemVerilog**로 씁니다.

## HDL로 작성하는 것은 무엇인가

HDL로는 다음을 작성합니다.

- 조합논리: adder, mux, decoder
- 순차논리: register, counter, shift register
- FSM: finite state machine
- 메모리 인터페이스
- 버스 프로토콜: AXI, APB, Avalon 등
- 통신 프로토콜: UART, SPI, I2C, Ethernet 일부
- 가속기 datapath
- 테스트벤치와 검증 환경

## 합성 가능한 코드와 시뮬레이션 전용 코드

HDL에는 두 세계가 있습니다.

| 구분 | 의미 | 예 |
|------|------|----|
| Synthesizable RTL | 실제 하드웨어로 변환 가능한 코드 | `always_ff`, `assign`, `case`, register |
| Simulation-only code | 시뮬레이션에서만 쓰는 코드 | `#10`, 파일 입출력, 일부 random, testbench task |

예를 들어 아래 코드는 시뮬레이션 시간 지연을 의미하므로 일반적인 합성 회로가 아닙니다.

```verilog
#10 signal = 1'b1;
```

반면 아래는 플립플롭으로 합성됩니다.

```systemverilog
always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n)
        q <= 1'b0;
    else
        q <= d;
end
```

## Verilog 기본 예시

### 조합논리

```verilog
module mux2 (
    input  wire a,
    input  wire b,
    input  wire sel,
    output wire y
);
    assign y = sel ? b : a;
endmodule
```

이 코드는 2:1 mux로 합성됩니다.

### 순차논리

```verilog
module counter (
    input  wire       clk,
    input  wire       rst_n,
    output reg  [7:0] count
);
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n)
            count <= 8'd0;
        else
            count <= count + 8'd1;
    end
endmodule
```

이 코드는 8비트 레지스터와 증가 회로로 합성됩니다.

## SystemVerilog 기본 예시

SystemVerilog는 Verilog보다 의도를 더 명확하게 표현할 수 있습니다.

```systemverilog
module counter_sv (
    input  logic       clk,
    input  logic       rst_n,
    output logic [7:0] count
);
    always_ff @(posedge clk or negedge rst_n) begin
        if (!rst_n)
            count <= 8'd0;
        else
            count <= count + 8'd1;
    end
endmodule
```

SystemVerilog에서 자주 쓰는 키워드:

| 키워드 | 의미 |
|--------|------|
| `logic` | Verilog의 `wire`/`reg` 혼란을 줄이는 4-state 신호 타입 |
| `always_ff` | 플립플롭 의도를 표현 |
| `always_comb` | 조합논리 의도를 표현 |
| `always_latch` | latch 의도를 표현 |
| `interface` | 버스 신호 묶음과 방향 관리 |
| `assert` | 속성 검증 |
| `class` | 검증 환경 구성 |

## VHDL 기본 예시

```vhdl
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity counter_vhdl is
    port (
        clk   : in  std_logic;
        rst_n : in  std_logic;
        count : out unsigned(7 downto 0)
    );
end entity;

architecture rtl of counter_vhdl is
    signal count_r : unsigned(7 downto 0);
begin
    process(clk, rst_n)
    begin
        if rst_n = '0' then
            count_r <= (others => '0');
        elsif rising_edge(clk) then
            count_r <= count_r + 1;
        end if;
    end process;

    count <= count_r;
end architecture;
```

VHDL은 타입이 엄격해서 초반에는 장황하게 느껴질 수 있지만, 대형 설계에서 실수를 줄이는 장점이 있습니다.

## Verilog와 VHDL 비교

| 관점 | Verilog | VHDL |
|------|---------|------|
| 문법 느낌 | C와 유사, 간결 | Ada 계열, 엄격하고 장황 |
| 타입 시스템 | 비교적 느슨함 | 강함 |
| 학습 난이도 | 빠르게 시작하기 쉬움 | 초반 진입장벽이 있음 |
| 산업 사용 | FPGA/ASIC 전반 | 항공, 방산, 유럽권, 일부 FPGA |
| 검증 생태계 | SystemVerilog/UVM이 강력 | VHDL testbench, OSVVM 등 |

## Verilog와 SystemVerilog 비교

| 관점 | Verilog | SystemVerilog |
|------|---------|----------------|
| 목적 | RTL 작성 중심 | RTL + 검증 + 대형 설계 지원 |
| 데이터 타입 | `wire`, `reg` 중심 | `logic`, enum, struct, array 강화 |
| 절차 블록 | `always` | `always_ff`, `always_comb`, `always_latch` |
| 검증 기능 | 제한적 | class, randomization, assertion, coverage |
| 산업 위치 | 기존 코드가 많음 | 현대 ASIC에서 사실상 표준에 가까움 |

## Blocking과 Non-blocking

Verilog/SystemVerilog에서 매우 중요한 개념입니다.

| 연산자 | 이름 | 주 사용처 |
|--------|------|-----------|
| `=` | blocking assignment | 조합논리, testbench 절차 코드 |
| `<=` | non-blocking assignment | 클럭 기반 순차논리 |

일반적인 규칙:

```systemverilog
// 조합논리
always_comb begin
    y = a & b;
end

// 순차논리
always_ff @(posedge clk) begin
    q <= d;
end
```

이 규칙을 지키면 시뮬레이션과 합성 결과의 불일치를 줄일 수 있습니다.

## HDL 설계에서 흔한 실수

| 실수 | 결과 |
|------|------|
| 조합논리에서 모든 분기 값을 할당하지 않음 | 의도치 않은 latch 생성 |
| 클럭 도메인 crossing을 무시 | metastability, 간헐적 오류 |
| reset 전략이 불명확 | 초기 상태 불안정 |
| blocking/non-blocking 혼용 | 시뮬레이션과 합성 불일치 |
| 타이밍 제약 누락 | 실제 FPGA/ASIC에서 동작 불량 |
| testbench가 결과를 자동 검사하지 않음 | 오류를 눈으로 놓치기 쉬움 |

## HDL 코드는 어떻게 회로가 되는가

```text
HDL RTL
  |
  v
Synthesis
  |
  v
Gate-level netlist
  |
  +-------------------+
  |                   |
  v                   v
FPGA LUT/FF mapping   ASIC standard-cell mapping
```

중요한 점은 HDL의 모든 줄이 "명령어"가 아니라 회로 구조로 해석된다는 것입니다. `if` 문도 CPU branch가 아니라 mux 또는 enable logic이 될 수 있습니다.

## 실무 추천

- 새 설계를 시작한다면 SystemVerilog RTL 스타일을 추천합니다.
- 기존 VHDL 프로젝트나 특정 산업 도메인에서는 VHDL을 배워야 할 수 있습니다.
- 검증까지 진지하게 하려면 SystemVerilog assertion, UVM, cocotb, Verilator 같은 도구를 함께 익히면 좋습니다.
- HDL 학습은 문법보다 **어떤 회로가 만들어지는지 상상하는 능력**이 훨씬 중요합니다.

