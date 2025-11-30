'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Moon, Lock, EyeOff, Zap } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';

interface DarkModeAnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DarkModeAnnouncementModal({ open, onOpenChange }: DarkModeAnnouncementModalProps) {
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  // Check if modal was previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('darkModeAnnouncementDismissed');
    if (dismissed) {
      setHasBeenDismissed(true);
    }
  }, []);

  // Handle modal dismiss
  const handleDismiss = () => {
    setHasBeenDismissed(true);
    localStorage.setItem('darkModeAnnouncementDismissed', 'true');
    onOpenChange(false);
  };

  // Don't show if already dismissed
  const shouldShow = open && !hasBeenDismissed;

  return (
    <AnimatePresence>
      {shouldShow && (
        <Modal
          open={shouldShow}
          onOpenChange={onOpenChange}
          size="lg"
          blur="lg"
          className="glassmorphism-modal"
          overlayClassName="bg-black/80 backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="relative overflow-hidden"
          >
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-surface/90 via-surface/80 to-elevated/90 backdrop-blur-2xl" />

            {/* Animated Border Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-60 animate-pulse" />

            {/* Mystical Particles Background */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-primary/30 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    scale: [0, 1, 0],
                    x: [0, (Math.random() - 0.5) * 100],
                    y: [0, (Math.random() - 0.5) * 100],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Custom Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute right-4 top-4 z-20 rounded-xl p-2 text-text-tertiary hover:text-text-primary hover:bg-elevated/50 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Close announcement"
              >
                <X className="w-5 h-5" />
              </button>

              <ModalHeader className="text-center pb-6">
                {/* Icon Animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="mx-auto mb-4 relative"
                >
                  <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-radial from-primary/30 to-transparent blur-2xl scale-150" />

                    {/* Icon Container */}
                    <div className="relative bg-gradient-to-br from-primary to-primary-hover p-4 rounded-2xl shadow-2xl">
                      <Moon className="w-8 h-8 text-text-primary" />
                    </div>

                    {/* Rotating Ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-2xl border-2 border-primary/20"
                    />
                  </div>
                </motion.div>

                <ModalTitle className="text-3xl font-bold mb-3 bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
                  V1TA Dark Mode
                </ModalTitle>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-lg text-text-secondary font-medium"
                >
                  Coming Soon to Your Privacy Sanctuary
                </motion.p>
              </ModalHeader>

              <ModalBody className="space-y-6">
                {/* Main Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-center space-y-3"
                >
                  <p className="text-text-secondary leading-relaxed">
                    Experience <span className="text-primary font-semibold">true privacy</span> in its darkest form.
                    We're integrating confidentiality features that will make your financial positions
                    completely private.
                  </p>
                </motion.div>

                {/* Feature Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
                >
                  {[
                    {
                      icon: Shield,
                      title: "Private Positions",
                      description: "Your collateral and debt amounts hidden from public view",
                      delay: 0.6
                    },
                    {
                      icon: Lock,
                      title: "Confidential Transfers",
                      description: "Private VUSD transactions with zero-knowledge proofs",
                      delay: 0.7
                    },
                    {
                      icon: EyeOff,
                      title: "Liquidation Privacy",
                      description: "Protection from front-running and competitive attacks",
                      delay: 0.8
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: feature.delay, duration: 0.4 }}
                      className="group relative p-4 rounded-xl bg-elevated/30 border border-border/30 hover:bg-elevated/50 hover:border-primary/30 transition-all duration-300"
                    >
                      {/* Feature Icon */}
                      <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors duration-300">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>

                      {/* Feature Content */}
                      <h3 className="font-semibold text-text-primary text-sm mb-1 text-center">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-text-tertiary text-center leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Timeline Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        Integration in Progress
                      </p>
                      <p className="text-xs text-text-tertiary">
                        Powered by Umbra, Magicblock, and Arcium • Phased rollout starting January 2026
                      </p>
                    </div>
                  </div>
                </motion.div>
              </ModalBody>

              <ModalFooter className="pt-6 border-t border-border/20">
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.4 }}
                  onClick={handleDismiss}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-text-primary font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  Got It, Stay Tuned!
                </motion.button>
              </ModalFooter>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-2 right-2 w-20 h-20 bg-gradient-radial from-primary/10 to-transparent blur-2xl" />
            <div className="absolute bottom-4 left-4 w-32 h-32 bg-gradient-radial from-primary/5 to-transparent blur-3xl" />
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}