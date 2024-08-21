'''
튜플
'''
#튜플은 변경이 불가능한 리스트

# Mutable / Immutable
# 리스트  /  정수
# 딕셔너리 / 실수, 문자열
# 집합    / 튜플

t1 = ()
print(type(t1))

t2 = (1,2,3,)
print(t2)

t4 = 1, 2, 3
print(t4)
print(type(t4))

t5 = ('a', 'b', 'c', ('aa', 'bb', 'cc'))
print(t5)

