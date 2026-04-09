import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, MessageSquare, Send,
  Moon, LogOut, Menu, X, ChevronRight, Settings,
  FileText, CreditCard, Heart,
} from 'lucide-react';
import { adminGetBadgeCounts } from '../lib/adminDB';
import '../admin/admin.css';

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState({ unverifiedUsers: 0, pendingRequests: 0 });

  // Load dynamic badge counts
  useEffect(() => {
    adminGetBadgeCounts()
      .then(setBadges)
      .catch(console.error);
  }, [location.pathname]); // Refresh when navigating

  const navItems = [
    { section: 'UTAMA' },
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Pendaftar', badge: badges.unverifiedUsers },
    { path: '/admin/rooms', icon: MessageSquare, label: 'Ruang Ta\'aruf' },
    { path: '/admin/requests', icon: Send, label: 'Permintaan', badge: badges.pendingRequests },
    { path: '/admin/match', icon: Heart, label: 'Pasangkan Ta\'aruf' },
    { section: 'LAINNYA' },
    { path: '/admin/payments', icon: CreditCard, label: 'Pembayaran' },
    { path: '/admin/reports', icon: FileText, label: 'Laporan' },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    navigate('/admin');
  };

  return (
    <div className="admin-root">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="admin-sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-icon">
            <Moon size={20} color="white" strokeWidth={1.5} />
          </div>
          <div>
            <div className="admin-sidebar-brand">IslamicMeet</div>
            <div className="admin-sidebar-brand-sub">ADMIN PANEL</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          {navItems.map((item, i) => {
            if (item.section) return (
              <div key={i} className="admin-nav-section">{item.section}</div>
            );
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                className={`admin-nav-item ${active ? 'active' : ''}`}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              >
                <Icon size={17} className="admin-nav-icon" />
                {item.label}
                {item.badge > 0 && (
                  <span className="admin-nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #9B89CC, #63A8D8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>A</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Admin</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>admin@islamicmeet.id</p>
            </div>
          </div>
          <button
            className="admin-nav-item"
            onClick={handleLogout}
            style={{ color: '#E07070', width: '100%' }}
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Top bar */}
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <button
              onClick={() => setSidebarOpen(s => !s)}
              className="sidebar-toggle"
            >
              <Menu size={18} color="#5E5A7A" />
            </button>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, color: '#9896B0', fontWeight: 600 }}>Admin Panel</p>
              <h2 className="admin-topbar-title">{title}</h2>
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-topbar-date">
              🕐 {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <button onClick={() => navigate('/discover')} className="admin-topbar-app-btn">
              ← Lihat App
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
