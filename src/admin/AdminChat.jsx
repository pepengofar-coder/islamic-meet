import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Search, Clock, CheckCheck, Check,
  User, ArrowLeft, Loader2, RefreshCw, Inbox, ChevronRight,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  getAdminChatList,
  getAdminChatMessages,
  sendAdminReply,
  markUserMessagesAsRead,
  subscribeToAdminChats,
} from '../lib/chatDB';

const avatarGradients = [
  'linear-gradient(135deg, #9B89CC, #7E6BAF)',
  'linear-gradient(135deg, #63A8D8, #4A8EBF)',
  'linear-gradient(135deg, #5EC994, #3DB878)',
  'linear-gradient(135deg, #F5A623, #E08B00)',
  'linear-gradient(135deg, #E07070, #C05050)',
  'linear-gradient(135deg, #B8A6F0, #93C3E8)',
];

function getInitials(name) {
  return (name || '?').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function getGradient(name) {
  const idx = Math.abs((name || '').charCodeAt(0) || 0) % avatarGradients.length;
  return avatarGradients[idx];
}

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDateGroup(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hari Ini';
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AdminChat() {
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [convLoading, setConvLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat list
  const loadChatList = useCallback(async () => {
    try {
      const list = await getAdminChatList();
      setChatList(list);
    } catch (err) {
      console.error('Failed to load chat list:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadChatList(); }, [loadChatList]);

  // Subscribe to all new messages
  useEffect(() => {
    const unsub = subscribeToAdminChats((newMsg) => {
      // Update chat list
      setChatList(prev => {
        const existing = prev.find(c => c.user_id === newMsg.user_id);
        if (existing) {
          return prev.map(c => c.user_id === newMsg.user_id ? {
            ...c,
            last_message: newMsg.message,
            last_sender: newMsg.sender_role,
            last_time: newMsg.created_at,
            total_messages: c.total_messages + 1,
            unread_count: newMsg.sender_role === 'user' ? c.unread_count + 1 : c.unread_count,
          } : c).sort((a, b) => new Date(b.last_time) - new Date(a.last_time));
        } else {
          // New user conversation
          return [{
            user_id: newMsg.user_id,
            user_name: newMsg.user_name,
            last_message: newMsg.message,
            last_sender: newMsg.sender_role,
            last_time: newMsg.created_at,
            unread_count: newMsg.sender_role === 'user' ? 1 : 0,
            total_messages: 1,
          }, ...prev];
        }
      });

      // Update conversation if this user is selected
      if (newMsg.user_id === selectedUser?.user_id) {
        setConversation(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // Mark as read since we're viewing
        if (newMsg.sender_role === 'user') {
          markUserMessagesAsRead(newMsg.user_id);
          setChatList(prev => prev.map(c =>
            c.user_id === newMsg.user_id ? { ...c, unread_count: 0 } : c
          ));
        }
      }
    });
    return unsub;
  }, [selectedUser]);

  // Auto-scroll conversation
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Open a user's conversation
  const openConversation = async (chatItem) => {
    setSelectedUser(chatItem);
    setConvLoading(true);
    setReplyText('');
    try {
      const msgs = await getAdminChatMessages(chatItem.user_id);
      setConversation(msgs);
      // Mark messages as read
      await markUserMessagesAsRead(chatItem.user_id);
      // Update unread count in list
      setChatList(prev => prev.map(c =>
        c.user_id === chatItem.user_id ? { ...c, unread_count: 0 } : c
      ));
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setConvLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Send admin reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedUser || sending) return;
    setSending(true);
    try {
      await sendAdminReply(selectedUser.user_id, selectedUser.user_name, replyText.trim());
      setReplyText('');
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Filter chat list
  const filteredList = searchQ
    ? chatList.filter(c => (c.user_name || '').toLowerCase().includes(searchQ.toLowerCase()))
    : chatList;

  const totalUnread = chatList.reduce((sum, c) => sum + c.unread_count, 0);

  // Group conversation messages by date
  const groupedConv = [];
  let lastDate = '';
  for (const msg of conversation) {
    const dateKey = new Date(msg.created_at).toDateString();
    if (dateKey !== lastDate) {
      groupedConv.push({ type: 'date', date: formatDateGroup(msg.created_at) });
      lastDate = dateKey;
    }
    groupedConv.push({ type: 'msg', ...msg });
  }

  // Quick reply templates for admin
  const quickReplies = [
    'Wa\'alaikumussalam, ada yang bisa kami bantu?',
    'Terima kasih, kami akan segera proses.',
    'Silakan tunggu, sedang kami periksa.',
    'Jazakallahu khairan atas laporannya.',
  ];

  return (
    <AdminLayout title="Live Chat">
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedUser ? '340px 1fr' : '1fr',
        gap: 0,
        height: 'calc(100vh - 140px)',
        background: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid var(--border, #E8E3FF)',
        boxShadow: '0 4px 24px rgba(45,42,74,0.06)',
      }}>

        {/* ── Left Panel: Chat Inbox ──────────────────────────────── */}
        <div style={{
          borderRight: selectedUser ? '1px solid #E8E3FF' : 'none',
          display: 'flex', flexDirection: 'column',
          background: '#FAFAFE',
        }}>
          {/* Inbox header */}
          <div style={{ padding: '20px 20px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #9B89CC, #63A8D8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Inbox size={18} color="white" />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#2D2A4A' }}>Inbox Chat</p>
                  <p style={{ fontSize: 11, color: '#9896B0', fontWeight: 600 }}>
                    {totalUnread > 0 ? `${totalUnread} pesan belum dibaca` : 'Semua terbaca'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setLoading(true); loadChatList(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}
                title="Refresh"
              >
                <RefreshCw size={16} color="#9896B0" />
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9896B0' }} />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Cari user..."
                style={{
                  width: '100%', padding: '10px 14px 10px 36px',
                  borderRadius: 12, border: '1px solid #E8E3FF',
                  fontSize: 13, fontFamily: "'Nunito', sans-serif",
                  background: 'white', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Chat list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 12 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 28, height: 28, border: '3px solid #E8E3FF', borderTopColor: '#9B89CC', borderRadius: '50%' }} />
                <p style={{ color: '#9896B0', fontSize: 12, fontWeight: 600 }}>Memuat...</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 10 }}>
                <MessageSquare size={32} color="#D0CCE8" />
                <p style={{ color: '#9896B0', fontSize: 13, fontWeight: 600 }}>
                  {searchQ ? 'Tidak ditemukan' : 'Belum ada pesan masuk'}
                </p>
              </div>
            ) : (
              filteredList.map((chat) => {
                const isActive = selectedUser?.user_id === chat.user_id;
                return (
                  <motion.button
                    key={chat.user_id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openConversation(chat)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 14, border: 'none',
                      background: isActive ? 'linear-gradient(135deg, #EAE3FF, #DBEAFE)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s', marginBottom: 2,
                      fontFamily: "'Nunito', sans-serif",
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F0EEF8'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: getGradient(chat.user_name),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, position: 'relative',
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>
                        {getInitials(chat.user_name)}
                      </span>
                      {chat.unread_count > 0 && (
                        <div style={{
                          position: 'absolute', top: -2, right: -2,
                          width: 18, height: 18, borderRadius: '50%',
                          background: '#E07070', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          border: '2px solid white',
                        }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: 'white' }}>{chat.unread_count}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <span style={{
                          fontSize: 13, fontWeight: chat.unread_count > 0 ? 800 : 700,
                          color: '#2D2A4A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {chat.user_name || 'User'}
                        </span>
                        <span style={{ fontSize: 10, color: '#9896B0', fontWeight: 600, flexShrink: 0 }}>
                          {timeAgo(chat.last_time)}
                        </span>
                      </div>
                      <p style={{
                        fontSize: 12, color: chat.unread_count > 0 ? '#5E5A7A' : '#9896B0',
                        fontWeight: chat.unread_count > 0 ? 700 : 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        margin: 0,
                      }}>
                        {chat.last_sender === 'admin' ? '↩ ' : ''}{chat.last_message}
                      </p>
                    </div>
                    <ChevronRight size={14} color="#D0CCE8" />
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Panel: Conversation ───────────────────────────── */}
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', background: '#FAFAFE' }}>
            {/* Conversation header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #E8E3FF',
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'white',
            }}>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  background: '#F0EEF8', border: 'none', borderRadius: 10,
                  width: 34, height: 34, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} color="#5E5A7A" />
              </button>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: getGradient(selectedUser.user_name),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>
                  {getInitials(selectedUser.user_name)}
                </span>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#2D2A4A' }}>
                  {selectedUser.user_name || 'User'}
                </p>
                <p style={{ fontSize: 11, color: '#9896B0', fontWeight: 600 }}>
                  {selectedUser.total_messages} pesan total
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {convLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 12 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 28, height: 28, border: '3px solid #E8E3FF', borderTopColor: '#9B89CC', borderRadius: '50%' }} />
                  <p style={{ color: '#9896B0', fontSize: 12, fontWeight: 600 }}>Memuat percakapan...</p>
                </div>
              ) : (
                groupedConv.map((item, idx) => {
                  if (item.type === 'date') {
                    return (
                      <div key={`date-${idx}`} style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#9896B0', background: '#F0EEF8', padding: '4px 14px', borderRadius: 20 }}>{item.date}</span>
                      </div>
                    );
                  }
                  const isAdmin = item.sender_role === 'admin';
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ alignSelf: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '70%' }}
                    >
                      {!isAdmin && (
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#9896B0', marginBottom: 3, marginLeft: 4 }}>
                          {item.user_name || 'User'}
                        </p>
                      )}
                      <div style={{
                        padding: '11px 16px',
                        borderRadius: isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isAdmin ? 'linear-gradient(135deg, #2D2A4A, #4A3D8A)' : 'white',
                        color: isAdmin ? 'white' : '#2D2A4A',
                        fontSize: 13.5, lineHeight: 1.55,
                        fontFamily: "'Nunito', sans-serif",
                        boxShadow: isAdmin ? '0 2px 8px rgba(45,42,74,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
                      }}>
                        {item.message}
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4, marginTop: 3,
                        justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                      }}>
                        <Clock size={9} color="#B0ACCC" />
                        <span style={{ fontSize: 10, color: '#B0ACCC' }}>{formatTime(item.created_at)}</span>
                        {isAdmin && (
                          item.is_read
                            ? <CheckCheck size={11} color="#5EC994" />
                            : <Check size={11} color="#B0ACCC" />
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            <div style={{ padding: '4px 24px 6px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {quickReplies.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setReplyText(q)}
                  style={{
                    padding: '5px 12px', background: '#F0EEF8', border: '1px solid #E8E3FF',
                    borderRadius: 16, fontSize: 11, fontWeight: 600, color: '#7E6BAF',
                    cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Reply input */}
            <div style={{
              padding: '10px 24px 16px', display: 'flex', gap: 10,
              background: 'white', borderTop: '1px solid #E8E3FF',
            }}>
              <input
                ref={inputRef}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                placeholder="Balas pesan..."
                disabled={sending}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 14,
                  border: '2px solid #E8E3FF', background: '#FAFAFE',
                  fontSize: 13.5, fontFamily: "'Nunito', sans-serif",
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
              <motion.button
                whileHover={!sending && replyText.trim() ? { scale: 1.03 } : {}}
                whileTap={!sending && replyText.trim() ? { scale: 0.96 } : {}}
                onClick={handleSendReply}
                disabled={sending || !replyText.trim()}
                style={{
                  width: 44, height: 44, borderRadius: 14, border: 'none',
                  background: sending || !replyText.trim()
                    ? '#D0CCE8'
                    : 'linear-gradient(135deg, #2D2A4A, #4A3D8A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: sending || !replyText.trim() ? 'default' : 'pointer',
                  boxShadow: sending || !replyText.trim() ? 'none' : '0 4px 16px rgba(45,42,74,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {sending
                  ? <Loader2 size={17} color="white" style={{ animation: 'spin 0.8s linear infinite' }} />
                  : <Send size={17} color="white" />
                }
              </motion.button>
            </div>
          </div>
        )}

        {/* Empty state when no user selected (only if we have chats but none selected) */}
        {!selectedUser && chatList.length > 0 && (
          <div style={{ display: 'none' }} />
        )}
      </div>
    </AdminLayout>
  );
}
