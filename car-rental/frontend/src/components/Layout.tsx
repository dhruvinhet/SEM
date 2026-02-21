import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollProgress from './ScrollProgress';
import GlowCursor from './GlowCursor';
import PageTransition from './PageTransition';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const { loadUser } = useAuthStore();
  const blob1 = useRef<HTMLDivElement>(null);
  const blob2 = useRef<HTMLDivElement>(null);
  const blob3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUser();
  }, []);

  // Parallax via direct DOM — zero re-renders
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (blob1.current) blob1.current.style.transform = `translateY(${y * 0.15}px)`;
        if (blob2.current) blob2.current.style.transform = `translateY(${y * -0.08}px)`;
        if (blob3.current) blob3.current.style.transform = `translateY(${y * -0.12}px)`;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 relative">
      <GlowCursor />
      {/* Global aurora background with parallax */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div ref={blob1} className="absolute -top-[30%] -left-[10%] w-[600px] h-[600px] rounded-full bg-primary-500/[0.04] blur-[120px] will-change-transform" />
        <div ref={blob2} className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-neon-blue/[0.03] blur-[120px] will-change-transform" />
        <div ref={blob3} className="absolute -bottom-[20%] left-[30%] w-[400px] h-[400px] rounded-full bg-neon-purple/[0.03] blur-[120px] will-change-transform" />
      </div>
      <ScrollProgress />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main id="main-content" className="flex-1">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <Footer />
      </div>
    </div>
  );
}
