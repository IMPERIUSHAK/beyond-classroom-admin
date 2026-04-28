import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { schoolsApi, competitionsApi, usersApi, notificationsApi } from '../api';
import type { School, Competition, User } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Shared tiny components
// ─────────────────────────────────────────────────────────────────────────────

function PageHeader({ sub, title, count }: { sub: string; title: string; count?: number }) {
  return (
    <div className="fu" style={{ marginBottom: 28 }}>
      <p style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>{sub}</p>
      <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 32, fontWeight: 400 }}>{title}</h1>
      {count !== undefined && <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 4 }}>{count} records</p>}
    </div>
  );
}

function Spinner() { return <span className="spin" />; }
function Toast({ ok, msg }: { ok: boolean; msg: string }) {
  return <div className={`toast fi ${ok ? 'toast-ok' : 'toast-err'}`} style={{ marginBottom: 16 }}>{ok ? '✓' : '⚠'} {msg}</div>;
}

function Pager({ page, total, limit, onChange }: { page: number; total: number; limit: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
      <button className="btn btn-ghost" onClick={() => onChange(page - 1)} disabled={page === 1} style={{ padding: '5px 11px' }}>←</button>
      <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--text-3)' }}>{page} / {pages}</span>
      <button className="btn btn-ghost" onClick={() => onChange(page + 1)} disabled={page >= pages} style={{ padding: '5px 11px' }}>→</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────
export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('admin@eduversal.com');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'radial-gradient(ellipse at 60% 20%,rgba(99,102,241,.07) 0%,transparent 60%),var(--bg)' }}>
      <div className="fu" style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: 'linear-gradient(135deg,var(--accent),#818cf8)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 18, boxShadow: '0 0 28px var(--accent-dim)' }}>✦</div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 26, fontWeight: 400, marginBottom: 4 }}>Beyond Classroom</h1>
          <p style={{ color: 'var(--text-3)', fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>Admin Portal</p>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus /></div>
            <div><label className="label">Password</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required /></div>
            {error && <div className="toast toast-err fi">⚠ {error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: '11px', marginTop: 4, fontSize: 14 }}>
              {loading ? <Spinner /> : '→'}&nbsp;Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/notifications', icon: '📣', label: 'Send Notification', desc: 'Announce competitions to schools' },
    { to: '/competitions',  icon: '🏆', label: 'Competitions',      desc: 'Create and manage competitions' },
    { to: '/schools',       icon: '🏫', label: 'Schools',           desc: 'View and add schools' },
    { to: '/users',         icon: '👥', label: 'Users',             desc: 'Browse registered users' },
  ];
  return (
    <div style={{ padding: '36px 40px', maxWidth: 860 }}>
      <div className="fu" style={{ marginBottom: 40 }}>
        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Welcome back</p>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 38, fontWeight: 400 }}>{user?.full_name || 'Admin'} <span style={{ color: 'var(--accent)' }}>✦</span></h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {links.map(l => (
          <div key={l.to} className="card" onClick={() => navigate(l.to)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px', transition: 'all var(--ease)' }}
            onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'var(--border-light)'; d.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'var(--border)';       d.style.transform = 'none'; }}>
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

// ─────────────────────────────────────────────────────────────────────────────
// SCHOOLS
// ─────────────────────────────────────────────────────────────────────────────
export function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg]         = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ npsn: '', name: '', city: '', province: '', address: '' });
  const LIMIT = 20;

  const load = async () => {
    setLoading(true);
    try {
      const r = await schoolsApi.list({ page, limit: LIMIT, search: search || undefined });
      setSchools(r.schools); setTotal(r.pagination.total);
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [page, search]);

  const save = async () => {
    if (!form.npsn || !form.name) return;
    setSaving(true);
    try {
      await schoolsApi.create(form);
      setMsg({ ok: true, text: 'School added!' });
      setShowAdd(false); setForm({ npsn: '', name: '', city: '', province: '', address: '' });
      load();
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1060 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <PageHeader sub="Management" title="Schools" count={total} />
        <button className="btn btn-primary" onClick={() => setShowAdd(v => !v)} style={{ marginBottom: 28 }}>{showAdd ? '✕ Cancel' : '+ Add School'}</button>
      </div>

      {msg && <Toast ok={msg.ok} msg={msg.text} />}

      {showAdd && (
        <div className="card fu" style={{ marginBottom: 20 }}>
          <p className="label" style={{ marginBottom: 18 }}>New School</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, marginBottom: 14 }}>
            <div><label className="label">NPSN *</label><input className="input" value={form.npsn} onChange={e => setForm(f => ({ ...f, npsn: e.target.value }))} placeholder="12345678" /></div>
            <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="SDN 001 Jakarta" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div><label className="label">City</label><input className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Jakarta" /></div>
            <div><label className="label">Province</label><input className="input" value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} placeholder="DKI Jakarta" /></div>
          </div>
          <div style={{ marginBottom: 18 }}><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Jl. Sudirman No. 1" /></div>
          <button className="btn btn-primary" onClick={save} disabled={saving || !form.npsn || !form.name}>{saving ? <Spinner /> : '+'} Save</button>
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); setSearch(searchVal); setPage(1); }} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input className="input" style={{ maxWidth: 320 }} placeholder="Search name, city, NPSN…" value={searchVal} onChange={e => setSearchVal(e.target.value)} />
        <button className="btn btn-ghost" type="submit">Search</button>
        {search && <button className="btn btn-ghost" type="button" onClick={() => { setSearch(''); setSearchVal(''); setPage(1); }}>Clear</button>}
      </form>

      <div className="card fu" style={{ padding: 0, overflow: 'hidden', animationDelay: '.05s' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div style={{ padding: 48, textAlign: 'center' }}><Spinner /></div>
            : schools.length === 0 ? <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--ff-mono)', fontSize: 12 }}>No schools found</div>
            : <table>
                <thead><tr><th>NPSN</th><th>Name</th><th>City</th><th>Province</th><th>Added</th></tr></thead>
                <tbody>
                  {schools.map(s => (
                    <tr key={s.id}>
                      <td><span style={{ fontFamily: 'var(--ff-mono)', fontSize: 12 }}>{s.npsn}</span></td>
                      <td style={{ color: 'var(--text-1)', fontWeight: 500 }}>{s.name}</td>
                      <td>{s.city || '—'}</td>
                      <td>{s.province || '—'}</td>
                      <td style={{ fontFamily: 'var(--ff-mono)', fontSize: 11 }}>{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>}
        </div>
        <Pager page={page} total={total} limit={LIMIT} onChange={setPage} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPETITIONS
// ─────────────────────────────────────────────────────────────────────────────
const CATS = ['', 'Science', 'Math', 'Art', 'Sports', 'Technology', 'Literature', 'Music'];

const EMPTY_FORM = { name: '', organizer_name: '', category: '', grade_level: '', fee: '0', description: '', reg_open_date: '', reg_close_date: '', competition_date: '' };

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="label">{label}</label>{children}</div>;
}

function fmtForInput(d?: string) {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
}

export function Competitions() {
  const [comps, setComps]     = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [cat, setCat]         = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId]   = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try {
      const r = await competitionsApi.list({ page, limit: LIMIT, category: cat || undefined });
      setComps(r.competitions); setTotal(r.pagination.total);
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [page, cat]);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowAdd(true);
  };

  const openEdit = (c: Competition) => {
    setEditId(c.id);
    setForm({
      name:             c.name,
      organizer_name:   c.organizer_name,
      category:         c.category    || '',
      grade_level:      c.grade_level || '',
      fee:              String(c.fee  ?? 0),
      description:      c.description || '',
      reg_open_date:    fmtForInput(c.reg_open_date),
      reg_close_date:   fmtForInput(c.reg_close_date),
      competition_date: fmtForInput(c.competition_date),
    });
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => { setShowAdd(false); setEditId(null); setForm(EMPTY_FORM); };

  const save = async () => {
    if (!form.name || !form.organizer_name) return;
    setSaving(true);
    try {
      if (editId) {
        await competitionsApi.update(editId, { ...form, fee: parseInt(form.fee) || 0 });
        setMsg({ ok: true, text: 'Competition updated!' });
      } else {
        await competitionsApi.create({ ...form, fee: parseInt(form.fee) || 0 });
        setMsg({ ok: true, text: 'Competition created!' });
      }
      closeForm();
      load();
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
    finally { setSaving(false); }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await competitionsApi.delete(id); load(); }
    catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
  };

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1060 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <PageHeader sub="Management" title="Competitions" count={total} />
        <button className="btn btn-primary" onClick={showAdd ? closeForm : openAdd} style={{ marginBottom: 28 }}>
          {showAdd ? '✕ Cancel' : '+ New'}
        </button>
      </div>

      {msg && <Toast ok={msg.ok} msg={msg.text} />}

      {/* ── Add / Edit form ── */}
      {showAdd && (
        <div className="card fu" style={{ marginBottom: 20, borderColor: editId ? 'rgba(99,102,241,.35)' : 'var(--border)' }}>
          <p className="label" style={{ marginBottom: 18 }}>
            {editId ? '✎ Edit Competition' : 'New Competition'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
            <F label="Name *"><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Olimpiade Matematika Nasional" /></F>
            <F label="Category">
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATS.map(c => <option key={c} value={c}>{c || 'Select…'}</option>)}
              </select>
            </F>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <F label="Organizer *"><input className="input" value={form.organizer_name} onChange={e => setForm(f => ({ ...f, organizer_name: e.target.value }))} placeholder="Kemendikbud" /></F>
            <F label="Grade Level"><input className="input" value={form.grade_level} onChange={e => setForm(f => ({ ...f, grade_level: e.target.value }))} placeholder="SMP, SMA" /></F>
            <F label="Fee (IDR)"><input className="input" type="number" value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} /></F>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <F label="Reg Open"><input className="input" type="date" value={form.reg_open_date} onChange={e => setForm(f => ({ ...f, reg_open_date: e.target.value }))} /></F>
            <F label="Reg Close"><input className="input" type="date" value={form.reg_close_date} onChange={e => setForm(f => ({ ...f, reg_close_date: e.target.value }))} /></F>
            <F label="Event Date"><input className="input" type="date" value={form.competition_date} onChange={e => setForm(f => ({ ...f, competition_date: e.target.value }))} /></F>
          </div>
          <div style={{ marginBottom: 18 }}>
            <F label="Description"><textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the competition…" /></F>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={save} disabled={saving || !form.name || !form.organizer_name}>
              {saving ? <Spinner /> : editId ? '✓' : '+'} {editId ? 'Save Changes' : 'Create'}
            </button>
            <button className="btn btn-ghost" onClick={closeForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* category filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {CATS.map(c => (
          <button key={c} className={`btn ${cat === c ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setCat(c); setPage(1); }} style={{ padding: '5px 13px', fontSize: 12 }}>
            {c || 'All'}
          </button>
        ))}
      </div>

      <div className="card fu" style={{ padding: 0, overflow: 'hidden', animationDelay: '.05s' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div style={{ padding: 48, textAlign: 'center' }}><Spinner /></div>
            : comps.length === 0 ? <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--ff-mono)', fontSize: 12 }}>No competitions</div>
            : <table>
                <thead><tr><th>Name</th><th>Category</th><th>Organizer</th><th>Fee</th><th>Close</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {comps.map(c => (
                    <tr key={c.id} style={{ background: editId === c.id ? 'rgba(99,102,241,.05)' : undefined }}>
                      <td style={{ color: 'var(--text-1)', fontWeight: 500, maxWidth: 240 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                        {c.grade_level && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{c.grade_level}</div>}
                      </td>
                      <td>{c.category ? <span className="badge badge-indigo">{c.category}</span> : '—'}</td>
                      <td style={{ fontSize: 12 }}>{c.organizer_name}</td>
                      <td>{c.fee === 0 ? <span className="badge badge-green">Free</span> : `Rp ${c.fee.toLocaleString('id-ID')}`}</td>
                      <td style={{ fontFamily: 'var(--ff-mono)', fontSize: 11 }}>{fmtDate(c.reg_close_date)}</td>
                      <td style={{ fontFamily: 'var(--ff-mono)', fontSize: 11 }}>{fmtDate(c.competition_date)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost" onClick={() => openEdit(c)} style={{ padding: '4px 10px', fontSize: 11 }}>Edit</button>
                          <button className="btn btn-danger" onClick={() => remove(c.id, c.name)} style={{ padding: '4px 10px', fontSize: 11 }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>}
        </div>
        <Pager page={page} total={total} limit={LIMIT} onChange={setPage} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────
const ROLES = ['', 'student', 'parent', 'teacher', 'school_admin', 'admin'];
const ROLE_CLS: Record<string, string> = { admin: 'badge-red', school_admin: 'badge-indigo', teacher: 'badge-yellow', student: 'badge-green', parent: 'badge-gray' };

export function Users() {
  const [users, setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [role, setRole]     = useState('');
  const [search, setSearch] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [msg, setMsg]       = useState<{ ok: boolean; text: string } | null>(null);
  const LIMIT = 25;

  const load = async () => {
    setLoading(true);
    try {
      const r = await usersApi.list({ page, limit: LIMIT, role: role || undefined, search: search || undefined });
      setUsers(r.users); setTotal(r.pagination.total);
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [page, role, search]);

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1060 }}>
      <PageHeader sub="Management" title="Users" count={total} />
      {msg && <Toast ok={msg.ok} msg={msg.text} />}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <form onSubmit={e => { e.preventDefault(); setSearch(searchVal); setPage(1); }} style={{ display: 'flex', gap: 8 }}>
          <input className="input" style={{ width: 260 }} placeholder="Name or email…" value={searchVal} onChange={e => setSearchVal(e.target.value)} />
          <button className="btn btn-ghost" type="submit">Search</button>
          {search && <button className="btn btn-ghost" type="button" onClick={() => { setSearch(''); setSearchVal(''); setPage(1); }}>Clear</button>}
        </form>
        <div style={{ display: 'flex', gap: 5 }}>
          {ROLES.map(r => (
            <button key={r} className={`btn ${role === r ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setRole(r); setPage(1); }} style={{ padding: '5px 12px', fontSize: 12 }}>
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card fu" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? <div style={{ padding: 48, textAlign: 'center' }}><Spinner /></div>
            : users.length === 0 ? <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--ff-mono)', fontSize: 12 }}>No users found</div>
            : <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>City</th><th>Joined</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--text-1)', fontWeight: 500 }}>{u.full_name || '—'}</td>
                      <td style={{ fontFamily: 'var(--ff-mono)', fontSize: 12 }}>{u.email}</td>
                      <td><span className={`badge ${ROLE_CLS[u.role] ?? 'badge-gray'}`}>{u.role}</span></td>
                      <td>{u.city || '—'}</td>
                      <td style={{ fontFamily: 'var(--ff-mono)', fontSize: 11 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>}
        </div>
        <Pager page={page} total={total} limit={LIMIT} onChange={setPage} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────
export function SendNotification() {
  const [allSchools, setAllSchools]   = useState<School[]>([]);
  const [allComps, setAllComps]       = useState<Competition[]>([]);
  const [provinces, setProvinces]     = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [province, setProvince]   = useState('');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [compId, setCompId]       = useState('');
  const [title, setTitle]         = useState('');
  const [body, setBody]           = useState('');
  const [type, setType]           = useState('competition_announcement');
  const [scheduled, setScheduled] = useState('');

  const [sending, setSending]   = useState(false);
  const [msg, setMsg]           = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      schoolsApi.list({ limit: 500 }),
      competitionsApi.list({ limit: 200 }),
      schoolsApi.provinces(),
    ]).then(([s, c, p]) => {
      setAllSchools(s.schools);
      setAllComps(c.competitions);
      setProvinces(p);
    }).finally(() => setLoadingData(false));
  }, []);

  // Auto-fill when competition selected
  useEffect(() => {
    if (!compId) return;
    const c = allComps.find(x => x.id === compId);
    if (!c) return;
    setTitle(`📢 ${c.name}`);
    const close = c.reg_close_date
      ? ` Registration closes ${new Date(c.reg_close_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.`
      : '';
    setBody(`${c.organizer_name} is opening registration for ${c.name}.${close} Category: ${c.category || 'General'}.`);
  }, [compId]);

  const visible = allSchools.filter(s => {
    const matchProvince = !province || s.province === province;
    const matchSearch   = !schoolSearch || s.name.toLowerCase().includes(schoolSearch.toLowerCase()) || (s.city ?? '').toLowerCase().includes(schoolSearch.toLowerCase());
    return matchProvince && matchSearch;
  });

  const toggle = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selectAll  = () => setSelected(new Set(visible.map(s => s.id)));
  const clearAll   = () => setSelected(new Set());

  const send = async () => {
    if (!title || !body || selected.size === 0) return;
    setSending(true); setMsg(null);
    try {
      const r = await notificationsApi.send({ title, body, type, school_ids: [...selected], competition_id: compId || undefined, scheduled_for: scheduled || undefined });
      setMsg({ ok: true, text: r.message });
      setSelected(new Set()); setCompId(''); setTitle(''); setBody(''); setScheduled('');
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
    finally { setSending(false); }
  };

  if (loadingData) return <div style={{ padding: 40, display: 'flex', gap: 12, alignItems: 'center' }}><Spinner /><span style={{ color: 'var(--text-3)' }}>Loading…</span></div>;

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1060 }}>
      <PageHeader sub="Broadcast" title="Send Notification" />
      {msg && <Toast ok={msg.ok} msg={msg.text} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>
        {/* ── School selector ── */}
        <div className="card fu">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span className="label" style={{ margin: 0 }}>Target Schools</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {selected.size > 0 && <span className="badge badge-indigo">{selected.size} selected</span>}
              <button className="btn btn-ghost" onClick={selectAll}  style={{ padding: '4px 10px', fontSize: 11 }}>All</button>
              <button className="btn btn-ghost" onClick={clearAll}   style={{ padding: '4px 10px', fontSize: 11 }}>Clear</button>
            </div>
          </div>

          {/* filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input className="input" placeholder="Search…" value={schoolSearch} onChange={e => setSchoolSearch(e.target.value)} style={{ flex: 1 }} />
            <select className="input" value={province} onChange={e => setProvince(e.target.value)} style={{ width: 170 }}>
              <option value="">All provinces</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* list */}
          <div style={{ maxHeight: 440, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {visible.length === 0
              ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--ff-mono)', fontSize: 12 }}>No schools match</div>
              : visible.map(s => {
                  const on = selected.has(s.id);
                  return (
                    <div key={s.id} onClick={() => toggle(s.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                      background: on ? 'var(--accent-dim)' : 'transparent',
                      border: `1px solid ${on ? 'rgba(99,102,241,.3)' : 'transparent'}`,
                      transition: 'all var(--ease)',
                    }}>
                      <div style={{
                        width: 17, height: 17, borderRadius: 4, flexShrink: 0,
                        background: on ? 'var(--accent)' : 'var(--bg-elevated)',
                        border: `1.5px solid ${on ? 'var(--accent)' : 'var(--border-light)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: '#fff', transition: 'all var(--ease)',
                      }}>{on && '✓'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: on ? 'var(--text-1)' : 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--ff-mono)' }}>{[s.city, s.province].filter(Boolean).join(', ') || s.npsn}</div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* ── Composer ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card fu" style={{ animationDelay: '.06s' }}>
            <span className="label" style={{ display: 'block', marginBottom: 18 }}>Message</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div>
                <label className="label">Competition (optional)</label>
                <select className="input" value={compId} onChange={e => setCompId(e.target.value)}>
                  <option value="">— choose —</option>
                  {allComps.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={type} onChange={e => setType(e.target.value)}>
                  <option value="competition_announcement">Competition Announcement</option>
                  <option value="deadline_reminder">Deadline Reminder</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div><label className="label">Title *</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title" /></div>
              <div><label className="label">Message *</label><textarea className="input" value={body} onChange={e => setBody(e.target.value)} placeholder="Message body…" /></div>
              <div><label className="label">Schedule (optional)</label><input className="input" type="datetime-local" value={scheduled} onChange={e => setScheduled(e.target.value)} /></div>
            </div>
          </div>

          {/* preview */}
          {(title || body) && (
            <div className="card fi" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', padding: 16 }}>
              <span className="label" style={{ display: 'block', marginBottom: 10 }}>Preview</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,var(--accent),#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>✦</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{title || 'Title…'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{body || 'Message…'}</div>
                </div>
              </div>
            </div>
          )}

          <button className="btn btn-primary" onClick={send} disabled={sending || !title || !body || selected.size === 0}
            style={{ justifyContent: 'center', padding: '13px', fontSize: 14 }}>
            {sending ? <><Spinner />&nbsp;Sending…</> : `📣 Send to ${selected.size} school${selected.size !== 1 ? 's' : ''}`}
          </button>
          {selected.size === 0 && (
            <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', fontFamily: 'var(--ff-mono)' }}>Select at least one school</p>
          )}
        </div>
      </div>
    </div>
  );
}