'''
Backjoon #10988
https://www.acmicpc.net/problem/10988

finding palinrome

'''

def Is_Palindrome(word_arr, word_len):
    if word_len %2 == 1:
        for i in range(word_len//2 +1):
            if word_arr[i] != word_arr[word_len-1-i]:
                print("0")
                return
            else :
                continue
    else:
        for i in range(word_len//2):
            if word_arr[i] != word_arr[word_len-1-i]:
                print("0")
                return
            else:
                continue
    print("1")

word = input()
word_arr = list(word)
word_len = len(word)

Is_Palindrome(word_arr, word_len)