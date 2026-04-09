import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Send, CheckCircle, XCircle, Clock, Heart,
  RefreshCw, AlertCircle, Shield, ArrowRight,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminGetRequests, adminApproveRequest, adminRejectRequest } from '../lib/adminDB';
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

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests:', err);
      setError('Gagal memuat data permintaan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const handleApprove = async (req) => {
    setActionLoading(true);
    try {
      await adminApproveRequest(req.id, req.from_id, req.to_id);
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'accepted' } : r));
    } catch (err) {
      console.error(err);
      alert('Gagal menyetujui permintaan.');
    }
    setActionLoading(false);
  };

  const handleReject = async (reqId) => {
    if (!confirm('Yakin ingin menolak permintaan ini?')) return;
    setActionLoading(true);
    try {
      await adminRejectRequest(reqId);
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r));
    } catch {
      alert('Gagal menolak permintaan.');
    }
    setActionLoading(false);
  };

  const total = requests.length;
  const accepted = requests.filter(r => r.status === 'accepted').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const pending = requests.filter(r => r.status === 'pending').length;
  const approvedByUser = requests.filter(r => r.status === 'approved_by_user').length;
  const acceptRate = total > 0 ? Math.round(accepted / total * 100) : 0;

  const filtered = filterStatus === 'all'
    ? requests
    : requests.filter(r => r.status === filterStatus);

  if (loading) {
    return (
      <AdminLayout title="Permintaan Ta'aruf">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 36, height: 36, border: '3px solid #E8E3FF', borderTopColor: '#9B89CC', borderRadius: '50%' }} />
          <p style={{ color: '#9896B0', fontSize: 14, fontWeight: 600 }}>Memuat data permintaan...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Permintaan Ta'aruf">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
          <AlertCircle size={40} color="#E07070" />
          <p style={{ color: '#E07070', fontSize: 14, fontWeight: 600 }}>{error}</p>
          <button className="admin-btn admin-btn-primary" onClick={loadRequests}><RefreshCw size={14} /> Coba Lagi</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Permintaan Ta'aruf">
      {/* Refresh */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={loadRequests} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Permintaan', val: total, icon: Send, color: '#9B89CC', bg: '#EAE3FF' },
          { label: 'Menunggu Admin', val: approvedByUser, icon: Shield, color: '#F5A623', bg: '#FFF3E0', highlight: approvedByUser > 0 },
          { label: 'Disetujui', val: accepted, icon: CheckCircle, color: '#5EC994', bg: '#E6F9F0' },
          { label: 'Ditolak', val: rejected, icon: XCircle, color: '#E07070', bg: '#FFEFEF' },
          { label: 'Pending User', val: pending, icon: Clock, color: '#63A8D8', bg: '#DBEAFE' },
        ].map((s, i) => (
          <motion.div key={i} className="admin-stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={s.highlight ? { border: '2px solid #F5A623', background: '#FFFBF0' } : {}}
          >
            <div className="admin-stat-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <div className="admin-stat-value">{s.val}</div>
              <div className="admin-stat-label">{s.label}</div>
              {i === 2 && <div className="admin-stat-change" style={{ color: '#1E7A50' }}>↑ {acceptRate}% acceptance rate</div>}
              {s.highlight && <div className="admin-stat-change" style={{ color: '#8B5E00' }}>⚠ Perlu tindakan</div>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Semua', color: '#9B89CC' },
          { key: 'approved_by_user', label: '⚠ Perlu Admin', color: '#F5A623' },
          { key: 'pending', label: '◌ Pending', color: '#63A8D8' },
          { key: 'accepted', label: '✓ Disetujui', color: '#5EC994' },
          { key: 'rejected', label: '✗ Ditolak', color: '#E07070' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            style={{
              padding: '7px 14px', borderRadius: 10,
              border: `2px solid ${filterStatus === tab.key ? tab.color : '#E8E3FF'}`,
              background: filterStatus === tab.key ? `${tab.color}15` : 'white',
              color: filterStatus === tab.key ? tab.color : '#5E5A7A',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title"><Heart size={16} color="#E07070" /> Semua Permintaan Ta'aruf</div>
          <span style={{ fontSize: 12, color: '#9896B0', fontWeight: 600 }}>{filtered.length} permintaan</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#9896B0', fontSize: 14 }}>
            <Heart size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            Tidak ada permintaan ditemukan
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pengirim</th>
                  <th>Penerima</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req, i) => {
                  const from = req.from_profile;
                  const to = req.to_profile;
                  const colorIdx1 = Math.abs((from?.id || '').charCodeAt(0)) % avatarGradients.length;
                  const colorIdx2 = Math.abs((to?.id || '').charCodeAt(0)) % avatarGradients.length;

                  const statusConf = {
                    accepted:         { cls: 'badge-active',   label: '✓ Disetujui',  color: '#5EC994' },
                    approved_by_user: { cls: 'badge-pending',  label: '⚠ Perlu Admin', color: '#F5A623' },
                    rejected:         { cls: 'badge-unverif',  label: '✗ Ditolak',    color: '#E07070' },
                    pending:          { cls: 'badge-pending',  label: '◌ Menunggu',   color: '#63A8D8' },
                  };
                  const sc = statusConf[req.status] || statusConf.pending;

                  return (
                    <motion.tr key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      style={req.status === 'approved_by_user' ? { background: '#FFFBF0' } : {}}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="admin-avatar" style={{ background: avatarGradients[colorIdx1] }}>
                            {initials(from?.name)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>{(from?.name || '—').split(' ').slice(0, 2).join(' ')}</p>
                            <p style={{ fontSize: 11, color: '#9896B0' }}>{from?.city || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="admin-avatar" style={{ background: avatarGradients[colorIdx2] }}>
                            {initials(to?.name)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A' }}>{(to?.name || '—').split(' ').slice(0, 2).join(' ')}</p>
                            <p style={{ fontSize: 11, color: '#9896B0' }}>{to?.city || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: '#9896B0', fontSize: 12 }}>
                        {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <span className={`admin-badge ${sc.cls}`}>{sc.label}</span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {req.status === 'approved_by_user' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => handleApprove(req)}
                              disabled={actionLoading}
                              style={{ fontSize: 11, padding: '6px 12px', background: '#E6F9F0', color: '#1E7A50', border: '1px solid #5EC994', borderRadius: 8, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <CheckCircle size={12} /> Setujui
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              disabled={actionLoading}
                              style={{ fontSize: 11, padding: '6px 12px', background: '#FFEFEF', color: '#8B0000', border: '1px solid #FFCDD2', borderRadius: 8, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <XCircle size={12} /> Tolak
                            </button>
                          </div>
                        )}
                        {req.status === 'pending' && (
                          <span style={{ fontSize: 11, color: '#9896B0', fontStyle: 'italic' }}>Menunggu respon user</span>
                        )}
                        {req.status === 'accepted' && (
                          <span style={{ fontSize: 11, color: '#5EC994', fontWeight: 700 }}>✓ Ruang dibuat</span>
                        )}
                        {req.status === 'rejected' && (
                          <span style={{ fontSize: 11, color: '#E07070' }}>Ditolak</span>
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
    </AdminLayout>
  );
}
