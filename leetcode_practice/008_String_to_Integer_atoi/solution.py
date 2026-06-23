# 문제: 008 String to Integer (atoi)
# 실행: py solution.py


class Solution:
    def myAtoi(self, s: str) -> int:
        # TODO: 여기에 작성하세요
        return 0


if __name__ == "__main__":
    sol = Solution()
    # 직접 만든 입력
    print(sol.myAtoi("   -2048xyz"))  # 기대값: -2048
    print(sol.myAtoi("words 42"))     # 기대값: 0
