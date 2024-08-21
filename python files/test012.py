# while문 내에서 객체를 계속 생성할 때
# 메모리 이슈가 발생함.
# 적절하게 메모리 해제, 삭제를 해야 함.


'''
for 문
'''

test_list = ['one', 'two', 'three']
for i in test_list:
    print(i)


a = [(1,2), (3,4), (5,6)]
for (first, last) in a:
    print(first+last)

for first, second in a:
    print(first)
    print(second)

a = [1,2,3,4]
result = []
for num in a:
    result.append(num*3)
print(result)

b = [1,2,3,4]
result = [num*3 for num in a]
print(result)

list = [(1,2), (3,4), (5,6)]
for i in list:
    print(i)

