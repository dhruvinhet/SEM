import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Shield, Clock, Star, ArrowRight, Car, MapPin,
  Zap, ChevronRight, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedCar from '../components/AnimatedCar';
import RoadDivider from '../components/RoadDivider';
import MouseSpotlight from '../components/MouseSpotlight';
import FAQAccordion from '../components/FAQAccordion';
import DragCarousel from '../components/DragCarousel';
import { useMagnetic } from '../hooks/useMagnetic';
import { useTypewriter } from '../hooks/useTypewriter';

export default function Landing() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { ref: magneticRef, magneticProps } = useMagnetic({ strength: 0.2 });
  const { displayText, cursorVisible } = useTypewriter('dream car', { speed: 80, startDelay: 800 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  const faqItems = [
    { question: 'How does DriveX work?', answer: 'Browse our curated fleet of verified vehicles, select your dates, and book instantly. Pick up from the owner or a designated spot — no paperwork, no hidden fees.' },
    { question: 'Is insurance included?', answer: 'Yes! Every booking includes comprehensive insurance coverage. You drive worry-free, and we handle the rest.' },
    { question: 'Can I list my own car?', answer: 'Absolutely. Sign up as an owner, add your vehicle details and photos, set your pricing, and start earning. We handle payments, insurance, and support.' },
    { question: 'What if I need to cancel?', answer: 'Free cancellation up to 24 hours before your trip. After that, a small fee may apply depending on the owner\'s cancellation policy.' },
    { question: 'How are vehicles verified?', answer: 'Every vehicle goes through a multi-point inspection. We verify registration, insurance, owner identity, and vehicle condition before listing.' },
  ];

  return (
    <div className="overflow-hidden">
      {/* ═══════════════════════════════════════════════
          HERO — asymmetric split, immersive dark
         ═══════════════════════════════════════════════ */}
      <MouseSpotlight size={500} intensity={0.1} color="255, 68, 51">
      <section className="relative min-h-[92vh] flex items-center">
        {/* Decorative bg elements — neon gradient blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary-500/[0.08] blur-[120px] animate-aurora" />
          <div className="absolute bottom-20 left-10 w-[300px] h-[300px] rounded-full bg-neon-blue/[0.06] blur-[100px] animate-aurora-2" />
          <div className="absolute top-[40%] left-[40%] w-[200px] h-[200px] rounded-full bg-neon-purple/[0.05] blur-[80px] animate-aurora-3" />
          <div className="absolute top-20 right-20 w-96 h-96 bg-dot-pattern bg-dot opacity-[0.15]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            {/* Left — text content */}
            <div className="lg:col-span-5 space-y-8">
              <ScrollReveal delay={0}>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-400 bg-primary-500/10 px-4 py-2 rounded-full border border-primary-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                  Now live in 12+ cities
                </div>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <h1 className="text-white !leading-[1.06]">
                  Drive your
                  <br />
                  <span className="relative inline-block">
                    <span className="text-gradient">{displayText}</span>
                    {cursorVisible && <span className="typewriter-cursor" />}
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                      <path d="M2 8 C50 2, 150 2, 198 8" stroke="url(#hero-line)" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
                      <defs><linearGradient id="hero-line" x1="0" y1="0" x2="200" y2="0"><stop offset="0%" stopColor="#ff4433"/><stop offset="100%" stopColor="#00d4ff"/></linearGradient></defs>
                    </svg>
                  </span>
                  <br />
                  today.
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <p className="text-dark-300 text-lg max-w-md leading-relaxed">
                  Premium vehicles from verified owners.
                  Book in under 2 minutes, pick up and go.
                </p>
              </ScrollReveal>

              {/* Search — integrated, dark glass */}
              <ScrollReveal delay={300}>
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                      type="text"
                      placeholder="Search by car, location, type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field !pl-11 !rounded-full"
                      aria-label="Search vehicles"
                    />
                  </div>
                  <button
                    ref={magneticRef}
                    {...magneticProps}
                    type="submit"
                    className="btn-primary !rounded-full !px-5 btn-magnetic"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </ScrollReveal>

              {/* Social proof row */}
              <ScrollReveal delay={400}>
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex -space-x-2">
                    {['E','M','R','A'].map((letter, i) => (
                      <div
                        key={i}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-dark-900"
                        style={{ background: ['#ff4433','#00ff87','#00d4ff','#a855f7'][i], zIndex: 4 - i }}
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
                      <span className="text-sm font-semibold text-white ml-1">4.8</span>
                    </div>
                    <p className="text-xs text-dark-400 mt-0.5">from 10,000+ rides</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right — asymmetric overlapping composition */}
            <div className="lg:col-span-7 relative lg:pl-12">
              <ScrollReveal direction="right" delay={200}>
                <div className="relative">
                  {/* Main image — asymmetric crop */}
                  <div className="rounded-[28px] overflow-hidden shadow-2xl shadow-primary-500/10 aspect-[4/3] lg:aspect-[16/10] border border-white/[0.08] relative">
                    <img
                      src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80"
                      alt="Premium car on scenic road"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950/40 via-transparent to-transparent" />
                  </div>

                  {/* Overlapping animated car — peeking from below the image */}
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-10 hidden lg:block">
                    <AnimatedCar className="drop-shadow-2xl" />
                  </div>

                  {/* Floating stat card — overlaps image edge */}
                  <div className="absolute -bottom-5 -left-4 sm:left-6 bg-dark-800/80 backdrop-blur-2xl border border-white/[0.08] p-4 rounded-2xl shadow-2xl shadow-black/40 z-20 hidden sm:flex items-center gap-3 holo-card">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 to-neon-green flex items-center justify-center shadow-glow-accent">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">500+ verified</p>
                      <p className="text-xs text-dark-400">vehicles available</p>
                    </div>
                  </div>

                  {/* Floating price — rotated slightly for asymmetry */}
                  <div className="absolute -top-6 -right-3 sm:right-6 bg-dark-800/80 backdrop-blur-2xl border border-white/[0.08] px-5 py-3 rounded-2xl shadow-2xl shadow-black/40 z-20 hidden sm:block rotate-2 hover:rotate-0 transition-transform duration-500 holo-card">
                    <p className="text-xs text-dark-400 font-medium">Starting from</p>
                    <p className="text-xl font-extrabold text-white">$29<span className="text-sm font-normal text-dark-400">/day</span></p>
                  </div>

                  {/* Decorative neon ring — offset asymmetrically */}
                  <div className="absolute -bottom-16 -right-8 w-32 h-32 border-[2px] border-dashed border-primary-500/20 rounded-full hidden lg:block animate-spin-slow" style={{ animationDuration: '20s' }} />
                  <div className="absolute -top-8 -left-6 w-16 h-16 border border-neon-blue/15 rounded-full hidden lg:block" />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
      </MouseSpotlight>

      {/* ═══════════════════════════════════════════════
          MARQUEE — scrolling brand bar
         ═══════════════════════════════════════════════ */}
      <section className="border-y border-white/[0.06] bg-dark-900/50 py-4 overflow-hidden backdrop-blur-sm">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, setIdx) => (
            <React.Fragment key={setIdx}>
              {['Tesla','BMW','Mercedes','Audi','Porsche','Toyota','Range Rover','Lamborghini','Ferrari','Honda','Hyundai','Kia'].map((brand) => (
                <span key={`${setIdx}-${brand}`} className="inline-flex items-center gap-3 mx-8 text-dark-400 text-sm font-semibold uppercase tracking-wider">
                  <span className="w-1 h-1 rounded-full bg-primary-500/60" />
                  {brand}
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ROAD DIVIDER
         ═══════════════════════════════════════════════ */}
      <RoadDivider className="my-4" />

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS — horizontal timeline with neon accents
         ═══════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
              <div>
                <span className="section-label mb-4 block w-fit">How it works</span>
                <h2 className="text-white">Rent in three moves</h2>
              </div>
              <Link
                to="/search"
                className="text-sm font-semibold text-primary-400 flex items-center gap-1 hover:gap-2 transition-all group"
              >
                Start browsing <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Search & discover',
                desc: 'Browse by type, brand, price range, or pickup location. Smart filters find your perfect match.',
                color: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
                iconColor: 'text-primary-400',
                icon: Search,
              },
              {
                num: '02',
                title: 'Book instantly',
                desc: "Select dates, review transparent pricing, and confirm in seconds. No hidden charges — ever.",
                color: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
                iconColor: 'text-accent-400',
                icon: Clock,
              },
              {
                num: '03',
                title: 'Pick up & drive',
                desc: 'Meet the owner, grab the keys, and hit the road. Full insurance included on every trip.',
                color: 'bg-neon-blue/10 text-neon-blue border-neon-blue/20',
                iconColor: 'text-neon-blue',
                icon: Car,
              },
            ].map(({ num, title, desc, color, iconColor, icon: Icon }, idx) => (
              <ScrollReveal key={num} delay={idx * 120}>
                <div
                  className={`group relative p-8 rounded-3xl border border-white/[0.06] bg-dark-800/50 backdrop-blur-sm hover:border-white/[0.12] hover:bg-dark-800/80 transition-all duration-500 holo-card h-full`}
                >
                  {/* Number + line connector */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-extrabold border ${color}`}>
                      {num}
                    </span>
                    {idx < 2 && (
                      <div className="hidden md:block flex-1 h-px bg-white/[0.06] group-hover:bg-primary-500/30 transition-colors" />
                    )}
                  </div>
                  <Icon className={`w-6 h-6 ${iconColor} mb-4`} />
                  <h4 className="text-white mb-2">{title}</h4>
                  <p className="text-sm text-dark-300 leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ROAD DIVIDER 2
         ═══════════════════════════════════════════════ */}
      <RoadDivider className="my-4" />

      {/* ═══════════════════════════════════════════════
          BENTO GRID — dark glass variant
         ═══════════════════════════════════════════════ */}
      <section className="pb-24 pt-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <span className="section-label mb-4 block w-fit">Why DriveX</span>
            <h2 className="text-white mb-12 max-w-lg">
              Not your average<br />rental platform
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Large feature card */}
            <ScrollReveal className="md:col-span-4" delay={0}>
              <div className="rounded-3xl overflow-hidden relative group min-h-[320px] border border-white/[0.06] holo-card">
                <img
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=900&q=80"
                  alt="Premium vehicle interior"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 z-10">
                  <span className="badge-neutral mb-3 !bg-white/10 !text-white backdrop-blur-sm !border-white/10">Premium Fleet</span>
                  <h3 className="text-white mb-2">Curated, not crowded</h3>
                  <p className="text-dark-300 text-sm max-w-xs">
                    Every vehicle is hand-inspected. We reject 40% of listings to keep quality high.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Tall stat card */}
            <ScrollReveal className="md:col-span-2" delay={150}>
              <div className="rounded-3xl bg-dark-800/60 backdrop-blur-sm border border-white/[0.06] p-8 flex flex-col justify-between text-white min-h-[320px]">
                <div>
                  <Shield className="w-7 h-7 text-accent-400 mb-4" />
                  <h4 className="text-white mb-2">Fully insured</h4>
                  <p className="text-sm text-dark-300 leading-relaxed">
                    Comprehensive coverage included with every booking. Drive worry-free.
                  </p>
                </div>
                <div className="flex items-end gap-2 mt-auto pt-6">
                  <span className="text-4xl font-extrabold text-gradient">100%</span>
                  <span className="text-sm text-dark-400 pb-1">coverage</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Row of 3 smaller feature cards */}
            <ScrollReveal className="md:col-span-2" delay={100}>
              <div className="rounded-3xl bg-accent-500/[0.06] border border-accent-500/20 p-6 flex flex-col justify-between min-h-[200px] hover:bg-accent-500/10 transition-colors">
                <Zap className="w-6 h-6 text-accent-400 mb-3" />
                <div>
                  <h5 className="text-white mb-1 font-bold">Instant booking</h5>
                  <p className="text-xs text-dark-300">No waiting for approval. Most cars are instant-book enabled.</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal className="md:col-span-2" delay={200}>
              <div className="rounded-3xl bg-primary-500/[0.06] border border-primary-500/20 p-6 flex flex-col justify-between min-h-[200px] hover:bg-primary-500/10 transition-colors">
                <Star className="w-6 h-6 text-primary-400 mb-3" />
                <div>
                  <h5 className="text-white mb-1 font-bold">4.8★ average</h5>
                  <p className="text-xs text-dark-300">Rated by 10,000+ real riders. Read verified reviews before booking.</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal className="md:col-span-2" delay={300}>
              <div className="rounded-3xl bg-neon-blue/[0.06] border border-neon-blue/20 p-6 flex flex-col justify-between min-h-[200px] hover:bg-neon-blue/10 transition-colors">
                <MapPin className="w-6 h-6 text-neon-blue mb-3" />
                <div>
                  <h5 className="text-white mb-1 font-bold">12+ cities</h5>
                  <p className="text-xs text-dark-300">Mumbai, Delhi, Bangalore, Pune, and expanding every month.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <RoadDivider className="my-4" />

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS — dark glass cards
         ═══════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="section-label mb-4 inline-block">What riders say</span>
              <h2 className="text-white">Loved by thousands</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "DriveX made renting a car feel effortless. Found a BMW within 5 minutes and the pickup was smooth.",
                name: 'Arjun Mehta',
                role: 'Frequent traveler',
                initials: 'AM',
                bg: 'bg-gradient-to-br from-primary-500 to-primary-600',
              },
              {
                quote: "As an owner, I've earned ₹2L+ in 6 months listing my car. The platform handles everything.",
                name: 'Priya Sharma',
                role: 'Vehicle owner',
                initials: 'PS',
                bg: 'bg-gradient-to-br from-accent-500 to-neon-green',
              },
              {
                quote: "Transparent pricing, no hidden fees, and great customer support. 10/10 would recommend.",
                name: 'Rohit Kumar',
                role: 'Weekend road-tripper',
                initials: 'RK',
                bg: 'bg-gradient-to-br from-neon-blue to-neon-purple',
              },
            ].map(({ quote, name, role, initials, bg }, idx) => (
              <ScrollReveal key={name} delay={idx * 150}>
                <div
                  className={`p-8 rounded-3xl border border-white/[0.06] bg-dark-800/40 backdrop-blur-sm hover:bg-dark-800/70 hover:border-white/[0.1] transition-all duration-500 holo-card h-full ${idx === 1 ? 'md:-translate-y-4' : ''}`}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-dark-200 text-sm leading-relaxed mb-6">"{quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{name}</p>
                      <p className="text-xs text-dark-400">{role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <RoadDivider variant="tracks" className="my-4" />

      {/* ═══════════════════════════════════════════════
          FEATURED VEHICLES — drag carousel
         ═══════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <DragCarousel
              title="Top picks for you"
              subtitle="Featured rides"
            >
              {[
                { name: 'Tesla Model 3', price: '₹4,500', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500&q=80', tag: 'Electric' },
                { name: 'BMW 3 Series', price: '₹5,200', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&q=80', tag: 'Luxury' },
                { name: 'Range Rover Sport', price: '₹8,000', img: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500&q=80', tag: 'SUV' },
                { name: 'Mercedes C-Class', price: '₹6,500', img: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&q=80', tag: 'Premium' },
                { name: 'Porsche 911', price: '₹15,000', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&q=80', tag: 'Sports' },
                { name: 'Hyundai Creta', price: '₹2,200', img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&q=80', tag: 'Popular' },
              ].map((car, idx) => (
                <Link
                  key={car.name}
                  to="/search"
                  className="flex-shrink-0 w-[280px] snap-start group"
                >
                  <div className="rounded-3xl overflow-hidden border border-white/[0.06] bg-dark-800/50 backdrop-blur-sm hover:border-white/[0.12] transition-all duration-500 holo-card">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={car.img}
                        alt={car.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 badge-info !text-[10px]">{car.tag}</span>
                    </div>
                    <div className="p-4">
                      <h5 className="text-white text-sm font-bold group-hover:text-primary-400 transition-colors">{car.name}</h5>
                      <div className="flex items-end justify-between mt-2">
                        <span className="text-lg font-extrabold text-white">{car.price}<span className="text-xs text-dark-400 font-normal">/day</span></span>
                        <ArrowUpRight className="w-4 h-4 text-dark-400 group-hover:text-primary-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </DragCarousel>
          </ScrollReveal>
        </div>
      </section>

      <RoadDivider className="my-4" />

      {/* ═══════════════════════════════════════════════
          FAQ — animated accordion
         ═══════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <ScrollReveal>
              <div className="sticky top-32">
                <span className="section-label mb-4 block w-fit">FAQ</span>
                <h2 className="text-white mb-4">Got questions?<br />We've got answers.</h2>
                <p className="text-dark-300 max-w-sm leading-relaxed mb-6">
                  Everything you need to know about renting with DriveX. Can't find what you're looking for? Reach out to our support team.
                </p>
                <Link
                  to="/search"
                  className="btn-primary !px-6 !py-3"
                >
                  Browse cars <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <FAQAccordion items={faqItems} />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA — bold with neon accents
         ═══════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <ScrollReveal direction="scale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[32px] overflow-hidden bg-dark-800/60 backdrop-blur-xl border border-white/[0.08] p-10 md:p-16 holo-card">
            {/* Decorative neon blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/[0.08] rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-neon-blue/[0.08] rounded-full blur-[100px]" />
            <div className="absolute top-[50%] left-[50%] w-40 h-40 bg-neon-purple/[0.06] rounded-full blur-[80px]" />
            <div className="absolute top-8 right-10 w-20 h-20 border border-white/[0.06] rounded-full hidden lg:block" />
            <div className="absolute bottom-8 right-32 w-8 h-8 border border-white/[0.06] rounded-full hidden lg:block" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-white mb-4 !text-3xl md:!text-4xl">
                  Ready to hit<br />the open road?
                </h2>
                <p className="text-dark-300 max-w-sm mb-8 leading-relaxed">
                  Join 10,000+ riders who've discovered a better way to rent. Your first ride is just a click away.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/search" className="btn-primary !px-8 !py-4">
                    Browse cars <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold border border-white/[0.15] hover:bg-white/[0.06] transition-all duration-300"
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
                  ].map(({ val, label }, idx) => (
                    <ScrollReveal key={label} delay={idx * 100} direction="scale">
                      <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center hover:bg-white/[0.06] transition-colors">
                        <p className="text-2xl font-extrabold text-white">{val}</p>
                        <p className="text-xs text-dark-400 mt-1">{label}</p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
