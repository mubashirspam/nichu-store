import Link from "next/link";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
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
            Terms &amp; <span className="text-purple-400">Conditions</span>
          </h1>
          <p className="text-gray-400 mb-12">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                1. Agreement to Terms
              </h2>
              <p>
                By accessing or purchasing from Nizam Store
                (app.marketingnizam.com), operated by Nizamudheen KC, you agree
                to be bound by these Terms and Conditions. If you do not agree
                with any part of these terms, you must not use this website or
                purchase our products.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                2. Digital Products
              </h2>
              <p className="mb-4">
                We sell digital products including but not limited to habit
                trackers, templates, and educational materials. By purchasing:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You acknowledge that you are purchasing a digital product that
                  will be delivered electronically.
                </li>
                <li>
                  Digital products are delivered via email or download link after
                  successful payment.
                </li>
                <li>
                  You are granted a personal, non-transferable, non-exclusive
                  license to use the product.
                </li>
                <li>
                  You may not redistribute, resell, share, or commercially
                  exploit the digital products without written permission.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                3. Pricing and Payment
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All prices are listed in Indian Rupees (INR) and include applicable taxes.</li>
                <li>
                  Payments are processed securely through Razorpay. We accept
                  UPI, credit cards, debit cards, net banking, and wallets.
                </li>
                <li>
                  We reserve the right to modify pricing at any time without
                  prior notice.
                </li>
                <li>
                  Any promotional or discounted prices are valid only for the
                  specified period.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                4. Delivery of Products
              </h2>
              <p>
                Upon successful payment, digital products will be delivered to
                the email address provided during checkout. Delivery is typically
                instant but may take up to 24 hours in some cases. If you do not
                receive your product within 24 hours, please contact us at
                contact@marketingnizam.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                5. Refund Policy
              </h2>
              <p>
                Due to the nature of digital products, <strong className="text-white">all sales are final and
                no refunds will be provided</strong>. Once a digital product has been
                purchased and delivered, it cannot be returned. Please review the
                product description carefully before purchasing. For full
                details, see our{" "}
                <Link
                  href="/refund/"
                  className="text-purple-400 hover:underline"
                >
                  Refund Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                6. Intellectual Property
              </h2>
              <p>
                All content on this website and in our digital products,
                including text, graphics, logos, designs, and templates, is the
                intellectual property of Nizamudheen KC and is protected by
                applicable copyright laws. Unauthorized reproduction,
                distribution, or modification is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                7. User Responsibilities
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You must provide accurate and complete information during
                  purchase.
                </li>
                <li>
                  You are responsible for maintaining the confidentiality of your
                  purchase and download links.
                </li>
                <li>
                  You agree not to use our products for any unlawful purpose.
                </li>
                <li>
                  You agree not to attempt to reverse-engineer, decompile, or
                  extract source files from our products.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                8. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by law, Nizamudheen KC and Nizam
                Store shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages arising from or related to
                your use of our products or website. Our total liability shall
                not exceed the amount paid by you for the specific product in
                question.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                9. Disclaimer
              </h2>
              <p>
                Our digital products are provided &quot;as is&quot; without warranties of
                any kind, either express or implied. We do not guarantee that our
                products will meet your specific requirements or that results
                will be achieved from using them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                10. Changes to Terms
              </h2>
              <p>
                We reserve the right to update these Terms and Conditions at any
                time. Changes will be posted on this page with an updated date.
                Continued use of the website after changes constitutes acceptance
                of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                11. Governing Law
              </h2>
              <p>
                These Terms and Conditions are governed by and construed in
                accordance with the laws of India. Any disputes arising shall be
                subject to the exclusive jurisdiction of the courts in Kerala,
                India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                12. Contact Us
              </h2>
              <p>
                For any questions regarding these Terms and Conditions, please
                contact:
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
              href="/privacy/"
              className="text-purple-400 hover:underline"
            >
              Privacy Policy
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
