import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-pink mb-8"
    >
      <ArrowLeft size={14} /> Back to Home
    </Link>

    <h1 className="text-3xl font-extrabold text-brand-dark mb-2">
      Privacy Policy
    </h1>
    <p className="text-sm text-gray-400 mb-8">Last updated: January 1, 2025</p>

    <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          1. Information We Collect
        </h2>
        <p>
          When you use Prizzy, we collect information you provide directly, such
          as your name, email address, phone number, and delivery address when
          you register or place an order. We also automatically collect technical
          data such as your IP address, browser type, and pages visited to
          improve our service.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          2. How We Use Your Information
        </h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
          <li>Process and fulfill your orders</li>
          <li>Send order confirmations and delivery updates</li>
          <li>Provide customer support</li>
          <li>Personalize your shopping experience and gift recommendations</li>
          <li>Detect and prevent fraud or misuse</li>
          <li>
            Send promotional emails (you may opt out at any time)
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          3. Sharing of Information
        </h2>
        <p>
          We share your information only with parties necessary to deliver our
          services: sellers fulfilling your orders (name, phone, and delivery
          address only), payment processors (SSLCommerz, bKash) for transaction
          processing, and delivery partners. We do not sell your personal data to
          third-party advertisers.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          4. Data Security
        </h2>
        <p>
          We take reasonable technical and organizational measures to protect
          your data, including encrypted connections (HTTPS), secure cloud
          infrastructure (Supabase), and access controls. However, no system is
          100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          5. Cookies
        </h2>
        <p>
          Prizzy uses local storage and session storage to maintain your cart,
          wishlist, and authentication state across page loads. We do not use
          third-party tracking cookies for advertising purposes.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          6. Your Rights
        </h2>
        <p>
          You have the right to access, correct, or delete the personal data we
          hold about you. To exercise these rights, please contact us at{" "}
          <a
            href="mailto:privacy@prizzy.com"
            className="text-brand-pink hover:underline"
          >
            privacy@prizzy.com
          </a>
          . We will respond within 30 days.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          7. Children's Privacy
        </h2>
        <p>
          Prizzy is not intended for users under the age of 18. We do not
          knowingly collect personal information from children. If you believe a
          child has provided us with personal data, please contact us immediately.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          8. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy periodically. We will notify you of
          material changes by email or by posting a notice on the Platform.
          Continued use of Prizzy after updates constitutes your acceptance of
          the revised policy.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          9. Contact Us
        </h2>
        <p>
          For privacy-related questions or requests, reach us at{" "}
          <a
            href="mailto:privacy@prizzy.com"
            className="text-brand-pink hover:underline"
          >
            privacy@prizzy.com
          </a>{" "}
          or by post at Gulshan, Dhaka, Bangladesh.
        </p>
      </section>
    </div>

    <div className="mt-12 border-t border-gray-100 pt-6 text-xs text-gray-400">
      <Link to="/terms" className="text-brand-pink hover:underline mr-4">
        Terms of Service
      </Link>
      <Link to="/" className="hover:text-brand-pink">
        Return to Prizzy
      </Link>
    </div>
  </div>
);

export default PrivacyPolicy;
