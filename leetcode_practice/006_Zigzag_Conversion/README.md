# 6. Zigzag Conversion

- **난이도**: Medium
- **주제**: 문자열, 시뮬레이션
- **문제 전문(LeetCode)**: https://leetcode.com/problems/zigzag-conversion/  ← 설명·예제·제약조건은 여기서 확인

> ⚖️ **저작권 안내**: LeetCode의 문제 설명·예제·제약 조건은 LeetCode의 저작물입니다.
> 이 저장소에는 원문이나 그 번역을 옮겨 싣지 않습니다. 문제 전문은 위 링크에서 보세요.
> 아래는 모두 **제가 직접 작성한 학습 노트**(개요·힌트·풀이)입니다.

## 한 줄 개요 (직접 작성)

문자열을 지정된 행 수의 지그재그 형태로 배치한 뒤, 행별로 이어 붙인 결과를 구하는 문제.

## 함수 시그니처 (풀 형태)

| 언어 | 시그니처 |
|------|----------|
| Python | `def convert(self, s: str, numRows: int) -> str` |
| C++ | `string convert(string s, int numRows)` |
| C | `char* convert(char* s, int numRows)` |

## 힌트 (접근 방향, 직접 작성)

1. `numRows == 1` 이거나 문자열 길이가 행 수보다 작으면 원래 문자열이 그대로 답입니다.
2. 각 행을 담을 버퍼를 만들고, 현재 행과 이동 방향을 갱신하며 문자를 하나씩 넣으면 됩니다.
3. 한 사이클 길이는 `2 * numRows - 2` 입니다. 이 규칙으로 행별 인덱스를 직접 계산하는 방법도 있습니다.
