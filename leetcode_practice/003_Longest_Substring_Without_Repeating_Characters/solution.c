/* 문제: 003 Longest Substring Without Repeating Characters
 * 컴파일/실행: gcc solution.c -o sol.exe ; .\sol.exe
 */
#include <stdio.h>
#include <string.h>

int lengthOfLongestSubstring(char* s) {
    // TODO: 여기에 작성하세요
    // 힌트: 아스키 256칸 배열로 "문자 -> 마지막 인덱스" 를 관리할 수 있습니다.
    // int output = 0;
    // for(int i = 0; i < (int)(strlen(s)-1); i++)
    // {
    //     int count = 0;
    //     for(int j = i+1; j<(int)(strlen(s)); j++)
    //     {
    //         if(s[i] == s[j])
    //             break;
    //         count++;
    //     }
    //     if(output <= count)
    //         output = count;
    // }
    // return output;

    int char_index[256];
    for(int k = 0; k < 256; k++) char_index[k] = -1;

    int output = 0;
    int left = 0;

    for(int right = 0; s[right] != '\0'; right++)
    {
        unsigned char c = s[right];
        if(char_index[c] >= left)
            left = char_index[c] + 1;
        char_index[c] = right;
        if(right - left + 1 > output)
            output = right - left + 1;
    }
    return output;
}

int main(void) {
    /* 직접 만든 입력 */
    printf("%d\n", lengthOfLongestSubstring("abba"));   /* 기대값: 2 */
    printf("%d\n", lengthOfLongestSubstring("dvdf"));   /* 기대값: 3 */
    printf("%d\n", lengthOfLongestSubstring("abcde"));  /* 기대값: 5 */
    return 0;
}
