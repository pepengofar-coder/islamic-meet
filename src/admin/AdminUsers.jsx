import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, Eye, CheckCircle, XCircle,
  X, User, BookOpen, Heart,
  MapPin, Briefcase, GraduationCap, Droplets, Star,
  Mail, Calendar, RefreshCw, Shield, Crown,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminGetProfiles, adminVerifyUser, adminSuspendUser, adminSetMembership, adminUpdateUserStatus, resolveStatus } from '../lib/adminDB';
import { getTier } from '../lib/membership';
import '../admin/admin.css';

const avatarGradients = [
  'linear-gradient(135deg, #9B89CC, #7E6BAF)',
  'linear-gradient(135deg, #63A8D8, #4A8EBF)',
  'linear-gradient(135deg, #5EC994, #3DB878)',
  'linear-gradient(135deg, #F5A623, #E08B00)',
  'linear-gradient(135deg, #E07070, #C05050)',
  'linear-gradient(135deg, #B8A6F0, #93C3E8)',
];

function initials(name = '?') {
  return (name || '?').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export default function AdminUsers() {
  const [allUsers, setAllUsers]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortBy, setSortBy]             = useState('joinDate');
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetProfiles();
      setAllUsers(data);
    } catch (err) {
      setError('Gagal memuat data pengguna.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filtered = allUsers
    .filter(u => {
      const st = resolveStatus(u);
      if (search && !((u.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
          (u.city || '').toLowerCase().includes(search.toLowerCase()))) return false;
      if (filterStatus !== 'all' && st !== filterStatus) return false;
      if (filterGender !== 'all' && u.gender !== filterGender) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'joinDate') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  const statusCounts = {
    all:        allUsers.length,
    active:     allUsers.filter(u => resolveStatus(u) === 'active').length,
    pending:    allUsers.filter(u => resolveStatus(u) === 'pending').length,
    unverified: allUsers.filter(u => resolveStatus(u) === 'unverified').length,
  };

  const handleVerify = async (userId) => {
    setActionLoading(true);
    try {
      await adminVerifyUser(userId);
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: true } : u));
      if (selectedUser?.id === userId) setSelectedUser(prev => ({ ...prev, verified: true }));
    } catch { alert('Gagal memverifikasi user.'); }
    setActionLoading(false);
  };

  const handleSuspend = async (userId, suspend) => {
    setActionLoading(true);
    try {
      await adminSuspendUser(userId, suspend);
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, suspended: suspend } : u));
      if (selectedUser?.id === userId) setSelectedUser(prev => ({ ...prev, suspended: suspend }));
    } catch { alert('Gagal mengubah status suspend.'); }
    setActionLoading(false);
  };

  const handleSetMembership = async (userId, tier) => {
    setActionLoading(true);
    try {
      await adminSetMembership(userId, tier, 1);
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, membership_tier: tier } : u));
      if (selectedUser?.id === userId) setSelectedUser(prev => ({ ...prev, membership_tier: tier }));
    } catch { alert('Gagal mengubah tier keanggotaan.'); }
    setActionLoading(false);
  };

  const handleStatusChange = async (userId, newStatus) => {
    setActionLoading(true);
    try {
      let updates = {};
      switch (newStatus) {
        case 'active':     updates = { verified: true, cv_done: true, suspended: false }; break;
        case 'pending':    updates = { verified: true, cv_done: false, suspended: false }; break;
        case 'unverified': updates = { verified: false, cv_done: false, suspended: false }; break;
        case 'suspended':  updates = { suspended: true }; break;
        default: return;
      }
      await adminUpdateUserStatus(userId, updates);
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      if (selectedUser?.id === userId) setSelectedUser(prev => ({ ...prev, ...updates }));
    } catch {
      alert('Gagal mengubah status user.');
    }
    setActionLoading(false);
  };


  return (
    <AdminLayout title="Manajemen Pendaftar">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Refresh */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={loadUsers} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'all',        label: 'Semua',        color: '#9B89CC' },
          { key: 'active',     label: '● Aktif',      color: '#5EC994' },
          { key: 'pending',    label: '◌ Pending',    color: '#F5A623' },
          { key: 'unverified', label: '○ Belum Verif',color: '#E07070' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            style={{
              padding: '8px 16px', borderRadius: 10,
              border: `2px solid ${filterStatus === tab.key ? tab.color : '#E8E3FF'}`,
              background: filterStatus === tab.key ? `${tab.color}15` : 'white',
              color: filterStatus === tab.key ? tab.color : '#5E5A7A',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif",
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
            <span style={{ background: filterStatus === tab.key ? tab.color : '#F0EEF8', color: filterStatus === tab.key ? 'white' : '#8B87A8', borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>
              {statusCounts[tab.key]}
            </span>
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['all', 'ikhwan', 'akhwat'].map(g => (
            <button key={g} onClick={() => setFilterGender(g)} style={{
              padding: '8px 14px', borderRadius: 10, border: `2px solid ${filterGender === g ? '#9B89CC' : '#E8E3FF'}`,
              background: filterGender === g ? '#EAE3FF' : 'white',
              color: filterGender === g ? '#5E4B99' : '#5E5A7A', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s',
            }}>
              {g === 'all' ? 'Semua Gender' : g === 'ikhwan' ? '🧔 Ikhwan' : '🧕 Akhwat'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        {/* Search bar */}
        <div className="admin-search-bar">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9B89CC', pointerEvents: 'none' }} />
            <input
              className="admin-search-input"
              placeholder="Cari nama, email, atau kota..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '9px 14px', border: '2px solid #E8E3FF', borderRadius: 10, fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: '#5E5A7A', background: 'white', cursor: 'pointer', outline: 'none' }}
          >
            <option value="joinDate">Terbaru Daftar</option>
            <option value="name">Nama A-Z</option>
          </select>

          <span style={{ fontSize: 12, color: '#9896B0', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {filtered.length} dari {allUsers.length} data
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama & Email</th>
                <th>Gender</th>
                <th>Usia / Kota</th>
                <th>Pekerjaan</th>
                <th>Tier</th>
                <th>Status</th>
                <th>Daftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 24px', color: '#9896B0', fontSize: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 28, height: 28, border: '3px solid #E8E3FF', borderTopColor: '#9B89CC', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Memuat data dari Supabase...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 24px', color: '#E07070', fontSize: 14 }}>{error}</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 24px', color: '#9896B0', fontSize: 14 }}>
                    <Users size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    Tidak ada data yang cocok
                  </td>
                </tr>
              ) : filtered.map((u, i) => {
                  const status = resolveStatus(u);
                  const colorIdx = Math.abs((u.id || '').charCodeAt(0)) % avatarGradients.length;
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedUser(u)}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="admin-avatar" style={{ background: avatarGradients[colorIdx] }}>
                            {initials(u.name)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A', marginBottom: 1 }}>{u.name || '—'}</p>
                            <p style={{ fontSize: 11, color: '#9896B0' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge ${u.gender === 'ikhwan' ? 'badge-ikhwan' : 'badge-akhwat'}`}>
                          {u.gender === 'ikhwan' ? '🧔 Ikhwan' : '🧕 Akhwat'}
                        </span>
                      </td>
                      <td>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#2D2A4A' }}>{u.age ? `${u.age} tahun` : '—'}</p>
                        <p style={{ fontSize: 11, color: '#9896B0' }}>{u.city || '—'}</p>
                      </td>
                      <td>
                        <p style={{ fontSize: 13, color: '#2D2A4A' }}>{u.job || '—'}</p>
                        <p style={{ fontSize: 11, color: '#9896B0' }}>{u.education || '—'}</p>
                      </td>
                      <td>
                        {/* Membership tier badge */}
                        {(() => {
                          const t = getTier(u.membership_tier || 'regular');
                          return (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '3px 8px', borderRadius: 8,
                              background: t.colorBg, border: `1px solid ${t.colorBorder}`,
                              fontSize: 11, fontWeight: 800, color: t.color,
                              fontFamily: "'Nunito', sans-serif",
                            }}>
                              {t.emoji} {t.name}
                            </span>
                          );
                        })()}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <select
                          value={status}
                          onChange={e => handleStatusChange(u.id, e.target.value)}
                          disabled={actionLoading}
                          style={{
                            padding: '5px 8px', borderRadius: 8,
                            border: `1.5px solid ${status === 'active' ? '#5EC994' : status === 'pending' ? '#F5A623' : status === 'suspended' ? '#999' : '#E07070'}`,
                            background: status === 'active' ? '#E6F9F0' : status === 'pending' ? '#FFF3E0' : status === 'suspended' ? '#F5F5F5' : '#FFF0F0',
                            color: status === 'active' ? '#1E7A50' : status === 'pending' ? '#8B5E00' : status === 'suspended' ? '#666' : '#8B0000',
                            fontSize: 11, fontWeight: 800,
                            fontFamily: "'Nunito', sans-serif",
                            cursor: 'pointer', outline: 'none',
                            appearance: 'auto',
                          }}
                        >
                          <option value="active">✓ Aktif</option>
                          <option value="pending">◌ Pending</option>
                          <option value="unverified">! Belum Verif</option>
                          <option value="suspended">⛔ Suspended</option>
                        </select>
                      </td>
                      <td style={{ color: '#9896B0', fontSize: 12 }}>
                        {new Date(u.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="admin-btn admin-btn-primary admin-btn-sm"
                            onClick={() => setSelectedUser(u)}
                            style={{ fontSize: 11, padding: '5px 10px' }}
                          >
                            <Eye size={12} /> Detail
                          </button>
                          {!u.verified && (
                            <button
                              onClick={() => handleVerify(u.id)}
                              disabled={actionLoading}
                              style={{ fontSize: 11, padding: '5px 10px', background: '#E6F9F0', color: '#1E7A50', border: '1px solid #5EC994', borderRadius: 8, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Shield size={12} /> Verif
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onVerify={handleVerify}
            onSuspend={handleSuspend}
            onSetMembership={handleSetMembership}
            actionLoading={actionLoading}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function UserDetailModal({ user, onClose, onVerify, onSuspend, onSetMembership, actionLoading }) {
  const status = resolveStatus(user);
  const colorIdx = Math.abs((user.id || '').charCodeAt(0)) % avatarGradients.length;

  const steps = [
    { label: 'Identitas Terverifikasi', done: !!user.verified,      icon: CheckCircle },
    { label: 'Akad Ditandatangani',     done: !!user.akad_signed,   icon: CheckCircle },
    { label: 'Uji Kesiapan Selesai',    done: !!user.readiness_done, icon: Star },
    { label: 'CV Digital Lengkap',      done: !!user.cv_done,       icon: User },
  ];

  return (
    <motion.div
      className="admin-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="admin-modal"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: avatarGradients[colorIdx], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white', flexShrink: 0 }}>
              {initials(user.name)}
            </div>
            <div>
              <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 18, fontWeight: 700, color: '#2D2A4A', marginBottom: 2 }}>{user.name || '—'}</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className={`admin-badge ${user.gender === 'ikhwan' ? 'badge-ikhwan' : 'badge-akhwat'}`} style={{ fontSize: 11 }}>
                  {user.gender === 'ikhwan' ? '🧔 Ikhwan' : '🧕 Akhwat'}
                </span>
                <span className={`admin-badge ${status === 'active' ? 'badge-active' : status === 'pending' ? 'badge-pending' : 'badge-unverif'}`} style={{ fontSize: 11 }}>
                  {status}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F0EEF8', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color="#5E5A7A" />
          </button>
        </div>

        <div style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Contact info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { icon: Mail,          label: 'Email',          val: user.email || '—' },
              { icon: Calendar,      label: 'Tanggal Daftar', val: new Date(user.created_at).toLocaleDateString('id-ID') },
              { icon: MapPin,        label: 'Kota',           val: user.city || '—' },
              { icon: GraduationCap, label: 'Pendidikan',     val: user.education || '—' },
              { icon: Briefcase,     label: 'Pekerjaan',      val: user.job || '—' },
              { icon: User,          label: 'Usia',           val: user.age ? `${user.age} tahun` : '—' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: '#FAFAF8', borderRadius: 12 }}>
                <item.icon size={14} color="#9B89CC" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#9896B0', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{item.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#2D2A4A' }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress checklist */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#9896B0', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Progress Onboarding</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: s.done ? '#E6F9F0' : '#FFF3E0', border: `1px solid ${s.done ? '#A3E6C4' : '#FFD98A'}` }}>
                  <s.icon size={15} color={s.done ? '#1E7A50' : '#8B5E00'} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.done ? '#1E7A50' : '#8B5E00', lineHeight: 1.3 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ibadah info if available */}
          {(user.salat || user.blood_type) && (
            <div style={{ background: '#F9F7FF', borderRadius: 14, padding: '16px' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#9896B0', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Data Ibadah & Kesehatan</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {user.salat && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <BookOpen size={13} color="#63A8D8" />
                    <span style={{ fontSize: 12, color: '#2D2A4A', fontWeight: 600 }}>{user.salat}</span>
                  </div>
                )}
                {user.blood_type && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Droplets size={13} color="#E07070" />
                    <span style={{ fontSize: 12, color: '#2D2A4A', fontWeight: 600 }}>Gol. Darah: {user.blood_type}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Heart size={13} color="#5EC994" />
                  <span style={{ fontSize: 12, color: '#2D2A4A', fontWeight: 600 }}>{user.smoking ? 'Perokok' : 'Tidak Merokok'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Membership Tier Management */}
          <div style={{ background: '#F8F7FF', borderRadius: 14, padding: '14px 16px', marginBottom: 4 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#9896B0', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Tier Keanggotaan</p>
            <div style={{ display: 'flex', gap: 6 }}>
              {['regular', 'premium', 'gold'].map(t => {
                const cfg = getTier(t);
                const isCurrent = (user.membership_tier || 'regular') === t;
                return (
                  <button
                    key={t}
                    onClick={() => !isCurrent && onSetMembership(user.id, t)}
                    disabled={isCurrent || actionLoading}
                    style={{
                      flex: 1, padding: '8px 4px', border: `2px solid ${isCurrent ? cfg.color : cfg.colorBorder}`,
                      borderRadius: 10, background: isCurrent ? cfg.colorBg : 'white',
                      color: cfg.color, fontSize: 11, fontWeight: 800,
                      cursor: isCurrent ? 'default' : 'pointer',
                      fontFamily: "'Nunito', sans-serif",
                      opacity: isCurrent ? 1 : 0.7,
                    }}
                  >
                    {cfg.emoji}<br />{cfg.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            {!user.verified && (
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => onVerify(user.id)}
                disabled={actionLoading}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <CheckCircle size={15} /> Verifikasi User
              </button>
            )}
            <button
              className={`admin-btn ${user.suspended ? 'admin-btn-primary' : 'admin-btn-danger'}`}
              onClick={() => onSuspend(user.id, !user.suspended)}
              disabled={actionLoading}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <XCircle size={15} /> {user.suspended ? 'Aktifkan Kembali' : 'Suspend User'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
