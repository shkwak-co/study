# 06. FPGA / ASIC Industry Ecosystem

## 반도체 설계 산업의 큰 구조

FPGA와 ASIC은 제품, 설계 회사, IP 업체, EDA 업체, 파운드리, 패키징/테스트 업체가 연결된 산업입니다.

```text
제품 회사 / 시스템 회사
        |
        v
Fabless 반도체 설계 회사
        |
        +--> IP Vendor
        +--> EDA Tool Vendor
        +--> Design Service
        |
        v
Foundry
        |
        v
OSAT: Packaging / Test
        |
        v
완제품 제조사
```

## 주요 회사 유형

| 유형 | 역할 |
|------|------|
| Fabless | 칩을 설계하지만 직접 제조 공장은 운영하지 않는 회사입니다. |
| Foundry | 고객 설계를 실제 웨이퍼로 제조하는 회사입니다. |
| IDM | 설계와 제조를 모두 하는 회사입니다. |
| EDA Vendor | 칩 설계 자동화 도구를 제공합니다. |
| IP Vendor | CPU, DDR, PCIe, USB, SerDes 같은 재사용 가능한 IP를 제공합니다. |
| OSAT | 패키징과 테스트를 담당합니다. |
| FPGA Vendor | FPGA 칩, 보드, 툴체인, IP를 제공합니다. |
| Design Service | 특정 설계, 검증, 물리설계 업무를 위탁 수행합니다. |

## FPGA 생태계

FPGA 프로젝트는 보통 다음 요소로 구성됩니다.

| 요소 | 예시 |
|------|------|
| FPGA 칩 | 고성능 FPGA, 저전력 FPGA, SoC FPGA |
| 개발 보드 | 평가 보드, custom board |
| 설계 툴 | Vivado, Vitis, Quartus, Radiant, Libero 등 |
| IP | DDR controller, PCIe, Ethernet MAC, FIFO, PLL |
| Embedded software | bare-metal, RTOS, Linux driver |
| Debug tool | ILA, SignalTap, JTAG, UART |

FPGA는 특히 다음 상황에서 많이 쓰입니다.

- ASIC 개발 전 prototype
- 통신 장비처럼 표준 변화가 빠른 분야
- 수량은 적지만 성능이 필요한 장비
- 현장에서 업데이트가 필요한 제품
- 특수 I/O와 저지연 처리가 중요한 시스템

## ASIC 생태계

ASIC은 훨씬 많은 이해관계자가 참여합니다.

```text
Architecture
  |
RTL Design
  |
Verification
  |
Synthesis
  |
DFT
  |
Physical Design
  |
Signoff
  |
Tape-out
  |
Foundry Manufacturing
  |
Packaging
  |
ATE Test
  |
Post-silicon Validation
```

각 단계마다 전문 직무가 존재합니다.

## 대표 직무

| 직무 | 하는 일 |
|------|---------|
| Digital Design Engineer | RTL로 기능 블록을 설계합니다. |
| Verification Engineer | testbench, assertion, coverage로 RTL을 검증합니다. |
| FPGA Engineer | FPGA 구현, 보드 bring-up, prototype, accelerator를 개발합니다. |
| Physical Design Engineer | floorplan, placement, CTS, routing을 수행합니다. |
| STA Engineer | timing constraints와 timing closure를 담당합니다. |
| DFT Engineer | scan, ATPG, BIST 등 제조 테스트 구조를 설계합니다. |
| Analog/Mixed-signal Engineer | PLL, ADC, SerDes, PMIC 같은 아날로그/혼합신호 블록을 설계합니다. |
| Firmware Engineer | 칩 제어 firmware, boot code, driver를 작성합니다. |
| Validation Engineer | 실제 실리콘과 보드에서 기능/성능을 검증합니다. |
| CAD/EDA Engineer | 설계 자동화 flow, script, tool infrastructure를 관리합니다. |
| Architecture Engineer | 성능, 전력, 기능 요구사항을 바탕으로 칩 구조를 정의합니다. |

## EDA 툴의 역할

EDA는 Electronic Design Automation의 약자입니다. 칩 설계를 자동화하고 검증하는 툴입니다.

| 분야 | 툴 역할 |
|------|---------|
| Simulation | RTL이 기능적으로 맞는지 시뮬레이션합니다. |
| Synthesis | RTL을 gate-level netlist로 변환합니다. |
| Formal | 두 설계가 동등한지, 특정 속성이 항상 참인지 검증합니다. |
| CDC/RDC | 클럭/리셋 도메인 crossing 문제를 검사합니다. |
| STA | 모든 timing path를 분석합니다. |
| Place and Route | 셀 배치와 배선을 수행합니다. |
| Power Analysis | 전력 소비를 분석합니다. |
| DRC/LVS | 제조 규칙과 레이아웃 일치성을 검사합니다. |

대표 상용 EDA 생태계에는 Synopsys, Cadence, Siemens EDA 등이 있고, FPGA 쪽에는 AMD/Xilinx, Intel FPGA, Lattice, Microchip 계열 툴이 많이 쓰입니다. 오픈소스 쪽에는 Verilator, Icarus Verilog, GHDL, Yosys, OpenROAD, cocotb 같은 도구가 있습니다.

## IP 생태계

현대 칩은 모든 것을 직접 만들지 않습니다. 검증된 IP를 사거나 재사용합니다.

| IP 종류 | 예 |
|---------|----|
| Processor IP | ARM, RISC-V, DSP |
| Interface IP | PCIe, USB, Ethernet, MIPI, HDMI |
| Memory IP | DDR controller, SRAM macro, HBM controller |
| Analog IP | PLL, ADC, DAC, SerDes, PMIC block |
| Security IP | crypto engine, secure boot, TRNG |
| Verification IP | 프로토콜 검증용 VIP |

IP를 쓸 때 중요한 것:

- 라이선스 비용
- 공정 지원 여부
- 검증 수준
- 문서 품질
- integration 난이도
- timing/power/area 정보
- 유지보수와 support

## 파운드리와 공정

ASIC은 파운드리 공정에 맞춰 만들어집니다. 공정 노드가 작아질수록 일반적으로 더 높은 집적도와 성능/전력 이점을 기대할 수 있지만, 설계 비용과 난이도도 커집니다.

파운드리가 제공하는 것:

- PDK
- design rule
- device model
- standard cell library 연계
- memory compiler 정보
- signoff 조건
- tape-out 절차

설계팀은 이 조건을 만족해야 제조 가능한 칩을 만들 수 있습니다.

## 패키징과 테스트

칩은 웨이퍼 위에서 만들어진 뒤 잘라서 패키지에 넣고 테스트됩니다.

| 단계 | 설명 |
|------|------|
| Wafer sort | 웨이퍼 상태에서 die를 검사합니다. |
| Dicing | 웨이퍼를 개별 die로 자릅니다. |
| Packaging | die를 패키지에 넣고 외부 핀/볼과 연결합니다. |
| Final test | 패키지된 칩을 ATE로 검사합니다. |
| Burn-in | 일부 제품에서 장시간 스트레스를 주어 초기 불량을 걸러냅니다. |

패키지는 단순한 보호 껍데기가 아닙니다. 전원 무결성, 신호 무결성, 열, 고속 I/O 성능에 큰 영향을 줍니다.

## 제품 관점의 의사결정

FPGA로 갈지 ASIC으로 갈지는 기술만으로 결정되지 않습니다.

| 질문 | FPGA가 유리한 경우 | ASIC이 유리한 경우 |
|------|-------------------|--------------------|
| 수량 | 소량/중간 수량 | 대량 |
| 출시 일정 | 빠른 출시 필요 | 긴 개발 기간 허용 |
| 수정 가능성 | 현장 업데이트 필요 | 기능이 안정적 |
| 성능/전력 | 중간 수준 허용 | 최고 성능/저전력 필요 |
| 초기 비용 | 낮아야 함 | 큰 NRE 감당 가능 |
| 개당 단가 | 높아도 됨 | 낮아야 함 |

## FPGA에서 ASIC으로 넘어가는 흐름

많은 팀은 먼저 FPGA로 시스템을 검증하고, 이후 ASIC으로 전환합니다.

```text
Algorithm model
  |
  v
RTL prototype
  |
  v
FPGA validation
  |
  v
ASIC refinement
  |
  v
Tape-out
```

FPGA에서 잘 동작하던 RTL도 ASIC으로 갈 때는 다음을 다시 봐야 합니다.

- clock/reset strategy
- memory macro 변경
- IP 교체
- DFT 요구사항
- power domain
- timing constraints
- CDC/RDC signoff
- test mode

## 커리어 학습 방향

### RTL / FPGA 지향

1. 디지털 논리
2. Verilog/SystemVerilog
3. FPGA tool 사용
4. UART, FIFO, SPI, AXI-lite 실습
5. timing report 읽기
6. 작은 accelerator 설계
7. C firmware와 연동

### Verification 지향

1. SystemVerilog testbench
2. assertion
3. constrained random
4. coverage
5. UVM 개념
6. protocol checker
7. regression 자동화

### ASIC Physical Design 지향

1. 디지털 회로와 timing 기본
2. synthesis 결과 이해
3. STA와 SDC
4. floorplan, placement, CTS, routing
5. power grid, IR drop, EM
6. DRC/LVS
7. signoff flow

### Firmware / Hardware-Software 지향

1. C와 embedded system
2. memory-mapped I/O
3. interrupt, DMA, cache
4. device driver
5. Linux kernel driver 기초
6. hardware register spec 작성
7. FPGA/ASIC bring-up

## 산업에서 자주 쓰는 지표

| 지표 | 의미 |
|------|------|
| Fmax | 최대 동작 주파수 |
| Throughput | 단위 시간당 처리량 |
| Latency | 입력에서 출력까지 걸리는 시간 |
| Utilization | FPGA 자원 사용률 |
| Area | ASIC 면적 |
| Power | 전력 소비 |
| Yield | 제조된 칩 중 정상 동작하는 비율 |
| NRE | Non-Recurring Engineering. 초기 개발 비용 |
| BOM | Bill of Materials. 제품 구성 부품 비용 |
| Time-to-market | 시장 출시까지 걸리는 시간 |

## 전체 생태계를 이해하는 핵심 문장

FPGA와 ASIC 산업은 단순히 HDL 코드를 쓰는 일이 아닙니다.

실제 산업에서는 다음을 함께 최적화합니다.

- 알고리즘
- 아키텍처
- RTL 품질
- 검증 완성도
- 타이밍
- 전력
- 면적
- 메모리와 데이터 이동
- 소프트웨어 연동
- 제조 가능성
- 비용과 일정

좋은 하드웨어 엔지니어는 "코드를 짜는 사람"을 넘어, **물리적인 칩 위에서 데이터가 언제, 어디로, 얼마나 빠르게, 얼마나 적은 전력으로 이동하는지 설계하는 사람**입니다.

