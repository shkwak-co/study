# 2. Add Two Numbers

- **난이도**: Medium
- **주제**: 연결 리스트, 수학
- **문제 전문(LeetCode)**: https://leetcode.com/problems/add-two-numbers/  ← 설명·예제·제약조건은 여기서 확인

> ⚖️ **저작권 안내**: LeetCode의 문제 설명·예제·제약 조건은 LeetCode의 저작물입니다.
> 이 저장소에는 원문이나 그 번역을 옮겨 싣지 않습니다. 문제 전문은 위 링크에서 보세요.
> 아래는 모두 **제가 직접 작성한 학습 노트**(개요·힌트·풀이)입니다.

## 한 줄 개요 (직접 작성)

각 자리 숫자가 **역순**으로 저장된 두 연결 리스트(= 정수)를 더해, **같은 형식의 연결 리스트**로 반환하는 문제.

## 함수 시그니처 (풀 형태)

| 언어 | 시그니처 |
|------|----------|
| Python | `def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]` |
| C++ | `ListNode* addTwoNumbers(ListNode* l1, ListNode* l2)` |
| C | `struct ListNode* addTwoNumbers(struct ListNode* l1, struct ListNode* l2)` |

> 템플릿에 `ListNode` 정의와, 배열↔리스트 변환/출력 헬퍼가 이미 들어 있습니다.

## 힌트 (접근 방향, 직접 작성)

1. 초등학교 덧셈처럼 **자릿수를 맞춰 더하면서 올림(carry)** 을 다음 자리로 넘깁니다.
2. 두 리스트를 동시에 순회하다가 한쪽이 끝나면 0 으로 취급하세요.
3. 마지막에 carry 가 남아 있으면(예: 5+5=10) 노드를 하나 더 추가해야 합니다.
4. **더미(dummy) 헤드 노드**를 쓰면 결과 리스트를 만들기 편합니다.
