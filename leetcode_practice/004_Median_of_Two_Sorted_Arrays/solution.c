/* 문제: 004 Median of Two Sorted Arrays
 * 컴파일/실행: gcc solution.c -o sol.exe ; .\sol.exe
 */
#include <stdio.h>

double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size) {
    // TODO: 여기에 작성하세요
    return 0.0;
}

int main(void) {
    int a1[] = {1, 4, 7}, b1[] = {2, 3};   /* 직접 만든 입력 */
    printf("%.5f\n", findMedianSortedArrays(a1, 3, b1, 2));   /* 기대값: 3.00000 */
    int a2[] = {10, 20}, b2[] = {15, 25};
    printf("%.5f\n", findMedianSortedArrays(a2, 2, b2, 2));   /* 기대값: 17.50000 */
    return 0;
}
