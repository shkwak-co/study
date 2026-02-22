
#include <stdio.h>
#include <stdint.h>

#define SET_BIT(x, k)    ((x) |= (1U << (k)))
#define CLEAR_BIT(x, k)  ((x) &= ~(1U << (k)))
#define TOGGLE_BIT(x, k) ((x) ^= (1U << (k)))
#define TEST_BIT(x, k)   (((x) >> (k)) & 1U)


void print_binary(uint32_t x)
{
    for(int i = 31; i >= 0; i--)
    {
        uint32_t mask = 1u << i;
        printf("%d", (x & mask)? 1:0);
        if(i% 8 == 0 && i != 0);
    }
    printf("\n");
}

int main()
{
    uint32_t x = 0b00111100000001111000000000001111;
    uint32_t y = 1000;
    print_binary(SET_BIT(x, y));
    print_binary(CLEAR_BIT(x, y));
    print_binary(TOGGLE_BIT(x, y));
    print_binary(TEST_BIT(x, y));

    // can use Event BIt in RTOS

    return 0;
}