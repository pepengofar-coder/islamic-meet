import { motion } from 'framer-motion';
import {
  MessageSquare, Clock, CheckCircle, XCircle, Users,
  Heart, AlertTriangle, ArrowRight,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminRooms, adminMockUsers } from '../data/adminData';
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
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

const statusConfig = {
  active:         { label: '● Aktif', cls: 'badge-active', icon: '💬' },
  closed_khitbah: { label: '💍 Khitbah', cls: 'badge-khitbah', icon: '💍' },
  closed_stopped: { label: '✗ Dihentikan', cls: 'badge-stopped', icon: '✗' },
};

export default function AdminRooms() {
  const total = adminRooms.length;
  const active = adminRooms.filter(r => r.status === 'active').length;
  const khitbah = adminRooms.filter(r => r.status === 'closed_khitbah').length;
  const stopped = adminRooms.filter(r => r.status === 'closed_stopped').length;
  const totalMessages = adminRooms.reduce((a, r) => a + r.messagesCount, 0);

  return (
    <AdminLayout title="Ruang Ta'aruf">
      {/* Stats */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Ruang', val: total, icon: MessageSquare, color: '#9B89CC', bg: '#EAE3FF' },
          { label: 'Sedang Aktif', val: active, icon: Clock, color: '#63A8D8', bg: '#DBEAFE' },
          { label: 'Berhasil Khitbah', val: khitbah, icon: Heart, color: '#5EC994', bg: '#E6F9F0' },
          { label: 'Total Pesan', val: totalMessages, icon: MessageSquare, color: '#F5A623', bg: '#FFF3E0' },
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
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pasangan</th>
                <th>Status</th>
                <th>Mulai</th>
                <th>Durasi</th>
                <th>Sisa Hari</th>
                <th>Pesan</th>
                <th>Mediator</th>
              </tr>
            </thead>
            <tbody>
              {adminRooms.map((room, i) => {
                const u1 = adminMockUsers.find(u => u.id === room.user1);
                const u2 = adminMockUsers.find(u => u.id === room.user2);
                const startMs = new Date(room.startDate).getTime();
                const remainDays = Math.max(0, room.durationDays - Math.floor((Date.now() - startMs) / 86400000));
                const sc = statusConfig[room.status];

                return (
                  <motion.tr key={room.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: 56, height: 34, flexShrink: 0 }}>
                          <div className="admin-avatar" style={{ width: 32, height: 32, fontSize: 11, position: 'absolute', left: 0, background: avatarGradients[u1?.colorIndex || 0] }}>
                            {initials(u1?.name || 'U1')}
                          </div>
                          <div className="admin-avatar" style={{ width: 32, height: 32, fontSize: 11, position: 'absolute', left: 20, border: '2px solid white', background: avatarGradients[u2?.colorIndex || 1] }}>
                            {initials(u2?.name || 'U2')}
                          </div>
                        </div>
                        <div style={{ marginLeft: 8 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>
                            {u1?.name.split(' ')[0]} & {u2?.name.split(' ')[0]}
                          </p>
                          <p style={{ fontSize: 11, color: '#9896B0' }}>
                            {u1?.gender === 'ikhwan' ? '🧔' : '🧕'} + {u2?.gender === 'ikhwan' ? '🧔' : '🧕'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td><span className={`admin-badge ${sc.cls}`}>{sc.label}</span></td>
                    <td style={{ color: '#5E5A7A', fontSize: 12 }}>{room.startDate}</td>
                    <td style={{ color: '#5E5A7A', fontSize: 12 }}>{room.durationDays} hari</td>
                    <td>
                      {room.status === 'active' ? (
                        <span style={{ fontWeight: 800, color: remainDays <= 2 ? '#E07070' : '#9B89CC', fontSize: 14 }}>
                          {remainDays}h
                        </span>
                      ) : <span style={{ color: '#9896B0' }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MessageSquare size={12} color="#9B89CC" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>{room.messagesCount}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: room.mediator ? '#1E7A50' : '#9896B0', fontWeight: room.mediator ? 700 : 400 }}>
                        {room.mediator === 'admin' ? '✓ Admin'
                          : room.mediator === 'wali' ? '✓ Wali'
                          : '— Tidak ada'}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success highlight */}
      {adminRooms.filter(r => r.status === 'closed_khitbah').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="admin-card"
          style={{ marginTop: 20, background: 'linear-gradient(135deg, #EAE3FF, #DBEAFE)' }}
        >
          <div style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#2D2A4A', marginBottom: 4 }}>
              💍 MasyaAllah — {adminRooms.filter(r => r.status === 'closed_khitbah').length} pasangan berhasil khitbah!
            </p>
            <p style={{ fontSize: 13, color: '#5E5A7A' }}>
              Alhamdulillah, platform ini telah membantu mempertemukan keluarga Muslim yang baru. Semoga Allah memberkahi proses ta'aruf mereka.
            </p>
          </div>
        </motion.div>
      )}
    </AdminLayout>
  );
}
