import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, Lightbulb, Users, X, Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProfileAvatar } from '../components/Avatar';
import { iceBreakerQuestions } from '../data/mockData';
import { getMessages, sendMessage as dbSendMsg, subscribeToMessages } from '../lib/db';

export default function TaarufRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { rooms, authUser } = useApp();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [showIceBreaker, setShowIceBreaker] = useState(false);
  const [showWali, setShowWali] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const chatEndRef = useRef(null);

  // Find room from context rooms array
  const room = rooms.find(r => r.id === roomId);

  // Determine the other person's profile from room data
  const partner = room
    ? (room.user1_id === authUser?.id ? room.user2 : room.user1)
    : null;

  // Load messages + subscribe to realtime updates
  useEffect(() => {
    if (!roomId) return;
    setLoadingMsgs(true);
    getMessages(roomId)
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));

    const unsub = subscribeToMessages(roomId, (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
    });
    return unsub;
  }, [roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!room || !partner) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 40 }}>
        <Clock size={48} color="var(--purple-200)" />
        <p style={{ color: 'var(--text-muted)', fontSize: 15, textAlign: 'center' }}>Ruang ta'aruf belum aktif atau tidak ditemukan.</p>
        <button className="btn btn-primary" onClick={() => navigate('/rooms')}>Kembali</button>
      </div>
    );
  }

  const startDate = new Date(room.created_at).getTime();
  const durationDays = room.duration_days || 7;
  const endDate = room.expires_at ? new Date(room.expires_at).getTime() : (startDate + durationDays * 86400000);
  const now = Date.now();
  const remainMs = Math.max(0, endDate - now);
  const remainDays = Math.floor(remainMs / 86400000);
  const remainHours = Math.floor((remainMs % 86400000) / 3600000);
  const timerPct = Math.max(0, Math.min(100, (remainMs / (durationDays * 86400000)) * 100));

  const handleSend = async () => {
    if (!text.trim() || !authUser) return;
    const msgText = text;
    setText('');
    try {
      await dbSendMsg(roomId, authUser.id, msgText);
      // Realtime subscription will add the message to state
    } catch (err) {
      console.error('Send message error:', err);
      setText(msgText); // restore on failure
    }
  };

  const sendIceBreaker = async (q) => {
    if (!authUser) return;
    setShowIceBreaker(false);
    try {
      await dbSendMsg(roomId, authUser.id, q);
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'var(--purple-50)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <ArrowLeft size={18} color="var(--purple-500)" />
          </button>

          <ProfileAvatar colorIndex={0} size="sm" revealed={false} />

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 1 }}>
              {(partner.full_name || partner.name || '?').split(' ').slice(0, 2).join(' ')}
            </p>
            <div style={{ display: 'flex', align: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>● Aktif</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: remainDays <= 2 ? 'var(--danger)' : 'var(--purple-400)', marginBottom: 2 }}>
              ⏱ {remainDays}h {remainHours}j
            </p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>tersisa</p>
          </div>
        </div>

        {/* Timer bar */}
        <div style={{ height: 5, background: 'var(--purple-100)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${timerPct}%` }}
            style={{ height: '100%', background: remainDays <= 2 ? 'var(--danger)' : 'var(--gradient-primary)', borderRadius: 3 }}
          />
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, scrollbarWidth: 'none' }}>
        {/* System message */}
        <div style={{ textAlign: 'center', padding: '8px 16px' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'white', padding: '5px 14px', borderRadius: 20, boxShadow: 'var(--shadow-sm)' }}>
            🤝 Ruang ta'aruf dimulai — Jaga adab dalam setiap pesan
          </span>
        </div>

        {messages.map((msg, i) => {
          const isMe = msg.sender_id === authUser?.id;
          const timeStr = new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: 3 }}
            >
              <div style={{
                maxWidth: '78%', padding: '11px 15px',
                borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: isMe ? 'var(--gradient-primary)' : 'white',
                color: isMe ? 'white' : 'var(--text-primary)',
                fontSize: 14, lineHeight: 1.5,
                boxShadow: isMe ? '0 2px 10px rgba(155, 137, 204, 0.3)' : 'var(--shadow-sm)',
                fontFamily: "'Nunito', sans-serif",
              }}>
                {msg.text}
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', paddingInline: 4 }}>{timeStr}</span>
            </motion.div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '12px 12px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <button
            onClick={() => { setShowIceBreaker(true); setShowWali(false); }}
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--purple-50)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            title="Ice breaker questions"
          >
            <Lightbulb size={18} color="var(--purple-400)" />
          </button>

          <button
            onClick={() => { setShowWali(true); setShowIceBreaker(false); }}
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--blue-50)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            title="Undang wali"
          >
            <Users size={18} color="var(--blue-500)" />
          </button>

          <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 24, padding: '10px 16px', border: '2px solid var(--border)', minHeight: 44, display: 'flex', alignItems: 'center' }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ketik pesan..."
              rows={1}
              style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', resize: 'none', fontFamily: "'Nunito', sans-serif", fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.4 }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!text.trim()}
            style={{ width: 44, height: 44, borderRadius: '50%', background: text.trim() ? 'var(--gradient-primary)' : 'var(--purple-100)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: text.trim() ? 'pointer' : 'default', flexShrink: 0, transition: 'all 0.2s', boxShadow: text.trim() ? '0 4px 14px rgba(155,137,204,0.4)' : 'none' }}
          >
            <Send size={18} color={text.trim() ? 'white' : 'var(--purple-300)'} />
          </button>
        </div>
      </div>

      {/* Ice Breaker Modal */}
      <AnimatePresence>
        {showIceBreaker && (
          <IceBreakerModal
            onSelect={sendIceBreaker}
            onClose={() => setShowIceBreaker(false)}
          />
        )}
      </AnimatePresence>

      {/* Wali Modal */}
      <AnimatePresence>
        {showWali && (
          <WaliModal onClose={() => setShowWali(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function IceBreakerModal({ onSelect, onClose }) {
  const categories = [...new Set(iceBreakerQuestions.map(q => q.category))];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(45,42,74,0.55)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 430, background: 'white', borderRadius: '28px 28px 0 0', maxHeight: '75dvh', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 14px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--purple-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lightbulb size={16} color="var(--purple-400)" />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 16, fontWeight: 700 }}>Pertanyaan Ta'aruf</h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tap untuk langsung mengirim</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'var(--purple-50)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} color="var(--purple-400)" />
            </button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '12px 16px 30px', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--purple-400)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{cat}</p>
              {iceBreakerQuestions.filter(q => q.category === cat).map((q, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSelect(q.q)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '12px 14px',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                    background: 'white', cursor: 'pointer', marginBottom: 8,
                    fontFamily: "'Nunito', sans-serif", fontSize: 13, lineHeight: 1.5,
                    color: 'var(--text-primary)', fontWeight: 500,
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                  whileHover={{ background: 'var(--purple-50)', borderColor: 'var(--purple-200)' }}
                >
                  <span style={{ color: 'var(--purple-300)', fontWeight: 700, fontSize: 16, lineHeight: 1 }}>›</span>
                  {q.q}
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function WaliModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(45,42,74,0.55)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 430, background: 'white', borderRadius: '28px 28px 0 0', padding: '20px 24px 44px' }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="var(--blue-500)" />
          </div>
          <div>
            <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 18, fontWeight: 700 }}>Undang Wali / Mediator</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pihak ketiga sebagai saksi</p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20, background: 'var(--blue-50)', padding: '12px 14px', borderRadius: 12 }}>
          Menghadirkan wali atau mediator dalam proses ta'aruf adalah bentuk penjagaan terhadap syariat. Mereka akan bergabung sebagai pengamat.
        </p>

        {!sent ? (
          <>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Email Wali / Mediator</label>
              <input className="form-input" type="email" placeholder="emailwali@contoh.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Batal</button>
              <button className="btn btn-primary" onClick={() => setSent(true)} style={{ flex: 1.5 }} disabled={!email}>
                <Send size={15} /> Kirim Undangan
              </button>
            </div>

            <div className="divider-text" style={{ margin: '18px 0 14px' }}>atau</div>

            <button className="btn btn-outline btn-full" onClick={() => setSent(true)}>
              <Users size={15} /> Minta Admin IslamicMeet
            </button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#E6F9F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Users size={28} color="var(--success)" />
            </div>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Undangan Terkirim</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Wali/mediator akan menerima notifikasi dan dapat bergabung.</p>
            <button className="btn btn-secondary btn-full" onClick={onClose} style={{ marginTop: 20 }}>Tutup</button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
