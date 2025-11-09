'use client';

import { useEffect, useRef } from 'react';

// Pre-calculate constants
const r180 = Math.PI;
const r90 = Math.PI / 2;
const r15 = Math.PI / 12;
const color = '#88888825';

// Destructure Math functions for faster access
const { random, cos, sin } = Math;

interface Counter {
  value: number;
}

export function MysticalBranches() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepsRef = useRef<Array<() => void>>([]);
  const prevStepsRef = useRef<Array<() => void>>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const MIN_BRANCH = 30;
  const len = 6;

  function initCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true // Better performance
    });
    if (!ctx) return null;

    const dpr = window.devicePixelRatio || 1;
    const dpi = dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = dpi * width;
    canvas.height = dpi * height;
    ctx.scale(dpi, dpi);

    return { ctx, dpi };
  }

  // Inline polar to cartesian for better performance
  const polar2cart = (x: number, y: number, r: number, theta: number): [number, number] => {
    return [x + r * cos(theta), y + r * sin(theta)];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const result = initCanvas(canvas, width, height);
    if (!result) return;

    const { ctx } = result;

    // Pre-calculate bounds for faster checks
    let minX = -100;
    let maxX = width + 100;
    let minY = -100;
    let maxY = height + 100;

    const step = (x: number, y: number, rad: number, counter: Counter = { value: 0 }) => {
      const length = random() * len;
      counter.value += 1;

      const [nx, ny] = polar2cart(x, y, length, rad);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      // Pre-calculate angle variations
      const angleVar = random() * r15;
      const rad1 = rad + angleVar;
      const rad2 = rad - angleVar;

      // Optimized bounds check - early return
      if (nx < minX || nx > maxX || ny < minY || ny > maxY)
        return;

      // Use ternary for rate calculation (faster than if/else)
      const rate = counter.value <= MIN_BRANCH ? 0.8 : 0.5;
      const rand1 = random();
      const rand2 = random();

      // Left branch
      if (rand1 < rate)
        stepsRef.current.push(() => step(nx, ny, rad1, counter));

      // Right branch
      if (rand2 < rate)
        stepsRef.current.push(() => step(nx, ny, rad2, counter));
    };

    // Cache random calculation
    const randomMiddle = () => random() * 0.6 + 0.2;

    const start = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = color;

      // Reset refs
      prevStepsRef.current = [];
      stepsRef.current = [
        () => step(randomMiddle() * width, -5, r90),
        () => step(randomMiddle() * width, height + 5, -r90),
        () => step(-5, randomMiddle() * height, 0),
        () => step(width + 5, randomMiddle() * height, r180),
      ];

      if (width < 500) {
        stepsRef.current = stepsRef.current.slice(0, 2);
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      // Update bounds
      minX = -100;
      maxX = width + 100;
      minY = -100;
      maxY = height + 100;

      const result = initCanvas(canvas, width, height);
      if (result) {
        start();
      }
    };

    start();
    window.addEventListener('resize', resize, { passive: true });

    const interval = 1000 / 40; // 40fps
    const MAX_STEPS_PER_FRAME = 300; // Prevent excessive computation

    const frame = () => {
      const now = performance.now();

      if (now - lastTimeRef.current >= interval) {
        prevStepsRef.current = stepsRef.current;
        stepsRef.current = [];
        lastTimeRef.current = now;

        const stepCount = prevStepsRef.current.length;

        if (stepCount === 0) {
          animationRef.current = requestAnimationFrame(frame);
          return;
        }

        // Limit steps per frame to prevent lag
        const limit = Math.min(stepCount, MAX_STEPS_PER_FRAME);

        // Execute steps with probability for organic look
        for (let i = 0; i < limit; i++) {
          const stepFn = prevStepsRef.current[i];
          if (random() < 0.5) {
            stepsRef.current.push(stepFn);
          } else {
            stepFn();
          }
        }
      }

      animationRef.current = requestAnimationFrame(frame);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const mask = 'radial-gradient(circle, black, transparent)';

  return (
    <div
      className="fixed top-0 bottom-0 left-0 right-0 pointer-events-none print:hidden"
      style={{
        zIndex: 1,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
}
