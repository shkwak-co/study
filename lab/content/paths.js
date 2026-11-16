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
        "deep-learning/cnn", "deep-learning/rnn", "deep-learning/transformer", "ai/llm", "ai/tokenizer", "ai/prompting", "ai/rag",
        "ai/agents", "ai/finetune", "deep-learning/quantization", "ai/edge-ai", "ai/eval"
    ]
});
