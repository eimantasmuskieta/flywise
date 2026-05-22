export function ContactUsPage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Reach our support team for account questions, booking issues, or product feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-gray-900 mb-2">Support Email</h3>
            <p className="text-gray-600">support@flywise.com</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-gray-900 mb-2">Response Time</h3>
            <p className="text-gray-600">Usually within 24 hours on business days.</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-gray-900 mb-2">Coverage</h3>
            <p className="text-gray-600">Global support for planning and deal-related questions.</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-gray-900 mb-2">Business Inquiries</h3>
            <p className="text-gray-600">partnerships@flywise.com</p>
          </div>
        </div>
      </div>
    </section>
  );
}
