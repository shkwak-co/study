/* 문제: 004 Median of Two Sorted Arrays
 * 컴파일/실행: gcc solution.c -o sol.exe ; .\sol.exe
 */
#include <stdio.h>

double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size) {
    int m = nums1Size;
    int n = nums2Size;

    if(m > n)
        return findMedianSortedArrays(nums2, n, nums1, m);

    int low = 0, high = m;

    while(low <= high) {
        int cut1 = (low + high) / 2;
        int cut2 = (m + n + 1) / 2 - cut1;

        int l1 = (cut1 == 0) ? -1000001 : nums1[cut1 - 1];
        int l2 = (cut2 == 0) ? -1000001 : nums2[cut2 - 1];

        int r1 = (cut1 == m) ? 1000001 : nums1[cut1];
        int r2 = (cut2 == n) ? 1000001 : nums2[cut2];

        if(l1 <= r2 && l2 <= r1) {
            if((m + n) % 2 == 0) {
                int leftMax = (l1 > l2) ? l1 : l2;
                int rightMin = (r1 < r2) ? r1 : r2;
                return (leftMax + rightMin) / 2.0;
            } else {
                return (l1 > l2) ? l1 : l2;
            }
        }
        else if(l1 > r2) {
            high = cut1 - 1;
        }
        else {
            low = cut1 + 1;
        }
    }

    return 0.0;
}


int main(void) {
    int a1[] = {1, 4, 7}, b1[] = {2, 3};   /* 직접 만든 입력 */
    printf("%.5f\n", findMedianSortedArrays(a1, 3, b1, 2));   /* 기대값: 3.00000 */
    int a2[] = {10, 20}, b2[] = {15, 25};
    printf("%.5f\n", findMedianSortedArrays(a2, 2, b2, 2));   /* 기대값: 17.50000 */
    return 0;
}
