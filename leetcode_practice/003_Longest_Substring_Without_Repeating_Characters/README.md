# 3. Longest Substring Without Repeating Characters

- **난이도**: Medium
- **주제**: 문자열, 슬라이딩 윈도우, 해시
- **문제 전문(LeetCode)**: https://leetcode.com/problems/longest-substring-without-repeating-characters/  ← 설명·예제·제약조건은 여기서 확인

> ⚖️ **저작권 안내**: LeetCode의 문제 설명·예제·제약 조건은 LeetCode의 저작물입니다.
> 이 저장소에는 원문이나 그 번역을 옮겨 싣지 않습니다. 문제 전문은 위 링크에서 보세요.
> 아래는 모두 **제가 직접 작성한 학습 노트**(개요·힌트·풀이)입니다.

## 한 줄 개요 (직접 작성)

문자열에서 **중복 문자가 없는 가장 긴 연속 부분 문자열(substring)의 길이**를 구하는 문제.
(substring = 연속된 구간. 부분 수열 subsequence 과 다름)

## 입력 규모 메모 (복잡도 판단용)

문자열이 길어질 수 있어(수만 자) **O(n)** 슬라이딩 윈도우를 목표로 한다.

## 함수 시그니처 (풀 형태)

| 언어 | 시그니처 |
|------|----------|
| Python | `def lengthOfLongestSubstring(self, s: str) -> int` |
| C++ | `int lengthOfLongestSubstring(string s)` |
| C | `int lengthOfLongestSubstring(char* s)` |

## 힌트 (접근 방향, 직접 작성)

1. **슬라이딩 윈도우**: 두 포인터 `left`, `right` 로 구간 `[left, right]` 을 유지합니다.
2. `right` 를 한 칸씩 넓히면서, 새로 들어온 문자가 윈도우 안에 이미 있으면 `left` 를 그 문자 다음 위치로 당겨 중복을 없앱니다.
3. **해시맵/배열**에 "문자 → 마지막으로 본 인덱스" 를 저장하면 `left` 를 한 번에 점프시킬 수 있어 O(n) 입니다.
