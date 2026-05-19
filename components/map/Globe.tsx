"use client";

import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

export type GlobeMarker = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  size: number;
};

export function Globe({
  markers,
  size = 600,
  onMarkerClick,
}: {
  markers: GlobeMarker[];
  size?: number;
  onMarkerClick?: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{
    x: number;
    phi: number;
  } | null>(null);
  const phi = useRef(0);
  const phiTarget = useRef(0);
  const phiVelocity = useRef(0.004);
  const [_, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    let width = canvasRef.current.offsetWidth;
    const onResize = () => {
      if (canvasRef.current) width = canvasRef.current.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();

    // Re-measure once the next animation frame paints — guards against
    // initial offsetWidth being 0 before layout has settled.
    const raf = requestAnimationFrame(onResize);

    // Also watch the canvas itself (font loads, container resizes, etc.).
    const ro = new ResizeObserver(onResize);
    ro.observe(canvasRef.current);

    // cobe v2 ships incomplete types — onRender is real but not declared.
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.28,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 16000,
      mapBrightness: 5.5,
      baseColor: [0.9, 0.88, 0.83],
      markerColor: [0.48, 0.71, 0.56],
      glowColor: [0.65, 0.85, 0.72],
      markers: markers.map((m) => ({
        location: [m.lat, m.lng],
        size: m.size,
      })),
      onRender: (state: {
        phi: number;
        width: number;
        height: number;
      }) => {
        if (!pointerInteracting.current) {
          phi.current += phiVelocity.current;
        }
        phiTarget.current += (phi.current - phiTarget.current) * 0.1;
        state.phi = phiTarget.current;
        state.width = width * 2;
        state.height = width * 2;
      },
    } as Parameters<typeof createGlobe>[1]);

    setReady(true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      globe.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-build markers if they change (rare)
  useEffect(() => {
    // cobe doesn't expose a way to update markers in place — we rebuild
    // by remounting via the effect above. For our use the markers are static.
  }, [markers]);

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    pointerInteracting.current = {
      x: e.clientX - phi.current * 100,
      phi: phi.current,
    };
    e.currentTarget.style.cursor = "grabbing";
  }
  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    pointerInteracting.current = null;
    e.currentTarget.style.cursor = "grab";
  }
  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!pointerInteracting.current) return;
    const delta = e.clientX - pointerInteracting.current.x;
    phi.current = delta / 200;
  }

  return (
    <div
      className="relative mx-auto"
      style={{ width: "100%", maxWidth: size, aspectRatio: "1" }}
    >
      {/* Soft glow halo behind the globe */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[-10%] -z-10 rounded-full opacity-60 blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 50% 55%, rgba(122,181,143,0.16), transparent 60%)",
        }}
      />
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
        onPointerMove={handlePointerMove}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          aspectRatio: "1",
          contain: "layout paint size",
        }}
      />
    </div>
  );
}
