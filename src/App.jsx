import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';

import SplashScreen    from './pages/SplashScreen';
import Onboarding      from './pages/Onboarding';
import Register        from './pages/Register';
import Login           from './pages/Login';
import ForgotPassword  from './pages/ForgotPassword';
import VerifyIdentity  from './pages/VerifyIdentity';
import Akad            from './pages/Akad';
import ReadinessTest   from './pages/ReadinessTest';
import CVBuilder       from './pages/CVBuilder';
import Discover        from './pages/Discover';
import ProfileView     from './pages/ProfileView';
import Requests        from './pages/Requests';
import Rooms           from './pages/Rooms';
import TaarufRoom      from './pages/TaarufRoom';
import MyProfile       from './pages/MyProfile';
import Pricing         from './pages/Pricing';

// Admin
import AdminLogin      from './admin/AdminLogin';
import AdminDashboard  from './admin/AdminDashboard';
import AdminUsers      from './admin/AdminUsers';
import AdminRooms      from './admin/AdminRooms';
import AdminRequests   from './admin/AdminRequests';
import AdminReports    from './admin/AdminReports';

// ── Guards ────────────────────────────────────────────────────────────────────

/**
 * AdminGuard: cek sessionStorage admin_auth
 */
function AdminGuard({ children }) {
  return sessionStorage.getItem('admin_auth') ? children : <Navigate to="/admin" replace />;
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
  const isAdmin = location.pathname.startsWith('/admin');
  return (
    <div className={isAdmin ? 'app-shell app-shell--admin' : 'app-shell'}>
      {children}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            {/* Public — splash & onboarding */}
            <Route path="/"            element={<SplashScreen />} />
            <Route path="/onboarding"  element={<Onboarding />} />

            {/* Guest-only: redirect to app if already logged in */}
            <Route path="/register"       element={<GuestGuard><Register /></GuestGuard>} />
            <Route path="/login"          element={<GuestGuard><Login /></GuestGuard>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected — vetting phase (auth required, no onboard check) */}
            <Route path="/verify"    element={<AuthGuard><VerifyIdentity /></AuthGuard>} />
            <Route path="/akad"      element={<AuthGuard><Akad /></AuthGuard>} />
            <Route path="/readiness" element={<AuthGuard><ReadinessTest /></AuthGuard>} />

            {/* Protected — setup */}
            <Route path="/cv-builder" element={<AuthGuard><CVBuilder /></AuthGuard>} />

            {/* Protected — main app (require full onboarding) */}
            <Route path="/discover"       element={<AuthGuard requireOnboarded><Discover /></AuthGuard>} />
            <Route path="/profile/:id"    element={<AuthGuard requireOnboarded><ProfileView /></AuthGuard>} />
            <Route path="/requests"       element={<AuthGuard requireOnboarded><Requests /></AuthGuard>} />
            <Route path="/rooms"          element={<AuthGuard requireOnboarded><Rooms /></AuthGuard>} />
            <Route path="/room/:roomId"   element={<AuthGuard requireOnboarded><TaarufRoom /></AuthGuard>} />
            <Route path="/my-profile"     element={<AuthGuard><MyProfile /></AuthGuard>} />
            <Route path="/pricing"        element={<AuthGuard><Pricing /></AuthGuard>} />

            {/* Admin panel */}
            <Route path="/admin"               element={<AdminLogin />} />
            <Route path="/admin/dashboard"     element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/users"         element={<AdminGuard><AdminUsers /></AdminGuard>} />
            <Route path="/admin/rooms"         element={<AdminGuard><AdminRooms /></AdminGuard>} />
            <Route path="/admin/requests"      element={<AdminGuard><AdminRequests /></AdminGuard>} />
            <Route path="/admin/reports"       element={<AdminGuard><AdminReports /></AdminGuard>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AppProvider>
  );
}
