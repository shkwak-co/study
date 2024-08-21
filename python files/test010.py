money = True
if money:
    print("taxi")
else:
    print("walk")

money = 3
if money != 2:
    print("not 2")
else:
    print("money")


# python은 indent(들여쓰기)가 중요하다

x = 3
y = 2

print(x == y)


money = 2000
card = True
if money >= 3000 or card:
    print("taxi")
else:
    print("walk")


#

if 'p ' in 'p ython':
    print("yes")
else:
    print('no')


# 반복

count = 10
while count > 0:
    print(count)
    count = count - 1
    if count == 0:
        print("종료")

#
count = 10
count += 1
count -= 1

