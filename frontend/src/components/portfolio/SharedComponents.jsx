import { useEffect, useMemo, useRef, useState } from "react";
import { CONTACT_ENDPOINT } from "../../models/siteContent.js";

export function Reveal({ children, delay = 0, as: Tag = "div", className = "", ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return setSeen(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`rv ${seen ? "in" : ""} ${className}`} style={{ "--d": `${delay}s` }} {...rest}>
      {children}
    </Tag>
  );
}

/* splits text into letters the way people read them (needed for Khmer) */
export const letters = (s) =>
  typeof Intl !== "undefined" && Intl.Segmenter
    ? [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s)].map((x) => x.segment)
    : Array.from(s);

/* types and deletes the job titles */
export function Typed({ words }) {
  const parts = useMemo(() => words.map(letters), [words]);
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const len = parts[i].length;
    const t = setTimeout(() => {
      if (!del && n < len) setN(n + 1);
      else if (!del) setDel(true);
      else if (n > 0) setN(n - 1);
      else { setDel(false); setI((i + 1) % parts.length); }
    }, !del && n === len ? 1400 : del ? 40 : 85);
    return () => clearTimeout(t);
  }, [n, del, i, parts]);
  return <span className="grad">{parts[i].slice(0, n).join("")}</span>;
}

/* tiny sound effects made with the browser itself (no sound files needed) */
let ac;
export function sfx(kind, on) {
  if (!on) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    const now = ac.currentTime;
    const tone = (f0, f1, dur, type = "sine", vol = 0.08, delay = 0) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, now + delay);
      o.frequency.exponentialRampToValueAtTime(f1, now + delay + dur);
      g.gain.setValueAtTime(vol, now + delay);
      g.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
      o.connect(g).connect(ac.destination);
      o.start(now + delay);
      o.stop(now + delay + dur);
    };
    if (kind === "key") tone(1400, 1200, 0.03, "square", 0.025);
    if (kind === "warp") tone(120, 1800, 1.4, "sawtooth", 0.06);
    if (kind === "boom") { tone(200, 30, 0.9, "sawtooth", 0.12); tone(90, 25, 1.1, "sine", 0.15); }
    if (kind === "pop") { tone(500, 1200, 0.12, "triangle", 0.07); tone(800, 1600, 0.12, "triangle", 0.05, 0.08); }
    if (kind === "matrix") for (let i = 0; i < 8; i++) tone(300 + Math.random() * 900, 200, 0.12, "square", 0.025, i * 0.1);
    if (kind === "win") [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.18, "triangle", 0.08, i * 0.12));
  } catch { /* sound is not available */ }
}

/* text that "decodes" from random symbols, on load and when you hover it */
export function Scramble({ text }) {
  const [out, setOut] = useState(text);
  const raf = useRef(0);
  const run = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(raf.current);
    const chars = "!<>-_/[]{}=+*^?#01";
    let frame = 0;
    const total = 28;
    const tick = () => {
      frame++;
      const done = Math.floor((frame / total) * text.length);
      setOut(text.split("").map((c, i) => (c === " " || i < done ? c : chars[(Math.random() * chars.length) | 0])).join(""));
      if (frame < total) raf.current = requestAnimationFrame(tick); else setOut(text);
    };
    tick();
  };
  useEffect(() => { run(); return () => cancelAnimationFrame(raf.current); }, [text]);
  return (
    <span onMouseEnter={run} style={{ whiteSpace: "pre" }}>
      <span aria-hidden="true">{out}</span><span className="sr">{text}</span>
    </span>
  );
}

/* neon ring that follows the mouse (desktop only) */
export function Cursor() {
  const ring = useRef(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ring.current;
    let x = 0, y = 0, rx = 0, ry = 0, raf = 0, running = false;
    const move = (e) => {
      x = e.clientX; y = e.clientY;
      if (!running) { running = true; loop(); }
      el.classList.add("on");
      el.classList.toggle("hot", !!e.target.closest?.("a,button,input,textarea,.photo,.chip,.tilt"));
    };
    const down = () => el.classList.add("down");
    const up = () => el.classList.remove("down");
    const loop = () => {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
      el.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      if (Math.abs(x - rx) > 0.2 || Math.abs(y - ry) > 0.2) raf = requestAnimationFrame(loop); else running = false;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);
  return <div ref={ring} className="cursor" aria-hidden="true" />;
}

/* full-screen effects: confetti and "matrix rain" */
export function Fx({ fx }) {
  const cv = useRef(null);
  useEffect(() => {
    if (!fx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = cv.current, ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio, 2), W = window.innerWidth, H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.style.opacity = 1;
    let raf = 0, stop = false;
    if (fx.type === "confetti") {
      const cols = [...fx.colors, "#ffd84d", "#3ddc84"];
      const ps = Array.from({ length: 150 }, () => ({
        x: fx.x, y: fx.y, vx: (Math.random() - 0.5) * 18, vy: -Math.random() * 16 - 4,
        s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[(Math.random() * cols.length) | 0],
      }));
      const tick = () => {
        ctx.clearRect(0, 0, W, H);
        let alive = 0;
        ps.forEach((p) => {
          p.vy += 0.45; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
          if (p.y < H + 20) {
            alive++;
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
            ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
            ctx.restore();
          }
        });
        if (alive && !stop) raf = requestAnimationFrame(tick); else ctx.clearRect(0, 0, W, H);
      };
      tick();
    } else if (fx.type === "fireworks") {
      const cols = [...fx.colors, "#ffd84d", "#ffffff"];
      const rockets = [], sparks = [];
      const start = performance.now();
      let next = 0;
      const tick = (now) => {
        const t = now - start;
        if (t < 4200 && now >= next) {
          next = now + 380 + Math.random() * 350;
          rockets.push({ x: W * (0.15 + Math.random() * 0.7), y: H, vx: (Math.random() - 0.5) * 1.5, vy: -(11 + Math.random() * 4), ty: H * (0.15 + Math.random() * 0.3) });
        }
        ctx.clearRect(0, 0, W, H);
        for (let i = rockets.length - 1; i >= 0; i--) {
          const r = rockets[i];
          r.x += r.vx; r.y += r.vy;
          ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - r.vx * 4, r.y - r.vy * 4); ctx.stroke();
          if (r.y <= r.ty) {
            const col = cols[(Math.random() * cols.length) | 0];
            for (let n = 0; n < 70; n++) {
              const a = Math.random() * 6.283, sp = 1 + Math.random() * 5.5;
              sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, c: col });
            }
            rockets.splice(i, 1);
          }
        }
        for (let i = sparks.length - 1; i >= 0; i--) {
          const p = sparks[i];
          p.vx *= 0.97; p.vy = p.vy * 0.97 + 0.07; p.x += p.vx; p.y += p.vy; p.life -= 0.014;
          if (p.life <= 0) { sparks.splice(i, 1); continue; }
          ctx.globalAlpha = p.life; ctx.strokeStyle = p.c; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        if ((t < 4200 || rockets.length || sparks.length) && !stop) raf = requestAnimationFrame(tick); else ctx.clearRect(0, 0, W, H);
      };
      raf = requestAnimationFrame(tick);
    } else {
      const size = 18, drops = Array.from({ length: Math.ceil(W / size) }, () => Math.random() * -40);
      /* Khmer letters (ក ខ គ …) and Khmer digits (០ ១ ២ …) */
      const chars = Array.from({ length: 35 }, (_, i) => String.fromCharCode(0x1780 + i)).join("") +
        Array.from({ length: 10 }, (_, i) => String.fromCharCode(0x17e0 + i)).join("");
      const start = performance.now();
      const tick = (now) => {
        const t = now - start;
        ctx.fillStyle = "rgba(5,6,12,.14)"; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = fx.colors[2]; ctx.font = `${size}px "Noto Sans Khmer", "Khmer OS", sans-serif`;
        drops.forEach((d, i) => {
          ctx.fillText(chars[(Math.random() * chars.length) | 0], i * size, d * size);
          drops[i] = d * size > H && Math.random() > 0.975 ? 0 : d + 1;
        });
        if (t > 4300) c.style.opacity = Math.max(0, (5000 - t) / 700);
        if (t < 5000 && !stop) raf = requestAnimationFrame(tick); else ctx.clearRect(0, 0, W, H);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => { stop = true; cancelAnimationFrame(raf); ctx.clearRect(0, 0, W, H); };
  }, [fx]);
  return <canvas ref={cv} className="fx" aria-hidden="true" />;
}

/* a little command line visitors can type into */
export function Terminal({ open, onClose, run, beep }) {
  const [lines, setLines] = useState(["Welcome to SAKHAK-OS v1.0", 'Type "help" to see what you can do.']);
  const [val, setVal] = useState("");
  const inp = useRef(null), out = useRef(null);
  useEffect(() => { if (open) inp.current?.focus(); }, [open]);
  useEffect(() => { if (out.current) out.current.scrollTop = out.current.scrollHeight; }, [lines, open]);
  if (!open) return null;
  const onKey = (e) => {
    if (e.key.length === 1 || e.key === "Enter" || e.key === "Backspace") beep("key");
    if (e.key === "Escape") return onClose();
    if (e.key !== "Enter") return;
    const cmd = val;
    setVal("");
    const res = run(cmd);
    if (res === "__clear") setLines([]);
    else if (res === "__exit") onClose();
    else setLines((l) => [...l, `$ ${cmd}`, ...res]);
  };
  return (
    <div className="term" role="dialog" aria-label="Terminal">
      <header><span>sakhak@portfolio:~</span><button onClick={onClose} aria-label="Close terminal">✕</button></header>
      <div className="out" ref={out}>{lines.map((l, i) => <div key={i}>{l}</div>)}</div>
      <div className="in"><span>$</span><input ref={inp} value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={onKey} aria-label="Command" autoComplete="off" spellCheck={false} /></div>
    </div>
  );
}

/* card that leans toward the mouse */

export function Tilt({ children }) {
  const ref = useRef(null);
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`);
    ref.current.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * 10}deg`);
  };
  const leave = () => { ref.current.style.setProperty("--rx", "0deg"); ref.current.style.setProperty("--ry", "0deg"); };
  return <article ref={ref} className="tilt" onMouseMove={move} onMouseLeave={leave}>{children}</article>;
}

export function Timeline({ items }) {
  return (
    <ul className="tl">
      {items.map((it, k) => (
        <Reveal as="li" delay={k * 0.1} key={it.title}>
          <div className="when">{it.when}</div>
          <h3>{it.title}</h3>
          <div className="org">{it.where}</div>
          {it.points.length > 0 && <ul>{it.points.map((p) => <li key={p}>{p}</li>)}</ul>}
        </Reveal>
      ))}
    </ul>
  );
}

export function ContactForm({ t, email }) {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [state, setState] = useState({ type: "", text: "" });
  const [sending, setSending] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setState({ type: "", text: "" });
    try {
      const res = await fetch(CONTACT_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setState({ type: "ok", text: t.f.ok });
      setForm({ name: "", email: "", message: "", website: "" });
    } catch {
      setState({ type: "err", text: t.f.err.replace("{email}", email) });
    } finally {
      setSending(false);
    }
  };
  return (
    <form onSubmit={submit}>
      <label>{t.f.name}<input name="name" value={form.name} onChange={change} required autoComplete="name" /></label>
      <label>{t.f.email}<input name="email" type="email" value={form.email} onChange={change} required autoComplete="email" /></label>
      <label>{t.f.message}<textarea name="message" value={form.message} onChange={change} required /></label>
      <input className="hp" name="website" value={form.website} onChange={change} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div><button className="btn" type="submit" disabled={sending}>{sending ? t.f.sending : t.f.send}</button></div>
      <p className={`status ${state.type}`} role="status" aria-live="polite">{state.text}</p>
    </form>
  );
}

/* =====================================================================
   4. APP
   ===================================================================== */
