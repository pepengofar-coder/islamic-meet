import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Clock, CheckCircle, XCircle, Users,
  Heart, RefreshCw, AlertCircle, Timer, ArrowUpRight,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminGetRooms, adminCloseRoom, adminExtendRoom } from '../lib/adminDB';
import '../admin/admin.css';

const avatarGradients = [
  'linear-gradient(135deg, #9B89CC, #7E6BAF)',
  'linear-gradient(135deg, #63A8D8, #4A8EBF)',
  'linear-gradient(135deg, #5EC994, #3DB878)',
  'linear-gradient(135deg, #F5A623, #E08B00)',
  'linear-gradient(135deg, #E07070, #C05050)',
  'linear-gradient(135deg, #B8A6F0, #93C3E8)',
];

function initials(name) {
  return (name || '?').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

const statusConfig = {
  active:  { label: '● Aktif',       cls: 'badge-active',  color: '#5EC994' },
  closed:  { label: '✓ Selesai',     cls: 'badge-khitbah', color: '#7E6BAF' },
  expired: { label: '⏱ Kedaluwarsa', cls: 'badge-stopped', color: '#9896B0' },
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
      setError('Gagal memuat data ruang ta\'aruf.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  const handleClose = async (roomId) => {
    if (!confirm('Yakin ingin menutup ruang ta\'aruf ini?')) return;
    setActionLoading(true);
    try {
      await adminCloseRoom(roomId);
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'closed' } : r));
    } catch { alert('Gagal menutup ruang.'); }
    setActionLoading(false);
  };

  const handleExtend = async (roomId) => {
    setActionLoading(true);
    try {
      await adminExtendRoom(roomId, 7);
      await loadRooms(); // Reload to get updated data
    } catch { alert('Gagal memperpanjang durasi.'); }
    setActionLoading(false);
  };

  const total = rooms.length;
  const active = rooms.filter(r => r.status === 'active').length;
  const closed = rooms.filter(r => r.status === 'closed').length;
  const expired = rooms.filter(r => r.status === 'expired').length;

  if (loading) {
    return (
      <AdminLayout title="Ruang Ta'aruf">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 36, height: 36, border: '3px solid #E8E3FF', borderTopColor: '#9B89CC', borderRadius: '50%' }}
          />
          <p style={{ color: '#9896B0', fontSize: 14, fontWeight: 600 }}>Memuat data ruang dari Supabase...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Ruang Ta'aruf">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
          <AlertCircle size={40} color="#E07070" />
          <p style={{ color: '#E07070', fontSize: 14, fontWeight: 600 }}>{error}</p>
          <button className="admin-btn admin-btn-primary" onClick={loadRooms}><RefreshCw size={14} /> Coba Lagi</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Ruang Ta'aruf">
      {/* Refresh */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={loadRooms} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Ruang', val: total, icon: MessageSquare, color: '#9B89CC', bg: '#EAE3FF' },
          { label: 'Sedang Aktif', val: active, icon: Clock, color: '#63A8D8', bg: '#DBEAFE' },
          { label: 'Selesai', val: closed, icon: Heart, color: '#5EC994', bg: '#E6F9F0' },
          { label: 'Kedaluwarsa', val: expired, icon: Timer, color: '#F5A623', bg: '#FFF3E0' },
        ].map((s, i) => (
          <motion.div key={i} className="admin-stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className="admin-stat-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <div className="admin-stat-value">{s.val}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rooms list */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title"><MessageSquare size={16} color="#9B89CC" /> Daftar Semua Ruang Ta'aruf</div>
        </div>

        {rooms.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#9896B0', fontSize: 14 }}>
            <MessageSquare size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            Belum ada ruang ta'aruf
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pasangan</th>
                  <th>Status</th>
                  <th>Mulai</th>
                  <th>Durasi</th>
                  <th>Sisa Hari</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, i) => {
                  const u1 = room.user1;
                  const u2 = room.user2;
                  const startMs = new Date(room.created_at).getTime();
                  const expiresMs = room.expires_at ? new Date(room.expires_at).getTime() : startMs + (room.duration_days || 7) * 86400000;
                  const remainDays = Math.max(0, Math.floor((expiresMs - Date.now()) / 86400000));
                  const sc = statusConfig[room.status] || statusConfig.active;
                  const colorIdx1 = Math.abs((u1?.id || '').charCodeAt(0)) % avatarGradients.length;
                  const colorIdx2 = Math.abs((u2?.id || '').charCodeAt(0)) % avatarGradients.length;

                  return (
                    <motion.tr key={room.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ position: 'relative', width: 56, height: 34, flexShrink: 0 }}>
                            <div className="admin-avatar" style={{ width: 32, height: 32, fontSize: 11, position: 'absolute', left: 0, background: avatarGradients[colorIdx1] }}>
                              {initials(u1?.name)}
                            </div>
                            <div className="admin-avatar" style={{ width: 32, height: 32, fontSize: 11, position: 'absolute', left: 20, border: '2px solid white', background: avatarGradients[colorIdx2] }}>
                              {initials(u2?.name)}
                            </div>
                          </div>
                          <div style={{ marginLeft: 8 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>
                              {(u1?.name || '?').split(' ')[0]} & {(u2?.name || '?').split(' ')[0]}
                            </p>
                            <p style={{ fontSize: 11, color: '#9896B0' }}>
                              {u1?.gender === 'ikhwan' ? '🧔' : '🧕'} + {u2?.gender === 'ikhwan' ? '🧔' : '🧕'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td><span className={`admin-badge ${sc.cls}`}>{sc.label}</span></td>
                      <td style={{ color: '#5E5A7A', fontSize: 12 }}>
                        {new Date(room.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ color: '#5E5A7A', fontSize: 12 }}>{room.duration_days || 7} hari</td>
                      <td>
                        {room.status === 'active' ? (
                          <span style={{ fontWeight: 800, color: remainDays <= 2 ? '#E07070' : '#9B89CC', fontSize: 14 }}>
                            {remainDays}h
                          </span>
                        ) : <span style={{ color: '#9896B0' }}>—</span>}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {room.status === 'active' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="admin-btn admin-btn-sm"
                              onClick={() => handleExtend(room.id)}
                              disabled={actionLoading}
                              style={{ fontSize: 11, padding: '5px 10px', background: '#DBEAFE', color: '#1A5CB5', border: '1px solid #93C3E8', borderRadius: 8, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <ArrowUpRight size={12} /> +7h
                            </button>
                            <button
                              className="admin-btn admin-btn-sm"
                              onClick={() => handleClose(room.id)}
                              disabled={actionLoading}
                              style={{ fontSize: 11, padding: '5px 10px', background: '#FFEFEF', color: '#8B0000', border: '1px solid #FFCDD2', borderRadius: 8, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <XCircle size={12} /> Tutup
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Success highlight */}
      {closed > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="admin-card"
          style={{ marginTop: 20, background: 'linear-gradient(135deg, #EAE3FF, #DBEAFE)' }}
        >
          <div style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#2D2A4A', marginBottom: 4 }}>
              💍 MasyaAllah — {closed} ruang ta'aruf telah selesai!
            </p>
            <p style={{ fontSize: 13, color: '#5E5A7A' }}>
              Alhamdulillah, platform ini telah membantu mempertemukan keluarga Muslim yang baru.
            </p>
          </div>
        </motion.div>
      )}
    </AdminLayout>
  );
}
