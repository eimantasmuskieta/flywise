export function PrivacyPolicyPage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-600">Last updated: April 11, 2026</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg space-y-5 text-gray-600 max-w-4xl mx-auto">
          <p>
            We collect account information, trip preferences, and usage data to provide and improve your travel planning experience.
          </p>
          <p>
            We do not sell your personal data. Information is used for core product functionality, analytics, and support.
          </p>
          <p>
            You can request account data updates or deletion by contacting support@flywise.com.
          </p>
        </div>
      </div>
    </section>
  );
}
