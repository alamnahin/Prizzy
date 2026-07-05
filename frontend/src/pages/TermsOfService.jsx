import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-pink mb-8"
    >
      <ArrowLeft size={14} /> Back to Home
    </Link>

    <h1 className="text-3xl font-extrabold text-brand-dark mb-2">
      Terms of Service
    </h1>
    <p className="text-sm text-gray-400 mb-8">Last updated: January 1, 2025</p>

    <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-700 leading-relaxed">
      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          1. Acceptance of Terms
        </h2>
        <p>
          By accessing or using Prizzy ("the Platform"), you agree to be bound
          by these Terms of Service ("Terms"). If you do not agree, please do
          not use our services.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          2. Use of the Platform
        </h2>
        <p>
          Prizzy is a multi-vendor gift marketplace operating in Bangladesh. You
          must be at least 18 years of age to create an account or make
          purchases. You agree to provide accurate, current, and complete
          information during registration and to update such information to keep
          it accurate.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          3. Seller Obligations
        </h2>
        <p>
          Sellers on Prizzy must obtain approval before listing products.
          Sellers are responsible for the accuracy of their listings, timely
          fulfillment of orders, and compliance with all applicable Bangladeshi
          laws. Prizzy reserves the right to suspend or remove sellers who
          violate these Terms.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          4. Payments
        </h2>
        <p>
          All transactions are processed in Bangladeshi Taka (BDT) through
          secure payment gateways including SSLCommerz and bKash. Cash on
          Delivery (COD) is also available for eligible orders. By placing an
          order, you agree to pay the listed price plus any applicable shipping
          fees.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          5. Returns & Refunds
        </h2>
        <p>
          Customers may request a return within 7 days of delivery for damaged
          or incorrect items. Refunds are processed within 7–10 business days
          after the return is approved. Perishable items (e.g., cakes, flowers)
          are non-returnable unless damaged upon arrival.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          6. Intellectual Property
        </h2>
        <p>
          All content on Prizzy, including logos, design, and software, is
          owned by or licensed to Prizzy and is protected by applicable
          intellectual property laws. You may not reproduce, distribute, or
          create derivative works without written permission.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          7. Limitation of Liability
        </h2>
        <p>
          Prizzy acts as a marketplace and is not liable for the quality,
          safety, or legality of products listed by sellers. To the fullest
          extent permitted by law, Prizzy's total liability to you for any claim
          arising from these Terms shall not exceed the amount you paid for the
          transaction giving rise to such claim.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          8. Governing Law
        </h2>
        <p>
          These Terms are governed by the laws of the People's Republic of
          Bangladesh. Any disputes shall be subject to the exclusive jurisdiction
          of the courts of Dhaka.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          9. Changes to Terms
        </h2>
        <p>
          We may update these Terms from time to time. We will notify you of
          significant changes via email or a notice on the Platform. Continued
          use of Prizzy after changes take effect constitutes your acceptance of
          the updated Terms.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-dark mb-2">
          10. Contact
        </h2>
        <p>
          For questions about these Terms, please contact us at{" "}
          <a
            href="mailto:legal@prizzy.com"
            className="text-brand-pink hover:underline"
          >
            legal@prizzy.com
          </a>{" "}
          or write to us at Gulshan, Dhaka, Bangladesh.
        </p>
      </section>
    </div>

    <div className="mt-12 border-t border-gray-100 pt-6 text-xs text-gray-400">
      <Link to="/privacy" className="text-brand-pink hover:underline mr-4">
        Privacy Policy
      </Link>
      <Link to="/" className="hover:text-brand-pink">
        Return to Prizzy
      </Link>
    </div>
  </div>
);

export default TermsOfService;
