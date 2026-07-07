# 08. Verilog / SystemVerilog Deep Dive

이 문서는 Verilog와 SystemVerilog를 단순 문법이 아니라 **실제 FPGA/ASIC RTL 설계 언어**로 학습하기 위한 심화 노트입니다.

목표는 다음 세 가지입니다.

1. 코드를 보면 어떤 회로가 합성될지 예측한다.
2. 시뮬레이션과 합성 결과가 다르게 나오는 위험을 줄인다.
3. RTL, testbench, assertion, lint, timing까지 연결해서 이해한다.

## 먼저 가져야 할 관점

Verilog/SystemVerilog는 프로그램을 실행하는 언어가 아니라 회로를 기술하는 언어입니다.

```text
소프트웨어:
위에서 아래로 명령 실행

RTL:
조합논리는 입력이 바뀌면 즉시 출력이 결정됨
순차논리는 클럭 edge에서 상태가 갱신됨
여러 always block과 assign은 동시에 존재함
```

따라서 HDL 학습의 핵심 질문은 "이 코드가 어떤 순서로 실행되는가?"가 아니라 **"이 코드가 어떤 mux, adder, comparator, register, memory로 합성되는가?"**입니다.

## Verilog와 SystemVerilog의 관계

SystemVerilog는 Verilog를 확장한 언어입니다. 현대 RTL에서는 Verilog 문법만으로도 설계할 수 있지만, 새 설계라면 SystemVerilog 스타일을 권장합니다.

| 영역 | Verilog | SystemVerilog 권장 스타일 |
|------|---------|--------------------------|
| 신호 타입 | `wire`, `reg` | `logic` 중심, 필요할 때 `wire` |
| 조합논리 | `always @(*)` | `always_comb` |
| 순차논리 | `always @(posedge clk)` | `always_ff @(posedge clk)` |
| latch | 일반 `always` | `always_latch` |
| 상수 | `parameter` | `parameter`, `localparam` |
| 상태 | `parameter` state encoding | `typedef enum logic` |
| 구조화 | 넓은 bus와 개별 신호 | `struct`, `interface`, `package` |
| 검증 | 제한적 testbench | assertion, class, coverage, randomization |

실무적으로는 **RTL은 합성 가능한 SystemVerilog subset**으로 쓰고, **검증 코드는 SystemVerilog 전체 기능**을 더 넓게 씁니다.

## 합성 가능한 코드와 비합성 코드

RTL 작성자는 항상 코드가 합성 가능한지 구분해야 합니다.

| 코드/기능 | RTL 합성 가능 여부 | 설명 |
|-----------|------------------|------|
| `assign` | 가능 | 연속 할당, 조합논리 |
| `always_comb` | 가능 | 조합논리 |
| `always_ff` | 가능 | flip-flop/register |
| `case`, `if`, `for` | 가능 | 조건부 mux, 반복 구조 생성 |
| `initial` | 일반 ASIC RTL에서는 제한적 | FPGA memory init 등 일부 예외 |
| `#10` delay | 불가 | 시뮬레이션 시간 지연 |
| `$display`, `$finish` | 불가 | testbench 전용 |
| 파일 입출력 | 불가 | testbench 전용 |
| class/randomize | 불가 | 검증 전용 |

`for` 문은 소프트웨어처럼 반복 실행되는 루프라기보다, 합성 시 반복 회로를 펼치는 구조로 이해하는 것이 좋습니다.

```systemverilog
always_comb begin
    parity = 1'b0;
    for (int i = 0; i < WIDTH; i++) begin
        parity = parity ^ data[i];
    end
end
```

위 코드는 runtime loop가 아니라 XOR tree 또는 XOR chain으로 합성됩니다.

## Net, Variable, Logic

Verilog의 `wire`와 `reg` 이름은 초보자에게 자주 혼란을 줍니다.

| 타입 | 의미 | 대표 사용 |
|------|------|-----------|
| `wire` | net, 물리적 연결선에 가까움 | `assign` 출력, module 간 연결 |
| `reg` | procedural block에서 값을 저장할 수 있는 변수 | Verilog `always` 출력 |
| `logic` | SystemVerilog 4-state variable | 대부분의 RTL 신호 |

중요한 점은 `reg`라고 해서 항상 flip-flop이 되는 것은 아니라는 점입니다.

```verilog
always @(*) begin
    y = a & b;
end
```

Verilog에서 `y`가 `reg` 타입이어도 위 코드는 조합논리입니다. flip-flop이 되는 조건은 타입 이름이 아니라 **클럭 edge를 감지하는 always block 안에서 값이 갱신되는가**입니다.

SystemVerilog에서는 보통 다음처럼 씁니다.

```systemverilog
logic       valid_q;
logic [7:0] data_q;
logic [7:0] data_d;
```

관례적으로 `_q`는 register output, `_d`는 next-state 또는 next-data를 뜻합니다.

## 2-state와 4-state

SystemVerilog에는 2-state 타입과 4-state 타입이 있습니다.

| 타입 | 값 | 사용 |
|------|----|------|
| `bit` | 0, 1 | testbench에서 빠른 모델, 명확한 2-state 데이터 |
| `logic` | 0, 1, X, Z | RTL 신호, unknown/high-impedance 추적 |

RTL에서는 `logic`을 많이 씁니다. X를 숨기지 않고 드러내야 reset 누락, 미초기화, 다중 driver 같은 문제를 빨리 찾을 수 있기 때문입니다.

```systemverilog
logic [3:0] a;
logic [3:0] b;
logic [4:0] sum;

assign sum = a + b;
```

시뮬레이션에서 `a`에 X가 있으면 `sum`에도 X가 전파될 수 있습니다. 이 현상은 귀찮아 보이지만, 실제로는 설계 결함을 드러내는 중요한 신호입니다.

## Bit Width와 Signed

Verilog/SystemVerilog에서 width와 signed 처리는 매우 중요합니다. 작은 실수가 overflow, sign extension, 비교 오류로 이어집니다.

```systemverilog
logic [7:0] a;
logic [7:0] b;
logic [8:0] sum;

assign sum = {1'b0, a} + {1'b0, b};
```

carry를 보존하려면 피연산자를 먼저 확장하는 습관이 좋습니다.

signed 연산은 모든 피연산자의 signedness와 width에 영향을 받습니다.

```systemverilog
logic signed [7:0] s8;
logic signed [8:0] s9;

assign s9 = $signed(s8);
```

실무 규칙:

- bus width를 암묵적으로 믿지 말고 명시적으로 확장한다.
- signed/unsigned가 섞이면 cast를 명확히 한다.
- literal은 가능하면 width를 붙인다. 예: `8'd0`, `1'b1`
- parameterized RTL에서는 `$clog2`, localparam width를 조심해서 계산한다.

## Packed와 Unpacked Array

SystemVerilog 배열은 packed와 unpacked를 구분합니다.

```systemverilog
logic [7:0] byte_data;        // packed: 8비트 벡터
logic [7:0] mem [0:255];      // unpacked: 256개 entry, 각 entry는 8비트
logic [3:0][7:0] word_bytes;  // packed: 4개 byte가 붙은 32비트 구조
```

대략적인 감각은 다음과 같습니다.

| 형태 | 의미 | 하드웨어 관점 |
|------|------|---------------|
| `logic [7:0] a` | 8비트 vector | bus |
| `logic [7:0] mem [0:15]` | 16 x 8 배열 | register file 또는 memory |
| `logic [3:0][7:0] p` | 32비트 packed data | slicing 쉬운 bus |

메모리를 의도한다면 unpacked array를 사용하고, tool이 block RAM 또는 SRAM macro로 추론할 수 있는 coding style을 맞춰야 합니다.

## Module, Parameter, Localparam

module은 RTL의 기본 단위입니다.

```systemverilog
module adder #(
    parameter int WIDTH = 8
) (
    input  logic [WIDTH-1:0] a,
    input  logic [WIDTH-1:0] b,
    output logic [WIDTH:0]   sum
);
    assign sum = {1'b0, a} + {1'b0, b};
endmodule
```

`parameter`는 외부에서 override 가능한 설정값입니다. `localparam`은 module 내부에서 고정해야 하는 파생 상수에 씁니다.

```systemverilog
module fifo #(
    parameter int DATA_W = 32,
    parameter int DEPTH  = 16
) (
    input logic clk
);
    localparam int PTR_W = $clog2(DEPTH);
endmodule
```

주의할 점:

- `DEPTH = 1` 같은 edge case에서 `$clog2(DEPTH)`가 0이 될 수 있습니다.
- parameter override가 가능한 값과 내부 구현 세부값을 분리해야 합니다.
- public parameter에는 의미 있는 기본값과 제약을 문서화합니다.

## 조합논리: always_comb

조합논리는 입력이 바뀌면 출력이 즉시 결정되는 회로입니다.

```systemverilog
always_comb begin
    y = 1'b0;

    if (sel)
        y = a;
    else
        y = b;
end
```

좋은 습관은 block 시작에서 기본값을 먼저 주는 것입니다. 모든 경로에서 값이 할당되지 않으면 latch가 추론될 수 있습니다.

나쁜 예:

```systemverilog
always_comb begin
    if (en)
        y = a;
end
```

`en == 0`일 때 `y`가 이전 값을 유지해야 하므로 latch가 필요합니다. 의도한 latch가 아니라면 버그입니다.

좋은 예:

```systemverilog
always_comb begin
    y = 1'b0;
    if (en)
        y = a;
end
```

## 순차논리: always_ff

순차논리는 clock edge에서 상태를 저장합니다.

```systemverilog
always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n)
        q <= '0;
    else if (en)
        q <= d;
end
```

합성 결과는 enable이 있는 flip-flop입니다.

```text
d ---> mux ---> DFF ---> q
       ^          ^
       |          |
      en        clk/reset
```

순차논리 규칙:

- clocked block에서는 non-blocking assignment `<=`를 사용한다.
- 하나의 register는 하나의 `always_ff` block에서만 drive한다.
- reset polarity와 synchronous/asynchronous reset 정책을 project 전체에서 통일한다.
- clock을 data logic으로 만들지 않는다. clock enable을 사용한다.

## Blocking과 Non-blocking

가장 실무적인 기본 규칙은 단순합니다.

| 상황 | 연산자 |
|------|--------|
| 조합논리 `always_comb` | `=` |
| 순차논리 `always_ff` | `<=` |
| testbench 절차 흐름 | 상황에 따라 `=`, `<=` |

예를 들어 shift register는 non-blocking으로 써야 자연스럽습니다.

```systemverilog
always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
        q1 <= 1'b0;
        q2 <= 1'b0;
    end else begin
        q1 <= din;
        q2 <= q1;
    end
end
```

동일한 clock edge에서 `q2`는 이전 cycle의 `q1` 값을 받습니다. 이것이 실제 flip-flop 동작과 맞습니다.

## FSM 작성 패턴

FSM은 control path의 핵심입니다. SystemVerilog에서는 enum을 쓰면 가독성과 lint 품질이 좋아집니다.

```systemverilog
typedef enum logic [1:0] {
    ST_IDLE,
    ST_LOAD,
    ST_RUN,
    ST_DONE
} state_e;

state_e state_q, state_d;

always_comb begin
    state_d = state_q;
    done    = 1'b0;

    unique case (state_q)
        ST_IDLE: begin
            if (start)
                state_d = ST_LOAD;
        end

        ST_LOAD: begin
            state_d = ST_RUN;
        end

        ST_RUN: begin
            if (last)
                state_d = ST_DONE;
        end

        ST_DONE: begin
            done    = 1'b1;
            state_d = ST_IDLE;
        end

        default: begin
            state_d = ST_IDLE;
        end
    endcase
end

always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n)
        state_q <= ST_IDLE;
    else
        state_q <= state_d;
end
```

FSM 실무 체크:

- state register와 next-state logic을 분리한다.
- 출력이 Moore인지 Mealy인지 의식한다.
- default state 복구 경로를 둔다.
- `unique case`를 쓰면 중복/누락 case를 도구가 더 잘 잡을 수 있다.

## Ready/Valid Handshake

FPGA/ASIC 블록 간 연결에서 ready/valid는 매우 자주 사용됩니다.

```text
source ---- valid,data ----> sink
source <------- ready ------ sink

transfer occurs when valid && ready
```

기본 규칙:

- `valid`는 data가 유효하다는 source의 선언입니다.
- `ready`는 sink가 받을 수 있다는 선언입니다.
- 전송은 `valid && ready`인 cycle에만 일어납니다.
- source는 ready가 내려가도 valid와 data를 안정적으로 유지해야 합니다.

```systemverilog
assign in_ready  = !out_valid_q || out_ready;
assign out_valid = out_valid_q;
assign out_data  = out_data_q;

always_ff @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
        out_valid_q <= 1'b0;
        out_data_q  <= '0;
    end else if (in_ready) begin
        out_valid_q <= in_valid;
        out_data_q  <= in_data;
    end
end
```

이 패턴은 한 단계 pipeline register의 기본 형태입니다.

## Reset 전략

reset은 단순히 초기값을 넣는 기능이 아니라 시스템 안정성과 검증 전략입니다.

| 방식 | 장점 | 주의점 |
|------|------|--------|
| asynchronous reset | clock이 없어도 reset 가능 | reset release timing, RDC 주의 |
| synchronous reset | STA와 동기 검증이 상대적으로 단순 | clock이 동작해야 reset 적용 |
| no reset data path | 면적/전력 절감 가능 | valid/control reset으로 안전성 확보 필요 |

일반적인 정책:

- control register와 valid bit는 reset한다.
- 큰 data path register는 reset하지 않고 valid로 보호할 수 있다.
- reset deassertion은 clock domain별로 안전하게 동기화한다.
- reset polarity 이름을 명확히 한다. 예: `rst_n`은 active-low reset.

## Clock Domain Crossing

CDC는 서로 다른 clock domain 사이에 신호가 이동하는 문제입니다. RTL이 시뮬레이션에서 잘 보여도 실제 실리콘/FPGA에서 간헐적으로 실패할 수 있습니다.

단일 bit control 신호는 2-flop synchronizer를 사용합니다.

```systemverilog
logic sync1_q;
logic sync2_q;

always_ff @(posedge dst_clk or negedge dst_rst_n) begin
    if (!dst_rst_n) begin
        sync1_q <= 1'b0;
        sync2_q <= 1'b0;
    end else begin
        sync1_q <= async_in;
        sync2_q <= sync1_q;
    end
end

assign sync_out = sync2_q;
```

주의:

- multi-bit bus를 bit별 synchronizer로 넘기면 서로 다른 cycle 값이 섞일 수 있습니다.
- pulse는 destination clock에서 놓칠 수 있으므로 toggle, handshake, async FIFO 등을 고려합니다.
- data stream은 asynchronous FIFO가 일반적인 해결책입니다.
- CDC 구조는 lint/CDC tool로 별도 검증해야 합니다.

## Memory 추론

FPGA에서는 RTL 배열이 LUTRAM, BRAM, UltraRAM 등으로 추론될 수 있고, ASIC에서는 작은 register array 또는 memory macro wrapper로 이어질 수 있습니다.

단순 synchronous read memory 예:

```systemverilog
module simple_ram #(
    parameter int DATA_W = 32,
    parameter int ADDR_W = 8
) (
    input  logic              clk,
    input  logic              we,
    input  logic [ADDR_W-1:0] addr,
    input  logic [DATA_W-1:0] wdata,
    output logic [DATA_W-1:0] rdata
);
    logic [DATA_W-1:0] mem [0:(1 << ADDR_W)-1];

    always_ff @(posedge clk) begin
        if (we)
            mem[addr] <= wdata;
        rdata <= mem[addr];
    end
endmodule
```

실무에서는 다음을 확인해야 합니다.

- read latency가 0 cycle인지 1 cycle인지
- read-during-write 동작이 old data, new data, don't care 중 무엇인지
- FPGA vendor template와 ASIC memory macro port가 요구하는 coding style
- byte enable, dual-port, ECC, initialization 요구사항

## Interface와 Package

SystemVerilog의 `package`는 공통 typedef, parameter, function을 모아두는 데 유용합니다.

```systemverilog
package bus_pkg;
    typedef enum logic [1:0] {
        RESP_OKAY,
        RESP_ERROR
    } resp_e;
endpackage
```

`interface`는 여러 신호를 하나의 bundle로 묶고 방향을 `modport`로 관리할 수 있습니다.

```systemverilog
interface stream_if #(
    parameter int DATA_W = 32
) (
    input logic clk,
    input logic rst_n
);
    logic              valid;
    logic              ready;
    logic [DATA_W-1:0] data;

    modport source (
        output valid,
        output data,
        input  ready
    );

    modport sink (
        input  valid,
        input  data,
        output ready
    );
endinterface
```

장점은 port list가 짧아지고 연결 실수가 줄어드는 것입니다. 단점은 일부 합성/연동 flow에서 제한이 있을 수 있으므로 프로젝트 coding guideline을 확인해야 합니다.

## Assertion 기본

Assertion은 "설계가 반드시 지켜야 하는 규칙"을 코드로 표현합니다.

```systemverilog
property p_valid_stable_until_ready;
    @(posedge clk) disable iff (!rst_n)
    valid && !ready |=> valid;
endproperty

assert property (p_valid_stable_until_ready);
```

간단한 즉시 assertion도 유용합니다.

```systemverilog
always_comb begin
    assert (!(wr_en && full));
    assert (!(rd_en && empty));
end
```

RTL에 넣을 assertion은 합성에서 제외하거나 assertion 지원 flow에 맞춰 관리합니다.

검증하면 좋은 항목:

- FIFO overflow/underflow 금지
- one-hot state encoding 유지
- ready/valid protocol 준수
- request 이후 일정 시간 안에 response 발생
- reset 후 control signal 초기값

## Testbench 기본 구조

좋은 testbench는 waveform을 눈으로 보는 데서 끝나지 않고 자동으로 pass/fail을 판단합니다.

```systemverilog
module tb_counter;
    logic       clk;
    logic       rst_n;
    logic [7:0] count;

    counter_sv dut (
        .clk   (clk),
        .rst_n (rst_n),
        .count (count)
    );

    initial clk = 1'b0;
    always #5 clk = ~clk;

    initial begin
        rst_n = 1'b0;
        repeat (3) @(posedge clk);
        rst_n = 1'b1;

        repeat (10) @(posedge clk);

        if (count !== 8'd10) begin
            $error("count mismatch: expected 10, got %0d", count);
        end

        $finish;
    end
endmodule
```

좋은 testbench의 요소:

- clock/reset 생성
- DUT instance
- stimulus driver
- monitor
- scoreboard 또는 expected model
- assertion
- timeout
- pass/fail 자동 판정

## Lint에서 자주 잡는 문제

Lint는 문법 검사가 아니라 RTL 품질 검사에 가깝습니다.

| 경고 | 의미 |
|------|------|
| width mismatch | bus 폭이 맞지 않음 |
| implicit net | 선언하지 않은 신호가 암묵적으로 생성됨 |
| unused signal | 연결되지 않거나 사용되지 않는 신호 |
| latch inferred | 조합논리에서 값 유지가 필요함 |
| multiple drivers | 하나의 신호를 여러 곳에서 drive |
| incomplete case | case item 누락 가능 |
| blocking in sequential | clocked block에서 blocking 사용 |
| combinational loop | 조합논리가 자기 자신을 순환 참조 |

파일 상단에 다음을 두는 습관이 좋습니다.

```systemverilog
`default_nettype none
```

이 설정은 오타로 인해 암묵적 wire가 생기는 문제를 막습니다. 단, 파일 끝이나 project policy에 따라 원복이 필요할 수 있습니다.

## Timing 관점

RTL은 기능만 맞으면 끝이 아닙니다. 실제 하드웨어는 clock period 안에 조합논리 지연을 통과해야 합니다.

```text
launch FF -> combinational logic -> capture FF
             must fit within clock period
```

타이밍을 나쁘게 만드는 대표 원인:

- 너무 긴 adder/comparator chain
- 큰 mux
- deep priority logic
- fanout이 큰 enable/reset/control
- pipeline이 없는 긴 datapath
- memory read latency 무시

개선 방법:

- pipeline stage 추가
- balanced tree 구조 사용
- priority logic을 줄이고 one-hot/decoded control 사용
- register duplication 또는 floorplan 고려
- clock constraint와 false/multicycle path를 정확히 작성

## RTL Coding Style Checklist

새 RTL을 작성할 때 다음을 확인합니다.

- 모든 port와 internal signal에 명확한 width가 있는가
- `logic`/`wire` 사용이 일관적인가
- 조합논리는 `always_comb`, 순차논리는 `always_ff`인가
- 조합논리에서 모든 출력에 기본값이 있는가
- 순차논리에서 `<=`를 사용하는가
- reset 대상과 reset하지 않는 대상이 의도적인가
- state는 enum으로 표현했는가
- parameter와 localparam을 구분했는가
- CDC/RDC가 있는가
- ready/valid 규칙을 지키는가
- assertion 또는 self-checking testbench가 있는가
- lint warning을 설명 없이 방치하지 않았는가

## 추천 학습 순서

1. 조합논리
   - mux, decoder, encoder, priority encoder
   - `assign`과 `always_comb`
2. 순차논리
   - DFF, enable register, counter, shift register
   - reset과 non-blocking assignment
3. FSM
   - enum state
   - Moore/Mealy output
   - default와 illegal state 처리
4. Datapath
   - adder, multiplier, accumulator
   - signed/unsigned, width extension
5. Interface
   - ready/valid
   - FIFO
   - memory-mapped register
6. Verification
   - self-checking testbench
   - assertion
   - coverage 개념
7. Implementation awareness
   - synthesis
   - timing
   - CDC
   - FPGA resource 또는 ASIC cell/memory 관점

## 실습 과제

아래 과제는 작은 회로에서 실무 패턴으로 확장되도록 구성했습니다.

| 단계 | 과제 | 핵심 개념 |
|------|------|-----------|
| 1 | 2:1, 4:1 mux 작성 | 조합논리, case |
| 2 | parameterized counter | parameter, reset, enable |
| 3 | edge detector | 이전 상태 저장, pulse 생성 |
| 4 | debouncer | counter, sampling, noisy input |
| 5 | traffic light FSM | enum FSM, timer |
| 6 | ready/valid pipeline stage | backpressure |
| 7 | synchronous FIFO | pointer, full/empty |
| 8 | simple register file | memory array, read/write |
| 9 | UART transmitter | baud counter, FSM |
| 10 | assertion 추가 | protocol checking |

각 과제마다 waveform만 확인하지 말고 다음을 함께 적어보세요.

- 어떤 register가 생기는가
- 어떤 조합논리가 생기는가
- reset 후 상태는 무엇인가
- 한 cycle마다 어떤 값이 바뀌는가
- timing critical path가 될 만한 부분은 어디인가

## 자주 쓰는 용어

| 용어 | 의미 |
|------|------|
| RTL | Register Transfer Level, register 사이 데이터 이동을 표현하는 설계 수준 |
| DUT | Design Under Test, 검증 대상 설계 |
| TB | Testbench |
| FF | Flip-flop |
| CDC | Clock Domain Crossing |
| RDC | Reset Domain Crossing |
| STA | Static Timing Analysis |
| Lint | RTL 정적 품질 검사 |
| SVA | SystemVerilog Assertions |
| X-propagation | unknown 값이 회로에 전파되는 현상 |
| Backpressure | 뒤쪽 블록이 준비되지 않아 앞쪽 전송을 멈추는 것 |
| Latency | 입력 후 결과가 나오기까지 걸리는 cycle |
| Throughput | 단위 시간 또는 cycle당 처리량 |

## 최종 조언

Verilog/SystemVerilog를 잘한다는 것은 문법을 많이 외운다는 뜻이 아닙니다. 좋은 RTL 엔지니어는 다음을 동시에 생각합니다.

- 기능적으로 맞는가
- 합성 가능한가
- 어떤 회로가 만들어지는가
- reset과 예외 상황에서 안전한가
- timing을 만족할 수 있는 구조인가
- testbench와 assertion으로 실패를 자동으로 잡을 수 있는가
- FPGA/ASIC 구현 flow에서 문제가 될 coding style은 아닌가

처음에는 작은 회로를 많이 작성하고, 그 회로가 waveform과 block diagram에서 어떻게 보이는지 반복해서 연결해보는 것이 가장 빠릅니다.
