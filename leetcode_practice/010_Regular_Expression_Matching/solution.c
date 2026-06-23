/* 문제: 010 Regular Expression Matching
 * 컴파일/실행: gcc solution.c -o sol.exe ; .\sol.exe
 */
#include <stdbool.h>
#include <stdio.h>

bool isMatch(char* s, char* p) {
    /* TODO: 여기에 작성하세요 */
    (void)s;
    (void)p;
    return false;
}

int main(void) {
    /* 직접 만든 입력 */
    printf("%s\n", isMatch("color", "c.*r") ? "true" : "false");  /* 기대값: true */
    printf("%s\n", isMatch("code", "c*d") ? "true" : "false");    /* 기대값: false */
    return 0;
}
