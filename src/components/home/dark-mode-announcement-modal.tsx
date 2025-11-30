'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Moon } from 'lucide-react';
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
          blur="md"
          className="glassmorphism-modal"
          overlayClassName="bg-black/60 backdrop-blur-md"
          showClose={false}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="relative overflow-hidden"
          >
            {/* Simple glassmorphism background */}
            <div className="absolute inset-0 bg-surface/95 backdrop-blur-xl" />

            {/* Subtle animated border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-50 animate-pulse" />

            {/* Content */}
            <div className="relative z-10">
              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute right-4 top-4 z-20 rounded-lg p-2 text-text-tertiary hover:text-text-primary hover:bg-elevated/50 transition-all duration-200"
                aria-label="Close announcement"
              >
                <X className="w-4 h-4" />
              </button>

              <ModalHeader className="text-center pb-4">
                {/* Simple icon animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="mx-auto mb-4 relative"
                >
                  <div className="relative bg-gradient-to-br from-primary to-primary-hover p-4 rounded-2xl shadow-lg">
                    <Moon className="w-8 h-8 text-text-primary" />
                  </div>
                </motion.div>

                <ModalTitle className="text-2xl font-bold text-text-primary mb-2">
                  V1TA Dark Mode
                </ModalTitle>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-text-secondary"
                >
                  Privacy features coming soon
                </motion.p>
              </ModalHeader>

              <ModalBody className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-center space-y-3"
                >
                  <p className="text-text-secondary leading-relaxed">
                    We're integrating <span className="text-primary font-semibold">privacy-native features</span> that will make your financial positions completely private.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    {[
                      {
                        icon: Shield,
                        title: "Private Positions",
                        description: "Hidden collateral & debt"
                      },
                      {
                        icon: Moon,
                        title: "Confidential Transfers",
                        description: "Private VUSD transactions"
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                        className="p-3 rounded-lg bg-elevated/30 border border-border/30"
                      >
                        <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-primary/20">
                          <feature.icon className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-medium text-text-primary text-xs text-center mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-text-tertiary text-center">
                          {feature.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </ModalBody>

              <ModalFooter className="pt-4 border-t border-border/20">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  onClick={handleDismiss}
                  className="flex-1 bg-primary hover:bg-primary-hover text-text-primary font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  Got it!
                </motion.button>
              </ModalFooter>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}