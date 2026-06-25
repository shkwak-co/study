# 07. Product Lifecycle: From Idea to Launch

이 문서는 FPGA 또는 ASIC 기반 제품을 **처음 기획하는 순간부터 설계, 검증, 테스트, 출시, 양산, 유지보수까지** 어떤 흐름으로 진행하는지 정리합니다.

FPGA와 ASIC은 최종 구현 방식이 다르지만, 제품 관점에서는 공통으로 다음 질문에서 시작합니다.

- 어떤 문제를 해결할 것인가?
- 왜 CPU/GPU가 아니라 FPGA 또는 ASIC이 필요한가?
- 목표 성능, 전력, 비용, 일정은 무엇인가?
- 누가 사용할 제품인가?
- 출시 후 업데이트와 유지보수는 어떻게 할 것인가?

## 전체 흐름 한눈에 보기

```text
1. 사업/제품 기획
        |
        v
2. 기술 타당성 검토
        |
        v
3. 요구사항 정의
        |
        v
4. 시스템 아키텍처
        |
        v
5. 상세 설계: RTL, firmware, board, software
        |
        v
6. 기능 검증: simulation, formal, emulation, prototype
        |
        +------------------------------+
        |                              |
        v                              v
7A. FPGA 구현/보드 검증          7B. ASIC 합성/물리설계/signoff
        |                              |
        v                              v
8A. FPGA 제품 검증              8B. tape-out/제조/패키징
        |                              |
        v                              v
9A. 양산 준비                   9B. silicon bring-up/validation
        |                              |
        +---------------+--------------+
                        |
                        v
10. 인증, 출시, 고객 지원, 개선
```

## 단계별 산출물

| 단계 | 핵심 질문 | 주요 산출물 |
|------|-----------|-------------|
| 제품 기획 | 이 칩/보드가 왜 필요한가? | product brief, 시장/고객 요구, 목표 가격 |
| 기술 타당성 | FPGA/ASIC으로 구현 가능한가? | feasibility report, risk list, rough PPA |
| 요구사항 정의 | 무엇을 만족해야 하는가? | PRD, system spec, interface spec |
| 아키텍처 | 어떤 블록으로 나눌 것인가? | architecture spec, block diagram, dataflow |
| RTL/소프트웨어 설계 | 실제 구현은 어떻게 할 것인가? | RTL, firmware, driver, board schematic |
| 검증 | 설계가 맞다는 증거가 있는가? | test plan, coverage, regression result |
| 구현 | 실제 타깃에 올릴 수 있는가? | bitstream 또는 netlist/GDSII |
| Bring-up | 실제 하드웨어가 살아나는가? | bring-up log, debug report |
| 검증/인증 | 제품 환경에서 동작하는가? | validation report, compliance result |
| 출시/양산 | 반복 생산과 고객 지원이 가능한가? | production test, release package, errata |

## 1단계: 사업/제품 기획

기획 단계는 기술보다 먼저 **제품의 존재 이유**를 정하는 단계입니다.

확인할 내용:

- 목표 고객과 사용 환경
- 처리해야 하는 데이터 종류
- CPU/GPU/MCU/기성 칩으로 해결이 안 되는 이유
- 성능 목표: throughput, latency, clock, bandwidth
- 전력 목표: 평균 전력, peak power, 열 설계 한계
- 비용 목표: BOM, 칩 단가, 개발비, NRE
- 출시 일정: prototype, EVT, DVT, PVT, mass production
- 규제/인증: EMC, 안전, 자동차, 의료, 통신 규격 등

여기서 중요한 판단은 "기술적으로 만들 수 있는가"보다 **사업적으로 만들 가치가 있는가**입니다.

## 2단계: 기술 타당성 검토

기술 타당성은 초기 위험을 줄이는 단계입니다.

검토 항목:

| 항목 | 확인 내용 |
|------|-----------|
| 연산량 | 필요한 계산량이 어느 정도인가 |
| 메모리 대역폭 | DDR/HBM/온칩 SRAM으로 감당 가능한가 |
| I/O | 필요한 핀 수, 속도, 표준을 지원하는가 |
| 지연시간 | 파이프라인과 버퍼링으로 목표를 만족할 수 있는가 |
| 전력 | 보드/패키지/열 설계로 감당 가능한가 |
| 툴/IP | 필요한 EDA 툴과 IP를 확보할 수 있는가 |
| 인력 | 설계, 검증, firmware, board, physical design 역량이 있는가 |
| 일정 | 출시 일정 안에 검증과 반복 수정이 가능한가 |

FPGA 제품이라면 어떤 FPGA family가 적합한지, ASIC이라면 어떤 공정 노드와 IP가 필요한지 대략 정합니다.

## 3단계: 요구사항 정의

요구사항은 이후 모든 설계와 검증의 기준입니다.

좋은 요구사항은 다음 속성을 가져야 합니다.

- 측정 가능해야 합니다.
- 모호한 표현이 없어야 합니다.
- 검증 방법이 있어야 합니다.
- 우선순위가 있어야 합니다.
- 변경 이력이 관리되어야 합니다.

예시:

```text
나쁜 요구사항:
영상 처리가 빨라야 한다.

좋은 요구사항:
1920x1080 60fps YUV422 입력을 받아 16ms 이내에 필터링 결과를 출력해야 한다.
입력 인터페이스는 AXI4-Stream 128-bit, 동작 클럭은 250MHz를 목표로 한다.
```

요구사항 문서에 들어갈 내용:

- 기능 요구사항
- 성능 요구사항
- 전력/열 요구사항
- 인터페이스 요구사항
- 메모리 요구사항
- reset/boot/update 요구사항
- 오류 처리 요구사항
- 보안 요구사항
- 테스트/인증 요구사항

## 4단계: 시스템 아키텍처

아키텍처 단계에서는 제품을 큰 블록으로 나눕니다.

```text
External I/O
    |
    v
Input PHY / Protocol
    |
    v
Parser / Preprocess
    |
    v
Buffer / DMA / Memory
    |
    v
Compute Accelerator
    |
    v
Output Formatter
    |
    v
External I/O

Control CPU / Firmware는 register, interrupt, DMA를 통해 전체를 제어
```

결정할 것:

- 어떤 기능을 하드웨어로 만들고 어떤 기능을 소프트웨어로 둘 것인가
- 데이터가 streaming인지 frame/batch 처리인지
- 메모리를 공유할지, 각 블록마다 local buffer를 둘지
- 버스 프로토콜은 무엇을 쓸지
- 클럭 도메인은 몇 개로 나눌지
- reset 순서는 어떻게 할지
- firmware와 driver가 어떤 register map을 사용할지
- 검증 가능한 단위로 블록을 나눴는지

## 5단계: 마이크로아키텍처와 상세 설계

아키텍처가 큰 그림이라면, 마이크로아키텍처는 각 블록의 내부 구조입니다.

예를 들어 accelerator 블록은 다음처럼 세부화됩니다.

```text
AXI-Stream Input
    |
    v
Skid Buffer
    |
    v
Pipeline Stage 0: unpack
    |
    v
Pipeline Stage 1: multiply
    |
    v
Pipeline Stage 2: accumulate
    |
    v
Pipeline Stage 3: saturate / round
    |
    v
AXI-Stream Output
```

상세 설계에서 정하는 것:

- pipeline stage 수
- register 위치
- FIFO 깊이
- backpressure 처리
- overflow/underflow 처리
- fixed-point bit width
- FSM state
- error/status bit
- interrupt 조건
- debug register
- test mode

## 6단계: RTL 작성

RTL은 설계 의도를 실제 하드웨어 코드로 표현하는 단계입니다.

작성 원칙:

- 조합논리와 순차논리를 명확히 분리합니다.
- 모든 상태와 출력의 default 값을 명확히 둡니다.
- valid/ready 같은 handshake 규칙을 문서화합니다.
- register map과 RTL 구현을 일치시킵니다.
- synthesis warning을 방치하지 않습니다.
- clock/reset domain을 명확히 표시합니다.

RTL과 함께 작성해야 하는 문서:

- module interface 설명
- register map
- timing diagram
- FSM diagram
- data format
- reset sequence
- clock domain 설명
- error handling policy

## 7단계: 검증 계획

검증은 "코드가 돌아가는지 보는 것"이 아니라, **요구사항을 만족한다는 증거를 쌓는 과정**입니다.

검증 계획에는 다음이 들어갑니다.

| 항목 | 설명 |
|------|------|
| Feature list | 검증할 기능 목록 |
| Test scenario | 정상/오류/경계 조건 시나리오 |
| Checker | 기대값과 실제값을 비교하는 방식 |
| Coverage | 어떤 기능과 상태가 테스트되었는지 측정 |
| Assertion | 반드시 지켜야 하는 프로토콜/상태 규칙 |
| Regression | 반복 실행되는 자동 테스트 묶음 |
| Exit criteria | 검증 완료 기준 |

검증 수준:

```text
Block-level verification
        |
        v
Subsystem verification
        |
        v
SoC / top-level verification
        |
        v
FPGA prototype or emulation
        |
        v
Board / silicon validation
```

## 8단계: FPGA 제품 흐름

FPGA 제품은 ASIC보다 빠르게 실제 하드웨어에서 시험할 수 있습니다.

### FPGA 구현 흐름

```text
RTL / IP / constraints
        |
        v
Simulation
        |
        v
Synthesis
        |
        v
Place and Route
        |
        v
Timing Closure
        |
        v
Bitstream 생성
        |
        v
Board programming
        |
        v
Bring-up
```

### FPGA bring-up 체크리스트

- 전원 rail이 정상인가
- clock이 정상 주파수로 들어오는가
- reset이 의도한 순서로 풀리는가
- JTAG 연결이 되는가
- bitstream 다운로드가 되는가
- 기본 register read/write가 되는가
- firmware가 부팅되는가
- 외부 메모리 DDR calibration이 성공하는가
- 고속 I/O link가 올라오는가
- ILA/SignalTap으로 내부 신호를 관찰할 수 있는가
- 온도와 전류가 예상 범위인가

### FPGA 제품 출시 전 테스트

| 테스트 | 목적 |
|--------|------|
| Functional test | 기능이 요구사항대로 동작하는지 확인 |
| Timing margin test | 주파수, 온도, 전압 조건에서 안정성 확인 |
| Stress test | 장시간 동작과 최대 부하 상황 확인 |
| Power test | 평균/피크 전력과 열 확인 |
| Interface test | PCIe, Ethernet, DDR, SPI 등 외부 연결 검증 |
| Firmware update test | bitstream/firmware 업데이트 절차 확인 |
| Manufacturing test | 공장에서 빠르게 양품/불량을 판별하는 테스트 |

FPGA는 출시 후에도 bitstream 업데이트가 가능하다는 장점이 있지만, 업데이트 체계가 잘못되면 현장 장애가 커질 수 있습니다. 따라서 rollback, version 관리, compatibility test가 중요합니다.

## 9단계: ASIC 제품 흐름

ASIC은 FPGA보다 수정 비용이 훨씬 크기 때문에, tape-out 전 검증과 signoff가 매우 중요합니다.

### ASIC 구현 흐름

```text
RTL freeze
    |
    v
Logic synthesis
    |
    v
DFT insertion
    |
    v
Formal equivalence check
    |
    v
Floorplan
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
Signoff: STA, power, IR, EM, DRC, LVS
    |
    v
Tape-out
```

### ASIC signoff 항목

| 항목 | 의미 |
|------|------|
| STA | 모든 timing path가 모든 corner에서 만족되는지 확인 |
| LEC/Formal | 합성/최적화 전후 논리 동등성 확인 |
| DRC | 파운드리 제조 규칙 위반 확인 |
| LVS | 레이아웃과 netlist 일치 여부 확인 |
| IR drop | 전원망 전압 강하 확인 |
| EM | 배선 전류로 인한 장기 신뢰성 확인 |
| Power | 동적 전력, 누설 전력, peak power 확인 |
| CDC/RDC | 클럭/리셋 도메인 crossing 안정성 확인 |
| DFT coverage | 생산 테스트가 결함을 충분히 잡는지 확인 |

### Tape-out 이후

```text
GDSII/OASIS 전달
        |
        v
Mask 제작
        |
        v
Wafer fabrication
        |
        v
Wafer sort
        |
        v
Packaging
        |
        v
Final test
        |
        v
First silicon 수령
```

이후부터는 post-silicon 단계입니다.

## 10단계: Silicon Bring-up

ASIC의 첫 실리콘이 도착하면 가장 먼저 칩이 "살아있는지" 확인합니다.

Bring-up 순서:

1. 보드 전원 확인
2. 칩 전원 rail 순서 확인
3. clock 입력 확인
4. reset sequence 확인
5. JTAG 또는 debug port 연결
6. chip ID register read
7. scan/BIST 기본 테스트
8. boot ROM 또는 firmware boot
9. SRAM/DDR 테스트
10. 주요 IP block enable
11. PLL lock, SerDes link, PHY calibration 확인
12. 기본 데이터 경로 테스트

이 단계에서 실패하면 원인을 빠르게 분류해야 합니다.

| 증상 | 가능한 원인 |
|------|-------------|
| 전류가 너무 큼 | 전원 단락, latch-up, power sequence 문제 |
| JTAG 연결 실패 | pin mux, reset, clock, board routing 문제 |
| register read 실패 | bus, clock, reset, address map 문제 |
| DDR 실패 | board SI, PHY 설정, training, power noise 문제 |
| 특정 블록만 실패 | RTL bug, clock gating, reset, timing, firmware 설정 문제 |

## 11단계: Validation과 Characterization

Validation은 실제 칩/보드가 제품 요구사항을 만족하는지 확인하는 단계입니다.

Characterization은 동작 한계를 측정하는 단계입니다.

측정 항목:

- 최대 동작 주파수
- 전압별 동작 범위
- 온도별 동작 범위
- 전력 소비
- link margin
- memory margin
- analog 특성
- boot time
- error rate
- 장시간 안정성

ASIC에서는 PVT corner를 중요하게 봅니다.

```text
P: Process variation
V: Voltage variation
T: Temperature variation
```

즉 제조 편차, 전압 변화, 온도 변화에서도 칩이 안정적으로 동작해야 합니다.

## 12단계: 인증과 규격 테스트

제품에 따라 외부 인증이 필요합니다.

예시:

- EMC/EMI
- 안전 인증
- 자동차 신뢰성
- 통신 규격 인증
- PCIe/USB/Ethernet compliance
- 보안 인증
- 산업 온도/진동/습도 테스트

FPGA/ASIC 자체뿐 아니라 보드, 전원, 케이블, enclosure, firmware까지 함께 영향을 줍니다.

## 13단계: 양산 준비

출시는 단순히 "기능이 동작한다"로 끝나지 않습니다. 같은 품질로 반복 생산할 수 있어야 합니다.

양산 준비 항목:

- BOM 확정
- 부품 공급망 확인
- test fixture 제작
- 공장 테스트 시간 최적화
- serial number와 calibration data 관리
- firmware/bitstream programming 절차
- 불량 분석 절차
- 품질 기준 정의
- RMA 처리 절차
- 생산 수율 모니터링

ASIC은 추가로 다음을 봅니다.

- wafer sort yield
- final test yield
- binning strategy
- package yield
- ATE test coverage
- lot 추적성
- failure analysis flow

## 14단계: 출시와 고객 지원

출시 후에도 엔지니어링은 계속됩니다.

필요한 것:

- release note
- known issue / errata
- firmware 또는 bitstream version 관리
- customer debug guide
- field log 수집
- 재현 테스트 환경
- hotfix 절차
- 장기 공급 계획

FPGA 제품은 현장 업데이트가 비교적 쉽지만, 업데이트 품질 관리가 중요합니다. ASIC 제품은 하드웨어 수정이 어렵기 때문에 firmware workaround, driver workaround, 다음 revision 반영 전략이 중요합니다.

## FPGA와 ASIC 라이프사이클 비교

| 관점 | FPGA | ASIC |
|------|------|------|
| 초기 prototype | 빠름 | 보통 FPGA prototype/emulation 필요 |
| 수정 비용 | 낮음 | 매우 높음 |
| 출시 전 검증 부담 | 높음 | 매우 높음 |
| 최종 산출물 | bitstream, board, firmware | silicon, package, firmware, driver |
| 생산 테스트 | 보드/시스템 테스트 중심 | wafer sort, final test, system test |
| 현장 업데이트 | bitstream/firmware 가능 | firmware/driver workaround 중심 |
| 주요 리스크 | timing, board, IP 설정, 공급 FPGA 단가 | tape-out bug, yield, signoff, NRE |

## 프로젝트 단계별 의사결정 게이트

실무에서는 각 단계마다 다음 단계로 넘어가도 되는지 리뷰합니다.

| 게이트 | 통과 기준 |
|--------|-----------|
| Concept Review | 제품 가치, 시장, 고객 문제가 명확함 |
| Feasibility Review | 성능/전력/비용/일정 위험을 설명할 수 있음 |
| Architecture Review | 블록 구조, 데이터 흐름, 인터페이스가 정의됨 |
| Design Review | RTL/firmware/board 설계가 문서와 일치함 |
| Verification Review | test plan과 coverage 목표가 합리적임 |
| FPGA Release Review | timing, 기능, 보드 테스트가 통과됨 |
| ASIC Tape-out Review | signoff와 검증 기준이 충족됨 |
| Bring-up Review | 기본 기능과 debug path가 살아 있음 |
| Production Readiness Review | 제조, 테스트, 품질, 공급망이 준비됨 |
| Launch Review | 고객 문서, 지원 절차, release package가 준비됨 |

## 실무에서 자주 생기는 문제

| 문제 | 원인 | 예방 방법 |
|------|------|-----------|
| 요구사항 변경 폭증 | 초기 정의가 불명확함 | PRD와 변경 승인 절차 |
| 검증 누락 | test plan이 기능 목록을 따라가지 못함 | coverage와 review |
| timing closure 실패 | 파이프라인/제약/아키텍처 문제 | 초기부터 timing budget 설정 |
| 보드 bring-up 지연 | 전원/클럭/reset/debug 경로 미흡 | bring-up checklist와 test point |
| firmware와 RTL 불일치 | register map 관리 실패 | 단일 register spec에서 자동 생성 |
| ASIC 재제작 | 검증 부족 또는 signoff 누락 | tape-out checklist와 독립 리뷰 |
| 양산 테스트 시간이 김 | 공장 테스트 고려 부족 | DFT, BIST, test mode 조기 설계 |

## 한 문장으로 정리

FPGA/ASIC 제품 개발은 RTL을 작성하는 일만이 아닙니다.
**제품 기획, 요구사항, 아키텍처, RTL, 검증, 구현, 보드/실리콘 테스트, 인증, 양산, 고객 지원이 연결된 긴 시스템 엔지니어링 과정**입니다.
