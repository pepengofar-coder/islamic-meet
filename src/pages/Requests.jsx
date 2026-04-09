import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Check, X, Clock, Send, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProfileAvatar, MatchBadge } from '../components/Avatar';
import BottomNav from '../components/BottomNav';

export default function Requests() {
  const navigate = useNavigate();
  const { requests, rooms, authUser, acceptRequest, rejectRequest } = useApp();
  const [tab, setTab] = useState('masuk');

  // Supabase format: from_id / to_id (UUIDs) + from_profile / to_profile embedded
  const incoming = requests.filter(r => r.to_id === authUser?.id);
  const outgoing = requests.filter(r => r.from_id === authUser?.id);

  const formatTime = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
    return `${Math.floor(diff / 86400000)} hari lalu`;
  };

  // Find room linked to a request
  const findRoomForRequest = (reqId) => rooms.find(r => r.request_id === reqId);

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #E07070, #9B89CC)', padding: '48px 20px 24px' }}>
        <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 2 }}>
          Permintaan Ta'aruf
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>Kelola permintaan masuk dan yang terkirim</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {[
            { key: 'masuk', label: `Masuk (${incoming.filter(r => r.status === 'pending').length})` },
            { key: 'terkirim', label: `Terkirim (${outgoing.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '9px 18px', borderRadius: 'var(--radius-pill)', border: 'none',
              background: tab === t.key ? 'white' : 'rgba(255,255,255,0.2)',
              color: tab === t.key ? 'var(--purple-500)' : 'rgba(255,255,255,0.85)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif", transition: 'all 0.2s',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 16px 100px' }} className="requests-content">
        {tab === 'masuk' ? (
          incoming.length === 0 ? (
            <EmptyState icon={Heart} text="Belum ada permintaan masuk" />
          ) : (
            incoming.map((req, i) => {
              // from_profile is embedded by the DB query join
              const profile = req.from_profile;
              if (!profile) return null;
              const room = findRoomForRequest(req.id);
              const colorIndex = Math.abs((profile.id || '').charCodeAt(0)) % 6;
              return (
                <motion.div key={req.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <RequestCard
                    profile={{ ...profile, colorIndex }}
                    req={req}
                    type="incoming"
                    time={formatTime(req.created_at)}
                    onView={() => navigate(`/profile/${profile.id}`)}
                    onAccept={() => acceptRequest(req.id)}
                    onReject={() => rejectRequest(req.id)}
                    onOpenRoom={room ? () => navigate(`/room/${room.id}`) : null}
                  />
                </motion.div>
              );
            })
          )
        ) : (
          outgoing.length === 0 ? (
            <EmptyState icon={Send} text="Belum ada permintaan terkirim" />
          ) : (
            outgoing.map((req, i) => {
              const profile = req.to_profile;
              if (!profile) return null;
              const room = findRoomForRequest(req.id);
              const colorIndex = Math.abs((profile.id || '').charCodeAt(0)) % 6;
              return (
                <motion.div key={req.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <RequestCard
                    profile={{ ...profile, colorIndex }}
                    req={req}
                    type="outgoing"
                    time={formatTime(req.created_at)}
                    onView={() => navigate(`/profile/${profile.id}`)}
                    onOpenRoom={room ? () => navigate(`/room/${room.id}`) : null}
                  />
                </motion.div>
              );
            })
          )
        )}
      </div>

      <BottomNav />
    </div>
  );
}


function RequestCard({ profile, req, type, time, onView, onAccept, onReject, onOpenRoom }) {
  const statusConfig = {
    pending:          { color: 'var(--warning)', bg: '#FFF3E0', icon: Clock, label: 'Menunggu' },
    approved_by_user: { color: '#9B89CC',        bg: '#EAE3FF', icon: Clock, label: 'Menunggu Admin' },
    accepted:         { color: 'var(--success)', bg: '#E6F9F0', icon: Check, label: 'Disetujui' },
    rejected:         { color: 'var(--danger)',  bg: '#FFEFEF', icon: X, label: 'Ditolak' },
    sent:             { color: 'var(--blue-500)',bg: 'var(--blue-50)', icon: Send, label: 'Terkirim' },
  };
  const sc = statusConfig[req.status] || statusConfig.pending;
  const StatusIcon = sc.icon;

  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
      {/* Profile row */}
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={onView} style={{ cursor: 'pointer' }}>
          <ProfileAvatar colorIndex={profile.colorIndex} size="sm" revealed={false} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{(profile.name || '—').split(' ').slice(0, 2).join(' ')}</span>
            <MatchBadge score={profile.matchScore} size="sm" />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{profile.age ? `${profile.age} th` : ''} • {profile.city || '—'} • {time}</p>
        </div>
        <div style={{ padding: '5px 10px', borderRadius: 20, background: sc.bg, display: 'flex', alignItems: 'center', gap: 5 }}>
          <StatusIcon size={12} color={sc.color} />
          <span style={{ fontSize: 11, fontWeight: 700, color: sc.color }}>{sc.label}</span>
        </div>
      </div>

      {/* Message preview */}
      {req.message && (
        <div style={{ margin: '0 16px 14px', padding: '12px 14px', background: 'var(--bg)', borderRadius: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
            "{req.message.length > 120 ? req.message.slice(0, 120) + '...' : req.message}"
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 10 }}>
        {type === 'incoming' && req.status === 'pending' && (
          <>
            <button onClick={onView} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
              Lihat CV
            </button>
            <button onClick={onReject} className="btn btn-danger-outline btn-sm" style={{ flex: 1 }}>
              <X size={14} /> Tolak
            </button>
            <button onClick={onAccept} className="btn btn-success btn-sm" style={{ flex: 1.5 }}>
              <Check size={14} /> Terima
            </button>
          </>
        )}
        {type === 'incoming' && req.status === 'approved_by_user' && (
          <div style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: '#EAE3FF', textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7E6BAF' }}>⏳ Menunggu persetujuan admin untuk membuka ruang ta'aruf</p>
          </div>
        )}
        {type === 'incoming' && req.status === 'accepted' && (
          <button onClick={onOpenRoom} className="btn btn-primary btn-full btn-sm">
            Buka Ruang Ta'aruf →
          </button>
        )}
        {type === 'outgoing' && req.status === 'approved_by_user' && (
          <div style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: '#EAE3FF', textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7E6BAF' }}>⏳ Diterima — menunggu persetujuan admin</p>
          </div>
        )}
        {type === 'outgoing' && req.status !== 'approved_by_user' && (
          <button onClick={onView} className="btn btn-secondary btn-full btn-sm">
            Lihat Profil <ChevronRight size={14} />
          </button>
        )}
        {type === 'incoming' && req.status === 'rejected' && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>Permintaan telah ditolak</p>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 14 }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={30} color="var(--purple-300)" strokeWidth={1.5} />
      </div>
      <p style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>{text}</p>
    </div>
  );
}
