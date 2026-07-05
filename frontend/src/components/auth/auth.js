import { supabase } from "../lib/supabase";

// ─────────────────────────────────────────────────────────────
// Sign Up
// Creates auth user + profile row in one shot via DB trigger.
// Returns { user, error }
// ─────────────────────────────────────────────────────────────
export async function signUp({
  name,
  email,
  phone,
  password,
  role = "customer",
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        // These go into auth.users.raw_user_meta_data
        // Our DB trigger reads them to create the profiles row
        name,
        phone,
        role,
      },
    },
  });

  if (error) return { user: null, error };
  return { user: data.user, error: null };
}

// ─────────────────────────────────────────────────────────────
// Sign In with Email + Password
// Returns { user, profile, error }
// ─────────────────────────────────────────────────────────────
export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { user: null, profile: null, error };

  // Fetch the profile so we have name, role, phone etc.
  const profile = await fetchProfile(data.user.id);
  return { user: data.user, profile, error: null };
}

// ─────────────────────────────────────────────────────────────
// Sign In with Google OAuth
// Redirects the browser — call this, then handle the return
// via onAuthStateChange in AuthContext.
// ─────────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
}

// ─────────────────────────────────────────────────────────────
// Sign Out
// ─────────────────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// ─────────────────────────────────────────────────────────────
// Reset Password (sends email)
// ─────────────────────────────────────────────────────────────
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { error };
}

// ─────────────────────────────────────────────────────────────
// Update Password (after clicking reset link)
// ─────────────────────────────────────────────────────────────
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error };
}

// ─────────────────────────────────────────────────────────────
// Fetch Profile row from public.profiles
// ─────────────────────────────────────────────────────────────
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("fetchProfile error:", error);
    return null;
  }
  return data;
}

// ─────────────────────────────────────────────────────────────
// Update Profile
// ─────────────────────────────────────────────────────────────
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
}

// ─────────────────────────────────────────────────────────────
// Get current session (useful on app boot)
// ─────────────────────────────────────────────────────────────
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  return { session, error };
}
