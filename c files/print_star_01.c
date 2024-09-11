#include <stdio.h>

/**
 * Printing Stars
 * get number from user
 * if number ==2 :
 *      *
 *     ***
 *      *
 *      line    |      *            |     " "   
 *     1 ~ N    | 1, 3, 5, 7, 9 ... |  N-1, N-2, N-3, N-4, ..., 0
 *  N+1 ~ 2N-1  | ... 7, 5, 3, 1    |  1, 2, 3, ..., N-1
 */

int main(void)
{
    int N; // user input
    scanf("%d", &N);

    for(int i = 0; i< 2*N-1; i++)
    {
        if(i < N)          // Top 
        {
            for(int j = i; j< 2*N-1; j++)
            {   
                if(j < N-1) // space
                {       
                    printf(" ");
                }
                else        // stars
                {
                    for(int k = 0; k< 2*i +1; k++)
                        printf("*");
                    break;
                }
            }
        }
        else                // Bottom (N ~ 2N-1)
        {
            for(int j = i;j< 2*N-1; j++)
            {
                {   // space    
                    for(int j = i - N; j>=0; j--)
                        printf(" ");
                }
                {   // stars    
                    for(int k = 0; k < 2 * (2 * N - i - 1) - 1; k++)
                        printf("*");
                    break;
                }
            }
        }
        puts("");
    }

    return 0;
}