import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Moon } from 'lucide-react';
import { signUp } from '../lib/auth';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', gender: 'akhwat' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    setLoading(true);
    setError('');
    try {
      await signUp({ email: form.email, password: form.password, name: form.name, gender: form.gender });
      // Profile auto-created by DB trigger with name + gender from meta
      navigate('/verify');
    } catch (err) {
      setError(
        err.message?.includes('already registered')
          ? 'Email ini sudah terdaftar. Silakan login.'
          : err.message || 'Terjadi kesalahan, coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--no-nav" style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      {/* Header banner */}
      <div style={{
        background: 'linear-gradient(135deg, #9B89CC, #63A8D8)',
        padding: '48px 24px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <button
          onClick={() => navigate('/onboarding')}
          style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 20,
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', marginBottom: 20,
          }}
        >
          <ArrowLeft size={18} color="white" />
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Moon size={28} color="rgba(255,255,255,0.9)" strokeWidth={1.5} style={{ marginBottom: 8 }} />
          <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 4 }}>
            Buat Akun Baru
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>
            Mulai perjalanan ta'aruf yang bermakna
          </p>
        </motion.div>
      </div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{
          background: 'white',
          borderRadius: '28px 28px 0 0',
          marginTop: -24,
          padding: '32px 24px',
          flex: 1, minHeight: 'calc(100dvh - 160px)',
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#C62828', fontWeight: 600 }}
            >
              ⚠️ {error}
            </motion.div>
          )}
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <div className="input-icon-wrapper">
              <User size={18} className="input-icon" />
              <input
                className="form-input"
                type="text"
                placeholder="Nama sesuai KTP"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                className="form-input"
                type="email"
                placeholder="email@contoh.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 8 karakter"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ paddingRight: 44 }}
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">Jenis Kelamin</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { val: 'ikhwan', label: 'Ikhwan', icon: '🧔' },
                { val: 'akhwat', label: 'Akhwat', icon: '🧕' },
              ].map(({ val, label, icon }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, gender: val }))}
                  style={{
                    padding: '14px', borderRadius: 'var(--radius-md)',
                    border: `2px solid ${form.gender === val ? 'var(--purple-400)' : 'var(--border)'}`,
                    background: form.gender === val ? 'var(--purple-50)' : 'white',
                    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                    fontSize: 14, fontWeight: 700, color: form.gender === val ? 'var(--purple-500)' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: 8 }}
            disabled={loading || !form.name || !form.email || !form.password}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }}
              />
            ) : (
              'Daftar Sekarang'
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            Sudah punya akun?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: 'var(--purple-400)', fontWeight: 700, cursor: 'pointer' }}
            >
              Masuk
            </span>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
