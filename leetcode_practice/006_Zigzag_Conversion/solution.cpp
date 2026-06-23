// 문제: 006 Zigzag Conversion
// 컴파일/실행: g++ solution.cpp -o sol.exe ; .\sol.exe
#include <iostream>
#include <string>
using namespace std;

class Solution {
public:
    string convert(string s, int numRows) {
        // TODO: 여기에 작성하세요
        return "";
    }
};

int main() {
    Solution sol;
    // 직접 만든 입력
    cout << sol.convert("ABCDEFGHIJ", 3) << endl;  // 기대값: AEIBDFHJCG
    cout << sol.convert("CODING", 1) << endl;      // 기대값: CODING
    return 0;
}
