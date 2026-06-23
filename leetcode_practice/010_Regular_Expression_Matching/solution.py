# 문제: 010 Regular Expression Matching
# 실행: py solution.py


class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        # TODO: 여기에 작성하세요
        return False


if __name__ == "__main__":
    sol = Solution()
    # 직접 만든 입력
    print(sol.isMatch("color", "c.*r"))  # 기대값: True
    print(sol.isMatch("code", "c*d"))    # 기대값: False
