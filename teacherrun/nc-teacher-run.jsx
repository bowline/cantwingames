"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const PIXEL_FONT = `var(--font-pixel), "Press Start 2P", monospace`;
const GAME_W = 360;
const GAME_H = 740;
const LANE_COUNT = 3;
const LANE_W = GAME_W / LANE_COUNT;
const PLAYER_Y = 560;
const PLAYER_W = 40;
const PLAYER_H = 52;
const OBSTACLE_W = 80;
const OBSTACLE_H = 64;
const INITIAL_SPEED = 2.0;
const MAX_SPEED = 7;
const SPEED_INCREASE = 0.22;
const SPAWN_INTERVAL_START = 1600;
const SPAWN_INTERVAL_MIN = 400;
const FINISH_LINE_Y = 30;

const OBSTACLES = [
  { id: "paycheck", label: "$58K", sublabel: "PAYCHECK", color: "#4a9e4a", icon: "💵", desc: "NC avg teacher salary" },
  { id: "freeze", label: "PAY", sublabel: "FREEZE", color: "#66bbdd", icon: "🧊", desc: "No raise. Again." },
  { id: "supplies", label: "$1,632", sublabel: "SUPPLIES", color: "#dd8833", icon: "🛒", desc: "Out of your pocket" },
  { id: "insurance", label: "INSURANCE", sublabel: "+40%", color: "#cc4444", icon: "💊", desc: "Premiums tripled for some" },
  { id: "classsize", label: "CLASS", sublabel: "SIZE: 34", color: "#8866bb", icon: "👥", desc: "Good luck with that" },
  { id: "testing", label: "TESTING", sublabel: "WEEK", color: "#aa7744", icon: "📝", desc: "Teach to the test" },
  { id: "voucher", label: "VOUCHER", sublabel: "BILL", color: "#dd6688", icon: "💸", desc: "Money leaves public schools" },
  { id: "nobudget", label: "NO BUDGET", sublabel: "AGAIN", color: "#cc3333", icon: "🛑", desc: "NC has no enacted budget" },
  { id: "colleague", label: "COLLEAGUE", sublabel: "QUIT", color: "#778899", icon: "🚪", desc: "You're covering 6th period" },
  { id: "nosupport", label: "NO SUPPORT", sublabel: "STAFF", color: "#5588aa", icon: "🧠", desc: "1 psych per 1,928 kids" },
  { id: "virginia", label: "EXIT →", sublabel: "VIRGINIA", color: "#44aa66", icon: "🛣️", desc: "They pay more there" },
];

function TeacherSprite({ lane }) {
  const x = lane * LANE_W + LANE_W / 2 - PLAYER_W / 2;
  return (
    <g transform={`translate(${x}, ${PLAYER_Y})`}>
      <ellipse cx={PLAYER_W/2} cy={PLAYER_H + 2} rx={16} ry={4} fill="rgba(0,0,0,0.3)" />
      <rect x={10} y={20} width={20} height={24} fill="#5c8a4c" rx={2} />
      <rect x={12} y={6} width={16} height={16} fill="#f0c090" rx={2} />
      <rect x={12} y={4} width={16} height={8} fill="#6b3a2a" rx={2} />
      <rect x={14} y={12} width={5} height={4} fill="none" stroke="#333" strokeWidth={1} />
      <rect x={21} y={12} width={5} height={4} fill="none" stroke="#333" strokeWidth={1} />
      <line x1={19} y1={14} x2={21} y2={14} stroke="#333" strokeWidth={1} />
      <rect x={6} y={22} width={6} height={4} fill="#f0c090" rx={1} />
      <rect x={28} y={22} width={6} height={4} fill="#f0c090" rx={1} />
      <rect x={29} y={20} width={8} height={10} fill="#cc4444" rx={1} />
      <rect x={30} y={21} width={6} height={8} fill="#eee" />
      <rect x={14} y={42} width={6} height={10} fill="#3a3a5c" rx={1} />
      <rect x={22} y={42} width={6} height={10} fill="#3a3a5c" rx={1} />
      <rect x={12} y={50} width={8} height={4} fill="#4a3a2a" rx={1} />
      <rect x={22} y={50} width={8} height={4} fill="#4a3a2a" rx={1} />
      <circle cx={20} cy={3} r={4} fill="#cc3333" />
      <line x1={20} y1={0} x2={21} y2={-2} stroke="#3a5a2a" strokeWidth={1.5} />
    </g>
  );
}

function ObstacleSprite({ obstacle }) {
  const { x, y, data } = obstacle;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={0} y={0} width={OBSTACLE_W} height={OBSTACLE_H} fill={data.color} rx={4} stroke="#000" strokeWidth={2} />
      <rect x={3} y={3} width={OBSTACLE_W - 6} height={OBSTACLE_H - 6} fill="rgba(0,0,0,0.3)" rx={2} />
      <text x={OBSTACLE_W/2} y={24} textAnchor="middle" fontSize="18">{data.icon}</text>
      <text x={OBSTACLE_W/2} y={40} textAnchor="middle" fontSize="7" fill="#fff" fontFamily={PIXEL_FONT}>{data.label}</text>
      <text x={OBSTACLE_W/2} y={52} textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.8)" fontFamily={PIXEL_FONT}>{data.sublabel}</text>
    </g>
  );
}

function HallwayFloor({ offset }) {
  const tiles = [];
  const tileH = 48;
  const startY = -(offset % tileH);
  for (let y = startY; y < GAME_H + tileH; y += tileH) {
    for (let lane = 0; lane < LANE_COUNT; lane++) {
      const x = lane * LANE_W;
      const alt = (Math.floor((y + offset) / tileH) + lane) % 2 === 0;
      tiles.push(
        <rect key={`${lane}-${y}`} x={x + 2} y={y} width={LANE_W - 4} height={tileH}
          fill={alt ? "#3a3a4a" : "#32323f"} stroke="#2a2a35" strokeWidth={1} />
      );
    }
  }
  return <g>{tiles}</g>;
}

function FinishLine({ pulse }) {
  const segments = 24;
  const segW = GAME_W / segments;
  return (
    <g opacity={0.5 + Math.sin(pulse * 0.05) * 0.2}>
      {Array.from({ length: segments }).map((_, i) => (
        <rect key={i} x={i * segW} y={FINISH_LINE_Y} width={segW} height={8}
          fill={i % 2 === 0 ? "#fff" : "#222"} />
      ))}
      <text x={GAME_W / 2} y={FINISH_LINE_Y - 4} textAnchor="middle" fontSize="7" fill="#ffcc44" fontFamily={PIXEL_FONT}
        stroke="#000" strokeWidth={2} paintOrder="stroke">
        ▲ $72K NATIONAL AVG ▲
      </text>
    </g>
  );
}

function Scanlines() {
  return (
    <g opacity={0.08}>
      {Array.from({ length: Math.ceil(GAME_H / 3) }).map((_, i) => (
        <line key={i} x1={0} y1={i * 3} x2={GAME_W} y2={i * 3} stroke="#000" strokeWidth={1} />
      ))}
    </g>
  );
}

function Lockers({ offset }) {
  const lockerH = 80;
  const startY = -(offset % lockerH);
  const lockers = [];
  for (let y = startY; y < GAME_H + lockerH; y += lockerH) {
    lockers.push(
      <g key={`l-${y}`}>
        <rect x={-16} y={y} width={18} height={lockerH - 2} fill="#556677" stroke="#445566" strokeWidth={1} />
        <rect x={-14} y={y + 4} width={14} height={lockerH - 10} fill="#4a5a6a" rx={1} />
        <circle cx={-4} cy={y + lockerH/2} r={2} fill="#889" />
      </g>
    );
    lockers.push(
      <g key={`r-${y}`}>
        <rect x={GAME_W - 2} y={y} width={18} height={lockerH - 2} fill="#556677" stroke="#445566" strokeWidth={1} />
        <rect x={GAME_W} y={y + 4} width={14} height={lockerH - 10} fill="#4a5a6a" rx={1} />
        <circle cx={GAME_W + 10} cy={y + lockerH/2} r={2} fill="#889" />
      </g>
    );
  }
  return <g>{lockers}</g>;
}

function HUD({ seconds, speed }) {
  return (
    <g>
      <rect x={0} y={0} width={GAME_W} height={22} fill="rgba(0,0,0,0.85)" />
      <text x={8} y={15} fontSize="7" fill="#ff8866" fontFamily={PIXEL_FONT}>TIME: {seconds.toFixed(1)}s</text>
      <text x={GAME_W - 8} y={15} textAnchor="end" fontSize="6" fill="#888" fontFamily={PIXEL_FONT}>SPEED: {speed.toFixed(1)}x</text>
      <rect x={0} y={GAME_H - 22} width={GAME_W} height={22} fill="rgba(0,0,0,0.85)" />
      <text x={GAME_W / 2} y={GAME_H - 7} textAnchor="middle" fontSize="6" fill="#ff6644" fontFamily={PIXEL_FONT}>
        NC TEACHER PAY RANK: 43RD IN THE NATION
      </text>
    </g>
  );
}

// ============================================================
// TITLE SCREEN — 4 sections
// ============================================================
function TitleScreen({ onStart }) {
  const [blink, setBlink] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let raf;
    const tick = () => {
      setScrollOffset(prev => prev + 0.3);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cardW = 120;
  const cardGap = 10;
  const stripW = OBSTACLES.length * (cardW + cardGap);

  return (
    <div style={{
      width: "100%", maxWidth: `${GAME_W}px`, margin: "0 auto",
      background: "#1a1a2e", overflow: "hidden",
    }}>
      <svg viewBox={`0 0 ${GAME_W} ${GAME_H}`} style={{ width: "100%", display: "block" }}>
        <rect width={GAME_W} height={GAME_H} fill="#1a1a2e" />

        {/* === SECTION 1: TITLE BAR === */}
        <rect x={0} y={0} width={GAME_W} height={60} fill="rgba(0,0,0,0.5)" />
        <text x={GAME_W/2} y={32} textAnchor="middle" fontSize="15" fill="#ffcc44" fontFamily={PIXEL_FONT}
          stroke="#000" strokeWidth={2} paintOrder="stroke">
          NC TEACHER RUN
        </text>
        <text x={GAME_W/2} y={52} textAnchor="middle" fontSize="5" fill="#778" fontFamily={PIXEL_FONT}>
          AN ENDLESS RUNNER WITH NO GOOD ENDING
        </text>

        {/* === SECTION 2: YOU → GOAL === */}
        <rect x={0} y={70} width={GAME_W} height={235} fill="rgba(255,255,255,0.02)" />

        {/* Left: Teacher face + YOU */}
        <g transform="translate(16, 100)">
          <rect x={10} y={0} width={90} height={90} fill="#2a2a3e" rx={6} stroke="#555" strokeWidth={1} />
          <rect x={30} y={10} width={50} height={50} fill="#f0c090" rx={6} />
          <rect x={30} y={4} width={50} height={24} fill="#6b3a2a" rx={6} />
          <rect x={37} y={32} width={14} height={10} fill="none" stroke="#333" strokeWidth={2} rx={2} />
          <rect x={55} y={32} width={14} height={10} fill="none" stroke="#333" strokeWidth={2} rx={2} />
          <line x1={51} y1={37} x2={55} y2={37} stroke="#333" strokeWidth={2} />
          <path d="M44,50 Q55,57 66,50" fill="none" stroke="#8a6040" strokeWidth={2} />
          <circle cx={55} cy={4} r={8} fill="#cc3333" />
          <line x1={55} y1={-3} x2={57} y2={-7} stroke="#3a5a2a" strokeWidth={2} />

          <text x={55} y={110} textAnchor="middle" fontSize="14" fill="#fff" fontFamily={PIXEL_FONT}>YOU</text>
          <text x={55} y={128} textAnchor="middle" fontSize="5.5" fill="#aaa" fontFamily={PIXEL_FONT}>NC TEACHER</text>
          <text x={55} y={142} textAnchor="middle" fontSize="5.5" fill="#ff8866" fontFamily={PIXEL_FONT}>$58K/YR</text>
        </g>

        {/* Arrow */}
        <text x={156} y={155} textAnchor="middle" fontSize="20" fill="#ffcc44" fontFamily={PIXEL_FONT}>→</text>

        {/* Right: The goal */}
        <g transform={`translate(${GAME_W/2 + 16}, 100)`}>
          <rect x={0} y={0} width={140} height={90} fill="rgba(255,204,68,0.06)" rx={6}
            stroke="#ffcc44" strokeWidth={1} strokeDasharray="4,3" />
          {Array.from({ length: 17 }).map((_, i) => (
            <rect key={i} x={5 + i * 8} y={8} width={7} height={5}
              fill={i % 2 === 0 ? "#ffcc44" : "#333"} opacity={0.5} />
          ))}
          <text x={70} y={38} textAnchor="middle" fontSize="7" fill="#ffcc44" fontFamily={PIXEL_FONT}>TEACH KIDS</text>
          <text x={70} y={55} textAnchor="middle" fontSize="7" fill="#ffcc44" fontFamily={PIXEL_FONT}>AND AFFORD</text>
          <text x={70} y={72} textAnchor="middle" fontSize="7" fill="#ffcc44" fontFamily={PIXEL_FONT}>TO LIVE.</text>

          <text x={70} y={112} textAnchor="middle" fontSize="12" fill="#ff8866" fontFamily={PIXEL_FONT}>FINISH LINE</text>
          <text x={70} y={128} textAnchor="middle" fontSize="5" fill="#ff6644" fontFamily={PIXEL_FONT}>NEVER GETS CLOSER</text>
        </g>

        {/* === SECTION 3: START === */}
        <rect x={0} y={310} width={GAME_W} height={85} fill="rgba(0,0,0,0.4)" />
        <text x={GAME_W/2} y={332} textAnchor="middle" fontSize="6" fill="#aaa" fontFamily={PIXEL_FONT}>
          TAP LEFT OR RIGHT TO DODGE
        </text>

        <g cursor="pointer" onClick={onStart}>
          <rect x={50} y={343} width={GAME_W - 100} height={40} rx={4}
            fill={blink ? "#dd6644" : "#cc5533"} stroke="#ffcc44" strokeWidth={1} />
          <text x={GAME_W/2} y={369} textAnchor="middle" fontSize="12" fill="#fff" fontFamily={PIXEL_FONT}>
            TAP TO START
          </text>
        </g>

        {/* === SECTION 4: SCROLLING OBSTACLES === */}
        <rect x={0} y={400} width={GAME_W} height={GAME_H - 400} fill="rgba(0,0,0,0.3)" />
        <text x={GAME_W/2} y={422} textAnchor="middle" fontSize="9" fill="#ffcc44" fontFamily={PIXEL_FONT}>
          WHAT YOU'RE UP AGAINST:
        </text>

        <defs>
          <clipPath id="obsClip"><rect x={0} y={432} width={GAME_W} height={170} /></clipPath>
          <linearGradient id="fadeL" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#1a1a2e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fadeR" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#1a1a2e" stopOpacity="0" />
            <stop offset="100%" stopColor="#1a1a2e" />
          </linearGradient>
        </defs>

        <g clipPath="url(#obsClip)">
          {[...OBSTACLES, ...OBSTACLES].map((obs, i) => {
            let ox = i * (cardW + cardGap) - (scrollOffset % stripW);
            if (ox < -cardW - cardGap) ox += stripW * 2;
            if (ox < -(cardW + 10) || ox > GAME_W + 10) return null;
            return (
              <g key={`${obs.id}-${i}`} transform={`translate(${ox}, 438)`}>
                <rect x={0} y={0} width={cardW} height={150} fill={obs.color} rx={6}
                  stroke="#000" strokeWidth={2} opacity={0.9} />
                <rect x={3} y={3} width={cardW - 6} height={144} fill="rgba(0,0,0,0.3)" rx={4} />
                <text x={cardW/2} y={42} textAnchor="middle" fontSize="34">{obs.icon}</text>
                <text x={cardW/2} y={72} textAnchor="middle" fontSize="10" fill="#fff" fontFamily={PIXEL_FONT}>{obs.label}</text>
                <text x={cardW/2} y={90} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.8)" fontFamily={PIXEL_FONT}>{obs.sublabel}</text>
                <text textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.65)" fontFamily={PIXEL_FONT}>
                  {obs.desc.split(' ').reduce((lines, word) => {
                    const last = lines[lines.length - 1];
                    if (last && (last + ' ' + word).length <= 18) { lines[lines.length - 1] = last + ' ' + word; }
                    else { lines.push(word); }
                    return lines;
                  }, []).map((line, li) => (
                    <tspan key={li} x={cardW/2} y={110 + li * 14}>{line}</tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </g>

        <rect x={0} y={432} width={35} height={170} fill="url(#fadeL)" />
        <rect x={GAME_W - 35} y={432} width={35} height={170} fill="url(#fadeR)" />

        <text x={GAME_W/2} y={613} textAnchor="middle" fontSize="5" fill="#445" fontFamily={PIXEL_FONT}>
          10,000+ NC TEACHERS HAD TO LEAVE IN 2023
        </text>
        <text x={GAME_W/2} y={625} textAnchor="middle" fontSize="4.5" fill="#334" fontFamily={PIXEL_FONT}>
          SOURCES: NCAE · NC DPI · NEA · NCFORUM
        </text>

        <a href="https://secure.actblue.com/donate/andybowline" target="_blank" rel="noopener noreferrer">
          <g cursor="pointer">
            <rect x={GAME_W/2 - 135} y={635} width={270} height={38} rx={3}
              fill="#1a3a1a" stroke="#3a6a3a" strokeWidth={1.5} />
            <text x={GAME_W/2} y={650} textAnchor="middle" fontSize="5" fill="#88dd88" fontFamily={PIXEL_FONT}>
              NC WON'T PAY TEACHERS. YOU CAN PAY IT FORWARD.
            </text>
            <text x={GAME_W/2} y={665} textAnchor="middle" fontSize="7" fill="#44ff44" fontFamily={PIXEL_FONT}>
              CHIP IN $5 →
            </text>
          </g>
        </a>

        <Scanlines />
      </svg>
    </div>
  );
}

// ============================================================
// GAME OVER SCREEN — bigger text, featured killer
// ============================================================
function GameOverScreen({ seconds, hitBy, onRestart, onShare }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => setPhase(3), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{
      width: "100%", maxWidth: `${GAME_W}px`, margin: "0 auto",
      background: "#1a1a2e", overflow: "hidden",
    }}>
      <svg viewBox={`0 0 ${GAME_W} ${GAME_H}`} style={{ width: "100%", display: "block" }}>
        <rect width={GAME_W} height={GAME_H} fill="#1a1a2e" />

        <text x={GAME_W/2} y={65} textAnchor="middle" fontSize="24" fill="#ff4444" fontFamily={PIXEL_FONT}
          stroke="#000" strokeWidth={3} paintOrder="stroke">GAME OVER</text>

        {phase >= 1 && (
          <g>
            <text x={GAME_W/2} y={120} textAnchor="middle" fontSize="10" fill="#ffcc44" fontFamily={PIXEL_FONT}>YOU LASTED</text>
            <text x={GAME_W/2} y={155} textAnchor="middle" fontSize="26" fill="#fff" fontFamily={PIXEL_FONT}>{seconds.toFixed(1)}s</text>

            {hitBy && (
              <g>
                <rect x={35} y={175} width={GAME_W - 70} height={90} fill={hitBy.color} rx={6}
                  stroke="#000" strokeWidth={2} opacity={0.9} />
                <rect x={38} y={178} width={GAME_W - 76} height={84} fill="rgba(0,0,0,0.3)" rx={4} />
                <text x={GAME_W/2} y={198} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.7)" fontFamily={PIXEL_FONT}>
                  TAKEN OUT BY:
                </text>
                <text x={GAME_W/2 - 25} y={230} textAnchor="middle" fontSize="30">{hitBy.icon}</text>
                <text x={GAME_W/2 + 35} y={220} textAnchor="middle" fontSize="11" fill="#fff" fontFamily={PIXEL_FONT}>{hitBy.label}</text>
                <text x={GAME_W/2 + 35} y={238} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.8)" fontFamily={PIXEL_FONT}>{hitBy.sublabel}</text>
                <text x={GAME_W/2} y={258} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.6)" fontFamily={PIXEL_FONT}>{hitBy.desc}</text>
              </g>
            )}
          </g>
        )}

        {phase >= 2 && (
          <g>
            <rect x={30} y={295} width={GAME_W - 60} height={88} fill="rgba(255,255,255,0.05)" rx={4} stroke="#444" strokeWidth={1} />
            <text x={GAME_W/2} y={321} textAnchor="middle" fontSize="8" fill="#ff8866" fontFamily={PIXEL_FONT}>1 IN 10 NC TEACHERS</text>
            <text x={GAME_W/2} y={339} textAnchor="middle" fontSize="8" fill="#ff8866" fontFamily={PIXEL_FONT}>HAD TO LEAVE LAST YEAR.</text>
            <text x={GAME_W/2} y={363} textAnchor="middle" fontSize="6" fill="#888" fontFamily={PIXEL_FONT}>NC RANKS 43RD IN TEACHER PAY.</text>
            <text x={GAME_W/2} y={378} textAnchor="middle" fontSize="6" fill="#ffcc44" fontFamily={PIXEL_FONT}>$72K ISN'T THE GOAL. IT'S THE START.</text>
          </g>
        )}

        {phase >= 3 && (
          <g>
            <a href="https://andycantwin.com" target="_blank" rel="noopener noreferrer">
              <rect x={30} y={423} width={GAME_W - 60} height={55} fill="#2a3a2a" rx={4} stroke="#4a6a4a" strokeWidth={1} cursor="pointer" />
              <text x={GAME_W/2} y={445} textAnchor="middle" fontSize="10" fill="#ffcc44" fontFamily={PIXEL_FONT}>ANDY BOWLINE</text>
              <text x={GAME_W/2} y={461} textAnchor="middle" fontSize="6" fill="#88aa88" fontFamily={PIXEL_FONT}>NC SENATE · DISTRICT 31</text>
              <text x={GAME_W/2} y={474} textAnchor="middle" fontSize="7" fill="#ff9966" fontFamily={PIXEL_FONT}>CAN'T WIN. YET.</text>
            </a>

            <g cursor="pointer" onClick={onShare}>
              <rect x={30} y={493} width={(GAME_W - 70) / 2} height={40} fill="#444" rx={4} />
              <text x={30 + (GAME_W - 70) / 4} y={518} textAnchor="middle" fontSize="9" fill="#fff" fontFamily={PIXEL_FONT}>SHARE</text>
            </g>
            <g cursor="pointer" onClick={onRestart}>
              <rect x={GAME_W/2 + 5} y={493} width={(GAME_W - 70) / 2} height={40} fill="#444" rx={4} />
              <text x={GAME_W/2 + 5 + (GAME_W - 70) / 4} y={518} textAnchor="middle" fontSize="8" fill="#fff" fontFamily={PIXEL_FONT}>TRY AGAIN</text>
            </g>

            <a href="https://secure.actblue.com/donate/andybowline" target="_blank" rel="noopener noreferrer">
              <rect x={30} y={547} width={GAME_W - 60} height={42} fill="#1a6b3c" rx={4} cursor="pointer" />
              <text x={GAME_W/2} y={573} textAnchor="middle" fontSize="7" fill="#fff" fontFamily={PIXEL_FONT}>CHIP IN $10. LET'S FIX THIS.</text>
            </a>

            <text x={GAME_W/2} y={615} textAnchor="middle" fontSize="4.5" fill="#445" fontFamily={PIXEL_FONT}>SOURCES: NCAE · NC DPI · NEA · NCFORUM</text>
            <text x={GAME_W/2} y={630} textAnchor="middle" fontSize="4.5" fill="#445" fontFamily={PIXEL_FONT}>COUPONBIRDS · REASON FOUNDATION 2025</text>
          </g>
        )}

        <Scanlines />
      </svg>
    </div>
  );
}

// ============================================================
// MAIN GAME
// ============================================================
export default function NCTeacherRun() {
  const [screen, setScreen] = useState("title");
  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [floorOffset, setFloorOffset] = useState(0);
  const [hitBy, setHitBy] = useState(null);
  const [finishPulse, setFinishPulse] = useState(0);
  const [laneTransition, setLaneTransition] = useState(false);

  const gameLoop = useRef(null);
  const lastSpawn = useRef(0);
  const touchStart = useRef(null);
  const playerLaneRef = useRef(1);
  const obstaclesRef = useRef([]);
  const speedRef = useRef(INITIAL_SPEED);
  const frameCount = useRef(0);
  const startTime = useRef(0);

  useEffect(() => { playerLaneRef.current = playerLane; }, [playerLane]);
  useEffect(() => { obstaclesRef.current = obstacles; }, [obstacles]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const spawnObstacle = useCallback((elapsed) => {
    const available = [...OBSTACLES];
    let blockCount = 1;
    if (elapsed > 15 && Math.random() < 0.4) blockCount = 3;
    else if (elapsed > 8 && Math.random() < 0.5) blockCount = 2;
    else if (elapsed > 3 && Math.random() < 0.35) blockCount = 2;

    const lanesCopy = [0, 1, 2];
    const blocked = [];
    // Force middle lane in first few spawns so player has to move
    if (elapsed < 2.5 && Math.random() < 0.7) {
      blocked.push(1);
    } else {
      for (let i = 0; i < blockCount; i++) {
        const idx = Math.floor(Math.random() * lanesCopy.length);
        blocked.push(lanesCopy.splice(idx, 1)[0]);
      }
    }

    return blocked.map(lane => {
      const dataIdx = Math.floor(Math.random() * available.length);
      const data = available.splice(dataIdx, 1)[0] || OBSTACLES[0];
      return { id: Math.random(), lane, x: lane * LANE_W + LANE_W / 2 - OBSTACLE_W / 2, y: -OBSTACLE_H - 20, data };
    });
  }, []);

  const endGame = useCallback((obstacle) => {
    if (gameLoop.current) { cancelAnimationFrame(gameLoop.current); gameLoop.current = null; }
    setHitBy(obstacle?.data || null);
    setScreen("gameover");
  }, []);

  const startGame = useCallback(() => {
    setScreen("playing");
    setPlayerLane(1); playerLaneRef.current = 1;
    setObstacles([]); obstaclesRef.current = [];
    setSeconds(0); setSpeed(INITIAL_SPEED); speedRef.current = INITIAL_SPEED;
    setFloorOffset(0); setHitBy(null); setFinishPulse(0);
    lastSpawn.current = 0; frameCount.current = 0; startTime.current = Date.now();
  }, []);

  useEffect(() => {
    if (screen !== "playing") return;
    let lastTime = Date.now();
    const tick = () => {
      const now = Date.now();
      lastTime = now;
      frameCount.current++;
      const elapsed = (now - startTime.current) / 1000;
      setSeconds(elapsed);
      const newSpeed = Math.min(INITIAL_SPEED + elapsed * SPEED_INCREASE, MAX_SPEED);
      setSpeed(newSpeed); speedRef.current = newSpeed;
      setFloorOffset(prev => prev + newSpeed * 2.5);
      setFinishPulse(prev => prev + 1);

      const spawnInterval = Math.max(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_START - elapsed * 80);
      if (now - lastSpawn.current > spawnInterval) {
        const newObs = spawnObstacle(elapsed);
        setObstacles(prev => [...prev, ...newObs]);
        lastSpawn.current = now;
      }

      setObstacles(prev => {
        const updated = prev.map(o => ({ ...o, y: o.y + newSpeed * 2.5 })).filter(o => o.y < GAME_H + 50);
        const pLane = playerLaneRef.current;
        const pLeft = pLane * LANE_W + LANE_W / 2 - PLAYER_W / 2 + 8;
        const pRight = pLeft + PLAYER_W - 16;
        const pTop = PLAYER_Y + 8;
        const pBottom = PLAYER_Y + PLAYER_H - 4;
        for (const o of updated) {
          const oLeft = o.x + 6; const oRight = o.x + OBSTACLE_W - 6;
          const oTop = o.y + 4; const oBottom = o.y + OBSTACLE_H - 4;
          if (pRight > oLeft && pLeft < oRight && pBottom > oTop && pTop < oBottom) { endGame(o); return updated; }
        }
        return updated;
      });
      gameLoop.current = requestAnimationFrame(tick);
    };
    gameLoop.current = requestAnimationFrame(tick);
    return () => { if (gameLoop.current) cancelAnimationFrame(gameLoop.current); };
  }, [screen, spawnObstacle, endGame]);

  useEffect(() => {
    if (screen !== "playing") return;
    const handleKey = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") {
        setPlayerLane(l => { const n = Math.max(0, l - 1); playerLaneRef.current = n; return n; });
        setLaneTransition(true); setTimeout(() => setLaneTransition(false), 120);
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        setPlayerLane(l => { const n = Math.min(2, l + 1); playerLaneRef.current = n; return n; });
        setLaneTransition(true); setTimeout(() => setLaneTransition(false), 120);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [screen]);

  const handleTouchStart = useCallback((e) => {
    if (screen !== "playing") return;
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, [screen]);

  const handleTouchMove = useCallback((e) => {
    if (screen === "playing") e.preventDefault();
  }, [screen]);

  const handleTouchEnd = useCallback((e) => {
    if (screen !== "playing" || !touchStart.current) return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.time;
    if (Math.abs(dx) > 15 && Math.abs(dx) > Math.abs(dy) * 0.7 && dt < 800) {
      if (dx < 0) setPlayerLane(l => { const n = Math.max(0, l - 1); playerLaneRef.current = n; return n; });
      else setPlayerLane(l => { const n = Math.min(2, l + 1); playerLaneRef.current = n; return n; });
      setLaneTransition(true); setTimeout(() => setLaneTransition(false), 120);
    } else if (dt < 400) {
      const rect = e.currentTarget.getBoundingClientRect();
      const tapX = touch.clientX - rect.left;
      if (tapX < rect.width / 2) setPlayerLane(l => { const n = Math.max(0, l - 1); playerLaneRef.current = n; return n; });
      else setPlayerLane(l => { const n = Math.min(2, l + 1); playerLaneRef.current = n; return n; });
      setLaneTransition(true); setTimeout(() => setLaneTransition(false), 120);
    }
    touchStart.current = null;
  }, [screen]);

  const handleShare = useCallback(async () => {
    const url = "https://games.andycantwin.com/teacherrun";
    const text = `I tried being an NC teacher for ${seconds.toFixed(1)} seconds. Didn't make it.\n\n1 in 10 NC teachers had to leave last year.\n\nPlay "NC Teacher Run":`;
    if (navigator.share) {
      try { await navigator.share({ title: "NC Teacher Run", text, url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert("Link copied to clipboard!");
    } catch {
      prompt("Copy this link to share:", url);
    }
  }, [seconds]);

  return (
    <div style={{
      width: "100%", maxWidth: `${GAME_W}px`, margin: "0 auto",
      fontFamily: PIXEL_FONT, userSelect: "none", WebkitUserSelect: "none",
    }}>

      {screen === "title" && <TitleScreen onStart={startGame} />}

      {screen === "playing" && (
        <div
          style={{ width: "100%", position: "relative", overflow: "hidden", cursor: "default", touchAction: "none" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <svg viewBox={`0 0 ${GAME_W} ${GAME_H}`} style={{ width: "100%", display: "block", background: "#1a1a2e" }}>
            <HallwayFloor offset={floorOffset} />
            <Lockers offset={floorOffset * 0.8} />
            {[1, 2].map(i => (
              <line key={i} x1={i * LANE_W} y1={0} x2={i * LANE_W} y2={GAME_H}
                stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="8,12" />
            ))}
            <FinishLine pulse={finishPulse} />
            {obstacles.map(o => <ObstacleSprite key={o.id} obstacle={o} />)}
            <g style={{ transition: laneTransition ? "transform 0.1s ease-out" : "none" }}>
              <TeacherSprite lane={playerLane} />
            </g>
            <HUD seconds={seconds} speed={speed} />
            <Scanlines />
            <defs>
              <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
                <stop offset="60%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
              </radialGradient>
            </defs>
            <rect width={GAME_W} height={GAME_H} fill="url(#vignette)" />
          </svg>
        </div>
      )}

      {screen === "gameover" && (
        <GameOverScreen seconds={seconds} hitBy={hitBy} onRestart={() => setScreen("title")} onShare={handleShare} />
      )}
    </div>
  );
}
