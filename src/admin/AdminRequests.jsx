import { motion } from 'framer-motion';
import { Send, CheckCircle, XCircle, Clock, Heart } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminRequests, adminMockUsers } from '../data/adminData';
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

export default function AdminRequests() {
  const total = adminRequests.length;
  const accepted = adminRequests.filter(r => r.status === 'accepted').length;
  const rejected = adminRequests.filter(r => r.status === 'rejected').length;
  const pending = adminRequests.filter(r => r.status === 'pending').length;
  const acceptRate = Math.round(accepted / total * 100);

  return (
    <AdminLayout title="Permintaan Ta'aruf">
      {/* Stats */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Permintaan', val: total, icon: Send, color: '#9B89CC', bg: '#EAE3FF' },
          { label: 'Diterima', val: accepted, icon: CheckCircle, color: '#5EC994', bg: '#E6F9F0' },
          { label: 'Ditolak', val: rejected, icon: XCircle, color: '#E07070', bg: '#FFEFEF' },
          { label: 'Pending', val: pending, icon: Clock, color: '#F5A623', bg: '#FFF3E0' },
        ].map((s, i) => (
          <motion.div key={i} className="admin-stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className="admin-stat-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <div className="admin-stat-value">{s.val}</div>
              <div className="admin-stat-label">{s.label}</div>
              {i === 1 && <div className="admin-stat-change" style={{ color: '#1E7A50' }}>↑ {acceptRate}% acceptance rate</div>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title"><Heart size={16} color="#E07070" /> Semua Permintaan Ta'aruf</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pengirim</th>
                <th>Penerima</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Kompatibilitas</th>
              </tr>
            </thead>
            <tbody>
              {adminRequests.map((req, i) => {
                const from = adminMockUsers.find(u => u.id === req.fromId);
                const to = adminMockUsers.find(u => u.id === req.toId);

                const scoreA = from?.readinessScore || 0;
                const scoreB = to?.readinessScore || 0;
                const compat = Math.round((scoreA + scoreB) / 2);

                const statusConf = {
                  accepted: { cls: 'badge-active', label: '✓ Diterima', icon: CheckCircle, color: '#5EC994' },
                  rejected: { cls: 'badge-unverif', label: '✗ Ditolak', icon: XCircle, color: '#E07070' },
                  pending:  { cls: 'badge-pending', label: '◌ Menunggu', icon: Clock, color: '#F5A623' },
                };
                const sc = statusConf[req.status];

                return (
                  <motion.tr key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="admin-avatar" style={{ background: avatarGradients[(from?.colorIndex || 0) % avatarGradients.length] }}>
                          {initials(from?.name || 'XX')}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>{from?.name.split(' ').slice(0,2).join(' ')}</p>
                          <p style={{ fontSize: 11, color: '#9896B0' }}>{from?.city}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="admin-avatar" style={{ background: avatarGradients[(to?.colorIndex || 1) % avatarGradients.length] }}>
                          {initials(to?.name || 'XX')}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>{to?.name.split(' ').slice(0,2).join(' ')}</p>
                          <p style={{ fontSize: 11, color: '#9896B0' }}>{to?.city}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#9896B0', fontSize: 12 }}>{req.date}</td>
                    <td>
                      <span className={`admin-badge ${sc.cls}`}>{sc.label}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#F0EEF8', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                          <div style={{ height: '100%', width: `${compat}%`, background: compat >= 80 ? '#5EC994' : compat >= 60 ? '#F5A623' : '#E07070', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: compat >= 80 ? '#1E7A50' : '#8B5E00', minWidth: 32 }}>{compat}%</span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
