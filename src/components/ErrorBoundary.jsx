import { Component } from 'react';
import { Moon } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #F4F0FF 0%, #DBEAFE 100%)',
          padding: 24,
        }}>
          <div style={{
            background: 'white',
            borderRadius: 28,
            padding: '40px 28px',
            maxWidth: 380,
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 8px 40px rgba(155, 137, 204, 0.18)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #9B89CC, #63A8D8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Moon size={28} color="white" strokeWidth={1.5} />
            </div>
            <h2 style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 20, fontWeight: 700,
              color: '#2D2A4A', marginBottom: 8,
            }}>Oops! Terjadi Kesalahan</h2>
            <p style={{
              fontSize: 14, color: '#9896B0', lineHeight: 1.6,
              marginBottom: 24,
            }}>
              Halaman mengalami masalah. Coba muat ulang halaman atau kembali ke beranda.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px', borderRadius: 999,
                  background: 'linear-gradient(135deg, #9B89CC, #63A8D8)',
                  color: 'white', border: 'none', fontWeight: 700,
                  fontSize: 14, cursor: 'pointer',
                  fontFamily: "'Nunito', sans-serif",
                  boxShadow: '0 4px 16px rgba(155,137,204,0.35)',
                }}
              >
                Muat Ulang
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                style={{
                  padding: '12px 24px', borderRadius: 999,
                  background: '#F4F0FF', color: '#7E6BAF',
                  border: 'none', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                }}
              >
                Beranda
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
