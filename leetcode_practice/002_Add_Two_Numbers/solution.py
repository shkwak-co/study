# 문제: 002 Add Two Numbers
# 실행: py solution.py
from typing import Optional


# 연결 리스트 노드 정의 (표준 형태)
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        # TODO: 여기에 작성하세요
        pass


# ---- 로컬 테스트용 헬퍼 (수정 불필요) ----
def build(arr):
    """파이썬 리스트 -> 연결 리스트"""
    dummy = ListNode()
    cur = dummy
    for x in arr:
        cur.next = ListNode(x)
        cur = cur.next
    return dummy.next


def to_list(node):
    """연결 리스트 -> 파이썬 리스트"""
    out = []
    while node:
        out.append(node.val)
        node = node.next
    return out


if __name__ == "__main__":
    sol = Solution()
    # 직접 만든 입력 (각 자리 숫자를 역순으로 저장)
    print(to_list(sol.addTwoNumbers(build([1, 2, 3]), build([4, 5]))))  # 321+54=375 -> [5, 7, 3]
    print(to_list(sol.addTwoNumbers(build([9, 9]), build([1]))))        # 99+1=100  -> [0, 0, 1]
