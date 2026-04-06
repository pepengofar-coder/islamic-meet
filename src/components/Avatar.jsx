import { avatarColors } from '../data/mockData';
import { 
  User, Lock, Star
} from 'lucide-react';

// Abstract Islamic geometric avatar — no faces, beautiful patterns
export function ProfileAvatar({ colorIndex = 0, size = 'md', revealed = false, style = {} }) {
  const scheme = avatarColors[colorIndex % avatarColors.length];
  const sizes = { sm: 48, md: 72, lg: 100, xl: 140, hero: 180 };
  const px = sizes[size] || 72;

  return (
    <div
      style={{
        width: px, height: px,
        borderRadius: '50%',
        background: scheme.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Geometric Islamic pattern overlay */}
      <svg
        width={px} height={px}
        viewBox="0 0 100 100"
        style={{ position: 'absolute', inset: 0, opacity: 0.18 }}
      >
        {/* 8-pointed star pattern */}
        <polygon points="50,5 61,35 93,35 68,57 79,91 50,70 21,91 32,57 7,35 39,35" fill={scheme.icon} />
        <circle cx="50" cy="50" r="20" fill="none" stroke={scheme.icon} strokeWidth="1.5" />
        <circle cx="50" cy="50" r="35" fill="none" stroke={scheme.icon} strokeWidth="0.8" />
      </svg>

      {/* Blur overlay when not revealed */}
      {!revealed && (
        <div style={{
          position: 'absolute', inset: 0,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          background: 'rgba(155, 137, 204, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',
        }}>
          <Lock size={px * 0.25} color={scheme.icon} strokeWidth={2} />
        </div>
      )}

      {revealed && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <User size={px * 0.38} color={scheme.icon} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

// Card-style blurred hero image for profile pages
export function HeroAvatar({ colorIndex = 0, revealed = false }) {
  const scheme = avatarColors[colorIndex % avatarColors.length];

  return (
    <div
      style={{
        width: '100%',
        height: 240,
        background: scheme.bg,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Geometric background */}
      <svg width="100%" height="100%" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
        {/* Arabic geometric grid */}
        {[...Array(5)].map((_, i) =>
          [...Array(4)].map((_, j) => (
            <polygon
              key={`${i}-${j}`}
              points={`${i*90+45},${j*70+10} ${i*90+72},${j*70+45} ${i*90+45},${j*70+80} ${i*90+18},${j*70+45}`}
              fill="none"
              stroke={scheme.icon}
              strokeWidth="1.2"
            />
          ))
        )}
        <circle cx="200" cy="120" r="80" fill={scheme.icon} opacity="0.08" />
        <circle cx="200" cy="120" r="55" fill="none" stroke={scheme.icon} strokeWidth="2" />
        <circle cx="200" cy="120" r="30" fill="none" stroke={scheme.icon} strokeWidth="1" />
      </svg>

      {/* Central icon (silhouette style, no face) */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          <User size={40} color="white" strokeWidth={1.5} />
        </div>
      </div>

      {/* Privacy lock overlay */}
      {!revealed && (
        <div style={{
          position: 'absolute', inset: 0,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'rgba(155, 137, 204, 0.2)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 8, zIndex: 3,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lock size={24} color={scheme.icon} />
          </div>
          <p style={{ color: 'white', fontSize: 13, fontWeight: 700, textAlign: 'center', maxWidth: 180 }}>
            Foto terlihat setelah ta'aruf disetujui
          </p>
        </div>
      )}
    </div>
  );
}

// Match percentage badge
export function MatchBadge({ score, size = 'md' }) {
  const getColor = (s) => {
    if (s >= 85) return 'linear-gradient(135deg, #5EC994, #3DB878)';
    if (s >= 70) return 'linear-gradient(135deg, #9B89CC, #63A8D8)';
    return 'linear-gradient(135deg, #F5A623, #E08B00)';
  };
  const sizes = { sm: 44, md: 54, lg: 64 };
  const px = sizes[size] || 54;

  return (
    <div style={{
      width: px, height: px,
      borderRadius: '50%',
      background: getColor(score),
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(155, 137, 204, 0.4)',
      flexShrink: 0,
    }}>
      <span style={{ color: 'white', fontWeight: 800, fontSize: px * 0.26, lineHeight: 1 }}>{score}%</span>
      <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: px * 0.16, fontWeight: 600 }}>match</span>
    </div>
  );
}
