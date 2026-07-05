import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import AiGiftFinderPage from "./pages/AiGiftFinderPage";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ResetPassword from "./pages/ResetPassword";
import ShopProfile from "./pages/ShopProfile";

// ─── Guard: must be logged in and not banned ──────────────────
const ProtectedRoute = ({ allowedRoles } = {}) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  // Redirect unauthenticated users or users banned mid-session
  if (!user || user.is_banned)
    return (
      <Navigate
        to="/login"
        state={{ from: window.location.pathname }}
        replace
      />
    );
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />;
  return <Outlet />;
};

// ─── Guard: seller OR admin only ─────────────────────────────
const SellerRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user || user.is_banned)
    return (
      <Navigate
        to="/login"
        state={{ from: window.location.pathname }}
        replace
      />
    );
  // customers land here too — SellerDashboard itself shows the onboarding form
  return <Outlet />;
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                {/* ── Public ─────────────────────────────── */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/category/:slug" element={<ProductList />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/ai-advisor" element={<AiGiftFinderPage />} />
                <Route path="/shop/:sellerId" element={<ShopProfile />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                {/* ── Logged-in customers + sellers + admin ─ */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/checkout" element={<Checkout />} />
                  <Route
                    path="/order-success/:orderNumber"
                    element={<OrderSuccess />}
                  />
                  <Route path="/profile" element={<UserProfile />} />
                </Route>

                {/* ── Seller dashboard (any logged-in user; page handles
                      onboarding vs dashboard state internally) ─────────── */}
                <Route element={<SellerRoute />}>
                  <Route
                    path="/seller/dashboard"
                    element={<SellerDashboard />}
                  />
                </Route>

                {/* ── Admin only ─────────────────────────── */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>

              {/* ── Auth pages (outside Layout) ────────── */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
