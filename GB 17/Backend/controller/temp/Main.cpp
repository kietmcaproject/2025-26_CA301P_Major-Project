#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;  // read number of elements
    int sum = 0;
    for (int i = 0; i < n; i++) {
        int num;
        cin >> num;   // read each element
        sum += num;   // add to sum
    }
    cout << sum << endl; // output the result
    return 0;
}
