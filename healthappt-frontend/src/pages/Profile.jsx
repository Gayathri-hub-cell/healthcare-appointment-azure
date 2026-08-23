import { useMe } from '../MeContext';
import AuthGate from '../components/AuthGate';

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '.7rem 0', borderTop: '1px solid var(--line)' }}>
      <span className="muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Inner() {
  const { me } = useMe();
  if (!me) return <div className="loading"><span className="spinner" /> Loading…</div>;
  const init = (me.DisplayName || '?').split(' ').map((w) => w[0]).slice(0, 2).join('');

  return (
    <>
      <div className="page-head"><h1>Your profile</h1><p>Account details from Microsoft Entra ID.</p></div>
      <div className="card" style={{ padding: '1.6rem', maxWidth: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div className="avatar" style={{ width: 60, height: 60, fontSize: '1.3rem' }}>{init}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{me.DisplayName}</div>
            <div className="muted">{me.Email}</div>
          </div>
        </div>
        <Row label="Role" value={<span className="badge badge-role">{me.Role}</span>} />
        <Row label="Email" value={me.Email || '—'} />
      </div>
    </>
  );
}

export default function Profile() { return <AuthGate><Inner /></AuthGate>; }
