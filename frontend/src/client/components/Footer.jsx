import React from 'react'

const footerLinks = {
  'About Momato': ['Who We Are', 'Blog', 'Work With Us', 'Investor Relations', 'Report Fraud'],
  'Momatoverse': ['Momato', 'Blinkit', 'Feeding India', 'Hyperpure', 'Momatoland'],
  'For Restaurants': ['Partner With Us', 'Apps For You', 'Restaurant Widgets'],
  'Learn More': ['Privacy', 'Security', 'Terms', 'Sitemap'],
}

const countries = [
  '🇮🇳 India', '🇦🇺 Australia', '🇧🇷 Brazil', '🇨🇦 Canada',
  '🇮🇩 Indonesia', '🇮🇪 Ireland', '🇱🇧 Lebanon', '🇳🇿 New Zealand',
]

const socialIcons = [
  <path key="tw" d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.384 4.482A13.944 13.944 0 011.671 3.149a4.916 4.916 0 001.523 6.574 4.897 4.897 0 01-2.229-.616v.062a4.918 4.918 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.919 4.919 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 14.002-7.496 14.002-13.986 0-.21 0-.423-.015-.634A9.935 9.935 0 0024 4.557z" />,
  <path key="ig" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />,
  <path key="fb" d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />,
  <path key="li" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />,
]

const Footer = () => {
  return (
    <footer className="w-full bg-[#1c1c1c]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-16 pb-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-12">
          <div className="lg:w-[240px] shrink-0">
            <span className="text-[30px] font-extrabold italic text-white tracking-tight">momato</span>
          </div>

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">{heading}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-white/45 hover:text-white transition-colors duration-200">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-5 mb-10">
          <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Social Links</span>
          <div className="flex gap-2.5">
            {socialIcons.map((icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#e23744] text-white/50 hover:text-white flex items-center justify-center transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">{icon}</svg>
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 mb-10">
          {countries.map((c) => (
            <a key={c} href="#" className="text-xs text-white/35 hover:text-white/60 transition-colors px-3 py-1.5 rounded border border-white/10 hover:border-white/25">
              {c}
            </a>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="text-xs text-white/25 text-center leading-relaxed">
            By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners. 2008-2026 &copy; Momato&trade; Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
