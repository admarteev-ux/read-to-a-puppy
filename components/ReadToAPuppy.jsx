"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const fmt = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const PlayIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4.83c0-.96 1.06-1.54 1.88-1.02l10.09 6.17c.76.46.76 1.58 0 2.04L7.88 18.19A1.2 1.2 0 0 1 6 17.17V4.83Z" /></svg>
);
const PauseIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="5" height="18" rx="1.5" /><rect x="14" y="3" width="5" height="18" rx="1.5" /></svg>
);
const StopIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2.5" /></svg>
);

const Star = ({ x, y, size, delay }) => (
  <circle cx={x} cy={y} r={size} fill="#fffbe6" opacity="0"
    style={{ animation: `twinkle ${2.5 + Math.random() * 3}s ease-in-out ${delay}s infinite` }} />
);

const Moon = () => (
  <g>
    <defs>
      <radialGradient id="moonGlow" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#fffde7" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#fffde7" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="680" cy="80" r="80" fill="url(#moonGlow)" />
    <circle cx="680" cy="80" r="48" fill="#f5f0cd" />
    <circle cx="668" cy="72" r="8" fill="#ece7b8" opacity="0.5" />
    <circle cx="695" cy="90" r="5" fill="#ece7b8" opacity="0.4" />
  </g>
);

const Cloud = ({ x, y, scale = 1, opacity = 0.25, dur = 60 }) => (
  <g opacity={opacity} style={{ animation: `cloudDrift ${dur}s linear infinite`, transform: `translate(${x}px, ${y}px) scale(${scale})` }}>
    <ellipse cx="0" cy="0" rx="60" ry="22" fill="#b3cde8" />
    <ellipse cx="-30" cy="5" rx="40" ry="18" fill="#a8c4de" />
    <ellipse cx="35" cy="5" rx="45" ry="20" fill="#adc8e0" />
    <ellipse cx="10" cy="-8" rx="35" ry="16" fill="#c0d8ef" />
  </g>
);

const PillowBed = () => (
  <g>
    <ellipse cx="400" cy="432" rx="165" ry="32" fill="#1a2a4a" opacity="0.3" />
    <ellipse cx="400" cy="418" rx="155" ry="48" fill="#4a7cb8" />
    <ellipse cx="400" cy="414" rx="150" ry="45" fill="#5b8ec9" />
    <ellipse cx="400" cy="410" rx="145" ry="42" fill="#6da2d8" />
    <ellipse cx="400" cy="405" rx="125" ry="34" fill="#7db4e8" />
    <ellipse cx="400" cy="400" rx="115" ry="30" fill="#8ec2f0" />
    {/* Pillow puffs */}
    <ellipse cx="290" cy="412" rx="35" ry="22" fill="#5b8ec9" opacity="0.7" />
    <ellipse cx="510" cy="412" rx="35" ry="22" fill="#5b8ec9" opacity="0.7" />
    <ellipse cx="295" cy="410" rx="30" ry="18" fill="#6da2d8" opacity="0.5" />
    <ellipse cx="505" cy="410" rx="30" ry="18" fill="#6da2d8" opacity="0.5" />
    {/* Pillow stitching lines */}
    <path d="M 320 400 Q 400 385 480 400" stroke="#5b8ec9" strokeWidth="1" fill="none" opacity="0.3" />
    <path d="M 330 408 Q 400 395 470 408" stroke="#5b8ec9" strokeWidth="1" fill="none" opacity="0.2" />
    {/* Star pillow */}
    <g transform="translate(498, 378) scale(0.65)">
      <polygon points="0,-28 8,-9 28,-9 12,5 18,24 0,13 -18,24 -12,5 -28,-9 -8,-9" fill="#8ec2f0" stroke="#6da2d8" strokeWidth="2" />
      <polygon points="0,-22 6,-8 22,-8 10,3 14,18 0,10 -14,18 -10,3 -22,-8 -6,-8" fill="#a8d4f8" opacity="0.6" />
    </g>
  </g>
);

const LampPost = ({ activeBtn }) => (
  <g>
    <defs>
      <filter id="glG" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="8" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <filter id="glY" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="8" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <filter id="glR" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="8" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <rect x="112" y="195" width="10" height="270" rx="4" fill="#5a4a3a" />
    <rect x="114" y="195" width="6" height="270" rx="3" fill="#6b5a48" />
    <rect x="98" y="200" width="38" height="120" rx="13" fill="#4a3a2e" />
    <rect x="101" y="203" width="32" height="114" rx="11" fill="#5a4a3a" />
    <g filter={activeBtn === "green" ? "url(#glG)" : "none"}>
      <circle cx="117" cy="232" r="14" fill={activeBtn === "green" ? "#66ff88" : "#2a5a35"} />
      <circle cx="117" cy="232" r="9" fill={activeBtn === "green" ? "#88ffaa" : "#3a7a45"} />
      {activeBtn === "green" && <circle cx="117" cy="232" r="22" fill="#66ff88" opacity="0.15" />}
    </g>
    <g filter={activeBtn === "yellow" ? "url(#glY)" : "none"}>
      <circle cx="117" cy="265" r="14" fill={activeBtn === "yellow" ? "#ffee55" : "#5a5530"} />
      <circle cx="117" cy="265" r="9" fill={activeBtn === "yellow" ? "#fff888" : "#7a7540"} />
      {activeBtn === "yellow" && <circle cx="117" cy="265" r="22" fill="#ffee55" opacity="0.15" />}
    </g>
    <g filter={activeBtn === "red" ? "url(#glR)" : "none"}>
      <circle cx="117" cy="298" r="14" fill={activeBtn === "red" ? "#ff5555" : "#5a2a2a"} />
      <circle cx="117" cy="298" r="9" fill={activeBtn === "red" ? "#ff8888" : "#7a3a3a"} />
      {activeBtn === "red" && <circle cx="117" cy="298" r="22" fill="#ff5555" opacity="0.15" />}
    </g>
    <circle cx="117" cy="197" r="7" fill="#5a4a3a" />
    <circle cx="117" cy="197" r="4" fill="#6b5a48" />
  </g>
);

/* ══════════════════════════════════════════════
   PUPPY v6 — Maximum detail SVG cartoon
   
   Eyes close over 120 seconds (2 minutes).
   Fluffy layered fur, expressive cartoon face,
   detailed paws, ears, nose, mouth, tongue.
   ══════════════════════════════════════════════ */
const Puppy = ({ isIdle, elapsedSeconds }) => {
  const t = Math.min(1, (elapsedSeconds || 0) / 120);
  const eyeOpen = isIdle ? 1 : Math.max(0, 1 - t);
  const headDrop = t * 14;
  const bodyDrop = t * 10;
  const tongueShow = eyeOpen > 0.35;
  const wagDeg = isIdle ? 15 : Math.max(2, 14 * (1 - t));
  const mouthOpen = Math.max(0, eyeOpen - 0.3) / 0.7; // mouth closes as eyes close

  return (
    <g style={{ transform: `translateY(${bodyDrop}px)`, transition: "transform 8s ease" }}>

      {/* ── TAIL (fluffy, layered) ── */}
      <g style={{ transformOrigin: "452px 320px", animation: "tailWag 1.2s ease-in-out infinite alternate", "--wag-deg": `${wagDeg}deg` }}>
        <path d="M 452 318 Q 494 270 512 244 Q 522 226 514 218" stroke="#956c1e" strokeWidth="22" strokeLinecap="round" fill="none" />
        <path d="M 452 318 Q 494 270 512 244 Q 522 226 514 218" stroke="#b8892e" strokeWidth="18" strokeLinecap="round" fill="none" />
        <path d="M 452 318 Q 494 270 512 244 Q 522 226 514 218" stroke="#d4a24c" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M 452 318 Q 494 270 512 244 Q 522 226 514 218" stroke="#e8be6a" strokeWidth="8" strokeLinecap="round" fill="none" />
        {/* Fluffy tail tip */}
        <circle cx="514" cy="219" r="10" fill="#d4a24c" />
        <circle cx="514" cy="219" r="7" fill="#e8be6a" />
        <circle cx="513" cy="216" r="4" fill="#f0d080" opacity="0.5" />
        {/* Tail fur wisps */}
        <path d="M 500 238 Q 506 232 512 238" stroke="#f0d080" strokeWidth="1.5" fill="none" opacity="0.4" />
        <path d="M 480 258 Q 486 252 492 258" stroke="#e8be6a" strokeWidth="1.5" fill="none" opacity="0.3" />
      </g>

      {/* ── BODY (rich layered fur) ── */}
      <ellipse cx="400" cy="358" rx="105" ry="68" fill="#956c1e" />
      <ellipse cx="400" cy="355" rx="102" ry="65" fill="#b8892e" />
      <ellipse cx="400" cy="352" rx="98" ry="62" fill="#d4a24c" />
      <ellipse cx="400" cy="349" rx="94" ry="59" fill="#e2b85c" />
      {/* Belly highlight */}
      <ellipse cx="396" cy="364" rx="65" ry="38" fill="#ecdba0" opacity="0.45" />
      <ellipse cx="396" cy="368" rx="45" ry="25" fill="#f5e8c0" opacity="0.25" />
      {/* Fur texture — body wisp strokes */}
      <path d="M 335 325 Q 340 314 345 325" stroke="#c89838" strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M 355 320 Q 360 310 365 320" stroke="#c89838" strokeWidth="2" fill="none" opacity="0.35" />
      <path d="M 420 322 Q 425 312 430 322" stroke="#c89838" strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M 440 328 Q 445 318 450 328" stroke="#c89838" strokeWidth="2" fill="none" opacity="0.35" />
      <path d="M 375 328 Q 380 318 385 328" stroke="#d4a24c" strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d="M 405 326 Q 410 316 415 326" stroke="#d4a24c" strokeWidth="1.5" fill="none" opacity="0.3" />
      {/* Chest fur (prominent fluffy V) */}
      <path d="M 348 332 Q 362 306 376 332" stroke="#ecdba0" strokeWidth="3.5" fill="none" opacity="0.45" />
      <path d="M 356 338 Q 366 316 376 338" stroke="#f0d890" strokeWidth="3" fill="none" opacity="0.4" />
      <path d="M 340 340 Q 354 318 368 340" stroke="#ecdba0" strokeWidth="2.5" fill="none" opacity="0.35" />
      <path d="M 362 342 Q 370 326 378 342" stroke="#f5e8c0" strokeWidth="2" fill="none" opacity="0.3" />

      {/* ── FRONT PAWS (chunky, detailed) ── */}
      {/* Left paw */}
      <ellipse cx="342" cy="408" rx="30" ry="18" fill="#956c1e" />
      <ellipse cx="342" cy="406" rx="28" ry="16" fill="#b8892e" />
      <ellipse cx="342" cy="404" rx="26" ry="14" fill="#d4a24c" />
      <ellipse cx="342" cy="402" rx="24" ry="12" fill="#e8c878" />
      {/* Left paw toe beans */}
      <ellipse cx="330" cy="408" rx="6" ry="5" fill="#c89838" opacity="0.4" />
      <ellipse cx="342" cy="410" rx="6" ry="5" fill="#c89838" opacity="0.4" />
      <ellipse cx="354" cy="408" rx="6" ry="5" fill="#c89838" opacity="0.4" />
      <ellipse cx="342" cy="404" rx="4" ry="3" fill="#dbb060" opacity="0.3" />
      {/* Right paw */}
      <ellipse cx="422" cy="408" rx="30" ry="18" fill="#956c1e" />
      <ellipse cx="422" cy="406" rx="28" ry="16" fill="#b8892e" />
      <ellipse cx="422" cy="404" rx="26" ry="14" fill="#d4a24c" />
      <ellipse cx="422" cy="402" rx="24" ry="12" fill="#e8c878" />
      {/* Right paw toe beans */}
      <ellipse cx="410" cy="408" rx="6" ry="5" fill="#c89838" opacity="0.4" />
      <ellipse cx="422" cy="410" rx="6" ry="5" fill="#c89838" opacity="0.4" />
      <ellipse cx="434" cy="408" rx="6" ry="5" fill="#c89838" opacity="0.4" />
      <ellipse cx="422" cy="404" rx="4" ry="3" fill="#dbb060" opacity="0.3" />

      {/* ── HEAD ── */}
      <g style={{ transform: `translateY(${headDrop}px)`, transition: "transform 8s ease" }}>

        {/* Neck / chest connection (fluffy layers) */}
        <ellipse cx="360" cy="318" rx="62" ry="55" fill="#956c1e" />
        <ellipse cx="360" cy="318" rx="59" ry="52" fill="#b8892e" />
        <ellipse cx="360" cy="318" rx="56" ry="50" fill="#d4a24c" />
        <ellipse cx="360" cy="325" rx="44" ry="34" fill="#ecdba0" opacity="0.4" />
        {/* Neck fur wisps */}
        <path d="M 338 305 Q 348 288 358 305" stroke="#f0d890" strokeWidth="2.5" fill="none" opacity="0.4" />
        <path d="M 348 310 Q 356 294 364 310" stroke="#f5e8c0" strokeWidth="2" fill="none" opacity="0.35" />
        <path d="M 330 312 Q 340 298 350 312" stroke="#ecdba0" strokeWidth="2" fill="none" opacity="0.3" />

        {/* Head shape (round, fluffy, multi-layer) */}
        <ellipse cx="352" cy="262" rx="64" ry="60" fill="#956c1e" />
        <ellipse cx="352" cy="262" rx="62" ry="58" fill="#b8892e" />
        <ellipse cx="352" cy="262" rx="59" ry="55" fill="#d4a24c" />
        <ellipse cx="352" cy="262" rx="56" ry="52" fill="#e2b85c" />
        {/* Face lighter area */}
        <ellipse cx="352" cy="275" rx="44" ry="38" fill="#ecdba0" opacity="0.38" />
        <ellipse cx="352" cy="280" rx="34" ry="28" fill="#f5e8c0" opacity="0.2" />

        {/* Forehead fur tufts */}
        <path d="M 336 222 Q 352 210 368 222" stroke="#e8be6a" strokeWidth="3" fill="none" opacity="0.5" />
        <path d="M 341 226 Q 352 216 363 226" stroke="#f0d080" strokeWidth="2.5" fill="none" opacity="0.4" />
        <path d="M 346 229 Q 352 222 358 229" stroke="#f5e8c0" strokeWidth="2" fill="none" opacity="0.3" />

        {/* ── EARS (big, floppy, multi-layer fur) ── */}
        {/* Left ear */}
        <ellipse cx="290" cy="248" rx="30" ry="44" fill="#7a5818" transform="rotate(-22 290 248)" />
        <ellipse cx="292" cy="248" rx="28" ry="41" fill="#956c1e" transform="rotate(-22 292 248)" />
        <ellipse cx="294" cy="249" rx="25" ry="38" fill="#b8892e" transform="rotate(-20 294 249)" />
        <ellipse cx="296" cy="250" rx="22" ry="35" fill="#c89838" transform="rotate(-20 296 250)" />
        <ellipse cx="299" cy="254" rx="14" ry="24" fill="#d4a24c" transform="rotate(-18 299 254)" opacity="0.6" />
        <ellipse cx="301" cy="256" rx="8" ry="16" fill="#e2b85c" transform="rotate(-16 301 256)" opacity="0.3" />
        {/* Right ear */}
        <ellipse cx="414" cy="248" rx="30" ry="44" fill="#7a5818" transform="rotate(22 414 248)" />
        <ellipse cx="412" cy="248" rx="28" ry="41" fill="#956c1e" transform="rotate(22 412 248)" />
        <ellipse cx="410" cy="249" rx="25" ry="38" fill="#b8892e" transform="rotate(20 410 249)" />
        <ellipse cx="408" cy="250" rx="22" ry="35" fill="#c89838" transform="rotate(20 408 250)" />
        <ellipse cx="405" cy="254" rx="14" ry="24" fill="#d4a24c" transform="rotate(18 405 254)" opacity="0.6" />
        <ellipse cx="403" cy="256" rx="8" ry="16" fill="#e2b85c" transform="rotate(16 403 256)" opacity="0.3" />

        {/* ── EYES (large, expressive, anime-style) ── */}
        {/* Eye outlines */}
        <ellipse cx="332" cy="260" rx="20" ry={20 * eyeOpen} fill="#0e0804" style={{ transition: "ry 6s ease" }} />
        <ellipse cx="372" cy="260" rx="20" ry={20 * eyeOpen} fill="#0e0804" style={{ transition: "ry 6s ease" }} />
        {/* Eye whites */}
        <ellipse cx="332" cy="260" rx="18" ry={18 * eyeOpen} fill="white" style={{ transition: "ry 6s ease" }} />
        <ellipse cx="372" cy="260" rx="18" ry={18 * eyeOpen} fill="white" style={{ transition: "ry 6s ease" }} />

        {eyeOpen > 0.1 && <>
          {/* Iris */}
          <circle cx="335" cy="262" r={13 * Math.min(1, eyeOpen)} fill="#2a1808" style={{ transition: "r 6s ease" }} />
          <circle cx="375" cy="262" r={13 * Math.min(1, eyeOpen)} fill="#2a1808" style={{ transition: "r 6s ease" }} />
          {/* Iris warm ring */}
          <circle cx="335" cy="262" r={11 * Math.min(1, eyeOpen)} fill="#3e2510" style={{ transition: "r 6s ease" }} />
          <circle cx="375" cy="262" r={11 * Math.min(1, eyeOpen)} fill="#3e2510" style={{ transition: "r 6s ease" }} />
          <circle cx="335" cy="262" r={9 * Math.min(1, eyeOpen)} fill="#4a3018" style={{ transition: "r 6s ease" }} />
          <circle cx="375" cy="262" r={9 * Math.min(1, eyeOpen)} fill="#4a3018" style={{ transition: "r 6s ease" }} />
          {/* Primary shine (large, top-right) */}
          <circle cx="340" cy="255" r={5.5 * Math.min(1, eyeOpen)} fill="white" opacity="0.95" style={{ transition: "r 6s ease" }} />
          <circle cx="380" cy="255" r={5.5 * Math.min(1, eyeOpen)} fill="white" opacity="0.95" style={{ transition: "r 6s ease" }} />
          {/* Secondary shine (smaller, bottom-left) */}
          <circle cx="330" cy="266" r={3 * Math.min(1, eyeOpen)} fill="white" opacity="0.65" style={{ transition: "r 6s ease" }} />
          <circle cx="370" cy="266" r={3 * Math.min(1, eyeOpen)} fill="white" opacity="0.65" style={{ transition: "r 6s ease" }} />
          {/* Tiny tertiary sparkle */}
          <circle cx="337" cy="258" r={1.5 * Math.min(1, eyeOpen)} fill="white" opacity="0.5" style={{ transition: "r 6s ease" }} />
          <circle cx="377" cy="258" r={1.5 * Math.min(1, eyeOpen)} fill="white" opacity="0.5" style={{ transition: "r 6s ease" }} />
        </>}

        {/* Eyelids */}
        {eyeOpen < 0.98 && <>
          <ellipse cx="332" cy={260 - 18 * eyeOpen} rx="21" ry={21 * (1 - eyeOpen)} fill="#d4a24c" style={{ transition: "all 6s ease" }} />
          <ellipse cx="372" cy={260 - 18 * eyeOpen} rx="21" ry={21 * (1 - eyeOpen)} fill="#d4a24c" style={{ transition: "all 6s ease" }} />
          {/* Eyelid crease */}
          <ellipse cx="332" cy={260 - 18 * eyeOpen - 2} rx="22" ry={Math.max(0, 3 * (1 - eyeOpen))} fill="#b8892e" opacity="0.3" style={{ transition: "all 6s ease" }} />
          <ellipse cx="372" cy={260 - 18 * eyeOpen - 2} rx="22" ry={Math.max(0, 3 * (1 - eyeOpen))} fill="#b8892e" opacity="0.3" style={{ transition: "all 6s ease" }} />
          {/* Eyelashes when half closed */}
          {eyeOpen < 0.5 && <>
            <path d={`M 314 ${260 - 18 * eyeOpen + 1} Q 332 ${260 - 18 * eyeOpen - 4} 350 ${260 - 18 * eyeOpen + 1}`} stroke="#956c1e" strokeWidth="1.5" fill="none" opacity={0.5 * (1 - eyeOpen)} style={{ transition: "all 6s ease" }} />
            <path d={`M 354 ${260 - 18 * eyeOpen + 1} Q 372 ${260 - 18 * eyeOpen - 4} 390 ${260 - 18 * eyeOpen + 1}`} stroke="#956c1e" strokeWidth="1.5" fill="none" opacity={0.5 * (1 - eyeOpen)} style={{ transition: "all 6s ease" }} />
          </>}
        </>}

        {/* Eyebrow arches */}
        <path d="M 312 244 Q 332 234 352 244" stroke="#b8892e" strokeWidth="2.5" fill="none" opacity={eyeOpen > 0.5 ? 0.45 : 0} style={{ transition: "opacity 4s" }} />
        <path d="M 352 244 Q 372 234 392 244" stroke="#b8892e" strokeWidth="2.5" fill="none" opacity={eyeOpen > 0.5 ? 0.45 : 0} style={{ transition: "opacity 4s" }} />

        {/* ── NOSE (detailed, shiny) ── */}
        <ellipse cx="352" cy="284" rx="10" ry="7" fill="#0e0804" />
        <ellipse cx="352" cy="283" rx="9" ry="6" fill="#1a1008" />
        <ellipse cx="352" cy="282.5" rx="8" ry="5.5" fill="#2a1808" />
        {/* Nose highlights */}
        <ellipse cx="349" cy="280" rx="4" ry="2.5" fill="#3e2a18" opacity="0.7" />
        <circle cx="347" cy="279" r="2" fill="white" opacity="0.25" />
        {/* Nostrils */}
        <ellipse cx="348" cy="285" rx="2.5" ry="1.5" fill="#0e0804" opacity="0.4" />
        <ellipse cx="356" cy="285" rx="2.5" ry="1.5" fill="#0e0804" opacity="0.4" />

        {/* ── MOUTH (wide, expressive, animated) ── */}
        <path d={`M 335 290 Q 343 ${290 + mouthOpen * 8} 352 ${290 + mouthOpen * 2} Q 361 ${290 + mouthOpen * 8} 369 290`}
          stroke="#0e0804" strokeWidth="2" fill="none" style={{ transition: "all 4s ease" }} />

        {/* Tongue */}
        {tongueShow && (
          <g opacity={mouthOpen > 0.1 ? mouthOpen : 0} style={{ transition: "opacity 4s" }}>
            <ellipse cx="352" cy={296 + mouthOpen * 3} rx={9 * mouthOpen + 2} ry={12 * mouthOpen + 2} fill="#e06868" />
            <ellipse cx="352" cy={294 + mouthOpen * 3} rx={7 * mouthOpen + 1} ry={9 * mouthOpen + 1} fill="#f08888" />
            <ellipse cx="352" cy={292 + mouthOpen * 2} rx={4 * mouthOpen + 1} ry={5 * mouthOpen + 1} fill="#f5a0a0" opacity="0.5" />
            <line x1="352" y1={290 + mouthOpen * 2} x2="352" y2={303 + mouthOpen * 4} stroke="#c85858" strokeWidth="0.8" opacity={mouthOpen} />
          </g>
        )}

        {/* ── CHEEK BLUSH (warm, rosy) ── */}
        <ellipse cx="304" cy="278" rx="18" ry="10" fill="#f0a0a0" opacity={0.35 * eyeOpen} style={{ transition: "opacity 4s" }} />
        <ellipse cx="400" cy="278" rx="18" ry="10" fill="#f0a0a0" opacity={0.35 * eyeOpen} style={{ transition: "opacity 4s" }} />
        {/* Inner blush glow */}
        <ellipse cx="304" cy="278" rx="10" ry="6" fill="#f5b8b8" opacity={0.2 * eyeOpen} style={{ transition: "opacity 4s" }} />
        <ellipse cx="400" cy="278" rx="10" ry="6" fill="#f5b8b8" opacity={0.2 * eyeOpen} style={{ transition: "opacity 4s" }} />

        {/* ── WHISKER DOTS ── */}
        <circle cx="328" cy="287" r="1.8" fill="#b8892e" opacity="0.45" />
        <circle cx="323" cy="284" r="1.5" fill="#b8892e" opacity="0.35" />
        <circle cx="319" cy="280" r="1.2" fill="#b8892e" opacity="0.25" />
        <circle cx="376" cy="287" r="1.8" fill="#b8892e" opacity="0.45" />
        <circle cx="381" cy="284" r="1.5" fill="#b8892e" opacity="0.35" />
        <circle cx="385" cy="280" r="1.2" fill="#b8892e" opacity="0.25" />

        {/* ── ZZZ (when sleeping) ── */}
        {t > 0.7 && (
          <g opacity={Math.min(1, (t - 0.7) * 3.3)} style={{ transition: "opacity 4s" }}>
            <text x="408" y="222" fontSize="22" fill="#c8daf0" fontFamily="'Quicksand', sans-serif" fontWeight="700" style={{ animation: "floatUp 3.5s ease-in-out infinite" }}>z</text>
            <text x="426" y="204" fontSize="16" fill="#c8daf0" fontFamily="'Quicksand', sans-serif" fontWeight="700" style={{ animation: "floatUp 3.5s ease-in-out 0.7s infinite" }}>z</text>
            <text x="440" y="188" fontSize="12" fill="#c8daf0" fontFamily="'Quicksand', sans-serif" fontWeight="700" style={{ animation: "floatUp 3.5s ease-in-out 1.4s infinite" }}>z</text>
          </g>
        )}
      </g>
    </g>
  );
};

const SpeechBubble = ({ show }) => (
  <g opacity={show ? 1 : 0} style={{ transition: "opacity 1.2s ease" }}>
    <rect x="200" y="120" width="280" height="55" rx="22" fill="white" opacity="0.93" />
    <polygon points="250,175 270,175 240,195" fill="white" opacity="0.93" />
    <text x="340" y="147" textAnchor="middle" fill="#4a3a2e" fontSize="13.5" fontFamily="'Quicksand', sans-serif" fontWeight="600">Please read me a story</text>
    <text x="340" y="165" textAnchor="middle" fill="#4a3a2e" fontSize="13.5" fontFamily="'Quicksand', sans-serif" fontWeight="600">to help me fall asleep?</text>
  </g>
);

const PRESETS = [
  { label: "10 min", seconds: 600 },
  { label: "20 min", seconds: 1200 },
  { label: "30 min", seconds: 1800 },
];

export default function ReadToAPuppy() {
  const [duration, setDuration] = useState(PRESETS[0].seconds);
  const [elapsed, setElapsed] = useState(0);
  const [state, setState] = useState("idle");
  const [showBubble, setShowBubble] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const sleepProgress = state === "idle" ? 0 : state === "completed" ? 1 : Math.min(1, elapsed / duration);
  const activeBtn = state === "running" ? "green" : state === "paused" ? "yellow" : state === "completed" ? "red" : null;
  const remaining = Math.max(0, duration - elapsed);

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        setElapsed((p) => {
          if (p + 1 >= duration) { clearInterval(intervalRef.current); setState("completed"); return duration; }
          return p + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [state, duration]);

  const handleStart = useCallback(() => {
    if (state === "completed") return;
    if (state === "idle") {
      setElapsed(0); setShowBubble(true);
      if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); }
      setTimeout(() => setShowBubble(false), 5000);
      setState("running");
    } else if (state === "paused") {
      setState("running");
    }
  }, [state]);

  const handlePause = useCallback(() => { if (state === "running") setState("paused"); }, [state]);

  const handleStop = useCallback(() => {
    if (state === "running" || state === "paused") {
      clearInterval(intervalRef.current); setState("completed"); setShowBubble(false);
    } else if (state === "completed") {
      setState("idle"); setElapsed(0); setShowBubble(false);
    }
  }, [state]);

  const stars = useRef(Array.from({ length: 55 }, () => ({
    x: Math.random() * 800, y: Math.random() * 220,
    size: 0.4 + Math.random() * 2.2, delay: Math.random() * 5,
  }))).current;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #080e1e 0%, #0e1a38 30%, #152347 50%, #1e3a6e 75%, #264a80 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "16px 12px", fontFamily: "'Quicksand', sans-serif", overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Baloo+2:wght@600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.1} 50%{opacity:.95} }
        @keyframes tailWag { 0%{transform:rotate(calc(-1*var(--wag-deg)))} 100%{transform:rotate(var(--wag-deg))} }
        @keyframes cloudDrift { 0%{transform:translateX(0)} 100%{transform:translateX(40px)} }
        @keyframes floatUp { 0%,100%{transform:translateY(0);opacity:.5} 50%{transform:translateY(-14px);opacity:1} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes softBreathe { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.012)} }
        .scene-wrap { width:100%; max-width:560px; }
        .scene-wrap svg { width:100%; height:auto; display:block; }
        .ctrl-row { display:flex; gap:20px; justify-content:center; margin:16px 0 10px; }
        .ctrl-btn {
          width:80px; height:80px; border-radius:50%;
          border:3px solid rgba(255,255,255,0.15);
          display:flex; align-items:center; justify-content:center;
          flex-direction:column; gap:4px;
          font-size:12px; font-weight:700; letter-spacing:0.5px;
          cursor:pointer; transition:all 0.3s ease;
          background:rgba(255,255,255,0.06);
          backdrop-filter:blur(4px);
          -webkit-tap-highlight-color:transparent;
          user-select:none; font-family:'Quicksand',sans-serif; color:#a0b8d0;
        }
        .ctrl-btn:active { transform:scale(0.92); }
        .ctrl-btn:disabled { opacity:0.25; cursor:default; }
        .ctrl-btn:disabled:active { transform:none; }
        .ctrl-btn.green-on { background:radial-gradient(circle,rgba(102,255,136,0.3),rgba(102,255,136,0.06)); border-color:#66ff88; box-shadow:0 0 30px rgba(102,255,136,0.4); color:#b0ffc0; }
        .ctrl-btn.yellow-on { background:radial-gradient(circle,rgba(255,238,85,0.3),rgba(255,238,85,0.06)); border-color:#ffee55; box-shadow:0 0 30px rgba(255,238,85,0.4); color:#fff8c0; }
        .ctrl-btn.red-on { background:radial-gradient(circle,rgba(255,85,85,0.3),rgba(255,85,85,0.06)); border-color:#ff5555; box-shadow:0 0 30px rgba(255,85,85,0.4); color:#ffc0c0; }
        .ctrl-btn.green-idle:hover { border-color:rgba(102,255,136,0.5); background:rgba(102,255,136,0.1); }
        .ctrl-btn.yellow-idle:hover { border-color:rgba(255,238,85,0.5); background:rgba(255,238,85,0.1); }
        .ctrl-btn.red-idle:hover { border-color:rgba(255,85,85,0.5); background:rgba(255,85,85,0.1); }
        .preset-btn { padding:10px 22px; border-radius:28px; border:2px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.08); color:#c8daf0; font-family:'Quicksand',sans-serif; font-size:15px; font-weight:600; cursor:pointer; transition:all 0.3s ease; backdrop-filter:blur(4px); }
        .preset-btn:hover { background:rgba(255,255,255,0.15); border-color:rgba(255,255,255,0.35); }
        .preset-btn.active { background:rgba(110,180,255,0.25); border-color:rgba(110,180,255,0.6); color:#fff; }
        .preset-btn:disabled { opacity:0.4; cursor:default; }
        .reset-link { color:#8ab0d8; font-size:14px; font-weight:600; cursor:pointer; background:none; border:none; text-decoration:underline; font-family:'Quicksand',sans-serif; }
        .reset-link:hover { color:#aad0f8; }
        .timer-display { font-family:'Baloo 2','Quicksand',sans-serif; font-size:42px; font-weight:700; color:#e8f0ff; text-shadow:0 0 20px rgba(110,180,255,0.3); letter-spacing:2px; line-height:1; }
        .site-title { font-family:'Baloo 2','Quicksand',sans-serif; font-size:28px; font-weight:700; color:#f0e6c8; text-shadow:0 2px 12px rgba(200,160,80,0.3); margin:0; animation:fadeInUp 1s ease; }
        .status-text { font-size:14px; color:#a0b8d0; font-weight:500; min-height:20px; }
        .completed-msg { font-family:'Baloo 2','Quicksand',sans-serif; font-size:20px; color:#f0e6c8; text-shadow:0 2px 12px rgba(200,160,80,0.3); animation:fadeInUp 0.8s ease; text-align:center; line-height:1.5; }
      `}</style>

      <audio ref={audioRef} preload="auto">
        <source src="/audio/read-to-me.mp3" type="audio/mpeg" />
      </audio>

      <h1 className="site-title" style={{ marginBottom: 8 }}>🌙 Read to a Puppy</h1>

      <div className="scene-wrap">
        <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#080e1e" />
              <stop offset="50%" stopColor="#0e1a38" />
              <stop offset="100%" stopColor="#1a3060" />
            </linearGradient>
            <radialGradient id="warmLight" cx="50%" cy="80%" r="50%">
              <stop offset="0%" stopColor="#f0d080" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#f0d080" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a3060" stopOpacity="0" />
              <stop offset="100%" stopColor="#0a1428" />
            </linearGradient>
          </defs>
          <rect width="800" height="500" fill="url(#skyGrad)" rx="16" />
          <rect width="800" height="500" fill="url(#warmLight)" rx="16" />
          {stars.map((s, i) => <Star key={i} {...s} />)}
          <Moon />
          <Cloud x={80} y={55} scale={1.0} opacity={0.22} dur={55} />
          <Cloud x={350} y={90} scale={0.6} opacity={0.12} dur={80} />
          <Cloud x={520} y={105} scale={0.75} opacity={0.16} dur={70} />
          <Cloud x={650} y={45} scale={0.5} opacity={0.1} dur={65} />
          <rect x="0" y="380" width="800" height="120" fill="url(#ground)" />
          <g opacity="0.25">
            {[40,120,220,340,460,560,660,740].map((gx,i) => (
              <path key={i} d={`M ${gx} 465 Q ${gx+5} 448 ${gx+10} 465 Q ${gx+15} 446 ${gx+20} 465`} stroke="#1a4a2a" strokeWidth="2" fill="none" />
            ))}
          </g>
          <LampPost activeBtn={activeBtn} />
          <PillowBed />
          <g style={{
            animation: elapsed > 84 ? "softBreathe 5s ease-in-out infinite" : "none",
            transformOrigin: "400px 380px",
          }}>
            <Puppy isIdle={state === "idle"} elapsedSeconds={state === "idle" ? 0 : state === "completed" ? 120 : elapsed} />
          </g>
          <SpeechBubble show={showBubble} />
        </svg>
      </div>

      <div className="ctrl-row">
        <button className={`ctrl-btn ${activeBtn === "green" ? "green-on" : "green-idle"}`} onClick={handleStart} disabled={state === "completed"}>
          <PlayIcon /><span>Start</span>
        </button>
        <button className={`ctrl-btn ${activeBtn === "yellow" ? "yellow-on" : "yellow-idle"}`} onClick={handlePause} disabled={state !== "running"}>
          <PauseIcon /><span>Pause</span>
        </button>
        <button className={`ctrl-btn ${activeBtn === "red" ? "red-on" : "red-idle"}`} onClick={handleStop} disabled={state === "idle"}>
          <StopIcon /><span>Stop</span>
        </button>
      </div>

      <div className="timer-display" style={{ marginBottom: 4 }}>
        {state === "idle" ? fmt(duration) : fmt(remaining)}
      </div>

      <div className="status-text" style={{ marginBottom: 10 }}>
        {state === "idle" && "Pick a reading time & press Start"}
        {state === "running" && "Reading time… keep going! 📖"}
        {state === "paused" && "Paused — press Start to continue"}
        {state === "completed" && ""}
      </div>

      {state === "completed" && (
        <div className="completed-msg" style={{ marginBottom: 8 }}>
          🌟 Great job! The puppy fell asleep. 🌟<br />
          <span style={{ fontSize: 15, color: "#a0b8d0" }}>You're an amazing reader!</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {PRESETS.map((p) => (
          <button key={p.seconds} className={`preset-btn ${duration === p.seconds && state === "idle" ? "active" : ""}`}
            onClick={() => { if (state === "idle") setDuration(p.seconds); }} disabled={state !== "idle"}
          >{p.label}</button>
        ))}
      </div>

      {state === "completed" && (
        <button className="reset-link" onClick={handleStop}>Read again?</button>
      )}

      <div style={{ marginTop: 24, fontSize: 11, color: "#5a7a9a", textAlign: "center", lineHeight: 1.6 }}>
        No data collected · No microphone · Privacy-first<br />Made with 💛 for young readers
      </div>
    </div>
  );
}
