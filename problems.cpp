#include <bits/stdc++.h>
using namespace std;


// Consider the following series:

// A := 1
// B := A*2 + 2
// C := B*2 + 3 and so on...
// Write a program that:

// given a large number, finds the shortest string of letters corresponding to it.

// A=1
// B= 2*A +2 => 4
// C= 2*(2+2) + 3; => 11
// D= 2*(2*(2+2) + 3) + 4 => 26


// arr=[1, 4, 11, 26,...]; // shortest
// arr[i] > 27 continue;
// arr[i] < 27 -> D (1) -> A 
// => DA ()


// 6 -> BAA


int main() {
    vector<long long> arr(26);

    long long a= 1;
    long long b=0;
    arr[0]=1;

    long long value= 1;

    for(int i=1;i<26;i++){
        b= 2*a+ (i+1) ;
        arr[i]=b;
        cout<<b<<" ";
        a= b;
    }
    // arr filled;
    string ans= "";

    for(int i=25;i>=0;i--) {
        if(arr[i] <= value) {
            long long times= value/arr[i];
            while(times--) {
                ans.push_back(i+'A');
            }
            long long rem= value%arr[i];
            value= rem;
        }
    }
    cout<<ans<<endl;
}



/*

// You are given a 2D grid representing a map where 0s denote water and 1s denote islands. An island is formed by connecting adjacent lands horizontally or vertically. Determine the total number of islands in the grid.
// grid = [
//     [1, 1, 0, 0, 0],
//     [1, 1, 0, 0, 0],
//     [0, 0, 1, 0, 0],
//     [0, 0, 0, 1, 1]
// ]
// Note:

// An island is considered to be connected horizontally and vertically, but not diagonally.
// You can assume that the grid is rectangular (rows have the same length).

vector<vector<int>> dir={
    {0, 1},
    {0, -1},
    {1, 0},
    {-1, 0}
};

void dfs(vector<vector<int>> &vc, int i, int j, int m, int n) {
    if(i>=0 && j>=0 && i<m && j<n && vc[i][j] ==1) { //base boundary
        for(int x=0;x<dir.size();x++) {
            vc[i][j]=0;
            dfs(vc, i+dir[x][0], j+dir[x][1], m, n);
        }
    }
}

int main() {
    vector<vector<int>> vc= {
        {1, 1, 1, 1, 1}, 
        {0, 1,  0, 1, 0}
    };
    // {
    // {1, 1, 0, 0, 0},
    // {1, 1, 0, 0, 0},
    // {0, 0, 1, 0, 0},
    // {0, 0, 0, 1, 1}
    // };

    int count=0;


    for(int i=0;i<vc.size();i++) {
        int m= vc.size();
        for(int j=0;j<vc[i].size();j++) {
            int n= vc[i].size();
            if(vc[i][j]==1) {
                count++;
                dfs(vc, i, j, m, n);
            }
        }
    }

    cout<<count<<endl;

}

*/