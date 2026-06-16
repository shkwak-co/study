# 문제: 003 Longest Substring Without Repeating Characters
# 실행: py solution.py


class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # TODO: 여기에 작성하세요
        # output = 0
        # # temp = 0
        # for i in range(len(s)):
        #     seen = set()
        #     count = 0
        #     for j in range(i, len(s)):
        #         if s[j] in seen:
        #             break
        #         seen.add(s[j])
        #         count += 1
        #         # temp = count
        #     if output <= count:
        #         output = count

        # return output

        # ASCII 128자를 배열로 관리 — dict 해시 연산 없이 O(1) 접근
        char_index = [-1] * 128
        output = 0
        left = 0

        for right, c in enumerate(s):
            idx = ord(c)
            if char_index[idx] >= left:
                left = char_index[idx] + 1
            char_index[idx] = right
            if right - left + 1 > output:
                output = right - left + 1

        return output

        # output = 0
        # window = {}
        # begin = 0

        # for end, current_char in enumerate(s):
        #     if current_char in window and window[current_char] >= begin:
        #         begin = window[current_char] + 1
        #     window[current_char] = end
        #     output = max(output, end - begin + 1)
        # return output


if __name__ == "__main__":
    sol = Solution()
    # 직접 만든 입력
    print(sol.lengthOfLongestSubstring("abba"))   # 기대값: 2  ("ab" 또는 "ba")
    print(sol.lengthOfLongestSubstring("dvdf"))   # 기대값: 3  ("vdf")
    print(sol.lengthOfLongestSubstring("abcde"))  # 기대값: 5  (전부 다른 문자)
    print(sol.lengthOfLongestSubstring(""))       # 기대값: 0
