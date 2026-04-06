import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, MessageCircle, User, Crown, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTier } from '../lib/membership';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingRequestsCount, activeRoomsCount, user } = useApp();
  const tier = getTier(user?.membership_tier);

  const tabs = [
    { path: '/discover', icon: Search, label: 'Discover' },
    { path: '/requests', icon: Heart, label: 'Permintaan', badge: pendingRequestsCount },
    { path: '/rooms', icon: MessageCircle, label: 'Ta\'aruf', badge: activeRoomsCount },
    { path: '/pricing', icon: Crown, label: 'Upgrade', tierEmoji: tier.id !== 'regular' ? tier.emoji : null },
    { path: '/my-profile', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="bottom-nav">
      {/* Desktop-only: brand header (shown via CSS ::before on desktop, 
          but we also need a real React element for proper layout) */}
      <div className="nav-brand-desktop" style={{ display: 'none' }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, var(--purple-400), var(--blue-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Moon size={18} color="white" strokeWidth={1.5} />
        </div>
        <div>
          <p style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--purple-600)', lineHeight: 1.2 }}>IslamicMeet</p>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Platform Ta'aruf</p>
        </div>
      </div>

      {tabs.map(({ path, icon: Icon, label, badge, tierEmoji }) => {
        const active = location.pathname === path || location.pathname.startsWith(path + '/');
        return (
          <button
            key={path}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <div className="nav-icon" style={{ position: 'relative' }}>
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              {badge > 0 && <span className="nav-badge">{badge}</span>}
              {tierEmoji && (
                <span style={{
                  position: 'absolute', top: -4, right: -6,
                  fontSize: 11, lineHeight: 1,
                }}>{tierEmoji}</span>
              )}
            </div>
            <span className="nav-label">{label}</span>
          </button>
        );
      })}

      {/* Desktop-only: footer spacer */}
      <div className="nav-footer-desktop" style={{ display: 'none', marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
          🌙 Bismillah, semoga Allah<br/>memberkahi proses ta'arufmu
        </p>
      </div>
    </nav>
  );
}
