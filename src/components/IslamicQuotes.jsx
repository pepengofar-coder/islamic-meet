import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Heart, Share2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const quotes = [
  {
    text: '"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang."',
    source: 'QS. Ar-Rum: 21',
    type: 'quran',
    emoji: '📖',
  },
  {
    text: '"Nikah itu setengah agama. Maka bertakwalah kepada Allah dalam setengah yang lain."',
    source: 'HR. Al-Baihaqi',
    type: 'hadits',
    emoji: '🌙',
  },
  {
    text: '"Wahai para pemuda, barangsiapa di antara kalian mampu menikah, maka menikahlah. Karena menikah lebih dapat menundukkan pandangan dan lebih menjaga kemaluan."',
    source: 'HR. Bukhari & Muslim',
    type: 'hadits',
    emoji: '✨',
  },
  {
    text: '"Sebaik-baik kalian adalah yang paling baik terhadap istrinya, dan aku adalah yang paling baik terhadap istriku."',
    source: 'HR. Tirmidzi',
    type: 'hadits',
    emoji: '💎',
  },
  {
    text: '"Dialah yang menciptakan kamu dari diri yang satu dan daripadanya Dia menciptakan pasangannya, agar dia merasa senang kepadanya."',
    source: 'QS. Al-A\'raf: 189',
    type: 'quran',
    emoji: '📖',
  },
  {
    text: '"Dunia adalah perhiasan, dan sebaik-baik perhiasan dunia ialah wanita salihah."',
    source: 'HR. Muslim',
    type: 'hadits',
    emoji: '🌸',
  },
  {
    text: '"Apabila seorang hamba menikah, maka telah sempurna separuh agamanya, maka hendaklah ia bertakwa kepada Allah pada separuh yang lain."',
    source: 'HR. Thabrani',
    type: 'hadits',
    emoji: '🕌',
  },
  {
    text: '"Ya Tuhan kami, anugerahkanlah kepada kami pasangan kami dan keturunan kami sebagai penyenang hati kami, dan jadikanlah kami imam bagi orang-orang yang bertakwa."',
    source: 'QS. Al-Furqan: 74',
    type: 'quran',
    emoji: '🤲',
  },
];

export default function IslamicQuotes() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1);
      setIndex(prev => (prev + 1) % quotes.length);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const prev = () => { setDirection(-1); setIndex(i => (i - 1 + quotes.length) % quotes.length); };
  const next = () => { setDirection(1); setIndex(i => (i + 1) % quotes.length); };

  const q = quotes[index];

  const handleShare = async () => {
    const text = `${q.text}\n— ${q.source}\n\n🌙 Dikirim dari IslamicMeet - Platform Ta'aruf Islami`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); alert('Kutipan disalin ke clipboard! 📋'); } catch {}
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 24,
      overflow: 'hidden',
      boxShadow: '0 2px 16px rgba(45, 42, 74, 0.08)',
      border: '1px solid var(--border)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: q.type === 'quran' ? 'linear-gradient(135deg, #EAE3FF, #F4F0FF)' : 'linear-gradient(135deg, #DBEAFE, #EFF6FF)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 10,
            background: q.type === 'quran' ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #63A8D8, #3DB878)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {q.type === 'quran' ? <BookOpen size={14} color="white" /> : <Sparkles size={14} color="white" />}
          </div>
          <span style={{
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: 0.8,
            color: q.type === 'quran' ? 'var(--purple-500)' : 'var(--blue-500)',
          }}>
            {q.type === 'quran' ? 'Al-Qur\'an' : 'Hadits Nabi ﷺ'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={prev} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={14} color="var(--text-muted)" />
          </button>
          <button onClick={next} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronRight size={14} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      {/* Quote body */}
      <div style={{ padding: '20px 20px 14px', minHeight: 120, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3 }}
          >
            <span style={{ fontSize: 28, lineHeight: 1, opacity: 0.12, position: 'absolute', top: 14, left: 14 }}>{q.emoji}</span>
            <p style={{
              fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
              lineHeight: 1.7, fontStyle: 'italic',
              paddingLeft: 4,
            }}>
              {q.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 18px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: q.type === 'quran' ? 'var(--purple-400)' : 'var(--blue-500)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Heart size={12} /> {q.source}
        </span>
        <button onClick={handleShare} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 999,
          background: 'var(--purple-50)', border: 'none',
          cursor: 'pointer', fontSize: 11, fontWeight: 700,
          color: 'var(--purple-500)',
          fontFamily: "'Nunito', sans-serif",
          transition: 'all 0.15s',
        }}>
          <Share2 size={12} /> Bagikan
        </button>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, paddingBottom: 12 }}>
        {quotes.map((_, i) => (
          <div key={i} style={{
            width: i === index ? 16 : 5, height: 5, borderRadius: 999,
            background: i === index ? 'var(--gradient-primary)' : 'var(--purple-100)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </div>
  );
}
