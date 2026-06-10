// 문제: 002 Add Two Numbers
// 컴파일/실행: g++ solution.cpp -o sol.exe ; .\sol.exe
#include <iostream>
using namespace std;

// 연결 리스트 노드 정의 (표준 형태)
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        // TODO: 여기에 작성하세요
        return nullptr;
    }
};

// ---- 로컬 테스트용 헬퍼 (수정 불필요) ----
ListNode* build(initializer_list<int> arr) {
    ListNode dummy;
    ListNode* cur = &dummy;
    for (int x : arr) { cur->next = new ListNode(x); cur = cur->next; }
    return dummy.next;
}
void print(ListNode* node) {
    while (node) { cout << node->val << " "; node = node->next; }
    cout << endl;
}

int main() {
    Solution sol;
    // 직접 만든 입력 (각 자리 숫자를 역순으로 저장)
    print(sol.addTwoNumbers(build({1, 2, 3}), build({4, 5})));  // 321+54=375 -> 5 7 3
    print(sol.addTwoNumbers(build({9, 9}), build({1})));        // 99+1=100  -> 0 0 1
    return 0;
}
