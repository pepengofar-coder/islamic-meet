import { supabase } from './supabase';

/**
 * Daftar akun baru dengan email + password
 */
export async function signUp({ email, password, name, gender }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, gender },
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Login dengan email + password
 */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Logout dari session aktif
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Ambil user yang sedang login (dari session lokal)
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Kirim email reset password
 */
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

/**
 * Subscribe ke perubahan auth state (login/logout)
 * Returns unsubscribe function
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}
