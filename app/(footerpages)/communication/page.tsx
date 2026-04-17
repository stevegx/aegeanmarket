import MapWidget from './mapWidget'
export default function CommunicationPage() {
  return (
    <div className="max-w-8xl mx-auto px-6 md:px-12 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-aegean-dark mb-2">
          Communication
        </h1>
        <div className="h-1 w-20 bg-aegean-green mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        <div className="flex flex-col gap-8">
          <div>
            <h3 className="text-2xl font-bold text-aegean-dark mb-4">
              Our Location
            </h3>
            <p className="text-lg font-medium text-aegean-green underline mb-4">
              Mytilene, Lesvos, Greece
            </p>

            <div className="space-y-2 text-gray-600 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="flex justify-between">
                <span className="font-semibold">Mon - Tue:</span>
                <span>
                  10:00am - 4:00pm{' '}
                  <span className="text-xs text-gray-400">(Appointment)</span>
                </span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold">Wed - Sat:</span>
                <span>10:00am - 4:00pm</span>
              </p>
              <p className="flex justify-between text-red-500">
                <span className="font-semibold">Sunday:</span>
                <span className="font-bold">Closed</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <MapWidget />
          </div>

          {/* Quick Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border rounded-xl shadow-sm">
              <h3 className="font-bold text-aegean-dark">Telephone</h3>
              <h4 className="text-aegean-green hover:underline">
                +30 22510 12345
              </h4>
            </div>
            <div className="p-4 bg-white border rounded-xl shadow-sm">
              <h3 className="font-bold text-aegean-dark">Email</h3>
              <h4 className="text-aegean-green hover:underline break-all">
                info@mytilene.com
              </h4>
            </div>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[2rem] shadow-2xl border border-gray-50 lg:w-full lg:max-w-200justify-self-center">
          <h3 className="text-3xl font-bold text-aegean-dark mb-8 text-center md:text-left">
            Send us a Message
          </h3>

          <form action="" className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-sm font-bold text-gray-700 ml-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="e.g. John Doe"
                  className="p-4 border-2 rounded-2xl border-gray-100 focus:border-aegean-green focus:ring-4 focus:ring-aegean-green/5 focus:outline-none transition-all bg-gray-50/50 text-lg"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-bold text-gray-700 ml-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="john@example.com"
                  className="p-4 border-2 rounded-2xl border-gray-100 focus:border-aegean-green focus:ring-4 focus:ring-aegean-green/5 focus:outline-none transition-all bg-gray-50/50 text-lg"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="subject"
                className="text-sm font-bold text-gray-700 ml-1"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                placeholder="How can we help you?"
                className="p-4 border-2 rounded-2xl border-gray-100 focus:border-aegean-green focus:ring-4 focus:ring-aegean-green/5 focus:outline-none transition-all bg-gray-50/50 text-lg"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="message"
                className="text-sm font-bold text-gray-700 ml-1"
              >
                Your Message
              </label>
              <textarea
                id="message"
                rows={6}
                placeholder="Write your message here..."
                className="p-4 border-2 rounded-2xl border-gray-100 focus:border-aegean-green focus:ring-4 focus:ring-aegean-green/5 focus:outline-none transition-all bg-gray-50/50 text-lg resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-aegean-dark text-white font-bold py-4 rounded-2xl hover:bg-aegean-green transition-all shadow-xl hover:shadow-aegean-green/30 mt-4 text-xl uppercase tracking-wider hover:cursor-pointer"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
