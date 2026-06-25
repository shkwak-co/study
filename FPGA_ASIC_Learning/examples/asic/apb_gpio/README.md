# ASIC Example: APB GPIO Register Block

`apb_gpio.sv`는 ASIC/SoC에서 매우 흔한 memory-mapped register block 예제입니다.

CPU나 firmware는 APB bus를 통해 register를 읽고 쓰며, RTL block은 그 register 값을 이용해 GPIO 출력과 interrupt를 제어합니다.

## 무엇을 배우는가

- APB peripheral 구조
- memory-mapped register
- write-one-to-clear interrupt status
- input edge detect
- firmware와 RTL이 만나는 경계

## Register Map

| Offset | 이름 | 접근 | 설명 |
|--------|------|------|------|
| `0x00` | DATA | RW | GPIO output data |
| `0x04` | DIR | RW | GPIO output enable |
| `0x08` | IRQ_EN | RW | GPIO rising-edge interrupt enable |
| `0x0C` | IRQ_STATUS | RW1C | interrupt status, 1을 쓰면 clear |

## 구조

```text
APB Bus
  |
  v
Register Decode
  |
  +--> DATA register ----> gpio_o
  +--> DIR register -----> gpio_oe
  +--> IRQ_EN
  +--> IRQ_STATUS <----- rising edge detect from gpio_i
```

## ASIC 관점 포인트

- register map은 firmware와 hardware의 계약입니다.
- 실제 제품에서는 register spec에서 RTL, C header, 문서를 자동 생성하기도 합니다.
- interrupt status는 race condition이 생기기 쉬워 clear 정책을 명확히 해야 합니다.
- APB protocol assertion과 register test가 검증에 포함되어야 합니다.
