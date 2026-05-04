import { supabase } from './supabase';

// ─── PROFILES ─────────────────────────────────────────────────────────────────

/**
 * Ambil profil user berdasarkan auth user ID
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Simpan / update profil user (upsert)
 */
export async function upsertProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Ambil semua profil aktif untuk Discover (lawan gender)
 * gender: 'ikhwan' | 'akhwat'
 */
export async function getDiscoverProfiles(myId, oppositeGender) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('gender', oppositeGender)
    .eq('is_active', true)
    .eq('cv_done', true)
    .neq('id', myId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ─── TAARUF REQUESTS ──────────────────────────────────────────────────────────

/**
 * Ambil semua request yang melibatkan user ini (dikirim + diterima)
 */
export async function getRequests(userId) {
  const { data, error } = await supabase
    .from('taaruf_requests')
    .select(`
      *,
      from_profile:from_id(id, name, full_name, gender, city, job, education, birth_place, birth_date),
      to_profile:to_id(id, name, full_name, gender, city, job, education, birth_place, birth_date)
    `)
    .or(`from_id.eq.${userId},to_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Kirim request ta'aruf ke profil lain
 */
export async function sendTaarufRequest(fromId, toId, message) {
  const { data, error } = await supabase
    .from('taaruf_requests')
    .insert({ from_id: fromId, to_id: toId, message, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update status request (accept / reject / cancel)
 */
export async function updateRequestStatus(requestId, status) {
  const { data, error } = await supabase
    .from('taaruf_requests')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── TAARUF ROOMS ─────────────────────────────────────────────────────────────

/**
 * Buat ruang ta'aruf baru setelah request diterima
 */
export async function createRoom(requestId, user1Id, user2Id) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('taaruf_rooms')
    .insert({
      request_id: requestId,
      user1_id: user1Id,
      user2_id: user2Id,
      status: 'active',
      duration_days: 7,
      expires_at: expiresAt,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Ambil semua room yang melibatkan user ini
 */
export async function getRooms(userId) {
  const { data, error } = await supabase
    .from('taaruf_rooms')
    .select(`
      *,
      user1:user1_id(id, name, full_name, gender, city, job, birth_place, birth_date),
      user2:user2_id(id, name, full_name, gender, city, job, birth_place, birth_date)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ─── ROOM MESSAGES ────────────────────────────────────────────────────────────

/**
 * Ambil semua pesan dalam satu room
 */
export async function getMessages(roomId) {
  const { data, error } = await supabase
    .from('room_messages')
    .select(`*, sender:sender_id(id, name, full_name)`)
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * Kirim pesan di room
 */
export async function sendMessage(roomId, senderId, text) {
  const { data, error } = await supabase
    .from('room_messages')
    .insert({ room_id: roomId, sender_id: senderId, text })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Subscribe realtime ke pesan baru di room
 * Returns unsubscribe function
 */
export function subscribeToMessages(roomId, callback) {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'room_messages', filter: `room_id=eq.${roomId}` },
      (payload) => callback(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

// ─── DB → APP STATE MAPPER ────────────────────────────────────────────────────

/**
 * Convert DB profile row → app user format
 */
export function dbProfileToUser(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    gender: profile.gender,
    verified: profile.verified,
    akadSigned: profile.akad_signed,
    readinessDone: profile.readiness_done,
    readinessScore: profile.readiness_score,
    cvDone: profile.cv_done,
    // Membership
    membership_tier: profile.membership_tier || 'regular',
    membership_expires_at: profile.membership_expires_at || null,
    monthly_requests_used: profile.monthly_requests_used || 0,
    cv: {
      fullName: profile.full_name,
      birthPlace: profile.birth_place || '',
      birthDate: profile.birth_date || '',
      city: profile.city,
      education: profile.education,
      job: profile.job,
      incomeRange: profile.income_range,
      bio: profile.bio,
      salat: profile.salat,
      tilawah: profile.tilawah,
      mazhab: profile.mazhab,
      islamicBackground: profile.islamic_background || [],
      bloodType: profile.blood_type,
      smoking: profile.smoking,
      hasChronicIllness: profile.has_chronic_illness,
      illnessDetail: profile.illness_detail,
      exercise: profile.exercise,
      visionLiving: profile.vision_living,
      visionParenting: profile.vision_parenting,
      visionFinance: profile.vision_finance,
      hobbies: profile.hobbies || [],
      criteriaWeights: profile.criteria_weights || { ibadah: 80, vision: 70, health: 60, location: 50, income: 30, hobby: 55 },
      dealBreakers: profile.deal_breakers || [],
    },
  };
}

/**
 * Convert app user/cv format → DB profile columns
 */
export function userToDbProfile(user) {
  return {
    name: user.name || '',
    email: user.email || '',
    gender: user.gender || 'akhwat',
    verified: user.verified || false,
    akad_signed: user.akadSigned || false,
    readiness_done: user.readinessDone || false,
    readiness_score: user.readinessScore || 0,
    cv_done: user.cvDone || false,
    full_name: user.cv?.fullName || '',
    birth_place: user.cv?.birthPlace || '',
    birth_date: user.cv?.birthDate || '',
    city: user.cv?.city || '',
    education: user.cv?.education || '',
    job: user.cv?.job || '',
    income_range: user.cv?.incomeRange || '',
    bio: user.cv?.bio || '',
    salat: user.cv?.salat || '',
    tilawah: user.cv?.tilawah || '',
    mazhab: user.cv?.mazhab || '',
    islamic_background: user.cv?.islamicBackground || [],
    blood_type: user.cv?.bloodType || '',
    smoking: user.cv?.smoking || false,
    has_chronic_illness: user.cv?.hasChronicIllness || false,
    illness_detail: user.cv?.illnessDetail || '',
    exercise: user.cv?.exercise || '',
    vision_living: user.cv?.visionLiving || '',
    vision_parenting: user.cv?.visionParenting || '',
    vision_finance: user.cv?.visionFinance || '',
    hobbies: user.cv?.hobbies || [],
    criteria_weights: user.cv?.criteriaWeights || {},
    deal_breakers: user.cv?.dealBreakers || [],
  };
}
