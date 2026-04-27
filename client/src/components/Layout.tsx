import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/',              label: 'Dashboard',         icon: '▦',  end: true },
  { to: '/competitions',  label: 'Competitions',      icon: '🏆' },
  { to: '/notifications', label: 'Send Notification', icon: '📣' },
  { to: '/schools',       label: 'Schools',           icon: '🏫' },
  { to: '/users',         label: 'Users',             icon: '👥' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 216, flexShrink: 0,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* logo */}
        <div style={{ padding: '22px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <div style={{ fontFamily: 'var(--ff-display)', fontSize: 14, lineHeight: 1.2 }}>Beyond Classroom</div>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 11px', borderRadius: 8,
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
              transition: 'all var(--ease)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              color: isActive ? 'var(--accent-hover)' : 'var(--text-2)',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            })}>
              <span style={{ fontSize: 14 }}>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* user */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{user?.full_name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--ff-mono)', marginBottom: 10 }}>{user?.email}</div>
          <button className="btn btn-ghost" onClick={() => { logout(); navigate('/login'); }}
            style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '6px' }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}
