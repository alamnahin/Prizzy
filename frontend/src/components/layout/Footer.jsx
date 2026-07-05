// frontend/src/components/layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

// Safely inline the Logo
const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_d5d8da0f-075b-46d5-becb-685b2238c006/artifacts/7ozor44k_image.png";

const Footer = () => {
  return (
    <footer className="bg-brand-dark text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="bg-white inline-block rounded-xl p-2 mb-4">
              <img
                src={LOGO_URL}
                alt="Prizzy"
                className="h-12 w-auto rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Gifts for Every Moment 🎁 — Bangladesh's most-loved multi-vendor
              gift marketplace.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-pink"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-pink"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-pink"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="#" className="hover:text-brand-pink">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-brand-pink">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-brand-pink">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-brand-pink">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-brand-pink">
                  Press
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="#" className="hover:text-brand-pink">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-brand-pink">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-brand-pink">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-brand-pink">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-brand-pink">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">For Sellers</h4>
            <ul className="space-y-2 text-sm mb-4">
              <li>
                <Link to="/seller/dashboard" className="hover:text-brand-pink">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="hover:text-brand-pink">
                  Seller Login
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-brand-pink">
                  Seller Policies
                </Link>
              </li>
            </ul>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Phone size={14} /> +880 9678-PRIZZY
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} /> hello@prizzy.com
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} /> Gulshan, Dhaka
              </div>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © 2024 Prizzy. All rights reserved. ·{" "}
            <Link to="/terms" className="hover:text-brand-pink">
              Terms
            </Link>{" "}
            ·{" "}
            <Link to="/privacy" className="hover:text-brand-pink">
              Privacy
            </Link>
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-500">We accept:</span>
            {["bKash", "Nagad", "Visa", "Mastercard", "SSLCommerz", "COD"].map(
              (m) => (
                <span
                  key={m}
                  className="px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-md"
                >
                  {m}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
