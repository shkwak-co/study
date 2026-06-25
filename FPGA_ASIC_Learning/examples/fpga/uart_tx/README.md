# FPGA Example: UART Transmitter

`uart_tx.sv`는 병렬 8비트 데이터를 UART 직렬 신호로 내보내는 예제입니다.

## 무엇을 배우는가

- baud rate generator
- FSM으로 통신 순서 제어
- start bit, data bit, stop bit
- `busy`, `done` 같은 제어 신호
- board pin으로 나가는 직렬 출력

## UART 프레임

이 예제는 일반적인 8-N-1 UART 형식을 사용합니다.

```text
idle  start   data bits LSB first          stop   idle
  1      0     d0 d1 d2 d3 d4 d5 d6 d7       1      1
```

## 인터페이스

| 신호 | 방향 | 의미 |
|------|------|------|
| `clk` | input | 시스템 클럭 |
| `rst_n` | input | active-low reset |
| `start` | input | 1 cycle pulse로 전송 시작 |
| `data_i` | input | 전송할 8비트 데이터 |
| `tx` | output | UART TX pin |
| `busy` | output | 전송 중이면 1 |
| `done` | output | 전송 완료 시 1 cycle pulse |

## 실습 팁

- `CLK_HZ`와 `BAUD`를 보드/터미널 설정에 맞추세요.
- USB-UART adapter나 보드 내장 UART로 PC terminal에서 출력 문자를 확인할 수 있습니다.
- 실제 제품에서는 baud 오차, parity, FIFO, flow control 등을 추가로 고려합니다.
