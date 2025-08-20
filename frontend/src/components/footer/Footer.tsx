"use client";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About Us */}
          <div>
            <h3 className="text-lg font-semibold mb-3">About Us</h3>
            <p className="text-sm leading-6 mb-4">
              There live the blind texts. Separated they live in Bookmarksgrove
              right at the coast of the Semantics, a large language ocean.
            </p>
            <a
              href="#"
              className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Learn more →
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Navigation</h3>
            <div className="flex gap-8">
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Overview
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Find Buyers
                  </a>
                </li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Overview
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Services
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Recent Posts */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Recent Posts</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="block text-xs text-gray-500">May 3, 2020</span>
                <a href="#" className="hover:underline">
                  There live the Blind Texts
                </a>
              </li>
              <li>
                <span className="block text-xs text-gray-500">May 3, 2020</span>
                <a href="#" className="hover:underline">
                  Separated they live in Bookmarksgrove right
                </a>
              </li>
            </ul>
          </div>

          {/* Connect + Subscribe */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Connect</h3>
            <ul className="mb-6 flex flex-wrap gap-3 text-sm">
              <li>
                <a href="#" className="hover:underline">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  X (Twitter)
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Google
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Google Play
                </a>
              </li>
            </ul>

            <div>
              <h3 className="text-lg font-semibold mb-3">Subscribe</h3>
              <form action="#" method="post" className="space-y-3">
                <div className="flex">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="w-full rounded-l-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="rounded-r-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Subscribe
                  </button>
                </div>
                {/* Optional status placeholders */}
                <div className="hidden text-sm" aria-live="polite">
                  Loading
                </div>
                <div className="hidden text-sm text-red-600">Error</div>
                <div className="hidden text-sm text-green-600">
                  Your subscription request has been sent. Thank you!
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-200 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-sm md:flex-row">
            <div className="text-center md:text-left">
              © {new Date().getFullYear()} LANMIC POLYMERS
            </div>
            <div className="text-center md:text-right">
              Designed by <span className="font-semibold">Manoj Weerasinghe</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
