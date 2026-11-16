LAB.track({
    id: "deep-learning",
    name: "딥러닝",
    icon: "◉",
    color: "#f472b6",
    tagline: "뉴런 하나에서 Transformer까지 — 숫자가 학습되는 과정",
    trends: [
        {
            title: "MoE 가 대형·중형 모델의 기본 구조로",
            when: "2024–2026",
            points: [
                "DeepSeek-V4(2026): Pro 1.6T 중 토큰당 49B, Flash 284B 중 13B 만 활성 · 1M 토큰 문맥",
                "중형도 MoE: Gemma 4 는 26B 중 3.8B, Nemotron 3 Super 는 120.6B 중 12.7B 활성",
                "라우터(router)가 토큰마다 top-k 전문가(expert)만 실행 → 연산은 **활성 파라미터**(active parameters) 기준",
                "메모리는 **전체 파라미터**(total parameters) 기준 · 부하 균형(load balancing)과 전문가 간 통신이 과제"
            ],
            refs: [
                { title: "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer", by: "Shazeer et al.", year: 2017, url: "https://arxiv.org/abs/1701.06538", kind: "paper" },
                { title: "DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence", by: "DeepSeek-AI", year: 2026, url: "https://arxiv.org/abs/2606.19348", kind: "paper" },
                { title: "Gemma 4 Technical Report", by: "Gemma Team", year: 2026, url: "https://arxiv.org/abs/2607.02770", kind: "paper" }
            ]
        },
        {
            title: "FP8 → FP4 저비트(low-bit) 학습·추론(inference)",
            when: "2025–2026",
            points: [
                "NVFP4: 4bit(E2M1) 값 16개 블록마다 E4M3 스케일(scale) + 텐서별 FP32 스케일 · MXFP4 는 32개 블록",
                "12B 모델을 10T 토큰 NVFP4 로 사전학습(pretraining) → FP8 기준선(baseline)에 근접 (2025)",
                "Nemotron 3 Super(2026-04): NVFP4 로 사전학습한 120B 하이브리드 MoE 를 공개",
                "DeepSeek-V4: 사후 학습에서 MoE 전문가 가중치를 FP4 QAT(quantization-aware training)로"
            ],
            refs: [
                { title: "FP8 Formats for Deep Learning", by: "Micikevicius et al.", year: 2022, url: "https://arxiv.org/abs/2209.05433", kind: "paper" },
                { title: "Pretraining Large Language Models with NVFP4", by: "NVIDIA", year: 2025, url: "https://arxiv.org/abs/2509.25149", kind: "paper" },
                { title: "Nemotron 3 Super: Open, Efficient Mixture-of-Experts Hybrid Mamba-Transformer Model for Agentic Reasoning", by: "NVIDIA", year: 2026, url: "https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf", kind: "paper" }
            ]
        },
        {
            title: "희소·압축 어텐션(sparse attention)과 1M 토큰 문맥(long context)",
            when: "2025–2026",
            points: [
                "DeepSeek-V3.2 DSA(2025-12): 인덱서(indexer)가 고른 top-k 토큰(token)에만 어텐션",
                "DeepSeek-V4: CSA(KV 4× 압축 + top-k 선택)와 HCA(128× 압축)를 층마다 교대",
                "→ 1M 문맥에서 V3.2 대비 KV 캐시(KV cache) 10%, 토큰당 연산 27%",
                "Gemma 4: 슬라이딩 윈도우(sliding window) 층 5 : 전역 층 1 · KV 캐시를 줄이는 설계가 기본값"
            ],
            refs: [
                { title: "DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models", by: "DeepSeek-AI", year: 2025, url: "https://arxiv.org/abs/2512.02556", kind: "paper" },
                { title: "DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence", by: "DeepSeek-AI", year: 2026, url: "https://arxiv.org/abs/2606.19348", kind: "paper" },
                { title: "Gemma 4 Technical Report", by: "Gemma Team", year: 2026, url: "https://arxiv.org/abs/2607.02770", kind: "paper" }
            ]
        },
        {
            title: "상태공간모델(state space model, SSM)·선형 어텐션 하이브리드(hybrid)",
            when: "2025–2026",
            points: [
                "Nemotron 3 Super(2026): 88층 대부분이 Mamba-2 + MoE · 소수 어텐션(attention) 층은 전역 '앵커'",
                "Kimi Linear: Gated DeltaNet 을 확장한 선형 어텐션(linear attention) KDA + MLA 혼합",
                "→ KV 캐시 최대 75%↓, 1M 문맥 디코딩 최대 6× · 고정 크기 상태라 긴 생성에서 처리량(throughput)↑"
            ],
            refs: [
                { title: "Mamba: Linear-Time Sequence Modeling with Selective State Spaces", by: "Gu et al.", year: 2023, url: "https://arxiv.org/abs/2312.00752", kind: "paper" },
                { title: "Kimi Linear: An Expressive, Efficient Attention Architecture", by: "Kimi Team", year: 2025, url: "https://arxiv.org/abs/2510.26692", kind: "paper" },
                { title: "Nemotron 3 Super: Open, Efficient Mixture-of-Experts Hybrid Mamba-Transformer Model for Agentic Reasoning", by: "NVIDIA", year: 2026, url: "https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf", kind: "paper" }
            ]
        }
    ],
    lessons: [
        {
            id: "perceptron",
            title: "퍼셉트론과 활성함수",
            level: 1,
            mins: 12,
            checked: "2026-11-16",
            key: [
                "뉴런(neuron) = 가중합(weighted sum) `z = w·x + b` → 활성함수(activation function) `a = f(z)`",
                "단일 퍼셉트론(perceptron)의 경계는 **직선 하나** · XOR 은 못 푼다",
                "은닉층(hidden layer) + 비선형(nonlinear) 활성 → 휘어진 결정 경계(decision boundary)",
                "활성함수가 없으면 몇 층을 쌓아도 **선형 변환**(linear transformation) 하나"
            ],
            concepts: [
                { term: "가중치 · 편향", en: "Weight · Bias", def: "`w` = 입력별 중요도, `b` = 경계를 평행 이동" },
                { term: "Sigmoid", def: "`1/(1+e^−z)` · 0~1 출력 · 양 끝에서 기울기 ≈ 0 (포화)" },
                { term: "tanh", en: "Hyperbolic tangent", def: "−1~1 출력 · 0 중심이라 sigmoid 보다 학습이 잘 됨 · 여전히 포화" },
                { term: "ReLU", en: "Rectified Linear Unit", def: "`max(0, z)` · 계산 싸고 양수 기울기 1 · 음수 영역은 기울기 0" },
                { term: "결정 경계", en: "Decision boundary", def: "출력이 임계값(sigmoid 0.5)이 되는 입력들의 집합" }
            ],
            demo: { type: "sim", name: "nn" },
            code: [
                {
                    lang: "python",
                    title: "XOR 을 푸는 2-3-1 MLP (PyTorch)",
                    src: `import torch, torch.nn as nn

torch.manual_seed(0)
X = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])
y = torch.tensor([[0.], [1.], [1.], [0.]])           # XOR

model = nn.Sequential(
    nn.Linear(2, 3),     # 은닉 뉴런 3개 (데모와 같은 2-3-1)
    nn.Tanh(),           # 비선형이 있어야 휘어진 경계
    nn.Linear(3, 1),     # 로짓 (sigmoid 는 손실 안에서)
)
loss_fn = nn.BCEWithLogitsLoss()
opt = torch.optim.Adam(model.parameters(), lr=0.05)

for step in range(1000):
    opt.zero_grad()
    loss = loss_fn(model(X), y)
    loss.backward()
    opt.step()

with torch.no_grad():
    print(torch.sigmoid(model(X)).round().flatten())  # 성공하면 tensor([0., 1., 1., 0.])`,
                    note: "은닉 3개는 빠듯해 시드(seed)에 따라 가끔 실패 · 8개로 늘리면 안정적"
                },
                {
                    lang: "python",
                    title: "퍼셉트론 학습 규칙 (numpy)",
                    src: `import numpy as np

X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y = np.array([0, 0, 0, 1])                  # AND: 직선 하나로 분리 가능
w, b, lr = np.zeros(2), 0.0, 0.1

for epoch in range(20):
    for xi, ti in zip(X, y):
        pred = int(w @ xi + b > 0)          # 계단 함수
        w += lr * (ti - pred) * xi          # 틀렸을 때만 갱신
        b += lr * (ti - pred)

print(w, b, [int(w @ xi + b > 0) for xi in X])   # [0, 0, 0, 1]
# y 를 XOR [0, 1, 1, 0] 으로 바꾸면 영원히 수렴하지 않음`,
                    note: "선형 분리 가능(linearly separable) 데이터면 유한 번 안에 수렴 · 퍼셉트론 수렴 정리(perceptron convergence theorem)"
                }
            ],
            optimize: [
                {
                    title: "sigmoid + `BCELoss` → `BCEWithLogitsLoss`",
                    before: { lang: "python", src: `prob = torch.sigmoid(model(x))
loss = nn.BCELoss()(prob, y)      # 로짓이 크면 log(0) 근처 → 불안정` },
                    after: { lang: "python", src: `logit = model(x)                  # sigmoid 를 손실 안으로
loss = nn.BCEWithLogitsLoss()(logit, y)   # log-sum-exp 로 수치 안정` },
                    gain: "수치 안정 · 연산 1회 절약"
                },
                {
                    title: "샘플 루프 → 행렬곱(matrix multiplication) 한 번",
                    before: { lang: "python", src: `out = []
for x in X:                       # 샘플마다 파이썬 루프
    out.append(np.tanh(W @ x + b))
out = np.stack(out)` },
                    after: { lang: "python", src: `out = np.tanh(X @ W.T + b)        # (N, in) @ (in, hidden) · BLAS 한 번` },
                    gain: "보통 수십× 이상 (N 이 클수록)"
                }
            ],
            glossary: [
                { term: "퍼셉트론", en: "Perceptron", def: "가중합 + 계단 함수로 이진 분류하는 가장 단순한 뉴런" },
                { term: "활성함수", en: "Activation function", def: "뉴런 출력에 비선형성을 주는 함수 · ReLU, GELU, tanh 등" },
                { term: "다층 퍼셉트론", en: "Multi-Layer Perceptron (MLP)", def: "완전연결층 + 활성함수를 여러 층 쌓은 신경망" },
                { term: "로짓", en: "Logit", def: "sigmoid/softmax 를 거치기 전의 원시 출력값" },
                { term: "포화", en: "Saturation", def: "입력 절댓값이 커서 활성함수 기울기가 0 에 가까운 구간" },
                { term: "범용 근사 정리", en: "Universal approximation theorem", def: "은닉층 하나라도 뉴런이 충분하면 연속 함수를 근사 가능" }
            ],
            quiz: [
                { q: "단일 퍼셉트론이 XOR 을 못 푸는 이유는?", options: ["가중치가 너무 작아서", "학습률이 너무 커서", "경계가 직선 하나라서", "편향 항이 없어서"], a: 2, why: "XOR 의 두 클래스는 직선 하나로 못 나눔 · 가중치·학습률·편향을 바꿔도 경계는 여전히 직선" },
                { q: "활성함수 없이 `Linear` 3개를 쌓으면?", options: ["선형 변환 하나와 같다", "3차 다항식 함수가 된다", "XOR 도 풀 수 있다", "기울기 소실이 생긴다"], a: 0, why: "W₃W₂W₁ 이 행렬 하나로 접힘 · 곱셈만 있고 비선형이 없으니 다항식도 아님" },
                { q: "`sigmoid(0)` 의 값은?", options: ["0", "1", "0.25", "0.5"], a: 3, why: "1 / (1 + e⁰) = 1/2 · 0.25 는 이 점의 미분값 σ(1 − σ)" },
                { q: "ReLU 에서 z = −2 일 때 기울기는?", options: ["1", "0", "−2", "0.5"], a: 1, why: "음수 영역은 출력 0, 기울기 0 · 양수 영역에서만 1" },
                { q: "이진 분류 출력층으로 권장되는 조합은?", options: ["ReLU + `MSELoss`", "softmax + `L1Loss`", "로짓 + `BCEWithLogitsLoss`", "sigmoid + `BCEWithLogitsLoss`"], a: 2, why: "sigmoid 와 log 를 한 번에 계산해 안정 · 앞에 sigmoid 를 또 두면 이중 sigmoid 로 확률이 0.5~0.73 에 갇힘" },
                { type: "num", q: "`x = (1, 2)`, `w = (0.8, −0.2)`, `b = 0.1` 인 뉴런의 sigmoid 출력은? (소수 셋째 자리)", answer: 0.622, tol: 0.001, why: "z = 0.8 − 0.4 + 0.1 = 0.5 → 1 / (1 + e^−0.5) ≈ 0.622" },
                { type: "num", q: "`nn.Linear(784, 128)` 의 파라미터 수 (bias 포함)는?", answer: 100480, why: "784·128 = 100,352 가중치 + bias 128" },
                { type: "text", q: "출력되는 shape 은?", code: { lang: "python", src: "import numpy as np\nX = np.zeros((32, 784))     # 배치 32\nW = np.zeros((784, 128))\nprint((X @ W).shape)" }, answer: ["(32, 128)", "32, 128"], why: "(N, in) @ (in, out) = (N, out) · 배치 전체가 행렬곱 한 번" },
                { type: "order", q: "퍼셉트론 학습 규칙으로 샘플 하나를 처리하는 순서", items: ["가중합 z = w·x + b", "계단 함수로 예측", "오차 t − pred 계산", "w, b 에 lr × 오차 반영"], why: "맞히면 오차 0 이라 갱신 없음 · 틀렸을 때만 경계가 움직임" }
            ],
            refs: [
                { title: "The perceptron: A probabilistic model for information storage and organization in the brain", by: "Rosenblatt", year: 1958, url: "https://doi.org/10.1037/h0042519", kind: "paper" },
                { title: "Deep Learning", by: "Goodfellow et al.", year: 2016, url: "https://www.deeplearningbook.org/", kind: "book" },
                { title: "BCEWithLogitsLoss", by: "PyTorch", url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.BCEWithLogitsLoss.html", kind: "doc" }
            ]
        },
        {
            id: "backprop",
            title: "역전파",
            level: 2,
            mins: 14,
            pre: ["deep-learning/perceptron"],
            checked: "2026-11-16",
            key: [
                "순전파(forward pass)로 값을 계산·**저장**, 역전파(backpropagation)로 기울기(gradient)를 뒤에서부터",
                "연쇄 법칙(chain rule): 노드마다 **지역 기울기(local gradient)**를 곱해 나가면 끝",
                "덧셈은 기울기를 그대로, 곱셈은 **상대 입력**을 곱해 전달",
                "학습 메모리의 주범은 저장된 활성값(activation)"
            ],
            concepts: [
                { term: "계산 그래프", en: "Computational graph", def: "연산을 노드로 · 순전파 중 기록 → 역전파 때 거꾸로 순회" },
                { term: "연쇄 법칙", en: "Chain rule", def: "`∂L/∂w = ∂L/∂u · ∂u/∂z · ∂z/∂w`" },
                { term: "지역 기울기", en: "Local gradient", def: "각 노드는 자기 입력에 대한 미분만 알면 됨 (+ → 1, × → 상대 입력)" },
                { term: "기울기 shape", en: "Gradient shape", def: "`∂L/∂W` 는 `W` 와 같은 shape · `dW = 입력ᵀ @ 출력기울기`" },
                { term: "비용", en: "Computational cost", def: "역방향 연산량 ≈ 순방향의 약 2배 · 모든 파라미터 기울기를 한 번에" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "in", label: "입력", sub: "x=2, w=3, b=1", x: 0, y: 0 },
                    { id: "z", label: "z = w·x", sub: "= 6", x: 1, y: 0 },
                    { id: "u", label: "u = z + b", sub: "= 7", x: 2, y: 0 },
                    { id: "L", label: "L=(u−y)²", sub: "y=10 → L = 9", x: 3, y: 0 },
                    { id: "du", label: "∂L/∂u", sub: "2(u−y) = −6", x: 3, y: 1 },
                    { id: "dz", label: "∂L/∂z, ∂b", sub: "−6 × 1 = −6", x: 2, y: 1 },
                    { id: "dw", label: "∂L/∂w", sub: "−6 × x = −12", x: 1, y: 1 },
                    { id: "upd", label: "w 갱신", sub: "3 + 0.01·12 = 3.12", x: 0, y: 1 }
                ],
                edges: [
                    { from: "in", to: "z", label: "×" },
                    { from: "z", to: "u", label: "+b" },
                    { from: "u", to: "L", label: "−y, ²" },
                    { from: "L", to: "du", label: "backward" },
                    { from: "du", to: "dz", label: "× 1" },
                    { from: "dz", to: "dw", label: "× x" },
                    { from: "dw", to: "upd", label: "−η" }
                ],
                steps: [
                    { on: ["in"], text: "입력 x=2, 파라미터 w=3, b=1 · 정답 y=10" },
                    { on: ["in>z", "z"], text: "순전파: z = w·x = 6 · 각 노드는 값을 **저장**해 둠" },
                    { on: ["z>u", "u"], text: "u = z + b = 7" },
                    { on: ["u>L", "L"], text: "손실(loss) L = (7 − 10)² = 9 · 이제 거꾸로 간다" },
                    { on: ["L>du", "du"], text: "역전파 시작: ∂L/∂u = 2(u − y) = −6" },
                    { on: ["du>dz", "dz"], text: "덧셈 노드: 기울기를 그대로 전달 → ∂L/∂z = ∂L/∂b = −6" },
                    { on: ["dz>dw", "dw"], text: "곱셈 노드: **상대 입력** x 를 곱함 → ∂L/∂w = −6 × 2 = −12" },
                    { on: ["dw>upd", "upd"], text: "경사하강(gradient descent) `w ← w − η·∂L/∂w` → 3.12 · 다시 계산하면 L ≈ 7.6 으로 감소" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "데모와 같은 그래프를 autograd 로",
                    src: `import torch

x, y = torch.tensor(2.0), torch.tensor(10.0)
w = torch.tensor(3.0, requires_grad=True)
b = torch.tensor(1.0, requires_grad=True)

z = w * x            # 6
u = z + b            # 7
L = (u - y) ** 2     # 9

L.backward()                     # 그래프를 거꾸로 · 연쇄 법칙
print(w.grad, b.grad)            # tensor(-12.) tensor(-6.)

with torch.no_grad():            # 갱신은 그래프에 기록하지 않음
    w -= 0.01 * w.grad           # 3.12
    b -= 0.01 * b.grad           # 1.06
w.grad = None                    # 기울기는 누적되므로 비움
b.grad = None`,
                    note: "`.grad` 는 덮어쓰지 않고 **더함** · 그래서 매 스텝 `zero_grad()`"
                },
                {
                    lang: "python",
                    title: "2층 MLP 역전파를 손으로 (numpy)",
                    src: `import numpy as np
rng = np.random.default_rng(0)
X = rng.normal(size=(64, 3))
Y = X @ np.array([[1.0], [-2.0], [0.5]])     # 맞춰야 할 목표
W1 = rng.normal(size=(3, 8)) * 0.5
W2 = rng.normal(size=(8, 1)) * 0.5

for step in range(300):
    # 순전파 · 중간값 저장
    H = X @ W1                 # (64, 8)
    A = np.maximum(H, 0)       # ReLU
    P = A @ W2                 # (64, 1)
    loss = ((P - Y) ** 2).mean()
    # 역전파 · 뒤에서부터 연쇄 법칙
    dP = 2 * (P - Y) / len(X)  # ∂loss/∂P
    dW2 = A.T @ dP             # (8, 1) = W2 와 같은 shape
    dA = dP @ W2.T             # (64, 8)
    dH = dA * (H > 0)          # ReLU 미분: 0 또는 1
    dW1 = X.T @ dH             # (3, 8)
    W1 -= 0.05 * dW1
    W2 -= 0.05 * dW2

print(round(loss, 4))          # 5.7 → 0.001 수준`,
                    note: "역전파에 `H`, `A` 가 다시 쓰임 → 순전파 값을 버리면 안 되는 이유"
                }
            ],
            optimize: [
                {
                    title: "추론(inference) 땐 그래프 기록 끄기",
                    before: { lang: "python", src: `model.eval()
pred = model(x)          # autograd 그래프 + 중간 활성값을 계속 보관` },
                    after: { lang: "python", src: `model.eval()
with torch.inference_mode():   # 그래프·버전 추적 생략
    pred = model(x)` },
                    gain: "추론 메모리↓ · 약간 빠름"
                },
                {
                    title: "Activation checkpointing: 메모리 ↔ 재계산(recomputation)",
                    before: { lang: "python", src: `def forward(self, x):
    for blk in self.blocks:
        x = blk(x)       # 모든 블록의 활성값을 backward 까지 보관
    return x` },
                    after: { lang: "python", src: `from torch.utils.checkpoint import checkpoint

def forward(self, x):
    for blk in self.blocks:
        x = checkpoint(blk, x, use_reentrant=False)  # 경계만 저장, backward 때 재계산
    return x` },
                    gain: "활성 메모리 크게↓ · 순전파 1회분 추가 연산",
                    note: "GPU 메모리가 모자라 배치를 못 키울 때 쓰는 표준 기법"
                }
            ],
            glossary: [
                { term: "역전파", en: "Backpropagation", def: "출력 손실의 기울기를 연쇄 법칙으로 입력 쪽까지 전달하는 알고리즘" },
                { term: "연쇄 법칙", en: "Chain rule", def: "합성함수의 미분 = 각 단계 미분의 곱" },
                { term: "자동 미분", en: "Automatic differentiation", def: "연산을 기록해 기울기를 정확히 자동 계산 · PyTorch `autograd`" },
                { term: "계산 그래프", en: "Computational graph", def: "텐서 연산을 노드·엣지로 표현한 DAG" },
                { term: "기울기 소실", en: "Vanishing gradient", def: "층을 거칠수록 1 보다 작은 값이 곱해져 앞쪽 기울기가 0 에 수렴" }
            ],
            quiz: [
                { q: "`z = w·x` 에서 ∂z/∂w 는?", options: ["w", "1", "x", "w·x"], a: 2, why: "곱셈 노드의 지역 기울기 = 상대 입력 · w 는 ∂z/∂x 쪽" },
                { q: "`u = z + b` 에 상류 기울기 g 가 들어오면 z 로 전달되는 값은?", options: ["g", "g·b", "0", "2g"], a: 0, why: "덧셈의 지역 기울기는 1 · b 를 곱하는 건 곱셈 노드일 때" },
                { q: "큰 배치 학습에서 GPU 메모리를 가장 많이 차지하기 쉬운 것은?", options: ["손실 스칼라 값", "학습률 스케줄", "가중치의 기울기", "저장된 활성값"], a: 3, why: "활성값은 배치 × 길이 × 층 수에 비례 · 기울기는 가중치와 같은 크기라 배치와 무관" },
                { q: "`opt.zero_grad()` 를 빼먹으면?", options: ["매 스텝 RuntimeError 가 발생", "기울기가 누적돼 갱신이 틀어짐", "기울기가 0 이라 학습이 멈춤", "가중치가 0 으로 다시 초기화됨"], a: 1, why: "`.grad` 는 덮어쓰지 않고 더함 · 에러 없이 조용히 틀어지는 게 문제" },
                { q: "sigmoid 를 깊게 쌓으면 기울기가 소실되기 쉬운 이유는?", options: ["미분 최댓값이 0.25 라서", "출력이 항상 음수라서", "sigmoid 가 비선형이라서", "학습률이 고정이라서"], a: 0, why: "층마다 ≤ 0.25 가 곱해져 10 층이면 ≤ 9.5e−7 배 · 비선형 자체는 ReLU 도 마찬가지" },
                { type: "num", q: "데모 그래프(x = 2, w = 3, b = 1, y = 10, `L = (w·x + b − y)²`)에서 ∂L/∂w 는?", answer: -12, why: "∂L/∂u = 2(7 − 10) = −6 → 곱셈 노드에서 × x = −12" },
                { type: "num", q: "같은 그래프에서 학습률 0.01 로 w 와 b 를 **둘 다** 한 번 갱신하면 새 손실 L 은?", answer: 7.29, tol: 0.01, why: "w = 3.12, b = 1.06 → u = 7.30 → (7.30 − 10)² = 7.29 · w 만 갱신하면 7.62" },
                { type: "num", q: "배치 32, 길이 2048, 폭 4096 인 bf16 활성값 텐서 하나는 몇 MiB?", answer: 512, unit: "MiB", why: "32·2048·4096·2 byte = 2²⁹ byte · 층마다 이런 텐서를 여러 개 저장" },
                { type: "text", q: "가중치 기울기 `dW` 의 shape 은?", code: { lang: "python", src: "import numpy as np\nX  = np.zeros((64, 3))     # 층 입력 (N, in)\ndY = np.zeros((64, 8))     # 상류 기울기 (N, out)\nprint((X.T @ dY).shape)" }, answer: ["(3, 8)", "3, 8"], why: "dW = Xᵀ @ dY 는 W 와 같은 (in, out) · 배치 축 N 은 합쳐져 사라짐" },
                { type: "order", q: "학습 한 스텝의 순서 (`zero_grad` 제외)", items: ["순전파로 예측", "손실 계산", "`loss.backward()`", "`opt.step()`"], why: "backward 가 순전파 때 저장한 값을 써서 .grad 를 채우고, step 이 그 기울기로 갱신" }
            ],
            refs: [
                { title: "Learning representations by back-propagating errors", by: "Rumelhart et al.", year: 1986, url: "https://doi.org/10.1038/323533a0", kind: "paper" },
                { title: "Automatic differentiation in machine learning: a survey", by: "Baydin et al.", year: 2015, url: "https://arxiv.org/abs/1502.05767", kind: "paper" },
                { title: "Training Deep Nets with Sublinear Memory Cost", by: "Chen et al.", year: 2016, url: "https://arxiv.org/abs/1604.06174", kind: "paper" },
                { title: "Scaling Laws for Neural Language Models", by: "Kaplan et al.", year: 2020, url: "https://arxiv.org/abs/2001.08361", kind: "paper" }
            ]
        },
        {
            id: "optimizer",
            title: "경사하강과 옵티마이저",
            level: 2,
            mins: 14,
            pre: ["deep-learning/backprop"],
            checked: "2026-11-16",
            key: [
                "경사하강(gradient descent): `θ ← θ − η·∇L` · 기울기(gradient) 반대로 한 걸음",
                "학습률(learning rate) η: 크면 진동(oscillation)·발산(divergence), 작으면 너무 느림",
                "Momentum: 속도(velocity)를 누적 → 협곡(ravine)에서 진동↓, 진행↑",
                "Adam: 1차·2차 모멘트(moment)로 **파라미터별** 보폭(step size) 조절"
            ],
            concepts: [
                { term: "미니배치 SGD", en: "Mini-batch Stochastic Gradient Descent (SGD)", def: "일부 샘플로 기울기를 추정 · 노이즈가 있지만 빠르고 일반화에 도움" },
                { term: "Momentum", def: "`v ← βv + g`, `θ ← θ − η·v` · 일관된 방향은 가속, 진동은 상쇄" },
                { term: "Adam", en: "Adaptive Moment Estimation", def: "`m`=기울기 평균, `v`=기울기² 평균 · `θ −= η·m̂/(√v̂ + ε)`" },
                { term: "편향 보정", en: "Bias correction", def: "m, v 가 0 에서 시작해 작게 치우침 → `m̂ = m/(1−β₁ᵗ)`" },
                { term: "LR 스케줄", en: "Learning-rate (LR) schedule", def: "warmup 으로 천천히 올리고 cosine 등으로 줄여 마무리" }
            ],
            demo: { type: "sim", name: "gd" },
            code: [
                {
                    lang: "python",
                    title: "Adam 을 직접 (데모와 같은 협곡 손실)",
                    src: `import numpy as np

f    = lambda p: 0.1 * p[0]**2 + 2 * p[1]**2     # x 방향 완만, y 방향 가파름
grad = lambda p: np.array([0.2 * p[0], 4 * p[1]])

p = np.array([-5.4, 2.4])
m = np.zeros(2); v = np.zeros(2)
lr, b1, b2, eps = 0.2, 0.9, 0.999, 1e-8

for t in range(1, 201):
    g = grad(p)
    m = b1 * m + (1 - b1) * g          # 1차 모멘트: 방향
    v = b2 * v + (1 - b2) * g * g      # 2차 모멘트: 크기
    m_hat = m / (1 - b1**t)            # 편향 보정 (초기 0 쪽 치우침)
    v_hat = v / (1 - b2**t)
    p -= lr * m_hat / (np.sqrt(v_hat) + eps)   # 파라미터별 보폭

print(p.round(3), f(p))                # 원점 (0, 0) 근처`,
                    note: "`m̂/√v̂` 는 기울기 크기와 무관하게 ≈ ±1 · 완만한 x 축도 같은 보폭으로 전진"
                },
                {
                    lang: "python",
                    title: "AdamW + warmup + cosine (PyTorch)",
                    src: `import torch
import torch.nn.functional as F
from torch.optim.lr_scheduler import LinearLR, CosineAnnealingLR, SequentialLR

model = torch.nn.Sequential(torch.nn.Linear(20, 64), torch.nn.ReLU(), torch.nn.Linear(64, 1))
opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)
warm, total = 100, 1000
sched = SequentialLR(opt, [
    LinearLR(opt, start_factor=0.01, total_iters=warm),   # warmup: lr 1% → 100%
    CosineAnnealingLR(opt, T_max=total - warm),           # 이후 cosine 으로 감소
], milestones=[warm])

for step in range(total):
    x, y = torch.randn(32, 20), torch.randn(32, 1)        # 미니배치
    loss = F.mse_loss(model(x), y)
    opt.zero_grad(set_to_none=True)
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)  # 폭주 방지
    opt.step()
    sched.step()                                          # 스텝마다 lr 갱신`,
                    note: "순서: `backward` → (clip) → `opt.step()` → `sched.step()`"
                }
            ],
            optimize: [
                {
                    title: "Gradient accumulation: 큰 배치(batch)를 작은 메모리로",
                    before: { lang: "python", src: `for x, y in loader:                  # batch 256 → GPU 메모리 부족
    loss = loss_fn(model(x), y)
    opt.zero_grad(); loss.backward(); opt.step()` },
                    after: { lang: "python", src: `accum = 4                            # micro-batch 64 × 4 = 유효 256
for i, (x, y) in enumerate(loader):
    loss = loss_fn(model(x), y) / accum   # 평균이 되도록 나눔
    loss.backward()                       # .grad 에 누적
    if (i + 1) % accum == 0:
        opt.step(); opt.zero_grad()` },
                    gain: "활성 메모리 ~1/4 · 같은 유효 배치",
                    note: "BatchNorm 통계는 micro-batch 기준이라 완전히 같진 않음"
                },
                {
                    title: "AdamW fused 구현",
                    before: { lang: "python", src: `opt = torch.optim.AdamW(model.parameters(), lr=3e-4)
# 파라미터 텐서마다 여러 커널 실행` },
                    after: { lang: "python", src: `opt = torch.optim.AdamW(model.parameters(), lr=3e-4, fused=True)
# 갱신 수식을 하나로 묶은 커널 (GPU)` },
                    gain: "옵티마이저 스텝 시간↓ (텐서가 많을수록)"
                }
            ],
            glossary: [
                { term: "학습률", en: "Learning rate", def: "기울기 방향으로 한 번에 이동하는 보폭 η" },
                { term: "확률적 경사하강", en: "Stochastic Gradient Descent (SGD)", def: "미니배치 기울기로 파라미터를 갱신하는 기본 옵티마이저" },
                { term: "모멘텀", en: "Momentum", def: "과거 기울기를 지수 평균한 속도로 이동 · 진동 감소" },
                { term: "Adam", en: "Adaptive Moment Estimation", def: "1·2차 모멘트로 파라미터별 학습률을 자동 조절" },
                { term: "Warmup", en: "Learning-rate warmup", def: "초반 몇 스텝 동안 학습률을 0 근처에서 점점 올림 · 초기 불안정 방지" },
                { term: "기울기 클리핑", en: "Gradient clipping", def: "기울기 노름이 임계값을 넘으면 비율대로 줄임 · 폭주 방지" }
            ],
            quiz: [
                { q: "협곡 모양 손실에서 큰 학습률의 SGD 가 보이는 현상은?", options: ["한 스텝 만에 최솟값 도달", "가파른 축에서 지그재그·발산", "완만한 축 방향으로만 미끄러짐", "기울기가 0 이 되어 그대로 멈춤"], a: 1, why: "곡률이 큰 축에서 보폭이 커 반대편으로 튐 · 완만한 축은 오히려 느리게 기어감" },
                { q: "Adam 의 2차 모멘트 `v` 의 역할은?", options: ["갱신의 이동 방향을 정함", "warmup 학습률 스케줄을 정함", "파라미터별 기울기 크기로 나눔", "매 스텝 가중치 감쇠를 적용"], a: 2, why: "`m̂/√v̂` · 기울기가 큰 축은 작게, 작은 축은 크게 · 방향은 1차 모멘트 m 이 정함" },
                { q: "Adam 에 편향 보정이 필요한 이유는?", options: ["m, v 가 0 에서 출발해 작게 치우쳐서", "warmup 이 없으면 초반 학습률이 너무 커서", "기울기가 음수면 √v 가 정의되지 않아서", "미니배치가 작아 기울기 노이즈가 커서"], a: 0, why: "t 가 작을 때 `1 − βᵗ` 로 나눠 보정 · v 는 제곱 평균이라 항상 ≥ 0" },
                { q: "Adam 계열 학습 초반에 warmup 을 쓰는 주된 이유로 꼽히는 것은?", options: ["GPU 메모리 사용량을 줄이려고", "과적합 시점을 뒤로 늦추려고", "초반 v 추정이 불안정해서", "배치 정규화 통계를 먼저 모으려고"], a: 2, why: "표본이 적은 초반엔 적응형 학습률의 분산이 큼 (Liu et al. 2019) · 메모리·과적합과는 무관" },
                { q: "`clip_grad_norm_` 은 언제 호출해야 하나?", options: ["loss 계산 직후, backward() 전", "backward() 와 step() 사이", "opt.step() 후, 다음 배치 전", "zero_grad() 직후, 순전파 전"], a: 1, why: "backward 가 채운 .grad 를 갱신 직전에 줄여야 함 · backward 전엔 아직 기울기가 없음" },
                { type: "num", q: "협곡 손실 `f = 0.1x² + 2y²` 에서 SGD 가 발산하지 않는 학습률 η 의 상한은?", answer: 0.5, tol: 0.001, why: "가장 가파른 y 축 곡률 a = 4 → |1 − ηa| < 1 → η < 2/4 · 데모에서 0.5 넘겨 보기" },
                { type: "num", q: "Adam 첫 스텝(β1 = 0.9, β2 = 0.999)에서 편향 보정을 **빼면** `|m/√v|` 는? (소수 둘째 자리)", answer: 3.16, tol: 0.01, why: "m = 0.1g, v = 0.001g² → 0.1/√0.001 ≈ 3.16 · 보정하면 정확히 1" },
                { type: "num", q: "Adam 혼합정밀 학습은 파라미터당 16 byte(가중치·기울기 2+2, FP32 사본·m·v 4+4+4)다. 7B 모델이면 몇 GB?", answer: 112, tol: 0.5, unit: "GB", why: "7e9 × 16 byte · 활성값은 별도 (ZeRO 논문의 16Ψ)" },
                { type: "order", q: "PyTorch 학습 루프 한 스텝의 순서 (`zero_grad` 제외)", items: ["`loss = loss_fn(model(x), y)`", "`loss.backward()`", "`clip_grad_norm_(...)`", "`opt.step()`", "`sched.step()`"], why: "기울기 계산 → 줄이기 → 갱신 → 학습률 갱신 · 스케줄러를 먼저 부르면 첫 학습률 값을 건너뜀 (PyTorch 문서)" }
            ],
            refs: [
                { title: "Adam: A Method for Stochastic Optimization", by: "Kingma et al.", year: 2014, url: "https://arxiv.org/abs/1412.6980", kind: "paper" },
                { title: "Decoupled Weight Decay Regularization", by: "Loshchilov et al.", year: 2017, url: "https://arxiv.org/abs/1711.05101", kind: "paper" },
                { title: "On the Variance of the Adaptive Learning Rate and Beyond", by: "Liu et al.", year: 2019, url: "https://arxiv.org/abs/1908.03265", kind: "paper" },
                { title: "ZeRO: Memory Optimizations Toward Training Trillion Parameter Models", by: "Rajbhandari et al.", year: 2019, url: "https://arxiv.org/abs/1910.02054", kind: "paper" }
            ]
        },
        {
            id: "cnn",
            title: "CNN 합성곱",
            level: 2,
            mins: 14,
            pre: ["deep-learning/backprop"],
            checked: "2026-11-16",
            key: [
                "합성곱(convolution) = 작은 커널(kernel)을 밀며 **같은 가중치**(shared weights)로 내적(dot product)",
                "출력 크기 = `⌊(N + 2P − K) / S⌋ + 1`",
                "파라미터 = `K·K·C_in·C_out + C_out` · 이미지 크기와 무관",
                "얕은 층은 엣지(edge)·질감(texture), 깊은 층은 부품·물체"
            ],
            concepts: [
                { term: "커널(필터)", en: "Kernel (filter)", def: "K×K×C_in 가중치 · 출력 채널 하나당 커널 하나" },
                { term: "패딩", en: "Padding", def: "가장자리 0 채우기 · S=1 에서 `P = (K−1)/2` 면 크기 유지" },
                { term: "스트라이드", en: "Stride", def: "커널 이동 간격 · S=2 면 해상도 약 절반" },
                { term: "풀링", en: "Pooling", def: "영역의 최대/평균 · 학습 파라미터 없이 다운샘플" },
                { term: "수용 영역", en: "Receptive field", def: "출력 한 칸이 보는 입력 범위 · 층이 깊을수록 넓어짐" }
            ],
            demo: { type: "sim", name: "conv" },
            code: [
                {
                    lang: "python",
                    title: "작은 CNN · 층별 shape (PyTorch)",
                    src: `import torch, torch.nn as nn

class SmallCNN(nn.Module):
    def __init__(self, n_cls=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, padding=1),  # (B,1,28,28) → (B,32,28,28)
            nn.BatchNorm2d(32), nn.ReLU(),
            nn.MaxPool2d(2),                             # → (B,32,14,14)
            nn.Conv2d(32, 64, kernel_size=3, padding=1), # → (B,64,14,14)
            nn.BatchNorm2d(64), nn.ReLU(),
            nn.MaxPool2d(2),                             # → (B,64,7,7)
        )
        self.head = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),                     # → (B,64,1,1)
            nn.Flatten(),                                # → (B,64)
            nn.Linear(64, n_cls),                        # → (B,10)
        )

    def forward(self, x):
        return self.head(self.features(x))

m = SmallCNN()
print(m(torch.randn(8, 1, 28, 28)).shape)               # torch.Size([8, 10])
print(sum(p.numel() for p in m.parameters()))           # 19658 (conv1 = 3·3·1·32+32 = 320)`,
                    note: "PyTorch 이미지 텐서(tensor)는 `(B, C, H, W)` 순서"
                },
                {
                    lang: "python",
                    title: "합성곱을 루프로 (numpy)",
                    src: `import numpy as np

def conv2d(x, k, stride=1, pad=0):
    x = np.pad(x, pad)                       # 가장자리 0 채우기
    K = k.shape[0]
    H = (x.shape[0] - K) // stride + 1       # 패딩은 이미 x 에 반영
    W = (x.shape[1] - K) // stride + 1
    out = np.zeros((H, W))
    for i in range(H):
        for j in range(W):
            patch = x[i*stride:i*stride+K, j*stride:j*stride+K]
            out[i, j] = (patch * k).sum()    # 모든 위치에 같은 커널
    return out

img = np.zeros((8, 8)); img[1:7, 1] = 1     # 세로선
k = np.array([[-1, 0, 1]] * 3)              # 수직 엣지 커널
print(conv2d(img, k).shape)                 # (6, 6)
print(conv2d(img, k, stride=2, pad=1).shape)  # (4, 4)`,
                    note: "딥러닝의 '합성곱'은 커널을 뒤집지 않는 cross-correlation · `F.conv2d` 와 결과 동일"
                }
            ],
            optimize: [
                {
                    title: "bf16 autocast + channels_last",
                    before: { lang: "python", src: `for x, y in loader:
    x, y = x.cuda(), y.cuda()
    loss = F.cross_entropy(model(x), y)       # FP32 연산
    opt.zero_grad(); loss.backward(); opt.step()` },
                    after: { lang: "python", src: `model = model.cuda().to(memory_format=torch.channels_last)
for x, y in loader:
    x = x.cuda(non_blocking=True).to(memory_format=torch.channels_last)
    y = y.cuda(non_blocking=True)
    with torch.autocast("cuda", dtype=torch.bfloat16):   # 텐서코어 사용
        loss = F.cross_entropy(model(x), y)
    opt.zero_grad(); loss.backward(); opt.step()` },
                    gain: "텐서코어 사용 · 속도↑ 메모리↓ (모델·GPU 따라 다름, 실측 필수)",
                    note: "FP16 이면 `torch.amp.GradScaler` 필요 · bf16 은 보통 불필요"
                },
                {
                    title: "3×3 Conv → Depthwise separable",
                    before: { lang: "python", src: `nn.Conv2d(128, 128, 3, padding=1)   # 3·3·128·128 = 147,456 가중치` },
                    after: { lang: "python", src: `nn.Sequential(
    nn.Conv2d(128, 128, 3, padding=1, groups=128),  # depthwise: 3·3·128 = 1,152
    nn.Conv2d(128, 128, 1),                         # pointwise: 128·128 = 16,384
)` },
                    gain: "가중치·곱셈 약 1/8 (C=128)",
                    note: "MobileNet 계열의 핵심 · 정확도(accuracy)는 약간 손해 볼 수 있음"
                }
            ],
            glossary: [
                { term: "합성곱", en: "Convolution", def: "커널을 슬라이딩하며 국소 영역과 내적 · 가중치 공유" },
                { term: "특징 맵", en: "Feature map", def: "합성곱 층의 출력 · 채널마다 한 가지 패턴의 반응 지도" },
                { term: "수용 영역", en: "Receptive field", def: "출력 한 픽셀에 영향을 주는 입력 영역의 크기" },
                { term: "풀링", en: "Pooling", def: "최대/평균으로 공간 크기를 줄이는 연산" },
                { term: "배치 정규화", en: "Batch normalization", def: "미니배치 통계로 채널별 정규화 · 학습 안정·가속" },
                { term: "깊이별 분리 합성곱", en: "Depthwise separable convolution", def: "채널별 공간 합성곱 + 1×1 합성곱으로 분해해 연산 절감" }
            ],
            quiz: [
                { q: "입력 32×32, K=5, P=0, S=1 의 출력 크기는?", options: ["32×32", "30×30", "28×28", "27×27"], a: 2, why: "(32 − 5)/1 + 1 = 28 · 30 은 K=3 일 때" },
                { q: "`nn.Conv2d(3, 64, kernel_size=3)` 의 파라미터 수 (bias 포함)는?", options: ["1,792", "576", "1,728", "36,864"], a: 0, why: "3·3·3·64 = 1,728 + bias 64 · 1,728 은 bias 를 빠뜨린 값" },
                { q: "입력 8, K=3, S=2, P=1 이면 출력은? (데모로 확인)", options: ["3", "5", "8", "4"], a: 3, why: "⌊(8 + 2 − 3)/2⌋ + 1 = ⌊3.5⌋ + 1 = 4 · 바닥 함수를 빼면 4.5 로 헷갈림" },
                { q: "같은 입력에서 CNN 이 완전연결층보다 파라미터가 훨씬 적은 이유는?", options: ["입력 채널을 하나로 합쳐서", "지역 연결 + 가중치 공유", "bias 항을 아예 쓰지 않아서", "풀링이 입력 크기를 줄여서"], a: 1, why: "작은 커널 하나를 모든 위치에서 재사용 · 풀링은 파라미터가 0 이라 개수와 무관" },
                { q: "stride 1 에서 3×3 conv 가 입력 크기를 유지하려면 padding 은?", options: ["0", "2", "1", "3"], a: 2, why: "P = (K − 1)/2 = 1 · 양쪽에 붙으므로 2 가 아님" },
                { type: "num", q: "입력 224×224, K=7, S=2, P=3 합성곱의 출력 한 변은?", answer: 112, why: "⌊(224 + 6 − 7)/2⌋ + 1 = 111 + 1 · ResNet 첫 층" },
                { type: "num", q: "`nn.Conv2d(64, 128, 3, padding=1)` 의 파라미터 수 (bias 포함)는?", answer: 73856, why: "3·3·64·128 = 73,728 + bias 128 · padding 은 개수와 무관" },
                { type: "num", q: "56×56 입력, 64 → 64 채널 3×3 합성곱(P=1, S=1)의 곱셈-누산은 약 몇 백만(M) 번?", answer: 115.6, tol: 0.5, unit: "M", why: "56·56·9·64·64 ≈ 1.16억 · 파라미터는 3.7만이지만 위치마다 재사용" },
                { type: "text", q: "출력은? (`win` = 3×3 창을 모두 꺼내는 함수)", code: { lang: "python", src: "import numpy as np\nfrom numpy.lib.stride_tricks import sliding_window_view as win\nx = np.arange(25).reshape(5, 5)\nk = np.array([[-1, 0, 1]] * 3)\nout = (win(x, (3, 3)) * k).sum(axis=(-2, -1))\nprint(out.shape, out[0, 0])" }, answer: ["(3, 3) 6"], why: "5 − 3 + 1 = 3 · 첫 창의 행마다 오른쪽 − 왼쪽 = 2, 세 행 합 6" }
            ],
            refs: [
                { title: "Gradient-based learning applied to document recognition", by: "LeCun et al.", year: 1998, url: "https://doi.org/10.1109/5.726791", kind: "paper" },
                { title: "Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift", by: "Ioffe et al.", year: 2015, url: "https://arxiv.org/abs/1502.03167", kind: "paper" },
                { title: "Deep Residual Learning for Image Recognition", by: "He et al.", year: 2015, url: "https://arxiv.org/abs/1512.03385", kind: "paper" },
                { title: "MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications", by: "Howard et al.", year: 2017, url: "https://arxiv.org/abs/1704.04861", kind: "paper" }
            ]
        },
        {
            id: "rnn",
            title: "RNN과 LSTM",
            level: 3,
            mins: 16,
            pre: ["deep-learning/backprop"],
            checked: "2026-11-16",
            key: [
                "RNN: 은닉 상태(hidden state) `h` 가 지금까지의 요약 · 시점(time step)마다 **같은 가중치**",
                "긴 시퀀스(sequence)에선 기울기 소실(vanishing gradient) → 먼 과거를 잊음",
                "LSTM: 셀 상태(cell state) `c` + forget / input / output 게이트(gate)",
                "순차 계산(sequential computation)이라 병렬화(parallelization)가 어려움 → Transformer 의 동기"
            ],
            concepts: [
                { term: "은닉 상태", en: "Hidden state", def: "`h_t = tanh(W·x_t + U·h_(t−1) + b)` · 과거를 압축한 벡터" },
                { term: "BPTT", en: "Backpropagation Through Time", def: "시간축으로 펼친 그래프에 역전파 · U 가 반복해서 곱해짐" },
                { term: "셀 상태", en: "Cell state", def: "`c_t = f⊙c_(t−1) + i⊙g` · 덧셈 경로라 기울기가 오래 유지" },
                { term: "게이트", en: "Gate", def: "sigmoid 로 0~1 을 내는 밸브 · 원소별 곱(⊙)으로 정보 흐름 조절" },
                { term: "GRU", en: "Gated Recurrent Unit", def: "update/reset 게이트 2개 · 셀 상태 없이 LSTM 보다 가벼움" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "cprev", label: "c(t−1)", sub: "셀 상태·장기기억", x: 0, y: 0 },
                    { id: "fmul", label: "c × f", sub: "필요 없는 것 지움", x: 1, y: 0 },
                    { id: "add", label: "+ i × g", sub: "새 정보 기록", x: 2, y: 0 },
                    { id: "c", label: "c(t)", sub: "덧셈 경로·기울기 유지", x: 3, y: 0 },
                    { id: "bptt", label: "BPTT", sub: "U 반복 곱 → 소실", x: 0, y: 1 },
                    { id: "fg", label: "forget f", sub: "σ(W_f·[h,x]+b)", x: 1, y: 1 },
                    { id: "ig", label: "input i, g", sub: "σ(…) · tanh(…)", x: 2, y: 1 },
                    { id: "og", label: "output o", sub: "σ(W_o·[h,x]+b)", x: 3, y: 1 },
                    { id: "rnn", label: "기본 RNN", sub: "h=tanh(Wx+Uh+b)", x: 0, y: 2 },
                    { id: "hx", label: "[h, x]", sub: "h(t−1) + x(t) 연결", x: 1, y: 2 },
                    { id: "next", label: "다음 시점", sub: "같은 W 재사용", x: 2, y: 2 },
                    { id: "h", label: "h(t)", sub: "o × tanh(c(t))", x: 3, y: 2 }
                ],
                edges: [
                    { from: "rnn", to: "bptt", label: "펼치기" },
                    { from: "rnn", to: "hx", label: "게이트 추가" },
                    { from: "hx", to: "fg" },
                    { from: "hx", to: "ig" },
                    { from: "hx", to: "og" },
                    { from: "cprev", to: "fmul" },
                    { from: "fg", to: "fmul", label: "f" },
                    { from: "fmul", to: "add" },
                    { from: "ig", to: "add", label: "i·g" },
                    { from: "add", to: "c" },
                    { from: "c", to: "og", label: "tanh" },
                    { from: "og", to: "h", label: "o ×" },
                    { from: "h", to: "next", label: "t+1" }
                ],
                steps: [
                    { on: ["rnn"], text: "기본 RNN: `h_t = tanh(W·x_t + U·h_(t−1) + b)` · 모든 시점이 **같은 W, U**" },
                    { on: ["rnn>bptt", "bptt"], text: "학습은 시간축으로 펼쳐 역전파(BPTT) · U 가 반복 곱해져 기울기 소실/폭주(exploding gradient)" },
                    { on: ["rnn>hx", "hx"], text: "LSTM: 이전 은닉 h(t−1) 과 입력 x(t) 를 이어 붙여(concatenate) 게이트 계산에 사용" },
                    { on: ["cprev", "hx>fg", "fg", "cprev>fmul", "fg>fmul", "fmul"], text: "forget 게이트 f ∈ (0,1): 셀 상태에서 무엇을 **잊을지** 원소별로 결정" },
                    { on: ["hx>ig", "ig", "ig>add", "fmul>add", "add"], text: "input 게이트 i × 후보(candidate) g = tanh(…): 무엇을 **새로 쓸지**" },
                    { on: ["add>c", "c"], text: "`c_t = f⊙c_(t−1) + i⊙g` · 곱셈 대신 덧셈 경로라 기울기가 오래 살아남음" },
                    { on: ["hx>og", "og", "c>og", "og>h", "h"], text: "output 게이트: `h_t = o⊙tanh(c_t)` · 셀 중 무엇을 내보낼지" },
                    { on: ["h>next", "next"], text: "h(t), c(t) 를 다음 시점으로 · t 가 t−1 을 기다려야 해서 순차 처리" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "`nn.LSTM` 입출력 shape",
                    src: `import torch, torch.nn as nn

lstm = nn.LSTM(input_size=8, hidden_size=16, num_layers=2, batch_first=True)
x = torch.randn(4, 10, 8)                 # (batch, time, feature)

out, (h, c) = lstm(x)
print(out.shape)   # (4, 10, 16)  마지막 층의 모든 시점 h
print(h.shape)     # (2, 4, 16)   층별 마지막 시점 h
print(c.shape)     # (2, 4, 16)   층별 마지막 셀 상태

head = nn.Linear(16, 3)
logits = head(out[:, -1])                 # 마지막 시점으로 분류 → (4, 3)

print(lstm.weight_ih_l0.shape)            # (64, 8) = (4·hidden, input)
# 64 = 게이트 i, f, g, o 네 개의 가중치를 한 행렬에`,
                    note: "`batch_first=True` 가 아니면 입력은 `(time, batch, feature)`"
                },
                {
                    lang: "python",
                    title: "LSTM 셀을 직접 (numpy)",
                    src: `import numpy as np
sig = lambda z: 1 / (1 + np.exp(-z))

def lstm_cell(x, h, c, W, b):
    H = h.shape[0]
    z = W @ np.concatenate([x, h]) + b       # 게이트 4개를 한 번에
    i, f = sig(z[:H]), sig(z[H:2*H])         # 순서 i, f, g, o (PyTorch 와 동일)
    g, o = np.tanh(z[2*H:3*H]), sig(z[3*H:])
    c = f * c + i * g                        # 잊고 + 새로 쓰기
    h = o * np.tanh(c)                       # 내보낼 부분만
    return h, c

D, H = 3, 4
rng = np.random.default_rng(0)
W, b = rng.normal(size=(4*H, D+H)) * 0.5, np.zeros(4*H)
h = c = np.zeros(H)
for x in rng.normal(size=(5, D)):            # 5 시점 · 같은 W 재사용
    h, c = lstm_cell(x, h, c, W, b)
print(h.round(3))`,
                    note: "W 를 `[weight_ih | weight_hh]` 로 나눠 `nn.LSTMCell` 에 넣으면 결과가 일치 (bias 는 `b_ih + b_hh` 합)"
                }
            ],
            optimize: [
                {
                    title: "패딩(padding)까지 계산 → `pack_padded_sequence`",
                    before: { lang: "python", src: `x = pad_sequence(seqs, batch_first=True)  # 길이 100, 12, 7 → 모두 100
out, (h, c) = lstm(x)       # 패딩도 계산 · h 는 패딩 끝의 상태` },
                    after: { lang: "python", src: `packed = pack_padded_sequence(x, lengths, batch_first=True, enforce_sorted=False)
out, (h, c) = lstm(packed)  # 실제 길이만큼만 · h = 진짜 마지막 시점
out, _ = pad_packed_sequence(out, batch_first=True)` },
                    gain: "패딩 연산 제거 · 마지막 h 정확",
                    note: "`lengths` 는 CPU 텐서(또는 리스트)여야 함"
                },
                {
                    title: "`LSTMCell` 파이썬 루프 → `nn.LSTM`",
                    before: { lang: "python", src: `cell = nn.LSTMCell(64, 128)
for t in range(T):          # 시점마다 커널 여러 번 호출
    h, c = cell(x[:, t], (h, c))` },
                    after: { lang: "python", src: `lstm = nn.LSTM(64, 128, batch_first=True)
out, (h, c) = lstm(x)       # cuDNN 이 시퀀스 전체를 융합 처리` },
                    gain: "GPU 에서 보통 수배 빠름"
                }
            ],
            glossary: [
                { term: "순환 신경망", en: "Recurrent Neural Network (RNN)", def: "이전 시점의 은닉 상태를 다음 입력과 함께 쓰는 신경망" },
                { term: "LSTM", en: "Long Short-Term Memory", def: "셀 상태와 3개 게이트로 장기 의존성을 학습하는 RNN" },
                { term: "GRU", en: "Gated Recurrent Unit", def: "update/reset 게이트만 쓰는 LSTM 의 경량 변형" },
                { term: "BPTT", en: "Backpropagation Through Time", def: "시간축으로 펼친 RNN 에 적용하는 역전파" },
                { term: "Truncated BPTT", en: "Truncated BPTT", def: "긴 시퀀스를 구간으로 잘라 그 안에서만 역전파 · 메모리 절약" }
            ],
            quiz: [
                { q: "LSTM 셀 상태의 갱신식은?", options: ["c = o⊙tanh(h)", "c = f⊙c + i⊙g", "c = σ(W·x)", "c = c + h"], a: 1, why: "forget 으로 지우고 input × 후보로 더함 · o⊙tanh(·) 는 h 를 만드는 식" },
                { q: "forget 게이트 출력이 0 에 가까우면?", options: ["이전 셀 상태를 그대로 유지", "출력 h 가 0 이 됨", "입력 x 를 무시함", "이전 셀 상태를 거의 지움"], a: 3, why: "c(t−1) 에 0 을 곱함 · '유지'는 f ≈ 1 일 때" },
                { q: "`nn.LSTM(8, 16, batch_first=True)` 에 (4, 10, 8) 입력 시 `out` shape 은?", options: ["(4, 10, 16)", "(10, 4, 16)", "(4, 16)", "(4, 10, 8)"], a: 0, why: "(batch, time, hidden) · 모든 시점의 h · (10, 4, 16) 은 batch_first=False 일 때" },
                { q: "RNN 이 Transformer 보다 학습 병렬화가 어려운 이유는?", options: ["시점마다 가중치가 달라서", "배치를 나눠 계산할 수 없어서", "h_t 가 h_(t−1) 에 의존해서", "tanh 는 GPU 가 병렬화 못 해서"], a: 2, why: "시간축으로 한 스텝씩만 진행 · 가중치는 오히려 모든 시점이 공유" },
                { q: "RNN 학습에서 기울기 폭주의 흔한 대책은?", options: ["기울기 클리핑", "학습률 증가", "은닉 크기 증가", "드롭아웃 제거"], a: 0, why: "노름이 임계값을 넘으면 비율대로 축소 · 소실은 클리핑으로 못 고침" },
                { type: "num", q: "`nn.LSTM(input_size=8, hidden_size=16)` 한 층의 파라미터 수는?", answer: 1664, why: "4H(D + H) + 8H = 64·24 + 128 · 편향이 `b_ih`, `b_hh` 두 벌" },
                { type: "num", q: "c(t−1) = 2.0, f = 0.9, i = 0.5, g = 0.8, o = 0.6 이면 h(t) 는? (소수 셋째 자리)", answer: 0.585, tol: 0.001, why: "c = 1.8 + 0.4 = 2.2 → h = 0.6 · tanh(2.2) ≈ 0.585" },
                { type: "text", q: "입력 → 게이트 투영 결과의 shape 은?", code: { lang: "python", src: "import numpy as np\nB, T, D, H = 4, 10, 8, 16\nx = np.zeros((B, T, D))\nW_ih = np.zeros((4 * H, D))     # 게이트 i, f, g, o\nprint((x @ W_ih.T).shape)" }, answer: ["(4, 10, 64)", "4, 10, 64"], why: "모든 시점의 입력 투영은 한 번에 · 순차인 건 h 쪽 `U·h(t−1)` 뿐" },
                { type: "order", q: "LSTM 한 시점의 계산 순서", items: ["h(t−1) 과 x(t) 이어 붙이기", "게이트 i, f, g, o 계산", "c(t) = f⊙c(t−1) + i⊙g", "h(t) = o⊙tanh(c(t))"], why: "게이트가 먼저, 셀 상태가 다음, h 는 새 셀 상태로 만듦" }
            ],
            refs: [
                { title: "Long Short-Term Memory", by: "Hochreiter et al.", year: 1997, url: "https://doi.org/10.1162/neco.1997.9.8.1735", kind: "paper" },
                { title: "Learning to Forget: Continual Prediction with LSTM", by: "Gers et al.", year: 2000, url: "https://doi.org/10.1162/089976600300015015", kind: "paper" },
                { title: "Learning Phrase Representations using RNN Encoder-Decoder for Statistical Machine Translation", by: "Cho et al.", year: 2014, url: "https://arxiv.org/abs/1406.1078", kind: "paper" },
                { title: "On the difficulty of training Recurrent Neural Networks", by: "Pascanu et al.", year: 2012, url: "https://arxiv.org/abs/1211.5063", kind: "paper" }
            ]
        },
        {
            id: "transformer",
            title: "Transformer와 어텐션",
            level: 3,
            mins: 16,
            pre: ["deep-learning/rnn"],
            checked: "2026-11-16",
            key: [
                "`Attention(Q,K,V) = softmax(QKᵀ / √d_k)·V`",
                "모든 토큰(token)이 모든 토큰을 보고 가중 평균(weighted average) → 한 번에 병렬",
                "멀티헤드(multi-head): 여러 헤드가 서로 다른 관계를 나눠 봄",
                "비용 O(T²) · 디코더(decoder)는 **인과 마스크(causal mask)** + KV 캐시(KV cache)"
            ],
            concepts: [
                { term: "Q · K · V", en: "Query · Key · Value", def: "입력에 `W_Q`, `W_K`, `W_V` 를 곱한 질의·키·값 투영" },
                { term: "√d_k 스케일", en: "√d_k scaling", def: "내적의 분산이 d_k 에 비례 → 나누지 않으면 softmax 포화" },
                { term: "인과 마스크", en: "Causal mask", def: "미래 위치 점수를 −∞ 로 → softmax 후 0 · 자기회귀 생성" },
                { term: "위치 정보", en: "Positional information", def: "어텐션은 순서를 모름 → sinusoidal, RoPE 등으로 주입" },
                { term: "블록 구조", en: "Transformer block", def: "`x + Attn(LN(x))` → `x + FFN(LN(x))` (Pre-LN, 잔차)" }
            ],
            demo: { type: "sim", name: "attention" },
            code: [
                {
                    lang: "python",
                    title: "Scaled dot-product attention 직접 구현",
                    src: `import math, torch
import torch.nn.functional as F

def attention(q, k, v, causal=False):
    # q, k, v: (B, heads, T, d)
    d = q.size(-1)
    scores = q @ k.transpose(-2, -1) / math.sqrt(d)        # (B, h, T, T)
    if causal:
        T = q.size(-2)
        future = torch.ones(T, T, dtype=torch.bool).triu(1) # 대각선 위 = 미래
        scores = scores.masked_fill(future, float("-inf"))
    w = scores.softmax(dim=-1)                              # 각 행의 합 = 1
    return w @ v                                            # (B, h, T, d)

q, k, v = (torch.randn(2, 4, 6, 16) for _ in range(3))
out = attention(q, k, v, causal=True)
ref = F.scaled_dot_product_attention(q, k, v, is_causal=True)
print(out.shape, torch.allclose(out, ref, atol=1e-5))       # torch.Size([2, 4, 6, 16]) True`,
                    note: "데모의 행렬 = `w` 한 헤드 · 행이 Query, 열이 Key"
                },
                {
                    lang: "python",
                    title: "Pre-LN Transformer 블록",
                    src: `import torch, torch.nn as nn

class Block(nn.Module):
    def __init__(self, d=256, heads=8):
        super().__init__()
        self.ln1, self.ln2 = nn.LayerNorm(d), nn.LayerNorm(d)
        self.attn = nn.MultiheadAttention(d, heads, batch_first=True)
        self.ffn = nn.Sequential(nn.Linear(d, 4 * d), nn.GELU(), nn.Linear(4 * d, d))

    def forward(self, x):                          # x: (B, T, d)
        T = x.size(1)
        future = torch.ones(T, T, dtype=torch.bool, device=x.device).triu(1)
        h = self.ln1(x)                            # Pre-LN
        a, _ = self.attn(h, h, h, attn_mask=future, need_weights=False)
        x = x + a                                  # 잔차 1: 토큰끼리 섞기
        x = x + self.ffn(self.ln2(x))              # 잔차 2: 토큰별 MLP
        return x

x = torch.randn(2, 10, 256)
print(Block()(x).shape)                            # torch.Size([2, 10, 256])`,
                    note: "bool `attn_mask` 에서 `True` = 보지 못하게 막을 위치"
                }
            ],
            optimize: [
                {
                    title: "직접 구현 → `F.scaled_dot_product_attention`",
                    before: { lang: "python", src: `scores = q @ k.transpose(-2, -1) / math.sqrt(d)  # (B,h,T,T) 를 메모리에
scores = scores.masked_fill(future, float("-inf"))
out = scores.softmax(-1) @ v` },
                    after: { lang: "python", src: `out = F.scaled_dot_product_attention(q, k, v, is_causal=True)
# GPU 에선 FlashAttention 류 커널 자동 선택 · T×T 행렬을 저장하지 않음` },
                    gain: "점수 행렬 메모리 O(T²) 제거 · 긴 시퀀스에서 크게 빠름"
                },
                {
                    title: "KV 캐시: 지난 토큰의 K, V 재사용",
                    before: { lang: "python", src: `ids = prompt
for _ in range(n_new):
    logits = model(ids).logits          # 매 스텝 전체 시퀀스를 다시 계산
    nxt = logits[:, -1:].argmax(-1)
    ids = torch.cat([ids, nxt], dim=1)` },
                    after: { lang: "python", src: `out = model(prompt, use_cache=True)     # prefill: 프롬프트의 K, V 저장
nxt = out.logits[:, -1:].argmax(-1)
for _ in range(n_new - 1):
    out = model(nxt, past_key_values=out.past_key_values, use_cache=True)
    nxt = out.logits[:, -1:].argmax(-1) # 새 토큰 1개만 계산` },
                    gain: "스텝당 재계산 제거 · 문맥이 길수록 이득",
                    note: "대신 KV 캐시 메모리가 층 × 길이에 비례해 증가 (Hugging Face 스타일 API)"
                }
            ],
            glossary: [
                { term: "셀프 어텐션", en: "Self-attention", def: "같은 시퀀스 안의 토큰끼리 Q·K 유사도로 V 를 가중 평균" },
                { term: "멀티헤드 어텐션", en: "Multi-head attention", def: "d 를 여러 헤드로 나눠 병렬로 어텐션 후 이어 붙임" },
                { term: "위치 인코딩", en: "Positional encoding", def: "토큰 순서 정보를 임베딩이나 Q·K 에 더하는 방법 (RoPE 등)" },
                { term: "레이어 정규화", en: "Layer normalization", def: "토큰마다 특징 차원으로 평균 0, 분산 1 정규화" },
                { term: "잔차 연결", en: "Residual connection", def: "`x + f(x)` · 깊은 망에서 기울기 흐름을 보장" },
                { term: "KV 캐시", en: "KV cache", def: "생성 중 이전 토큰의 Key·Value 를 저장해 재계산을 피함" }
            ],
            quiz: [
                { q: "QKᵀ 를 √d_k 로 나누는 이유는?", options: ["점수 행렬 메모리를 줄이려고", "음수 점수를 0 으로 만들려고", "softmax 포화를 막으려고", "위치 정보를 점수에 더하려고"], a: 2, why: "내적의 분산이 d_k 에 비례 → 나누지 않으면 한 토큰에 몰려 기울기가 거의 0 · 음수는 softmax 가 알아서 처리" },
                { q: "시퀀스 길이 T 일 때 헤드당 어텐션 점수 행렬 크기는?", options: ["T × T", "T × d", "d × d", "T"], a: 0, why: "모든 Query × 모든 Key 쌍 · T × d 는 Q, K, V 의 크기" },
                { q: "인과(causal) 마스크가 막는 것은?", options: ["패딩 토큰 참조", "자기 자신 참조", "과거 토큰 참조", "미래 토큰 참조"], a: 3, why: "생성 시점엔 아직 없는 미래를 보면 안 됨 · 패딩은 별도의 패딩 마스크로 막음" },
                { q: "데모에서 softmax 온도 T 를 낮추면 어텐션 분포는?", options: ["더 평평해짐", "더 뾰족해짐", "변화 없음", "합이 1 보다 커짐"], a: 1, why: "점수/T 의 차이가 커져 최댓값에 몰림 · 합은 항상 1" },
                { q: "위치 정보가 따로 필요한 이유는?", options: ["softmax 출력을 안정시키려고", "파라미터 수를 줄이려고", "어텐션은 순서를 구분 못 해서", "KV 캐시를 쓰려고"], a: 2, why: "토큰을 섞으면 출력도 똑같이 섞일 뿐 (순열 등변) · RoPE 등으로 주입" },
                { type: "num", q: "`d_k = 4`, 한 Query 와 세 Key 의 내적이 [4, 2, 0] 이면 첫 Key 의 어텐션 가중치는? (소수 셋째 자리)", answer: 0.665, tol: 0.001, why: "√4 로 나눠 [2, 1, 0] → e² / (e² + e + 1) ≈ 0.665 · 나누지 않으면 0.867" },
                { type: "num", q: "d = 4096, 32 층, fp16 이면 KV 캐시는 토큰당 몇 KiB? (GQA 없음)", answer: 512, unit: "KiB", why: "2(K, V) × 32 × 4096 × 2 byte = 524,288 byte · 4096 토큰이면 2 GiB" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "import numpy as np\nT = 4\nfuture = np.triu(np.ones((T, T), bool), k=1)   # 막을 위치\nprint(future.sum())" }, answer: ["6"], why: "대각선 위 원소 T(T − 1)/2 = 6 개가 −∞ 로 가려짐" },
                { type: "order", q: "Pre-LN Transformer 블록의 계산 순서", items: ["LN₁(x)", "셀프 어텐션", "x ← x + 어텐션 출력", "LN₂(x)", "FFN", "x ← x + FFN 출력"], why: "정규화 → 서브층 → 잔차 덧셈을 두 번 · 원 논문(Post-LN)은 덧셈 뒤에 LN" }
            ],
            refs: [
                { title: "Attention Is All You Need", by: "Vaswani et al.", year: 2017, url: "https://arxiv.org/abs/1706.03762", kind: "paper" },
                { title: "Layer Normalization", by: "Ba et al.", year: 2016, url: "https://arxiv.org/abs/1607.06450", kind: "paper" },
                { title: "RoFormer: Enhanced Transformer with Rotary Position Embedding", by: "Su et al.", year: 2021, url: "https://arxiv.org/abs/2104.09864", kind: "paper" },
                { title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness", by: "Dao et al.", year: 2022, url: "https://arxiv.org/abs/2205.14135", kind: "paper" }
            ]
        },
        {
            id: "regularization",
            title: "과적합과 정규화",
            level: 2,
            mins: 12,
            pre: ["deep-learning/optimizer"],
            checked: "2026-11-16",
            key: [
                "과적합(overfitting) = train 은 좋은데 val 이 나빠짐 · **격차**(gap)를 본다",
                "더 많은·다양한 데이터가 가장 강력한 정규화(regularization)",
                "Dropout 은 `model.train()` 에서만 · 평가(evaluation) 전 `model.eval()`",
                "val 로 고르고, test 는 마지막에 **한 번만**"
            ],
            concepts: [
                { term: "과소적합 / 과적합", en: "Underfitting / Overfitting", def: "모델이 너무 단순해 train 도 나쁨 / 너무 맞춰서 val 만 나쁨" },
                { term: "Dropout", def: "학습 중 확률 p 로 0, 남은 값은 `1/(1−p)` 배 · 추론 땐 그대로 통과" },
                { term: "Weight decay", def: "매 스텝 `θ ← θ − ηλθ` · 큰 가중치를 억제 (AdamW)" },
                { term: "조기 종료", en: "Early stopping", def: "val 이 patience 동안 안 좋아지면 멈추고 최저점 가중치 복원" },
                { term: "데이터 증강", en: "Data augmentation", def: "뒤집기·자르기·색 변화 등 의미를 보존하는 변형으로 샘플 다양화" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "data", label: "데이터", sub: "train / val / test", x: 0, y: 0 },
                    { id: "train", label: "학습", sub: "train loss ↓", x: 1, y: 0 },
                    { id: "val", label: "검증", sub: "val loss ↓ 후 ↑", x: 2, y: 0 },
                    { id: "gap", label: "과적합", sub: "train ≪ val 격차", x: 3, y: 0 },
                    { id: "aug", label: "데이터 증강", sub: "flip·crop·색 변화", x: 0, y: 1 },
                    { id: "drop", label: "Dropout", sub: "p 확률로 뉴런 끔", x: 1, y: 1 },
                    { id: "wd", label: "가중치 감쇠", sub: "θ ← θ − ηλθ", x: 2, y: 1 },
                    { id: "es", label: "조기 종료", sub: "val 최저점 저장", x: 3, y: 1 },
                    { id: "test", label: "테스트", sub: "마지막에 한 번", x: 3, y: 2 }
                ],
                edges: [
                    { from: "data", to: "train" },
                    { from: "train", to: "val", label: "epoch 마다" },
                    { from: "val", to: "gap", label: "격차↑" },
                    { from: "aug", to: "train" },
                    { from: "drop", to: "train" },
                    { from: "wd", to: "train" },
                    { from: "gap", to: "es", label: "멈춤" },
                    { from: "es", to: "test" }
                ],
                steps: [
                    { on: ["data"], text: "데이터를 train / val / test 로 분리 · test 는 끝까지 보지 않음" },
                    { on: ["data>train", "train"], text: "학습: train 손실(loss)은 epoch 마다 계속 내려감" },
                    { on: ["train>val", "val"], text: "val 손실은 어느 순간부터 **다시 오름**" },
                    { on: ["val>gap", "gap"], text: "train ≪ val 격차 = 과적합 · 일반 규칙 대신 훈련 샘플을 외우는 중" },
                    { on: ["aug", "aug>train"], text: "데이터 증강(data augmentation): 라벨(label)은 같고 픽셀은 다른 샘플로 다양성↑" },
                    { on: ["drop", "drop>train"], text: "Dropout: 매 스텝 무작위 뉴런을 꺼서 특정 뉴런 의존을 막음" },
                    { on: ["wd", "wd>train"], text: "가중치 감쇠(weight decay): 매 스텝 θ 를 조금씩 0 쪽으로 · 매끄러운 함수 선호" },
                    { on: ["gap>es", "es"], text: "조기 종료(early stopping): val 이 patience 동안 개선 없으면 멈추고 최저점 가중치 복원" },
                    { on: ["es>test", "test"], text: "최종 성능은 손대지 않은 test 로 한 번만 측정" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "조기 종료가 있는 학습 루프",
                    src: `import copy, torch

def fit(model, opt, loss_fn, train_dl, val_dl, max_epochs=100, patience=5):
    best, best_state, bad = float("inf"), None, 0
    for epoch in range(max_epochs):
        model.train()                                   # Dropout ON
        for x, y in train_dl:
            opt.zero_grad()
            loss_fn(model(x), y).backward()
            opt.step()
        model.eval()                                    # Dropout OFF · BN 고정
        with torch.no_grad():
            val = sum(loss_fn(model(x), y).item() for x, y in val_dl) / len(val_dl)
        if val < best:
            best, bad = val, 0
            best_state = copy.deepcopy(model.state_dict())  # 최저점 저장
        else:
            bad += 1
            if bad >= patience:                         # 조기 종료
                break
    model.load_state_dict(best_state)                   # 최저점으로 복원
    return best`,
                    note: "`state_dict()` 는 참조(reference)라서 `deepcopy` 하지 않으면 계속 덮어써짐"
                },
                {
                    lang: "python",
                    title: "Dropout 동작 · 이미지 증강",
                    src: `import torch, torch.nn as nn
from torchvision import transforms as T

drop = nn.Dropout(p=0.5)
x = torch.ones(8)
drop.train(); print(drop(x))   # 약 절반이 0, 나머지는 2.0 (= 1/(1−p))
drop.eval();  print(drop(x))   # 전부 1.0 · 그대로 통과

train_tf = T.Compose([
    T.RandomResizedCrop(224),          # 무작위 영역 + 크기
    T.RandomHorizontalFlip(),          # 좌우 반전
    T.ColorJitter(0.2, 0.2, 0.2),      # 밝기·대비·채도
    T.ToTensor(),
])
val_tf = T.Compose([T.Resize(256), T.CenterCrop(224), T.ToTensor()])  # 검증엔 증강 X`,
                    note: "학습 때 1/(1−p) 로 키워 두므로 추론(inference) 때 따로 스케일할 필요 없음"
                }
            ],
            optimize: [
                {
                    title: "Adam + L2 → AdamW · 분리된 감쇠(decoupled weight decay)",
                    before: { lang: "python", src: `opt = torch.optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-2)
# L2 항이 기울기에 더해져 √v̂ 로 나뉨 → 큰 기울기 파라미터는 덜 감쇠` },
                    after: { lang: "python", src: `opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)
# θ ← θ − ηλθ 를 적응형 스텝과 따로 적용` },
                    gain: "의도한 감쇠 강도 · 일반화가 더 나은 경우가 많음"
                },
                {
                    title: "bias · norm 은 감쇠에서 제외",
                    before: { lang: "python", src: `opt = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.1)
# bias, LayerNorm 스케일까지 0 쪽으로 당김` },
                    after: { lang: "python", src: `decay    = [p for p in model.parameters() if p.ndim >= 2]  # 가중치 행렬
no_decay = [p for p in model.parameters() if p.ndim < 2]   # bias, norm
opt = torch.optim.AdamW([
    {"params": decay,    "weight_decay": 0.1},
    {"params": no_decay, "weight_decay": 0.0},
], lr=3e-4)` },
                    gain: "불필요한 제약 제거 · 흔한 표준 레시피"
                }
            ],
            glossary: [
                { term: "과적합", en: "Overfitting", def: "훈련 데이터에만 맞고 새 데이터에 일반화하지 못하는 상태" },
                { term: "드롭아웃", en: "Dropout", def: "학습 중 무작위 뉴런 출력을 0 으로 만드는 정규화" },
                { term: "가중치 감쇠", en: "Weight decay", def: "매 스텝 가중치를 비율만큼 줄여 큰 값을 억제" },
                { term: "조기 종료", en: "Early stopping", def: "검증 성능이 더 나아지지 않으면 학습을 멈추는 기법" },
                { term: "데이터 증강", en: "Data augmentation", def: "라벨을 유지하는 변형으로 훈련 샘플을 늘리는 방법" },
                { term: "검증 세트", en: "Validation set", def: "하이퍼파라미터·체크포인트 선택용 데이터 · 학습에는 쓰지 않음" }
            ],
            quiz: [
                { q: "train 손실 ↓, val 손실 ↑ 인 상황은?", options: ["과소적합", "정상 수렴", "학습률이 너무 작음", "과적합"], a: 3, why: "훈련 데이터에만 점점 더 맞추는 중 · 과소적합이면 train 손실도 높음" },
                { q: "`Dropout(p=0.2)` 학습 중 남은 값에 곱해지는 배율은?", options: ["0.8", "1.25", "1 (그대로)", "0.2"], a: 1, why: "1 / (1 − 0.2) = 1.25 (inverted dropout) · 0.8 은 원 논문식으로 테스트 때 곱하던 값" },
                { q: "평가 전에 `model.eval()` 을 빼먹으면?", options: ["Dropout·BN 이 학습 모드로 동작", "모델 가중치가 저장되지 않음", "autograd 가 기울기 기록을 계속함", "아무 영향 없음"], a: 0, why: "eval() 은 층의 동작 모드만 바꿈 · 기울기 기록을 끄는 건 `torch.no_grad()`" },
                { q: "하이퍼파라미터를 test 세트로 고르면 안 되는 이유는?", options: ["test 셋이 보통 너무 작아서", "test 점수가 낙관적으로 부풀어서", "학습이 test 분포에 과소적합해서", "규칙상 금지일 뿐 결과는 같아서"], a: 1, why: "test 에 맞춰 고른 순간 더 이상 '처음 보는' 데이터가 아님 · 크기와는 무관" },
                { q: "AdamW 가 Adam + L2 와 다른 점은?", options: ["momentum 항을 쓰지 않음", "감쇠를 적응형 스텝 밖에서 적용", "warmup 스케줄이 내장되어 있음", "수식이 완전히 같고 이름만 다름"], a: 1, why: "L2 기울기가 √v̂ 로 나뉘는 왜곡을 없앰 · 모멘트 m, v 는 그대로" },
                { type: "num", q: "η = 1e−3, λ = 0.1 의 weight decay 만 1만 스텝 걸면(기울기 0) 가중치는 처음의 몇 배? (소수 셋째 자리)", answer: 0.368, tol: 0.001, why: "(1 − ηλ)^10000 = 0.9999^10000 ≈ e^−1" },
                { type: "num", q: "클래스 10 개, `CrossEntropyLoss(label_smoothing=0.1)` 이면 정답 클래스의 목표 확률은?", answer: 0.91, tol: 0.001, why: "원-핫과 균등분포를 섞음: 0.9 × 1 + 0.1/10 · 나머지 클래스는 각 0.01" },
                { type: "text", q: "출력은? (p = 0.5 inverted dropout, 마스크 고정)", code: { lang: "python", src: "import numpy as np\nx = np.array([1., 2., 3., 4.])\nmask = np.array([1, 0, 1, 0])\nprint(x * mask / (1 - 0.5))" }, answer: ["[2. 0. 6. 0.]", "[2 0 6 0]"], why: "남은 값은 1/(1 − p) = 2 배 · 기댓값이 x 와 같아져 추론 땐 그대로 통과" },
                { type: "order", q: "누수 없는 실험 순서", items: ["train / val / test 분할", "train 으로 학습", "val 로 하이퍼파라미터·체크포인트 선택", "test 로 한 번만 측정"], why: "분할이 먼저 · 전처리 통계도 train 으로만 · test 는 모든 결정이 끝난 뒤" }
            ],
            refs: [
                { title: "Dropout: A Simple Way to Prevent Neural Networks from Overfitting", by: "Srivastava et al.", year: 2014, url: "https://jmlr.org/papers/v15/srivastava14a.html", kind: "paper" },
                { title: "Decoupled Weight Decay Regularization", by: "Loshchilov et al.", year: 2017, url: "https://arxiv.org/abs/1711.05101", kind: "paper" },
                { title: "Deep Learning", by: "Goodfellow et al.", year: 2016, url: "https://www.deeplearningbook.org/", kind: "book" },
                { title: "CrossEntropyLoss (label_smoothing)", by: "PyTorch", url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html", kind: "doc" }
            ]
        },
        {
            id: "quantization",
            title: "양자화와 경량화",
            level: 3,
            mins: 14,
            pre: ["languages/float", "memory/mem-hierarchy"],
            checked: "2026-11-16",
            key: [
                "양자화(quantization): `x ≈ s·(q − z)` · FP32 → INT8 이면 크기 **1/4**",
                "PTQ 는 빠르고 간단 · 정확도(accuracy) 하락이 크면 QAT",
                "가지치기(pruning)는 **구조적**(structured)이어야 실제 속도가 남",
                "증류(distillation): 큰 모델의 출력 분포로 작은 모델을 가르침"
            ],
            concepts: [
                { term: "스케일 · 제로포인트", en: "Scale · Zero-point", def: "실수 범위를 정수 격자에 대응 · 대칭이면 z = 0, `s = max|x|/127`" },
                { term: "PTQ / QAT", en: "Post-Training Quantization / Quantization-Aware Training", def: "학습 후 바로 변환 / 학습 중 가짜 양자화로 반올림 오차에 적응" },
                { term: "채널별 스케일", en: "Per-channel scale", def: "출력 채널마다 s 를 따로 · 텐서 하나 스케일보다 오차↓" },
                { term: "이상치", en: "Outlier", def: "큰 값 하나가 범위를 키워 나머지 해상도를 떨어뜨림" },
                { term: "Weight-only", def: "가중치만 INT8/INT4, 연산은 FP16/BF16 · 메모리 대역폭 병목에 유리" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "fp32", label: "FP32 모델", sub: "가중치당 4 byte", x: 0, y: 0 },
                    { id: "calib", label: "캘리브레이션", sub: "대표 입력 수백 개", x: 1, y: 0 },
                    { id: "scale", label: "스케일 계산", sub: "s = max|x| / 127", x: 2, y: 0 },
                    { id: "int8", label: "INT8 모델", sub: "크기 1/4", x: 3, y: 0 },
                    { id: "prune", label: "가지치기", sub: "작은 가중치 제거", x: 0, y: 1 },
                    { id: "distill", label: "지식 증류", sub: "교사 → 학생", x: 1, y: 1 },
                    { id: "qat", label: "QAT", sub: "fake quant 로 학습", x: 2, y: 1 },
                    { id: "eval", label: "정확도 검증", sub: "FP32 대비 하락", x: 3, y: 1 },
                    { id: "deploy", label: "배포", sub: "GPU · NPU · CPU", x: 3, y: 2 }
                ],
                edges: [
                    { from: "fp32", to: "calib" },
                    { from: "calib", to: "scale", label: "범위 관측" },
                    { from: "scale", to: "int8", label: "round·clip" },
                    { from: "int8", to: "eval" },
                    { from: "eval", to: "qat", label: "하락 큼" },
                    { from: "qat", to: "int8", label: "재변환" },
                    { from: "fp32", to: "prune" },
                    { from: "prune", to: "distill", label: "회복" },
                    { from: "eval", to: "deploy", label: "OK" }
                ],
                steps: [
                    { on: ["fp32"], text: "학습이 끝난 FP32 모델 · 가중치 하나에 4 byte, 추론(inference)엔 과한 정밀도(precision)" },
                    { on: ["fp32>calib", "calib"], text: "캘리브레이션(calibration): 대표 입력을 흘려 층별 **활성값 범위**(activation range)를 관측" },
                    { on: ["calib>scale", "scale"], text: "대칭(symmetric) INT8: `s = max|x|/127`, `q = round(x/s)` · 가중치는 채널별(per-channel) s" },
                    { on: ["scale>int8", "int8"], text: "INT8 모델(PTQ): 크기 1/4 · 정수 연산으로 메모리 대역폭(memory bandwidth)·전력↓" },
                    { on: ["int8>eval", "eval"], text: "검증 세트(validation set)로 FP32 대비 정확도 하락을 측정" },
                    { on: ["eval>qat", "qat", "qat>int8"], text: "하락이 크면 QAT: 순전파(forward pass)에 반올림(rounding)을 흉내 내며 미세조정(fine-tuning) 후 재변환" },
                    { on: ["fp32>prune", "prune"], text: "가지치기: 작은 가중치·채널 제거 · 채널 단위여야 일반 하드웨어에서 빨라짐" },
                    { on: ["prune>distill", "distill"], text: "지식 증류(knowledge distillation): 큰 교사(teacher)의 부드러운 확률로 작은 학생(student)을 학습해 정확도 회복" },
                    { on: ["eval>deploy", "deploy"], text: "통과 → 대상 런타임(runtime) 형식으로 변환해 배포(deployment)" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "대칭 INT8 양자화 · 채널별 vs 텐서별",
                    src: `import numpy as np

def quantize_int8(w):
    s = np.abs(w).max(axis=1, keepdims=True) / 127.0      # 출력 채널(행)별 스케일
    q = np.clip(np.round(w / s), -127, 127).astype(np.int8)
    return q, s

rng = np.random.default_rng(0)
W = rng.normal(0, 0.02, size=(256, 512)).astype(np.float32)
W[0, 0] = 0.5                                             # 이상치 하나

q, s = quantize_int8(W)
W_hat = q.astype(np.float32) * s                          # 역양자화
print(W.nbytes // q.nbytes)                               # 4 → 크기 1/4
err_ch = np.abs(W - W_hat).mean()

s_t = np.abs(W).max() / 127.0                             # 텐서 전체에 스케일 1개
W_t = np.clip(np.round(W / s_t), -127, 127) * s_t
err_t = np.abs(W - W_t).mean()
print(f"per-channel {err_ch:.1e}  per-tensor {err_t:.1e}")  # 텐서별이 수 배 큼`,
                    note: "이상치(outlier) 하나가 텐서(tensor) 전체의 s 를 키움 · 채널별이면 그 행만 손해"
                },
                {
                    lang: "python",
                    title: "지식 증류 손실 (PyTorch)",
                    src: `import torch
import torch.nn.functional as F

def distill_loss(student_logits, teacher_logits, labels, T=4.0, alpha=0.7):
    soft = F.kl_div(
        F.log_softmax(student_logits / T, dim=-1),        # 학생 (log 확률)
        F.softmax(teacher_logits / T, dim=-1),            # 교사 (부드러운 확률)
        reduction="batchmean",
    ) * (T * T)                                           # 기울기 크기 보정
    hard = F.cross_entropy(student_logits, labels)        # 정답 레이블
    return alpha * soft + (1 - alpha) * hard

teacher.eval()
for x, y in loader:
    with torch.no_grad():
        t_logits = teacher(x)                             # 교사는 고정
    loss = distill_loss(student(x), t_logits, y)
    opt.zero_grad(); loss.backward(); opt.step()`,
                    note: "T 를 키우면 '고양이는 개와 비슷' 같은 오답 간 관계까지 전달"
                }
            ],
            optimize: [
                {
                    title: "FP32 → BF16 추론 (가장 쉬운 첫 단계)",
                    before: { lang: "python", src: `model = load_model().eval()                     # 파라미터당 4 byte` },
                    after: { lang: "python", src: `model = load_model().eval().to(torch.bfloat16)  # 2 byte · 대부분 정확도 유지` },
                    gain: "메모리 1/2"
                },
                {
                    title: "Linear 가중치 INT8 (torchao)",
                    before: { lang: "python", src: `model = model.cuda().eval()     # Linear 가중치 FP32` },
                    after: { lang: "python", src: `from torchao.quantization import quantize_, Int8WeightOnlyConfig

model = model.cuda().eval()
quantize_(model, Int8WeightOnlyConfig())   # 채널별 INT8 가중치 · 제자리 변환` },
                    gain: "가중치 메모리 FP32 대비 1/4",
                    note: "`torch.ao.quantization` 은 deprecated → torchao 로 이전 중"
                }
            ],
            glossary: [
                { term: "양자화", en: "Quantization", def: "실수 값을 적은 비트의 정수 격자로 근사해 저장·연산" },
                { term: "스케일 · 제로포인트", en: "Scale / zero-point", def: "`x ≈ s·(q − z)` 의 s, z · 정수와 실수 사이 변환 계수" },
                { term: "PTQ", en: "Post-Training Quantization", def: "학습이 끝난 모델을 캘리브레이션만으로 양자화" },
                { term: "QAT", en: "Quantization-Aware Training", def: "가짜 양자화를 넣고 학습해 양자화 오차에 적응시키는 방법" },
                { term: "가지치기", en: "Pruning", def: "중요도가 낮은 가중치·채널을 제거해 모델을 줄임" },
                { term: "지식 증류", en: "Knowledge distillation", def: "큰 교사 모델의 출력 분포를 작은 학생이 따라 하도록 학습" }
            ],
            quiz: [
                { q: "FP32 가중치를 INT8 로 바꾸면 저장 크기는?", options: ["1/2", "그대로", "1/8", "1/4"], a: 3, why: "32 bit → 8 bit · 1/2 은 BF16, 1/8 은 INT4" },
                { q: "max|x| = 2.54 인 텐서를 대칭 INT8 로 양자화할 때 x = 1.0 의 정수값은?", options: ["50", "25", "100", "127"], a: 0, why: "s = 2.54/127 = 0.02 → round(1.0/0.02) = 50 · 127 은 max|x| 쪽" },
                { q: "PTQ 후 정확도가 크게 떨어졌다. 알맞은 다음 단계는?", options: ["캘리브레이션 없이 다시 변환", "QAT 로 미세조정", "텐서별 스케일 하나로 단순화", "INT4 로 비트를 더 줄임"], a: 1, why: "반올림 오차를 본 채 학습해 보정 · 그 전에 민감한 층만 고정밀로 두는 방법도 있음" },
                { q: "비구조적 가지치기 50% 가 일반 GPU 에서 속도 이득이 적은 이유는?", options: ["0 이 흩어져 밀집 행렬곱은 그대로", "남은 가중치 수가 오히려 늘어서", "정확도 하락을 보정하느라 느려서", "INT8 이 아니면 희소 연산이 안 돼서"], a: 0, why: "전용 희소 커널·2:4 하드웨어 없으면 0 도 계산 · 비트 수와는 무관" },
                { q: "지식 증류에서 온도 T 를 높이는 이유는?", options: ["교사 로짓의 노이즈를 지우려고", "오답 간 유사도까지 전하려고", "정답 레이블 손실을 대신하려고", "학생 모델의 크기를 줄이려고"], a: 1, why: "T↑ → 작은 확률들이 드러나 '어둠의 지식' 전달 · 정답 레이블 손실은 보통 함께 씀" },
                { type: "num", q: "범위 [−1.0, 3.0] 을 uint8 비대칭 양자화할 때 제로포인트 z 는?", answer: 64, why: "s = 4/255 ≈ 0.0157 → z = round(1.0/s) = round(63.75)" },
                { type: "num", q: "같은 s, z 로 x = 0.5 를 양자화했다 되돌린 값은? (소수 셋째 자리)", answer: 0.502, tol: 0.001, why: "q = round(31.875) + 64 = 96 → s·(96 − 64) ≈ 0.502 · 오차 ≤ s/2" },
                { type: "num", q: "7B 모델을 INT4(그룹 128, FP16 스케일)로 저장하면 가중치는 약 몇 GB?", answer: 3.61, tol: 0.05, unit: "GB", why: "가중치당 4 + 16/128 = 4.125 bit → 7e9 × 4.125 / 8 · FP16 이면 14 GB" },
                { type: "num", q: "FP8 E4M3 의 최대 유한값은?", answer: 448, why: "S.1111.110 = 1.75 × 2⁸ · 무한대를 두지 않아 범위를 넓힘 · E5M2 는 57,344" },
                { type: "order", q: "INT8 PTQ 의 순서", items: ["대표 입력 수백 개 준비", "층별 활성값 범위 관측", "스케일·제로포인트 계산", "round·clip 으로 INT8 변환", "검증 세트로 정확도 비교"], why: "캘리브레이션 데이터가 실제 입력 분포를 닮아야 범위가 맞음" }
            ],
            refs: [
                { title: "Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference", by: "Jacob et al.", year: 2017, url: "https://arxiv.org/abs/1712.05877", kind: "paper" },
                { title: "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers", by: "Frantar et al.", year: 2022, url: "https://arxiv.org/abs/2210.17323", kind: "paper" },
                { title: "FP8 Formats for Deep Learning", by: "Micikevicius et al.", year: 2022, url: "https://arxiv.org/abs/2209.05433", kind: "paper" },
                { title: "Distilling the Knowledge in a Neural Network", by: "Hinton et al.", year: 2015, url: "https://arxiv.org/abs/1503.02531", kind: "paper" }
            ]
        }
    ]
});
