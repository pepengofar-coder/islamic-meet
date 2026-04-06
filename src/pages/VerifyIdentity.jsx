import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Camera, CreditCard, CheckCircle, ArrowLeft, Upload, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function VerifyIdentity() {
  const navigate = useNavigate();
  const { updateUser } = useApp();
  const [ktpUploaded, setKtpUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const canProceed = ktpUploaded && selfieUploaded;

  const handleKtp = () => {
    setTimeout(() => setKtpUploaded(true), 800);
  };

  const handleSelfie = () => {
    setTimeout(() => setSelfieUploaded(true), 800);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    updateUser({ verified: true });
    navigate('/akad');
  };

  return (
    <div className="page page--no-nav" style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #63A8D8, #3D9D7A)',
        padding: '48px 24px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <button onClick={() => navigate('/register')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 20, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 20 }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <Shield size={28} color="rgba(255,255,255,0.9)" strokeWidth={1.5} style={{ marginBottom: 8 }} />
        <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>
          Verifikasi Identitas
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 1.5 }}>
          Kami memastikan semua pengguna adalah nyata dan serius
        </p>

        {/* Progress bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>Langkah 1 dari 4</span>
            <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>25%</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '25%', background: 'white', borderRadius: 3 }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        style={{ background: 'white', borderRadius: '28px 28px 0 0', marginTop: -24, padding: '32px 24px', flex: 1 }}
      >
        {/* Privacy note */}
        <div style={{
          background: 'var(--blue-50)', borderRadius: 'var(--radius-md)',
          padding: '12px 16px', marginBottom: 24,
          display: 'flex', gap: 10, alignItems: 'flex-start',
          border: '1px solid var(--blue-100)',
        }}>
          <Lock size={16} color="var(--blue-500)" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: 'var(--blue-500)', lineHeight: 1.5, fontWeight: 500 }}>
            Data dokumen Anda dienkripsi dan hanya digunakan untuk verifikasi. Tidak dibagikan kepada siapapun.
          </p>
        </div>

        {/* KTP Upload */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10,
            textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Foto KTP
          </p>
          <button
            onClick={handleKtp}
            style={{
              width: '100%', borderRadius: 'var(--radius-xl)',
              border: `2px dashed ${ktpUploaded ? 'var(--success)' : 'var(--purple-200)'}`,
              background: ktpUploaded ? '#E6F9F0' : 'var(--purple-50)',
              padding: 28, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              transition: 'all 0.3s ease',
            }}
          >
            {ktpUploaded ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                <CheckCircle size={40} color="var(--success)" />
              </motion.div>
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--purple-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={26} color="var(--purple-400)" />
              </div>
            )}
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: ktpUploaded ? 'var(--success)' : 'var(--text-primary)', marginBottom: 3 }}>
                {ktpUploaded ? '✓ KTP berhasil diunggah' : 'Tap untuk unggah KTP'}
              </p>
              {!ktpUploaded && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>JPG, PNG — maks. 5MB</p>
              )}
            </div>
          </button>
        </div>

        {/* Selfie Upload */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10,
            textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Foto Selfie Terbaru
          </p>
          <button
            onClick={handleSelfie}
            style={{
              width: '100%', borderRadius: 'var(--radius-xl)',
              border: `2px dashed ${selfieUploaded ? 'var(--success)' : 'var(--blue-200)'}`,
              background: selfieUploaded ? '#E6F9F0' : 'var(--blue-50)',
              padding: 28, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              transition: 'all 0.3s ease',
            }}
          >
            {selfieUploaded ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                <CheckCircle size={40} color="var(--success)" />
              </motion.div>
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={26} color="var(--blue-500)" />
              </div>
            )}
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: selfieUploaded ? 'var(--success)' : 'var(--text-primary)', marginBottom: 3 }}>
                {selfieUploaded ? '✓ Selfie berhasil diunggah' : 'Tap untuk ambil/unggah selfie'}
              </p>
              {!selfieUploaded && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tanpa filter — tampak wajah jelas</p>
              )}
            </div>
          </button>
        </div>

        <button
          className="btn btn-primary btn-full btn-lg"
          onClick={handleSubmit}
          disabled={!canProceed || loading}
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }}
            />
          ) : 'Kirim & Lanjut'}
        </button>
      </motion.div>
    </div>
  );
}
