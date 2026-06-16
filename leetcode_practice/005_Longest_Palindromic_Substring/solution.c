/* 문제: 005 Longest Palindromic Substring
 * 컴파일/실행: gcc solution.c -o sol.exe ; .\sol.exe
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char* longestPalindrome(char* s) {
    if (s == NULL) return NULL;

    int n = (int)strlen(s);
    int bestStart = 0;
    int bestLen = 0;

    for (int center = 0; center < n; center++) {
        int left = center;
        int right = center;

        while (left >= 0 && right < n && s[left] == s[right]) {
            left--;
            right++;
        }

        int len = right - left - 1;
        if (len > bestLen) {
            bestStart = left + 1;
            bestLen = len;
        }

        left = center;
        right = center + 1;

        while (left >= 0 && right < n && s[left] == s[right]) {
            left--;
            right++;
        }

        len = right - left - 1;
        if (len > bestLen) {
            bestStart = left + 1;
            bestLen = len;
        }
    }

    char* result = (char*)malloc((size_t)bestLen + 1);
    if (result == NULL) return NULL;

    memcpy(result, s + bestStart, (size_t)bestLen);
    result[bestLen] = '\0';
    return result;
}

int main(void) {
    /* 직접 만든 입력 */
    char* ans1 = longestPalindrome("abacd");
    char* ans2 = longestPalindrome("racecar");

    printf("%s\n", ans1);  /* 기대값: aba */
    printf("%s\n", ans2);  /* 기대값: racecar */

    free(ans1);
    free(ans2);
    return 0;
}
