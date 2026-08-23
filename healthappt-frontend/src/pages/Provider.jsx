import { useEffect, useState } from 'react';
import { useApi } from '../api';
import { useMe } from '../MeContext';
import AuthGate from '../components/AuthGate';

const fmt = (d) => new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function Inner() {
  const api = useApi();
  const { me } = useMe();
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState(null);

  const allowed = me && (me.Role === 'Provider' || me.Role === 'Admin');

  useEffect(() => {
    if (allowed) api('/appointments/provider/schedule').then(setRows).catch((e) => setErr(e.message));
  }, [allowed]);

  return (
    <>
      <div className="page-head"><h1>Provider schedule</h1><p>All booked appointments across providers.</p></div>

      {!allowed ? (
        <div className="empty">This view is for the <b>Provider</b> role. Your current role is <b>{me?.Role || '—'}</b>.</div>
      ) : err ? <div className="banner banner-err">{err}</div> :
        rows === null ? <div className="loading"><span className="spinner" /> Loading…</div> :
        rows.length === 0 ? <div className="empty">No appointments booked yet.</div> : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="table">
              <thead><tr><th>When</th><th>Provider</th><th>Patient</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.Id}>
                    <td>{fmt(r.StartsAt)}</td>
                    <td>{r.Provider}</td>
                    <td>{r.Patient}</td>
                    <td><span className={`badge ${r.Status === 'Booked' ? 'badge-booked' : 'badge-cancelled'}`}>{r.Status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </>
  );
}

export default function Provider() { return <AuthGate><Inner /></AuthGate>; }
