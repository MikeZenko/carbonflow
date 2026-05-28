import React, { useEffect, useRef } from 'react';
import { EARTH } from './earthTexture';

/* ----------------------------------------------------------------------
 * ASCII globe — a spinning, fully-lit Earth rendered as monospace text.
 *
 * Original implementation. The look is modeled on terminal ASCII-globe
 * renderers (DinoZ1729/Earth and its Rust port adamsky/globe), but shares
 * NO code or texture data with them — both are GPL-3.0. What's borrowed is
 * only the *technique*, which is standard computer graphics:
 *
 *   1. Orthographic projection of a unit sphere (each output char is a
 *      surface sample; points outside the disc are blank).
 *   2. Y-axis rotation per frame; the surface point is un-rotated to look
 *      up our own equirectangular land mask (see earthTexture.js).
 *   3. Full-globe lighting: luminance = clamp(k·(N·L) + ambient). The
 *      ambient floor keeps the whole disc visible — bright day side
 *      fading to a dim night limb — instead of only drawing the lit cap.
 *   4. Luminance × a per-texel base (land brighter than water) indexes a
 *      single character ramp.
 *
 * Live producer/consumer coordinates are overlaid as marker glyphs on the
 * near face — a CarbonFlow addition, not part of the reference look.
 * -------------------------------------------------------------------- */

const W = EARTH[0].length; // 144
const H = EARTH.length;    // 72
const TEX = EARTH.map((r) => r.padEnd(W, ' ').slice(0, W));

// Single shading ramp, dark -> bright. The first glyph is a faint '.'
// (NOT a space) so every cell inside the disc renders — that keeps the
// silhouette a complete, symmetric circle instead of letting the dark
// limb dissolve into the background.
const RAMP = '.,:;-=+ox*#@';

// Output grid (characters).
const COLS = 80;
const ROWS = 40;
const CX = COLS / 2;
const CY = ROWS / 2;
const RY = ROWS / 2;
const DEFAULT_CHAR_WH = 0.6; // JetBrains Mono advance width ≈ 0.6em

// Light direction (upper-left, mostly toward the viewer so most of the
// disc is lit and the terminator stays near the limb), normalized.
const Lv = [-0.45, 0.4, 0.82];
const Ln = Math.hypot(...Lv);
const L = Lv.map((v) => v / Ln);

const LIGHT_K = 0.8;    // terminator softness
const AMBIENT = 0.5;    // night-side floor (keeps full disc visible)
const WATER_BASE = 0.5; // ocean dimmer than land
const LAND_BASE = 1.0;

// Drag feel. Pixels of cursor travel per radian of rotation.
const DRAG_SPIN = 60;   // horizontal -> spin around polar axis
const DRAG_TILT = 90;   // vertical   -> tilt the poles toward/away
const MAX_TILT = 1.45;  // ~83°: lets you nearly reach a pole without flipping

// Measure glyph width / line height for the element's actual rendered font,
// so the sphere reads as a true circle regardless of which mono font loads.
function measureCharAspect(el) {
  try {
    const cs = getComputedStyle(el);
    const probe = document.createElement('span');
    probe.style.font = cs.font || `${cs.fontSize} ${cs.fontFamily}`;
    probe.style.lineHeight = cs.lineHeight;
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.whiteSpace = 'pre';
    probe.textContent = '0'.repeat(100);
    document.body.appendChild(probe);
    const charW = probe.getBoundingClientRect().width / 100;
    document.body.removeChild(probe);
    const fontSize = parseFloat(cs.fontSize) || 11;
    const lh = cs.lineHeight === 'normal' ? fontSize * 1.2 : parseFloat(cs.lineHeight) || fontSize;
    const aspect = charW / lh;
    return aspect > 0.2 && aspect < 1.2 ? aspect : DEFAULT_CHAR_WH;
  } catch {
    return DEFAULT_CHAR_WH;
  }
}

function Globe({ markers = [] }) {
  const preRef = useRef(null);
  const angleRef = useRef(0);    // committed spin (around polar axis)
  const tiltRef = useRef(0.12);  // committed tilt (slight 3/4 view by default)
  const markersRef = useRef(markers);
  const drag = useRef({ active: false, startX: 0, startY: 0, dx: 0, dy: 0 });

  useEffect(() => { markersRef.current = markers; }, [markers]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf;
    let last = 0;
    const FRAME = 1000 / 24;

    let RX = RY / DEFAULT_CHAR_WH;
    const recompute = () => { if (preRef.current) RX = RY / measureCharAspect(preRef.current); };
    recompute();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(recompute);

    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      if (t - last < FRAME) return;
      last = t;

      if (!drag.current.active && !reduce) angleRef.current += 0.018;
      const phi = angleRef.current + drag.current.dx / DRAG_SPIN;
      let theta = tiltRef.current + drag.current.dy / DRAG_TILT;
      theta = Math.max(-MAX_TILT, Math.min(MAX_TILT, theta));
      const sp = Math.sin(phi);
      const cp = Math.cos(phi);
      const st = Math.sin(theta);
      const ct = Math.cos(theta);

      // Markers -> screen space. Forward orientation: Rx(theta)·Ry(phi)·model.
      const ms = markersRef.current.map((m) => {
        const [lat, lon] = m.location;
        const la = (lat * Math.PI) / 180;
        const lo = (lon * Math.PI) / 180;
        const cyl = Math.cos(la);
        const mx = cyl * Math.sin(lo);
        const my = Math.sin(la);
        const mz = cyl * Math.cos(lo);
        // Ry(phi)
        const x1 = mx * cp + mz * sp;
        const z1 = -mx * sp + mz * cp;
        // Rx(theta)
        return { x: x1, y: my * ct - z1 * st, z: my * st + z1 * ct };
      });

      let out = '';
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const sx = (c + 0.5 - CX) / RX;
          const sy = (CY - (r + 0.5)) / RY;
          const r2 = sx * sx + sy * sy;
          if (r2 > 1) { out += ' '; continue; }
          const sz = Math.sqrt(1 - r2);

          // Marker hit test (near face only).
          let marked = false;
          for (let i = 0; i < ms.length; i++) {
            const mk = ms[i];
            if (mk.z <= 0) continue;
            const dx = sx - mk.x;
            const dy = sy - mk.y;
            if (dx * dx + dy * dy < 0.0009) { marked = true; break; }
          }
          if (marked) { out += 'O'; continue; }

          // Lighting: full globe, ambient floor.
          const ndotl = sx * L[0] + sy * L[1] + sz * L[2];
          const lum = Math.max(0, Math.min(1, LIGHT_K * ndotl + AMBIENT));

          // Un-rotate surface point -> bitmap lookup.
          // Inverse orientation: model = Ry(-phi)·Rx(-theta)·screen.
          const y1 = sy * ct + sz * st;
          const z1 = -sy * st + sz * ct;
          const bx = sx * cp - z1 * sp;
          const bz = sx * sp + z1 * cp;
          const by = y1 < -1 ? -1 : y1 > 1 ? 1 : y1;
          const lat = Math.asin(by);
          const lon = Math.atan2(bx, bz);
          const u = ((Math.floor((lon / (2 * Math.PI) + 0.5) * W) % W) + W) % W;
          const v = Math.min(H - 1, Math.max(0, Math.floor((0.5 - lat / Math.PI) * H)));
          const land = TEX[v][u] === '#';

          const b = lum * (land ? LAND_BASE : WATER_BASE);
          out += RAMP[Math.min(RAMP.length - 1, Math.floor(b * RAMP.length))];
        }
        if (r < ROWS - 1) out += '\n';
      }

      if (preRef.current) preRef.current.textContent = out;
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const down = (e) => {
    const d = drag.current;
    d.active = true;
    d.startX = e.clientX;
    d.startY = e.clientY;
    if (e.currentTarget.setPointerCapture) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    }
    if (preRef.current) preRef.current.style.cursor = 'grabbing';
  };
  const move = (e) => {
    const d = drag.current;
    if (!d.active) return;
    d.dx = e.clientX - d.startX;
    d.dy = e.clientY - d.startY;
  };
  const up = () => {
    const d = drag.current;
    if (!d.active) return;
    // Commit drag into the persistent orientation.
    angleRef.current += d.dx / DRAG_SPIN;
    tiltRef.current = Math.max(-MAX_TILT, Math.min(MAX_TILT, tiltRef.current + d.dy / DRAG_TILT));
    d.dx = 0;
    d.dy = 0;
    d.active = false;
    if (preRef.current) preRef.current.style.cursor = 'grab';
  };

  return (
    <pre
      ref={preRef}
      className="ascii-globe"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      aria-hidden="true"
    />
  );
}

export default Globe;
