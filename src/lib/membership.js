/**
 * membership.js — Konfigurasi tier keanggotaan IslamicMeet
 * Regular | Premium | Gold
 */

export const TIERS = {
  regular: {
    id: 'regular',
    name: 'Regular',
    tagline: 'Mulai perjalanan ta\'aruf',
    price: 0,
    priceLabel: 'Gratis',
    color: '#9896B0',
    colorBg: '#F4F3FA',
    colorBorder: '#D8D5EE',
    emoji: '🌱',
    gradient: 'linear-gradient(135deg, #9896B0, #B8B5D0)',
    limits: {
      requestsPerMonth: 2,
      roomDurationDays: 7,
      canSeeFullProfile: false,
      canFilter: false,
      priorityMatch: false,
      featuredBadge: false,
    },
    features: [
      { text: '2 permintaan ta\'aruf per bulan', included: true },
      { text: 'Durasi ruang 7 hari', included: true },
      { text: 'Profil dasar', included: true },
      { text: 'Filter pencarian lanjutan', included: false },
      { text: 'Lihat profil lengkap', included: false },
      { text: 'Priority matching', included: false },
      { text: 'Badge Premium', included: false },
    ],
  },

  premium: {
    id: 'premium',
    name: 'Premium',
    tagline: 'Untuk pencarian yang lebih serius',
    price: 99000,
    priceLabel: 'Rp 99.000',
    color: '#63A8D8',
    colorBg: '#EBF5FF',
    colorBorder: '#93C3E8',
    emoji: '⭐',
    gradient: 'linear-gradient(135deg, #63A8D8, #4A8EBF)',
    popular: true,
    limits: {
      requestsPerMonth: 10,
      roomDurationDays: 14,
      canSeeFullProfile: true,
      canFilter: true,
      priorityMatch: false,
      featuredBadge: true,
    },
    features: [
      { text: '10 permintaan ta\'aruf per bulan', included: true },
      { text: 'Durasi ruang 14 hari', included: true },
      { text: 'Lihat profil lengkap', included: true },
      { text: 'Filter pencarian lanjutan', included: true },
      { text: 'Badge Premium', included: true },
      { text: 'Priority matching', included: false },
      { text: 'Profil unggulan (featured)', included: false },
    ],
  },

  gold: {
    id: 'gold',
    name: 'Gold',
    tagline: 'Pengalaman ta\'aruf terbaik',
    price: 199000,
    priceLabel: 'Rp 199.000',
    color: '#F5A623',
    colorBg: '#FFF8E6',
    colorBorder: '#FFD98A',
    emoji: '👑',
    gradient: 'linear-gradient(135deg, #F5A623, #E8960D)',
    limits: {
      requestsPerMonth: Infinity,
      roomDurationDays: 30,
      canSeeFullProfile: true,
      canFilter: true,
      priorityMatch: true,
      featuredBadge: true,
    },
    features: [
      { text: 'Permintaan ta\'aruf tak terbatas', included: true },
      { text: 'Durasi ruang 30 hari', included: true },
      { text: 'Lihat profil lengkap', included: true },
      { text: 'Filter pencarian lanjutan', included: true },
      { text: 'Badge Gold + Priority', included: true },
      { text: 'Profil unggulan (featured)', included: true },
      { text: 'Dukungan admin prioritas', included: true },
    ],
  },
};

/** Shorthand helpers */
export const getTier = (tierName) => TIERS[tierName] || TIERS.regular;

export const canSendRequest = (user, currentMonthUsed) => {
  const tier = getTier(user?.membership_tier);
  if (tier.limits.requestsPerMonth === Infinity) return true;
  return currentMonthUsed < tier.limits.requestsPerMonth;
};

export const getRemainingRequests = (user, currentMonthUsed) => {
  const tier = getTier(user?.membership_tier);
  if (tier.limits.requestsPerMonth === Infinity) return '∞';
  return Math.max(0, tier.limits.requestsPerMonth - currentMonthUsed);
};

export const formatPrice = (price) => {
  if (price === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};
