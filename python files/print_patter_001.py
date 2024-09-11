print("input number")
number = int(input())

for i in range(1, number+1):
    # range(1, number+1)은 c에서 for(i=1; i<= number; *) 와 같다.
    for j in range(1, i+1):
        if j % 2 == 1:
            print("*", end="")
        else:
            print("#", end="")
    print()
