// 문제: 001 Two Sum
// 컴파일/실행: g++ solution.cpp -o sol.exe ; .\sol.exe
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // TODO: 여기에 작성하세요
        return {};
    }
};

int main() {
    Solution sol;
    vector<int> nums = {8, 3, 5, 2};   // 직접 만든 테스트 입력
    vector<int> ans = sol.twoSum(nums, 7);   // 기대값: [2, 3]  (5+2=7)
    for (int x : ans) cout << x << " ";
    cout << endl;
    return 0;
}
