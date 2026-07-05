import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "../hooks/use-toast";
import { supabase } from "../lib/supabase";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_d5d8da0f-075b-46d5-becb-685b2238c006/artifacts/7ozor44k_image.png";

// Where each role lands after login
const roleHome = {
  admin: "/admin/dashboard",
  seller: "/seller/dashboard",
  customer: "/",
};

// ── Forgot Password Modal ────────────────────────────────────────────────
const ForgotPasswordModal = ({ onClose }) => {
  const [fpEmail, setFpEmail] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpSent, setFpSent] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!fpEmail.trim()) return;
    setFpLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(fpEmail.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setFpLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setFpSent(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-brand-pink"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-extrabold text-brand-dark mb-2">Reset Password</h2>
        {fpSent ? (
          <div className="text-sm text-gray-600 space-y-3">
            <p className="text-green-600 font-semibold">✓ Check your inbox!</p>
            <p>
              We sent a password reset link to <strong>{fpEmail}</strong>. Follow the
              link in the email to set a new password.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full py-2.5 bg-brand-gradient text-white font-bold rounded-full hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              Enter the email address on your account and we'll send you a reset link.
            </p>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Email Address
                </label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 focus-within:border-brand-pink">
                  <Mail size={16} className="text-gray-400" />
                  <input
                    type="email"
                    value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={fpLoading}
                className="w-full py-3 bg-brand-gradient text-white font-bold rounded-full hover:opacity-90 disabled:opacity-60"
              >
                {fpLoading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast({
        title: "🎉 Welcome back!",
        description: "You are now signed in.",
      });
      // If the router sent us here from a protected page, go back there;
      // otherwise route by role.
      const intended = location.state?.from;
      const dest = intended || roleHome[result.role] || "/";
      navigate(dest, { replace: true });
    } else {
      toast({
        title: "Login failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      {/* Left visual */}
      <div className="hidden lg:flex w-1/2 bg-brand-gradient relative items-center justify-center overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-white max-w-md px-12">
          <div className="bg-white inline-block rounded-2xl p-3 mb-6">
            <img src={LOGO_URL} alt="Prizzy" className="h-14" />
          </div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            Welcome back to Prizzy
          </h2>
          <p className="text-white/90 mb-8">
            Sign in to track your orders, manage your wishlist, and discover
            thoughtful gifts curated just for you.
          </p>
          <div className="space-y-3">
            {[
              "Track your orders in real-time",
              "Personalized gift recommendations",
              "Exclusive deals for members",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  ✓
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-pink"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-6 flex justify-center">
              <img src={LOGO_URL} alt="Prizzy" className="h-14" />
            </div>
            <h1 className="text-3xl font-extrabold text-brand-dark mb-2">
              Sign in
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              New to Prizzy?{" "}
              <Link
                to="/register"
                className="text-brand-pink font-semibold hover:underline"
              >
                Create an account
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                icon={Mail}
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
              />
              <Field
                icon={Lock}
                label="Password"
                type={show ? "text" : "password"}
                value={password}
                onChange={setPassword}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="text-gray-400 hover:text-brand-pink"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" className="rounded text-brand-pink" />{" "}
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-brand-pink font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-gradient text-white font-bold rounded-full shadow-brand hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <p className="text-xs text-center text-gray-400 mt-6">
              Use the email &amp; password you registered with.
            </p>
            <p className="text-xs text-center text-gray-400 mt-2">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-brand-pink font-semibold hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, label, type, value, onChange, trailing }) => (
  <div>
    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
      {label}
    </label>
    <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 focus-within:border-brand-pink">
      <Icon size={16} className="text-gray-400" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none text-sm"
        required
      />
      {trailing}
    </div>
  </div>
);

export default Login;
