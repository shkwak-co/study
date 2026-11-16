LAB.track({
    id: "embedded",
    name: "임베디드",
    icon: "⚙",
    color: "#22d3ee",
    tagline: "레지스터, 인터럽트, 타이머, RTOS. 칩 안에서 실제로 무슨 일이 일어나는지",
    trends: [
        {
            title: "RISC-V MCU, 차량용까지",
            when: "2023–2026",
            points: [
                "ESP32-P4(2023) 등 RISC-V MCU 확산 · 툴체인(toolchain)은 GCC/LLVM 공용",
                "Infineon AURIX RC1 (2026-11): 회사 첫 RISC-V 차량용 MCU 플랫폼",
                "최대 32bit 코어 12개 + 엣지 AI 가속 + 내장 메모리 40 MB · Arm Cortex-M 독점 구도 약화"
            ],
            refs: [
                { title: "Infineon redefines real-time compute and control for software-defined vehicles and Physical AI with new AURIX RC1", by: "Infineon Technologies", year: 2026, url: "https://www.infineon.com/press-release/2026/infpr202611-026", kind: "doc" },
                { title: "Espressif Reveals ESP32-P4: A High-Performance MCU with Numerous IO-Connectivity and Security Features", by: "Espressif Systems", year: 2023, url: "https://www.espressif.com/en/news/ESP32-P4", kind: "doc" }
            ]
        },
        {
            title: "MCU 안의 NPU · 엣지 AI(edge AI)",
            when: "2024–2026",
            points: [
                "Arm `Ethos-U85`, NXP `eIQ Neutron`, TI `TinyEngine` 등 MCU 내장 NPU",
                "TI `MSPM0G5187` (2026): 80 MHz Cortex-M0+ 에 2.56 GOPS NPU · 저가 MCU 까지 내려옴",
                "INT8 양자화(quantization) 모델을 센서 옆에서 실행 → 전송 데이터와 지연(latency) 감소"
            ],
            refs: [
                { title: "Arm Ethos-U85: Addressing the High Performance Demands of IoT in the Age of AI", by: "Arm", year: 2024, url: "https://newsroom.arm.com/blog/ethos-u85", kind: "doc" },
                { title: "eIQ Neutron Neural Processing Unit (NPU)", by: "NXP Semiconductors", url: "https://www.nxp.com/applications/technologies/ai-and-machine-learning/eiq-neutron-npu:EIQ-NEUTRON-NPU", kind: "doc" },
                { title: "MSPM0G5187: 80MHz Arm Cortex-M0+ MCU with 128kB flash, 32kB SRAM, USB 2.0 FS, I2S, ADC and TinyEngine NPU", by: "Texas Instruments", url: "https://www.ti.com/product/MSPM0G5187", kind: "doc" }
            ]
        },
        {
            title: "Zephyr 반기 릴리스 · Rust",
            when: "2025–2026",
            points: [
                "Zephyr 4.4 (2026-04): 4월·10월 반기 릴리스(bi-yearly release)의 첫 버전 · 최소 C 표준 C17",
                "Zephyr 의 Rust 는 `zephyr-lang-rust` 모듈 + `CONFIG_RUST` · 지원 보드는 아직 일부",
                "`embassy` async Rust: 커널 문맥 전환 없이 단일 스택 협력형 태스크(cooperative tasks)",
                "안전 인증(safety certification)용 Rust 툴체인 Ferrocene"
            ],
            refs: [
                { title: "Zephyr RTOS 4.4 Now Available: WireGuard, Wi-Fi Direct, OpenRISC, and More", by: "Zephyr Project", year: 2026, url: "https://www.zephyrproject.org/zephyr-rtos-4-4-now-available-wireguard-wi-fi-direct-openrisc-and-more/", kind: "doc" },
                { title: "Rust Language Support", by: "Zephyr Project", url: "https://docs.zephyrproject.org/latest/develop/languages/rust/index.html", kind: "doc" },
                { title: "Embassy", by: "Embassy project", url: "https://embassy.dev/", kind: "doc" },
                { title: "Officially Qualified - Ferrocene", by: "Ferrous Systems", year: 2023, url: "https://ferrous-systems.com/blog/officially-qualified-ferrocene/", kind: "doc" }
            ]
        },
        {
            title: "보안 규제(security regulation)와 OTA",
            when: "2026–2027",
            points: [
                "EU CRA: 2026-09-11 부터 악용된 취약점 보고(vulnerability reporting) 의무 시행 중",
                "2026-07 EC 제조사용 실무 가이드 발행 · 2027-12-11 본격 적용",
                "Secure Boot · 서명된 펌웨어(signed firmware) · A/B OTA + 롤백 보호(rollback protection)가 기본 설계로"
            ],
            refs: [
                { title: "Cyber Resilience Act", by: "European Commission", url: "https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act", kind: "doc" },
                { title: "A Firmware Update Architecture for Internet of Things (RFC 9019)", by: "B. Moran et al.", year: 2021, url: "https://www.rfc-editor.org/rfc/rfc9019", kind: "spec" }
            ]
        }
    ],
    lessons: [
        {
            id: "mcu",
            title: "MCU 구조와 메모리맵",
            level: 1,
            mins: 12,
            pre: ["memory/mem-layout"],
            checked: "2026-11-16",
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
                    { on: ["vt>rh", "rh"], text: "PC = `Reset_Handler` 주소 · 시작 코드(startup code)가 `SystemInit()`(FPU·VTOR)부터" },
                    { on: ["rh>data", "data"], text: "`.data` 초기값을 Flash에서 SRAM으로 복사" },
                    { on: ["data>bss", "bss"], text: "`.bss` 영역을 0으로 채움" },
                    { on: ["bss>main", "main"], text: "`main()` 진입 · PLL 클럭 설정(clock configuration)은 보통 `main` 첫머리에서" }
                ]
            },
            code: [
                {
                    lang: "c",
                    title: "startup.c (요약)",
                    src: `extern uint32_t _sidata, _sdata, _edata, _sbss, _ebss, _estack;
int main(void);

void Reset_Handler(void) {
    SystemInit();                          // FPU 권한·VTOR (ST 순서: 복사 전)
    uint32_t *src = &_sidata;              // .data 초기값 (Flash)
    for (uint32_t *dst = &_sdata; dst < &_edata; )
        *dst++ = *src++;                   // Flash -> SRAM
    for (uint32_t *dst = &_sbss; dst < &_ebss; )
        *dst++ = 0;                        // .bss = 0
    main();                                // PLL 설정은 main 의 SystemClock_Config()
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
_estack = ORIGIN(RAM) + LENGTH(RAM);     /* 스택은 RAM 끝에서 아래로 */
SECTIONS {
    .isr_vector : { KEEP(*(.isr_vector)) } > FLASH
    .text       : { *(.text*) *(.rodata*) } > FLASH
    .data       : { _sdata = .; *(.data*); _edata = .; } > RAM AT > FLASH
    _sidata = LOADADDR(.data);             /* .data 원본의 Flash 주소 */
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
                    gain: "Flash 대기 상태 제거"
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
                { q: "Cortex-M 리셋 직후 CPU가 벡터 테이블에서 처음 읽는 두 값은?", options: ["초기 MSP 값, 리셋 벡터", "리셋 벡터, NMI 핸들러 주소", "`main` 주소, 초기 MSP 값", "클럭 설정값, 스택 크기"], a: 0, why: "0번 워드 = MSP 초기값, 1번 = 리셋 벡터 · NMI 는 2번 엔트리라 NMI 때만 읽음 · `main` 은 시작 코드가 부름" },
                { q: "전역 `int count = 5;` 의 초기값 5 는 전원이 꺼져 있을 때 어디에 있나?", options: ["SRAM 의 `.data` 영역", "Flash 의 `.data` 원본", "SRAM 의 `.bss` 영역", "Flash 의 `.rodata` 영역"], a: 1, why: "꺼져도 남아야 하니 Flash(LMA) · 부팅 때 SRAM(VMA)으로 복사 · `.rodata` 는 `const` 일 때" },
                { q: "`static int buf[1024];` 는 어느 섹션?", options: [".text", ".rodata", ".data", ".bss"], a: 3, why: "초기값 없는 정적 변수 → `.bss` (부팅 시 0) · `.data` 는 0 아닌 초기값이 있을 때" },
                { q: "Cortex-M 에서 주변장치 레지스터에 접근하는 방법은?", options: ["전용 `IN`/`OUT` 명령", "주소에 일반 `LDR`/`STR`", "DMA 를 거쳐서만", "`SVC` 로 커널에 요청"], a: 1, why: "메모리맵 I/O · 레지스터도 주소 공간의 한 칸 · `IN`/`OUT` 은 x86 의 별도 I/O 공간" },
                { type: "num", q: "`arm-none-eabi-size` 가 text 24000, data 400, bss 6000 을 보이면 Flash 사용량(바이트)은?", answer: 24400, unit: "B", why: "Flash = text + data(`.data` 원본) · bss 는 SRAM 만 차지 · 정적 SRAM 은 data + bss = 6400" },
                { type: "num", q: "STM32F407 을 HCLK 168 MHz 로 돌릴 때 Flash LATENCY(대기 상태 수)는? (30 MHz 마다 +1)", answer: 5, why: "CMSIS 헤더 기준 150 MHz 초과 → 5 WS · 한 번 읽는 데 6 사이클 · ST 예제 설정도 5" },
                { type: "text", q: "벡터 테이블이 아래와 같다. `Reset_Handler` 첫 명령이 놓인 실제 주소는?", code: { lang: "c", src: "const uint32_t vectors[] = {\n    0x20020000,   /* 0: 초기 MSP  */\n    0x080001C5,   /* 1: 리셋 벡터 */\n};" }, answer: ["0x080001C4", "0x80001C4", "134218180"], why: "bit 0 = 1 은 Thumb 상태 표시일 뿐 · 실제 주소는 bit 0 을 뺀 `0x080001C4`" },
                { type: "order", q: "리셋에서 `main()` 까지 순서 (ST 시작 파일 기준)", items: ["SP ← 벡터 0번 워드", "PC ← 벡터 1번 워드", "`SystemInit()` (FPU·VTOR)", "`.data` 복사 (Flash → SRAM)", "`.bss` 0 채움", "`main()` 호출"], why: "앞 둘은 하드웨어 · ST `startup_*.s` 는 `SystemInit` 을 복사 전에 부르고, 생성자(`__libc_init_array`) 뒤 `main`" }
            ],
            refs: [
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" },
                { title: "Linker Scripts", by: "GNU Binutils", url: "https://sourceware.org/binutils/docs/ld/Scripts.html", kind: "doc" },
                { title: "STM32CubeF4 CMSIS Device (stm32f4xx headers, startup, system)", by: "STMicroelectronics", url: "https://github.com/STMicroelectronics/cmsis-device-f4", kind: "doc" }
            ]
        },
        {
            id: "gpio",
            title: "GPIO와 레지스터 비트 조작",
            level: 1,
            mins: 12,
            pre: ["embedded/mcu"],
            checked: "2026-11-16",
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
                    title: "RMW 경쟁 제거: `ODR |=` 대신 `BSRR`",
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
                { q: "PA5 만 끄는 코드는?", options: ["`ODR &= (1u << 5);`", "`ODR &= ~(1u << 5);`", "`ODR |= ~(1u << 5);`", "`ODR ^= (1u << 5);`"], a: 1, why: "`~(1u << 5)` 는 5번만 0 → AND 로 그 비트만 끔 · `^=` 는 끄기가 아니라 뒤집기, `&= (1u << 5)` 는 다른 핀을 다 끔" },
                { q: "레지스터 포인터에 `volatile` 이 필요한 이유는?", options: ["읽기·쓰기를 원자적으로 하려고", "접근을 빼거나 합치지 못하게", "레지스터를 캐시에서 빼려고", "인터럽트를 잠깐 막으려고"], a: 1, why: "volatile 은 접근을 그대로 남길 뿐 · 원자성·캐시 제외·인터럽트 차단은 주지 않음" },
                { q: "I2C 버스 핀 설정으로 맞는 것은?", options: ["Push-pull + 풀업", "Open-drain + 풀업", "Open-drain, 풀업 없음", "Push-pull + 풀다운"], a: 1, why: "여러 장치가 Low 만 당기는 wired-AND · High 는 풀업이 만듦 · push-pull 끼리 반대로 구동하면 단락" },
                { q: "MODER 에서 핀 하나에 할당된 비트 수는?", options: ["1", "2", "4", "8"], a: 1, why: "00 입력 · 01 출력 · 10 대체 기능 · 11 아날로그 · 핀당 4bit 는 AFR" },
                { type: "text", q: "실행 후 `moder` 값은? (16진)", code: { lang: "c", src: "uint32_t moder = 0xA8000000;\nmoder &= ~(0x3u << (5 * 2));\nmoder |=  (0x1u << (5 * 2));" }, answer: ["0xA8000400", "2818573312"], why: "PA5 필드는 bit 11:10 · 비운 뒤 01 → `0x400` 만 더해짐 · 다른 핀 비트는 그대로" },
                { type: "text", q: "ODR 이 `0x0020` 일 때 아래를 실행하면 ODR 은? (16진)", code: { lang: "c", src: "GPIOA->BSRR = (1u << 3) | (1u << (5 + 16));" }, answer: ["0x0008", "0x8", "8"], why: "하위 bit 3 → PA3 set · 상위 bit 21 → PA5 reset · 0 인 비트는 아무것도 안 바꿈" },
                { type: "num", q: "Cortex-M4 비트밴딩: GPIOA ODR(`0x40020014`) bit 5 의 별칭 주소는? (16진 입력 가능)", answer: 0x42400294, why: "`0x42000000 + 0x20014 × 32 + 5 × 4` = `0x42400294` · 이 주소에 1 을 쓰면 그 비트만 set" },
                { type: "order", q: "PA5 를 출력으로 설정하고 켜는 순서", items: ["RCC 에서 GPIOA 클럭 켜기", "MODER 의 PA5 필드 비우기", "MODER 에 01(출력) 넣기", "BSRR 로 PA5 set"], why: "클럭 전엔 쓰기가 무시됨 · 필드는 비우고 넣기 · 출력 모드가 된 뒤에야 핀이 움직임" }
            ],
            refs: [
                { title: "Programming languages — C (ISO/IEC 9899:201x, Committee Draft N1570)", by: "ISO/IEC JTC1/SC22/WG14", year: 2011, url: "https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf", kind: "spec" },
                { title: "CMSIS-Core (Cortex-M): Overview", by: "Arm", url: "https://arm-software.github.io/CMSIS_6/latest/Core/index.html", kind: "doc" },
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" },
                { title: "STM32CubeF4 HAL and LL drivers (stm32f4xx-hal-driver)", by: "STMicroelectronics", url: "https://github.com/STMicroelectronics/stm32f4xx-hal-driver", kind: "doc" }
            ]
        },
        {
            id: "bits",
            title: "비트 연산과 2의 보수",
            level: 1,
            mins: 14,
            checked: "2026-11-16",
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
                { q: "부호 있는 8bit 100 + 100 에서 켜지는 플래그는?", options: ["C 와 V", "V 와 N", "C 와 N", "N 만"], a: 1, why: "결과 `0xC8` = −56 · 양수 + 양수 → 음수라 V, 최상위 비트 1 이라 N · 200 < 256 이라 C 는 0" },
                { q: "`x & (x - 1)` 이 하는 일은?", options: ["가장 높은 1 비트 끄기", "가장 낮은 1 비트 끄기", "모든 비트 반전", "x 를 절반으로"], a: 1, why: "x − 1 은 가장 낮은 1 과 그 아래를 뒤집음 → AND 로 그 1 만 사라짐" },
                { q: "`int8_t x = -8;` 일 때 GCC 에서 `x >> 1` 은?", options: ["-4", "124", "4", "컴파일 오류"], a: 0, why: "GCC 는 부호 있는 `>>` 를 산술 시프트(부호 확장)로 정의 · 124 는 8bit 논리 시프트 결과 · 표준상으론 구현 정의" },
                { type: "text", q: "출력은? (`int` 32bit)", code: { lang: "c", src: "uint8_t x = 0x0F;\nprintf(\"%d\", ~x == 0xF0);" }, answer: ["0"], why: "`x` 가 `int` 로 승격 → `~x` = `0xFFFFFFF0`(−16) ≠ 240 · `(uint8_t)~x == 0xF0` 이어야 1" },
                { type: "text", q: "GCC 에서 출력은?", code: { lang: "c", src: "int a = -7;\nprintf(\"%d %d\", a >> 1, a / 2);" }, answer: ["-4 -3", "-4,-3"], why: "산술 시프트는 음의 무한대 쪽으로 내림(−4) · C 나눗셈은 0 쪽으로 자름(−3)" },
                { type: "num", q: "위 매크로로 `FIELD_GET(0x0000A400, 2, 10)` 의 값은?", answer: 1, why: "`0xA400 >> 10` = `0x29` → 하위 2bit `01` = 1" },
                { type: "text", q: "실행 후 `reg` 는? (16진)", code: { lang: "c", src: "uint32_t reg = 0xFFFFFFFF;\nFIELD_SET(reg, 2, 10, 0x2);" }, answer: ["0xFFFFFBFF", "4294966271"], why: "bit 11:10 을 비우면 `…F3FF` · `10b` 를 넣어 bit 11 만 다시 1 → `0xFFFFFBFF`" }
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
            pre: ["embedded/mcu", "data-structures/ds-ring"],
            checked: "2026-11-16",
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
                { term: "인터럽트 지연", en: "Interrupt latency", def: "이벤트 → ISR 첫 명령까지 · Cortex-M4 최대 12 사이클 (0 대기 상태 메모리)" }
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
                { q: "Cortex-M 에서 더 높은 우선순위는?", options: ["우선순위 값 15", "우선순위 값 0", "IRQ 번호가 큰 쪽", "IRQ 번호가 작은 쪽"], a: 1, why: "값이 작을수록 높음 · IRQ 번호는 같은 우선순위가 동시에 대기할 때만 순서를 정함" },
                { q: "ISR 에서 상태 플래그를 지우지 않으면?", options: ["다음 이벤트까지 무시됨", "ISR 이 반복 재진입", "HardFault 가 즉시 발생", "NVIC 가 IRQ 를 끔"], a: 1, why: "플래그가 남아 IRQ 가 계속 pending → 복귀 직후 다시 진입 · 폴트나 자동 비활성은 없음" },
                { q: "ISR 안에서 피해야 할 것은?", options: ["상태 플래그 클리어", "링 버퍼에 1바이트 넣기", "`printf` 로 로그 출력", "`volatile` 플래그 세우기"], a: 2, why: "`printf` 는 느리고 블로킹·재진입 문제가 있음 · 나머지는 수십 사이클짜리 정석 작업" },
                { q: "예외 진입 때 하드웨어가 자동 저장하지 않는 것은?", options: ["R12", "xPSR", "R4–R11", "R0–R3, LR"], a: 2, why: "자동 저장은 caller-saved 8개 · R4–R11 은 callee-saved 라 ISR 이 쓸 때만 컴파일러가 저장" },
                { q: "Tail-chaining 이 건너뛰는 것은?", options: ["복원 후 다시 저장하는 일", "중첩된 ISR 의 최대 개수", "우선순위 역전 대기 시간", "ISR 이 쓰는 스택 크기"], a: 0, why: "대기 ISR 이 있으면 언스태킹·재스태킹 없이 바로 진입 · Cortex-M4 에서 6 사이클" },
                { type: "num", q: "`__NVIC_PRIO_BITS = 4` 칩에서 `NVIC_SetPriority(TIM2_IRQn, 5)` 가 IPR 바이트에 쓰는 값은? (10진 또는 0x)", answer: 80, why: "구현 비트는 상위 니블 → `5 << (8 − 4)` = `0x50` = 80" },
                { type: "num", q: "115200 baud, 8N1 UART 의 바이트 간격은 몇 µs?", answer: 86.8, tol: 0.1, unit: "µs", why: "시작 + 데이터 8 + 정지 = 10bit · 10 / 115200 s ≈ 86.8 µs · FIFO 가 없으면 이 안에 DR 을 읽어야 함" },
                { type: "num", q: "Cortex-M4F 에서 FPU 문맥까지 쌓는 예외 프레임은 몇 바이트?", answer: 104, unit: "B", why: "기본 8워드 + S0–S15 · FPSCR · 예약 1워드 = 26워드 × 4 B" },
                { type: "order", q: "타이머 오버플로에서 ISR 첫 명령까지 순서", items: ["주변장치 플래그 set (UIF)", "NVIC 에서 pending", "현재 실행 우선순위와 비교", "8워드 스태킹 + 벡터 읽기", "LR ← EXC_RETURN, ISR 시작"], why: "플래그 → pending → 선점 판단 → 하드웨어 진입 · 스태킹과 벡터 인출은 병렬로 진행" }
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
            pre: ["embedded/gpio"],
            checked: "2026-11-16",
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
                { q: "72 MHz, PSC=71, ARR=999 일 때 PWM 주파수는?", options: ["72 kHz", "1 kHz", "100 Hz", "10 kHz"], a: 1, why: "72e6 / ((71+1) × (999+1)) = 1000 Hz · `+1` 을 빼고 계산하면 값이 어긋남" },
                { q: "ARR=999, CCR=250 이면 듀티는? (PWM 모드 1)", options: ["25 %", "2.5 %", "75 %", "25.03 %"], a: 0, why: "250 / (999+1) = 25 % · ARR 로 나누면 25.03 % 로 틀림 · 75 % 는 PWM 모드 2" },
                { q: "같은 타이머 클럭에서 PWM 주파수를 높이면 분해능은?", options: ["높아짐", "낮아짐", "그대로", "PSC 만 바뀜"], a: 1, why: "한 주기 카운트(ARR+1)가 줄어 나눌 단계가 줄어듦" },
                { q: "모터 PWM 을 20 kHz 이상으로 쓰는 주된 이유는?", options: ["스위칭 손실 감소", "가청 소음 회피", "분해능 향상", "EMI 감소"], a: 1, why: "사람 가청 대역(≈20 kHz) 밖으로 · 주파수를 올리면 스위칭 손실은 늘고 분해능은 줄어듦" },
                { type: "num", q: "타이머 클럭 84 MHz, PSC=0 으로 20 kHz PWM 을 만들 ARR 값은?", answer: 4199, why: "84e6 / 20e3 = 4200 카운트 → ARR = 4200 − 1" },
                { type: "num", q: "STM32F407 168 MHz, APB1 분주 4 (PCLK1 = 42 MHz) 일 때 TIM3 클럭(MHz)은?", answer: 84, unit: "MHz", why: "APB 분주가 1 이 아니면 타이머 클럭 = PCLK × 2 · 42 MHz 로 계산하면 주파수가 정확히 2배로 나옴" },
                { type: "text", q: "ARR=4199 일 때 `pwm_set_permille(333)` 이 CCR1 에 쓰는 값은?", code: { lang: "c", src: "TIM3->CCR1 = (uint32_t)(TIM3->ARR + 1) * pm / 1000;" }, answer: ["1398"], why: "4200 × 333 = 1,398,600 → 정수 나눗셈 ÷1000 → 1398 (소수 버림)" },
                { type: "order", q: "preload 를 켠 채 실행 중 CCR1 을 바꿨을 때 일어나는 순서", items: ["CCR1(preload)에 새 값 쓰기", "카운터가 ARR 에 도달", "업데이트 이벤트(UEV)", "shadow 레지스터로 복사", "다음 주기부터 새 듀티"], why: "preload 는 주기 경계에서만 반영 → 한 주기 안에 펄스가 둘 생기는 글리치가 없음" }
            ],
            refs: [
                { title: "Pulse Width Modulation (PWM)", by: "Zephyr Project", url: "https://docs.zephyrproject.org/latest/hardware/peripherals/pwm.html", kind: "doc" },
                { title: "Using PWM Output as a Digital-to-Analog Converter on a TMS320F280x Digital Signal Controller", by: "D. M. Alter", year: 2008, url: "https://www.ti.com/lit/an/spraa88a/spraa88a.pdf", kind: "doc" },
                { title: "STM32CubeF4 HAL and LL drivers (stm32f4xx-hal-driver)", by: "STMicroelectronics", url: "https://github.com/STMicroelectronics/stm32f4xx-hal-driver", kind: "doc" }
            ]
        },
        {
            id: "adc",
            title: "ADC와 DMA",
            level: 2,
            mins: 14,
            pre: ["embedded/irq", "embedded/pwm"],
            checked: "2026-11-16",
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
                    src: `float mv = raw * 3300.0f / 4095.0f;    // 12bit, Vref 3.3V`,
                    note: "ST LL 매크로(`__LL_ADC_CALC_DATA_TO_VOLTAGE`)처럼 최대 코드 4095 로 나눔 · LSB 정의(÷4096)와 차이는 0.02%"
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
                    gain: "CPU 대기 0 · 샘플 간격은 하드웨어가 고정"
                },
                {
                    title: "평균: 나눗셈(division) 대신 시프트 · 오버샘플링(oversampling)",
                    before: { lang: "c", src: `uint32_t sum = 0;
for (int i = 0; i < 10; i++) sum += buf[i];
avg = sum / 10;                 // 나눗셈 (코어에 따라 라이브러리 호출)` },
                    after: { lang: "c", src: `uint32_t sum = 0;
for (int i = 0; i < 16; i++) sum += buf[i];
avg = sum >> 4;                 // 16개 = 2^4 · 시프트 1 사이클` },
                    gain: "나눗셈 → 시프트 1개",
                    note: "하드웨어 나눗셈이 없는 코어에선 `/` 가 라이브러리 호출 · 상수 ÷10 은 컴파일러가 역수 곱셈으로 바꾸기도 함 · 2ⁿ 개 평균이면 시프트 하나"
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
                { q: "12bit, Vref=3.3V 의 LSB 는 약?", options: ["0.8 mV", "3.2 mV", "1.6 mV", "0.08 mV"], a: 0, why: "3.3 / 4096 ≈ 0.806 mV · 1.6 mV 는 11bit, 3.2 mV 는 10bit 의 값" },
                { q: "1 kHz 신호를 샘플링할 최소 주파수(이론)는?", options: ["1 kHz 초과", "2 kHz 초과", "2 kHz 이상", "10 kHz 이상"], a: 1, why: "샘플링 정리: 2배 '초과' · 정확히 2배면 위상에 따라 0 만 찍힐 수 있음 · 실무는 5–10배 + 필터" },
                { q: "DMA 반완료(half-transfer) 인터럽트에서 할 일은?", options: ["전송 에러 처리", "앞 절반 처리 시작", "뒤 절반 처리 시작", "DMA 일시 정지"], a: 1, why: "반완료 = 앞 절반이 참 · DMA 는 지금 뒤 절반을 채우는 중이라 뒤쪽은 아직 건드리면 안 됨" },
                { q: "분해능 1bit 증가 시 이상적 SQNR 은?", options: ["약 1 dB", "약 3 dB", "약 6 dB", "약 12 dB"], a: 2, why: "SQNR ≈ 6.02n + 1.76 dB · 3 dB 는 전력이 2배일 때의 차이" },
                { type: "num", q: "10bit ADC, Vref = 3.3 V 의 LSB 는 몇 mV?", answer: 3.22, tol: 0.01, unit: "mV", why: "3.3 V / 2¹⁰ = 3.3 / 1024 ≈ 3.22 mV" },
                { type: "num", q: "f_s = 1 kHz 로 900 Hz 사인파를 샘플링하면 몇 Hz 로 보이나?", answer: 100, unit: "Hz", why: "나이퀴스트 500 Hz 위 성분은 접힘 · |900 − 1000| = 100 Hz" },
                { type: "text", q: "결과 `raw` 는? (이상적 12bit 변환)", code: { lang: "c", src: "uint16_t raw = (uint16_t)(1.0f / 3.3f * 4096);" }, answer: ["1241", "0x4D9"], why: "1.0 / 3.3 × 4096 ≈ 1241.2 → 버림 1241 · SAR 이 12단계 비교로 얻는 코드와 같음" },
                { type: "num", q: "잡음이 충분할 때 12bit ADC 를 오버샘플링으로 14bit 로 만들려면 몇 샘플을 더해야 하나?", answer: 16, why: "1bit 마다 4배 → 4² = 16개를 더하고 2bit 오른쪽 시프트" }
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
            pre: ["embedded/irq"],
            checked: "2026-11-16",
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
        xTaskDelayUntil(&last, pdMS_TO_TICKS(5));  // 정확히 5 ms 주기
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
                    note: "`vTaskDelay` 는 상대 지연(relative delay)이라 주기 누적 오차(drift) · 주기 작업은 `xTaskDelayUntil` (옛 이름 `vTaskDelayUntil`)"
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
                { q: "주기 태스크에 `vTaskDelay` 대신 `xTaskDelayUntil` 을 쓰는 이유는?", options: ["Blocked 동안 CPU 를 안 써서", "본문 시간이 주기에 안 더해져서", "우선순위가 잠시 올라가서", "tick 인터럽트가 줄어서"], a: 1, why: "둘 다 Blocked 동안 CPU 0 · 차이는 기준: 절대 시각까지 기다려 실행 시간이 주기에 누적되지 않음" },
                { q: "우선순위 역전을 완화하는 것은?", options: ["바이너리 세마포어", "상속 있는 뮤텍스", "카운팅 세마포어", "더 긴 time slice"], a: 1, why: "뮤텍스는 소유자가 있어 우선순위 상속 가능 · 세마포어는 소유자가 없어 상속이 없음" },
                { q: "U = 0.2 + 0.3 + 0.35 = 0.85 인 태스크 3개 (RMS 한계 ≈ 0.78) 는?", options: ["반드시 마감을 놓침", "RTA 로 따로 확인", "무조건 스케줄 가능", "EDF 로도 스케줄 불가"], a: 1, why: "이용률 한계는 충분조건일 뿐 · 넘어도 응답 시간 분석으로 가능할 수 있음 (이 예는 R3 = 17 ≤ 20) · EDF 는 U ≤ 1 이면 가능" },
                { q: "Blocked 상태의 태스크가 쓰는 CPU 는?", options: ["tick 마다 조금", "0", "50%", "우선순위에 비례"], a: 1, why: "이벤트/타임아웃 전엔 스케줄링 대상 아님 · 타임아웃 확인은 커널의 tick 처리가 함" },
                { type: "num", q: "32bit Cortex-M 에서 `xTaskCreate(f, \"t\", 256, …)` 가 잡는 스택은 몇 바이트?", answer: 1024, unit: "B", why: "스택 깊이는 바이트가 아니라 스택 폭(워드) 단위 · 256 × 4 B" },
                { type: "num", q: "본문이 1.2 ms 인 루프 끝에서 `vTaskDelay(pdMS_TO_TICKS(5))` 를 부르면 주기는 약 몇 ms?", answer: 6.2, tol: 0.05, unit: "ms", why: "상대 지연이라 본문 시간이 더해짐 · `xTaskDelayUntil` 이면 5 ms" },
                { type: "num", q: "RMS, (C, T) = (1, 5), (3, 10), (7, 20) ms 일 때 T3 의 최악 응답 시간 R3 (ms)?", answer: 17, unit: "ms", why: "R = 7 → 12 → 16 → 17 → 17 고정 · 7 + ⌈17/5⌉×1 + ⌈17/10⌉×3 = 17 ≤ 20" },
                { type: "order", q: "Cortex-M FreeRTOS 컨텍스트 스위치 순서", items: ["높은 우선순위 태스크가 Ready", "PendSV 를 pending 으로", "하드웨어가 8워드를 PSP 에 저장", "PendSV 가 R4–R11 저장, PSP → TCB", "다음 TCB 의 PSP 로 R4–R11 복원", "예외 복귀 → 새 태스크 실행"], why: "PendSV 는 최저 우선순위라 다른 ISR 이 다 끝난 뒤 실행 · 하드웨어 8워드 + 소프트웨어 R4–R11" }
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
            pre: ["embedded/mcu", "embedded/irq"],
            checked: "2026-11-16",
            key: [
                "할 일 없으면 `WFI` · 깨어날 이유(인터럽트)만 남김",
                "Sleep < Stop < Standby: 깊을수록 전류↓, 복귀 시간(wake-up time)↑, 잃는 상태↑",
                "부트로더(bootloader): 새 펌웨어 **검증**(verification) 후 점프",
                "A/B 슬롯 + 롤백(rollback) = 업데이트 실패에도 벽돌(bricking) 방지"
            ],
            concepts: [
                { term: "Sleep", def: "CPU 클럭만 정지 · 주변장치 동작 · 깨면 다음 명령부터 바로" },
                { term: "Stop", def: "코어 영역 클럭·PLL 정지, SRAM·레지스터 유지 · EXTI 로 깨어남" },
                { term: "Standby", def: "SRAM 소실(백업 영역만 유지) · 리셋처럼 재시작 · 전류 최소" },
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
    for (int i = 0; i < 8; i++) {
        NVIC->ICER[i] = 0xFFFFFFFF;       // enable 해제
        NVIC->ICPR[i] = 0xFFFFFFFF;       // pending 해제
    }
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
}   // 예: ≈ 10 mA` },
                    after: { lang: "c", src: `// RTC wakeup 100 ms
for (;;) {
    read_sensor();
    HAL_PWR_EnterSTOPMode(PWR_LOWPOWERREGULATOR_ON, PWR_STOPENTRY_WFI);
    SystemClock_Config();      // Stop 후 클럭 복구
}   // 예: 평균 ≈ 20 µA` },
                    gain: "평균 전류 ~500× 감소 (예시 수치)"
                },
                {
                    title: "안 쓰는 주변장치 클럭(peripheral clock) 끄기",
                    before: { lang: "c", src: `RCC->AHB1ENR = 0xFFFFFFFF;   // 전부 켜둠 (편하지만 누설)` },
                    after: { lang: "c", src: `RCC->AHB1ENR = RCC_AHB1ENR_GPIOAEN;   // 필요한 것만
// 사용 후: RCC->APB1ENR &= ~RCC_APB1ENR_TIM3EN;` },
                    gain: "끈 클럭만큼 RUN 전류 감소"
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
                { q: "STM32F4 가 Standby 에서 깨어나면?", options: ["`WFI` 다음 줄부터 계속", "리셋 경로로 처음부터", "Stop 처럼 PLL 만 재설정", "RTC 핸들러부터 실행"], a: 1, why: "SRAM·레지스터 소실(백업 영역 제외) → 리셋처럼 시작 · `WFI` 다음 줄부터 이어지는 건 Sleep·Stop" },
                { q: "앱으로 점프하기 전에 VTOR 을 바꾸는 이유는?", options: ["점프 속도를 높이려고", "앱 ISR 이 불리도록", "부트로더 영역을 보호하려고", "앱의 초기 스택을 잡으려고"], a: 1, why: "안 바꾸면 인터럽트가 부트로더 벡터로 감 · 초기 스택은 VTOR 이 아니라 MSP 로 설정" },
                { q: "A/B 슬롯 업데이트의 핵심 장점은?", options: ["Flash 를 절반만 씀", "이전 이미지로 복귀 가능", "서명 검증이 필요 없음", "부팅 시간이 짧아짐"], a: 1, why: "쓰는 중 전원이 끊겨도 동작하는 이미지가 남음 · Flash 는 오히려 2배 필요, 서명 검증은 그대로" },
                { q: "STM32F4 가 Stop 에서 깨어난 뒤 흔히 필요한 작업은?", options: ["SRAM 내용 복원", "PLL 클럭 재설정", "벡터 테이블 복사", "GPIO 다시 초기화"], a: 1, why: "Stop 은 SRAM·레지스터 유지 · 깨어날 때 HSI 16 MHz 가 시스템 클럭이라 PLL 을 다시 켬" },
                { type: "num", q: "1 s 마다 2 ms 동안 10 mA, 나머지 998 ms 는 5 µA 일 때 평균 전류(µA)?", answer: 25, tol: 0.1, unit: "µA", why: "(10 mA × 2 ms + 5 µA × 998 ms) / 1000 ms ≈ 20 + 5 = 25 µA · 활성 구간이 80%" },
                { type: "num", q: "IWDG: 분주 256 (PR=6), RLR=4095, LSI 32 kHz 일 때 타임아웃(s)?", answer: 32.77, tol: 0.02, unit: "s", why: "4 × 2⁶ × (4095 + 1) / 32000 = 32.768 s · 실제 LSI 는 편차가 커서 칩마다 다름" },
                { type: "num", q: "벡터 엔트리가 98개(STM32F407: 예외 16 + IRQ 82)일 때 VTOR 은 몇 바이트 경계에 맞춰야 하나?", answer: 512, unit: "B", why: "98 × 4 = 392 B → 다음 2의 거듭제곱 512 B (최소 32워드)" },
                { type: "order", q: "A/B 업데이트 순서", items: ["비활성 슬롯에 새 이미지 받기", "해시·서명 검증", "부팅 상태 = PENDING", "시험 부팅 (TESTING)", "자체 점검 후 CONFIRMED"], why: "검증 전엔 상태를 안 바꿈 · 확인 없이 리셋되면 부트로더가 이전 슬롯으로 롤백" }
            ],
            refs: [
                { title: "Cortex-M4 Devices Generic User Guide", by: "Arm", year: 2010, url: "https://documentation-service.arm.com/static/5f2ac4ab60a93e65927bbdbf", kind: "doc" },
                { title: "Bootloader (MCUboot design)", by: "MCUboot project", url: "https://docs.mcuboot.com/design.html", kind: "doc" },
                { title: "A Firmware Update Architecture for Internet of Things (RFC 9019)", by: "B. Moran et al.", year: 2021, url: "https://www.rfc-editor.org/rfc/rfc9019", kind: "spec" },
                { title: "STM32CubeF4 HAL and LL drivers (stm32f4xx-hal-driver)", by: "STMicroelectronics", url: "https://github.com/STMicroelectronics/stm32f4xx-hal-driver", kind: "doc" }
            ]
        }
    ]
});
