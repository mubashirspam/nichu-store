import Link from "next/link";

export default function RefundPolicy() {
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
            Refund <span className="text-purple-400">Policy</span>
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
            {/* Important Notice */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-red-400 mb-4">
                Important: No Refund Policy
              </h2>
              <p className="text-lg">
                All sales of digital products on Nizam Store
                (app.marketingnizam.com) are <strong className="text-white">final and non-refundable</strong>.
                Once a purchase is completed and the digital product is
                delivered, no refunds, returns, or exchanges will be issued
                under any circumstances.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                1. Why No Refunds?
              </h2>
              <p className="mb-4">
                Due to the nature of digital products:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Digital products are delivered instantly and cannot be
                  &quot;returned&quot; once accessed or downloaded.
                </li>
                <li>
                  Unlike physical goods, digital products cannot be resold after
                  being returned.
                </li>
                <li>
                  The content is fully described on the product page, allowing
                  you to make an informed purchase decision.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                2. Before You Purchase
              </h2>
              <p className="mb-4">
                We encourage you to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Read the complete product description and features listed on
                  the product page.
                </li>
                <li>
                  Review what is included in the product before making a
                  purchase.
                </li>
                <li>
                  Contact us at contact@marketingnizam.com if you have any
                  questions about the product before buying.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                3. Exceptions
              </h2>
              <p className="mb-4">
                While we maintain a strict no-refund policy, we may consider
                assistance in the following rare cases:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-white">Duplicate Payment:</strong> If
                  you were accidentally charged twice for the same product, we
                  will refund the duplicate charge.
                </li>
                <li>
                  <strong className="text-white">Non-Delivery:</strong> If you
                  did not receive the product within 24 hours of payment and we
                  are unable to deliver it, we will issue a full refund.
                </li>
                <li>
                  <strong className="text-white">Technical Issues:</strong> If
                  the product file is corrupted or unusable, we will first
                  attempt to send a replacement. If the issue persists, we may
                  consider a refund at our discretion.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                4. How to Report Issues
              </h2>
              <p>
                If you encounter any issues with your purchase, please contact
                us within 48 hours of purchase at:
              </p>
              <div className="mt-4 bg-white/5 rounded-xl p-6">
                <p>
                  <strong className="text-white">Email:</strong>{" "}
                  contact@marketingnizam.com
                </p>
                <p className="mt-2">
                  Please include your payment ID, email address used for
                  purchase, and a description of the issue.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                5. Chargebacks
              </h2>
              <p>
                Filing a chargeback or payment dispute without first contacting
                us is a violation of these terms. We reserve the right to
                dispute any chargebacks and may suspend access to purchased
                products. We encourage you to reach out to us directly to
                resolve any concerns.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                6. Agreement
              </h2>
              <p>
                By completing a purchase on Nizam Store, you acknowledge that
                you have read, understood, and agreed to this Refund Policy. You
                confirm that you understand that all sales are final and
                non-refundable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                7. Contact Us
              </h2>
              <p>
                For any questions regarding this Refund Policy, please contact:
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
              href="/terms/"
              className="text-purple-400 hover:underline"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
