import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#131A22] text-white py-10 px-6 abolute bottom-0">
      <div className="max-w-7xl mx-auto uppercase">
        <a href="#" className="block text-center text-sm mb-8 hover:underline text-gray-400">
          Back To Top
        </a>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm text-gray-300">
          {/* Column 1 */}
          <div>
            <h3 className="font-bold mb-2 text-white">Get to Know Us</h3>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">About NEXSTORE</a></li>
              <li><a href="#" className="hover:underline">Careers</a></li>
              <li><a href="#" className="hover:underline">Press Releases</a></li>
              <li><a href="#" className="hover:underline">NEXSTORE Science</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-bold mb-2 text-white">Connect With Us</h3>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">Facebook</a></li>
              <li><a href="#" className="hover:underline">Twitter</a></li>
              <li><a href="#" className="hover:underline">Instagram</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-bold mb-2 text-white">Make Money With Us</h3>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">Sell on NEXSTORE</a></li>
              <li><a href="#" className="hover:underline">Sell under NEXSTORE Accelerator</a></li>
              <li><a href="#" className="hover:underline">Protect and Build Your Brand</a></li>
              <li><a href="#" className="hover:underline">NEXSTORE Global Selling</a></li>
              <li><a href="#" className="hover:underline">Supply to NEXSTORE</a></li>
              <li><a href="#" className="hover:underline">Become an Affiliate</a></li>
              <li><a href="#" className="hover:underline">Fulfilment by NEXSTORE</a></li>
              <li><a href="#" className="hover:underline">Advertise Your Products</a></li>
              <li><a href="#" className="hover:underline">NEXSTORE Pay on Merchants</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="font-bold mb-2 text-white">Let Us Help You</h3>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">Your Account</a></li>
              <li><a href="#" className="hover:underline">Returns Centre</a></li>
              <li><a href="#" className="hover:underline">Recalls and Product Safety Alerts</a></li>
              <li><a href="#" className="hover:underline">100% Purchase Protection</a></li>
              <li><a href="#" className="hover:underline">NEXSTORE App Download</a></li>
              <li><a href="#" className="hover:underline">Help</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between border-t border-gray-700 pt-6 text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="NEXSTORE" className="h-6" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center border px-2 py-1 rounded">
              <span role="img" aria-label="globe">🌐</span>
              <select className="bg-transparent text-white ml-2 outline-none uppercase">
                <option className="text-black">ENGLISH</option>
              </select>
            </div>
            <div className="flex items-center border px-2 py-1 rounded">
              <span role="img" aria-label="flag">🇮🇳</span>
              <span className="ml-2">INDIA</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
