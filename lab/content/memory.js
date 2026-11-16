LAB.track({
    id: "memory",
    name: "메모리 구조",
    icon: "▤",
    color: "#2dd4bf",
    tagline: "변수가 실제로 어디에, 어떤 모양으로 놓이는지. 배치·정렬·캐시·가상 메모리",
    trends: [
        {
            title: "CXL 메모리 풀링(memory pooling)·공유",
            when: "2025–2026",
            points: [
                "CXL = CPU 와 메모리·가속기를 잇는 캐시 일관성(cache-coherent) 인터커넥트",
                "CXL 2.0 메모리 풀링 → 3.0 메모리 공유(memory sharing): 여러 호스트가 같은 영역을 하드웨어 일관성으로 동시 접근",
                "CXL 4.0 (2025-11): PCIe 7.0 기반 128 GT/s · bundled ports · 3.x/2.0/1.x 하위 호환"
            ],
            refs: [
                { title: "Compute Express Link 3.0 (white paper)", by: "Das Sharma et al.", year: 2022, url: "https://computeexpresslink.org/wp-content/uploads/2023/12/CXL_3.0_white-paper_FINAL.pdf", kind: "doc" },
                { title: "Introducing Compute Express Link (CXL) 4.0: Significant Improvements in Bandwidth, Connectivity, Memory Maintenance, and Security", by: "Benavides et al.", year: 2025, url: "https://computeexpresslink.org/wp-content/uploads/2025/11/CXL_4.0-White-Paper_FINAL.pdf", kind: "doc" }
            ]
        },
        {
            title: "HBM4: AI 가속기의 메모리 대역폭(memory bandwidth)",
            when: "2025–2026",
            points: [
                "JEDEC JESD270-4 (2025-04): 2048bit 인터페이스 × 핀당 최대 8 Gb/s → 스택당 최대 2 TB/s",
                "스택당 독립 채널 16 → 32 · 4/8/12/16단 적층 · 32Gb 다이 16단이면 64GB",
                "HBM3 컨트롤러와 하위 호환 · 행 해머(row-hammer) 완화용 DRFM 추가"
            ],
            refs: [
                { title: "JEDEC and Industry Leaders Collaborate to Release JESD270-4 HBM4 Standard: Advancing Bandwidth, Efficiency, and Capacity for AI and HPC", by: "JEDEC", year: 2025, url: "https://www.jedec.org/news/pressreleases/jedec%C2%AE-and-industry-leaders-collaborate-release-jesd270-4-hbm4-standard-advancing", kind: "doc" }
            ]
        },
        {
            title: "LPDDR6: 모바일에서 데이터센터로",
            when: "2025–2026",
            points: [
                "JEDEC JESD209-6 (2025-07): 다이당 서브채널(sub-channel) 2개 × 12 DQ · 32B/64B 접근",
                "행 활성화 카운트(PRAC) · on-die ECC · CA 패리티 등 신뢰성 기능",
                "2026-04 로드맵: x6 모드로 고용량, 데이터센터·PIM(processing-in-memory) 확장 예고"
            ],
            refs: [
                { title: "JEDEC Releases New LPDDR6 Standard to Enhance Mobile and AI Memory Performance", by: "JEDEC", year: 2025, url: "https://www.jedec.org/news/pressreleases/jedec%C2%AE-releases-new-lpddr6-standard-enhance-mobile-and-ai-memory-performance", kind: "doc" },
                { title: "JEDEC Previews LPDDR6 Roadmap Expanding LPDDR into Data Centers and Processing-in-Memory", by: "JEDEC", year: 2026, url: "https://www.jedec.org/news/pressreleases/jedec%C2%AE-previews-lpddr6-roadmap-expanding-lpddr-data-centers-and-processing-memory", kind: "doc" }
            ]
        },
        {
            title: "하드웨어 메모리 안전(memory safety): MTE · CHERI",
            when: "2024–2026",
            points: [
                "Arm MTE (Armv8.5): 16 B 단위(granule)마다 4bit 태그 · 포인터 상위 비트(59–56) 태그와 다르면 fault",
                "use-after-free · 버퍼 오버플로를 하드웨어가 검출 · Linux arm64 는 `PROT_MTE` 로 사용",
                "CHERI: 정수 주소 대신 범위·권한을 담은 capability · Arm Morello, CHERI-RISC-V"
            ],
            refs: [
                { title: "Memory Tagging Extension (MTE) in AArch64 Linux", by: "Linux kernel community", url: "https://docs.kernel.org/arch/arm64/memory-tagging-extension.html", kind: "doc" },
                { title: "Capability Hardware Enhanced RISC Instructions (CHERI)", by: "University of Cambridge", url: "https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/", kind: "doc" }
            ]
        }
    ],
    lessons: [
        {
            id: "mem-layout",
            title: "프로그램 메모리 배치",
            level: 1,
            mins: 12,
            key: [
                "실행 파일 = **섹션(section)** 묶음 · `.text` `.rodata` `.data` `.bss`",
                "코드·상수는 Flash, 변수는 SRAM · `.data` 만 **LMA**(Flash)와 **VMA**(SRAM)가 다름",
                "`size` 로 읽기: Flash = text + data, 정적 RAM = data + bss",
                "남은 SRAM 은 힙과 스택이 양끝에서 나눠 씀 · **맵 파일(map file)**로 누가 먹는지 확인"
            ],
            concepts: [
                { term: "VMA / LMA", en: "Virtual Memory Address / Load Memory Address", def: "실행 중 쓰는 주소 / 이미지에 저장된 주소 · `.data` 는 VMA = SRAM, LMA = Flash" },
                { term: "`.rodata`", en: "Read-only data", def: "`const` 전역·문자열 리터럴 · Flash 에 그대로, 복사 없음" },
                { term: "`.bss`", en: "Block Started by Symbol (BSS)", def: "0 이거나 초기값 없는 전역·`static` · 파일엔 크기만, 부팅 때 0 채움" },
                { term: "맵 파일", en: "Linker map file", def: "섹션·심볼이 어느 주소에 몇 바이트로 놓였는지 링커가 쓴 보고서 · `-Wl,-Map=app.map`" },
                { term: "힙·스택 경계", en: "Heap / stack boundary", def: "힙은 `.bss` 끝에서 위로, 스택은 RAM 끝에서 아래로 · 만나면 조용히 덮어씀" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "vec", label: "벡터 테이블", sub: "0x0800_0000", x: 0, y: 0 },
                    { id: "text", label: ".text", sub: "코드", x: 0, y: 1 },
                    { id: "ro", label: ".rodata", sub: "const · 문자열", x: 0, y: 2 },
                    { id: "dlma", label: ".data 원본", sub: "LMA · Flash", x: 0, y: 3 },
                    { id: "start", label: "시작 코드", sub: "Reset_Handler", x: 1, y: 2 },
                    { id: "stack", label: "stack ↓", sub: "_estack 부터", x: 2, y: 0 },
                    { id: "heap", label: "heap ↑", sub: "end 부터", x: 2, y: 1 },
                    { id: "bss", label: ".bss", sub: "0 으로 채움", x: 2, y: 2 },
                    { id: "data", label: ".data", sub: "VMA 0x2000_0000", x: 2, y: 3 }
                ],
                edges: [
                    { from: "dlma", to: "data", label: "복사" },
                    { from: "start", to: "bss", label: "0" },
                    { from: "heap", to: "stack", label: "충돌?", both: true }
                ],
                steps: [
                    { on: ["vec", "text"], text: "Flash 앞쪽: 벡터 테이블(vector table) 뒤에 `.text` 코드" },
                    { on: ["ro"], text: "`const` 표와 **문자열 리터럴(string literal)**은 `.rodata` · Flash 에서 바로 읽음" },
                    { on: ["dlma", "data", "dlma>data"], text: "`.data` 는 주소가 둘: 초기값은 Flash(LMA), 실행 중엔 SRAM(VMA)" },
                    { on: ["start", "start>bss", "bss"], text: "**시작 코드(startup code)**가 `.data` 를 복사하고 `.bss` 를 0 으로 · `.bss` 는 Flash 에 내용이 없음" },
                    { on: ["heap"], text: "`.bss` 끝(`end`)부터 힙이 위로 · `malloc` → `_sbrk` 가 경계를 올림" },
                    { on: ["stack"], text: "스택은 RAM 끝(`_estack`)에서 아래로 · 함수 호출·지역 배열이 깊을수록 내려옴" },
                    { on: ["heap", "stack", "heap>stack"], text: "둘이 만나면 하드웨어는 모름 → 조용한 덮어쓰기 · 정적 크기는 `size`, 심볼별은 맵 파일" }
                ]
            },
            code: [
                {
                    lang: "c",
                    title: "linker.ld — 힙·스택 자리까지",
                    src: `MEMORY {
    FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 512K
    RAM   (rwx) : ORIGIN = 0x20000000, LENGTH = 128K
}
_estack = ORIGIN(RAM) + LENGTH(RAM);      /* 스택 꼭대기 */
_Min_Stack_Size = 0x1000;                 /* 4 KB 예약 */

SECTIONS {
    .text   : { KEEP(*(.isr_vector)) *(.text*) } > FLASH
    .rodata : { *(.rodata*) } > FLASH
    .data   : { _sdata = .; *(.data*); _edata = .; } > RAM AT > FLASH
    _sidata = LOADADDR(.data);            /* Flash 쪽 초기값 위치 */
    .bss    : { _sbss = .; *(.bss*) *(COMMON); _ebss = .; } > RAM
    ._user_heap_stack (NOLOAD) : {
        . = ALIGN(8);
        end = .;                          /* _sbrk 는 여기부터 힙 */
        . = . + _Min_Stack_Size;          /* 스택 몫이 안 남으면 링크 실패 */
    } > RAM
}`,
                    note: "`LOADADDR(.data)` = Flash 쪽 주소 · 마지막 섹션은 공간 확인용: 전역이 늘어 스택 몫이 안 남으면 **링크 단계에서** 실패"
                },
                {
                    lang: "sh",
                    title: "size · 메모리 사용량 · 맵 파일",
                    src: `$ arm-none-eabi-size app.elf
   text    data     bss     dec     hex filename
  23456     312    4520   28288    6e80 app.elf
# Flash  = text + data = 23768 B   (.data 초기값도 Flash 에)
# 정적 RAM = data + bss =  4832 B   (힙·스택 제외)

$ arm-none-eabi-gcc ... -Wl,-Map=app.map -Wl,--print-memory-usage
Memory region         Used Size  Region Size  %age Used
           FLASH:       23768 B       512 KB      4.53%
             RAM:        8928 B       128 KB      6.81%

$ grep -A1 '\\.bss\\.rx_buf' app.map        # 누가 RAM 을 먹나
 .bss.rx_buf    0x20000a40      0x800 build/uart.o`,
                    note: "Berkeley 형식은 `.rodata` 를 text 에 셈 · RAM 8928 B = 정적 4832 B + 스택 예약 4096 B"
                }
            ],
            optimize: [
                {
                    title: "값 하나 때문에 배열 전체가 `.data` 로 가는 것 막기",
                    before: { lang: "c", src: `// 첫 원소만 1 이어도 4 KB 전체가 .data
uint8_t lut[4096] = { 1 };      // Flash 4 KB + 부팅 때 4 KB 복사` },
                    after: { lang: "c", src: `uint8_t lut[4096];              // .bss: Flash 0 B, 0 채움만
void lut_init(void) { lut[0] = 1; }` },
                    gain: "Flash −4 KB · 부팅 복사 −4 KB",
                    note: "전부 0 이거나 초기값이 없으면 `.bss` · 0 아닌 값이 하나라도 있으면 배열 전체가 `.data`"
                },
                {
                    title: "안 쓰는 함수·변수 버리기: 섹션 분리 + `--gc-sections`",
                    before: { lang: "sh", src: `arm-none-eabi-gcc -O2 -c *.c
arm-none-eabi-gcc *.o -o app.elf          # 파일 단위로 통째 링크` },
                    after: { lang: "sh", src: `arm-none-eabi-gcc -O2 -ffunction-sections -fdata-sections -c *.c
arm-none-eabi-gcc *.o -Wl,--gc-sections -o app.elf   # 참조 없는 섹션 제거` },
                    gain: "미사용 코드·데이터 제거",
                    note: "함수·변수마다 섹션을 따로 만들어 링커가 참조 없는 것만 버림 · 벡터 테이블은 `KEEP()` 로 보호"
                }
            ],
            glossary: [
                { term: "섹션", en: "Section (ELF)", def: "성격이 같은 코드·데이터 묶음 · 링커가 섹션 단위로 메모리에 배치" },
                { term: "시작 코드", en: "Startup code (crt0)", def: "`main` 전에 스택·`.data`·`.bss`·클럭을 준비하는 코드" },
                { term: "문자열 리터럴", en: "String literal", def: "`\"abc\"` · `.rodata` 에 놓이는 읽기 전용 배열 · 수정하면 UB" },
                { term: "NOLOAD", en: "NOLOAD output section type", def: "주소만 잡고 이미지·Flash 에 내용을 싣지 않는 섹션 · 예약 영역용" },
                { term: "`_sbrk`", en: "sbrk (set program break)", def: "newlib `malloc` 이 힙 끝을 늘릴 때 부르는 함수 · MCU 에선 직접 구현" },
                { term: "`--gc-sections`", en: "Linker garbage collection of unused sections", def: "어디서도 참조하지 않는 입력 섹션을 링크에서 제외하는 ld 옵션" }
            ],
            quiz: [
                { q: "전역 `const char *msg = \"hello\";` 에서 `\"hello\"` 의 바이트는 어디에?", options: [".data (SRAM)", ".rodata (Flash)", ".bss", "스택"], a: 1, why: "문자열 리터럴은 읽기 전용 · 포인터 변수 `msg` 자체는 `.data`" },
                { q: "`size` 출력이 text=20000, data=500, bss=3000 이면 Flash 사용량은?", options: ["20000", "20500", "23500", "3500"], a: 1, why: "Flash = text + data · `.data` 초기값도 Flash 에 저장" },
                { q: "`static int counter;` (초기값 없음)의 부팅 직후 값은?", options: ["쓰레기값", "0", "Flash 에 남은 마지막 값", "-1"], a: 1, why: "`.bss` 는 시작 코드가 0 으로 채움 · C 도 정적 저장 기간 객체를 0 으로 초기화" },
                { q: "`.data` 섹션의 VMA 와 LMA 로 맞는 것은?", options: ["둘 다 Flash", "둘 다 SRAM", "VMA = SRAM, LMA = Flash", "VMA = Flash, LMA = SRAM"], a: 2, why: "실행 중 주소는 SRAM, 초기값 저장 위치는 Flash · `> RAM AT > FLASH`" },
                { q: "MPU 가 없는 MCU 에서 스택이 힙을 침범하면 흔한 결과는?", options: ["링크 오류", "컴파일 경고", "조용한 메모리 덮어쓰기", "스택이 자동으로 커짐"], a: 2, why: "하드웨어가 경계를 모름 · 링커 예약 영역은 정적 크기만 확인" }
            ],
            refs: [
                { title: "Output Section LMA (GNU ld manual)", by: "GNU Binutils", url: "https://sourceware.org/binutils/docs/ld/Output-Section-LMA.html", kind: "doc" },
                { title: "size (GNU Binary Utilities)", by: "GNU Binutils", url: "https://sourceware.org/binutils/docs/binutils/size.html", kind: "doc" },
                { title: "Options (GNU ld manual)", by: "GNU Binutils", url: "https://sourceware.org/binutils/docs/ld/Options.html", kind: "doc" }
            ]
        },
        {
            id: "mem-align",
            title: "정렬·패딩·엔디안",
            level: 1,
            mins: 14,
            key: [
                "**정렬(alignment)**: N바이트 타입은 N의 배수 주소에 · 구조체는 가장 큰 멤버를 따름",
                "멤버 사이·끝에 **패딩(padding)** · 정렬 큰 멤버부터 나열하면 `sizeof` 가 줄어듦",
                "`packed` 는 패딩 0 · 대가는 **비정렬 접근(unaligned access)**: 느리거나 Cortex-M0+ 면 HardFault",
                "**리틀 엔디안(little-endian)**: 낮은 바이트가 낮은 주소 · 네트워크 헤더는 빅 엔디안"
            ],
            concepts: [
                { term: "자연 정렬", en: "Natural alignment", def: "크기 1·2·4·8 바이트 기본 타입을 그 크기의 배수 주소에 · 32bit Arm 의 `double` 도 8" },
                { term: "패딩", en: "Struct padding", def: "다음 멤버·다음 배열 원소의 정렬을 맞추려 컴파일러가 넣는 빈 바이트 · 내용은 미정" },
                { term: "비정렬 접근", en: "Unaligned access", def: "정렬 안 맞는 주소에 2/4바이트 load/store · M0/M0+ 는 HardFault, M3/M4/M7 은 `LDR`/`STR`/`LDRH`/`STRH` 계열만 허용" },
                { term: "엔디안", en: "Endianness (byte order)", def: "여러 바이트 값을 메모리에 놓는 순서 · 대부분의 Cortex-M·x86 은 리틀, TCP/IP 헤더는 빅" },
                { term: "`_Alignof` / `_Alignas`", en: "C11 alignment operator / specifier", def: "타입의 정렬 조회 / 변수 정렬 강제 · DMA·캐시 라인 정렬에 사용" }
            ],
            demo: { type: "sim", name: "layout", fields: [["char", "a"], ["int", "b"], ["char", "c"], ["double", "d"]], arch: 32, value: 0x12345678 },
            code: [
                {
                    lang: "c",
                    title: "구조체 배치를 컴파일 타임에 고정",
                    src: `#include <stddef.h>

struct bad  { char a; int b; char c; double d; };   /* 24 B */
struct good { double d; int b; char a; char c; };   /* 16 B */

_Static_assert(offsetof(struct bad, b) == 4,  "a 뒤 3 B 패딩");
_Static_assert(offsetof(struct bad, d) == 16, "c 뒤 7 B 패딩");
_Static_assert(sizeof(struct bad)  == 24, "bad");
_Static_assert(sizeof(struct good) == 16, "끝에 2 B 패딩");
_Static_assert(_Alignof(struct bad) == 8, "가장 큰 멤버 = double");`,
                    note: "32bit Arm·LP64 모두 같은 결과 · `gcc -Wpadded` 가 패딩 위치를 경고, `pahole` 은 빌드된 ELF 의 빈틈을 보여 줌"
                },
                {
                    lang: "c",
                    title: "수신 버퍼 파싱: 캐스트 대신 바이트 조립",
                    src: `#include <stdint.h>
#include <string.h>

/* rx + 1 위치에 big-endian uint32 길이 필드 */
uint32_t read_be32(const uint8_t *p) {
    return ((uint32_t)p[0] << 24) | ((uint32_t)p[1] << 16) |
           ((uint32_t)p[2] << 8)  |  (uint32_t)p[3];   /* 정렬·엔디안 무관 */
}

uint32_t read_u32_host(const uint8_t *p) {
    uint32_t v;
    memcpy(&v, p, sizeof v);      /* 비정렬 OK · 컴파일러가 알맞은 load 로 */
    return v;                     /* 호스트 엔디안 그대로 */
}

uint32_t len = read_be32(rx + 1);
/* ✗ uint32_t len = *(uint32_t *)(rx + 1);  비정렬 + strict aliasing 위반 */`,
                    note: "주석의 캐스트는 M0+ 에서 HardFault, 다른 코어에선 UB · 엔디안 변환이 필요하면 **바이트 스왑(byte swap)** `__builtin_bswap32` (Arm `REV`)"
                }
            ],
            optimize: [
                {
                    title: "필드 재배치(field reordering): 정렬 큰 것부터",
                    before: { lang: "c", src: `struct bad { char a; int b; char c; double d; };
struct bad items[1000];       // 24 B × 1000 = 24000 B` },
                    after: { lang: "c", src: `struct good { double d; int b; char a; char c; };
struct good items[1000];      // 16 B × 1000 = 16000 B` },
                    gain: "24 → 16 B (−33%)",
                    note: "배열·큐에 많이 담는 구조체일수록 이득 · 파일·패킷 형식처럼 순서가 정해진 구조체는 건드리지 말 것"
                },
                {
                    title: "`packed` 멤버를 포인터로 꺼내지 말고 한 번 풀어 쓰기",
                    before: { lang: "c", src: `struct __attribute__((packed)) hdr { uint8_t type; uint32_t len; };

void f(struct hdr *h) {
    uint32_t *p = &h->len;   // 정렬 안 된 포인터 (offset 1)
    use(*p);                 // M0+ HardFault 가능
}` },
                    after: { lang: "c", src: `struct hdr_wire { uint8_t type; uint8_t len[4]; };   // 전송 형식
struct hdr      { uint32_t len; uint8_t type; };     // 내부용, 정렬됨

void parse(const struct hdr_wire *w, struct hdr *h) {
    h->type = w->type;
    memcpy(&h->len, w->len, sizeof h->len);  // 한 번 풀고 이후엔 정렬된 접근
}` },
                    gain: "HardFault 위험 0",
                    note: "GCC 는 `-Waddress-of-packed-member` 로 before 를 기본 경고 · packed 멤버를 이름으로 읽는 건 컴파일러가 안전하게 처리"
                }
            ],
            glossary: [
                { term: "멤버 오프셋", en: "Member offset (offsetof)", def: "구조체 시작에서 멤버까지 바이트 거리 · `offsetof(type, member)`" },
                { term: "끝 패딩", en: "Tail padding", def: "배열의 다음 원소도 정렬되도록 구조체 끝에 붙는 빈 바이트" },
                { term: "packed 속성", en: "packed type attribute (GCC)", def: "`__attribute__((packed))` · 멤버를 최소 공간에, 정렬 1 로 배치" },
                { term: "네트워크 바이트 순서", en: "Network byte order (big-endian)", def: "인터넷 프로토콜 헤더의 정수 바이트 순서 · `htonl` / `ntohl` 로 변환" },
                { term: "바이트 스왑", en: "Byte swap (bswap)", def: "바이트 순서 뒤집기 · Arm `REV`, GCC `__builtin_bswap32`" },
                { term: "Strict aliasing", en: "Strict aliasing rule", def: "다른 타입 포인터로 같은 객체를 읽으면 UB · `memcpy` 나 문자 타입 접근은 허용" }
            ],
            quiz: [
                { q: "32bit Arm 에서 `struct { char a; int b; char c; }` 의 sizeof 는?", options: ["6", "8", "12", "16"], a: 2, why: "a(1)+패딩 3, b(4), c(1)+끝 패딩 3 = 12" },
                { q: "같은 멤버로 sizeof 를 가장 작게 만드는 순서는?", options: ["정렬 작은 것부터", "정렬 큰 것부터", "선언 순서 그대로", "이름 알파벳순"], a: 1, why: "큰 정렬을 앞에 두면 뒤쪽 작은 멤버들이 빈틈 없이 붙음" },
                { q: "`0x12345678` 을 리틀 엔디안으로 저장할 때 가장 낮은 주소의 바이트는?", options: ["`0x12`", "`0x34`", "`0x56`", "`0x78`"], a: 3, why: "가장 낮은 자리 바이트가 가장 낮은 주소" },
                { q: "Cortex-M0+ 에서 주소 `0x20000001` 의 word 를 `LDR` 로 읽으면?", options: ["두 번 읽어 정상 동작", "HardFault", "하위 2bit 를 무시하고 읽음", "UsageFault"], a: 1, why: "Armv6-M 은 비정렬 접근 미지원 → HardFault" },
                { q: "Cortex-M7 에서 비정렬 주소로 실행해도 fault 가 안 나는 명령은?", options: ["`LDRD`", "`LDM`", "`LDR`", "`STRD`"], a: 2, why: "`LDR/STR/LDRH/STRH` 계열만 허용 · `LDRD/STRD/LDM/STM` 은 항상 UsageFault" }
            ],
            refs: [
                { title: "Procedure Call Standard for the Arm Architecture (AAPCS32)", by: "Arm", url: "https://github.com/ARM-software/abi-aa/blob/main/aapcs32/aapcs32.rst", kind: "spec" },
                { title: "Common Attributes (Using the GNU Compiler Collection)", by: "GCC", url: "https://gcc.gnu.org/onlinedocs/gcc/Common-Attributes.html", kind: "doc" },
                { title: "Cortex-M0+ Devices Generic User Guide", by: "Arm", year: 2012, url: "https://documentation-service.arm.com/static/5f04abc8dbdee951c1cdc9f7", kind: "doc" },
                { title: "On Holy Wars and a Plea for Peace (IEN 137)", by: "Cohen", year: 1980, url: "https://history.rfc-editor.org/ien/ien137.txt", kind: "paper" }
            ]
        },
        {
            id: "mem-hierarchy",
            title: "메모리 계층과 지역성",
            level: 2,
            mins: 14,
            key: [
                "**메모리 계층(memory hierarchy)**: 레지스터 → L1 → L2 → DRAM → Flash/SSD",
                "위로 갈수록 빠르고 작고 비쌈 · DRAM 지연(latency)은 L1 의 수십~수백 배",
                "**시간 지역성(temporal locality)**: 쓴 것을 곧 또 · **공간 지역성(spatial locality)**: 옆 주소를 곧",
                "C 2차원 배열은 **행 우선 순서(row-major order)** · 안쪽 루프가 열 인덱스를 돌아야 연속"
            ],
            concepts: [
                { term: "메모리 계층", en: "Memory hierarchy", def: "속도·용량·비용이 다른 저장장치를 층으로 쌓고 자주 쓰는 데이터를 빠른 층에 둠" },
                { term: "지연 vs 대역폭", en: "Latency vs bandwidth", def: "첫 바이트가 올 때까지 시간 / 초당 옮기는 양 · 순차 스트림은 대역폭, 포인터 추적은 지연에 묶임" },
                { term: "캐시 라인", en: "Cache line", def: "캐시가 메모리와 주고받는 최소 단위 · x86 은 흔히 64 B, Cortex-M7 은 32 B" },
                { term: "작업 집합", en: "Working set", def: "일정 구간 동안 실제로 건드리는 데이터 · 캐시보다 커지면 미스가 급증" },
                { term: "행 우선 순서", en: "Row-major order", def: "`a[i][j]` 다음 주소가 `a[i][j+1]` · C/C++ 방식, Fortran·MATLAB 은 열 우선" }
            ],
            demo: { type: "sim", name: "cache", size: 64, block: 16, ways: 1, pattern: "row" },
            code: [
                {
                    lang: "c",
                    title: "행 순회 vs 열 순회",
                    src: `#define N 1024
static float a[N][N];            /* 4 MB, 행 우선 */

float sum_rows(void) {           /* a[i][0], a[i][1], ... 연속 */
    float s = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            s += a[i][j];
    return s;
}

float sum_cols(void) {           /* a[0][j], a[1][j], ... 4 KB 간격 */
    float s = 0;
    for (int j = 0; j < N; j++)
        for (int i = 0; i < N; i++)
            s += a[i][j];
    return s;
}`,
                    note: "열 순회는 접근마다 다른 **캐시 라인(cache line)** · 64 B 라인이면 행 순회는 `float` 16개에 미스 1번"
                },
                {
                    lang: "py",
                    title: "직접 재 보기 (NumPy)",
                    src: `import time
import numpy as np

a = np.ones((4096, 4096), dtype=np.float32)   # 기본 C 순서 = 행 우선

def bench(f):
    t = time.perf_counter()
    f()
    return time.perf_counter() - t

print("행:", bench(lambda: [a[i, :].sum() for i in range(4096)]))
print("열:", bench(lambda: [a[:, j].sum() for j in range(4096)]))
# 열 쪽이 몇 배 느림 · 배수는 CPU·캐시 크기마다 다름`,
                    note: "`np.asfortranarray(a)` 로 열 우선으로 바꾸면 결과가 뒤집힘 · 레이아웃과 순회 방향을 맞추는 게 핵심"
                }
            ],
            optimize: [
                {
                    title: "**루프 교환(loop interchange)**: 안쪽 루프를 연속 주소로",
                    before: { lang: "c", src: `for (int j = 0; j < N; j++)
    for (int i = 0; i < N; i++)
        s += a[i][j];          // 보폭 4 KB` },
                    after: { lang: "c", src: `for (int i = 0; i < N; i++)
    for (int j = 0; j < N; j++)
        s += a[i][j];          // 보폭 4 B` },
                    gain: "미스 ~1/16 (64 B 라인, float)",
                    note: "컴파일러가 바꿔 주기도 하지만 보장 없음 · 행렬 곱은 `i-k-j` 순서면 안쪽이 연속"
                },
                {
                    title: "구조체 배열(AoS) → 배열 구조체(SoA)",
                    before: { lang: "c", src: `struct particle { float x, y, z, vx, vy, vz, mass, q; };  // 32 B
struct particle p[N];
for (int i = 0; i < N; i++) sum += p[i].x;   // 라인마다 x 는 2개` },
                    after: { lang: "c", src: `struct particles { float x[N], y[N], z[N]; /* ... */ };
static struct particles P;
for (int i = 0; i < N; i++) sum += P.x[i];   // 라인마다 x 가 16개` },
                    gain: "읽는 라인 수 ÷8 (64 B 라인)",
                    note: "필드 몇 개만 훑는 루프에 유리 · 객체의 모든 필드를 함께 쓰면 AoS 가 나음 · SoA 는 SIMD 벡터화에도 유리"
                }
            ],
            glossary: [
                { term: "시간 지역성", en: "Temporal locality", def: "최근 접근한 데이터를 곧 다시 접근하는 경향 · 루프 변수, 누적값" },
                { term: "공간 지역성", en: "Spatial locality", def: "접근한 주소 근처를 곧 접근하는 경향 · 배열 순회, 명령어 순차 실행" },
                { term: "메모리 벽", en: "Memory wall", def: "CPU 속도 향상을 DRAM 지연이 못 따라가 성능이 메모리에 묶이는 현상 (Wulf·McKee 1995)" },
                { term: "하드웨어 프리페처", en: "Hardware prefetcher", def: "순차·일정 보폭 접근을 감지해 다음 라인을 미리 가져오는 회로 · 포인터 추적엔 약함" },
                { term: "AoS / SoA", en: "Array of Structures / Structure of Arrays", def: "객체 단위 배열 / 필드별 배열 · 접근 패턴에 맞춰 고름" },
                { term: "루프 교환", en: "Loop interchange", def: "중첩 루프 순서를 바꿔 안쪽 루프가 연속 메모리를 돌게 하는 변환" }
            ],
            quiz: [
                { q: "접근 지연이 가장 짧은 것은?", options: ["L2 캐시", "레지스터", "DRAM", "L1 캐시"], a: 1, why: "레지스터는 연산 유닛 바로 옆 · L1 도 몇 사이클 걸림" },
                { q: "C 의 `int a[100][100]` 에서 메모리상 `a[3][99]` 바로 다음 원소는?", options: ["`a[4][99]`", "`a[3][0]`", "`a[4][0]`", "`a[2][99]`"], a: 2, why: "행 우선: 한 행이 끝나면 다음 행의 0번" },
                { q: "64 B 라인에서 `float` 배열을 처음부터 순차로 읽을 때 미스 비율은 (프리페치 없음)?", options: ["1/4", "1/8", "1/16", "1/64"], a: 2, why: "64 / 4 = 16 원소마다 새 라인 1개" },
                { q: "Drepper(2007)가 인용한 Pentium M 수치에서 L1d 대비 메인 메모리 접근은 대략?", options: ["2배", "10배", "80배", "1000배"], a: 2, why: "L1d ~3 사이클 vs 메인 메모리 ~240 사이클" },
                { q: "연결 리스트 순회가 같은 크기 배열 순회보다 느린 주된 이유는?", options: ["포인터가 더 커서", "노드가 흩어져 공간 지역성·프리페치가 안 통해서", "컴파일러가 최적화를 못 해서", "분기 예측 실패"], a: 1, why: "다음 주소를 알려면 현재 노드를 읽어야 함 → 지연이 그대로 쌓임" }
            ],
            refs: [
                { title: "What Every Programmer Should Know About Memory", by: "Drepper", year: 2007, url: "https://www.akkadia.org/drepper/cpumemory.pdf", kind: "paper" },
                { title: "Teach Yourself Programming in Ten Years (Approximate timing for various operations)", by: "Norvig", year: 2001, url: "https://norvig.com/21-days.html", kind: "doc" },
                { title: "Hitting the Memory Wall: Implications of the Obvious", by: "Wulf et al.", year: 1995, url: "https://doi.org/10.1145/216585.216588", kind: "paper" }
            ]
        },
        {
            id: "mem-cache",
            title: "캐시 구조: 태그·인덱스·오프셋",
            level: 2,
            mins: 16,
            key: [
                "주소 = **태그(tag)** | **인덱스(index)** | **오프셋(offset)** · 오프셋 bit = log₂(라인 크기)",
                "인덱스로 세트(set)를 고르고 그 안 **웨이(way)**들의 태그와 비교 · 같으면 히트",
                "**직접 사상(direct-mapped)** = 세트당 1칸 · **집합 연관(set-associative)** = N칸",
                "미스의 3C: **강제(compulsory) · 용량(capacity) · 충돌(conflict)**"
            ],
            concepts: [
                { term: "세트·웨이", en: "Set / way", def: "세트 = 인덱스가 같은 라인 묶음 · 웨이 = 세트 안 칸 수 (N-way)" },
                { term: "주소 분해", en: "Address split: tag / index / offset", def: "오프셋 = log₂(라인), 인덱스 = log₂(세트 수), 나머지 상위 비트 = 태그" },
                { term: "집합 연관", en: "Set-associative cache", def: "한 세트에 N개 라인 · 직접 사상과 완전 연관 사이 절충 · Cortex-M7 D-캐시는 4-way" },
                { term: "교체 정책", en: "Replacement policy", def: "세트가 꽉 찼을 때 쫓아낼 라인 선택 · LRU, 의사 LRU, 랜덤" },
                { term: "쓰기 정책", en: "Write-back vs write-through", def: "쓰기를 캐시에만 두고 쫓겨날 때 반영 / 매번 메모리에도 씀" }
            ],
            demo: { type: "sim", name: "cache", size: 64, block: 16, ways: 1, pattern: "conflict" },
            code: [
                {
                    lang: "c",
                    title: "주소 분해 (16 KB · 4-way · 32 B 라인)",
                    src: `/* Cortex-M7 D-캐시 예: 4-way, 32 B 라인 · 크기는 칩마다 다름 */
#define LINE   32u
#define WAYS   4u
#define SIZE   (16u * 1024u)
#define SETS   (SIZE / (WAYS * LINE))          /* 128 */

#define OFF_BITS 5u                            /* log2(32)  */
#define IDX_BITS 7u                            /* log2(128) */

static inline uint32_t off(uint32_t a) { return a & (LINE - 1); }
static inline uint32_t idx(uint32_t a) { return (a >> OFF_BITS) & (SETS - 1); }
static inline uint32_t tag(uint32_t a) { return a >> (OFF_BITS + IDX_BITS); }

/* 0x20001234 → off 0x14, idx 0x11, tag 0x20001 */`,
                    note: "라인·세트 수가 2의 거듭제곱이라 나눗셈 없이 비트 자르기 · 인덱스가 같은 주소는 `SIZE / WAYS` = 4 KB 간격"
                },
                {
                    lang: "c",
                    title: "충돌을 일부러 만들기",
                    src: `/* 직접 사상 4 KB 캐시라고 하자 → 4 KB 떨어진 주소는 같은 세트 */
static float a[1024], b[1024];     /* 각 4 KB · 연달아 놓이면 a[i] 와 b[i] 가 같은 세트 */

float dot(void) {
    float s = 0;
    for (int i = 0; i < 1024; i++)
        s += a[i] * b[i];          /* a 라인 ↔ b 라인이 서로 쫓아냄 → 매번 미스 */
    return s;
}
/* 해결: 2-way 이상이거나, 한 배열을 라인 하나만큼 비켜 놓기 */`,
                    note: "**충돌 미스(conflict miss)**: 캐시 용량은 남는데 같은 세트에 몰려 생김 · 위 데모의 `a[i], b[i] 번갈아` 를 2-way 로 바꿔 보기"
                }
            ],
            optimize: [
                {
                    title: "2의 거듭제곱 행 길이에 패딩 넣기",
                    before: { lang: "c", src: `float m[512][512];         // 행 = 2 KB
for (int j = 0; j < 512; j++)
    for (int i = 0; i < 512; i++)
        use(m[i][j]);          // 열 하나가 세트 2개에 몰림` },
                    after: { lang: "c", src: `float m[512][512 + 8];     // 행 = 2 KB + 32 B
for (int j = 0; j < 512; j++)
    for (int i = 0; i < 512; i++)
        use(m[i][j]);          // 행마다 세트가 한 칸씩 이동` },
                    gain: "열 하나가 쓰는 세트 2 → 128 (위 16 KB 캐시)",
                    note: "행 보폭 2048 B 는 세트 64칸씩 건너뜀 → 세트 0·64 만 사용 · 2080 B 면 128 세트를 고루 사용 · 그래도 루프 교환이 먼저"
                },
                {
                    title: "자주 쓰는 필드만 모으기 (hot/cold 분리)",
                    before: { lang: "c", src: `struct conn {               // 128 B
    uint32_t state, rx_cnt;    // 패킷마다 사용
    char     name[64];         // 거의 안 씀
    uint8_t  cfg[56];
};
struct conn conns[1000];       // state 순회 = 라인 1000개` },
                    after: { lang: "c", src: `struct conn_cold { char name[64]; uint8_t cfg[56]; };
struct conn_hot  {             // 12 B (32bit)
    uint32_t state, rx_cnt;
    struct conn_cold *cold;
};
struct conn_hot conns[1000];   // 12000 B = 라인 375개` },
                    gain: "읽는 라인 1000 → 375 (32 B 라인)",
                    note: "캐시는 라인 단위로 가져옴 · 한 라인에 쓸모 있는 바이트를 늘리는 게 핵심"
                }
            ],
            glossary: [
                { term: "충돌 미스", en: "Conflict miss", def: "용량은 남는데 같은 세트에 몰려 쫓겨나는 미스 · 연관도를 높이면 줄어듦" },
                { term: "강제 미스", en: "Compulsory (cold) miss", def: "처음 접근이라 피할 수 없는 미스 · 큰 라인·프리페치로 줄임" },
                { term: "용량 미스", en: "Capacity miss", def: "작업 집합이 캐시보다 커서 생기는 미스 · 완전 연관이어도 발생" },
                { term: "더티 비트", en: "Dirty bit", def: "write-back 캐시에서 라인이 메모리와 달라졌다는 표시 · 쫓겨날 때만 기록" },
                { term: "LRU", en: "Least Recently Used", def: "가장 오래 안 쓴 라인을 교체 · 웨이가 많으면 근사(pseudo-LRU)를 씀" },
                { term: "직접 사상 캐시", en: "Direct-mapped cache", def: "주소마다 들어갈 칸이 하나뿐인 1-way 캐시 · 단순·빠르지만 충돌에 약함" }
            ],
            quiz: [
                { q: "32 KB, 4-way, 64 B 라인 캐시의 세트 수는?", options: ["64", "128", "256", "512"], a: 1, why: "32768 / (4 × 64) = 128" },
                { q: "위 캐시에서 32bit 주소의 오프셋·인덱스 bit 수는?", options: ["6 · 7", "5 · 8", "6 · 8", "7 · 6"], a: 0, why: "log₂64 = 6, log₂128 = 7 · 태그는 나머지 19bit" },
                { q: "직접 사상 캐시에서 `a[i]` 와 `b[i]` 가 정확히 캐시 크기만큼 떨어져 있으면?", options: ["항상 히트", "같은 세트를 두고 서로 쫓아냄", "용량 미스만 생김", "자동으로 2-way 처럼 동작"], a: 1, why: "인덱스 bit 가 같아 충돌 미스" },
                { q: "write-back 캐시가 라인을 쫓아낼 때 메모리에 쓰는 경우는?", options: ["항상", "dirty 일 때만", "읽기만 한 라인일 때", "쓰지 않음"], a: 1, why: "수정된(dirty) 라인만 기록 · 깨끗한 라인은 그냥 버림" },
                { q: "완전 연관 캐시로 바꿔도 남는 미스는?", options: ["충돌 미스만", "강제·용량 미스", "없음", "충돌·강제 미스"], a: 1, why: "3C 중 충돌만 연관도로 사라짐" }
            ],
            refs: [
                { title: "Evaluating Associativity in CPU Caches", by: "Hill et al.", year: 1989, url: "https://doi.org/10.1109/12.40842", kind: "paper" },
                { title: "Cache Memories", by: "Smith", year: 1982, url: "https://doi.org/10.1145/356887.356892", kind: "paper" },
                { title: "Arm Cortex-M7 Processor Technical Reference Manual (r1p1)", by: "Arm", year: 2015, url: "https://documentation-service.arm.com/static/5e906da3c8052b1608760e3d", kind: "doc" },
                { title: "What Every Programmer Should Know About Memory", by: "Drepper", year: 2007, url: "https://www.akkadia.org/drepper/cpumemory.pdf", kind: "paper" }
            ]
        },
        {
            id: "mem-virtual",
            title: "가상 메모리와 TLB",
            level: 3,
            mins: 16,
            key: [
                "프로세스마다 **가상 주소(virtual address)** · MMU 가 **페이지(page)** 단위로 물리 주소로 번역",
                "번역표 = **페이지 테이블(page table)** · 다단계라 번역 한 번에 메모리를 여러 번 읽음",
                "**TLB**: 최근 번역을 담는 작은 캐시 · 히트면 번역 비용은 거의 없음",
                "권한 위반·매핑 없음 → **페이지 폴트(page fault)** · MMU 없는 MCU 는 MPU 로 보호만"
            ],
            concepts: [
                { term: "가상 주소", en: "Virtual address", def: "프로그램이 보는 주소 · 상위 비트 = 페이지 번호(VPN), 하위 = 페이지 안 오프셋" },
                { term: "페이지 테이블", en: "Page table", def: "VPN → 물리 프레임 번호(PFN) + 권한 비트 · x86-64·AArch64(4 KB 페이지)는 보통 4단계" },
                { term: "TLB", en: "Translation Lookaside Buffer", def: "VPN → PFN 번역 캐시 · 엔트리 수가 적어 작업 집합이 크면 미스가 늘어남" },
                { term: "페이지 폴트", en: "Page fault", def: "매핑 없음·권한 위반 시 CPU 예외 → OS 가 페이지를 채우고 재실행하거나 `SIGSEGV`" },
                { term: "MPU", en: "Memory Protection Unit", def: "주소 번역 없이 영역별 권한·속성만 검사 · Cortex-M 은 8 또는 16 영역" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "cpu", label: "CPU", sub: "VA 0x0040_2ABC", x: 0, y: 0 },
                    { id: "tlb", label: "TLB", sub: "VPN → PFN 캐시", x: 1, y: 0 },
                    { id: "pa", label: "물리 주소", sub: "PA 0x001F_3ABC", x: 2, y: 0 },
                    { id: "mem", label: "캐시·DRAM", sub: "데이터 읽기", x: 3, y: 0 },
                    { id: "walk", label: "페이지 워크", sub: "CR3/TTBR0 부터", x: 1, y: 1 },
                    { id: "pte", label: "PTE", sub: "PFN 1F3 · R/W/U", x: 2, y: 1 },
                    { id: "fault", label: "페이지 폴트", sub: "OS 핸들러", x: 2, y: 2 }
                ],
                edges: [
                    { from: "cpu", to: "tlb", label: "VPN 0x402" },
                    { from: "tlb", to: "pa", label: "hit" },
                    { from: "pa", to: "mem" },
                    { from: "tlb", to: "walk", label: "miss" },
                    { from: "walk", to: "pte", label: "4단계" },
                    { from: "pte", to: "tlb", label: "채움", arc: "up" },
                    { from: "pte", to: "fault", label: "없음·권한 X" }
                ],
                steps: [
                    { on: ["cpu"], text: "`ldr` 가 가상 주소 `0x0040_2ABC` 사용 · 4 KB 페이지면 하위 12bit `ABC` 는 오프셋, 위 `0x402` 는 VPN" },
                    { on: ["cpu>tlb", "tlb"], text: "MMU 가 먼저 TLB(Translation Lookaside Buffer) 조회 · 히트면 바로 PFN" },
                    { on: ["tlb>walk", "walk"], text: "미스 → **페이지 테이블 워크(page table walk)**: 루트(`CR3` / `TTBR0`)부터 단계마다 표 한 칸씩 읽음" },
                    { on: ["walk>pte", "pte"], text: "마지막 단계 PTE: PFN `0x1F3` + present · 쓰기 · user · 실행 금지 같은 권한 비트" },
                    { on: ["pte>tlb", "tlb"], text: "번역을 TLB 에 채움 → 같은 페이지의 다음 접근은 워크 없이" },
                    { on: ["tlb>pa", "pa", "pa>mem", "mem"], text: "물리 주소 = PFN ‖ 오프셋 = `0x001F_3ABC` → 이제야 캐시·DRAM 접근" },
                    { on: ["pte>fault", "fault"], text: "PTE 가 없거나 권한 위반이면 페이지 폴트 → OS 가 채우고 재실행, 아니면 `SIGSEGV`" }
                ]
            },
            code: [
                {
                    lang: "c",
                    title: "페이지 번호·오프셋·단계별 인덱스",
                    src: `#include <stdint.h>

#define PAGE_SHIFT 12                       /* 4 KB */
#define PAGE_SIZE  (1ull << PAGE_SHIFT)

uint64_t va  = 0x00402ABC;
uint64_t vpn = va >> PAGE_SHIFT;            /* 0x402 */
uint64_t off = va & (PAGE_SIZE - 1);        /* 0xABC */

/* x86-64 4단계: 9bit 인덱스 4개 + 12bit 오프셋 = 48bit */
unsigned l4 = (va >> 39) & 0x1FF, l3 = (va >> 30) & 0x1FF,
         l2 = (va >> 21) & 0x1FF, l1 = (va >> 12) & 0x1FF;`,
                    note: "단계마다 512 엔트리 × 8 B = 4 KB 표 하나 · TLB 미스 한 번 = 표 4개를 차례로 따라가기"
                },
                {
                    lang: "sh",
                    title: "TLB 미스·페이지 폴트 관찰 (Linux)",
                    src: `$ perf stat -e dTLB-loads,dTLB-load-misses,page-faults ./app
$ getconf PAGESIZE
4096
$ grep -i hugepagesize /proc/meminfo
Hugepagesize:       2048 kB
$ cat /sys/kernel/mm/transparent_hugepage/enabled
always [madvise] never`,
                    note: "작업 집합이 크면 dTLB 미스가 병목 · 2 MB **대형 페이지(huge page)** 는 TLB 엔트리 하나가 512배 범위를 덮음"
                }
            ],
            optimize: [
                {
                    title: "큰 배열에 대형 페이지 (`madvise`)",
                    before: { lang: "c", src: `float *buf = malloc(1ul << 30);    // 1 GB = 4 KB 페이지 262144 개` },
                    after: { lang: "c", src: `#include <sys/mman.h>
float *buf = mmap(NULL, 1ul << 30, PROT_READ | PROT_WRITE,
                  MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
madvise(buf, 1ul << 30, MADV_HUGEPAGE);   // THP: 2 MB 페이지 512 개` },
                    gain: "필요한 TLB 엔트리 ÷512",
                    note: "THP 설정이 `madvise` 일 때 · 2 MB 정렬된 구간만 대형 페이지로 · 메모리 낭비·compaction 지연은 감수"
                },
                {
                    title: "`malloc` + `memset` 대신 `calloc`",
                    before: { lang: "c", src: `int *hist = malloc(256u << 20);    // 256 MB
memset(hist, 0, 256u << 20);       // 모든 페이지를 지금 건드림 → 폴트 65536 번` },
                    after: { lang: "c", src: `int *hist = calloc(64u << 20, sizeof *hist);   // 같은 256 MB
// glibc: 큰 블록은 mmap → 커널이 0 페이지 보장 → memset 생략
// 실제로 쓴 페이지만 폴트·물리 메모리 할당` },
                    gain: "초기화 폴트 65536 → 쓴 페이지 수만큼",
                    note: "**요구 페이징(demand paging)**: 물리 페이지는 첫 접근 때 할당 · RSS 는 실제로 건드린 만큼만 늘어남"
                }
            ],
            glossary: [
                { term: "페이지 테이블 워크", en: "Page table walk", def: "TLB 미스 때 하드웨어(또는 OS)가 다단계 표를 따라가 PTE 를 찾는 과정" },
                { term: "PTE", en: "Page Table Entry", def: "PFN + present·쓰기·사용자·실행 금지(NX/XN) 같은 권한·상태 비트" },
                { term: "대형 페이지", en: "Huge page", def: "2 MB·1 GB 같은 큰 페이지 · TLB 엔트리 하나가 넓은 범위를 덮음" },
                { term: "요구 페이징", en: "Demand paging", def: "첫 접근 때 페이지 폴트로 물리 페이지를 할당 · `malloc` 직후엔 RSS 가 안 늘어남" },
                { term: "TLB 슈트다운", en: "TLB shootdown", def: "한 코어가 매핑을 바꾸면 다른 코어 TLB 의 옛 번역을 IPI 로 무효화 · `munmap` 비용" },
                { term: "ASID", en: "Address Space Identifier", def: "TLB 엔트리에 붙는 주소 공간 태그 · 문맥 전환 때 TLB 를 통째로 비우지 않아도 됨" }
            ],
            quiz: [
                { q: "4 KB 페이지에서 VA `0x12345678` 의 페이지 오프셋은?", options: ["`0x678`", "`0x5678`", "`0x12345`", "`0x78`"], a: 0, why: "하위 12bit = `0x678`, VPN = `0x12345`" },
                { q: "TLB 가 캐시하는 것은?", options: ["데이터 라인", "가상 → 물리 번역", "명령어", "페이지 테이블 전체"], a: 1, why: "VPN → PFN(+권한) 쌍" },
                { q: "x86-64 4단계 페이징에서 TLB 미스 한 번에 읽는 표 엔트리 수는 (워크 캐시 없을 때)?", options: ["1", "2", "4", "9"], a: 2, why: "단계마다 한 엔트리씩 4번 · 그다음 데이터 접근" },
                { q: "읽기 전용으로 매핑된 페이지에 쓰면?", options: ["조용히 무시", "페이지 폴트 → OS 판단 (CoW 면 복사, 아니면 SIGSEGV)", "TLB 미스만 발생", "캐시 미스만 발생"], a: 1, why: "권한 비트 위반 = 폴트 · copy-on-write 는 이걸 이용" },
                { q: "Cortex-M4 MCU 에 MMU 대신 MPU 가 쓰이는 이유로 가장 맞는 것은?", options: ["MPU 가 번역을 더 빨리 해서", "단일 주소 공간이라 번역이 필요 없고 지연이 예측 가능해야 해서", "MPU 가 가상 메모리를 지원해서", "Flash 를 늘리려고"], a: 1, why: "페이지 워크·TLB 미스가 없음 → 시간 결정적 · 필요한 건 보호뿐" }
            ],
            refs: [
                { title: "Operating Systems: Three Easy Pieces — Paging: Faster Translations (TLBs)", by: "Arpaci-Dusseau et al.", year: 2023, url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-tlbs.pdf", kind: "book" },
                { title: "Concepts overview (Linux memory management)", by: "Linux kernel community", url: "https://docs.kernel.org/admin-guide/mm/concepts.html", kind: "doc" },
                { title: "Page Tables", by: "Linux kernel community", url: "https://docs.kernel.org/mm/page_tables.html", kind: "doc" },
                { title: "Arm Cortex-M7 Devices Generic User Guide", by: "Arm", year: 2015, url: "https://documentation-service.arm.com/static/61efd6602dd99944d051417b", kind: "doc" }
            ]
        },
        {
            id: "mem-mcu",
            title: "MCU 메모리: Flash·SRAM·TCM·MPU·DMA",
            level: 2,
            mins: 16,
            key: [
                "Cortex-M 4 GB 주소 공간은 고정 구역: Code · SRAM · Peripheral · External · PPB",
                "고클럭 Flash 는 대기 상태(wait state)가 필요 · 프리페치·Flash 캐시로 가림",
                "**TCM**: 캐시를 거치지 않는 CPU 전용 메모리 · 시간 결정적 코드·데이터용",
                "M7 D-캐시 + DMA: 보내기 전 **clean**, 받은 뒤 **invalidate** · 버퍼는 32 B 정렬·배수"
            ],
            concepts: [
                { term: "메모리 구역 속성", en: "Memory type and attributes (Normal / Device / Strongly-ordered)", def: "구역마다 캐시 가능·버퍼링·실행 금지(XN)가 정해짐 · 주변장치 구역은 Device + XN" },
                { term: "TCM", en: "Tightly Coupled Memory", def: "M7 의 ITCM/DTCM · MPU 설정과 무관하게 항상 Non-cacheable 로 동작 · DMA 는 AHBS 로 접근" },
                { term: "MPU 영역", en: "MPU region", def: "시작 주소·크기(2의 거듭제곱, ≥32 B)·권한·캐시 속성 묶음 · 겹치면 번호 큰 영역이 우선" },
                { term: "캐시 일관성", en: "Cache coherence", def: "CPU 캐시와 메모리(DMA 가 보는 쪽)의 값을 같게 유지 · M7 과 DMA 사이엔 하드웨어 일관성 없음" },
                { term: "Clean / Invalidate", en: "Cache clean / cache invalidate", def: "dirty 라인을 메모리에 기록 / 라인을 버려 다음 읽기를 메모리에서" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "cpu", label: "CPU", sub: "Cortex-M7", x: 0, y: 0 },
                    { id: "dc", label: "D-캐시", sub: "4-way · 32 B 라인", x: 1, y: 0 },
                    { id: "sram", label: "SRAM", sub: "tx_buf · rx_buf", x: 2, y: 0 },
                    { id: "dtcm", label: "DTCM", sub: "캐시 안 거침", x: 0, y: 1 },
                    { id: "dma", label: "DMA", sub: "버스 마스터", x: 2, y: 1 },
                    { id: "uart", label: "UART", sub: "주변장치", x: 3, y: 1 }
                ],
                edges: [
                    { from: "cpu", to: "dc", label: "store" },
                    { from: "dc", to: "sram", label: "clean" },
                    { from: "sram", to: "dma", label: "읽기·쓰기", both: true },
                    { from: "dma", to: "uart", both: true }
                ],
                steps: [
                    { on: ["cpu", "cpu>dc", "dc"], text: "CPU 가 `tx_buf` 를 채움 → write-back 캐시라 새 값은 D-캐시에만 (dirty)" },
                    { on: ["sram", "sram>dma", "dma"], text: "이대로 DMA 를 켜면 SRAM 의 **옛 값**을 보냄 · DMA 는 캐시를 모름 → **캐시 일관성(cache coherence)** 깨짐" },
                    { on: ["dc", "dc>sram", "sram"], text: "해결 1: 보내기 전 `SCB_CleanDCache_by_Addr` → dirty 라인을 SRAM 에 기록" },
                    { on: ["sram>dma", "dma", "dma>uart", "uart"], text: "DMA 가 SRAM 에서 읽어 UART 로 · 이제 새 값" },
                    { on: ["uart", "dma", "sram>dma", "sram"], text: "수신: DMA 가 `rx_buf` 를 SRAM 에 씀 · 캐시엔 옛 라인이 남아 있을 수 있음" },
                    { on: ["dc", "cpu"], text: "해결 2: 받은 뒤 `SCB_InvalidateDCache_by_Addr` · DMA 중 **투기적 읽기(speculative read)**로 다시 채워진 라인도 버림" },
                    { on: ["dtcm"], text: "다른 길: 버퍼를 DTCM 에 두거나(DMA 가 닿는 칩) MPU 로 그 구역을 Non-cacheable 로" }
                ]
            },
            code: [
                {
                    lang: "c",
                    title: "DMA 송수신 + D-캐시 유지 (CMSIS)",
                    src: `#include "stm32h7xx.h"                /* CMSIS: SCB_*DCache_by_Addr */

#define BUF 256                        /* 32 의 배수 */
static uint8_t tx_buf[BUF] __attribute__((aligned(32)));
static uint8_t rx_buf[BUF] __attribute__((aligned(32)));

void send(void) {
    fill_packet(tx_buf, BUF);
    SCB_CleanDCache_by_Addr((uint32_t *)tx_buf, BUF);       /* 캐시 → SRAM */
    dma_start_tx(tx_buf, BUF);
}

void receive_start(void) {
    SCB_InvalidateDCache_by_Addr((uint32_t *)rx_buf, BUF);  /* dirty 라인이 DMA 데이터를 덮지 않게 */
    dma_start_rx(rx_buf, BUF);
}

void dma_rx_done_irq(void) {
    SCB_InvalidateDCache_by_Addr((uint32_t *)rx_buf, BUF);  /* 그사이 다시 채워진 옛 라인 버림 */
    process(rx_buf, BUF);
}`,
                    note: "32 B 정렬·배수가 아니면 invalidate 가 옆 변수의 최신 값까지 버림 · CMSIS 함수가 앞뒤 `DSB`·`ISB` 를 넣어 줌"
                },
                {
                    lang: "c",
                    title: "MPU: 스택 가드 + DMA 구역 Non-cacheable (Armv7-M)",
                    src: `extern uint32_t _sstack_guard;            /* 링커: 스택 맨 아래, 32 B 정렬 */
extern uint8_t  dma_pool[16 * 1024];      /* 링커: 16 KB 정렬 */

void mpu_init(void) {
    MPU->CTRL = 0;

    MPU->RNR  = 0;                         /* 스택 가드: 접근 금지 */
    MPU->RBAR = (uint32_t)&_sstack_guard;
    MPU->RASR = MPU_RASR_XN_Msk | (0u << MPU_RASR_AP_Pos)
              | (4u << MPU_RASR_SIZE_Pos) | MPU_RASR_ENABLE_Msk;    /* 2^(4+1) = 32 B */

    MPU->RNR  = 1;                         /* DMA 풀: Normal, Non-cacheable */
    MPU->RBAR = (uint32_t)dma_pool;
    MPU->RASR = MPU_RASR_XN_Msk | (3u << MPU_RASR_AP_Pos)           /* 전체 RW */
              | (1u << MPU_RASR_TEX_Pos)                             /* TEX=001, C=0, B=0 */
              | (13u << MPU_RASR_SIZE_Pos) | MPU_RASR_ENABLE_Msk;   /* 2^(13+1) = 16 KB */

    MPU->CTRL = MPU_CTRL_PRIVDEFENA_Msk | MPU_CTRL_ENABLE_Msk;      /* 나머지는 기본 맵 */
    SCB->SHCSR |= SCB_SHCSR_MEMFAULTENA_Msk;
    __DSB(); __ISB();
}`,
                    note: "**스택 가드(stack guard)**: 넘치는 순간 MemManage fault · **MPU 영역(MPU region)** 시작 주소는 크기의 배수 · 0번지 256 B 를 같은 식으로 막으면 널 역참조도 잡힘"
                }
            ],
            optimize: [
                {
                    title: "DMA 버퍼를 캐시 라인에 맞추기",
                    before: { lang: "c", src: `static uint8_t rx_buf[100];    // 4 B 정렬 · 크기 100
static int     rx_count;       // 같은 32 B 라인에 붙을 수 있음
// invalidate(rx_buf) 가 rx_count 의 최신 값까지 버림` },
                    after: { lang: "c", src: `#define ALIGN_UP(n, a) (((n) + (a) - 1) & ~((a) - 1))
static uint8_t rx_buf[ALIGN_UP(100, 32)] __attribute__((aligned(32)));  // 128 B
static int     rx_count;       // 항상 다른 라인` },
                    gain: "간헐적 데이터 손상 0",
                    note: "증상은 '가끔 변수가 옛 값으로 돌아감' · 재현이 어려우니 처음부터 규칙으로"
                },
                {
                    title: "Flash 대기 상태를 프리페치·캐시로 가리기 (STM32F4 예)",
                    before: { lang: "c", src: `FLASH->ACR = FLASH_ACR_LATENCY_5WS;          // 168 MHz: 5 대기 상태
// 프리페치·캐시 꺼짐 → 분기마다 Flash 를 기다림` },
                    after: { lang: "c", src: `FLASH->ACR = FLASH_ACR_LATENCY_5WS
           | FLASH_ACR_PRFTEN                 // 프리페치
           | FLASH_ACR_ICEN | FLASH_ACR_DCEN; // ART: 명령·데이터 캐시` },
                    gain: "Flash 대기 대부분 은닉",
                    note: "대기 상태 수는 클럭·전압별 표(레퍼런스 매뉴얼)대로 · 클럭을 올리기 **전에** LATENCY 먼저"
                }
            ],
            glossary: [
                { term: "PPB", en: "Private Peripheral Bus", def: "`0xE000_0000`~`0xE00F_FFFF` 코어 전용 구역 · NVIC, SysTick, SCB, MPU 레지스터" },
                { term: "XN", en: "Execute Never", def: "그 구역에서 명령 fetch 금지 · 주변장치·데이터 구역에 걸어 코드 주입 차단" },
                { term: "AHBS", en: "AHB slave interface (Cortex-M7)", def: "DMA 같은 다른 버스 마스터가 TCM 에 접근하는 M7 포트" },
                { term: "MemManage 폴트", en: "Memory Management fault", def: "MPU·XN 위반 예외 · 주소는 `MMFAR` · 꺼져 있으면 HardFault 로 승격" },
                { term: "스택 가드", en: "Stack guard region", def: "스택 바로 아래 접근 금지 구역 · 넘치는 순간 fault 로 잡음" },
                { term: "투기적 읽기", en: "Speculative read", def: "CPU 가 쓸지 모를 데이터를 미리 읽음 · DMA 중에도 캐시 라인이 다시 채워지는 이유" }
            ],
            quiz: [
                { q: "Cortex-M 기본 메모리맵에서 `0x4000_0000` 구역은?", options: ["SRAM", "Peripheral (Device, XN)", "Code", "PPB"], a: 1, why: "`0x4000_0000`–`0x5FFF_FFFF` = 주변장치 · 실행 금지" },
                { q: "M7 에서 DMA 로 보낼 버퍼를 CPU 가 채운 뒤 필요한 것은?", options: ["Invalidate", "Clean", "아무것도 안 함", "캐시를 꺼야만 함"], a: 1, why: "dirty 라인을 SRAM 에 기록해야 DMA 가 새 값을 읽음" },
                { q: "DMA 수신 완료 후 CPU 가 옛 값을 읽는 원인은?", options: ["DMA 가 느려서", "D-캐시에 남은 옛 라인", "Flash 대기 상태", "MPU 권한"], a: 1, why: "캐시 히트라 SRAM 을 안 봄 → invalidate 필요" },
                { q: "Armv7-M MPU 로 32 KB 영역을 만들 때 시작 주소 조건은?", options: ["4 B 정렬", "32 B 정렬", "32 KB 정렬", "제한 없음"], a: 2, why: "영역 시작 = 크기의 배수" },
                { q: "M7 의 DTCM 에 둔 DMA 버퍼에 캐시 유지 작업이 필요 없는 이유는?", options: ["TCM 이 더 빨라서", "TCM 은 항상 Non-cacheable 로 동작해서", "DMA 가 캐시를 비워서", "MPU 가 자동 처리해서"], a: 1, why: "TRM: TCM 은 MPU 속성과 무관하게 Non-cacheable" }
            ],
            refs: [
                { title: "Arm Cortex-M7 Devices Generic User Guide", by: "Arm", year: 2015, url: "https://documentation-service.arm.com/static/61efd6602dd99944d051417b", kind: "doc" },
                { title: "Arm Cortex-M7 Processor Technical Reference Manual (r1p1)", by: "Arm", year: 2015, url: "https://documentation-service.arm.com/static/5e906da3c8052b1608760e3d", kind: "doc" },
                { title: "CMSIS-Core (Cortex-M): D-Cache Functions", by: "Arm", url: "https://arm-software.github.io/CMSIS_6/latest/Core/group__Dcache__functions__m7.html", kind: "doc" }
            ]
        },
        {
            id: "mem-alloc",
            title: "동적 할당과 단편화",
            level: 2,
            mins: 14,
            key: [
                "`malloc` 블록 앞엔 **블록 헤더(block header)** · 빈 블록은 **가용 리스트(free list)**로",
                "**외부 단편화(external fragmentation)**: 빈 공간 합은 충분한데 연속 블록이 없음",
                "**내부 단편화(internal fragmentation)**: 정렬·최소 크기 때문에 블록 안에 남는 낭비",
                "임베디드는 **초기화 후 힙 금지**가 흔함 · 고정 크기 **메모리 풀(memory pool)**로 O(1)"
            ],
            concepts: [
                { term: "블록 헤더", en: "Block header (chunk metadata)", def: "사용자 포인터 바로 앞의 크기·사용 플래그 · 넘쳐 쓰면 다음 `free` 에서 터짐" },
                { term: "가용 리스트", en: "Free list", def: "빈 블록을 잇는 연결 리스트 · 빈 블록 자체를 노드로 씀" },
                { term: "병합", en: "Coalescing", def: "`free` 때 인접한 빈 블록을 합쳐 큰 블록으로 · 외부 단편화 완화 (FreeRTOS heap_4)" },
                { term: "메모리 풀", en: "Fixed-size block pool", def: "같은 크기 블록 N개를 미리 확보 · 할당·해제 O(1), 외부 단편화 없음" },
                { term: "할당 정책", en: "Placement policy (first-fit / best-fit)", def: "어느 빈 블록을 쓸지 · first-fit 은 빠름, best-fit 은 자투리를 줄이려 함" }
            ],
            demo: {
                type: "sim",
                name: "memory",
                lang: "c",
                code: `#include <stdlib.h>

int main(void) {
    char *a = malloc(24);
    char *b = malloc(24);
    char *c = malloc(24);
    char *g = malloc(24);   // 끝을 막는 블록
    free(a);
    free(c);
    char *d = malloc(48);   // 빈 칸은 24 B 두 개
    free(b);
    char *e = malloc(48);
    return 0;
}`,
                steps: [
                    { line: 4, stack: [{ fn: "main", vars: [["a", "→0x1008"]] }], heap: [["0x1008", "a · 24 B"]], text: "단순화한 할당기: 헤더 8 B + 데이터 24 B = 32 B 블록 · 포인터는 헤더 **뒤**" },
                    { line: 5, stack: [{ fn: "main", vars: [["a", "→0x1008"], ["b", "→0x1028"]] }], heap: [["0x1008", "a · 24 B"], ["0x1028", "b · 24 B"]], text: "다음 블록은 바로 뒤 `0x1020` 헤더, 데이터 `0x1028`" },
                    { line: 6, stack: [{ fn: "main", vars: [["a", "→0x1008"], ["b", "→0x1028"], ["c", "→0x1048"]] }], heap: [["0x1008", "a · 24 B"], ["0x1028", "b · 24 B"], ["0x1048", "c · 24 B"]], text: "c 도 연속으로" },
                    { line: 7, stack: [{ fn: "main", vars: [["a", "→0x1008"], ["b", "→0x1028"], ["c", "→0x1048"], ["g", "→0x1068"]] }], heap: [["0x1008", "a · 24 B"], ["0x1028", "b · 24 B"], ["0x1048", "c · 24 B"], ["0x1068", "g · 24 B"]], text: "블록 4개가 빈틈없이 · 힙 끝은 `0x1080`" },
                    { line: 8, stack: [{ fn: "main", vars: [["a", "→0x1008"], ["b", "→0x1028"], ["c", "→0x1048"], ["g", "→0x1068"]] }], heap: [["0x1008", "freed"], ["0x1028", "b · 24 B"], ["0x1048", "c · 24 B"], ["0x1068", "g · 24 B"]], text: "`free(a)`: 블록을 가용 리스트에 연결 · 내용은 그대로, 헤더에 '빈' 표시" },
                    { line: 9, stack: [{ fn: "main", vars: [["a", "→0x1008"], ["b", "→0x1028"], ["c", "→0x1048"], ["g", "→0x1068"]] }], heap: [["0x1008", "freed"], ["0x1028", "b · 24 B"], ["0x1048", "freed"], ["0x1068", "g · 24 B"]], text: "빈 블록 2개(각 32 B)가 b 를 사이에 두고 떨어짐" },
                    { line: 10, stack: [{ fn: "main", vars: [["a", "→0x1008"], ["b", "→0x1028"], ["c", "→0x1048"], ["g", "→0x1068"], ["d", "→0x1088"]] }], heap: [["0x1008", "freed"], ["0x1028", "b · 24 B"], ["0x1048", "freed"], ["0x1068", "g · 24 B"], ["0x1088", "d · 48 B"]], text: "56 B 블록이 필요한데 빈 칸은 32 B 씩 → 못 씀 · 힙 끝을 늘려 `0x1088` · 이게 외부 단편화" },
                    { line: 11, stack: [{ fn: "main", vars: [["a", "→0x1008"], ["b", "→0x1028"], ["c", "→0x1048"], ["g", "→0x1068"], ["d", "→0x1088"]] }], heap: [["0x1008", "빈 96 B (a+b+c)"], ["0x1068", "g · 24 B"], ["0x1088", "d · 48 B"]], text: "`free(b)`: 양옆이 빈 블록 → **병합(coalescing)**으로 96 B 한 덩어리" },
                    { line: 12, stack: [{ fn: "main", vars: [["a", "→0x1008"], ["b", "→0x1028"], ["c", "→0x1048"], ["g", "→0x1068"], ["d", "→0x1088"], ["e", "→0x1008"]] }], heap: [["0x1008", "e · 48 B"], ["0x1040", "빈 블록 40 B"], ["0x1068", "g · 24 B"], ["0x1088", "d · 48 B"]], text: "96 B 에서 56 B 를 떼어 줌(분할) · 남은 40 B 는 다시 가용 리스트로 · a·b·c 는 이제 dangling" },
                    { line: 13, stack: [{ fn: "main", vars: [["d", "→0x1088"], ["e", "→0x1008"], ["g", "→0x1068"]] }], heap: [["0x1008", "e · 48 B"], ["0x1040", "빈 블록 40 B"], ["0x1068", "g · 24 B"], ["0x1088", "d · 48 B"]], text: "같은 총량이라도 할당·해제 순서에 따라 힙이 조각남 · 오래 도는 펌웨어일수록 위험" }
                ]
            },
            code: [
                {
                    lang: "c",
                    title: "고정 크기 블록 풀 (O(1), 외부 단편화 없음)",
                    src: `#include <stddef.h>
#include <stdint.h>

#define BLK_SIZE  64                 /* 포인터 크기 이상 · 정렬의 배수 */
#define BLK_COUNT 32

static union blk { union blk *next; uint8_t data[BLK_SIZE]; }
    pool[BLK_COUNT] __attribute__((aligned(8)));
static union blk *free_head;

void pool_init(void) {
    for (int i = 0; i < BLK_COUNT - 1; i++) pool[i].next = &pool[i + 1];
    pool[BLK_COUNT - 1].next = NULL;
    free_head = &pool[0];
}

void *pool_alloc(void) {             /* O(1) · 비었으면 NULL */
    union blk *b = free_head;
    if (b) free_head = b->next;
    return b;
}

void pool_free(void *p) {            /* O(1) */
    union blk *b = p;
    b->next = free_head;
    free_head = b;
}`,
                    note: "빈 블록 자신을 리스트 노드로 써서 헤더 0 B · ISR 과 함께 쓰면 임계구역(critical section)으로 감쌀 것"
                },
                {
                    lang: "c",
                    title: "할당 실패·최저 여유량 감시 (FreeRTOS heap_4)",
                    src: `/* FreeRTOSConfig.h */
#define configTOTAL_HEAP_SIZE         (32 * 1024)
#define configUSE_MALLOC_FAILED_HOOK  1

void vApplicationMallocFailedHook(void) {     /* pvPortMalloc 이 NULL 일 때 */
    taskDISABLE_INTERRUPTS();
    for (;;) {}                                /* 디버거로 잡기 */
}

void heap_report(void) {
    size_t now = xPortGetFreeHeapSize();
    size_t low = xPortGetMinimumEverFreeHeapSize();   /* 부팅 후 최저치 */
    printf("heap free %u, low %u\\n", (unsigned)now, (unsigned)low);
}`,
                    note: "heap_4 는 해제 때 인접 블록을 병합 · heap_1 은 해제 자체가 없어 '초기화 때만 할당' 설계에 맞음"
                }
            ],
            optimize: [
                {
                    title: "런타임 가변 `malloc` → 상한을 정한 블록 풀",
                    before: { lang: "c", src: `void on_packet(const uint8_t *p, size_t n) {
    msg_t *m = malloc(sizeof *m + n);   // 패킷마다 가변 크기
    handle(m, p, n);
    free(m);                            // 몇 달 뒤 단편화로 NULL
}` },
                    after: { lang: "c", src: `#define MSG_MAX 64                      // = BLK_SIZE, 상한이 계약
void on_packet(const uint8_t *p, size_t n) {
    if (n > MSG_MAX) return;            // 상한 초과 = 프로토콜 오류
    uint8_t *m = pool_alloc();          // O(1) · NULL = 큐 가득 (설계값)
    if (!m) return;
    handle(m, p, n);
    pool_free(m);
}` },
                    gain: "할당 O(1) · 외부 단편화 0 · RAM 은 링크 때 확정",
                    note: "Power of Ten 규칙 3: 초기화 후 동적 할당 금지 · 내부 단편화를 받아들이고 예측 가능성을 얻음"
                },
                {
                    title: "크기별 풀 몇 개로 내부 단편화 줄이기",
                    before: { lang: "c", src: `// 모든 요청을 256 B 블록 하나로
void *m = pool256_alloc();   // 20 B 요청도 256 B → 92% 낭비` },
                    after: { lang: "c", src: `void *alloc(size_t n) {
    if (n <= 32)  return pool_get(&pool32);
    if (n <= 128) return pool_get(&pool128);
    if (n <= 256) return pool_get(&pool256);
    return NULL;              // 상한 초과 = 버그
}` },
                    gain: "20 B 요청 낭비 92% → 38%",
                    note: "크기 분포를 먼저 로그로 측정 · 범용 할당기의 크기 클래스(size class)도 같은 아이디어"
                }
            ],
            glossary: [
                { term: "외부 단편화", en: "External fragmentation", def: "빈 공간이 작은 조각으로 흩어져 큰 요청을 못 받는 상태" },
                { term: "내부 단편화", en: "Internal fragmentation", def: "요청보다 큰 블록을 줘서 블록 안에 남는 낭비 · 정렬·고정 크기 블록에서 생김" },
                { term: "First-fit", en: "First-fit allocation", def: "가용 리스트에서 처음 맞는 블록 사용 · 빠르지만 앞쪽에 자투리가 쌓임" },
                { term: "버디 할당기", en: "Buddy allocator", def: "2의 거듭제곱 크기로 쪼개고 짝(buddy)끼리 병합 · Linux 페이지 할당기" },
                { term: "힙 손상", en: "Heap corruption", def: "버퍼 넘침·이중 해제로 헤더·리스트가 깨짐 · 증상은 나중 `malloc`/`free` 에서 나타남" },
                { term: "최저 여유량", en: "Low-water mark", def: "부팅 후 가장 적었던 여유 힙·스택 · 여유 설계의 근거" }
            ],
            quiz: [
                { q: "빈 공간 합은 1 KB 인데 200 B 할당이 실패했다. 원인은?", options: ["내부 단편화", "외부 단편화", "메모리 누수", "스택 오버플로"], a: 1, why: "빈 공간이 200 B 미만 조각들로 흩어짐" },
                { q: "8 B 정렬 할당기에 `malloc(13)` 이면 데이터 영역은 최소?", options: ["13 B", "14 B", "16 B", "24 B"], a: 2, why: "8 의 배수로 올림 → 16 B · 남는 3 B 는 내부 단편화" },
                { q: "고정 크기 블록 풀의 특징이 아닌 것은?", options: ["할당 O(1)", "외부 단편화 없음", "작은 요청에도 낭비 없음", "최대 개수가 미리 정해짐"], a: 2, why: "작은 요청도 블록 하나를 통째로 씀 → 내부 단편화" },
                { q: "`free` 가 인접한 빈 블록을 합치는 이유는?", options: ["속도 향상", "외부 단편화 완화", "보안", "캐시 히트율"], a: 1, why: "작은 조각들을 큰 블록으로 되살려 큰 요청을 받음" },
                { q: "임베디드 코딩 규칙이 '초기화 후 동적 할당 금지'를 두는 이유는?", options: ["`malloc` 이 표준이 아니라서", "실행 시간·실패 여부를 예측하기 어려워서", "Flash 를 많이 써서", "컴파일러가 지원 안 해서"], a: 1, why: "단편화·누수로 몇 달 뒤 실패할 수 있음 · 정적 할당은 링크 때 검증" }
            ],
            refs: [
                { title: "Dynamic Storage Allocation: A Survey and Critical Review", by: "Wilson et al.", year: 1995, url: "https://doi.org/10.1007/3-540-60368-9_19", kind: "paper" },
                { title: "A Memory Allocator", by: "Lea", year: 1996, url: "https://gee.cs.oswego.edu/dl/html/malloc.html", kind: "doc" },
                { title: "FreeRTOS-Kernel portable/MemMang/heap_4.c", by: "FreeRTOS", url: "https://github.com/FreeRTOS/FreeRTOS-Kernel/blob/main/portable/MemMang/heap_4.c", kind: "doc" },
                { title: "The Power of Ten – Rules for Developing Safety Critical Code", by: "Holzmann", year: 2006, url: "https://spinroot.com/gerard/pdf/P10.pdf", kind: "paper" }
            ]
        }
    ]
});
