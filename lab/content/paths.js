// Learning paths: ordered lessons across tracks, shown on the home page. Ids are "track/lesson".
LAB.path({
    id: "firmware",
    name: "펌웨어 기초",
    desc: "비트와 명령어에서 시작해 인터럽트, 통신, RTOS, 저전력까지",
    lessons: [
        "embedded/bits", "assembly/asm-basics", "memory/mem-layout", "embedded/mcu", "embedded/gpio",
        "embedded/irq", "assembly/asm-call", "assembly/asm-exception", "assembly/asm-atomic", "protocols/uart", "data-structures/ds-ring",
        "protocols/i2c", "embedded/pwm", "embedded/adc", "embedded/rtos", "memory/mem-mcu", "embedded/power"
    ]
});
LAB.path({
    id: "cs",
    name: "소프트웨어 기초",
    desc: "포인터와 빌드, 수 표현, 메모리 계층을 거쳐 자료구조와 동시성까지",
    lessons: [
        "languages/c-pointer", "languages/build", "languages/float", "languages/complexity", "data-structures/ds-array-list",
        "memory/mem-hierarchy", "memory/mem-cache", "data-structures/ds-ring", "data-structures/ds-hash", "data-structures/ds-bst",
        "data-structures/ds-heap", "data-structures/ds-sort", "data-structures/ds-graph", "languages/concurrency"
    ]
});
LAB.path({
    id: "ai",
    name: "AI 기초",
    desc: "퍼셉트론과 역전파에서 Transformer, LLM, RAG, 엣지 배포까지",
    lessons: [
        "deep-learning/perceptron", "deep-learning/backprop", "deep-learning/optimizer", "deep-learning/regularization",
        "deep-learning/cnn", "deep-learning/rnn", "deep-learning/transformer", "ai/llm", "ai/assistant", "ai/ai-memory", "ai/tokenizer", "ai/prompting", "ai/rag",
        "ai/agents", "ai/finetune", "deep-learning/quantization", "ai/edge-ai", "ai/eval"
    ]
});
LAB.path({
    id: "rag",
    name: "RAG 실전",
    desc: "LLM과 프롬프트에서 시작해 임베딩, BM25, 하이브리드, 저장, 재정렬, 평가, 시스템 설계까지",
    lessons: [
        "ai/llm", "ai/assistant", "ai/ai-memory", "ai/prompting", "rag/rag-overview", "rag/embedding", "rag/keyword", "rag/hybrid",
        "rag/chunking", "rag/vector-store", "rag/rerank", "rag/rag-eval", "rag/rag-failures"
    ]
});
LAB.path({
    id: "numpy-torch",
    name: "NumPy·PyTorch 실전",
    desc: "배열 메모리와 브로드캐스팅에서 autograd, 학습 루프, GPU·정밀도까지",
    lessons: [
        "languages/python-internals", "numpy-torch/np-ndarray", "numpy-torch/np-vectorize", "numpy-torch/np-indexing",
        "numpy-torch/torch-tensor", "deep-learning/backprop", "numpy-torch/autograd", "deep-learning/optimizer",
        "numpy-torch/torch-train", "languages/float", "numpy-torch/torch-gpu"
    ]
});
LAB.path({
    id: "lang-ai",
    name: "AI 시대의 언어론",
    desc: "구문·타입·평가에서 Python 위·커널 아래의 AI 스택, LLM 이 코드를 쓸 때의 검증까지",
    lessons: [
        "languages/plt-basics", "languages/build", "languages/python-internals", "numpy-torch/torch-tensor",
        "languages/lang-ai-stack", "ai/assistant", "languages/lang-llm"
    ]
});
