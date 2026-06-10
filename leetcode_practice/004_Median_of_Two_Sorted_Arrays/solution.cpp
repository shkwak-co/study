// 문제: 004 Median of Two Sorted Arrays
// 컴파일/실행: g++ solution.cpp -o sol.exe ; .\sol.exe
#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        // TODO: 여기에 작성하세요
        return 0.0;
    }
};

int main() {
    Solution sol;
    vector<int> a1 = {1, 4, 7}, b1 = {2, 3};   // 직접 만든 입력
    cout << sol.findMedianSortedArrays(a1, b1) << endl;  // 기대값: 3
    vector<int> a2 = {10, 20}, b2 = {15, 25};
    cout << sol.findMedianSortedArrays(a2, b2) << endl;  // 기대값: 17.5
    return 0;
}
