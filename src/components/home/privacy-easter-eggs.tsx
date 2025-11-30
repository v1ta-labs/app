'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Shield, Lock, EyeOff, Zap, Eye, Key } from 'lucide-react';

interface PrivacyParticle {
  id: number;
  x: number;
  y: number;
  icon: 'moon' | 'shield' | 'lock' | 'eyeoff';
  delay: number;
  duration: number;
}

export function PrivacyEasterEggs() {
  const [particles, setParticles] = useState<PrivacyParticle[]>([]);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [konamiCode, setKonamiCode] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);
  const [privacyUnlocked, setPrivacyUnlocked] = useState(false);

  // Generate privacy particles occasionally (optimized)
  useEffect(() => {
    const generateParticle = () => {
      const icons: Array<'moon' | 'shield' | 'lock' | 'eyeoff'> = ['moon', 'shield', 'lock', 'eyeoff'];
      const newParticle: PrivacyParticle = {
        id: Date.now() + Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        icon: icons[Math.floor(Math.random() * icons.length)],
        delay: Math.random() * 2,
        duration: 8 + Math.random() * 4
      };

      setParticles(prev => {
        // Limit total particles to prevent performance issues
        if (prev.length >= 10) return prev;
        return [...prev, newParticle];
      });

      // Remove particle after animation
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, (newParticle.delay + newParticle.duration) * 1000);
    };

    // Generate particles occasionally (reduced frequency)
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // Reduced to 10% chance every 10 seconds
        generateParticle();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Konami code detection (↑↑↓↓←→←→BA)
  useEffect(() => {
    const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const newSequence = [...sequence, key].slice(-10); // Keep last 10 keys

      setSequence(newSequence);

      // Check if last 10 keys match Konami code
      if (newSequence.length === 10) {
        const matches = newSequence.every((key, index) =>
          key === konamiPattern[index].toLowerCase()
        );

        if (matches) {
          setKonamiCode(true);
          setPrivacyUnlocked(true);
          // Trigger celebration
          generateCelebrationParticles();
          setTimeout(() => setKonamiCode(false), 5000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sequence]);

  // Celebration particles for Konami code (optimized)
  const generateCelebrationParticles = useCallback(() => {
    const icons: Array<'moon' | 'shield' | 'lock' | 'eyeoff'> = ['moon', 'shield', 'lock', 'eyeoff'];

    // Generate fewer particles to prevent performance issues
    const particleCount = Math.min(10, 20 - particles.length);

    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        const newParticle: PrivacyParticle = {
          id: Date.now() + Math.random() + i,
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 50,
          icon: icons[Math.floor(Math.random() * icons.length)],
          delay: 0,
          duration: 6 + Math.random() * 3
        };

        setParticles(prev => {
          // Prevent too many particles at once
          if (prev.length >= 15) return prev;
          return [...prev, newParticle];
        });

        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== newParticle.id));
        }, newParticle.duration * 1000);
      }, i * 150); // Slower stagger
    }
  }, [particles.length]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'moon': return Moon;
      case 'shield': return Shield;
      case 'lock': return Lock;
      case 'eyeoff': return EyeOff;
      default: return Moon;
    }
  };

  return (
    <>
      {/* Floating Privacy Particles */}
      <div className="fixed inset-0 pointer-events-none z-[5]">
        <AnimatePresence>
          {particles.map(particle => {
            const Icon = getIcon(particle.icon);
            return (
              <motion.div
                key={particle.id}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  scale: [0, 1, 0],
                  rotate: 180,
                  y: [0, -100, -200]
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  delay: particle.delay,
                  duration: particle.duration,
                  ease: "easeInOut"
                }}
                className="absolute"
                style={{
                  left: particle.x,
                  top: particle.y,
                }}
              >
                <div className="relative">
                  <Icon className="w-4 h-4 text-primary/30" />
                  <div className="absolute inset-0 bg-primary/20 blur-md" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Hidden hover hints on key elements */}
      <div className="fixed inset-0 pointer-events-none z-[6]">
        {/* Privacy hint on scroll */}
        <motion.div
          className="absolute bottom-8 right-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: [0, 1, 0] }}
          transition={{ duration: 3, times: [0, 0.1, 1] }}
          viewport={{ once: false, amount: 0.8 }}
        >
          <div className="flex items-center gap-2 px-3 py-2 bg-elevated/80 backdrop-blur-sm rounded-full border border-primary/20">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary/80">Privacy loading...</span>
          </div>
        </motion.div>

        {/* Console easter egg */}
        <motion.div
          className="absolute bottom-4 left-4 opacity-0 hover:opacity-100 transition-opacity duration-300"
          whileHover={{ opacity: 1 }}
        >
          <div className="font-mono text-xs text-primary/40 pointer-events-auto cursor-default">
            {'// Privacy features activated in background'}
          </div>
        </motion.div>
      </div>

      {/* Hidden clickable easter egg (Konami code style) */}
      <div
        className="fixed bottom-20 left-20 w-2 h-2 opacity-0 hover:opacity-20 transition-opacity duration-500 z-[7]"
        onMouseEnter={() => setHoveredElement('secret')}
        onMouseLeave={() => setHoveredElement(null)}
      />

      {/* Secret reveal on hover */}
      <AnimatePresence>
        {hoveredElement === 'secret' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 left-20 z-[8] pointer-events-none"
          >
            <div className="px-3 py-2 bg-primary/90 backdrop-blur-sm rounded-lg shadow-lg">
              <div className="flex items-center gap-2 text-xs text-text-primary">
                <Lock className="w-3 h-3" />
                <span>110% CR + Privacy = V1TA</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Konami Code Celebration */}
      <AnimatePresence>
        {konamiCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-elevated/95 backdrop-blur-xl border-2 border-primary rounded-2xl p-8 shadow-2xl max-w-md mx-4">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="bg-gradient-to-br from-primary to-primary-hover p-4 rounded-full"
                  >
                    <Key className="w-8 h-8 text-text-primary" />
                  </motion.div>
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  🎉 Privacy Unlocked! 🎉
                </h2>
                <p className="text-text-secondary mb-4">
                  You've discovered the V1TA privacy protocol!
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-primary">
                  <Moon className="w-4 h-4" />
                  <span>Umbra + Magicblock + Arcium</span>
                  <Shield className="w-4 h-4" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creative floating privacy quotes */}
      {privacyUnlocked && (
        <div className="fixed top-1/2 left-8 -translate-y-1/2 z-[4] max-w-xs pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: [0, 0.6, 0], x: [-20, 0, 20] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="font-mono text-xs text-primary/30 italic"
          >
            "Privacy is not about hiding; it's about controlling what you share."
          </motion.div>
        </div>
      )}

      {/* Interactive privacy zones */}
      <div className="fixed bottom-4 right-4 z-[6]">
        <motion.div
          className="w-8 h-8 bg-primary/20 rounded-full cursor-pointer hover:bg-primary/30 transition-colors"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setPrivacyUnlocked(!privacyUnlocked);
            if (!privacyUnlocked) generateCelebrationParticles();
          }}
          title="Click for privacy surprise"
        >
          <div className="w-full h-full flex items-center justify-center">
            <Eye className="w-4 h-4 text-primary/60" />
          </div>
        </motion.div>
      </div>

      {/* Binary rain enhancement when privacy unlocked (optimized) */}
      {privacyUnlocked && (
        <div className="fixed inset-0 pointer-events-none z-[3] opacity-10">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`binary-${i}`}
              className="absolute font-mono text-xs text-primary/40"
              style={{
                left: `${(i * 12.5) + Math.random() * 10}%`,
                top: -20,
              }}
              animate={{
                y: [0, window.innerHeight + 40],
                opacity: [0, 0.8, 0.8, 0]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 8,
                ease: "linear"
              }}
            >
              {Array.from({ length: 8 }, () => Math.random() > 0.5 ? "1" : "0").join("")}
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}