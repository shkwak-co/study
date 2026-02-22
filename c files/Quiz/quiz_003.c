#include <stdio.h>
#include <stdint.h>
//Endianness
int main()
{
    uint16_t v = 0x0102;
    unsigned char* b = (unsigned char*)&v;
    printf("0x%02x\n", b[0]);
    // LIttle Endian
    return 0;
}