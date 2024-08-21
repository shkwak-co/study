a = 1
def add(a,b):
    c = a
    d = b
    return c+b

print(add(a,3))


def echo(value):
    return value

value = 3
print(echo(value))

b = [1,2,3]
def vartest2(b):
    b = b.append(4)

vartest2(b)
print(b)