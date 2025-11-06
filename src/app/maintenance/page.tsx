'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wrench,
  Twitter,
  Github,
  BookOpen,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { Logotype } from '@/components/ui/logotype';

export default function MaintenancePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-base">
      {/* Mystical Background */}
      <MysticalBackground />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-warning/30 rounded-full"
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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-warning/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"
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
            {/* Wrench icon decoration */}
            <motion.div
              animate={{
                rotate: [0, 15, 0, -15, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-4 right-4"
            >
              <Wrench className="w-6 h-6 text-warning/50" />
            </motion.div>

            {/* Main Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-warning/20 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Wrench className="w-12 h-12 text-warning" />
                  </motion.div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-warning"
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-br from-text-primary via-warning to-text-primary bg-clip-text text-transparent">
                Under Maintenance
              </h1>
              <p className="text-lg md:text-xl text-text-secondary mb-2">
                We're making V1ta Protocol even better
              </p>
              <p className="text-sm text-text-tertiary mb-12">
                Our team is currently performing essential upgrades to enhance your experience
              </p>
            </motion.div>

            {/* Status Updates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-6">Current Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {[
                  {
                    title: 'Smart Contracts',
                    status: 'secure',
                    icon: CheckCircle2,
                    color: 'text-success',
                  },
                  {
                    title: 'Frontend Updates',
                    status: 'in progress',
                    icon: RefreshCw,
                    color: 'text-warning',
                    animate: true,
                  },
                  {
                    title: 'Your Funds',
                    status: 'safe',
                    icon: CheckCircle2,
                    color: 'text-success',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                  >
                    <Card className="p-4 bg-elevated/30 border-border/20 h-full">
                      <motion.div
                        animate={item.animate ? { rotate: 360 } : {}}
                        transition={
                          item.animate
                            ? { duration: 2, repeat: Infinity, ease: 'linear' }
                            : {}
                        }
                        className="flex justify-center mb-2"
                      >
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </motion.div>
                      <h3 className="text-sm font-bold text-text-primary mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-text-tertiary capitalize">{item.status}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Expected Return */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mb-12"
            >
              <Card className="p-6 bg-elevated/50 border-warning/30 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  <h3 className="text-lg font-semibold text-text-primary">
                    Expected Return Time
                  </h3>
                </div>
                <p className="text-2xl font-bold text-warning mb-2">Within 2-4 hours</p>
                <p className="text-xs text-text-tertiary">
                  We'll be back shortly. Thank you for your patience.
                </p>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mb-8"
            >
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2 px-6"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Page'}
              </Button>
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
              <p className="text-sm text-text-tertiary mb-4">
                Get real-time updates
              </p>
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
            <p>We appreciate your understanding and continued support</p>
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
            ctx.strokeStyle = `rgba(74, 57, 32, ${opacity})`; // warning color
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(74, 57, 32, 0.4)';
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
