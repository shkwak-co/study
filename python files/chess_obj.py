# King 1
# Queen 1
# Look 2
# Knight 2
# Bishop 2
# pawn 8

# backjoon #3003
# https://www.acmicpc.net/problem/3003

def checking_obj(now_obj):
    chess_obj = [1, 1, 2, 2, 2, 8]
    for i in range(6):
        diff = chess_obj[i] - now_obj[i]
        print(diff, end=' ')

now_obj = list(map(int, input().split()))
checking_obj(now_obj)
