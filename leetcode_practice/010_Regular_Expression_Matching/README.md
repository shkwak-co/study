# 10. Regular Expression Matching

- **난이도**: Hard
- **주제**: 문자열, 동적 계획법(DP), 재귀
- **문제 전문(LeetCode)**: https://leetcode.com/problems/regular-expression-matching/  ← 설명·예제·제약조건은 여기서 확인

> ⚖️ **저작권 안내**: LeetCode의 문제 설명·예제·제약 조건은 LeetCode의 저작물입니다.
> 이 저장소에는 원문이나 그 번역을 옮겨 싣지 않습니다. 문제 전문은 위 링크에서 보세요.
> 아래는 모두 **제가 직접 작성한 학습 노트**(개요·힌트·풀이)입니다.

## 한 줄 개요 (직접 작성)

문자열 전체가 `.` 과 `*` 를 포함한 패턴과 완전히 일치하는지 판단하는 문제.

## 함수 시그니처 (풀 형태)

| 언어 | 시그니처 |
|------|----------|
| Python | `def isMatch(self, s: str, p: str) -> bool` |
| C++ | `bool isMatch(string s, string p)` |
| C | `bool isMatch(char* s, char* p)` |

## 힌트 (접근 방향, 직접 작성)

1. 부분 일치가 아니라 문자열 전체가 패턴 전체와 맞아야 합니다.
2. `.` 은 임의의 문자 하나, `*` 는 바로 앞 요소의 0회 이상 반복으로 생각합니다.
3. `dp[i][j]` 를 `s` 의 앞 `i`글자와 `p` 의 앞 `j`글자가 일치하는지로 두면 체계적으로 풀 수 있습니다.
