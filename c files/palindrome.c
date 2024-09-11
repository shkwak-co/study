/**
 * chekcing if it's palindrome.
 * ex) level (o)
 *     tenet (o)
 *     korea (x)
 *     USA   (x)
 * 
 * backjoon #10988
 * https://www.acmicpc.net/problem/10988
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/*
    return 1 = (O)
    return 0 = (X)
*/
int Is_Palindrome(char *word ,int str_len)
{
    if(str_len % 2 == 1)
    {
        for(int i = 0; i< str_len/2 +1; i++)
        {
            if(word[i] != word[str_len-1-i])
                return 0;
            else
                continue;
        }
    }
    else
    {
        for(int i = 0; i< str_len/2; i++)
        {
            if(word[i] != word[str_len-1-i])
                return 0;
            else
                continue;
        }

    }
    return 1;
}

int main(void)
{
    char word[100];
    scanf("%s", word);
    int str_len = strlen(word);

    printf("%d", Is_Palindrome(word, str_len));
    
    return 0;
}

