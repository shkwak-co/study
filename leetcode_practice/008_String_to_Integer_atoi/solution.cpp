// 문제: 008 String to Integer (atoi)
// 컴파일/실행: g++ solution.cpp -o sol.exe ; .\sol.exe
#include <iostream>
#include <string>
using namespace std;

class Solution {
public:
    int myAtoi(string s) {
        // TODO: 여기에 작성하세요
        (void)s;
        return 0;
    }
};

int main() {
    Solution sol;
    // 직접 만든 입력
    cout << sol.myAtoi("   -2048xyz") << endl;  // 기대값: -2048
    cout << sol.myAtoi("words 42") << endl;     // 기대값: 0
    return 0;
}
