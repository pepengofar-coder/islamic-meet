import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Moon } from 'lucide-react';
import { signIn } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    setError('');
    try {
      await signIn({ email: form.email, password: form.password });
      // AppContext will detect auth change and load profile
      // Navigate to splash to route to correct step
      navigate('/');
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Email atau password salah. Silakan coba lagi.'
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
            Masuk ke Akun
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>
            Lanjutkan perjalanan ta'aruf Anda
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#FFF0F0', border: '1px solid #FFCDD2',
                borderRadius: 12, padding: '12px 16px',
                fontSize: 13, color: '#C62828', fontWeight: 600,
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
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
                id="login-password"
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Password Anda"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ paddingRight: 44 }}
                required
              />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right', marginTop: -8 }}>
            <Link
              to="/forgot-password"
              style={{ fontSize: 13, color: 'var(--purple-400)', fontWeight: 700, textDecoration: 'none' }}
            >
              Lupa password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="login-submit"
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: 4 }}
            disabled={loading || !form.email || !form.password}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }}
              />
            ) : (
              'Masuk Sekarang'
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            Belum punya akun?{' '}
            <span
              onClick={() => navigate('/register')}
              style={{ color: 'var(--purple-400)', fontWeight: 700, cursor: 'pointer' }}
            >
              Daftar
            </span>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
