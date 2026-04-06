/**
 * adminDB.js — Supabase data helpers for the admin panel
 * FIXED: column names match actual DB schema (user1_id, user2_id, etc.)
 * RLS policies for anon read are now applied in migration.
 */
import { supabase } from './supabase';

// ── Status resolver ───────────────────────────────────────────────────────────

export function resolveStatus(profile) {
  if (!profile) return 'unverified';
  if (profile.suspended) return 'suspended';
  if (!profile.verified) return 'unverified';
  if (!profile.cv_done) return 'pending';
  return 'active';
}

// ── Users / Profiles ──────────────────────────────────────────────────────────

export async function adminGetProfiles({ search = '', status = 'all', gender = 'all' } = {}) {
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (gender !== 'all') query = query.eq('gender', gender);

  const { data, error } = await query;
  if (error) throw error;

  let result = data || [];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.city || '').toLowerCase().includes(q)
    );
  }

  if (status !== 'all') {
    result = result.filter(u => resolveStatus(u) === status);
  }

  return result;
}

export async function adminVerifyUser(userId) {
  const { error } = await supabase
    .from('profiles')
    .update({ verified: true })
    .eq('id', userId);
  if (error) throw error;
}

export async function adminSuspendUser(userId, suspended = true) {
  const { error } = await supabase
    .from('profiles')
    .update({ suspended })
    .eq('id', userId);
  if (error) throw error;
}

/**
 * Set membership tier for a user (admin action)
 * tier: 'regular' | 'premium' | 'gold'
 * months: number of months (null = indefinite)
 */
export async function adminSetMembership(userId, tier, months = 1) {
  const expiresAt = tier === 'regular'
    ? null
    : new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('profiles')
    .update({ membership_tier: tier, membership_expires_at: expiresAt })
    .eq('id', userId);
  if (error) throw error;
}

// ── Taaruf Rooms ──────────────────────────────────────────────────────────────
// Schema: user1_id, user2_id  (NOT user1, user2)
// Status values: 'active' | 'closed' | 'expired'

export async function adminGetRooms() {
  const { data, error } = await supabase
    .from('taaruf_rooms')
    .select(`
      *,
      user1:profiles!taaruf_rooms_user1_id_fkey(id, name, full_name, gender, city),
      user2:profiles!taaruf_rooms_user2_id_fkey(id, name, full_name, gender, city)
    `)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ── Taaruf Requests ───────────────────────────────────────────────────────────

export async function adminGetRequests() {
  const { data, error } = await supabase
    .from('taaruf_requests')
    .select(`
      *,
      from_profile:profiles!taaruf_requests_from_id_fkey(id, name, full_name, gender, city),
      to_profile:profiles!taaruf_requests_to_id_fkey(id, name, full_name, gender, city)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export async function adminGetStats() {
  // Run all queries in parallel with individual error handling
  const [profilesRes, roomsRes, requestsRes] = await Promise.all([
    supabase.from('profiles').select('id, name, full_name, email, gender, verified, cv_done, created_at, suspended, city'),
    supabase.from('taaruf_rooms').select('id, status, started_at, expires_at, user1_id, user2_id'),
    supabase.from('taaruf_requests').select('id, status, created_at'),
  ]);

  // Throw with descriptive error
  if (profilesRes.error) throw new Error(`Profiles query failed: ${profilesRes.error.message}`);
  if (roomsRes.error) throw new Error(`Rooms query failed: ${roomsRes.error.message}`);
  if (requestsRes.error) throw new Error(`Requests query failed: ${requestsRes.error.message}`);

  const profiles = profilesRes.data || [];
  const rooms    = roomsRes.data    || [];
  const requests = requestsRes.data || [];

  // Counts
  const total      = profiles.length;
  const active     = profiles.filter(p => p.verified && p.cv_done && !p.suspended).length;
  const pending    = profiles.filter(p => p.verified && !p.cv_done && !p.suspended).length;
  const unverified = profiles.filter(p => !p.verified).length;
  const ikhwan     = profiles.filter(p => p.gender === 'ikhwan').length;
  const akhwat     = profiles.filter(p => p.gender === 'akhwat').length;

  const activeRooms  = rooms.filter(r => r.status === 'active').length;
  // 'closed_khitbah' doesn't exist in schema; use 'closed' instead
  const closedRooms  = rooms.filter(r => r.status === 'closed').length;

  const pendingRequests  = requests.filter(r => r.status === 'pending').length;
  const acceptedRequests = requests.filter(r => r.status === 'accepted').length;

  // Registration activity last 14 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const registrationActivity = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (13 - i));
    const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const count = profiles.filter(p => {
      const created = new Date(p.created_at);
      created.setHours(0, 0, 0, 0);
      return created.getTime() === date.getTime();
    }).length;
    return { date: dateStr, count };
  });

  return {
    total, active, pending, unverified,
    ikhwan, akhwat,
    activeRooms, closedRooms,
    pendingRequests, acceptedRequests,
    registrationActivity,
    recentUsers: [...profiles]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8),
  };
}
