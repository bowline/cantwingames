"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const PIXEL_FONT = `var(--font-pixel), "Press Start 2P", monospace`;

const W = 360;
const H = 740;

// Timeline milestones
// 0-17s covers 1994-2026 (fast), 17-25s covers 2026-2030 (slow)
const MILESTONES = [
  { year: 1994, label: "5 DISTRICTS SUE NC", time: 0 },
  { year: 1997, label: "COURT: STATE MUST FUND", time: 2.5 },
  { year: 2004, label: "COURT: STILL FAILING", time: 5.5 },
  { year: 2021, label: "JUDGE ORDERS $1.75B", time: 11 },
  { year: 2022, label: "COURT FLIPS. 'REHEARING.'", time: 13 },
  { year: 2025, label: "NOTHING. STILL WAITING.", time: 15.5 },
  { year: 2026, label: "EARLS ELECTION", time: 17 },
  { year: 2030, label: "FLIP THE COURT", time: 25 },
];

// Speech bubble dialogue — alternates between Legislature and Court
const DIALOGUE = [
  { speaker: "leg", text: "WE'RE WAITING ON THE COURTS." },
  { speaker: "court", text: "WE'RE WAITING ON THE LEGISLATURE." },
  { speaker: "leg", text: "THE COURTS NEED TO ACT FIRST." },
  { speaker: "court", text: "THE LEGISLATURE NEEDS TO ACT FIRST." },
  { speaker: "leg", text: "WE CAN'T DO ANYTHING YET." },
  { speaker: "court", text: "WE'RE STILL REVIEWING." },
  { speaker: "leg", text: "IT'S A COURT MATTER." },
  { speaker: "court", text: "IT'S A LEGISLATIVE MATTER." },
  { speaker: "leg", text: "WE'RE LOOKING INTO IT." },
  { speaker: "court", text: "WE'LL GET TO IT." },
];

// How much Forsyth "should have" by now — ticks up over the 30s
const FORSYTH_OWED_MAX = 100; // $100M

// Rock config
const ROCK_TOP = 100; // where money sits
const ROCK_BOTTOM = 520; // where player chips from
const TOTAL_ROCK = ROCK_BOTTOM - ROCK_TOP;
const INITIAL_TUNNEL = 40; // pre-dug starting tunnel (player starts partway in)
// Tool configs — hands and hammer are both slow; only excavator breaks through
const TOOLS = {
  hands: { chipSize: 1, label: "BARE HANDS", color: "#aa8866" },
  hammer: { chipSize: 2, label: "ANITA EARLS HAMMER", color: "#44aaff" },
  excavator: { chipSize: 60, label: "FLIP THE COURT DIGGER", color: "#ffaa44" },
};

// Phase timing
const PHASE2_TIME = 17; // hammer available (2026 — Earls election)
const PHASE3_TIME = 25; // digger available (2030 — flip the court)
const GAME_END_TIME = 32; // total game length

// Water / drowning config
const WATER_START_TIME = 3; // water starts rising after 3s
const DROWN_TIME_HANDS = 24; // drown at 24s if declined hammer (before digger at 25)
const DROWN_TIME_HAMMER = 31; // drown at 31s if declined digger (before game ends)

function Scanlines() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        pointerEvents: "none",
        zIndex: 100,
      }}
    />
  );
}

function Vignette() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
        pointerEvents: "none",
        zIndex: 99,
      }}
    />
  );
}

// Pixel art pickaxe hand cursor for bare hands
function PixelHands({ x, y }) {
  return (
    <g transform={`translate(${x - 12}, ${y - 12})`}>
      {/* Simple pixel fist */}
      <rect x={4} y={4} width={6} height={6} fill="#ddaa77" />
      <rect x={10} y={4} width={6} height={6} fill="#cc9966" />
      <rect x={4} y={10} width={6} height={6} fill="#cc9966" />
      <rect x={10} y={10} width={6} height={6} fill="#bb8855" />
      <rect x={16} y={8} width={4} height={4} fill="#ddaa77" />
    </g>
  );
}

// Pixel hammer tool
function PixelHammer({ x, y }) {
  return (
    <g transform={`translate(${x - 14}, ${y - 18})`}>
      {/* Handle */}
      <rect x={12} y={12} width={4} height={20} fill="#886644" />
      {/* Head */}
      <rect x={4} y={4} width={20} height={10} fill="#6688cc" />
      <rect x={6} y={6} width={16} height={6} fill="#88aaee" />
    </g>
  );
}

// Pixel excavator tool
function PixelExcavator({ x, y }) {
  return (
    <g transform={`translate(${x - 16}, ${y - 20})`}>
      {/* Body */}
      <rect x={8} y={16} width={16} height={12} fill="#cc8822" />
      <rect x={10} y={18} width={12} height={8} fill="#ddaa44" />
      {/* Arm */}
      <rect x={4} y={4} width={6} height={16} fill="#aa7722" />
      {/* Bucket */}
      <rect x={0} y={0} width={14} height={8} fill="#cc8822" />
      <rect x={2} y={2} width={10} height={4} fill="#ddaa44" />
      {/* Treads */}
      <rect x={6} y={28} width={20} height={4} fill="#555555" />
    </g>
  );
}

// Particle effect
function Particle({ x, y, vx, vy, size, color, opacity }) {
  return (
    <rect
      x={x}
      y={y}
      width={size}
      height={size}
      fill={color}
      opacity={opacity}
    />
  );
}

// Speech bubble
function SpeechBubble({ x, y, text, speaker, opacity }) {
  const isLeg = speaker === "leg";
  const bgColor = isLeg ? "#2a2244" : "#1a2a3a";
  const borderColor = isLeg ? "#6644aa" : "#4488aa";
  const labelColor = isLeg ? "#aa88dd" : "#88bbdd";
  const label = isLeg ? "LEGISLATURE" : "COURT";
  const textWidth = Math.min(text.length * 5.5 + 16, 200);

  return (
    <g opacity={opacity}>
      <rect
        x={x - textWidth / 2}
        y={y - 12}
        width={textWidth}
        height={28}
        rx={4}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y - 2}
        textAnchor="middle"
        fontSize="4.5"
        fill={labelColor}
        fontFamily={PIXEL_FONT}
        letterSpacing="1"
      >
        {label}
      </text>
      <text
        x={x}
        y={y + 10}
        textAnchor="middle"
        fontSize="5"
        fill="#ddddee"
        fontFamily={PIXEL_FONT}
      >
        {text}
      </text>
      {/* Tail */}
      <polygon
        points={`${x - 4},${y + 16} ${x + 4},${y + 16} ${x + (isLeg ? -8 : 8)},${y + 24}`}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={1}
      />
    </g>
  );
}

// Big money bag at top
function MoneyBag({ y }) {
  const cx = W / 2;
  return (
    <g>
      {/* Glow */}
      <ellipse cx={cx} cy={y + 20} rx={50} ry={30} fill="#ffdd44" opacity={0.06} />
      <ellipse cx={cx} cy={y + 20} rx={35} ry={22} fill="#ffdd44" opacity={0.1} />
      {/* Bag body */}
      <ellipse cx={cx} cy={y + 24} rx={28} ry={22} fill="#cc9922" />
      <ellipse cx={cx} cy={y + 24} rx={26} ry={20} fill="#ddaa33" />
      {/* Bag neck / tie */}
      <rect x={cx - 10} y={y + 2} width={20} height={8} fill="#bb8822" rx={2} />
      <rect x={cx - 6} y={y + 4} width={12} height={4} fill="#997711" rx={1} />
      {/* Bag top puff */}
      <ellipse cx={cx} cy={y} rx={14} ry={8} fill="#ddaa33" />
      <ellipse cx={cx} cy={y - 1} rx={12} ry={6} fill="#eebb44" />
      {/* $ on bag */}
      <text x={cx} y={y + 30} textAnchor="middle" fontSize="16" fill="#886611" fontFamily={PIXEL_FONT} fontWeight="bold">
        $5B
      </text>
      {/* Highlight */}
      <ellipse cx={cx - 8} cy={y + 16} rx={4} ry={8} fill="#eedd66" opacity={0.3} />
    </g>
  );
}

// Pixel student character
function PixelStudent({ x, y, waterAbove }) {
  // waterAbove = how much water is above the student's feet
  const submerged = waterAbove > 0;
  const headUnder = waterAbove > 18;
  return (
    <g transform={`translate(${x - 6}, ${y - 22})`}>
      {/* Body */}
      <rect x={2} y={8} width={8} height={14} fill={submerged ? "#446688" : "#4488cc"} rx={1} />
      {/* Head */}
      <rect x={1} y={0} width={10} height={8} fill={headUnder ? "#668899" : "#ffcc88"} rx={2} />
      {/* Eyes */}
      {!headUnder && (
        <>
          <rect x={3} y={3} width={2} height={2} fill="#222" />
          <rect x={7} y={3} width={2} height={2} fill="#222" />
        </>
      )}
      {headUnder && (
        <>
          <rect x={3} y={3} width={2} height={1} fill="#222" />
          <rect x={7} y={3} width={2} height={1} fill="#222" />
          {/* Bubbles */}
          <circle cx={6} cy={-4} r={1.5} fill="rgba(100,180,255,0.6)" />
          <circle cx={9} cy={-8} r={1} fill="rgba(100,180,255,0.4)" />
        </>
      )}
      {/* Backpack */}
      <rect x={9} y={9} width={4} height={8} fill={submerged ? "#335566" : "#cc6644"} rx={1} />
      {/* Label */}
      <text x={6} y={30} textAnchor="middle" fontSize="4" fill={submerged ? "#6699bb" : "#88bbdd"} fontFamily={PIXEL_FONT}>
        STUDENT
      </text>
    </g>
  );
}

// Water rising in the tunnel
function WaterLevel({ waterHeight, tunnelX, tunnelW, tunnelBottom }) {
  if (waterHeight <= 0) return null;
  const waterTop = tunnelBottom - waterHeight;
  return (
    <g>
      {/* Water body */}
      <rect
        x={tunnelX}
        y={waterTop}
        width={tunnelW}
        height={waterHeight}
        fill="#1a4466"
        opacity={0.7}
      />
      {/* Water surface shimmer */}
      <rect
        x={tunnelX}
        y={waterTop}
        width={tunnelW}
        height={3}
        fill="#3388bb"
        opacity={0.5}
      />
      {/* Wave effect */}
      {[...Array(Math.ceil(tunnelW / 12))].map((_, i) => (
        <circle
          key={`wave-${i}`}
          cx={tunnelX + 6 + i * 12}
          cy={waterTop}
          r={2}
          fill="#44aadd"
          opacity={0.3}
        />
      ))}
      {/* Depth tint — darker at bottom */}
      <rect
        x={tunnelX}
        y={tunnelBottom - Math.min(waterHeight, 30)}
        width={tunnelW}
        height={Math.min(waterHeight, 30)}
        fill="#0a2233"
        opacity={0.4}
      />
    </g>
  );
}

// Rock face — the thing you chip away at
function RockFace({ rockLevel, caveWidth }) {
  // rockLevel: 0 = no progress, TOTAL_ROCK = fully cleared
  const rockTop = ROCK_BOTTOM - rockLevel;
  const tunnelW = caveWidth;
  const tunnelX = W / 2 - tunnelW / 2;

  return (
    <g>
      {/* Main rock body — sides */}
      <rect x={0} y={ROCK_TOP} width={W} height={ROCK_BOTTOM - ROCK_TOP} fill="#3a2a1a" />

      {/* Rock texture — horizontal strata lines */}
      {[...Array(20)].map((_, i) => {
        const ly = ROCK_TOP + i * (TOTAL_ROCK / 20);
        return (
          <line
            key={`strata-${i}`}
            x1={0}
            y1={ly}
            x2={W}
            y2={ly}
            stroke={i % 3 === 0 ? "#4a3a2a" : "#2a1a0a"}
            strokeWidth={i % 5 === 0 ? 2 : 1}
            opacity={0.5}
          />
        );
      })}

      {/* Darker rock chunks for texture */}
      {[...Array(15)].map((_, i) => {
        const rx = 30 + (i * 67) % (W - 60);
        const ry = ROCK_TOP + 20 + (i * 43) % (TOTAL_ROCK - 40);
        if (ry < rockTop) return null; // already cleared
        return (
          <rect
            key={`chunk-${i}`}
            x={rx}
            y={ry}
            width={8 + (i % 4) * 4}
            height={6 + (i % 3) * 3}
            fill={i % 2 === 0 ? "#2a1a0a" : "#4a3a2a"}
            opacity={0.4}
            rx={1}
          />
        );
      })}

      {/* Tunnel — cleared area */}
      <rect
        x={tunnelX}
        y={rockTop}
        width={tunnelW}
        height={ROCK_BOTTOM - rockTop}
        fill="#0a0a1a"
      />

      {/* Tunnel edges — rough rock sides */}
      {[...Array(Math.ceil((ROCK_BOTTOM - rockTop) / 8))].map((_, i) => {
        const ey = rockTop + i * 8;
        const jitterL = Math.sin(i * 2.3) * 3;
        const jitterR = Math.cos(i * 1.7) * 3;
        return (
          <g key={`edge-${i}`}>
            <rect x={tunnelX + jitterL - 2} y={ey} width={4} height={8} fill="#4a3a2a" opacity={0.7} />
            <rect x={tunnelX + tunnelW + jitterR - 2} y={ey} width={4} height={8} fill="#4a3a2a" opacity={0.7} />
          </g>
        );
      })}

      {/* Rock face at current level — the "ceiling" you're chipping at */}
      {rockTop > ROCK_TOP && (
        <g>
          <rect x={tunnelX - 4} y={rockTop - 4} width={tunnelW + 8} height={8} fill="#5a4a3a" rx={2} />
          <rect x={tunnelX} y={rockTop - 2} width={tunnelW} height={4} fill="#6a5a4a" rx={1} />
          {/* Crack lines */}
          <line x1={tunnelX + 8} y1={rockTop - 6} x2={tunnelX + 12} y2={rockTop + 2} stroke="#7a6a5a" strokeWidth={1} />
          <line x1={tunnelX + tunnelW - 10} y1={rockTop - 4} x2={tunnelX + tunnelW - 6} y2={rockTop + 3} stroke="#7a6a5a" strokeWidth={1} />
        </g>
      )}
    </g>
  );
}

// Timeline bar at bottom
function TimelineBar({ elapsed, currentYear }) {
  const barY = 660;
  const barW = W - 40;
  const barX = 20;
  const progress = Math.min(elapsed / GAME_END_TIME, 1);

  return (
    <g>
      <rect x={barX} y={barY} width={barW} height={4} fill="#1a1a2a" rx={2} />
      <rect x={barX} y={barY} width={barW * progress} height={4} fill="#ff8866" rx={2} />

      {/* Year markers */}
      {MILESTONES.map((m) => {
        const mx = barX + (m.time / GAME_END_TIME) * barW;
        const active = elapsed >= m.time;
        return (
          <g key={m.year}>
            <rect x={mx - 1} y={barY - 2} width={2} height={8} fill={active ? "#ff8866" : "#333344"} />
            <text
              x={mx}
              y={barY + 16}
              textAnchor="middle"
              fontSize="4"
              fill={active ? "#ff8866" : "#444455"}
              fontFamily={PIXEL_FONT}
            >
              {m.year}
            </text>
          </g>
        );
      })}

      {/* Current year display */}
      <text x={W / 2} y={barY - 10} textAnchor="middle" fontSize="7" fill="#ffaa66" fontFamily={PIXEL_FONT}>
        {currentYear}
      </text>
    </g>
  );
}

// Milestone flash overlay
function MilestoneFlash({ milestone, opacity }) {
  if (!milestone) return null;
  return (
    <g opacity={opacity}>
      <rect x={20} y={580} width={W - 40} height={30} rx={4} fill="#1a1a2a" stroke="#ff8866" strokeWidth={1.5} />
      <text x={W / 2} y={593} textAnchor="middle" fontSize="5" fill="#ffaa66" fontFamily={PIXEL_FONT} letterSpacing="1">
        {milestone.year}
      </text>
      <text x={W / 2} y={604} textAnchor="middle" fontSize="5" fill="#ddddee" fontFamily={PIXEL_FONT}>
        {milestone.label}
      </text>
    </g>
  );
}

// Title Screen
function TitleScreen({ onStart }) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 600);
    return () => clearInterval(t);
  }, []);

  const shareTitle = () => {
    const text = `32 years. $5.6 billion plan. $0 delivered.\n\nNC courts ordered school funding. The legislature and courts keep pointing fingers.\n\nPlay "The Leandro Long Game":\nhttps://games.andycantwin.com/longgame`;
    if (navigator.share) {
      navigator.share({ title: "The Leandro Long Game", text, url: "https://games.andycantwin.com/longgame" }).catch(() => {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => alert("Link copied!")).catch(() => prompt("Copy this link:", "https://games.andycantwin.com/longgame"));
    } else {
      prompt("Copy this link:", "https://games.andycantwin.com/longgame");
    }
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <rect width={W} height={H} fill="#0a0a1a" />

      {/* Cave background */}
      <rect x={0} y={120} width={W} height={400} fill="#1a1008" opacity={0.5} />
      {/* Rock texture hints */}
      {[...Array(8)].map((_, i) => (
        <rect key={i} x={20 + i * 40} y={200 + (i % 3) * 60} width={30} height={20} fill="#2a1a0a" opacity={0.3} rx={2} />
      ))}

      {/* Title */}
      <text x={W / 2} y={50} textAnchor="middle" fontSize="6" fill="#886644" fontFamily={PIXEL_FONT} letterSpacing="3">
        — CAN'T WIN GAMES PRESENTS —
      </text>

      <text x={W / 2} y={85} textAnchor="middle" fontSize="13" fill="#ffcc44" fontFamily={PIXEL_FONT}
        stroke="#332200" strokeWidth="3" paintOrder="stroke">
        THE LEANDRO
      </text>
      <text x={W / 2} y={110} textAnchor="middle" fontSize="13" fill="#ff8844" fontFamily={PIXEL_FONT}
        stroke="#331a00" strokeWidth="3" paintOrder="stroke">
        LONG GAME
      </text>

      <text x={W / 2} y={135} textAnchor="middle" fontSize="5.5" fill="#8888aa" fontFamily={PIXEL_FONT}>
        YOU'RE A STUDENT. THE WATER IS RISING.
      </text>

      {/* Cave scene preview */}
      <rect x={40} y={160} width={W - 80} height={180} fill="#0d0806" rx={6} stroke="#3a2a1a" strokeWidth={2} />

      {/* Money bag at top of cave */}
      <ellipse cx={W / 2} cy={182} rx={18} ry={14} fill="#ddaa33" />
      <ellipse cx={W / 2} cy={182} rx={16} ry={12} fill="#eebb44" />
      <rect x={W / 2 - 6} y={168} width={12} height={6} fill="#bb8822" rx={1} />
      <ellipse cx={W / 2} cy={167} rx={8} ry={4} fill="#eebb44" />
      <text x={W / 2} y={187} textAnchor="middle" fontSize="8" fill="#886611" fontFamily={PIXEL_FONT}>$5B</text>
      <text x={W / 2} y={200} textAnchor="middle" fontSize="4.5" fill="#ffcc44" fontFamily={PIXEL_FONT}>LEANDRO FUNDS</text>

      {/* Rock in middle */}
      <rect x={60} y={210} width={W - 120} height={80} fill="#3a2a1a" />
      {[...Array(5)].map((_, i) => (
        <line key={i} x1={70} y1={220 + i * 16} x2={W - 70} y2={220 + i * 16} stroke="#4a3a2a" strokeWidth={1} opacity={0.5} />
      ))}
      <text x={W / 2} y={255} textAnchor="middle" fontSize="5" fill="#6a5a4a" fontFamily={PIXEL_FONT}>32 YEARS OF ROCK</text>

      {/* Student at bottom */}
      <rect x={W / 2 - 4} y={308} width={8} height={14} fill="#4488cc" rx={1} />
      <rect x={W / 2 - 5} y={300} width={10} height={8} fill="#ffcc88" rx={2} />
      <rect x={W / 2 - 2} y={303} width={2} height={2} fill="#222" />
      <rect x={W / 2 + 1} y={303} width={2} height={2} fill="#222" />
      <rect x={W / 2 + 3} y={309} width={4} height={8} fill="#cc6644" rx={1} />
      <text x={W / 2} y={336} textAnchor="middle" fontSize="4" fill="#88bbdd" fontFamily={PIXEL_FONT}>YOU (A STUDENT)</text>

      {/* Water rising in cave preview */}
      <rect x={W / 2 - 30} y={318} width={60} height={22} fill="#1a4466" opacity={0.7} rx={2} />
      <rect x={W / 2 - 30} y={318} width={60} height={3} fill="#3388bb" opacity={0.5} />
      <text x={W / 2} y={347} textAnchor="middle" fontSize="3.5" fill="#ff4444" fontFamily={PIXEL_FONT}>WATER RISING</text>

      {/* Speech bubble preview */}
      <rect x={50} y={355} width={120} height={22} rx={3} fill="#2a2244" stroke="#6644aa" strokeWidth={1} />
      <text x={110} y={364} textAnchor="middle" fontSize="4" fill="#aa88dd" fontFamily={PIXEL_FONT}>LEGISLATURE</text>
      <text x={110} y={373} textAnchor="middle" fontSize="3.5" fill="#ddddee" fontFamily={PIXEL_FONT}>WAITING ON THE COURTS</text>

      <rect x={190} y={355} width={120} height={22} rx={3} fill="#1a2a3a" stroke="#4488aa" strokeWidth={1} />
      <text x={250} y={364} textAnchor="middle" fontSize="4" fill="#88bbdd" fontFamily={PIXEL_FONT}>COURT</text>
      <text x={250} y={373} textAnchor="middle" fontSize="3.5" fill="#ddddee" fontFamily={PIXEL_FONT}>WAITING ON LEGISLATURE</text>

      {/* Instructions */}
      <text x={W / 2} y={405} textAnchor="middle" fontSize="6" fill="#ffcc44" fontFamily={PIXEL_FONT}>
        TAP TO MINE THROUGH THE ROCK
      </text>
      <text x={W / 2} y={418} textAnchor="middle" fontSize="5" fill="#ff6666" fontFamily={PIXEL_FONT}>
        GET THE MONEY BEFORE YOU DROWN
      </text>

      {/* Start button */}
      <g cursor="pointer" onClick={onStart}>
        <rect x={90} y={435} width={120} height={32} rx={3}
          fill={blink ? "#4a8844" : "#3a7733"} stroke="#66bb66" strokeWidth={1} />
        <text x={150} y={456} textAnchor="middle" fontSize="11" fill="#ccffcc" fontFamily={PIXEL_FONT}>
          ▶ DIG IN
        </text>
      </g>

      {/* Share button */}
      <g cursor="pointer" onClick={shareTitle}>
        <rect x={220} y={435} width={60} height={32} rx={3}
          fill="#dd6644" stroke="#ee7755" strokeWidth={1} />
        <text x={250} y={456} textAnchor="middle" fontSize="8" fill="#fff" fontFamily={PIXEL_FONT}>
          SHARE
        </text>
      </g>

      {/* Power-ups preview */}
      <rect x={30} y={485} width={W - 60} height={90} fill="rgba(0,0,0,0.4)" rx={4} />
      <text x={W / 2} y={502} textAnchor="middle" fontSize="5" fill="#ff8866" fontFamily={PIXEL_FONT}>POWER-UPS:</text>

      {/* Bare hands */}
      <rect x={42} y={510} width={8} height={8} fill="#ddaa77" rx={1} />
      <text x={56} y={517} textAnchor="start" fontSize="5" fill="#aa8866" fontFamily={PIXEL_FONT}>BARE HANDS</text>
      <text x={200} y={517} textAnchor="start" fontSize="4" fill="#666677" fontFamily={PIXEL_FONT}>GOOD LUCK</text>

      {/* Hammer */}
      <rect x={42} y={528} width={8} height={8} fill="#6688cc" rx={1} />
      <text x={56} y={535} textAnchor="start" fontSize="5" fill="#44aaff" fontFamily={PIXEL_FONT}>ANITA EARLS HAMMER</text>
      <text x={200} y={535} textAnchor="start" fontSize="4" fill="#666677" fontFamily={PIXEL_FONT}>RE-ELECT HER</text>

      {/* Excavator */}
      <rect x={42} y={546} width={8} height={8} fill="#cc8822" rx={1} />
      <text x={56} y={553} textAnchor="start" fontSize="5" fill="#ffaa44" fontFamily={PIXEL_FONT}>FLIP THE COURT DIGGER</text>
      <text x={200} y={553} textAnchor="start" fontSize="4" fill="#666677" fontFamily={PIXEL_FONT}>ELECTIONS</text>

      <text x={W / 2} y={570} textAnchor="middle" fontSize="4" fill="#ff4444" fontFamily={PIXEL_FONT}>
        DECLINE A POWER-UP AND THE WATER WINS
      </text>

      {/* Source */}
      <text x={W / 2} y={588} textAnchor="middle" fontSize="4" fill="#444455" fontFamily={PIXEL_FONT}>
        LEANDRO V. STATE (1994) · EVERY CHILD NC · NC JUSTICE CENTER
      </text>

      {/* Donate button */}
      <a href="https://secure.actblue.com/donate/andybowline" target="_blank" rel="noopener noreferrer">
        <g cursor="pointer">
          <rect x={W / 2 - 135} y={604} width={270} height={38} rx={3}
            fill="#1a3a1a" stroke="#3a6a3a" strokeWidth={1.5} />
          <text x={W / 2} y={619} textAnchor="middle" fontSize="5" fill="#88dd88" fontFamily={PIXEL_FONT}>
            THIS MONEY SHOULD GO TO SCHOOLS
          </text>
          <text x={W / 2} y={634} textAnchor="middle" fontSize="7" fill="#44ff44" fontFamily={PIXEL_FONT}>
            CHIP IN $10 →
          </text>
        </g>
      </a>
    </svg>
  );
}

// Intro screen — brief story setup before gameplay
function IntroScreen({ onDone }) {
  const [line, setLine] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setLine(1), 600),
      setTimeout(() => setLine(2), 1800),
      setTimeout(() => setLine(3), 3200),
      setTimeout(() => setLine(4), 4800),
      setTimeout(() => onDone(), 6500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", display: "block", cursor: "pointer" }}
      onClick={onDone}
      onTouchStart={(e) => { e.preventDefault(); onDone(); }}
    >
      <rect width={W} height={H} fill="#0a0a1a" />

      <text x={W / 2} y={200} textAnchor="middle" fontSize="7" fill="#88bbdd" fontFamily={PIXEL_FONT}>
        YOU ARE A STUDENT.
      </text>

      {line >= 1 && (
        <g>
          <text x={W / 2} y={260} textAnchor="middle" fontSize="6" fill="#ddddee" fontFamily={PIXEL_FONT}>
            YOU'RE BURIED UNDER 32 YEARS
          </text>
          <text x={W / 2} y={280} textAnchor="middle" fontSize="6" fill="#ddddee" fontFamily={PIXEL_FONT}>
            OF POLITICAL GRIDLOCK.
          </text>
        </g>
      )}

      {line >= 2 && (
        <text x={W / 2} y={330} textAnchor="middle" fontSize="6" fill="#ffcc44" fontFamily={PIXEL_FONT}>
          YOUR SCHOOL'S $5 BILLION IS UP THERE.
        </text>
      )}

      {line >= 3 && (
        <g>
          <text x={W / 2} y={400} textAnchor="middle" fontSize="6" fill="#ff6666" fontFamily={PIXEL_FONT}>
            THE WATER IS RISING.
          </text>
          <text x={W / 2} y={425} textAnchor="middle" fontSize="7" fill="#ffaa44" fontFamily={PIXEL_FONT}>
            DIG UP BEFORE YOU DROWN.
          </text>
        </g>
      )}

      {line >= 4 && (
        <text x={W / 2} y={520} textAnchor="middle" fontSize="5" fill="#666677" fontFamily={PIXEL_FONT}>
          TAP TO START
        </text>
      )}
    </svg>
  );
}

// End Screen
function EndScreen({ stats }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => setPhase(3), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const shareResult = () => {
    const text = stats.drowned
      ? `I tried to mine through 32 years of gridlock with bare hands. The student drowned.\n\nNC's $5.6B school funding plan — ordered by courts, never delivered.\n\nPlay "The Leandro Long Game":\nhttps://games.andycantwin.com/longgame`
      : `I mined through 32 years of political gridlock in ${stats.taps} taps.\n\nNC's $5.6B school funding plan — ordered by courts, never delivered. Forsyth County is short $45M.\n\nPlay "The Leandro Long Game":\nhttps://games.andycantwin.com/longgame`;
    if (navigator.share) {
      navigator.share({ title: "The Leandro Long Game", text, url: "https://games.andycantwin.com/longgame" }).catch(() => {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => alert("Link copied!")).catch(() => prompt("Copy this link:", "https://games.andycantwin.com/longgame"));
    } else {
      prompt("Copy this link:", "https://games.andycantwin.com/longgame");
    }
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <rect width={W} height={H} fill="#0a0a1a" />

      {/* Background elements */}
      {stats.drowned ? (
        // Water / bubble motif for drowned ending
        [...Array(12)].map((_, i) => (
          <circle
            key={i}
            cx={30 + (i * 29) % (W - 40)}
            cy={80 + (i * 47) % 200}
            r={3 + (i % 3) * 2}
            fill="#4488cc"
            opacity={0.1 + (i % 4) * 0.03}
          />
        ))
      ) : (
        // Money flooding down for victory
        [...Array(12)].map((_, i) => (
          <text
            key={i}
            x={30 + (i * 29) % (W - 40)}
            y={60 + (i * 47) % 200}
            fontSize={8 + (i % 3) * 4}
            fill="#ffdd44"
            fontFamily={PIXEL_FONT}
            opacity={0.15 + (i % 4) * 0.05}
          >
            $
          </text>
        ))
      )}

      {/* Phase 0: Header */}
      {stats.drowned ? (
        <g>
          <text x={W / 2} y={60} textAnchor="middle" fontSize="10" fill="#4488cc" fontFamily={PIXEL_FONT}
            stroke="#112244" strokeWidth="2" paintOrder="stroke">
            THE STUDENT DROWNED.
          </text>
          <text x={W / 2} y={82} textAnchor="middle" fontSize="6" fill="#ff4444" fontFamily={PIXEL_FONT}>
            THE WATER WON.
          </text>
        </g>
      ) : (
        <text x={W / 2} y={80} textAnchor="middle" fontSize="12" fill="#ffcc44" fontFamily={PIXEL_FONT}
          stroke="#332200" strokeWidth="2" paintOrder="stroke">
          YOU BROKE THROUGH.
        </text>
      )}

      {/* Phase 1: The message */}
      {phase >= 1 && (
        <g>
          <rect x={20} y={110} width={W - 40} height={150} fill="#1a1a2a" rx={4} stroke="#3a3a5a" strokeWidth={2} />
          {stats.drowned ? (
            <g>
              <text x={W / 2} y={135} textAnchor="middle" fontSize="5.5" fill="#ddddee" fontFamily={PIXEL_FONT}>
                NC STUDENTS CAN'T WAIT ANYMORE.
              </text>
              <text x={W / 2} y={153} textAnchor="middle" fontSize="5.5" fill="#ddddee" fontFamily={PIXEL_FONT}>
                THE $5.6B LEANDRO PLAN HAS BEEN
              </text>
              <text x={W / 2} y={168} textAnchor="middle" fontSize="5.5" fill="#ddddee" fontFamily={PIXEL_FONT}>
                COURT-ORDERED SINCE 1997.
              </text>
              <text x={W / 2} y={188} textAnchor="middle" fontSize="5.5" fill="#ff4444" fontFamily={PIXEL_FONT}>
                ZERO DOLLARS TRANSFERRED.
              </text>
              <text x={W / 2} y={208} textAnchor="middle" fontSize="5.5" fill="#ff4444" fontFamily={PIXEL_FONT}>
                FORSYTH COUNTY IS SHORT $45M.
              </text>
              <text x={W / 2} y={228} textAnchor="middle" fontSize="5.5" fill="#ffaa44" fontFamily={PIXEL_FONT}>
                BARE HANDS CAN'T FIX THIS.
              </text>
              <text x={W / 2} y={248} textAnchor="middle" fontSize="6" fill="#44aaff" fontFamily={PIXEL_FONT}>
                ELECTIONS CAN.
              </text>
            </g>
          ) : (
            <g>
              <text x={W / 2} y={135} textAnchor="middle" fontSize="5.5" fill="#ddddee" fontFamily={PIXEL_FONT}>
                THE $5.6B LEANDRO PLAN HAS BEEN
              </text>
              <text x={W / 2} y={149} textAnchor="middle" fontSize="5.5" fill="#ddddee" fontFamily={PIXEL_FONT}>
                COURT-ORDERED SINCE 1997.
              </text>
              <text x={W / 2} y={168} textAnchor="middle" fontSize="5.5" fill="#ddddee" fontFamily={PIXEL_FONT}>
                A JUDGE ORDERED $1.75B IN 2021.
              </text>
              <text x={W / 2} y={182} textAnchor="middle" fontSize="5.5" fill="#ff4444" fontFamily={PIXEL_FONT}>
                ZERO DOLLARS TRANSFERRED.
              </text>
              <text x={W / 2} y={204} textAnchor="middle" fontSize="5.5" fill="#ff4444" fontFamily={PIXEL_FONT}>
                FORSYTH COUNTY IS SHORT $45M.
              </text>
              <text x={W / 2} y={222} textAnchor="middle" fontSize="5.5" fill="#44dd44" fontFamily={PIXEL_FONT}>
                THE PLAN WOULD GIVE THEM $100M.
              </text>
              <text x={W / 2} y={247} textAnchor="middle" fontSize="6" fill="#ffaa44" fontFamily={PIXEL_FONT}>
                NOBODY'S ENFORCING IT.
              </text>
            </g>
          )}
        </g>
      )}

      {/* Phase 2: Your Results */}
      {phase >= 2 && (
        <g>
          <rect x={20} y={270} width={W - 40} height={130} fill="#1a1a2a" rx={4} stroke="#3a3a5a" strokeWidth={1.5} />
          <text x={W / 2} y={288} textAnchor="middle" fontSize="6" fill="#ff8866" fontFamily={PIXEL_FONT} letterSpacing="1">
            YOUR RESULTS
          </text>

          {/* Bare hands progress bar */}
          <text x={32} y={308} fontSize="4.5" fill="#aa8866" fontFamily={PIXEL_FONT}>BARE HANDS</text>
          <rect x={32} y={312} width={W - 64} height={8} fill="#1a1a1a" rx={2} />
          <rect x={32} y={312} width={Math.max((W - 64) * (stats.handsProgress / stats.totalRock), 2)} height={8} fill="#aa8866" rx={2} />
          <text x={W - 32} y={308} textAnchor="end" fontSize="4.5" fill="#aa8866" fontFamily={PIXEL_FONT}>
            {Math.floor((stats.handsProgress / stats.totalRock) * 100)}%
          </text>

          {/* Total progress bar */}
          <text x={32} y={334} fontSize="4.5" fill={stats.drowned ? "#4488cc" : "#44dd44"} fontFamily={PIXEL_FONT}>TOTAL PROGRESS</text>
          <rect x={32} y={338} width={W - 64} height={8} fill="#1a1a1a" rx={2} />
          <rect x={32} y={338} width={Math.max((W - 64) * (stats.rockLevel / stats.totalRock), 2)} height={8} fill={stats.drowned ? "#4488cc" : "#44dd44"} rx={2} />
          <text x={W - 32} y={334} textAnchor="end" fontSize="4.5" fill={stats.drowned ? "#4488cc" : "#44dd44"} fontFamily={PIXEL_FONT}>
            {Math.floor((stats.rockLevel / stats.totalRock) * 100)}%
          </text>

          {/* Stats row */}
          <text x={70} y={362} textAnchor="middle" fontSize="7" fill="#ffcc44" fontFamily={PIXEL_FONT}>{stats.taps}</text>
          <text x={70} y={372} textAnchor="middle" fontSize="4" fill="#888899" fontFamily={PIXEL_FONT}>TOTAL TAPS</text>

          <text x={W / 2} y={362} textAnchor="middle" fontSize="7" fill="#aa8866" fontFamily={PIXEL_FONT}>{stats.handsTaps}</text>
          <text x={W / 2} y={372} textAnchor="middle" fontSize="4" fill="#888899" fontFamily={PIXEL_FONT}>BARE HAND TAPS</text>

          <text x={290} y={362} textAnchor="middle" fontSize="7" fill={stats.drowned ? "#ff4444" : "#44dd44"} fontFamily={PIXEL_FONT}>
            {stats.drowned ? "DROWNED" : "BROKE THROUGH"}
          </text>
          <text x={290} y={372} textAnchor="middle" fontSize="4" fill="#888899" fontFamily={PIXEL_FONT}>OUTCOME</text>

          {/* Tools equipped */}
          <text x={32} y={392} fontSize="4" fill="#666677" fontFamily={PIXEL_FONT}>
            TOOLS: BARE HANDS{stats.equippedHammer ? " → EARLS HAMMER" : ""}{stats.equippedDigger ? " → COURT DIGGER" : ""}
          </text>
        </g>
      )}

      {/* Phase 3: CTAs */}
      {phase >= 3 && (
        <g>
          {/* Campaign link — Anita Earls headline */}
          <a href="https://andycantwin.com" target="_blank" rel="noopener noreferrer">
            <g cursor="pointer">
              <rect x={20} y={412} width={W - 40} height={62} rx={4}
                fill="#1a2a3a" stroke="#44aaff" strokeWidth={2} />
              <text x={W / 2} y={434} textAnchor="middle" fontSize="7" fill="#44aaff" fontFamily={PIXEL_FONT}>
                I CAN'T WIN.
              </text>
              <text x={W / 2} y={450} textAnchor="middle" fontSize="8" fill="#ffcc44" fontFamily={PIXEL_FONT}>
                BUT ANITA EARLS HAS TO.
              </text>
              <text x={W / 2} y={466} textAnchor="middle" fontSize="5" fill="#88aa88" fontFamily={PIXEL_FONT}>
                ANDY BOWLINE · NC SENATE 31 · ANDYCANTWIN.COM
              </text>
            </g>
          </a>

          {/* Share + Play Again */}
          <g cursor="pointer" onClick={shareResult}>
            <rect x={20} y={488} width={150} height={30} rx={3}
              fill="#dd6644" stroke="#ee7755" strokeWidth={1} />
            <text x={95} y={508} textAnchor="middle" fontSize="9" fill="#fff" fontFamily={PIXEL_FONT}>
              SHARE
            </text>
          </g>
          <g cursor="pointer" onClick={() => window.location.reload()}>
            <rect x={180} y={488} width={160} height={30} rx={3}
              fill="#4466aa" stroke="#5577bb" strokeWidth={1} />
            <text x={260} y={508} textAnchor="middle" fontSize="8" fill="#ccddff" fontFamily={PIXEL_FONT}>
              PLAY AGAIN
            </text>
          </g>

          {/* Donate */}
          <a href="https://secure.actblue.com/donate/andybowline" target="_blank" rel="noopener noreferrer">
            <g cursor="pointer">
              <rect x={20} y={532} width={W - 40} height={40} rx={3}
                fill="#1a3a1a" stroke="#3a6a3a" strokeWidth={1.5} />
              <text x={W / 2} y={548} textAnchor="middle" fontSize="5" fill="#88dd88" fontFamily={PIXEL_FONT}>
                NC WON'T FUND ITS SCHOOLS. YOU CAN.
              </text>
              <text x={W / 2} y={563} textAnchor="middle" fontSize="8" fill="#44ff44" fontFamily={PIXEL_FONT}>
                CHIP IN $10 →
              </text>
            </g>
          </a>

          {/* Source */}
          <text x={W / 2} y={595} textAnchor="middle" fontSize="4" fill="#444455" fontFamily={PIXEL_FONT}>
            LEANDRO V. STATE (1994) · EVERY CHILD NC
          </text>
          <text x={W / 2} y={607} textAnchor="middle" fontSize="4" fill="#444455" fontFamily={PIXEL_FONT}>
            NC JUSTICE CENTER · GAMES.ANDYCANTWIN.COM
          </text>
        </g>
      )}
    </svg>
  );
}

// Main game component
export default function LeandroLongGame() {
  const [gameState, setGameState] = useState("title");
  const [rockLevel, setRockLevel] = useState(INITIAL_TUNNEL);
  const [caveWidth, setCaveWidth] = useState(40);
  const [tool, setTool] = useState("hands");
  const [particles, setParticles] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [currentYear, setCurrentYear] = useState(1994);
  const [dialogue, setDialogue] = useState(null);
  const [dialogueOpacity, setDialogueOpacity] = useState(0);
  const [milestone, setMilestone] = useState(null);
  const [milestoneOpacity, setMilestoneOpacity] = useState(0);
  const [moneyOwed, setMoneyOwed] = useState(0);
  const [taps, setTaps] = useState(0);
  const [handsTaps, setHandsTaps] = useState(0);
  const [shakeX, setShakeX] = useState(0);
  const [shakeY, setShakeY] = useState(0);
  const [toolPrompt, setToolPrompt] = useState(null);
  const [moneyFalling, setMoneyFalling] = useState(false);
  const [waterHeight, setWaterHeight] = useState(0);
  const [drowned, setDrowned] = useState(false);
  const [paused, setPaused] = useState(false);

  const gameLoopRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);
  const toolRef = useRef("hands");
  const rockLevelRef = useRef(INITIAL_TUNNEL);
  const dialogueIndexRef = useRef(0);
  const lastDialogueTimeRef = useRef(0);
  const lastMilestoneRef = useRef(-1);
  const tapsRef = useRef(0);
  const handsTapsRef = useRef(0);
  const particlesRef = useRef([]);
  const toolPromptRef = useRef(null);
  const gameStateRef = useRef("title");
  const endTriggeredRef = useRef(false);
  const drownedRef = useRef(false);
  const pauseStartRef = useRef(null);
  const totalPausedRef = useRef(0);
  const hammerOfferedRef = useRef(false);
  const excavatorOfferedRef = useRef(false);
  const waterDrainTimeRef = useRef(null); // when tool was equipped
  const waterDrainLevelRef = useRef(0); // water level at equip moment
  const waterHeightRef = useRef(0); // tracks current water height

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const spawnParticles = useCallback((count, baseX, baseY, colors) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i + Math.random(),
        x: baseX + (Math.random() - 0.5) * 20,
        y: baseY,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 1,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  const equipTool = useCallback((newTool) => {
    toolRef.current = newTool;
    setTool(newTool);
    toolPromptRef.current = null;
    setToolPrompt(null);

    // Record current water level and time — water continues rising from here toward new deadline
    waterDrainLevelRef.current = waterHeightRef.current;
    waterDrainTimeRef.current = elapsedRef.current;

    // Big particle burst for equip
    const rockTop = ROCK_BOTTOM - rockLevelRef.current;
    spawnParticles(15, W / 2, rockTop, newTool === "hammer" ? ["#44aaff", "#88ccff", "#2288dd"] : ["#ffaa44", "#ffcc66", "#dd8822"]);

    // Resume game
    totalPausedRef.current += performance.now() - pauseStartRef.current;
    pauseStartRef.current = null;
    setPaused(false);
  }, [spawnParticles]);

  const declineTool = useCallback(() => {
    toolPromptRef.current = null;
    setToolPrompt(null);

    // Resume game — clock keeps ticking, water keeps rising
    totalPausedRef.current += performance.now() - pauseStartRef.current;
    pauseStartRef.current = null;
    setPaused(false);
  }, []);

  const handleTap = useCallback(() => {
    if (gameStateRef.current !== "playing" || pauseStartRef.current) return;

    const currentTool = toolRef.current;

    const chipSize = TOOLS[currentTool].chipSize;
    const newRock = Math.min(rockLevelRef.current + chipSize, TOTAL_ROCK);
    rockLevelRef.current = newRock;
    setRockLevel(newRock);

    tapsRef.current++;
    setTaps(tapsRef.current);
    if (currentTool === "hands") {
      handsTapsRef.current++;
      setHandsTaps(handsTapsRef.current);
    }

    // Widen cave slightly per tap
    setCaveWidth((w) => Math.min(w + (currentTool === "excavator" ? 15 : currentTool === "hammer" ? 3 : 0.5), 200));

    // Particle effects
    const rockTop = ROCK_BOTTOM - newRock;
    const particleCount = currentTool === "excavator" ? 30 : currentTool === "hammer" ? 10 : 4;
    const colors = currentTool === "excavator"
      ? ["#ffaa44", "#ffcc66", "#dd8822", "#ffdd44"]
      : currentTool === "hammer"
        ? ["#44aaff", "#88ccff", "#6a5a4a"]
        : ["#6a5a4a", "#5a4a3a", "#4a3a2a"];
    spawnParticles(particleCount, W / 2, rockTop, colors);

    // Screen shake for excavator
    if (currentTool === "excavator") {
      setShakeX((Math.random() - 0.5) * 8);
      setShakeY((Math.random() - 0.5) * 8);
      setTimeout(() => { setShakeX(0); setShakeY(0); }, 80);
    }

    // Check if broke through
    if (newRock >= TOTAL_ROCK && !endTriggeredRef.current) {
      endTriggeredRef.current = true;
      setMoneyFalling(true);
      // Big celebration particles
      spawnParticles(40, W / 2, ROCK_TOP + 20, ["#ffdd44", "#44dd44", "#ffcc33", "#66ff66"]);
      setTimeout(() => {
        setGameState("ended");
      }, 1200);
    }
  }, [spawnParticles]);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;

    startTimeRef.current = performance.now();
    elapsedRef.current = 0;
    endTriggeredRef.current = false;
    totalPausedRef.current = 0;

    const tick = () => {
      // Skip tick if paused
      if (pauseStartRef.current) {
        gameLoopRef.current = requestAnimationFrame(tick);
        return;
      }

      const now = performance.now();
      const dt = (now - startTimeRef.current - totalPausedRef.current) / 1000;
      elapsedRef.current = dt;
      setElapsed(dt);

      // Year interpolation — fast 1994-2026 in first 17s, slow 2026-2030 after
      let year;
      if (dt <= PHASE2_TIME) {
        // 0-17s: 1994 to 2026
        const progress = dt / PHASE2_TIME;
        year = Math.floor(1994 + progress * (2026 - 1994));
      } else {
        // 17-25s: 2026 to 2030
        const progress = Math.min((dt - PHASE2_TIME) / (PHASE3_TIME - PHASE2_TIME), 1);
        year = Math.floor(2026 + progress * (2030 - 2026));
      }
      setCurrentYear(year);

      // Money owed ticker — accumulates over the history period
      const oweProgress = Math.min(dt / PHASE2_TIME, 1);
      setMoneyOwed(Math.floor(oweProgress * FORSYTH_OWED_MAX));

      // Water rising — starts after WATER_START_TIME
      if (dt > WATER_START_TIME && !drownedRef.current && !endTriggeredRef.current) {
        const tunnelHeight = rockLevelRef.current;
        const currentTool = toolRef.current;

        // Hard drown deadline based on current tool
        // excavator = no drowning (you break through), hammer = 30s, hands = 25s
        let drownDeadline;
        if (currentTool === "excavator") {
          drownDeadline = 999;
        } else if (currentTool === "hammer") {
          drownDeadline = DROWN_TIME_HAMMER;
        } else {
          drownDeadline = DROWN_TIME_HANDS;
        }

        let waterFill;
        if (waterDrainTimeRef.current !== null && dt > waterDrainTimeRef.current) {
          // After a tool equip: linear rise from current level to full by deadline
          // Linear = steady, visible, tension-building
          const drainLevel = waterDrainLevelRef.current;
          const timeAfterDrain = dt - waterDrainTimeRef.current;
          const timeWindow = drownDeadline - waterDrainTimeRef.current;
          const progress = Math.min(timeAfterDrain / timeWindow, 1);
          waterFill = drainLevel + (tunnelHeight - drainLevel) * progress;
        } else {
          // Before any equip: accelerating curve from 0 to full by deadline
          const waterTime = dt - WATER_START_TIME;
          const timeWindow = drownDeadline - WATER_START_TIME;
          const progress = Math.min(waterTime / timeWindow, 1);
          waterFill = progress * progress * tunnelHeight;
        }

        waterHeightRef.current = waterFill;
        setWaterHeight(waterFill);

        // Drown when deadline hits
        if (dt >= drownDeadline && drownDeadline < 999) {
          drownedRef.current = true;
          endTriggeredRef.current = true;
          setDrowned(true);
          setWaterHeight(tunnelHeight);
          setTimeout(() => setGameState("ended"), 800);
        }
      }

      // Milestone checks
      for (let i = 0; i < MILESTONES.length; i++) {
        if (dt >= MILESTONES[i].time && i > lastMilestoneRef.current) {
          lastMilestoneRef.current = i;
          setMilestone(MILESTONES[i]);
          setMilestoneOpacity(1);
          setTimeout(() => setMilestoneOpacity(0), 2000);
        }
      }

      // Dialogue cycling — every 2.5 seconds during phase 1
      if (dt < PHASE2_TIME && dt - lastDialogueTimeRef.current > 2.5) {
        lastDialogueTimeRef.current = dt;
        const idx = dialogueIndexRef.current % DIALOGUE.length;
        setDialogue(DIALOGUE[idx]);
        setDialogueOpacity(1);
        dialogueIndexRef.current++;
        setTimeout(() => setDialogueOpacity(0), 2000);
      }

      // Tool prompt triggers — pause game and show modal
      if (dt >= PHASE2_TIME && toolRef.current === "hands" && !hammerOfferedRef.current) {
        hammerOfferedRef.current = true;
        toolPromptRef.current = "hammer";
        setToolPrompt("hammer");
        pauseStartRef.current = performance.now();
        setPaused(true);
      }
      if (dt >= PHASE3_TIME && !excavatorOfferedRef.current) {
        excavatorOfferedRef.current = true;
        toolPromptRef.current = "excavator";
        setToolPrompt("excavator");
        pauseStartRef.current = performance.now();
        setPaused(true);
      }

      // Safety auto-end
      if (dt >= GAME_END_TIME + 10 && !endTriggeredRef.current) {
        endTriggeredRef.current = true;
        setGameState("ended");
      }

      // Update particles
      particlesRef.current = particlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.15,
          life: p.life - p.decay,
        }))
        .filter((p) => p.life > 0);
      setParticles([...particlesRef.current]);

      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState]);

  const startGame = useCallback(() => {
    setGameState("playing");
    setRockLevel(INITIAL_TUNNEL);
    rockLevelRef.current = INITIAL_TUNNEL;
    setCaveWidth(40);
    setTool("hands");
    toolRef.current = "hands";
    setTaps(0);
    tapsRef.current = 0;
    setHandsTaps(0);
    handsTapsRef.current = 0;
    setElapsed(0);
    setMoneyOwed(0);
    setToolPrompt(null);
    toolPromptRef.current = null;
    hammerOfferedRef.current = false;
    excavatorOfferedRef.current = false;
    pauseStartRef.current = null;
    totalPausedRef.current = 0;
    setPaused(false);
    lastMilestoneRef.current = -1;
    dialogueIndexRef.current = 0;
    lastDialogueTimeRef.current = 0;
    setDialogue(null);
    setMilestone(null);
    setMoneyFalling(false);
    setWaterHeight(0);
    setDrowned(false);
    drownedRef.current = false;
    waterDrainTimeRef.current = null;
    waterDrainLevelRef.current = 0;
    waterHeightRef.current = 0;
    particlesRef.current = [];
    setParticles([]);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        maxHeight: "900px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#000",
        overflow: "hidden",
        position: "relative",
        touchAction: "manipulation",
        userSelect: "none",
      }}
    >
      <Scanlines />
      <Vignette />
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          height: "100%",
          position: "relative",
          background: "#0a0a1a",
          overflow: "hidden",
        }}
      >
        {gameState === "title" && <TitleScreen onStart={() => setGameState("intro")} />}

        {gameState === "intro" && <IntroScreen onDone={startGame} />}

        {gameState === "ended" && (
          <EndScreen stats={{
            taps: tapsRef.current,
            handsTaps: handsTapsRef.current,
            drowned: drownedRef.current,
            rockLevel: rockLevelRef.current,
            totalRock: TOTAL_ROCK,
            handsProgress: Math.min(handsTapsRef.current * TOOLS.hands.chipSize, TOTAL_ROCK),
            equippedHammer: toolRef.current !== "hands",
            equippedDigger: toolRef.current === "excavator",
          }} />
        )}

        {gameState === "playing" && (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{
              width: "100%",
              display: "block",
              transform: `translate(${shakeX}px, ${shakeY}px)`,
            }}
          >
            {/* Background — deep cave */}
            <rect width={W} height={H} fill="#0a0a1a" />

            {/* Cave walls — dark gradient sides */}
            <rect x={0} y={0} width={30} height={H} fill="#0d0806" opacity={0.6} />
            <rect x={W - 30} y={0} width={30} height={H} fill="#0d0806" opacity={0.6} />

            {/* Money pile at top */}
            <MoneyBag y={ROCK_TOP - 30} />

            {/* Money falling animation */}
            {moneyFalling && [...Array(20)].map((_, i) => (
              <text
                key={`fall-${i}`}
                x={W / 2 - 40 + (i * 17) % 80}
                y={ROCK_TOP + 10}
                fontSize={6 + (i % 3) * 3}
                fill={i % 2 === 0 ? "#ffdd44" : "#44dd44"}
                fontFamily={PIXEL_FONT}
                opacity={0.8}
              >
                <animate
                  attributeName="y"
                  from={ROCK_TOP + 10}
                  to={ROCK_BOTTOM + 50}
                  dur={`${0.6 + i * 0.1}s`}
                  fill="freeze"
                />
                <animate
                  attributeName="opacity"
                  from="0.8"
                  to="0.3"
                  dur={`${0.6 + i * 0.1}s`}
                  fill="freeze"
                />
                $
              </text>
            ))}

            {/* Rock face */}
            <RockFace rockLevel={rockLevel} caveWidth={caveWidth} />

            {/* Water rising in tunnel */}
            <WaterLevel
              waterHeight={waterHeight}
              tunnelX={W / 2 - caveWidth / 2}
              tunnelW={caveWidth}
              tunnelBottom={ROCK_BOTTOM}
            />

            {/* Student character — floats up with water */}
            <PixelStudent
              x={W / 2}
              y={waterHeight > 8 ? ROCK_BOTTOM - waterHeight + 4 : ROCK_BOTTOM - 4}
              waterAbove={waterHeight > 8 ? 8 : Math.max(waterHeight - 4, 0)}
            />

            {/* Water warning */}
            {waterHeight > 10 && waterHeight < rockLevel - 10 && (
              <text
                x={W / 2}
                y={ROCK_BOTTOM - waterHeight + 10}
                textAnchor="middle"
                fontSize="4.5"
                fill="#ff4444"
                fontFamily={PIXEL_FONT}
                opacity={Math.min(waterHeight / 30, 0.9)}
              >
                WATER RISING
              </text>
            )}

            {/* Player area at bottom */}
            <rect x={0} y={ROCK_BOTTOM} width={W} height={H - ROCK_BOTTOM} fill="#0a0a1a" />

            {/* Tool label */}
            <text
              x={20}
              y={ROCK_BOTTOM + 18}
              fontSize="5"
              fill={TOOLS[tool].color}
              fontFamily={PIXEL_FONT}
            >
              {TOOLS[tool].label}
            </text>

            {/* DIG button — bottom right */}
            <g
              cursor="pointer"
              onClick={handleTap}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); handleTap(); }}
            >
              <rect
                x={W - 120}
                y={ROCK_BOTTOM + 4}
                width={110}
                height={50}
                rx={4}
                fill={TOOLS[tool].color}
                opacity={0.9}
              />
              <rect
                x={W - 118}
                y={ROCK_BOTTOM + 6}
                width={106}
                height={46}
                rx={3}
                fill="rgba(0,0,0,0.3)"
              />
              {/* Tool icon inside button */}
              <g transform={`translate(${W - 98}, ${ROCK_BOTTOM + 28})`}>
                {tool === "hands" && <PixelHands x={0} y={0} />}
                {tool === "hammer" && <PixelHammer x={0} y={0} />}
                {tool === "excavator" && <PixelExcavator x={0} y={0} />}
              </g>
              <text
                x={W - 48}
                y={ROCK_BOTTOM + 26}
                textAnchor="middle"
                fontSize="5"
                fill="rgba(255,255,255,0.7)"
                fontFamily={PIXEL_FONT}
              >
                TAP TO
              </text>
              <text
                x={W - 48}
                y={ROCK_BOTTOM + 40}
                textAnchor="middle"
                fontSize="10"
                fill="#fff"
                fontFamily={PIXEL_FONT}
              >
                DIG
              </text>
            </g>

            {/* Particles */}
            {particles.map((p) => (
              <Particle key={p.id} {...p} opacity={p.life} />
            ))}

            {/* Speech bubbles */}
            {dialogue && dialogueOpacity > 0 && (
              <SpeechBubble
                x={dialogue.speaker === "leg" ? W / 2 - 55 : W / 2 + 55}
                y={ROCK_BOTTOM + 130}
                text={dialogue.text}
                speaker={dialogue.speaker}
                opacity={dialogueOpacity}
              />
            )}

            {/* HUD — top area */}
            <rect x={0} y={0} width={W} height={32} fill="rgba(0,0,0,0.7)" />

            {/* Money owed counter */}
            <text x={10} y={14} fontSize="4.5" fill="#888899" fontFamily={PIXEL_FONT}>
              FORSYTH OWED
            </text>
            <text x={10} y={26} fontSize="7" fill="#44dd44" fontFamily={PIXEL_FONT}>
              ${moneyOwed}M
            </text>

            {/* Progress */}
            <text x={W - 10} y={14} textAnchor="end" fontSize="4.5" fill="#888899" fontFamily={PIXEL_FONT}>
              PROGRESS
            </text>
            <text x={W - 10} y={26} textAnchor="end" fontSize="7" fill="#ff8866" fontFamily={PIXEL_FONT}>
              {Math.floor((rockLevel / TOTAL_ROCK) * 100)}%
            </text>

            {/* Tap counter */}
            <text x={W / 2} y={14} textAnchor="middle" fontSize="4.5" fill="#888899" fontFamily={PIXEL_FONT}>
              TAPS
            </text>
            <text x={W / 2} y={26} textAnchor="middle" fontSize="7" fill="#ffcc44" fontFamily={PIXEL_FONT}>
              {taps}
            </text>

            {/* Timeline */}
            <TimelineBar elapsed={elapsed} currentYear={currentYear} />

            {/* Milestone flash */}
            <MilestoneFlash milestone={milestone} opacity={milestoneOpacity} />

            {/* Arrow hint pointing at DIG button — first few seconds only */}
            {elapsed < 4 && (
              <text
                x={W - 65}
                y={ROCK_BOTTOM - 6}
                textAnchor="middle"
                fontSize="8"
                fill="#ffcc44"
                fontFamily={PIXEL_FONT}
                opacity={0.6}
              >
                ↓
              </text>
            )}
          </svg>
        )}

        {/* Tool equip modal — pauses gameplay */}
        {paused && toolPrompt && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "20px",
              gap: "16px",
            }}
          >
            {/* Year header */}
            <div style={{
              fontFamily: PIXEL_FONT,
              fontSize: "14px",
              color: "#ffcc44",
              textAlign: "center",
              textShadow: "0 0 10px rgba(255,204,68,0.4)",
            }}>
              IT'S {toolPrompt === "hammer" ? "2026" : "2030"}
            </div>

            {/* Tool icon area */}
            <div style={{ marginBottom: "4px" }}>
              <svg viewBox="0 0 60 60" style={{ width: "70px", height: "70px" }}>
                <rect width={60} height={60} fill="transparent" />
                {toolPrompt === "hammer" ? (
                  <g transform="translate(30, 30)">
                    <PixelHammer x={0} y={0} />
                  </g>
                ) : (
                  <g transform="translate(30, 30)">
                    <PixelExcavator x={0} y={0} />
                  </g>
                )}
              </svg>
            </div>

            {/* Title */}
            <div style={{
              fontFamily: PIXEL_FONT,
              fontSize: "10px",
              color: toolPrompt === "hammer" ? "#44aaff" : "#ffaa44",
              textAlign: "center",
              lineHeight: "1.8",
              textShadow: `0 0 12px ${toolPrompt === "hammer" ? "rgba(68,170,255,0.4)" : "rgba(255,170,68,0.4)"}`,
            }}>
              {toolPrompt === "hammer" ? "ANITA EARLS HAMMER" : "FLIP THE COURT DIGGER"}
            </div>
            <div style={{
              fontFamily: PIXEL_FONT,
              fontSize: "7px",
              color: "#ccccdd",
              textAlign: "center",
              lineHeight: "2",
            }}>
              AVAILABLE — EQUIP?
            </div>

            {/* Context message */}
            <div style={{
              fontFamily: PIXEL_FONT,
              fontSize: "5.5px",
              color: "#8888aa",
              textAlign: "center",
              lineHeight: "2.2",
              maxWidth: "280px",
              marginTop: "4px",
            }}>
              {toolPrompt === "hammer" ? (
                <>
                  RE-ELECT JUSTICE ANITA EARLS.
                  <br />
                  HOLD THE LINE ON THE COURT.
                  <br />
                  <span style={{ color: "#ff6666" }}>THE WATER IS RISING.</span>
                </>
              ) : (
                <>
                  FLIP 3 SEATS. FLIP THE COURT.
                  <br />
                  BREAK THROUGH THE GRIDLOCK.
                  <br />
                  <span style={{ color: "#ff6666" }}>THE STUDENT CAN'T WAIT.</span>
                </>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <button
                onClick={() => equipTool(toolPrompt)}
                style={{
                  fontFamily: PIXEL_FONT,
                  fontSize: "10px",
                  color: "#fff",
                  background: toolPrompt === "hammer" ? "#2255aa" : "#aa6622",
                  padding: "14px 28px",
                  border: "none",
                  borderTop: `3px solid ${toolPrompt === "hammer" ? "#3366cc" : "#cc8833"}`,
                  borderLeft: `3px solid ${toolPrompt === "hammer" ? "#3366cc" : "#cc8833"}`,
                  borderBottom: `3px solid ${toolPrompt === "hammer" ? "#113377" : "#774411"}`,
                  borderRight: `3px solid ${toolPrompt === "hammer" ? "#113377" : "#774411"}`,
                  cursor: "pointer",
                }}
              >
                EQUIP
              </button>
              <button
                onClick={declineTool}
                style={{
                  fontFamily: PIXEL_FONT,
                  fontSize: "10px",
                  color: "#888899",
                  background: "#2a2a3a",
                  padding: "14px 28px",
                  border: "none",
                  borderTop: "3px solid #3a3a4a",
                  borderLeft: "3px solid #3a3a4a",
                  borderBottom: "3px solid #1a1a2a",
                  borderRight: "3px solid #1a1a2a",
                  cursor: "pointer",
                }}
              >
                DECLINE
              </button>
            </div>

            {/* Warning if declining */}
            <div style={{
              fontFamily: PIXEL_FONT,
              fontSize: "4.5px",
              color: "#ff4444",
              textAlign: "center",
              lineHeight: "2",
              marginTop: "4px",
            }}>
              {toolPrompt === "hammer"
                ? "DECLINE: BARE HANDS ONLY. YOU WILL DROWN."
                : "DECLINE: HAMMER ONLY. YOU WILL DROWN."}
            </div>
          </div>
        )}
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
