"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   READ TO A PUPPY — MVP v4
   • Audio enabled
   • SVG icons instead of emoji (cross-device)
   • Ultra-smooth tail + slow sleep + cute face
   ───────────────────────────────────────────── */

const fmt = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

/* ── SVG button icons (render same on all devices) ── */
const PlayIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4.83c0-.96 1.06-1.54 1.88-1.02l10.09 6.17c.76.46.76 1.58 0 2.04L7.88 18.19A1.2 1.2 0 0 1 6 17.17V4.83Z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="3" width="5" height="18" rx="1.5" />
    <rect x="14" y="3" width="5" height="18" rx="1.5" />
  </svg>
);

const StopIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2.5" />
  </svg>
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
    <ellipse cx="400" cy="430" rx="160" ry="30" fill="#1a2a4a" opacity="0.3" />
    <ellipse cx="400" cy="415" rx="150" ry="45" fill="#5b8ec9" />
    <ellipse cx="400" cy="410" rx="145" ry="42" fill="#6da2d8" />
    <ellipse cx="400" cy="405" rx="120" ry="32" fill="#7db4e8" />
    <ellipse cx="400" cy="400" rx="110" ry="28" fill="#8ec2f0" />
    <ellipse cx="300" cy="408" rx="30" ry="20" fill="#6da2d8" opacity="0.6" />
    <ellipse cx="500" cy="408" rx="30" ry="20" fill="#6da2d8" opacity="0.6" />
    <g transform="translate(495, 375) scale(0.6)">
      <polygon points="0,-25 7,-8 25,-8 11,4 17,22 0,12 -17,22 -11,4 -25,-8 -7,-8" fill="#a0d0f0" stroke="#80b8e0" strokeWidth="1" />
      <polygon points="0,-20 5,-7 20,-7 9,3 13,17 0,9 -13,17 -9,3 -20,-7 -5,-7" fill="#b8e0f8" opacity="0.6" />
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

const Puppy = ({ sleepProgress, isIdle }) => {
  // LINEAR eye closing: eyes fully open at 0%, fully closed at 85% of timer
  const eyeOpen = Math.max(0, 1 - sleepProgress * 1.18);
  const headDrop = sleepProgress * 12;
  const bodyDrop = sleepProgress * 8;
  const tongueShow = eyeOpen > 0.4;

  // TAIL: only amplitude changes via CSS variable, speed is FIXED
  // This prevents browser from restarting the animation on re-render
  const wagDeg = isIdle ? 15 : Math.max(2, 14 * (1 - sleepProgress));

  return (
    <g style={{ transform: `translateY(${bodyDrop}px)`, transition: "transform 8s ease" }}>
      <g style={{
        transformOrigin: "448px 310px",
        animation: "tailWag 1.2s ease-in-out infinite alternate",
        "--wag-deg": `${wagDeg}deg`,
        transition: "--wag-deg 5s ease",
      }}>
        <path d="M 448 305 Q 488 265 502 240 Q 510 225 504 220" stroke="#d4a24c" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M 448 305 Q 488 265 502 240 Q 510 225 504 220" stroke="#e8be6a" strokeWidth="8" strokeLinecap="round" fill="none" />
      </g>
      <ellipse cx="400" cy="350" rx="95" ry="60" fill="#d4a24c" />
      <ellipse cx="400" cy="345" rx="90" ry="55" fill="#e2b85c" />
      <ellipse cx="395" cy="360" rx="55" ry="30" fill="#ecdba0" opacity="0.5" />
      <g transform="translate(370, 340) scale(0.35)" opacity="0.3">
        <path d="M 0,-8 C -8,-18 -22,-8 -14,4 L 0,16 L 14,4 C 22,-8 8,-18 0,-8 Z" fill="#f0a0a0" />
      </g>
      <ellipse cx="348" cy="400" rx="24" ry="14" fill="#d4a24c" />
      <ellipse cx="348" cy="398" rx="22" ry="12" fill="#e8c878" />
      <ellipse cx="418" cy="400" rx="24" ry="14" fill="#d4a24c" />
      <ellipse cx="418" cy="398" rx="22" ry="12" fill="#e8c878" />
      <circle cx="340" cy="403" r="4.5" fill="#dbb060" opacity="0.5" />
      <circle cx="348" cy="405" r="4.5" fill="#dbb060" opacity="0.5" />
      <circle cx="356" cy="403" r="4.5" fill="#dbb060" opacity="0.5" />
      <circle cx="410" cy="403" r="4.5" fill="#dbb060" opacity="0.5" />
      <circle cx="418" cy="405" r="4.5" fill="#dbb060" opacity="0.5" />
      <circle cx="426" cy="403" r="4.5" fill="#dbb060" opacity="0.5" />
      <g style={{ transform: `translateY(${headDrop}px)`, transition: "transform 8s ease" }}>
        <ellipse cx="355" cy="310" rx="52" ry="48" fill="#e2b85c" />
        <ellipse cx="355" cy="320" rx="38" ry="28" fill="#ecdba0" opacity="0.5" />
        <ellipse cx="352" cy="262" rx="56" ry="52" fill="#e2b85c" />
        <ellipse cx="352" cy="275" rx="40" ry="34" fill="#ecdba0" opacity="0.45" />
        <ellipse cx="298" cy="248" rx="24" ry="36" fill="#c89838" transform="rotate(-18 298 248)" />
        <ellipse cx="301" cy="250" rx="18" ry="30" fill="#d4a24c" transform="rotate(-18 301 250)" />
        <ellipse cx="406" cy="248" rx="24" ry="36" fill="#c89838" transform="rotate(18 406 248)" />
        <ellipse cx="403" cy="250" rx="18" ry="30" fill="#d4a24c" transform="rotate(18 403 250)" />
        <ellipse cx="332" cy="258" rx="16" ry={16 * eyeOpen} fill="white" style={{ transition: "ry 6s ease" }} />
        <ellipse cx="372" cy="258" rx="16" ry={16 * eyeOpen} fill="white" style={{ transition: "ry 6s ease" }} />
        {eyeOpen > 0.15 && <>
          <circle cx="334" cy="260" r={10 * Math.min(1, eyeOpen)} fill="#3e2a15" style={{ transition: "r 6s ease" }} />
          <circle cx="374" cy="260" r={10 * Math.min(1, eyeOpen)} fill="#3e2a15" style={{ transition: "r 6s ease" }} />
          <circle cx="338" cy="256" r={4 * Math.min(1, eyeOpen)} fill="white" opacity="0.9" style={{ transition: "r 6s ease" }} />
          <circle cx="378" cy="256" r={4 * Math.min(1, eyeOpen)} fill="white" opacity="0.9" style={{ transition: "r 6s ease" }} />
          <circle cx="331" cy="263" r={2 * Math.min(1, eyeOpen)} fill="white" opacity="0.6" style={{ transition: "r 6s ease" }} />
          <circle cx="371" cy="263" r={2 * Math.min(1, eyeOpen)} fill="white" opacity="0.6" style={{ transition: "r 6s ease" }} />
        </>}
        {eyeOpen < 0.95 && <>
          <ellipse cx="332" cy={258 - 16 * eyeOpen} rx="18" ry={18 * (1 - eyeOpen)} fill="#daa84c" style={{ transition: "all 6s ease" }} />
          <ellipse cx="372" cy={258 - 16 * eyeOpen} rx="18" ry={18 * (1 - eyeOpen)} fill="#daa84c" style={{ transition: "all 6s ease" }} />
        </>}
        <path d="M 316 246 Q 332 239 348 246" stroke="#c89838" strokeWidth="2" fill="none" opacity={eyeOpen > 0.5 ? 0.5 : 0} style={{ transition: "opacity 4s" }} />
        <path d="M 356 246 Q 372 239 388 246" stroke="#c89838" strokeWidth="2" fill="none" opacity={eyeOpen > 0.5 ? 0.5 : 0} style={{ transition: "opacity 4s" }} />
        <ellipse cx="352" cy="282" rx="8" ry="5.5" fill="#3e2a15" />
        <ellipse cx="350" cy="280.5" rx="3" ry="2" fill="#5a3e24" opacity="0.6" />
        <path d="M 340 287 Q 346 293 352 288 Q 358 293 364 287" stroke="#3e2a15" strokeWidth="1.5" fill="none" />
        {tongueShow && (
          <g opacity={eyeOpen > 0.4 ? 1 : 0} style={{ transition: "opacity 4s" }}>
            <ellipse cx="352" cy="295" rx="7" ry="10" fill="#f0a0a0" />
            <ellipse cx="352" cy="293" rx="5" ry="7" fill="#f5b5b5" />
            <line x1="352" y1="289" x2="352" y2="300" stroke="#e08080" strokeWidth="0.7" />
          </g>
        )}
        <ellipse cx="310" cy="275" rx="14" ry="8" fill="#f0b0b0" opacity={0.35 * eyeOpen} style={{ transition: "opacity 4s" }} />
        <ellipse cx="394" cy="275" rx="14" ry="8" fill="#f0b0b0" opacity={0.35 * eyeOpen} style={{ transition: "opacity 4s" }} />
        {sleepProgress > 0.75 && (
          <g opacity={Math.min(1, (sleepProgress - 0.75) * 4)} style={{ transition: "opacity 4s" }}>
            <text x="405" y="225" fontSize="18" fill="#c8daf0" fontFamily="'Quicksand', sans-serif" fontWeight="700" style={{ animation: "floatUp 3.5s ease-in-out infinite" }}>z</text>
            <text x="420" y="210" fontSize="14" fill="#c8daf0" fontFamily="'Quicksand', sans-serif" fontWeight="700" style={{ animation: "floatUp 3.5s ease-in-out 0.7s infinite" }}>z</text>
            <text x="432" y="197" fontSize="11" fill="#c8daf0" fontFamily="'Quicksand', sans-serif" fontWeight="700" style={{ animation: "floatUp 3.5s ease-in-out 1.4s infinite" }}>z</text>
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
      // "Read again" — just reset to idle, let user pick time and press Start
      setState("idle"); setElapsed(0); setShowBubble(false);
    }
  }, [state]);

  const stars = useRef(Array.from({ length: 50 }, () => ({
    x: Math.random() * 800, y: Math.random() * 200,
    size: 0.5 + Math.random() * 2, delay: Math.random() * 5,
  }))).current;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0a1628 0%, #152347 40%, #1e3a6e 70%, #264a80 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "16px 12px", fontFamily: "'Quicksand', sans-serif", overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Baloo+2:wght@600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:.9} }
        @keyframes tailWag {
          0%   { transform: rotate(calc(-1 * var(--wag-deg))); }
          100% { transform: rotate(var(--wag-deg)); }
        }
        @keyframes cloudDrift { 0%{transform:translateX(0)} 100%{transform:translateX(40px)} }
        @keyframes floatUp { 0%,100%{transform:translateY(0);opacity:.6} 50%{transform:translateY(-12px);opacity:1} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes softBreathe { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.012)} }

        .scene-wrap { width:100%; max-width:540px; }
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
          user-select:none;
          font-family:'Quicksand',sans-serif;
          color:#a0b8d0;
        }
        .ctrl-btn:active { transform:scale(0.92); }
        .ctrl-btn:disabled { opacity:0.25; cursor:default; }
        .ctrl-btn:disabled:active { transform:none; }
        .ctrl-btn.green-on {
          background:radial-gradient(circle,rgba(102,255,136,0.3),rgba(102,255,136,0.06));
          border-color:#66ff88; box-shadow:0 0 30px rgba(102,255,136,0.4); color:#b0ffc0;
        }
        .ctrl-btn.yellow-on {
          background:radial-gradient(circle,rgba(255,238,85,0.3),rgba(255,238,85,0.06));
          border-color:#ffee55; box-shadow:0 0 30px rgba(255,238,85,0.4); color:#fff8c0;
        }
        .ctrl-btn.red-on {
          background:radial-gradient(circle,rgba(255,85,85,0.3),rgba(255,85,85,0.06));
          border-color:#ff5555; box-shadow:0 0 30px rgba(255,85,85,0.4); color:#ffc0c0;
        }
        .ctrl-btn.green-idle:hover { border-color:rgba(102,255,136,0.5); background:rgba(102,255,136,0.1); }
        .ctrl-btn.yellow-idle:hover { border-color:rgba(255,238,85,0.5); background:rgba(255,238,85,0.1); }
        .ctrl-btn.red-idle:hover { border-color:rgba(255,85,85,0.5); background:rgba(255,85,85,0.1); }

        .preset-btn {
          padding:10px 22px; border-radius:28px;
          border:2px solid rgba(255,255,255,0.2);
          background:rgba(255,255,255,0.08);
          color:#c8daf0; font-family:'Quicksand',sans-serif;
          font-size:15px; font-weight:600; cursor:pointer;
          transition:all 0.3s ease; backdrop-filter:blur(4px);
        }
        .preset-btn:hover { background:rgba(255,255,255,0.15); border-color:rgba(255,255,255,0.35); }
        .preset-btn.active { background:rgba(110,180,255,0.25); border-color:rgba(110,180,255,0.6); color:#fff; }
        .preset-btn:disabled { opacity:0.4; cursor:default; }

        .reset-link {
          color:#8ab0d8; font-size:14px; font-weight:600;
          cursor:pointer; background:none; border:none;
          text-decoration:underline; font-family:'Quicksand',sans-serif;
        }
        .reset-link:hover { color:#aad0f8; }

        .timer-display {
          font-family:'Baloo 2','Quicksand',sans-serif;
          font-size:42px; font-weight:700; color:#e8f0ff;
          text-shadow:0 0 20px rgba(110,180,255,0.3);
          letter-spacing:2px; line-height:1;
        }
        .site-title {
          font-family:'Baloo 2','Quicksand',sans-serif;
          font-size:28px; font-weight:700; color:#f0e6c8;
          text-shadow:0 2px 12px rgba(200,160,80,0.3);
          margin:0; animation:fadeInUp 1s ease;
        }
        .status-text { font-size:14px; color:#a0b8d0; font-weight:500; min-height:20px; }
        .completed-msg {
          font-family:'Baloo 2','Quicksand',sans-serif;
          font-size:20px; color:#f0e6c8;
          text-shadow:0 2px 12px rgba(200,160,80,0.3);
          animation:fadeInUp 0.8s ease; text-align:center; line-height:1.5;
        }
      `}</style>

      {/* ── Audio: puppy voice line ── */}
      <audio ref={audioRef} preload="auto">
        <source src="/audio/read-to-me.mp3" type="audio/mpeg" />
      </audio>

      <h1 className="site-title" style={{ marginBottom: 8 }}>🌙 Read to a Puppy</h1>

      <div className="scene-wrap">
        <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a1628" />
              <stop offset="60%" stopColor="#152347" />
              <stop offset="100%" stopColor="#1e3a6e" />
            </linearGradient>
            <radialGradient id="warmLight" cx="50%" cy="80%" r="50%">
              <stop offset="0%" stopColor="#f0d080" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f0d080" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3a6e" stopOpacity="0" />
              <stop offset="100%" stopColor="#0d1f3a" />
            </linearGradient>
          </defs>
          <rect width="800" height="500" fill="url(#skyGrad)" rx="16" />
          <rect width="800" height="500" fill="url(#warmLight)" rx="16" />
          {stars.map((s, i) => <Star key={i} {...s} />)}
          <Moon />
          <Cloud x={80} y={60} scale={0.9} opacity={0.2} dur={55} />
          <Cloud x={500} y={110} scale={0.7} opacity={0.15} dur={70} />
          <Cloud x={620} y={50} scale={0.5} opacity={0.12} dur={65} />
          <rect x="0" y="380" width="800" height="120" fill="url(#ground)" />
          <g opacity="0.3">
            {[50,130,250,380,500,600,700,760].map((gx,i) => (
              <path key={i} d={`M ${gx} 465 Q ${gx+5} 450 ${gx+10} 465 Q ${gx+15} 448 ${gx+20} 465`} stroke="#2a5a3a" strokeWidth="2" fill="none" />
            ))}
          </g>
          <LampPost activeBtn={activeBtn} />
          <PillowBed />
          <g style={{
            animation: sleepProgress > 0.7 ? "softBreathe 5s ease-in-out infinite" : "none",
            transformOrigin: "400px 380px",
          }}>
            <Puppy sleepProgress={sleepProgress} isIdle={state === "idle"} />
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
