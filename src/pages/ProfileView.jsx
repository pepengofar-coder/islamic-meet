import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, Heart, Droplets, Wind, Activity,
  BookOpen, MapPin, Briefcase, GraduationCap, Home, Baby,
  DollarSign, Gamepad2, Check, X, CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HeroAvatar, MatchBadge } from '../components/Avatar';
import BottomNav from '../components/BottomNav';

export default function ProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profiles, sendRequest, requests } = useApp();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const profile = profiles.find(p => p.id === id);
  if (!profile) return null;

  const cv = profile.cv || profile;

  const alreadySent = requests.some(r => r.fromId === 'me' && r.toId === id);

  const handleSendRequest = (msg) => {
    sendRequest(id, msg);
    setRequestSent(true);
    setShowRequestModal(false);
  };

  const InfoRow = ({ icon: Icon, label, value, iconColor = 'var(--purple-400)' }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <Icon size={15} color={iconColor} />
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{value}</p>
      </div>
    </div>
  );

  const Section = ({ title, icon: Icon, color, children }) => (
    <div style={{ background: 'white', margin: '0 16px 14px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ padding: '14px 16px 8px', background: `${color}12`, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
        <Icon size={16} color={color} />
        <span style={{ fontSize: 12, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: 0.7 }}>{title}</span>
      </div>
      <div style={{ padding: '4px 16px 12px' }}>{children}</div>
    </div>
  );

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Back button — sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 60, padding: '12px 16px', background: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
        <button onClick={() => navigate(-1)} style={{ pointerEvents: 'all', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}>
          <ArrowLeft size={20} color="var(--purple-500)" />
        </button>
        <div style={{ pointerEvents: 'all' }}>
          <MatchBadge score={profile.matchScore} size="md" />
        </div>
      </div>

      {/* Hero */}
      <HeroAvatar colorIndex={profile.colorIndex} revealed={false} />

      {/* Wrap body in constrained container */}
      <div className="profile-view-body">
      {/* Name section */}
      <div style={{ background: 'white', padding: '20px 20px 16px', marginBottom: 14 }}>
        <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          {profile.name}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{cv.age} tahun</span>
          <span style={{ color: 'var(--border)' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
            <MapPin size={13} /> {cv.city}
          </span>
        </div>
        {cv.bio && (
          <p style={{ marginTop: 10, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic', padding: '10px 14px', background: 'var(--purple-50)', borderRadius: 12, borderLeft: '3px solid var(--purple-300)' }}>
            "{cv.bio}"
          </p>
        )}
      </div>

      {/* Data Diri */}
      <Section title="Data Diri" icon={Briefcase} color="var(--purple-400)">
        <InfoRow icon={GraduationCap} label="Pendidikan" value={cv.education} iconColor="var(--purple-400)" />
        <InfoRow icon={Briefcase} label="Pekerjaan" value={cv.job} iconColor="var(--purple-400)" />
        <InfoRow icon={DollarSign} label="Penghasilan" value={cv.incomeRange} iconColor="var(--purple-400)" />
      </Section>

      {/* Ibadah */}
      <Section title="Data Ibadah" icon={BookOpen} color="var(--blue-500)">
        <InfoRow icon={BookOpen} label="Frekuensi Shalat" value={cv.salat} iconColor="var(--blue-500)" />
        <InfoRow icon={BookOpen} label="Tilawah / Hari" value={cv.tilawah} iconColor="var(--blue-500)" />
        <InfoRow icon={BookOpen} label="Mazhab" value={cv.mazhab} iconColor="var(--blue-500)" />
        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Latar Belakang</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(cv.islamicBackground || []).map(bg => (
              <span key={bg} style={{ padding: '5px 12px', borderRadius: 20, background: 'var(--blue-50)', color: 'var(--blue-500)', fontSize: 12, fontWeight: 700 }}>{bg}</span>
            ))}
          </div>
        </div>
      </Section>

      {/* Kesehatan */}
      <Section title="Data Kesehatan" icon={Heart} color="var(--success)">
        <InfoRow icon={Droplets} label="Golongan Darah" value={cv.bloodType} iconColor="var(--danger)" />
        <InfoRow icon={Wind} label="Merokok" value={cv.smoking ? '🚬 Perokok' : '🚭 Tidak Merokok'} iconColor="var(--success)" />
        <InfoRow icon={Heart} label="Penyakit Kronis" value={cv.hasChronicIllness ? `Ada (${cv.illnessDetail || 'detail dirahasiakan'})` : '✅ Tidak Ada'} iconColor="var(--success)" />
      </Section>

      {/* Visi & Misi */}
      <Section title="Visi & Misi" icon={Home} color="var(--warning)">
        <InfoRow icon={Home} label="Tempat Tinggal" value={cv.visionLiving} iconColor="var(--warning)" />
        <InfoRow icon={Baby} label="Pendidikan Anak" value={cv.visionParenting} iconColor="var(--warning)" />
        <InfoRow icon={DollarSign} label="Keuangan RT" value={cv.visionFinance} iconColor="var(--warning)" />
        {cv.hobbies?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Hobi</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cv.hobbies.map(h => (
                <span key={h} style={{ padding: '5px 12px', borderRadius: 20, background: '#FFF3E0', color: '#7A5010', fontSize: 12, fontWeight: 700 }}>{h}</span>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* CTA */}
      <div style={{ padding: '8px 16px 110px' }}>
        {requestSent || alreadySent ? (
          <div style={{ background: 'linear-gradient(135deg, #E6F9F0, #D4F5E5)', borderRadius: 'var(--radius-xl)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, border: '1px solid #5EC994' }}>
            <CheckCircle size={24} color="var(--success)" />
            <div>
              <p style={{ fontWeight: 800, color: '#1E7A50', marginBottom: 2 }}>Permintaan Terkirim!</p>
              <p style={{ fontSize: 13, color: '#2D7A62' }}>Menunggu konfirmasi dari {profile.name.split(' ')[1]}</p>
            </div>
          </div>
        ) : (
          <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowRequestModal(true)}>
            <Send size={18} />
            Kirim Permintaan Ta'aruf
          </button>
        )}
      </div>

      </div>{/* end profile-view-body */}

      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <RequestModal
            profile={profile}
            onSend={handleSendRequest}
            onClose={() => setShowRequestModal(false)}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

function RequestModal({ profile, onSend, onClose }) {
  const [msg, setMsg] = useState("Assalamu'alaikum, semoga Allah memudahkan. Saya tertarik untuk memulai proses ta'aruf setelah membaca CV Anda. Jazakallah khair.");

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
        style={{ width: '100%', maxWidth: 430, background: 'white', borderRadius: '28px 28px 0 0', padding: '20px 24px 40px' }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
        <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Kirim Permintaan Ta'aruf</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>ke {profile.name}</p>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Pesan Perkenalan</label>
          <textarea className="form-input" rows={4} value={msg} onChange={e => setMsg(e.target.value)} style={{ resize: 'none' }} />
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Jaga adab dalam setiap kata. Bersikaplah jujur dan sopan.</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Batal</button>
          <button className="btn btn-primary" onClick={() => onSend(msg)} disabled={!msg.trim()} style={{ flex: 2 }}>
            <Send size={16} /> Kirim
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
