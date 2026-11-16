# Study Lab

Interactive study site: embedded, assembly, memory, robotics, languages, data structures, protocols, deep learning, AI.
Plain HTML/CSS/JS, no build, no CDN — open `lab/index.html` directly (`file://`).

## Pages

| File | What |
|---|---|
| `index.html` | home: tracks, continue, activity, term of the day |
| `track.html?t=<track>` | lesson path, trends, terms, mixed quiz |
| `lesson.html?t=<track>&l=<lesson>` | key points · demo · code · optimization · terms · quiz · memo |
| `deep.html?t=<track>&l=<lesson>` | long-form explanation (상세 설명) from `content/deep/<track>.js` |
| `labs.html` / `labs.html?lab=<track>/<lesson>` | every interactive sim in one place, filter by tag, open one full-width |
| `glossary.html` | all terms, search, flashcards |
| `refs.html` | all cited papers, standards, docs · filter by track/kind, links back to lessons |
| `me.html` | progress, wrong answers, notes, bookmarks, save/sync |

`Ctrl+K` search · `Ctrl+S` save progress.

## Progress sync between PCs

Progress lives in the browser (`localStorage`) **and** in `lab/my/progress.js`.

1. `내 학습` → **저장 폴더 연결** → pick `study/lab/my` (once per browser, Chrome/Edge).
2. Studying auto-saves to `my/progress.js`.
3. `git commit` + `git push`.
4. Other PC: `git pull`, open the page — `progress.js` is merged in (newest entry wins, best quiz score kept).

Browsers without the File System Access API: the badge downloads `progress.js`; overwrite `lab/my/progress.js` with it.

## Adding content

One file per track: `content/<track>.js`, registered in `TRACK_IDS` (`assets/lab.js`).
Validate with `node lab/check.mjs` (or `node lab/check.mjs <track>`). `--links` also fetches every ref url.

```js
LAB.track({
  id: "protocols", name: "프로토콜", icon: "⇄", color: "#34d399", tagline: "one line",
  trends: [{ title, when: "2026", points: ["one line", ...], refs: [...] }],
  lessons: [{
    id: "uart", title: "UART", level: 1, mins: 12,          // level 1..3
    key: ["one-line takeaway", ...],                        // 3–4, `code` and **bold** allowed
    concepts: [{ term, en, def }],                          // 3–5 cards · en required for Korean terms
    demo: { type: "steps" | "wave" | "seq" | "sim", ... },  // see below
    code: [{ lang, title, src, note }],                     // 1–2
    optimize: [{ title, before: { lang, src }, after: { lang, src }, gain: "×3", note }],
    glossary: [{ term, en, def }],                          // 4–6
    quiz: [{ q, options: [...], a: 0, why: "one line" }],   // 4–5, a = index of the right option
    refs: [{ title, by, year, url, kind }]                  // 2–4 · kind: paper | spec | doc | book
  }]
});
```

Style: short lines, no paragraphs. Inline `` `code` `` and `**bold**` render in every text field.

English originals: every Korean term card (`concepts`, `glossary`) has `en` — the full English name, acronym in parentheses (`Multi-Layer Perceptron (MLP)`).
In the body (key → demo captions → code notes → optimize), a Korean term's **first** mention per lesson reads `오버샘플링(oversampling)` (bold: `**오버샘플링(oversampling)**`); trends: first mention per card.
Not in code, quiz, diagram labels.

References: `refs` on lessons and trends — original papers (arXiv/DOI), official specs, vendor docs.
`by` = first author + "et al." or the publisher; `year` = integer, omitted for undated living docs. Only links that were opened and checked.

### Demo types

**steps** — boxes on a grid, highlighted step by step.
```js
{ type: "steps",
  nodes: [{ id: "a", label: "CPU", sub: "small mono text", x: 0, y: 0 }],   // x,y = grid cell; label ≤ 10 chars, sub ≤ 18
  edges: [{ from: "a", to: "b", label: "IRQ", arc: "down" | "up", both: true }],
  steps: [{ on: ["a", "a>b"], text: "caption" }] }                        // ids of nodes and "from>to" edges
```

**wave** — timing diagram. One char per time slot: `0 1` level, `p` clock, `=` data box (label from `data`), `x` unknown, `z` hi-Z, `.` continue previous.
```js
{ type: "wave",
  signals: [{ name: "SCL", wave: "1.p.p.p.1" }, { name: "SDA", wave: "10=.=.x.1", data: ["A6", "A5"] }],
  steps: [{ from: 0, to: 2, tag: "START", text: "caption" }] }           // slot range [from, to)
```

**seq** — sequence diagram, messages appear one by one.
```js
{ type: "seq", actors: ["Client", "Server"],
  msgs: [{ from: 0, to: 1, label: "SYN seq=x", text: "caption" }] }      // from === to: self message
```

**sim** — interactive. `{ type: "sim", name, ...options }`

| name | options | shows |
|---|---|---|
| `pid` | `kp ki kd` | step response, presets |
| `kalman` | `q r` | noisy signal vs 1D Kalman estimate |
| `arm` | `l1 l2` | 2-link arm, drag target (IK) / joint sliders (FK) |
| `astar` | — | grid search A* / Dijkstra / Greedy, paint walls |
| `memory` | `lang code steps:[{ line, stack:[{ fn, vars:[[name, value]] }], heap:[[addr, value]], text }]` | stack/heap per line; heap value `freed` shows as freed |
| `sched` | `tasks:[{ name, prio, period, wcet }] horizon` | preemptive / cooperative / round-robin timeline |
| `nn` | — | 2-3-1 XOR network + decision map, activation switch |
| `gd` | — | SGD vs Momentum vs Adam on a ravine loss |
| `attention` | `tokens weights? links?:[[i, j, boost]] query` | attention arcs + matrix, temperature, causal mask |
| `pwm` | `fclk` | duty/frequency → waveform, LED, PSC/ARR/CCR |
| `adc` | — | resolution + sampling rate → quantization, aliasing |
| `sampling` | `prompt tokens logits` | temperature / top-k / top-p decoding |
| `conv` | — | 3×3 kernel sliding, stride/padding, output size |
| `reg` | `reg value bit width` | 32-bit register: REG / MASK / result preview, set · clear · toggle · field write · field read |
| `bitops` | `a b width n op` | 8/16/32-bit ALU: logic, shifts, rotates, add/sub/neg, bit tricks, NZCV flags · A/B accept `0x3C`, `0b1010`, `-4` |
| `float` | `format value` | IEEE 754 fp32 / fp16 / bf16 / fp8 E5M2: click bits or type a value, stored value, error, ±1 ULP |
| `crc` | `poly msg` | CRC long division step by step (`crc3`, `crc8`, `crc16`), receive check, click bits to inject errors |

| `cpu` | `code expect regs? c? cTitle? title? intro? speed?` | Thumb-2 assembly stepper: registers, NZCV, RAM (data + stack), undo, edit. `expect: { r0: 14 }` is checked by `check.mjs` |
| `cache` | `size block ways pattern` | cache sim: address → tag/index/offset bits, sets × ways, LRU, hit rate · pattern `seq` `stride` `row` `col` `conflict` `reuse` |
| `layout` | `fields:[[type, name]] arch value?` | struct layout: padding, sizeof/alignof, reorder, packed · arch `32` (Arm AAPCS) / `64` (LP64) · types in `LAB.LAYOUT_TYPES` · endianness of `value` |
| `ringbuf` | `size mode` | ring buffer put/get, head/tail · mode `spare` (one empty slot) `count` `free` (free-running indices) · overwrite policy |
| `hash` | `size mode keys` | hash table insert/search/delete · mode `chain` / `linear` · load factor, probes, rehash |
| `heap` | `kind values` | binary heap (`min` / `max`): insert, extract, heapify · tree + array view, sift steps |
| `bst` | `values` | binary search tree insert/search/delete · path, height, in-order |
| `sort` | `algo n input` | sorting animation · algo `bubble` `insertion` `selection` `merge` `quick` `heap` · input `random` `nearly` `reversed` `few` · comparisons / swaps |

**cpu** program rules: Armv7-M Thumb-2 UAL subset — `mov mvn add adc sub sbc rsb neg mul udiv sdiv and orr eor bic lsl lsr asr ror cmp cmn tst` (+`s` suffix sets flags; operand 2 may be `#imm`, a register, or `rX, lsl #n`), `b` + condition (`eq ne cs/hs cc/lo mi pl vs vc hi ls ge lt gt le`), `cbz cbnz bl bx blx`, `push pop` (`{r4-r7, lr}`, `pop {.., pc}` returns), `ldr str ldrb strb ldrh strh ldrsb ldrsh` with `[rn]`, `[rn, #imm]`, `[rn, rm]`, `[rn, rm, lsl #2]`, pre-index `[rn, #4]!`, post-index `[rn], #4`, and `ldr rX, =label|imm`.
Data: `.data` / `.text`, `label: .word 1, 2` · `.hword` `.byte` `.space n` `.asciz "s"` → RAM from `0x20000000`. Comments `@` `;` `//`.
LR starts at `0xFFFFFFFF`: `bx lr` from the top level ends the program (or falling off the end). SP starts at `0x20001000`. Out-of-RAM access → HardFault. Simplified: 4 bytes per instruction, no IT blocks, no `ldm/stm`, no reading `pc`.

Every sim also needs a line in `LAB.SIM_INFO` (`assets/anim.js`): `[title, one line, tag]` — it is listed on `labs.html`.
The bit-lab math lives in `LAB.num` (`alu`, `fenc`/`fdec`, `crcDiv`) and is tested by `check.mjs`.

## Long-form articles (상세 설명)

One optional file per track: `content/deep/<track>.js`, loaded by `track`/`lesson`/`deep` pages.
The lesson page shows a "상세 설명" button and card when an article exists.

```js
LAB.article("embedded", {
  gpio: {                                        // lesson id
    intro: "2–4 sentences",
    sections: [{
      h: "heading",
      p: ["paragraph", ...],                     // any of p / list / table / code / demo
      list: ["bullet", ...],
      table: { head: ["a", "b"], rows: [["1", "2"]] },
      code: { lang, title, src, note },
      demo: "lesson" | { ...demo spec },         // "lesson" re-embeds the lesson's own demo
      tip: "one line"
    }],
    pitfalls: ["common mistake", ...],
    summary: ["takeaway", ...]
  }
});
```

Full sentences are fine here. Same English-original rule: first mention per article reads `용어(English)` (checked for the lesson's card terms). No new refs — the page shows the lesson's `refs`.
