# 5. Longest Palindromic Substring

- **난이도**: Medium
- **주제**: 문자열, 동적 계획법(DP), 투 포인터
- **문제 전문(LeetCode)**: https://leetcode.com/problems/longest-palindromic-substring/  ← 설명·예제·제약조건은 여기서 확인

> ⚖️ **저작권 안내**: LeetCode의 문제 설명·예제·제약 조건은 LeetCode의 저작물입니다.
> 이 저장소에는 원문이나 그 번역을 옮겨 싣지 않습니다. 문제 전문은 위 링크에서 보세요.
> 아래는 모두 **제가 직접 작성한 학습 노트**(개요·힌트·풀이)입니다.

## 한 줄 개요 (직접 작성)

문자열에서 **가장 긴 팰린드롬(palindrome) 연속 부분 문자열**을 찾아 반환하는 문제.
(팰린드롬 = 앞에서 읽으나 뒤에서 읽으나 같은 문자열, 예: aba, abba)

## 함수 시그니처 (풀 형태)

| 언어 | 시그니처 |
|------|----------|
| Python | `def longestPalindrome(self, s: str) -> str` |
| C++ | `string longestPalindrome(string s)` |
| C | `char* longestPalindrome(char* s)` |

## 힌트 (접근 방향, 직접 작성)

1. **중심 확장(Expand Around Center)**: 각 위치를 팰린드롬의 중심으로 보고 양옆으로 확장합니다.
   - 중심은 두 종류: 글자 1개(홀수 길이 "aba")와 글자 사이(짝수 길이 "abba").
   - 총 `2n-1` 개의 중심에서 확장 → O(n²) 시간, O(1) 공간.
2. **DP**: `dp[i][j]` = "s[i..j] 가 팰린드롬인가" 를 채워나가는 방법도 있습니다. O(n²) 시간/공간.
3. C 에서는 반환 문자열을 `malloc` 으로 할당하고 끝에 `'\0'` 을 넣어야 합니다.
