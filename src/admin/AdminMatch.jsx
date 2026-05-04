import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Users, Search, RefreshCw, CheckCircle,
  AlertCircle, X, ArrowRight, Eye, Clock,
  MapPin, Briefcase, GraduationCap, BookOpen, Star,
  Activity, Home, Baby, Wallet, Sparkles, XCircle,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminGetProfiles, adminCreateTaarufPair, adminGetRooms, adminCloseRoom } from '../lib/adminDB';
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

// ── Compatibility scoring ────────────────────────────────────
function calcCompatibility(u1, u2) {
  if (!u1 || !u2) return { score: 0, details: [] };
  let score = 0;
  let max = 0;
  const details = [];

  // City match
  max += 15;
  if (u1.city && u2.city && u1.city.toLowerCase() === u2.city.toLowerCase()) {
    score += 15;
    details.push({ label: 'Kota sama', match: true });
  } else if (u1.city && u2.city) {
    details.push({ label: 'Kota berbeda', match: false });
  }

  // Age range (within 5 years = good, 10 = ok)
  max += 15;
  const calcAge = (bd) => { if (!bd) return 0; const t = new Date(), b = new Date(bd); let a = t.getFullYear() - b.getFullYear(); if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--; return a; };
  const a1 = calcAge(u1.birth_date);
  const a2 = calcAge(u2.birth_date);
  if (a1 && a2) {
    const diff = Math.abs(a1 - a2);
    if (diff <= 5) { score += 15; details.push({ label: `Selisih usia ${diff} th`, match: true }); }
    else if (diff <= 10) { score += 8; details.push({ label: `Selisih usia ${diff} th`, match: 'partial' }); }
    else { details.push({ label: `Selisih usia ${diff} th`, match: false }); }
  }

  // Vision: living
  max += 10;
  if (u1.vision_living && u2.vision_living && u1.vision_living === u2.vision_living) {
    score += 10;
    details.push({ label: 'Visi tempat tinggal sama', match: true });
  } else if (u1.vision_living && u2.vision_living) {
    if (u1.vision_living === 'Fleksibel' || u2.vision_living === 'Fleksibel') {
      score += 6;
      details.push({ label: 'Visi tinggal fleksibel', match: 'partial' });
    } else {
      details.push({ label: 'Visi tinggal berbeda', match: false });
    }
  }

  // Vision: finance
  max += 10;
  if (u1.vision_finance && u2.vision_finance && u1.vision_finance === u2.vision_finance) {
    score += 10;
    details.push({ label: 'Visi keuangan sama', match: true });
  } else if (u1.vision_finance && u2.vision_finance) {
    score += 4;
    details.push({ label: 'Visi keuangan berbeda', match: 'partial' });
  }

  // Vision: parenting
  max += 10;
  if (u1.vision_parenting && u2.vision_parenting && u1.vision_parenting === u2.vision_parenting) {
    score += 10;
    details.push({ label: 'Visi parenting sama', match: true });
  } else if (u1.vision_parenting && u2.vision_parenting) {
    score += 4;
    details.push({ label: 'Visi parenting berbeda', match: 'partial' });
  }

  // Hobbies overlap
  max += 10;
  const h1 = u1.hobbies || [];
  const h2 = u2.hobbies || [];
  const hobbyOverlap = h1.filter(h => h2.includes(h));
  if (hobbyOverlap.length >= 3) { score += 10; details.push({ label: `${hobbyOverlap.length} hobi sama`, match: true }); }
  else if (hobbyOverlap.length >= 1) { score += 5; details.push({ label: `${hobbyOverlap.length} hobi sama`, match: 'partial' }); }
  else if (h1.length && h2.length) { details.push({ label: 'Tidak ada hobi sama', match: false }); }

  // Deal breakers check
  max += 20;
  const db1 = u1.deal_breakers || [];
  const db2 = u2.deal_breakers || [];
  let dealBreakerConflict = false;
  if (db1.includes('Perokok') && u2.smoking) dealBreakerConflict = true;
  if (db2.includes('Perokok') && u1.smoking) dealBreakerConflict = true;
  if (!dealBreakerConflict) {
    score += 20;
    details.push({ label: 'Tidak ada deal breaker', match: true });
  } else {
    details.push({ label: '⚠️ Ada deal breaker!', match: false });
  }

  // Ibadah compatibility (salat)
  max += 10;
  if (u1.salat && u2.salat) {
    if (u1.salat === u2.salat) { score += 10; details.push({ label: 'Level ibadah setara', match: true }); }
    else { score += 5; details.push({ label: 'Level ibadah berbeda', match: 'partial' }); }
  }

  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return { score: pct, details };
}

// ── Spec badge ───────────────────────────────────────────────
function SpecBadge({ icon: Icon, label, value, color = '#5E5A7A' }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 8, background: '#F8F5FF', fontSize: 10, color, fontWeight: 600 }}>
      <Icon size={11} />
      <span>{label}: <strong>{typeof value === 'string' ? value : JSON.stringify(value)}</strong></span>
    </div>
  );
}

export default function AdminMatch() {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [user1, setUser1] = useState(null);
  const [user2, setUser2] = useState(null);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [detailUser, setDetailUser] = useState(null);
  const [tab, setTab] = useState('match'); // 'match' | 'pairs'
  const [showConfirmMatch, setShowConfirmMatch] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profilesData, roomsData] = await Promise.all([
        adminGetProfiles(),
        adminGetRooms(),
      ]);
      setUsers(profilesData);
      setRooms(roomsData);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Users in active rooms
  const activeRoomUserIds = new Set();
  rooms.filter(r => r.status === 'active').forEach(r => {
    if (r.user1_id) activeRoomUserIds.add(r.user1_id);
    if (r.user2_id) activeRoomUserIds.add(r.user2_id);
  });

  // Available users = verified + cv_done + not suspended + not in active room
  const availableUsers = users.filter(u => u.verified && u.cv_done && !u.suspended && !activeRoomUserIds.has(u.id));
  const ikhwanList = availableUsers.filter(u => u.gender === 'ikhwan');
  const akhwatList = availableUsers.filter(u => u.gender === 'akhwat');

  const filteredIkhwan = ikhwanList.filter(u =>
    !search1 || (u.name || '').toLowerCase().includes(search1.toLowerCase()) || (u.city || '').toLowerCase().includes(search1.toLowerCase())
  );
  const filteredAkhwat = akhwatList.filter(u =>
    !search2 || (u.name || '').toLowerCase().includes(search2.toLowerCase()) || (u.city || '').toLowerCase().includes(search2.toLowerCase())
  );

  const compat = calcCompatibility(user1, user2);

  const handleMatch = async () => {
    if (!user1 || !user2) return;
    setShowConfirmMatch(false);
    setActionLoading(true);
    setErrorMsg('');
    try {
      console.log('[AdminMatch] Creating pair:', user1.id, user2.id);
      const result = await adminCreateTaarufPair(user1.id, user2.id);
      console.log('[AdminMatch] Pair created:', result);
      setSuccessMsg(`✅ Berhasil! Ruang ta'aruf telah dibuat untuk ${(user1.name || '').split(' ')[0]} & ${(user2.name || '').split(' ')[0]}. User akan melihat ruang di menu Ta'aruf mereka.`);
      setUser1(null);
      setUser2(null);
      loadData();
    } catch (err) {
      console.error('[AdminMatch] Error creating pair:', err);
      setErrorMsg(`Gagal membuat pasangan: ${err?.message || String(err)}`);
    }
    setActionLoading(false);
  };

  const handleCloseRoom = async (roomId) => {
    setActionLoading(true);
    try {
      await adminCloseRoom(roomId);
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'closed' } : r));
    } catch (err) {
      setErrorMsg(`Gagal menutup ruang: ${err?.message || ''}`);
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
          <button className="admin-btn admin-btn-primary" onClick={loadData}><RefreshCw size={14} /> Coba Lagi</button>
        </div>
      </AdminLayout>
    );
  }

  const activeRooms = rooms.filter(r => r.status === 'active');
  const closedRooms = rooms.filter(r => r.status === 'closed');

  return (
    <AdminLayout title="Pasangkan Ta'aruf">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setTab('match')}
            style={{
              padding: '8px 18px', borderRadius: 10, border: `2px solid ${tab === 'match' ? '#9B89CC' : '#E8E3FF'}`,
              background: tab === 'match' ? '#F0EBFF' : 'white', color: tab === 'match' ? '#7E6BAF' : '#5E5A7A',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
            }}
          >
            💕 Pasangkan ({ikhwanList.length}♂ / {akhwatList.length}♀)
          </button>
          <button
            onClick={() => setTab('pairs')}
            style={{
              padding: '8px 18px', borderRadius: 10, border: `2px solid ${tab === 'pairs' ? '#5EC994' : '#E8E3FF'}`,
              background: tab === 'pairs' ? '#E6F9F0' : 'white', color: tab === 'pairs' ? '#1E7A50' : '#5E5A7A',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
            }}
          >
            💍 Pasangan Aktif ({activeRooms.length})
          </button>
        </div>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Success message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
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
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: '#FFF0F0', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #FFBDBD' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} color="#8B0000" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#8B0000' }}>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={16} color="#8B0000" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {tab === 'match' && (
        <>
          {/* Info banner */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'linear-gradient(135deg, #EAE3FF, #DBEAFE)', borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, border: '1px solid #D4C5FF' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #9B89CC, #63A8D8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Heart size={20} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#2D2A4A' }}>Pasangkan User untuk Ta'aruf</p>
              <p style={{ fontSize: 12, color: '#5E5A7A' }}>
                Pilih satu Ikhwan dan satu Akhwat yang sudah terverifikasi. Klik "Detail" untuk melihat spesifikasi lengkap.
                Ruang ta'aruf akan otomatis dibuat & muncul di menu user.
              </p>
            </div>
          </motion.div>

          {/* Selection grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'start' }}>
            {/* Ikhwan picker */}
            <UserPickerPanel
              title="🧔 Pilih Ikhwan"
              titleColor="#1A5CB5"
              headerBg="#DBEAFE"
              users={filteredIkhwan}
              selected={user1}
              onSelect={setUser1}
              search={search1}
              onSearch={setSearch1}
              total={ikhwanList.length}
              onDetail={setDetailUser}
            />

            {/* Center: Compatibility */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10, minWidth: 90 }}>
              <motion.div
                animate={{ scale: user1 && user2 ? [1, 1.12, 1] : 1 }}
                transition={{ repeat: user1 && user2 ? Infinity : 0, duration: 1.5 }}
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: user1 && user2
                    ? (compat.score >= 70 ? 'linear-gradient(135deg, #5EC994, #3DB878)' : compat.score >= 40 ? 'linear-gradient(135deg, #F5A623, #E08B00)' : 'linear-gradient(135deg, #E07070, #C05050)')
                    : '#F0EEF8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                }}
              >
                {user1 && user2 ? (
                  <span style={{ color: 'white', fontSize: 18, fontWeight: 800, fontFamily: "'Quicksand', sans-serif" }}>{compat.score}%</span>
                ) : (
                  <Heart size={24} color="#9896B0" />
                )}
              </motion.div>
              {user1 && user2 && (
                <span style={{ fontSize: 10, fontWeight: 700, color: compat.score >= 70 ? '#1E7A50' : compat.score >= 40 ? '#8B5E00' : '#8B0000', textAlign: 'center' }}>
                  {compat.score >= 70 ? 'Cocok!' : compat.score >= 40 ? 'Cukup' : 'Kurang'}
                </span>
              )}
              <ArrowRight size={18} color="#9896B0" />
            </div>

            {/* Akhwat picker */}
            <UserPickerPanel
              title="🧕 Pilih Akhwat"
              titleColor="#9D174D"
              headerBg="#FCE7F3"
              users={filteredAkhwat}
              selected={user2}
              onSelect={setUser2}
              search={search2}
              onSearch={setSearch2}
              total={akhwatList.length}
              onDetail={setDetailUser}
            />
          </div>

          {/* Compatibility details */}
          {user1 && user2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 20, background: 'white', borderRadius: 16, border: '1px solid #E8E3FF', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', background: '#F8F5FF', borderBottom: '1px solid #E8E3FF' }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#2D2A4A', fontFamily: "'Quicksand', sans-serif" }}>
                  📊 Detail Kompatibilitas: {(user1.name || '').split(' ')[0]} & {(user2.name || '').split(' ')[0]}
                </p>
              </div>
              <div style={{ padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {compat.details.map((d, i) => (
                  <div key={i} style={{
                    padding: '5px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                    background: d.match === true ? '#E6F9F0' : d.match === 'partial' ? '#FFF3E0' : '#FFF0F0',
                    color: d.match === true ? '#1E7A50' : d.match === 'partial' ? '#8B5E00' : '#8B0000',
                    border: `1px solid ${d.match === true ? '#A3E6C4' : d.match === 'partial' ? '#FFD699' : '#FFBDBD'}`,
                    fontFamily: "'Nunito', sans-serif",
                  }}>
                    {d.match === true ? '✓' : d.match === 'partial' ? '◌' : '✗'} {d.label}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Match button */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => setShowConfirmMatch(true)}
              disabled={!user1 || !user2 || actionLoading}
              style={{
                padding: '14px 32px', fontSize: 15, borderRadius: 14,
                opacity: user1 && user2 ? 1 : 0.5,
                cursor: user1 && user2 ? 'pointer' : 'not-allowed',
              }}
            >
              {actionLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                  Memproses...
                </span>
              ) : (
                <><Heart size={18} /> Pasangkan Ta'aruf</>
              )}
            </button>
          </motion.div>
        </>
      )}

      {tab === 'pairs' && (
        <div>
          {/* Active Pairs */}
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#2D2A4A', marginBottom: 14, fontFamily: "'Quicksand', sans-serif" }}>
            💕 Pasangan Aktif ({activeRooms.length})
          </h3>
          {activeRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9896B0', fontSize: 13, background: 'white', borderRadius: 16, border: '1px solid #E8E3FF' }}>
              <Users size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              Belum ada pasangan aktif
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {activeRooms.map(r => (
                <PairCard key={r.id} room={r} onClose={handleCloseRoom} actionLoading={actionLoading} />
              ))}
            </div>
          )}

          {/* Closed Pairs */}
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#2D2A4A', marginBottom: 14, marginTop: 16, fontFamily: "'Quicksand', sans-serif" }}>
            ✅ Riwayat Pasangan ({closedRooms.length})
          </h3>
          {closedRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9896B0', fontSize: 13, background: 'white', borderRadius: 16, border: '1px solid #E8E3FF' }}>
              Belum ada riwayat
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {closedRooms.map(r => (
                <PairCard key={r.id} room={r} closed />
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Detail Drawer */}
      <AnimatePresence>
        {detailUser && (
          <UserSpecDrawer user={detailUser} onClose={() => setDetailUser(null)} />
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmMatch && user1 && user2 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(45,42,74,0.6)', backdropFilter: 'blur(6px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowConfirmMatch(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: 20, padding: '28px 32px', maxWidth: 420, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #E07070, #F5A623)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={28} color="white" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#2D2A4A', marginBottom: 8, fontFamily: "'Quicksand', sans-serif" }}>Pasangkan Ta'aruf?</h3>
              <p style={{ fontSize: 13, color: '#5E5A7A', marginBottom: 20, lineHeight: 1.6 }}>
                Yakin ingin memasangkan <strong>{user1.name}</strong> ({user1.gender === 'ikhwan' ? '♂' : '♀'}) dengan <strong>{user2.name}</strong> ({user2.gender === 'akhwat' ? '♀' : '♂'})?
                <br /><br />
                Ruang ta'aruf akan dibuat dan kedua user akan melihatnya di dashboard mereka.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  onClick={() => setShowConfirmMatch(false)}
                  style={{ padding: '10px 24px', borderRadius: 12, border: '1px solid #E8E3FF', background: 'white', color: '#5E5A7A', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}
                >
                  Batal
                </button>
                <button
                  onClick={handleMatch}
                  className="admin-btn admin-btn-primary"
                  style={{ padding: '10px 24px', borderRadius: 12, fontSize: 13 }}
                >
                  <Heart size={14} /> Ya, Pasangkan!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

// ── User Picker Panel ────────────────────────────────────────
function UserPickerPanel({ title, titleColor, headerBg, users, selected, onSelect, search, onSearch, total, onDetail }) {
  return (
    <div className="admin-card" style={{ overflow: 'hidden' }}>
      <div className="admin-card-header" style={{ background: headerBg }}>
        <div className="admin-card-title" style={{ color: titleColor }}>{title}</div>
        <span style={{ fontSize: 11, color: '#5E5A7A', fontWeight: 600 }}>{total} tersedia</span>
      </div>

      {/* Selected preview */}
      {selected && (
        <div style={{ padding: '10px 14px', background: '#E6F9F0', borderBottom: '1px solid #A3E6C4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="admin-avatar" style={{ background: avatarGradients[Math.abs((selected.id || '').charCodeAt(0)) % avatarGradients.length], width: 28, height: 28, fontSize: 10 }}>
              {initials(selected.name)}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1E7A50' }}>{selected.name || '—'}</p>
              <p style={{ fontSize: 10, color: '#5EC994' }}>{selected.city || '—'} • {(() => { if (!selected.birth_date) return '—'; const t = new Date(), b = new Date(selected.birth_date); let a = t.getFullYear() - b.getFullYear(); if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--; return a; })()} th</p>
            </div>
          </div>
          <button onClick={() => onSelect(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={14} color="#1E7A50" />
          </button>
        </div>
      )}

      {/* Search */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #F0EEF8' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#9896B0' }} />
          <input
            placeholder="Cari nama/kota..."
            value={search}
            onChange={e => onSearch(e.target.value)}
            style={{ width: '100%', padding: '7px 7px 7px 28px', border: '1px solid #E8E3FF', borderRadius: 8, fontSize: 11, fontFamily: "'Nunito', sans-serif", outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        {users.map(u => {
          const isSelected = selected?.id === u.id;
          const colorIdx = Math.abs((u.id || '').charCodeAt(0)) % avatarGradients.length;
          const completeness = [u.city, u.birth_date, u.job, u.education, u.salat, u.vision_living].filter(Boolean).length;
          return (
            <div
              key={u.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '8px 12px', borderBottom: '1px solid #F8F5FF',
                background: isSelected ? '#E6F9F0' : 'white',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              <button
                onClick={() => onSelect(u)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
              >
                <div className="admin-avatar" style={{ background: avatarGradients[colorIdx], width: 28, height: 28, fontSize: 10 }}>
                  {initials(u.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#2D2A4A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || '—'}</p>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                    {u.city && <span style={{ fontSize: 9, color: '#9896B0' }}>📍{u.city}</span>}
                    {u.birth_date && <span style={{ fontSize: 9, color: '#9896B0' }}>• {(() => { const t = new Date(), b = new Date(u.birth_date); let a = t.getFullYear() - b.getFullYear(); if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--; return a; })()}th</span>}
                    {u.job && <span style={{ fontSize: 9, color: '#9896B0' }}>• {u.job}</span>}
                  </div>
                  {/* Spec completeness bar */}
                  <div style={{ width: 40, height: 3, borderRadius: 2, background: '#E8E3FF', marginTop: 3 }}>
                    <div style={{ width: `${(completeness / 6) * 100}%`, height: 3, borderRadius: 2, background: completeness >= 4 ? '#5EC994' : completeness >= 2 ? '#F5A623' : '#E07070' }} />
                  </div>
                </div>
                {isSelected && <CheckCircle size={14} color="#5EC994" />}
              </button>
              <button
                onClick={() => onDetail(u)}
                style={{ border: 'none', background: '#F0EBFF', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Lihat detail spesifikasi"
              >
                <Eye size={12} color="#7E6BAF" />
              </button>
            </div>
          );
        })}
        {users.length === 0 && (
          <p style={{ padding: '30px 14px', textAlign: 'center', fontSize: 11, color: '#9896B0' }}>Tidak ditemukan</p>
        )}
      </div>
    </div>
  );
}

// ── Pair Card ────────────────────────────────────────────────
function PairCard({ room, onClose, actionLoading, closed }) {
  const u1 = room.user1;
  const u2 = room.user2;
  const c1 = Math.abs((room.user1_id || '').charCodeAt(0)) % avatarGradients.length;
  const c2 = Math.abs((room.user2_id || '').charCodeAt(0)) % avatarGradients.length;
  const remainMs = room.expires_at ? Math.max(0, new Date(room.expires_at).getTime() - Date.now()) : 0;
  const remainDays = Math.floor(remainMs / 86400000);
  const remainHours = Math.floor((remainMs % 86400000) / 3600000);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'white', borderRadius: 14, border: `1px solid ${closed ? '#E8E3FF' : '#A3E6C4'}`, overflow: 'hidden', opacity: closed ? 0.7 : 1 }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* User 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="admin-avatar" style={{ background: avatarGradients[c1], width: 32, height: 32, fontSize: 11 }}>
              {initials(u1?.name)}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#2D2A4A' }}>{u1?.name || '—'}</p>
              <p style={{ fontSize: 10, color: '#9896B0' }}>{u1?.city || '—'} • {u1?.gender === 'ikhwan' ? '♂' : '♀'}</p>
            </div>
          </div>

          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: closed ? '#E8E3FF' : 'linear-gradient(135deg, #E07070, #F5A623)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Heart size={13} color={closed ? '#9896B0' : 'white'} />
          </div>

          {/* User 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="admin-avatar" style={{ background: avatarGradients[c2], width: 32, height: 32, fontSize: 11 }}>
              {initials(u2?.name)}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#2D2A4A' }}>{u2?.name || '—'}</p>
              <p style={{ fontSize: 10, color: '#9896B0' }}>{u2?.city || '—'} • {u2?.gender === 'akhwat' ? '♀' : '♂'}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!closed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 10, background: remainDays <= 2 ? '#FFF0F0' : '#E6F9F0' }}>
              <Clock size={11} color={remainDays <= 2 ? '#E07070' : '#5EC994'} />
              <span style={{ fontSize: 11, fontWeight: 700, color: remainDays <= 2 ? '#8B0000' : '#1E7A50' }}>
                {remainDays}h {remainHours}j
              </span>
            </div>
          )}
          {closed && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#7E6BAF', padding: '4px 10px', background: '#F0EBFF', borderRadius: 10 }}>Selesai</span>
          )}
          {!closed && onClose && (
            <button
              onClick={() => onClose(room.id)}
              disabled={actionLoading}
              style={{ border: '1px solid #E07070', background: '#FFF0F0', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#8B0000', fontFamily: "'Nunito', sans-serif" }}
            >
              <XCircle size={11} /> Tutup
            </button>
          )}
        </div>
      </div>
      <div style={{ padding: '0 16px 10px', display: 'flex', gap: 6, fontSize: 10, color: '#9896B0' }}>
        <span>Dibuat: {new Date(room.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <span>•</span>
        <span>Durasi: {room.duration_days || 7} hari</span>
      </div>
    </motion.div>
  );
}

// ── User Spec Detail Drawer ──────────────────────────────────
function UserSpecDrawer({ user, onClose }) {
  if (!user) return null;
  const colorIdx = Math.abs((user.id || '').charCodeAt(0)) % avatarGradients.length;
  const status = user.verified && user.cv_done && !user.suspended ? 'Aktif' : !user.verified ? 'Belum Verif' : 'Pending';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(45,42,74,0.5)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{ width: 400, maxWidth: '90vw', height: '100vh', background: 'white', overflowY: 'auto', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #2D2A4A, #4A3D7A)', padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="admin-avatar" style={{ background: avatarGradients[colorIdx], width: 48, height: 48, fontSize: 16 }}>
            {initials(user.name)}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'white', fontFamily: "'Quicksand', sans-serif" }}>{user.name || '—'}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{user.email}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="white" />
          </button>
        </div>

        {/* Status badge */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #F0EEF8', display: 'flex', gap: 8 }}>
          <span style={{
            padding: '4px 12px', borderRadius: 10, fontSize: 11, fontWeight: 800,
            background: status === 'Aktif' ? '#E6F9F0' : '#FFF0F0',
            color: status === 'Aktif' ? '#1E7A50' : '#8B0000',
            border: `1px solid ${status === 'Aktif' ? '#A3E6C4' : '#FFBDBD'}`,
          }}>
            {status}
          </span>
          <span style={{ padding: '4px 12px', borderRadius: 10, fontSize: 11, fontWeight: 800, background: '#DBEAFE', color: '#1A5CB5', border: '1px solid #93C3E8' }}>
            {user.gender === 'ikhwan' ? '🧔 Ikhwan' : '🧕 Akhwat'}
          </span>
          {user.membership_tier && user.membership_tier !== 'regular' && (
            <span style={{ padding: '4px 12px', borderRadius: 10, fontSize: 11, fontWeight: 800, background: '#FFF3E0', color: '#8B5E00', border: '1px solid #FFD699' }}>
              ⭐ {user.membership_tier}
            </span>
          )}
        </div>

        {/* Specs */}
        <div style={{ padding: '16px 20px' }}>
          <Section title="📋 Data Pribadi">
            <SpecRow icon={MapPin} label="Kota" value={user.city} />
            <SpecRow icon={Activity} label="TTL" value={user.birth_place && user.birth_date ? `${user.birth_place}, ${new Date(user.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : null} />
            <SpecRow icon={Activity} label="Usia" value={user.birth_date ? (() => { const t = new Date(), b = new Date(user.birth_date); let a = t.getFullYear() - b.getFullYear(); if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--; return `${a} tahun`; })() : null} />
            <SpecRow icon={Briefcase} label="Pekerjaan" value={user.job} />
            <SpecRow icon={GraduationCap} label="Pendidikan" value={user.education} />
            <SpecRow icon={Wallet} label="Penghasilan" value={user.income_range} />
            <SpecRow icon={Activity} label="Gol. Darah" value={user.blood_type} />
          </Section>

          <Section title="🕌 Ibadah">
            <SpecRow icon={BookOpen} label="Shalat" value={user.salat} />
            <SpecRow icon={BookOpen} label="Tilawah" value={user.tilawah} />
            <SpecRow icon={Star} label="Mazhab" value={user.mazhab} />
          </Section>

          <Section title="🏠 Visi Kehidupan">
            <SpecRow icon={Home} label="Tempat Tinggal" value={user.vision_living} />
            <SpecRow icon={Baby} label="Parenting" value={user.vision_parenting} />
            <SpecRow icon={Wallet} label="Keuangan" value={user.vision_finance} />
          </Section>

          <Section title="🎯 Gaya Hidup">
            <SpecRow icon={Activity} label="Olahraga" value={user.exercise} />
            <SpecRow icon={Activity} label="Merokok" value={user.smoking ? 'Ya' : 'Tidak'} />
            {user.bio && <SpecRow icon={BookOpen} label="Bio" value={user.bio} />}
          </Section>

          {(user.hobbies?.length > 0) && (
            <Section title="✨ Hobi">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {user.hobbies.map((h, i) => (
                  <span key={i} style={{ padding: '3px 10px', borderRadius: 8, background: '#F0EBFF', color: '#7E6BAF', fontSize: 11, fontWeight: 700 }}>{h}</span>
                ))}
              </div>
            </Section>
          )}

          {(user.deal_breakers?.length > 0) && (
            <Section title="🚫 Deal Breakers">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {user.deal_breakers.map((d, i) => (
                  <span key={i} style={{ padding: '3px 10px', borderRadius: 8, background: '#FFF0F0', color: '#8B0000', fontSize: 11, fontWeight: 700 }}>⛔ {d}</span>
                ))}
              </div>
            </Section>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: 13, fontWeight: 800, color: '#2D2A4A', marginBottom: 8, fontFamily: "'Quicksand', sans-serif" }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}

function SpecRow({ icon: Icon, label, value }) {
  if (!value) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      <Icon size={13} color="#D4C5FF" />
      <span style={{ fontSize: 12, color: '#D4C5FF' }}>{label}: —</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      <Icon size={13} color="#7E6BAF" />
      <span style={{ fontSize: 12, color: '#5E5A7A' }}>{label}: <strong style={{ color: '#2D2A4A' }}>{value}</strong></span>
    </div>
  );
}
