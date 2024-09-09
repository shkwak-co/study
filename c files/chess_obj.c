#include <stdio.h>
/**
 * checking missing objects
 * https://www.acmicpc.net/problem/3003
 * 킹 1
 * 퀸 1
 * 룩 2
 * 비숍 2
 * 나이트 2
 * 폰 8
 */
int main(void)
{
    int K, Q, L, B, Kn, P;
    scanf("%d %d %d %d %d %d", &K, &Q, &L, &B, &Kn, &P);
    printf("%d %d %d %d %d %d", 1-K, 1-Q, 2-L, 2-B, 2-Kn, 8-P);   
    return 0;
}