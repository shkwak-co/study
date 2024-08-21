'''
심화
'''

a = [1, 2, ['a', 'b', ['Life', 'is']]]
print(a[2][2][0])

b = 'Life is short'
print(b[3:6])

# 정렬
arr = [1,5,2,4,3]
arr.sort()
arr.reverse()
print(arr)

# 삽입/제거
brr = [1,2,3]
brr.insert(1,4)
print(brr)
brr.remove(4)
print(brr)
brr.pop()
print(brr)