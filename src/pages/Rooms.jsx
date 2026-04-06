import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, ChevronRight, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProfileAvatar } from '../components/Avatar';
import BottomNav from '../components/BottomNav';

export default function Rooms() {
  const navigate = useNavigate();
  const { rooms, authUser } = useApp();

  // rooms is now an array of DB room objects
  const activeRooms = rooms.filter(r => r.status === 'active');

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div style={{ background: 'linear-gradient(135deg, #63A8D8, #9B89CC)', padding: '48px 20px 24px' }}>
        <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 2 }}>
          Ruang Ta'aruf
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{activeRooms.length} ruang aktif</p>
      </div>

      <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 12, marginTop: -8 }}>
        {activeRooms.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: 14 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={30} color="var(--purple-300)" strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>
              Belum ada ruang ta'aruf aktif
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/discover')}>Mulai dari Discover</button>
          </div>
        ) : (
          activeRooms.map((room, i) => {
            // Determine partner from room data
            const partner = room.user1_id === authUser?.id ? room.user2 : room.user1;
            if (!partner) return null;

            const endDate = new Date(room.expires_at || (new Date(room.started_at).getTime() + (room.duration_days || 7) * 86400000));
            const remainDays = Math.max(0, Math.floor((endDate - Date.now()) / 86400000));
            const partnerName = (partner.full_name || partner.name || '?').split(' ').slice(0, 2).join(' ');
            const colorIndex = Math.abs(partner.id?.charCodeAt(0) || 0) % 6;

            return (
              <motion.button
                key={room.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/room/${room.id}`)}
                style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '16px', display: 'flex', alignItems: 'center', gap: 14, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: "'Nunito', sans-serif", boxShadow: 'var(--shadow-card)', width: '100%' }}
              >
                <ProfileAvatar colorIndex={colorIndex} size="sm" revealed={false} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
                      {partnerName}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 12, background: remainDays <= 2 ? '#FFEFEF' : 'var(--purple-50)' }}>
                      <Clock size={11} color={remainDays <= 2 ? 'var(--danger)' : 'var(--purple-400)'} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: remainDays <= 2 ? 'var(--danger)' : 'var(--purple-400)' }}>{remainDays}h lagi</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Mulai percakapan...
                  </p>
                </div>
                <ChevronRight size={18} color="var(--purple-300)" />
              </motion.button>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
