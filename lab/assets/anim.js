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
        conv: ["합성곱 커널", "stride · padding · 출력 크기", "AI"]
    };
    LAB.SIM_TAGS = ["비트", "신호", "제어·로봇", "시스템", "AI"];

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
