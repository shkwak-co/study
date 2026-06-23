/* 문제: 008 String to Integer (atoi)
 * 컴파일/실행: gcc solution.c -o sol.exe ; .\sol.exe
 */
#include <stdio.h>

int myAtoi(char* s) {
    /* TODO: 여기에 작성하세요 */
    (void)s;
    return 0;
}

int main(void) {
    /* 직접 만든 입력 */
    printf("%d\n", myAtoi("   -2048xyz"));  /* 기대값: -2048 */
    printf("%d\n", myAtoi("words 42"));     /* 기대값: 0 */
    return 0;
}
