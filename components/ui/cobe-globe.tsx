"use client";

import { useCallback, useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "@/lib/utils";

interface Marker {
  id: string;
  location: [number, number];
  label: string;
}

interface Arc {
  id: string;
  from: [number, number];
  to: [number, number];
  label?: string;
}

interface GlobeProps {
  markers?: Marker[];
  arcs?: Arc[];
  className?: string;
  markerColor?: [number, number, number];
  baseColor?: [number, number, number];
  arcColor?: [number, number, number];
  glowColor?: [number, number, number];
  dark?: number;
  mapBrightness?: number;
  markerSize?: number;
  markerElevation?: number;
  arcWidth?: number;
  arcHeight?: number;
  speed?: number;
  theta?: number;
  diffuse?: number;
  mapSamples?: number;
}

export function Globe({
  markers = [],
  arcs = [],
  className,
  markerColor = [0.29, 0.47, 0.92],
  baseColor = [0.97, 0.98, 1],
  arcColor = [0.94, 0.72, 0.32],
  glowColor = [0.98, 0.96, 0.9],
  dark = 0,
  mapBrightness = 7,
  markerSize = 0.06,
  markerElevation = 0.12,
  arcWidth = 0.9,
  arcHeight = 0.18,
  speed = 0.0032,
  theta = 0.18,
  diffuse = 1.4,
  mapSamples = 12000
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const lastPointer = useRef<{ x: number; y: number; t: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const velocity = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);

  const getConfig = useCallback(
    (size: number, devicePixelRatio: number) => ({
      devicePixelRatio,
      width: size * devicePixelRatio,
      height: size * devicePixelRatio,
      phi: 0,
      theta,
      dark,
      diffuse,
      mapSamples,
      mapBrightness,
      baseColor,
      markerColor,
      glowColor,
      markerElevation,
      markers: markers.map((marker) => ({
        location: marker.location,
        size: markerSize,
        id: marker.id
      })),
      arcs: arcs.map((arc) => ({
        from: arc.from,
        to: arc.to,
        id: arc.id
      })),
      arcColor,
      arcWidth,
      arcHeight,
      opacity: 1
    }),
    [
      arcColor,
      arcHeight,
      arcWidth,
      arcs,
      baseColor,
      dark,
      diffuse,
      glowColor,
      mapBrightness,
      mapSamples,
      markerColor,
      markerElevation,
      markerSize,
      markers,
      theta
    ]
  );

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    pointerInteracting.current = { x: event.clientX, y: event.clientY };
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "grabbing";
    }
    isPausedRef.current = true;
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (pointerInteracting.current === null) {
      return;
    }

    const deltaX = event.clientX - pointerInteracting.current.x;
    const deltaY = event.clientY - pointerInteracting.current.y;
    dragOffset.current = { phi: deltaX / 280, theta: deltaY / 920 };

    const now = Date.now();
    if (lastPointer.current) {
      const dt = Math.max(now - lastPointer.current.t, 1);
      velocity.current = {
        phi: Math.max(-0.09, Math.min(0.09, ((event.clientX - lastPointer.current.x) / dt) * 0.18)),
        theta: Math.max(
          -0.05,
          Math.min(0.05, ((event.clientY - lastPointer.current.y) / dt) * 0.04)
        )
      };
    }

    lastPointer.current = { x: event.clientX, y: event.clientY, t: now };
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
      lastPointer.current = null;
    }

    pointerInteracting.current = null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "grab";
    }
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    let animationFrame = 0;
    let resizeObserver: ResizeObserver | null = null;
    let phi = 0;

    const initializeGlobe = () => {
      const size = canvas.offsetWidth;
      if (!size) {
        return;
      }

      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      if (!globeRef.current) {
        globeRef.current = createGlobe(canvas, getConfig(size, devicePixelRatio));
        canvas.style.opacity = "1";
        return;
      }

      globeRef.current.update(getConfig(size, devicePixelRatio));
    };

    initializeGlobe();

    resizeObserver = new ResizeObserver(() => {
      initializeGlobe();
    });
    resizeObserver.observe(canvas);

    const animate = () => {
      if (!globeRef.current || !canvas.offsetWidth) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      if (!isPausedRef.current) {
        phi += speed;

        if (Math.abs(velocity.current.phi) > 0.0001 || Math.abs(velocity.current.theta) > 0.0001) {
          phiOffsetRef.current += velocity.current.phi;
          thetaOffsetRef.current += velocity.current.theta;
          velocity.current.phi *= 0.95;
          velocity.current.theta *= 0.93;
        }

        thetaOffsetRef.current = Math.max(-0.38, Math.min(0.38, thetaOffsetRef.current));
      }

      const size = canvas.offsetWidth;
      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      globeRef.current.update({
        ...getConfig(size, devicePixelRatio),
        phi: phi + phiOffsetRef.current + dragOffset.current.phi,
        theta: theta + thetaOffsetRef.current + dragOffset.current.theta
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      globeRef.current?.destroy();
      globeRef.current = null;
    };
  }, [getConfig, speed, theta]);

  return (
    <div className={cn("relative aspect-square select-none", className)}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 900ms ease",
          borderRadius: "9999px",
          touchAction: "none"
        }}
      />
    </div>
  );
}
