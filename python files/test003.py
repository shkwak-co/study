'''
심화
'''

number = 3
a = "apple : %d" % number
print(a)


#소수점 표현

a = "%.3f" % 1.24244
print(a)


#이름으로 처리
number = 3
a = "apple : {0}, {amount}".format(number, amount = 110)
print(a)


#정렬
a = "{0:>10}".format("hi")
print(a)


a = "{0:*^10}".format("hi")

