import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../api';
import AuthGate from '../components/AuthGate';

const fmt = (d) => new Date(d).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const initials = (n) => n.replace(/^Dr\.?\s*/i, '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const Loading = () => <div className="loading"><span className="spinner" /> Loading…</div>;

function Inner() {
  const api = useApi();
  const [providers, setProviders] = useState(null);
  const [sel, setSel] = useState(null);
  const [slots, setSlots] = useState(null);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api('/providers').then(setProviders).catch((e) => setErr(e.message)); }, []);

  const chooseProvider = async (p) => {
    setSel(p); setSlots(null); setErr(null); setMsg(null);
    try { setSlots(await api(`/providers/${p.Id}/slots`)); } catch (e) { setErr(e.message); }
  };

  const book = async (slot) => {
    setBusy(true); setErr(null);
    try {
      await api('/appointments', { method: 'POST', body: JSON.stringify({ slotId: slot.Id }) });
      setMsg(`Booked ${sel.Name} for ${fmt(slot.StartsAt)}.`);
      setSlots(await api(`/providers/${sel.Id}/slots`));
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const step = sel ? 2 : 1;

  return (
    <>
      <div className="page-head"><h1>Book an appointment</h1><p>Choose a provider, then pick an available time.</p></div>

      <div className="steps">
        <div className={`step ${step === 1 ? 'active' : ''}`}><span className="num">1</span> Choose provider</div>
        <span className="arrow">→</span>
        <div className={`step ${step === 2 ? 'active' : ''}`}><span className="num">2</span> Pick a time</div>
      </div>

      {msg && <div className="banner banner-ok">{msg} <Link to="/appointments">View my appointments →</Link></div>}
      {err && <div className="banner banner-err">{err}</div>}

      {step === 1 && (
        providers === null ? <Loading /> : (
          <div className="grid grid-3">
            {providers.map((p) => (
              <div key={p.Id} className="card provider-card">
                <div className="avatar">{initials(p.Name)}</div>
                <div className="name">{p.Name}</div>
                <div className="meta">{p.Specialty}{p.Clinic ? ` · ${p.Clinic}` : ''}</div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: '.4rem' }} onClick={() => chooseProvider(p)}>View times</button>
              </div>
            ))}
          </div>
        )
      )}

      {step === 2 && (
        <div className="card" style={{ padding: '1.2rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { setSel(null); setSlots(null); }}>← Back to providers</button>
          <h3 style={{ marginTop: '1rem' }}>{sel.Name} <span className="muted" style={{ fontWeight: 400 }}>· {sel.Specialty}</span></h3>
          {slots === null ? <Loading /> :
            slots.length === 0 ? <div className="empty">No open time slots for this provider right now.</div> : (
              <div className="slot-list" style={{ marginTop: '.8rem' }}>
                {slots.map((sl) => (
                  <div key={sl.Id} className="slot">
                    <span>{fmt(sl.StartsAt)}</span>
                    <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => book(sl)}>Book</button>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}
    </>
  );
}

export default function Book() { return <AuthGate><Inner /></AuthGate>; }
