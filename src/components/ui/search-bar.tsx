'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Sparkles, Loader2, ExternalLink, ArrowRight, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils/cn';

interface SearchResult {
  answer: string;
  suggestedPages: Array<{ label: string; href: string }>;
  model: string;
}

export function SearchBar() {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = async () => {
    if (!value.trim()) return;

    setIsLoading(true);
    setError(null);
    setIsOpen(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: value }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to fetch results');
      }

      const data: SearchResult = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to get AI response. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleNavigate = (href: string) => {
    if (href.startsWith('http')) {
      window.open(href, '_blank');
    } else {
      router.push(href);
      setIsOpen(false);
      setValue('');
      setResult(null);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setResult(null);
    setError(null);
  };

  return (
    <>
      {/* Search Input */}
      <div
        className={cn(
          'relative flex items-center gap-2 px-4 h-10 bg-surface border border-border rounded-[12px] transition-all',
          isFocused && 'border-primary/50 ring-1 ring-primary/20'
        )}
      >
        <Search className="w-4 h-4 text-text-tertiary shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Ask V1ta AI anything..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
        />
        <div className="flex items-center gap-1 shrink-0">
          {value && !isLoading && (
            <button
              onClick={() => {
                setValue('');
                setResult(null);
              }}
              className="p-1 hover:bg-elevated rounded-[8px] transition-colors"
            >
              <X className="w-3.5 h-3.5 text-text-tertiary" />
            </button>
          )}
          {isLoading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
          <button
            onClick={handleSearch}
            disabled={!value.trim() || isLoading}
            className={cn(
              'p-1 rounded-[8px] transition-colors',
              value.trim() && !isLoading
                ? 'hover:bg-primary/20 text-primary'
                : 'text-text-tertiary cursor-not-allowed'
            )}
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
        {/* Keyboard hint */}
        <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-elevated rounded-[6px] text-xs text-text-tertiary shrink-0">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>

      {/* AI Results Modal */}
      <AnimatePresence>
        {isOpen && (result || error) && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={handleClose}
            />

            {/* Results Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl max-h-[75vh] bg-surface border border-border rounded-[16px] shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-[8px]">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">V1ta AI Assistant</h3>
                    {result && (
                      <p className="text-xs text-text-tertiary">Powered by {result.model}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-elevated rounded-[8px] transition-colors"
                >
                  <X className="w-5 h-5 text-text-tertiary" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(75vh-80px)] p-6 space-y-6">
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-[12px]">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {result && (
                  <>
                    {/* AI Answer with Markdown */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                        Answer
                      </h4>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.answer}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Suggested Pages */}
                    {result.suggestedPages.length > 0 && (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="h-px flex-1 bg-border/50" />
                          <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                            Relevant Pages
                          </h4>
                          <div className="h-px flex-1 bg-border/50" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {result.suggestedPages.map((page, index) => (
                            <motion.button
                              key={page.href}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleNavigate(page.href)}
                              className="group flex items-center justify-between px-4 py-3.5 bg-elevated/50 hover:bg-elevated border border-border/50 hover:border-primary/50 rounded-[12px] transition-all hover:shadow-lg hover:shadow-primary/10"
                            >
                              <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                                {page.label}
                              </span>
                              {page.href.startsWith('http') ? (
                                <ExternalLink className="w-4 h-4 text-text-tertiary group-hover:text-primary transition-colors" />
                              ) : (
                                <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-border bg-elevated/30">
                <p className="text-xs text-text-tertiary text-center">
                  AI-powered search for V1ta Protocol • Press{' '}
                  <kbd className="px-1.5 py-0.5 bg-surface rounded text-text-primary">Esc</kbd> to
                  close
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
