import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Users, Search, RefreshCw, CheckCircle,
  AlertCircle, X, ArrowRight,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminGetProfiles, adminCreateTaarufPair, adminGetRooms } from '../lib/adminDB';
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

export default function AdminMatch() {
  const [users, setUsers] = useState([]);
  const [activeUserIds, setActiveUserIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [user1, setUser1] = useState(null);
  const [user2, setUser2] = useState(null);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const profilesData = await adminGetProfiles();
      const roomsData = await adminGetRooms();
      
      const activeRooms = roomsData.filter(r => r.status === 'active');
      const ids = new Set();
      activeRooms.forEach(r => {
        if (r.user1_id) ids.add(r.user1_id);
        if (r.user2_id) ids.add(r.user2_id);
      });
      
      setActiveUserIds(ids);
      setUsers(profilesData);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const ikhwanList = users.filter(u => u.gender === 'ikhwan' && u.verified && u.cv_done && !activeUserIds.has(u.id));
  const akhwatList = users.filter(u => u.gender === 'akhwat' && u.verified && u.cv_done && !activeUserIds.has(u.id));

  const filteredIkhwan = ikhwanList.filter(u =>
    !search1 || (u.name || '').toLowerCase().includes(search1.toLowerCase()) || (u.city || '').toLowerCase().includes(search1.toLowerCase())
  );
  const filteredAkhwat = akhwatList.filter(u =>
    !search2 || (u.name || '').toLowerCase().includes(search2.toLowerCase()) || (u.city || '').toLowerCase().includes(search2.toLowerCase())
  );

  const handleMatch = async () => {
    if (!user1 || !user2) return;
    if (!confirm(`Yakin ingin memasangkan ${user1.name || 'User 1'} dengan ${user2.name || 'User 2'} untuk Ta'aruf?`)) return;

    setActionLoading(true);
    try {
      await adminCreateTaarufPair(user1.id, user2.id);
      setSuccessMsg(`✅ Berhasil! Ruang ta'aruf telah dibuat untuk ${(user1.name || 'User 1').split(' ')[0]} & ${(user2.name || 'User 2').split(' ')[0]}.`);
      setUser1(null);
      setUser2(null);
    } catch (err) {
      console.error(err);
      alert('Gagal membuat pasangan ta\'aruf. Silakan coba lagi.');
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <AdminLayout title="Pasangkan Ta'aruf">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 36, height: 36, border: '3px solid #E8E3FF', borderTopColor: '#9B89CC', borderRadius: '50%' }} />
          <p style={{ color: '#9896B0', fontSize: 14, fontWeight: 600 }}>Memuat data user...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Pasangkan Ta'aruf">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
          <AlertCircle size={40} color="#E07070" />
          <p style={{ color: '#E07070', fontSize: 14, fontWeight: 600 }}>{error}</p>
          <button className="admin-btn admin-btn-primary" onClick={loadUsers}><RefreshCw size={14} /> Coba Lagi</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Pasangkan Ta'aruf">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={loadUsers} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Info banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'linear-gradient(135deg, #EAE3FF, #DBEAFE)', borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, border: '1px solid #D4C5FF' }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #9B89CC, #63A8D8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Heart size={20} color="white" />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#2D2A4A' }}>Pasangkan User untuk Ta'aruf</p>
          <p style={{ fontSize: 12, color: '#5E5A7A' }}>Pilih satu Ikhwan dan satu Akhwat yang sudah terverifikasi untuk dipasangkan. Ruang ta'aruf akan otomatis dibuat.</p>
        </div>
      </motion.div>

      {/* Success message */}
      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#E6F9F0', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #A3E6C4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={18} color="#1E7A50" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1E7A50' }}>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} color="#1E7A50" />
          </button>
        </motion.div>
      )}

      {/* Selection grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, alignItems: 'start' }}>
        {/* Ikhwan picker */}
        <div className="admin-card">
          <div className="admin-card-header" style={{ background: '#DBEAFE' }}>
            <div className="admin-card-title" style={{ color: '#1A5CB5' }}>
              🧔 Pilih Ikhwan
            </div>
            <span style={{ fontSize: 11, color: '#5E5A7A', fontWeight: 600 }}>{ikhwanList.length} tersedia</span>
          </div>

          {/* Selected */}
          {user1 && (
            <div style={{ padding: '12px 16px', background: '#E6F9F0', borderBottom: '1px solid #A3E6C4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="admin-avatar" style={{ background: avatarGradients[Math.abs((user1.id || '').charCodeAt(0)) % avatarGradients.length] }}>
                  {initials(user1.name)}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1E7A50' }}>{user1.name || '—'}</p>
                  <p style={{ fontSize: 11, color: '#5EC994' }}>{user1.city || '—'} • {user1.age || '—'} th</p>
                </div>
              </div>
              <button onClick={() => setUser1(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} color="#1E7A50" />
              </button>
            </div>
          )}

          {/* Search */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0EEF8' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9896B0' }} />
              <input
                placeholder="Cari ikhwan..."
                value={search1}
                onChange={e => setSearch1(e.target.value)}
                style={{ width: '100%', padding: '8px 8px 8px 32px', border: '1px solid #E8E3FF', borderRadius: 8, fontSize: 12, fontFamily: "'Nunito', sans-serif", outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {filteredIkhwan.map(u => {
              const selected = user1?.id === u.id;
              const colorIdx = Math.abs((u.id || '').charCodeAt(0)) % avatarGradients.length;
              return (
                <button
                  key={u.id}
                  onClick={() => setUser1(u)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 14px', border: 'none', borderBottom: '1px solid #F8F5FF',
                    background: selected ? '#E6F9F0' : 'white', cursor: 'pointer',
                    fontFamily: "'Nunito', sans-serif", textAlign: 'left', transition: 'background 0.12s',
                  }}
                >
                  <div className="admin-avatar" style={{ background: avatarGradients[colorIdx], width: 30, height: 30, fontSize: 11 }}>
                    {initials(u.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#2D2A4A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || '—'}</p>
                    <p style={{ fontSize: 10, color: '#9896B0' }}>{u.city || '—'} • {u.age || '—'} th • {u.job || '—'}</p>
                  </div>
                  {selected && <CheckCircle size={16} color="#5EC994" />}
                </button>
              );
            })}
            {filteredIkhwan.length === 0 && (
              <p style={{ padding: '30px 16px', textAlign: 'center', fontSize: 12, color: '#9896B0' }}>Tidak ditemukan</p>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 }}>
          <motion.div
            animate={{ scale: user1 && user2 ? [1, 1.15, 1] : 1 }}
            transition={{ repeat: user1 && user2 ? Infinity : 0, duration: 1.5 }}
            style={{ width: 56, height: 56, borderRadius: '50%', background: user1 && user2 ? 'linear-gradient(135deg, #E07070, #F5A623)' : '#F0EEF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Heart size={24} color={user1 && user2 ? 'white' : '#9896B0'} />
          </motion.div>
          <ArrowRight size={20} color="#9896B0" />
        </div>

        {/* Akhwat picker */}
        <div className="admin-card">
          <div className="admin-card-header" style={{ background: '#FCE7F3' }}>
            <div className="admin-card-title" style={{ color: '#9D174D' }}>
              🧕 Pilih Akhwat
            </div>
            <span style={{ fontSize: 11, color: '#5E5A7A', fontWeight: 600 }}>{akhwatList.length} tersedia</span>
          </div>

          {/* Selected */}
          {user2 && (
            <div style={{ padding: '12px 16px', background: '#E6F9F0', borderBottom: '1px solid #A3E6C4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="admin-avatar" style={{ background: avatarGradients[Math.abs((user2.id || '').charCodeAt(0)) % avatarGradients.length] }}>
                  {initials(user2.name)}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1E7A50' }}>{user2.name || '—'}</p>
                  <p style={{ fontSize: 11, color: '#5EC994' }}>{user2.city || '—'} • {user2.age || '—'} th</p>
                </div>
              </div>
              <button onClick={() => setUser2(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} color="#1E7A50" />
              </button>
            </div>
          )}

          {/* Search */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0EEF8' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9896B0' }} />
              <input
                placeholder="Cari akhwat..."
                value={search2}
                onChange={e => setSearch2(e.target.value)}
                style={{ width: '100%', padding: '8px 8px 8px 32px', border: '1px solid #E8E3FF', borderRadius: 8, fontSize: 12, fontFamily: "'Nunito', sans-serif", outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {filteredAkhwat.map(u => {
              const selected = user2?.id === u.id;
              const colorIdx = Math.abs((u.id || '').charCodeAt(0)) % avatarGradients.length;
              return (
                <button
                  key={u.id}
                  onClick={() => setUser2(u)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 14px', border: 'none', borderBottom: '1px solid #F8F5FF',
                    background: selected ? '#E6F9F0' : 'white', cursor: 'pointer',
                    fontFamily: "'Nunito', sans-serif", textAlign: 'left', transition: 'background 0.12s',
                  }}
                >
                  <div className="admin-avatar" style={{ background: avatarGradients[colorIdx], width: 30, height: 30, fontSize: 11 }}>
                    {initials(u.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#2D2A4A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || '—'}</p>
                    <p style={{ fontSize: 10, color: '#9896B0' }}>{u.city || '—'} • {u.age || '—'} th • {u.job || '—'}</p>
                  </div>
                  {selected && <CheckCircle size={16} color="#5EC994" />}
                </button>
              );
            })}
            {filteredAkhwat.length === 0 && (
              <p style={{ padding: '30px 16px', textAlign: 'center', fontSize: 12, color: '#9896B0' }}>Tidak ditemukan</p>
            )}
          </div>
        </div>
      </div>

      {/* Match button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
        <button
          className="admin-btn admin-btn-primary"
          onClick={handleMatch}
          disabled={!user1 || !user2 || actionLoading}
          style={{
            padding: '14px 32px', fontSize: 15, borderRadius: 14,
            opacity: user1 && user2 ? 1 : 0.5,
            cursor: user1 && user2 ? 'pointer' : 'not-allowed',
          }}
        >
          <Heart size={18} /> Pasangkan Ta'aruf
        </button>
      </motion.div>
    </AdminLayout>
  );
}
