// 문제: 009 Palindrome Number
// 컴파일/실행: g++ solution.cpp -o sol.exe ; .\sol.exe
#include <iostream>
using namespace std;

class Solution {
public:
    bool isPalindrome(int x) {
        // TODO: 여기에 작성하세요
        (void)x;
        return false;
    }
};

int main() {
    Solution sol;
    // 직접 만든 입력
    cout << boolalpha << sol.isPalindrome(7447) << endl;  // 기대값: true
    cout << boolalpha << sol.isPalindrome(-121) << endl;  // 기대값: false
    return 0;
}
