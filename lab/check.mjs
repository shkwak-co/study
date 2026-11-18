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
        if (d.name === "cpu") { // must assemble, run to the end, and match expect: { r0: 15, ... }
            const r = LAB.asm.run(d.code, d.regs);
            if (r.error) err(where, `cpu: ${r.error}`);
            else Object.entries(d.expect || {}).forEach(([k, v]) => { const got = LAB.asm.reg(r.M, k); if (got !== v >>> 0) err(where, `cpu expect ${k}=${v} but got ${got | 0}`); });
            if (!d.expect) warn(where, "cpu demo without expect");
        }
        if (d.name === "layout" && !(d.fields || []).every((f) => Array.isArray(f) && LAB.LAYOUT_TYPES && f[0] in LAB.LAYOUT_TYPES)) err(where, `layout fields must be [type, name] with type in ${Object.keys(LAB.LAYOUT_TYPES || {}).join(", ")}`);
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
            const ty = q.type || "mc";
            if (!LAB.Q_TYPES.includes(ty)) return err(w, `quiz ${i} type "${ty}" (have: ${LAB.Q_TYPES.join(", ")})`);
            if (!str(q.q) || !str(q.why)) err(w, `quiz ${i} q/why`);
            if (q.code && (!str(q.code.lang) || !str(q.code.src))) err(w, `quiz ${i} code needs lang + src`);
            if (ty === "mc") {
                if (!Array.isArray(q.options) || q.options.length < 2) err(w, `quiz ${i} options`);
                else {
                    if (!(Number.isInteger(q.a) && q.a >= 0 && q.a < q.options.length)) err(w, `quiz ${i} answer index ${q.a} out of range`);
                    if (new Set(q.options).size !== q.options.length) err(w, `quiz ${i} duplicate options`);
                }
            } else if (ty === "num") {
                if (typeof q.answer !== "number" || !Number.isFinite(q.answer)) err(w, `quiz ${i} num answer must be a number`);
                if (q.tol != null && !(q.tol >= 0)) err(w, `quiz ${i} tol must be ≥ 0`);
                if (!LAB.grade(q, String(q.answer))) err(w, `quiz ${i} own answer does not grade as correct`);
            } else if (ty === "text") {
                const a = [].concat(q.answer ?? []);
                if (!a.length || !a.every(str)) err(w, `quiz ${i} text answer: string or string[]`);
            } else if (ty === "order") {
                if (!Array.isArray(q.items) || q.items.length < 3 || !q.items.every(str)) err(w, `quiz ${i} order needs ≥3 items`);
                else if (new Set(q.items).size !== q.items.length) err(w, `quiz ${i} order items must be unique`);
            }
        });
        if (l.checked != null && !(/^\d{4}-\d{2}-\d{2}$/.test(l.checked) && l.checked <= new Date().toISOString().slice(0, 10))) err(w, `checked "${l.checked}" must be YYYY-MM-DD, not in the future`);
        if (l.pre != null && !(Array.isArray(l.pre) && l.pre.every(str))) err(w, "pre must be [\"track/lesson\", ...]");
    }
}

// categories: every track (and external page) in exactly one group
if (!only) [...ids, ...LAB.EXTRA_IDS].forEach((id) => { const n = LAB.CATEGORIES.filter((c) => c.tracks.includes(id)).length; if (n !== 1) err("CATEGORIES", `"${id}" is in ${n} groups (need 1)`); });

// prerequisites: known lessons (when that track is loaded), no cycles
const lessonById = new Map();
LAB.list().forEach((t) => t.lessons.forEach((l) => lessonById.set(`${t.id}/${l.id}`, l)));
for (const [k, l] of lessonById) {
    (l.pre || []).forEach((p) => {
        if (p === k) err(k, "pre refers to itself");
        else if (!lessonById.has(p) && LAB.tracks[p.split("/")[0]]) err(k, `pre "${p}" is not a lesson`);
        else if (!lessonById.has(p) && !only) err(k, `pre "${p}" is not a lesson`);
    });
}
{
    const state = new Map(); // 1 visiting, 2 done
    const visit = (k, trail) => {
        if (state.get(k) === 2) return;
        if (state.get(k) === 1) { err(k, `pre cycle: ${[...trail, k].join(" → ")}`); return; }
        state.set(k, 1);
        (lessonById.get(k)?.pre || []).filter((p) => lessonById.has(p)).forEach((p) => visit(p, [...trail, k]));
        state.set(k, 2);
    };
    [...lessonById.keys()].forEach((k) => visit(k, []));
}

// learning paths (content/paths.js): every step is a lesson
if (!only && fs.existsSync(path.join(dir, "content/paths.js"))) {
    try { run("content/paths.js"); } catch (e) { errors.push(`content/paths.js: ${e.message}`); }
    (LAB.paths || []).forEach((p) => {
        const w = `path ${p.id}`;
        if (!str(p.id) || !str(p.name) || !(p.lessons || []).length) err(w, "needs id, name, lessons");
        (p.lessons || []).forEach((k) => { if (!lessonById.has(k)) err(w, `"${k}" is not a lesson`); });
        if (new Set(p.lessons).size !== (p.lessons || []).length) err(w, "duplicate lesson");
    });
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
Object.entries(LAB.SIM_INFO || {}).forEach(([n, info]) => { if (!LAB.SIM_TAGS.includes(info[2])) err("anim.js", `SIM_INFO "${n}" tag "${info[2]}" not in SIM_TAGS`); });

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

// protocol labs: UART frame / baud / sampling, CAN arbitration / stuffing
{
    const P = LAB.proto;
    assert.equal(P.uartFrame(0x41).map((b) => b.v).join(""), "0100000101", "uart 8N1 frame, LSB first");
    assert.equal(P.uartFrame(0x41, 8, "odd").find((b) => b.k === "par").v, 1, "uart odd parity");
    assert.equal(P.uartBaud(16e6, 115200).div, 139, "uart divider");
    assert.ok(Math.abs(P.uartBaud(16e6, 921600).err - 0.0212) < 0.0005, "uart baud error 2.12%");
    assert.ok(!P.uartBaud(8e6, 921600).ok, "uart divider below oversampling");
    assert.ok(P.uartRx(P.uartFrame(0x41), 0.05).ok && !P.uartRx(P.uartFrame(0x41), 0.06).stopOk, "uart sampling drift → framing error");
    assert.equal(P.canArb([0x123, 0x120, 0x7ff]).winner, 1, "can lowest id wins");
    assert.equal(P.canStuff([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]).stuffed.join(","), "5,12", "can stuff bit after 5 equal bits");
    // I2C: address byte = addr << 1 | R/W, 9 clocks per byte, last read byte NACKed by the master
    const bytes = (f) => f.filter((x) => x.k === "byte").map((x) => x.v);
    const wr = P.i2cTxn({ addr: 0x68, op: "write", reg: 0x6b, data: [0x00] });
    assert.deepEqual([...bytes(wr)], [0xd0, 0x6b, 0x00], "i2c write bytes");
    const rd = P.i2cTxn({ addr: 0x68, op: "read", reg: 0x75, data: [0x68, 0x01] });
    assert.deepEqual([...bytes(rd)], [0xd0, 0x75, 0xd1, 0x68, 0x01], "i2c read: addr+W, reg, Sr, addr+R, data");
    assert.equal(rd.filter((x) => x.k === "ack").map((x) => x.v).join(""), "00001", "i2c read: master NACKs the last byte");
    assert.equal(P.i2cTxn({ addr: 0x50, absent: true }).map((x) => x.k + (x.k === "ack" ? x.v : "")).join(" "), "S byte ack1 P", "i2c no device: NACK then STOP");
    const iw = P.i2cWave(rd);
    assert.ok(iw.signals.every((s) => s.wave.length === iw.signals[0].wave.length), "i2c wave rows same length");
    assert.equal(iw.signals[0].wave.length, 1 + 1 + 3 + 5 * 18 + 3 + 1, "i2c wave slots: idle, S, Sr, 5 bytes × 9 bits × 2, P, idle");
    // SPI: modes 0/3 and 1/2 sample on the same edge; mode 1 master vs mode 0 slave races on every sample
    assert.ok(P.spiEdges(0xa5, 0, 0).ok && P.spiEdges(0xa5, 0, 3).ok && P.spiEdges(0xa5, 1, 2).ok && P.spiEdges(0xa5, 3, 0).ok, "spi compatible modes");
    const sp = P.spiEdges(0xa5, 1, 0);
    assert.ok(sp.race && sp.samples.every((s) => s.race), "spi mode 1 → 0: every sample on a data change");
    assert.equal(sp.readNew.v, 0xa5, "spi race: value after the change is the byte");
    assert.equal(sp.readOld.bits, "?1010010", "spi race: value before the change is one bit late");
    assert.equal(P.spiEdges(0x01, 0, 0, true).readOld.v, 0x01, "spi LSB first");
    assert.ok(P.spiWave(0xa5, 2, 2).spec.signals.every((s) => s.wave.length === 38), "spi wave rows same length");
}

// system labs: Cortex-M exception timing (TRM: entry 12, return 12, tail-chain 6), count++ races
{
    const Y = LAB.sys;
    const run = (irqs, pre = 4) => Y.nvicRun(irqs.map(([prio, at, dur]) => ({ prio, at, dur })), { pre });
    const one = run([[8, 10, 20]]);
    assert.deepEqual([one.irqs[0].start, one.irqs[0].end, one.cycles], [22, 42, 55], "nvic single: 12 in, 20 run, 12 out, then main");
    const same = run([[6, 10, 20], [6, 15, 10]]);
    assert.deepEqual([same.irqs[1].start, same.tail], [48, 1], "nvic same priority: waits, then tail-chains (6)");
    const pe = run([[2, 10, 30], [1, 30, 10]]);
    assert.deepEqual([pe.irqs[1].start, pe.irqs[0].end], [42, 86], "nvic preemption: B in at 42, A resumes after B's return");
    const g0 = run([[2, 10, 30], [1, 30, 10]], 0);
    assert.deepEqual([g0.irqs[1].start, g0.tail], [58, 1], "nvic 0 preemption bits: no nesting, tail-chain");
    const late = run([[2, 10, 10], [1, 14, 10]]);
    assert.deepEqual([late.irqs[1].start, late.irqs[1].lat, late.irqs[0].start, late.lates], [22, 8, 38, 1], "nvic late arrival takes over the stacking");
    const r1 = Y.raceRun(["A", "B", "A", "B", "A", "B"], "plain", 1);
    assert.deepEqual([r1.mem, r1.lost], [1, 1], "race: interleaved count++ loses one update");
    assert.equal(Y.raceRun(["A", "B", "A", "B", "A", "B"], "mutex", 1).mem, 2, "race: mutex");
    assert.equal(Y.raceRun(["A", "B"], "atomic", 1).mem, 2, "race: atomic");
    assert.equal(Y.raceRun(["A", "A", "A", "B", "B", "B"], "plain", 1).mem, 2, "race: no overlap, no loss");
    assert.equal(Y.raceRun(["A", "B"], "plain", 1, false).trace.length, 2, "race: manual stepping stops with the schedule");
    for (let m = 0; m < 1 << 10; m++) { // every interleaving of 2 × (lock load add store unlock): mutex never loses, never hangs
        const r = Y.raceRun(Array.from({ length: 10 }, (_, i) => ((m >> i) & 1 ? "A" : "B")), "mutex", 1);
        assert.ok(r.mem === 2 && r.th.A.pc === 5 && r.th.B.pc === 5, `race: mutex schedule ${m}`);
    }
}

// quantization (article example) and graph traversal
{
    const q = LAB.num.quant([-1, 0, 0.5, 3], 8, "asym");
    assert.deepEqual([q.z, ...q.q], [64, 0, 64, 96, 255], "quant asym uint8: z=64, q=[0 64 96 255]");
    assert.ok(Math.abs(q.s - 4 / 255) < 1e-12 && Math.abs(q.deq[2] - 0.50196) < 1e-4, "quant scale and dequant");
    const sq = LAB.num.quant([-1, 0.5, 1], 8, "sym");
    assert.deepEqual([...sq.q], [-127, 64, 127], "quant sym int8: 0.5·127 = 63.5 → 64 (half to even)");
    const o = LAB.num.quant([0.05, -0.08, 0.1, 10], 8, "sym");
    assert.equal(new Set(o.q.slice(0, 3)).size, 2, "quant outlier squeezes small weights into a few integers");
    const D = LAB.ds;
    assert.equal(D.graphRun(D.GRAPH0, "bfs", "A").order.join(""), "ABCDEF", "bfs order");
    assert.equal(D.graphRun(D.GRAPH0, "bfs", "D").order.join(""), "DBCFAE", "bfs from D");
    assert.equal(D.graphRun(D.GRAPH0, "dfs", "A").order.join(""), "ABDCEF", "dfs order");
    assert.equal(JSON.stringify(D.graphRun(D.GRAPH0, "dijkstra", "A").dist), JSON.stringify({ A: 0, B: 4, C: 1, D: 5, E: 4, F: 8 }), "dijkstra distances");
    assert.equal(D.graphRun(D.GRAPH0, "topo").order.join(""), "ABCDEF", "kahn order");
}

// AI labs: BPE merges (Sennrich et al. 2016 toy corpus), similarity ranking
{
    const A = LAB.ai;
    const L = A.bpeLearn("low low low low low lower lower newest newest newest newest newest newest widest widest widest", 20);
    assert.equal(L.merges.slice(0, 5).map((m) => m[0] + m[1]).join(" "), "es est est</w> lo low", "bpe merge order");
    assert.equal(A.bpeApply("lowest", L.merges.slice(0, 10)).join(" "), "low est</w>", "bpe tokenizes an unseen word");
    const docs = [{ v: [0.9, 0.15] }, { v: [1.8, 1.1] }, { v: [0.55, 0.25] }];
    assert.equal(A.vrank(docs, [0.8, 0.3], "dot", false)[0].i, 1, "dot product favours the long vector");
    assert.equal(A.vrank(docs, [0.8, 0.3], "cosine", false)[0].i, 2, "cosine ignores length");
    assert.equal(["cosine", "dot", "l2"].map((m) => A.vrank(docs, [0.8, 0.3], m, true).map((r) => r.i).join("")).join(" "), "210 210 210", "unit vectors: all metrics agree");
    // hybrid lab (rag track): each preset shows what its caption claims
    assert.deepEqual([...A.hyTok("모니터가 E-4012 3층에서 안 됨")], ["모니터", "e-4012", "3층"], "tokens: particle cut, code whole, 1-char words dropped");
    assert.ok(Math.abs(A.rrf([[0, 1], [1, 2]], 60).get(1) - (1 / 62 + 1 / 61)) < 1e-12, "rrf: 1 / (k + rank)");
    const hy = (i, filter) => { const P = A.HYB_QUERIES[i]; const R = A.hybridRun(A.HYB_DOCS, P.q, { filter }); return ["bm25", "dense", "hybrid"].map((m) => A.recallAt(R.ids[m], P.gold, 3)).join(" "); };
    assert.equal(hy(0), "0.5 1 1", "hybrid: paraphrase — keyword misses, meaning finds");
    assert.equal(hy(1), "1 0 1", "hybrid: code — meaning vector empty, keyword finds");
    assert.equal(hy(2), "0 0.5 0", "hybrid: floor ignored — other floors fill the top 3");
    assert.equal(hy(2, true), "0 1 1", "hybrid: building/floor filter");
    assert.equal(hy(3), "1 1 1", "hybrid: easy question");
    // context lab (ai track): what the model receives at the last turn
    const cx = (o) => { const R = A.ctxRun(A.CTX_TURNS, 12, o); return `${R.dropped.length} ${R.used} ${R.facts.map((f) => f.via).join(",")}`; };
    assert.equal(cx({ limit: 4096 }), "4 4080 잊힘,잊힘,잊힘,대화", "context: 4k drops the first turns, name forgotten");
    assert.equal(cx({ limit: 4096, memory: true }), "6 3250 메모리 파일,메모리 파일,잊힘,대화", "context: memory file brings saved facts back, costs tokens");
    assert.equal(cx({ limit: 4096, compact: true }), "6 3380 요약,요약,잊힘,대화", "context: summary keeps the gist, loses the error code");
    assert.equal(cx({ limit: 8192 }), "0 5990 대화,대화,대화,대화", "context: 8k holds the whole chat");
}

// quiz grading: numbers (hex, tolerance), text answers, order
{
    const g = LAB.grade;
    assert.ok(g({ type: "num", answer: 255 }, "0xFF") && g({ type: "num", answer: 255 }, "0b11111111") && g({ type: "num", answer: 1999000 }, "1,999,000"), "num accepts hex / bin / grouped digits");
    assert.ok(g({ type: "num", answer: 2.12, tol: 0.05 }, "2.1") && !g({ type: "num", answer: 2.12, tol: 0.05 }, "2.0"), "num tolerance");
    assert.ok(!g({ type: "num", answer: 3 }, "abc") && !g({ type: "num", answer: 3 }, ""), "num rejects junk");
    assert.ok(g({ type: "text", answer: ["0x1234FF78", "305463160"] }, " 0x1234ff78 ") && !g({ type: "text", answer: "a" }, ""), "text answers: case / space insensitive");
    assert.ok(g({ type: "order", items: ["a", "b", "c"] }, ["a", "b", "c"]) && !g({ type: "order", items: ["a", "b", "c"] }, ["b", "a", "c"]), "order");
    assert.ok(g({ options: ["x", "y"], a: 1 }, 1) && !g({ options: ["x", "y"], a: 1 }, 0), "mc");
}

// cpu lab: loops, calls + stack, flags, bytes, faults
{
    const A = LAB.asm;
    const run = (src) => { const r = A.run(src); return r.error ? { error: r.error } : r.M; };
    const sum = run(".data\narr: .word 3, 1, 4, 1, 5\n.text\nldr r1, =arr\nmovs r2, #5\nmovs r0, #0\nloop: ldr r3, [r1], #4\nadds r0, r0, r3\nsubs r2, r2, #1\nbne loop\nbx lr");
    assert.equal(A.reg(sum, "r0"), 14, "cpu array sum");
    const fact = run("push {r4, lr}\nmovs r0, #5\nbl fact\npop {r4, pc}\nfact: cmp r0, #1\nble base\npush {r0, lr}\nsubs r0, r0, #1\nbl fact\npop {r1, lr}\nmuls r0, r0, r1\nbx lr\nbase: movs r0, #1\nbx lr");
    assert.equal(A.reg(fact, "r0"), 120, "cpu recursive factorial");
    assert.equal(A.reg(fact, "sp"), A.RAM_BASE + A.RAM_SIZE, "cpu stack balanced");
    const fl = run("movs r0, #0x7f\nlsls r0, r0, #24\nadds r1, r0, r0\nbx lr");
    assert.deepEqual([fl.n, fl.z, fl.c, fl.v], [1, 0, 0, 1], "cpu signed overflow flags");
    const cmpu = run("mov r2, #-1\nmovs r3, #0\nmovs r4, #0\ncmp r2, #1\nblo a\nmovs r3, #1\na: cmp r2, #1\nblt b\nmovs r4, #1\nb: bx lr");
    assert.deepEqual([A.reg(cmpu, "r3"), A.reg(cmpu, "r4")], [1, 0], "cpu unsigned vs signed branch");
    const by = run(".data\nv: .word 0x12345678\n.text\nldr r0, =v\nldrb r1, [r0]\nmovs r5, #0xFF\nstrb r5, [r0, #1]\nldr r6, [r0]\nldrsb r7, [r0, #1]\nbx lr");
    assert.deepEqual([A.reg(by, "r1"), A.reg(by, "r6"), A.reg(by, "r7")], [0x78, 0x1234ff78, 0xffffffff], "cpu little-endian bytes");
    assert.match(run("movs r0, #0\nldr r1, [r0]\nbx lr").error, /HardFault/, "cpu null deref faults");
    assert.match(run("x: b x").error, /단계/, "cpu infinite loop guard");
    assert.match(run("b nowhere").error, /없는 레이블/, "cpu unknown label");
}

// memory + data-structure labs
{
    const D = LAB.ds;
    const hits = (p, size, block, ways) => D.cacheSim(D.CACHE_PATTERNS[p][1](size), size, block, ways).frames.at(-1).hits;
    assert.equal(hits("conflict", 64, 16, 1), 0, "cache: direct-mapped conflict thrashes");
    assert.equal(hits("conflict", 64, 16, 2), 12, "cache: 2-way fixes the conflict");
    assert.equal(hits("seq", 64, 16, 1), 24, "cache: sequential = 1 miss per block");
    const lay = D.structLayout([["char", "a"], ["int", "b"], ["char", "c"], ["double", "d"]].map(([t, n]) => ({ t, n })), 32, false);
    assert.deepEqual([lay.items.map((x) => x.off), lay.size], [[0, 4, 8, 16], 24], "struct padding (AAPCS)");
    const r = D.ring.make(4, "spare");
    for (let i = 1; i <= 5; i++) D.ring.put(r, i, false);
    assert.deepEqual([D.ring.size(r), r.lost], [3, 2], "ring buffer keeps one slot empty");
    const h = D.hashT.make(8, "linear");
    [12, 20, 7, 15, 3, 28].forEach((k) => D.hashT.insert(h, k));
    D.hashT.remove(h, 20);
    assert.ok(D.hashT.find(h, 28).ok, "hash: tombstone keeps the probe chain");
    const hp = [9, 4, 7, 1, 8, 2];
    D.heapT.heapify(hp, "min");
    assert.ok(D.heapT.ok(hp, "min"), "heapify");
    let t = null;
    [50, 30, 70, 20, 40, 60, 80, 35].forEach((v) => { t = D.bstT.insert(t, v).root; });
    t = D.bstT.remove(t, 30).root;
    assert.equal(D.bstT.inorder(t).join(" "), "20 35 40 50 60 70 80", "bst delete with two children");
    for (const algo of ["bubble", "insertion", "selection", "merge", "quick", "heap"]) {
        for (const kind of ["random", "nearly", "reversed", "few"]) {
            const out = D.sortFrames(algo, D.sortInput(kind, 16, 3)).at(-1).a;
            assert.ok(out.every((v, i) => !i || out[i - 1] <= v), `sort ${algo} ${kind}`);
        }
    }
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
assert.equal(LAB.merge({ srs: { "a/x#0": { box: 2, due: "2026-01-03", t: 5 } } }, { srs: { "a/x#0": { box: 1, due: "2026-01-02", t: 9 } } }).srs["a/x#0"].box, 1, "srs merges newest");
assert.equal(Object.keys(LAB.merge({ lessons: {} }, null).srs).length, 0, "old progress files without srs");

// spaced repetition: right → next box (1, 2, 4, 8, 16 days, capped), wrong → box 1 tomorrow; month/year rollover
{
    const n = LAB.srsNext;
    assert.deepEqual({ ...n(null, true, "2026-11-17") }, { box: 1, due: "2026-11-18" }, "first right");
    assert.deepEqual({ ...n({ box: 1 }, true, "2026-11-17") }, { box: 2, due: "2026-11-19" }, "box 2: 2 days");
    assert.deepEqual({ ...n({ box: 4 }, true, "2026-12-20") }, { box: 5, due: "2027-01-05" }, "box 5: 16 days, year rollover");
    assert.deepEqual({ ...n({ box: 5 }, true, "2026-02-20") }, { box: 5, due: "2026-03-08" }, "box capped at 5, February");
    assert.deepEqual({ ...n({ box: 4 }, false, "2026-11-30") }, { box: 1, due: "2026-12-01" }, "wrong: box 1, tomorrow");
}

// --links: every ref url must answer 2xx/3xx (some publishers block bots with 403: warn only)
if (links) {
    const get = async (url, method) => (await fetch(url, { method, redirect: "follow", signal: AbortSignal.timeout(10000), headers: { "user-agent": "Mozilla/5.0 study-lab link check" } })).status;
    await Promise.all([...urls].map(async ([url, where]) => {
        let s;
        try { s = await get(url, "HEAD"); if (s >= 400) s = await get(url, "GET"); } catch (e) { s = e.name; }
        if (!(s >= 200 && s < 400)) warn(where, `link ${s}: ${url}`);
    }));
}

// --report: quality scorecard per track / lesson (prints only; round targets in README)
if (args.includes("--report")) {
    const T = { quiz: 8, newTypes: 3, longest: 0.35 };
    const year = new Date().getFullYear();
    const longestRight = (q) => { const len = q.options.map((o) => o.length); const mx = Math.max(...len); return len[q.a] === mx && len.filter((x) => x === mx).length === 1; };
    console.log(`\nREPORT · targets: quiz ≥ ${T.quiz} (≥ ${T.newTypes} non-choice), longest-option answers ≤ ${T.longest * 100}%, checked date, trends ending ≥ ${year}`);
    for (const t of LAB.list()) {
        const mc = t.lessons.flatMap((l) => l.quiz.filter((q) => !q.type || q.type === "mc"));
        const ratio = mc.length ? mc.filter(longestRight).length / mc.length : 0;
        const stale = (t.trends || []).filter((x) => Math.max(...(String(x.when).match(/\d{4}/g) || [0]).map(Number)) < year).length;
        const rows = t.lessons.map((l) => {
            const by = {};
            l.quiz.forEach((q) => { by[q.type || "mc"] = (by[q.type || "mc"] || 0) + 1; });
            const fresh = l.quiz.length - (by.mc || 0);
            const flags = [l.quiz.length < T.quiz && `문제 ${l.quiz.length}`, fresh < T.newTypes && `새유형 ${fresh}`, !l.checked && "미검증", !(LAB.articles[t.id] || {})[l.id] && "상세없음"].filter(Boolean);
            return { l, by, flags };
        });
        const ok = rows.filter((r) => !r.flags.length).length;
        console.log(`\n${t.icon} ${t.id}  ${ok}/${t.lessons.length} 강 통과 · 객관식 정답=최장 ${(ratio * 100).toFixed(0)}%${ratio > T.longest ? " ✗" : " ✓"} · 오래된 동향 ${stale}${stale ? " ✗" : " ✓"} · 실험 ${t.lessons.filter((l) => l.demo && l.demo.type === "sim").length}/${t.lessons.length}`);
        rows.forEach(({ l, by, flags }) => {
            console.log(`  ${flags.length ? "✗" : "✓"} ${l.id.padEnd(18)} 문제 ${String(l.quiz.length).padStart(2)} (${Object.entries(by).map(([k, v]) => `${k} ${v}`).join(", ")}) · pre ${(l.pre || []).length} · refs ${(l.refs || []).length}${l.checked ? ` · 검증 ${l.checked}` : ""}${flags.length ? `  ← ${flags.join(", ")}` : ""}`);
        });
    }
}

warns.forEach((x) => console.log(`warn  ${x}`));
errors.forEach((x) => console.log(`ERROR ${x}`));
console.log(`\n${LAB.list().length} tracks · ${nLessons} lessons · ${nArticles} articles · ${nQuiz} quiz · ${terms.size} terms · ${urls.size} refs · ${errors.length} errors · ${warns.length} warnings`);
process.exit(errors.length ? 1 : 0);
