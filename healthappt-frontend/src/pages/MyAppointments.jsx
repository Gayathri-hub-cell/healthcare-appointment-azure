import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../api';
import AuthGate from '../components/AuthGate';

const fmt = (d) => new Date(d).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function Inner() {
  const api = useApi();
  const [appts, setAppts] = useState(null);
  const [err, setErr] = useState(null);

  const load = () => { api('/appointments').then(setAppts).catch((e) => setErr(e.message)); };
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    setErr(null);
    try { await api(`/appointments/${id}/cancel`, { method: 'PUT' }); load(); } catch (e) { setErr(e.message); }
  };

  return (
    <>
      <div className="page-head"><h1>My appointments</h1><p>Your upcoming and past bookings.</p></div>
      {err && <div className="banner banner-err">{err}</div>}

      {appts === null ? <div className="loading"><span className="spinner" /> Loading…</div> :
        appts.length === 0 ? <div className="empty">You have no appointments yet. <Link to="/book">Book one →</Link></div> : (
          <div className="card">
            {appts.map((a) => (
              <div key={a.Id} className="appt">
                <div>
                  <div className="when">{fmt(a.StartsAt)}</div>
                  <div className="with">{a.Provider} · {a.Specialty}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>
                  <span className={`badge ${a.Status === 'Booked' ? 'badge-booked' : 'badge-cancelled'}`}>{a.Status}</span>
                  {a.Status === 'Booked' && <button className="btn btn-danger btn-sm" onClick={() => cancel(a.Id)}>Cancel</button>}
                </div>
              </div>
            ))}
          </div>
        )}
    </>
  );
}

export default function MyAppointments() { return <AuthGate><Inner /></AuthGate>; }
