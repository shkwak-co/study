LAB.track({
    id: "languages",
    name: "프로그램 언어",
    icon: "λ",
    color: "#a78bfa",
    tagline: "C, C++, Rust, Python — 메모리와 실행 모델로 이해하기",
    trends: [
        {
            title: "Free-threaded Python",
            when: "2025–2026",
            points: [
                "3.13 실험 → 3.14 (2025-10) **공식 지원** (PEP 779) · 여전히 선택형(opt-in) 별도 빌드",
                "3.15 (2026-10-09): free-threaded 용 안정 ABI(stable ABI) `abi3t` (PEP 803) · macOS 설치본에 기본 포함",
                "기본 빌드 전환(Phase III)은 미정 · 단일 스레드 오버헤드 평균 약 1–8% (공식 문서)"
            ],
            refs: [
                { title: "PEP 779 – Criteria for supported status for free-threaded Python", by: "Wouters et al.", year: 2025, url: "https://peps.python.org/pep-0779/", kind: "spec" },
                { title: "PEP 803 – “abi3t”: Stable ABI for Free-Threaded Builds", by: "Viktorin et al.", year: 2025, url: "https://peps.python.org/pep-0803/", kind: "spec" },
                { title: "What's New In Python 3.15", by: "Python Software Foundation", year: 2026, url: "https://docs.python.org/3.15/whatsnew/3.15.html", kind: "doc" },
                { title: "Python support for free threading", by: "Python Software Foundation", url: "https://docs.python.org/3/howto/free-threading-python.html", kind: "doc" }
            ]
        },
        {
            title: "Rust, 리눅스 커널 정식 언어로",
            when: "2025–2026",
            points: [
                "2025-12 Maintainers Summit: 커널 Rust 의 '실험'(experimental) 꼬리표 제거",
                "Android 16 (커널 6.12) 기기가 Rust 로 쓴 ashmem 모듈을 탑재해 출하",
                "2026: 커널 최소 rustc 1.78 → **1.85** (Debian stable 기준) · 일부 아키텍처는 아직 미지수",
                "Rust 2024 에디션(edition, 1.85): `if let` 임시값(temporary)이 `else` 전에 drop 되는 등 해제 시점 변화"
            ],
            refs: [
                { title: "The state of the kernel Rust experiment", by: "LWN.net", year: 2025, url: "https://lwn.net/Articles/1050174/", kind: "doc" },
                { title: "Minimal requirements to compile the Kernel", by: "Linux kernel community", url: "https://docs.kernel.org/process/changes.html", kind: "doc" },
                { title: "Rust 2024 — The Rust Edition Guide", by: "Rust Project", url: "https://doc.rust-lang.org/edition-guide/rust-2024/index.html", kind: "doc" }
            ]
        },
        {
            title: "C++26 확정",
            when: "2026",
            points: [
                "2026-03 런던(Croydon) 회의에서 기술 작업 완료 → DIS 투표 후 ISO 발행",
                "리플렉션(reflection), contracts, `std::execution` · 초기화 안 된 지역 변수(local variable) 읽기: UB → **erroneous behaviour** (P2795)",
                "표준 라이브러리 hardening (P3471) · GCC 16 이 리플렉션(`-freflection`)·contracts 구현"
            ],
            refs: [
                { title: "C++26 is done! — Trip report: March 2026 ISO C++ standards meeting (London Croydon, UK)", by: "Sutter", year: 2026, url: "https://herbsutter.com/2026/03/29/c26-is-done-trip-report-march-2026-iso-c-standards-meeting-london-croydon-uk/", kind: "doc" },
                { title: "P2795R5: Erroneous behaviour for uninitialized reads", by: "Köppe", year: 2024, url: "https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2024/p2795r5.html", kind: "paper" },
                { title: "P3471R4: Standard library hardening", by: "Varlamov et al.", year: 2025, url: "https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2025/p3471r4.html", kind: "paper" },
                { title: "GCC 16 Release Series — Changes, New Features, and Fixes", by: "GNU Project", year: 2026, url: "https://gcc.gnu.org/gcc-16/changes.html", kind: "doc" }
            ]
        },
        {
            title: "C: C23 기본값, C2y 진행 중",
            when: "2025–2026",
            points: [
                "GCC 15: C 기본 표준 `gnu17` → `gnu23` · named loops, `if` 선언 등 C2y 일부 선구현",
                "C2y 작업 초안(working draft) N3998 (2026-10) · 아직 발행 전",
                "`defer` 자원 정리(resource cleanup)는 별도 TS 25755 로 작업 중"
            ],
            refs: [
                { title: "WG14 — Projects (C2y working draft, TS 25755)", by: "ISO/IEC JTC1/SC22/WG14", url: "https://www.open-std.org/jtc1/sc22/wg14/www/projects", kind: "spec" },
                { title: "GCC 15 Release Series — Changes, New Features, and Fixes", by: "GNU Project", year: 2025, url: "https://gcc.gnu.org/gcc-15/changes.html", kind: "doc" }
            ]
        },
        {
            title: "메모리 안전(memory safety) 가이드",
            when: "2025–2026",
            points: [
                "NSA·CISA 2025-06 공동 지침: 메모리 안전 언어(MSL) 채택 권고",
                "CISA: 기존 C/C++ 제품은 2025 년 말까지 메모리 안전 로드맵 공개 권고",
                "C++29 (2026-03 일정 채택): 메모리 안전이 주 목표 · 안전 프로파일(safety profile) 작업",
                "현실적 경로: 새 코드는 MSL, 기존 코드는 hardening·sanitizer 로 점진 전환"
            ],
            refs: [
                { title: "Memory Safe Languages: Reducing Vulnerabilities in Modern Software Development", by: "NSA & CISA", year: 2025, url: "https://www.cisa.gov/resources-tools/resources/memory-safe-languages-reducing-vulnerabilities-modern-software-development", kind: "doc" },
                { title: "Product Security Bad Practices", by: "CISA", year: 2025, url: "https://www.cisa.gov/resources-tools/resources/product-security-bad-practices", kind: "doc" },
                { title: "C++26 is done! — Trip report: March 2026 ISO C++ standards meeting (London Croydon, UK)", by: "Sutter", year: 2026, url: "https://herbsutter.com/2026/03/29/c26-is-done-trip-report-march-2026-iso-c-standards-meeting-london-croydon-uk/", kind: "doc" }
            ]
        },
        {
            title: "AI 코딩 시대의 타입 있는 언어",
            when: "2025–2026",
            points: [
                "Octoverse 2025: 2025-08 TypeScript 가 **월간 기여자 수**로 GitHub 1위 (약 264만, Python·JavaScript 추월)",
                "GitHub 의 해석: 타입이 에이전트가 쓴 코드의 오류를 일찍 잡음 · 상관관계이며 인과는 입증 안 됨",
                "Rust 로 쓴 Python **타입 검사기(type checker)**: Pyrefly 1.0 안정판 (2026-05-12) · ty 는 아직 베타 0.0.x (2026-11)",
                "LLM + **형식 검증(formal verification)**: DafnyBench 750+ 프로그램, 검증 주석 채우기 최고 68% (2024)"
            ],
            refs: [
                { title: "Octoverse: A new developer joins GitHub every second as AI leads TypeScript to #1", by: "GitHub", year: 2025, url: "https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/", kind: "doc" },
                { title: "Pyrefly v1.0.0 release notes", by: "Meta", year: 2026, url: "https://github.com/facebook/pyrefly/releases/tag/1.0.0", kind: "doc" },
                { title: "ty — PyPI", by: "Astral", url: "https://pypi.org/project/ty/", kind: "doc" },
                { title: "DafnyBench: A Benchmark for Formal Software Verification", by: "Loughridge et al.", year: 2024, url: "https://arxiv.org/abs/2406.08467", kind: "paper" }
            ]
        }
    ],
    lessons: [
        {
            id: "c-pointer",
            title: "C 포인터와 메모리",
            level: 1,
            mins: 14,
            checked: "2026-11-16",
            key: [
                "포인터(pointer) = **주소(address)를 담은 변수** · `*p` 는 그 주소의 값",
                "지역 변수(local variable)는 스택(stack): 함수 끝나면 소멸 · `malloc` 은 힙(heap): 직접 `free`",
                "`free` 후 포인터는 **dangling** · 다시 쓰면 UB",
                "`p + 1` 은 1바이트가 아니라 `sizeof(*p)` 만큼 이동"
            ],
            concepts: [
                { term: "스택", en: "Stack", def: "함수 호출마다 프레임 생성 · return 시 자동 소멸 · 크기 작음 (수 MB)" },
                { term: "힙", en: "Heap", def: "`malloc`/`free` 로 수명을 직접 관리 · 크고 유연하지만 실수에 취약" },
                { term: "포인터 산술", en: "Pointer arithmetic", def: "`p[i] == *(p + i)` · 원소 크기 단위로 이동" },
                { term: "UB", en: "Undefined Behavior", def: "표준이 결과를 정하지 않음 · 컴파일러는 '일어나지 않는다'고 가정하고 최적화" },
                { term: "배열 decay", en: "Array-to-pointer decay", def: "함수 인자로 넘긴 배열은 첫 원소 포인터 · 길이 정보 사라짐" }
            ],
            demo: {
                type: "sim",
                name: "memory",
                lang: "c",
                code: `#include <stdlib.h>

int main(void) {
    int x = 10;
    int *p = &x;
    *p = 20;
    int *h = malloc(sizeof *h);
    *h = 42;
    free(h);
    // *h = 7;   ✗ use-after-free (UB)
    h = NULL;
    return 0;
}`,
                steps: [
                    { line: 4, stack: [{ fn: "main", vars: [["x", "10"]] }], heap: [], text: "지역 변수 `x` 는 main 의 **스택 프레임**(stack frame)에" },
                    { line: 5, stack: [{ fn: "main", vars: [["x", "10"], ["p", "&x"]] }], heap: [], text: "`p` 는 x 의 **주소**를 값으로 가짐" },
                    { line: 6, stack: [{ fn: "main", vars: [["x", "20"], ["p", "&x"]] }], heap: [], text: "`*p = 20` → 주소를 따라가 x 자체를 수정" },
                    { line: 7, stack: [{ fn: "main", vars: [["x", "20"], ["p", "&x"], ["h", "→0x5000"]] }], heap: [["0x5000", "?"]], text: "`malloc`: 힙에 int 하나 · 초기화 안 됨 → 쓰레기값(garbage value)" },
                    { line: 8, stack: [{ fn: "main", vars: [["x", "20"], ["p", "&x"], ["h", "→0x5000"]] }], heap: [["0x5000", "42"]], text: "`*h = 42` → 힙 블록에 기록" },
                    { line: 9, stack: [{ fn: "main", vars: [["x", "20"], ["p", "&x"], ["h", "→0x5000"]] }], heap: [["0x5000", "freed"]], text: "`free(h)`: 블록 반환 · h 는 여전히 옛 주소 → **dangling**" },
                    { line: 10, stack: [{ fn: "main", vars: [["x", "20"], ["p", "&x"], ["h", "→0x5000"]] }], heap: [["0x5000", "freed"]], text: "여기서 `*h` 를 쓰면 use-after-free · 크래시 없이 조용히 오염될 수도" },
                    { line: 11, stack: [{ fn: "main", vars: [["x", "20"], ["p", "&x"], ["h", "NULL"]] }], heap: [["0x5000", "freed"]], text: "`h = NULL`: 실수로 다시 `free(h)` 해도 무해 (`free(NULL)` 은 no-op)" }
                ]
            },
            code: [
                {
                    lang: "c",
                    title: "동적 배열 + 오류 처리",
                    src: `#include <stdio.h>
#include <stdlib.h>

int *make_squares(size_t n) {
    int *a = malloc(n * sizeof *a);     // 힙: 호출자가 free
    if (a == NULL) return NULL;         // 할당 실패 확인
    for (size_t i = 0; i < n; i++)
        a[i] = (int)(i * i);            // a[i] == *(a + i)
    return a;
}

int main(void) {
    size_t n = 5;
    int *sq = make_squares(n);
    if (!sq) return 1;
    for (int *q = sq; q < sq + n; q++)  // 포인터로 순회
        printf("%d ", *q);
    free(sq);
    sq = NULL;                          // dangling 방지
    return 0;
}`,
                    note: "`sizeof *a` 로 쓰면 타입이 바뀌어도 크기가 맞음 · 0 초기화(zero-initialization)가 필요하면 `calloc`"
                },
                {
                    lang: "c",
                    title: "지역 변수 주소 반환 (흔한 실수)",
                    src: `int *bad(void) {
    int local = 42;
    return &local;          // ✗ 프레임 소멸 → dangling
}

int *good(void) {
    int *p = malloc(sizeof *p);
    if (p) *p = 42;
    return p;               // 힙은 free 전까지 유효
}

void fill(int *out) {       // 또는 호출자가 저장소를 제공
    *out = 42;
}`,
                    note: "컴파일러는 경고만 줄 수 있음 · `-Wall` 과 AddressSanitizer(`-fsanitize=address`)로 확인"
                }
            ],
            optimize: [
                {
                    title: "2차원 배열: 포인터 배열 → 연속 메모리(contiguous memory)",
                    before: { lang: "c", src: `int **m = malloc(rows * sizeof *m);
for (int r = 0; r < rows; r++)
    m[r] = malloc(cols * sizeof **m);   // rows+1 번 할당, 행이 흩어짐
// m[r][c]: 포인터를 두 번 따라감` },
                    after: { lang: "c", src: `int *m = malloc((size_t)rows * cols * sizeof *m);  // 1 번 할당
// m[r * cols + c]: 연속 · 캐시 친화
free(m);                                            // 해제도 1 번` },
                    gain: "할당 rows+1 → 1 · 캐시 미스 감소"
                },
                {
                    title: "`realloc` 은 한 칸씩 말고 2배씩",
                    before: { lang: "c", src: `for (...) {
    buf = realloc(buf, (n + 1) * sizeof *buf);  // 매번 복사 가능 → O(n²)
    buf[n++] = x;                               // 실패 시 원래 buf 누수
}` },
                    after: { lang: "c", src: `if (n == cap) {
    size_t nc = cap ? cap * 2 : 16;
    int *t = realloc(buf, nc * sizeof *t);
    if (!t) return -1;          // buf 는 아직 유효
    buf = t; cap = nc;
}
buf[n++] = x;                   // 분할상환 O(1)` },
                    gain: "추가 O(n²) → 분할상환 O(1)"
                }
            ],
            glossary: [
                { term: "포인터", en: "Pointer", def: "다른 객체의 주소를 값으로 가진 변수" },
                { term: "댕글링 포인터", en: "Dangling pointer", def: "해제·소멸된 메모리를 계속 가리키는 포인터" },
                { term: "Use-after-free", en: "Use-after-free", def: "해제한 메모리에 접근 · 대표적 보안 취약점" },
                { term: "메모리 누수", en: "Memory leak", def: "할당 후 해제하지 않아 계속 쌓이는 메모리" },
                { term: "미정의 동작", en: "Undefined behavior", def: "표준이 결과를 정하지 않은 동작 · 무엇이든 일어날 수 있음" },
                { term: "Double free", en: "Double free", def: "같은 블록을 두 번 해제 · 힙 관리 정보 파괴" }
            ],
            quiz: [
                { q: "`int a[4]; int *p = a;` 일 때 `p + 2` 가 가리키는 곳은?", options: ["`a[1]`", "a 시작 + 2바이트", "`a[2]`", "a 시작 + 2×`sizeof(int *)`"], a: 2, why: "가리키는 타입(`int`) 크기 단위로 이동 · 바이트 단위나 포인터 크기 단위로 착각하기 쉬움" },
                { q: "`free(p)` 직후의 p 에 대해 옳은 것은?", options: ["자동으로 NULL 이 된다", "옛 주소가 남지만 역참조는 UB", "다음 malloc 전까진 읽어도 안전", "가리키던 값이 0 으로 지워진다"], a: 1, why: "free 는 변수 p 를 바꾸지 않음 · '다음 malloc 전엔 안전'도 틀림, 해제 직후부터 접근은 UB" },
                { q: "함수가 지역 변수의 주소를 반환하면?", options: ["반환 후 역참조하면 UB", "값이 자동으로 힙에 복사됨", "컴파일러가 static 으로 승격", "표준상 항상 컴파일 에러"], a: 0, why: "프레임은 return 과 함께 소멸 · 에러가 아니라 경고(`-Wreturn-local-addr`)만 나올 수 있음" },
                { q: "LP64 (x86-64 Linux) 에서 `void f(int a[10]) { sizeof a; }` 의 값은?", options: ["40", "10", "8", "4"], a: 2, why: "배열 매개변수는 `int *` 로 바뀜 → 포인터 크기 8 · 40 은 호출자 쪽 진짜 배열의 크기" },
                { q: "메모리 누수가 생기는 코드는?", options: ["`free(NULL);`", "`p = malloc(8); free(p); p = NULL;`", "`char *s = \"hi\"; s = NULL;`", "`p = malloc(8); p = malloc(16);`"], a: 3, why: "첫 블록 주소를 잃어 해제할 방법이 없음 · 문자열 리터럴은 정적 저장 기간이라 누수 아님" },
                { type: "num", q: "`int *p` 의 값이 `0x1000` 이면 `p + 3` 의 주소는? (`int` 4 B, 16진 입력 가능)", answer: 0x100C, why: "3 × 4 = 12 = `0xC` 바이트 → `0x100C` · `0x1003` 은 바이트 단위로 착각한 값" },
                { type: "text", q: "x86-64 Linux 에서 출력은?", code: { lang: "c", src: "int a[10];\nint *p = a;\nprintf(\"%zu %zu %zu\\n\", sizeof a, sizeof p, sizeof *p);" }, answer: ["40 8 4"], why: "배열 그 자체는 decay 되지 않아 10 × 4 · `p` 는 포인터 8 · `*p` 는 `int` 4" },
                { type: "text", q: "출력은?", code: { lang: "c", src: "int a[] = {10, 20, 30, 40};\nint *p = a + 1;\np++;\nprintf(\"%d %d %td\\n\", *p, p[-2], p - a);" }, answer: ["30 10 2"], why: "`p` 는 `a[2]` · `p[-2]` = `*(p - 2)` = `a[0]` · 포인터 차는 바이트가 아니라 원소 수" },
                { type: "num", q: "`double d[4]; char *c = (char *)d;` 일 때 `(char *)(d + 2) - (c + 2)` 는? (`double` 8 B)", answer: 14, why: "`d + 2` 는 16 바이트 뒤, `c + 2` 는 2 바이트 뒤 → 16 − 2 = 14 · 산술 단위는 포인터 타입이 정함" }
            ],
            refs: [
                { title: "ISO/IEC 9899:2024 (C23) — N3220 working draft (C23 text, early C2y)", by: "ISO/IEC JTC1/SC22/WG14", year: 2024, url: "https://www.open-std.org/jtc1/sc22/wg14/www/docs/n3220.pdf", kind: "spec" },
                { title: "The C Programming Language, Second Edition", by: "Kernighan et al.", year: 1988, url: "https://www.cs.princeton.edu/~bwk/cbook.html", kind: "book" },
                { title: "AddressSanitizer: A Fast Address Sanity Checker", by: "Serebryany et al.", year: 2012, url: "https://www.usenix.org/conference/atc12/technical-sessions/presentation/serebryany", kind: "paper" }
            ]
        },
        {
            id: "cpp-raii",
            title: "C++ RAII와 move",
            level: 2,
            mins: 14,
            pre: ["languages/c-pointer"],
            checked: "2026-11-16",
            key: [
                "RAII: 자원(resource) 획득 = 객체 생성, 해제 = **소멸자**(destructor) · 스코프 끝 자동",
                "`unique_ptr` = 단독 소유(unique ownership) · 복사 불가, `std::move` 로 이전",
                "move 된 원본은 '유효하지만 미지정'(valid but unspecified) · `unique_ptr` 는 null 보장",
                "Rule of zero: 자원은 표준 타입에 맡기고 소멸자를 직접 쓰지 않기"
            ],
            concepts: [
                { term: "소멸자", en: "Destructor", def: "스코프 종료·예외 전파 시 자동 호출 · 생성의 역순" },
                { term: "`unique_ptr` / `shared_ptr`", def: "단독 소유 / 참조 카운트 공유 소유 (원자적 카운트 비용)" },
                { term: "`std::move`", def: "아무것도 옮기지 않음 · rvalue 로 캐스트해 move 생성자를 고르게 함" },
                { term: "예외 안전", en: "Exception safety", def: "중간에 throw 되어도 소멸자가 정리 → 누수 없음" }
            ],
            demo: {
                type: "sim",
                name: "memory",
                lang: "cpp",
                code: `#include <memory>
#include <utility>
void sink(std::unique_ptr<int> p) {
    *p += 1;
}                                  // p 소멸 → delete
int main() {
    auto a = std::make_unique<int>(41);
    {
        auto b = std::move(a);     // 소유권 a → b
        *b += 1;
    }                              // b 소멸 → delete
    auto c = std::make_unique<int>(7);
    sink(std::move(c));            // 소유권 c → p
}                                  // a, c 는 null · 할 일 없음`,
                steps: [
                    { line: 7, stack: [{ fn: "main", vars: [["a", "→0x2000"]] }], heap: [["0x2000", "41"]], text: "`make_unique`: 힙(heap)에 int 41 · `a` 가 단독 소유" },
                    { line: 9, stack: [{ fn: "main", vars: [["a", "null"], ["b", "→0x2000"]] }], heap: [["0x2000", "41"]], text: "`std::move(a)`: 포인터(pointer)만 b 로 · a 는 **null** (힙 복사 없음)" },
                    { line: 10, stack: [{ fn: "main", vars: [["a", "null"], ["b", "→0x2000"]] }], heap: [["0x2000", "42"]], text: "이제 b 로만 접근 · `auto b2 = b;` 같은 복사는 컴파일 에러" },
                    { line: 11, stack: [{ fn: "main", vars: [["a", "null"]] }], heap: [["0x2000", "freed"]], text: "블록 끝 → b 의 소멸자가 `delete` · 코드에 delete 없음" },
                    { line: 12, stack: [{ fn: "main", vars: [["a", "null"], ["c", "→0x2010"]] }], heap: [["0x2010", "7"]], text: "새 객체 할당 · c 가 소유" },
                    { line: 13, stack: [{ fn: "main", vars: [["a", "null"], ["c", "null"]] }, { fn: "sink", vars: [["p", "→0x2010"]] }], heap: [["0x2010", "7"]], text: "값 매개변수(by-value parameter)로 move → 소유권(ownership)이 sink 의 `p` 로" },
                    { line: 5, stack: [{ fn: "main", vars: [["a", "null"], ["c", "null"]] }], heap: [["0x2010", "freed"]], text: "sink 끝 → p 소멸 → delete · 호출자는 해제 책임 없음" },
                    { line: 14, stack: [{ fn: "main", vars: [["a", "null"], ["c", "null"]] }], heap: [], text: "main 끝: a, c 소멸자 실행 · null 이라 할 일 없음 → 누수(leak)·이중 해제(double free) 0" }
                ]
            },
            code: [
                {
                    lang: "cpp",
                    title: "C 자원도 RAII 로 (custom deleter)",
                    src: `#include <cstdio>
#include <memory>
#include <stdexcept>
#include <string>

struct FileCloser {
    void operator()(std::FILE *f) const noexcept { std::fclose(f); }
};
using File = std::unique_ptr<std::FILE, FileCloser>;

File open_file(const std::string &path) {
    File f{std::fopen(path.c_str(), "r")};
    if (!f) throw std::runtime_error("open failed: " + path);
    return f;                          // move (복사 아님)
}

std::size_t count_lines(const std::string &path) {
    File f = open_file(path);
    std::size_t n = 0;
    for (int c; (c = std::fgetc(f.get())) != EOF; )
        if (c == '\\n') ++n;
    return n;                          // 예외든 return 이든 fclose 자동
}`,
                    note: "null 이면 deleter 를 부르지 않음 · close 코드를 한 곳에만 (Rule of zero)"
                },
                {
                    lang: "cpp",
                    title: "move 직접 구현 (Rule of five)",
                    src: `#include <cstddef>
#include <utility>

class Buffer {
    std::size_t n_ = 0;
    int *p_ = nullptr;
public:
    explicit Buffer(std::size_t n) : n_(n), p_(new int[n]{}) {}
    ~Buffer() { delete[] p_; }

    Buffer(const Buffer &) = delete;              // 복사 금지
    Buffer &operator=(const Buffer &) = delete;

    Buffer(Buffer &&o) noexcept                   // 포인터만 가져옴
        : n_(std::exchange(o.n_, 0)), p_(std::exchange(o.p_, nullptr)) {}
    Buffer &operator=(Buffer &&o) noexcept {
        if (this != &o) {
            delete[] p_;
            n_ = std::exchange(o.n_, 0);
            p_ = std::exchange(o.p_, nullptr);
        }
        return *this;
    }
    std::size_t size() const { return n_; }
};`,
                    note: "move 가 `noexcept` 여야 `std::vector` 재할당(reallocation) 때 복사 대신 move 를 고름 (복사 가능한 타입일 때)"
                }
            ],
            optimize: [
                {
                    title: "`new`/`delete` 직접 → `make_unique`",
                    before: { lang: "cpp", src: `Widget *w = new Widget();
w->load(path);      // 여기서 throw → delete 건너뜀 → 누수
use(w);
delete w;` },
                    after: { lang: "cpp", src: `auto w = std::make_unique<Widget>();
w->load(path);      // throw 해도 소멸자가 delete
use(*w);` },
                    gain: "예외 경로 누수 0 · 크기·속도 ≈ raw 포인터"
                },
                {
                    title: "큰 객체 삽입: 복사 → move",
                    before: { lang: "cpp", src: `std::vector<std::string> names;
std::string s = load_big_text();   // 수 MB
names.push_back(s);                // 버퍼 전체 복사` },
                    after: { lang: "cpp", src: `names.push_back(std::move(s));     // 버퍼 포인터만 이동
// 이후 s 는 유효하지만 미지정 → 재대입 전엔 읽지 않기` },
                    gain: "복사 O(n) → O(1)"
                }
            ],
            glossary: [
                { term: "RAII", en: "Resource Acquisition Is Initialization", def: "자원 수명을 객체 수명에 묶는 C++ 관용구" },
                { term: "소멸자", en: "Destructor", def: "객체가 사라질 때 자동 호출되어 자원을 해제하는 멤버 함수" },
                { term: "이동 의미론", en: "Move semantics", def: "복사 대신 내부 자원을 넘겨받는 연산 · 원본은 비워짐" },
                { term: "rvalue 참조", en: "Rvalue reference", def: "`T&&` · 곧 사라질 객체에 바인딩 → move 대상" },
                { term: "스마트 포인터", en: "Smart pointer", def: "소유권 규칙을 가진 포인터 래퍼 (`unique_ptr`, `shared_ptr`)" },
                { term: "Rule of zero", en: "Rule of zero", def: "자원은 멤버 타입에 맡기고 특수 멤버 함수를 직접 정의하지 않기" }
            ],
            quiz: [
                { q: "`auto b = a;` (a 는 `unique_ptr`) 의 결과는?", options: ["힙 객체를 깊은 복사", "참조 카운트가 1 증가", "컴파일 에러", "a 는 null, b 가 소유"], a: 2, why: "복사 생성자가 `= delete` · 몰래 소유권을 넘기던 옛 `auto_ptr` 와 달리 이전은 `std::move` 로 명시" },
                { q: "`std::move(x)` 가 실제로 하는 일은?", options: ["x 의 내용을 새 위치로 옮김", "x 를 rvalue 로 캐스트", "x 를 비우고 null 로 만듦", "x 를 복사한 뒤 원본 삭제"], a: 1, why: "`static_cast<T&&>` 일 뿐 · 실제 이동과 원본 비우기는 그로 인해 선택된 move 생성자/대입이 함" },
                { q: "예외가 잡히는 곳까지 전파될 때, 지나가는 스코프의 지역 객체는?", options: ["생성 역순으로 소멸", "catch 가 끝난 뒤 한꺼번에 소멸", "소멸자 없이 메모리만 회수", "선언 순서대로 소멸"], a: 0, why: "스택 풀기(stack unwinding) 중 프레임마다 역순 소멸 · catch 에 들어가기 전에 이미 정리됨" },
                { q: "`shared_ptr` 대비 `unique_ptr` 의 장점은?", options: ["여러 소유자를 둘 수 있음", "순환 참조를 자동으로 끊음", "객체 접근을 자동 동기화", "카운트·제어 블록이 없음"], a: 3, why: "원자적 카운트 비용이 없고 보통 raw 포인터 크기 · 순환을 끊는 것은 `weak_ptr` 의 몫" },
                { q: "move 된 `std::string s` 에 대해 안전한 것은?", options: ["`s.size()` 가 0 이라고 가정", "`s = \"new\";` 로 재대입", "`s[0]` 읽기", "아무것도 할 수 없음"], a: 1, why: "유효하지만 미지정 · 재대입·소멸은 안전, 빈 문자열이라는 가정은 금지" },
                { type: "text", q: "출력은?", code: { lang: "cpp", src: "struct T { char c; ~T() { std::printf(\"%c\", c); } };\nint main() {\n    T a{'a'};\n    { T b{'b'}; T c{'c'}; }\n    T d{'d'};\n}" }, answer: ["cbda"], why: "안쪽 블록 끝에서 c → b (역순) · main 끝에서 d → a · 스코프마다 생성 역순" },
                { type: "order", q: "`throw` 부터 처리가 끝날 때까지 순서대로", items: ["예외 객체 생성 (`throw`)", "지나가는 프레임의 지역 객체 소멸 (역순)", "맞는 `catch` 블록 실행", "`catch` 끝에서 예외 객체 소멸"], why: "스택 풀기가 먼저 끝나야 핸들러에 들어감 · 예외 객체는 핸들러가 끝날 때까지 살아 있음" },
                { type: "text", q: "출력은? (g++ 13, libstdc++)", code: { lang: "cpp", src: "struct S {\n    S() = default;\n    S(const S &) { std::puts(\"copy\"); }\n    S(S &&) { std::puts(\"move\"); }   // noexcept 없음\n};\nint main() {\n    std::vector<S> v(1);\n    v.reserve(4);\n}" }, answer: ["copy"], why: "`move_if_noexcept`: 이동이 예외를 던질 수 있고 복사가 가능하면 복사 · `noexcept` 를 붙이면 `move`" },
                { type: "text", q: "출력은?", code: { lang: "cpp", src: "auto p = std::make_shared<int>(1);\nauto q = p;\n{ auto r = p; std::cout << p.use_count(); }\nstd::cout << p.use_count();\nstd::weak_ptr<int> w = p;\nstd::cout << p.use_count();" }, answer: ["322"], why: "p·q·r = 3 → 블록 끝에 r 소멸 → 2 · `weak_ptr` 는 강한 카운트를 올리지 않음" },
                { type: "num", q: "x86-64 Linux (libstdc++) 에서 `sizeof(std::shared_ptr<int>)` 는 몇 B?", answer: 16, unit: "B", why: "객체 포인터 + 제어 블록 포인터 = 8 + 8 · `unique_ptr<int>` 는 8" }
            ],
            refs: [
                { title: "A Proposal to Add Move Semantics Support to the C++ Language (N1377)", by: "Hinnant et al.", year: 2002, url: "https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2002/n1377.htm", kind: "paper" },
                { title: "Exception Safety: Concepts and Techniques", by: "Stroustrup", year: 2001, url: "https://www.stroustrup.com/except.pdf", kind: "paper" },
                { title: "C++ Core Guidelines", by: "Stroustrup et al.", url: "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines", kind: "doc" },
                { title: "Working Draft, Standard for Programming Language C++ (N4950)", by: "ISO/IEC JTC1/SC22/WG21", year: 2023, url: "https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2023/n4950.pdf", kind: "spec" }
            ]
        },
        {
            id: "rust-own",
            title: "Rust 소유권과 빌림",
            level: 2,
            mins: 15,
            pre: ["languages/cpp-raii"],
            checked: "2026-11-16",
            key: [
                "값마다 **소유자(owner) 하나** · 소유자가 스코프를 벗어나면 `drop`",
                "대입·전달은 기본이 **move** · 원본 사용은 컴파일 에러",
                "빌림(borrowing): `&T` 여러 개 **또는** `&mut T` 하나 (동시에 둘 다 불가)",
                "참조(reference)는 소유자보다 오래 살 수 없음 · 전부 컴파일 타임 검사"
            ],
            concepts: [
                { term: "Copy vs Move", def: "`i32`·`bool` 등 `Copy` 타입은 복사, `String`·`Vec` 은 move" },
                { term: "NLL", en: "Non-Lexical Lifetimes", def: "빌림은 스코프 끝이 아니라 **마지막 사용** 지점에서 끝남" },
                { term: "라이프타임 `'a`", en: "Lifetime", def: "참조끼리의 수명 관계를 시그니처에 표기 · 대부분 생략(추론)" },
                { term: "`unsafe`", def: "raw 포인터 역참조 등 컴파일러가 못 보는 규칙을 개발자가 보증" },
                { term: "`Rc` / `Arc`", en: "Reference Counted / Atomically Reference Counted", def: "공유 소유 (참조 카운트) · `Arc` 는 원자적이라 스레드 간 가능" }
            ],
            demo: {
                type: "sim",
                name: "memory",
                lang: "rust",
                code: `fn len(s: &String) -> usize {
    s.len()
}
fn main() {
    let a = String::from("hi");
    let b = a;                 // move
    let n = len(&b);           // 불변 빌림
    let mut v = vec![1, 2];
    let r = &mut v;            // 가변 빌림
    r.push(3);
    println!("{n} {v:?}");     // r 은 이미 끝남
    drop(b);                   // 즉시 해제
}                              // v drop`,
                steps: [
                    { line: 5, stack: [{ fn: "main", vars: [["a", "→0x3000 len 2"]] }], heap: [["0x3000", "\"hi\""]], text: "`String`: 스택(stack)엔 (ptr, len, cap), 문자는 힙(heap)에" },
                    { line: 6, stack: [{ fn: "main", vars: [["a", "moved"], ["b", "→0x3000 len 2"]] }], heap: [["0x3000", "\"hi\""]], text: "`let b = a;` 는 **move** · 스택 3워드만 복사, 이후 `a` 사용은 E0382" },
                    { line: 2, stack: [{ fn: "main", vars: [["a", "moved"], ["b", "→0x3000 len 2"]] }, { fn: "len", vars: [["s", "&b"]] }], heap: [["0x3000", "\"hi\""]], text: "`&b` 불변 빌림(immutable borrow): 소유권(ownership)은 b 에 그대로 · len 이 끝나도 drop 안 함" },
                    { line: 8, stack: [{ fn: "main", vars: [["a", "moved"], ["b", "→0x3000 len 2"], ["n", "2"], ["v", "→0x3010 len 2"]] }], heap: [["0x3000", "\"hi\""], ["0x3010", "[1, 2]"]], text: "`Vec` 도 힙 버퍼를 단독 소유" },
                    { line: 10, stack: [{ fn: "main", vars: [["a", "moved"], ["b", "→0x3000 len 2"], ["n", "2"], ["v", "→0x3010 len 3"], ["r", "&mut v"]] }], heap: [["0x3000", "\"hi\""], ["0x3010", "[1, 2, 3]"]], text: "`&mut v` 가 살아 있는 동안 v 를 읽기만 해도 컴파일 에러 (E0502)" },
                    { line: 11, stack: [{ fn: "main", vars: [["a", "moved"], ["b", "→0x3000 len 2"], ["n", "2"], ["v", "→0x3010 len 3"]] }], heap: [["0x3000", "\"hi\""], ["0x3010", "[1, 2, 3]"]], text: "r 은 10행이 마지막 사용 → 빌림 종료 (NLL) · 이제 v 를 읽을 수 있음" },
                    { line: 12, stack: [{ fn: "main", vars: [["a", "moved"], ["b", "dropped"], ["n", "2"], ["v", "→0x3010 len 3"]] }], heap: [["0x3000", "freed"], ["0x3010", "[1, 2, 3]"]], text: "`drop(b)`: b 를 함수로 move → 즉시 해제 · 이후 b 사용은 컴파일 에러" },
                    { line: 13, stack: [{ fn: "main", vars: [["a", "moved"], ["b", "dropped"], ["n", "2"], ["v", "dropped"]] }], heap: [["0x3000", "freed"], ["0x3010", "freed"]], text: "스코프 끝: 남은 소유자를 **선언 역순**으로 drop · GC 없이 결정적(deterministic) 해제" }
                ]
            },
            code: [
                {
                    lang: "rust",
                    title: "빌림 규칙과 라이프타임",
                    src: `// 반환 참조는 두 입력 중 짧은 쪽만큼 산다
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() >= y.len() { x } else { y }
}

fn main() {
    let mut names = vec![String::from("kim"), String::from("lee")];

    let first = &names[0];          // 불변 빌림
    // names.push("park".into());   // ✗ E0502: 빌림 중 수정 (재할당 시 first 가 dangling)
    println!("{first}");            // first 마지막 사용 → 빌림 끝
    names.push("park".into());      // ✓ 이제 가능

    let s1 = String::from("rust");
    let r;
    {
        let s2 = String::from("c++");
        r = longest(&s1, &s2);
        println!("{r}");            // ✓ s2 가 살아 있는 동안
    }
    // println!("{r}");             // ✗ E0597: s2 가 충분히 오래 살지 않음
}`,
                    note: "C++ 의 vector 반복자 무효화(iterator invalidation) 버그를 컴파일 단계에서 차단"
                },
                {
                    lang: "rust",
                    title: "스레드 간 공유: Arc + Mutex",
                    src: `use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let count = Arc::new(Mutex::new(0u64));   // 공유 소유 + 내부 가변성
    let mut hs = Vec::new();
    for _ in 0..4 {
        let c = Arc::clone(&count);           // refcount +1
        hs.push(thread::spawn(move || {       // c 를 스레드로 move
            for _ in 0..1000 {
                *c.lock().unwrap() += 1;      // 락 가드는 문장 끝에 해제
            }
        }));
    }
    for h in hs {
        h.join().unwrap();
    }
    println!("{}", *count.lock().unwrap());   // 항상 4000
}`,
                    note: "`Rc` 는 `Send` 가 아니라 스레드로 넘기면 컴파일 에러 · 데이터 경쟁(data race)을 타입으로 차단"
                }
            ],
            optimize: [
                {
                    title: "불필요한 `clone` → 빌림",
                    before: { lang: "rust", src: `fn total_len(v: Vec<String>) -> usize {   // 소유권을 가져감
    v.iter().map(|s| s.len()).sum()
}
let n = total_len(names.clone());          // 벡터+문자열 전부 복사` },
                    after: { lang: "rust", src: `fn total_len(v: &[String]) -> usize {      // 슬라이스 빌림
    v.iter().map(|s| s.len()).sum()
}
let n = total_len(&names);                 // 복사 0 · names 계속 사용` },
                    gain: "힙 할당 N+1 → 0"
                },
                {
                    title: "매개변수 `&String` → `&str`",
                    before: { lang: "rust", src: `fn greet(name: &String) { println!("hi {name}"); }
greet(&"kim".to_string());   // 리터럴도 힙 String 으로 만들어야 함` },
                    after: { lang: "rust", src: `fn greet(name: &str) { println!("hi {name}"); }
greet("kim");                // &'static str 그대로
greet(&owned);               // &String → &str 자동 변환 (deref)` },
                    gain: "호출당 할당 1 → 0 · 받는 타입 확대"
                }
            ],
            glossary: [
                { term: "소유권", en: "Ownership", def: "값마다 해제 책임을 지는 변수가 정확히 하나라는 규칙" },
                { term: "빌림", en: "Borrowing", def: "소유권 없이 참조(`&`, `&mut`)로 값을 사용" },
                { term: "빌림 검사기", en: "Borrow checker", def: "참조 규칙과 수명을 컴파일 타임에 검증하는 컴파일러 단계" },
                { term: "라이프타임", en: "Lifetime", def: "참조가 유효한 구간 · `'a` 로 관계를 표기" },
                { term: "Drop", en: "Drop trait", def: "소유자가 스코프를 벗어날 때 실행되는 해제 로직 (C++ 소멸자 대응)" },
                { term: "내부 가변성", en: "Interior mutability", def: "`&` 로도 수정 허용 · `RefCell`·`Mutex` 가 런타임에 규칙 검사" }
            ],
            quiz: [
                { q: "`let b = a;` (a: String) 다음 `println!(\"{a}\")` 는?", options: ["\"hi\" 출력 (얕은 복사)", "컴파일 에러 E0382", "런타임 패닉 (dangling)", "빈 문자열 출력"], a: 1, why: "소유권이 b 로 이동해 a 는 초기화 안 된 변수 취급 · 검사는 컴파일 타임이라 런타임 패닉이 아님" },
                { q: "동시에 살아 있어도 되는 조합은?", options: ["`&mut` 두 개", "`&` 하나와 `&mut` 하나", "`&` 여러 개", "`&mut` 하나와 소유자의 직접 수정"], a: 2, why: "공유(읽기)는 여럿, 수정은 단독 · `&` 와 `&mut` 공존은 E0502" },
                { q: "`let x = 5; let y = x;` 다음 x 사용은?", options: ["가능 (i32 는 Copy)", "컴파일 에러 (x 는 move 됨)", "가능하지만 x 는 0", "`x.clone()` 해야 가능"], a: 0, why: "`Copy` 타입은 비트 복사 · 원본 유지 · move 규칙은 `String` 처럼 `Copy` 가 아닌 타입에만" },
                { q: "스코프 끝에서 지역 변수들이 drop 되는 순서는?", options: ["선언 순서", "GC 가 결정", "무작위", "선언 역순"], a: 3, why: "나중에 만든 값이 먼저 만든 값을 빌릴 수 있으므로 · 구조체 필드는 반대로 선언 순서" },
                { q: "Safe Rust 가 데이터 경쟁을 컴파일 타임에 막는 근거는?", options: ["컴파일러가 공유 변수마다 락을 삽입", "공유되는 값은 전부 불변으로 강제", "빌림 규칙 + Send/Sync 트레잇", "런타임이 스레드를 한 번에 하나씩 실행"], a: 2, why: "공유 가변 상태는 `Mutex` 등 `Sync` 타입을 거쳐야만 가능 · 락을 넣는 것은 개발자" },
                { type: "text", q: "출력은?", code: { lang: "rust", src: "struct D(&'static str);\nimpl Drop for D {\n    fn drop(&mut self) { print!(\"{} \", self.0); }\n}\nfn main() {\n    let _a = D(\"a\");\n    let _b = D(\"b\");\n    { let _c = D(\"c\"); }\n    print!(\"end \");\n}" }, answer: ["c end b a"], why: "안쪽 블록 끝에서 c · main 끝에서 선언 역순으로 b → a" },
                { type: "text", q: "출력은? (위의 `D` 사용)", code: { lang: "rust", src: "fn main() {\n    let _ = D(\"x\");\n    let _y = D(\"y\");\n    print!(\"main \");\n}" }, answer: ["x main y"], why: "`_` 패턴은 바인딩하지 않아 임시값이 문장 끝에서 바로 drop · `_y` 는 변수라 스코프 끝까지 산다" },
                { type: "text", q: "출력은?", code: { lang: "rust", src: "use std::rc::Rc;\nfn main() {\n    let a = Rc::new(5);\n    let b = Rc::clone(&a);\n    {\n        let _c = Rc::clone(&a);\n        print!(\"{} \", Rc::strong_count(&a));\n    }\n    drop(b);\n    print!(\"{}\", Rc::strong_count(&a));\n}" }, answer: ["3 1"], why: "a·b·_c = 3 → 블록 끝 `_c` drop → `drop(b)` → 1 · 값은 마지막 `Rc` 가 사라질 때 해제" },
                { type: "num", q: "64bit 타깃에서 `std::mem::size_of::<String>()` 은 몇 B?", answer: 24, unit: "B", why: "스택 쪽은 (ptr, len, cap) 3워드 = 24 · 문자 데이터는 힙에 있어 크기에 안 들어감" }
            ],
            refs: [
                { title: "The Rust Programming Language — Understanding Ownership", by: "Klabnik et al.", url: "https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html", kind: "book" },
                { title: "RFC 2094: Non-lexical lifetimes", by: "Matsakis", year: 2017, url: "https://rust-lang.github.io/rfcs/2094-nll.html", kind: "spec" },
                { title: "The Rust Reference — Destructors", by: "Rust Project", url: "https://doc.rust-lang.org/reference/destructors.html", kind: "spec" }
            ]
        },
        {
            id: "python-internals",
            title: "Python 내부: 객체·GIL·제너레이터",
            level: 2,
            mins: 14,
            checked: "2026-11-16",
            key: [
                "모든 값은 힙(heap)의 **객체**(object) · 변수는 객체를 가리키는 이름표",
                "CPython: 참조 카운트(reference counting)로 즉시 해제 + 순환 참조(reference cycle)는 GC 가 수거",
                "GIL: 한 번에 한 스레드만 바이트코드(bytecode) 실행 · free-threaded 빌드는 예외",
                "제너레이터(generator)는 프레임(frame)을 멈춰 두고 `next()` 때 재개 · 메모리 O(1)"
            ],
            concepts: [
                { term: "이름 바인딩", en: "Name binding", def: "`b = a` 는 복사가 아니라 같은 객체에 이름 하나 추가" },
                { term: "가변 / 불변", en: "Mutable / Immutable", def: "list·dict 는 제자리 수정, int·str·tuple 은 연산마다 새 객체" },
                { term: "GIL 해제 시점", en: "Global Interpreter Lock (GIL) release points", def: "I/O 대기·일부 C 확장 연산 중 → I/O 스레드는 효과, CPU 바운드는 직렬" },
                { term: "바이트코드", en: "Bytecode", def: "소스 → 코드 객체 → 평가 루프가 명령 하나씩 실행 (`dis` 로 확인)" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "src", label: "소스 .py", sub: "def f(): ...", x: 0, y: 0 },
                    { id: "code", label: "바이트코드", sub: "코드 객체 · .pyc", x: 1, y: 0 },
                    { id: "eval", label: "평가 루프", sub: "ceval · opcode 실행", x: 2, y: 0 },
                    { id: "obj", label: "객체 힙", sub: "PyObject*", x: 3, y: 0 },
                    { id: "gen", label: "제너레이터", sub: "프레임 일시정지", x: 1, y: 1 },
                    { id: "gil", label: "GIL", sub: "한 번에 한 스레드", x: 2, y: 1 },
                    { id: "rc", label: "참조 카운트", sub: "ob_refcnt", x: 3, y: 1 },
                    { id: "gc", label: "순환 GC", sub: "순환 참조 수거", x: 3, y: 2 }
                ],
                edges: [
                    { from: "src", to: "code", label: "compile" },
                    { from: "code", to: "eval" },
                    { from: "eval", to: "obj", label: "생성" },
                    { from: "obj", to: "rc", label: "±1" },
                    { from: "rc", to: "gc", label: "순환" },
                    { from: "gil", to: "eval", label: "보유" },
                    { from: "gen", to: "eval", label: "next()" }
                ],
                steps: [
                    { on: ["src", "src>code", "code"], text: "실행·import 시 소스를 **바이트코드**로 컴파일 · `.pyc` 로 캐시" },
                    { on: ["code>eval", "eval"], text: "평가 루프(evaluation loop)가 명령을 하나씩 실행 · `dis.dis(f)` 로 직접 확인" },
                    { on: ["eval>obj", "obj"], text: "`x = [1, 2]` → 힙에 list 객체 · `x` 는 그것을 가리키는 이름" },
                    { on: ["obj>rc", "rc"], text: "이름·컨테이너가 참조할 때 +1, 끊을 때 −1 · 0 이면 **즉시 해제**" },
                    { on: ["rc>gc", "gc"], text: "`a.me = a` 같은 순환은 카운트가 0 이 안 됨 → 순환 GC(cyclic garbage collector)가 주기적으로 수거" },
                    { on: ["gil", "gil>eval"], text: "기본 빌드: GIL 을 쥔 스레드만 바이트코드 실행 · I/O 대기 땐 놓음" },
                    { on: ["gil"], text: "free-threaded 빌드 (3.14 공식 지원, `python3.14t`): GIL 없이 코어별 병렬" },
                    { on: ["gen", "gen>eval"], text: "`yield` 에서 프레임을 멈춰 보관 · `next()` 가 그 지점부터 재개" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "이름 바인딩과 가변 객체",
                    src: `import sys

a = [1, 2, 3]
b = a                 # 복사 아님: 같은 객체에 이름 추가
b.append(4)
print(a)              # [1, 2, 3, 4]
print(a is b)         # True (같은 객체)

c = a[:]              # 얕은 복사: 새 리스트, 원소는 공유
print(c is a)         # False

def add(item, bucket=[]):     # ✗ 기본값은 def 실행 때 한 번만 생성
    bucket.append(item)
    return bucket
print(add(1), add(2))         # [1, 2] [1, 2]  같은 리스트!

def add_ok(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket

print(sys.getrefcount(a))     # 인자 임시 참조 포함 · 값은 버전마다 다름`,
                    note: "`is` 는 같은 객체인지, `==` 는 값이 같은지 비교"
                },
                {
                    lang: "python",
                    title: "제너레이터 파이프라인",
                    src: `def read_records(path):
    with open(path, encoding="utf-8") as f:
        for line in f:                  # 파일도 한 줄씩 읽는 이터레이터
            yield line.rstrip("\\n").split(",")

def valid(rows):
    for r in rows:
        if len(r) == 3:
            yield r

rows = valid(read_records("big.csv"))   # 아직 아무것도 안 읽음
total = sum(int(r[2]) for r in rows)    # 한 줄씩 끝까지 흘려보냄

g = (x * x for x in range(3))
print(next(g), next(g), next(g))        # 0 1 4
# next(g)  → StopIteration`,
                    note: "파일 크기와 무관하게 메모리 일정 · 한 번 소비하면 끝 (다시 쓰려면 새로 생성)"
                }
            ],
            optimize: [
                {
                    title: "CPU 바운드(CPU-bound): 스레드 → 프로세스",
                    before: { lang: "python", src: `from concurrent.futures import ThreadPoolExecutor
# 기본(GIL) 빌드: 순수 Python 연산은 한 번에 한 스레드
with ThreadPoolExecutor(8) as ex:
    results = list(ex.map(cpu_heavy, chunks))` },
                    after: { lang: "python", src: `from concurrent.futures import ProcessPoolExecutor
# 프로세스마다 인터프리터·GIL 이 따로 → 코어 병렬
with ProcessPoolExecutor() as ex:
    results = list(ex.map(cpu_heavy, chunks))
# free-threaded 빌드라면 스레드 버전도 병렬 가능` },
                    gain: "≈ 코어 수 배 (데이터 전달 비용 별도)"
                },
                {
                    title: "리스트 컴프리헨션(list comprehension) → 제너레이터 식(generator expression)",
                    before: { lang: "python", src: `total = sum([x * x for x in range(10_000_000)])   # 1천만 원소 리스트 생성` },
                    after: { lang: "python", src: `total = sum(x * x for x in range(10_000_000))     # 한 번에 하나만` },
                    gain: "메모리 수백 MB → 상수"
                }
            ],
            glossary: [
                { term: "GIL", en: "Global Interpreter Lock", def: "CPython 에서 한 번에 한 스레드만 바이트코드를 실행하게 하는 락" },
                { term: "참조 카운트", en: "Reference counting", def: "객체를 가리키는 참조 수 · 0 이 되면 즉시 해제" },
                { term: "순환 GC", en: "Cyclic garbage collector", def: "참조 카운트로 못 지우는 순환 참조를 찾아 해제" },
                { term: "제너레이터", en: "Generator", def: "`yield` 로 값을 하나씩 내며 실행 상태를 보존하는 함수" },
                { term: "바이트코드", en: "Bytecode", def: "인터프리터가 실행하는 중간 명령 · `dis` 모듈로 확인" },
                { term: "Free-threaded 빌드", en: "Free-threaded build", def: "GIL 없이 스레드가 병렬 실행되는 CPython 빌드 (PEP 703/779)" }
            ],
            quiz: [
                { q: "`a = [1, 2, 3]; b = a; b.append(4)` 후 `a` 는?", options: ["[1, 2, 3]", "[1, 2, 3, 4]", "[1, 2, 3, [4]]", "`AttributeError`"], a: 1, why: "`b = a` 는 복사가 아니라 이름 추가 · a 와 b 는 같은 리스트 객체" },
                { q: "기본(GIL) CPython 에서 순수 Python CPU 작업을 스레드 8개로 나누면?", options: ["≈ 8배 빨라짐", "GIL 이 자동 해제돼 8코어 병렬", "프로세스로 자동 전환되어 병렬", "대체로 빨라지지 않음"], a: 3, why: "바이트코드 실행은 GIL 보유 스레드 하나뿐 · GIL 은 I/O 대기 때만 놓임" },
                { q: "Python 3.15 (2026-10) 에서 free-threaded 빌드의 위치는?", options: ["기본 빌드가 되어 GIL 제거", "공식 지원이지만 선택형 빌드", "다시 실험 단계로 격하", "3.15 에서 지원 중단"], a: 1, why: "3.14 부터 지원 단계(PEP 779) · 기본 빌드 전환은 아직 별도 결정 · 3.15 는 `abi3t`(PEP 803) 추가" },
                { q: "순환 참조(`a.me = a`) 객체는 어떻게 해제되나?", options: ["순환 GC 가 탐지해 수거", "참조 카운트가 0 이 되어 즉시", "영원히 누수", "프로세스 종료 때만"], a: 0, why: "서로 참조해 카운트가 0 이 안 됨 → gc 모듈이 처리" },
                { q: "제너레이터에 대해 틀린 것은?", options: ["`yield` 에서 지역 변수·위치 보존", "끝나면 `StopIteration`", "다 소비하면 처음부터 재시작", "전체 결과를 메모리에 두지 않음"], a: 2, why: "한 번 소진되면 빈 결과만 냄 · 다시 쓰려면 제너레이터 함수를 다시 호출" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "t = (1, [2])\ntry:\n    t[1] += [3]\nexcept TypeError:\n    pass\nprint(t)" }, answer: ["(1, [2, 3])"], why: "`list.__iadd__` 로 제자리 확장이 먼저 성공 → 튜플 항목 대입에서 TypeError · 예외가 나도 리스트는 바뀜" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "def add(item, bucket=[]):\n    bucket.append(item)\n    return bucket\n\nprint(add(1), add(2))" }, answer: ["[1, 2] [1, 2]"], why: "기본값 리스트는 `def` 때 한 번만 생성 · 두 호출이 같은 객체를 반환해 둘 다 최종 상태로 출력" },
                { type: "order", q: "`g = countdown(3); next(g); next(g); g.close()` 에서 일어나는 순서대로 (`countdown` 은 `try`/`finally` 안에서 `yield`)", items: ["`countdown(3)` 호출: 본문 실행 없이 제너레이터 반환", "첫 `next()`: 본문 시작 → `yield 3` 에서 멈춤", "두 번째 `next()`: 멈춘 지점부터 재개 → `yield 2`", "`close()`: 멈춘 `yield` 에 `GeneratorExit`", "`finally` 정리 코드 실행"], why: "제너레이터 함수 호출은 프레임만 만듦 · `close()` 덕분에 버려진 제너레이터의 정리 코드도 실행" },
                { type: "num", q: "아래 뒤 리스트 객체를 가리키는 참조는 몇 개? (`getrefcount` 인자 임시 참조 제외)", code: { lang: "python", src: "x = [1, 2]\ny = x\nz = [x, x]\ndel y" }, answer: 3, why: "이름 x + z 안의 원소 2개 = 3 · `del y` 는 이름 하나를 지울 뿐 · 3.14 의 `sys.getrefcount(x) - 1` 도 3" }
            ],
            refs: [
                { title: "dis — Disassembler for Python bytecode", by: "Python Software Foundation", url: "https://docs.python.org/3/library/dis.html", kind: "doc" },
                { title: "gc — Garbage Collector interface", by: "Python Software Foundation", url: "https://docs.python.org/3/library/gc.html", kind: "doc" },
                { title: "PEP 255 – Simple Generators", by: "Schemenauer et al.", year: 2001, url: "https://peps.python.org/pep-0255/", kind: "spec" },
                { title: "PEP 703 – Making the Global Interpreter Lock Optional in CPython", by: "Gross", year: 2023, url: "https://peps.python.org/pep-0703/", kind: "spec" }
            ]
        },
        {
            id: "concurrency",
            title: "동시성: 스레드·async·경쟁 조건",
            level: 3,
            mins: 16,
            pre: ["languages/cpp-raii", "languages/python-internals"],
            checked: "2026-11-17",
            key: [
                "`count++` = 읽기 → 더하기 → 쓰기 · 사이에 끼어들면 **lost update**",
                "C/C++ 에서 비원자(non-atomic) 변수의 데이터 경쟁(data race)은 **UB** · Rust 는 컴파일 거부",
                "스레드: 코어 병렬(parallelism) · async: 한 스레드에서 I/O 대기를 겹침",
                "락은 짧게 · 여러 락은 **항상 같은 순서**로 → 교착(deadlock) 방지"
            ],
            concepts: [
                { term: "경쟁 조건", en: "Race condition", def: "결과가 실행 순서(타이밍)에 따라 달라지는 버그" },
                { term: "데이터 경쟁", en: "Data race", def: "동기화 없이 같은 메모리에 동시 접근, 하나 이상이 쓰기" },
                { term: "뮤텍스 vs 원자 연산", en: "Mutex vs atomic operation", def: "구간 전체 상호배제 / 변수 하나의 분할 불가 RMW (`fetch_add`)" },
                { term: "협력형 전환", en: "Cooperative multitasking", def: "async 는 `await` 지점에서만 전환 · 블로킹 호출은 루프 전체를 멈춤" }
            ],
            demo: { type: "sim", name: "race", mode: "plain", n: 1 },
            code: [
                {
                    lang: "cpp",
                    title: "경쟁 vs atomic vs mutex",
                    src: `#include <atomic>
#include <iostream>
#include <mutex>
#include <thread>

int plain = 0;                    // ✗ 동기화 없음 → 데이터 경쟁 (UB)
std::atomic<int> atomic_cnt{0};   // ✓ 원자적 증가
int guarded = 0;                  // ✓ 뮤텍스로 보호
std::mutex m;

void work() {
    for (int i = 0; i < 100000; ++i) {
        ++plain;                                           // lost update
        atomic_cnt.fetch_add(1, std::memory_order_relaxed);
        std::lock_guard<std::mutex> lk(m);                 // 반복 끝에 unlock
        ++guarded;
    }
}

int main() {
    std::thread t1(work), t2(work);
    t1.join();
    t2.join();
    std::cout << plain << ' '         // 흔히 200000 미만 (보장 없음)
              << atomic_cnt << ' '    // 200000
              << guarded << '\\n';     // 200000
}`,
                    note: "카운터처럼 결과만 필요하면 `relaxed` 로 충분 · `join` 이 이후 읽기를 동기화(synchronization) · `-fsanitize=thread` 로 경쟁 탐지"
                },
                {
                    lang: "python",
                    title: "asyncio: I/O 대기 겹치기",
                    src: `import asyncio

async def fetch(name, delay):
    print(f"{name} 시작")
    await asyncio.sleep(delay)        # 대기 중엔 루프가 다른 코루틴 실행
    print(f"{name} 끝")
    return delay

async def main():
    # 순차 await 면 1 + 2 = 3초, gather 는 약 2초
    results = await asyncio.gather(fetch("A", 1), fetch("B", 2))
    print(results)                    # [1, 2]

    async with asyncio.timeout(1.5):  # 3.11+
        await fetch("C", 1)

asyncio.run(main())`,
                    note: "전부 한 스레드 · 동시에 '기다릴' 뿐 CPU 연산이 병렬이 되지는 않음"
                }
            ],
            optimize: [
                {
                    title: "async 안의 블로킹(blocking) 호출 제거",
                    before: { lang: "python", src: `async def handler(url):
    data = requests.get(url).content   # 동기 I/O → 루프 전체 정지
    time.sleep(1)                      # 다른 코루틴도 1초 멈춤
    return data` },
                    after: { lang: "python", src: `async def handler(url):
    data = await asyncio.to_thread(fetch_sync, url)  # 스레드로 위임
    await asyncio.sleep(1)                           # 루프는 계속 돎
    return data` },
                    gain: "요청 처리 직렬 → 겹침"
                },
                {
                    title: "락 경합(lock contention) 줄이기: 스레드별 누적 후 합치기",
                    before: { lang: "cpp", src: `for (auto x : my_chunk) {
    std::lock_guard<std::mutex> lk(m);   // 원소마다 락 → 경합
    total += f(x);
}` },
                    after: { lang: "cpp", src: `long local = 0;
for (auto x : my_chunk) local += f(x);   // 락 없음
std::lock_guard<std::mutex> lk(m);
total += local;                          // 스레드당 1번` },
                    gain: "락 획득 N회 → 1회"
                }
            ],
            glossary: [
                { term: "경쟁 조건", en: "Race condition", def: "실행 타이밍에 따라 결과가 달라지는 버그" },
                { term: "데이터 경쟁", en: "Data race", def: "동기화 없는 동시 접근 중 하나 이상이 쓰기 · C/C++ 에선 UB" },
                { term: "원자 연산", en: "Atomic operation", def: "중간 상태가 보이지 않는 분할 불가 연산 (`fetch_add`, CAS)" },
                { term: "교착 상태", en: "Deadlock", def: "서로 상대가 가진 락을 기다리며 영원히 멈춤" },
                { term: "코루틴", en: "Coroutine", def: "중단·재개할 수 있는 함수 · `async def`, `co_await`" },
                { term: "이벤트 루프", en: "Event loop", def: "준비된 I/O 이벤트를 골라 해당 코루틴을 재개하는 스케줄러" }
            ],
            quiz: [
                { q: "두 스레드가 동기화 없이 `int` 에 `++` 를 10만 번씩. C++ 에서 맞는 말은?", options: ["항상 200000 (`int` 쓰기는 원자적)", "항상 100000", "UB · 실제론 흔히 200000 미만", "컴파일 에러 (동기화 누락)"], a: 2, why: "비원자 변수의 동시 쓰기는 데이터 경쟁 = UB · 정렬된 `int` 저장이 하드웨어에서 원자적이어도 `++` 는 읽기·쓰기 두 번" },
                { q: "`std::atomic<int>::fetch_add` 가 보장하는 것은?", options: ["읽기·더하기·쓰기를 한 번에", "다른 스레드를 모두 일시정지", "매번 OS 시스템콜로 락", "오버플로 대신 최댓값에서 포화"], a: 0, why: "하드웨어 원자 명령(예: `lock xadd`)으로 RMW 를 분할 불가하게 · 다른 스레드를 멈추거나 커널에 들어가지 않음" },
                { q: "asyncio 코루틴 안에서 `time.sleep(1)` 을 호출하면?", options: ["그 코루틴만 1초 멈춤", "이벤트 루프 전체가 멈춤", "자동으로 `await` 처럼 동작", "`RuntimeWarning` 후 무시"], a: 1, why: "`await` 가 없으면 루프로 제어가 돌아가지 않음 · 코루틴만 멈추려면 `await asyncio.sleep(1)`" },
                { q: "교착 상태를 막는 대표 규칙은?", options: ["락 대신 sleep 으로 타이밍 조절", "락을 잡은 채 오래 일하기", "스레드 수를 코어 수에 맞추기", "모두 같은 순서로 락 획득"], a: 3, why: "순환 대기 조건이 생기지 않음 · sleep 은 타이밍만 바꿀 뿐 교착을 없애지 못함" },
                { q: "I/O 대기가 대부분인 연결 1만 개를 처리할 때 가장 가벼운 모델은?", options: ["연결당 OS 스레드 1개", "연결당 프로세스 1개", "이벤트 루프 + 코루틴", "바쁜 대기(busy-wait) 폴링"], a: 2, why: "대기 중인 코루틴은 작은 상태 객체뿐 · 스레드는 연결마다 스택·커널 객체를 차지" },
                { type: "order", q: "출력되는 줄을 순서대로", code: { lang: "python", src: "async def fetch(name, delay):\n    print(f\"{name} 시작\")\n    await asyncio.sleep(delay)\n    print(f\"{name} 끝\")\n    return delay\n\nasync def main():\n    print(await asyncio.gather(fetch(\"A\", 1), fetch(\"B\", 2)))\n\nasyncio.run(main())" }, items: ["A 시작", "B 시작", "A 끝", "B 끝", "[1, 2]"], why: "A 가 `await` 에서 양보하자 루프가 B 를 시작 · 1초 뒤 A, 2초 뒤 B 재개 · 결과는 인자 순서" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "balance = 100\n\nasync def withdraw(amount):\n    global balance\n    if balance >= amount:\n        await asyncio.sleep(0)\n        balance -= amount\n\nasync def main():\n    await asyncio.gather(withdraw(80), withdraw(80))\n    print(balance)\n\nasyncio.run(main())" }, answer: ["-60"], why: "둘 다 100 을 보고 확인 통과 → `await` 에서 전환 → 둘 다 출금 · 단일 스레드여도 `await` 사이는 경쟁" },
                { type: "num", q: "초기값 0, 두 스레드가 `count++` (load → add → store) 를 **각 1번** 할 때 나올 수 있는 최솟값은?", answer: 1, why: "둘 다 0 을 읽고 각자 1 을 저장하면 1 · 하나의 증가가 사라지는 lost update" },
                { type: "order", q: "release/acquire 로 데이터를 넘길 때 보장되는 순서대로", items: ["생산자: `data = 42`", "생산자: `ready.store(true, release)`", "소비자: `ready.load(acquire)` 가 true", "소비자: `data` 를 읽으면 42"], why: "release 이전의 쓰기는 그 값을 acquire 로 읽은 스레드에 모두 보임 (happens-before)" },
                { type: "num", q: "두 스레드가 각자 `count++` (load → add → store) 를 **2번씩** 한다. 초기값 0 일 때 끼어들기 순서에 따라 나올 수 있는 최솟값은?", answer: 2, why: "4 가 아니라 2 까지 떨어짐 · A 가 0 을 읽은 채 멈추고 B 가 한 번 끝내면, A 의 쓰기(1)가 B 의 갱신을 덮고 이후 B 가 1 을 읽어 2 를 쓰는 식 · 모든 순서를 전수 탐색해 확인" }
            ],
            refs: [
                { title: "How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs", by: "Lamport", year: 1979, url: "https://lamport.azurewebsites.net/pubs/multi.pdf", kind: "paper" },
                { title: "A Less Formal Explanation of the Proposed C++ Concurrency Memory Model (N2480)", by: "Boehm", year: 2007, url: "https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2007/n2480.html", kind: "paper" },
                { title: "Coroutines and tasks (asyncio)", by: "Python Software Foundation", url: "https://docs.python.org/3/library/asyncio-task.html", kind: "doc" }
            ]
        },
        {
            id: "build",
            title: "컴파일과 링크",
            level: 1,
            mins: 12,
            checked: "2026-11-16",
            key: [
                "`.c` → 전처리(preprocessing) → 컴파일 → 어셈블 → `.o` → **링크**(linking) → 실행 파일(executable)",
                "컴파일은 파일 단위 · 다른 파일 함수는 **선언**(declaration)만 알면 됨",
                "링커(linker)가 심볼(symbol) 이름을 주소로 연결 · 없으면 `undefined reference`",
                "정적 링크(static linking)는 실행 파일에 포함, 동적 링크(dynamic linking)는 실행 시 로더(loader)가 연결"
            ],
            concepts: [
                { term: "심볼", en: "Symbol", def: "함수·전역 변수의 이름 · 오브젝트마다 정의(defined) / 미정의(U) 목록" },
                { term: "ODR", en: "One Definition Rule", def: "정의는 프로그램 전체에 하나 · 헤더엔 선언만 (C++ 은 inline 예외)" },
                { term: "내부 / 외부 링크", en: "Internal / External linkage", def: "`static` 은 파일 안에서만 보임 · 기본 전역은 다른 파일에서도 보임" },
                { term: "동적 로더", en: "Dynamic loader", def: "`ld.so` 가 실행 시 `.so` 를 메모리에 매핑하고 주소를 해결" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "src", label: "main.c", sub: "#include \"util.h\"", x: 0, y: 0 },
                    { id: "pre", label: "전처리", sub: "-E → main.i", x: 1, y: 0 },
                    { id: "cc", label: "컴파일", sub: "-S → main.s", x: 2, y: 0 },
                    { id: "as", label: "어셈블", sub: "-c → main.o", x: 3, y: 0 },
                    { id: "util", label: "util.o", sub: "add() 정의", x: 2, y: 1 },
                    { id: "ld", label: "링크", sub: "ld → app", x: 3, y: 1 },
                    { id: "lib", label: "libc.so", sub: "printf 정의", x: 2, y: 2 },
                    { id: "load", label: "로드·실행", sub: "ld.so → main()", x: 3, y: 2 }
                ],
                edges: [
                    { from: "src", to: "pre" },
                    { from: "pre", to: "cc" },
                    { from: "cc", to: "as" },
                    { from: "as", to: "ld" },
                    { from: "util", to: "ld" },
                    { from: "ld", to: "load", label: "exec" },
                    { from: "lib", to: "load", label: "mmap" }
                ],
                steps: [
                    { on: ["src", "src>pre", "pre"], text: "전처리: `#include` 붙여넣기 · 매크로 치환(macro expansion) · `#if` 정리" },
                    { on: ["pre>cc", "cc"], text: "컴파일: 문법·타입 검사, 최적화 → 어셈블리 · `add` 는 선언만 보고 호출" },
                    { on: ["cc>as", "as"], text: "어셈블: 기계어(machine code) `.o` · `add`, `printf` 는 **미정의 심볼**(undefined symbol)로 남김" },
                    { on: ["util", "util>ld"], text: "`util.c` 는 따로 컴파일된 번역 단위(translation unit) · `add` 를 정의" },
                    { on: ["as>ld", "ld"], text: "링커: 심볼을 정의에 맞추고 주소 확정 · 못 찾으면 `undefined reference`" },
                    { on: ["lib", "lib>load"], text: "`printf` 는 libc.so 에 · 실행 파일엔 '필요함' 표시만 (동적 링크)" },
                    { on: ["ld>load", "load"], text: "실행: 커널이 ELF 매핑 → `ld.so` 가 .so 연결 → `_start` → `main`" }
                ]
            },
            code: [
                {
                    lang: "c",
                    title: "헤더 + 두 번역 단위",
                    src: `// util.h — 선언만 (include guard)
#ifndef UTIL_H
#define UTIL_H
int add(int a, int b);
extern int counter;          // 선언: 정의는 util.c 에 하나
#endif

// util.c — 정의
#include "util.h"
int counter = 0;
int add(int a, int b) { counter++; return a + b; }

// main.c
#include <stdio.h>
#include "util.h"
int main(void) {
    printf("%d\\n", add(2, 3));      // 링크 때 util.o 의 add 와 연결
    printf("calls=%d\\n", counter);
    return 0;
}`,
                    note: "헤더에 `int counter = 0;` 을 두면 include 한 파일마다 정의 → 다중 정의(multiple definition) 에러"
                },
                {
                    lang: "sh",
                    title: "단계별로 직접 해보기",
                    src: `gcc -E main.c -o main.i       # 1) 전처리
gcc -S main.i -o main.s       # 2) 컴파일 → 어셈블리
gcc -c main.s -o main.o       # 3) 어셈블 → 오브젝트
gcc -c util.c -o util.o
gcc main.o util.o -o app      # 4) 링크 (libc 는 자동)

nm main.o                     # U add, U counter, U printf, T main
nm util.o                     # T add, B counter (정의됨)
objdump -dr main.o            # call 자리에 재배치 항목 (add)
readelf -d app | grep NEEDED  # libc.so.6 → 동적 링크
ldd ./app                     # 실행 시 찾을 .so 경로
./app`,
                    note: "`U` = 미정의, `T` = 코드 정의, `B` = 0 초기화 데이터(.bss)"
                }
            ],
            optimize: [
                {
                    title: "헤더 의존 줄이기: 전방 선언(forward declaration)",
                    before: { lang: "cpp", src: `// widget.h
#include "engine.h"      // 무거운 헤더 · 바뀌면 widget.h 쓰는 파일 전부 재컴파일
class Widget { Engine *eng; };` },
                    after: { lang: "cpp", src: `// widget.h
class Engine;            // 전방 선언: 포인터·참조만 쓰면 충분
class Widget { Engine *eng; };
// engine.h 는 widget.cpp 에서만 include` },
                    gain: "재컴파일 범위 축소 · 빌드 시간 단축"
                },
                {
                    title: "LTO: 파일 경계를 넘는 최적화",
                    before: { lang: "sh", src: `gcc -O2 -c a.c b.c
gcc -O2 a.o b.o -o app          # a.c 에서 b.c 의 작은 함수 인라인 불가` },
                    after: { lang: "sh", src: `gcc -O2 -flto -c a.c b.c
gcc -O2 -flto a.o b.o -o app    # 링크 때 전체를 보고 인라인·죽은 코드 제거` },
                    gain: "크기↓ · 속도↑ (코드에 따라 다름)"
                }
            ],
            glossary: [
                { term: "전처리기", en: "Preprocessor", def: "`#include`·`#define`·`#if` 를 처리해 순수 소스로 만드는 단계" },
                { term: "번역 단위", en: "Translation unit", def: "전처리를 마친 소스 파일 하나 · 컴파일의 기본 단위" },
                { term: "오브젝트 파일", en: "Object file", def: "기계어 + 심볼 테이블 + 재배치 정보 · 주소 미확정 (`.o`)" },
                { term: "링커", en: "Linker", def: "오브젝트들을 합치고 심볼 참조를 정의에 연결해 실행 파일 생성" },
                { term: "재배치", en: "Relocation", def: "확정된 주소로 명령·데이터의 주소 칸을 고쳐 쓰는 작업" },
                { term: "동적 링크", en: "Dynamic linking", def: "실행 시 로더가 공유 라이브러리(`.so`/`.dll`)를 연결" }
            ],
            quiz: [
                { q: "`undefined reference to 'add'` 는 어느 단계의 에러?", options: ["전처리", "컴파일", "링크", "실행"], a: 2, why: "선언은 있어 컴파일은 통과 · 정의를 못 찾은 것은 링커 · 실행 시 .so 를 못 찾는 에러는 메시지가 다름" },
                { q: "헤더에 `int counter = 0;` 을 두고 두 `.c` 에서 include 하면?", options: ["문제 없음 (자동 공유)", "링크 때 다중 정의 에러", "include guard 가 막아 줌", "실행 시 크래시"], a: 1, why: "번역 단위마다 정의가 생김 · include guard 는 한 번역 단위 안의 중복만 막음 · 헤더엔 `extern` 선언만" },
                { q: "`nm main.o` 의 `U printf` 의 의미는?", options: ["이 파일이 printf 를 정의함", "인라인되어 호출이 사라짐", "선언만 있고 안 쓰임", "미정의 · 링크/로드 때 해결"], a: 3, why: "U = undefined · 이 파일이 쓰지만 정의는 없음 → libc 에서 해결" },
                { q: "`static int helper(void)` 의 `static` 효과는?", options: ["내부 링크 (이 파일 전용)", "함수 코드가 정적 메모리에 배치", "호출될 때마다 인라인을 강제", "프로그램에서 한 번만 실행"], a: 0, why: "다른 번역 단위에서 안 보여 같은 이름과 충돌하지 않음 · 저장 위치나 실행 횟수와는 무관" },
                { q: "동적 링크의 장점이 **아닌** 것은?", options: ["여러 프로세스가 라이브러리 코드 페이지 공유", "라이브러리만 교체해 보안 패치", "대상에 `.so` 가 없어도 실행됨", "실행 파일 크기가 작아짐"], a: 2, why: "없으면 로더가 `cannot open shared object file` 로 실패 · 그 경우엔 정적 링크" },
                { type: "order", q: "`gcc main.c util.c -o app` 후 `./app` 까지, 단계를 순서대로", items: ["전처리 (`-E` → `.i`)", "컴파일 (`-S` → `.s`)", "어셈블 (`-c` → `.o`)", "링크 (`ld` → 실행 파일)", "로드 (`ld.so` 가 `.so` 연결)"], why: "링크 전까지는 파일 단위로 독립 · 동적 라이브러리 연결은 실행할 때 로더가 함" },
                { type: "num", q: "아래 `main.c` 를 `gcc -c` 한 뒤 `nm main.o` 에서 `U` 로 표시되는 심볼은 몇 개?", code: { lang: "c", src: "#include <stdio.h>\n#include \"util.h\"   // int add(int, int); extern int counter;\nint main(void) {\n    printf(\"%d\\n\", add(2, 3));\n    printf(\"calls=%d\\n\", counter);\n    return 0;\n}" }, answer: 3, why: "`add`, `counter`, `printf` 가 U · `main` 은 이 파일이 정의하므로 T" },
                { type: "text", q: "출력은?", code: { lang: "c", src: "#define SQ_BAD(x) x * x\nprintf(\"%d\\n\", SQ_BAD(1 + 2));" }, answer: ["5"], why: "텍스트 치환 → `1 + 2 * 1 + 2` = 5 · 인자와 전체를 괄호로 감싸야 9" },
                { type: "text", q: "g++ (Itanium C++ ABI) 에서 `int add(int, int)` 의 심볼 이름은?", answer: ["_Z3addii"], why: "`_Z` + 이름 길이 3 + `add` + 인자 `i`·`i` · C 라이브러리를 부를 땐 `extern \"C\"` 로 맹글링을 끔" }
            ],
            refs: [
                { title: "Using the GNU Compiler Collection — Options Controlling the Kind of Output", by: "GNU Project", url: "https://gcc.gnu.org/onlinedocs/gcc/Overall-Options.html", kind: "doc" },
                { title: "ld.so(8) — dynamic linker/loader", by: "Linux man-pages project", url: "https://man7.org/linux/man-pages/man8/ld.so.8.html", kind: "doc" },
                { title: "How To Write Shared Libraries", by: "Drepper", year: 2011, url: "https://www.akkadia.org/drepper/dsohowto.pdf", kind: "paper" },
                { title: "Linkers and Loaders", by: "Levine", year: 1999, url: "https://www.iecc.com/linker/", kind: "book" }
            ]
        },
        {
            id: "float",
            title: "부동소수점 IEEE 754",
            level: 2,
            mins: 15,
            pre: ["embedded/bits"],
            checked: "2026-11-16",
            key: [
                "값 = (−1)^부호 × 2^(지수 − bias) × 1.가수(significand) · fp32 = 1 + 8 + 23 bit",
                "`0.1` 은 2진수로 끝나지 않음 → 반올림해 저장 → `0.1 + 0.2 != 0.3`",
                "수가 클수록 간격 **ULP(unit in the last place)**도 커짐 → 큰 수 + 작은 수 = 손실",
                "fp16 은 최대 65504 로 좁고, bf16 은 fp32 범위에 가수 7bit"
            ],
            concepts: [
                { term: "지수 바이어스", en: "Exponent bias", def: "지수를 부호 없이 저장하려고 더하는 값 · fp32 127, fp16 15 · 저장 지수 = 실제 지수 + bias" },
                { term: "가수", en: "Significand (mantissa)", def: "정규 수는 맨 앞 1 을 생략(hidden bit) · fp32 는 23bit 저장 → 24bit 정밀도" },
                { term: "비정규 수", en: "Subnormal number", def: "지수 비트 0 · 앞자리 0 으로 0 근처를 고르게 채움 · 일부 FPU 에서 느림" },
                { term: "ULP", en: "Unit in the Last Place", def: "인접한 두 표현 가능 수의 간격 · 1.0 근처 fp32 ≈ 1.19e−7" },
                { term: "최근접 짝수 반올림", en: "Round half to even", def: "IEEE 754 기본 반올림 · 정확히 중간이면 마지막 비트가 0 인 쪽으로" }
            ],
            demo: { type: "sim", name: "float", format: "fp32", value: 0.1 },
            code: [
                {
                    lang: "c",
                    title: "float 비트 들여다보기",
                    src: `#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <float.h>

int main(void) {
    float f = 0.1f;
    uint32_t u;
    memcpy(&u, &f, sizeof u);           /* 포인터 캐스트 대신 memcpy (strict aliasing) */
    printf("0x%08X\\n", (unsigned)u);    /* 0x3DCCCCCD */
    printf("sign=%u exp=%u frac=0x%06X\\n",
           (unsigned)(u >> 31), (unsigned)((u >> 23) & 0xFF), (unsigned)(u & 0x7FFFFF));
    printf("%.20f\\n", f);               /* 0.10000000149011611938 */
    printf("eps=%g\\n", FLT_EPSILON);    /* 1.19209e-07 = 1.0 의 ULP */
    return 0;
}`,
                    note: "**최근접 짝수 반올림(round half to even)**으로 0.1 에 가장 가까운 fp32 가 저장됨 · 오차 ≈ 1.5e−9"
                },
                {
                    lang: "py",
                    title: "Python 으로 확인",
                    src: `import struct, math

print(0.1 + 0.2 == 0.3)                  # False
print(math.isclose(0.1 + 0.2, 0.3))      # True (rel_tol=1e-9)
print((0.1).hex())                       # 0x1.999999999999ap-4
print(struct.pack(">f", 0.1).hex())      # 3dcccccd  (fp32)
print(struct.pack(">e", 65504.0).hex())  # 7bff      (fp16 최대)
print(1e16 + 1.0 == 1e16)                # True: 1e16 근처 ULP = 2
print(math.ulp(1.0))                     # 2.220446049250313e-16`,
                    note: "`math.isclose` 기본은 상대 오차 1e−9 · 0 근처 비교는 `abs_tol` 도 지정"
                }
            ],
            optimize: [
                {
                    title: "Cortex-M4F: `0.5` 대신 `0.5f` — double 소프트웨어 연산 피하기",
                    before: { lang: "c", src: `float y = x * 0.5;     /* 0.5 는 double → x 도 double 로 승격 */
                       /* 단정밀도 FPU → double 은 라이브러리 호출 */` },
                    after: { lang: "c", src: `float y = x * 0.5f;    /* VMUL.F32 한 명령 */
/* GCC: -Wdouble-promotion 으로 숨은 승격 찾기 */` },
                    gain: "라이브러리 호출 → 1 명령",
                    note: "Cortex-M4F 의 FPU 는 단정밀도(fp32)만 하드웨어 지원 · `sinf`, `sqrtf` 처럼 `f` 접미사 함수 사용"
                },
                {
                    title: "누적 오차: 단순 합 대신 Kahan 보정 합",
                    before: { lang: "py", src: `s = 0.0
for x in xs:           # 1e16 + 1.0 + 1.0 … 작은 값이 계속 버려짐
    s += x` },
                    after: { lang: "py", src: `s, c = 0.0, 0.0
for x in xs:
    y = x - c          # 지난번에 잃은 만큼 보정
    t = s + y
    c = (t - s) - y    # 이번에 잃은 하위 비트
    s = t
# 또는 math.fsum(xs): 정확한 합을 한 번만 반올림` },
                    gain: "오차 ∝ n → ≈ 상수",
                    note: "fp32 로 오래 누적하는 값(센서 적분, 손실 합계)에서 특히 중요"
                }
            ],
            glossary: [
                { term: "기계 엡실론", en: "Machine epsilon", def: "1.0 과 바로 다음 수의 간격 · fp32 `FLT_EPSILON` ≈ 1.19e−7, fp64 ≈ 2.22e−16" },
                { term: "bfloat16", en: "Brain Floating Point (bf16)", def: "부호 1 · 지수 8 · 가수 7 · fp32 와 같은 범위 · fp32 상위 16bit 와 같은 배치" },
                { term: "NaN", en: "Not a Number", def: "지수 비트 전부 1 + 가수 ≠ 0 · `NaN != NaN` 이 참" },
                { term: "파국적 상쇄", en: "Catastrophic cancellation", def: "거의 같은 두 수를 빼면 유효 자리가 사라짐 · 작은 x 에서 `1 − cos x`" },
                { term: "고정소수점", en: "Fixed-point (Q format)", def: "정수에 소수부 비트 수를 정해 두는 표현 · Q15, Q7.8 · FPU 없는 MCU·DSP" },
                { term: "fp16", en: "IEEE 754 half precision (binary16)", def: "부호 1 · 지수 5 · 가수 10 · 최대 65504 · 추론·그래픽에 사용" }
            ],
            quiz: [
                { q: "fp32 지수 비트가 `01111011`(123)이면 실제 지수는?", options: ["123", "−4", "−3", "4"], a: 1, why: "123 − bias 127 = −4 · 0.1 ≈ 1.6 × 2⁻⁴" },
                { q: "`0.1 + 0.2 == 0.3` 이 거짓인 이유는?", options: ["x87 FPU 의 오래된 설계 버그", "셋 다 2진수로 정확히 못 담음", "덧셈 결합법칙이 깨져서", "비교 전에 fp32 로 줄어서"], a: 1, why: "각각 반올림된 값끼리 더한 결과가 0.3 의 반올림 값과 마지막 비트에서 다름 · 결합법칙은 항이 셋 이상일 때 이야기" },
                { q: "fp16 으로 70000 을 저장하면? (최근접 반올림)", options: ["70000", "65504", "+∞", "0"], a: 2, why: "65504 + ULP/2 = 65520 이상은 무한대로 반올림 · 최댓값에 멈추는(포화) 것은 IEEE 기본 동작이 아님" },
                { q: "bf16 과 fp16 의 차이로 맞는 것은?", options: ["bf16 이 가수가 길어 더 정밀함", "bf16 은 fp32 와 범위가 같음", "둘 다 지수 5bit 이고 가수만 다름", "fp16 은 부호 비트가 없음"], a: 1, why: "bf16 은 범위를 지키고 가수 7bit 로 정밀도를 포기 · 더 정밀한 쪽은 가수 10bit 인 fp16" },
                { q: "fp64 에서 `1e16 + 1.0` 의 결과는?", options: ["10000000000000001", "1e16", "오버플로", "NaN"], a: 1, why: "1e16 근처 ULP 는 2 · 1 은 정확히 절반 → 짝수 쪽으로 반올림되어 사라짐" },
                { type: "num", q: "fp32 로 `-2.5` 의 비트 패턴은? (16진 입력 가능)", answer: 0xC0200000, why: "−2.5 = −1.01₂ × 2¹ · 부호 1, 지수 1 + 127 = 128 (`10000000`), 가수 `010…0` → `0xC0200000`" },
                { type: "num", q: "fp32 에서 1.7e9 (Unix 시간, 초) 근처의 ULP 는 몇 초?", answer: 128, unit: "초", why: "1.7e9 는 [2³⁰, 2³¹) 구간 → ULP = 2^(30 − 23) = 128 · 타임스탬프를 fp32 로 두면 2분 단위로 뭉개짐" },
                { type: "text", q: "Python (fp64) 출력은?", code: { lang: "python", src: "print(0.1 + 0.2)" }, answer: ["0.30000000000000004"], why: "두 반올림 값의 합이 0.3 에 가장 가까운 fp64 보다 1 ULP 큼 · `repr` 은 그 값을 구분하는 최단 10진수로 출력" },
                { type: "order", q: "0.1 을 fp32 로 저장하는 과정을 순서대로", items: ["2진 전개 `0.000110011…` (무한 반복)", "정규화 `1.10011…₂ × 2⁻⁴`", "지수 −4 + 127 = 123", "가수 23bit 에서 최근접 짝수 반올림", "`0x3DCCCCCD` 저장"], why: "정규화해야 숨은 비트와 지수가 정해지고, 남는 비트는 마지막에 반올림 · 결과는 0.1 보다 약 1.49e−9 큼" }
            ],
            refs: [
                { title: "IEEE 754-2019 — IEEE Standard for Floating-Point Arithmetic", by: "IEEE", year: 2019, url: "https://standards.ieee.org/ieee/754/6210/", kind: "spec" },
                { title: "What Every Computer Scientist Should Know About Floating-Point Arithmetic", by: "David Goldberg", year: 1991, url: "https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html", kind: "paper" },
                { title: "Floating-Point Arithmetic: Issues and Limitations", by: "Python Software Foundation", url: "https://docs.python.org/3/tutorial/floatingpoint.html", kind: "doc" },
                { title: "BFloat16: The secret to high performance on Cloud TPUs", by: "Shibo Wang et al.", year: 2019, url: "https://cloud.google.com/blog/products/ai-machine-learning/bfloat16-the-secret-to-high-performance-on-cloud-tpus", kind: "doc" }
            ]
        },
        {
            id: "complexity",
            title: "자료구조와 복잡도",
            level: 1,
            mins: 12,
            checked: "2026-11-16",
            key: [
                "Big-O = 입력이 커질 때의 **증가율**(growth rate) · 상수와 작은 항은 무시",
                "배열(array): 인덱스 O(1), 중간 삽입 O(n) · 연결 리스트(linked list)는 반대지만 캐시에 약함",
                "해시 테이블(hash table): 평균 O(1) · 충돌(collision)이 몰리면 최악 O(n)",
                "동적 배열(dynamic array)은 2배씩 증가 → `append` **분할상환(amortized) O(1)**"
            ],
            concepts: [
                { term: "해시 함수", en: "Hash function", def: "키 → 정수 → `% 버킷 수` 로 위치 결정 · 같은 키는 항상 같은 값" },
                { term: "체이닝 / 개방 주소법", en: "Separate chaining / Open addressing", def: "충돌 시 버킷에 리스트로 연결 / 다음 빈칸을 탐사" },
                { term: "적재율 임계값", en: "Load factor threshold", def: "넘으면 버킷을 늘려 재해시 · 예: Java HashMap 0.75, Python dict ≈ 2/3" },
                { term: "캐시 지역성", en: "Cache locality", def: "연속 메모리는 같은 Big-O 라도 몇 배 빠를 수 있음" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "key", label: "키", sub: "put(\"lee\", 2)", x: 0, y: 0 },
                    { id: "hash", label: "해시 함수", sub: "h = hash(\"lee\")", x: 1, y: 0 },
                    { id: "idx", label: "버킷 선택", sub: "h % 4 = 1", x: 2, y: 0 },
                    { id: "b1", label: "버킷 1", sub: "kim → lee", x: 3, y: 0 },
                    { id: "lf", label: "적재율 검사", sub: "n/m > 0.75 ?", x: 3, y: 1 },
                    { id: "grow", label: "리사이즈", sub: "버킷 4 → 8", x: 2, y: 1 },
                    { id: "rehash", label: "재해시", sub: "모든 키 h % 8", x: 1, y: 1 },
                    { id: "done", label: "완료", sub: "평균 O(1) 유지", x: 0, y: 1 }
                ],
                edges: [
                    { from: "key", to: "hash" },
                    { from: "hash", to: "idx" },
                    { from: "idx", to: "b1" },
                    { from: "b1", to: "lf" },
                    { from: "lf", to: "grow", label: "초과" },
                    { from: "grow", to: "rehash" },
                    { from: "rehash", to: "done" }
                ],
                steps: [
                    { on: ["key", "key>hash", "hash"], text: "해시 함수(hash function): 키 → 정수 · 같은 키는 항상 같은 값" },
                    { on: ["hash>idx", "idx"], text: "`h % m` 으로 버킷(bucket) 선택 (m = 4) · 계산은 O(1)" },
                    { on: ["idx>b1", "b1"], text: "버킷 1 에 이미 `kim` → **충돌** · 체이닝(chaining)으로 뒤에 연결" },
                    { on: ["b1"], text: "조회도 같은 버킷의 체인을 키로 비교 · 한 버킷에 몰리면 O(n)" },
                    { on: ["b1>lf", "lf"], text: "삽입 후 적재율(load factor) n/m 검사 · 높을수록 체인이 길어짐" },
                    { on: ["lf>grow", "grow"], text: "임계 초과 → 버킷 배열을 **2배**로 새로 할당" },
                    { on: ["grow>rehash", "rehash"], text: "모든 키를 `h % 8` 로 다시 배치 · 이 삽입만 O(n)" },
                    { on: ["rehash>done", "done"], text: "2배씩 키워 리사이즈가 드묾 → 삽입 **분할상환 O(1)**" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "체이닝 해시 테이블 (최소 구현)",
                    src: `class HashMap:
    def __init__(self, m=4):
        self.buckets = [[] for _ in range(m)]
        self.n = 0

    def _slot(self, key):
        return self.buckets[hash(key) % len(self.buckets)]

    def put(self, key, value):
        slot = self._slot(key)
        for i, (k, _) in enumerate(slot):
            if k == key:                  # 같은 키 → 값 교체
                slot[i] = (key, value)
                return
        slot.append((key, value))         # 충돌이면 체인에 추가
        self.n += 1
        if self.n / len(self.buckets) > 0.75:
            self._resize(2 * len(self.buckets))

    def get(self, key):
        for k, v in self._slot(key):
            if k == key:
                return v
        raise KeyError(key)

    def _resize(self, m):
        old, self.buckets = self.buckets, [[] for _ in range(m)]
        for slot in old:                  # 모든 키 재해시: O(n)
            for k, v in slot:
                self._slot(k).append((k, v))`,
                    note: "실제 Python dict 는 개방 주소법(open addressing) + 삽입 순서 유지 배열"
                },
                {
                    lang: "python",
                    title: "이진 탐색 O(log n)",
                    src: `import bisect

def binary_search(a, target):
    lo, hi = 0, len(a)            # 정렬된 a 의 [lo, hi) 구간
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo if lo < len(a) and a[lo] == target else -1

a = [2, 3, 5, 7, 11, 13]
print(binary_search(a, 7))        # 3
print(bisect.bisect_left(a, 7))   # 3 · 표준 라이브러리
# 100만 개도 최대 약 20번 비교 (log2 10^6 ≈ 20)`,
                    note: "C/Java 는 `(lo + hi) / 2` 가 오버플로할 수 있음 → `lo + (hi - lo) / 2`"
                }
            ],
            optimize: [
                {
                    title: "중복 찾기: 모든 쌍 비교 → 집합(set)",
                    before: { lang: "python", src: `def has_dup(xs):
    for i in range(len(xs)):
        for j in range(i + 1, len(xs)):   # O(n²)
            if xs[i] == xs[j]:
                return True
    return False` },
                    after: { lang: "python", src: `def has_dup(xs):
    seen = set()                          # 해시 집합: 평균 O(1) 조회
    for x in xs:
        if x in seen:
            return True
        seen.add(x)
    return False` },
                    gain: "n=10⁵ 에서 비교 ~5×10⁹ → ~10⁵"
                },
                {
                    title: "큐: `list.pop(0)` → `deque`",
                    before: { lang: "python", src: `queue = list(items)
while queue:
    x = queue.pop(0)        # 앞에서 빼면 나머지를 한 칸씩 이동: O(n)
    process(x)` },
                    after: { lang: "python", src: `from collections import deque
queue = deque(items)
while queue:
    x = queue.popleft()     # 양끝 O(1)
    process(x)` },
                    gain: "전체 O(n²) → O(n)"
                }
            ],
            glossary: [
                { term: "Big-O", en: "Big-O notation", def: "입력 크기 n 에 따른 비용 증가율의 상한" },
                { term: "해시 테이블", en: "Hash table", def: "해시로 버킷을 정해 평균 O(1) 로 삽입·조회하는 자료구조" },
                { term: "해시 충돌", en: "Hash collision", def: "다른 키가 같은 버킷으로 가는 것 · 체이닝/개방 주소법으로 처리" },
                { term: "적재율", en: "Load factor", def: "원소 수 ÷ 버킷 수 · 리사이즈 시점을 결정" },
                { term: "분할상환 분석", en: "Amortized analysis", def: "가끔 비싼 연산을 전체 연산 수로 나눠 본 평균 비용" },
                { term: "이진 탐색", en: "Binary search", def: "정렬된 배열을 절반씩 줄여 O(log n) 에 찾기" }
            ],
            quiz: [
                { q: "정렬된 100만 개 배열을 이진 탐색할 때 최악 비교 횟수는 약?", options: ["20", "1000", "50만", "100만"], a: 0, why: "log2(10⁶) ≈ 20" },
                { q: "동적 배열 `append` 가 분할상환 O(1) 인 이유는?", options: ["항상 여분 칸이 남아 있어서", "내부가 연결 리스트라서", "OS 가 페이지를 미리 할당해서", "용량을 배수로 늘려서"], a: 3, why: "복사 총량이 n 에 비례 → 원소당 상수 · 꽉 차면 여분 칸은 없고 그때 O(n) 복사가 일어남" },
                { q: "해시 테이블이 최악 O(n) 이 되는 경우는?", options: ["버킷 수가 원소보다 많을 때", "키가 모두 정수일 때", "키가 한 버킷에 몰릴 때", "리사이즈 직후 첫 조회"], a: 2, why: "체인 하나를 끝까지 비교해야 함 · 리사이즈 자체는 그 삽입 한 번만 O(n)" },
                { q: "Python `list.pop(0)` 의 복잡도는?", options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], a: 1, why: "뒤 원소들을 한 칸씩 당겨야 함 · 양끝 O(1) 이 필요하면 `deque.popleft()`" },
                { q: "같은 O(n) 순회인데 배열이 연결 리스트보다 빠른 주된 이유는?", options: ["캐시 지역성", "배열의 Big-O 가 더 낮아서", "포인터가 원소보다 작아서", "리스트는 분기 예측이 안 돼서"], a: 0, why: "연속 메모리라 한 캐시 라인에 원소 여럿 + 프리페치 · Big-O 는 둘 다 O(n)" },
                { type: "num", q: "용량 1 에서 시작해 꽉 차면 **2배**로 늘리는 동적 배열에 `append` 16번. 재할당 때 복사되는 원소는 총 몇 개?", answer: 15, why: "1 + 2 + 4 + 8 = 15 < n · 원소당 상수 → 분할상환 O(1)" },
                { type: "num", q: "같은 조건에서 꽉 차면 용량을 **+1** 씩 늘리면 복사되는 원소는 총 몇 개?", answer: 120, why: "1 + 2 + … + 15 = 120 ≈ n²/2 · append 하나가 평균 O(n)" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "import bisect\na = [10, 20, 20, 30]\nprint(bisect.bisect_left(a, 20), bisect.bisect_right(a, 20))" }, answer: ["1 3"], why: "left 는 같은 값 중 가장 왼쪽 위치, right 는 마지막 20 의 다음 위치 · 차이 2 = 20 의 개수" },
                { type: "order", q: "n = 10⁶ 일 때 연산 수가 작은 것부터", items: ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)"], why: "1 · ≈ 20 · 10⁶ · ≈ 2×10⁷ · 10¹²" }
            ],
            refs: [
                { title: "The Art of Computer Programming, Vol. 3: Sorting and Searching (2nd ed.)", by: "Knuth", year: 1998, url: "https://www-cs-faculty.stanford.edu/~knuth/taocp.html", kind: "book" },
                { title: "Time complexity of operations on built-in types", by: "Python Software Foundation", url: "https://docs.python.org/3/builtins/time-complexity.html", kind: "doc" },
                { title: "collections — Container datatypes", by: "Python Software Foundation", url: "https://docs.python.org/3/library/collections.html", kind: "doc" }
            ]
        },
        {
            id: "plt-basics",
            title: "언어론 기초 — 구문·의미·타입·평가",
            level: 1,
            mins: 15,
            pre: ["languages/build"],
            checked: "2026-11-19",
            key: [
                "**구문(syntax)**은 모양, **의미론(semantics)**은 실행 결과 · 문법은 BNF·PEG 로 적음",
                "컴파일러는 **추상 구문 트리(abstract syntax tree, AST)**를, LLM 은 토큰 줄을 봄",
                "정적/동적 = 타입을 **언제** 검사 · 강/약 = 암묵 변환을 **얼마나** 허용",
                "**타입 건전성(type soundness)**: 검사를 통과하면 실행 중 타입 붕괴 없음 (Milner 1978)",
                "**평가 전략(evaluation strategy)**: 인자를 먼저(엄격) vs 필요할 때(**지연 평가(lazy evaluation)**)"
            ],
            concepts: [
                { term: "구문", en: "Syntax", def: "어떤 문자열이 프로그램으로 '모양이 맞는지'를 정하는 규칙 · 문법(grammar)으로 적음" },
                { term: "의미론", en: "Semantics", def: "모양이 맞는 프로그램이 '무엇을 하는지'를 정하는 규칙 · 같은 `*` 도 타입마다 의미가 다름" },
                { term: "추상 구문 트리", en: "Abstract Syntax Tree (AST)", def: "괄호·공백을 버리고 연산 구조만 남긴 나무 · 우선순위가 모양에 들어감" },
                { term: "타입 건전성", en: "Type soundness", def: "타입 검사를 통과한 프로그램은 실행 중 타입 오류로 '잘못되지' 않는다는 성질" },
                { term: "평가 전략", en: "Evaluation strategy", def: "식을 언제 계산하나 · 엄격(값 먼저) vs 지연(필요할 때)" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "llm", label: "LLM", sub: "토큰을 하나씩 출력", x: 0, y: 0 },
                    { id: "src", label: "소스 코드", sub: "x = 1 + 2 * y", x: 1, y: 0 },
                    { id: "lex", label: "어휘 분석", sub: "NAME OP NUMBER…", x: 2, y: 0 },
                    { id: "parse", label: "구문 분석", sub: "문법 규칙 적용", x: 3, y: 0 },
                    { id: "ast", label: "AST", sub: "BinOp(1,+,BinOp…)", x: 3, y: 1 },
                    { id: "tc", label: "타입 검사", sub: "int + int → int", x: 2, y: 1 },
                    { id: "ir", label: "IR", sub: "바이트코드·LLVM IR", x: 1, y: 1 },
                    { id: "run", label: "실행", sub: "기계어 / VM", x: 0, y: 1 }
                ],
                edges: [
                    { from: "llm", to: "src", label: "생성" },
                    { from: "src", to: "lex" },
                    { from: "lex", to: "parse" },
                    { from: "parse", to: "ast" },
                    { from: "ast", to: "tc" },
                    { from: "tc", to: "ir" },
                    { from: "ir", to: "run" }
                ],
                steps: [
                    { on: ["llm", "llm>src"], text: "LLM 은 다음 토큰을 확률로 고를 뿐 · 결과는 아직 '그럴듯한 텍스트'이고 문법도 보장 안 됨" },
                    { on: ["src", "src>lex", "lex"], text: "**어휘 분석기(lexer)**: 문자 → 토큰 `x` `=` `1` `+` `2` `*` `y` · 공백·주석은 사라짐" },
                    { on: ["lex>parse", "parse"], text: "**구문 분석기(parser)**: 토큰 줄을 문법 규칙에 맞춰 나무로 · 괄호 짝이 틀리면 여기서 SyntaxError" },
                    { on: ["parse>ast", "ast"], text: "AST: `1 + 2 * y` → `BinOp(1, +, BinOp(2, *, y))` · 곱셈이 먼저라는 규칙이 나무 모양에 박힘" },
                    { on: ["ast>tc", "tc"], text: "정적 언어는 실행 전에 여기서 타입을 거름 · Python 은 이 검사가 실행 중(동적)에 일어남" },
                    { on: ["tc>ir", "ir"], text: "중간 표현(IR)으로 낮춤 · CPython 은 바이트코드, Clang 은 LLVM IR" },
                    { on: ["ir>run", "run"], text: "실행: 의미 규칙대로 값이 나와야 함 · LLM 이 쓴 코드도 결국 이 줄을 모두 통과해야 '동작'" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "같은 한 줄: 토큰 → AST → 의미 검사",
                    src: `import ast, io, tokenize

src = "x = 1 + 2 * y"

# 1) 어휘 분석: 문자 → 토큰
toks = [t.string for t in tokenize.generate_tokens(io.StringIO(src).readline)
        if t.type not in (tokenize.NEWLINE, tokenize.ENDMARKER)]
print(toks)        # ['x', '=', '1', '+', '2', '*', 'y']

# 2) 구문 분석: 토큰 → 나무 (우선순위가 모양으로)
print(ast.dump(ast.parse(src).body[0].value))
# BinOp(left=Constant(value=1), op=Add(),
#       right=BinOp(left=Constant(value=2), op=Mult(), right=Name(id='y', ctx=Load())))

# 3) 모양은 맞아도 규칙 위반은 다음 단계에서
ast.parse("return 42")                 # 트리는 만들어짐
compile("return 42", "m.py", "exec")   # SyntaxError: 'return' outside function`,
                    note: "Python 3.14 에서 실행 · `tokenize` 토큰은 문법 단위, LLM 토큰(BPE)은 통계 단위라 경계가 다름"
                },
                {
                    lang: "python",
                    title: "두 축: 언제 검사하나(정적/동적) · 얼마나 변환하나(강/약)",
                    src: `def area(w, h):
    return w * h

print(area(3, 4))      # 12
print(area("ab", 3))   # ababab   ← 동적 타입: 실행해 봐야 무슨 일인지 앎
print(1 + "1")         # TypeError: unsupported operand type(s) for +: 'int' and 'str'
                       #          ← 강한 타입: 암묵 변환 거부

# JavaScript (Node):  1 + "1" → "11",  "3" * "4" → 12   ← 약한 타입: 알아서 변환`,
                    note: "Python·JS 는 둘 다 동적 · 차이는 강/약 축 · C 는 정적이지만 `int`↔`double`·포인터 변환에 관대"
                }
            ],
            optimize: [
                {
                    title: "설정 문자열 읽기: `eval` → `ast.literal_eval`",
                    before: { lang: "python", src: `cfg = eval(open("cfg.txt").read())   # 문자열을 '코드'로 실행 → 무엇이든 실행됨` },
                    after: { lang: "python", src: `import ast
text = open("cfg.txt").read()
if len(text) > 10_000:                 # 문서: 큰 입력은 메모리·스택을 소모할 수 있음
    raise ValueError("config too large")
cfg = ast.literal_eval(text)           # 리터럴(숫자·문자열·list·dict…)만 허용
# literal_eval("__import__('os').getcwd()") → ValueError: malformed node or string on line 1: Call` },
                    gain: "함수 호출이 든 입력은 실행 전에 거부",
                    note: "구문 분석 결과(AST)에서 허용한 노드만 값으로 바꿈 · 실행이 아니라 '모양 검사'"
                },
                {
                    title: "실행해야 터지는 타입 오류 → 주석 + 정적 검사",
                    before: { lang: "python", src: `def total(items):
    return sum(i.price for i in items)

total([Item("pen", 3), {"name": "cup", "price": 5}])
# 실행 중: AttributeError: 'dict' object has no attribute 'price'` },
                    after: { lang: "python", src: `def total(items: list[Item]) -> int:
    return sum(i.price for i in items)

total([Item("pen", 3), {"name": "cup", "price": 5}])
# mypy: error: List item 1 has incompatible type "dict[str, object]"; expected "Item"  [list-item]` },
                    gain: "실행 전 발견",
                    note: "mypy 2.4.1 실제 출력 · Python 은 주석을 실행 중에 검사하지 않음 → 검사기를 따로 돌려야 함"
                }
            ],
            glossary: [
                { term: "BNF", en: "Backus–Naur Form", def: "`<expr> ::= <expr> \"+\" <term> | <term>` 식으로 문법을 적는 표기 · ALGOL 60 보고서로 널리 퍼짐" },
                { term: "PEG", en: "Parsing Expression Grammar", def: "순서 있는 선택(앞 대안 우선)이라 모호함이 없는 문법 표기 · CPython 3.9 부터 파서 문법" },
                { term: "어휘 분석기", en: "Lexer (lexical analyzer)", def: "문자열을 토큰(이름·숫자·연산자)으로 자르는 단계 · 공백·주석은 여기서 사라짐" },
                { term: "구문 분석기", en: "Parser", def: "토큰 줄을 문법 규칙에 맞춰 트리로 만드는 단계 · 괄호 짝이 틀리면 여기서 오류" },
                { term: "힌들리-밀너 타입 추론", en: "Hindley–Milner type inference", def: "주석 없이 가장 일반적인 타입을 찾는 방법 · ML·OCaml·Haskell 의 기반 (Milner 1978 의 알고리즘 W)" },
                { term: "지연 평가", en: "Lazy evaluation", def: "값이 필요할 때까지 계산을 미룸 · Haskell 기본, Python 은 제너레이터·`and`/`or` 에서 부분적으로" }
            ],
            quiz: [
                { q: "`1 + \"1\"` 이 Python 에선 TypeError, JavaScript 에선 \"11\". 이 차이를 가르는 축은?", options: ["정적 vs 동적 타입", "강한 vs 약한 타입", "컴파일 vs 인터프리트", "엄격 vs 지연 평가"], a: 1, why: "둘 다 동적 타입 · 차이는 암묵 변환을 허용하느냐 (JS 는 약한 타입이라 숫자를 문자열로 바꿈)" },
                { q: "함수 밖에 `return 42` 한 줄만 있는 소스를 `ast.parse` 하면?", options: ["SyntaxError 발생", "트리가 만들어짐", "TypeError 발생", "None 을 반환"], a: 1, why: "문장 모양은 문법에 맞음 · 'return 은 함수 안에서만'은 compile 단계 검사 (실행 결과: 'return' outside function)" },
                { q: "Milner (1978) 의 의미 건전성 정리가 말하는 것은?", options: ["타입 검사기는 어떤 입력에서도 유한 시간에 끝난다", "잘 타입된 프로그램은 '잘못되지' 않는다", "타입이 맞으면 논리 버그도 없다", "모든 변수에 타입 주석이 필요하다"], a: 1, why: "'well-typed programs cannot go wrong' = 타입 오류로 인한 실행 중 붕괴가 없음 · 논리 버그까지 막지는 않음" },
                { q: "엄격 평가 언어에서 `f(g())` 를 부르면 `g()` 는 언제 계산되나?", options: ["f 본문에서 처음 쓰일 때", "f 로 들어가기 전에", "f 가 반환된 뒤에", "결과를 출력할 때"], a: 1, why: "엄격 평가(Python·C·Java)는 인자를 먼저 계산 · '처음 쓰일 때'는 지연 평가(Haskell)" },
                { q: "Hindley–Milner 추론으로 OCaml `fun x -> x` 의 타입은?", options: ["int -> int", "'a -> 'a", "unit -> unit", "추론할 수 없음"], a: 1, why: "x 에 아무 제약이 없으니 가장 일반적인 타입은 다형 타입 'a -> 'a · 주석 없이 결정됨" },
                { q: "제약 없는 디코딩으로 LLM 이 낸 코드에 대해, 컴파일러에 넣기 전에 보장되는 것은?", options: ["문법이 맞음", "타입이 맞음", "아무것도 없음", "테스트 통과"], a: 2, why: "모델은 확률로 다음 토큰을 고를 뿐 · 문법·타입 보장은 제약 디코딩이나 검사기를 붙여야 생김" },
                { type: "num", q: "`tokenize` 로 `x = 1 + 2 * y` 를 자르면 NEWLINE·ENDMARKER 를 빼고 토큰이 몇 개?", answer: 7, tol: 0, unit: "개", why: "x, =, 1, +, 2, *, y · 공백은 토큰이 아님 (Python 3.14 실행)" },
                { type: "num", q: "출력은? (`range(10**9)` 인데 바로 끝난다)", code: { lang: "python", src: "gen = (x * x for x in range(10**9))\nprint(next(gen) + next(gen) + next(gen))" }, answer: 5, tol: 0, why: "제너레이터는 지연 평가 · 요청한 0, 1, 4 만 계산 → 5" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "print(1 + 2 * 3 ** 2)" }, answer: ["19"], why: "문법이 우선순위를 정함: `**` > `*` > `+` → 1 + 2 × 9 = 19" },
                { type: "text", q: "출력은? (Node.js)", code: { lang: "js", src: "console.log(1 + \"1\", \"3\" * \"4\")" }, answer: ["11 12"], why: "약한 타입: `+` 는 문자열이 있으면 연결, `*` 는 숫자로 변환 → \"11\", 12" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "def loud(v):\n    print(v, end=\" \")\n    return v\n\nx = loud(0) and loud(1)\ny = loud(2) or loud(3)\nprint(x, y)" }, answer: ["0 2 0 2"], why: "단락 평가: `and` 는 왼쪽이 거짓(0)이면, `or` 는 왼쪽이 참(2)이면 오른쪽을 계산하지 않음 → 1, 3 은 출력 안 됨" },
                { type: "order", q: "컴파일러가 소스를 처리하는 순서", items: ["어휘 분석 (토큰)", "구문 분석 (AST)", "의미 분석·타입 검사", "중간 표현(IR) 생성", "최적화·코드 생성"], why: "모양 → 뜻 → 낮은 표현 → 기계어 · 앞 단계 오류는 뒤 단계에 닿지 못함" }
            ],
            refs: [
                { title: "A Theory of Type Polymorphism in Programming", by: "Milner", year: 1978, url: "https://homepages.inf.ed.ac.uk/wadler/papers/papers-we-love/milner-type-polymorphism.pdf", kind: "paper" },
                { title: "Why Functional Programming Matters", by: "Hughes", year: 1990, url: "https://www.cs.kent.ac.uk/people/staff/dat/miranda/whyfp90.pdf", kind: "paper" },
                { title: "Full Grammar specification", by: "Python Software Foundation", url: "https://docs.python.org/3/reference/grammar.html", kind: "spec" },
                { title: "ast — Abstract syntax trees", by: "Python Software Foundation", url: "https://docs.python.org/3/library/ast.html", kind: "doc" }
            ]
        },
        {
            id: "lang-ai-stack",
            title: "AI 스택의 언어 — 위는 Python, 아래는 C++·CUDA",
            level: 2,
            mins: 18,
            pre: ["languages/python-internals", "languages/plt-basics"],
            checked: "2026-11-19",
            key: [
                "**두 언어 문제(two-language problem)**: 시제품은 쉬운 언어, 속도는 다른 언어로 다시",
                "ML 의 타협: Python 은 **접착 언어(glue language)**, 계산은 C++·CUDA 커널",
                "연산마다 µs 단위 호출 비용 · 작은 연산이 수천 개면 계산보다 호출이 병목",
                "**즉시 실행(eager execution)** → 그래프 캡처 → **커널 융합(kernel fusion)** (`torch.compile`)",
                "커널은 DSL 로: Triton(타일 단위) · CUDA C++ · MLIR 로 여러 하드웨어"
            ],
            concepts: [
                { term: "두 언어 문제", en: "Two-language problem", def: "시제품은 쉬운 고수준 언어로, 성능·배포용은 다른 언어로 다시 쓰는 관행 (Bezanson et al.)" },
                { term: "외부 함수 인터페이스", en: "Foreign Function Interface (FFI)", def: "다른 언어로 컴파일된 함수를 부르는 통로 · Python C API, ctypes, pybind11" },
                { term: "즉시 실행", en: "Eager execution", def: "연산을 만나는 즉시 실행 (define-by-run) · 디버깅 쉬움, 연산 사이 최적화는 어려움" },
                { term: "추적 JIT", en: "Tracing just-in-time (JIT) compilation", def: "가짜 값으로 함수를 한 번 돌려 연산을 기록하고 그 그래프를 컴파일 · `jax.jit`" },
                { term: "커널 융합", en: "Kernel fusion", def: "원소별 연산 여러 개를 커널 하나로 묶어 메모리 왕복을 줄임" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "py", label: "Python", sub: "relu(x * 2 + 1)", x: 0, y: 0 },
                    { id: "disp", label: "디스패처", sub: "C++ · dtype·device", x: 1, y: 0 },
                    { id: "k3", label: "커널 ×3", sub: "mul · add · relu", x: 2, y: 0 },
                    { id: "gpu", label: "GPU 메모리", sub: "왕복 3번", x: 3, y: 0 },
                    { id: "dyn", label: "Dynamo", sub: "바이트코드 → 그래프", x: 1, y: 1 },
                    { id: "ind", label: "Inductor", sub: "융합 + 코드 생성", x: 2, y: 1 },
                    { id: "tri", label: "Triton 커널", sub: "mul+add+relu 1개", x: 3, y: 1 }
                ],
                edges: [
                    { from: "py", to: "disp", label: "eager" },
                    { from: "disp", to: "k3" },
                    { from: "k3", to: "gpu" },
                    { from: "py", to: "dyn", label: "compile" },
                    { from: "dyn", to: "ind" },
                    { from: "ind", to: "tri" },
                    { from: "tri", to: "gpu" }
                ],
                steps: [
                    { on: ["py"], text: "모델 코드는 Python · 읽고 바꾸기 쉬움 · 무거운 계산은 여기서 하지 않음" },
                    { on: ["py>disp", "disp"], text: "**즉시 실행(eager execution)**: 연산마다 Python → C++ 디스패처 · **외부 함수 인터페이스(FFI)** 너머에서 dtype·장치를 보고 커널 선택" },
                    { on: ["disp>k3", "k3", "k3>gpu", "gpu"], text: "mul, add, relu 가 커널 3개 · 중간 결과가 메모리를 매번 읽고 씀 · 호출 비용도 3번" },
                    { on: ["py>dyn", "dyn"], text: "`torch.compile`: TorchDynamo 가 Python 프레임 실행에 끼어들어 바이트코드를 분석 → 연산 그래프(FX) 추출" },
                    { on: ["dyn>ind", "ind"], text: "TorchInductor: 그래프 전체를 보고 **커널 융합(kernel fusion)** · GPU 는 Triton, CPU 는 C++/OpenMP 코드 생성" },
                    { on: ["ind>tri", "tri", "tri>gpu", "gpu"], text: "커널 1개가 x 를 한 번 읽고 결과를 한 번 씀 · Python 코드는 그대로, 아래층만 바뀜" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "추적의 원리: 값 대신 '기록하는 객체'를 넣어 함수를 한 번 돌린다",
                    src: `class T:  # 아주 작은 추적기: 값을 계산하지 않고 연산을 기록한다
    def __init__(self, name, log):
        self.name, self.log = name, log
    def _op(self, op, k):
        out = T(f"t{len(self.log)}", self.log)
        self.log.append((out.name, op, self.name, k))
        return out
    def __mul__(self, k): return self._op("mul", k)
    def __add__(self, k): return self._op("add", k)
    def __bool__(self): raise TypeError("추적 중에는 값으로 분기할 수 없다")

def f(x):
    print("Python 본문 실행")   # 추적할 때 한 번만 실행된다
    return x * 2 + 1

log = []
f(T("x", log))
print(log)    # [('t0', 'mul', 'x', 2), ('t1', 'add', 't0', 1)]

def g(x):
    if x:                       # 값에 따른 분기 → 기록할 수 없음
        return x * 2
    return x
g(T("x", []))  # TypeError: 추적 중에는 값으로 분기할 수 없다`,
                    note: "**연산자 오버로딩(operator overloading)** 덕분에 같은 `f` 가 숫자에도, 추적기에도 동작 · `jax.jit` 의 tracer 와 같은 발상"
                },
                {
                    lang: "python",
                    title: "torch.compile 이 그래프를 끊는 곳 보기",
                    src: `import torch

def f(x):
    y = x * 2
    if y.sum() > 0:              # 텐서 '값'에 따른 분기
        return torch.relu(y + 1)
    return y

print(torch._dynamo.explain(f)(torch.randn(8)))
# Break Reasons:
#   Break Reason 1:
#     Reason: generic_jump TensorVariable()      ← if 줄(4행)에서 그래프가 끊김

fast = torch.compile(f)   # 첫 호출: 캡처 + 코드 생성(느림) · 이후: 가드 확인 후 캐시된 코드`,
                    note: "torch 2.15.0 (CPU) 에서 실행한 `explain` 출력 · 끊긴 곳마다 Python 으로 돌아와 다시 그래프를 시작"
                }
            ],
            optimize: [
                {
                    title: "작은 배열 1만 번 → 큰 배열 한 번 (호출 묶기)",
                    before: { lang: "python", src: `small = [np.ones(4) for _ in range(10000)]
out = [v * 2.0 for v in small]        # 호출 1만 번: 5.1–5.4 ms` },
                    after: { lang: "python", src: `big = np.ones((10000, 4))
out = big * 2.0                       # 호출 1번: 0.006–0.009 ms` },
                    gain: "×575–794 (이 PC 측정)",
                    note: "계산량은 같음 · 차이는 호출당 약 0.5 µs 의 Python·디스패치 비용 (NumPy 2.4, Python 3.14) · torch CPU 작은 연산은 약 3 µs"
                },
                {
                    title: "원소별 연산 3개 → 융합 커널 1개",
                    before: { lang: "python", src: `y = torch.relu(x * 2 + 1)    # eager: mul, add, relu 커널 3개
# x: float32 100만 개 → 커널마다 4 MB 읽고 4 MB 씀 = 24 MB` },
                    after: { lang: "python", src: `f = torch.compile(lambda x: torch.relu(x * 2 + 1))
y = f(x)                     # 융합 커널 1개: 4 MB 읽고 4 MB 씀 = 8 MB` },
                    gain: "메모리 트래픽 24 → 8 MB",
                    note: "원소별 연산은 메모리 대역폭이 한계라 트래픽이 곧 시간 · 첫 호출은 컴파일 시간, 모양이 바뀌면 재컴파일"
                }
            ],
            glossary: [
                { term: "접착 언어", en: "Glue language", def: "다른 언어로 만든 부품을 이어 붙이는 언어 · 느려도 전체 시간에서 비중이 작으면 문제없음" },
                { term: "스테이징", en: "Multi-stage programming (staging)", def: "프로그램이 '나중에 실행할 프로그램'을 만드는 기법 · 추적 JIT 은 Python 으로 그래프를 만드는 스테이징" },
                { term: "중간 표현", en: "Intermediate Representation (IR)", def: "소스와 기계어 사이의 형태 · FX 그래프, LLVM IR, MLIR 방언(dialect)" },
                { term: "도메인 특화 언어", en: "Domain-Specific Language (DSL)", def: "한 분야만 잘 표현하는 작은 언어 · SQL, 정규식, Triton" },
                { term: "연산자 오버로딩", en: "Operator overloading", def: "`*`·`+` 의 의미를 타입마다 정의 · NumPy·PyTorch·추적기가 Python 문법을 빌려 쓰는 바탕" },
                { term: "배열 API 표준", en: "Python array API standard", def: "NumPy·PyTorch·CuPy·JAX 등이 맞추는 공통 배열 함수 규격 · 최신판 2025.12" }
            ],
            quiz: [
                { q: "Bezanson et al. 이 말한 '두 언어 문제'는?", options: ["시제품과 배포용을 다른 언어로 다시 씀", "Python 2 와 3 을 함께 유지해야 함", "타입 있는 언어와 없는 언어를 섞어 씀", "CPU 코드와 GPU 코드를 따로 빌드함"], a: 0, why: "'프로토타입은 한 언어, 속도·배포는 다른 언어로 재작성' · Julia 는 이 관행을 없애려 함" },
                { q: "GPU 에서 작은 텐서 연산 1만 개가 느린 주된 이유는?", options: ["GPU 산술 유닛이 작은 텐서에서 느려서", "연산마다 Python·디스패치·실행 비용이 붙어서", "GIL 이 GPU 커널 실행을 직렬화해서", "PyTorch 기본 dtype 이 float64 라서"], a: 1, why: "계산은 금방 끝나도 호출 비용이 연산 수만큼 쌓임 · PyTorch 기본 dtype 은 float32" },
                { q: "`torch.compile` 에서 TorchDynamo 가 하는 일은?", options: ["Python 바이트코드를 분석해 그래프 추출", "CUDA C++ 커널을 사람 대신 손으로 작성", "모델 가중치를 INT8 로 자동 양자화해 저장", "Python 소스를 C 로 번역해 배포"], a: 0, why: "CPython 프레임 평가 API 에 끼어들어 실행 직전 바이트코드에서 연산을 FX 그래프로 뽑음 (Ansel et al. 2024)" },
                { q: "`jax.jit` 함수 안의 `print(x)` 는?", options: ["매 호출마다 실제 값을 출력", "추적할 때 한 번, 추적값을 출력", "컴파일 오류로 실행되지 않음", "GPU 쪽 로그에만 출력"], a: 1, why: "print 는 Python 부수효과라 추적 중에만 실행되고 그래프에 안 남음 · 실행 중 값은 `jax.debug.print`" },
                { q: "Triton(Tillet et al. 2019)이 커널을 표현하는 기본 단위는?", options: ["스레드 하나", "타일(블록)", "워프 하나", "텐서 전체"], a: 1, why: "정적 모양의 다차원 부분 배열(tile) 단위로 쓰면 컴파일러가 스레드 배치·메모리 이동을 맡음" },
                { q: "추적 JIT 에서 `if x.sum() > 0:` 처럼 텐서 값으로 분기하면?", options: ["항상 참인 쪽으로 고정됨", "그래프 끊김 또는 추적 오류", "자동으로 GPU 분기로 바뀜", "아무 영향 없음"], a: 1, why: "추적 때는 값을 모름 · JAX 는 TracerBoolConversionError, Dynamo 는 그래프를 끊고 Python 으로 돌아감" },
                { q: "Python 배열 API 표준의 목적은?", options: ["배열 라이브러리 공통 함수 규격", "CUDA·ROCm 드라이버 공통 규격", "넘파이 전용 타입 힌트 규격", "텐서 저장용 파일 형식 규격"], a: 0, why: "'A common API for array and tensor Python libraries' · 같은 코드가 NumPy·PyTorch·CuPy 배열에서 동작" },
                { type: "num", q: "연산 하나에 호출 비용 10 µs + 계산 2 µs, 연산 500개(eager). 융합해 커널 20개(커널당 호출 10 µs, 계산 합 1 ms 그대로)로 줄이면 몇 배 빨라지나?", answer: 5, tol: 0.01, unit: "배", why: "500 × 12 µs = 6 ms → 20 × 10 µs + 1,000 µs = 1.2 ms · 6 / 1.2 = 5" },
                { type: "num", q: "float32 100만 개에 mul·add·relu 를 커널 3개로(각 커널 읽기 1번 + 쓰기 1번). 총 메모리 트래픽은 몇 MB? (1 MB = 10⁶ B)", answer: 24, tol: 0, unit: "MB", why: "3 × (4 MB + 4 MB) = 24 MB · 융합하면 8 MB" },
                { type: "text", q: "'추적의 원리' 코드의 `T`, `f` 로 아래를 실행하면 **마지막 줄** 출력은?", code: { lang: "python", src: "log = []\nf(T(\"x\", log))\nprint(len(log), log[-1][1])" }, answer: ["2 add"], why: "첫 줄은 f 본문의 'Python 본문 실행' · 기록은 mul, add 두 개이고 마지막은 add" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "import numpy as np\nprint([1, 2] * 2, np.array([1, 2]) * 2)" }, answer: ["[1, 2, 1, 2] [2 4]"], why: "같은 `*` 구문, 다른 의미: list 는 반복, ndarray 는 원소별 곱 (연산자 오버로딩)" },
                { type: "order", q: "`torch.compile` 함수의 첫 호출에서 일어나는 순서", items: ["Dynamo 가 프레임 실행에 끼어듦", "바이트코드 분석 → FX 그래프", "Inductor 가 Triton·C++ 코드 생성", "컴파일된 코드를 캐시하고 실행"], why: "두 번째 호출부터는 가드(입력 모양·타입)만 확인하고 캐시를 씀" }
            ],
            refs: [
                { title: "Julia: A Fresh Approach to Numerical Computing", by: "Bezanson et al.", year: 2014, url: "https://arxiv.org/abs/1411.1607", kind: "paper" },
                { title: "PyTorch 2: Faster Machine Learning Through Dynamic Python Bytecode Transformation and Graph Compilation", by: "Ansel et al.", year: 2024, url: "https://docs.pytorch.org/assets/pytorch2-2.pdf", kind: "paper" },
                { title: "Triton: An Intermediate Language and Compiler for Tiled Neural Network Computations", by: "Tillet et al.", year: 2019, url: "https://www.eecs.harvard.edu/~htk/publication/2019-mapl-tillet-kung-cox.pdf", kind: "paper" },
                { title: "Python array API standard", by: "Consortium for Python Data API Standards", year: 2025, url: "https://data-apis.org/array-api/latest/", kind: "spec" }
            ]
        },
        {
            id: "lang-llm",
            title: "LLM 이 코드를 쓸 때 — 타입·테스트·검증의 역할",
            level: 2,
            mins: 18,
            pre: ["languages/plt-basics", "ai/assistant"],
            checked: "2026-11-19",
            key: [
                "LLM 출력은 그럴듯한 토큰 줄 · 문법·타입·동작 무엇도 스스로 보장하지 않음",
                "**검증기(verifier)**: 컴파일러·타입 검사·테스트가 판정 → 에이전트는 그 오류로 고침",
                "**타입 제약 디코딩(type-constrained decoding)**: 타입이 깨질 토큰을 막음 → 컴파일 오류 절반↓",
                "**명세(specification)**가 진짜 소스: 시그니처·예시·테스트로 '맞다'를 먼저 정의",
                "타입은 모양, 테스트는 사례, **형식 검증(formal verification)**은 모든 입력을 증명"
            ],
            concepts: [
                { term: "검증기", en: "Verifier", def: "후보 코드가 맞는지 기계적으로 판정하는 도구 · 컴파일러, 타입 검사기, 테스트, 증명 검사기" },
                { term: "타입 제약 디코딩", en: "Type-constrained decoding", def: "생성 중 타입 규칙상 이어질 수 없는 토큰을 막는 디코딩 (Mündler et al. 2025)" },
                { term: "점진적 타이핑", en: "Gradual typing", def: "주석 단 부분만 정적으로 검사하고 나머지는 동적으로 · Python 타입 힌트, TypeScript" },
                { term: "형식 검증", en: "Formal verification", def: "명세가 모든 입력에서 성립함을 기계로 증명 · Dafny, Lean, Verus" }
            ],
            demo: {
                type: "seq",
                actors: ["개발자", "LLM", "타입 검사·컴파일", "테스트"],
                msgs: [
                    { from: 0, to: 1, label: "요구 + 시그니처 + 예시", text: "자연어 한 줄 대신 명세를 함께: `def clamp(x, lo, hi) -> int` + 예시 입력·출력" },
                    { from: 1, to: 2, label: "초안 코드", text: "모델은 토큰을 낼 뿐 · 괄호가 맞는지도 아직 아무도 모름" },
                    { from: 2, to: 1, label: "'(' was never closed (2행)", text: "구문·타입 검사는 실행 없이 줄 번호와 이유를 줌 · 가장 싼 피드백" },
                    { from: 1, to: 2, label: "수정본", text: "오류 문구를 그대로 프롬프트에 붙여 다시 생성 · 에이전트 루프 한 바퀴" },
                    { from: 2, to: 3, label: "통과 → 실행", text: "타입은 '모양'만 보장 · 동작은 테스트가 판정" },
                    { from: 3, to: 1, label: "clamp(10,0,10)=9, 기대 10", text: "실패한 입력과 기대값이 다음 수정의 근거 · 경계값 실수는 타입이 못 잡음" },
                    { from: 1, to: 3, label: "수정본", text: "같은 루프를 상한(예: 3회)까지 · 상한이 없으면 비용이 끝없이 늘 수 있음" },
                    { from: 3, to: 0, label: "전부 통과 + diff", text: "사람은 명세와 diff 를 검토 · 테스트가 약하면 '통과'도 약함" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "검증기 루프: 가짜 LLM(후보 3개) + compile + 테스트",
                    src: `CANDIDATES = [   # 지어낸 생성 결과 3개
    "def clamp(x, lo, hi):\\n    return max(lo, min(x, hi)\\n",        # 괄호 빠짐
    "def clamp(x, lo, hi):\\n    return max(lo, min(x, hi - 1))\\n",   # 경계값 실수
    "def clamp(x, lo, hi):\\n    return max(lo, min(x, hi))\\n",       # 정답
]
TESTS = [((5, 0, 10), 5), ((-3, 0, 10), 0), ((10, 0, 10), 10), ((99, 0, 10), 10)]

def verify(src):
    try:
        code = compile(src, "gen.py", "exec")          # 1) 구문
    except SyntaxError as e:
        return f"SyntaxError line {e.lineno}: {e.msg}"
    ns = {}
    exec(code, ns)                                      # 실습용 · 실제로는 격리된 프로세스에서
    for args, want in TESTS:                            # 2) 동작
        got = ns["clamp"](*args)
        if got != want:
            return f"test failed: clamp{args} = {got}, want {want}"
    return None

prompt = "clamp(x, lo, hi) 를 작성하라. 테스트: ..."
for attempt in range(3):                                # 상한 3회
    src = CANDIDATES[attempt]                           # 실제로는 llm(prompt)
    err = verify(src)
    print(attempt + 1, err or "PASS")
    if not err:
        break
    prompt += f"\\n이전 답의 오류: {err}"               # 오류를 그대로 되먹임
# 1 SyntaxError line 2: '(' was never closed
# 2 test failed: clamp(10, 0, 10) = 9, want 10
# 3 PASS`,
                    note: "Python 3.14 실제 출력 · 생성된 코드를 `exec` 하는 것은 실습에서만 · 실제 에이전트는 샌드박스에서 실행"
                },
                {
                    lang: "python",
                    title: "타입 주석 + 타입 검사기: LLM 이 흔히 내는 실수를 실행 전에",
                    src: `from dataclasses import dataclass

@dataclass
class Item:
    name: str
    price: int

def total(items: list[Item]) -> int:
    return sum(i.price for i in items)

def label(item: Item) -> str:
    return item.name + ": " + item.price      # int 를 str 에 더함

print(total([Item("pen", 3), {"name": "cup", "price": 5}]))   # dict 를 Item 자리에

# $ mypy typed.py
# typed.py:12: error: Unsupported operand types for + ("str" and "int")  [operator]
# typed.py:14: error: List item 1 has incompatible type "dict[str, object]"; expected "Item"  [list-item]
# Found 2 errors in 1 file (checked 1 source file)`,
                    note: "mypy 2.4.1 실제 출력 · 12행은 실행해도 `label` 을 안 부르면 안 터짐 → 테스트로는 놓치고 타입 검사는 잡는 경우 · **점진적 타이핑(gradual typing)**이라 주석 없는 함수는 검사가 느슨"
                }
            ],
            optimize: [
                {
                    title: "자연어 한 줄 → 시그니처·예시(doctest)부터",
                    before: { lang: "text", src: `"날짜 문자열을 파싱하는 함수 만들어 줘"
→ 형식? 공백? 잘못된 날짜? 반환 타입? 모두 모델이 추측` },
                    after: { lang: "python", src: `def parse_ymd(s: str) -> date:
    """'YYYY-MM-DD' 만 받는다. 앞뒤 공백 허용, 그 밖은 ValueError.

    >>> parse_ymd(" 2026-11-19 ")
    datetime.date(2026, 11, 19)
    >>> parse_ymd("2026/11/19")
    Traceback (most recent call last):
    ValueError: expected YYYY-MM-DD
    """
    ...   # ← 이 본문만 LLM 에게` },
                    gain: "'맞다'를 기계가 판정 (doctest 3개 통과)",
                    note: "예시가 곧 테스트 · 오류 문구는 Python 버전마다 다를 수 있어(3.14 의 2월 29일 메시지가 바뀜) 직접 만든 메시지로 고정"
                },
                {
                    title: "한 번 생성하고 끝 → 검증기 루프 (상한 3회)",
                    before: { lang: "python", src: `code = llm(prompt)
save(code)                    # 통과 여부 모름` },
                    after: { lang: "python", src: `for _ in range(3):
    code = llm(prompt)
    err = verify(code)        # 구문 → 타입 → 테스트
    if not err:
        save(code); break
    prompt += f"\\n오류: {err}"` },
                    gain: "1회 성공률 0.4 → 3회 0.784",
                    note: "시도가 독립이고 검증기가 완벽하다는 가정의 상한 · 실제로는 같은 실수를 반복하기도 함"
                }
            ],
            glossary: [
                { term: "명세", en: "Specification", def: "프로그램이 지켜야 할 것을 적은 것 · 시그니처, 문서 예시, 테스트, 계약, 정리(theorem)" },
                { term: "속성 기반 테스트", en: "Property-based testing", def: "입력을 무작위로 많이 만들어 '결과는 정렬돼 있다' 같은 성질을 검사 · Python 은 Hypothesis" },
                { term: "린터", en: "Linter", def: "실행 없이 위험한 패턴·스타일을 찾는 도구 · Ruff, ESLint, Clippy" },
                { term: "pass@k", en: "pass@k metric", def: "k 개 생성 중 하나라도 테스트를 통과할 확률 · n 개 뽑아 c 개 통과면 1 − C(n−c, k) / C(n, k)" },
                { term: "자연어 프로그래밍", en: "Natural language programming", def: "자연어로 프로그램을 지시하는 발상 · Dijkstra(EWD667)는 형식 기호를 버리는 것을 '어리석다'고 봄" }
            ],
            quiz: [
                { q: "'실행 없이' 가장 싸게 잡히는 LLM 코드 오류는?", options: ["경계값 처리 실수", "타입 불일치", "성능 저하", "요구사항 오해"], a: 1, why: "타입 검사기는 실행 없이 줄 번호와 이유를 줌 · 경계값·성능·요구 오해는 테스트·측정·사람이 봐야 함" },
                { q: "Mündler et al. (2025) 의 타입 제약 디코딩 결과로 보고된 것은?", options: ["컴파일 오류가 절반 넘게 줄었다", "같은 성능에 모델 크기가 절반", "테스트 없이도 정답을 보장했다", "생성 속도가 두 배로 빨라졌다"], a: 0, why: "초록: 컴파일 오류를 절반 이상 줄이고 합성·번역·수정에서 기능적 정확도도 올림 · 정답 보장은 아님" },
                { q: "LLM 이 쓴 함수가 테스트 10개를 모두 통과했다. 말할 수 있는 것은?", options: ["어떤 입력에서도 결과가 맞다", "테스트한 입력에서는 맞다", "모든 변수의 타입이 맞다", "보안 취약점이 하나도 없다"], a: 1, why: "테스트는 사례 검사 · 모든 입력은 형식 검증의 영역" },
                { q: "SWE-bench (Jimenez et al. 2023) 의 과제는?", options: ["실제 저장소 이슈를 패치로 해결", "경시 대회식 알고리즘 문제를 풀기", "함수 주석으로 설명문 생성", "파일 속 문법 오류 위치 찾기"], a: 0, why: "Python 저장소 12곳의 실제 GitHub 이슈 2,294개 · 발표 당시 최고 해결률 1.96%" },
                { q: "Dijkstra(EWD667)가 '자연어 프로그래밍'을 어리석다고 본 이유에 가까운 것은?", options: ["자연어 처리는 계산 비용이 커서", "헛소리가 티 나지 않게 쓰기 쉬워서", "당시 컴퓨터가 자연어 문장을 읽지 못해서", "영어 사용자만 쓸 수 있어서"], a: 1, why: "형식 기호는 무의미한 문장을 쓰기 어렵게 만드는 '특권' · 자연어는 말이 안 되는 문장을 그럴듯하게 쓰기 쉬움" },
                { q: "GitHub Octoverse 2025 에서 TypeScript 가 1위가 된 기준은?", options: ["월간 기여자 수", "새로 만든 저장소 수", "커밋된 코드 줄 수", "검색 엔진 검색량"], a: 0, why: "2025-08 월간 기여자 수 약 264만으로 Python·JavaScript 추월 · 다른 지수는 방법이 달라 순위가 다를 수 있음" },
                { q: "Python 타입 힌트(PEP 484)는 실행 중에?", options: ["매 호출마다 검사됨", "검사되지 않음", "디버그 모드에서만 검사됨", "import 할 때 검사됨"], a: 1, why: "PEP 484: 'no type checking happens at runtime' · mypy·pyright 같은 검사기를 따로 돌려야 함" },
                { type: "num", q: "한 문제에 코드 n = 10 개를 생성해 c = 3 개가 테스트를 통과했다. pass@5 추정값은? (1 − C(n−c, k) / C(n, k))", answer: 0.9167, tol: 0.001, why: "1 − C(7, 5) / C(10, 5) = 1 − 21/252 = 0.9167 (Python `math.comb` 계산)" },
                { type: "num", q: "한 번 생성의 성공 확률 0.4, 시도는 독립이고 검증기가 완벽하다면 최대 3회 루프의 성공 확률은?", answer: 0.784, tol: 0.001, why: "1 − 0.6³ = 1 − 0.216 = 0.784 · 검증기가 없으면 어느 답이 맞는지 몰라 이 이득도 없음" },
                { type: "text", q: "출력은? (Python 3.14)", code: { lang: "python", src: "src = \"def clamp(x, lo, hi):\\n    return max(lo, min(x, hi)\\n\"\ntry:\n    compile(src, \"gen.py\", \"exec\")\nexcept SyntaxError as e:\n    print(e.lineno, e.msg)" }, answer: ["2 '(' was never closed"], why: "괄호가 열린 채 끝남 · 최신 Python 은 위치와 이유를 구체적으로 알려 줌 → 그대로 LLM 에 되먹임" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "def double(x: int) -> int:\n    return x * 2\n\nprint(double(\"ab\"))" }, answer: ["abab"], why: "주석은 실행 중 검사되지 않음 · 문자열 × 2 = 반복 · 타입 검사기만 경고" },
                { type: "order", q: "검증기 루프를 쓰는 에이전트 작업의 순서", items: ["시그니처·테스트(명세) 작성", "LLM 초안 생성", "구문·타입 검사", "테스트 실행", "실패 메시지로 재생성", "사람이 diff 검토"], why: "싼 검증기부터 · 사람은 마지막에 명세와 변경분을 봄" }
            ],
            refs: [
                { title: "Type-Constrained Code Generation with Language Models", by: "Mündler et al.", year: 2025, url: "https://arxiv.org/abs/2504.09246", kind: "paper" },
                { title: "MultiPL-E: A Scalable and Extensible Approach to Benchmarking Neural Code Generation", by: "Cassano et al.", year: 2022, url: "https://arxiv.org/abs/2208.08227", kind: "paper" },
                { title: "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?", by: "Jimenez et al.", year: 2023, url: "https://arxiv.org/abs/2310.06770", kind: "paper" },
                { title: "On the foolishness of \"natural language programming\" (EWD667)", by: "Dijkstra", url: "https://www.cs.utexas.edu/users/EWD/transcriptions/EWD06xx/EWD667.html", kind: "doc" }
            ]
        }
    ]
});
