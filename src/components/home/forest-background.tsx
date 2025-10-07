'use client';

import { useEffect, useRef } from 'react';

interface Tree {
  x: number;
  y: number;
  height: number;
  width: number;
  sway: number;
  swaySpeed: number;
  opacity: number;
}

export function ForestBackground() {
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

    const trees: Tree[] = [];
    const numTrees = 80;

    for (let i = 0; i < numTrees; i++) {
      const depth = Math.random();
      trees.push({
        x: Math.random() * canvas.width,
        y: canvas.height - Math.random() * canvas.height * 0.3,
        height: 40 + depth * 200,
        width: 8 + depth * 25,
        sway: 0,
        swaySpeed: 0.001 + Math.random() * 0.002,
        opacity: 0.1 + depth * 0.3,
      });
    }

    trees.sort((a, b) => a.height - b.height);

    let time = 0;

    const drawTree = (tree: Tree) => {
      ctx.save();
      ctx.translate(tree.x, tree.y);

      const swayAmount = Math.sin(time * tree.swaySpeed + tree.x) * 2;
      ctx.rotate(swayAmount * 0.01);

      const gradient = ctx.createLinearGradient(0, 0, 0, tree.height);
      gradient.addColorStop(0, `rgba(69, 179, 74, ${tree.opacity * 0.8})`);
      gradient.addColorStop(1, `rgba(52, 134, 56, ${tree.opacity})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-tree.width / 2, -tree.height, tree.width, tree.height);

      const foliageSize = tree.width * 3;
      const foliageGradient = ctx.createRadialGradient(
        0, -tree.height, 0,
        0, -tree.height, foliageSize
      );
      foliageGradient.addColorStop(0, `rgba(105, 179, 74, ${tree.opacity})`);
      foliageGradient.addColorStop(0.5, `rgba(69, 179, 74, ${tree.opacity * 0.7})`);
      foliageGradient.addColorStop(1, `rgba(52, 134, 56, ${tree.opacity * 0.3})`);

      ctx.fillStyle = foliageGradient;
      ctx.beginPath();
      ctx.ellipse(0, -tree.height * 1.1, foliageSize, foliageSize * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(105, 179, 74, ${tree.opacity * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(
        foliageSize * 0.3, -tree.height * 1.05,
        foliageSize * 0.7, foliageSize * 0.8,
        0, 0, Math.PI * 2
      );
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(
        -foliageSize * 0.3, -tree.height * 1.05,
        foliageSize * 0.7, foliageSize * 0.8,
        0, 0, Math.PI * 2
      );
      ctx.fill();

      ctx.restore();
    };

    const drawFireflies = () => {
      const numFireflies = 30;
      for (let i = 0; i < numFireflies; i++) {
        const x = (Math.sin(time * 0.001 + i) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.0015 + i * 2) * 0.5 + 0.5) * canvas.height * 0.7;
        const opacity = (Math.sin(time * 0.005 + i) * 0.5 + 0.5) * 0.6;

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 10);
        glow.addColorStop(0, `rgba(255, 255, 150, ${opacity})`);
        glow.addColorStop(1, `rgba(105, 179, 74, 0)`);
        ctx.fillStyle = glow;
        ctx.fill();
      }
    };

    const animate = () => {
      ctx.fillStyle = '#0C0D10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const fogGradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
      fogGradient.addColorStop(0, 'rgba(105, 179, 74, 0)');
      fogGradient.addColorStop(1, 'rgba(105, 179, 74, 0.1)');
      ctx.fillStyle = fogGradient;
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

      trees.forEach(drawTree);
      drawFireflies();

      time++;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
