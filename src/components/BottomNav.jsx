import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Heart, MessageCircle, User, Crown, Moon, Menu, X, Sparkles,
  Headphones, MessageSquare, BookOpen, CheckSquare, Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getTier } from '../lib/membership';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingRequestsCount, activeRoomsCount, user } = useApp();
  const tier = getTier(user?.membership_tier);
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainTabs = [
    { path: '/discover', icon: Search, label: 'Discover', desc: 'Temukan pasangan terbaik' },
    { path: '/requests', icon: Heart, label: 'Permintaan', badge: pendingRequestsCount, desc: "Kelola permintaan ta'aruf" },
    { path: '/rooms', icon: MessageCircle, label: "Ta'aruf", badge: activeRoomsCount, desc: 'Ruang percakapan aktif' },
    { path: '/pricing', icon: Crown, label: 'Upgrade', tierEmoji: tier.id !== 'regular' ? tier.emoji : null, desc: 'Tingkatkan fitur akun' },
    { path: '/my-profile', icon: User, label: 'Profil', desc: 'Kelola profil & CV digital' },
  ];

  const extraTabs = [
    { path: '/wedding-prep', icon: CheckSquare, label: 'Persiapan Nikah', desc: 'Checklist pernikahan Islami' },
    { path: '/nikah-tips', icon: BookOpen, label: 'Tips Nikah', desc: 'Panduan rumah tangga sakinah' },
    { path: '/feedback', icon: Star, label: 'Feedback', desc: 'Saran & masukan Anda' },
    { path: '/live-chat', icon: Headphones, label: 'Chat Admin', desc: 'Bantuan langsung dari admin' },
  ];

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const NavItem = ({ path, icon: Icon, label, badge, tierEmoji, desc, isMobile }) => {
    const active = location.pathname === path || location.pathname.startsWith(path + '/');
    if (isMobile) {
      return (
        <motion.button
          whileTap={{ scale: 0.97 }}
          className={`mobile-nav-item ${active ? 'active' : ''}`}
          onClick={() => handleNav(path)}
        >
          <div className="mobile-nav-icon-wrap" style={{ background: active ? 'var(--gradient-primary)' : 'var(--purple-50)' }}>
            <Icon size={18} color={active ? 'white' : 'var(--purple-400)'} strokeWidth={active ? 2.5 : 1.8} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: active ? 'var(--purple-500)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {label}
              {tierEmoji && <span style={{ fontSize: 13 }}>{tierEmoji}</span>}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{desc}</span>
          </div>
          {badge > 0 && <span className="mobile-nav-badge">{badge}</span>}
          {active && <div className="mobile-nav-active-dot" />}
        </motion.button>
      );
    }
    return (
      <button
        className={`desktop-nav-item ${active ? 'active' : ''}`}
        onClick={() => navigate(path)}
      >
        <div className="desktop-nav-icon-wrap">
          <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
        </div>
        <span className="desktop-nav-label">
          {label}
          {tierEmoji && <span style={{ fontSize: 13 }}> {tierEmoji}</span>}
        </span>
        {badge > 0 && <span className="desktop-nav-badge">{badge}</span>}
      </button>
    );
  };

  return (
    <>
      {/* ── Mobile: Hamburger FAB ────────────────────────────── */}
      <button
        className="mobile-nav-toggle"
        onClick={() => setMobileOpen(prev => !prev)}
        aria-label="Toggle menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          {mobileOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} color="white" />
            </motion.div>
          ) : (
            <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Menu size={22} color="white" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* ── Mobile: Slide-up drawer ──────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-nav-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="mobile-nav-drawer"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            >
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 12px' }} />

              {/* Brand */}
              <div className="mobile-nav-brand">
                <div className="nav-brand-logo">
                  <Moon size={20} color="white" strokeWidth={1.5} />
                  <Sparkles size={10} color="rgba(255,255,255,0.7)" style={{ position: 'absolute', top: 2, right: 2 }} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--purple-600)', lineHeight: 1.2 }}>IslamicMeet</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Platform Ta'aruf Terpercaya</p>
                </div>
              </div>

              {/* Scrollable content */}
              <div style={{ maxHeight: 'calc(70dvh - 120px)', overflowY: 'auto', overflowX: 'hidden' }}>
                {/* Main nav */}
                <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 14px 4px' }}>Menu Utama</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {mainTabs.map(t => <NavItem key={t.path} {...t} isMobile />)}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--border)', margin: '10px 14px' }} />

                {/* Extra menus */}
                <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '4px 14px 4px' }}>Lainnya</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {extraTabs.map(t => <NavItem key={t.path} {...t} isMobile />)}
                </div>
              </div>

              {/* Footer doa */}
              <div style={{ marginTop: 10, padding: '12px 16px', background: 'var(--gradient-soft)', borderRadius: 16, textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.5 }}>
                  🌙 Bismillah, semoga Allah<br/>memberkahi proses ta'arufmu
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop: Sidebar nav ──── */}
      <nav className="desktop-sidebar-nav">
        <div className="desktop-nav-brand">
          <div className="nav-brand-logo nav-brand-logo--lg">
            <Moon size={22} color="white" strokeWidth={1.5} />
            <Sparkles size={11} color="rgba(255,255,255,0.7)" style={{ position: 'absolute', top: 2, right: 2 }} />
          </div>
          <div>
            <p style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--purple-600)', lineHeight: 1.2 }}>IslamicMeet</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Platform Ta'aruf</p>
          </div>
        </div>

        <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '10px 22px 4px' }}>Menu Utama</p>
        {mainTabs.map(t => <NavItem key={t.path} {...t} />)}

        <div style={{ height: 1, background: 'var(--border)', margin: '8px 22px' }} />
        <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '4px 22px 4px' }}>Lainnya</p>
        {extraTabs.map(t => <NavItem key={t.path} {...t} />)}

        <div className="desktop-nav-footer">
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.5 }}>
            🌙 Bismillah, semoga Allah<br/>memberkahi proses ta'arufmu
          </p>
        </div>
      </nav>
    </>
  );
}
