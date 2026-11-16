LAB.track({
    id: "embedded",
    name: "임베디드",
    icon: "⚙",
    color: "#22d3ee",
    tagline: "레지스터, 인터럽트, 타이머, RTOS. 칩 안에서 실제로 무슨 일이 일어나는지",
    trends: [
        {
            title: "RISC-V MCU 대중화",
            when: "2025–2026",
            points: [
                "ESP32-C/P, CH32V, GD32V 등 저가 RISC-V MCU 확산",
                "Arm Cortex-M 독점 구도 약화 · 툴체인(toolchain)은 GCC/LLVM 공용",
                "벡터(RVV) · 커스텀 명령(custom instructions)으로 DSP/AI 가속 차별화"
            ],
            refs: [
                { title: "RISC-V International Ratifies 15 New Specifications, Opening Up New Possibilities for RISC-V Designs", by: "RISC-V International", year: 2021, url: "https://riscv.org/blog/riscv-ratifies-15-new-specifications/", kind: "doc" },
                { title: "Espressif Reveals ESP32-P4: A High-Performance MCU with Numerous IO-Connectivity and Security Features", by: "Espressif Systems", year: 2023, url: "https://www.espressif.com/en/news/ESP32-P4", kind: "doc" }
            ]
        },
        {
            title: "MCU 안의 NPU · 엣지 AI(edge AI)",
            when: "2025–2026",
            points: [
                "`STM32N6`(Neural-ART), Arm `Ethos-U85`, NXP `eIQ Neutron` 등 MCU 내장 NPU",
                "INT8 양자화(quantized) 모델을 mW 단위 전력으로 실시간 추론(real-time inference)",
                "센서 옆에서 판단 → 클라우드 전송 데이터와 지연(latency) 감소"
            ],
            refs: [
                { title: "Arm Ethos-U85: Addressing the High Performance Demands of IoT in the Age of AI", by: "Arm", year: 2024, url: "https://newsroom.arm.com/blog/ethos-u85", kind: "doc" },
                { title: "eIQ Neutron Neural Processing Unit (NPU)", by: "NXP Semiconductors", url: "https://www.nxp.com/applications/technologies/ai-and-machine-learning/eiq-neutron-npu:EIQ-NEUTRON-NPU", kind: "doc" }
            ]
        },
        {
            title: "Rust · Zephyr 의 성장",
            when: "2026",
            points: [
                "`embassy` async Rust: RTOS 없이 협력형 태스크(cooperative tasks)",
                "안전 인증(safety certification)용 Rust 툴체인(Ferrocene) 등장 · 메모리 안전(memory safety) 요구 증가",
                "Zephyr RTOS: 벤더 공통 드라이버 모델 · Devicetree 기반 설정"
            ],
            refs: [
                { title: "Officially Qualified - Ferrocene", by: "Ferrous Systems", year: 2023, url: "https://ferrous-systems.com/blog/officially-qualified-ferrocene/", kind: "doc" },
                { title: "Devicetree", by: "Zephyr Project", url: "https://docs.zephyrproject.org/latest/build/dts/index.html", kind: "doc" }
            ]
        },
        {
            title: "보안 규제(security regulation)와 OTA 의무화",
            when: "2026–2027",
            points: [
                "EU CRA: 2026-09 취약점 보고(vulnerability reporting) 의무, 2027-12 본격 적용",
                "Secure Boot · 서명된 펌웨어(signed firmware) · SBOM 이 기본 요구사항",
                "A/B 파티션 OTA + 롤백 보호(rollback protection)가 표준 설계로"
            ],
            refs: [
                { title: "Cyber Resilience Act", by: "European Commission", url: "https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act", kind: "doc" }
            ]
        }
    ],
    lessons: [
        {
            id: "mcu",
            title: "MCU 구조와 메모리맵",
            level: 1,
            mins: 12,
            key: [
                "MCU = CPU + Flash + SRAM + 주변장치(peripheral), 모두 **하나의 주소 공간**(address space)",
                "주변장치 제어 = 정해진 주소에 읽고 쓰기 · 메모리맵(memory-mapped) I/O",
                "리셋(reset) → 벡터 테이블(vector table) → `Reset_Handler` → `main()`",
                "링커 스크립트(linker script)가 코드/데이터의 위치를 결정"
            ],
            concepts: [
                { term: "Flash", def: "코드와 상수 · 전원 꺼도 유지 · 읽기 빠름, 쓰기 느림" },
                { term: "SRAM", en: "Static Random-Access Memory", def: "변수, 스택, 힙 · 빠르지만 전원 꺼지면 소실" },
                { term: "버스 매트릭스", en: "Bus matrix", def: "CPU·DMA가 Flash/SRAM/주변장치에 동시 접근하도록 중재" },
                { term: "`.data` / `.bss`", en: "Initialized data / Block Started by Symbol (BSS)", def: "초기값 있는 전역 / 0으로 시작하는 전역 · 부팅 시 준비" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "rst", label: "Reset", sub: "전원 ON", x: 0, y: 0 },
                    { id: "vt", label: "벡터 테이블", sub: "0x0800_0000", x: 1, y: 0 },
                    { id: "rh", label: "Reset_Handler", sub: "startup.s", x: 2, y: 0 },
                    { id: "data", label: ".data 복사", sub: "Flash → SRAM", x: 2, y: 1 },
                    { id: "bss", label: ".bss 0 채움", sub: "SRAM", x: 1, y: 1 },
                    { id: "main", label: "main()", sub: "사용자 코드", x: 0, y: 1 }
                ],
                edges: [
                    { from: "rst", to: "vt", label: "fetch" },
                    { from: "vt", to: "rh", label: "PC=" },
                    { from: "rh", to: "data" },
                    { from: "data", to: "bss" },
                    { from: "bss", to: "main" }
                ],
                steps: [
                    { on: ["rst"], text: "전원 인가(power-on) · 리셋 해제" },
                    { on: ["rst>vt", "vt"], text: "CPU가 벡터 테이블에서 **초기 SP**와 **리셋 벡터**(reset vector)를 읽음" },
                    { on: ["vt>rh", "rh"], text: "PC = `Reset_Handler` 주소 · 시작 코드(startup code) 실행" },
                    { on: ["rh>data", "data"], text: "`.data` 초기값을 Flash에서 SRAM으로 복사" },
                    { on: ["data>bss", "bss"], text: "`.bss` 영역을 0으로 채움" },
                    { on: ["bss>main", "main"], text: "클럭 설정(clock configuration) 후 `main()` 진입" }
                ]
            },
            code: [
                {
                    lang: "c",
                    title: "startup.c (요약)",
                    src: `extern uint32_t _sidata, _sdata, _edata, _sbss, _ebss, _estack;
int main(void);

void Reset_Handler(void) {
    uint32_t *src = &_sidata;              // .data 초기값 (Flash)
    for (uint32_t *dst = &_sdata; dst < &_edata; )
        *dst++ = *src++;                   // Flash -> SRAM
    for (uint32_t *dst = &_sbss; dst < &_ebss; )
        *dst++ = 0;                        // .bss = 0
    SystemInit();                          // 클럭 설정
    main();
    for (;;) {}
}

__attribute__((section(".isr_vector")))
const void *vectors[] = { &_estack, Reset_Handler /* , NMI_Handler, ... */ };`,
                    note: "벡터 테이블 0번 = 초기 스택 포인터(initial stack pointer), 1번 = 리셋 핸들러(reset handler) 주소"
                },
                {
                    lang: "ld",
                    title: "linker.ld (요약)",
                    src: `MEMORY {
    FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 512K
    RAM   (rwx) : ORIGIN = 0x20000000, LENGTH = 128K
}
SECTIONS {
    .isr_vector : { KEEP(*(.isr_vector)) } > FLASH
    .text       : { *(.text*) *(.rodata*) } > FLASH
    .data       : { _sdata = .; *(.data*); _edata = .; } > RAM AT > FLASH
    .bss        : { _sbss = .; *(.bss*) *(COMMON); _ebss = .; } > RAM
}`,
                    note: "`> RAM AT > FLASH`: 실행 위치(run address)는 RAM, 저장 위치(load address)는 Flash"
                }
            ],
            optimize: [
                {
                    title: "큰 상수 테이블(constant table)은 `const` 로 Flash에",
                    before: { lang: "c", src: `// 1 KB 가 SRAM 에 올라가고, 부팅 때 복사까지
uint16_t sine_lut[512] = { 0, 201, 402, /* ... */ };` },
                    after: { lang: "c", src: `// Flash 에 그대로 · SRAM 0 byte · 복사 없음
static const uint16_t sine_lut[512] = { 0, 201, 402, /* ... */ };` },
                    gain: "SRAM −1KB · 부팅 단축"
                },
                {
                    title: "자주 도는 함수(hot function)는 RAM/ITCM 에서 실행",
                    before: { lang: "c", src: `void fir_filter(int16_t *x, int n) {
    // Flash wait-state 때문에 고클럭에서 정체
}` },
                    after: { lang: "c", src: `__attribute__((section(".ramfunc")))
void fir_filter(int16_t *x, int n) {
    // 0 wait-state SRAM/ITCM 에서 실행
}` },
                    gain: "루프 1.3~2× 빠름"
                }
            ],
            glossary: [
                { term: "메모리맵", en: "Memory map", def: "Flash·SRAM·주변장치 레지스터가 배치된 주소 지도" },
                { term: "벡터 테이블", en: "Vector table", def: "리셋·예외·인터럽트 핸들러 주소 배열 · 보통 Flash 시작 주소" },
                { term: "링커 스크립트", en: "Linker script", def: "섹션을 어느 메모리 영역에 둘지 정하는 파일 (`.ld`)" },
                { term: "Wait state", en: "Flash wait state", def: "고클럭에서 Flash 읽기를 기다리는 추가 사이클" },
                { term: "ITCM / DTCM", en: "Instruction / Data Tightly Coupled Memory", def: "CPU 전용 0-wait 메모리 · 시간 결정적 코드/데이터용" }
            ],
            quiz: [
                { q: "Cortex-M 리셋 직후 CPU가 벡터 테이블에서 처음 읽는 두 값은?", options: ["초기 SP, Reset_Handler 주소", "main 주소, 힙 크기", "클럭 주파수, 스택 크기", "NMI 주소, HardFault 주소"], a: 0, why: "0번 엔트리 = MSP 초기값, 1번 = 리셋 벡터" },
                { q: "`int count = 5;` (전역) 의 초기값 5는 부팅 전에 어디에 있나?", options: ["SRAM", "Flash (.data 의 load 영역)", "레지스터", "EEPROM"], a: 1, why: "Reset_Handler 가 Flash 의 초기값을 SRAM 으로 복사" },
                { q: "`static int buf[1024];` 는 어느 섹션?", options: [".text", ".rodata", ".data", ".bss"], a: 3, why: "초기값 없는 전역/정적 변수 → `.bss` (부팅 시 0)" },
                { q: "주변장치 레지스터 접근 방식으로 옳은 것은?", options: ["특수 I/O 명령만 사용", "정해진 주소에 load/store", "DMA 로만 가능", "OS 시스템콜 필요"], a: 1, why: "Cortex-M 은 메모리맵 I/O · 일반 load/store 로 접근" }
            ],
            refs: [
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" },
                { title: "Linker Scripts", by: "GNU Binutils", url: "https://sourceware.org/binutils/docs/ld/Scripts.html", kind: "doc" }
            ]
        },
        {
            id: "gpio",
            title: "GPIO와 레지스터 비트 조작",
            level: 1,
            mins: 12,
            key: [
                "핀 하나 = 여러 레지스터(register)의 **비트 몇 개**",
                "`|=` 켜기(set), `&= ~` 끄기(clear), `^=` 반전(toggle)",
                "Read-Modify-Write 는 인터럽트(interrupt)와 경쟁(race)할 수 있음",
                "`BSRR` 같은 원자적(atomic) set/reset 레지스터를 우선"
            ],
            concepts: [
                { term: "MODER", en: "GPIO port Mode Register", def: "핀 모드: 입력 / 출력 / 대체기능 / 아날로그 (핀당 2bit)" },
                { term: "ODR / IDR", en: "Output Data Register / Input Data Register", def: "출력 데이터 / 입력 데이터 레지스터" },
                { term: "Push-pull / Open-drain", def: "High·Low 모두 구동 / Low만 구동 (풀업 필요, I2C)" },
                { term: "`volatile`", def: "컴파일러가 레지스터 읽기/쓰기를 생략·재배치하지 못하게" }
            ],
            demo: { type: "sim", name: "reg", reg: "GPIOA->ODR", value: 0, bit: 5 },
            code: [
                {
                    lang: "c",
                    title: "LED 토글 (CMSIS)",
                    src: `#include "stm32f4xx.h"

int main(void) {
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;      // 1) 클럭 켜기
    GPIOA->MODER &= ~(0x3u << (5 * 2));        // 2) PA5 모드 비트 클리어
    GPIOA->MODER |=  (0x1u << (5 * 2));        //    01 = 출력
    for (;;) {
        GPIOA->BSRR = (1u << 5);               // set   (원자적)
        delay_ms(500);
        GPIOA->BSRR = (1u << (5 + 16));        // reset (원자적)
        delay_ms(500);
    }
}`,
                    note: "주변장치(peripheral)는 클럭을 켜기(clock enable) 전엔 레지스터 쓰기가 무시됨"
                },
                {
                    lang: "c",
                    title: "레지스터 직접 정의",
                    src: `#define GPIOA_BASE  0x40020000u
#define GPIOA_ODR   (*(volatile uint32_t *)(GPIOA_BASE + 0x14))

GPIOA_ODR |= (1u << 5);   // volatile 없으면 최적화로 사라질 수 있음`
                }
            ],
            optimize: [
                {
                    title: "RMW 경쟁 제거: `ODR ^=` 대신 `BSRR`",
                    before: { lang: "c", src: `// main 과 ISR 이 같은 포트를 수정
GPIOA->ODR |= (1u << 5);   // read → (ISR 끼어듦) → write
// ISR 이 바꾼 다른 핀 비트가 덮어써짐` },
                    after: { lang: "c", src: `GPIOA->BSRR = (1u << 5);         // 해당 비트만, 한 번의 write
GPIOA->BSRR = (1u << (5 + 16));  // reset 도 원자적` },
                    gain: "경쟁 0 · 명령 3→1"
                },
                {
                    title: "버튼 디바운스(debouncing): 지연 루프(delay loop) 대신 샘플링",
                    before: { lang: "c", src: `if (BTN_PRESSED()) {
    delay_ms(20);              // CPU 20ms 정지
    if (BTN_PRESSED()) toggle();
}` },
                    after: { lang: "c", src: `// 1ms 타이머 ISR 에서 호출
static uint8_t hist;
hist = (hist << 1) | BTN_PRESSED();
if (hist == 0x7F) toggle();    // 0→1 후 7ms 안정` },
                    gain: "블로킹 0ms"
                }
            ],
            glossary: [
                { term: "GPIO", en: "General-Purpose Input/Output", def: "소프트웨어로 입출력을 정하는 범용 핀" },
                { term: "RMW", en: "Read-Modify-Write", def: "읽고 → 비트 수정 → 다시 쓰기 · 중간에 끼어들면 데이터 손실" },
                { term: "BSRR", en: "Bit Set/Reset Register", def: "쓰기만으로 특정 비트를 set/reset 하는 원자적 레지스터" },
                { term: "풀업 저항", en: "Pull-up resistor", def: "입력이 떠 있을 때 High 로 고정 · 내부/외부 저항" },
                { term: "대체 기능", en: "Alternate function", def: "핀을 UART·SPI·PWM 등 주변장치 신호로 연결" }
            ],
            quiz: [
                { q: "PA5 만 끄는 코드는?", options: ["`ODR = 0;`", "`ODR &= ~(1u << 5);`", "`ODR |= ~(1u << 5);`", "`ODR ^= 5;`"], a: 1, why: "마스크 반전 후 AND → 5번 비트만 0" },
                { q: "레지스터 포인터에 `volatile` 이 필요한 이유는?", options: ["속도 향상", "컴파일러가 접근을 생략·병합하지 못하게", "스택에 두려고", "원자성 보장"], a: 1, why: "volatile 은 원자성을 주지 않음. 접근을 그대로 남길 뿐" },
                { q: "I2C 버스 핀 설정으로 맞는 것은?", options: ["Push-pull, 풀업 없음", "Open-drain + 풀업", "아날로그 모드", "입력 전용"], a: 1, why: "여러 장치가 Low 만 당기는 wired-AND 구조" },
                { q: "MODER 에서 핀 하나에 할당된 비트 수는?", options: ["1", "2", "4", "8"], a: 1, why: "00 입력 · 01 출력 · 10 대체기능 · 11 아날로그" }
            ],
            refs: [
                { title: "Programming languages — C (ISO/IEC 9899:201x, Committee Draft N1570)", by: "ISO/IEC JTC1/SC22/WG14", year: 2011, url: "https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf", kind: "spec" },
                { title: "CMSIS-Core (Cortex-M): Overview", by: "Arm", url: "https://arm-software.github.io/CMSIS_6/latest/Core/index.html", kind: "doc" },
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" }
            ]
        },
        {
            id: "bits",
            title: "비트 연산과 2의 보수",
            level: 1,
            mins: 14,
            key: [
                "`&` 골라내기·끄기, `|` 켜기, `^` 뒤집기 — 전부 **마스크(mask)**와 함께",
                "음수는 **2의 보수(two's complement)**: `-x == ~x + 1` · 덧셈기 하나로 ± 처리",
                "부호 있는 음수의 `>>` 는 C 에서 구현 정의 · GCC 는 부호 비트로 채움",
                "C 플래그 = 부호 없는 넘침, V 플래그 = 부호 있는 넘침(overflow)"
            ],
            concepts: [
                { term: "2의 보수", en: "Two's complement", def: "비트 반전 후 +1 로 음수 표현 · 8bit 범위 −128…127 · 최상위 비트 = 부호" },
                { term: "마스크", en: "Bit mask", def: "건드릴 비트만 1인 값 · `1u << n`, 필드는 `0x3u << (2 * n)`" },
                { term: "산술 시프트", en: "Arithmetic shift", def: "오른쪽 이동 때 빈자리를 부호 비트로 채움 → 음수도 ÷2ⁿ (음의 무한대 쪽 내림)" },
                { term: "NZCV 플래그", en: "Negative / Zero / Carry / oVerflow condition flags", def: "연산 결과 상태 비트 · `BEQ`, `BHI`(부호 없음), `BGT`(부호 있음)가 읽음" }
            ],
            demo: { type: "sim", name: "bitops", a: 0x3c, b: 0x0f, width: 8, op: "and" },
            code: [
                {
                    lang: "c",
                    title: "비트·필드 매크로",
                    src: `#include <stdint.h>

#define BIT(n)                (1u << (n))
#define FIELD_MASK(w, p)      (((1u << (w)) - 1u) << (p))      /* w < 32 */
#define FIELD_GET(r, w, p)    (((r) >> (p)) & ((1u << (w)) - 1u))
#define FIELD_SET(r, w, p, v) \\
    ((r) = ((r) & ~FIELD_MASK(w, p)) | (((uint32_t)(v) << (p)) & FIELD_MASK(w, p)))

uint32_t reg = 0;
reg |= BIT(3);                  /* 0x00000008  켜기   */
reg &= ~BIT(3);                 /* 0x00000000  끄기   */
reg ^= BIT(0);                  /* 0x00000001  뒤집기 */
FIELD_SET(reg, 2, 10, 0x2);     /* MODER 5번 핀(10–11) = 10b 대체 기능 */
uint32_t mode = FIELD_GET(reg, 2, 10);   /* 2 */`,
                    note: "필드 쓰기 = 비우고(`& ~mask`) 넣기(`| v << p`) · 넣는 값도 마스크해야 옆 필드를 안 건드림"
                },
                {
                    lang: "c",
                    title: "2의 보수와 넘침 검사",
                    src: `#include <stdint.h>
#include <stdbool.h>

int8_t a = 100, b = 100;
int8_t s = (int8_t)(a + b);           /* int 로 계산 → 200 → int8_t 로 줄이면 -56 (구현 정의) */
bool v = ((a ^ s) & (b ^ s)) < 0;     /* 같은 부호 둘을 더했는데 결과 부호가 다르면 넘침 */

uint8_t x = 0x05;
uint8_t neg    = (uint8_t)(~x + 1);   /* 0xFB == (uint8_t)-5 */
uint8_t lowest = x & (uint8_t)-x;     /* 0x01: 가장 낮은 1 비트 */
bool    pow2   = x && !(x & (x - 1)); /* 2의 거듭제곱? */`,
                    note: "`~x` 는 **정수 승격(integer promotion)**으로 `int` 에서 계산 → `uint8_t` 로 다시 캐스트"
                }
            ],
            optimize: [
                {
                    title: "링 버퍼 인덱스: `%` 대신 `& (N − 1)` (N = 2의 거듭제곱)",
                    before: { lang: "c", src: `/* size 가 변수 → 나눗셈 명령 */
head = (head + 1) % size;      /* Cortex-M4 UDIV: 2–12 사이클 */` },
                    after: { lang: "c", src: `/* size = 2^k 로 고정, mask = size - 1 */
head = (head + 1) & mask;      /* AND 1 사이클 */` },
                    gain: "UDIV → AND",
                    note: "상수 `% 8` 은 컴파일러가 이미 `& 7` 로 바꿈 · 이득은 크기가 변수일 때 · 부호 있는 `%` 는 음수 때문에 그대로 안 바뀜"
                },
                {
                    title: "1의 개수 세기: 32번 루프 대신 `x &= x - 1`",
                    before: { lang: "c", src: `int n = 0;
for (int i = 0; i < 32; i++)
    if (x & (1u << i)) n++;     /* 항상 32회 */` },
                    after: { lang: "c", src: `int n = 0;
while (x) { x &= x - 1; n++; }  /* 1 비트 수만큼만 */
/* GCC/Clang: n = __builtin_popcount(x); */` },
                    gain: "32회 → 1의 개수만큼",
                    note: "`x & (x - 1)` 은 가장 낮은 1 비트를 끔 · `POPCNT` 명령이 있는 CPU 에선 빌트인이 한 명령"
                }
            ],
            glossary: [
                { term: "1의 보수", en: "Ones' complement", def: "모든 비트 반전 `~x` · +0 과 −0 이 따로 생겨 정수 표현엔 거의 안 씀" },
                { term: "부호 확장", en: "Sign extension", def: "작은 부호 있는 정수를 넓힐 때 위쪽을 부호 비트로 채움 · `0xF0`(−16) → `0xFFF0`" },
                { term: "논리 시프트", en: "Logical shift", def: "빈자리를 항상 0 으로 채우는 시프트 · 부호 없는 `>>`" },
                { term: "비트 회전", en: "Bit rotation", def: "밀려난 비트를 반대쪽으로 다시 넣음 · 비트 손실 없음 · Arm `ROR`" },
                { term: "팝카운트", en: "Population count (popcount)", def: "1 인 비트 개수 · 해밍 거리, 패리티, 비트맵 집합 크기" },
                { term: "정수 승격", en: "Integer promotion", def: "C 에서 `int` 보다 작은 정수는 연산 전에 `int` 로 바뀜 · `~u8` 이 음수가 되는 이유" }
            ],
            quiz: [
                { q: "8bit 에서 `-5` 의 2의 보수 표현은?", options: ["`0x85`", "`0xFA`", "`0xFB`", "`0x05`"], a: 2, why: "`~0x05 = 0xFA`, +1 → `0xFB`" },
                { q: "`uint8_t` 덧셈 200 + 100 의 결과와 C 플래그는?", options: ["300, C=0", "44, C=1", "44, C=0", "255, C=1"], a: 1, why: "300 − 256 = 44 · 8bit 를 넘었으니 자리올림 C=1" },
                { q: "부호 있는 8bit 100 + 100 에서 켜지는 플래그는?", options: ["C 만", "V 와 N", "Z", "없음"], a: 1, why: "결과 `0xC8` = −56 · 양수 + 양수 → 음수라 V, 최상위 비트 1 이라 N" },
                { q: "`x & (x - 1)` 이 하는 일은?", options: ["가장 높은 1 비트 끄기", "가장 낮은 1 비트 끄기", "모든 비트 반전", "x 를 절반으로"], a: 1, why: "x − 1 은 가장 낮은 1 과 그 아래를 뒤집음 → AND 로 그 1 만 사라짐" },
                { q: "`int8_t x = -8;` 일 때 GCC 에서 `x >> 1` 은?", options: ["-4", "124", "4", "컴파일 오류"], a: 0, why: "GCC 는 부호 있는 `>>` 를 산술 시프트로 정의 → 부호 유지 · 표준상으론 구현 정의" }
            ],
            refs: [
                { title: "Programming languages — C (ISO/IEC 9899:201x, Committee Draft N1570)", by: "ISO/IEC JTC1/SC22/WG14", year: 2011, url: "https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf", kind: "spec" },
                { title: "Bit Twiddling Hacks", by: "Sean Eron Anderson", url: "https://graphics.stanford.edu/~seander/bithacks.html", kind: "doc" },
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" }
            ]
        },
        {
            id: "irq",
            title: "인터럽트와 NVIC",
            level: 2,
            mins: 14,
            key: [
                "이벤트 → 플래그 → NVIC → CPU 가 하던 일 저장(context save) → ISR",
                "ISR 은 **짧게**: 플래그 지우고, 데이터 넘기고, 끝",
                "공유 변수(shared variable)는 `volatile` + 필요하면 임계구역(critical section)",
                "우선순위(priority) 숫자가 **작을수록** 높음 (Cortex-M)"
            ],
            concepts: [
                { term: "NVIC", en: "Nested Vectored Interrupt Controller", def: "인터럽트 활성화·우선순위·대기 상태를 관리하는 컨트롤러" },
                { term: "스태킹", en: "Stacking", def: "진입 시 R0–R3, R12, LR, PC, xPSR 8개를 하드웨어가 자동 저장" },
                { term: "Tail-chaining", def: "ISR 끝나자마자 다음 대기 ISR 로 바로 이동 (복원/저장 생략)" },
                { term: "인터럽트 지연", en: "Interrupt latency", def: "이벤트 → ISR 첫 명령까지 · Cortex-M4 약 12 사이클" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "per", label: "타이머", sub: "overflow", x: 0, y: 0 },
                    { id: "nvic", label: "NVIC", sub: "우선순위 비교", x: 1, y: 0 },
                    { id: "cpu", label: "CPU", sub: "main 실행 중", x: 2, y: 0 },
                    { id: "stk", label: "스택", sub: "8 레지스터", x: 3, y: 0 },
                    { id: "isr", label: "TIM2_IRQHandler", sub: "ISR", x: 3, y: 1 },
                    { id: "ret", label: "복귀", sub: "EXC_RETURN", x: 2, y: 1 }
                ],
                edges: [
                    { from: "per", to: "nvic", label: "IRQ 28" },
                    { from: "nvic", to: "cpu", label: "선점" },
                    { from: "cpu", to: "stk", label: "push" },
                    { from: "stk", to: "isr" },
                    { from: "isr", to: "ret" },
                    { from: "ret", to: "cpu", label: "pop" }
                ],
                steps: [
                    { on: ["per"], text: "타이머 카운터 오버플로 → **UIF 플래그** set" },
                    { on: ["per>nvic", "nvic"], text: "NVIC: IRQ 대기(pending) · 현재 우선순위보다 높은가?" },
                    { on: ["nvic>cpu", "cpu"], text: "높음 → 현재 명령 마치고 예외 진입(exception entry)" },
                    { on: ["cpu>stk", "stk"], text: "하드웨어가 R0–R3, R12, LR, PC, xPSR **자동 저장**(stacking)" },
                    { on: ["stk>isr", "isr"], text: "벡터 테이블(vector table)의 ISR 주소로 점프 · 플래그 클리어" },
                    { on: ["isr>ret", "ret"], text: "`bx lr` (EXC_RETURN) · 대기 IRQ 있으면 tail-chain" },
                    { on: ["ret>cpu", "cpu"], text: "레지스터 복원(unstacking) · 중단 지점부터 main 계속" }
                ]
            },
            code: [
                {
                    lang: "c",
                    title: "타이머 ISR + 메인 루프",
                    src: `static volatile uint32_t ticks;
static volatile bool     tick_flag;

void TIM2_IRQHandler(void) {
    if (TIM2->SR & TIM_SR_UIF) {
        TIM2->SR = ~TIM_SR_UIF;    // 1) 플래그 먼저 클리어
        ticks++;                   // 2) 최소한의 일
        tick_flag = true;          // 3) 나머지는 main 에 맡김
    }
}

int main(void) {
    NVIC_SetPriority(TIM2_IRQn, 5);
    NVIC_EnableIRQ(TIM2_IRQn);
    for (;;) {
        if (tick_flag) { tick_flag = false; update_display(ticks); }
    }
}`,
                    note: "플래그를 안 지우면 ISR 이 끝나자마자 다시 진입 (무한 재진입)"
                },
                {
                    lang: "c",
                    title: "임계구역",
                    src: `uint32_t primask = __get_PRIMASK();
__disable_irq();
shared.a = x;          // 여러 필드를 한 번에 바꿔야 할 때
shared.b = y;
__set_PRIMASK(primask); // 원래 상태로 복원 (중첩 안전)`
                }
            ],
            optimize: [
                {
                    title: "무거운 처리는 ISR 밖으로: 링 버퍼(ring buffer)",
                    before: { lang: "c", src: `void USART1_IRQHandler(void) {
    char c = USART1->DR;
    parse_command(c);      // 수 ms · 다른 인터럽트 지연
    printf("got %c\\n", c); // ISR 안 printf: 금지
}` },
                    after: { lang: "c", src: `void USART1_IRQHandler(void) {
    rb_put(&rx, USART1->DR);   // O(1) · 수십 사이클
}
// main 루프
while (rb_get(&rx, &c)) parse_command(c);` },
                    gain: "ISR 시간 ~100× 감소"
                },
                {
                    title: "64bit 카운터 읽기: 찢어진 읽기(torn read) 방지",
                    before: { lang: "c", src: `volatile uint64_t ms;          // ISR 에서 ++
uint64_t now = ms;             // 32bit CPU: 두 번 읽기 → 중간에 ISR` },
                    after: { lang: "c", src: `uint32_t hi, lo;
do { hi = ms_hi; lo = ms_lo; } while (hi != ms_hi); // 재확인 루프` },
                    gain: "락 없이 일관성"
                }
            ],
            glossary: [
                { term: "ISR", en: "Interrupt Service Routine", def: "인터럽트 발생 시 실행되는 함수" },
                { term: "선점", en: "Preemption", def: "더 높은 우선순위 인터럽트가 실행 중인 ISR 을 중단시킴" },
                { term: "Pending", en: "Pending", def: "발생했지만 아직 처리되지 않은 인터럽트 상태" },
                { term: "임계구역", en: "Critical section", def: "인터럽트/다른 태스크가 끼어들면 안 되는 코드 구간" },
                { term: "링 버퍼", en: "Ring buffer", def: "고정 크기 원형 큐 · ISR↔main 데이터 전달에 사용" }
            ],
            quiz: [
                { q: "Cortex-M 에서 더 높은 우선순위는?", options: ["숫자 15", "숫자 0", "숫자가 같으면 무조건 먼저 온 것", "우선순위 개념 없음"], a: 1, why: "숫자가 작을수록 높음 · 0 이 최고 (설정 가능 범위 내)" },
                { q: "ISR 에서 플래그를 지우지 않으면?", options: ["아무 일 없음", "ISR 이 반복 재진입", "HardFault 즉시 발생", "CPU 정지"], a: 1, why: "pending 이 계속 유지 → 복귀 직후 다시 진입" },
                { q: "ISR 에서 피해야 할 것은?", options: ["플래그 클리어", "링 버퍼에 1바이트 저장", "`printf`, 긴 루프, 블로킹 대기", "volatile 변수 갱신"], a: 2, why: "ISR 이 길면 다른 인터럽트 지연·데이터 유실" },
                { q: "예외 진입 시 하드웨어가 자동 저장하지 않는 것은?", options: ["PC", "xPSR", "R4–R11", "LR"], a: 2, why: "R4–R11 은 callee-saved · 필요하면 컴파일러가 ISR 안에서 저장" },
                { q: "Tail-chaining 의 효과는?", options: ["ISR 중첩 금지", "연속 ISR 사이 pop/push 생략으로 지연 감소", "우선순위 역전 해결", "스택 사용량 증가"], a: 1, why: "복원 후 재저장을 건너뛰고 바로 다음 ISR 진입" }
            ],
            refs: [
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" },
                { title: "Cortex-M4 Technical Reference Manual", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f19da2a20b7cf4bc524d99a", kind: "doc" },
                { title: "CMSIS-Core (Cortex-M): Overview", by: "Arm", url: "https://arm-software.github.io/CMSIS_6/latest/Core/index.html", kind: "doc" }
            ]
        },
        {
            id: "pwm",
            title: "타이머와 PWM",
            level: 2,
            mins: 12,
            key: [
                "타이머 = 클럭을 세는 카운터 · `PSC` 로 나누고 `ARR` 에서 리셋",
                "PWM 주파수(frequency) = `f_clk / ((PSC+1)(ARR+1))`",
                "듀티(duty cycle) = `CCR / (ARR+1)` · 평균 전압(average voltage) = 듀티 × VCC",
                "ARR 이 클수록 분해능(resolution)↑, 주파수↓"
            ],
            concepts: [
                { term: "PSC", en: "Prescaler", def: "프리스케일러 · 입력 클럭을 (PSC+1) 로 나눔" },
                { term: "ARR", en: "Auto-Reload Register", def: "자동 리로드 값 · 카운터가 여기까지 세고 0 으로" },
                { term: "CCR", en: "Capture/Compare Register", def: "비교 값 · 카운터 < CCR 동안 출력 High (PWM 모드 1)" },
                { term: "Preload", def: "새 ARR/CCR 를 주기 끝에 반영 → 글리치 방지" }
            ],
            demo: { type: "sim", name: "pwm", fclk: 72000000 },
            code: [
                {
                    lang: "c",
                    title: "TIM3 CH1 · 1 kHz PWM",
                    src: `// f_clk = 72 MHz, 목표 1 kHz, 분해능 1000 단계
TIM3->PSC  = 72 - 1;             // 72 MHz / 72 = 1 MHz
TIM3->ARR  = 1000 - 1;           // 1 MHz / 1000 = 1 kHz
TIM3->CCR1 = 300;                // 30 % 듀티
TIM3->CCMR1 = (6u << TIM_CCMR1_OC1M_Pos)  // PWM mode 1
            | TIM_CCMR1_OC1PE;             // CCR preload
TIM3->CR1  |= TIM_CR1_ARPE;      // ARR preload
TIM3->CCER |= TIM_CCER_CC1E;     // 출력 활성화
TIM3->EGR   = TIM_EGR_UG;        // 레지스터 로드
TIM3->CR1  |= TIM_CR1_CEN;       // 시작`,
                    note: "모터는 20 kHz 이상(가청 밖), LED 는 1 kHz 정도면 깜빡임(flicker) 없음"
                },
                {
                    lang: "c",
                    title: "듀티 계산 헬퍼",
                    src: `static inline void pwm_set_permille(uint16_t pm) {   // 0..1000
    TIM3->CCR1 = (uint32_t)(TIM3->ARR + 1) * pm / 1000;
}`
                }
            ],
            optimize: [
                {
                    title: "소프트웨어 PWM → 하드웨어 PWM",
                    before: { lang: "c", src: `for (;;) {                 // CPU 100 % 점유, 지터 큼
    LED_ON();  delay_us(duty);
    LED_OFF(); delay_us(1000 - duty);
}` },
                    after: { lang: "c", src: `TIM3->CCR1 = duty;         // 한 번 쓰면 끝
// 이후 CPU 는 sleep 가능, 지터 0` },
                    gain: "CPU 100% → 0%"
                },
                {
                    title: "실행 중 듀티 변경: preload 켜기",
                    before: { lang: "c", src: `TIM3->CCMR1 &= ~TIM_CCMR1_OC1PE; // preload 끔
TIM3->CCR1 = new_duty;  // 주기 중간 반영 → 짧은 글리치` },
                    after: { lang: "c", src: `TIM3->CCMR1 |= TIM_CCMR1_OC1PE;  // preload 켬
TIM3->CCR1 = new_duty;  // 다음 업데이트 이벤트에 반영` },
                    gain: "글리치 제거"
                }
            ],
            glossary: [
                { term: "PWM", en: "Pulse Width Modulation", def: "주기는 고정, High 시간 비율로 평균 출력을 조절" },
                { term: "듀티비", en: "Duty cycle", def: "한 주기 중 High 인 시간의 비율 (%)" },
                { term: "분해능", en: "Resolution", def: "듀티를 나눌 수 있는 단계 수 · ARR+1" },
                { term: "Center-aligned", en: "Center-aligned PWM", def: "업/다운 카운트 · 모터 제어에서 전류 리플 감소" },
                { term: "Dead-time", en: "Dead-time", def: "H-브리지 상·하단 스위치 동시 ON 을 막는 지연" }
            ],
            quiz: [
                { q: "72 MHz, PSC=71, ARR=999 일 때 PWM 주파수는?", options: ["72 kHz", "1 kHz", "100 Hz", "10 kHz"], a: 1, why: "72e6 / (72 × 1000) = 1000 Hz" },
                { q: "ARR=999, CCR=250 이면 듀티는?", options: ["25 %", "2.5 %", "75 %", "250 %"], a: 0, why: "250 / (999+1) = 0.25" },
                { q: "같은 클럭에서 PWM 주파수를 높이면 분해능은?", options: ["높아짐", "낮아짐", "그대로", "무관"], a: 1, why: "ARR 이 작아져 나눌 단계가 줄어듦" },
                { q: "모터 PWM 을 20 kHz 이상으로 쓰는 주된 이유는?", options: ["효율 최대화", "가청 소음 회피", "EMI 증가", "분해능 증가"], a: 1, why: "사람 가청 대역(≈20 kHz) 밖으로" }
            ],
            refs: [
                { title: "Pulse Width Modulation (PWM)", by: "Zephyr Project", url: "https://docs.zephyrproject.org/latest/hardware/peripherals/pwm.html", kind: "doc" },
                { title: "Using PWM Output as a Digital-to-Analog Converter on a TMS320F280x Digital Signal Controller", by: "D. M. Alter", year: 2008, url: "https://www.ti.com/lit/an/spraa88a/spraa88a.pdf", kind: "doc" }
            ]
        },
        {
            id: "adc",
            title: "ADC와 DMA",
            level: 2,
            mins: 14,
            key: [
                "ADC: 연속 전압(continuous voltage) → n bit 정수 · LSB = Vref / 2ⁿ",
                "샘플링 주파수(sampling rate) > 신호 최고 주파수 × 2 · 나이퀴스트(Nyquist)",
                "DMA 가 결과를 메모리로 옮기면 CPU 는 놀아도 됨",
                "반/완료 인터럽트(half/complete interrupt)로 **더블 버퍼링(double buffering)**"
            ],
            concepts: [
                { term: "양자화 오차", en: "Quantization error", def: "아날로그 값과 가장 가까운 레벨의 차이 · 최대 ±½ LSB" },
                { term: "에일리어싱", en: "Aliasing", def: "너무 느린 샘플링으로 높은 주파수가 낮은 주파수로 보이는 현상" },
                { term: "DMA", en: "Direct Memory Access", def: "CPU 개입 없이 주변장치 ↔ 메모리 데이터 이동" },
                { term: "Circular 모드", en: "Circular mode", def: "버퍼 끝에 도달하면 처음으로 · 끊김 없는 연속 수집" }
            ],
            demo: { type: "sim", name: "adc" },
            code: [
                {
                    lang: "c",
                    title: "ADC + DMA 원형 버퍼 (HAL)",
                    src: `#define N 256
static uint16_t buf[2 * N];            // 반쪽씩 처리

void start(void) {
    HAL_ADC_Start_DMA(&hadc1, (uint32_t *)buf, 2 * N); // 타이머 트리거, circular
}
void HAL_ADC_ConvHalfCpltCallback(ADC_HandleTypeDef *h) {
    process(&buf[0], N);               // DMA 는 뒤쪽을 채우는 중
}
void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *h) {
    process(&buf[N], N);               // DMA 는 다시 앞쪽을 채우는 중
}`,
                    note: "process() 가 N 샘플 시간 안에 끝나야 데이터가 덮어써지지 않음"
                },
                {
                    lang: "c",
                    title: "원시값 → 전압",
                    src: `float mv = raw * 3300.0f / 4095.0f;    // 12bit, Vref 3.3V`
                }
            ],
            optimize: [
                {
                    title: "폴링 변환(polled conversion) → 타이머 트리거 + DMA",
                    before: { lang: "c", src: `for (int i = 0; i < N; i++) {
    HAL_ADC_Start(&hadc1);
    HAL_ADC_PollForConversion(&hadc1, 10);
    buf[i] = HAL_ADC_GetValue(&hadc1);  // CPU 계속 대기, 간격 불규칙
}` },
                    after: { lang: "c", src: `// TIM2 TRGO → ADC 트리거, DMA circular
HAL_ADC_Start_DMA(&hadc1, (uint32_t *)buf, N);
// CPU 는 콜백에서만 일함, 샘플 간격 정확` },
                    gain: "CPU 부하 −90% · 지터 0"
                },
                {
                    title: "평균: 나눗셈(division) 대신 시프트 · 오버샘플링(oversampling)",
                    before: { lang: "c", src: `uint32_t sum = 0;
for (int i = 0; i < 10; i++) sum += buf[i];
avg = sum / 10;                 // 나눗셈 (Cortex-M0: 소프트웨어)` },
                    after: { lang: "c", src: `uint32_t sum = 0;
for (int i = 0; i < 16; i++) sum += buf[i];
avg = sum >> 4;                 // 16개 = 2^4 · 시프트 1 사이클` },
                    gain: "M0 에서 ~30× 빠름"
                }
            ],
            glossary: [
                { term: "ADC", en: "Analog-to-Digital Converter", def: "아날로그 전압을 디지털 값으로 변환" },
                { term: "LSB", en: "Least Significant Bit", def: "최소 분해 단위 전압 · Vref/2ⁿ" },
                { term: "나이퀴스트 주파수", en: "Nyquist frequency", def: "샘플링 주파수의 절반 · 이보다 높은 성분은 에일리어싱" },
                { term: "SAR ADC", en: "Successive Approximation Register (SAR) ADC", def: "이진 탐색으로 비트를 하나씩 결정 · MCU 에 가장 흔함" },
                { term: "더블 버퍼링", en: "Double buffering", def: "한쪽을 채우는 동안 다른 쪽을 처리" }
            ],
            quiz: [
                { q: "12bit, Vref=3.3V 의 LSB 는 약?", options: ["0.8 mV", "3.3 mV", "12 mV", "0.08 mV"], a: 0, why: "3.3 / 4096 ≈ 0.806 mV" },
                { q: "1 kHz 신호를 샘플링할 최소 주파수(이론)는?", options: ["500 Hz", "1 kHz", "2 kHz 초과", "10 kHz 이상만 가능"], a: 2, why: "나이퀴스트: 2배 초과 · 실무는 5~10배 + 안티에일리어싱 필터" },
                { q: "DMA 반완료(half) 인터럽트의 용도는?", options: ["에러 감지", "앞 절반 처리 시작 (더블 버퍼링)", "DMA 중지", "클럭 변경"], a: 1, why: "DMA 가 뒤 절반을 채우는 동안 앞 절반을 처리" },
                { q: "분해능 1bit 증가 시 SQNR 은?", options: ["약 1 dB", "약 3 dB", "약 6 dB", "2배"], a: 2, why: "SQNR ≈ 6.02n + 1.76 dB" }
            ],
            refs: [
                { title: "Certain Topics in Telegraph Transmission Theory", by: "H. Nyquist", year: 1928, url: "https://doi.org/10.1109/T-AIEE.1928.5055024", kind: "paper" },
                { title: "Communication in the Presence of Noise", by: "C. E. Shannon", year: 1949, url: "https://doi.org/10.1109/JRPROC.1949.232969", kind: "paper" },
                { title: "Understanding Data Converters", by: "Texas Instruments", year: 1995, url: "https://www.ti.com/lit/an/slaa013/slaa013.pdf", kind: "doc" }
            ]
        },
        {
            id: "rtos",
            title: "RTOS 태스크와 스케줄링",
            level: 3,
            mins: 16,
            key: [
                "태스크 = 자기 스택을 가진 무한 루프",
                "선점형(preemptive): 더 높은 우선순위(priority)가 준비되면 **즉시** 교체",
                "기다릴 땐 폴링 대신 **블로킹**(blocking) (큐, 세마포어(semaphore), 알림(task notification))",
                "뮤텍스(mutex)는 우선순위 상속(priority inheritance)으로 역전을 막음"
            ],
            concepts: [
                { term: "Ready / Running / Blocked", def: "실행 대기 · 실행 중 · 이벤트 대기 상태" },
                { term: "컨텍스트 스위치", en: "Context switch", def: "현재 태스크 레지스터 저장 → 다음 태스크 복원 (PendSV)" },
                { term: "Tick", def: "주기적 타이머 인터럽트 · 시간 지연과 타임아웃의 기준" },
                { term: "RMS", en: "Rate-Monotonic Scheduling", def: "주기가 짧은 태스크에 높은 우선순위 · U ≤ n(2^(1/n)−1) 이면 보장" }
            ],
            demo: { type: "sim", name: "sched" },
            code: [
                {
                    lang: "c",
                    title: "FreeRTOS: 센서 → 큐 → 제어",
                    src: `static QueueHandle_t q;

void sensor_task(void *arg) {
    TickType_t last = xTaskGetTickCount();
    for (;;) {
        int16_t v = read_sensor();
        xQueueSend(q, &v, 0);
        vTaskDelayUntil(&last, pdMS_TO_TICKS(5));  // 정확히 5 ms 주기
    }
}

void control_task(void *arg) {
    int16_t v;
    for (;;) {
        if (xQueueReceive(q, &v, portMAX_DELAY))   // 올 때까지 Blocked
            motor_update(pid_step(v));
    }
}

int main(void) {
    q = xQueueCreate(16, sizeof(int16_t));
    xTaskCreate(sensor_task,  "sens", 256, NULL, 3, NULL);
    xTaskCreate(control_task, "ctrl", 512, NULL, 2, NULL);
    vTaskStartScheduler();
}`,
                    note: "`vTaskDelay` 는 상대 지연(relative delay)이라 주기 누적 오차(drift) · 주기 작업은 `vTaskDelayUntil`"
                }
            ],
            optimize: [
                {
                    title: "폴링 대기 → 태스크 알림으로 블로킹",
                    before: { lang: "c", src: `for (;;) {
    if (data_ready) { data_ready = 0; handle(); }
    vTaskDelay(1);   // 1 ms 마다 깨어남 · 지연 최대 1 ms` },
                    after: { lang: "c", src: `// ISR: vTaskNotifyGiveFromISR(h, &woken); portYIELD_FROM_ISR(woken);
for (;;) {
    ulTaskNotifyTake(pdTRUE, portMAX_DELAY);  // 이벤트까지 0 CPU
    handle();
}` },
                    gain: "지연 ~µs · 헛깨움 0"
                },
                {
                    title: "우선순위 역전(priority inversion): 세마포어 → 뮤텍스",
                    before: { lang: "c", src: `lock = xSemaphoreCreateBinary();   // 상속 없음
// Low 가 잡고 있는 동안 Mid 가 Low 를 선점
// → High 가 무한정 대기 (Mars Pathfinder 사례)` },
                    after: { lang: "c", src: `lock = xSemaphoreCreateMutex();    // 우선순위 상속
// High 대기 중엔 Low 가 High 우선순위로 올라가 빨리 반납` },
                    gain: "최악 대기 시간 한정"
                }
            ],
            glossary: [
                { term: "RTOS", en: "Real-Time Operating System", def: "마감 시간을 지키는 것이 목표인 운영체제" },
                { term: "세마포어", en: "Semaphore", def: "신호/개수 기반 동기화 · ISR→태스크 이벤트 전달" },
                { term: "뮤텍스", en: "Mutual exclusion (Mutex)", def: "소유권 있는 잠금 · 우선순위 상속 지원" },
                { term: "우선순위 역전", en: "Priority inversion", def: "높은 우선순위가 낮은 우선순위의 자원 반납을 기다리며 막힘" },
                { term: "WCET", en: "Worst-Case Execution Time", def: "최악 실행 시간 · 스케줄 분석의 입력" },
                { term: "스택 오버플로", en: "Stack overflow", def: "태스크 스택 초과 · 이웃 메모리 파괴 · 워터마크로 감시" }
            ],
            quiz: [
                { q: "`vTaskDelayUntil` 을 쓰는 이유는?", options: ["CPU 사용량 0", "주기 누적 오차 방지", "우선순위 상승", "스택 절약"], a: 1, why: "기준 시각에서 절대 주기로 깨어남" },
                { q: "우선순위 역전을 완화하는 것은?", options: ["바이너리 세마포어", "우선순위 상속 뮤텍스", "큐 길이 증가", "tick 주파수 증가"], a: 1, why: "자원 보유 태스크를 일시적으로 높은 우선순위로" },
                { q: "U = 0.2 + 0.3 + 0.35 = 0.85 인 태스크 3개 (RMS 한계 ≈ 0.78) 는?", options: ["반드시 마감 놓침", "RMS 충분조건은 아님 · 응답시간 분석 필요", "무조건 스케줄 가능", "EDF 로도 불가능"], a: 1, why: "한계 초과는 '보장 못함'일 뿐 · 실제 시뮬레이션처럼 가능할 수도" },
                { q: "Blocked 상태의 태스크가 쓰는 CPU 는?", options: ["tick 마다 조금", "0", "50%", "우선순위에 비례"], a: 1, why: "이벤트/타임아웃 전엔 스케줄링 대상 아님" }
            ],
            refs: [
                { title: "Scheduling Algorithms for Multiprogramming in a Hard-Real-Time Environment", by: "C. L. Liu et al.", year: 1973, url: "https://doi.org/10.1145/321738.321743", kind: "paper" },
                { title: "Priority Inheritance Protocols: An Approach to Real-Time Synchronization", by: "L. Sha et al.", year: 1990, url: "https://doi.org/10.1109/12.57058", kind: "paper" },
                { title: "FreeRTOS mutexes", by: "FreeRTOS", url: "https://www.freertos.org/Real-time-embedded-RTOS-mutexes.html", kind: "doc" },
                { title: "FreeRTOS direct to task notifications", by: "FreeRTOS", url: "https://www.freertos.org/Documentation/02-Kernel/02-Kernel-features/03-Direct-to-task-notifications/01-Task-notifications", kind: "doc" }
            ]
        },
        {
            id: "power",
            title: "저전력과 부트로더",
            level: 3,
            mins: 14,
            key: [
                "할 일 없으면 `WFI` · 깨어날 이유(인터럽트)만 남김",
                "Sleep < Stop < Standby: 깊을수록 전류↓, 복귀(wake-up)↓",
                "부트로더(bootloader): 새 펌웨어 **검증**(verification) 후 점프",
                "A/B 슬롯 + 롤백(rollback) = 업데이트 실패에도 벽돌(bricking) 방지"
            ],
            concepts: [
                { term: "Sleep", def: "CPU 클럭만 정지 · 주변장치 동작 · µs 복귀" },
                { term: "Stop", def: "대부분 클럭 정지, SRAM 유지 · µA 수준" },
                { term: "Standby", def: "SRAM 도 소실 · 리셋처럼 재시작 · 수백 nA" },
                { term: "VTOR", en: "Vector Table Offset Register", def: "벡터 테이블 위치 레지스터 · 앱 주소로 옮겨야 ISR 동작" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "rst", label: "리셋", x: 0, y: 0 },
                    { id: "bl", label: "부트로더", sub: "0x0800_0000", x: 1, y: 0 },
                    { id: "chk", label: "서명 검증", sub: "SHA-256 + ECDSA", x: 2, y: 0 },
                    { id: "app", label: "앱 A/B", sub: "0x0801_0000", x: 3, y: 0 },
                    { id: "dfu", label: "DFU / 복구", sub: "UART·USB·OTA", x: 2, y: 1 },
                    { id: "roll", label: "이전 슬롯", sub: "rollback", x: 3, y: 1 }
                ],
                edges: [
                    { from: "rst", to: "bl" },
                    { from: "bl", to: "chk" },
                    { from: "chk", to: "app", label: "OK" },
                    { from: "chk", to: "dfu", label: "FAIL" },
                    { from: "chk", to: "roll", label: "새 슬롯 실패" },
                    { from: "dfu", to: "bl", label: "재부팅", arc: "down" }
                ],
                steps: [
                    { on: ["rst", "rst>bl", "bl"], text: "항상 부트로더가 먼저 실행 · 쓰기 보호(write-protected) 영역" },
                    { on: ["bl>chk", "chk"], text: "앱 이미지 해시·서명 검증(signature verification) · 버전 확인(롤백 방지)" },
                    { on: ["chk>app", "app"], text: "통과 → MSP·VTOR 설정 후 앱 리셋 핸들러(reset handler)로 점프" },
                    { on: ["chk>roll", "roll"], text: "새 슬롯이 부팅 확인(boot confirmation) 못 받음 → 이전 슬롯으로" },
                    { on: ["chk>dfu", "dfu"], text: "둘 다 실패 → 복구 모드(recovery mode)에서 새 이미지 수신" },
                    { on: ["dfu>bl", "bl"], text: "수신 완료 → 재부팅해 다시 검증" }
                ]
            },
            code: [
                {
                    lang: "c",
                    title: "부트로더 → 앱 점프",
                    src: `#define APP_ADDR 0x08010000u

void jump_to_app(void) {
    uint32_t sp    = *(volatile uint32_t *)(APP_ADDR + 0);
    uint32_t reset = *(volatile uint32_t *)(APP_ADDR + 4);
    __disable_irq();
    SysTick->CTRL = 0;                    // 부트로더가 켠 것 정리
    for (int i = 0; i < 8; i++) NVIC->ICER[i] = 0xFFFFFFFF;
    SCB->VTOR = APP_ADDR;                 // 벡터 테이블 이동
    __set_MSP(sp);
    __enable_irq();
    ((void (*)(void))reset)();            // 돌아오지 않음
}`,
                    note: "앱 링커 스크립트(linker script) FLASH ORIGIN 도 0x08010000 으로 맞춰야 함"
                },
                {
                    lang: "c",
                    title: "이벤트 구동 메인 루프",
                    src: `for (;;) {
    while (has_work()) do_work();
    __WFI();             // 다음 인터럽트까지 Sleep
}`
                }
            ],
            optimize: [
                {
                    title: "바쁜 대기(busy waiting) → 타이머 + WFI",
                    before: { lang: "c", src: `for (;;) {
    read_sensor();
    for (volatile int i = 0; i < 800000; i++);  // ~100 ms, 내내 RUN
}   // ≈ 10 mA` },
                    after: { lang: "c", src: `// RTC wakeup 100 ms
for (;;) {
    read_sensor();
    HAL_PWR_EnterSTOPMode(PWR_LOWPOWERREGULATOR_ON, PWR_STOPENTRY_WFI);
    SystemClock_Config();      // Stop 후 클럭 복구
}   // 평균 ≈ 20 µA` },
                    gain: "전류 ~500× 감소"
                },
                {
                    title: "안 쓰는 주변장치 클럭(peripheral clock) 끄기",
                    before: { lang: "c", src: `RCC->AHB1ENR = 0xFFFFFFFF;   // 전부 켜둠 (편하지만 누설)` },
                    after: { lang: "c", src: `RCC->AHB1ENR = RCC_AHB1ENR_GPIOAEN;   // 필요한 것만
// 사용 후: RCC->APB1ENR &= ~RCC_APB1ENR_TIM3EN;` },
                    gain: "RUN 전류 −10~30%"
                }
            ],
            glossary: [
                { term: "WFI", en: "Wait For Interrupt", def: "인터럽트가 올 때까지 CPU 를 재우는 명령" },
                { term: "부트로더", en: "Bootloader", def: "앱 전에 실행되어 검증·업데이트·점프를 담당" },
                { term: "OTA", en: "Over-The-Air", def: "무선으로 펌웨어를 받아 업데이트" },
                { term: "Secure Boot", en: "Secure boot", def: "서명된 이미지만 실행하도록 체인 검증" },
                { term: "브라운아웃", en: "Brown-out reset", def: "전압 강하 시 오동작 대신 리셋시키는 보호 회로" }
            ],
            quiz: [
                { q: "Standby 모드에서 깨어나면?", options: ["멈춘 다음 줄부터 계속", "리셋처럼 처음부터 · SRAM 소실", "Sleep 과 동일", "부트로더 건너뜀"], a: 1, why: "백업 레지스터 외 상태 소실 · 리셋 경로로 재시작" },
                { q: "앱으로 점프 전 VTOR 을 바꾸는 이유는?", options: ["속도", "앱의 ISR 이 호출되도록", "Flash 보호", "스택 크기"], a: 1, why: "안 바꾸면 인터럽트가 부트로더 벡터로 감" },
                { q: "A/B 슬롯 업데이트의 핵심 장점은?", options: ["Flash 절약", "업데이트 실패 시 이전 이미지로 부팅", "부팅 속도", "암호화 불필요"], a: 1, why: "쓰는 중 전원 차단에도 동작하는 이미지가 남음" },
                { q: "Stop 모드 복귀 후 흔히 필요한 작업은?", options: ["SRAM 복원", "시스템 클럭(PLL) 재설정", "Flash 지우기", "벡터 테이블 복사"], a: 1, why: "복귀 시 내부 저속 클럭으로 시작하는 경우가 많음" }
            ],
            refs: [
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" },
                { title: "Bootloader (MCUboot design)", by: "MCUboot project", url: "https://docs.mcuboot.com/design.html", kind: "doc" },
                { title: "A Firmware Update Architecture for Internet of Things (RFC 9019)", by: "B. Moran et al.", year: 2021, url: "https://www.rfc-editor.org/rfc/rfc9019", kind: "spec" }
            ]
        }
    ]
});
