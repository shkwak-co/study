#include <bits/stdc++.h>
using namespace std;
 
// Function to print the pattern
void printPattern(int n)
{
    // Initializing 2D array of size N
    vector<vector<int> > arr(n);
 
    int num = 1;
 
    // First Traversal top to bottom
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i; j++) {
            arr[i].push_back(num++);
        }
    }
 
    // Second Traversal bottom to top
    for (int i = n - 1; i >= 0; i--) {
        for (int j = 0; j < n - i; j++) {
            arr[i].push_back(num++);
        }
    }
 
    for (int i = 0; i < n; i++) {
        for (int ch = 0; ch < (i * 2);
 
             // Space is printed before each
             // row in a increasing order
             ch++) {
            cout << ' ';
        }
        for (int j = 0; j < arr[i].size(); j++) {
            cout << arr[i][j];
 
            // * is printed after the
            // last element in a row
            if (j != arr[i].size() - 1) {
                cout << '*';
            }
        }
        cout << endl;
    }
}
 
// Driver Code
int main()
{
    int N = 4;
 
    // Function call
    printPattern(N);
    return 0;
}