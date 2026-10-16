"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { BrandLogo } from "./brand-logo";
import { createBrandLogo3DScene } from "./brand-logo-3d-scene";
import type {
  BrandLogo3DProps,
  BrandLogo3DScene,
} from "./brand-logo.types";
import { configuracion } from "@/utils/configuracion";

export function BrandLogo3D({
  className = "",
  inverted = false,
  size = 40,
  speed = 1,
  iconOnly = false,
}: BrandLogo3DProps) {
  const interactionRef = useRef<HTMLSpanElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    const interaction = interactionRef.current;
    if (!mount || !interaction) return;

    let logoScene: BrandLogo3DScene;
    try {
      logoScene = createBrandLogo3DScene(mount, size, inverted);
    } catch (error) {
      console.error("No se pudo iniciar el logo 3D; se mostrará el logo estático.", error);
      const fallbackTimer = window.setTimeout(
        () => setWebglUnavailable(true),
        0,
      );
      return () => window.clearTimeout(fallbackTimer);
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let phase = 0.62;
    let spinPhase = 0;
    let boost = 0;
    let visible = true;
    let animationFrame = 0;
    let lastFrameTime = performance.now();
    let tiltX = 0;
    let tiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;

    const onPointerMove = (event: PointerEvent) => {
      const bounds = mount.getBoundingClientRect();
      targetTiltX = THREE.MathUtils.clamp(
        ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2,
        -1,
        1,
      );
      targetTiltY = THREE.MathUtils.clamp(
        ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2,
        -1,
        1,
      );
    };

    const onPointerEnter = () => {
      isHoveredRef.current = true;
    };

    const onPointerLeave = () => {
      isHoveredRef.current = false;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(mount);

    if (reduceMotion) {
      logoScene.render(phase, spinPhase, 0, 0);
    } else {
      const animate = (now: number) => {
        animationFrame = requestAnimationFrame(animate);
        const delta = Math.min((now - lastFrameTime) / 1000, 0.05);
        lastFrameTime = now;
        if (!visible) return;

        const targetBoost = isHoveredRef.current ? 1 : 0;
        boost += (targetBoost - boost) * Math.min(delta * 4, 1);
        phase += delta * 0.32 * speed;
        spinPhase += delta * 0.9 * speed * (1 + boost * 3.2);
        tiltX += (targetTiltX - tiltX) * 0.06;
        tiltY += (targetTiltY - tiltY) * 0.06;
        logoScene.render(phase, spinPhase, tiltX, tiltY);
      };

      interaction.addEventListener("pointermove", onPointerMove, {
        passive: true,
      });
      interaction.addEventListener("pointerenter", onPointerEnter);
      interaction.addEventListener("pointerleave", onPointerLeave);
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      interaction.removeEventListener("pointermove", onPointerMove);
      interaction.removeEventListener("pointerenter", onPointerEnter);
      interaction.removeEventListener("pointerleave", onPointerLeave);
      logoScene.dispose();
    };
  }, [inverted, size, speed]);

  if (webglUnavailable) {
    return <BrandLogo className={className} inverted={inverted} />;
  }

  return (
    <span
      ref={interactionRef}
      className={`inline-flex items-center gap-2 select-none ${className}`}
    >
      <span
        ref={mountRef}
        aria-hidden="true"
        className="inline-block shrink-0"
        style={{ width: size, height: size }}
      />
      {iconOnly ? (
        <span className="sr-only">{configuracion.nameCompany}</span>
      ) : (
        <span
          className={`font-semibold leading-none tracking-tight ${
            inverted ? "text-white" : "text-black"
          }`}
          style={{ fontSize: size * 0.5 }}
        >
          {configuracion.nameCompany}
        </span>
      )}
    </span>
  );
}
