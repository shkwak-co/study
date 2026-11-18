/* Study Lab demos: data-driven animations (steps, wave, seq) and interactive sims.
   Spec reference: lab/README.md. Entry point: LAB.demo(host, spec). */
(() => {
    "use strict";
    const LAB = window.LAB;
    const rm = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const esc = (s) => LAB.esc(s);
    const fmt = (s) => LAB.fmt(s);
    const PALETTE = ["#22d3ee", "#f472b6", "#facc15", "#34d399", "#a78bfa", "#f97316", "#60a5fa"];
    let uidN = 0;
    const uid = () => `d${++uidN}`;

    /* ---------- shared bits ---------- */
    function vars(el) {
        const s = getComputedStyle(el);
        const g = (k) => s.getPropertyValue(k).trim();
        return { c: g("--c") || "#22d3ee", text: g("--text"), muted: g("--muted"), dim: g("--dim"), line: g("--line2"), ok: g("--ok"), bad: g("--bad"), warn: g("--warn"), bg: g("--bg") };
    }
    function rgba(hex, a) {
        if (!hex || hex[0] !== "#") return hex;
        let h = hex.slice(1);
        if (h.length === 3) h = h.split("").map((c) => c + c).join("");
        const n = parseInt(h, 16);
        return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }
    function rng(seed) { // mulberry32
        let a = seed >>> 0;
        return () => {
            a = (a + 0x6d2b79f5) >>> 0;
            let t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const gauss = (r) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    function stage(host, flush) {
        const st = document.createElement("div");
        st.className = "demo-stage";
        if (flush) st.style.padding = "0";
        host.append(st);
        return st;
    }
    function ctlBar(host) {
        const d = document.createElement("div");
        d.className = "demo-ctl";
        host.append(d);
        return d;
    }
    function slider(bar, label, min, max, step, val, show, on) {
        const l = document.createElement("label");
        l.innerHTML = `${label} <input type="range" min="${min}" max="${max}" step="${step}" value="${val}"> <b></b>`;
        const inp = l.querySelector("input");
        const b = l.querySelector("b");
        b.textContent = show(val);
        inp.addEventListener("input", () => { b.textContent = show(+inp.value); on(+inp.value); });
        inp.set = (v) => { inp.value = v; b.textContent = show(+v); };
        bar.append(l);
        return inp;
    }
    function seg(bar, label, opts, val, on) {
        const w = document.createElement("div");
        w.className = "field";
        w.innerHTML = `${label ? `${label} ` : ""}<span class="seg">${opts.map(([v, t]) => `<button type="button" data-v="${v}" class="${String(v) === String(val) ? "on" : ""}">${t}</button>`).join("")}</span>`;
        w.addEventListener("click", (e) => {
            const b = e.target.closest("button");
            if (!b) return;
            w.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
            on(b.dataset.v);
        });
        bar.append(w);
        return w;
    }
    function button(bar, text, on, primary) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = `btn small${primary ? " primary" : ""}`;
        b.textContent = text;
        b.onclick = on;
        bar.append(b);
        return b;
    }
    function readout(host) {
        const d = document.createElement("div");
        d.className = "kv";
        host.append(d);
        return (items) => { d.innerHTML = items.map(([k, v, cls]) => `<span class="${cls || ""}">${k} <b>${v}</b></span>`).join(""); };
    }
    function canvas(st, height) {
        const cv = document.createElement("canvas");
        st.append(cv);
        const ctx = cv.getContext("2d");
        const o = { cv, ctx, w: 0, h: 0, draw: () => {} };
        o.fit = () => {
            const d = devicePixelRatio || 1;
            const pad = parseFloat(getComputedStyle(st).paddingLeft) * 2 || 0;
            const w = Math.max(260, Math.floor(st.clientWidth - pad));
            const h = typeof height === "function" ? height(w) : height;
            if (w === o.w && h === o.h) return;
            o.w = w;
            o.h = h;
            cv.width = w * d;
            cv.height = h * d;
            cv.style.width = `${w}px`;
            cv.style.height = `${h}px`;
            ctx.setTransform(d, 0, 0, d, 0, 0);
            o.draw();
        };
        new ResizeObserver(() => o.fit()).observe(st);
        addEventListener("lab:theme", () => o.draw());
        return o;
    }
    function animate(host, fn) {
        let vis = false;
        new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(host);
        let last = performance.now();
        const f = (t) => {
            const dt = Math.min(0.05, (t - last) / 1000);
            last = t;
            if (vis && !document.hidden) fn(dt, t / 1000);
            requestAnimationFrame(f);
        };
        requestAnimationFrame(f);
    }
    function onVisible(el, fn) {
        new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); fn(); } }, { threshold: 0.35 }).observe(el);
    }

    // prev / play / next / reset bar with caption; show(i) renders step i and returns its caption
    function stepper(host, n, show, opts = {}) {
        const interval = opts.interval || 2400;
        host.insertAdjacentHTML("beforeend", `<div class="demo-bar">
            <button type="button" class="btn small" data-a="prev" title="이전">◀</button>
            <button type="button" class="btn small primary" data-a="play">▶ 재생</button>
            <button type="button" class="btn small" data-a="next" title="다음">▶|</button>
            <button type="button" class="btn small ghost" data-a="reset" title="처음">↺</button>
            <span class="cap"></span><span class="cnt"></span></div>`);
        const bar = host.lastElementChild;
        const cap = bar.querySelector(".cap");
        const cnt = bar.querySelector(".cnt");
        const play = bar.querySelector("[data-a=play]");
        let i = -1;
        let timer = 0;
        let playing = false;
        const go = (k) => {
            i = clamp(k, 0, n - 1);
            cap.innerHTML = fmt(show(i) || "");
            cap.style.animation = "none";
            void cap.offsetWidth;
            cap.style.animation = "";
            cnt.textContent = `${i + 1} / ${n}`;
        };
        const stop = () => { playing = false; clearInterval(timer); play.textContent = "▶ 재생"; };
        const start = () => {
            if (i >= n - 1) go(0);
            playing = true;
            play.textContent = "⏸ 정지";
            timer = setInterval(() => { if (i >= n - 1) stop(); else go(i + 1); }, interval);
        };
        bar.addEventListener("click", (e) => {
            const b = e.target.closest("[data-a]");
            if (!b) return;
            const a = b.dataset.a;
            if (a === "play") { if (playing) stop(); else start(); return; }
            stop();
            go(a === "next" ? i + 1 : a === "prev" ? i - 1 : 0);
        });
        go(0);
        if (!rm() && opts.auto !== false && n > 1) onVisible(host, start);
        return { go, stop, bar };
    }

    /* ---------- steps: boxes + arrows, highlighted step by step ---------- */
    function steps(host, spec) {
        const W = 204;
        const H = 104;
        const BW = 144;
        const BH = 56;
        const id = uid();
        const nodes = spec.nodes.map((n, i) => ({ ...n, x: n.x ?? i, y: n.y ?? 0 }));
        const by = Object.fromEntries(nodes.map((n) => [n.id, n]));
        const cols = Math.max(...nodes.map((n) => n.x)) + 1;
        const rows = Math.max(...nodes.map((n) => n.y)) + 1;
        const cx = (n) => n.x * W + W / 2;
        const cy = (n) => n.y * H + H / 2;
        const edges = (spec.edges || []).filter((e) => by[e.from] && by[e.to]);
        const geo = (e) => {
            const a = by[e.from];
            const b = by[e.to];
            if (e.arc) {
                const s = e.arc === "down" ? 1 : -1;
                const ay = cy(a) + s * BH / 2;
                const byy = cy(b) + s * BH / 2;
                const lift = 34 + Math.abs(cx(b) - cx(a)) * 0.12;
                return { d: `M${cx(a)},${ay} C${cx(a)},${ay + s * lift} ${cx(b)},${byy + s * lift} ${cx(b)},${byy}`, lx: (cx(a) + cx(b)) / 2, ly: (ay + byy) / 2 + s * (lift * 0.75 + 4) };
            }
            const dx = cx(b) - cx(a);
            const dy = cy(b) - cy(a);
            if (Math.abs(dx) >= Math.abs(dy)) {
                const sx = cx(a) + Math.sign(dx) * BW / 2;
                const ex = cx(b) - Math.sign(dx) * BW / 2;
                const d = dy === 0 ? `M${sx},${cy(a)} L${ex},${cy(b)}` : `M${sx},${cy(a)} C${(sx + ex) / 2},${cy(a)} ${(sx + ex) / 2},${cy(b)} ${ex},${cy(b)}`;
                return { d, lx: (sx + ex) / 2, ly: (cy(a) + cy(b)) / 2 - 8 };
            }
            const sy = cy(a) + Math.sign(dy) * BH / 2;
            const ey = cy(b) - Math.sign(dy) * BH / 2;
            const d = dx === 0 ? `M${cx(a)},${sy} L${cx(b)},${ey}` : `M${cx(a)},${sy} C${cx(a)},${(sy + ey) / 2} ${cx(b)},${(sy + ey) / 2} ${cx(b)},${ey}`;
            return { d, lx: (cx(a) + cx(b)) / 2 + 8, ly: (sy + ey) / 2 + 4, side: true };
        };
        const st = stage(host);
        st.innerHTML = `<svg viewBox="-6 -6 ${cols * W + 12} ${rows * H + 12}" style="min-width:${Math.min(cols * W, 560)}px;max-width:${Math.round((cols * W + 12) * 1.12)}px;margin:0 auto">
          <defs>
            <marker id="${id}d" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--line2)"/></marker>
            <marker id="${id}a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--c)"/></marker>
          </defs>
          ${edges.map((e) => {
            const g = geo(e);
            return `<g class="st-edge" data-k="${esc(e.from)}>${esc(e.to)}"><path d="${g.d}" marker-end="url(#${id}d)"${e.both ? ` marker-start="url(#${id}d)"` : ""}/>${e.label ? `<text x="${g.lx}" y="${g.ly}" ${g.side ? "text-anchor=\"start\"" : ""}>${esc(e.label)}</text>` : ""}</g>`;
        }).join("")}
          ${nodes.map((n) => `<g class="st-node" data-k="${esc(n.id)}">
            <rect x="${cx(n) - BW / 2}" y="${cy(n) - BH / 2}" width="${BW}" height="${BH}" rx="12"/>
            <text x="${cx(n)}" y="${cy(n) - (n.sub ? 8 : 0)}">${esc(n.label)}</text>
            ${n.sub ? `<text class="sub" x="${cx(n)}" y="${cy(n) + 12}">${esc(n.sub)}</text>` : ""}</g>`).join("")}
        </svg>`;
        const gs = [...st.querySelectorAll("[data-k]")];
        const show = (i) => {
            const past = new Set(spec.steps.slice(0, i).flatMap((s) => s.on || []));
            const on = new Set(spec.steps[i].on || []);
            gs.forEach((g) => {
                const k = g.dataset.k;
                g.classList.toggle("on", on.has(k));
                g.classList.toggle("past", !on.has(k) && past.has(k));
                const p = g.classList.contains("st-edge") && g.querySelector("path");
                if (p) {
                    const m = `url(#${id}${on.has(k) ? "a" : "d"})`;
                    p.setAttribute("marker-end", m);
                    if (p.hasAttribute("marker-start")) p.setAttribute("marker-start", m);
                }
            });
            return spec.steps[i].text;
        };
        stepper(host, spec.steps.length, show, { interval: spec.interval });
    }

    /* ---------- wave: digital timing diagram ---------- */
    // wave chars per slot: 0 1 (h l) level · p clock · = data box (labels from data[]) · x unknown · z hi-Z · . continue
    function wave(host, spec) {
        const sigs = spec.signals;
        const N = Math.max(...sigs.map((s) => s.wave.length));
        const NW = 96;
        const SW = clamp(Math.floor(820 / N), 26, 60);
        const RH = 50;
        const A = 26;
        const top = 34;
        const vw = NW + N * SW + 8;
        const vh = top + sigs.length * RH + 6;
        let body = "";
        for (let k = 0; k <= N; k++) body += `<line class="wv-grid" x1="${NW + k * SW}" y1="${top - 6}" x2="${NW + k * SW}" y2="${vh - 4}"/>`;
        sigs.forEach((s, r) => {
            const hi = top + r * RH + 6;
            const lo = hi + A;
            const mid = (hi + lo) / 2;
            let d = "";
            let zd = "";
            let pen = null;
            let box = null;
            let last = null;
            let di = 0;
            const boxes = [];
            const norm = (c) => (c === "h" ? "1" : c === "l" ? "0" : c);
            for (let k = 0; k < N; k++) {
                const raw = s.wave[k] || ".";
                const cont = raw === ".";
                const kind = cont ? last : norm(raw);
                const x0 = NW + k * SW;
                const x1 = x0 + SW;
                if (kind === "=" || kind === "x") {
                    if (cont && box) box.x1 = x1;
                    else {
                        pen = null;
                        box = { x0, x1, kind, label: kind === "=" ? (s.data || [])[di++] : "" };
                        boxes.push(box);
                    }
                    last = kind;
                    continue;
                }
                box = null;
                if (kind === "p") {
                    const xm = x0 + SW / 2;
                    d += pen == null ? ` M${x0},${lo}` : ` L${x0},${pen} L${x0},${lo}`;
                    d += ` L${x0},${hi} L${xm},${hi} L${xm},${lo} L${x1},${lo}`;
                    pen = lo;
                    last = "p";
                    continue;
                }
                if (kind === "z") {
                    zd += ` M${x0},${mid} L${x1},${mid}`;
                    pen = null;
                    last = "z";
                    continue;
                }
                const y = kind === "1" ? hi : lo;
                if (pen == null) d += ` M${x0},${y}`;
                else if (pen !== y) d += ` L${x0},${pen} L${x0 + 3},${y}`;
                d += ` L${x1},${y}`;
                pen = y;
                last = kind;
            }
            body += `<text class="wv-name" x="4" y="${mid}">${esc(s.name)}</text>`;
            boxes.forEach((b) => {
                const t = Math.min(5, (b.x1 - b.x0) / 3);
                body += `<path class="${b.kind === "x" ? "wv-x" : "wv-box"}" d="M${b.x0},${mid} L${b.x0 + t},${hi} L${b.x1 - t},${hi} L${b.x1},${mid} L${b.x1 - t},${lo} L${b.x0 + t},${lo} Z"/>`;
                if (b.label != null && b.label !== "") body += `<text class="wv-lbl" x="${(b.x0 + b.x1) / 2}" y="${mid}">${esc(b.label)}</text>`;
            });
            if (d) body += `<path class="wv-sig" d="${d}"/>`;
            if (zd) body += `<path class="wv-z" d="${zd}"/>`;
        });
        const st = stage(host);
        st.innerHTML = `<svg viewBox="0 0 ${vw} ${vh}" style="min-width:${Math.min(vw, 620)}px">
          <defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" style="stroke:var(--dim)" stroke-width="1.5"/></pattern></defs>
          <rect class="wv-band" x="${NW}" y="2" width="${SW}" height="${vh - 4}" rx="6"/>
          <text class="wv-tag" x="${NW}" y="16"></text>
          ${body}
          <line class="wv-cur" x1="${NW}" y1="${top - 8}" x2="${NW}" y2="${vh - 2}"/>
        </svg>`;
        const band = st.querySelector(".wv-band");
        const tag = st.querySelector(".wv-tag");
        const cur = st.querySelector(".wv-cur");
        const list = spec.steps && spec.steps.length ? spec.steps : [{ from: 0, to: N, text: spec.caption || "" }];
        const dur = (spec.interval || 2600) * 0.85;
        const show = (i) => {
            const s = list[i];
            const x0 = NW + s.from * SW;
            const x1 = NW + s.to * SW;
            band.setAttribute("x", x0);
            band.setAttribute("width", Math.max(4, x1 - x0));
            tag.setAttribute("x", (x0 + x1) / 2);
            tag.textContent = s.tag || "";
            cur.style.transition = "none";
            cur.style.transform = `translateX(${x0 - NW}px)`;
            void cur.getBoundingClientRect();
            cur.style.transition = rm() ? "none" : `transform ${dur}ms linear`;
            cur.style.transform = `translateX(${x1 - NW}px)`;
            return s.text;
        };
        stepper(host, list.length, show, { interval: spec.interval || 2600 });
    }

    /* ---------- seq: sequence diagram ---------- */
    function seq(host, spec) {
        const A = spec.actors;
        const n = A.length;
        const gap = n > 1 ? clamp(Math.floor(700 / (n - 1)), 150, 260) : 200;
        const left = 80;
        const xs = A.map((_, i) => left + i * gap);
        const vw = left * 2 + (n - 1) * gap;
        const top = 64;
        const RH = 52;
        const vh = top + spec.msgs.length * RH + 20;
        const id = uid();
        const st = stage(host);
        st.innerHTML = `<svg viewBox="0 0 ${vw} ${vh}" style="min-width:${Math.min(vw, 560)}px">
          <defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--c)"/></marker>
          <marker id="${id}m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--muted)"/></marker></defs>
          ${A.map((a, i) => `<line class="sq-life" x1="${xs[i]}" y1="44" x2="${xs[i]}" y2="${vh - 6}"/><g class="sq-actor"><rect x="${xs[i] - 62}" y="8" width="124" height="36" rx="10"/><text x="${xs[i]}" y="26">${esc(a)}</text></g>`).join("")}
          ${spec.msgs.map((m, i) => {
            const y = top + 20 + i * RH;
            const x1 = xs[m.from];
            const x2 = xs[m.to];
            const d = m.from === m.to ? `M${x1},${y - 8} h46 v22 h-44` : `M${x1},${y} L${x2 + (x2 > x1 ? -4 : 4)},${y}`;
            const lx = m.from === m.to ? x1 + 50 : (x1 + x2) / 2;
            return `<g class="sq-msg hide"><path d="${d}" marker-end="url(#${id}m)"/><text x="${lx}" y="${y - 9}" ${m.from === m.to ? "text-anchor=\"start\"" : ""}>${esc(m.label)}</text></g>`;
        }).join("")}
        </svg>`;
        const gs = [...st.querySelectorAll(".sq-msg")];
        gs.forEach((g) => { const p = g.querySelector("path"); g.style.setProperty("--len", Math.ceil(p.getTotalLength ? p.getTotalLength() : 300)); });
        const show = (i) => {
            gs.forEach((g, k) => {
                g.classList.toggle("hide", k > i);
                g.classList.toggle("past", k < i);
                g.classList.remove("on");
                g.querySelector("path").setAttribute("marker-end", `url(#${id}${k === i ? "" : "m"})`);
            });
            void gs[i].getBoundingClientRect();
            gs[i].classList.add("on");
            return spec.msgs[i].text || "";
        };
        stepper(host, spec.msgs.length, show, { interval: spec.interval || 2200 });
    }

    /* ---------- interactive sims ---------- */
    const SIMS = {};

    // PID on a mass-spring-damper: y'' + 0.6y' + y = u
    SIMS.pid = (host, spec) => {
        const st = stage(host);
        const cv = canvas(st, 270);
        const bar = ctlBar(host);
        const out = readout(host);
        const g = { kp: spec.kp ?? 2, ki: spec.ki ?? 0.6, kd: spec.kd ?? 0.4 };
        const T = 12;
        const dt = 0.004;
        let reveal = rm() ? 1 : 0;
        let res = null;
        const sim = () => {
            let y = 0;
            let v = 0;
            let I = 0;
            let pe = 1;
            const ys = [];
            const us = [];
            for (let t = 0; t <= T; t += dt) {
                const e = 1 - y;
                I += e * dt;
                const D = (e - pe) / dt;
                pe = e;
                const u = clamp(g.kp * e + g.ki * I + g.kd * D, -20, 20);
                v += (u - 0.6 * v - y) * dt;
                y += v * dt;
                ys.push(y);
                us.push(u);
            }
            const peak = Math.max(...ys);
            let settle = 0;
            ys.forEach((yy, i) => { if (Math.abs(yy - 1) > 0.02) settle = i * dt; });
            const blow = ys.some((yy) => !isFinite(yy) || Math.abs(yy) > 5);
            return { ys, us, peak, settle, err: 1 - ys[ys.length - 1], blow };
        };
        cv.draw = () => {
            if (!res) return;
            const { ctx, w, h } = cv;
            const C = vars(host);
            ctx.clearRect(0, 0, w, h);
            const L = 40;
            const B = 26;
            const X = (t) => L + (t / T) * (w - L - 10);
            const Y = (y) => 10 + (1 - (y + 0.2) / 2) * (h - B - 10);
            ctx.fillStyle = rgba(C.c, 0.07);
            ctx.fillRect(L, Y(1.02), w - L - 10, Y(0.98) - Y(1.02));
            ctx.strokeStyle = C.line;
            ctx.lineWidth = 1;
            ctx.font = "11px Consolas, monospace";
            ctx.fillStyle = C.dim;
            [0, 0.5, 1, 1.5].forEach((v) => { ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(w - 10, Y(v)); ctx.stroke(); ctx.fillText(v.toFixed(1), 6, Y(v) + 4); });
            for (let t = 0; t <= T; t += 2) ctx.fillText(`${t}s`, X(t) - 6, h - 8);
            ctx.setLineDash([6, 5]);
            ctx.strokeStyle = C.warn;
            ctx.beginPath();
            ctx.moveTo(L, Y(1));
            ctx.lineTo(w - 10, Y(1));
            ctx.stroke();
            ctx.setLineDash([]);
            const upto = Math.floor(res.ys.length * reveal);
            ctx.save();
            ctx.beginPath();
            ctx.rect(L, 0, w - L, h - B);
            ctx.clip();
            ctx.strokeStyle = rgba(C.muted, 0.35) || C.muted;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < upto; i += 6) { const yy = Y(res.us[i] / 10 + 0); if (i) ctx.lineTo(X(i * dt), yy); else ctx.moveTo(X(0), yy); }
            ctx.stroke();
            ctx.strokeStyle = C.c;
            ctx.lineWidth = 2.6;
            ctx.shadowColor = C.c;
            ctx.shadowBlur = 3;
            ctx.beginPath();
            for (let i = 0; i < upto; i += 3) { const yy = Y(res.ys[i]); if (i) ctx.lineTo(X(i * dt), yy); else ctx.moveTo(X(0), yy); }
            ctx.stroke();
            ctx.restore();
            if (upto > 0) {
                const i = upto - 1;
                ctx.fillStyle = C.c;
                ctx.beginPath();
                ctx.arc(X(i * dt), clamp(Y(res.ys[i]), 0, h - B), 5, 0, 7);
                ctx.fill();
            }
            ctx.fillStyle = C.muted;
            ctx.fillText("— 출력 y   - - 목표   ─ 제어입력 u/10", L + 8, 18);
        };
        const run = () => {
            res = sim();
            cv.draw();
            out([
                ["오버슈트", res.blow ? "발산" : `${Math.max(0, (res.peak - 1) * 100).toFixed(1)}%`, res.blow || res.peak > 1.2 ? "bad" : "good"],
                ["정착시간(2%)", res.blow ? "-" : `${res.settle.toFixed(2)}s`],
                ["정상상태 오차", res.blow ? "-" : res.err.toFixed(3), Math.abs(res.err) > 0.02 ? "bad" : "good"]
            ]);
        };
        const sk = slider(bar, "Kp", 0, 10, 0.1, g.kp, (v) => v.toFixed(1), (v) => { g.kp = v; run(); });
        const si = slider(bar, "Ki", 0, 5, 0.05, g.ki, (v) => v.toFixed(2), (v) => { g.ki = v; run(); });
        const sd = slider(bar, "Kd", 0, 3, 0.05, g.kd, (v) => v.toFixed(2), (v) => { g.kd = v; run(); });
        const preset = (kp, ki, kd) => { g.kp = kp; g.ki = ki; g.kd = kd; sk.set(kp); si.set(ki); sd.set(kd); run(); };
        button(bar, "P만", () => preset(3, 0, 0));
        button(bar, "PI", () => preset(2, 1.2, 0));
        button(bar, "PID", () => preset(4, 1.5, 1.6));
        button(bar, "Ki 과다", () => preset(1, 4.5, 0));
        cv.fit();
        run();
        onVisible(host, () => {
            if (rm()) return;
            const t0 = performance.now();
            const f = (t) => { reveal = Math.min(1, (t - t0) / 1400); cv.draw(); if (reveal < 1) requestAnimationFrame(f); };
            requestAnimationFrame(f);
        });
    };

    // 1D Kalman filter on a noisy signal
    SIMS.kalman = (host, spec) => {
        const st = stage(host);
        const cv = canvas(st, 260);
        const bar = ctlBar(host);
        const out = readout(host);
        const N = 170;
        let seed = 7;
        let q = spec.q ?? 0.002;
        let r = spec.r ?? 0.12;
        let data = null;
        const gen = () => {
            const rr = rng(seed);
            const truth = [];
            const meas = [];
            for (let k = 0; k < N; k++) {
                const x = Math.sin(k / 20) * 1.1 + (k > 100 ? 0.9 : 0);
                truth.push(x);
                meas.push(x + gauss(rr) * 0.35);
            }
            data = { truth, meas };
        };
        let est = [];
        let K = 0;
        const run = () => {
            let x = 0;
            let P = 1;
            est = data.meas.map((z) => { P += q; K = P / (P + r); x += K * (z - x); P *= 1 - K; return x; });
            const rmse = (a) => Math.sqrt(a.reduce((s, v, i) => s + (v - data.truth[i]) ** 2, 0) / N);
            out([["측정 RMSE", rmse(data.meas).toFixed(3), "bad"], ["필터 RMSE", rmse(est).toFixed(3), "good"], ["칼만 이득 K", K.toFixed(3)]]);
            cv.draw();
        };
        cv.draw = () => {
            if (!data) return;
            const { ctx, w, h } = cv;
            const C = vars(host);
            ctx.clearRect(0, 0, w, h);
            const X = (k) => 10 + (k / (N - 1)) * (w - 20);
            const Y = (v) => h / 2 - v * (h / 5.2) + 10;
            ctx.fillStyle = rgba(C.muted, 0.55) || C.muted;
            data.meas.forEach((z, k) => { ctx.beginPath(); ctx.arc(X(k), Y(z), 2.2, 0, 7); ctx.fill(); });
            const line = (arr, col, lw, dash) => {
                ctx.strokeStyle = col;
                ctx.lineWidth = lw;
                ctx.setLineDash(dash || []);
                ctx.beginPath();
                arr.forEach((v, k) => (k ? ctx.lineTo(X(k), Y(v)) : ctx.moveTo(X(k), Y(v))));
                ctx.stroke();
                ctx.setLineDash([]);
            };
            line(data.truth, C.text, 1.4, [5, 5]);
            ctx.shadowColor = C.c;
            ctx.shadowBlur = 3;
            line(est, C.c, 2.6);
            ctx.shadowBlur = 0;
            ctx.font = "11px Consolas, monospace";
            ctx.fillStyle = C.muted;
            ctx.fillText("· 측정   - - 실제   — 추정", 14, 18);
        };
        slider(bar, "Q (모델 신뢰↓)", -4, 0, 0.05, Math.log10(q), (v) => (10 ** v).toExponential(1), (v) => { q = 10 ** v; run(); });
        slider(bar, "R (측정 노이즈)", -2, 0.5, 0.05, Math.log10(r), (v) => (10 ** v).toFixed(3), (v) => { r = 10 ** v; run(); });
        button(bar, "새 노이즈", () => { seed++; gen(); run(); });
        gen();
        cv.fit();
        run();
    };

    // 2-link planar arm: drag the target (IK) or move the joint sliders (FK)
    SIMS.arm = (host, spec) => {
        const st = stage(host);
        const cv = canvas(st, 310);
        const bar = ctlBar(host);
        const out = readout(host);
        const L1 = spec.l1 ?? 1;
        const L2 = spec.l2 ?? 0.75;
        let th1 = 0.9;
        let th2 = -0.9;
        let elbow = -1;
        let target = { x: 1, y: 0.8 };
        let user = false;
        const trail = [];
        const geom = () => {
            const { w, h } = cv;
            const s = Math.min(w / 2 - 24, h - 50) / (L1 + L2);
            return { bx: w / 2, by: h - 26, s };
        };
        const fk = () => {
            const j = { x: L1 * Math.cos(th1), y: L1 * Math.sin(th1) };
            return { j, e: { x: j.x + L2 * Math.cos(th1 + th2), y: j.y + L2 * Math.sin(th1 + th2) } };
        };
        const ik = (x, y) => {
            const d2 = x * x + y * y;
            const c2 = clamp((d2 - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1);
            th2 = elbow * Math.acos(c2);
            th1 = Math.atan2(y, x) - Math.atan2(L2 * Math.sin(th2), L1 + L2 * Math.cos(th2));
        };
        const deg = (r) => ((r * 180) / Math.PI);
        let s1;
        let s2;
        const sync = () => {
            const { e } = fk();
            s1.set(Math.round(deg(th1)));
            s2.set(Math.round(deg(th2)));
            const reach = Math.hypot(target.x, target.y) <= L1 + L2 && Math.hypot(target.x, target.y) >= Math.abs(L1 - L2);
            out([["θ1", `${deg(th1).toFixed(1)}°`], ["θ2", `${deg(th2).toFixed(1)}°`], ["끝점", `(${e.x.toFixed(2)}, ${e.y.toFixed(2)})`], ["도달", reach ? "가능" : "불가 · 최대 거리", reach ? "good" : "bad"]]);
        };
        cv.draw = () => {
            const { ctx, w, h } = cv;
            if (!w) return;
            const C = vars(host);
            const { bx, by, s } = geom();
            const P = (p) => [bx + p.x * s, by - p.y * s];
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = rgba(C.c, 0.06);
            ctx.beginPath();
            ctx.arc(bx, by, (L1 + L2) * s, 0, 7);
            ctx.arc(bx, by, Math.abs(L1 - L2) * s, 0, 7, true);
            ctx.fill();
            ctx.strokeStyle = C.line;
            ctx.beginPath();
            ctx.moveTo(10, by);
            ctx.lineTo(w - 10, by);
            ctx.stroke();
            ctx.lineWidth = 1;
            trail.forEach((p, i) => { ctx.fillStyle = rgba(C.c, (i / trail.length) * 0.5); const [x, y] = P(p); ctx.fillRect(x - 1.5, y - 1.5, 3, 3); });
            const { j, e } = fk();
            const [jx, jy] = P(j);
            const [ex, ey] = P(e);
            const [tx, ty] = P(target);
            ctx.strokeStyle = C.warn;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(tx - 9, ty); ctx.lineTo(tx + 9, ty); ctx.moveTo(tx, ty - 9); ctx.lineTo(tx, ty + 9);
            ctx.stroke();
            ctx.lineCap = "round";
            ctx.shadowColor = C.c;
            ctx.shadowBlur = 3;
            ctx.strokeStyle = C.c;
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(jx, jy);
            ctx.stroke();
            ctx.strokeStyle = rgba(C.c, 0.65);
            ctx.lineWidth = 9;
            ctx.beginPath();
            ctx.moveTo(jx, jy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.lineCap = "butt";
            [[bx, by, 9], [jx, jy, 7], [ex, ey, 6]].forEach(([x, y, r]) => { ctx.fillStyle = C.bg || "#000"; ctx.strokeStyle = C.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); });
            ctx.strokeStyle = C.warn;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(bx, by, 30, 0, -th1, th1 > 0);
            ctx.stroke();
            ctx.font = "12px Consolas, monospace";
            ctx.fillStyle = C.muted;
            ctx.fillText("θ1", bx + 34, by - 8);
            ctx.fillText("θ2", jx + 10, jy - 10);
            ctx.fillText(user ? "드래그: 목표 이동 (IK)" : "자동 데모 · 캔버스를 드래그해 보세요", 12, 20);
        };
        const fromEvent = (e) => {
            const r = cv.cv.getBoundingClientRect();
            const { bx, by, s } = geom();
            return { x: (e.clientX - r.left - bx) / s, y: (by - (e.clientY - r.top)) / s };
        };
        const moveTo = (p) => { target = p; ik(p.x, p.y); sync(); };
        cv.cv.addEventListener("pointerdown", (e) => { user = true; cv.cv.setPointerCapture(e.pointerId); moveTo(fromEvent(e)); });
        cv.cv.addEventListener("pointermove", (e) => { if (e.buttons) moveTo(fromEvent(e)); });
        s1 = slider(bar, "θ1", -180, 180, 1, 52, (v) => `${v}°`, (v) => { user = true; th1 = (v * Math.PI) / 180; target = fk().e; sync(); });
        s2 = slider(bar, "θ2", -180, 180, 1, -52, (v) => `${v}°`, (v) => { user = true; th2 = (v * Math.PI) / 180; target = fk().e; sync(); });
        seg(bar, "팔꿈치", [["-1", "위"], ["1", "아래"]], "-1", (v) => { elbow = +v; moveTo(target); });
        cv.fit();
        moveTo(target);
        animate(host, (dt, t) => {
            if (!user && !rm()) moveTo({ x: 1.05 * Math.cos(t * 0.6), y: 0.85 + 0.5 * Math.sin(t * 1.2) });
            trail.push(fk().e);
            if (trail.length > 70) trail.shift();
            cv.draw();
        });
    };

    // grid path finding: A* vs Dijkstra vs Greedy, paint walls by dragging
    SIMS.astar = (host) => {
        const COLS = 28;
        const ROWS = 14;
        const st = stage(host);
        const cv = canvas(st, (w) => Math.round((w / COLS) * ROWS));
        const bar = ctlBar(host);
        const out = readout(host);
        const walls = new Uint8Array(COLS * ROWS);
        const S = 2 + 7 * COLS;
        const G = 25 + 7 * COLS;
        for (let y = 2; y <= 11; y++) walls[14 + y * COLS] = 1;
        for (let x = 7; x <= 14; x++) walls[x + 11 * COLS] = 1;
        let mode = "astar";
        let res = null;
        let shown = 0;
        const search = () => {
            const n = COLS * ROWS;
            const g = new Float64Array(n).fill(Infinity);
            const f = new Float64Array(n).fill(Infinity);
            const came = new Int32Array(n).fill(-1);
            const closed = new Uint8Array(n);
            const hh = (i) => Math.abs((i % COLS) - (G % COLS)) + Math.abs(Math.floor(i / COLS) - Math.floor(G / COLS));
            const open = [S];
            g[S] = 0;
            f[S] = mode === "dij" ? 0 : hh(S);
            const order = [];
            while (open.length) {
                let bi = 0;
                for (let k = 1; k < open.length; k++) if (f[open[k]] < f[open[bi]]) bi = k;
                const i = open.splice(bi, 1)[0];
                if (closed[i]) continue;
                closed[i] = 1;
                order.push(i);
                if (i === G) break;
                const x = i % COLS;
                const y = Math.floor(i / COLS);
                [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return;
                    const j = nx + ny * COLS;
                    if (walls[j] || closed[j]) return;
                    const ng = g[i] + 1;
                    if (ng < g[j]) {
                        g[j] = ng;
                        came[j] = i;
                        f[j] = mode === "greedy" ? hh(j) : mode === "dij" ? ng : ng + hh(j);
                        open.push(j);
                    }
                });
            }
            const path = [];
            if (closed[G]) for (let c = G; c !== -1; c = came[c]) path.unshift(c);
            return { order, path };
        };
        cv.draw = () => {
            const { ctx, w, h } = cv;
            if (!w) return;
            const C = vars(host);
            const cs = w / COLS;
            ctx.clearRect(0, 0, w, h);
            ctx.strokeStyle = C.line;
            ctx.lineWidth = 0.5;
            for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * cs, 0); ctx.lineTo(x * cs, h); ctx.stroke(); }
            for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * cs); ctx.lineTo(w, y * cs); ctx.stroke(); }
            const cell = (i, col, pad = 1) => { ctx.fillStyle = col; ctx.fillRect((i % COLS) * cs + pad, Math.floor(i / COLS) * cs + pad, cs - pad * 2, cs - pad * 2); };
            if (res) {
                const k = Math.min(shown, res.order.length);
                for (let i = 0; i < k; i++) cell(res.order[i], rgba(C.c, 0.12 + 0.35 * (i / Math.max(1, res.order.length))));
                if (shown >= res.order.length) {
                    const pk = Math.min(res.path.length, Math.floor(shown - res.order.length));
                    ctx.shadowColor = C.warn;
                    ctx.shadowBlur = 3;
                    for (let i = 0; i < pk; i++) cell(res.path[i], C.warn, cs * 0.22);
                    ctx.shadowBlur = 0;
                }
            }
            walls.forEach((v, i) => v && cell(i, C.muted));
            cell(S, C.ok, 2);
            cell(G, C.bad, 2);
            ctx.fillStyle = "#04121a";
            ctx.font = `bold ${Math.round(cs * 0.5)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("S", (S % COLS) * cs + cs / 2, Math.floor(S / COLS) * cs + cs / 2);
            ctx.fillText("G", (G % COLS) * cs + cs / 2, Math.floor(G / COLS) * cs + cs / 2);
            ctx.textAlign = "start";
            ctx.textBaseline = "alphabetic";
        };
        const run = () => {
            res = search();
            shown = rm() ? 1e9 : 0;
            out([["확장한 노드", res.order.length, mode === "dij" ? "bad" : "good"], ["경로 길이", res.path.length ? res.path.length - 1 : "없음", res.path.length ? "" : "bad"]]);
        };
        let paint = null;
        const cellAt = (e) => {
            const r = cv.cv.getBoundingClientRect();
            const cs = cv.w / COLS;
            const x = Math.floor((e.clientX - r.left) / cs);
            const y = Math.floor((e.clientY - r.top) / cs);
            return x >= 0 && y >= 0 && x < COLS && y < ROWS ? x + y * COLS : -1;
        };
        cv.cv.addEventListener("pointerdown", (e) => {
            const i = cellAt(e);
            if (i < 0 || i === S || i === G) return;
            cv.cv.setPointerCapture(e.pointerId);
            paint = walls[i] ? 0 : 1;
            walls[i] = paint;
            res = null;
            cv.draw();
        });
        cv.cv.addEventListener("pointermove", (e) => {
            if (paint == null || !e.buttons) return;
            const i = cellAt(e);
            if (i >= 0 && i !== S && i !== G) { walls[i] = paint; cv.draw(); }
        });
        cv.cv.addEventListener("pointerup", () => { if (paint != null) { paint = null; run(); } });
        seg(bar, "", [["astar", "A*"], ["dij", "Dijkstra"], ["greedy", "Greedy"]], mode, (v) => { mode = v; run(); });
        button(bar, "▶ 탐색", run, true);
        button(bar, "벽 지우기", () => { walls.fill(0); run(); });
        button(bar, "랜덤 벽", () => {
            const r = rng(Date.now() & 0xffff);
            walls.forEach((_, i) => { walls[i] = i !== S && i !== G && r() < 0.28 ? 1 : 0; });
            run();
        });
        cv.fit();
        run();
        animate(host, () => {
            if (!res) return;
            const total = res.order.length + res.path.length + 1;
            if (shown < total) { shown += shown < res.order.length ? 3 : 0.6; cv.draw(); }
        });
    };

    // stack / heap stepper for a short program
    SIMS.memory = (host, spec) => {
        const st = stage(host, true);
        st.innerHTML = `<div class="mem"><div><h4>CODE</h4>${LAB.codeBox({ lang: spec.lang || "c", src: spec.code, title: spec.title || "" })}</div>
          <div><h4>STACK</h4><div class="stk"></div></div><div><h4>HEAP</h4><div class="hp"></div></div></div>`;
        const lines = [...st.querySelectorAll(".ln")];
        const stk = st.querySelector(".stk");
        const hp = st.querySelector(".hp");
        let prev = new Set();
        const show = (i) => {
            const s = spec.steps[i];
            lines.forEach((l, k) => l.classList.toggle("cur", k + 1 === s.line));
            const vals = (s.stack || []).flatMap((f) => f.vars.map((v) => String(v[1])));
            const seen = new Set();
            const cell = (scope, name, val, extra = "") => {
                const key = `${scope}:${name}=${val}`;
                seen.add(key);
                return `<div class="cell ${extra} ${prev.has(key) ? "" : "new"}"><span>${esc(name)}</span><b>${esc(val)}</b></div>`;
            };
            stk.innerHTML = (s.stack || []).map((f) => `<div class="frame"><b>${esc(f.fn)}()</b>${f.vars.map(([n, v]) => cell(f.fn, n, v)).join("")}</div>`).join("") || `<div class="empty">비어 있음</div>`;
            hp.innerHTML = (s.heap || []).length ? `<div class="frame"><b>heap</b>${s.heap.map(([a, v]) => cell("heap", a, v, `${/^(freed|✗)/.test(String(v)) ? "free" : ""} ${vals.some((x) => x.includes(a)) ? "hot" : ""}`)).join("")}</div>` : `<div class="empty">비어 있음</div>`;
            prev = seen;
            return s.text;
        };
        stepper(host, spec.steps.length, show, { interval: spec.interval || 2600 });
    };

    // RTOS scheduling timeline: preemptive priority vs cooperative vs round-robin
    SIMS.sched = (host, spec) => {
        const tasks = (spec.tasks || [
            { name: "Sensor", prio: 3, period: 5, wcet: 1 },
            { name: "Control", prio: 2, period: 10, wcet: 3 },
            { name: "Logger", prio: 1, period: 20, wcet: 7 }
        ]).map((t, i) => ({ ...t, col: PALETTE[i % PALETTE.length] }));
        const H = spec.horizon || 40;
        const st = stage(host);
        const cv = canvas(st, 60 + tasks.length * 40 + 30);
        const bar = ctlBar(host);
        const out = readout(host);
        let mode = "prio";
        let res = null;
        let head = rm() ? H : 0;
        const simulate = () => {
            const tl = [];
            const misses = [];
            const rel = [];
            let ready = [];
            let cur = null;
            let slice = 0;
            let sw = 0;
            for (let t = 0; t < H; t++) {
                ready = ready.filter((j) => {
                    if (j.dl <= t && j.rem > 0) { misses.push({ ti: j.ti, t: j.dl }); if (cur === j) cur = null; return false; }
                    return true;
                });
                tasks.forEach((tk, ti) => {
                    if (t % tk.period === 0) { const j = { ti, rem: tk.wcet, dl: t + tk.period, rel: t }; ready.push(j); rel.push({ ti, t }); }
                });
                let pick = null;
                if (mode === "prio") pick = ready.slice().sort((a, b) => tasks[b.ti].prio - tasks[a.ti].prio || a.rel - b.rel)[0];
                else if (mode === "coop") pick = cur && cur.rem > 0 ? cur : ready.slice().sort((a, b) => tasks[b.ti].prio - tasks[a.ti].prio || a.rel - b.rel)[0];
                else {
                    if (cur && cur.rem > 0 && slice < 2) pick = cur;
                    else {
                        if (cur && cur.rem > 0) { ready.splice(ready.indexOf(cur), 1); ready.push(cur); }
                        pick = ready.find((j) => j !== cur) || (cur && cur.rem > 0 ? cur : null);
                        slice = 0;
                    }
                }
                if (pick && cur && pick !== cur && cur.rem > 0) sw++;
                if (pick !== cur) slice = 0;
                cur = pick;
                tl.push(pick ? pick.ti : -1);
                if (pick) {
                    pick.rem--;
                    slice++;
                    if (pick.rem === 0) { ready.splice(ready.indexOf(pick), 1); cur = null; slice = 0; }
                }
            }
            ready.forEach((j) => { if (j.dl <= H && j.rem > 0) misses.push({ ti: j.ti, t: j.dl }); });
            return { tl, misses, rel, sw };
        };
        cv.draw = () => {
            if (!res) return;
            const { ctx, w, h } = cv;
            const C = vars(host);
            ctx.clearRect(0, 0, w, h);
            const L = 86;
            const X = (t) => L + (t / H) * (w - L - 12);
            const rowY = (i) => 34 + i * 40;
            ctx.font = "12px Consolas, monospace";
            tasks.forEach((tk, i) => {
                ctx.fillStyle = C.muted;
                ctx.fillText(`${tk.name} P${tk.prio}`, 6, rowY(i) + 20);
                ctx.strokeStyle = C.line;
                ctx.beginPath();
                ctx.moveTo(L, rowY(i) + 30);
                ctx.lineTo(w - 12, rowY(i) + 30);
                ctx.stroke();
            });
            for (let t = 0; t <= H; t += 5) { ctx.fillStyle = C.dim; ctx.fillText(t, X(t) - 4, h - 8); ctx.strokeStyle = C.line; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(X(t), 24); ctx.lineTo(X(t), h - 22); ctx.stroke(); ctx.setLineDash([]); }
            const upto = Math.floor(head);
            for (let t = 0; t < Math.min(upto, H); t++) {
                const ti = res.tl[t];
                if (ti < 0) continue;
                ctx.fillStyle = tasks[ti].col;
                ctx.shadowColor = tasks[ti].col;
                ctx.shadowBlur = 3;
                ctx.fillRect(X(t) + 0.5, rowY(ti) + 8, X(t + 1) - X(t) - 1, 22);
                ctx.shadowBlur = 0;
            }
            res.rel.forEach((r) => {
                if (r.t > upto) return;
                ctx.fillStyle = tasks[r.ti].col;
                const x = X(r.t);
                const y = rowY(r.ti) + 4;
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 7); ctx.lineTo(x + 4, y + 7); ctx.fill();
            });
            ctx.font = "bold 16px sans-serif";
            res.misses.forEach((m) => { if (m.t <= upto) { ctx.fillStyle = C.bad; ctx.fillText("✕", X(m.t) - 6, rowY(m.ti) + 26); } });
            ctx.strokeStyle = C.warn;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(X(Math.min(head, H)), 20);
            ctx.lineTo(X(Math.min(head, H)), h - 22);
            ctx.stroke();
            ctx.lineWidth = 1;
            ctx.font = "11px Consolas, monospace";
            ctx.fillStyle = C.muted;
            ctx.fillText("▲ 릴리스   ✕ 마감 놓침", L, 14);
        };
        const run = () => {
            res = simulate();
            head = rm() ? H : 0;
            const U = tasks.reduce((s, t) => s + t.wcet / t.period, 0);
            const n = tasks.length;
            out([
                ["CPU 사용률", `${(U * 100).toFixed(0)}%`, U > 1 ? "bad" : ""],
                ["RMS 한계", `${(n * (2 ** (1 / n) - 1) * 100).toFixed(0)}%`],
                ["마감 놓침", res.misses.length, res.misses.length ? "bad" : "good"],
                ["선점 횟수", res.sw]
            ]);
            cv.draw();
        };
        seg(bar, "", [["prio", "선점 우선순위"], ["coop", "비선점"], ["rr", "라운드로빈"]], mode, (v) => { mode = v; run(); });
        const lt = tasks[tasks.length - 1];
        slider(bar, `${lt.name} 실행시간`, 1, lt.period, 1, lt.wcet, (v) => `${v} tick`, (v) => { lt.wcet = v; run(); });
        button(bar, "▶ 다시", run, true);
        cv.fit();
        run();
        animate(host, (dt) => { if (head < H) { head = Math.min(H, head + dt * 12); cv.draw(); } });
    };

    // tiny MLP (2-3-1) solving XOR + its decision map
    SIMS.nn = (host) => {
        const st = stage(host);
        const cv = canvas(st, (w) => (w > 600 ? 300 : 520));
        const bar = ctlBar(host);
        const out = readout(host);
        const W1 = [[20, 20], [-20, -20], [5, -5]];
        const B1 = [-10, 30, 0];
        const W2 = [20, 20, 0.5];
        const B2 = -30;
        const ACT = {
            sigmoid: (z) => 1 / (1 + Math.exp(-z)),
            tanh: Math.tanh,
            relu: (z) => Math.max(0, z)
        };
        let act = "sigmoid";
        let x = [1, 0];
        let map = null;
        const fwd = (a, b) => {
            const hdn = W1.map((wr, i) => ACT[act](wr[0] * a + wr[1] * b + B1[i]));
            const o = ACT.sigmoid(hdn.reduce((s, v, i) => s + v * W2[i], B2));
            return { hdn, o };
        };
        const buildMap = () => {
            const n = 48;
            map = document.createElement("canvas");
            map.width = map.height = n;
            const m = map.getContext("2d");
            const img = m.createImageData(n, n);
            const C = vars(host);
            const hex = (C.c || "#22d3ee").replace("#", "");
            const cr = parseInt(hex.slice(0, 2), 16);
            const cg = parseInt(hex.slice(2, 4), 16);
            const cb = parseInt(hex.slice(4, 6), 16);
            for (let j = 0; j < n; j++) {
                for (let i = 0; i < n; i++) {
                    const o = fwd(i / (n - 1), 1 - j / (n - 1)).o;
                    const k = (j * n + i) * 4;
                    img.data[k] = cr * o + 40 * (1 - o);
                    img.data[k + 1] = cg * o + 50 * (1 - o);
                    img.data[k + 2] = cb * o + 80 * (1 - o);
                    img.data[k + 3] = 200;
                }
            }
            m.putImageData(img, 0, 0);
        };
        let t0 = 0;
        cv.draw = (time = 0) => {
            const { ctx, w, h } = cv;
            if (!w) return;
            const C = vars(host);
            ctx.clearRect(0, 0, w, h);
            const wide = w > 600;
            const NW = wide ? w - 290 : w;
            const NH = wide ? h : 280;
            const lx = [NW * 0.14, NW * 0.5, NW * 0.86];
            const pos = [[0.33, 0.67], [0.2, 0.5, 0.8], [0.5]].map((ys, li) => ys.map((y) => [lx[li], 20 + y * (NH - 40)]));
            const { hdn, o } = fwd(x[0], x[1]);
            const vals = [x, hdn, [o]];
            const norm = (v, li) => (li === 1 && act === "relu" ? clamp(v / 30, 0, 1) : li === 1 && act === "tanh" ? (v + 1) / 2 : clamp(v, 0, 1));
            const edge = (a, b, wgt, srcAct, li) => {
                ctx.strokeStyle = wgt >= 0 ? rgba(C.c, 0.55) : rgba(C.bad, 0.5) || C.bad;
                ctx.lineWidth = clamp(Math.abs(wgt) / 4, 0.6, 6);
                ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
                if (rm()) return;
                const ph = ((time * 0.6 + li * 0.5) % 1);
                const px = a[0] + (b[0] - a[0]) * ph;
                const py = a[1] + (b[1] - a[1]) * ph;
                ctx.fillStyle = C.warn;
                ctx.globalAlpha = clamp(srcAct, 0.08, 1);
                ctx.beginPath(); ctx.arc(px, py, 3.2, 0, 7); ctx.fill();
                ctx.globalAlpha = 1;
            };
            pos[0].forEach((a, i) => pos[1].forEach((b, j) => edge(a, b, W1[j][i], norm(x[i], 0), 0)));
            pos[1].forEach((a, i) => edge(a, pos[2][0], W2[i], norm(hdn[i], 1), 1));
            ctx.font = "12px Consolas, monospace";
            ctx.textAlign = "center";
            pos.forEach((layer, li) => layer.forEach((p, i) => {
                const v = vals[li][i];
                const a = norm(v, li);
                ctx.fillStyle = C.bg || "#000";
                ctx.beginPath(); ctx.arc(p[0], p[1], 24, 0, 7); ctx.fill();
                ctx.fillStyle = rgba(C.c, 0.15 + a * 0.85);
                ctx.shadowColor = C.c;
                ctx.shadowBlur = a * 6;
                ctx.beginPath(); ctx.arc(p[0], p[1], 22, 0, 7); ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = C.line;
                ctx.stroke();
                ctx.fillStyle = a > 0.55 ? "#04121a" : C.text;
                ctx.fillText(v.toFixed(2), p[0], p[1] + 4);
            }));
            ctx.fillStyle = C.muted;
            ["입력", "은닉 (" + act + ")", "출력 σ"].forEach((t, i) => ctx.fillText(t, lx[i], NH - 2));
            ctx.textAlign = "start";
            if (!map) buildMap();
            const ms = wide ? 230 : Math.min(w - 40, 200);
            const mx = wide ? w - ms - 30 : (w - ms) / 2;
            const my = wide ? (h - ms) / 2 : NH + 20;
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(map, mx, my, ms, ms);
            ctx.strokeStyle = C.line;
            ctx.strokeRect(mx, my, ms, ms);
            ctx.strokeStyle = C.warn;
            ctx.lineWidth = 2;
            const px = mx + x[0] * ms;
            const py = my + (1 - x[1]) * ms;
            ctx.beginPath(); ctx.arc(px, py, 7, 0, 7); ctx.stroke();
            ctx.lineWidth = 1;
            ctx.fillStyle = C.muted;
            ctx.fillText("x1 →", mx + ms - 30, my + ms + 14);
            ctx.fillText("x2 ↑", mx - 28, my + 10);
            ctx.fillText("출력 지도 (밝을수록 1)", mx, my - 8);
        };
        const update = () => {
            const { hdn, o } = fwd(x[0], x[1]);
            out([["h", hdn.map((v) => v.toFixed(2)).join(", ")], ["출력", o.toFixed(3)], ["판정", o > 0.5 ? "1" : "0", "good"]]);
            cv.draw(t0);
        };
        const s1 = slider(bar, "x1", 0, 1, 0.01, x[0], (v) => v.toFixed(2), (v) => { x[0] = v; update(); });
        const s2 = slider(bar, "x2", 0, 1, 0.01, x[1], (v) => v.toFixed(2), (v) => { x[1] = v; update(); });
        seg(bar, "활성함수", [["sigmoid", "Sigmoid"], ["tanh", "tanh"], ["relu", "ReLU"]], act, (v) => { act = v; map = null; update(); });
        [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(([a, b]) => button(bar, `(${a},${b})`, () => { x = [a, b]; s1.set(a); s2.set(b); update(); }));
        cv.fit();
        update();
        animate(host, (dt, t) => { t0 = t; cv.draw(t); });
    };

    // gradient descent race on an ill-conditioned bowl: SGD vs Momentum vs Adam
    SIMS.gd = (host) => {
        const st = stage(host);
        const cv = canvas(st, (w) => Math.round(clamp(w / 2, 200, 340)));
        const bar = ctlBar(host);
        const out = readout(host);
        const f = (x, y) => 0.1 * x * x + 2 * y * y;
        const grad = (x, y) => [0.2 * x, 4 * y];
        const XR = 6;
        const YR = 3;
        let lr = 0.2;
        let noise = false;
        let start = [-5.4, 2.4];
        const OPT = [["SGD", "#fbbf24"], ["Momentum", "#34d399"], ["Adam", "#f472b6"]];
        let paths = [];
        let shown = 0;
        let bg = null;
        const run = () => {
            const r = rng(42);
            paths = OPT.map(([name]) => {
                let [x, y] = start;
                let vx = 0;
                let vy = 0;
                let m = [0, 0];
                let v = [0, 0];
                const pts = [[x, y]];
                for (let k = 1; k <= 140; k++) {
                    let [gx, gy] = grad(x, y);
                    if (noise) { gx += gauss(r) * 0.4; gy += gauss(r) * 0.8; }
                    if (name === "SGD") { x -= lr * gx; y -= lr * gy; }
                    else if (name === "Momentum") { vx = 0.9 * vx + gx; vy = 0.9 * vy + gy; x -= lr * vx; y -= lr * vy; }
                    else {
                        m = [0.9 * m[0] + 0.1 * gx, 0.9 * m[1] + 0.1 * gy];
                        v = [0.999 * v[0] + 0.001 * gx * gx, 0.999 * v[1] + 0.001 * gy * gy];
                        const mh = [m[0] / (1 - 0.9 ** k), m[1] / (1 - 0.9 ** k)];
                        const vh = [v[0] / (1 - 0.999 ** k), v[1] / (1 - 0.999 ** k)];
                        x -= (lr * mh[0]) / (Math.sqrt(vh[0]) + 1e-8);
                        y -= (lr * mh[1]) / (Math.sqrt(vh[1]) + 1e-8);
                    }
                    if (!isFinite(x) || !isFinite(y) || Math.abs(x) > 1e3 || Math.abs(y) > 1e3) break;
                    pts.push([x, y]);
                }
                return pts;
            });
            shown = rm() ? 999 : 0;
            out(OPT.map(([name], i) => {
                const p = paths[i][paths[i].length - 1];
                const loss = f(p[0], p[1]);
                const k = paths[i].findIndex((q) => f(q[0], q[1]) < 0.01);
                return [name, `${isFinite(loss) && loss < 1e4 ? loss.toFixed(4) : "발산"}${k > 0 ? ` · ${k}스텝` : ""}`, loss < 0.01 ? "good" : loss > 5 ? "bad" : ""];
            }));
        };
        const buildBg = () => {
            const n = 4;
            const W = Math.ceil(cv.w / n);
            const H = Math.ceil(cv.h / n);
            bg = document.createElement("canvas");
            bg.width = W;
            bg.height = H;
            const m = bg.getContext("2d");
            const img = m.createImageData(W, H);
            const C = vars(host);
            const hex = (C.c || "#22d3ee").replace("#", "");
            const c = [0, 2, 4].map((k) => parseInt(hex.slice(k, k + 2), 16));
            for (let j = 0; j < H; j++) {
                for (let i = 0; i < W; i++) {
                    const x = (i / W) * 2 * XR - XR;
                    const y = YR - (j / H) * 2 * YR;
                    const lv = Math.log(f(x, y) + 0.02);
                    const band = Math.abs(((lv * 2.2) % 1 + 1) % 1 - 0.5) < 0.06;
                    const a = clamp(1 - (lv + 4) / 7, 0, 1);
                    const k = (j * W + i) * 4;
                    img.data[k] = c[0];
                    img.data[k + 1] = c[1];
                    img.data[k + 2] = c[2];
                    img.data[k + 3] = band ? 110 : a * 60;
                }
            }
            m.putImageData(img, 0, 0);
        };
        cv.draw = () => {
            const { ctx, w, h } = cv;
            if (!w) return;
            if (!bg || bg.width !== Math.ceil(w / 4)) buildBg();
            ctx.clearRect(0, 0, w, h);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(bg, 0, 0, w, h);
            const P = ([x, y]) => [((x + XR) / (2 * XR)) * w, ((YR - y) / (2 * YR)) * h];
            const C = vars(host);
            ctx.fillStyle = C.text;
            const [ox, oy] = P([0, 0]);
            ctx.font = "bold 14px sans-serif";
            ctx.fillText("★", ox - 6, oy + 5);
            paths.forEach((pts, i) => {
                const col = OPT[i][1];
                const k = Math.min(pts.length, Math.floor(shown) + 1);
                ctx.strokeStyle = col;
                ctx.lineWidth = 2;
                ctx.shadowColor = col;
                ctx.shadowBlur = 3;
                ctx.beginPath();
                for (let j = 0; j < k; j++) { const [x, y] = P(pts[j]); if (j) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
                ctx.stroke();
                ctx.shadowBlur = 0;
                const [x, y] = P(pts[k - 1]);
                ctx.fillStyle = col;
                ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill();
            });
            ctx.font = "11px Consolas, monospace";
            OPT.forEach(([name, col], i) => { ctx.fillStyle = col; ctx.fillText(`● ${name}`, 10 + i * 100, 18); });
            ctx.fillStyle = C.muted;
            ctx.fillText("클릭: 시작점 이동", w - 120, h - 10);
        };
        cv.cv.addEventListener("pointerdown", (e) => {
            const r = cv.cv.getBoundingClientRect();
            start = [((e.clientX - r.left) / cv.w) * 2 * XR - XR, YR - ((e.clientY - r.top) / cv.h) * 2 * YR];
            run();
        });
        slider(bar, "학습률 lr", 0.01, 0.6, 0.01, lr, (v) => v.toFixed(2), (v) => { lr = v; run(); });
        seg(bar, "미니배치 노이즈", [["0", "끔"], ["1", "켬"]], "0", (v) => { noise = v === "1"; run(); });
        button(bar, "▶ 다시", run, true);
        addEventListener("lab:theme", () => { bg = null; });
        cv.fit();
        run();
        animate(host, () => { if (shown < 141) { shown += 1.2; cv.draw(); } });
    };

    // self-attention weights: click a token (query) to see where it looks
    SIMS.attention = (host, spec) => {
        const DEF = ["The", "robot", "picked", "up", "the", "ball", "because", "it", "was", "light"];
        const tokens = spec.tokens || DEF;
        const n = tokens.length;
        const links = spec.links || (spec.tokens ? [] : [[7, 5, 3.6], [7, 1, 1.6], [2, 1, 2.2], [2, 5, 1.8], [9, 5, 1.6], [9, 7, 1.2], [3, 2, 2.6], [5, 4, 1.4]]);
        let q = spec.query ?? (spec.tokens ? n - 1 : 7);
        let T = 1;
        let causal = false;
        const r = rng(11);
        const S = spec.weights || tokens.map((_, i) => tokens.map((__, j) => r() * 0.9 + (i === j ? 1.2 : 0) + (j === i - 1 ? 0.6 : 0)));
        if (!spec.weights) links.forEach(([i, j, b]) => { if (S[i]) S[i][j] += b; });
        const soft = (row, i) => {
            const z = row.map((s, j) => (causal && j > i ? -Infinity : s / T));
            const m = Math.max(...z);
            const e = z.map((v) => Math.exp(v - m));
            const sum = e.reduce((a, b) => a + b, 0);
            return e.map((v) => v / sum);
        };
        const st = stage(host);
        const bar = ctlBar(host);
        const ws = tokens.map((t) => Math.max(46, String(t).length * 9 + 20));
        const gap = 10;
        const xs = [];
        ws.reduce((x, w, i) => { xs.push(x + w / 2); return x + w + gap; }, 10);
        const vw = xs[n - 1] + ws[n - 1] / 2 + 10;
        const draw = () => {
            const A = tokens.map((_, i) => soft(S[i], i));
            const row = A[q];
            const base = 170;
            const arcs = row.map((wgt, j) => {
                if (wgt < 0.01) return "";
                const x1 = xs[q];
                const x2 = xs[j];
                const lift = j === q ? 40 : Math.min(140, 30 + Math.abs(x2 - x1) * 0.32); // peak stays inside the 220px viewBox
                const d = j === q ? `M${x1 - 10},${base - 22} C${x1 - 30},${base - 22 - lift} ${x1 + 30},${base - 22 - lift} ${x1 + 10},${base - 22}` : `M${x1},${base - 22} Q${(x1 + x2) / 2},${base - 22 - lift * 2} ${x2},${base - 22}`;
                return `<path d="${d}" style="fill:none;stroke:var(--c);opacity:${0.15 + wgt * 0.85};stroke-width:${1 + wgt * 9};stroke-linecap:round"/>`;
            }).join("");
            const boxes = tokens.map((t, j) => `<g data-j="${j}" style="cursor:pointer">
                <rect x="${xs[j] - ws[j] / 2}" y="${base - 20}" width="${ws[j]}" height="34" rx="9" style="fill:${j === q ? "var(--c)" : `color-mix(in srgb, var(--c) ${Math.round(row[j] * 90)}%, var(--bg2))`};stroke:${j === q ? "var(--c)" : "var(--line2)"}"/>
                <text x="${xs[j]}" y="${base - 3}" style="fill:${j === q || row[j] > 0.45 ? "#04121a" : "var(--text)"};font:600 13px var(--font);text-anchor:middle;dominant-baseline:middle">${esc(t)}</text>
                <text x="${xs[j]}" y="${base + 32}" style="fill:var(--muted);font:11px var(--mono);text-anchor:middle">${(row[j] * 100).toFixed(0)}%</text></g>`).join("");
            const cs = Math.min(30, Math.floor(560 / n));
            const grid = `<div style="display:grid;grid-template-columns:repeat(${n}, ${cs}px);gap:2px;margin:14px auto 0;width:max-content">${A.map((rw, i) => rw.map((v, j) => `<i data-q="${i}" title="${esc(tokens[i])} → ${esc(tokens[j])} ${(v * 100).toFixed(1)}%" style="height:${cs}px;border-radius:3px;cursor:pointer;background:color-mix(in srgb, var(--c) ${Math.round(Math.sqrt(v) * 100)}%, var(--surf2));${i === q ? "outline:2px solid var(--warn)" : ""}"></i>`).join("")).join("")}</div>
              <p class="muted" style="text-align:center;font-size:12px;margin:6px 0 0">행 = Query, 열 = Key · 행을 클릭해도 선택</p>`;
            st.innerHTML = `<svg viewBox="0 0 ${vw} 220" style="min-width:${Math.min(vw, 600)}px">${arcs}${boxes}</svg>${grid}`;
        };
        st.addEventListener("click", (e) => {
            const g = e.target.closest("[data-j],[data-q]");
            if (!g) return;
            q = +(g.dataset.j ?? g.dataset.q);
            draw();
        });
        slider(bar, "온도 T", 0.2, 3, 0.05, T, (v) => v.toFixed(2), (v) => { T = v; draw(); });
        seg(bar, "마스크", [["0", "양방향 (인코더)"], ["1", "인과 (디코더)"]], "0", (v) => { causal = v === "1"; draw(); });
        draw();
    };

    // PWM: duty / frequency → waveform, LED, timer registers
    SIMS.pwm = (host, spec) => {
        const st = stage(host);
        const cv = canvas(st, 200);
        const bar = ctlBar(host);
        const out = readout(host);
        const FREQS = [1, 2, 5, 10, 25, 50, 100, 500, 1000, 5000, 20000];
        const FCLK = spec.fclk || 72e6;
        let duty = 30;
        let fi = 8;
        let phase = 0;
        const regs = () => {
            const f = FREQS[fi];
            const psc = Math.max(0, Math.ceil(FCLK / (f * 65536)) - 1);
            const arr = Math.round(FCLK / ((psc + 1) * f)) - 1;
            const ccr = Math.round((duty / 100) * (arr + 1));
            out([["PSC", psc], ["ARR", arr], ["CCR", ccr], ["분해능", `${Math.log2(arr + 1).toFixed(1)} bit`], ["평균 전압", `${((duty / 100) * 3.3).toFixed(2)} V`, "good"]]);
        };
        cv.draw = () => {
            const { ctx, w, h } = cv;
            if (!w) return;
            const C = vars(host);
            ctx.clearRect(0, 0, w, h);
            const ww = w - 150;
            const hi = 40;
            const lo = h - 40;
            const P = 4;
            ctx.strokeStyle = C.line;
            ctx.strokeRect(10, 20, ww - 10, h - 40);
            ctx.save();
            ctx.beginPath();
            ctx.rect(10, 20, ww - 10, h - 40);
            ctx.clip();
            ctx.strokeStyle = C.c;
            ctx.lineWidth = 2.4;
            ctx.shadowColor = C.c;
            ctx.shadowBlur = 3;
            ctx.beginPath();
            const pw = (ww - 10) / P;
            for (let k = -1; k <= P + 1; k++) {
                const x0 = 10 + (k - (phase % 1)) * pw;
                const xd = x0 + (pw * duty) / 100;
                if (k === -1) ctx.moveTo(x0, lo);
                ctx.lineTo(x0, lo);
                if (duty > 0) { ctx.lineTo(x0, hi); ctx.lineTo(xd, hi); ctx.lineTo(xd, lo); }
                ctx.lineTo(x0 + pw, lo);
            }
            ctx.stroke();
            ctx.restore();
            const avg = lo - ((lo - hi) * duty) / 100;
            ctx.setLineDash([6, 5]);
            ctx.strokeStyle = C.warn;
            ctx.beginPath(); ctx.moveTo(10, avg); ctx.lineTo(ww, avg); ctx.stroke();
            ctx.setLineDash([]);
            ctx.font = "11px Consolas, monospace";
            ctx.fillStyle = C.warn;
            ctx.fillText(`평균 ${((duty / 100) * 3.3).toFixed(2)}V`, 16, avg - 6);
            const f = FREQS[fi];
            const on = f < 30 ? (phase % 1) < duty / 100 : true;
            const b = f < 30 ? (on ? 1 : 0) : duty / 100;
            const lx = w - 70;
            const ly = h / 2;
            const g = ctx.createRadialGradient(lx, ly, 4, lx, ly, 70);
            g.addColorStop(0, rgba(C.c, 0.9 * b));
            g.addColorStop(1, rgba(C.c, 0));
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(lx, ly, 70, 0, 7); ctx.fill();
            ctx.fillStyle = b > 0.02 ? rgba(C.c, 0.25 + 0.75 * b) : C.line;
            ctx.beginPath(); ctx.arc(lx, ly, 22, 0, 7); ctx.fill();
            ctx.fillStyle = C.muted;
            ctx.fillText(f < 30 ? "깜빡임 보임" : "잔상 → 밝기", lx - 38, h - 12);
        };
        slider(bar, "듀티", 0, 100, 1, duty, (v) => `${v}%`, (v) => { duty = v; regs(); cv.draw(); });
        slider(bar, "주파수", 0, FREQS.length - 1, 1, fi, (v) => (FREQS[v] >= 1000 ? `${FREQS[v] / 1000}kHz` : `${FREQS[v]}Hz`), (v) => { fi = v; regs(); });
        cv.fit();
        regs();
        animate(host, (dt) => { const f = FREQS[fi]; phase += f < 30 ? f * dt : dt * 0.6; cv.draw(); });
    };

    // ADC: resolution + sampling rate → quantization and aliasing
    SIMS.adc = (host) => {
        const st = stage(host);
        const cv = canvas(st, 260);
        const bar = ctlBar(host);
        const out = readout(host);
        let bits = 3;
        let ratio = 12;
        const sig = (t) => Math.sin(2 * Math.PI * t) * 0.9;
        const calc = () => {
            const lv = 2 ** bits;
            out([["레벨", lv], ["LSB", `${((3.3 / lv) * 1000).toFixed(1)} mV`], ["SQNR", `${(6.02 * bits + 1.76).toFixed(1)} dB`], ["나이퀴스트", ratio >= 2 ? "OK" : "위반 → 에일리어싱", ratio >= 2 ? "good" : "bad"]]);
        };
        cv.draw = () => {
            const { ctx, w, h } = cv;
            if (!w) return;
            const C = vars(host);
            ctx.clearRect(0, 0, w, h);
            const span = 2;
            const X = (t) => 10 + (t / span) * (w - 20);
            const Y = (v) => h / 2 - v * (h / 2 - 20);
            const lv = 2 ** bits;
            const q = (v) => {
                const k = clamp(Math.floor(((v + 1) / 2) * lv), 0, lv - 1);
                return ((k + 0.5) / lv) * 2 - 1;
            };
            if (bits <= 6) {
                ctx.strokeStyle = C.line;
                for (let k = 0; k <= lv; k++) { const y = Y((k / lv) * 2 - 1); ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(w - 10, y); ctx.stroke(); }
            }
            ctx.strokeStyle = C.muted;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            for (let i = 0; i <= 400; i++) { const t = (i / 400) * span; if (i) ctx.lineTo(X(t), Y(sig(t))); else ctx.moveTo(X(t), Y(sig(t))); }
            ctx.stroke();
            ctx.globalAlpha = 1;
            const fs = ratio;
            const n = Math.floor(span * fs);
            const pts = [];
            for (let k = 0; k <= n; k++) pts.push([k / fs, q(sig(k / fs))]);
            ctx.strokeStyle = C.c;
            ctx.lineWidth = 2.2;
            ctx.shadowColor = C.c;
            ctx.shadowBlur = 3;
            ctx.beginPath();
            pts.forEach(([t, v], k) => { const x = X(t); const y = Y(v); if (k) ctx.lineTo(x, Y(pts[k - 1][1])); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
            if (pts.length) ctx.lineTo(X(span), Y(pts[pts.length - 1][1]));
            ctx.stroke();
            ctx.shadowBlur = 0;
            pts.forEach(([t, v]) => {
                ctx.strokeStyle = rgba(C.c, 0.4);
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(X(t), Y(0)); ctx.lineTo(X(t), Y(v)); ctx.stroke();
                ctx.fillStyle = C.warn;
                ctx.beginPath(); ctx.arc(X(t), Y(v), 3.5, 0, 7); ctx.fill();
            });
            if (ratio < 2.5) {
                const fa = Math.abs(1 - fs * Math.round(1 / fs));
                ctx.strokeStyle = C.bad;
                ctx.setLineDash([6, 4]);
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i <= 400; i++) {
                    const t = (i / 400) * span;
                    const v = Math.sin(2 * Math.PI * fa * t * (1 - fs * Math.round(1 / fs) < 0 ? -1 : 1)) * 0.9;
                    if (i) ctx.lineTo(X(t), Y(v)); else ctx.moveTo(X(t), Y(v));
                }
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = C.bad;
                ctx.font = "12px Consolas, monospace";
                ctx.fillText(`보이는 주파수 ${fa.toFixed(2)}×f (에일리어스)`, 14, h - 10);
            }
            ctx.font = "11px Consolas, monospace";
            ctx.fillStyle = C.muted;
            ctx.fillText("— 아날로그   ● 샘플   ▬ 양자화(ZOH)", 14, 16);
        };
        slider(bar, "분해능", 1, 12, 1, bits, (v) => `${v} bit`, (v) => { bits = v; calc(); cv.draw(); });
        slider(bar, "fs / f", 1.1, 40, 0.1, ratio, (v) => `${v.toFixed(1)}×`, (v) => { ratio = v; calc(); cv.draw(); });
        cv.fit();
        calc();
    };

    // LLM decoding: temperature, top-k, top-p over a next-token distribution
    SIMS.sampling = (host, spec) => {
        const prompt = spec.prompt || "로봇이 공을";
        const tokens = spec.tokens || ["잡았다", "던졌다", "찼다", "놓쳤다", "굴렸다", "먹었다", "노래했다"];
        const logits = spec.logits || [3.2, 2.6, 2.2, 1.5, 1.1, -0.6, -1.8];
        let T = 1;
        let K = tokens.length;
        let P = 1;
        let gen = [];
        let pick = -1;
        const st = stage(host, true);
        const bar = ctlBar(host);
        const out = readout(host);
        st.innerHTML = `<div class="samp"><div class="out"></div>${tokens.map((t, i) => `<div class="row" data-i="${i}"><span>${esc(t)}</span><div class="b"><i></i></div><span></span></div>`).join("")}</div>`;
        const rows = [...st.querySelectorAll(".row")];
        const probs = () => {
            const z = logits.map((l) => l / T);
            const m = Math.max(...z);
            let p = z.map((v) => Math.exp(v - m));
            const s = p.reduce((a, b) => a + b, 0);
            p = p.map((v) => v / s);
            const raw = p.slice();
            const order = p.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).map((x) => x[1]);
            const keep = new Set();
            let cum = 0;
            for (const i of order.slice(0, K)) { keep.add(i); cum += p[i]; if (cum >= P) break; }
            const ks = order.filter((i) => keep.has(i)).reduce((a, i) => a + p[i], 0);
            return { raw, fin: p.map((v, i) => (keep.has(i) ? v / ks : 0)), keep };
        };
        const render = () => {
            const { fin, keep } = probs();
            rows.forEach((r, i) => {
                r.classList.toggle("off", !keep.has(i));
                r.classList.toggle("pick", i === pick);
                r.querySelector("i").style.width = `${(fin[i] * 100).toFixed(1)}%`;
                r.lastElementChild.textContent = `${(fin[i] * 100).toFixed(1)}%`;
            });
            st.querySelector(".out").innerHTML = `${esc(prompt)} ${gen.map((g) => `<em>${esc(g)}</em>`).join(" ")}<span class="type-line" style="font-size:14px"></span>`;
            const H = -fin.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
            out([["후보", keep.size], ["엔트로피", `${H.toFixed(2)} bit`], ["최대 확률", `${(Math.max(...fin) * 100).toFixed(0)}%`]]);
        };
        let busy = false;
        const sample = (greedy) => {
            if (busy) return;
            const { fin } = probs();
            let i = 0;
            if (greedy) i = fin.indexOf(Math.max(...fin));
            else { let r = Math.random(); for (i = 0; i < fin.length - 1; i++) { r -= fin[i]; if (r <= 0) break; } while (!fin[i]) i--; }
            if (rm()) { pick = i; gen.push(tokens[i]); render(); return; }
            busy = true;
            const live = fin.map((p, k) => (p > 0 ? k : -1)).filter((k) => k >= 0);
            let n = 0;
            const spin = () => {
                pick = live[n % live.length];
                render();
                n++;
                if (n < 10 + live.indexOf(i) + live.length) setTimeout(spin, 45 + n * 6);
                else { pick = i; gen.push(tokens[i]); if (gen.length > 6) gen.shift(); render(); busy = false; }
            };
            spin();
        };
        slider(bar, "온도", 0.1, 2, 0.05, T, (v) => v.toFixed(2), (v) => { T = v; render(); });
        slider(bar, "top-k", 1, tokens.length, 1, K, (v) => v, (v) => { K = v; render(); });
        slider(bar, "top-p", 0.1, 1, 0.05, P, (v) => v.toFixed(2), (v) => { P = v; render(); });
        button(bar, "샘플링", () => sample(false), true);
        button(bar, "그리디", () => sample(true));
        button(bar, "지우기", () => { gen = []; pick = -1; render(); });
        render();
    };

    // 2D convolution: kernel slides over an image, output fills cell by cell
    SIMS.conv = (host) => {
        const IMG = ["00000000", "01111110", "01000000", "01111100", "01000000", "01000000", "01000000", "00000000"].map((r) => [...r].map(Number));
        const KER = {
            v: ["수직 엣지", [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]],
            h: ["수평 엣지", [[-1, -1, -1], [0, 0, 0], [1, 1, 1]]],
            s: ["샤프닝", [[0, -1, 0], [-1, 5, -1], [0, -1, 0]]],
            b: ["블러(÷9)", [[1, 1, 1], [1, 1, 1], [1, 1, 1]]]
        };
        let kk = "v";
        let S = 1;
        let Pd = 0;
        const bar = ctlBar(host);
        const box = document.createElement("div");
        host.append(box);
        seg(bar, "커널", Object.entries(KER).map(([k, v]) => [k, v[0]]), kk, (v) => { kk = v; build(); });
        seg(bar, "stride", [["1", "1"], ["2", "2"]], "1", (v) => { S = +v; build(); });
        seg(bar, "padding", [["0", "0"], ["1", "1"]], "0", (v) => { Pd = +v; build(); });
        let stepCtl = null;
        function build() {
            if (stepCtl) stepCtl.stop();
            const K = KER[kk][1];
            const div = kk === "b" ? 9 : 1;
            const N = 8 + 2 * Pd;
            const at = (y, x) => (y < Pd || x < Pd || y >= 8 + Pd || x >= 8 + Pd ? 0 : IMG[y - Pd][x - Pd]);
            const O = Math.floor((N - 3) / S) + 1;
            const outv = [];
            const calcs = [];
            for (let oy = 0; oy < O; oy++) {
                for (let ox = 0; ox < O; ox++) {
                    let s = 0;
                    const terms = [];
                    for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 3; kx++) { const v = at(oy * S + ky, ox * S + kx); s += v * K[ky][kx]; if (v && K[ky][kx]) terms.push(`${K[ky][kx]}·${v}`); }
                    outv.push(s / div);
                    calcs.push(`출력[${oy},${ox}] = ${terms.length ? terms.join(" + ") : "0"}${div > 1 ? " ÷9" : ""} = **${(s / div).toFixed(div > 1 ? 2 : 0)}**`);
                }
            }
            const mx = Math.max(1, ...outv.map(Math.abs));
            const cell = 22;
            box.innerHTML = `<div class="demo-stage" style="padding:0"><div class="conv">
              <div><div class="muted" style="font-size:12px;margin-bottom:6px">입력 ${N}×${N}${Pd ? " (패딩 포함)" : ""}</div><div class="grid-px in" style="grid-template-columns:repeat(${N}, ${cell}px)">${Array.from({ length: N * N }, (_, i) => { const v = at(Math.floor(i / N), i % N); const pad = Pd && (i % N < Pd || i % N >= 8 + Pd || Math.floor(i / N) < Pd || Math.floor(i / N) >= 8 + Pd); return `<i style="background:${v ? "color-mix(in srgb, var(--text) 80%, transparent)" : pad ? "transparent;outline:1px dashed var(--line2)" : ""};color:${v ? "var(--bg)" : "var(--dim)"}">${v}</i>`; }).join("")}</div></div>
              <div class="op" style="text-align:center"><div class="muted" style="font-size:12px;margin-bottom:6px">커널 3×3</div><div class="k">${K.flat().map((v) => `<i style="color:${v > 0 ? "var(--c)" : v < 0 ? "var(--bad)" : "var(--dim)"}">${v}</i>`).join("")}</div>
                <div class="calc">O = (N + 2P − K) / S + 1 = (8 + ${2 * Pd} − 3) / ${S} + 1 = <b>${O}</b></div></div>
              <div><div class="muted" style="font-size:12px;margin-bottom:6px">출력 ${O}×${O}</div><div class="grid-px out" style="grid-template-columns:repeat(${O}, ${cell + 4}px)">${outv.map(() => "<i></i>").join("")}</div></div>
            </div></div>`;
            const ins = [...box.querySelectorAll(".grid-px.in i")];
            const outs = [...box.querySelectorAll(".grid-px.out i")];
            stepCtl = stepper(box, outv.length, (i) => {
                const oy = Math.floor(i / O);
                const ox = i % O;
                ins.forEach((el, k) => {
                    const y = Math.floor(k / N);
                    const x = k % N;
                    el.classList.toggle("win", y >= oy * S && y < oy * S + 3 && x >= ox * S && x < ox * S + 3);
                });
                outs.forEach((el, k) => {
                    el.classList.toggle("cur", k === i);
                    if (k <= i) {
                        const v = outv[k];
                        const a = Math.round((Math.abs(v) / mx) * 90);
                        el.style.background = `color-mix(in srgb, ${v >= 0 ? "var(--c)" : "var(--bad)"} ${a}%, var(--surf2))`;
                        el.textContent = Math.abs(v) < 10 && v % 1 ? v.toFixed(1) : v;
                    } else { el.style.background = ""; el.textContent = ""; }
                });
                return calcs[i];
            }, { interval: 260 });
        }
        build();
    };

    /* ---------- bit labs: number helpers (pure, tested by check.mjs) ---------- */
    const P2 = (k) => 2 ** k;
    const wrap = (v, w) => ((v % P2(w)) + P2(w)) % P2(w); // any integer → [0, 2^w)
    const sx = (v, w) => (v >= P2(w - 1) ? v - P2(w) : v); // unsigned → signed (two's complement)
    const bitAt = (v, k) => Math.floor(v / P2(k)) % 2;
    const flip = (v, k) => (bitAt(v, k) ? v - P2(k) : v + P2(k));
    const u32 = (x) => x >>> 0;
    const hexw = (v, w) => `0x${v.toString(16).toUpperCase().padStart(Math.ceil(w / 4), "0")}`;
    const binw = (v, w) => v.toString(2).padStart(w, "0");
    const rotl = (a, n, w) => (n % w ? wrap(u32(a << (n % w)), w) + (a >>> (w - (n % w))) : a);
    const msb = (v, w) => bitAt(v, w - 1);
    // ALU ops on w-bit unsigned values (w ≤ 32); c / v = carry / signed overflow, null when the op leaves them alone
    const ALU = {
        and: (a, b) => ({ r: u32(a & b) }),
        or: (a, b) => ({ r: u32(a | b) }),
        xor: (a, b) => ({ r: u32(a ^ b) }),
        andn: (a, b) => ({ r: u32(a & ~b) }),
        not: (a, b, w) => ({ r: wrap(~a, w) }),
        neg: (a, b, w) => ({ r: wrap(-a, w), v: a === P2(w - 1) ? 1 : 0 }),
        shl: (a, b, w, n) => ({ r: wrap(u32(a << n), w), c: n ? bitAt(a, w - n) : null }),
        shr: (a, b, w, n) => ({ r: a >>> n, c: n ? bitAt(a, n - 1) : null }),
        sar: (a, b, w, n) => ({ r: wrap(sx(a, w) >> n, w), c: n ? bitAt(a, n - 1) : null }),
        rol: (a, b, w, n) => ({ r: rotl(a, n, w) }),
        ror: (a, b, w, n) => ({ r: rotl(a, (w - n) % w, w) }),
        add: (a, b, w) => {
            const r = wrap(a + b, w);
            return { r, c: a + b >= P2(w) ? 1 : 0, v: msb(a, w) === msb(b, w) && msb(r, w) !== msb(a, w) ? 1 : 0 };
        },
        sub: (a, b, w) => {
            const r = wrap(a - b, w);
            return { r, c: a < b ? 1 : 0, v: msb(a, w) !== msb(b, w) && msb(r, w) !== msb(a, w) ? 1 : 0 };
        },
        low: (a, b, w) => ({ r: u32(a & wrap(a - 1, w)) }),
        iso: (a, b, w) => ({ r: u32(a & wrap(-a, w)) })
    };
    const alu = (op, a, b, w, n = 0) => ({ c: null, v: null, ...ALU[op](a, b, w, n) });
    const popc = (v, w) => { let c = 0; for (let k = 0; k < w; k++) c += bitAt(v, k); return c; };
    const clz = (v, w) => { let k = w - 1; while (k >= 0 && !bitAt(v, k)) k--; return w - 1 - k; };
    const ctz = (v, w) => { let k = 0; while (k < w && !bitAt(v, k)) k++; return k; };

    // IEEE 754 style binary formats: [label, exponent bits, fraction bits]
    const FMT = { fp32: ["fp32", 8, 23], fp16: ["fp16", 5, 10], bf16: ["bf16", 8, 7], e5m2: ["fp8 E5M2", 5, 2] };
    const rne = (v) => { const f = Math.floor(v); const d = v - f; return d > 0.5 || (d === 0.5 && f % 2) ? f + 1 : f; }; // round half to even
    function fdec(bits, E, M) {
        const bias = P2(E - 1) - 1;
        const emax = P2(E) - 1;
        const s = bitAt(bits, E + M);
        const e = Math.floor(bits / P2(M)) % P2(E);
        const m = bits % P2(M);
        let v;
        let kind;
        if (e === emax) { v = m ? NaN : Infinity; kind = m ? "NaN" : "무한대"; }
        else if (e === 0) { v = (m / P2(M)) * P2(1 - bias); kind = m ? "비정규 수" : "0"; }
        else { v = (1 + m / P2(M)) * P2(e - bias); kind = "정규 수"; }
        return { v: s && !Number.isNaN(v) ? -v : v, s, e, m, bias, emax, kind };
    }
    function fenc(x, E, M) { // double → nearest format value (round half to even), returns raw bits
        const bias = P2(E - 1) - 1;
        const emax = P2(E) - 1;
        if (Number.isNaN(x)) return emax * P2(M) + P2(M - 1);
        const sign = x < 0 || Object.is(x, -0) ? P2(E + M) : 0;
        const a = Math.abs(x);
        if (a === Infinity) return sign + emax * P2(M);
        if (a === 0) return sign;
        let e = Math.floor(Math.log2(a));
        if (P2(e) > a) e--; else if (P2(e + 1) <= a) e++;
        let eb;
        let m;
        if (e < 1 - bias) { eb = 0; m = rne((a / P2(1 - bias)) * P2(M)); if (m === P2(M)) { eb = 1; m = 0; } }
        else { eb = e + bias; m = rne((a / P2(e) - 1) * P2(M)); if (m === P2(M)) { eb++; m = 0; } }
        if (eb >= emax) return sign + emax * P2(M); // overflow → ∞
        return sign + eb * P2(M) + m;
    }

    // CRC as polynomial long division over GF(2): work = message + appended bits, XOR the generator wherever the lead bit is 1
    function crcDiv(msg, poly, tail) {
        const r = poly.length - 1;
        const work = msg.concat(tail || Array(r).fill(0));
        const frames = [{ work: work.slice(), at: -1 }];
        for (let i = 0; i < msg.length; i++) {
            if (!work[i]) continue;
            const before = work.slice();
            for (let k = 0; k <= r; k++) work[i + k] ^= poly[k];
            frames.push({ before, work: work.slice(), at: i });
        }
        return { frames, rem: work.slice(msg.length) };
    }
    LAB.num = { wrap, sx, alu, fdec, fenc, FMT, crcDiv };

    /* ---------- bit labs: shared UI ---------- */
    // row of bits, MSB left: label · bit buttons · value text. set(v, html, cls(k)) repaints.
    function bitRow(parent, label, n, onFlip, field) {
        const row = document.createElement("div");
        row.className = "bit-row";
        row.innerHTML = `<b class="bl">${label}</b><div class="reg-bits${field ? " fbits" : ""}" style="grid-template-columns:repeat(${n},minmax(0,1fr))">${Array.from({ length: n }, (_, i) => {
            const k = n - 1 - i;
            return `<button type="button" data-b="${k}"${field ? ` data-f="${field(k)}"` : ""}${onFlip ? ` title="bit ${k}"` : " disabled"}>0</button>`;
        }).join("")}</div><span class="bv"></span>`;
        parent.append(row);
        const btns = [...row.querySelectorAll("[data-b]")];
        if (onFlip) row.addEventListener("click", (e) => { const b = e.target.closest("[data-b]"); if (b) onFlip(+b.dataset.b); });
        return {
            row,
            set(v, html, cls) {
                btns.forEach((b) => {
                    const k = +b.dataset.b;
                    const on = bitAt(v, k);
                    b.textContent = on;
                    b.className = `${on ? "on" : ""} ${cls ? cls(k) || "" : ""}`;
                });
                row.querySelector(".bv").innerHTML = html;
            }
        };
    }
    function idxRow(parent, n, nogap) {
        const row = document.createElement("div");
        row.className = "bit-row idx";
        row.innerHTML = `<b class="bl"></b><div class="reg-idx${nogap ? " fbits" : ""}" style="grid-template-columns:repeat(${n},minmax(0,1fr))">${Array.from({ length: n }, (_, i) => `<span>${n - 1 - i}</span>`).join("")}</div><span></span>`;
        parent.append(row);
    }
    function textIn(bar, label, val, on, wide) {
        const l = document.createElement("label");
        l.innerHTML = `${label} <input class="num${wide ? " wide" : ""}" spellcheck="false" autocomplete="off">`;
        const inp = l.querySelector("input");
        inp.value = val;
        inp.addEventListener("change", () => on(inp.value.trim()));
        bar.append(l);
        return inp;
    }
    // "0x3C", "0b1010", "60", "-4" → w-bit unsigned, null if unreadable
    function parseInt2(s, w) {
        s = String(s).trim().replace(/_/g, "");
        let v = null;
        if (/^-?0x[0-9a-f]+$/i.test(s)) v = parseInt(s, 16);
        else if (/^-?0b[01]+$/i.test(s)) v = (s[0] === "-" ? -1 : 1) * parseInt(s.replace(/^-?0b/i, ""), 2);
        else if (/^-?\d+$/.test(s)) v = parseInt(s, 10);
        return v === null || !Number.isSafeInteger(v) ? null : wrap(v, w);
    }

    /* ---------- cpu: tiny Armv7-M (Thumb-2 UAL subset) interpreter — pure, tested by check.mjs ---------- */
    // Simplifications: every instruction is 4 bytes, RAM is 4 KB at 0x20000000 (stack at the top), no IT blocks.
    const CODE_BASE = 0x08000000;
    const RAM_BASE = 0x20000000;
    const RAM_SIZE = 0x1000;
    const EXIT = 0xffffffff; // reset value of LR on Cortex-M: returning to it ends the program
    const REGN = { sp: 13, lr: 14, pc: 15, ip: 12, fp: 11 };
    const REG_NAMES = ["r0", "r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10", "r11", "r12", "sp", "lr", "pc"];
    const regIdx = (t) => { t = String(t || "").trim().toLowerCase(); if (t in REGN) return REGN[t]; const m = /^r(\d|1[0-5])$/.exec(t); return m ? +m[1] : -1; };
    const DP = new Set(["mov", "mvn", "add", "adc", "sub", "sbc", "rsb", "mul", "udiv", "sdiv", "and", "orr", "eor", "bic", "lsl", "lsr", "asr", "ror", "neg", "cmp", "cmn", "tst"]);
    const NOS = new Set(["cmp", "cmn", "tst", "udiv", "sdiv"]);
    const MEMOPS = { ldr: 4, str: 4, ldrb: 1, strb: 1, ldrh: 2, strh: 2, ldrsb: -1, ldrsh: -2 };
    const COND = {
        eq: (f) => f.z, ne: (f) => !f.z, cs: (f) => f.c, hs: (f) => f.c, cc: (f) => !f.c, lo: (f) => !f.c, mi: (f) => f.n, pl: (f) => !f.n,
        vs: (f) => f.v, vc: (f) => !f.v, hi: (f) => f.c && !f.z, ls: (f) => !f.c || f.z, ge: (f) => f.n === f.v, lt: (f) => f.n !== f.v,
        gt: (f) => !f.z && f.n === f.v, le: (f) => f.z || f.n !== f.v, al: () => true
    };
    const COND_WHY = { eq: "Z=1", ne: "Z=0", cs: "C=1", hs: "C=1", cc: "C=0", lo: "C=0", mi: "N=1", pl: "N=0", vs: "V=1", vc: "V=0", hi: "C=1 이고 Z=0", ls: "C=0 또는 Z=1", ge: "N=V", lt: "N≠V", gt: "Z=0 이고 N=V", le: "Z=1 또는 N≠V", al: "항상" };
    const h8 = (v) => `0x${(v >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;
    const asmNum = (t) => {
        const s = String(t || "").trim().replace(/^#/, "");
        if (/^-?0x[0-9a-f]+$/i.test(s)) return parseInt(s, 16);
        if (/^-?0b[01]+$/i.test(s)) return (s[0] === "-" ? -1 : 1) * parseInt(s.replace(/^-?0b/i, ""), 2);
        if (/^-?\d+$/.test(s)) return parseInt(s, 10);
        if (/^'.'$/.test(s)) return s.charCodeAt(1);
        return null;
    };
    function splitOps(s) {
        const out = [];
        let depth = 0;
        let cur = "";
        for (const ch of String(s)) {
            if (ch === "[" || ch === "{") depth++;
            if (ch === "]" || ch === "}") depth--;
            if (ch === "," && !depth) { out.push(cur.trim()); cur = ""; } else cur += ch;
        }
        if (cur.trim()) out.push(cur.trim());
        return out;
    }
    function operand2(t, R) {
        if (!t.length || !t[0]) throw "피연산자가 부족함";
        const v = asmNum(t[0]);
        if (v !== null) { if (t[1]) throw `즉시값에는 시프트를 붙일 수 없음: ${t[1]}`; return { imm: v >>> 0 }; }
        const reg = R(t[0]);
        if (!t[1]) return { reg };
        const m = /^(lsl|lsr|asr|ror)\s+#?(\S+)$/i.exec(t[1]);
        const a = m && asmNum(m[2]);
        if (!m || a === null || a < 0 || a > 32) throw `시프트 형식: ${t[1]}`;
        return { reg, sh: m[1].toLowerCase(), amt: a };
    }
    function reglist(t) {
        const m = /^\{(.*)\}$/.exec(String(t || "").trim());
        if (!m) throw `레지스터 목록은 {r4, lr} 형식: ${t}`;
        const out = new Set();
        for (const part of m[1].split(",").map((x) => x.trim()).filter(Boolean)) {
            const [a, b] = part.split("-").map((x) => regIdx(x));
            if (a < 0 || (part.includes("-") && b < a)) throw `레지스터 목록: ${part}`;
            for (let r = a; r <= (part.includes("-") ? b : a); r++) out.add(r);
        }
        if (!out.size) throw "빈 레지스터 목록";
        return [...out].sort((x, y) => x - y);
    }
    function decode(x, labels, dlabels) {
        let mn = x.mn.replace(/\.[wn]$/, "");
        const o = x.ops;
        const R = (t) => { const r = regIdx(t); if (r < 0) throw `레지스터가 아님: ${t || "(없음)"}`; return r; };
        const target = (t) => { if (!(t in labels)) throw `없는 레이블: ${t || "(없음)"}`; return labels[t]; };
        if (mn === "nop") return { op: "nop" };
        if (mn === "bl") return { op: "bl", to: target(o[0]) };
        if (mn === "bx" || mn === "blx") return { op: mn, rm: R(o[0]) };
        if (mn === "cbz" || mn === "cbnz") return { op: mn, rn: R(o[0]), to: target(o[1]) };
        const b = /^b(eq|ne|cs|hs|cc|lo|mi|pl|vs|vc|hi|ls|ge|lt|gt|le|al)?$/.exec(mn);
        if (b) return { op: "b", cond: b[1] || "al", to: target(o[0]) };
        if (mn === "push" || mn === "pop") return { op: mn, list: reglist(o[0]) };
        if (mn in MEMOPS) {
            const rt = R(o[0]);
            const lit = /^=(.+)$/.exec(String(o[1] || "").trim());
            if (lit) {
                if (mn !== "ldr") throw "`=값` 은 ldr 에서만";
                const v = asmNum(lit[1]);
                if (v === null && !(lit[1] in dlabels)) throw `없는 데이터 레이블: ${lit[1]}`;
                return { op: "ldrlit", rd: rt, val: (v !== null ? v : dlabels[lit[1]]) >>> 0, name: lit[1] };
            }
            const m = /^\[([^\]]*)\](!?)$/.exec(String(o[1] || "").trim());
            if (!m) throw `주소 형식은 [rn], [rn, #4], [rn, r2]: ${o[1] || "(없음)"}`;
            const parts = splitOps(m[1]);
            let off = parts.length > 1 ? operand2(parts.slice(1), R) : { imm: 0 };
            let wb = m[2] ? "pre" : "";
            if (o[2]) { if (parts.length > 1) throw "post-index 는 [rn], #4 형식"; off = operand2(o.slice(2), R); wb = "post"; }
            return { op: "mem", load: mn.startsWith("ldr"), size: Math.abs(MEMOPS[mn]), signed: MEMOPS[mn] < 0, rt, base: R(parts[0]), off, wb };
        }
        let s = false;
        if (!DP.has(mn) && mn.endsWith("s") && DP.has(mn.slice(0, -1)) && !NOS.has(mn.slice(0, -1))) { s = true; mn = mn.slice(0, -1); }
        if (!DP.has(mn)) throw `지원하지 않는 명령: ${x.mn}`;
        if (["cmp", "cmn", "tst"].includes(mn)) return { op: mn, s: true, rn: R(o[0]), op2: operand2(o.slice(1), R) };
        if (mn === "mov" || mn === "mvn") return { op: mn, s, rd: R(o[0]), op2: operand2(o.slice(1), R) };
        if (mn === "neg") return { op: "rsb", s, rd: R(o[0]), rn: R(o[1]), op2: { imm: 0 } };
        if (["lsl", "lsr", "asr", "ror"].includes(mn)) {
            const three = o.length >= 3;
            return { op: "shift", kind: mn, s, rd: R(o[0]), rn: R(three ? o[1] : o[0]), amt: operand2([three ? o[2] : o[1]], R) };
        }
        if (["mul", "udiv", "sdiv"].includes(mn)) {
            const three = o.length >= 3;
            return { op: mn, s, rd: R(o[0]), rn: R(three ? o[1] : o[0]), op2: { reg: R(three ? o[2] : o[1]) } };
        }
        if (o.length === 2) return { op: mn, s, rd: R(o[0]), rn: R(o[0]), op2: operand2([o[1]], R) };
        return { op: mn, s, rd: R(o[0]), rn: R(o[1]), op2: operand2(o.slice(2), R) };
    }
    // source → { ins, labels, dlabels, data, error: { line, msg } | null }
    function assemble(src) {
        const ins = [];
        const labels = {};
        const dlabels = {};
        const data = [];
        let pending = [];
        const lines = String(src || "").split("\n");
        const fail = (line, msg) => ({ ins, labels, dlabels, data, error: { line, msg } });
        for (let i = 0; i < lines.length; i++) {
            const ln = i + 1;
            let s = lines[i].replace(/(@|;|\/\/).*$/, "").trim();
            let m;
            while ((m = /^([A-Za-z_.$][\w.$]*):\s*/.exec(s))) {
                if (m[1] in labels || m[1] in dlabels || pending.includes(m[1])) return fail(ln, `레이블 중복: ${m[1]}`);
                pending.push(m[1]);
                s = s.slice(m[0].length);
            }
            if (!s) continue;
            if (s[0] === ".") {
                const d = /^\.(\w+)\s*(.*)$/.exec(s) || [];
                const size = { word: 4, hword: 2, short: 2, byte: 1 }[d[1]];
                const isData = size || ["space", "skip", "ascii", "asciz", "string"].includes(d[1]);
                if (!isData) continue; // .data .text .global .align .thumb .syntax ...
                if (size > 1) while (data.length % size) data.push(0);
                pending.forEach((p) => { dlabels[p] = RAM_BASE + data.length; });
                pending = [];
                if (size) {
                    for (const t of splitOps(d[2])) {
                        const v = asmNum(t);
                        if (v === null) return fail(ln, `숫자가 아님: ${t}`);
                        for (let k = 0; k < size; k++) data.push(Math.floor(((v % 2 ** 32) + 2 ** 32) / 2 ** (8 * k)) % 256);
                    }
                } else if (d[1] === "space" || d[1] === "skip") {
                    const n = asmNum(d[2]);
                    if (n === null || n < 0) return fail(ln, `.space 크기: ${d[2]}`);
                    for (let k = 0; k < n; k++) data.push(0);
                } else {
                    const q = /^"(.*)"$/.exec(d[2].trim());
                    if (!q) return fail(ln, "문자열은 \"...\" 로");
                    for (const ch of q[1]) data.push(ch.charCodeAt(0) & 255);
                    if (d[1] !== "ascii") data.push(0);
                }
                if (data.length > RAM_SIZE / 2) return fail(ln, "데이터가 2 KB 를 넘음");
                continue;
            }
            pending.forEach((p) => { labels[p] = ins.length; });
            pending = [];
            const t = /^(\S+)\s*(.*)$/.exec(s);
            ins.push({ mn: t[1].toLowerCase(), ops: splitOps(t[2]), line: ln, text: s });
        }
        pending.forEach((p) => { labels[p] = ins.length; });
        if (!ins.length) return fail(1, "명령이 없음");
        for (const x of ins) {
            try { Object.assign(x, decode(x, labels, dlabels)); } catch (e) { return fail(x.line, String(e)); }
        }
        return { ins, labels, dlabels, data, error: null };
    }
    function machine(prog, init = {}) {
        const M = { prog, regs: new Array(16).fill(0), n: 0, z: 0, c: 0, v: 0, pc: 0, mem: new Uint8Array(RAM_SIZE), steps: 0, halted: false, error: null };
        M.mem.set(prog.data);
        M.regs[13] = RAM_BASE + RAM_SIZE;
        M.regs[14] = EXIT;
        Object.entries(init || {}).forEach(([k, v]) => { const r = regIdx(k); if (r >= 0 && r < 15) M.regs[r] = v >>> 0; });
        M.regs[15] = CODE_BASE;
        return M;
    }
    function shiftC(kind, a, n, c) {
        n &= 255;
        if (n === 0) return [a, c];
        if (kind === "lsl") return n < 32 ? [(a << n) >>> 0, bitAt(a, 32 - n)] : [0, n === 32 ? a & 1 : 0];
        if (kind === "lsr") return n < 32 ? [a >>> n, bitAt(a, n - 1)] : [0, n === 32 ? a >>> 31 : 0];
        if (kind === "asr") return n < 32 ? [(a >> n) >>> 0, bitAt(a, n - 1)] : [a >>> 31 ? 0xffffffff : 0, a >>> 31];
        const k = n % 32;
        const r = k ? ((a >>> k) | (a << (32 - k))) >>> 0 : a;
        return [r, r >>> 31];
    }
    const addc = (a, b, cin) => { const s = a + b + cin; const r = s >>> 0; return { r, c: s > 0xffffffff ? 1 : 0, v: ((a ^ r) & (b ^ r)) >>> 31 }; };
    const sv = (v) => { const s = v | 0; return s >= -99999 && s <= 999999 ? String(s) : h8(v); };
    // execute one instruction; returns { text, regs:Set, mem:[addr], undo } — throws are caught into M.error
    function cpuStep(M) {
        if (M.halted) return null;
        const R = M.regs;
        const x = M.prog.ins[M.pc];
        const undo = { regs: R.slice(), f: [M.n, M.z, M.c, M.v], pc: M.pc, mem: [], halted: M.halted };
        const changed = new Set();
        const memW = [];
        let next = M.pc + 1;
        let text = "";
        const rn = (r) => REG_NAMES[r];
        const jump = (addr) => {
            if (addr >>> 0 === EXIT) { M.halted = true; return "LR = 0xFFFFFFFF → main 이 반환, 프로그램 종료"; }
            const i = ((addr & ~1) >>> 0) - CODE_BASE;
            if (i < 0 || i % 4 || i / 4 > M.prog.ins.length) throw `잘못된 분기 주소 ${h8(addr)} → HardFault`;
            next = i / 4;
            return "";
        };
        const wr = (r, v) => { if (r === 15) { jump(v >>> 0); return; } R[r] = v >>> 0; changed.add(r); };
        const at = (addr, n) => {
            const off = addr - RAM_BASE;
            if (off < 0 || off + n > RAM_SIZE) throw `메모리 범위 밖 ${h8(addr)} 접근 → HardFault`;
            return off;
        };
        const load = (addr, n) => { const o = at(addr, n); let v = 0; for (let k = n - 1; k >= 0; k--) v = v * 256 + M.mem[o + k]; return v; };
        const store = (addr, n, v) => {
            const o = at(addr, n);
            for (let k = 0; k < n; k++) { undo.mem.push([o + k, M.mem[o + k]]); M.mem[o + k] = Math.floor(v / 2 ** (8 * k)) % 256; }
            memW.push(addr);
        };
        const opv = (o) => (o.imm !== undefined ? [o.imm, M.c] : o.sh ? shiftC(o.sh, R[o.reg], o.amt, M.c) : [R[o.reg], M.c]);
        const opName = (o) => (o.imm !== undefined ? `#${sv(o.imm)}` : o.sh ? `${rn(o.reg)}, ${o.sh} #${o.amt}` : rn(o.reg));
        const nz = (r) => { M.n = r >>> 31; M.z = r === 0 ? 1 : 0; };
        const flags = () => `N=${M.n} Z=${M.z} C=${M.c} V=${M.v}`;
        try {
            switch (x.op) {
                case "nop": text = "아무것도 안 함"; break;
                case "mov": case "mvn": {
                    let [v, c] = opv(x.op2);
                    if (x.op === "mvn") v = ~v >>> 0;
                    wr(x.rd, v);
                    if (x.s) { nz(v); M.c = c; }
                    text = `${rn(x.rd)} ← ${x.op === "mvn" ? "~" : ""}${opName(x.op2)} = ${sv(v)}${x.s ? ` · ${flags()}` : ""}`;
                    break;
                }
                case "add": case "adc": case "sub": case "sbc": case "rsb": case "cmp": case "cmn": {
                    const a = R[x.rn];
                    const [b] = opv(x.op2);
                    const r = x.op === "add" || x.op === "cmn" ? addc(a, b, 0) : x.op === "adc" ? addc(a, b, M.c)
                        : x.op === "rsb" ? addc(b, ~a >>> 0, 1) : x.op === "sbc" ? addc(a, ~b >>> 0, M.c) : addc(a, ~b >>> 0, 1);
                    const sym = { add: "+", adc: "+", cmn: "+", sub: "−", sbc: "−", cmp: "−", rsb: "−" }[x.op];
                    const expr = x.op === "rsb" ? `${sv(b)} − ${sv(a)}` : `${sv(a)} ${sym} ${sv(b)}${x.op === "adc" ? ` + C(${undo.f[2]})` : x.op === "sbc" ? ` − !C(${1 - undo.f[2]})` : ""}`;
                    if (x.s) { nz(r.r); M.c = r.c; M.v = r.v; }
                    if (x.op === "cmp" || x.op === "cmn") text = `${rn(x.rn)} ${sym} ${opName(x.op2)} = ${expr} = ${sv(r.r)} → 결과는 버리고 플래그만 · ${flags()}`;
                    else { wr(x.rd, r.r); text = `${rn(x.rd)} ← ${expr} = ${sv(r.r)}${x.s ? ` · ${flags()}` : ""}`; }
                    break;
                }
                case "and": case "orr": case "eor": case "bic": case "tst": {
                    const a = R[x.rn];
                    const [b, c] = opv(x.op2);
                    const r = (x.op === "orr" ? a | b : x.op === "eor" ? a ^ b : x.op === "bic" ? a & ~b : a & b) >>> 0;
                    if (x.s) { nz(r); M.c = c; }
                    const sym = { and: "&", tst: "&", orr: "|", eor: "^", bic: "& ~" }[x.op];
                    if (x.op === "tst") text = `${h8(a)} & ${h8(b)} = ${h8(r)} → 플래그만 · ${flags()}`;
                    else { wr(x.rd, r); text = `${rn(x.rd)} ← ${h8(a)} ${sym} ${h8(b)} = ${h8(r)}${x.s ? ` · ${flags()}` : ""}`; }
                    break;
                }
                case "shift": {
                    const a = R[x.rn];
                    const n = x.amt.imm !== undefined ? x.amt.imm : R[x.amt.reg] & 255;
                    const [r, c] = shiftC(x.kind, a, n, M.c);
                    wr(x.rd, r);
                    if (x.s) { nz(r); M.c = c; }
                    text = `${rn(x.rd)} ← ${h8(a)} ${x.kind} ${n} = ${h8(r)}${x.s ? ` · ${flags()}` : ""}`;
                    break;
                }
                case "mul": {
                    const r = Math.imul(R[x.rn], R[x.op2.reg]) >>> 0;
                    wr(x.rd, r);
                    if (x.s) nz(r);
                    text = `${rn(x.rd)} ← ${sv(R[x.rn])} × ${sv(R[x.op2.reg])} = ${sv(r)} (하위 32bit)`;
                    break;
                }
                case "udiv": case "sdiv": {
                    const a = R[x.rn];
                    const b = R[x.op2.reg];
                    const r = b === 0 ? 0 : x.op === "udiv" ? Math.floor(a / b) : Math.trunc((a | 0) / (b | 0)) >>> 0;
                    wr(x.rd, r);
                    text = `${rn(x.rd)} ← ${sv(a)} ÷ ${sv(b)} = ${sv(r)}${b === 0 ? " (0으로 나누기 → 0)" : " (0 쪽으로 버림)"}`;
                    break;
                }
                case "b": {
                    const ok = !!COND[x.cond](M);
                    if (ok) next = x.to;
                    const lbl = Object.keys(M.prog.labels).find((k) => M.prog.labels[k] === x.to) || "";
                    text = x.cond === "al" ? `${lbl} 로 분기` : `${x.cond.toUpperCase()}: ${COND_WHY[x.cond]} ${ok ? "→ 참, " + lbl + " 로 분기" : "→ 거짓, 다음 줄"}`;
                    break;
                }
                case "cbz": case "cbnz": {
                    const z = R[x.rn] === 0;
                    const ok = x.op === "cbz" ? z : !z;
                    if (ok) next = x.to;
                    text = `${rn(x.rn)} = ${sv(R[x.rn])} ${ok ? "→ 분기" : "→ 다음 줄"} (플래그 안 씀)`;
                    break;
                }
                case "bl": {
                    const ret = (CODE_BASE + 4 * (M.pc + 1)) | 1;
                    wr(14, ret);
                    next = x.to;
                    const lbl = Object.keys(M.prog.labels).find((k) => M.prog.labels[k] === x.to) || "";
                    text = `LR ← ${h8(ret)} (돌아올 주소, bit0=1 은 Thumb) · ${lbl} 호출`;
                    break;
                }
                case "bx": case "blx": {
                    const t = R[x.rm];
                    if (x.op === "blx") wr(14, (CODE_BASE + 4 * (M.pc + 1)) | 1);
                    text = jump(t) || `PC ← ${rn(x.rm)} = ${h8(t)} → ${x.op === "bx" ? "복귀" : "호출"}`;
                    break;
                }
                case "push": {
                    const sp = R[13] - 4 * x.list.length;
                    x.list.forEach((r, k) => store(sp + 4 * k, 4, R[r]));
                    wr(13, sp);
                    text = `SP ${h8(undo.regs[13])} → ${h8(sp)} · ${x.list.map(rn).join(", ")} 저장 (번호 작은 레지스터가 낮은 주소)`;
                    break;
                }
                case "pop": {
                    const sp = R[13];
                    const vals = x.list.map((r, k) => load(sp + 4 * k, 4));
                    wr(13, sp + 4 * x.list.length);
                    let ret = "";
                    x.list.forEach((r, k) => { if (r === 15) ret = jump(vals[k]) || " · PC 로 꺼내서 복귀"; else wr(r, vals[k]); });
                    text = `${x.list.map(rn).join(", ")} ← 스택 · SP ${h8(sp)} → ${h8(sp + 4 * x.list.length)}${ret.startsWith(" ·") ? ret : ret ? ` · ${ret}` : ""}`;
                    break;
                }
                case "ldrlit": wr(x.rd, x.val); text = `${rn(x.rd)} ← ${x.name in M.prog.dlabels ? `${x.name} 의 주소 ` : ""}${sv(x.val)} (리터럴 풀에서 읽음)`; break;
                case "mem": {
                    const base = R[x.base];
                    const [off] = opv(x.off);
                    const addr = (x.wb === "post" ? base : base + off) >>> 0;
                    if (x.load) {
                        let v = load(addr, x.size);
                        if (x.signed && v >= 2 ** (8 * x.size - 1)) v = v - 2 ** (8 * x.size);
                        wr(x.rt, v >>> 0);
                        text = `${rn(x.rt)} ← [${h8(addr)}] = ${sv(v >>> 0)}${x.size < 4 ? ` (${x.size}바이트${x.signed ? ", 부호 확장" : ", 0 확장"})` : ""}`;
                    } else {
                        store(addr, x.size, x.size === 4 ? R[x.rt] : R[x.rt] % 2 ** (8 * x.size));
                        text = `[${h8(addr)}] ← ${rn(x.rt)} = ${sv(x.size === 4 ? R[x.rt] : R[x.rt] % 2 ** (8 * x.size))}${x.size < 4 ? ` (하위 ${x.size}바이트)` : ""}`;
                    }
                    if (x.wb) { wr(x.base, (base + off) >>> 0); text += ` · ${rn(x.base)} ← ${h8((base + off) >>> 0)} (${x.wb === "pre" ? "pre" : "post"}-index)`; }
                    break;
                }
                default: throw `실행할 수 없음: ${x.mn}`;
            }
        } catch (e) {
            M.error = String(e);
            M.halted = true;
            return { text: `⚠ ${M.error}`, regs: changed, mem: memW, undo, line: x.line, error: true };
        }
        M.pc = next;
        M.steps++;
        R[15] = CODE_BASE + 4 * M.pc;
        if (!M.halted && M.pc >= M.prog.ins.length) { M.halted = true; text += " · 마지막 명령 다음 → 종료"; }
        return { text, regs: changed, mem: memW, undo, line: x.line };
    }
    function cpuUndo(M, u) {
        M.regs = u.regs.slice();
        [M.n, M.z, M.c, M.v] = u.f;
        M.pc = u.pc;
        for (let k = u.mem.length - 1; k >= 0; k--) M.mem[u.mem[k][0]] = u.mem[k][1];
        M.halted = false;
        M.error = null;
        M.steps = Math.max(0, M.steps - 1);
    }
    function cpuRun(src, init, max = 20000) {
        const prog = assemble(src);
        if (prog.error) return { error: `${prog.error.line}행: ${prog.error.msg}` };
        const M = machine(prog, init);
        while (!M.halted && M.steps < max) cpuStep(M);
        if (M.error) return { M, error: M.error };
        if (!M.halted) return { M, error: `${max} 단계를 넘음 (무한 루프?)` };
        return { M, error: null };
    }
    const cpuReg = (M, name) => M.regs[regIdx(name)];
    const cpuWord = (M, addr) => { const o = addr - RAM_BASE; return o >= 0 && o + 4 <= RAM_SIZE ? (M.mem[o] | (M.mem[o + 1] << 8) | (M.mem[o + 2] << 16) | (M.mem[o + 3] << 24)) >>> 0 : null; };
    LAB.asm = { assemble, machine, step: cpuStep, undo: cpuUndo, run: cpuRun, reg: cpuReg, word: cpuWord, RAM_BASE, RAM_SIZE, CODE_BASE, REG_NAMES };

    // 32-bit register: preview MASK and RESULT rows, then run set / clear / toggle / field write / field read
    SIMS.reg = (host, spec) => {
        const name = spec.reg || "GPIOA->ODR";
        let val = u32(spec.value ?? 0);
        let bit = spec.bit ?? 5;
        let width = spec.width || 1;
        let fv = 1;
        let op = "set";
        const st = stage(host, true);
        st.innerHTML = `<div class="bits-lab"><div class="lab-name">${esc(name)}</div><div class="rows"></div><div class="why"></div></div>`;
        const rows = st.querySelector(".rows");
        const why = st.querySelector(".why");
        idxRow(rows, 32);
        let note = "";
        const RV = bitRow(rows, "REG", 32, (k) => { val = flip(val, k); note = `REG ^= (1u << ${k});  // 클릭한 비트`; draw(); });
        const RM = bitRow(rows, "MASK", 32);
        const RR = bitRow(rows, "결과", 32);
        RM.row.classList.add("mask");
        RR.row.classList.add("res");
        const bar = ctlBar(host);
        const out = readout(host);
        const fmax = () => P2(width) - 1;
        const mask = () => fmax() * P2(bit);
        const m = () => (width === 1 ? `(1u << ${bit})` : `(0x${fmax().toString(16).toUpperCase()}u << ${bit})`);
        const field = () => Math.floor(val / P2(bit)) % P2(width);
        const result = () => {
            const M = mask();
            if (op === "set") return u32(val | M);
            if (op === "clear") return u32(val & ~M);
            if (op === "toggle") return u32(val ^ M);
            if (op === "write") return u32((val & ~M) | (fv * P2(bit)));
            return field(); // read: field value lands in the low bits
        };
        const code = () => ({
            set: `REG |= ${m()};`,
            clear: `REG &= ~${m()};`,
            toggle: `REG ^= ${m()};`,
            write: `REG = (REG & ~${m()}) | (${fv}u << ${bit});`,
            read: `v = (REG >> ${bit}) & 0x${fmax().toString(16).toUpperCase()}u;  // = ${field()}`
        }[op]);
        const WHY = {
            set: "MASK 가 1인 자리만 1로 · 나머지는 그대로",
            clear: "`~MASK` 와 AND → MASK 자리만 0으로",
            toggle: "MASK 자리만 뒤집기 · 두 번 하면 원래대로",
            write: "필드 비우고(clear) 새 값 넣기(set) · 읽기-수정-쓰기(read-modify-write) 한 번",
            read: "오른쪽으로 n칸 내린 뒤 폭만큼 AND → 필드 값"
        };
        const draw = () => {
            const r = result();
            const M = mask();
            RV.set(val, `<b>${hexw(val, 32)}</b>`, (k) => (bitAt(M, k) ? "m" : ""));
            RM.set(M, `<b>${hexw(M, 32)}</b>`);
            RR.set(r, `<b>${hexw(r, 32)}</b>${op === "read" ? ` = ${r}` : ""}`, (k) => (op !== "read" && bitAt(r, k) !== bitAt(val, k) ? "d" : ""));
            why.innerHTML = `<p>${fmt(WHY[op])}</p><code class="cl">${esc(note || code())}</code>`;
            note = "";
            fvIn.max = fmax();
            if (fv > fmax()) { fv = fmax(); fvIn.set(fv); }
            fvIn.parentElement.style.opacity = op === "write" ? 1 : 0.4;
            out([["필드 [" + (bit + width - 1) + ":" + bit + "]", `${field()} (0b${binw(field(), width)})`], ["바뀔 비트", op === "read" ? 0 : popc(u32(r ^ val), 32)], ["popcount", popc(val, 32)]]);
        };
        seg(bar, "", [["set", "SET |="], ["clear", "CLEAR &=~"], ["toggle", "TOGGLE ^="], ["write", "필드 쓰기"], ["read", "필드 읽기"]], op, (v) => { op = v; draw(); });
        slider(bar, "비트 n", 0, 31, 1, bit, (v) => v, (v) => { bit = v; if (bit + width > 32) { width = 32 - bit; wIn.set(width); } draw(); });
        const wIn = slider(bar, "폭", 1, 8, 1, width, (v) => `${v} bit`, (v) => { width = Math.min(v, 32 - bit); if (width !== v) wIn.set(width); draw(); });
        const fvIn = slider(bar, "필드 값", 0, 255, 1, fv, (v) => v, (v) => { fv = Math.min(v, fmax()); draw(); });
        button(bar, "▶ 실행", () => {
            if (op === "read") { LAB.toast(`필드 값 = ${field()}`); return; }
            const before = val;
            val = result();
            LAB.toast(`${hexw(before, 32)} → ${hexw(val, 32)}`);
            draw();
        }, true);
        button(bar, "0으로", () => { val = 0; draw(); });
        draw();
    };

    // ALU: two w-bit operands, logic / shift / arithmetic / tricks, NZCV flags
    const OPS = [
        ["논리", [
            ["and", "A & B", "r = a & b;", "둘 다 1인 자리만 1 → **마스크(mask)**로 골라내거나 끄기"],
            ["or", "A | B", "r = a | b;", "하나라도 1이면 1 → 비트 켜기(set)"],
            ["xor", "A ^ B", "r = a ^ b;", "서로 다르면 1 → 반전(toggle) · 바뀐 비트 찾기"],
            ["andn", "A & ~B", "r = a & ~b;", "B 가 1인 자리를 0으로 → 비트 끄기(clear)"],
            ["not", "~A", "r = ({T})~a;", "모든 비트 반전 = **1의 보수(ones' complement)** · 정수 승격 때문에 캐스트 필요"]
        ]],
        ["시프트", [
            ["shl", "A << n", "r = ({T})(a << n);", "왼쪽 n칸, 빈자리 0 → ×2ⁿ · 마지막으로 밀려난 비트 = C"],
            ["shr", "A >> n 논리", "r = a >> n;  // unsigned", "**논리 시프트(logical shift)**: 빈자리 0 → 부호 없는 ÷2ⁿ"],
            ["sar", "A >> n 산술", "r = ({T})(({S})a >> n);", "**산술 시프트(arithmetic shift)**: 빈자리를 부호 비트로 → 음수도 ÷2ⁿ (내림) · C 에선 구현 정의"],
            ["rol", "ROL n", "r = ({T})((a << n) | (a >> ({W} - n)));  // n ≠ 0", "왼쪽 회전(rotate): 밀려난 비트가 오른쪽으로 · 해시·암호에 자주"],
            ["ror", "ROR n", "r = ({T})((a >> n) | (a << ({W} - n)));  // n ≠ 0", "오른쪽 회전: 비트를 잃지 않음 · Cortex-M 에 `ROR` 명령"]
        ]],
        ["산술", [
            ["add", "A + B", "r = a + b;", "C = 부호 없는 넘침(자리올림) · V = 부호 있는 넘침(overflow)"],
            ["sub", "A − B", "r = a - b;", "C = 빌림(borrow, x86 방식) · V = 부호 있는 넘침 · Arm 의 C 는 반대(빌림 없으면 1)"],
            ["neg", "−A", "r = ({T})-a;  // == ~a + 1", "**2의 보수(two's complement)** = `~A + 1` · 최솟값은 부호를 바꿔도 그대로(V)"]
        ]],
        ["트릭", [
            ["low", "A & (A−1)", "r = a & (a - 1);", "가장 낮은 1 비트 끄기 · 결과 0 이면 A 는 2의 거듭제곱"],
            ["iso", "A & −A", "r = a & -a;", "가장 낮은 1 비트만 남기기 · 펜윅 트리(Fenwick tree)의 핵심"]
        ]]
    ];
    SIMS.bitops = (host, spec) => {
        let w = spec.width || 8;
        let a = wrap(spec.a ?? 0x3c, w);
        let b = wrap(spec.b ?? 0x0f, w);
        let n = spec.n ?? 2;
        let op = spec.op || "and";
        const all = OPS.flatMap((g) => g[1]);
        const meta = (k) => all.find((o) => o[0] === k);
        const st = stage(host, true);
        st.innerHTML = `<div class="bits-lab"><div class="ops">${OPS.map(([g, list]) => `<span class="og">${g}</span>${list.map(([k, label]) => `<button type="button" class="chip" data-op="${k}">${esc(label)}</button>`).join("")}`).join("")}</div><div class="rows"></div><div class="why"></div></div>`;
        const rows = st.querySelector(".rows");
        const why = st.querySelector(".why");
        const bar = ctlBar(host);
        const out = readout(host);
        let RA;
        let RB;
        let RR;
        const val = (v) => `<b>${hexw(v, w)}</b> · u ${v} · s ${sx(v, w)}`;
        const build = () => {
            rows.innerHTML = "";
            idxRow(rows, w);
            RA = bitRow(rows, "A", w, (k) => { a = flip(a, k); draw(); });
            RB = bitRow(rows, "B", w, (k) => { b = flip(b, k); draw(); });
            RR = bitRow(rows, "결과", w);
            RR.row.classList.add("res");
            draw();
        };
        const draw = () => {
            const [, label, code, text] = meta(op);
            const usesB = ["and", "or", "xor", "andn", "add", "sub"].includes(op);
            const usesN = ["shl", "shr", "sar", "rol", "ror"].includes(op);
            n = Math.min(n, w - 1);
            const res = alu(op, a, b, w, n);
            RA.set(a, val(a));
            RB.row.hidden = !usesB;
            RB.set(b, val(b));
            RR.set(res.r, val(res.r), (k) => (bitAt(res.r, k) !== bitAt(a, k) ? "d" : ""));
            st.querySelectorAll("[data-op]").forEach((x) => x.classList.toggle("on", x.dataset.op === op));
            const c = code.replace(/\{T\}/g, `uint${w}_t`).replace(/\{S\}/g, `int${w}_t`).replace(/\{W\}/g, w);
            why.innerHTML = `<p><b>${esc(label.replace(/n/g, n))}</b> · ${fmt(text)}</p><code class="cl">${esc(c)}</code>`;
            nIn.parentElement.style.opacity = usesN ? 1 : 0.4;
            bIn.parentElement.style.opacity = usesB ? 1 : 0.4;
            aIn.value = hexw(a, w);
            bIn.value = hexw(b, w);
            const r = res.r;
            out([
                ["N", msb(r, w)], ["Z", r === 0 ? 1 : 0], ["C", res.c ?? "–"], ["V", res.v ?? "–", res.v ? "bad" : ""],
                ["popcount", popc(r, w)], ["CLZ", clz(r, w)], ["CTZ", ctz(r, w)], ["2의 거듭제곱", popc(r, w) === 1 ? "예" : "아니오"]
            ]);
        };
        seg(bar, "폭", [["8", "8"], ["16", "16"], ["32", "32"]], String(w), (v) => {
            w = +v;
            a = wrap(a, w);
            b = wrap(b, w);
            nIn.max = w - 1;
            if (n > w - 1) { n = w - 1; nIn.set(n); }
            build();
        });
        const aIn = textIn(bar, "A", hexw(a, w), (s) => { const v = parseInt2(s, w); if (v === null) LAB.toast("0x3C · 0b1010 · 60 · -4 형식"); else a = v; draw(); });
        const bIn = textIn(bar, "B", hexw(b, w), (s) => { const v = parseInt2(s, w); if (v === null) LAB.toast("0x3C · 0b1010 · 60 · -4 형식"); else b = v; draw(); });
        const nIn = slider(bar, "n", 0, w - 1, 1, n, (v) => v, (v) => { n = v; draw(); });
        button(bar, "랜덤", () => { a = Math.floor(Math.random() * P2(w)); b = Math.floor(Math.random() * P2(w)); draw(); });
        st.querySelector(".ops").addEventListener("click", (e) => { const x = e.target.closest("[data-op]"); if (x) { op = x.dataset.op; draw(); } });
        build();
    };

    // IEEE 754: click bits or type a number; switch fp32 / fp16 / bf16 / fp8 to see range vs precision
    SIMS.float = (host, spec) => {
        let fk = FMT[spec.format] ? spec.format : "fp32";
        let want = spec.value ?? 0.1; // what the user asked for; the stored value may differ
        let bits = 0;
        const st = stage(host, true);
        st.innerHTML = `<div class="bits-lab"><div class="flegend"></div><div class="rows"></div><div class="formula"></div>
          <div class="presets">${["0.1", "1/3", "π", "-2.5", "65504", "1e-7", "∞", "NaN"].map((p) => `<button type="button" class="chip" data-p="${p}">${p}</button>`).join("")}
          <button type="button" class="chip" data-u="-1">−1 ULP</button><button type="button" class="chip" data-u="1">+1 ULP</button></div></div>`;
        const rows = st.querySelector(".rows");
        const bar = ctlBar(host);
        const out = readout(host);
        let row;
        const num = (v, p = 9) => (Number.isNaN(v) ? "NaN" : !Number.isFinite(v) ? (v > 0 ? "+∞" : "−∞") : v === 0 ? (Object.is(v, -0) ? "−0" : "0")
            : Math.abs(v) >= 1e-4 && Math.abs(v) < 1e9 ? String(+v.toPrecision(p)) : v.toExponential(p - 1).replace(/\.?0+e/, "e"));
        const parse = (s) => {
            const t = s.replace(/\s/g, "").toLowerCase();
            if (!t) return null;
            if (/^[+-]?(inf|infinity|∞)$/.test(t)) return t[0] === "-" ? -Infinity : Infinity;
            if (t === "nan") return NaN;
            if (/^-?(π|pi)$/.test(t)) return t[0] === "-" ? -Math.PI : Math.PI;
            const f = t.match(/^(-?[\d.]+(?:e-?\d+)?)\/([\d.]+(?:e-?\d+)?)$/);
            if (f) return +f[1] / +f[2];
            const v = Number(t);
            return Number.isNaN(v) ? null : v;
        };
        const build = () => {
            const [, E, M] = FMT[fk];
            st.querySelector(".flegend").innerHTML = `<span class="fs">부호 1</span><span class="fe">지수 ${E} (bias ${P2(E - 1) - 1})</span><span class="fm">가수 ${M}</span>`;
            rows.innerHTML = "";
            idxRow(rows, 1 + E + M, true);
            row = bitRow(rows, FMT[fk][0], 1 + E + M, (k) => { bits = flip(bits, k); want = fdec(bits, E, M).v; draw(); }, (k) => (k === E + M ? "s" : k >= M ? "e" : "m"));
            bits = fenc(want, E, M);
            draw();
        };
        const draw = () => {
            const [, E, M] = FMT[fk];
            const d = fdec(bits, E, M);
            row.set(bits, `<b>${hexw(bits, 1 + E + M)}</b>`);
            const frac = binw(d.m, M);
            const sgn = d.s ? "−" : "+";
            st.querySelector(".formula").innerHTML = d.e === d.emax
                ? `지수 비트가 모두 1 → <b>${d.m ? "NaN" : `${sgn}∞`}</b> ${d.m ? "(가수 ≠ 0)" : "(가수 = 0)"}`
                : d.e === 0 && d.m === 0
                    ? `지수·가수 비트가 모두 0 → <b>${d.s ? "−0" : "+0"}</b> (부호만 다른 두 개의 0)`
                : d.e === 0
                    ? `비정규 수: (−1)<sup>${d.s}</sup> × 2<sup>1 − ${d.bias}</sup> × <code>0.${frac}</code>₂ = <b>${num(d.v, 12)}</b>`
                    : `(−1)<sup>${d.s}</sup> × 2<sup>${d.e} − ${d.bias} = ${d.e - d.bias}</sup> × <code>1.${frac}</code>₂ (= ${num(1 + d.m / P2(M), 12)}) = <b>${num(d.v, 12)}</b>`;
            const ulp = d.e === d.emax ? NaN : P2((d.e === 0 ? 1 : d.e) - d.bias - M);
            const err = Number.isFinite(d.v) && Number.isFinite(want) ? d.v - want : 0;
            inp.value = num(want, 17);
            out([
                ["종류", d.kind],
                ["저장값", num(d.v, 17)],
                ["오차", err === 0 ? "0" : err.toExponential(2), err === 0 ? "good" : "bad"],
                ["ULP", Number.isNaN(ulp) ? "–" : num(ulp, 4)],
                ["10진 정밀도", `≈ ${((M + 1) * Math.log10(2)).toFixed(1)}자리`],
                ["최대", num((2 - P2(-M)) * P2(d.emax - 1 - d.bias), 6)],
                ["최소 정규", num(P2(1 - d.bias), 4)]
            ]);
        };
        seg(bar, "형식", Object.entries(FMT).map(([k, v]) => [k, v[0]]), fk, (v) => { fk = v; build(); });
        const inp = textIn(bar, "값", String(want), (s) => {
            const v = parse(s);
            if (v === null) { LAB.toast("숫자 · 1/3 · pi · inf · nan"); draw(); return; }
            want = v;
            bits = fenc(want, FMT[fk][1], FMT[fk][2]);
            draw();
        }, true);
        st.querySelector(".presets").addEventListener("click", (e) => {
            const [, E, M] = FMT[fk];
            const p = e.target.closest("[data-p]");
            const u = e.target.closest("[data-u]");
            if (p) { want = parse(p.dataset.p); bits = fenc(want, E, M); }
            else if (u) {
                const top = P2(E + M);
                const sign = bits >= top ? top : 0;
                const mag = bits - sign + +u.dataset.u;
                if (mag < 0 || mag > (P2(E) - 1) * P2(M)) return;
                bits = sign + mag;
                want = fdec(bits, E, M).v;
            } else return;
            draw();
        });
        build();
    };

    // CRC: long division with XOR, step by step; click bits to inject errors
    const CRCS = {
        crc3: ["CRC-3 (x³+x+1)", "1011", "11010011101100"],
        crc8: ["CRC-8 (0x07)", "100000111", "0x31"],
        crc16: ["CRC-16 (0x1021)", "10001000000100001", "0x31 0x32"]
    };
    const parseBits = (s) => {
        const t = String(s).trim();
        if (/^[01\s]+$/.test(t)) return [...t.replace(/\s/g, "")].map(Number);
        let h = t.replace(/0x/gi, "").replace(/[\s,]/g, "");
        if (!/^[0-9a-f]+$/i.test(h)) return null;
        if (h.length % 2) h = `0${h}`;
        return h.match(/../g).flatMap((x) => [...parseInt(x, 16).toString(2).padStart(8, "0")].map(Number));
    };
    SIMS.crc = (host, spec) => {
        let pk = CRCS[spec.poly] ? spec.poly : "crc3";
        let rx = false;
        let msg = [];
        let cur = [];
        let stepCtl = null;
        const bar = ctlBar(host);
        const box = document.createElement("div");
        host.append(box);
        const out = readout(host);
        const poly = () => [...CRCS[pk][1]].map(Number);
        const load = () => {
            const bitsIn = parseBits(inp.value);
            if (!bitsIn || !bitsIn.length || bitsIn.length > 32) { LAB.toast("비트 1101… 또는 0x31 32 (최대 32비트)"); return; }
            msg = bitsIn;
            cur = rx ? msg.concat(crcDiv(msg, poly()).rem) : msg.slice();
            build();
        };
        const build = () => {
            if (stepCtl) stepCtl.stop();
            const P = poly();
            const r = P.length - 1;
            const L = rx ? cur.length - r : cur.length;
            const data = rx ? cur : cur.concat(Array(r).fill(0));
            const { frames, rem } = crcDiv(data.slice(0, L), P, data.slice(L));
            const N = data.length;
            const ok = rem.every((x) => !x);
            const cells = (cls) => `<div class="cells ${cls}" style="--n:${N}">${"<i></i>".repeat(N)}</div>`;
            box.innerHTML = `<div class="demo-stage" style="padding:0"><div class="crc">
              <div class="crc-row msg"><b class="bl">${rx ? "수신" : "메시지"}</b><div class="cells" style="--n:${N}">${data.map((v, i) => `<button type="button" data-i="${i}" class="${i >= L ? "app" : ""} ${v ? "on" : ""}"${!rx && i >= L ? " disabled" : ""}>${v}</button>`).join("")}</div></div>
              <div class="crc-row"><b class="bl">작업</b>${cells("w1")}</div>
              <div class="crc-row"><b class="bl">⊕ 생성</b>${cells("w2")}</div>
              <div class="crc-row"><b class="bl">결과</b>${cells("w3")}</div>
            </div></div>`;
            box.querySelector(".msg").addEventListener("click", (e) => {
                const b = e.target.closest("[data-i]");
                if (!b || b.disabled) return;
                cur[+b.dataset.i] ^= 1;
                build();
            });
            const [W1, W2, W3] = ["w1", "w2", "w3"].map((c) => [...box.querySelectorAll(`.${c} i`)]);
            const paint = (els, arr, cls) => els.forEach((c, i) => { const v = arr ? arr[i] : ""; c.textContent = v === "" || v == null ? "" : v; c.className = cls(i); });
            const verdict = () => (rx ? (ok ? " · 나머지 0 → **오류 없음**" : " · 나머지 ≠ 0 → **오류 검출**") : ` · 남은 ${r}비트 **${rem.join("")}** = CRC`);
            stepCtl = stepper(box, frames.length, (fi) => {
                const f = frames[fi];
                const last = fi === frames.length - 1;
                const remCls = (i) => (last && i >= N - r ? ` rem ${ok || !rx ? "ok" : "bad"}` : "");
                if (f.at < 0) {
                    paint(W1, f.work, (i) => `${i >= L ? "app" : ""} ${f.work[i] ? "on" : ""}${remCls(i)}`);
                    paint(W2, null, () => "blank");
                    paint(W3, null, () => "blank");
                    return (rx ? `수신한 메시지+CRC ${N}비트를 그대로 나눔` : `메시지 뒤에 0을 r = ${r}개 덧붙여 나눔`) + (last ? verdict() : "");
                }
                const win = (i) => i >= f.at && i <= f.at + r;
                paint(W1, f.before, (i) => `${i < f.at ? "done" : ""} ${win(i) ? "win" : ""} ${f.before[i] ? "on" : ""}`);
                paint(W2, f.before.map((_, i) => (win(i) ? P[i - f.at] : "")), (i) => (win(i) ? `poly ${P[i - f.at] ? "on" : ""}` : "blank"));
                paint(W3, f.work, (i) => `${i <= f.at ? "done" : ""} ${win(i) && f.work[i] !== f.before[i] ? "chg" : ""} ${f.work[i] ? "on" : ""}${remCls(i)}`);
                return `${f.at}번 비트가 1 → 생성 다항식을 맞대고 XOR` + (last ? verdict() : "");
            }, { interval: 1000 });
            const hex = (bitsArr) => `0x${parseInt(bitsArr.join("") || "0", 2).toString(16).toUpperCase()}`;
            out([["생성 다항식", CRCS[pk][1]], ["r", r], ["XOR 단계", frames.length - 1], [rx ? "나머지" : "CRC", `${rem.join("")} (${hex(rem)})`, rx ? (ok ? "good" : "bad") : ""], ["뒤집은 비트", cur.reduce((n, v, i) => n + (v !== (rx ? msg.concat(crcDiv(msg, P).rem) : msg)[i] ? 1 : 0), 0)]]);
        };
        seg(bar, "다항식", Object.entries(CRCS).map(([k, v]) => [k, v[0]]), pk, (v) => { pk = v; inp.value = CRCS[pk][2]; load(); });
        const inp = textIn(bar, "메시지", spec.msg || CRCS[pk][2], load, true);
        seg(bar, "", [["tx", "송신"], ["rx", "수신 검사"]], "tx", (v) => { rx = v === "rx"; load(); });
        button(bar, "원래대로", load);
        load();
    };

    // CPU: step through Thumb-2 assembly, registers / flags / stack / data memory; editable source
    SIMS.cpu = (host, spec) => {
        const A = LAB.asm;
        let src = String(spec.code || "").replace(/^\n+/, "").replace(/\s+$/, "");
        let prog = null;
        let M = null;
        let hist = [];
        let last = null;
        let timer = 0;
        let editing = false;
        let base = "dec";
        const st = stage(host, true);
        st.innerHTML = `<div class="cpu">
          <div class="cpu-code">${spec.c ? `<h4>C</h4>${LAB.codeBox({ lang: "c", title: spec.cTitle || "원본", src: spec.c })}<h4>어셈블리</h4>` : "<h4>어셈블리 · Thumb-2</h4>"}<div class="asm-host"></div><textarea class="asm-edit" spellcheck="false" hidden></textarea></div>
          <div><h4>레지스터</h4><div class="regs"></div><h4>플래그 (xPSR)</h4><div class="flags"></div></div>
          <div><h4>메모리 (RAM)</h4><div class="memv"></div></div>
        </div><div class="cpu-cap"></div>`;
        const bar = ctlBar(host);
        const out = readout(host);
        const $q = (s) => st.querySelector(s);
        const cap = $q(".cpu-cap");
        const ta = $q(".asm-edit");
        const fmtR = (r, v) => (base === "hex" || r >= 13 ? h8(v) : String(r === 13 ? v : v | 0));
        const say = (t, bad) => { cap.innerHTML = fmt(t || ""); cap.classList.toggle("err", !!bad); };
        const stop = () => { clearInterval(timer); timer = 0; runBtn.textContent = "▶▶ 실행"; };
        const load = () => {
            stop();
            prog = A.assemble(src);
            $q(".asm-host").innerHTML = LAB.codeBox({ lang: "asm", title: spec.title || "", src });
            if (prog.error) {
                M = null;
                const ln = $q(`.asm-host .ln[data-n="${prog.error.line}"]`);
                if (ln) ln.classList.add("err");
                say(`⚠ ${prog.error.line}행: ${prog.error.msg}`, true);
                draw();
                return;
            }
            M = A.machine(prog, spec.regs);
            hist = [];
            last = null;
            say(spec.intro || "▶ 한 줄 을 눌러 한 명령씩 실행 · 하이라이트 = 다음에 실행할 줄");
            draw();
        };
        const draw = () => {
            $q(".asm-host").querySelectorAll(".ln").forEach((l) => l.classList.remove("cur", "prev"));
            if (!M) { out([["상태", "어셈블 오류", "bad"]]); $q(".regs").innerHTML = ""; $q(".flags").innerHTML = ""; $q(".memv").innerHTML = ""; return; }
            const x = prog.ins[M.pc];
            if (!M.halted && x) { const l = $q(`.asm-host .ln[data-n="${x.line}"]`); if (l) l.classList.add("cur"); }
            if (last && last.line) { const l = $q(`.asm-host .ln[data-n="${last.line}"]`); if (l && !l.classList.contains("cur")) l.classList.add("prev"); }
            $q(".regs").innerHTML = A.REG_NAMES.map((n, r) => `<div class="cell${last && last.regs.has(r) ? " hot" : ""}"><span>${n}</span><b>${fmtR(r, M.regs[r])}</b></div>`).join("");
            $q(".flags").innerHTML = ["n", "z", "c", "v"].map((f) => `<span class="${M[f] ? "on" : ""}" title="${{ n: "음수", z: "0", c: "자리올림 / 빌림 없음", v: "부호 있는 넘침" }[f]}">${f.toUpperCase()} ${M[f]}</span>`).join("");
            // words to show: data area, written words, stack from SP to the top
            const sp = M.regs[13];
            const top = A.RAM_BASE + A.RAM_SIZE;
            const words = new Set();
            for (let a = A.RAM_BASE; a < A.RAM_BASE + Math.min(prog.data.length, 64); a += 4) words.add(a);
            (last ? last.mem : []).forEach((a) => words.add(a - (a % 4)));
            for (let a = Math.max(sp - 8, A.RAM_BASE) - (sp % 4); a < top && a < sp + 4 * 14; a += 4) words.add(a);
            const lbl = {};
            Object.entries(prog.dlabels).forEach(([k, a]) => { lbl[a] = (lbl[a] ? `${lbl[a]} ` : "") + k; });
            const hot = new Set((last ? last.mem : []).map((a) => a - (a % 4)));
            const list = [...words].filter((a) => a >= A.RAM_BASE && a < top).sort((p, q) => p - q);
            $q(".memv").innerHTML = list.map((a, i) => {
                const v = A.word(M, a);
                const gap = i && a - list[i - 1] > 4 ? `<div class="cell gap"><span>⋮</span></div>` : "";
                return `${gap}<div class="cell${hot.has(a) ? " hot" : ""}${a === sp ? " sp" : ""}"><span>${h8(a).slice(2)}${lbl[a] ? ` <i class="lb">${esc(lbl[a])}</i>` : ""}${a === sp ? ` <i class="lb sp">← SP</i>` : ""}</span><b>${base === "hex" ? h8(v) : String(v | 0)}</b></div>`;
            }).join("") || `<div class="cell"><span>비어 있음</span></div>`;
            const exp = spec.expect ? Object.entries(spec.expect).every(([k, v]) => A.reg(M, k) === v >>> 0) : null;
            out([
                ["단계", M.steps],
                ["상태", M.error ? "HardFault" : M.halted ? "종료" : "실행 중", M.error ? "bad" : M.halted ? "good" : ""],
                ["PC", h8(M.regs[15])],
                ...(spec.expect && M.halted && !M.error ? [["기대값", exp ? `✓ ${Object.entries(spec.expect).map(([k, v]) => `${k}=${sv(v >>> 0)}`).join(" ")}` : "✗ 다름", exp ? "good" : "bad"]] : [])
            ]);
        };
        const step = () => {
            if (!M || M.halted) { stop(); return false; }
            last = A.step(M);
            if (last) { hist.push(last.undo); if (hist.length > 5000) hist.shift(); say(last.text, last.error); }
            draw();
            if (M.halted) stop();
            return !M.halted;
        };
        button(bar, "↺ 처음", load);
        button(bar, "◀ 되돌리기", () => { stop(); if (!M || !hist.length) return; A.undo(M, hist.pop()); last = null; say("한 단계 되돌림"); draw(); });
        button(bar, "▶ 한 줄", () => { stop(); step(); }, true);
        const runBtn = button(bar, "▶▶ 실행", () => {
            if (timer) { stop(); return; }
            if (!M || M.halted) return;
            runBtn.textContent = "⏸ 정지";
            timer = setInterval(() => { if (!step()) stop(); }, spec.speed || 450);
        });
        button(bar, "⏭ 끝까지", () => { stop(); let n = 0; while (M && !M.halted && n++ < 20000) { last = A.step(M); hist.push(last.undo); } if (hist.length > 5000) hist = hist.slice(-5000); if (last) say(M.halted ? `${last.text}` : "2만 단계 넘음 · 무한 루프?", !!(last && last.error)); draw(); });
        const editBtn = button(bar, "✎ 편집", () => {
            stop();
            editing = !editing;
            if (editing) { ta.value = src; ta.hidden = false; $q(".asm-host").hidden = true; editBtn.textContent = "✓ 적용"; ta.focus(); say("코드를 고친 뒤 ✓ 적용 · 지원 명령은 README 참고 (mov add sub cmp b<cond> bl bx ldr str push pop …)"); return; }
            src = ta.value.replace(/\s+$/, "");
            ta.hidden = true;
            $q(".asm-host").hidden = false;
            editBtn.textContent = "✎ 편집";
            load();
        });
        seg(bar, "값", [["dec", "10진"], ["hex", "16진"]], base, (v) => { base = v; draw(); });
        load();
    };

    // struct layout types: [size, align] on 32-bit Arm (AAPCS) and 64-bit LP64
    LAB.LAYOUT_TYPES = {
        char: [1, 1, 1, 1], bool: [1, 1, 1, 1], uint8_t: [1, 1, 1, 1],
        short: [2, 2, 2, 2], uint16_t: [2, 2, 2, 2],
        int: [4, 4, 4, 4], uint32_t: [4, 4, 4, 4], float: [4, 4, 4, 4],
        long: [4, 4, 8, 8], "void*": [4, 4, 8, 8],
        int64_t: [8, 8, 8, 8], double: [8, 8, 8, 8]
    };
    /* ---------- memory + data-structure labs: pure models (tested by check.mjs) ---------- */
    const range = (n) => Array.from({ length: n }, (_, i) => i);
    // cache with LRU; returns one frame per access
    function cacheSim(addrs, size, block, ways) {
        const sets = Math.max(1, Math.floor(size / (block * ways)));
        const S = range(sets).map(() => []);
        const frames = [];
        let hits = 0;
        let t = 0;
        addrs.forEach((a) => {
            const off = a % block;
            const idx = Math.floor(a / block) % sets;
            const tag = Math.floor(a / block / sets);
            const set = S[idx];
            let w = set.findIndex((l) => l.tag === tag);
            const hit = w >= 0;
            let evict = null;
            if (hit) hits++;
            else if (set.length < ways) { set.push({ tag }); w = set.length - 1; }
            else { w = set.reduce((m, l, k) => (l.used < set[m].used ? k : m), 0); evict = set[w].tag; set[w] = { tag }; }
            set[w].used = ++t;
            frames.push({ a, off, idx, tag, hit, w, evict, hits, n: frames.length + 1, snap: S.map((s) => s.map((l) => ({ ...l }))) });
        });
        return { frames, sets, ob: Math.log2(block), ib: Math.log2(sets) };
    }
    const CACHE_PATTERNS = {
        seq: ["순차 int[32]", () => range(32).map((i) => 0x1000 + 4 * i)],
        stride: ["보폭 64B", () => range(16).map((i) => 0x1000 + 64 * i)],
        row: ["8×8 행 순회", () => range(64).map((k) => 0x1000 + 4 * k)],
        col: ["8×8 열 순회", () => range(64).map((k) => 0x1000 + 4 * ((k % 8) * 8 + Math.floor(k / 8)))],
        conflict: ["a[i], b[i] 번갈아", (size) => range(8).flatMap((i) => [0x1000 + 4 * i, 0x1000 + size * 4 + 4 * i])],
        reuse: ["작은 배열 두 번", () => [...range(16), ...range(16)].map((i) => 0x1000 + 4 * i)]
    };
    // struct layout: [{ t, n, off, size, pad }], size, align, tail padding
    function structLayout(fields, arch, packed) {
        const T = LAB.LAYOUT_TYPES;
        const k = arch === 64 ? 2 : 0;
        let off = 0;
        let maxA = 1;
        const items = fields.map((f) => {
            const a = packed ? 1 : T[f.t][k + 1];
            const pad = (a - (off % a)) % a;
            off += pad;
            const it = { ...f, off, size: T[f.t][k], pad, align: T[f.t][k + 1] };
            off += it.size;
            maxA = Math.max(maxA, a);
            return it;
        });
        const tail = (maxA - (off % maxA)) % maxA;
        return { items, size: off + tail, align: maxA, tail, padding: items.reduce((s, x) => s + x.pad, 0) + tail };
    }
    // ring buffer: state + put/get returning a message
    const ring = {
        make: (n, mode) => ({ n, mode, buf: Array(n).fill(null), head: 0, tail: 0, count: 0, lost: 0 }),
        idx: (s, i) => (s.mode === "free" ? i & (s.n - 1) : i),
        full: (s) => (s.mode === "spare" ? (s.head + 1) % s.n === s.tail : s.mode === "count" ? s.count === s.n : s.head - s.tail === s.n),
        empty: (s) => (s.mode === "count" ? s.count === 0 : s.head === s.tail),
        size: (s) => (s.mode === "count" ? s.count : s.mode === "free" ? s.head - s.tail : (s.head - s.tail + s.n) % s.n),
        cap: (s) => (s.mode === "spare" ? s.n - 1 : s.n),
        adv: (s, i) => (s.mode === "free" ? i + 1 : (i + 1) % s.n),
        put(s, v, overwrite) {
            if (ring.full(s)) {
                if (!overwrite) { s.lost++; return `가득 참 → ${v} 버림 (손실 ${s.lost})`; }
                const old = s.buf[ring.idx(s, s.tail)];
                s.tail = ring.adv(s, s.tail);
                if (s.mode === "count") s.count--;
                s.lost++;
                s.buf[ring.idx(s, s.head)] = v;
                s.head = ring.adv(s, s.head);
                if (s.mode === "count") s.count++;
                return `가득 참 → 가장 오래된 ${old} 를 덮어쓰고 ${v} 저장`;
            }
            const i = ring.idx(s, s.head);
            s.buf[i] = v;
            s.head = ring.adv(s, s.head);
            if (s.mode === "count") s.count++;
            return `buf[${i}] ← ${v} · head → ${s.head}`;
        },
        get(s) {
            if (ring.empty(s)) return [null, "비어 있음 → 읽을 것 없음"];
            const i = ring.idx(s, s.tail);
            const v = s.buf[i];
            s.buf[i] = null;
            s.tail = ring.adv(s, s.tail);
            if (s.mode === "count") s.count--;
            return [v, `buf[${i}] → ${v} · tail → ${s.tail}`];
        }
    };
    // hash table: chaining or linear probing; ops return { path, at, ok, text }
    const TOMB = "⌫";
    const hashT = {
        make: (m, mode) => ({ m, mode, t: mode === "chain" ? range(m).map(() => []) : Array(m).fill(null), n: 0 }),
        h: (s, k) => ((k % s.m) + s.m) % s.m,
        find(s, k) {
            const h = hashT.h(s, k);
            if (s.mode === "chain") { const i = s.t[h].indexOf(k); return { path: [h], at: h, pos: i, ok: i >= 0, probes: i >= 0 ? i + 1 : s.t[h].length + 1 }; }
            const path = [];
            for (let p = 0; p < s.m; p++) {
                const i = (h + p) % s.m;
                path.push(i);
                if (s.t[i] === null) return { path, at: i, ok: false, probes: p + 1 };
                if (s.t[i] === k) return { path, at: i, ok: true, probes: p + 1 };
            }
            return { path, at: -1, ok: false, probes: s.m };
        },
        insert(s, k) {
            const h = hashT.h(s, k);
            const f = hashT.find(s, k);
            if (f.ok) return { ...f, text: `${k} 는 이미 있음` };
            if (s.mode === "chain") { s.t[h].push(k); s.n++; return { ...f, ok: true, text: `h(${k}) = ${k} mod ${s.m} = ${h} → 체인 ${s.t[h].length}번째에 추가` }; }
            const slot = f.path.find((i) => s.t[i] === TOMB);
            const at = slot !== undefined ? slot : f.at;
            if (at < 0) return { ...f, ok: false, text: "빈 칸 없음 → 재해시 필요" };
            s.t[at] = k;
            s.n++;
            return { ...f, at, ok: true, text: `h(${k}) = ${k} mod ${s.m} = ${h}${f.path.length > 1 ? ` → 충돌 ${f.path.length - 1}번, 다음 칸으로` : ""} → [${at}] 저장 · 탐사 ${f.path.length}` };
        },
        remove(s, k) {
            const f = hashT.find(s, k);
            if (!f.ok) return { ...f, text: `${k} 없음` };
            if (s.mode === "chain") s.t[f.at].splice(f.pos, 1);
            else s.t[f.at] = TOMB;
            s.n--;
            return { ...f, text: s.mode === "chain" ? `체인에서 ${k} 제거` : `[${f.at}] 에 묘비(tombstone) 표시 · 비우면 뒤쪽 키를 못 찾음` };
        },
        keys: (s) => (s.mode === "chain" ? s.t.flat() : s.t.filter((x) => x !== null && x !== TOMB)),
        avgProbes: (s) => { const ks = hashT.keys(s); return ks.length ? ks.reduce((a, k) => a + hashT.find(s, k).probes, 0) / ks.length : 0; }
    };
    // binary heap: ops return frames [{ a, hl:[i..], text }]
    const heapT = {
        better: (kind, x, y) => (kind === "min" ? x < y : x > y),
        up(a, i, kind, fr) {
            while (i > 0) {
                const p = (i - 1) >> 1;
                fr.push({ a: a.slice(), hl: [i, p], text: `[${i}]=${a[i]} vs 부모 [${p}]=${a[p]}` });
                if (!heapT.better(kind, a[i], a[p])) { fr.push({ a: a.slice(), hl: [i], text: "부모가 더 우선 → 멈춤" }); return; }
                [a[i], a[p]] = [a[p], a[i]];
                fr.push({ a: a.slice(), hl: [p], text: `교환 → [${p}]` });
                i = p;
            }
            fr.push({ a: a.slice(), hl: [0], text: "루트 도달" });
        },
        down(a, i, kind, fr) {
            for (;;) {
                const l = 2 * i + 1;
                const r = l + 1;
                let b = i;
                if (l < a.length && heapT.better(kind, a[l], a[b])) b = l;
                if (r < a.length && heapT.better(kind, a[r], a[b])) b = r;
                fr.push({ a: a.slice(), hl: [i, l, r].filter((x) => x < a.length), text: `[${i}]=${a[i]} 와 자식 비교` });
                if (b === i) { fr.push({ a: a.slice(), hl: [i], text: "자식보다 우선 → 멈춤" }); return; }
                [a[i], a[b]] = [a[b], a[i]];
                fr.push({ a: a.slice(), hl: [b], text: `교환 → [${b}]` });
                i = b;
            }
        },
        push(a, v, kind) { const fr = []; a.push(v); fr.push({ a: a.slice(), hl: [a.length - 1], text: `${v} 를 맨 끝 [${a.length - 1}] 에 추가` }); heapT.up(a, a.length - 1, kind, fr); return fr; },
        pop(a, kind) {
            const fr = [];
            if (!a.length) return [{ a: [], hl: [], text: "비어 있음" }];
            const top = a[0];
            const last = a.pop();
            if (a.length) { a[0] = last; fr.push({ a: a.slice(), hl: [0], text: `루트 ${top} 꺼냄 · 마지막 ${last} 를 루트로` }); heapT.down(a, 0, kind, fr); }
            else fr.push({ a: [], hl: [], text: `루트 ${top} 꺼냄 · 비었음` });
            fr[fr.length - 1].text += ` → 꺼낸 값 ${top}`;
            return fr;
        },
        heapify(a, kind) { const fr = [{ a: a.slice(), hl: [], text: "무작위 배열 · 마지막 부모부터 sift down" }]; for (let i = (a.length >> 1) - 1; i >= 0; i--) heapT.down(a, i, kind, fr); return fr; },
        ok: (a, kind) => a.every((v, i) => !i || !heapT.better(kind, v, a[(i - 1) >> 1]))
    };
    // binary search tree on plain objects { v, l, r }
    const bstT = {
        insert(root, v) {
            const path = [];
            if (!root) return { root: { v, l: null, r: null }, path: [v], text: `빈 트리 → ${v} 가 루트` };
            let n = root;
            for (;;) {
                path.push(n.v);
                if (v === n.v) return { root, path, text: `${v} 는 이미 있음` };
                const side = v < n.v ? "l" : "r";
                if (!n[side]) { n[side] = { v, l: null, r: null }; path.push(v); return { root, path, text: `${path.slice(0, -1).join(" → ")} → ${side === "l" ? "왼쪽" : "오른쪽"} 빈자리에 ${v}` }; }
                n = n[side];
            }
        },
        search(root, v) {
            const path = [];
            for (let n = root; n; n = v < n.v ? n.l : n.r) { path.push(n.v); if (n.v === v) return { path, ok: true, text: `${path.join(" → ")} · 찾음 (비교 ${path.length}번)` }; }
            return { path, ok: false, text: `${path.join(" → ") || "빈 트리"} · 없음 (비교 ${path.length}번)` };
        },
        remove(root, v) {
            const path = [];
            let p = null;
            let n = root;
            while (n && n.v !== v) { path.push(n.v); p = n; n = v < n.v ? n.l : n.r; }
            if (!n) return { root, path, text: `${v} 없음` };
            path.push(n.v);
            let text;
            if (n.l && n.r) {
                let sp = n;
                let s = n.r;
                while (s.l) { sp = s; s = s.l; }
                text = `자식 둘 → 오른쪽 서브트리의 최솟값 ${s.v} (중위 후계자)로 바꾸고 그 자리 삭제`;
                path.push(s.v);
                n.v = s.v;
                if (sp === n) sp.r = s.r; else sp.l = s.r;
                return { root, path, text };
            }
            const child = n.l || n.r;
            text = child ? `자식 하나 → ${child.v} 를 끌어올림` : "잎 노드 → 그냥 삭제";
            if (!p) return { root: child, path, text };
            if (p.l === n) p.l = child; else p.r = child;
            return { root, path, text };
        },
        height: (n) => (n ? 1 + Math.max(bstT.height(n.l), bstT.height(n.r)) : 0),
        inorder: (n, out = []) => { if (n) { bstT.inorder(n.l, out); out.push(n.v); bstT.inorder(n.r, out); } return out; }
    };
    // sorting: frames { a, cmp:[i,j], sw:[i,j], done: index ≥ this (or set) is final, c, s, text }
    function sortFrames(algo, input) {
        const a = input.slice();
        const fr = [];
        let c = 0;
        let s = 0;
        const done = new Set();
        const snap = (cmp, sw, text) => fr.push({ a: a.slice(), cmp: cmp || [], sw: sw || [], done: new Set(done), c, s, text });
        const less = (i, j) => { c++; snap([i, j], null, `비교 a[${i}]=${a[i]} vs a[${j}]=${a[j]}`); return a[i] < a[j]; };
        const swap = (i, j) => { if (i === j) return; [a[i], a[j]] = [a[j], a[i]]; s++; snap(null, [i, j], `교환 a[${i}] ↔ a[${j}]`); };
        const n = a.length;
        if (algo === "bubble") {
            for (let i = 0; i < n - 1; i++) {
                let any = false;
                for (let j = 0; j < n - 1 - i; j++) if (less(j + 1, j)) { swap(j, j + 1); any = true; }
                done.add(n - 1 - i);
                if (!any) { range(n).forEach((k) => done.add(k)); break; }
            }
        } else if (algo === "insertion") {
            for (let i = 1; i < n; i++) for (let j = i; j > 0 && less(j, j - 1); j--) swap(j, j - 1);
        } else if (algo === "selection") {
            for (let i = 0; i < n - 1; i++) {
                let m = i;
                for (let j = i + 1; j < n; j++) if (less(j, m)) m = j;
                swap(i, m);
                done.add(i);
            }
        } else if (algo === "merge") {
            const aux = a.slice();
            const sortR = (lo, hi) => {
                if (hi - lo < 1) return;
                const mid = (lo + hi) >> 1;
                sortR(lo, mid);
                sortR(mid + 1, hi);
                for (let k = lo; k <= hi; k++) aux[k] = a[k];
                let i = lo;
                let j = mid + 1;
                for (let k = lo; k <= hi; k++) {
                    if (i > mid) a[k] = aux[j++];
                    else if (j > hi) a[k] = aux[i++];
                    else { c++; if (aux[j] < aux[i]) a[k] = aux[j++]; else a[k] = aux[i++]; }
                    s++;
                    snap([], [k], `병합 [${lo}..${hi}] → a[${k}] = ${a[k]}`);
                }
            };
            sortR(0, n - 1);
        } else if (algo === "quick") {
            const st = [[0, n - 1]];
            while (st.length) {
                const [lo, hi] = st.pop();
                if (lo >= hi) { if (lo === hi) done.add(lo); continue; }
                let i = lo;
                for (let j = lo; j < hi; j++) if (less(j, hi)) { swap(i, j); i++; }
                swap(i, hi);
                done.add(i);
                snap([], [i], `피벗 ${a[i]} 자리 확정 [${i}]`);
                st.push([i + 1, hi], [lo, i - 1]);
            }
        } else if (algo === "heap") {
            const down = (i, end) => {
                for (;;) {
                    const l = 2 * i + 1;
                    let b = i;
                    if (l < end && less(b, l)) b = l;
                    if (l + 1 < end && less(b, l + 1)) b = l + 1;
                    if (b === i) return;
                    swap(i, b);
                    i = b;
                }
            };
            for (let i = (n >> 1) - 1; i >= 0; i--) down(i, n);
            for (let end = n - 1; end > 0; end--) { swap(0, end); done.add(end); down(0, end); }
        }
        range(n).forEach((k) => done.add(k));
        snap([], [], `완료 · 비교 ${c} · 교환/쓰기 ${s}`);
        return fr;
    }
    const sortInput = (kind, n, seed) => {
        const r = rng(seed);
        let a = range(n).map((i) => i + 1);
        if (kind === "reversed") return a.reverse();
        if (kind === "few") return range(n).map(() => 1 + Math.floor(r() * 4) * Math.ceil(n / 4));
        for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
        if (kind === "nearly") { a = range(n).map((i) => i + 1); for (let k = 0; k < Math.max(1, n >> 3); k++) { const i = Math.floor(r() * (n - 1)); [a[i], a[i + 1]] = [a[i + 1], a[i]]; } }
        return a;
    };
    LAB.ds = { cacheSim, structLayout, ring, hashT, heapT, bstT, sortFrames, sortInput, CACHE_PATTERNS };

    // shared: draw a binary tree as SVG; nodes [{ id, v, x (0..1), d (depth), parent }]
    function treeSvg(nodes, hl, cls) {
        const depth = Math.max(0, ...nodes.map((n) => n.d)) + 1;
        const W = 640;
        const H = depth * 62 + 10;
        const P = (n) => [24 + n.x * (W - 48), 26 + n.d * 62];
        const by = new Map(nodes.map((n) => [n.id, n]));
        return `<svg class="tree" viewBox="0 0 ${W} ${H}" style="max-width:${W}px;margin:0 auto">${nodes.filter((n) => by.has(n.parent)).map((n) => { const [x1, y1] = P(by.get(n.parent)); const [x2, y2] = P(n); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; }).join("")}
          ${nodes.map((n) => { const [x, y] = P(n); return `<g class="${hl.has(n.id) ? cls || "hl" : ""}"><circle cx="${x}" cy="${y}" r="17"/><text x="${x}" y="${y}">${esc(n.v)}</text></g>`; }).join("")}</svg>`;
    }

    // cache: tag / index / offset, sets × ways, LRU
    SIMS.cache = (host, spec) => {
        let size = spec.size || 64;
        let block = spec.block || 16;
        let ways = spec.ways || 1;
        let pat = CACHE_PATTERNS[spec.pattern] ? spec.pattern : "seq";
        let stepCtl = null;
        const bar = ctlBar(host);
        const box = document.createElement("div");
        host.append(box);
        const out = readout(host);
        const build = () => {
            if (stepCtl) stepCtl.stop();
            if (block * ways > size) { box.innerHTML = `<div class="empty">블록 × 웨이(${block * ways}B)가 캐시(${size}B)보다 큼 · 웨이나 블록을 줄이세요</div>`; out([]); return; }
            const addrs = CACHE_PATTERNS[pat][1](size);
            const { frames, sets, ob, ib } = cacheSim(addrs, size, block, ways);
            const tb = 16 - ob - ib;
            box.innerHTML = `<div class="demo-stage" style="padding:0"><div class="bits-lab">
              <div class="flegend"><span class="fs">태그 ${tb}bit</span><span class="fe">인덱스 ${ib}bit (세트 ${sets})</span><span class="fm">오프셋 ${ob}bit (블록 ${block}B)</span></div>
              <div class="rows"></div>
              <div class="ctab" style="grid-template-columns:52px repeat(${ways}, minmax(0, 1fr))"><b></b>${range(ways).map((w) => `<b>웨이 ${w}</b>`).join("")}${range(sets).map((si) => `<b>세트 ${si}</b>${range(ways).map((w) => `<i data-c="${si}-${w}"></i>`).join("")}`).join("")}</div>
              <div class="acc">${addrs.map((a, i) => `<span data-a="${i}">${a.toString(16).toUpperCase()}</span>`).join("")}</div>
            </div></div>`;
            const rows = box.querySelector(".rows");
            idxRow(rows, 16, true);
            const RA = bitRow(rows, "주소", 16, null, (k) => (k >= ob + ib ? "s" : k >= ob ? "e" : "m"));
            const cells = new Map([...box.querySelectorAll("[data-c]")].map((el) => [el.dataset.c, el]));
            const acc = [...box.querySelectorAll("[data-a]")];
            stepCtl = stepper(box, frames.length, (i) => {
                const f = frames[i];
                RA.set(f.a, `<b>0x${f.a.toString(16).toUpperCase()}</b> · 태그 0x${f.tag.toString(16).toUpperCase()} · 세트 ${f.idx} · +${f.off}`);
                cells.forEach((el, key) => {
                    const [si, w] = key.split("-").map(Number);
                    const l = f.snap[si][w];
                    el.className = si === f.idx && w === f.w ? (f.hit ? "hit" : "miss") : l ? "" : "empty";
                    el.innerHTML = l ? `태그 ${l.tag.toString(16).toUpperCase()}<small>0x${((l.tag * sets + si) * block).toString(16).toUpperCase()}–${((l.tag * sets + si) * block + block - 1).toString(16).toUpperCase()}</small>` : "—";
                });
                acc.forEach((el, k) => { el.className = k > i ? "" : `${frames[k].hit ? "hit" : "miss"}${k === i ? " cur" : ""}`; });
                const rate = f.hits / f.n;
                out([["접근", f.n], ["히트", f.hits, "good"], ["미스", f.n - f.hits, "bad"], ["히트율", `${(rate * 100).toFixed(0)}%`], ["평균 접근 시간", `${(1 + (1 - rate) * 50).toFixed(1)} 사이클 (히트 1, 미스 +50 가정)`]]);
                return `0x${f.a.toString(16).toUpperCase()} → 세트 ${f.idx}, 태그 0x${f.tag.toString(16).toUpperCase()} → ${f.hit ? "**히트**" : f.evict !== null ? `**미스** · 태그 0x${f.evict.toString(16).toUpperCase()} 를 LRU 로 쫓아냄` : "**미스** · 빈 웨이에 채움"}`;
            }, { interval: 650 });
        };
        seg(bar, "캐시", [32, 64, 128, 256].map((v) => [v, `${v}B`]), size, (v) => { size = +v; build(); });
        seg(bar, "블록", [4, 8, 16, 32].map((v) => [v, `${v}B`]), block, (v) => { block = +v; build(); });
        seg(bar, "웨이", [1, 2, 4].map((v) => [v, v === 1 ? "직접 사상" : `${v}-way`]), ways, (v) => { ways = +v; build(); });
        seg(bar, "접근", Object.entries(CACHE_PATTERNS).map(([k, v]) => [k, v[0]]), pat, (v) => { pat = v; build(); });
        build();
    };

    // struct layout: field order → padding, sizeof; endianness of a 32-bit value
    SIMS.layout = (host, spec) => {
        let arch = spec.arch === 64 ? 64 : 32;
        let packed = false;
        let fields = (spec.fields || [["char", "a"], ["int", "b"], ["char", "c"], ["double", "d"]]).map(([t, n]) => ({ t, n }));
        let value = (spec.value ?? 0x12345678) >>> 0;
        const types = Object.keys(LAB.LAYOUT_TYPES);
        const st = stage(host, true);
        st.innerHTML = `<div class="lay"><div><h4>필드</h4><div class="lay-f"></div></div><div><h4>메모리 배치</h4><div class="lay-map"></div><div class="lay-code"></div></div></div>
          <div class="lay-end"><h4>엔디안 · 0x<input class="lay-v" spellcheck="false" maxlength="8"></h4><div class="lay-e"></div></div>`;
        const bar = ctlBar(host);
        const out = readout(host);
        const $q = (s) => st.querySelector(s);
        const col = (i) => PALETTE[i % PALETTE.length];
        const draw = () => {
            const L = structLayout(fields, arch, packed);
            $q(".lay-f").innerHTML = fields.map((f, i) => `<div class="lay-row" style="--fc:${col(i)}"><i></i><select data-i="${i}">${types.map((t) => `<option${t === f.t ? " selected" : ""}>${t}</option>`).join("")}</select><input data-n="${i}" value="${esc(f.n)}" spellcheck="false"><button type="button" data-up="${i}" title="위로">↑</button><button type="button" data-dn="${i}" title="아래로">↓</button><button type="button" data-rm="${i}" title="삭제">✕</button></div>`).join("");
            const owner = Array(L.size).fill(-1);
            L.items.forEach((it, i) => { for (let b = 0; b < it.size; b++) owner[it.off + b] = i; });
            const cols = 8;
            $q(".lay-map").innerHTML = range(Math.ceil(L.size / cols)).map((r) => `<div class="lay-line"><span>+${r * cols}</span>${range(cols).map((c) => {
                const b = r * cols + c;
                if (b >= L.size) return `<i class="none"></i>`;
                const o = owner[b];
                return o < 0 ? `<i class="pad" title="패딩">pad</i>` : `<i style="--fc:${col(o)}" title="${esc(fields[o].n)} (${fields[o].t})">${b === L.items[o].off ? esc(fields[o].n) : ""}</i>`;
            }).join("")}</div>`).join("");
            $q(".lay-code").innerHTML = LAB.codeBox({ lang: "c", title: arch === 64 ? "LP64 (x86-64 · AArch64)" : "32bit Arm (AAPCS)", src: `struct s {\n${L.items.map((it) => `    ${it.t.padEnd(9)}${it.n};`.padEnd(26) + `/* offset ${it.off}${it.pad ? `, 앞 패딩 ${it.pad}` : ""} */`).join("\n")}\n}${packed ? " __attribute__((packed))" : ""};${L.tail ? `   /* 끝 패딩 ${L.tail} */` : ""}\n_Static_assert(sizeof(struct s) == ${L.size}, "size");` });
            const raw = L.items.reduce((s, x) => s + x.size, 0);
            out([["sizeof", `${L.size} B`], ["alignof", L.align], ["패딩", `${L.padding} B`, L.padding ? "bad" : "good"], ["효율", `${Math.round((raw / Math.max(1, L.size)) * 100)}%`], ...(packed && L.items.some((x) => x.off % x.align) ? [["주의", "정렬 안 된 필드 → M0 HardFault, M3/M4 느림", "bad"]] : [])]);
            const bytes = range(4).map((k) => (value >>> (8 * k)) & 255);
            const hx = (b) => b.toString(16).toUpperCase().padStart(2, "0");
            const sig = range(4).map((k) => [bytes[k], k]); // [byte, significance]
            $q(".lay-e").innerHTML = [["리틀 엔디안 (Cortex-M, x86)", sig], ["빅 엔디안 (네트워크 순서)", sig.slice().reverse()]].map(([t, bs]) => `<div class="lay-line"><span>${t}</span>${bs.map(([b, g], k) => `<i style="--fc:${PALETTE[3 - g]}"><small>+${k}</small>${hx(b)}</i>`).join("")}</div>`).join("");
        };
        $q(".lay-v").value = value.toString(16).toUpperCase().padStart(8, "0");
        $q(".lay-v").addEventListener("change", (e) => { const v = parseInt(e.target.value, 16); if (Number.isNaN(v)) LAB.toast("16진수 8자리"); else value = v >>> 0; draw(); });
        $q(".lay-f").addEventListener("change", (e) => {
            const t = e.target;
            if (t.dataset.i) fields[+t.dataset.i].t = t.value;
            if (t.dataset.n) fields[+t.dataset.n].n = t.value.trim() || "x";
            draw();
        });
        $q(".lay-f").addEventListener("click", (e) => {
            const b = e.target.closest("button");
            if (!b) return;
            const i = +(b.dataset.up ?? b.dataset.dn ?? b.dataset.rm);
            if (b.dataset.up !== undefined && i > 0) [fields[i - 1], fields[i]] = [fields[i], fields[i - 1]];
            if (b.dataset.dn !== undefined && i < fields.length - 1) [fields[i + 1], fields[i]] = [fields[i], fields[i + 1]];
            if (b.dataset.rm !== undefined && fields.length > 1) fields.splice(i, 1);
            draw();
        });
        seg(bar, "", [["32", "32bit Arm"], ["64", "64bit LP64"]], String(arch), (v) => { arch = +v; draw(); });
        seg(bar, "", [["0", "기본 정렬"], ["1", "packed"]], "0", (v) => { packed = v === "1"; draw(); });
        button(bar, "+ 필드", () => { fields.push({ t: "char", n: `f${fields.length}` }); draw(); });
        button(bar, "정렬 큰 순 재배치", () => { const T = LAB.LAYOUT_TYPES; const k = arch === 64 ? 3 : 1; fields = fields.map((f, i) => [f, i]).sort((x, y) => T[y[0].t][k] - T[x[0].t][k] || x[1] - y[1]).map((x) => x[0]); draw(); }, true);
        button(bar, "원래대로", () => { fields = (spec.fields || [["char", "a"], ["int", "b"], ["char", "c"], ["double", "d"]]).map(([t, n]) => ({ t, n })); draw(); });
        draw();
    };

    // ring buffer: put / get with head and tail on a circle
    SIMS.ringbuf = (host, spec) => {
        let N = [4, 8, 16].includes(spec.size) ? spec.size : 8;
        let mode = ["spare", "count", "free"].includes(spec.mode) ? spec.mode : "spare";
        let over = false;
        let s;
        let nextV;
        let log;
        const st = stage(host, true);
        st.innerHTML = `<div class="ring"><div class="ring-svg"></div><div><div class="ring-arr"></div><div class="ring-code"></div></div></div><div class="cpu-cap"></div>`;
        const bar = ctlBar(host);
        const out = readout(host);
        const $q = (x) => st.querySelector(x);
        const CODE = {
            spare: "#define N 8   // 2의 거듭제곱일 필요 없음\nbool put(uint8_t v) {\n    uint32_t next = (head + 1) % N;\n    if (next == tail) return false;   // 가득 참: 한 칸은 늘 비움\n    buf[head] = v; head = next; return true;\n}\nbool get(uint8_t *v) {\n    if (head == tail) return false;   // 비어 있음\n    *v = buf[tail]; tail = (tail + 1) % N; return true;\n}",
            count: "bool put(uint8_t v) {\n    if (count == N) return false;     // 가득 참\n    buf[head] = v; head = (head + 1) % N;\n    count++;                          // ISR 과 main 이 같이 고침 → 임계 구역 필요\n    return true;\n}\nbool get(uint8_t *v) {\n    if (count == 0) return false;\n    *v = buf[tail]; tail = (tail + 1) % N; count--; return true;\n}",
            free: "#define N 8                          // 반드시 2의 거듭제곱\nvolatile uint32_t head, tail;         // 계속 증가, 넘쳐도 OK\nbool put(uint8_t v) {\n    if (head - tail == N) return false;   // 가득 참 (부호 없는 뺄셈)\n    buf[head & (N - 1)] = v; head++; return true;\n}\nbool get(uint8_t *v) {\n    if (head == tail) return false;\n    *v = buf[tail & (N - 1)]; tail++; return true;\n}"
        };
        const reset = () => { s = ring.make(N, mode); nextV = 1; log = "put / get 을 눌러 보세요"; draw(); };
        const draw = () => {
            const R = 92;
            const C = 120;
            const hi = ring.idx(s, s.head);
            const ti = ring.idx(s, s.tail);
            $q(".ring-svg").innerHTML = `<svg viewBox="0 0 240 240">${range(N).map((i) => {
                const a = (i / N) * Math.PI * 2 - Math.PI / 2;
                const x = C + R * Math.cos(a);
                const y = C + R * Math.sin(a);
                const v = s.buf[i];
                return `<g class="${v !== null ? "full" : ""}${i === hi ? " h" : ""}${i === ti ? " t" : ""}"><circle cx="${x}" cy="${y}" r="${N > 8 ? 13 : 17}"/><text x="${x}" y="${y}">${v ?? ""}</text><text class="ix" x="${C + (R + 27) * Math.cos(a)}" y="${C + (R + 27) * Math.sin(a)}">${i}</text></g>`;
            }).join("")}<text class="lbl" x="${C}" y="${C - 8}">head ${hi}</text><text class="lbl t" x="${C}" y="${C + 12}">tail ${ti}</text></svg>`;
            $q(".ring-arr").innerHTML = range(N).map((i) => `<i class="${s.buf[i] !== null ? "full" : ""}${i === hi ? " h" : ""}${i === ti ? " t" : ""}"><small>${i}</small>${s.buf[i] ?? ""}</i>`).join("");
            $q(".ring-code").innerHTML = LAB.codeBox({ lang: "c", title: { spare: "한 칸 비우기", count: "count 변수", free: "자유 증가 인덱스" }[mode], src: CODE[mode] });
            $q(".cpu-cap").innerHTML = fmt(log);
            out([["head", s.head], ["tail", s.tail], ["저장", ring.size(s)], ["용량", ring.cap(s)], ["상태", ring.full(s) ? "가득 참" : ring.empty(s) ? "비어 있음" : "사용 중", ring.full(s) ? "bad" : ""], ["손실", s.lost, s.lost ? "bad" : ""]]);
        };
        const put = (k = 1) => { const m = []; for (let i = 0; i < k; i++) m.push(ring.put(s, nextV++, over)); log = m.join(" · "); draw(); };
        const get = (all) => { const m = []; do { const [v, t] = ring.get(s); m.push(t); if (v === null) break; } while (all); log = m.join(" · "); draw(); };
        button(bar, "put", () => put(1), true);
        button(bar, "put ×3", () => put(3));
        button(bar, "get", () => get(false), true);
        button(bar, "모두 get", () => get(true));
        button(bar, "↺", reset);
        seg(bar, "크기", [4, 8, 16].map((v) => [v, v]), N, (v) => { N = +v; reset(); });
        seg(bar, "가득 참 판정", [["spare", "한 칸 비우기"], ["count", "count"], ["free", "자유 증가"]], mode, (v) => { mode = v; reset(); });
        seg(bar, "넘치면", [["0", "새 값 버림"], ["1", "덮어쓰기"]], "0", (v) => { over = v === "1"; });
        reset();
    };

    // hash table: chaining vs linear probing
    SIMS.hash = (host, spec) => {
        let M = spec.size || 8;
        let mode = spec.mode === "linear" ? "linear" : "chain";
        let s;
        let last = null;
        const st = stage(host, true);
        st.innerHTML = `<div class="hash"></div><div class="cpu-cap"></div>`;
        const bar = ctlBar(host);
        const out = readout(host);
        const $q = (x) => st.querySelector(x);
        const init = (keys) => { s = hashT.make(M, mode); keys.forEach((k) => hashT.insert(s, k)); last = null; draw(`${keys.length}개 키 삽입 · h(k) = k mod ${M}`); };
        const draw = (text) => {
            const path = new Set(last ? last.path : []);
            $q(".hash").innerHTML = range(s.m).map((i) => {
                const cls = last && i === last.at ? (last.ok ? "ok" : "no") : path.has(i) ? "probe" : "";
                const body = s.mode === "chain"
                    ? (s.t[i].length ? s.t[i].map((k) => `<b class="${last && last.key === k && i === last.at ? "me" : ""}">${k}</b>`).join("<em>→</em>") : "<span>NULL</span>")
                    : s.t[i] === null ? "<span>빈칸</span>" : s.t[i] === TOMB ? `<span class="tomb">${TOMB} 묘비</span>` : `<b>${s.t[i]}</b>`;
                return `<div class="hrow ${cls}"><i>${i}</i><div>${body}</div></div>`;
            }).join("");
            if (text) $q(".cpu-cap").innerHTML = fmt(text);
            const a = s.n / s.m;
            out([["키", s.n], ["칸", s.m], ["적재율 α", a.toFixed(2), s.mode === "linear" && a > 0.7 ? "bad" : ""], ["평균 탐사(찾기)", hashT.avgProbes(s).toFixed(2)], ...(last ? [["직전 탐사", last.path.length]] : [])]);
        };
        const key = () => { const v = parseInt(inp.value, 10); if (Number.isNaN(v)) { LAB.toast("정수 키를 입력"); return null; } return v; };
        const act = (fn) => { const k = key(); if (k === null) return; last = { ...fn(s, k), key: k }; draw(last.text || (last.ok ? `찾음: [${last.at}] · 탐사 ${last.probes}` : `없음 · 탐사 ${last.probes}`)); };
        const inp = textIn(bar, "키", String(spec.next ?? 23), () => act(hashT.insert));
        button(bar, "삽입", () => act(hashT.insert), true);
        button(bar, "검색", () => act(hashT.find));
        button(bar, "삭제", () => act(hashT.remove));
        button(bar, "랜덤 삽입", () => { const k = Math.floor(Math.random() * 100); inp.value = k; act(hashT.insert); });
        button(bar, "2배 재해시", () => { const ks = hashT.keys(s); M = s.m * 2; init(ks); last = null; draw(`칸 ${M / 2} → ${M} · 키 ${ks.length}개를 전부 다시 넣음 (O(n))`); });
        seg(bar, "충돌 처리", [["chain", "체이닝"], ["linear", "선형 탐사"]], mode, (v) => { mode = v; init(hashT.keys(s)); });
        button(bar, "↺", () => { M = spec.size || 8; init(spec.keys || [12, 20, 7, 15, 3]); });
        init(spec.keys || [12, 20, 7, 15, 3]);
    };

    // binary heap: tree + array, sift steps
    SIMS.heap = (host, spec) => {
        let kind = spec.kind === "max" ? "max" : "min";
        let a = [];
        let stepCtl = null;
        const bar = ctlBar(host);
        const box = document.createElement("div");
        host.append(box);
        const out = readout(host);
        const show = (frames) => {
            if (stepCtl) stepCtl.stop();
            box.innerHTML = `<div class="demo-stage"><div class="tree-host"></div><div class="heap-arr"></div></div>`;
            const th = box.querySelector(".tree-host");
            const ah = box.querySelector(".heap-arr");
            stepCtl = stepper(box, frames.length, (i) => {
                const f = frames[i];
                const hl = new Set(f.hl);
                const nodes = f.a.map((v, k) => { const d = Math.floor(Math.log2(k + 1)); const j = k + 1 - 2 ** d; return { id: k, v, d, x: (j + 0.5) / 2 ** d, parent: k ? (k - 1) >> 1 : -1 }; });
                th.innerHTML = f.a.length ? treeSvg(nodes, hl) : `<div class="empty">빈 힙</div>`;
                ah.innerHTML = f.a.map((v, k) => `<i class="${hl.has(k) ? "hl" : ""}"><small>${k}</small>${v}</i>`).join("");
                out([["크기", f.a.length], ["높이", f.a.length ? Math.floor(Math.log2(f.a.length)) + 1 : 0], [kind === "min" ? "최솟값" : "최댓값", f.a.length ? f.a[0] : "–"], ["부모 = (i−1)/2", "자식 = 2i+1, 2i+2"]]);
                return f.text;
            }, { interval: 700 });
        };
        const heapify = (vals) => { a = vals.slice(); show(heapT.heapify(a, kind)); };
        const inp = textIn(bar, "값", "5", () => {});
        button(bar, "삽입", () => { const v = parseInt(inp.value, 10); if (Number.isNaN(v)) return LAB.toast("정수"); show(heapT.push(a, v, kind)); inp.value = Math.floor(Math.random() * 99) + 1; }, true);
        button(bar, "루트 꺼내기", () => show(heapT.pop(a, kind)));
        button(bar, "랜덤 9개 heapify", () => heapify(range(9).map(() => Math.floor(Math.random() * 99) + 1)));
        seg(bar, "", [["min", "최소 힙"], ["max", "최대 힙"]], kind, (v) => { kind = v; heapify(a); });
        heapify(spec.values || [40, 15, 30, 8, 22, 5, 17]);
    };

    // binary search tree: insert / search / delete with the visited path
    SIMS.bst = (host, spec) => {
        let root = null;
        let stepCtl = null;
        const bar = ctlBar(host);
        const box = document.createElement("div");
        host.append(box);
        const out = readout(host);
        const nodesOf = () => {
            const order = bstT.inorder(root);
            const n = Math.max(1, order.length);
            const out2 = [];
            const walk = (x, d, parent) => { if (!x) return; out2.push({ id: x.v, v: x.v, d, x: (order.indexOf(x.v) + 0.5) / n, parent }); walk(x.l, d + 1, x.v); walk(x.r, d + 1, x.v); };
            walk(root, 0, null);
            return out2;
        };
        const show = (path, text, cls) => {
            if (stepCtl) stepCtl.stop();
            box.innerHTML = `<div class="demo-stage"><div class="tree-host"></div></div>`;
            const th = box.querySelector(".tree-host");
            const nodes = nodesOf();
            const frames = path.length ? path.map((_, i) => i) : [0];
            stepCtl = stepper(box, frames.length, (i) => {
                const seen = new Set(path.slice(0, i + 1));
                th.innerHTML = nodes.length ? treeSvg(nodes, seen, i === frames.length - 1 ? cls : "hl") : `<div class="empty">빈 트리</div>`;
                const h = bstT.height(root);
                const n = nodes.length;
                out([["노드", n], ["높이", h], ["최소 가능 높이", n ? Math.ceil(Math.log2(n + 1)) : 0, h > Math.ceil(Math.log2(n + 1)) + 1 ? "bad" : "good"], ["중위 순회", bstT.inorder(root).join(" ") || "–"]]);
                return i === frames.length - 1 ? text : `${path[i]} 와 비교 → ${path[i + 1] !== undefined ? (path[i + 1] < path[i] ? "왼쪽" : "오른쪽") : ""}`;
            }, { interval: 650 });
        };
        const val = () => { const v = parseInt(inp.value, 10); if (Number.isNaN(v)) { LAB.toast("정수"); return null; } return v; };
        const load = (vals) => { root = null; vals.forEach((v) => { root = bstT.insert(root, v).root; }); show([], `${vals.join(", ")} 순서로 삽입`); };
        const inp = textIn(bar, "값", "37", () => {});
        button(bar, "삽입", () => { const v = val(); if (v === null) return; const r = bstT.insert(root, v); root = r.root; show(r.path, r.text, "ok"); inp.value = Math.floor(Math.random() * 99) + 1; }, true);
        button(bar, "검색", () => { const v = val(); if (v === null) return; const r = bstT.search(root, v); show(r.path, r.text, r.ok ? "ok" : "no"); });
        button(bar, "삭제", () => { const v = val(); if (v === null) return; const r = bstT.remove(root, v); root = r.root; show(r.path, r.text, "ok"); });
        button(bar, "정렬된 1…7", () => load([1, 2, 3, 4, 5, 6, 7]));
        button(bar, "균형 순서", () => load([4, 2, 6, 1, 3, 5, 7]));
        button(bar, "랜덤 10개", () => { const set = new Set(); while (set.size < 10) set.add(Math.floor(Math.random() * 99) + 1); load([...set]); });
        load(spec.values || [50, 30, 70, 20, 40, 60, 80]);
    };

    // sorting: bars with compare / swap highlights
    SIMS.sort = (host, spec) => {
        const ALGOS = { bubble: "버블", insertion: "삽입", selection: "선택", merge: "병합", quick: "퀵", heap: "힙" };
        let algo = ALGOS[spec.algo] ? spec.algo : "insertion";
        let n = spec.n || 16;
        let input = spec.input || "random";
        let speed = 120;
        let seed = 7;
        let stepCtl = null;
        const bar = ctlBar(host);
        const box = document.createElement("div");
        host.append(box);
        const out = readout(host);
        const build = () => {
            if (stepCtl) stepCtl.stop();
            const arr = sortInput(input, n, seed);
            const frames = sortFrames(algo, arr);
            const mx = Math.max(...arr);
            box.innerHTML = `<div class="demo-stage"><div class="bars">${arr.map(() => "<i></i>").join("")}</div></div>`;
            const bars = [...box.querySelectorAll(".bars i")];
            stepCtl = stepper(box, frames.length, (i) => {
                const f = frames[i];
                const cmp = new Set(f.cmp);
                const sw = new Set(f.sw);
                bars.forEach((b, k) => {
                    b.style.height = `${(f.a[k] / mx) * 100}%`;
                    b.className = sw.has(k) ? "sw" : cmp.has(k) ? "cmp" : f.done.has(k) ? "done" : "";
                    b.title = f.a[k];
                });
                out([["알고리즘", ALGOS[algo]], ["n", n], ["비교", f.c], ["교환·쓰기", f.s], ["n²/2", Math.round((n * n) / 2)], ["n·log₂n", Math.round(n * Math.log2(n))]]);
                return f.text;
            }, { interval: speed, auto: false });
        };
        seg(bar, "", Object.entries(ALGOS).map(([k, v]) => [k, v]), algo, (v) => { algo = v; build(); });
        seg(bar, "입력", [["random", "무작위"], ["nearly", "거의 정렬"], ["reversed", "역순"], ["few", "중복 많음"]], input, (v) => { input = v; build(); });
        seg(bar, "n", [8, 16, 32].map((v) => [v, v]), n, (v) => { n = +v; build(); });
        seg(bar, "속도", [["400", "느림"], ["120", "보통"], ["30", "빠름"]], "120", (v) => { speed = +v; build(); });
        button(bar, "새 배열", () => { seed++; build(); });
        build();
    };

    /* ---------- protocol labs: pure models (tested by check.mjs) ---------- */
    // UART frame: [{ k: "idle"|"start"|"d0".."d8"|"par"|"stop", v }]
    function uartFrame(byte, bits = 8, parity = "none", stop = 1) {
        const f = [{ k: "start", v: 0 }];
        let ones = 0;
        for (let i = 0; i < bits; i++) { const v = (byte >> i) & 1; ones += v; f.push({ k: `d${i}`, v }); }
        if (parity !== "none") f.push({ k: "par", v: parity === "even" ? ones % 2 : 1 - (ones % 2) });
        for (let i = 0; i < stop; i++) f.push({ k: "stop", v: 1 });
        return f;
    }
    // baud generator with oversampling ovs (16 or 8): divider = round(fclk / baud), steps of 1/ovs of a bit
    function uartBaud(fclk, baud, ovs = 16) {
        const div = Math.round(fclk / baud);
        if (div < ovs) return { div, actual: NaN, err: NaN, ok: false };
        const actual = fclk / div;
        return { div, actual, err: (actual - baud) / baud, ok: true, mant: Math.floor(div / ovs), frac: div % ovs };
    }
    // receiver with relative clock error e (+ = receiver bit time longer): sample each bit at its middle from the start edge
    function uartRx(frame, e) {
        const samples = frame.map((_, k) => (k + 0.5) / (1 + e)); // in TX bit times; e > 0 = receiver clock fast
        const got = samples.map((t) => { const k = Math.floor(t); return k < frame.length ? frame[k].v : 1; });
        const data = frame.reduce((acc, b, k) => (b.k[0] === "d" && b.k !== "d" ? acc + got[k] * 2 ** +b.k.slice(1) : acc), 0);
        const stopOk = frame.every((b, k) => b.k !== "stop" || got[k] === 1);
        const bad = frame.map((b, k) => got[k] !== b.v);
        return { samples, got, data, stopOk, bad, ok: !bad.some(Boolean) };
    }
    // CAN arbitration: ids send MSB first, bus = AND (0 dominant); a node that sends 1 but reads 0 drops out
    function canArb(ids, width = 11) {
        let alive = ids.map(() => true);
        const steps = [];
        for (let b = width - 1; b >= 0; b--) {
            const vals = ids.map((id) => (id >> b) & 1);
            const bus = vals.reduce((acc, v, k) => (alive[k] ? acc & v : acc), 1);
            const lost = ids.map((_, k) => alive[k] && vals[k] === 1 && bus === 0);
            steps.push({ bit: b, vals, bus, alive: alive.slice(), lost });
            alive = alive.map((a, k) => a && !lost[k]);
        }
        return { steps, winner: ids.findIndex((_, k) => alive[k]) };
    }
    // bit stuffing: after 5 equal bits insert the complement
    function canStuff(bits) {
        const out = [];
        const stuffed = [];
        let run = 0;
        let last = -1;
        for (const b of bits) {
            out.push(b);
            run = b === last ? run + 1 : 1;
            last = b;
            if (run === 5) { out.push(1 - b); stuffed.push(out.length - 1); last = 1 - b; run = 1; }
        }
        return { out, stuffed };
    }
    // CAN 2.0A data frame header + data bits (SOF … data), the region shown for stuffing
    const canBits = (id, data) => {
        const bits = [0];
        for (let b = 10; b >= 0; b--) bits.push((id >> b) & 1);
        bits.push(0, 0, 0); // RTR (data), IDE (standard), r0
        for (let b = 3; b >= 0; b--) bits.push((data.length >> b) & 1);
        data.forEach((x) => { for (let b = 7; b >= 0; b--) bits.push((x >> b) & 1); });
        return bits;
    };
    LAB.proto = { uartFrame, uartBaud, uartRx, canArb, canStuff, canBits };

    // UART: frame bits on the wire, baud divider error, receiver sampling drift
    SIMS.uart = (host, spec) => {
        let byte = (spec.byte ?? 0x41) & 0xff;
        let baud = spec.baud || 115200;
        let fclk = spec.fclk || 16e6;
        let ovs = spec.oversample === 8 ? 8 : 16;
        let bits = spec.bits === 7 ? 7 : 8;
        let parity = ["even", "odd"].includes(spec.parity) ? spec.parity : "none";
        let stop = spec.stop === 2 ? 2 : 1;
        let skew = 0;
        const st = stage(host);
        const cv = canvas(st, 190);
        const bar = ctlBar(host);
        const bar2 = ctlBar(host);
        const out = readout(host);
        const draw = () => {
            const { ctx, w, h } = cv;
            if (!w) return;
            const C = vars(host);
            const f = uartFrame(byte, bits, parity, stop);
            const B = uartBaud(fclk, baud, ovs);
            const e = (B.ok ? B.err : 0) + skew / 100;
            const rx = uartRx(f, e);
            ctx.clearRect(0, 0, w, h);
            const n = f.length + 2;
            const X = (t) => 12 + ((t + 1) / n) * (w - 24);
            const hi = 40;
            const lo = 110;
            ctx.font = "11px Consolas, monospace";
            ctx.textAlign = "center";
            f.forEach((b, k) => {
                ctx.fillStyle = b.k === "start" || b.k === "stop" ? rgba(C.warn, 0.1) : b.k === "par" ? rgba(C.bad, 0.1) : rgba(C.c, 0.08);
                ctx.fillRect(X(k), hi - 14, X(k + 1) - X(k), lo - hi + 28);
                ctx.fillStyle = C.muted;
                ctx.fillText(b.k === "start" ? "S" : b.k === "stop" ? "P" : b.k === "par" ? "패리티" : b.k.toUpperCase(), (X(k) + X(k + 1)) / 2, hi - 20);
                ctx.fillStyle = C.text;
                ctx.fillText(b.v, (X(k) + X(k + 1)) / 2, lo + 30);
            });
            ctx.strokeStyle = C.c;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            const lvl = (v) => (v ? hi : lo);
            ctx.moveTo(X(-1), hi);
            let prev = 1;
            f.forEach((b, k) => { if (b.v !== prev) { ctx.lineTo(X(k), lvl(prev)); ctx.lineTo(X(k), lvl(b.v)); } prev = b.v; });
            ctx.lineTo(X(f.length), lvl(prev));
            ctx.lineTo(X(f.length), hi);
            ctx.lineTo(X(f.length + 1), hi);
            ctx.stroke();
            rx.samples.forEach((t, k) => {
                const x = X(t);
                ctx.strokeStyle = rx.bad[k] ? C.bad : C.ok;
                ctx.lineWidth = 1.5;
                ctx.setLineDash([3, 3]);
                ctx.beginPath(); ctx.moveTo(x, hi - 8); ctx.lineTo(x, lo + 8); ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = rx.bad[k] ? C.bad : C.ok;
                ctx.beginPath(); ctx.arc(x, rx.got[k] ? hi : lo, 3.5, 0, 7); ctx.fill();
            });
            ctx.textAlign = "left";
            ctx.fillStyle = C.muted;
            ctx.fillText("— 송신 파형 (LSB 먼저)   ┊ 수신측 샘플 시점", 12, h - 8);
            const drift = (f.length - 0.5) * Math.abs(e) * 100;
            const hex = (v) => `0x${v.toString(16).toUpperCase().padStart(2, "0")}`;
            out([
                ["프레임", `${f.length} bit (${bits}${parity[0].toUpperCase()}${stop})`],
                ["1비트", `${(1e6 / baud).toFixed(2)} µs`],
                ["처리량", `${Math.round(baud / f.length).toLocaleString()} B/s`],
                ["분주", B.ok ? `${B.div} (정수 ${B.mant} · 소수 ${B.frac}/${ovs})` : `불가: fclk/baud < ${ovs}`, B.ok ? "" : "bad"],
                ["보레이트 오차", B.ok ? `${(B.err * 100).toFixed(2)}%` : "–", B.ok && Math.abs(B.err) > 0.02 ? "bad" : "good"],
                ["끝 비트 드리프트", `${drift.toFixed(0)}% 비트`, drift >= 50 ? "bad" : drift > 30 ? "" : "good"],
                ["수신", rx.ok ? `${hex(rx.data)} ✓` : `${hex(rx.data)} ✗ ${rx.stopOk ? "비트 오류" : "프레이밍 오류"}`, rx.ok ? "good" : "bad"]
            ]);
        };
        cv.draw = draw;
        const inp = textIn(bar, "바이트", `0x${byte.toString(16).toUpperCase()}`, (s) => {
            const v = s.length === 1 ? s.charCodeAt(0) : parseInt2(s, 8);
            if (v === null || Number.isNaN(v)) LAB.toast("0x41 · 65 · A"); else byte = v & 0xff;
            draw();
        });
        void inp;
        seg(bar, "데이터", [["7", "7"], ["8", "8"]], String(bits), (v) => { bits = +v; draw(); });
        seg(bar, "패리티", [["none", "없음"], ["even", "짝수"], ["odd", "홀수"]], parity, (v) => { parity = v; draw(); });
        seg(bar, "정지", [["1", "1"], ["2", "2"]], String(stop), (v) => { stop = +v; draw(); });
        seg(bar2, "보레이트", [9600, 57600, 115200, 460800, 921600].map((v) => [v, v >= 1000 ? `${v / 1000}k` : v]), baud, (v) => { baud = +v; draw(); });
        seg(bar2, "클럭", [8e6, 16e6, 48e6, 72e6].map((v) => [v, `${v / 1e6}M`]), fclk, (v) => { fclk = +v; draw(); });
        seg(bar2, "오버샘플", [["16", "×16"], ["8", "×8"]], String(ovs), (v) => { ovs = +v; draw(); });
        slider(bar2, "수신 클럭 오차", -10, 10, 0.5, skew, (v) => `${v > 0 ? "+" : ""}${v}%`, (v) => { skew = v; draw(); });
        cv.fit();
    };

    // CAN: bitwise arbitration between nodes, then bit stuffing of the winner's frame
    SIMS.can = (host, spec) => {
        let ids = (spec.ids || [0x123, 0x120, 0x7ff]).slice(0, 3);
        let data = spec.data || [0x00, 0xff];
        let stepCtl = null;
        const bar = ctlBar(host);
        const box = document.createElement("div");
        host.append(box);
        const out = readout(host);
        const hx = (v) => `0x${v.toString(16).toUpperCase().padStart(3, "0")}`;
        const build = () => {
            if (stepCtl) stepCtl.stop();
            const A = canArb(ids);
            const win = ids[A.winner];
            const raw = canBits(win, data);
            const S = canStuff(raw);
            const stuffSet = new Set(S.stuffed);
            box.innerHTML = `<div class="demo-stage" style="padding:0"><div class="bits-lab">
              <div class="lab-name">중재: 11bit ID 를 MSB 부터 동시에 송신 · 버스 = AND (0 = 우성)</div>
              <div class="can-arb" style="grid-template-columns:64px repeat(11, minmax(0, 1fr)) 70px">
                <b></b>${A.steps.map((s) => `<b>${s.bit}</b>`).join("")}<b></b>
                ${ids.map((id, k) => `<b>노드 ${"ABC"[k]}</b>${A.steps.map((s, j) => `<i data-n="${k}" data-j="${j}">${s.vals[k]}</i>`).join("")}<span data-st="${k}"></span>`).join("")}
                <b>버스</b>${A.steps.map((s, j) => `<i class="bus" data-j="${j}">${s.bus}</i>`).join("")}<span></span>
              </div>
              <div class="lab-name">이긴 프레임 SOF~데이터 (${raw.length} bit) → 스터핑 후 ${S.out.length} bit · <span style="color:var(--warn)">■</span> 스터프 비트</div>
              <div class="can-stuff">${S.out.map((b, k) => `<i class="${stuffSet.has(k) ? "st" : ""}">${b}</i>`).join("")}</div>
            </div></div>`;
            const cells = [...box.querySelectorAll(".can-arb i")];
            stepCtl = stepper(box, A.steps.length, (j) => {
                const s = A.steps[j];
                cells.forEach((el) => {
                    const jj = +el.dataset.j;
                    const k = el.dataset.n === undefined ? -1 : +el.dataset.n;
                    const st = A.steps[jj];
                    el.className = `${el.classList.contains("bus") ? "bus " : ""}${jj > j ? "future" : ""}${k >= 0 && !st.alive[k] ? " out" : ""}${k >= 0 && st.lost[k] && jj <= j ? " lost" : ""}${jj === j ? " cur" : ""}`;
                });
                ids.forEach((_, k) => {
                    const el = box.querySelector(`[data-st="${k}"]`);
                    const lostAt = A.steps.findIndex((x, jj) => jj <= j && x.lost[k]);
                    el.textContent = lostAt >= 0 ? `탈락 (bit ${A.steps[lostAt].bit})` : j === A.steps.length - 1 && k === A.winner ? "승리 ✓" : "송신 중";
                    el.className = lostAt >= 0 ? "out" : k === A.winner && j === A.steps.length - 1 ? "win" : "";
                });
                const losers = ids.filter((_, k) => s.lost[k]).map(hx);
                return `bit ${s.bit}: 버스 = ${s.bus}${losers.length ? ` · ${losers.join(", ")} 은 1 을 보냈는데 0 을 읽음 → **탈락**` : ""}${j === A.steps.length - 1 ? ` · 승자 ${hx(win)} (가장 작은 ID)` : ""}`;
            }, { interval: 900 });
            out([["승자", hx(win), "good"], ["스터프 비트", S.stuffed.length], ["DLC", data.length], ["데이터", data.map((x) => x.toString(16).toUpperCase().padStart(2, "0")).join(" ") || "–"]]);
        };
        const idIn = textIn(bar, "ID", ids.map((x) => x.toString(16).toUpperCase()).join(" "), (s) => {
            const v = s.split(/[\s,]+/).filter(Boolean).map((x) => parseInt(x.replace(/^0x/i, ""), 16)).filter((x) => x >= 0 && x <= 0x7ff);
            if (v.length < 2) LAB.toast("16진 ID 2~3개 (예: 123 120 7FF)"); else { ids = v.slice(0, 3); build(); }
        }, true);
        void idIn;
        textIn(bar, "데이터", data.map((x) => x.toString(16).toUpperCase().padStart(2, "0")).join(" "), (s) => {
            const v = s.split(/[\s,]+/).filter(Boolean).map((x) => parseInt(x.replace(/^0x/i, ""), 16));
            if (v.length > 8 || v.some((x) => !(x >= 0 && x <= 255))) LAB.toast("바이트 0~8개 (예: 00 FF)"); else { data = v; build(); }
        }, true);
        build();
    };

    /* ---------- AI labs: pure models (tested by check.mjs) ---------- */
    // BPE (Sennrich et al. 2016): words as symbols + "</w>", repeatedly merge the most frequent adjacent pair
    const EOW = "</w>";
    const bpeWords = (text) => {
        const counts = new Map();
        String(text).trim().split(/\s+/).filter(Boolean).forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
        return [...counts].map(([w, n]) => ({ w, n, s: [...w, EOW] }));
    };
    function bpePairs(words) {
        const m = new Map(); // insertion order = first seen → deterministic ties
        words.forEach(({ n, s }) => { for (let i = 0; i < s.length - 1; i++) { const k = `${s[i]}\u0000${s[i + 1]}`; m.set(k, (m.get(k) || 0) + n); } });
        return [...m].map(([k, n]) => [...k.split("\u0000"), n]);
    }
    const bpeMerge = (s, a, b) => { const o = []; for (let i = 0; i < s.length; i++) { if (i < s.length - 1 && s[i] === a && s[i + 1] === b) { o.push(a + b); i++; } else o.push(s[i]); } return o; };
    function bpeLearn(text, n) {
        let words = bpeWords(text);
        const merges = [];
        const steps = [{ words: words.map((x) => ({ ...x, s: x.s.slice() })), pairs: bpePairs(words) }];
        for (let k = 0; k < n; k++) {
            const pairs = bpePairs(words);
            if (!pairs.length) break;
            const best = pairs.reduce((m, p) => (p[2] > m[2] ? p : m));
            if (best[2] < 2) break; // nothing repeats any more
            merges.push(best);
            words = words.map((x) => ({ ...x, s: bpeMerge(x.s, best[0], best[1]) }));
            steps.push({ words: words.map((x) => ({ ...x, s: x.s.slice() })), pairs: bpePairs(words), merged: best });
        }
        return { merges, steps };
    }
    const bpeApply = (word, merges) => merges.reduce((s, [a, b]) => bpeMerge(s, a, b), [...word, EOW]);
    // vector search scores
    const vlen = (v) => Math.hypot(...v);
    const vdot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
    const vscore = (metric, q, v) => (metric === "dot" ? vdot(q, v) : metric === "l2" ? -Math.hypot(...q.map((x, i) => x - v[i])) : vdot(q, v) / (vlen(q) * vlen(v) || 1));
    const vrank = (docs, q, metric, norm) => docs.map((d, i) => {
        const v = norm ? d.v.map((x) => x / (vlen(d.v) || 1)) : d.v;
        const qq = norm ? q.map((x) => x / (vlen(q) || 1)) : q;
        return { i, s: vscore(metric, qq, v) };
    }).sort((a, b) => b.s - a.s);
    LAB.ai = { bpeWords, bpeLearn, bpeApply, vscore, vrank };

    // BPE tokenizer: merge steps on a tiny corpus, then tokenize a new word
    SIMS.bpe = (host, spec) => {
        let corpus = spec.corpus || "low low low low low lower lower newest newest newest newest newest newest widest widest widest";
        let word = spec.word || "lowest";
        let k = Math.min(spec.merges ?? 4, 20);
        let L = bpeLearn(corpus, 20);
        const st = stage(host, true);
        st.innerHTML = `<div class="bpe"><div><h4>말뭉치 (단어 × 빈도) · 현재 분할</h4><div class="bpe-w"></div><h4>인접 쌍 빈도 (상위)</h4><div class="bpe-p"></div></div>
          <div><h4>배운 병합 순서</h4><ol class="bpe-m"></ol><h4>새 단어 토큰화</h4><div class="bpe-t"></div></div></div><div class="cpu-cap"></div>`;
        const bar = ctlBar(host);
        const out = readout(host);
        const $q = (x) => st.querySelector(x);
        const tok = (s, hl) => s.map((x) => `<b class="${hl && hl.has(x) ? "new" : ""}">${esc(x.replace(EOW, "_"))}</b>`).join("");
        const draw = () => {
            const n = Math.min(k, L.merges.length);
            const S = L.steps[n];
            const last = n ? L.merges[n - 1] : null;
            const fresh = new Set(last ? [last[0] + last[1]] : []);
            $q(".bpe-w").innerHTML = S.words.map((x) => `<div class="bpe-row"><span>${esc(x.w)} ×${x.n}</span><div>${tok(x.s, fresh)}</div></div>`).join("");
            const top = S.pairs.slice().sort((a, b) => b[2] - a[2]).slice(0, 6);
            const next = L.merges[n];
            $q(".bpe-p").innerHTML = top.map((p) => `<div class="bpe-row${next && p[0] === next[0] && p[1] === next[1] ? " pick" : ""}"><span>${esc(p[0].replace(EOW, "_"))} + ${esc(p[1].replace(EOW, "_"))}</span><div><i style="width:${(p[2] / top[0][2]) * 100}%"></i><em>${p[2]}</em></div></div>`).join("") || "<span class='muted'>더 합칠 쌍 없음</span>";
            $q(".bpe-m").innerHTML = L.merges.slice(0, n).map((m, i) => `<li class="${i === n - 1 ? "new" : ""}">${esc(m[0].replace(EOW, "_"))} + ${esc(m[1].replace(EOW, "_"))} → <b>${esc((m[0] + m[1]).replace(EOW, "_"))}</b> <small>(${m[2]})</small></li>`).join("") || "<li class='muted'>아직 없음 · 글자 단위</li>";
            const t = bpeApply(word, L.merges.slice(0, n));
            $q(".bpe-t").innerHTML = `<div class="bpe-row"><span>${esc(word)}</span><div>${tok(t)}</div></div>`;
            const vocab = new Set(S.words.flatMap((x) => x.s));
            $q(".cpu-cap").innerHTML = fmt(last ? `${n}번째 병합: 가장 많이 붙어 나온 **${last[0].replace(EOW, "_")} + ${last[1].replace(EOW, "_")}** (${last[2]}회) → 새 토큰 **${(last[0] + last[1]).replace(EOW, "_")}**` : "처음엔 모든 단어가 글자 + 단어 끝 표시(`_`)로 나뉨");
            out([["병합", `${n} / ${L.merges.length}`], ["말뭉치 기호 종류", vocab.size], ["말뭉치 토큰 수", S.words.reduce((s, x) => s + x.s.length * x.n, 0)], [`'${word}' 토큰`, t.length]]);
        };
        const sl = slider(bar, "병합 횟수", 0, L.merges.length, 1, Math.min(k, L.merges.length), (v) => v, (v) => { k = v; draw(); });
        button(bar, "−1", () => { k = Math.max(0, Math.min(k, L.merges.length) - 1); sl.set(k); draw(); });
        button(bar, "+1", () => { k = Math.min(L.merges.length, k + 1); sl.set(k); draw(); }, true);
        textIn(bar, "새 단어", word, (s) => { word = s.replace(/\s/g, "") || word; draw(); });
        textIn(bar, "말뭉치", corpus, (s) => { if (s.trim()) { corpus = s; L = bpeLearn(corpus, 20); sl.max = L.merges.length; k = Math.min(k, L.merges.length); sl.set(k); } draw(); }, true);
        draw();
    };

    // vector search: drag the query, compare cosine / dot / L2, top-k
    SIMS.vector = (host, spec) => {
        const docs = spec.docs || [
            { t: "UART 보레이트", v: [0.9, 0.15] }, { t: "SPI 클럭 모드", v: [0.75, 0.45] }, { t: "I2C 풀업 저항", v: [0.55, 0.25] },
            { t: "PID 튜닝", v: [-0.6, 0.7] }, { t: "칼만 필터", v: [-0.8, 0.35] }, { t: "긴 통신 매뉴얼", v: [1.8, 1.1] }, { t: "어텐션", v: [-0.2, -0.9] }
        ];
        let q = spec.query || [0.8, 0.3];
        let metric = ["cosine", "dot", "l2"].includes(spec.metric) ? spec.metric : "cosine";
        let norm = false;
        let K = spec.k || 2;
        const st = stage(host);
        st.classList.add("vec");
        const cvHost = document.createElement("div");
        const list = document.createElement("div");
        list.className = "vec-list";
        st.append(cvHost, list);
        const cv = canvas(cvHost, (w) => Math.min(340, w));
        const bar = ctlBar(host);
        const out = readout(host);
        const R = 2.2; // plot half-range
        const P = (v) => [cv.w / 2 + (v[0] / R) * (cv.w / 2 - 14), cv.h / 2 - (v[1] / R) * (cv.h / 2 - 14)];
        const draw = () => {
            const { ctx, w, h } = cv;
            if (!w) return;
            const C = vars(host);
            const rank = vrank(docs, q, metric, norm);
            const top = new Set(rank.slice(0, K).map((r) => r.i));
            ctx.clearRect(0, 0, w, h);
            ctx.strokeStyle = C.line;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
            if (norm) { ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(w / 2, h / 2, (1 / R) * (w / 2 - 14), 0, 7); ctx.stroke(); ctx.setLineDash([]); }
            const O = P([0, 0]);
            ctx.font = "12px Pretendard, Segoe UI, sans-serif";
            docs.forEach((d, i) => {
                const v = norm ? d.v.map((x) => x / vlen(d.v)) : d.v;
                const [x, y] = P(v);
                ctx.strokeStyle = top.has(i) ? C.ok : rgba(C.muted, 0.5);
                ctx.lineWidth = top.has(i) ? 2.2 : 1.2;
                ctx.beginPath(); ctx.moveTo(O[0], O[1]); ctx.lineTo(x, y); ctx.stroke();
                ctx.fillStyle = top.has(i) ? C.ok : C.muted;
                ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill();
                ctx.fillText(d.t, x + 7, y - 6);
            });
            const qq = norm ? q.map((x) => x / vlen(q)) : q;
            const [qx, qy] = P(qq);
            ctx.strokeStyle = C.c;
            ctx.lineWidth = 2.6;
            ctx.beginPath(); ctx.moveTo(O[0], O[1]); ctx.lineTo(qx, qy); ctx.stroke();
            ctx.fillStyle = C.c;
            ctx.beginPath(); ctx.arc(qx, qy, 8, 0, 7); ctx.fill();
            ctx.fillText("질의 (드래그)", qx + 10, qy + 16);
            list.innerHTML = `<h4>${{ cosine: "코사인 유사도", dot: "내적", l2: "L2 거리 (작을수록 가까움)" }[metric]}</h4>` + rank.map((r, n) => `<div class="vrow${n < K ? " top" : ""}"><span>${n + 1}. ${esc(docs[r.i].t)}</span><b>${(metric === "l2" ? -r.s : r.s).toFixed(3)}</b></div>`).join("");
            out([["질의", `(${q[0].toFixed(2)}, ${q[1].toFixed(2)})`], ["|질의|", vlen(q).toFixed(2)], ["top-k", K], ["1위", docs[rank[0].i].t, "good"]]);
        };
        cv.draw = draw;
        const move = (e) => {
            const r = cv.cv.getBoundingClientRect();
            const x = ((e.clientX - r.left - cv.w / 2) / (cv.w / 2 - 14)) * R;
            const y = (-(e.clientY - r.top - cv.h / 2) / (cv.h / 2 - 14)) * R;
            q = [clamp(x, -R, R), clamp(y, -R, R)];
            if (Math.hypot(...q) < 0.05) q = [0.05, 0];
            draw();
        };
        cv.cv.addEventListener("pointerdown", (e) => { cv.cv.setPointerCapture(e.pointerId); move(e); });
        cv.cv.addEventListener("pointermove", (e) => { if (e.buttons) move(e); });
        seg(bar, "거리", [["cosine", "코사인"], ["dot", "내적"], ["l2", "L2"]], metric, (v) => { metric = v; draw(); });
        seg(bar, "정규화", [["0", "원래 길이"], ["1", "단위 벡터"]], "0", (v) => { norm = v === "1"; draw(); });
        slider(bar, "top-k", 1, docs.length, 1, K, (v) => v, (v) => { K = v; draw(); });
        cv.fit();
    };

    /* ---------- RAG track: keyword vs meaning vs hybrid retrieval (pure model tested by check.mjs) ---------- */
    // Invented IT-helpdesk tickets (fictional example). floor / bldg are metadata used as filters, not searchable text.
    const HYB_DOCS = [
        [101, 2, "본관", "와이파이 통신 끊김 오류 E-4012 · 랜 케이블 커넥터 재연결 후 정상"],
        [102, 3, "본관", "공유 폴더 접근 거부 · 권한 재설정"],
        [103, 3, "본관", "디스플레이 신호 없음 · 영상 단자 재장착"],
        [104, 2, "별관", "프린터 용지 걸림 반복 · 급지 롤러 청소"],
        [105, 3, "본관", "네트워크 연결 안 됨 · 스위치 포트 교체"],
        [106, 1, "별관", "로그인 실패 반복 · 비밀번호 초기화"],
        [107, 2, "본관", "무선 마우스 반응 없음 · 수신기 배터리 교체"],
        [108, 3, "본관", "오류 E-4012 VPN 응답 타임아웃 · 허브 전원 재인가"],
        [109, 2, "별관", "디스크 용량 부족 경고 · 임시 파일 정리"],
        [110, 1, "본관", "UPS 배터리 경고 · 배터리 교체"],
        [111, 2, "별관", "통신 끊김 반복 · 커넥터 재연결"],
        [112, 1, "본관", "통신 끊김 · 허브 교체"],
        [113, 1, "별관", "모니터 깜빡임 · 단자 청소"]
    ].map(([id, floor, bldg, t]) => ({ id, floor, bldg, t }));
    const HYB_QUERIES = [
        { q: "모니터 화면이 안 나옴", gold: [103, 113], text: "바꿔 말하기(paraphrase): #103 은 '디스플레이 신호'라고 적혀 있어 단어가 하나도 안 겹침 → 키워드는 #113 만, 의미 검색은 둘 다" },
        { q: "E-4012 오류", gold: [101, 108], text: "코드 검색: 'e-4012' 는 의미 사전에 없어 의미 벡터가 0 → 키워드만 찾음 · 하이브리드는 키워드 다리로 구제" },
        { q: "본관 3층 통신 끊김", gold: [105, 108], text: "건물·층은 단어가 아니라 **조건**: 필터를 끄면 다른 층의 '통신 끊김'이 위를 차지 · 필터를 켜면 본관 3층 티켓만 후보" },
        { q: "프린터 용지가 또 걸림", gold: [104], text: "쉬운 질문: 단어도 겹치고 의미도 같음 → 세 방식 모두 #104" }
    ];
    const PARTICLES = ["에서", "으로", "이나", "은", "는", "이", "가", "을", "를", "에", "의", "로", "와", "과", "도", "만"];
    // lower-case words, codes kept whole ("e-4012"), a trailing particle cut from words longer than 2 that end in Hangul, words < 2 chars dropped
    const hyTok = (s) => (String(s).toLowerCase().match(/[0-9a-z가-힣]+(?:-[0-9a-z]+)*/g) || []).map((w) => {
        if (/[가-힣]$/.test(w) && w.length > 2) { const p = PARTICLES.find((x) => w.endsWith(x)); if (p) w = w.slice(0, -p.length); }
        return w;
    }).filter((w) => w.length >= 2);
    // Okapi BM25 (Robertson & Zaragoza 2009), Lucene's idf = ln(1 + (N − n + 0.5) / (n + 0.5))
    function bm25(docToks, q, k1 = 1.2, b = 0.75) {
        const N = docToks.length;
        const avg = docToks.reduce((s, d) => s + d.length, 0) / (N || 1);
        const df = new Map();
        docToks.forEach((d) => new Set(d).forEach((w) => df.set(w, (df.get(w) || 0) + 1)));
        return docToks.map((d) => [...new Set(q)].reduce((s, w) => {
            const n = df.get(w) || 0;
            const f = d.filter((x) => x === w).length;
            if (!n || !f) return s;
            return s + Math.log(1 + (N - n + 0.5) / (n + 0.5)) * (f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.length) / avg));
        }, 0));
    }
    // toy embedding: each known word points along one concept axis; text = normalised sum. Real models learn thousands of axes.
    const HYB_AXES = ["통신", "화면", "출력", "전원", "계정", "저장"];
    const HYB_SYN = {
        통신: "통신 끊김 끊겨 연결 네트워크 와이파이 랜 이더넷 케이블 커넥터 스위치 포트 허브 타임아웃 응답 vpn",
        화면: "모니터 화면 디스플레이 영상 깜빡임 해상도",
        출력: "프린터 용지 걸림 급지 롤러 토너 인쇄",
        전원: "전원 ups 배터리 정전 충전",
        계정: "로그인 비밀번호 계정 권한 인증 접근",
        저장: "디스크 용량 저장 파일 폴더 백업"
    };
    const AXIS_OF = new Map(Object.entries(HYB_SYN).flatMap(([a, ws]) => ws.split(" ").map((w) => [w, HYB_AXES.indexOf(a)])));
    const toyEmbed = (toks) => {
        const v = HYB_AXES.map(() => 0);
        toks.forEach((w) => { const a = AXIS_OF.get(w); if (a != null) v[a]++; });
        const n = Math.hypot(...v);
        return n ? v.map((x) => x / n) : v;
    };
    // Reciprocal Rank Fusion (Cormack et al. 2009): score(d) = Σ over lists of 1 / (k + rank), rank from 1
    const rrf = (lists, k = 60) => {
        const s = new Map();
        lists.forEach((l) => l.forEach((d, r) => s.set(d, (s.get(d) || 0) + 1 / (k + r + 1))));
        return s;
    };
    const recallAt = (ids, gold, K) => (gold.length ? ids.slice(0, K).filter((d) => gold.includes(d)).length / gold.length : null);
    // both legs see the same candidates; BM25 statistics come from the whole collection
    function hybridRun(docs, query, opt = {}) {
        const toks = hyTok(query);
        const dt = docs.map((d) => hyTok(d.t));
        const bm = bm25(dt, toks);
        const qv = toyEmbed(toks);
        const cos = dt.map((t) => vdot(toyEmbed(t), qv));
        const m = String(query).match(/(\d+)\s*층/);
        const f = { floor: m ? +m[1] : null, bldg: (String(query).match(/본관|별관/) || [null])[0] };
        const use = !!opt.filter && (f.floor != null || !!f.bldg);
        const cand = docs.map((_, i) => i).filter((i) => !use || ((f.floor == null || docs[i].floor === f.floor) && (!f.bldg || docs[i].bldg === f.bldg)));
        const order = (sc) => cand.filter((i) => sc[i] > 1e-9).sort((a, b) => sc[b] - sc[a] || a - b);
        const bm25L = order(bm);
        const denseL = order(cos);
        const rs = rrf([bm25L, denseL], opt.k ?? 60);
        const fused = docs.map((_, i) => rs.get(i) || 0);
        const rank = { bm25: bm25L, dense: denseL, hybrid: order(fused) };
        const ids = Object.fromEntries(Object.entries(rank).map(([k2, l]) => [k2, l.map((i) => docs[i].id)]));
        return { toks, qv, filter: use ? f : null, cand, bm, cos, fused, rank, ids };
    }
    Object.assign(LAB.ai, { hyTok, bm25, toyEmbed, rrf, recallAt, hybridRun, HYB_DOCS, HYB_QUERIES, HYB_AXES });

    // hybrid retrieval: preset or typed question → BM25 list, toy-embedding list, RRF fusion, building/floor filter, recall@k
    SIMS.hybrid = (host, spec) => {
        const docs = HYB_DOCS;
        let qi = clamp(spec.preset ?? 0, 0, HYB_QUERIES.length - 1);
        let query = HYB_QUERIES[qi].q;
        let mode = ["bm25", "dense", "hybrid"].includes(spec.mode) ? spec.mode : "hybrid";
        let K = spec.top || 3;
        let k = spec.k || 60;
        let filt = !!spec.filter;
        const st = stage(host);
        st.classList.add("hyb");
        st.innerHTML = `<div class="hyb-list"></div><div class="hyb-side"><h4>질문 → 단어</h4><div class="hyb-q"></div><h4>질문의 의미 벡터 (장난감 6축)</h4><div class="hyb-v"></div><h4>조건 필터</h4><div class="hyb-f"></div><div class="hyb-note"></div></div>`;
        const $ = (s) => st.querySelector(s);
        const bar = ctlBar(host);
        const out = readout(host);
        const NAME = { bm25: "키워드 (BM25)", dense: "의미 (코사인)", hybrid: "하이브리드 (RRF)" };
        const draw = () => {
            const R = hybridRun(docs, query, { k, filter: filt });
            const P = qi >= 0 ? HYB_QUERIES[qi] : null;
            const gold = P ? P.gold : [];
            const ranked = R.rank[mode];
            const rest = docs.map((_, i) => i).filter((i) => !ranked.includes(i));
            const at = (list, i) => { const r = list.indexOf(i); return r < 0 ? "" : ` <i>${r + 1}</i>`; };
            $(".hyb-list").innerHTML = `<h4>${NAME[mode]} 순위 · 상위 ${K}개 강조${mode === "hybrid" ? ` · k = ${k}` : ""}</h4>`
                + (ranked.length ? "" : "<div class='muted'>점수가 0 보다 큰 기록 없음</div>")
                + [...ranked, ...rest].map((i, n) => {
                    const d = docs[i];
                    const cls = [ranked.includes(i) ? (n < K ? "top" : "") : "zero", R.cand.includes(i) ? "" : "out"].join(" ");
                    return `<div class="hrow ${cls}"><span class="hid">#${d.id}<small>${d.bldg} ${d.floor}층</small></span>`
                        + `<span>${esc(d.t)}${gold.includes(d.id) ? " <em class='gold'>정답</em>" : ""}</span>`
                        + `<span class="hs">BM25 ${R.bm[i].toFixed(2)}${at(R.rank.bm25, i)}<br>cos ${R.cos[i].toFixed(2)}${at(R.rank.dense, i)}<br>RRF ${R.fused[i].toFixed(4)}</span></div>`;
                }).join("");
            $(".hyb-q").innerHTML = R.toks.map((w) => { const a = AXIS_OF.get(w); return `<b class="${a != null ? "ax" : ""}">${esc(w)}${a != null ? `<small>${HYB_AXES[a]}</small>` : ""}</b>`; }).join("") || "<span class='muted'>단어 없음</span>";
            $(".hyb-v").innerHTML = HYB_AXES.map((a, j) => `<div class="hv"><span>${a}</span><i style="width:${R.qv[j] * 100}%"></i><em>${R.qv[j].toFixed(2)}</em></div>`).join("")
                + (R.qv.some((x) => x) ? "" : "<div class='muted'>사전에 아는 단어가 없어 0 벡터 → 의미 검색 결과 없음</div>");
            $(".hyb-f").innerHTML = R.filter ? `${[R.filter.bldg, R.filter.floor != null && `${R.filter.floor}층`].filter(Boolean).join(" · ")} → 후보 ${R.cand.length} / ${docs.length}건`
                : filt ? "질문에 건물·층 없음 → 전체 후보" : "꺼짐 · '본관'·'3층'도 그냥 단어 취급 (티켓 본문에 없으니 안 맞음)";
            $(".hyb-note").innerHTML = fmt(P ? P.text : "직접 입력: 의미 벡터는 사전에 있는 단어만 반영 · 실제 임베딩 모델은 처음 보는 말도 벡터로 만듦");
            const rc = (m) => { const r = recallAt(R.ids[m], gold, K); return r == null ? "—" : r.toFixed(2); };
            out([[`recall@${K} 키워드`, rc("bm25")], ["의미", rc("dense")], ["하이브리드", rc("hybrid"), "good"], ["1위", ranked.length ? `#${docs[ranked[0]].id}` : "없음"]]);
        };
        let qIn = null;
        seg(bar, "질문", HYB_QUERIES.map((x, i) => [i, x.q]), qi, (v) => { qi = +v; query = HYB_QUERIES[qi].q; qIn.value = query; draw(); });
        qIn = textIn(bar, "직접 입력", query, (s) => { if (s) { query = s; qi = HYB_QUERIES.findIndex((x) => x.q === s); draw(); } }, true);
        seg(bar, "방식", Object.entries(NAME), mode, (v) => { mode = v; draw(); });
        seg(bar, "건물·층 필터", [["0", "끔"], ["1", "켬"]], filt ? "1" : "0", (v) => { filt = v === "1"; draw(); });
        slider(bar, "top-k", 1, 6, 1, K, (v) => v, (v) => { K = v; draw(); });
        slider(bar, "RRF k", 1, 100, 1, k, (v) => v, (v) => { k = v; draw(); });
        draw();
    };

    /* ---------- AI basics: what the model actually receives each turn (context window, memory file, compaction) ---------- */
    // Invented 13-turn chat; tok = rough token count. facts: memo = the app saved it to a memory file, gist = a summary keeps it.
    const CTX_TURNS = [
        ["user", "안녕, 나는 민수야. 파이썬으로 날씨 앱 만드는 중이야", 60, ["name", "app"]],
        ["ai", "반가워요, 민수 님! 날씨 앱 구조부터 정리해 볼까요? …", 250],
        ["user", "API 를 부르면 401 오류가 나 (로그 붙여 넣음)", 900, ["err"]],
        ["ai", "401 은 인증 실패예요. 요청 헤더의 API 키를 확인하세요 …", 700],
        ["user", "고쳤어! 이제 기온 그래프를 그리고 싶어", 50],
        ["ai", "matplotlib 예제 코드 …", 900],
        ["user", "축 글씨가 네모로 깨져", 40],
        ["ai", "한글 글꼴 설정 방법 …", 600],
        ["user", "앞으로 답은 짧게 해 줘", 20, ["short"]],
        ["ai", "네.", 20],
        ["user", "(한 달 치 CSV 붙여 넣음) 이거 분석해 줘", 1500],
        ["ai", "평균 기온 분석 결과 …", 500],
        ["user", "근데 내 이름이랑 무슨 앱 만든다고 했지? 처음 오류 코드는?", 50]
    ].map(([who, t, tok, facts]) => ({ who, t, tok, facts: facts || [] }));
    const CTX_FACTS = {
        name: { label: "이름 = 민수", memo: true, gist: true },
        app: { label: "날씨 앱을 만드는 중", memo: true, gist: true },
        err: { label: "처음 오류 코드 = 401", memo: false, gist: false },
        short: { label: "답은 짧게", memo: true, gist: true }
    };
    // At turn `at` the model sees: system prompt + (memory file) + (summary of dropped turns) + the newest whole turns that fit the limit.
    function ctxRun(turns, at, o = {}) {
        const limit = o.limit ?? 4096, sys = o.system ?? 400, memTok = o.memTok ?? 120, sumTok = o.sumTok ?? 250;
        const fill = (budget) => {
            const win = [];
            let used = 0;
            for (let i = at; i >= 0 && used + turns[i].tok <= budget; i--) { used += turns[i].tok; win.unshift(i); }
            return { win, used };
        };
        const base = sys + (o.memory ? memTok : 0);
        let r = fill(limit - base);
        const first = (x) => (x.win.length ? x.win[0] : at + 1);
        if (o.compact && first(r) > 0) r = fill(limit - base - sumTok);
        const dropped = [...Array(first(r)).keys()];
        const summary = !!o.compact && dropped.length > 0;
        const facts = Object.entries(CTX_FACTS).map(([key, f]) => {
            const said = turns.findIndex((t) => t.facts.includes(key));
            const via = said < 0 || said > at ? null : r.win.includes(said) ? "대화" : o.memory && f.memo ? "메모리 파일" : summary && f.gist ? "요약" : "잊힘";
            return { key, label: f.label, said, via };
        });
        return { win: r.win, dropped, summary, used: base + (summary ? sumTok : 0) + r.used, limit, facts };
    }
    Object.assign(LAB.ai, { CTX_TURNS, CTX_FACTS, ctxRun });

    // context window: slide through a chat and see which turns and facts the model still receives
    SIMS.context = (host, spec) => {
        const turns = CTX_TURNS;
        let at = clamp((spec.at ?? turns.length) - 1, 0, turns.length - 1);
        let limit = spec.limit || 4096;
        let memory = !!spec.memory;
        let compact = !!spec.compact;
        const st = stage(host);
        st.classList.add("hyb");
        st.innerHTML = `<div class="hyb-list"></div><div class="hyb-side"><h4>이번 요청에 들어간 토큰</h4><div class="ctx-bar"></div><div class="ctx-leg"></div><h4>모델이 아는 사실</h4><div class="ctx-f"></div><div class="hyb-note"></div></div>`;
        const $ = (s) => st.querySelector(s);
        const bar = ctlBar(host);
        const out = readout(host);
        const draw = () => {
            const R = ctxRun(turns, at, { limit, memory, compact });
            $(".hyb-list").innerHTML = `<h4>대화 기록 · ${at + 1}번째 메시지를 보낼 때</h4>` + turns.map((t, i) => {
                const st2 = i > at ? "아직" : R.win.includes(i) ? "보냄" : R.summary ? "요약됨" : "잘림";
                const cls = i > at ? "out" : R.win.includes(i) ? "top" : "zero";
                return `<div class="hrow ${cls}"><span class="hid">#${i + 1}<small>${t.who === "user" ? "사용자" : "AI"}</small></span><span>${esc(t.t)}</span><span class="hs">${t.tok} tok<br>${st2}</span></div>`;
            }).join("");
            const seg = [["시스템", 400, "var(--dim)"], memory && ["메모리", 120, "var(--warn)"], R.summary && ["요약", 250, "var(--c)"], ["대화", R.used - 400 - (memory ? 120 : 0) - (R.summary ? 250 : 0), "var(--ok)"]].filter(Boolean);
            $(".ctx-bar").innerHTML = seg.map(([n, v, c]) => `<i title="${n} ${v}" style="width:${(v / limit) * 100}%;background:${c}"></i>`).join("");
            $(".ctx-leg").innerHTML = seg.map(([n, v, c]) => `<span><b style="background:${c}"></b>${n} ${v}</span>`).join("") + `<span>한도 ${limit}</span>`;
            $(".ctx-f").innerHTML = R.facts.map((f) => `<div class="vrow${f.via && f.via !== "잊힘" ? " top" : ""}"><span>${esc(f.label)}</span><b>${f.via == null ? "아직 안 나옴" : f.via === "잊힘" ? "✗ 잊힘" : `✓ ${f.via}`}</b></div>`).join("");
            const lost = R.facts.filter((f) => f.via === "잊힘");
            $(".hyb-note").innerHTML = fmt(lost.length
                ? `모델은 매번 **이번 요청에 담긴 것만** 봄 · 앞부분 ${R.dropped.length}개 메시지가 한도 밖이라 '${lost.map((f) => f.label).join("', '")}'을(를) 모르는 채 답함 → "모른다" 또는 지어냄`
                : R.dropped.length ? `앞부분 ${R.dropped.length}개 메시지는 잘렸지만 필요한 사실은 ${memory ? "메모리 파일" : ""}${memory && R.summary ? "·" : ""}${R.summary ? "요약" : ""}로 다시 넣어 줌 · 세부(오류 코드 같은)는 요약에서 빠지기 쉬움`
                : "대화 전체가 한도 안 · 모델은 처음부터 지금까지를 다시 읽고 답함 (API 는 상태가 없음: 앱이 매번 전체를 다시 보냄)");
            out([["보낸 토큰", `${R.used} / ${limit}`], ["잘린 메시지", R.dropped.length], ["아는 사실", `${R.facts.filter((f) => f.via && f.via !== "잊힘").length} / ${R.facts.filter((f) => f.via).length}`, "good"]]);
        };
        slider(bar, "보낼 메시지", 1, turns.length, 1, at + 1, (v) => `#${v}`, (v) => { at = v - 1; draw(); });
        seg(bar, "컨텍스트 한도", [[2048, "2k"], [4096, "4k"], [8192, "8k"], [32768, "32k"]], limit, (v) => { limit = +v; draw(); });
        seg(bar, "메모리 파일", [["0", "끔"], ["1", "켬"]], memory ? "1" : "0", (v) => { memory = v === "1"; draw(); });
        seg(bar, "요약(compaction)", [["0", "끔"], ["1", "켬"]], compact ? "1" : "0", (v) => { compact = v === "1"; draw(); });
        draw();
    };

    /* ---------- round-5 labs: pure models (tested by check.mjs) ---------- */
    const hex2 = (v) => `0x${(v & 0xff).toString(16).toUpperCase().padStart(2, "0")}`;

    // I2C transaction (NXP UM10204). Each byte is 8 bits MSB first + a 9th clock where the receiver pulls SDA low (ACK) or leaves it high (NACK).
    // write: S · addr+W · reg · data… · P      read: S · addr+W · reg · Sr · addr+R · data from the slave (master ACKs, NACKs the last) · P
    // absent: nobody answers the address → NACK → master sends STOP. stretch: slave holds SCL low for that many slots before the first read byte.
    function i2cTxn({ addr = 0x68, op = "write", reg = 0x6b, data = [0x00], absent = false, stretch = 0 } = {}) {
        const f = [];
        const byte = (v, by, label, text) => f.push({ k: "byte", v: v & 0xff, by, label, text });
        const ack = (ok, by, text) => f.push({ k: "ack", v: ok ? 0 : 1, by, label: ok ? "A" : "N", text });
        const a7 = addr & 0x7f;
        f.push({ k: "S", by: "M", label: "S", text: "SCL High 동안 SDA ↓ = **START** · 버스 점유" });
        byte(a7 << 1, "M", `${hex2(a7)}+W`, `주소 ${hex2(a7)} 를 왼쪽으로 1비트 + R/W=0 → \`${hex2(a7 << 1)}\` · MSB 먼저`);
        if (absent) {
            ack(false, "-", "아무도 SDA 를 당기지 않음 → 풀업 때문에 High = **NACK** · 주소가 틀렸거나 장치가 없음");
            f.push({ k: "P", by: "M", label: "P", text: "마스터는 STOP 으로 포기 · 드라이버는 보통 `-ENXIO` / `HAL_ERROR`" });
            return f;
        }
        ack(true, "S", "9번째 클럭에서 **슬레이브**가 SDA 를 Low 로 = ACK");
        byte(reg, "M", `reg ${hex2(reg)}`, `레지스터 번호 ${hex2(reg)} (장치 안의 주소)`);
        ack(true, "S", "슬레이브 ACK");
        if (op === "write") {
            data.forEach((d, i) => { byte(d, "M", hex2(d), `데이터 ${i + 1}: ${hex2(d)} · 마스터가 씀`); ack(true, "S", "슬레이브 ACK · 많은 장치가 레지스터 번호를 자동 증가"); });
        } else {
            f.push({ k: "Sr", by: "M", label: "Sr", text: "STOP 없이 다시 START = **반복 시작(repeated START)** · 버스를 놓지 않고 방향만 바꿈" });
            byte((a7 << 1) | 1, "M", `${hex2(a7)}+R`, `같은 주소 + R/W=1 → \`${hex2((a7 << 1) | 1)}\``);
            ack(true, "S", "슬레이브 ACK · 이제 SDA 는 슬레이브가 구동");
            if (stretch) f.push({ k: "stretch", n: stretch, by: "S", label: "늘림", text: "슬레이브가 SCL 을 Low 로 붙잡음 = **클럭 스트레칭(clock stretching)** · 마스터는 SCL 이 실제로 올라갈 때까지 기다림" });
            data.forEach((d, i) => {
                const last = i === data.length - 1;
                byte(d, "S", hex2(d), `읽은 데이터 ${i + 1}: ${hex2(d)} · **슬레이브**가 구동`);
                ack(!last, "M", last ? "마지막 바이트는 마스터가 **NACK** → 슬레이브가 SDA 를 놓음" : "마스터 ACK = 더 읽겠다");
            });
        }
        f.push({ k: "P", by: "M", label: "P", text: "SCL High 동안 SDA ↑ = **STOP** · 버스 해제" });
        return f;
    }
    // fields → wave spec: 2 slots per bit (SCL low: SDA may change · SCL high: SDA must hold)
    function i2cWave(f) {
        let scl = "1";
        let sda = "1";
        let who = "z";
        let fld = "z";
        const wd = [];
        const fd = [];
        const steps = [];
        const add = (c, d, by, label) => {
            const from = scl.length;
            scl += c; sda += d;
            who += "=" + ".".repeat(c.length - 1); wd.push(by === "S" ? "슬레이브" : by === "M" ? "마스터" : "풀업");
            fld += "=" + ".".repeat(c.length - 1); fd.push(label);
            return from;
        };
        f.forEach((x) => {
            let from;
            if (x.k === "S") from = add("1", "0", x.by, x.label);
            else if (x.k === "Sr") from = add("011", "110", x.by, x.label);
            else if (x.k === "P") from = add("011", "001", x.by, x.label);
            else if (x.k === "stretch") from = add("0".repeat(x.n), sda[sda.length - 1].repeat(x.n), x.by, x.label);
            else if (x.k === "ack") from = add("01", `${x.v}${x.v}`, x.by, x.label);
            else from = add("01".repeat(8), [...Array(8)].map((_, i) => ((x.v >> (7 - i)) & 1).toString().repeat(2)).join(""), x.by, x.label);
            steps.push({ from, to: scl.length, tag: x.label, text: x.text });
        });
        scl += "1"; sda += "1"; who += "z"; fld += "z";
        return { signals: [{ name: "SCL", wave: scl }, { name: "SDA", wave: sda }, { name: "필드", wave: fld, data: fd }, { name: "SDA 구동", wave: who, data: wd }], steps };
    }

    // SPI mode = CPOL·2 + CPHA. CPOL = idle clock level. Edge k (1..16, in half clock periods after CS↓) is a leading edge when k is odd.
    // CPHA 0: the first bit is on the line at CS↓, sampled on leading edges, the next bit is shifted out on trailing edges.
    // CPHA 1: bits are shifted out on leading edges and sampled on trailing edges.
    // A slave samples on rising edges in modes 0 and 3, on falling edges in modes 1 and 2. If that is an edge where the master
    // changes MOSI, the read is a race: the value just before (old) or just after (new) the change, depending on timing.
    function spiEdges(byte, mMode, sMode, lsb = false) {
        const bits = Array.from({ length: 8 }, (_, i) => (byte >> (lsb ? i : 7 - i)) & 1);
        const cpol = mMode >> 1;
        const cpha = mMode & 1;
        const rising = (k) => (k % 2 === 1) !== (cpol === 1);
        const dataAt = (t) => { // t: half periods since CS↓, not exactly on an edge
            const i = cpha ? Math.floor((t - 1) / 2) : Math.floor(t / 2);
            return t < 0 || i < 0 || i > 7 ? "x" : bits[i];
        };
        const changes = new Set(Array.from({ length: 8 }, (_, i) => (cpha ? 2 * i + 1 : 2 * i + 2)));
        const sRise = sMode === 0 || sMode === 3;
        const samples = [];
        for (let k = 1; k <= 16; k++) {
            if (rising(k) !== sRise) continue;
            const race = changes.has(k);
            samples.push({ k, rise: rising(k), race, old: dataAt(k - 0.5), now: dataAt(k + 0.5), v: race ? null : dataAt(k) });
        }
        const read = (pick) => {
            const b = samples.map(pick);
            const v = b.includes("x") ? null : b.reduce((acc, x, i) => acc | (x << (lsb ? i : 7 - i)), 0);
            return { bits: b.map((x) => (x === "x" ? "?" : x)).join(""), v };
        };
        const race = samples.some((s) => s.race);
        const readOld = read((s) => (s.race ? s.old : s.v));
        const readNew = read((s) => (s.race ? s.now : s.v));
        return { bits, cpol, cpha, rising, dataAt, changes, samples, race, readOld, readNew, ok: !race && readOld.v === (byte & 0xff) };
    }
    // wave spec: 2 slots per half period, CS↓ at slot 2, edge k at slot boundary 2 + 2k
    function spiWave(byte, mMode, sMode, lsb) {
        const R = spiEdges(byte, mMode, sMode, lsb);
        const N = 38;
        let cs = "", sck = "", mosi = "";
        for (let s = 0; s < N; s++) {
            const t = (s - 2) / 2 + 0.25;
            const on = s >= 2 && s < 36;
            cs += on ? "0" : "1";
            const edges = t < 0 ? 0 : Math.min(16, Math.floor(t));
            sck += String(R.cpol ^ (edges & 1));
            const d = on ? R.dataAt(t) : "x";
            mosi += d === "x" ? "x" : String(d);
        }
        const tag = (s) => (s.race ? "?" : String(s.v));
        const steps = [{ from: 0, to: 3, tag: "CS↓", text: `CS Low = 선택 · 마스터 mode ${mMode} (CPOL=${R.cpol}, CPHA=${R.cpha}) · ${R.cpha ? "첫 엣지에서 첫 비트를 내보냄" : "첫 비트를 **첫 클럭 전에** 미리 내보냄"}` }]
            .concat(R.samples.map((s, i) => ({
                from: 2 * s.k + 1, to: 2 * s.k + 3, tag: `${i + 1}:${tag(s)}`,
                text: s.race ? `슬레이브 샘플 ${i + 1} (${s.rise ? "↑" : "↓"}): 마스터가 **같은 엣지에서 MOSI 를 바꿈** → 경합 · 직전 ${s.old} / 직후 ${s.now}`
                    : `슬레이브 샘플 ${i + 1} (${s.rise ? "↑" : "↓"}): MOSI 가 안정된 구간 → ${s.v}`
            })))
            .concat([{ from: 2, to: 36, tag: R.ok ? "OK" : "!", text: R.race ? `경합 ${R.samples.filter((s) => s.race).length}개 · 직전 값을 읽으면 \`${R.readOld.bits}\`, 직후 값이면 \`${R.readNew.bits}\` · 타이밍마다 달라짐` : `슬레이브가 읽은 비트 \`${R.readOld.bits}\` = ${hex2(R.readOld.v)} ${R.ok ? "✓" : "✗"}` }]);
        return { R, spec: { signals: [{ name: "CS", wave: cs }, { name: "SCLK", wave: sck }, { name: "MOSI", wave: mosi }], steps } };
    }
    Object.assign(LAB.proto, { i2cTxn, i2cWave, spiEdges, spiWave });

    // Cortex-M exception timing (Cortex-M4 TRM 3.9.1, zero wait state): entry ≤ 12 cycles, return 12 cycles, tail-chaining 6 cycles.
    // Priority p (4 implemented bits, 0 = highest): the top `pre` bits are the group (preemption) priority, the rest the subpriority.
    // Only a strictly higher group priority preempts; among pending ones the lowest (group, sub, IRQ number) goes first.
    // Late arrival: a higher one that arrives during stacking takes over the vector; stacking is not restarted.
    // ponytail: a pending IRQ that arrives during unstacking waits for the return to finish (real cores can abandon the pop); cycle loop, fine for a few hundred cycles
    const NVIC_T = { entry: 12, exit: 12, tail: 6 };
    function nvicRun(irqs, { bits = 4, pre = 4 } = {}) {
        const shift = bits - pre;
        const grp = (p) => p >> shift;
        const q = irqs.map((x, i) => ({ name: x.name || "ABCDEFG"[i], prio: x.prio, at: x.at, dur: x.dur, left: x.dur, i, start: null, end: null }));
        const order = (a, b) => grp(q[a].prio) - grp(q[b].prio) || q[a].prio - q[b].prio || a - b;
        const pend = new Set();
        const stack = [];
        let phase = "run";
        let cnt = 0;
        let target = -1;
        let exiting = -1;
        const ctxGrp = () => (stack.length ? grp(q[stack[stack.length - 1]].prio) : Infinity);
        const best = (limit) => [...pend].filter((i) => grp(q[i].prio) < limit).sort(order)[0];
        const horizon = Math.max(...q.map((x) => x.at)) + q.reduce((n, x) => n + x.dur + 32, 0) + 8;
        const cells = [];
        let tail = 0;
        let lates = 0;
        for (let t = 0; t < horizon; t++) {
            q.forEach((x) => { if (x.at === t) pend.add(x.i); });
            if (phase === "run") {
                const b = best(ctxGrp());
                if (b !== undefined) { pend.delete(b); target = b; phase = "entry"; cnt = NVIC_T.entry; }
            }
            if (phase === "entry") {
                const b = best(grp(q[target].prio));
                if (b !== undefined && cnt > 1) { pend.delete(b); pend.add(target); target = b; lates++; } // late arrival
                cells.push({ who: target, kind: "entry" });
                if (--cnt === 0) { stack.push(target); q[target].start = t + 1; phase = "run"; }
                continue;
            }
            if (phase === "tail" || phase === "exit") {
                cells.push({ who: phase === "tail" ? target : exiting, kind: phase });
                if (--cnt === 0) { if (phase === "tail") { stack.push(target); q[target].start = t + 1; } phase = "run"; }
                continue;
            }
            if (!stack.length) { cells.push({ who: -1, kind: "run" }); continue; }
            const top = stack[stack.length - 1];
            cells.push({ who: top, kind: "run" });
            if (--q[top].left === 0) {
                q[top].end = t + 1;
                stack.pop();
                const b = best(ctxGrp());
                if (b !== undefined) { pend.delete(b); target = b; phase = "tail"; cnt = NVIC_T.tail; tail++; } else { phase = "exit"; cnt = NVIC_T.exit; exiting = top; }
            }
        }
        while (cells.length && cells[cells.length - 1].who === -1 && cells[cells.length - 2] && cells[cells.length - 2].who === -1) cells.pop();
        const segs = [];
        cells.forEach((c, t) => {
            const s = segs[segs.length - 1];
            if (s && s.who === c.who && s.kind === c.kind && s.to === t) s.to = t + 1; else segs.push({ ...c, from: t, to: t + 1 });
        });
        return {
            segs, cycles: cells.length, tail, lates,
            irqs: q.map(({ name, prio, at, dur, start, end }) => ({ name, prio, group: grp(prio), sub: prio & ((1 << shift) - 1), at, dur, start, end, lat: start == null ? null : start - at })),
            overhead: cells.filter((c) => c.kind !== "run").length
        };
    }

    // count++ as load / add / store in two threads, run in a given interleaving.
    // mode "plain": lost updates possible · "mutex": lock … unlock (a blocked lock wastes the turn) · "atomic": one fetch_add
    const RACE_OPS = { plain: ["load", "add", "store"], mutex: ["lock", "load", "add", "store", "unlock"], atomic: ["fetch_add"] };
    // finish=false stops when the schedule runs out (manual stepping); otherwise the rest runs A then B
    function raceRun(schedule, mode = "plain", n = 1, finish = true) {
        const ops = Array.from({ length: n }, () => RACE_OPS[mode]).flat();
        const th = { A: { pc: 0, reg: 0 }, B: { pc: 0, reg: 0 } };
        let mem = 0;
        let lock = null;
        const trace = [];
        const done = (w) => th[w].pc >= ops.length;
        const blocked = (w) => ops[th[w].pc] === "lock" && lock && lock !== w;
        const step = (w) => {
            const T = th[w];
            const op = ops[T.pc];
            if (op === "lock" && lock && lock !== w) { trace.push({ w, op: "wait", mem, reg: T.reg }); return; }
            if (op === "lock") lock = w;
            else if (op === "unlock") lock = null;
            else if (op === "load") T.reg = mem;
            else if (op === "add") T.reg += 1;
            else if (op === "store") mem = T.reg;
            else if (op === "fetch_add") { T.reg = mem; mem += 1; }
            T.pc++;
            trace.push({ w, op, mem, reg: T.reg });
        };
        const sched = schedule.slice();
        let guard = 0;
        while (!(done("A") && done("B")) && (finish || sched.length) && guard++ < 1000) {
            let w = sched.length ? sched.shift() : done("A") || blocked("A") ? "B" : "A"; // unscheduled rest: never spin on a held lock
            if (done(w)) w = w === "A" ? "B" : "A";
            step(w);
        }
        return { mem, expect: 2 * n, lost: 2 * n - mem, trace, ops, th };
    }

    // affine quantization (Jacob et al. 2018): x ≈ s·(q − z).
    // asym: uint [0, 2^b − 1], range widened to include 0, z = round(−xmin/s) · sym: z = 0, q in ±(2^(b−1) − 1), s = max|x| / (2^(b−1) − 1)
    // rne (round half to even, like np.round / torch.round) is shared with the float lab
    function quant(values, bits = 8, scheme = "sym") {
        let s, z, qmin, qmax;
        if (scheme === "sym") {
            qmax = 2 ** (bits - 1) - 1;
            qmin = -qmax;
            s = Math.max(...values.map(Math.abs)) / qmax || 1;
            z = 0;
        } else {
            qmin = 0;
            qmax = 2 ** bits - 1;
            const lo = Math.min(0, ...values);
            const hi = Math.max(0, ...values);
            s = (hi - lo) / qmax || 1;
            z = rne(-lo / s);
        }
        const q = values.map((x) => clamp(rne(x / s) + z, qmin, qmax));
        const deq = q.map((v) => s * (v - z));
        const err = values.map((x, i) => Math.abs(x - deq[i]));
        return { s, z, qmin, qmax, q, deq, maxErr: Math.max(...err), meanErr: err.reduce((a, b) => a + b, 0) / (err.length || 1) };
    }

    // graph traversal frames: BFS (queue), DFS (stack, lazy: visited nodes are skipped when popped),
    // Dijkstra (priority queue, lazy deletion), topological sort (Kahn, smallest ready node first). Neighbors in id order.
    const GRAPH0 = {
        nodes: { A: [0, 1], B: [1, 0], C: [1, 2], D: [2, 1], E: [2, 2], F: [3, 1] },
        edges: [["A", "B", 4], ["A", "C", 1], ["B", "D", 1], ["C", "D", 5], ["C", "E", 3], ["D", "F", 3], ["E", "F", 6]]
    };
    function graphRun(g, algo, src = "A") {
        const ids = Object.keys(g.nodes).sort();
        const dir = algo === "topo";
        const adj = Object.fromEntries(ids.map((v) => [v, []]));
        g.edges.forEach(([u, v, w]) => { adj[u].push([v, w]); if (!dir) adj[v].push([u, w]); });
        ids.forEach((v) => adj[v].sort((a, b) => (a[0] < b[0] ? -1 : 1)));
        const order = [];
        const dist = {};
        const frames = [];
        const snap = (o) => frames.push({ order: order.slice(), dist: { ...dist }, ...o });
        if (algo === "bfs") {
            const q = [src];
            dist[src] = 0;
            snap({ cur: null, front: q.slice(), text: `시작 ${src} 를 **큐**에 넣음 · 거리 0` });
            while (q.length) {
                const u = q.shift();
                order.push(u);
                const add = adj[u].map(([v]) => v).filter((v) => !(v in dist));
                add.forEach((v) => { dist[v] = dist[u] + 1; q.push(v); });
                snap({ cur: u, front: q.slice(), edges: add.map((v) => [u, v]), text: add.length ? `${u} 꺼냄 · 처음 보는 이웃 ${add.join(", ")} → 큐 뒤에 (거리 ${dist[u] + 1})` : `${u} 꺼냄 · 새 이웃 없음` });
            }
        } else if (algo === "dfs") {
            const st = [src];
            snap({ cur: null, front: st.slice(), text: `시작 ${src} 를 **스택**에 넣음` });
            while (st.length) {
                const u = st.pop();
                if (order.includes(u)) { snap({ cur: u, front: st.slice(), skip: true, text: `${u} 는 이미 방문 → 건너뜀` }); continue; }
                order.push(u);
                dist[u] = order.length - 1;
                const add = adj[u].map(([v]) => v).filter((v) => !order.includes(v));
                st.push(...add.slice().reverse());
                snap({ cur: u, front: st.slice(), edges: add.map((v) => [u, v]), text: `${u} 방문 · 이웃 ${add.join(", ") || "없음"} 을 역순으로 쌓음 → 다음은 ${st[st.length - 1] || "끝"}` });
            }
        } else if (algo === "dijkstra") {
            const pq = [[0, src]];
            dist[src] = 0;
            snap({ cur: null, front: pq.map((x) => `${x[1]}:${x[0]}`), text: `시작 ${src} 거리 0 · 나머지 ∞` });
            while (pq.length) {
                pq.sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1));
                const [d, u] = pq.shift();
                if (order.includes(u) || d > dist[u]) { snap({ cur: u, front: pq.map((x) => `${x[1]}:${x[0]}`), skip: true, text: `${u}:${d} 는 낡은 항목 → 버림 (지연 삭제)` }); continue; }
                order.push(u);
                const rel = [];
                adj[u].forEach(([v, w]) => { if (!order.includes(v) && (!(v in dist) || d + w < dist[v])) { dist[v] = d + w; pq.push([d + w, v]); rel.push(`${v}=${d + w}`); } });
                snap({ cur: u, front: pq.slice().sort((a, b) => a[0] - b[0]).map((x) => `${x[1]}:${x[0]}`), edges: rel.map((r) => [u, r[0]]), text: `가장 가까운 ${u}(${d}) 확정 · 완화 ${rel.join(", ") || "없음"}` });
            }
        } else {
            const indeg = Object.fromEntries(ids.map((v) => [v, 0]));
            g.edges.forEach(([, v]) => { indeg[v]++; });
            const ready = ids.filter((v) => !indeg[v]);
            snap({ cur: null, front: ready.slice(), text: `들어오는 간선이 0 인 ${ready.join(", ")} 부터 · 간선은 왼쪽 → 오른쪽 방향` });
            while (ready.length) {
                ready.sort();
                const u = ready.shift();
                order.push(u);
                dist[u] = order.length - 1;
                const add = [];
                adj[u].forEach(([v]) => { if (--indeg[v] === 0) { ready.push(v); add.push(v); } });
                snap({ cur: u, front: ready.slice().sort(), edges: adj[u].map(([v]) => [u, v]), text: `${u} 출력 · 나가는 간선 제거 → 새로 준비된 ${add.join(", ") || "없음"}` });
            }
        }
        return { frames, order, dist };
    }
    LAB.sys = { nvicRun, NVIC_T, raceRun, RACE_OPS };
    LAB.num.quant = quant;
    LAB.ds.graphRun = graphRun;
    LAB.ds.GRAPH0 = GRAPH0;

    const hexList = (s, max) => {
        const v = String(s).split(/[\s,]+/).filter(Boolean).map((x) => parseInt2(/^(0x|0b)/i.test(x) ? x : `0x${x}`, 8));
        return v.length && v.length <= max && !v.includes(null) ? v : null;
    };

    // I2C: a register write or read built bit by bit, drawn with the wave renderer
    SIMS.i2c = (host, spec) => {
        let addr = spec.addr ?? 0x68;
        let op = spec.op || "read";
        let reg = spec.reg ?? 0x75;
        let data = spec.data || [0x68];
        let absent = false;
        let stretch = 0;
        let khz = 100;
        const bar = ctlBar(host);
        const bar2 = ctlBar(host);
        const box = document.createElement("div");
        host.append(box);
        const out = readout(host);
        const build = () => {
            const f = i2cTxn({ addr, op, reg, data, absent, stretch });
            box.innerHTML = "";
            wave(box, { ...i2cWave(f), interval: 2200 });
            const clocks = f.filter((x) => x.k === "byte").length * 9;
            out([
                ["주소 바이트", f.filter((x) => x.k === "byte" && /\+/.test(x.label)).map((x) => `${hex2(x.v)} (${x.label.slice(-1)})`).join(" · ")],
                ["SCL 클럭", `${clocks} (바이트당 9)`],
                [`${khz >= 1000 ? `${khz / 1000} MHz` : `${khz} kHz`} 에서`, `약 ${Math.round((clocks * 1000) / khz)} µs`],
                ["결과", absent ? "주소 NACK → 실패" : op === "write" ? `쓰기 ${data.length}바이트` : `읽음 ${data.map(hex2).join(" ")}`, absent ? "bad" : "good"]
            ]);
        };
        textIn(bar, "주소(7bit)", hex2(addr), (s) => { const v = parseInt2(s, 8); if (v === null || v > 0x7f) LAB.toast("7bit 주소: 0x00~0x7F"); else { addr = v; build(); } });
        seg(bar, "동작", [["write", "쓰기"], ["read", "레지스터 읽기"]], op, (v) => { op = v; build(); });
        textIn(bar, "레지스터", hex2(reg), (s) => { const v = parseInt2(s, 8); if (v === null) LAB.toast("예: 0x75"); else { reg = v; build(); } });
        textIn(bar, "데이터", data.map((x) => x.toString(16).toUpperCase().padStart(2, "0")).join(" "), (s) => { const v = hexList(s, 4); if (!v) LAB.toast("16진 바이트 1~4개 (예: 68 01)"); else { data = v; build(); } }, true);
        seg(bar2, "속도", [[100, "100k"], [400, "400k"], [1000, "1M"]], khz, (v) => { khz = +v; build(); });
        seg(bar2, "장치", [["0", "응답"], ["1", "없음"]], "0", (v) => { absent = v === "1"; build(); });
        seg(bar2, "클럭 스트레칭", [["0", "없음"], ["4", "있음 (읽기)"]], "0", (v) => { stretch = +v; build(); });
        build();
    };

    // SPI: master mode vs slave mode, where the slave samples and whether that collides with a data change
    SIMS.spi = (host, spec) => {
        let byte = (spec.byte ?? 0x96) & 0xff;
        let m = spec.master ?? 0;
        let s = spec.slave ?? 0;
        let lsb = false;
        const bar = ctlBar(host);
        const bar2 = ctlBar(host);
        const box = document.createElement("div");
        host.append(box);
        const out = readout(host);
        const edge = (mode) => (mode === 0 || mode === 3 ? "↑" : "↓");
        const build = () => {
            const { R, spec: w } = spiWave(byte, m, s, lsb);
            box.innerHTML = "";
            wave(box, { ...w, interval: 1500 });
            out([
                ["마스터 송신", `${hex2(byte)} → ${R.bits.join("")}`],
                ["샘플 엣지", `마스터 ${edge(m)} · 슬레이브 ${edge(s)}`, edge(m) === edge(s) ? "good" : "bad"],
                ["슬레이브 수신", R.race ? `경합 · ${R.readOld.bits} 또는 ${R.readNew.bits}` : `${R.readOld.bits} = ${hex2(R.readOld.v)}`, R.ok ? "good" : "bad"]
            ]);
        };
        textIn(bar, "바이트", hex2(byte), (v) => { const x = parseInt2(v, 8); if (x === null) LAB.toast("예: 0xA5"); else { byte = x; build(); } });
        seg(bar, "비트 순서", [["0", "MSB 먼저"], ["1", "LSB 먼저"]], "0", (v) => { lsb = v === "1"; build(); });
        seg(bar2, "마스터 mode", [0, 1, 2, 3].map((v) => [v, v]), m, (v) => { m = +v; build(); });
        seg(bar2, "슬레이브 mode", [0, 1, 2, 3].map((v) => [v, v]), s, (v) => { s = +v; build(); });
        build();
    };

    // NVIC: three interrupts on a cycle timeline — entry, return, tail-chaining, late arrival, priority grouping
    SIMS.nvic = (host, spec) => {
        const PRESETS = {
            preempt: { pre: 4, irqs: "8 10 40 | 4 30 14 | 12 35 10" },
            same: { pre: 4, irqs: "6 10 24 | 6 18 12 | 6 20 10" },
            late: { pre: 4, irqs: "8 10 20 | 2 15 12 |" },
            group: { pre: 2, irqs: "6 10 30 | 4 22 10 | 5 24 8" }
        };
        let preset = spec.preset || "preempt";
        let pre = PRESETS[preset].pre;
        let rows = PRESETS[preset].irqs.split("|").map((x) => x.trim());
        const st = stage(host);
        const bar = ctlBar(host);
        const bar2 = ctlBar(host);
        const out = readout(host);
        const parse = () => rows.map((r, i) => {
            const v = r.split(/\s+/).filter(Boolean).map(Number);
            return v.length === 3 && v.every((x) => Number.isInteger(x) && x >= 0) && v[0] < 16 && v[2] > 0 ? { name: "ABC"[i], prio: v[0], at: v[1], dur: v[2] } : null;
        }).filter(Boolean);
        const cv = canvas(st, () => 56 + (parse().length + 1) * 38);
        const draw = () => {
            const { ctx, w, h } = cv;
            if (!w) return;
            const C = vars(host);
            const irqs = parse();
            ctx.clearRect(0, 0, w, h);
            if (!irqs.length) return;
            const R = nvicRun(irqs, { pre });
            const L = 64;
            const X = (t) => L + (t / R.cycles) * (w - L - 10);
            const Y = (r) => 26 + r * 38;
            const col = (i) => PALETTE[i % PALETTE.length];
            ctx.font = "12px Consolas, monospace";
            ctx.textBaseline = "middle";
            ["main", ...R.irqs.map((x) => `${x.name} p${x.prio}`)].forEach((s, r) => { ctx.fillStyle = C.muted; ctx.textAlign = "left"; ctx.fillText(s, 4, Y(r) + 13); });
            ctx.strokeStyle = C.line;
            ctx.lineWidth = 1;
            const tick = R.cycles > 160 ? 20 : 10;
            ctx.textAlign = "center";
            for (let t = 0; t <= R.cycles; t += tick) {
                ctx.beginPath(); ctx.moveTo(X(t), 18); ctx.lineTo(X(t), h - 22); ctx.stroke();
                ctx.fillStyle = C.dim; ctx.fillText(t, X(t), h - 10);
            }
            R.segs.forEach((s) => {
                const r = s.who + 1;
                const x0 = X(s.from);
                const x1 = X(s.to);
                const c = s.who < 0 ? C.dim : col(s.who);
                ctx.fillStyle = s.kind === "run" ? rgba(c, s.who < 0 ? 0.35 : 0.85) : s.kind === "tail" ? rgba(C.ok, 0.55) : rgba(C.warn, s.kind === "entry" ? 0.55 : 0.3);
                ctx.fillRect(x0, Y(r), Math.max(1, x1 - x0), 26);
                if (s.kind !== "run" && x1 - x0 > 26) {
                    ctx.fillStyle = C.text;
                    ctx.fillText({ entry: "진입", exit: "복귀", tail: "tail" }[s.kind], (x0 + x1) / 2, Y(r) + 13);
                }
            });
            R.irqs.forEach((x, i) => {
                const y = Y(i + 1);
                ctx.fillStyle = col(i);
                ctx.beginPath(); ctx.moveTo(X(x.at), y - 2); ctx.lineTo(X(x.at) - 5, y - 10); ctx.lineTo(X(x.at) + 5, y - 10); ctx.fill();
                if (x.start != null) {
                    ctx.strokeStyle = col(i);
                    ctx.setLineDash([3, 3]);
                    ctx.beginPath(); ctx.moveTo(X(x.at), y - 4); ctx.lineTo(X(x.start), y - 4); ctx.stroke();
                    ctx.setLineDash([]);
                }
            });
            ctx.textAlign = "left";
            ctx.fillStyle = C.muted;
            ctx.fillText("▼ 요청  ┄ 지연(요청 → ISR 첫 명령)   진입 12 · 복귀 12 · tail-chain 6 사이클", L, 8);
            out([
                ...R.irqs.map((x) => [`${x.name} (그룹 ${x.group} · 서브 ${x.sub})`, x.lat == null ? "실행 안 됨" : `지연 ${x.lat} · 끝 ${x.end}`, x.lat != null && x.lat <= 12 ? "good" : ""]),
                ["tail-chain", R.tail ? `${R.tail}회 · 아낀 사이클 ${R.tail * (NVIC_T.exit + NVIC_T.entry - NVIC_T.tail)}` : "0"],
                ["late arrival", R.lates],
                ["오버헤드", `${R.overhead} / ${R.cycles} 사이클`]
            ]);
        };
        cv.draw = draw;
        const ins = [];
        const sync = () => { ins.forEach((inp, i) => { inp.value = rows[i] || ""; }); grp.querySelectorAll("button").forEach((b) => b.classList.toggle("on", +b.dataset.v === pre)); };
        seg(bar, "예제", [["preempt", "선점"], ["same", "같은 순위"], ["late", "늦은 도착"], ["group", "그룹·서브"]], preset, (v) => {
            preset = v; pre = PRESETS[v].pre; rows = PRESETS[v].irqs.split("|").map((x) => x.trim()); sync(); cv.fit(); draw();
        });
        const grp = seg(bar, "선점 비트", [4, 3, 2, 1, 0].map((v) => [v, `${v}`]), pre, (v) => { pre = +v; draw(); });
        ["A", "B", "C"].forEach((n, i) => ins.push(textIn(bar2, `${n} 순위 도착 길이`, rows[i] || "", (s) => { rows[i] = s; cv.fit(); draw(); }, true)));
        cv.fit();
    };

    // two threads doing counter++: step them yourself, or run every interleaving at random
    SIMS.race = (host, spec) => {
        let mode = spec.mode || "plain";
        let n = spec.n || 1;
        let sched = [];
        let auto = false; // preset orders run to the end; A ▶ / B ▶ stop where you are
        const bar = ctlBar(host);
        const st = stage(host);
        const bar2 = ctlBar(host);
        const out = readout(host);
        const LBL = { load: "reg ← counter", add: "reg ← reg + 1", store: "counter ← reg", lock: "lock(m)", unlock: "unlock(m)", fetch_add: "atomic counter++" };
        const R0 = rng(7);
        const wrongRate = () => {
            const len = RACE_OPS[mode].length * n * 2;
            let bad = 0;
            for (let k = 0; k < 1000; k++) if (raceRun(Array.from({ length: len }, () => (R0() < 0.5 ? "A" : "B")), mode, n).lost) bad++;
            return bad / 10;
        };
        let rate = wrongRate();
        const draw = () => {
            const R = raceRun(sched, mode, n, auto);
            const fin = R.th.A.pc >= R.ops.length && R.th.B.pc >= R.ops.length;
            const col = (w) => `<div class="race-th"><h4>스레드 ${w} · reg = ${R.th[w].reg}</h4><ol>${R.ops.map((op, i) => `<li class="${i < R.th[w].pc ? "done" : i === R.th[w].pc ? "cur" : ""}">${LBL[op]}</li>`).join("")}</ol></div>`;
            st.innerHTML = `<div class="race">${col("A")}<div class="race-mem${fin && R.lost ? " bad" : ""}"><span>counter</span><b>${R.mem}</b><small>기대 ${R.expect}</small></div>${col("B")}</div>`
                + `<div class="race-log">${R.trace.slice(-6).map((x) => `${x.w}: ${x.op === "wait" ? "lock 대기 (다른 스레드가 잡고 있음)" : LBL[x.op]} → counter=${x.mem}, reg=${x.reg}`).join("<br>") || "A ▶ / B ▶ 로 한 단계씩 · 순서를 직접 정해 보세요"}</div>`;
            bA.disabled = R.th.A.pc >= R.ops.length;
            bB.disabled = R.th.B.pc >= R.ops.length;
            out([
                ["결과", fin ? (R.lost ? `${R.mem} · 갱신 ${R.lost}개 잃음` : `${R.mem} ✓`) : "실행 중", fin ? (R.lost ? "bad" : "good") : ""],
                ["단계", R.trace.length],
                ["랜덤 순서 1000번 중 틀림", `${rate}%`, rate ? "bad" : "good"]
            ]);
        };
        const bA = button(bar, "A ▶", () => { if (auto) { auto = false; sched = []; } sched.push("A"); draw(); }, true);
        const bB = button(bar, "B ▶", () => { if (auto) { auto = false; sched = []; } sched.push("B"); draw(); }, true);
        button(bar, "최악 순서", () => { auto = true; sched = Array.from({ length: RACE_OPS[mode].length * n * 2 }, (_, i) => "AB"[i % 2]); draw(); });
        button(bar, "랜덤 순서", () => { auto = true; const r = rng((Date.now() & 0xffff) + 1); sched = Array.from({ length: RACE_OPS[mode].length * n * 2 }, () => (r() < 0.5 ? "A" : "B")); draw(); });
        button(bar, "↺", () => { auto = false; sched = []; draw(); });
        seg(bar2, "방식", [["plain", "그냥 count++"], ["mutex", "뮤텍스"], ["atomic", "원자 연산"]], mode, (v) => { mode = v; sched = []; auto = false; rate = wrongRate(); draw(); });
        seg(bar2, "반복", [1, 2, 3].map((v) => [v, `${v}회`]), n, (v) => { n = +v; sched = []; auto = false; rate = wrongRate(); draw(); });
        draw();
    };

    // quantization: two weight channels (small and large range), per-tensor vs per-channel, symmetric vs asymmetric, an outlier
    SIMS.quant = (host, spec) => {
        let bits = spec.bits || 8;
        let scheme = spec.scheme || "sym";
        let perCh = false;
        let outlier = false;
        const r = rng(11);
        const base = [Array.from({ length: 24 }, () => clamp(gauss(r) * 0.04, -0.1, 0.1)), Array.from({ length: 24 }, () => clamp(gauss(r) * 0.4, -1, 1))];
        const st = stage(host);
        const cv = canvas(st, 250);
        const bar = ctlBar(host);
        const out = readout(host);
        const draw = () => {
            const { ctx, w, h } = cv;
            if (!w) return;
            const C = vars(host);
            const ch = base.map((v, i) => (outlier && i === 1 ? [...v.slice(0, -1), 6] : v));
            const res = perCh ? ch.map((v) => quant(v, bits, scheme)) : (() => {
                const all = quant(ch.flat(), bits, scheme);
                const k = ch[0].length;
                const part = (a, b) => ({ ...all, q: all.q.slice(a, b), deq: all.deq.slice(a, b) });
                return [part(0, k), part(k)];
            })();
            ctx.clearRect(0, 0, w, h);
            ctx.font = "11px Consolas, monospace";
            ctx.textBaseline = "middle";
            ch.forEach((vals, i) => {
                const R = res[i];
                const span = Math.max(...vals.map(Math.abs)) * 1.08 || 1;
                const X = (x) => 70 + ((x + span) / (2 * span)) * (w - 90);
                const y0 = 30 + i * 112;
                const y1 = y0 + 54;
                ctx.fillStyle = C.muted;
                ctx.textAlign = "left";
                ctx.fillText(i ? "채널 1" : "채널 0", 4, y0);
                ctx.fillText("양자화", 4, y1);
                // integer grid inside this channel's view
                const lo = Math.ceil(-span / R.s + R.z);
                const hi = Math.floor(span / R.s + R.z);
                const levels = [];
                for (let q = Math.max(lo, R.qmin); q <= Math.min(hi, R.qmax); q++) levels.push(q);
                if (levels.length <= 140) {
                    ctx.strokeStyle = rgba(C.c, 0.28);
                    levels.forEach((q) => { const x = X(R.s * (q - R.z)); ctx.beginPath(); ctx.moveTo(x, y1 - 12); ctx.lineTo(x, y1 + 12); ctx.stroke(); });
                }
                ctx.strokeStyle = C.line;
                [y0, y1].forEach((y) => { ctx.beginPath(); ctx.moveTo(X(-span), y); ctx.lineTo(X(span), y); ctx.stroke(); });
                vals.forEach((x, k) => {
                    const d = R.deq[k];
                    ctx.strokeStyle = rgba(Math.abs(x - d) > R.s / 2 + 1e-12 ? C.bad : C.muted, 0.5);
                    ctx.beginPath(); ctx.moveTo(X(x), y0); ctx.lineTo(X(clamp(d, -span, span)), y1); ctx.stroke();
                    ctx.fillStyle = C.text;
                    ctx.beginPath(); ctx.arc(X(x), y0, 3, 0, 7); ctx.fill();
                    ctx.fillStyle = C.c;
                    ctx.beginPath(); ctx.arc(X(clamp(d, -span, span)), y1, 3, 0, 7); ctx.fill();
                });
                ctx.fillStyle = C.dim;
                ctx.textAlign = "center";
                ctx.fillText(`−${span.toFixed(2)}`, X(-span), y1 + 22);
                ctx.fillText("0", X(0), y1 + 22);
                ctx.fillText(span.toFixed(2), X(span), y1 + 22);
            });
            const used = (R) => new Set(R.q).size;
            const err = (R, vals) => Math.max(...vals.map((x, k) => Math.abs(x - R.deq[k])));
            out([
                ["형식", `${scheme === "sym" ? "int" : "uint"}${bits} · q ∈ [${res[0].qmin}, ${res[0].qmax}]`],
                ...res.map((R, i) => [`채널 ${i}`, `s=${R.s.toPrecision(3)} z=${R.z} · 쓰인 정수 ${used(R)}개 · 최대 오차 ${err(R, ch[i]).toPrecision(2)}`, used(R) <= 5 ? "bad" : ""]),
                ["크기", `FP32 대비 ${bits === 8 ? "1/4" : "1/8"}${perCh ? " + 채널마다 s" : ""}`]
            ]);
        };
        cv.draw = draw;
        seg(bar, "비트", [[8, "INT8"], [4, "INT4"]], bits, (v) => { bits = +v; draw(); });
        seg(bar, "방식", [["sym", "대칭 (z=0)"], ["asym", "비대칭"]], scheme, (v) => { scheme = v; draw(); });
        seg(bar, "스케일", [["0", "텐서 하나"], ["1", "채널별"]], "0", (v) => { perCh = v === "1"; draw(); });
        seg(bar, "이상치", [["0", "없음"], ["1", "채널 1 에 6.0"]], "0", (v) => { outlier = v === "1"; draw(); });
        cv.fit();
    };

    // graph traversal: BFS / DFS / Dijkstra / topological sort, frame by frame
    SIMS.graph = (host, spec) => {
        let algo = spec.algo || "bfs";
        let src = spec.src || "A";
        const g = LAB.ds.GRAPH0;
        const bar = ctlBar(host);
        const box = document.createElement("div");
        host.append(box);
        let stepCtl = null;
        const P = (id) => [60 + g.nodes[id][0] * 150, 36 + g.nodes[id][1] * 72];
        const FRONT = { bfs: "큐 (앞 → 뒤)", dfs: "스택 (아래 → 위)", dijkstra: "우선순위 큐 (노드:거리)", topo: "준비된 노드" };
        const DIST = { bfs: "거리(간선 수)", dfs: "방문 순서", dijkstra: "최단 거리", topo: "출력 순서" };
        const build = () => {
            if (stepCtl) stepCtl.stop();
            const R = graphRun(g, algo, src);
            const dir = algo === "topo";
            box.innerHTML = `<div class="demo-stage gr"><svg viewBox="0 0 570 196">
              <defs><marker id="grArr" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--muted)"/></marker></defs>
              ${g.edges.map(([u, v, wt]) => { const [x1, y1] = P(u); const [x2, y2] = P(v); return `<line data-e="${u}${v}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${dir ? " marker-end=\"url(#grArr)\"" : ""}/>${algo === "dijkstra" ? `<text class="w" x="${(x1 + x2) / 2 + 8}" y="${(y1 + y2) / 2 - 8}">${wt}</text>` : ""}`; }).join("")}
              ${Object.keys(g.nodes).map((id) => { const [x, y] = P(id); return `<g data-n="${id}"><circle cx="${x}" cy="${y}" r="18"/><text x="${x}" y="${y}">${id}</text><text class="d" x="${x}" y="${y + 30}"></text></g>`; }).join("")}
            </svg><div class="gr-row" data-r="front"></div><div class="gr-row" data-r="order"></div></div>`;
            const svg = box.querySelector("svg");
            stepCtl = stepper(box, R.frames.length, (i) => {
                const f = R.frames[i];
                const front = new Set(f.front.map((x) => String(x).split(":")[0]));
                svg.querySelectorAll("[data-n]").forEach((el) => {
                    const id = el.dataset.n;
                    el.setAttribute("class", `${f.order.includes(id) ? "done" : ""}${front.has(id) ? " front" : ""}${f.cur === id ? " cur" : ""}`);
                    el.querySelector(".d").textContent = id in f.dist ? f.dist[id] : algo === "dijkstra" ? "∞" : "";
                });
                const on = new Set((f.edges || []).flatMap(([u, v]) => [u + v, v + u]));
                svg.querySelectorAll("[data-e]").forEach((el) => el.classList.toggle("on", on.has(el.dataset.e)));
                box.querySelector("[data-r=front]").innerHTML = `${FRONT[algo]}: <b>[${f.front.join(", ")}]</b>`;
                box.querySelector("[data-r=order]").innerHTML = `${algo === "topo" ? "출력" : algo === "dijkstra" ? "확정" : "방문"} 순서: <b>${f.order.join(" → ") || "–"}</b> · 숫자 = ${DIST[algo]}`;
                return f.text;
            }, { interval: 1700 });
        };
        seg(bar, "알고리즘", [["bfs", "BFS"], ["dfs", "DFS"], ["dijkstra", "Dijkstra"], ["topo", "위상 정렬"]], algo, (v) => { algo = v; build(); });
        seg(bar, "시작", Object.keys(g.nodes).map((id) => [id, id]), src, (v) => { src = v; build(); });
        build();
    };

    LAB.SIM_INFO = {
        reg: ["레지스터 비트", "MASK·결과 미리보기 · set/clear/toggle · 필드 읽기·쓰기", "비트"],
        bitops: ["비트 연산 ALU", "AND·OR·XOR·시프트·회전 · 2의 보수 · NZCV 플래그", "비트"],
        float: ["IEEE 754 부동소수점", "fp32·fp16·bf16·fp8 비트 해부 · ULP · 반올림 오차", "비트"],
        crc: ["CRC 나눗셈", "XOR 나눗셈 한 단계씩 · 비트 뒤집어 오류 검출", "비트"],
        pwm: ["PWM 타이머", "듀티·주파수 → 파형 · PSC/ARR/CCR", "신호"],
        adc: ["ADC 샘플링", "분해능·샘플링 속도 → 양자화 · 에일리어싱", "신호"],
        kalman: ["칼만 필터", "Q·R 조절 → 잡음 속 추정", "신호"],
        pid: ["PID 튜닝", "게인 → 계단 응답 · 오버슈트", "제어·로봇"],
        arm: ["2링크 로봇팔", "목표 드래그(IK) · 관절 슬라이더(FK)", "제어·로봇"],
        astar: ["경로 탐색", "A* · Dijkstra · Greedy 비교 · 벽 그리기", "제어·로봇"],
        memory: ["스택·힙 추적", "줄 단위 메모리 상태 변화", "시스템"],
        sched: ["RTOS 스케줄러", "선점·협력·라운드로빈 타임라인", "시스템"],
        nn: ["XOR 신경망", "2-3-1 학습 · 결정 경계 · 활성함수", "AI"],
        gd: ["옵티마이저 경주", "SGD · Momentum · Adam", "AI"],
        attention: ["어텐션 맵", "가중치 · 온도 · 인과 마스크", "AI"],
        sampling: ["LLM 디코딩", "온도 · top-k · top-p", "AI"],
        conv: ["합성곱 커널", "stride · padding · 출력 크기", "AI"],
        cpu: ["CPU 실행기", "Thumb-2 어셈블리 한 줄씩 · 레지스터·플래그·스택 · 코드 편집", "CPU·메모리"],
        cache: ["캐시 시뮬레이터", "태그·인덱스·오프셋 · 직접 사상 vs 연관 · 히트율", "CPU·메모리"],
        layout: ["구조체 정렬·엔디안", "필드 배치 → 패딩·sizeof · 리틀/빅 엔디안", "CPU·메모리"],
        ringbuf: ["링 버퍼", "head·tail · 가득 참 판정 3가지 · 덮어쓰기", "자료구조"],
        hash: ["해시 테이블", "체이닝 vs 선형 탐사 · 적재율 · 재해시", "자료구조"],
        heap: ["이진 힙", "삽입·꺼내기 · sift up/down · 배열 = 트리", "자료구조"],
        bst: ["이진 탐색 트리", "삽입·검색·삭제 · 높이 · 정렬 입력의 함정", "자료구조"],
        sort: ["정렬 알고리즘", "버블·삽입·선택·병합·퀵·힙 · 비교·교환 횟수", "자료구조"],
        uart: ["UART 프레임", "비트 순서 · 패리티 · 보레이트 오차 · 수신 샘플 드리프트", "통신"],
        can: ["CAN 중재", "ID 비트별 중재 · 우성/열성 · 비트 스터핑", "통신"],
        bpe: ["BPE 토크나이저", "자주 붙는 쌍 병합 한 단계씩 · 새 단어 토큰화", "AI"],
        vector: ["벡터 검색", "질의 드래그 · 코사인 vs 내적 vs L2 · top-k", "AI"],
        hybrid: ["하이브리드 검색", "BM25 vs 의미 검색 vs RRF · 건물·층 필터 · recall@k", "AI"],
        context: ["컨텍스트 창", "대화가 길어지면 무엇을 잊나 · 한도 · 메모리 파일 · 요약", "AI"],
        i2c: ["I2C 트랜잭션", "주소+R/W · ACK/NACK · 반복 시작 · 클럭 스트레칭", "통신"],
        spi: ["SPI 모드", "CPOL·CPHA 4모드 · 샘플 엣지 · 모드 불일치 경합", "통신"],
        nvic: ["NVIC 우선순위", "선점 · tail-chaining · late arrival · 그룹/서브 우선순위", "시스템"],
        race: ["경쟁 조건", "count++ 끼어들기 · lost update · 뮤텍스 vs 원자 연산", "시스템"],
        quant: ["INT8 양자화", "scale·zero-point · 대칭 vs 비대칭 · 채널별 스케일 · 이상치", "AI"],
        graph: ["그래프 탐색", "BFS · DFS · Dijkstra · 위상 정렬 · 큐/스택 상태", "자료구조"]
    };
    LAB.SIM_TAGS = ["비트", "CPU·메모리", "자료구조", "통신", "신호", "제어·로봇", "시스템", "AI"];

    const TYPES = { steps, wave, seq, sim: (host, spec) => SIMS[spec.name](host, spec) };
    LAB.SIM_NAMES = Object.keys(SIMS);
    LAB.DEMO_TYPES = Object.keys(TYPES);
    LAB.demo = (host, spec) => {
        host.classList.add("demo");
        try {
            TYPES[spec.type](host, spec);
        } catch (e) {
            host.innerHTML = `<div class="empty">데모 오류: ${esc(e.message)}</div>`;
            console.error(e);
        }
    };
})();
