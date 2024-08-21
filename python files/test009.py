'''
딕셔너리
'''

#key, value 값
#key는 immutable로 작성되어야 함
dic = {'name':'sh', 'address':'PA'}
print(dic['name'])


'''
집합
'''

s1 = {1,2,3}
s2 = set("Hello")
s3 = {2,3,4}
print(type(s1))
print(type(s2))
print('교집합은 ' + str(s1 & s3))

'''
주소값
'''

a = [1,2,3]
b = a
# b는 a의 주소값을 가진다.


'''
리스트
name = []

집합
name = {}
name = set()

딕셔너리
name = {'key':'value'}
'''