money = 100
coffee_price = 6
coffee_cups = 0
while money:
    if money > coffee_price:
        money -= coffee_price
        coffee_cups += 1
        print(coffee_cups)
    else:
        print("돈이 부족합니다")
        break
print("남은 돈은 {0}".format(money))


a = 0
while a < 10:
    a = a + 1
    if a % 2 == 0:
        continue
    print(a)

# continue는 while의 처음으로 돌아온다.
# pass는 통과해서 나아간다.

while True:
    print("ctrl+c를 누르면 종료됩니다")
