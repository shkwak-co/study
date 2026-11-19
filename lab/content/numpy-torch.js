LAB.track({
    id: "numpy-torch",
    name: "NumPy·PyTorch",
    icon: "∇",
    color: "#ef6c4a",
    tagline: "배열 메모리와 브로드캐스팅에서 autograd, 학습 루프, GPU 까지 — 돌려 보며 익히기",
    trends: [
        {
            title: "PyTorch 2026: 두 달마다 릴리스",
            when: "2026",
            points: [
                "2.10 (2026-01): TorchScript 지원 중단 예고 → `torch.export` · 릴리스 주기 분기 → **2개월**",
                "2.13 (2026-07): `nn.LinearCrossEntropyLoss` — 큰 어휘 손실의 최대 메모리 최대 약 4배↓ · `torch.load` 가 safetensors 직접 읽기",
                "2.15 (2026-10-28): Python 3.11–3.15 (free-threaded 3.14t·3.15t 포함) · Python 3.15 에서 `torch.compile` · CUDA 13.2 기본 휠"
            ],
            refs: [
                { title: "PyTorch 2.10 Release Blog", by: "PyTorch Foundation", year: 2026, url: "https://pytorch.org/blog/pytorch-2-10-release-blog/", kind: "doc" },
                { title: "PyTorch 2.13 Release Blog", by: "PyTorch Foundation", year: 2026, url: "https://pytorch.org/blog/pytorch-2-13-release-blog/", kind: "doc" },
                { title: "PyTorch 2.15 Release Blog", by: "PyTorch Foundation", year: 2026, url: "https://pytorch.org/blog/pytorch-2-15-release-blog/", kind: "doc" }
            ]
        },
        {
            title: "NumPy 2.5: 전환 릴리스(transitional release)",
            when: "2026",
            points: [
                "2026-06-21 출시 · Python 3.12–3.14 · `numpy.distutils` 제거, 2.0 시절 지원 중단(deprecation) 항목 대거 만료",
                "free-threaded Python 용 안정 ABI(PEP 803) 지원 · 멀티스레드 ufunc 확장성 개선",
                "`linalg.eig` 는 항상 복소수 반환 · 배열의 `shape`·`dtype` 속성에 대입하기는 지원 중단 예고 → `reshape`·`view` 로"
            ],
            refs: [
                { title: "NumPy 2.5.0 Release Notes", by: "NumPy Developers", year: 2026, url: "https://numpy.org/doc/2.5/release/2.5.0-notes.html", kind: "doc" },
                { title: "Numpy 2.5.0 Released (numpy-discussion)", by: "NumPy Developers", year: 2026, url: "https://mail.python.org/archives/list/numpy-discussion@python.org/thread/X7VS26GJPEVQC2A32WMIB2G4OACURDWM/", kind: "doc" }
            ]
        },
        {
            title: "커널 언어가 늘어난다: Triton 옆에 CuTeDSL·FlyDSL",
            when: "2026",
            points: [
                "2.13: 컴파일러 Inductor 에 CuTeDSL 백엔드 (행렬곱·RMSNorm) — Triton 과 나란히",
                "2.14 (2026-09): NVGEMM — CuTeDSL 로 만든 CUTLASS 커널을 Triton·ATen 과 함께 자동 튜닝",
                "2.15: AMD 용 FlyDSL 추가 — 'CuTeDSL, Triton, Helion 과 함께 PyTorch 가 쓰는 커널 DSL'",
                "모델 코드는 그대로 Python · 바뀌는 건 그 아래 커널 언어 (languages 트랙 'AI 스택의 언어')"
            ],
            refs: [
                { title: "PyTorch 2.14 Release Blog", by: "PyTorch Foundation", year: 2026, url: "https://pytorch.org/blog/pytorch-2-14-release-blog/", kind: "doc" },
                { title: "PyTorch 2.15 Release Blog", by: "PyTorch Foundation", year: 2026, url: "https://pytorch.org/blog/pytorch-2-15-release-blog/", kind: "doc" }
            ]
        }
    ],
    lessons: [
        {
            id: "np-ndarray",
            title: "ndarray 해부 — 버퍼·shape·strides·dtype",
            level: 1,
            mins: 15,
            pre: ["languages/python-internals"],
            checked: "2026-11-19",
            key: [
                "ndarray = 연속 메모리 **버퍼(buffer)** 하나 + `dtype` + `shape` + **스트라이드(strides)**",
                "주소 = offset + Σ 인덱스 × stride · stride 는 '한 칸 갈 때 건너뛰는 바이트'",
                "`.T`·슬라이스·대부분의 `reshape` 는 **뷰(view)** — 숫자만 바뀌고 데이터는 그대로",
                "고급 인덱싱(advanced indexing)·`.copy()` 는 **복사(copy)** · 확인은 `np.shares_memory`",
                "리스트와 달리 같은 타입 숫자가 빈틈없이 → C 루프가 바로 읽음 (이 PC 에서 약 ×200)"
            ],
            concepts: [
                { term: "버퍼", en: "Data buffer", def: "원소 값이 빈틈없이 놓인 메모리 한 덩어리 · 여러 배열이 나눠 쓸 수 있음" },
                { term: "스트라이드", en: "Strides", def: "축마다 다음 원소까지 건너뛸 바이트 수 · `(3, 4)` int32 C 순서면 `(16, 4)`" },
                { term: "뷰", en: "View", def: "같은 버퍼를 다른 shape·strides·offset 으로 보는 배열 · 쓰면 원본도 바뀜" },
                { term: "C 순서", en: "Row-major order (C order)", def: "마지막 축이 메모리에서 가장 빨리 변함 · NumPy·PyTorch 기본" },
                { term: "연속 배열", en: "Contiguous array", def: "원소가 C 순서(또는 F 순서)로 빈틈없이 놓인 상태 · `flags['C_CONTIGUOUS']`" }
            ],
            demo: { type: "sim", name: "strides", shape: [3, 4], item: 4 },
            code: [
                {
                    lang: "python",
                    title: "뷰와 복사 구별하기 (NumPy 2.5.5 로 실행)",
                    src: `import numpy as np

a = np.arange(12, dtype=np.int32).reshape(3, 4)
print(a.strides)                     # (16, 4): 다음 행 16 B, 다음 열 4 B
t = a.T                              # 뷰: strides 만 뒤집힘
print(t.strides, np.shares_memory(a, t))   # (4, 16) True
s = a[:, ::2]                        # 뷰: 열 stride 가 8 B
s[0, 0] = 99                         # 뷰에 쓰면
print(a[0, 0])                       # 99  ← 원본이 바뀜
f = a[[0, 2]]                        # 고급 인덱싱 → 복사
print(np.shares_memory(a, f))        # False
r = t.reshape(-1)                    # 전치 후 펼치기: 뷰로 못 만들어 복사
print(np.shares_memory(a, r), r.base is None)   # False False`,
                    note: "마지막 줄: 복사본인데 `base` 는 None 이 아님(중간 복사본을 가리킴) · 공유 여부는 `np.shares_memory` 로"
                },
                {
                    lang: "python",
                    title: "dtype 이 메모리와 값의 범위를 정한다",
                    src: `x = np.arange(1_000_000, dtype=np.float64)
print(x.nbytes / 2**20)                     # 7.62939453125 MiB
print(x.astype(np.float32).nbytes / 2**20)  # 3.814697265625 MiB (새 버퍼)
u = np.array([200], dtype=np.uint8)
print(u + 100)                              # [44]  ← 300 − 256, 경고 없음`,
                    note: "정수 dtype 은 넘치면 조용히 돌아감(wraparound) · 픽셀 값(uint8) 더하기 전에 `astype(np.int16)`"
                }
            ],
            optimize: [
                {
                    title: "Python 리스트 루프 → ndarray 한 번",
                    before: { lang: "python", src: `data = [float(i) for i in range(1_000_000)]
total = sum(v * v for v in data)      # 원소마다 객체 꺼내 타입 확인` },
                    after: { lang: "python", src: `arr = np.array(data)                  # float64 버퍼
total = float(np.dot(arr, arr))       # 루프는 C·BLAS 안에서` },
                    gain: "약 ×218 (이 PC, 22.7 ms → 0.10 ms)",
                    note: "측정: `timeit` 5회 중 최소 · 숫자는 CPU 마다 다름, 자릿수가 바뀐다는 점이 핵심"
                },
                {
                    title: "전치 뷰를 행 단위로 반복 → 한 번 연속 배열(contiguous array)로 복사",
                    before: { lang: "python", src: `bt = big.T                       # (4000, 4000) float64, F 순서 뷰
rows = [row.sum() for row in bt[:2000]]   # 행 하나 = 32000 B 간격으로 흩어진 원소` },
                    after: { lang: "python", src: `bc = np.ascontiguousarray(big.T)  # 한 번 복사 (122 MiB)
rows = [row.sum() for row in bc[:2000]]   # 행 하나가 연속 → 캐시 친화` },
                    gain: "×7.5 (이 PC, 복사 시간 제외)",
                    note: "여러 번 행 단위로 쓸 때만 이득 · 한 번이면 `big.sum(axis=0)` 처럼 축 연산이 정답"
                }
            ],
            glossary: [
                { term: "기본 인덱싱", en: "Basic indexing", def: "정수·슬라이스·`...`·`None` 만 쓰는 인덱싱 · 항상 뷰" },
                { term: "고급 인덱싱", en: "Advanced (fancy) indexing", def: "정수 배열·불리언 배열로 고르기 · 항상 복사" },
                { term: "F 순서", en: "Column-major order (Fortran order)", def: "첫 축이 가장 빨리 변하는 배치 · C 배열의 `.T` 가 이 모양" },
                { term: "정수 랩어라운드", en: "Integer wraparound", def: "고정 폭 정수가 범위를 넘으면 2ⁿ 으로 나눈 나머지가 됨" },
                { term: "itemsize", en: "Item size in bytes", def: "원소 하나의 바이트 수 · int32 → 4, float64 → 8" }
            ],
            quiz: [
                { q: "`a = np.arange(12, dtype=np.int32).reshape(3, 4)` 의 `a.strides` 는?", options: ["(4, 16)", "(4, 1)", "(16, 4)", "(12, 4)"], a: 2, why: "행 하나 = 4원소 × 4 B = 16 B, 열 하나 = 4 B · (4, 1) 은 바이트가 아니라 원소 단위로 센 값" },
                { q: "다음 중 원본과 메모리를 **공유하지 않는** 것은? (`a` 는 3×4)", options: ["`a.T`", "`a[1:, ::2]`", "`a[[0, 2]]`", "`a.reshape(4, 3)`"], a: 2, why: "정수 리스트 인덱싱은 고급 인덱싱 → 항상 복사 · 나머지 셋은 strides·offset 만 바꾼 뷰" },
                { type: "num", q: "위 `a` (3×4, int32) 에서 `a[::-1].strides[0]` 는 몇 바이트?", answer: -16, tol: 0, unit: "B", why: "행 순서를 뒤집으면 첫 축 stride 가 음수 · offset 은 마지막 행(32 B)에서 시작" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "a = np.arange(6).reshape(2, 3)\nb = a[:, 1:]\nb[0, 0] = 100\nprint(a[0].tolist())" }, answer: ["[0, 100, 2]"], why: "슬라이스는 뷰 · b[0, 0] 은 a[0, 1] 과 같은 칸" },
                { type: "num", q: "`np.zeros((1000, 1000))` 의 `nbytes` 는? (기본 dtype)", answer: 8000000, tol: 0, unit: "B", why: "기본 dtype float64 = 8 B × 10⁶ 원소" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "print(np.array([250], dtype=np.uint8) + np.uint8(10))" }, answer: ["[4]"], why: "260 은 uint8 범위(0–255)를 넘어 260 − 256 = 4 · 배열 연산은 경고 없이 돌아감" },
                { q: "C 순서 3×4 배열 `a` 의 `a.T` 에 대해 맞는 것은?", options: ["C 연속, 새 버퍼", "F 연속, 같은 버퍼", "C 연속, 같은 버퍼", "F 연속, 새 버퍼"], a: 1, why: "전치는 strides 만 (16, 4) → (4, 16) 으로 바꾼 뷰 · 첫 축이 가장 빨리 변하니 F 연속" },
                { type: "order", q: "`b = a.T` (a 는 3×4 int32, C 순서) 일 때 메모리 주소가 작은 것부터", items: ["b[1, 0]", "b[2, 0]", "b[0, 1]", "b[0, 2]"], why: "b[i, j] = a[j, i] → 주소 4·(4j + i): b[1,0]=4, b[2,0]=8, b[0,1]=16, b[0,2]=32" },
                { q: "같은 백만 개 float 의 합을 리스트로 구하면 ndarray 보다 훨씬 느린 주된 이유는?", options: ["리스트 원소는 매번 디스크에서 다시 읽어서", "리스트는 정수만 담을 수 있어서", "원소마다 객체를 따라가 타입 확인", "리스트는 GIL 을 원소마다 두 번 잡아서"], a: 2, why: "리스트는 포인터 배열 · 원소마다 float 객체(24 B)를 찾아 `__mul__` 을 부름 · ndarray 는 같은 타입 숫자를 C 루프가 바로 읽음" },
                { type: "num", q: "shape (3, 4, 5), float32, C 순서 배열의 `strides[0]` 는?", answer: 80, tol: 0, unit: "B", why: "첫 축 한 칸 = 4 × 5 원소 × 4 B = 80 B · 전체 strides (80, 20, 4)" }
            ],
            refs: [
                { title: "Array programming with NumPy", by: "Harris et al.", year: 2020, url: "https://arxiv.org/abs/2006.10256", kind: "paper" },
                { title: "The NumPy array: a structure for efficient numerical computation", by: "van der Walt et al.", year: 2011, url: "https://arxiv.org/abs/1102.1523", kind: "paper" },
                { title: "Copies and views", by: "NumPy Developers", url: "https://numpy.org/doc/stable/user/basics.copies.html", kind: "doc" }
            ]
        },
        {
            id: "np-vectorize",
            title: "벡터화와 브로드캐스팅",
            level: 1,
            mins: 15,
            pre: ["numpy-torch/np-ndarray"],
            checked: "2026-11-19",
            key: [
                "**벡터화(vectorization)**: Python 루프 대신 배열 연산 한 줄 — 루프는 C 가 돈다",
                "**유니버설 함수(ufunc)**: 원소별 연산 · `axis=` 로 그 축을 접어 합·평균·최대",
                "**브로드캐스팅(broadcasting)**: 오른쪽 축부터 맞춰 같거나 1 이면 OK",
                "1 인 축은 stride 0 으로 늘어남 — 입력 복사 없음, 결과 배열만 새로 생김",
                "`(3,)` 와 `(3, 1)` 은 다르다 · 축을 남기려면 `keepdims=True`"
            ],
            concepts: [
                { term: "벡터화", en: "Vectorization", def: "원소 루프를 배열 단위 연산으로 바꿔 컴파일된 코드가 돌게 하는 것" },
                { term: "유니버설 함수", en: "Universal function (ufunc)", def: "`np.add`·`np.exp` 처럼 원소별로 동작하고 브로드캐스팅·`out=`·`reduce` 를 지원하는 함수" },
                { term: "브로드캐스팅", en: "Broadcasting", def: "shape 가 다른 배열끼리 연산할 때 1 인 축을 늘려 맞추는 규칙" },
                { term: "축 줄이기", en: "Reduction along an axis", def: "`x.sum(axis=0)` — 지정한 축이 사라짐 · `(1000, 3)` → `(3,)`" }
            ],
            demo: { type: "sim", name: "broadcast", preset: "row" },
            code: [
                {
                    lang: "python",
                    title: "열마다 표준화 — (1000, 3) − (3,)",
                    src: `import numpy as np

rng = np.random.default_rng(0)
X = rng.normal(5.0, 2.0, size=(1000, 3))   # 샘플 1000개 × 특성 3개 (지어낸 데이터)
mu = X.mean(axis=0)                         # (3,)  [4.797 5.057 4.942]
sd = X.std(axis=0)                          # (3,)  [1.982 1.931 2.042]
Z = (X - mu) / sd                           # (1000, 3) 와 (3,) → 브로드캐스팅
print(np.allclose(Z.mean(axis=0), 0), np.allclose(Z.std(axis=0), 1))   # True True`,
                    note: "`axis=0` 은 '행 방향으로 접기' = 열마다 하나 · 결과 `(3,)` 이 오른쪽에 맞춰져 행마다 재사용됨"
                },
                {
                    lang: "python",
                    title: "행마다 정규화 — keepdims 로 축 남기기",
                    src: `P = np.array([[1., 3.], [2., 2.]])
print(P.sum(axis=1).shape, P.sum(axis=1, keepdims=True).shape)   # (2,) (2, 1)
print(P / P.sum(axis=1, keepdims=True))
# [[0.25 0.75]
#  [0.5  0.5 ]]          행 합이 1
# P / P.sum(axis=1) 은 (2,2)/(2,) → 열 방향으로 나뉘어 틀린 답 (오류도 안 남)`,
                    note: "정사각 배열에서 축을 잃으면 오류 없이 틀림 · softmax·정규화는 늘 `keepdims=True`"
                }
            ],
            optimize: [
                {
                    title: "이중 for 루프 거리 → 브로드캐스팅",
                    before: { lang: "python", src: `for i in range(500):
    for j in range(400):
        D[i, j] = np.sqrt(((A[i] - B[j]) ** 2).sum())   # A (500,64), B (400,64)` },
                    after: { lang: "python", src: `D = np.sqrt(((A[:, None, :] - B[None, :, :]) ** 2).sum(-1))
# (500,1,64) − (1,400,64) → (500,400,64) 임시 배열 97.7 MiB` },
                    gain: "×6.2 (이 PC, 291 ms → 47 ms)",
                    note: "대가는 메모리: 중간 배열이 n × m × d 원소"
                },
                {
                    title: "브로드캐스팅 거리 → 행렬곱으로 전개",
                    before: { lang: "python", src: `D = np.sqrt(((A[:, None, :] - B[None, :, :]) ** 2).sum(-1))` },
                    after: { lang: "python", src: `sq = (A * A).sum(1)[:, None] + (B * B).sum(1)[None, :] - 2 * A @ B.T
D = np.sqrt(np.maximum(sq, 0))     # |a−b|² = |a|² + |b|² − 2a·b` },
                    gain: "×22.6 더 (47 ms → 2.1 ms) · 임시 배열 (500, 400) 뿐",
                    note: "`np.maximum(…, 0)`: 반올림으로 생기는 아주 작은 음수 방지 · 결과는 `np.allclose` 로 같음 확인"
                }
            ],
            glossary: [
                { term: "새 축", en: "New axis (None / np.newaxis)", def: "`x[:, None]` 처럼 크기 1 축을 끼워 넣어 브로드캐스팅 방향을 정함" },
                { term: "임시 배열", en: "Temporary array", def: "식 중간 결과로 생기는 배열 · 큰 브로드캐스팅에서 메모리를 먹는 주범" },
                { term: "쌍별 거리", en: "Pairwise distance", def: "두 점 집합의 모든 쌍 거리 행렬 · 최근접 이웃·군집의 기본" },
                { term: "축 유지", en: "Keep dimensions (keepdims)", def: "줄인 축을 크기 1 로 남겨 원래 배열과 다시 브로드캐스팅되게 함" }
            ],
            quiz: [
                { q: "`(4, 3)` 배열 + `(3,)` 배열의 결과 shape 는?", options: ["(3, 4)", "오류", "(4, 3, 3)", "(4, 3)"], a: 3, why: "오른쪽 정렬: 3 과 3 같음, 4 와 (없음 = 1) → 4 · 행마다 같은 벡터를 더함" },
                { q: "`(4, 3)` + `(4,)` 는?", options: ["(4, 3)", "(4, 4)", "오류", "(3, 4)"], a: 2, why: "오른쪽 끝 3 과 4 가 다르고 둘 다 1 이 아님 → ValueError · 행마다 더하려면 `(4, 1)`" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "print((np.arange(3) + np.arange(3).reshape(3, 1)).shape)" }, answer: ["(3, 3)"], why: "(3,) 은 (1, 3) 으로 보고 (3, 1) 과 만나 둘 다 늘어남 → (3, 3) · 의도치 않은 바깥 합의 전형" },
                { type: "num", q: "`(8, 1, 6, 1)` + `(7, 1, 5)` 결과의 원소 수는?", answer: 1680, tol: 0, why: "결과 shape (8, 7, 6, 5) → 8·7·6·5 = 1680 (NumPy 문서 예)" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "x = np.array([[1, 2], [3, 4]])\nprint(x.sum(axis=0).tolist())" }, answer: ["[4, 6]"], why: "axis=0 을 접음 = 열마다 합: 1+3, 2+4 · axis=1 이면 [3, 7]" },
                { type: "num", q: "이미지 배치 `(32, 3, 224, 224)` float32 에서 채널 평균 `(3, 1, 1)` 을 빼면 결과 배열은 몇 MiB?", answer: 18.375, tol: 0.01, unit: "MiB", why: "32·3·224·224 = 4,816,896 원소 × 4 B = 18.375 MiB · 평균 쪽은 늘어나도 메모리 0" },
                { type: "num", q: "`np.broadcast_to(np.arange(3.0), (1000, 3)).strides[0]` 는?", answer: 0, tol: 0, unit: "B", why: "늘린 축은 stride 0 — 1000 행이 모두 같은 24 B 를 가리킴 · 그래서 쓰기 금지(read-only)" },
                { q: "`P / P.sum(axis=1, keepdims=True)` 에서 `keepdims=True` 가 하는 일은?", options: ["합을 float64 로 바꿔 정밀도를 올림", "합을 (1, 2) 로 남겨 열마다 나눔", "합을 (2, 1) 로 남겨 행마다 나눔", "원본 P 를 제자리에서 바꿈"], a: 2, why: "줄인 축을 1 로 남기면 오른쪽 정렬 시 (2, 2) 와 (2, 1) → 행 방향 · 빼먹으면 (2,) 가 열 방향으로 붙음" },
                { type: "order", q: "두 shape 의 브로드캐스팅 판정 순서", items: ["두 shape 를 오른쪽 끝에 맞춘다", "짧은 쪽 앞을 1 로 채운다", "축마다 같거나 1 인지 본다", "1 인 축을 상대 크기로 늘린다", "결과 shape 를 확정한다"], why: "정렬 → 패딩 → 축별 검사 → 늘리기 · 하나라도 실패하면 ValueError" },
                { q: "softmax 를 `np.exp(x) / np.exp(x).sum()` 대신 `x - x.max()` 부터 하는 이유는?", options: ["계산이 두 배 빨라져서", "정수 배열도 받을 수 있게 하려고", "exp 오버플로(inf) 방지", "결과 합이 1 이 안 돼서"], a: 2, why: "x = [1000, 1001] 이면 exp 가 inf → nan · 같은 값을 빼도 softmax 결과는 그대로" }
            ],
            refs: [
                { title: "Broadcasting", by: "NumPy Developers", url: "https://numpy.org/doc/stable/user/basics.broadcasting.html", kind: "doc" },
                { title: "Universal functions (ufunc)", by: "NumPy Developers", url: "https://numpy.org/doc/stable/reference/ufuncs.html", kind: "doc" },
                { title: "The NumPy array: a structure for efficient numerical computation", by: "van der Walt et al.", year: 2011, url: "https://arxiv.org/abs/1102.1523", kind: "paper" }
            ]
        },
        {
            id: "np-indexing",
            title: "마스크·정렬·einsum·난수",
            level: 2,
            mins: 15,
            pre: ["numpy-torch/np-vectorize"],
            checked: "2026-11-19",
            key: [
                "**불리언 마스크(boolean mask)**: `x[x > 0]` = 조건 맞는 원소만 (복사) · `x[x < 0] = 0` 은 원본에 씀",
                "`np.where(c, a, b)` 로 고르기 · `argmax`·`argsort` 는 값 대신 **위치**",
                "`@` = **행렬곱(matmul)** · 앞쪽 축은 배치로 브로드캐스팅",
                "**einsum**: `'btd,bsd->bts'` 처럼 축 이름으로 곱하고 합칠 축을 적음",
                "난수는 `np.random.default_rng(seed)` 로 만든 **생성기(Generator)** 로"
            ],
            concepts: [
                { term: "불리언 마스크", en: "Boolean mask", def: "원본과 같은 shape 의 True/False 배열 · 인덱스로 쓰면 True 자리만 1-D 로 뽑음" },
                { term: "행렬곱", en: "Matrix multiplication (matmul, @)", def: "`(…, n, k) @ (…, k, m)` → `(…, n, m)` · 앞쪽 축은 브로드캐스팅" },
                { term: "아인슈타인 합", en: "Einstein summation (einsum)", def: "입력 축에 글자를 붙이고, 출력에 없는 글자는 곱한 뒤 합한다는 표기" },
                { term: "난수 생성기", en: "Random number Generator", def: "`default_rng(seed)` 가 돌려주는 객체 · 상태를 들고 다녀 함수끼리 섞이지 않음" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "q", label: "Q", sub: "(B, T, D)", x: 0, y: 0 },
                    { id: "k", label: "K", sub: "(B, S, D)", x: 0, y: 1 },
                    { id: "s", label: "scores", sub: "btd,bsd->bts", x: 1, y: 0 },
                    { id: "m", label: "mask", sub: "where(m, s, -inf)", x: 2, y: 0 },
                    { id: "p", label: "softmax", sub: "axis=-1", x: 3, y: 0 },
                    { id: "v", label: "V", sub: "(B, S, D)", x: 3, y: 1 },
                    { id: "o", label: "out", sub: "P @ V → (B,T,D)", x: 4, y: 0 }
                ],
                edges: [{ from: "q", to: "s" }, { from: "k", to: "s" }, { from: "s", to: "m" }, { from: "m", to: "p" }, { from: "p", to: "o" }, { from: "v", to: "o" }],
                steps: [
                    { on: ["q", "k"], text: "어텐션 한 번을 NumPy 로: 배치 B, 질의 T, 키 S, 차원 D" },
                    { on: ["q", "k", "s", "q>s", "k>s"], text: "**einsum(Einstein summation)** `'btd,bsd->bts'`: d 가 출력에 없으니 곱해서 합침 = `Q @ K.transpose(0, 2, 1)`" },
                    { on: ["s", "m", "s>m"], text: "**불리언 마스크(boolean mask)** 로 미래 위치를 `-inf` 로: `np.where(causal, s, -np.inf)`" },
                    { on: ["m", "p", "m>p"], text: "마지막 축 softmax (`x - x.max(-1, keepdims=True)` 부터) → 행마다 합 1" },
                    { on: ["p", "v", "o", "p>o", "v>o"], text: "**행렬곱(matmul)** `P @ V`: (B,T,S) @ (B,S,D) → (B,T,D) · B 축은 배치로 그대로" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "마스크·where·argsort — 점수 다루기 (지어낸 점수)",
                    src: `import numpy as np

rng = np.random.default_rng(42)
scores = rng.integers(0, 100, size=8)
print(scores)                          # [ 8 77 65 43 43 85  8 69]
print(scores[scores >= 60])            # [77 65 85 69]   (복사)
print(np.where(scores >= 60, "P", "F"))   # ['F' 'P' 'P' 'F' 'F' 'P' 'F' 'P']
top3 = np.argsort(scores)[::-1][:3]    # 큰 값 3개의 '위치'
print(top3, scores[top3])              # [5 1 7] [85 77 69]`,
                    note: "같은 seed 면 어느 PC 에서도 같은 수열 (NumPy 2.5.5 로 실행한 값)"
                },
                {
                    lang: "python",
                    title: "einsum 과 @ 는 같은 계산",
                    src: `B, T, D = 2, 4, 8
Q = rng.standard_normal((B, T, D))
K = rng.standard_normal((B, T, D))
s1 = Q @ K.transpose(0, 2, 1) / np.sqrt(D)
s2 = np.einsum("btd,bsd->bts", Q, K) / np.sqrt(D)
print(s1.shape, np.allclose(s1, s2))   # (2, 4, 4) True`,
                    note: "einsum 문자열은 shape 주석을 겸함 · 축 순서를 바꾸는 `transpose` 를 따로 쓸 필요가 없음"
                }
            ],
            optimize: [
                {
                    title: "상위 k 개: 전체 정렬 → 부분 정렬(partial sort)",
                    before: { lang: "python", src: `idx = np.argsort(v)[-10:]          # 100만 개 전부 정렬 O(n log n)` },
                    after: { lang: "python", src: `idx = np.argpartition(v, -10)[-10:] # 10개만 제자리에 O(n)
idx = idx[np.argsort(v[idx])]        # 필요하면 10개만 정렬` },
                    gain: "×10.2 (이 PC, 27 ms → 2.7 ms)",
                    note: "고른 10개의 집합은 같음(확인함) · 순서가 필요하면 마지막 줄로 10개만 정렬"
                },
                {
                    title: "마스크 대입 → ufunc 의 out=",
                    before: { lang: "python", src: `z[z < 0] = 0                        # 마스크 배열 만들고 흩어 쓰기` },
                    after: { lang: "python", src: `np.maximum(z, 0, out=z)             # 한 번 훑으며 제자리에` },
                    gain: "×3.6 (이 PC, 500만 원소 36.5 ms → 10.1 ms)",
                    note: "ReLU 같은 단순 조건은 ufunc 하나로 · 복잡한 조건이면 `np.where`"
                }
            ],
            glossary: [
                { term: "부분 정렬", en: "Partial sort (argpartition)", def: "k 번째 원소만 제자리에 두고 양쪽을 크기로만 나눔 · 상위 k 개 찾기에 O(n)" },
                { term: "난수 시드", en: "Random seed", def: "생성기의 시작 상태를 정하는 수 · 같으면 같은 수열" },
                { term: "배치 행렬곱", en: "Batched matrix multiplication", def: "앞쪽 축마다 독립 행렬곱 · `(B, n, k) @ (B, k, m)`" },
                { term: "인과 마스크", en: "Causal mask", def: "미래 위치를 `-inf` 로 가려 softmax 가 0 을 주게 하는 삼각 마스크" }
            ],
            quiz: [
                { type: "text", q: "출력은?", code: { lang: "python", src: "x = np.array([3, -1, 4, -1, 5])\nprint(x[x > 0].tolist())" }, answer: ["[3, 4, 5]"], why: "마스크 True 자리만 1-D 로 뽑음" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "print(np.argsort(np.array([30, 10, 20])).tolist())" }, answer: ["[1, 2, 0]"], why: "작은 값의 위치부터: 10 은 1번, 20 은 2번, 30 은 0번" },
                { type: "num", q: "`(2, 3, 4) @ (4, 5)` 결과의 원소 수는?", answer: 30, tol: 0, why: "(4, 5) 는 앞 축이 배치로 브로드캐스팅 → (2, 3, 5) = 30" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "print(np.einsum(\"ij->j\", np.arange(6).reshape(2, 3)).tolist())" }, answer: ["[3, 5, 7]"], why: "출력에 i 가 없으니 i 축으로 합 = 열 합 [0+3, 1+4, 2+5]" },
                { q: "`x = np.array([3, -1, 4]); y = x[x > 0]; y[0] = 100` 뒤 `x` 는?", options: ["[100, -1, 4]", "오류", "[3, -1, 4] 그대로", "[100, 4] 로 줄어듦"], a: 2, why: "마스크 인덱싱 읽기는 복사 · y 를 바꿔도 x 는 그대로" },
                { q: "`x[x < 0] = 0` 은?", options: ["복사본만 바꾸고 x 는 그대로", "x 를 새 배열로 바꿔 끼움", "읽기 전용이라 오류", "x 를 제자리에서 바꿈"], a: 3, why: "왼쪽에 쓴 마스크 인덱싱은 `__setitem__` → 원본에 씀 · 읽기(복사)와 반대" },
                { q: "함수 여러 곳에서 재현 가능한 난수를 쓰는 권장 방식은?", options: ["모듈 첫 줄에서 `np.random.seed(0)` 를 딱 한 번 호출", "`random.seed(0)` 으로 표준 라이브러리 고정", "`rng = np.random.default_rng(0)` 을 넘겨 쓰기", "매 호출 전에 `time.time()` 으로 시드"], a: 2, why: "생성기 객체가 상태를 들고 다녀 다른 라이브러리 호출과 섞이지 않음 · 전역 시드는 어디서든 상태가 바뀜" },
                { type: "order", q: "어텐션 한 번의 계산 순서", items: ["Q·K 점수 (einsum)", "√D 로 나누기", "마스크 위치를 −inf 로", "마지막 축 softmax", "가중치 @ V"], why: "점수 → 스케일 → 마스크 → 확률 → 값의 가중합 · 마스크는 softmax 전에" },
                { q: "100만 개 중 가장 큰 10개의 **위치**를 빨리 얻으려면?", options: ["`np.argsort(x)[-10:]`", "`np.argpartition(x, -10)[-10:]`", "`np.sort(x)[-10:]`", "`sorted(range(len(x)), key=x.__getitem__)[-10:]`"], a: 1, why: "부분 정렬 O(n) · `np.sort` 는 위치가 아니라 값, argsort 는 전체 정렬" },
                { type: "num", q: "B=2, T=S=4, D=8 에서 `einsum('btd,bsd->bts')` 의 곱셈 횟수는?", answer: 256, tol: 0, why: "출력 B·T·S = 32 칸 × 칸마다 D = 8 번 곱 → 256" }
            ],
            refs: [
                { title: "Indexing on ndarrays", by: "NumPy Developers", url: "https://numpy.org/doc/stable/user/basics.indexing.html", kind: "doc" },
                { title: "numpy.einsum", by: "NumPy Developers", url: "https://numpy.org/doc/stable/reference/generated/numpy.einsum.html", kind: "doc" },
                { title: "NEP 19 — Random number generator policy", by: "Kern et al.", year: 2018, url: "https://numpy.org/neps/nep-0019-rng-policy.html", kind: "spec" }
            ]
        },
        {
            id: "torch-tensor",
            title: "PyTorch 텐서 — NumPy 와 같은 점, 다른 점",
            level: 1,
            mins: 14,
            pre: ["numpy-torch/np-vectorize"],
            checked: "2026-11-19",
            key: [
                "**텐서(tensor)** = ndarray 같은 배열 + **장치(device)** + autograd 기록",
                "**기본 dtype(default dtype)**: NumPy `float64` ↔ PyTorch `float32`",
                "`torch.from_numpy`·`.numpy()` 는 **메모리 공유(zero-copy)**, `torch.tensor()` 는 복사",
                "장치가 다른 텐서끼리는 연산 오류 · GPU 텐서는 `.cpu()` 후 `.numpy()`",
                "`add_` 처럼 `_` 로 끝나면 **제자리 연산(in-place)** · `view` 는 연속일 때만"
            ],
            concepts: [
                { term: "텐서", en: "Tensor", def: "다차원 배열 + dtype + device + (필요하면) 기울기 기록 · PyTorch 의 기본 자료형" },
                { term: "장치", en: "Device (cpu / cuda / mps)", def: "텐서 메모리가 있는 곳 · 연산은 같은 장치끼리" },
                { term: "메모리 공유", en: "Zero-copy sharing", def: "복사 없이 같은 버퍼를 두 객체가 봄 · 한쪽을 바꾸면 다른 쪽도 바뀜" },
                { term: "제자리 연산", en: "In-place operation", def: "결과를 새 텐서에 만들지 않고 입력을 덮어씀 · `x.add_(1)`, `x += 1`" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "np", label: "ndarray", sub: "float64 · CPU", x: 0, y: 0 },
                    { id: "t", label: "Tensor", sub: "CPU", x: 1, y: 0 },
                    { id: "g", label: "Tensor", sub: "cuda:0", x: 2, y: 0 },
                    { id: "py", label: "float", sub: "Python 값", x: 2, y: 1 }
                ],
                edges: [
                    { from: "np", to: "t", label: "from_numpy", both: true },
                    { from: "t", to: "g", label: ".to('cuda')", both: true },
                    { from: "g", to: "py", label: ".item()" }
                ],
                steps: [
                    { on: ["np"], text: "디스크·전처리는 대개 NumPy: `float64` 배열" },
                    { on: ["np", "t", "np>t"], text: "`torch.from_numpy(a)` / `t.numpy()`: **메모리 공유(zero-copy)** — dtype 도 float64 그대로" },
                    { on: ["t", "g", "t>g"], text: "`.to('cuda')`·`.cpu()`: 장치 사이 **복사** · 모델 입력은 보통 `.float()` 로 float32 맞추기" },
                    { on: ["g", "py", "g>py"], text: "`.item()`: GPU 값을 Python 으로 → GPU 작업이 끝날 때까지 기다림(동기화)" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "같은 메모리, 다른 메모리 (torch 2.15.0 CPU 로 실행)",
                    src: `import numpy as np, torch

a = np.ones(3)                  # float64
t = torch.from_numpy(a)         # 공유: dtype 도 float64 그대로
c = torch.tensor(a)             # 복사
a[0] = 7
print(t)   # tensor([7., 1., 1.], dtype=torch.float64)
print(c)   # tensor([1., 1., 1.], dtype=torch.float64)
print(torch.ones(3).dtype)      # torch.float32  ← PyTorch 기본`,
                    note: "NumPy 에서 온 float64 를 그대로 모델에 넣으면 float32 가중치와 dtype 불일치 오류 → `.float()`"
                },
                {
                    lang: "python",
                    title: "장치 고르기, 장치에서 바로 만들기",
                    src: `dev = "cuda" if torch.cuda.is_available() else "cpu"
x = torch.randn(1024, 1024, device=dev)   # 처음부터 그 장치에
y = x @ x                                  # 같은 장치끼리 연산
print(y.device, y.mean().item())           # .item(): 값 하나를 Python 으로

z = torch.arange(6).reshape(2, 3).t()      # 전치 = 비연속 뷰
print(z.is_contiguous())                   # False
# z.view(-1) → RuntimeError: view size is not compatible ... Use .reshape(...) instead.
print(z.reshape(-1).tolist())              # [0, 3, 1, 4, 2, 5] (필요하면 복사)`,
                    note: "`view` 는 strides 로 표현될 때만, `reshape` 는 안 되면 복사 · NumPy 의 reshape 와 같은 규칙"
                }
            ],
            optimize: [
                {
                    title: "CPU 에서 만들고 옮기기 → 장치에서 바로 만들기",
                    before: { lang: "python", src: `mask = torch.ones(4096, 4096).to("cuda")   # CPU 에 만들고 64 MiB 복사` },
                    after: { lang: "python", src: `mask = torch.ones(4096, 4096, device="cuda")  # GPU 에서 바로` },
                    gain: "호스트→장치 복사 1회(64 MiB) 제거",
                    note: "`torch.zeros_like(x)` 처럼 기존 텐서를 따라 만들면 장치·dtype 이 자동으로 맞음"
                },
                {
                    title: "루프마다 .item() → 텐서로 모아 끝에 한 번",
                    before: { lang: "python", src: `total = 0.0
for xb, yb in loader:
    total += loss_fn(model(xb), yb).item()   # 배치마다 GPU 대기` },
                    after: { lang: "python", src: `total = torch.zeros((), device=dev)
for xb, yb in loader:
    total += loss_fn(model(xb), yb).detach()
print(total.item())                          # 끝에 한 번만 대기` },
                    gain: "동기화 배치 수 N번 → 1번",
                    note: "GPU 가 다음 배치를 미리 받아 둘 수 있게 됨 · CPU 에서는 차이 없음"
                }
            ],
            glossary: [
                { term: "기본 dtype", en: "Default dtype", def: "dtype 을 안 적었을 때 쓰는 형 · PyTorch 부동소수는 float32, NumPy 는 float64" },
                { term: "형 승격", en: "Type promotion", def: "dtype 이 다른 피연산자를 계산할 때 결과 dtype 을 정하는 규칙 · `int + 0.5` → 기본 float" },
                { term: "호스트-장치 복사", en: "Host-to-device copy", def: "CPU 메모리 → GPU 메모리 전송 · PCIe 를 지나가 느림" },
                { term: "스토리지", en: "Tensor storage", def: "텐서가 실제로 가리키는 1-D 메모리 · 뷰들은 같은 스토리지를 공유" },
                { term: "DLPack", en: "DLPack (tensor exchange protocol)", def: "프레임워크 사이에 복사 없이 텐서를 넘기는 공통 형식 · `torch.from_dlpack`" }
            ],
            quiz: [
                { type: "text", q: "출력은?", code: { lang: "python", src: "print(torch.ones(2).dtype)" }, answer: ["torch.float32"], why: "PyTorch 기본 부동소수 dtype 은 float32" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "print(torch.from_numpy(np.ones(2)).dtype)" }, answer: ["torch.float64"], why: "from_numpy 는 버퍼를 공유하니 dtype 도 NumPy 의 float64 그대로" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "a = np.ones(3)\nt = torch.from_numpy(a)\na[0] = 7\nprint(t[0].item())" }, answer: ["7.0"], why: "같은 메모리 · NumPy 쪽에서 바꾼 값이 텐서에도 보임" },
                { q: "`torch.tensor(a)` 와 `torch.from_numpy(a)` 의 차이는?", options: ["앞은 공유, 뒤는 복사", "앞은 복사, 뒤는 메모리 공유", "둘 다 복사, 앞만 float32 로", "둘 다 공유, 뒤만 GPU 로"], a: 1, why: "`torch.tensor` 는 항상 데이터를 복사 · `from_numpy` 는 같은 버퍼를 감싸고 크기 변경 불가" },
                { q: "GPU 텐서 `g` 에 `g.numpy()` 를 부르면?", options: ["자동으로 CPU 로 복사", "GPU 메모리를 공유하는 배열", "오류 — 먼저 `.cpu()`", "빈 배열을 돌려줌"], a: 2, why: "NumPy 는 CPU 메모리만 다룸 · `g.cpu().numpy()` (autograd 중이면 `.detach()` 도)" },
                { type: "num", q: "float32 텐서 `(1024, 1024)` 는 몇 바이트?", answer: 4194304, tol: 0, unit: "B", why: "1024 × 1024 × 4 B = 4 MiB = 4,194,304 B" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "x = torch.arange(6).reshape(2, 3)\nprint(x.t().is_contiguous())" }, answer: ["False"], why: "전치는 strides 만 바꾼 뷰 · 그래서 `view(-1)` 은 오류, `reshape(-1)` 은 복사" },
                { q: "`y = x.add_(1)` 뒤 맞는 것은?", options: ["y 는 새 텐서, x 는 그대로", "y 는 None, x 가 바뀜", "y 는 x 의 복사본이고 둘 다 바뀜", "y 는 x 와 같은 객체, x 가 바뀜"], a: 3, why: "제자리 연산은 자기 자신을 돌려줌 (`y is x` → True) · `x + 1` 은 새 텐서" },
                { type: "order", q: "데이터 한 배치가 GPU 연산까지 가는 순서", items: ["디스크에서 NumPy 배열로 읽기", "torch.from_numpy 로 텐서 (공유)", "pin_memory 로 고정 메모리에 복사", ".to('cuda', non_blocking=True)", "GPU 에서 모델 연산"], why: "공유로 감싸고 → 고정 메모리 → 비동기 전송 → 연산 · DataLoader(pin_memory=True) 가 셋째를 해 줌" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "print((torch.tensor([1, 2]) + 0.5).dtype)" }, answer: ["torch.float32"], why: "정수 텐서 + Python float → 기본 부동소수 dtype(float32) 으로 승격" }
            ],
            refs: [
                { title: "PyTorch: An Imperative Style, High-Performance Deep Learning Library", by: "Paszke et al.", year: 2019, url: "https://arxiv.org/abs/1912.01703", kind: "paper" },
                { title: "Tensor Views", by: "PyTorch Foundation", url: "https://docs.pytorch.org/docs/stable/tensor_view.html", kind: "doc" },
                { title: "torch.from_numpy", by: "PyTorch Foundation", url: "https://docs.pytorch.org/docs/stable/generated/torch.from_numpy.html", kind: "doc" }
            ]
        },
        {
            id: "autograd",
            title: "autograd — 기록하고 거꾸로 미분하기",
            level: 2,
            mins: 16,
            pre: ["numpy-torch/torch-tensor", "deep-learning/backprop"],
            checked: "2026-11-19",
            key: [
                "`requires_grad=True` **잎 텐서(leaf tensor)** 에서 시작한 연산은 `grad_fn` 으로 기록",
                "`L.backward()`: 그래프를 거꾸로 — 위에서 온 기울기 × 지역 미분 (연쇄 법칙)",
                "`.grad` 는 **기울기 누적(gradient accumulation)** — step 마다 `zero_grad()`",
                "그래프는 forward 마다 새로 — **동적 그래프(define-by-run)**: `if`·`for` 가 곧 구조",
                "평가·추론은 `torch.no_grad()` · 저장할 활성값이 없어 메모리가 준다"
            ],
            concepts: [
                { term: "잎 텐서", en: "Leaf tensor", def: "사용자가 직접 만든 텐서 (보통 파라미터) · backward 후 `.grad` 가 채워지는 곳" },
                { term: "grad_fn", en: "Backward function node", def: "텐서를 만든 연산의 역방향 함수 (`MulBackward0` 등) · 그래프의 노드" },
                { term: "역방향 모드 자동 미분", en: "Reverse-mode automatic differentiation", def: "출력 하나에서 모든 입력의 기울기를 한 번의 역방향 순회로 구함 · 역전파의 일반형" },
                { term: "기울기 누적", en: "Gradient accumulation", def: "backward 가 `.grad` 에 더하는 동작 · 여러 미니배치 기울기를 모으는 데도 씀" },
                { term: "동적 그래프", en: "Define-by-run (dynamic graph)", def: "실행하면서 그래프를 만들고 매 반복마다 새로 만듦" }
            ],
            demo: { type: "sim", name: "autograd", x: 2, w: 0.5, b: 0.1, t: 1, act: "tanh", lr: 0.1 },
            code: [
                {
                    lang: "python",
                    title: "뉴런 하나의 기울기 — 실습 화면과 같은 값",
                    src: `import torch

x = torch.tensor(2.0)                        # 입력: 기울기 필요 없음
w = torch.tensor(0.5, requires_grad=True)    # 잎 텐서 (파라미터)
b = torch.tensor(0.1, requires_grad=True)
L = (torch.tanh(w * x + b) - 1.0) ** 2       # forward: 그래프 기록
print(w.grad, L.grad_fn.name())              # None PowBackward0
L.backward()                                 # backward: 거꾸로 연쇄 법칙
print(L.item(), w.grad.item(), b.grad.item())
# 0.0398006... -0.2866440... -0.1433220...`,
                    note: "손계산: ∂L/∂z = 2(y − 1)·(1 − y²) = −0.14332 · w.grad = ∂L/∂z × x = −0.28664 · b.grad = ∂L/∂z"
                },
                {
                    lang: "python",
                    title: "누적, no_grad, detach",
                    src: `w = torch.tensor(0.5, requires_grad=True)
for _ in range(2):                           # zero_grad 없이 두 번
    L = (torch.tanh(w * 2 + 0.1) - 1) ** 2
    L.backward()
print(w.grad)                                # tensor(-0.5733)  ← 두 배

with torch.no_grad():
    y = w * 2
print(y.requires_grad, y.grad_fn)            # False None
z = (w * 2).detach()                         # 값만 떼어 냄 (그래프 밖)`,
                    note: "`optimizer.zero_grad()` 는 기본으로 `.grad` 를 None 으로 만듦(set_to_none=True) · 0 텐서보다 메모리·연산이 덜 듦"
                }
            ],
            optimize: [
                {
                    title: "평가 루프에서 그래프 기록 → no_grad",
                    before: { lang: "python", src: `model.eval()
preds = model(x_val)          # 기록됨: backward 용 활성값 저장` },
                    after: { lang: "python", src: `model.eval()
with torch.no_grad():         # 또는 torch.inference_mode()
    preds = model(x_val)` },
                    gain: "저장 텐서 7.0 MiB → 0 (Linear 512×4 + ReLU, 배치 256, 이 PC)",
                    note: "`saved_tensors_hooks` 로 저장 바이트를 세어 측정 · CPU 시간 차이는 1% 안팎으로 작았음"
                },
                {
                    title: "큰 배치가 안 들어갈 때: 기울기 누적",
                    before: { lang: "python", src: `for xb, yb in loader_256:              # 메모리 부족
    opt.zero_grad(); loss_fn(model(xb), yb).backward(); opt.step()` },
                    after: { lang: "python", src: `k = 4
for i, (xb, yb) in enumerate(loader_64):
    (loss_fn(model(xb), yb) / k).backward()    # .grad 에 4번 더해짐
    if (i + 1) % k == 0:
        opt.step(); opt.zero_grad()` },
                    gain: "활성값 메모리 1/4 로 배치 256 효과",
                    note: "`/ k` 로 평균을 맞춤 · 배치 정규화(BatchNorm)는 여전히 64 기준 통계"
                }
            ],
            glossary: [
                { term: "기울기 검사", en: "Gradient check (gradcheck)", def: "작은 차분으로 구한 수치 미분과 autograd 결과를 비교해 구현을 검증" },
                { term: "그래프 떼기", en: "Detach", def: "같은 값을 가지되 기록 밖에 있는 텐서를 만듦 · 목표값 고정, 로그용" },
                { term: "버전 카운터", en: "Version counter", def: "제자리 수정마다 올라가는 숫자 · backward 에 필요한 값이 바뀌었으면 오류로 알림" },
                { term: "추론 모드", en: "Inference mode", def: "`torch.inference_mode()` · no_grad 보다 강해 버전 추적도 끔, 결과를 학습에 다시 못 씀" },
                { term: "벡터-야코비안 곱", en: "Vector-Jacobian product (VJP)", def: "역방향 한 단계의 실제 계산: 위에서 온 기울기 벡터 × 지역 야코비안" }
            ],
            quiz: [
                { type: "num", q: "x=2, w=0.5, b=0.1, t=1, L=(tanh(wx+b) − t)² 에서 `w.grad` 는? (소수 넷째 자리)", answer: -0.2866, tol: 0.0005, why: "∂L/∂z = 2(y−1)(1−y²) = −0.14332, × x = 2 → −0.28664 · 실습 화면·torch 결과와 같음" },
                { type: "num", q: "같은 식에서 `zero_grad` 없이 backward 를 두 번 하면 `w.grad` 는?", answer: -0.5733, tol: 0.0005, why: "backward 는 `.grad` 에 더함 → −0.2866 × 2" },
                { type: "text", q: "backward 전 출력은?", code: { lang: "python", src: "w = torch.tensor(0.5, requires_grad=True)\nL = (w * 2) ** 2\nprint(w.grad)" }, answer: ["None"], why: "`.grad` 는 처음 backward 가 돌 때 생김 · 그 전엔 None" },
                { q: "학습 루프에서 매 step `optimizer.zero_grad()` 를 부르는 이유는?", options: ["가중치를 0 으로 초기화하려고", "이전 step 의 기울기가 더해지지 않게", "학습률을 다시 계산하려고", "backward 그래프를 지워 메모리를 확보하려고"], a: 1, why: "backward 는 누적이 기본 · 그래프는 backward 가 끝나면 이미 풀림" },
                { q: "중간 텐서 `m = u * 3` 의 `m.grad` 를 backward 뒤에 읽으면?", options: ["∂L/∂m 값이 그대로 들어 있음", "항상 0 텐서", "오류로 학습이 중단됨", "None + 경고 (잎이 아님)"], a: 3, why: "잎이 아닌 텐서는 기울기를 보관하지 않음 · 필요하면 forward 때 `m.retain_grad()`" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "w = torch.tensor(0.5, requires_grad=True)\nwith torch.no_grad():\n    y = w * 2\nprint(y.requires_grad)" }, answer: ["False"], why: "no_grad 안의 연산은 기록되지 않음 · y.grad_fn 도 None" },
                { type: "order", q: "학습 한 step 의 순서", items: ["optimizer.zero_grad()", "pred = model(x) (forward, 그래프 기록)", "loss = loss_fn(pred, y)", "loss.backward()", "optimizer.step()"], why: "기울기 비우기 → 기록하며 계산 → 손실 → 거꾸로 기울기 → 갱신 · zero_grad 는 backward 전 어디든 되지만 맨 앞이 관례" },
                { q: "ReLU 앞의 z 가 음수인 샘플에서 w 의 기울기는?", options: ["z 의 절댓값만큼", "1 — ReLU 는 항상 통과", "0 — ReLU 미분이 0", "음수면 부호만 바뀜"], a: 2, why: "z ≤ 0 이면 ReLU 출력이 상수 0 → 지역 미분 0 이 뒤로 곱해짐 · 실습에서 ReLU 로 바꿔 확인" },
                { type: "num", q: "`x = torch.tensor(2., requires_grad=True); (x**3).backward()` 뒤 `x.grad` 는?", answer: 12, tol: 0, why: "d(x³)/dx = 3x² = 12" },
                { q: "`y = x.sigmoid(); y.mul_(2); y.sum().backward()` 는?", options: ["정상 동작, 기울기가 2배로 커짐", "경고만 나고 기울기는 0 으로 채워짐", "RuntimeError — 저장값 수정됨", "정상 동작, 기울기는 그대로"], a: 2, why: "sigmoid 의 역방향은 출력 y 를 저장해 씀 · mul_ 로 버전 카운터가 올라가 오류" }
            ],
            refs: [
                { title: "Autograd mechanics", by: "PyTorch Foundation", url: "https://docs.pytorch.org/docs/stable/notes/autograd.html", kind: "doc" },
                { title: "Automatic differentiation in machine learning: a survey", by: "Baydin et al.", year: 2018, url: "https://arxiv.org/abs/1502.05767", kind: "paper" },
                { title: "PyTorch: An Imperative Style, High-Performance Deep Learning Library", by: "Paszke et al.", year: 2019, url: "https://arxiv.org/abs/1912.01703", kind: "paper" }
            ]
        },
        {
            id: "torch-train",
            title: "nn.Module 과 학습 루프",
            level: 2,
            mins: 18,
            pre: ["numpy-torch/autograd", "deep-learning/optimizer"],
            checked: "2026-11-19",
            key: [
                "**nn.Module**: `__init__` 에 층, `forward` 에 계산 — **파라미터(parameter)** 는 자동 등록",
                "한 step = `zero_grad` → forward → 손실 → `backward` → `step`",
                "**DataLoader**: 샘플 하나(`Dataset[i]`)만 정의 → 배치·셔플·병렬 로딩",
                "`model.train()`/`model.eval()`: 드롭아웃·배치 정규화 전환 (기울기 기록과 별개)",
                "저장은 **상태 사전(state_dict)** · 불러올 땐 `weights_only=True` 기본"
            ],
            concepts: [
                { term: "모듈", en: "Module (nn.Module)", def: "파라미터와 하위 모듈을 담는 클래스 · `model(x)` 가 `forward` 를 부름" },
                { term: "파라미터", en: "Parameter (nn.Parameter)", def: "모듈 속성으로 두면 `model.parameters()` 에 자동으로 잡히는 학습 대상 텐서" },
                { term: "손실 함수", en: "Loss function", def: "예측과 정답의 차이를 스칼라로 · 분류는 `CrossEntropyLoss` (logit 을 받음)" },
                { term: "데이터 로더", en: "DataLoader", def: "Dataset 에서 배치를 꺼내 주는 반복자 · `batch_size`·`shuffle`·`num_workers`" },
                { term: "상태 사전", en: "State dict", def: "이름 → 텐서 사전 (`net.0.weight` …) · 저장·불러오기의 단위" }
            ],
            demo: {
                type: "seq",
                actors: ["DataLoader", "model", "loss_fn", "optimizer"],
                msgs: [
                    { from: 0, to: 1, label: "xb, yb (64개)", text: "셔플된 인덱스로 `Dataset[i]` 64번 → collate 가 앞에 배치 축을 붙여 쌓음" },
                    { from: 3, to: 3, label: "zero_grad()", text: "지난 step 의 `.grad` 를 None 으로" },
                    { from: 1, to: 2, label: "logits (64, 2)", text: "forward: `nn.Linear` → ReLU → `nn.Linear` · 연산마다 grad_fn 기록" },
                    { from: 2, to: 2, label: "loss = CE(logits, yb)", text: "**손실 함수(loss function)** 는 softmax 를 안에서 함 → 모델은 logit 을 그대로" },
                    { from: 2, to: 1, label: "loss.backward()", text: "그래프를 거꾸로 → 각 **파라미터(parameter)** 의 `.grad` 채움" },
                    { from: 1, to: 3, label: "p.grad", text: "옵티마이저는 생성 때 받은 `model.parameters()` 를 들고 있음" },
                    { from: 3, to: 3, label: "step()", text: "Adam: 모멘트 갱신 후 `p -= lr · m̂ / (√v̂ + ε)`" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "원 안/밖 분류 — 데이터부터 평가까지 (지어낸 데이터, CPU 0.35 초)",
                    src: `import torch
from torch import nn
from torch.utils.data import TensorDataset, DataLoader

torch.manual_seed(0)
X = torch.rand(2000, 2) * 4 - 2                 # [-2, 2)² 의 점
y = (X.pow(2).sum(1) < 1.5).long()              # 원 안 = 1 (31%)
perm = torch.randperm(2000)
tr, te = perm[:1600], perm[1600:]
dl = DataLoader(TensorDataset(X[tr], y[tr]), batch_size=64, shuffle=True)

class MLP(nn.Module):
    def __init__(self, h=32):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(2, h), nn.ReLU(), nn.Linear(h, 2))
    def forward(self, x):
        return self.net(x)                      # logits

model = MLP()
opt = torch.optim.Adam(model.parameters(), lr=1e-2)
loss_fn = nn.CrossEntropyLoss()
for epoch in range(20):
    model.train()
    for xb, yb in dl:
        opt.zero_grad()
        loss = loss_fn(model(xb), yb)
        loss.backward()
        opt.step()
    if epoch in (0, 9, 19):
        model.eval()
        with torch.no_grad():
            acc = (model(X[te]).argmax(1) == y[te]).float().mean().item()
        print(f"epoch {epoch + 1:2d}  loss {loss.item():.3f}  test acc {acc:.3f}")
# epoch  1  loss 0.395  test acc 0.817
# epoch 10  loss 0.079  test acc 0.993
# epoch 20  loss 0.021  test acc 0.985`,
                    note: "torch 2.15.0 CPU 로 실행한 출력 · 전부 0 으로 찍어도 69% 이므로 정확도는 그 기준과 비교"
                },
                {
                    lang: "python",
                    title: "저장하고 불러오기",
                    src: `torch.save(model.state_dict(), "mlp.pt")
print(list(model.state_dict().keys()))
# ['net.0.weight', 'net.0.bias', 'net.2.weight', 'net.2.bias']
m2 = MLP()
m2.load_state_dict(torch.load("mlp.pt", weights_only=True))
m2.eval()`,
                    note: "모델 객체 통째(pickle) 대신 state_dict · 임의 객체가 든 파일은 `weights_only` 로 불러오면 거부됨(실행해 확인)"
                }
            ],
            optimize: [
                {
                    title: "샘플 하나씩 학습 → 미니배치 64",
                    before: { lang: "python", src: `dl = DataLoader(train_ds, batch_size=1, shuffle=True)   # step 1600번/epoch` },
                    after: { lang: "python", src: `dl = DataLoader(train_ds, batch_size=64, shuffle=True)  # step 25번/epoch` },
                    gain: "epoch 시간 ×29 (이 PC, 420 ms → 14 ms)",
                    note: "Python·디스패치 오버헤드는 step 마다 · 배치가 크면 학습률도 같이 조정"
                },
                {
                    title: "평가에 eval() 빠뜨림 → eval + no_grad",
                    before: { lang: "python", src: `preds = model(x_val)            # 드롭아웃이 켜진 채, 그래프도 기록` },
                    after: { lang: "python", src: `model.eval()
with torch.no_grad():
    preds = model(x_val)
model.train()                   # 학습 재개 전 되돌리기` },
                    gain: "결과 고정(드롭아웃 끔) + 활성값 저장 0",
                    note: "`eval()` 은 기록을 끄지 않고 `no_grad` 는 드롭아웃을 끄지 않음 → 둘 다 필요"
                }
            ],
            glossary: [
                { term: "에폭", en: "Epoch", def: "학습 데이터 전체를 한 번 도는 단위 · 배치 수 = ⌈샘플 수 / 배치 크기⌉" },
                { term: "학습 모드 플래그", en: "Training mode flag (module.training)", def: "`train()`·`eval()` 이 바꾸는 불리언 · 드롭아웃·배치 정규화가 이 값을 보고 동작을 바꿈" },
                { term: "옵티마이저 상태", en: "Optimizer state", def: "Adam 의 1·2차 모멘트처럼 파라미터마다 붙는 버퍼 · Adam 은 파라미터의 2배 메모리" },
                { term: "체크포인트", en: "Checkpoint", def: "모델·옵티마이저 state_dict 와 epoch 등을 묶어 저장한 파일 · 이어서 학습할 때" },
                { term: "콜레이트 함수", en: "Collate function (collate_fn)", def: "샘플 목록을 배치 텐서로 묶는 함수 · 기본은 앞에 배치 축을 붙여 쌓기" }
            ],
            quiz: [
                { type: "num", q: "`nn.Sequential(nn.Linear(2, 32), nn.ReLU(), nn.Linear(32, 2))` 의 파라미터 수는?", answer: 162, tol: 0, why: "2·32 + 32 = 96, 32·2 + 2 = 66 → 162 · ReLU 는 파라미터 없음" },
                { type: "num", q: "샘플 1000개, `batch_size=64`, `drop_last=False` 면 한 epoch 의 배치 수는?", answer: 16, tol: 0, why: "⌈1000/64⌉ = 16 (마지막 배치 40개) · drop_last=True 면 15" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "print(nn.Linear(3, 4).weight.shape)" }, answer: ["torch.Size([4, 3])"], why: "가중치는 (출력, 입력) · forward 는 x @ W.T + b" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "m = nn.Sequential(nn.Linear(2, 3), nn.ReLU(), nn.Linear(3, 1))\nprint(len(list(m.parameters())))" }, answer: ["4"], why: "Linear 마다 weight·bias 2개 × 2층 = 4 텐서" },
                { q: "`CrossEntropyLoss` 에 넣을 모델 출력은?", options: ["softmax 를 거친 확률", "argmax 한 클래스 번호", "softmax 전의 logit", "log 를 취한 확률"], a: 2, why: "손실 안에서 log_softmax 를 함 · 확률을 넣으면 softmax 가 두 번 걸림" },
                { q: "`model.eval()` 이 하는 일은?", options: ["기울기 기록 끄기", "드롭아웃·배치 정규화 동작 전환", "파라미터를 읽기 전용으로 바꾸기", "GPU 캐시 메모리 비우기"], a: 1, why: "모듈의 `training` 플래그만 바꿈 · 기록 끄기는 `torch.no_grad()`" },
                { q: "검증용 DataLoader 의 `shuffle` 은?", options: ["True — 과적합을 막으려고", "True — 배치 정규화 때문에 꼭 필요", "False — 순서가 결과에 영향 없음", "상관없이 항상 True 가 기본"], a: 2, why: "셔플은 학습 때 기울기 편향을 줄이려는 것 · 평가는 순서 무관, 고정하면 디버깅이 쉬움 (기본값 False)" },
                { type: "order", q: "epoch 한 번의 순서", items: ["model.train()", "학습 배치마다 zero_grad·forward·backward·step", "model.eval()", "torch.no_grad() 로 검증 손실·정확도", "가장 좋으면 state_dict 저장"], why: "학습 모드로 돌고, 평가 모드 + 기록 끄고 검증, 좋으면 체크포인트" },
                { q: "다른 사람이 준 `.pt` 를 `torch.load` 할 때 기본 동작은?", options: ["모든 pickle 객체 그대로 실행", "텐서·기본 자료형만 허용", "safetensors 로만 변환해 읽음", "항상 GPU 로 올려서 읽음"], a: 1, why: "2.6 부터 weights_only 가 기본 — 임의 객체가 있으면 UnpicklingError · 믿는 파일만 끄기" },
                { q: "`opt = torch.optim.Adam(model.parameters())` 를 만든 **뒤에** `model.head = nn.Linear(8, 2)` 를 새로 붙이면?", options: ["새 층도 자동으로 학습됨", "생성 시점 오류", "새 층은 학습되지 않음", "기존 층이 학습을 멈춤"], a: 2, why: "옵티마이저는 만들 때 받은 파라미터 목록만 갱신 · 층을 다 만든 뒤 옵티마이저를 생성" }
            ],
            refs: [
                { title: "torch.utils.data", by: "PyTorch Foundation", url: "https://docs.pytorch.org/docs/stable/data.html", kind: "doc" },
                { title: "Module — torch.nn", by: "PyTorch Foundation", url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.Module.html", kind: "doc" },
                { title: "Reproducibility", by: "PyTorch Foundation", url: "https://docs.pytorch.org/docs/stable/notes/randomness.html", kind: "doc" }
            ]
        },
        {
            id: "torch-gpu",
            title: "GPU·정밀도·컴파일 — 빠르게 돌리기",
            level: 3,
            mins: 18,
            pre: ["numpy-torch/torch-train", "languages/float"],
            checked: "2026-11-19",
            key: [
                "GPU 연산은 **비동기 실행(asynchronous execution)** — 시간 재기 전 `synchronize()`",
                "느린 곳 셋: 장치 간 복사, 작은 커널 여러 번(실행 오버헤드), 메모리",
                "**혼합 정밀도(mixed precision)**: `autocast` 로 matmul 은 bf16/fp16, 민감한 연산은 fp32",
                "fp16 은 **손실 스케일링(loss scaling)** 으로 언더플로 방지 · bf16 은 지수 범위가 fp32 와 같음",
                "`torch.compile`: 그래프를 잡아 **커널 융합(kernel fusion)** · 첫 호출은 컴파일 시간"
            ],
            concepts: [
                { term: "비동기 실행", en: "Asynchronous execution", def: "Python 은 커널을 큐에 넣고 바로 돌아옴 · 결과가 필요한 곳(`.item()`, 출력, CPU 복사)에서 기다림" },
                { term: "혼합 정밀도", en: "Mixed precision", def: "연산마다 dtype 을 골라 matmul·conv 는 16비트, 합·softmax·손실은 32비트로" },
                { term: "손실 스케일링", en: "Loss scaling (GradScaler)", def: "손실에 큰 수를 곱해 fp16 기울기가 0 으로 사라지지 않게 하고, step 전에 다시 나눔" },
                { term: "커널 융합", en: "Kernel fusion", def: "여러 원소별 연산을 커널 하나로 합쳐 메모리 왕복·실행 횟수를 줄임" },
                { term: "고정 메모리", en: "Pinned (page-locked) memory", def: "OS 가 옮기지 않는 CPU 메모리 · GPU 로 비동기 복사(`non_blocking=True`)가 가능" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "py", label: "Python", sub: "for step in …", x: 0, y: 0 },
                    { id: "d", label: "디스패처", sub: "device·dtype→커널", x: 1, y: 0 },
                    { id: "q", label: "CUDA 스트림", sub: "커널 대기열", x: 2, y: 0 },
                    { id: "g", label: "GPU", sub: "커널 실행", x: 3, y: 0 },
                    { id: "s", label: ".item()", sub: "동기화 지점", x: 1, y: 1 },
                    { id: "c", label: "compile", sub: "융합된 커널 1개", x: 2, y: 1 }
                ],
                edges: [{ from: "py", to: "d" }, { from: "d", to: "q" }, { from: "q", to: "g" }, { from: "g", to: "s", arc: "down" }, { from: "py", to: "s" }, { from: "c", to: "q" }],
                steps: [
                    { on: ["py", "d", "py>d"], text: "`y = x @ w` 한 줄 → 디스패처가 장치·dtype 에 맞는 커널을 고름 (CPU 쪽 비용 수 µs)" },
                    { on: ["d", "q", "d>q"], text: "**비동기 실행(asynchronous execution)**: 커널을 스트림 큐에 넣고 Python 은 바로 다음 줄로" },
                    { on: ["q", "g", "q>g"], text: "GPU 는 큐 순서대로 실행 · 그동안 CPU 는 다음 배치를 준비할 수 있음" },
                    { on: ["py", "s", "g", "py>s", "g>s"], text: "`.item()`·`print(t)`·`.cpu()` 는 결과가 필요 → 큐가 빌 때까지 대기 · 시간 재기 전후 `torch.cuda.synchronize()`" },
                    { on: ["c", "q", "c>q"], text: "작은 원소별 연산 셋 = 커널 셋 · `torch.compile` 은 **커널 융합(kernel fusion)** 으로 하나로 → 실행 오버헤드·메모리 왕복↓" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "시간 제대로 재기 + autocast",
                    src: `import time, torch

dev = "cuda" if torch.cuda.is_available() else "cpu"
sync = torch.cuda.synchronize if dev == "cuda" else (lambda: None)
x = torch.randn(4096, 4096, device=dev)

sync(); t0 = time.perf_counter()
for _ in range(10):
    y = x @ x
sync()                                   # 빼면 '큐에 넣은 시간'만 잼
print((time.perf_counter() - t0) / 10, "s / matmul")

with torch.autocast(dev, dtype=torch.bfloat16):
    z = x @ x                            # autocast: matmul → bf16
print(z.dtype)                           # torch.bfloat16 (CPU 에서도 확인)`,
                    note: "첫 반복은 준비(warm-up) 비용이 섞이니 한두 번 버리고 재기 · CUDA 이벤트(`torch.cuda.Event`)도 됨"
                },
                {
                    lang: "python",
                    title: "fp16 학습 루프: autocast + GradScaler",
                    src: `scaler = torch.amp.GradScaler("cuda")
for xb, yb in dl:
    xb, yb = xb.to("cuda", non_blocking=True), yb.to("cuda", non_blocking=True)
    opt.zero_grad()
    with torch.autocast("cuda", dtype=torch.float16):
        loss = loss_fn(model(xb), yb)    # forward 만 autocast 안에
    scaler.scale(loss).backward()        # 손실 × S 로 backward
    scaler.step(opt)                     # 기울기 ÷ S, inf/NaN 이면 이 step 건너뜀
    scaler.update()                      # S 조정`,
                    note: "bf16 은 지수 8비트(fp32 와 같음)라 보통 GradScaler 없이 autocast 만 · 가중치 원본은 fp32 로 유지"
                }
            ],
            optimize: [
                {
                    title: "fp32 학습 → bf16 autocast",
                    before: { lang: "python", src: `loss = loss_fn(model(xb), yb)              # 모든 matmul fp32` },
                    after: { lang: "python", src: `with torch.autocast("cuda", dtype=torch.bfloat16):
    loss = loss_fn(model(xb), yb)          # matmul·conv 는 bf16 (Tensor Core)` },
                    gain: "matmul 이 Tensor Core 로 · 활성값 메모리 약 절반 (속도는 GPU·모델마다 측정)",
                    note: "이 트랙의 수치는 CPU 로 검증 · GPU 속도 수치는 직접 재 볼 것"
                },
                {
                    title: "작은 원소별 연산 여러 개 → torch.compile",
                    before: { lang: "python", src: `def gelu_bias(x, b):
    return 0.5 * (x + b) * (1 + torch.tanh(0.79788456 * ((x + b) + 0.044715 * (x + b) ** 3)))
# 원소별 연산마다 커널 하나 + 중간 텐서` },
                    after: { lang: "python", src: `gelu_bias = torch.compile(gelu_bias)   # Inductor 가 커널 하나로 융합
y = gelu_bias(x, b)                    # 첫 호출: 컴파일 (수 초), 이후: 빠름` },
                    gain: "커널 여러 개 → 1개, 중간 텐서 메모리 왕복 제거",
                    note: "Windows CPU 는 C++ 컴파일러 필요 · 모양(shape)이 자주 바뀌면 재컴파일 → `dynamic=True` 검토"
                }
            ],
            glossary: [
                { term: "텐서 코어", en: "Tensor Core", def: "16비트·8비트 행렬곱 전용 GPU 유닛 · fp32 matmul 보다 처리량이 훨씬 큼" },
                { term: "동기화 지점", en: "Synchronization point", def: "CPU 가 GPU 작업 완료를 기다리는 곳 · `.item()`, `.cpu()`, `print`, `synchronize()`" },
                { term: "캐싱 할당자", en: "Caching memory allocator", def: "해제한 GPU 메모리를 바로 돌려주지 않고 재사용 · nvidia-smi 에는 계속 '사용 중'으로 보임" },
                { term: "그래프 끊김", en: "Graph break", def: "torch.compile 이 추적 못 하는 Python 코드에서 그래프를 나눔 · 너무 많으면 이득이 줄어듦" },
                { term: "준비 실행", en: "Warm-up run", def: "측정 전 한두 번 돌려 컴파일·캐시·클럭을 안정시키는 실행" }
            ],
            quiz: [
                { type: "num", q: "fp16 으로 표현되는 가장 큰 유한 값은?", answer: 65504, tol: 0, why: "지수 5비트 → 최대 (2 − 2⁻¹⁰)·2¹⁵ = 65504 · 70000 을 넣으면 inf (torch 로 확인)" },
                { type: "num", q: "bf16 의 지수(exponent) 비트 수는?", answer: 8, tol: 0, why: "bf16 = 부호 1 + 지수 8 + 가수 7 · fp32 와 지수가 같아 범위가 같음, 정밀도만 낮음" },
                { type: "num", q: "파라미터 70억 개를 bf16 으로 저장하면 몇 GB(10⁹ B)?", answer: 14, tol: 0, unit: "GB", why: "7×10⁹ × 2 B = 14 GB · fp32 면 28 GB, 학습 땐 기울기·옵티마이저 상태가 더 붙음" },
                { q: "GPU 연산 시간을 잴 때 `torch.cuda.synchronize()` 가 필요한 이유는?", options: ["GPU 클럭을 최대로 올리려고", "캐시 메모리를 비우려고", "커널이 비동기로 큐에만 들어가서", "Python GIL 을 풀어 스레드 경합을 없애려고"], a: 2, why: "호출은 큐에 넣고 바로 돌아옴 → 동기화 없이 재면 '넣는 시간'만 측정" },
                { q: "fp16 학습에서 `GradScaler` 를 쓰는 이유는?", options: ["가중치를 fp16 으로 영구 변환", "학습률을 자동으로 키우려고", "GPU 메모리를 절반 아래로 줄이려고", "작은 기울기가 0 이 되는 것 방지"], a: 3, why: "fp16 최소 정규수 6.1×10⁻⁵ · 1e-8 같은 기울기는 0 이 됨 → 손실을 키워 backward 후 다시 나눔" },
                { type: "text", q: "출력은? (CPU)", code: { lang: "python", src: "a, b = torch.randn(64, 64), torch.randn(64, 64)\nwith torch.autocast(\"cpu\", dtype=torch.bfloat16):\n    z = a @ b\nprint(z.dtype)" }, answer: ["torch.bfloat16"], why: "autocast 는 matmul 을 지정한 저정밀 dtype 으로 · 입력 a, b 는 float32 그대로" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "print(torch.tensor(1e-8, dtype=torch.float16))" }, answer: ["tensor(0., dtype=torch.float16)"], why: "fp16 의 가장 작은 비정규수 ≈ 6×10⁻⁸ 의 절반보다 작아 0 으로 · bf16 은 1.0012e-08 로 남음" },
                { type: "order", q: "`torch.compile(model)` 이 처음 호출될 때의 흐름", items: ["TorchDynamo 가 Python 바이트코드에서 그래프 추출", "AOTAutograd 가 forward·backward 그래프 생성", "Inductor 가 연산을 묶어 커널 코드 생성", "Triton/C++ 커널 컴파일", "이후 호출은 가드 확인 후 캐시된 커널 실행"], why: "Ansel et al. (2024): Dynamo(바이트코드 캡처) → AOTAutograd → Inductor(코드 생성) · 첫 호출이 느린 이유" },
                { type: "num", q: "배치 64, 길이 2048, 어휘 128256 의 fp32 logit 텐서는 몇 GiB?", answer: 62.625, tol: 0.01, unit: "GiB", why: "64·2048·128256·4 B = 67,243,081,728 B ÷ 2³⁰ · 2.13 의 `nn.LinearCrossEntropyLoss` 가 이걸 조각내 안 만드는 이유" },
                { q: "학습이 끝난 뒤에도 nvidia-smi 의 사용 메모리가 안 줄어드는 주된 이유는?", options: ["GPU 드라이버의 메모리 누수", "캐싱 할당자가 메모리를 쥐고 재사용", "텐서가 학습 뒤 자동으로 디스크에 저장돼서", "CUDA 가 해제를 지원하지 않아서"], a: 1, why: "PyTorch 할당자는 해제 블록을 캐시해 다음 할당에 씀 · 실제 텐서 사용량은 `torch.cuda.memory_allocated()`" }
            ],
            refs: [
                { title: "CUDA semantics", by: "PyTorch Foundation", url: "https://docs.pytorch.org/docs/stable/notes/cuda.html", kind: "doc" },
                { title: "Automatic Mixed Precision package - torch.amp", by: "PyTorch Foundation", url: "https://docs.pytorch.org/docs/stable/amp.html", kind: "doc" },
                { title: "Mixed Precision Training", by: "Micikevicius et al.", year: 2017, url: "https://arxiv.org/abs/1710.03740", kind: "paper" },
                { title: "PyTorch 2: Faster Machine Learning Through Dynamic Python Bytecode Transformation and Graph Compilation", by: "Ansel et al.", year: 2024, url: "https://docs.pytorch.org/assets/pytorch2-2.pdf", kind: "paper" }
            ]
        }
    ]
});
