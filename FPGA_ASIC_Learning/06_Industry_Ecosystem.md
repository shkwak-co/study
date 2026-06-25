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

## 어떤 분야에서 쓰이는가

FPGA와 ASIC은 "컴퓨터 부품" 한 분야에만 쓰이지 않습니다. 데이터를 빠르게 처리해야 하거나, 전력/면적/지연시간을 강하게 최적화해야 하거나, 외부 장비와 특수한 방식으로 연결해야 하는 거의 모든 산업에 들어갑니다.

| 분야 | FPGA가 쓰이는 방식 | ASIC이 쓰이는 방식 | 필요한 역량 |
|------|-------------------|-------------------|-------------|
| 통신/네트워크 | 패킷 처리, 기지국, 프로토콜 변환, 저지연 스위칭 | 네트워크 스위치 칩, 5G/6G 모뎀, SerDes | 고속 I/O, Ethernet, DSP, timing |
| 데이터센터/AI | inference accelerator prototype, SmartNIC, 압축/암호화 가속 | GPU/NPU/TPU류 AI accelerator, DPU, NIC ASIC | 병렬 아키텍처, 메모리 대역폭, PCIe, HBM |
| 자동차 | 센서 인터페이스, prototype, 실시간 제어 | ADAS SoC, radar processor, zonal controller | 안전, 실시간성, ISO 26262 관점, 검증 |
| 항공/우주/국방 | 레이더, 위성 통신, 신호처리, 장기 운용 장비 | 특수 목적 보안/통신/센서 칩 | 신뢰성, radiation, DSP, 엄격한 검증 |
| 산업 자동화 | 모터 제어, vision inspection, PLC I/O 확장 | 산업용 제어 ASIC, 센서 처리 칩 | 실시간 제어, ADC/DAC, 인터페이스 |
| 의료기기 | 초음파, 영상 장비, 센서 처리 | 저전력 센서/영상 처리 ASIC | 신호처리, 안전성, 품질 문서 |
| 금융/거래 시스템 | 초저지연 네트워크 처리, order matching 일부 | 매우 특화된 저지연 가속 칩 | latency 최적화, networking, FPGA |
| 스토리지 | NVMe prototype, 압축/암호화, controller 검증 | SSD controller, storage accelerator | PCIe, NVMe, ECC, DMA |
| 보안/암호 | 암호 알고리즘 가속, key handling prototype | secure element, crypto engine, HSM 칩 | 암호 알고리즘, side-channel 고려 |
| 소비자 전자 | 카메라/디스플레이 prototype, 제품 전 검증 | 스마트폰 SoC, ISP, display controller | 영상처리, 저전력, SoC integration |
| 반도체 개발 자체 | ASIC prototype, emulation, IP 검증 | 최종 제품 칩 | RTL, verification, FPGA bring-up |
| 계측/과학 장비 | 고속 데이터 수집, DAQ, 실험 장비 제어 | 특수 센서 readout ASIC | 고속 ADC/DAC, clocking, 데이터 수집 |

### 분야별로 FPGA와 ASIC을 선택하는 이유

```text
FPGA가 강한 상황:
- 빠르게 만들어서 검증해야 함
- 표준이나 알고리즘이 자주 바뀜
- 수량이 많지 않음
- 현장 업데이트가 필요함
- 여러 I/O와 프로토콜을 유연하게 붙여야 함

ASIC이 강한 상황:
- 대량 생산으로 개당 단가를 낮춰야 함
- 전력 효율이 매우 중요함
- 최고 성능이나 작은 면적이 필요함
- 제품 차별화를 칩 수준에서 만들고 싶음
- 기능이 충분히 안정되어 재구성이 덜 필요함
```

### 도메인별 대표 설계 블록

| 도메인 | 자주 나오는 하드웨어 블록 |
|--------|---------------------------|
| 통신 | FIR filter, FFT, FEC, packet parser, MAC, SerDes interface |
| AI | matrix multiply, systolic array, vector unit, DMA, cache, scratchpad memory |
| 영상 | ISP pipeline, scaler, color conversion, convolution, frame buffer |
| 자동차 | sensor fusion, radar FFT, safety monitor, lockstep CPU, watchdog |
| 스토리지 | ECC, encryption, compression, Flash controller, PCIe/NVMe |
| 보안 | AES, SHA, RSA/ECC accelerator, TRNG, secure boot controller |
| 산업제어 | PWM, encoder interface, motor control loop, ADC sampling logic |

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

FPGA/ASIC 진로는 하나의 길만 있는 분야가 아닙니다. 크게 보면 **설계**, **검증**, **물리 구현**, **시스템/펌웨어**, **아키텍처**, **EDA/자동화**로 나뉩니다.

```text
디지털 논리 기본
        |
        v
HDL / C / 컴퓨터 구조 기본
        |
        +---------------------------+
        |                           |
        v                           v
RTL/FPGA 설계                 Verification
        |                           |
        v                           v
ASIC 설계 / 아키텍처          UVM / Formal / Coverage
        |
        +---------------------------+
        |                           |
        v                           v
Physical Design / STA         Firmware / Driver / Bring-up
```

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

### Architecture 지향

1. 컴퓨터 구조
2. cache, memory hierarchy, interconnect
3. performance modeling
4. workload 분석
5. PPA trade-off
6. system-level simulation
7. RTL/검증/소프트웨어 팀과 요구사항 조율

### EDA / CAD 지향

1. Python, Tcl, Make/CMake
2. Linux와 shell scripting
3. synthesis, simulation, regression flow
4. timing report와 로그 자동 분석
5. CI 환경 구성
6. tool wrapper와 설계 자동화
7. 대규모 RTL 빌드/검증 인프라 관리

## 배경별 진입 전략

### 전자공학/반도체 배경

강점:

- 디지털 논리, 회로, 신호, 반도체 물성에 익숙할 가능성이 높습니다.
- ASIC physical design, analog/mixed-signal, DFT, STA 쪽으로 확장하기 좋습니다.

추천 경로:

1. Verilog/SystemVerilog로 조합논리와 순차논리 구현
2. FSM, FIFO, UART, SPI 같은 기본 블록 설계
3. testbench와 waveform 디버깅
4. FPGA 보드에서 실제 동작 확인
5. synthesis/timing report 읽기
6. 관심에 따라 RTL, verification, physical design 중 선택

### 컴퓨터공학/소프트웨어 배경

강점:

- C/C++, Python, 알고리즘, OS, 컴퓨터 구조에 익숙할 가능성이 높습니다.
- hardware-software co-design, firmware, driver, accelerator architecture, verification automation에 강점이 생기기 쉽습니다.

추천 경로:

1. 디지털 논리와 클럭 기반 사고 익히기
2. C 코드와 RTL의 차이 이해
3. SystemVerilog 또는 Verilog 기본 작성
4. memory-mapped register, interrupt, DMA 이해
5. 작은 accelerator를 만들고 C driver로 제어
6. cocotb, Verilator, Python 기반 검증 자동화 실습

### 임베디드/펌웨어 배경

강점:

- 보드, register, interrupt, peripheral, driver에 익숙합니다.
- FPGA bring-up, SoC integration, validation, firmware 직무로 연결하기 좋습니다.

추천 경로:

1. HDL로 peripheral 하나 직접 구현
2. AXI-lite register interface 이해
3. C firmware로 RTL block 제어
4. logic analyzer로 보드 디버깅
5. boot sequence, clock/reset, power sequence 학습
6. validation 또는 hardware-software integration 역할로 확장

### 수학/물리/신호처리 배경

강점:

- 알고리즘, 모델링, DSP, 통계, 최적화에 강할 수 있습니다.
- 통신, radar, 영상, AI accelerator, scientific instrument 쪽과 잘 맞습니다.

추천 경로:

1. 알고리즘을 fixed-point로 변환하는 법 학습
2. Python/C 모델 작성
3. RTL 또는 HLS로 datapath 구현
4. golden model과 RTL 결과 비교
5. pipeline, throughput, latency 최적화
6. DSP/AI/통신 accelerator 분야로 확장

## 직무별 포트폴리오 아이디어

| 목표 직무 | 추천 프로젝트 |
|-----------|---------------|
| FPGA Engineer | FPGA 보드에서 UART, SPI, PWM, FIFO, AXI-lite register, ILA 디버깅까지 구현 |
| RTL Design Engineer | pipelined multiplier, packet parser, DMA-like engine, small RISC-V peripheral |
| Verification Engineer | SystemVerilog testbench, assertion, coverage, random packet generator |
| Firmware/Validation | C driver로 FPGA register 제어, interrupt/DMA 테스트, bring-up log 작성 |
| Physical Design 입문 | 작은 RTL을 합성하고 timing report, area report, critical path 분석 |
| Architecture | matrix multiply accelerator 모델링, throughput/latency/memory bandwidth 분석 |
| EDA/CAD | Verilator 기반 regression script, waveform 자동 저장, lint/sim CI 구축 |

좋은 포트폴리오는 단순히 "동작했다"가 아니라 다음을 보여줘야 합니다.

- 요구사항
- 블록 다이어그램
- RTL 구조
- testbench 구조
- 검증 결과
- timing/resource report
- 디버깅 기록
- 한계와 개선 방향

## 취업 준비에서 중요한 역량

| 역량 | 왜 중요한가 | 확인 방법 |
|------|-------------|-----------|
| 디지털 논리 | 모든 RTL/FPGA/ASIC의 기본입니다. | FSM, counter, mux, register 문제 |
| HDL 감각 | 코드가 어떤 회로로 합성되는지 알아야 합니다. | Verilog/SystemVerilog coding test |
| 타이밍 이해 | 실제 칩은 클럭과 타이밍 제약 안에서 동작합니다. | setup/hold, critical path 설명 |
| 검증 사고 | 하드웨어 오류는 수정 비용이 큽니다. | testbench, corner case 질문 |
| 시스템 이해 | 칩은 단독으로 동작하지 않습니다. | CPU, bus, memory, DMA 설명 |
| 디버깅 능력 | 실무 대부분은 원인 추적입니다. | waveform, log, board issue 분석 |
| 문서화 | 여러 팀이 같은 spec을 보고 일합니다. | register spec, timing diagram 작성 |

## 입문자가 자주 헷갈리는 진로 선택

| 고민 | 판단 기준 |
|------|-----------|
| FPGA와 ASIC 중 무엇부터 할까? | 처음에는 FPGA가 결과를 눈으로 보기 쉬워 입문에 좋습니다. 이후 ASIC 흐름을 확장하면 됩니다. |
| Verilog와 VHDL 중 무엇을 배울까? | 국내외 디지털 ASIC/검증 쪽은 Verilog/SystemVerilog가 넓게 쓰입니다. 특정 회사/방산/항공 프로젝트는 VHDL도 중요합니다. |
| 설계와 검증 중 무엇이 좋을까? | 회로 구조를 만드는 데 끌리면 설계, 오류를 체계적으로 찾고 자동화하는 데 끌리면 검증이 맞습니다. |
| C/C++도 해야 할까? | 해야 합니다. firmware, driver, golden model, HLS, 검증 자동화에서 계속 등장합니다. |
| Python도 필요한가? | 필요합니다. 로그 분석, 테스트 자동화, 데이터 생성, 모델링에 매우 유용합니다. |
| 수학이 많이 필요한가? | 직무에 따라 다릅니다. DSP/AI/통신은 많이 쓰고, bus/peripheral/검증은 상대적으로 덜 씁니다. |

## 6개월 입문 로드맵

### 1개월차: 디지털 논리와 HDL 기본

- 조합논리, 순차논리, FSM
- Verilog/SystemVerilog module 작성
- testbench와 waveform 보기

### 2개월차: 작은 블록 설계

- counter, PWM, UART TX/RX
- FIFO, debounce, simple timer
- self-checking testbench 작성

### 3개월차: FPGA 보드 실습

- clock/reset constraints
- LED, button, UART bring-up
- ILA 또는 SignalTap으로 내부 신호 보기
- timing report 읽기

### 4개월차: 시스템 연결

- AXI-lite 또는 memory-mapped register
- C firmware로 register read/write
- interrupt 또는 polling 방식 제어
- 간단한 데이터 처리 accelerator

### 5개월차: 검증과 자동화

- random test
- assertion 기본
- Python/cocotb 또는 Verilator regression
- coverage 관점 정리

### 6개월차: 포트폴리오 정리

- 프로젝트 README 작성
- architecture diagram
- waveform 캡처
- timing/resource report
- 발생한 버그와 해결 과정 정리
- 다음 개선 방향 명시

## 분야별 추천 진로 조합

| 관심사 | 잘 맞는 방향 |
|--------|--------------|
| 하드웨어 구조 자체가 재미있다 | RTL Design, FPGA Design |
| 버그를 찾고 검증 체계를 만드는 게 좋다 | Verification, Formal, UVM |
| 실제 보드와 장비를 만지는 게 좋다 | FPGA Bring-up, Validation, Embedded |
| 물리적인 칩 구현과 타이밍 최적화가 좋다 | Physical Design, STA |
| C와 하드웨어 경계가 좋다 | Firmware, Driver, Hardware-Software Co-design |
| 알고리즘을 빠르게 만들고 싶다 | DSP/AI Accelerator Architecture |
| 툴과 자동화가 좋다 | CAD/EDA, Verification Infrastructure |

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
