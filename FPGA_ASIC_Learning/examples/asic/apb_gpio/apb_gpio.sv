module apb_gpio #(
    parameter int GPIO_W = 8
) (
    input  logic              pclk,
    input  logic              preset_n,
    input  logic              psel,
    input  logic              penable,
    input  logic              pwrite,
    input  logic [7:0]        paddr,
    input  logic [31:0]       pwdata,
    output logic [31:0]       prdata,
    output logic              pready,
    output logic              pslverr,
    input  logic [GPIO_W-1:0] gpio_i,
    output logic [GPIO_W-1:0] gpio_o,
    output logic [GPIO_W-1:0] gpio_oe,
    output logic              intr
);
    localparam logic [3:0] ADDR_DATA       = 4'h0;
    localparam logic [3:0] ADDR_DIR        = 4'h1;
    localparam logic [3:0] ADDR_IRQ_EN     = 4'h2;
    localparam logic [3:0] ADDR_IRQ_STATUS = 4'h3;

    logic [GPIO_W-1:0] data_reg;
    logic [GPIO_W-1:0] dir_reg;
    logic [GPIO_W-1:0] irq_en_reg;
    logic [GPIO_W-1:0] irq_status_reg;
    logic [GPIO_W-1:0] gpio_i_d;
    logic [GPIO_W-1:0] rising_edge;
    logic              apb_access;
    logic              apb_write;
    logic              invalid_addr;
    logic [3:0]        word_addr;

    assign word_addr   = paddr[5:2];
    assign apb_access  = psel && penable;
    assign apb_write   = apb_access && pwrite;
    assign pready      = 1'b1;
    assign gpio_o      = data_reg;
    assign gpio_oe     = dir_reg;
    assign rising_edge = gpio_i & ~gpio_i_d;
    assign intr        = |irq_status_reg;

    always_comb begin
        invalid_addr = 1'b0;
        prdata       = 32'h0000_0000;

        unique case (word_addr)
            ADDR_DATA:       prdata[GPIO_W-1:0] = data_reg;
            ADDR_DIR:        prdata[GPIO_W-1:0] = dir_reg;
            ADDR_IRQ_EN:     prdata[GPIO_W-1:0] = irq_en_reg;
            ADDR_IRQ_STATUS: prdata[GPIO_W-1:0] = irq_status_reg;
            default: begin
                invalid_addr = 1'b1;
                prdata       = 32'hDEAD_BEEF;
            end
        endcase
    end

    assign pslverr = apb_access && invalid_addr;

    always_ff @(posedge pclk or negedge preset_n) begin
        if (!preset_n) begin
            data_reg       <= '0;
            dir_reg        <= '0;
            irq_en_reg     <= '0;
            irq_status_reg <= '0;
            gpio_i_d       <= '0;
        end else begin
            gpio_i_d       <= gpio_i;
            irq_status_reg <= irq_status_reg | (rising_edge & irq_en_reg);

            if (apb_write && !invalid_addr) begin
                unique case (word_addr)
                    ADDR_DATA: begin
                        data_reg <= pwdata[GPIO_W-1:0];
                    end

                    ADDR_DIR: begin
                        dir_reg <= pwdata[GPIO_W-1:0];
                    end

                    ADDR_IRQ_EN: begin
                        irq_en_reg <= pwdata[GPIO_W-1:0];
                    end

                    ADDR_IRQ_STATUS: begin
                        irq_status_reg <= (irq_status_reg | (rising_edge & irq_en_reg))
                                          & ~pwdata[GPIO_W-1:0];
                    end

                    default: begin
                    end
                endcase
            end
        end
    end
endmodule
