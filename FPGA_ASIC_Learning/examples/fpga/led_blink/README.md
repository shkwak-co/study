# FPGA Example: LED Blink

`led_blink.sv`는 FPGA 보드 입문에서 가장 먼저 만드는 예제입니다.

## 무엇을 배우는가

- 클럭에 맞춰 동작하는 순차논리
- counter를 이용한 clock divider
- register output
- reset 처리
- FPGA constraints에서 clock 주파수가 왜 중요한지

## 회로 구조

```text
clk
 |
 v
counter ---- terminal count? ---- toggle led register
                                |
                                v
                              led pin
```

## 합성 결과 관점

이 코드는 FPGA에서 대략 다음 자원으로 합성됩니다.

- counter: flip-flop 여러 개와 adder/comparator
- led: output register 1개
- reset: flip-flop reset pin 또는 reset mux 구조

## 실습 팁

- `CLK_HZ`는 실제 보드 클럭에 맞춰야 합니다.
- `BLINK_HZ`는 LED가 초당 몇 번 깜빡일지 정합니다.
- 실제 보드에서는 XDC/QSF 같은 constraints 파일에서 `clk`와 `led` 핀을 지정해야 합니다.
