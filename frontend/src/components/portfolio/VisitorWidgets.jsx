import { useEffect, useRef, useState } from "react";
import { CHAT_ENDPOINT, GUESTBOOK_ENDPOINT } from "../../models/siteContent.js";
import { Reveal } from "./SharedComponents.jsx";

function localAnswer(q, T, profile, projects) {
  const s = q.toLowerCase();
  if (/skill|tech|stack|ជំនាញ/.test(s)) return Object.entries(profile.skills).map(([g, l]) => `${T.g[g]}: ${l.join(", ")}`).join("\n");
  if (/project|work|portfolio|built|គម្រោង/.test(s)) return projects.map((p, i) => `${i + 1}. ${p.title}`).join("\n");
  if (/hire|contact|email|phone|reach|ទំនាក់|ជួល|អ៊ីមែល/.test(s)) return `${profile.email}\n${profile.phone}`;
  return T.summary;
}

export function Guestbook({ t, lang }) {
  const [list, setList] = useState(null);
  const [form, setForm] = useState({ name: "", message: "", website: "" });
  const [state, setState] = useState({ type: "", text: "" });
  const [sending, setSending] = useState(false);
  const [listError, setListError] = useState("");
  useEffect(() => {
    let off = false;
    fetch(GUESTBOOK_ENDPOINT)
      .then((r) => {
        if (!r.ok) throw new Error(`Guestbook request failed (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (!Array.isArray(d)) throw new Error("The guestbook response was not a list.");
        if (!off) {
          setList(d);
          setListError("");
        }
      })
      .catch((error) => {
        if (!off) setListError(error.message);
      });
    return () => { off = true; };
  }, []);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setState({ type: "", text: "" });
    try {
      const res = await fetch(GUESTBOOK_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setState({ type: "ok", text: t.gb.ok });
      setForm({ name: "", message: "", website: "" });
    } catch {
      setState({ type: "err", text: t.gb.err });
    } finally {
      setSending(false);
    }
  };
  const fmt = (s) => {
    const d = new Date(String(s).replace(" ", "T"));
    return isNaN(d) ? "" : d.toLocaleDateString(lang === "km" ? "km-KH" : "en-GB");
  };
  return (
    <div className="gb">
      <Reveal>
        <form onSubmit={submit}>
          <label>{t.gb.name}<input name="name" value={form.name} onChange={change} required maxLength={60} /></label>
          <label>{t.gb.msg}<textarea name="message" value={form.message} onChange={change} required maxLength={500} /></label>
          <input className="hp" name="website" value={form.website} onChange={change} tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div><button className="btn" type="submit" disabled={sending}>{sending ? t.gb.sending : t.gb.send}</button></div>
          <p className={`status ${state.type}`} role="status" aria-live="polite">{state.text}</p>
        </form>
      </Reveal>
      <Reveal delay={0.12}>
        <div className="gblist">
          {listError && <p className="status err" role="alert">{listError}</p>}
          {list && list.length === 0 && !listError && <p style={{ color: "var(--muted)" }}>{t.gb.empty}</p>}
          {(list || []).map((m, i) => (
            <div className="gbitem" key={i}>
              <b>{m.name}</b><small>{fmt(m.created_at)}</small>
              <p>{m.message}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

/* "Ask SakHak" chat window */
export function Chat({ open, onClose, t, lang, profile, projects }) {
  const [msgs, setMsgs] = useState([]);
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const box = useRef(null), inp = useRef(null);
  useEffect(() => { if (open) inp.current?.focus(); }, [open]);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [msgs, busy, open]);
  if (!open) return null;
  const send = async (raw) => {
    const q = raw.trim().slice(0, 500);
    if (!q || busy) return;
    const next = [...msgs, { role: "user", content: q }];
    setMsgs(next); setVal(""); setBusy(true);
    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-8).map(({ role, content }) => ({ role, content })), lang }),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      if (!d.reply) throw new Error();
      setMsgs([...next, { role: "assistant", content: d.reply }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: `${localAnswer(q, t, profile, projects)}\n\n${t.chat.offline}` }]);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="chat" role="dialog" aria-label={t.chat.title}>
      <header><span>{t.chat.title}</span><button onClick={onClose} aria-label="Close">✕</button></header>
      <div className="msgs" ref={box}>
        <div className="cm bot">{t.chat.hello}</div>
        {msgs.length === 0 && (
          <div className="sugg">{t.chat.s.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}</div>
        )}
        {msgs.map((m, i) => <div key={i} className={`cm ${m.role === "user" ? "user" : "bot"}`}>{m.content}</div>)}
        {busy && <div className="cm bot">{t.chat.thinking}</div>}
      </div>
      <div className="row">
        <input ref={inp} value={val} onChange={(e) => setVal(e.target.value)} placeholder={t.chat.ph} maxLength={500}
          onKeyDown={(e) => { if (e.key === "Enter") send(val); if (e.key === "Escape") onClose(); }} aria-label={t.chat.ph} />
        <button className="btn" onClick={() => send(val)} disabled={busy}>{t.chat.send}</button>
      </div>
    </div>
  );
}
