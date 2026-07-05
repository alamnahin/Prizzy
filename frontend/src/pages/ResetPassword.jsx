// frontend/src/pages/ResetPassword.jsx
// Handles the redirect from Supabase password-reset emails.
// Supabase appends #access_token=... to the URL; detectSessionInUrl (set in
// supabase.js) picks it up automatically, fires PASSWORD_RECOVERY, and the
// onAuthStateChange handler in AuthContext sets the session.  All this page
// needs to do is let the user type a new password.
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "../hooks/use-toast";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_d5d8da0f-075b-46d5-becb-685b2238c006/artifacts/7ozor44k_image.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Wait for Supabase to process the #access_token fragment
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setSessionReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!", description: "You can now sign in with your new password." });
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6 flex justify-center">
          <img src={LOGO_URL} alt="Prizzy" className="h-14" />
        </div>
        <h1 className="text-2xl font-extrabold text-brand-dark mb-2 text-center">
          Set New Password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter a new password for your account.
        </p>

        {!sessionReady ? (
          <p className="text-center text-sm text-gray-500">
            Verifying reset link…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                New Password
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 focus-within:border-brand-pink">
                <Lock size={16} className="text-gray-400" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShow(!show)} className="text-gray-400 hover:text-brand-pink">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Confirm Password
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 focus-within:border-brand-pink">
                <Lock size={16} className="text-gray-400" />
                <input
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  placeholder="Repeat new password"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-gradient text-white font-bold rounded-full hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-pink">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
