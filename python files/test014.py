def say():
    print("hi")

a = say()
print(a)

def sub(a,b):
    return b-a
result = sub(7, 3)
# result = sub(a=7, b=3)
print(result)

def add_many(*args):
    result = 0
    for i in args:
        result = result + i
    return result

print(add_many(1,2,3,4,5))

def add_mul(choice, *args):
    if choice == "add":
        result = 0
        for i in args:
            result = result + i
    elif choice == "mul":
        result = 1
        for i in args:
            result = result * i
    return result

print(add_mul("add", 1,2,3,4,5))
print(add_mul("mul", 1,2,3,4,5))

# 딕셔너리
def print_kwargs(**kwargs):
    print(kwargs['b'])

print_kwargs(a=1, b=2)

 # 튜플
def add_and_mul(a,b):
    return a+b, a*b

print(add_and_mul(3,6))
# 결과가 튜플로 나온다.

