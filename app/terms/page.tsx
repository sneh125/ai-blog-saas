export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using BlogAI ("the Service"), you accept and agree to be bound by 
              the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-6">
              BlogAI is an AI-powered blog generation platform that helps users create SEO-optimized 
              content. We provide both individual and white-label agency solutions.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-4">To use our service, you must:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Be responsible for all activities under your account</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription and Billing</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment Terms</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Subscriptions are billed monthly or annually in advance</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>We use Stripe for secure payment processing</li>
              <li>You authorize us to charge your payment method</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Plan Limits</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Each plan has specific usage limits (blog posts, words, team members)</li>
              <li>Exceeding limits may result in service suspension</li>
              <li>Unused credits do not roll over to the next billing period</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
            <p className="text-gray-700 mb-4">You agree not to use the service to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Generate illegal, harmful, or offensive content</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Spam or send unsolicited communications</li>
              <li>Attempt to hack or disrupt the service</li>
              <li>Share your account credentials</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Content Ownership</h2>
            <p className="text-gray-700 mb-6">
              You retain ownership of content you create using our service. However, you grant us 
              a license to use, store, and process your content to provide the service. We may use 
              anonymized data for service improvement.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. White-Label Services</h2>
            <p className="text-gray-700 mb-4">For white-label customers:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>You may rebrand the service with your own logo and domain</li>
              <li>You are responsible for your customer relationships</li>
              <li>You must comply with all applicable laws and regulations</li>
              <li>We reserve the right to terminate white-label access for violations</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
            <p className="text-gray-700 mb-6">
              We strive for 99.9% uptime but do not guarantee uninterrupted service. We may 
              perform maintenance that temporarily affects availability.
            </p>

            <h2 className="text-2xl font-semibent text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-700 mb-4">We may terminate your account if you:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Violate these terms</li>
              <li>Fail to pay fees</li>
              <li>Engage in fraudulent activity</li>
              <li>Abuse the service</li>
            </ul>
            <p className="text-gray-700 mb-6">
              You may cancel your subscription at any time through your account settings.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Disclaimers</h2>
            <p className="text-gray-700 mb-6">
              The service is provided "as is" without warranties. We do not guarantee the accuracy, 
              completeness, or quality of AI-generated content. You are responsible for reviewing 
              and editing all content before publication.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-700 mb-6">
              Our liability is limited to the amount you paid for the service in the 12 months 
              preceding the claim. We are not liable for indirect, incidental, or consequential damages.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be 
              resolved through binding arbitration.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 mb-6">
              We may update these terms from time to time. We will notify you of material changes 
              via email or through the service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                For questions about these terms, contact us at:<br />
                Email: legal@blogai.com<br />
                Address: [Your Business Address]
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}