import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, BookOpen, Heart, Eye, Star, Edit3,
  MapPin, Briefcase, GraduationCap, CheckCircle, Moon,
  Shield, Clock, X, Save, LogOut, Settings, ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProfileAvatar } from '../components/Avatar';
import BottomNav from '../components/BottomNav';

export default function MyProfile() {
  const navigate = useNavigate();
  const { user, updateUser, updateCV, logout } = useApp();
  const cv = user.cv;

  const [editSection, setEditSection] = useState(null); // 'personal'|'ibadah'|'kesehatan'|'visi'|'profile'
  const [editData, setEditData] = useState({});
  const [showLogout, setShowLogout] = useState(false);

  const steps = [
    { key: 'verified',   label: 'Identitas Terverifikasi', icon: Shield,       done: user.verified,       path: '/verify' },
    { key: 'akad',       label: 'Akad Ditandatangani',     icon: CheckCircle,  done: user.akadSigned,     path: '/akad' },
    { key: 'readiness',  label: 'Uji Kesiapan Selesai',   icon: Star,         done: user.readinessDone,  path: '/readiness' },
    { key: 'cv',         label: 'CV Digital Lengkap',      icon: User,         done: user.cvDone,         path: '/cv-builder' },
  ];

  const completedSteps = steps.filter(s => s.done).length;
  const completionPct = Math.round((completedSteps / steps.length) * 100);

  const openEdit = (section) => {
    const data = {
      personal: { fullName: cv.fullName, age: cv.age, city: cv.city, education: cv.education, job: cv.job, incomeRange: cv.incomeRange, bio: cv.bio },
      ibadah:   { salat: cv.salat, tilawah: cv.tilawah, mazhab: cv.mazhab },
      kesehatan: { bloodType: cv.bloodType, smoking: cv.smoking, exercise: cv.exercise },
      visi:     { visionLiving: cv.visionLiving, visionParenting: cv.visionParenting, visionFinance: cv.visionFinance },
      profile:  { name: user.name, email: user.email },
    };
    setEditData(data[section] || {});
    setEditSection(section);
  };

  const saveEdit = () => {
    if (editSection === 'profile') {
      updateUser({ name: editData.name, email: editData.email });
    } else {
      updateCV(editData);
    }
    setEditSection(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #9B89CC, #63A8D8)', padding: '48px 20px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -30, right: -20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Profil Saya</p>
            <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>
              {user.name || cv.fullName || 'Pengguna Baru'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              {cv.city || '—'} • {cv.job || '—'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => openEdit('profile')}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'white', fontSize: 12, fontWeight: 700 }}>
              <Settings size={15} /> Edit
            </button>
            <button onClick={() => setShowLogout(true)}
              style={{ background: 'rgba(255,0,0,0.2)', border: 'none', borderRadius: 12, padding: '8px 10px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <LogOut size={15} color="white" />
            </button>
          </div>
        </div>
      </div>

      <div className="my-profile-content" style={{ padding: '0 16px 100px', marginTop: -24 }}>
        {/* Left col: Completion + Steps */}
        <div>
          {/* Completion card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '20px', marginBottom: 16, boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 2 }}>Kelengkapan Akun</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: completionPct === 100 ? 'var(--success)' : 'var(--purple-400)' }}>
                  {completionPct}%
                </p>
              </div>
              {completionPct < 100 && (
                <button className="btn btn-primary btn-sm" onClick={() => navigate(steps.find(s => !s.done)?.path || '/discover')}>
                  Lengkapi →
                </button>
              )}
            </div>
            <div style={{ height: 8, background: 'var(--purple-100)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${completionPct}%` }} transition={{ delay: 0.3, duration: 0.7 }}
                style={{ height: '100%', background: completionPct === 100 ? 'linear-gradient(135deg, var(--success), #3DB878)' : 'var(--gradient-primary)', borderRadius: 4 }} />
            </div>
            {steps.map((s, i) => {
              const Ic = s.icon;
              return (
                <button key={s.key} onClick={() => !s.done && navigate(s.path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < steps.length - 1 ? 10 : 0, width: '100%', background: 'none', border: 'none', cursor: s.done ? 'default' : 'pointer', padding: 0, textAlign: 'left' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: s.done ? '#E6F9F0' : 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Ic size={14} color={s.done ? 'var(--success)' : 'var(--purple-300)'} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: s.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {s.label}
                  </span>
                  {s.done ? <CheckCircle size={16} color="var(--success)" /> : <ChevronRight size={14} color="var(--purple-300)" />}
                </button>
              );
            })}
          </motion.div>

          {/* Readiness score */}
          {user.readinessDone && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '16px 20px', marginBottom: 16, boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="var(--purple-100)" strokeWidth="5" />
                  <circle cx="28" cy="28" r="22" fill="none" stroke="var(--purple-400)" strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 22 * user.readinessScore / 100} ${2 * Math.PI * 22}`}
                    strokeLinecap="round" transform="rotate(-90 28 28)" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--purple-500)' }}>{user.readinessScore}%</span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Skor Kesiapan</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {user.readinessScore >= 70 ? "MasyaAllah — siap ta'aruf!" : 'Terus tingkatkan persiapan'}
                </p>
                <button onClick={() => navigate('/readiness')} style={{ marginTop: 6, fontSize: 11, color: 'var(--purple-400)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Ulangi Tes →
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right col: CV Sections */}
        <div>
          {user.cvDone ? (
            <>
              <CVSection title="Data Personal" icon={User} color="var(--purple-400)" onEdit={() => openEdit('personal')}
                items={[
                  cv.fullName    && { label: 'Nama Lengkap', val: cv.fullName },
                  cv.age         && { label: 'Usia', val: cv.age + ' tahun' },
                  cv.city        && { label: 'Kota', val: cv.city },
                  cv.education   && { label: 'Pendidikan', val: cv.education },
                  cv.job         && { label: 'Pekerjaan', val: cv.job },
                  cv.incomeRange && { label: 'Penghasilan', val: cv.incomeRange },
                  cv.bio         && { label: 'Bio', val: cv.bio },
                ].filter(Boolean)} />

              <CVSection title="Ibadah" icon={BookOpen} color="var(--blue-500)" onEdit={() => openEdit('ibadah')}
                items={[
                  cv.salat   && { label: 'Shalat', val: cv.salat },
                  cv.tilawah && { label: 'Tilawah', val: cv.tilawah },
                  cv.mazhab  && { label: 'Mazhab', val: cv.mazhab },
                ].filter(Boolean)} />

              <CVSection title="Kesehatan" icon={Heart} color="var(--success)" onEdit={() => openEdit('kesehatan')}
                items={[
                  cv.bloodType && { label: 'Gol. Darah', val: cv.bloodType },
                  { label: 'Merokok', val: cv.smoking ? '🚬 Ya' : '🚭 Tidak' },
                  cv.exercise  && { label: 'Olahraga', val: cv.exercise },
                ].filter(Boolean)} />

              <CVSection title="Visi & Misi" icon={Eye} color="var(--warning)" onEdit={() => openEdit('visi')}
                items={[
                  cv.visionLiving    && { label: 'Tempat Tinggal', val: cv.visionLiving },
                  cv.visionParenting && { label: 'Parenting', val: cv.visionParenting },
                  cv.visionFinance   && { label: 'Keuangan RT', val: cv.visionFinance },
                ].filter(Boolean)} />
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '28px 20px', textAlign: 'center', boxShadow: 'var(--shadow-card)', marginBottom: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <User size={28} color="var(--purple-300)" />
              </div>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>CV Digital Belum Lengkap</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                Lengkapi CV digital Anda agar profil bisa ditemukan oleh calon pasangan
              </p>
              <button className="btn btn-primary btn-full" onClick={() => navigate('/cv-builder')}>
                <Edit3 size={15} /> Isi CV Sekarang
              </button>
            </motion.div>
          )}

          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/cv-builder')}
            className="btn btn-outline btn-full" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Edit3 size={16} /> Edit CV Digital Lengkap
          </motion.button>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editSection && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(45,42,74,0.5)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            onClick={() => setEditSection(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 520, background: 'white', borderRadius: '28px 28px 0 0', padding: '20px 24px 40px', maxHeight: '80dvh', overflowY: 'auto' }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 16px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 18, fontWeight: 700 }}>
                  Edit {editSection === 'personal' ? 'Data Personal' : editSection === 'ibadah' ? 'Data Ibadah' : editSection === 'kesehatan' ? 'Kesehatan' : editSection === 'visi' ? 'Visi & Misi' : 'Profil'}
                </h3>
                <button onClick={() => setEditSection(null)} style={{ background: 'var(--purple-50)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={16} color="var(--purple-400)" />
                </button>
              </div>

              <EditForm section={editSection} data={editData} onChange={setEditData} />

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={() => setEditSection(null)} style={{ flex: 1 }}>Batal</button>
                <button className="btn btn-primary" onClick={saveEdit} style={{ flex: 2 }}>
                  <Save size={15} /> Simpan Perubahan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout confirm */}
      <AnimatePresence>
        {showLogout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(45,42,74,0.5)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setShowLogout(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: 24, padding: 28, width: '100%', maxWidth: 340, textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#FFEFEF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <LogOut size={28} color="var(--danger)" />
              </div>
              <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Keluar dari Akun?</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                Data progres Anda akan tetap tersimpan di perangkat ini.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setShowLogout(false)} style={{ flex: 1 }}>Batal</button>
                <button className="btn btn-danger-outline" onClick={handleLogout} style={{ flex: 1 }}>Keluar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

function CVSection({ title, icon: Icon, color = 'var(--purple-400)', items, onEdit }) {
  if (!items.length) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'white', borderRadius: 'var(--radius-xl)', marginBottom: 14, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ padding: '12px 16px 10px', background: `${color}11`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={15} color={color} />
          <span style={{ fontSize: 11, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: 0.7 }}>{title}</span>
        </div>
        <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${color}18`, border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color, fontSize: 11, fontWeight: 700 }}>
          <Edit3 size={11} /> Edit
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.val}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{item.label}</span>
        </div>
      ))}
    </motion.div>
  );
}

function EditForm({ section, data, onChange }) {
  const set = (key, val) => onChange(prev => ({ ...prev, [key]: val }));

  if (section === 'profile') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="form-group">
        <label className="form-label">Nama Panggilan</label>
        <input className="form-input" value={data.name || ''} onChange={e => set('name', e.target.value)} placeholder="Nama panggilan" />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="form-input" type="email" value={data.email || ''} onChange={e => set('email', e.target.value)} placeholder="Email" />
      </div>
    </div>
  );

  if (section === 'personal') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[
        { key: 'fullName', label: 'Nama Lengkap', placeholder: 'Fulanah binti Fulan' },
        { key: 'age', label: 'Usia', placeholder: '24', type: 'number' },
        { key: 'city', label: 'Kota Domisili', placeholder: 'Jakarta Selatan' },
        { key: 'education', label: 'Pendidikan', placeholder: 'S1 Teknik Informatika' },
        { key: 'job', label: 'Pekerjaan', placeholder: 'Software Engineer' },
        { key: 'incomeRange', label: 'Penghasilan', placeholder: '5-10 juta/bulan' },
      ].map(f => (
        <div key={f.key} className="form-group">
          <label className="form-label">{f.label}</label>
          <input className="form-input" type={f.type || 'text'} value={data[f.key] || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} />
        </div>
      ))}
      <div className="form-group">
        <label className="form-label">Bio Singkat</label>
        <textarea className="form-input" rows={3} value={data.bio || ''} onChange={e => set('bio', e.target.value)} placeholder="Ceritakan sedikit tentang diri Anda..." style={{ resize: 'none' }} />
      </div>
    </div>
  );

  if (section === 'ibadah') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="form-group">
        <label className="form-label">Frekuensi Shalat</label>
        <select className="form-select" value={data.salat || ''} onChange={e => set('salat', e.target.value)}>
          <option value="">Pilih...</option>
          {['5 waktu berjamaah', '5 waktu', 'Hampir selalu', 'Sedang belajar'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Tilawah per hari</label>
        <select className="form-select" value={data.tilawah || ''} onChange={e => set('tilawah', e.target.value)}>
          <option value="">Pilih...</option>
          {['1 juz', '0.5 juz', '1 halaman', 'Beberapa ayat', 'Belum rutin'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Mazhab</label>
        <select className="form-select" value={data.mazhab || ''} onChange={e => set('mazhab', e.target.value)}>
          <option value="">Pilih...</option>
          {["Syafi'i", 'Hanafi', 'Maliki', 'Hanbali', 'Tidak terikat'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );

  if (section === 'kesehatan') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="form-group">
        <label className="form-label">Golongan Darah</label>
        <select className="form-select" value={data.bloodType || ''} onChange={e => set('bloodType', e.target.value)}>
          <option value="">Pilih...</option>
          {['A', 'B', 'AB', 'O', 'Tidak tahu'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Merokok</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ val: false, label: '🚭 Tidak Merokok' }, { val: true, label: '🚬 Perokok' }].map(opt => (
            <button key={String(opt.val)} type="button" onClick={() => set('smoking', opt.val)}
              style={{ flex: 1, padding: '12px', borderRadius: 12, border: `2px solid ${data.smoking === opt.val ? 'var(--purple-400)' : 'var(--border)'}`, background: data.smoking === opt.val ? 'var(--purple-50)' : 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Olahraga Rutin</label>
        <select className="form-select" value={data.exercise || ''} onChange={e => set('exercise', e.target.value)}>
          <option value="">Pilih...</option>
          {['Setiap hari', '3-5x seminggu', '1-2x seminggu', 'Jarang', 'Tidak'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );

  if (section === 'visi') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="form-group">
        <label className="form-label">Rencana Tempat Tinggal</label>
        <select className="form-select" value={data.visionLiving || ''} onChange={e => set('visionLiving', e.target.value)}>
          <option value="">Pilih...</option>
          {['Ikuti suami', 'Dekat keluarga istri', 'Di kota kerja', 'Fleksibel'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Pola Asuh Anak</label>
        <select className="form-select" value={data.visionParenting || ''} onChange={e => set('visionParenting', e.target.value)}>
          <option value="">Pilih...</option>
          {['Homeschooling Islami', 'Pesantren', 'Sekolah Islam', 'Sekolah umum + ngaji', 'Diskusi bersama pasangan'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Manajemen Keuangan RT</label>
        <select className="form-select" value={data.visionFinance || ''} onChange={e => set('visionFinance', e.target.value)}>
          <option value="">Pilih...</option>
          {['Suami menanggung semua', 'Istri ikut berkontribusi', 'Terpisah tapi adil', 'Bersama & transparan'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );

  return null;
}
