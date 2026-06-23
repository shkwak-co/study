// 문제: 010 Regular Expression Matching
// 컴파일/실행: g++ solution.cpp -o sol.exe ; .\sol.exe
#include <iostream>
#include <string>
using namespace std;

class Solution {
public:
    bool isMatch(string s, string p) {
        // TODO: 여기에 작성하세요
        (void)s;
        (void)p;
        return false;
    }
};

int main() {
    Solution sol;
    // 직접 만든 입력
    cout << boolalpha << sol.isMatch("color", "c.*r") << endl;  // 기대값: true
    cout << boolalpha << sol.isMatch("code", "c*d") << endl;    // 기대값: false
    return 0;
}
