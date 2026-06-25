# FPGA / ASIC Example Code

이 폴더는 FPGA와 ASIC에서 자주 만나는 작은 RTL 예시를 모았습니다.

예제 코드는 모두 SystemVerilog로 작성했습니다. FPGA와 ASIC 모두에서 널리 쓰이는 스타일이고, `always_ff`, `always_comb`, `logic`처럼 의도가 분명한 문법을 사용할 수 있기 때문입니다.

## 예제 목록

| 구분 | 예제 | 파일 | 핵심 개념 |
|------|------|------|-----------|
| FPGA | LED Blink | [fpga/led_blink/led_blink.sv](./fpga/led_blink/led_blink.sv) | counter, clock divider, register output |
| FPGA | UART TX | [fpga/uart_tx/uart_tx.sv](./fpga/uart_tx/uart_tx.sv) | baud generator, FSM, serial output |
| ASIC | APB GPIO | [asic/apb_gpio/apb_gpio.sv](./asic/apb_gpio/apb_gpio.sv) | memory-mapped register, APB bus, interrupt |
| ASIC | Sync FIFO | [asic/sync_fifo/sync_fifo.sv](./asic/sync_fifo/sync_fifo.sv) | queue, valid/ready, pointer, occupancy counter |

## FPGA 예제와 ASIC 예제의 관점 차이

| 관점 | FPGA 예제 | ASIC 예제 |
|------|-----------|-----------|
| 목표 | 보드에서 바로 관찰 가능한 동작 | SoC 내부에 재사용 가능한 블록 |
| 외부 연결 | LED, UART pin, board clock | APB bus, register map, internal data path |
| 구현 자원 | LUT, FF, BRAM, DSP, FPGA routing | standard cell, SRAM macro, clock tree |
| 디버깅 | ILA/SignalTap, UART, LED | simulation, assertion, scan, silicon bring-up |
| 중요 포인트 | constraints, pin, clock, timing | spec, verification, reset, DFT, signoff |

## 읽는 순서

1. FPGA 입문자는 `led_blink`부터 보세요. 클럭 기반 회로의 가장 작은 실습입니다.
2. 그 다음 `uart_tx`를 보면 FSM과 baud timing을 이해할 수 있습니다.
3. ASIC/SoC 관점은 `apb_gpio`부터 보세요. CPU가 register를 통해 하드웨어를 제어하는 기본 구조입니다.
4. `sync_fifo`는 FPGA/ASIC 모두에서 많이 쓰는 재사용 블록입니다.

## 주의할 점

- 이 코드는 학습용 예제입니다. 실제 제품에는 lint, CDC/RDC, formal, assertion, coverage, STA, DFT 요구사항이 추가됩니다.
- FPGA에 올리려면 board pin constraints와 clock constraints가 필요합니다.
- ASIC에 넣으려면 coding guideline, reset strategy, scan/DFT, synthesis constraints, signoff flow를 함께 맞춰야 합니다.
- UART, APB 같은 프로토콜은 실제 제품에서 더 많은 corner case와 timing 조건을 검증해야 합니다.
