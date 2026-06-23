/* 문제: 009 Palindrome Number
 * 컴파일/실행: gcc solution.c -o sol.exe ; .\sol.exe
 */
#include <stdbool.h>
#include <stdio.h>

bool isPalindrome(int x) {
    /* TODO: 여기에 작성하세요 */
    (void)x;
    return false;
}

int main(void) {
    /* 직접 만든 입력 */
    printf("%s\n", isPalindrome(7447) ? "true" : "false");  /* 기대값: true */
    printf("%s\n", isPalindrome(-121) ? "true" : "false");  /* 기대값: false */
    return 0;
}
