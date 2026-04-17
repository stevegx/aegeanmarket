export default function AboutUsPage() {
  return (
    <div className="flex flex-col w-full h-auto gap-12 p-8 md:p-20 justify-center items-center bg-white">
      {/* Header με Underline */}
      <div className="text-center">
        <h1 className="text-6xl md:text-7xl font-bold text-aegean-dark mb-4">
          About us
        </h1>
        <div className="h-1.5 w-32 bg-aegean-green mx-auto rounded-full"></div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-4xl space-y-12 text-gray-700">
        {/* Section 1: Our Story */}
        <section>
          <h2 className="text-3xl font-bold text-aegean-dark mb-4">
            Our Story
          </h2>
          <p className="text-lg leading-relaxed first-letter:text-6xl first-letter:font-bold first-letter:text-aegean-green first-letter:mr-3 first-letter:float-left">
            <span className="text-aegean-green font-semibold">
              The Aegean Market
            </span>{' '}
            began with a simple vision: to capture the essence of the
            Mediterranean and deliver it directly to your glass. Inspired by the
            crystal-clear waters of the Aegean Sea and the long, sun-drenched
            summers of the Greek islands, we created a digital destination for
            those who appreciate the finer things in life.
          </p>
        </section>

        {/* Section 2: Our Philosophy & Commitment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-y border-gray-100 py-10">
          <section>
            <h2 className="text-2xl font-bold text-aegean-dark mb-3">
              Our Philosophy
            </h2>
            <p className="leading-relaxed">
              We believe that every drink tells a story. Whether it’s an
              authentic ouzo from a family-owned distillery in Lesvos or a crisp
              white wine from Santorini, we select our products with one
              criterion: <span className="italic">authenticity</span>.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-aegean-dark mb-3">
              Our Commitment
            </h2>
            <p className="leading-relaxed">
              Quality, heritage, and integrity are our pillars. We support
              small-scale producers who respect the environment and their
              history, preserving traditional distilling arts.
            </p>
          </section>
        </div>

        {/* Section 3: Why Choose Us (Highlighted) */}
        <section className="bg-aegean-dark text-white p-8 md:p-12 rounded-[2rem] shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-aegean-green">
            Why Choose Us
          </h2>
          <p className="text-lg leading-relaxed opacity-90">
            At{' '}
            <span className="text-aegean-green font-bold">
              The Aegean Market
            </span>
            , we don’t just sell bottles; we offer an experience. From secure,
            specialized packaging to fast delivery and expert recommendations,
            we ensure that your journey with us is as smooth as a calm sea.
          </p>
          <div className="mt-8 flex gap-4 justify-center font-bold text-sm uppercase tracking-widest">
            <span>Quality</span> • <span>Heritage</span> •{' '}
            <span>Integrity</span>
          </div>
        </section>

        {/* Closing Message */}
        <footer className="text-center pt-8">
          <p className="text-2xl font-serif italic text-aegean-dark">
            "Cheers to the Aegean spirit!"
          </p>
        </footer>
      </div>
    </div>
  )
}
