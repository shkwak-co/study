/* 문제: 002 Add Two Numbers
 * 컴파일/실행: gcc solution.c -o sol.exe ; .\sol.exe
 */
#include <stdio.h>
#include <stdlib.h>

/* 연결 리스트 노드 정의 (표준 형태) */
struct ListNode {
    int val;
    struct ListNode *next;
};

struct ListNode* addTwoNumbers(struct ListNode* l1, struct ListNode* l2) {
    // TODO: 여기에 작성하세요 (새 노드는 malloc 으로 생성)
    return NULL;
}

/* ---- 로컬 테스트용 헬퍼 (수정 불필요) ---- */
struct ListNode* build(int* arr, int n) {
    struct ListNode dummy;
    struct ListNode* cur = &dummy;
    dummy.next = NULL;
    for (int i = 0; i < n; i++) {
        cur->next = (struct ListNode*)malloc(sizeof(struct ListNode));
        cur->next->val = arr[i];
        cur->next->next = NULL;
        cur = cur->next;
    }
    return dummy.next;
}
void print_list(struct ListNode* node) {
    while (node) { printf("%d ", node->val); node = node->next; }
    printf("\n");
}

int main(void) {
    int a[] = {1, 2, 3}, b[] = {4, 5};   /* 직접 만든 입력 (자리 역순) */
    print_list(addTwoNumbers(build(a, 3), build(b, 2)));  /* 321+54=375 -> 5 7 3 */
    return 0;
}
