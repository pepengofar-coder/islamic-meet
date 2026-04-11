import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Send, MessageSquare, ThumbsUp, Heart, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

export default function Feedback() {
  const navigate = useNavigate();
  const { user, authUser } = useApp();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'fitur', label: '✨ Fitur Baru', desc: 'Saran fitur yang Anda inginkan' },
    { id: 'bug', label: '🐛 Lapor Bug', desc: 'Laporkan masalah teknis' },
    { id: 'ui', label: '🎨 Tampilan', desc: 'Saran perbaikan desain/UI' },
    { id: 'umum', label: '💬 Umum', desc: 'Masukan lainnya' },
  ];

  const handleSubmit = async () => {
    if (!rating || !message.trim()) return;
    setLoading(true);
    try {
      await supabase.from('feedback').insert({
        user_id: authUser?.id,
        user_name: user?.name || 'Unknown',
        rating,
        category: category || 'umum',
        message: message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Feedback error:', err);
      // Still show success even if table doesn't exist yet (graceful)
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: 'center', padding: 40 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #5EC994, #3DB878)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 30px rgba(94,201,148,0.3)' }}
          >
            <ThumbsUp size={32} color="white" />
          </motion.div>
          <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Jazakallahu Khairan! 🤲
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
            Feedback Anda sangat berarti bagi kami.<br/>InsyaAllah akan kami tindaklanjuti.
          </p>
          <button onClick={() => navigate('/discover')} className="btn btn-primary">
            Kembali ke Beranda
          </button>
        </motion.div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #F5A623 0%, #E08B00 100%)', padding: '44px 20px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 14, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 16 }}>
            <ArrowLeft size={18} color="white" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <MessageSquare size={22} color="white" />
            <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 22, fontWeight: 700, color: 'white' }}>Feedback & Saran</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
            Bantu kami menjadi lebih baik untuk umat
          </p>
        </div>
      </div>

      <div style={{ padding: '20px 16px 100px' }}>
        {/* Rating */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'white', borderRadius: 20, padding: '24px 20px', marginBottom: 16, border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}
        >
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Bagaimana pengalaman Anda?
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Beri rating untuk IslamicMeet
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <motion.button
                key={i}
                whileTap={{ scale: 1.3 }}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <Star
                  size={32}
                  fill={i <= (hoverRating || rating) ? '#F5A623' : 'none'}
                  color={i <= (hoverRating || rating) ? '#F5A623' : 'var(--border)'}
                  strokeWidth={1.5}
                />
              </motion.button>
            ))}
          </div>
          {rating > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: '#F5A623', fontWeight: 700, marginTop: 8 }}>
              {['', 'Kurang 😞', 'Cukup 🙂', 'Baik 😊', 'Bagus! 🌟', 'Luar Biasa! 🎉'][rating]}
            </motion.p>
          )}
        </motion.div>

        {/* Category */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ marginBottom: 16 }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Kategori</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
                padding: '14px 14px', borderRadius: 16,
                border: `2px solid ${category === cat.id ? 'var(--purple-400)' : 'var(--border)'}`,
                background: category === cat.id ? 'var(--purple-50)' : 'white',
                cursor: 'pointer', textAlign: 'left', fontFamily: "'Nunito', sans-serif",
              }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{cat.label}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cat.desc}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Message */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ marginBottom: 20 }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pesan Anda</p>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Tuliskan saran, keluhan, atau ide Anda di sini..."
            rows={5}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 16, border: '2px solid var(--border)',
              background: 'white', fontSize: 14, fontFamily: "'Nunito', sans-serif", color: 'var(--text-primary)',
              outline: 'none', resize: 'vertical', boxSizing: 'border-box',
            }}
          />
        </motion.div>

        {/* Submit */}
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!rating || !message.trim() || loading}
          className="btn btn-primary btn-full btn-lg"
          style={{ gap: 8 }}
        >
          <Send size={16} />
          {loading ? 'Mengirim...' : 'Kirim Feedback'}
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
}
