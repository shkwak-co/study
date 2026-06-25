module uart_tx #(
    parameter int CLK_HZ = 50_000_000,
    parameter int BAUD   = 115_200
) (
    input  logic       clk,
    input  logic       rst_n,
    input  logic       start,
    input  logic [7:0] data_i,
    output logic       tx,
    output logic       busy,
    output logic       done
);
    localparam int BAUD_DIV = CLK_HZ / BAUD;
    localparam int BAUD_W = (BAUD_DIV <= 1) ? 1 : $clog2(BAUD_DIV);

    typedef enum logic [1:0] {
        ST_IDLE,
        ST_START,
        ST_DATA,
        ST_STOP
    } state_t;

    state_t state;
    logic [BAUD_W-1:0] baud_count;
    logic [7:0] shift_reg;
    logic [2:0] bit_index;
    logic baud_tick;

    assign busy = (state != ST_IDLE);

    always_ff @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            baud_count <= '0;
            baud_tick  <= 1'b0;
        end else if (!busy) begin
            baud_count <= '0;
            baud_tick  <= 1'b0;
        end else if (baud_count == BAUD_DIV - 1) begin
            baud_count <= '0;
            baud_tick  <= 1'b1;
        end else begin
            baud_count <= baud_count + 1'b1;
            baud_tick  <= 1'b0;
        end
    end

    always_ff @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            state     <= ST_IDLE;
            shift_reg <= '0;
            bit_index <= '0;
            tx        <= 1'b1;
            done      <= 1'b0;
        end else begin
            done <= 1'b0;

            unique case (state)
                ST_IDLE: begin
                    tx <= 1'b1;
                    if (start) begin
                        shift_reg <= data_i;
                        bit_index <= '0;
                        tx        <= 1'b0;
                        state     <= ST_START;
                    end
                end

                ST_START: begin
                    if (baud_tick) begin
                        tx    <= shift_reg[0];
                        state <= ST_DATA;
                    end
                end

                ST_DATA: begin
                    if (baud_tick) begin
                        if (bit_index == 3'd7) begin
                            tx    <= 1'b1;
                            state <= ST_STOP;
                        end else begin
                            bit_index <= bit_index + 1'b1;
                            tx        <= shift_reg[bit_index + 1'b1];
                        end
                    end
                end

                ST_STOP: begin
                    if (baud_tick) begin
                        tx    <= 1'b1;
                        done  <= 1'b1;
                        state <= ST_IDLE;
                    end
                end

                default: begin
                    tx    <= 1'b1;
                    state <= ST_IDLE;
                end
            endcase
        end
    end
endmodule
