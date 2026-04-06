import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Check, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

const commitments = [
  { icon: '🚫', title: 'Tidak berkhalwat virtual', desc: 'Dilarang berdua-duaan secara digital tanpa wali/mediator.' },
  { icon: '💍', title: 'Niat serius untuk menikah', desc: 'Platform ini hanya untuk yang sungguh-sungguh ingin menikah.' },
  { icon: '🤝', title: 'Menjaga adab komunikasi', desc: 'Setiap percakapan harus sesuai adab dan syariat Islam.' },
  { icon: '🔒', title: 'Merahasiakan data orang lain', desc: 'Dilarang menyebarkan CV, foto, atau data profil orang lain.' },
  { icon: '⚖️', title: 'Bertanggung jawab penuh', desc: 'Saya bertanggung jawab atas setiap tindakan di platform ini.' },
];

export default function Akad() {
  const navigate = useNavigate();
  const { updateUser } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = (e) => {
    const el = e.target;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
    if (atBottom) setScrolled(true);
  };

  const handleAgree = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    updateUser({ akadSigned: true });
    navigate('/readiness');
  };

  return (
    <div className="page page--no-nav" style={{ background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #9B89CC, #7E6BAF)', padding: '48px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <button onClick={() => navigate('/verify')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 20, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 20 }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <FileText size={28} color="rgba(255,255,255,0.9)" strokeWidth={1.5} style={{ marginBottom: 8 }} />
        <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>
          Akad Penggunaan
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>
          Baca dan setujui komitmen berikut
        </p>

        {/* Progress */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>Langkah 2 dari 4</span>
            <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>50%</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '50%', background: 'white', borderRadius: 3 }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        style={{ background: 'white', borderRadius: '28px 28px 0 0', marginTop: -24, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{ padding: '24px 24px 12px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 8 }}>
            Saya berkomitmen untuk menggunakan platform IslamicMeet sesuai tujuan mulia pernikahan dengan mematuhi setiap poin berikut:
          </p>
        </div>

        {/* Scrollable commitments */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'auto', padding: '0 24px', maxHeight: 340 }}
        >
          {commitments.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i + 0.2 }}
              style={{
                display: 'flex', gap: 14, padding: '16px 0',
                borderBottom: i < commitments.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                {c.icon}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{c.title}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.desc}</p>
              </div>
            </motion.div>
          ))}
          <div style={{ padding: '16px 0 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            Wallahu a'lam bish-shawwab
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px 32px', borderTop: '1px solid var(--border)' }}>
          {!scrolled && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, padding: '10px 14px', background: 'var(--blue-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--blue-100)' }}>
              <AlertCircle size={16} color="var(--blue-500)" />
              <p style={{ fontSize: 12, color: 'var(--blue-500)', fontWeight: 600 }}>Scroll ke bawah untuk mengaktifkan tombol persetujuan</p>
            </div>
          )}

          {scrolled && (
            <motion.label
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '14px', background: agreed ? 'var(--purple-50)' : 'white',
                borderRadius: 'var(--radius-md)', border: `2px solid ${agreed ? 'var(--purple-300)' : 'var(--border)'}`,
                cursor: 'pointer', marginBottom: 16, transition: 'all 0.2s',
              }}
            >
              <div onClick={() => setAgreed(a => !a)} style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${agreed ? 'var(--purple-400)' : 'var(--border)'}`,
                background: agreed ? 'var(--purple-400)' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {agreed && <Check size={13} color="white" strokeWidth={3} />}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 600 }}>
                Saya telah membaca, memahami, dan menyetujui seluruh akad penggunaan di atas.
              </p>
            </motion.label>
          )}

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleAgree}
            disabled={!agreed || !scrolled || loading}
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }}
              />
            ) : 'Setuju & Lanjut'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
