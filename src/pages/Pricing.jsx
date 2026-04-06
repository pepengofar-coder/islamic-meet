import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, Crown,
  ArrowLeft, ChevronDown, ChevronUp, Shield, Heart, Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TIERS, getTier, formatPrice } from '../lib/membership';
import BottomNav from '../components/BottomNav';


const FAQ = [
  {
    q: 'Bagaimana cara naik tier keanggotaan?',
    a: 'Setelah memilih tier, Anda akan diarahkan ke halaman pembayaran via transfer bank atau QRIS. Admin akan mengaktifkan keanggotaan Anda dalam 1×24 jam setelah konfirmasi pembayaran.',
  },
  {
    q: 'Apakah bisa membatalkan langganan?',
    a: 'Ya, Anda bisa membatalkan kapan saja. Keanggotaan tetap aktif hingga akhir periode yang dibayarkan.',
  },
  {
    q: 'Apa yang dimaksud "permintaan ta\'aruf"?',
    a: 'Setiap kali Anda mengirim undangan ta\'aruf ke profil lain dihitung sebagai 1 permintaan. Kuota direset setiap awal bulan.',
  },
  {
    q: 'Apakah data saya aman?',
    a: 'Ya, semua data dienkripsi dan dijaga sesuai prinsip syariah — privasi adalah prioritas utama kami.',
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useApp();
  const currentTier = user?.membership_tier || 'regular';
  const [billing, setBilling] = useState('monthly'); // monthly | yearly
  const [selectedTier, setSelectedTier] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const tierList = [TIERS.regular, TIERS.premium, TIERS.gold];

  const handleUpgrade = (tierId) => {
    if (tierId === 'regular') return;
    setSelectedTier(tierId);
  };

  return (
    <div className="page page--no-nav" style={{ background: 'var(--bg)', minHeight: '100dvh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2D2A4A 0%, #4A3D7A 50%, #2D4A7A 100%)',
        padding: '48px 24px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        {[
          { top: -40, right: -40, size: 160, opacity: 0.12 },
          { top: 60, left: -30, size: 100, opacity: 0.08 },
          { bottom: -20, right: 60, size: 80, opacity: 0.1 },
        ].map((orb, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: orb.size, height: orb.size, borderRadius: '50%',
            background: 'white', opacity: orb.opacity,
            top: orb.top, bottom: orb.bottom,
            left: orb.left, right: orb.right,
          }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 20, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 20 }}
          >
            <ArrowLeft size={18} color="white" />
          </button>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Crown size={24} color="#F5A623" />
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                Keanggotaan
              </span>
            </div>
            <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8, lineHeight: 1.2 }}>
              Pilih Paket yang<br />Sesuai Kebutuhanmu
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.5 }}>
              Ta'aruf yang bermakna dimulai dari komitmen yang tepat.
            </p>
          </motion.div>

          {/* Current plan badge */}
          {currentTier !== 'regular' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 14px' }}
            >
              <span style={{ fontSize: 14 }}>{getTier(currentTier).emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'white', fontFamily: "'Nunito', sans-serif" }}>
                Paket aktif: {getTier(currentTier).name}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Billing Toggle */}
      <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: 30, padding: 4, display: 'inline-flex', gap: 2, boxShadow: '0 2px 12px rgba(45,42,74,0.08)', border: '1px solid #E8E3FF' }}>
          {[
            { id: 'monthly', label: 'Bulanan' },
            { id: 'yearly', label: 'Tahunan', badge: 'Hemat 20%' },
          ].map(b => (
            <button
              key={b.id}
              onClick={() => setBilling(b.id)}
              style={{
                padding: '8px 20px', borderRadius: 26, border: 'none', cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 700,
                background: billing === b.id ? 'linear-gradient(135deg, #9B89CC, #63A8D8)' : 'transparent',
                color: billing === b.id ? 'white' : '#5E5A7A',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {b.label}
              {b.badge && (
                <span style={{
                  background: billing === b.id ? 'rgba(255,255,255,0.25)' : '#F5A62322',
                  color: billing === b.id ? 'white' : '#F5A623',
                  fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 10,
                }}>
                  {b.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tier Cards */}
      <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tierList.map((tier, i) => {
          const isActive = currentTier === tier.id;
          const displayPrice = tier.price === 0
            ? 0
            : billing === 'yearly'
              ? Math.floor(tier.price * 12 * 0.8)
              : tier.price;

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'white',
                borderRadius: 24,
                border: `2px solid ${isActive ? tier.color : tier.popular ? tier.color + '40' : '#E8E3FF'}`,
                overflow: 'hidden',
                boxShadow: isActive
                  ? `0 8px 32px ${tier.color}30`
                  : tier.popular
                    ? `0 4px 20px ${tier.color}20`
                    : '0 2px 12px rgba(45,42,74,0.06)',
                position: 'relative',
              }}
            >
              {/* Popular badge */}
              {tier.popular && !isActive && (
                <div style={{
                  position: 'absolute', top: 0, right: 24,
                  background: tier.gradient, color: 'white',
                  fontSize: 11, fontWeight: 800, fontFamily: "'Nunito', sans-serif",
                  padding: '4px 14px', borderRadius: '0 0 12px 12px',
                }}>
                  ⭐ POPULER
                </div>
              )}

              {/* Active badge */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, right: 24,
                  background: tier.gradient, color: 'white',
                  fontSize: 11, fontWeight: 800, fontFamily: "'Nunito', sans-serif",
                  padding: '4px 14px', borderRadius: '0 0 12px 12px',
                }}>
                  ✓ AKTIF
                </div>
              )}

              {/* Header */}
              <div style={{ background: tier.colorBg, padding: '20px 20px 16px', borderBottom: `1px solid ${tier.colorBorder}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: tier.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, boxShadow: `0 4px 12px ${tier.color}40`,
                  }}>
                    {tier.emoji}
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 20, fontWeight: 700, color: '#2D2A4A', marginBottom: 0 }}>
                      {tier.name}
                    </h2>
                    <p style={{ fontSize: 12, color: '#9896B0', fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                      {tier.tagline}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 32, fontWeight: 700, color: tier.color }}>
                    {displayPrice === 0 ? 'Gratis' : formatPrice(displayPrice)}
                  </span>
                  {displayPrice > 0 && (
                    <span style={{ fontSize: 13, color: '#9896B0', fontWeight: 600 }}>
                      /{billing === 'yearly' ? 'tahun' : 'bulan'}
                    </span>
                  )}
                </div>
                {billing === 'yearly' && tier.price > 0 && (
                  <p style={{ fontSize: 11, color: '#5EC994', fontWeight: 700, marginTop: 4 }}>
                    Hemat {formatPrice(tier.price * 12 - displayPrice)} per tahun!
                  </p>
                )}
              </div>

              {/* Feature list */}
              <div style={{ padding: '16px 20px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  {tier.features.map((f, fi) => (
                    <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {f.included
                        ? <CheckCircle size={16} color={tier.color} style={{ flexShrink: 0 }} />
                        : <XCircle size={16} color="#D8D5EE" style={{ flexShrink: 0 }} />
                      }
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: f.included ? '#2D2A4A' : '#B8B5D0',
                        fontFamily: "'Nunito', sans-serif",
                      }}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                {isActive ? (
                  <div style={{
                    background: '#F0EEF8', borderRadius: 14, padding: '13px',
                    textAlign: 'center', fontSize: 14, fontWeight: 700,
                    color: tier.color, fontFamily: "'Nunito', sans-serif",
                  }}>
                    ✓ Paket Aktif Anda
                  </div>
                ) : tier.id === 'regular' ? (
                  <div style={{
                    background: '#F4F3FA', borderRadius: 14, padding: '13px',
                    textAlign: 'center', fontSize: 14, fontWeight: 700,
                    color: '#9896B0', fontFamily: "'Nunito', sans-serif",
                  }}>
                    Paket Dasar
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(tier.id)}
                    style={{
                      width: '100%', padding: '13px', border: 'none', borderRadius: 14,
                      background: tier.gradient, color: 'white',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Nunito', sans-serif",
                      boxShadow: `0 4px 16px ${tier.color}40`,
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    {tier.emoji} Pilih {tier.name}
                    {tier.id === 'gold' && <Crown size={15} />}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison quick stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ margin: '24px 16px 0', background: 'white', borderRadius: 24, padding: '20px', border: '1px solid #E8E3FF' }}
      >
        <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 16, fontWeight: 700, color: '#2D2A4A', marginBottom: 16 }}>
          📊 Perbandingan Cepat
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Nunito', sans-serif" }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontSize: 11, color: '#9896B0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, padding: '6px 8px 6px 0' }}>Fitur</th>
                {tierList.map(t => (
                  <th key={t.id} style={{ textAlign: 'center', fontSize: 12, padding: '6px 8px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: t.color, fontWeight: 800 }}>
                      {t.emoji} {t.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Request/bulan', vals: ['2', '10', '∞'] },
                { label: 'Durasi ruang', vals: ['7 hari', '14 hari', '30 hari'] },
                { label: 'Profil lengkap', vals: ['❌', '✅', '✅'] },
                { label: 'Filter lanjutan', vals: ['❌', '✅', '✅'] },
                { label: 'Priority match', vals: ['❌', '❌', '✅'] },
                { label: 'Featured', vals: ['❌', '❌', '✅'] },
              ].map((row, ri) => (
                <tr key={ri} style={{ borderTop: '1px solid #F0EEF8' }}>
                  <td style={{ fontSize: 12, color: '#5E5A7A', fontWeight: 600, padding: '10px 8px 10px 0' }}>{row.label}</td>
                  {row.vals.map((v, vi) => (
                    <td key={vi} style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, padding: '10px 8px', color: tierList[vi].color }}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ margin: '20px 16px 0' }}
      >
        <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 16, fontWeight: 700, color: '#2D2A4A', marginBottom: 12 }}>
          ❓ Pertanyaan Umum
        </h3>
        {FAQ.map((faq, i) => (
          <motion.div
            key={i}
            style={{ background: 'white', borderRadius: 16, marginBottom: 8, border: '1px solid #E8E3FF', overflow: 'hidden' }}
          >
            <button
              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              style={{
                width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: '#2D2A4A', textAlign: 'left', fontFamily: "'Nunito', sans-serif" }}>
                {faq.q}
              </span>
              {expandedFaq === i
                ? <ChevronUp size={16} color="#9B89CC" style={{ flexShrink: 0 }} />
                : <ChevronDown size={16} color="#9896B0" style={{ flexShrink: 0 }} />
              }
            </button>
            <AnimatePresence>
              {expandedFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p style={{ fontSize: 13, color: '#5E5A7A', lineHeight: 1.6, padding: '0 16px 14px', fontFamily: "'Nunito', sans-serif" }}>
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ margin: '20px 16px 24px', display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}
      >
        {[
          { icon: Shield, text: 'Pembayaran Aman' },
          { icon: Heart, text: 'Sesuai Syariah' },
          { icon: Clock, text: 'Aktif 24 Jam' },
        ].map(({ icon: Icon, text }, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'white', borderRadius: 20, padding: '8px 14px',
            border: '1px solid #E8E3FF', fontSize: 12, fontWeight: 700,
            color: '#5E5A7A', fontFamily: "'Nunito', sans-serif",
          }}>
            <Icon size={13} color="#9B89CC" />
            {text}
          </div>
        ))}
      </motion.div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {selectedTier && (
          <UpgradeModal
            tier={TIERS[selectedTier]}
            billing={billing}
            onClose={() => setSelectedTier(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

function UpgradeModal({ tier, billing, onClose }) {
  const displayPrice = billing === 'yearly'
    ? Math.floor(tier.price * 12 * 0.8)
    : tier.price;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(45,42,74,0.6)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 430, background: 'white', borderRadius: '28px 28px 0 0', padding: '24px 24px 40px' }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E8E3FF', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: tier.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, boxShadow: `0 4px 16px ${tier.color}40`,
          }}>
            {tier.emoji}
          </div>
          <div>
            <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 20, fontWeight: 700, color: '#2D2A4A' }}>
              Upgrade ke {tier.name}
            </h3>
            <p style={{ fontSize: 13, color: tier.color, fontWeight: 700 }}>
              {formatPrice(displayPrice)}/{billing === 'yearly' ? 'tahun' : 'bulan'}
            </p>
          </div>
        </div>

        <div style={{ background: tier.colorBg, borderRadius: 16, padding: '16px', marginBottom: 20, border: `1px solid ${tier.colorBorder}` }}>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 700, color: '#2D2A4A', marginBottom: 10 }}>
            📋 Cara Berlangganan:
          </p>
          <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Hubungi admin via WhatsApp di +62 812-xxxx-xxxx',
              'Beritahu paket yang dipilih dan durasi',
              `Transfer ke BCA: 1234567890 a/n IslamicMeet`,
              'Kirim bukti transfer ke admin',
              'Akun akan diaktifkan dalam 1×24 jam',
            ].map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: tier.gradient, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, color: 'white',
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 12, color: '#5E5A7A', lineHeight: 1.5, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '14px', border: '2px solid #E8E3FF', borderRadius: 14,
              background: 'white', color: '#5E5A7A', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
            }}
          >
            Nanti Saja
          </button>
          <a
            href={`https://wa.me/6281200000000?text=Assalamu'alaikum, saya ingin upgrade ke paket ${tier.name} IslamicMeet (${billing === 'yearly' ? 'Tahunan' : 'Bulanan'}).`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 2, padding: '14px', border: 'none', borderRadius: 14,
              background: tier.gradient, color: 'white',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              textDecoration: 'none',
              boxShadow: `0 4px 16px ${tier.color}40`,
            }}
          >
            💬 WhatsApp Admin
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
