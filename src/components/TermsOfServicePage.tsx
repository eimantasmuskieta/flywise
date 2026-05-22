export function TermsOfServicePage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-gray-600">Last updated: April 11, 2026</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg space-y-5 text-gray-600 max-w-4xl mx-auto">
          <p>
            By using FlyWise, you agree to use the service lawfully and provide accurate travel details.
          </p>
          <p>
            Prices and offers can change without notice and are subject to third-party availability.
          </p>
          <p>
            FlyWise is not responsible for carrier schedule changes, disruptions, or third-party booking policies.
          </p>
        </div>
      </div>
    </section>
  );
}
