LAB.track({
    id: "assembly",
    name: "어셈블리",
    icon: "⌬",
    color: "#e879f9",
    tagline: "C 한 줄이 어떤 명령이 되는지. Cortex-M(Thumb-2) 중심, RISC-V·x86-64 비교",
    trends: [
        {
            title: "RISC-V RVA23: 배포판의 새 기준선",
            when: "2024–2026",
            points: [
                "RVA23 프로파일(profile): 64bit 응용 프로세서용 **필수 확장 묶음** · 벡터(V)·하이퍼바이저(H) 필수",
                "Android RISC-V ABI의 기준선(baseline) · 칩마다 확장을 묻지 않고 한 이름으로 타깃",
                "Ubuntu 25.10부터 RVA23이 최소 요구 · 26.04 LTS가 같은 기준선을 장기 지원",
                "V가 필수라 RVA23 타깃 소프트웨어는 벡터 명령을 기본으로 가정 가능"
            ],
            refs: [
                { title: "RISC-V Announces Ratification of the RVA23 Profile Standard", by: "RISC-V International", year: 2024, url: "https://riscv.org/blog/risc-v-announces-ratification-of-the-rva23-profile-standard/", kind: "doc" },
                { title: "Canonical and Ubuntu RISC-V: a 2025 retro and looking forward to 2026", by: "Canonical", year: 2026, url: "https://ubuntu.com/blog/canonical-and-ubuntu-risc-v-a-2025-retro-and-looking-forward-to-2026", kind: "doc" },
                { title: "RISC-V Architecture Profiles", by: "RISC-V International", url: "https://github.com/riscv/riscv-profiles", kind: "spec" }
            ]
        },
        {
            title: "Intel APX: x86-64 레지스터 32개",
            when: "2024–2026",
            points: [
                "범용 레지스터(general-purpose register) 16 → 32 (`r16`–`r31`, EGPR)",
                "3-피연산자 형식(NDD) · 플래그 안 바꾸는 변형(NF) · 조건부 비교(CCMP) · `push2`/`pop2`",
                "GCC 14 `-mapxf`로 일부, GCC 15에서 CFCMOV 외 전부 지원",
                "GCC 16 (2026-04): `-march=novalake`가 APX_F를 켬 · `-march=diamondrapids`는 GCC 15부터"
            ],
            refs: [
                { title: "GCC 14 Release Series — Changes, New Features, and Fixes", by: "GNU Project", year: 2024, url: "https://gcc.gnu.org/gcc-14/changes.html", kind: "doc" },
                { title: "GCC 15 Release Series — Changes, New Features, and Fixes", by: "GNU Project", year: 2025, url: "https://gcc.gnu.org/gcc-15/changes.html", kind: "doc" },
                { title: "GCC 16 Release Series — Changes, New Features, and Fixes", by: "GNU Project", year: 2026, url: "https://gcc.gnu.org/gcc-16/changes.html", kind: "doc" }
            ]
        },
        {
            title: "Helium(MVE): Cortex-M의 벡터 명령",
            when: "2020–2026",
            points: [
                "Armv8.1-M의 M-Profile Vector Extension · Cortex-M55가 첫 구현 (GCC 기준 M52·M85도 `mve`)",
                "128bit 벡터를 레인(lane)으로 나눠 SIMD: 8bit × 16, 16bit × 8, 32bit × 4",
                "꼬리 예측(tail predication) `dlstp`/`letp`: 남는 원소를 스칼라 꼬리 루프 없이",
                "2026-11 Cortex-M42: M4·M33급 AHB 설계를 Helium으로 올리는 길 · M33 대비 벡터 연산 최대 3배 (Arm 발표)"
            ],
            refs: [
                { title: "Introduction to Helium guide (102102, Version 1.3)", by: "Arm", year: 2024, url: "https://documentation-service.arm.com/static/65969ed3159ca73387227541", kind: "doc" },
                { title: "Arm expands Arm Flexible Access and Arm Total Access portfolios with new Arm Cortex-M42", by: "Arm", year: 2026, url: "https://newsroom.arm.com/news/arm-cortex-m42-accelerate-edge-ai-innovation", kind: "doc" },
                { title: "GCC arm-cpus.in (CPU → architecture table)", by: "GNU Project", url: "https://gcc.gnu.org/git/?p=gcc.git;a=blob_plain;f=gcc/config/arm/arm-cpus.in;hb=HEAD", kind: "doc" }
            ]
        },
        {
            title: "PACBTI: Cortex-M의 반환 주소 서명",
            when: "2022–2026",
            points: [
                "Armv8.1-M 선택 확장 · GCC 기준 Cortex-M52·M85가 `+pacbti` · ROP/JOP 공격 완화",
                "PAC: 프롤로그(prologue)에서 `pac r12, lr, sp` (SP가 수정자(modifier)) · 에필로그(epilogue)에서 `aut` 검증 · 불일치면 INVSTATE UsageFault",
                "BTI: 간접 분기의 착지점(landing pad) 표시 · GCC `-mbranch-protection=standard` (= pac-ret + bti)",
                "PAC·AUT는 NOP 호환 공간 명령이라 확장 없는 코어에서도 같은 바이너리가 동작"
            ],
            refs: [
                { title: "Armv8.1-M PACBTI Extensions (109576, Version 1.0)", by: "Arm", year: 2024, url: "https://documentation-service.arm.com/static/65f03302e1542617e2aa538a", kind: "doc" },
                { title: "ARM Options (Using the GNU Compiler Collection)", by: "GNU Project", url: "https://gcc.gnu.org/onlinedocs/gcc/ARM-Options.html", kind: "doc" }
            ]
        }
    ],
    lessons: [
        {
            id: "asm-basics",
            title: "레지스터와 명령어",
            level: 1,
            mins: 12,
            pre: ["embedded/bits"],
            checked: "2026-11-16",
            key: [
                "**ISA**(Instruction Set Architecture) = 하드웨어와 소프트웨어의 약속: 명령·레지스터·인코딩",
                "**로드/스토어 구조**(load/store architecture): 계산은 레지스터끼리, 메모리는 `ldr`/`str`로만",
                "**범용 레지스터**(general-purpose register) `r0`–`r12` + `sp` `lr` `pc` · 상태는 `xPSR`",
                "명령 하나 = 레지스터 몇 개를 바꾸고 `pc`를 다음으로 · 분기는 `pc`를 바꾸는 것"
            ],
            concepts: [
                { term: "ISA", en: "Instruction Set Architecture", def: "명령 종류·레지스터·인코딩·예외 동작의 규격 · Cortex-M3 = Armv7-M, M4 = Armv7E-M (+DSP)" },
                { term: "Thumb-2", def: "16bit와 32bit 명령을 섞는 Arm 인코딩 · Cortex-M은 Thumb 상태만 실행" },
                { term: "로드/스토어 구조", en: "Load/store architecture", def: "ALU 명령은 레지스터만 읽고 씀 · 메모리 값은 먼저 `ldr`로 가져옴" },
                { term: "범용 레지스터", en: "General-purpose register", def: "32bit × 13개 `r0`–`r12` · `r13` = SP, `r14` = LR, `r15` = PC" },
                { term: "xPSR", en: "Combined Program Status Register", def: "APSR(N Z C V Q 플래그) + IPSR(예외 번호) + EPSR(Thumb 비트, IT 상태)" }
            ],
            demo: {
                type: "sim", name: "cpu",
                title: "산술 명령 · (a + b) × 4 − c",
                intro: "▶ 한 줄 을 눌러 실행 · 바뀐 레지스터가 강조됨 · 마지막 두 방식이 같은 42를 만드는지 보기",
                code: `@ (a + b) * 4 - c   ·   a = 7, b = 5, c = 6
    movs r0, #7              @ r0 ← 7 · 즉시값을 레지스터로
    movs r1, #5              @ r1 ← 5
    movs r2, #6              @ r2 ← 6
    add  r3, r0, r1          @ r3 ← a + b = 12 · 계산은 레지스터끼리
    lsl  r0, r3, #2          @ r0 ← 12 << 2 = 48 · ×4 는 시프트
    sub  r0, r0, r2          @ r0 ← 48 − 6 = 42
    rsb  r1, r2, r3, lsl #2  @ r1 ← (12 << 2) − 6 = 42 · GCC 는 이 한 줄
    bx   lr                  @ 복귀 · 반환값은 r0`,
                expect: { r0: 42, r1: 42, r3: 12 }
            },
            code: [
                {
                    lang: "asm",
                    title: "GCC -O2 · calc()",
                    src: `@ int calc(int a, int b, int c) { return (a + b) * 4 - c; }
@ arm-none-eabi-gcc -O2 -mcpu=cortex-m4 -mthumb
calc:
        add     r0, r0, r1          @ r0 = a + b
        rsb     r0, r2, r0, lsl #2  @ r0 = (r0 << 2) - c
        bx      lr                  @ 반환값은 r0`,
                    note: "인자 `r0`–`r2`, 반환 `r0` · `rsb`(reverse subtract)의 두 번째 피연산자에 **배럴 시프터**(barrel shifter)가 붙어 ×4가 공짜"
                },
                {
                    lang: "asm",
                    title: "레지스터 역할과 상수",
                    src: `@ r0-r3   인자 · 반환값 · 임시     (함수를 부르면 깨질 수 있음)
@ r4-r11  지역 변수              (부른 함수가 원래대로 돌려놔야 함)
@ r12     ip · 링커 veneer 용 임시
@ r13     sp · 스택 포인터 (MSP 또는 PSP)
@ r14     lr · 돌아갈 주소 (bl 이 채움)
@ r15     pc · 실행 중인 명령 위치
        movs    r0, #200           @ 8bit 즉시값 · 16bit 인코딩
        mov     r1, #1000          @ 회전된 8bit 로 표현 가능 · 32bit 인코딩
        movw    r2, #0x5678        @ 아무 16bit 값
        movt    r2, #0x1234        @ 위 16bit → r2 = 0x12345678
        ldr     r3, =0xDEADBEEF    @ 또는 리터럴 풀에서 로드`,
                    note: "**니모닉**(mnemonic) 끝의 `s` = 플래그 갱신 · 큰 **즉시값**(immediate value)은 인코딩에 다 안 들어가 `movw`/`movt`나 `ldr =`로"
                }
            ],
            optimize: [
                {
                    title: "곱셈 대신 시프트, 시프트는 피연산자에 접어 넣기",
                    before: { lang: "asm", src: `        movs    r3, #4
        mul     r0, r0, r3      @ ×4 를 곱셈으로
        subs    r0, r0, r2` },
                    after: { lang: "asm", src: `        rsb     r0, r2, r0, lsl #2   @ (r0 << 2) − r2 한 명령` },
                    gain: "3 명령 → 1",
                    note: "GCC -O2가 `calc()`에서 실제로 만든 형태 · 손으로 짤 때만 신경 쓰면 됨"
                },
                {
                    title: "16bit 인코딩: 플래그를 안 쓰면 `adds`/`movs`",
                    before: { lang: "asm", src: `        add     r0, r0, #1     @ add.w · 4바이트
        mov     r1, #0         @ mov.w · 4바이트` },
                    after: { lang: "asm", src: `        adds    r0, #1         @ 2바이트 (r0–r7 · 플래그 갱신)
        movs    r1, #0         @ 2바이트` },
                    gain: "8 → 4 바이트",
                    note: "16bit 형은 IT 블록 밖에서 항상 플래그를 바꿈 → 뒤에서 그 플래그를 읽으면 못 씀 · 컴파일러가 알아서 고름"
                }
            ],
            glossary: [
                { term: "PC", en: "Program Counter", def: "실행 중인 명령 위치 · 분기·호출·복귀는 결국 PC를 바꾸는 일" },
                { term: "LR", en: "Link Register", def: "`r14` · `bl`이 돌아올 주소를 넣음 · `bx lr`로 복귀" },
                { term: "니모닉", en: "Mnemonic", def: "명령의 사람용 이름 `add`, `ldr` · 어셈블러가 기계어 비트로 바꿈" },
                { term: "배럴 시프터", en: "Barrel shifter", def: "두 번째 피연산자를 같은 명령 안에서 시프트 · `add r0, r1, r2, lsl #2`" },
                { term: "즉시값", en: "Immediate value", def: "명령 비트 안에 든 상수 `#5` · 인코딩 비트 수만큼만 표현 가능" }
            ],
            quiz: [
                { q: "Cortex-M에 `add r0, r0, [r1]` 같은 명령이 없는 이유는?", options: ["ALU는 레지스터만 읽는 구조", "메모리 피연산자는 32bit 형만 있음", "Flash 실행 중에만 막혀 있음", "캐시가 없어 메모리 연산 금지"], a: 0, why: "로드/스토어 구조: 메모리 값은 `ldr`로 가져온 뒤 계산 · 32bit 인코딩에도 메모리 피연산자 ALU 명령은 없음" },
                { q: "`bl func` 직후 `lr`에 들어 있는 값은?", options: ["`func` 시작 주소 (bit0 = 1)", "`bl` 다음 명령 주소 (bit0 = 1)", "`bl` 자신의 주소 (bit0 = 0)", "호출 전 `sp` 값 그대로"], a: 1, why: "`lr` = 돌아올 곳 = 다음 명령 · `func` 주소는 `pc`로 감 · bit0 = 1은 Thumb 표시" },
                { q: "`rsb r0, r2, r0, lsl #2`의 결과는?", options: ["r2 − r0×4", "r0×4 − r2", "r0 − r2×4", "(r0 − r2) × 4"], a: 1, why: "rsb = op2 − rn · op2 = `r0, lsl #2` = r0×4 · `sub`였다면 r2 − r0×4" },
                { q: "`r13`의 역할은?", options: ["링크 레지스터", "스택 포인터", "프로그램 카운터", "플래그 레지스터"], a: 1, why: "r13 = SP · 돌아올 주소를 든 LR은 r14, PC는 r15" },
                { q: "N, Z, C, V 플래그가 들어 있는 곳은?", options: ["IPSR", "APSR", "EPSR", "CONTROL"], a: 1, why: "xPSR = APSR(플래그) + IPSR(예외 번호) + EPSR(T 비트·IT) · CONTROL은 스택·특권 선택" },
                { type: "text", q: "실행 후 `r0`은? (10진수)", code: { lang: "asm", src: "movs r1, #3\nmovs r2, #10\nrsb  r0, r1, r2, lsl #2" }, answer: ["37", "0x25"], why: "op2 = 10 << 2 = 40 · rsb = 40 − 3 = 37" },
                { type: "text", q: "실행 후 `r0`은?", code: { lang: "asm", src: "movs r0, #5\nmvn  r1, r0        @ ~5\nadds r0, r1, #1" }, answer: ["-5", "0xFFFFFFFB", "4294967291"], why: "~5 + 1 = −5 · 2의 보수 부호 반전 · `neg`와 같은 결과" },
                { type: "num", q: "`calc`를 objdump 하면 `add r0, r1` (16bit) · `rsb r0, r2, r0, lsl #2` (32bit) · `bx lr` (16bit). 함수 크기는 몇 바이트?", answer: 8, unit: "B", why: "2 + 4 + 2 = 8 · 시프트가 붙은 `rsb`만 32bit 인코딩" },
                { type: "order", q: "전역 변수 `x += y;`가 Cortex-M에서 실행되는 순서", items: ["x·y의 주소를 레지스터로", "`ldr`로 값 읽기", "레지스터끼리 `add`", "`str`로 x에 되쓰기"], why: "로드/스토어 구조: 주소 → 값 → 계산 → 저장 · 메모리가 바뀌는 건 `str` 한 번" }
            ],
            refs: [
                { title: "Armv7-M Architecture Reference Manual (DDI 0403E.e)", by: "Arm", year: 2021, url: "https://documentation-service.arm.com/static/606dc36485368c4c2b1bf62f", kind: "spec" },
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" },
                { title: "ARM-Dependent Features (Using as)", by: "GNU Binutils", url: "https://sourceware.org/binutils/docs/as/ARM_002dDependent.html", kind: "doc" }
            ]
        },
        {
            id: "asm-flags",
            title: "산술과 플래그",
            level: 1,
            mins: 14,
            pre: ["assembly/asm-basics", "embedded/bits"],
            checked: "2026-11-16",
            key: [
                "플래그는 `s` 붙은 명령(`adds`…)과 `cmp`·`cmn`·`tst`·`teq`만 바꿈",
                "`cmp a, b` = `a − b`를 계산하고 결과는 버림 · **NZCV**만 남김",
                "같은 비트, 다른 해석: 부호 없는 `bhi`/`blo` (C·Z) vs 부호 있는 `bgt`/`blt` (N·V·Z)",
                "64bit 덧셈 = `adds`(하위, **자리올림**(carry) → C) + `adc`(상위 + C)"
            ],
            concepts: [
                { term: "NZCV", en: "Negative / Zero / Carry / oVerflow flags", def: "N = 결과 bit31 · Z = 결과 0 · C = 부호 없는 자리올림 · V = 부호 있는 넘침" },
                { term: "뺄셈의 C 플래그", en: "Carry as NOT borrow", def: "Arm은 뺄셈에서 빌림이 **없으면** C=1 · `cmp 5, 3` → C=1, `cmp 3, 5` → C=0" },
                { term: "조건 코드", en: "Condition code", def: "`eq ne hs lo hi ls ge lt gt le mi pl vs vc` · 분기와 IT 블록이 플래그를 읽는 이름" },
                { term: "ADC / SBC", en: "Add with Carry / Subtract with Carry", def: "C를 더하거나 빌림을 빼서 32bit보다 긴 정수를 이어서 계산" }
            ],
            demo: {
                type: "sim", name: "cpu",
                title: "64bit 덧셈 · 부호 없는/있는 비교",
                intro: "▶ `adds` 뒤 C 플래그, `cmp` 뒤 NZCV를 보기 · 같은 `0xFFFFFFFF`가 비교마다 다르게 읽힘",
                code: `@ 1) 64bit 덧셈  0x1_FFFFFFFF + 1   (상위:하위 = r1:r0, r3:r2)
    mov  r0, #0xFFFFFFFF     @ a 하위
    movs r1, #1              @ a 상위
    movs r2, #1              @ b 하위
    movs r3, #0              @ b 상위
    adds r0, r0, r2          @ 하위: 0xFFFFFFFF + 1 = 0 → C=1, Z=1
    adc  r1, r1, r3          @ 상위: 1 + 0 + C = 2 → 결과 0x2_00000000
@ 2) 같은 비트 0xFFFFFFFF = 4294967295 (부호 없음) = −1 (부호 있음)
    mov  r4, #-1
    movs r5, #0
    movs r6, #0
    cmp  r4, #1              @ r4 − 1 계산 · 결과는 버리고 NZCV 만
    bls  not_hi              @ 부호 없이 r4 ≤ 1 ? → 아니라서 통과
    movs r5, #1              @ r5 = 1 : 부호 없으면 r4 가 더 큼
not_hi:
    cmp  r4, #1              @ movs 가 N·Z 를 바꿨으니 다시 비교
    bge  not_lt              @ 부호 있게 r4 ≥ 1 ? → 아니라서 통과
    movs r6, #1              @ r6 = 1 : 부호 있으면 r4 가 더 작음
not_lt:
    bx   lr`,
                expect: { r0: 0, r1: 2, r5: 1, r6: 1 }
            },
            code: [
                {
                    lang: "asm",
                    title: "GCC -O2 · 부호 있는/없는 비교",
                    src: `@ int gt_s(int a, int b)           { return a > b; }
gt_s:
        cmp     r0, r1
        ite     le               @ 다음 두 명령: le 면 첫째, 아니면 둘째
        movle   r0, #0
        movgt   r0, #1           @ gt = Z==0 && N==V
        bx      lr
@ int gt_u(unsigned a, unsigned b) { return a > b; }
gt_u:
        cmp     r0, r1           @ 같은 cmp
        ite     ls
        movls   r0, #0
        movhi   r0, #1           @ hi = C==1 && Z==0
        bx      lr`,
                    note: "C 타입만 다르고 `cmp`는 같음 · 차이는 **조건 코드**(condition code) `gt` vs `hi`뿐"
                },
                {
                    lang: "asm",
                    title: "GCC -O2 · 64bit 덧셈",
                    src: `@ uint64_t add64(uint64_t a, uint64_t b) { return a + b; }
@ a = r1:r0, b = r3:r2, 반환 r1:r0  (하위 워드가 번호 작은 레지스터)
add64:
        adds    r0, r0, r2       @ 하위 + 하위 → 자리올림은 C 로
        adc     r1, r1, r3       @ 상위 + 상위 + C
        bx      lr
@ 64bit 뺄셈은 subs + sbc (sbc 는 빌림 = !C 를 뺌)`,
                    note: "**다중 정밀도 연산**(multi-precision arithmetic): 128bit면 `adds` → `adcs` → `adcs` → `adc`"
                }
            ],
            optimize: [
                {
                    title: "**부호 있는 넘침**(signed overflow) 검사: C 비교식 → `__builtin_add_overflow`",
                    before: { lang: "asm", src: `@ if ((b > 0 && a > INT_MAX - b) || (b < 0 && a < INT_MIN - b)) return -1;
@ *out = a + b; return 0;                 → gcc -O2
add_chk_c:
        cmp     r1, #0
        ble     .L2
        mvn     r3, #-2147483648
        subs    r3, r3, r1
        cmp     r3, r0
        blt     .L6
.L4:    add     r1, r1, r0
        str     r1, [r2]
        movs    r0, #0
        bx      lr
.L2:    beq     .L4
        rsb     r3, r1, #-2147483648
        cmp     r3, r0
        ble     .L4
.L6:    mov     r0, #-1
        bx      lr` },
                    after: { lang: "asm", src: `@ if (__builtin_add_overflow(a, b, out)) return -1; return 0;
add_chk_b:
        adds    r0, r0, r1       @ 더하면서 V 세팅
        str     r0, [r2]         @ 결과는 항상 저장
        ite     vs               @ V=1 ?
        movvs   r0, #-1
        movvc   r0, #0
        bx      lr` },
                    gain: "16 → 6 명령 · 조건 분기 0",
                    note: "넘침 판정을 하드웨어 V 플래그에 맡김 · 결과를 항상 `*out`에 쓰는 점만 다름"
                },
                {
                    title: "범위 검사 `0 ≤ x < n` → 부호 없는 비교 한 번",
                    before: { lang: "asm", src: `@ return x >= 0 && x < n;             → gcc -O2
in_range:
        mov     r3, r0
        cmp     r0, r1
        ite     lt
        movlt   r0, #1
        movge   r0, #0
        cmp     r3, #0
        it      lt
        movlt   r0, #0
        bx      lr` },
                    after: { lang: "asm", src: `@ return (unsigned)x < (unsigned)n;   음수 x 는 아주 큰 수가 됨
in_range_u:
        cmp     r0, r1
        ite     cs               @ cs (= hs): x ≥ n
        movcs   r0, #0
        movcc   r0, #1
        bx      lr` },
                    gain: "비교 2 → 1",
                    note: "n ≥ 0일 때만 같은 뜻 · 상수 범위는 GCC가 스스로 바꿈 (`x >= 0 && x < 10` → `cmp r0, #9` + `hi`)"
                }
            ],
            glossary: [
                { term: "자리올림", en: "Carry (unsigned overflow)", def: "부호 없는 덧셈이 32bit를 넘음 · C=1 · `adc`가 다음 워드로 넘김" },
                { term: "부호 있는 넘침", en: "Signed overflow", def: "같은 부호 둘을 더했는데 결과 부호가 바뀜 · V=1 · `bvs`로 검사" },
                { term: "다중 정밀도 연산", en: "Multi-precision arithmetic", def: "레지스터보다 긴 정수를 워드로 나눠 `adds`/`adc` 사슬로 계산" },
                { term: "CMN / TST", en: "Compare Negative / Test", def: "`cmn a, b` = a + b의 플래그, `tst a, b` = a & b의 플래그 · 결과는 버림" },
                { term: "APSR", en: "Application Program Status Register", def: "xPSR 중 N Z C V Q (와 DSP의 GE) 플래그 부분 · `mrs r0, apsr`로 읽음" }
            ],
            quiz: [
                { q: "`cmp r0, r1`이 실제로 하는 일은?", options: ["r0 ← r0 − r1, 플래그 갱신", "r0 − r1의 플래그만 남김", "r1 − r0의 플래그만 남김", "같으면 Z=1, 나머지 그대로"], a: 1, why: "결과 레지스터 없는 `subs r0, r1` · NZCV 네 개 모두 갱신 · r0은 그대로" },
                { q: "r0 = 0xFFFFFFFF, r1 = 1에서 `cmp r0, r1` 후 참인 조건은?", options: ["`hi`와 `lt`", "`lo`와 `gt`", "`hi`와 `gt`", "`eq`"], a: 0, why: "부호 없음 4294967295 > 1 → hi · 부호 있음 −1 < 1 → lt · 같은 비트, 다른 해석" },
                { q: "`adds r0, r0, r2` 다음 `adc r1, r1, r3`이 추가로 더하는 값은?", options: ["V (부호 있는 넘침)", "C (하위 자리올림)", "N (하위 결과 부호)", "Z (하위가 0인지)"], a: 1, why: "하위 워드에서 넘친 1을 상위로 · V는 부호 있는 해석용이라 사슬에 안 씀" },
                { q: "Arm에서 `cmp`로 3 − 5를 계산한 뒤 C 플래그는?", options: ["1", "0", "변하지 않음", "V와 같음"], a: 1, why: "Arm의 뺄셈 C = 빌림 없음 · 빌림이 생겼으니 0 · x86 CF였다면 1" },
                { q: "`mov r0, r1` (s 없음) 이후 플래그는?", options: ["모두 0", "N, Z 갱신", "변하지 않음", "C만 갱신"], a: 2, why: "`s` 접미사가 없으면 플래그 그대로 · N·Z를 바꾸는 건 `movs`" },
                { type: "text", q: "실행 후 NZCV는? (예: 0110)", code: { lang: "asm", src: "ldr  r0, =0x7FFFFFFF\nadds r0, r0, #1" }, answer: ["1001", "N=1 Z=0 C=0 V=1", "N1Z0C0V1"], why: "결과 0x80000000: N=1 · 부호 없는 자리올림 없음 C=0 · 양수 + 양수 = 음수 V=1" },
                { type: "text", q: "실행 후 `r1`은?", code: { lang: "asm", src: "    mov  r0, #-1\n    cmp  r0, #5\n    bhs  big        @ 부호 없는 ≥\n    movs r1, #1\n    b    done\nbig:\n    movs r1, #2\ndone:" }, answer: ["2"], why: "−1 = 0xFFFFFFFF는 부호 없이 5보다 큼 → C=1 → `bhs` 분기 · `bge`였다면 1" },
                { type: "num", q: "a = 0x7FFFFFF0일 때 `adds r0, a, b`가 V=1이 되는 가장 작은 양수 b는?", answer: 16, why: "0x7FFFFFF0 + 16 = 0x80000000 · INT_MAX(0x7FFFFFFF)를 넘는 순간 부호가 뒤집힘" },
                { type: "order", q: "128bit 덧셈 a + b를 32bit 워드로 할 때 명령 순서", items: ["`adds` 워드 0 (최하위)", "`adcs` 워드 1", "`adcs` 워드 2", "`adc` 워드 3 (최상위)"], why: "자리올림은 아래에서 위로 · 중간은 C를 넘겨야 해서 `adcs`, 마지막만 `s` 없이" }
            ],
            refs: [
                { title: "Armv7-M Architecture Reference Manual (DDI 0403E.e)", by: "Arm", year: 2021, url: "https://documentation-service.arm.com/static/606dc36485368c4c2b1bf62f", kind: "spec" },
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" },
                { title: "Compiler Explorer", by: "M. Godbolt", url: "https://godbolt.org/", kind: "doc" }
            ]
        },
        {
            id: "asm-memory",
            title: "로드·스토어와 주소 지정",
            level: 2,
            mins: 14,
            pre: ["assembly/asm-basics", "memory/mem-align"],
            checked: "2026-11-16",
            key: [
                "로드 `ldr` `ldrb` `ldrh` `ldrsb`, 스토어 `str` `strb` `strh` · 크기와 부호만 다름",
                "**주소 지정 방식**(addressing mode): `[r1, #4]` `[r1, r2, lsl #2]` `[r1, #4]!` `[r1], #4`",
                "큰 상수·전역 주소는 **리터럴 풀**(literal pool)에서: `ldr r0, =x`",
                "**리틀 엔디언**(little-endian): `0x11223344`를 쓰면 가장 낮은 주소에 `0x44`"
            ],
            concepts: [
                { term: "주소 지정 방식", en: "Addressing mode", def: "오프셋 `[rn, #imm]` · 레지스터 `[rn, rm, lsl #n]` (n ≤ 3) · pre `[rn, #imm]!` · post `[rn], #imm`" },
                { term: "리터럴 풀", en: "Literal pool", def: "코드 옆 상수 영역 · `ldr r0, =x` → PC 기준 `ldr` · `mov`/`mvn`으로 되는 상수면 어셈블러가 그 명령으로 바꿈" },
                { term: "리틀 엔디언", en: "Little-endian", def: "낮은 주소에 하위 바이트 · `0x11223344` → `44 33 22 11` · Cortex-M은 보통 리틀 엔디언" },
                { term: "정렬된 접근", en: "Aligned access", def: "크기의 배수 주소 · Armv7-M `ldr`/`ldrh`는 비정렬도 허용(느림), `ldrd`/`ldm`은 폴트 · Armv6-M은 모두 폴트" }
            ],
            demo: {
                type: "sim", name: "cpu",
                title: "배열 순회 · 주소 지정 · 엔디언",
                intro: "▶ 메모리 패널에서 `arr`·`v`·`neg` 바이트 배치 확인 (16진 보기 추천) · `!`와 post-index 때 `r1` 변화",
                code: `.data
arr:  .word 10, 20, 30, 40      @ int arr[4] · 원소마다 4바이트
v:    .word 0x11223344
neg:  .byte 0xFB                @ int8_t −5
.text
    ldr   r1, =arr              @ r1 = &arr[0] · 리터럴 풀에서 주소 로드
    movs  r2, #0                @ i = 0
    movs  r0, #0                @ sum = 0
loop:
    ldr   r3, [r1, r2, lsl #2]  @ arr[i] · 주소 = r1 + i×4
    adds  r0, r0, r3            @ sum += arr[i]
    adds  r2, r2, #1            @ i++
    cmp   r2, #4
    blt   loop                  @ i < 4 이면 반복 → sum = 100
    ldr   r4, [r1, #8]!         @ pre-index: r1 += 8 먼저 → arr[2] = 30
    ldr   r5, [r1], #4          @ post-index: arr[2] 읽고 r1 += 4
    ldr   r6, =v
    ldrb  r7, [r6]              @ 가장 낮은 주소 = 하위 바이트 0x44
    ldrh  r8, [r6, #2]          @ 위쪽 하프워드 0x1122
    ldr   r9, =neg
    ldrb  r10, [r9]             @ 0 확장 → 251
    ldrsb r11, [r9]             @ 부호 확장 → −5
    bx    lr`,
                expect: { r0: 100, r1: 0x2000000c, r4: 30, r5: 30, r7: 0x44, r8: 0x1122, r10: 251, r11: -5 }
            },
            code: [
                {
                    lang: "asm",
                    title: "GCC -O2 · 배열, 바이트, 구조체",
                    src: `@ int get(const int *a, int i)  { return a[i]; }
get:    ldr     r0, [r0, r1, lsl #2]   @ a + i*4 를 한 명령에
        bx      lr
@ int sb(const int8_t *p)       { return p[3]; }
sb:     ldrsb   r0, [r0, #3]           @ 부호 확장
        bx      lr
@ unsigned ub(const uint8_t *p) { return p[3]; }
ub:     ldrb    r0, [r0, #3]           @ 위쪽 24bit = 0
        bx      lr
@ struct pkt { uint8_t type; uint16_t len; uint32_t crc; };
@ uint32_t crc_of(const struct pkt *p) { return p->crc + p->len; }
crc_of: ldrh    r2, [r0, #2]           @ len: 오프셋 2 (type 뒤 1바이트 패딩)
        ldr     r0, [r0, #4]           @ crc: 오프셋 4
        add     r0, r0, r2
        bx      lr`,
                    note: "`int8_t` → `ldrsb`, `uint8_t` → `ldrb`(**0 확장**(zero extension)) · `len`이 오프셋 2인 건 **정렬된 접근**(aligned access)을 위한 패딩"
                },
                {
                    lang: "asm",
                    title: "전역 변수 쓰기 · 리터럴 풀 (요약)",
                    src: `@ int g;  void set_g(int v) { g = v; }      → gcc -O2
set_g:
        ldr     r3, .L4          @ 아래 .word 에서 g 의 주소를 읽음
        str     r0, [r3]         @ g = v
        bx      lr
.L4:
        .word   g                @ 리터럴 풀: 코드 바로 뒤의 상수
@ 손으로 쓸 땐  ldr r3, =g  → 어셈블러가 풀을 만들어 줌 (.ltorg 로 위치 지정)`,
                    note: "`ldr r3, .L4`는 **PC 상대 주소**(PC-relative addressing) 로드 · 전역 하나 쓰는 데 메모리 접근 2번"
                }
            ],
            optimize: [
                {
                    title: "인덱스 대신 포인터 증가: 주소 갱신을 pre-index에 접기",
                    before: { lang: "asm", src: `@ for (i = 0; i < 4; i++) d[i] = s[i];
loop:
        ldr     r3, [r1, r2, lsl #2]
        str     r3, [r0, r2, lsl #2]
        adds    r2, r2, #1       @ i++ 가 따로
        cmp     r2, #4
        bne     loop` },
                    after: { lang: "asm", src: `@ GCC 15.2 -O2 copy4: 두 포인터를 미리 −4, 끝 = s + 12
        subs    r3, r1, #4
        subs    r0, r0, #4
        adds    r1, r1, #12      @ 마지막 원소 주소
.L10:
        ldr     r2, [r3, #4]!    @ *++s
        str     r2, [r0, #4]!    @ *++d
        cmp     r3, r1
        bne     .L10` },
                    gain: "반복당 5 → 4 명령",
                    note: "베이스 갱신(writeback)이 load/store 안에서 일어남 · GCC -O2는 인덱스 `i`를 없애고 pre-index 포인터 루프로 바꿈"
                },
                {
                    title: "리터럴 풀 로드 → `movw`/`movt` (`-mslow-flash-data`)",
                    before: { lang: "asm", src: `@ *(volatile uint32_t *)0x40020018 = 1u << 5;   (기본)
led_on:
        ldr     r3, .L3          @ Flash 에서 데이터 읽기
        movs    r2, #32
        str     r2, [r3, #24]
        bx      lr
.L3:    .word   0x40020000` },
                    after: { lang: "asm", src: `@ 같은 코드, -mslow-flash-data
led_on:
        movs    r3, #0
        movt    r3, #0x4002      @ 상수를 명령 안에
        movs    r2, #32
        str     r2, [r3, #24]
        bx      lr` },
                    gain: "데이터 읽기 1 → 0",
                    note: "Flash 데이터 읽기가 명령 가져오기보다 느린 칩용 옵션 · Armv7-M만, 기본은 꺼짐"
                }
            ],
            glossary: [
                { term: "Pre-index", en: "Pre-indexed addressing", def: "`[rn, #4]!` · 오프셋을 먼저 더한 주소로 접근하고 그 주소를 `rn`에 되씀" },
                { term: "Post-index", en: "Post-indexed addressing", def: "`[rn], #4` · `rn` 주소로 접근한 뒤 `rn += 4` · 배열 순회에 적합" },
                { term: "0 확장", en: "Zero extension", def: "`ldrb`/`ldrh`가 위쪽 비트를 0으로 채움 · 부호 없는 `uint8_t`용" },
                { term: "하프워드", en: "Halfword", def: "Arm에서 16bit · word 32bit, byte 8bit · x86의 WORD(16bit)와 이름이 어긋남" },
                { term: "비정렬 접근", en: "Unaligned access", def: "크기의 배수가 아닌 주소 · 버스 접근이 쪼개져 느림 · `CCR.UNALIGN_TRP`로 폴트로 바꿀 수 있음" },
                { term: "PC 상대 주소", en: "PC-relative addressing", def: "현재 명령 위치 기준 오프셋 · 리터럴 풀·`adr`·분기가 사용 → 위치 독립 코드" }
            ],
            quiz: [
                { q: "`ldr r3, [r1, r2, lsl #2]`의 주소는?", options: ["r1 + r2", "r1 + r2×4", "(r1 + r2) × 4", "r1×4 + r2"], a: 1, why: "인덱스 레지스터만 시프트 · `int` 배열 `a[i]` = 베이스 + i×4" },
                { q: "`ldr r5, [r1], #4`가 읽는 주소와 이후 r1은?", options: ["r1에서 읽고 r1 += 4", "r1+4에서 읽고 r1 += 4", "r1+4에서 읽고 r1 그대로", "r1에서 읽고 r1 그대로"], a: 0, why: "post-index: 원래 r1로 읽은 뒤 갱신 · 'r1+4에서 읽고 갱신'은 pre-index `[r1, #4]!`" },
                { q: "메모리 `78 56 34 12` (낮은 주소부터)에서 `ldrh`로 처음 2바이트를 읽으면?", options: ["0x7856", "0x5678", "0x1234", "0x3412"], a: 1, why: "리틀 엔디언: 낮은 주소 바이트(0x78)가 하위 → 0x5678" },
                { q: "`int8_t` 값 0xFB를 `ldrb`로 읽으면?", options: ["−5", "251", "0xFFFFFFFB", "폴트"], a: 1, why: "`ldrb`는 0 확장 → 251 · −5를 얻으려면 `ldrsb`" },
                { q: "Cortex-M4에서 4의 배수가 아닌 주소에 `ldrd`를 하면?", options: ["느리지만 동작 (버스 2회)", "UsageFault (UNALIGNED)", "하위 2bit 무시하고 읽음", "`ldr` 두 번으로 자동 분할"], a: 1, why: "`ldrd`·`ldm`·`ldrex`는 항상 정렬 폴트 · 비정렬 허용은 `ldr`/`ldrh`/`str`/`strh` 같은 단일 접근만" },
                { type: "text", q: "실행 후 `r0`은? (16진수)", code: { lang: "asm", src: ".data\nv:  .word 0x11223344\n.text\n    ldr  r1, =v\n    movs r2, #0xAA\n    strb r2, [r1, #1]\n    ldr  r0, [r1]" }, answer: ["0x1122AA44", "287484484"], why: "v+1은 두 번째로 낮은 바이트 0x33 자리 · 리틀 엔디언이라 0x11223344 → 0x1122AA44" },
                { type: "text", q: "실행 후 `r0`은?", code: { lang: "asm", src: ".data\nh:  .hword 0x8001\n.text\n    ldr   r1, =h\n    ldrsh r0, [r1]" }, answer: ["-32767", "0xFFFF8001", "4294934529"], why: "bit15 = 1이라 위쪽 16bit를 1로 채움 · `ldrh`였다면 0x8001 = 32769" },
                { type: "num", q: "16bit 인코딩 `ldr r0, [r1, #imm]`이 담을 수 있는 가장 큰 오프셋은? (바이트)", answer: 124, why: "imm5 × 4 = 0–124 · 더 멀면 32bit `ldr.w` (0–4095)" },
                { type: "order", q: "`str`로 `0x11223344`를 0x20000000에 쓴 뒤, 낮은 주소부터 바이트 순서", items: ["0x44", "0x33", "0x22", "0x11"], why: "리틀 엔디언: 하위 바이트가 가장 낮은 주소" }
            ],
            refs: [
                { title: "Armv7-M Architecture Reference Manual (DDI 0403E.e)", by: "Arm", year: 2021, url: "https://documentation-service.arm.com/static/606dc36485368c4c2b1bf62f", kind: "spec" },
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" },
                { title: "ARM Opcodes (Using as)", by: "GNU Binutils", url: "https://sourceware.org/binutils/docs/as/ARM-Opcodes.html", kind: "doc" },
                { title: "ARM Options (Using the GNU Compiler Collection)", by: "GNU Project", url: "https://gcc.gnu.org/onlinedocs/gcc/ARM-Options.html", kind: "doc" }
            ]
        },
        {
            id: "asm-branch",
            title: "분기와 반복",
            level: 2,
            mins: 14,
            pre: ["assembly/asm-flags"],
            checked: "2026-11-16",
            key: [
                "**조건 분기**(conditional branch) `b<cond>`는 플래그를 보고 `pc`를 바꿈 · 거짓이면 다음 줄",
                "`if` → 조건을 **뒤집어** 건너뜀 · 루프는 **루프 회전**(loop rotation)으로 아래에서 검사",
                "0까지 세면 `subs` + `bne` · `cbz`/`cbnz`는 플래그 없이 0 검사",
                "짧은 `if`는 **IT 블록**(If-Then block)이나 **무분기 코드**(branchless code)로 분기 제거"
            ],
            concepts: [
                { term: "조건 분기", en: "Conditional branch", def: "`beq`, `blt`… 조건이 참일 때만 `pc` 변경 · Cortex-M4 범위 ±1 MB, `b`/`bl`은 ±16 MB" },
                { term: "루프 회전", en: "Loop rotation (loop inversion)", def: "검사를 루프 아래로 옮기고 앞에 가드 한 번 · 반복마다 분기 1개" },
                { term: "CBZ / CBNZ", en: "Compare and Branch on Zero / Non-Zero", def: "레지스터가 0인지 보고 **앞쪽**으로만 분기 · `r0`–`r7`, 4–130바이트 · 플래그 안 바꿈 · IT 안에서 금지" },
                { term: "IT 블록", en: "If-Then block", def: "`it`/`ite`/`itte`… 뒤 최대 4개 명령을 조건부로 실행 · 분기 없이 if/else" }
            ],
            demo: {
                type: "sim", name: "cpu",
                title: "카운트다운 루프 + if/else",
                intro: "▶ `subs` 뒤 Z가 1이 되는 순간 `bne`가 빠져나옴 · 루프는 5번",
                code: `@ for (i = n; i != 0; i--) sum += i;     (n = 5)
    movs r1, #5              @ i = n
    movs r0, #0              @ sum = 0
    cbz  r1, done            @ 가드: n == 0 이면 루프를 건너뜀 · 플래그 안 씀
loop:
    adds r0, r0, r1          @ sum += i
    subs r1, r1, #1          @ i−− 이면서 Z 플래그 갱신
    bne  loop                @ i ≠ 0 이면 위로 · cmp 필요 없음
done:
@ if (sum > 10) r2 = sum − 10; else r2 = 0;
    cmp  r0, #10
    ble  else_part           @ 조건을 뒤집어 else 로 건너뜀
    subs r2, r0, #10         @ then 블록
    b    end_if              @ else 블록을 건너뜀
else_part:
    movs r2, #0              @ else 블록
end_if:
    bx   lr`,
                expect: { r0: 15, r1: 0, r2: 5 }
            },
            code: [
                {
                    lang: "asm",
                    title: "GCC -O2 · max()와 clamp()",
                    src: `@ int max(int a, int b) { return a > b ? a : b; }
max:
        cmp     r0, r1
        it      lt               @ 다음 1개 명령은 lt 일 때만
        movlt   r0, r1           @ a < b 면 r0 = b
        bx      lr
@ int clamp(int x) { if (x < 0) x = 0; return x; }
clamp:
        bic     r0, r0, r0, asr #31   @ x<0: x & ~0xFFFFFFFF = 0 · x≥0: x & ~0 = x
        bx      lr`,
                    note: "`it` 뒤 `t`/`e`를 붙여 최대 4개 (`ite` = then 1개 + else 1개) · 시뮬레이터는 IT 미지원"
                },
                {
                    lang: "asm",
                    title: "C 반복문이 컴파일되는 모양",
                    src: `@ for (i = 0; i < n; i++) body;   /   while (i < n) body;
        cmp     r2, r1           @ 가드: 한 번도 안 도는 경우만 처음에 검사
        bge     done
loop:
        @ ... body ...
        adds    r2, r2, #1       @ i++
        cmp     r2, r1
        blt     loop             @ 검사는 아래에서 · 반복당 분기 1개
done:
@ do { body } while (i < n);  → 가드 없이 loop: 부터
@ switch 가 촘촘하면 → tbb/tbh 표에서 오프셋을 읽어 한 번에 분기`,
                    note: "`switch`는 **점프 테이블**(jump table) `tbb`/`tbh`로 · Armv8.1-M(Cortex-M55 등)의 **저오버헤드 루프**(low-overhead loop) `dls`/`le`는 루프 끝 분기 비용을 줄임"
                }
            ],
            optimize: [
                {
                    title: "위에서 검사하는 루프 → 아래에서 검사 + 0까지 카운트다운",
                    before: { lang: "asm", src: `@ sum += a[i], i = 0 .. n-1
        movs    r2, #0           @ i = 0
top:
        cmp     r2, r1           @ i < n ?
        bge     done
        ldr     r3, [r0, r2, lsl #2]
        adds    r4, r4, r3
        adds    r2, r2, #1
        b       top              @ 매번 위로 무조건 분기
done:` },
                    after: { lang: "asm", src: `        cbz     r1, done         @ n == 0 이면 건너뜀 (한 번만)
loop:
        ldr     r3, [r0], #4     @ *a++
        adds    r4, r4, r3
        subs    r1, r1, #1       @ n-- 가 Z 도 세팅
        bne     loop             @ 아래에서 검사
done:` },
                    gain: "반복당 6 → 4 명령",
                    note: "`b top`과 `cmp`가 빠짐 · n이 개수(≥ 0)일 때 · GCC -O2도 `while (n--)`를 `cbz` + post-index 루프로 만듦"
                },
                {
                    title: "짧은 if → 무분기 `bic`",
                    before: { lang: "asm", src: `        cmp     r0, #0
        bge     keep             @ 음수일 때만 0 으로
        movs    r0, #0
keep:
        bx      lr` },
                    after: { lang: "asm", src: `        bic     r0, r0, r0, asr #31   @ GCC -O2 의 clamp · 분기 0개
        bx      lr` },
                    gain: "분기 1 → 0",
                    note: "분기를 타면 **파이프라인 재충전**(pipeline refill)이 생김 · 무분기 쪽은 입력과 무관하게 같은 명령 수"
                }
            ],
            glossary: [
                { term: "파이프라인 재충전", en: "Pipeline refill", def: "분기가 일어나면 미리 가져온 다음 명령을 버리고 새 주소에서 다시 가져옴" },
                { term: "무분기 코드", en: "Branchless code", def: "플래그·마스크·조건 실행으로 분기를 없앤 코드 · 실행 시간이 입력과 무관" },
                { term: "저오버헤드 루프", en: "Low-overhead loop", def: "Armv8.1-M `dls lr, rn` / `le lr, label` · 반복 횟수를 `lr`에 두고 루프 분기를 가볍게" },
                { term: "점프 테이블", en: "Jump table", def: "`switch` 값으로 표를 인덱싱해 한 번에 분기 · Thumb-2 `tbb`(바이트)/`tbh`(하프워드)" },
                { term: "조건 실행", en: "Conditional execution", def: "조건이 참일 때만 효과를 내는 명령 · Thumb-2는 IT 블록 안에서만, A32는 거의 모든 명령" }
            ],
            quiz: [
                { q: "`if (x == 5) y = 1;`을 분기로 만들면 보통?", options: ["`cmp` + `beq`로 then에 점프", "`cmp` + `bne`로 then을 건너뜀", "`cbz`로 x == 5를 검사", "`cmp` + `bgt`로 then을 건너뜀"], a: 1, why: "조건을 뒤집어 '아니면 건너뛰기' · then 블록이 바로 아래라 `beq`로 가면 else 쪽 분기가 하나 더 필요" },
                { q: "`subs r1, r1, #1` 뒤 `bne loop`에 `cmp`가 필요 없는 이유?", options: ["`bne`가 r1을 직접 읽어서", "`subs` 결과가 Z를 세팅해서", "`bne`는 C 플래그만 봐서", "`cmp`는 IT 블록에서만 필요"], a: 1, why: "결과가 0이면 Z=1 → `bne`가 빠져나옴 · 레지스터를 직접 보는 건 `cbz`/`cbnz`" },
                { q: "`cbz`에 대해 틀린 것은?", options: ["플래그를 바꾸지 않음", "앞쪽으로만 분기", "r0–r12 모두 사용 가능", "IT 블록 안에선 못 씀"], a: 2, why: "레지스터는 r0–r7만 · 거리도 앞쪽 4–130바이트" },
                { q: "`ite gt` 다음 두 명령의 조건은?", options: ["gt, gt", "gt, le", "le, gt", "무조건, gt"], a: 1, why: "t = then (gt), e = else → 반대 조건 le" },
                { q: "for 루프를 '아래에서 검사' 모양으로 바꾸면 줄어드는 것은?", options: ["반복마다 무조건 분기 1개", "반복마다 메모리 접근 1번", "루프 앞 가드 검사 1번", "루프에 쓰는 레지스터 1개"], a: 0, why: "검사+분기가 루프 끝 하나로 · 가드는 오히려 처음에 한 번 추가됨" },
                { type: "text", q: "실행 후 `r0`은? (반복 횟수)", code: { lang: "asm", src: "    movs r0, #0\n    movs r1, #3\nloop:\n    adds r0, r0, #1\n    subs r1, r1, #1\n    bpl  loop       @ N=0 이면 반복" }, answer: ["4"], why: "r1 = 2, 1, 0에서 N=0 → 반복 · −1이 돼야 N=1 · 0도 '양수 쪽'이라 3이 아니라 4번" },
                { type: "text", q: "r0 = −9일 때 실행 후 `r0`은?", code: { lang: "asm", src: "    mov  r0, #-9\n    bic  r0, r0, r0, asr #31" }, answer: ["0"], why: "asr #31 = 0xFFFFFFFF (음수) → x & ~mask = 0 · 분기 없는 `if (x < 0) x = 0`" },
                { type: "num", q: "16bit `b<cond>`가 앞쪽으로 갈 수 있는 최대 거리는? (바이트)", answer: 254, why: "imm8 × 2 → −256 – +254 · 더 멀면 32bit `b<cond>.w` (±1 MB)" },
                { type: "order", q: "`for (i = 0; i < n; i++) body;`의 -O2 모양 (루프 회전) 순서", items: ["가드: `cmp` + `bge done`", "body", "`adds`로 i++", "`cmp` + `blt loop`"], why: "한 번도 안 도는 경우만 가드가 거르고, 검사는 루프 아래에서 · 반복당 분기 1개" }
            ],
            refs: [
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" },
                { title: "Armv7-M Architecture Reference Manual (DDI 0403E.e)", by: "Arm", year: 2021, url: "https://documentation-service.arm.com/static/606dc36485368c4c2b1bf62f", kind: "spec" },
                { title: "Introduction to Helium guide (102102, Version 1.3)", by: "Arm", year: 2024, url: "https://documentation-service.arm.com/static/65969ed3159ca73387227541", kind: "doc" }
            ]
        },
        {
            id: "asm-call",
            title: "함수 호출과 스택 (AAPCS)",
            level: 2,
            mins: 16,
            pre: ["assembly/asm-memory", "memory/mem-layout"],
            checked: "2026-11-16",
            key: [
                "`bl f`: `lr` ← 돌아올 주소, `pc` ← `f` · 복귀는 `bx lr` 또는 `pop {…, pc}`",
                "인자 `r0`–`r3`, 5번째부터 스택 · 반환 `r0` (64bit는 `r0`+`r1`)",
                "`r4`–`r11`은 callee-saved: 쓰려면 `push` 했다가 `pop`",
                "**리프 함수**(leaf function)는 스택 없이 끝 · 아니면 `lr` 저장 + **스택 정렬**(stack alignment) 8바이트"
            ],
            concepts: [
                { term: "AAPCS", en: "Procedure Call Standard for the Arm Architecture", def: "인자·반환·보존 레지스터·스택 규칙 · 다른 컴파일러가 만든 코드끼리 호출 가능하게" },
                { term: "Caller-saved / Callee-saved", en: "Caller-saved / Callee-saved registers", def: "`r0`–`r3`, `r12`는 호출하면 깨질 수 있음 / `r4`–`r8`, `r10`, `r11`은 부른 함수가 복원 · `r9`는 플랫폼 정의" },
                { term: "리프 함수", en: "Leaf function", def: "다른 함수를 부르지 않음 → `lr`을 그대로 두고 스택을 안 쓸 수 있음" },
                { term: "스택 프레임", en: "Stack frame", def: "함수 하나가 쓰는 스택 구간 · 저장한 레지스터 + 지역 변수 + 넘치는 인자" }
            ],
            demo: {
                type: "sim", name: "cpu",
                title: "non-leaf 호출 · 스택 보기",
                intro: "▶ `bl` 때 `lr`, `push`/`pop` 때 `sp`와 메모리 패널의 스택을 보기 · 끝나면 `sp`가 처음 값으로",
                code: `@ int sq(int x)            { return x * x; }
@ int sum_sq(int a, int b) { return sq(a) + sq(b); }
    push {r4, lr}            @ 이 코드도 bl 을 쓰니 lr 저장 · 8바이트
    movs r0, #3              @ 인자 a → r0
    movs r1, #4              @ 인자 b → r1
    bl   sum_sq              @ lr ← 돌아올 주소, pc ← sum_sq
    pop  {r4, pc}            @ r0 = 25 · 저장한 lr 을 pc 로 → 종료
sum_sq:                      @ ↓ GCC -O1 출력 그대로
    push {r3, r4, r5, lr}    @ 16바이트 · r3 는 8바이트 정렬용 빈자리
    mov  r5, r1              @ b 는 호출 뒤에도 필요 → callee-saved r5
    bl   sq                  @ r0 = sq(a) · r1–r3 은 깨져도 됨
    mov  r4, r0              @ sq(a) 를 r4 에 보관
    mov  r0, r5
    bl   sq                  @ r0 = sq(b)
    add  r4, r4, r0
    mov  r0, r4              @ 반환값 r0 = 9 + 16
    pop  {r3, r4, r5, pc}    @ 복원 + 복귀를 한 명령으로
sq:                          @ 리프 함수: 스택도 lr 저장도 없음
    mul  r0, r0, r0
    bx   lr`,
                expect: { r0: 25, r4: 0, r5: 0, sp: 0x20001000 }
            },
            code: [
                {
                    lang: "c",
                    title: "인자 → 레지스터 (AAPCS, 정수·포인터)",
                    src: `int f(int a, int b, int c, int d, int e);
//      r0     r1     r2     r3     [sp]      5번째부터 스택

int64_t g(int a, int64_t b);
//        r0     r2:r3            64bit 는 짝수 번호부터 (r1 건너뜀)

int64_t h(void);                // 반환 r0(하위) : r1(상위)

struct big { int v[8]; };
struct big k(void);             // 호출자가 메모리를 주고 그 주소를 r0 로`,
                    note: "AAPCS의 정수 규칙 · FPU를 쓰는 hard-float ABI면 `float`/`double`은 `s0`–`s15`/`d0`–`d7`로"
                },
                {
                    lang: "asm",
                    title: "GCC -O2 · 5번째 인자 / 스택에 보관",
                    src: `@ int f5(int a, int b, int c, int d, int e) { return a + b + c + d + e; }
f5:
        add     r0, r0, r1
        add     r0, r0, r2
        ldr     r1, [sp]         @ e: 호출 직전 sp 가 가리키던 곳
        add     r0, r0, r3
        add     r0, r0, r1
        bx      lr
@ sum_sq 의 -O2 판: b 를 callee-saved 대신 스택 슬롯에
sum_sq:
        push    {r4, lr}
        sub     sp, sp, #8       @ 지역 공간 · 8바이트 정렬 유지
        str     r1, [sp, #4]     @ b 보관
        bl      sq
        mov     r4, r0
        ldr     r0, [sp, #4]     @ b 꺼냄
        bl      sq
        adds    r0, r4, r0
        add     sp, sp, #8
        pop     {r4, pc}`,
                    note: "앞의 `push`·`sub sp`와 뒤의 `add sp`·`pop`이 **프롤로그 / 에필로그**(prologue / epilogue) · 그 사이 스택 구간이 **스택 프레임**(stack frame)"
                }
            ],
            optimize: [
                {
                    title: "작은 함수는 **인라인 확장**(inline expansion): `bl`과 스택 제거",
                    before: { lang: "asm", src: `@ sq 가 다른 파일 (extern) → 호출해야 함, -O1
sum_sq:
        push    {r3, r4, r5, lr}
        mov     r5, r1
        bl      sq               @ sq: mul r0, r0, r0 / bx lr
        mov     r4, r0
        mov     r0, r5
        bl      sq
        add     r4, r4, r0
        mov     r0, r4
        pop     {r3, r4, r5, pc}` },
                    after: { lang: "asm", src: `@ static inline int sq(int x) { return x * x; }   -O2
sum_sq_inl:
        mul     r1, r1, r1
        mla     r0, r0, r0, r1   @ r0 = a*a + r1
        bx      lr` },
                    gain: "실행 13 → 3 명령 · 스택 0 B",
                    note: "같은 파일의 작은 `static` 함수는 -O2가 알아서 인라인 · 많이 부르면 코드 크기는 늘 수 있음"
                },
                {
                    title: "**꼬리 호출**(tail call): `bl` + `pop {pc}` → `b`",
                    before: { lang: "asm", src: `@ int wrap(int x) { return work(x + 1); }     -O1
wrap:
        push    {r3, lr}
        adds    r0, r0, #1
        bl      work
        pop     {r3, pc}` },
                    after: { lang: "asm", src: `@ 같은 코드 -O2
wrap:
        adds    r0, r0, #1
        b       work             @ work 의 bx lr 이 wrap 을 부른 곳으로 바로` },
                    gain: "4 → 2 명령 · 스택 0 B",
                    note: "`-foptimize-sibling-calls` (-O2부터) · 디버거 호출 스택에 `wrap`이 안 보이는 이유"
                }
            ],
            glossary: [
                { term: "꼬리 호출", en: "Tail call", def: "함수의 마지막 동작이 호출이면 `bl` 대신 `b` · 복귀 한 단계와 스택 절약" },
                { term: "프롤로그 / 에필로그", en: "Function prologue / epilogue", def: "함수 앞 레지스터 저장·스택 확보 / 뒤 복원·복귀 코드" },
                { term: "스택 정렬", en: "Stack alignment", def: "AAPCS: 항상 `sp % 4 == 0`, 공개 함수 경계에선 `sp % 8 == 0`" },
                { term: "프레임 포인터", en: "Frame pointer", def: "지역 변수 기준 주소 레지스터 · GCC Thumb `-O0`은 `r7` · 최적화하면 보통 생략" },
                { term: "인라인 확장", en: "Inline expansion", def: "호출 대신 함수 몸통을 그 자리에 복사 · 호출 비용 0, 코드 크기 증가 가능" }
            ],
            quiz: [
                { q: "`int f(int a, int b, int c, int d, int e)`에서 `e`는 어디로?", options: ["`r4`", "진입 시 `[sp]`", "`r12` (ip)", "진입 시 `[sp, #4]`"], a: 1, why: "정수 인자 레지스터는 r0–r3뿐 · 다섯째는 호출 직전 sp가 가리키는 첫 칸" },
                { q: "다른 함수를 부르는 함수가 시작에서 `push {…, lr}` 하는 이유?", options: ["`lr`이 callee-saved라서", "안쪽 `bl`이 `lr`을 덮어써서", "8바이트 정렬을 맞추려고", "예외가 `lr`을 바꿀 수 있어서"], a: 1, why: "저장 안 하면 자기 복귀 주소를 잃음 · 예외는 `lr`을 쌓았다가 복원하므로 무관" },
                { q: "함수가 마음대로 써도 되는 (호출자가 보존을 기대하지 않는) 레지스터는?", options: ["r4–r7, r12", "r0–r3, r12", "r0–r3, r4", "r8–r11, lr"], a: 1, why: "caller-saved = r0–r3, r12 · r4–r11은 쓰려면 저장·복원" },
                { q: "GCC가 `push {r3, r4, r5, lr}`처럼 r3을 같이 넣는 이유?", options: ["r3의 인자 값을 보존하려고", "sp를 8의 배수로 맞추려고", "push는 짝수 개만 가능해서", "r3을 지역 변수로 쓰려고"], a: 1, why: "4개 = 16바이트 · r3은 caller-saved라 보존 의무 없는 빈자리 · push 개수 제한은 없음" },
                { q: "`pop {r4, pc}`가 하는 일은?", options: ["r4 복원 + 복귀", "r4를 pc로 복사", "스택만 정리", "인터럽트 복귀 전용"], a: 0, why: "저장해 둔 lr 값이 pc로 들어가며 복귀 · `bx lr`과 같은 효과" },
                { type: "num", q: "`push {r4, r5, r6, lr}` 다음 `sub sp, sp, #8`이면 스택 프레임은 몇 바이트?", answer: 24, unit: "B", why: "레지스터 4개 × 4 = 16 + 지역 8 = 24 · 8의 배수라 정렬도 맞음" },
                { type: "text", q: "시작 sp = 0x20001000. 실행 후 `r0`은?", code: { lang: "asm", src: "    push {r4, r5, lr}\n    sub  sp, sp, #4\n    mov  r0, sp\n    add  sp, sp, #4\n    pop  {r4, r5, pc}" }, answer: ["0x20000FF0", "536874992"], why: "12 + 4 = 16 바이트 아래 · 홀수 개 push를 `sub #4`로 8의 배수로 맞춤" },
                { type: "text", q: "실행 후 `r0`은?", code: { lang: "asm", src: "    push {r4, lr}\n    movs r4, #5\n    bl   f\n    mov  r0, r4\n    pop  {r4, pc}\nf:\n    movs r4, #9     @ 저장 없이 r4 사용\n    bx   lr" }, answer: ["9"], why: "f가 callee-saved r4를 복원하지 않아 호출자의 5가 깨짐 · AAPCS 위반" },
                { type: "order", q: "non-leaf 함수의 프롤로그 → 에필로그 순서", items: ["`push {r4, lr}`", "`sub sp, sp, #8`", "본체와 `bl`", "`add sp, sp, #8`", "`pop {r4, pc}`"], why: "확보한 역순으로 반납 · 마지막 `pop`이 저장한 lr을 pc로 꺼내 복귀" }
            ],
            refs: [
                { title: "Procedure Call Standard for the Arm Architecture (AAPCS32)", by: "Arm", url: "https://github.com/ARM-software/abi-aa/blob/main/aapcs32/aapcs32.rst", kind: "spec" },
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" },
                { title: "Optimize Options (Using the GNU Compiler Collection)", by: "GNU Project", url: "https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html", kind: "doc" }
            ]
        },
        {
            id: "asm-compiler",
            title: "컴파일러 출력 읽기",
            level: 3,
            mins: 16,
            pre: ["assembly/asm-call", "languages/build"],
            checked: "2026-11-16",
            key: [
                "**최적화 수준**(optimization level) `-O0`은 변수마다 스택에 쓰고 읽음 · 디버깅용",
                "`-O2`는 변수를 레지스터에, 루프를 회전, 인덱스를 포인터로 바꿈",
                "**디스어셈블**(disassembly)은 `objdump -d`, 소스 ↔ 명령 대응은 Compiler Explorer",
                "`volatile`이 없으면 하드웨어 레지스터 읽기도 한 번으로 줄어들 수 있음"
            ],
            concepts: [
                { term: "최적화 수준", en: "Optimization level", def: "`-O0` 디버그 · `-O1`/`-O2` 일반 · `-O3` 공격적 · `-Os`/`-Oz` 크기 우선" },
                { term: "디스어셈블", en: "Disassembly", def: "기계어 → 니모닉 · `arm-none-eabi-objdump -d` · `-S`는 소스 줄을 섞어 보여줌 (`-g` 필요)" },
                { term: "인라인 어셈블리", en: "Inline assembly", def: "`__asm__(\"명령\" : 출력 : 입력 : clobber)` · 제약으로 레지스터 사용을 컴파일러에 알림" },
                { term: "인트린식", en: "Intrinsic function", def: "함수처럼 쓰지만 명령 하나로 · `__builtin_clz` → `clz`, CMSIS `__REV` → `rev`" }
            ],
            demo: {
                type: "sim", name: "cpu",
                title: "gcc 15.2 -O2 · Cortex-M4",
                cTitle: "sum.c",
                c: `int sum(const int *a, int n) {
    int s = 0;
    for (int i = 0; i < n; i++)
        s += a[i];
    return s;
}`,
                intro: "▶ C와 비교: `i`는 사라지고 포인터 `r3`이 끝 주소 `r1`까지 감 · `s`는 처음부터 `r0`",
                code: `.data
arr: .word 5, -2, 7, 1, 9
.text
    push {r4, lr}            @ 테스트용 호출부
    ldr  r0, =arr            @ a
    movs r1, #5              @ n
    bl   sum
    pop  {r4, pc}            @ r0 = 20
sum:                         @ ↓ gcc 15.2 -O2 출력 그대로
    cmp     r1, #0           @ 가드: n <= 0 이면 0 반환
    ble     .L4
    subs    r3, r0, #4       @ p = a − 1칸 (pre-index 를 위해)
    add     r1, r3, r1, lsl #2   @ end = 마지막 원소 주소
    movs    r0, #0           @ s = 0 · 변수 i 는 사라짐
.L3:
    ldr     r2, [r3, #4]!    @ p += 4 → *p
    cmp     r3, r1           @ p == end ? · 플래그 먼저
    add     r0, r0, r2       @ s += *p · s 없는 add 라 플래그 유지
    bne     .L3
    bx      lr
.L4:
    movs    r0, #0
    bx      lr`,
                expect: { r0: 20 }
            },
            code: [
                {
                    lang: "sh",
                    title: "빌드 → 디스어셈블",
                    src: `arm-none-eabi-gcc -O2 -mcpu=cortex-m4 -mthumb -g -c sum.c -o sum.o
arm-none-eabi-objdump -d -S sum.o      # -S: C 소스 줄도 같이
arm-none-eabi-gcc -O2 -mcpu=cortex-m4 -mthumb -S sum.c   # sum.s 로 저장

# 00000000 <sum>:
#    0:  2900        cmp    r1, #0
#    2:  dd09        ble.n  18 <sum+0x18>
#    4:  1f03        subs   r3, r0, #4
#    6:  eb03 0181   add.w  r1, r3, r1, lsl #2
#    a:  2000        movs   r0, #0
#    c:  f853 2f04   ldr.w  r2, [r3, #4]!
#   10:  428b        cmp    r3, r1
#   12:  4410        add    r0, r2
#   14:  d1fa        bne.n  c <sum+0xc>
#   16:  4770        bx     lr
#   18:  2000        movs   r0, #0
#   1a:  4770        bx     lr`,
                    note: "`.n` = 16bit, `.w` = 32bit 인코딩 · 함수 전체 28바이트 · `cmp`를 `add` 앞에 둔 건 **명령 스케줄링**(instruction scheduling)"
                },
                {
                    lang: "c",
                    title: "volatile · 인라인 asm · 인트린식",
                    src: `#define UART_SR (*(volatile uint32_t *)0x40011000u)

void wait_tx(void) {
    while (!(UART_SR & 1u)) { }     // 매 반복 ldr 을 다시 실행
}
// volatile 을 빼면 -O2:  ldr 한 번 → 0 이면 'b .' 무한 루프

static inline uint32_t bswap(uint32_t x) {
    uint32_t r;
    __asm__ ("rev %0, %1" : "=r"(r) : "r"(x));   // 출력 : 입력
    return r;
}
// 같은 결과, 컴파일러가 이해하는 쪽: __builtin_bswap32(x), CMSIS __REV(x)
// Cortex-M4 -O2 에선 셋 다  rev r0, r0`,
                    note: "**인라인 어셈블리**(inline assembly)는 컴파일러에게 블랙박스 · 같은 일을 하는 **인트린식**(intrinsic)이 있으면 최적화에 유리 · `=r`은 **피연산자 제약**(operand constraint)"
                }
            ],
            optimize: [
                {
                    title: "`-O0` → `-O2`: 같은 `sum`의 루프 부분",
                    before: { lang: "asm", src: `@ -O0 : 모든 변수가 r7 기준 스택 슬롯
.L3:
        ldr     r3, [r7, #8]     @ i
        lsls    r3, r3, #2
        ldr     r2, [r7, #4]     @ a
        add     r3, r3, r2
        ldr     r3, [r3]         @ a[i]
        ldr     r2, [r7, #12]    @ s
        add     r3, r3, r2
        str     r3, [r7, #12]    @ s 저장
        ldr     r3, [r7, #8]
        adds    r3, r3, #1
        str     r3, [r7, #8]     @ i 저장
.L2:
        ldr     r2, [r7, #8]
        ldr     r3, [r7]         @ n
        cmp     r2, r3
        blt     .L3` },
                    after: { lang: "asm", src: `@ -O2 : s 는 r0, 포인터 r3, 끝 주소 r1
.L3:
        ldr     r2, [r3, #4]!
        cmp     r3, r1
        add     r0, r0, r2
        bne     .L3` },
                    gain: "반복당 15 → 4 명령 · 메모리 접근 9 → 1",
                    note: "`-O0`은 줄마다 변수를 메모리에서 다시 읽음 · 디버거로 변수 보기는 쉬움 · 성능 측정은 항상 최적화 빌드로"
                },
                {
                    title: "변수 나눗셈 → 상수 나눗셈: **역수 곱셈**(multiplication by reciprocal)",
                    before: { lang: "asm", src: `@ unsigned divv(unsigned x, unsigned d) { return x / d; }
divv:
        udiv    r0, r0, r1       @ 하드웨어 나눗셈
        bx      lr` },
                    after: { lang: "asm", src: `@ unsigned div10(unsigned x) { return x / 10; }
div10:
        ldr     r3, .L4          @ 0xCCCCCCCD ≈ 2^35 / 10
        umull   r3, r0, r3, r0   @ 64bit 곱의 상위 32bit → r0
        lsrs    r0, r0, #3       @ 합쳐서 >> 35
        bx      lr
.L4:    .word   0xCCCCCCCD` },
                    gain: "`udiv` → `umull` + `lsrs`",
                    note: "나누는 수가 컴파일 때 알려지면 GCC가 곱셈으로 바꿈 · Cortex-M0는 `udiv`·`umull`이 없어 둘 다 `__aeabi_uidiv` 호출 · 2ⁿ이면 `lsrs` 하나"
                }
            ],
            glossary: [
                { term: "Compiler Explorer", en: "Compiler Explorer (godbolt.org)", def: "브라우저에서 여러 컴파일러·옵션의 어셈블리를 소스 줄 색으로 대응해 보여줌" },
                { term: "objdump", en: "GNU object file dumper", def: "오브젝트·ELF의 섹션·심볼·디스어셈블 출력 · `-d` 코드, `-h` 섹션, `-t` 심볼" },
                { term: "역수 곱셈", en: "Division by reciprocal multiplication", def: "상수 나눗셈을 `x × ⌈2ⁿ/d⌉ >> n`으로 · 나눗셈 명령 없이 정확한 몫" },
                { term: "피연산자 제약", en: "Operand constraint", def: "인라인 asm의 `\"r\"` 레지스터, `\"=r\"` 출력, `\"i\"` 즉시값, `\"m\"` 메모리" },
                { term: "클로버", en: "Clobber list", def: "인라인 asm이 망가뜨리는 것 · 레지스터 이름, `\"cc\"` 플래그, `\"memory\"` 메모리" },
                { term: "명령 스케줄링", en: "Instruction scheduling", def: "의존성이 허락하는 범위에서 명령 순서를 바꿔 지연을 숨김 · 플래그 수명도 고려" }
            ],
            quiz: [
                { q: "`-O0` 출력에 `ldr`/`str`이 많은 이유?", options: ["변수를 스택 슬롯에 두고 매번 읽고 씀", "Thumb ALU가 메모리를 못 읽어서", "레지스터가 r0–r3 네 개뿐이라서", "디버그 정보 `-g`가 접근을 추가해서"], a: 0, why: "디버거가 언제든 변수를 메모리에서 보게 · ISA는 같으니 `-O2`에선 대부분 레지스터에 남음" },
                { q: "`volatile` 없는 `while (!(SR & 1));`의 -O2 결과는?", options: ["매 반복 `ldr` 하는 루프", "한 번 읽고 0이면 무한 루프", "루프 전체가 사라짐", "`wfi`로 바꿔 대기"], a: 1, why: "컴파일러는 SR이 바뀔 이유를 모름 → 읽기를 루프 밖 한 번으로 · 매번 읽는 건 `volatile` 판" },
                { q: "`x / 10` (unsigned)이 Cortex-M4 -O2에서 된 것은?", options: ["`udiv` 한 명령", "`umull` + `lsrs`", "`bl __aeabi_uidiv`", "`mul` + `asrs`"], a: 1, why: "상수 제수 → 역수 곱셈 + 시프트 · `udiv`는 변수 제수, `__aeabi_uidiv`는 나눗셈 없는 M0" },
                { q: "`objdump`의 `ldr.w`에서 `.w`는?", options: ["워드(4바이트) 로드", "32bit 인코딩 (wide)", "writeback이 있음", "약한(weak) 심볼"], a: 1, why: "`.n` = 16bit narrow, `.w` = 32bit wide · 워드 로드는 `ldr` 자체의 뜻" },
                { q: "인라인 asm clobber에 `\"memory\"`를 넣는 이유?", options: ["asm이 메모리를 바꾼다고 알림", "asm용 스택 공간을 확보", "asm 앞뒤에 `dmb`를 넣으라고", "asm을 지우지 말라고 표시"], a: 0, why: "레지스터에 둔 메모리 값을 asm 앞뒤로 다시 읽고 씀 · 하드웨어 장벽 `dmb`는 안 만들고, 삭제 방지는 `volatile` 몫" },
                { type: "num", q: "`sum`의 `-O0` 루프는 반복당 메모리 접근이 몇 번인가? (`ldr` 7 + `str` 2)", answer: 9, why: "i·a·a[i]·s 읽기, s 쓰기, i 읽기·쓰기, 검사의 i·n 읽기 · `-O2`는 `ldr` 1번" },
                { type: "num", q: "objdump에서 `sum`의 마지막 명령이 오프셋 `0x1a`의 16bit `bx lr`이면 함수는 몇 바이트?", answer: 28, unit: "B", why: "0x1a + 2 = 0x1c = 28" },
                { type: "text", q: "GCC의 `x / 2` (int) 출력. 실행 후 `r0`은?", code: { lang: "asm", src: "    mov  r0, #-7\n    add  r0, r0, r0, lsr #31\n    asrs r0, r0, #1" }, answer: ["-3", "0xFFFFFFFD", "4294967293"], why: "음수면 1을 더해 0 쪽으로 버림: (−7 + 1) >> 1 = −3 · `asrs`만 쓰면 −4" },
                { type: "order", q: "`gcc -O2 main.c -o fw.elf` 안에서 일어나는 단계 순서", items: ["전처리 (`#include`, 매크로)", "컴파일 (C → `.s`)", "어셈블 (`.s` → `.o`)", "링크 (`.o` → `.elf`)"], why: "`-E`는 전처리까지, `-S`는 `.s`까지, `-c`는 `.o`까지 멈춤" }
            ],
            refs: [
                { title: "Compiler Explorer", by: "M. Godbolt", url: "https://godbolt.org/", kind: "doc" },
                { title: "Optimize Options (Using the GNU Compiler Collection)", by: "GNU Project", url: "https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html", kind: "doc" },
                { title: "Extended Asm (Using the GNU Compiler Collection)", by: "GNU Project", url: "https://gcc.gnu.org/onlinedocs/gcc/Extended-Asm.html", kind: "doc" },
                { title: "objdump (GNU Binary Utilities)", by: "GNU Binutils", url: "https://sourceware.org/binutils/docs/binutils/objdump.html", kind: "doc" }
            ]
        },
        {
            id: "asm-exception",
            title: "예외 진입과 컨텍스트 저장",
            level: 3,
            mins: 16,
            pre: ["assembly/asm-call", "embedded/irq"],
            checked: "2026-11-16",
            key: [
                "예외 진입(exception entry): 하드웨어가 8워드 저장 `r0`–`r3` `r12` `lr` `pc` `xPSR`",
                "그 8개 = AAPCS의 caller-saved 집합 → ISR이 평범한 C 함수",
                "`lr`에는 **EXC_RETURN**(`0xFFFFFFF9` 등) · `bx lr` 하면 하드웨어가 꺼내 복귀",
                "RTOS 전환: PendSV에서 나머지 `r4`–`r11`을 저장하고 `psp`를 바꿈"
            ],
            concepts: [
                { term: "예외 스택 프레임", en: "Exception stack frame", def: "낮은 주소부터 r0 r1 r2 r3 r12 lr 복귀 주소 xPSR · 32바이트 · FPU 문맥이면 S0–S15·FPSCR까지 26워드" },
                { term: "EXC_RETURN", en: "Exception return value", def: "`0xFFFFFFF1` Handler·MSP · `0xFFFFFFF9` Thread·MSP · `0xFFFFFFFD` Thread·PSP (FPU 프레임이면 `…E1/E9/ED`)" },
                { term: "MSP / PSP", en: "Main Stack Pointer / Process Stack Pointer", def: "핸들러는 항상 MSP · Thread는 CONTROL.SPSEL로 선택 · RTOS 태스크는 PSP" },
                { term: "PendSV", en: "Pendable request for system service", def: "소프트웨어로 대기시키는 예외 · 가장 낮은 우선순위로 두면 모든 ISR 뒤에 실행 → 컨텍스트 스위치 자리" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "a", label: "태스크 A", sub: "Thread · psp", x: 0, y: 0 },
                    { id: "hw", label: "HW 스태킹", sub: "8워드 = 32 B", x: 1, y: 0 },
                    { id: "isr", label: "SysTick", sub: "lr=0xFFFFFFFD", x: 2, y: 0 },
                    { id: "pend", label: "PendSV", sub: "최저 우선순위", x: 3, y: 0 },
                    { id: "save", label: "A 저장", sub: "stmdb {r4-r11}", x: 3, y: 1 },
                    { id: "tcb", label: "TCB", sub: "psp 기록·교체", x: 2, y: 1 },
                    { id: "load", label: "B 복원", sub: "ldmia {r4-r11}", x: 1, y: 1 },
                    { id: "b", label: "태스크 B", sub: "멈춘 곳부터", x: 0, y: 1 }
                ],
                edges: [
                    { from: "a", to: "hw", label: "예외" },
                    { from: "hw", to: "isr", label: "벡터" },
                    { from: "isr", to: "pend", label: "tail-chain" },
                    { from: "pend", to: "save" },
                    { from: "save", to: "tcb", label: "psp" },
                    { from: "tcb", to: "load", label: "다음 TCB" },
                    { from: "load", to: "b", label: "bx lr" }
                ],
                steps: [
                    { on: ["a"], text: "태스크 A 실행 중 · Thread 모드, 스택은 `psp` · SysTick이 대기(pending) 상태가 됨" },
                    { on: ["a>hw", "hw"], text: "**예외 스택 프레임**(exception stack frame): `psp` 아래로 `r0`–`r3`, `r12`, `lr`, `pc`, `xPSR` 저장 · 동시에 벡터 읽기" },
                    { on: ["hw"], text: "저장 중 더 높은 우선순위가 오면 그 핸들러부터 (late arrival) · 저장 내용이 같아 스태킹은 그대로 이어감" },
                    { on: ["hw>isr", "isr"], text: "**Handler 모드**(handler mode) · 스택은 `msp` · `lr` = `0xFFFFFFFD` = 'Thread·PSP로 돌아갈 것'" },
                    { on: ["isr>pend", "pend"], text: "ISR이 PendSV를 대기시키고 `bx lr` · 대기 예외가 있으니 **언스태킹**(unstacking) 없이 바로 PendSV (tail-chaining)" },
                    { on: ["pend>save", "save"], text: "`mrs r0, psp` → `stmdb r0!, {r4-r11}` · 하드웨어가 안 한 8개를 A의 스택에" },
                    { on: ["save>tcb", "tcb"], text: "줄어든 `psp`를 A의 TCB에 기록 · `vTaskSwitchContext()`가 다음 태스크 B 선택" },
                    { on: ["tcb>load", "load"], text: "B의 TCB에서 저장된 `psp` → `ldmia r0!, {r4-r11}` → `msr psp, r0`" },
                    { on: ["load>b", "b"], text: "`bx lr`(EXC_RETURN) → 하드웨어가 B 스택에서 8워드 복원 → B는 멈췄던 명령부터" }
                ]
            },
            code: [
                {
                    lang: "asm",
                    title: "PendSV 컨텍스트 스위치 (FreeRTOS ARM_CM3 포트 요약)",
                    src: `PendSV_Handler:                  @ 진입 때 r0-r3, r12, lr, pc, xPSR 는 이미 psp 쪽에
        mrs     r0, psp          @ 현재 태스크 스택 (하드웨어 프레임 바로 아래)
        isb
        ldr     r3, =pxCurrentTCB
        ldr     r2, [r3]         @ r2 = 현재 TCB
        stmdb   r0!, {r4-r11}    @ 나머지 8개 저장 · push 와 같은 방향
        str     r0, [r2]         @ TCB 첫 칸 = 새 스택 꼭대기
        stmdb   sp!, {r3, lr}    @ lr(EXC_RETURN) 보관 · msp 쪽
        bl      vTaskSwitchContext   @ pxCurrentTCB = 다음 태스크
        ldmia   sp!, {r3, lr}
        ldr     r1, [r3]
        ldr     r0, [r1]         @ 새 태스크의 저장된 psp
        ldmia   r0!, {r4-r11}    @ 새 태스크의 r4-r11
        msr     psp, r0
        isb
        bx      lr               @ 0xFFFFFFFD → 나머지 8개는 하드웨어가 복원`,
                    note: "원본은 `vTaskSwitchContext` 앞뒤로 BASEPRI를 올렸다 내림 (여기선 생략) · `stmdb`/`ldmia`/`mrs`는 시뮬레이터 밖 명령"
                },
                {
                    lang: "c",
                    title: "HardFault: 쌓인 프레임에서 폴트 주소 읽기",
                    src: `__attribute__((naked)) void HardFault_Handler(void) {
    __asm volatile(
        "tst   lr, #4      \\n"     // EXC_RETURN bit2 = 1 → PSP 에 쌓임
        "ite   eq          \\n"
        "mrseq r0, msp     \\n"
        "mrsne r0, psp     \\n"
        "b     hardfault_c \\n");   // r0 = 프레임 주소 → 첫 인자
}

void hardfault_c(uint32_t *f) {
    volatile uint32_t lr  = f[5];  // 폴트 난 함수를 부른 곳
    volatile uint32_t pc  = f[6];  // 폴트 난 명령 주소
    volatile uint32_t psr = f[7];  // xPSR (IPSR = 예외 번호)
    for (;;) { }                   // 디버거로 pc 확인 → addr2line
}`,
                    note: "프레임 순서 `f[0..3]` = r0–r3, `f[4]` = r12, `f[5]` = lr, `f[6]` = pc, `f[7]` = xPSR · `naked`라 컴파일러가 스택을 건드리지 않음"
                }
            ],
            optimize: [
                {
                    title: "ISR 어셈블리 래퍼 → 평범한 C 함수",
                    before: { lang: "asm", src: `@ ARM7TDMI (Armv4T): IRQ 마다 소프트웨어가 저장·복귀
IRQ_Handler:
        sub     lr, lr, #4
        stmfd   sp!, {r0-r3, r12, lr}
        bl      tick_isr_c
        ldmfd   sp!, {r0-r3, r12, pc}^   @ ^ : SPSR → CPSR 복원` },
                    after: { lang: "c", src: `// Cortex-M: 벡터 테이블에 C 함수 주소를 그대로
void SysTick_Handler(void) {
    ms_ticks++;          // 컴파일러가 만든 bx lr = EXC_RETURN 복귀
}` },
                    gain: "래퍼 4줄 → 0",
                    note: "하드웨어가 caller-saved를 저장하고 `lr`에 EXC_RETURN을 넣어 줌 · 고전 Arm은 모드 전환과 저장이 소프트웨어 몫"
                },
                {
                    title: "FPU 문맥: ISR에선 float 피하기 (lazy stacking)",
                    before: { lang: "c", src: `void ADC_IRQHandler(void) {
    float v = ADC1->DR * (3.3f / 4095.0f);   // ISR 안 FP 명령
    filt = filt * 0.9f + v * 0.1f;            // → S0-S15, FPSCR 실제 저장
}` },
                    after: { lang: "c", src: `void ADC_IRQHandler(void) {
    raw = ADC1->DR;     // 정수만 · 변환·필터는 태스크에서
    ready = 1;
}` },
                    gain: "FP 레지스터 17워드 저장 생략",
                    note: "FP를 쓰던 문맥에 예외가 오면 26워드 공간만 예약하고 S0–S15·FPSCR 저장은 ISR이 FP 명령을 쓸 때까지 미룸 (`FPCCR.LSPEN`)"
                }
            ],
            glossary: [
                { term: "언스태킹", en: "Unstacking", def: "예외 복귀 때 하드웨어가 프레임 8워드(또는 26워드)를 레지스터로 되돌림" },
                { term: "Handler 모드", en: "Handler mode", def: "예외 처리 중인 상태 · 항상 특권 · 항상 MSP · 그 밖은 Thread 모드" },
                { term: "Late arrival", en: "Late-arriving exception", def: "스태킹 중 더 높은 우선순위가 오면 벡터만 바꿔 그쪽부터 · 원래 예외는 그 뒤 tail-chain" },
                { term: "Tail-chaining", en: "Tail-chaining", def: "핸들러가 끝날 때 대기 예외가 있으면 언스태킹·재스태킹 없이 바로 다음 핸들러로" },
                { term: "Lazy stacking", en: "Lazy floating-point state preservation", def: "FP 레지스터 공간만 잡고 실제 저장은 핸들러가 FP 명령을 쓸 때까지 미룸" },
                { term: "TCB", en: "Task Control Block", def: "RTOS 태스크 정보 구조체 · FreeRTOS는 첫 칸에 저장된 스택 꼭대기(psp)" }
            ],
            quiz: [
                { q: "하드웨어 예외 프레임 `f[0..7]`에서 `f[6]`은?", options: ["예외 전 `lr`", "복귀 주소 `pc`", "`xPSR` 값", "`r12` 값"], a: 1, why: "r0 r1 r2 r3 r12 lr pc xPSR 순서 · `f[5]`의 lr은 그 함수를 부른 곳이라 헷갈리기 쉬움" },
                { q: "Thread 모드·PSP에서 들어온 예외의 `lr` 값은? (FPU 미사용)", options: ["0xFFFFFFF1", "0xFFFFFFF9", "0xFFFFFFFD", "복귀 주소"], a: 2, why: "F1 = Handler·MSP, F9 = Thread·MSP, FD = Thread·PSP · bit2 = 1이 PSP" },
                { q: "PendSV 핸들러가 `r4`–`r11`을 직접 저장하는 이유?", options: ["하드웨어는 caller-saved 8개만 쌓아서", "PendSV는 하드웨어 스태킹이 없어서", "r4–r11은 MSP에 쌓여 있어서", "C 컴파일러가 r4–r11을 못 써서"], a: 0, why: "하드웨어는 r0–r3, r12, lr, pc, xPSR만 · PendSV도 이건 똑같이 쌓음 · 태스크를 바꾸려면 나머지가 필요" },
                { q: "Late arrival 설명으로 맞는 것은?", options: ["스태킹 중 온 높은 쪽을 먼저 실행", "스태킹을 멈추고 처음부터 다시 쌓음", "늦게 온 예외는 다음 복귀 때 처리", "늦게 온 쪽 프레임을 하나 더 쌓음"], a: 0, why: "저장할 내용이 같으니 스태킹은 그대로 마치고 벡터만 바꿈 · 원래 예외는 그 뒤 tail-chain" },
                { q: "PendSV를 가장 낮은 우선순위로 두는 이유?", options: ["모든 ISR이 끝난 뒤 전환하려고", "SysTick보다 먼저 실행되려고", "PendSV 우선순위는 고정이라서", "Thread 모드에서 실행되게 하려고"], a: 0, why: "ISR이 중첩된 도중 태스크 스택을 바꾸면 바깥 ISR 복귀가 꼬임 · PendSV도 Handler 모드에서 실행" },
                { type: "order", q: "Thread 모드에서 인터럽트가 받아들여질 때 순서", items: ["현재 명령을 마침", "8워드 스태킹 + 벡터 읽기", "`lr` ← EXC_RETURN, IPSR ← 번호", "Handler 모드·MSP로 핸들러 첫 명령"], why: "스태킹과 벡터 읽기는 동시에 · 핸들러 첫 명령 땐 문맥 절반이 이미 스택에" },
                { type: "order", q: "기본 예외 프레임을 낮은 주소부터", items: ["r0–r3", "r12", "lr", "복귀 주소 (pc)", "xPSR"], why: "+0x00 r0 … +0x10 r12, +0x14 lr, +0x18 pc, +0x1C xPSR · 아키텍처가 정한 건 쓰는 순서가 아니라 위치" },
                { type: "num", q: "FPU를 쓰던 문맥에 예외가 오면 확장 프레임은 몇 바이트?", answer: 104, unit: "B", why: "8 + S0–S15 16 + FPSCR 1 + 예약 1 = 26워드 = 0x68" },
                { type: "text", q: "쌓인 xPSR = 0x0100002B. 실행 후 `r0` (CMSIS의 IRQn)은?", code: { lang: "asm", src: "    ldr  r4, =0x0100002B\n    and  r0, r4, #0x1FF   @ IPSR = 예외 번호\n    sub  r0, r0, #16" }, answer: ["27", "0x1B"], why: "예외 번호 43 · 외부 인터럽트 0이 예외 16이라 IRQ 27" }
            ],
            refs: [
                { title: "Armv7-M Architecture Reference Manual (DDI 0403E.e)", by: "Arm", year: 2021, url: "https://documentation-service.arm.com/static/606dc36485368c4c2b1bf62f", kind: "spec" },
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" },
                { title: "FreeRTOS-Kernel portable/GCC/ARM_CM3/port.c", by: "FreeRTOS", url: "https://github.com/FreeRTOS/FreeRTOS-Kernel/blob/main/portable/GCC/ARM_CM3/port.c", kind: "doc" }
            ]
        },
        {
            id: "asm-atomic",
            title: "원자 연산: LDREX / STREX",
            level: 3,
            mins: 14,
            pre: ["assembly/asm-exception", "languages/concurrency"],
            checked: "2026-11-16",
            key: [
                "`cnt++`은 `ldr`·`adds`·`str` 세 명령 · 사이에 ISR이 끼면 **갱신 손실**(lost update)",
                "`ldrex`는 읽으며 주소를 표시 · `strex`는 표시가 남았을 때만 쓰고 0, 아니면 1",
                "**배타적 모니터**(exclusive monitor)는 예외 진입·복귀가 지움 → **재시도 루프**(retry loop)로 다시",
                "M0(Armv6-M)엔 없음 → **인터럽트 차단**(interrupt masking) `cpsid i` · 순서는 `dmb`"
            ],
            concepts: [
                { term: "LDREX / STREX", en: "Load-Exclusive / Store-Exclusive", def: "`ldrex`가 읽으며 주소를 표시 · `strex`는 표시가 남아 있을 때만 쓰고 결과 0(성공) / 1(실패)" },
                { term: "배타적 모니터", en: "Exclusive monitor", def: "`ldrex`의 표시를 기억하는 하드웨어 · 예외 진입·복귀와 `clrex`가 지움" },
                { term: "재시도 루프", en: "Retry loop (load-exclusive / store-exclusive)", def: "`strex`가 1이면 `ldrex`부터 다시 · 끼어든 쪽의 갱신을 새로 읽어 반영" },
                { term: "인터럽트 차단", en: "Interrupt masking (PRIMASK / BASEPRI)", def: "`cpsid i`로 우선순위 설정 가능한 예외를 막음 · 모든 코어에서 되지만 IRQ 지연이 늘어남" }
            ],
            demo: {
                type: "seq",
                actors: ["태스크", "모니터", "cnt", "ISR"],
                msgs: [
                    { from: 0, to: 1, label: "ldrex r1 ← 5", text: "`ldrex`가 cnt = 5를 읽고 모니터가 주소를 표시 (Exclusive)" },
                    { from: 0, to: 0, label: "adds r1, #1", text: "레지스터에서 6을 만듦 · 메모리는 아직 5" },
                    { from: 3, to: 1, label: "예외 진입 → 지움", text: "인터럽트 · 예외 진입이 로컬 모니터를 지움 (Open)" },
                    { from: 3, to: 2, label: "cnt = 6", text: "ISR도 원자적으로 +1 → cnt = 6 · 예외 복귀도 모니터를 지움" },
                    { from: 0, to: 1, label: "strex → r2 = 1", text: "표시가 없으니 쓰지 않고 실패 1 · 태스크의 6은 버려짐" },
                    { from: 0, to: 0, label: "bne 재시도", text: "`cmp r2, #0` / `bne` → `ldrex`부터 다시" },
                    { from: 0, to: 1, label: "ldrex r1 ← 6", text: "다시 읽으니 ISR이 쓴 6 · 이번엔 끼어드는 예외 없음" },
                    { from: 0, to: 2, label: "strex → 0, cnt = 7", text: "성공 · 두 증가가 모두 남음 (`ldr`/`str`이었다면 6)" }
                ]
            },
            code: [
                {
                    lang: "asm",
                    title: "GCC 15.2 -O2 · atomic_fetch_add (Cortex-M4)",
                    src: `@ atomic_int cnt;  void inc(void) { atomic_fetch_add(&cnt, 1); }
inc:
        ldr     r3, .L4          @ &cnt (리터럴 풀)
        dmb     ish              @ 앞쪽 접근이 먼저 끝나게
.L2:
        ldrex   r1, [r3]         @ 읽기 + 모니터 표시
        adds    r1, r1, #1
        strex   r2, r1, [r3]     @ 표시가 남았으면 쓰고 r2 = 0
        cmp     r2, #0
        bne     .L2              @ 1 이면 처음부터
        dmb     ish              @ 뒤쪽 접근은 그 뒤에
        bx      lr`,
                    note: "`_Atomic` 변수의 `cnt++`도 같은 코드 · 원자성은 `ldrex`/`strex`, 순서는 **메모리 장벽**(memory barrier) `dmb` 몫 · Armv7-M은 `ish` 같은 옵션을 SY로 실행"
                },
                {
                    lang: "asm",
                    title: "같은 증가: Cortex-M0 · RV32IA · x86-64 (gcc 15.2 -O2)",
                    src: `@ Cortex-M0 (Armv6-M): 배타적 접근 명령 없음 → 함수 호출
        movs    r2, #5           @ 5 = __ATOMIC_SEQ_CST
        movs    r1, #1
        ldr     r0, .L3          @ &cnt
        bl      __atomic_fetch_add_4
# RV32IA: 읽기-더하기-쓰기를 한 명령 (A 확장 AMO)
        amoadd.w.aqrl  zero,a4,0(a5)    # a4 = 1, a5 = &cnt
# x86-64: lock 접두사
        lock add       DWORD PTR cnt[rip], 1`,
                    note: "M0는 `__atomic_fetch_add_4`를 부를 뿐 · 그 함수는 툴체인이나 프로젝트가 제공 (단일 코어면 인터럽트 차단으로 구현 가능)"
                }
            ],
            optimize: [
                {
                    title: "ISR 공유 카운터: 인터럽트 차단 → `ldrex`/`strex`",
                    before: { lang: "asm", src: `@ m = PRIMASK; cpsid i; cnt++; PRIMASK = m;     gcc -O2
inc_crit:
        mrs     r1, primask
        cpsid   i                @ 여기서부터 모든 IRQ 대기
        ldr     r2, .L20
        ldr     r3, [r2]
        adds    r3, r3, #1
        str     r3, [r2]
        msr     primask, r1      @ 원래 상태로
        bx      lr` },
                    after: { lang: "asm", src: `@ atomic_fetch_add(&cnt, 1)                     gcc -O2
inc:
        ldr     r3, .L4
        dmb     ish
.L2:    ldrex   r1, [r3]
        adds    r1, r1, #1
        strex   r2, r1, [r3]
        cmp     r2, #0
        bne     .L2              @ 끼어들었을 때만 한 번 더
        dmb     ish
        bx      lr` },
                    gain: "IRQ 차단 구간 0",
                    note: "차단은 짧아도 모든 인터럽트를 늦춤 · 여러 변수를 한꺼번에 바꿔야 하면 여전히 차단(또는 RTOS 뮤텍스)이 맞음"
                },
                {
                    title: "순서가 필요 없는 카운터: `seq_cst` → `relaxed`",
                    before: { lang: "asm", src: `@ __atomic_fetch_add(&cnt, 1, __ATOMIC_SEQ_CST)
        dmb     ish
.L6:    ldrex   r1, [r3]
        adds    r1, r1, #1
        strex   r2, r1, [r3]
        cmp     r2, #0
        bne     .L6
        dmb     ish` },
                    after: { lang: "asm", src: `@ __atomic_fetch_add(&cnt, 1, __ATOMIC_RELAXED)
.L10:   ldrex   r1, [r3]
        adds    r1, r1, #1
        strex   r2, r1, [r3]
        cmp     r2, #0
        bne     .L10` },
                    gain: "`dmb` 2 → 0",
                    note: "증가 자체는 여전히 원자적 · 다른 데이터와의 순서(예: '버퍼 채움 → 플래그')가 필요하면 release/acquire 이상"
                }
            ],
            glossary: [
                { term: "갱신 손실", en: "Lost update", def: "두 쪽이 같은 옛 값을 읽고 각자 써서 한쪽 증가가 사라짐" },
                { term: "CLREX", en: "Clear-Exclusive", def: "로컬 모니터를 지우는 명령 · 다음 `strex`는 실패" },
                { term: "메모리 장벽", en: "Memory barrier (DMB)", def: "`dmb` 앞뒤 메모리 접근 순서를 고정 · GCC가 seq_cst 원자 연산 앞뒤에 넣음" },
                { term: "PRIMASK", en: "Priority Mask Register", def: "1이면 우선순위 설정 가능한 예외를 모두 막음 (NMI·HardFault 제외) · `cpsid i` / `cpsie i`" },
                { term: "CAS", en: "Compare-And-Swap", def: "값이 기대값일 때만 새 값으로 · Arm `ldrex`+`cmp`+`strex`, RISC-V `lr.w`/`sc.w`, x86 `lock cmpxchg`" },
                { term: "AMO", en: "Atomic Memory Operation (RISC-V A extension)", def: "RISC-V `amoadd.w` 등 · 읽기-연산-쓰기를 한 명령으로 원자적으로" }
            ],
            quiz: [
                { q: "`strex r2, r1, [r3]` 뒤 `r2 = 1`의 뜻은?", options: ["쓰기 성공 · 다음으로 진행", "쓰기 안 함 · 다시 시도", "버스 오류 · 폴트 대기", "다른 값으로 덮어씀"], a: 1, why: "0 = 썼음, 1 = 표시가 지워져 안 씀 · 메모리는 그대로라 `ldrex`부터 다시" },
                { q: "단일 코어 M4에서 `ldrex`와 `strex` 사이에 인터럽트가 들어왔다 나가면?", options: ["모니터가 지워져 `strex` 실패", "ISR이 안 건드렸으면 성공", "인터럽트가 `strex` 뒤로 밀림", "UsageFault로 알려 줌"], a: 0, why: "예외 진입·복귀가 로컬 모니터를 지움 · ISR이 그 변수를 건드렸는지와 무관 · 한 번 더 돌 뿐 결과는 정확" },
                { q: "Cortex-M0에서 `__atomic_fetch_add(&cnt, 1, __ATOMIC_SEQ_CST)`는?", options: ["`ldrex`/`strex` 루프", "`bl __atomic_fetch_add_4`", "`cpsid i`/`cpsie i`로 감싼 인라인", "`lock` 접두사 붙은 `add`"], a: 1, why: "Armv6-M엔 배타적 접근 명령이 없어 라이브러리 함수 호출 · `lock`은 x86" },
                { q: "GCC가 seq_cst 원자 증가 앞뒤에 넣는 `dmb ish`의 역할은?", options: ["앞뒤 접근의 순서를 고정", "그 구간 인터럽트를 막음", "데이터 캐시를 모두 비움", "`strex`가 실패하지 않게 함"], a: 0, why: "원자성은 `ldrex`/`strex`, 순서는 `dmb` · relaxed로 바꾸면 두 `dmb`가 사라짐" },
                { q: "ISR과 공유하는 `volatile int cnt;`에 `cnt++`을 하면?", options: ["읽기와 쓰기 사이에 ISR이 낌", "`volatile`이라 원자적으로 증가", "`volatile`이 `ldrex`를 만들어 줌", "컴파일러가 차단 코드를 넣음"], a: 0, why: "`volatile`은 접근 횟수·순서만 지킴 · `ldr`/`adds`/`str` 세 명령 사이는 여전히 끊김" },
                { type: "text", q: "태스크의 `cnt++`이 ISR(`cnt += 5`)에 끊긴 순서다. 실행 후 `r0` (최종 cnt)은?", code: { lang: "asm", src: ".data\ncnt: .word 10\n.text\n    ldr  r0, =cnt\n    ldr  r1, [r0]        @ 태스크: 읽기\n@ ── ISR: cnt += 5 ──\n    ldr  r2, [r0]\n    adds r2, r2, #5\n    str  r2, [r0]\n@ ── 태스크로 복귀 ──\n    adds r1, r1, #1\n    str  r1, [r0]        @ 태스크: 쓰기\n    ldr  r0, [r0]" }, answer: ["11", "0xB"], why: "태스크가 옛 값 10에 1을 더해 덮어씀 · ISR의 +5가 사라짐 (맞는 값 16)" },
                { type: "order", q: "`ldrex`/`strex` 증가 루프의 순서", items: ["`ldrex`로 읽고 주소 표시", "레지스터에서 +1", "`strex`로 조건부 쓰기", "결과 ≠ 0이면 처음으로"], why: "표시가 지워졌으면 `strex`가 안 쓰고 1 · 메모리를 건드린 건 성공한 `strex` 한 번뿐" },
                { type: "num", q: "ISR이 두 번 끼어들어 `strex`가 두 번 실패했다. `ldrex` ~ `bne` 5 명령짜리 루프 본체는 모두 몇 명령 실행됐나?", answer: 15, why: "실패 2 + 성공 1 = 3 바퀴 × 5" },
                { type: "num", q: "Armv7-M ARM이 `ldrex`와 `strex` 사이 코드를 몇 바이트 이내로 두라고 강하게 권장하나?", answer: 128, unit: "B", why: "짧을수록 모니터가 중간에 지워질 일이 적음 · 사이에 다른 메모리 접근도 피함" }
            ],
            refs: [
                { title: "Armv7-M Architecture Reference Manual (DDI 0403E.e)", by: "Arm", year: 2021, url: "https://documentation-service.arm.com/static/606dc36485368c4c2b1bf62f", kind: "spec" },
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" },
                { title: "Built-in Functions for Memory Model Aware Atomic Operations (Using the GNU Compiler Collection)", by: "GNU Project", url: "https://gcc.gnu.org/onlinedocs/gcc/_005f_005fatomic-Builtins.html", kind: "doc" },
                { title: "RISC-V Instruction Set Manual", by: "RISC-V International", url: "https://github.com/riscv/riscv-isa-manual", kind: "spec" }
            ]
        },
        {
            id: "asm-isa",
            title: "RISC-V와 x86-64 비교",
            level: 2,
            mins: 16,
            pre: ["assembly/asm-branch", "assembly/asm-call"],
            checked: "2026-11-16",
            key: [
                "레지스터·분기·호출 개념은 같고, **명령 모양**이 ISA마다 다름",
                "RISC-V는 플래그 없음: **비교 후 분기**(compare-and-branch) `bne a5, a1, L` 한 명령",
                "인자 Arm `r0`–`r3` · RISC-V `a0`–`a7` · x86-64 `rdi rsi rdx rcx r8 r9`",
                "RV32I 4바이트 고정 vs x86 **가변 길이 인코딩**(variable-length encoding) 1–15바이트"
            ],
            concepts: [
                { term: "RISC / CISC", en: "Reduced / Complex Instruction Set Computer", def: "단순·고정 형식 + 로드/스토어 vs 메모리 피연산자·가변 길이 · 지금의 x86도 내부에선 micro-op으로 쪼갬" },
                { term: "비교 후 분기", en: "Compare-and-branch", def: "`beq bne blt bge bltu bgeu`가 두 레지스터를 직접 비교 · 상태 레지스터 없음" },
                { term: "가변 길이 인코딩", en: "Variable-length encoding", def: "x86은 접두사·opcode·ModRM·SIB·변위·즉시값 조합으로 1–15바이트" },
                { term: "제로 레지스터", en: "Zero register (x0)", def: "RISC-V `x0`은 항상 0 · `mv` = `addi rd, rs, 0`, `ret` = `jalr x0, 0(ra)`" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "src", label: "C 함수", sub: "sum(a, n)", x: 0, y: 1 },
                    { id: "arm", label: "Thumb-2", sub: "a=r0 · n=r1", x: 1, y: 0 },
                    { id: "rv", label: "RV32I", sub: "a=a0 · n=a1", x: 1, y: 1 },
                    { id: "x86", label: "x86-64", sub: "a=rdi · n=esi", x: 1, y: 2 },
                    { id: "flags", label: "플래그", sub: "NZCV / RFLAGS", x: 2, y: 0 },
                    { id: "br", label: "비교+분기", sub: "bne a5, a1, .L3", x: 2, y: 1 },
                    { id: "mem", label: "메모리 연산", sub: "add eax, [rdi]", x: 2, y: 2 },
                    { id: "enc", label: "크기", sub: "28 · 48 · 28 B", x: 3, y: 1 }
                ],
                edges: [
                    { from: "src", to: "arm" },
                    { from: "src", to: "rv" },
                    { from: "src", to: "x86" },
                    { from: "arm", to: "flags", label: "cmp" },
                    { from: "x86", to: "flags", label: "cmp" },
                    { from: "rv", to: "br" },
                    { from: "x86", to: "mem" },
                    { from: "br", to: "enc" }
                ],
                steps: [
                    { on: ["src"], text: "같은 `int sum(const int *a, int n)`을 GCC 15.2 `-O2`로 세 ISA에 컴파일" },
                    { on: ["src>arm", "src>rv", "src>x86", "arm", "rv", "x86"], text: "인자 위치는 각 **호출 규약**(calling convention)이 정함: `r0`/`r1` · `a0`/`a1` · `rdi`/`esi`" },
                    { on: ["arm>flags", "arm", "flags"], text: "Thumb-2: `cmp r3, r1`이 NZCV를 세팅 → `bne`가 읽음 · 두 명령" },
                    { on: ["x86>flags", "x86", "flags"], text: "x86-64: `cmp rdi, rdx`가 RFLAGS를 세팅 → `jne` · 같은 방식" },
                    { on: ["rv>br", "rv", "br"], text: "RV32I: 플래그 없음 · `bne a5, a1, .L3` 한 명령이 비교와 분기" },
                    { on: ["x86>mem", "mem"], text: "x86은 `add eax, DWORD PTR [rdi]`처럼 ALU 명령이 메모리를 직접 읽음 · Arm·RISC-V는 `ldr`/`lw`를 따로" },
                    { on: ["br>enc", "enc"], text: "함수 크기 (정렬 nop 제외): Thumb-2 28 B · RV32I 48 B · x86-64 28 B · RV32IC 28 B" },
                    { on: ["rv"], text: "64bit 덧셈도 다름: Arm은 `adds` + `adc`, RV32는 `sltu`로 자리올림을 계산해 더함" }
                ]
            },
            code: [
                {
                    lang: "riscv",
                    title: "RV32I · gcc 15.2 -O2 -march=rv32i",
                    src: `# int sum(const int *a, int n)    a → a0, n → a1, 반환 → a0
sum:
        ble     a1,zero,.L4      # n <= 0 → 0  (비교+분기 한 명령)
        slli    a1,a1,2          # n*4
        mv      a5,a0            # p = a
        add     a1,a0,a1         # end = a + n*4
        li      a0,0             # s = 0
.L3:
        lw      a4,0(a5)         # 로드는 따로
        addi    a5,a5,4
        add     a0,a0,a4
        bne     a5,a1,.L3        # 레지스터 두 개를 바로 비교
        ret                      # = jalr x0, 0(ra)
.L4:
        li      a0,0
        ret`,
                    note: "`ble` `mv` `li` `ret`은 **의사 명령**(pseudo-instruction) · `ble a1,zero`는 `bge zero,a1`이고 `zero`는 **제로 레지스터**(zero register) `x0`"
                },
                {
                    lang: "x86",
                    title: "x86-64 · gcc 15.2 -O2 (Intel 문법)",
                    src: `# rdi = a, esi = n, 반환 eax
sum:
        test    esi, esi                # n & n → 플래그
        jle     .L4
        movsx   rsi, esi                # int → 64bit 부호 확장 (주소 계산용)
        xor     eax, eax                # s = 0 · mov eax, 0 보다 짧음
        lea     rdx, [rdi+rsi*4]        # end = a + n*4 (주소 계산만)
.L3:
        add     eax, DWORD PTR [rdi]    # 메모리 피연산자: 로드+덧셈 한 명령
        add     rdi, 4
        cmp     rdi, rdx
        jne     .L3
        ret                             # 스택에서 복귀 주소를 꺼냄
.L4:
        xor     eax, eax
        ret`,
                    note: "x86 `call`은 복귀 주소를 스택에 push · Arm `lr`, RISC-V `ra`는 레지스터 · `eax` = `rax`의 하위 32bit"
                }
            ],
            optimize: [
                {
                    title: "RISC-V **압축 명령**(compressed instructions): `rv32i` → `rv32ic`",
                    before: { lang: "riscv", src: `# -march=rv32i : 모든 명령 4바이트
00050793    mv      a5,a0
00b505b3    add     a1,a0,a1
00000513    li      a0,0
0007a703    lw      a4,0(a5)
00478793    addi    a5,a5,4
00e50533    add     a0,a0,a4
00008067    ret
# … sum 전체 12 명령 = 48 B` },
                    after: { lang: "riscv", src: `# -march=rv32ic : 자주 쓰는 형태는 2바이트
87aa        mv      a5,a0
95aa        add     a1,a1,a0
4501        li      a0,0
4398        lw      a4,0(a5)
0791        addi    a5,a5,4
953a        add     a0,a0,a4
8082        ret
# … sum 전체 12 명령 = 28 B (Thumb-2 와 같음)` },
                    gain: "48 → 28 B (−42%)",
                    note: "C 확장은 Thumb처럼 16bit 형을 섞는 방식 · MCU용 RISC-V 코어는 보통 C를 포함 (예: RV32IMAC)"
                },
                {
                    title: "64bit ISA: 배열 인덱스 `int` → `size_t`",
                    before: { lang: "x86", src: `# int pick(const int *a, int i) { return a[i]; }
pick:
        movsx   rsi, esi                    # 32bit int → 64bit 부호 확장
        mov     eax, DWORD PTR [rdi+rsi*4]
        ret` },
                    after: { lang: "x86", src: `# int pick_sz(const int *a, size_t i) { return a[i]; }
pick_sz:
        mov     eax, DWORD PTR [rdi+rsi*4]  # 주소 계산에 바로
        ret` },
                    gain: "`movsx` 1개 제거",
                    note: "포인터가 64bit라 `int` 인덱스는 넓혀야 함 · 32bit Arm에선 둘 다 `ldr r0, [r0, r1, lsl #2]`로 같음"
                }
            ],
            glossary: [
                { term: "호출 규약", en: "Calling convention", def: "인자·반환값·보존 레지스터·스택 정렬 약속 · Arm AAPCS, RISC-V psABI, x86-64 System V" },
                { term: "의사 명령", en: "Pseudo-instruction", def: "어셈블러가 실제 명령으로 바꿔 주는 이름 · RISC-V `li` `mv` `ret` `call`, Arm `ldr =`" },
                { term: "압축 명령", en: "Compressed instructions (RISC-V C extension)", def: "자주 쓰는 명령의 16bit 형 · 32bit 명령과 섞어 씀 · 코드 크기 감소" },
                { term: "메모리 피연산자", en: "Memory operand", def: "x86 ALU 명령이 `[rdi]` 같은 메모리를 직접 읽고 씀 · `add DWORD PTR [rdi], esi` 한 명령" },
                { term: "RFLAGS", en: "x86-64 flags register", def: "CF ZF SF OF … · Arm NZCV와 같은 역할 · `cmp`/`test`가 세팅, `jcc`/`cmovcc`가 읽음" },
                { term: "psABI", en: "Processor-specific Application Binary Interface", def: "ISA별 ABI 문서 · 호출 규약, ELF 재배치, 자료형 크기·정렬" }
            ],
            quiz: [
                { q: "RISC-V에서 `if (a < b) goto L;`에 필요한 명령은 보통?", options: ["`cmp` + `blt` 2개", "`blt` 1개", "`slt`만, 분기 없음", "`slt` + `bnez` 2개"], a: 1, why: "`blt a, b, L`이 비교와 분기를 한 번에 · `slt`는 0/1 값이 필요할 때" },
                { q: "x86-64 System V에서 세 번째 정수 인자 레지스터는?", options: ["rcx", "rdx", "r8", "rsi"], a: 1, why: "rdi, rsi, rdx, rcx, r8, r9 순서 · rcx가 첫째인 건 Windows x64" },
                { q: "RV32는 64bit 덧셈의 자리올림을 어떻게 구하나?", options: ["CSR의 carry 비트를 읽음", "`sltu`로 합 < 피연산자 비교", "`addc` 명령으로 더함", "상위 비트를 `srli`로 꺼냄"], a: 1, why: "넘쳤으면 32bit 합이 피연산자보다 작아짐 → 1 · 플래그도 `adc`류 명령도 없음" },
                { q: "x86 `add eax, DWORD PTR [rdi]`를 Thumb-2로 옮기면?", options: ["`add r0, r0, [r1]`", "`ldr r2, [r1]` + `add r0, r2`", "`add r0, r0, r1`", "`ldr r0, [r1, r0]`"], a: 1, why: "로드/스토어 구조라 메모리 피연산자가 없음 → 먼저 `ldr` · `add r0, r0, r1`은 주소를 더해 버림" },
                { q: "호출 명령(`call`/`bl`/`jal`)이 복귀 주소를 두는 곳은?", options: ["셋 다 링크 레지스터", "x86만 스택, 둘은 레지스터", "셋 다 스택에 push", "RISC-V만 스택, 둘은 레지스터"], a: 1, why: "x86 `call`이 push, `ret`이 pop · Arm `lr`, RISC-V `ra` (non-leaf는 그 뒤 직접 스택에 저장)" },
                { type: "num", q: "RV32I로 12 명령(48 B)인 함수를 C 확장으로 컴파일하니 10개가 2바이트가 됐다. 크기는?", answer: 28, unit: "B", why: "10 × 2 + 2 × 4 = 28 · `sum`에선 두 분기(`blez`, `bne`)만 4바이트로 남음" },
                { type: "text", q: "x86 `lea rdx, [rdi+rsi*4]`와 같은 Thumb 한 줄. r0 = 0x1000, r1 = 5이면 `r2`는?", code: { lang: "asm", src: "add  r2, r0, r1, lsl #2" }, answer: ["0x1014", "4116"], why: "0x1000 + 5 × 4 = 0x1014 · `lea`도 메모리를 읽지 않고 주소 계산만" },
                { type: "text", q: "Arm에서 실행 후 `r0`은? (x86 `sal`·RV32 `sll`이면 1)", code: { lang: "asm", src: "movs r0, #1\nmovs r1, #32\nlsl  r0, r0, r1" }, answer: ["0"], why: "Arm 레지스터 시프트는 하위 8비트(32)를 그대로 써서 0 · x86·RV32는 하위 5비트(0)만 봐서 그대로 1 · C에선 정의되지 않은 동작" },
                { type: "order", q: "x86-64 명령 바이트의 필드 순서", items: ["접두사 (REX 등)", "opcode", "ModRM", "SIB", "변위(displacement)", "즉시값"], why: "필요한 필드만 이어 붙여 1–15바이트 · REX는 opcode 바로 앞" }
            ],
            refs: [
                { title: "RISC-V Instruction Set Manual", by: "RISC-V International", url: "https://github.com/riscv/riscv-isa-manual", kind: "spec" },
                { title: "RISC-V ABIs Specification (ELF psABI)", by: "RISC-V International", url: "https://github.com/riscv-non-isa/riscv-elf-psabi-doc", kind: "spec" },
                { title: "System V Application Binary Interface — AMD64 Architecture Processor Supplement", by: "H. J. Lu et al.", url: "https://gitlab.com/x86-psABIs/x86-64-ABI", kind: "spec" },
                { title: "Compiler Explorer", by: "M. Godbolt", url: "https://godbolt.org/", kind: "doc" }
            ]
        }
    ]
});
