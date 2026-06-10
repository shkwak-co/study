/* 문제: 001 Two Sum
 * 컴파일/실행: gcc solution.c -o sol.exe ; .\sol.exe
 */
#include <stdio.h>
#include <stdlib.h>

/* 반환 배열은 malloc 으로 할당하고, 길이는 *returnSize 에 담으세요. */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // TODO: 여기에 작성하세요
    *returnSize = 2;
    int* output = malloc(sizeof(int)*returnSize);

    for(int i = 0; i < numsSize-1; i++)
    {
        for(int j = i+1; j<numsSize; j++)
        {
            if(nums[i] + nums[j] == target)
            {
                output[0] = i;
                output[1] = j;
                return output;
            }
        }
    }
    return NULL;
}

int main(void) {
    int nums[] = {8, 3, 5, 2};   /* 직접 만든 테스트 입력 */
    int returnSize = 0;
    int* ans = twoSum(nums, 4, 7, &returnSize);   /* 기대값: [2, 3]  (5+2=7) */
    for (int i = 0; i < returnSize; i++) printf("%d ", ans[i]);
    printf("\n");
    free(ans);  /* malloc 한 메모리는 해제 */
    return 0;
}
