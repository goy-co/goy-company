'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import createGlobe from 'cobe';

interface CdnMarker {
  id: string;
  location: [number, number];
  region: string;
}

interface CdnArc {
  id: string;
  from: [number, number];
  to: [number, number];
}

interface GlobeCdnProps {
  markers?: CdnMarker[];
  arcs?: CdnArc[];
  className?: string;
  speed?: number;
}

const defaultMarkers: CdnMarker[] = [
  { id: 'relay-zurich', location: [47.3769, 8.5417], region: 'ZURICH' },
  { id: 'relay-london', location: [51.5074, -0.1278], region: 'LONDON' },
  { id: 'relay-nyc', location: [40.7128, -74.006], region: 'NEW YORK' },
  { id: 'relay-tokyo', location: [35.6762, 139.6503], region: 'TOKYO' },
  { id: 'relay-dubai', location: [25.2048, 55.2708], region: 'DUBAI' },
  { id: 'relay-saopaulo', location: [-23.5505, -46.6333], region: 'SAO PAULO' },
  { id: 'relay-madrid', location: [40.4168, -3.7038], region: 'MADRID' },
  { id: 'relay-sfo', location: [37.7749, -122.4194], region: 'SAN FRANCISCO' },
  { id: 'relay-singapore', location: [1.3521, 103.8198], region: 'SINGAPORE' },
  { id: 'relay-sydney', location: [-33.8688, 151.2093], region: 'SYDNEY' },
];

const defaultArcs: CdnArc[] = [
  { id: 'arc-1', from: [47.3769, 8.5417], to: [51.5074, -0.1278] },
  { id: 'arc-2', from: [51.5074, -0.1278], to: [40.7128, -74.006] },
  { id: 'arc-3', from: [40.7128, -74.006], to: [37.7749, -122.4194] },
  { id: 'arc-4', from: [37.7749, -122.4194], to: [35.6762, 139.6503] },
  { id: 'arc-5', from: [-23.5505, -46.6333], to: [40.7128, -74.006] },
  { id: 'arc-6', from: [-23.5505, -46.6333], to: [25.2048, 55.2708] },
  { id: 'arc-7', from: [25.2048, 55.2708], to: [1.3521, 103.8198] },
  { id: 'arc-8', from: [1.3521, 103.8198], to: [-33.8688, 151.2093] },
  { id: 'arc-9', from: [35.6762, 139.6503], to: [-33.8688, 151.2093] },
  { id: 'arc-10', from: [40.4168, -3.7038], to: [47.3769, 8.5417] },
  { id: 'arc-11', from: [25.2048, 55.2708], to: [40.4168, -3.7038] },
];

export function GlobeCdn({
  markers = defaultMarkers,
  arcs = defaultArcs,
  className = '',
  speed = 0.003,
}: GlobeCdnProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);
  const [traffic, setTraffic] = useState(() =>
    defaultArcs.map(() => Math.floor(Math.random() * 500) + 400),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTraffic((data) =>
        data.map((t) => Math.max(100, t + Math.floor(Math.random() * 41) - 20)),
      );
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationId: number;
    let phi = 0;

    function init() {
      const width = canvas.offsetWidth;
      if (width === 0 || globe) return;

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: 0,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 10,
        baseColor: [1, 1, 1],
        markerColor: [0, 0, 0],
        glowColor: [0.94, 0.93, 0.91],
        markerElevation: 0.02,
        markers: markers.map((m) => ({ location: m.location, size: 0.012, id: m.id })),
        arcs: arcs.map((a) => ({ from: a.from, to: a.to, id: a.id })),
        arcColor: [0, 0, 0],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.7,
      });
      function animate() {
        if (!isPausedRef.current) phi += speed;
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        });
        animationId = requestAnimationFrame(animate);
      }
      animate();
      setTimeout(() => canvas && (canvas.style.opacity = '1'));
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0] && entries[0].contentRect.width > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [markers, arcs, speed]);

  const pyramidFaceStyle = (nth: number): React.CSSProperties => {
    const transforms = [
      'rotateY(0deg) translateZ(4px) rotateX(19.5deg)',
      'rotateY(120deg) translateZ(4px) rotateX(19.5deg)',
      'rotateY(240deg) translateZ(4px) rotateX(19.5deg)',
      'rotateX(-90deg) rotateZ(60deg) translateY(4px)',
    ];
    const colors = ['#111', '#333', '#555', '#222'];
    return {
      position: 'absolute',
      left: -0.5,
      top: 0,
      width: 0,
      height: 0,
      borderLeft: '6.5px solid transparent',
      borderRight: '6.5px solid transparent',
      borderBottom: `13px solid ${colors[nth]}`,
      transformOrigin: 'center bottom',
      transform: transforms[nth],
    };
  };

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <style>{`
        @keyframes pyramid-spin {
          0% { transform: rotateX(20deg) rotateY(0deg); }
          100% { transform: rotateX(20deg) rotateY(360deg); }
        }
      `}</style>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'grab',
          opacity: 0,
          transition: 'opacity 1.2s ease',
          borderRadius: '50%',
          touchAction: 'none',
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: 'absolute',
            // @ts-ignore CSS Anchor Positioning
            positionAnchor: `--cobe-${m.id}`,
            bottom: 'anchor(top)',
            left: 'anchor(center)',
            translate: '-50% 0',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            gap: 6,
            pointerEvents: 'none' as const,
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: 'opacity 0.3s, filter 0.3s',
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              position: 'relative',
              transformStyle: 'preserve-3d' as const,
              animation: 'pyramid-spin 4s linear infinite',
            }}
          >
            {[0, 1, 2, 3].map((n) => (
              <div key={n} style={pyramidFaceStyle(n)} />
            ))}
          </div>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '0.55rem',
              color: '#000',
              background: '#fff',
              padding: '2px 6px',
              borderRadius: 3,
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap' as const,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            {m.region}
          </span>
        </div>
      ))}
      {traffic.map((val, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            // @ts-ignore CSS Anchor Positioning
            positionAnchor: `--cobe-arc-${i}`,
            bottom: 'anchor(top)',
            left: 'anchor(center)',
            translate: '-50% 0',
            fontFamily: 'monospace',
            fontSize: '0.5rem',
            color: '#fff',
            background: '#000',
            padding: '3px 8px',
            borderRadius: 4,
            whiteSpace: 'nowrap' as const,
            pointerEvents: 'none' as const,
            opacity: `var(--cobe-visible-arc-${i}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-arc-${i}, 0)) * 8px))`,
            transition: 'opacity 0.3s, filter 0.3s',
          }}
        >
          {val}k req/s
        </div>
      ))}
    </div>
  );
}
