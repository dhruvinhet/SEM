import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-auto bg-dark-900/80 backdrop-blur-xl text-dark-300 overflow-hidden border-t border-white/[0.06]">
      {/* Decorative neon blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-neon-purple/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
          {/* Brand column */}
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center transition-transform group-hover:rotate-[-3deg] shadow-glow">
                <Car className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-display font-extrabold text-white tracking-tight">
                  Drive<span className="text-primary-400">X</span>
                </span>
                <span className="text-[8px] font-mono font-medium tracking-[0.2em] uppercase text-dark-500 mt-0.5">
                  car rental
                </span>
              </div>
            </Link>
            <p className="text-sm text-dark-400 leading-relaxed max-w-xs mb-6">
              Premium vehicles from verified owners. Trusted by 10,000+ riders across India.
            </p>
            <div className="flex items-center gap-3">
              <a href="mailto:support@drivex.com" className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-primary-500/20 hover:border-primary-500/30 transition-all">
                <Mail className="w-4 h-4 text-dark-400" />
              </a>
              <a href="tel:+911800DRIVEX" className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-primary-500/20 hover:border-primary-500/30 transition-all">
                <Phone className="w-4 h-4 text-dark-400" />
              </a>
              <span className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                <MapPin className="w-4 h-4 text-dark-400" />
              </span>
            </div>
          </div>

          {/* Links columns */}
          <div className="md:col-span-2 md:col-start-6">
            <h6 className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-4">Explore</h6>
            <ul className="space-y-3">
              {[
                { label: 'Browse Cars', path: '/search' },
                { label: 'How it Works', path: '/#how-it-works' },
                { label: 'List Your Car', path: '/auth/signup' },
              ].map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="inline-flex items-center gap-1 text-sm text-dark-300 hover:text-primary-400 transition-colors group"
                  >
                    {label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h6 className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-4">Support</h6>
            <ul className="space-y-3">
              {['Help Center', 'Safety', 'Cancellation', 'Terms', 'Privacy'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-dark-300 hover:text-primary-400 transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h6 className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-4">Contact</h6>
            <ul className="space-y-3">
              <li className="text-sm text-dark-300">support@drivex.com</li>
              <li className="text-sm text-dark-300">+91-1800-DRIVEX</li>
              <li className="text-sm text-dark-300">Mumbai, India</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-dark-500">
            © {new Date().getFullYear()} DriveX — Built with care, not templates.
          </p>
          <div className="flex items-center gap-6">
            {['Terms', 'Privacy', 'Cookies'].map((item) => (
              <span key={item} className="text-xs text-dark-500 hover:text-dark-300 cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
