'use client';

import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Card className="max-w-2xl w-full p-12 backdrop-blur-xl bg-surface/70 border-border/50 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <div className="relative inline-block">
                <h1 className="text-9xl font-bold bg-gradient-to-br from-primary via-success to-primary bg-clip-text text-transparent">
                  404
                </h1>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-4 -right-4"
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-text-primary mb-3">Lost in the Void</h2>
              <p className="text-lg text-text-secondary mb-2">
                The page you&apos;re searching for has vanished into the forest.
              </p>
              <p className="text-sm text-text-tertiary mb-8">
                Don&apos;t worry, your funds are safe. Just this page that&apos;s missing.
              </p>

              <div className="flex gap-4 justify-center">
                <Link href="/">
                  <Button className="gap-2 px-6">
                    <Home className="w-4 h-4" />
                    Return Home
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="gap-2 px-6"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
