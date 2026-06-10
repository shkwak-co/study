// 문제: 003 Longest Substring Without Repeating Characters
// 컴파일/실행: g++ solution.cpp -o sol.exe ; .\sol.exe
#include <iostream>
#include <string>
#include <unordered_map>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // TODO: 여기에 작성하세요
        return 0;
    }
};

int main() {
    Solution sol;
    // 직접 만든 입력
    cout << sol.lengthOfLongestSubstring("abba") << endl;   // 기대값: 2
    cout << sol.lengthOfLongestSubstring("dvdf") << endl;   // 기대값: 3
    cout << sol.lengthOfLongestSubstring("abcde") << endl;  // 기대값: 5
    return 0;
}
