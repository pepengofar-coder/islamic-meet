import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, Users, Heart, MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminGetStats } from '../lib/adminDB';
import '../admin/admin.css';

export default function AdminReports() {
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
      console.error('Failed to load report stats:', err);
      setError('Gagal memuat data laporan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  // CSV Export function
  const handleExportCSV = () => {
    if (!stats) return;
    const headers = ['Metrik', 'Nilai'];
    const rows = [
      ['Total Pendaftar', stats.total],
      ['Akun Aktif', stats.active],
      ['Akun Pending', stats.pending],
      ['Belum Verifikasi', stats.unverified],
      ['Ikhwan', stats.ikhwan],
      ['Akhwat', stats.akhwat],
      ['Ruang Aktif', stats.activeRooms],
      ['Ruang Selesai', stats.closedRooms],
      ['Permintaan Pending', stats.pendingRequests],
      ['Permintaan Disetujui', stats.acceptedRequests],
    ];
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `islamicmeet_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <AdminLayout title="Laporan & Statistik">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 36, height: 36, border: '3px solid #E8E3FF', borderTopColor: '#9B89CC', borderRadius: '50%' }} />
          <p style={{ color: '#9896B0', fontSize: 14, fontWeight: 600 }}>Memuat data laporan...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Laporan & Statistik">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
          <AlertCircle size={40} color="#E07070" />
          <p style={{ color: '#E07070', fontSize: 14, fontWeight: 600 }}>{error}</p>
          <button className="admin-btn admin-btn-primary" onClick={loadStats}><RefreshCw size={14} /> Coba Lagi</button>
        </div>
      </AdminLayout>
    );
  }

  const {
    total = 0, active = 0, pending = 0, unverified = 0,
    ikhwan = 0, akhwat = 0,
    activeRooms = 0, closedRooms = 0,
    pendingRequests = 0, acceptedRequests = 0,
    topCities = [], topJobs = [],
  } = stats || {};

  const activationRate = total > 0 ? Math.round(active / total * 100) : 0;
  const requestRate = (pendingRequests + acceptedRequests) > 0 ? Math.round(acceptedRequests / (pendingRequests + acceptedRequests) * 100) : 0;

  return (
    <AdminLayout title="Laporan & Statistik">
      {/* Refresh */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={loadStats} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Pendaftar', val: total, icon: Users, color: '#9B89CC', bg: '#EAE3FF' },
          { label: 'Tingkat Aktivasi', val: `${activationRate}%`, icon: TrendingUp, color: '#5EC994', bg: '#E6F9F0' },
          { label: 'Ruang Aktif', val: activeRooms, icon: MessageSquare, color: '#63A8D8', bg: '#DBEAFE' },
          { label: 'Ruang Selesai', val: closedRooms, icon: Heart, color: '#E07070', bg: '#FFEFEF' },
          { label: 'Acceptance Rate', val: `${requestRate}%`, icon: MessageSquare, color: '#F5A623', bg: '#FFF3E0' },
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

      <div className="admin-reports-grid">
        {/* Top cities */}
        <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="admin-card-header">
            <div className="admin-card-title"><Users size={16} color="#9B89CC" /> Kota Terbanyak</div>
          </div>
          <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topCities.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9896B0', textAlign: 'center', padding: '20px 0' }}>Belum ada data</p>
            ) : (
              topCities.map(([city, count], i) => (
                <div key={city}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>{city}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#9B89CC' }}>{count} user</span>
                  </div>
                  <div style={{ height: 7, background: '#F0EEF8', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${total > 0 ? count / total * 100 : 0}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #9B89CC, #63A8D8)', borderRadius: 4 }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Top jobs */}
        <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="admin-card-header">
            <div className="admin-card-title"><FileText size={16} color="#9B89CC" /> Profesi Terbanyak</div>
          </div>
          <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topJobs.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9896B0', textAlign: 'center', padding: '20px 0' }}>Belum ada data</p>
            ) : (
              topJobs.map(([job, count], i) => (
                <div key={job}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>{job}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#63A8D8' }}>{count}</span>
                  </div>
                  <div style={{ height: 7, background: '#F0EEF8', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${total > 0 ? count / total * 100 : 0}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #63A8D8, #5EC994)', borderRadius: 4 }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Gender composition */}
      <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginTop: 20 }}>
        <div className="admin-card-header">
          <div className="admin-card-title"><Users size={16} color="#9B89CC" /> Komposisi Gender</div>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {[
            { label: 'Ikhwan', val: ikhwan, color: '#63A8D8', pct: total ? Math.round(ikhwan / total * 100) : 0 },
            { label: 'Akhwat', val: akhwat, color: '#E07070', pct: total ? Math.round(akhwat / total * 100) : 0 },
          ].map(g => (
            <div key={g.label} style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#2D2A4A' }}>{g.label}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: g.color }}>{g.val} ({g.pct}%)</span>
              </div>
              <div style={{ height: 10, background: '#F0EEF8', borderRadius: 5, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${g.pct}%` }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                  style={{ height: '100%', background: g.color, borderRadius: 5 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Export */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ marginTop: 20, padding: '16px 20px', background: 'white', borderRadius: 16, border: '1px solid #F0EEF8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(45,42,74,0.06)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EAE3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Download size={18} color="#9B89CC" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#2D2A4A' }}>Export Laporan</p>
            <p style={{ fontSize: 12, color: '#9896B0' }}>Download ringkasan statistik dalam format CSV</p>
          </div>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleExportCSV}>
          <Download size={15} /> Export CSV
        </button>
      </motion.div>
    </AdminLayout>
  );
}
