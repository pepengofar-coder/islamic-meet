import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Heart, ChevronDown, ChevronUp, Share2, Sparkles } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const tips = [
  {
    category: '🏠 Membangun Rumah Tangga',
    color: '#9B89CC',
    items: [
      {
        title: 'Komunikasi yang Efektif',
        content: 'Nabi ﷺ bersabda: "Sebaik-baik kalian adalah yang paling baik terhadap keluarganya" (HR. Tirmidzi).\n\nTips: Luangkan waktu 15 menit setiap hari untuk berbicara tanpa gangguan gawai. Dengarkan dengan penuh perhatian, hindari menyela, dan ekspresikan perasaan dengan kalimat "Saya merasa..." bukan menyalahkan.',
      },
      {
        title: 'Menjaga Keharmonisan',
        content: 'Allah SWT berfirman: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya" (QS. Ar-Rum: 21).\n\nTips: Ucapkan terima kasih atas hal-hal kecil, berikan pujian tulus setiap hari, dan jangan pernah merendahkan pasangan di hadapan orang lain.',
      },
      {
        title: 'Menyelesaikan Konflik',
        content: 'Tips: Jangan tidur dalam keadaan marah. Selesaikan masalah pada hari yang sama. Ingat bahwa Anda dan pasangan adalah satu tim melawan masalah, bukan melawan satu sama lain.\n\nNabi ﷺ tidak pernah membalas keburukan dengan keburukan, tetapi memaafkan dan memaklumi.',
      },
    ],
  },
  {
    category: '💰 Keuangan Keluarga',
    color: '#5EC994',
    items: [
      {
        title: 'Mengelola Nafkah',
        content: 'Allah SWT berfirman: "Hendaklah orang yang mampu memberi nafkah menurut kemampuannya" (QS. At-Talaq: 7).\n\nTips: Buat anggaran keluarga bersama. Alokasikan: 50% kebutuhan pokok, 20% tabungan/investasi, 10% sedekah, 20% keinginan. Biasakan transparan dalam keuangan.',
      },
      {
        title: 'Sedekah Bersama',
        content: 'Nabi ﷺ bersabda: "Sedekah itu tidak mengurangi harta" (HR. Muslim).\n\nTips: Tetapkan toples sedekah rutin bersama pasangan. Mulai dari nominal kecil namun konsisten. InsyaAllah barokah dalam rumah tangga.',
      },
    ],
  },
  {
    category: '👶 Parenting Islami',
    color: '#63A8D8',
    items: [
      {
        title: 'Mendidik Anak dengan Kasih Sayang',
        content: 'Nabi ﷺ bersabda: "Muliakanlah anak-anakmu dan baguskanlah pendidikan mereka" (HR. Ibnu Majah).\n\nTips: Berikan quality time, bacakan kisah para Nabi, biasakan shalat berjamaah, dan jadilah teladan sebelum memerintah.',
      },
      {
        title: 'Kompak dalam Mengasuh',
        content: 'Tips: Diskusikan metode pengasuhan sebelum menikah. Buat kesepakatan bersama tentang batasan, hukuman, dan reward. Jangan bertentangan di hadapan anak.',
      },
    ],
  },
  {
    category: '🤲 Ibadah Bersama',
    color: '#F5A623',
    items: [
      {
        title: 'Shalat Berjamaah di Rumah',
        content: 'Nabi ﷺ bersabda: "Shalat berjamaah lebih utama daripada shalat sendirian dengan 27 derajat" (HR. Bukhari & Muslim).\n\nTips: Jadwalkan minimal shalat Maghrib dan Isya berjamaah bersama keluarga. Gantian menjadi imam jika mampu.',
      },
      {
        title: 'Tilawah & Kajian Bersama',
        content: 'Tips: Luangkan 15-30 menit setelah Subuh atau sebelum tidur untuk membaca Al-Quran bersama. Diskusikan tafsir ayat yang dibaca. Dengarkan kajian/podcast Islami bersama saat berkendara.',
      },
    ],
  },
];

export default function NikahTips() {
  const navigate = useNavigate();
  const [expandedCat, setExpandedCat] = useState(0);
  const [expandedTip, setExpandedTip] = useState(null);

  const handleShare = (tip) => {
    const text = `📖 ${tip.title}\n\n${tip.content}\n\n— IslamicMeet • Platform Ta'aruf Islami`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert('Disalin ke clipboard! 📋')).catch(() => {});
    }
  };

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4A3D7A 0%, #63A8D8 100%)', padding: '44px 20px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 14, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 16 }}>
            <ArrowLeft size={18} color="white" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <BookOpen size={22} color="white" />
            <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 22, fontWeight: 700, color: 'white' }}>Tips Nikah</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            Panduan membangun rumah tangga sakinah, mawaddah, wa rahmah
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 16px 100px' }}>
        {tips.map((cat, ci) => (
          <motion.div key={ci} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.08 }}
            style={{ marginBottom: 12, background: 'white', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}
          >
            {/* Category header */}
            <button onClick={() => setExpandedCat(expandedCat === ci ? -1 : ci)} style={{
              width: '100%', padding: '16px 18px', background: expandedCat === ci ? `${cat.color}08` : 'white',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: "'Nunito', sans-serif",
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{cat.category}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: cat.color, fontWeight: 700, background: `${cat.color}15`, padding: '3px 10px', borderRadius: 20 }}>
                  {cat.items.length} tips
                </span>
                {expandedCat === ci ? <ChevronUp size={16} color={cat.color} /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </div>
            </button>

            {/* Tips list */}
            <AnimatePresence>
              {expandedCat === ci && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cat.items.map((tip, ti) => {
                      const key = `${ci}-${ti}`;
                      const isOpen = expandedTip === key;
                      return (
                        <div key={ti} style={{ background: 'var(--bg)', borderRadius: 14, overflow: 'hidden' }}>
                          <button onClick={() => setExpandedTip(isOpen ? null : key)} style={{
                            width: '100%', padding: '12px 14px', background: 'none', border: 'none',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                            fontFamily: "'Nunito', sans-serif",
                          }}>
                            <Sparkles size={14} color={cat.color} style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>{tip.title}</span>
                            {isOpen ? <ChevronUp size={14} color={cat.color} /> : <ChevronDown size={14} color="var(--text-muted)" />}
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                                <div style={{ padding: '0 14px 14px' }}>
                                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line', fontFamily: "'Nunito', sans-serif" }}>
                                    {tip.content}
                                  </p>
                                  <button onClick={() => handleShare(tip)} style={{
                                    marginTop: 10, display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 14px', borderRadius: 20, background: `${cat.color}12`,
                                    border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                                    color: cat.color, fontFamily: "'Nunito', sans-serif",
                                  }}>
                                    <Share2 size={12} /> Bagikan
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
