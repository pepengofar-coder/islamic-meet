import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle, MessageSquare, Heart, TrendingUp,
  UserCheck, Clock, AlertCircle, ArrowRight, Star, RefreshCw,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminGetStats } from '../lib/adminDB';
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError('Gagal memuat data. Cek koneksi Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 36, height: 36, border: '3px solid #E8E3FF', borderTopColor: '#9B89CC', borderRadius: '50%' }}
          />
          <p style={{ color: '#9896B0', fontSize: 14, fontWeight: 600 }}>Memuat data dari database...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
          <AlertCircle size={40} color="#E07070" />
          <p style={{ color: '#E07070', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{error}</p>
          <button className="admin-btn admin-btn-primary" onClick={loadStats}>
            <RefreshCw size={14} /> Coba Lagi
          </button>
        </div>
      </AdminLayout>
    );
  }

  const {
    total = 0, active = 0, pending = 0, unverified = 0,
    ikhwan = 0, akhwat = 0,
    activeRooms = 0, closedRooms = 0, pendingRequests = 0,
    registrationActivity = [], recentUsers = [],
  } = stats || {};

  const maxActivity = Math.max(...registrationActivity.map(d => d.count), 1);

  const statCards = [
    { label: 'Total Pendaftar',       value: total,           icon: Users,        color: '#9B89CC', bg: '#EAE3FF', change: 'Semua akun terdaftar', trend: '+' },
    { label: 'Akun Aktif',            value: active,          icon: CheckCircle,  color: '#5EC994', bg: '#E6F9F0', change: `${total ? Math.round(active/total*100) : 0}% dari total`, trend: '+' },
    { label: 'Menunggu Verifikasi',   value: pending + unverified, icon: Clock,   color: '#F5A623', bg: '#FFF3E0', change: `${unverified} belum verifikasi`, trend: '!' },
    { label: "Ruang Ta'aruf Aktif",   value: activeRooms,     icon: MessageSquare,color: '#63A8D8', bg: '#DBEAFE', change: `${closedRooms} sudah selesai`, trend: '+' },
    { label: 'Permintaan Pending',    value: pendingRequests,  icon: Heart,       color: '#E07070', bg: '#FFEFEF', change: 'Perlu tindak lanjut', trend: '!' },
    { label: 'Ruang Selesai',         value: closedRooms,     icon: Star,         color: '#7E6BAF', bg: '#F0EBFF', change: 'MasyaAllah 🎉', trend: '+' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Refresh button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={loadStats} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} /> Refresh Data
        </button>
      </div>

      {/* Stat Cards */}
      <div className="admin-stats-grid">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} className="admin-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="admin-stat-icon" style={{ background: s.bg }}>
                <Icon size={22} color={s.color} />
              </div>
              <div>
                <div className="admin-stat-value">{s.value}</div>
                <div className="admin-stat-label">{s.label}</div>
                <div className="admin-stat-change" style={{ color: s.trend === '+' ? '#1E7A50' : '#8B5E00' }}>
                  {s.trend === '+' ? '↑' : '⚠'} {s.change}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart + Gender ratio */}
      <div className="admin-dashboard-charts" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 20, marginBottom: 20, alignItems: 'start' }}>
        <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="admin-card-header">
            <div className="admin-card-title">
              <TrendingUp size={16} color="#9B89CC" />
              Tren Pendaftaran (14 Hari Terakhir)
            </div>
            <span style={{ fontSize: 12, color: '#9896B0', fontWeight: 600 }}>
              Total: {registrationActivity.reduce((a, b) => a + b.count, 0)} user
            </span>
          </div>
          <div style={{ padding: '24px 24px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100, marginBottom: 10 }}>
              {registrationActivity.map((day, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div
                    title={`${day.date}: ${day.count} pendaftar`}
                    style={{
                      width: '100%',
                      height: day.count === 0 ? 4 : `${(day.count / maxActivity) * 85}px`,
                      borderRadius: '4px 4px 0 0',
                      background: i === registrationActivity.length - 1
                        ? 'linear-gradient(180deg, #9B89CC, #7E6BAF)'
                        : 'linear-gradient(180deg, #C4B5F0, #93C3E8)',
                      transition: 'all 0.3s', cursor: 'pointer', minHeight: 4,
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {registrationActivity.map((day, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: '#9896B0', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  {i % 3 === 0 ? day.date.split(' ')[0] : ''}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="admin-card-header">
            <div className="admin-card-title"><Users size={16} color="#9B89CC" /> Komposisi</div>
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#9896B0', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Gender</p>
              {[
                { label: 'Ikhwan', val: ikhwan, color: '#63A8D8', pct: total ? Math.round(ikhwan/total*100) : 0 },
                { label: 'Akhwat', val: akhwat, color: '#E07070', pct: total ? Math.round(akhwat/total*100) : 0 },
              ].map(g => (
                <div key={g.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>{g.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: g.color }}>{g.val} ({g.pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: '#F0EEF8', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${g.pct}%` }} transition={{ delay: 0.5, duration: 0.7 }} style={{ height: '100%', background: g.color, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#9896B0', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Status Akun</p>
              {[
                { label: 'Aktif',       val: active,    color: '#5EC994' },
                { label: 'Pending',     val: pending,   color: '#F5A623' },
                { label: 'Belum Verif', val: unverified, color: '#E07070' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: '#2D2A4A', fontWeight: 600 }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent users */}
      <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="admin-card-header">
          <div className="admin-card-title"><UserCheck size={16} color="#9B89CC" /> Pendaftar Terbaru</div>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => navigate('/admin280292/users')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            Lihat Semua <ArrowRight size={13} />
          </button>
        </div>
        {recentUsers.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#9896B0', fontSize: 14 }}>
            Belum ada pendaftar
          </div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Nama</th><th>Gender</th><th>Kota</th><th>Status</th><th>Bergabung</th></tr></thead>
            <tbody>
              {recentUsers.map((u, i) => {
                const colorIdx = Math.abs((u.id || '').charCodeAt(0)) % avatarGradients.length;
                const status = u.verified && u.cv_done ? 'active' : u.verified ? 'pending' : 'unverified';
                return (
                  <motion.tr key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.05 }} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin280292/users')}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="admin-avatar" style={{ background: avatarGradients[colorIdx] }}>{initials(u.name)}</div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A', marginBottom: 1 }}>{(u.name || '—').split(' ').slice(0,2).join(' ')}</p>
                          <p style={{ fontSize: 11, color: '#9896B0' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={`admin-badge ${u.gender === 'ikhwan' ? 'badge-ikhwan' : 'badge-akhwat'}`}>{u.gender === 'ikhwan' ? '🧔 Ikhwan' : '🧕 Akhwat'}</span></td>
                    <td style={{ color: '#5E5A7A' }}>{u.city || '—'}</td>
                    <td><span className={`admin-badge ${status === 'active' ? 'badge-active' : status === 'pending' ? 'badge-pending' : 'badge-unverif'}`}>{status === 'active' ? '● Aktif' : status === 'pending' ? '◌ Pending' : '○ Belum Verif'}</span></td>
                    <td style={{ color: '#9896B0', fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>
    </AdminLayout>
  );
}
