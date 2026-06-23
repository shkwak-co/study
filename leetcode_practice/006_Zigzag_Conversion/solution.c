/* 문제: 006 Zigzag Conversion
 * 컴파일/실행: gcc solution.c -o sol.exe ; .\sol.exe
 */
#include <stdio.h>

char* convert(char* s, int numRows) {
    (void)numRows;
    /* TODO: 여기에 작성하세요 */
    return s;
}

int main(void) {
    /* 직접 만든 입력 */
    printf("%s\n", convert("ABCDEFGHIJ", 3));  /* 기대값: AEIBDFHJCG */
    printf("%s\n", convert("CODING", 1));      /* 기대값: CODING */
    return 0;
}
