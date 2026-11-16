// Validates lab content and the progress merge logic. Run: node lab/check.mjs
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
const run = (f) => vm.runInContext(fs.readFileSync(path.join(dir, f), "utf8"), ctx, { filename: f });
run("assets/lab.js");
run("assets/anim.js");
const LAB = ctx.LAB;

const ids = JSON.parse(`[${fs.readFileSync(path.join(dir, "assets/lab.js"), "utf8").match(/TRACK_IDS = \[([^\]]*)\]/)[1]}]`);
const errors = [];
const warns = [];
const args = process.argv.slice(2);
const links = args.includes("--links"); // also fetch every ref url
const only = args.find((a) => !a.startsWith("--")); // optional: check a single track id
for (const id of ids) {
    if (only && id !== only) continue;
    const f = `content/${id}.js`;
    if (!fs.existsSync(path.join(dir, f))) { errors.push(`${f}: missing`); continue; }
    try { run(f); } catch (e) { errors.push(`${f}: ${e.message}`); }
    const d = `content/deep/${id}.js`; // optional long-form articles
    if (fs.existsSync(path.join(dir, d))) { try { run(d); } catch (e) { errors.push(`${d}: ${e.message}`); } }
}

const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warns.push(`${where}: ${msg}`);
const str = (v) => typeof v === "string" && v.trim().length > 0;

function checkDemo(where, d) {
    if (!LAB.DEMO_TYPES.includes(d.type)) return err(where, `demo.type "${d.type}" unknown`);
    if (d.type === "steps") {
        const nodes = new Set();
        (d.nodes || []).forEach((n) => { if (!str(n.id) || !str(n.label)) err(where, "steps node needs id+label"); if (nodes.has(n.id)) err(where, `dup node ${n.id}`); nodes.add(n.id); });
        const edges = new Set();
        (d.edges || []).forEach((e) => { if (!nodes.has(e.from) || !nodes.has(e.to)) err(where, `edge ${e.from}>${e.to} has unknown node`); edges.add(`${e.from}>${e.to}`); });
        if (!(d.steps || []).length) err(where, "steps.steps empty");
        (d.steps || []).forEach((s, i) => {
            if (!str(s.text)) err(where, `step ${i} text missing`);
            (s.on || []).forEach((k) => { if (!nodes.has(k) && !edges.has(k)) err(where, `step ${i} refers to unknown "${k}"`); });
        });
    } else if (d.type === "wave") {
        const N = Math.max(...(d.signals || []).map((s) => s.wave.length));
        (d.signals || []).forEach((s) => {
            if (!str(s.name)) err(where, "wave signal name missing");
            if (!/^[01hlpzx=.]+$/.test(s.wave)) err(where, `wave "${s.wave}" has invalid chars`);
            const boxes = (s.wave.match(/=/g) || []).length;
            if (boxes && (s.data || []).length < boxes) warn(where, `wave ${s.name}: ${boxes} '=' but ${(s.data || []).length} data labels`);
        });
        (d.steps || []).forEach((s, i) => { if (!(s.from >= 0 && s.to > s.from && s.to <= N)) err(where, `wave step ${i} range ${s.from}..${s.to} outside 0..${N}`); if (!str(s.text)) err(where, `wave step ${i} text`); });
    } else if (d.type === "seq") {
        const n = (d.actors || []).length;
        if (n < 2) err(where, "seq needs ≥2 actors");
        (d.msgs || []).forEach((m, i) => { if (!(m.from >= 0 && m.from < n && m.to >= 0 && m.to < n)) err(where, `seq msg ${i} actor index`); if (!str(m.label)) err(where, `seq msg ${i} label`); });
        if (!(d.msgs || []).length) err(where, "seq msgs empty");
    } else if (d.type === "sim") {
        if (!LAB.SIM_NAMES.includes(d.name)) err(where, `sim "${d.name}" unknown (have: ${LAB.SIM_NAMES.join(", ")})`);
        if (d.name === "memory") {
            const lines = String(d.code || "").split("\n").length;
            (d.steps || []).forEach((s, i) => { if (!(s.line >= 1 && s.line <= lines)) err(where, `memory step ${i} line ${s.line} > ${lines}`); (s.stack || []).forEach((f) => { if (!str(f.fn) || !Array.isArray(f.vars)) err(where, `memory step ${i} frame shape`); }); });
            if (!(d.steps || []).length) err(where, "memory steps empty");
        }
        if (d.name === "attention" && d.tokens && d.weights && d.weights.length !== d.tokens.length) err(where, "attention weights size");
        if (d.name === "sampling" && d.tokens && (d.logits || []).length !== d.tokens.length) err(where, "sampling logits size");
    }
}

const hangul = (s) => /[가-힣]/.test(s);
// Korean term → needs `en`; `en` should be the English name, not only an acronym
function checkEn(where, x, required) {
    if (!hangul(x.term)) return;
    if (!str(x.en)) (required ? err : warn)(where, `"${x.term}" needs en (English original)`);
    else if (/^[A-Z0-9-]+$/.test(x.en)) warn(where, `"${x.term}" en "${x.en}" is only an acronym — spell it out`);
}

const urls = new Map(); // url → first place cited
function checkRefs(where, refs) {
    const seen = new Set();
    (refs || []).forEach((r, i) => {
        if (!str(r.title)) err(where, `ref ${i} title`);
        if (!/^https:\/\/\S+$/.test(r.url || "")) err(where, `ref ${i} url must be https://`);
        if (!(r.kind in LAB.REF_KINDS)) err(where, `ref ${i} kind "${r.kind}" (have: ${Object.keys(LAB.REF_KINDS).join(", ")})`);
        if (r.year != null && !Number.isInteger(r.year)) err(where, `ref ${i} year must be an integer`);
        if (seen.has(r.url)) err(where, `ref ${i} duplicate url`);
        seen.add(r.url);
        if (!urls.has(r.url)) urls.set(r.url, where);
    });
}

// first mention of a Korean card term in the lesson body (or an article) should read "용어(English)"
function checkFirstMention(w, l, text) {
    const d = l.demo || {};
    const body = text ?? [...(l.key || []), ...(d.steps || []).map((s) => s.text), ...(d.msgs || []).map((m) => m.text),
        ...(l.code || []).map((c) => c.note), ...(l.optimize || []).flatMap((o) => [o.title, o.note])].filter(str).join("\n");
    [...(l.concepts || []), ...(l.glossary || [])].forEach((x) => {
        if (!hangul(x.term) || !str(x.en)) return;
        const i = body.indexOf(x.term);
        if (i >= 0 && !/^(\*\*)?\(/.test(body.slice(i + x.term.length))) warn(w, `first mention of "${x.term}" without (English)`); // "용어(…)" or "**용어**(…)"
    });
}

const terms = new Map();
let nLessons = 0;
let nQuiz = 0;
for (const t of LAB.list()) {
    const tw = `track ${t.id}`;
    ["id", "name", "icon", "tagline"].forEach((k) => { if (!str(t[k])) err(tw, `${k} missing`); });
    if (!/^#[0-9a-f]{6}$/i.test(t.color || "")) err(tw, "color must be #rrggbb");
    if (!(t.trends || []).length) warn(tw, "no trends");
    (t.trends || []).forEach((x, i) => { if (!str(x.title) || !(x.points || []).length) err(tw, `trend ${i} needs title+points`); checkRefs(`${tw} trend ${i}`, x.refs); });
    const seen = new Set();
    if (!(t.lessons || []).length) err(tw, "no lessons");
    for (const l of t.lessons || []) {
        nLessons++;
        const w = `${t.id}/${l.id}`;
        if (!/^[a-z0-9-]+$/.test(l.id || "")) err(w, "id must be [a-z0-9-]");
        if (seen.has(l.id)) err(w, "duplicate lesson id");
        seen.add(l.id);
        if (!str(l.title)) err(w, "title");
        if (![1, 2, 3].includes(l.level)) err(w, "level 1..3");
        if (!(l.mins > 0)) err(w, "mins");
        if (!(l.key || []).length) err(w, "key empty");
        if ((l.key || []).length > 5) warn(w, "key > 5 lines");
        (l.key || []).forEach((k) => {
            const n = k.replace(/\([A-Za-z][^)]*\)/g, "").length; // "(English)" annotations don't count
            if (n > 70) warn(w, `key line long (${n}): ${k.slice(0, 30)}…`);
        });
        (l.concepts || []).forEach((c) => { if (!str(c.term) || !str(c.def)) err(w, "concept term/def"); else checkEn(w, c, true); });
        checkFirstMention(w, l);
        checkRefs(w, l.refs);
        if (!l.demo) err(w, "demo missing"); else checkDemo(w, l.demo);
        if (!(l.code || []).length) err(w, "code empty");
        (l.code || []).forEach((c, i) => { if (!str(c.lang) || !str(c.src)) err(w, `code ${i} lang/src`); });
        if (!(l.optimize || []).length) err(w, "optimize empty");
        (l.optimize || []).forEach((o, i) => { if (!str(o.title) || !o.before || !str(o.before.src) || !o.after || !str(o.after.src)) err(w, `optimize ${i} shape`); });
        if (!(l.glossary || []).length) err(w, "glossary empty");
        (l.glossary || []).forEach((g) => {
            if (!str(g.term) || !str(g.def)) err(w, "glossary term/def");
            checkEn(w, g, true);
            const k = String(g.term).toLowerCase();
            if (terms.has(k)) warn(w, `glossary "${g.term}" also in ${terms.get(k)}`); else terms.set(k, w);
        });
        if ((l.quiz || []).length < 3) err(w, "quiz < 3");
        (l.quiz || []).forEach((q, i) => {
            nQuiz++;
            if (!str(q.q) || !str(q.why)) err(w, `quiz ${i} q/why`);
            if (!Array.isArray(q.options) || q.options.length < 2) err(w, `quiz ${i} options`);
            else {
                if (!(Number.isInteger(q.a) && q.a >= 0 && q.a < q.options.length)) err(w, `quiz ${i} answer index ${q.a} out of range`);
                if (new Set(q.options).size !== q.options.length) err(w, `quiz ${i} duplicate options`);
            }
        });
    }
}

// articles (content/deep/<track>.js): known lesson, intro, non-empty sections, valid tables/code/demos
let nArticles = 0;
for (const [tid, map] of Object.entries(LAB.articles || {})) {
    const t = LAB.tracks[tid];
    if (!t) { err(`deep ${tid}`, "unknown track"); continue; }
    for (const [lid, a] of Object.entries(map)) {
        const w = `deep ${tid}/${lid}`;
        const l = t.lessons.find((x) => x.id === lid);
        if (!l) { err(w, "unknown lesson id"); continue; }
        nArticles++;
        if (!str(a.intro)) err(w, "intro missing");
        if (!(a.sections || []).length) err(w, "sections empty");
        (a.sections || []).forEach((s, i) => {
            const sw = `${w} §${i + 1}`;
            if (!str(s.h)) err(sw, "h missing");
            if (!(s.p || []).length && !(s.list || []).length && !s.code && !s.table && !s.demo) err(sw, "empty section");
            [...(s.p || []), ...(s.list || [])].forEach((x) => { if (!str(x)) err(sw, "p/list item must be a non-empty string"); });
            if (s.table && !(Array.isArray(s.table.head) && Array.isArray(s.table.rows) && s.table.rows.every((r) => Array.isArray(r) && r.length === s.table.head.length))) err(sw, "table: head[] + rows[][] of equal length");
            if (s.code && (!str(s.code.lang) || !str(s.code.src))) err(sw, "code lang/src");
            if (s.demo && s.demo !== "lesson") checkDemo(sw, s.demo);
            if (s.demo === "lesson" && !l.demo) err(sw, "demo \"lesson\" but lesson has no demo");
        });
        ["pitfalls", "summary"].forEach((k) => { if (a[k] != null && !(Array.isArray(a[k]) && a[k].every(str))) err(w, `${k} must be string[]`); });
        checkFirstMention(w, l, [a.intro, ...(a.sections || []).flatMap((s) => [s.h, ...(s.p || []), ...(s.list || []), s.tip])].filter(str).join("\n"));
    }
}

// every sim is listed on the labs page
LAB.SIM_NAMES.forEach((n) => { if (!(LAB.SIM_INFO || {})[n]) err("anim.js", `SIM_INFO missing "${n}"`); });

// bit labs math: ALU flags, float encode vs the platform, CRC check values
{
    const N = LAB.num;
    const a = (op, x, y, w, n) => { const r = N.alu(op, x, y, w, n); return [r.r, r.c, r.v]; };
    assert.deepEqual(a("add", 200, 100, 8), [44, 1, 0], "add carry");
    assert.deepEqual(a("add", 100, 100, 8), [200, 0, 1], "add signed overflow");
    assert.deepEqual(a("sub", 5, 10, 8), [251, 1, 0], "sub borrow");
    assert.deepEqual(a("sar", 0xf0, 0, 8, 2), [0xfc, 0, null], "sar keeps sign");
    assert.deepEqual(a("shr", 0xf0, 0, 8, 2), [0x3c, 0, null], "shr fills 0");
    assert.deepEqual(a("rol", 0x81, 0, 8, 1), [0x03, null, null], "rol");
    assert.deepEqual(a("neg", 0x80, 0, 8), [0x80, null, 1], "neg min overflows");
    assert.deepEqual(a("shl", 0x80000001, 0, 32, 1), [2, 1, null], "shl 32-bit carry");
    assert.deepEqual(a("sar", 0x80000000, 0, 32, 31), [0xffffffff, 0, null], "sar 32-bit");
    assert.equal(N.alu("not", 5, 0, 32).r, 0xfffffffa, "not 32-bit");
    assert.equal(N.alu("iso", 12, 0, 8).r, 4, "lowest set bit");
    const f32 = (x) => new Uint32Array(new Float32Array([x]).buffer)[0];
    let seed = 7;
    const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    const xs = [0, -0, 1, -2.5, 0.1, 1 / 3, Math.PI, 65504, 65520, 1e-8, 2 ** -24, 2 ** -25, 3 * 2 ** -26, 1e-45, 3.4028235e38, 3.5e38, Infinity, -Infinity];
    for (let i = 0; i < 20000; i++) xs.push((rnd() - 0.5) * 10 ** (rnd() * 90 - 45));
    for (const x of xs) {
        assert.equal(N.fenc(x, 8, 23), f32(x), `fp32 encode ${x}`);
        if (Math.f16round) assert.ok(Object.is(N.fdec(N.fenc(x, 5, 10), 5, 10).v, Math.f16round(x)), `fp16 round trip ${x}`);
    }
    assert.ok(Number.isNaN(N.fdec(N.fenc(NaN, 8, 7), 8, 7).v), "NaN survives");
    assert.equal(N.fenc(1 / 3, 8, 7), 0x3eab, "bf16 1/3");
    const bits = (s) => [...s].flatMap((ch) => [...ch.charCodeAt(0).toString(2).padStart(8, "0")].map(Number));
    const crc = (s, poly) => parseInt(N.crcDiv(bits(s), [...poly].map(Number)).rem.join(""), 2);
    assert.equal(crc("123456789", "100000111"), 0xf4, "CRC-8/SMBUS check value");
    assert.equal(crc("123456789", "10001000000100001"), 0x31c3, "CRC-16/XMODEM check value");
    assert.equal(N.crcDiv([..."11010011101100"].map(Number), [1, 0, 1, 1]).rem.join(""), "100", "CRC-3 textbook example");
}

// merge: newest entry wins, quiz best keeps max, reset drops older entries
const m = LAB.merge(
    { lessons: { "a/x": { done: true, t: 10 } }, quiz: { "a/x": { best: 90, last: 50, t: 20 } }, days: { "2026-01-01": 3 } },
    { lessons: { "a/x": { done: false, t: 30 }, "a/y": { done: true, t: 5 } }, quiz: { "a/x": { best: 60, last: 60, t: 40 } }, days: { "2026-01-01": 1, "2026-01-02": 2 } }
);
assert.equal(m.lessons["a/x"].done, false, "newest wins");
assert.equal(m.lessons["a/y"].done, true, "union");
assert.equal(m.quiz["a/x"].last, 60, "quiz newest last");
assert.equal(m.quiz["a/x"].best, 90, "quiz best max");
assert.equal(m.days["2026-01-01"], 3, "days max");
const r = LAB.merge({ resetAt: 25, lessons: {} }, { lessons: { "a/x": { done: true, t: 10 }, "a/z": { done: true, t: 30 } } });
assert.ok(!r.lessons["a/x"] && r.lessons["a/z"], "reset drops older");
assert.equal(LAB.stable({ b: 1, a: { d: 1, c: 2 } }), LAB.stable({ a: { c: 2, d: 1 }, b: 1 }), "stable key order");

// --links: every ref url must answer 2xx/3xx (some publishers block bots with 403: warn only)
if (links) {
    const get = async (url, method) => (await fetch(url, { method, redirect: "follow", signal: AbortSignal.timeout(10000), headers: { "user-agent": "Mozilla/5.0 study-lab link check" } })).status;
    await Promise.all([...urls].map(async ([url, where]) => {
        let s;
        try { s = await get(url, "HEAD"); if (s >= 400) s = await get(url, "GET"); } catch (e) { s = e.name; }
        if (!(s >= 200 && s < 400)) warn(where, `link ${s}: ${url}`);
    }));
}

warns.forEach((x) => console.log(`warn  ${x}`));
errors.forEach((x) => console.log(`ERROR ${x}`));
console.log(`\n${LAB.list().length} tracks · ${nLessons} lessons · ${nArticles} articles · ${nQuiz} quiz · ${terms.size} terms · ${urls.size} refs · ${errors.length} errors · ${warns.length} warnings`);
process.exit(errors.length ? 1 : 0);
