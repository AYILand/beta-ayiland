"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export type AyiPose =
  | "pointing"
  | "thinking"
  | "typing"
  | "celebrating"
  | "presenting"
  | "waving"
  | "sleeping"
  | "detective"
  | "sad"
  | "idle";

// Backward compat with old API (state="idle"/"pointing"/"celebrating"/"thinking")
type LegacyState = "idle" | "pointing" | "celebrating" | "thinking";

interface AyiMascotProps {
  pose?: AyiPose;
  state?: LegacyState;
  className?: string;
}

const STATE_TO_POSE: Record<LegacyState, AyiPose> = {
  idle: "pointing",
  pointing: "pointing",
  celebrating: "celebrating",
  thinking: "thinking",
};

export function AyiMascot({ pose, state, className }: AyiMascotProps) {
  const resolvedPose: AyiPose = pose ?? (state ? STATE_TO_POSE[state] : "pointing");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const headRef = useRef<SVGGElement | null>(null);
  const antennaRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(svgRef.current, {
        y: -10,
        duration: 2.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      if (headRef.current) {
        gsap.to(headRef.current, {
          rotation: resolvedPose === "sleeping" ? 8 : 3,
          duration: 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          transformOrigin: "50% 90%",
        });
      }
      if (antennaRef.current) {
        gsap.to(antennaRef.current, {
          scale: 1.2,
          duration: 1.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          transformOrigin: "center",
        });
      }
    }, svgRef);
    return () => ctx.revert();
  }, [resolvedPose]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 320 360"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ayi mascot"
      role="img"
    >
      <Defs />
      <Aura />
      <FloorShadow />
      <Body pose={resolvedPose} />
      <ChestDetail pose={resolvedPose} />
      <Arms pose={resolvedPose} />
      <Head ref={headRef} pose={resolvedPose}>
        <Antenna ref={antennaRef} />
      </Head>
      <Accessories pose={resolvedPose} />
    </svg>
  );
}

function Defs() {
  return (
    <defs>
      <linearGradient id="ayi-body-grad" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor="#3B82C4" />
        <stop offset="55%" stopColor="#1E5BA8" />
        <stop offset="100%" stopColor="#2A9D6F" />
      </linearGradient>
      <linearGradient id="ayi-arm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2A6BB5" />
        <stop offset="100%" stopColor="#2A9D6F" />
      </linearGradient>
      <radialGradient id="ayi-head-grad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="55%" stopColor="#E8F1F9" />
        <stop offset="100%" stopColor="#BBD0E4" />
      </radialGradient>
      <radialGradient id="ayi-cheek-grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFA294" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#FFA294" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="ayi-aura-grad" cx="50%" cy="55%" r="55%">
        <stop offset="0%" stopColor="#2A9D6F" stopOpacity="0.35" />
        <stop offset="60%" stopColor="#1E5BA8" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#2A9D6F" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="ayi-shadow-grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0F1F33" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#0F1F33" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="ayi-antenna-grad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#67D7AA" />
        <stop offset="100%" stopColor="#1E5BA8" />
      </radialGradient>
      <linearGradient id="ayi-eye-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E3A5F" />
        <stop offset="100%" stopColor="#0F1F33" />
      </linearGradient>
      <radialGradient id="ayi-belly-highlight" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

function Aura() {
  return (
    <ellipse cx="160" cy="200" rx="140" ry="125" fill="url(#ayi-aura-grad)">
      <animate attributeName="rx" values="130;150;130" dur="4s" repeatCount="indefinite" />
      <animate attributeName="ry" values="115;130;115" dur="4s" repeatCount="indefinite" />
    </ellipse>
  );
}

function FloorShadow() {
  return (
    <ellipse cx="160" cy="332" rx="80" ry="14" fill="url(#ayi-shadow-grad)">
      <animate attributeName="rx" values="78;72;78" dur="2.6s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.65;0.4;0.65" dur="2.6s" repeatCount="indefinite" />
    </ellipse>
  );
}

function Body({ pose }: { pose: AyiPose }) {
  const lean = pose === "typing" ? 6 : pose === "sleeping" || pose === "sad" ? -2 : 0;
  return (
    <g style={{ transform: `translateY(${lean}px)` }}>
      <path
        d="M 90 220 Q 90 180 160 180 Q 230 180 230 220 L 235 310 Q 236 322 222 322 L 98 322 Q 84 322 85 310 Z"
        fill="url(#ayi-body-grad)"
      />
      <path
        d="M 100 200 Q 100 188 160 188 Q 220 188 220 200 L 220 240 Q 220 230 160 230 Q 100 230 100 240 Z"
        fill="url(#ayi-belly-highlight)"
        opacity="0.85"
      />
    </g>
  );
}

function ChestDetail({ pose }: { pose: AyiPose }) {
  return (
    <g>
      <rect x="140" y="220" width="40" height="48" rx="6" fill="#FFFFFF" opacity="0.22" />
      <rect x="140" y="220" width="40" height="48" rx="6" fill="none" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1.2" />
      <circle cx="160" cy="234" r="3.5" fill="#67D7AA">
        <animate
          attributeName="opacity"
          values={pose === "sleeping" ? "0.2;0.05;0.2" : "0.4;1;0.4"}
          dur={pose === "sleeping" ? "3s" : "1.8s"}
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
}

function Arms({ pose }: { pose: AyiPose }) {
  switch (pose) {
    case "pointing":
      return (
        <g>
          <path
            d="M 110 215 Q 80 240 78 270 Q 80 280 92 278 Q 102 250 116 230 Z"
            fill="url(#ayi-arm-grad)"
          />
          <g style={{ transformOrigin: "200px 215px", animation: "ay-pointing 3s ease-in-out infinite" }}>
            <path
              d="M 200 215 Q 250 218 278 200 Q 290 196 286 184 Q 272 184 244 195 Q 220 200 200 215 Z"
              fill="url(#ayi-arm-grad)"
            />
            <circle cx="288" cy="190" r="11" fill="#3DB58A" />
            <circle cx="284" cy="186" r="3.5" fill="#FFFFFF" opacity="0.4" />
          </g>
          <style>{`
            @keyframes ay-pointing { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-7deg); } }
          `}</style>
        </g>
      );
    case "thinking":
      return (
        <g>
          <path
            d="M 110 215 Q 80 240 82 268 Q 84 278 96 276 Q 106 248 118 230 Z"
            fill="url(#ayi-arm-grad)"
          />
          <g style={{ transformOrigin: "200px 215px" }}>
            <path
              d="M 200 215 Q 220 200 226 178 Q 226 165 218 162 Q 208 168 204 184 Q 196 200 196 218 Z"
              fill="url(#ayi-arm-grad)"
            />
            <circle cx="222" cy="170" r="11" fill="#3DB58A" />
            <circle cx="219" cy="167" r="3.5" fill="#FFFFFF" opacity="0.4" />
          </g>
        </g>
      );
    case "typing":
      return (
        <g>
          <g style={{ transformOrigin: "120px 220px", animation: "ay-typing-l 0.7s ease-in-out infinite" }}>
            <path
              d="M 110 215 Q 130 230 152 246 Q 158 252 152 258 Q 138 254 122 244 Q 100 232 102 218 Z"
              fill="url(#ayi-arm-grad)"
            />
            <circle cx="152" cy="252" r="10" fill="#3DB58A" />
          </g>
          <g style={{ transformOrigin: "200px 220px", animation: "ay-typing-r 0.7s 0.35s ease-in-out infinite" }}>
            <path
              d="M 210 215 Q 188 230 168 246 Q 162 252 168 258 Q 182 254 198 244 Q 220 232 218 218 Z"
              fill="url(#ayi-arm-grad)"
            />
            <circle cx="168" cy="252" r="10" fill="#3DB58A" />
          </g>
          <style>{`
            @keyframes ay-typing-l { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
            @keyframes ay-typing-r { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          `}</style>
        </g>
      );
    case "celebrating":
      return (
        <g>
          <g style={{ transformOrigin: "112px 215px", animation: "ay-celebrate-l 1.2s ease-in-out infinite" }}>
            <path
              d="M 112 215 Q 88 180 80 140 Q 80 130 92 128 Q 100 156 116 200 Z"
              fill="url(#ayi-arm-grad)"
            />
            <circle cx="86" cy="134" r="12" fill="#3DB58A" />
            <circle cx="83" cy="131" r="3.5" fill="#FFFFFF" opacity="0.4" />
          </g>
          <g style={{ transformOrigin: "208px 215px", animation: "ay-celebrate-r 1.2s 0.1s ease-in-out infinite" }}>
            <path
              d="M 208 215 Q 232 180 240 140 Q 240 130 228 128 Q 220 156 204 200 Z"
              fill="url(#ayi-arm-grad)"
            />
            <circle cx="234" cy="134" r="12" fill="#3DB58A" />
            <circle cx="231" cy="131" r="3.5" fill="#FFFFFF" opacity="0.4" />
          </g>
          <style>{`
            @keyframes ay-celebrate-l { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-8deg); } }
            @keyframes ay-celebrate-r { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(8deg); } }
          `}</style>
        </g>
      );
    case "presenting":
      return (
        <g>
          <path
            d="M 110 215 Q 92 235 96 258 Q 100 268 110 266 Q 116 244 124 226 Z"
            fill="url(#ayi-arm-grad)"
          />
          <g style={{ transformOrigin: "200px 215px" }}>
            <path
              d="M 200 215 Q 240 220 274 232 Q 286 236 282 248 Q 270 252 240 244 Q 218 240 198 232 Z"
              fill="url(#ayi-arm-grad)"
            />
            <circle cx="286" cy="240" r="11" fill="#3DB58A" />
            <circle cx="283" cy="237" r="3.5" fill="#FFFFFF" opacity="0.4" />
          </g>
        </g>
      );
    case "waving":
      return (
        <g>
          <path
            d="M 110 215 Q 92 235 96 258 Q 100 268 110 266 Q 116 244 124 226 Z"
            fill="url(#ayi-arm-grad)"
          />
          <g style={{ transformOrigin: "208px 215px", animation: "ay-waving 1s ease-in-out infinite" }}>
            <path
              d="M 208 215 Q 234 180 244 142 Q 244 132 232 130 Q 224 156 208 200 Z"
              fill="url(#ayi-arm-grad)"
            />
            <g style={{ transformOrigin: "238px 134px", animation: "ay-hand-wave 1s ease-in-out infinite" }}>
              <circle cx="238" cy="134" r="14" fill="#3DB58A" />
              <circle cx="234" cy="130" r="4" fill="#FFFFFF" opacity="0.4" />
              <path d="M 234 122 L 234 116" stroke="#3DB58A" strokeWidth="3" strokeLinecap="round" />
              <path d="M 238 121 L 238 114" stroke="#3DB58A" strokeWidth="3" strokeLinecap="round" />
              <path d="M 242 122 L 242 116" stroke="#3DB58A" strokeWidth="3" strokeLinecap="round" />
            </g>
          </g>
          <style>{`
            @keyframes ay-waving { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(8deg); } }
            @keyframes ay-hand-wave { 0%,100% { transform: rotate(-15deg); } 50% { transform: rotate(15deg); } }
          `}</style>
        </g>
      );
    case "sleeping":
      return (
        <g>
          <path
            d="M 110 220 Q 94 250 110 280 Q 122 285 130 278 Q 124 254 126 230 Z"
            fill="url(#ayi-arm-grad)"
          />
          <path
            d="M 210 220 Q 226 250 210 280 Q 198 285 190 278 Q 196 254 194 230 Z"
            fill="url(#ayi-arm-grad)"
          />
        </g>
      );
    case "detective":
      return (
        <g>
          <path
            d="M 110 215 Q 92 235 96 258 Q 100 268 110 266 Q 116 244 124 226 Z"
            fill="url(#ayi-arm-grad)"
          />
          <g style={{ transformOrigin: "200px 215px" }}>
            <path
              d="M 200 215 Q 224 195 244 170 Q 250 162 244 156 Q 232 158 218 175 Q 204 195 198 215 Z"
              fill="url(#ayi-arm-grad)"
            />
            <circle cx="248" cy="158" r="11" fill="#3DB58A" />
            <line x1="252" y1="148" x2="262" y2="138" stroke="#0F1F33" strokeWidth="4" strokeLinecap="round" />
            <circle cx="268" cy="132" r="14" fill="none" stroke="#0F1F33" strokeWidth="4" />
            <circle cx="268" cy="132" r="11" fill="#FFFFFF" opacity="0.7" />
            <circle cx="263" cy="128" r="4" fill="#FFFFFF" opacity="0.5" />
          </g>
        </g>
      );
    case "sad":
      return (
        <g>
          <path
            d="M 110 225 Q 90 265 100 295 Q 110 300 118 294 Q 116 264 124 232 Z"
            fill="url(#ayi-arm-grad)"
          />
          <path
            d="M 210 225 Q 230 265 220 295 Q 210 300 202 294 Q 204 264 196 232 Z"
            fill="url(#ayi-arm-grad)"
          />
        </g>
      );
    default:
      return null;
  }
}

interface HeadProps {
  pose: AyiPose;
  children?: React.ReactNode;
}

const Head = ({ ref, pose, children }: HeadProps & { ref: React.RefObject<SVGGElement | null> }) => {
  return (
    <g ref={ref}>
      <ellipse cx="160" cy="140" rx="68" ry="70" fill="url(#ayi-body-grad)" opacity="0.6" />
      <ellipse cx="160" cy="135" rx="62" ry="64" fill="url(#ayi-head-grad)" />
      <ellipse cx="138" cy="105" rx="22" ry="14" fill="#FFFFFF" opacity="0.45" />

      <Eyes pose={pose} />
      <Mouth pose={pose} />
      <Cheeks pose={pose} />

      {children}
    </g>
  );
};

function Eyes({ pose }: { pose: AyiPose }) {
  if (pose === "sleeping") {
    return (
      <g stroke="#1E3A5F" strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M 128 135 Q 138 142 148 135" />
        <path d="M 172 135 Q 182 142 192 135" />
      </g>
    );
  }
  if (pose === "celebrating") {
    return (
      <g stroke="#1E3A5F" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M 124 138 Q 138 124 152 138" />
        <path d="M 168 138 Q 182 124 196 138" />
      </g>
    );
  }
  if (pose === "thinking") {
    return (
      <g>
        <ellipse cx="134" cy="135" rx="7" ry="9" fill="url(#ayi-eye-grad)">
          <animate attributeName="ry" values="9;1;9;9;9" dur="5s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="138" cy="130" rx="2.5" ry="2.5" fill="#FFFFFF" />
        <ellipse cx="178" cy="130" rx="7" ry="9" fill="url(#ayi-eye-grad)">
          <animate attributeName="ry" values="9;1;9;9;9" dur="5s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="182" cy="125" rx="2.5" ry="2.5" fill="#FFFFFF" />
      </g>
    );
  }
  if (pose === "sad") {
    return (
      <g>
        <ellipse cx="134" cy="138" rx="6" ry="6" fill="url(#ayi-eye-grad)" />
        <ellipse cx="178" cy="138" rx="6" ry="6" fill="url(#ayi-eye-grad)" />
        <path
          d="M 124 130 Q 134 124 144 130"
          stroke="#1E3A5F"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 168 130 Q 178 124 188 130"
          stroke="#1E3A5F"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx="148" cy="152" rx="2.5" ry="4" fill="#65B7DC" opacity="0.85">
          <animate attributeName="cy" values="148;172;172" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.85;0" dur="3s" repeatCount="indefinite" />
        </ellipse>
      </g>
    );
  }
  if (pose === "detective") {
    return (
      <g>
        <ellipse cx="134" cy="135" rx="7" ry="9" fill="url(#ayi-eye-grad)" />
        <ellipse cx="137" cy="131" rx="2.5" ry="2.5" fill="#FFFFFF" />
        <ellipse cx="178" cy="135" rx="9" ry="10" fill="url(#ayi-eye-grad)" />
        <ellipse cx="181" cy="131" rx="2.5" ry="2.5" fill="#FFFFFF" />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx="134" cy="135" rx="7" ry="9" fill="url(#ayi-eye-grad)">
        <animate attributeName="ry" values="9;1;9;9;9" dur={pose === "typing" ? "4s" : "5s"} repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="137" cy="131" rx="2.5" ry="2.5" fill="#FFFFFF" />
      <ellipse cx="178" cy="135" rx="7" ry="9" fill="url(#ayi-eye-grad)">
        <animate attributeName="ry" values="9;1;9;9;9" dur={pose === "typing" ? "4s" : "5s"} repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="181" cy="131" rx="2.5" ry="2.5" fill="#FFFFFF" />
    </g>
  );
}

function Mouth({ pose }: { pose: AyiPose }) {
  let path: string;
  let strokeWidth = 3.5;
  if (pose === "celebrating") {
    path = "M 134 160 Q 156 188 178 160 Q 156 174 134 160 Z";
    return (
      <path
        d={path}
        fill="#1E3A5F"
        stroke="#1E3A5F"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    );
  }
  if (pose === "waving") path = "M 132 158 Q 156 182 180 158";
  else if (pose === "sad") path = "M 134 174 Q 156 158 178 174";
  else if (pose === "thinking") path = "M 144 165 Q 150 168 156 164";
  else if (pose === "sleeping") path = "M 144 162 Q 156 168 168 162";
  else if (pose === "detective") path = "M 142 162 Q 156 164 170 162";
  else if (pose === "typing") path = "M 142 162 Q 156 166 170 162";
  else if (pose === "presenting") path = "M 134 158 Q 156 178 178 158";
  else path = "M 134 160 Q 156 178 178 160";

  return (
    <path
      d={path}
      stroke="#1E3A5F"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function Cheeks({ pose }: { pose: AyiPose }) {
  if (pose === "sleeping" || pose === "sad") {
    return null;
  }
  return (
    <g>
      <circle cx="116" cy="158" r="10" fill="url(#ayi-cheek-grad)" />
      <circle cx="196" cy="158" r="10" fill="url(#ayi-cheek-grad)" />
    </g>
  );
}

const Antenna = ({ ref }: { ref: React.RefObject<SVGCircleElement | null> }) => (
  <g>
    <line x1="160" y1="76" x2="160" y2="56" stroke="url(#ayi-body-grad)" strokeWidth="3.5" strokeLinecap="round" />
    <circle ref={ref} cx="160" cy="48" r="9" fill="url(#ayi-antenna-grad)" />
    <circle cx="158" cy="46" r="3" fill="#FFFFFF" opacity="0.6" />
    <circle cx="160" cy="48" r="3.5" fill="#67D7AA">
      <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
    </circle>
  </g>
);

function Accessories({ pose }: { pose: AyiPose }) {
  if (pose === "celebrating") {
    return (
      <g>
        {[
          { x: 60, y: 80, c: "#FFD166", d: "0s" },
          { x: 260, y: 90, c: "#2A9D6F", d: "0.4s" },
          { x: 80, y: 200, c: "#FF8B7A", d: "0.8s" },
          { x: 270, y: 220, c: "#1E5BA8", d: "1.2s" },
          { x: 50, y: 140, c: "#67D7AA", d: "0.6s" },
          { x: 250, y: 150, c: "#FFD166", d: "1s" },
        ].map((s, i) => (
          <g key={i}>
            <path
              d={`M ${s.x} ${s.y - 8} L ${s.x + 2} ${s.y - 2} L ${s.x + 8} ${s.y} L ${s.x + 2} ${s.y + 2} L ${s.x} ${s.y + 8} L ${s.x - 2} ${s.y + 2} L ${s.x - 8} ${s.y} L ${s.x - 2} ${s.y - 2} Z`}
              fill={s.c}
              opacity="0.85"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${s.x} ${s.y}`}
                to={`360 ${s.x} ${s.y}`}
                dur="3.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.85;0"
                dur="2s"
                begin={s.d}
                repeatCount="indefinite"
              />
            </path>
          </g>
        ))}
      </g>
    );
  }
  if (pose === "sleeping") {
    return (
      <g>
        <text
          x="220"
          y="100"
          fontSize="22"
          fontWeight="500"
          fill="#1E5BA8"
          opacity="0.7"
        >
          Z
          <animate attributeName="y" values="105;75;75" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.7;0" dur="3s" repeatCount="indefinite" />
        </text>
        <text
          x="240"
          y="80"
          fontSize="16"
          fontWeight="500"
          fill="#1E5BA8"
          opacity="0.5"
        >
          z
          <animate attributeName="y" values="85;55;55" dur="3s" begin="0.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.5;0" dur="3s" begin="0.6s" repeatCount="indefinite" />
        </text>
        <text
          x="252"
          y="68"
          fontSize="12"
          fontWeight="500"
          fill="#1E5BA8"
          opacity="0.4"
        >
          z
          <animate attributeName="y" values="73;48;48" dur="3s" begin="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.4;0" dur="3s" begin="1.2s" repeatCount="indefinite" />
        </text>
      </g>
    );
  }
  if (pose === "presenting") {
    return (
      <g style={{ transformOrigin: "278px 240px", animation: "ay-clipboard 4s ease-in-out infinite" }}>
        <rect x="262" y="200" width="48" height="64" rx="4" fill="#FFFFFF" stroke="#1E5BA8" strokeWidth="2" />
        <rect x="276" y="194" width="20" height="10" rx="2" fill="#1E5BA8" />
        <line x1="270" y1="216" x2="302" y2="216" stroke="#9AAEC4" strokeWidth="1.5" />
        <line x1="270" y1="224" x2="302" y2="224" stroke="#9AAEC4" strokeWidth="1.5" />
        <line x1="270" y1="232" x2="296" y2="232" stroke="#9AAEC4" strokeWidth="1.5" />
        <line x1="270" y1="248" x2="302" y2="248" stroke="#2A9D6F" strokeWidth="2.5" />
        <style>{`
          @keyframes ay-clipboard { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        `}</style>
      </g>
    );
  }
  return null;
}
