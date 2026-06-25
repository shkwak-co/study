# ASIC Example: Synchronous FIFO

`sync_fifo.sv`는 하나의 클럭 도메인 안에서 데이터를 순서대로 저장하고 꺼내는 FIFO 예제입니다.

FIFO는 FPGA와 ASIC 모두에서 매우 자주 쓰입니다. 블록 사이의 처리 속도 차이를 흡수하고, valid/ready handshake를 안정적으로 연결하는 기본 building block입니다.

## 무엇을 배우는가

- valid/ready handshake
- read/write pointer
- occupancy counter
- full/empty 판단
- parameterized RTL

## 인터페이스

| 신호 | 방향 | 의미 |
|------|------|------|
| `wr_valid` | input | 쓰려는 데이터가 유효함 |
| `wr_ready` | output | FIFO가 데이터를 받을 수 있음 |
| `wr_data` | input | 쓰기 데이터 |
| `rd_valid` | output | 읽을 데이터가 유효함 |
| `rd_ready` | input | 뒤쪽 블록이 데이터를 받을 수 있음 |
| `rd_data` | output | 읽기 데이터 |

## 동작 규칙

```text
write_fire = wr_valid && wr_ready
read_fire  = rd_valid && rd_ready

write_fire가 1이면 wr_data를 FIFO에 저장
read_fire가 1이면 현재 rd_data를 소비하고 read pointer 증가
```

## ASIC 관점 포인트

- 작은 FIFO는 flip-flop array로 합성될 수 있습니다.
- 큰 FIFO는 SRAM macro나 memory compiler 기반 memory로 바꾸는 것이 일반적입니다.
- 다른 클럭 도메인을 연결하려면 이 예제가 아니라 asynchronous FIFO가 필요합니다.
- 실제 제품에서는 overflow/underflow assertion, reset 검증, backpressure 검증을 추가해야 합니다.
