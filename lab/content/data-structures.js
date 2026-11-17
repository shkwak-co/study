LAB.track({
    id: "data-structures",
    name: "자료구조",
    icon: "⊞",
    color: "#a3e635",
    tagline: "배열에서 그래프까지. 메모리에 어떻게 놓이고 연산이 몇 번 일어나는지",
    trends: [
        {
            title: "해시 맵: Swiss table 이 기본값으로, 불변 dict 까지",
            when: "2019–2026",
            points: [
                "**개방 주소법(open addressing)** + 칸마다 1바이트 메타데이터로 후보를 먼저 거름",
                "Rust 1.36 (2019-07): `HashMap` 을 SwissTable 기반 hashbrown 으로 교체 · 기본 해시는 SipHash 1-3 유지",
                "Go 1.24 (2025-02): 내장 map 재작성 · 8칸 그룹 + 64비트 제어 워드 · 마이크로벤치 최대 60% 빠름",
                "Go map 은 테이블 하나에 최대 1024개 · 커질 때 그 테이블만 재해시(rehash) → 삽입 한 번의 지연에 상한",
                "Python 3.15 (2026-10): 내장 `frozendict` · 만든 뒤 수정 불가, 키·값이 해시 가능하면 자신도 해시 가능"
            ],
            refs: [
                { title: "Announcing Rust 1.36.0", by: "The Rust Release Team", year: 2019, url: "https://blog.rust-lang.org/2019/07/04/Rust-1.36.0/", kind: "doc" },
                { title: "Faster Go maps with Swiss Tables", by: "Pratt", year: 2025, url: "https://go.dev/blog/swisstable", kind: "doc" },
                { title: "What's new in Python 3.15", by: "Python Software Foundation", year: 2026, url: "https://docs.python.org/3.15/whatsnew/3.15.html", kind: "doc" }
            ]
        },
        {
            title: "저장 엔진의 두 갈래: B-트리 vs LSM 트리",
            when: "1996–2026",
            points: [
                "B-트리(B-tree): 노드 = 디스크 페이지 · SQLite 는 테이블·인덱스를 B-트리 페이지로 저장",
                "LSM 트리(log-structured merge-tree): 쓰기를 메모리에 모았다가 정렬된 파일로 순차 기록 → 쓰기 처리량 ↑",
                "대가: 읽기는 여러 파일 확인, 백그라운드 병합(compaction) 필요",
                "RocksDB: memtable 이 차면 정렬된 SST 파일로 내려씀 · 층(level)별로 병합해 낡은 키를 지움"
            ],
            refs: [
                { title: "Database File Format", by: "SQLite", url: "https://www.sqlite.org/fileformat2.html", kind: "spec" },
                { title: "The log-structured merge-tree (LSM-tree)", by: "O'Neil et al.", year: 1996, url: "https://doi.org/10.1007/s002360050048", kind: "paper" },
                { title: "RocksDB Overview", by: "RocksDB", url: "https://github.com/facebook/rocksdb/wiki/RocksDB-Overview", kind: "doc" }
            ]
        },
        {
            title: "Big-O 다음: 메모리 배치와 SIMD",
            when: "2015–2026",
            points: [
                "Eytzinger 배치(BFS layout): 힙처럼 층 순서로 저장한 배열 → 큰 n 에서 정렬 배열 이진 탐색보다 대체로 빠름",
                "작은 n 은 여전히 정렬 배열 + 잘 짠 이진 탐색이 최선",
                "vqsort (2022): 벡터 명령 퀵 정렬 · 같은 코드가 SVE·RISC-V V 포함 7개 명령어 집합에서 동작",
                "C++26 기술 작업 완료 (2026-03): 표준 `<simd>` 데이터 병렬 타입 · 고정 용량 `std::inplace_vector`(힙 할당 없음)"
            ],
            refs: [
                { title: "Array Layouts for Comparison-Based Searching", by: "Khuong et al.", year: 2015, url: "https://arxiv.org/abs/1509.05053", kind: "paper" },
                { title: "Vectorized and performance-portable Quicksort", by: "Blacher et al.", year: 2022, url: "https://arxiv.org/abs/2205.05982", kind: "paper" },
                { title: "C++26 is done! — Trip report: March 2026 ISO C++ standards meeting", by: "Sutter", year: 2026, url: "https://herbsutter.com/2026/03/29/c26-is-done-trip-report-march-2026-iso-c-standards-meeting-london-croydon-uk/", kind: "doc" },
                { title: "C++26", by: "cppreference.com", url: "https://en.cppreference.com/w/cpp/26", kind: "doc" }
            ]
        },
        {
            title: "락 없는 SPSC 링: 커널부터 RTOS 까지",
            when: "2019–2026",
            points: [
                "io_uring (2019): 앱 ↔ 커널이 공유 메모리의 SPSC 링 2개(제출 SQ · 완료 CQ)로 통신 → 시스템 콜·복사 ↓",
                "인덱스는 자유 증가(free-running) 32비트 + 2의 거듭제곱 크기 마스크 · 가득 참 플래그 없이 전 칸 사용",
                "Zephyr RTOS: SPSC·MPSC 락 프리 큐(lock-free queue)를 커널 자료구조로 제공"
            ],
            refs: [
                { title: "Efficient IO with io_uring", by: "Axboe", year: 2019, url: "https://kernel.dk/io_uring.pdf", kind: "doc" },
                { title: "Single Producer Single Consumer Lock Free Queue", by: "Zephyr Project", url: "https://docs.zephyrproject.org/latest/kernel/data_structures/spsc_lockfree.html", kind: "doc" }
            ]
        }
    ],
    lessons: [
        {
            id: "ds-array-list",
            title: "배열과 연결 리스트",
            level: 1,
            mins: 12,
            pre: ["languages/c-pointer", "languages/complexity", "memory/mem-hierarchy"],
            checked: "2026-11-16",
            key: [
                "배열(array): 원소가 **연속** → `a[i]` 주소 = 시작 + i × 크기, 접근 O(1)",
                "연결 리스트(linked list): 노드가 힙에 흩어짐 · i 번째 찾기 O(n), 위치를 알면 삽입·삭제 O(1)",
                "같은 O(n) 순회도 배열이 몇 배 빠름 · 다음 원소가 같은 캐시 라인(cache line)에 있음",
                "동적 배열(dynamic array)은 용량을 배수로 키움 · 리눅스는 **내장형 리스트(intrusive linked list)**"
            ],
            concepts: [
                { term: "배열", en: "Array", def: "같은 크기 원소를 빈틈없이 나열 · 주소 = base + i × sizeof · 중간 삽입은 뒤 원소를 모두 이동" },
                { term: "연결 리스트", en: "Linked list", def: "노드 = 값 + `next` 포인터 · 노드마다 따로 할당 · 앞 노드를 알면 O(1) 로 끼우고 뺌" },
                { term: "동적 배열", en: "Dynamic array", def: "가득 차면 더 큰 블록을 할당해 복사 · `std::vector`, Rust `Vec`, Python `list`" },
                { term: "내장형 리스트", en: "Intrusive linked list", def: "링크 필드를 객체 안에 둠 · 노드 할당 없음 · `container_of` 로 링크 → 객체 · 리눅스 `list_head`" }
            ],
            demo: {
                type: "sim",
                name: "memory",
                lang: "c",
                code: `#include <stdlib.h>

struct node { int v; struct node *next; };

int main(void) {
    int arr[3] = {10, 20, 30};            // 연속 12 B
    struct node *c = malloc(sizeof *c);
    c->v = 30; c->next = NULL;
    struct node *b = malloc(sizeof *b);
    b->v = 20; b->next = c;
    struct node *a = malloc(sizeof *a);
    a->v = 10; a->next = b;               // a → b → c
    struct node *m = malloc(sizeof *m);
    m->v = 15; m->next = a->next;         // m → b 먼저
    a->next = m;                          // a → m → b → c
    a->next = m->next;                    // m 빼기
    free(m);
    return 0;
}`,
                steps: [
                    { line: 6, stack: [{ fn: "main", vars: [["arr", "10 | 20 | 30"]] }], heap: [], text: "배열 `arr`: 12 B 가 **연속** · `arr[2]` 주소 = `arr` + 2 × 4 → 바로 계산" },
                    { line: 7, stack: [{ fn: "main", vars: [["arr", "10 | 20 | 30"], ["c", "→0x5040"]] }], heap: [["0x5040", "?"]], text: "`malloc`: 노드 하나(64비트: `int` 4 + 패딩 4 + 포인터 8 = 16 B)를 힙 어딘가에" },
                    { line: 8, stack: [{ fn: "main", vars: [["arr", "10 | 20 | 30"], ["c", "→0x5040"]] }], heap: [["0x5040", "v=30 next=NULL"]], text: "c 는 마지막 노드 · `next = NULL` 이 끝 표시" },
                    { line: 10, stack: [{ fn: "main", vars: [["arr", "10 | 20 | 30"], ["c", "→0x5040"], ["b", "→0x5a10"]] }], heap: [["0x5040", "v=30 next=NULL"], ["0x5a10", "v=20 next=0x5040"]], text: "b 는 0x5a10 — c 와 **떨어진** 주소 · 순서는 `next` 로만 이어짐" },
                    { line: 12, stack: [{ fn: "main", vars: [["arr", "10 | 20 | 30"], ["c", "→0x5040"], ["b", "→0x5a10"], ["a", "→0x5200"]] }], heap: [["0x5040", "v=30 next=NULL"], ["0x5a10", "v=20 next=0x5040"], ["0x5200", "v=10 next=0x5a10"]], text: "a → b → c 완성 · 원소마다 `malloc` 1번 + 포인터 8 B 가 추가 비용" },
                    { line: 14, stack: [{ fn: "main", vars: [["arr", "10 | 20 | 30"], ["c", "→0x5040"], ["b", "→0x5a10"], ["a", "→0x5200"], ["m", "→0x5c80"]] }], heap: [["0x5040", "v=30 next=NULL"], ["0x5a10", "v=20 next=0x5040"], ["0x5200", "v=10 next=0x5a10"], ["0x5c80", "v=15 next=0x5a10"]], text: "새 노드 m 이 **먼저** b 를 가리킴 · 순서를 바꾸면 b 이후를 잃어버림" },
                    { line: 15, stack: [{ fn: "main", vars: [["arr", "10 | 20 | 30"], ["c", "→0x5040"], ["b", "→0x5a10"], ["a", "→0x5200"], ["m", "→0x5c80"]] }], heap: [["0x5040", "v=30 next=NULL"], ["0x5a10", "v=20 next=0x5040"], ["0x5200", "v=10 next=0x5c80"], ["0x5c80", "v=15 next=0x5a10"]], text: "`a->next = m`: 포인터 하나로 중간 삽입 O(1) · 배열이면 뒤 원소를 전부 밀어야 함" },
                    { line: 16, stack: [{ fn: "main", vars: [["arr", "10 | 20 | 30"], ["c", "→0x5040"], ["b", "→0x5a10"], ["a", "→0x5200"], ["m", "→0x5c80"]] }], heap: [["0x5040", "v=30 next=NULL"], ["0x5a10", "v=20 next=0x5040"], ["0x5200", "v=10 next=0x5a10"], ["0x5c80", "v=15 next=0x5a10"]], text: "빼기도 O(1) — 단 **앞 노드**(a)를 알 때만 · 값으로 찾는 건 O(n)" },
                    { line: 17, stack: [{ fn: "main", vars: [["arr", "10 | 20 | 30"], ["c", "→0x5040"], ["b", "→0x5a10"], ["a", "→0x5200"], ["m", "→0x5c80"]] }], heap: [["0x5040", "v=30 next=NULL"], ["0x5a10", "v=20 next=0x5040"], ["0x5200", "v=10 next=0x5a10"], ["0x5c80", "freed"]], text: "`free(m)`: 빠진 노드 반환 · m 은 이제 dangling" },
                    { line: 18, stack: [{ fn: "main", vars: [["arr", "10 | 20 | 30"], ["c", "→0x5040"], ["b", "→0x5a10"], ["a", "→0x5200"], ["m", "→0x5c80"]] }], heap: [["0x5040", "v=30 next=NULL"], ["0x5a10", "v=20 next=0x5040"], ["0x5200", "v=10 next=0x5a10"], ["0x5c80", "freed"]], text: "순회 a → b → c 는 0x5200 → 0x5a10 → 0x5040 으로 튐 → 노드마다 캐시 미스 가능 (데모라 NULL 검사·나머지 free 생략)" }
                ]
            },
            code: [
                {
                    lang: "c",
                    title: "내장형 이중 연결 리스트 (리눅스 list_head 방식)",
                    src: `#include <stddef.h>

struct list_head { struct list_head *next, *prev; };

#define container_of(ptr, type, member) \\
    ((type *)((char *)(ptr) - offsetof(type, member)))

static void list_init(struct list_head *h) { h->next = h->prev = h; }

static void list_add_tail(struct list_head *n, struct list_head *h) {
    n->prev = h->prev;                    /* h 바로 앞 = 리스트 끝 */
    n->next = h;
    h->prev->next = n;
    h->prev = n;
}

static void list_del(struct list_head *n) {
    n->prev->next = n->next;              /* 앞뒤를 서로 이음: O(1) */
    n->next->prev = n->prev;
}

struct task {
    int prio;
    struct list_head node;                /* 링크를 객체 안에 내장 */
};

int sum_prio(struct list_head *h) {
    int s = 0;
    for (struct list_head *p = h->next; p != h; p = p->next)
        s += container_of(p, struct task, node)->prio;   /* 링크 → 객체 */
    return s;
}`,
                    note: "`prev` 가 있는 **이중 연결 리스트(doubly linked list)** → 노드 자신만 알면 O(1) 삭제 · head 는 데이터 없는 **센티널 노드(sentinel node)**라 `NULL` 분기 없음"
                },
                {
                    lang: "cpp",
                    title: "동적 배열이 자라는 모습",
                    src: `#include <cstdio>
#include <vector>

int main() {
    std::vector<int> v;
    std::size_t cap = 0;
    for (int i = 0; i < 100; i++) {
        v.push_back(i);
        if (v.capacity() != cap) {        // 재할당: 새 블록 + 원소 전부 이동
            cap = v.capacity();
            std::printf("size=%zu cap=%zu data=%p\\n", v.size(), cap, (void *)v.data());
        }
    }
}
// libstdc++(GCC): cap 1 2 4 8 16 32 64 128 · MSVC: 1.5배씩`,
                    note: "재할당마다 `data()` 주소가 바뀜 → 옛 포인터·반복자는 무효 = **반복자 무효화(iterator invalidation)** · **성장 계수(growth factor)**가 배수라 push 는 분할상환 O(1)"
                }
            ],
            optimize: [
                {
                    title: "순서 상관없는 삭제: 당기기 → **스왑 삭제(swap-remove)**",
                    before: { lang: "c", src: `/* i 번째 삭제: 뒤 원소를 전부 한 칸씩 당김 */
memmove(&a[i], &a[i + 1], (n - i - 1) * sizeof a[0]);
n--;` },
                    after: { lang: "c", src: `/* 마지막 원소로 구멍을 메움 */
a[i] = a[n - 1];
n--;` },
                    gain: "O(n) → O(1)",
                    note: "원소 순서가 바뀜 · Rust `Vec::swap_remove`, C++ `v[i] = std::move(v.back()); v.pop_back();`"
                },
                {
                    title: "개수를 알면 미리 확보: `reserve`",
                    before: { lang: "cpp", src: `std::vector<Sample> buf;
for (int i = 0; i < n; i++)
    buf.push_back(read_sample());   // 자라면서 재할당·이동 여러 번` },
                    after: { lang: "cpp", src: `std::vector<Sample> buf;
buf.reserve(n);                     // 한 번에 n 칸
for (int i = 0; i < n; i++)
    buf.push_back(read_sample());   // 재할당 0 번 · 포인터도 그대로` },
                    gain: "재할당 ~log₂n 회 → 1회",
                    note: "Rust `Vec::with_capacity(n)` · 임베디드는 고정 크기 배열로 힙 할당 자체를 피하기도"
                }
            ],
            glossary: [
                { term: "이중 연결 리스트", en: "Doubly linked list", def: "노드마다 `prev`·`next` · 노드 포인터만으로 O(1) 삭제, 양방향 순회 · 포인터 2개만큼 메모리 추가" },
                { term: "센티널 노드", en: "Sentinel node", def: "데이터 없는 머리 노드 · 빈 리스트도 원형으로 이어져 `NULL` 특수 처리가 사라짐" },
                { term: "성장 계수", en: "Growth factor", def: "동적 배열이 가득 찰 때 용량에 곱하는 배수 · 보통 1.5 또는 2 · 배수여야 분할상환 O(1)" },
                { term: "반복자 무효화", en: "Iterator invalidation", def: "컨테이너 변경 후 기존 반복자·포인터·참조가 옛 메모리를 가리키는 상태 · 쓰면 UB" },
                { term: "스왑 삭제", en: "Swap-remove", def: "지울 칸에 마지막 원소를 옮기고 길이 −1 · 순서를 포기하고 O(1)" }
            ],
            quiz: [
                { q: "`int a[100]` 에서 `a[57]` 에 접근하는 비용은?", options: ["O(1) · 주소 계산", "O(log n) · 이진 탐색", "O(i) · 57칸 따라감", "O(n) · 처음부터 셈"], a: 0, why: "시작 주소 + 57 × 4 · 곱셈·덧셈 한 번 · 칸을 따라가는 건 연결 리스트의 비용" },
                { q: "단일 연결 리스트에서 p 가 가리키는 노드 **자신**을 지우려면 (앞 노드 모름)?", options: ["O(1) · `free(p)` 한 번", "O(n) · 앞 노드부터 찾음", "O(log n) · 반씩 건너뜀", "O(1) · `p->next` 만 고침"], a: 1, why: "앞 노드의 `next` 를 바꿔야 함 · `free(p)` 만 하면 앞 노드가 해제된 메모리를 가리킴" },
                { q: "`std::vector` 에 `push_back` 한 뒤, 미리 받아 둔 `&v[0]` 포인터는?", options: ["언제나 그대로 유효", "재할당이 있었다면 무효", "새 주소로 자동 갱신", "`reserve` 없으면 늘 무효"], a: 1, why: "용량이 넘칠 때만 새 블록으로 이동 · 안 넘쳤으면 그대로라 '늘 무효'도 틀림" },
                { q: "리눅스 `list_head` 같은 내장형 리스트의 장점이 **아닌** 것은?", options: ["노드를 따로 할당하지 않음", "한 객체가 여러 리스트에 들어감", "i 번째 원소에 O(1) 접근", "타입과 무관한 공통 리스트 코드"], a: 2, why: "어떤 리스트든 i 번째까지 따라가야 함 · 나머지 셋은 링크를 객체 안에 둔 덕분" },
                { q: "용량을 2배씩 키우는 동적 배열에 n 번 push 할 때 복사되는 원소 총수는?", options: ["약 n log₂n", "2n 미만", "약 n²/2", "정확히 n"], a: 1, why: "1 + 2 + 4 + … < 2n · 원소당 상수 = 분할상환 O(1) · n²/2 는 10칸씩 더할 때" },
                { type: "num", q: "64비트(LP64)에서 `struct node { int v; struct node *next; }` 의 `sizeof` 는?", answer: 16, unit: "B", why: "`int` 4 + 패딩 4 (포인터 8 B 정렬) + 포인터 8" },
                { type: "num", q: "용량 1 에서 시작해 2배씩 키우는 동적 배열에 1000 개를 push 하면 재할당은 몇 번?", answer: 10, unit: "번", why: "1 → 2 → 4 → … → 1024 · 10번 바뀌고 복사는 1 + 2 + … + 512 = 1023개" },
                { type: "text", q: "출력은? (공백으로 구분)", code: { lang: "c", src: `int a[5] = {10, 20, 30, 40, 50};
int n = 5, i = 1;
a[i] = a[n - 1];        /* 스왑 삭제 */
n--;
for (int k = 0; k < n; k++) printf("%d ", a[k]);` }, answer: ["10 50 30 40"], why: "지운 1번 칸을 마지막 50 으로 메우고 길이 −1 · 순서는 바뀜" },
                { type: "order", q: "단일 리스트 a → b 사이에 새 노드 m 을 끼우는 안전한 순서", items: ["m 할당", "`m->next = a->next`", "`a->next = m`"], why: "`a->next = m` 을 먼저 하면 b 의 주소를 덮어써 b 이후를 잃음" }
            ],
            refs: [
                { title: "Linked Lists in Linux", by: "Frattaroli", url: "https://docs.kernel.org/core-api/list.html", kind: "doc" },
                { title: "std::vector", by: "cppreference.com", url: "https://en.cppreference.com/w/cpp/container/vector", kind: "doc" },
                { title: "LinkedList in std::collections", by: "The Rust Project", url: "https://doc.rust-lang.org/std/collections/struct.LinkedList.html", kind: "doc" },
                { title: "Design and History FAQ — How are lists implemented in CPython?", by: "Python Software Foundation", url: "https://docs.python.org/3/faq/design.html", kind: "doc" }
            ]
        },
        {
            id: "ds-ring",
            title: "스택·큐·링 버퍼",
            level: 1,
            mins: 14,
            pre: ["data-structures/ds-array-list"],
            checked: "2026-11-16",
            key: [
                "스택(stack)은 LIFO: 넣은 역순으로 꺼냄 · 큐(queue)는 FIFO: 넣은 순서대로",
                "링 버퍼(ring buffer): 고정 배열 + head(쓰기)·tail(읽기) · 끝에 닿으면 0 으로",
                "`head == tail` 은 빔 · 가득 참은 빈 칸 하나·개수 변수·자유 증가 인덱스(free-running index)로 구분",
                "생산자 1·소비자 1(ISR → main)이면 각자 자기 인덱스만 써서 **락 없이** 동작"
            ],
            concepts: [
                { term: "스택", en: "Stack (LIFO)", def: "한쪽 끝(top)에서만 push/pop · 함수 호출, 되돌리기(undo), 괄호 검사, DFS" },
                { term: "큐", en: "Queue (FIFO)", def: "뒤로 넣고 앞에서 꺼냄 · 배열로 짜면 링 버퍼, 리스트로 짜면 노드 사슬" },
                { term: "링 버퍼", en: "Ring buffer (circular buffer)", def: "크기 N 고정 · 인덱스가 끝에서 0 으로 · 할당·이동 없음 → ISR·DMA 에 적합" },
                { term: "가득/빔 판정", en: "Full vs. empty disambiguation", def: "빈 칸 하나: `(head+1)%N == tail` 이면 가득 · 개수 변수 `count` · 자유 증가: `head - tail == N`" },
                { term: "SPSC 큐", en: "Single-producer single-consumer queue", def: "생산자만 head, 소비자만 tail 을 수정 → 락 대신 쓰기 순서만 지키면 됨" }
            ],
            demo: { type: "sim", name: "ringbuf", size: 8, mode: "free" },
            code: [
                {
                    lang: "c",
                    title: "UART 수신 링 버퍼 (ISR → main, 락 없음)",
                    src: `#include <stdint.h>
#include <stdbool.h>
#include "stm32f4xx.h"                     /* CMSIS: USART1, __DMB() */

#define RB_SIZE 64u                        /* 2의 거듭제곱 */
#define RB_MASK (RB_SIZE - 1u)

static uint8_t buf[RB_SIZE];
static volatile uint32_t head;             /* 쓰기 위치: ISR 만 수정 */
static volatile uint32_t tail;             /* 읽기 위치: main 만 수정 */
static volatile uint32_t dropped;          /* 가득 차서 버린 바이트 */

void USART1_IRQHandler(void) {             /* 생산자 */
    uint8_t b = (uint8_t)USART1->DR;       /* DR 을 읽어야 RXNE 해제 */
    if (head - tail == RB_SIZE) {          /* 가득: 새 바이트 버림 */
        dropped++;
        return;
    }
    buf[head & RB_MASK] = b;
    __DMB();                               /* 데이터 먼저, 인덱스는 나중 */
    head++;
}

bool rb_get(uint8_t *out) {                /* 소비자: main 루프 */
    if (tail == head) return false;        /* 빔 */
    __DMB();
    *out = buf[tail & RB_MASK];
    __DMB();                               /* 다 읽은 뒤 칸 반납 */
    tail++;
    return true;
}`,
                    note: "`head - tail` 은 unsigned 랩어라운드에도 정확 · 단일 코어 Cortex-M 에서 `__DMB()` 는 주로 컴파일러 재배치를 막는 장벽 (`buf` 는 `volatile` 이 아님)"
                },
                {
                    lang: "cpp",
                    title: "멀티코어용 SPSC 큐 (C++ atomic)",
                    src: `#include <array>
#include <atomic>
#include <cstddef>
#include <optional>

template <typename T, std::size_t N>             // N = 2의 거듭제곱
class Spsc {
    static_assert(N > 0 && (N & (N - 1)) == 0);
    std::array<T, N> buf{};
    std::atomic<std::size_t> head{0};            // 생산자만 씀
    std::atomic<std::size_t> tail{0};            // 소비자만 씀
public:
    bool push(const T& v) {                      // 생산자 스레드 1개
        std::size_t h = head.load(std::memory_order_relaxed);
        if (h - tail.load(std::memory_order_acquire) == N) return false;  // 가득
        buf[h & (N - 1)] = v;
        head.store(h + 1, std::memory_order_release);   // 데이터 → 공개
        return true;
    }
    std::optional<T> pop() {                     // 소비자 스레드 1개
        std::size_t t = tail.load(std::memory_order_relaxed);
        if (t == head.load(std::memory_order_acquire)) return std::nullopt;  // 빔
        T v = buf[t & (N - 1)];
        tail.store(t + 1, std::memory_order_release);   // 칸 반납
        return v;
    }
};`,
                    note: "**SPSC 큐(single-producer single-consumer queue)**: release 저장 ↔ acquire 읽기 짝 = **획득·해제 순서(acquire/release ordering)** · 생산자가 둘이면 `head` 경쟁으로 깨짐"
                }
            ],
            optimize: [
                {
                    title: "가득 판정: 빈 칸 하나 방식 → 자유 증가 인덱스",
                    before: { lang: "c", src: `/* 인덱스를 0..N-1 로 감음 · 한 칸은 늘 비워 둠 */
bool full  = ((head + 1) % N) == tail;
bool empty = head == tail;
buf[head] = b;
head = (head + 1) % N;          /* 쓸 수 있는 칸 N - 1 개 */` },
                    after: { lang: "c", src: `/* 인덱스는 계속 증가 · 쓸 때만 마스크 (N = 2^k) */
bool full  = (head - tail) == N;
bool empty = head == tail;
buf[head & (N - 1)] = b;
head++;                         /* N 칸 전부 사용 · 개수 = head - tail */` },
                    gain: "용량 N − 1 → N",
                    note: "N 이 2의 거듭제곱이어야 2³² 에서 랩어라운드해도 마스크 위치가 이어짐 · io_uring 링도 같은 방식"
                },
                {
                    title: "멀티코어 SPSC: `head`·`tail` 을 다른 캐시 라인에",
                    before: { lang: "cpp", src: `std::atomic<std::size_t> head{0};   // 같은 64 B 라인에 붙어 있음
std::atomic<std::size_t> tail{0};   // → 두 코어가 라인을 서로 뺏음` },
                    after: { lang: "cpp", src: `alignas(64) std::atomic<std::size_t> head{0};   // 생산자 코어 전용 라인
alignas(64) std::atomic<std::size_t> tail{0};   // 소비자 코어 전용 라인
// C++17: std::hardware_destructive_interference_size` },
                    gain: "코어 간 캐시 라인 핑퐁 ↓",
                    note: "거짓 공유(false sharing): 다른 변수인데 같은 라인이라 서로 무효화 · 단일 코어 MCU 엔 해당 없음"
                }
            ],
            glossary: [
                { term: "LIFO / FIFO", en: "Last In, First Out / First In, First Out", def: "나중에 넣은 것부터(스택) / 먼저 넣은 것부터(큐) 꺼내는 규칙" },
                { term: "양방향 큐", en: "Double-ended queue (deque)", def: "양 끝 모두 O(1) 넣고 빼기 · 보통 링 버퍼나 블록 배열로 구현 · Python `deque`, Rust `VecDeque`" },
                { term: "자유 증가 인덱스", en: "Free-running index", def: "head·tail 을 감지 않고 계속 증가 · 접근할 때만 `& (N−1)` · 개수 = `head − tail`" },
                { term: "획득·해제 순서", en: "Acquire/release ordering", def: "release 저장 전의 쓰기가 같은 값을 acquire 로 읽은 쪽에 보이도록 보장하는 메모리 순서" },
                { term: "덮어쓰기 정책", en: "Overwrite policy (drop-oldest)", def: "가득 찼을 때 새 데이터를 버리지 않고 가장 오래된 칸을 덮음 · 로그·최신 센서값용" }
            ],
            quiz: [
                { q: "스택에 1, 2, 3 을 차례로 push 한 뒤 pop 을 두 번 하면?", options: ["1, 2", "3, 2", "2, 3", "3, 1"], a: 1, why: "LIFO: 마지막에 넣은 3 부터 · 1, 2 는 큐(FIFO)의 결과" },
                { q: "크기 8 링 버퍼를 '빈 칸 하나' 방식으로 쓰면 최대 몇 개 저장?", options: ["8", "7", "4", "9"], a: 1, why: "가득 = `(head+1)%8 == tail` · 한 칸은 늘 비어 있음 · 8 개는 개수 변수·자유 증가 방식" },
                { q: "32비트 unsigned 자유 증가 인덱스에서 저장된 개수는?", options: ["`head - tail`", "`(head - tail) % N`", "`tail - head`", "`head > tail ? head - tail : 0`"], a: 0, why: "unsigned 뺄셈은 2³² 모듈러 → head 가 0 으로 넘어가도 정확 · `% N` 은 가득 찼을 때 0 이 됨" },
                { q: "UART ISR(생산자)과 main(소비자)이 락 없이 링 버퍼를 공유하는 조건은?", options: ["각자 자기 인덱스만 쓰고 데이터 먼저", "두 인덱스를 `volatile int` 로 선언", "버퍼 크기를 홀수로 해 충돌 회피", "ISR 이 tail 까지 함께 갱신"], a: 0, why: "쓰는 쪽이 하나씩이라 경쟁 없음 · `volatile` 만으로는 데이터 → 인덱스 순서가 보장되지 않음" },
                { q: "생산자가 두 ISR 로 늘어나면?", options: ["32비트 인덱스라 그대로 안전", "head 경쟁 → 차단·락·CAS 필요", "tail 만 `volatile` 로 바꾸면 됨", "버퍼를 2배로 키우면 해결"], a: 1, why: "두 생산자가 같은 head 를 읽고 같은 칸에 쓸 수 있음 · 읽기 원자성과 read-modify-write 원자성은 다름" },
                { type: "num", q: "32비트 unsigned 자유 증가 인덱스: `head = 3`, `tail = 0xFFFFFFFE` 이면 저장 개수는?", answer: 5, why: "3 − 0xFFFFFFFE = 5 (mod 2³²) · head 만 먼저 넘어가도 뺄셈은 정확" },
                { type: "num", q: "115200 bps 8N1 UART 에서 main 이 8 ms 멈추는 동안 들어오는 양은? (올림)", answer: 93, unit: "B", why: "1바이트 = 10비트 → 11,520 B/s × 0.008 s = 92.16 → 93 B · 버퍼는 여유를 두고 128 B(2^k)" },
                { type: "text", q: "크기 N = 4, '빈 칸 하나' 방식, 가득 차면 새 값을 버린다. 마지막 줄에서 꺼내지는 값은 순서대로?", code: { lang: "c", src: `for (int v = 1; v <= 5; v++) put(v);
get(&x); get(&x);
put(6); put(7);
while (get(&x)) printf("%d ", x);` }, answer: ["3 6 7"], why: "용량 3 → 4, 5 버림 · get 두 번에 1, 2 · 6, 7 이 3 뒤에 들어감" },
                { type: "order", q: "레슨 코드의 UART ISR(생산자) 한 번의 처리 순서", items: ["`DR` 에서 바이트 읽기", "`head - tail == RB_SIZE` 검사", "`buf[head & RB_MASK]` 에 쓰기", "`__DMB()`", "`head++`"], why: "DR 을 먼저 읽어 RXNE 를 풀고 · 데이터를 쓴 뒤 장벽 · 인덱스는 마지막에 공개" }
            ],
            refs: [
                { title: "Circular Buffers", by: "Howells et al.", url: "https://docs.kernel.org/core-api/circular-buffers.html", kind: "doc" },
                { title: "Ring Buffers", by: "Zephyr Project", url: "https://docs.zephyrproject.org/latest/kernel/data_structures/ring_buffers.html", kind: "doc" },
                { title: "Specifying Concurrent Program Modules", by: "Lamport", year: 1983, url: "https://doi.org/10.1145/69624.357207", kind: "paper" },
                { title: "std::memory_order", by: "cppreference.com", url: "https://en.cppreference.com/w/cpp/atomic/memory_order", kind: "doc" }
            ]
        },
        {
            id: "ds-hash",
            title: "해시 테이블",
            level: 2,
            mins: 16,
            pre: ["data-structures/ds-array-list"],
            checked: "2026-11-16",
            key: [
                "해시 함수(hash function)가 키를 고르게 흩어야 평균 O(1) · 몰리면 O(n)",
                "선형 탐사(linear probing): 충돌하면 다음 칸 · 캐시엔 좋지만 **1차 군집(primary clustering)**",
                "개방 주소법(open addressing)의 삭제는 **묘비(tombstone)** · 그냥 비우면 탐사 사슬이 끊김",
                "적재율(load factor)이 1 에 가까우면 탐사 급증 · 충돌 키 폭격은 **해시 플러딩(hash flooding)**"
            ],
            concepts: [
                { term: "선형 탐사", en: "Linear probing", def: "`h, h+1, h+2 …` 순서로 빈칸 탐색 · 연속 메모리라 빠르지만 이웃 사슬이 붙어 길어짐" },
                { term: "묘비", en: "Tombstone (deleted marker)", def: "삭제된 칸 표시 · 검색은 지나가고 삽입은 재사용 · 쌓이면 재해시로 청소" },
                { term: "평균 탐사 수", en: "Expected probe count", def: "선형 탐사, 적재율 α: 성공 ≈ ½(1 + 1/(1−α)), 실패 ≈ ½(1 + 1/(1−α)²) · α=0.9 면 실패 ≈ 50" },
                { term: "해시 플러딩", en: "Hash flooding (algorithmic complexity attack)", def: "같은 버킷으로 가는 키를 대량 전송 → O(1) 이 O(n) 으로 · 대책: 무작위 키 해시(SipHash)" },
                { term: "스위스 테이블", en: "Swiss table", def: "칸마다 1바이트 메타데이터(해시 7비트) · SIMD 로 16칸을 한 번에 비교 후 키 비교" }
            ],
            demo: { type: "sim", name: "hash", size: 8, mode: "linear", keys: [3, 11, 19, 6, 14, 27] },
            code: [
                {
                    lang: "python",
                    title: "선형 탐사 + 묘비 (최소 구현)",
                    src: `EMPTY, TOMB = object(), object()

class LinearMap:
    def __init__(self, m=8):                  # m = 2의 거듭제곱
        self.keys = [EMPTY] * m
        self.vals = [None] * m
        self.used = 0                         # 살아 있는 키 + 묘비

    def _probe(self, key):
        mask = len(self.keys) - 1
        i = hash(key) & mask
        while True:
            yield i
            i = (i + 1) & mask                # 선형 탐사: 바로 다음 칸

    def get(self, key):
        for i in self._probe(key):
            k = self.keys[i]
            if k is EMPTY:                    # 빈칸 = 사슬 끝 → 없음
                raise KeyError(key)
            if k is not TOMB and k == key:    # 묘비는 건너뜀
                return self.vals[i]

    def put(self, key, val):
        if (self.used + 1) / len(self.keys) > 0.7:
            self._resize(2 * len(self.keys))
        tomb = None
        for i in self._probe(key):
            k = self.keys[i]
            if k is EMPTY:
                if tomb is None:
                    self.used += 1
                else:
                    i = tomb                  # 지나온 묘비 자리 재사용
                self.keys[i], self.vals[i] = key, val
                return
            if k is TOMB:
                if tomb is None:
                    tomb = i
            elif k == key:
                self.vals[i] = val            # 같은 키 → 값 교체
                return

    def delete(self, key):
        for i in self._probe(key):
            k = self.keys[i]
            if k is EMPTY:
                raise KeyError(key)
            if k is not TOMB and k == key:
                self.keys[i], self.vals[i] = TOMB, None   # 비우지 말고 묘비
                return

    def _resize(self, m):                     # 묘비는 버리고 전부 다시 넣기: O(n)
        live = [(k, v) for k, v in zip(self.keys, self.vals)
                if k is not EMPTY and k is not TOMB]
        self.keys, self.vals, self.used = [EMPTY] * m, [None] * m, 0
        for k, v in live:
            self.put(k, v)`,
                    note: "`used` 에 묘비도 세야 빈칸이 늘 남아 `get` 이 끝남 · CPython `dict` 도 개방 주소법이지만 탐사 순서는 해시 상위 비트를 섞는 비선형"
                },
                {
                    lang: "rust",
                    title: "해시 플러딩 방어: 무작위 키 SipHash",
                    src: `use std::collections::hash_map::RandomState;
use std::collections::HashMap;
use std::hash::BuildHasher;

fn main() {
    // 기본 HashMap = SwissTable + 무작위 키 SipHash 1-3
    let mut ages: HashMap<&str, u32> = HashMap::new();
    ages.insert("kim", 31);

    // RandomState 마다 키가 달라 같은 문자열도 해시가 다름
    let (s1, s2) = (RandomState::new(), RandomState::new());
    println!("{:016x}", s1.hash_one("kim"));
    println!("{:016x}", s2.hash_one("kim"));
    // → 공격자가 '같은 버킷으로 가는 키 목록'을 미리 만들 수 없음
}`,
                    note: "**해시 시드(hash seed)**를 프로세스마다 무작위로 · Python 도 3.4 부터 문자열 해시가 SipHash (PEP 456, 3.11 부터 SipHash-1-3) · 신뢰된 내부 키만 다루면 더 빠른 해시로 바꾸기도"
                }
            ],
            optimize: [
                {
                    title: "개수를 알면 `reserve` 로 **재해시(rehashing)** 없애기",
                    before: { lang: "cpp", src: `std::unordered_map<uint32_t, Item> m;
for (const auto& it : items)
    m.emplace(it.id, it);       // 자라면서 재해시 여러 번` },
                    after: { lang: "cpp", src: `std::unordered_map<uint32_t, Item> m;
m.reserve(items.size());        // 버킷을 미리 확보
for (const auto& it : items)
    m.emplace(it.id, it);       // 재해시 0 번` },
                    gain: "재해시 여러 번 → 0",
                    note: "재해시 = 모든 키를 새 버킷에 다시 배치하는 O(n) 작업 → 지연이 튀는 원인 · Rust 는 `HashMap::with_capacity`"
                },
                {
                    title: "긴 문자열 키: 저장된 해시부터 비교",
                    before: { lang: "python", src: `for k, v in bucket:
    if k == key:                  # 긴 문자열 비교를 매번
        return v` },
                    after: { lang: "python", src: `h = hash(key)
for hk, k, v in bucket:           # 항목에 해시를 함께 저장
    if hk == h and k == key:      # 정수 비교로 대부분 걸러냄
        return v` },
                    gain: "문자열 비교 대부분 생략",
                    note: "CPython `dict` 도 항목에 해시를 저장 (키가 모두 `str` 이면 문자열에 캐시된 해시 사용) · **스위스 테이블(Swiss table)**은 해시 7비트를 메타데이터 바이트에 둬 16칸을 SIMD 한 번에 거름"
                }
            ],
            glossary: [
                { term: "1차 군집", en: "Primary clustering", def: "선형 탐사에서 찬 칸들이 길게 이어 붙는 현상 · 그 근처로 오는 키마다 탐사가 길어짐" },
                { term: "재해시", en: "Rehashing", def: "테이블을 키우거나 묘비를 청소할 때 모든 키를 새 배열에 다시 넣는 O(n) 작업" },
                { term: "로빈 후드 해싱", en: "Robin Hood hashing", def: "선형 탐사 변형 · 원래 자리에서 더 멀리 밀려난 키에게 칸을 양보시켜 탐사 길이 편차를 줄임" },
                { term: "해시 시드", en: "Hash seed (randomized hashing)", def: "해시 함수에 섞는 비밀 무작위 값 · 프로세스마다 달라 충돌 키를 미리 계산할 수 없음" },
                { term: "완전 해시", en: "Perfect hashing", def: "키 집합이 고정일 때 충돌이 0 인 해시 · 키워드 표, 컴파일 타임 조회표 (gperf)" }
            ],
            quiz: [
                { q: "선형 탐사 테이블에서 키를 지울 때 칸을 그냥 EMPTY 로 비우면?", options: ["뒤로 밀려난 키 검색이 실패", "빈칸이 늘어 탐사가 빨라질 뿐", "지운 키의 메모리가 샘", "다음 재해시 때 키가 중복됨"], a: 0, why: "검색은 EMPTY 를 만나면 '없음'으로 멈춤 → 사슬이 끊김 · 그래서 묘비를 남김" },
                { q: "선형 탐사에서 적재율이 0.5 → 0.9 가 되면 없는 키 검색의 평균 탐사 수는 대략?", options: ["2.5 → 50", "1.5 → 5.5", "2 → 10", "1 → 2"], a: 0, why: "실패 ½(1 + 1/(1−α)²): 2.5 → 50.5 · 1.5 → 5.5 는 성공 검색 공식 (Knuth)" },
                { q: "해시 플러딩을 막는 표준적인 방법은?", options: ["시드를 섞은 SipHash 사용", "버킷 수를 소수로 바꿔 흩기", "해시를 두 번 연달아 계산", "적재율 한도를 0.5 로 낮추기"], a: 0, why: "시드를 모르면 충돌 키를 미리 만들 수 없음 · 소수 버킷·낮은 α 는 공개된 해시면 그대로 뚫림" },
                { q: "Swiss table 이 16칸을 빠르게 검사하는 방법은?", options: ["16바이트를 SIMD 로 H2 와 비교", "키 16개를 하나씩 차례로 `==` 비교", "16칸 안에서 이진 탐색으로 좁힘", "칸마다 해시를 다시 계산해 비교"], a: 0, why: "제어 바이트에 해시 7비트(H2) · 일치 후보만 키 비교 · 키 16개 비교는 그 비용을 피하려는 것" },
                { q: "체이닝 대비 개방 주소법의 장점은?", options: ["연속 배열이라 캐시 미스가 적음", "적재율이 1 을 넘어도 그대로 동작", "삭제할 때 묘비가 필요 없음", "최악의 경우에도 O(1) 보장"], a: 0, why: "α > 1 허용과 묘비 없는 삭제는 체이닝 쪽 장점 · 최악 O(1) 은 둘 다 아님" },
                { type: "num", q: "m = 8, h(k) = k mod 8, 선형 탐사에 5, 13, 21, 7, 15 를 차례로 넣었다. 15 를 찾을 때 탐사한 칸 수는?", answer: 3, unit: "칸", why: "15 → 칸 7(21) → 0(7) → 1(15) · 21 이 7 을, 7 이 15 를 밀어냄" },
                { type: "num", q: "선형 탐사, 적재율 α = 0.75 에서 없는 키 검색의 평균 탐사 수는? (Knuth 근사)", answer: 8.5, tol: 0.05, why: "½(1 + 1/(1−0.75)²) = ½(1 + 16) = 8.5" },
                { type: "text", q: "출력은?", code: { lang: "python", src: `t = [None] * 8
for k in (10, 18, 26, 3):
    i = k % 8
    while t[i] is not None:      # 선형 탐사
        i = (i + 1) % 8
    t[i] = k
print(t.index(3), t.count(None))` }, answer: ["5 4"], why: "10·18·26 이 칸 2·3·4 · 3 은 칸 3 에서 밀려 5 · 빈칸 8 − 4 = 4" },
                { type: "order", q: "레슨 코드 `put` (선형 탐사 + 묘비)의 처리 순서", items: ["해시로 시작 칸 계산", "찬 칸·묘비를 지나며 같은 키 확인", "빈칸을 만나 키가 없음을 확정", "지나온 첫 묘비(없으면 그 빈칸)에 저장"], why: "같은 키가 묘비 뒤에 있을 수 있어 빈칸까지 가 본 뒤에야 묘비를 재사용" }
            ],
            refs: [
                { title: "Swiss Tables Design Notes", by: "Abseil", url: "https://abseil.io/about/design/swisstables", kind: "doc" },
                { title: "Denial of Service via Algorithmic Complexity Attacks", by: "Crosby et al.", year: 2003, url: "https://www.usenix.org/legacy/events/sec03/tech/full_papers/crosby/crosby.pdf", kind: "paper" },
                { title: "PEP 456 – Secure and interchangeable hash algorithm", by: "Heimes", year: 2013, url: "https://peps.python.org/pep-0456/", kind: "spec" },
                { title: "HashMap in std::collections", by: "The Rust Project", url: "https://doc.rust-lang.org/std/collections/struct.HashMap.html", kind: "doc" }
            ]
        },
        {
            id: "ds-bst",
            title: "트리와 이진 탐색 트리",
            level: 2,
            mins: 15,
            pre: ["data-structures/ds-array-list"],
            checked: "2026-11-16",
            key: [
                "트리(tree): 루트(root)에서 갈라지는 계층 · 연산 비용은 **높이(height)** h 에 비례",
                "이진 탐색 트리(binary search tree): 왼쪽 < 노드 < 오른쪽 → **중위 순회(in-order traversal)** = 정렬 순서",
                "자식 둘인 노드 삭제: **후속자(successor)** 값을 복사한 뒤 후속자를 지움",
                "정렬된 입력이면 사슬로 퇴화(h = n) → **균형 트리(self-balancing tree)**·B-트리(B-tree)로 O(log n)"
            ],
            concepts: [
                { term: "트리 용어", en: "Tree terminology", def: "루트·부모·자식·잎(leaf) · 깊이 = 루트까지 간선 수 · 높이 = 가장 깊은 잎까지" },
                { term: "이진 탐색 트리", en: "Binary search tree (BST)", def: "모든 노드에서 왼쪽 서브트리 < 키 < 오른쪽 서브트리 · 검색·삽입·삭제 O(h)" },
                { term: "후속자", en: "In-order successor", def: "오른쪽 서브트리의 가장 왼쪽 노드 = 다음으로 큰 키 · 왼쪽 자식이 없어 지우기 쉬움" },
                { term: "균형 트리", en: "Self-balancing binary search tree", def: "삽입·삭제 때 회전으로 높이 O(log n) 유지 · AVL(엄격), 레드-블랙(느슨, 회전 적음)" },
                { term: "B-트리", en: "B-tree", def: "노드 하나에 키 여러 개를 정렬 배열로 · 디스크 페이지·캐시 단위로 읽어 높이를 크게 줄임" }
            ],
            demo: { type: "sim", name: "bst", values: [50, 30, 70, 20, 40, 60, 80, 35, 45] },
            code: [
                {
                    lang: "c",
                    title: "BST 삽입·검색·삭제",
                    src: `#include <stdlib.h>

struct node { int key; struct node *left, *right; };

struct node *bst_insert(struct node *t, int key) {
    if (!t) {
        struct node *n = calloc(1, sizeof *n);   /* left = right = NULL */
        if (n) n->key = key;
        return n;
    }
    if (key < t->key)      t->left  = bst_insert(t->left, key);
    else if (key > t->key) t->right = bst_insert(t->right, key);
    return t;                                    /* 같은 키는 무시 */
}

struct node *bst_find(struct node *t, int key) {
    while (t && t->key != key)                   /* 높이 h 만큼 내려감 */
        t = key < t->key ? t->left : t->right;
    return t;
}

struct node *bst_delete(struct node *t, int key) {
    if (!t) return NULL;
    if (key < t->key)      t->left  = bst_delete(t->left, key);
    else if (key > t->key) t->right = bst_delete(t->right, key);
    else if (t->left && t->right) {              /* 자식 둘: 후속자로 교체 */
        struct node *s = t->right;
        while (s->left) s = s->left;             /* 오른쪽 서브트리 최솟값 */
        t->key = s->key;
        t->right = bst_delete(t->right, s->key);
    } else {                                     /* 자식 0~1개: 그 자식이 자리 차지 */
        struct node *c = t->left ? t->left : t->right;
        free(t);
        return c;
    }
    return t;
}`,
                    note: "재귀 깊이 = 높이 · 퇴화한 트리에선 n 단계 재귀라 작은 MCU 스택이면 넘칠 수 있음"
                },
                {
                    lang: "python",
                    title: "정렬된 입력 vs 무작위 입력: 높이 비교",
                    src: `import random

def insert(t, k):                    # 노드 = [key, left, right]
    if t is None:
        return [k, None, None]
    node = t
    while True:                      # 반복문: 깊은 트리도 재귀 한도 걱정 없음
        i = 1 if k < node[0] else 2
        if node[i] is None:
            node[i] = [k, None, None]
            return t
        node = node[i]

def height(t):                       # 층(노드) 수
    h, level = 0, [t] if t else []
    while level:
        h += 1
        level = [c for n in level for c in (n[1], n[2]) if c]
    return h

n = 2000
keys = list(range(n))
t1 = None
for k in keys:
    t1 = insert(t1, k)               # 정렬된 입력
random.shuffle(keys)
t2 = None
for k in keys:
    t2 = insert(t2, k)               # 무작위 입력
print(height(t1), height(t2))        # 2000  vs  보통 22~27 (log₂2000 ≈ 11)`,
                    note: "무작위 순서면 기대 높이 O(log n) · 타임스탬프·ID 처럼 정렬된 데이터가 흔해서 실전은 균형 트리"
                }
            ],
            optimize: [
                {
                    title: "정렬된 키로 트리 만들기: 하나씩 삽입 → 가운데부터",
                    before: { lang: "python", src: `t = None
for k in sorted_keys:             # 사슬로 퇴화: 높이 n, 총 O(n²)
    t = insert(t, k)` },
                    after: { lang: "python", src: `def build(keys, lo, hi):          # [lo, hi) 의 가운데를 루트로
    if lo >= hi:
        return None
    mid = (lo + hi) // 2
    return [keys[mid], build(keys, lo, mid), build(keys, mid + 1, hi)]

t = build(sorted_keys, 0, len(sorted_keys))   # 높이 ⌈log₂(n+1)⌉` },
                    gain: "O(n²) → O(n) · 높이 n → log₂n"
                },
                {
                    title: "읽기 위주 조회표: `std::map` → 정렬된 `vector` + 이진 탐색",
                    before: { lang: "cpp", src: `std::map<int, Item> table;      // 노드마다 할당 · 탐색 = 포인터 따라가기
auto it = table.find(key);` },
                    after: { lang: "cpp", src: `std::vector<std::pair<int, Item>> table;   // 한 번 정렬, 이후 거의 불변
auto it = std::lower_bound(table.begin(), table.end(), key,
    [](const auto& e, int k) { return e.first < k; });
bool hit = it != table.end() && it->first == key;` },
                    gain: "같은 O(log n) · 캐시 미스·메모리 ↓",
                    note: "`std::map` 은 보통 **레드-블랙 트리(red-black tree)** · 삽입이 잦으면 정렬 배열은 O(n) 이동 · C++23 `std::flat_map` 이 이 구조"
                }
            ],
            glossary: [
                { term: "트리 회전", en: "Tree rotation", def: "부모·자식 관계를 바꿔 높이를 조정하는 O(1) 연산 · 중위 순서(BST 불변식)는 그대로" },
                { term: "중위 순회", en: "In-order traversal", def: "왼쪽 서브트리 → 노드 → 오른쪽 서브트리 · BST 에선 키가 오름차순으로 나옴" },
                { term: "AVL 트리", en: "AVL tree (Adelson-Velsky–Landis)", def: "모든 노드에서 좌우 높이 차 ≤ 1 · 조회가 많은 곳에 유리, 삽입·삭제 회전이 더 잦음" },
                { term: "레드-블랙 트리", en: "Red-black tree", def: "노드에 색 1비트 · 빨강 연속 금지 + 검은 높이 동일 → 높이 ≤ 2·log₂(n+1) · 리눅스 `rbtree`, `std::map`" },
                { term: "B+ 트리", en: "B+ tree", def: "값은 잎에만 두고 잎끼리 연결한 B-트리 변형 · 범위 조회가 빠름 · 데이터베이스 인덱스" }
            ],
            quiz: [
                { q: "빈 BST 에 1, 2, 3, 4, 5 를 순서대로 넣으면 높이(노드 수 기준)는?", options: ["5", "3", "4", "2"], a: 0, why: "매번 오른쪽 끝에 붙어 사슬이 됨 · 3 은 같은 키를 3, 2, 4, 1, 5 처럼 넣었을 때" },
                { q: "BST 를 중위 순회하면?", options: ["키 오름차순", "삽입한 순서", "층별(BFS) 순서", "루트 먼저, 잎 나중"], a: 0, why: "왼쪽 < 노드 < 오른쪽 을 그 순서로 방문 · 루트 먼저는 전위 순회" },
                { q: "자식이 둘인 노드를 지울 때 쓰는 후속자는?", options: ["오른쪽 서브트리의 가장 왼쪽", "왼쪽 서브트리의 가장 오른쪽", "오른쪽 자식 (바로 아래)", "부모 노드 (바로 위)"], a: 0, why: "다음으로 큰 키 · 왼쪽 자식이 없어 쉽게 빠짐 · 왼쪽 서브트리의 가장 오른쪽은 선행자(바로 앞 키)" },
                { q: "Rust `BTreeMap` 이 이진 트리 대신 B-트리를 쓰는 주된 이유는?", options: ["할당·캐시 미스를 줄이려고", "비교 횟수를 줄이려고", "최악 O(1) 검색을 위해", "해시 맵보다 늘 빨라서"], a: 0, why: "노드 하나에 키 여러 개를 연속으로 · Rust 문서: 비교는 오히려 **늘어남**, 캐시 효율과의 절충" },
                { q: "n 개 노드인 레드-블랙 트리 높이의 상한은?", options: ["2·log₂(n+1)", "1.44·log₂(n+2)", "log₂(n+1)", "n / 2"], a: 0, why: "빨강 연속 불가 + 검은 높이 동일 → 최장 경로 ≤ 최단 × 2 · 1.44 배는 더 엄격한 AVL 의 상한" },
                { type: "num", q: "빈 BST 에 50, 30, 70, 20, 40, 60, 80, 35, 45, 47 을 차례로 넣으면 높이(노드 수 기준)는?", answer: 5, why: "47 은 50 → 30 → 40 → 45 의 오른쪽 · 다섯째 층" },
                { type: "text", q: "8, 3, 10, 1, 6, 14, 4, 7, 13 을 넣은 BST 에서 3 을 지운 뒤 전위 순회(노드 → 왼쪽 → 오른쪽) 결과는?", answer: ["8 4 1 6 7 10 14 13"], why: "3 은 자식 둘 → 후속자 4(6 의 왼쪽)를 복사하고 원래 4 를 지움" },
                { type: "num", q: "B-트리 노드 하나가 자식 256 개를 가질 때, 키 10⁹ 개를 담는 트리의 높이(읽는 노드 수)는 최소?", answer: 4, why: "256³ ≈ 1.7×10⁷ < 10⁹ ≤ 256⁴ · log₂₅₆(10⁹) ≈ 3.7 → 4 · 이진 트리면 30" },
                { type: "order", q: "자식이 둘인 노드 x 를 삭제하는 순서", items: ["x 를 찾아 내려감", "x 의 오른쪽 자식으로 한 칸", "왼쪽 끝까지 내려가 후속자 찾기", "후속자 키를 x 에 복사", "원래 후속자 노드를 삭제"], why: "후속자는 왼쪽 자식이 없어 마지막 삭제는 잎이나 자식 하나 경우로 끝남" }
            ],
            refs: [
                { title: "Organization and maintenance of large ordered indexes", by: "Bayer et al.", year: 1972, url: "https://doi.org/10.1007/BF00288683", kind: "paper" },
                { title: "A dichromatic framework for balanced trees", by: "Guibas et al.", year: 1978, url: "https://doi.org/10.1109/SFCS.1978.3", kind: "paper" },
                { title: "Red-black Trees (rbtree) in Linux", by: "Landley", url: "https://docs.kernel.org/core-api/rbtree.html", kind: "doc" },
                { title: "BTreeMap in std::collections", by: "The Rust Project", url: "https://doc.rust-lang.org/std/collections/struct.BTreeMap.html", kind: "doc" }
            ]
        },
        {
            id: "ds-heap",
            title: "힙과 우선순위 큐",
            level: 2,
            mins: 14,
            pre: ["data-structures/ds-bst"],
            checked: "2026-11-16",
            key: [
                "이진 힙(binary heap): **힙 속성(heap property)** 부모 ≤ 자식 + **완전 이진 트리(complete binary tree)**",
                "배열에 층 순서로: 자식 `2i+1`·`2i+2`, 부모 `(i−1)/2` → 포인터가 필요 없음",
                "삽입은 끝에 넣고 위로(sift up), 꺼내기는 끝을 루트로 올려 아래로(sift down) · O(log n)",
                "**상향식 힙 구성(bottom-up heapify)**은 O(n) · 타이머·Dijkstra 의 **우선순위 큐(priority queue)**"
            ],
            concepts: [
                { term: "힙 속성", en: "Heap property", def: "min-heap: 모든 부모 ≤ 자식 · 형제끼리는 순서 없음 → 루트만 최솟값, 배열 전체는 정렬 아님" },
                { term: "완전 이진 트리", en: "Complete binary tree", def: "마지막 층만 왼쪽부터 채움 → 빈틈없는 배열 인덱스로 표현, 높이 ⌊log₂n⌋" },
                { term: "sift up / sift down", def: "위반한 원소를 부모와(위로) 또는 더 작은 자식과(아래로) 바꾸며 힙 속성 복구 · 최대 높이만큼" },
                { term: "우선순위 큐", en: "Priority queue", def: "가장 급한 것부터 꺼내는 추상 자료형 · 구현은 보통 이진 힙" },
                { term: "상향식 힙 구성", en: "Bottom-up heap construction (Floyd)", def: "마지막 부모부터 루트까지 sift down · 대부분 노드가 바닥 근처라 총 O(n)" }
            ],
            demo: { type: "sim", name: "heap", kind: "min", values: [40, 15, 30, 50, 10, 25, 35, 5] },
            code: [
                {
                    lang: "c",
                    title: "소프트웨어 타이머 = 최소 힙 (만료 시각 순)",
                    src: `#include <stdint.h>
#include <stdbool.h>

#define MAXT 16
struct tmr { uint32_t when; void (*fn)(void); };
static struct tmr h[MAXT];                 /* 배열 = 완전 이진 트리 */
static int n;

static bool before(uint32_t a, uint32_t b) {   /* 틱 넘침(wrap)에도 안전 */
    return (int32_t)(a - b) < 0;
}
static void swap(int a, int b) { struct tmr t = h[a]; h[a] = h[b]; h[b] = t; }

bool tmr_add(uint32_t when, void (*fn)(void)) {
    if (n == MAXT) return false;
    int i = n++;
    h[i] = (struct tmr){ when, fn };
    while (i > 0 && before(h[i].when, h[(i - 1) / 2].when)) {   /* sift up */
        swap(i, (i - 1) / 2);
        i = (i - 1) / 2;
    }
    return true;
}

void tmr_run(uint32_t now) {               /* 만료된 것만 꺼내 실행 */
    while (n > 0 && !before(now, h[0].when)) {
        struct tmr t = h[0];
        h[0] = h[--n];                     /* 마지막 원소를 루트로 */
        for (int i = 0;;) {                /* sift down */
            int c = 2 * i + 1;
            if (c >= n) break;
            if (c + 1 < n && before(h[c + 1].when, h[c].when)) c++;   /* 더 이른 자식 */
            if (!before(h[c].when, h[i].when)) break;
            swap(i, c);
            i = c;
        }
        t.fn();
    }
}`,
                    note: "`h[0]` 만 보면 다음 만료 시각 → 그때까지 슬립 가능(tickless) · 차이를 `int32_t` 로 보는 비교는 리눅스 `time_after()` 와 같은 아이디어"
                },
                {
                    lang: "python",
                    title: "heapq: heapify · 우선순위 큐 · top-k",
                    src: `import heapq, itertools

xs = [40, 15, 30, 50, 10, 25, 35, 5]
heapq.heapify(xs)                    # 제자리 O(n)
print(xs[0], xs)                     # 5 [5, 10, 25, 15, 40, 30, 35, 50] · 정렬은 아님

pq, seq = [], itertools.count()
def push(prio, task):                # (우선순위, 순번, 작업)
    heapq.heappush(pq, (prio, next(seq), task))

push(2, "log"); push(0, "irq"); push(1, "ctrl"); push(0, "uart")
while pq:
    prio, _, task = heapq.heappop(pq)
    print(prio, task)                # 0 irq · 0 uart · 1 ctrl · 2 log

print(heapq.nlargest(3, [7, 1, 9, 4, 8, 2]))   # [9, 8, 7]`,
                    note: "순번이 동순위를 FIFO 로 만들고 작업끼리 비교하는 일을 막음 · Python 3.14 부터 `heappush_max` 등 **최대 힙(max-heap)** 함수 추가 (이전엔 부호 반전)"
                }
            ],
            optimize: [
                {
                    title: "n 개로 힙 만들기: 하나씩 push → `heapify`",
                    before: { lang: "python", src: `h = []
for x in xs:
    heapq.heappush(h, x)      # n 번 × O(log n)` },
                    after: { lang: "python", src: `h = list(xs)
heapq.heapify(h)              # 마지막 부모부터 sift down: O(n)` },
                    gain: "O(n log n) → O(n)",
                    note: "비교 횟수 상한 약 2n · 노드 절반은 잎이라 내려갈 곳이 없음 (Floyd 1964)"
                },
                {
                    title: "상위 k 개: 전체 정렬 → 크기 k 힙",
                    before: { lang: "python", src: `top = sorted(scores, reverse=True)[:k]   # O(n log n)` },
                    after: { lang: "python", src: `top = heapq.nlargest(k, scores)           # O(n log k)` },
                    gain: "O(n log n) → O(n log k)",
                    note: "k 가 n 에 가까우면 `sorted` 가 낫고 k = 1 이면 `max()` (공식 문서 안내)"
                }
            ],
            glossary: [
                { term: "힙 정렬", en: "Heapsort", def: "최대 힙을 만든 뒤 루트를 끝과 바꾸며 줄여 감 · 제자리, 최악 O(n log n), 불안정 (Williams 1964)" },
                { term: "최대 힙", en: "Max-heap", def: "부모 ≥ 자식 · 루트가 최댓값 · 최소 힙과 비교 방향만 반대" },
                { term: "d-ary 힙", en: "d-ary heap", def: "자식이 d 개인 힙 · 높이가 낮아 sift up 이 빠르고 캐시에 유리, sift down 은 비교가 늘어남" },
                { term: "피보나치 힙", en: "Fibonacci heap", def: "decrease-key 분할상환 O(1) 인 힙 · Dijkstra 를 O(E + V log V) 로 (Fredman–Tarjan 1987) · 상수가 커 실무엔 드묾" },
                { term: "decrease-key", en: "Decrease-key operation", def: "힙 안 원소의 우선순위를 높임 · 이진 힙은 위치를 알아야 O(log n) sift up" }
            ],
            quiz: [
                { q: "0 기반 배열 힙에서 인덱스 5 의 부모와 자식은?", options: ["부모 2, 자식 11·12", "부모 2, 자식 10·11", "부모 3, 자식 10·11", "부모 2, 자식 12·13"], a: 0, why: "부모 (5−1)/2 = 2 · 자식 2·5+1 = 11, 2·5+2 = 12 · 10·11 은 1 기반 공식 `2i`, `2i+1`" },
                { q: "최소 힙에서 최솟값 확인 / 꺼내기 비용은?", options: ["O(1) / O(log n)", "O(log n) / O(log n)", "O(1) / O(1)", "O(n) / O(log n)"], a: 0, why: "루트를 보면 끝 · 꺼낸 뒤 sift down 은 높이만큼" },
                { q: "상향식 heapify 가 O(n) 인 이유는?", options: ["노드 대부분이 바닥 근처라서", "비교 없이 자리만 바꾸어서", "입력이 원래 반쯤 정렬돼 있어서", "sift up 만 써서"], a: 0, why: "높이 h 인 노드 ≈ n/2^(h+1) 개가 최대 h 층 → 합 O(n) · 하나씩 sift up 하면 O(n log n)" },
                { q: "최소 힙 배열을 앞에서부터 읽으면?", options: ["순서 보장 없음", "오름차순", "층마다 오름차순", "삽입한 순서"], a: 0, why: "부모 ≤ 자식만 보장 · 형제·사촌끼리는 순서 없음 · 예: [1, 3, 2]" },
                { q: "이진 힙을 쓴 Dijkstra 의 시간 복잡도는?", options: ["O((V+E) log V)", "O(E + V log V)", "O(V² log E)", "O(V·E log V)"], a: 0, why: "꺼내기 V 번 + 갱신 E 번, 각 O(log V) · O(E + V log V) 는 피보나치 힙" },
                { type: "text", q: "출력은?", code: { lang: "python", src: `import heapq
h = []
for x in [7, 3, 9, 1, 5]:
    heapq.heappush(h, x)
print(h)` }, answer: ["[1, 3, 9, 7, 5]", "1 3 9 7 5"], why: "1 이 [3] → [1] → [0] 으로 sift up · 5 는 부모 3 보다 커서 [4] 에 그대로" },
                { type: "num", q: "0 기반 배열 힙에서 인덱스 20 의 부모 인덱스는?", answer: 9, why: "(20 − 1) / 2 = 9 (정수 나눗셈) · 9 의 자식은 19, 20" },
                { type: "num", q: "원소 1000 개인 이진 힙의 높이(간선 기준)는?", answer: 9, why: "⌊log₂1000⌋ = 9 · 삽입·꺼내기의 교환은 최대 9 번" },
                { type: "order", q: "최소 힙에서 루트 꺼내기(pop) 순서", items: ["루트 값을 따로 저장", "마지막 원소를 루트 자리로", "두 자식 중 더 작은 쪽 고르기", "부모가 더 크면 교환하고 반복"], why: "끝 원소를 올려 빈틈을 없앤 뒤 sift down · 더 작은 자식과 바꿔야 속성이 유지됨" }
            ],
            refs: [
                { title: "Algorithm 232: Heapsort", by: "Williams", year: 1964, url: "https://doi.org/10.1145/512274.3734138", kind: "paper" },
                { title: "Algorithm 245: Treesort", by: "Floyd", year: 1964, url: "https://doi.org/10.1145/355588.365103", kind: "paper" },
                { title: "heapq — Heap queue algorithm", by: "Python Software Foundation", url: "https://docs.python.org/3/library/heapq.html", kind: "doc" },
                { title: "Min Heap API", by: "Chiu", url: "https://docs.kernel.org/core-api/min_heap.html", kind: "doc" }
            ]
        },
        {
            id: "ds-sort",
            title: "정렬 알고리즘",
            level: 2,
            mins: 16,
            pre: ["data-structures/ds-heap"],
            checked: "2026-11-16",
            key: [
                "삽입 정렬(insertion sort): O(n²) 지만 작거나 거의 정렬된 입력엔 가장 빠름",
                "병합 정렬(merge sort): 항상 O(n log n) · **안정 정렬(stable sort)** · 보조 메모리 O(n)",
                "퀵 정렬(quicksort): 평균 O(n log n) · **제자리 정렬(in-place sort)** · 나쁜 피벗(pivot)이면 O(n²)",
                "libstdc++ `std::sort` = **인트로 정렬(introsort)**: 퀵 → 깊으면 힙 정렬(heapsort) → 작은 구간은 삽입"
            ],
            concepts: [
                { term: "안정 정렬", en: "Stable sort", def: "같은 키의 원래 순서 유지 · 여러 키로 차례로 정렬할 때 필요 · Python `sorted`, `std::stable_sort`" },
                { term: "제자리 정렬", en: "In-place sort", def: "보조 메모리 O(1)~O(log n) · 퀵·힙·삽입은 제자리, 병합은 O(n) 추가" },
                { term: "인트로 정렬", en: "Introsort (introspective sort)", def: "재귀 깊이가 2·⌊log₂n⌋ 을 넘으면 힙 정렬로 전환 → 퀵의 평균 속도 + 최악 O(n log n) (Musser 1997)" },
                { term: "비교 정렬 하한", en: "Comparison-sort lower bound", def: "n! 가지 순서를 가르는 결정 트리 → 높이 ≥ log₂n! ≈ n log₂n − 1.44n" },
                { term: "기수 정렬", en: "Radix sort", def: "자릿수마다 안정한 계수 정렬 · 비교 없이 O(d·(n + b)) · 짧은 정수 키에 강함" }
            ],
            demo: { type: "sim", name: "sort", algo: "quick", n: 32, input: "random" },
            code: [
                {
                    lang: "cpp",
                    title: "인트로 정렬 뼈대",
                    src: `#include <algorithm>
#include <cmath>
#include <vector>

using It = std::vector<int>::iterator;

static void intro(It lo, It hi, int depth) {
    while (hi - lo > 16) {
        if (depth-- == 0) {                    // 너무 깊음 = 피벗 운이 계속 나쁨
            std::make_heap(lo, hi);            // → 힙 정렬로 최악 O(n log n)
            std::sort_heap(lo, hi);
            return;
        }
        int a = *lo, b = *(lo + (hi - lo) / 2), c = *(hi - 1);
        int p = std::max(std::min(a, b), std::min(std::max(a, b), c));   // 셋의 중앙값
        It m1 = std::partition(lo, hi, [p](int x) { return x < p; });
        It m2 = std::partition(m1, hi, [p](int x) { return x == p; });  // 같은 값 묶기
        intro(m2, hi, depth);                  // p 보다 큰 쪽은 재귀
        hi = m1;                               // 작은 쪽은 반복으로
    }
    for (It i = lo; i < hi; ++i)               // 16개 이하: 삽입 정렬
        std::rotate(std::upper_bound(lo, i, *i), i, i + 1);
}

void introsort(std::vector<int>& v) {
    if (v.size() > 1) intro(v.begin(), v.end(), 2 * (int)std::log2(v.size()));
}`,
                    note: "libstdc++ `std::sort` 도 같은 뼈대: 깊이 한도 2·⌊log₂n⌋, 16개 이하는 마지막에 삽입 정렬 · 같은 값 묶기 = **3중 분할(three-way partitioning)**"
                },
                {
                    lang: "python",
                    title: "안정 정렬 활용 · 계수 정렬",
                    src: `from operator import itemgetter

rows = [("park", 2), ("lee", 1), ("kim", 2), ("choi", 1)]
by_name = sorted(rows, key=itemgetter(0))
by_score = sorted(by_name, key=itemgetter(1))   # 안정: 같은 점수는 이름 순서 유지
print(by_score)   # [('choi', 1), ('lee', 1), ('kim', 2), ('park', 2)]

def counting_sort(xs, k):            # 0 ≤ x < k 인 정수
    cnt = [0] * k
    for x in xs:
        cnt[x] += 1                  # 비교 없이 개수만 셈
    out = []
    for v, c in enumerate(cnt):
        out += [v] * c
    return out                       # O(n + k)

print(counting_sort([3, 1, 4, 1, 5, 9, 2, 6], 10))   # [1, 1, 2, 3, 4, 5, 6, 9]`,
                    note: "**계수 정렬(counting sort)**: 비교 0 회 · 자릿수마다 반복하면 **기수 정렬(radix sort)** · Python `sorted` 는 Timsort 계열 안정 정렬"
                }
            ],
            optimize: [
                {
                    title: "비교 함수 → `key` 함수 (키를 한 번만 계산)",
                    before: { lang: "python", src: `from functools import cmp_to_key
files.sort(key=cmp_to_key(
    lambda a, b: os.path.getsize(a) - os.path.getsize(b)))   # 비교마다 2번 계산` },
                    after: { lang: "python", src: `files.sort(key=os.path.getsize)    # 파일마다 1번 계산 후 정렬` },
                    gain: "getsize 호출 ≈ 2·n·log₂n → n",
                    note: "Python 은 key 값을 먼저 전부 계산해 둠 · 키가 비쌀수록 이득"
                },
                {
                    title: "32비트 정수 대량 정렬: 비교 정렬 → 바이트 단위 기수 정렬",
                    before: { lang: "cpp", src: `std::sort(a.begin(), a.end());       // 비교 O(n log n)` },
                    after: { lang: "cpp", src: `void radix_sort(std::vector<uint32_t>& a) {
    std::vector<uint32_t> tmp(a.size());
    for (int shift = 0; shift < 32; shift += 8) {          // 바이트 4개 = 4 패스
        std::size_t cnt[257] = {0};
        for (uint32_t x : a) cnt[((x >> shift) & 0xFF) + 1]++;
        for (int i = 0; i < 256; i++) cnt[i + 1] += cnt[i];   // 시작 위치
        for (uint32_t x : a) tmp[cnt[(x >> shift) & 0xFF]++] = x;   // 안정
        a.swap(tmp);
    }
}` },
                    gain: "비교 n·log₂n 회 → 4 패스 × n",
                    note: "보조 배열 n 개 필요 · 짧은 정수 키일 때만 · 작은 n 은 `std::sort` 가 빠를 수 있어 실측 필요"
                }
            ],
            glossary: [
                { term: "피벗", en: "Pivot", def: "퀵 정렬이 구간을 작은 쪽·큰 쪽으로 나누는 기준값 · 셋의 중앙값·무작위로 골라 최악을 피함" },
                { term: "계수 정렬", en: "Counting sort", def: "값마다 개수를 세어 누적합으로 자리를 정함 · O(n + k), k = 값의 범위 · 누적 방식은 안정" },
                { term: "역순 쌍", en: "Inversion", def: "i < j 인데 a[i] > a[j] 인 쌍 · 삽입 정렬 비용 = O(n + 역순 쌍 수)" },
                { term: "3중 분할", en: "Three-way partitioning (Dutch national flag)", def: "< p, = p, > p 세 구간으로 나눔 · 중복 키가 많을 때 퀵 정렬이 O(n²) 로 빠지는 것을 막음" },
                { term: "Timsort", en: "Timsort (adaptive natural merge sort)", def: "이미 정렬된 구간(run)을 찾아 병합하는 안정 정렬 · 거의 정렬된 입력에 O(n) 근접 · CPython `list.sort` (3.11 부터 병합 순서는 Powersort)" }
            ],
            quiz: [
                { q: "이미 정렬된 배열에 가장 빠른 것은?", options: ["삽입 정렬", "선택 정렬", "끝 원소 피벗 퀵 정렬", "힙 정렬"], a: 0, why: "원소마다 비교 1번 후 멈춤 → O(n) · 끝 원소 피벗 퀵은 오히려 O(n²)" },
                { q: "안정 정렬이 **아닌** 것은?", options: ["병합 정렬", "삽입 정렬", "힙 정렬", "누적 방식 계수 정렬"], a: 2, why: "루트와 끝을 바꾸며 같은 키의 순서가 뒤섞임 · 계수 정렬은 뒤에서부터 채우면 안정" },
                { q: "인트로 정렬이 힙 정렬로 바꾸는 시점은?", options: ["재귀 깊이 > 2·⌊log₂n⌋", "구간이 16개 이하로 줄었을 때", "피벗이 최솟값일 때마다", "입력이 이미 정렬됐을 때"], a: 0, why: "깊어진다 = 분할이 계속 쏠린다는 신호 · 16개 이하는 삽입 정렬로 넘기는 조건" },
                { q: "비교 기반 정렬의 최악 비교 횟수 하한은?", options: ["Ω(n log n)", "Ω(n + k)", "Ω(n²/2)", "Ω(n log k)"], a: 0, why: "n! 가지 순서를 가르는 결정 트리 높이 ≥ log₂n! · n + k 는 비교하지 않는 계수 정렬" },
                { q: "기수 정렬이 Ω(n log n) 하한에 걸리지 않는 이유는?", options: ["키를 비교 없이 자릿수로 분배", "여러 코어에서 병렬로 실행해서", "보조 배열로 메모리를 더 써서", "정렬된 run 을 찾아 병합"], a: 0, why: "하한은 '비교'만 쓰는 정렬에 대한 것 · 메모리를 더 써도 비교 정렬이면 하한은 그대로" },
                { type: "num", q: "삽입 정렬로 [5, 2, 4, 6, 1, 3] 을 정렬할 때 원소 이동(한 칸 밀기) 횟수는?", answer: 9, unit: "번", why: "이동 1번 = 역순 쌍 1개 제거 · 역순 쌍 9개: (5,2) (5,4) (5,1) (5,3) (2,1) (4,1) (4,3) (6,1) (6,3)" },
                { type: "num", q: "끝 원소를 피벗으로 쓰는 퀵 정렬(Lomuto)에 이미 정렬된 [1..10] 을 넣으면 비교 횟수는?", answer: 45, unit: "번", why: "피벗이 매번 최댓값 → 9 + 8 + … + 1 = n(n−1)/2 = 45" },
                { type: "text", q: "출력은?", code: { lang: "python", src: `rows = [("b", 2), ("a", 1), ("c", 2), ("d", 1)]
print(" ".join(n for n, _ in sorted(rows, key=lambda r: r[1])))` }, answer: ["a d b c"], why: "안정 정렬: 같은 점수 안에서는 원래 순서(a 다음 d, b 다음 c)를 유지" },
                { type: "order", q: "삽입 정렬로 [4, 3, 1, 2] 를 정렬할 때 각 패스가 끝난 배열", items: ["3 4 1 2", "1 3 4 2", "1 2 3 4"], why: "패스 i 는 a[i] 를 왼쪽 정렬 구간의 제자리로 · 3 → 1 → 2 순서로 끼움" }
            ],
            refs: [
                { title: "Quicksort", by: "Hoare", year: 1962, url: "https://doi.org/10.1093/comjnl/5.1.10", kind: "paper" },
                { title: "Introspective Sorting and Selection Algorithms", by: "Musser", year: 1997, url: "https://doi.org/10.1002/(SICI)1097-024X(199708)27:8%3C983::AID-SPE117%3E3.0.CO;2-%23", kind: "paper" },
                { title: "listsort.txt — timsort design notes", by: "Peters", url: "https://github.com/python/cpython/blob/main/Objects/listsort.txt", kind: "doc" },
                { title: "std::sort", by: "cppreference.com", url: "https://en.cppreference.com/w/cpp/algorithm/sort", kind: "doc" }
            ]
        },
        {
            id: "ds-graph",
            title: "그래프와 탐색",
            level: 3,
            mins: 18,
            pre: ["data-structures/ds-ring", "data-structures/ds-heap"],
            checked: "2026-11-17",
            key: [
                "그래프(graph) = 정점(vertex) + 간선(edge) · 도로망, 빌드 의존성, 상태 공간",
                "인접 리스트(adjacency list) 메모리 O(V+E) · 인접 행렬(adjacency matrix) O(V²) · 희소하면 리스트",
                "BFS(breadth-first search)는 큐, DFS(depth-first search)는 스택·재귀 · 가중치 없으면 BFS 가 최단",
                "Dijkstra 는 우선순위 큐로 가까운 정점부터 확정 · **위상 정렬(topological sort)** = 빌드 순서"
            ],
            concepts: [
                { term: "인접 리스트", en: "Adjacency list", def: "정점마다 이웃 배열 · 메모리 O(V+E) · 이웃 순회가 차수만큼 · 고정 그래프는 CSR 로 압축" },
                { term: "인접 행렬", en: "Adjacency matrix", def: "V×V 표 · 간선 확인 O(1) · 메모리 O(V²) → 밀집 그래프나 작은 V 용" },
                { term: "BFS / DFS", en: "Breadth-first / Depth-first search", def: "BFS: 큐로 가까운 층부터 · DFS: 스택으로 한 갈래 끝까지 · 둘 다 O(V+E)" },
                { term: "위상 정렬", en: "Topological sort", def: "DAG 의 정점을 '의존 대상이 먼저' 순서로 · Kahn: 진입 차수 0 인 정점을 큐로 꺼냄" },
                { term: "Dijkstra + 힙", en: "Dijkstra's algorithm with a binary heap", def: "음수 없는 가중치 최단 경로 · 가장 가까운 미확정 정점을 힙에서 꺼내 확정 · O((V+E) log V)" }
            ],
            demo: { type: "sim", name: "graph", algo: "bfs", src: "A" },
            code: [
                {
                    lang: "python",
                    title: "인접 리스트 위의 BFS 와 Dijkstra",
                    src: `import heapq
from collections import deque

G = {                                # 인접 리스트: 정점 → [(이웃, 가중치)]
    "A": [("B", 4), ("C", 1)],
    "B": [("D", 1)],
    "C": [("B", 2), ("D", 5)],
    "D": [],
}

def bfs(g, s):                       # 가중치 무시 · 간선 수 최단
    dist, q = {s: 0}, deque([s])
    while q:
        u = q.popleft()
        for v, _ in g[u]:
            if v not in dist:        # 넣을 때 방문 표시
                dist[v] = dist[u] + 1
                q.append(v)
    return dist

def dijkstra(g, s):                  # 가중치 ≥ 0 일 때
    dist, pq = {s: 0}, [(0, s)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue                 # 낡은 항목은 버림
        for v, w in g[u]:
            nd = d + w
            if nd < dist.get(v, float("inf")):
                dist[v] = nd         # 더 짧은 길 발견 → 갱신 후 push
                heapq.heappush(pq, (nd, v))
    return dist

print(bfs(G, "A"))        # {'A': 0, 'B': 1, 'C': 1, 'D': 2}
print(dijkstra(G, "A"))   # {'A': 0, 'B': 3, 'C': 1, 'D': 4}  (A→C→B→D)`,
                    note: "**간선 완화(edge relaxation)**: `dist[u] + w < dist[v]` 면 갱신 · heapq 엔 decrease-key 가 없어 '중복 push + 낡은 항목 버리기'가 표준 패턴"
                },
                {
                    lang: "python",
                    title: "Kahn 위상 정렬 = 빌드 순서",
                    src: `from collections import deque
from graphlib import TopologicalSorter

deps = {                             # 타깃: 먼저 만들어야 하는 것들
    "app": {"main.o", "util.o"},
    "main.o": {"main.c", "util.h"},
    "util.o": {"util.c", "util.h"},
}

def kahn(deps):
    nodes = set(deps) | {d for ds in deps.values() for d in ds}
    indeg = {n: len(deps.get(n, ())) for n in nodes}   # 아직 안 끝난 의존 수
    users = {n: [] for n in nodes}
    for t, ds in deps.items():
        for d in ds:
            users[d].append(t)       # d 가 끝나면 t 의 의존이 하나 줄어듦
    q = deque(sorted(n for n in nodes if indeg[n] == 0))
    order = []
    while q:
        n = q.popleft()
        order.append(n)
        for t in users[n]:
            indeg[t] -= 1
            if indeg[t] == 0:
                q.append(t)
    if len(order) != len(nodes):
        raise ValueError("순환 의존")   # 사이클이 있으면 0 이 안 되는 정점이 남음
    return order

print(kahn(deps))   # ['main.c', 'util.c', 'util.h', 'main.o', 'util.o', 'app']
print(list(TopologicalSorter(deps).static_order()))   # 표준 라이브러리 · 순서는 여럿 가능`,
                    note: "**진입 차수(in-degree)** 0 = 지금 만들 수 있는 것 · 큐에 같이 있는 것들은 병렬 빌드 가능 (`make -j`)"
                }
            ],
            optimize: [
                {
                    title: "희소 그래프: 인접 행렬 → 인접 리스트",
                    before: { lang: "python", src: `adj = [[0] * V for _ in range(V)]      # V² 칸
for u, v in edges:
    adj[u][v] = adj[v][u] = 1
# 이웃 찾기: for v in range(V): if adj[u][v] → 정점마다 O(V)` },
                    after: { lang: "python", src: `adj = [[] for _ in range(V)]           # V + 2E 칸
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)
# 이웃 찾기: for v in adj[u] → 차수만큼` },
                    gain: "V=10⁵, E=3×10⁵: 10¹⁰ 칸 → 약 7×10⁵ 칸 · BFS O(V²) → O(V+E)",
                    note: "격자 지도는 이웃을 좌표로 계산 → 그래프를 따로 저장하지 않음 (A* 실험의 방식)"
                },
                {
                    title: "고정된 그래프: 간선 노드 리스트 → CSR 배열 두 개",
                    before: { lang: "c", src: `struct edge { uint32_t to; struct edge *next; };
struct edge *adj[V];                /* 간선마다 malloc · 순회 = 포인터 추적 */
for (struct edge *e = adj[u]; e; e = e->next) visit(e->to);` },
                    after: { lang: "c", src: `uint32_t off[V + 1];                /* u 의 이웃 = dst[off[u] .. off[u+1]) */
uint32_t dst[E];                    /* 모든 이웃을 한 배열에 연속 */
for (uint32_t i = off[u]; i < off[u + 1]; i++) visit(dst[i]);` },
                    gain: "할당 E 번 → 0 · 간선당 포인터 8 B 절약",
                    note: "도로망·메시처럼 잘 안 바뀌는 그래프용 · 간선 추가가 잦으면 다시 구성해야 함"
                }
            ],
            glossary: [
                { term: "진입 차수", en: "In-degree", def: "정점으로 들어오는 간선 수 · 위상 정렬에선 '아직 안 끝난 의존 수'" },
                { term: "DAG", en: "Directed Acyclic Graph", def: "사이클 없는 방향 그래프 · 위상 순서가 존재 · 빌드 의존성, 작업 스케줄, 계산 그래프" },
                { term: "CSR", en: "Compressed Sparse Row", def: "`off[V+1]` + `dst[E]` 두 배열로 인접 리스트를 연속 저장 · 희소 행렬과 같은 형식" },
                { term: "간선 완화", en: "Edge relaxation", def: "`dist[u] + w(u,v) < dist[v]` 이면 `dist[v]` 갱신 · Dijkstra·Bellman-Ford 의 기본 연산" },
                { term: "연결 요소", en: "Connected component", def: "서로 경로로 이어진 정점들의 최대 묶음 · BFS/DFS 를 정점마다 한 번씩 돌려 O(V+E) 에 찾음" }
            ],
            quiz: [
                { q: "정점 10만, 간선 30만인 도로망에 맞는 표현은?", options: ["인접 리스트", "인접 행렬", "간선 목록 배열만", "완전 그래프로 변환"], a: 0, why: "행렬은 10¹⁰ 칸 · 리스트는 V + 2E ≈ 7×10⁵ · 간선 목록만으로는 이웃 찾기가 O(E)" },
                { q: "가중치 없는 그래프에서 간선 수 기준 최단 경로를 찾는 것은?", options: ["BFS (큐)", "DFS (스택)", "위상 정렬", "Dijkstra 만 가능"], a: 0, why: "가까운 층부터 퍼지므로 처음 닿은 거리가 최단 · Dijkstra 도 되지만 힙이 필요 없음" },
                { q: "Dijkstra 가 틀릴 수 있는 경우는?", options: ["음수 가중치 간선이 있을 때", "사이클이 있는 그래프일 때", "간선 가중치가 모두 같을 때", "무방향 그래프일 때"], a: 0, why: "확정한 정점이 나중에 음수 간선으로 더 짧아질 수 있음 → Bellman-Ford · 양수 사이클은 문제없음" },
                { q: "Kahn 위상 정렬이 모든 정점을 출력하지 못했다면?", options: ["그래프에 사이클이 있다", "그래프가 희소하다", "가중치가 음수다", "정상 — 순서가 여러 개라서"], a: 0, why: "사이클 위 정점은 진입 차수가 끝까지 0 이 안 됨 · 순서가 여럿이어도 정점은 모두 나옴" },
                { q: "BFS 에서 방문 표시를 '꺼낼 때'가 아니라 '넣을 때' 하는 이유는?", options: ["같은 정점을 큐에 두 번 넣지 않게", "DFS 와 같은 방문 순서를 얻으려고", "큐 대신 스택으로도 돌게 하려고", "간선 가중치를 거리에 넣으려고"], a: 0, why: "꺼낼 때 표시하면 그 사이 다른 이웃이 같은 정점을 또 넣음 · 거리는 어느 쪽이든 맞음" },
                { type: "num", q: "무방향 간선 1–2, 1–3, 2–4, 3–4, 4–5, 5–6, 3–6 인 그래프에서 정점 1 → 6 의 BFS 거리(간선 수)는?", answer: 2, why: "1 → 3 → 6 · 1 → 2 → 4 → 5 → 6 은 4 로 더 김" },
                { type: "num", q: "레슨 코드의 그래프에서 C→B 가중치만 2 → 4 로 바꾸면 Dijkstra 의 `dist[D]` 는?", answer: 5, why: "B = min(4, 1 + 4) = 4 → D = min(4 + 1, 1 + 5) = 5 (A→B→D)" },
                { type: "text", q: "출력은?", code: { lang: "python", src: `G = {"A": ["B", "C"], "B": ["D"], "C": ["D", "E"], "D": [], "E": []}
seen, out = set(), []
def dfs(u):
    seen.add(u); out.append(u)
    for v in G[u]:
        if v not in seen:
            dfs(v)
dfs("A")
print(" ".join(out))` }, answer: ["A B D C E"], why: "B 로 끝까지(D) 들어갔다가 돌아와 C · D 는 이미 방문이라 E 만" },
                { type: "order", q: "인접 리스트 A: [D, B], B: [E], D: [C, E], C: [F], E: [F] 에서 A 부터 BFS 로 방문(꺼내는) 순서", items: ["A", "D", "B", "C", "E", "F"], why: "이웃은 리스트 순서대로 넣음 · 1층 D, B → 2층 C, E (E 는 D 가 먼저 넣음) → 3층 F" },
                { type: "text", q: "무방향 간선 A–B, A–C, B–D, C–D, C–E, D–F, E–F. 이웃을 알파벳 순으로 보는 DFS 를 A 에서 시작한 방문 순서는? (공백 없이)", answer: ["ABDCEF"], why: "A → B → D(B 의 다음 이웃) → C(D 의 이웃 중 미방문 첫째) → E → F · 한 갈래를 끝까지 · 실험에서 DFS 로 확인" }
            ],
            refs: [
                { title: "A note on two problems in connexion with graphs", by: "Dijkstra", year: 1959, url: "https://doi.org/10.1007/BF01386390", kind: "paper" },
                { title: "Topological sorting of large networks", by: "Kahn", year: 1962, url: "https://doi.org/10.1145/368996.369025", kind: "paper" },
                { title: "Fibonacci heaps and their uses in improved network optimization algorithms", by: "Fredman et al.", year: 1987, url: "https://doi.org/10.1145/28869.28874", kind: "paper" },
                { title: "graphlib — Functionality to operate with graph-like structures", by: "Python Software Foundation", url: "https://docs.python.org/3/library/graphlib.html", kind: "doc" }
            ]
        }
    ]
});
