import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './responsive.css'
import App from './App.jsx'

// ── Global Error Boundary ────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[IslamicMeet] Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8f6ff, #e8f4ff)',
          padding: '24px', fontFamily: "'Nunito', sans-serif",
          textAlign: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #9B89CC, #63A8D8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, marginBottom: 20, boxShadow: '0 8px 32px #9B89CC40',
          }}>
            🌙
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2D2A4A', marginBottom: 8 }}>
            IslamicMeet
          </h1>
          <p style={{ fontSize: 15, color: '#5E5A7A', marginBottom: 4, fontWeight: 600 }}>
            Terjadi kesalahan saat memuat aplikasi
          </p>
          <p style={{ fontSize: 13, color: '#9896B0', marginBottom: 28, maxWidth: 320, lineHeight: 1.6 }}>
            {this.state.error?.message || 'Silakan refresh halaman atau hubungi admin.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #9B89CC, #63A8D8)',
              color: 'white', border: 'none', borderRadius: 14,
              padding: '13px 32px', fontSize: 14, fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 4px 16px #9B89CC40',
            }}
          >
            🔄 Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
