'use client';

import { useState, useEffect } from 'react';

interface LogotypeProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubheading?: boolean;
  interactive?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-3xl sm:text-4xl',
  lg: 'text-5xl sm:text-6xl lg:text-7xl',
  xl: 'text-6xl sm:text-7xl lg:text-8xl',
};

export const Logotype = ({
  size = 'xl',
  showSubheading = true,
  interactive = true,
  className = '',
}: LogotypeProps) => {
  const [transform, setTransform] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) {
        setTransform({});
        return;
      }

      const { innerWidth: width, innerHeight: height } = window;
      const { clientX: x, clientY: y } = e;

      const xMove = (x / width - 0.5) * -30;
      const yMove = (y / height - 0.5) * -20;

      setTransform({
        transform: `perspective(1000px) rotateX(${-yMove / 2}deg) rotateY(${xMove / 2}deg) translateZ(50px)`,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive]);

  return (
    <div className={`text-center ${className}`}>
      <div
        style={{
          transition: interactive ? 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
          ...transform,
        }}
      >
        <h1
          className={`text-white ${sizeClasses[size]} lowercase select-none`}
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontWeight: 400,
            fontVariantNumeric: 'lining-nums',
            textShadow:
              size === 'sm'
                ? '0 0 8px rgba(42, 73, 48, 0.3)'
                : `
              0 0 15px rgba(42, 73, 48, 0.4),
              0 0 30px rgba(42, 73, 48, 0.2)
            `,
            letterSpacing: size === 'sm' ? '0.15em' : '0.2em',
          }}
        >
          v<span style={{ fontStyle: 'italic' }}>1</span>ta
        </h1>
      </div>
      {showSubheading && (
        <p
          className="text-text-secondary text-sm font-light tracking-[0.4em] uppercase mt-6 animate-fadeInUp opacity-0"
          style={{
            animationDelay: '0.5s',
            animationFillMode: 'forwards',
          }}
        >
          <span className="line-through opacity-50">CeDeFi</span> DeFi
        </p>
      )}
    </div>
  );
};
