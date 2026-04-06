import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { authUser, loading, isOnboarded, getNextStep } = useApp();

  useEffect(() => {
    if (loading) return; // Wait for auth to resolve

    const timer = setTimeout(() => {
      if (!authUser) {
        navigate('/onboarding');
      } else if (isOnboarded) {
        navigate('/discover');
      } else {
        navigate(getNextStep());
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [loading, authUser, isOnboarded]);


  return (
    <div className="page page--no-nav" style={{
      background: 'linear-gradient(160deg, #7E6BAF 0%, #4A8EBF 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', gap: 0, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '8%', right: '10%',
        width: 180, height: 180, borderRadius: '50%',
        background: 'rgba(255,255,255,0.07)',
      }} />
      <div style={{
        position: 'absolute', bottom: '12%', left: '5%',
        width: 140, height: 140, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />
      <div style={{
        position: 'absolute', top: '35%', left: '80%',
        width: 60, height: 60, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
      }} />

      {/* Floating stars */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: `${15 + i * 13}%`,
            left: `${10 + (i % 3) * 30}%`,
            color: 'rgba(255,255,255,0.35)',
          }}
          animate={{ y: [0, -10, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
        >
          <Star size={i % 2 === 0 ? 10 : 6} fill="currentColor" />
        </motion.div>
      ))}

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
      >
        {/* Icon */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 100, height: 100, borderRadius: '32px',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}
        >
          <Moon size={48} color="white" strokeWidth={1.5} />
        </motion.div>

        {/* Brand name */}
        <div style={{ textAlign: 'center' }}>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 34, fontWeight: 700, color: 'white',
              letterSpacing: '-0.5px',
            }}
          >
            IslamicMeet
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500, marginTop: 4 }}
          >
            Temukan Pendamping Dunia & Akhirat
          </motion.p>
        </div>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ position: 'absolute', bottom: 60, display: 'flex', gap: 8 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>

      {/* Tagline bottom */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{ position: 'absolute', bottom: 30, color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, letterSpacing: 1 }}
      >
        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
      </motion.p>
    </div>
  );
}
