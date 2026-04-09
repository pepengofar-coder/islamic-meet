/**
 * adminDB.js — Supabase data helpers for the admin panel
 * FULL integration with real Supabase data.
 * Provides CRUD for profiles, rooms, requests, and stats.
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

// ── Admin: Update user status directly ────────────────────────────────────────

/**
 * Admin can directly set a user's status fields (verified, cv_done, suspended, etc.)
 */
export async function adminUpdateUserStatus(userId, updates) {
  // updates can include: { verified, cv_done, akad_signed, readiness_done, suspended }
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
}

// ── Admin: Create taaruf pair manually ────────────────────────────────────────

/**
 * Admin creates a taaruf room directly between two users (bypasses request flow)
 */
export async function adminCreateTaarufPair(user1Id, user2Id, durationDays = 7) {
  // 1. Create a request record (for tracking)
  const { data: req, error: reqErr } = await supabase
    .from('taaruf_requests')
    .insert({ from_id: user1Id, to_id: user2Id, status: 'accepted', message: 'Dipasangkan oleh admin' })
    .select()
    .single();
  if (reqErr) throw reqErr;

  // 2. Create the taaruf room
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
  const { data: room, error: roomErr } = await supabase
    .from('taaruf_rooms')
    .insert({
      request_id: req.id,
      user1_id: user1Id,
      user2_id: user2Id,
      status: 'active',
      duration_days: durationDays,
      expires_at: expiresAt,
    })
    .select()
    .single();
  if (roomErr) throw roomErr;
  return room;
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

// ── Taaruf Requests — Admin Actions ───────────────────────────────────────────

export async function adminGetRequests() {
  const { data, error } = await supabase
    .from('taaruf_requests')
    .select(`
      *,
      from_profile:profiles!taaruf_requests_from_id_fkey(id, name, full_name, gender, city, age, job, education),
      to_profile:profiles!taaruf_requests_to_id_fkey(id, name, full_name, gender, city, age, job, education)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Admin approves a request that was already accepted by the user.
 * This creates a taaruf room and sets the request to 'accepted'.
 */
export async function adminApproveRequest(requestId, fromId, toId, durationDays = 7) {
  // 1. Update request status to 'accepted'
  const { error: reqErr } = await supabase
    .from('taaruf_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId);
  if (reqErr) throw reqErr;

  // 2. Create a taaruf room
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
  const { data: room, error: roomErr } = await supabase
    .from('taaruf_rooms')
    .insert({
      request_id: requestId,
      user1_id: fromId,
      user2_id: toId,
      status: 'active',
      duration_days: durationDays,
      expires_at: expiresAt,
    })
    .select()
    .single();
  if (roomErr) throw roomErr;
  return room;
}

/**
 * Admin rejects a request
 */
export async function adminRejectRequest(requestId) {
  const { error } = await supabase
    .from('taaruf_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);
  if (error) throw error;
}

// ── Taaruf Rooms ──────────────────────────────────────────────────────────────

export async function adminGetRooms() {
  const { data, error } = await supabase
    .from('taaruf_rooms')
    .select(`
      *,
      user1:profiles!taaruf_rooms_user1_id_fkey(id, name, full_name, gender, city),
      user2:profiles!taaruf_rooms_user2_id_fkey(id, name, full_name, gender, city)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Admin closes a taaruf room
 */
export async function adminCloseRoom(roomId) {
  const { error } = await supabase
    .from('taaruf_rooms')
    .update({ status: 'closed' })
    .eq('id', roomId);
  if (error) throw error;
}

/**
 * Admin extends room duration by X days
 */
export async function adminExtendRoom(roomId, extraDays = 7) {
  // Get current room
  const { data: room, error: getErr } = await supabase
    .from('taaruf_rooms')
    .select('expires_at, duration_days')
    .eq('id', roomId)
    .single();
  if (getErr) throw getErr;

  const currentExpiry = new Date(room.expires_at).getTime();
  const newExpiry = new Date(currentExpiry + extraDays * 24 * 60 * 60 * 1000).toISOString();
  const newDuration = (room.duration_days || 7) + extraDays;

  const { error } = await supabase
    .from('taaruf_rooms')
    .update({ expires_at: newExpiry, duration_days: newDuration })
    .eq('id', roomId);
  if (error) throw error;
}

/**
 * Get message count for a room
 */
export async function adminGetRoomMessageCount(roomId) {
  const { count, error } = await supabase
    .from('room_messages')
    .select('id', { count: 'exact', head: true })
    .eq('room_id', roomId);
  if (error) return 0;
  return count || 0;
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export async function adminGetStats() {
  // Run all queries in parallel with individual error handling
  const [profilesRes, roomsRes, requestsRes] = await Promise.all([
    supabase.from('profiles').select('id, name, full_name, email, gender, verified, cv_done, created_at, suspended, city, job, education, age'),
    supabase.from('taaruf_rooms').select('id, status, created_at, expires_at, user1_id, user2_id'),
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
  const closedRooms  = rooms.filter(r => r.status === 'closed').length;

  const pendingRequests  = requests.filter(r => r.status === 'pending' || r.status === 'approved_by_user').length;
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

  // Top cities
  const cityMap = {};
  profiles.forEach(p => { if (p.city) cityMap[p.city] = (cityMap[p.city] || 0) + 1; });
  const topCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Top jobs
  const jobMap = {};
  profiles.forEach(p => { if (p.job) jobMap[p.job] = (jobMap[p.job] || 0) + 1; });
  const topJobs = Object.entries(jobMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return {
    total, active, pending, unverified,
    ikhwan, akhwat,
    activeRooms, closedRooms,
    pendingRequests, acceptedRequests,
    registrationActivity,
    topCities, topJobs,
    recentUsers: [...profiles]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8),
  };
}

/**
 * Get sidebar badge counts for admin layout
 */
export async function adminGetBadgeCounts() {
  const [profilesRes, requestsRes] = await Promise.all([
    supabase.from('profiles').select('id, verified', { count: 'exact' }).eq('verified', false),
    supabase.from('taaruf_requests').select('id, status', { count: 'exact' }).in('status', ['pending', 'approved_by_user']),
  ]);

  return {
    unverifiedUsers: profilesRes.data?.length || 0,
    pendingRequests: requestsRes.data?.length || 0,
  };
}

// ── Payment / Membership Report ───────────────────────────────────────────────

const TIER_PRICING = { regular: 0, premium: 99000, gold: 199000 };

export async function adminGetPaymentReport() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, full_name, email, gender, membership_tier, membership_expires_at, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const profiles = data || [];
  const totalUsers = profiles.length;
  const regularCount = profiles.filter(p => (p.membership_tier || 'regular') === 'regular').length;
  const premiumCount = profiles.filter(p => p.membership_tier === 'premium').length;
  const goldCount = profiles.filter(p => p.membership_tier === 'gold').length;
  const paidMembers = profiles.filter(p => p.membership_tier === 'premium' || p.membership_tier === 'gold');
  const totalRevenue = paidMembers.reduce((sum, p) => sum + (TIER_PRICING[p.membership_tier] || 0), 0);

  return { totalUsers, regularCount, premiumCount, goldCount, paidMembers, totalRevenue };
}
