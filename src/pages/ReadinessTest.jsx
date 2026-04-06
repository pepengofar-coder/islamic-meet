import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, DollarSign, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { readinessQuestions } from '../data/mockData';

const categoryIcons = {
  'Finansial': DollarSign,
  'Mental': Brain,
  'Ilmu Agama': BookOpen,
};
const categoryColors = {
  'Finansial': { bg: 'linear-gradient(135deg, #F0E4B8, #F5C842)', icon: '#7A5C1E', badge: '#FFF3E0', badgeText: '#8B6914' },
  'Mental':    { bg: 'linear-gradient(135deg, #B8A6F0, #93C3E8)', icon: '#5E4B99', badge: 'var(--purple-100)', badgeText: 'var(--purple-600)' },
  'Ilmu Agama':{ bg: 'linear-gradient(135deg, #B8E8D8, #5EC994)', icon: '#1E7A50', badge: '#E6F9F0', badgeText: '#1E7A50' },
};

export default function ReadinessTest() {
  const navigate = useNavigate();
  const { updateUser } = useApp();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const q = readinessQuestions[current];
  const progress = ((current) / readinessQuestions.length) * 100;

  const selectAnswer = (idx, s) => {
    setAnswers(a => ({ ...a, [q.id]: { idx, score: s } }));
    setTimeout(() => {
      if (current < readinessQuestions.length - 1) {
        setDirection(1);
        setCurrent(c => c + 1);
      } else {
        // Calculate score
        const total = Object.values({ ...answers, [q.id]: { score: s } }).reduce((sum, a) => sum + a.score, 0);
        const maxScore = readinessQuestions.length * 3;
        const pct = Math.round((total / maxScore) * 100);
        setScore(pct);
        setDone(true);
      }
    }, 300);
  };

  const handleProceed = () => {
    updateUser({ readinessDone: true, readinessScore: score });
    navigate('/cv-builder');
  };

  const catColor = categoryColors[q?.category] || categoryColors['Mental'];
  const CatIcon = categoryIcons[q?.category] || Brain;

  if (done) {
    const passed = score >= 60;
    return (
      <div className="page page--no-nav" style={{ background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}
        >
          {/* Score ring */}
          <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 24px' }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="var(--purple-100)" strokeWidth="10" />
              <circle cx="70" cy="70" r="60" fill="none"
                stroke={passed ? 'var(--success)' : 'var(--warning)'}
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 60 * score / 100} ${2 * Math.PI * 60}`}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: passed ? 'var(--success)' : 'var(--warning)' }}>{score}%</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>SKOR</span>
            </div>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            {passed ? 'MasyaAllah! Anda Siap 🌟' : 'Perlu Persiapan Lebih 💪'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
            {passed
              ? 'Skor Anda memenuhi syarat untuk membuat CV Digital dan mulai proses ta\'aruf.'
              : 'Kami sarankan untuk mempersiapkan diri lebih dulu. Anda tetap bisa melanjutkan.'}
          </p>

          {/* Category breakdown */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 24, textAlign: 'left', boxShadow: 'var(--shadow-card)' }}>
            {Object.keys(categoryColors).map((cat, i) => {
              const catQs = readinessQuestions.filter(q => q.category === cat);
              const catAnswers = catQs.map(q => answers[q.id]?.score || 0);
              const catScore = catAnswers.length ? Math.round((catAnswers.reduce((a, b) => a + b, 0) / (catAnswers.length * 3)) * 100) : 0;
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 2 ? 14 : 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: categoryColors[cat].badge, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {React.createElement(categoryIcons[cat], { size: 18, color: categoryColors[cat].badgeText })}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{cat}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--purple-400)' }}>{catScore}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--purple-100)', borderRadius: 3, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${catScore}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                        style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: 3 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={handleProceed}>
            Buat CV Digital Saya →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page page--no-nav" style={{ background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: catColor.bg, padding: '48px 24px 56px', position: 'relative', overflow: 'hidden', transition: 'background 0.5s ease' }}>
        <div style={{ position: 'absolute', bottom: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => current > 0 ? (setDirection(-1), setCurrent(c => c - 1)) : navigate('/akad')}
            style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 20, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color={catColor.icon} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' }}>
              <motion.div animate={{ width: `${progress}%` }} style={{ height: '100%', background: 'rgba(255,255,255,0.85)', borderRadius: 3 }} />
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: catColor.icon, minWidth: 40, textAlign: 'right' }}>
            {current + 1}/{readinessQuestions.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CatIcon size={18} color={catColor.icon} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: catColor.icon, textTransform: 'uppercase', letterSpacing: 1 }}>{q.category}</span>
        </div>
        <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 20, fontWeight: 700, color: catColor.icon, lineHeight: 1.35 }}>
          {q.question}
        </h2>
      </div>

      {/* Options */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        style={{ background: 'white', borderRadius: '28px 28px 0 0', marginTop: -24, flex: 1, padding: '32px 24px' }}
      >
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Pilih jawaban yang paling sesuai
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {q.options.map((opt, idx) => {
            const selected = answers[q.id]?.idx === idx;
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.97 }}
                onClick={() => selectAnswer(idx, opt.score)}
                style={{
                  padding: '16px 18px', borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${selected ? 'var(--purple-400)' : 'var(--border)'}`,
                  background: selected ? 'var(--purple-50)' : 'white',
                  cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 14,
                  fontFamily: "'Nunito', sans-serif",
                  transition: 'all 0.15s ease',
                  boxShadow: selected ? '0 0 0 4px rgba(155,137,204,0.1)' : 'none',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  border: `2px solid ${selected ? 'var(--purple-400)' : 'var(--border)'}`,
                  background: selected ? 'var(--purple-400)' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.15s',
                }}>
                  {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: selected ? 'var(--purple-600)' : 'var(--text-primary)', lineHeight: 1.4 }}>
                  {opt.text}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

// Need React for createElement
import React from 'react';
