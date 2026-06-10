/* 문제: 003 Longest Substring Without Repeating Characters
 * 컴파일/실행: gcc solution.c -o sol.exe ; .\sol.exe
 */
#include <stdio.h>
#include <string.h>

int lengthOfLongestSubstring(char* s) {
    // TODO: 여기에 작성하세요
    // 힌트: 아스키 256칸 배열로 "문자 -> 마지막 인덱스" 를 관리할 수 있습니다.
    return 0;
}

int main(void) {
    /* 직접 만든 입력 */
    printf("%d\n", lengthOfLongestSubstring("abba"));   /* 기대값: 2 */
    printf("%d\n", lengthOfLongestSubstring("dvdf"));   /* 기대값: 3 */
    printf("%d\n", lengthOfLongestSubstring("abcde"));  /* 기대값: 5 */
    return 0;
}
