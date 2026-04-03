"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   READ TO A PUPPY — v12 (Complete animation)
   
   puppy-full.mp4 layout (each segment ~5s):
   0-20s     loop1 (awake) x4
   20-25s    transition 1→2
   25-45s    loop2 (drowsy) x4
   45-50s    transition 2→3
   50-70s    loop3 (sleepy) x4
   70-75s    transition 3→4
   75-95s    loop4 (asleep) x4
   
   Total: ~95s. All states covered with video.
   Eyes fully closed by ~75s mark (transition 3→4).
   After 95s, loop4 keeps repeating.
   ───────────────────────────────────────────── */

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

/* ── Phase map: elapsed seconds → video position ── */
/* ── Phase map: elapsed seconds → video position ── 
   Loops now play through all 4 copies (20s of video) before seeking back.
   This avoids jerky loop boundaries since copies flow naturally. */
const PHASES = [
  { elStart: 0,   elEnd: 20,  vStart: 0,  vEnd: 20,  loop: true },   // awake loop (4 copies)
  { elStart: 20,  elEnd: 25,  vStart: 20, vEnd: 25,  loop: false },  // trans 1→2
  { elStart: 25,  elEnd: 45,  vStart: 25, vEnd: 45,  loop: true },   // drowsy loop (4 copies)
  { elStart: 45,  elEnd: 50,  vStart: 45, vEnd: 50,  loop: false },  // trans 2→3
  { elStart: 50,  elEnd: 70,  vStart: 50, vEnd: 70,  loop: true },   // sleepy loop (4 copies)
  { elStart: 70,  elEnd: 75,  vStart: 70, vEnd: 75,  loop: false },  // trans 3→4
  { elStart: 75,  elEnd: 9999, vStart: 75, vEnd: 95, loop: true },   // asleep loop (4 copies)
];

function getPhase(elapsed) {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (elapsed >= PHASES[i].elStart) return { ...PHASES[i], index: i };
  }
  return { ...PHASES[0], index: 0 };
}

/* ── Lamp Post ── */
const LampPost = ({ activeBtn }) => {
  const glow = (id, on) => on ? `url(#${id})` : "none";
  return (
    <div style={{
      position: "absolute", left: "4%", top: "28%", width: "8%", height: "60%",
      display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none",
    }}>
      <svg viewBox="0 0 60 300" style={{ width: "100%", height: "100%" }}>
        <defs>
          <filter id="glG" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="glY" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="glR" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <rect x="25" y="10" width="10" height="280" rx="4" fill="#5a4a3a" />
        <rect x="27" y="10" width="6" height="280" rx="3" fill="#6b5a48" />
        <rect x="12" y="15" width="36" height="110" rx="12" fill="#4a3a2e" />
        <rect x="15" y="18" width="30" height="104" rx="10" fill="#5a4a3a" />
        <circle cx="30" cy="12" r="6" fill="#5a4a3a" />
        <circle cx="30" cy="12" r="3.5" fill="#6b5a48" />
        <g filter={glow("glG", activeBtn === "green")}>
          <circle cx="30" cy="42" r="12" fill={activeBtn === "green" ? "#66ff88" : "#2a5a35"} />
          <circle cx="30" cy="42" r="8" fill={activeBtn === "green" ? "#88ffaa" : "#3a7a45"} />
          {activeBtn === "green" && <circle cx="30" cy="42" r="18" fill="#66ff88" opacity="0.2" />}
        </g>
        <g filter={glow("glY", activeBtn === "yellow")}>
          <circle cx="30" cy="72" r="12" fill={activeBtn === "yellow" ? "#ffee55" : "#5a5530"} />
          <circle cx="30" cy="72" r="8" fill={activeBtn === "yellow" ? "#fff888" : "#7a7540"} />
          {activeBtn === "yellow" && <circle cx="30" cy="72" r="18" fill="#ffee55" opacity="0.2" />}
        </g>
        <g filter={glow("glR", activeBtn === "red")}>
          <circle cx="30" cy="102" r="12" fill={activeBtn === "red" ? "#ff5555" : "#5a2a2a"} />
          <circle cx="30" cy="102" r="8" fill={activeBtn === "red" ? "#ff8888" : "#7a3a3a"} />
          {activeBtn === "red" && <circle cx="30" cy="102" r="18" fill="#ff5555" opacity="0.2" />}
        </g>
      </svg>
    </div>
  );
};

/* ── Speech Bubble ── */
const SpeechBubble = ({ show }) => (
  <div style={{
    position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)",
    background: "rgba(255,255,255,0.94)", borderRadius: 20, padding: "10px 24px",
    fontFamily: "'Quicksand', sans-serif", fontSize: "clamp(11px, 2.5vw, 15px)",
    fontWeight: 600, color: "#4a3a2e", textAlign: "center", lineHeight: 1.5,
    opacity: show ? 1 : 0, transition: "opacity 1s ease", pointerEvents: "none",
    whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  }}>
    Please read me a story<br />to help me fall asleep?
    <div style={{
      position: "absolute", bottom: -10, left: "35%",
      width: 0, height: 0,
      borderLeft: "10px solid transparent", borderRight: "10px solid transparent",
      borderTop: "12px solid rgba(255,255,255,0.94)",
    }} />
  </div>
);

/* ══════════════════════════
   MAIN COMPONENT
   ══════════════════════════ */

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
  const videoRef = useRef(null);
  const phaseIdxRef = useRef(-1);
  const rafRef = useRef(null);

  const activeBtn = state === "running" ? "green" : state === "paused" ? "yellow" : state === "completed" ? "red" : null;
  const remaining = Math.max(0, duration - elapsed);
  const puppyElapsed = state === "idle" ? 0 : state === "completed" ? 9999 : elapsed;

  // Video controller
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (state === "idle") {
      video.pause(); cancelAnimationFrame(rafRef.current);
      video.currentTime = 0; phaseIdxRef.current = -1;
      return;
    }

    if (state === "completed") {
      // Keep playing asleep loop
      const asleep = PHASES[PHASES.length - 1];
      if (phaseIdxRef.current !== PHASES.length - 1) {
        phaseIdxRef.current = PHASES.length - 1;
        video.currentTime = asleep.vStart;
        video.play().catch(() => {});
      }
    }

    const phase = getPhase(puppyElapsed);

    if (phase.index !== phaseIdxRef.current) {
      phaseIdxRef.current = phase.index;
      video.currentTime = phase.vStart;
      if (state === "running" || state === "completed") video.play().catch(() => {});
    }

    // rAF loop check
    const tick = () => {
      const p = PHASES[phaseIdxRef.current];
      if (!p) { rafRef.current = requestAnimationFrame(tick); return; }

      if (video.currentTime >= p.vEnd - 0.1) {
        if (p.loop) {
          video.currentTime = p.vStart;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [puppyElapsed, state]);

  // Pause/resume
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (state === "running" || state === "completed") {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [state]);

  // Timer
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
      phaseIdxRef.current = -1;
      if (videoRef.current) videoRef.current.currentTime = 0;
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
      cancelAnimationFrame(rafRef.current);
    } else if (state === "completed") {
      setState("idle"); setElapsed(0); setShowBubble(false);
      phaseIdxRef.current = -1;
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [state]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #080e1e 0%, #0e1a38 30%, #152347 55%, #1e3a6e 80%, #264a80 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "16px 12px", fontFamily: "'Quicksand', sans-serif", overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Baloo+2:wght@600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatZzz {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 0.7; }
          100% { transform: translateY(-40px) scale(1.3); opacity: 0; }
        }
        .scene-container {
          position: relative; width: 100%; max-width: 540px;
          aspect-ratio: 1 / 1; border-radius: 20px; overflow: hidden;
          background: #0a1428;
        }
        .puppy-layer {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover;
        }
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

      <div className="scene-container">
        <video ref={videoRef} muted playsInline preload="auto" className="puppy-layer">
          <source src="/video/puppy-full.mp4" type="video/mp4" />
        </video>

        {/* Zzz when asleep */}
        {(puppyElapsed > 70 || state === "completed") && (
          <div style={{
            position: "absolute", top: "28%", left: "38%", pointerEvents: "none",
            opacity: state === "completed" ? 1 : Math.min(1, (puppyElapsed - 70) / 10),
            transition: "opacity 3s ease",
          }}>
            <span style={{ position: "absolute", fontSize: "clamp(14px, 3vw, 20px)", color: "#a0c8f0", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, animation: "floatZzz 3s ease-in-out infinite", left: 0, top: 0 }}>Z</span>
            <span style={{ position: "absolute", fontSize: "clamp(11px, 2.2vw, 16px)", color: "#80b0e0", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, animation: "floatZzz 3s ease-in-out 1s infinite", left: 14, top: -6 }}>z</span>
            <span style={{ position: "absolute", fontSize: "clamp(8px, 1.6vw, 12px)", color: "#6898c8", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, animation: "floatZzz 3s ease-in-out 2s infinite", left: 24, top: -12 }}>z</span>
          </div>
        )}

        <LampPost activeBtn={activeBtn} />
        <SpeechBubble show={showBubble} />
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
