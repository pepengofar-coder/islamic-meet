import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, User, Eye, EyeOff, ShieldCheck, Moon,
  BarChart2, Shield, AlertTriangle, ArrowRight, Users,
} from 'lucide-react';

// Admin credentials from environment variables
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'islamicmeet_admin';
const ADMIN_PASS     = import.meta.env.VITE_ADMIN_SECRET   || 'IslamicMeet@2026!';

const STATS = [
  { icon: Users,     value: '1,284', label: 'Total Pendaftar' },
  { icon: BarChart2, value: '92%',   label: 'Tingkat Verifikasi' },
  { icon: Shield,    value: '0',     label: 'Insiden Aktif' },
];

const FEATURES = [
  'Manajemen pendaftar & verifikasi identitas',
  'Monitoring ruang ta\'aruf real-time',
  'Laporan & analitik platform',
  'Pengelolaan konten & laporan pelanggaran',
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [pass, setPass]         = useState('');
  const [show, setShow]         = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (attempts >= 5) {
      setError('Terlalu banyak percobaan. Hubungi super admin.');
      return;
    }

    const usernameMatch = username.trim() === ADMIN_USERNAME;
    const passMatch     = pass === ADMIN_PASS;

    if (!usernameMatch || !passMatch) {
      const next = attempts + 1;
      setAttempts(next);
      const sisa = 5 - next;
      setError(
        !usernameMatch
          ? 'Username tidak ditemukan.'
          : `Password salah. ${sisa > 0 ? `${sisa} percobaan tersisa.` : 'Akun terkunci!'}`
      );
      setPass('');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    sessionStorage.setItem('admin_auth', '1');
    sessionStorage.setItem('admin_login_time', Date.now().toString());
    sessionStorage.setItem('admin_username', username.trim());
    navigate('/admin/dashboard');
  };

  const isLocked = attempts >= 5;
  const canSubmit = username.trim() && pass && !loading && !isLocked;

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex',
      fontFamily: "'Nunito', sans-serif", background: '#0E0C1E',
    }}>
      {/* ── Left Panel: Dark Brand ─────────────────────────────── */}
      <motion.div
        className="admin-login-left"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          flex: '0 0 45%',
          background: 'linear-gradient(160deg, #1A1730 0%, #2A2250 50%, #1A3050 100%)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '48px 52px',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(155,137,204,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(155,137,204,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px', pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', top: '20%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,137,204,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,168,216,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo + Headline */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #9B89CC, #63A8D8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(155,137,204,0.4)' }}>
              <Moon size={22} color="white" strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 800, color: 'white', letterSpacing: '-0.3px', lineHeight: 1.2 }}>IslamicMeet</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Admin Console</p>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ height: 2, width: 32, background: 'linear-gradient(90deg, #9B89CC, #63A8D8)', borderRadius: 1 }} />
              <span style={{ fontSize: 11, color: '#9B89CC', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>Pusat Kontrol</span>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: 'white', lineHeight: 1.2, fontFamily: "'Quicksand', sans-serif", marginBottom: 16, letterSpacing: '-0.5px' }}>
              Panel Admin<br />
              <span style={{ background: 'linear-gradient(135deg, #C4B5F0, #93C3E8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IslamicMeet</span>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 340, fontWeight: 500 }}>
              Platform manajemen Ta'aruf Islami — kendalikan, pantau, dan jaga kualitas setiap interaksi pengguna.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(135deg, #9B89CC, #63A8D8)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 600, lineHeight: 1.4 }}>{f}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '20px 24px', display: 'flex' }}>
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none', padding: '0 16px' }}>
                <Icon size={16} color="#9B89CC" style={{ marginBottom: 6 }} />
                <p style={{ fontSize: 20, fontWeight: 800, color: 'white', lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{s.label}</p>
              </div>
            );
          })}
        </motion.div>

        {[...Array(3)].map((_, i) => (
          <motion.div key={i} style={{ position: 'absolute', top: `${25 + i * 22}%`, right: `${8 + (i % 2) * 6}%`, width: 4, height: 4, borderRadius: '50%', background: 'rgba(155,137,204,0.5)' }} animate={{ scale: [1, 2, 1], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2 + i * 0.7, repeat: Infinity, delay: i * 0.5 }} />
        ))}
      </motion.div>

      {/* ── Right Panel: Login Form ────────────────────────────── */}
      <motion.div
        className="admin-login-right"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 60px', background: '#F4F2FC', position: 'relative', minHeight: '100dvh' }}
      >
        <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'linear-gradient(135deg, rgba(155,137,204,0.08), transparent)', borderRadius: '0 0 0 100%', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ position: 'absolute', top: 32, right: 40, display: 'flex', alignItems: 'center', gap: 6, background: '#EAE3FF', borderRadius: 20, padding: '6px 12px' }}>
          <Shield size={12} color="#7E6BAF" />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#7E6BAF', letterSpacing: 0.5 }}>SECURE ACCESS</span>
        </motion.div>

        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ marginBottom: 36 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #2D2A4A, #4A3D8A)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 8px 28px rgba(45,42,74,0.25)' }}>
              <ShieldCheck size={26} color="white" />
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#2D2A4A', letterSpacing: '-0.5px', fontFamily: "'Quicksand', sans-serif", marginBottom: 6 }}>
              Administrator Login
            </h2>
            <p style={{ fontSize: 14, color: '#8B87A8', fontWeight: 500 }}>
              Akses terbatas hanya untuk tim pengelola IslamicMeet
            </p>
          </motion.div>

          {/* Credential info box */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ background: 'linear-gradient(135deg, rgba(45,42,74,0.06), rgba(74,61,138,0.06))', border: '1px solid rgba(155,137,204,0.25)', borderRadius: 16, padding: '14px 18px', marginBottom: 28, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <ShieldCheck size={16} color="#9B89CC" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#2D2A4A', marginBottom: 4 }}>Kredensial Admin</p>
              <p style={{ fontSize: 12, color: '#8B87A8', lineHeight: 1.6 }}>
                Username: <strong style={{ color: '#5E5A7A' }}>islamicmeet_admin</strong><br />
                Password: <strong style={{ color: '#5E5A7A' }}>IslamicMeet@2026!</strong>
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Username field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#5E5A7A', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Username Admin
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9B89CC', pointerEvents: 'none' }} />
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="Masukkan username admin"
                  disabled={isLocked}
                  autoComplete="username"
                  style={{
                    width: '100%', padding: '14px 16px 14px 44px',
                    border: `2px solid ${error && !username ? '#E07070' : '#E8E3FF'}`,
                    borderRadius: 14, fontFamily: "'Nunito', sans-serif",
                    fontSize: 14, color: '#2D2A4A', outline: 'none',
                    background: isLocked ? '#F5F5F5' : 'white',
                    boxSizing: 'border-box', transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(45,42,74,0.06)',
                  }}
                  onFocus={e => { if (!isLocked) e.target.style.borderColor = '#9B89CC'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8E3FF'; }}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#5E5A7A', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Password Admin
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9B89CC', pointerEvents: 'none' }} />
                <input
                  id="admin-password"
                  type={show ? 'text' : 'password'}
                  value={pass}
                  onChange={e => { setPass(e.target.value); setError(''); }}
                  placeholder="Masukkan password admin"
                  disabled={isLocked}
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '14px 48px 14px 44px',
                    border: `2px solid ${error && username ? '#E07070' : '#E8E3FF'}`,
                    borderRadius: 14, fontFamily: "'Nunito', sans-serif",
                    fontSize: 14, color: '#2D2A4A', outline: 'none',
                    background: isLocked ? '#F5F5F5' : 'white',
                    boxSizing: 'border-box', transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(45,42,74,0.06)',
                  }}
                  onFocus={e => { if (!isLocked) e.target.style.borderColor = '#9B89CC'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8E3FF'; }}
                />
                <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9B89CC', display: 'flex', alignItems: 'center', padding: 4 }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 10, padding: '10px 14px' }}>
                  <AlertTriangle size={14} color="#C62828" />
                  <span style={{ fontSize: 13, color: '#C62828', fontWeight: 700 }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Attempt dots */}
            {attempts > 0 && !isLocked && (
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#9896B0', fontWeight: 600 }}>Percobaan:</span>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i < attempts ? '#E07070' : '#E8E3FF', transition: 'background 0.2s' }} />
                ))}
              </div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={!canSubmit}
              whileHover={canSubmit ? { scale: 1.01, y: -1 } : {}}
              whileTap={canSubmit ? { scale: 0.98 } : {}}
              style={{
                marginTop: 4, padding: '15px 24px', borderRadius: 14, border: 'none',
                background: canSubmit
                  ? 'linear-gradient(135deg, #2D2A4A 0%, #4A3D8A 100%)'
                  : '#D0CCE8',
                color: 'white', fontSize: 15, fontWeight: 800,
                fontFamily: "'Nunito', sans-serif",
                cursor: canSubmit ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all 0.2s',
                boxShadow: canSubmit ? '0 6px 24px rgba(45,42,74,0.35)' : 'none',
              }}
            >
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                  Memverifikasi...
                </>
              ) : (
                <><ShieldCheck size={17} /> Masuk ke Admin Panel <ArrowRight size={15} /></>
              )}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E8E3FF' }} />
            <span style={{ fontSize: 12, color: '#B0ACCC', fontWeight: 700 }}>atau</span>
            <div style={{ flex: 1, height: 1, background: '#E8E3FF' }} />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            style={{ width: '100%', padding: '14px 24px', borderRadius: 14, border: '2px solid #E8E3FF', background: 'white', color: '#5E5A7A', fontSize: 14, fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s' }}
          >
            <Moon size={15} color="#9B89CC" />
            Login sebagai Pengguna Biasa
          </motion.button>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#B0ACCC', fontWeight: 600, lineHeight: 1.6 }}>
            Masalah akses? Hubungi{' '}
            <a href="mailto:admin@islamicmeet.id" style={{ color: '#9B89CC', textDecoration: 'none' }}>admin@islamicmeet.id</a>
          </p>
        </div>

        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: '#C4C0D8', fontWeight: 600, whiteSpace: 'nowrap' }}>
          IslamicMeet Admin Console v1.0 · 2026
        </div>
      </motion.div>
    </div>
  );
}
