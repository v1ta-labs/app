'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, BookOpen, Send, Zap, Layers, Binary, Calculator, Shield, Lock, EyeOff, Moon } from 'lucide-react';
import { Logotype } from '@/components/ui/logotype';
import { MysticalBranches } from '@/components/home/mystical-branches';

export default function LaunchingSoonPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    let trailId = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setMousePosition({ x, y });
      mouseX.set(x);
      mouseY.set(y);

      // Add trail particles
      setTrail(prev => {
        const newTrail = [...prev, { x, y, id: trailId++ }];
        return newTrail.slice(-8); // Keep only last 8 particles
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-base">
      {/* Mystical Branches Background */}
      <MysticalBranches />

      {/* Enhanced cursor effects */}
      <div className="pointer-events-none fixed inset-0 z-30">
        {/* Main cursor glow - stronger */}
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background: `radial-gradient(circle, rgba(42, 73, 48, 0.3), rgba(42, 73, 48, 0.1) 40%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Cursor ring */}
        <motion.div
          className="absolute w-8 h-8 rounded-full border-2 border-primary/50"
          style={{
            left: mousePosition.x - 16,
            top: mousePosition.y - 16,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />

        {/* Trailing particles */}
        {trail.map((point, index) => (
          <motion.div
            key={point.id}
            className="absolute w-3 h-3 rounded-full bg-primary"
            style={{
              left: point.x - 6,
              top: point.y - 6,
            }}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Orbiting particles around cursor */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-success/60"
            style={{
              left: mousePosition.x - 4,
              top: mousePosition.y - 4,
            }}
            animate={{
              x: [0, Math.cos((i * 120 * Math.PI) / 180) * 40],
              y: [0, Math.sin((i * 120 * Math.PI) / 180) * 40],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Grid overlay for futuristic feel */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(42, 73, 48, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(42, 73, 48, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Logo - Fixed position top left */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-8 left-8 z-20"
      >
        <div className="relative">
          <Logotype size="md" showSubheading={false} interactive={true} />

          {/* Scanning line effect */}
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
            animate={{
              top: ['0%', '100%', '0%'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      </motion.div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8 pt-32 md:pt-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full max-w-7xl"
        >

          {/* Main Hero Section */}
          <div className="grid lg:grid-cols-[1.3fr,0.9fr] gap-16 mb-16 items-start">
            {/* Left: Hero Message */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col justify-start space-y-8"
            >
              {/* Main Title */}
              <div className="space-y-4 mt-8">
                <div className="inline-block">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
                    <span className="text-xs font-mono text-primary tracking-[0.3em] uppercase">
                      Protocol v0
                    </span>
                  </div>

                  <h1 className="text-6xl md:text-8xl font-bold leading-[0.88] tracking-tight mb-6">
                    <motion.span
                      className="block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent relative"
                      animate={{
                        x: [0, -2, 2, 0],
                      }}
                      transition={{
                        duration: 0.3,
                        repeat: Infinity,
                        repeatDelay: 5,
                      }}
                    >
                      Privacy-Native
                      {/* Glitch layers */}
                      <motion.span
                        className="absolute inset-0 text-primary/40"
                        animate={{
                          x: [-2, 2, -2],
                          opacity: [0, 0.6, 0],
                        }}
                        transition={{
                          duration: 0.2,
                          repeat: Infinity,
                          repeatDelay: 5,
                        }}
                      >
                        Privacy-Native
                      </motion.span>
                    </motion.span>
                    <motion.span
                      className="block bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent relative"
                      animate={{
                        x: [0, 2, -2, 0],
                      }}
                      transition={{
                        duration: 0.3,
                        repeat: Infinity,
                        repeatDelay: 5,
                        delay: 0.1,
                      }}
                    >
                      Stablecoins.
                      {/* Glitch layers */}
                      <motion.span
                        className="absolute inset-0 text-success/40"
                        animate={{
                          x: [2, -2, 2],
                          opacity: [0, 0.6, 0],
                        }}
                        transition={{
                          duration: 0.2,
                          repeat: Infinity,
                          repeatDelay: 5,
                          delay: 0.1,
                        }}
                      >
                        Stablecoins.
                      </motion.span>
                    </motion.span>
                    <motion.span
                      className="block text-text-primary relative"
                      animate={{
                        x: [0, -2, 2, 0],
                      }}
                      transition={{
                        duration: 0.3,
                        repeat: Infinity,
                        repeatDelay: 5,
                        delay: 0.2,
                      }}
                    >
                      Fortified.
                      {/* Glitch layers */}
                      <motion.span
                        className="absolute inset-0 text-primary/30"
                        animate={{
                          x: [-2, 2, -2],
                          opacity: [0, 0.5, 0],
                        }}
                        transition={{
                          duration: 0.2,
                          repeat: Infinity,
                          repeatDelay: 5,
                          delay: 0.2,
                        }}
                      >
                        Fortified.
                      </motion.span>
                    </motion.span>
                  </h1>

                  <p className="text-xl md:text-2xl text-text-secondary leading-relaxed max-w-2xl font-light">
                    Where your financial privacy meets{' '}
                    <span className="text-primary font-medium">110% capital efficiency</span>.
                    <span className="text-primary font-medium">Confidential positions</span>,{' '}
                    <span className="text-primary font-medium">zero-knowledge transactions</span>.
                    Truly{' '}
                    <span className="text-primary font-medium">decentralized security</span>.
                  </p>
                </div>

                {/* Stats Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-8 pt-4"
                >
                  {[
                    { value: '110%', label: 'Capital Efficiency', icon: Calculator },
                    { value: '0%', label: 'Privacy Risk', icon: EyeOff },
                    { value: '100%', label: 'Decentralized', icon: Shield },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="group cursor-default"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <stat.icon className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                        <span className="text-2xl font-bold text-primary font-mono">
                          {stat.value}
                        </span>
                      </div>
                      <p className="text-xs text-text-tertiary uppercase tracking-wider font-mono">
                        {stat.label}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  className="gap-3 px-8 py-7 bg-primary hover:bg-primary-hover shadow-2xl shadow-primary/20 text-base font-semibold group relative overflow-hidden border border-primary/50"
                  onClick={() => window.open('https://t.me/v1ta_fi', '_blank')}
                >
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-success/20 via-primary to-success/20"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  <Send className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <span className="relative z-10">Join Privacy Revolution</span>
                </Button>

                <Button
                  variant="outline"
                  className="gap-3 px-8 py-7 text-base border-2 border-primary/30 hover:border-primary hover:bg-primary/5 group"
                  onClick={() => window.open('https://docs.v1ta.xyz', '_blank')}
                >
                  <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Documentation</span>
                </Button>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="flex items-center gap-6 pt-4"
              >
                <a
                  href="https://x.com/v1ta_fi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-tertiary hover:text-primary transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/v1ta-labs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-tertiary hover:text-primary transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <div className="h-4 w-px bg-border" />
                <span className="text-xs text-text-tertiary font-mono">DEVNET</span>
              </motion.div>
            </motion.div>

            {/* Right: Feature Grid */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8"
            >
              {/* Feature Grid */}
              <div className="grid gap-5">
                {[
                  {
                    icon: Shield,
                    title: 'Confidential Positions',
                    description: 'Private collateral and debt with Umbra stealth addresses',
                    metric: 'Zero-knowledge proofs',
                    gradient: 'from-primary/15 via-primary/8 to-transparent',
                  },
                  {
                    icon: Moon,
                    title: 'Privacy-First Design',
                    description: 'Built from ground up for financial privacy on Solana',
                    metric: 'Private by default',
                    gradient: 'from-primary/10 via-primary/5 to-transparent',
                  },
                  {
                    icon: Lock,
                    title: 'Uncompromising Security',
                    description: 'On-chain cryptography with zero-trust architecture',
                    metric: 'Open source code',
                    gradient: 'from-primary/15 via-primary/8 to-transparent',
                  },
                ].map((feature, i) => (
                  <FeatureCard key={feature.title} feature={feature} index={i} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Status Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="flex justify-center"
          >
            <a
              href="https://alpha.v1ta.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="group/status"
            >
              <Card className="inline-flex items-center gap-6 px-8 py-4 backdrop-blur-xl bg-surface/30 border-primary/20 relative overflow-hidden group cursor-pointer hover:border-primary/40 transition-all">
                {/* Animated border */}
                <motion.div
                  className="absolute inset-0 border border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{
                    borderRadius: ['0%', '2%', '0%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                  <span className="text-sm font-mono text-text-secondary">
                    Privacy Mode: <span className="text-primary">Coming Soon</span>
                  </span>
                </div>

                <div className="h-4 w-px bg-border/50" />

                <span className="text-xs text-text-tertiary font-mono group-hover/status:text-primary transition-colors">
                  Try Alpha →
                </span>
              </Card>
            </a>
          </motion.div>

          {/* Footer Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center mt-16"
          >
            <p className="text-text-tertiary font-serif text-lg italic">
              "Your financial position, <span className="text-primary/60">your business</span>"
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// Enhanced Feature Card Component
function FeatureCard({
  feature,
  index,
}: {
  feature: {
    icon: any;
    title: string;
    description: string;
    metric: string;
    gradient: string;
  };
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.15 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Cursor spotlight effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: isHovered
            ? `radial-gradient(200px circle at ${mouseX.get()}px ${mouseY.get()}px, rgba(42, 73, 48, 0.15), transparent 70%)`
            : 'transparent',
        }}
      />

      <Card
        className={`p-6 backdrop-blur-xl bg-gradient-to-br ${feature.gradient} border-border/30 hover:border-primary/50 transition-all duration-500 relative overflow-hidden group-hover:shadow-xl group-hover:shadow-primary/5 h-full`}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-primary/20 group-hover:border-primary/50 transition-colors" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-primary/20 group-hover:border-primary/50 transition-colors" />

        {/* Animated scan line */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100"
          animate={
            isHovered
              ? {
                  top: ['0%', '100%'],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <div className="relative z-10 h-full flex flex-col">
          {/* Top: Icon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all flex-shrink-0">
              <feature.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-primary transition-colors leading-tight">
                {feature.title}
              </h3>
            </div>
          </div>

          {/* Middle: Description */}
          <p className="text-sm text-text-tertiary leading-relaxed mb-4 flex-1">
            {feature.description}
          </p>

          {/* Bottom: Metric and Progress */}
          <div className="space-y-2.5 mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-primary/70 uppercase tracking-wider">
                Security Level
              </span>
              <span className="text-xs font-mono font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/30 group-hover:bg-primary/20 transition-all">
                {feature.metric}
              </span>
            </div>

            {/* Privacy indicator */}
            <div className="flex gap-1.5">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i < 2 ? 'bg-primary/40' : 'bg-success/40'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={
                    isHovered
                      ? {
                          scaleX: 1,
                          backgroundColor: i < 2 ? 'rgba(42, 73, 48, 0.6)' : 'rgba(34, 197, 94, 0.6)',
                        }
                      : { scaleX: 0 }
                  }
                  transition={{
                    delay: i * 0.1,
                    duration: 0.3,
                  }}
                  style={{ transformOrigin: 'left' }}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
