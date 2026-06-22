'use client';

import { useEffect, useRef } from 'react';
import type { HeatmapClick } from '@/types';

interface HeatmapCanvasProps {
  clicks: HeatmapClick[];
  width?: number;
  height?: number;
}

function drawHeatmap(canvas: HTMLCanvasElement, clicks: HeatmapClick[]) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Dark background representing a page
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  // Draw subtle grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  if (clicks.length === 0) return;

  // Build density map: bucket clicks into grid cells
  const CELL = 20;
  const densityMap = new Map<string, number>();
  let maxDensity = 0;

  clicks.forEach((click) => {
    const cx = Math.round(click.nx * w);
    const cy = Math.round(click.ny * h);
    const gx = Math.floor(cx / CELL);
    const gy = Math.floor(cy / CELL);
    const key = `${gx},${gy}`;
    const val = (densityMap.get(key) ?? 0) + 1;
    densityMap.set(key, val);
    if (val > maxDensity) maxDensity = val;
  });

  // Draw heat blobs per click
  clicks.forEach((click) => {
    const cx = click.nx * w;
    const cy = click.ny * h;
    const gx = Math.floor(cx / CELL);
    const gy = Math.floor(cy / CELL);
    const key = `${gx},${gy}`;
    const density = (densityMap.get(key) ?? 1) / maxDensity;

    const radius = 20 + density * 30;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, `rgba(239, 68, 68, ${0.15 + density * 0.35})`);   // red core
    gradient.addColorStop(0.4, `rgba(249, 115, 22, ${0.08 + density * 0.15})`); // orange mid
    gradient.addColorStop(1, 'rgba(0,0,0,0)');                                  // transparent edge

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw crisp dots on top
  clicks.forEach((click) => {
    const cx = click.nx * w;
    const cy = click.ny * h;
    const gx = Math.floor(cx / CELL);
    const gy = Math.floor(cy / CELL);
    const key = `${gx},${gy}`;
    const density = (densityMap.get(key) ?? 1) / maxDensity;

    const dotRadius = 2.5 + density * 2;

    ctx.beginPath();
    ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = density > 0.6
      ? `rgba(255, 255, 255, 0.9)`
      : `rgba(239, 68, 68, ${0.6 + density * 0.4})`;
    ctx.fill();
  });
}

export default function HeatmapCanvas({ clicks, width = 900, height = 560 }: HeatmapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle resize
    const observer = new ResizeObserver(() => {
      if (!canvas.parentElement) return;
      const containerW = canvas.parentElement.clientWidth;
      const scale = containerW / width;
      canvas.style.width = `${containerW}px`;
      canvas.style.height = `${height * scale}px`;
      drawHeatmap(canvas, clicks);
    });

    observer.observe(canvas.parentElement!);
    drawHeatmap(canvas, clicks);

    return () => observer.disconnect();
  }, [clicks, width, height]);

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-xl border border-gray-700 w-full"
        style={{ imageRendering: 'auto' }}
      />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3">
        <p className="text-gray-400 text-xs font-medium mb-2">Heat Intensity</p>
        <div className="flex items-center gap-2">
          <div
            className="w-24 h-3 rounded-full"
            style={{
              background: 'linear-gradient(to right, rgba(239,68,68,0.2), rgba(239,68,68,0.9), rgba(255,255,255,1))',
            }}
          />
          <div className="flex justify-between w-24 absolute left-3 -bottom-1">
            <span className="text-gray-600 text-[10px]">Low</span>
            <span className="text-gray-600 text-[10px]">High</span>
          </div>
        </div>
        <div className="flex justify-between mt-3 text-[10px] text-gray-500">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Dot count badge */}
      <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-1.5">
        <span className="text-white text-sm font-semibold">{clicks.length.toLocaleString()}</span>
        <span className="text-gray-500 text-xs ml-1">clicks</span>
      </div>
    </div>
  );
}
