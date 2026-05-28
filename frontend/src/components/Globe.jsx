import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

/* Dotted WebGL globe (cobe). Tuned to CarbonFlow tokens:
 *   - ink-on-chalk dot color
 *   - moss-tinted markers
 *   - near-invisible glow (just a faint warmth against the cream)
 *   - slow auto-rotation, drag-to-pan, snap-back to spin
 *   - respects prefers-reduced-motion
 */

const PI = Math.PI;

function Globe({ markers = [], size = 480 }) {
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = canvasRef.current.offsetWidth;
    let currentPhi = phiRef.current;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.22,
      dark: 0,
      diffuse: 1.0,
      mapSamples: 16000,
      mapBrightness: 1.35,
      baseColor: [0.18, 0.22, 0.17],     // forest ink
      markerColor: [0.43, 0.51, 0.4],    // moss accent
      glowColor: [0.957, 0.953, 0.933],  // chalk (effectively no glow)
      markers,
      onRender: (state) => {
        if (!pointerInteracting.current && !reduceMotion) {
          currentPhi += 0.0025;
        }
        state.phi = currentPhi + pointerInteractionMovement.current / 200;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    // Fade in once cobe has painted (avoids flash of empty canvas)
    requestAnimationFrame(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = '1';
    });

    return () => {
      phiRef.current = currentPhi;
      globe.destroy();
    };
  }, [markers, size]);

  const onPointerDown = (e) => {
    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
    canvasRef.current.style.cursor = 'grabbing';
  };
  const onPointerUp = () => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  };
  const onPointerMove = (e) => {
    if (pointerInteracting.current !== null) {
      const delta = e.clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: size,
        aspectRatio: '1',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerOut={onPointerUp}
        onPointerMove={onPointerMove}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'grab',
          contain: 'layout paint size',
          opacity: 0,
          transition: 'opacity 400ms ease',
          touchAction: 'pan-y',
        }}
      />
    </div>
  );
}

export default Globe;
