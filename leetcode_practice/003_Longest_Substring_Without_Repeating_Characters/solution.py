# 문제: 003 Longest Substring Without Repeating Characters
# 실행: py solution.py


class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # TODO: 여기에 작성하세요
        pass


if __name__ == "__main__":
    sol = Solution()
    # 직접 만든 입력
    print(sol.lengthOfLongestSubstring("abba"))   # 기대값: 2  ("ab" 또는 "ba")
    print(sol.lengthOfLongestSubstring("dvdf"))   # 기대값: 3  ("vdf")
    print(sol.lengthOfLongestSubstring("abcde"))  # 기대값: 5  (전부 다른 문자)
    print(sol.lengthOfLongestSubstring(""))       # 기대값: 0
