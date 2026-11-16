LAB.track({
    id: "robotics",
    name: "로보틱스",
    icon: "⌖",
    color: "#f97316",
    tagline: "좌표, 기구학, 제어, 추정, 계획. 로봇이 움직이는 원리",
    trends: [
        {
            title: "휴머노이드(humanoid), 공장 투입 준비",
            when: "2025–2026",
            points: [
                "Figure, Tesla Optimus, Boston Dynamics Atlas 등 양산(mass production)·파일럿 경쟁",
                "현대차그룹: 2028년부터 미국 공장에 Atlas 단계 투입 계획 발표",
                "남은 과제: 손 조작(manipulation) 신뢰성 · 배터리 시간 · 안전 인증(safety certification)"
            ],
            refs: [
                { title: "Hyundai Motor Group Announces AI Robotics Strategy to Lead Human-Centered Robotics Era at CES 2026", by: "Hyundai Motor Group", year: 2026, url: "https://www.hyundaimotorgroup.com/en/news/hyundai-motor-group-announces-ai-robotics-strategy--to-lead-human-centered-robotics-era-at-ces-2026", kind: "doc" },
                { title: "Boston Dynamics Unveils New Atlas Robot to Revolutionize Industry", by: "Boston Dynamics", year: 2026, url: "https://bostondynamics.com/blog/boston-dynamics-unveils-new-atlas-robot-to-revolutionize-industry/", kind: "doc" }
            ]
        },
        {
            title: "VLA · 로봇 파운데이션 모델(robot foundation model)",
            when: "2025–2026",
            points: [
                "카메라 + 언어 지시 → 동작을 직접 출력하는 VLA (Vision-Language-Action)",
                "NVIDIA `GR00T N1.x`, Physical Intelligence `π0` 계열, DeepMind `Gemini Robotics`",
                "고수준 판단은 모델, 고속 저수준 루프는 기존 제어기(controller)가 담당하는 계층 구조(hierarchical architecture)"
            ],
            refs: [
                { title: "GR00T N1: An Open Foundation Model for Generalist Humanoid Robots", by: "NVIDIA", year: 2025, url: "https://arxiv.org/abs/2503.14734", kind: "paper" },
                { title: "π0: A Vision-Language-Action Flow Model for General Robot Control", by: "Black et al.", year: 2024, url: "https://arxiv.org/abs/2410.24164", kind: "paper" }
            ]
        },
        {
            title: "ROS 2 Lyrical Luth (LTS)",
            when: "2026",
            points: [
                "2026-05 출시 · 12번째 배포판(distribution) · 5년 지원 (2031-05까지)",
                "기본 RMW 는 Fast DDS · Zenoh 는 Kilted(2025)부터 Tier 1",
                "Humble(2022 LTS) 지원 종료(end of life) 2027-05 → 이전(migration) 계획 필요"
            ],
            refs: [
                { title: "Lyrical Luth (codename ‘lyrical’; May, 2026)", by: "Open Robotics", year: 2026, url: "https://docs.ros.org/en/lyrical/Releases/Release-Lyrical-Luth.html", kind: "doc" },
                { title: "Distributions", by: "Open Robotics", url: "https://docs.ros.org/en/lyrical/Releases.html", kind: "doc" }
            ]
        },
        {
            title: "GPU 시뮬레이션과 sim-to-real",
            when: "2025–2026",
            points: [
                "GPU 에서 수천 개 환경을 병렬로 돌려 강화학습(reinforcement learning) (Isaac Lab 등)",
                "Newton 물리엔진(physics engine): Disney·DeepMind·NVIDIA 시작, 2025-09 Linux Foundation 이관",
                "마찰·질량·지연을 무작위화(domain randomization)해 현실 격차(reality gap)를 줄임"
            ],
            refs: [
                { title: "Isaac Lab: A GPU-Accelerated Simulation Framework for Multi-Modal Robot Learning", by: "NVIDIA", year: 2025, url: "https://arxiv.org/abs/2511.04831", kind: "paper" },
                { title: "Linux Foundation Announces Contribution of Newton by Disney Research, Google DeepMind and NVIDIA to Accelerate Open Robot Learning", by: "Linux Foundation", year: 2025, url: "https://www.linuxfoundation.org/press/linux-foundation-announces-contribution-of-newton-by-disney-research-google-deepmind-and-nvidia-to-accelerate-open-robot-learning", kind: "doc" }
            ]
        }
    ],
    lessons: [
        {
            id: "frames",
            title: "좌표계와 변환행렬",
            level: 1,
            mins: 12,
            key: [
                "자세(pose) = 위치(position) + 방향(orientation) · 3D 강체(rigid body)는 **6 자유도**(degrees of freedom)",
                "동차 변환(homogeneous transform) `T = [R p; 0 1]` (4×4) 하나로 회전 + 이동(translation)",
                "`T_w_t = T_w_b · T_b_l · T_l_t` · 안쪽 첨자끼리 맞물림",
                "역변환(inverse transform)은 `[Rᵀ −Rᵀp; 0 1]` · 일반 `inv()` 불필요"
            ],
            concepts: [
                { term: "회전행렬 R", en: "Rotation matrix", def: "3×3 직교행렬 · `RᵀR = I`, `det R = +1` · 역행렬 = 전치" },
                { term: "동차 좌표", en: "Homogeneous coordinates", def: "점은 `[x y z 1]`, 방향 벡터는 `[x y z 0]` → 이동 영향 없음" },
                { term: "`T_a_b` 표기", en: "Frame transform notation", def: "b 프레임을 a 프레임에서 본 자세 · b 좌표 → a 좌표로 바꿈" },
                { term: "오일러각 / RPY", en: "Euler angles / Roll-Pitch-Yaw (RPY)", def: "각도 3개 · 회전 순서에 따라 결과가 다름 · 짐벌락 가능" },
                { term: "쿼터니언", en: "Quaternion", def: "`(w, x, y, z)` 단위 노름 · 짐벌락 없음 · slerp 보간" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "w", label: "world", sub: "고정 기준", x: 0, y: 0 },
                    { id: "b", label: "base", sub: "로봇 설치 위치", x: 1, y: 0 },
                    { id: "l", label: "link", sub: "관절각 θ 에 따라", x: 2, y: 0 },
                    { id: "t", label: "tool", sub: "그리퍼 끝 (TCP)", x: 3, y: 0 },
                    { id: "tw", label: "T_w_t", sub: "4×4 하나로 합침", x: 3, y: 1 },
                    { id: "pw", label: "p_world", sub: "T_w_t · p_tool", x: 2, y: 1 },
                    { id: "pt", label: "p_tool", sub: "T_t_w · p_world", x: 1, y: 1 }
                ],
                edges: [
                    { from: "w", to: "b", label: "T_w_b" },
                    { from: "b", to: "l", label: "T_b_l" },
                    { from: "l", to: "t", label: "T_l_t" },
                    { from: "t", to: "tw", label: "합성" },
                    { from: "tw", to: "pw", label: "× p" },
                    { from: "pw", to: "pt", label: "역변환" }
                ],
                steps: [
                    { on: ["w"], text: "world: 모든 자세를 표현하는 **고정 기준** 좌표계(coordinate frame)" },
                    { on: ["w>b", "b"], text: "`T_w_b`: base 를 world 에서 본 자세 · 설치 후 고정" },
                    { on: ["b>l", "l"], text: "`T_b_l(θ)`: 관절각(joint angle)에 따라 바뀌는 변환 · 이 계산이 FK" },
                    { on: ["l>t", "t"], text: "`T_l_t`: 링크 끝 → 공구 끝(tool tip) 고정 오프셋 (캘리브레이션 값)" },
                    { on: ["w>b", "b>l", "l>t", "t>tw", "tw"], text: "곱하면 `T_w_t = T_w_b·T_b_l·T_l_t` · 순서를 바꾸면 틀림" },
                    { on: ["tw>pw", "pw"], text: "공구 기준 점 `[x y z 1]ᵀ` 에 곱하면 world 좌표" },
                    { on: ["pw>pt", "pt"], text: "반대 방향은 역행렬 `T_t_w = [Rᵀ −Rᵀp; 0 1]`" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "동차 변환 체인 (numpy)",
                    src: `import numpy as np

def rot_z(th):
    c, s = np.cos(th), np.sin(th)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])

def make_T(R, p):
    T = np.eye(4)
    T[:3, :3], T[:3, 3] = R, p
    return T

def inv_T(T):                          # 구조를 이용한 역변환
    R, p = T[:3, :3], T[:3, 3]
    return make_T(R.T, -R.T @ p)

T_w_b = make_T(rot_z(np.pi / 2), [1.0, 0.0, 0.0])  # base: x=1m, 90° 회전
T_b_t = make_T(np.eye(3), [0.5, 0.0, 0.3])         # tool: 앞 0.5m, 위 0.3m
T_w_t = T_w_b @ T_b_t                              # 체인 = 행렬 곱

p_t = np.array([0.1, 0.0, 0.0, 1.0])               # tool 기준 점 (동차)
p_w = T_w_t @ p_t
print(p_w[:3])                                     # [1.  0.6 0.3]
assert np.allclose(inv_T(T_w_t) @ p_w, p_t)        # 왕복하면 원래 점`,
                    note: "base 가 90° 돌아 있으므로 tool 의 +x 방향이 world 의 +y 가 됨"
                },
                {
                    lang: "python",
                    title: "ROS 2 tf2 로 변환 조회 (rclpy)",
                    src: `import rclpy
from rclpy.node import Node
from rclpy.time import Time
from tf2_ros import TransformException
from tf2_ros.buffer import Buffer
from tf2_ros.transform_listener import TransformListener

class ToolPose(Node):
    def __init__(self):
        super().__init__('tool_pose')
        self.buf = Buffer()
        self.listener = TransformListener(self.buf, self)  # /tf, /tf_static 구독
        self.create_timer(0.1, self.tick)

    def tick(self):
        try:
            # (target='world', source='tool') → tool 자세를 world 기준으로
            t = self.buf.lookup_transform('world', 'tool', Time())  # Time() = 최신
        except TransformException as e:
            self.get_logger().warn(str(e))
            return
        p = t.transform.translation
        self.get_logger().info(f'tool: {p.x:.3f} {p.y:.3f} {p.z:.3f} m')

rclpy.init()
rclpy.spin(ToolPose())`,
                    note: "체인 곱셈은 tf2 가 프레임 트리(frame tree)를 따라 대신 해 줌 · 회전은 쿼터니언(quaternion)으로 전달"
                }
            ],
            optimize: [
                {
                    title: "역변환: 일반 역행렬 대신 구조 이용",
                    before: { lang: "python", src: `T_inv = np.linalg.inv(T)   # 일반 4×4 역행렬
# 반올림 오차로 R 부분의 직교성이 조금씩 깨짐` },
                    after: { lang: "python", src: `R, p = T[:3, :3], T[:3, 3]
T_inv = np.eye(4)
T_inv[:3, :3] = R.T            # 전치 = 정확한 역회전
T_inv[:3, 3] = -R.T @ p` },
                    gain: "연산↓ · 직교성 유지"
                },
                {
                    title: "점 N개 변환: 루프 대신 배치 행렬 곱",
                    before: { lang: "python", src: `pts_w = [T @ np.append(p, 1.0) for p in pts]   # 라이다 수만 점
# 점마다 Python 루프 + 배열 생성` },
                    after: { lang: "python", src: `R, t = T[:3, :3], T[:3, 3]
pts_w = pts @ R.T + t          # (N,3) 한 번에` },
                    gain: "N 이 클수록 수십× 이상"
                }
            ],
            glossary: [
                { term: "동차 변환", en: "Homogeneous transform", def: "회전 R 과 이동 p 를 4×4 행렬 하나로 묶은 표현" },
                { term: "SE(3)", en: "Special Euclidean group", def: "3D 강체 변환(회전 + 이동)의 집합 · 동차 행렬로 표현" },
                { term: "쿼터니언", en: "Quaternion", def: "4개 수로 3D 회전 표현 · 짐벌락 없음 · ROS 메시지 기본" },
                { term: "짐벌락", en: "Gimbal lock", def: "오일러각에서 두 회전축이 겹쳐 자유도 하나를 잃는 상태" },
                { term: "툴 중심점", en: "Tool Center Point (TCP)", def: "공구 끝 기준점 · 로봇 프로그램의 목표 자세 기준" },
                { term: "tf2", en: "ROS 2 transform library", def: "프레임 트리를 시간별로 관리하고 임의 두 프레임 변환을 계산" }
            ],
            quiz: [
                { q: "회전행렬 R 의 역행렬은?", options: ["Rᵀ", "−R", "R 자신", "det(R) · R"], a: 0, why: "직교행렬: RᵀR = I 이므로 R⁻¹ = Rᵀ" },
                { q: "동차 좌표에서 방향 벡터(속도 등)의 4번째 성분은?", options: ["1", "0", "−1", "벡터 크기"], a: 1, why: "0 이면 이동 p 가 곱해지지 않고 회전만 적용" },
                { q: "`T_w_t` 를 구하는 올바른 곱은?", options: ["T_l_t · T_b_l · T_w_b", "T_t_l · T_l_b · T_b_w", "T_w_b · T_b_l · T_l_t", "T_w_b + T_b_l + T_l_t"], a: 2, why: "인접 첨자가 맞물리게: w_b · b_l · l_t → w_t" },
                { q: "오일러각 대신 쿼터니언을 쓰는 주된 이유는?", options: ["사람이 읽기 쉬움", "숫자 개수가 더 적음", "이동까지 함께 표현", "짐벌락 없음 · 보간이 매끄러움"], a: 3, why: "특이 자세가 없고 slerp 로 부드럽게 보간 가능" },
                { q: "3D 강체 자세의 자유도는?", options: ["3", "4", "6", "12"], a: 2, why: "위치 3 + 방향 3 · 행렬 원소 12개는 제약으로 묶여 있음" }
            ],
            refs: [
                { title: "Modern Robotics: Mechanics, Planning, and Control", by: "Lynch et al.", year: 2017, url: "https://hades.mech.northwestern.edu/index.php/Modern_Robotics", kind: "book" },
                { title: "REP 103 -- Standard Units of Measure and Coordinate Conventions", by: "Foote et al.", year: 2010, url: "https://www.ros.org/reps/rep-0103.html", kind: "spec" },
                { title: "tf: The transform library", by: "Foote", year: 2013, url: "https://doi.org/10.1109/TePRA.2013.6556373", kind: "paper" },
                { title: "Animating rotation with quaternion curves", by: "Shoemake", year: 1985, url: "https://doi.org/10.1145/325165.325242", kind: "paper" }
            ]
        },
        {
            id: "kinematics",
            title: "FK / IK 기구학",
            level: 2,
            mins: 14,
            key: [
                "FK: 관절각(joint angle) θ → 끝점(end-effector) 자세 · 해가 항상 **하나**",
                "IK: 끝점 자세 → θ · 해가 없거나 **여러 개** (팔꿈치 위/아래)",
                "자코비안(Jacobian): 관절 속도 → 끝점 속도 `ẋ = J(θ) θ̇`",
                "`det J ≈ 0` 특이점(singularity) 근처에선 감쇠 최소제곱(damped least squares, DLS)"
            ],
            concepts: [
                { term: "작업공간", en: "Workspace", def: "끝점이 닿는 영역 · 2링크는 `|l1−l2| ≤ r ≤ l1+l2`" },
                { term: "다중 해", en: "Multiple IK solutions", def: "같은 끝점에 관절각 조합 여럿 · 관절 한계·이동량으로 선택" },
                { term: "해석적 vs 수치적 IK", en: "Analytical vs numerical inverse kinematics (IK)", def: "닫힌 식: 빠르고 모든 해 · 반복법: 일반 구조, 초기값 의존" },
                { term: "여유자유도", en: "Kinematic redundancy", def: "관절 수 > 작업 자유도 (7축 팔) · 남는 자유도로 회피 동작" }
            ],
            demo: { type: "sim", name: "arm", l1: 1, l2: 0.75 },
            code: [
                {
                    lang: "python",
                    title: "2링크 팔 FK / 해석적 IK",
                    src: `import numpy as np

L1, L2 = 1.0, 0.75

def fk(t1, t2):
    x = L1 * np.cos(t1) + L2 * np.cos(t1 + t2)
    y = L1 * np.sin(t1) + L2 * np.sin(t1 + t2)
    return np.array([x, y])

def ik(x, y, elbow=+1):
    c2 = (x*x + y*y - L1*L1 - L2*L2) / (2 * L1 * L2)   # 코사인 법칙
    if abs(c2) > 1:
        return None                                     # 작업공간 밖
    t2 = elbow * np.arccos(c2)                          # ± : 두 팔꿈치 해
    t1 = np.arctan2(y, x) - np.arctan2(L2 * np.sin(t2), L1 + L2 * np.cos(t2))
    return t1, t2

for e in (+1, -1):
    t = ik(1.2, 0.6, e)
    assert np.allclose(fk(*t), [1.2, 0.6])              # 두 해 모두 같은 점
    print(np.degrees(t))     # [-6.9  80.9]  /  [60.1 -80.9]`,
                    note: "`arctan2` 를 써야 사분면(quadrant)이 맞음 · `arctan(y/x)` 는 x<0 에서 틀림"
                },
                {
                    lang: "python",
                    title: "자코비안 + 감쇠 최소제곱 IK",
                    src: `def jacobian(t1, t2):
    s1, c1 = np.sin(t1), np.cos(t1)
    s12, c12 = np.sin(t1 + t2), np.cos(t1 + t2)
    return np.array([[-L1*s1 - L2*s12, -L2*s12],
                     [ L1*c1 + L2*c12,  L2*c12]])

def ik_dls(target, q, lam=0.05, iters=100):
    for _ in range(iters):
        e = target - fk(*q)                    # 끝점 오차
        if np.linalg.norm(e) < 1e-6:
            break
        J = jacobian(*q)
        # dq = Jᵀ (J Jᵀ + λ² I)⁻¹ e : 특이점에서도 dq 가 유한
        q = q + J.T @ np.linalg.solve(J @ J.T + lam**2 * np.eye(2), e)
    return q

q = ik_dls(np.array([1.2, 0.6]), np.array([0.3, 0.3]))`,
                    note: "λ 가 크면 안정적이지만 수렴이 느림 · 특이점 거리에 따라 λ 를 키우기도 함"
                }
            ],
            optimize: [
                {
                    title: "IK 반복: 의사역행렬(pseudoinverse) → 감쇠 최소제곱",
                    before: { lang: "python", src: `dq = np.linalg.pinv(J) @ e
# 팔을 쭉 편 특이점 근처: 작은 e 에도 dq 폭발 → 관절 튐` },
                    after: { lang: "python", src: `dq = J.T @ np.linalg.solve(J @ J.T + lam**2 * np.eye(2), e)
# 특이 방향 성분을 λ 로 눌러 관절 속도가 유한` },
                    gain: "특이점 근처 안정"
                },
                {
                    title: "제어 루프 IK: 직전 해로 warm start",
                    before: { lang: "python", src: `for target in trajectory:            # 1 kHz 루프
    q = ik_dls(target, np.zeros(2))   # 매번 처음부터 · 다른 해로 튈 수도` },
                    after: { lang: "python", src: `for target in trajectory:
    q = ik_dls(target, q, iters=5)    # 직전 해 근처 · 몇 번이면 수렴` },
                    gain: "반복 수 크게 감소 · 해 점프 없음"
                }
            ],
            glossary: [
                { term: "순기구학", en: "Forward kinematics (FK)", def: "관절 변수로부터 끝점 자세를 계산" },
                { term: "역기구학", en: "Inverse kinematics (IK)", def: "원하는 끝점 자세를 만드는 관절 변수를 계산" },
                { term: "자코비안", en: "Jacobian", def: "관절 속도 → 끝점 속도 선형 사상 · 자세마다 다름" },
                { term: "특이점", en: "Singularity", def: "J 의 랭크 감소 · 특정 방향으로 움직일 수 없고 관절 속도 폭주" },
                { term: "DH 파라미터", en: "Denavit–Hartenberg (DH) parameters", def: "링크마다 a, α, d, θ 4개로 인접 프레임 변환을 정의하는 관례" },
                { term: "자유도", en: "Degrees of freedom (DOF)", def: "독립적으로 바꿀 수 있는 변수 수 · 일반 산업용 팔은 6" }
            ],
            quiz: [
                { q: "링크 1.0, 0.75 인 2링크 팔이 닿는 거리 r 의 범위는? (관절 제한 없음)", options: ["0 ≤ r ≤ 1.75", "0.25 ≤ r ≤ 1.75", "0.75 ≤ r ≤ 1.0", "1.0 ≤ r ≤ 1.75"], a: 1, why: "|l1−l2| ≤ r ≤ l1+l2" },
                { q: "작업공간 내부(경계 아님)의 점에 대한 평면 2링크 IK 해의 수는?", options: ["0", "1", "2", "무한"], a: 2, why: "팔꿈치 위/아래 두 해 · 경계에서는 1개로 합쳐짐" },
                { q: "자코비안 J 가 연결하는 것은?", options: ["관절 속도 → 끝점 속도", "관절 토크 → 관절 가속도", "끝점 위치 → 관절각", "링크 질량 → 관성"], a: 0, why: "ẋ = J(θ) θ̇ · 정역학에선 τ = Jᵀ F 로도 쓰임" },
                { q: "특이점 근처에서 의사역행렬 IK 의 문제는?", options: ["해가 항상 0", "작업공간이 넓어짐", "FK 가 틀려짐", "작은 끝점 이동에도 관절 속도가 폭주"], a: 3, why: "작은 특이값의 역수가 매우 커짐 → DLS 로 완화" },
                { q: "7축 팔(작업 6자유도)의 남는 자유도로 할 수 있는 것은?", options: ["IK 를 항상 닫힌 식으로", "끝점을 고정한 채 팔꿈치를 움직여 장애물 회피", "FK 계산 생략", "모든 특이점 제거"], a: 1, why: "영공간 동작: 끝점은 그대로, 관절 구성만 변경" }
            ],
            refs: [
                { title: "A Kinematic Notation for Lower-Pair Mechanisms Based on Matrices", by: "Denavit et al.", year: 1955, url: "https://doi.org/10.1115/1.4011045", kind: "paper" },
                { title: "Manipulator Inverse Kinematic Solutions Based on Vector Formulations and Damped Least-Squares Methods", by: "Wampler", year: 1986, url: "https://doi.org/10.1109/TSMC.1986.289285", kind: "paper" },
                { title: "Inverse Kinematic Solutions With Singularity Robustness for Robot Manipulator Control", by: "Nakamura et al.", year: 1986, url: "https://doi.org/10.1115/1.3143764", kind: "paper" }
            ]
        },
        {
            id: "pid",
            title: "PID 제어",
            level: 2,
            mins: 14,
            key: [
                "`u = Kp·e + Ki·∫e dt + Kd·de/dt` · e = 목표(setpoint) − 측정(measurement)",
                "P: 빠르게 · I: 정상상태 오차(steady-state error) 제거 · D: 진동 감쇠(damping)",
                "D 는 오차 대신 **측정값**을 미분 → 목표 변경 킥(derivative kick) 없음",
                "출력이 포화(saturation)되면 적분을 멈춤 (**anti-windup**)"
            ],
            concepts: [
                { term: "오버슈트", en: "Overshoot", def: "목표를 넘어서는 최대량 (%) · 보통 Kp, Ki 가 클수록 커짐" },
                { term: "정착시간", en: "Settling time", def: "출력이 목표 ±2% 안에 머물기 시작하는 시간" },
                { term: "정상상태 오차", en: "Steady-state error", def: "충분히 지난 뒤 남는 오차 · 복원력 있는 플랜트는 P 만으론 남음" },
                { term: "이산화", en: "Discretization", def: "고정 주기 dt 로 실행 · 루프 지터는 곧 제어 오차" }
            ],
            demo: { type: "sim", name: "pid", kp: 2, ki: 0.6, kd: 0.4 },
            code: [
                {
                    lang: "cpp",
                    title: "실전형 PID (C++17)",
                    src: `#include <algorithm>

struct Pid {
    double kp, ki, kd;
    double out_min, out_max;
    double tau = 0.02;                 // D 저역통과 시정수 [s]
    double integ = 0, d_f = 0, prev_y = 0;
    bool first = true;

    double step(double ref, double y, double dt) {
        double e = ref - y;
        // D: 측정값 미분 (목표 계단에 킥 없음) + 1차 저역통과
        double d_raw = first ? 0.0 : -(y - prev_y) / dt;
        first = false;
        prev_y = y;
        d_f += dt / (tau + dt) * (d_raw - d_f);

        double u_raw = kp * e + ki * integ + kd * d_f;
        double u = std::clamp(u_raw, out_min, out_max);
        // anti-windup: 포화 방향으로 더 밀 때만 적분 정지
        bool push_hi = u_raw > out_max && e > 0;
        bool push_lo = u_raw < out_min && e < 0;
        if (!push_hi && !push_lo) integ += e * dt;
        return u;
    }
};`,
                    note: "dt 는 실제 경과 시간으로 · 게인(gain)은 양수 가정 · 조건부 적분(conditional integration)"
                },
                {
                    lang: "python",
                    title: "시뮬과 같은 플랜트로 확인",
                    src: `# 플랜트: y'' + 0.6 y' + y = u  (오일러 적분, 목표 = 1)
def simulate(kp, ki, kd, T=12.0, dt=0.004):
    y = v = integ = 0.0
    prev_e = 1.0
    for _ in range(int(T / dt)):
        e = 1.0 - y
        integ += e * dt
        u = kp * e + ki * integ + kd * (e - prev_e) / dt
        prev_e = e
        v += (u - 0.6 * v - y) * dt
        y += v * dt
    return y

print(simulate(3, 0, 0))        # ≈ 0.75 : P 만 → 오차 1/(1+Kp) 남음
print(simulate(4, 1.5, 1.6))    # ≈ 1.00 : I 가 오차 제거, D 가 진동 감쇠`,
                    note: "P 만 쓰면 평형점(equilibrium) y = Kp/(1+Kp) · 위 시뮬의 'P만' 프리셋과 같은 결과"
                }
            ],
            optimize: [
                {
                    title: "D 항: 오차 미분 → 측정 미분 + 저역통과(low-pass filter)",
                    before: { lang: "cpp", src: `double d = kd * (e - prev_e) / dt;
// 목표 계단 변경 → 한 주기에 거대한 스파이크 (derivative kick)
// 센서 노이즈도 1/dt 배로 증폭` },
                    after: { lang: "cpp", src: `double d_raw = -(y - prev_y) / dt;      // 목표와 무관
d_f += dt / (tau + dt) * (d_raw - d_f); // 고주파 노이즈 감쇠
double d = kd * d_f;` },
                    gain: "킥 제거 · 노이즈 증폭↓"
                },
                {
                    title: "적분 와인드업(integral windup) 방지",
                    before: { lang: "cpp", src: `integ += e * dt;                       // 포화 중에도 계속 누적
u = std::clamp(kp * e + ki * integ, -1.0, 1.0);
// 목표 도달 후에도 쌓인 적분이 풀릴 때까지 크게 오버슈트` },
                    after: { lang: "cpp", src: `double u_raw = kp * e + ki * integ;
u = std::clamp(u_raw, -1.0, 1.0);
if (u == u_raw || (u_raw > 1.0) != (e > 0))
    integ += e * dt;                   // 포화를 키우는 방향이면 정지` },
                    gain: "포화 후 오버슈트 크게 감소"
                }
            ],
            glossary: [
                { term: "PID 제어", en: "Proportional–Integral–Derivative (PID) control", def: "오차의 현재·누적·변화율에 비례한 입력을 더하는 피드백 제어" },
                { term: "적분 와인드업", en: "Integral windup", def: "출력 포화 중 적분이 계속 쌓여 큰 오버슈트를 만드는 현상" },
                { term: "미분 킥", en: "Derivative kick", def: "목표 계단 변화를 오차 미분이 스파이크로 증폭하는 현상" },
                { term: "피드포워드", en: "Feedforward", def: "모델로 필요한 입력을 미리 계산 · 피드백은 남은 오차만 처리" },
                { term: "캐스케이드 제어", en: "Cascade control", def: "위치 → 속도 → 전류처럼 루프를 겹침 · 안쪽 루프가 더 빠름" },
                { term: "지글러–니콜스", en: "Ziegler–Nichols", def: "한계 이득과 진동 주기로 초기 게인을 정하는 경험식" }
            ],
            quiz: [
                { q: "스프링처럼 복원력이 있는 플랜트를 P 제어만 하면?", options: ["오차 없이 정확히 수렴", "정상상태 오차가 남음", "항상 발산", "오버슈트가 항상 0"], a: 1, why: "평형에서 u = Kp·e 가 복원력과 맞서야 하므로 e ≠ 0" },
                { q: "Ki 를 과도하게 키우면?", options: ["오버슈트와 진동 증가", "응답이 느려지고 진동 없음", "정상상태 오차 증가", "노이즈에 둔감해짐"], a: 0, why: "누적 오차가 위상 지연을 만들어 진동 경향" },
                { q: "D 항이 센서 노이즈에 민감한 이유는?", options: ["적분 연산이라서", "Kd 는 항상 커야 해서", "미분이 고주파 성분을 증폭", "샘플링이 느려서"], a: 2, why: "미분 이득은 주파수에 비례 · 저역통과 필터와 함께 사용" },
                { q: "anti-windup 이 필요한 상황은?", options: ["센서 노이즈가 클 때", "액추에이터 출력이 포화될 때", "dt 가 아주 작을 때", "Kd = 0 일 때"], a: 1, why: "포화 중엔 적분이 효과 없이 쌓이기만 함" },
                { q: "모터 캐스케이드 제어에서 가장 빠른 루프는?", options: ["위치", "속도", "모두 같은 주기", "전류(토크)"], a: 3, why: "안쪽 루프일수록 빠르게 · 바깥 루프는 안쪽이 이미 추종한다고 가정" }
            ],
            refs: [
                { title: "Optimum Settings for Automatic Controllers", by: "Ziegler et al.", year: 1942, url: "https://doi.org/10.1115/1.4019264", kind: "paper" },
                { title: "Feedback Systems: An Introduction for Scientists and Engineers (2nd ed.)", by: "Åström et al.", year: 2021, url: "https://fbswiki.org/wiki/index.php/Feedback_Systems:_An_Introduction_for_Scientists_and_Engineers", kind: "book" }
            ]
        },
        {
            id: "kalman",
            title: "센서와 칼만 필터",
            level: 3,
            mins: 16,
            key: [
                "예측(prediction, 모델) → 갱신(update, 측정) 반복 · 둘을 **불확실성 비율**로 섞음",
                "1D 칼만 이득(Kalman gain) `K = P/(P+R)` · 측정을 얼마나 믿을지",
                "Q↑ 모델 덜 믿음(빠름·노이지) · R↑ 측정 덜 믿음(매끈·지연)",
                "비선형(nonlinear)이면 EKF(자코비안 선형화) · UKF(시그마 점)"
            ],
            concepts: [
                { term: "상태 x · 공분산 P", en: "State estimate x · error covariance P", def: "추정값과 그 불확실성 · 예측 때 커지고 갱신 때 작아짐" },
                { term: "프로세스 노이즈 Q", en: "Process noise Q", def: "모델이 못 담는 변화 (외란, 미지의 가속)" },
                { term: "측정 노이즈 R", en: "Measurement noise R", def: "센서 분산 · 정지 상태 측정이나 데이터시트로 추정" },
                { term: "이노베이션", en: "Innovation (measurement residual)", def: "`z − Hx̂` · 측정과 예측의 차이 · 크기로 이상치 검출" },
                { term: "센서 특성", en: "Sensor characteristics", def: "IMU: 빠르지만 드리프트 · GPS/카메라: 느리지만 절대 기준" }
            ],
            demo: { type: "sim", name: "kalman", q: 0.002, r: 0.12 },
            code: [
                {
                    lang: "python",
                    title: "등속 모델 칼만 필터 (numpy)",
                    src: `import numpy as np

dt = 0.1
F = np.array([[1, dt], [0, 1]])        # 상태 [위치, 속도] · 등속 모델
H = np.array([[1.0, 0.0]])             # 위치만 측정
sa2 = 0.5                              # 가속도 분산 σa² (모델 불확실성)
Q = sa2 * np.array([[dt**4 / 4, dt**3 / 2],
                    [dt**3 / 2, dt**2]])
R = np.array([[0.3**2]])               # 센서 σ = 0.3 m

def kf_step(x, P, z):
    x = F @ x                          # 1) 예측
    P = F @ P @ F.T + Q
    y = z - H @ x                      # 2) 갱신: 이노베이션
    S = H @ P @ H.T + R
    K = P @ H.T @ np.linalg.inv(S)     # 칼만 이득
    x = x + K @ y
    P = (np.eye(2) - K @ H) @ P
    return x, P

x, P = np.zeros(2), np.eye(2) * 10.0   # 초기 불확실성 크게
for z in [0.10, 0.32, 0.41, 0.68, 0.85, 1.02]:
    x, P = kf_step(x, P, np.array([z]))
print(x)                               # 위치 ≈ 1.0, 속도도 추정됨`,
                    note: "속도는 측정하지 않았지만 위치 변화로부터 함께 추정됨"
                },
                {
                    lang: "python",
                    title: "1D 버전 (위 시뮬과 동일한 식)",
                    src: `x, P = 0.0, 1.0
for z in measurements:
    P += q                  # 예측: 정지 모델, 불확실성만 증가
    K = P / (P + r)         # 이득: P 크면 측정 쪽으로
    x += K * (z - x)        # 갱신
    P *= 1 - K              # 불확실성 감소`
                }
            ],
            optimize: [
                {
                    title: "이득 계산: `inv(S)` 대신 `solve`",
                    before: { lang: "python", src: `K = P @ H.T @ np.linalg.inv(S)   # 역행렬을 명시적으로 계산` },
                    after: { lang: "python", src: `# P, S 대칭 → K = P Hᵀ S⁻¹ = (S⁻¹ H P)ᵀ
K = np.linalg.solve(S, H @ P).T` },
                    gain: "수치 안정↑ · 측정 차원 클수록 이득"
                },
                {
                    title: "공분산(covariance) 갱신: Joseph 형식",
                    before: { lang: "python", src: `P = (I - K @ H) @ P
# 장시간 운용: 반올림 오차로 P 가 비대칭·음수 고유값 → 발산` },
                    after: { lang: "python", src: `IKH = I - K @ H
P = IKH @ P @ IKH.T + K @ R @ K.T   # 대칭·양정치 유지` },
                    gain: "연산 약간↑ · 발산 방지"
                }
            ],
            glossary: [
                { term: "칼만 필터", en: "Kalman filter", def: "선형·가우시안 가정에서 최적인 재귀 상태 추정기" },
                { term: "칼만 이득", en: "Kalman gain", def: "이노베이션을 상태에 얼마나 반영할지 정하는 가중치" },
                { term: "오차 공분산", en: "Error covariance", def: "추정 오차의 분산·상관 행렬 P · 필터의 자기 신뢰도" },
                { term: "EKF", en: "Extended Kalman Filter", def: "비선형 모델을 현재 추정점에서 자코비안으로 선형화한 KF" },
                { term: "센서 퓨전", en: "Sensor fusion", def: "특성이 다른 센서를 결합해 단일 센서보다 나은 추정" },
                { term: "자이로 드리프트", en: "Gyro bias drift", def: "각속도 바이어스가 적분되어 각도 오차가 시간에 따라 커짐" }
            ],
            quiz: [
                { q: "R(측정 노이즈)을 크게 설정하면 추정값은?", options: ["측정을 더 따라가 노이지해짐", "더 부드럽지만 변화에 늦게 반응", "변화 없음", "즉시 발산"], a: 1, why: "측정을 덜 믿어 K 가 작아짐" },
                { q: "칼만 이득 K 가 1 에 가까우면?", options: ["예측을 그대로 사용", "필터가 정지", "P 가 무한대로 발산", "측정을 거의 그대로 사용"], a: 3, why: "x += K(z − x) · K=1 이면 x = z" },
                { q: "예측 단계에서 P 는 보통?", options: ["커진다 (Q 가 더해짐)", "작아진다", "0 이 된다", "항상 R 과 같다"], a: 0, why: "P = FPFᵀ + Q · 측정 없이 시간이 가면 불확실성 증가" },
                { q: "방향 θ 가 들어간 로봇 운동 모델(cos θ, sin θ)에 흔히 쓰는 것은?", options: ["선형 KF 그대로", "EKF (자코비안으로 선형화)", "단순 이동평균", "FFT"], a: 1, why: "비선형 f(x, u) 를 현재 추정점에서 선형화" },
                { q: "자이로와 GPS/카메라를 융합하는 이유는?", options: ["둘 다 드리프트가 없어서", "카메라가 더 빨라서", "자이로는 빠르지만 드리프트, 다른 쪽은 느리지만 절대 기준", "전력을 줄이려고"], a: 2, why: "고주파는 IMU, 저주파(절대값)는 외부 센서가 담당" }
            ],
            refs: [
                { title: "A New Approach to Linear Filtering and Prediction Problems", by: "Kalman", year: 1960, url: "https://doi.org/10.1115/1.3662552", kind: "paper" },
                { title: "An Introduction to the Kalman Filter (TR 95-041)", by: "Welch et al.", year: 1995, url: "https://techreports.cs.unc.edu/papers/95-041.pdf", kind: "paper" },
                { title: "Unscented Filtering and Nonlinear Estimation", by: "Julier et al.", year: 2004, url: "https://doi.org/10.1109/JPROC.2003.823141", kind: "paper" }
            ]
        },
        {
            id: "slam",
            title: "SLAM과 위치 추정",
            level: 3,
            mins: 16,
            key: [
                "SLAM = 지도를 만들면서 그 지도 위 내 위치를 **동시에** 추정",
                "오도메트리(odometry)만 쓰면 오차가 **누적** → 스캔 매칭(scan matching)으로 보정",
                "루프 클로저(loop closure): 와 본 곳 인식 → 쌓인 드리프트(drift)를 궤적(trajectory) 전체에 분산",
                "현대 SLAM 백엔드(back-end)는 대부분 **포즈 그래프(pose graph) 최적화** · 최소제곱(least squares)"
            ],
            concepts: [
                { term: "드리프트", en: "Drift", def: "작은 상대 이동 오차가 적분되어 위치 오차가 계속 커짐" },
                { term: "점유 격자 지도", en: "Occupancy grid map", def: "셀마다 점유 확률 (log-odds 로 누적) · 2D 라이다 SLAM 에 흔함" },
                { term: "프런트엔드 / 백엔드", en: "Front-end / back-end", def: "센서 → 상대 자세·루프 검출 / 전체 그래프 최적화" },
                { term: "파티클 필터 (AMCL)", en: "Particle filter (Adaptive Monte Carlo Localization, AMCL)", def: "지도가 있을 때 위치만 추정 · 샘플 다수로 여러 후보 유지" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "odom", label: "오도메트리", sub: "엔코더 · IMU", x: 0, y: 0 },
                    { id: "pred", label: "예측", sub: "x_k = f(x, u)", x: 1, y: 0 },
                    { id: "scan", label: "스캔 매칭", sub: "ICP / NDT", x: 2, y: 0 },
                    { id: "upd", label: "갱신", sub: "자세 보정 · 지도 추가", x: 3, y: 0 },
                    { id: "loop", label: "루프 클로저", sub: "와 본 곳 인식", x: 3, y: 1 },
                    { id: "graph", label: "그래프 최적화", sub: "min Σ eᵀΩe", x: 2, y: 1 },
                    { id: "map", label: "지도", sub: "일관된 맵 + 궤적", x: 1, y: 1 },
                    { id: "loc", label: "위치 추정", sub: "AMCL · 지도 고정", x: 0, y: 1 }
                ],
                edges: [
                    { from: "odom", to: "pred", label: "u" },
                    { from: "pred", to: "scan", label: "초기값" },
                    { from: "scan", to: "upd", label: "Δpose" },
                    { from: "upd", to: "pred", label: "다음 스캔", arc: "up" },
                    { from: "upd", to: "loop" },
                    { from: "loop", to: "graph", label: "제약 추가" },
                    { from: "graph", to: "map" },
                    { from: "map", to: "loc", label: "재사용" }
                ],
                steps: [
                    { on: ["odom", "odom>pred", "pred"], text: "예측(prediction): 엔코더(encoder)·IMU 이동량 적분 · 불확실성(uncertainty)은 커짐" },
                    { on: ["pred>scan", "scan"], text: "스캔 매칭: 예측 자세(pose)를 초기값(initial guess)으로 스캔을 지도에 정렬(alignment)" },
                    { on: ["scan>upd", "upd"], text: "갱신(update): 매칭 결과로 자세 보정 · 새 스캔을 지도에 추가" },
                    { on: ["upd>pred", "pred"], text: "반복할수록 작은 오차가 **누적** → 긴 복도에서 지도가 휨" },
                    { on: ["upd>loop", "loop"], text: "루프 클로저: 재방문 인식 → '지금 = 그때 그 자리' 제약" },
                    { on: ["loop>graph", "graph"], text: "포즈 그래프: 모든 제약(constraint)의 가중 오차 제곱합을 최소화" },
                    { on: ["graph>map", "map"], text: "드리프트가 궤적 전체에 분산 · 지도 일관성 회복" },
                    { on: ["map>loc", "loc"], text: "완성된 지도는 고정 → 이후엔 위치 추정(localization, AMCL)만" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "1D 포즈 그래프 + 루프 클로저",
                    src: `import numpy as np

# 복도 왕복: 실제 0 → 4 → 0 m, 엔코더가 매 스텝 +0.05 m 치우침
odom = [(0, 1, 1.05), (1, 2, 1.05), (2, 3, 1.05), (3, 4, 1.05),
        (4, 5, -0.95), (5, 6, -0.95), (6, 7, -0.95), (7, 8, -0.95)]
edges = [(i, j, z, 1.0) for i, j, z in odom]   # (i, j, z = x_j − x_i, 정보 ω)
edges.append((0, 8, 0.0, 100.0))               # 루프 클로저: 출발점 재방문

N = 9
A, b = [], []
for i, j, z, w in edges:
    row = np.zeros(N)
    row[j], row[i] = 1.0, -1.0
    A.append(np.sqrt(w) * row)                 # 가중 잔차 √ω (x_j − x_i − z)
    b.append(np.sqrt(w) * z)
row = np.zeros(N); row[0] = 1.0
A.append(1e3 * row); b.append(0.0)             # 기준 고정: x0 = 0

x, *_ = np.linalg.lstsq(np.array(A), np.array(b), rcond=None)
print(np.round(x, 2))   # [0. 1. 2. 3. 4. 3. 2. 1. 0.]  (오도메트리만: 끝점 0.4 m 오차)`,
                    note: "실제 2D/3D 는 회전 때문에 비선형(nonlinear) → Gauss-Newton 반복 (g2o, GTSAM, Ceres)"
                },
                {
                    lang: "bash",
                    title: "ROS 2: 지도 만들기 → 저장 → 위치 추정",
                    src: `# 1) 라이다 SLAM (slam_toolbox, /scan + odom TF 필요)
ros2 launch slam_toolbox online_async_launch.py use_sim_time:=true

# 2) 지도 저장 → office.pgm + office.yaml
ros2 run nav2_map_server map_saver_cli -f ~/maps/office

# 3) 이후엔 지도를 고정하고 AMCL 로 위치만 추정
ros2 launch nav2_bringup localization_launch.py map:=$HOME/maps/office.yaml`
                }
            ],
            optimize: [
                {
                    title: "스캔 매칭 초기값: 항등(identity) → 오도메트리 예측",
                    before: { lang: "python", src: `T = icp(scan, map_pts, init=np.eye(3))
# 정답에서 먼 곳부터 시작 → 반복 많고 엉뚱한 지역 최소` },
                    after: { lang: "python", src: `T_pred = T_prev @ odom_delta        # 예측 단계 결과
T = icp(scan, map_pts, init=T_pred)` },
                    gain: "반복 수↓ · 오정렬 감소"
                },
                {
                    title: "모든 스캔 대신 키프레임(keyframe)만 그래프에",
                    before: { lang: "python", src: `graph.add_node(pose, scan)   # 라이다 10~20 Hz 마다 노드
# 정지해 있어도 노드 증가 → 최적화 비용 계속 증가` },
                    after: { lang: "python", src: `d, th = rel_motion(last_kf, pose)
if d > 0.5 or abs(th) > np.radians(30):  # 충분히 움직였을 때만
    graph.add_node(pose, scan)
    last_kf = pose` },
                    gain: "노드 수·최적화 시간 크게 감소"
                }
            ],
            glossary: [
                { term: "SLAM", en: "Simultaneous Localization and Mapping", def: "지도 작성과 자기 위치 추정을 동시에 수행" },
                { term: "오도메트리", en: "Odometry", def: "바퀴·IMU·카메라로 상대 이동을 적분한 자세 추정" },
                { term: "루프 클로저", en: "Loop closure", def: "이전에 방문한 장소를 인식해 그래프에 제약을 추가" },
                { term: "ICP", en: "Iterative Closest Point", def: "최근접 점 대응 → 강체 변환 추정을 반복해 두 점군을 정렬" },
                { term: "포즈 그래프", en: "Pose graph", def: "노드 = 로봇 자세, 엣지 = 상대 변환 측정 + 정보행렬" },
                { term: "VIO", en: "Visual-Inertial Odometry", def: "카메라와 IMU 를 결합한 오도메트리 · 드론·AR 에 흔함" }
            ],
            quiz: [
                { q: "오도메트리만으로 위치를 추정하면?", options: ["오차가 시간에 따라 누적", "오차가 0 으로 수렴", "지도가 자동 생성", "절대 위치를 알 수 있음"], a: 0, why: "상대 이동의 적분 · 작은 오차도 계속 쌓임" },
                { q: "루프 클로저의 역할은?", options: ["새 센서 추가", "재방문 인식 → 누적 드리프트 보정", "스캔 노이즈 필터링", "모터 속도 제어"], a: 1, why: "닫힌 루프 제약으로 궤적 전체를 다시 맞춤" },
                { q: "포즈 그래프에서 엣지가 나타내는 것은?", options: ["로봇 속도", "지도 셀 점유 확률", "두 자세 사이 상대 변환 측정", "센서 종류"], a: 2, why: "오도메트리·스캔 매칭·루프 클로저 모두 상대 자세 제약" },
                { q: "ICP 가 잘못된 정렬로 수렴하기 쉬운 경우는?", options: ["점이 많을 때", "로봇이 정지했을 때", "라이다 정확도가 높을 때", "초기값이 정답에서 멀 때"], a: 3, why: "최근접 대응이 틀려 지역 최소에 빠짐" },
                { q: "지도가 이미 있을 때 Nav2 가 기본으로 쓰는 위치 추정은?", options: ["EKF SLAM", "AMCL (파티클 필터)", "ICP 매핑", "A* 탐색"], a: 1, why: "지도는 고정하고 라이다 스캔으로 파티클 가중치 갱신" }
            ],
            refs: [
                { title: "Past, Present, and Future of Simultaneous Localization And Mapping: Towards the Robust-Perception Age", by: "Cadena et al.", year: 2016, url: "https://arxiv.org/abs/1606.05830", kind: "paper" },
                { title: "A Tutorial on Graph-Based SLAM", by: "Grisetti et al.", year: 2010, url: "https://doi.org/10.1109/MITS.2010.939925", kind: "paper" },
                { title: "Monte Carlo Localization for Mobile Robots", by: "Dellaert et al.", year: 1999, url: "https://doi.org/10.1109/ROBOT.1999.772544", kind: "paper" },
                { title: "SLAM Toolbox: SLAM for the dynamic world", by: "Macenski et al.", year: 2021, url: "https://doi.org/10.21105/joss.02783", kind: "paper" }
            ]
        },
        {
            id: "ros2",
            title: "ROS 2 노드와 통신",
            level: 2,
            mins: 14,
            key: [
                "노드(node) = 기능 하나 · 토픽(topic) / 서비스(service) / 액션(action)으로 통신",
                "기본 미들웨어(middleware)는 DDS · 마스터(master) 없이 **자동 발견**(discovery)",
                "QoS 가 호환돼야 연결: BEST_EFFORT 발행(publish) ↔ RELIABLE 구독(subscribe) 불가",
                "콜백(callback)은 executor 가 실행 · 긴 콜백은 다른 콜백을 막음"
            ],
            concepts: [
                { term: "토픽", en: "Topic", def: "다대다 비동기 스트림 · 센서 데이터, 속도 명령" },
                { term: "서비스", en: "Service", def: "1:1 요청/응답 · 짧게 끝나는 질의·설정 변경" },
                { term: "액션", en: "Action", def: "목표 → 피드백 → 결과 · 취소 가능 (이동, 집기)" },
                { term: "QoS", en: "Quality of Service", def: "Reliability · Durability · History/Depth 등 전달 정책" },
                { term: "파라미터", en: "Parameter", def: "노드별 설정값 · 실행 중 변경 가능 · launch/YAML 로 주입" }
            ],
            demo: {
                type: "seq",
                actors: ["lidar 노드", "DDS", "avoider 노드", "motor 노드"],
                msgs: [
                    { from: 0, to: 1, label: "참가자 공지", text: "노드 시작 → DDS 참가자(participant)로 **자동 발견** 메시지 멀티캐스트(multicast)" },
                    { from: 2, to: 1, label: "구독 /scan (BEST_EFFORT)", text: "구독자(subscriber)가 토픽 이름·타입·QoS 를 알림" },
                    { from: 1, to: 0, label: "매칭 ✓ QoS 호환", text: "이름·타입 같고 QoS 호환 → 연결 · 비호환이면 경고만 남고 수신 0" },
                    { from: 0, to: 1, label: "publish LaserScan #1", text: "발행: 직렬화(serialization) 후 전송 · 발행자(publisher)는 구독자 수를 몰라도 됨" },
                    { from: 1, to: 2, label: "LaserScan #1", text: "매칭된 모든 구독자에 전달 · executor 가 콜백 실행" },
                    { from: 1, to: 2, label: "LaserScan #2 ✗ 유실", text: "BEST_EFFORT: 재전송 없음 · 센서처럼 최신값이 중요할 때" },
                    { from: 2, to: 3, label: "req SetBool(data=true)", text: "서비스 요청 · 내부적으로 요청/응답 토픽 한 쌍 (역시 DDS)" },
                    { from: 3, to: 3, label: "콜백 처리", text: "서버 콜백은 짧게 · 오래 걸리면 액션으로" },
                    { from: 3, to: 2, label: "res success=true", text: "응답 도착 → future 완료 · 콜백 안에서 동기(synchronous) 대기 금지" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "구독 + 발행 노드 (rclpy)",
                    src: `import rclpy
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from sensor_msgs.msg import LaserScan
from geometry_msgs.msg import Twist

class Avoider(Node):
    def __init__(self):
        super().__init__('avoider')
        self.declare_parameter('stop_dist', 0.5)                 # m
        # 센서 토픽: BEST_EFFORT, depth 5
        self.create_subscription(LaserScan, 'scan', self.on_scan,
                                 qos_profile_sensor_data)
        self.pub = self.create_publisher(Twist, 'cmd_vel', 10)   # RELIABLE, depth 10

    def on_scan(self, msg: LaserScan):
        valid = [r for r in msg.ranges if msg.range_min < r < msg.range_max]
        nearest = min(valid, default=float('inf'))
        stop = self.get_parameter('stop_dist').value
        cmd = Twist()
        cmd.linear.x = 0.0 if nearest < stop else 0.2            # m/s
        cmd.angular.z = 0.5 if nearest < stop else 0.0           # rad/s
        self.pub.publish(cmd)

def main():
    rclpy.init()
    node = Avoider()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()`,
                    note: "실행 중 변경: `ros2 param set /avoider stop_dist 0.8`"
                },
                {
                    lang: "cpp",
                    title: "서비스 서버 (rclcpp)",
                    src: `#include "rclcpp/rclcpp.hpp"
#include "std_srvs/srv/set_bool.hpp"

using SetBool = std_srvs::srv::SetBool;

class MotorNode : public rclcpp::Node {
public:
  MotorNode() : Node("motor") {
    srv_ = create_service<SetBool>("enable",
      [this](const std::shared_ptr<SetBool::Request> req,
             std::shared_ptr<SetBool::Response> res) {
        enabled_ = req->data;
        res->success = true;
        res->message = enabled_ ? "enabled" : "disabled";
        RCLCPP_INFO(get_logger(), "motor %s", res->message.c_str());
      });
  }
private:
  bool enabled_ = false;
  rclcpp::Service<SetBool>::SharedPtr srv_;
};

int main(int argc, char ** argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<MotorNode>());
  rclcpp::shutdown();
}`,
                    note: "호출: `ros2 service call /enable std_srvs/srv/SetBool \"{data: true}\"`"
                }
            ],
            optimize: [
                {
                    title: "콜백 안 서비스 호출: 동기 → 비동기(asynchronous)",
                    before: { lang: "python", src: `def on_timer(self):
    res = self.cli.call(req)
    # 단일 스레드 executor: 응답 처리할 차례가 안 옴 → 데드락` },
                    after: { lang: "python", src: `def on_timer(self):
    fut = self.cli.call_async(req)
    fut.add_done_callback(self.on_response)   # 응답 오면 executor 가 호출` },
                    gain: "데드락 제거 · 다른 콜백 계속 실행"
                },
                {
                    title: "카메라 구독 QoS 맞추기",
                    before: { lang: "python", src: `self.create_subscription(Image, 'camera/image', cb, 10)
# depth 정수 = RELIABLE · 드라이버가 BEST_EFFORT 면 매칭 실패, 수신 0` },
                    after: { lang: "python", src: `self.create_subscription(Image, 'camera/image', cb,
                         qos_profile_sensor_data)  # BEST_EFFORT, depth 5` },
                    gain: "수신 0 → 정상 · 오래된 프레임 적체 없음"
                }
            ],
            glossary: [
                { term: "토픽", en: "Topic", def: "이름 붙은 메시지 채널 · 발행/구독 모델" },
                { term: "액션", en: "Action", def: "목표·피드백·결과·취소를 지원하는 장기 작업 인터페이스" },
                { term: "QoS 프로파일", en: "Quality of Service (QoS) profile", def: "Reliability·Durability·History·Depth 등 전달 정책 묶음" },
                { term: "Executor", en: "Executor", def: "대기 중인 콜백을 꺼내 실행 · 단일/멀티 스레드" },
                { term: "ROS 미들웨어 (rmw)", en: "ROS middleware interface (rmw)", def: "Fast DDS·Cyclone DDS·Zenoh 등을 바꿔 끼우는 추상 계층" },
                { term: "launch 파일", en: "Launch file", def: "여러 노드·파라미터·리매핑을 한 번에 실행하는 스크립트" }
            ],
            quiz: [
                { q: "목표 지점까지 이동시키며 진행률을 받고 취소도 하려면?", options: ["토픽", "서비스", "액션", "파라미터"], a: 2, why: "액션 = 목표 + 주기적 피드백 + 결과 + 취소" },
                { q: "발행자 BEST_EFFORT, 구독자 RELIABLE 이면?", options: ["정상 수신", "QoS 비호환 · 연결 안 됨", "RELIABLE 로 자동 승격", "메시지 절반만 수신"], a: 1, why: "구독자가 발행자보다 강한 보장을 요구하면 매칭 실패" },
                { q: "ROS 2 가 ROS 1 의 roscore(마스터) 없이 동작하는 이유는?", options: ["DDS 의 분산 자동 발견", "노드가 하나뿐이라서", "launch 파일이 마스터 역할", "모든 노드가 같은 프로세스"], a: 0, why: "참가자들이 서로를 직접 찾아 연결" },
                { q: "단일 스레드 executor 콜백 안에서 서비스를 동기 호출하면?", options: ["더 빠름", "자동으로 비동기로 바뀜", "QoS 가 변경됨", "응답 처리가 막혀 데드락 위험"], a: 3, why: "응답을 처리할 executor 가 바로 그 콜백에 묶여 있음" },
                { q: "늦게 시작한 구독자도 마지막 `/map` 을 받으려면 필요한 QoS 는?", options: ["BEST_EFFORT", "VOLATILE", "TRANSIENT_LOCAL", "depth 0"], a: 2, why: "Durability TRANSIENT_LOCAL: 발행자가 최근 샘플을 보관해 늦은 구독자에게 전달" }
            ],
            refs: [
                { title: "Robot Operating System 2: Design, Architecture, and Uses In The Wild", by: "Macenski et al.", year: 2022, url: "https://arxiv.org/abs/2211.07752", kind: "paper" },
                { title: "Quality of Service settings", by: "Open Robotics", url: "https://docs.ros.org/en/lyrical/ROS-Framework/interfaces/topics/About-Quality-of-Service-Settings.html", kind: "doc" },
                { title: "Executors", by: "Open Robotics", url: "https://docs.ros.org/en/lyrical/ROS-Framework/client-libraries/About-Executors/About-Executors.html", kind: "doc" },
                { title: "Synchronous vs. asynchronous service clients", by: "Open Robotics", url: "https://docs.ros.org/en/lyrical/ROS-Framework/interfaces/services/Working-with-services/Sync-Vs-Async.html", kind: "doc" }
            ]
        },
        {
            id: "planning",
            title: "경로 계획 A*·RRT",
            level: 2,
            mins: 14,
            key: [
                "A*: `f = g + h` 가 가장 작은 노드부터 확장(expansion)",
                "h 가 실제 비용을 넘지 않으면(admissible) **최단 경로(shortest path) 보장**",
                "고차원(팔 관절 공간)은 격자(grid) 대신 샘플링(sampling): RRT / RRT*",
                "전역 경로(global path) → 지역 계획기(local planner)가 장애물·동역학(dynamics) 반영"
            ],
            concepts: [
                { term: "f = g + h", def: "g: 출발점부터 실제 비용 · h: 목표까지 추정 비용" },
                { term: "휴리스틱 선택", en: "Choosing a heuristic", def: "4방향 격자 → 맨해튼 · 8방향 → 옥타일 · 자유 이동 → 유클리드" },
                { term: "Dijkstra · Greedy", def: "h=0 이면 Dijkstra (최적, 넓게 탐색) · f=h 는 Greedy (빠름, 비최적)" },
                { term: "샘플링 기반 계획", en: "Sampling-based planning", def: "공간을 무작위 샘플로 탐색 · RRT 는 확률적 완전, RRT* 는 점근적 최적" }
            ],
            demo: { type: "sim", name: "astar" },
            code: [
                {
                    lang: "python",
                    title: "격자 A* (heapq)",
                    src: `import heapq

def astar(grid, start, goal):
    """grid[y][x] == 1 은 벽 · 4방향, 이동 비용 1"""
    h = lambda p: abs(p[0] - goal[0]) + abs(p[1] - goal[1])   # 맨해튼
    g, parent = {start: 0}, {start: None}
    open_ = [(h(start), start)]
    while open_:
        f, cur = heapq.heappop(open_)
        if cur == goal:                          # 부모를 따라 역추적
            path = []
            while cur is not None:
                path.append(cur)
                cur = parent[cur]
            return path[::-1]
        if f > g[cur] + h(cur):                  # 더 나은 값으로 이미 처리됨
            continue
        x, y = cur
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= ny < len(grid) and 0 <= nx < len(grid[0]) and not grid[ny][nx]:
                ng = g[cur] + 1
                if ng < g.get((nx, ny), float('inf')):
                    g[(nx, ny)] = ng
                    parent[(nx, ny)] = cur
                    heapq.heappush(open_, (ng + h((nx, ny)), (nx, ny)))
    return None                                  # 경로 없음`,
                    note: "힙(heap)에서 우선순위만 못 바꾸므로 새 항목을 넣고 낡은 항목은 꺼낼 때 버림"
                },
                {
                    lang: "python",
                    title: "RRT (2D, 목표 편향)",
                    src: `import math, random

def rrt(start, goal, is_free, step=0.3, iters=5000, tol=0.3, lo=0.0, hi=10.0):
    nodes, parent = [start], [None]
    for _ in range(iters):
        q = goal if random.random() < 0.05 else (random.uniform(lo, hi),
                                                   random.uniform(lo, hi))
        i = min(range(len(nodes)), key=lambda k: math.dist(nodes[k], q))
        near, d = nodes[i], math.dist(nodes[i], q)
        if d == 0:
            continue
        t = min(step, d) / d                     # 최대 step 만큼 전진
        new = (near[0] + (q[0] - near[0]) * t, near[1] + (q[1] - near[1]) * t)
        if not is_free(near, new):               # 선분 충돌 검사
            continue
        nodes.append(new)
        parent.append(i)
        if math.dist(new, goal) < tol:
            path, k = [], len(nodes) - 1
            while k is not None:
                path.append(nodes[k])
                k = parent[k]
            return path[::-1]
    return None`,
                    note: "경로가 지그재그 → 후처리로 단축(shortcut)·평활화(smoothing) · 최근접 탐색(nearest-neighbor search)은 KD-tree 로"
                }
            ],
            optimize: [
                {
                    title: "열린 목록(open list): 리스트 최소값 탐색 → 힙",
                    before: { lang: "python", src: `cur = min(open_list, key=lambda n: f[n])   # 매번 O(n)
open_list.remove(cur)                      # 또 O(n)` },
                    after: { lang: "python", src: `f_cur, cur = heapq.heappop(open_)         # O(log n)` },
                    gain: "맵이 클수록 큰 차이"
                },
                {
                    title: "가중 A*(weighted A*): 최적성(optimality) 조금 양보하고 속도",
                    before: { lang: "python", src: `f = g + h          # 최적 · 넓은 맵에서 확장 노드 많음` },
                    after: { lang: "python", src: `f = g + 1.5 * h    # 경로 비용 ≤ 1.5 × 최적 보장` },
                    gain: "확장 노드 대폭 감소"
                }
            ],
            glossary: [
                { term: "A*", en: "A-star search", def: "실제 비용 g + 추정 비용 h 로 우선순위를 매기는 최단 경로 탐색" },
                { term: "허용 휴리스틱", en: "Admissible heuristic", def: "실제 남은 비용을 절대 과대평가하지 않는 h · 최적성 조건" },
                { term: "구성 공간", en: "Configuration space (C-space)", def: "로봇 자세 변수의 공간 · 로봇을 점으로, 장애물은 팽창" },
                { term: "RRT", en: "Rapidly-exploring Random Tree", def: "무작위 샘플 방향으로 트리를 뻗어 고차원 공간을 빠르게 탐색" },
                { term: "코스트맵", en: "Costmap", def: "장애물 + 팽창(inflation) 비용 격자 · Nav2 플래너의 입력" },
                { term: "지역 계획기", en: "Local planner / controller", def: "전역 경로를 따라가며 실시간 장애물·속도 제한 반영 (DWB, MPPI)" }
            ],
            quiz: [
                { q: "A* 에서 h = 0 으로 두면?", options: ["Greedy 탐색", "Dijkstra 와 같음", "경로를 못 찾음", "깊이 우선 탐색"], a: 1, why: "f = g · 거리 순으로 고르게 퍼짐 (위 시뮬에서 확장 노드 비교)" },
                { q: "4방향 이동 격자에서 허용 가능하면서 가장 정보가 많은 휴리스틱은?", options: ["h = 0", "유클리드 거리", "맨해튼 거리", "맨해튼 × 2"], a: 2, why: "벽 없을 때 실제 최소 이동 수와 같음 · ×2 는 과대평가" },
                { q: "Greedy best-first (f = h) 의 특징은?", options: ["빠르지만 최단 보장 없음", "항상 최단 경로", "모든 노드를 확장", "g 만 사용"], a: 0, why: "지나온 비용을 무시해 벽 뒤로 돌아가는 경로를 놓칠 수 있음" },
                { q: "7축 팔의 경로 계획에 격자 A* 대신 RRT 류를 쓰는 이유는?", options: ["격자가 더 정확해서", "RRT 는 항상 최단이라서", "충돌 검사가 필요 없어서", "고차원 격자는 셀 수가 지수적으로 폭증"], a: 3, why: "축당 100칸이면 100⁷ 셀 · 샘플링은 차원에 덜 민감" },
                { q: "가중 A* (f = g + 2h) 의 결과 경로는?", options: ["항상 최적", "최적 비용의 2배 이내", "경로를 찾지 못함", "Dijkstra 와 동일"], a: 1, why: "허용 h 에 ε 를 곱하면 비용 ≤ ε × 최적" }
            ],
            refs: [
                { title: "A Formal Basis for the Heuristic Determination of Minimum Cost Paths", by: "Hart et al.", year: 1968, url: "https://doi.org/10.1109/TSSC.1968.300136", kind: "paper" },
                { title: "Rapidly-Exploring Random Trees: A New Tool for Path Planning (TR 98-11)", by: "LaValle", year: 1998, url: "https://msl.cs.illinois.edu/~lavalle/papers/Lav98c.pdf", kind: "paper" },
                { title: "Sampling-based Algorithms for Optimal Motion Planning", by: "Karaman et al.", year: 2011, url: "https://arxiv.org/abs/1105.1186", kind: "paper" },
                { title: "The Marathon 2: A Navigation System", by: "Macenski et al.", year: 2020, url: "https://arxiv.org/abs/2003.00368", kind: "paper" }
            ]
        }
    ]
});
