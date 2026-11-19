/* Study Lab core: content registry, progress storage + file sync, shared UI, page renderers. */
(() => {
    "use strict";

    // Add a new track: create content/<id>.js and list the id here.
    const TRACK_IDS = ["embedded", "assembly", "memory", "robotics", "languages", "data-structures", "protocols", "deep-learning", "numpy-torch", "ai", "rag"];
    const EXTRA = [{
        id: "fpga",
        name: "FPGA / ASIC",
        icon: "▦",
        color: "#60a5fa",
        tagline: "RTL을 회로로 보기 · 기존 Verilog/SV 학습 페이지",
        href: "../FPGA_ASIC_Learning/interactive/08_verilog_systemverilog.html"
    }];
    // home grouping (every TRACK_ID and EXTRA id belongs to exactly one)
    const CATEGORIES = [
        { name: "하드웨어·저수준", tracks: ["embedded", "assembly", "memory", "fpga"] },
        { name: "소프트웨어 기초", tracks: ["languages", "data-structures"] },
        { name: "통신", tracks: ["protocols"] },
        { name: "로보틱스", tracks: ["robotics"] },
        { name: "AI", tracks: ["deep-learning", "numpy-torch", "ai", "rag"] }
    ];

    const LAB = window.LAB = window.LAB || {};
    LAB.tracks = {};
    LAB.track = (t) => { LAB.tracks[t.id] = t; };
    LAB.list = () => TRACK_IDS.map((id) => LAB.tracks[id]).filter(Boolean);
    LAB.CATEGORIES = CATEGORIES;
    LAB.EXTRA_IDS = EXTRA.map((x) => x.id);
    const categoryOf = (id) => CATEGORIES.find((c) => c.tracks.includes(id));
    // learning paths: content/paths.js → LAB.path({ id, name, desc, lessons: ["track/lesson", ...] })
    LAB.paths = [];
    LAB.path = (p) => { LAB.paths.push(p); };
    LAB.REF_KINDS = { paper: "논문", spec: "표준", doc: "문서", book: "책" };
    // long-form explanations: content/deep/<track>.js → LAB.article("<track>", { <lessonId>: { intro, sections, pitfalls, summary } })
    LAB.articles = {};
    LAB.article = (tid, map) => { LAB.articles[tid] = { ...(LAB.articles[tid] || {}), ...map }; };
    const articleOf = (t, l) => (LAB.articles[t.id] || {})[l.id];
    const readMins = (a) => Math.max(3, Math.round(JSON.stringify(a).length / 900));

    /* ---------- helpers ---------- */
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);
    const fmt = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    const plain = (s) => String(s ?? "").replace(/[`*]/g, "");
    const dayOf = (t) => new Date(t).toLocaleDateString("sv");
    const hhmm = (t) => new Date(t).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
    const keyOf = (t, l) => `${t}/${l}`;
    const lessonHref = (t, l) => `lesson.html?t=${encodeURIComponent(t)}&l=${encodeURIComponent(l)}`;
    const deepHref = (t, l) => `deep.html?t=${encodeURIComponent(t)}&l=${encodeURIComponent(l)}`;
    const labHref = (t, l) => `labs.html?lab=${encodeURIComponent(t)}/${encodeURIComponent(l)}#lab`;
    const trackHref = (t) => `track.html?t=${encodeURIComponent(t)}`;
    const rm = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((v) => v[1]);
    Object.assign(LAB, { $, $$, esc, fmt, plain, keyOf, lessonHref, trackHref, shuffle });

    /* ---------- progress state ---------- */
    const KEY = "lab.v1";
    const MAPS = ["lessons", "quiz", "notes", "marks", "srs"];
    const blank = () => ({ lessons: {}, quiz: {}, notes: {}, marks: {}, srs: {}, days: {}, last: null, resetAt: 0 });

    // spaced repetition (Leitner): box 1..5, next review after 1/2/4/8/16 days; wrong → box 1, tomorrow
    // keys: "track/lesson#quizIndex" for quiz items, "g:<term>" for flashcards
    const SRS_DAYS = [1, 2, 4, 8, 16];
    const addDays = (day, n) => { const d = new Date(`${day}T12:00:00`); d.setDate(d.getDate() + n); return dayOf(d); };
    function srsNext(cur, ok, today) {
        const box = ok ? Math.min(SRS_DAYS.length, ((cur && cur.box) || 0) + 1) : 1;
        return { box, due: addDays(today, ok ? SRS_DAYS[box - 1] : 1) };
    }
    LAB.srsNext = srsNext;

    // Per-entry newest-wins merge; quiz best keeps the max. Used for localStorage + my/progress.js.
    function merge(a, b) {
        a = { ...blank(), ...(a || {}) };
        b = { ...blank(), ...(b || {}) };
        const out = blank();
        out.resetAt = Math.max(a.resetAt || 0, b.resetAt || 0);
        const alive = (v) => v && (v.t || 0) > out.resetAt;
        for (const k of MAPS) {
            for (const id of new Set([...Object.keys(a[k]), ...Object.keys(b[k])])) {
                const x = alive(a[k][id]) ? a[k][id] : null;
                const y = alive(b[k][id]) ? b[k][id] : null;
                let v = !x ? y : !y ? x : (y.t > x.t ? y : x);
                if (k === "quiz" && x && y) v = { ...v, best: Math.max(x.best || 0, y.best || 0) };
                if (v) out[k][id] = v;
            }
        }
        const cut = out.resetAt ? dayOf(out.resetAt) : "";
        for (const d of new Set([...Object.keys(a.days), ...Object.keys(b.days)])) {
            if (d >= cut) out.days[d] = Math.max(a.days[d] || 0, b.days[d] || 0);
        }
        out.last = [a.last, b.last].filter(alive).sort((p, q) => q.t - p.t)[0] || null;
        return out;
    }
    const sortKeys = (v) => Array.isArray(v) ? v.map(sortKeys)
        : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])])) : v;
    const stable = (o) => JSON.stringify(sortKeys(o), null, 1);
    LAB.merge = merge;
    LAB.stable = stable;

    let S = blank();
    const listeners = new Set();
    LAB.state = () => S;
    LAB.onChange = (fn) => listeners.add(fn);

    function loadState() {
        let local = null;
        try { local = JSON.parse(localStorage.getItem(KEY)); } catch (e) { /* empty or blocked storage */ }
        S = merge(local, window.LAB_SAVED);
        try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
        Sync.dirty = stable(S) !== stable(merge(window.LAB_SAVED, null));
    }
    function commit() {
        try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
        Sync.dirty = true;
        Sync.schedule();
        listeners.forEach((fn) => fn(S));
    }
    function activity() {
        const d = dayOf(Date.now());
        S.days[d] = (S.days[d] || 0) + 1;
    }
    LAB.put = (map, id, val) => {
        S[map][id] = { ...val, t: Date.now() };
        activity();
        commit();
    };
    LAB.visit = (id) => { S.last = { id, t: Date.now() }; commit(); };
    LAB.importState = (obj) => { S = merge(S, obj); commit(); };
    LAB.resetAll = () => { S = { ...blank(), resetAt: Date.now() }; commit(); };
    // write a review result without its own activity tick (the answer that caused it already counts)
    LAB.srsPut = (key, ok) => { S.srs[key] = { ...srsNext(S.srs[key], ok, dayOf(Date.now())), t: Date.now() }; };
    const isDue = (key) => { const v = S.srs[key]; return !!v && v.due <= dayOf(Date.now()); };
    const isDone = (t, l) => !!(S.lessons[keyOf(t, l)] || {}).done;
    const trackDone = (t) => t.lessons.filter((l) => isDone(t.id, l.id)).length;
    const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;

    /* ---------- file sync: my/progress.js via File System Access API ---------- */
    const fileText = () => "// Study Lab progress — written by the lab pages (내 학습 > 저장 폴더).\n"
        + "// Commit this file to carry progress to another PC.\n"
        + `window.LAB_SAVED = ${stable(S)};\n`;

    function idb(op, key, val) {
        return new Promise((res, rej) => {
            const r = indexedDB.open("study-lab", 1);
            r.onupgradeneeded = () => r.result.createObjectStore("kv");
            r.onerror = () => rej(r.error);
            r.onsuccess = () => {
                const st = r.result.transaction("kv", op === "get" ? "readonly" : "readwrite").objectStore("kv");
                const q = op === "get" ? st.get(key) : op === "del" ? st.delete(key) : st.put(val, key);
                q.onsuccess = () => res(q.result);
                q.onerror = () => rej(q.error);
            };
        });
    }

    function download(name, text, type = "text/javascript") {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([text], { type }));
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }
    LAB.download = download;

    const Sync = LAB.sync = {
        dir: null,
        s: "none",
        at: 0,
        dirty: false,
        timer: 0,
        api: typeof window.showDirectoryPicker === "function",
        async init() {
            if (!this.api) return this.set("unsupported");
            try { this.dir = await idb("get", "dir"); } catch (e) { this.dir = null; }
            if (!this.dir) return this.set("none");
            let p = "prompt";
            try { p = await this.dir.queryPermission({ mode: "readwrite" }); } catch (e) { /* stale handle */ }
            this.set(p === "granted" ? "ok" : "prompt");
            if (this.dirty) this.schedule();
        },
        set(s) { this.s = s; renderBadge(); },
        schedule() {
            if (this.s !== "ok") return renderBadge();
            clearTimeout(this.timer);
            this.timer = setTimeout(() => this.flush(), 700);
        },
        flush() {
            clearTimeout(this.timer);
            this.timer = 0;
            return this.write().catch(() => this.set("prompt"));
        },
        async write() {
            this.set("busy");
            const f = await this.dir.getFileHandle("progress.js", { create: true });
            const w = await f.createWritable();
            await w.write(fileText());
            await w.close();
            this.at = Date.now();
            this.dirty = false;
            this.set("ok");
        },
        async connect() {
            let d = await window.showDirectoryPicker({ id: "study-lab", mode: "readwrite" });
            if (d.name !== "my") {
                // accept the repo root or lab/ too, as long as lab/my exists under it
                let found = null;
                for (const path of [["my"], ["lab", "my"]]) {
                    try {
                        let cur = d;
                        for (const p of path) cur = await cur.getDirectoryHandle(p);
                        found = cur;
                        break;
                    } catch (e) { /* try next */ }
                }
                if (!found) { toast("lab/my 폴더를 선택하세요"); return; }
                d = found;
            }
            await idb("set", "dir", d);
            this.dir = d;
            this.set("ok");
            await this.write();
            toast("저장 폴더 연결 완료 · 이제 자동 저장");
        },
        async save() {
            if (!this.api) { download("progress.js", fileText()); toast("progress.js 를 lab/my 에 덮어쓰세요"); return; }
            try {
                if (!this.dir) return await this.connect();
                if ((await this.dir.requestPermission({ mode: "readwrite" })) !== "granted") return this.set("prompt");
                await this.write();
                toast("my/progress.js 저장됨");
            } catch (e) {
                if (e.name !== "AbortError") toast(`저장 실패: ${e.message}`);
            }
        },
        async unlink() {
            try { await idb("del", "dir"); } catch (e) { /* ignore */ }
            this.dir = null;
            this.set("none");
        }
    };

    function renderBadge() {
        const b = $("#saveBadge");
        if (!b) return;
        const s = Sync.s;
        const label = {
            none: "저장 폴더 연결",
            prompt: "저장 허용 필요",
            busy: "저장 중…",
            unsupported: "기록 다운로드",
            ok: Sync.dirty ? "저장 대기" : Sync.at ? `저장됨 ${hhmm(Sync.at)}` : "자동 저장 켜짐"
        }[s];
        b.dataset.s = s;
        $(".lbl", b).textContent = label;
        b.title = s === "ok" ? "my/progress.js 에 자동 저장 중 (Ctrl+S: 즉시 저장)" : "클릭해서 my/progress.js 저장";
        listeners.forEach((fn) => fn(S, "sync"));
    }

    /* ---------- small UI pieces ---------- */
    let toastTimer = 0;
    function toast(msg) {
        let t = $(".toast");
        if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.append(t); }
        t.textContent = msg;
        t.classList.add("on");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove("on"), 2200);
    }
    LAB.toast = toast;

    function ring(p, size = 64, label = `${p}%`) {
        const r = (size - 8) / 2;
        const c = 2 * Math.PI * r;
        return `<div class="ring-wrap" style="width:${size}px;height:${size}px"><svg class="ring" width="${size}" height="${size}">`
            + `<circle class="bg" cx="${size / 2}" cy="${size / 2}" r="${r}"/>`
            + `<circle class="fg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${c * (1 - p / 100)}"/>`
            + `</svg><span>${label}</span></div>`;
    }
    LAB.ring = ring;

    const lvl = (n) => `<span class="lvl" title="난이도 ${n}/3">${[1, 2, 3].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;

    function countUp(el) {
        const to = +el.dataset.count;
        const suf = el.dataset.suffix || "";
        if (rm()) { el.textContent = to + suf; return; }
        const t0 = performance.now();
        const step = (t) => {
            const k = Math.min(1, (t - t0) / 1100);
            el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suf;
            if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const t = e.target;
            io.unobserve(t);
            t.classList.add("in");
            if (t.dataset.count) countUp(t);
            if (t.dataset.w) t.style.width = t.dataset.w;
            if (t.dataset.off) t.style.strokeDashoffset = t.dataset.off;
        });
    }, { threshold: 0.12 }) : null;
    function observe(root = document) {
        $$(".reveal, .code, [data-count], [data-w], [data-off]", root).forEach((x) => io ? io.observe(x) : x.classList.add("in"));
    }
    LAB.observe = observe;

    function confetti() {
        if (rm()) return;
        const cv = document.createElement("canvas");
        cv.className = "confetti";
        document.body.append(cv);
        const ctx = cv.getContext("2d");
        cv.width = innerWidth;
        cv.height = innerHeight;
        const cols = ["#22d3ee", "#a78bfa", "#34d399", "#f472b6", "#facc15", "#f97316"];
        const ps = Array.from({ length: 90 }, () => ({
            x: innerWidth / 2, y: innerHeight * 0.35,
            vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 14 - 4,
            r: Math.random() * 6 + 3, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4,
            c: cols[(Math.random() * cols.length) | 0]
        }));
        const t0 = performance.now();
        const frame = (t) => {
            ctx.clearRect(0, 0, cv.width, cv.height);
            ps.forEach((p) => {
                p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.a);
                ctx.fillStyle = p.c;
                ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
                ctx.restore();
            });
            if (t - t0 < 2600) requestAnimationFrame(frame); else cv.remove();
        };
        requestAnimationFrame(frame);
    }
    LAB.confetti = confetti;

    /* ---------- syntax highlighter (tiny, regex based) ---------- */
    const words = (s) => new Set(s.split(/\s+/));
    const KW = {
        c: words("auto break case char const continue default do double else enum extern float for goto if inline int long register restrict return short signed sizeof static struct switch typedef union unsigned void volatile while bool true false NULL class namespace template typename public private protected virtual override final new delete this nullptr constexpr using noexcept operator explicit friend mutable try catch throw decltype static_cast reinterpret_cast const_cast dynamic_cast co_await co_return co_yield concept requires"),
        rs: words("as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while Some None Ok Err"),
        py: words("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield self print len range"),
        js: words("async await break case catch class const continue default delete do else export extends false finally for function if import in instanceof let new null of return static super switch this throw true try typeof undefined var void while yield"),
        sh: words("if then else fi for do done while case esac function export echo cd sudo source"),
        yaml: words("true false null"),
        v: words("module endmodule input output inout wire reg logic always always_ff always_comb assign begin end if else case endcase posedge negedge parameter localparam"),
        asm: new Set()
    };
    const FAM = (lang) => {
        const l = String(lang || "").toLowerCase();
        if (/^(py|python)$/.test(l)) return "py";
        if (/^(sh|bash|shell|console|cmd)$/.test(l)) return "sh";
        if (/^(rs|rust)$/.test(l)) return "rs";
        if (/^(js|ts|javascript|typescript|json)$/.test(l)) return "js";
        if (/^(yaml|yml|toml|ini)$/.test(l)) return "yaml";
        if (/^(v|sv|verilog|systemverilog)$/.test(l)) return "v";
        if (/^(asm|s|arm|thumb|nasm|x86|riscv|rv|gas)$/.test(l)) return "asm";
        return "c";
    };
    // assembly: mnemonics (with condition / size / S suffixes), registers of Arm, RISC-V and x86-64
    const ASM_OP = /^(?:mov|mvn|add|adc|sub|sbc|rsb|neg|mul|mla|mls|[us]mull|udiv|sdiv|and|orr|eor|bic|lsl|lsr|asr|ror|cmp|cmn|tst|teq|b|bl|blx|bx|cbn?z|push|pop|ldr|str|ldm|stm|ldrex|strex|nop|svc|bkpt|it|ite|itt|cps[ie]d|wfi|wfe|dmb|dsb|isb|adr|mrs|msr|ubfx|sbfx|bfi|rev|clz|li|la|lui|auipc|addi|andi|ori|xori|slli|srli|srai|sll|srl|sra|slt|sltu|lw|sw|lb|sb|lh|sh|lbu|lhu|ld|sd|j|jal|jalr|ret|beqz|bnez|beq|bne|blt|bge|bltu|bgeu|ecall|call|lea|imul|idiv|div|jmp|j[a-z]{1,3}|inc|dec|xor|or|not|shl|shr|sar|test|syscall|leave|cmov[a-z]*|set[a-z]{1,3}|movzx|movsx|movsxd|cdq|cqo|enter|endbr64)(?:eq|ne|cs|cc|hs|lo|mi|pl|vs|vc|hi|ls|ge|lt|gt|le|al)?(?:s|b|h|sb|sh|d|q|l|w)?(?:\.[wn])?$/i;
    const ASM_REG = /^(?:r\d{1,2}|sp|lr|pc|ip|fp|xpsr|apsr|primask|msp|psp|x\d{1,2}|a[0-7]|t[0-6]|s\d{1,2}|ra|gp|tp|zero|[re]?(?:ax|bx|cx|dx|si|di|sp|bp)|r\d{1,2}[dwb]|[abcd][lh]|[re]ip|xmm\d+)$/i;
    const R = {
        cmtC: /\/\/.*|\/\*[\s\S]*?\*\//.source,
        cmtH: /#.*/.source,
        pre: /^[ \t]*#[ \t]*\w+/.source,
        strLong: /"""[\s\S]*?"""|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/.source,
        strShort: /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])'/.source,
        num: /\b(?:0x[\da-fA-F_]+|0b[01_]+|\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?)[uUlLfF]*\b/.source,
        id: /[A-Za-z_]\w*/.source
    };
    const span = (cls, text) => text.split("\n").map((p) => `<span class="tk-${cls}">${esc(p)}</span>`).join("\n");
    function hl(src, lang) {
        const fam = FAM(lang);
        const kw = KW[fam];
        const asm = fam === "asm";
        const x86 = asm && /x86|nasm/.test(String(lang).toLowerCase());
        const cmt = ["py", "sh", "yaml"].includes(fam) || (asm && /riscv|rv/.test(String(lang).toLowerCase())) ? R.cmtH
            : x86 ? /;.*|#.*/.source : asm ? /@.*|;.*|\/\/.*/.source : R.cmtC;
        const pre = fam === "c" ? R.pre : asm ? /\.[A-Za-z_]\w*|^[ \t]*[A-Za-z_.$][\w.$]*:/.source : "(?!)";
        const str = ["c", "rs", "v"].includes(fam) ? R.strShort : R.strLong;
        const re = new RegExp(`(${cmt})|(${pre})|(${str})|(${R.num})|(${R.id})(\\s*\\()?`, "gm");
        let out = "";
        let last = 0;
        let m;
        while ((m = re.exec(src))) {
            out += esc(src.slice(last, m.index));
            const [all, c, p, s, n, id, call] = m;
            if (c) out += span("c", c);
            else if (p) out += span("p", p);
            else if (s) out += span("s", s);
            else if (n) out += span("n", n);
            else if (id) {
                const cls = asm ? (x86 && ASM_REG.test(id) ? "t" : ASM_OP.test(id) ? "k" : ASM_REG.test(id) ? "t" : "") // bl/bx: Arm ops, x86 regs
                    : kw.has(id) ? "k"
                    : /_t$|_TypeDef$/.test(id) || (fam !== "c" && /^[A-Z][a-z]\w*$/.test(id)) ? "t"
                        : /^[A-Z][A-Z0-9_]{2,}$/.test(id) ? "p"
                            : call ? "f" : "";
                out += cls ? span(cls, id) : esc(id);
                if (call) out += esc(call);
            } else out += esc(all);
            last = re.lastIndex;
        }
        return out + esc(src.slice(last));
    }
    LAB.hl = hl;

    function codeBox(c, extra = "", tag = "") {
        const lines = hl(String(c.src || "").replace(/\s+$/, ""), c.lang).split("\n");
        return `<div class="code ${extra}">`
            + `<div class="code-h"><span class="dots"><i></i><i></i><i></i></span><span class="lang">${esc(c.lang || "")}</span><span>${esc(c.title || "")}</span><button type="button" data-copy>복사</button></div>`
            + (tag ? `<span class="tag">${tag}</span>` : "")
            + `<pre><code>${lines.map((l, i) => `<span class="ln" data-n="${i + 1}" style="--i:${i}">${l}</span>`).join("")}</code></pre>`
            + (c.note ? `<p class="note">${fmt(c.note)}</p>` : "")
            + `</div>`;
    }
    LAB.codeBox = codeBox;

    /* ---------- quiz ---------- */
    // item types: mc { options, a } · num { answer, tol?, unit? } · text { answer: string | string[] } · order { items (correct order) }
    // any type may carry code: { lang, src }, shown above the answer area
    const qType = (it) => it.type || "mc";
    const Q_LABEL = { mc: "객관식", num: "계산", text: "결과 예측", order: "순서" };
    const parseAnswerNum = (s) => {
        const t = String(s ?? "").trim().replace(/[_,\s]/g, "");
        if (/^-?0x[0-9a-f]+$/i.test(t)) return parseInt(t, 16);
        if (/^-?0b[01]+$/i.test(t)) return (t[0] === "-" ? -1 : 1) * parseInt(t.replace(/^-?0b/i, ""), 2);
        if (/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(t)) return Number(t);
        return NaN;
    };
    const normText = (s) => String(s ?? "").toLowerCase().replace(/\s+/g, "");
    // pure: (item, response) → correct?  response: option index (mc), string (num/text), array of item strings (order)
    function grade(it, r) {
        switch (qType(it)) {
            case "num": {
                const v = parseAnswerNum(r);
                return Number.isFinite(v) && Math.abs(v - it.answer) <= (it.tol || 0) + 1e-9 * Math.max(1, Math.abs(it.answer));
            }
            case "text": return normText(r) !== "" && [].concat(it.answer).some((a) => normText(a) === normText(r));
            case "order": return Array.isArray(r) && r.length === it.items.length && r.every((x, k) => x === it.items[k]);
            default: return r === it.a;
        }
    }
    LAB.grade = grade;
    LAB.Q_TYPES = Object.keys(Q_LABEL);

    // keys for the quiz last touched (or the only one) while it is on screen: 1–6 / A–F pick an option, Enter → next
    let activeQuiz = null;
    if (window.document && document.addEventListener) {
        document.addEventListener("keydown", (e) => {
            const h = activeQuiz;
            const el = e.target instanceof Element ? e.target : document.body;
            if (!h || !h.isConnected || e.ctrlKey || e.metaKey || e.altKey || el.closest("input, textarea, select, [contenteditable]")) return;
            const r = h.getBoundingClientRect();
            if (r.bottom < 0 || r.top > innerHeight) return;
            if (e.key === "Enter" && !el.closest("button, a")) { const n = $(".qz-next button", h); if (n) { e.preventDefault(); n.click(); } return; }
            const k = "123456".indexOf(e.key) >= 0 ? "123456".indexOf(e.key) : "abcdef".indexOf(e.key.toLowerCase());
            const b = k >= 0 && e.key.length === 1 && $$(".qz-opts button", h)[k];
            if (b && !b.disabled) { e.preventDefault(); b.click(); }
        });
    }

    // items: [{ ...question, src?, key?, idx? }]
    // opts: onAnswer(it, ok) · onDone(score, total, retry) · retry (wrong-only rerun) · endBtn: [label, fn] (extra button on the result screen)
    function quiz(host, items, opts = {}) {
        activeQuiz = host;
        host.onpointerdown = () => { activeQuiz = host; };
        let i = 0;
        let score = 0;
        let cur = [];
        let shown = 0;
        const res = [];
        const dots = () => items.map((_, k) => `<i class="${res[k] === true ? "r" : res[k] === false ? "w" : k === i ? "cur" : ""}"></i>`).join("");
        const drawOrder = (locked) => {
            $(".qz-order", host).innerHTML = cur.map((x, k) => `<li data-k="${k}"><span class="n">${k + 1}</span><span>${fmt(x)}</span>`
                + `<button type="button" data-mv="-1" title="위로"${locked || !k ? " disabled" : ""}>↑</button><button type="button" data-mv="1" title="아래로"${locked || k === cur.length - 1 ? " disabled" : ""}>↓</button></li>`).join("");
        };
        function render() {
            if (i >= items.length) return end();
            const it = items[i];
            const ty = qType(it);
            shown++;
            let body;
            if (ty === "mc") {
                const order = shuffle(it.options.map((_, k) => k));
                body = `<div class="qz-opts">${order.map((k, n) => `<button type="button" data-k="${k}"><b>${"ABCDEF"[n]}</b><span>${fmt(it.options[k])}</span></button>`).join("")}</div>`;
            } else if (ty === "order") {
                cur = it.items.slice();
                for (let t = 0; t < 6 && cur.every((x, k) => x === it.items[k]); t++) cur = shuffle(it.items);
                body = `<p class="qz-hint">↑ ↓ 로 올바른 순서를 만든 뒤 확인</p><ol class="qz-order"></ol><div class="qz-in"><button type="button" class="btn small primary" data-go>확인</button></div>`;
            } else {
                body = `<div class="qz-in"><input type="text" autocomplete="off" spellcheck="false" placeholder="${ty === "num" ? "숫자 입력 (0x·0b 가능)" : "답 입력"}">${it.unit ? `<span>${esc(it.unit)}</span>` : ""}<button type="button" class="btn small primary" data-go>확인</button></div>`;
            }
            host.innerHTML = `<div class="quiz">`
                + `<div class="qz-top"><div class="qz-dots">${dots()}</div>${ty !== "mc" ? `<span class="chip c">${Q_LABEL[ty]}</span>` : ""}<span class="chip">${i + 1} / ${items.length}</span></div>`
                + (it.src ? `<div class="qz-src">${esc(it.src)}</div>` : "")
                + `<p class="qz-q">${fmt(it.q)}</p>`
                + (it.code ? codeBox(it.code) : "")
                + body
                + `<div class="qz-fb"></div></div>`;
            if (ty === "mc") { $$(".qz-opts button", host).forEach((b) => { b.onclick = () => answer(+b.dataset.k); }); return; }
            if (ty === "order") {
                drawOrder(false);
                $(".qz-order", host).onclick = (e) => {
                    const b = e.target.closest("[data-mv]");
                    if (!b || b.disabled) return;
                    const k = +b.closest("li").dataset.k;
                    const j = k + +b.dataset.mv;
                    [cur[k], cur[j]] = [cur[j], cur[k]];
                    drawOrder(false);
                    const again = $(`.qz-order li[data-k="${j}"] [data-mv="${b.dataset.mv}"]`, host);
                    (again && !again.disabled ? again : $(`.qz-order li[data-k="${j}"] button:not([disabled])`, host))?.focus();
                };
                $("[data-go]", host).onclick = () => answer(cur.slice());
                return;
            }
            const inp = $(".qz-in input", host);
            const go = () => { if (!inp.value.trim()) { inp.focus(); return; } answer(inp.value); };
            $("[data-go]", host).onclick = go;
            inp.onkeydown = (e) => { if (e.key === "Enter") go(); };
            if (shown > 1) inp.focus({ preventScroll: true }); // not on page load
        }
        function answer(r) {
            const it = items[i];
            const ty = qType(it);
            const ok = grade(it, r);
            res[i] = ok;
            if (ok) score++;
            let reveal = "";
            if (ty === "mc") {
                $$(".qz-opts button", host).forEach((b) => {
                    b.disabled = true;
                    const kk = +b.dataset.k;
                    if (kk === it.a) b.classList.add("r");
                    else if (kk === r) b.classList.add("w");
                });
            } else if (ty === "order") {
                drawOrder(true);
                $$(".qz-order li", host).forEach((li, k) => li.classList.add(cur[k] === it.items[k] ? "r" : "w"));
                $("[data-go]", host).remove();
                if (!ok) reveal = `올바른 순서: ${it.items.map((x, k) => `${k + 1}) ${x}`).join("  ")}`;
            } else {
                const inp = $(".qz-in input", host);
                inp.disabled = true;
                inp.classList.add(ok ? "r" : "w");
                $("[data-go]", host).remove();
                const val = ty === "num" ? `${it.answer}${it.unit ? ` ${it.unit}` : ""}` : `\`${[].concat(it.answer)[0]}\``;
                reveal = !ok ? `답 ${val}${it.tol ? ` (±${it.tol} 허용)` : ""}` : ty === "num" && it.tol ? `정확한 값 ${val}` : "";
            }
            $(".qz-dots", host).innerHTML = dots();
            $(".qz-fb", host).innerHTML = `<div class="qz-why ${ok ? "r" : "w"}"><b>${ok ? "정답" : "오답"}</b>${reveal ? ` · ${fmt(reveal)}` : ""} · ${fmt(it.why || "")}</div>`
                + `<div class="qz-next"><button type="button" class="btn small primary">${i + 1 < items.length ? "다음 →" : "결과 보기"}</button></div>`;
            const next = $(".qz-next button", host);
            next.onclick = () => { i++; render(); };
            next.focus({ preventScroll: true });
            if (opts.onAnswer) opts.onAnswer(it, ok);
        }
        function end() {
            const p = pct(score, items.length);
            host.innerHTML = `<div class="quiz qz-end">${ring(p, 110)}<h3>${score} / ${items.length}</h3>`
                + `<p class="muted">${p === 100 ? "완벽합니다" : p >= 70 ? "좋아요. 틀린 문제만 한 번 더." : "핵심을 다시 보고 재도전."}</p>`
                + `<div class="btns"><button type="button" class="btn small" data-a="again">다시 풀기</button>`
                + (res.includes(false) ? `<button type="button" class="btn small primary" data-a="wrong">틀린 것만</button>` : "")
                + (opts.endBtn ? `<button type="button" class="btn small" data-a="extra">${esc(opts.endBtn[0])}</button>` : "")
                + `</div></div>`;
            observe(host);
            if (p === 100) confetti();
            if (opts.onDone) opts.onDone(score, items.length, !!opts.retry);
            $("[data-a=again]", host).onclick = () => quiz(host, items, opts);
            const w = $("[data-a=wrong]", host);
            if (w) w.onclick = () => quiz(host, items.filter((_, k) => res[k] === false), { ...opts, retry: true });
            const x = $("[data-a=extra]", host);
            if (x) x.onclick = opts.endBtn[1];
        }
        if (!items.length) { host.innerHTML = `<div class="empty">문제가 없습니다</div>`; return; }
        render();
    }
    LAB.quiz = quiz;

    // keep each lesson's wrong-answer list and the review schedule in sync with answers from any quiz
    // (no best/last here: only a full lesson quiz records a score)
    // ponytail: items are keyed by quiz index, so reordering a lesson's quiz shifts wrong/srs entries; stable item ids if that bites
    function trackAnswer(it, ok) {
        if (!it.key) return;
        const cur = S.quiz[it.key] || { wrong: [] };
        const wrong = new Set(cur.wrong || []);
        if (ok) wrong.delete(it.idx); else wrong.add(it.idx);
        LAB.srsPut(`${it.key}#${it.idx}`, ok);
        LAB.put("quiz", it.key, { ...cur, wrong: [...wrong].sort((a, b) => a - b) });
    }
    const itemsOf = (t, l) => (l.quiz || []).map((q, idx) => ({ ...q, key: keyOf(t.id, l.id), idx, src: `${t.icon} ${t.name} › ${l.title}` }));
    // quiz items due for review today, most overdue first (keys that no longer resolve are skipped)
    const dueItems = () => Object.keys(S.srs).filter((k) => !k.startsWith("g:") && isDue(k))
        .sort((a, b) => S.srs[a].due.localeCompare(S.srs[b].due) || S.srs[a].box - S.srs[b].box)
        .map((k) => {
            const [tl, idx] = k.split("#");
            const f = findLesson(tl);
            const q = f && (f.l.quiz || [])[+idx];
            return q ? { ...q, key: tl, idx: +idx, src: `${f.t.icon} ${f.t.name} › ${f.l.title}` } : null;
        }).filter(Boolean);

    /* ---------- chrome: header, palette, footer ---------- */
    function navLinks(page) {
        const on = (p) => (p === page ? " class=\"on\"" : "");
        return `<a href="index.html"${on("home")}>홈</a>`
            + `<a href="index.html#tracks"${on("track") || on("lesson") || on("deep")}>트랙</a>`
            + `<a href="labs.html"${on("labs")}>실험실</a>`
            + `<a href="glossary.html"${on("glossary")}>용어집</a>`
            + `<a href="refs.html"${on("refs")}>참고문헌</a>`
            + `<a href="me.html"${on("me")}>내 학습</a>`;
    }
    function chrome(page) {
        document.body.insertAdjacentHTML("afterbegin", `
<header class="top">
  <div class="wrap">
    <a class="brand" href="index.html"><span class="logo"><i></i><i></i><b></b></span>Study Lab</a>
    <nav class="nav">${navLinks(page)}</nav>
    <div class="tools">
      <button type="button" class="icon-btn" id="searchBtn" title="검색 (Ctrl+K)">⌕ <span class="lbl">검색</span> <kbd class="lbl">Ctrl K</kbd></button>
      <button type="button" class="icon-btn save-badge" id="saveBadge"><span class="dot"></span><span class="lbl"></span></button>
      <button type="button" class="icon-btn" id="themeBtn" title="테마 전환">◐</button>
    </div>
  </div>
  <div class="mob-nav"><div class="wrap">${navLinks(page)}</div></div>
</header>
<div class="cursor-glow" aria-hidden="true"></div>`);
        document.body.insertAdjacentHTML("beforeend", `
<footer class="foot"><div class="wrap"><span>Study Lab · shkwak-co/study</span><span>기록: lab/my/progress.js</span></div></footer>
<div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="검색"><div class="box">
  <input id="palIn" placeholder="강의, 용어, 개념, 상세 설명 검색…" autocomplete="off" aria-label="검색어">
  <ul id="palList"></ul>
  <div class="hint"><span><kbd>↑</kbd><kbd>↓</kbd> 이동</span><span><kbd>Enter</kbd> 열기</span><span><kbd>Esc</kbd> 닫기</span></div>
</div></div>`);
        $("#saveBadge").onclick = () => Sync.save();
        $("#themeBtn").onclick = () => {
            const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
            document.documentElement.dataset.theme = next;
            try { localStorage.setItem("lab.theme", next); } catch (e) { /* ignore */ }
            window.dispatchEvent(new Event("lab:theme"));
        };
        $("#searchBtn").onclick = openPalette;
        renderBadge();
    }

    let palItems = [];
    let palSel = 0;
    function searchIndex() {
        const out = [];
        for (const t of LAB.list()) {
            out.push({ ico: t.icon, title: t.name, sub: t.tagline, href: trackHref(t.id), w: 3 });
            t.lessons.forEach((l) => {
                out.push({ ico: t.icon, title: l.title, sub: `${t.name} · ${(l.key || []).map(plain).join(" · ")}`, href: lessonHref(t.id, l.id), w: 2 });
                (l.glossary || []).forEach((g) => out.push({
                    ico: "§", title: g.term + (g.en ? ` · ${g.en}` : ""), sub: `${l.title} · ${plain(g.def)}`, href: `${lessonHref(t.id, l.id)}#s-terms`, w: 1
                }));
                (l.concepts || []).forEach((c) => out.push({
                    ico: "◇", title: plain(c.term) + (c.en ? ` · ${c.en}` : ""), sub: `${l.title} · 핵심 · ${plain(c.def)}`, href: `${lessonHref(t.id, l.id)}#s-key`, w: 1
                }));
                const a = articleOf(t, l);
                if (a) a.sections.forEach((s, i) => out.push({
                    ico: "≡", title: plain(s.h), sub: `${l.title} · 상세 설명 ${i + 1}절`, href: `${deepHref(t.id, l.id)}#d${i + 1}`, w: 1
                }));
            });
        }
        allLabs().forEach(({ t, l, info }) => out.push({ ico: "⚗", title: `${info[0]} 실험`, sub: `실험실 · ${info[1]} · ${l.title}`, href: labHref(t.id, l.id), w: 2 }));
        out.forEach((o) => { o.hay = `${o.title} ${o.sub}`.toLowerCase(); o.tl = o.title.toLowerCase(); });
        return out;
    }
    let INDEX = null;
    let palBack = null;
    function openPalette() {
        INDEX = INDEX || searchIndex();
        if (!$("#palette").classList.contains("on")) palBack = document.activeElement;
        $("#palette").classList.add("on");
        const inp = $("#palIn");
        inp.value = "";
        inp.focus();
        runSearch("");
        // article headings: deep files load only on track pages, so pull the rest in on first search
        if (!INDEX.full) {
            INDEX.full = true;
            Promise.all(TRACK_IDS.map((id) => load(`content/deep/${id}.js`))).then(() => {
                INDEX = Object.assign(searchIndex(), { full: true });
                if ($("#palette").classList.contains("on")) runSearch(inp.value);
            });
        }
    }
    function closePalette() {
        $("#palette").classList.remove("on");
        if (palBack && palBack.focus) palBack.focus();
        palBack = null;
    }
    function runSearch(q) {
        q = q.trim().toLowerCase();
        palItems = (q ? INDEX.filter((o) => o.hay.includes(q)) : INDEX.filter((o) => o.w >= 2))
            .map((o) => ({ ...o, sc: (o.tl.startsWith(q) ? 30 : o.tl.includes(q) ? 20 : 0) + o.w }))
            .sort((a, b) => b.sc - a.sc)
            .slice(0, 40);
        palSel = 0;
        drawPalette();
    }
    function drawPalette() {
        $("#palList").innerHTML = palItems.length
            ? palItems.map((o, i) => `<li><a href="${o.href}" class="${i === palSel ? "sel" : ""}"><span>${esc(o.ico)}</span><span class="t">${esc(o.title)}<small>${esc(o.sub)}</small></span></a></li>`).join("")
            : `<li class="empty">결과 없음</li>`;
        const sel = $("#palList .sel");
        if (sel) sel.scrollIntoView({ block: "nearest" });
    }

    function globalKeys() {
        document.addEventListener("click", (e) => {
            const b = e.target.closest("[data-copy]");
            if (!b) return;
            const text = $$(".ln", b.closest(".code")).map((l) => l.textContent).join("\n");
            const ok = () => { b.textContent = "복사됨"; setTimeout(() => { b.textContent = "복사"; }, 1400); };
            if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok, () => toast("복사 실패"));
        });
        document.addEventListener("keydown", (e) => {
            const pal = $("#palette");
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); return; }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); Sync.save(); return; }
            if (!pal.classList.contains("on")) return;
            if (e.key === "Escape") closePalette();
            else if (e.key === "ArrowDown") { e.preventDefault(); palSel = Math.min(palItems.length - 1, palSel + 1); drawPalette(); }
            else if (e.key === "ArrowUp") { e.preventDefault(); palSel = Math.max(0, palSel - 1); drawPalette(); }
            else if (e.key === "Enter" && palItems[palSel]) location.href = palItems[palSel].href;
        });
        $("#palIn").addEventListener("input", (e) => runSearch(e.target.value));
        $("#palette").addEventListener("click", (e) => { if (e.target.id === "palette") closePalette(); });
        document.addEventListener("visibilitychange", () => { if (document.hidden && Sync.timer) Sync.flush(); });
    }

    // cursor glow + card spotlight + tilt
    function pointerFx() {
        if (rm()) return;
        const glow = $(".cursor-glow");
        let raf = 0;
        let ev = null;
        document.addEventListener("pointermove", (e) => {
            ev = e;
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                glow.style.transform = `translate(${ev.clientX}px, ${ev.clientY}px)`;
                const c = ev.target.closest && ev.target.closest(".card");
                if (!c) return;
                const r = c.getBoundingClientRect();
                const x = ev.clientX - r.left;
                const y = ev.clientY - r.top;
                c.style.setProperty("--gx", `${x}px`);
                c.style.setProperty("--gy", `${y}px`);
                if (c.classList.contains("tilt")) {
                    c.style.setProperty("--rx", `${((y / r.height) - 0.5) * -3}deg`);
                    c.style.setProperty("--ry", `${((x / r.width) - 0.5) * 3}deg`);
                }
            });
        }, { passive: true });
        document.addEventListener("pointerout", (e) => {
            const c = e.target.closest && e.target.closest(".tilt");
            if (c && !c.contains(e.relatedTarget)) { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); }
        });
    }

    /* ---------- shared fragments ---------- */
    function heatmap(weeks = 18) {
        const end = new Date();
        const start = new Date(end);
        start.setDate(end.getDate() - (weeks - 1) * 7 - end.getDay());
        const cells = [];
        for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const k = dayOf(d);
            const n = S.days[k] || 0;
            const l = n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : n <= 10 ? 3 : 4;
            cells.push(`<i data-l="${l}" title="${k} · ${n}"></i>`);
        }
        return `<div class="heat">${cells.join("")}</div>`;
    }
    function streak() {
        let n = 0;
        const d = new Date();
        if (!S.days[dayOf(d)]) d.setDate(d.getDate() - 1);
        while (S.days[dayOf(d)]) { n++; d.setDate(d.getDate() - 1); }
        return n;
    }
    const findLesson = (id) => {
        const [t, l] = String(id || "").split("/");
        const tr = LAB.tracks[t];
        const ls = tr && tr.lessons.find((x) => x.id === l);
        return ls ? { t: tr, l: ls } : null;
    };
    function nextUp() {
        const last = S.last && findLesson(S.last.id);
        if (last && !isDone(last.t.id, last.l.id)) return last;
        const order = last ? [last.t, ...LAB.list().filter((t) => t !== last.t)] : LAB.list();
        for (const t of order) {
            const l = t.lessons.find((x) => !isDone(t.id, x.id));
            if (l) return { t, l };
        }
        const t = LAB.list()[0];
        return t && t.lessons[0] ? { t, l: t.lessons[0] } : null;
    }
    const allTerms = () => {
        const seen = new Set();
        const out = [];
        LAB.list().forEach((t) => t.lessons.forEach((l) => (l.glossary || []).forEach((g) => {
            const k = g.term.toLowerCase();
            if (seen.has(k)) return;
            seen.add(k);
            out.push({ ...g, t, l });
        })));
        return out;
    };
    const termCard = (g, i, showTrack) => `<div class="card term reveal" style="--i:${i % 12};--c:${g.t.color}">`
        + `<b>${esc(g.term)}</b>${g.en ? `<span class="en">${esc(g.en)}</span>` : ""}<p>${fmt(g.def)}</p>`
        + (showTrack ? `<a class="chip c" href="${lessonHref(g.t.id, g.l.id)}">${g.t.icon} ${esc(g.l.title)}</a>` : "")
        + `</div>`;
    // every lesson whose demo is an interactive sim, ordered by lab tag
    const allLabs = () => {
        const tags = LAB.SIM_TAGS || [];
        return LAB.list().flatMap((t) => t.lessons.filter((l) => l.demo && l.demo.type === "sim")
            .map((l) => ({ t, l, info: (LAB.SIM_INFO || {})[l.demo.name] || [l.demo.name, "", "기타"] })))
            .sort((a, b) => tags.indexOf(a.info[2]) - tags.indexOf(b.info[2]));
    };
    const labCard = ({ t, l, info }, i, on) => `<a class="card tilt lab-card reveal${on ? " on" : ""}" style="--c:${t.color};--i:${i % 12}" href="${labHref(t.id, l.id)}">
      <span class="chip c">⚗ ${esc(info[2])}</span><h3>${esc(info[0])}</h3><p>${esc(info[1])}</p>
      <div class="foot"><span>${t.icon}</span><span>${esc(l.title)}</span></div></a>`;
    const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
    const refItem = (r, extra = "") => `<div class="card ref"><span class="chip">${LAB.REF_KINDS[r.kind] || esc(r.kind)}</span>`
        + `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)} ↗</a>`
        + `<small>${[r.by, r.year, host(r.url)].filter(Boolean).map(esc).join(" · ")}</small>${extra}</div>`;
    // every lesson/trend ref once per url, with where it is cited
    const allRefs = () => {
        const by = new Map();
        const add = (r, t, from) => {
            const x = by.get(r.url) || { ...r, from: [], tracks: new Set() };
            x.from.push(from);
            x.tracks.add(t.id);
            by.set(r.url, x);
        };
        LAB.list().forEach((t) => {
            (t.trends || []).forEach((x) => (x.refs || []).forEach((r) => add(r, t, { label: `${t.icon} 동향 · ${x.title}`, href: trackHref(t.id), c: t.color })));
            t.lessons.forEach((l) => (l.refs || []).forEach((r) => add(r, t, { label: `${t.icon} ${l.title}`, href: `${lessonHref(t.id, l.id)}#s-refs`, c: t.color })));
        });
        return [...by.values()];
    };

    /* ---------- pages ---------- */
    const PAGES = {};

    PAGES.home = () => {
        const tracks = LAB.list();
        const lessons = tracks.reduce((n, t) => n + t.lessons.length, 0);
        const quizN = tracks.reduce((n, t) => n + t.lessons.reduce((m, l) => m + (l.quiz || []).length, 0), 0);
        const done = tracks.reduce((n, t) => n + trackDone(t), 0);
        const terms = allTerms();
        const up = nextUp();
        const labs = allLabs();
        const due = dueItems().length;
        const dueCards = Object.keys(S.srs).filter((k) => k.startsWith("g:") && isDue(k)).length;
        const app = $("#app");
        app.innerHTML = `
<section class="hero"><canvas id="heroCv"></canvas><div class="wrap">
  <p class="eyebrow">Personal Study Lab</p>
  <h1><span class="grad">Study Lab</span></h1>
  <div class="type-line" id="typeLine"></div>
  <p class="lead">임베디드에서 AI까지. 보고, 돌려보고, 풀면서 익히는 실험실.</p>
  <div class="cta">${up ? `<a class="btn primary" href="${lessonHref(up.t.id, up.l.id)}">이어서 학습 →</a>` : ""}${due ? `<a class="btn" href="me.html#review">오늘 복습 ${due}문제</a>` : ""}<a class="btn" href="#tracks">트랙 둘러보기</a></div>
  <div class="stats">
    <div><b data-count="${lessons}">0</b><span>강의</span></div>
    <div><b data-count="${terms.length}">0</b><span>용어</span></div>
    <div><b data-count="${quizN}">0</b><span>퀴즈</span></div>
    <div><b data-count="${pct(done, lessons)}" data-suffix="%">0</b><span>완료</span></div>
  </div>
</div></section>
<section class="sec wrap" id="tracks">
  <div class="sec-head"><div><p class="eyebrow">Tracks</p><h2>무엇을 실험할까</h2></div><span class="muted">${tracks.length + EXTRA.length}개 분야 · ${lessons}강</span></div>
  ${CATEGORIES.map((c) => `<div class="cat"><h3 class="cat-h">${esc(c.name)}</h3><div class="tracks">${c.tracks.map((id, i) => {
            const t = LAB.tracks[id];
            const x = EXTRA.find((e) => e.id === id);
            if (x) return `<a class="card tilt track-card reveal" style="--c:${x.color};--i:${i}" href="${x.href}">
      <div class="ico">${x.icon}</div><h3>${esc(x.name)}</h3><p>${esc(x.tagline)}</p>
      <div class="foot"><span class="chip">기존 페이지</span><span class="arrow">↗</span></div></a>`;
            if (!t) return "";
            const d = trackDone(t);
            return `<a class="card tilt track-card reveal" style="--c:${t.color};--i:${i}" href="${trackHref(t.id)}">
      <div class="ico">${t.icon}</div><h3>${esc(t.name)}</h3><p>${esc(t.tagline)}</p>
      <div class="foot"><span class="chip">${t.lessons.length}강 · ${d} 완료</span>${ring(pct(d, t.lessons.length), 46)}<span class="arrow">→</span></div></a>`;
        }).join("")}</div></div>`).join("")}
</section>
${LAB.paths.length ? `<section class="sec wrap">
  <div class="sec-head"><div><p class="eyebrow">Paths</p><h2>학습 경로</h2></div><span class="muted">트랙을 가로질러 순서대로</span></div>
  <div class="paths">${LAB.paths.map((p, i) => {
            const steps = p.lessons.map(findLesson).filter(Boolean);
            const n = steps.filter((s) => isDone(s.t.id, s.l.id)).length;
            const nx = steps.find((s) => !isDone(s.t.id, s.l.id)) || steps[0];
            return `<div class="card path-card reveal" style="--i:${i}"><p class="eyebrow">${n} / ${steps.length} 완료</p><h3>${esc(p.name)}</h3><p class="muted">${esc(p.desc || "")}</p>
      <div class="bar"><i data-w="${pct(n, steps.length)}%"></i></div>
      <ol class="path-steps">${steps.map((s) => `<li class="${isDone(s.t.id, s.l.id) ? "done" : ""}${s === nx ? " next" : ""}" style="--c:${s.t.color}"><a href="${lessonHref(s.t.id, s.l.id)}">${s.t.icon} ${esc(s.l.title)}</a></li>`).join("")}</ol>
      ${nx ? `<a class="btn small primary" href="${lessonHref(nx.t.id, nx.l.id)}">${n ? "이어서" : "시작"}: ${esc(nx.l.title)} →</a>` : ""}</div>`;
        }).join("")}</div>
</section>` : ""}
<section class="sec wrap">
  <div class="sec-head"><div><p class="eyebrow">Labs</p><h2>실험실</h2></div><a class="btn small" href="labs.html">전체 ${labs.length}개 실험 →</a></div>
  <div class="labs">${labs.slice(0, 8).map((x, i) => labCard(x, i)).join("")}</div>
</section>
<section class="sec wrap">
  <div class="split">
    ${up ? `<a class="card tilt continue-card reveal" style="--c:${up.t.color}" href="${lessonHref(up.t.id, up.l.id)}">
      <div class="big-ico">${up.t.icon}</div>
      <div><p class="eyebrow">${S.last ? "이어서" : "시작"}</p><h3>${esc(up.l.title)}</h3><span class="muted">${esc(up.t.name)} · ${up.l.mins || 10}분</span></div>
      <span class="arrow" style="margin-left:auto;color:var(--c)">→</span></a>` : "<div></div>"}
    <div class="card reveal" style="--i:1"><p class="eyebrow">Activity</p><h3 style="margin:4px 0 12px">연속 ${streak()}일</h3>${heatmap()}
      ${due || dueCards ? `<div class="btns" style="margin-top:12px">${due ? `<a class="btn small primary" href="me.html#review">복습 ${due}문제 →</a>` : ""}${dueCards ? `<a class="btn small" href="glossary.html?review=1">카드 복습 ${dueCards}장 →</a>` : ""}</div>` : ""}</div>
  </div>
</section>
${terms.length ? (() => {
                const g = terms[[...dayOf(Date.now())].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % terms.length];
                return `<section class="sec wrap"><div class="sec-head"><div><p class="eyebrow">Term of the day</p><h2>오늘의 용어</h2></div><a class="btn small" href="glossary.html">용어집 →</a></div>
  <div class="flip reveal" id="todayTerm" style="--c:${g.t.color};max-width:620px"><div class="flip-in">
    <div class="flip-face"><span class="chip c">${g.t.icon} ${esc(g.t.name)}</span><h3>${esc(g.term)}</h3><span class="muted">${esc(g.en || "")} · 클릭해서 뒤집기</span></div>
    <div class="flip-face back"><p style="margin:0;font-size:17px">${fmt(g.def)}</p><a class="chip c" href="${lessonHref(g.t.id, g.l.id)}">강의 보기 → ${esc(g.l.title)}</a></div>
  </div></div></section>`;
            })() : ""}`;
        const tt = $("#todayTerm");
        if (tt) tt.onclick = (e) => { if (!e.target.closest("a")) tt.classList.toggle("on"); };
        typeLine([
            "GPIO 레지스터 비트를 직접 켜보기",
            "0.1 이 float 에서 어떻게 저장되는지 보기",
            "CRC 나눗셈을 한 단계씩 따라가기",
            "어셈블리를 한 줄씩 돌리며 스택 보기",
            "캐시 히트와 미스를 직접 세어 보기",
            "해시 충돌이 어디로 밀려나는지 보기",
            "PID 게인을 돌려 오버슈트 잡기",
            "I2C 파형을 한 비트씩 따라가기",
            "어텐션 가중치를 눈으로 보기",
            "A* 가 길을 찾는 순서 보기",
            "온도 하나로 LLM 출력 바꾸기"
        ]);
        heroCanvas($("#heroCv"));
    };

    function typeLine(lines) {
        const el = $("#typeLine");
        if (!el) return;
        if (rm()) { el.textContent = lines[0]; return; }
        let li = 0;
        let ci = 0;
        let del = false;
        const tick = () => {
            const s = lines[li];
            el.textContent = s.slice(0, ci);
            if (!del && ci < s.length) ci++;
            else if (!del) { del = true; return setTimeout(tick, 1500); }
            else if (ci > 0) ci--;
            else { del = false; li = (li + 1) % lines.length; }
            setTimeout(tick, del ? 28 : 65);
        };
        tick();
    }

    // drifting node network, links between near nodes, pulled toward the cursor
    function heroCanvas(cv) {
        if (!cv) return;
        const ctx = cv.getContext("2d");
        const cols = LAB.list().map((t) => t.color);
        if (!cols.length) cols.push("#22d3ee");
        let w = 0;
        let h = 0;
        let ps = [];
        const mouse = { x: -1e4, y: -1e4 };
        const fit = () => {
            const d = devicePixelRatio || 1;
            w = cv.clientWidth;
            h = cv.clientHeight;
            cv.width = w * d;
            cv.height = h * d;
            ctx.setTransform(d, 0, 0, d, 0, 0);
            const n = Math.min(80, Math.round((w * h) / 14000));
            ps = Array.from({ length: n }, (_, i) => ({
                x: Math.random() * w, y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 1.8 + 1, c: cols[i % cols.length]
            }));
        };
        fit();
        new ResizeObserver(fit).observe(cv);
        cv.parentElement.addEventListener("pointermove", (e) => {
            const r = cv.getBoundingClientRect();
            mouse.x = e.clientX - r.left;
            mouse.y = e.clientY - r.top;
        });
        cv.parentElement.addEventListener("pointerleave", () => { mouse.x = mouse.y = -1e4; });
        let visible = true;
        new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(cv);
        const light = () => document.documentElement.dataset.theme === "light";
        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            const L = 130;
            for (let i = 0; i < ps.length; i++) {
                const p = ps[i];
                for (let j = i + 1; j < ps.length; j++) {
                    const q = ps[j];
                    const d = Math.hypot(p.x - q.x, p.y - q.y);
                    if (d < L) {
                        ctx.strokeStyle = p.c;
                        ctx.globalAlpha = (1 - d / L) * (light() ? 0.25 : 0.2);
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }
                const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                if (dm < 180) {
                    ctx.strokeStyle = p.c;
                    ctx.globalAlpha = (1 - dm / 180) * 0.35;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
                ctx.globalAlpha = 0.9;
                ctx.fillStyle = p.c;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        };
        const step = () => {
            if (visible && !document.hidden) {
                ps.forEach((p) => {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const d = Math.hypot(dx, dy);
                    if (d < 180 && d > 1) { p.vx += (dx / d) * 0.006; p.vy += (dy / d) * 0.006; }
                    p.vx *= 0.995;
                    p.vy *= 0.995;
                    const sp = Math.hypot(p.vx, p.vy);
                    if (sp < 0.12) { p.vx += (Math.random() - 0.5) * 0.05; p.vy += (Math.random() - 0.5) * 0.05; }
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > w) p.vx *= -1;
                    if (p.y < 0 || p.y > h) p.vy *= -1;
                });
                draw();
            }
            requestAnimationFrame(step);
        };
        if (rm()) draw(); else requestAnimationFrame(step);
    }

    PAGES.track = (q) => {
        const t = LAB.tracks[q.get("t")];
        const app = $("#app");
        if (!t) { app.innerHTML = `<section class="sec wrap"><div class="empty">트랙을 찾을 수 없습니다 · <a href="index.html">홈으로</a></div></section>`; return; }
        document.title = `${t.name} · Study Lab`;
        const d = trackDone(t);
        const terms = [];
        t.lessons.forEach((l) => (l.glossary || []).forEach((g) => terms.push({ ...g, t, l })));
        const mins = t.lessons.reduce((n, l) => n + (l.mins || 10), 0);
        app.innerHTML = `
<section class="band"><div class="wrap">
  <div class="crumb"><a href="index.html">홈</a><span>›</span>${categoryOf(t.id) ? `<a href="index.html#tracks">${esc(categoryOf(t.id).name)}</a><span>›</span>` : ""}<span>${esc(t.name)}</span></div>
  <div class="row">
    <div class="big-ico">${t.icon}</div>
    <div><p class="eyebrow">Track</p><h1>${esc(t.name)}</h1><p>${esc(t.tagline)}</p></div>
    ${ring(pct(d, t.lessons.length), 96)}
  </div>
  <div class="filters">${LAB.list().map((x) => `<a class="chip ${x === t ? "c" : ""}" style="--c:${x.color}" href="${trackHref(x.id)}">${x.icon} ${esc(x.name)}</a>`).join("")}</div>
</div></section>
<section class="sec wrap">
  <div class="sec-head"><div><p class="eyebrow">Lessons</p><h2>강의</h2></div><span class="muted">${t.lessons.length}강 · 약 ${mins}분 · ${d} 완료</span></div>
  <div class="path">${t.lessons.map((l, i) => {
            const k = keyOf(t.id, l.id);
            const ok = isDone(t.id, l.id);
            const qz = S.quiz[k];
            const mark = S.marks[k] && S.marks[k].on;
            return `<a class="card lesson-row reveal ${ok ? "done" : ""}" style="--i:${i}" href="${lessonHref(t.id, l.id)}">
      <span class="num">${ok ? "✓" : i + 1}</span>
      <div><h3>${esc(l.title)}${mark ? " <span style=\"color:var(--warn)\">★</span>" : ""}</h3>
      <div class="meta">${lvl(l.level || 1)}<span class="chip">${l.mins || 10}분</span>${articleOf(t, l) ? `<span class="chip">≡ 상세</span>` : ""}${l.checked ? `<span class="chip ok">✓ 검증</span>` : ""}${l.demo && l.demo.type === "sim" ? `<span class="chip">⚗ 실험</span>` : ""}${qz && qz.best != null ? `<span class="chip c">퀴즈 최고 ${qz.best}%</span>` : ""}${qz && qz.wrong && qz.wrong.length ? `<span class="chip" style="color:var(--bad)">오답 ${qz.wrong.length}</span>` : ""}</div></div>
      <span class="arrow" style="color:var(--c)">→</span></a>`;
        }).join("")}</div>
</section>
${(t.trends || []).length ? `<section class="sec wrap">
  <div class="sec-head"><div><p class="eyebrow">Trends</p><h2>최신 동향</h2></div></div>
  <div class="trends">${t.trends.map((x, i) => `<div class="card trend reveal" style="--i:${i}"><span class="chip c">${esc(x.when || "")}</span><h3>${esc(x.title)}</h3><ul class="ticks">${(x.points || []).map((p) => `<li>${fmt(p)}</li>`).join("")}</ul>${(x.refs || []).length ? `<div class="trend-refs">${x.refs.map((r) => `<a href="${esc(r.url)}" target="_blank" rel="noopener" title="${esc(r.title)}">↗ ${esc(r.by || host(r.url))}${r.year ? ` ${r.year}` : ""}</a>`).join("")}</div>` : ""}</div>`).join("")}</div>
</section>` : ""}
<section class="sec wrap">
  <div class="sec-head"><div><p class="eyebrow">Glossary</p><h2>용어</h2></div><a class="btn small" href="glossary.html?t=${t.id}">전체 용어 · 플래시카드 →</a></div>
  <div class="terms">${terms.slice(0, 12).map((g, i) => termCard(g, i, true)).join("")}</div>
</section>
<section class="sec wrap">
  <div class="sec-head"><div><p class="eyebrow">Mixed quiz</p><h2>트랙 랜덤 퀴즈</h2></div><button type="button" class="btn small" id="reroll">새 문제 ↻</button></div>
  <div class="card" id="mixQuiz"></div>
</section>`;
        const roll = () => {
            const pool = t.lessons.flatMap((l) => itemsOf(t, l));
            quiz($("#mixQuiz"), shuffle(pool).slice(0, 6), { onAnswer: trackAnswer });
        };
        $("#reroll").onclick = roll;
        roll();
    };

    PAGES.lesson = (q) => {
        const t = LAB.tracks[q.get("t")];
        const l = t && t.lessons.find((x) => x.id === q.get("l"));
        const app = $("#app");
        if (!l) { app.innerHTML = `<section class="sec wrap"><div class="empty">강의를 찾을 수 없습니다 · <a href="index.html">홈으로</a></div></section>`; return; }
        document.title = `${l.title} · ${t.name} · Study Lab`;
        const k = keyOf(t.id, l.id);
        const idx = t.lessons.indexOf(l);
        const prev = t.lessons[idx - 1];
        const next = t.lessons[idx + 1];
        const art = articleOf(t, l);
        const links = {
            pre: (l.pre || []).map(findLesson).filter(Boolean),
            next: LAB.list().flatMap((x) => x.lessons.filter((y) => (y.pre || []).includes(k)).map((y) => ({ t: x, l: y })))
        };
        const linkChip = (s) => `<a class="chip c${isDone(s.t.id, s.l.id) ? " done" : ""}" style="--c:${s.t.color}" href="${lessonHref(s.t.id, s.l.id)}">${isDone(s.t.id, s.l.id) ? "✓ " : ""}${s.t.icon} ${esc(s.l.title)}</a>`;
        const secs = [
            ["s-key", "핵심", (l.key || []).length || (l.concepts || []).length],
            ["s-demo", "동작 방식", l.demo],
            ["s-code", "코드", (l.code || []).length],
            ["s-opt", "최적화", (l.optimize || []).length],
            ["s-terms", "용어", (l.glossary || []).length],
            ["s-quiz", "퀴즈", (l.quiz || []).length],
            ["s-refs", "출처", (l.refs || []).length],
            ["s-memo", "메모", true]
        ].filter((s) => s[2]);
        const num = (id) => String(secs.findIndex((s) => s[0] === id) + 1).padStart(2, "0");
        const head = (id) => `<h2><span class="n">${num(id)}</span>${secs.find((s) => s[0] === id)[1]}</h2>`;
        const has = (id) => secs.some((s) => s[0] === id);
        app.innerHTML = `
<div class="stepbar"><div class="wrap">${secs.map((s) => `<a href="#${s[0]}">${s[1]}</a>`).join("")}</div><i class="fill"></i></div>
<div class="wrap narrow">
  <header class="l-head">
    <div class="crumb"><a href="index.html">홈</a><span>›</span><a href="${trackHref(t.id)}">${t.icon} ${esc(t.name)}</a><span>›</span><span>${idx + 1} / ${t.lessons.length}</span></div>
    <h1>${esc(l.title)}</h1>
    <div class="meta">${lvl(l.level || 1)}<span class="chip">${l.mins || 10}분</span>${l.checked ? `<span class="chip ok" title="공식 문서와 대조해 사실 확인한 날짜">✓ 검증 ${esc(l.checked.slice(0, 7))}</span>` : ""}
      <button type="button" class="star" id="star" title="북마크">★</button>
      <button type="button" class="btn small done-btn" id="doneBtn">학습 완료 표시</button>
      ${art ? `<a class="btn small" href="${deepHref(t.id, l.id)}">≡ 상세 설명</a>` : ""}
      ${l.demo && l.demo.type === "sim" ? `<a class="btn small ghost" href="${labHref(t.id, l.id)}">⚗ 실험실에서 열기</a>` : ""}</div>
    ${links.pre.length || links.next.length ? `<div class="l-links">${links.pre.length ? `<div><span>먼저 보면 좋은 강의</span>${links.pre.map(linkChip).join("")}</div>` : ""}${links.next.length ? `<div><span>이어서 볼 강의</span>${links.next.map(linkChip).join("")}</div>` : ""}</div>` : ""}
  </header>
  ${has("s-key") ? `<section class="l-sec" id="s-key">${head("s-key")}
    <ul class="keys">${(l.key || []).map((x, i) => `<li class="reveal" style="--i:${i}" data-n="${String(i + 1).padStart(2, "0")}"><span>${fmt(x)}</span></li>`).join("")}</ul>
    <div class="concepts">${(l.concepts || []).map((c, i) => `<div class="card concept reveal" style="--i:${i}"><b>${fmt(c.term)}${c.en ? `<small class="en">${esc(c.en)}</small>` : ""}</b><span>${fmt(c.def)}</span></div>`).join("")}</div>
    ${art ? `<a class="card deep-cta reveal" href="${deepHref(t.id, l.id)}"><div><b>≡ 상세 설명 읽기</b><span>${art.sections.length}개 절 · 약 ${readMins(art)}분 · 원리부터 실무 함정까지 풀어서</span></div><span class="arrow">→</span></a>` : ""}
  </section>` : ""}
  ${has("s-demo") ? `<section class="l-sec" id="s-demo">${head("s-demo")}<div id="demo"></div></section>` : ""}
  ${has("s-code") ? `<section class="l-sec" id="s-code">${head("s-code")}
    ${l.code.length > 1 ? `<div class="tabs">${l.code.map((c, i) => `<button type="button" data-tab="${i}" class="${i ? "" : "on"}">${esc(c.title || c.lang)}</button>`).join("")}</div>` : ""}
    ${l.code.map((c, i) => `<div data-panel="${i}" ${i ? "hidden" : ""}>${codeBox(c)}</div>`).join("")}
  </section>` : ""}
  ${has("s-opt") ? `<section class="l-sec" id="s-opt">${head("s-opt")}
    ${l.optimize.map((o) => `<div class="opt reveal"><div class="opt-h"><h3>${fmt(o.title)}</h3>${o.gain ? `<span class="gain">▲ ${esc(o.gain)}</span>` : ""}</div>
      <div class="vs">${codeBox({ title: "Before", ...o.before }, "before", "BEFORE")}${codeBox({ title: "After", ...o.after }, "after", "AFTER")}</div>
      ${o.note ? `<p class="muted" style="margin:0">${fmt(o.note)}</p>` : ""}</div>`).join("")}
  </section>` : ""}
  ${has("s-terms") ? `<section class="l-sec" id="s-terms">${head("s-terms")}
    <div class="terms">${l.glossary.map((g, i) => termCard({ ...g, t, l }, i, false)).join("")}</div>
  </section>` : ""}
  ${has("s-quiz") ? `<section class="l-sec" id="s-quiz">${head("s-quiz")}<div class="card" id="quiz"></div></section>` : ""}
  ${has("s-refs") ? `<section class="l-sec" id="s-refs">${head("s-refs")}<div class="refs">${l.refs.map((r) => refItem(r)).join("")}</div></section>` : ""}
  <section class="l-sec memo" id="s-memo">${head("s-memo")}
    <textarea id="memo" placeholder="이 강의에서 기억할 것, 헷갈린 것, 실험 결과… (자동 저장)"></textarea><div class="st" id="memoSt"></div>
  </section>
  <nav class="pager">
    ${prev ? `<a class="card" href="${lessonHref(t.id, prev.id)}"><small>← 이전</small><b>${esc(prev.title)}</b></a>` : `<a class="card" href="${trackHref(t.id)}"><small>← 트랙</small><b>${esc(t.name)}</b></a>`}
    ${next ? `<a class="card" href="${lessonHref(t.id, next.id)}"><small>다음 →</small><b>${esc(next.title)}</b></a>` : `<a class="card" href="${trackHref(t.id)}"><small>트랙 완주 →</small><b>${esc(t.name)}</b></a>`}
  </nav>
</div>`;

        if (l.demo && LAB.demo) LAB.demo($("#demo"), l.demo);
        $$("[data-tab]").forEach((b) => {
            b.onclick = () => {
                $$("[data-tab]").forEach((x) => x.classList.toggle("on", x === b));
                $$("[data-panel]").forEach((p) => {
                    p.hidden = p.dataset.panel !== b.dataset.tab;
                    const code = $(".code", p);
                    if (!p.hidden) { code.classList.remove("in"); void code.offsetWidth; code.classList.add("in"); }
                });
            };
        });

        const star = $("#star");
        const doneBtn = $("#doneBtn");
        const paint = () => {
            const on = !!(S.marks[k] && S.marks[k].on);
            star.classList.toggle("on", on);
            const ok = isDone(t.id, l.id);
            doneBtn.classList.toggle("on", ok);
            doneBtn.textContent = ok ? "✓ 학습 완료" : "학습 완료 표시";
        };
        star.onclick = () => { LAB.put("marks", k, { on: !(S.marks[k] && S.marks[k].on) }); paint(); };
        doneBtn.onclick = () => {
            const ok = !isDone(t.id, l.id);
            LAB.put("lessons", k, { done: ok });
            paint();
            if (ok) { toast("완료 표시했습니다"); confetti(); }
        };
        paint();

        if (has("s-quiz")) {
            quiz($("#quiz"), itemsOf(t, l), {
                onAnswer: trackAnswer,
                onDone: (score, total, retry) => {
                    if (retry) return; // wrong-only retry: no score record
                    const p = pct(score, total);
                    const cur = S.quiz[k] || { wrong: [] };
                    LAB.put("quiz", k, { ...cur, last: p, best: Math.max(cur.best || 0, p) });
                    if (p >= 60 && !isDone(t.id, l.id)) { LAB.put("lessons", k, { done: true }); paint(); toast("퀴즈 통과 · 완료 처리"); }
                }
            });
        }

        const memo = $("#memo");
        const memoSt = $("#memoSt");
        const note = S.notes[k];
        memo.value = (note && note.text) || "";
        if (note && note.t) memoSt.textContent = `저장됨 ${new Date(note.t).toLocaleString("ko-KR")}`;
        let mt = 0;
        memo.addEventListener("input", () => {
            memoSt.textContent = "입력 중…";
            clearTimeout(mt);
            mt = setTimeout(() => {
                LAB.put("notes", k, { text: memo.value });
                memoSt.textContent = `저장됨 ${hhmm(Date.now())}`;
            }, 600);
        });

        scrollSpy();
        LAB.visit(k);
    };

    // stepbar: highlight the link of the section on screen + reading progress
    function scrollSpy() {
        const links = $$(".stepbar a[href^='#']");
        const fill = $(".stepbar .fill");
        const spy = () => {
            let cur = 0;
            links.forEach((a, i) => { const el = document.getElementById(a.hash.slice(1)); if (el && el.getBoundingClientRect().top < 170) cur = i; });
            links.forEach((a, i) => a.classList.toggle("on", i === cur));
            const max = document.documentElement.scrollHeight - innerHeight;
            fill.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
        };
        addEventListener("scroll", spy, { passive: true });
        spy();
    }

    PAGES.deep = (q) => {
        const t = LAB.tracks[q.get("t")];
        const l = t && t.lessons.find((x) => x.id === q.get("l"));
        const app = $("#app");
        if (!l) { app.innerHTML = `<section class="sec wrap"><div class="empty">강의를 찾을 수 없습니다 · <a href="index.html">홈으로</a></div></section>`; return; }
        const a = articleOf(t, l);
        const crumb = `<div class="crumb"><a href="index.html">홈</a><span>›</span><a href="${trackHref(t.id)}">${t.icon} ${esc(t.name)}</a><span>›</span><a href="${lessonHref(t.id, l.id)}">${esc(l.title)}</a><span>›</span><span>상세 설명</span></div>`;
        if (!a) { app.innerHTML = `<div class="wrap narrow"><header class="l-head">${crumb}<h1>${esc(l.title)}</h1></header><div class="empty">아직 상세 설명이 없습니다 · <a href="${lessonHref(t.id, l.id)}">강의로</a></div></div>`; return; }
        document.title = `${l.title} 상세 · ${t.name} · Study Lab`;
        const idx = t.lessons.indexOf(l);
        const near = (d) => { for (let i = idx + d; i >= 0 && i < t.lessons.length; i += d) if (articleOf(t, t.lessons[i])) return t.lessons[i]; return null; };
        const prev = near(-1);
        const next = near(1);
        const pad = (n) => String(n).padStart(2, "0");
        const table = (tb) => `<div class="tbl"><table><thead><tr>${tb.head.map((h) => `<th>${fmt(h)}</th>`).join("")}</tr></thead><tbody>${tb.rows.map((r) => `<tr>${r.map((c) => `<td>${fmt(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
        const extra = [a.pitfalls && ["d-pit", "자주 하는 실수"], a.summary && ["d-sum", "정리"], (l.refs || []).length && ["d-refs", "출처"]].filter(Boolean);
        app.innerHTML = `
<div class="stepbar"><div class="wrap"><a href="${lessonHref(t.id, l.id)}">← 강의</a>${a.sections.map((s, i) => `<a href="#d${i + 1}">${pad(i + 1)} ${esc(plain(s.h))}</a>`).join("")}${extra.map(([id, h]) => `<a href="#${id}">${h}</a>`).join("")}</div><i class="fill"></i></div>
<div class="wrap narrow article">
  <header class="l-head">${crumb}
    <h1>${esc(l.title)}</h1>
    <div class="meta">${lvl(l.level || 1)}<span class="chip">읽기 약 ${readMins(a)}분</span><span class="chip">${a.sections.length}개 절</span>
      <a class="btn small" href="${lessonHref(t.id, l.id)}">핵심 카드</a>
      ${l.demo && l.demo.type === "sim" ? `<a class="btn small" href="${labHref(t.id, l.id)}">⚗ 실험</a>` : ""}
      <a class="btn small" href="${lessonHref(t.id, l.id)}#s-quiz">퀴즈 →</a></div>
  </header>
  <p class="lead">${fmt(a.intro)}</p>
  ${a.sections.map((s, i) => `<section class="d-sec" id="d${i + 1}"><h2><span class="n">${pad(i + 1)}</span>${fmt(s.h)}</h2>
    ${(s.p || []).map((p) => `<p>${fmt(p)}</p>`).join("")}
    ${s.list ? `<ul class="ticks">${s.list.map((x) => `<li>${fmt(x)}</li>`).join("")}</ul>` : ""}
    ${s.table ? table(s.table) : ""}
    ${s.code ? codeBox(s.code) : ""}
    ${s.demo ? `<div data-demo="${i}"></div>` : ""}
    ${s.tip ? `<div class="tip">${fmt(s.tip)}</div>` : ""}
  </section>`).join("")}
  ${a.pitfalls ? `<section class="d-sec" id="d-pit"><h2>자주 하는 실수</h2><ul class="ticks warn">${a.pitfalls.map((x) => `<li>${fmt(x)}</li>`).join("")}</ul></section>` : ""}
  ${a.summary ? `<section class="d-sec" id="d-sum"><div class="card sum"><p class="eyebrow">Summary</p><ul class="ticks">${a.summary.map((x) => `<li>${fmt(x)}</li>`).join("")}</ul></div></section>` : ""}
  ${(l.refs || []).length ? `<section class="d-sec" id="d-refs"><h2>출처</h2><div class="refs">${l.refs.map((r) => refItem(r)).join("")}</div></section>` : ""}
  <nav class="pager">
    ${prev ? `<a class="card" href="${deepHref(t.id, prev.id)}"><small>← 이전 상세</small><b>${esc(prev.title)}</b></a>` : `<a class="card" href="${trackHref(t.id)}"><small>← 트랙</small><b>${esc(t.name)}</b></a>`}
    ${next ? `<a class="card" href="${deepHref(t.id, next.id)}"><small>다음 상세 →</small><b>${esc(next.title)}</b></a>` : `<a class="card" href="${lessonHref(t.id, l.id)}#s-quiz"><small>퀴즈로 확인 →</small><b>${esc(l.title)}</b></a>`}
  </nav>
</div>`;
        $$("[data-demo]").forEach((el) => {
            const d = a.sections[+el.dataset.demo].demo;
            LAB.demo(el, d === "lesson" ? l.demo : d);
        });
        scrollSpy();
        LAB.visit(keyOf(t.id, l.id));
    };

    PAGES.labs = (q) => {
        const labs = allLabs();
        const sel = labs.find((x) => keyOf(x.t.id, x.l.id) === q.get("lab"));
        let tag = "";
        const tags = [...new Set(labs.map((x) => x.info[2]))];
        if (sel) document.documentElement.style.setProperty("--c", sel.t.color);
        $("#app").innerHTML = `
<section class="band"><div class="wrap">
  <div class="crumb"><a href="index.html">홈</a><span>›</span><span>실험실</span></div>
  <div class="row"><div class="big-ico">⚗</div><div><p class="eyebrow">Labs</p><h1>실험실</h1><p>${labs.length}개 실험 · 값을 바꾸고 결과를 바로 보기</p></div></div>
</div></section>
${sel ? `<section class="sec wrap" id="lab">
  <div class="lab-head"><div><p class="eyebrow">${esc(sel.info[2])} · ${sel.t.icon} ${esc(sel.t.name)}</p><h2>${esc(sel.info[0])}</h2><p class="muted">${esc(sel.info[1])}</p></div>
    <div class="btns"><a class="btn small" href="${lessonHref(sel.t.id, sel.l.id)}">강의: ${esc(sel.l.title)} →</a><a class="btn small" href="${deepHref(sel.t.id, sel.l.id)}">≡ 상세 설명</a></div></div>
  <div id="labDemo"></div>
  <div class="lab-keys"><ul class="keys">${(sel.l.key || []).map((x, i) => `<li data-n="${String(i + 1).padStart(2, "0")}"><span>${fmt(x)}</span></li>`).join("")}</ul></div>
</section>` : ""}
<section class="sec wrap">
  <div class="sec-head"><div><p class="eyebrow">All labs</p><h2>${sel ? "다른 실험" : "실험 목록"}</h2></div></div>
  <div class="filters" id="lf"></div>
  <div id="lout"></div>
</section>`;
        if (sel) LAB.demo($("#labDemo"), sel.l.demo);
        const draw = () => {
            $("#lf").innerHTML = [["", "전체"], ...tags.map((g) => [g, g])].map(([v, txt]) => `<button type="button" class="chip ${tag === v ? "on" : ""}" data-g="${esc(v)}">${esc(txt)}</button>`).join("");
            $$("[data-g]").forEach((b) => { b.onclick = () => { tag = b.dataset.g; draw(); }; });
            const items = labs.filter((x) => !tag || x.info[2] === tag);
            $("#lout").innerHTML = `<div class="labs">${items.map((x, i) => labCard(x, i, x === sel)).join("")}</div>`;
            observe($("#lout"));
        };
        draw();
    };

    PAGES.glossary = (q) => {
        const terms = allTerms().sort((a, b) => a.term.localeCompare(b.term, "ko"));
        let filter = LAB.tracks[q.get("t")] ? q.get("t") : "";
        let review = q.get("review") === "1"; // flashcards due today only
        let mode = review ? "card" : "list";
        let fcI = 0;
        let fcOrder = [];
        const gk = (g) => `g:${g.term.toLowerCase()}`;
        const dueN = () => terms.filter((g) => isDue(gk(g))).length;
        const app = $("#app");
        app.innerHTML = `
<section class="band"><div class="wrap">
  <div class="crumb"><a href="index.html">홈</a><span>›</span><span>용어집</span></div>
  <div class="row"><div class="big-ico">§</div><div><p class="eyebrow">Glossary</p><h1>용어집</h1><p>${terms.length}개 용어 · 검색하거나 카드로 외우기</p></div></div>
</div></section>
<section class="sec wrap">
  <div class="searchbar"><input id="gq" placeholder="용어, 영문, 설명 검색…" autocomplete="off"></div>
  <div class="filters" id="gf"></div>
  <div class="tabs"><button type="button" data-mode="list" class="${review ? "" : "on"}">목록</button><button type="button" data-mode="card" class="${review ? "on" : ""}">플래시카드</button><button type="button" class="chip" id="grev"></button></div>
  <div id="gout"></div>
</section>`;
        const gq = $("#gq");
        const pool = () => {
            const s = gq.value.trim().toLowerCase();
            return terms.filter((g) => (!filter || g.t.id === filter) && (!review || isDue(gk(g)))
                && (!s || `${g.term} ${g.en || ""} ${plain(g.def)}`.toLowerCase().includes(s)));
        };
        const drawRev = () => {
            const b = $("#grev");
            b.classList.toggle("on", review);
            b.textContent = `복습 대상만 · ${dueN()}장`;
        };
        $("#grev").onclick = () => { review = !review; fcOrder = []; drawRev(); draw(); };
        // 알아요 / 몰라요 → Leitner box; the next card comes up
        const rate = (ok) => {
            const items = pool();
            if (!items.length) return;
            const g = items[fcOrder[fcI % items.length]];
            LAB.put("srs", gk(g), srsNext(S.srs[gk(g)], ok, dayOf(Date.now())));
            if (!review) fcI = (fcI + 1) % items.length; // in review mode the card leaves the pool instead
            drawRev();
            draw();
        };
        const drawFilters = () => {
            $("#gf").innerHTML = `<button type="button" class="chip ${filter ? "" : "on"}" data-f="">전체</button>`
                + LAB.list().map((t) => `<button type="button" class="chip ${filter === t.id ? "on" : ""}" style="--c:${t.color}" data-f="${t.id}">${t.icon} ${esc(t.name)}</button>`).join("");
            $$("[data-f]").forEach((b) => { b.onclick = () => { filter = b.dataset.f; drawFilters(); draw(); }; });
        };
        const draw = () => {
            const items = pool();
            const out = $("#gout");
            if (mode === "list") {
                out.innerHTML = items.length ? `<div class="terms">${items.map((g, i) => termCard(g, i, true)).join("")}</div>` : `<div class="empty">결과 없음</div>`;
                observe(out);
                return;
            }
            if (!items.length) { out.innerHTML = `<div class="empty">${review ? "오늘 복습할 카드가 없습니다 · 카드에서 알아요/몰라요를 누르면 일정이 잡힙니다" : "결과 없음"}</div>`; return; }
            if (fcOrder.length !== items.length) { fcOrder = items.map((_, i) => i); fcI = 0; }
            const g = items[fcOrder[fcI % items.length]];
            const sr = S.srs[gk(g)];
            out.innerHTML = `<div class="fc"><div class="flip" id="fc" style="--c:${g.t.color}"><div class="flip-in">
              <div class="flip-face"><span class="chip c">${g.t.icon} ${esc(g.t.name)}</span><h3>${esc(g.term)}</h3><span class="muted">${esc(g.en || "")}</span>${sr ? `<small class="muted">상자 ${sr.box} · 다음 복습 ${esc(sr.due.slice(5))}</small>` : ""}</div>
              <div class="flip-face back"><p style="margin:0;font-size:18px">${fmt(g.def)}</p><a class="chip c" href="${lessonHref(g.t.id, g.l.id)}">${esc(g.l.title)} →</a></div>
            </div></div>
            <div class="fc-ctl"><button type="button" class="btn small" data-rate="0">몰라요</button><button type="button" class="btn small primary" data-rate="1">알아요</button></div>
            <div class="fc-ctl"><button type="button" class="btn small" data-fc="-1">←</button><span class="chip">${(fcI % items.length) + 1} / ${items.length}</span><button type="button" class="btn small" data-fc="1">→</button><button type="button" class="btn small" data-fc="s">섞기</button><span class="muted" style="font-size:12px">Space 뒤집기 · ←/→ 이동 · 1 몰라요 · 2 알아요</span></div></div>`;
            $("#fc").onclick = (e) => { if (!e.target.closest("a")) $("#fc").classList.toggle("on"); };
            $$("[data-rate]").forEach((b) => { b.onclick = () => rate(b.dataset.rate === "1"); });
            $$("[data-fc]").forEach((b) => {
                b.onclick = () => {
                    const v = b.dataset.fc;
                    if (v === "s") { fcOrder = shuffle(fcOrder); fcI = 0; } else fcI = (fcI + +v + items.length) % items.length;
                    draw();
                };
            });
        };
        document.addEventListener("keydown", (e) => {
            if (mode !== "card" || e.target === gq || $("#palette").classList.contains("on")) return;
            if (e.key === " ") { e.preventDefault(); const f = $("#fc"); if (f) f.classList.toggle("on"); }
            if (e.key === "ArrowRight") $("[data-fc='1']")?.click();
            if (e.key === "ArrowLeft") $("[data-fc='-1']")?.click();
            if (e.key === "1" || e.key === "2") rate(e.key === "2");
        });
        $$("[data-mode]").forEach((b) => {
            b.onclick = () => { mode = b.dataset.mode; $$("[data-mode]").forEach((x) => x.classList.toggle("on", x === b)); fcOrder = []; draw(); };
        });
        gq.addEventListener("input", () => { fcOrder = []; draw(); });
        drawFilters();
        drawRev();
        draw();
    };

    PAGES.refs = (q) => {
        const refs = allRefs().sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));
        let track = LAB.tracks[q.get("t")] ? q.get("t") : "";
        let kind = "";
        $("#app").innerHTML = `
<section class="band"><div class="wrap">
  <div class="crumb"><a href="index.html">홈</a><span>›</span><span>참고문헌</span></div>
  <div class="row"><div class="big-ico">↗</div><div><p class="eyebrow">References</p><h1>참고문헌</h1><p>${refs.length}개 출처 · 논문, 표준, 공식 문서</p></div></div>
</div></section>
<section class="sec wrap">
  <div class="searchbar"><input id="rq" placeholder="제목, 저자, 연도, 사이트 검색…" autocomplete="off"></div>
  <div class="filters" id="rf"></div>
  <div id="rout"></div>
</section>`;
        const rq = $("#rq");
        const chip = (attr, v, on, label, c) => `<button type="button" class="chip ${on ? "on" : ""}"${c ? ` style="--c:${c}"` : ""} data-${attr}="${v}">${label}</button>`;
        const draw = () => {
            $("#rf").innerHTML = chip("f", "", !track, "전체")
                + LAB.list().map((t) => chip("f", t.id, track === t.id, `${t.icon} ${esc(t.name)}`, t.color)).join("")
                + `<span class="muted">·</span>` + chip("k", "", !kind, "모든 종류")
                + Object.entries(LAB.REF_KINDS).map(([k, v]) => chip("k", k, kind === k, v)).join("");
            $$("[data-f]").forEach((b) => { b.onclick = () => { track = b.dataset.f; draw(); }; });
            $$("[data-k]").forEach((b) => { b.onclick = () => { kind = b.dataset.k; draw(); }; });
            const s = rq.value.trim().toLowerCase();
            const items = refs.filter((r) => (!track || r.tracks.has(track)) && (!kind || r.kind === kind)
                && (!s || `${r.title} ${r.by || ""} ${r.year || ""} ${r.url} ${r.from.map((f) => f.label).join(" ")}`.toLowerCase().includes(s)));
            const out = $("#rout");
            out.innerHTML = items.length ? `<div class="refs">${items.map((r) => refItem(r, `<div class="from">${r.from.map((f) => `<a class="chip c" style="--c:${f.c}" href="${f.href}">${esc(f.label)}</a>`).join("")}</div>`)).join("")}</div>` : `<div class="empty">결과 없음</div>`;
            observe(out);
        };
        rq.addEventListener("input", draw);
        draw();
    };

    PAGES.me = () => {
        const app = $("#app");
        const tracks = LAB.list();
        const lessonsN = tracks.reduce((n, t) => n + t.lessons.length, 0);
        let resetArm = false;
        const syncText = () => ({
            ok: `<b style="color:var(--ok)">● 자동 저장 중</b> · lab/my/progress.js${Sync.at ? ` · 마지막 ${hhmm(Sync.at)}` : ""}`,
            busy: "저장 중…",
            prompt: `<b style="color:var(--warn)">● 저장 허용 필요</b> · 버튼을 한 번 누르세요`,
            none: "아직 저장 폴더가 연결되지 않았습니다",
            unsupported: "이 브라우저는 폴더 저장을 지원하지 않습니다 (Chrome/Edge 권장) · 다운로드 후 lab/my 에 덮어쓰기"
        }[Sync.s]);
        const saveLabel = () => Sync.api ? (Sync.dir ? "지금 저장" : "저장 폴더 연결") : "progress.js 다운로드";
        const exam = { tracks: new Set(tracks.map((t) => t.id)), n: 20 };
        const mmss = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
        // cross-track exam: items spread evenly over the chosen tracks, then a per-track score
        const startExam = () => {
            const pools = tracks.filter((t) => exam.tracks.has(t.id)).map((t) => shuffle(t.lessons.flatMap((l) => itemsOf(t, l))));
            const items = [];
            for (let k = 0; items.length < exam.n && pools.some((p) => p.length); k = (k + 1) % pools.length) if (pools[k].length) items.push(pools[k].pop());
            if (!items.length) return toast("트랙을 하나 이상 고르세요");
            const box = $("#examBox");
            box.innerHTML = `<div id="exQ"></div><div id="exRes"></div>`;
            let t0 = Date.now();
            const log = [];
            quiz($("#exQ"), shuffle(items), {
                onAnswer: (it, ok) => {
                    if (!log.length) $("#exRes").innerHTML = "";
                    trackAnswer(it, ok);
                    log.push({ key: it.key, ok });
                },
                onDone: () => {
                    const by = {};
                    const miss = {};
                    log.forEach(({ key, ok }) => {
                        const tid = key.split("/")[0];
                        by[tid] = by[tid] || [0, 0];
                        by[tid][1]++;
                        if (ok) by[tid][0]++; else miss[key] = (miss[key] || 0) + 1;
                    });
                    const weak = Object.entries(miss).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => findLesson(k)).filter(Boolean);
                    $("#exRes").innerHTML = `<div class="exam-res"><p class="eyebrow">소요 ${mmss(Date.now() - t0)}</p>
                      <div class="track-bars">${tracks.filter((t) => by[t.id]).map((t) => { const [r, n] = by[t.id]; return `<a href="${trackHref(t.id)}" style="--c:${t.color}"><span>${t.icon}</span><div class="bar"><i data-w="${pct(r, n)}%"></i></div><span>${r}/${n}</span></a>`; }).join("")}</div>
                      ${weak.length ? `<p class="muted" style="margin:14px 0 8px">다시 볼 강의</p><div class="filters">${weak.map((s) => `<a class="chip c" style="--c:${s.t.color}" href="${lessonHref(s.t.id, s.l.id)}">${s.t.icon} ${esc(s.l.title)}</a>`).join("")}</div>` : ""}</div>`;
                    observe($("#exRes"));
                    log.length = 0;
                    t0 = Date.now(); // "다시 풀기" times from here
                },
                endBtn: ["새 모의고사", () => { draw(); $("#exam").scrollIntoView(); }]
            });
        };
        const draw = () => {
            const done = tracks.reduce((n, t) => n + trackDone(t), 0);
            const due = dueItems();
            const dueCards = Object.keys(S.srs).filter((k) => k.startsWith("g:") && isDue(k)).length;
            const boxes = [1, 2, 3, 4, 5].map((b) => Object.entries(S.srs).filter(([k, v]) => !k.startsWith("g:") && v.box === b).length);
            const qs = Object.values(S.quiz).filter((x) => x.t && x.best != null && x.last != null);
            const avg = qs.length ? Math.round(qs.reduce((n, x) => n + x.best, 0) / qs.length) : 0;
            const wrongs = [];
            tracks.forEach((t) => t.lessons.forEach((l) => {
                const w = (S.quiz[keyOf(t.id, l.id)] || {}).wrong || [];
                w.forEach((idx) => l.quiz && l.quiz[idx] && wrongs.push({ ...l.quiz[idx], key: keyOf(t.id, l.id), idx, src: `${t.icon} ${t.name} › ${l.title}`, t, l }));
            }));
            const notes = Object.entries(S.notes).filter(([, v]) => v.text && v.text.trim()).map(([id, v]) => ({ ...findLesson(id), v })).filter((x) => x.l);
            const marks = Object.entries(S.marks).filter(([, v]) => v.on).map(([id]) => findLesson(id)).filter(Boolean);
            app.innerHTML = `
<section class="band"><div class="wrap">
  <div class="crumb"><a href="index.html">홈</a><span>›</span><span>내 학습</span></div>
  <div class="row"><div class="big-ico">◎</div><div><p class="eyebrow">My Lab</p><h1>내 학습</h1><p>완료 ${done}/${lessonsN} · 평균 퀴즈 ${avg}% · 연속 ${streak()}일 · 오답 ${wrongs.length} · 복습 ${due.length}</p></div>${ring(pct(done, lessonsN), 96)}</div>
</div></section>
<section class="sec wrap" id="review">
  <div class="sec-head"><div><p class="eyebrow">Review</p><h2>오늘 복습</h2></div>${due.length ? `<button type="button" class="btn small primary" id="revGo">${Math.min(20, due.length)}문제 복습 시작</button>` : ""}</div>
  <div id="revBox"><div class="card reveal">
    <p style="margin:0 0 10px">${due.length ? `복습 날짜가 된 문제 <b>${due.length}</b>개${due.length > 20 ? " · 한 번에 20개씩" : ""}` : "오늘 복습할 문제가 없습니다"}${dueCards ? ` · <a href="glossary.html?review=1">용어 카드 ${dueCards}장 →</a>` : ""}</p>
    <p class="muted" style="margin:0;font-size:13px">퀴즈를 풀면 맞힌 문제는 1·2·4·8·16일 뒤, 틀린 문제는 다음 날 다시 나옵니다 (라이트너 상자, Leitner system) · 상자별 ${boxes.map((n, i) => `${i + 1}: ${n}`).join(" · ")}</p>
  </div></div>
</section>
<section class="sec wrap" id="exam">
  <div class="sec-head"><div><p class="eyebrow">Exam</p><h2>모의고사</h2></div><span class="muted">여러 트랙에서 고르게 섞어 출제</span></div>
  <div class="card reveal" id="examBox">
    <div class="filters">${tracks.map((t) => `<button type="button" class="chip ${exam.tracks.has(t.id) ? "on" : ""}" style="--c:${t.color}" data-ex="${t.id}">${t.icon} ${esc(t.name)}</button>`).join("")}</div>
    <div class="btns" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${[10, 20, 30].map((n) => `<button type="button" class="chip ${exam.n === n ? "on" : ""}" data-exn="${n}">${n}문제</button>`).join("")}
      <button type="button" class="btn small primary" id="exGo">시작 →</button></div>
  </div>
</section>
<section class="sec wrap"><div class="me-grid">
  <div class="card reveal">
    <p class="eyebrow">Save & Sync</p><h3 style="margin:4px 0 8px">저장 · 동기화</h3>
    <p style="margin:0 0 14px;font-size:14px" id="mSyncText">${syncText()}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button type="button" class="btn small primary" id="mSave">${saveLabel()}</button>
      <button type="button" class="btn small" id="mExport">JSON 백업</button>
      <label class="btn small" style="cursor:pointer">JSON 복원<input type="file" id="mImport" accept=".json,.js" hidden></label>
      ${Sync.dir ? `<button type="button" class="btn small ghost" id="mUnlink">연결 해제</button>` : ""}
      <button type="button" class="btn small ghost" id="mReset" style="color:var(--bad)">${resetArm ? "한 번 더 누르면 초기화" : "기록 초기화"}</button>
    </div>
    <ol class="sync-steps">
      <li><b>저장 폴더 연결</b> → <code>study/lab/my</code> 선택 (한 번)</li>
      <li>공부하면 <code>progress.js</code> 에 자동 저장</li>
      <li><code>git commit</code> · <code>git push</code></li>
      <li>다른 PC: <code>git pull</code> 후 열면 기록 그대로</li>
    </ol>
  </div>
  <div class="card reveal" style="--i:1"><p class="eyebrow">Tracks</p><h3 style="margin:4px 0 14px">트랙별 진도</h3>
    <div class="track-bars">${tracks.map((t) => { const p = pct(trackDone(t), t.lessons.length); return `<a href="${trackHref(t.id)}" style="--c:${t.color}"><span>${t.icon}</span><div class="bar"><i data-w="${p}%"></i></div><span>${p}%</span></a>`; }).join("")}</div>
  </div>
  <div class="card reveal" style="--i:2"><p class="eyebrow">Activity</p><h3 style="margin:4px 0 14px">학습 기록</h3>${heatmap(22)}</div>
</div></section>
<section class="sec wrap">
  <div class="sec-head"><div><p class="eyebrow">Wrong answers</p><h2>오답노트</h2></div>${wrongs.length ? `<button type="button" class="btn small primary" id="retry">오답 ${wrongs.length}개 다시 풀기</button>` : ""}</div>
  <div id="wrongBox">${wrongs.length ? `<div class="list">${wrongs.map((w, i) => `<a class="card wrong-q reveal" style="--i:${i % 10};--c:${w.t.color}" href="${lessonHref(w.t.id, w.l.id)}#s-quiz"><small>${esc(w.src)}</small><div>${fmt(w.q)}</div></a>`).join("")}</div>` : `<div class="empty">오답이 없습니다</div>`}</div>
</section>
<section class="sec wrap">
  <div class="sec-head"><div><p class="eyebrow">Notes</p><h2>메모</h2></div></div>
  ${notes.length ? `<div class="me-grid">${notes.map((n, i) => `<a class="card note-card reveal" style="--i:${i % 10};--c:${n.t.color}" href="${lessonHref(n.t.id, n.l.id)}#s-memo"><b>${n.t.icon} ${esc(n.l.title)}</b><pre>${esc(n.v.text)}</pre></a>`).join("")}</div>` : `<div class="empty">메모가 없습니다 · 강의 하단에서 작성</div>`}
</section>
<section class="sec wrap">
  <div class="sec-head"><div><p class="eyebrow">Bookmarks</p><h2>북마크</h2></div></div>
  ${marks.length ? `<div class="list">${marks.map((m, i) => `<a class="card reveal" style="--i:${i};--c:${m.t.color}" href="${lessonHref(m.t.id, m.l.id)}">★ ${m.t.icon} ${esc(m.l.title)}</a>`).join("")}</div>` : `<div class="empty">북마크가 없습니다 · 강의 제목 옆 ★</div>`}
</section>`;
            observe(app);
            $("#mSave").onclick = () => Sync.save();
            $("#mExport").onclick = () => download(`study-lab-${dayOf(Date.now())}.json`, stable(S), "application/json");
            $("#mImport").onchange = async (e) => {
                const f = e.target.files[0];
                if (!f) return;
                try {
                    const text = await f.text();
                    LAB.importState(JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)));
                    toast("복원(병합) 완료");
                    draw();
                } catch (err) { toast("파일을 읽을 수 없습니다"); }
            };
            const un = $("#mUnlink");
            if (un) un.onclick = async () => { await Sync.unlink(); draw(); };
            $("#mReset").onclick = () => {
                if (!resetArm) { resetArm = true; draw(); setTimeout(() => { if (resetArm) { resetArm = false; draw(); } }, 4000); return; }
                resetArm = false;
                LAB.resetAll();
                toast("기록을 초기화했습니다");
                draw();
            };
            const retry = $("#retry");
            if (retry) retry.onclick = () => { $("#wrongBox").innerHTML = `<div class="card" id="wq"></div>`; quiz($("#wq"), shuffle(wrongs), { onAnswer: trackAnswer, endBtn: ["오답노트 새로고침", draw] }); };
            const rev = $("#revGo");
            if (rev) rev.onclick = () => { $("#revBox").innerHTML = `<div class="card" id="rq"></div>`; quiz($("#rq"), due.slice(0, 20), { onAnswer: trackAnswer, endBtn: ["복습 목록 새로고침", () => { draw(); $("#review").scrollIntoView(); }] }); };
            $$("[data-ex]").forEach((b) => {
                b.onclick = () => { const id = b.dataset.ex; if (exam.tracks.has(id)) exam.tracks.delete(id); else exam.tracks.add(id); b.classList.toggle("on", exam.tracks.has(id)); };
            });
            $$("[data-exn]").forEach((b) => { b.onclick = () => { exam.n = +b.dataset.exn; $$("[data-exn]").forEach((x) => x.classList.toggle("on", x === b)); }; });
            $("#exGo").onclick = startExam;
        };
        draw();
        LAB.onChange((_, why) => {
            if (why !== "sync" || !$("#mSyncText")) return;
            $("#mSyncText").innerHTML = syncText();
            $("#mSave").textContent = saveLabel();
        });
    };

    /* ---------- boot ---------- */
    const loaded = new Set();
    const load = (src) => new Promise((res) => {
        if (loaded.has(src)) return res();
        loaded.add(src);
        const s = document.createElement("script");
        s.src = src;
        s.onload = s.onerror = res;
        document.head.append(s);
    });

    async function boot() {
        const page = document.body.dataset.page;
        const q = new URLSearchParams(location.search);
        const tid = q.get("t");
        const deep = TRACK_IDS.includes(tid) && ["track", "lesson", "deep"].includes(page) ? [`content/deep/${tid}.js`] : [];
        await Promise.all([...TRACK_IDS.map((id) => `content/${id}.js`), ...deep, "content/paths.js", "my/progress.js"].map(load));
        loadState();
        const t = LAB.tracks[q.get("t")];
        if (t && page !== "glossary") document.documentElement.style.setProperty("--c", t.color);
        chrome(page);
        (PAGES[page] || PAGES.home)(q);
        observe();
        globalKeys();
        pointerFx();
        await Sync.init();
        if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
    }

    if (window.document && document.addEventListener) document.addEventListener("DOMContentLoaded", boot);
})();
