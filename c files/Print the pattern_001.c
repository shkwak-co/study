#include <stdio.h>

int main(void)
{
    int number; 
    printf("input number : ");
    scanf("%d", &number);
    int val = 1;
    int down_count;
    int up_count = 0;

    down_count = number;
    for(int i = 1; i<= number; i++)
    {
        for(int k = 0; k < up_count; k++)
            printf("   ");
        for(int j = 1 + up_count; j<= number; j++)
        {

            printf("%2d*", val++);
        }
        puts("");
        down_count--;
        up_count++;
    }
    // for(int i = 1; i< number*(number+1)+1; i++)
    //     printf("%d ", arr[i]);
    return 0;
}