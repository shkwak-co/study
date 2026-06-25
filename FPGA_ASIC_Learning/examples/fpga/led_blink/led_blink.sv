module led_blink #(
    parameter int CLK_HZ   = 50_000_000,
    parameter int BLINK_HZ = 1
) (
    input  logic clk,
    input  logic rst_n,
    output logic led
);
    localparam int TOGGLE_COUNT = CLK_HZ / (BLINK_HZ * 2);
    localparam int COUNT_W = (TOGGLE_COUNT <= 1) ? 1 : $clog2(TOGGLE_COUNT);

    logic [COUNT_W-1:0] count;

    always_ff @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            count <= '0;
            led   <= 1'b0;
        end else if (count == TOGGLE_COUNT - 1) begin
            count <= '0;
            led   <= ~led;
        end else begin
            count <= count + 1'b1;
        end
    end
endmodule
