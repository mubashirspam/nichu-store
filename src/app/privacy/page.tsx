import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-lg z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Nizam Store
            </Link>
            <Link
              href="/"
              className="text-white/70 hover:text-purple-400 transition-colors text-sm"
            >
              &larr; Back to Store
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Privacy <span className="text-purple-400">Policy</span>
          </h1>
          <p className="text-gray-400 mb-12">
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                1. Introduction
              </h2>
              <p>
                Welcome to Nizam Store (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), operated by
                Nizamudheen KC. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you visit our
                website at app.marketingnizam.com and purchase our digital
                products.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                2. Information We Collect
              </h2>
              <p className="mb-4">
                We may collect the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-white">Personal Information:</strong>{" "}
                  Name, email address, phone number, and billing information
                  provided during purchase.
                </li>
                <li>
                  <strong className="text-white">Payment Information:</strong>{" "}
                  Payment details are processed securely by Razorpay. We do not
                  store your credit/debit card numbers or UPI details on our
                  servers.
                </li>
                <li>
                  <strong className="text-white">Usage Data:</strong> Browser
                  type, IP address, pages visited, time spent on pages, and
                  other diagnostic data.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To process and deliver your purchased digital products.</li>
                <li>To send purchase confirmations and product updates.</li>
                <li>To communicate with you regarding your orders.</li>
                <li>To improve our website and products.</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                4. Payment Processing
              </h2>
              <p>
                All payments are processed through Razorpay, a PCI DSS compliant
                payment gateway. Your payment information is encrypted and
                handled directly by Razorpay. We do not have access to your full
                payment card details. Please review{" "}
                <a
                  href="https://razorpay.com/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline"
                >
                  Razorpay&apos;s Privacy Policy
                </a>{" "}
                for more information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                5. Data Sharing
              </h2>
              <p>
                We do not sell, trade, or rent your personal information to third
                parties. We may share your information only with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>
                  <strong className="text-white">Razorpay:</strong> For payment
                  processing.
                </li>
                <li>
                  <strong className="text-white">Email service providers:</strong>{" "}
                  For delivering purchased products and communications.
                </li>
                <li>
                  <strong className="text-white">Legal authorities:</strong> If
                  required by law.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                6. Cookies
              </h2>
              <p>
                We may use cookies and similar tracking technologies to enhance
                your browsing experience. You can configure your browser to
                refuse cookies, but some features of our website may not function
                properly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                7. Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures to
                protect your personal information. However, no method of
                transmission over the Internet is 100% secure, and we cannot
                guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                8. Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your data (subject to legal requirements).</li>
                <li>Withdraw consent for marketing communications.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                9. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <div className="mt-4 bg-white/5 rounded-xl p-6">
                <p>
                  <strong className="text-white">Nizamudheen KC</strong>
                </p>
                <p>Email: contact@marketingnizam.com</p>
                <p>Website: marketingnizam.com</p>
              </div>
            </section>
          </div>

          <div className="mt-12 flex gap-4 text-sm">
            <Link
              href="/terms/"
              className="text-purple-400 hover:underline"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/refund/"
              className="text-purple-400 hover:underline"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
