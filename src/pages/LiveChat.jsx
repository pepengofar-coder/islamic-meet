import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Headphones, Clock, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

const ADMIN_NUMBER = '6281466760017';

const quickMessages = [
  'Assalamualaikum, saya butuh bantuan',
  'Bagaimana cara upgrade akun?',
  'Saya ingin melaporkan masalah',
  'Kapan verifikasi saya selesai?',
];

export default function LiveChat() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [messages, setMessages] = useState([
    { id: 1, from: 'admin', text: 'Assalamu\'alaikum! 👋 Selamat datang di IslamicMeet. Saya admin yang siap membantu Anda. Ada yang bisa dibantu?', time: '09:00' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text: text.trim(), time: timeStr }]);
    setInput('');

    // Auto-reply from "admin" after a short delay
    setTimeout(() => {
      const replies = [
        'Terima kasih atas pesannya. Untuk respon lebih cepat, silakan hubungi kami via WhatsApp langsung ya. 😊',
        'Baik, pesan Anda sudah kami terima. Tim kami akan segera merespon InsyaAllah.',
        'Jazakallahu khairan. Silakan tunggu balasan kami atau hubungi via WhatsApp untuk respon instan.',
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setMessages(prev => [...prev, {
        id: Date.now() + 1, from: 'admin', text: reply,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1500);
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(`Assalamu'alaikum, saya ${user?.name || 'user'} dari IslamicMeet. `);
    window.open(`https://wa.me/${ADMIN_NUMBER}?text=${msg}`, '_blank');
  };

  return (
    <div className="page" style={{ background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2D2A4A 0%, #4A3D7A 100%)',
        padding: '44px 20px 18px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 14, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="white" />
          </button>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #5EC994, #3DB878)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Headphones size={18} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'white', fontSize: 15, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>Admin IslamicMeet</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#5EC994', marginRight: 5, verticalAlign: 'middle' }} />
              Online • Respon cepat via WhatsApp
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ margin: '12px 16px 0', padding: '12px 16px', background: 'linear-gradient(135deg, #25D366, #128C7E)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        onClick={openWhatsApp}
      >
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💬</div>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>Respon Lebih Cepat via WhatsApp</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Klik untuk chat langsung</p>
        </div>
        <span style={{ color: 'white', fontSize: 18 }}>→</span>
      </motion.div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '16px 16px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}
          >
            <div style={{
              padding: '12px 16px',
              borderRadius: msg.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.from === 'user' ? 'linear-gradient(135deg, #9B89CC, #63A8D8)' : 'white',
              color: msg.from === 'user' ? 'white' : 'var(--text-primary)',
              fontSize: 14, lineHeight: 1.5, fontFamily: "'Nunito', sans-serif",
              boxShadow: msg.from === 'user' ? '0 2px 8px rgba(155,137,204,0.25)' : 'var(--shadow-sm)',
            }}>
              {msg.text}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
              justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <Clock size={10} color="var(--text-muted)" />
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{msg.time}</span>
              {msg.from === 'user' && <CheckCheck size={12} color="#5EC994" />}
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div style={{ padding: '4px 16px 8px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {quickMessages.map((q, i) => (
          <button key={i} onClick={() => sendMessage(q)} style={{
            padding: '7px 14px', background: 'var(--purple-50)', border: '1px solid var(--border)',
            borderRadius: 20, fontSize: 11, fontWeight: 600, color: 'var(--purple-500)',
            cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Nunito', sans-serif",
          }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '8px 16px 20px', display: 'flex', gap: 10, background: 'white', borderTop: '1px solid var(--border)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ketik pesan..."
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 20, border: '2px solid var(--border)',
            background: 'var(--bg)', fontSize: 14, fontFamily: "'Nunito', sans-serif",
            outline: 'none',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: 'var(--gradient-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(155,137,204,0.35)',
          }}
        >
          <Send size={18} color="white" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
