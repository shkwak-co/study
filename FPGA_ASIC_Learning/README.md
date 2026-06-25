# FPGA / ASIC Learning

이 폴더는 FPGA, ASIC, HDL, 설계 흐름, C/C++ 연계, 반도체 설계 산업 생태계를 한 번에 조망하기 위한 학습 노트입니다.

처음 읽는 순서는 아래를 추천합니다.

| 순서 | 파일 | 핵심 내용 |
|------|------|-----------|
| 1 | [01_FPGA_Basics.md](./01_FPGA_Basics.md) | FPGA가 무엇인지, 내부 구조와 장단점 |
| 2 | [02_ASIC_Basics.md](./02_ASIC_Basics.md) | ASIC이 무엇인지, 왜 비싸고 강력한지 |
| 3 | [03_HDL_Verilog_VHDL_SystemVerilog.md](./03_HDL_Verilog_VHDL_SystemVerilog.md) | Verilog, VHDL, SystemVerilog, HDL의 개념 |
| 4 | [04_Design_Flow_FPGA_ASIC.md](./04_Design_Flow_FPGA_ASIC.md) | FPGA와 ASIC을 실제로 설계하는 절차 |
| 5 | [05_C_and_Hardware_Design.md](./05_C_and_Hardware_Design.md) | C/C++를 하드웨어 설계와 연결하는 방법 |
| 6 | [06_Industry_Ecosystem.md](./06_Industry_Ecosystem.md) | 직무, 회사 유형, 툴, IP, 파운드리, 생태계 |

## 큰 그림

```text
아이디어 / 제품 요구사항
        |
        v
알고리즘 / 아키텍처 설계
        |
        v
RTL 작성: Verilog, VHDL, SystemVerilog
        |
        v
검증: 시뮬레이션, assertion, coverage, testbench
        |
        +-------------------------------+
        |                               |
        v                               v
FPGA 구현                         ASIC 구현
합성, 배치배선, bitstream          합성, DFT, 물리설계, signoff, tape-out
        |                               |
        v                               v
보드에서 동작                     실리콘 칩 제작, 패키징, 테스트
```

## FPGA와 ASIC의 핵심 차이

| 구분 | FPGA | ASIC |
|------|------|------|
| 의미 | 제조 후에도 회로를 다시 구성할 수 있는 칩 | 특정 목적에 맞춰 직접 제작한 주문형 칩 |
| 개발 속도 | 빠름 | 느림 |
| 초기 비용 | 낮음 | 매우 높음 |
| 개당 단가 | 높음 | 대량 생산 시 낮음 |
| 성능/전력 | ASIC보다 불리한 경우가 많음 | 최적화 가능, 보통 더 빠르고 전력 효율이 좋음 |
| 수정 가능성 | bitstream 재다운로드로 수정 가능 | 제작 후 수정이 매우 어렵거나 불가능 |
| 주 용도 | 프로토타입, 통신, 가속기, 소량 제품 | 스마트폰 SoC, AI 가속기, 네트워크 칩, 자동차 반도체 |

## 가장 중요한 관점

HDL은 C/Python 같은 일반 소프트웨어 언어와 다릅니다. HDL은 "명령을 순서대로 실행하는 프로그램"이라기보다, **동시에 존재하는 하드웨어 회로의 구조와 동작**을 기술합니다.

```text
소프트웨어 사고:
한 줄 실행 -> 다음 줄 실행 -> 다음 줄 실행

하드웨어 사고:
레지스터, 조합논리, 메모리, 버스, 클럭이 동시에 동작
```

이 차이를 이해하는 것이 FPGA/ASIC 학습의 첫 번째 관문입니다.

## 학습 로드맵

1. 디지털 논리 기본
   - 비트, 게이트, 조합논리, 순차논리
   - 플립플롭, 레지스터, 카운터, FSM
2. HDL 기본
   - Verilog 또는 SystemVerilog로 작은 회로 작성
   - testbench로 시뮬레이션
3. FPGA 실습
   - LED blink, UART, PWM, SPI, FIFO, BRAM
   - constraints와 timing report 읽기
4. 검증 역량
   - self-checking testbench
   - assertion, coverage, random test
5. 시스템 설계
   - AXI, memory-mapped register, DMA
   - CPU와 하드웨어 accelerator 연결
6. ASIC 흐름 이해
   - synthesis, STA, DFT, floorplan, place and route
   - PPA와 signoff 개념

