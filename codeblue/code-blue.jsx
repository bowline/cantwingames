"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const PIXEL_FONT = `var(--font-pixel), "Press Start 2P", monospace`;
const GAME_W = 360;
const GAME_H = 740;

// ─── Constants ───
const METER_RATE = 3; // % per second (CONSTANT across all levels)
const SCROLL_SPEED = 300; // px per second
const COLLISION_PENALTY = 12; // % added on hit
const LANE_WIDTH = 60;
const ROAD_LEFT = 60;
const ROAD_WIDTH = 180; // 3 lanes * 60
const ROAD_RIGHT = ROAD_LEFT + ROAD_WIDTH;
const LANE_CENTERS = [ROAD_LEFT + 30, ROAD_LEFT + 90, ROAD_LEFT + 150];
const STEER_SPEED = 200; // px/s for steering
const CENTER_RETURN_SPEED = 160; // px/s to return to center

// ─── Level configs ───
const LEVELS = [
  {
    id: 1,
    name: "URBAN",
    population: "350,000",
    hospitalDist: "0.8 mi",
    hospitalDistance: 800,
    spawnInterval: 1200, // frequent but level is short
    obstacles: ["taxi", "pedestrian", "redlight"],
    envType: "urban",
    lanes: 3,
    completionText: "You made it.",
    treatmentTime: "4 minutes",
  },
  {
    id: 2,
    name: "SUBURBAN",
    population: "45,000",
    hospitalDist: "4.2 mi",
    hospitalDistance: 5000,
    spawnInterval: 700, // ~1.4/s — tense dodging
    obstacles: ["suv", "construction", "schoolzone", "stalled", "deliveryvan"],
    envType: "suburban",
    lanes: 3,
    completionText: "You made it.",
    treatmentTime: "18 minutes",
  },
  {
    id: 3,
    name: "RURAL",
    population: "2,100",
    hospitalDist: "47 mi",
    hospitalDistance: Infinity,
    spawnInterval: 1800, // more frequent than before — occasional clusters break up the emptiness
    obstacles: ["tractor", "deer", "loggingtruck", "gravel"],
    envType: "rural",
    lanes: 3,
    completionText: "You didn't make it.",
    treatmentTime: null,
  },
];

// Rural landmarks that appear at set distances
const RURAL_LANDMARKS = [
  { dist: 600, type: "church" },
  { dist: 1800, type: "closedgas" },
  { dist: 3200, type: "hospitalsign" },
  { dist: 4800, type: "dollargeneral" },
  { dist: 6500, type: "dollargeneral2" },
  { dist: 8500, type: "church2" },
  { dist: 10500, type: "closedgas2" },
  { dist: 12000, type: "hospitalsign2" },
];

// Random stats for end screen
const RANDOM_STATS = [
  "Since 2010, 7 rural hospitals in North Carolina have closed.",
  "The average rural NC resident lives 30+ minutes from the nearest ER.",
  "Heart attack survival drops 7-10% for every 10 minutes without treatment.",
  "In Stokes County, nearest cardiac cath lab is in Winston-Salem -- 45 min away.",
  "Rural Americans are 40% more likely to die of heart disease than urban Americans.",
];

// ─── Obstacle definitions ───
function getObstacleDef(type) {
  switch (type) {
    case "taxi":
      return { w: 24, h: 40, label: "TAXI" };
    case "pedestrian":
      return { w: 12, h: 16, label: "PED" };
    case "redlight":
      return { w: 40, h: 12, label: "RED" };
    case "suv":
      return { w: 28, h: 44, label: "SUV" };
    case "construction":
      return { w: 44, h: 14, label: "CONST" };
    case "schoolzone":
      return { w: 36, h: 14, label: "SLOW" };
    case "stalled":
      return { w: 26, h: 38, label: "STALL" };
    case "deliveryvan":
      return { w: 26, h: 48, label: "VAN" };
    case "tractor":
      return { w: 36, h: 44, label: "TRCTR" };
    case "deer":
      return { w: 20, h: 24, label: "DEER" };
    case "loggingtruck":
      return { w: 30, h: 60, label: "LOG" };
    case "gravel":
      return { w: 50, h: 16, label: "GRVL" };
    default:
      return { w: 24, h: 30, label: "?" };
  }
}

// ─── Obstacle sprite renderer ───
function ObstacleSprite({ obs }) {
  const { x, y, type } = obs;
  switch (type) {
    case "taxi":
      return (
        <g transform={`translate(${x - 12}, ${y - 20})`}>
          <rect x={0} y={0} width={24} height={40} rx={4} fill="#ddcc22" stroke="#aa9900" strokeWidth={1} />
          <rect x={4} y={2} width={16} height={8} rx={2} fill="#eedd44" />
          <rect x={7} y={0} width={10} height={6} rx={2} fill="#eeee66" />
          <rect x={2} y={32} width={6} height={4} rx={1} fill="#aa2222" />
          <rect x={16} y={32} width={6} height={4} rx={1} fill="#aa2222" />
          <text x={12} y={24} textAnchor="middle" fontSize="5" fill="#333" fontFamily={PIXEL_FONT}>TAXI</text>
        </g>
      );
    case "pedestrian":
      return (
        <g transform={`translate(${x - 6}, ${y - 8})`}>
          <circle cx={6} cy={3} r={3} fill="#ddaa88" />
          <rect x={3} y={6} width={6} height={8} rx={1} fill="#6688bb" />
          <line x1={3} y1={14} x2={2} y2={18} stroke="#4466aa" strokeWidth={1.5} />
          <line x1={9} y1={14} x2={10} y2={18} stroke="#4466aa" strokeWidth={1.5} />
        </g>
      );
    case "redlight":
      return (
        <g transform={`translate(${x - 20}, ${y - 6})`}>
          <rect x={0} y={0} width={40} height={12} rx={2} fill="#333344" stroke="#555566" strokeWidth={1} />
          <circle cx={10} cy={6} r={4} fill="#ff2222">
            <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx={20} cy={6} r={4} fill="#332200" />
          <circle cx={30} cy={6} r={4} fill="#003300" />
        </g>
      );
    case "suv":
      return (
        <g transform={`translate(${x - 14}, ${y - 22})`}>
          <rect x={0} y={0} width={28} height={44} rx={5} fill="#445566" stroke="#334455" strokeWidth={1} />
          <rect x={3} y={2} width={22} height={10} rx={3} fill="#556677" />
          <rect x={2} y={36} width={7} height={5} rx={1} fill="#aa2222" />
          <rect x={19} y={36} width={7} height={5} rx={1} fill="#aa2222" />
          <rect x={4} y={14} width={8} height={6} rx={1} fill="#88aabb" opacity={0.5} />
          <rect x={16} y={14} width={8} height={6} rx={1} fill="#88aabb" opacity={0.5} />
        </g>
      );
    case "construction":
      return (
        <g transform={`translate(${x - 22}, ${y - 7})`}>
          <rect x={0} y={0} width={44} height={14} rx={2} fill="#ff8800" stroke="#cc6600" strokeWidth={1} />
          {[0, 8, 16, 24, 32].map((ox, i) => (
            <rect key={i} x={ox + 2} y={2} width={6} height={10} fill={i % 2 === 0 ? "#fff" : "#ff8800"} />
          ))}
        </g>
      );
    case "schoolzone":
      return (
        <g transform={`translate(${x - 18}, ${y - 7})`}>
          <rect x={0} y={0} width={36} height={14} rx={2} fill="#ffdd00" stroke="#ccaa00" strokeWidth={1} />
          <text x={18} y={10} textAnchor="middle" fontSize="5" fill="#222" fontFamily={PIXEL_FONT}>SLOW</text>
        </g>
      );
    case "stalled":
      return (
        <g transform={`translate(${x - 13}, ${y - 19})`}>
          <rect x={0} y={0} width={26} height={38} rx={4} fill="#666677" stroke="#555566" strokeWidth={1} />
          <rect x={4} y={2} width={18} height={8} rx={2} fill="#777788" />
          {/* Hazard blinkers */}
          <rect x={1} y={6} width={4} height={3} rx={1} fill="#ff8800">
            <animate attributeName="opacity" values="1;0.2;1" dur="0.6s" repeatCount="indefinite" />
          </rect>
          <rect x={21} y={6} width={4} height={3} rx={1} fill="#ff8800">
            <animate attributeName="opacity" values="1;0.2;1" dur="0.6s" repeatCount="indefinite" />
          </rect>
          <rect x={2} y={30} width={6} height={4} rx={1} fill="#aa2222" />
          <rect x={18} y={30} width={6} height={4} rx={1} fill="#aa2222" />
        </g>
      );
    case "deliveryvan":
      return (
        <g transform={`translate(${x - 13}, ${y - 24})`}>
          <rect x={0} y={8} width={26} height={40} rx={3} fill="#887766" stroke="#665544" strokeWidth={1} />
          <rect x={2} y={0} width={22} height={12} rx={3} fill="#998877" />
          <rect x={2} y={40} width={7} height={5} rx={1} fill="#aa2222" />
          <rect x={17} y={40} width={7} height={5} rx={1} fill="#aa2222" />
        </g>
      );
    case "tractor":
      return (
        <g transform={`translate(${x - 18}, ${y - 22})`}>
          <rect x={4} y={0} width={28} height={36} rx={3} fill="#338833" stroke="#226622" strokeWidth={1} />
          <rect x={8} y={2} width={20} height={10} rx={2} fill="#44aa44" />
          {/* Big rear wheels */}
          <circle cx={8} cy={38} r={6} fill="#333" stroke="#555" strokeWidth={1} />
          <circle cx={28} cy={38} r={6} fill="#333" stroke="#555" strokeWidth={1} />
          {/* Front wheels */}
          <circle cx={10} cy={6} r={3} fill="#333" stroke="#555" strokeWidth={0.5} />
          <circle cx={26} cy={6} r={3} fill="#333" stroke="#555" strokeWidth={0.5} />
        </g>
      );
    case "deer":
      return (
        <g transform={`translate(${x - 10}, ${y - 12})`}>
          <polygon points="10,0 0,16 20,16" fill="#996633" stroke="#774411" strokeWidth={1} />
          {/* Antlers */}
          <line x1={6} y1={2} x2={2} y2={-4} stroke="#774411" strokeWidth={1.5} />
          <line x1={14} y1={2} x2={18} y2={-4} stroke="#774411" strokeWidth={1.5} />
          {/* Eyes */}
          <circle cx={7} cy={8} r={1} fill="#fff" />
          <circle cx={13} cy={8} r={1} fill="#fff" />
          {/* Legs */}
          <line x1={5} y1={16} x2={4} y2={24} stroke="#774411" strokeWidth={1.5} />
          <line x1={15} y1={16} x2={16} y2={24} stroke="#774411" strokeWidth={1.5} />
        </g>
      );
    case "loggingtruck":
      return (
        <g transform={`translate(${x - 15}, ${y - 30})`}>
          <rect x={0} y={0} width={30} height={50} rx={3} fill="#554433" stroke="#443322" strokeWidth={1} />
          {/* Cab */}
          <rect x={3} y={0} width={24} height={12} rx={2} fill="#665544" />
          {/* Logs */}
          <circle cx={8} cy={22} r={4} fill="#886644" stroke="#664422" strokeWidth={0.5} />
          <circle cx={18} cy={22} r={4} fill="#886644" stroke="#664422" strokeWidth={0.5} />
          <circle cx={22} cy={22} r={4} fill="#886644" stroke="#664422" strokeWidth={0.5} />
          <circle cx={8} cy={32} r={4} fill="#886644" stroke="#664422" strokeWidth={0.5} />
          <circle cx={18} cy={32} r={4} fill="#886644" stroke="#664422" strokeWidth={0.5} />
          <circle cx={13} cy={27} r={4} fill="#997755" stroke="#664422" strokeWidth={0.5} />
          <rect x={2} y={42} width={8} height={5} rx={1} fill="#aa2222" />
          <rect x={20} y={42} width={8} height={5} rx={1} fill="#aa2222" />
        </g>
      );
    case "gravel":
      return (
        <g transform={`translate(${x - 25}, ${y - 8})`}>
          <rect x={0} y={0} width={50} height={16} rx={3} fill="#887766" opacity={0.7} />
          {[5, 15, 25, 35, 42].map((gx, i) => (
            <circle key={i} cx={gx} cy={8 + (i % 2) * 3 - 1} r={2 + (i % 3)} fill="#998877" opacity={0.8} />
          ))}
        </g>
      );
    default:
      return (
        <rect x={x - 12} y={y - 15} width={24} height={30} fill="#8888aa" rx={3} />
      );
  }
}

// ─── Hospital sprite (spans full road width) ───
function HospitalSprite({ y }) {
  const hw = ROAD_WIDTH + 40; // wider than road
  const hx = ROAD_LEFT - 20;
  return (
    <g transform={`translate(${hx}, ${y - 40})`}>
      {/* Glow behind */}
      <rect x={-10} y={-10} width={hw + 20} height={100} rx={8} fill="#33ff66" opacity={0.06}>
        <animate attributeName="opacity" values="0.06;0.12;0.06" dur="1.5s" repeatCount="indefinite" />
      </rect>
      {/* Main building */}
      <rect x={0} y={10} width={hw} height={60} rx={4} fill="#228844" stroke="#33ff66" strokeWidth={2} />
      <rect x={4} y={14} width={hw - 8} height={52} rx={2} fill="#1a6633" />
      {/* EMERGENCY text */}
      <text x={hw / 2} y={32} textAnchor="middle" fontSize="7" fill="#88ffaa" fontFamily={PIXEL_FONT} letterSpacing="2">
        EMERGENCY
      </text>
      {/* Big H */}
      <text x={hw / 2} y={58} textAnchor="middle" fontSize="28" fill="#fff" fontFamily={PIXEL_FONT}
        stroke="#33ff66" strokeWidth={1} paintOrder="stroke">
        H
      </text>
      {/* Red cross on roof */}
      <rect x={hw / 2 - 6} y={0} width={12} height={12} rx={2} fill="#ff3333" />
      <rect x={hw / 2 - 3} y={-3} width={6} height={18} rx={1} fill="#fff" />
      <rect x={hw / 2 - 9} y={3} width={18} height={6} rx={1} fill="#fff" />
      {/* Entrance doors */}
      <rect x={hw / 2 - 12} y={54} width={10} height={16} rx={1} fill="#33ff66" opacity={0.5} />
      <rect x={hw / 2 + 2} y={54} width={10} height={16} rx={1} fill="#33ff66" opacity={0.5} />
      {/* Side wings */}
      <rect x={-8} y={20} width={16} height={40} rx={3} fill="#1a5533" stroke="#33ff66" strokeWidth={1} />
      <rect x={hw - 8} y={20} width={16} height={40} rx={3} fill="#1a5533" stroke="#33ff66" strokeWidth={1} />
    </g>
  );
}

// ─── Player car sprite ───
function PlayerCar({ x, y }) {
  return (
    <g transform={`translate(${x - 14}, ${y - 22})`}>
      {/* Body */}
      <rect x={2} y={4} width={24} height={40} rx={5} fill="#ff8866" stroke="#cc5544" strokeWidth={1.5} />
      {/* Windshield */}
      <rect x={5} y={6} width={18} height={10} rx={3} fill="#aaddff" opacity={0.6} />
      {/* Roof */}
      <rect x={6} y={16} width={16} height={12} rx={2} fill="#ee7755" />
      {/* Rear window */}
      <rect x={7} y={30} width={14} height={6} rx={2} fill="#88bbdd" opacity={0.4} />
      {/* Headlights */}
      <rect x={4} y={2} width={6} height={4} rx={1} fill="#ffee88" />
      <rect x={18} y={2} width={6} height={4} rx={1} fill="#ffee88" />
      {/* Taillights */}
      <rect x={4} y={40} width={6} height={3} rx={1} fill="#ff2222" />
      <rect x={18} y={40} width={6} height={3} rx={1} fill="#ff2222" />
      {/* Siren light on roof */}
      <rect x={10} y={18} width={8} height={4} rx={2} fill="#ff2222">
        <animate attributeName="fill" values="#ff2222;#2222ff;#ff2222" dur="0.4s" repeatCount="indefinite" />
      </rect>
    </g>
  );
}

// ─── Environment art ───
function UrbanBuilding({ x, y, w, h }) {
  const windowRows = Math.floor(h / 12);
  const windowCols = Math.floor(w / 10);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#1a1a2e" stroke="#2a2a4e" strokeWidth={0.5} />
      {Array.from({ length: windowRows * windowCols }).map((_, i) => {
        const col = i % windowCols;
        const row = Math.floor(i / windowCols);
        const lit = ((x * 7 + i * 13 + row * 3) % 5) > 1;
        return (
          <rect
            key={i}
            x={x + 3 + col * 10}
            y={y + 3 + row * 12}
            width={6}
            height={8}
            fill={lit ? "#ffcc44" : "#0a0a1e"}
            opacity={lit ? 0.4 + ((i * 7) % 4) * 0.1 : 0.3}
          />
        );
      })}
    </g>
  );
}

function SuburbanBuilding({ x, y, w }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={20} rx={2} fill="#2a2a3e" stroke="#3a3a5e" strokeWidth={0.5} />
      <rect x={x + 2} y={y + 14} width={8} height={6} rx={1} fill="#1a1a2e" />
      {w > 30 && <rect x={x + w - 12} y={y + 14} width={8} height={6} rx={1} fill="#1a1a2e" />}
      {/* Sign */}
      <rect x={x + 4} y={y + 3} width={w - 8} height={8} rx={1} fill="#334455" />
    </g>
  );
}

function Tree({ x, y }) {
  return (
    <g>
      <rect x={x + 2} y={y + 10} width={4} height={8} fill="#554422" />
      <circle cx={x + 4} cy={y + 6} r={7} fill="#225522" />
    </g>
  );
}

function RuralFence({ x, y, w }) {
  return (
    <g>
      {Array.from({ length: Math.floor(w / 12) }).map((_, i) => (
        <g key={i}>
          <rect x={x + i * 12} y={y} width={2} height={14} fill="#665544" />
          {i > 0 && (
            <>
              <line x1={x + (i - 1) * 12 + 1} y1={y + 4} x2={x + i * 12 + 1} y2={y + 4} stroke="#665544" strokeWidth={1} />
              <line x1={x + (i - 1) * 12 + 1} y1={y + 10} x2={x + i * 12 + 1} y2={y + 10} stroke="#665544" strokeWidth={1} />
            </>
          )}
        </g>
      ))}
    </g>
  );
}

// ─── Rural landmark sprites ───
function LandmarkSprite({ type, x, y }) {
  switch (type) {
    case "church":
    case "church2":
      return (
        <g transform={`translate(${x}, ${y})`}>
          <polygon points="15,0 0,18 30,18" fill="#887766" stroke="#665544" strokeWidth={0.5} />
          <rect x={5} y={18} width={20} height={20} fill="#776655" stroke="#665544" strokeWidth={0.5} />
          <rect x={11} y={28} width={8} height={10} fill="#554433" />
          <rect x={13} y={-6} width={4} height={8} fill="#665544" />
          <line x1={13} y1={-4} x2={17} y2={-4} stroke="#665544" strokeWidth={1.5} />
        </g>
      );
    case "closedgas":
    case "closedgas2":
      return (
        <g transform={`translate(${x}, ${y})`}>
          <rect x={0} y={10} width={36} height={20} fill="#3a3a3a" stroke="#555555" strokeWidth={0.5} />
          <rect x={-4} y={0} width={44} height={12} fill="#444444" stroke="#555555" strokeWidth={0.5} />
          <text x={18} y={9} textAnchor="middle" fontSize="4" fill="#aa4444" fontFamily={PIXEL_FONT}>CLOSED</text>
          <rect x={8} y={14} width={8} height={14} fill="#2a2a2a" rx={1} />
          <rect x={20} y={14} width={8} height={14} fill="#2a2a2a" rx={1} />
        </g>
      );
    case "hospitalsign":
    case "hospitalsign2":
      return (
        <g transform={`translate(${x}, ${y})`}>
          <rect x={0} y={0} width={50} height={20} rx={2} fill="#225533" stroke="#338844" strokeWidth={1} />
          <text x={4} y={9} fontSize="4" fill="#88ddaa" fontFamily={PIXEL_FONT}>HOSPITAL</text>
          <text x={4} y={17} fontSize="4.5" fill="#ffcc44" fontFamily={PIXEL_FONT}>47 MI &#x2192;</text>
          <rect x={22} y={18} width={3} height={14} fill="#555544" />
        </g>
      );
    case "dollargeneral":
    case "dollargeneral2":
      return (
        <g transform={`translate(${x}, ${y})`}>
          <rect x={0} y={6} width={40} height={24} fill="#2a2a2a" stroke="#444444" strokeWidth={0.5} />
          <rect x={0} y={0} width={40} height={10} fill="#ddcc22" />
          <text x={20} y={8} textAnchor="middle" fontSize="5" fill="#222" fontFamily={PIXEL_FONT}>$G</text>
          <rect x={14} y={16} width={12} height={14} fill="#444433" />
        </g>
      );
    default:
      return null;
  }
}

// ─── Survival Meter (counts DOWN from 100 → 0 = death) ───
function SurvivalMeter({ percent }) {
  // percent here is the RAW meter (0→100 filling up). We display as survival (100→0).
  const survival = Math.max(0, 100 - percent);
  const barX = GAME_W - 28;
  const barY = 60;
  const barW = 16;
  const barH = 200;
  const fillH = (barH * survival) / 100;
  const fillY = barY + barH - fillH;

  // Color based on survival remaining (green when healthy, red when dying)
  const getColor = (surv) => {
    if (surv > 75) return "#33ff66";
    if (surv > 50) return "#ffcc44";
    if (surv > 25) return "#ff8866";
    return "#ff4444";
  };

  const color = getColor(survival);
  // Pulse rate increases as survival drops
  const pulseDur = Math.max(0.2, 0.3 + survival * 0.01);

  return (
    <g>
      {/* Label */}
      <text x={barX + barW / 2} y={barY - 10} textAnchor="middle" fontSize="4" fill="#8888aa" fontFamily={PIXEL_FONT}>
        SURVIVAL
      </text>

      {/* Bar background */}
      <rect x={barX - 2} y={barY - 2} width={barW + 4} height={barH + 4} rx={3}
        fill="#0a0a1a" stroke="#3a3a5a" strokeWidth={1} />
      <rect x={barX} y={barY} width={barW} height={barH} rx={2} fill="#1a1a2a" />

      {/* Fill — shows what's LEFT */}
      <rect x={barX} y={fillY} width={barW} height={fillH} rx={2} fill={color}>
        {survival < 25 && (
          <animate attributeName="opacity" values="1;0.5;1" dur="0.3s" repeatCount="indefinite" />
        )}
      </rect>

      {/* Percentage marks */}
      {[25, 50, 75].map((mark) => (
        <line
          key={mark}
          x1={barX - 1}
          y1={barY + barH - (barH * mark) / 100}
          x2={barX + barW + 1}
          y2={barY + barH - (barH * mark) / 100}
          stroke="#3a3a5a"
          strokeWidth={0.5}
          strokeDasharray="2,2"
        />
      ))}

      {/* Heart icon */}
      <text
        x={barX + barW / 2}
        y={barY + barH + 20}
        textAnchor="middle"
        fontSize="14"
        fill={color}
      >
        <animate attributeName="font-size" values="14;16;14" dur={`${pulseDur}s`} repeatCount="indefinite" />
        &#x2665;
      </text>

      {/* Percentage text — shows survival remaining */}
      <text
        x={barX + barW / 2}
        y={barY + barH + 36}
        textAnchor="middle"
        fontSize="6"
        fill={color}
        fontFamily={PIXEL_FONT}
      >
        {Math.max(0, Math.floor(survival))}%
      </text>
    </g>
  );
}

// ─── Scanlines CRT overlay ───
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

// ─── Scrolling road background ───
function RoadBackground({ scrollOffset, level, envObjects, landmarks }) {
  const roadColor = "#2a2a3a";
  const laneColor = "#5a5a7a";
  const isRural = level.envType === "rural";
  const envBg = isRural ? "#0a2a0a" : level.envType === "suburban" ? "#0f1a2a" : "#1a1a2e";

  // Lane narrowing for rural — after ~10s of driving, road goes to 2 lanes
  // We keep road structure but can show shoulder crumbling
  const dashSpacing = 40;
  const dashLen = 20;
  const numDashes = Math.ceil(GAME_H / dashSpacing) + 1;
  const dashOffset = scrollOffset % dashSpacing;

  return (
    <g>
      {/* Sky/ground */}
      <rect x={0} y={0} width={GAME_W} height={GAME_H} fill={envBg} />

      {/* Environment objects (left side) */}
      {envObjects.filter(e => e.side === "left").map((obj, i) => {
        const screenY = obj.baseY - (scrollOffset % (GAME_H * 3)) + GAME_H;
        const wy = ((screenY % (GAME_H + 100)) + GAME_H + 100) % (GAME_H + 100) - 50;
        if (wy < -60 || wy > GAME_H + 60) return null;
        if (obj.kind === "building" && level.envType === "urban") {
          return <UrbanBuilding key={`l${i}`} x={obj.x} y={wy} w={obj.w} h={obj.h} />;
        }
        if (obj.kind === "building" && level.envType === "suburban") {
          return <SuburbanBuilding key={`l${i}`} x={obj.x} y={wy} w={obj.w} />;
        }
        if (obj.kind === "tree") {
          return <Tree key={`l${i}`} x={obj.x} y={wy} />;
        }
        if (obj.kind === "fence") {
          return <RuralFence key={`l${i}`} x={obj.x} y={wy} w={obj.w} />;
        }
        return null;
      })}

      {/* Environment objects (right side) */}
      {envObjects.filter(e => e.side === "right").map((obj, i) => {
        const screenY = obj.baseY - (scrollOffset % (GAME_H * 3)) + GAME_H;
        const wy = ((screenY % (GAME_H + 100)) + GAME_H + 100) % (GAME_H + 100) - 50;
        if (wy < -60 || wy > GAME_H + 60) return null;
        if (obj.kind === "building" && level.envType === "urban") {
          return <UrbanBuilding key={`r${i}`} x={obj.x} y={wy} w={obj.w} h={obj.h} />;
        }
        if (obj.kind === "building" && level.envType === "suburban") {
          return <SuburbanBuilding key={`r${i}`} x={obj.x} y={wy} w={obj.w} />;
        }
        if (obj.kind === "tree") {
          return <Tree key={`r${i}`} x={obj.x} y={wy} />;
        }
        if (obj.kind === "fence") {
          return <RuralFence key={`r${i}`} x={obj.x} y={wy} w={obj.w} />;
        }
        return null;
      })}

      {/* Road surface */}
      <rect x={ROAD_LEFT} y={0} width={ROAD_WIDTH} height={GAME_H} fill={roadColor} />

      {/* Road edges */}
      <line x1={ROAD_LEFT} y1={0} x2={ROAD_LEFT} y2={GAME_H} stroke="#5a5a7a" strokeWidth={2} />
      <line x1={ROAD_RIGHT} y1={0} x2={ROAD_RIGHT} y2={GAME_H} stroke="#5a5a7a" strokeWidth={2} />

      {/* Lane dashes */}
      {[1, 2].map((lane) => {
        const lx = ROAD_LEFT + lane * LANE_WIDTH;
        return Array.from({ length: numDashes }).map((_, di) => {
          const dy = di * dashSpacing + dashOffset;
          return (
            <rect
              key={`dash-${lane}-${di}`}
              x={lx - 1}
              y={dy}
              width={2}
              height={dashLen}
              fill={laneColor}
            />
          );
        });
      })}

      {/* Rural landmarks */}
      {landmarks && landmarks.map((lm, i) => {
        if (lm.screenY < -60 || lm.screenY > GAME_H + 60) return null;
        return (
          <LandmarkSprite
            key={`lm-${i}`}
            type={lm.type}
            x={lm.side === "left" ? 2 : ROAD_RIGHT + 6}
            y={lm.screenY}
          />
        );
      })}
    </g>
  );
}

// ─── Generate environment objects for a level ───
function generateEnvObjects(envType) {
  const objects = [];
  const totalH = GAME_H * 3;

  if (envType === "urban") {
    // Buildings on both sides
    for (let y = 0; y < totalH; y += 80 + Math.random() * 40) {
      objects.push({
        side: "left", kind: "building",
        x: 2, baseY: y, w: 48 + Math.random() * 10, h: 40 + Math.random() * 30,
      });
      objects.push({
        side: "right", kind: "building",
        x: ROAD_RIGHT + 4, baseY: y + 30, w: 48 + Math.random() * 10, h: 40 + Math.random() * 30,
      });
    }
    // Streetlights
    for (let y = 20; y < totalH; y += 120) {
      objects.push({ side: "left", kind: "tree", x: 52, baseY: y, w: 0, h: 0 });
    }
  } else if (envType === "suburban") {
    // Strip malls + trees
    for (let y = 0; y < totalH; y += 100 + Math.random() * 60) {
      objects.push({
        side: "left", kind: "building",
        x: 2, baseY: y, w: 50 + Math.random() * 8,
      });
      objects.push({
        side: "right", kind: "building",
        x: ROAD_RIGHT + 4, baseY: y + 50, w: 50 + Math.random() * 8,
      });
    }
    for (let y = 40; y < totalH; y += 60 + Math.random() * 40) {
      objects.push({ side: "left", kind: "tree", x: 30 + Math.random() * 20, baseY: y });
      objects.push({ side: "right", kind: "tree", x: ROAD_RIGHT + 20 + Math.random() * 20, baseY: y + 30 });
    }
  } else {
    // Rural: fences, scattered trees, emptiness
    for (let y = 0; y < totalH; y += 200 + Math.random() * 200) {
      objects.push({
        side: "left", kind: "fence",
        x: 4, baseY: y, w: 50,
      });
    }
    for (let y = 100; y < totalH; y += 300 + Math.random() * 200) {
      objects.push({ side: "left", kind: "tree", x: 20 + Math.random() * 20, baseY: y });
    }
    for (let y = 200; y < totalH; y += 400 + Math.random() * 200) {
      objects.push({ side: "right", kind: "tree", x: ROAD_RIGHT + 20 + Math.random() * 30, baseY: y });
    }
    for (let y = 500; y < totalH; y += 500) {
      objects.push({
        side: "right", kind: "fence",
        x: ROAD_RIGHT + 4, baseY: y, w: 50,
      });
    }
  }

  return objects;
}

// ─── Title screen ───
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
      setScrollOffset((prev) => prev + 1.5);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const dashSpacing = 40;
  const dashLen = 20;
  const numDashes = 20;
  const dashOffset = scrollOffset % dashSpacing;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: `${GAME_W}px`,
        margin: "0 auto",
        background: "#0a0a1a",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <svg viewBox={`0 0 ${GAME_W} ${GAME_H}`} style={{ width: "100%", display: "block" }}>
        <rect width={GAME_W} height={GAME_H} fill="#0a1a0a" />

        {/* Road preview in background */}
        <rect x={ROAD_LEFT} y={0} width={ROAD_WIDTH} height={GAME_H} fill="#2a2a3a" opacity={0.3} />
        {[1, 2].map((lane) => {
          const lx = ROAD_LEFT + lane * LANE_WIDTH;
          return Array.from({ length: numDashes }).map((_, di) => (
            <rect
              key={`td-${lane}-${di}`}
              x={lx - 1}
              y={di * dashSpacing + dashOffset}
              width={2}
              height={dashLen}
              fill="#5a5a7a"
              opacity={0.3}
            />
          ));
        })}

        {/* Scrolling car */}
        <g transform={`translate(${GAME_W / 2 - 14}, ${520})`}>
          <rect x={2} y={4} width={24} height={40} rx={5} fill="#ff8866" opacity={0.5} />
          <rect x={10} y={18} width={8} height={4} rx={2} fill="#ff2222" opacity={0.5}>
            <animate attributeName="fill" values="#ff2222;#2222ff;#ff2222" dur="0.4s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* === SECTION 1: TITLE === */}
        <rect x={0} y={0} width={GAME_W} height={180} fill="rgba(0,0,0,0.75)" />

        <text x={GAME_W / 2} y={30} textAnchor="middle" fontSize="6" fill="#aa4444" fontFamily={PIXEL_FONT} letterSpacing="3">
          -- DISTRICT 31 PRESENTS --
        </text>

        <text x={GAME_W / 2} y={80} textAnchor="middle" fontSize="28" fill="#ff4444" fontFamily={PIXEL_FONT}
          stroke="#440000" strokeWidth="3" paintOrder="stroke">
          CODE
        </text>
        <text x={GAME_W / 2} y={120} textAnchor="middle" fontSize="28" fill="#4488ff" fontFamily={PIXEL_FONT}
          stroke="#001144" strokeWidth="3" paintOrder="stroke">
          BLUE
        </text>

        <text x={GAME_W / 2} y={148} textAnchor="middle" fontSize="6.5" fill="#8888aa" fontFamily={PIXEL_FONT}>
          A DRIVING GAME ABOUT DISTANCE
        </text>

        <text x={GAME_W / 2} y={170} textAnchor="middle" fontSize="12" fill="#ff4444">
          &#x2665;
          <animate attributeName="font-size" values="12;14;12" dur="0.8s" repeatCount="indefinite" />
        </text>

        {/* === SECTION 2: PREMISE === */}
        <rect x={0} y={190} width={GAME_W} height={110} fill="rgba(0,0,0,0.6)" />

        <text x={GAME_W / 2} y={210} textAnchor="middle" fontSize="6" fill="#ff8866" fontFamily={PIXEL_FONT}>
          YOU'RE HAVING A HEART ATTACK.
        </text>
        <text x={GAME_W / 2} y={228} textAnchor="middle" fontSize="6" fill="#ccccdd" fontFamily={PIXEL_FONT}>
          RACE TO THE HOSPITAL.
        </text>
        <text x={GAME_W / 2} y={246} textAnchor="middle" fontSize="6" fill="#ccccdd" fontFamily={PIXEL_FONT}>
          YOUR SURVIVAL METER IS FALLING.
        </text>
        <text x={GAME_W / 2} y={264} textAnchor="middle" fontSize="6" fill="#8888aa" fontFamily={PIXEL_FONT}>
          3 ZIP CODES. 3 DISTANCES.
        </text>
        <text x={GAME_W / 2} y={282} textAnchor="middle" fontSize="6.5" fill="#ff4444" fontFamily={PIXEL_FONT}>
          SAME HEART ATTACK.
        </text>

        {/* === SECTION 3: LEVEL PREVIEW CARDS === */}
        <rect x={0} y={310} width={GAME_W} height={120} fill="rgba(0,0,0,0.4)" />

        {/* Urban */}
        <rect x={12} y={318} width={100} height={62} rx={4} fill="#1a1a2e" stroke="#33ff66" strokeWidth={1} />
        <text x={62} y={332} textAnchor="middle" fontSize="6" fill="#33ff66" fontFamily={PIXEL_FONT}>URBAN</text>
        <text x={62} y={346} textAnchor="middle" fontSize="5" fill="#8888aa" fontFamily={PIXEL_FONT}>0.8 mi</text>
        <text x={62} y={360} textAnchor="middle" fontSize="10" fill="#33ff66">&#x2665;</text>
        <text x={62} y={374} textAnchor="middle" fontSize="4" fill="#557755" fontFamily={PIXEL_FONT}>CLOSE</text>

        {/* Suburban */}
        <rect x={122} y={318} width={116} height={62} rx={4} fill="#1a1a2e" stroke="#ffcc44" strokeWidth={1} />
        <text x={180} y={332} textAnchor="middle" fontSize="6" fill="#ffcc44" fontFamily={PIXEL_FONT}>SUBURBAN</text>
        <text x={180} y={346} textAnchor="middle" fontSize="5" fill="#8888aa" fontFamily={PIXEL_FONT}>4.2 mi</text>
        <text x={180} y={360} textAnchor="middle" fontSize="10" fill="#ffcc44">&#x2665;</text>
        <text x={180} y={374} textAnchor="middle" fontSize="4" fill="#777755" fontFamily={PIXEL_FONT}>FARTHER</text>

        {/* Rural */}
        <rect x={248} y={318} width={100} height={62} rx={4} fill="#1a1a2e" stroke="#ff4444" strokeWidth={1} />
        <text x={298} y={332} textAnchor="middle" fontSize="6" fill="#ff4444" fontFamily={PIXEL_FONT}>RURAL</text>
        <text x={298} y={346} textAnchor="middle" fontSize="5" fill="#8888aa" fontFamily={PIXEL_FONT}>47 mi</text>
        <text x={298} y={360} textAnchor="middle" fontSize="10" fill="#ff4444">&#x2665;</text>
        <text x={298} y={374} textAnchor="middle" fontSize="4" fill="#775555" fontFamily={PIXEL_FONT}>???</text>

        {/* Controls hint */}
        <text x={GAME_W / 2} y={410} textAnchor="middle" fontSize="5.5" fill="#666677" fontFamily={PIXEL_FONT}>
          TAP LEFT/RIGHT TO STEER · ARROWS/A/D
        </text>

        {/* === SECTION 4: START + SHARE === */}
        <rect x={0} y={424} width={GAME_W} height={70} fill="rgba(0,0,0,0.5)" />

        {/* Start button */}
        <g cursor="pointer" onClick={onStart}>
          <rect x={45} y={436} width={160} height={40} rx={3}
            fill={blink ? "#4a8844" : "#3a7733"} stroke="#66bb66" strokeWidth={1} />
          <text x={125} y={461} textAnchor="middle" fontSize="12" fill="#ccffcc" fontFamily={PIXEL_FONT}>
            TAP TO START
          </text>
        </g>

        {/* Share button */}
        <g cursor="pointer" onClick={onShare}>
          <rect x={215} y={436} width={100} height={40} rx={3}
            fill="#dd6644" stroke="#ee7755" strokeWidth={1} />
          <text x={265} y={461} textAnchor="middle" fontSize="10" fill="#fff" fontFamily={PIXEL_FONT}>
            SHARE
          </text>
        </g>

        {/* === SECTION 5: SOURCES + DONATE === */}
        <text x={GAME_W / 2} y={518} textAnchor="middle" fontSize="4.5" fill="#444455" fontFamily={PIXEL_FONT}>
          SOURCES: CDC · NC DHHS · AHA
        </text>
        <text x={GAME_W / 2} y={532} textAnchor="middle" fontSize="4.5" fill="#444455" fontFamily={PIXEL_FONT}>
          CHARTIS CENTER FOR RURAL HEALTH
        </text>

        <a href="https://secure.actblue.com/donate/andybowline" target="_blank" rel="noopener noreferrer">
          <g cursor="pointer">
            <rect x={GAME_W / 2 - 135} y={548} width={270} height={48} rx={3}
              fill="#1a3a1a" stroke="#3a6a3a" strokeWidth={1.5} />
            <text x={GAME_W / 2} y={569} textAnchor="middle" fontSize="5" fill="#88dd88" fontFamily={PIXEL_FONT}>
              CHIP IN FOR RURAL HEALTHCARE
            </text>
            <text x={GAME_W / 2} y={586} textAnchor="middle" fontSize="9" fill="#44ff44" fontFamily={PIXEL_FONT}>
              DONATE $10 &#x2192;
            </text>
          </g>
        </a>
      </svg>
    </div>
  );
}

// ─── Level card screen ───
function LevelCard({ level, onContinue }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (ready) {
      const t = setTimeout(onContinue, 400);
      return () => clearTimeout(t);
    }
  }, [ready, onContinue]);

  const borderColor = level.id === 1 ? "#33ff66" : level.id === 2 ? "#ffcc44" : "#ff4444";
  const textColor = level.id === 1 ? "#33ff66" : level.id === 2 ? "#ffcc44" : "#ff4444";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: `${GAME_W}px`,
        margin: "0 auto",
        background: "#0a0a1a",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg viewBox={`0 0 ${GAME_W} ${GAME_H}`} style={{ width: "100%", display: "block" }}>
        <rect width={GAME_W} height={GAME_H} fill="#0a0a1a" />

        <rect x={40} y={280} width={280} height={180} rx={6}
          fill="#0a0a1a" stroke={borderColor} strokeWidth={2} />

        <text x={GAME_W / 2} y={320} textAnchor="middle" fontSize="8" fill="#8888aa" fontFamily={PIXEL_FONT} letterSpacing="3">
          LEVEL {level.id}
        </text>

        <text x={GAME_W / 2} y={354} textAnchor="middle" fontSize="18" fill={textColor} fontFamily={PIXEL_FONT}>
          {level.name}
        </text>

        <text x={GAME_W / 2} y={390} textAnchor="middle" fontSize="6" fill="#8888aa" fontFamily={PIXEL_FONT}>
          Population: {level.population}
        </text>

        <text x={GAME_W / 2} y={410} textAnchor="middle" fontSize="6" fill="#8888aa" fontFamily={PIXEL_FONT}>
          Nearest Hospital: {level.hospitalDist}
        </text>

        {/* Pulsing heart */}
        <text x={GAME_W / 2} y={445} textAnchor="middle" fontSize="14" fill={textColor}>
          <animate attributeName="font-size" values="14;18;14" dur="0.8s" repeatCount="indefinite" />
          &#x2665;
        </text>
      </svg>
    </div>
  );
}

// ─── Level complete card ───
function LevelComplete({ level, meterPercent, onContinue }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (show) {
      const t = setTimeout(onContinue, 2000);
      return () => clearTimeout(t);
    }
  }, [show, onContinue]);

  const color = level.id === 1 ? "#33ff66" : "#ffcc44";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: `${GAME_W}px`,
        margin: "0 auto",
        background: "#0a0a1a",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg viewBox={`0 0 ${GAME_W} ${GAME_H}`} style={{ width: "100%", display: "block" }}>
        <rect width={GAME_W} height={GAME_H} fill="#0a0a1a" />

        <text x={GAME_W / 2} y={310} textAnchor="middle" fontSize="12" fill={color} fontFamily={PIXEL_FONT}>
          {level.completionText}
        </text>

        <text x={GAME_W / 2} y={350} textAnchor="middle" fontSize="7" fill="#ccccdd" fontFamily={PIXEL_FONT}>
          Time to treatment: {level.treatmentTime}
        </text>

        <text x={GAME_W / 2} y={385} textAnchor="middle" fontSize="6" fill="#8888aa" fontFamily={PIXEL_FONT}>
          Survival: {Math.max(0, Math.floor(100 - meterPercent))}%
        </text>

        {/* Heart - survived */}
        <text x={GAME_W / 2} y={430} textAnchor="middle" fontSize="20" fill={color}>
          &#x2665;
        </text>
      </svg>
    </div>
  );
}

// ─── End screen (after Level 3 death) ───
function EndScreen({ levelResults, onRestart, onShare }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2300);
    const t3 = setTimeout(() => setPhase(3), 3800);
    const t4 = setTimeout(() => setPhase(4), 5300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const stat = RANDOM_STATS[Math.floor(Math.random() * RANDOM_STATS.length)];
  const deathResult = levelResults.find((r) => !r.survived);
  const diedOnLevel = deathResult ? deathResult.level : null;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: `${GAME_W}px`,
        margin: "0 auto",
        background: "#0a0a1a",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        textAlign: "center",
      }}
    >
      {/* Flatline header */}
      <div style={{ marginBottom: "16px", animation: "fadeIn 0.5s ease-out" }}>
        <div
          style={{
            fontFamily: PIXEL_FONT,
            fontSize: "20px",
            color: "#ff4444",
            marginBottom: "8px",
            textShadow: "3px 3px 0px #330000",
          }}
        >
          FLATLINE
        </div>
        <div style={{ fontFamily: PIXEL_FONT, fontSize: "12px", color: "#555566" }}>
          &#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;
        </div>
      </div>

      {/* Phase 1: Results grid — built from actual levelResults */}
      {phase >= 1 && (
        <div
          style={{
            background: "#1a1a2a",
            border: "3px solid #3a3a5a",
            padding: "14px 16px",
            animation: "fadeIn 0.5s ease-out",
            width: "100%",
            maxWidth: "320px",
            marginBottom: "12px",
          }}
        >
          {LEVELS.map((lvl, i) => {
            const result = levelResults.find((r) => r.level === lvl.id);
            const survived = result ? result.survived : false;
            const played = !!result;
            const color = !played ? "#555566" : survived ? (lvl.id === 1 ? "#33ff66" : "#ffcc44") : "#ff4444";
            const statusText = !played ? "—" : survived ? "\u2665 SURVIVED" : "\u2717 DECEASED";
            const timeText = !played ? "—" : survived ? lvl.treatmentTime : "-- min";
            return (
              <div key={lvl.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: i < LEVELS.length - 1 ? "10px" : "0" }}>
                <span style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#8888aa" }}>{lvl.name}:</span>
                <span style={{ fontFamily: PIXEL_FONT, fontSize: "8px", color }}>{statusText}</span>
                <span style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: survived ? "#ccccdd" : "#555566" }}>{timeText}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Phase 2: The message */}
      {phase >= 2 && (
        <div style={{ animation: "fadeIn 1s ease-out", marginBottom: "12px" }}>
          <div
            style={{
              fontFamily: PIXEL_FONT,
              fontSize: "8px",
              color: "#ccccdd",
              lineHeight: "2.2",
              marginBottom: "6px",
            }}
          >
            {diedOnLevel && diedOnLevel <= 2
              ? "Same heart attack. Same road."
              : "Same heart attack. Same person."}
          </div>
          <div
            style={{
              fontFamily: PIXEL_FONT,
              fontSize: "7px",
              color: "#ff8866",
              lineHeight: "2",
            }}
          >
            {diedOnLevel && diedOnLevel <= 2
              ? "The obstacles were too much."
              : "The only thing that changed was the zip code."}
          </div>
        </div>
      )}

      {/* Phase 3: Random stat */}
      {phase >= 3 && (
        <div
          style={{
            animation: "fadeIn 1s ease-out",
            background: "#1a1a0a",
            border: "2px solid #554422",
            padding: "10px 14px",
            marginBottom: "12px",
            maxWidth: "300px",
          }}
        >
          <div
            style={{
              fontFamily: PIXEL_FONT,
              fontSize: "6.5px",
              color: "#ddaa33",
              lineHeight: "2",
              textAlign: "center",
            }}
          >
            {stat.toUpperCase()}
          </div>
        </div>
      )}

      {/* Phase 4: CTAs */}
      {phase >= 4 && (
        <div
          style={{
            animation: "fadeIn 1s ease-out",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          {/* Campaign link */}
          <a
            href="https://andycantwin.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", cursor: "pointer", width: "100%" }}
          >
            <div
              style={{
                background: "#1a2a1a",
                border: "3px solid #3a5a3a",
                padding: "10px 16px",
                textAlign: "center",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#5a8a5a")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#3a5a3a")}
            >
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "9px", color: "#ffaa44", marginBottom: "4px" }}>
                ANDY BOWLINE
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "5.5px", color: "#88aa88", marginBottom: "2px" }}>
                NC SENATE · DISTRICT 31
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#ff8866" }}>
                CAN'T WIN. YET.
              </div>
            </div>
          </a>

          {/* Share + Play Again */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={onShare}
              style={{
                fontFamily: PIXEL_FONT,
                fontSize: "10px",
                color: "#fff",
                background: "#dd6644",
                padding: "12px 24px",
                border: "none",
                borderTop: "3px solid #ee7755",
                borderLeft: "3px solid #ee7755",
                borderBottom: "3px solid #aa4422",
                borderRight: "3px solid #aa4422",
                cursor: "pointer",
              }}
            >
              SHARE
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                fontFamily: PIXEL_FONT,
                fontSize: "9px",
                color: "#ccddff",
                background: "#4466aa",
                padding: "12px 20px",
                border: "none",
                borderTop: "3px solid #5577bb",
                borderLeft: "3px solid #5577bb",
                borderBottom: "3px solid #334488",
                borderRight: "3px solid #334488",
                cursor: "pointer",
              }}
            >
              PLAY AGAIN
            </button>
          </div>

          {/* Donate */}
          <a
            href="https://secure.actblue.com/donate/andybowline"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", width: "100%" }}
          >
            <div
              style={{
                background: "#1a3a1a",
                border: "3px solid #3a6a3a",
                padding: "10px 16px",
                textAlign: "center",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#5a9a5a")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#3a6a3a")}
            >
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "5px", color: "#88dd88", marginBottom: "4px" }}>
                RURAL NC NEEDS YOUR HELP
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "8px", color: "#44ff44" }}>
                CHIP IN TO FIGHT FOR RURAL HEALTHCARE
              </div>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Main game component ───
export default function CodeBlue() {
  const [gameState, setGameState] = useState("title"); // title | levelcard | playing | levelcomplete | ended
  const [currentLevel, setCurrentLevel] = useState(0); // 0-indexed
  const [levelResults, setLevelResults] = useState([]);
  const [levelCompleteMeter, setLevelCompleteMeter] = useState(0);
  const [renderTick, setRenderTick] = useState(0);

  // Mutable game state refs
  const playerXRef = useRef(GAME_W / 2);
  const meterRef = useRef(0);
  const distanceRef = useRef(0);
  const scrollOffsetRef = useRef(0);
  const obstaclesRef = useRef([]);
  const lastSpawnRef = useRef(0);
  const gameLoopRef = useRef(null);
  const gameStateRef = useRef("title");
  const lastFrameRef = useRef(0);
  const steerRef = useRef(0); // -1 = left, 0 = center, 1 = right
  const keysRef = useRef({});
  const touchSideRef = useRef(null); // "left" | "right" | null
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const envObjectsRef = useRef([]);
  const landmarksRef = useRef([]);
  const landmarkIndexRef = useRef(0);
  const hospitalYRef = useRef(-100);
  const hospitalVisibleRef = useRef(false);
  const hitFlashRef = useRef(0);
  const levelRef = useRef(LEVELS[0]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // ─── Touch handling ───
  const handleTouchStart = useCallback((e) => {
    if (gameStateRef.current !== "playing") return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touchX = touch.clientX - rect.left;
    const mid = rect.width / 2;
    touchSideRef.current = touchX < mid ? "left" : "right";
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (gameStateRef.current !== "playing") return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touchX = touch.clientX - rect.left;
    const mid = rect.width / 2;
    touchSideRef.current = touchX < mid ? "left" : "right";
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchSideRef.current = null;
  }, []);

  // ─── Keyboard handling ───
  useEffect(() => {
    if (gameState !== "playing") return;
    const onDown = (e) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "a", "d"].includes(k)) {
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
      const dt = Math.min((timestamp - lastFrameRef.current) / 1000, 0.05);
      lastFrameRef.current = timestamp;

      const level = levelRef.current;

      // ─── Steering ───
      const k = keysRef.current;
      let steerDir = 0;
      if (k["arrowleft"] || k["a"]) steerDir = -1;
      if (k["arrowright"] || k["d"]) steerDir = 1;
      if (touchSideRef.current === "left") steerDir = -1;
      if (touchSideRef.current === "right") steerDir = 1;

      if (steerDir !== 0) {
        playerXRef.current += steerDir * STEER_SPEED * dt;
      } else {
        // Return to center lane
        const centerX = LANE_CENTERS[1]; // center lane
        const diff = centerX - playerXRef.current;
        if (Math.abs(diff) > 2) {
          playerXRef.current += Math.sign(diff) * CENTER_RETURN_SPEED * dt;
        }
      }
      // Clamp to road
      playerXRef.current = Math.max(ROAD_LEFT + 16, Math.min(ROAD_RIGHT - 16, playerXRef.current));

      // ─── Increment meter ───
      meterRef.current += METER_RATE * dt;

      // ─── Increment distance ───
      distanceRef.current += SCROLL_SPEED * dt;
      scrollOffsetRef.current += SCROLL_SPEED * dt;

      // ─── Hit flash decay ───
      if (hitFlashRef.current > 0) {
        hitFlashRef.current = Math.max(0, hitFlashRef.current - dt * 4);
      }

      // ─── Check meter overflow (death) ───
      if (meterRef.current >= 100) {
        meterRef.current = 100;
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
        // Record death on this level before going to end screen
        setLevelResults((prev) => [
          ...prev,
          { level: level.id, survived: false, meter: 100 },
        ]);
        setGameState("ended");
        return;
      }

      // ─── Check hospital arrival ───
      if (distanceRef.current >= level.hospitalDistance && level.hospitalDistance !== Infinity) {
        if (!hospitalVisibleRef.current) {
          hospitalVisibleRef.current = true;
          hospitalYRef.current = -60; // starts above screen
        }
        // Scroll hospital down
        hospitalYRef.current += SCROLL_SPEED * dt;

        // If hospital reached player position
        if (hospitalYRef.current >= 500) {
          cancelAnimationFrame(gameLoopRef.current);
          gameLoopRef.current = null;
          setLevelCompleteMeter(meterRef.current);
          setLevelResults((prev) => [
            ...prev,
            { level: level.id, survived: true, meter: meterRef.current },
          ]);
          setGameState("levelcomplete");
          return;
        }
      }

      // ─── Spawn obstacles ───
      const now = Date.now();
      if (now - lastSpawnRef.current > level.spawnInterval) {
        const obsTypes = level.obstacles;
        // How many obstacles to spawn at once (suburban can get pairs)
        const count = level.id === 2 && Math.random() < 0.4 ? 2 : 1;
        const usedLanes = [];
        for (let s = 0; s < count; s++) {
          const type = obsTypes[Math.floor(Math.random() * obsTypes.length)];
          const def = getObstacleDef(type);
          let laneIdx;
          // Avoid same lane for multi-spawn
          do {
            laneIdx = Math.floor(Math.random() * level.lanes);
          } while (usedLanes.includes(laneIdx) && usedLanes.length < level.lanes);
          usedLanes.push(laneIdx);
          const laneX = LANE_CENTERS[laneIdx];
          obstaclesRef.current.push({
            id: Math.random(),
            type,
            x: laneX,
            y: -def.h - s * 30, // stagger vertically slightly
            w: def.w,
            h: def.h,
            lane: laneIdx,
          });
        }
        lastSpawnRef.current = now;
      }

      // ─── Update landmarks (rural) ───
      if (level.envType === "rural") {
        const dist = distanceRef.current;
        while (
          landmarkIndexRef.current < RURAL_LANDMARKS.length &&
          dist >= RURAL_LANDMARKS[landmarkIndexRef.current].dist
        ) {
          const lm = RURAL_LANDMARKS[landmarkIndexRef.current];
          const side = landmarkIndexRef.current % 2 === 0 ? "left" : "right";
          landmarksRef.current.push({
            type: lm.type,
            spawnDist: lm.dist,
            screenY: -40,
            side,
          });
          landmarkIndexRef.current++;
        }
        // Move landmarks down
        landmarksRef.current = landmarksRef.current.filter((lm) => {
          lm.screenY += SCROLL_SPEED * dt;
          return lm.screenY < GAME_H + 80;
        });
      }

      // ─── Move obstacles + collision ───
      const px = playerXRef.current;
      const py = 560; // Player fixed Y position

      obstaclesRef.current = obstaclesRef.current.filter((obs) => {
        obs.y += SCROLL_SPEED * dt;

        // Cull
        if (obs.y > GAME_H + 80) return false;

        // Collision: lane-based with forgiving hitbox
        const xOverlap = Math.abs(px - obs.x) < (LANE_WIDTH / 2 - 6);
        const yOverlap = obs.y + obs.h / 2 > py - 20 && obs.y - obs.h / 2 < py + 20;

        if (xOverlap && yOverlap) {
          meterRef.current = Math.min(100, meterRef.current + COLLISION_PENALTY);
          hitFlashRef.current = 1;

          // Check death
          if (meterRef.current >= 100) {
            cancelAnimationFrame(gameLoopRef.current);
            gameLoopRef.current = null;
            setLevelResults((prev) => [
              ...prev,
              { level: level.id, survived: false, meter: 100 },
            ]);
            setGameState("ended");
            return false;
          }
          return false; // Remove obstacle on hit
        }

        return true;
      });

      // ─── Render ───
      setRenderTick((t) => t + 1);

      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState]);

  // ─── Start game (from title) ───
  const startGame = useCallback(() => {
    setCurrentLevel(0);
    setLevelResults([]);
    setGameState("levelcard");
  }, []);

  // ─── Start a level ───
  const startLevel = useCallback(() => {
    const level = LEVELS[currentLevel];
    levelRef.current = level;
    playerXRef.current = LANE_CENTERS[1];
    meterRef.current = 0;
    distanceRef.current = 0;
    scrollOffsetRef.current = 0;
    obstaclesRef.current = [];
    lastSpawnRef.current = Date.now();
    lastFrameRef.current = 0;
    keysRef.current = {};
    touchSideRef.current = null;
    hospitalVisibleRef.current = false;
    hospitalYRef.current = -100;
    hitFlashRef.current = 0;
    envObjectsRef.current = generateEnvObjects(level.envType);
    landmarksRef.current = [];
    landmarkIndexRef.current = 0;
    setGameState("playing");
  }, [currentLevel]);

  // ─── Advance to next level ───
  const advanceLevel = useCallback(() => {
    const next = currentLevel + 1;
    if (next < LEVELS.length) {
      setCurrentLevel(next);
      setGameState("levelcard");
    } else {
      setGameState("ended");
    }
  }, [currentLevel]);

  // ─── Share handler ───
  const handleShare = useCallback(async () => {
    const url = "https://games.andycantwin.com/codeblue";
    // Build share text from actual results
    const lines = [];
    const urbanResult = levelResults.find((r) => r.level === 1);
    const subResult = levelResults.find((r) => r.level === 2);
    const ruralResult = levelResults.find((r) => r.level === 3);
    if (urbanResult?.survived) lines.push("I survived the heart attack in the city (4 min).");
    else if (urbanResult) lines.push("I didn't survive the heart attack in the city.");
    if (subResult?.survived) lines.push("I survived in the suburbs (18 min).");
    else if (subResult) lines.push("I didn't survive in the suburbs.");
    if (ruralResult) lines.push("I didn't survive in rural NC.");
    else if (urbanResult || subResult) lines.push("I never made it to rural NC.");
    lines.push("\nSame emergency. Different zip code.\n\nPlay 'Code Blue':");
    const text = lines.join(" ");
    if (navigator.share) {
      try {
        await navigator.share({ title: "Code Blue", text, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert("Link copied to clipboard!");
    } catch {
      prompt("Copy this link to share:", url);
    }
  }, [levelResults]);

  // ─── Read refs for rendering ───
  const playerX = playerXRef.current;
  const meter = meterRef.current;
  const scrollOffset = scrollOffsetRef.current;
  const obstacles = obstaclesRef.current;
  const level = levelRef.current;
  const hitFlash = hitFlashRef.current;
  const hospitalY = hospitalYRef.current;
  const hospitalVisible = hospitalVisibleRef.current;
  const landmarks = landmarksRef.current;
  const envObjects = envObjectsRef.current;
  const playerY = 560;

  return (
    <div
      ref={containerRef}
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
        @keyframes flatlineFlash {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      <Scanlines />

      {/* CRT vignette */}
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

      {gameState === "levelcard" && (
        <LevelCard level={LEVELS[currentLevel]} onContinue={startLevel} />
      )}

      {gameState === "playing" && (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
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
            {/* Road + environment */}
            <RoadBackground
              scrollOffset={scrollOffset}
              level={level}
              envObjects={envObjects}
              landmarks={landmarks}
            />

            {/* Hit flash overlay */}
            {hitFlash > 0 && (
              <rect
                x={0}
                y={0}
                width={GAME_W}
                height={GAME_H}
                fill="#ff4444"
                opacity={hitFlash * 0.3}
              />
            )}

            {/* Hospital */}
            {hospitalVisible && <HospitalSprite y={hospitalY} />}

            {/* Obstacles */}
            {obstacles.map((obs) => (
              <ObstacleSprite key={obs.id} obs={obs} />
            ))}

            {/* Player car */}
            <PlayerCar x={playerX} y={playerY} />

            {/* HUD background */}
            <rect x={0} y={0} width={GAME_W - 36} height={44} fill="rgba(0,0,0,0.7)" rx={0} />

            {/* Level indicator */}
            <text
              x={10}
              y={18}
              fontSize="7"
              fill={level.id === 1 ? "#33ff66" : level.id === 2 ? "#ffcc44" : "#ff4444"}
              fontFamily={PIXEL_FONT}
            >
              LVL {level.id}: {level.name}
            </text>

            {/* Distance */}
            <text x={10} y={34} fontSize="6" fill="#8888aa" fontFamily={PIXEL_FONT}>
              {level.hospitalDistance === Infinity
                ? `${(distanceRef.current / 100).toFixed(1)} mi · HOSPITAL: 47 MI`
                : `${Math.min(100, Math.floor((distanceRef.current / level.hospitalDistance) * 100))}% TO HOSPITAL`}
            </text>

            {/* Survival meter */}
            <SurvivalMeter percent={meter} />

            {/* Touch hint at start */}
            {distanceRef.current < 200 && (
              <text
                x={GAME_W / 2}
                y={GAME_H - 16}
                textAnchor="middle"
                fontSize="5"
                fill="#444455"
                fontFamily={PIXEL_FONT}
              >
                TAP LEFT/RIGHT TO STEER
              </text>
            )}
          </svg>
        </div>
      )}

      {gameState === "levelcomplete" && (
        <LevelComplete
          level={LEVELS[currentLevel]}
          meterPercent={levelCompleteMeter}
          onContinue={advanceLevel}
        />
      )}

      {gameState === "ended" && (
        <EndScreen levelResults={levelResults} onRestart={startGame} onShare={handleShare} />
      )}
    </div>
  );
}
