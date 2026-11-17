LAB.track({
    id: "protocols",
    name: "프로토콜",
    icon: "⇄",
    color: "#34d399",
    tagline: "보드 안 버스부터 인터넷까지 — 비트가 오가는 규칙",
    trends: [
        {
            title: "CAN XL · 10BASE-T1S 멀티드롭(multidrop)",
            when: "2024–2026",
            points: [
                "CAN XL: `ISO 11898-1:2024` 에 포함 · 데이터 필드 1–2048 B · 11bit 우선순위 ID 를 따로 둠",
                "20 Mbit/s 이상 데이터 구간(data phase)은 CAN SIC XL 트랜시버(CiA 610-3) 필요",
                "10BASE-T1S(802.3cg): 단일 페어(single pair) 10 Mbit/s 버스 · PLCA 로 충돌 없는 차례 송신",
                "IEEE 802.3da-2026 (2026-02 승인): 멀티드롭 확장 · 한 세그먼트에서 여러 장치 급전(power delivery)"
            ],
            refs: [
                { title: "CAN XL", by: "CAN in Automation (CiA)", url: "https://www.can-cia.org/can-knowledge/can-xl", kind: "doc" },
                { title: "IEEE 802.3cg-2019 Physical Layer Specifications and Management Parameters for 10 Mb/s Operation and Associated Power Delivery over a Single Balanced Pair of Conductors", by: "IEEE", year: 2019, url: "https://standards.ieee.org/ieee/802.3cg/7308/", kind: "spec" },
                { title: "IEEE P802.3da 10 Mb/s Single Pair Multidrop Segments Enhancement Task Force", by: "IEEE 802.3", year: 2026, url: "https://grouper.ieee.org/groups/802/3/da/index.html", kind: "doc" }
            ]
        },
        {
            title: "Matter 1.5 → 1.6",
            when: "2025–2026",
            points: [
                "1.5 (2025-11): 카메라 · 개폐장치(closures) · 에너지 관리 · 큰 메시지용 TCP 전송",
                "1.6 (2026-06): **NFC 커미셔닝(commissioning)** · 전원 넣기 전에도 설정, BLE 대안",
                "Joint Fabric: 여러 컨트롤러가 Matter 네트워크 하나를 함께 관리",
                "Thermostat Suggestions: 다른 기기 명령을 사용자 선호와 맞춰 보고 적용"
            ],
            refs: [
                { title: "Matter 1.6 Enables More Intuitive Setup, Multi-Ecosystem Experiences, and Context-Driven Control", by: "Connectivity Standards Alliance", year: 2026, url: "https://csa-iot.org/newsroom/matter-1-6-enables-more-intuitive-setup-multi-ecosystem-experiences-and-context-driven-control/", kind: "doc" },
                { title: "Matter 1.5 Introduces Cameras, Closures, and Enhanced Energy Management Capabilities", by: "Connectivity Standards Alliance", year: 2025, url: "https://csa-iot.org/newsroom/matter-1-5-introduces-cameras-closures-and-enhanced-energy-management-capabilities/", kind: "doc" }
            ]
        },
        {
            title: "Bluetooth 6.2 → 7.0: 저지연(low latency) · 고속",
            when: "2025–2026",
            points: [
                "6.2 (2025-11): 짧은 연결 간격(Shorter Connection Intervals) · 최소 7.5 ms → **375 µs**",
                "6.3 (2026-05): 채널 사운딩(Channel Sounding) 거리 측정 정확도·속도 개선",
                "7.0 (2026-11): **HDT** 새 LE PHY · 최대 7.5 Mbit/s",
                "7.0 보안: 키 스케줄(EKS) · 페어링 없이 앱 키로 암호화(TAK)"
            ],
            refs: [
                { title: "Bluetooth Core 7.0 feature overview", by: "G. Lu", year: 2026, url: "https://www.bluetooth.com/bluetooth-core-7-0-feature-overview/", kind: "doc" },
                { title: "Just released: Bluetooth Core 6.3", by: "A. Negrin", year: 2026, url: "https://www.bluetooth.com/blog/just-released-bluetooth-core-6-3/", kind: "doc" },
                { title: "Bluetooth Core 6.2 feature overview", by: "Bluetooth SIG", year: 2025, url: "https://www.bluetooth.com/bluetooth-core-6-2-feature-overview", kind: "doc" }
            ]
        },
        {
            title: "MQTT 5 · Sparkplug 3.0 (ISO/IEC 20237)",
            when: "2023–2026",
            points: [
                "Sparkplug 3.0 → 국제 표준(international standard) `ISO/IEC 20237` (2023) · 산업용 토픽 구조·페이로드",
                "NBIRTH/NDEATH 로 장치 상태 관리 · NDEATH 는 MQTT Will 로 등록",
                "MQTT 5: reason code · user property · 공유 구독(shared subscription) `$share/그룹/토픽`"
            ],
            refs: [
                { title: "Sparkplug: From Specification to Standard", by: "F. Desbiens", year: 2023, url: "https://blogs.eclipse.org/post/fr%C3%A9d%C3%A9ric-desbiens/sparkplug-specification-standard", kind: "doc" },
                { title: "Sparkplug 3.0.0: Sparkplug Specification", by: "Eclipse Foundation", year: 2022, url: "https://sparkplug.eclipse.org/specification/version/3.0/documents/sparkplug-specification-3.0.0.pdf", kind: "spec" },
                { title: "MQTT Version 5.0", by: "A. Banks et al.", year: 2019, url: "https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html", kind: "spec" }
            ]
        }
    ],
    lessons: [
        {
            id: "uart",
            title: "UART",
            level: 1,
            mins: 12,
            pre: ["embedded/gpio", "data-structures/ds-ring"],
            checked: "2026-11-16",
            key: [
                "클럭선 없는 비동기 직렬(asynchronous serial) · 양쪽이 **같은 baud** 를 약속",
                "프레임: Start(0) + 데이터(**LSB 먼저**) + [패리티(parity)] + Stop(1)",
                "8N1 → 1 바이트 = 10 비트 · 115200 bps ≈ 11.5 KB/s",
                "TX↔RX 교차 연결(crossover) · **GND 공통**(common ground) 필수"
            ],
            concepts: [
                { term: "Baud rate", def: "초당 심볼 수 · UART 는 1 심볼 = 1 비트라 bps 와 같음" },
                { term: "오버샘플링", en: "Oversampling", def: "비트당 16×(또는 8×) 샘플 · start 에지 기준 비트 **중앙**에서 판정" },
                { term: "클럭 오차 허용", en: "Clock deviation tolerance", def: "stop 중앙(start 에지 뒤 9.5 비트)까지 누적 오차 < ½ 비트 · 각자 ±2% 이내 권장" },
                { term: "RS-232 / RS-485", en: "Recommended Standard 232 / Recommended Standard 485", def: "전기 규격만 다름 · ±전압(반전 논리) / 차동 멀티드롭 · 프레임은 동일" }
            ],
            demo: { type: "sim", name: "uart", byte: 0x41, baud: 115200, fclk: 16e6, bits: 8, parity: "none", stop: 1, oversample: 16 },
            code: [
                {
                    lang: "c",
                    title: "STM32F4 USART2 레지스터 직접 (115200 8N1)",
                    src: `// PA2=TX, PA3=RX · APB1 = 42 MHz
void uart_init(void) {
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
    RCC->APB1ENR |= RCC_APB1ENR_USART2EN;
    GPIOA->MODER  |= (2u << (2 * 2)) | (2u << (3 * 2));   // 대체기능 모드
    GPIOA->AFR[0] |= (7u << (2 * 4)) | (7u << (3 * 4));   // AF7 = USART2
    // OVER8=0: BRR = f_ck / baud (반올림) = 365 → 115068 bps (−0.1%)
    USART2->BRR = (42000000u + 115200u / 2) / 115200u;
    USART2->CR1 = USART_CR1_TE | USART_CR1_RE | USART_CR1_UE;  // 8N1 = 기본값
}

void uart_putc(char c) {
    while (!(USART2->SR & USART_SR_TXE)) {}   // 송신 데이터 레지스터 빌 때까지
    USART2->DR = (uint8_t)c;
}

int uart_getc(void) {
    if (!(USART2->SR & USART_SR_RXNE)) return -1;   // 받은 것 없음
    return USART2->DR & 0xFF;                      // DR 읽으면 RXNE 클리어
}`,
                    note: "BRR 반올림(rounding) 안 하면 오차가 커짐 · 실제 baud 와 오차를 꼭 계산"
                },
                {
                    lang: "python",
                    title: "pyserial: 명령 보내고 한 줄 받기",
                    src: `import serial  # pip install pyserial

ser = serial.Serial("COM3", 115200, bytesize=serial.EIGHTBITS,
                    parity=serial.PARITY_NONE, stopbits=serial.STOPBITS_ONE,
                    timeout=0.5)            # readline() 최대 대기 (초)
ser.reset_input_buffer()                    # 이전 잔여 바이트 제거

def query(cmd: str) -> str:
    ser.write((cmd + "\\r\\n").encode())
    line = ser.readline()                   # b"\\n" 이 오거나 timeout
    if not line:
        raise TimeoutError(cmd)
    return line.decode(errors="replace").strip()

print(query("AT"))                          # 예: 'OK'
ser.close()`,
                    note: "UART 는 메시지 경계(message boundary)가 없음 · 줄바꿈·길이·구분자(delimiter)로 직접 정해야 함"
                }
            ],
            optimize: [
                {
                    title: "AVR 16 MHz · 115200: 정수 버림(truncation) → 반올림 + U2X",
                    before: { lang: "c", src: `// 16e6 / (16 × 115200) = 8.68 → 버림 8 → UBRR = 7
UBRR0 = F_CPU / (16UL * BAUD) - 1;
// 실제 16e6 / (16 × 8) = 125000 bps · 오차 +8.5% → 깨짐` },
                    after: { lang: "c", src: `UCSR0A |= (1 << U2X0);                            // 8× 샘플링
UBRR0 = (F_CPU + 4UL * BAUD) / (8UL * BAUD) - 1;  // 반올림 → 16
// 실제 16e6 / (8 × 17) = 117647 bps · 오차 +2.1%` },
                    gain: "오차 +8.5% → +2.1%",
                    note: "오차가 0 이 되려면 11.0592 MHz 같은 'UART 크리스털' 사용"
                },
                {
                    title: "바이트마다 write() → 한 번에 쓰기",
                    before: { lang: "python", src: `for b in payload:
    ser.write(bytes([b]))   # 시스템콜·USB 전송이 바이트마다` },
                    after: { lang: "python", src: `ser.write(payload)          # 한 번에 · 드라이버가 묶어서 전송` },
                    gain: "write 호출 N → 1"
                }
            ],
            glossary: [
                { term: "UART", en: "Universal Asynchronous Receiver/Transmitter", def: "클럭선 없이 start/stop 비트로 동기하는 직렬 통신 하드웨어" },
                { term: "Baud", en: "Baud rate", def: "초당 심볼 수 · UART 에선 bps 와 같음 (9600, 115200 …)" },
                { term: "8N1", en: "8 data, No parity, 1 stop", def: "가장 흔한 프레임 설정 · 바이트당 10 비트" },
                { term: "패리티 비트", en: "Parity bit", def: "1 의 개수를 짝/홀수로 맞추는 1 비트 오류 검출 · 2 비트 오류는 못 잡음" },
                { term: "프레이밍 에러", en: "Framing error", def: "stop 비트 자리에서 0 을 읽음 · baud 불일치·노이즈 의심" },
                { term: "RS-485", en: "TIA/EIA-485", def: "차동 2선 · 멀티드롭 · 긴 거리 · UART 프레임을 실어 나르는 물리층" }
            ],
            quiz: [
                { q: "115200 bps, 8N1 에서 초당 최대 바이트 수는?", options: ["14400", "11520", "12800", "10473"], a: 1, why: "8N1 = 바이트당 10 비트 → 115200 / 10 · 10473 은 11 비트 프레임(8E1)일 때" },
                { q: "`0x41` 을 보낼 때 start 비트 다음 첫 데이터 비트는?", options: ["0 (bit7, MSB)", "1 (bit6)", "0 (패리티)", "1 (bit0, LSB)"], a: 3, why: "UART 는 LSB 먼저 · 0x41 의 bit0 = 1 · MSB 먼저는 I2C·SPI 쪽 습관" },
                { q: "유휴 상태 TX 라인의 레벨은?", options: ["Low (0)", "Hi-Z (떠 있음)", "High (1)", "매 비트 토글"], a: 2, why: "유휴 High → start 비트의 하강 에지가 프레임 시작 · Low 유휴면 끊긴 선·break 와 구분이 안 됨" },
                { q: "짝수(even) 패리티로 `0x41` 을 보낼 때 패리티 비트는?", options: ["0", "1", "2", "보내지 않음"], a: 0, why: "1 이 2 개(bit0, bit6) → 이미 짝수라 0 · 홀수 패리티면 1" },
                { q: "글자가 깨지고 framing error 가 잦다. 먼저 볼 것은?", options: ["패리티 설정 차이", "TX 버퍼 크기 부족", "흐름 제어 미사용", "baud·클럭 오차"], a: 3, why: "비트 타이밍이 어긋나면 stop 자리에서 0 을 읽음 · 패리티 차이는 parity error 로 따로 잡힘" },
                { type: "num", q: "실험실 모델(분주 = round(fclk / baud))로 16 MHz 에서 921600 bps 를 내면 baud 오차는 몇 %?", answer: 2.12, tol: 0.05, unit: "%", why: "16e6 / 921600 = 17.36 → 17 → 941176 bps · 48 MHz 면 52 분주로 +0.16%" },
                { type: "num", q: "115200 bps, 8E1 한 문자의 전송 시간은 몇 µs?", answer: 95.49, tol: 0.1, unit: "µs", why: "start 1 + 데이터 8 + 패리티 1 + stop 1 = 11 비트 × 8.68 µs" },
                { type: "num", q: "8N1 · 에지 검출 오차를 무시하면 송수신 클럭 오차 합의 한계는 몇 %?", answer: 5.26, tol: 0.05, unit: "%", why: "stop 중앙 = start 에지 뒤 9.5 비트 · 어긋남 < ½ 비트 → 0.5 / 9.5 · 16× 에지 오차 1/16 을 빼면 4.6%" },
                { type: "text", q: "8N1 로 받은 파형(시간 순)이다. 바이트 값은? (16진)", code: { lang: "txt", src: "idle start d0 d1 d2 d3 d4 d5 d6 d7 stop\n 1     0    0  1  1  0  0  0  1  0   1" }, answer: ["0x46", "46", "70"], why: "LSB 먼저 → bit7..0 = 0100 0110 = 0x46 ('F') · 왼쪽부터 읽으면 0x62 로 착각" },
                { type: "order", q: "수신기가 한 프레임을 받는 순서", items: ["하강 에지 감지", "반 비트 뒤 0 재확인 (start 확정)", "비트마다 중앙에서 데이터 샘플", "stop 자리에서 1 확인", "수신 레지스터로 옮기고 RXNE set"], why: "에지로 기준점 → 반 비트 뒤 글리치를 거름 → 비트 중앙 샘플 · stop 이 0 이면 framing error" }
            ],
            refs: [
                { title: "The RS-485 Design Guide", by: "T. Kugelstadt", year: 2021, url: "https://www.ti.com/lit/an/slla272d/slla272d.pdf", kind: "doc" },
                { title: "UT32M0R500 Determining External Clock Accuracy for Asynchronous Peripherals", by: "CAES", year: 2022, url: "https://www.frontgrade.com/sites/default/files/documents/App-Note-UT32M0R500-Determining-External-Clock-Accuracy-for-Asynchronous-Peripherals.pdf", kind: "doc" },
                { title: "pySerial API", by: "pySerial", url: "https://pyserial.readthedocs.io/en/latest/pyserial_api.html", kind: "doc" }
            ]
        },
        {
            id: "i2c",
            title: "I2C",
            level: 2,
            mins: 14,
            pre: ["embedded/gpio", "embedded/bits"],
            checked: "2026-11-17",
            key: [
                "2선(SCL·SDA) **오픈드레인(open-drain) + 풀업(pull-up)** · 여러 장치가 버스 공유",
                "START → 7bit 주소(7-bit address) + R/W → ACK → 데이터 … → STOP",
                "데이터는 **MSB 먼저** · SCL High 동안 SDA 고정",
                "9번째 클럭에 수신 측(receiver)이 SDA Low = **ACK**, High = NACK"
            ],
            concepts: [
                { term: "START / STOP", def: "SCL High 에서 SDA ↓ / ↑ · 데이터 중엔 나올 수 없는 변화" },
                { term: "Repeated START", def: "STOP 없이 다시 START · 레지스터 주소 쓰고 바로 읽기" },
                { term: "클럭 스트레칭", en: "Clock stretching", def: "슬레이브가 SCL 을 Low 로 붙잡아 마스터를 기다리게 함" },
                { term: "속도 모드", en: "Bus speed modes", def: "Standard 100 kHz · Fast 400 kHz · Fast-mode Plus 1 MHz" },
                { term: "풀업 크기", en: "Pull-up resistor sizing", def: "버스 용량·속도로 결정 · 클수록 상승 느림, 작을수록 전류↑" }
            ],
            demo: { type: "sim", name: "i2c", addr: 0x68, op: "read", reg: 0x75, data: [0x68] },
            code: [
                {
                    lang: "c",
                    title: "STM32 HAL: MPU-6050 확인 후 깨우기",
                    src: `#define MPU_ADDR      (0x68 << 1)   // HAL 은 왼쪽 시프트한 8bit 주소
#define REG_WHO_AM_I  0x75
#define REG_PWR_MGMT1 0x6B

HAL_StatusTypeDef mpu_init(I2C_HandleTypeDef *hi2c) {
    uint8_t id;
    // S, 0xD0, 0x75, Sr, 0xD1, [id], NACK, P
    if (HAL_I2C_Mem_Read(hi2c, MPU_ADDR, REG_WHO_AM_I,
                         I2C_MEMADD_SIZE_8BIT, &id, 1, 10) != HAL_OK)
        return HAL_ERROR;              // 주소 NACK → 배선·주소·풀업 확인
    if (id != 0x68) return HAL_ERROR;

    uint8_t wake = 0x00;               // SLEEP 비트 해제
    // S, 0xD0, 0x6B, 0x00, P
    return HAL_I2C_Mem_Write(hi2c, MPU_ADDR, REG_PWR_MGMT1,
                             I2C_MEMADD_SIZE_8BIT, &wake, 1, 10);
}`,
                    note: "데이터시트의 7bit 주소인지 8bit(R/W 포함) 주소인지 항상 확인"
                },
                {
                    lang: "python",
                    title: "smbus2: 버스 스캔 + 레지스터 읽기",
                    src: `from smbus2 import SMBus  # pip install smbus2 · Raspberry Pi /dev/i2c-1

with SMBus(1) as bus:
    found = []
    for addr in range(0x08, 0x78):        # 0x00–0x07, 0x78–0x7F 는 예약
        try:
            bus.read_byte(addr)           # 주소에 ACK 하면 장치 있음
            found.append(hex(addr))
        except OSError:                   # NACK → 없음
            pass
    print("found:", found)

    who = bus.read_byte_data(0x68, 0x75)  # 레지스터 쓰고 Repeated START 로 읽기
    print(f"WHO_AM_I = 0x{who:02X}")`,
                    note: "읽기 탐색(probe)이 부작용(side effect)을 내는 장치도 있음 · 실무는 `i2cdetect` 결과와 대조"
                }
            ],
            optimize: [
                {
                    title: "1바이트씩 6번 → 연속 읽기(burst read) 1번 · 자동 증가(auto-increment)",
                    before: { lang: "c", src: `for (int i = 0; i < 6; i++)   // ACCEL_XOUT_H(0x3B) ~ 0x40
    HAL_I2C_Mem_Read(&hi2c1, MPU_ADDR, 0x3B + i,
                     I2C_MEMADD_SIZE_8BIT, &raw[i], 1, 10);
// 매번 주소W + 레지스터 + 주소R + 데이터 = 4 B × 6` },
                    after: { lang: "c", src: `HAL_I2C_Mem_Read(&hi2c1, MPU_ADDR, 0x3B,
                 I2C_MEMADD_SIZE_8BIT, raw, 6, 10);
// 주소W + 레지스터 + 주소R + 데이터 6 B = 9 B` },
                    gain: "버스 바이트 24 → 9 · H/L 바이트 불일치 방지"
                },
                {
                    title: "100 kHz → 400 kHz (Fast mode)",
                    before: { lang: "c", src: `hi2c1.Init.ClockSpeed = 100000;   // Standard mode` },
                    after: { lang: "c", src: `hi2c1.Init.ClockSpeed = 400000;   // Fast mode
hi2c1.Init.DutyCycle  = I2C_DUTYCYCLE_2;
// 상승 시간 ≤ 300 ns: 풀업을 더 작게(예: 2.2 kΩ), 배선 짧게` },
                    gain: "전송 시간 약 1/4",
                    note: "버스의 모든 장치가 400 kHz 를 지원해야 함"
                }
            ],
            glossary: [
                { term: "I2C", en: "Inter-Integrated Circuit", def: "2선 동기 직렬 버스 · 주소로 장치 선택 · 보드 내 센서/EEPROM 용" },
                { term: "ACK / NACK", en: "Acknowledge / Not acknowledge", def: "9번째 비트 · Low = 받았음, High = 없음/거부/읽기 끝" },
                { term: "Wired-AND", en: "Wired-AND", def: "누구든 Low 를 당기면 선 전체가 Low · ACK·중재·스트레칭의 기반" },
                { term: "클럭 스트레칭", en: "Clock stretching", def: "슬레이브가 SCL 을 Low 로 유지해 처리 시간을 버는 것" },
                { term: "Repeated START", en: "Repeated start (Sr)", def: "버스를 놓지 않고 방향(W→R)을 바꾸는 START" },
                { term: "7bit 주소", en: "7-bit address", def: "0x08–0x77 사용 · R/W 를 붙이면 8bit 주소 바이트" }
            ],
            quiz: [
                { q: "7bit 주소 `0x68` 장치를 **읽을 때** 보내는 주소 바이트는?", options: ["0x68", "0xD0", "0xD1", "0x69"], a: 2, why: "(0x68 << 1) | 1 = 0xD1 · 0xD0 은 쓰기, 0x69 는 시프트를 빼먹은 값" },
                { q: "9번째 클럭에서 SDA 가 High 로 남았다면?", options: ["NACK", "ACK", "클럭 스트레칭", "STOP 조건"], a: 0, why: "아무도 Low 로 당기지 않음 = NACK · 스트레칭은 SCL 을 붙잡는 것이라 SDA 와 무관" },
                { q: "데이터 전송 중 SCL High 구간에 SDA 가 바뀌면?", options: ["다음 데이터 비트로 처리", "글리치로 보고 무시", "START·STOP 신호", "버스 중재 패배로 처리"], a: 2, why: "SCL High 중 SDA ↓ = START, ↑ = STOP · 데이터는 SCL Low 일 때만 바뀜" },
                { q: "400 kHz 에서 상승 시간이 너무 길다. 조치는?", options: ["풀업 저항을 더 크게", "풀업 저항을 더 작게", "SDA 를 푸시풀로", "SCL 듀티를 1:1 로"], a: 1, why: "tr = 0.8473 · Rp · Cb → Rp↓ · 단 Rp(min) 전류 한계(3 mA) 안에서 · 키우면 더 느려짐" },
                { q: "레지스터 주소를 쓰고 이어서 읽을 때 쓰는 것은?", options: ["STOP 후 새 START", "General call 주소", "클럭 스트레칭", "Repeated START"], a: 3, why: "버스를 놓지 않고 W → R 전환 · STOP 을 내면 다른 컨트롤러가 끼어들 수 있음" },
                { type: "num", q: "Fast mode(tr ≤ 300 ns), 버스 용량 200 pF 에서 풀업 Rp 최대값은 몇 Ω?", answer: 1770, tol: 10, unit: "Ω", why: "Rp(max) = tr / (0.8473 × Cb) = 300 ns / (0.8473 × 200 pF)" },
                { type: "num", q: "VDD 5 V, Fast mode(VOL 0.4 V @ 3 mA) 에서 풀업 Rp 최소값은 몇 Ω?", answer: 1533, tol: 5, unit: "Ω", why: "Rp(min) = (VDD − VOL) / IOL = 4.6 V / 3 mA · 더 작으면 Low 가 0.4 V 까지 안 내려감" },
                { type: "text", q: "7bit 주소 `0x3C` 장치에 **쓰기** 할 때 버스에 나가는 첫 바이트는? (16진)", answer: ["0x78", "78", "120"], why: "(0x3C << 1) | 0 = 0x78 · 데이터시트의 0x78 과 0x3C 는 같은 장치" },
                { type: "num", q: "400 kHz 에서 주소W + 레지스터 + 주소R + 데이터 6 B (9 B × 9 클럭)의 클럭 시간은 몇 µs? (START·STOP 제외)", answer: 202.5, tol: 1, unit: "µs", why: "81 클럭 × 2.5 µs · 1 바이트씩 6 번이면 216 클럭으로 2.7 배" },
                { type: "order", q: "레지스터 1 바이트 읽기의 버스 순서", items: ["START", "주소+W → ACK", "레지스터 주소 → ACK", "Repeated START", "주소+R → ACK", "데이터 → 컨트롤러 NACK", "STOP"], why: "쓰기로 레지스터 포인터를 놓고 Sr 로 방향 전환 · 마지막 바이트는 NACK 로 끝을 알림" },
                { type: "text", q: "레지스터 2 바이트 읽기(주소+W · 레지스터 · 주소+R · 데이터 1 · 데이터 2)에서 각 바이트 뒤 9번째 클럭의 SDA 를 순서대로 쓰면? (ACK=0, NACK=1)", answer: ["00001"], why: "앞 세 바이트는 슬레이브가, 데이터 1 은 마스터가 ACK(0) · 마지막 데이터는 마스터가 NACK(1) 로 끝을 알림 · 실험에서 레지스터 읽기 + 데이터 2 바이트로 확인" }
            ],
            refs: [
                { title: "UM10204 I2C-bus specification and user manual (Rev. 7.0)", by: "NXP Semiconductors", year: 2021, url: "https://www.nxp.com/docs/en/user-guide/UM10204.pdf", kind: "spec" },
                { title: "I2C Bus Pullup Resistor Calculation", by: "R. Arora", year: 2026, url: "https://www.ti.com/lit/an/slva689/slva689.pdf", kind: "doc" },
                { title: "Understanding the I2C Bus", by: "J. Valdez et al.", year: 2026, url: "https://www.ti.com/lit/an/slva704/slva704.pdf", kind: "doc" }
            ]
        },
        {
            id: "spi",
            title: "SPI",
            level: 1,
            mins: 12,
            pre: ["embedded/gpio"],
            checked: "2026-11-17",
            key: [
                "4선: SCLK·MOSI·MISO·CS · **마스터가 클럭**을 만듦",
                "**전이중(full duplex)**: 8 클럭에 1 바이트 송신 + 1 바이트 수신 동시에",
                "Mode = (CPOL, CPHA) · mode 0: 유휴(idle) Low, 상승 에지(rising edge) 샘플",
                "주소 없음 → 슬레이브마다 **CS 한 가닥**"
            ],
            concepts: [
                { term: "CPOL", en: "Clock Polarity", def: "유휴 클럭 레벨 · 0 = Low, 1 = High" },
                { term: "CPHA", en: "Clock Phase", def: "0 = 첫 에지에서 샘플 · 1 = 두 번째 에지에서 샘플" },
                { term: "시프트 레지스터 교환", en: "Shift register exchange", def: "마스터·슬레이브 레지스터가 링으로 연결 · 8 클럭 후 내용이 서로 바뀜" },
                { term: "더미 바이트", en: "Dummy byte", def: "읽으려면 뭔가 보내야 함 → 0x00/0xFF 를 보내며 수신" }
            ],
            demo: { type: "sim", name: "spi", byte: 0x96, master: 0, slave: 0 },
            code: [
                {
                    lang: "c",
                    title: "STM32 HAL: SPI 플래시 JEDEC ID 읽기",
                    src: `// W25Qxx · SPI mode 0, MSB first
uint32_t flash_read_id(void) {
    uint8_t tx[4] = { 0x9F, 0x00, 0x00, 0x00 };   // 명령 + 더미 3 바이트
    uint8_t rx[4];

    HAL_GPIO_WritePin(FLASH_CS_GPIO_Port, FLASH_CS_Pin, GPIO_PIN_RESET); // CS ↓
    HAL_SPI_TransmitReceive(&hspi1, tx, rx, 4, 10);                      // 4 B 교환
    HAL_GPIO_WritePin(FLASH_CS_GPIO_Port, FLASH_CS_Pin, GPIO_PIN_SET);   // CS ↑

    // rx[0] = 명령 보내는 동안 들어온 값 → 버림
    return ((uint32_t)rx[1] << 16) | ((uint32_t)rx[2] << 8) | rx[3];
    // 예: 0xEF4017 = Winbond W25Q64
}`,
                    note: "명령 바이트 동안의 MISO 는 의미 없음 · 응답은 더미를 보내야 나옴"
                },
                {
                    lang: "python",
                    title: "spidev (Raspberry Pi)",
                    src: `import spidev  # /dev/spidev0.0

spi = spidev.SpiDev()
spi.open(0, 0)                    # bus 0, CS0
spi.mode = 0b00                   # CPOL=0, CPHA=0
spi.max_speed_hz = 1_000_000
spi.bits_per_word = 8

rx = spi.xfer2([0x9F, 0, 0, 0])   # 보낸 만큼 받음 · 전송 내내 CS Low 유지
print("JEDEC ID: %02X %02X %02X" % tuple(rx[1:]))
spi.close()`
                }
            ],
            optimize: [
                {
                    title: "바이트마다 호출 → 한 번에 DMA",
                    before: { lang: "c", src: `CS_LOW();
for (int i = 0; i < n; i++)
    HAL_SPI_Transmit(&hspi1, &buf[i], 1, 10);  // 호출마다 바이트 사이 공백
CS_HIGH();` },
                    after: { lang: "c", src: `CS_LOW();
HAL_SPI_Transmit_DMA(&hspi1, buf, n);  // 클럭 연속 · CPU 는 다른 일
// CS_HIGH() 는 HAL_SPI_TxCpltCallback 에서` },
                    gain: "바이트 간 공백 제거 · CPU 대기 0"
                },
                {
                    title: "기본 분주비(prescaler) 그대로 → 장치 최대 속도 근처로",
                    before: { lang: "c", src: `hspi1.Init.BaudRatePrescaler = SPI_BAUDRATEPRESCALER_256;
// APB2 84 MHz / 256 ≈ 328 kHz` },
                    after: { lang: "c", src: `hspi1.Init.BaudRatePrescaler = SPI_BAUDRATEPRESCALER_4;
// 84 MHz / 4 = 21 MHz · 장치 최대 클럭·배선 길이 확인` },
                    gain: "클럭 64×"
                }
            ],
            glossary: [
                { term: "SPI", en: "Serial Peripheral Interface", def: "클럭 동기 · 전이중 · 4선 직렬 버스 · 수십 MHz 까지" },
                { term: "MOSI / MISO", en: "Master Out Slave In / Master In Slave Out", def: "마스터 출력 / 마스터 입력 데이터선 · SDO/SDI 로도 표기" },
                { term: "CS", en: "Chip Select (SS, NSS)", def: "Low 로 슬레이브 선택 · 선택 안 된 슬레이브는 MISO Hi-Z" },
                { term: "전이중", en: "Full duplex", def: "송신과 수신이 같은 시간에 일어남" },
                { term: "SPI 모드", en: "SPI mode 0–3", def: "CPOL·CPHA 조합 · 장치 데이터시트와 반드시 일치" },
                { term: "QSPI", en: "Quad SPI", def: "데이터선 4개로 클럭당 4 비트 · 플래시에서 코드 직접 실행(XIP)" }
            ],
            quiz: [
                { q: "SPI mode 0 의 (CPOL, CPHA) 는?", options: ["(0, 1)", "(1, 0)", "(0, 0)", "(1, 1)"], a: 2, why: "유휴 Low, 첫(상승) 에지 샘플 · mode 3 (1, 1) 도 상승 에지 샘플이라 헷갈림" },
                { q: "슬레이브에서 3 바이트를 읽으려면 마스터는?", options: ["더미 3 바이트를 보내며 클럭", "MISO 를 켜고 기다림", "슬레이브 주소 1 바이트 전송", "슬레이브가 클럭을 낼 때까지 대기"], a: 0, why: "클럭은 마스터만 만들고 클럭 = 송수신 동시 · SPI 엔 주소가 없음" },
                { q: "슬레이브 4개를 각자 CS 로 연결(데이지 체인·디코더 없음)하면 CS 선 수는?", options: ["1", "2", "8", "4"], a: 3, why: "주소가 없어 슬레이브마다 CS 하나 · 2 개는 2→4 디코더를 붙일 때" },
                { q: "I2C 대비 SPI 의 특징은?", options: ["선 수가 더 적음", "주소로 장치를 선택", "ACK 비트가 내장됨", "푸시풀이라 빠름"], a: 3, why: "오픈드레인 상승 시간 제약이 없어 수십 MHz · 선 수가 적고 주소·ACK 가 있는 건 I2C 쪽" },
                { q: "mode 0 에서 데이터가 바뀌는(시프트) 시점은?", options: ["SCLK 상승 에지", "SCLK 하강 에지", "CS 상승 에지", "클럭과 무관"], a: 1, why: "상승 에지에 샘플 · 반대인 하강 에지에서 시프트 · 첫 비트만 CS↓ 직후에 나옴" },
                { type: "num", q: "APB 84 MHz, SPI 분주 8 이면 SCLK 는 몇 MHz?", answer: 10.5, tol: 0.01, unit: "MHz", why: "84 / 8 · 레슨 예의 분주 4 면 21 MHz" },
                { type: "num", q: "SCLK 20 MHz 로 Read Data(명령 + 주소 4 B) 뒤 4096 B 를 읽는 순수 전송 시간은 몇 µs? (바이트 간 공백 0)", answer: 1640, tol: 1, unit: "µs", why: "(4 + 4096) × 8 비트 / 20 MHz · 바이트마다 호출하면 공백이 더해짐" },
                { type: "text", q: "`flash_read_id()` 가 이 4 바이트를 받으면 반환값은? (16진)", code: { lang: "c", src: "uint8_t rx[4] = { 0xFF, 0xEF, 0x40, 0x17 };\nreturn ((uint32_t)rx[1] << 16) | ((uint32_t)rx[2] << 8) | rx[3];" }, answer: ["0xEF4017", "EF4017", "15679511"], why: "rx[0] 은 명령을 보내는 동안 들어온 값이라 버림 · EF = Winbond, 4017 = W25Q64" },
                { type: "order", q: "SPI NOR 플래시 한 페이지 쓰기 순서", items: ["CS↓ · 0x06 Write Enable · CS↑", "CS↓ · 0x02 + 주소 3 B + 데이터", "CS↑ → 내부 프로그램 시작", "0x05 로 상태 읽기 반복", "BUSY = 0 → 완료"], why: "WEL 래치가 먼저 · 명령은 CS↑ 에서 확정 · BUSY 폴링으로 끝을 확인" },
                { type: "num", q: "mode 0 마스터와 CPOL 은 다르지만 **같은 상승 엣지**에서 샘플하는 슬레이브 모드 번호는?", answer: 3, why: "mode 0 은 CPOL 0 의 첫(상승) 엣지, mode 3 은 CPOL 1 의 둘째(상승) 엣지에서 샘플 · 그래서 많은 장치가 0 과 3 을 함께 지원 · 1 과 2 는 하강 엣지" },
                { type: "text", q: "마스터 mode 1, 슬레이브 mode 0, MSB 먼저 `0xA5`. 슬레이브가 데이터가 바뀌기 **직전** 값을 읽는다면 받는 8비트는? (모르는 비트는 ?)", answer: ["?1010010"], why: "mode 1 마스터는 상승 엣지에서 MOSI 를 바꾸는데 mode 0 슬레이브도 상승 엣지에서 샘플 → 매번 경합 · 직전 값이면 한 비트씩 늦어 첫 비트는 알 수 없음, 직후 값이면 우연히 맞음" }
            ],
            refs: [
                { title: "Understanding the SPI Bus", by: "Y. Pan", year: 2025, url: "https://www.ti.com/lit/pdf/sboa621", kind: "doc" },
                { title: "Overview of Linux kernel SPI support", by: "Linux kernel", url: "https://www.kernel.org/doc/html/latest/spi/spi-summary.html", kind: "doc" },
                { title: "SPI userspace API", by: "Linux kernel", url: "https://www.kernel.org/doc/html/latest/spi/spidev.html", kind: "doc" }
            ]
        },
        {
            id: "crc",
            title: "CRC와 오류 검출",
            level: 2,
            mins: 14,
            pre: ["embedded/bits"],
            checked: "2026-11-16",
            key: [
                "CRC = 메시지를 **생성 다항식(generator polynomial)**으로 나눈 나머지",
                "나눗셈은 자리올림 없는 XOR · 하드웨어는 **LFSR(linear-feedback shift register)** 하나",
                "수신측: 메시지 + CRC 를 같은 다항식으로 나누면 나머지 0 → 오류 없음",
                "이름이 같아도 init·reflect·xorout 이 다르면 값이 다름 (MODBUS vs XMODEM)"
            ],
            concepts: [
                { term: "생성 다항식", en: "Generator polynomial", def: "x⁸+x²+x+1 → `0x07` (최고차 항 생략 표기) · 차수 r = CRC 비트 수" },
                { term: "LFSR", en: "Linear-Feedback Shift Register", def: "시프트 레지스터 + XOR 탭 · 비트당 1클럭으로 CRC 계산" },
                { term: "해밍 거리", en: "Hamming distance (HD)", def: "검출 못 하는 최소 오류 비트 수 · HD = 4 면 3비트 이하 오류는 전부 검출 (길이 조건 내)" },
                { term: "버스트 오류", en: "Burst error", def: "연속 구간이 함께 깨지는 오류 · r비트 CRC 는 길이 ≤ r 버스트를 모두 검출" }
            ],
            demo: { type: "sim", name: "crc", poly: "crc3" },
            code: [
                {
                    lang: "c",
                    title: "CRC-8 비트 단위",
                    src: `#include <stdint.h>
#include <stddef.h>

/* CRC-8/SMBUS: poly 0x07, init 0, 반사 없음 — "123456789" → 0xF4 */
uint8_t crc8(const uint8_t *p, size_t n) {
    uint8_t crc = 0;
    while (n--) {
        crc ^= *p++;                     /* 다음 바이트를 위쪽에 맞대기 */
        for (int i = 0; i < 8; i++)      /* 비트마다 나눗셈 한 단계 */
            crc = (crc & 0x80) ? (uint8_t)((crc << 1) ^ 0x07)
                               : (uint8_t)(crc << 1);
    }
    return crc;
}`,
                    note: "시뮬레이터의 XOR 단계와 같은 연산 · 맨 앞 비트가 1 이면 다항식을 XOR"
                },
                {
                    lang: "py",
                    title: "MODBUS · XMODEM · CRC-32",
                    src: `import zlib, binascii

def crc16_modbus(data: bytes) -> int:
    crc = 0xFFFF                          # init
    for b in data:
        crc ^= b                          # LSB 먼저 (reflect)
        for _ in range(8):
            crc = (crc >> 1) ^ 0xA001 if crc & 1 else crc >> 1
    return crc                            # 프레임엔 하위 바이트 먼저

data = b"123456789"
print(hex(crc16_modbus(data)))            # 0x4b37
print(hex(binascii.crc_hqx(data, 0)))     # 0x31c3      CRC-16/XMODEM
print(hex(zlib.crc32(data)))              # 0xcbf43926  CRC-32`,
                    note: "같은 16bit 라도 init·**반사(reflection)** 가 다르면 값이 다름 · 카탈로그의 check 값(\"123456789\")으로 검증"
                }
            ],
            optimize: [
                {
                    title: "비트 루프 → 256 엔트리 테이블 (바이트당 조회 1번)",
                    before: { lang: "c", src: `for (int i = 0; i < 8; i++)          /* 바이트당 분기 8번 */
    crc = (crc & 0x80) ? (crc << 1) ^ 0x07 : crc << 1;` },
                    after: { lang: "c", src: `/* 미리 계산: T[b] = 바이트 b 하나의 CRC */
static const uint8_t T[256] = { 0x00, 0x07, 0x0E, 0x09, /* … */ };
crc = T[crc ^ *p++];                  /* 바이트당 조회 1번 */` },
                    gain: "분기 8 → 조회 1",
                    note: "플래시 256 B · CRC-16 은 512 B, CRC-32 는 1 KB · 16 엔트리(니블) 테이블로 절충 가능"
                },
                {
                    title: "소프트웨어 → MCU CRC 주변장치",
                    before: { lang: "c", src: `uint32_t c = crc32_sw(buf, len);      /* CPU 가 바이트마다 계산 */` },
                    after: { lang: "c", src: `/* STM32 HAL: 하드웨어 CRC 유닛 (F4: 0x04C11DB7, 반사 없음 = CRC-32/MPEG-2) */
uint32_t c = HAL_CRC_Calculate(&hcrc, (uint32_t *)buf, len / 4);` },
                    gain: "CPU 부하 ↓",
                    note: "하드웨어 설정(다항식·반사·init)이 상대 장치와 같은지 먼저 확인 · 이더넷 CRC-32 와는 반사·xorout 이 달라 값이 다름"
                }
            ],
            glossary: [
                { term: "체크섬", en: "Checksum", def: "바이트를 더한 값 · 간단하지만 순서 바뀜이나 서로 상쇄되는 오류를 못 잡음" },
                { term: "반사", en: "Reflection (bit-reversed input/output)", def: "바이트를 LSB 먼저 처리 · UART 처럼 LSB 먼저 보내는 링크에서 유래" },
                { term: "CRC-32", en: "Cyclic Redundancy Check, 32-bit (IEEE 802.3)", def: "이더넷·ZIP·PNG · 다항식 0x04C11DB7, 반사, init·xorout 0xFFFFFFFF" },
                { term: "잔여값", en: "Residue", def: "정상 프레임 전체(메시지 + CRC)를 다시 계산했을 때 나오는 고정값 · xorout 이 없으면 0" },
                { term: "미검출 오류 확률", en: "Undetected error probability", def: "무작위 오류일 때 대략 2⁻ʳ · r = 16 이면 약 1/65536" }
            ],
            quiz: [
                { q: "생성 다항식이 x³+x+1 이면 CRC 는 몇 비트?", options: ["2", "3", "4", "8"], a: 1, why: "차수 r = 3 → 나머지 3 비트 · 이진 표기 `1011` 이 4 비트라 4 로 착각하기 쉬움" },
                { q: "CRC 나눗셈에서 '빼기'에 해당하는 연산은?", options: ["산술 뺄셈", "XOR", "AND", "OR"], a: 1, why: "GF(2): 자리올림·빌림이 없어 덧셈 = 뺄셈 = XOR" },
                { q: "init·xorout 없는 CRC 에서, 수신측이 메시지 + CRC 전체를 나눴더니 나머지가 0 이 아니다.", options: ["정상 수신", "오류 검출", "CRC 길이 부족", "다항식 무관"], a: 1, why: "정상 프레임은 G 로 나누어떨어짐 → 0 이 아니면 어딘가 비트가 바뀜" },
                { q: "16bit CRC 가 **반드시** 검출하는 것은?", options: ["모든 오류 패턴 전부", "길이 ≤ 16 버스트", "길이 32 인 버스트", "짝수 개의 비트 오류"], a: 1, why: "r 비트 CRC 는 길이 ≤ r 버스트를 모두 검출 · 더 긴 버스트는 약 2⁻ʳ 확률로 놓칠 수 있음" },
                { q: "둘 다 'CRC-16' 인데 장치 간 값이 다르다. 가장 흔한 원인은?", options: ["다항식 차수 차이", "init·반사 파라미터", "테이블 vs 비트 구현", "CPU 엔디언 차이"], a: 1, why: "MODBUS(init 0xFFFF, 반사) vs XMODEM(init 0, 반사 없음) · 파라미터가 같으면 테이블·비트 구현 결과는 같음" },
                { type: "text", q: "메시지 `1101`, 생성 다항식 `1011`(x³+x+1)의 CRC-3 나머지는? (3 비트)", answer: ["001"], why: "`1101 000` 을 `1011` 로 XOR 나눗셈 → 나머지 `001` · 전송 프레임 = `1101 001`" },
                { type: "text", q: "레슨의 `crc8()`(poly 0x07, init 0)에 1 바이트 `0x01` 만 넣으면 결과는? (16진)", answer: ["0x07", "07", "7"], why: "1 이 7 번 밀려 0x80 → 8 번째 시프트에서 넘쳐 poly XOR → 0x07 · x⁸ mod G = 0x07" },
                { type: "num", q: "x¹⁶ + x¹² + x⁵ + 1 을 최고차 생략 16진 표기로 쓰면? (0x 입력 가능)", answer: 0x1021, why: "비트 12, 5, 0 → `0001 0000 0010 0001` = 0x1021 (CRC-16/XMODEM 의 다항식)" },
                { type: "order", q: "수신측 CRC 검사 순서 (init·xorout 없는 CRC)", items: ["메시지 + 받은 CRC 를 이어 붙임", "같은 생성 다항식으로 나눔", "나머지를 확인", "0 이면 수용 · 아니면 폐기"], why: "정상 프레임은 G 로 나누어떨어짐 · xorout 이 있으면 0 대신 고정 잔여값이 나옴" }
            ],
            refs: [
                { title: "Cyclic Redundancy Code (CRC) Polynomial Selection for Embedded Networks", by: "Philip Koopman et al.", year: 2004, url: "https://users.ece.cmu.edu/~koopman/roses/dsn04/koopman04_crc_poly_embedded.pdf", kind: "paper" },
                { title: "Catalogue of parametrised CRC algorithms", by: "Greg Cook", url: "https://reveng.sourceforge.io/crc-catalogue/all.htm", kind: "doc" },
                { title: "MODBUS over Serial Line Specification and Implementation Guide V1.02", by: "Modbus Organization", year: 2006, url: "https://www.modbus.org/file/secure/modbusoverserial.pdf", kind: "spec" }
            ]
        },
        {
            id: "can",
            title: "CAN / CAN FD",
            level: 3,
            mins: 16,
            pre: ["protocols/i2c", "protocols/crc"],
            checked: "2026-11-16",
            key: [
                "2선 차동(differential, CAN_H/CAN_L) 멀티마스터 버스 · 양 끝 120 Ω 종단(termination)",
                "**우성(dominant) 0 이 열성(recessive) 1 을 이김** → ID 가 작을수록 우선",
                "비파괴 중재(non-destructive arbitration): 진 노드는 물러나고 승자 프레임은 그대로",
                "같은 비트 5개 뒤 반대 비트 1개 = **비트 스터핑(bit stuffing)** · 재동기용 에지",
                "CAN FD: 데이터 구간(data phase)만 고속 · 최대 **64 바이트**"
            ],
            concepts: [
                { term: "우성 / 열성", en: "Dominant / Recessive", def: "0 = 구동(차동 ~2 V) · 1 = 비구동(차동 ~0 V) · 동시에 쓰면 0" },
                { term: "비트 스터핑", en: "Bit stuffing", def: "같은 비트 5개 연속 → 반대 비트 1개 삽입 · 에지로 재동기" },
                { term: "CRC + ACK 슬롯", en: "Cyclic Redundancy Check + Acknowledge slot", def: "클래식 15bit CRC · 정상 수신한 노드가 ACK 슬롯을 우성으로" },
                { term: "에러 상태", en: "Error states (fault confinement)", def: "TEC/REC 카운터 · Error Active → Passive(>127) → Bus-off(TEC>255)" },
                { term: "CAN FD", en: "Controller Area Network with Flexible Data-rate", def: "BRS 로 데이터 구간 bit rate 전환 · CRC 17/21bit · DLC 최대 64 B" }
            ],
            demo: { type: "sim", name: "can", ids: [0x256, 0x259, 0x300], data: [0x00, 0xff] },
            code: [
                {
                    lang: "c",
                    title: "STM32 HAL bxCAN: 필터 + 송신",
                    src: `// 비트 타이밍(예: 500 kbit/s)은 CubeMX 에서 설정했다고 가정
void can_start(void) {
    CAN_FilterTypeDef f = {
        .FilterBank = 0,
        .FilterMode = CAN_FILTERMODE_IDMASK,
        .FilterScale = CAN_FILTERSCALE_32BIT,
        .FilterIdHigh     = 0x250 << 5,   // 표준 ID 는 32bit 필터의 [31:21]
        .FilterMaskIdHigh = 0x7F0 << 5,   // 상위 7bit 비교 → 0x250~0x25F 통과
        .FilterFIFOAssignment = CAN_RX_FIFO0,
        .FilterActivation = ENABLE,
        .SlaveStartFilterBank = 14,       // 듀얼 CAN: 뱅크 0~13 은 CAN1
    };
    HAL_CAN_ConfigFilter(&hcan1, &f);
    HAL_CAN_Start(&hcan1);
}

void can_send(void) {
    CAN_TxHeaderTypeDef h = {
        .StdId = 0x256, .IDE = CAN_ID_STD, .RTR = CAN_RTR_DATA, .DLC = 2,
    };
    uint8_t data[2] = { 0x12, 0x34 };
    uint32_t mailbox;
    if (HAL_CAN_GetTxMailboxesFreeLevel(&hcan1) > 0)
        HAL_CAN_AddTxMessage(&hcan1, &h, data, &mailbox);  // 중재·재전송은 하드웨어
}`,
                    note: "ID = 우선순위(priority) · 안전 관련 메시지에 작은 ID 를 배정"
                },
                {
                    lang: "python",
                    title: "python-can (Linux SocketCAN) · 클래식 + FD",
                    src: `import can  # pip install python-can
# 사전: sudo ip link set can0 up type can bitrate 500000 dbitrate 2000000 fd on

bus = can.Bus(interface="socketcan", channel="can0", fd=True)
bus.set_filters([{"can_id": 0x250, "can_mask": 0x7F0, "extended": False}])

# 클래식 CAN: 최대 8 B
bus.send(can.Message(arbitration_id=0x256, data=[0x12, 0x34], is_extended_id=False))

# CAN FD: 최대 64 B · BRS = 데이터 구간만 2 Mbit/s
bus.send(can.Message(arbitration_id=0x257, data=bytes(range(64)),
                     is_extended_id=False, is_fd=True, bitrate_switch=True))

msg = bus.recv(timeout=1.0)        # 필터(0x250~0x25F) 통과한 프레임만
if msg is not None:
    print(hex(msg.arbitration_id), msg.data.hex())
bus.shutdown()`
                }
            ],
            optimize: [
                {
                    title: "신호(signal)마다 프레임 → 한 프레임에 패킹",
                    before: { lang: "c", src: `can_tx(0x101, &rpm,  2);   // 신호 4개를 각각 프레임으로
can_tx(0x102, &temp, 2);
can_tx(0x103, &volt, 2);
can_tx(0x104, &curr, 2);   // 4 × (47 + 16) = 252 bit` },
                    after: { lang: "c", src: `uint8_t d[8];
memcpy(&d[0], &rpm, 2);  memcpy(&d[2], &temp, 2);
memcpy(&d[4], &volt, 2); memcpy(&d[6], &curr, 2);
can_tx(0x101, d, 8);       // 47 + 64 = 111 bit` },
                    gain: "버스 점유 약 −55% (스터핑 제외)",
                    note: "표준 데이터 프레임(standard data frame) 고정 오버헤드 ≈ 47 bit (IFS 포함)"
                },
                {
                    title: "64 B 블록: 클래식 8 프레임 → CAN FD 1 프레임",
                    before: { lang: "c", src: `for (int i = 0; i < 8; i++)
    can_tx(0x300 + i, &blk[i * 8], 8);   // 프레임마다 중재·CRC·EOF 반복` },
                    after: { lang: "c", src: `can_fd_tx(0x300, blk, 64);   // DLC 15 = 64 B · BRS 로 데이터 구간 고속` },
                    gain: "프레임 8 → 1 · 전송 시간 수 배 단축"
                }
            ],
            glossary: [
                { term: "CAN", en: "Controller Area Network", def: "차량·산업용 멀티마스터 차동 버스 · ISO 11898" },
                { term: "우성 / 열성", en: "Dominant / Recessive", def: "0 은 구동, 1 은 비구동 · 동시에 쓰면 우성이 이김" },
                { term: "중재", en: "Arbitration", def: "ID 를 비트 단위로 비교해 송신권을 정함 · 비파괴" },
                { term: "비트 스터핑", en: "Bit stuffing", def: "같은 비트 5개 뒤 반대 비트 삽입 · 수신 측이 자동 제거" },
                { term: "Bus-off", en: "Bus-off", def: "송신 에러 카운터 255 초과 → 노드가 버스에서 스스로 이탈" },
                { term: "CAN FD", en: "CAN with Flexible Data-rate", def: "데이터 최대 64 B · 데이터 구간 고속 전환(BRS)" }
            ],
            quiz: [
                { q: "ID `0x100` 과 `0x0FF` 가 동시에 송신하면 승자는?", options: ["0x100", "충돌 후 둘 다 재전송", "0x0FF", "먼저 SOF 보낸 쪽"], a: 2, why: "ID8: 0x0FF 는 0(우성), 0x100 은 1(열성) → 작은 ID 승 · SOF 는 동시에 나가 '먼저'가 없음" },
                { q: "중재에서 진 노드는?", options: ["에러 프레임을 송신", "수신으로 바꾸고 재시도", "Bus-off 로 즉시 이탈", "승자 프레임을 덮어씀"], a: 1, why: "비파괴 중재 · 진 쪽 프레임만 미뤄짐 · 중재 패배는 에러가 아니라 TEC 도 그대로" },
                { q: "클래식 CAN / CAN FD 의 최대 데이터 길이는?", options: ["8 / 64 B", "8 / 32 B", "16 / 64 B", "64 / 2048 B"], a: 0, why: "DLC 9–15 가 12–64 B 를 뜻함 · 2048 B 는 CAN XL" },
                { q: "전원 끈 정상 버스에서 CAN_H–CAN_L 저항을 재면?", options: ["약 120 Ω", "약 240 Ω", "약 60 Ω", "수 kΩ 이상"], a: 2, why: "양 끝 120 Ω 병렬 = 60 Ω · 120 Ω 이면 종단 하나 누락" },
                { q: "같은 비트가 5개 연속되면 송신기는?", options: ["에러 플래그를 송신", "반대 비트 삽입", "그 프레임을 종료", "패리티 비트를 추가"], a: 1, why: "비트 스터핑 · 재동기용 에지 보장 · 같은 비트 6 개는 오히려 에러 신호" },
                { type: "num", q: "500 kbit/s 에서 8 B 표준 데이터 프레임(IFS 포함 111 bit, 스터핑 없음)은 몇 µs?", answer: 222, tol: 0.5, unit: "µs", why: "111 × 2 µs · 최악 스터핑 24 bit 를 더하면 135 bit = 270 µs" },
                { type: "num", q: "CAN 클럭 40 MHz, 분주 5, 비트당 16 TQ (Sync 1 + TSEG1 13 + TSEG2 2) 의 샘플 포인트는 몇 %?", answer: 87.5, tol: 0.1, unit: "%", why: "(1 + 13) / 16 · TQ = 125 ns → 비트 2 µs = 500 kbit/s" },
                { type: "num", q: "ID `0x0F0`, DLC 0 데이터 프레임의 SOF~DLC (19 bit)에 들어가는 스터프 비트는 몇 개? (실험실로 확인)", answer: 2, why: "`0 000 1111 0000 000 0000` · 끝의 0 열한 개에서 5 개마다 1 삽입 → 2 개" },
                { type: "text", q: "ID `0x65A` 와 `0x659` 가 경쟁한다. 몇 번 ID 비트에서 승부가 갈리나? (ID10~ID0)", answer: ["ID1", "1", "bit1", "비트1"], why: "끝 4 비트 `1010` vs `1001` → ID1 에서 0x659 가 0(우성) → 0x659 승" },
                { type: "order", q: "클래식 CAN 표준 데이터 프레임의 필드 순서", items: ["SOF", "ID (11 bit)", "RTR · IDE · r0", "DLC", "데이터 0–8 B", "CRC 15 bit + 구분자", "ACK 슬롯", "EOF 7 bit"], why: "ID 가 맨 앞이라 우선순위가 먼저 결정 · CRC 는 SOF~데이터를 보호 · ACK 는 수신 노드가 우성으로 덮음" }
            ],
            refs: [
                { title: "CAN CC (classical CAN, ISO 11898-1)", by: "CAN in Automation (CiA)", url: "https://www.can-cia.org/can-knowledge/can-cc", kind: "doc" },
                { title: "Introduction to the Controller Area Network (CAN)", by: "S. Corrigan", year: 2016, url: "https://www.ti.com/lit/an/sloa101b/sloa101b.pdf", kind: "doc" },
                { title: "CAN FD (flexible data rate) – the basic idea", by: "CAN in Automation (CiA)", url: "https://can-cia.org/can-knowledge/can-fd-the-basic-idea", kind: "doc" }
            ]
        },
        {
            id: "modbus",
            title: "Modbus RTU / TCP",
            level: 2,
            mins: 14,
            pre: ["protocols/uart", "protocols/crc"],
            checked: "2026-11-16",
            key: [
                "마스터가 묻고 슬레이브가 답함 · 슬레이브는 먼저 말하지 않음",
                "RTU: 주소 + 기능코드(function code) + 데이터 + **CRC-16 (Low 바이트 먼저)**",
                "레지스터 값은 **빅엔디언** · CRC 만 리틀엔디언",
                "TCP: CRC 대신 MBAP 헤더 · 포트 502 · Unit ID"
            ],
            concepts: [
                { term: "데이터 모델", en: "Data model", def: "Coil(1bit RW) · Discrete Input(1bit R) · Input Reg(16bit R) · Holding Reg(16bit RW)" },
                { term: "기능 코드", en: "Function code", def: "01 코일 읽기 · 03 홀딩 읽기 · 06 단일 쓰기 · 16(0x10) 다중 쓰기" },
                { term: "t3.5 침묵", en: "t3.5 silent interval", def: "3.5 문자 시간 이상 조용하면 프레임 끝 · 19200 bps 초과는 1.75 ms 고정값 권장" },
                { term: "주소 표기", en: "Register address notation", def: "문서의 `40108` = PDU 주소 `0x006B` (0 기반 · 40001 → 0)" }
            ],
            demo: {
                type: "seq",
                actors: ["Client", "Gateway", "Slave 0x11"],
                msgs: [
                    { from: 0, to: 1, label: "MBAP 0001 0000 0006 11 | 03 006B 0003", text: "Modbus TCP(502) · MBAP: 트랜잭션 ID · 프로토콜 0 · 길이 6 · **Unit ID 0x11**" },
                    { from: 1, to: 2, label: "11 03 00 6B 00 03 | 76 87", text: "RTU 로 변환 · FC 03 홀딩 레지스터(holding register) 0x006B 부터 3개 · CRC `0x8776` 은 **Low 먼저**" },
                    { from: 2, to: 2, label: "주소·CRC 확인", text: "주소 불일치·CRC 오류면 **응답 안 함** → 마스터는 타임아웃" },
                    { from: 2, to: 1, label: "11 03 06 AE41 5652 4340 | 49 AD", text: "바이트 수 6 = 레지스터 3개 · 값은 **빅엔디언** (0xAE41, 0x5652, 0x4340)" },
                    { from: 1, to: 0, label: "MBAP 0001 0000 0009 11 | 03 06 …", text: "CRC 떼고 MBAP 붙여 회신 · 같은 트랜잭션 ID 로 요청과 짝 맞춤" },
                    { from: 1, to: 2, label: "11 03 04 00 00 01 | 87 AA", text: "없는 주소 0x0400 요청" },
                    { from: 2, to: 1, label: "11 83 02 | C1 34", text: "예외 응답(exception response): FC | **0x80** = 0x83 · 코드 02 = Illegal Data Address" }
                ]
            },
            code: [
                {
                    lang: "c",
                    title: "CRC-16/MODBUS + 요청 프레임 만들기",
                    src: `// poly 0x8005 (반사형 0xA001), init 0xFFFF
uint16_t modbus_crc(const uint8_t *p, size_t n) {
    uint16_t crc = 0xFFFF;
    while (n--) {
        crc ^= *p++;
        for (int i = 0; i < 8; i++)
            crc = (crc & 1) ? (crc >> 1) ^ 0xA001 : crc >> 1;
    }
    return crc;
}

// FC 03 요청: 11 03 00 6B 00 03 → CRC 0x8776 → 76 87
size_t build_read_hr(uint8_t *f, uint8_t slave, uint16_t start, uint16_t qty) {
    f[0] = slave;       f[1] = 0x03;
    f[2] = start >> 8;  f[3] = start & 0xFF;   // 데이터: 빅엔디언
    f[4] = qty >> 8;    f[5] = qty & 0xFF;
    uint16_t crc = modbus_crc(f, 6);
    f[6] = crc & 0xFF;  f[7] = crc >> 8;       // CRC: Low 바이트 먼저
    return 8;
}`,
                    note: "수신 검증: 프레임 전체(CRC 포함)의 CRC 를 계산하면 0 이 나와야 함"
                },
                {
                    lang: "python",
                    title: "Modbus TCP 직접 구현 (socket + struct)",
                    src: `import socket, struct

def recv_exact(s, n):
    buf = b""
    while len(buf) < n:
        chunk = s.recv(n - len(buf))
        if not chunk:
            raise ConnectionError("closed")
        buf += chunk
    return buf

def read_holding(host, unit, start, qty, tid=1):
    pdu = struct.pack(">BHH", 0x03, start, qty)
    adu = struct.pack(">HHHB", tid, 0, len(pdu) + 1, unit) + pdu   # MBAP 7 B
    with socket.create_connection((host, 502), timeout=2) as s:
        s.sendall(adu)
        _, _, length, _ = struct.unpack(">HHHB", recv_exact(s, 7))
        body = recv_exact(s, length - 1)          # 기능코드 + 데이터
    if body[0] & 0x80:                            # 예외 응답
        raise IOError(f"Modbus exception {body[1]:02X}")
    n = body[1] // 2
    return struct.unpack(f">{n}H", body[2:2 + 2 * n])

print(read_holding("192.168.0.10", 0x11, 0x006B, 3))`,
                    note: "TCP 는 바이트 스트림 · 길이 필드(length field)만큼 정확히 읽어야 함"
                }
            ],
            optimize: [
                {
                    title: "레지스터 하나씩 10번 → 연속 블록 1번",
                    before: { lang: "c", src: `for (int i = 0; i < 10; i++)
    mb_read_hr(0x11, 0x006B + i, 1, &reg[i]);
// 10 왕복 · (요청 8 + 응답 7) B × 10 = 150 B` },
                    after: { lang: "c", src: `mb_read_hr(0x11, 0x006B, 10, reg);
// 1 왕복 · 8 + (5 + 20) = 33 B` },
                    gain: "왕복 10 → 1 · 150 → 33 B",
                    note: "FC 03 한 번에 최대 125 레지스터 · 맵을 연속 주소(contiguous addresses)로 설계"
                },
                {
                    title: "CRC 비트 루프 → 256 엔트리 테이블",
                    before: { lang: "c", src: `crc ^= *p++;
for (int i = 0; i < 8; i++)        // 바이트마다 8번 분기
    crc = (crc & 1) ? (crc >> 1) ^ 0xA001 : crc >> 1;` },
                    after: { lang: "c", src: `// T[b] = 비트 루프로 미리 계산한 값 (const 로 Flash 에)
crc = (crc >> 8) ^ T[(crc ^ *p++) & 0xFF];   // 바이트당 조회 1번` },
                    gain: "바이트당 루프 8회 → 0회 · 테이블 512 B"
                }
            ],
            glossary: [
                { term: "Modbus", en: "Modbus", def: "Modicon 이 만든 산업용 요청/응답 프로토콜 · RTU(시리얼), TCP" },
                { term: "홀딩 레지스터", en: "Holding register", def: "읽기/쓰기 16bit 레지스터 · FC 03/06/16" },
                { term: "기능 코드", en: "Function code", def: "요청 종류를 나타내는 1 바이트 · 예외 시 최상위 비트 set" },
                { term: "CRC-16/MODBUS", en: "CRC-16/MODBUS", def: "다항식 0x8005(반사 0xA001) · 초기값 0xFFFF · Low 바이트 먼저 전송" },
                { term: "MBAP", en: "Modbus Application Protocol header", def: "TCP 용 7 B 헤더: 트랜잭션 ID · 프로토콜 ID · 길이 · Unit ID" },
                { term: "예외 응답", en: "Exception response", def: "FC | 0x80 + 예외코드 · 01 기능, 02 주소, 03 값 오류" }
            ],
            quiz: [
                { q: "요청 `11 03 00 6B 00 03` 이 읽는 레지스터 수는?", options: ["107", "17", "6", "3"], a: 3, why: "마지막 두 바이트 `00 03` = 수량 3 · `00 6B`(107)는 시작 주소" },
                { q: "RTU 프레임에서 CRC 바이트 순서는?", options: ["Low 바이트 먼저", "High 바이트 먼저", "ASCII 두 글자", "데이터와 같은 빅엔디언"], a: 0, why: "데이터는 빅엔디언이지만 CRC 만 Low 먼저 · `0x8776` → `76 87`" },
                { q: "FC 03 요청의 예외 응답 기능코드는?", options: ["0x03", "0x80", "0x83", "0xFF"], a: 2, why: "0x03 | 0x80 = 0x83 · 0x80 만 보내면 어느 기능의 예외인지 사라짐" },
                { q: "슬레이브가 CRC 가 틀린 프레임을 받으면?", options: ["예외 코드 03 응답", "NACK 프레임 송신", "재전송 요청", "응답 안 함"], a: 3, why: "손상 프레임엔 무응답 → 마스터 타임아웃 · 예외 응답은 정상 수신했지만 처리 못 할 때" },
                { q: "Modbus TCP 에 RTU 의 CRC 가 없는 이유는?", options: ["MBAP 안에 CRC 포함", "TCP/이더넷이 검사", "Unit ID 가 대신함", "속도 때문에 생략"], a: 1, why: "이더넷 FCS(CRC-32)·TCP 체크섬이 이미 검사 · MBAP 에는 CRC 필드가 없음" },
                { type: "num", q: "9600 bps, 8E1(문자 11 bit)에서 t3.5 는 몇 ms?", answer: 4.01, tol: 0.02, unit: "ms", why: "3.5 × 11 / 9600 · 19200 bps 초과는 1.75 ms 고정값 권장" },
                { type: "text", q: "이 응답의 **두 번째** 레지스터 값은? (16진)", code: { lang: "txt", src: "11 03 06 AE 41 56 52 43 40 49 AD" }, answer: ["0x5652", "5652", "22098"], why: "바이트 수 06 뒤 2 B 씩 빅엔디언: AE41 · 5652 · 4340 · 끝 `49 AD` 는 CRC" },
                { type: "text", q: "이 요청 뒤에 붙는 CRC 두 바이트를 **전송 순서대로** 쓰면?", code: { lang: "py", src: "crc16_modbus(bytes.fromhex(\"01 03 00 00 00 01\"))   # → 0x0A84" }, answer: ["84 0A", "840A", "0x84 0x0A"], why: "Low 바이트 먼저 → `84 0A` · `0A 84` 로 붙이면 슬레이브는 무응답" },
                { type: "num", q: "매뉴얼의 `40108` 은 FC 03 PDU 주소로 얼마? (10진 또는 0x)", answer: 107, why: "4xxxx = 홀딩 레지스터 표 · 40001 → 0 이므로 40108 → 107 = 0x6B" },
                { type: "order", q: "Modbus TCP → RTU 게이트웨이 한 번의 왕복", items: ["클라이언트: MBAP + PDU → TCP 502", "게이트웨이: MBAP 떼고 주소 + CRC 붙임", "RS-485 로 RTU 요청 송신", "슬레이브: CRC 확인 후 응답", "게이트웨이: CRC 떼고 MBAP 붙여 회신"], why: "PDU 는 그대로 · 껍데기만 MBAP ↔ 주소 + CRC 로 교체 · Transaction ID 로 요청과 짝 맞춤" }
            ],
            refs: [
                { title: "MODBUS Application Protocol Specification V1.1b3", by: "Modbus Organization", year: 2012, url: "https://www.modbus.org/file/secure/modbusprotocolspecification.pdf", kind: "spec" },
                { title: "MODBUS over Serial Line Specification and Implementation Guide V1.02", by: "Modbus Organization", year: 2006, url: "https://www.modbus.org/file/secure/modbusoverserial.pdf", kind: "spec" },
                { title: "MODBUS Messaging on TCP/IP Implementation Guide V1.0b", by: "Modbus Organization", year: 2006, url: "https://www.modbus.org/file/secure/messagingimplementationguide.pdf", kind: "spec" }
            ]
        },
        {
            id: "tcpip",
            title: "TCP/IP",
            level: 2,
            mins: 14,
            checked: "2026-11-16",
            key: [
                "IP 는 주소로 **배달만** · 최선 노력(best effort) · TCP 가 순서·재전송(retransmission)·흐름 제어(flow control)",
                "연결: SYN → SYN-ACK → ACK (3-way handshake)",
                "seq/ack 는 **바이트 번호** · ack = 다음에 받을 바이트",
                "종료는 방향별 FIN + ACK · 먼저 닫은 쪽이 TIME_WAIT"
            ],
            concepts: [
                { term: "계층", en: "Protocol layers", def: "Ethernet(링크) → IP(주소·라우팅) → TCP/UDP(포트) → 앱" },
                { term: "4-튜플", en: "4-tuple", def: "연결 식별 = (src IP, src port, dst IP, dst port)" },
                { term: "윈도우", en: "Receive window", def: "수신 측이 받을 수 있는 바이트 수 광고 → 흐름 제어" },
                { term: "재전송", en: "Retransmission", def: "RTO 안에 ACK 없음, 또는 중복 ACK 3개 → 빠른 재전송" },
                { term: "TCP vs UDP", en: "Transmission Control Protocol vs User Datagram Protocol", def: "연결·신뢰·순서 vs 비연결·저지연 (DNS, 스트리밍, QUIC)" }
            ],
            demo: {
                type: "seq",
                actors: ["Client", "Server"],
                msgs: [
                    { from: 0, to: 1, label: "SYN seq=100", text: "연결 요청 · 초기 순서번호(initial sequence number, ISN) 100 · MSS 등 옵션 제시" },
                    { from: 1, to: 0, label: "SYN-ACK seq=300 ack=101", text: "SYN 도 1 바이트로 침 → ack = 101 · 서버 ISN 300" },
                    { from: 0, to: 1, label: "ACK seq=101 ack=301", text: "3-way handshake 완료 · 양쪽 **ESTABLISHED**" },
                    { from: 0, to: 1, label: "PSH seq=101 len=100", text: "데이터 100 바이트 = 바이트 101~200" },
                    { from: 1, to: 0, label: "ACK ack=201", text: "누적 ACK(cumulative ACK): 200 까지 받음, 다음은 201" },
                    { from: 0, to: 1, label: "FIN seq=201", text: "클라이언트 송신 끝 (FIN_WAIT_1)" },
                    { from: 1, to: 0, label: "ACK ack=202", text: "반쯤 닫힘(half-close) · 서버는 아직 보낼 수 있음 (CLOSE_WAIT)" },
                    { from: 1, to: 0, label: "FIN seq=301", text: "서버도 송신 끝 (LAST_ACK)" },
                    { from: 0, to: 1, label: "ACK ack=302", text: "클라이언트는 **TIME_WAIT** (2×MSL) 후 CLOSED" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "TCP 에코 서버",
                    src: `import socket

srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # TIME_WAIT 중에도 재시작
srv.bind(("0.0.0.0", 5000))
srv.listen()                          # 완료된 연결 대기 큐

while True:
    conn, addr = srv.accept()         # 3-way handshake 끝난 연결을 꺼냄
    with conn:
        print("connected", addr)
        while data := conn.recv(4096):   # b"" = 상대가 FIN 보냄
            conn.sendall(data)           # 다 보낼 때까지 반복 전송`
                },
                {
                    lang: "python",
                    title: "길이 접두 프레이밍 (메시지 경계 만들기)",
                    src: `import socket, struct

def send_msg(s, payload: bytes):
    s.sendall(struct.pack(">I", len(payload)) + payload)   # 4 B 길이 + 본문

def recv_exact(s, n):
    buf = bytearray()
    while len(buf) < n:
        chunk = s.recv(n - len(buf))      # 요청보다 적게 올 수 있음
        if not chunk:
            raise ConnectionError("peer closed")
        buf += chunk
    return bytes(buf)

def recv_msg(s):
    (n,) = struct.unpack(">I", recv_exact(s, 4))
    return recv_exact(s, n)

with socket.create_connection(("127.0.0.1", 5000), timeout=3) as s:
    send_msg(s, b"temp?")
    print(recv_msg(s))                    # 에코 서버라 그대로 돌아옴`,
                    note: "TCP 는 바이트 스트림 · send 1번 ≠ recv 1번"
                }
            ],
            optimize: [
                {
                    title: "작은 쓰기 2번 → 한 번에 (Nagle × Delayed ACK)",
                    before: { lang: "python", src: `s.send(header)   # 작은 세그먼트
s.send(body)     # Nagle: 앞의 ACK 올 때까지 보류
                 # 상대는 Delayed ACK 로 ACK 를 미룸 → 정체` },
                    after: { lang: "python", src: `s.sendall(header + body)   # 한 번에 쓰기
# 지연 민감 소켓이면: s.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)` },
                    gain: "수십~수백 ms 정체 제거"
                },
                {
                    title: "요청마다 새 연결 → 연결 재사용(connection reuse)",
                    before: { lang: "python", src: `for cmd in cmds:
    with socket.create_connection((HOST, PORT)) as s:  # 매번 SYN/SYN-ACK/ACK
        send_msg(s, cmd); print(recv_msg(s))           # 매번 FIN · TIME_WAIT 누적` },
                    after: { lang: "python", src: `with socket.create_connection((HOST, PORT)) as s:      # 연결 1번
    for cmd in cmds:
        send_msg(s, cmd); print(recv_msg(s))` },
                    gain: "요청당 1 RTT 절약 · TIME_WAIT 누적 없음"
                }
            ],
            glossary: [
                { term: "TCP", en: "Transmission Control Protocol", def: "연결형 · 순서 보장 · 재전송하는 바이트 스트림" },
                { term: "3-way handshake", en: "Three-way handshake", def: "SYN / SYN-ACK / ACK 로 양쪽 ISN 교환 후 연결 성립" },
                { term: "MSS", en: "Maximum Segment Size", def: "세그먼트 하나의 최대 데이터 · 이더넷 보통 1460 B (1500 − 20 − 20)" },
                { term: "TIME_WAIT", en: "TIME_WAIT", def: "먼저 닫은 쪽이 2×MSL 대기 · 늦게 온 패킷·마지막 ACK 유실 대비" },
                { term: "Nagle 알고리즘", en: "Nagle's algorithm", def: "ACK 대기 중 작은 데이터를 모아 보냄 · `TCP_NODELAY` 로 끔" },
                { term: "슬라이딩 윈도우", en: "Sliding window", def: "ACK 없이 보낼 수 있는 바이트 범위 · ACK 오면 앞으로 이동" }
            ],
            quiz: [
                { q: "클라이언트가 `SYN seq=100` 을 보냈다. SYN-ACK 의 ack 값은?", options: ["100", "101", "300", "0"], a: 1, why: "SYN 이 순서번호 1 을 소비 → 다음 기대 바이트 101 · 300 은 서버 자신의 ISN 예" },
                { q: "seq=101 로 100 바이트를 받은 쪽의 ACK 번호는?", options: ["101", "200", "100", "201"], a: 3, why: "101~200 수신 → 다음에 받을 201 · 200 은 마지막으로 받은 바이트 번호" },
                { q: "`recv(4096)` 한 번이 상대의 `send()` 한 번과 같다?", options: ["항상 같다", "Nagle 을 끄면 같다", "보장 없음", "LAN 안에선 같다"], a: 2, why: "TCP 는 바이트 스트림 · `TCP_NODELAY` 도 경계를 만들어 주진 않음 → 길이 접두·구분자" },
                { q: "TIME_WAIT 에 들어가는 쪽은?", options: ["먼저 FIN 을 보낸 쪽", "항상 서버", "항상 클라이언트", "나중에 FIN 을 보낸 쪽"], a: 0, why: "능동 종료 측이 마지막 ACK 후 2×MSL 대기 · 서버가 먼저 닫으면 서버가 TIME_WAIT" },
                { q: "작은 명령을 즉시 보내야 할 때 쓰는 소켓 옵션은?", options: ["SO_REUSEADDR", "SO_KEEPALIVE", "TCP_NODELAY", "SO_LINGER"], a: 2, why: "Nagle 끄기 → 작은 세그먼트도 바로 송신 · REUSEADDR 은 TIME_WAIT 중 재시작용" },
                { type: "num", q: "수신 윈도우 64 KB(65535 B), RTT 20 ms 면 TCP 처리량 상한은 몇 Mbit/s?", answer: 26.2, tol: 0.1, unit: "Mbit/s", why: "윈도우 / RTT = 65535 × 8 / 0.02 s · 윈도우 스케일이 없으면 이게 한계" },
                { type: "num", q: "100 Mbit/s 링크, RTT 40 ms 를 꽉 채우려면 윈도우가 몇 KB 필요한가? (1 KB = 1000 B)", answer: 500, tol: 1, unit: "KB", why: "대역폭-지연 곱 = 100e6 / 8 × 0.04 s · 16 비트 윈도우(64 KB)로는 부족" },
                { type: "num", q: "MSS 1460 B 세그먼트 하나가 이더넷 선 위에서 차지하는 바이트는? (프리앰블 8 · IFG 12 포함)", answer: 1538, unit: "B", why: "1460 + TCP 20 + IP 20 + 이더넷 헤더 14 + FCS 4 + 8 + 12 · 효율 약 95%" },
                { type: "order", q: "연결부터 종료까지 (클라이언트가 먼저 닫음)", items: ["SYN", "SYN-ACK", "ACK (ESTABLISHED)", "데이터 · 누적 ACK", "클라이언트 FIN", "서버 ACK (CLOSE_WAIT)", "서버 FIN", "클라이언트 ACK → TIME_WAIT"], why: "연결은 3 번, 종료는 방향별 FIN + ACK 로 4 번 · 먼저 닫은 쪽이 TIME_WAIT" }
            ],
            refs: [
                { title: "RFC 9293 Transmission Control Protocol (TCP)", by: "W. Eddy", year: 2022, url: "https://www.rfc-editor.org/rfc/rfc9293", kind: "spec" },
                { title: "RFC 791 Internet Protocol", by: "J. Postel", year: 1981, url: "https://www.rfc-editor.org/rfc/rfc791", kind: "spec" },
                { title: "RFC 768 User Datagram Protocol", by: "J. Postel", year: 1980, url: "https://www.rfc-editor.org/rfc/rfc768", kind: "spec" },
                { title: "RFC 896 Congestion Control in IP/TCP Internetworks", by: "J. Nagle", year: 1984, url: "https://www.rfc-editor.org/rfc/rfc896", kind: "spec" }
            ]
        },
        {
            id: "mqtt",
            title: "MQTT",
            level: 2,
            mins: 14,
            pre: ["protocols/tcpip"],
            checked: "2026-11-16",
            key: [
                "Pub/Sub: 발행자(publisher)·구독자(subscriber)는 서로 모르고 **브로커(broker)**만 앎",
                "토픽 `a/b/c` · 구독 와일드카드 `+` 한 단계(single-level), `#` 하위 전부(multi-level)",
                "QoS 0 최대 1회(at most once) · **1 최소 1회(at least once), 중복 가능** · 2 정확히 1회(exactly once)",
                "retain = 마지막 값 보관 · LWT = 비정상 끊김(ungraceful disconnect) 알림"
            ],
            concepts: [
                { term: "브로커", en: "Broker", def: "구독 목록 관리·메시지 라우팅 · Mosquitto, EMQX, HiveMQ 등" },
                { term: "Keepalive", def: "그 시간 동안 보낼 게 없으면 PINGREQ · 1.5배 넘게 조용하면 브로커가 끊음" },
                { term: "세션 유지", en: "Persistent session", def: "Clean Start=0 (3.1.1: cleanSession=false) → 끊긴 동안 QoS1/2 메시지 보관" },
                { term: "전달 QoS", en: "Delivered Quality of Service (QoS)", def: "브로커→구독자 QoS = min(발행 QoS, 구독 QoS)" },
                { term: "MQTT 5", en: "MQ Telemetry Transport (MQTT) Version 5.0", def: "reason code · user property · message expiry · 공유 구독 `$share/그룹/토픽`" }
            ],
            demo: {
                type: "seq",
                actors: ["센서 (Pub)", "Broker", "앱 (Sub)"],
                msgs: [
                    { from: 0, to: 1, label: "CONNECT will=l1/status \"offline\"", text: "TCP 1883 (TLS 8883) · **Will(LWT)** 등록 · keepalive 60 s" },
                    { from: 1, to: 0, label: "CONNACK 0", text: "연결 수락" },
                    { from: 0, to: 1, label: "PUBLISH l1/status \"online\" retain", text: "**retain**: 브로커가 토픽별 마지막 값 1개 저장" },
                    { from: 2, to: 1, label: "CONNECT (→ CONNACK)", text: "앱 접속 · 이후 응답 CONNACK 생략" },
                    { from: 2, to: 1, label: "SUBSCRIBE l1/# QoS1", text: "`#` = l1 아래 전부 · 최대 QoS 1 요청" },
                    { from: 1, to: 2, label: "SUBACK [1]", text: "허용된 QoS 목록 회신" },
                    { from: 1, to: 2, label: "PUBLISH l1/status \"online\" (retain)", text: "구독 즉시 retained 값 전달 · 센서가 지금 발행하지 않아도 상태를 앎" },
                    { from: 0, to: 1, label: "PUBLISH l1/temp 23.5 QoS1 id=7", text: "QoS 1 · Packet ID 7" },
                    { from: 1, to: 0, label: "PUBACK id=7", text: "PUBACK 못 받으면 **DUP** 플래그로 재전송(retransmit) → 중복 가능" },
                    { from: 1, to: 2, label: "PUBLISH l1/temp 23.5 QoS1", text: "구간마다 별도 · 전달 QoS(delivered QoS) = min(1, 1) = 1" },
                    { from: 2, to: 1, label: "PUBACK", text: "구독자 → 브로커 구간도 따로 확인" },
                    { from: 1, to: 1, label: "센서 무응답 > 1.5×keepalive", text: "DISCONNECT 없이 끊김 = 비정상 종료" },
                    { from: 1, to: 2, label: "PUBLISH l1/status \"offline\" (Will)", text: "브로커가 Will 을 대신 발행 · 정상 DISCONNECT 면 발행 안 함" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "센서: LWT + retained 상태 + QoS1 발행 (paho-mqtt 2.x)",
                    src: `import json, time
import paho.mqtt.client as mqtt   # pip install "paho-mqtt>=2"

c = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="sensor-l1")
c.will_set("factory/l1/status", "offline", qos=1, retain=True)  # CONNECT 전에 설정
c.connect("broker.local", 1883, keepalive=60)
c.loop_start()                                                  # 네트워크 스레드

c.publish("factory/l1/status", "online", qos=1, retain=True)    # 새 구독자도 즉시 받음
for _ in range(10):
    info = c.publish("factory/l1/temp", json.dumps({"t": 23.5}), qos=1)
    info.wait_for_publish()                # QoS1: PUBACK 받을 때까지
    time.sleep(5)

c.publish("factory/l1/status", "offline", qos=1, retain=True).wait_for_publish()
c.disconnect()                             # 정상 DISCONNECT → Will 발행 안 됨
c.loop_stop()`
                },
                {
                    lang: "python",
                    title: "앱: 와일드카드 구독",
                    src: `import paho.mqtt.client as mqtt

def on_connect(client, userdata, flags, reason_code, properties):
    # 재접속 때마다 호출 → 여기서 구독해야 자동 복구됨
    client.subscribe([("factory/+/temp", 1), ("factory/+/status", 1)])

def on_message(client, userdata, msg):
    tag = " (retained)" if msg.retain else ""
    print(f"{msg.topic} = {msg.payload.decode()} q{msg.qos}{tag}")

c = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="dashboard")
c.on_connect = on_connect
c.on_message = on_message
c.connect("broker.local", 1883, keepalive=60)
c.loop_forever()                           # 끊기면 자동 재접속`,
                    note: "QoS1 은 중복이 올 수 있음 → 처리 로직을 멱등(idempotent)하게"
                }
            ],
            optimize: [
                {
                    title: "매번 연결·발행·종료 → 연결 유지(persistent connection)",
                    before: { lang: "python", src: `for v in readings():
    c = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    c.connect("broker.local", 1883)   # 매번 TCP + CONNECT (+ TLS)
    c.publish("l1/temp", v, qos=1)
    c.disconnect()                    # PUBACK 전에 끊길 수도` },
                    after: { lang: "python", src: `c = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="sensor-l1")
c.connect("broker.local", 1883, keepalive=60)
c.loop_start()                        # 연결 1개 유지 · 자동 재접속
for v in readings():
    c.publish("l1/temp", v, qos=1)` },
                    gain: "메시지당 핸드셰이크 0 · 지연·전력 감소"
                },
                {
                    title: "무조건 QoS 2 → QoS 1 + 멱등 처리",
                    before: { lang: "python", src: `c.publish("l1/temp", v, qos=2)
# PUBLISH → PUBREC → PUBREL → PUBCOMP (4 패킷)` },
                    after: { lang: "python", src: `c.publish("l1/temp", json.dumps({"seq": n, "t": v}), qos=1)
# PUBLISH → PUBACK (2 패킷) · 수신 측은 seq 로 중복 무시` },
                    gain: "메시지당 패킷 4 → 2"
                }
            ],
            glossary: [
                { term: "MQTT", en: "MQTT (OASIS 표준 3.1.1 / 5.0)", def: "TCP 위의 경량 Pub/Sub 메시징 프로토콜 · IoT 표준" },
                { term: "브로커", en: "Broker", def: "클라이언트 연결·구독을 관리하고 메시지를 중계하는 서버" },
                { term: "QoS", en: "Quality of Service", def: "전달 보장 수준 · 0 최대 1회, 1 최소 1회, 2 정확히 1회" },
                { term: "Retained 메시지", en: "Retained message", def: "토픽별 마지막 메시지 1개를 브로커가 보관 · 새 구독자에게 즉시" },
                { term: "LWT", en: "Last Will and Testament", def: "비정상 끊김 시 브로커가 대신 발행하도록 CONNECT 때 맡긴 메시지" },
                { term: "토픽 와일드카드", en: "Topic wildcard", def: "`+` 한 단계, `#` 하위 전부 · 구독에만 사용" }
            ],
            quiz: [
                { q: "구독 `factory/+/temp` 와 매칭되는 토픽은?", options: ["factory/temp", "factory/l1/a/temp", "factory/l1/temp", "plant/l1/temp"], a: 2, why: "`+` 는 정확히 한 단계 · 0 단계(factory/temp)나 두 단계(l1/a)는 안 맞음" },
                { q: "QoS 1 구독자가 반드시 대비해야 할 것은?", options: ["중복 수신", "메시지 유실", "순서 뒤바뀜", "토픽 변경"], a: 0, why: "PUBACK 이 사라지면 재접속 때 재전송 → 같은 메시지 두 번 · 유실은 QoS 0 쪽 위험" },
                { q: "발행 QoS 2, 구독 QoS 1 이면 구독자가 받는 QoS 는?", options: ["0", "2", "브로커 기본값", "1"], a: 3, why: "전달 QoS = min(발행, 구독) · 발행 QoS 가 구독자 구간까지 올라가지 않음" },
                { q: "LWT 가 발행되는 경우는?", options: ["정상 DISCONNECT 때", "keepalive 초과 시", "새 구독자 접속 시", "retain 값 변경 시"], a: 1, why: "비정상 끊김(keepalive 초과·네트워크 오류)에서만 · 정상 DISCONNECT 면 Will 은 폐기" },
                { q: "새 구독자가 접속 즉시 장치의 마지막 상태를 받으려면?", options: ["QoS 2 로 발행", "keepalive 를 0 으로", "Clean Start = 1", "retain 플래그로 발행"], a: 3, why: "브로커가 토픽별 마지막 retained 값을 바로 전달 · QoS 는 전달 보장이지 보관이 아님" },
                { type: "text", q: "Remaining Length 200 을 가변 길이 정수로 인코딩하면? (16진 바이트)", answer: ["C8 01", "C801", "0xC8 0x01"], why: "200 = 1 × 128 + 72 → 72 | 0x80 = 0xC8, 다음 바이트 0x01 · 127 이하만 1 바이트" },
                { type: "text", q: "QoS 1, retain = 1 인 PUBLISH 의 고정 헤더 첫 바이트는? (16진)", answer: ["0x33", "33", "51"], why: "타입 3 << 4 = 0x30 · QoS 1 << 1 = 0x02 · RETAIN = 0x01" },
                { type: "num", q: "3.1.1 PUBLISH, 토픽 `l1/temp`(7 B), QoS 1, 페이로드 4 B 의 Remaining Length 는?", answer: 15, unit: "B", why: "토픽 길이 2 + 토픽 7 + Packet ID 2 + 페이로드 4 · QoS 0 이면 Packet ID 가 없어 13" },
                { type: "num", q: "keepalive 60 s 인 클라이언트가 조용해지면 브로커는 최대 몇 초 뒤 연결을 끊나?", answer: 90, unit: "s", why: "1.5 × keepalive · 끊으면서 Will 을 발행" },
                { type: "order", q: "한 클라이언트가 접속해 QoS 1 로 주고받는 순서", items: ["TCP 연결 (1883)", "CONNECT → CONNACK", "SUBSCRIBE → SUBACK", "PUBLISH (QoS 1) → PUBACK", "DISCONNECT"], why: "MQTT 는 TCP 위에서 CONNECT 로 시작 · 구독은 SUBACK 으로 허용 QoS 확인 · 정상 DISCONNECT 면 Will 폐기" }
            ],
            refs: [
                { title: "MQTT Version 5.0", by: "A. Banks et al.", year: 2019, url: "https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html", kind: "spec" },
                { title: "MQTT Version 3.1.1 Plus Errata 01", by: "A. Banks et al.", year: 2015, url: "https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html", kind: "spec" },
                { title: "Eclipse Paho MQTT Python Client", by: "Eclipse Foundation", url: "https://eclipse.dev/paho/files/paho.mqtt.python/html/index.html", kind: "doc" }
            ]
        },
        {
            id: "ble",
            title: "BLE",
            level: 3,
            mins: 16,
            checked: "2026-11-16",
            key: [
                "광고(advertising) → 연결 → **GATT** 로 데이터 교환",
                "40 채널: 광고 3개(37·38·39) + 데이터 37개 호핑",
                "GATT: 서비스 ⊃ 특성(characteristic) · 모든 항목은 **핸들**로 접근",
                "Notify 는 CCCD 에 `0x0001` 써서 켬 · 폴링보다 저전력"
            ],
            concepts: [
                { term: "GAP 역할", en: "Generic Access Profile (GAP) roles", def: "Peripheral(광고·연결 수락) / Central(스캔·연결 시작)" },
                { term: "ATT / GATT", en: "Attribute Protocol / Generic Attribute Profile", def: "ATT = 핸들·UUID·값 테이블 · GATT = 그 위의 서비스/특성 구조" },
                { term: "연결 파라미터", en: "Connection parameters", def: "간격 7.5 ms~4 s (1.25 ms 단위 · 6.2 SCI 는 최소 375 µs) · peripheral latency · 감독 타임아웃" },
                { term: "MTU / DLE", en: "Maximum Transmission Unit / Data Length Extension", def: "ATT MTU 기본 23 B → 교환으로 확대 · DLE 로 링크 페이로드 27 → 251 B" },
                { term: "Notify / Indicate", def: "확인 응답 없음 / ATT Confirmation 필요 (느리지만 확실)" }
            ],
            demo: {
                type: "seq",
                actors: ["Peripheral", "Central"],
                msgs: [
                    { from: 0, to: 1, label: "ADV_IND (ch 37·38·39)", text: "광고 채널 3개를 돌며 주기 송신 · 이름·서비스 UUID (레거시 최대 31 B)" },
                    { from: 1, to: 0, label: "SCAN_REQ", text: "능동 스캔(active scanning): 추가 정보 요청" },
                    { from: 0, to: 1, label: "SCAN_RSP", text: "스캔 응답 · 31 B 더 (예: 전체 이름)" },
                    { from: 1, to: 0, label: "CONNECT_IND", text: "연결 간격(connection interval)·latency·타임아웃·채널 맵 지정 · 이후 데이터 채널 호핑" },
                    { from: 1, to: 0, label: "Read By Group Type (서비스)", text: "GATT 1차 서비스(primary service) 탐색(discovery)" },
                    { from: 0, to: 1, label: "0x180F Battery · 0x0010–0x0013", text: "서비스 UUID 와 핸들 범위" },
                    { from: 1, to: 0, label: "Read By Type (특성)", text: "그 범위 안 특성 탐색" },
                    { from: 0, to: 1, label: "0x2A19 Level · 값 핸들 0x0012", text: "속성(properties): Read, Notify · CCCD 는 0x0013" },
                    { from: 1, to: 0, label: "Read Request 0x0012", text: "ATT Read (opcode 0x0A)" },
                    { from: 0, to: 1, label: "Read Response 0x5A", text: "0x5A = 90 %" },
                    { from: 1, to: 0, label: "Write Request 0x0013 = 01 00", text: "CCCD 에 `0x0001` (리틀엔디언) = Notify 켜기 · Indicate 는 `0x0002`" },
                    { from: 0, to: 1, label: "Notification 0x0012 = 0x59", text: "값이 바뀔 때마다 **푸시** · 응답 없음 (89 %)" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "bleak: 스캔 → 연결 → 읽기 → Notify",
                    src: `import asyncio
from bleak import BleakScanner, BleakClient   # pip install bleak

BATTERY_LEVEL = "00002a19-0000-1000-8000-00805f9b34fb"   # 0x2A19 의 128bit 형

def on_notify(_char, data: bytearray):
    print("notify:", data[0], "%")

async def main():
    dev = await BleakScanner.find_device_by_name("MySensor", timeout=10)  # 광고 스캔
    if dev is None:
        raise SystemExit("not found")
    async with BleakClient(dev) as client:            # 연결 + 서비스 탐색
        level = await client.read_gatt_char(BATTERY_LEVEL)    # Read Request
        print("read:", level[0], "%")
        await client.start_notify(BATTERY_LEVEL, on_notify)   # CCCD = 0x0001
        await asyncio.sleep(30)                               # 알림 수신
        await client.stop_notify(BATTERY_LEVEL)

asyncio.run(main())`,
                    note: "16bit UUID 는 Bluetooth 기본 UUID(Base UUID) `0000xxxx-0000-1000-8000-00805f9b34fb` 에 끼운 것"
                },
                {
                    lang: "python",
                    title: "광고 데이터(AD 구조) 파싱",
                    src: `def parse_adv(raw: bytes) -> dict:
    """AD 구조 반복: [길이][타입][데이터 (길이-1 B)]"""
    out, i = {}, 0
    while i < len(raw) and raw[i]:
        n, t = raw[i], raw[i + 1]
        out[t] = raw[i + 2 : i + 1 + n]
        i += 1 + n
    return out

adv = bytes.fromhex("020106" "03030F18" "0909" + b"MySensor".hex())
ad = parse_adv(adv)
print(ad[0x01].hex())                            # Flags 06 = General Discoverable + BR/EDR 미지원
print(hex(int.from_bytes(ad[0x03], "little")))   # 16bit UUID 목록 → 0x180f (Battery)
print(ad[0x09].decode())                         # Complete Local Name → MySensor`
                }
            ],
            optimize: [
                {
                    title: "주기적 Read 폴링 → Notify",
                    before: { lang: "python", src: `while True:
    v = await client.read_gatt_char(BATTERY_LEVEL)  # 요청 + 응답 2 PDU
    await asyncio.sleep(1)                         # 안 바뀌어도 매번` },
                    after: { lang: "python", src: `await client.start_notify(BATTERY_LEVEL, on_notify)
# 바뀔 때만 Notification 1 PDU` },
                    gain: "PDU 2 → 1 · 값 변화 없으면 0"
                },
                {
                    title: "연결 간격 최소 고정 → 간격 + peripheral latency",
                    before: { lang: "c", src: `// 7.5 ms, latency 0 → 초당 ~133 번 라디오 ON
bt_conn_le_param_update(conn, BT_LE_CONN_PARAM(6, 6, 0, 400));` },
                    after: { lang: "c", src: `// 100 ms, latency 4 → 보낼 게 없으면 500 ms 마다만 응답
bt_conn_le_param_update(conn, BT_LE_CONN_PARAM(80, 80, 4, 400));
// 단위: 간격 1.25 ms · 타임아웃 10 ms (400 = 4 s)` },
                    gain: "유휴 시 깨어남 ~133 → ~2 회/s",
                    note: "Zephyr 예시 · 최종 값은 Central 이 결정 (요청은 거절될 수 있음)"
                }
            ],
            glossary: [
                { term: "BLE", en: "Bluetooth Low Energy", def: "2.4 GHz 저전력 무선 · 2 MHz 간격 40 채널" },
                { term: "GATT", en: "Generic Attribute Profile", def: "서비스·특성·디스크립터로 데이터를 구조화하는 규칙" },
                { term: "특성", en: "Characteristic", def: "값 + 속성(Read/Write/Notify) · UUID 로 식별 (예: 0x2A19)" },
                { term: "CCCD", en: "Client Characteristic Configuration Descriptor", def: "UUID 0x2902 · Notify/Indicate 켜기 스위치" },
                { term: "연결 간격", en: "Connection interval", def: "연결 이벤트 주기 · 짧을수록 빠르고 전력↑" },
                { term: "ATT MTU", en: "ATT Maximum Transmission Unit", def: "ATT PDU 최대 크기 · 기본 23 B, Exchange MTU 로 확대 · 속성 값은 최대 512 B" }
            ],
            quiz: [
                { q: "BLE 광고 전용(primary) 채널 수는?", options: ["1", "37", "3", "40"], a: 2, why: "37·38·39 세 채널 · 37 은 데이터 채널 수라 헷갈림" },
                { q: "Central 이 Notify 를 켜는 방법은?", options: ["특성 값 핸들에 1 쓰기", "광고를 다시 시작", "MTU 교환 요청", "CCCD 에 0x0001"], a: 3, why: "CCCD(0x2902) 비트0 = Notify, 비트1 = Indicate · 값 핸들에 쓰면 특성 값이 바뀔 뿐" },
                { q: "ATT MTU 23 일 때 Notification 한 번의 최대 값 크기는?", options: ["20 B", "23 B", "27 B", "251 B"], a: 0, why: "23 − opcode 1 − 핸들 2 = 20 B · 27 B 는 링크 계층 기본 페이로드" },
                { q: "Notify 와 Indicate 의 차이는?", options: ["Indicate 쪽이 더 빠름", "Indicate 만 확인 필요", "Notify 는 C→P 방향", "둘 다 확인 응답 필요"], a: 1, why: "Indicate 는 Confirmation(0x1E)을 받아야 다음 전송 → 느리지만 확실 · 방향은 둘 다 서버 → 클라이언트" },
                { q: "연결 간격을 늘리면?", options: ["지연↓ 전력↑", "처리량 증가", "지연↑ 전력↓", "광고 주기 감소"], a: 2, why: "라디오가 덜 깨어나 전력↓ · 대신 응답이 느리고 처리량도 줄어듦" },
                { type: "num", q: "연결 간격 50 ms, peripheral latency 4 면 보낼 게 없을 때 Peripheral 은 몇 ms 마다 깨어나나?", answer: 250, unit: "ms", why: "(1 + 4) × 50 ms · 보낼 데이터가 생기면 다음 이벤트에 바로 송신" },
                { type: "num", q: "간격 100 ms, latency 4 일 때 감독 타임아웃은 몇 ms 보다 커야 하나?", answer: 1000, unit: "ms", why: "(1 + latency) × 간격 × 2 = 5 × 100 × 2 · 규격 범위는 100 ms–32 s" },
                { type: "num", q: "ATT MTU 247 이면 Notification 하나에 실리는 값은 최대 몇 B?", answer: 244, unit: "B", why: "247 − opcode 1 − 핸들 2 · L2CAP 4 B 를 더하면 DLE 최대 251 B 에 딱 맞음" },
                { type: "text", q: "이 광고 데이터에 든 16bit 서비스 UUID 는? (16진)", code: { lang: "txt", src: "02 01 06  03 03 0F 18  09 09 4D 79 53 65 6E 73 6F 72" }, answer: ["0x180F", "180F"], why: "AD 구조 `03 03 0F 18`: 길이 3 · 타입 0x03(16bit UUID 목록) · 리틀엔디언 → 0x180F (Battery)" },
                { type: "order", q: "앱이 센서 값을 Notify 로 받기까지", items: ["광고 수신 (ADV_IND)", "CONNECT_IND 로 연결", "서비스·특성 탐색", "CCCD 에 01 00 쓰기", "Notification 수신"], why: "연결 파라미터는 CONNECT_IND 에 · 핸들은 탐색으로 알아냄 · CCCD 를 써야 푸시가 시작" }
            ],
            refs: [
                { title: "Core Specification 6.0", by: "Bluetooth SIG", year: 2024, url: "https://www.bluetooth.com/specifications/specs/core-specification-6-0/", kind: "spec" },
                { title: "The Bluetooth Low Energy Primer (v1.2.0)", by: "Bluetooth SIG", year: 2024, url: "https://www.bluetooth.com/wp-content/uploads/2022/05/the-bluetooth-le-primer-v1.2.0.pdf", kind: "doc" },
                { title: "Assigned Numbers", by: "Bluetooth SIG", url: "https://www.bluetooth.com/specifications/assigned-numbers/", kind: "spec" }
            ]
        }
    ]
});
