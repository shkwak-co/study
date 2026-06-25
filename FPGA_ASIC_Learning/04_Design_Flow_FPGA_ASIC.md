# 04. FPGA / ASIC Design Flow

## 설계 흐름의 공통 핵심

FPGA와 ASIC은 최종 목적지가 다르지만 앞부분은 상당히 비슷합니다.

```text
요구사항 정의
  |
  v
아키텍처 설계
  |
  v
RTL 작성
  |
  v
기능 검증
  |
  v
합성
  |
  +------------------+
  |                  |
  v                  v
FPGA 구현           ASIC 물리설계
```

좋은 하드웨어 설계는 코드를 빨리 쓰는 것이 아니라, **요구사항, 데이터 흐름, 클럭, 메모리, 인터페이스, 검증 전략을 먼저 정리하는 것**에서 시작합니다.

제품 기획부터 출시/양산까지의 더 넓은 흐름은 [07_Product_Lifecycle_From_Idea_to_Launch.md](./07_Product_Lifecycle_From_Idea_to_Launch.md)를 함께 보면 좋습니다.

## 1단계: 요구사항 정의

먼저 다음 질문에 답해야 합니다.

| 질문 | 예시 |
|------|------|
| 무엇을 처리하는가 | 영상, 패킷, 센서 데이터, 행렬, 암호화 |
| 입력/출력 폭은 얼마인가 | 8-bit pixel, 512-bit AXI stream |
| 처리량은 얼마인가 | 매 클럭 1 sample, 초당 10Gbps |
| 지연시간 제한은 얼마인가 | 100ns 이하, frame 단위 처리 가능 |
| 클럭 주파수는 얼마인가 | 100MHz, 250MHz, 1GHz |
| 메모리는 얼마나 필요한가 | FIFO 깊이, SRAM 용량, DDR 사용 여부 |
| 외부 인터페이스는 무엇인가 | AXI, PCIe, Ethernet, DDR, SPI |
| 전력/면적/비용 제약은 무엇인가 | FPGA 자원, ASIC die area, power budget |

## 2단계: 아키텍처 설계

아키텍처는 "어떤 하드웨어 블록들이 어떤 데이터 흐름으로 연결되는가"를 정하는 단계입니다.

```text
Input Stream
    |
    v
Parser -> FIFO -> Compute Pipeline -> Output FIFO -> DMA
                   |
                   v
                Control Registers
```

아키텍처 단계에서 정하는 것:

- 파이프라인 단계 수
- 병렬 처리 폭
- fixed-point 또는 floating-point
- 메모리 구조: register, FIFO, BRAM/SRAM, DDR
- 버스 구조: AXI-lite, AXI-stream, AXI full
- clock domain 개수
- reset 구조
- 에러 처리와 상태 레지스터

## 3단계: RTL 설계

RTL은 Register Transfer Level의 약자입니다. 레지스터 사이에서 데이터가 어떻게 이동하고 변환되는지를 기술합니다.

기본 구성:

| 블록 | 역할 |
|------|------|
| Datapath | 실제 데이터를 계산하고 이동합니다. |
| Control path | FSM, enable, valid/ready 같은 제어 신호를 만듭니다. |
| Register file | CPU 또는 firmware가 읽고 쓰는 설정 레지스터입니다. |
| Interface | 외부 IP나 bus와 연결됩니다. |

## 4단계: 기능 검증

RTL이 의도대로 동작하는지 확인합니다.

검증 방법:

- directed test: 특정 입력을 직접 넣어 검증
- random test: 다양한 입력을 자동 생성
- self-checking testbench: 기대값과 출력값을 자동 비교
- assertion: 반드시 지켜야 하는 속성 검사
- coverage: 어떤 기능이 테스트되었는지 측정
- formal verification: 가능한 상태를 수학적으로 검증

검증의 기본 구조:

```text
Stimulus 생성 -> DUT 입력 -> DUT 출력 -> Checker 비교 -> Pass/Fail
```

DUT는 Design Under Test의 약자입니다.

## FPGA 설계 흐름

FPGA 프로젝트는 보통 다음 순서로 진행됩니다.

```text
RTL / IP 작성
  |
  v
Simulation
  |
  v
Synthesis
  |
  v
Implementation: placement, routing
  |
  v
Timing analysis
  |
  v
Bitstream generation
  |
  v
Board programming
  |
  v
On-chip debug
```

### FPGA에서 추가로 중요한 파일

| 파일/정보 | 설명 |
|-----------|------|
| Pin constraints | HDL 포트가 실제 FPGA 핀 어디에 연결되는지 지정합니다. |
| Clock constraints | 클럭 주파수와 관계를 지정합니다. |
| I/O standard | LVCMOS, LVDS 등 전기적 표준을 지정합니다. |
| IP configuration | PLL, FIFO, DDR, PCIe 등 IP 설정입니다. |
| Board files | 보드의 핀맵과 주변장치 정보입니다. |

### FPGA 디버깅

FPGA는 실제 보드에서 동작하므로 시뮬레이션과 다른 문제가 생길 수 있습니다.

대표 디버깅 방법:

- LED, UART로 간단 상태 출력
- logic analyzer IP 사용
- ILA/SignalTap 같은 on-chip analyzer
- register readback
- test pattern generator 삽입
- timing report 확인
- clock/reset 확인

## ASIC 설계 흐름

ASIC은 FPGA보다 훨씬 긴 흐름을 가집니다.

```text
Specification
  |
  v
Architecture / Microarchitecture
  |
  v
RTL Design
  |
  v
Verification
  |
  v
Logic Synthesis
  |
  v
DFT Insertion
  |
  v
Floorplanning
  |
  v
Placement
  |
  v
Clock Tree Synthesis
  |
  v
Routing
  |
  v
Signoff
  |
  v
Tape-out
```

## ASIC 물리설계 단계

| 단계 | 설명 |
|------|------|
| Floorplan | die 크기, macro 위치, I/O 위치, power grid를 큰 단위로 정합니다. |
| Placement | 표준 셀을 실제 위치에 배치합니다. |
| CTS | Clock Tree Synthesis. 클럭이 균형 있게 도달하도록 클럭 트리를 만듭니다. |
| Routing | 셀과 macro 사이의 배선을 연결합니다. |
| STA | Static Timing Analysis. 모든 타이밍 경로를 정적으로 분석합니다. |
| Power Analysis | 동적 전력과 누설 전력을 분석합니다. |
| IR Drop | 전원망에서 전압이 떨어지는 문제를 분석합니다. |
| EM | Electromigration. 금속 배선이 전류로 손상될 가능성을 분석합니다. |
| DRC | 제조 규칙 위반 여부를 검사합니다. |
| LVS | 레이아웃이 회로도/netlist와 일치하는지 검사합니다. |

## FPGA와 ASIC 설계 흐름 비교

| 단계 | FPGA | ASIC |
|------|------|------|
| RTL 작성 | 공통 | 공통 |
| 기능 검증 | 중요 | 매우 중요 |
| 합성 대상 | LUT, FF, BRAM, DSP | standard cell, macro |
| 배치배선 | FPGA tool 내부 자원에 맞춤 | 실제 실리콘 레이아웃 생성 |
| 최종 산출물 | bitstream | GDSII/OASIS |
| 수정 | 재합성 후 bitstream 재다운로드 | 재 tape-out 필요 가능 |
| 제조 | 이미 제조된 FPGA 사용 | 파운드리 제조 필요 |

## Timing Closure

타이밍 클로저는 목표 주파수에서 모든 경로가 안정적으로 동작하도록 만드는 과정입니다.

주요 개념:

| 용어 | 의미 |
|------|------|
| Setup time | 클럭 에지 전에 데이터가 안정되어 있어야 하는 시간 |
| Hold time | 클럭 에지 후 데이터가 유지되어야 하는 시간 |
| Slack | 요구 시간과 실제 도착 시간의 차이 |
| Critical path | 가장 타이밍이 빡빡한 경로 |
| Fmax | 설계가 동작 가능한 최대 클럭 주파수 |

타이밍 문제 해결 방법:

- 파이프라인 추가
- 긴 조합논리 분할
- fanout 줄이기
- register duplication
- clock domain 정리
- false path, multicycle path 제약 확인
- placement와 floorplan 조정

## CDC: Clock Domain Crossing

서로 다른 클럭 도메인 사이로 신호가 이동하면 metastability 문제가 생길 수 있습니다.

대응 방법:

- 1비트 제어 신호: 2-flop synchronizer
- pulse: toggle synchronizer 또는 handshake
- 다비트 데이터: asynchronous FIFO
- valid/ready 인터페이스: 도메인 간 프로토콜 신중 설계

CDC는 시뮬레이션에서 잘 안 보이다가 실제 칩이나 보드에서 간헐적으로 터질 수 있으므로 매우 중요합니다.

## 설계 리뷰 체크리스트

- reset 후 모든 상태가 정의되는가
- latch가 의도치 않게 생성되지 않는가
- clock gating은 안전한가
- 모든 클럭에 constraints가 있는가
- CDC 경로가 식별되고 보호되었는가
- testbench가 자동으로 pass/fail을 판단하는가
- backpressure 상황을 검증했는가
- FIFO overflow/underflow를 검증했는가
- corner case가 coverage에 포함되는가
- timing report의 critical path를 이해했는가
