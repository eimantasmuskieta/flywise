export function HelpCenterPage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Help Center
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find quick answers to the most common questions about planning, deals, and account support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="mb-3 text-gray-900">How do I generate a trip plan?</h3>
            <p className="text-gray-600">
              Go to Home, fill in destination details, dates, budget, and interests, then submit your request.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="mb-3 text-gray-900">Can I save trips for later?</h3>
            <p className="text-gray-600">
              Yes. Sign in and use the save option to keep itineraries in your Saved Trips list.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="mb-3 text-gray-900">Where do deals come from?</h3>
            <p className="text-gray-600">
              Deals are pulled from live flight sources and may vary by route availability and travel dates.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="mb-3 text-gray-900">How can I contact support?</h3>
            <p className="text-gray-600">
              Open Contact Us in the footer and send us your request. We usually reply within one business day.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
