import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, DollarSign, TrendingUp, Users,
  RefreshCw, AlertCircle, Crown, Download,
  Calendar, Star,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminGetPaymentReport } from '../lib/adminDB';
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

function initials(name) {
  return (name || '?').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

// Pricing for display (adjust to your actual pricing)
const tierPricing = {
  regular: 0,
  premium: 99000,
  gold: 199000,
};

export default function AdminPayments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminGetPaymentReport();
      setData(result);
    } catch (err) {
      console.error('Failed to load payment report:', err);
      setError('Gagal memuat data pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ['Nama', 'Email', 'Tier', 'Harga (Rp)', 'Berlaku Sampai', 'Tanggal Daftar'];
    const rows = data.paidMembers.map(m => [
      m.name || m.full_name || '—',
      m.email,
      m.membership_tier,
      tierPricing[m.membership_tier] || 0,
      m.membership_expires_at ? new Date(m.membership_expires_at).toLocaleDateString('id-ID') : '—',
      new Date(m.created_at).toLocaleDateString('id-ID'),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `islamicmeet_payments_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <AdminLayout title="Laporan Pembayaran">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 36, height: 36, border: '3px solid #E8E3FF', borderTopColor: '#9B89CC', borderRadius: '50%' }} />
          <p style={{ color: '#9896B0', fontSize: 14, fontWeight: 600 }}>Memuat data pembayaran...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Laporan Pembayaran">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
          <AlertCircle size={40} color="#E07070" />
          <p style={{ color: '#E07070', fontSize: 14, fontWeight: 600 }}>{error}</p>
          <button className="admin-btn admin-btn-primary" onClick={loadData}><RefreshCw size={14} /> Coba Lagi</button>
        </div>
      </AdminLayout>
    );
  }

  const { totalUsers, regularCount, premiumCount, goldCount, paidMembers, totalRevenue } = data;

  return (
    <AdminLayout title="Laporan Pembayaran">
      {/* Refresh */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', val: `Rp ${totalRevenue.toLocaleString('id-ID')}`, icon: DollarSign, color: '#5EC994', bg: '#E6F9F0' },
          { label: 'Total Member', val: totalUsers, icon: Users, color: '#9B89CC', bg: '#EAE3FF' },
          { label: 'Premium', val: premiumCount, icon: Star, color: '#F5A623', bg: '#FFF3E0' },
          { label: 'Gold', val: goldCount, icon: Crown, color: '#E07070', bg: '#FFEFEF' },
          { label: 'Regular (Free)', val: regularCount, icon: CreditCard, color: '#63A8D8', bg: '#DBEAFE' },
        ].map((s, i) => (
          <motion.div key={i} className="admin-stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className="admin-stat-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <div className="admin-stat-value" style={{ fontSize: s.label === 'Total Revenue' ? 20 : 28 }}>{s.val}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tier breakdown chart */}
      <div className="admin-reports-grid" style={{ marginBottom: 20 }}>
        <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="admin-card-header">
            <div className="admin-card-title"><TrendingUp size={16} color="#9B89CC" /> Distribusi Tier</div>
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Regular', count: regularCount, color: '#63A8D8', price: 'Gratis' },
              { label: 'Premium', count: premiumCount, color: '#F5A623', price: 'Rp 99.000/bln' },
              { label: 'Gold', count: goldCount, color: '#E07070', price: 'Rp 199.000/bln' },
            ].map((t, i) => (
              <div key={t.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>{t.label} — <span style={{ color: '#9896B0', fontWeight: 600 }}>{t.price}</span></span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: t.color }}>{t.count} user</span>
                </div>
                <div style={{ height: 8, background: '#F0EEF8', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${totalUsers > 0 ? (t.count / totalUsers) * 100 : 0}%` }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                    style={{ height: '100%', background: t.color, borderRadius: 4 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Revenue per tier */}
        <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="admin-card-header">
            <div className="admin-card-title"><DollarSign size={16} color="#5EC994" /> Revenue per Tier</div>
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Premium', count: premiumCount, price: 99000, color: '#F5A623' },
              { label: 'Gold', count: goldCount, price: 199000, color: '#E07070' },
            ].map(t => (
              <div key={t.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#FAFAF8', borderRadius: 12 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#2D2A4A' }}>{t.label}</p>
                  <p style={{ fontSize: 11, color: '#9896B0' }}>{t.count} member × Rp {t.price.toLocaleString('id-ID')}</p>
                </div>
                <p style={{ fontSize: 16, fontWeight: 800, color: t.color }}>
                  Rp {(t.count * t.price).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
            <div style={{ borderTop: '2px solid #F0EEF8', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#2D2A4A' }}>Total Revenue</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#5EC994' }}>Rp {totalRevenue.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Members table */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card-header">
          <div className="admin-card-title"><Crown size={16} color="#F5A623" /> Daftar Member Berbayar</div>
          <span style={{ fontSize: 12, color: '#9896B0', fontWeight: 600 }}>{paidMembers.length} member</span>
        </div>

        {paidMembers.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#9896B0', fontSize: 14 }}>
            <Crown size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            Belum ada member berbayar
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Tier</th>
                  <th>Harga</th>
                  <th>Berlaku Sampai</th>
                  <th>Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody>
                {paidMembers.map((m, i) => {
                  const t = getTier(m.membership_tier || 'regular');
                  const colorIdx = Math.abs((m.id || '').charCodeAt(0)) % avatarGradients.length;
                  return (
                    <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="admin-avatar" style={{ background: avatarGradients[colorIdx] }}>
                            {initials(m.name || m.full_name)}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>{(m.name || m.full_name || '—').split(' ').slice(0, 2).join(' ')}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: '#9896B0' }}>{m.email}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 8px', borderRadius: 8,
                          background: t.colorBg, border: `1px solid ${t.colorBorder}`,
                          fontSize: 11, fontWeight: 800, color: t.color,
                          fontFamily: "'Nunito', sans-serif",
                        }}>
                          {t.emoji} {t.name}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>
                        Rp {(tierPricing[m.membership_tier] || 0).toLocaleString('id-ID')}
                      </td>
                      <td style={{ fontSize: 12, color: '#9896B0' }}>
                        {m.membership_expires_at
                          ? new Date(m.membership_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td style={{ fontSize: 12, color: '#9896B0' }}>
                        {new Date(m.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ padding: '16px 20px', background: 'white', borderRadius: 16, border: '1px solid #F0EEF8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(45,42,74,0.06)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E6F9F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Download size={18} color="#5EC994" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#2D2A4A' }}>Export Pembayaran</p>
            <p style={{ fontSize: 12, color: '#9896B0' }}>Download data member berbayar dalam format CSV</p>
          </div>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleExportCSV}>
          <Download size={15} /> Export CSV
        </button>
      </motion.div>
    </AdminLayout>
  );
}
