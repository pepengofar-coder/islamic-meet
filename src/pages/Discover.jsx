import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, MapPin, GraduationCap,
  BookOpen, Heart, Star, X, ChevronRight, Briefcase, Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProfileAvatar, MatchBadge } from '../components/Avatar';
import BottomNav from '../components/BottomNav';
import IslamicQuotes from '../components/IslamicQuotes';

const filterDefaults = {
  ageMin: 20, ageMax: 35,
  city: '',
  education: '',
  salat: '',
  smoking: null,
};

export default function Discover() {
  const navigate = useNavigate();
  const { profiles } = useApp();
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState(filterDefaults);

  const filtered = profiles.filter(p => {
    const cv = p.cv || p;
    if (search && !(p.name || '').toLowerCase().includes(search.toLowerCase()) && !(cv.city || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.city && !(cv.city || '').toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.salat && cv.salat !== filters.salat) return false;
    if (filters.smoking !== null && cv.smoking !== filters.smoking) return false;
    return true;
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="discover-header" style={{ background: 'linear-gradient(135deg, #9B89CC, #63A8D8)', padding: '48px 20px 28px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 2 }}>
              Discover
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              {filtered.length} profil ditemukan
            </p>
          </div>
          <button
            onClick={() => setShowFilter(true)}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'white', fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 700 }}
          >
            <Filter size={16} />
            Filter
          </button>
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--purple-300)' }} />
          <input
            style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 'var(--radius-pill)', border: 'none', background: 'rgba(255,255,255,0.95)', fontFamily: "'Nunito', sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            placeholder="Cari nama atau kota..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="discover-grid" style={{ padding: '16px 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {filtered.map((profile, i) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
          >
            <ProfileCard profile={profile} onPress={() => navigate(`/profile/${profile.id}`)} />
          </motion.div>
        ))}
      </div>

      {/* Quick Access Features */}
      <div style={{ padding: '8px 16px 0' }}>
        <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontFamily: "'Nunito', sans-serif" }}>
          ✨ Fitur Lainnya
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { path: '/wedding-prep', emoji: '📋', label: 'Persiapan\nNikah', gradient: 'linear-gradient(135deg, #5EC994, #3DB878)' },
            { path: '/nikah-tips', emoji: '📖', label: 'Tips\nNikah', gradient: 'linear-gradient(135deg, #63A8D8, #4A8EBF)' },
            { path: '/feedback', emoji: '⭐', label: 'Feedback\n& Saran', gradient: 'linear-gradient(135deg, #F5A623, #E08B00)' },
            { path: '/live-chat', emoji: '💬', label: 'Chat\nAdmin', gradient: 'linear-gradient(135deg, #9B89CC, #7B6BAE)' },
          ].map((item, i) => (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              onClick={() => navigate(item.path)}
              style={{
                background: item.gradient, border: 'none', borderRadius: 18,
                padding: '18px 14px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 10, textAlign: 'left',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }}
            >
              <span style={{ fontSize: 26 }}>{item.emoji}</span>
              <span style={{ color: 'white', fontSize: 12, fontWeight: 700, lineHeight: 1.3, fontFamily: "'Nunito', sans-serif", whiteSpace: 'pre-line' }}>
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Islamic Quotes */}
      <div style={{ padding: '14px 16px 24px' }}>
        <IslamicQuotes />
      </div>

      {/* Filter Sheet */}
      <AnimatePresence>
        {showFilter && (
          <FilterSheet filters={filters} onChange={setFilters} onClose={() => setShowFilter(false)} />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

function ProfileCard({ profile, onPress }) {
  const cv = profile.cv || profile;
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onPress}
      style={{
        background: 'white', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        overflow: 'hidden', cursor: 'pointer',
        textAlign: 'left', width: '100%',
        boxShadow: 'var(--shadow-card)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Avatar area */}
      <div style={{ position: 'relative', background: 'linear-gradient(135deg, var(--purple-100), var(--blue-100))', padding: '20px 0 12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ProfileAvatar colorIndex={profile.colorIndex} size="md" revealed={false} />

        {/* Match badge */}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <MatchBadge score={profile.matchScore} size="sm" />
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 12px 14px' }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {(profile.name || '—').split(' ').slice(0, 2).join(' ')}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
          {cv.age || '—'} th • {(cv.city || '—').split(' ')[0]}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          <span style={{ padding: '3px 8px', borderRadius: 20, background: 'var(--blue-50)', color: 'var(--blue-500)', fontSize: 10, fontWeight: 700 }}>
            {(cv.education || '—').split(' ')[0]}
          </span>
          {!cv.smoking && (
            <span style={{ padding: '3px 8px', borderRadius: 20, background: '#E6F9F0', color: '#1E7A50', fontSize: 10, fontWeight: 700 }}>
              🚭
            </span>
          )}
        </div>

        <div style={{ background: 'var(--gradient-primary)', borderRadius: 'var(--radius-pill)', padding: '8px 12px', textAlign: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>
          Lihat CV
        </div>
      </div>
    </motion.button>
  );
}

function FilterSheet({ filters, onChange, onClose }) {
  const salatOptions = ['5 waktu berjamaah', '5 waktu', 'Semua'];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(45,42,74,0.5)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 430, background: 'white', borderRadius: '28px 28px 0 0', padding: '20px 24px 40px' }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 20, fontWeight: 700 }}>Filter Pencarian</h3>
          <button onClick={onClose} style={{ background: 'var(--purple-50)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color="var(--purple-500)" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Kota</label>
            <div className="input-icon-wrapper">
              <MapPin size={16} className="input-icon" />
              <input className="form-input" placeholder="Contoh: Jakarta" value={filters.city} onChange={e => onChange({ ...filters, city: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Shalat</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {salatOptions.map(o => (
                <button key={o} type="button" onClick={() => onChange({ ...filters, salat: o === 'Semua' ? '' : o })}
                  style={{ padding: '11px 16px', borderRadius: 'var(--radius-md)', border: `2px solid ${(o === 'Semua' ? filters.salat === '' : filters.salat === o) ? 'var(--purple-400)' : 'var(--border)'}`, background: (o === 'Semua' ? filters.salat === '' : filters.salat === o) ? 'var(--purple-50)' : 'white', textAlign: 'left', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', gap: 10 }}>
                  <BookOpen size={14} color="var(--purple-300)" /> {o}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status Merokok</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[{ val: null, label: 'Semua' }, { val: false, label: '🚭 Tidak' }, { val: true, label: '🚬 Ya' }].map(opt => (
                <button key={String(opt.val)} type="button" onClick={() => onChange({ ...filters, smoking: opt.val })}
                  style={{ padding: '11px 8px', borderRadius: 'var(--radius-md)', border: `2px solid ${filters.smoking === opt.val ? 'var(--purple-400)' : 'var(--border)'}`, background: filters.smoking === opt.val ? 'var(--purple-50)' : 'white', fontSize: 13, fontWeight: 700, color: filters.smoking === opt.val ? 'var(--purple-600)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-full" onClick={onClose}>
            Terapkan Filter
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
