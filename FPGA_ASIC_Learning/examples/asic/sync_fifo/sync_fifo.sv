module sync_fifo #(
    parameter int WIDTH = 32,
    parameter int DEPTH = 16
) (
    input  logic             clk,
    input  logic             rst_n,
    input  logic             wr_valid,
    output logic             wr_ready,
    input  logic [WIDTH-1:0] wr_data,
    output logic             rd_valid,
    input  logic             rd_ready,
    output logic [WIDTH-1:0] rd_data
);
    localparam int ADDR_W  = (DEPTH <= 2) ? 1 : $clog2(DEPTH);
    localparam int COUNT_W = $clog2(DEPTH + 1);

    logic [WIDTH-1:0] mem [DEPTH];
    logic [ADDR_W-1:0] wr_ptr;
    logic [ADDR_W-1:0] rd_ptr;
    logic [COUNT_W-1:0] count;
    logic write_fire;
    logic read_fire;

    assign wr_ready   = (count < DEPTH);
    assign rd_valid   = (count != 0);
    assign rd_data    = mem[rd_ptr];
    assign write_fire = wr_valid && wr_ready;
    assign read_fire  = rd_valid && rd_ready;

    function automatic logic [ADDR_W-1:0] ptr_next(input logic [ADDR_W-1:0] ptr);
        if (ptr == DEPTH - 1)
            ptr_next = '0;
        else
            ptr_next = ptr + 1'b1;
    endfunction

    always_ff @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            wr_ptr <= '0;
            rd_ptr <= '0;
            count  <= '0;
        end else begin
            if (write_fire) begin
                mem[wr_ptr] <= wr_data;
                wr_ptr      <= ptr_next(wr_ptr);
            end

            if (read_fire) begin
                rd_ptr <= ptr_next(rd_ptr);
            end

            unique case ({write_fire, read_fire})
                2'b10: count <= count + 1'b1;
                2'b01: count <= count - 1'b1;
                default: count <= count;
            endcase
        end
    end
endmodule
