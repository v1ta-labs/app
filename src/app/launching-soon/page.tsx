'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Twitter, Github, BookOpen, Clock, Send } from 'lucide-react';
import { Logotype } from '@/components/ui/logotype';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function LaunchingSoonPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown to launch (set to 30 days from now, adjust as needed)
  useEffect(() => {
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 30); // 30 days from now

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-base">
      {/* Mystical Background */}
      <MysticalBackground />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.6, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex justify-center mb-12"
          >
            <Logotype size="lg" showSubheading={true} interactive={true} />
          </motion.div>

          {/* Main Card */}
          <Card className="p-8 md:p-12 backdrop-blur-xl bg-surface/80 border-border/50 text-center relative overflow-hidden">
            {/* Sparkle decoration */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-4 right-4"
            >
              <Sparkles className="w-6 h-6 text-primary/50" />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-br from-text-primary via-primary to-text-primary bg-clip-text text-transparent">
                Emerging from the Depths
              </h1>
              <p className="text-lg md:text-xl text-text-secondary mb-2">
                V1ta Protocol is preparing to launch
              </p>
              <p className="text-sm text-text-tertiary mb-12">
                A new era of decentralized lending is coming to Solana
              </p>
            </motion.div>

            {/* Countdown Timer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-text-primary">Launching In</h2>
              </div>
              <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-2xl mx-auto">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Minutes', value: timeLeft.minutes },
                  { label: 'Seconds', value: timeLeft.seconds },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                  >
                    <Card className="p-4 md:p-6 bg-elevated/50 border-border/30">
                      <div className="text-3xl md:text-5xl font-bold text-primary mb-2">
                        {item.value.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs md:text-sm text-text-tertiary uppercase tracking-wider">
                        {item.label}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Features Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mb-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {[
                  {
                    title: 'Zero Interest',
                    description: 'Borrow VUSD with no interest fees',
                  },
                  {
                    title: 'True Decentralization',
                    description: 'No central authority, pure DeFi',
                  },
                  {
                    title: 'Built on Solana',
                    description: 'Fast, secure, and scalable',
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
                  >
                    <Card className="p-4 bg-elevated/30 border-border/20 h-full">
                      <h3 className="text-sm font-bold text-text-primary mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-text-tertiary">{feature.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Community Link - Highlighted */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="mb-6"
            >
              <Button
                className="gap-2 px-6 py-6 bg-primary hover:bg-primary-hover shadow-lg"
                onClick={() => window.open('https://t.me/v1ta_fi', '_blank')}
              >
                <Send className="w-5 h-5" />
                <span className="font-semibold">Join V1ta Community</span>
              </Button>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            >
              <p className="text-sm text-text-tertiary mb-4">Follow us</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open('https://x.com/v1ta_fi', '_blank')}
                >
                  <Twitter className="w-4 h-4" />
                  X
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open('https://github.com/v1ta-labs', '_blank')}
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open('https://docs.v1ta.xyz', '_blank')}
                >
                  <BookOpen className="w-4 h-4" />
                  Docs
                </Button>
              </div>
            </motion.div>
          </Card>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="text-center mt-8 text-sm text-text-tertiary"
          >
            <p>Borrow from the depths. Survive the storm.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// Mystical animated background component
function MysticalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    }

    const nodes: Node[] = [];
    const maxNodes = 30;

    for (let i = 0; i < 8; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 1,
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 15, 5, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 200) {
            const opacity = (1 - dist / 200) * 0.15;
            ctx.strokeStyle = `rgba(42, 73, 48, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(42, 73, 48, 0.4)';
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" />
  );
}
