"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type AyiState = "idle" | "pointing" | "celebrating" | "thinking";

interface AyiMascotProps {
  state?: AyiState;
  className?: string;
}

export function AyiMascot({ state = "idle", className }: AyiMascotProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const headRef = useRef<SVGGElement | null>(null);
  const armRef = useRef<SVGGElement | null>(null);
  const antennaRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(svgRef.current, {
        y: -10,
        duration: 2.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      gsap.to(headRef.current, {
        rotation: 3,
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        transformOrigin: "50% 80%",
      });
      gsap.to(antennaRef.current, {
        scale: 1.25,
        duration: 1.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        transformOrigin: "center",
      });
    }, svgRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!armRef.current) return;
    const tween =
      state === "pointing"
        ? gsap.to(armRef.current, {
            rotation: -10,
            duration: 1.6,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            transformOrigin: "20% 30%",
          })
        : gsap.to(armRef.current, {
            rotation: 0,
            duration: 0.6,
            ease: "power2.out",
          });
    return () => {
      tween.kill();
    };
  }, [state]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 280 320"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ayi, mascotte Ayiland"
      role="img"
    >
      <defs>
        <linearGradient id="ayi-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E5BA8" />
          <stop offset="100%" stopColor="#2A9D6F" />
        </linearGradient>
        <linearGradient id="ayi-face" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82C4" />
          <stop offset="100%" stopColor="#3DB58A" />
        </linearGradient>
        <radialGradient id="ayi-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2A9D6F" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#2A9D6F" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="140" cy="190" r="120" fill="url(#ayi-glow)">
        <animate attributeName="r" values="110;130;110" dur="4s" repeatCount="indefinite" />
      </circle>

      <ellipse cx="140" cy="295" rx="65" ry="14" fill="#1E5BA8" opacity="0.15" />

      <path
        d="M 90 200 Q 90 170 140 170 Q 190 170 190 200 L 195 280 Q 195 295 180 295 L 100 295 Q 85 295 85 280 Z"
        fill="url(#ayi-body)"
      />
      <rect x="125" y="210" width="30" height="40" rx="4" fill="white" opacity="0.18" />
      <circle cx="140" cy="225" r="3" fill="white" opacity="0.7">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
      </circle>

      <g ref={armRef}>
        <path
          d="M 175 200 Q 220 210 245 195 Q 255 192 252 180 Q 240 178 215 188 Q 195 192 175 200 Z"
          fill="url(#ayi-body)"
        />
        <circle cx="252" cy="185" r="9" fill="#3DB58A" />
      </g>

      <path d="M 105 200 Q 75 220 78 250 Q 82 258 92 256 Q 100 230 110 215 Z" fill="url(#ayi-body)" />

      <g ref={headRef}>
        <ellipse cx="140" cy="130" rx="55" ry="58" fill="url(#ayi-face)" />
        <ellipse cx="140" cy="125" rx="50" ry="52" fill="#F0F7FF" opacity="0.95" />

        <ellipse cx="120" cy="125" rx="6" ry="8" fill="#1E5BA8">
          <animate attributeName="ry" values="8;1;8;8;8" dur="5s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="160" cy="125" rx="6" ry="8" fill="#1E5BA8">
          <animate attributeName="ry" values="8;1;8;8;8" dur="5s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="122" cy="123" r="2" fill="white" />
        <circle cx="162" cy="123" r="2" fill="white" />

        <path
          d={state === "celebrating" ? "M 118 145 Q 140 170 162 145" : "M 122 148 Q 140 162 158 148"}
          stroke="#1E5BA8"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        <circle cx="108" cy="140" r="6" fill="#FF8B7A" opacity="0.4" />
        <circle cx="172" cy="140" r="6" fill="#FF8B7A" opacity="0.4" />

        <line x1="140" y1="72" x2="140" y2="55" stroke="url(#ayi-body)" strokeWidth="3" strokeLinecap="round" />
        <circle ref={antennaRef} cx="140" cy="50" r="7" fill="url(#ayi-body)" />
        <circle cx="140" cy="50" r="3" fill="#2A9D6F">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}
