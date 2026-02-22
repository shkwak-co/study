#include <stdio.h>



/*
    quiz:
    what is size of both?
*/
int main()
{
    char a[] = "abc";
    char *p = "abc";
    
    printf("%ld\n", sizeof(a));
    printf("%ld\n", sizeof(p));
    return 0;
}

/*
    a[] is {'a', 'b', 'c', '\0'}
    p is just pointer.

    a[] = 4bytes
    *p = size of pointer
*/