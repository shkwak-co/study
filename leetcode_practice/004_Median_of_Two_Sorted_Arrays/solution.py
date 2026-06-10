# 문제: 004 Median of Two Sorted Arrays
# 실행: py solution.py
from typing import List


class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        # TODO: 여기에 작성하세요
        pass


if __name__ == "__main__":
    sol = Solution()
    # 직접 만든 입력 (각 배열은 정렬된 상태)
    print(sol.findMedianSortedArrays([1, 4, 7], [2, 3]))    # 기대값: 3.0   (합치면 1,2,3,4,7)
    print(sol.findMedianSortedArrays([10, 20], [15, 25]))   # 기대값: 17.5  ((15+20)/2)
