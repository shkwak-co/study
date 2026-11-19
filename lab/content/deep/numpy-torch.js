// Long-form articles for the numpy-torch track. Every printed output was produced by running the code
// (NumPy 2.5.5, torch 2.15.0+cpu, Python 3.14, Windows, 2026-11-19); timings are from that one PC.
LAB.article("numpy-torch", {
    "np-ndarray": {
        intro: "NumPy 배열은 '숫자를 담은 상자'라기보다 '메모리 한 덩어리를 읽는 규칙'이다. 같은 바이트 덩어리를 shape와 스트라이드(strides)만 바꿔 여러 모양으로 읽을 수 있고, 그래서 전치·슬라이스가 공짜이고, 가끔은 내가 바꾼 값이 엉뚱한 배열에도 나타난다. 이 글은 C의 포인터 산술로 ndarray를 해부한다. 실습 화면에서 연산 버튼을 누르며 메모리 칸이 어떻게 다시 읽히는지 같이 본다.",
        sections: [
            {
                h: "리스트는 왜 느린가: 포인터 배열 대 숫자 덩어리",
                p: [
                    "Python 리스트는 객체를 가리키는 포인터의 배열이다. `[1.0, 2.0]`의 원소는 각각 24 바이트짜리 float 객체(`sys.getsizeof(1.0) == 24`)이고, 리스트는 그 주소 8 바이트씩을 들고 있다. 원소 하나에 32 바이트, 그리고 원소마다 '이 객체의 타입은? `__mul__`은 어디?'를 묻는 해석기 작업이 붙는다.",
                    "ndarray는 같은 타입의 숫자를 빈틈없이 늘어놓은 **버퍼**(data buffer) 하나를 가진다. float64 백만 개면 정확히 8,000,000 바이트다. 타입은 배열 전체에 한 번만 적혀 있으니, C 루프가 포인터를 8 바이트씩 옮기며 바로 읽는다. 이 PC에서 백만 개의 제곱합은 리스트 생성식이 22.7 ms, `np.dot`이 0.10 ms로 약 218배 차이였다."
                ],
                table: {
                    head: ["", "list of float", "ndarray float64"],
                    rows: [
                        ["원소 하나의 메모리", "포인터 8 B + 객체 24 B", "8 B"],
                        ["타입 정보", "원소마다", "배열에 한 번 (dtype)"],
                        ["합 구하기 루프", "해석기가 원소마다 메서드 찾기", "컴파일된 C 루프 (SIMD 가능)"],
                        ["섞인 타입", "가능", "불가 (object dtype은 예외, 느림)"]
                    ]
                }
            },
            {
                h: "ndarray를 이루는 다섯 가지",
                p: [
                    "배열 객체는 작은 머리(header)와 버퍼로 나뉜다. 머리에는 버퍼 안의 시작 주소, `dtype`, `shape`, 스트라이드, 그리고 연속인지·쓰기 가능한지 같은 플래그가 들어 있다. 연산 대부분은 머리만 새로 만들고 버퍼는 그대로 둔다.",
                    "**스트라이드**(strides)는 '이 축으로 한 칸 가려면 몇 바이트 건너뛰나'다. `np.arange(12, dtype=np.int32).reshape(3, 4)`는 다음 열이 4 바이트 뒤, 다음 행이 4 × 4 = 16 바이트 뒤라서 strides가 `(16, 4)`다. 원소 단위가 아니라 바이트 단위라는 점을 기억하자. dtype을 float64로 바꾸면 `(32, 8)`이 된다."
                ],
                table: {
                    head: ["속성", "3×4 int32 예", "뜻"],
                    rows: [
                        ["`a.__array_interface__['data'][0]`", "버퍼 안 시작 주소", "슬라이스하면 이 값이 옮겨 감 (offset)"],
                        ["`a.dtype` / `a.itemsize`", "int32 / 4", "원소 하나의 해석 방법과 크기"],
                        ["`a.shape`", "(3, 4)", "축마다 원소 수"],
                        ["`a.strides`", "(16, 4)", "축마다 한 칸의 바이트 수"],
                        ["`a.flags`", "C_CONTIGUOUS True", "연속 여부, 쓰기 가능 여부, 데이터 소유 여부"]
                    ]
                }
            },
            {
                h: "주소 공식과 메모리 배치 순서",
                p: [
                    "원소 `a[i, j]`의 주소는 `시작 + i·strides[0] + j·strides[1]`이다. 축이 몇 개든 같다: 인덱스와 스트라이드의 내적에 시작 주소를 더한다. 이 한 줄이 NumPy 메모리 모델의 전부다.",
                    "마지막 축이 메모리에서 가장 빨리 변하도록 놓는 방식을 **C 순서**(row-major order, C order)라 한다. NumPy와 PyTorch의 기본이다. 반대로 첫 축이 가장 빨리 변하면 **F 순서**(column-major order, Fortran order)이고, C 순서 배열의 `.T`가 바로 이 모양이다. 원소가 어느 한 순서로 빈틈없이 놓인 상태를 **연속 배열**(contiguous array)이라 하며 `a.flags['C_CONTIGUOUS']`로 확인한다.",
                    "아래 실습에서 dtype을 바꿔 보면 strides가 itemsize 배로 바뀌고, 연산 버튼을 누르면 같은 버퍼 칸(테두리 칸)을 다른 순서로 읽는 것을 볼 수 있다. 보이는 모양의 칸 위에 마우스를 올리면 그 값이 사는 버퍼 칸이 함께 밝아진다."
                ],
                demo: "lesson"
            },
            {
                h: "복사 없이 모양 바꾸기: 숫자 세 개만 바꾸기",
                p: [
                    "**뷰**(view)는 같은 버퍼를 다른 shape·strides·시작 위치로 읽는 배열이다. 데이터 복사가 없으니 크기와 상관없이 즉시 만들어지고, 뷰에 쓰면 원본도 바뀐다. 정수·슬라이스·`...`·`None`만 쓰는 **기본 인덱싱**(basic indexing)은 언제나 뷰를 돌려준다. 아래 표는 3×4 int32 `a`로 실제 실행한 값이다."
                ],
                table: {
                    head: ["식", "shape", "strides (B)", "무엇이 바뀌었나"],
                    rows: [
                        ["`a.T`", "(4, 3)", "(4, 16)", "shape·strides를 뒤집음 → F 연속"],
                        ["`a[:, ::2]`", "(3, 2)", "(16, 8)", "열 stride 2배"],
                        ["`a[::-1]`", "(3, 4)", "(-16, 4)", "음수 stride, 시작은 마지막 행"],
                        ["`a[1:]`", "(2, 4)", "(16, 4)", "시작 위치만 16 B 뒤로"],
                        ["`a[0]`", "(4,)", "(4,)", "축 하나를 없앰"],
                        ["`a.reshape(2, -1)`", "(2, 6)", "(24, 4)", "연속이라 새 strides로 표현 가능"],
                        ["`np.broadcast_to(a, (2, 3, 4))`", "(2, 3, 4)", "(0, 16, 4)", "stride 0 = 같은 칸 반복 (읽기 전용)"]
                    ]
                },
                tip: "`np.lib.stride_tricks.sliding_window_view(x, 3)`도 뷰다. 길이 8 배열에서 (6, 3) 창을 strides (8, 8)로 만들어, 이동 평균을 복사 없이 계산한다."
            },
            {
                h: "언제 복사가 일어나나",
                p: [
                    "정수 배열이나 불리언 배열로 고르는 **고급 인덱싱**(advanced indexing, fancy indexing)은 언제나 복사다. `a[[0, 2]]`가 고른 행들이 메모리에서 일정한 간격이 아닐 수도 있으니 strides로 표현할 수 없기 때문이다.",
                    "`reshape`는 '가능하면 뷰, 아니면 복사'다. 판단 기준은 '새 모양의 원소 순서를 어떤 strides로 재현할 수 있나'다. `a.T.reshape(-1)`은 0, 4, 8, 1, … 순서로 메모리를 건너뛰어야 해서 복사다. 반면 `a[:, ::2].reshape(-1)`은 0, 2, 4, …, 10이 8 바이트 간격으로 딱 맞아 떨어져 뷰다(stride 8). 실습에서 `[..., ::2]` 뒤에 `.reshape(-1)`을 눌러 확인해 보자. `a[::2].reshape(-1)`은 0–3 다음 8–11로 간격이 끊겨 복사다.",
                    "NumPy 2에서는 복사 여부를 명시할 수 있다. `np.reshape(a.T, -1, copy=False)`는 복사가 필요하면 `ValueError: Unable to avoid creating a copy while reshaping.`를 낸다. `np.asarray(x)`는 필요할 때만 복사, `np.array(x)`는 기본이 복사, `x.astype(dt)`도 기본이 복사다(`copy=False`면 dtype이 같을 때 공유)."
                ],
                code: {
                    lang: "python",
                    title: "복사 여부는 shares_memory로",
                    src: `import numpy as np

a = np.arange(12, dtype=np.int32).reshape(3, 4)
print(np.shares_memory(np.asarray(a), a))                 # True
print(np.shares_memory(np.array(a), a))                   # False
print(np.shares_memory(a.astype(np.int32), a))            # False
print(np.shares_memory(a.astype(np.int32, copy=False), a))  # True
r = a.T.reshape(-1)
print(np.shares_memory(a, r), r.base is None)             # False False`,
                    note: "마지막 줄: 복사본인데 `base`가 None이 아니다. 내부에서 만든 중간 복사본을 가리키기 때문 — 공식 문서도 base로 '새 배열인지' 판단하지 말라고 한다."
                }
            },
            {
                h: "dtype: 크기, 범위, 그리고 조용한 넘침",
                p: [
                    "dtype은 메모리 크기와 값의 범위를 함께 정한다. float64 백만 개는 7.63 MiB, float32로 바꾸면 3.81 MiB다. 이미지(uint8)·센서 값(int16)은 작은 정수 dtype이 흔한데, 고정 폭 정수는 범위를 넘으면 2ⁿ으로 나눈 나머지가 되는 **정수 랩어라운드**(integer wraparound)가 일어난다.",
                    "NumPy 2의 형 승격 규칙(NEP 50)에서 Python 숫자는 '약하게' 취급된다. uint8 배열 + 100은 uint8로 계산되어 200 + 100이 44가 된다(배열 연산은 경고 없음, 스칼라 연산은 RuntimeWarning). 넣는 Python 정수 자체가 범위 밖이면(`+ 300`) `OverflowError: Python integer 300 out of bounds for uint8`가 난다. 반대로 NumPy 스칼라는 '강하다': float32 배열 + `np.float64(1.5)`의 결과는 float64다."
                ],
                table: {
                    head: ["dtype", "바이트", "범위·정밀도", "쓰는 곳"],
                    rows: [
                        ["uint8", "1", "0 … 255", "이미지 픽셀"],
                        ["int8", "1", "−128 … 127", "양자화 가중치"],
                        ["int32 / int64", "4 / 8", "±2.1×10⁹ / ±9.2×10¹⁸", "인덱스, 개수 (기본 int는 int64)"],
                        ["float16", "2", "최대 65504, eps 9.8×10⁻⁴", "저장·추론"],
                        ["float32", "4", "eps 1.19×10⁻⁷", "딥러닝 기본"],
                        ["float64", "8", "eps 2.2×10⁻¹⁶", "NumPy 기본, 과학 계산"]
                    ]
                },
                tip: "더하기 전에 넓히기: `img.astype(np.int16) + 100` 뒤 `np.clip(…, 0, 255).astype(np.uint8)`."
            },
            {
                h: "실습: 주소를 직접 계산해 값 찾기",
                p: [
                    "주소 공식을 코드로 확인한다. 뷰 `b = a.T[1:, ::2]`에서 원소의 주소를 strides로 계산하고, 그 오프셋으로 원본 버퍼를 직접 읽어 같은 값이 나오는지 본다. 아래 출력은 실제 실행 결과다.",
                    "`b`는 shape (3, 2), strides (4, 32)다. `b[2, 1]`의 오프셋은 2·4 + 1·32 = 40에 시작 오프셋 4(`[1:]`가 한 칸 민 것)를 더한 44 바이트이고, 원본의 44 // 4 = 11 번째 원소 11이 나온다. 손으로 먼저 계산한 뒤 실행해 보자."
                ],
                code: {
                    lang: "python",
                    title: "where.py",
                    src: `import numpy as np

a = np.arange(12, dtype=np.int32).reshape(3, 4)
a0 = a.__array_interface__["data"][0]

def addr(x, idx):
    base = x.__array_interface__["data"][0]
    return base + sum(i * s for i, s in zip(idx, x.strides))

b = a.T[1:, ::2]
print(b.shape, b.strides, b.tolist())
for idx in [(0, 0), (2, 1)]:
    off = addr(b, idx) - a0
    print(idx, b[idx], off, a.reshape(-1)[off // 4])

x = np.arange(8.0)
w = np.lib.stride_tricks.sliding_window_view(x, 3)
print(w.shape, w.strides, np.shares_memory(x, w))
print(w.mean(axis=1))

# 출력
# (3, 2) (4, 32) [[1, 9], [2, 10], [3, 11]]
# (0, 0) 1 4 1
# (2, 1) 11 44 11
# (6, 3) (8, 8) True
# [1. 2. 3. 4. 5. 6.]`,
                    note: "`sliding_window_view`는 읽기 전용 뷰다. 같은 칸을 여러 창이 공유하니 쓰기가 막혀 있다."
                }
            }
        ],
        pitfalls: [
            "슬라이스에 값을 써 놓고 원본이 안 바뀌었을 거라 믿기 — 슬라이스는 뷰다. 독립 사본이 필요하면 `.copy()`.",
            "반대로 `x[[0, 2]][0] = 9`처럼 고급 인덱싱 결과에 써서 원본을 바꾸려 하기 — 복사본만 바뀐다. 원본에 쓰려면 `x[[0, 2]] = …`처럼 왼쪽에 인덱스를 둔다.",
            "`base is None`으로 복사 여부 판단 — 중간 복사본 때문에 틀린다. `np.shares_memory`를 쓴다.",
            "uint8 이미지에 더하거나 빼기 — 경고 없이 돌아간다. 넓힌 뒤 계산하고 clip.",
            "strides를 원소 단위로 착각하기 — NumPy는 바이트, PyTorch의 `stride()`는 원소 단위다."
        ],
        summary: [
            "ndarray = 버퍼 + dtype + shape + strides(바이트) + 시작 위치.",
            "주소 = 시작 + Σ 인덱스·stride. 전치·슬라이스·broadcast_to는 이 숫자들만 바꾼 뷰.",
            "고급 인덱싱은 항상 복사, reshape는 strides로 표현될 때만 뷰.",
            "dtype은 메모리와 범위를 정하고, 작은 정수는 조용히 넘친다."
        ]
    },

    "np-vectorize": {
        intro: "**벡터화**(vectorization)는 '루프를 없애는 것'이 아니라 '루프를 C로 내리는 것'이다. Python 해석기가 원소마다 하던 일을 컴파일된 루프가 한 번에 하게 만들면 수십~수백 배가 빨라진다. 이 글은 그 도구인 유니버설 함수(ufunc)와 축 연산, 그리고 shape가 다른 배열을 섞는 브로드캐스팅(broadcasting) 규칙을 다룬다. 마지막 실습에서는 거리 행렬을 세 가지로 구하며 속도와 메모리를 같이 잰다.",
        sections: [
            {
                h: "같은 계산, 세 가지 속도",
                p: [
                    "백만 개의 `3x + 1`을 계산해 보면 for 루프 + append가 55.0 ms, 리스트 생성식이 49.0 ms, NumPy `3 * xs + 1`이 3.5 ms 였다(이 PC). 생성식은 루프 문법 비용만 조금 줄일 뿐 원소마다 객체를 다루는 비용은 그대로다. NumPy는 곱셈과 덧셈을 각각 컴파일된 루프 한 번으로 끝낸다.",
                    "대신 NumPy 식 `3 * xs + 1`은 `3 * xs` 결과를 담는 중간 배열을 하나 만든다. 큰 배열에서는 이 메모리 왕복이 비용의 대부분이 되고, 그래서 뒤에서 볼 `out=`과 제자리 연산이 쓸모 있다."
                ]
            },
            {
                h: "유니버설 함수의 네 가지 얼굴",
                p: [
                    "**유니버설 함수**(universal function, ufunc)는 `np.add`·`np.multiply`·`np.exp`·`np.maximum`처럼 원소별로 동작하는 함수다. 모든 ufunc는 브로드캐스팅을 지원하고, 결과를 기존 배열에 쓰는 `out=`, 일부 원소만 계산하는 `where=`, 그리고 메서드 몇 개를 공통으로 가진다."
                ],
                table: {
                    head: ["형태", "예", "결과 (실행값)"],
                    rows: [
                        ["원소별", "`np.add([1, 2, 3], 1, out=y)`", "y = [2. 3. 4.]"],
                        ["reduce (접기)", "`np.add.reduce([1, 2, 3])`", "6 (= sum)"],
                        ["accumulate (누적)", "`np.add.accumulate([1, 2, 3])`", "[1 3 6] (= cumsum)"],
                        ["outer (모든 쌍)", "`np.add.outer([1, 2], [10, 20, 30])`", "[[11, 21, 31], [12, 22, 32]]"],
                        ["where= (골라 계산)", "`np.sqrt(z, out=np.zeros(3), where=z > 0)`", "z=[1,−2,3] → [1. 0. 1.732]"]
                    ]
                },
                tip: "`where=`를 쓸 때는 `out=`으로 초기값을 꼭 준다. 계산하지 않은 자리는 out의 원래 값이 남는다."
            },
            {
                h: "axis 연산: 어느 축이 사라지나",
                p: [
                    "`sum`·`mean`·`max`에 `axis=`를 주면 그 축을 따라 접어서 그 축이 사라지는 **축 줄이기**(reduction along an axis)가 된다. '행 방향으로 접는다'는 말이 헷갈리면 'axis=k는 결과 shape에서 k 번째가 빠진다'로 외우면 된다. shape (2, 3, 4)로 실행한 결과는 아래와 같다.",
                    "줄인 축을 크기 1로 남기는 **축 유지**(keepdims)는 원래 배열과 다시 연산할 때 필요하다. `P / P.sum(axis=1, keepdims=True)`는 (2, 2)와 (2, 1)이 만나 행마다 나뉜다. keepdims를 빼면 (2, 2)와 (2,)가 만나 열 방향으로 나뉘는데, 정사각 배열이라 오류도 나지 않고 틀린 값이 나온다."
                ],
                table: {
                    head: ["식 (t는 (2, 3, 4))", "결과 shape"],
                    rows: [
                        ["`t.sum(axis=0)`", "(3, 4)"],
                        ["`t.sum(axis=1)`", "(2, 4)"],
                        ["`t.sum(axis=2)`", "(2, 3)"],
                        ["`t.sum(axis=(1, 2))`", "(2,)"],
                        ["`t.sum(axis=(1, 2), keepdims=True)`", "(2, 1, 1)"]
                    ]
                }
            },
            {
                h: "브로드캐스팅 규칙 세 줄",
                p: [
                    "shape가 다른 두 배열을 연산하는 **브로드캐스팅**(broadcasting) 규칙은 NumPy 문서의 세 줄이 전부다. 첫째, 두 shape를 오른쪽 끝에 맞춘다. 둘째, 짧은 쪽의 빈 앞자리는 1로 본다. 셋째, 축마다 크기가 같거나 한쪽이 1이면 통과하고, 1인 쪽은 상대 크기로 늘어난다. 하나라도 어긋나면 `ValueError: operands could not be broadcast together with shapes (3,4) (3,)`이다.",
                    "늘어나는 쪽은 실제로 복사되지 않는다. 늘린 축의 stride를 0으로 두어 같은 칸을 반복해 읽는다. 아래 실습에서 예제를 바꿔 가며 어느 축이 늘어나는지, 점선 칸(늘린 복사, 메모리 없음)이 어디에 생기는지 보자. `(3,)`와 `(3, 1)` 함정 예제는 특히 꼭 눌러 보길 권한다."
                ],
                demo: "lesson"
            },
            {
                h: "stride 0을 눈으로 보기",
                p: [
                    "브로드캐스팅으로 늘어난 배열은 `np.broadcast_to`로 직접 만들어 볼 수 있다. 아래 ndarray 메모리 실습은 길이 3 배열에 `broadcast_to (2, …)`를 적용한 상태로 시작한다. 첫 축의 stride가 0이고, 버퍼 칸마다 '×2' 표시가 붙는다. 같은 칸을 두 번 읽는다는 뜻이다. 그래서 이런 배열은 읽기 전용이다. 쓰기를 허용하면 한 칸에 쓴 값이 여러 자리에 동시에 나타나기 때문이다."
                ],
                demo: { type: "sim", name: "strides", shape: [3], item: 4, ops: ["bc"] }
            },
            {
                h: "브로드캐스팅은 공짜가 아니다: 결과와 중간 배열",
                p: [
                    "입력을 늘리는 것은 공짜지만 결과는 진짜 배열이다. 점 500개와 400 개(64 차원)의 **쌍별 거리**(pairwise distance)를 `A[:, None, :] - B[None, :, :]`로 구하면, `None`으로 끼운 **새 축**(new axis, np.newaxis) 덕분에 (500, 1, 64)와 (1, 400, 64)가 만나 (500, 400, 64) 짜리 **임시 배열**(temporary array)이 생긴다. float64로 97.7 MiB다. 점이 10배 많아지면 9.5 GiB가 된다.",
                    "해결책은 식을 바꾸는 것이다. |a − b|² = |a|² + |b|² − 2a·b로 전개하면 큰 덩어리는 `A @ B.T` 하나가 되고, 임시 배열은 (500, 400)뿐이다. 행렬곱은 BLAS가 캐시를 잘 쓰도록 짜여 있어 속도도 더 빠르다. 반올림 때문에 아주 작은 음수가 생길 수 있으니 `np.maximum(…, 0)` 뒤 `sqrt` 한다.",
                    "중간 배열을 줄이는 다른 방법은 제자리 연산이다. `Z = X - mu; Z /= sd`처럼 `-=`·`/=`를 쓰면 결과 버퍼를 재사용한다. 단, 입력을 덮어쓰지 않게 처음 한 번은 새 배열을 만들어야 한다."
                ]
            },
            {
                h: "자주 쓰는 패턴 다섯",
                list: [
                    "열마다 표준화: `(X - X.mean(0)) / X.std(0)` — (n, d)와 (d,)",
                    "행마다 확률로: `P / P.sum(1, keepdims=True)` — keepdims 필수",
                    "안정한 softmax: `e = np.exp(x - x.max(-1, keepdims=True)); e / e.sum(-1, keepdims=True)` — x = [1000, 1001]이면 그냥 exp는 inf/inf = nan",
                    "원-핫: `(labels[:, None] == np.arange(C)).astype(int)` — labels [2, 0, 1, 2] → [[0,0,1],[1,0,0],[0,1,0],[0,0,1]]",
                    "바깥 곱·합: `a[:, None] * b[None, :]` 또는 `np.multiply.outer(a, b)`"
                ]
            },
            {
                h: "실습: 거리 행렬 세 가지 — 시간과 메모리",
                p: [
                    "같은 거리 행렬을 이중 루프, 브로드캐스팅, 행렬곱 전개로 구하고 시간과 임시 배열 크기를 비교한다. 결과가 같은지 `np.allclose`로 확인하는 습관을 함께 들이자. 출력은 이 PC에서 실행한 값이고, 시간은 CPU마다 다르지만 자릿수 관계는 비슷하게 나온다.",
                    "세 결과의 최대 차이는 3.6×10⁻¹⁵로 float64 반올림 수준이었다. 루프 대비 브로드캐스팅은 약 6배, 행렬곱 전개는 거기서 다시 약 24배 빨랐고, 임시 메모리는 97.7 MiB에서 1.5 MiB로 줄었다."
                ],
                code: {
                    lang: "python",
                    title: "dist3.py",
                    src: `import time
import numpy as np

rng = np.random.default_rng(0)
A = rng.standard_normal((500, 64))
B = rng.standard_normal((400, 64))

def best(f, n=3):
    ts = []
    for _ in range(n):
        t0 = time.perf_counter(); r = f(); ts.append(time.perf_counter() - t0)
    return r, min(ts) * 1e3

def loop():
    D = np.empty((len(A), len(B)))
    for i in range(len(A)):
        for j in range(len(B)):
            D[i, j] = np.sqrt(((A[i] - B[j]) ** 2).sum())
    return D

def bcast():
    return np.sqrt(((A[:, None, :] - B[None, :, :]) ** 2).sum(-1))

def mm():
    sq = (A * A).sum(1)[:, None] + (B * B).sum(1)[None, :] - 2 * A @ B.T
    return np.sqrt(np.maximum(sq, 0))

D1, t1 = best(loop, 2); D2, t2 = best(bcast); D3, t3 = best(mm, 5)
print(f"loop  {t1:7.1f} ms")
print(f"bcast {t2:7.1f} ms  temp {500*400*64*8/2**20:.1f} MiB")
print(f"mm    {t3:7.1f} ms  temp {500*400*8/2**20:.1f} MiB")
print(np.allclose(D1, D2), np.allclose(D1, D3), np.abs(D1 - D3).max())

# 출력 (이 PC)
# loop    281.6 ms
# bcast    47.5 ms  temp 97.7 MiB
# mm        2.0 ms  temp 1.5 MiB
# True True 3.552713678800501e-15`,
                    note: "더 해 볼 것: 점 수를 5000 × 4000으로 키우면 bcast의 임시 배열이 얼마가 되는지 먼저 계산하고(약 9.5 GiB), mm만 실행해 보기."
                }
            }
        ],
        pitfalls: [
            "`(n,)`와 `(n, 1)`을 섞기 — (n, n) 바깥 연산이 오류 없이 만들어진다. 축을 늘 의식적으로 맞춘다.",
            "keepdims 없이 줄인 값으로 다시 나누기 — 정사각 배열에서 조용히 틀린다.",
            "큰 브로드캐스팅의 임시 배열을 잊기 — 결과 shape의 원소 수 × itemsize를 먼저 계산한다.",
            "`np.vectorize`를 벡터화로 착각하기 — 편의용 래퍼일 뿐 내부는 Python 루프다.",
            "softmax·log-sum-exp에서 최댓값 빼기를 생략 — 큰 logit에서 nan."
        ],
        summary: [
            "벡터화 = 원소 루프를 컴파일된 ufunc로. 이 PC에서 백만 원소 기준 약 14–218배.",
            "axis=k는 결과에서 k 번째 축이 빠진다. 다시 쓸 거면 keepdims=True.",
            "브로드캐스팅: 오른쪽 정렬, 같거나 1. 늘린 쪽은 stride 0이라 공짜, 결과는 진짜 메모리.",
            "큰 쌍별 연산은 식을 행렬곱으로 바꾸면 빠르고 메모리도 적다."
        ]
    },

    "np-indexing": {
        intro: "배열에서 원하는 원소를 고르고, 순서를 매기고, 축끼리 곱해 합치는 일은 데이터 전처리와 모델 코드의 대부분을 차지한다. 이 글은 불리언 마스크(boolean mask)와 위치 함수(`where`·`argsort`), 행렬곱(matmul)과 einsum, 그리고 재현 가능한 난수를 다룬다. 마지막에 어텐션 한 번을 NumPy로 직접 계산한다.",
        sections: [
            {
                h: "인덱싱 네 종류와 복사 여부",
                p: [
                    "앞 강에서 본 대로 기본 인덱싱은 뷰, 고급 인덱싱은 복사다. 실제로 자주 만나는 형태를 표로 정리하면 아래와 같다. '읽기' 기준이고, 대입(`x[...] = v`)은 어느 형태든 원본에 쓴다."
                ],
                table: {
                    head: ["형태", "예", "결과", "읽기"],
                    rows: [
                        ["정수·슬라이스", "`x[1]`, `x[1:4:2]`, `x[..., 0]`", "축이 줄거나 strides 변경", "뷰"],
                        ["새 축", "`x[:, None]`", "크기 1 축 추가", "뷰"],
                        ["정수 배열", "`x[[0, 2]]`, `x[idx]`", "고른 순서대로", "복사"],
                        ["불리언 배열", "`x[x > 0]`", "True 자리만 1-D로", "복사"]
                    ]
                }
            },
            {
                h: "불리언 마스크: 읽기는 복사, 쓰기는 원본",
                p: [
                    "**불리언 마스크**(boolean mask)는 원본과 같은 shape의 True/False 배열이다. `x[x > 0]`은 조건에 맞는 원소만 1-D로 뽑은 복사본이고, `x[x < 0] = 0`은 원본의 해당 자리에 쓴다. 왼쪽에 오면 쓰기, 오른쪽에 오면 읽기라는 것만 기억하면 된다.",
                    "조건을 합칠 때는 `and`·`or` 대신 `&`·`|`·`~`를 쓰고 비교마다 괄호를 친다. `x[x > 0 & x < 5]`는 연산자 우선순위 때문에 `0 & x`가 먼저 계산되고, 결국 `ValueError: The truth value of an array with more than one element is ambiguous.`가 난다. `x[(x > 0) & (x < 5)]`가 맞다(x = [−2, 3, 7, 0, 5] → [3])."
                ]
            },
            {
                h: "값 대신 위치: where, argmax, argsort, take_along_axis",
                p: [
                    "`np.where(c, a, b)`는 조건에 따라 원소를 고르는 원소별 삼항 연산이다. `argmax`·`argsort`는 값이 아니라 위치를 돌려줘서, 다른 배열(라벨, ID)에서 같은 위치를 꺼낼 때 쓴다. `np.argsort([30, 10, 20])`은 [1, 2, 0]이다.",
                    "행마다 상위 k 개를 고를 때는 `np.take_along_axis`가 짝이다. s = [[3, 9, 1], [7, 2, 8]]에서 `k = np.argsort(s, axis=1)[:, ::-1][:, :2]`는 [[1, 0], [2, 0]], `np.take_along_axis(s, k, axis=1)`은 [[9, 3], [8, 7]]이다.",
                    "백만 개 중 상위 10개처럼 k가 작으면 전체 정렬 대신 **부분 정렬**(partial sort, argpartition)을 쓴다. k 번째 원소만 제자리에 두고 양쪽을 크기로만 나눠 O(n)이다. 이 PC에서 27 ms → 2.7 ms 였고, 고른 10개의 집합은 argsort와 같았다. 같은 값의 순서를 지켜야 하면 `np.argsort(x, kind='stable')`."
                ]
            },
            {
                h: "행렬곱과 배치 축",
                p: [
                    "**행렬곱**(matrix multiplication, matmul, @)은 마지막 두 축을 행렬로 보고, 앞쪽 축은 브로드캐스팅되는 배치로 본다. 그래서 `(2, 3, 4) @ (4, 5)`는 (2, 3, 5), `(2, 3, 4) @ (2, 4, 5)`도 (2, 3, 5)다. 이처럼 앞쪽 축마다 독립 행렬곱을 하는 것을 **배치 행렬곱**(batched matrix multiplication)이라 한다.",
                    "`np.dot`은 N 차원에서 규칙이 다르다. `np.dot(a, b)`는 a의 마지막 축과 b의 끝에서 두 번째 축을 곱해 합하고 나머지 축을 모두 붙인다. (2, 3, 4)와 (2, 4, 5)를 넣으면 (2, 3, 2, 5)가 나온다(실행해 확인). 3 차원 이상에서는 `@`를 쓰자."
                ]
            },
            {
                h: "einsum: 축에 이름을 붙여 계산 적기",
                p: [
                    "**아인슈타인 합**(Einstein summation, einsum)은 입력 축마다 글자를 붙이고 출력에 남길 글자를 적는 표기다. 출력에 없는 글자는 곱한 뒤 합한다. 식이 곧 shape 주석이라 어텐션처럼 축이 많은 계산에서 실수가 준다. 아래는 모두 실행해 확인한 예다(M = [[0,1,2],[3,4,5]], v = [1, 0, 2])."
                ],
                table: {
                    head: ["식", "뜻", "결과"],
                    rows: [
                        ["`'ij->ji'`", "전치", "shape (3, 2)"],
                        ["`'ij->'`", "전체 합", "15"],
                        ["`'ij->j'`", "열 합", "[3, 5, 7]"],
                        ["`'ij,j->i'`", "행렬 × 벡터", "[4, 13]"],
                        ["`'ii->i'`", "대각선", "arange(9) 3×3 → [0, 4, 8]"],
                        ["`'i,j->ij'`", "바깥 곱", "[1,2]·[3,4] → [[3,4],[6,8]]"],
                        ["`'btd,bsd->bts'`", "배치 어텐션 점수", "Q @ K.transpose(0, 2, 1)"]
                    ]
                },
                demo: "lesson"
            },
            {
                h: "난수: 전역 시드 대신 생성기",
                p: [
                    "NumPy의 권장 방식은 `rng = np.random.default_rng(seed)`로 **난수 생성기**(random number Generator)를 만들어 함수에 넘기는 것이다(NEP 19). 기본 비트 생성기는 PCG64다. 생성기 객체가 상태를 들고 다니므로, 다른 라이브러리가 전역 난수를 꺼내 써도 내 수열이 흔들리지 않는다.",
                    "**난수 시드**(random seed)가 같으면 같은 수열이 나온다. `default_rng(0).integers(0, 10, 3)`은 두 번 만들어도 [8, 6, 5]다. 병렬 작업자마다 독립된 수열이 필요하면 `np.random.SeedSequence(1234).spawn(n)`으로 자식 시드를 만들어 각자 생성기를 만든다(이 예에서 첫 정수 [42, 71]).",
                    "NEP 19에 따르면 `Generator`의 수열은 NumPy 버전이 바뀌면 달라질 수 있다(알고리즘 개선을 허용하려고). 정확히 같은 수열이 영구히 필요하면 데이터 자체를 저장하자."
                ]
            },
            {
                h: "실습: 인과 어텐션 한 번을 NumPy로",
                p: [
                    "T = 4개 토큰, D = 8 차원의 Q, K, V로 어텐션을 계산한다. einsum으로 점수, `np.tril`로 **인과 마스크**(causal mask), `np.where`로 미래 위치를 −inf, 안정한 softmax, 그리고 `@ V`다. 출력의 위 삼각형이 정확히 0이고 행 합이 1 인지 확인하자.",
                    "첫 토큰은 자기 자신만 볼 수 있어 가중치가 [1, 0, 0, 0]이다. 마지막 토큰은 세 번째 토큰에 0.68을 줬다. 시드를 바꿔 실행하면 숫자는 달라지지만 이 두 성질은 그대로다."
                ],
                code: {
                    lang: "python",
                    title: "attn_np.py",
                    src: `import numpy as np

rng = np.random.default_rng(0)
T, D = 4, 8
Q, K, V = (rng.standard_normal((T, D)) for _ in range(3))
S = np.einsum("td,sd->ts", Q, K) / np.sqrt(D)       # (T, T) 점수
causal = np.tril(np.ones((T, T), dtype=bool))         # 아래 삼각형 = 볼 수 있음
S = np.where(causal, S, -np.inf)
P = np.exp(S - S.max(-1, keepdims=True))
P /= P.sum(-1, keepdims=True)
out = P @ V
print(P.round(2))
print(P.sum(-1), out.shape)

# 출력
# [[1.   0.   0.   0.  ]
#  [0.83 0.17 0.   0.  ]
#  [0.34 0.41 0.25 0.  ]
#  [0.1  0.03 0.68 0.18]]
# [1. 1. 1. 1.] (4, 8)`,
                    note: "더 해 볼 것: 배치 축 B를 붙여 `'btd,bsd->bts'`로 바꾸고, 결과가 배치마다 위 코드와 같은지 `np.allclose`로 확인."
                }
            }
        ],
        pitfalls: [
            "`x[mask]` 결과에 써서 원본을 바꾸려 하기 — 복사본이다. `x[mask] = v`로 쓴다.",
            "`&` 조건에 괄호를 빼먹기 — 우선순위 때문에 'truth value is ambiguous' 오류.",
            "3 차원 이상에서 `np.dot`을 matmul처럼 쓰기 — 축이 붙어 (2, 3, 2, 5) 같은 모양이 나온다.",
            "전역 `np.random.seed`에 의존 — 다른 코드가 전역 난수를 쓰면 재현이 깨진다.",
            "마스크를 softmax 뒤에 적용 — 행 합이 1이 아니게 된다. 마스크는 softmax 전에 −inf로."
        ],
        summary: [
            "마스크·정수 배열로 읽으면 복사, 같은 식을 왼쪽에 두면 원본에 씀.",
            "위치가 필요하면 arg 함수. 상위 k는 argpartition.",
            "@ 는 앞쪽 축을 배치로 브로드캐스팅. 축이 많으면 einsum으로 의도를 적는다.",
            "난수는 default_rng(seed) 생성기를 넘겨 쓴다."
        ]
    },

    "torch-tensor": {
        intro: "PyTorch의 **텐서**(tensor)는 NumPy 배열과 거의 같은 방식으로 메모리를 다룬다. shape, strides, 뷰, 브로드캐스팅 규칙이 모두 같다. 다른 점은 셋이다. 어느 장치(device)에 있는지, 기울기 계산을 위해 기록되는지, 그리고 기본 dtype(default dtype). 이 글은 NumPy 코드를 PyTorch로 옮길 때 실제로 부딪히는 차이를 실행 결과와 함께 정리한다.",
        sections: [
            {
                h: "NumPy와 PyTorch, 같은 점과 다른 점",
                p: [
                    "PyTorch는 의도적으로 NumPy와 비슷한 API를 따른다(Paszke et al. 2019). 그래서 대부분의 코드는 `np.`을 `torch.`으로 바꾸면 돌아가지만, 아래 표의 차이에서 조용히 틀리거나 오류가 난다."
                ],
                table: {
                    head: ["", "NumPy", "PyTorch"],
                    rows: [
                        ["부동소수 기본 dtype", "float64", "float32"],
                        ["정수 기본 dtype", "int64", "int64"],
                        ["축 인자 이름", "`axis=`", "`dim=` (`axis=`도 받음)"],
                        ["표준편차 기본", "`std()` = 모집단 (ddof=0)", "`std()` = 표본 (correction=1)"],
                        ["형 변환", "`x.astype(np.float32)`", "`x.to(torch.float32)` / `x.float()`"],
                        ["이어 붙이기", "`np.concatenate`", "`torch.cat`"],
                        ["strides 단위", "바이트", "원소 (`x.stride()`)"],
                        ["메모리 위치", "항상 CPU", "cpu / cuda / mps …"],
                        ["기울기 기록", "없음", "`requires_grad=True`이면 기록"]
                    ]
                },
                tip: "표준편차 기본값 차이는 실제로 걸렸다. 아래 실습에서 같은 데이터인데 두 결과가 최대 0.002 달랐다."
            },
            {
                h: "만드는 법과 복사 여부",
                p: [
                    "NumPy 배열에서 텐서를 만들 때 복사하느냐 마느냐가 함수마다 다르다. 복사 없이 같은 버퍼를 보는 것을 **메모리 공유**(zero-copy sharing)라 한다. 공유하면 빠르고 메모리를 안 쓰지만, 한쪽을 바꾸면 다른 쪽도 바뀐다. 텐서가 실제로 가리키는 1-D 메모리를 **스토리지**(tensor storage)라 하고, 뷰들은 같은 스토리지를 나눠 쓴다."
                ],
                table: {
                    head: ["함수", "공유?", "비고"],
                    rows: [
                        ["`torch.from_numpy(a)`", "공유", "dtype 그대로 (float64 → float64), 크기 변경 불가"],
                        ["`torch.as_tensor(a)`", "가능하면 공유", "`dtype=torch.float32`를 주면 변환해야 하니 복사"],
                        ["`torch.tensor(a)`", "항상 복사", "데이터를 새로 소유"],
                        ["`t.numpy()`", "공유", "CPU 텐서만, 기울기 기록 중이면 `.detach()` 먼저"],
                        ["`t.clone()`", "복사", "autograd 기록은 유지"],
                        ["`torch.from_dlpack(x)`", "공유", "CuPy·JAX 등과 교환 (DLPack)"]
                    ]
                }
            },
            {
                h: "dtype이 섞일 때",
                p: [
                    "**기본 dtype**(default dtype)이 float32라서 `torch.ones(2)`는 float32, 정수 리스트로 만든 `torch.tensor([1, 2])`는 int64다. NumPy에서 온 배열은 float64인 경우가 많으니 모델에 넣기 전에 `.float()`로 맞춰야 한다. 안 맞추면 float32 가중치와 float64 입력이 만나 dtype 불일치 오류가 난다.",
                    "서로 다른 dtype을 섞을 때 결과를 정하는 **형 승격**(type promotion) 규칙은 NumPy 2와 비슷하지만 같지는 않다. 실행해 본 결과를 정리하면 아래와 같다. 차원 없는 값(Python 숫자, NumPy 스칼라)은 '약하게' 취급되어 텐서의 dtype을 바꾸지 않는다. 같은 상황에서 NumPy 2는 NumPy 스칼라를 '강하게' 취급해 float64로 올린다."
                ],
                table: {
                    head: ["식", "PyTorch 결과", "NumPy 2 대응 결과"],
                    rows: [
                        ["int 텐서 + 0.5", "float32", "int32 배열 + 1.5 → float64"],
                        ["float32 + float64 텐서", "float64", "float64"],
                        ["float32 텐서 + `np.float64(0.5)`", "float32", "float32 배열 + np.float64 → float64"]
                    ]
                }
            },
            {
                h: "장치: CPU, CUDA, MPS 사이를 옮기기",
                p: [
                    "텐서 메모리가 있는 곳이 **장치**(device)다. 연산은 같은 장치끼리만 된다. 섞으면 '모든 텐서가 같은 장치에 있어야 한다'는 RuntimeError가 난다. 모델은 `model.to(dev)`로, 데이터는 배치마다 `xb.to(dev)`로 옮긴다.",
                    "CPU 메모리에서 GPU 메모리로의 **호스트-장치 복사**(host-to-device copy)는 PCIe를 지나가므로 느리다. 그래서 처음부터 장치에 만들고(`torch.zeros(…, device=dev)`, `torch.zeros_like(x)`), 장치 간 왕복을 줄인다. GPU 텐서를 NumPy로 바꾸려면 `.cpu().numpy()`, 기울기 기록 중이면 `.detach().cpu().numpy()`다.",
                    "장치 이름을 코드에 박지 않으려면 `torch.accelerator` API를 쓸 수 있다. 이 PC의 CPU 전용 빌드에서는 `torch.accelerator.is_available()`이 False, `current_accelerator()`가 None이었다."
                ],
                demo: "lesson"
            },
            {
                h: "뷰, 연속성, view와 reshape",
                p: [
                    "텐서도 뷰가 같은 스토리지를 공유한다(Tensor Views 문서). `x.t()`는 strides만 바꾼 뷰라서 비연속이 되고, `x.stride()`는 원소 단위로 (4, 1) → (1, 4)가 된다. `view()`는 strides로 표현될 때만 성공한다. 비연속 텐서에 `x.t().view(-1)`을 하면 `RuntimeError: view size is not compatible with input tensor's size and stride … Use .reshape(...) instead.`가 난다.",
                    "`reshape()`는 가능하면 뷰, 아니면 복사다. 문서는 '뷰인지 아닌지에 기대지 말라'고 한다. 결과가 원본과 공유돼야 한다면 `view`, 상관없다면 `reshape`, 연속 메모리가 꼭 필요하면(일부 커널, `view`) `.contiguous()`를 쓴다."
                ]
            },
            {
                h: "밑줄 메서드와 공유의 위험",
                p: [
                    "`add_`·`mul_`·`clamp_`처럼 밑줄로 끝나는 메서드와 `x += 1`은 결과를 새로 만들지 않고 입력을 덮어쓰는 **제자리 연산**(in-place operation)이다. 메모리를 아끼지만 두 가지를 조심해야 한다.",
                    "첫째, 공유된 메모리를 바꾼다. `t = torch.from_numpy(a)` 뒤 `t.add_(1)`은 NumPy 배열 `a`도 바꾼다. 둘째, autograd와 충돌한다. 기울기를 기록 중인 잎 텐서에 `add_`를 하면 `RuntimeError: a leaf Variable that requires grad is being used in an in-place operation.`이 난다. 파라미터 갱신은 `with torch.no_grad():` 안에서 하거나 옵티마이저에 맡긴다. 기울기 기록 중인 텐서에 `.numpy()`를 부르면 `Can't call numpy() on Tensor that requires grad. Use tensor.detach().numpy() instead.`다."
                ]
            },
            {
                h: "실습: NumPy 전처리를 PyTorch로 옮기기",
                p: [
                    "1–2강의 표준화와 거리 행렬을 PyTorch로 옮기고 NumPy 결과와 비교한다. 일부러 함정 하나를 남겨 두었다. 결과를 보고 무엇이 다른지 찾은 뒤 고친 줄과 비교하자.",
                    "첫 비교가 False인 이유는 `std`의 기본값이다. NumPy는 n으로, PyTorch는 n − 1로 나눈다. `correction=0`을 주면 같아진다. `torch.cdist`는 쌍별 거리를 직접 계산해 주는 함수이고, 브로드캐스팅 식과 1e-4 안에서 같았다."
                ],
                code: {
                    lang: "python",
                    title: "port.py",
                    src: `import numpy as np, torch

rng = np.random.default_rng(0)
Xn = rng.normal(5.0, 2.0, size=(1000, 3))
Zn = (Xn - Xn.mean(axis=0)) / Xn.std(axis=0)

X = torch.from_numpy(Xn)                      # float64 그대로, 공유
Z = (X - X.mean(dim=0)) / X.std(dim=0)
print(Z.dtype, torch.allclose(Z, torch.from_numpy(Zn)), (Z - torch.from_numpy(Zn)).abs().max().item())
Z2 = (X - X.mean(dim=0)) / X.std(dim=0, correction=0)   # NumPy 와 같은 모집단 표준편차
print(torch.allclose(Z2, torch.from_numpy(Zn)))

A = torch.from_numpy(rng.standard_normal((500, 64))).float()
B = torch.from_numpy(rng.standard_normal((400, 64))).float()
D = torch.cdist(A, B)
D2 = ((A[:, None] - B[None]) ** 2).sum(-1).sqrt()
print(D.shape, torch.allclose(D, D2, atol=1e-4))

# 출력
# torch.float64 False 0.0020349195073166015
# True
# torch.Size([500, 400]) True`,
                    note: "옮긴 코드는 '돌아간다'에서 멈추지 말고 원래 결과와 allclose로 비교한다. 기본값 하나가 조용히 다를 수 있다."
                }
            }
        ],
        pitfalls: [
            "NumPy float64를 그대로 모델에 넣기 — dtype 불일치 오류. `.float()`로 맞춘다.",
            "`from_numpy`로 만든 텐서를 제자리 수정 — 원본 NumPy 배열도 바뀐다.",
            "`std`·`var` 기본값 차이 — NumPy ddof=0, PyTorch correction=1.",
            "장치를 섞어 연산 — 모델과 입력이 같은 장치인지 먼저 확인.",
            "비연속 텐서에 `view` — 오류. `reshape` 또는 `.contiguous().view`."
        ],
        summary: [
            "텐서 = ndarray와 같은 메모리 모델 + 장치 + 기울기 기록.",
            "from_numpy·numpy()는 공유, torch.tensor는 복사.",
            "기본 float는 float32, std 기본은 표본 표준편차.",
            "장치 간 복사를 줄이고, 같은 장치끼리 연산한다."
        ]
    },

    "autograd": {
        intro: "PyTorch에서 `loss.backward()` 한 줄이 모든 파라미터의 기울기를 채운다. 이 글은 그 한 줄 뒤에서 무슨 일이 일어나는지 본다. forward 때 무엇이 기록되는지, backward가 그 기록을 어떻게 거꾸로 도는지, 왜 기울기가 쌓이는지, 기록을 언제 끄는지. 실습 화면의 뉴런 하나로 손계산과 autograd 결과를 맞춰 보고, 마지막에는 수치 미분으로 내 미분 구현을 검증한다.",
        sections: [
            {
                h: "기록: grad_fn 사슬",
                p: [
                    "`requires_grad=True`로 직접 만든 텐서를 **잎 텐서**(leaf tensor)라 한다. 보통 모델 파라미터다. 잎 텐서가 들어간 연산의 결과에는 그 연산의 역방향 함수가 `grad_fn`으로 붙는다(`MulBackward0`, `AddBackward0` …). 각 grad_fn은 `next_functions`로 입력 쪽 노드를 가리키고, 잎에 도달하면 기울기를 더해 넣는 `AccumulateGrad`가 있다.",
                    "실습 화면과 같은 식 L = (tanh(w·x + b) − 1)²의 사슬을 따라가면 `PowBackward0 ← SubBackward0 ← TanhBackward0 ← AddBackward0 ← MulBackward0 ← AccumulateGrad`가 나온다(실행 결과). 상수 t와 `requires_grad=False`인 x는 기록에 노드가 없다."
                ],
                code: {
                    lang: "python",
                    title: "grad_fn 사슬 따라가기",
                    src: `import torch

x = torch.tensor(2.0)
w = torch.tensor(0.5, requires_grad=True)
b = torch.tensor(0.1, requires_grad=True)
L = (torch.tanh(w * x + b) - 1.0) ** 2
fn, chain = L.grad_fn, []
while fn is not None:
    chain.append(fn.name())
    nxt = [f for f, _ in fn.next_functions if f is not None]
    fn = nxt[0] if nxt else None
print(" <- ".join(chain))
# PowBackward0 <- SubBackward0 <- TanhBackward0 <- AddBackward0 <- MulBackward0 <- …AccumulateGrad`,
                    note: "마지막 이름은 플랫폼에 따라 `struct torch::autograd::AccumulateGrad`처럼 C++ 이름 그대로 찍힌다."
                }
            },
            {
                h: "거꾸로: 위에서 온 기울기 × 지역 미분",
                p: [
                    "backward는 기록을 거꾸로 돈다. 각 노드는 위에서 내려온 ∂L/∂(출력)에 자기 지역 미분을 곱해 입력 쪽으로 넘긴다. 이 방식을 **역방향 모드 자동 미분**(reverse-mode automatic differentiation)이라 한다. 출력이 하나(손실)이고 입력이 많을(파라미터 수백만 개) 때 한 번의 역방향 순회로 모든 기울기를 얻는다. 신경망의 역전파는 이것의 특수한 경우다(Baydin et al. 2018).",
                    "x = 2, w = 0.5, b = 0.1, t = 1이면 z = 1.1, y = tanh(1.1) = 0.80050, e = y − 1 = −0.19950, L = 0.039801이다. 거꾸로: ∂L/∂e = 2e = −0.39901, tanh의 지역 미분 1 − y² = 0.35920을 곱해 ∂L/∂z = −0.14332, 덧셈은 그대로 넘겨 b.grad = −0.14332, 곱셈은 상대 입력 x = 2를 곱해 w.grad = −0.28664다. 아래 실습에서 'backward ▶'를 한 번씩 눌러 같은 숫자가 한 칸씩 채워지는 것을 보자."
                ],
                demo: "lesson",
                table: {
                    head: ["연산", "forward", "입력으로 넘기는 기울기"],
                    rows: [
                        ["덧셈", "z = u + b", "g, g (그대로)"],
                        ["곱셈", "u = w·x", "g·x를 w로, g·w를 x로"],
                        ["거듭제곱", "L = e²", "g·2e"],
                        ["tanh", "y = tanh z", "g·(1 − y²) — 출력 y를 저장해 씀"],
                        ["ReLU", "y = max(0, z)", "z > 0이면 g, 아니면 0"],
                        ["행렬곱", "Y = X W", "G Wᵀ를 X로, Xᵀ G를 W로"]
                    ]
                }
            },
            {
                h: "벡터 출력과 VJP",
                p: [
                    "backward 한 단계의 실제 계산은 '위에서 온 기울기 벡터 × 지역 야코비안'인 **벡터-야코비안 곱**(vector-Jacobian product, VJP)이다. 야코비안 행렬을 통째로 만들지 않고 곱한 결과만 계산하니 메모리가 들지 않는다. 역방향 전체 비용은 forward의 몇 배 수준이다.",
                    "그래서 출력이 스칼라가 아니면 '어떤 벡터를 곱할지'를 알려 줘야 한다. 벡터 y에 `y.backward()`를 부르면 `RuntimeError: grad can be implicitly created only for scalar outputs`다. `y.backward(torch.ones_like(y))`는 '모든 원소의 합'의 기울기와 같다. x = [1, 2, 3], y = x²이면 x.grad = [2, 4, 6]이다. 입력이 적고 출력이 많으면 순방향 모드(`torch.func.jvp`)가 더 알맞다."
                ]
            },
            {
                h: "쌓이는 .grad와 zero_grad",
                p: [
                    "backward는 잎 텐서의 `.grad`를 덮어쓰지 않고 더한다. 이것이 **기울기 누적**(gradient accumulation)이다. 같은 식으로 backward를 두 번 하면 w.grad가 −0.2866의 두 배인 −0.5733이 된다. 실습 화면에서 'backward 전체'를 두 번 눌러 확인할 수 있다.",
                    "그래서 학습 루프는 step마다 `optimizer.zero_grad()`를 부른다. 2.x의 기본값은 `set_to_none=True`라서 `.grad`를 0 텐서가 아니라 None으로 만든다(시그니처로 확인). None이면 메모리를 덜 쓰고, 옵티마이저는 grad가 None인 파라미터를 건너뛴다. 누적을 일부러 쓰는 경우도 있다. 큰 배치가 메모리에 안 들어가면 작은 배치 k 개의 기울기를 모아 한 번 step 한다(손실을 k로 나눠 평균을 맞춘다)."
                ]
            },
            {
                h: "기록 끄기: no_grad, inference_mode, detach",
                p: [
                    "forward는 backward에 필요한 중간값(활성값)을 저장한다. 평가나 추론처럼 backward를 안 할 때는 기록을 꺼서 그 메모리를 아낀다. Linear 512×4 + ReLU 모델에 배치 256을 넣고 `saved_tensors_hooks`로 저장 바이트를 세어 보니, 기록 모드 7.0 MiB, no_grad 0 MiB였다. CPU 시간 차이는 1% 안팎으로 작았다. 이득은 주로 메모리다.",
                    "`torch.inference_mode()`는 **추론 모드**(inference mode)로, no_grad보다 강하게 버전 추적까지 끈다. 대신 여기서 만든 텐서는 나중에 기록되는 계산에 쓸 수 없다. 섞으면 `Inference tensors cannot be saved for backward.` 오류다. `x.detach()`는 **그래프 떼기**(detach)로, 같은 값을 가지되 기록 밖에 있는 텐서를 만든다. 목표값을 고정하거나 로그로 남길 때 쓴다."
                ],
                table: {
                    head: ["방법", "범위", "결과 텐서를 학습에 다시 쓰기", "쓰는 곳"],
                    rows: [
                        ["`torch.no_grad()`", "블록 안 모든 연산", "가능 (기록 없는 일반 텐서)", "평가, 파라미터 수동 갱신"],
                        ["`torch.inference_mode()`", "블록 안 모든 연산", "불가", "순수 추론 서버"],
                        ["`x.detach()`", "텐서 하나", "가능 (그 지점에서 기울기 끊김)", "목표값 고정, 로그, NumPy 변환"]
                    ]
                }
            },
            {
                h: "저장된 텐서와 제자리 수정 검사",
                p: [
                    "어떤 연산은 backward 때 forward의 값을 다시 쓴다. 곱셈은 상대 입력을, sigmoid·tanh는 자기 출력을 저장한다. 그 저장값이 forward 뒤에 제자리 수정되면 기울기가 틀려진다. PyTorch는 텐서마다 제자리 수정 횟수를 세는 **버전 카운터**(version counter)를 두고, 저장 당시와 버전이 다르면 오류로 알린다.",
                    "`y = x.sigmoid(); y.mul_(2); y.sum().backward()`는 `RuntimeError: one of the variables needed for gradient computation has been modified by an inplace operation`이다. 공식 문서의 표현대로, 이 검사에 걸리지 않았다면 계산된 기울기는 옳다."
                ]
            },
            {
                h: "매번 새 기록: Python 코드가 곧 모델 구조",
                p: [
                    "PyTorch는 실행하면서 기록하고, 그 기록을 backward가 끝나면 버리고, 다음 forward에서 새로 만든다. 이것이 **동적 그래프**(define-by-run, dynamic graph)다. 그래서 `if`·`for`·재귀가 그대로 모델 구조가 된다. 입력에 따라 층 수가 바뀌는 모델도 그냥 Python으로 쓰면 된다.",
                    "기록은 backward가 끝나면 풀리므로 같은 L에 backward를 두 번 부르면 `RuntimeError: Trying to backward through the graph a second time`이다. 정말 필요하면 첫 번째에 `retain_graph=True`를 준다. 보통은 forward를 다시 하는 것이 맞다."
                ]
            },
            {
                h: "실습: 수치 미분으로 내 미분 검증하기",
                p: [
                    "직접 만든 연산(`torch.autograd.Function`)의 backward가 맞는지는 **기울기 검사**(gradient check, gradcheck)로 확인한다. 아주 작은 h로 (f(x + h) − f(x − h)) / 2h를 계산해 autograd 결과와 비교하는 것이다. float64로 해야 반올림 오차에 묻히지 않는다.",
                    "아래 코드는 먼저 실습 화면의 뉴런을 손으로 수치 미분해 autograd와 비교하고(−0.286644055838 대 −0.286644041538), 그다음 맞게 짠 ReLU와 일부러 틀리게 짠 제곱(미분을 2v가 아니라 v로)을 gradcheck에 넣는다. 틀린 쪽은 'Jacobian mismatch'로 잡힌다."
                ],
                code: {
                    lang: "python",
                    title: "check_grad.py",
                    src: `import numpy as np, torch
from torch.autograd import gradcheck

def f(w, b, x=2.0, t=1.0):
    return (np.tanh(w * x + b) - t) ** 2
h = 1e-6
num = (f(0.5 + h, 0.1) - f(0.5 - h, 0.1)) / (2 * h)
w = torch.tensor(0.5, requires_grad=True)
((torch.tanh(w * 2 + 0.1) - 1) ** 2).backward()
print("numeric", num, "autograd", w.grad.item())

class MyRelu(torch.autograd.Function):
    @staticmethod
    def forward(ctx, v):
        ctx.save_for_backward(v)
        return v.clamp(min=0)
    @staticmethod
    def backward(ctx, g):
        (v,) = ctx.saved_tensors
        return g * (v > 0)

class BadSq(torch.autograd.Function):
    @staticmethod
    def forward(ctx, v):
        ctx.save_for_backward(v)
        return v * v
    @staticmethod
    def backward(ctx, g):
        (v,) = ctx.saved_tensors
        return g * v                      # 일부러 틀림: 2 * v 여야 함

D = dict(dtype=torch.double, requires_grad=True)
print("relu", gradcheck(MyRelu.apply, (torch.tensor([-1.0, 0.5, 2.0], **D),)))
try:
    gradcheck(BadSq.apply, (torch.tensor([1.0, 2.0], **D),))
except Exception as e:
    print("bad:", type(e).__name__, str(e).splitlines()[0])

# 출력
# numeric -0.28664405583855856 autograd -0.2866440415382385
# relu True
# bad: GradcheckError Jacobian mismatch for output 0 with respect to input 0,`,
                    note: "ReLU 검사 입력에 0을 넣지 않은 이유: 0에서는 미분이 정의되지 않아 수치 미분과 어긋난다."
                }
            }
        ],
        pitfalls: [
            "zero_grad를 빼먹기 — 기울기가 쌓여 보폭이 점점 커진다. 실습의 '학습 루프: zero_grad 빼먹기'로 확인.",
            "중간 텐서의 `.grad`를 읽기 — 잎이 아니면 None(경고). 필요하면 `retain_grad()`.",
            "평가 코드에 no_grad를 빼먹기 — 결과는 같아도 활성값 메모리를 계속 잡는다.",
            "backward에 필요한 텐서를 제자리 수정 — 버전 카운터 오류. 새 텐서로 계산한다.",
            "로그용으로 손실 텐서를 리스트에 모으기 — 그래프 전체가 메모리에 남는다. `.item()`이나 `.detach()`."
        ],
        summary: [
            "잎 텐서에서 시작한 연산은 grad_fn 사슬로 기록된다.",
            "backward = 거꾸로 돌며 위 기울기 × 지역 미분(VJP).",
            ".grad는 누적. 매 step zero_grad (기본 None으로).",
            "평가·추론은 no_grad/inference_mode로 메모리를 아낀다.",
            "직접 짠 미분은 float64 gradcheck로 검증한다."
        ]
    },

    "torch-train": {
        intro: "모델 정의, 데이터 공급, 손실, 기울기, 갱신, 평가, 저장. 이 일곱 가지가 PyTorch 학습 코드의 뼈대다. 이 글은 `nn.Module`이 파라미터(parameter)를 어떻게 모으는지부터 DataLoader의 배치 만들기, train/eval 모드, 옵티마이저와 학습률 스케줄, 체크포인트(checkpoint)와 재현성까지 차례로 본다. 마지막 실습은 검증 세트와 체크포인트가 붙은 완성본이다.",
        sections: [
            {
                h: "Module: 파라미터를 담는 상자",
                p: [
                    "**모듈**(module, nn.Module)은 `__init__`에서 층을 속성으로 만들고 `forward`에서 계산을 적는 클래스다. 속성으로 둔 `nn.Linear` 같은 하위 모듈과 `nn.Parameter`는 자동으로 등록되어 `model.parameters()`에 잡힌다. 이렇게 잡히는 학습 대상 텐서가 **파라미터**(parameter)다. 일반 Python 리스트에 층을 넣으면 등록되지 않으니 `nn.ModuleList`·`nn.Sequential`을 쓴다.",
                    "`nn.Linear(2, 32)`의 가중치 shape는 (32, 2) — (출력, 입력)이고 forward는 `x @ W.T + b`다. 2 → 32 → 2 MLP의 파라미터는 2·32 + 32 + 32·2 + 2 = 162개다. 모델은 `model(x)`로 부른다. `model.forward(x)`를 직접 부르면 등록된 훅이 건너뛰어진다."
                ]
            },
            {
                h: "손실 고르기: 출력층과 짝 맞추기",
                p: [
                    "**손실 함수**(loss function)는 출력층과 짝을 맞춰 고른다. PyTorch의 분류 손실은 softmax·sigmoid를 안에서 계산하므로 모델은 마지막에 활성함수 없이 점수(logit)를 그대로 내보낸다. 안에서 log와 합쳐 계산해야 수치적으로 안정하기 때문이다."
                ],
                table: {
                    head: ["문제", "모델 마지막", "손실", "정답 형식"],
                    rows: [
                        ["회귀", "Linear(…, 1)", "`MSELoss` / `L1Loss`", "실수, 출력과 같은 shape"],
                        ["이진 분류", "Linear(…, 1) — logit", "`BCEWithLogitsLoss`", "0./1. float"],
                        ["다중 분류", "Linear(…, C) — logit", "`CrossEntropyLoss`", "클래스 번호 int64 (N,)"],
                        ["다중 라벨", "Linear(…, C) — logit", "`BCEWithLogitsLoss`", "0/1 float (N, C)"]
                    ]
                }
            },
            {
                h: "학습 루프 해부",
                p: [
                    "한 step은 다섯 줄이다: `zero_grad` → forward → 손실 → `backward` → `step`. 아래 시퀀스 다이어그램은 DataLoader가 배치를 꺼내 옵티마이저가 갱신하기까지 객체 사이에 무엇이 오가는지 보여 준다. 옵티마이저는 만들 때 받은 `model.parameters()` 목록만 갱신한다는 점에 주의하자. 층을 나중에 붙이면 학습되지 않는다."
                ],
                demo: "lesson"
            },
            {
                h: "Dataset과 DataLoader",
                p: [
                    "map-style Dataset은 `__len__`과 `__getitem__(i)`만 구현하면 된다. 샘플 하나를 돌려주는 방법만 정의하고, 배치 만들기·섞기·병렬 로딩은 **데이터 로더**(DataLoader)가 한다. 기본 **콜레이트 함수**(collate function, collate_fn)는 샘플 목록의 앞에 배치 축을 붙여 쌓고, NumPy 배열과 숫자를 텐서로 바꾼다.",
                    "학습 데이터 전체를 한 번 도는 단위가 **에폭**(epoch)이다. 샘플 1000개를 batch_size 64로 나누면 ⌈1000/64⌉ = 16 배치이고 마지막 배치는 40개다. `drop_last=True`면 15 배치다(실행해 확인). 배치 정규화가 있는 모델은 마지막 작은 배치를 버리는 편이 안전하다."
                ],
                table: {
                    head: ["인자", "뜻", "권장"],
                    rows: [
                        ["`batch_size`", "배치 크기", "메모리가 허락하는 만큼, 학습률과 함께 조정"],
                        ["`shuffle`", "에폭마다 순서 섞기 (기본 False)", "학습 True, 검증·평가 False"],
                        ["`num_workers`", "로딩용 하위 프로세스 수 (0 = 메인 프로세스)", "디스크·전처리가 무거우면 2–8"],
                        ["`pin_memory`", "고정 메모리로 복사해 GPU 전송을 빠르게", "GPU 학습이면 True"],
                        ["`drop_last`", "나누어떨어지지 않는 마지막 배치 버리기", "BatchNorm이면 True"]
                    ]
                },
                tip: "Windows에서 `num_workers > 0`이면 작업자가 스크립트를 새로 import 한다. 학습 코드를 `if __name__ == \"__main__\":` 아래에 둔다(실습 코드처럼)."
            },
            {
                h: "train과 eval 모드",
                p: [
                    "`model.train()`·`model.eval()`은 모듈의 **학습 모드 플래그**(training mode flag, module.training)만 바꾼다. 드롭아웃은 학습 모드에서만 무작위로 끄고, 배치 정규화는 학습 모드에서 배치 통계를, 평가 모드에서 누적 평균을 쓴다. 기울기 기록은 이 플래그와 별개라서, 평가 때는 `model.eval()`과 `torch.no_grad()`를 둘 다 쓴다. 평가가 끝나면 학습 전에 `model.train()`으로 되돌리는 것을 잊지 말자."
                ]
            },
            {
                h: "옵티마이저와 학습률 스케줄",
                p: [
                    "옵티마이저는 파라미터마다 **옵티마이저 상태**(optimizer state)를 가진다. Adam·AdamW는 1차·2차 모멘트(`exp_avg`, `exp_avg_sq`)와 `step`을 저장한다(아래 실습 출력). 그래서 Adam의 상태는 파라미터의 두 배 메모리다. 가중치 감쇠는 Adam의 `weight_decay`(기울기에 더함)보다 AdamW의 분리된 감쇠가 보통 낫다.",
                    "학습률은 고정보다 줄여 가는 편이 잘 수렴한다. `CosineAnnealingLR(opt, T_max=20)`은 20 에폭 동안 학습률을 코사인 곡선으로 0까지 내린다. 스케줄러의 `step()`은 옵티마이저의 `step()` 뒤에, 보통 에폭마다 한 번 부른다."
                ]
            },
            {
                h: "저장, 불러오기, 재현성",
                p: [
                    "저장 단위는 **상태 사전**(state dict)이다. 모델 객체 통째를 pickle 하면 클래스 정의와 파일 경로에 묶이지만, state_dict는 이름 → 텐서 사전이라 어디서든 같은 클래스에 불러올 수 있다. 이어서 학습하려면 모델·옵티마이저 state_dict와 epoch을 묶은 **체크포인트**(checkpoint)를 저장한다.",
                    "`torch.load`는 2.6부터 `weights_only=True`가 기본 동작이다. 텐서와 기본 자료형만 풀고, 임의 객체가 들어 있으면 `UnpicklingError: Weights only load failed`로 거부한다(직접 만든 클래스를 넣은 파일로 확인). pickle은 불러오는 순간 코드를 실행할 수 있으므로, 믿을 수 있는 파일일 때만 이 보호를 끈다.",
                    "재현성은 시드(`torch.manual_seed`, NumPy·random 시드), DataLoader의 셔플 시드(`generator=`), 그리고 `torch.use_deterministic_algorithms(True)`로 높인다. 공식 문서는 플랫폼·버전·CPU/GPU 사이의 완전한 재현은 보장하지 않는다고 적는다."
                ]
            },
            {
                h: "실습: 검증·체크포인트가 붙은 완성본",
                p: [
                    "레슨 코드의 원 안/밖 분류기에 드롭아웃, AdamW, 코사인 스케줄, 검증 세트 평가, 최고 성능 체크포인트를 붙였다. 출력은 torch 2.15.0 CPU로 실행한 결과다. 검증 정확도는 8 에폭에서 0.9775로 가장 높았고, 그 뒤 마지막 에폭은 0.965였다. 마지막 모델이 아니라 가장 좋은 체크포인트를 쓰는 이유다.",
                    "더 해 볼 것: `p=0.1`을 0.5로 올리면 어떻게 되는지, 검증 평가에서 `model.eval()`을 빼면 정확도가 실행마다 흔들리는지(드롭아웃이 켜져 있으므로) 확인해 보자."
                ],
                code: {
                    lang: "python",
                    title: "train_ckpt.py (실행: python train_ckpt.py)",
                    src: `import torch
from torch import nn
from torch.utils.data import TensorDataset, DataLoader

def make_data(n=2000, seed=0):
    g = torch.Generator().manual_seed(seed)
    X = torch.rand(n, 2, generator=g) * 4 - 2
    y = (X.pow(2).sum(1) < 1.5).long()          # 지어낸 데이터: 원 안 = 1
    return X, y

class MLP(nn.Module):
    def __init__(self, h=32, p=0.1):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(2, h), nn.ReLU(), nn.Dropout(p), nn.Linear(h, 2))
    def forward(self, x):
        return self.net(x)

@torch.no_grad()
def evaluate(model, dl, loss_fn):
    model.eval()
    tot, correct, n = 0.0, 0, 0
    for xb, yb in dl:
        out = model(xb)
        tot += loss_fn(out, yb).item() * len(yb)
        correct += (out.argmax(1) == yb).sum().item()
        n += len(yb)
    return tot / n, correct / n

def main():
    torch.manual_seed(0)
    X, y = make_data()
    perm = torch.randperm(len(X))
    tr, va = perm[:1600], perm[1600:]
    train_dl = DataLoader(TensorDataset(X[tr], y[tr]), batch_size=64, shuffle=True)
    val_dl = DataLoader(TensorDataset(X[va], y[va]), batch_size=256)
    model = MLP()
    opt = torch.optim.AdamW(model.parameters(), lr=1e-2, weight_decay=1e-4)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=20)
    loss_fn = nn.CrossEntropyLoss()
    best = 0.0
    for epoch in range(1, 21):
        model.train()
        for xb, yb in train_dl:
            opt.zero_grad()
            loss_fn(model(xb), yb).backward()
            opt.step()
        sched.step()
        vl, va_acc = evaluate(model, val_dl, loss_fn)
        if va_acc > best:
            best = va_acc
            torch.save({"epoch": epoch, "model": model.state_dict(), "opt": opt.state_dict()}, "best.pt")
        if epoch % 5 == 0:
            print(f"epoch {epoch:2d}  val loss {vl:.3f}  val acc {va_acc:.3f}  lr {sched.get_last_lr()[0]:.4f}")
    ck = torch.load("best.pt", weights_only=True)
    m2 = MLP(); m2.load_state_dict(ck["model"])
    print("best epoch", ck["epoch"], "val acc", evaluate(m2, val_dl, loss_fn)[1])
    print("opt state keys", list(ck["opt"]["state"][0].keys()))

if __name__ == "__main__":
    main()

# 출력
# epoch  5  val loss 0.137  val acc 0.943  lr 0.0085
# epoch 10  val loss 0.109  val acc 0.955  lr 0.0050
# epoch 15  val loss 0.096  val acc 0.963  lr 0.0015
# epoch 20  val loss 0.096  val acc 0.965  lr 0.0000
# best epoch 8 val acc 0.9775
# opt state keys ['step', 'exp_avg', 'exp_avg_sq']`,
                    note: "검증 세트로 체크포인트를 고르면 검증 점수는 낙관적으로 치우친다. 최종 성능은 한 번도 안 쓴 시험 세트로 따로 잰다."
                }
            }
        ],
        pitfalls: [
            "CrossEntropyLoss 앞에 softmax를 붙이기 — softmax가 두 번 걸려 학습이 느려진다.",
            "층을 Python 리스트에 담기 — 파라미터가 등록되지 않는다. nn.ModuleList.",
            "옵티마이저를 만든 뒤 층 추가 — 새 층은 갱신되지 않는다.",
            "평가 뒤 `model.train()` 복귀를 잊기 — 드롭아웃이 꺼진 채 학습한다.",
            "모르는 출처의 체크포인트에서 weights_only를 끄기 — pickle은 코드 실행이 가능하다."
        ],
        summary: [
            "Module은 속성으로 둔 층과 Parameter를 자동 등록한다.",
            "분류 손실은 logit을 받는다.",
            "DataLoader가 배치·셔플·병렬 로딩을, collate가 쌓기를 맡는다.",
            "평가 = eval() + no_grad(), 저장 = state_dict, 불러오기 = weights_only."
        ]
    },

    "torch-gpu": {
        intro: "같은 모델이 어떤 코드에서는 GPU를 100% 쓰고 어떤 코드에서는 30%에 머문다. 차이는 대개 모델이 아니라 GPU에 일을 주는 방식에 있다. 이 글은 비동기 실행(asynchronous execution)과 올바른 시간 측정, 데이터 이동, 혼합 정밀도(mixed precision), 메모리가 쓰이는 곳, torch.compile, 프로파일링을 다룬다. 이 PC의 PyTorch는 CPU 빌드라서 실행 수치는 CPU에서 확인 가능한 것만 실었고, GPU 속도는 직접 재 보도록 남겼다.",
        sections: [
            {
                h: "GPU가 빠른 조건",
                p: [
                    "GPU는 수천 개의 연산 유닛으로 같은 일을 동시에 하는 장치다. 큰 행렬곱처럼 데이터 하나당 계산이 많은 일에서 CPU보다 수십 배 빠르다. 반대로 작은 원소별 연산은 계산보다 메모리 읽기·쓰기가 병목이고, 커널 하나를 띄우는 고정 비용(수 µs)이 계산 시간보다 클 수도 있다.",
                    "그래서 느린 학습 코드의 원인은 대개 셋 중 하나다. CPU와 GPU 사이의 잦은 복사, 작은 커널의 연속(Python 루프 안의 작은 연산들), 메모리 부족으로 인한 작은 배치. 아래 절들이 각각을 다룬다."
                ]
            },
            {
                h: "비동기 실행과 올바른 측정",
                p: [
                    "CUDA 연산은 **비동기 실행**(asynchronous execution)이다. `y = x @ x`는 커널을 스트림 대기열에 넣고 곧바로 돌아온다. GPU는 대기열 순서대로 실행하고, CPU는 그동안 다음 줄을 진행한다. 결과가 실제로 필요한 곳, 즉 `.item()`, `print(t)`, `.cpu()`, `torch.cuda.synchronize()`에서 CPU가 기다린다. 이런 곳을 **동기화 지점**(synchronization point)이라 한다.",
                    "그래서 시간을 잴 때는 측정 전후에 `torch.cuda.synchronize()`를 부르거나 CUDA 이벤트를 쓴다(공식 CUDA semantics 문서). 안 그러면 '대기열에 넣은 시간'만 재게 된다. 첫 실행은 커널 선택·메모리 할당·컴파일 비용이 섞이므로 한두 번 버리는 **준비 실행**(warm-up run)을 둔다. `torch.utils.benchmark.Timer`는 동기화와 반복을 알아서 처리한다.",
                    "학습 루프 안의 `.item()`·`print(loss)`도 동기화 지점이다. 배치마다 손실을 찍으면 GPU가 대기열을 미리 채우지 못한다. 손실은 텐서로 모아 두었다가 몇 십 step마다 한 번 꺼내자."
                ],
                demo: "lesson"
            },
            {
                h: "데이터 이동: pin_memory와 non_blocking",
                p: [
                    "OS가 다른 곳으로 옮기지 않도록 잠근 CPU 메모리를 **고정 메모리**(pinned memory, page-locked memory)라 한다. 고정 메모리에서만 GPU로의 비동기 복사가 가능하다. DataLoader에 `pin_memory=True`를 주면 배치를 고정 메모리에 담아 주고, `xb.to('cuda', non_blocking=True)`로 복사하면 복사와 계산이 겹친다."
                ],
                table: {
                    head: ["하지 말 것", "대신"],
                    rows: [
                        ["`torch.ones(n, n).to('cuda')`", "`torch.ones(n, n, device='cuda')`"],
                        ["배치마다 `loss.item()`", "텐서로 모아 가끔 한 번"],
                        ["GPU 텐서를 NumPy로 바꿔 전처리", "가능하면 torch 연산으로 GPU에서"],
                        ["`num_workers=0`에 무거운 전처리", "`num_workers` 2–8 + `pin_memory=True`"]
                    ]
                }
            },
            {
                h: "혼합 정밀도: fp32, bf16, fp16",
                p: [
                    "**혼합 정밀도**(mixed precision)는 연산마다 dtype을 고르는 방식이다. `torch.autocast` 안에서 행렬곱·합성곱은 16 비트로, 합·softmax·손실처럼 오차에 민감한 연산은 32 비트로 계산한다(AMP 문서의 연산 목록). 16 비트 행렬곱은 GPU의 **텐서 코어**(Tensor Core)에서 돌아 처리량이 훨씬 크고, 저장되는 활성값도 절반이 된다. CPU에서 `saved_tensors_hooks`로 세어 보니 autocast bf16에서 저장 텐서가 7.0 MiB → 3.5 MiB였다.",
                    "fp16과 bf16은 같은 16 비트지만 쓰임이 다르다. fp16은 지수가 5 비트라 범위가 좁다. 최댓값이 65504이고, 1e-8은 0으로 사라진다. 그래서 손실에 큰 수 S를 곱해 기울기를 키운 뒤 갱신 전에 다시 나누는 **손실 스케일링**(loss scaling, GradScaler)이 필요하다(Micikevicius et al. 2017). 이 논문은 fp32 원본 가중치를 따로 유지하라고도 권한다. bf16은 지수가 fp32와 같은 8 비트라 범위 문제가 없고 보통 스케일링 없이 쓴다. 대신 가수가 7 비트라 0.1이 0.10009765625가 된다.",
                    "아래 실습은 부동소수점 실습을 bf16으로 연 것이다. 값을 바꿔 가며 fp16·bf16·fp32의 차이를 직접 보자. 이 주제의 기초는 `languages/float` 강의에 있다."
                ],
                table: {
                    head: ["형식", "부호·지수·가수", "최댓값", "eps (1 다음 간격)", "1e-8을 넣으면"],
                    rows: [
                        ["fp32", "1·8·23", "3.40×10³⁸", "1.19×10⁻⁷", "9.99999994×10⁻⁹"],
                        ["bf16", "1·8·7", "3.39×10³⁸", "0.0078125", "1.0012×10⁻⁸"],
                        ["fp16", "1·5·10", "65504", "0.000977", "0 (사라짐)"]
                    ]
                },
                demo: { type: "sim", name: "float", format: "bf16", value: 0.1 }
            },
            {
                h: "저정밀이 언제나 빠르지는 않다",
                p: [
                    "16 비트가 빠른 것은 하드웨어에 16 비트 행렬곱 유닛이 있을 때다. 이 PC의 CPU에서 1024×1024 행렬곱을 `torch.utils.benchmark`로 재 보니 fp32가 16.2 ms, bf16이 2053 ms로 bf16이 약 127배 느렸다. 이 CPU에는 bf16 행렬곱 명령이 없어 느린 경로로 돌기 때문이다. 같은 코드를 텐서 코어가 있는 GPU에서 돌리면 결과가 뒤집힌다.",
                    "교훈은 '정밀도를 낮추면 빨라진다'를 믿지 말고 대상 하드웨어에서 재는 것이다. 메모리 절약(저장 텐서 절반)은 하드웨어와 상관없이 일어나지만, 속도는 하드웨어가 정한다."
                ]
            },
            {
                h: "메모리는 어디에 쓰이나",
                p: [
                    "학습 메모리는 넷으로 나뉜다. 파라미터, 기울기, 옵티마이저 상태, 활성값이다. fp32 + Adam이면 파라미터 하나에 4 (가중치) + 4 (기울기) + 8 (모멘트 2개) = 16 바이트에 활성값이 더해진다. 70 억 파라미터면 활성값을 빼고도 112 GB다. 추론만 한다면 bf16 가중치 14 GB가 기본 비용이다.",
                    "PyTorch의 **캐싱 할당자**(caching memory allocator)는 해제한 GPU 메모리를 드라이버에 돌려주지 않고 다음 할당에 재사용한다. 그래서 nvidia-smi의 사용량은 잘 줄지 않는다. 실제 텐서가 쓰는 양은 `torch.cuda.memory_allocated()`, 할당자가 쥔 양은 `memory_reserved()`로 본다.",
                    "메모리가 부족하면 배치를 줄이고 기울기 누적으로 실효 배치를 유지하거나, 활성값을 저장하지 않고 backward 때 다시 계산하는 `torch.utils.checkpoint`를 쓴다. 어휘가 큰 언어 모델이면 logit 텐서 자체가 크다. 배치 64 × 길이 2048 × 어휘 128256의 fp32 logit은 62.6 GiB다. 2.13의 `nn.LinearCrossEntropyLoss`가 이것을 조각내 계산하는 이유다."
                ]
            },
            {
                h: "torch.compile이 해 주는 일",
                p: [
                    "`torch.compile(f)`는 함수가 처음 불릴 때 TorchDynamo가 Python 바이트코드를 가로채 연산 그래프를 뽑고, AOTAutograd가 backward 그래프를 만들고, Inductor가 GPU 용 Triton 코드나 CPU 용 C++ 코드를 생성한다(Ansel et al. 2024). 이때 여러 원소별 연산을 커널 하나로 합치는 **커널 융합**(kernel fusion)이 일어나 중간 텐서의 메모리 왕복과 커널 실행 횟수가 준다.",
                    "예를 들어 tanh 근사 GELU에 bias를 더하는 함수를 eager로 돌리면 `(x + b)`를 세 번 다시 계산하는 것까지 포함해 add·mul·pow·tanh 커널이 여럿 실행된다(프로파일러로 확인, `F.gelu(x + b, approximate='tanh')`와 값이 같음). 컴파일하면 이것이 커널 하나가 된다.",
                    "컴파일러가 추적하지 못하는 Python 코드(외부 라이브러리 호출, 데이터에 따라 바뀌는 제어 흐름 일부)에서는 그래프가 나뉘는 **그래프 끊김**(graph break)이 생긴다. 끊김이 많거나 입력 shape가 자주 바뀌어 재컴파일이 반복되면 이득이 줄어든다. 또한 Windows에서 CPU 용 컴파일은 C++ 컴파일러(MSVC)가 필요하다. 이 PC에서는 `InductorError: InvalidCxxCompiler: Compiler: cl is not found.`로 실패했다."
                ]
            },
            {
                h: "프로파일링: 추측하지 말고 재기",
                p: [
                    "어디가 느린지는 `torch.profiler`로 확인한다. 아래는 Linear 512×4 + ReLU를 5번 돌린 CPU 프로파일의 상위 행이다. 시간의 78%가 `aten::addmm`(Linear의 행렬곱)이고 ReLU는 약 10%다. GPU 프로파일에서는 `cudaStreamSynchronize`나 `cudaMemcpy`가 크게 보이면 동기화·복사 문제, 아주 짧은 커널이 수천 개면 융합할 거리라는 신호다."
                ],
                code: {
                    lang: "text",
                    title: "prof.key_averages().table(sort_by=\"cpu_time_total\", row_limit=5) 출력 일부 (이 PC)",
                    src: `                  Name    Self CPU %      Self CPU   CPU total %     CPU total  # of Calls
          aten::linear         0.92%      64.700us        88.31%       6.192ms          20
           aten::addmm        78.14%       5.479ms        85.22%       5.976ms          20
            aten::relu         1.55%     109.000us        11.69%     819.900us          20
       aten::clamp_min        10.14%     710.900us        10.14%     710.900us          20
           aten::copy_         6.52%     457.000us         6.52%     457.000us          20
Self CPU time total: 7.012ms`
                }
            },
            {
                h: "실습: CPU에서 확인할 수 있는 것들",
                p: [
                    "GPU가 없어도 정밀도와 메모리의 상당 부분은 CPU에서 확인할 수 있다. 아래 스크립트는 세 형식의 반올림, autocast의 저장 메모리, 그리고 이 CPU에서의 bf16 행렬곱 속도를 잰다. GPU가 있다면 마지막 부분의 `\"cpu\"`를 `\"cuda\"`로 바꾸고 synchronize를 넣어 다시 재 보자. 결과가 뒤집히는 것을 보는 것이 이 실습의 요점이다."
                ],
                code: {
                    lang: "python",
                    title: "precision_cpu.py",
                    src: `import contextlib, torch, torch.utils.benchmark as tb
from torch import nn

for v in [0.1, 1e-8, 70000.0]:
    print(v, torch.tensor(v, dtype=torch.float16).item(), torch.tensor(v, dtype=torch.bfloat16).item())

mlp = nn.Sequential(*[nn.Sequential(nn.Linear(512, 512), nn.ReLU()) for _ in range(4)])
inp = torch.randn(256, 512)
def saved(ctx):
    tot = [0]
    def pack(t): tot[0] += t.numel() * t.element_size(); return t
    with ctx, torch.autograd.graph.saved_tensors_hooks(pack, lambda t: t):
        mlp(inp).sum()
    return tot[0] / 2**20
print("saved fp32", saved(contextlib.nullcontext()), "MiB  autocast bf16",
      saved(torch.autocast("cpu", dtype=torch.bfloat16)), "MiB")

a = torch.randn(1024, 1024)
t32 = tb.Timer("a @ a", globals={"a": a}).blocked_autorange(min_run_time=1)
t16 = tb.Timer("a @ a", globals={"a": a.bfloat16()}).blocked_autorange(min_run_time=1)
print(f"cpu matmul fp32 {t32.median*1e3:.2f} ms  bf16 {t16.median*1e3:.2f} ms")

# 출력 (이 PC)
# 0.1 0.0999755859375 0.10009765625
# 1e-08 0.0 1.0011717677116394e-08
# 70000.0 inf 70144.0
# saved fp32 7.0 MiB  autocast bf16 3.5 MiB
# cpu matmul fp32 16.18 ms  bf16 2052.91 ms`,
                    note: "70000은 fp16에서 inf, bf16에서 70144 — 범위는 bf16, 정밀도는 fp16이 낫다는 것을 숫자 하나로 보여 준다."
                }
            }
        ],
        pitfalls: [
            "synchronize 없이 GPU 시간 재기 — 대기열에 넣는 시간만 측정된다.",
            "학습 루프 안의 `.item()`·print — 매 step 동기화로 GPU가 논다.",
            "fp16에 GradScaler 없이 학습 — 작은 기울기가 0이 되어 학습이 멈춘다.",
            "'저정밀은 빠르다'고 가정 — 하드웨어에 따라 느려질 수 있다(이 CPU에서 bf16 ×127 느림).",
            "nvidia-smi 사용량만 보고 누수라 판단 — 캐싱 할당자. memory_allocated를 본다.",
            "shape가 매번 바뀌는 입력에 torch.compile — 재컴파일만 반복된다."
        ],
        summary: [
            "GPU는 비동기: 측정은 synchronize, 루프 안 동기화 지점은 줄인다.",
            "데이터는 pin_memory + non_blocking, 텐서는 장치에서 바로 만든다.",
            "autocast: matmul은 16 비트, 민감한 연산은 32 비트. fp16은 GradScaler, bf16은 보통 없이.",
            "메모리 = 파라미터 + 기울기 + 옵티마이저 상태 + 활성값.",
            "torch.compile은 커널을 융합한다. 속도 판단은 늘 프로파일러로."
        ]
    }
});
