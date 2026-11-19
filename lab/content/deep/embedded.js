LAB.article("embedded", {
    mcu: {
        intro: "MCU(microcontroller unit)는 CPU, Flash, SRAM, 주변장치(peripheral)를 한 칩에 넣고 이들을 **하나의 주소 공간(address space)**에 펼쳐 놓은 컴퓨터다. 그래서 LED를 켜고, 타이머를 설정하고, 변수를 읽는 일이 모두 어떤 주소에 대한 load/store로 바뀐다. **메모리맵(memory map)**과 부팅 순서를 이해하면 HardFault, 링커 오류, 부팅 직후 멈춤 같은 문제의 원인을 바로 짚을 수 있다.",
        sections: [
            {
                h: "Cortex-M 메모리맵: 4 GB를 나눠 쓰는 규칙",
                p: [
                    "Cortex-M 코어는 32비트 주소, 즉 4 GB 공간을 쓴다. Arm 아키텍처(ARMv7-M 기준)는 이 공간을 0.5 GB 단위 영역으로 나누고, 영역마다 용도와 기본 메모리 속성(memory attribute)을 정해 둔다. 칩 제조사는 이 틀 안에 실제 Flash, SRAM, 주변장치를 배치한다.",
                    "예를 들어 STM32F4는 Flash를 `0x0800_0000`, SRAM을 `0x2000_0000`, GPIOA 레지스터를 `0x4002_0000`에 둔다. 리셋 시 BOOT0 핀이 0이면 Flash가 `0x0000_0000`에도 별칭(alias)으로 보인다. CPU는 항상 0번지부터 읽지만 실제로는 Flash 앞부분의 **벡터 테이블(vector table)**을 읽게 되는 이유다."
                ],
                table: {
                    head: ["주소 범위", "영역", "STM32F4 예"],
                    rows: [
                        ["`0x0000_0000`–`0x1FFF_FFFF`", "Code", "Flash `0x0800_0000`, 0번지 별칭, CCM RAM `0x1000_0000`"],
                        ["`0x2000_0000`–`0x3FFF_FFFF`", "SRAM", "SRAM1/SRAM2가 `0x2000_0000`부터"],
                        ["`0x4000_0000`–`0x5FFF_FFFF`", "Peripheral", "APB/AHB 주변장치 (GPIOA `0x4002_0000`)"],
                        ["`0x6000_0000`–`0xDFFF_FFFF`", "External RAM / Device", "FSMC 외부 메모리 뱅크"],
                        ["`0xE000_0000`–`0xE00F_FFFF`", "Private Peripheral Bus", "NVIC, SysTick, SCB (`0xE000_E000` 부근)"]
                    ]
                },
                tip: "HardFault의 폴트 주소를 이 표에 대 보면 방향이 잡힌다. SRAM 끝 근처면 스택·변수 오염, 예약된(reserved) 주소면 잘못된 포인터나 베이스 주소를 의심한다."
            },
            {
                h: "메모리맵 I/O(memory-mapped I/O): 레지스터는 특별한 주소일 뿐",
                p: [
                    "Cortex-M에는 x86의 `in`/`out` 같은 별도 I/O 명령이 없다. 주변장치 레지스터는 주소 공간의 한 칸이고 CPU는 일반 `LDR`/`STR` 명령으로 접근한다. `0x4002_0014`(STM32F4 GPIOA의 ODR)에 값을 쓰면 버스를 따라 GPIO 블록에 쓰기가 전달되고, 그 비트가 곧 핀 전압이 된다.",
                    "CMSIS 헤더는 이 주소들을 구조체로 덮어씌운다. 레지스터 순서대로 멤버를 나열한 구조체 포인터를 베이스 주소로 캐스팅하면 `GPIOA->ODR`가 정확히 베이스 + `0x14`를 가리킨다. 멤버가 모두 `volatile`인 이유는 레지스터가 메모리와 달리 **부수 효과(side effect)**를 갖기 때문이다."
                ],
                list: [
                    "읽기만 해도 상태가 바뀐다: UART 데이터 레지스터를 읽으면 수신 플래그가 지워진다.",
                    "쓰기 자체가 명령인 레지스터가 있다: 같은 값을 두 번 써도 두 번의 동작이 일어난다.",
                    "쓴 값과 읽은 값이 다를 수 있다: 쓰기 전용 비트와 하드웨어가 갱신하는 상태 비트가 섞여 있다.",
                    "따라서 컴파일러가 접근을 합치거나 빼거나 순서를 바꾸면 동작이 달라진다. `volatile`은 이를 막는다."
                ],
                code: {
                    lang: "c",
                    title: "레지스터 구조체 덮어쓰기 (STM32F4 GPIO 앞부분)",
                    src: `#include <stddef.h>
#include <stdint.h>

typedef struct {
    volatile uint32_t MODER;    // 0x00 모드
    volatile uint32_t OTYPER;   // 0x04 출력 타입
    volatile uint32_t OSPEEDR;  // 0x08 속도
    volatile uint32_t PUPDR;    // 0x0C 풀업/풀다운
    volatile uint32_t IDR;      // 0x10 입력
    volatile uint32_t ODR;      // 0x14 출력
    volatile uint32_t BSRR;     // 0x18 원자적 set/reset
} gpio_t;

#define GPIOA ((gpio_t *)0x40020000u)

_Static_assert(offsetof(gpio_t, ODR) == 0x14, "ODR offset");`,
                    note: "`_Static_assert`로 오프셋을 컴파일 시점에 검사하면 멤버 누락 같은 실수를 바로 잡는다"
                }
            },
            {
                h: "Flash, SRAM, 그리고 대기 상태(wait state)",
                p: [
                    "Flash는 전원이 꺼져도 내용이 남는 비휘발성(non-volatile) 메모리지만, 셀 읽기가 CPU 클럭보다 느리다. 그래서 클럭을 올리면 Flash를 읽을 때마다 CPU가 몇 사이클을 기다려야 하고, 이것이 대기 상태다. STM32F407은 CMSIS 헤더의 기준값(`FLASH_SCALE1_LATENCYx_FREQ`)대로 HCLK 30 MHz마다 대기 상태가 하나씩 늘어 150 MHz를 넘으면 5 WS, 즉 한 번 읽는 데 6 사이클이 걸린다. 168 MHz로 도는 ST 예제도 5 WS를 쓴다.",
                    "그런데도 F4가 168 MHz에서 대기 상태를 대부분 가리는 것은 ST ART 가속기의 프리페치(prefetch)와 명령·데이터 캐시(`FLASH->ACR`의 PRFTEN·ICEN·DCEN) 덕분이다. 반대로 분기가 많아 캐시에 맞지 않는 코드나 큰 테이블을 무작위로 읽는 코드는 대기 상태 비용을 그대로 치른다. 시간 결정성(determinism)이 필요한 루프를 SRAM이나 TCM(Tightly Coupled Memory)에서 돌리는 이유다.",
                    "SRAM은 0 대기 상태로 읽고 쓰지만 전원이 꺼지면 사라진다. 그래서 초기값이 있는 전역 변수는 Flash에 원본을 두고 부팅 때 SRAM으로 복사해야 하며, 이것이 `.data` 섹션의 정체다."
                ],
                table: {
                    head: ["메모리", "속도", "유지", "주의점"],
                    rows: [
                        ["Flash", "고클럭에서 대기 상태 필요", "전원 꺼져도 유지", "지우기는 섹터 단위, 쓰기는 느림"],
                        ["SRAM", "0 대기 상태", "전원 꺼지면 소실", "변수·스택·힙이 나눠 씀"],
                        ["CCM RAM (F4)", "0 대기 상태, CPU 데이터 버스 전용", "전원 꺼지면 소실", "DMA가 접근할 수 없음"],
                        ["ITCM / DTCM (M7)", "0 대기 상태, 시간 결정적", "전원 꺼지면 소실", "용량이 작아 핫 코드·데이터용"]
                    ]
                },
                tip: "클럭을 올릴 때는 `FLASH->ACR`의 LATENCY를 먼저 늘리고 그다음 PLL로 전환한다. 순서가 바뀌면 Flash에서 잘못된 명령을 읽어 무작위로 죽는다."
            },
            {
                h: "버스 매트릭스(bus matrix)와 동시 접근",
                p: [
                    "Cortex-M4는 명령을 가져오는 I-Code 버스, Flash의 상수를 읽는 D-Code 버스, SRAM과 주변장치를 위한 System 버스를 따로 갖는다. 명령 인출과 데이터 접근이 다른 버스에서 동시에 일어날 수 있어 파이프라인이 덜 멈춘다.",
                    "칩 안에는 CPU 말고도 버스 마스터(bus master)가 여럿 있다. DMA 컨트롤러, USB, Ethernet이 각자 메모리에 접근하려 하고, 버스 매트릭스가 마스터와 슬레이브(Flash, SRAM 뱅크, 주변장치 브리지) 사이를 중재(arbitration)한다. 서로 다른 슬레이브를 향한 접근은 동시에 진행되지만, 같은 슬레이브로 몰리면 한쪽이 기다린다.",
                    "STM32F407의 SRAM이 112 KB(SRAM1)와 16 KB(SRAM2)로 나뉜 것도 이 때문이다. CPU가 SRAM1에서 스택과 변수를 쓰는 동안 DMA 버퍼를 SRAM2에 두면 두 접근이 서로를 기다리지 않는다. 주변장치는 다시 AHB에서 APB 브리지를 거치는데, 168 MHz로 도는 ST 예제 설정에서 APB1은 42 MHz(÷4), APB2는 84 MHz(÷2)라서 APB 레지스터 접근은 CPU 클럭보다 느리다."
                ],
                list: [
                    "ADC 연속 수집이나 오디오처럼 대역폭이 큰 DMA 버퍼는 CPU가 많이 쓰는 SRAM 뱅크와 분리한다.",
                    "DMA가 닿지 않는 메모리(F4의 CCM RAM 등)에 DMA 버퍼를 두면 전송 에러(transfer error)가 나거나 데이터가 오지 않는다. 맵 파일로 버퍼 주소를 확인한다."
                ]
            },
            {
                h: "리셋에서 main()까지 한 단계씩",
                p: [
                    "Cortex-M은 리셋이 풀리면 코드를 실행하기 전에 벡터 테이블의 처음 두 워드를 읽는다. 0번 워드는 메인 스택 포인터(MSP, Main Stack Pointer)의 초기값, 1번 워드는 리셋 핸들러(reset handler) 주소다. 즉 스택 포인터는 C 코드가 한 줄도 돌기 전에 하드웨어가 이미 설정해 둔다.",
                    "리셋 벡터의 최하위 비트는 1이어야 한다. Cortex-M은 Thumb 명령만 실행하고 주소의 bit 0으로 Thumb 상태를 표시하기 때문이다. 컴파일러가 넣은 함수 주소에는 자동으로 1이 붙지만, 주소를 손으로 계산해 넣다가 0이 들어가면 첫 명령에서 바로 폴트(fault)가 난다.",
                    "`Reset_Handler`의 일은 C 언어가 기대하는 환경을 만드는 것이다. C 표준은 초기값이 있는 전역은 그 값으로, 없는 전역은 0으로 시작한다고 약속하므로 `.data`를 복사하고 `.bss`를 0으로 채운다. ST의 `startup_stm32f407xx.s`는 이 복사보다 먼저 `SystemInit()`을 부르는데, 현재 CMSIS 버전의 `SystemInit()`은 FPU 접근 권한(`CPACR`)과 VTOR만 설정하고 클럭은 건드리지 않는다. 그 뒤 전역 생성자(`__libc_init_array`)를 호출하고 `main()`으로 들어가며, PLL 클럭 설정은 `main()` 안의 `SystemClock_Config()`가 맡는다."
                ],
                demo: "lesson",
                tip: "`main()` 전에 멈춘다면 디버거로 `Reset_Handler`부터 한 줄씩 실행한다. `main()` 직후라면 `SystemClock_Config()`에서 외부 크리스털(HSE)이 준비되기를 기다리며 멈추는 경우가 흔하다."
            },
            {
                h: "링커 스크립트(linker script)와 크기 읽는 법",
                p: [
                    "링커 스크립트는 각 섹션의 두 주소를 정한다. 실행 중에 놓일 실행 주소(VMA, Virtual Memory Address)와 이미지 안에 저장되는 적재 주소(LMA, Load Memory Address)다. `.text`는 둘 다 Flash지만 `.data`는 `> RAM AT > FLASH`로 VMA는 SRAM, LMA는 Flash가 되고, 그 차이를 메우는 것이 `Reset_Handler`의 복사 루프다. `_sidata`는 보통 `LOADADDR(.data)`로 정의된 Flash 쪽 원본 시작 주소다.",
                    "빌드 결과의 메모리 사용량은 `arm-none-eabi-size`로 본다. Flash 사용량은 `text + data`(코드·상수 + `.data` 원본), 정적 SRAM 사용량은 `data + bss`다. 아래 예라면 Flash 24,400 B, SRAM 6,400 B이고, 여기에 스택과 힙이 더해진다."
                ],
                code: {
                    lang: "sh",
                    title: "크기와 큰 심볼 찾기",
                    src: `$ arm-none-eabi-size build/fw.elf
   text    data     bss     dec     hex filename
  24000     400    6000   30400    76c0 build/fw.elf

# 가장 큰 심볼 10개 (크기 순)
$ arm-none-eabi-nm --size-sort -S -C build/fw.elf | tail -n 10

# 링크할 때 맵 파일과 영역별 사용률 출력
$ arm-none-eabi-gcc ... -Wl,-Map=build/fw.map -Wl,--print-memory-usage`,
                    note: "`text`에는 `.rodata`와 벡터 테이블도 포함된다. `dec`는 세 값의 합일 뿐 실제 Flash 사용량이 아니다"
                },
                tip: "`-ffunction-sections -fdata-sections`와 `-Wl,--gc-sections`를 함께 쓰면 안 쓰는 함수가 빠진다. 대신 벡터 테이블처럼 코드에서 참조되지 않는 섹션은 `KEEP()`으로 지켜야 한다."
            }
        ],
        pitfalls: [
            "큰 룩업 테이블을 `const` 없이 선언: SRAM을 차지하고 부팅 때 복사 시간까지 든다. `static const`로 Flash에 둔다.",
            "PLL로 클럭을 올린 뒤에 Flash 대기 상태를 설정: 그 짧은 순간 Flash 읽기가 깨져 재현이 어려운 크래시가 난다. LATENCY를 먼저 올린다.",
            "`--gc-sections`를 켜고 `.isr_vector`에 `KEEP`을 빠뜨림: 링커가 벡터 테이블을 지워 리셋 직후 엉뚱한 주소로 간다.",
            "DMA 버퍼를 CCM RAM처럼 DMA가 못 닿는 영역에 배치: 코드에는 오류가 없는데 데이터가 오지 않는다.",
            "스택 크기를 감으로 정함: 스택은 보통 SRAM 끝에서 아래로 자라며 MPU가 없으면 `.bss`나 힙을 조용히 덮는다. 스택 영역을 패턴으로 채워 두고 최대 사용량을 측정한다."
        ],
        summary: [
            "MCU의 모든 자원은 하나의 주소 공간에 있고, 주변장치 제어도 정해진 주소에 대한 load/store다.",
            "Flash는 비휘발성이지만 고클럭에서 대기 상태가 필요하고, SRAM은 빠르지만 `.data` 복사와 `.bss` 초기화가 필요하다.",
            "리셋 후 하드웨어가 벡터 테이블에서 MSP와 리셋 벡터를 읽고, `Reset_Handler`가 C 실행 환경을 만든 뒤 `main()`을 부른다.",
            "링커 스크립트는 VMA와 LMA를 정하고, `size`와 맵 파일로 Flash·SRAM 사용량을 확인한다.",
            "버스 매트릭스 때문에 DMA 버퍼를 어느 SRAM 뱅크에 두느냐가 성능에 영향을 준다."
        ]
    },

    gpio: {
        intro: "GPIO(General-Purpose Input/Output)는 가장 단순한 주변장치(peripheral)지만, 여기서 익히는 패턴이 UART·타이머·DMA 레지스터에도 그대로 반복된다. 핀 하나는 여러 레지스터에 흩어진 비트 몇 개로 제어되고, 그 비트를 안전하게 바꾸는 방법과 핀의 전기적 성질을 함께 알아야 LED 하나도 제대로 켤 수 있다. 이 글은 레지스터 구성, 비트 연산, 경쟁 조건(race condition), 출력 구조, 입력 처리 순서로 정리한다.",
        sections: [
            {
                h: "핀 하나를 이루는 레지스터들",
                p: [
                    "STM32F4의 GPIO 포트 하나는 핀 16개를 관리하고, 각 핀의 설정은 여러 레지스터에 나뉘어 있다. 모드처럼 선택지가 4개인 설정은 핀당 2비트, 출력 타입처럼 둘 중 하나인 설정은 핀당 1비트, 대체 기능(alternate function) 번호는 핀당 4비트를 쓴다. 그래서 핀 n의 필드 위치는 비트 폭 × n으로 계산된다.",
                    "PA5라면 MODER의 bit 11:10, OTYPER의 bit 5, PUPDR의 bit 11:10이 설정 위치다. 레지스터는 32비트 단위로 읽고 쓰므로 한 핀만 바꾸려면 나머지 핀의 비트를 건드리지 않는 마스크 연산이 필요하다."
                ],
                table: {
                    head: ["레지스터", "오프셋", "핀당 비트", "역할"],
                    rows: [
                        ["MODER", "0x00", "2", "00 입력 · 01 출력 · 10 대체 기능 · 11 아날로그"],
                        ["OTYPER", "0x04", "1", "0 push-pull · 1 open-drain"],
                        ["OSPEEDR", "0x08", "2", "출력 엣지 속도(slew rate)"],
                        ["PUPDR", "0x0C", "2", "00 없음 · 01 풀업 · 10 풀다운"],
                        ["IDR / ODR", "0x10 / 0x14", "1", "입력값 읽기 / 출력값"],
                        ["BSRR", "0x18", "set 1 + reset 1", "하위 16비트 set, 상위 16비트 reset"],
                        ["AFRL / AFRH", "0x20 / 0x24", "4", "AF0–AF15 중 연결할 주변장치 신호"]
                    ]
                }
            },
            {
                h: "비트 연산: set, clear, toggle, 필드 쓰기",
                p: [
                    "단일 비트는 세 가지 연산으로 충분하다. `x |= m`은 m에서 1인 비트를 켜고, `x &= ~m`은 끄고, `x ^= m`은 뒤집는다. 마스크는 항상 `1u << n`처럼 부호 없는 상수로 만든다. `1 << 31`은 부호 있는 `int`의 범위를 넘으므로 C에서 정의되지 않은 동작(undefined behavior)이다.",
                    "여러 비트로 된 필드는 지우고 나서 쓴다. 기존 값이 `01`(출력)인 필드에 `|= 10`만 하면 결과는 `11`(아날로그)이 된다. PA6을 TIM3_CH1(AF2)로 쓰는 예라면 MODER는 마스크 `0x3 << 12 = 0x0000_3000`을 지우고 `0x2 << 12 = 0x0000_2000`을 쓰며, AFRL은 마스크 `0xF << 24 = 0x0F00_0000`을 지우고 `0x2 << 24 = 0x0200_0000`을 쓴다."
                ],
                code: {
                    lang: "c",
                    title: "필드 쓰기 매크로와 PA6 → TIM3_CH1",
                    src: `// reg 의 mask 영역을 지우고 val 을 넣는다 (한 번 읽고 한 번 씀)
#define FIELD_WRITE(reg, mask, val)  ((reg) = ((reg) & ~(mask)) | (val))

void pa6_as_tim3_ch1(void) {
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
    (void)RCC->AHB1ENR;                          // 클럭 활성화 후 더미 읽기

    FIELD_WRITE(GPIOA->MODER,  0x3u << (6 * 2), 0x2u << (6 * 2));  // 10 = AF
    FIELD_WRITE(GPIOA->AFR[0], 0xFu << (6 * 4), 0x2u << (6 * 4));  // AF2
}`,
                    note: "`FIELD_WRITE`도 읽고-수정하고-쓰기라서 같은 레지스터를 ISR이 바꾼다면 임계구역(critical section)으로 감싸야 한다"
                },
                demo: "lesson",
                tip: "비트 위치는 매직 넘버 대신 CMSIS 헤더의 `_Pos`/`_Msk` 매크로를 쓰면 리뷰할 때 실수가 잘 보인다."
            },
            {
                h: "Read-Modify-Write 경쟁과 원자적(atomic) 쓰기",
                p: [
                    "`GPIOA->ODR |= (1u << 5);`는 한 줄이지만 기계어로는 `LDR`(읽기), `ORR`(수정), `STR`(쓰기) 세 명령이다. `LDR`과 `STR` 사이에 인터럽트가 들어와 ISR이 같은 레지스터의 bit 3을 켰다고 하자. ISR이 돌아온 뒤 `STR`은 ISR 이전에 읽어 둔 값, 즉 bit 3이 꺼진 값을 써서 ISR의 변경을 지운다.",
                    "이 버그는 두 접근이 몇 사이클짜리 창 안에서 겹칠 때만 나타나므로 테스트에서는 거의 재현되지 않고 현장에서 가끔 나타난다. 해결책은 읽기 없이 한 번의 쓰기로 끝나는 레지스터를 쓰는 것이다. BSRR은 하위 16비트에 1을 쓰면 해당 핀을 set, 상위 16비트에 1을 쓰면 reset하고, 0인 비트는 아무것도 바꾸지 않는다.",
                    "토글이 필요하면 ODR에서 해당 핀의 현재 값만 보고 BSRR의 set 또는 reset 쪽에 쓴다. 읽기는 하지만 쓰기가 다른 핀을 건드리지 않으므로 다른 핀과 경쟁하지 않는다. Cortex-M3/M4의 비트밴딩(bit-banding)은 비트마다 32비트 별칭 주소를 만들어 주며, 주변장치라면 `0x4200_0000 + offset × 32 + bit × 4`다. GPIOA ODR(`0x4002_0014`, offset `0x2_0014`)의 bit 5는 `0x4240_0294`가 된다."
                ],
                table: {
                    head: ["방법", "원자성", "비고"],
                    rows: [
                        ["`ODR |=` / `ODR ^=`", "없음 (LDR·ORR·STR)", "ISR·다른 태스크와 같은 포트를 쓰면 위험"],
                        ["`BSRR` 쓰기", "있음 (STR 1회)", "STM32 GPIO의 기본 선택"],
                        ["비트밴딩", "있음 (하드웨어가 RMW 수행)", "Cortex-M3/M4만, M7·M33에는 없음"],
                        ["임계구역", "있음 (인터럽트 차단)", "모든 레지스터에 적용 가능, 인터럽트 지연 증가"]
                    ]
                }
            },
            {
                h: "출력 구조: push-pull, open-drain, 풀업",
                p: [
                    "push-pull 출력은 위쪽(PMOS)과 아래쪽(NMOS) 트랜지스터가 번갈아 켜져 핀을 VDD나 GND로 직접 구동한다. 상승·하강이 모두 빠르지만, 두 장치가 같은 선을 반대로 구동하면 단락에 가까운 전류가 흐른다. open-drain은 아래쪽 트랜지스터만 있어 Low로 당기거나 손을 놓을(high-Z)뿐이고, High는 **풀업 저항(pull-up resistor)**이 만든다.",
                    "여러 장치가 한 선을 공유하는 I2C가 open-drain을 쓰는 이유가 여기 있다. 누구든 Low로 당기면 선이 Low가 되는 wired-AND 구조라서 충돌해도 손상이 없고, 중재(arbitration)와 클럭 스트레칭(clock stretching)이 가능하다. 대가는 상승 엣지(rising edge)가 RC 충전으로 느려진다는 점이다.",
                    "I2C 사양은 상승 시간(rise time, 30%→70%)을 `t_r = 0.8473 × R × C`로 계산하고, 표준 모드(100 kHz)는 1000 ns, 고속 모드(400 kHz)는 300 ns 이하를 요구한다. 버스 용량 200 pF에 풀업 4.7 kΩ이면 t_r ≈ 797 ns로 표준 모드는 통과하지만 고속 모드에는 너무 느리다. 고속 모드라면 `R ≤ 300 ns / (0.8473 × 200 pF) ≈ 1.77 kΩ`이 필요하다."
                ],
                list: [
                    "MCU 내부 풀업은 보통 수십 kΩ(데이터시트의 R_PU 항목)이라 I2C 버스에는 너무 약하다. 버튼 입력 정도에만 쓴다.",
                    "연결되지 않은 입력 핀은 떠 있어서(floating) 잡음에 따라 0과 1을 오가고, 입력 버퍼가 중간 전압에서 관통 전류(shoot-through current)를 흘려 소비 전류가 늘 수 있다. 안 쓰는 핀은 아날로그 모드로 둔다.",
                    "OSPEEDR을 필요 이상으로 높이면 엣지가 가팔라져 링잉(ringing)과 EMI가 커진다. 신호 속도를 만족하는 가장 낮은 설정을 고른다."
                ]
            },
            {
                h: "입력 읽기와 디바운스(debouncing)",
                p: [
                    "입력 핀의 전압은 슈미트 트리거(Schmitt trigger)를 거쳐 IDR에 샘플링된다. IDR은 항상 최신 값이지만, 기계식 버튼은 접점이 닿는 순간 수 ms 동안 여러 번 붙었다 떨어진다. 이것이 바운스(bounce) 또는 채터링(chattering)이고, 그대로 읽으면 한 번 누름이 여러 번으로 세어진다.",
                    "흔한 실수는 버튼을 EXTI 엣지 인터럽트에 바로 연결하는 것이다. 바운스마다 인터럽트가 들어와 ISR이 수십 번 실행될 수 있다. 실무에서는 1 ms 주기 타이머에서 핀을 샘플링해 연속 N번 같은 값일 때만 상태를 바꾸고, EXTI는 저전력 모드에서 깨우는 용도로 쓴다.",
                    "아래 코드는 시프트 기록 대신 카운터로 안정 시간을 센다. 1 ms마다 호출하면 원시 값이 확정 상태와 다른 채로 10 ms 연속 유지되어야 상태를 바꾸므로, 눌림과 뗌을 같은 기준으로 걸러 낸다."
                ],
                code: {
                    lang: "c",
                    title: "카운터 방식 디바운스 (1 ms 주기 호출)",
                    src: `#define STABLE_MS 10

typedef struct { bool state; uint8_t count; } debounce_t;

// 확정 상태가 바뀐 순간에만 true
bool debounce_update(debounce_t *d, bool raw) {
    if (raw == d->state) {          // 확정값과 같으면 카운터 리셋
        d->count = 0;
        return false;
    }
    if (++d->count < STABLE_MS)     // 다른 값이 아직 덜 지속됨
        return false;
    d->state = raw;                 // 10 ms 연속 → 확정
    d->count = 0;
    return true;
}
// 1 ms 타이머 ISR: if (debounce_update(&btn, !(GPIOC->IDR & (1u << 13)))) ...`,
                    note: "Low에서 눌리는(active-low) 버튼이라 IDR 비트를 반전해서 넘긴다"
                },
                tip: "필요한 안정 시간은 스위치마다 다르다. 스코프로 실제 바운스를 한 번 찍어 보고 정한다."
            },
            {
                h: "volatile, 클럭, 그리고 디버깅 순서",
                p: [
                    "`volatile`은 '이 접근은 관측 가능한 동작이니 생략하거나 합치거나 다른 volatile 접근과 순서를 바꾸지 말라'는 뜻이다. 레지스터 포인터에 이것이 없으면 `while (!(GPIOC->IDR & mask));` 같은 대기 루프가 한 번만 읽고 무한 루프가 되거나, 연속된 두 쓰기 중 앞의 것이 사라진다. 반면 원자성이나 하드웨어 수준의 메모리 순서는 보장하지 않는다.",
                    "STM32 주변장치는 RCC에서 클럭을 켜기 전에는 쓰기가 무시된다. 또 일부 STM32 에라타(errata)는 클럭을 켠 직후 곧바로 그 주변장치에 접근하지 말라고 안내하며, HAL의 클럭 활성화 매크로가 활성화 직후 같은 RCC 레지스터를 한 번 읽는 이유가 이것이다."
                ],
                list: [
                    "1) RCC `AHB1ENR`에서 해당 포트의 클럭 비트가 1인가.",
                    "2) MODER가 의도한 모드인가. 리셋 값은 제품군마다 다르다. F4는 디버그 핀을 뺀 나머지가 입력이고, 다른 제품군은 RM의 리셋 값을 확인한다.",
                    "3) 대체 기능이면 AFR 번호가 데이터시트의 핀 기능 표와 맞는가.",
                    "4) ODR/IDR 값은 맞는데 핀이 안 움직이면 회로 문제다. 스코프로 핀을 직접 본다.",
                    "5) 디버그 핀(PA13/PA14, SWD)을 GPIO로 바꾸면 디버거 연결이 끊긴다."
                ]
            }
        ],
        pitfalls: [
            "ISR과 main이 `ODR |=`로 같은 포트를 수정: 드물게 다른 핀 상태가 되돌아간다. BSRR을 쓴다.",
            "MODER 필드를 지우지 않고 `|=`만 함: 이전 모드 비트가 남아 출력(01)이 아날로그(11)가 되는 식의 오설정이 생긴다.",
            "`volatile` 없이 레지스터나 ISR 공유 플래그를 폴링: 최적화 수준을 올리는 순간 루프가 멈추거나 사라진다.",
            "`volatile`이면 원자적이라고 착각: `count++`는 여전히 읽기·수정·쓰기 세 단계다.",
            "I2C에 내부 풀업만 사용: 수십 kΩ으로는 상승 시간이 길어 고속 모드에서 통신이 깨진다. 외부 풀업 값을 계산해 단다.",
            "버튼을 EXTI에 직결하고 ISR에서 바로 처리: 바운스 한 번에 이벤트가 여러 개 생긴다."
        ],
        summary: [
            "핀 설정은 MODER·OTYPER·PUPDR·AFR 등에 흩어진 비트 필드이며, 필드는 지우고 나서 쓴다.",
            "`|=`·`&= ~`·`^=`는 RMW라서 동시 수정에 취약하고, BSRR은 한 번의 쓰기로 원자적이다.",
            "push-pull은 양방향 구동, open-drain은 Low만 구동하며, 풀업 저항 값은 상승 시간 사양으로 계산한다.",
            "기계식 입력은 주기 샘플링으로 디바운스하고, `volatile`은 접근 보존일 뿐 원자성이 아니다."
        ]
    },

    irq: {
        intro: "인터럽트(interrupt)는 주변장치가 지금 처리할 일이 생겼다고 CPU에 끼어드는 하드웨어 메커니즘이고, Cortex-M에서는 NVIC(Nested Vectored Interrupt Controller)가 이를 관리한다. 폴링 없이 이벤트에 µs 단위로 반응할 수 있지만, ISR이 길거나 공유 데이터 보호가 허술하면 데이터 유실과 재현 어려운 버그의 원인이 된다. 이 글은 신호 경로, 진입·복귀의 하드웨어 동작, 우선순위(priority), ISR 설계, 공유 데이터, 디버깅 순서로 정리한다.",
        sections: [
            {
                h: "이벤트에서 ISR까지: 세 개의 문",
                p: [
                    "타이머가 넘치면 먼저 주변장치 안의 상태 플래그(TIM2의 `SR.UIF`)가 선다. 이 플래그는 인터럽트 허용 비트(`DIER.UIE`)가 켜져 있을 때만 NVIC로 가는 IRQ 신호가 된다. NVIC는 그 IRQ를 pending 상태로 표시하고, 해당 IRQ가 허용(`ISER`)되어 있으며 현재 실행 우선순위(execution priority)보다 높으면 CPU에 예외 진입을 요청한다.",
                    "즉 인터럽트가 실행되려면 주변장치, NVIC, CPU 마스크의 세 문이 모두 열려 있어야 한다. 인터럽트가 안 들어온다는 문제는 거의 항상 이 중 하나가 닫혀 있는 것이다."
                ],
                table: {
                    head: ["문", "레지스터 (예: TIM2)", "닫혀 있으면"],
                    rows: [
                        ["주변장치", "`TIM2->DIER`의 UIE", "플래그는 서지만 IRQ 신호가 나가지 않음"],
                        ["NVIC", "`NVIC->ISER[n]` (`NVIC_EnableIRQ`)", "IRQ가 pending으로만 남음"],
                        ["CPU 마스크", "`PRIMASK`, `BASEPRI`", "pending이 쌓여 있다가 마스크가 풀리는 순간 실행"]
                    ]
                }
            },
            {
                h: "예외 진입과 복귀: 하드웨어가 대신 하는 일",
                p: [
                    "예외가 받아들여지면 Cortex-M은 현재 스택에 8개 워드(32바이트), 즉 R0–R3, R12, LR, PC, xPSR을 자동으로 저장한다. 이것이 **스태킹(stacking)**이다. 이 8개는 AAPCS(Arm 함수 호출 규약)에서 호출된 함수가 망가뜨려도 되는 caller-saved 레지스터와 정확히 겹치므로, ISR을 특별한 키워드 없는 평범한 C 함수로 쓸 수 있다. R4–R11은 ISR이 실제로 쓸 때만 컴파일러가 함수 프롤로그에서 저장한다.",
                    "스태킹과 동시에 벡터 테이블(vector table)에서 ISR 주소를 읽고, LR에는 복귀 방법을 담은 특수 값 EXC_RETURN이 들어간다(예: `0xFFFFFFF9` = Thread 모드·MSP로 복귀, `0xFFFFFFFD` = Thread 모드·PSP로 복귀). ISR이 `bx lr`로 이 값에 점프하면 하드웨어가 이를 알아보고 스택에서 8개를 복원한다.",
                    "Cortex-M4 TRM에 따르면 0 대기 상태 메모리에서 이 진입은 최대 12 사이클이고, 168 MHz라면 약 71 ns다. 실제 **인터럽트 지연(interrupt latency)**에는 Flash 대기 상태, 진행 중이던 다중 사이클 명령, 그리고 코드가 인터럽트를 막아 둔 시간이 더해진다.",
                    "FPU가 있는 Cortex-M4F에서 부동소수점 문맥이 활성 상태면 S0–S15와 FPSCR까지 담은 26워드 프레임이 필요하다. 기본으로 켜져 있는 지연 스태킹(lazy stacking)은 공간만 예약하고 ISR이 실제로 FPU 명령을 쓸 때 저장하므로, FPU를 안 쓰는 ISR의 지연은 늘지 않는다."
                ],
                list: [
                    "**Tail-chaining**: ISR이 끝날 때 다른 IRQ가 대기 중이면 복원과 재저장을 건너뛰고 바로 다음 ISR로 간다. Cortex-M4에서 6 사이클이다.",
                    "**Late arrival**: 스태킹 도중 더 높은 우선순위 IRQ가 도착하면 이미 하던 저장을 그대로 쓰고 높은 쪽 ISR을 먼저 실행한다."
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
                }
            },
            {
                h: "우선순위: 숫자, 구현 비트, 그룹",
                p: [
                    "NVIC의 우선순위 레지스터는 IRQ마다 8비트지만, 칩은 그중 상위 몇 비트만 구현한다. STM32F4는 4비트(`__NVIC_PRIO_BITS = 4`)를 구현해 16단계(0–15)를 쓰고, 값은 바이트의 상위 니블에 들어간다. CMSIS의 `NVIC_SetPriority(TIM2_IRQn, 5)`는 이를 알고 `5 << (8 − 4) = 0x50`을 써 준다. 레지스터에 직접 쓰면서 이 시프트를 빠뜨리면 하위 4비트가 무시되어 모든 값이 0, 즉 최고 우선순위가 된다.",
                    "숫자가 작을수록 우선순위가 높다. Reset(−3), NMI(−2), HardFault(−1)는 고정된 음수 우선순위로 어떤 설정 가능한 인터럽트보다 앞선다. 우선순위 그룹(priority grouping, `AIRCR.PRIGROUP`)은 비트를 **선점(preemption)** 우선순위와 서브 우선순위(subpriority)로 나눈다. 실행 중인 ISR을 중단시키는 선점은 선점 우선순위가 더 높을 때만 일어나고, 서브 우선순위는 둘 다 대기 중일 때 처리 순서만 정한다.",
                    "`BASEPRI`는 지정한 값과 같거나 낮은 우선순위(숫자로는 같거나 큰 값)만 막는 마스크다. FreeRTOS는 이를 이용해 커널이 자료구조를 고치는 동안에도 아주 급한 인터럽트는 받아들이며, 그래서 `...FromISR` API를 부르는 ISR의 우선순위 숫자는 `configMAX_SYSCALL_INTERRUPT_PRIORITY`보다 같거나 커야 한다."
                ],
                table: {
                    head: ["설정 값 (CMSIS)", "레지스터 바이트 (4비트 구현)", "의미"],
                    rows: [
                        ["0", "`0x00`", "가장 높음"],
                        ["5", "`0x50`", "중간"],
                        ["15", "`0xF0`", "가장 낮음 (RTOS의 PendSV·SysTick에 흔히 사용)"]
                    ]
                }
            },
            {
                h: "ISR은 짧게: 시간 예산으로 생각하기",
                p: [
                    "ISR을 짧게 쓰라는 말은 취향이 아니라 계산 결과다. 115200 baud, 8N1 UART는 한 바이트에 시작·데이터·정지 비트 10개를 쓰므로 초당 11,520바이트, 바이트 간격은 약 86.8 µs다. STM32F4의 USART처럼 수신 FIFO가 없는 주변장치는 다음 바이트가 시프트 레지스터에 다 들어오기 전에 데이터 레지스터를 읽지 않으면 오버런(overrun)이 난다.",
                    "따라서 이 UART와 같거나 높은 우선순위의 ISR이 약 87 µs 넘게 실행되면 바이트를 잃는다. 168 MHz에서 87 µs는 약 14,600 사이클로 넉넉해 보이지만, ISR 안의 `printf` 한 번, Flash 쓰기 한 번, 수 ms 걸리는 파싱은 이 예산을 쉽게 넘긴다.",
                    "해법은 ISR이 데이터를 안전한 곳에 옮기고 플래그를 세우는 일만 하고, 나머지를 메인 루프나 태스크로 미루는 것이다. 단일 생산자·단일 소비자 **링 버퍼(ring buffer)**는 ISR만 head를, main만 tail을 쓰므로 잠금 없이 동작한다."
                ],
                code: {
                    lang: "c",
                    title: "SPSC 링 버퍼 (ISR → main)",
                    src: `#define RB_SIZE 256u                        // 2의 거듭제곱
static volatile uint8_t  rb_buf[RB_SIZE];
static volatile uint32_t rb_head, rb_tail;  // head: ISR 만, tail: main 만 씀

void USART2_IRQHandler(void) {
    if (USART2->SR & USART_SR_RXNE) {
        uint8_t  c = (uint8_t)USART2->DR;   // DR 읽기 = RXNE 클리어
        uint32_t h = rb_head;
        if (h - rb_tail < RB_SIZE) {        // 가득 차지 않았으면
            rb_buf[h % RB_SIZE] = c;
            rb_head = h + 1;                // 데이터를 쓴 뒤 인덱스 공개
        }
    }
}

bool rb_get(uint8_t *c) {
    uint32_t t = rb_tail;
    if (t == rb_head) return false;         // 비어 있음
    *c = rb_buf[t % RB_SIZE];
    rb_tail = t + 1;
    return true;
}`,
                    note: "크기가 2의 거듭제곱이면 인덱스가 2³²에서 넘쳐도 `h - t`와 `% RB_SIZE`가 맞다. 버퍼도 `volatile`이라 데이터 쓰기가 인덱스 공개 뒤로 재배치되지 않는다"
                }
            },
            {
                h: "공유 데이터와 임계구역(critical section)",
                p: [
                    "ISR과 main이 공유하는 변수에는 `volatile`이 필요하다. 없으면 컴파일러가 main의 `while (!flag);`를 한 번만 읽도록 최적화할 수 있다. 하지만 `volatile`은 원자성(atomicity)을 주지 않는다. `ticks++`는 여전히 `LDR`·`ADD`·`STR`이고, main에서 이 사이에 ISR이 같은 변수를 증가시키면 한 번의 증가가 사라진다.",
                    "Cortex-M에서 정렬된 32비트 이하의 단일 읽기·쓰기는 원자적이다. 문제는 여러 단계로 된 접근이다. 32비트 CPU가 64비트 카운터를 읽으면 두 번의 `LDR` 사이에 ISR이 하위 워드를 넘기며 상위 워드를 올릴 수 있고, 하위는 옛 값·상위는 새 값인 **찢어진 읽기(torn read)**가 된다. 구조체 여러 필드를 함께 바꾸는 경우도 같다.",
                    "임계구역은 이런 구간을 인터럽트로부터 보호한다. 다만 임계구역의 길이는 그동안 막히는 모든 인터럽트의 최악 지연에 그대로 더해진다. 10 µs짜리 임계구역은 시스템 전체의 최악 인터럽트 지연을 10 µs 늘린다."
                ],
                table: {
                    head: ["방법", "막는 범위", "사용 가능 코어", "주의"],
                    rows: [
                        ["`__disable_irq()` (PRIMASK)", "NMI·HardFault 외 전부", "모든 Cortex-M", "짧게, 이전 상태를 저장·복원"],
                        ["`BASEPRI`", "지정 우선순위 이하만", "M3/M4/M7/M33", "M0/M0+에는 없음"],
                        ["`LDREX`/`STREX`", "막지 않음 (실패하면 재시도)", "M3/M4/M7/M33", "단일 변수 갱신용"],
                        ["C11 `<stdatomic.h>`", "컴파일러가 구현 선택", "툴체인 지원 시", "M0/M0+는 하드웨어 지원이 없어 제한적"]
                    ]
                }
            },
            {
                h: "디버깅: 안 들어올 때, 안 끝날 때",
                list: [
                    "**ISR이 한 번도 안 불린다**: 함수 이름이 startup 파일의 벡터 이름과 정확히 같은지 본다. 틀리면 약한 별칭(weak alias)인 `Default_Handler`(무한 루프)가 대신 실행된다. C++ 파일이면 `extern \"C\"`가 없어 이름이 맹글링(name mangling)된 경우가 흔하다.",
                    "**ISR이 끝없이 다시 불린다**: 플래그를 안 지웠거나 ISR 맨 끝에서 지웠다. 쓰기 버퍼(write buffer) 때문에 클리어가 주변장치에 닿기 전에 예외 복귀가 일어나면 같은 IRQ가 다시 pending으로 보인다. 플래그는 ISR 앞부분에서 지우거나, 지운 뒤 레지스터를 한 번 읽어 쓰기를 완료시킨다.",
                    "**가끔 HardFault**: 모든 ISR은 MSP 스택을 공유한다. 중첩이 깊어지면 스택 사용량이 합쳐지므로 최악 중첩 깊이를 기준으로 스택을 잡는다.",
                    "**지연이 들쭉날쭉**: ISR 입구에서 GPIO를 올리고 출구에서 내린 뒤, 스코프로 이벤트 대비 진입 지연과 ISR 길이를 직접 잰다.",
                    "디버거의 NVIC 뷰에서 IRQ별 enabled·pending·active 비트(`ISER`, `ISPR`, `IABR`)를 보면 세 문 중 어디서 막혔는지 바로 보인다."
                ],
                tip: "우선순위는 얼마나 중요한가보다 얼마나 오래 기다릴 수 있는가로 정한다. 마감이 짧은 이벤트에 높은 우선순위를 준다."
            }
        ],
        pitfalls: [
            "공유 변수에 `volatile`만 붙이고 안전하다고 믿음: `++`와 64비트 읽기는 여전히 깨질 수 있다.",
            "`__disable_irq()`/`__enable_irq()`를 짝으로만 사용: 중첩된 임계구역에서 안쪽이 바깥쪽 보호를 일찍 풀어 버린다. PRIMASK를 저장하고 복원한다.",
            "CMSIS 없이 우선순위 레지스터에 `5`를 그대로 씀: 구현되지 않은 하위 니블이라 0, 즉 최고 우선순위가 된다.",
            "ISR에서 블로킹 함수, `printf`, `malloc` 호출: 시간 예산을 넘기고 재진입 문제까지 생긴다.",
            "FreeRTOS에서 `configMAX_SYSCALL_INTERRUPT_PRIORITY`보다 높은(숫자가 작은) ISR이 `FromISR` API를 호출: 커널 자료구조가 깨져 드물게 멈춘다. `configASSERT`를 켜 두면 잡힌다."
        ],
        summary: [
            "인터럽트는 주변장치 허용 비트, NVIC 허용, CPU 마스크의 세 문을 모두 지나야 실행된다.",
            "하드웨어가 caller-saved 8개 레지스터를 자동 저장하므로 ISR은 평범한 C 함수이고, Cortex-M4의 진입은 최대 12 사이클이다.",
            "우선순위는 숫자가 작을수록 높으며, 구현 비트 수와 그룹 설정을 확인해야 한다.",
            "ISR의 실행 시간은 다른 인터럽트의 시간 예산을 소비하므로 데이터만 옮기고 나머지는 미룬다.",
            "`volatile`은 원자성이 아니며, 여러 단계 접근은 임계구역이나 재시도 루프로 보호한다."
        ]
    },

    pwm: {
        intro: "PWM(Pulse Width Modulation)은 디지털 핀 하나로 평균 전압을 조절하는 방법이다. 주기는 고정하고 High 구간의 비율, 즉 **듀티비(duty cycle)**만 바꾸며, LED 밝기·모터 속도·서보 각도·간이 DAC가 모두 같은 원리로 동작한다. 하드웨어 타이머가 파형을 만들기 때문에 CPU는 값 하나만 써 두면 되지만, 주파수와 분해능(resolution)의 맞교환(trade-off)과 레지스터 갱신 시점을 이해해야 원하는 파형이 나온다.",
        sections: [
            {
                h: "타이머의 구조: 프리스케일러, 카운터, 리로드",
                p: [
                    "범용 타이머(general-purpose timer)는 입력 클럭을 세는 카운터다. 입력 클럭은 먼저 프리스케일러(prescaler, `PSC`)에서 `PSC+1`로 나뉘고, 나뉜 클럭마다 카운터(`CNT`)가 1씩 오른다. `CNT`가 `ARR`에 도달한 다음 클럭에 0으로 돌아가며 업데이트 이벤트(update event)를 낸다. 그래서 한 주기는 `ARR+1`개 카운트이고, 계산식의 두 곳에 '+1'이 붙는다.",
                    "타이머 입력 클럭이 몇 MHz인지부터 확인해야 한다. STM32F407을 168 MHz로 돌리면 APB1은 42 MHz지만, APB 프리스케일러가 1이 아니면 타이머 클럭은 APB 클럭의 2배가 되므로 TIM2–TIM7, TIM12–TIM14는 84 MHz로 동작한다. 이 규칙을 놓치고 42 MHz로 계산하면 PWM 주파수가 정확히 2배로 나온다.",
                    "PSC·ARR은 이렇게 정한다. 한 주기의 총 카운트 `N = f_tim / f_pwm`을 `(PSC+1) × (ARR+1)`로 나누되, ARR을 가능한 크게 잡아 분해능을 확보하고, PSC는 ARR이 레지스터 폭(16비트 타이머면 65535)을 넘지 않게 할 만큼만 키운다."
                ]
            },
            {
                h: "주파수와 분해능: 실제 숫자로 계산하기",
                p: [
                    "PWM 주파수는 `f_tim / ((PSC+1)(ARR+1))`이고, 듀티를 나눌 수 있는 단계 수인 분해능은 `ARR+1`이다. 같은 타이머 클럭에서 주파수를 올리면 한 주기의 카운트가 줄어 분해능이 그만큼 떨어진다. PSC=0일 때 분해능을 비트로 쓰면 `log2(f_tim / f_pwm)`이다.",
                    "84 MHz 타이머로 모터용 20 kHz를 만들면 `84,000,000 / 20,000 = 4,200`이므로 PSC=0, ARR=4199이고 분해능은 약 12비트다. LED용 1 kHz는 84,000 카운트가 필요해 16비트 타이머의 한계 65,536을 넘으므로, PSC=1(42 MHz)·ARR=41999로 나누거나 32비트 타이머(F4의 TIM2·TIM5)를 쓴다.",
                    "서보는 반대 방향의 예다. 50 Hz(20 ms 주기)에서 펄스 폭 1–2 ms로 각도를 정하므로, PSC=83으로 1 MHz(1 µs/카운트)를 만들고 ARR=19999로 둔다. 전체로는 20,000단계지만 실제로 쓰는 1–2 ms 구간은 1,000단계뿐이다. 각도 분해능이 부족하면 PSC를 줄여 카운트를 촘촘하게 한다."
                ],
                table: {
                    head: ["용도", "f_pwm", "PSC / ARR (84 MHz)", "분해능"],
                    rows: [
                        ["서보", "50 Hz", "83 / 19999", "1 µs 단위 (유효 구간 1,000단계)"],
                        ["LED 밝기", "1 kHz", "1 / 41999", "42,000단계 (≈15.4비트)"],
                        ["모터 (가청 밖)", "20 kHz", "0 / 4199", "4,200단계 (≈12.0비트)"],
                        ["고주파 스위칭", "100 kHz", "0 / 839", "840단계 (≈9.7비트)"]
                    ]
                },
                demo: "lesson",
                tip: "데모는 72 MHz 클럭 기준이다. 같은 공식에 실제 타이머 클럭만 바꿔 넣으면 된다."
            },
            {
                h: "PWM 모드와 비교기: 파형이 만들어지는 순간",
                p: [
                    "채널마다 비교 레지스터 `CCR`과 비교기(comparator)가 있다. 업 카운트의 PWM 모드 1에서는 `CNT < CCR`인 동안 출력 기준 신호(OCxREF)가 High, 그 외에는 Low다. 그래서 듀티는 `CCR / (ARR+1)`이고, `CCR = 0`이면 0%, `CCR`이 `ARR`보다 크면 100%다. 0%와 100%가 모두 깔끔하게 나오는 것이 이 정의의 장점이다.",
                    "PWM 모드 2는 비교 조건을 반대로 하고, 출력 극성 비트(`CCER.CCxP`)는 핀에서 신호를 뒤집는다. Low에서 켜지는(active-low) LED나 게이트 드라이버라면 계산식은 그대로 두고 극성만 바꾸는 편이 코드가 읽기 쉽다.",
                    "중앙 정렬(center-aligned) 모드에서는 카운터가 0에서 ARR까지 올랐다가 다시 0으로 내려온다. 한 주기가 `2 × ARR` 카운트라서 같은 ARR에서 주파수는 절반이 되고, 펄스는 주기 중앙에 대칭으로 놓인다. 3상 모터 제어에서는 세 상의 스위칭 엣지가 한 시점에 몰리지 않아 전류 리플(current ripple)과 잡음이 줄고, 카운터 꼭짓점에서 ADC를 트리거해 스위칭 잡음이 없는 순간의 전류를 샘플링할 수 있다."
                ]
            },
            {
                h: "Preload와 업데이트 이벤트: 글리치(glitch)는 왜 생기나",
                p: [
                    "preload가 꺼져 있으면 `CCR` 쓰기가 즉시 비교기에 반영된다. ARR=999, 기존 CCR=300인 상태에서 `CNT=600`일 때 CCR을 800으로 바꾸면, 출력은 이미 300에서 Low가 됐는데 `600 < 800`이 다시 참이 되어 800까지 High가 된다. 한 주기 안에 펄스가 두 개 나오는 것이다.",
                    "ARR은 더 위험하다. preload 없이 ARR을 현재 `CNT`보다 작게 줄이면 카운터는 일치하는 순간을 이미 지나쳤으므로 16비트 끝(65535)까지 세고 넘친 뒤에야 0으로 돌아온다. 84 MHz, PSC=0이라면 50 µs여야 할 주기 하나가 최대 약 780 µs로 늘어나고, 모터라면 그 순간 토크가 튄다.",
                    "preload를 켜면(`CCMRx.OCxPE`, `CR1.ARPE`) 소프트웨어는 preload 레지스터에 쓰고, 값은 다음 업데이트 이벤트에 그림자 레지스터(shadow register)로 한꺼번에 옮겨진다. 변경이 항상 주기 경계에서 일어나므로 글리치가 없다. 대신 초기화 직후에는 아직 업데이트 이벤트가 없었으므로 `EGR.UG`로 한 번 강제로 일으켜 값을 로드한다."
                ],
                tip: "매 주기 듀티를 바꾸는 제어 루프라면 업데이트 인터럽트나 업데이트 DMA 요청에 맞춰 CCR을 쓴다. 계산 시점과 반영 시점의 차이가 정확히 한 주기로 고정된다."
            },
            {
                h: "부하에 따라 달라지는 설계: 모터, LED, RC 필터",
                p: [
                    "모터 같은 유도성 부하(inductive load)는 권선 인덕턴스가 전류를 평활하므로, PWM 주파수가 충분히 높으면 평균 전압 `D × V`로 구동하는 것과 비슷해진다. 주파수는 가청 대역(audible band) 위인 20 kHz 이상을 흔히 쓰지만, 높일수록 스위칭 손실(switching loss)이 늘어 효율과 소음 사이에서 고른다. H-브리지에서는 상단과 하단 스위치가 동시에 켜지는 관통(shoot-through)을 막기 위해 고급 타이머(TIM1·TIM8)의 상보 출력(complementary output)과 데드타임(dead-time, `BDTR.DTG`)을 쓴다.",
                    "LED는 듀티에 비례해 빛을 내지만 사람 눈의 밝기 감각은 비선형이라, 듀티를 선형으로 올리면 어두운 쪽 변화가 거칠게 보인다. 보통 감마 보정(gamma correction) 테이블로 인지 밝기 단계를 듀티로 바꾸며, 어두운 쪽 단계를 표현하려면 분해능이 넉넉할수록 좋다.",
                    "PWM 출력에 RC 저역통과 필터(low-pass filter)를 달면 간이 DAC가 된다. 20 kHz PWM에 R=10 kΩ, C=100 nF(τ=1 ms, 차단 주파수(cutoff frequency) 약 159 Hz)을 쓰면, 3.3 V·듀티 50%에서 리플은 `V × D(1−D) × T / RC = 3.3 × 0.25 × 0.05 ≈ 41 mV` 피크-투-피크다. RC를 키우면 리플은 줄지만 새 값에 수렴하는 시간(약 5τ = 5 ms)이 길어진다."
                ],
                code: {
                    lang: "c",
                    title: "서보 50 Hz, µs 단위 펄스 (TIM3 CH1, 84 MHz)",
                    src: `void servo_init(void) {
    TIM3->PSC   = 84 - 1;                       // 84 MHz / 84 = 1 MHz → 1 µs
    TIM3->ARR   = 20000 - 1;                    // 20 ms 주기 = 50 Hz
    TIM3->CCMR1 = (6u << TIM_CCMR1_OC1M_Pos)    // PWM mode 1
                | TIM_CCMR1_OC1PE;              // CCR preload
    TIM3->CR1  |= TIM_CR1_ARPE;                 // ARR preload
    TIM3->CCER |= TIM_CCER_CC1E;
    TIM3->EGR   = TIM_EGR_UG;                   // preload 값 로드
    TIM3->CR1  |= TIM_CR1_CEN;
}

void servo_set_us(uint32_t us) {
    if (us < 1000) us = 1000;                   // 서보 사양 범위로 제한
    if (us > 2000) us = 2000;
    TIM3->CCR1 = us;                            // 1 카운트 = 1 µs
}`,
                    note: "1–2 ms 범위는 서보마다 다르다. 실제 끝점은 측정해서 상수로 보정한다"
                }
            },
            {
                h: "출력이 안 나올 때 확인 순서",
                list: [
                    "핀이 대체 기능(alternate function) 모드(MODER=10)이고 AFR 번호가 그 타이머 채널과 맞는가 (예: STM32F4의 PA6 → TIM3_CH1은 AF2).",
                    "`CCER.CCxE`로 채널 출력을 켰는가. 상보 출력이면 `CCxNE`도 켠다.",
                    "TIM1·TIM8 같은 고급 타이머라면 `BDTR.MOE`(main output enable)를 켰는가. 이것이 0이면 다른 설정이 모두 맞아도 핀이 움직이지 않는다.",
                    "RCC에서 타이머 클럭을 켰고 `CR1.CEN`으로 카운터를 시작했는가.",
                    "주파수가 정확히 2배나 절반이면 APB 타이머 클럭 2배 규칙을 의심한다.",
                    "듀티가 1 카운트씩 어긋나면 `ARR+1`과 `CCR`의 정의(0%·100% 경계)를 다시 계산한다."
                ],
                tip: "스코프나 로직 분석기의 듀티 측정 기능으로 CCR 값 몇 개를 찍어 보면 계산 실수와 클럭 설정 실수를 한 번에 가를 수 있다."
            }
        ],
        pitfalls: [
            "타이머 클럭을 APB 클럭으로 착각: APB 분주가 있으면 타이머는 2배 클럭이라 주파수가 2배로 나온다.",
            "`PSC`와 `ARR`에 목표 분주비를 그대로 씀: 하드웨어는 `+1`로 나누므로 72분주를 원하면 71을 쓴다.",
            "preload 없이 실행 중 ARR·CCR 변경: 이중 펄스나 65536 카운트짜리 긴 주기가 생긴다.",
            "주파수만 맞추고 분해능을 확인하지 않음: 84 MHz 타이머로 100 kHz를 만들면 840단계뿐이라 미세 제어가 어렵다.",
            "고급 타이머에서 `MOE`를 켜지 않음: 레지스터는 다 맞는데 출력이 나오지 않는다."
        ],
        summary: [
            "주파수 = `f_tim / ((PSC+1)(ARR+1))`, 듀티 = `CCR / (ARR+1)`, 분해능 = `ARR+1`이다.",
            "같은 클럭에서 주파수와 분해능은 맞교환이며, 타이머 입력 클럭(APB 2배 규칙)을 먼저 확인한다.",
            "preload를 켜면 새 값이 업데이트 이벤트에 반영되어 글리치가 없다.",
            "부하가 설계를 정한다: 모터는 가청 밖 주파수와 데드타임, LED는 감마 보정, PWM-DAC는 RC 필터의 리플과 응답 속도를 맞교환한다."
        ]
    },

    adc: {
        intro: "ADC(Analog-to-Digital Converter)는 센서의 연속 전압을 정수로 바꾸는 주변장치(peripheral)다. 결과의 질은 비트 수보다 기준 전압(reference voltage), 샘플링 시점, 소스 임피던스(source impedance), 샘플링 주파수(sampling rate) 선택에 더 크게 좌우된다. 연속 수집에서는 DMA(Direct Memory Access)가 변환 결과를 메모리로 옮겨 CPU가 블록 단위로만 일하게 만든다. 이 글은 변환 원리, 오차의 크기, 샘플링 이론, 입력 회로, DMA 파이프라인 순서로 정리한다.",
        sections: [
            {
                h: "SAR ADC 내부: 비트 하나씩 이진 탐색",
                p: [
                    "MCU에 가장 흔한 축차 비교형(successive approximation) ADC는 샘플-홀드(sample-and-hold) 커패시터, 내부 DAC, 비교기(comparator)로 이뤄진다. 먼저 샘플링 구간 동안 입력 전압으로 커패시터를 충전하고, 스위치를 열어 그 전압을 붙잡는다. 이후 내부 DAC 출력을 MSB부터 하나씩 시험해 입력보다 크면 그 비트를 0, 작으면 1로 확정한다.",
                    "N비트 결과에 N번의 비교가 필요하므로 변환 시간은 비트 수에 비례하고, 12비트라면 샘플링 뒤에 약 12 ADC 클럭이 더 든다(정확한 값은 제품 RM의 ADC 타이밍 절). STM32F4의 ADC 클럭 상한은 36 MHz, 최소 샘플링은 3사이클이므로 단일 ADC는 대략 `36 MHz / 15 사이클 ≈ 2.4 MSPS`가 상한이다. 아래는 Vref=3.3 V, 12비트에서 입력 1.0 V를 변환하는 처음 일곱 단계다."
                ],
                table: {
                    head: ["단계", "시험 코드", "DAC 전압", "비교 → 비트"],
                    rows: [
                        ["1 (bit 11)", "2048", "1.650 V", "1.0 < 1.650 → 0"],
                        ["2 (bit 10)", "1024", "0.825 V", "1.0 > 0.825 → 1"],
                        ["3 (bit 9)", "1536", "1.238 V", "1.0 < 1.238 → 0"],
                        ["4 (bit 8)", "1280", "1.031 V", "1.0 < 1.031 → 0"],
                        ["5 (bit 7)", "1152", "0.928 V", "1.0 > 0.928 → 1"],
                        ["6 (bit 6)", "1216", "0.980 V", "1.0 > 0.980 → 1"],
                        ["7 (bit 5)", "1248", "1.005 V", "1.0 < 1.005 → 0"]
                    ]
                },
                tip: "남은 다섯 단계까지 마치면 결과는 1241(`0x4D9`)이다. `1.0 / 3.3 × 4096 ≈ 1241.2`와 일치한다."
            },
            {
                h: "LSB, 양자화 오차(quantization error), 그리고 진짜 오차 예산",
                p: [
                    "12비트, Vref=3.3 V의 LSB는 `3.3 / 4096 ≈ 0.806 mV`다. 이상적인 ADC도 입력을 가장 가까운 레벨로 반올림하므로 최대 ±½ LSB의 양자화 오차가 남고, 이것이 만드는 신호 대 양자화 잡음비(SQNR)는 `6.02N + 1.76 dB`, 12비트면 약 74 dB다. 실제 ADC는 열잡음, 비선형성(INL·DNL), 오프셋·이득 오차가 더해져 유효 비트 수(ENOB, effective number of bits)가 공칭보다 낮다.",
                    "더 큰 오차는 흔히 ADC 바깥에 있다. 3.3 V 전원 레일을 그대로 Vref로 쓰는데 그 정밀도가 ±1%라면 오차는 33 mV, 약 41 LSB다. 12비트 중 하위 5–6비트가 기준 전압 오차에 묻히는 셈이다. 정확도가 필요하면 정밀 기준 전압 IC를 쓰거나, 내부 기준 전압(VREFINT)을 함께 측정해 실제 VDDA를 역산한다: `VDDA = V_CAL × VREFINT_CAL / VREFINT_DATA`. 여기서 V_CAL은 공장 교정 때의 전압으로 제품군마다 다르니 데이터시트를 확인한다.",
                    "잡음을 역이용하는 방법도 있다. 잡음이 1 LSB 이상이고 서로 상관이 없으면 4^k개를 더해 k비트를 더 얻을 수 있다. 16개 샘플을 더한 뒤 2비트 오른쪽으로 시프트하면 14비트 결과가 되는데, 이것이 **오버샘플링(oversampling)**과 데시메이션(decimation)이다. 대가는 출력 속도가 16분의 1로 줄어드는 것이다."
                ],
                demo: "lesson"
            },
            {
                h: "나이퀴스트와 에일리어싱(aliasing): 샘플링 주파수 정하기",
                p: [
                    "샘플링 정리(sampling theorem)에 따르면 샘플링 주파수 f_s는 신호 최고 주파수의 2배보다 커야 하고, f_s/2를 **나이퀴스트 주파수(Nyquist frequency)**라고 한다. 이보다 높은 성분은 사라지지 않고 f_s를 기준으로 접혀 낮은 주파수로 둔갑한다. f_s = 1 kHz로 900 Hz 신호를 샘플링하면 `|900 − 1000| = 100 Hz` 신호와 똑같은 샘플이 나온다.",
                    "핵심은 에일리어싱이 샘플링 순간에 일어나며 이후 디지털 필터로는 되돌릴 수 없다는 점이다. 그래서 ADC 앞에 아날로그 **안티에일리어싱 필터(anti-aliasing filter)**를 두고 f_s/2 위의 성분을 미리 깎는다. 1차 RC 필터는 주파수가 10배 높아질 때 20 dB씩만 줄이므로, 차단 주파수 1 kHz 필터에 f_s = 10 kHz라면 9 kHz 성분(1 kHz로 접힘)은 약 19 dB만 감쇠된다.",
                    "실무에서 f_s를 신호 대역의 5–10배로 잡는 이유가 이것이다. 필터 차단과 나이퀴스트 주파수 사이에 여유가 생겨 단순한 필터로도 충분히 감쇠된다. 또 샘플 간격이 흔들리는 지터(jitter)도 그대로 잡음이 되므로, 소프트웨어 루프가 아니라 타이머 트리거로 변환을 시작한다."
                ],
                list: [
                    "전원선의 50/60 Hz 잡음은 그 주기의 정수배 길이로 평균하면 크게 줄어든다.",
                    "배터리 전압처럼 느린 신호는 높은 f_s가 필요 없다. RC 필터를 크게 하고 여러 샘플을 평균한다."
                ]
            },
            {
                h: "샘플링 시간과 소스 임피던스",
                p: [
                    "샘플링 구간 동안 입력은 소스 저항과 ADC 내부 스위치 저항을 거쳐 샘플 커패시터를 충전해야 한다. RC 충전은 지수적이므로 오차가 ½ LSB 아래로 떨어지려면 12비트 기준 `ln(2^13) ≈ 9`개 시정수(time constant)가 필요하다. 설계에서는 여유를 두어 `ln(2^(N+2))`, 12비트면 약 9.7τ로 잡기도 한다.",
                    "예를 들어 소스와 스위치 저항의 합이 10 kΩ, 샘플 커패시터가 5 pF라고 가정하면 τ = 50 ns이고 필요한 샘플링 시간은 약 485 ns다. ADC 클럭 21 MHz(사이클 47.6 ns)에서는 약 10.2사이클이므로 STM32F4의 선택지(3, 15, 28, 56, 84, 112, 144, 480사이클) 중 15사이클을 고른다. 그러면 변환 하나가 약 `15 + 12 = 27`사이클, 약 1.29 µs이고 채널 하나의 최대 속도는 약 778 kSPS다.",
                    "저항 분압기로 배터리를 재는 회로가 이 계산에서 자주 깨진다. 소비 전류를 줄이려고 100 kΩ + 100 kΩ 분압을 쓰면 테브난 등가 저항(Thevenin resistance)이 50 kΩ이라 샘플링 시간이 크게 늘어야 한다. 이때는 ADC 핀에 수십 nF 이상의 커패시터를 달아 전하 저장소로 쓰거나(대신 대역폭이 낮아진다), 연산증폭기(op-amp) 버퍼를 둔다."
                ],
                list: [
                    "스캔 모드에서 채널을 바꾸면 이전 채널 전압이 샘플 커패시터에 남아 다음 값을 끌어당긴다(채널 간 크로스토크, crosstalk). 고임피던스 채널은 샘플링 시간을 늘리거나 두 번 변환해 첫 값을 버린다."
                ],
                tip: "샘플링 시간 설정을 한 단계씩 늘려 보며 값이 더 이상 변하지 않는 지점을 찾으면, 그것이 충분한 설정이다."
            },
            {
                h: "DMA와 더블 버퍼링(double buffering): CPU 없이 연속 수집",
                p: [
                    "연속 수집 파이프라인은 세 주변장치의 연결이다. 타이머가 정확한 주기로 트리거(TRGO)를 내고, ADC는 트리거마다 한 번 변환한 뒤 DMA 요청을 낸다. DMA는 ADC 데이터 레지스터에서 16비트를 읽어 메모리 버퍼에 쓰고 주소를 증가시킨다. CPU는 이 과정에 전혀 관여하지 않는다.",
                    "**Circular 모드(circular mode)**에서는 버퍼 끝에 도달하면 DMA가 자동으로 처음으로 돌아간다. 버퍼를 둘로 나눠 반완료(half-transfer) 인터럽트에서 앞 절반을, 완료(transfer-complete) 인터럽트에서 뒤 절반을 처리하면, DMA가 한쪽을 채우는 동안 CPU가 다른 쪽을 처리한다. 이것이 더블 버퍼링이다.",
                    "조건은 하나다. 처리가 그 반쪽이 다시 채워지기 전에 끝나야 한다. f_s = 10 kHz, 반쪽 N = 256샘플이면 예산은 25.6 ms이고 168 MHz에서 약 430만 사이클이다. 처리 시간을 측정해 최악값을 기록해 두면 기능을 추가할 때 여유가 얼마나 남았는지 바로 보인다."
                ],
                code: {
                    lang: "c",
                    title: "콜백 처리 시간 측정 (DWT 사이클 카운터)",
                    src: `#define N 256
static uint16_t buf[2 * N];
static uint32_t worst;                          // 최악 처리 사이클

void cycles_init(void) {                        // Cortex-M3/M4/M7
    CoreDebug->DEMCR |= CoreDebug_DEMCR_TRCENA_Msk;
    DWT->CYCCNT = 0;
    DWT->CTRL  |= DWT_CTRL_CYCCNTENA_Msk;
}

static void on_block(uint16_t *p) {
    uint32_t t0 = DWT->CYCCNT;
    process(p, N);
    uint32_t used = DWT->CYCCNT - t0;           // 랩어라운드에도 맞음
    if (used > worst) worst = used;
}

void HAL_ADC_ConvHalfCpltCallback(ADC_HandleTypeDef *h) { on_block(&buf[0]); }
void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *h)     { on_block(&buf[N]); }
// 예산: N / f_s = 256 / 10 kHz = 25.6 ms ≈ 4.3 M 사이클 (168 MHz)`,
                    note: "DWT 사이클 카운터는 Cortex-M0/M0+에는 없다"
                },
                tip: "Cortex-M7처럼 D-캐시가 있는 칩에서는 DMA가 쓴 버퍼를 CPU가 읽기 전에 해당 캐시 라인을 무효화하거나, MPU로 버퍼 영역을 캐시 불가로 지정해야 옛 값을 읽지 않는다."
            },
            {
                h: "보정과 디버깅",
                list: [
                    "**값이 4095나 0에 붙어 있다**: 핀이 아날로그 모드인지, 입력이 범위를 넘는지, 채널 번호가 핀과 맞는지 본다.",
                    "**값이 수십 LSB씩 흔들린다**: 아날로그 접지와 Vref 디커플링, 근처 디지털 신호, 소스 임피던스 대비 샘플링 시간을 순서대로 확인한다. 입력을 GND와 Vref에 직접 묶어 ADC 자체의 잡음 하한부터 잰다.",
                    "**주기적인 잡음 성분이 보인다**: 스위칭 전원이나 PWM 주파수가 접혀 들어온 것일 수 있다. f_s를 바꿨을 때 잡음 주파수가 따라 움직이면 에일리어싱이다.",
                    "**샘플 간격이 의심스럽다**: 콜백 입구에서 GPIO를 토글해 스코프로 블록 주기를 잰다. 256샘플에 10 kHz면 25.6 ms마다 토글되어야 한다.",
                    "**DMA가 멈춘다**: 전송 에러 플래그와 ADC 오버런(overrun) 플래그를 확인한다. 많은 STM32 ADC는 오버런이 나면 DMA 요청을 멈추므로 재시작 처리가 필요하다.",
                    "**오프셋·이득 보정**: 알려진 두 전압을 측정해 `y = a·x + b`로 보정한다. 칩에 자체 보정(self-calibration) 기능이 있으면 시작 시 먼저 실행한다."
                ]
            }
        ],
        pitfalls: [
            "전원 레일을 Vref로 쓰면서 12비트 정확도를 기대: ±1% 레일이면 수십 LSB 오차가 기본으로 깔린다.",
            "안티에일리어싱 필터 없이 디지털 필터로 잡음을 거르려 함: 이미 접혀 들어온 성분은 신호와 구별할 수 없다.",
            "고임피던스 분압기에 최소 샘플링 시간 사용: 샘플 커패시터가 덜 충전되어 값이 낮게 나오고 채널 간 간섭이 커진다.",
            "콜백 처리 시간이 반쪽 버퍼 시간을 넘음: 처리 중인 데이터를 DMA가 덮어써 간헐적인 이상값이 생긴다.",
            "D-캐시가 있는 칩에서 DMA 버퍼의 캐시 관리를 빠뜨림: 디버거로 본 메모리는 맞는데 코드는 옛 값을 읽는다."
        ],
        summary: [
            "SAR ADC는 샘플-홀드 후 MSB부터 이진 탐색하며, 변환 시간은 샘플링 시간에 비트 수만큼의 클럭을 더한 값이다.",
            "LSB = Vref/2ⁿ이지만 실제 정확도는 기준 전압, 잡음, 소스 임피던스가 정한다.",
            "f_s는 이론상 신호 대역의 2배 초과, 실무에서는 5–10배에 아날로그 안티에일리어싱 필터를 더한다.",
            "타이머 트리거 + DMA circular + 반/완료 인터럽트로 CPU 개입 없는 연속 수집을 만들고, 처리 시간이 반쪽 버퍼 시간 안에 드는지 측정한다."
        ]
    },

    rtos: {
        intro: "RTOS(Real-Time Operating System)는 여러 개의 무한 루프, 즉 태스크(task)를 우선순위(priority)에 따라 번갈아 실행해 주는 작은 커널이다. 목표는 평균 성능이 아니라 가장 늦어도 언제까지 반응한다는 응답 시간(response time)의 보장이다. 이 글은 태스크와 컨텍스트 스위치(context switch)의 실제 동작, 블로킹 API, 동기화 도구 선택, 우선순위 역전(priority inversion), 스케줄 가능성(schedulability) 분석 순서로 설명한다.",
        sections: [
            {
                h: "태스크의 정체: 함수, 스택, TCB",
                p: [
                    "태스크는 `for (;;)` 루프를 가진 C 함수, 그 함수 전용 스택, 그리고 커널이 관리하는 태스크 제어 블록(TCB, Task Control Block)의 묶음이다. TCB에는 저장된 스택 포인터, 우선순위, 상태, 대기 목록 연결 정보가 들어 있다. 태스크가 실행을 멈추면 레지스터는 모두 자기 스택에 저장되고 TCB에는 그 스택 꼭대기 주소만 남는다.",
                    "스택은 태스크마다 따로 잡히므로 RAM 사용량의 대부분을 차지한다. FreeRTOS `xTaskCreate`의 스택 크기 인자는 바이트가 아니라 워드 단위라서 32비트 MCU에서 `256`은 1 KB다. 크기는 지역 변수, 가장 깊은 호출 체인, 예외 프레임 여유를 더해 추정하고, 실행 중 `uxTaskGetStackHighWaterMark()`로 남은 최소 여유를 측정해 조정한다. **스택 오버플로(stack overflow)**는 이웃 메모리를 조용히 망가뜨리므로 개발 중에는 `configCHECK_FOR_STACK_OVERFLOW`를 2로 켜 둔다."
                ],
                table: {
                    head: ["상태", "의미", "들어가는 경우", "CPU"],
                    rows: [
                        ["Running", "지금 실행 중", "Ready 중 가장 높은 우선순위로 선택됨", "사용"],
                        ["Ready", "실행 가능, 차례 대기", "이벤트 도착, 타임아웃 만료, 선점당함", "차례 대기"],
                        ["Blocked", "이벤트·시간 대기", "큐·세마포어 대기, `vTaskDelay`", "0"],
                        ["Suspended", "명시적 정지", "`vTaskSuspend`", "0"]
                    ]
                }
            },
            {
                h: "컨텍스트 스위치는 어떻게 일어나나 (Cortex-M)",
                p: [
                    "Cortex-M용 RTOS는 세 가지 예외를 쓴다. SysTick은 주기적인 틱(tick) 인터럽트로 시간을 세고 지연과 타임아웃을 만료시킨다. PendSV는 실제 컨텍스트 스위치를 수행하고, SVC는 첫 태스크를 시작할 때 쓰인다. 태스크는 PSP(Process Stack Pointer)를, 예외 처리기는 MSP를 쓰므로 ISR의 스택 사용량이 태스크 스택마다 중복으로 잡히지 않는다.",
                    "전환은 이렇게 진행된다. 커널이 더 높은 우선순위 태스크가 Ready가 됐다고 판단하면 PendSV를 pending으로 만든다. PendSV 진입 때 하드웨어가 R0–R3, R12, LR, PC, xPSR을 현재 태스크 스택(PSP)에 쌓고, PendSV 핸들러가 나머지 R4–R11(FPU 문맥이 있으면 S16–S31도)을 같은 스택에 저장한 뒤 PSP를 TCB에 기록한다. 다음 태스크의 TCB에서 PSP를 꺼내 R4–R11을 복원하고 예외에서 복귀하면, 하드웨어가 나머지를 복원하면서 새 태스크가 이어서 실행된다.",
                    "PendSV를 가장 낮은 우선순위로 두는 것이 핵심이다. 그러면 컨텍스트 스위치는 다른 모든 ISR이 끝난 뒤에만 일어나 ISR 도중에 태스크가 바뀌는 일이 없다. ISR이 여러 개 이어져도 tail-chaining으로 마지막에 한 번만 전환된다."
                ]
            },
            {
                h: "선점, 블로킹, 그리고 시간 지연",
                p: [
                    "선점형(preemptive) 스케줄러의 규칙은 단순하다. Ready 상태 중 가장 높은 우선순위의 태스크가 항상 실행된다. FreeRTOS에서 `configUSE_TIME_SLICING`이 켜져 있으면 같은 우선순위끼리는 틱마다 번갈아 실행된다. 높은 우선순위 태스크가 블로킹 없이 계속 돌면 그 아래 태스크는 영원히 실행되지 못하므로(기아, starvation), 모든 태스크는 결국 무언가를 기다리며 Blocked로 가야 한다.",
                    "`vTaskDelay(n)`은 지금부터 n틱 뒤라는 상대 지연이다. 루프 본문이 1.2 ms 걸리고 `vTaskDelay(pdMS_TO_TICKS(5))`를 부르면 주기는 약 6.2 ms가 되고, 본문 시간이 흔들리면 주기도 흔들린다. `xTaskDelayUntil`(옛 이름 `vTaskDelayUntil`)은 이전에 깨어난 기준 시각에 주기를 더한 절대 시각까지 기다리므로 본문 시간과 무관하게 5 ms 주기를 유지한다.",
                    "틱 단위의 함정도 있다. 지연은 틱 인터럽트 개수를 세므로 1 kHz 틱에서 `vTaskDelay(1)`은 다음 틱까지, 즉 0 ms 초과 1 ms 이하의 아무 시간이나 될 수 있다. 최소 1 ms가 꼭 필요하면 2틱을 기다리거나 하드웨어 타이머를 쓴다.",
                    "ISR에서 태스크를 깨울 때는 `...FromISR` API를 쓰고, 깨어난 태스크가 현재 태스크보다 높으면 `portYIELD_FROM_ISR(woken)`으로 ISR이 끝나자마자 전환되게 한다. 이것을 빠뜨리면 깨어난 태스크가 다음 틱이나 다음 커널 호출까지 기다린다."
                ],
                demo: "lesson"
            },
            {
                h: "동기화 도구 고르기",
                p: [
                    "도구는 무엇을 넘기는가로 고른다. 데이터를 넘기면 큐(queue), 사건이 일어났다는 사실만 넘기면 **세마포어(semaphore)**나 태스크 알림(task notification), 공유 자원의 소유권을 관리하면 **뮤텍스(mutex)**다. 용도를 섞어 쓰면 동작은 해도 우선순위 상속(priority inheritance) 같은 보장을 잃는다.",
                    "큐는 데이터를 값으로 복사하므로 보낸 쪽이 변수를 재사용해도 안전하지만, 큰 구조체는 복사 비용이 크니 포인터를 넘기고 소유권 규칙을 정한다. 태스크 알림은 별도 객체 없이 TCB 안의 값을 쓰므로 가장 가볍고, FreeRTOS 문서는 바이너리 세마포어로 깨우는 것보다 45% 빠르고 RAM도 덜 쓴다고 설명한다. 이 수치는 V8.1.2 세마포어와 비교한 값이고, 개선된 V8.2.0 이후 세마포어와 비교하면 35%다. 대신 받는 쪽이 특정 태스크 하나로 정해진다."
                ],
                table: {
                    head: ["도구", "용도", "ISR에서 보내기", "우선순위 상속"],
                    rows: [
                        ["큐", "데이터 전달 (복사)", "가능 (`xQueueSendFromISR`)", "없음"],
                        ["바이너리/카운팅 세마포어", "이벤트 신호, 개수 세기", "가능 (`xSemaphoreGiveFromISR`)", "없음"],
                        ["뮤텍스", "공유 자원 보호 (소유권)", "불가", "있음"],
                        ["태스크 알림", "특정 태스크 하나 깨우기", "가능 (`vTaskNotifyGiveFromISR`)", "없음"]
                    ]
                },
                tip: "뮤텍스를 잡은 채로 블로킹 호출(다른 큐 대기, 긴 지연)을 하지 않는다. 잡고 있는 시간이 곧 다른 태스크의 대기 시간이다."
            },
            {
                h: "우선순위 역전과 상속",
                p: [
                    "세 태스크 H(높음), M(중간), L(낮음)이 있고 H와 L이 같은 자원을 쓴다고 하자. L이 잠금을 잡은 상태에서 H가 깨어나 같은 잠금을 기다리며 Blocked가 된다. 여기까지는 L이 곧 잠금을 놓을 것이므로 정상이다. 그런데 이때 자원과 무관한 M이 Ready가 되면, M은 L보다 높으므로 L을 선점하고 원하는 만큼 실행된다. 결국 H는 M이 끝날 때까지 기다리며 그 시간에는 상한이 없다.",
                    "1997년 화성 탐사선 Mars Pathfinder가 이 현상으로 반복 리셋되었다. 낮은 우선순위의 기상 데이터 태스크가 정보 버스의 뮤텍스를 잡고 있는 동안 중간 우선순위 통신 태스크가 실행되어, 높은 우선순위 버스 관리 태스크가 제때 돌지 못했고 워치독(watchdog)이 시스템을 리셋했다. 해결책은 VxWorks 뮤텍스의 우선순위 상속 옵션을 켜는 것이었다.",
                    "우선순위 상속은 H가 기다리는 동안 L의 우선순위를 H 수준으로 올린다. 그러면 M이 L을 선점할 수 없어 L이 임계구역(critical section)을 빨리 끝내고 잠금을 넘기며, H의 최악 대기 시간은 L의 임계구역 길이로 한정된다. 바이너리 세마포어에는 소유자 개념이 없어 상속이 일어나지 않으므로 자원 보호에는 뮤텍스를 쓴다."
                ],
                list: [
                    "잠금을 잡는 구간은 짧게 하고, 그 안에서 블로킹하지 않는다.",
                    "잠금을 여러 개 잡아야 하면 모든 태스크가 같은 순서로 잡아 교착 상태(deadlock)를 피한다.",
                    "상속은 대기 시간을 한정할 뿐 없애지 않는다. 그 블로킹 시간은 스케줄 분석에 포함한다."
                ]
            },
            {
                h: "스케줄 가능성 분석: 이용률 한계와 응답 시간",
                p: [
                    "주기 태스크 i의 최악 실행 시간(worst-case execution time, WCET)을 C_i, 주기를 T_i라 하면 CPU 이용률(utilization)은 `U = Σ C_i / T_i`다. 주기가 짧을수록 높은 우선순위를 주는 RMS(Rate-Monotonic Scheduling)에서 Liu와 Layland는 `U ≤ n(2^(1/n) − 1)`이면 모든 마감이 지켜짐을 보였다. 이 한계는 n=1에서 1.0, n=2에서 약 0.828, n=3에서 약 0.780이고, n이 커지면 ln 2 ≈ 0.693으로 내려간다.",
                    "이 조건은 충분조건일 뿐 필요조건이 아니다. 아래 세 태스크는 U = 0.85로 한계 0.780을 넘지만 실제로는 스케줄 가능하다. 이를 확인하는 방법이 응답 시간 분석(response time analysis)이다. 태스크 i의 최악 응답 시간은 `R = C_i + Σ ⌈R / T_j⌉ × C_j`(j는 i보다 높은 우선순위)를 값이 고정될 때까지 반복해 얻고, `R ≤ T_i`면 마감을 지킨다.",
                    "T3를 따라가면 R = 7 → `7 + 2×1 + 1×3 = 12` → `7 + 3×1 + 2×3 = 16` → `7 + 4×1 + 2×3 = 17` → 17에서 고정된다. 17 ms는 마감 20 ms 안이다. 실제 분석에서는 여기에 뮤텍스 대기 같은 블로킹 시간, ISR 실행 시간, 컨텍스트 스위치 비용을 더하며, C_i는 평균이 아니라 측정·분석한 최악값이어야 한다."
                ],
                table: {
                    head: ["태스크", "C (ms)", "T (ms)", "C/T", "우선순위", "R (ms)"],
                    rows: [
                        ["T1", "1", "5", "0.20", "높음", "1"],
                        ["T2", "3", "10", "0.30", "중간", "4"],
                        ["T3", "7", "20", "0.35", "낮음", "17"]
                    ]
                },
                code: {
                    lang: "py",
                    title: "응답 시간 분석 (고정 우선순위, 마감 = 주기)",
                    src: `import math

def rta(tasks):            # [(C, T)] 우선순위 높은 순 (RMS: T 짧은 순)
    res = []
    for i, (c, t) in enumerate(tasks):
        r = c
        while True:
            nr = c + sum(math.ceil(r / tj) * cj for cj, tj in tasks[:i])
            if nr == r or nr > t:
                break
            r = nr
        res.append(nr if nr <= t else None)   # None = 마감 초과
    return res

tasks = [(1, 5), (3, 10), (7, 20)]
print(round(sum(c / t for c, t in tasks), 3))  # 0.85 > 0.780 (n=3 한계)
print(rta(tasks))                              # [1, 4, 17] → 모두 마감 안`,
                    note: "태스크 독립, 블로킹 없음, 마감 = 주기를 가정한 기본형이다"
                }
            }
        ],
        pitfalls: [
            "주기 작업에 `vTaskDelay` 사용: 본문 실행 시간만큼 주기가 늘고 누적 오차(drift)가 생긴다.",
            "FreeRTOS 스택 크기를 바이트로 착각: 워드 단위라서 의도보다 4배 큰 스택을 잡게 된다.",
            "자원 보호에 바이너리 세마포어 사용: 우선순위 상속이 없어 역전 시간이 무한정 길어질 수 있다.",
            "ISR에서 태스크를 깨운 뒤 `portYIELD_FROM_ISR` 생략: 높은 우선순위 태스크가 다음 틱까지 늦게 실행된다.",
            "높은 우선순위 태스크에서 폴링 루프: 블로킹하지 않으므로 아래 태스크가 굶는다.",
            "이용률 한계만 보고 판단: 한계 초과가 곧 실패는 아니고, 블로킹·ISR 시간을 빼고 계산한 한계 이하가 곧 안전도 아니다."
        ],
        summary: [
            "태스크는 함수 + 전용 스택 + TCB이며, Blocked 상태에서는 CPU를 쓰지 않는다.",
            "Cortex-M RTOS는 SysTick으로 시간을 세고, 가장 낮은 우선순위의 PendSV에서 R4–R11을 저장·복원해 태스크를 바꾼다.",
            "주기 작업은 `xTaskDelayUntil`, ISR→태스크 통지는 `FromISR` API와 yield로 지연을 줄인다.",
            "데이터는 큐, 사건은 세마포어나 알림, 공유 자원은 우선순위 상속 뮤텍스로 다룬다.",
            "이용률 한계는 충분조건이며, 응답 시간 분석으로 각 태스크의 최악 응답을 마감과 비교한다."
        ]
    },

    power: {
        intro: "배터리 기기의 수명은 MCU가 얼마나 오래 잠들어 있느냐로 결정된다. 깨어 있는 시간은 짧게, 잠든 동안의 전류는 작게 만드는 것이 저전력 설계의 핵심이고, 그 수단이 `WFI`와 저전력 모드(low-power mode)다. 한편 현장에 나간 기기는 펌웨어를 안전하게 바꿀 수 있어야 하므로 **부트로더(bootloader)**가 이미지를 검증하고, 실패해도 이전 버전으로 돌아오는 구조가 필요하다. 이 글은 전류 예산(current budget), 저전력 모드, 슬립 루프, 부트로더 배치, A/B 업데이트, 브라운아웃(brown-out)과 워치독(watchdog) 순서로 설명한다.",
        sections: [
            {
                h: "전류 예산: 평균 전류로 수명 계산하기",
                p: [
                    "CMOS 회로의 소비 전력은 스위칭할 때 드는 동적 전력(dynamic power, 대략 `C × V² × f`)과 트랜지스터 누설(leakage)로 늘 흐르는 정적 전력(static power)으로 나뉜다. 동적 전력은 클럭에 비례하므로 데이터시트는 RUN 전류를 µA/MHz로 표시하는 경우가 많고, 클럭을 멈추면 사라진다. 잠든 상태의 전류는 대부분 누설과 켜 둔 아날로그 블록(레귤레이터, RTC, BOR)에서 나온다.",
                    "배터리 수명은 평균 전류로 계산한다. 1초마다 깨어나 2 ms 동안 10 mA를 쓰고 나머지 998 ms를 5 µA로 잔다면 평균은 `(10 mA × 2 ms + 5 µA × 998 ms) / 1000 ms ≈ 20 µA + 5 µA = 25 µA`다. 공칭 220 mAh 코인 셀이라면 이론상 약 8,800시간, 1년 남짓이다.",
                    "이 계산에서 두 가지가 보인다. 첫째, 활성 구간이 평균의 80%를 차지하므로 빨리 일하고 빨리 자는 것(race-to-sleep)이 슬립 전류를 줄이는 것보다 효과가 크다. 둘째, 5 µA의 슬립 전류도 전체의 20%라 무시할 수 없다. 실제로는 셀의 펄스 전류 내성, 자가 방전(self-discharge), 온도 때문에 수명이 이보다 짧아지므로 여유를 둔다."
                ]
            },
            {
                h: "저전력 모드의 사다리: Sleep, Stop, Standby",
                p: [
                    "Cortex-M 코어 자체는 두 단계만 안다. `WFI`/`WFE`를 실행할 때 `SCB->SCR`의 SLEEPDEEP 비트가 0이면 sleep, 1이면 deep sleep이다. 제조사는 deep sleep을 자기 전원 관리 블록과 묶어 여러 모드로 나누며, STM32F4에서는 `PWR_CR`의 PDDS 비트가 Stop과 Standby를 가르고 LPDS 비트가 Stop 중 레귤레이터를 저전력으로 둘지 정한다.",
                    "깊은 모드일수록 끄는 것이 많아 전류는 작아지지만 깨어나는 데 시간이 걸리고 잃는 상태가 많아진다. Stop에서 깨어난 STM32F4는 내부 16 MHz RC 발진기(oscillator)인 HSI로 시작하므로 PLL을 다시 설정해야 하고, Standby에서 깨어나면 SRAM과 레지스터가 사라져 리셋처럼 처음부터 시작한다."
                ],
                table: {
                    head: ["모드", "멈추는 것", "유지되는 것", "깨우는 것", "복귀"],
                    rows: [
                        ["Sleep", "CPU 클럭", "모든 상태, 주변장치 동작", "모든 인터럽트", "다음 명령부터 바로 계속"],
                        ["Stop", "대부분의 클럭, PLL·HSE", "SRAM, 레지스터", "EXTI 라인 (RTC 알람·웨이크업 포함)", "Sleep보다 느림, HSI로 깨어나 클럭 재설정 필요"],
                        ["Standby", "코어 전원 영역 대부분", "백업 레지스터·RTC (백업 SRAM은 설정 시)", "WKUP 핀, RTC, NRST, IWDG", "리셋 경로로 재시작"]
                    ]
                },
                tip: "모드별 전류는 제품군마다 수십 배 차이가 난다. 같은 Stop이라도 STM32F4와 저전력 계열은 크게 다르므로 반드시 해당 데이터시트의 전류 표로 예산을 잡는다."
            },
            {
                h: "WFI 루프를 안전하게 쓰는 법",
                p: [
                    "가장 단순한 저전력 코드는 할 일이 없으면 `WFI`로 자는 메인 루프다. 그런데 할 일이 있는지 확인한 직후, `WFI` 직전에 인터럽트가 들어와 플래그를 세우면 확인은 이미 끝났으므로 CPU는 그 일을 두고 다음 인터럽트까지 잠든다. 이것을 잃어버린 깨움(lost wake-up)이라 하며, 다음 인터럽트가 몇 초 뒤라면 그만큼 응답이 늦는다.",
                    "Cortex-M은 이 문제를 풀 수 있는 성질을 갖고 있다. PRIMASK로 인터럽트를 막은 상태에서도 `WFI`는 대기 중인 인터럽트가 있으면 깨어난다. 따라서 인터럽트를 막고, 확인하고, 자고, 인터럽트를 푸는 순서로 쓰면 확인 뒤에 도착한 인터럽트가 `WFI`를 즉시 깨우고, PRIMASK가 풀리는 순간 ISR이 실행된다."
                ],
                code: {
                    lang: "c",
                    title: "경쟁 없는 슬립 루프",
                    src: `for (;;) {
    __disable_irq();               // PRIMASK = 1
    if (!has_work()) {
        __DSB();                   // 이전 메모리 쓰기 완료
        __WFI();                   // 막혀 있어도 pending IRQ 가 있으면 깨어남
    }
    __enable_irq();                // 여기서 대기 중이던 ISR 실행
    while (has_work())
        do_work();
}`,
                    note: "RTOS에서는 idle 태스크가 이 역할을 하고, FreeRTOS tickless idle(`configUSE_TICKLESS_IDLE`)은 다음 깨어날 시각까지 틱 인터럽트도 멈춘다"
                },
                list: [
                    "디버거가 연결돼 있으면 디버그 회로에 전원이 유지되고 설정에 따라 저전력 모드에서도 클럭이 살아 있어, 전류가 실제보다 크게 측정된다. 전류는 디버거를 분리하고 잰다.",
                    "개발 중 Stop에서 디버거가 끊기는 것이 불편하면 `DBGMCU_CR`의 DBG_STOP 등 비트를 켜되, 출하 펌웨어에서는 끈다.",
                    "떠 있는 입력 핀, 불필요한 풀업, 켜 둔 주변장치 클럭은 슬립 전류를 늘리는 흔한 원인이다. 안 쓰는 핀은 아날로그 모드로 두고 클럭은 끈다."
                ]
            },
            {
                h: "부트로더와 Flash 배치",
                p: [
                    "부트로더는 리셋 직후 항상 먼저 실행되는 작은 프로그램이다. 업데이트 상태를 확인하고, 앱 이미지를 검증하고, 앱으로 점프한다. 부트로더 자체는 현장에서 바꾸지 않는 것을 원칙으로 하며 쓰기 보호(write protection)로 실수로 지워지지 않게 한다.",
                    "배치는 Flash의 지우기 단위인 섹터(sector)가 결정한다. STM32F407(1 MB)은 섹터 0–3이 16 KB, 섹터 4가 64 KB, 섹터 5–11이 128 KB인 비균일 구조라서, 따로 지우고 써야 하는 영역은 서로 다른 섹터에 놓아야 한다. 아래는 이 구조에 맞춘 A/B 배치의 한 예다.",
                    "앱으로 점프할 때는 앱이 리셋 직후와 같은 상태에서 시작하도록 정리한다. 부트로더가 켠 SysTick과 주변장치 인터럽트를 끄고 NVIC의 enable·pending 비트를 지운다. 남아 있으면 앱이 그 ISR을 준비하기 전에 인터럽트가 들어와 엉뚱한 핸들러가 실행된다. 그 뒤 `SCB->VTOR`를 앱 벡터 테이블(vector table)로 옮기고, 앱 이미지의 첫 워드로 MSP를, 둘째 워드로 리셋 핸들러 주소를 읽어 점프한다."
                ],
                table: {
                    head: ["영역", "섹터", "시작 주소", "크기"],
                    rows: [
                        ["부트로더", "0–2", "`0x0800_0000`", "48 KB"],
                        ["부팅 상태 (메타데이터)", "3", "`0x0800_C000`", "16 KB"],
                        ["슬롯 A", "4–7", "`0x0801_0000`", "448 KB"],
                        ["슬롯 B", "8–11", "`0x0808_0000`", "512 KB (앱은 448 KB 이하로 제한)"]
                    ]
                },
                list: [
                    "VTOR 값은 벡터 테이블 크기(엔트리 수 × 4)를 2의 거듭제곱으로 올린 경계에 맞춰야 한다. 엔트리가 65–128개면 512바이트 경계다.",
                    "앱은 자기 주소(예: `0x0801_0000`)에 맞게 링크되어야 하고, 앱의 시작 코드가 VTOR을 Flash 시작 주소로 되돌려 쓰지 않는지 확인한다. 벤더 `SystemInit()`의 벡터 테이블 오프셋 설정이 흔한 원인이다.",
                    "점프 전에 앱의 첫 워드(초기 MSP)가 SRAM 범위 안인지 확인하면, 비어 있는 슬롯(`0xFFFF_FFFF`)으로 점프하는 사고를 막는다."
                ]
            },
            {
                h: "검증과 A/B 업데이트: 전원이 끊겨도 벽돌이 되지 않게",
                p: [
                    "검증은 두 단계다. 이미지 해시(hash, 예: SHA-256)로 데이터가 깨지지 않았는지 확인하고, 그 해시에 대한 서명(signature, 예: ECDSA P-256)을 부트로더에 내장된 공개키(public key)로 검증해 우리가 만든 이미지인지 확인한다. 공개키는 부트로더와 함께 쓰기 보호 영역에 두며, 여기에 버전 비교를 더해 알려진 취약 버전으로 되돌리는 공격을 막는 것이 롤백 방지(anti-rollback)다.",
                    "A/B 업데이트의 원리는 동작하는 이미지를 항상 하나 남기는 것이다. 새 이미지는 실행 중이 아닌 슬롯에 받고, 검증이 끝난 뒤에만 부팅 상태를 바꾼다. 새 이미지는 먼저 시험 부팅(test boot)되고, 앱이 스스로 점검(통신, 센서, 워치독 동작)을 마친 뒤 확인(confirm)을 기록해야 정식 이미지가 된다. 확인 없이 다시 리셋되면 부트로더는 새 이미지가 실패했다고 보고 이전 슬롯으로 롤백(rollback)한다.",
                    "슬롯에서 바로 실행하는 XIP(execute-in-place) 구조라면 A와 B의 실행 주소가 다르므로, 같은 소스라도 슬롯마다 따로 링크한 이미지 두 개가 필요하다. 이를 피하려고 MCUboot 같은 부트로더는 새 이미지를 실행 슬롯으로 복사하거나 두 슬롯을 맞바꾸는(swap) 방식도 제공한다."
                ],
                table: {
                    head: ["전원이 끊긴 시점", "다음 부팅 결과"],
                    rows: [
                        ["새 이미지를 슬롯 B에 받는 중", "상태 미변경 → A로 부팅, 다운로드 재시도"],
                        ["B 검증 후, 상태 기록 전", "A로 부팅 (B는 다시 검증하면 됨)"],
                        ["B 시험 부팅 중, 확인 기록 전", "미확인 시험 상태 → 부트로더가 A로 롤백"],
                        ["B 확인 기록 후", "B가 정식 이미지로 부팅"]
                    ]
                },
                code: {
                    lang: "c",
                    title: "부팅 슬롯 결정 (상태 기계 요약)",
                    src: `typedef enum { CONFIRMED, PENDING, TESTING } boot_state_t;
typedef struct { boot_state_t state; int active, previous; } boot_meta_t;

int choose_slot(void) {
    boot_meta_t m = meta_read();
    if (m.state == TESTING) {          // 지난 시험 부팅이 확인 없이 리셋됨
        m.active = m.previous;         // → 롤백
        m.state  = CONFIRMED;
        meta_write(&m);
    } else if (m.state == PENDING) {   // 새 이미지가 막 준비됨
        m.state = TESTING;             // 이번 한 번만 시험 부팅
        meta_write(&m);
    }
    if (image_valid(m.active))   return m.active;     // 해시·서명·버전
    if (image_valid(m.previous)) return m.previous;
    return -1;                         // 둘 다 실패 → 복구(DFU) 모드
}
// 앱: 자체 점검 통과 후 state = CONFIRMED 기록`,
                    note: "`meta_write` 도중에도 전원이 끊길 수 있으므로 실제로는 상태를 시퀀스 번호와 함께 두 벌로 쓰고 유효한 최신 것을 읽는다"
                },
                demo: "lesson"
            },
            {
                h: "브라운아웃과 워치독: 현장에서 살아남기",
                p: [
                    "전압이 서서히 떨어지는 브라운아웃 구간에서 MCU는 리셋되지도, 정상 동작하지도 않는 애매한 상태가 되어 명령을 잘못 실행하거나 Flash에 엉뚱한 값을 쓸 수 있다. BOR(Brown-Out Reset)은 전압이 문턱 아래로 내려가면 칩을 리셋 상태로 붙잡아 이를 막는다. STM32F4는 옵션 바이트(option bytes)에서 BOR 문턱을 고르며, Flash 쓰기 병렬도(`PSIZE`)도 전원 전압 범위에 묶여 있어(32비트 단위 쓰기는 2.7–3.6 V) Flash를 쓰는 부트로더라면 BOR을 켜 두는 것이 좋다.",
                    "독립 워치독(independent watchdog, IWDG)은 별도의 LSI 발진기로 동작해 메인 클럭이 죽어도 리셋을 걸 수 있고, 한 번 켜면 소프트웨어로 끌 수 없다. 타임아웃은 `4 × 2^PR × (RLR + 1) / f_LSI`이고, 분주 256(PR=6), RLR=4095, f_LSI=32 kHz면 약 32.8 s다. 다만 LSI는 칩·전압·온도에 따라 공칭값에서 크게 벗어나므로(ST HAL 문서는 LSI를 TIM5 CH4 입력 캡처로 재서 보정하라고 안내한다), 리프레시 주기는 데이터시트의 LSI 최대 주파수로 계산한 가장 짧은 타임아웃 기준으로 여유 있게 잡는다.",
                    "워치독은 A/B 업데이트의 마지막 안전망이기도 하다. 새 이미지가 시험 부팅 중 멈추면 워치독 리셋이 걸리고, 부트로더는 확인되지 않은 시험 상태를 보고 롤백한다. 단 F4의 IWDG는 Stop과 Standby에서도 계속 돌기 때문에, 오래 자는 기기는 타임아웃 전에 깨어나 리프레시해야 한다. 저전력 모드에서 워치독을 멈추는 옵션은 제품군마다 다르니 RM을 확인한다."
                ],
                list: [
                    "부팅 시 `RCC->CSR`의 리셋 원인 플래그(PORRSTF, PINRSTF, BORRSTF, SFTRSTF, IWDGRSTF, WWDGRSTF, LPWRRSTF)를 읽어 기록한 뒤 `RMVF`로 지운다. 현장 불량 분석의 첫 단서다.",
                    "워치독 리프레시는 타이머 ISR에서 무조건 하지 말고, 모든 핵심 태스크가 살아 있음을 확인한 감시 루틴에서 한다. ISR에서 무조건 리프레시하면 메인 로직이 멈춰도 리셋되지 않는다."
                ]
            }
        ],
        pitfalls: [
            "확인과 `WFI` 사이의 경쟁을 무시: 드물게 이벤트 처리가 다음 인터럽트까지 밀린다. 인터럽트를 막은 채 확인하고 `WFI` 한다.",
            "Stop에서 깨어난 뒤 클럭을 재설정하지 않음: HSI 16 MHz로 돌아 UART 보레이트와 타이머 주기가 모두 틀어진다.",
            "앱으로 점프하면서 NVIC pending과 SysTick을 정리하지 않음: 앱 초기화 전에 부트로더 시절 인터럽트가 들어와 HardFault가 난다.",
            "앱 시작 코드가 VTOR을 Flash 시작 주소로 되돌림: 인터럽트가 부트로더 벡터로 가서 엉뚱한 핸들러가 실행된다.",
            "디버거를 연결한 채 슬립 전류 측정: 디버그 회로 때문에 실제보다 훨씬 큰 값이 나온다.",
            "ISR에서 워치독을 무조건 리프레시: 메인 루프가 멈춰도 리셋되지 않아 워치독이 무력화된다."
        ],
        summary: [
            "수명은 평균 전류로 계산하며, 활성 시간을 줄이는 것이 보통 가장 큰 효과를 낸다.",
            "Sleep·Stop·Standby는 깊을수록 전류가 줄고 복귀 비용과 잃는 상태가 늘며, Stop 복귀 후에는 클럭을 다시 설정한다.",
            "슬립 루프는 인터럽트를 막고 확인한 뒤 `WFI` 하여 깨움을 잃지 않는다.",
            "부트로더는 서명 검증 후 NVIC·SysTick 정리, VTOR·MSP 설정 순서로 앱에 넘기고, A/B 슬롯과 시험 부팅·확인으로 업데이트 실패를 되돌린다.",
            "BOR은 낮은 전압에서의 오동작을, 워치독은 멈춘 소프트웨어를 리셋으로 바꾸는 마지막 안전망이다."
        ]
    }
});

LAB.article("embedded", {
    bits: {
        intro: "레지스터 하나에는 여러 기능이 비트 단위로 들어 있고, 정수 하나도 결국 비트 패턴이다. 비트 연산은 이 패턴을 직접 다루는 도구이고, **2의 보수(two's complement)**는 같은 패턴을 부호 있는 수로 읽는 규칙이다. 둘을 함께 이해하면 레지스터 조작, 넘침 버그, 시프트 결과가 왜 그렇게 나오는지 한 번에 설명된다.",
        sections: [
            {
                h: "네 가지 연산은 각자 역할이 정해져 있다",
                p: [
                    "AND, OR, XOR, NOT은 비트마다 독립적으로 계산된다. 자리끼리 영향을 주지 않으므로 32bit 연산은 실제로 1bit 연산 32개를 동시에 하는 것이다.",
                    "실무에서는 연산마다 용도가 굳어져 있다. 한쪽 피연산자를 **마스크(mask)**로 두고, 마스크가 1인 자리만 바꾸거나 읽는다. 마스크가 0인 자리가 어떻게 되는지가 연산을 고르는 기준이다."
                ],
                table: {
                    head: ["연산", "마스크 1인 자리", "마스크 0인 자리", "주 용도"],
                    rows: [
                        ["`x & m`", "x 그대로", "0", "골라내기 · 끄기는 `x & ~m`"],
                        ["`x | m`", "1", "x 그대로", "켜기"],
                        ["`x ^ m`", "x 반전", "x 그대로", "뒤집기 · 바뀐 비트 찾기"],
                        ["`~x`", "—", "—", "마스크 반전"]
                    ]
                },
                demo: "lesson",
                tip: "실험실에서 A를 레지스터, B를 마스크로 놓고 연산만 바꿔 보면 '그대로 남는 자리'가 한눈에 보인다."
            },
            {
                h: "마스크 만들기와 필드 읽기·쓰기",
                p: [
                    "단일 비트 마스크는 `1u << n`이다. `u` 접미사가 중요하다. 32bit `int`에서 `1 << 31`은 부호 비트까지 밀어 올려 C에서 **정의되지 않은 동작(undefined behavior)**이 되고, `1u << 31`은 문제없다.",
                    "여러 비트로 된 필드는 폭 w의 마스크 `(1u << w) - 1`을 위치 p로 옮겨 쓴다. STM32의 `MODER`는 핀당 2bit이므로 5번 핀의 마스크는 `0x3u << 10`이다.",
                    "쓰기에서 '비우기'를 빼먹으면 이전 값의 1이 남는다. `MODER` 필드가 `11`(아날로그)인 상태에서 `|= 0x1u << 10`만 하면 결과는 여전히 `11`이다. 넣는 값도 마스크해야 폭을 넘는 값이 옆 필드를 침범하지 않는다."
                ],
                list: [
                    "읽기: `(reg >> p) & ((1u << w) - 1)` — 내리고 자르기",
                    "쓰기: `reg = (reg & ~(m << p)) | ((v & m) << p)` — 비우고 넣기",
                    "확인: 쓴 뒤 다시 읽어 같은 값인지"
                ],
                tip: "**읽기-수정-쓰기(read-modify-write)**는 세 단계라 중간에 인터럽트가 끼면 깨질 수 있다. `BSRR`처럼 쓰기만으로 비트를 바꾸는 레지스터가 있으면 그쪽을 쓴다."
            },
            {
                h: "2의 보수: 음수를 덧셈기 하나로",
                p: [
                    "w비트 패턴을 부호 있는 수로 읽을 때 최상위 비트의 가중치를 +2^(w−1) 대신 −2^(w−1)로 보는 것이 2의 보수다. 8bit의 `1000 0000`은 −128, `1111 1111`은 −128 + 127 = −1이다.",
                    "이 규칙의 장점은 덧셈 회로가 부호를 몰라도 된다는 것이다. `0xFF + 0x01`은 부호 없이 보면 255 + 1 = 256이 8bit로 잘려 0, 부호 있게 보면 −1 + 1 = 0이다. 비트 결과는 같고 해석만 다르다. 뺄셈도 `a − b = a + (~b + 1)`로 같은 덧셈기를 쓴다.",
                    "**1의 보수(ones' complement)** `~x`는 비트만 뒤집은 값이고, 여기에 1을 더해야 부호가 바뀐다. 1의 보수 표현은 +0과 −0이 따로 생겨 현대 CPU의 정수 표현으로는 쓰이지 않는다."
                ],
                table: {
                    head: ["비트 (8bit)", "부호 없음", "부호 있음"],
                    rows: [
                        ["`0000 0101`", "5", "5"],
                        ["`0111 1111`", "127", "127"],
                        ["`1000 0000`", "128", "−128"],
                        ["`1111 1011`", "251", "−5"],
                        ["`1111 1111`", "255", "−1"]
                    ]
                },
                tip: "최솟값 −128은 부호를 바꿀 수 없다. 8bit에서 `-(-128)`은 다시 `0x80`이다. 실험실의 `−A`에 `0x80`을 넣으면 V 플래그가 켜진다."
            },
            {
                h: "C와 V: 같은 덧셈, 두 가지 넘침",
                p: [
                    "덧셈 결과는 하나지만 넘침은 두 가지다. 부호 없는 해석에서 결과가 2^w 이상이면 자리올림이 생기고, 이것이 C(carry) 플래그다. 부호 있는 해석에서 양수 + 양수가 음수가 되거나 음수 + 음수가 양수가 되면 V(overflow) 플래그다.",
                    "**NZCV 플래그(Negative / Zero / Carry / oVerflow condition flags)**는 Arm의 조건 분기가 그대로 읽는다. 부호 없는 비교 `BHI`, `BLO`는 C와 Z를, 부호 있는 비교 `BGT`, `BLT`는 N, V, Z를 본다. 같은 `CMP` 뒤에 어느 분기를 쓰느냐가 곧 부호 있는 비교인지를 정한다.",
                    "뺄셈의 C는 아키텍처마다 뜻이 다르다. x86의 CF는 '빌림이 생겼다'(a < b)이고, Arm의 C는 '빌림이 없었다'(a ≥ b)이다. 실험실은 x86 방식으로 표시한다.",
                    "C 언어에는 플래그가 없다. 부호 없는 정수 넘침은 2^w로 나눈 나머지로 정의되어 있지만, 부호 있는 정수 넘침은 정의되지 않은 동작이다. 그래서 넘침 검사는 연산 전에 하거나 GCC/Clang의 `__builtin_add_overflow`를 쓴다."
                ],
                table: {
                    head: ["예 (8bit)", "결과", "C", "V", "해석"],
                    rows: [
                        ["200 + 100", "44", "1", "0", "부호 없는 넘침"],
                        ["100 + 100", "−56 (`0xC8`)", "0", "1", "부호 있는 넘침"],
                        ["−1 + 1", "0", "1", "0", "부호 있게 보면 정상"],
                        ["−100 + −100", "56 (`0x38`)", "1", "1", "둘 다 넘침"]
                    ]
                }
            },
            {
                h: "시프트와 회전: 채우는 비트가 핵심",
                p: [
                    "왼쪽 시프트 `x << n`은 빈자리를 0으로 채우고 ×2ⁿ 이 된다. 밀려나는 비트는 사라지고, Arm의 `LSLS`처럼 플래그를 바꾸는 명령에서는 마지막으로 밀려난 비트가 C에 들어간다.",
                    "오른쪽 시프트는 두 종류다. **논리 시프트(logical shift)**는 빈자리를 0으로 채우고, **산술 시프트(arithmetic shift)**는 부호 비트를 복사해 채운다. `0xF0`(−16)을 2칸 내리면 논리 시프트는 `0x3C`(60), 산술 시프트는 `0xFC`(−4)다. 산술 시프트는 음의 무한대 쪽으로 내리므로 `-7 >> 1`은 −4이고, C의 나눗셈 `-7 / 2`는 0 쪽으로 잘라 −3이다.",
                    "C에서 부호 있는 음수의 `>>` 결과는 **구현 정의(implementation-defined)**다. GCC와 Clang은 산술 시프트로 정의하지만, 이식성이 필요하면 부호 없는 타입으로 바꿔 시프트한다. 시프트 양이 타입 폭 이상(`x << 32`)이면 정의되지 않은 동작이다.",
                    "**비트 회전(bit rotation)**은 밀려난 비트를 반대쪽에 다시 넣는다. 비트가 사라지지 않아 해시와 암호 연산에 많이 쓰인다. C에는 회전 연산자가 없지만 `(x << n) | (x >> (32 - n))` 패턴을 컴파일러가 알아보고 `ROR` 한 명령으로 바꾼다. n = 0이면 `x >> 32`가 되므로 `x >> (-n & 31)` 형태로 쓴다."
                ]
            },
            {
                h: "작은 타입의 함정: 승격과 확장",
                p: [
                    "C에서 `int`보다 작은 타입(`uint8_t`, `int16_t` 등)은 연산 전에 `int`로 바뀐다. 이것이 **정수 승격(integer promotion)**이다. `uint8_t x = 0x0F;`일 때 `~x`는 `0xF0`이 아니라 `int`의 `0xFFFFFFF0`(−16)이고, 그래서 `~x == 0xF0`은 거짓이다.",
                    "부호 있는 작은 정수를 넓힐 때는 **부호 확장(sign extension)**이 일어난다. `int8_t`의 `0xF0`(−16)을 `int32_t`로 옮기면 `0xFFFFFFF0`이 되어 값 −16이 유지된다. 바이트 버퍼를 `char`로 읽는데 그 플랫폼의 `char`가 부호 있는 타입이면 `0x80` 이상 바이트가 음수로 확장되는 버그가 생긴다."
                ],
                list: [
                    "바이트 데이터는 `uint8_t`로 받기",
                    "비트 연산 결과는 원래 타입으로 캐스트한 뒤 비교하기",
                    "마스크 상수에는 `u` 접미사 붙이기"
                ]
            },
            {
                h: "자주 쓰는 비트 트릭",
                p: [
                    "`x & (x - 1)`은 가장 낮은 1 비트를 끈다. x − 1은 가장 낮은 1을 0으로, 그 아래의 0 들을 1로 바꾸기 때문이다. 결과가 0이면 x는 2의 거듭제곱이고, 반복하면 1의 개수를 셀 수 있다.",
                    "`x & -x`는 가장 낮은 1 비트만 남긴다. −x = ~x + 1이라서 가장 낮은 1과 그 아래는 x와 같고, 위쪽은 모두 반대이기 때문이다. **펜윅 트리(Fenwick tree)**의 인덱스 이동이 이 연산 하나다.",
                    "**팝카운트(population count)**를 두 값의 XOR에 적용하면 **해밍 거리(Hamming distance)**가 되고, 비트맵으로 만든 집합에 적용하면 원소 수가 된다."
                ],
                table: {
                    head: ["식", "x = `0110 1000`", "의미"],
                    rows: [
                        ["`x & (x - 1)`", "`0110 0000`", "가장 낮은 1 끄기"],
                        ["`x & -x`", "`0000 1000`", "가장 낮은 1만 남기기"],
                        ["`x | (x - 1)`", "`0110 1111`", "가장 낮은 1 아래를 모두 1로"],
                        ["`__builtin_ctz(x)`", "3", "아래쪽 0의 개수"],
                        ["`__builtin_popcount(x)`", "3", "1의 개수"]
                    ]
                }
            }
        ],
        pitfalls: [
            "`1 << 31`처럼 부호 있는 상수를 시프트 → 정의되지 않은 동작 · `1u << 31`로",
            "필드 쓰기에서 비우기(`& ~mask`)를 빼먹음 → 이전 1 비트가 남음",
            "`~u8`을 `uint8_t` 상수와 비교 → 정수 승격 때문에 항상 다름",
            "부호 있는 정수 넘침이 '한 바퀴 돌겠지'라고 가정 → 정의되지 않은 동작이라 컴파일러가 검사 코드를 지울 수 있음",
            "회전 구현에서 n = 0일 때 `x >> 32` → 정의되지 않은 동작",
            "Arm과 x86의 뺄셈 C 플래그 의미를 혼동"
        ],
        summary: [
            "AND는 골라내기·끄기, OR는 켜기, XOR는 뒤집기 — 항상 마스크와 함께",
            "2의 보수는 최상위 비트 가중치를 −2^(w−1)로 읽는 해석 · 덧셈 회로는 그대로",
            "C는 부호 없는 넘침, V는 부호 있는 넘침 · 분기 명령이 어떤 플래그를 보느냐가 부호를 결정",
            "오른쪽 시프트는 채우는 비트가 0(논리)인지 부호(산술)인지가 전부",
            "작은 타입은 `int`로 승격된 뒤 계산된다"
        ]
    }
});
