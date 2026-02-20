import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Shield, Clock, Star, ArrowRight, Car, Users, MapPin,
  Zap, ChevronRight, Fuel, Gauge, ArrowUpRight, CheckCircle2
} from 'lucide-react';

/* tiny reusable fade-on-scroll hook */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('opacity-100', 'translate-y-0'); el.classList.remove('opacity-0', 'translate-y-6'); io.unobserve(el); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export default function Landing() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  const f1 = useFadeIn();
  const f2 = useFadeIn();
  const f3 = useFadeIn();
  const f4 = useFadeIn();

  return (
    <div className="overflow-hidden">
      {/* ═══════════════════════════════════════════════
          HERO — asymmetric split, no full-bleed photo
         ═══════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center">
        {/* Decorative bg elements — dots + gradient blob */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[70%] h-full bg-sand-100/60" />
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary-100/40 blur-3xl" />
          <div className="absolute bottom-20 left-10 w-[300px] h-[300px] rounded-full bg-accent-100/30 blur-3xl" />
          <div className="absolute top-20 right-20 w-96 h-96 bg-dot-pattern bg-dot opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            {/* Left — text content */}
            <div className="lg:col-span-5 space-y-8">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-4 py-2 rounded-full border border-primary-100">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce-subtle" />
                Now live in 12+ cities
              </div>

              <h1 className="text-dark-800 !leading-[1.06]">
                Drive your
                <br />
                <span className="relative inline-block">
                  <span className="text-gradient">dream car</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8 C50 2, 150 2, 198 8" stroke="#e8601c" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
                  </svg>
                </span>
                <br />
                today.
              </h1>

              <p className="text-dark-400 text-lg max-w-md leading-relaxed">
                Premium vehicles from verified owners.
                Book in under 2 minutes, pick up and go.
              </p>

              {/* Search — integrated, not floating */}
              <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
                  <input
                    type="text"
                    placeholder="Search by car, location, type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field !pl-11 !rounded-full !border-sand-300 !bg-white"
                    aria-label="Search vehicles"
                  />
                </div>
                <button type="submit" className="btn-primary !rounded-full !px-5">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Social proof row */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex -space-x-2">
                  {['E','M','R','A'].map((letter, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-white"
                      style={{ background: ['#e8601c','#17b26a','#3b82f6','#8b5cf6'][i], zIndex: 4 - i }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-sm font-semibold text-dark-700 ml-1">4.8</span>
                  </div>
                  <p className="text-xs text-dark-400 mt-0.5">from 10,000+ rides</p>
                </div>
              </div>
            </div>

            {/* Right — stacked image composition */}
            <div className="lg:col-span-7 relative lg:pl-12">
              <div className="relative">
                {/* Main image — rounded, not edge-to-edge */}
                <div className="rounded-[28px] overflow-hidden shadow-elevated aspect-[4/3] lg:aspect-[16/10]">
                  <img
                    src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80"
                    alt="Premium car on scenic road"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating stat card — bottom-left overlap */}
                <div className="absolute -bottom-5 -left-4 sm:left-6 card-glass p-4 rounded-2xl shadow-elevated animate-float hidden sm:flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-accent-500 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark-800">500+ verified</p>
                    <p className="text-xs text-dark-400">vehicles available</p>
                  </div>
                </div>

                {/* Floating price card — top-right */}
                <div className="absolute -top-4 -right-4 sm:right-8 card-glass px-4 py-3 rounded-2xl shadow-card animate-float hidden sm:block" style={{ animationDelay: '2s' }}>
                  <p className="text-xs text-dark-400 font-medium">Starting from</p>
                  <p className="text-xl font-extrabold text-dark-800">$29<span className="text-sm font-normal text-dark-400">/day</span></p>
                </div>

                {/* Decorative ring */}
                <div className="absolute -bottom-12 -right-12 w-32 h-32 border-[3px] border-dashed border-primary-200/50 rounded-full hidden lg:block" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          MARQUEE — scrolling brand bar (breaks the 3-card pattern)
         ═══════════════════════════════════════════════ */}
      <section className="border-y border-sand-200 bg-white py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, setIdx) => (
            <React.Fragment key={setIdx}>
              {['Tesla','BMW','Mercedes','Audi','Porsche','Toyota','Range Rover','Lamborghini','Ferrari','Honda','Hyundai','Kia'].map((brand) => (
                <span key={`${setIdx}-${brand}`} className="inline-flex items-center gap-3 mx-8 text-dark-300 text-sm font-semibold uppercase tracking-wider">
                  <span className="w-1 h-1 rounded-full bg-dark-200" />
                  {brand}
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS — horizontal timeline, NOT 3 identical cards
         ═══════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 opacity-0 translate-y-6 transition-all duration-700" ref={f1}>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
            <div>
              <span className="section-label mb-4 block w-fit">How it works</span>
              <h2 className="text-dark-800">Rent in three moves</h2>
            </div>
            <Link
              to="/search"
              className="text-sm font-semibold text-primary-600 flex items-center gap-1 hover:gap-2 transition-all group"
            >
              Start browsing <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Search & discover',
                desc: 'Browse by type, brand, price range, or pickup location. Smart filters find your perfect match.',
                color: 'bg-primary-50 text-primary-600 border-primary-100',
                iconColor: 'text-primary-500',
                icon: Search,
              },
              {
                num: '02',
                title: 'Book instantly',
                desc: "Select dates, review transparent pricing, and confirm in seconds. No hidden charges — ever.",
                color: 'bg-accent-50 text-accent-700 border-accent-100',
                iconColor: 'text-accent-500',
                icon: Clock,
              },
              {
                num: '03',
                title: 'Pick up & drive',
                desc: 'Meet the owner, grab the keys, and hit the road. Full insurance included on every trip.',
                color: 'bg-blue-50 text-blue-700 border-blue-100',
                iconColor: 'text-blue-500',
                icon: Car,
              },
            ].map(({ num, title, desc, color, iconColor, icon: Icon }, idx) => (
              <div
                key={num}
                className={`group relative p-8 rounded-3xl border border-sand-200 bg-white hover:border-transparent hover:shadow-card transition-all duration-500`}
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                {/* Number + line connector */}
                <div className="flex items-center gap-4 mb-6">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-extrabold border ${color}`}>
                    {num}
                  </span>
                  {idx < 2 && (
                    <div className="hidden md:block flex-1 h-px bg-sand-200 group-hover:bg-primary-200 transition-colors" />
                  )}
                </div>
                <Icon className={`w-6 h-6 ${iconColor} mb-4`} />
                <h4 className="text-dark-800 mb-2">{title}</h4>
                <p className="text-sm text-dark-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          BENTO GRID — replaces generic "Why Choose Us"
         ═══════════════════════════════════════════════ */}
      <section className="pb-24 pt-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 opacity-0 translate-y-6 transition-all duration-700" ref={f2}>
          <span className="section-label mb-4 block w-fit">Why DriveX</span>
          <h2 className="text-dark-800 mb-12 max-w-lg">
            Not your average<br />rental platform
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Large feature card */}
            <div className="md:col-span-4 rounded-3xl overflow-hidden relative group min-h-[320px]">
              <img
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=900&q=80"
                alt="Premium vehicle interior"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <span className="badge-neutral mb-3 !bg-white/20 !text-white backdrop-blur-sm">Premium Fleet</span>
                <h3 className="text-white mb-2">Curated, not crowded</h3>
                <p className="text-gray-300 text-sm max-w-xs">
                  Every vehicle is hand-inspected. We reject 40% of listings to keep quality high.
                </p>
              </div>
            </div>

            {/* Tall stat card */}
            <div className="md:col-span-2 rounded-3xl bg-dark-800 p-8 flex flex-col justify-between text-white min-h-[320px]">
              <div>
                <Shield className="w-7 h-7 text-accent-400 mb-4" />
                <h4 className="text-white mb-2">Fully insured</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Comprehensive coverage included with every booking. Drive worry-free.
                </p>
              </div>
              <div className="flex items-end gap-2 mt-auto pt-6">
                <span className="text-4xl font-extrabold">100%</span>
                <span className="text-sm text-gray-500 pb-1">coverage</span>
              </div>
            </div>

            {/* Row of 3 smaller feature cards */}
            <div className="md:col-span-2 rounded-3xl bg-accent-50 border border-accent-100 p-6 flex flex-col justify-between min-h-[200px]">
              <Zap className="w-6 h-6 text-accent-600 mb-3" />
              <div>
                <h5 className="text-dark-800 mb-1 font-bold">Instant booking</h5>
                <p className="text-xs text-dark-400">No waiting for approval. Most cars are instant-book enabled.</p>
              </div>
            </div>

            <div className="md:col-span-2 rounded-3xl bg-primary-50 border border-primary-100 p-6 flex flex-col justify-between min-h-[200px]">
              <Star className="w-6 h-6 text-primary-600 mb-3" />
              <div>
                <h5 className="text-dark-800 mb-1 font-bold">4.8★ average</h5>
                <p className="text-xs text-dark-400">Rated by 10,000+ real riders. Read verified reviews before booking.</p>
              </div>
            </div>

            <div className="md:col-span-2 rounded-3xl bg-sand-100 border border-sand-200 p-6 flex flex-col justify-between min-h-[200px]">
              <MapPin className="w-6 h-6 text-dark-500 mb-3" />
              <div>
                <h5 className="text-dark-800 mb-1 font-bold">12+ cities</h5>
                <p className="text-xs text-dark-400">Mumbai, Delhi, Bangalore, Pune, and expanding every month.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS — offset cards, not a grid
         ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 opacity-0 translate-y-6 transition-all duration-700" ref={f3}>
          <div className="text-center mb-14">
            <span className="section-label mb-4 inline-block">What riders say</span>
            <h2 className="text-dark-800">Loved by thousands</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "DriveX made renting a car feel effortless. Found a BMW within 5 minutes and the pickup was smooth.",
                name: 'Arjun Mehta',
                role: 'Frequent traveler',
                initials: 'AM',
                bg: 'bg-primary-500',
              },
              {
                quote: "As an owner, I've earned ₹2L+ in 6 months listing my car. The platform handles everything.",
                name: 'Priya Sharma',
                role: 'Vehicle owner',
                initials: 'PS',
                bg: 'bg-accent-500',
              },
              {
                quote: "Transparent pricing, no hidden fees, and great customer support. 10/10 would recommend.",
                name: 'Rohit Kumar',
                role: 'Weekend road-tripper',
                initials: 'RK',
                bg: 'bg-blue-500',
              },
            ].map(({ quote, name, role, initials, bg }, idx) => (
              <div
                key={name}
                className={`p-8 rounded-3xl border border-sand-200 bg-sand-50/50 hover:bg-white hover:shadow-card transition-all duration-500 ${idx === 1 ? 'md:-translate-y-4' : ''}`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-dark-600 text-sm leading-relaxed mb-6">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold`}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-800">{name}</p>
                    <p className="text-xs text-dark-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA — bold, asymmetric, NOT centered box
         ═══════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 opacity-0 translate-y-6 transition-all duration-700" ref={f4}>
          <div className="relative rounded-[32px] overflow-hidden bg-dark-800 p-10 md:p-16">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl" />
            <div className="absolute top-8 right-10 w-20 h-20 border border-white/10 rounded-full hidden lg:block" />
            <div className="absolute bottom-8 right-32 w-8 h-8 border border-white/10 rounded-full hidden lg:block" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-white mb-4 !text-3xl md:!text-4xl">
                  Ready to hit<br />the open road?
                </h2>
                <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
                  Join 10,000+ riders who've discovered a better way to rent. Your first ride is just a click away.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/search" className="btn-primary !px-8 !py-4">
                    Browse cars <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold border border-white/20 hover:bg-white/10 transition-all duration-300"
                  >
                    List your car
                  </Link>
                </div>
              </div>

              <div className="hidden lg:flex justify-end">
                <div className="grid grid-cols-2 gap-4 max-w-xs">
                  {[
                    { val: '500+', label: 'Vehicles' },
                    { val: '10K+', label: 'Happy riders' },
                    { val: '4.8★', label: 'Avg. rating' },
                    { val: '12+', label: 'Cities' },
                  ].map(({ val, label }) => (
                    <div key={label} className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <p className="text-2xl font-extrabold text-white">{val}</p>
                      <p className="text-xs text-gray-400 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
