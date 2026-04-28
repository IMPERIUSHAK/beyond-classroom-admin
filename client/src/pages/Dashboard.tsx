import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/notifications', icon: '📣', label: 'Send Notification', desc: 'Announce competitions to schools' },
  { to: '/competitions',  icon: '🏆', label: 'Competitions',      desc: 'Create and manage competitions' },
  { to: '/schools',       icon: '🏫', label: 'Schools',           desc: 'View and add schools' },
  { to: '/users',         icon: '👥', label: 'Users',             desc: 'Browse registered users' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '36px 40px', maxWidth: 860 }}>
      <div className="fu" style={{ marginBottom: 40 }}>
        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Welcome back</p>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 38, fontWeight: 400 }}>
          {user?.full_name || 'Admin'}        
        </h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {LINKS.map(l => (
          <div
            key={l.to}
            className="card"
            onClick={() => navigate(l.to)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px', transition: 'all var(--ease)' }}
            onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'var(--border-light)'; d.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'var(--border)'; d.style.transform = 'none'; }}
          >
            <span style={{ fontSize: 26 }}>{l.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{l.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{l.desc}</div>
            </div>
            <span style={{ color: 'var(--text-3)' }}>→</span>
          </div>
        ))}
      </div>
    </div>
  );
}