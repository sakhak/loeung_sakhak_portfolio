import { useState, useMemo, useEffect, useRef } from "react";
import {
  PHOTO, START_LITE, TIME_MODES,
  categories, icons, palettes,
} from "../models/siteContent.js";
import { translateProjects } from "../models/projects.js";
import usePortfolioData from "../controllers/usePortfolioData.js";
import { Boot, Game, Scene3D } from "../components/portfolio/BackgroundEffects.jsx";
import { Laptop3D } from "../components/portfolio/ProjectShowcase.jsx";
import { Chat, Guestbook } from "../components/portfolio/VisitorWidgets.jsx";
import {
  ContactForm, Cursor, Fx, Reveal, Scramble, Terminal, Tilt, Timeline, Typed, sfx,
} from "../components/portfolio/SharedComponents.jsx";
import "../styles/portfolio.css";

function ContactIcon({ name }) {
  const type = name.toLowerCase();
  const common = {
    viewBox: "0 0 24 24",
    width: 20,
    height: 20,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: false,
  };

  if (type.includes("github")) {
    return <svg {...common} fill="currentColor" stroke="none"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.74 2.2 3.54 1.56.1-.72.4-1.21.72-1.49-2.47-.28-5.07-1.24-5.07-5.5 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.77 1.15 2.99 0 4.27-2.6 5.21-5.08 5.49.4.35.76 1.02.76 2.06V22c0 .29.2.64.77.53A11.1 11.1 0 0 0 12 .9Z" /></svg>;
  }
  if (type.includes("linkedin")) {
    return <svg {...common} fill="currentColor" stroke="none"><path d="M20.45 3H3.55C3.25 3 3 3.24 3 3.54v16.92c0 .3.25.54.55.54h16.9c.3 0 .55-.24.55-.54V3.54c0-.3-.25-.54-.55-.54ZM8.34 18H5.36V9.4h2.98V18ZM6.85 8.22a1.73 1.73 0 1 1 0-3.46 1.73 1.73 0 0 1 0 3.46ZM18 18h-2.98v-4.18c0-1-.02-2.28-1.39-2.28-1.4 0-1.61 1.09-1.61 2.21V18H9.04V9.4h2.86v1.18h.04c.4-.76 1.37-1.56 2.82-1.56 3.02 0 3.58 1.99 3.58 4.58V18Z" /></svg>;
  }
  if (type.includes("facebook")) {
    return <svg {...common} fill="currentColor" stroke="none"><path d="M13.6 21v-8.2h2.76l.41-3.2H13.6V7.56c0-.93.26-1.56 1.6-1.56h1.7V3.14A22.7 22.7 0 0 0 14.42 3c-2.45 0-4.12 1.5-4.12 4.25V9.6H7.53v3.2h2.77V21h3.3Z" /></svg>;
  }
  if (type.includes("telegram")) {
    return <svg {...common} fill="currentColor" stroke="none"><path d="m21.7 4.2-3.2 15.1c-.24 1.07-.87 1.33-1.76.83l-4.86-3.58-2.35 2.26c-.26.26-.48.48-.98.48l.35-4.94 8.99-8.12c.39-.35-.09-.55-.6-.2L6.18 13.1 1.4 11.6c-1.04-.32-1.06-1.04.22-1.54l18.7-7.21c.87-.32 1.63.21 1.38 1.35Z" /></svg>;
  }
  if (type.includes("email") || type.includes("mail")) {
    return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
  }
  if (type.includes("phone") || type.includes("call")) {
    return <svg {...common}><path d="M7 3H5a2 2 0 0 0-2 2c0 8.84 7.16 16 16 16a2 2 0 0 0 2-2v-2l-5-2-2 3a14 14 0 0 1-7-7l3-2-2-5Z" /></svg>;
  }
  if (type.includes("cv") || type.includes("resume")) {
    return <svg {...common}><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" /><path d="M13 3v7h7M8 14h8M8 17h8" /></svg>;
  }
  return <svg {...common}><path d="M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 2.93l-1.72 1.72M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.72-1.72" /></svg>;
}

export default function PortfolioView() {
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("lang") === "km" ? "km" : "en"; } catch { return "en"; }
  });
  const [filter, setFilter] = useState("All");
  const [photoOk, setPhotoOk] = useState(true);
  const [booted, setBooted] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const root = useRef(null);
  const photoRef = useRef(null);
  const [pal, setPal] = useState(0);
  const [fx, setFx] = useState(null);
  const [dockOpen, setDockOpen] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [showTop, setShowTop] = useState(false);
  const [magnet, setMagnet] = useState(false);
  const magnetRef = useRef(false);
  magnetRef.current = magnet;
  const [glitch, setGlitch] = useState(false);
  const clicks = useRef(0);
  const [timeMode, setTimeMode] = useState("auto");
  const [nowDate, setNowDate] = useState(() => new Date());
  const [gameOpen, setGameOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { siteContent, projects, projectError } = usePortfolioData();
  const profile = siteContent.profile;
  const cvUrl = profile.cv || profile.cvEn || profile.cvKm || "/cv.pdf";
  const displayName = lang === "km" && profile.name_km ? profile.name_km : profile.name;
  const t = siteContent.text[lang];
  useEffect(() => {
    const id = setInterval(() => setNowDate(new Date()), 300000);
    return () => clearInterval(id);
  }, []);
  const warp = useRef(0);
  const boom = useRef(-1e9);
  const [lite, setLite] = useState(() => {
    if (START_LITE !== "auto") return START_LITE;
    if (typeof navigator === "undefined") return false;
    return (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  });
  const [sound, setSound] = useState(false);
  const soundOn = useRef(false);
  soundOn.current = sound;
  const play = (k) => sfx(k, soundOn.current);
  const P = palettes[pal];
  /* day / night: follows the visitor's clock, or the Time button */
  const hour = timeMode === "auto" ? nowDate.getHours() + nowDate.getMinutes() / 60 : { day: 12, dusk: 18.2, night: 23 }[timeMode];
  const phase = hour < 5 || hour >= 19.5 ? "night" : hour < 7.5 ? "dawn" : hour < 17.5 ? "day" : "dusk";
  const sky = { phase, hour };

  const doWarp = () => { warp.current = performance.now() + 3000; play("warp"); };
  const doBoom = () => { boom.current = performance.now(); play("boom"); };
  const doGlitch = () => { setGlitch(true); setTimeout(() => setGlitch(false), 1700); };
  const onPhotoClick = (e) => {
    clicks.current += 1;
    if (clicks.current % 7 === 0) { doFx("fireworks"); doWarp(); say(t.play.photo); play("win"); }
    else doFx("confetti", e.clientX, e.clientY);
  };
  const doFx = (type, x = window.innerWidth / 2, y = window.innerHeight / 2) => {
    play(type === "matrix" ? "matrix" : "pop");
    setFx({ type, x, y, id: performance.now(), colors: [P.a, P.b, P.c] });
  };
  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 2600); };

  /* what the visitor can type in the terminal */
  const runCommand = (raw) => {
    const [cmd, ...rest] = raw.trim().toLowerCase().split(/\s+/);
    const arg = rest.join(" ");
    switch (cmd) {
      case "": return [];
      case "help": return ["about · skills · projects · contact · neofetch", "lang en|km · theme dark|light · sound on|off · lite on|off", "color neon|sunset|toxic|ice|ember", "warp · matrix · confetti · fireworks · explode · magnet on|off", "goto about|skills|projects|experience|contact", "game · ask · cv · time auto|day|dusk|night", "hire me · whoami · joke · ls · clear · exit", "(there are hidden commands too 😉)"];
      case "about": return [t.summary];
      case "skills": return Object.entries(profile.skills).map(([g, l]) => `${g}: ${l.join(", ")}`);
      case "projects": return projects.map((p, i) => `${i + 1}. ${lang === "km" && p.title_km ? p.title_km : p.title_en} [${p.category}]`);
      case "contact": return [profile.email, profile.phone];
      case "lang": if (arg === "en" || arg === "km") { setLang(arg); return [`language: ${arg}`]; } return ["usage: lang en|km"];
      case "theme": if (arg === "dark" || arg === "light") { setTheme(arg); return [`theme: ${arg}`]; } return ["usage: theme dark|light"];
      case "color": { const i = palettes.findIndex((c) => c.id === arg); if (i < 0) return ["usage: color neon|sunset|toxic|ice|ember"]; setPal(i); return [`color: ${arg}`]; }
      case "warp": doWarp(); return ["Engaging hyperdrive… 🚀"];
      case "matrix": doFx("matrix"); return ["Wake up, Neo…"];
      case "confetti": doFx("confetti"); return ["🎉"];
      case "goto": { const el = document.getElementById(arg); if (!el) return ["usage: goto about|skills|projects|experience|contact"]; setTermOpen(false); el.scrollIntoView({ behavior: "smooth" }); return []; }
      case "hire": window.location.href = `mailto:${profile.email}`; return ["Great choice 😎 opening your email app…"];
      case "sudo": return ["Nice try. Permission denied 😄"];
      case "lite": if (arg === "on" || arg === "off") { setLite(arg === "on"); return [`lite mode: ${arg}`]; } return ["usage: lite on|off"];
      case "fireworks": doFx("fireworks"); return ["🎆"];
      case "magnet": if (arg === "on" || arg === "off") { setMagnet(arg === "on"); return [`magnet: ${arg}`]; } return ["usage: magnet on|off"];
      case "glitch": doGlitch(); return ["…reality.exe has stopped responding"];
      case "hack": doGlitch(); say("ACCESS GRANTED ✅"); return ["Connecting to mainframe…", "Bypassing firewall… [████████░░] 80%", "Injecting payload…", "Downloading all the secrets…", "ACCESS GRANTED ✅  (relax, this is just a prank 😄)"];
      case "game": setTermOpen(false); setGameOpen(true); return [];
      case "ask": setTermOpen(false); setChatOpen(true); return [];
      case "cv": window.open(cvUrl, "_blank"); return ["Opening my CV…"];
      case "time": if (TIME_MODES.includes(arg)) { setTimeMode(arg); return [`time: ${arg}`]; } return ["usage: time auto|day|dusk|night"];
      case "explode": doBoom(); return ["💥 Boom!"];
      case "sound": if (arg === "on" || arg === "off") { setSound(arg === "on"); if (arg === "on") sfx("win", true); return [`sound: ${arg}`]; } return ["usage: sound on|off"];
      case "whoami": return ["visitor — nice to meet you 👋"];
      case "date": return [new Date().toString()];
      case "joke": { const j = ["Why do programmers prefer dark mode? Because light attracts bugs. 🐛", "There are 10 types of people: those who understand binary and those who don't.", "A SQL query walks into a bar, walks up to two tables and asks: can I join you?"]; return [j[(Math.random() * j.length) | 0]]; }
      case "ls": return ["about/  skills/  projects/  contact/  secret.txt"];
      case "cat": return arg === "secret.txt" ? ["You found the secret file! 🏆", "Secret: the best portfolios have hidden doors.", "Bonus: type  rm -rf /  if you dare 😈"] : [`cat: ${arg || "?"}: No such file`];
      case "rm": if (arg.startsWith("-rf")) { doBoom(); return ["Deleting everything… 💥", "…just kidding 😄 everything is fine."]; } return ["rm: permission denied"];
      case "neofetch": return [`${displayName.toLowerCase().replace(" ", "")}@portfolio`, "-----------------------", "OS: SAKHAK-OS 1.0 (React)", "Host: Phnom Penh, Cambodia", "Skills: React, Laravel, PHP, Photoshop, Premiere", "Languages: Khmer, English", `Theme: ${P.id} / ${theme}`, "Uptime: 1+ year of coding"];
      case "clear": return "__clear";
      case "exit": return "__exit";
      default: return [`command not found: ${cmd}. Type "help".`];
    }
  };

  /* secret keys: ` opens the terminal, Konami code unlocks a surprise */
  const api = useRef({});
  api.current = { warp: doWarp, fx: doFx, say, play, boom: doBoom, msg: t.play.konami, idle: t.play.idle, shake: t.play.shake };
  useEffect(() => {
    const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let i = 0;
    const onKey = (e) => {
      const typing = ["INPUT", "TEXTAREA"].includes(e.target.tagName);
      if (typing) return;
      if (e.key === "`") { e.preventDefault(); setTermOpen((o) => !o); return; }
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = k === seq[i] ? i + 1 : k === seq[0] ? 1 : 0;
      if (i === seq.length) { i = 0; api.current.warp(); api.current.fx("matrix"); api.current.say(api.current.msg); api.current.play("win"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Android phones: tilt to tilt my photo, shake to explode the scene.
     (iPhones need a permission pop-up for this, so it is simply skipped there) */
  useEffect(() => {
    let lastShake = 0;
    const onOrient = (e) => {
      if (e.gamma == null || !photoRef.current) return;
      const c = (v) => Math.max(-1, Math.min(1, v));
      photoRef.current.style.setProperty("--pry", `${c(e.gamma / 30) * 14}deg`);
      photoRef.current.style.setProperty("--prx", `${-c((e.beta - 45) / 30) * 14}deg`);
    };
    const onMotion = (e) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const g = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
      const now = performance.now();
      if (g > 32 && now - lastShake > 3500) { lastShake = now; api.current.boom(); api.current.say(api.current.shake); }
    };
    window.addEventListener("deviceorientation", onOrient);
    window.addEventListener("devicemotion", onMotion);
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("devicemotion", onMotion);
    };
  }, []);

  /* scroll progress bar + a one-time surprise if the visitor is idle for 30 seconds */
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      root.current?.style.setProperty("--sp", max > 0 ? window.scrollY / max : 0);
      setShowTop(window.scrollY > 500);
    };
    let timer, fired = false;
    const reset = () => {
      clearTimeout(timer);
      if (fired) return;
      timer = setTimeout(() => { fired = true; api.current.fx("confetti"); api.current.say(api.current.idle); }, 30000);
    };
    const evs = ["mousemove", "keydown", "scroll", "touchstart"];
    window.addEventListener("scroll", onScroll, { passive: true });
    evs.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      evs.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, []);

  /* tilts your photo in 3D toward the mouse */
  const photoMove = (e) => {
    const r = photoRef.current.getBoundingClientRect();
    photoRef.current.style.setProperty("--pry", `${((e.clientX - r.left) / r.width - 0.5) * 24}deg`);
    photoRef.current.style.setProperty("--prx", `${-((e.clientY - r.top) / r.height - 0.5) * 24}deg`);
  };
  const photoLeave = () => {
    photoRef.current.style.setProperty("--pry", "0deg");
    photoRef.current.style.setProperty("--prx", "0deg");
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem("lang", lang); } catch { /* ignore */ }
  }, [lang]);
  useEffect(() => {
    document.title = profile.pageTitle;
  }, [profile.pageTitle]);

  const translatedProjects = useMemo(() => translateProjects(projects, lang), [projects, lang]);
  const shown = (filter === "All" ? translatedProjects : translatedProjects.filter((project) => project.category === filter));
  const marqueeSkills = Object.values(profile.skills).flat();
  const marquee = [...marqueeSkills, ...marqueeSkills];

  const mv = useRef({ x: 0, y: 0, raf: 0 });
  const onMove = (e) => {
    mv.current.x = e.clientX;
    mv.current.y = e.clientY;
    if (mv.current.raf) return;
    mv.current.raf = requestAnimationFrame(() => {
      mv.current.raf = 0;
      root.current?.style.setProperty("--mx", `${mv.current.x}px`);
      root.current?.style.setProperty("--my", `${mv.current.y}px`);
    });
  };

  return (
    <div className={`pf${lite ? " lite" : ""}${glitch ? " glitch" : ""}`} lang={lang} data-theme={theme} data-phase={phase} ref={root} onMouseMove={onMove}
      style={theme === "dark" || pal !== 0 ? { "--a": P.a, "--b": P.b, "--c": P.c } : undefined}>
      {!booted && <Boot name={displayName} onDone={() => setBooted(true)} />}
      <div className="hud" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="sky" aria-hidden="true" />
      <Scene3D theme={theme} colors={[P.a, P.b, P.c]} warp={warp} boom={boom} lite={lite} magnet={magnetRef} sky={sky} />
      <Fx fx={fx} />
      <Cursor />
      <div className="progress" aria-hidden="true" />
      <div className="glow" aria-hidden="true" />
      <div className="blobs" aria-hidden="true"><i /><i /><i /></div>

      <nav aria-label="Main">
        <div className="wrap">
          <a className="brand" href="#top">{displayName}</a>
          <div className="links">
            <a href="#about">{t.n.about}</a><a href="#skills">{t.n.skills}</a><a href="#projects">{t.n.projects}</a>
            <a href="#experience">{t.n.experience}</a><a href="#contact">{t.n.contact}</a>
            <button className="theme" onClick={() => setLang(lang === "en" ? "km" : "en")} aria-label={t.switchAria}>{t.switchTo}</button>
            <button className="theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={t.themeAria}>
              {theme === "dark" ? t.light : t.dark}
            </button>
          </div>
        </div>
      </nav>

      <main id="top">
        <header className="wrap hero">
          <div>
            <p className="hi"><b>👋</b> {t.hi}</p>
            <h1>{t.iam} <span className="grad"><Scramble text={displayName} /></span></h1>
            <p className="typed" aria-live="off"><Typed key={lang} words={t.typed} /></p>
            <p className="lead">{t.summary}</p>
            <div className="cta">
              <a className="btn" href="#projects">{t.seeProjects}</a>
              <a className="btn ghost" href="#contact">{t.getInTouch}</a>
              <a className="btn ghost" href={cvUrl} download>{t.cv}</a>
              <button className="btn ghost" onClick={() => setChatOpen(true)}>{t.ask}</button>
            </div>
            <div className="stats">
              {t.stats.map(([n, l]) => <div key={l}><b className="grad">{n}</b><span>{l}</span></div>)}
            </div>
          </div>

          <div className="photo" ref={photoRef} onMouseMove={photoMove} onMouseLeave={photoLeave} onClick={onPhotoClick}>
            <div className="ring" aria-hidden="true" />
            <svg className="hudring" viewBox="0 0 100 100" aria-hidden="true">
              <circle className="r1" cx="50" cy="50" r="48" />
              <circle className="r2" cx="50" cy="50" r="45.5" />
              <circle className="r3" cx="50" cy="50" r="49.4" />
            </svg>
            <div className="orb" aria-hidden="true" />
            {["b1", "b2", "b3", "b4"].map((b) => <i className={`br ${b}`} key={b} aria-hidden="true" />)}
            <div className="frame">
              {photoOk
                ? <img src={profile.photo || PHOTO} alt={displayName} onError={() => setPhotoOk(false)} />
                : <span className="ini grad">{profile.initials}</span>}
            </div>
            {profile.orbit.map((o) => <span className="badge" key={o} aria-hidden="true">{o}</span>)}
            <span className="tag t1" aria-hidden="true">{profile.idTag}</span>
            <span className="tag t2" aria-hidden="true">{profile.onlineTag}</span>
          </div>
        </header>

        <div className="marq" aria-hidden="true">
          <div className="track">{marquee.map((s, i) => <span key={i}>{s}</span>)}</div>
        </div>

        <section id="about" className="wrap">
          <Reveal><h2>{t.n.about}</h2></Reveal>
          <div className="about">
            <Reveal><p>{t.about}</p></Reveal>
            <Reveal delay={0.15}>
              <dl>{t.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            </Reveal>
          </div>
          <div className="svc">
            {t.services.map((s, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="ico" aria-hidden="true">{icons[i]}</div>
                <h3>{s.title}</h3>
                <ul>{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="skills" className="wrap">
          <Reveal><h2>{t.n.skills}</h2></Reveal>
          {Object.entries(profile.skills).map(([g, list], k) => (
            <Reveal className="sg" delay={k * 0.1} key={g}>
              <h3>{t.g[g]}</h3>
              <div className="chips">{list.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
            </Reveal>
          ))}
        </section>

        <section id="showcase" className="wrap">
          <Reveal><h2>{t.n.showcase}</h2></Reveal>
          <Reveal><p className="sub">{t.show}</p></Reveal>
          <Reveal><Laptop3D projects={translatedProjects} colors={[P.a, P.b, P.c]} lang={lang} lite={lite} /></Reveal>
        </section>

        <section id="projects" className="wrap">
          <Reveal><h2>{t.n.projects}</h2></Reveal>
          <div className="filters" role="group" aria-label={t.filterAria}>
            {categories.map((c) => <button key={c} aria-pressed={filter === c} onClick={() => setFilter(c)}>{t.cat[c]}</button>)}
          </div>
          {projectError && <p className="status err" role="alert">{projectError}</p>}
          {shown.length === 0 && !projectError && <p style={{ color: "var(--muted)" }}>{t.empty.replace("{category}", t.cat[filter])}</p>}
          <div className="grid">
            {shown.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.1}>
                <Tilt>
                  <div className="thumb">
                    {p.image ? <img src={p.image} alt={p.title} loading="lazy" /> : <span aria-hidden="true">{p.title.charAt(0)}</span>}
                  </div>
                  <div className="body">
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    <div className="chips">{p.tech.map((x) => <span className="chip" key={x}>{x}</span>)}</div>
                    {(p.link || p.github) && (
                      <div className="actions">
                        {p.link && <a href={p.link} target="_blank" rel="noreferrer">{t.live}</a>}
                        {p.github && <a href={p.github} target="_blank" rel="noreferrer">{t.source}</a>}
                      </div>
                    )}
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="experience" className="wrap">
          <div className="cols">
            <div><Reveal><h2>{t.n.experience}</h2></Reveal><Timeline items={t.experience} /></div>
            <div><Reveal><h2>{t.n.education}</h2></Reveal><Timeline items={t.education} /></div>
          </div>
        </section>

        <section id="guestbook" className="wrap">
          <Reveal><h2>{t.n.guestbook}</h2></Reveal>
          <Reveal><p className="sub">{t.gb.intro}</p></Reveal>
          <Guestbook t={t} lang={lang} />
        </section>

        <section id="contact" className="wrap">
          <Reveal><h2>{t.n.contact}</h2></Reveal>
          <div className="contact">
            <Reveal>
              <p>{t.contactIntro}</p>
              <ul>
                <li><a className="contact-link" href={`mailto:${profile.email}`}><ContactIcon name="email" />{profile.email}</a></li>
                <li><a className="contact-link" href={`tel:${profile.phoneLink}`}><ContactIcon name="phone" />{profile.phone}</a></li>
                <li><a className="contact-link" href={cvUrl} download><ContactIcon name="cv" />{t.cv}</a></li>
                {profile.socials.map(([n, u]) => <li key={n}><a className="contact-link" href={u} target="_blank" rel="noreferrer"><ContactIcon name={n} />{n}</a></li>)}
              </ul>
            </Reveal>
            <Reveal delay={0.15}><ContactForm t={t} email={profile.email} /></Reveal>
          </div>
        </section>
      </main>

      <button
        className={`totop${showTop ? " show" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t.backToTop}
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 15l7-7 7 7" /></svg>
      </button>
      <Game open={gameOpen} onClose={() => setGameOpen(false)} t={t} colors={[P.a, P.b, P.c]} play={play} />
      <Chat open={chatOpen} onClose={() => setChatOpen(false)} t={t} lang={lang} profile={profile} projects={translatedProjects} />
      <Terminal open={termOpen} onClose={() => setTermOpen(false)} run={runCommand} beep={play} />
      {toast && <div className="toast" role="status">{toast}</div>}
      <div className="dock">
        {dockOpen && (
          <div className="dock-panel" role="group" aria-label={t.play.title}>
            <p className="dock-h">{t.play.color}</p>
            <div className="swatches">
              {palettes.map((c, i) => (
                <button key={c.id} className="sw" aria-label={c.id} aria-pressed={pal === i} onClick={() => setPal(i)}
                  style={{ background: `linear-gradient(135deg,${c.a},${c.b},${c.c})` }} />
              ))}
            </div>
            <div className="dock-btns">
              <button onClick={doWarp}>{t.play.warp}</button>
              <button onClick={() => doFx("matrix")}>{t.play.matrix}</button>
              <button onClick={() => doFx("confetti")}>{t.play.confetti}</button>
              <button onClick={doBoom}>{t.play.explode}</button>
              <button onClick={() => setTermOpen(true)}>{t.play.terminal}</button>
              <button onClick={() => { setSound(!sound); if (!sound) sfx("win", true); }}>{sound ? t.play.soundOn : t.play.soundOff}</button>
              <button onClick={() => setLite(!lite)}>{lite ? t.play.liteOn : t.play.liteOff}</button>
              <button onClick={() => setMagnet(!magnet)}>{magnet ? t.play.magnetOn : t.play.magnetOff}</button>
              <button onClick={() => doFx("fireworks")}>{t.play.fireworks}</button>
              <button onClick={() => { setDockOpen(false); setGameOpen(true); }}>{t.play.game}</button>
              <button onClick={() => setTimeMode(TIME_MODES[(TIME_MODES.indexOf(timeMode) + 1) % TIME_MODES.length])}>{t.play[{ auto: "timeAuto", day: "timeDay", dusk: "timeDusk", night: "timeNight" }[timeMode]]}</button>
            </div>
            <p className="dock-tip">{t.play.tip}</p>
          </div>
        )}
        <button className="dock-btn" onClick={() => setDockOpen(!dockOpen)} aria-expanded={dockOpen}>{t.play.open}</button>
      </div>

      <footer><div className="wrap">{t.footer.replace("{year}", new Date().getFullYear()).replace("{name}", displayName)}</div></footer>
    </div>
  );
}
