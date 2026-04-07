import { supabase } from './supabaseClient'

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
  })

  if (error) {
    console.error("SignUp error:", error.message)
    throw error
  }

  const user = data.user

  // 🔥 SIMPAN KE TABLE PROFILES
  if (user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          name: name,
          gender: gender,
          role: 'user'
        }
      ])

    if (profileError) {
      console.error("Insert profile error:", profileError.message)
    }
  }

  return data
}

/**
 * Login dengan email + password
 */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("SignIn error:", error.message)
    throw error
  }

  return data
}

/**
 * Logout dari session aktif
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Ambil user yang sedang login
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}

/**
 * Kirim email reset password
 */
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

/**
 * Subscribe ke perubahan auth state
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => subscription.unsubscribe()
}