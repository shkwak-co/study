'''
함수
'''

def function_name(param1, param2):
    output = param1 + param2
    return output

print(function_name(1,2))


def function_sum(value):
    if value == 0:
        return 0
    else:
        return value + function_sum(value-1)
    
print(function_sum(5))


def fibonacci_recursive(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)

print(fibonacci_recursive(5))
