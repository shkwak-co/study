# 4. Median of Two Sorted Arrays

- **난이도**: Hard
- **주제**: 배열, 이분 탐색, 분할 정복
- **문제 전문(LeetCode)**: https://leetcode.com/problems/median-of-two-sorted-arrays/  ← 설명·예제·제약조건은 여기서 확인

> ⚖️ **저작권 안내**: LeetCode의 문제 설명·예제·제약 조건은 LeetCode의 저작물입니다.
> 이 저장소에는 원문이나 그 번역을 옮겨 싣지 않습니다. 문제 전문은 위 링크에서 보세요.
> 아래는 모두 **제가 직접 작성한 학습 노트**(개요·힌트·풀이)입니다.

## 한 줄 개요 (직접 작성)

**정렬된 두 배열**을 합쳤다고 했을 때 전체의 **중앙값(median)** 을 구하는 문제.
(중앙값: 정렬된 전체에서 가운데 값. 개수가 짝수면 가운데 두 값의 평균)

## 핵심 제약 메모 (직접 작성)

전체 실행 시간 복잡도가 **`O(log(m+n))`** 으로 요구되는 게 이 문제의 난이도 포인트.

## 함수 시그니처 (풀 형태)

| 언어 | 시그니처 |
|------|----------|
| Python | `def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float` |
| C++ | `double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2)` |
| C | `double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size)` |

## 힌트 (접근 방향, 직접 작성)

1. **쉬운 방법 (O(m+n))**: 두 배열을 병합 정렬하듯 합친 뒤 가운데 값을 고릅니다. 정답이긴 하나 요구 복잡도는 아닙니다.
2. **요구 복잡도 O(log(m+n))**: 더 짧은 배열에서 **분할 지점(partition)** 을 이분 탐색합니다.
   - 두 배열을 각각 왼쪽/오른쪽으로 나눠, 왼쪽 묶음의 모든 원소 ≤ 오른쪽 묶음의 모든 원소가 되도록 경계를 맞춥니다.
   - 경계 조건: `maxLeft1 <= minRight2` 그리고 `maxLeft2 <= minRight1`.
3. 먼저 1번(쉬운 방법)으로 정확성부터 확보한 뒤, 2번에 도전해도 좋습니다.
