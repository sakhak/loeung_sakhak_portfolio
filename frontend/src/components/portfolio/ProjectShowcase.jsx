import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { letters } from "./SharedComponents.jsx";

const FONT = "'Sora','Noto Sans Khmer','Segoe UI',sans-serif";
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function wrapText(ctx, str, x, y, maxW, lh, maxLines) {
  const sp = str.includes(" "), words = sp ? str.split(" ") : letters(str), lines = [];
  let line = "";
  words.forEach((w) => {
    const test = line ? line + (sp ? " " : "") + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  });
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((l, i) => ctx.fillText(i === maxLines - 1 && lines.length > maxLines ? l + "…" : l, x, y + i * lh));
}
function drawScreen(cvs, p, cols, i, n, still, done) {
  const ctx = cvs.getContext("2d"), W = cvs.width, H = cvs.height;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0b0d16"); bg.addColorStop(1, "#151b30");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#1b2036"; ctx.fillRect(0, 0, W, 56);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, k) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(34 + k * 30, 28, 9, 0, 6.283); ctx.fill(); });
  ctx.fillStyle = "#0b0d16"; rr(ctx, 150, 12, 724, 32, 16); ctx.fill();
  ctx.fillStyle = "#8fa0bf"; ctx.font = "20px monospace"; ctx.fillText(`sakhak.dev / project-${i + 1}`, 176, 34);
  const hero = ctx.createLinearGradient(60, 92, W - 60, 300);
  hero.addColorStop(0, cols[0]); hero.addColorStop(0.55, cols[1]); hero.addColorStop(1, cols[2]);
  ctx.fillStyle = hero; rr(ctx, 60, 92, W - 120, 210, 18); ctx.fill();
  ctx.fillStyle = "#06070D"; ctx.font = `800 44px ${FONT}`;
  wrapText(ctx, p.title, 96, 156, W - 192, 56, 2);
  ctx.font = `500 22px ${FONT}`; ctx.globalAlpha = 0.75; ctx.fillText(p.category, 96, 276); ctx.globalAlpha = 1;
  ctx.fillStyle = "#c9d3ea"; ctx.font = `400 26px ${FONT}`;
  wrapText(ctx, p.description, 60, 360, W - 120, 40, 4);
  let x = 60;
  p.tech.forEach((tc) => {
    ctx.font = `600 20px ${FONT}`;
    const w = ctx.measureText(tc).width + 36;
    ctx.fillStyle = "#1b2036"; rr(ctx, x, 540, w, 40, 20); ctx.fill();
    ctx.fillStyle = cols[2]; ctx.fillText(tc, x + 18, 567);
    x += w + 12;
  });
  for (let k = 0; k < n; k++) { ctx.fillStyle = k === i ? cols[2] : "#2a3350"; ctx.beginPath(); ctx.arc(W - 60 - (n - 1 - k) * 26, 560, 8, 0, 6.283); ctx.fill(); }
  if (p.image) {   /* a real screenshot covers the page under the browser bar */
    const im = new Image();
    im.onload = () => {
      if (!still()) return;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 56, W, H - 56); ctx.clip();
      const sc = Math.max(W / im.width, (H - 56) / im.height), w = im.width * sc, h = im.height * sc;
      ctx.drawImage(im, (W - w) / 2, 56 + (H - 56 - h) / 2, w, h);
      ctx.restore();
      ctx.fillStyle = "rgba(5,6,12,.78)"; ctx.fillRect(0, H - 70, W, 70);
      ctx.fillStyle = "#fff"; ctx.font = `700 28px ${FONT}`; ctx.fillText(p.title.slice(0, 48), 30, H - 26);
      done();
    };
    im.src = p.image;
  }
}

export function Laptop3D({ projects, colors, lang, lite }) {
  const mount = useRef(null);
  const [idx, setIdx] = useState(0);
  const st = useRef({ idx: 0, lang, projects, redraw: null });
  const n = projects.length;
  const currentIndex = n ? idx % n : 0;

  useEffect(() => {
    st.current.idx = currentIndex;
    st.current.lang = lang;
    st.current.projects = projects;
    st.current.redraw?.();
  }, [currentIndex, lang, projects]);

  useEffect(() => {
    if (!n) return undefined;
    const el = mount.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: !lite, alpha: true, powerPreference: "low-power" }); } catch { return; }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pal = colors.map((h) => parseInt(h.slice(1), 16));
    const geos = [], mats = [];
    const gm = (g) => (geos.push(g), g);
    const mm = (m) => (mats.push(m), m);
    let w = el.clientWidth || 600, h = el.clientHeight || 380;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1 : 1.5));
    renderer.setSize(w, h);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 50);
    camera.position.set(0, 1.4, 8.6);
    camera.lookAt(0, 0.6, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    [[pal[0], 4, 4, 5, 80], [pal[1], -4, 2, 4, 60], [pal[2], 0, -1, 6, 40]].forEach(([c, x, y, z, i]) => {
      const l = new THREE.PointLight(c, i, 40); l.position.set(x, y, z); scene.add(l);
    });
    const g = new THREE.Group();
    scene.add(g);
    const metal = mm(new THREE.MeshStandardMaterial({ color: 0x1a1d2b, metalness: 0.8, roughness: 0.35 }));
    const part = (geo, mat, x, y, z) => { const m = new THREE.Mesh(gm(geo), mat); m.position.set(x, y, z); g.add(m); return m; };
    part(new THREE.BoxGeometry(3.4, 0.14, 2.2), metal, 0, 0, 0);
    part(new THREE.BoxGeometry(3.0, 0.02, 1.15), mm(new THREE.MeshStandardMaterial({ color: 0x0b0d16, roughness: 0.7 })), 0, 0.08, -0.3);
    part(new THREE.BoxGeometry(1.0, 0.015, 0.55), mm(new THREE.MeshStandardMaterial({ color: 0x232840, roughness: 0.5, metalness: 0.4 })), 0, 0.085, 0.66);
    for (let r = 0; r < 5; r++) {
      part(new THREE.BoxGeometry(2.7, 0.012, 0.09), mm(new THREE.MeshBasicMaterial({ color: pal[r % 3], transparent: true, opacity: 0.55 })), 0, 0.095, -0.72 + r * 0.2);
    }
    const floor = part(new THREE.CircleGeometry(3.2, 48), mm(new THREE.MeshBasicMaterial({ color: pal[0], transparent: true, opacity: 0.14 })), 0, -0.12, 0);
    floor.rotation.x = -Math.PI / 2;
    const lid = new THREE.Group();
    lid.position.set(0, 0.07, -1.05);
    lid.rotation.x = -0.2;
    g.add(lid);
    const lidGeo = gm(new THREE.BoxGeometry(3.4, 2.15, 0.1));
    lidGeo.translate(0, 1.075, 0);
    lid.add(new THREE.Mesh(lidGeo, metal));
    const cvs = document.createElement("canvas");
    cvs.width = 1024; cvs.height = 640;
    const tex = new THREE.CanvasTexture(cvs);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const scrGeo = gm(new THREE.PlaneGeometry(3.2, 2.0));
    scrGeo.translate(0, 1.075, 0);
    const scr = new THREE.Mesh(scrGeo, mm(new THREE.MeshBasicMaterial({ map: tex })));
    scr.position.z = 0.056;
    lid.add(scr);

    const render = () => renderer.render(scene, camera);
    let token = 0;
    const redraw = () => {
      const p = st.current.projects[st.current.idx];
      const id = ++token;
      drawScreen(cvs, p, colors, st.current.idx, n, () => id === token, () => { tex.needsUpdate = true; if (reduce) render(); });
      tex.needsUpdate = true;
      if (reduce) render();
    };
    st.current.redraw = redraw;
    redraw();

    let yaw = 0, drag = null, raf = 0, last = 0;
    const clock = new THREE.Clock();
    const interval = 1000 / (lite ? 30 : 45);
    const frame = (now = 0) => {
      raf = requestAnimationFrame(frame);
      if (now - last < interval) return;
      last = now;
      const t = clock.getElapsedTime();
      g.rotation.y = yaw + Math.sin(t * 0.45) * 0.55;
      g.position.y = -0.3 + Math.sin(t * 1.2) * 0.05;
      render();
    };
    g.position.y = -0.3;
    const start = () => { if (!raf && !reduce) raf = requestAnimationFrame(frame); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    if (reduce) { g.rotation.y = -0.3; render(); }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(el);
    const ro = new ResizeObserver(() => {
      w = el.clientWidth || w; h = el.clientHeight || h;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (reduce) render();
    });
    ro.observe(el);
    const dom = renderer.domElement;
    const down = (e) => { drag = { x: e.clientX, y: yaw }; };
    const move = (e) => { if (drag) { yaw = drag.y + (e.clientX - drag.x) * 0.008; if (reduce) { g.rotation.y = -0.3 + yaw; render(); } } };
    const up = () => { drag = null; };
    dom.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      stop(); io.disconnect(); ro.disconnect();
      dom.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      geos.forEach((x) => x.dispose()); mats.forEach((x) => x.dispose()); tex.dispose();
      renderer.dispose(); dom.remove();
      st.current.redraw = null;
    };
  }, [colors.join(), lite, n]);

  useEffect(() => {
    if (!n) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % n), 3500);
    return () => clearInterval(id);
  }, [n]);
  const cur = projects[currentIndex];
  if (!cur) return null;
  return (
    <div className="lap">
      <div ref={mount} className="lap3d" />
      <div className="lapdots">
        {projects.map((project, i) => <button key={project.id} aria-label={project.title} aria-pressed={i === currentIndex} onClick={() => setIdx(i)} />)}
      </div>
      <p className="lapcap">{cur.title}</p>
    </div>
  );
}

/* guestbook: visitors leave a message, you approve it first */
