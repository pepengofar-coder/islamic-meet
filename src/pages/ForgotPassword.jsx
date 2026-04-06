import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Moon, CheckCircle } from 'lucide-react';
import { resetPassword } from '../lib/auth';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan, coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--no-nav" style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      <div style={{
        background: 'linear-gradient(135deg, #9B89CC, #63A8D8)',
        padding: '48px 24px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 20, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 20 }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Moon size={28} color="rgba(255,255,255,0.9)" strokeWidth={1.5} style={{ marginBottom: 8 }} />
          <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>
            Lupa Password
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>Link reset akan dikirim ke email Anda</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ background: 'white', borderRadius: '28px 28px 0 0', marginTop: -24, padding: '32px 24px', minHeight: 'calc(100dvh - 160px)' }}
      >
        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={36} color="var(--purple-400)" />
            </div>
            <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Email Terkirim!</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28 }}>
              Cek inbox email <strong>{email}</strong> dan klik link yang kami kirim untuk reset password Anda.
            </p>
            <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>Kembali ke Login</button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error && (
              <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#C62828', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email yang terdaftar</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  className="form-input" type="email" placeholder="email@contoh.com"
                  value={email} onChange={e => setEmail(e.target.value)} required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || !email}>
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }} />
              ) : 'Kirim Link Reset'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
