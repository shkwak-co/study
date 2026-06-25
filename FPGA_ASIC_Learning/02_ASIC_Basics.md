# 02. ASIC Basics

## ASIC이란 무엇인가

ASIC은 **Application-Specific Integrated Circuit**의 약자입니다. 특정 제품, 알고리즘, 시스템 요구사항에 맞춰 설계하고 제조하는 주문형 집적회로입니다.

FPGA가 "이미 만들어진 재구성 가능한 칩"이라면, ASIC은 "처음부터 목적에 맞게 만드는 칩"입니다.

```text
FPGA:
이미 만들어진 칩 위에 원하는 회로를 설정

ASIC:
원하는 회로 자체를 실리콘으로 제조
```

## ASIC의 대표 예시

- 스마트폰 SoC
- AI accelerator
- GPU, NPU, TPU 계열 가속기
- 네트워크 스위치 ASIC
- SSD controller
- 자동차 ADAS chip
- 이미지 센서 처리 칩
- 전력 관리 IC
- 통신 모뎀

## ASIC의 장점

| 장점 | 설명 |
|------|------|
| 성능 | 특정 목적에 맞춰 회로, 메모리, 배선을 최적화할 수 있습니다. |
| 전력 효율 | 불필요한 재구성 자원이 없어 FPGA보다 전력 효율이 좋을 수 있습니다. |
| 면적 효율 | 동일 기능을 더 작은 실리콘 면적으로 구현할 수 있습니다. |
| 대량 생산 단가 | 초기 비용은 크지만 물량이 많으면 개당 비용이 낮아질 수 있습니다. |
| 제품 차별화 | 경쟁사가 쉽게 복제하기 어려운 전용 하드웨어를 만들 수 있습니다. |

## ASIC의 단점

| 단점 | 설명 |
|------|------|
| 높은 초기 비용 | 설계 인력, EDA 툴, IP, 마스크, 검증 비용이 큽니다. |
| 긴 개발 기간 | 설계, 검증, 물리설계, 제조, 패키징, 테스트에 시간이 걸립니다. |
| 수정 어려움 | tape-out 후 오류가 발견되면 재설계와 재제작이 필요할 수 있습니다. |
| 검증 부담 | 실리콘 제작 전 최대한 오류를 제거해야 합니다. |
| 공급망 의존 | 파운드리, 패키징, 테스트, IP 업체와 긴밀히 연결됩니다. |

## ASIC 종류

| 종류 | 설명 |
|------|------|
| Standard-cell ASIC | 표준 셀 라이브러리를 사용해 디지털 회로를 구성하는 일반적인 ASIC 방식입니다. |
| Full-custom ASIC | 트랜지스터 수준까지 직접 설계합니다. SRAM bitcell, analog block, 고성능 datapath 등에 사용됩니다. |
| Semi-custom ASIC | 표준 셀, memory compiler, hard IP 등을 조합합니다. 대부분의 디지털 SoC가 여기에 가깝습니다. |
| Mixed-signal ASIC | 디지털 회로와 아날로그 회로가 함께 있는 칩입니다. ADC, PLL, SerDes 등이 포함될 수 있습니다. |
| SoC | CPU, 메모리, 버스, 가속기, 주변장치를 하나의 칩에 통합한 시스템입니다. |
| Chiplet 기반 설계 | 여러 작은 die를 패키지에서 연결해 하나의 시스템처럼 구성합니다. |

## ASIC 설계의 핵심 재료

| 요소 | 설명 |
|------|------|
| RTL | 설계자가 작성한 디지털 하드웨어 동작 코드입니다. |
| PDK | Process Design Kit. 파운드리가 제공하는 공정 설계 정보입니다. |
| Standard Cell Library | NAND, NOR, DFF, mux 같은 기본 셀의 물리/타이밍/전력 모델입니다. |
| Memory Compiler | SRAM 같은 메모리 macro를 생성하는 도구/라이브러리입니다. |
| IP | CPU, PCIe, DDR, USB, Ethernet, NPU block 등 재사용 가능한 설계 블록입니다. |
| EDA Tool | 합성, 배치배선, 검증, STA, 전력 분석 등을 수행하는 설계 자동화 도구입니다. |
| Package | die를 외부와 연결하고 보호하는 패키징 구조입니다. |

## ASIC 설계 흐름 큰 그림

```text
제품 요구사항
  |
  v
아키텍처 설계
  |
  v
RTL 설계 + 기능 검증
  |
  v
논리 합성
  |
  v
DFT 삽입
  |
  v
물리 설계: floorplan, placement, CTS, routing
  |
  v
Signoff: STA, power, IR drop, EM, DRC, LVS
  |
  v
GDSII 생성
  |
  v
Tape-out
  |
  v
제조, 패키징, 테스트
```

## PPA란 무엇인가

ASIC 설계에서 가장 많이 듣는 단어 중 하나가 PPA입니다.

| 항목 | 의미 |
|------|------|
| Performance | 목표 클럭, 처리량, 지연시간 |
| Power | 동작 전력, 누설 전력, 전력 피크 |
| Area | 실리콘 면적, die size, cell area |

좋은 ASIC 설계는 PPA 균형을 맞추는 일입니다. 예를 들어 성능을 올리려고 병렬 하드웨어를 늘리면 면적과 전력이 증가할 수 있습니다.

## ASIC이 FPGA보다 빠르고 효율적인 이유

FPGA는 재구성 가능성을 위해 LUT, switch matrix, programmable routing을 사용합니다. 이 유연성은 강력하지만 비용이 있습니다.

ASIC은 최종 회로가 고정되어 있으므로 다음이 가능합니다.

- 필요 없는 재구성 회로 제거
- 표준 셀을 직접 배치해 짧은 배선 구성
- 전력 게이팅, 클럭 게이팅, 멀티 전압 도메인 최적화
- 메모리 macro와 custom datapath 최적화
- 목표 공정에 맞춘 세밀한 타이밍 최적화

## ASIC 프로젝트에서 검증이 중요한 이유

FPGA는 bitstream을 다시 만들면 고칠 수 있습니다. ASIC은 제조 후 오류가 발견되면 비용과 일정 손실이 큽니다.

그래서 ASIC에서는 검증 비중이 매우 큽니다.

주요 검증 방법:

- RTL simulation
- UVM 기반 constrained-random verification
- Assertion-based verification
- Functional coverage
- Formal verification
- CDC/RDC check
- Gate-level simulation
- Emulation 또는 FPGA prototyping
- Post-silicon validation

## DFT와 테스트

ASIC은 제조 후 실제 칩이 정상인지 검사해야 합니다. 이를 위해 설계 단계에서 테스트 구조를 넣습니다.

| 용어 | 설명 |
|------|------|
| DFT | Design For Test. 테스트 가능성을 고려한 설계입니다. |
| Scan Chain | 플립플롭들을 체인처럼 연결해 내부 상태를 관찰/제어합니다. |
| ATPG | Automatic Test Pattern Generation. 결함을 찾아내는 테스트 패턴을 생성합니다. |
| BIST | Built-In Self Test. 메모리나 로직이 스스로 테스트할 수 있는 구조입니다. |
| ATE | Automatic Test Equipment. 생산된 칩을 검사하는 장비입니다. |

## ASIC과 FPGA 비교

| 관점 | FPGA | ASIC |
|------|------|------|
| 수정 가능성 | 높음 | 낮음 |
| 초기 비용 | 낮음 | 높음 |
| 대량 생산 단가 | 높음 | 낮아질 수 있음 |
| 전력 효율 | 보통 ASIC보다 낮음 | 매우 높게 최적화 가능 |
| 개발 리스크 | 상대적으로 낮음 | 높음 |
| 출시 속도 | 빠름 | 느림 |
| 적합 분야 | 프로토타입, 소량, 유연성 | 대량, 고성능, 저전력, 제품 차별화 |

## ASIC을 배울 때 꼭 알아야 할 용어

- RTL: Register Transfer Level
- Netlist: 합성 후 게이트 연결 정보
- PDK: 공정 설계 키트
- Liberty file: 표준 셀 타이밍/전력 모델
- LEF/DEF: 물리 배치와 셀 추상화 정보
- SDC: timing constraint
- STA: Static Timing Analysis
- DRC: Design Rule Check
- LVS: Layout Versus Schematic
- GDSII/OASIS: 제조에 넘기는 최종 레이아웃 데이터
- Tape-out: 제조용 최종 데이터를 파운드리에 전달하는 단계

