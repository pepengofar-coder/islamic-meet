import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Circle, Heart, BookOpen, Sparkles, Gift, Home, Users } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const categories = [
  {
    title: '📋 Administrasi',
    color: '#9B89CC',
    items: [
      { text: 'Surat permohonan menikah / wali', done: false },
      { text: 'Fotokopi KTP & KK (calon + wali)', done: false },
      { text: 'Pas foto 2×3 dan 4×6', done: false },
      { text: 'Akta kelahiran calon suami/istri', done: false },
      { text: 'Surat keterangan belum menikah (N1, N2, N4)', done: false },
      { text: 'Surat izin orang tua/wali', done: false },
      { text: 'Surat restu dari pihak keluarga', done: false },
    ],
  },
  {
    title: '🕌 Persiapan Syar\'i',
    color: '#63A8D8',
    items: [
      { text: 'Mengikuti kursus calon pengantin (suscatin)', done: false },
      { text: 'Mempelajari fiqh nikah & rumah tangga', done: false },
      { text: 'Konsultasi pra-nikah dengan ustadz', done: false },
      { text: 'Menentukan mahar', done: false },
      { text: 'Mempersiapkan walimah sederhana', done: false },
      { text: 'Menyiapkan hafalan doa-doa pernikahan', done: false },
    ],
  },
  {
    title: '🏠 Persiapan Tempat Tinggal',
    color: '#5EC994',
    items: [
      { text: 'Menentukan tempat tinggal pasca menikah', done: false },
      { text: 'Menyiapkan peralatan rumah tangga dasar', done: false },
      { text: 'Budget & rencana keuangan rumah tangga', done: false },
      { text: 'Diskusi pembagian peran suami-istri', done: false },
    ],
  },
  {
    title: '💰 Finansial',
    color: '#F5A623',
    items: [
      { text: 'Menyiapkan dana mahar & walimah', done: false },
      { text: 'Dana darurat minimal 3 bulan', done: false },
      { text: 'Diskusi pengelolaan keuangan bersama', done: false },
      { text: 'Rencana tabungan jangka panjang', done: false },
    ],
  },
];

export default function WeddingPrep() {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('wedding_checklist');
    if (saved) return JSON.parse(saved);
    return categories.map(cat => cat.items.map(item => item.done));
  });

  const toggle = (catIdx, itemIdx) => {
    const next = checklist.map((cat, ci) =>
      ci === catIdx ? cat.map((v, ii) => ii === itemIdx ? !v : v) : cat
    );
    setChecklist(next);
    localStorage.setItem('wedding_checklist', JSON.stringify(next));
  };

  const totalItems = checklist.flat().length;
  const doneItems = checklist.flat().filter(Boolean).length;
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #5EC994 0%, #3DB878 50%, #2D9E6B 100%)', padding: '44px 20px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 14, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 16 }}>
            <ArrowLeft size={18} color="white" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>📋</span>
            <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 22, fontWeight: 700, color: 'white' }}>
              Persiapan Nikah
            </h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 16 }}>
            Checklist lengkap persiapan pernikahan Islami
          </p>

          {/* Progress bar */}
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, height: 8, overflow: 'hidden', marginBottom: 6 }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} style={{ height: '100%', background: 'white', borderRadius: 20 }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700 }}>
            {doneItems}/{totalItems} selesai ({progress}%)
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div style={{ padding: '16px 16px 100px' }}>
        {categories.map((cat, ci) => (
          <motion.div key={ci} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.1 }}
            style={{ background: 'white', borderRadius: 20, padding: '16px', marginBottom: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, fontFamily: "'Nunito', sans-serif" }}>{cat.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cat.items.map((item, ii) => {
                const isDone = checklist[ci]?.[ii] || false;
                return (
                  <button key={ii} onClick={() => toggle(ci, ii)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                    borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: isDone ? `${cat.color}10` : 'var(--bg)',
                    transition: 'all 0.15s', fontFamily: "'Nunito', sans-serif", width: '100%', textAlign: 'left',
                  }}>
                    {isDone
                      ? <CheckCircle size={18} color={cat.color} style={{ flexShrink: 0 }} />
                      : <Circle size={18} color="var(--border)" style={{ flexShrink: 0 }} />
                    }
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}>
                      {item.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
