// 문제: 005 Longest Palindromic Substring
// 컴파일/실행: g++ solution.cpp -o sol.exe ; .\sol.exe
#include <iostream>
#include <string>
using namespace std;

class Solution {
public:
    string longestPalindrome(string s) {
        // TODO: 여기에 작성하세요
        return "";
    }
};

int main() {
    Solution sol;
    // 직접 만든 입력
    cout << sol.longestPalindrome("abacd") << endl;    // 기대값: aba
    cout << sol.longestPalindrome("racecar") << endl;  // 기대값: racecar
    return 0;
}
