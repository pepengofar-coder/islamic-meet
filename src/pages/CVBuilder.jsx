import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, BookOpen, Heart, Eye, Target, ArrowLeft, ArrowRight,
  Briefcase, MapPin, GraduationCap, Droplets, Wind, Activity,
  Home, Baby, DollarSign, Gamepad2, Check, Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const steps = [
  { id: 1, label: 'Personal',   icon: User,      color: '#9B89CC' },
  { id: 2, label: 'Ibadah',     icon: BookOpen,   color: '#63A8D8' },
  { id: 3, label: 'Kesehatan',  icon: Heart,      color: '#5EC994' },
  { id: 4, label: 'Visi & Misi',icon: Eye,        color: '#F5A623' },
  { id: 5, label: 'Kriteria',   icon: Target,     color: '#E07070' },
];

function StepHeader({ step, total, title, icon: Icon, color, onBack }) {
  const pct = (step / total) * 100;
  return (
    <div style={{ background: `linear-gradient(135deg, ${color}CC, ${color}88)`, padding: '40px 24px 52px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: -20, right: -15, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 20, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${pct}%` }} style={{ height: '100%', background: 'rgba(255,255,255,0.9)', borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', minWidth: 36 }}>{step}/{total}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color="white" strokeWidth={2} />
        </div>
        <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 22, fontWeight: 700, color: 'white' }}>
          {title}
        </h2>
      </div>
    </div>
  );
}

// ─── Step 1: Personal ───────────────────────────────────────────────────────
function Step1({ data, onChange, onNext, onBack }) {
  const educationOptions = ['SMA/SMK', 'D3', 'S1', 'S2', 'S3', 'Pesantren'];
  const incomeOptions = ['< 3 jt', '3-5 jt', '5-8 jt', '8-12 jt', '12-20 jt', '> 20 jt'];

  return (
    <div>
      <StepHeader step={1} total={5} title="Data Personal" icon={User} color="#9B89CC" onBack={onBack} />
      <div style={{ background: 'white', borderRadius: '28px 28px 0 0', marginTop: -24, padding: '28px 24px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {[
          { label: 'Nama Lengkap', key: 'fullName', ph: 'Nama sesuai KTP', icon: User },
          { label: 'Usia', key: 'age', ph: 'Contoh: 25', icon: User, type: 'number' },
        ].map(({ label, key, ph, icon: Ic, type }) => (
          <div className="form-group" key={key}>
            <label className="form-label">{label}</label>
            <div className="input-icon-wrapper">
              <Ic size={18} className="input-icon" />
              <input className="form-input" type={type || 'text'} placeholder={ph} value={data[key] || ''} onChange={e => onChange({ [key]: e.target.value })} />
            </div>
          </div>
        ))}
        <div className="form-group">
          <label className="form-label">Domisili</label>
          <div className="input-icon-wrapper">
            <MapPin size={18} className="input-icon" />
            <input className="form-input" placeholder="Kota / Kabupaten" value={data.city || ''} onChange={e => onChange({ city: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Pendidikan Terakhir</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {educationOptions.map(o => (
              <button key={o} type="button" onClick={() => onChange({ education: o })}
                style={{ padding: '9px 16px', borderRadius: 'var(--radius-pill)', border: `2px solid ${data.education === o ? 'var(--purple-400)' : 'var(--border)'}`, background: data.education === o ? 'var(--purple-50)' : 'white', fontSize: 13, fontWeight: 700, color: data.education === o ? 'var(--purple-600)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Pekerjaan</label>
          <div className="input-icon-wrapper">
            <Briefcase size={18} className="input-icon" />
            <input className="form-input" placeholder="Contoh: Software Engineer" value={data.job || ''} onChange={e => onChange({ job: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Range Penghasilan</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {incomeOptions.map(o => (
              <button key={o} type="button" onClick={() => onChange({ incomeRange: o })}
                style={{ padding: '9px 16px', borderRadius: 'var(--radius-pill)', border: `2px solid ${data.incomeRange === o ? 'var(--purple-400)' : 'var(--border)'}`, background: data.incomeRange === o ? 'var(--purple-50)' : 'white', fontSize: 13, fontWeight: 700, color: data.incomeRange === o ? 'var(--purple-600)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>
                {o}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary btn-full btn-lg" onClick={onNext} style={{ marginTop: 8 }}>
          Lanjut <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Ibadah ──────────────────────────────────────────────────────────
function Step2({ data, onChange, onNext, onBack }) {
  const salatOptions = ['5 waktu berjamaah', '5 waktu (sendiri)', 'Kadang bolong', 'Sedang belajar'];
  const tilawahOptions = ['1 juz/hari', '5 halaman/hari', '1-3 halaman/hari', '1 halaman/hari', 'Tidak rutin'];
  const mazhabs = ["Syafi'i", 'Hanafi', 'Maliki', 'Hambali', 'Belum tahu'];
  const backgrounds = ['Pesantren', 'Kuliah Agama', 'Halaqah', 'Kursus', 'Otodidak'];

  const toggleBg = (bg) => {
    const curr = data.islamicBackground || [];
    onChange({ islamicBackground: curr.includes(bg) ? curr.filter(b => b !== bg) : [...curr, bg] });
  };

  return (
    <div>
      <StepHeader step={2} total={5} title="Data Ibadah" icon={BookOpen} color="#63A8D8" onBack={onBack} />
      <div style={{ background: 'white', borderRadius: '28px 28px 0 0', marginTop: -24, padding: '28px 24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="form-group">
          <label className="form-label">Frekuensi Shalat</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {salatOptions.map(o => (
              <button key={o} type="button" onClick={() => onChange({ salat: o })}
                style={{ padding: '13px 16px', borderRadius: 'var(--radius-md)', border: `2px solid ${data.salat === o ? 'var(--blue-400)' : 'var(--border)'}`, background: data.salat === o ? 'var(--blue-50)' : 'white', textAlign: 'left', fontSize: 14, fontWeight: data.salat === o ? 700 : 400, color: data.salat === o ? 'var(--blue-500)' : 'var(--text-primary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${data.salat === o ? 'var(--blue-400)' : 'var(--border)'}`, background: data.salat === o ? 'var(--blue-400)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                  {data.salat === o && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                </div>
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Tilawah Per Hari</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {tilawahOptions.map(o => (
              <button key={o} type="button" onClick={() => onChange({ tilawah: o })}
                style={{ padding: '9px 14px', borderRadius: 'var(--radius-pill)', border: `2px solid ${data.tilawah === o ? 'var(--blue-400)' : 'var(--border)'}`, background: data.tilawah === o ? 'var(--blue-50)' : 'white', fontSize: 13, fontWeight: 700, color: data.tilawah === o ? 'var(--blue-500)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Mazhab</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {mazhabs.map(o => (
              <button key={o} type="button" onClick={() => onChange({ mazhab: o })}
                style={{ padding: '9px 14px', borderRadius: 'var(--radius-pill)', border: `2px solid ${data.mazhab === o ? 'var(--blue-400)' : 'var(--border)'}`, background: data.mazhab === o ? 'var(--blue-50)' : 'white', fontSize: 13, fontWeight: 700, color: data.mazhab === o ? 'var(--blue-500)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Latar Belakang Pendidikan Agama</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {backgrounds.map(bg => {
              const sel = (data.islamicBackground || []).includes(bg);
              return (
                <button key={bg} type="button" onClick={() => toggleBg(bg)}
                  style={{ padding: '9px 14px', borderRadius: 'var(--radius-pill)', border: `2px solid ${sel ? 'var(--blue-400)' : 'var(--border)'}`, background: sel ? 'var(--blue-50)' : 'white', fontSize: 13, fontWeight: 700, color: sel ? 'var(--blue-500)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}>
                  {sel && <Check size={13} strokeWidth={3} />}
                  {bg}
                </button>
              );
            })}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Bio Keagamaan (opsional)</label>
          <textarea className="form-input" rows={3} placeholder="Ceritakan perjalanan spiritualmu..." value={data.bio || ''} onChange={e => onChange({ bio: e.target.value })} style={{ resize: 'none' }} />
        </div>
        <button className="btn btn-primary btn-full btn-lg" onClick={onNext} style={{ background: 'linear-gradient(135deg, #63A8D8, #4A8EBF)' }}>
          Lanjut <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Kesehatan ────────────────────────────────────────────────────────
function Step3({ data, onChange, onNext, onBack }) {
  const bloodTypes = ['A', 'B', 'AB', 'O'];
  const exerciseOptions = ['Rutin setiap hari', '3-4x/minggu', '1-2x/minggu', 'Jarang', 'Tidak pernah'];

  return (
    <div>
      <StepHeader step={3} total={5} title="Data Kesehatan" icon={Heart} color="#5EC994" onBack={onBack} />
      <div style={{ background: 'white', borderRadius: '28px 28px 0 0', marginTop: -24, padding: '28px 24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="form-group">
          <label className="form-label">Golongan Darah</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {bloodTypes.map(bt => (
              <button key={bt} type="button" onClick={() => onChange({ bloodType: bt })}
                style={{ flex: 1, padding: '14px 0', borderRadius: 'var(--radius-md)', border: `2px solid ${data.bloodType === bt ? '#5EC994' : 'var(--border)'}`, background: data.bloodType === bt ? '#E6F9F0' : 'white', fontSize: 16, fontWeight: 800, color: data.bloodType === bt ? '#1E7A50' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>
                {bt}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Status Merokok</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[{ val: false, label: 'Tidak Merokok', icon: '✅', active: '#E6F9F0', border: '#5EC994' },
              { val: true, label: 'Perokok', icon: '🚬', active: '#FFF3E0', border: '#F5A623' }].map(opt => (
              <button key={String(opt.val)} type="button" onClick={() => onChange({ smoking: opt.val })}
                style={{ padding: '14px 10px', borderRadius: 'var(--radius-md)', border: `2px solid ${data.smoking === opt.val ? opt.border : 'var(--border)'}`, background: data.smoking === opt.val ? opt.active : 'white', textAlign: 'center', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{opt.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: data.smoking === opt.val ? '#1E7A50' : 'var(--text-secondary)' }}>{opt.label}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Riwayat Penyakit Kronis/Genetik</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[{ val: false, label: 'Tidak Ada', icon: '💚' }, { val: true, label: 'Ada', icon: '⚠️' }].map(opt => (
              <button key={String(opt.val)} type="button" onClick={() => onChange({ hasChronicIllness: opt.val })}
                style={{ padding: '14px 10px', borderRadius: 'var(--radius-md)', border: `2px solid ${data.hasChronicIllness === opt.val ? 'var(--purple-300)' : 'var(--border)'}`, background: data.hasChronicIllness === opt.val ? 'var(--purple-50)' : 'white', textAlign: 'center', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{opt.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: data.hasChronicIllness === opt.val ? 'var(--purple-600)' : 'var(--text-secondary)' }}>{opt.label}</div>
              </button>
            ))}
          </div>
          {data.hasChronicIllness && (
            <motion.input initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="form-input" placeholder="Jelaskan singkat..." value={data.illnessDetail || ''} onChange={e => onChange({ illnessDetail: e.target.value })}
              style={{ marginTop: 10 }} />
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Frekuensi Olahraga</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {exerciseOptions.map(o => (
              <button key={o} type="button" onClick={() => onChange({ exercise: o })}
                style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: `2px solid ${data.exercise === o ? '#5EC994' : 'var(--border)'}`, background: data.exercise === o ? '#E6F9F0' : 'white', textAlign: 'left', fontSize: 14, fontWeight: data.exercise === o ? 700 : 400, color: data.exercise === o ? '#1E7A50' : 'var(--text-primary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s' }}>
                <Activity size={15} color={data.exercise === o ? '#1E7A50' : 'var(--text-muted)'} /> {o}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary btn-full btn-lg" onClick={onNext} style={{ background: 'linear-gradient(135deg, #5EC994, #3DB878)' }}>
          Lanjut <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Visi & Misi ──────────────────────────────────────────────────────
function Step4({ data, onChange, onNext, onBack }) {
  const living = ['Mandiri jauh dari orang tua', 'Mandiri dekat keluarga', 'Ikut orang tua', 'Ikut mertua', 'Fleksibel'];
  const parenting = ['Islamic boarding school', 'Sekolah Islam terpadu', 'Homeschooling islami', 'Sekolah umum + ngaji', 'Berdiskusi bersama'];
  const finance = ['Suami pemimpin finansial', 'Terencana bersama', 'Istri yang kelola', 'Fleksibel sesuai situasi'];
  const hobbies = ['Membaca', 'Memasak', 'Olahraga', 'Traveling', 'Menulis', 'Musik', 'Coding', 'Desain', 'Mengajar', 'Berkebun', 'Fotografi', 'Volunter'];

  const toggleHobby = (h) => {
    const curr = data.hobbies || [];
    onChange({ hobbies: curr.includes(h) ? curr.filter(x => x !== h) : [...curr, h] });
  };

  return (
    <div>
      <StepHeader step={4} total={5} title="Visi & Misi" icon={Eye} color="#F5A623" onBack={onBack} />
      <div style={{ background: 'white', borderRadius: '28px 28px 0 0', marginTop: -24, padding: '28px 24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="form-group">
          <label className="form-label"><Home size={13} style={{ display: 'inline', marginRight: 4 }} />Tempat Tinggal Pasca Menikah</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {living.map(o => (
              <button key={o} type="button" onClick={() => onChange({ visionLiving: o })}
                style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: `2px solid ${data.visionLiving === o ? '#F5A623' : 'var(--border)'}`, background: data.visionLiving === o ? '#FFF3E0' : 'white', textAlign: 'left', fontSize: 14, fontWeight: data.visionLiving === o ? 700 : 400, color: data.visionLiving === o ? '#7A5010' : 'var(--text-primary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label"><Baby size={13} style={{ display: 'inline', marginRight: 4 }} />Visi Pendidikan Anak</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {parenting.map(o => (
              <button key={o} type="button" onClick={() => onChange({ visionParenting: o })}
                style={{ padding: '9px 14px', borderRadius: 'var(--radius-pill)', border: `2px solid ${data.visionParenting === o ? '#F5A623' : 'var(--border)'}`, background: data.visionParenting === o ? '#FFF3E0' : 'white', fontSize: 13, fontWeight: 700, color: data.visionParenting === o ? '#7A5010' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label"><DollarSign size={13} style={{ display: 'inline', marginRight: 4 }} />Manajemen Keuangan RT</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {finance.map(o => (
              <button key={o} type="button" onClick={() => onChange({ visionFinance: o })}
                style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: `2px solid ${data.visionFinance === o ? '#F5A623' : 'var(--border)'}`, background: data.visionFinance === o ? '#FFF3E0' : 'white', textAlign: 'left', fontSize: 14, fontWeight: data.visionFinance === o ? 700 : 400, color: data.visionFinance === o ? '#7A5010' : 'var(--text-primary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label"><Gamepad2 size={13} style={{ display: 'inline', marginRight: 4 }} />Hobi & Minat</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {hobbies.map(h => {
              const sel = (data.hobbies || []).includes(h);
              return (
                <button key={h} type="button" onClick={() => toggleHobby(h)}
                  style={{ padding: '8px 14px', borderRadius: 'var(--radius-pill)', border: `2px solid ${sel ? '#F5A623' : 'var(--border)'}`, background: sel ? '#FFF3E0' : 'white', fontSize: 13, fontWeight: 700, color: sel ? '#7A5010' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}>
                  {sel && <Check size={12} strokeWidth={3} />}
                  {h}
                </button>
              );
            })}
          </div>
        </div>
        <button className="btn btn-primary btn-full btn-lg" onClick={onNext} style={{ background: 'linear-gradient(135deg, #F5A623, #E08B00)' }}>
          Lanjut <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 5: Kriteria ─────────────────────────────────────────────────────────
function Step5({ data, onChange, onDone, onBack }) {
  const criteriaList = [
    { key: 'ibadah', label: 'Kualitas Ibadah', icon: BookOpen, color: '#63A8D8' },
    { key: 'vision', label: 'Keselarasan Visi', icon: Eye, color: '#9B89CC' },
    { key: 'health', label: 'Kesehatan', icon: Heart, color: '#5EC994' },
    { key: 'location', label: 'Domisili', icon: MapPin, color: '#F5A623' },
    { key: 'income', label: 'Penghasilan', icon: DollarSign, color: '#E07070' },
    { key: 'hobby', label: 'Hobi & Lifestyle', icon: Gamepad2, color: '#9B89CC' },
  ];
  const dealBreakerOptions = ['Perokok', 'Riwayat poligami', 'Beda mazhab jauh', 'Terlalu kaku', 'Tinggal sangat jauh'];

  const weights = data.criteriaWeights || {};
  const setWeight = (key, val) => onChange({ criteriaWeights: { ...weights, [key]: val } });
  const dealBreakers = data.dealBreakers || [];
  const toggleDB = (db) => onChange({ dealBreakers: dealBreakers.includes(db) ? dealBreakers.filter(d => d !== db) : [...dealBreakers, db] });

  return (
    <div>
      <StepHeader step={5} total={5} title="Kriteria Pasangan" icon={Target} color="#E07070" onBack={onBack} />
      <div style={{ background: 'white', borderRadius: '28px 28px 0 0', marginTop: -24, padding: '28px 24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -8 }}>
          Geser untuk menentukan seberapa penting kriteria ini bagimu. Ini membantu sistem menghitung persentase kecocokan.
        </p>
        {criteriaList.map(({ key, label, icon: Ic, color }) => {
          const val = weights[key] ?? 60;
          return (
            <div key={key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ic size={16} color={color} />
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color }}>  {val}%</span>
              </div>
              <input
                type="range" min={10} max={100} step={5} value={val}
                onChange={e => setWeight(key, Number(e.target.value))}
                className="slider-input"
                style={{ '--value': `${val}%` }}
              />
            </div>
          );
        })}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <label className="form-label" style={{ marginBottom: 12, display: 'block' }}>Deal-breaker (yang tidak dapat diterima)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {dealBreakerOptions.map(db => {
              const sel = dealBreakers.includes(db);
              return (
                <button key={db} type="button" onClick={() => toggleDB(db)}
                  style={{ padding: '9px 14px', borderRadius: 'var(--radius-pill)', border: `2px solid ${sel ? 'var(--danger)' : 'var(--border)'}`, background: sel ? '#FFEFEF' : 'white', fontSize: 13, fontWeight: 700, color: sel ? 'var(--danger)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}>
                  {sel && '✗ '}{db}
                </button>
              );
            })}
          </div>
        </div>

        <button className="btn btn-success btn-full btn-lg" onClick={onDone} style={{ marginTop: 8 }}>
          <Sparkles size={18} /> Selesai & Simpan CV
        </button>
      </div>
    </div>
  );
}

// ─── Main CV Builder ────────────────────────────────────────────────────────
export default function CVBuilder() {
  const navigate = useNavigate();
  const { user, updateCV, updateUser } = useApp();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const data = user.cv;
  const onChange = (updates) => updateCV(updates);

  const goNext = () => { setDirection(1); setStep(s => s + 1); window.scrollTo(0, 0); };
  const goBack = () => {
    if (step === 1) navigate('/readiness');
    else { setDirection(-1); setStep(s => s - 1); window.scrollTo(0, 0); }
  };

  const handleDone = async () => {
    updateUser({ cvDone: true });
    navigate('/discover');
  };

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit:  (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  const stepProps = { data, onChange };
  const stepComponents = [
    <Step1 {...stepProps} onNext={goNext} onBack={goBack} />,
    <Step2 {...stepProps} onNext={goNext} onBack={goBack} />,
    <Step3 {...stepProps} onNext={goNext} onBack={goBack} />,
    <Step4 {...stepProps} onNext={goNext} onBack={goBack} />,
    <Step5 {...stepProps} onDone={handleDone} onBack={goBack} />,
  ];

  return (
    <div className="page page--no-nav" style={{ minHeight: '100dvh' }}>
      {/* Step tabs */}
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, zIndex: 100, background: 'white', borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', justifyContent: 'center', gap: 6 }}>
        {steps.map(s => (
          <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 52 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step === s.id ? s.color : step > s.id ? `${s.color}33` : 'var(--border)', transition: 'all 0.3s' }}>
              {step > s.id ? <Check size={16} color="#1E7A50" /> : <s.icon size={16} color={step === s.id ? 'white' : 'var(--text-muted)'} />}
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: step === s.id ? s.color : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Scrollable step content */}
      <div style={{ paddingTop: 72 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {stepComponents[step - 1]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
