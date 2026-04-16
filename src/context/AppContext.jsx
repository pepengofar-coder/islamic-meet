import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { signOut, onAuthStateChange } from '../lib/auth';
import {
  getUserProfile, upsertProfile, getDiscoverProfiles,
  getRequests, sendTaarufRequest, updateRequestStatus,
  createRoom, getRooms,
  dbProfileToUser, userToDbProfile,
} from '../lib/db';

const AppContext = createContext(null);

const defaultCV = {
  fullName: '', age: '', city: '', education: '', job: '', incomeRange: '',
  salat: '', tilawah: '', mazhab: '', islamicBackground: [], bio: '',
  bloodType: '', smoking: false, hasChronicIllness: false, illnessDetail: '', exercise: '',
  visionLiving: '', visionParenting: '', visionFinance: '', hobbies: [],
  criteriaWeights: { ibadah: 80, vision: 70, health: 60, location: 50, income: 30, hobby: 55 },
  dealBreakers: [],
};

const defaultUser = {
  id: null, name: '', email: '', gender: 'akhwat',
  verified: false, akadSigned: false, readinessDone: false,
  readinessScore: 0, cvDone: false,
  // Membership
  membership_tier: 'regular',
  membership_expires_at: null,
  monthly_requests_used: 0,
  cv: defaultCV,
};

export function AppProvider({ children }) {
  const [authUser, setAuthUser]   = useState(null);   // Supabase auth user
  const [user, setUser]           = useState(defaultUser);
  const [loading, setLoading]     = useState(true);
  const [profiles, setProfiles]   = useState([]);
  const [requests, setRequests]   = useState([]);
  const [rooms, setRooms]         = useState([]);

  // ── Auth State Listener ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const loadUserData = async (authU) => {
      if (!authU) {
        if (mounted) { setAuthUser(null); setUser(defaultUser); setLoading(false); }
        return;
      }
      try {
        const profile = await getUserProfile(authU.id);
        const appUser = dbProfileToUser(profile) || { ...defaultUser, id: authU.id, email: authU.email };
        if (mounted) {
          setAuthUser(authU);
          setUser(appUser);
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        if (mounted) setUser({ ...defaultUser, id: authU.id, email: authU.email });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserData(session?.user ?? null);
    });

    // Listen for auth changes
    const unsub = onAuthStateChange((authU) => {
      if (mounted) loadUserData(authU);
    });

    return () => { mounted = false; unsub(); };
  }, []);

  // ── Load discover profiles when user is ready ────────────────────────
  useEffect(() => {
    if (!authUser || !user.cvDone) return;
    const oppositeGender = user.gender === 'ikhwan' ? 'akhwat' : 'ikhwan';
    getDiscoverProfiles(authUser.id, oppositeGender)
      .then(rows => setProfiles(rows.map(dbProfileToUser)))
      .catch(console.error);
  }, [authUser, user.cvDone, user.gender]);

  // ── Load requests & rooms ────────────────────────────────────────────
  const refreshRooms = useCallback(async () => {
    if (!authUser) return;
    try {
      const roomsData = await getRooms(authUser.id);
      setRooms(roomsData);
    } catch (err) {
      console.error('Error refreshing rooms:', err);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser) return;
    getRequests(authUser.id).then(setRequests).catch(console.error);
    getRooms(authUser.id).then(setRooms).catch(console.error);

    // Realtime: listen for new rooms involving this user
    const channel = supabase
      .channel('user-rooms')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'taaruf_rooms' },
        (payload) => {
          const row = payload.new;
          if (row && (row.user1_id === authUser.id || row.user2_id === authUser.id)) {
            // Reload rooms to get full joined data
            getRooms(authUser.id).then(setRooms).catch(console.error);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'taaruf_requests' },
        (payload) => {
          const row = payload.new;
          if (row && (row.from_id === authUser.id || row.to_id === authUser.id)) {
            getRequests(authUser.id).then(setRequests).catch(console.error);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [authUser]);

  // ── User Actions ─────────────────────────────────────────────────────
  const updateUser = useCallback(async (updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates };
      if (authUser) {
        upsertProfile(authUser.id, userToDbProfile(next)).catch(console.error);
      }
      return next;
    });
  }, [authUser]);

  const updateCV = useCallback(async (updates) => {
    setUser(prev => {
      const next = { ...prev, cv: { ...prev.cv, ...updates } };
      if (authUser) {
        upsertProfile(authUser.id, userToDbProfile(next)).catch(console.error);
      }
      return next;
    });
  }, [authUser]);

  const logout = useCallback(async () => {
    await signOut();
    setUser(defaultUser);
    setProfiles([]);
    setRequests([]);
    setRooms([]);
  }, []);

  // ── Request Actions ───────────────────────────────────────────────────
  const sendRequest = useCallback(async (profileId, message) => {
    if (!authUser) return;
    try {
      const req = await sendTaarufRequest(authUser.id, profileId, message);
      setRequests(prev => [req, ...prev]);
    } catch (err) {
      console.error('sendRequest error:', err);
      throw err;
    }
  }, [authUser]);

  const acceptRequest = useCallback(async (reqId) => {
    if (!authUser) return;
    try {
      // User accepts → status becomes 'approved_by_user'
      // Admin must then approve to create the actual room
      await updateRequestStatus(reqId, 'approved_by_user');
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'approved_by_user' } : r));
    } catch (err) {
      console.error('acceptRequest error:', err);
    }
  }, [authUser]);

  const rejectRequest = useCallback(async (reqId) => {
    try {
      await updateRequestStatus(reqId, 'rejected');
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r));
    } catch (err) {
      console.error('rejectRequest error:', err);
    }
  }, []);

  // ── Chat Actions ──────────────────────────────────────────────────────
  // Messages are now handled directly in TaarufRoom via db.js + realtime subscription.
  // Keep these stubs for backward compatibility.
  const sendMessage = useCallback(() => {}, []);
  const simulateReply = useCallback(() => {}, []);

  // ── Navigation Helpers ────────────────────────────────────────────────
  const getNextStep = useCallback(() => {
    if (!user.verified)      return '/verify';
    if (!user.akadSigned)    return '/akad';
    if (!user.readinessDone) return '/readiness';
    if (!user.cvDone)        return '/cv-builder';
    return '/discover';
  }, [user]);

  const isOnboarded = !!(user.verified && user.akadSigned && user.readinessDone && user.cvDone);

  // ── Computed Values ───────────────────────────────────────────────────
  const pendingRequestsCount = requests.filter(r =>
    r.to_id === authUser?.id && r.status === 'pending'
  ).length;
  const activeRoomsCount = rooms.filter(r => r.status === 'active').length;

  return (
    <AppContext.Provider value={{
      // Auth
      authUser, loading,
      // User data
      user, updateUser, updateCV, logout,
      // Discovery
      profiles,
      // Requests
      requests, sendRequest, acceptRequest, rejectRequest,
      // Rooms
      rooms, refreshRooms,
      // Chat (legacy stubs)
      sendMessage, simulateReply,
      // Navigation
      getNextStep, isOnboarded,
      // Counts
      pendingRequestsCount, activeRoomsCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
