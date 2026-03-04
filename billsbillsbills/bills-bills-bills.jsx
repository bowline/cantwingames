"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const PIXEL_FONT = `var(--font-pixel), "Press Start 2P", monospace`;
const GAME_W = 360;
const GAME_H = 740;

// ─── Bill data ───
const BILLS_SMALL = [
  { name: "UTILITIES", cost: "$45", damage: 45, color: "#bb4444", ncStat: "Duke Energy made $4.4B profit — then raised your rates" },
  { name: "GROCERIES", cost: "$55", damage: 55, color: "#aa3838", ncStat: "NC grocery costs up 25% since 2020" },
  { name: "GAS", cost: "$35", damage: 35, color: "#b04040", ncStat: "Rural NC workers drive 30+ min avg commute" },
  { name: "COPAY", cost: "$40", damage: 40, color: "#a83c3c", ncStat: "NC had $6.5B in medical debt across 2.5 million people" },
];
const BILLS_MEDIUM = [
  { name: "RENT", cost: "$150", damage: 150, color: "#cc3333", ncStat: "Half of NC renters spend 30%+ of income just on rent" },
  { name: "RX DRUGS", cost: "$120", damage: 120, color: "#c42e2e", ncStat: "NC seniors pay 3x what Canadians pay for meds" },
  { name: "CAR PMT", cost: "$130", damage: 130, color: "#cc3030", ncStat: "Avg NC car payment: $733/mo" },
  { name: "INSURANCE", cost: "$140", damage: 140, color: "#c83232", ncStat: "NC insurance premiums doubled in 10 years" },
  { name: "CHILDCARE", cost: "$180", damage: 180, color: "#d03030", ncStat: "NC childcare costs more than in-state tuition" },
];
const BILLS_JUMBO = [
  { name: "TUITION", cost: "$350", damage: 350, color: "#dd2222", ncStat: "NC student debt avg: $36,000" },
  { name: "MEDICAL", cost: "$400", damage: 400, color: "#ee1111", ncStat: "NC ranks dead last in the country for healthcare costs" },
  { name: "MORTGAGE", cost: "$300", damage: 300, color: "#dd1a1a", ncStat: "Forsyth County property values jumped 55% in 2025" },
];

// Bill sizes (width, height, collision radius)
const SIZE_SMALL = { w: 28, h: 22, r: 10 };
const SIZE_MEDIUM = { w: 38, h: 30, r: 14 };
const SIZE_JUMBO = { w: 50, h: 40, r: 18 };

const PLAYER_R = 12;
const PAYCHECK_R = 14;
const STARTING_SAVINGS = 1000;
const PAYCHECK_VALUE = 200;
const SHIELD_VALUE = 200;
const PAYCHECK_INTERVAL = 9000; // ms

// Difficulty phases — compressed so death lands 20-30s
const PHASES = [
  { start: 0, end: 4, interval: 1000, pools: [{ bills: BILLS_SMALL, size: SIZE_SMALL, weight: 1 }], speedMult: 1.2 },
  { start: 4, end: 8, interval: 700, pools: [{ bills: BILLS_SMALL, size: SIZE_SMALL, weight: 2 }, { bills: BILLS_MEDIUM, size: SIZE_MEDIUM, weight: 3 }], speedMult: 1.6 },
  { start: 8, end: 12, interval: 500, pools: [{ bills: BILLS_SMALL, size: SIZE_SMALL, weight: 1 }, { bills: BILLS_MEDIUM, size: SIZE_MEDIUM, weight: 3 }, { bills: BILLS_JUMBO, size: SIZE_JUMBO, weight: 2 }], speedMult: 2.0 },
  { start: 12, end: 17, interval: 380, pools: [{ bills: BILLS_MEDIUM, size: SIZE_MEDIUM, weight: 2 }, { bills: BILLS_JUMBO, size: SIZE_JUMBO, weight: 4 }], speedMult: 2.5 },
  { start: 17, end: 22, interval: 280, pools: [{ bills: BILLS_MEDIUM, size: SIZE_MEDIUM, weight: 1 }, { bills: BILLS_JUMBO, size: SIZE_JUMBO, weight: 6 }], speedMult: 3.0 },
  { start: 22, end: 9999, interval: 200, pools: [{ bills: BILLS_JUMBO, size: SIZE_JUMBO, weight: 1 }], speedMult: 3.5 },
];

function getPhase(elapsed) {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (elapsed >= PHASES[i].start) return PHASES[i];
  }
  return PHASES[0];
}

function pickBill(phase) {
  const totalWeight = phase.pools.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * totalWeight;
  for (const pool of phase.pools) {
    r -= pool.weight;
    if (r <= 0) {
      const bill = pool.bills[Math.floor(Math.random() * pool.bills.length)];
      return { ...bill, size: pool.size };
    }
  }
  const last = phase.pools[phase.pools.length - 1];
  return { ...last.bills[0], size: last.size };
}

function spawnBillFromEdge(phase) {
  const bill = pickBill(phase);
  const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
  let x, y, vx, vy;
  const baseSpeed = 1.5 * phase.speedMult;
  const spread = (Math.random() - 0.5) * 0.8;

  // Target roughly toward center with spread
  const cx = GAME_W / 2 + (Math.random() - 0.5) * 120;
  const cy = GAME_H / 2 + (Math.random() - 0.5) * 200;

  switch (edge) {
    case 0: // top
      x = Math.random() * GAME_W;
      y = -bill.size.h;
      break;
    case 1: // right
      x = GAME_W + bill.size.w;
      y = Math.random() * GAME_H;
      break;
    case 2: // bottom
      x = Math.random() * GAME_W;
      y = GAME_H + bill.size.h;
      break;
    default: // left
      x = -bill.size.w;
      y = Math.random() * GAME_H;
      break;
  }

  const dx = cx - x;
  const dy = cy - y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  vx = (dx / dist) * baseSpeed + spread * baseSpeed;
  vy = (dy / dist) * baseSpeed + spread * baseSpeed;

  return {
    id: Math.random(),
    x, y, vx, vy,
    ...bill,
    rotation: Math.random() * 360,
    rotSpeed: (60 + Math.random() * 120) * (Math.random() < 0.5 ? 1 : -1), // deg/sec
    labelTimer: 1.0, // seconds to show label
  };
}

function spawnPaycheck() {
  const edge = Math.floor(Math.random() * 4);
  let x, y, vx, vy;
  const speed = 1.0;

  switch (edge) {
    case 0:
      x = 40 + Math.random() * (GAME_W - 80);
      y = -20;
      vx = (Math.random() - 0.5) * 0.3;
      vy = speed;
      break;
    case 1:
      x = GAME_W + 20;
      y = 100 + Math.random() * (GAME_H - 200);
      vx = -speed;
      vy = (Math.random() - 0.5) * 0.3;
      break;
    case 2:
      x = 40 + Math.random() * (GAME_W - 80);
      y = GAME_H + 20;
      vx = (Math.random() - 0.5) * 0.3;
      vy = -speed;
      break;
    default:
      x = -20;
      y = 100 + Math.random() * (GAME_H - 200);
      vx = speed;
      vy = (Math.random() - 0.5) * 0.3;
      break;
  }

  return { x, y, vx, vy, active: true };
}

// ─── House sprite (pixel art) ───
function HouseSprite({ x, y, shield }) {
  return (
    <g transform={`translate(${x - 14}, ${y - 16})`}>
      {/* Shield glow — green */}
      {shield > 0 && (
        <circle
          cx={14} cy={16}
          r={12 + (shield / SHIELD_VALUE) * 10}
          fill="none"
          stroke="#44dd66"
          strokeWidth={2}
          opacity={0.3 + (shield / SHIELD_VALUE) * 0.4}
        >
          <animate attributeName="opacity"
            values={`${0.2 + (shield / SHIELD_VALUE) * 0.3};${0.4 + (shield / SHIELD_VALUE) * 0.4};${0.2 + (shield / SHIELD_VALUE) * 0.3}`}
            dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      {shield > 0 && (
        <circle
          cx={14} cy={16}
          r={8 + (shield / SHIELD_VALUE) * 6}
          fill="#33aa44"
          opacity={0.08 + (shield / SHIELD_VALUE) * 0.12}
        />
      )}
      {/* Roof */}
      <polygon points="14,0 0,12 28,12" fill="#cc5533" stroke="#992211" strokeWidth={1} />
      {/* Chimney */}
      <rect x={20} y={2} width={4} height={8} fill="#886655" />
      {/* Body */}
      <rect x={3} y={12} width={22} height={18} fill="#ddcc88" stroke="#aa9955" strokeWidth={1} />
      {/* Door */}
      <rect x={11} y={19} width={6} height={11} fill="#664422" />
      <circle cx={15.5} cy={25} r={0.8} fill="#ffcc44" />
      {/* Window */}
      <rect x={5} y={15} width={5} height={5} fill="#88bbdd" stroke="#667788" strokeWidth={0.5} />
      <line x1={7.5} y1={15} x2={7.5} y2={20} stroke="#667788" strokeWidth={0.5} />
      <line x1={5} y1={17.5} x2={10} y2={17.5} stroke="#667788" strokeWidth={0.5} />
      <rect x={18} y={15} width={5} height={5} fill="#88bbdd" stroke="#667788" strokeWidth={0.5} />
      <line x1={20.5} y1={15} x2={20.5} y2={20} stroke="#667788" strokeWidth={0.5} />
      <line x1={18} y1={17.5} x2={23} y2={17.5} stroke="#667788" strokeWidth={0.5} />
    </g>
  );
}

// ─── Bill sprite ───
function BillSprite({ bill }) {
  const { x, y, rotation, size, cost, name, color, labelTimer } = bill;
  const showLabel = labelTimer > 0;
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <rect
        x={-size.w / 2} y={-size.h / 2}
        width={size.w} height={size.h}
        fill={color} rx={3}
        stroke="rgba(0,0,0,0.4)" strokeWidth={1}
      />
      <text
        x={0} y={size.h > 30 ? -2 : -1}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={size.h > 30 ? 10 : size.h > 24 ? 7 : 6}
        fill="#fff" fontFamily={PIXEL_FONT}
        stroke="rgba(0,0,0,0.5)" strokeWidth={1} paintOrder="stroke"
      >
        {name}
      </text>
      <text
        x={0} y={size.h > 30 ? 12 : size.h > 24 ? 9 : 7}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={size.h > 30 ? 7 : size.h > 24 ? 5.5 : 5}
        fill="rgba(255,255,255,0.7)" fontFamily={PIXEL_FONT}
      >
        {cost}
      </text>
      {showLabel && (
        <text
          x={0} y={size.h / 2 + 10}
          textAnchor="middle"
          fontSize="5" fill="#fff" fontFamily={PIXEL_FONT}
          opacity={Math.min(1, labelTimer * 2)}
        >
          {cost}
        </text>
      )}
    </g>
  );
}

// ─── Paycheck sprite ───
function PaycheckSprite({ paycheck }) {
  return (
    <g transform={`translate(${paycheck.x}, ${paycheck.y})`}>
      <rect x={-16} y={-10} width={32} height={20} rx={3}
        fill="#33aa44" stroke="#228833" strokeWidth={1.5} />
      <rect x={-14} y={-8} width={28} height={16} rx={2}
        fill="rgba(255,255,255,0.15)" />
      <text x={0} y={1} textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fill="#fff" fontFamily={PIXEL_FONT}
        stroke="rgba(0,0,0,0.4)" strokeWidth={1} paintOrder="stroke">
        $200
      </text>
      {/* Glow effect */}
      <circle cx={0} cy={0} r={18} fill="none" stroke="#44dd66" strokeWidth={1} opacity={0.4}>
        <animate attributeName="r" values="18;22;18" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.15;0.4" dur="1.2s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

// ─── Starfield background ───
function Starfield() {
  // Fixed stars seeded from simple deterministic positions
  const stars = [];
  for (let i = 0; i < 60; i++) {
    const x = ((i * 137 + 31) % GAME_W);
    const y = ((i * 191 + 73) % GAME_H);
    const size = (i % 3 === 0) ? 1.5 : 1;
    const opacity = 0.15 + (i % 5) * 0.08;
    stars.push(<circle key={i} cx={x} cy={y} r={size} fill="#fff" opacity={opacity} />);
  }
  return <g>{stars}</g>;
}

// ─── Health bar ───
function HealthBar({ savings, maxSavings }) {
  const pct = Math.max(0, savings / maxSavings);
  const barW = 200;
  const barH = 14;
  const color = pct > 0.6 ? "#44bb44" : pct > 0.3 ? "#ddaa33" : "#dd3333";
  return (
    <g transform="translate(8, 8)">
      <rect x={0} y={0} width={barW} height={barH} rx={2} fill="#1a1a2a" stroke="#333" strokeWidth={1} />
      <rect x={1} y={1} width={Math.max(0, (barW - 2) * pct)} height={barH - 2} rx={1} fill={color}>
        {pct < 0.3 && (
          <animate attributeName="opacity" values="1;0.6;1" dur="0.5s" repeatCount="indefinite" />
        )}
      </rect>
      <text x={barW / 2} y={barH / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fill="#fff" fontFamily={PIXEL_FONT}
        stroke="rgba(0,0,0,0.6)" strokeWidth={1.5} paintOrder="stroke">
        ${Math.max(0, Math.round(savings))}
      </text>
    </g>
  );
}

// ─── Title screen ───
function TitleScreen({ onStart, onShare }) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      width: "100%", maxWidth: `${GAME_W}px`, margin: "0 auto",
      background: "#0a0a1a", overflow: "hidden", height: "100%",
    }}>
      <svg viewBox={`0 0 ${GAME_W} ${GAME_H}`} style={{ width: "100%", display: "block" }}>
        {/* Background */}
        <defs>
          <radialGradient id="titleBg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1a1a3a" />
            <stop offset="100%" stopColor="#0a0a1a" />
          </radialGradient>
        </defs>
        <rect width={GAME_W} height={GAME_H} fill="url(#titleBg)" />
        <Starfield />

        {/* === SECTION 1: TITLE === */}
        <rect x={0} y={0} width={GAME_W} height={130} fill="rgba(0,0,0,0.5)" />

        <text x={GAME_W / 2} y={24} textAnchor="middle" fontSize="7" fill="#888899" fontFamily={PIXEL_FONT} letterSpacing="3">
          — DISTRICT 31 PRESENTS —
        </text>

        <text x={GAME_W / 2} y={55} textAnchor="middle" fontSize="18" fill="#ff8866" fontFamily={PIXEL_FONT}
          stroke="#331a00" strokeWidth="3" paintOrder="stroke">
          BILLS
        </text>
        <text x={GAME_W / 2} y={82} textAnchor="middle" fontSize="18" fill="#ffaa44" fontFamily={PIXEL_FONT}
          stroke="#332200" strokeWidth="3" paintOrder="stroke">
          BILLS
        </text>
        <text x={GAME_W / 2} y={109} textAnchor="middle" fontSize="18" fill="#ffcc44" fontFamily={PIXEL_FONT}
          stroke="#333300" strokeWidth="3" paintOrder="stroke">
          BILLS
        </text>

        <text x={GAME_W / 2} y={126} textAnchor="middle" fontSize="6.5" fill="#8888aa" fontFamily={PIXEL_FONT}>
          HOW LONG CAN YOU SURVIVE?
        </text>

        {/* === SECTION 2: TWO INFO BOXES === */}
        {/* Box 1: DODGE THE BILLS — red */}
        <rect x={10} y={142} width={165} height={120} rx={5}
          fill="#1a0a0a" stroke="#cc3333" strokeWidth={2} />
        <text x={92} y={163} textAnchor="middle" fontSize="7.5" fill="#ff4444" fontFamily={PIXEL_FONT}>
          DODGE THE BILLS
        </text>
        {/* Example bills inside */}
        <g transform="translate(30, 185) rotate(-12)">
          <rect x={-16} y={-13} width={32} height={26} fill="#cc3333" rx={3} stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
          <text x={0} y={-2} textAnchor="middle" fontSize="7" fill="#fff" fontFamily={PIXEL_FONT}>GAS</text>
          <text x={0} y={8} textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.6)" fontFamily={PIXEL_FONT}>$35</text>
        </g>
        <g transform="translate(92, 205) rotate(8)">
          <rect x={-22} y={-17} width={44} height={34} fill="#cc3333" rx={3} stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
          <text x={0} y={-3} textAnchor="middle" fontSize="8" fill="#fff" fontFamily={PIXEL_FONT}>RENT</text>
          <text x={0} y={9} textAnchor="middle" fontSize="5.5" fill="rgba(255,255,255,0.6)" fontFamily={PIXEL_FONT}>$150</text>
        </g>
        <g transform="translate(148, 183) rotate(-5)">
          <rect x={-22} y={-17} width={44} height={34} fill="#dd2222" rx={3} stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
          <text x={0} y={-2} textAnchor="middle" fontSize="6.5" fill="#fff" fontFamily={PIXEL_FONT}>MEDICAL</text>
          <text x={0} y={9} textAnchor="middle" fontSize="5.5" fill="rgba(255,255,255,0.6)" fontFamily={PIXEL_FONT}>$400</text>
        </g>

        {/* Box 2: CATCH THE PAYCHECKS — green */}
        <rect x={185} y={142} width={165} height={120} rx={5}
          fill="#0a1a0a" stroke="#33aa44" strokeWidth={2} />
        <text x={267} y={163} textAnchor="middle" fontSize="7" fill="#44dd66" fontFamily={PIXEL_FONT}>
          CATCH PAYCHECKS
        </text>
        {/* House + paycheck + shield illustration */}
        <g transform="translate(233, 185)">
          {/* Shield glow — green */}
          <circle cx={14} cy={16} r={26} fill="none" stroke="#44dd66" strokeWidth={1.5} opacity={0.35} />
          <circle cx={14} cy={16} r={18} fill="#33aa44" opacity={0.08} />
          {/* House */}
          <polygon points="14,0 0,12 28,12" fill="#cc5533" stroke="#992211" strokeWidth={1} />
          <rect x={3} y={12} width={22} height={18} fill="#ddcc88" stroke="#aa9955" strokeWidth={1} />
          <rect x={11} y={19} width={6} height={11} fill="#664422" />
          <rect x={5} y={15} width={5} height={5} fill="#88bbdd" stroke="#667788" strokeWidth={0.5} />
          <rect x={18} y={15} width={5} height={5} fill="#88bbdd" stroke="#667788" strokeWidth={0.5} />
        </g>
        {/* Paycheck floating nearby — green */}
        <g transform="translate(283, 210)">
          <rect x={-18} y={-12} width={36} height={24} rx={3} fill="#33aa44" stroke="#228833" strokeWidth={1.5} />
          <text x={0} y={2} textAnchor="middle" fontSize="7" fill="#fff" fontFamily={PIXEL_FONT}>$200</text>
        </g>
        <text x={267} y={245} textAnchor="middle" fontSize="5.5" fill="#44bb55" fontFamily={PIXEL_FONT}>
          +$200 · SHIELD
        </text>

        {/* === SECTION 3: TAGLINE + BUTTONS === */}
        <rect x={0} y={275} width={GAME_W} height={110} fill="rgba(0,0,0,0.4)" />

        <text x={GAME_W / 2} y={296} textAnchor="middle" fontSize="7" fill="#ccccdd" fontFamily={PIXEL_FONT}>
          CAN YOU KEEP AFFORDING
        </text>
        <text x={GAME_W / 2} y={312} textAnchor="middle" fontSize="7" fill="#ccccdd" fontFamily={PIXEL_FONT}>
          THE BILLS WHEN YOUR
        </text>
        <text x={GAME_W / 2} y={328} textAnchor="middle" fontSize="7" fill="#ff8866" fontFamily={PIXEL_FONT}>
          PAYCHECK DOESN'T CHANGE?
        </text>

        {/* Start button */}
        <g cursor="pointer" onClick={onStart}>
          <rect x={55} y={342} width={150} height={34} rx={3}
            fill={blink ? "#4a8844" : "#3a7733"} stroke="#66bb66" strokeWidth={1} />
          <text x={130} y={364} textAnchor="middle" fontSize="12" fill="#ccffcc" fontFamily={PIXEL_FONT}>
            ▶ START
          </text>
        </g>

        {/* Share button */}
        <g cursor="pointer" onClick={onShare}>
          <rect x={215} y={342} width={85} height={34} rx={3}
            fill="#dd6644" stroke="#ee7755" strokeWidth={1} />
          <text x={257} y={364} textAnchor="middle" fontSize="10" fill="#fff" fontFamily={PIXEL_FONT}>
            SHARE
          </text>
        </g>

        {/* === SECTION 4: INSTRUCTIONS === */}
        <text x={GAME_W / 2} y={402} textAnchor="middle" fontSize="6" fill="#666677" fontFamily={PIXEL_FONT}>
          DRAG TO MOVE · ARROWS/WASD
        </text>

        {/* === SECTION 5: SOURCES + DONATE === */}
        <text x={GAME_W / 2} y={432} textAnchor="middle" fontSize="4.5" fill="#444455" fontFamily={PIXEL_FONT}>
          SOURCES: U.S. CENSUS · BLS · KFF · ZILLOW
        </text>
        <text x={GAME_W / 2} y={444} textAnchor="middle" fontSize="4.5" fill="#444455" fontFamily={PIXEL_FONT}>
          DUKE ENERGY · EPI 2024
        </text>

        <a href="https://secure.actblue.com/donate/andybowline" target="_blank" rel="noopener noreferrer">
          <g cursor="pointer">
            <rect x={GAME_W / 2 - 140} y={458} width={280} height={42} rx={3}
              fill="#1a3a1a" stroke="#3a6a3a" strokeWidth={1.5} />
            <text x={GAME_W / 2} y={483} textAnchor="middle" fontSize="9" fill="#44ff44" fontFamily={PIXEL_FONT}>
              CHIP IN $5? I HAVE BILLS TOO.
            </text>
          </g>
        </a>
      </svg>
    </div>
  );
}

// ─── End screen ───
function EndScreen({ stats, onRestart, onShare }) {
  const [showStats, setShowStats] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowStats(true), 500);
    const t2 = setTimeout(() => setShowMessage(true), 1800);
    const t3 = setTimeout(() => setShowCTA(true), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%", gap: "14px",
      padding: "20px", textAlign: "center",
    }}>
      {/* Header */}
      <div style={{ animation: "fadeIn 0.5s ease-out" }}>
        <div style={{ fontFamily: PIXEL_FONT, fontSize: "22px", color: "#ff4444", marginBottom: "10px",
          textShadow: "3px 3px 0px #330000" }}>
          YOU'RE BROKE
        </div>
        <div style={{ fontFamily: PIXEL_FONT, fontSize: "10px", color: "#ff8866", marginBottom: "4px" }}>
          SURVIVED: {stats.seconds.toFixed(1)}s
        </div>
      </div>

      {/* Phase 1: What killed you + stats */}
      {showStats && (
        <div style={{
          background: "#1a1a2a", border: "4px solid #3a3a5a",
          padding: "14px 24px", animation: "fadeIn 0.5s ease-out",
          width: "100%", maxWidth: "300px",
        }}>
          {stats.killedBy && (
            <div style={{ marginBottom: "14px", textAlign: "center" }}>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#aa6666", marginBottom: "6px", letterSpacing: "2px" }}>
                THE BILL THAT BROKE YOU
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "16px", color: "#ff4444", marginBottom: "4px",
                textShadow: "2px 2px 0px #330000" }}>
                {stats.killedBy.name}
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "10px", color: "#ff8866" }}>
                {stats.killedBy.cost}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginBottom: "4px" }}>
            <div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "14px", color: "#ff4444" }}>
                ${Math.round(stats.totalDamage)}
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#aa6666" }}>BILLS HIT</div>
            </div>
            <div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "14px", color: "#44dd66" }}>
                {stats.paychecks}
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#44aa55" }}>PAYCHECKS</div>
            </div>
            <div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "14px", color: "#888888" }}>
                {stats.billsDodged}
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#666666" }}>DODGED</div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: The message — tied to what killed you */}
      {showMessage && (
        <div style={{ animation: "fadeIn 1s ease-out", maxWidth: "300px" }}>
          {stats.killedBy?.ncStat && (
            <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#ddaa33", marginBottom: "12px", lineHeight: "1.8",
              background: "#1a1a0a", border: "2px solid #554422", padding: "10px 14px", textAlign: "center" }}>
              {stats.killedBy.ncStat.toUpperCase()}
            </div>
          )}
          <div style={{ fontFamily: PIXEL_FONT, fontSize: "9px", color: "#ccccdd", lineHeight: "2.2", marginBottom: "10px" }}>
            THE BILLS KEEP GETTING BIGGER.
            <br />THE PAYCHECKS DON'T.
          </div>
          <div style={{ fontFamily: PIXEL_FONT, fontSize: "8px", color: "#ff8866", lineHeight: "2" }}>
            RALEIGH ISN'T TRYING TO FIX IT.
          </div>
        </div>
      )}

      {/* Phase 3: CTAs */}
      {showCTA && (
        <div style={{ animation: "fadeIn 1s ease-out", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <a href="https://andycantwin.com" target="_blank" rel="noopener noreferrer"
            style={{ textDecoration: "none", cursor: "pointer" }}>
            <div style={{
              background: "#1a2a1a", border: "3px solid #3a5a3a",
              padding: "12px 20px", transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#5a8a5a"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#3a5a3a"}>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "11px", color: "#ffaa44", marginBottom: "6px" }}>
                ANDY BOWLINE
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#88aa88", marginBottom: "4px" }}>
                NC SENATE · DISTRICT 31
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "8px", color: "#ff8866" }}>
                FIGHTING TO LOWER THE BILLS.
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#66aaff", marginTop: "6px" }}>
                ANDYCANTWIN.COM
              </div>
            </div>
          </a>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={onShare} style={{
              fontFamily: PIXEL_FONT, fontSize: "10px", color: "#fff",
              background: "#dd6644", padding: "12px 24px", border: "none",
              borderTop: "3px solid #ee7755", borderLeft: "3px solid #ee7755",
              borderBottom: "3px solid #aa4422", borderRight: "3px solid #aa4422",
              cursor: "pointer",
            }}>SHARE</button>
            <button onClick={() => { window.location.reload(); }} style={{
              fontFamily: PIXEL_FONT, fontSize: "10px", color: "#ccddff",
              background: "#4466aa", padding: "12px 24px", border: "none",
              borderTop: "3px solid #5577bb", borderLeft: "3px solid #5577bb",
              borderBottom: "3px solid #334488", borderRight: "3px solid #334488",
              cursor: "pointer",
            }}>PLAY AGAIN</button>
          </div>

          <a href="https://secure.actblue.com/donate/andybowline" target="_blank" rel="noopener noreferrer"
            style={{ textDecoration: "none", width: "100%", maxWidth: "280px" }}>
            <div style={{
              background: "#1a3a1a", border: "3px solid #3a6a3a",
              padding: "12px 20px", textAlign: "center", transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#5a9a5a"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#3a6a3a"}>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "9px", color: "#44ff44" }}>CHIP IN $5 TO FIGHT BACK.</div>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Scanlines CRT overlay ───
function Scanlines() {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      pointerEvents: "none", zIndex: 100,
    }} />
  );
}

// ─── Main game component ───
export default function BillsBillsBills() {
  const [gameState, setGameState] = useState("title");
  const [renderTick, setRenderTick] = useState(0);

  // All mutable game state lives in refs for rAF performance
  const playerRef = useRef({ x: GAME_W / 2, y: 500 });
  const billsRef = useRef([]);
  const paycheckRef = useRef(null);
  const savingsRef = useRef(STARTING_SAVINGS);
  const shieldRef = useRef(0);
  const elapsedRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const lastPaycheckRef = useRef(0);
  const paycheckTimerRef = useRef(PAYCHECK_INTERVAL);
  const paychecksCaughtRef = useRef(0);
  const totalDamageRef = useRef(0);
  const billsDodgedRef = useRef(0);
  const killedByRef = useRef(null);
  const gameLoopRef = useRef(null);
  const gameStateRef = useRef("title");
  const keysRef = useRef({});
  const touchRef = useRef(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const lastFrameRef = useRef(0);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // ─── Touch handling ───
  const handleTouchStart = useCallback((e) => {
    if (gameStateRef.current !== "playing") return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = GAME_W / rect.width;
    const scaleY = GAME_H / rect.height;
    const svgX = (touch.clientX - rect.left) * scaleX;
    const svgY = (touch.clientY - rect.top) * scaleY;
    touchRef.current = {
      offsetX: playerRef.current.x - svgX,
      offsetY: playerRef.current.y - svgY,
    };
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (gameStateRef.current !== "playing" || !touchRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = GAME_W / rect.width;
    const scaleY = GAME_H / rect.height;
    const svgX = (touch.clientX - rect.left) * scaleX;
    const svgY = (touch.clientY - rect.top) * scaleY;
    const newX = Math.max(14, Math.min(GAME_W - 14, svgX + touchRef.current.offsetX));
    const newY = Math.max(60, Math.min(GAME_H - 40, svgY + touchRef.current.offsetY));
    playerRef.current.x = newX;
    playerRef.current.y = newY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchRef.current = null;
  }, []);

  // ─── Keyboard handling ───
  useEffect(() => {
    if (gameState !== "playing") return;
    const onDown = (e) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(k)) {
        e.preventDefault();
        keysRef.current[k] = true;
      }
    };
    const onUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      keysRef.current = {};
    };
  }, [gameState]);

  // ─── Game loop ───
  useEffect(() => {
    if (gameState !== "playing") return;

    const tick = (timestamp) => {
      if (!lastFrameRef.current) lastFrameRef.current = timestamp;
      const dt = Math.min((timestamp - lastFrameRef.current) / 1000, 0.05); // cap at 50ms
      lastFrameRef.current = timestamp;

      const now = Date.now();
      elapsedRef.current = (now - startTimeRef.current) / 1000;
      const elapsed = elapsedRef.current;
      const phase = getPhase(elapsed);

      // ─── Keyboard movement ───
      const speed = 4;
      const k = keysRef.current;
      let dx = 0, dy = 0;
      if (k["arrowleft"] || k["a"]) dx -= speed;
      if (k["arrowright"] || k["d"]) dx += speed;
      if (k["arrowup"] || k["w"]) dy -= speed;
      if (k["arrowdown"] || k["s"]) dy += speed;
      if (dx !== 0 || dy !== 0) {
        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
          dx *= 0.707;
          dy *= 0.707;
        }
        playerRef.current.x = Math.max(14, Math.min(GAME_W - 14, playerRef.current.x + dx));
        playerRef.current.y = Math.max(60, Math.min(GAME_H - 40, playerRef.current.y + dy));
      }

      // ─── Spawn bills ───
      if (now - lastSpawnRef.current > phase.interval) {
        billsRef.current.push(spawnBillFromEdge(phase));
        lastSpawnRef.current = now;
      }

      // ─── Update bills ───
      const px = playerRef.current.x;
      const py = playerRef.current.y;
      let hitBill = null;

      billsRef.current = billsRef.current.filter(bill => {
        // Move
        bill.x += bill.vx;
        bill.y += bill.vy;
        bill.rotation += bill.rotSpeed * dt;
        bill.labelTimer -= dt;

        // Cull off-screen
        if (bill.x < -80 || bill.x > GAME_W + 80 || bill.y < -80 || bill.y > GAME_H + 80) {
          billsDodgedRef.current++;
          return false;
        }

        // Collision
        if (!hitBill) {
          const cdx = px - bill.x;
          const cdy = py - bill.y;
          const dist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (dist < PLAYER_R + bill.size.r) {
            hitBill = bill;
          }
        }

        return true;
      });

      // ─── Handle bill collision ───
      if (hitBill) {
        let dmg = hitBill.damage;
        // Remove the bill that hit
        billsRef.current = billsRef.current.filter(b => b.id !== hitBill.id);

        // Shield absorbs first
        if (shieldRef.current > 0) {
          const absorbed = Math.min(shieldRef.current, dmg);
          shieldRef.current -= absorbed;
          dmg -= absorbed;
        }

        if (dmg > 0) {
          savingsRef.current -= dmg;
          totalDamageRef.current += dmg;
        } else {
          totalDamageRef.current += hitBill.damage;
        }

        if (savingsRef.current <= 0) {
          savingsRef.current = 0;
          killedByRef.current = hitBill;
          cancelAnimationFrame(gameLoopRef.current);
          gameLoopRef.current = null;
          setGameState("gameover");
          return;
        }
      }

      // ─── Paycheck timer ───
      paycheckTimerRef.current = PAYCHECK_INTERVAL - (now - lastPaycheckRef.current);
      if (paycheckTimerRef.current <= 0 && !paycheckRef.current) {
        paycheckRef.current = spawnPaycheck();
        lastPaycheckRef.current = now;
      }

      // ─── Update paycheck ───
      if (paycheckRef.current) {
        const pc = paycheckRef.current;
        pc.x += pc.vx;
        pc.y += pc.vy;

        // Collision with player
        const pdx = px - pc.x;
        const pdy = py - pc.y;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pdist < PLAYER_R + PAYCHECK_R) {
          savingsRef.current = Math.min(STARTING_SAVINGS, savingsRef.current + PAYCHECK_VALUE);
          shieldRef.current = SHIELD_VALUE;
          paychecksCaughtRef.current++;
          paycheckRef.current = null;
        }
        // Cull if off screen
        else if (pc.x < -40 || pc.x > GAME_W + 40 || pc.y < -40 || pc.y > GAME_H + 40) {
          paycheckRef.current = null;
        }
      }

      // Trigger render
      setRenderTick(t => t + 1);

      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState]);

  // ─── Start game ───
  const startGame = useCallback(() => {
    playerRef.current = { x: GAME_W / 2, y: 500 };
    billsRef.current = [];
    paycheckRef.current = null;
    savingsRef.current = STARTING_SAVINGS;
    shieldRef.current = 0;
    elapsedRef.current = 0;
    startTimeRef.current = Date.now();
    lastSpawnRef.current = Date.now();
    lastPaycheckRef.current = Date.now();
    paycheckTimerRef.current = PAYCHECK_INTERVAL;
    paychecksCaughtRef.current = 0;
    totalDamageRef.current = 0;
    billsDodgedRef.current = 0;
    killedByRef.current = null;
    lastFrameRef.current = 0;
    keysRef.current = {};
    touchRef.current = null;
    setGameState("playing");
  }, []);

  // ─── Share handler ───
  const handleShare = useCallback(async () => {
    const url = "https://games.andycantwin.com/billsbillsbills";
    let text;
    if (gameState === "gameover") {
      text = `I survived ${elapsedRef.current.toFixed(1)} seconds of Bills Bills Bills before going broke.\n\nThe bills keep getting bigger. The paychecks don't.\n\nHow long can you last?`;
    } else {
      text = `Rent. Groceries. Medical bills. They're coming from every direction.\n\nHow long can you survive "Bills Bills Bills"?`;
    }
    if (navigator.share) {
      try { await navigator.share({ title: "Bills Bills Bills", text, url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text}\n\n${url}`);
      alert("Link copied to clipboard!");
    } catch {
      prompt("Copy this link to share:", url);
    }
  }, [gameState]);

  // ─── Read refs for rendering ───
  const player = playerRef.current;
  const bills = billsRef.current;
  const paycheck = paycheckRef.current;
  const savings = savingsRef.current;
  const shield = shieldRef.current;
  const elapsed = elapsedRef.current;
  const paycheckCountdown = Math.max(0, Math.ceil(paycheckTimerRef.current / 1000));
  const paycheckOnScreen = !!paycheckRef.current;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%", maxWidth: "420px", margin: "0 auto",
        height: "100dvh", maxHeight: "900px",
        background: "#0a0a1a", position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "0 0 40px rgba(0,0,0,0.8)",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      <Scanlines />

      {/* CRT border effect */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: "4px",
        boxShadow: "inset 0 0 60px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.3)",
        pointerEvents: "none", zIndex: 101,
      }} />

      {gameState === "title" && (
        <TitleScreen onStart={startGame} onShare={handleShare} />
      )}

      {gameState === "playing" && (
        <div
          style={{
            width: "100%", height: "100%", position: "relative",
            touchAction: "none", userSelect: "none", WebkitUserSelect: "none",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${GAME_W} ${GAME_H}`}
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            {/* Background */}
            <defs>
              <radialGradient id="gameBg" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#12122a" />
                <stop offset="100%" stopColor="#0a0a1a" />
              </radialGradient>
            </defs>
            <rect width={GAME_W} height={GAME_H} fill="url(#gameBg)" />
            <Starfield />

            {/* HUD background */}
            <rect x={0} y={0} width={GAME_W} height={50} fill="rgba(0,0,0,0.7)" />

            {/* Health bar */}
            <HealthBar savings={savings} maxSavings={STARTING_SAVINGS} />

            {/* Timer */}
            <text x={GAME_W - 8} y={18} textAnchor="end" fontSize="8" fill="#aaaacc" fontFamily={PIXEL_FONT}>
              {elapsed.toFixed(1)}s
            </text>

            {/* Paycheck countdown */}
            <text x={GAME_W / 2} y={38} textAnchor="middle" fontSize="5" fontFamily={PIXEL_FONT}
              fill={paycheckOnScreen ? "#44dd66" : "#555566"}>
              {paycheckOnScreen ? "PAYCHECK!" : `PAYCHECK IN: ${paycheckCountdown}s`}
            </text>

            {/* Shield indicator */}
            {shield > 0 && (
              <text x={8} y={38} fontSize="5" fill="#44dd66" fontFamily={PIXEL_FONT}>
                SHIELD: ${Math.round(shield)}
              </text>
            )}

            {/* Bills */}
            {bills.map(bill => (
              <BillSprite key={bill.id} bill={bill} />
            ))}

            {/* Paycheck */}
            {paycheck && <PaycheckSprite paycheck={paycheck} />}

            {/* Player */}
            <HouseSprite x={player.x} y={player.y} shield={shield} />

            {/* Bottom hint */}
            <text x={GAME_W / 2} y={GAME_H - 10} textAnchor="middle"
              fontSize="5" fill="#333344" fontFamily={PIXEL_FONT}>
              {elapsed < 3 ? "DRAG TO MOVE · ARROWS/WASD" : ""}
            </text>
          </svg>
        </div>
      )}

      {gameState === "gameover" && (
        <EndScreen
          stats={{
            seconds: elapsedRef.current,
            totalDamage: totalDamageRef.current,
            paychecks: paychecksCaughtRef.current,
            billsDodged: billsDodgedRef.current,
            killedBy: killedByRef.current,
          }}
          onRestart={startGame}
          onShare={handleShare}
        />
      )}
    </div>
  );
}
