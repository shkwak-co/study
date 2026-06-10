# 1. Two Sum

- **난이도**: Easy
- **주제**: 배열, 해시맵
- **문제 전문(LeetCode)**: https://leetcode.com/problems/two-sum/  ← 설명·예제·제약조건은 여기서 확인

> ⚖️ **저작권 안내**: LeetCode의 문제 설명·예제·제약 조건은 LeetCode의 저작물입니다.
> 이 저장소에는 원문이나 그 번역을 옮겨 싣지 않습니다. 문제 전문은 위 링크에서 보세요.
> 아래는 모두 **제가 직접 작성한 학습 노트**(개요·힌트·풀이)입니다.

## 한 줄 개요 (직접 작성)

정수 배열에서 **더해서 목표값이 되는 서로 다른 두 원소의 인덱스**를 찾는 문제.

## 입력 규모 메모 (복잡도 판단용)

배열이 꽤 커질 수 있어(수만 개 수준) **O(n)** 해법을 목표로 한다. (정확한 제약은 위 링크 참고)

## 함수 시그니처 (풀 형태)

| 언어 | 시그니처 |
|------|----------|
| Python | `def twoSum(self, nums: List[int], target: int) -> List[int]` |
| C++ | `vector<int> twoSum(vector<int>& nums, int target)` |
| C | `int* twoSum(int* nums, int numsSize, int target, int* returnSize)` |

> C 에서는 반환 배열을 `malloc` 으로 할당하고, 길이를 `*returnSize` 에 담아야 합니다.

## 힌트 (접근 방향, 직접 작성)

1. 가장 단순한 방법: 이중 반복문으로 모든 쌍을 확인 → O(n²)
2. 더 빠르게: **해시맵**에 "이미 본 값 → 인덱스" 를 저장하면서, 현재 값에 대해 `target - 현재값` 이 맵에 있는지 한 번만 확인 → O(n)
