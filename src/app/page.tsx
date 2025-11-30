'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AppLayout } from '@/components/layout';
import { HeroSection } from '@/components/home/hero-section';
import { MysticalBranches } from '@/components/home/mystical-branches';
import { DarkModeAnnouncementModal } from '@/components/home/dark-mode-announcement-modal';
import { BorrowInterface } from '@/components/borrow/borrow-interface';

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const borrowSectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showDarkModeModal, setShowDarkModeModal] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Portal animation - grows and fades (slower progression)
  const portalScale = useTransform(scrollYProgress, [0.15, 0.4, 0.6], [0, 1.8, 0.5]);
  const portalOpacity = useTransform(scrollYProgress, [0.15, 0.4, 0.6], [0, 1, 0]);

  // Borrow component - scales from center (slower, more dramatic)
  const borrowScale = useTransform(scrollYProgress, [0.45, 0.7], [0.2, 1]);
  const borrowOpacity = useTransform(scrollYProgress, [0.45, 0.7], [0, 1]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            const borrowTab = document.querySelector('[href="/borrow"]');
            if (borrowTab) {
              borrowTab.classList.add('animate-pulse');
              setTimeout(() => {
                borrowTab.classList.remove('animate-pulse');
              }, 2000);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    if (borrowSectionRef.current) {
      observer.observe(borrowSectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Enable smooth scrolling
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Handle hash navigation on load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  // Show dark mode announcement modal on page load (with delay)
  useEffect(() => {
    const hasSeenModal = localStorage.getItem('darkModeAnnouncementDismissed');
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setShowDarkModeModal(true);
      }, 2000); // Show after 2 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AppLayout>
      <div ref={containerRef} className="relative">
        {/* Mystical Branches Background */}
        <MysticalBranches />

        {/* Hero Section */}
        <div className="relative z-10">
          <HeroSection />
        </div>

        {/* Portal Transition */}
        <motion.div
          style={{
            scale: portalScale,
            opacity: portalOpacity,
          }}
          className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center"
        >
          <div className="relative w-[800px] h-[800px]">
            {/* Portal rings - dark green with glow */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2"
                style={{
                  scale: 1 + i * 0.15,
                  opacity: 0.3 - i * 0.04,
                  borderColor: `rgba(42, 73, 48, ${0.6 - i * 0.1})`,
                  boxShadow: `0 0 ${30 + i * 10}px rgba(42, 73, 48, ${0.3 - i * 0.05})`,
                }}
                animate={{
                  rotate: i % 2 === 0 ? 360 : -360,
                  scale: [1 + i * 0.15, 1.15 + i * 0.15, 1 + i * 0.15],
                }}
                transition={{
                  rotate: {
                    duration: 15 - i * 2,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                  scale: {
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
              />
            ))}

            {/* Center glow - dark subtle */}
            <div className="absolute inset-0 rounded-full bg-gradient-radial from-elevated/30 via-surface/20 to-transparent blur-3xl" />

            {/* Particles - dark green */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-border rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 600],
                  y: [0, (Math.random() - 0.5) * 600],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Spacer for scroll */}
        <div className="h-[30vh]" />

        {/* Borrow Section - Scales from Portal Center */}
        <motion.div
          id="borrow-section"
          ref={borrowSectionRef}
          style={{
            opacity: borrowOpacity,
            scale: borrowScale,
          }}
          className="relative z-30 min-h-screen flex items-center justify-center px-12 py-12"
        >
          <motion.div
            className="w-full max-w-[650px]"
            style={{
              transformOrigin: 'center center',
            }}
          >
            {/* Title with staggered fade-in */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-2xl font-bold text-text-primary mb-2"
              >
                Borrow VUSD
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-sm text-text-tertiary"
              >
                Deposit collateral and borrow against your assets
              </motion.p>
            </motion.div>

            {/* Borrow interface with entrance animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <BorrowInterface />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Dark Mode Announcement Modal */}
        <DarkModeAnnouncementModal
          open={showDarkModeModal}
          onOpenChange={setShowDarkModeModal}
        />
      </div>
    </AppLayout>
  );
}
