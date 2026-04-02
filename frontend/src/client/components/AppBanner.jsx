import React from 'react';

const AppBanner = () => {
  return (
    <section className="bg-[#FFFBF7]">
      <div className="max-w-[1100px] mx-auto px-4 py-14 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Left - Phone Mockup */}
          <div className="flex-shrink-0 relative">
            <div className="w-56 h-[420px] md:w-64 md:h-[480px] bg-gradient-to-br from-[#EF4F5F] to-[#FF6B6B] rounded-[2.5rem] p-2.5 shadow-2xl shadow-red-200/40 rotate-[-3deg]">
              <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden flex flex-col">
                {/* Mock screen */}
                <div className="bg-[#EF4F5F] px-4 py-5 text-white">
                  <p className="text-[10px] opacity-70">Good evening</p>
                  <p className="text-sm font-bold mt-0.5">Hey Foodie!</p>
                  <div className="mt-3 bg-white/20 rounded-lg px-3 py-2 flex items-center gap-2">
                    <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <span className="text-[10px] text-white/80">Search for restaurants</span>
                  </div>
                </div>
                <div className="flex-1 px-3 py-3 space-y-2">
                  <div className="flex gap-2">
                    {['Delivery', 'Dining', 'Nightlife'].map((t) => (
                      <div key={t} className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${t === 'Delivery' ? 'bg-[#EF4F5F] text-white' : 'bg-gray-100 text-gray-500'}`}>{t}</div>
                    ))}
                  </div>
                  <div className="text-[10px] font-bold text-gray-700 mt-2">Top picks for you</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="rounded-lg overflow-hidden bg-gray-50">
                        <div className="h-14 bg-gradient-to-br from-orange-100 to-red-50" />
                        <div className="p-1.5">
                          <div className="h-1.5 w-12 bg-gray-200 rounded" />
                          <div className="h-1 w-8 bg-gray-100 rounded mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1C1C1C] leading-tight">
              Get the Momato app
            </h2>
            <p className="text-gray-500 mt-3 text-base md:text-lg max-w-md">
              We will send you a link, open it on your phone to download the app
            </p>

            {/* Email / SMS input */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto md:mx-0">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400 text-sm select-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                  <span className="text-gray-200">|</span>
                </div>
                <input
                  type="tel"
                  placeholder="Phone number"
                  className="w-full pl-20 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#EF4F5F] bg-white"
                />
              </div>
              <button className="px-6 py-3 bg-[#EF4F5F] text-white font-bold text-sm rounded-xl hover:bg-[#D43D4D] transition-colors whitespace-nowrap shadow-sm">
                Share App Link
              </button>
            </div>

            {/* Download badges */}
            <div className="mt-6">
              <p className="text-xs text-gray-400 mb-3">Download app from</p>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2.5 cursor-pointer hover:bg-gray-800 transition-colors">
                  <svg width="20" height="24" viewBox="0 0 384 512" fill="white"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
                  <div>
                    <p className="text-[8px] leading-none opacity-70">Download on the</p>
                    <p className="text-sm font-semibold leading-tight">App Store</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2.5 cursor-pointer hover:bg-gray-800 transition-colors">
                  <svg width="18" height="20" viewBox="0 0 512 512" fill="white"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" /></svg>
                  <div>
                    <p className="text-[8px] leading-none opacity-70">GET IT ON</p>
                    <p className="text-sm font-semibold leading-tight">Google Play</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppBanner;