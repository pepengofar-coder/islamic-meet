import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Heart, Star, ArrowRight, ChevronRight } from 'lucide-react';

const slides = [
  {
    icon: Heart,
    iconColor: 'linear-gradient(135deg, #B8A6F0, #93C3E8)',
    emoji: '🕌',
    title: 'Serius Mencari\nPendamping Hidup',
    desc: 'Platform ini dirancang khusus untuk proses ta\'aruf yang aman, syar\'i, dan terstruktur menuju pernikahan.',
    bg: 'linear-gradient(160deg, #7E6BAF 0%, #4A8EBF 100%)',
    shapes: [
      { top: '8%', left: '5%', size: 120, opacity: 0.08 },
      { top: '60%', right: '3%', size: 80, opacity: 0.06 },
    ],
  },
  {
    icon: Shield,
    iconColor: 'linear-gradient(135deg, #93C3E8, #5EC994)',
    title: 'Privasi & Keamanan\nTerjaga Penuh',
    desc: 'Foto profil diblur secara default. Data Anda dilindungi. Identitas hanya dibuka setelah kedua pihak setuju.',
    bg: 'linear-gradient(160deg, #4A8EBF 0%, #3D9D7A 100%)',
    shapes: [
      { top: '5%', right: '8%', size: 100, opacity: 0.08 },
      { bottom: '15%', left: '2%', size: 150, opacity: 0.05 },
    ],
  },
  {
    icon: Star,
    iconColor: 'linear-gradient(135deg, #F0D6B8, #F0B8C8)',
    title: 'Proses Bertahap &\nTerstruktur',
    desc: 'Dari verifikasi identitas, kuis kesiapan, CV Digital, hingga Ruang Ta\'aruf yang terbimbing — semua ada di sini.',
    bg: 'linear-gradient(160deg, #9B89CC 0%, #7E6BAF 100%)',
    shapes: [
      { top: '12%', left: '60%', size: 90, opacity: 0.08 },
      { bottom: '20%', left: '10%', size: 60, opacity: 0.1 },
    ],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (current < slides.length - 1) {
      setDirection(1);
      setCurrent(c => c + 1);
    } else {
      navigate('/register');
    }
  };

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit:  (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className="page page--no-nav" style={{ minHeight: '100dvh' }}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          style={{
            minHeight: '100dvh',
            background: slide.bg,
            display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Background shapes */}
          {slide.shapes.map((s, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: s.top, bottom: s.bottom, left: s.left, right: s.right,
              width: s.size, height: s.size,
              borderRadius: '50%',
              background: `rgba(255,255,255,${s.opacity})`,
            }} />
          ))}

          {/* Skip button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 20px 0' }}>
            <button
              onClick={() => navigate('/register')}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 20,
                padding: '8px 16px', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Lewati
            </button>
          </div>

          {/* Illustration area */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 160, height: 160, borderRadius: '40px',
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
              }}
            >
              {/* Islamic geometric decoration */}
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ position: 'absolute', opacity: 0.2 }}>
                <polygon points="50,8 62,38 94,38 70,58 80,90 50,72 20,90 30,58 6,38 38,38" fill="white" />
              </svg>
              <Icon size={60} color="white" strokeWidth={1.3} style={{ position: 'relative' }} />
            </motion.div>
          </div>

          {/* Content panel */}
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            borderRadius: '32px 32px 0 0',
            padding: '32px 28px 40px',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <h2 style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 26, fontWeight: 700, color: 'white',
              whiteSpace: 'pre-line', lineHeight: 1.25, marginBottom: 14,
            }}>
              {slide.title}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 1.65, marginBottom: 28 }}>
              {slide.desc}
            </p>

            {/* Dots */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {slides.map((_, i) => (
                  <div key={i} style={{
                    height: 8, borderRadius: 4,
                    width: i === current ? 28 : 8,
                    background: i === current ? 'white' : 'rgba(255,255,255,0.35)',
                    transition: 'all 0.3s ease',
                  }} />
                ))}
              </div>

              <button onClick={goNext} style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'white', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}>
                <ArrowRight size={22} color="#7E6BAF" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
