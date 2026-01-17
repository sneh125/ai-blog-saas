export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Refund Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">30-Day Money-Back Guarantee</h2>
            <p className="text-gray-700 mb-6">
              We offer a 30-day money-back guarantee for all new subscriptions. If you're not 
              satisfied with our service, you can request a full refund within 30 days of your 
              initial purchase.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Eligibility</h2>
            <p className="text-gray-700 mb-4">You are eligible for a refund if:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>You request the refund within 30 days of your initial subscription</li>
              <li>You have not violated our Terms of Service</li>
              <li>You have not abused the service or generated excessive content</li>
              <li>Your account is in good standing</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What's Not Refundable</h2>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Subscription renewals (only initial purchases)</li>
              <li>Partial months of service</li>
              <li>White-label setup fees (if applicable)</li>
              <li>Custom development work</li>
              <li>Accounts terminated for Terms of Service violations</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Request a Refund</h2>
            <p className="text-gray-700 mb-4">To request a refund:</p>
            <ol className="list-decimal pl-6 text-gray-700 mb-6">
              <li>Email us at support@blogai.com with "Refund Request" in the subject line</li>
              <li>Include your account email and reason for the refund</li>
              <li>We will review your request within 2-3 business days</li>
              <li>If approved, the refund will be processed within 5-7 business days</li>
            </ol>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Process</h2>
            <p className="text-gray-700 mb-6">
              Approved refunds will be credited back to your original payment method. The time 
              it takes for the refund to appear depends on your bank or credit card company, 
              typically 5-10 business days.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cancellation vs. Refund</h2>
            <p className="text-gray-700 mb-6">
              Canceling your subscription stops future billing but does not provide a refund 
              for the current billing period. You can continue using the service until the 
              end of your paid period.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">White-Label Refunds</h2>
            <p className="text-gray-700 mb-6">
              White-label customers have a 14-day refund period due to the setup and configuration 
              involved. Custom branding and domain setup work is non-refundable after 14 days.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>
            <p className="text-gray-700 mb-6">
              If you disagree with our refund decision, you can escalate the matter by emailing 
              disputes@blogai.com. We will review your case with a senior team member.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Chargeback Policy</h2>
            <p className="text-gray-700 mb-6">
              Please contact us before initiating a chargeback with your bank. Chargebacks 
              without prior communication may result in account suspension and additional fees.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Fair Use Policy</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right to deny refunds for accounts that have generated excessive 
              content or appear to be abusing the refund policy. This includes accounts that 
              consistently request refunds or show patterns of misuse.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                For refund requests or questions about this policy:<br />
                Email: support@blogai.com<br />
                Subject: Refund Request<br />
                Response Time: 2-3 business days
              </p>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Before Requesting a Refund</h3>
              <p className="text-blue-800">
                Consider reaching out to our support team first. Many issues can be resolved 
                quickly, and we're here to help you get the most out of BlogAI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}