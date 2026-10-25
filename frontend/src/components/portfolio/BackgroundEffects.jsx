import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function Scene3D({ theme, colors, warp, boom, lite, magnet, sky }) {
  const mount = useRef(null);
  useEffect(() => {
    const el = mount.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: !lite, alpha: true, powerPreference: "low-power" }); } catch { return; }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dark = theme === "dark";
    const palette = colors.map((h) => parseInt(h.slice(1), 16));
    const geos = [], mats = [];
    const geo = (g) => (geos.push(g), g);
    const mat = (c, extra = {}) => {
      const m = new THREE.MeshStandardMaterial({ color: c, metalness: 0.55, roughness: 0.3, flatShading: true, ...extra });
      mats.push(m);
      return m;
    };

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 10;
    scene.add(camera);
    camera.add(new THREE.AmbientLight(0xffffff, dark ? 0.7 : 1.1));
    [[palette[0], 6, 5, 4], [palette[1], -6, -4, 3], [palette[2], 0, 6, -2]].forEach(([c, x, y, z]) => {
      const l = new THREE.PointLight(c, 90, 60);
      l.position.set(x, y, z);
      camera.add(l);
    });

    const world = new THREE.Group();
    scene.add(world);

    /* sun or moon placed by the visitor's real time of day, plus stars at night */
    {
      const night = sky.phase === "night";
      const col = night ? 0xdfe9ff : sky.phase === "day" ? 0xffe27a : sky.phase === "dusk" ? 0xff7a45 : 0xffb36b;
      const hh = night ? (sky.hour >= 18 ? sky.hour - 18 : sky.hour + 6) : sky.hour - 6;
      const prog = Math.min(1, Math.max(0, hh / 12));
      const fitX = Math.min(1, window.innerWidth / window.innerHeight / 1.6);
      const basic = (c, o) => {
        const m = new THREE.MeshBasicMaterial({ color: c, transparent: o != null, opacity: o ?? 1 });
        mats.push(m);
        return m;
      };
      [[night ? 0.9 : 1.3, 1], [night ? 1.7 : 2.8, 0.16]].forEach(([r, o]) => {
        const m = new THREE.Mesh(geo(new THREE.SphereGeometry(r, 32, 32)), basic(col, o === 1 ? undefined : o));
        m.position.set((-9 + 18 * prog) * fitX, 1 + Math.sin(prog * Math.PI) * 4.5, -22);
        camera.add(m);
      });
      if (night) {
        const sp = new Float32Array(300 * 3);
        for (let i = 0; i < 300; i++) { sp[i * 3] = (Math.random() - 0.5) * 70; sp[i * 3 + 1] = (Math.random() - 0.5) * 40; sp[i * 3 + 2] = -30; }
        const sg = geo(new THREE.BufferGeometry());
        sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
        const sm = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.9 });
        mats.push(sm);
        camera.add(new THREE.Points(sg, sm));
      }
    }

    const knot = new THREE.Mesh(geo(new THREE.TorusKnotGeometry(1.5, 0.42, lite ? 70 : 110, lite ? 12 : 16)), mat(palette[0], { roughness: 0.2 }));
    world.add(knot);

    /* glowing grid floor that rolls toward you */
    const grid = new THREE.GridHelper(80, 80, palette[2], palette[0]);
    grid.position.set(0, -4.5, -14);
    grid.material.transparent = true;
    grid.material.opacity = dark ? 0.35 : 0.25;
    geos.push(grid.geometry);
    mats.push(grid.material);
    world.add(grid);

    const makers = [
      () => new THREE.IcosahedronGeometry(0.8),
      () => new THREE.OctahedronGeometry(0.8),
      () => new THREE.TorusGeometry(0.7, 0.22, 12, 28),
      () => new THREE.BoxGeometry(1, 1, 1),
      () => new THREE.TetrahedronGeometry(0.9),
    ];
    const shapes = [];
    const COUNT = lite ? 8 : 16;
    for (let i = 0; i < COUNT; i++) {
      const wire = i % 2 === 0;
      const m = new THREE.Mesh(
        geo(makers[i % makers.length]()),
        mat(palette[i % 3], wire ? { wireframe: true, flatShading: false } : { transparent: true, opacity: 0.85 })
      );
      m.userData = {
        bx: (i % 2 ? 1 : -1) * (4 + Math.random() * 5),
        by: -2 - i * (16 / COUNT) * 2.4 + Math.random() * 2,
        bob: Math.random() * 6,
        sx: (Math.random() - 0.5) * 0.01 + 0.004,
        sy: (Math.random() - 0.5) * 0.01 + 0.004,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        dz: (Math.random() - 0.5) * 2,
      };
      m.position.z = m.userData.z0 = -4 + Math.random() * 5;
      world.add(m);
      shapes.push(m);
    }

    const N = lite ? 250 : 500, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = 5 - Math.random() * 45;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    const pg = geo(new THREE.BufferGeometry());
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pm = new THREE.PointsMaterial({ color: dark ? 0xcfc6ff : 0x5b3fe0, size: 0.06, transparent: true, opacity: 0.7 });
    mats.push(pm);
    world.add(new THREE.Points(pg, pm));

    const layout = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const wide = camera.aspect > 1.1;
      const fit = Math.min(1, camera.aspect / 1.6);
      knot.position.set(wide ? 3.9 : 0, wide ? 0.2 : 2.2, -1.5);
      knot.scale.setScalar(wide ? 1 : 0.55);
      shapes.forEach((m) => { m.userData.x0 = m.userData.bx * fit; });
    };
    layout();

    const mouse = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    /* phone: tilting the phone or dragging a finger moves the scene */
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    const onTilt = (e) => {
      if (e.gamma == null) return;
      mouse.x = clamp(e.gamma / 30);
      mouse.y = clamp((e.beta - 45) / 30);
    };
    const onTouch = (e) => {
      const f = e.touches[0];
      if (!f) return;
      mouse.x = (f.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (f.clientY / window.innerHeight) * 2 - 1;
    };
    const clock = new THREE.Clock();
    let raf = 0, spin = 0, gz = 0, mgv = 0;
    const interval = 1000 / (lite ? 30 : 45); /* limit the frame rate to save power */
    let last = 0;
    const frame = (now = 0) => {
      if (!reduce && now - last < interval) { raf = requestAnimationFrame(frame); return; }
      const dtf = Math.min(4, Math.max(1, (now - last) / 16.667));
      last = now;
      const t = clock.getElapsedTime();
      /* "warp" speed-up: k goes 0 -> 1 -> 0 over 3 seconds */
      const left = Math.max(0, warp.current - performance.now()) / 3000;
      const k = left > 0 ? Math.sin(left * Math.PI) : 0;
      /* "explode": shapes fly outward and come back (0 -> 1 -> 0 over 2.6 seconds) */
      const bt = performance.now() - boom.current;
      const ex = bt >= 0 && bt < 2600 ? Math.sin((bt / 2600) * Math.PI) : 0;
      const boost = 1 + k * 25 + ex * 15;
      spin += k * 0.35 * dtf;
      gz += (0.015 + k * 0.7) * dtf;
      camera.fov = 55 + k * 40;
      camera.updateProjectionMatrix();
      world.rotation.z = k * 0.5;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const targetY = -(window.scrollY / max) * 38;
      camera.position.y += (targetY - camera.position.y) * Math.min(1, 0.06 * dtf);
      cur.x += (mouse.x - cur.x) * Math.min(1, 0.05 * dtf);
      cur.y += (mouse.y - cur.y) * Math.min(1, 0.05 * dtf);
      camera.position.x = cur.x * 1.2 + Math.sin(t * 70) * ex * 0.12;
      camera.rotation.y = -cur.x * 0.06;
      camera.rotation.x = -cur.y * 0.04;
      grid.position.z = -14 + (gz % 1);
      knot.rotation.x = t * 0.25 + cur.y * 0.6 + spin * 0.5;
      knot.rotation.y = t * 0.35 + cur.x * 0.6 + spin;
      /* "magnet": shapes near the screen chase your cursor / finger */
      mgv += ((magnet.current ? 1 : 0) - mgv) * Math.min(1, 0.06 * dtf);
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * 10;
      const mx = camera.position.x + mouse.x * halfH * camera.aspect;
      const my = camera.position.y - mouse.y * halfH;
      shapes.forEach((m) => {
        m.rotation.x += m.userData.sx * boost * dtf;
        m.rotation.y += m.userData.sy * boost * dtf;
        const vis = Math.abs(m.userData.by - camera.position.y) < 9 ? mgv * 0.85 : 0;
        const bx = m.userData.x0 + m.userData.dx * ex * 9;
        const by = m.userData.by + Math.sin(t + m.userData.bob) * 0.35 + m.userData.dy * ex * 9;
        m.position.x = bx + (mx + Math.cos(t + m.userData.bob) * 2.2 - bx) * vis;
        m.position.y = by + (my + Math.sin(t * 1.3 + m.userData.bob) * 2.2 - by) * vis;
        m.position.z = m.userData.z0 + m.userData.dz * ex * 6;
      });
      renderer.render(scene, camera);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    const onResize = () => { layout(); if (reduce) frame(); };
    frame();
    window.addEventListener("resize", onResize);
    if (!reduce) {
      window.addEventListener("mousemove", onMouse);
      window.addEventListener("deviceorientation", onTilt);
      window.addEventListener("touchmove", onTouch, { passive: true });
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("deviceorientation", onTilt);
      window.removeEventListener("touchmove", onTouch);
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [theme, colors.join(), lite, sky.phase]);
  return <div ref={mount} className="scene" aria-hidden="true" />;
}

/* start-up screen: a short "system boot" bar */
export function Boot({ onDone, name }) {
  const [p, setP] = useState(0);
  const done = useRef(onDone);
  useEffect(() => {
    const id = setInterval(() => setP((x) => Math.min(100, x + 4 + Math.floor(Math.random() * 12))), 90);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (p >= 100) { const t = setTimeout(() => done.current(), 350); return () => clearTimeout(t); }
  }, [p]);
  return (
    <div className="boot" role="status" aria-label="Loading">
      <div>
        <p>&gt; BOOTING {name.toUpperCase()}</p>
        <p>&gt; LOADING MODULES…</p>
        <div className="bar"><i style={{ width: `${p}%` }} /></div>
        <p>{p}%</p>
      </div>
    </div>
  );
}

export function Game({ open, onClose, t, colors, play }) {
  const cv = useRef(null);
  const [phase, setPhase] = useState("idle");
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(30);
  const [best, setBest] = useState(() => {
    try { return Number(localStorage.getItem("sakhak-best")) || 0; } catch { return 0; }
  });
  useEffect(() => { if (!open) setPhase("idle"); }, [open]);
  useEffect(() => {
    if (phase !== "play") return;
    const c = cv.current, ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio, 1.5), W = window.innerWidth, H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = [...colors, "#ffd84d"];
    const shapes = [], bits = [];
    let sc = 0, raf = 0, next = 0, lastLeft = 30, stop = false;
    const start = performance.now();
    setScore(0); setLeft(30);
    const spawn = (now) => {
      const r = 22 + Math.random() * 30;
      shapes.push({
        x: r + Math.random() * (W - 2 * r), y: 80 + r + Math.random() * (H - 2 * r - 80),
        vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, r, rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.08, n: 3 + ((Math.random() * 4) | 0), c: cols[(Math.random() * cols.length) | 0],
        born: now, life: 3200 + Math.random() * 1500,
      });
    };
    const hit = (e) => {
      const rect = c.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
      for (let i = shapes.length - 1; i >= 0; i--) {
        const s = shapes[i];
        if (Math.hypot(s.x - x, s.y - y) < s.r + 10) {
          sc += s.r < 34 ? 3 : 1;
          setScore(sc);
          for (let k = 0; k < 14; k++) bits.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 9, vy: (Math.random() - 0.5) * 9, life: 1, c: s.c });
          shapes.splice(i, 1);
          play("pop");
          break;
        }
      }
    };
    c.addEventListener("pointerdown", hit);
    const tick = (now) => {
      const el = now - start, remain = Math.max(0, 30 - el / 1000), sec = Math.ceil(remain);
      if (sec !== lastLeft) { lastLeft = sec; setLeft(sec); }
      if (remain > 0 && now >= next && shapes.length < 9) { spawn(now); next = now + Math.max(220, 600 - el / 60); }
      ctx.clearRect(0, 0, W, H);
      for (let i = shapes.length - 1; i >= 0; i--) {
        const s = shapes[i];
        s.x += s.vx; s.y += s.vy; s.rot += s.vr;
        if (s.x < s.r || s.x > W - s.r) s.vx *= -1;
        if (s.y < s.r + 70 || s.y > H - s.r) s.vy *= -1;
        const age = now - s.born;
        if (age > s.life) { shapes.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.globalAlpha = Math.min(1, age / 200, (s.life - age) / 400);
        ctx.scale(0.55 + Math.abs(Math.cos(s.rot)) * 0.45, 1);   /* flipping = looks 3D */
        ctx.rotate(s.rot * 0.5);
        ctx.beginPath();
        for (let k = 0; k < s.n; k++) {
          const a = (k / s.n) * 6.283;
          k ? ctx.lineTo(Math.cos(a) * s.r, Math.sin(a) * s.r) : ctx.moveTo(Math.cos(a) * s.r, Math.sin(a) * s.r);
        }
        ctx.closePath();
        ctx.fillStyle = s.c + "cc"; ctx.shadowColor = s.c; ctx.shadowBlur = 22; ctx.fill();
        ctx.shadowBlur = 0; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath();
        for (let k = 0; k < s.n; k++) { const a = (k / s.n) * 6.283; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * s.r, Math.sin(a) * s.r); }
        ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
      }
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i];
        b.x += b.vx; b.y += b.vy; b.vy += 0.25; b.life -= 0.04;
        if (b.life <= 0) { bits.splice(i, 1); continue; }
        ctx.globalAlpha = b.life; ctx.fillStyle = b.c; ctx.fillRect(b.x, b.y, 5, 5);
      }
      ctx.globalAlpha = 1;
      if (remain <= 0) {
        try {
          const prev = Number(localStorage.getItem("sakhak-best")) || 0;
          if (sc > prev) localStorage.setItem("sakhak-best", String(sc));
          setBest(Math.max(prev, sc));
        } catch { setBest((b) => Math.max(b, sc)); }
        setPhase("over");
        return;
      }
      if (!stop) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { stop = true; cancelAnimationFrame(raf); c.removeEventListener("pointerdown", hit); };
  }, [phase]);
  if (!open) return null;
  return (
    <div className="game" role="dialog" aria-label={t.game.title}>
      <canvas ref={cv} />
      <div className="gbar">
        <span>{t.game.score}: {score}</span><span>{t.game.time}: {left}</span><span>{t.game.best}: {best}</span>
        <button onClick={onClose} aria-label={t.game.close}>✕</button>
      </div>
      {phase !== "play" && (
        <div className="gcard">
          <h3>{phase === "over" ? t.game.over : t.game.title}</h3>
          {phase === "over" ? <p className="big">{t.game.score}: {score}</p> : <p>{t.game.intro}</p>}
          <button className="btn" onClick={() => setPhase("play")}>{phase === "over" ? t.game.again : t.game.start}</button>
        </div>
      )}
    </div>
  );
}

/* ---------- 3D laptop that shows my projects on its screen ---------- */
