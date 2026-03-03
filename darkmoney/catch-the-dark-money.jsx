"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const PIXEL_FONT = `var(--font-pixel), "Press Start 2P", monospace`;

const PACS = [
  { id: "freedom", name: "NC FREEDOM FUND", short: ["NC FREEDOM", "FUND"], color: "#cc4444" },
  { id: "liberty", name: "LIBERTY FIRST NC", short: ["LIBERTY", "FIRST NC"], color: "#4a9e4a" },
  { id: "progress", name: "BRIGHTER TOMORROW NC", short: ["BRIGHTER", "TOMORROW NC"], color: "#dd8833" },
  { id: "future", name: "FUTURE NC ALLIANCE", short: ["FUTURE NC", "ALLIANCE"], color: "#8866bb" },
  { id: "families", name: "NC HEARTLAND COALITION", short: ["NC HEARTLAND", "COALITION"], color: "#66bbdd" },
  { id: "growth", name: "RISING TIDE NC", short: ["RISING", "TIDE NC"], color: "#dd6688" },
  { id: "patriot", name: "SOVEREIGN VOICE PAC", short: ["SOVEREIGN", "VOICE PAC"], color: "#cc8833" },
  { id: "taxpayer", name: "TAXPAYER DEFENSE FUND", short: ["TAXPAYER", "DEFENSE"], color: "#5588aa" },
  { id: "heritage", name: "HERITAGE NC", short: ["HERITAGE", "NC"], color: "#44aa66" },
];

const GAME_DURATION = 30;

// Difficulty phases: [startSec, endSec, minMoles, maxMoles, visibleMs, amounts]
const PHASES = [
  { start: 0, end: 8, min: 1, max: 1, visible: 1500, amounts: [10, 15, 20, 25] },
  { start: 8, end: 15, min: 1, max: 2, visible: 1200, amounts: [25, 50, 75] },
  { start: 15, end: 22, min: 2, max: 3, visible: 900, amounts: [50, 100, 150, 250] },
  { start: 22, end: 30, min: 3, max: 4, visible: 600, amounts: [250, 500, 750] },
];

function getPhase(elapsed) {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (elapsed >= PHASES[i].start) return PHASES[i];
  }
  return PHASES[0];
}

function formatMoney(k) {
  if (k >= 1000) return `$${(k / 1000).toFixed(1)}M`;
  return `$${k}K`;
}

function randomPac(exclude) {
  const available = PACS.filter((p) => !exclude.includes(p.id));
  if (available.length === 0) return PACS[Math.floor(Math.random() * PACS.length)];
  return available[Math.floor(Math.random() * available.length)];
}

function randomAmount(phase) {
  return phase.amounts[Math.floor(Math.random() * phase.amounts.length)];
}

// Scanlines CRT overlay
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

// Pixel button
function PixelButton({ children, onClick, variant = "default", style = {} }) {
  const variants = {
    default: {
      bg: "#4a8844",
      borderLight: "#5a9955",
      borderDark: "#2a5522",
      text: "#ccffcc",
    },
    cta: {
      bg: "#dd6644",
      borderLight: "#ee7755",
      borderDark: "#aa4422",
      text: "#fff",
    },
    respond: {
      bg: "#4466aa",
      borderLight: "#5577bb",
      borderDark: "#334488",
      text: "#ccddff",
    },
  };
  const v = variants[variant] || variants.default;
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: PIXEL_FONT,
        fontSize: "9px",
        color: v.text,
        background: v.bg,
        padding: "10px 20px",
        border: "none",
        borderTop: `3px solid ${v.borderLight}`,
        borderLeft: `3px solid ${v.borderLight}`,
        borderBottom: `3px solid ${v.borderDark}`,
        borderRight: `3px solid ${v.borderDark}`,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// Single mole cell in the 3x3 SVG grid
function MoleCell({ x, y, size, hole, onCatch }) {
  const cellPad = 4;
  const holeX = x + cellPad;
  const holeY = y + cellPad;
  const holeW = size - cellPad * 2;
  const holeH = size - cellPad * 2;

  if (!hole || hole.state === "idle") {
    // Empty dark hole
    return (
      <g>
        <rect x={holeX} y={holeY} width={holeW} height={holeH} rx="6" fill="#0d0d1a" stroke="#1a1a2e" strokeWidth="2" />
        <rect x={holeX + 4} y={holeY + 4} width={holeW - 8} height={holeH - 8} rx="4" fill="#08081a" opacity="0.6" />
      </g>
    );
  }

  const pac = hole.pac;
  const amount = hole.amount;
  const cx = holeX + holeW / 2;
  const cy = holeY + holeH / 2;

  if (hole.state === "caught") {
    return (
      <g onClick={() => {}}>
        <rect x={holeX} y={holeY} width={holeW} height={holeH} rx="6" fill="#1a3a1a" stroke="#33ff66" strokeWidth="2">
          <animate attributeName="opacity" from="1" to="0" dur="0.4s" fill="freeze" />
        </rect>
        <text x={cx} y={cy - 6} textAnchor="middle" fontFamily={PIXEL_FONT} fontSize="8" fill="#33ff66">
          CAUGHT!
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontFamily={PIXEL_FONT} fontSize="7" fill="#66ff99">
          {formatMoney(amount)}
        </text>
      </g>
    );
  }

  if (hole.state === "escaped") {
    return (
      <g>
        <rect x={holeX} y={holeY} width={holeW} height={holeH} rx="6" fill="#3a1a1a" stroke="#ff4444" strokeWidth="2">
          <animate attributeName="opacity" from="1" to="0" dur="0.5s" fill="freeze" />
        </rect>
        <text x={cx} y={cy - 2} textAnchor="middle" fontFamily={PIXEL_FONT} fontSize="7" fill="#ff4444">
          <animate attributeName="y" from={cy - 2} to={cy - 20} dur="0.5s" fill="freeze" />
          <animate attributeName="opacity" from="1" to="0" dur="0.5s" fill="freeze" />
          {formatMoney(amount)}
        </text>
      </g>
    );
  }

  // Active mole
  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onCatch(hole.cellIndex);
      }}
      style={{ cursor: "pointer" }}
    >
      {/* Hole background with PAC color */}
      <rect x={holeX} y={holeY} width={holeW} height={holeH} rx="6" fill={pac.color} stroke="#fff" strokeWidth="1.5" opacity="0.9">
        <animate attributeName="opacity" from="0" to="0.9" dur="0.15s" fill="freeze" />
      </rect>

      {/* Money bag icon */}
      <text x={cx} y={holeY + 20} textAnchor="middle" fontSize="18">
        <animate attributeName="y" from={holeY + holeH} to={holeY + 20} dur="0.15s" fill="freeze" />
        💰
      </text>

      {/* Dollar amount - primary visual */}
      <text x={cx} y={holeY + 42} textAnchor="middle" fontFamily={PIXEL_FONT} fontSize="11" fill="#fff" fontWeight="bold">
        <animate attributeName="y" from={holeY + holeH} to={holeY + 42} dur="0.15s" fill="freeze" />
        {formatMoney(amount)}
      </text>

      {/* PAC name abbreviated - 2 lines */}
      <text x={cx} y={holeY + 56} textAnchor="middle" fontFamily={PIXEL_FONT} fontSize="4.5" fill="rgba(255,255,255,0.8)">
        <animate attributeName="y" from={holeY + holeH} to={holeY + 56} dur="0.15s" fill="freeze" />
        {pac.short[0]}
      </text>
      <text x={cx} y={holeY + 63} textAnchor="middle" fontFamily={PIXEL_FONT} fontSize="4.5" fill="rgba(255,255,255,0.8)">
        <animate attributeName="y" from={holeY + holeH} to={holeY + 63} dur="0.15s" fill="freeze" />
        {pac.short[1]}
      </text>

      {/* Tap target highlight */}
      <rect x={holeX} y={holeY} width={holeW} height={holeH} rx="6" fill="transparent" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    </g>
  );
}

// The 3x3 grid
function MoleGrid({ holes, onCatch, gridSize }) {
  const cellSize = gridSize / 3;
  return (
    <svg
      viewBox={`0 0 ${gridSize} ${gridSize}`}
      style={{ width: "100%", maxWidth: `${gridSize}px`, imageRendering: "auto", touchAction: "manipulation" }}
    >
      {/* Grid background */}
      <rect x="0" y="0" width={gridSize} height={gridSize} rx="8" fill="#111122" />

      {/* Grid lines */}
      <line x1={cellSize} y1="4" x2={cellSize} y2={gridSize - 4} stroke="#1a1a2e" strokeWidth="1" />
      <line x1={cellSize * 2} y1="4" x2={cellSize * 2} y2={gridSize - 4} stroke="#1a1a2e" strokeWidth="1" />
      <line x1="4" y1={cellSize} x2={gridSize - 4} y2={cellSize} stroke="#1a1a2e" strokeWidth="1" />
      <line x1="4" y1={cellSize * 2} x2={gridSize - 4} y2={cellSize * 2} stroke="#1a1a2e" strokeWidth="1" />

      {/* Cells */}
      {Array.from({ length: 9 }).map((_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <MoleCell
            key={i}
            x={col * cellSize}
            y={row * cellSize}
            size={cellSize}
            hole={holes[i]}
            onCatch={onCatch}
          />
        );
      })}
    </svg>
  );
}

// HUD during gameplay
function HUD({ timeLeft, darkMoney, caught, total }) {
  const urgent = timeLeft <= 10;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        width: "100%",
      }}
    >
      {/* Top row: timer + megacorp */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            fontFamily: PIXEL_FONT,
            fontSize: "11px",
            color: urgent ? "#ff4444" : "#66ff99",
            animation: urgent ? "blink 0.5s infinite" : undefined,
          }}
        >
          ⏱ {timeLeft}s
        </div>
        <div
          style={{
            fontFamily: PIXEL_FONT,
            fontSize: "7px",
            color: "#aaaacc",
            letterSpacing: "2px",
          }}
        >
          MEGACORP INC
        </div>
        <div
          style={{
            fontFamily: PIXEL_FONT,
            fontSize: "7px",
            color: "#66aa66",
          }}
        >
          {caught}/{total}
        </div>
      </div>

      {/* Dark money counter */}
      <div
        style={{
          background: "#1a0a0a",
          border: "2px solid #aa3333",
          padding: "6px 10px",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: PIXEL_FONT, fontSize: "5px", color: "#aa4444", marginBottom: "2px", letterSpacing: "2px" }}>
          DARK MONEY MOVED
        </div>
        <div
          style={{
            fontFamily: PIXEL_FONT,
            fontSize: "14px",
            color: "#ff4444",
            textShadow: "0 0 8px rgba(255,68,68,0.5)",
          }}
        >
          {formatMoney(darkMoney)}
        </div>
      </div>
    </div>
  );
}

// Title screen with scrolling PAC cards
const TITLE_W = 360;
const TITLE_H = 740;

function TitleScreen({ onStart, onShare }) {
  const [blink, setBlink] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let raf;
    const tick = () => {
      setScrollOffset((prev) => prev + 0.35);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cardW = 100;
  const cardGap = 10;
  const stripW = PACS.length * (cardW + cardGap);
  const amounts = ["$10K", "$50K", "$100K", "$250K", "$500K", "$75K", "$150K", "$25K", "$750K"];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: `${TITLE_W}px`,
        margin: "0 auto",
        background: "#0a0a1a",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <svg viewBox={`0 0 ${TITLE_W} ${TITLE_H}`} style={{ width: "100%", display: "block" }}>
        <rect width={TITLE_W} height={TITLE_H} fill="#0a0a1a" />

        {/* === SECTION 1: TITLE === */}
        <rect x={0} y={0} width={TITLE_W} height={115} fill="rgba(0,0,0,0.5)" />

        <text x={TITLE_W / 2} y={25} textAnchor="middle" fontSize="6" fill="#aa4444" fontFamily={PIXEL_FONT} letterSpacing="3">
          — MEGACORP INC PRESENTS —
        </text>

        <text x={TITLE_W / 2} y={55} textAnchor="middle" fontSize="16" fill="#ffcc44" fontFamily={PIXEL_FONT}
          stroke="#332200" strokeWidth="3" paintOrder="stroke">
          CATCH THE
        </text>
        <text x={TITLE_W / 2} y={80} textAnchor="middle" fontSize="16" fill="#ff8844" fontFamily={PIXEL_FONT}
          stroke="#331a00" strokeWidth="3" paintOrder="stroke">
          DARK MONEY
        </text>

        <text x={TITLE_W / 2} y={108} textAnchor="middle" fontSize="5.5" fill="#8888aa" fontFamily={PIXEL_FONT}>
          CAN YOU KEEP UP?
        </text>

        {/* === SECTION 2: SCROLLING PAC CARDS === */}
        <rect x={0} y={125} width={TITLE_W} height={145} fill="rgba(0,0,0,0.3)" />
        <text x={TITLE_W / 2} y={140} textAnchor="middle" fontSize="7" fill="#ff8866" fontFamily={PIXEL_FONT}>
          THE PACS MEGACORP USES:
        </text>

        <defs>
          <clipPath id="pacClip"><rect x={0} y={146} width={TITLE_W} height={120} /></clipPath>
          <linearGradient id="pacFadeL" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#0a0a1a" />
            <stop offset="100%" stopColor="#0a0a1a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pacFadeR" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#0a0a1a" stopOpacity="0" />
            <stop offset="100%" stopColor="#0a0a1a" />
          </linearGradient>
        </defs>

        <g clipPath="url(#pacClip)">
          {[...PACS, ...PACS].map((pac, i) => {
            let ox = i * (cardW + cardGap) - (scrollOffset % stripW);
            if (ox < -cardW - cardGap) ox += stripW * 2;
            if (ox < -(cardW + 10) || ox > TITLE_W + 10) return null;
            const amt = amounts[i % amounts.length];
            return (
              <g key={`${pac.id}-${i}`} transform={`translate(${ox}, 152)`}>
                <rect x={0} y={0} width={cardW} height={105} fill={pac.color} rx={6}
                  stroke="#000" strokeWidth={2} opacity={0.9} />
                <rect x={3} y={3} width={cardW - 6} height={99} fill="rgba(0,0,0,0.3)" rx={4} />
                <text x={cardW / 2} y={26} textAnchor="middle" fontSize="24">💰</text>
                <text x={cardW / 2} y={48} textAnchor="middle" fontSize="12" fill="#fff" fontFamily={PIXEL_FONT}
                  stroke="#000" strokeWidth="2" paintOrder="stroke">
                  {amt}
                </text>
                <text x={cardW / 2} y={68} textAnchor="middle" fontSize="5.5" fill="rgba(255,255,255,0.9)" fontFamily={PIXEL_FONT}>
                  {pac.short[0]}
                </text>
                <text x={cardW / 2} y={82} textAnchor="middle" fontSize="5.5" fill="rgba(255,255,255,0.9)" fontFamily={PIXEL_FONT}>
                  {pac.short[1]}
                </text>
                <text x={cardW / 2} y={98} textAnchor="middle" fontSize="4.5" fill="rgba(255,255,255,0.4)" fontFamily={PIXEL_FONT}>
                  DARK MONEY
                </text>
              </g>
            );
          })}
        </g>

        <rect x={0} y={146} width={30} height={120} fill="url(#pacFadeL)" />
        <rect x={TITLE_W - 30} y={146} width={30} height={120} fill="url(#pacFadeR)" />

        {/* === SECTION 3: INSTRUCTIONS + BUTTONS === */}
        <rect x={0} y={285} width={TITLE_W} height={85} fill="rgba(0,0,0,0.4)" />
        <text x={TITLE_W / 2} y={305} textAnchor="middle" fontSize="6.5" fill="#ffcc44" fontFamily={PIXEL_FONT}>
          CATCH THE MONEY BAGS BEFORE
        </text>
        <text x={TITLE_W / 2} y={318} textAnchor="middle" fontSize="6.5" fill="#ffcc44" fontFamily={PIXEL_FONT}>
          THEY DISAPPEAR · 30 SECONDS
        </text>

        {/* Start button */}
        <g cursor="pointer" onClick={onStart}>
          <rect x={60} y={328} width={140} height={30} rx={3}
            fill={blink ? "#4a8844" : "#3a7733"} stroke="#66bb66" strokeWidth={1} />
          <text x={130} y={348} textAnchor="middle" fontSize="11" fill="#ccffcc" fontFamily={PIXEL_FONT}>
            ▶ START
          </text>
        </g>

        {/* Share button */}
        <g cursor="pointer" onClick={onShare}>
          <rect x={210} y={328} width={80} height={30} rx={3}
            fill="#dd6644" stroke="#ee7755" strokeWidth={1} />
          <text x={250} y={348} textAnchor="middle" fontSize="9" fill="#fff" fontFamily={PIXEL_FONT}>
            SHARE
          </text>
        </g>

        {/* === SECTION 4: CONCEPT — MEGACORP → GRID === */}
        <rect x={0} y={385} width={TITLE_W} height={120} fill="rgba(255,255,255,0.02)" />

        {/* Left: MEGACORP building */}
        <g transform="translate(24, 398)">
          <rect x={5} y={0} width={80} height={80} fill="#1a1a2e" rx={4} stroke="#aa4444" strokeWidth={1.5} />
          <rect x={20} y={12} width={50} height={56} fill="#2a2a3e" />
          <rect x={25} y={18} width={10} height={10} fill="#3a3a5a" />
          <rect x={40} y={18} width={10} height={10} fill="#3a3a5a" />
          <rect x={55} y={18} width={10} height={10} fill="#3a3a5a" />
          <rect x={25} y={34} width={10} height={10} fill="#3a3a5a" />
          <rect x={40} y={34} width={10} height={10} fill="#3a3a5a" />
          <rect x={55} y={34} width={10} height={10} fill="#3a3a5a" />
          <rect x={38} y={52} width={14} height={16} fill="#4a4a6a" />
          <text x={45} y={68} textAnchor="middle" fontSize="14">🏢</text>
          <text x={45} y={97} textAnchor="middle" fontSize="6" fill="#ff4444" fontFamily={PIXEL_FONT}>MEGACORP</text>
        </g>

        {/* Arrow */}
        <text x={135} y={445} textAnchor="middle" fontSize="16" fill="#ffcc44" fontFamily={PIXEL_FONT}>→</text>

        {/* Right: 3x3 mini grid preview */}
        <g transform="translate(160, 395)">
          <rect x={0} y={0} width={170} height={95} fill="#111122" rx={4} stroke="#3a3a5a" strokeWidth={1} />
          {Array.from({ length: 9 }).map((_, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const pac = PACS[i];
            const active = i === 0 || i === 4 || i === 8;
            return (
              <g key={i}>
                <rect
                  x={col * 55 + 5}
                  y={row * 30 + 4}
                  width={50}
                  height={26}
                  rx="3"
                  fill={active ? pac.color : "#0d0d1a"}
                  stroke={active ? "#fff" : "#1a1a2e"}
                  strokeWidth="0.8"
                  opacity={active ? 0.85 : 1}
                />
                {active && (
                  <>
                    <text x={col * 55 + 16} y={row * 30 + 21} textAnchor="middle" fontSize="10">💰</text>
                    <text x={col * 55 + 38} y={row * 30 + 21} textAnchor="middle" fontFamily={PIXEL_FONT} fontSize="6" fill="#fff">
                      {amounts[i]}
                    </text>
                  </>
                )}
              </g>
            );
          })}
          <text x={85} y={112} textAnchor="middle" fontSize="5.5" fill="#ff8866" fontFamily={PIXEL_FONT}>TAP TO CATCH</text>
        </g>

        {/* === SECTION 5: HB 237 citation + donate === */}
        <text x={TITLE_W / 2} y={530} textAnchor="middle" fontSize="5" fill="#444455" fontFamily={PIXEL_FONT}>
          BASED ON NC HB 237 · SIGNED INTO LAW 2024
        </text>
        <text x={TITLE_W / 2} y={542} textAnchor="middle" fontSize="5" fill="#444455" fontFamily={PIXEL_FONT}>
          GOVERNOR VETOED · LEGISLATURE OVERRODE
        </text>

        <a href="https://secure.actblue.com/donate/andybowline" target="_blank" rel="noopener noreferrer">
          <g cursor="pointer">
            <rect x={TITLE_W / 2 - 135} y={558} width={270} height={38} rx={3}
              fill="#1a3a1a" stroke="#3a6a3a" strokeWidth={1.5} />
            <text x={TITLE_W / 2} y={573} textAnchor="middle" fontSize="5" fill="#88dd88" fontFamily={PIXEL_FONT}>
              AT LEAST THIS MONEY YOU CAN TRACE
            </text>
            <text x={TITLE_W / 2} y={588} textAnchor="middle" fontSize="7" fill="#44ff44" fontFamily={PIXEL_FONT}>
              CHIP IN $5 →
            </text>
          </g>
        </a>
      </svg>
    </div>
  );
}

// End screen with phased reveal
function EndScreen({ stats, onRestart, onShare }) {
  const [showStats, setShowStats] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowStats(true), 500);
    const t2 = setTimeout(() => setShowMessage(true), 1800);
    const t3 = setTimeout(() => setShowCTA(true), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: "14px",
        padding: "20px",
        textAlign: "center",
      }}
    >
      {/* Header */}
      <div style={{ animation: "fadeIn 0.5s ease-out" }}>
        <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#ff4444", marginBottom: "8px", letterSpacing: "2px" }}>
          ⏱ TIME'S UP
        </div>
        <div style={{ fontFamily: PIXEL_FONT, fontSize: "14px", color: "#ffcc44", textShadow: "2px 2px 0px #332200" }}>
          THE MONEY MOVED.
        </div>
      </div>

      {/* Phase 1: Stats */}
      {showStats && (
        <div
          style={{
            background: "#1a1a2a",
            border: "4px solid #3a3a5a",
            padding: "12px 20px",
            animation: "fadeIn 0.5s ease-out",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginBottom: "10px" }}>
            <div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "14px", color: "#33ff66" }}>{stats.caught}</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "5px", color: "#66aa66" }}>CAUGHT</div>
            </div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: "14px", color: "#555566", alignSelf: "center" }}>/</div>
            <div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "14px", color: "#ff4444" }}>{stats.total}</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "5px", color: "#aa6666" }}>TOTAL</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "10px", color: "#66ff99" }}>{formatMoney(stats.caughtTotal)}</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "5px", color: "#66aa66" }}>EXPOSED</div>
            </div>
            <div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "10px", color: "#ff4444" }}>{formatMoney(stats.darkMoney)}</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "5px", color: "#aa4444" }}>DARK MONEY</div>
            </div>
          </div>

          <div
            style={{
              fontFamily: PIXEL_FONT,
              fontSize: "6px",
              color: "#aa6666",
              marginTop: "8px",
              lineHeight: "1.8",
            }}
          >
            MEGACORP MOVED {formatMoney(stats.darkMoney)}
            <br />
            THROUGH NC PACS
          </div>
        </div>
      )}

      {/* Phase 2: The message */}
      {showMessage && (
        <div style={{ animation: "fadeIn 1s ease-out", maxWidth: "300px" }}>
          <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#ccccdd", lineHeight: "2", marginBottom: "8px" }}>
            HB 237 LETS CORPORATE MONEY
            <br />
            FLOW THROUGH 527s AND PACs
            <br />
            WITHOUT STATE REPORTING.
          </div>
          <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#ff8866", lineHeight: "2" }}>
            THE GOVERNOR VETOED IT.
            <br />
            THEY OVERRODE THE VETO.
          </div>
          <div style={{ fontFamily: PIXEL_FONT, fontSize: "8px", color: "#ffcc44", marginTop: "8px" }}>
            THIS IS LEGAL NOW.
          </div>
        </div>
      )}

      {/* Phase 3: CTAs */}
      {showCTA && (
        <div style={{ animation: "fadeIn 1s ease-out", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <a
            href="https://andycantwin.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", cursor: "pointer" }}
          >
            <div
              style={{
                background: "#1a2a1a",
                border: "3px solid #3a5a3a",
                padding: "12px 16px",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#5a8a5a")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#3a5a3a")}
            >
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "9px", color: "#ffaa44", marginBottom: "6px" }}>
                ANDY BOWLINE
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#88aa88", marginBottom: "4px" }}>
                NC SENATE · DISTRICT 31
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "8px", color: "#ff8866" }}>CATCH THE REAL STORY.</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#66aaff", marginTop: "6px" }}>
                ANDYCANTWIN.COM
              </div>
            </div>
          </a>

          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            <PixelButton variant="cta" onClick={onShare}>
              SHARE
            </PixelButton>
            <PixelButton variant="respond" onClick={() => { window.location.reload(); }}>
              PLAY AGAIN
            </PixelButton>
          </div>

          <a
            href="https://secure.actblue.com/donate/andybowline"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", width: "100%", maxWidth: "280px" }}
          >
            <div
              style={{
                background: "#2a1a2a",
                border: "3px solid #5a3a5a",
                padding: "10px 16px",
                textAlign: "center",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#8a5a8a")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#5a3a5a")}
            >
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#dd88dd", marginBottom: "4px" }}>
                HELP FIGHT DARK MONEY
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "9px", color: "#ffaaff" }}>DONATE →</div>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}

// Main game component
export default function CatchTheDarkMoney() {
  const [gameState, setGameState] = useState("title");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [holes, setHoles] = useState(() => Array(9).fill(null));
  const [darkMoney, setDarkMoney] = useState(0);
  const [caughtTotal, setCaughtTotal] = useState(0);
  const [caught, setCaught] = useState(0);
  const [totalSpawned, setTotalSpawned] = useState(0);

  const timerRef = useRef(null);
  const spawnRef = useRef(null);
  const holesRef = useRef(holes);
  const gameStateRef = useRef(gameState);
  const elapsedRef = useRef(0);
  const darkMoneyRef = useRef(0);
  const caughtTotalRef = useRef(0);
  const caughtRef = useRef(0);
  const totalSpawnedRef = useRef(0);

  // Keep refs in sync
  useEffect(() => {
    holesRef.current = holes;
  }, [holes]);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearTimeout(spawnRef.current);
  }, []);

  const endGame = useCallback(() => {
    clearAllTimers();
    // Clear any remaining active moles — count them as escaped
    setHoles((prev) => {
      let extraDark = 0;
      prev.forEach((h) => {
        if (h && h.state === "active") {
          extraDark += h.amount;
        }
      });
      if (extraDark > 0) {
        darkMoneyRef.current += extraDark;
        setDarkMoney(darkMoneyRef.current);
      }
      return Array(9).fill(null);
    });
    setGameState("ended");
  }, [clearAllTimers]);

  const spawnMole = useCallback(() => {
    if (gameStateRef.current !== "playing") return;

    const elapsed = elapsedRef.current;
    const phase = getPhase(elapsed);

    // How many to spawn
    const count = phase.min + Math.floor(Math.random() * (phase.max - phase.min + 1));

    // Find empty cells
    const current = holesRef.current;
    const emptyCells = [];
    for (let i = 0; i < 9; i++) {
      if (!current[i] || current[i].state === "idle") {
        emptyCells.push(i);
      }
    }

    // Shuffle and pick
    const toSpawn = Math.min(count, emptyCells.length);
    const shuffled = emptyCells.sort(() => Math.random() - 0.5).slice(0, toSpawn);

    if (shuffled.length === 0) {
      // All cells busy, retry soon
      spawnRef.current = setTimeout(spawnMole, 200);
      return;
    }

    const activePacs = current.filter((h) => h && h.state === "active").map((h) => h.pac.id);

    setHoles((prev) => {
      const next = [...prev];
      shuffled.forEach((cellIndex) => {
        const pac = randomPac(activePacs);
        activePacs.push(pac.id);
        const amount = randomAmount(phase);
        next[cellIndex] = {
          state: "active",
          pac,
          amount,
          cellIndex,
          spawnTime: Date.now(),
        };
      });
      return next;
    });

    totalSpawnedRef.current += shuffled.length;
    setTotalSpawned(totalSpawnedRef.current);

    // Schedule escape for each spawned mole
    shuffled.forEach((cellIndex) => {
      setTimeout(() => {
        if (gameStateRef.current !== "playing") return;
        setHoles((prev) => {
          const next = [...prev];
          if (next[cellIndex] && next[cellIndex].state === "active") {
            const escapedAmount = next[cellIndex].amount;
            darkMoneyRef.current += escapedAmount;
            setDarkMoney(darkMoneyRef.current);
            next[cellIndex] = { state: "escaped", amount: escapedAmount, cellIndex };
            // Clear after animation
            setTimeout(() => {
              setHoles((p) => {
                const n = [...p];
                if (n[cellIndex] && n[cellIndex].state === "escaped") {
                  n[cellIndex] = null;
                }
                return n;
              });
            }, 500);
          }
          return next;
        });
      }, phase.visible);
    });

    // Schedule next spawn
    const spawnDelay = phase.visible * 0.6 + Math.random() * 300;
    spawnRef.current = setTimeout(spawnMole, spawnDelay);
  }, []);

  const onCatch = useCallback(
    (cellIndex) => {
      if (gameStateRef.current !== "playing") return;

      setHoles((prev) => {
        const next = [...prev];
        if (next[cellIndex] && next[cellIndex].state === "active") {
          const amount = next[cellIndex].amount;
          caughtTotalRef.current += amount;
          setCaughtTotal(caughtTotalRef.current);
          caughtRef.current += 1;
          setCaught(caughtRef.current);
          next[cellIndex] = { state: "caught", amount, cellIndex };
          // Clear after animation
          setTimeout(() => {
            setHoles((p) => {
              const n = [...p];
              if (n[cellIndex] && n[cellIndex].state === "caught") {
                n[cellIndex] = null;
              }
              return n;
            });
          }, 400);
        }
        return next;
      });
    },
    []
  );

  const startGame = useCallback(() => {
    clearAllTimers();
    setGameState("playing");
    setTimeLeft(GAME_DURATION);
    setHoles(Array(9).fill(null));
    setDarkMoney(0);
    setCaughtTotal(0);
    setCaught(0);
    setTotalSpawned(0);
    darkMoneyRef.current = 0;
    caughtTotalRef.current = 0;
    caughtRef.current = 0;
    totalSpawnedRef.current = 0;
    elapsedRef.current = 0;

    // Start countdown
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      const remaining = GAME_DURATION - elapsedRef.current;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        endGame();
      }
    }, 1000);

    // Start spawning after a brief delay
    spawnRef.current = setTimeout(spawnMole, 800);
  }, [clearAllTimers, endGame, spawnMole]);

  // Cleanup on unmount
  useEffect(() => {
    return clearAllTimers;
  }, [clearAllTimers]);

  const handleShare = useCallback(async () => {
    const url = "https://games.andycantwin.com/darkmoney";
    let text;
    if (gameState === "ended") {
      text = `I tried to catch the dark money in NC politics for 30 seconds.\n\nI caught ${formatMoney(caughtTotal)}. MEGACORP moved ${formatMoney(darkMoney)} through PACs I couldn't trace.\n\nHB 237 made this legal.\n\nPlay "Catch the Dark Money":`;
    } else {
      text = `MEGACORP is funneling millions through NC PACs. Can you keep up?\n\nPlay "Catch the Dark Money" and see what HB 237 made legal:`;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: "Catch the Dark Money", text, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text}\n\n${url}`);
      alert("Link copied to clipboard!");
    } catch {
      prompt("Copy this link to share:", url);
    }
  }, [gameState, caughtTotal, darkMoney]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
        margin: "0 auto",
        height: "100dvh",
        maxHeight: "900px",
        background: "#0a0a1a",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
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
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      <Scanlines />

      {/* CRT border effect */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "4px",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.3)",
          pointerEvents: "none",
          zIndex: 101,
        }}
      />

      {gameState === "title" && <TitleScreen onStart={startGame} onShare={handleShare} />}

      {gameState === "playing" && (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "12px", gap: "8px" }}>
          <HUD timeLeft={timeLeft} darkMoney={darkMoney} caught={caught} total={totalSpawned} />

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoleGrid holes={holes} onCatch={onCatch} gridSize={330} />
          </div>

          <div
            style={{
              fontFamily: PIXEL_FONT,
              fontSize: "6px",
              color: "#555566",
              textAlign: "center",
              padding: "4px 0",
            }}
          >
            TAP THE MONEY BAGS!
          </div>
        </div>
      )}

      {gameState === "ended" && (
        <EndScreen
          stats={{
            caught,
            total: totalSpawned,
            caughtTotal,
            darkMoney,
          }}
          onRestart={startGame}
          onShare={handleShare}
        />
      )}
    </div>
  );
}
