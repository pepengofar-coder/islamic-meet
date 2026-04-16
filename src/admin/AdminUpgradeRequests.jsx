import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendUpgradeEmail } from '../lib/emailjs';

export default function AdminUpgradeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const load = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from('upgrade_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (filter !== 'all') q = q.eq('status', filter);
      const { data, error } = await q;
      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Load upgrade requests error:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status, reqData) => {
    try {
      await supabase.from('upgrade_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (status === 'approved' && reqData?.userId && reqData?.tier) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        await supabase.from('profiles').update({
          membership_tier: reqData.tier,
          membership_expires_at: expiresAt.toISOString(),
        }).eq('id', reqData.userId);

        // Send Upgrade Email
        if (reqData.userEmail && reqData.userName) {
          await sendUpgradeEmail(reqData.userEmail, reqData.userName, reqData.tier);
        }
      }
      load();
    } catch (err) {
      console.error('Update upgrade request error:', err);
      alert('Gagal mengupdate status');
    }
  };

  const tierColors = {
    premium: { bg: '#EAE3FF', color: '#9B89CC', emoji: '⭐' },
    gold: { bg: '#FFF3E0', color: '#F5A623', emoji: '👑' },
  };

  const statusBadge = (s) => {
    const map = {
      pending: { bg: '#FFF3E0', color: '#E08B00', text: '⏳ Menunggu', icon: Clock },
      approved: { bg: '#E6F9F0', color: '#2D9E6B', text: '✅ Disetujui', icon: CheckCircle },
      rejected: { bg: '#FFE8E8', color: '#E07070', text: '❌ Ditolak', icon: XCircle },
    };
    const d = map[s] || map.pending;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: d.bg, color: d.color, fontSize: 11, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
        {d.text}
      </span>
    );
  };

  return (
    <AdminLayout title="Permintaan Upgrade">
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { id: 'pending', label: '⏳ Menunggu' },
          { id: 'approved', label: '✅ Disetujui' },
          { id: 'rejected', label: '❌ Ditolak' },
          { id: 'all', label: '📋 Semua' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '8px 16px', borderRadius: 12,
            border: `2px solid ${filter === f.id ? 'var(--purple-400)' : '#E8E3FF'}`,
            background: filter === f.id ? 'var(--purple-50)' : 'white',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Nunito', sans-serif",
            color: filter === f.id ? 'var(--purple-500)' : '#5E5A7A',
          }}>
            {f.label}
          </button>
        ))}
        <button onClick={load} style={{ marginLeft: 'auto', padding: '8px 12px', borderRadius: 12, border: 'none', background: 'var(--purple-50)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--purple-500)', fontFamily: "'Nunito', sans-serif" }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Menunggu', count: requests.filter(r => r.status === 'pending').length, color: '#F5A623', bg: '#FFF3E0' },
          { label: 'Disetujui', count: requests.filter(r => r.status === 'approved').length, color: '#5EC994', bg: '#E6F9F0' },
          { label: 'Ditolak', count: requests.filter(r => r.status === 'rejected').length, color: '#E07070', bg: '#FFE8E8' },
        ].map((stat, i) => (
          <div key={i} style={{ background: stat.bg, borderRadius: 16, padding: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: stat.color, fontFamily: "'Quicksand', sans-serif" }}>{stat.count}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: stat.color, opacity: 0.7 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Requests list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9896B0' }}>Memuat...</div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Crown size={40} color="#E8E3FF" style={{ marginBottom: 12 }} />
          <p style={{ color: '#9896B0', fontSize: 14, fontFamily: "'Nunito', sans-serif" }}>Tidak ada permintaan upgrade</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {requests.map((req, i) => {
            const tc = tierColors[req.requested_tier] || tierColors.premium;
            return (
              <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: 'white', borderRadius: 16, padding: '18px', border: '1px solid #E8E3FF', boxShadow: '0 2px 8px rgba(45,42,74,0.05)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#2D2A4A', fontFamily: "'Nunito', sans-serif", marginBottom: 2 }}>
                      {req.user_name || 'Unknown User'}
                    </p>
                    <p style={{ fontSize: 11, color: '#9896B0' }}>{req.user_email || ''}</p>
                  </div>
                  {statusBadge(req.status)}
                </div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={{ padding: '4px 12px', borderRadius: 20, background: tc.bg, color: tc.color, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {tc.emoji} {(req.requested_tier || '').charAt(0).toUpperCase() + (req.requested_tier || '').slice(1)}
                  </span>
                  <span style={{ padding: '4px 12px', borderRadius: 20, background: '#F4F3FA', color: '#5E5A7A', fontSize: 12, fontWeight: 600 }}>
                    💰 Rp {(req.amount || 0).toLocaleString('id-ID')}
                  </span>
                  <span style={{ padding: '4px 12px', borderRadius: 20, background: '#EFF6FF', color: '#4A8EBF', fontSize: 12, fontWeight: 600 }}>
                    📅 {req.billing_cycle === 'yearly' ? 'Tahunan' : 'Bulanan'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 11, color: '#9896B0' }}>
                    {req.created_at ? new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => updateStatus(req.id, 'approved', req.user_id, req.requested_tier)}
                        style={{ padding: '7px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #5EC994, #3DB878)', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', gap: 5 }}
                      >
                        <CheckCircle size={13} /> Setujui
                      </button>
                      <button
                        onClick={() => updateStatus(req.id, 'rejected')}
                        style={{ padding: '7px 16px', borderRadius: 10, border: '2px solid #E07070', background: 'white', color: '#E07070', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', gap: 5 }}
                      >
                        <XCircle size={13} /> Tolak
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
