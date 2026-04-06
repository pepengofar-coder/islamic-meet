/**
 * MembershipBadge.jsx
 * Badge kecil untuk ditampilkan di profil card dan user detail
 */
import { Crown, Star, Leaf } from 'lucide-react';
import { getTier } from '../lib/membership';

const ICONS = { gold: Crown, premium: Star, regular: Leaf };

export function MembershipBadge({ tier = 'regular', size = 'sm', showLabel = false }) {
  const config = getTier(tier);
  const Icon = ICONS[tier] || Leaf;

  const sizes = {
    xs: { iconSize: 10, fontSize: 9, padding: '2px 6px', borderRadius: 8, gap: 3 },
    sm: { iconSize: 12, fontSize: 11, padding: '3px 8px', borderRadius: 10, gap: 4 },
    md: { iconSize: 14, fontSize: 13, padding: '5px 12px', borderRadius: 12, gap: 5 },
  };
  const s = sizes[size] || sizes.sm;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: s.gap,
      background: config.colorBg,
      border: `1px solid ${config.colorBorder}`,
      borderRadius: s.borderRadius,
      padding: s.padding,
      fontSize: s.fontSize,
      fontWeight: 800,
      color: config.color,
      fontFamily: "'Nunito', sans-serif",
      whiteSpace: 'nowrap',
    }}>
      <Icon size={s.iconSize} />
      {showLabel ? config.name : config.emoji}
    </span>
  );
}

/**
 * MembershipCard — kartu ringkas di halaman profil
 */
export function MembershipCard({ tier = 'regular', requestsUsed = 0, onUpgrade }) {
  const config = getTier(tier);
  const limit = config.limits.requestsPerMonth;
  const remaining = limit === Infinity ? '∞' : Math.max(0, limit - requestsUsed);

  return (
    <div style={{
      background: config.colorBg,
      border: `1.5px solid ${config.colorBorder}`,
      borderRadius: 16,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: config.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>
        {config.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 14, fontWeight: 700, color: '#2D2A4A' }}>
            Paket {config.name}
          </span>
        </div>
        <p style={{ fontSize: 12, color: '#9896B0', fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
          {remaining} request tersisa bulan ini
        </p>
      </div>
      {tier !== 'gold' && onUpgrade && (
        <button
          onClick={onUpgrade}
          style={{
            background: 'linear-gradient(135deg, #9B89CC, #63A8D8)',
            border: 'none', borderRadius: 10, padding: '7px 12px',
            color: 'white', fontSize: 11, fontWeight: 800,
            cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
            whiteSpace: 'nowrap',
          }}
        >
          Upgrade
        </button>
      )}
    </div>
  );
}
