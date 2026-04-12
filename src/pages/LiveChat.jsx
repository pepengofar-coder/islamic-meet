import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Headphones, Clock, CheckCheck, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import {
  sendSupportMessage,
  getUserChatMessages,
  subscribeToChat,
  markAdminMessagesAsRead,
} from '../lib/chatDB';

const quickMessages = [
  'Assalamualaikum, saya butuh bantuan',
  'Bagaimana cara upgrade akun?',
  'Saya ingin melaporkan masalah',
  'Kapan verifikasi saya selesai?',
];

export default function LiveChat() {
  const navigate = useNavigate();
  const { authUser, user } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history
  useEffect(() => {
    if (!authUser) return;
    setLoadingHistory(true);
    getUserChatMessages(authUser.id)
      .then((data) => {
        setMessages(data);
        // Mark admin messages as read
        markAdminMessagesAsRead(authUser.id);
      })
      .catch(console.error)
      .finally(() => setLoadingHistory(false));
  }, [authUser]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!authUser) return;
    const unsub = subscribeToChat(authUser.id, (newMsg) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      // If admin sent us a message, mark it as read
      if (newMsg.sender_role === 'admin') {
        markAdminMessagesAsRead(authUser.id);
      }
    });
    return unsub;
  }, [authUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const msgText = (text || input).trim();
    if (!msgText || !authUser || sending) return;

    setSending(true);
    setInput('');
    try {
      await sendSupportMessage(
        authUser.id,
        user?.name || user?.cv?.fullName || 'User',
        msgText
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      // Show the message anyway in case of realtime delay
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateGroup = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Hari Ini';
    if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = [];
  let lastDate = '';
  for (const msg of messages) {
    const dateKey = new Date(msg.created_at).toDateString();
    if (dateKey !== lastDate) {
      groupedMessages.push({ type: 'date', date: formatDateGroup(msg.created_at) });
      lastDate = dateKey;
    }
    groupedMessages.push({ type: 'msg', ...msg });
  }

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
              Online • Live Chat Aktif
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ margin: '12px 16px 0', padding: '12px 16px', background: 'linear-gradient(135deg, #9B89CC22, #63A8D822)', border: '1px solid var(--border)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>💬</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Live Chat dengan Admin</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pesan Anda langsung diterima admin. Balas InsyaAllah segera.</p>
        </div>
      </motion.div>

      {/* Messages area */}
      <div style={{ flex: 1, padding: '16px 16px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loadingHistory ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 12 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 32, height: 32, border: '3px solid #E8E3FF', borderTopColor: '#9B89CC', borderRadius: '50%' }}
            />
            <p style={{ color: '#9896B0', fontSize: 13, fontWeight: 600 }}>Memuat riwayat chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>💬</div>
            <p style={{ color: '#9896B0', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>Belum ada pesan</p>
            <p style={{ color: '#B0ACCC', fontSize: 12, textAlign: 'center' }}>Kirim pesan pertama Anda ke admin!</p>
          </div>
        ) : (
          groupedMessages.map((item, idx) => {
            if (item.type === 'date') {
              return (
                <div key={`date-${idx}`} style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--purple-50)', padding: '4px 14px', borderRadius: 20 }}>{item.date}</span>
                </div>
              );
            }
            const isUser = item.sender_role === 'user';
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '80%' }}
              >
                <div style={{
                  padding: '12px 16px',
                  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isUser ? 'linear-gradient(135deg, #9B89CC, #63A8D8)' : 'white',
                  color: isUser ? 'white' : 'var(--text-primary)',
                  fontSize: 14, lineHeight: 1.5, fontFamily: "'Nunito', sans-serif",
                  boxShadow: isUser ? '0 2px 8px rgba(155,137,204,0.25)' : 'var(--shadow-sm)',
                }}>
                  {item.message}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                }}>
                  <Clock size={10} color="var(--text-muted)" />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatTime(item.created_at)}</span>
                  {isUser && (
                    item.is_read
                      ? <CheckCheck size={12} color="#5EC994" />
                      : <Check size={12} color="var(--text-muted)" />
                  )}
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div style={{ padding: '4px 16px 8px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {quickMessages.map((q, i) => (
          <button key={i} onClick={() => handleSend(q)} disabled={sending} style={{
            padding: '7px 14px', background: 'var(--purple-50)', border: '1px solid var(--border)',
            borderRadius: 20, fontSize: 11, fontWeight: 600, color: 'var(--purple-500)',
            cursor: sending ? 'default' : 'pointer', whiteSpace: 'nowrap', fontFamily: "'Nunito', sans-serif",
            opacity: sending ? 0.6 : 1,
          }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '8px 16px 20px', display: 'flex', gap: 10, background: 'white', borderTop: '1px solid var(--border)' }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ketik pesan..."
          disabled={sending}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 20, border: '2px solid var(--border)',
            background: 'var(--bg)', fontSize: 14, fontFamily: "'Nunito', sans-serif",
            outline: 'none',
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={sending || !input.trim()}
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: sending || !input.trim() ? '#D0CCE8' : 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: sending || !input.trim() ? 'default' : 'pointer',
            boxShadow: sending || !input.trim() ? 'none' : '0 4px 16px rgba(155,137,204,0.35)',
            transition: 'all 0.2s',
          }}
        >
          {sending
            ? <Loader2 size={18} color="white" style={{ animation: 'spin 0.8s linear infinite' }} />
            : <Send size={18} color="white" />
          }
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
