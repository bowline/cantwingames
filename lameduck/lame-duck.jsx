"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const PIXEL_FONT = `var(--font-pixel), "Press Start 2P", monospace`;

// ─── game dimensions ───
const GAME_W = 360;
const GAME_H = 640;
const DOOR_X = GAME_W / 2 - 70;
const DOOR_Y = 60;
const DOOR_W = 140;
const DOOR_H = 90;
const LOBBY_TOP = DOOR_Y + DOOR_H + 10;
const LOBBY_BOTTOM = GAME_H - 30;

// ─── duck ───
const DUCK_W = 32;
const DUCK_H = 40;
const WANDER_SPEED_BASE = 0.45;
const REMIND_SPEED = 1.1;
const WORK_DURATION = 900;        // ms at door before the duck exits and a new one spawns
const SPAWN_LAME_START_MS = 1100;
const SPAWN_LAME_MIN_MS = 420;
const SPAWN_WORKING_START_MS = 260; // faster, thicker swarm for camouflage
const SPAWN_WORKING_MIN_MS = 120;
const MAX_LAME_START = 4;
const MAX_LAME_END = 14;
const MAX_WORKING_START = 22;
const MAX_WORKING_END = 38;
const TAP_RADIUS = 26;
const BERGER_SPAWN_MIN = 8000;
const BERGER_SPAWN_MAX = 20000;
const BERGER_SCORE_MULT = 2;

// ─── session ───
const GAME_DURATION = 30;

// ─── palette ───
const C = {
  floor: "#f0e8d8",
  floorLine: "#d9cdb5",
  door: "#3a2a1a",
  doorFrame: "#241710",
  doorSign: "#c9b787",
  body: "#ffd23f",
  bodyShade: "#d9a82c",
  beak: "#ff8a00",
  feet: "#e67e00",
  tie: "#c62828",
  tieShade: "#8a1a1a",
  redHat: "#c62828",
  redHatShade: "#7a1a1a",
  blueHat: "#1e4fa8",
  blueHatShade: "#0f2f70",
  eye: "#1a1a1a",
  bubble: "#ffffff",
  bubbleStroke: "#1a1a1a",
  bg: "#faf5ef",
  accent: "#9b4dca",
  coral: "#e8556d",
};

// ─── flashing facts (shown during play) ───
const FACTS = [
  "8 NC LEGISLATORS LOST THEIR PRIMARIES",
  "NC IS THE ONLY STATE WITHOUT A BUDGET",
  "STATE EMPLOYEES: NO RAISE SINCE 2023",
  "THE SENATE PRO TEM LOST BY 23 VOTES",
  "97 BILLS BECAME LAW IN 2025. RECORD LOW.",
];

// ─── reminder lines (pop above duck when tapped — generic fallback) ───
const REMIND_LINES = [
  "YOU WORK FOR ME.",
  "DO YOUR JOB.",
  "BUDGET'S DUE.",
  "I VOTED TOO.",
  "HEY.",
  "9 MORE MONTHS.",
];

// ─── "work" lines (pop briefly at door) ───
const WORK_LINES = ["*sigh*", "fine.", "ok ok.", "ugh.", "briefly."];

// ─── real NC legislators who lost their 2026 primary ───
// names appear above ducks on spawn; taps pick a name-specific barb sometimes
const ROSTER = [
  { name: "KIDWELL",    hat: "red",  tag: "R",      jab: "FREEDOM CAUCUS!" },
  { name: "PYRTLE",     hat: "red",  tag: "R",      jab: "ROCKINGHAM!" },
  { name: "HASTINGS",   hat: "red",  tag: "R",      jab: "GASTON WANTS BETTER." },
  { name: "MEASMER",    hat: "red",  tag: "R",      jab: "ONE TERM ENOUGH." },
  { name: "PLESS",      hat: "red",  tag: "R",      jab: "HAYWOOD'S WATCHING." },
  { name: "CUNNINGHAM", hat: "blue", tag: "D",      jab: "YOU CROSSED OVER." },
  { name: "MAJEED",     hat: "blue", tag: "D",      jab: "LOST BY 42 POINTS." },
  { name: "WILLINGHAM", hat: "blue", tag: "D",      jab: "VETO OVERRIDE COST YOU." },
];
// Phil Berger — Senate Pro Tem, lost by 23 votes — the boss
const BERGER = { name: "BERGER", hat: "red", tag: "PRO TEM", jab: "23 VOTES!" };

// ─── helpers ───
const rand = (a, b) => a + Math.random() * (b - a);
const now = () => Date.now();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ═══════════════════════════════════════════════════════════
// DUCK SPRITE
// ═══════════════════════════════════════════════════════════
function Duck({ duck, flashPulse }) {
  const { x, y, facing, hat, state, bubble, wobble, name, isBoss, wrongFlash } = duck;
  const bob = Math.sin(wobble) * 1.2;
  const scaleX = facing < 0 ? -1 : 1;
  // reminded ducks: dim + arrow so player knows to leave them alone
  const inTransit = state === "reminded" || state === "at-door";
  const alpha = inTransit ? 0.5 : 1;
  const bodyFill = wrongFlash ? "#ff5555" : C.body;

  return (
    <g transform={`translate(${x}, ${y + bob})`} opacity={alpha}>
      <ellipse cx={DUCK_W / 2} cy={DUCK_H + 2} rx={10} ry={2.5} fill="rgba(0,0,0,0.2)" />

      <g transform={`translate(${DUCK_W / 2}, 0) scale(${scaleX}, 1) translate(${-DUCK_W / 2}, 0)`}>
        <rect x={9} y={DUCK_H - 5} width={5} height={4} fill={C.feet} />
        <rect x={18} y={DUCK_H - 5} width={5} height={4} fill={C.feet} />
        <ellipse cx={DUCK_W / 2} cy={22} rx={12} ry={11} fill={bodyFill} />
        <ellipse cx={DUCK_W / 2 - 2} cy={24} rx={10} ry={8} fill={C.bodyShade} opacity={0.25} />
        <path d={`M 6 22 L 2 18 L 6 26 Z`} fill={C.bodyShade} />
        <circle cx={DUCK_W / 2 + 5} cy={11} r={7.5} fill={bodyFill} />
        <circle cx={DUCK_W / 2 + 7} cy={13} r={6} fill={C.bodyShade} opacity={0.18} />
        <circle cx={DUCK_W / 2 + 8} cy={9.5} r={1.5} fill={C.eye} />
        <path d={`M ${DUCK_W / 2 + 11} 11 L ${DUCK_W / 2 + 16} 10 L ${DUCK_W / 2 + 16} 13 L ${DUCK_W / 2 + 11} 14 Z`} fill={C.beak} />
        <path d={`M ${DUCK_W / 2 + 5} 17 L ${DUCK_W / 2 + 3} 20 L ${DUCK_W / 2 + 5} 27 L ${DUCK_W / 2 + 7} 20 Z`} fill={C.tie} />
        <rect x={DUCK_W / 2 + 4} y={16} width={3} height={2} fill={C.tieShade} />

        {hat === "red" && !isBoss && (
          <>
            <ellipse cx={DUCK_W / 2 + 5} cy={4.5} rx={9} ry={2} fill={C.redHatShade} />
            <path d={`M ${DUCK_W / 2 - 3} 4 Q ${DUCK_W / 2 + 5} -3, ${DUCK_W / 2 + 13} 4 L ${DUCK_W / 2 + 11} 5 Q ${DUCK_W / 2 + 5} 0, ${DUCK_W / 2 - 1} 5 Z`} fill={C.redHat} />
            <path d={`M ${DUCK_W / 2 + 13} 4 L ${DUCK_W / 2 + 20} 5 L ${DUCK_W / 2 + 20} 6 L ${DUCK_W / 2 + 13} 5 Z`} fill={C.redHatShade} />
          </>
        )}
        {hat === "blue" && (
          <>
            <ellipse cx={DUCK_W / 2 + 5} cy={4.5} rx={9} ry={2} fill={C.blueHatShade} />
            <path d={`M ${DUCK_W / 2 - 3} 4 Q ${DUCK_W / 2 + 5} -3, ${DUCK_W / 2 + 13} 4 L ${DUCK_W / 2 + 11} 5 Q ${DUCK_W / 2 + 5} 0, ${DUCK_W / 2 - 1} 5 Z`} fill={C.blueHat} />
            <path d={`M ${DUCK_W / 2 + 13} 4 L ${DUCK_W / 2 + 20} 5 L ${DUCK_W / 2 + 20} 6 L ${DUCK_W / 2 + 13} 5 Z`} fill={C.blueHatShade} />
          </>
        )}
        {/* boss: gold crown instead of a hat */}
        {isBoss && (
          <>
            <rect x={DUCK_W / 2 - 3} y={0} width={16} height={4} fill="#8a6914" />
            <path d={`M ${DUCK_W / 2 - 3} 4 L ${DUCK_W / 2 - 3} -4 L ${DUCK_W / 2 + 1} 0 L ${DUCK_W / 2 + 5} -5 L ${DUCK_W / 2 + 9} 0 L ${DUCK_W / 2 + 13} -4 L ${DUCK_W / 2 + 13} 4 Z`} fill="#ffd23f" stroke="#8a6914" strokeWidth={0.8} />
            <circle cx={DUCK_W / 2 + 5} cy={0} r={1} fill="#c62828" />
          </>
        )}

        {/* checked-out: zzz above head for wandering lame ducks */}
        {state === "wandering" && hat && (
          <text x={DUCK_W / 2 + 12} y={-1} fontSize="6" fill="#888" fontFamily={PIXEL_FONT}>z</text>
        )}
      </g>

      {/* name badge — boss only (crown duck gets the spotlight) */}
      {isBoss && name && !bubble && (
        <g transform={`translate(${DUCK_W / 2}, -10)`}>
          <rect x={-name.length * 2.2 - 3} y={-8} width={name.length * 4.4 + 6} height={9}
            fill="#ffd23f" stroke="#8a6914" strokeWidth={0.8} />
          <text x={0} y={-1} textAnchor="middle" fontSize="5"
            fill="#1a0a2e" fontFamily={PIXEL_FONT}>
            {name}
          </text>
        </g>
      )}

      {/* in-transit arrow → door */}
      {inTransit && (
        <g transform={`translate(${DUCK_W / 2}, -12)`}
          opacity={0.6 + Math.sin(flashPulse * 0.25) * 0.4}>
          <polygon points="-4,0 4,0 0,-6" fill={C.accent} />
        </g>
      )}

      {/* thought bubble */}
      {bubble && (
        <g transform={`translate(${DUCK_W / 2 - 4}, -6)`}>
          <rect x={-2} y={-18} width={bubble.length * 4.2 + 10} height={14} rx={3}
            fill={C.bubble} stroke={C.bubbleStroke} strokeWidth={1.5} />
          <polygon points={`6,-4 10,-4 8,0`} fill={C.bubble} stroke={C.bubbleStroke} strokeWidth={1.5} />
          <text x={3} y={-8} fontSize="5" fill={C.bubbleStroke} fontFamily={PIXEL_FONT}>
            {bubble}
          </text>
        </g>
      )}
    </g>
  );
}

// ═══════════════════════════════════════════════════════════
// DOOR + FLOOR
// ═══════════════════════════════════════════════════════════
function Door({ pulse }) {
  const glow = pulse ? 0.6 + Math.sin(pulse * 0.3) * 0.3 : 0;
  return (
    <g>
      <rect x={DOOR_X - 6} y={DOOR_Y - 6} width={DOOR_W + 12} height={DOOR_H + 6} fill={C.doorFrame} />
      <rect x={DOOR_X - 12} y={DOOR_Y - 28} width={DOOR_W + 24} height={22} fill={C.doorSign} stroke={C.doorFrame} strokeWidth={2} />
      <text x={GAME_W / 2} y={DOOR_Y - 17} textAnchor="middle" fontSize="7" fill={C.doorFrame} fontFamily={PIXEL_FONT}>
        NC SHORT SESSION
      </text>
      <text x={GAME_W / 2} y={DOOR_Y - 9} textAnchor="middle" fontSize="6" fill={C.doorFrame} fontFamily={PIXEL_FONT}>
        APRIL 21, 2026
      </text>
      <rect x={DOOR_X} y={DOOR_Y} width={DOOR_W} height={DOOR_H} fill={C.door} />
      <rect x={DOOR_X + 8} y={DOOR_Y + 8} width={DOOR_W / 2 - 12} height={DOOR_H - 16} fill="none" stroke="#5a4028" strokeWidth={1.5} />
      <rect x={DOOR_X + DOOR_W / 2 + 4} y={DOOR_Y + 8} width={DOOR_W / 2 - 12} height={DOOR_H - 16} fill="none" stroke="#5a4028" strokeWidth={1.5} />
      <circle cx={DOOR_X + DOOR_W / 2 - 4} cy={DOOR_Y + DOOR_H / 2} r={2} fill="#b89868" />
      <circle cx={DOOR_X + DOOR_W / 2 + 4} cy={DOOR_Y + DOOR_H / 2} r={2} fill="#b89868" />
      {glow > 0 && (
        <rect x={DOOR_X - 2} y={DOOR_Y - 2} width={DOOR_W + 4} height={DOOR_H + 4}
          fill="none" stroke={C.accent} strokeWidth={2} opacity={glow} />
      )}
    </g>
  );
}

function Floor() {
  const tiles = [];
  const tileW = 60;
  const tileH = 60;
  for (let y = DOOR_Y + DOOR_H; y < GAME_H; y += tileH) {
    for (let x = 0; x < GAME_W; x += tileW) {
      const alt = (Math.floor(x / tileW) + Math.floor(y / tileH)) % 2 === 0;
      tiles.push(
        <rect key={`${x}-${y}`} x={x} y={y} width={tileW} height={tileH}
          fill={alt ? C.floor : "#ebe1cf"} stroke={C.floorLine} strokeWidth={0.5} />
      );
    }
  }
  return <g>{tiles}</g>;
}

// ═══════════════════════════════════════════════════════════
// HUD
// ═══════════════════════════════════════════════════════════
function HUD({ timeLeft, reminders, fact }) {
  return (
    <g>
      <rect x={0} y={0} width={GAME_W} height={26} fill="rgba(26,10,46,0.92)" />
      <text x={8} y={17} fontSize="7" fill={C.coral} fontFamily={PIXEL_FONT}>
        REMINDED: {reminders}
      </text>
      <text x={GAME_W - 8} y={17} textAnchor="end" fontSize="7" fill="#fff" fontFamily={PIXEL_FONT}>
        {timeLeft.toFixed(1)}s
      </text>
      <rect x={0} y={GAME_H - 22} width={GAME_W} height={22} fill="rgba(26,10,46,0.92)" />
      <text x={GAME_W / 2} y={GAME_H - 8} textAnchor="middle" fontSize="6" fill="#ffd23f" fontFamily={PIXEL_FONT}>
        {fact}
      </text>
    </g>
  );
}

// ═══════════════════════════════════════════════════════════
// TITLE SCREEN
// ═══════════════════════════════════════════════════════════
function TitleScreen({ onStart, personalBest }) {
  return (
    <div style={{
      width: "100%", aspectRatio: `${GAME_W}/${GAME_H}`,
      background: `linear-gradient(155deg, #1a0a2e 0%, #2a1048 100%)`,
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "10% 8%", gap: "5%",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
        pointerEvents: "none",
      }} />

      <div style={{ fontFamily: PIXEL_FONT, fontSize: "9px", color: C.coral, letterSpacing: "2px" }}>
        SHORT SESSION · 2026
      </div>

      <div style={{
        fontFamily: PIXEL_FONT, fontSize: "26px", color: "#ffd23f",
        textShadow: "3px 3px 0 #c62828", textAlign: "center", lineHeight: 1.25,
      }}>
        CATCH THE<br />LAME DUCK
      </div>

      <svg viewBox="0 0 80 60" style={{ width: "38%" }}>
        <g transform="translate(20, 10)">
          <ellipse cx={20} cy={45} rx={14} ry={3} fill="rgba(0,0,0,0.3)" />
          <ellipse cx={18} cy={28} rx={14} ry={12} fill={C.body} />
          <circle cx={26} cy={16} r={9} fill={C.body} />
          <circle cx={30} cy={14} r={1.8} fill={C.eye} />
          <path d={`M 34 16 L 42 14 L 42 19 L 34 21 Z`} fill={C.beak} />
          <path d={`M 26 22 L 24 26 L 26 36 L 28 26 Z`} fill={C.tie} />
          <ellipse cx={26} cy={8} rx={11} ry={2.5} fill={C.redHatShade} />
          <path d={`M 16 8 Q 26 0, 36 8 L 34 10 Q 26 3, 18 10 Z`} fill={C.redHat} />
        </g>
      </svg>

      <div style={{
        fontFamily: PIXEL_FONT, fontSize: "11px", color: "#ffffff",
        textAlign: "center", lineHeight: 1.6, maxWidth: "95%",
      }}>
        THEY LOST.
      </div>
      <div style={{
        fontFamily: PIXEL_FONT, fontSize: "11px", color: C.coral,
        textAlign: "center", lineHeight: 1.6, maxWidth: "95%", marginTop: "-3%",
      }}>
        THEY STILL VOTE.
      </div>

      <div style={{
        fontFamily: PIXEL_FONT, fontSize: "8px", color: "#c5b5d9",
        textAlign: "center", lineHeight: 1.8, maxWidth: "95%", marginTop: "2%",
      }}>
        TAP THE HATS TO REMIND THEM<br />THEY STILL WORK FOR YOU.
      </div>

      <button onClick={onStart} style={{
        fontFamily: PIXEL_FONT, fontSize: "11px",
        background: C.coral, color: "#fff", border: "none",
        padding: "14px 28px", cursor: "pointer",
        boxShadow: "4px 4px 0 #7a1a1a",
        letterSpacing: "2px", marginTop: "2%",
      }}>
        ▶ REMIND THEM
      </button>

      {personalBest > 0 && (
        <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#ffd23f", marginTop: "1%" }}>
          YOUR BEST: {personalBest}
        </div>
      )}

      <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#6a4a8a", marginTop: "auto" }}>
        30 SECONDS · NO WINNERS
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// END SCREEN
// ═══════════════════════════════════════════════════════════
function EndScreen({ reminders, onRestart, onShare, personalBest }) {
  const isNewBest = reminders >= personalBest && reminders > 0;
  let tier;
  if (reminders >= 45) tier = { title: "RELENTLESS.", sub: "That's what accountability feels like." };
  else if (reminders >= 30) tier = { title: "NICE WORK.", sub: "They noticed. They won't forget." };
  else if (reminders >= 15) tier = { title: "NOT BAD.", sub: "Most of them still drifted off." };
  else if (reminders >= 5) tier = { title: "THEY CHECKED OUT.", sub: "Welcome to lame-duck season." };
  else tier = { title: "THEY ALL LEFT.", sub: "Just like in real life." };

  return (
    <div style={{
      width: "100%", aspectRatio: `${GAME_W}/${GAME_H}`,
      background: `linear-gradient(155deg, #1a0a2e 0%, #2a1048 100%)`,
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "flex-start", padding: "6% 6% 4%", gap: "2.5%",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
        pointerEvents: "none",
      }} />

      <div style={{ fontFamily: PIXEL_FONT, fontSize: "9px", color: C.coral, letterSpacing: "2px", marginTop: "2%" }}>
        SESSION OVER
      </div>

      <div style={{
        fontFamily: PIXEL_FONT, fontSize: "52px", color: "#ffd23f",
        textShadow: "3px 3px 0 #c62828",
      }}>
        {reminders}
      </div>
      <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#c5b5d9", letterSpacing: "2px" }}>
        REMINDERS DELIVERED
      </div>
      {personalBest > 0 && (
        <div style={{
          fontFamily: PIXEL_FONT, fontSize: "7px",
          color: isNewBest ? "#ffd23f" : "#9b7dba",
          letterSpacing: "1px", marginTop: "1%",
        }}>
          {isNewBest ? "★ NEW BEST ★" : `BEST: ${personalBest}`}
        </div>
      )}

      <div style={{
        fontFamily: PIXEL_FONT, fontSize: "14px", color: "#fff",
        textAlign: "center", lineHeight: 1.3, marginTop: "3%",
      }}>
        {tier.title}
      </div>
      <div style={{
        fontFamily: PIXEL_FONT, fontSize: "9px", color: "#c5b5d9",
        textAlign: "center", lineHeight: 1.5, maxWidth: "95%",
      }}>
        {tier.sub}
      </div>

      <div style={{
        marginTop: "4%", padding: "14px 12px",
        background: "rgba(255,255,255,0.06)", borderLeft: `4px solid ${C.coral}`,
        fontFamily: PIXEL_FONT, fontSize: "8px", color: "#fff",
        lineHeight: 1.7, textAlign: "left", width: "100%",
      }}>
        <div style={{ marginBottom: "6px" }}>
          <span style={{ color: C.coral }}>8 NC LEGISLATORS</span> LOST THEIR PRIMARIES IN MARCH.
        </div>
        <div style={{ marginBottom: "6px" }}>
          THEY STILL VOTE ON YOUR LAWS UNTIL <span style={{ color: "#ffd23f" }}>JANUARY 2027</span>.
        </div>
        <div>
          KEEP REMINDING THEM.
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "3%", width: "100%" }}>
        <button onClick={onShare} style={{
          flex: 1, fontFamily: PIXEL_FONT, fontSize: "9px",
          background: "#fff", color: "#1a0a2e", border: "none",
          padding: "12px 8px", cursor: "pointer",
          boxShadow: "3px 3px 0 rgba(0,0,0,0.3)",
        }}>
          SHARE
        </button>
        <button onClick={onRestart} style={{
          flex: 1, fontFamily: PIXEL_FONT, fontSize: "9px",
          background: "transparent", color: "#fff", border: "2px solid #fff",
          padding: "10px 8px", cursor: "pointer",
        }}>
          AGAIN
        </button>
      </div>

      <a href="https://secure.actblue.com/donate/andybowline" target="_blank" rel="noopener noreferrer"
        style={{
          width: "100%", fontFamily: PIXEL_FONT, fontSize: "9px",
          background: C.coral, color: "#fff", textDecoration: "none",
          padding: "14px", textAlign: "center",
          boxShadow: "3px 3px 0 #7a1a1a",
        }}>
        CHIP IN $5 →
      </a>

      <a href="https://andycantwin.com" target="_blank" rel="noopener noreferrer"
        style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#c5b5d9", marginTop: "auto", textDecoration: "none" }}>
        ANDYCANTWIN.COM
      </a>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN GAME
// ═══════════════════════════════════════════════════════════
export default function LameDuck() {
  const [screen, setScreen] = useState("title");
  const [ducks, setDucks] = useState([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [reminders, setReminders] = useState(0);
  const [factIdx, setFactIdx] = useState(0);

  const ducksRef = useRef([]);
  const rafRef = useRef(null);
  const lastSpawnLame = useRef(0);
  const lastSpawnWorking = useRef(0);
  const lastFrameTime = useRef(0);
  const startedAt = useRef(0);
  const svgRef = useRef(null);
  const nextId = useRef(1);
  const [personalBest, setPersonalBest] = useState(0);
  const [flashPulse, setFlashPulse] = useState(0);
  const bergerSpawned = useRef(false);
  const bergerSpawnAt = useRef(0);
  const rosterPool = useRef([]);
  const wrongFlashes = useRef({}); // id -> expireAt

  // load PB once
  useEffect(() => {
    try {
      const pb = parseInt(localStorage.getItem("lameduck_pb") || "0", 10);
      if (!isNaN(pb)) setPersonalBest(pb);
    } catch {}
  }, []);

  useEffect(() => { ducksRef.current = ducks; }, [ducks]);

  // pick a random wander target somewhere in the lobby
  const newWanderTarget = () => ({
    tx: rand(10, GAME_W - DUCK_W - 10),
    ty: rand(LOBBY_TOP + 10, LOBBY_BOTTOM - DUCK_H),
  });

  const spawnWorking = useCallback(() => {
    const id = nextId.current++;
    // half walk around lobby, half head for door and back
    const target = newWanderTarget();
    return {
      id, type: "working",
      hat: null,
      x: rand(10, GAME_W - DUCK_W - 10),
      y: rand(LOBBY_TOP + 10, LOBBY_BOTTOM - DUCK_H),
      facing: Math.random() < 0.5 ? -1 : 1,
      wobble: Math.random() * Math.PI * 2,
      state: Math.random() < 0.35 ? "heading-to-door" : "wandering-lobby",
      workUntil: 0,
      bubble: null,
      bubbleUntil: 0,
      tx: target.tx, ty: target.ty,
    };
  }, []);

  const spawnLame = useCallback((roster, isBoss = false) => {
    const id = nextId.current++;
    const pick = isBoss ? BERGER : roster[Math.floor(Math.random() * roster.length)];
    const target = newWanderTarget();
    // drop anywhere in the lobby — harder to track
    return {
      id, type: "lame",
      hat: pick.hat,
      name: pick.name,
      jab: pick.jab,
      isBoss,
      x: rand(10, GAME_W - DUCK_W - 10),
      y: rand(LOBBY_TOP + 10, LOBBY_BOTTOM - DUCK_H),
      facing: Math.random() < 0.5 ? -1 : 1,
      wobble: Math.random() * Math.PI * 2,
      state: "wandering",
      workUntil: 0,
      bubble: null,
      bubbleUntil: 0,
      tx: target.tx, ty: target.ty,
    };
  }, []);

  const startGame = useCallback(() => {
    nextId.current = 1;
    // fresh roster pool — we'll draw from here so names rotate without immediate repeats
    rosterPool.current = [...ROSTER].sort(() => Math.random() - 0.5);
    bergerSpawned.current = false;
    bergerSpawnAt.current = rand(BERGER_SPAWN_MIN, BERGER_SPAWN_MAX);
    wrongFlashes.current = {};

    const drawFromRoster = () => {
      if (rosterPool.current.length === 0) {
        rosterPool.current = [...ROSTER].sort(() => Math.random() - 0.5);
      }
      return rosterPool.current.pop();
    };

    const initial = [];
    for (let i = 0; i < 3; i++) initial.push(spawnLame([drawFromRoster()]));
    for (let i = 0; i < 14; i++) initial.push(spawnWorking());
    initial.forEach((d) => {
      if (d.type === "working") {
        d.x = rand(10, GAME_W - DUCK_W - 10);
        d.y = rand(LOBBY_TOP + 10, LOBBY_BOTTOM - DUCK_H);
      }
    });
    setDucks(initial);
    ducksRef.current = initial;
    setTimeLeft(GAME_DURATION);
    setReminders(0);
    setFactIdx(0);
    lastSpawnLame.current = now();
    lastSpawnWorking.current = now();
    lastFrameTime.current = now();
    startedAt.current = now();
    setScreen("playing");
  }, [spawnLame, spawnWorking]);

  // ─── main loop ───
  useEffect(() => {
    if (screen !== "playing") return;

    const tick = () => {
      const t = now();
      const dt = Math.min(48, t - lastFrameTime.current) / 16.67;
      lastFrameTime.current = t;

      const elapsed = (t - startedAt.current) / 1000;
      const remaining = Math.max(0, GAME_DURATION - elapsed);
      setTimeLeft(remaining);

      setFactIdx(Math.floor(elapsed / 6) % FACTS.length);

      // difficulty ramp
      const progress = Math.min(1, elapsed / GAME_DURATION);
      const maxLame = Math.floor(MAX_LAME_START + (MAX_LAME_END - MAX_LAME_START) * progress);
      const maxWorking = Math.floor(MAX_WORKING_START + (MAX_WORKING_END - MAX_WORKING_START) * progress);
      const lameSpawnMs = SPAWN_LAME_START_MS - (SPAWN_LAME_START_MS - SPAWN_LAME_MIN_MS) * progress;
      const workingSpawnMs = SPAWN_WORKING_START_MS - (SPAWN_WORKING_START_MS - SPAWN_WORKING_MIN_MS) * progress;
      const speedMult = 1 + progress * 0.7;

      const lameCount = ducksRef.current.filter(d => d.type === "lame").length;
      const workingCount = ducksRef.current.filter(d => d.type === "working").length;

      // visual pulse for the in-transit arrow
      setFlashPulse(p => p + 1);

      // draw from roster pool (no immediate repeats)
      const drawFromRoster = () => {
        if (rosterPool.current.length === 0) {
          rosterPool.current = [...ROSTER].sort(() => Math.random() - 0.5);
        }
        return rosterPool.current.pop();
      };

      // boss: Phil Berger appears once per session in his window
      const msIn = t - startedAt.current;
      if (!bergerSpawned.current && msIn > bergerSpawnAt.current) {
        setDucks(prev => [...prev, spawnLame(ROSTER, true)]);
        bergerSpawned.current = true;
      }

      if (t - lastSpawnLame.current > lameSpawnMs && lameCount < maxLame) {
        setDucks(prev => [...prev, spawnLame([drawFromRoster()])]);
        lastSpawnLame.current = t;
      }
      if (t - lastSpawnWorking.current > workingSpawnMs && workingCount < maxWorking) {
        setDucks(prev => [...prev, spawnWorking()]);
        lastSpawnWorking.current = t;
      }

      // clean up expired wrong-tap flashes
      const wf = wrongFlashes.current;
      for (const id in wf) if (wf[id] < t) delete wf[id];

      // update duck positions
      setDucks(prev => {
        const updated = [];

        for (const d of prev) {
          let { x, y, facing, state, wobble, tx, ty, bubble, bubbleUntil, workUntil } = d;
          wobble += 0.14 * dt;
          if (bubble && t > bubbleUntil) bubble = null;

          if (d.type === "working") {
            // camouflage: wander the lobby or briefly go through the door
            if (state === "heading-to-door") {
              const doorCenterX = DOOR_X + DOOR_W / 2 - DUCK_W / 2;
              const dx = doorCenterX - x;
              const dy = (DOOR_Y + DOOR_H - 8) - y;
              const dist = Math.hypot(dx, dy);
              if (dist < 3) {
                // enter door — respawn off to the side as wandering
                const target = newWanderTarget();
                state = "wandering-lobby"; tx = target.tx; ty = target.ty;
                x = rand(10, GAME_W - DUCK_W - 10);
                y = LOBBY_TOP + rand(4, 20);
              } else {
                const step = WANDER_SPEED_BASE * 1.3 * dt;
                x += (dx / dist) * step;
                y += (dy / dist) * step;
                facing = dx > 0 ? 1 : -1;
              }
            } else {
              // wandering-lobby: toward tx, ty; when reached, pick a new target
              const dx = tx - x, dy = ty - y;
              const dist = Math.hypot(dx, dy);
              if (dist < 3) {
                // 25% chance to head to door next, else new wander target
                if (Math.random() < 0.25) {
                  state = "heading-to-door";
                } else {
                  const target = newWanderTarget();
                  tx = target.tx; ty = target.ty;
                }
              } else {
                const step = WANDER_SPEED_BASE * dt;
                x += (dx / dist) * step;
                y += (dy / dist) * step;
                facing = dx > 0 ? 1 : -1;
              }
            }
          } else {
            // LAME DUCK
            if (state === "reminded") {
              // walk to door
              const doorCenterX = DOOR_X + DOOR_W / 2 - DUCK_W / 2;
              const dx = doorCenterX - x;
              const dy = (DOOR_Y + DOOR_H - 4) - y;
              const dist = Math.hypot(dx, dy);
              if (dist < 3) {
                // arrive at door, do a brief "check in" then vanish
                state = "at-door";
                workUntil = t + WORK_DURATION;
                bubble = WORK_LINES[Math.floor(Math.random() * WORK_LINES.length)];
                bubbleUntil = t + WORK_DURATION - 100;
                x = doorCenterX;
                y = DOOR_Y + DOOR_H - 4;
              } else {
                const step = REMIND_SPEED * speedMult * dt;
                x += (dx / dist) * step;
                y += (dy / dist) * step;
                facing = dx > 0 ? 1 : -1;
              }
            } else if (state === "at-door") {
              // bob at door while "working", then vanish — a fresh one spawns in the center
              y = DOOR_Y + DOOR_H - 4 + Math.sin(wobble * 0.8) * 1.5;
              if (t > workUntil) {
                continue; // drop from the duck list
              }
            } else {
              // wandering: aimless, random walk in the lobby
              const dx = tx - x, dy = ty - y;
              const dist = Math.hypot(dx, dy);
              if (dist < 3) {
                const target = newWanderTarget();
                tx = target.tx; ty = target.ty;
              } else {
                const step = WANDER_SPEED_BASE * speedMult * dt;
                x += (dx / dist) * step;
                y += (dy / dist) * step;
                facing = dx > 0 ? 1 : -1;
              }
            }

            // keep ducks in bounds
            x = clamp(x, 8, GAME_W - DUCK_W - 8);
            y = clamp(y, DOOR_Y + 10, LOBBY_BOTTOM - DUCK_H);
          }

          updated.push({ ...d, x, y, facing, state, wobble, tx, ty, bubble, bubbleUntil, workUntil });
        }

        return updated;
      });

      if (remaining <= 0) {
        setReminders(final => {
          setPersonalBest(prev => {
            if (final > prev) {
              try { localStorage.setItem("lameduck_pb", String(final)); } catch {}
              return final;
            }
            return prev;
          });
          return final;
        });
        setScreen("gameover");
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [screen, spawnLame, spawnWorking]);

  // ─── tap to remind ───
  const handleTap = useCallback((e) => {
    if (screen !== "playing") return;
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const sx = ((clientX - rect.left) / rect.width) * GAME_W;
    const sy = ((clientY - rect.top) / rect.height) * GAME_H;

    // only wandering lame ducks are tappable — ones already reminded/at-door are in progress
    let hit = null;
    let bestDist = TAP_RADIUS;
    for (const d of ducksRef.current) {
      if (d.type !== "lame") continue;
      if (d.state !== "wandering") continue;
      const cx = d.x + DUCK_W / 2;
      const cy = d.y + DUCK_H / 2;
      const dist = Math.hypot(sx - cx, sy - cy);
      if (dist < bestDist) { hit = d; bestDist = dist; }
    }

    // no lame duck under the tap — see if a working duck is there and flash it
    if (!hit) {
      let miss = null;
      let missDist = TAP_RADIUS;
      for (const d of ducksRef.current) {
        if (d.type !== "working") continue;
        const cx = d.x + DUCK_W / 2;
        const cy = d.y + DUCK_H / 2;
        const dist = Math.hypot(sx - cx, sy - cy);
        if (dist < missDist) { miss = d; missDist = dist; }
      }
      if (miss) {
        wrongFlashes.current[miss.id] = now() + 350;
        setDucks(prev => prev.map(d => d.id === miss.id
          ? { ...d, bubble: "HEY!", bubbleUntil: now() + 600 }
          : d
        ));
      }
      return;
    }

    const useNamed = hit.isBoss && hit.jab;
    const line = useNamed
      ? hit.jab
      : REMIND_LINES[Math.floor(Math.random() * REMIND_LINES.length)];
    const t = now();
    const weight = hit.isBoss ? BERGER_SCORE_MULT : 1;
    setReminders(r => r + weight);
    setDucks(prev => prev.map(d => d.id === hit.id
      ? { ...d, state: "reminded", bubble: line, bubbleUntil: t + 1200 }
      : d
    ));
  }, [screen]);

  // ─── share ───
  const handleShare = useCallback(async () => {
    const url = "https://games.andycantwin.com/lameduck";
    const text = `I reminded ${reminders} lame-duck NC legislators that they still work for us. They still vote on your laws until January. Play "Catch the Lame Duck":`;
    if (navigator.share) {
      try { await navigator.share({ title: "Catch the Lame Duck", text, url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert("Link copied to clipboard!");
    } catch {
      prompt("Copy this link to share:", url);
    }
  }, [reminders]);

  return (
    <div style={{
      width: "100%", maxWidth: `${GAME_W}px`, margin: "0 auto",
      fontFamily: PIXEL_FONT, userSelect: "none", WebkitUserSelect: "none",
    }}>
      {screen === "title" && <TitleScreen onStart={startGame} personalBest={personalBest} />}

      {screen === "playing" && (
        <div
          onTouchStart={(e) => { e.preventDefault(); handleTap(e); }}
          onMouseDown={handleTap}
          style={{ width: "100%", position: "relative", overflow: "hidden", touchAction: "none", cursor: "pointer" }}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${GAME_W} ${GAME_H}`}
            style={{ width: "100%", display: "block", background: C.bg }}
          >
            <Floor />
            <Door pulse={0} />
            {ducks
              .slice()
              .sort((a, b) => a.y - b.y)
              .map(d => <Duck key={d.id} duck={{ ...d, wrongFlash: !!wrongFlashes.current[d.id] }} flashPulse={flashPulse} />)}
            <HUD timeLeft={timeLeft} reminders={reminders} fact={FACTS[factIdx]} />
          </svg>
        </div>
      )}

      {screen === "gameover" && (
        <EndScreen reminders={reminders} personalBest={personalBest}
          onRestart={() => setScreen("title")} onShare={handleShare} />
      )}
    </div>
  );
}
