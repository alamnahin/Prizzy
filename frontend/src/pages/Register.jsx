import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowLeft,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "../hooks/use-toast";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_d5d8da0f-075b-46d5-becb-685b2238c006/artifacts/7ozor44k_image.png";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast({
        title: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const result = await register(form);
    setLoading(false);

    if (result.success) {
      toast({
        title: "🎉 Account created!",
        description:
          form.role === "seller"
            ? "Awaiting admin approval to start selling."
            : "Welcome to Prizzy!",
      });
      // Use the role returned by AuthContext (authoritative — comes from DB)
      const dest =
        (result.role || form.role) === "seller" ? "/seller/dashboard" : "/";
      navigate(dest, { replace: true });
    } else {
      toast({
        title: "Registration failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex w-1/2 bg-brand-gradient relative items-center justify-center overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-white max-w-md px-12">
          <div className="bg-white inline-block rounded-2xl p-3 mb-6">
            <img src={LOGO_URL} alt="Prizzy" className="h-14" />
          </div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            Join Prizzy today 🎁
          </h2>
          <p className="text-white/90">
            Create an account to start shopping for unique gifts or become a
            seller and grow your business.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-pink"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-6">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-6 flex justify-center">
              <img src={LOGO_URL} alt="Prizzy" className="h-14" />
            </div>
            <h1 className="text-3xl font-extrabold text-brand-dark mb-2">
              Create your account
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Already have one?{" "}
              <Link
                to="/login"
                className="text-brand-pink font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <RoleCard
                icon={ShoppingBag}
                label="Customer"
                desc="Shop & buy gifts"
                active={form.role === "customer"}
                onClick={() => setForm({ ...form, role: "customer" })}
              />
              <RoleCard
                icon={Store}
                label="Seller"
                desc="Sell your products"
                active={form.role === "seller"}
                onClick={() => setForm({ ...form, role: "seller" })}
              />
            </div>

            <form onSubmit={submit} className="space-y-4">
              <Field
                icon={User}
                label="Full Name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Field
                icon={Mail}
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
              <Field
                icon={Phone}
                label="Phone Number"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
              <Field
                icon={Lock}
                label="Password (min 6 chars)"
                type="password"
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
              />
              <label className="flex items-start gap-2 text-xs text-gray-600">
                <input type="checkbox" required className="mt-0.5" /> I agree to
                Prizzy's{" "}
                <Link to="/terms" className="text-brand-pink hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-brand-pink hover:underline">
                  Privacy Policy
                </Link>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-gradient text-white font-bold rounded-full shadow-brand hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoleCard = ({ icon: Icon, label, desc, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-4 rounded-xl border-2 text-left ${active ? "border-brand-pink bg-brand-pink/5" : "border-gray-200 hover:border-brand-pink/30"}`}
  >
    <Icon size={20} className={active ? "text-brand-pink" : "text-gray-500"} />
    <p className="font-bold text-brand-dark mt-2 text-sm">{label}</p>
    <p className="text-xs text-gray-500">{desc}</p>
  </button>
);

const Field = ({ icon: Icon, label, type = "text", value, onChange }) => (
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
    </div>
  </div>
);

export default Register;
