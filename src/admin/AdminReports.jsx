import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, Users, Heart, MessageSquare } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminMockUsers, adminRooms, adminRequests } from '../data/adminData';
import '../admin/admin.css';

export default function AdminReports() {
  const total = adminMockUsers.length;
  const active = adminMockUsers.filter(u => u.status === 'active').length;
  const avgScore = Math.round(adminMockUsers.filter(u => u.readinessDone).reduce((a, u) => a + u.readinessScore, 0) / adminMockUsers.filter(u => u.readinessDone).length);
  const khitbah = adminRooms.filter(r => r.status === 'closed_khitbah').length;
  const acceptRate = Math.round(adminRequests.filter(r => r.status === 'accepted').length / adminRequests.length * 100);

  const topCities = Object.entries(
    adminMockUsers.reduce((acc, u) => {
      acc[u.city] = (acc[u.city] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const topJobs = Object.entries(
    adminMockUsers.reduce((acc, u) => {
      if (u.job) acc[u.job] = (acc[u.job] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <AdminLayout title="Laporan & Statistik">
      {/* Summary */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Pendaftar', val: total, icon: Users, color: '#9B89CC', bg: '#EAE3FF' },
          { label: 'Tingkat Aktivasi', val: `${Math.round(active/total*100)}%`, icon: TrendingUp, color: '#5EC994', bg: '#E6F9F0' },
          { label: 'Rata-rata Skor', val: `${avgScore}%`, icon: TrendingUp, color: '#63A8D8', bg: '#DBEAFE' },
          { label: 'Berhasil Khitbah', val: khitbah, icon: Heart, color: '#E07070', bg: '#FFEFEF' },
          { label: 'Acceptance Rate', val: `${acceptRate}%`, icon: MessageSquare, color: '#F5A623', bg: '#FFF3E0' },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Top cities */}
        <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="admin-card-header">
            <div className="admin-card-title"><Users size={16} color="#9B89CC" /> Kota Terbanyak</div>
          </div>
          <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topCities.map(([city, count], i) => (
              <div key={city}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>{city}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#9B89CC' }}>{count} user</span>
                </div>
                <div style={{ height: 7, background: '#F0EEF8', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${count / total * 100}%` }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #9B89CC, #63A8D8)', borderRadius: 4 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top jobs */}
        <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="admin-card-header">
            <div className="admin-card-title"><FileText size={16} color="#9B89CC" /> Profesi Terbanyak</div>
          </div>
          <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topJobs.map(([job, count], i) => (
              <div key={job}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>{job}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#63A8D8' }}>{count}</span>
                </div>
                <div style={{ height: 7, background: '#F0EEF8', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${count / total * 100}%` }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #63A8D8, #5EC994)', borderRadius: 4 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Export note */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ marginTop: 20, padding: '16px 20px', background: 'white', borderRadius: 16, border: '1px solid #F0EEF8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(45,42,74,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EAE3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Download size={18} color="#9B89CC" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#2D2A4A' }}>Export Laporan</p>
            <p style={{ fontSize: 12, color: '#9896B0' }}>Download data pendaftar dalam format CSV/Excel (fitur backend diperlukan)</p>
          </div>
        </div>
        <button className="admin-btn admin-btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          <Download size={15} /> Export CSV
        </button>
      </motion.div>
    </AdminLayout>
  );
}
