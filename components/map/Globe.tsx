"use client";

import { useEffect, useRef } from "react";
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
}: {
  markers: GlobeMarker[];
  size?: number;
  onMarkerClick?: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number } | null>(null);
  const phiRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    let width = canvasRef.current.offsetWidth;
    const onResize = () => {
      if (canvasRef.current) width = canvasRef.current.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(canvasRef.current);

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.28,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 16000,
      mapBrightness: 6.5,
      mapBaseBrightness: 0.08,
      baseColor: [0.92, 0.9, 0.85],
      markerColor: [0.48, 0.71, 0.56],
      glowColor: [0.65, 0.85, 0.72],
      markers: markers.map((m) => ({
        location: [m.lat, m.lng] as [number, number],
        size: m.size,
      })),
    });

    // Manual animation loop (cobe v2 dropped onRender)
    let raf = 0;
    let smoothedPhi = 0;
    const tick = () => {
      if (!pointerInteracting.current) {
        phiRef.current += 0.004;
      }
      smoothedPhi += (phiRef.current - smoothedPhi) * 0.1;
      globe.update({
        phi: smoothedPhi,
        width: width * 2,
        height: width * 2,
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Fade canvas in once the first frame paints
    if (canvasRef.current) {
      canvasRef.current.style.opacity = "0";
      setTimeout(() => {
        if (canvasRef.current) canvasRef.current.style.opacity = "1";
      }, 100);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      globe.destroy();
    };
    // markers + size are intentionally one-shot; remounting is rare and
    // expensive (rebuilds WebGL).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    pointerInteracting.current = {
      x: e.clientX - phiRef.current * 100,
    };
    e.currentTarget.style.cursor = "grabbing";
  }
  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    pointerInteracting.current = null;
    e.currentTarget.style.cursor = "grab";
  }
  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!pointerInteracting.current) return;
    phiRef.current = (e.clientX - pointerInteracting.current.x) / 100;
  }

  return (
    <div
      className="relative mx-auto"
      style={{ width: "100%", maxWidth: size, aspectRatio: "1" }}
    >
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
          opacity: 0,
          transition: "opacity 600ms ease-out",
        }}
      />
    </div>
  );
}
