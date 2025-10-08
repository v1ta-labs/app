'use client';

import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  generation: number;
}

export function MysticalBranches() {
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

    const nodes: Node[] = [];
    const maxNodes = 40;
    const connections: Array<[Node, Node]> = [];

    const spawnNode = () => {
      const edge = Math.floor(Math.random() * 4);
      let x, y, vx, vy;

      switch (edge) {
        case 0:
          x = Math.random() * canvas.width;
          y = 0;
          vx = (Math.random() - 0.5) * 0.6;
          vy = Math.random() * 0.6 + 0.2;
          break;
        case 1:
          x = canvas.width;
          y = Math.random() * canvas.height;
          vx = -(Math.random() * 0.6 + 0.2);
          vy = (Math.random() - 0.5) * 0.6;
          break;
        case 2:
          x = Math.random() * canvas.width;
          y = canvas.height;
          vx = (Math.random() - 0.5) * 0.6;
          vy = -(Math.random() * 0.6 + 0.2);
          break;
        default:
          x = 0;
          y = Math.random() * canvas.height;
          vx = Math.random() * 0.6 + 0.2;
          vy = (Math.random() - 0.5) * 0.6;
      }

      nodes.push({
        x,
        y,
        vx,
        vy,
        life: 1,
        generation: 0,
      });
    };

    const initialNodes = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < initialNodes; i++) {
      spawnNode();
    }

    let time = 0;

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 24, 36, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      connections.length = 0;

      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];

        node.x += node.vx;
        node.y += node.vy;

        node.vx += (Math.random() - 0.5) * 0.05;
        node.vy += (Math.random() - 0.5) * 0.05;

        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed > 1.2) {
          node.vx = (node.vx / speed) * 1.2;
          node.vy = (node.vy / speed) * 1.2;
        }

        node.life -= 0.001;

        if (
          node.life <= 0 ||
          node.x < -100 || node.x > canvas.width + 100 ||
          node.y < -100 || node.y > canvas.height + 100
        ) {
          nodes.splice(i, 1);
          continue;
        }

        if (Math.random() > 0.99 && nodes.length < maxNodes && node.generation < 2) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.5 + 0.2;
          nodes.push({
            x: node.x,
            y: node.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: node.life * 0.6,
            generation: node.generation + 1,
          });
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 350 && Math.random() > 0.92) {
            connections.push([node, other]);
          }
        }
      }

      connections.forEach(([from, to]) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const opacity = Math.min(from.life, to.life) * (1 - dist / 200) * 0.4;

        ctx.strokeStyle = `rgba(42, 73, 48, ${opacity})`;
        ctx.lineWidth = 0.4;
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      });

      nodes.forEach(node => {
        const opacity = node.life * 0.35;

        ctx.beginPath();
        ctx.arc(node.x, node.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(19, 47, 19, ${opacity})`;
        ctx.shadowBlur = 0;
        ctx.fill();
      });

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
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
