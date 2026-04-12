import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';

import SplashScreen from './pages/SplashScreen';
import Onboarding from './pages/Onboarding';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyIdentity from './pages/VerifyIdentity';
import Akad from './pages/Akad';
import ReadinessTest from './pages/ReadinessTest';
import CVBuilder from './pages/CVBuilder';
import Discover from './pages/Discover';
import ProfileView from './pages/ProfileView';
import Requests from './pages/Requests';
import Rooms from './pages/Rooms';
import TaarufRoom from './pages/TaarufRoom';
import MyProfile from './pages/MyProfile';
import Pricing from './pages/Pricing';
import LiveChat from './pages/LiveChat';
import WeddingPrep from './pages/WeddingPrep';
import NikahTips from './pages/NikahTips';
import Feedback from './pages/Feedback';

// Admin
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminRooms from './admin/AdminRooms';
import AdminRequests from './admin/AdminRequests';
import AdminReports from './admin/AdminReports';
import AdminPayments from './admin/AdminPayments';
import AdminMatch from './admin/AdminMatch';
import AdminUpgradeRequests from './admin/AdminUpgradeRequests';
import AdminChat from './admin/AdminChat';

// Components
import WhatsAppButton from './components/WhatsAppButton';

// ── Guards ────────────────────────────────────────────────────────────────────

/**
 * AdminGuard: cek sessionStorage admin_auth
 */
function AdminGuard({ children }) {
  return sessionStorage.getItem('admin_auth') ? children : <Navigate to="/admin280292" replace />;
}

/**
 * AuthGuard: cek Supabase auth session
 * Jika belum login → redirect ke /login
 * Jika sudah login tapi belum onboard → redirect ke step berikutnya
 */
function AuthGuard({ children, requireOnboarded = false }) {
  const { authUser, loading, getNextStep, isOnboarded } = useApp();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '3px solid #E8E3FF', borderTopColor: '#9B89CC',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: '#9896B0', fontSize: 14, fontFamily: "'Nunito', sans-serif" }}>Memuat...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireOnboarded && !isOnboarded) {
    return <Navigate to={getNextStep()} replace />;
  }

  return children;
}

/**
 * GuestGuard: redirect ke app jika sudah login (untuk login/register page)
 */
function GuestGuard({ children }) {
  const { authUser, loading, isOnboarded, getNextStep } = useApp();

  if (loading) return null;

  if (authUser) {
    return <Navigate to={isOnboarded ? '/discover' : getNextStep()} replace />;
  }
  return children;
}

// ── AppShell ──────────────────────────────────────────────────────────────────
function AppShell({ children }) {
  const location = useLocation();
  const { authUser } = useApp();
  const isAdmin = location.pathname.startsWith('/admin280292');
  const showWhatsApp = !!authUser && !isAdmin;
  return (
    <div className={isAdmin ? 'app-shell app-shell--admin' : 'app-shell'}>
      {children}
      {showWhatsApp && <WhatsAppButton />}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
    <AppProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            {/* Public — splash & onboarding */}
            <Route path="/" element={<ErrorBoundary><SplashScreen /></ErrorBoundary>} />
            <Route path="/onboarding" element={<ErrorBoundary><Onboarding /></ErrorBoundary>} />

            {/* Guest-only: redirect to app if already logged in */}
            <Route path="/register" element={<GuestGuard><ErrorBoundary><Register /></ErrorBoundary></GuestGuard>} />
            <Route path="/login" element={<GuestGuard><ErrorBoundary><Login /></ErrorBoundary></GuestGuard>} />
            <Route path="/forgot-password" element={<ErrorBoundary><ForgotPassword /></ErrorBoundary>} />

            {/* Protected — vetting phase (auth required, no onboard check) */}
            <Route path="/verify" element={<AuthGuard><ErrorBoundary><VerifyIdentity /></ErrorBoundary></AuthGuard>} />
            <Route path="/akad" element={<AuthGuard><ErrorBoundary><Akad /></ErrorBoundary></AuthGuard>} />
            <Route path="/readiness" element={<AuthGuard><ErrorBoundary><ReadinessTest /></ErrorBoundary></AuthGuard>} />

            {/* Protected — setup */}
            <Route path="/cv-builder" element={<AuthGuard><ErrorBoundary><CVBuilder /></ErrorBoundary></AuthGuard>} />

            {/* Protected — main app (require full onboarding) */}
            <Route path="/discover" element={<AuthGuard requireOnboarded><ErrorBoundary><Discover /></ErrorBoundary></AuthGuard>} />
            <Route path="/profile/:id" element={<AuthGuard requireOnboarded><ErrorBoundary><ProfileView /></ErrorBoundary></AuthGuard>} />
            <Route path="/requests" element={<AuthGuard requireOnboarded><ErrorBoundary><Requests /></ErrorBoundary></AuthGuard>} />
            <Route path="/rooms" element={<AuthGuard requireOnboarded><ErrorBoundary><Rooms /></ErrorBoundary></AuthGuard>} />
            <Route path="/room/:roomId" element={<AuthGuard requireOnboarded><ErrorBoundary><TaarufRoom /></ErrorBoundary></AuthGuard>} />
            <Route path="/my-profile" element={<AuthGuard><ErrorBoundary><MyProfile /></ErrorBoundary></AuthGuard>} />
            <Route path="/pricing" element={<AuthGuard><ErrorBoundary><Pricing /></ErrorBoundary></AuthGuard>} />
            <Route path="/live-chat" element={<AuthGuard requireOnboarded><ErrorBoundary><LiveChat /></ErrorBoundary></AuthGuard>} />
            <Route path="/wedding-prep" element={<AuthGuard requireOnboarded><ErrorBoundary><WeddingPrep /></ErrorBoundary></AuthGuard>} />
            <Route path="/nikah-tips" element={<AuthGuard requireOnboarded><ErrorBoundary><NikahTips /></ErrorBoundary></AuthGuard>} />
            <Route path="/feedback" element={<AuthGuard requireOnboarded><ErrorBoundary><Feedback /></ErrorBoundary></AuthGuard>} />

            {/* Admin panel — custom route /admin280292 */}
            <Route path="/admin280292" element={<ErrorBoundary><AdminLogin /></ErrorBoundary>} />
            <Route path="/admin280292/dashboard" element={<AdminGuard><ErrorBoundary><AdminDashboard /></ErrorBoundary></AdminGuard>} />
            <Route path="/admin280292/users" element={<AdminGuard><ErrorBoundary><AdminUsers /></ErrorBoundary></AdminGuard>} />
            <Route path="/admin280292/rooms" element={<AdminGuard><ErrorBoundary><AdminRooms /></ErrorBoundary></AdminGuard>} />
            <Route path="/admin280292/requests" element={<AdminGuard><ErrorBoundary><AdminRequests /></ErrorBoundary></AdminGuard>} />
            <Route path="/admin280292/reports" element={<AdminGuard><ErrorBoundary><AdminReports /></ErrorBoundary></AdminGuard>} />
            <Route path="/admin280292/payments" element={<AdminGuard><ErrorBoundary><AdminPayments /></ErrorBoundary></AdminGuard>} />
            <Route path="/admin280292/match" element={<AdminGuard><ErrorBoundary><AdminMatch /></ErrorBoundary></AdminGuard>} />
            <Route path="/admin280292/upgrade-requests" element={<AdminGuard><ErrorBoundary><AdminUpgradeRequests /></ErrorBoundary></AdminGuard>} />
            <Route path="/admin280292/chat" element={<AdminGuard><ErrorBoundary><AdminChat /></ErrorBoundary></AdminGuard>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AppProvider>
    </ErrorBoundary>
  );
}
