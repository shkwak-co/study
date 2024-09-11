# print stars

'''
if user's input number is 3
  *
 ***
*****
 ***
  *
'''
# backjoon #2444
# https://www.acmicpc.net/problem/2444

def print_stars(number):
    number = int(number)  # 입력 값을 정수로 변환
    for i in range(number * 2 - 1):
        if i < number:  # 위쪽 부분
            for j in range(number * 2 - 1):
                if j < number - i - 1:  # 공백 출력
                    print(" ", end="")
                else:
                    for k in range(2 * i + 1):  # 별 출력
                        print("*", end="")
                    break
            print()
        else:  # 아래쪽 부분
            for j in range(number * 2 - 1):
                if j < i - number + 1:  # 공백 출력
                    print(" ", end="")
                else:
                    for k in range(2 * (number * 2 - i - 2) + 1):  # 별 출력
                        print("*", end="")
                    break
            print()

number = input()
print_stars(number)