/*
출처 : https://www.geeksforgeeks.org/print-lower-triangle-with-alternate-and/
도형 출력
*/

#include "stdio.h"

// odd  : * 
// even : #

int main(void)
{
    int input_num;

    printf("type number : ");
    scanf("%d", &input_num);

    for(int i = 1 ; i<= input_num; i++)
    {
        for(int j = 1; j <= i; j++)
        {
            if(j % 2 == 1)
                printf("*");
            else if(j % 2 == 0)
                printf("#");
        }
        puts("");
    }
    return 0;
}