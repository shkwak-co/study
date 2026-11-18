LAB.track({
    id: "rag",
    name: "RAG·임베딩",
    icon: "⌕",
    color: "#fb7185",
    tagline: "찾아서 근거로 답하기 — 임베딩, BM25, 하이브리드, 재정렬, 평가, 시스템 설계",
    trends: [
        {
            title: "LLM 기반 임베딩·재정렬 모델",
            when: "2025–2026",
            points: [
                "Qwen3-Embedding / Reranker (2025-06): 0.6B·4B·8B · 32K 입력 · 질문에만 지시문(instruction) · Apache-2.0",
                "4B 임베딩 = 2560차원, **MRL(Matryoshka Representation Learning)**로 32–2560 사이에서 잘라 쓰기",
                "2026-02 jina-embeddings-v5-text-small: 677M · 1024차원 · 32K · 단, 비상업 라이선스(CC-BY-NC-4.0)",
                "2026-08 jina-reranker-v3.5: 0.6B 목록형(listwise) 재정렬 · 모델마다 라이선스 확인 필수"
            ],
            refs: [
                { title: "Qwen3 Embedding: Advancing Text Embedding and Reranking Through Foundation Models", by: "Zhang et al.", year: 2025, url: "https://arxiv.org/abs/2506.05176", kind: "paper" },
                { title: "jina-embeddings-v5-text-small", by: "Jina AI", year: 2026, url: "https://jina.ai/en-US/models/jina-embeddings-v5-text-small/", kind: "doc" },
                { title: "jina-reranker-v3.5: faster listwise reranking", by: "Jina AI", year: 2026, url: "https://jina.ai/news/jina-reranker-v3-5-faster-listwise-reranking-hybrid-attention-self-distillation", kind: "doc" }
            ]
        },
        {
            title: "쓰던 DB 안에서 벡터 검색",
            when: "2024–2026",
            points: [
                "sqlite-vec: SQLite 확장(extension) · `vec0` 가상 테이블 · 안정판 v0.1.9 (2026-03-31)는 전수 비교(brute force)",
                "v0.1.10 알파(2026-03~05)에서 DiskANN 등 근사 인덱스(ANN index) 시험 중 · 아직 v1 이전",
                "pgvector 0.8.7 (2026-10-01): PostgreSQL 안의 벡터 · HNSW·IVFFlat 인덱스",
                "수천~수만 건은 기존 테이블 + 전수 비교로 충분 → 별도 벡터 DB 는 규모가 커질 때"
            ],
            refs: [
                { title: "sqlite-vec: A vector search SQLite extension that runs anywhere", by: "Alex Garcia", url: "https://github.com/asg017/sqlite-vec", kind: "doc" },
                { title: "pgvector CHANGELOG", by: "pgvector", url: "https://github.com/pgvector/pgvector/blob/master/CHANGELOG.md", kind: "doc" }
            ]
        }
    ],
    lessons: [
        {
            id: "rag-overview",
            title: "RAG 한눈에 — 찾고, 넣고, 답하기",
            level: 1,
            mins: 15,
            pre: ["ai/llm", "ai/prompting"],
            checked: "2026-11-18",
            key: [
                "**검색 증강 생성(retrieval-augmented generation)** = 찾기 → 프롬프트에 넣기 → 근거로 답하기",
                "사실은 검색으로, 말투·형식은 **파인튜닝(fine-tuning)**으로 — 기록이 매일 늘면 RAG",
                "맞는 기록이 top-k 에 없으면 모델도 못 맞힘 → 품질은 대부분 검색에서 갈림",
                "답 문장마다 **[#기록번호] 인용(citation)** + 근거 없으면 '유사 기록 없음'",
                "추론 모델 호출 요령: 필요 없으면 thinking 끄기 + `max_tokens` 지정"
            ],
            concepts: [
                { term: "검색 증강 생성", en: "Retrieval-Augmented Generation (RAG)", def: "질문과 관련된 자료를 찾아 프롬프트에 넣고 그 자료를 근거로 답하게 하는 구조" },
                { term: "파라메트릭 지식", en: "Parametric knowledge", def: "학습 때 가중치에 녹아든 지식 · 바꾸려면 다시 학습 · 출처를 댈 수 없음" },
                { term: "근거 기반 답변", en: "Grounded generation", def: "주어진 자료 안의 내용만으로 답하고 출처를 다는 방식" },
                { term: "컨텍스트 예산", en: "Context budget", def: "프롬프트에 넣을 자료 분량 · 늘리면 비용·지연↑, 중간 내용은 덜 쓰임" }
            ],
            demo: {
                type: "seq",
                actors: ["직원", "헬프데스크", "검색", "LLM"],
                msgs: [
                    { from: 0, to: 1, label: "'E-4012 통신 끊김 조치?'", text: "예제 헬프데스크의 '해결 추천' 화면에 질문 입력" },
                    { from: 1, to: 2, label: "유사 기록 찾기", text: "1차 버전: 해결된 티켓 전체에 **단어 겹침(word overlap)** 점수 + 기기·오류 코드 가산점" },
                    { from: 2, to: 1, label: "상위 8건", text: "점수순 상위 8건 · 여기 없는 기록은 모델이 절대 볼 수 없음" },
                    { from: 1, to: 3, label: "기록 8건 + 질문 + 규칙", text: "티켓마다 `#번호 [날짜] 건물 층 / 기기 / 오류 코드` + 현상·조치 · max_tokens 지정" },
                    { from: 3, to: 1, label: "조치 제안 + [#번호]", text: "기록에 있는 조치만 근거로 제안하고 번호를 인용" },
                    { from: 1, to: 1, label: "인용 번호 검사", text: "답에 나온 번호가 넘겨준 8건 안에 있는지 확인 · 없으면 경고" },
                    { from: 1, to: 0, label: "답 + 기록 링크", text: "직원이 원본 티켓을 열어 직접 검증" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "가장 작은 RAG: 단어 겹침 검색 + OpenAI 호환 서버 호출 (표준 라이브러리만)",
                    src: `import json, os, re, urllib.request

BASE = os.environ["LLM_BASE_URL"]        # OpenAI 호환 서버 .../v1 · 주소는 코드에 쓰지 않음
MODEL = os.environ["LLM_MODEL"]

RECORDS = [  # 지어낸 실습용 기록 (실제 업무 기록 아님)
    {"id": 101, "eq": "공유기", "symptom": "와이파이 통신 끊김 오류 E-4012", "action": "랜 케이블 커넥터 재연결"},
    {"id": 105, "eq": "스위치", "symptom": "네트워크 연결 안 됨", "action": "스위치 포트 교체"},
    {"id": 109, "eq": "프린터", "symptom": "용지 걸림 반복", "action": "급지 롤러 청소"},
]

def words(s):
    return set(re.findall(r"[0-9a-z가-힣-]{2,}", s.lower()))

def retrieve(q, k=2):                    # 1차 버전과 같은 발상: 겹치는 단어 수
    scored = [(len(words(q) & words(r["symptom"] + " " + r["action"])), r) for r in RECORDS]
    return [r for s, r in sorted(scored, key=lambda x: -x[0]) if s > 0][:k]

def ask(q):
    hits = retrieve(q)
    ctx = "\\n".join(f"#{r['id']} [{r['eq']}] 현상: {r['symptom']} / 조치: {r['action']}"
                    for r in hits) or "(유사 기록 없음)"
    body = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "과거 기록만 근거로 조치를 제안하고 문장 끝에 [#번호]를 붙여라. "
                                          "근거가 없으면 '유사 기록 없음'이라고만 답하라."},
            {"role": "user", "content": f"과거 유사 기록:\\n{ctx}\\n\\n질문: {q}\\n\\n(한국어로 답하세요.)"},
        ],
        "max_tokens": 400,                                   # 규칙 1: 항상 지정
        "temperature": 0.1,
        "chat_template_kwargs": {"enable_thinking": False},  # 규칙 2: thinking 끄기
    }
    req = urllib.request.Request(f"{BASE}/chat/completions", json.dumps(body).encode(),
                                 {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())["choices"][0]["message"]["content"], hits

answer, hits = ask("E-4012 통신 끊김 조치?")
print(answer)`,
                    note: "`chat_template_kwargs` 는 Qwen3 계열을 vLLM·SGLang 으로 띄운 OpenAI 호환 서버의 thinking 스위치 · 다른 서버는 문서 확인"
                },
                {
                    lang: "python",
                    title: "인용 번호 검사: 넘겨주지 않은 기록 번호를 지어냈는지",
                    src: `def bad_citations(answer, hits):
    cited = {int(n) for n in re.findall(r"#(\\d+)", answer)}
    return sorted(cited - {r["id"] for r in hits})    # 비어 있어야 정상

bad = bad_citations(answer, hits)
if bad:
    answer = f"(주의: 검색되지 않은 기록 {bad} 인용 — 다시 생성 필요)\\n" + answer`,
                    note: "모델 출력은 믿지 말고 검사 · 정규식 한 줄로 '지어낸 출처'를 잡는 가장 싼 방어"
                }
            ],
            optimize: [
                {
                    title: "그냥 묻기 → 기록을 근거로 넣기",
                    before: { lang: "python", src: `messages = [{"role": "user", "content": question}]
# 모델의 일반 지식으로 답 → 우리 기기·오류 코드와 무관한 '그럴듯한' 조치` },
                    after: { lang: "python", src: `ctx = format_records(retrieve(question, k=8))
messages = [{"role": "system", "content": RULES},
            {"role": "user", "content": f"과거 유사 기록:\\n{ctx}\\n\\n질문: {question}"}]` },
                    gain: "우리 기록 기반 + [#번호]로 검증 가능",
                    note: "기록이 늘어도 재학습 없음: 새 기록은 저장 즉시 검색 대상"
                },
                {
                    title: "답 그대로 표시 → 인용 검사 후 표시",
                    before: { lang: "python", src: `return answer` },
                    after: { lang: "python", src: `if bad_citations(answer, hits):
    answer = regenerate(question, hits)   # 1회 재시도, 그래도 나쁘면 경고 문구
return answer` },
                    gain: "지어낸 기록 번호가 화면에 안 나감"
                }
            ],
            glossary: [
                { term: "지식 주입", en: "Knowledge injection", def: "모델에 새 사실을 알게 하는 방법 · 검색으로 넣기(RAG) vs 가중치에 넣기(파인튜닝)" },
                { term: "지식 단절 시점", en: "Knowledge cutoff", def: "학습 데이터가 끝나는 날짜 · 그 뒤 사실은 모델이 모름" },
                { term: "사고 모드", en: "Thinking mode", def: "답 전에 긴 생각 토큰을 만드는 모드 · 켜면 느리고 max_tokens 를 생각에 써 버릴 수 있음" },
                { term: "기록 인용", en: "Record citation", def: "답 문장 끝 [#번호] · 사용자가 원본을 열어 확인하는 고리" }
            ],
            quiz: [
                { q: "매일 새 티켓이 쌓이는 헬프데스크에서 '과거 조치'를 근거로 답하게 하려면?", options: ["기록이 생길 때마다 파인튜닝", "검색해 프롬프트에 넣는 RAG", "더 큰 모델로 교체", "temperature 를 0 으로"], a: 1, why: "새 기록은 저장 즉시 검색 대상 + 출처 제시 · 파인튜닝은 느리고 출처를 못 댐" },
                { q: "답이 틀렸고, 맞는 기록이 프롬프트에 넣은 8건 안에 없었다. 먼저 볼 곳은?", options: ["생성 프롬프트 문구", "검색 단계", "max_tokens 값", "모델 크기"], a: 1, why: "모델은 받은 8건만 봄 · 못 찾은 것을 생성 쪽에서 고칠 수 없음" },
                { q: "답 문장마다 [#기록번호]를 요구하는 주된 이유는?", options: ["프롬프트 토큰을 아끼려고", "원본으로 검증하게", "검색 속도를 높이려고", "답을 더 길게 쓰게 하려고"], a: 1, why: "번호가 있어야 직원이 원본을 열어 보고, 코드로 지어낸 번호도 검사 가능" },
                { q: "thinking 을 켠 채 max_tokens 를 작게 주면 생기기 쉬운 일은?", options: ["답이 더 짧고 정확해짐", "생각에 토큰을 써 답이 잘림", "thinking 이 자동으로 꺼짐", "출력에 아무 차이 없음"], a: 1, why: "생각 토큰도 출력 한도를 씀 · 그래서 필요 없으면 thinking 을 끄고 max_tokens 를 지정" },
                { q: "Ovadia et al. (2023)의 지식 주입 비교 결과는?", options: ["비지도 파인튜닝이 늘 우세", "RAG 가 일관되게 우세", "둘 다 효과가 없음", "모델 크기에만 좌우"], a: 1, why: "기존 지식·새 지식 모두에서 RAG 가 비지도 파인튜닝보다 일관되게 우세하다고 보고" },
                { q: "검색 결과가 0건일 때 가장 나은 동작은?", options: ["일반 지식으로 그럴듯하게 답하기", "직전 질문의 기록을 다시 사용", "'유사 기록 없음'부터 밝히기", "오류 500 을 그대로 돌려주기"], a: 2, why: "근거 없이 지어내면 신뢰를 잃음 · 없다고 밝힌 뒤 일반 점검 순서만 '근거 없음' 표시로" },
                { type: "num", q: "질문 100개 중 맞는 기록이 top-8 에 든 질문이 70개, 그중 63개를 맞혔다. 검색을 고쳐 100개 모두 top-8 에 들면(생성 정확도 63/70 유지) 예상 정답률은?", answer: 0.9, tol: 0.005, why: "생성 정확도 63/70 = 0.9 · 검색이 상한을 정함: 0.7 × 0.9 = 0.63 → 1.0 × 0.9 = 0.9" },
                { type: "num", q: "티켓 6건을 넣는다. 머리줄 60자 + 현상 250자 + 조치 250자(각 최대)면 티켓 부분은 최대 몇 자?", answer: 3360, tol: 0, unit: "자", why: "6 × (60 + 250 + 250) = 3,360자 · 긴 칸은 잘라 넣어 컨텍스트 예산을 지킴" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "import re\nhits = {101, 105, 108}\nanswer = \"커넥터 재연결 [#101], 스위치 교체 [#105], 허브 재인가 [#120]\"\nprint(sorted({int(n) for n in re.findall(r\"#(\\d+)\", answer)} - hits))" }, answer: ["[120]", "120"], why: "인용 {101, 105, 120} − 넘겨준 {101, 105, 108} = {120} · 지어낸 출처" },
                { type: "order", q: "해결 추천 한 번의 흐름", items: ["질문 입력", "해결된 기록에 유사도 점수", "상위 8건 선택", "기록 + 질문 + 규칙으로 프롬프트 조립", "LLM 생성", "인용 번호 검사 후 표시"], why: "앞 셋이 검색, 넷째가 주입, 다섯째가 생성 · 마지막 검사는 코드로" }
            ],
            refs: [
                { title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", by: "Lewis et al.", year: 2020, url: "https://arxiv.org/abs/2005.11401", kind: "paper" },
                { title: "Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs", by: "Ovadia et al.", year: 2023, url: "https://arxiv.org/abs/2312.05934", kind: "paper" },
                { title: "Lost in the Middle: How Language Models Use Long Contexts", by: "Liu et al.", year: 2023, url: "https://arxiv.org/abs/2307.03172", kind: "paper" }
            ]
        },
        {
            id: "embedding",
            title: "임베딩 모델과 코사인 유사도",
            level: 1,
            mins: 18,
            pre: ["rag/rag-overview", "deep-learning/transformer"],
            checked: "2026-11-18",
            key: [
                "**임베딩 모델(embedding model)** = 텍스트 → 고정 길이 벡터 · 뜻이 가까우면 방향이 가까움",
                "**코사인 유사도(cosine similarity)** = 방향만 비교 · 단위 벡터끼리는 내적과 같음",
                "문서·질문은 **같은 모델** · Qwen3-Embedding 은 질문에만 **지시문(instruction)**",
                "4B = 2560차원 · **MRL(Matryoshka Representation Learning)**로 앞부분만 잘라 쓰고 다시 정규화",
                "임베딩 서버가 죽어도(예: 502) 검색이 멈추지 않게 실패 경로부터 설계"
            ],
            concepts: [
                { term: "임베딩 모델", en: "Embedding model", def: "문장을 고정 길이 벡터로 바꾸는 모델 · 비슷한 뜻 = 가까운 방향이 되도록 학습" },
                { term: "바이인코더", en: "Bi-encoder", def: "질문과 문서를 따로 벡터로 만든 뒤 비교 · 문서 벡터를 미리 저장 가능 → 빠름" },
                { term: "풀링", en: "Pooling", def: "토큰별 벡터를 하나로 모으는 방법 · Qwen3-Embedding 은 마지막 토큰(last token)" },
                { term: "마트료시카 표현 학습", en: "Matryoshka Representation Learning (MRL)", def: "앞쪽 차원만 잘라도 쓸 만하게 학습 · 저장 공간을 줄일 때" },
                { term: "지시문", en: "Instruction prefix", def: "질문 앞에 붙이는 과제 설명 `Instruct: …\\nQuery:` · 문서에는 안 붙임" }
            ],
            demo: {
                type: "sim",
                name: "vector",
                docs: [
                    { t: "#101 통신 끊김 · 커넥터 재연결", v: [0.9, 0.2] },
                    { t: "#105 네트워크 연결 안 됨", v: [0.82, 0.38] },
                    { t: "#102 공유 폴더 접근 거부", v: [-0.35, 0.9] },
                    { t: "#103 디스플레이 신호 없음", v: [-0.85, -0.25] },
                    { t: "#104 프린터 용지 걸림", v: [0.1, -0.9] },
                    { t: "네트워크 매뉴얼 통째 (긴 벡터)", v: [1.7, 0.85] }
                ],
                query: [0.8, 0.3],
                k: 2
            },
            code: [
                {
                    lang: "python",
                    title: "임베딩 서버 호출 + 실패 시 대체 벡터 (표준 라이브러리)",
                    src: `import json, math, os, urllib.error, urllib.request, zlib

BASE = os.environ["LLM_BASE_URL"]
EMB_MODEL = os.environ.get("EMB_MODEL", "Qwen/Qwen3-Embedding-4B")
TASK = "Given an IT support question, retrieve past tickets that describe the same fix"

def bigram_vec(t, dim=256):              # 대체용: 글자 2-gram 해시 · 의미가 아니라 철자 유사도
    v = [0.0] * dim
    for a, b in zip(t, t[1:]):
        v[zlib.crc32((a + b).encode()) % dim] += 1
    return v

def embed(texts, query=False):
    if query:                                            # 질문에만 지시문
        texts = [f"Instruct: {TASK}\\nQuery:{t}" for t in texts]
    body = json.dumps({"model": EMB_MODEL, "input": texts}).encode()
    req = urllib.request.Request(f"{BASE}/embeddings", body, {"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read())["data"]
        return [d["embedding"] for d in sorted(data, key=lambda d: d["index"])]
    except (urllib.error.HTTPError, urllib.error.URLError) as e:   # 예: 502 Bad Gateway
        print("임베딩 서버 실패:", e, "→ 2-gram 대체 벡터로 실습만 계속")
        return [bigram_vec(t) for t in texts]

def cos(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b)) or 1)

docs = ["통신 끊김 · 커넥터 재연결", "네트워크 연결 안 됨 · 스위치 포트 교체", "프린터 용지 걸림 · 롤러 청소"]
D = embed(docs)
q = embed(["연결이 자꾸 끊겨요"], query=True)[0]
for d, v in zip(docs, D):
    print(f"{cos(q, v):.3f}  {d}")`,
                    note: "대체 벡터로는 '연결'↔'통신' 같은 바꿔 말하기를 못 잡음 → 서버가 살아나면 같은 코드로 차이를 비교"
                },
                {
                    lang: "python",
                    title: "정규화 한 번 + 내적 · MRL 로 잘라 쓰기 (numpy)",
                    src: `import numpy as np

def unit(m):
    return m / np.linalg.norm(m, axis=-1, keepdims=True)

E = unit(np.asarray(embed(docs), dtype=np.float32))       # (n, 2560) 저장 전에 정규화
q = unit(np.asarray(embed([question], query=True)[0], dtype=np.float32))
scores = E @ q                                            # 단위 벡터끼리 내적 = 코사인

E1024 = unit(E[:, :1024])                                 # MRL: 앞 1024 차원 → 다시 정규화
q1024 = unit(q[:1024])
print(np.corrcoef(scores, E1024 @ q1024)[0, 1])           # 순위가 얼마나 유지되나`,
                    note: "자른 뒤 정규화를 빼먹으면 길이가 달라져 내적 ≠ 코사인"
                }
            ],
            optimize: [
                {
                    title: "질문·문서를 똑같이 → 질문에만 지시문",
                    before: { lang: "python", src: `q = embed([question])[0]` },
                    after: { lang: "python", src: `q = embed([f"Instruct: {TASK}\\nQuery:{question}"])[0]   # 문서 쪽은 그대로` },
                    gain: "Qwen 보고: 지시문 없으면 검색 1–5% 하락",
                    note: "과제 설명은 영어로 쓰는 것이 모델 카드 권장 (학습 때 대부분 영어 지시문)"
                },
                {
                    title: "쌍마다 코사인 공식 → 저장 시 정규화, 검색은 행렬 곱 한 번",
                    before: { lang: "python", src: `scores = [cos(q, v) for v in vectors]      # 매번 제곱근·나눗셈` },
                    after: { lang: "python", src: `E = unit(np.asarray(vectors))   # 한 번만
scores = E @ unit(q)` },
                    gain: "수천 건 검색이 수 ms"
                }
            ],
            glossary: [
                { term: "임베딩 차원", en: "Embedding dimension", def: "벡터 길이 · 0.6B 1024, 4B 2560, 8B 4096 (Qwen3-Embedding)" },
                { term: "단위 벡터화", en: "L2 normalization", def: "벡터를 자기 길이로 나눠 길이 1 로 · 이후 내적 = 코사인" },
                { term: "의미 유사도", en: "Semantic similarity", def: "단어가 달라도 뜻이 같으면 높게 나오는 유사도 · 임베딩의 존재 이유" },
                { term: "다국어 임베딩", en: "Multilingual embedding", def: "여러 언어를 한 공간에 놓음 · 한국어 질문으로 영어 문서 검색 가능" },
                { term: "벡터 공간 불일치", en: "Embedding space mismatch", def: "다른 모델·설정으로 만든 벡터끼리 비교 · 숫자는 나오지만 의미 없음" }
            ],
            quiz: [
                { type: "num", q: "a = (1, 2, 2), b = (2, 0, 1) 의 코사인 유사도는?", answer: 0.596, tol: 0.005, why: "a·b = 2 + 0 + 2 = 4 · |a| = 3, |b| = √5 ≈ 2.236 → 4 / 6.708 ≈ 0.596" },
                { type: "num", q: "2560차원 float32 벡터 하나는 몇 바이트?", answer: 10240, tol: 0, unit: "B", why: "2560 × 4 B = 10,240 B (10 KiB)" },
                { type: "num", q: "코사인 유사도가 0.8 인 두 **단위 벡터** 사이의 L2 거리는?", answer: 0.632, tol: 0.005, why: "|a − b|² = 2 − 2cos = 0.4 → √0.4 ≈ 0.632 · 단위 벡터면 코사인 순위 = L2 순위" },
                { type: "text", q: "출력은? (소수 둘째 자리)", code: { lang: "python", src: "import numpy as np\na = np.array([3., 4.])\nb = np.array([6., 8.])\nprint(round(float(a @ b / np.linalg.norm(a) / np.linalg.norm(b)), 2))" }, answer: ["1.0", "1"], why: "b = 2a · 길이만 다르고 방향이 같아 코사인 1" },
                { q: "임베딩 모델을 4B → 8B 로 바꿨다. 저장된 기록 벡터는?", options: ["모두 다시 임베딩", "차원만 잘라 재사용", "정규화만 다시", "질문만 새 모델로"], a: 0, why: "모델마다 공간이 다름 · 차원(2560 vs 4096)도 다름 · 섞으면 조용히 틀림" },
                { q: "Qwen3-Embedding 에서 지시문(Instruct)을 붙이는 쪽은?", options: ["질문에만", "문서에만", "둘 다 같은 문장", "어느 쪽도 안 붙임"], a: 0, why: "모델 카드: 문서에는 지시문이 필요 없음 · 질문에 빼면 1–5% 하락" },
                { q: "MRL 로 2560 → 1024 차원으로 자른 뒤 꼭 할 일은?", options: ["그대로 저장", "평균값을 빼서 중심 맞추기", "다시 L2 정규화", "부호 비트만 남기기"], a: 2, why: "잘리면 길이가 1 이 아니게 됨 · 정규화해야 내적 = 코사인" },
                { q: "임베딩 서버가 502 를 돌려줄 때 바람직한 동작은?", options: ["질문 처리를 멈추고 오류 화면만 표시", "무작위 벡터로 대체해서 그대로 진행", "키워드로 답 + '의미 검색 꺼짐'", "어제 질문의 벡터를 재사용"], a: 2, why: "의미 검색은 보조 다리 · 꺼져도 키워드로 계속하고 사용자에게 알림" },
                { q: "'통신 끊김'과 '연결 안 됨'이 키워드로는 안 맞고 임베딩으로는 맞는 이유는?", options: ["임베딩이 철자 모양을 비교해서", "단어가 달라도 뜻이 같은 방향", "두 문장 길이가 비슷해서", "오류 코드가 같은 티켓이라서"], a: 1, why: "임베딩은 학습된 의미 공간 · 단어가 하나도 안 겹쳐도 가까울 수 있음" },
                { type: "order", q: "임베딩 검색 준비와 질의 순서", items: ["기록을 임베딩용 텍스트로", "문서 임베딩 (지시문 없음)", "L2 정규화 후 저장", "질문 = 지시문 + 질문 → 임베딩", "정규화 후 내적으로 top-k"], why: "앞 셋은 저장 때 한 번, 뒤 둘은 질문마다 · 정규화는 양쪽 다" }
            ],
            refs: [
                { title: "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks", by: "Reimers et al.", year: 2019, url: "https://arxiv.org/abs/1908.10084", kind: "paper" },
                { title: "Qwen3-Embedding-4B model card", by: "Qwen", year: 2025, url: "https://huggingface.co/Qwen/Qwen3-Embedding-4B", kind: "doc" },
                { title: "Matryoshka Representation Learning", by: "Kusupati et al.", year: 2022, url: "https://arxiv.org/abs/2205.13147", kind: "paper" },
                { title: "MTEB: Massive Text Embedding Benchmark", by: "Muennighoff et al.", year: 2022, url: "https://arxiv.org/abs/2210.07316", kind: "paper" }
            ]
        },
        {
            id: "keyword",
            title: "키워드 검색 — 단어 겹침에서 BM25까지",
            level: 1,
            mins: 18,
            pre: ["rag/rag-overview"],
            checked: "2026-11-18",
            key: [
                "단순한 1차 검색 = **단어 겹침(word overlap)** + 코드 가산점 → 바꿔 말하면 못 찾음",
                "**BM25** = 드문 단어에 큰 점수(IDF) + 반복은 포화(k1) + 긴 문서 보정(b)",
                "한국어는 **토큰화(tokenization)**가 절반: 조사·띄어쓰기·활용형('끊김'≠'끊겨서')",
                "오류 코드·기기명·부품 번호처럼 **정확히 같은 문자열**은 키워드가 강함",
                "SQLite 에는 FTS5 + `bm25()` 내장 · 단, 한국어 조사는 안 떼어 줌"
            ],
            concepts: [
                { term: "단어 겹침", en: "Word overlap", def: "질문과 문서가 공유하는 단어 수 · 흔한 단어와 드문 단어를 똑같이 셈" },
                { term: "역문서 빈도", en: "Inverse Document Frequency (IDF)", def: "그 단어가 든 문서가 적을수록 큰 값 · '교체'보다 'E-4012'가 무거움" },
                { term: "BM25", en: "Okapi BM25", def: "IDF × 포화된 단어 빈도 × 문서 길이 보정 · 기본값 k1 = 1.2, b = 0.75" },
                { term: "형태소 분석", en: "Morphological analysis", def: "'통신이' → '통신' + '이' 처럼 어간·조사를 나눔 · 한국어 키워드 검색의 품질 열쇠" },
                { term: "역색인", en: "Inverted index", def: "단어 → 그 단어가 든 문서 목록 · 전체를 훑지 않고 후보만 꺼냄" }
            ],
            demo: { type: "sim", name: "hybrid", mode: "bm25", preset: 0 },
            code: [
                {
                    lang: "python",
                    title: "BM25 직접 구현 (30줄) — 실험과 같은 토크나이저",
                    src: `import math, re
from collections import Counter

PARTICLES = ("에서", "으로", "이나", "은", "는", "이", "가", "을", "를", "에", "의", "로", "와", "과", "도", "만")

def tok(s):
    out = []
    for w in re.findall(r"[0-9a-z가-힣]+(?:-[0-9a-z]+)*", s.lower()):
        if re.search(r"[가-힣]$", w) and len(w) > 2:
            w = next((w[:-len(p)] for p in PARTICLES if w.endswith(p)), w)   # 조사 하나 떼기
        if len(w) >= 2:
            out.append(w)
    return out

def bm25_scores(docs, q, k1=1.2, b=0.75):
    D = [tok(d) for d in docs]
    N, avg = len(D), sum(map(len, D)) / len(D)
    df = Counter(w for d in D for w in set(d))
    scores = []
    for d in D:
        tf, s = Counter(d), 0.0
        for w in set(tok(q)):
            if tf[w]:
                idf = math.log(1 + (N - df[w] + 0.5) / (df[w] + 0.5))
                s += idf * tf[w] * (k1 + 1) / (tf[w] + k1 * (1 - b + b * len(d) / avg))
        scores.append(s)
    return scores`,
                    note: "idf 식은 Lucene·Elasticsearch 와 같은 꼴(항상 양수) · 조사 떼기는 흉내일 뿐, 실무는 형태소 분석(morphological analysis) 도구"
                },
                {
                    lang: "python",
                    title: "SQLite FTS5 내장 BM25 — 따로 서버 없이",
                    src: `import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE VIRTUAL TABLE rec_fts USING fts5(body)")     # 기본 unicode61: 공백·기호로 분리
db.executemany("INSERT INTO rec_fts(rowid, body) VALUES (?, ?)", [
    (101, "와이파이 통신 끊김 오류 E-4012"),
    (111, "통신이 끊겨서 커넥터 재연결"),
])
rows = db.execute("SELECT rowid FROM rec_fts WHERE rec_fts MATCH ? ORDER BY bm25(rec_fts)",
                  ("통신",)).fetchall()
print(rows)   # [(101,)] ← '통신이'는 다른 토큰이라 111 은 안 나옴`,
                    note: "`bm25()`는 작을수록(더 음수) 관련 · trigram 토크나이저는 부분 문자열을 찾지만 질의가 3글자 이상이어야 함"
                }
            ],
            optimize: [
                {
                    title: "겹친 단어 수 세기 → BM25",
                    before: { lang: "python", src: `score = len(tokens(q) & tokens(record))   # '교체' 하나 = 'E-4012' 하나` },
                    after: { lang: "python", src: `score = bm25_scores(all_records, q)[i]     # 드문 단어일수록 무겁게` },
                    gain: "흔한 단어('교체', '점검')가 순위를 덜 흔듦",
                    note: "오류 코드·기기명 일치에 가산점을 주는 것도 같은 발상을 손으로 하는 것"
                },
                {
                    title: "파이썬으로 전부 훑기 → 역색인(FTS5)",
                    before: { lang: "python", src: `for r in all_resolved_records:           # 매 질문마다 전체 토큰화
    score(r)` },
                    after: { lang: "sql", src: `SELECT rowid FROM rec_fts
WHERE rec_fts MATCH :q ORDER BY bm25(rec_fts) LIMIT 50;` },
                    gain: "후보만 꺼내 수 ms · 기록이 수만 건이 돼도 그대로"
                }
            ],
            glossary: [
                { term: "불용어", en: "Stop word", def: "너무 흔해 검색에 도움이 안 되는 말 ('조치', '확인') · 빼거나 IDF 로 가볍게" },
                { term: "문서 빈도", en: "Document frequency (df)", def: "그 단어가 한 번이라도 나온 문서 수 · IDF 의 재료" },
                { term: "빈도 포화", en: "Term-frequency saturation", def: "같은 단어가 반복돼도 점수가 끝없이 늘지 않게 · k1 이 포화 속도" },
                { term: "트라이그램 토크나이저", en: "Trigram tokenizer", def: "SQLite FTS5 의 3글자 단위 색인 · 부분 문자열 검색, 2글자 질의는 못 찾음" },
                { term: "문서 길이 정규화", en: "Document length normalization", def: "긴 문서가 단어를 많이 품어 유리해지는 것을 보정 · BM25 의 b" }
            ],
            quiz: [
                { type: "num", q: "문서 13건 중 3건에 든 단어의 IDF 는? ln(1 + (N − n + 0.5)/(n + 0.5))", answer: 1.386, tol: 0.005, why: "(13 − 3 + 0.5)/(3 + 0.5) = 3 → ln 4 ≈ 1.386" },
                { type: "num", q: "k1 = 1.2, b = 0.75, 문서 길이 = 평균일 때 단어가 2번 나오면 빈도 부분 f(k1+1)/(f + k1) 은?", answer: 1.375, tol: 0.001, why: "2 × 2.2 / (2 + 1.2) = 4.4 / 3.2 = 1.375 · 1번이면 1.0 → 두 배가 아니라 1.375 배 (포화)" },
                { type: "num", q: "같은 조건에서 단어 1번, 문서 길이가 평균의 2배면 빈도 부분은?", answer: 0.71, tol: 0.005, why: "1 × 2.2 / (1 + 1.2 × (0.25 + 0.75 × 2)) = 2.2 / 3.1 ≈ 0.71 · 긴 문서는 깎임" },
                { type: "text", q: "위 BM25 코드의 `tok(\"통신이 끊겨서 E-4012 떴음\")` 결과를 쉼표로", answer: ["통신,끊겨서,e-4012,떴음", "통신, 끊겨서, e-4012, 떴음", "['통신','끊겨서','e-4012','떴음']"], why: "'통신이' → 조사 '이' 떼기 · '끊겨서'는 조사가 아니라 활용 어미라 그대로 → '끊김'과 안 맞음" },
                { q: "단어 겹침 검색에서 '통신 끊김' 질문이 '연결 안 됨' 티켓을 못 찾는 이유는?", options: ["IDF 가 너무 낮아서", "공유하는 단어가 없어서", "기록이 너무 길어서", "오류 코드가 없어서"], a: 1, why: "단어 겹침 0 → 점수 0 · 바꿔 말하기는 키워드 검색의 구조적 한계" },
                { q: "BM25 의 b 를 0 으로 두면?", options: ["IDF 계산이 꺼짐", "반복 횟수를 무시함", "문서 길이 보정이 꺼짐", "모든 점수가 0 이 됨"], a: 2, why: "분모의 (1 − b + b·len/avg) 가 1 로 고정 · 길이와 무관" },
                { q: "k1 이 조절하는 것은?", options: ["문서 길이 보정의 세기", "드문 단어에 주는 가중치", "같은 단어 반복의 포화", "돌려줄 결과의 개수"], a: 2, why: "k1 이 작을수록 빨리 포화 · 0 이면 반복 무시 · 길이 보정은 b" },
                { q: "'본관 3층' 질문에서 3층 티켓이 안 나온 키워드 쪽 원인은?", options: ["3층 티켓이 너무 오래돼서", "'3층'을 단어로만 다뤄서", "IDF 가 음수로 뒤집혀서", "형태소 분석기가 '본관'을 지워서"], a: 1, why: "건물·층은 단어가 아니라 조건 · 티켓의 층 칸 값(3)과 질문의 '3층'은 같은 문자열이 아님 → 필터로 (하이브리드 강)" },
                { q: "SQLite FTS5 `bm25()` 값의 해석은?", options: ["값이 클수록 더 관련 있음", "작을수록(더 음수) 관련", "0에서 1 사이의 확률값", "1부터 매긴 순위 정수"], a: 1, why: "FTS5 는 오름차순 정렬이 곧 관련도순이 되게 부호를 뒤집어 돌려줌" },
                { type: "order", q: "BM25 점수 계산 순서", items: ["질문·문서 토큰화", "단어별 문서 빈도 → IDF", "문서 안 반복 횟수와 길이 보정", "단어별 점수 합", "점수순 정렬"], why: "IDF 는 전체 문서에서, 빈도·길이는 문서마다 · 마지막에 더해서 정렬" }
            ],
            refs: [
                { title: "The Probabilistic Relevance Framework: BM25 and Beyond", by: "Robertson et al.", year: 2009, url: "https://doi.org/10.1561/1500000019", kind: "paper" },
                { title: "SQLite FTS5 Extension", by: "SQLite", url: "https://www.sqlite.org/fts5.html", kind: "doc" },
                { title: "Similarity module (BM25 defaults k1 = 1.2, b = 0.75)", by: "Elastic", url: "https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-similarity.html", kind: "doc" }
            ]
        },
        {
            id: "hybrid",
            title: "하이브리드 검색과 RRF",
            level: 2,
            mins: 20,
            pre: ["rag/embedding", "rag/keyword"],
            checked: "2026-11-18",
            key: [
                "의미 검색은 한국어·바꿔 말하기에 강함: MIRACL 한국어 nDCG@10 69.9 vs BM25 37.1",
                "키워드는 고유명사·코드에 강함: EntityQuestions top-20 BM25 72.0 vs DPR 49.7",
                "**RRF(reciprocal rank fusion)** = Σ 1/(k + 순위) · 점수 단위가 달라도 순위만으로 합침",
                "건물·층·기간은 단어가 아니라 **메타데이터 필터(metadata filter)**",
                "오류 코드가 정확히 맞은 티켓은 **고정(pinning)** — 융합이 밀어내지 않게"
            ],
            concepts: [
                { term: "하이브리드 검색", en: "Hybrid search", def: "키워드(희소) 검색과 의미(밀집) 검색 결과를 합침 · 서로의 약점을 메움" },
                { term: "RRF", en: "Reciprocal Rank Fusion", def: "각 목록의 순위로 1/(k + rank) 를 더함 · k = 60 이 원 논문 값" },
                { term: "볼록 결합", en: "Convex combination", def: "α·키워드 점수 + (1−α)·의미 점수 · 점수 정규화와 α 튜닝이 필요, 잘 맞추면 RRF 보다 나음" },
                { term: "메타데이터 필터", en: "Metadata filter", def: "건물·층·기간처럼 정해진 칸 값으로 후보를 먼저 거름 · 유사도로 풀 문제가 아님" }
            ],
            demo: { type: "sim", name: "hybrid", mode: "hybrid", preset: 2 },
            code: [
                {
                    lang: "python",
                    title: "필터 → 두 다리 → RRF → 코드 일치 고정",
                    src: `import re

def rrf(*lists, k=60):
    score = {}
    for lst in lists:
        for rank, rid in enumerate(lst, 1):
            score[rid] = score.get(rid, 0) + 1 / (k + rank)
    return sorted(score, key=score.get, reverse=True)

FLOOR = re.compile(r"(\\d+)\\s*층")
CODE = re.compile(r"\\b[A-Z]-\\d{4}\\b")

def hybrid(q, records, top=8):
    m = FLOOR.search(q)
    bldg = next((b for b in ("본관", "별관") if b in q), None)
    cand = [r for r in records
            if (not m or r["floor"] == int(m.group(1))) and (not bldg or r["bldg"] == bldg)]
    codes = set(CODE.findall(q.upper()))
    pinned = [r["id"] for r in cand if r.get("code") in codes]      # 정확 일치는 맨 위
    kw = bm25_rank(q, cand)[:50]                                       # 키워드 다리
    dense = dense_rank(q, cand)[:50]                                   # 의미 다리 (서버 장애면 [])
    fused = [i for i in rrf(kw, dense) if i not in pinned]
    return (pinned + fused)[:top]`,
                    note: "의미 다리가 비어도(`[]`) RRF 는 키워드 목록만으로 순위를 만듦 → 장애 시 자연스러운 강등"
                },
                {
                    lang: "sql",
                    title: "필터는 SQL 에서: 후보를 먼저 줄이고 벡터 비교",
                    src: `SELECT r.id, v.vec
FROM records r
JOIN record_vec v ON v.record_id = r.id
WHERE r.status = 'resolved'
  AND r.building = :building       -- 질문에서 읽은 건물
  AND r.floor = :floor             -- 질문에서 읽은 층
  AND v.model = :model;            -- 다른 모델 벡터는 섞지 않음`,
                    note: "사전 필터(pre-filtering): 거른 뒤 top-k · 거꾸로 top-k 뒤에 거르면 3층 티켓이 0건일 수 있음"
                }
            ],
            optimize: [
                {
                    title: "점수 더하기 → RRF",
                    before: { lang: "python", src: `score = bm25[i] + cosine[i]   # BM25 는 0~10+, 코사인은 -1~1 → 키워드가 독식` },
                    after: { lang: "python", src: `order = rrf(bm25_order, dense_order, k=60)   # 순위만 사용` },
                    gain: "점수 스케일 맞추기 불필요",
                    note: "평가셋이 생기면 볼록 결합(α 튜닝)과 비교해 볼 만함 (Bruch et al.)"
                },
                {
                    title: "'3층'을 단어로 → 필터로",
                    before: { lang: "python", src: `hits = search("본관 3층 통신 끊김", all_records)
# 다른 층의 '통신 끊김' 티켓이 상위를 차지` },
                    after: { lang: "python", src: `floor, bldg = parse_conditions(q)      # 3, '본관'
hits = search(q, [r for r in all_records if r["floor"] == floor and r["bldg"] == bldg])` },
                    gain: "실험 프리셋 3: recall@3 0 → 1"
                }
            ],
            glossary: [
                { term: "상호 순위 융합", en: "Reciprocal Rank Fusion (RRF)", def: "score(d) = Σ 1/(k + rank_i(d)) · 순위만 쓰는 융합" },
                { term: "밀집 검색", en: "Dense retrieval", def: "임베딩 벡터의 유사도로 찾는 검색 · 대부분의 차원이 0 이 아님" },
                { term: "희소 검색", en: "Sparse retrieval", def: "단어 단위 가중치(BM25 등)로 찾는 검색 · 대부분의 단어 칸이 0" },
                { term: "사전 필터", en: "Pre-filtering", def: "유사도 계산 전에 조건으로 후보를 거름 · 조건에 맞는 결과가 반드시 남음" },
                { term: "정확 일치 고정", en: "Exact-match pinning", def: "코드·ID 가 정확히 맞은 결과를 융합 순위와 상관없이 맨 위에" }
            ],
            quiz: [
                { type: "num", q: "k = 60. 어떤 기록이 키워드 1위, 의미 3위다. RRF 점수는? (소수 넷째 자리)", answer: 0.0323, tol: 0.0001, why: "1/61 + 1/63 ≈ 0.01639 + 0.01587 = 0.03227" },
                { type: "num", q: "같은 기록을 k = 1 로 계산하면?", answer: 0.75, tol: 0.001, why: "1/2 + 1/4 = 0.75 · k 가 작을수록 1위가 압도적, 크면 순위 차이가 완만" },
                { type: "text", q: "k = 60, 키워드 목록 [A, B, C], 의미 목록 [C, A, D]. RRF 순서를 쉼표로", answer: ["A,C,B,D", "ACBD", "A, C, B, D"], why: "A = 1/61 + 1/62 ≈ 0.0325 · C = 1/63 + 1/61 ≈ 0.0323 · B = 1/62 · D = 1/63" },
                { type: "num", q: "실험(프리셋 1 '모니터 화면이 안 나옴', 필터 끔)에서 **키워드** 방식의 recall@3 은?", answer: 0.5, tol: 0.001, why: "정답 #103·#113 중 '모니터'가 겹치는 #113 만 · #103 은 '디스플레이 신호'라 단어 0개 겹침" },
                { q: "MIRACL 한국어에서 BM25 37.1 vs 밀집 69.9 (nDCG@10) 가 말하는 것은?", options: ["BM25 는 한국어를 처리하지 못함", "자연어 질문엔 의미 검색이 크게 유리", "밀집 검색이 오류 코드명까지 더 잘 찾음", "두 방식 차이는 오차 범위 안"], a: 1, why: "BGE-M3 논문 표 · 자연어 질문과 문서 표현이 다른 경우 의미 검색이 크게 유리" },
                { q: "EntityQuestions (BM25 72.0 vs DPR 49.7, top-20)가 말하는 것은?", options: ["DPR 이 모든 질문 유형에서 앞섬", "top-20 에선 두 방식 차이가 사라짐", "고유명사 질문엔 키워드가 강함", "BM25 가 바꿔 말하기에도 강함"], a: 2, why: "드문 이름은 의미 벡터가 뭉개기 쉬움 · 오류 코드·부품 번호도 같은 부류" },
                { q: "Bruch et al. (2022) 결론과 맞는 것은?", options: ["RRF 가 어떤 조건에서도 최고", "튜닝한 볼록 결합이 RRF 를 앞섬", "융합하면 단일 검색보다 늘 더 나쁨", "BM25 단독이 항상 최고"], a: 1, why: "평가셋이 있으면 α 튜닝이 이김 · 평가셋이 없을 땐 RRF 가 안전한 기본값" },
                { q: "'본관 3층' 질문에서 3층 티켓이 0건 — 첫 수는?", options: ["top-k 를 8 → 20 으로 늘리기", "질문의 건물·층으로 후보 거르기", "temperature 를 낮추기", "'3층' 동의어를 사전에 추가"], a: 1, why: "조건은 필터로 · top-k 를 늘려도 다른 층 티켓이 여전히 앞에 옴" },
                { q: "질문이 'E-4012' 뿐이라 의미 벡터가 쓸모없을 때 하이브리드가 여전히 찾는 이유는?", options: ["의미 벡터가 코드 문자열을 외워서", "조건 필터가 코드를 대신 읽어서", "재정렬기가 코드를 대신 찾아 줘서", "키워드 목록만으로 순위가 남아서"], a: 3, why: "한 다리가 비면 다른 다리 순위가 그대로 남음 · 정확 일치 고정까지 하면 더 확실" },
                { type: "order", q: "하이브리드 질의 순서", items: ["질문에서 건물·층·코드 읽기", "조건으로 후보 거르기", "키워드 top-50 · 의미 top-50", "RRF 로 합치기", "코드 정확 일치 기록을 맨 위에", "상위 8건을 프롬프트로"], why: "거르기는 먼저, 고정은 융합 뒤에 · 순서가 바뀌면 조건 밖 기록이 섞이거나 코드 일치가 밀림" }
            ],
            refs: [
                { title: "M3-Embedding: Multi-Linguality, Multi-Functionality, Multi-Granularity Text Embeddings Through Self-Knowledge Distillation", by: "Chen et al.", year: 2024, url: "https://arxiv.org/abs/2402.03216", kind: "paper" },
                { title: "Simple Entity-Centric Questions Challenge Dense Retrievers", by: "Sciavolino et al.", year: 2021, url: "https://arxiv.org/abs/2109.08535", kind: "paper" },
                { title: "Reciprocal Rank Fusion outperforms Condorcet and Individual Rank Learning Methods", by: "Cormack et al.", year: 2009, url: "https://doi.org/10.1145/1571941.1572114", kind: "paper" },
                { title: "An Analysis of Fusion Functions for Hybrid Retrieval", by: "Bruch et al.", year: 2022, url: "https://arxiv.org/abs/2210.11934", kind: "paper" }
            ]
        },
        {
            id: "chunking",
            title: "청킹과 임베딩용 텍스트",
            level: 2,
            mins: 18,
            pre: ["rag/embedding"],
            checked: "2026-11-18",
            key: [
                "짧은 조치 기록은 **기록 1건 = 청크(chunk) 1개** · 긴 매뉴얼만 자름",
                "임베딩용 텍스트는 뜻 있는 칸만 **템플릿(template)**으로: 기기·현상·원인·조치",
                "**얇은 기록(thin record)**('리셋함' 한 줄)은 검색도 답도 약함 → 입력 단계에서 보강",
                "긴 문서: 제목 경계로 수백 토큰 + **겹침(overlap)** + 상위 제목을 머리에",
                "청크 앞 맥락 한 줄(contextual header): Anthropic 측정 top-20 실패 −35%"
            ],
            concepts: [
                { term: "청크", en: "Chunk", def: "검색·임베딩의 단위가 되는 조각 · 너무 크면 주제가 섞이고 너무 작으면 문맥이 끊김" },
                { term: "겹침", en: "Overlap", def: "이웃 청크가 경계 부분을 공유 · 경계에 걸린 문장이 양쪽에서 검색됨" },
                { term: "맥락 머리말", en: "Contextual chunk header", def: "청크 앞에 붙이는 '어느 문서·어느 절' 한 줄 · 보통 50–100 토큰" },
                { term: "얇은 기록", en: "Thin record", def: "현상·조치가 몇 글자뿐인 기록 · 벡터가 흐릿하고 답의 근거도 안 됨" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "rec", label: "티켓", sub: "칸 10여 개", x: 0, y: 0 },
                    { id: "pick", label: "칸 고르기", sub: "날짜·작성자 제외", x: 1, y: 0 },
                    { id: "tpl", label: "템플릿", sub: "[기기] 현상 / 조치", x: 2, y: 0 },
                    { id: "thin", label: "얇음 검사", sub: "조치 < 10자?", x: 3, y: 0 },
                    { id: "man", label: "긴 매뉴얼", sub: "수십 쪽", x: 0, y: 1 },
                    { id: "head", label: "제목 분할", sub: "# · ## 경계", x: 1, y: 1 },
                    { id: "ovl", label: "겹침", sub: "앞 청크 끝 일부", x: 2, y: 1 },
                    { id: "ctx", label: "머리말", sub: "문서 > 절 제목", x: 3, y: 1 },
                    { id: "emb", label: "임베딩", sub: "한도 안 길이", x: 3, y: 2 }
                ],
                edges: [
                    { from: "rec", to: "pick" }, { from: "pick", to: "tpl" }, { from: "tpl", to: "thin" },
                    { from: "man", to: "head" }, { from: "head", to: "ovl" }, { from: "ovl", to: "ctx" },
                    { from: "thin", to: "emb", arc: "down" }, { from: "ctx", to: "emb" }
                ],
                steps: [
                    { on: ["rec", "rec>pick", "pick"], text: "짧은 기록은 자르지 않음 · 뜻을 담은 칸만 고름 (날짜·작성자·ID 는 잡음)" },
                    { on: ["pick>tpl", "tpl"], text: "**템플릿(template)**으로 한 문장: `[프린터] 현상: … / 원인: … / 조치: …`" },
                    { on: ["tpl>thin", "thin"], text: "**얇은 기록(thin record)** 표시 · 검색에서 빼진 않되 입력 화면에서 보강을 요청" },
                    { on: ["man", "man>head", "head"], text: "긴 문서는 제목 경계로 · 한 절이 길면 문단 경계로 다시" },
                    { on: ["head>ovl", "ovl"], text: "**겹침(overlap)**: 경계에 걸린 문장이 양쪽 청크에 남게" },
                    { on: ["ovl>ctx", "ctx"], text: "**맥락 머리말(contextual chunk header)**: '프린터 매뉴얼 > 급지 > 오류 코드' 경로를 앞에" },
                    { on: ["thin>emb", "ctx>emb", "emb"], text: "임베딩 서버의 입력 한도 안인지 확인 후 임베딩 · 원문 위치도 함께 저장" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "기록 → 임베딩용 텍스트 + 얇은 기록 표시",
                    src: `FIELDS = ("device", "component", "error_code", "error_name", "symptom", "cause", "action")

def emb_text(r):
    parts = [f"[{r.get('device') or '-'}{' / ' + r['component'] if r.get('component') else ''}]"]
    if r.get("error_code"):
        parts.append(f"오류 {r['error_code']} {r.get('error_name') or ''}".strip())
    for key, label in (("symptom", "현상"), ("cause", "원인"), ("action", "조치")):
        if r.get(key):
            parts.append(f"{label}: {r[key].strip()}")
    return " / ".join(parts)

def is_thin(r, min_chars=10):
    return len((r.get("action") or "").strip()) < min_chars

r = {"id": 109, "device": "프린터", "symptom": "용지 걸림 반복", "action": "롤러 청소",
     "author": "홍길동", "created_at": "2026-11-02 08:10"}         # 지어낸 예
print(emb_text(r), is_thin(r))
# [프린터] / 현상: 용지 걸림 반복 / 조치: 롤러 청소 True`,
                    note: "작성자·시각은 의미가 없어 벡터만 흐림 · 필터가 필요하면 칸으로 따로"
                },
                {
                    lang: "python",
                    title: "마크다운 매뉴얼: 제목 경계 + 겹침 + 머리말",
                    src: `import re

def chunk_markdown(md, title, max_chars=1200, overlap=200):
    out, path = [], []
    for block in re.split(r"(?m)^(?=#{1,3} )", md):
        m = re.match(r"(#{1,3}) (.+)", block)
        if m:
            path = path[:len(m.group(1)) - 1] + [m.group(2).strip()]
        body = block.strip()
        if not body:
            continue
        head = " > ".join([title, *path])
        for i in range(0, max(len(body) - overlap, 1), max_chars - overlap):
            out.append({"head": head, "text": f"[{head}]\\n{body[i:i + max_chars]}"})
    return out`,
                    note: "글자 수는 토큰 수의 대용 · 한국어는 글자당 토큰이 영어보다 많으니 서버 한도로 다시 확인"
                }
            ],
            optimize: [
                {
                    title: "모든 칸 이어 붙이기 → 뜻 있는 칸만 템플릿",
                    before: { lang: "python", src: `text = " ".join(str(v) for v in record.values())
# '2026-11-02 08:10 홍길동 #109 3 …' 잡음이 절반` },
                    after: { lang: "python", src: `text = emb_text(record)   # [기기] 오류 코드 / 현상 / 원인 / 조치` },
                    gain: "비슷한 조치끼리 더 가깝게",
                    note: "템플릿을 바꾸면 벡터가 바뀜 → 템플릿 버전도 벡터와 함께 저장"
                },
                {
                    title: "고정 500자 자르기 → 제목 경계 + 머리말",
                    before: { lang: "python", src: `chunks = [md[i:i + 500] for i in range(0, len(md), 500)]` },
                    after: { lang: "python", src: `chunks = chunk_markdown(md, "프린터 관리 매뉴얼")` },
                    gain: "절 단위 의미 유지 · '어느 문서의 어디'가 벡터에 들어감"
                }
            ],
            glossary: [
                { term: "슬라이딩 윈도", en: "Sliding window", def: "일정 간격으로 겹치게 자르는 방식 · 간격 = 크기 − 겹침" },
                { term: "재귀 분할", en: "Recursive splitting", def: "제목 → 문단 → 문장 순으로 큰 경계부터 시도해 한도 안으로 자름" },
                { term: "입력 토큰 한도", en: "Max input tokens", def: "임베딩 서버가 받는 최대 길이 · 넘으면 잘리거나 오류" },
                { term: "문서 확장", en: "Document expansion", def: "문서에 예상 질문·별칭을 덧붙여 검색되게 함 · 키워드 검색에 특히 효과" }
            ],
            quiz: [
                { type: "num", q: "10,000자 문서를 크기 800자, 겹침 200자로 자르면 청크 몇 개? (위 코드의 range 방식)", answer: 17, tol: 0, unit: "개", why: "간격 600 · range(0, 9800, 600) → 0, 600, …, 9600 = 17개" },
                { type: "num", q: "그때 저장되는 글자 수는 원문의 몇 배? (마지막 청크는 400자)", answer: 1.32, tol: 0.01, unit: "배", why: "16 × 800 + 400 = 13,200자 / 10,000 = 1.32 · 겹침의 비용" },
                { type: "num", q: "Anthropic 측정: top-20 검색 실패율 5.7% → 맥락 임베딩 후 3.7%. 몇 % 감소?", answer: 35, tol: 1, unit: "%", why: "(5.7 − 3.7) / 5.7 ≈ 0.35 · 맥락 BM25 를 더하면 2.9% (−49%), 재정렬까지 1.9% (−67%)" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "r = {\"equipment\": \"프린터\", \"symptom\": \"토너 부족 경고\", \"action\": \"토너 카트리지 교체\"}\nprint(f\"[{r['equipment']}] 현상: {r['symptom']} / 조치: {r['action']}\")" }, answer: ["[프린터] 현상: 토너 부족 경고 / 조치: 토너 카트리지 교체"], why: "f-string 템플릿 그대로 · 비교는 대소문자·공백 무시" },
                { q: "현상+조치 200자 정도의 헬프데스크 티켓은 어떻게 청킹?", options: ["100자씩 겹쳐 자르기", "자르지 않고 1건 = 1청크", "문장마다 따로 청크로", "여러 기록을 묶어 한 청크로"], a: 1, why: "이미 한 주제·짧은 길이 · 자르면 현상과 조치가 갈라짐, 묶으면 주제가 섞임" },
                { q: "임베딩용 텍스트에서 빼야 할 칸은?", options: ["현상 설명 칸", "조치 내용 칸", "작성자·시각 칸", "기기명·부품 칸"], a: 2, why: "뜻과 무관한 값은 벡터를 흐림 · 필요하면 필터용 칸으로 따로" },
                { q: "조치 칸이 '리셋함' 뿐인 기록이 많다. 바른 대응은?", options: ["모델이 그럴듯한 내용을 추측해 채우기", "입력 때 원인·조치를 구체적으로", "검색 대상에서 영구히 제외", "제목을 반복해 길이를 늘리기"], a: 1, why: "근거가 없는 것은 생성으로 못 만듦 · 지어 채우면 오답이 근거로 둔갑" },
                { q: "임베딩 서버 입력 한도를 넘는 텍스트는?", options: ["서버가 알아서 요약해 줌", "잘리거나 오류 → 길이 검사", "길수록 벡터가 더 정확해짐", "자동으로 두 벡터로 나눠 줌"], a: 1, why: "한도는 서버 설정에 따름 · 뒤쪽 내용이 말없이 사라질 수 있음" },
                { q: "Chroma 청킹 평가의 결론과 가까운 것은?", options: ["청크가 클수록 recall 이 계속 오름", "작은 청크가 정밀도↑, recall 비슷", "겹침이 클수록 늘 좋음", "전략에 따른 차이는 없음"], a: 1, why: "전략에 따라 recall 최대 9% 차이 · 800토큰·400 겹침 기본값은 평균 이하" },
                { type: "order", q: "긴 매뉴얼 청킹 순서", items: ["제목(#)으로 절 나누기", "긴 절은 문단 경계로 다시 자르기", "청크 사이 겹침 넣기", "상위 제목 경로를 머리말로", "임베딩 + 원문 위치 저장"], why: "큰 경계부터 자르고, 문맥 보존(겹침·머리말)은 그다음 · 원문 위치가 있어야 인용 가능" }
            ],
            refs: [
                { title: "Introducing Contextual Retrieval", by: "Anthropic", year: 2024, url: "https://www.anthropic.com/news/contextual-retrieval", kind: "doc" },
                { title: "Evaluating Chunking Strategies for Retrieval", by: "Smith et al. (Chroma)", year: 2024, url: "https://www.trychroma.com/research/evaluating-chunking", kind: "doc" }
            ]
        },
        {
            id: "vector-store",
            title: "벡터 저장 — SQLite 테이블이면 충분할 때",
            level: 2,
            mins: 18,
            pre: ["rag/embedding"],
            checked: "2026-11-18",
            key: [
                "수천 건이면 **전수 비교(brute-force search)**로 충분 · 5,000 × 2560 float32 ≈ 51 MB",
                "벡터는 **기록 저장 때** 만들고 모델명·차원·텍스트 해시를 함께 저장",
                "모델·템플릿이 바뀌면 **재임베딩(re-embedding)** — 섞인 벡터는 조용히 틀림",
                "**WAL** 모드: 읽기와 쓰기가 서로 안 막음 · 쓰기는 한 번에 하나",
                "근사 인덱스(HNSW)·벡터 DB 는 수십만~백만 건이 넘거나 지연 목표가 빡빡할 때"
            ],
            concepts: [
                { term: "전수 비교", en: "Brute-force (exact) search", def: "모든 벡터와 내적 · 정확하고 단순 · 수만 건까지 CPU 로 수 ms~수십 ms" },
                { term: "벡터 지문", en: "Embedding fingerprint", def: "모델명·차원·풀링·지시문·템플릿 버전 · 다르면 비교 금지" },
                { term: "WAL", en: "Write-Ahead Logging", def: "SQLite 저널 모드 · 읽기와 쓰기가 동시에 · 네트워크 파일시스템에선 안 됨" },
                { term: "HNSW", en: "Hierarchical Navigable Small World", def: "그래프 기반 근사 최근접 인덱스 · 빠르지만 메모리·빌드 비용, 결과가 근사" }
            ],
            demo: {
                type: "seq",
                actors: ["직원", "헬프데스크", "SQLite", "임베딩 서버"],
                msgs: [
                    { from: 0, to: 1, label: "기록 저장", text: "해결 기록 저장 버튼" },
                    { from: 1, to: 2, label: "INSERT records · COMMIT", text: "기록 먼저 커밋 · 임베딩이 실패해도 기록은 안전" },
                    { from: 1, to: 3, label: "임베딩(템플릿 텍스트)", text: "기록 → 템플릿 텍스트 → 벡터 요청" },
                    { from: 3, to: 1, label: "2560 floats", text: "실패하면 '벡터 대기'로 두고 배치가 나중에 채움" },
                    { from: 1, to: 2, label: "INSERT record_vec", text: "정규화한 벡터 BLOB + 모델명 + 차원 + 텍스트 해시" },
                    { from: 0, to: 1, label: "질문", text: "해결 추천 화면에서 질문" },
                    { from: 1, to: 2, label: "SELECT 후보 벡터", text: "건물·층 필터 + 같은 모델 벡터만" },
                    { from: 1, to: 1, label: "행렬 곱 top-50", text: "numpy 로 내적 한 번 · 결과는 RRF 의 의미 다리로" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "기록별 벡터 테이블: 저장 시 임베딩, 질문 시 내적",
                    src: `import hashlib, sqlite3
import numpy as np

db = sqlite3.connect("rag_demo.db")
db.execute("PRAGMA journal_mode=WAL")
db.executescript("""
CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY, floor INTEGER, bldg TEXT, eq TEXT, symptom TEXT, action TEXT);
CREATE TABLE IF NOT EXISTS record_vec (
  record_id INTEGER PRIMARY KEY REFERENCES records(id) ON DELETE CASCADE,
  model TEXT NOT NULL, dim INTEGER NOT NULL, text_sha TEXT NOT NULL, vec BLOB NOT NULL);
""")

def emb_text(r):
    return f"[{r['eq']}] 현상: {r['symptom']} / 조치: {r['action']}"

def save(r):
    with db:                                    # 1) 기록 먼저
        db.execute("INSERT OR REPLACE INTO records VALUES (:id, :floor, :bldg, :eq, :symptom, :action)", r)
    text = emb_text(r)
    try:
        v = np.asarray(embed_strict([text])[0], dtype=np.float32)   # 대체 벡터 금지: 공간이 섞임
    except OSError:
        return                                  # 2) 벡터는 배치가 나중에
    v /= np.linalg.norm(v)
    with db:
        db.execute("INSERT OR REPLACE INTO record_vec VALUES (?, ?, ?, ?, ?)",
                   (r["id"], EMB_MODEL, v.size, hashlib.sha1(text.encode()).hexdigest(), v.tobytes()))

def dense_rank(q, floor=None, k=50):
    sql, args = ("SELECT r.id, v.vec FROM records r JOIN record_vec v ON v.record_id = r.id "
                 "WHERE v.model = ?"), [EMB_MODEL]
    if floor is not None:
        sql, args = sql + " AND r.floor = ?", args + [floor]
    rows = db.execute(sql, args).fetchall()
    if not rows:
        return []
    M = np.stack([np.frombuffer(b, dtype=np.float32) for _, b in rows])
    qv = np.asarray(embed_strict([q], query=True)[0], dtype=np.float32)
    s = M @ (qv / np.linalg.norm(qv))
    return [rows[i][0] for i in np.argsort(-s)[:k]]`,
                    note: "`embed_strict` = 앞 강의 `embed` 에서 대체 벡터 대신 예외를 던지는 판 · 저장소에는 진짜 벡터만"
                },
                {
                    lang: "sql",
                    title: "다시 임베딩할 기록 찾기",
                    src: `-- 벡터가 없거나, 다른 모델로 만들어진 기록
SELECT r.id
FROM records r
LEFT JOIN record_vec v ON v.record_id = r.id
WHERE v.record_id IS NULL OR v.model <> :current_model;
-- 텍스트가 바뀐 기록은 파이썬에서 sha1(emb_text(r)) <> text_sha 로 추가`,
                    note: "야간 배치로 돌리고, 끝나기 전까지는 해당 기록이 키워드 다리로만 검색됨"
                }
            ],
            optimize: [
                {
                    title: "질문마다 BLOB 전부 읽기 → 행렬 캐시 + 새 기록만 추가",
                    before: { lang: "python", src: `rows = db.execute("SELECT record_id, vec FROM record_vec").fetchall()
M = np.stack([np.frombuffer(b, np.float32) for _, b in rows])   # 매 질문` },
                    after: { lang: "python", src: `if cache.version != db_version():        # 기록 저장 때 올리는 카운터
    cache.ids, cache.M = load_matrix()
s = cache.M @ q` },
                    gain: "질문당 수십 ms → 수 ms",
                    note: "수천 건이면 캐시 없이도 충분히 빠름 · 측정 후 필요할 때만"
                },
                {
                    title: "float32 2560 → float16 1024 (MRL)",
                    before: { lang: "python", src: `vec = v.astype(np.float32).tobytes()          # 10,240 B` },
                    after: { lang: "python", src: `vec = unit(v[:1024]).astype(np.float16).tobytes()   # 2,048 B` },
                    gain: "×5 작게 · 5,000건 51.2 MB → 10.24 MB",
                    note: "품질 손실은 평가셋으로 확인 · 수천 건이면 줄일 이유가 거의 없음"
                }
            ],
            glossary: [
                { term: "이진 대형 객체", en: "Binary Large Object (BLOB)", def: "SQLite 의 바이트 칸 · `ndarray.tobytes()` 로 넣고 `np.frombuffer` 로 꺼냄" },
                { term: "재임베딩", en: "Re-embedding", def: "모델·템플릿이 바뀌었을 때 모든 벡터를 새로 만듦 · 섞어 쓰지 않음" },
                { term: "콘텐츠 해시", en: "Content hash", def: "임베딩 텍스트의 sha1 · 같으면 다시 임베딩할 필요 없음" },
                { term: "근사 최근접 탐색", en: "Approximate nearest neighbor search", def: "조금의 정확도를 내주고 속도를 얻는 탐색 · 대규모에서만 이득" },
                { term: "단일 작성자", en: "Single writer", def: "쓰기 연결을 하나로 모으는 패턴 · SQLite 는 동시에 한 쓰기만 허용" }
            ],
            quiz: [
                { type: "num", q: "기록 5,000건 × 2560차원 float32 벡터의 총 크기는 몇 MB? (1 MB = 10⁶ B)", answer: 51.2, tol: 0.1, unit: "MB", why: "5,000 × 2,560 × 4 B = 51,200,000 B" },
                { type: "num", q: "MRL 로 1024차원 + float16 으로 저장하면?", answer: 10.24, tol: 0.05, unit: "MB", why: "5,000 × 1,024 × 2 B = 10,240,000 B · 5배 작음" },
                { type: "num", q: "질문 하나의 전수 비교 곱셈-덧셈 횟수는 몇 백만 번? (5,000 × 2560)", answer: 12.8, tol: 0.05, unit: "백만", why: "12,800,000 · CPU 행렬 곱으로 수 ms 수준" },
                { type: "text", q: "BLOB 길이가 4,096 B 인 float32 벡터를 `np.frombuffer(b, dtype=np.float32).shape` 로 보면?", answer: ["(1024,)", "1024"], why: "4,096 / 4 = 1,024 · dtype 을 틀리게(float16) 주면 (2048,) 로 조용히 엉뚱해짐" },
                { q: "기록 저장 중 임베딩 서버가 꺼져 있다면?", options: ["기록 저장 자체를 실패시킴", "0 벡터를 넣어 두고 진행", "기록만 저장, 벡터는 나중에", "2-gram 대체 벡터를 저장"], a: 2, why: "기록이 주 데이터 · 0 벡터·대체 벡터는 다른 공간이라 검색을 오염" },
                { q: "모델을 바꾸고 절반만 재임베딩된 상태로 검색하면?", options: ["자동으로 새 모델 벡터만 씀", "공간이 섞여 조용히 틀림", "오류가 나서 바로 알게 됨", "속도만 조금 느려짐"], a: 1, why: "차원이 같으면 오류 없이 계산됨 · 그래서 `model` 칸으로 같은 벡터만 고름" },
                { q: "SQLite WAL 모드에 대한 설명으로 맞는 것은?", options: ["쓰기 여러 개가 동시에 진행됨", "읽기 전용으로 바뀌는 모드", "읽기·쓰기 공존, 쓰기는 하나", "네트워크 공유 폴더에서도 안전"], a: 2, why: "공식 문서: readers do not block writers… one writer at a time · 네트워크 파일시스템에선 동작 안 함" },
                { q: "별도 벡터 DB·ANN 인덱스를 고려할 때는?", options: ["기록이 1,000건을 넘는 순간", "수십만 건 이상·ms 지연 목표", "SQLite 를 쓰는 한 언제나", "벡터 차원이 1024 이상이면"], a: 1, why: "그 아래에선 전수 비교가 정확하고 빠름 · 운영할 서버만 늘어남" },
                { q: "벡터와 함께 텍스트 해시를 저장하는 이유는?", options: ["검색 속도를 높이려고", "바뀐 기록만 다시 임베딩", "벡터를 암호화하려고", "중복 기록을 찾아 지우려고"], a: 1, why: "기록 수정 → 템플릿 텍스트 변경 → 해시 불일치 → 그 기록만 재임베딩" },
                { type: "order", q: "기록 저장 시 흐름", items: ["기록 INSERT · 커밋", "템플릿 텍스트 + 해시 만들기", "임베딩 서버 호출", "벡터·모델명·해시 저장", "실패 시 '벡터 대기' → 배치 재시도"], why: "기록 저장이 임베딩 성공에 매달리지 않게 · 벡터는 언제든 다시 만들 수 있는 파생 데이터" }
            ],
            refs: [
                { title: "Write-Ahead Logging", by: "SQLite", url: "https://www.sqlite.org/wal.html", kind: "doc" },
                { title: "sqlite-vec: A vector search SQLite extension that runs anywhere", by: "Alex Garcia", url: "https://github.com/asg017/sqlite-vec", kind: "doc" },
                { title: "Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs", by: "Malkov et al.", year: 2016, url: "https://arxiv.org/abs/1603.09320", kind: "paper" }
            ]
        },
        {
            id: "rerank",
            title: "재정렬 — 넓게 찾고 정밀하게 고르기",
            level: 2,
            mins: 16,
            pre: ["rag/hybrid"],
            checked: "2026-11-18",
            key: [
                "바이인코더: 따로 벡터 → 빠름 · **크로스인코더(cross-encoder)**: 함께 읽고 채점 → 정확·느림",
                "1단계 하이브리드 top-30~50 → **재정렬기(reranker)** → 상위 8건만 프롬프트로",
                "Qwen3-Reranker 점수 = '관련 있음?'에 대한 yes 토큰 확률",
                "측정 후 채택: bge-reranker-v2-m3 는 Qwen 측정에서 1단계보다 낮았음 (58.36 < 64.64)",
                "넣는 순서도 중요: 관련 정보가 처음·끝에 있을 때 성능이 높은 경우가 많음"
            ],
            concepts: [
                { term: "크로스인코더", en: "Cross-encoder", def: "질문과 문서를 한 입력으로 함께 읽고 관련도 점수 하나를 냄 · 미리 계산 불가" },
                { term: "재정렬기", en: "Reranker", def: "1단계 후보만 다시 채점해 순서를 정하는 모델" },
                { term: "2단계 검색", en: "Retrieve-then-rerank", def: "싸고 넓은 1단계 + 비싸고 정밀한 2단계" },
                { term: "중간 망각", en: "Lost in the middle", def: "긴 입력의 가운데 정보를 덜 쓰는 경향 · 중요한 근거는 앞쪽에" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "q", label: "질문", sub: "+ 조건 필터", x: 0, y: 0 },
                    { id: "hy", label: "하이브리드", sub: "top-30", x: 1, y: 0 },
                    { id: "rr", label: "재정렬기", sub: "(질문, 기록) × 30", x: 2, y: 0 },
                    { id: "cut", label: "상위 8 + 임계값", sub: "점수 낮으면 버림", x: 3, y: 0 },
                    { id: "ord", label: "배치 순서", sub: "가장 관련 = 앞", x: 3, y: 1 },
                    { id: "llm", label: "LLM", sub: "인용하며 답", x: 2, y: 1 }
                ],
                edges: [
                    { from: "q", to: "hy" }, { from: "hy", to: "rr" }, { from: "rr", to: "cut" },
                    { from: "cut", to: "ord" }, { from: "ord", to: "llm" }
                ],
                steps: [
                    { on: ["q", "q>hy", "hy"], text: "1단계는 넓게: 하이브리드로 30건 · 빠르지만 순서는 거침" },
                    { on: ["hy>rr", "rr"], text: "**재정렬기(reranker)**가 (질문, 기록) 쌍 30개를 하나씩 채점 · **크로스인코더(cross-encoder)**라 정확" },
                    { on: ["rr>cut", "cut"], text: "상위 8건 · 점수가 임계값보다 낮은 건 8건이 안 돼도 버림 → 무관한 근거 주입↓" },
                    { on: ["cut>ord", "ord"], text: "가장 관련 높은 기록을 앞에 · **중간 망각(lost in the middle)** 대비" },
                    { on: ["ord>llm", "llm"], text: "LLM 은 정리된 근거만 받고 [#번호]로 인용" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "재정렬 서버가 생기면: /v1/rerank (llama.cpp·Jina 꼴)",
                    src: `def rerank(q, cands, top=8, min_score=0.3):
    body = {"model": RERANK_MODEL, "query": q, "documents": [emb_text(r) for r in cands]}
    res = post_json(f"{RERANK_BASE}/rerank", body)["results"]      # [{index, relevance_score}]
    res.sort(key=lambda x: -x["relevance_score"])
    return [cands[x["index"]] for x in res[:top] if x["relevance_score"] >= min_score]`,
                    note: "응답 모양은 구현마다 다름 (llama.cpp·Jina·Cohere 계열) · 서버 문서로 확인"
                },
                {
                    lang: "python",
                    title: "재정렬 모델이 없을 때: LLM 에게 목록형 관련도 채점 (JSON)",
                    src: `def llm_rerank(q, cands, top=8):
    listing = "\\n".join(f"{i}. {emb_text(r)}" for i, r in enumerate(cands))
    prompt = (f"질문: {q}\\n\\n후보 기록:\\n{listing}\\n\\n"
              "각 후보가 질문과 같은 고장·같은 조치에 해당하는지 0~3 점으로 매겨 "
              'JSON 만 출력: {"scores": [정수, ...]} (후보 순서대로)')
    out = chat(prompt, max_tokens=200, response_format={"type": "json_object"})   # thinking 끔
    scores = json.loads(out)["scores"]
    if len(scores) != len(cands):
        return cands[:top]                                  # 형식이 틀리면 1단계 순서 유지
    order = sorted(range(len(cands)), key=lambda i: -scores[i])
    return [cands[i] for i in order[:top] if scores[i] > 0]`,
                    note: "공유 모델 호출 1회 추가 (수 초) · 후보 20~30건이 한도 · 결과를 평가셋으로 비교한 뒤 채택"
                }
            ],
            optimize: [
                {
                    title: "top-8 그대로 → top-30 재정렬 후 8",
                    before: { lang: "python", src: `hits = hybrid(q, records, top=8)` },
                    after: { lang: "python", src: `hits = rerank(q, hybrid(q, records, top=30), top=8)` },
                    gain: "Qwen 측정 MMTEB-R 64.64 → 66.36 (0.6B) · 72.74 (4B)",
                    note: "1단계가 놓친 기록은 재정렬로 못 살림 → 1단계는 넓게"
                },
                {
                    title: "무조건 8건 → 점수 임계값",
                    before: { lang: "python", src: `context = hits[:8]          # 관련 없는 기록도 8칸 채움` },
                    after: { lang: "python", src: `context = [h for h in hits[:8] if h.score >= 0.3] or []   # 없으면 '유사 기록 없음'` },
                    gain: "무관한 근거로 지어내는 답 감소"
                }
            ],
            glossary: [
                { term: "관련도 점수", en: "Relevance score", def: "재정렬기가 (질문, 문서) 쌍에 매기는 값 · 모델마다 척도가 달라 임계값은 실측으로" },
                { term: "점별 재정렬", en: "Pointwise reranking", def: "문서 하나씩 따로 채점 · 크로스인코더의 기본 방식" },
                { term: "목록형 재정렬", en: "Listwise reranking", def: "후보 목록 전체를 한 번에 보고 순서를 매김 · LLM 재정렬에 흔함" },
                { term: "지연 예산", en: "Latency budget", def: "질문 하나에 허용하는 총 시간 · 재정렬 후보 수를 정하는 기준" }
            ],
            quiz: [
                { type: "num", q: "1단계 0.02 s, 재정렬이 문서당 10 ms 순차일 때 top-30 재정렬 포함 총 검색 시간(초)은?", answer: 0.32, tol: 0.005, unit: "s", why: "0.02 + 30 × 0.01 = 0.32 s · 후보 수가 곧 지연" },
                { type: "num", q: "Qwen3-Reranker-0.6B 가 1단계(Qwen3-Embedding-0.6B) 대비 MMTEB-R 을 몇 점 올렸나?", answer: 1.72, tol: 0.01, why: "66.36 − 64.64 = 1.72 · 4B 는 72.74 로 +8.10 (모두 Qwen 자체 측정)" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "scores = [0.91, 0.12, 0.55, 0.78]\norder = sorted(range(4), key=lambda i: -scores[i])\nprint([i for i in order if scores[i] >= 0.5])" }, answer: ["[0, 3, 2]", "0,3,2"], why: "점수순 0(0.91) 3(0.78) 2(0.55) 1(0.12) · 임계값 0.5 미만인 1 은 버림" },
                { q: "크로스인코더를 기록 5,000건 전체에 쓰지 않는 이유는?", options: ["크로스인코더는 한국어를 못 해서", "질문마다 5,000번 실행해야 해서", "벡터를 저장할 공간이 없어서", "정확도가 오히려 바이인코더보다 낮아서"], a: 1, why: "(질문, 문서) 쌍을 함께 읽어야 하므로 미리 계산 불가 · 후보 수십 건에만" },
                { q: "바이인코더의 결정적 장점은?", options: ["질문과 문서를 함께 읽음", "문서 벡터를 미리 계산 가능", "점수가 확률로 잘 보정돼 있음", "학습이 전혀 필요 없음"], a: 1, why: "질문 벡터 하나만 새로 만들고 내적 · 그래서 1단계에 씀" },
                { q: "Liu et al. 'Lost in the Middle' 의 관찰은?", options: ["가운데 정보를 가장 잘 씀", "입력이 길어질수록 항상 더 좋아짐", "처음·끝에 있을 때 대체로 좋음", "위치는 성능과 무관"], a: 2, why: "U자 곡선 · 그래서 가장 관련 높은 근거를 앞에 둠" },
                { q: "재정렬 모델 서버가 없다. 당장 시도할 수 있는 것은?", options: ["임베딩 점수를 두 번 계산하기", "LLM 으로 후보 관련도 채점", "top-k 를 1 로 줄이기", "temperature 를 올리기"], a: 1, why: "LLM 목록형 재정렬 · 느리고 비싸지만 서버 추가 없이 효과 측정 가능" },
                { q: "bge-reranker-v2-m3 가 Qwen 측정에서 1단계보다 낮았던 사례의 교훈은?", options: ["재정렬은 언제나 순위를 개선함", "재정렬기도 우리 데이터로 측정", "작은 모델은 항상 나쁨", "재정렬은 한국어에 쓸모없음"], a: 1, why: "58.36 < 64.64 (공급자 측정) · 남의 표보다 우리 평가셋" },
                { type: "order", q: "2단계 검색 순서", items: ["조건 필터", "하이브리드로 30건", "재정렬기로 30건 채점", "임계값 이상 상위 8건", "관련 높은 순으로 프롬프트 앞부터"], why: "넓게 → 정밀하게 → 자르기 → 배치 · 재정렬은 1단계가 찾은 것 안에서만 고름" }
            ],
            refs: [
                { title: "Passage Re-ranking with BERT", by: "Nogueira et al.", year: 2019, url: "https://arxiv.org/abs/1901.04085", kind: "paper" },
                { title: "Qwen3-Reranker-0.6B model card", by: "Qwen", year: 2025, url: "https://huggingface.co/Qwen/Qwen3-Reranker-0.6B", kind: "doc" },
                { title: "Lost in the Middle: How Language Models Use Long Contexts", by: "Liu et al.", year: 2023, url: "https://arxiv.org/abs/2307.03172", kind: "paper" }
            ]
        },
        {
            id: "rag-eval",
            title: "검색·답변 평가",
            level: 3,
            mins: 22,
            pre: ["rag/hybrid", "ai/eval"],
            checked: "2026-11-18",
            key: [
                "검색과 생성을 **따로** 잼: 검색 = recall@k·MRR, 생성 = 판정(judge)",
                "헬프데스크 지표 **같은 조치 발견률(same-fix found@k)**: 해결 기록을 질문으로, 같은 조치가 top-5 에?",
                "평가 질문은 바꿔 말한 것·층 지정·코드 질문을 **섞어서** — 원문 베끼면 키워드가 과대평가",
                "답 **판정 루브릭(judging rubric)**: 인용 실재 · 기록에 있는 조치만 · 한국어 · 모르면 모른다",
                "n = 60 이면 ±0.1 차이도 잡음일 수 있음 → 같은 질문 **짝 비교(paired comparison)**"
            ],
            concepts: [
                { term: "recall@k", en: "Recall at k", def: "정답 중 상위 k 개 안에 든 비율 · RAG 1단계의 핵심 지표" },
                { term: "MRR", en: "Mean Reciprocal Rank", def: "첫 정답 순위의 역수 평균 · 못 찾으면 0" },
                { term: "같은 조치 발견률", en: "Same-fix found@k", def: "질문 기록과 같은 조치 묶음의 다른 기록이 top-k 에 하나라도 있는 비율" },
                { term: "LLM 판정", en: "LLM-as-a-judge", def: "루브릭을 주고 LLM 이 답을 채점 · 위치·길이 편향이 있어 사람 표본으로 교정" },
                { term: "단일 제외 평가", en: "Leave-one-out evaluation", def: "기록 하나를 질문으로 쓰고 그 기록만 빼고 검색 · 정답셋 없이 시작 가능" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "rec", label: "해결 기록", sub: "조치 묶음 표시", x: 0, y: 0 },
                    { id: "q", label: "질문 만들기", sub: "현상만 · 바꿔 말하기", x: 1, y: 0 },
                    { id: "ret", label: "검색", sub: "자기 자신 제외", x: 2, y: 0 },
                    { id: "m", label: "검색 지표", sub: "same-fix@5 · MRR", x: 3, y: 0 },
                    { id: "gen", label: "생성", sub: "LLM 답", x: 2, y: 1 },
                    { id: "j", label: "판정", sub: "루브릭 JSON", x: 3, y: 1 },
                    { id: "cmp", label: "짝 비교", sub: "v1 vs v2 · CI", x: 3, y: 2 }
                ],
                edges: [
                    { from: "rec", to: "q" }, { from: "q", to: "ret" }, { from: "ret", to: "m" },
                    { from: "ret", to: "gen" }, { from: "gen", to: "j" }, { from: "m", to: "cmp", arc: "down" }, { from: "j", to: "cmp" }
                ],
                steps: [
                    { on: ["rec"], text: "해결된 기록에 '조치 묶음'(같은 원인·같은 조치) 표시 · 지어낸 실습 데이터로 먼저 연습" },
                    { on: ["rec>q", "q"], text: "현상만 질문으로 · 일부는 일부러 바꿔 말하기·층 지정·코드만 질문" },
                    { on: ["q>ret", "ret"], text: "그 기록 자신은 빼고 검색 (**단일 제외 평가(leave-one-out evaluation)**)" },
                    { on: ["ret>m", "m"], text: "같은 묶음 기록이 top-5 에 있나 → **같은 조치 발견률(same-fix found@k)** · 첫 순위로 **MRR**" },
                    { on: ["ret>gen", "gen", "gen>j", "j"], text: "생성은 따로: **LLM 판정(LLM-as-a-judge)**이 루브릭으로 채점 · 일부는 사람이 재확인" },
                    { on: ["m>cmp", "j>cmp", "cmp"], text: "같은 질문으로 키워드판 vs 하이브리드판 짝 비교 · 신뢰구간이 0 을 넘는지" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "단일 제외 평가: same-fix@5 · recall@k · MRR",
                    src: `def evaluate(records, search, k=5):
    found, rr = [], []
    for r in records:
        if not r.get("fix_group"):
            continue
        ranked = [h for h in search(r["symptom"], records) if h["id"] != r["id"]]   # 자기 자신 제외
        groups = [h.get("fix_group") for h in ranked]
        found.append(r["fix_group"] in groups[:k])
        first = next((i for i, g in enumerate(groups, 1) if g == r["fix_group"]), None)
        rr.append(1 / first if first else 0)
    n = len(found)
    return {"n": n, f"same_fix@{k}": sum(found) / n, "mrr": sum(rr) / n}

# 지어낸 실습 기록 예: fix_group 이 같은 것끼리 '같은 조치'
# {"id": 1, "symptom": "와이파이 통신 끊김", "action": "커넥터 재연결", "fix_group": "conn"}
# {"id": 2, "symptom": "네트워크 연결 안 됨", "action": "커넥터 다시 꽂음", "fix_group": "conn"}
print(evaluate(SYNTHETIC, keyword_search), evaluate(SYNTHETIC, hybrid_search))`,
                    note: "fix_group 은 사람이 붙이는 정답 · 처음엔 30~50건만 붙여도 비교가 시작됨"
                },
                {
                    lang: "python",
                    title: "답 판정: 루브릭 + JSON (thinking 끔, max_tokens 지정)",
                    src: `RUBRIC = """다음 답을 채점하라. JSON 만 출력:
{"cites_ok": bool,      # 인용한 [#번호]가 모두 제공 기록에 있음
 "grounded": bool,      # 조치가 모두 기록에 나온 내용
 "korean": bool,        # 한국어로만 작성 (한자·중국어 문장 없음)
 "admits_unknown": bool # 근거가 없을 때 없다고 말함 (근거가 있으면 true)
}"""

def judge(question, records_text, answer):
    msg = f"{RUBRIC}\\n\\n[기록]\\n{records_text}\\n\\n[질문]\\n{question}\\n\\n[답]\\n{answer}"
    out = chat(msg, max_tokens=120, response_format={"type": "json_object"})
    return json.loads(out)`,
                    note: "점수 하나보다 예/아니오 항목 여러 개가 사람이 검토하기 쉬움 · `cites_ok` 는 코드로도 검사 가능"
                }
            ],
            optimize: [
                {
                    title: "몇 개 눈으로 보기 → 고정 평가셋 + 지표",
                    before: { lang: "text", src: `질문 3개 해 보고 "좋아진 것 같다"` },
                    after: { lang: "python", src: `base = evaluate(SET, keyword_search)
new = evaluate(SET, hybrid_search)
assert new["same_fix@5"] >= base["same_fix@5"] - 0.02, "회귀"` },
                    gain: "변경마다 같은 잣대 · 회귀를 숫자로 막음"
                },
                {
                    title: "평균 두 개 비교 → 짝 부트스트랩 신뢰구간",
                    before: { lang: "python", src: `print(mean(new) - mean(base))   # +0.05 → "좋아졌다"` },
                    after: { lang: "python", src: `diffs = [n - b for n, b in zip(new_hits, base_hits)]      # 같은 질문끼리
boots = sorted(mean(random.choices(diffs, k=len(diffs))) for _ in range(2000))
print(boots[50], boots[1949])                                # 95% 구간이 0 을 넘나` },
                    gain: "작은 n 에서 착시 방지"
                }
            ],
            glossary: [
                { term: "정답셋", en: "Gold set", def: "질문마다 맞는 기록(또는 조치 묶음)을 사람이 표시한 평가 자료" },
                { term: "정밀도@k", en: "Precision at k", def: "상위 k 개 중 정답 비율 · 프롬프트에 섞이는 잡음의 양" },
                { term: "판정 루브릭", en: "Judging rubric", def: "판정 모델에게 주는 채점 기준 · 예/아니오 항목으로 쪼개면 안정적" },
                { term: "위치 편향", en: "Position bias", def: "LLM 판정이 먼저 나온 답을 선호하는 경향 · 순서를 바꿔 두 번 채점" }
            ],
            quiz: [
                { type: "num", q: "정답 기록 3건 중 top-5 에 2건이 들었다. recall@5 는?", answer: 0.667, tol: 0.005, why: "2 / 3 ≈ 0.667" },
                { type: "num", q: "그때 top-5 의 정밀도(precision@5)는?", answer: 0.4, tol: 0.001, why: "5개 중 정답 2개 = 0.4 · 나머지 3개는 프롬프트에 들어가는 잡음" },
                { type: "num", q: "첫 정답 순위가 2, 1, 5, 없음인 질문 4개의 MRR 은?", answer: 0.425, tol: 0.001, why: "(1/2 + 1 + 1/5 + 0) / 4 = 1.7 / 4 = 0.425" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "ranks = [2, 1, None, 4]\nprint(round(sum(1 / r for r in ranks if r) / len(ranks), 4))" }, answer: ["0.4375"], why: "(0.5 + 1 + 0.25) / 4 = 0.4375 · 못 찾은 질문도 분모에 포함" },
                { type: "num", q: "단일 제외 평가 40건 중 26건에서 같은 조치 기록이 top-5 에 있었다. same-fix@5 는?", answer: 0.65, tol: 0.001, why: "26 / 40 = 0.65" },
                { q: "검색 평가와 답 평가를 나누는 이유는?", options: ["토큰 비용을 줄이려고", "'못 찾음'과 '못 씀' 구분", "판정 모델이 검색 결과를 못 읽어서", "답 평가는 필요 없어서"], a: 1, why: "고칠 곳이 다름: 검색 실패는 검색을, 근거를 받고도 틀리면 프롬프트·모델을" },
                { q: "평가 질문을 기록 원문에서 그대로 베끼면?", options: ["의미 검색 쪽이 과대평가됨", "키워드 검색이 과대평가됨", "지표가 모두 0 이 됨", "아무 영향 없음"], a: 1, why: "원문과 같은 단어 → 단어 겹침이 쉽게 찾음 · 실제 질문은 바꿔 말한 경우가 많음" },
                { q: "LLM 판정에서 알려진 편향은?", options: ["편향이 전혀 없음", "먼저 나온·긴 답 선호", "짧은 답만 일관되게 선호함", "숫자만 정확히 셈"], a: 1, why: "Zheng et al.: 위치·장황함·자기 선호 편향 · 순서를 바꿔 두 번 채점, 사람 표본으로 확인" },
                { q: "질문 60개에서 하이브리드가 +0.05 좋게 나왔다. 결론은?", options: ["확실히 좋아졌으니 바로 배포", "짝 비교 구간 확인 전엔 보류", "차이가 작으니 변경을 버림", "질문을 6개로 줄여 다시 측정"], a: 1, why: "n = 60 의 95% 구간은 대략 ±0.1 폭 · 같은 질문 짝 비교 + 바꿔 말한 질문 추가" },
                { type: "order", q: "단일 제외 평가 한 바퀴", items: ["해결 기록에 조치 묶음 표시", "현상을 질문으로 (일부는 바꿔 말하기)", "자기 자신 빼고 검색", "같은 묶음이 top-5 에 있는지 기록", "전체 비율·MRR 집계"], why: "정답 표시가 먼저 · 자기 자신을 빼지 않으면 늘 1위라 지표가 1.0 으로 부풀음" }
            ],
            refs: [
                { title: "Introduction to Information Retrieval (Ch. 8 Evaluation)", by: "Manning et al.", year: 2008, url: "https://nlp.stanford.edu/IR-book/", kind: "book" },
                { title: "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena", by: "Zheng et al.", year: 2023, url: "https://arxiv.org/abs/2306.05685", kind: "paper" },
                { title: "BEIR: A Heterogenous Benchmark for Zero-shot Evaluation of Information Retrieval Models", by: "Thakur et al.", year: 2021, url: "https://arxiv.org/abs/2104.08663", kind: "paper" }
            ]
        },
        {
            id: "rag-failures",
            title: "실패 유형과 시스템 설계 (종합)",
            level: 3,
            mins: 25,
            pre: ["rag/rag-eval", "rag/vector-store", "rag/rerank", "rag/chunking"],
            checked: "2026-11-18",
            key: [
                "실패는 넷: **못 찾음 · 엉뚱한 조건 · 얇은 기록 · 지어냄/언어 이탈(language drift)**",
                "지어냄 방지: 인용 번호 검사 · 기록에 없는 부품·수치 금지 · '모름' 허용",
                "중국어로 새는 답: 끝줄 언어 지시 + 한자 비율 검사 → 1회 재시도",
                "설계: 저장 시 벡터 · **가제티어(gazetteer)**로 기기·코드·층 → 필터·고정 · 임베딩 = 의미",
                "임베딩 서버 장애 → 키워드만으로 계속 + '의미 검색 꺼짐' 표시"
            ],
            concepts: [
                { term: "언어 이탈", en: "Language drift (language mixing)", def: "한국어로 답하다 중국어·영어 문장이 섞임 · 다국어 학습 모델에서 흔함" },
                { term: "근거 없는 주장", en: "Unsupported claim", def: "제공한 기록에 없는 부품명·수치·절차를 답에 넣음" },
                { term: "우아한 강등", en: "Graceful degradation", def: "일부가 고장 나도 기능을 줄여 계속 동작 · 의미 검색 장애 → 키워드만" },
                { term: "간접 프롬프트 주입", en: "Indirect prompt injection", def: "검색된 자료 안의 문장이 지시처럼 모델을 조종 · 기록은 자료로만 다룸" }
            ],
            demo: {
                type: "steps",
                nodes: [
                    { id: "save", label: "기록 저장", sub: "+ 벡터 (실패 시 대기)", x: 0, y: 0 },
                    { id: "vec", label: "record_vec", sub: "모델·해시·BLOB", x: 1, y: 0 },
                    { id: "q", label: "질문", sub: "직원 입력", x: 0, y: 1 },
                    { id: "gz", label: "가제티어", sub: "기기·코드·층", x: 1, y: 1 },
                    { id: "kw", label: "키워드 다리", sub: "BM25 top-50", x: 2, y: 0 },
                    { id: "dn", label: "의미 다리", sub: "내적 top-50", x: 2, y: 1 },
                    { id: "fuse", label: "RRF + 고정", sub: "(재정렬)", x: 3, y: 1 },
                    { id: "llm", label: "LLM", sub: "근거만 사용", x: 3, y: 2 },
                    { id: "chk", label: "출력 검사", sub: "인용·한자 비율", x: 2, y: 2 }
                ],
                edges: [
                    { from: "save", to: "vec" }, { from: "q", to: "gz" }, { from: "gz", to: "kw" }, { from: "gz", to: "dn" },
                    { from: "vec", to: "dn" }, { from: "kw", to: "fuse" }, { from: "dn", to: "fuse" }, { from: "fuse", to: "llm" }, { from: "llm", to: "chk" }
                ],
                steps: [
                    { on: ["save", "save>vec", "vec"], text: "기록 저장 때 벡터 생성 · 실패해도 기록은 저장, 배치가 나중에 채움" },
                    { on: ["q", "q>gz", "gz"], text: "**가제티어(gazetteer)**: 기기명·오류 코드·건물·층 목록으로 질문을 읽음 → 필터와 고정 대상" },
                    { on: ["gz>kw", "kw", "gz>dn", "dn", "vec>dn"], text: "같은 후보에서 두 다리 · 의미 다리가 죽으면 빈 목록 = **우아한 강등(graceful degradation)**" },
                    { on: ["kw>fuse", "dn>fuse", "fuse"], text: "RRF 로 합치고 코드 정확 일치는 맨 위 · 재정렬은 평가에서 이득이 확인되면" },
                    { on: ["fuse>llm", "llm"], text: "기록은 `<record>` 태그로 감싼 자료 · 그 안의 문장은 지시가 아님 (**간접 프롬프트 주입(indirect prompt injection)** 대비)" },
                    { on: ["llm>chk", "chk"], text: "인용 번호가 제공한 기록 안인지, 한자 비율이 기준 이하인지 검사 → 아니면 1회 재시도 후 경고" }
                ]
            },
            code: [
                {
                    lang: "python",
                    title: "출력 검사: 지어낸 인용 + 언어 이탈 → 1회 재시도",
                    src: `import re

HAN = re.compile(r"[\\u4e00-\\u9fff]")          # CJK 통합 한자
HANGUL = re.compile(r"[가-힣]")

def problems(answer, hits, max_han=0.05):
    out = []
    cited = {int(n) for n in re.findall(r"#(\\d+)", answer)}
    if cited - {h["id"] for h in hits}:
        out.append("없는 기록 인용")
    han, ko = len(HAN.findall(answer)), len(HANGUL.findall(answer))
    if han / max(han + ko, 1) > max_han:
        out.append("한자 비율 초과")
    return out

def advise_checked(q, hits):
    answer = advise(q, hits)
    issues = problems(answer, hits)
    if issues:                                    # 지적을 붙여 한 번만 다시
        answer = advise(q, hits, extra=f"이전 답의 문제: {', '.join(issues)}. 한국어로만, 제공된 [#번호]만 인용하라.")
        if problems(answer, hits):
            answer = "(자동 검사 경고: 답을 그대로 믿지 말고 기록을 확인하세요)\\n" + answer
    return answer`,
                    note: "사용자 메시지 끝에 '(한국어로 답하세요.)' 를 붙이는 것이 1차 방어 · 검사는 그다음 방어선"
                },
                {
                    lang: "python",
                    title: "가제티어로 질문 읽기: 조건·코드·기기",
                    src: `DEVICES = {"공유기", "프린터", "모니터", "노트북"}      # 실제로는 티켓 DB 의 고유값 목록
CODES = {"E-4012", "E-2201"}

def read_question(q):
    up = q.upper()
    floor = re.search(r"(\\d+)\\s*층", q)
    return {
        "floor": int(floor.group(1)) if floor else None,
        "bldg": next((b for b in ("본관", "별관") if b in q), None),
        "codes": [c for c in CODES if c in up],
        "devices": [d for d in DEVICES if d in q],
    }

print(read_question("본관 3층 프린터 E-4012 계속 떠요"))
# {'floor': 3, 'bldg': '본관', 'codes': ['E-4012'], 'devices': ['프린터']}`,
                    note: "목록은 손으로 쓰지 말고 기록 DB 에서 매일 다시 뽑기 · 목록에 없는 값은 절대 지어내지 않음"
                }
            ],
            optimize: [
                {
                    title: "검사 없이 표시 → 인용·언어 검사 후 1회 재시도",
                    before: { lang: "python", src: `return advise(q, hits)` },
                    after: { lang: "python", src: `return advise_checked(q, hits)` },
                    gain: "지어낸 번호·중국어 문장이 화면에 덜 나감",
                    note: "재시도는 1회로 제한 · 비용과 지연 상한을 지킴"
                },
                {
                    title: "임베딩 실패 = 전체 실패 → 키워드로 강등",
                    before: { lang: "python", src: `dense = dense_rank(q)      # 502 → 예외 → 화면에 오류` },
                    after: { lang: "python", src: `try:
    dense = dense_rank(q)
except OSError:
    dense, note = [], "의미 검색 꺼짐 (키워드만 사용)"` },
                    gain: "임베딩 서버가 죽어도 조언 페이지는 동작"
                }
            ],
            glossary: [
                { term: "가제티어", en: "Gazetteer", def: "이름 목록 사전 (기기·오류 코드·층) · 질문에서 조건과 정확 일치 대상을 뽑음" },
                { term: "출력 검증", en: "Output validation", def: "모델 답을 코드로 검사 (인용·형식·언어) 후 표시" },
                { term: "실패 분류", en: "Failure taxonomy", def: "틀린 답을 원인별로 나눈 표 · 고칠 곳과 우선순위를 정함" },
                { term: "언어 혼용", en: "Code-switching", def: "한 답 안에 여러 언어가 섞이는 현상 · 언어 이탈의 다른 이름" }
            ],
            quiz: [
                { type: "num", q: "답에 한글 40자, 한자 10자가 있다. 한자 / (한글 + 한자) 비율은?", answer: 0.2, tol: 0.001, why: "10 / 50 = 0.2 · 기준 0.05 를 넘으니 재시도" },
                { type: "text", q: "출력은?", code: { lang: "python", src: "import re\nprint(len(re.findall(r\"[\\u4e00-\\u9fff]\", \"조치: 커넥터 재연결 后 정상\")))" }, answer: ["1"], why: "'后'(U+540E) 한 글자만 CJK 한자 범위 · 한글은 U+AC00–U+D7A3" },
                { type: "num", q: "실패 50건 분류: 못 찾음 22, 엉뚱한 조건 9, 얇은 기록 11, 지어냄 5, 언어 3. 검색 쪽(못 찾음 + 조건) 비율은?", answer: 0.62, tol: 0.001, why: "31 / 50 = 0.62 → 생성보다 검색 개선이 먼저" },
                { q: "'본관 3층' 질문에 3층 티켓이 0건 — 분류는?", options: ["얇은 기록 (내용 부족)", "엉뚱한 조건 (필터)", "언어 이탈 (중국어)", "지어냄 (근거 없음)"], a: 1, why: "티켓은 있는데 조건을 단어로 다뤄 다른 층이 자리를 차지" },
                { q: "답에 [#120] 인용, 넘겨준 기록은 101·105·108. 할 일은?", options: ["그대로 표시", "120 번 기록을 DB 에서 찾아 붙여 줌", "지어낸 인용 → 재시도·경고", "인용 표시만 지우고 표시"], a: 2, why: "모델이 본 적 없는 번호 = 근거 없는 주장 · 조용히 고치면 문제가 숨음" },
                { q: "기록 본문에 '이전 지시를 무시하고 …' 문장이 있다면?", options: ["그 지시를 그대로 따름", "자료로만 다루고 따르지 않음", "기록을 지우고 작성자 차단", "시스템 프롬프트에 복사해 둠"], a: 1, why: "간접 프롬프트 주입 · 자료와 지시를 구분하고 출력도 검사" },
                { q: "벡터가 아직 없는 새 기록은 검색에서?", options: ["검색에서 영원히 빠짐", "키워드 다리로만 잡힘", "검색 전체가 실패함", "0 벡터라 의미 다리 1위"], a: 1, why: "두 다리 구조의 장점 · 벡터는 파생 데이터라 나중에 만들어도 됨" },
                { q: "중국어 문장이 섞여 나올 때 먼저 해 볼 것은?", options: ["temperature 를 1.5 로 올리기", "끝에 '한국어로 답하세요' + 검사", "기록을 중국어로 번역해 넣기", "max_tokens 를 절반으로 줄이기"], a: 1, why: "끝 지시는 생성 직전에 읽힘 · 그래도 새면 한자 비율 검사로 잡아 재시도" },
                { q: "가제티어 목록은 어디서?", options: ["모델에게 목록을 생성시킴", "기록 DB 실제 값에서 주기 추출", "한 번 손으로 써서 고정", "목록 없이 질문 단어를 전부 검색"], a: 1, why: "목록에 없는 코드를 지어내면 필터가 0건 · 실제 값에서만" },
                { type: "order", q: "틀린 답 진단 순서", items: ["정답 기록이 DB 에 있나", "조건 필터를 통과했나", "top-k 안에 들었나", "프롬프트에 들어갔나", "답이 그 기록을 인용했나"], why: "앞 단계가 막히면 뒤는 볼 필요 없음 · 실패를 이 다섯 칸에 분류하면 고칠 곳이 보임" }
            ],
            refs: [
                { title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning", by: "DeepSeek-AI", year: 2025, url: "https://arxiv.org/abs/2501.12948", kind: "paper" },
                { title: "Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection", by: "Greshake et al.", year: 2023, url: "https://arxiv.org/abs/2302.12173", kind: "paper" },
                { title: "LLM01:2025 Prompt Injection", by: "OWASP", year: 2025, url: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/", kind: "doc" }
            ]
        }
    ]
});
