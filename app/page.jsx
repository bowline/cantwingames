"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bebas_Neue, Barlow, Permanent_Marker } from "next/font/google";

const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const barlow = Barlow({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-body" });
const permanentMarker = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--font-accent" });

const PIXEL_FONT = `var(--font-pixel), "Press Start 2P", monospace`;
const SITE = "https://andycantwin.com";

// ─── Earn Your Seat portal card ───
function EarnYourSeatCard() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href="/earnyourseat" style={{ textDecoration: "none", display: "block" }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#0a0a1a",
          position: "relative",
          overflow: "hidden",
          borderLeft: "6px solid var(--magenta)",
          boxShadow: hovered ? "12px 12px 0 rgba(0,0,0,0.1)" : "8px 8px 0 rgba(0,0,0,0.08)",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "transform 150ms ease, box-shadow 150ms ease",
          cursor: "pointer",
        }}
      >
        {/* Scanline overlay */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
          pointerEvents: "none", zIndex: 2,
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)",
          pointerEvents: "none", zIndex: 3,
        }} />

        <div style={{
          padding: "var(--space-md)", position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", gap: "var(--space-sm)",
        }}>
          {/* Pixel art scene */}
          <div style={{ width: "100%" }}>
            <svg viewBox="0 0 320 180" style={{ width: "100%", imageRendering: "pixelated" }}>
              <rect x="0" y="0" width="320" height="120" fill="#8b9bb4" />
              {[...Array(8)].map((_, i) => (
                <rect key={`wp${i}`} x={i * 40} y="0" width="2" height="120" fill="#8290a8" opacity="0.3" />
              ))}
              <rect x="0" y="120" width="320" height="60" fill="#5c4a3a" />
              <rect x="0" y="120" width="320" height="2" fill="#4a3a2a" />
              <rect x="20" y="15" width="50" height="40" fill="#2a2a3a" />
              <rect x="22" y="17" width="46" height="36" fill="#4a6a8a" />
              <rect x="44" y="17" width="2" height="36" fill="#2a2a3a" />
              <rect x="22" y="34" width="46" height="2" fill="#2a2a3a" />
              <rect x="250" y="10" width="2" height="45" fill="#6a5a4a" />
              <rect x="252" y="10" width="25" height="16" fill="#cc3333" />
              <rect x="252" y="16" width="25" height="5" fill="#eee" />
              <rect x="252" y="21" width="25" height="5" fill="#3355aa" />
              <rect x="50" y="90" width="220" height="7" fill="#8b6b4a" />
              <rect x="50" y="97" width="220" height="3" fill="#7a5a3a" />
              <rect x="54" y="100" width="7" height="24" fill="#7a5a3a" />
              <rect x="259" y="100" width="7" height="24" fill="#7a5a3a" />
              <rect x="135" y="68" width="50" height="7" fill="#3a3a4a" />
              <rect x="139" y="62" width="42" height="8" fill="#4a4a5a" />
              <rect x="148" y="76" width="28" height="18" fill="#2a3a5a" />
              <rect x="156" y="70" width="16" height="12" fill="#d4a574" />
              <rect x="154" y="68" width="20" height="5" fill="#888899" />
              <rect x="160" y="76" width="3" height="12" fill="#aa2233" />
              {[...Array(5)].map((_, i) => (
                <rect key={`p${i}`} x={218 + ((i * 7) % 5) - 2} y={84 - i * 2.5} width="24" height="12"
                  fill={i % 2 === 0 ? "#f0e8d8" : "#e8e0d0"} stroke="#ccc0a8" strokeWidth="0.5"
                  transform={`rotate(${((i * 13) % 15) - 7}, ${230}, ${90 - i * 2.5})`} />
              ))}
              <rect x="95" y="74" width="20" height="16" fill="#2a2a3a" />
              <rect x="97" y="76" width="16" height="12" fill="#1a3a2a" />
              <text x="105" y="84" textAnchor="middle" fill="#33cc66" fontSize="4" fontFamily={PIXEL_FONT}>R+25</text>
            </svg>
          </div>

          <div style={{ width: "100%" }}>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#6a8a6a", marginBottom: "6px", letterSpacing: "2px" }}>
              — DISTRICT 31 —
            </div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: "14px", color: "#ff8866", textShadow: "2px 2px 0px #331a11", lineHeight: "1.4" }}>
              EARN YOUR
            </div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: "14px", color: "#ffaa44", textShadow: "2px 2px 0px #332211", lineHeight: "1.4", marginBottom: "10px" }}>
              SEAT
            </div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#8888aa", lineHeight: "1.9" }}>
              YOU ARE A STATE SENATOR IN A GERRYMANDERED DISTRICT.{" "}
              <span style={{ color: "#aa6633" }}>TRY TO REPRESENT YOUR VOTERS.</span>
            </div>
            <div style={{
              marginTop: "12px", fontFamily: PIXEL_FONT, fontSize: "7px",
              color: hovered ? "#33ff66" : "#555566",
              transition: "color 0.2s",
              animation: hovered ? undefined : "blink 1.5s infinite",
            }}>
              {hovered ? "▶ PRESS START" : "PRESS START"}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── NC Teacher Run portal card ───
function TeacherRunCard() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href="/teacherrun" style={{ textDecoration: "none", display: "block" }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#1a1a2a",
          position: "relative",
          overflow: "hidden",
          borderLeft: "6px solid #5c8a4c",
          boxShadow: hovered ? "12px 12px 0 rgba(0,0,0,0.1)" : "8px 8px 0 rgba(0,0,0,0.08)",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "transform 150ms ease, box-shadow 150ms ease",
          cursor: "pointer",
        }}
      >
        {/* Scanline overlay */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
          pointerEvents: "none", zIndex: 2,
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)",
          pointerEvents: "none", zIndex: 3,
        }} />

        <div style={{
          padding: "var(--space-md)", position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", gap: "var(--space-sm)",
        }}>
          {/* Hallway scene */}
          <div style={{ width: "100%" }}>
            <svg viewBox="0 0 320 180" style={{ width: "100%", imageRendering: "pixelated" }}>
              {/* Hallway floor — checkerboard tiles */}
              {Array.from({ length: 5 }).map((_, row) =>
                Array.from({ length: 8 }).map((_, col) => (
                  <rect key={`t${row}-${col}`} x={col * 40} y={120 + row * 12} width={40} height={12}
                    fill={(row + col) % 2 === 0 ? "#3a3a4a" : "#32323f"} stroke="#2a2a35" strokeWidth={0.5} />
                ))
              )}
              {/* Hallway walls */}
              <rect x="0" y="0" width="320" height="120" fill="#4a4a5a" />
              {/* Lockers left */}
              {[0, 1, 2, 3].map(i => (
                <g key={`ll${i}`}>
                  <rect x={4} y={10 + i * 28} width={30} height={26} fill="#5588aa" stroke="#3a6a8a" strokeWidth={1} rx={1} />
                  <rect x={28} y={18 + i * 28} width={3} height={8} fill="#3a6a8a" rx={0.5} />
                  <rect x={10} y={12 + i * 28} width={18} height={3} fill="#4a7a9a" />
                </g>
              ))}
              {/* Lockers right */}
              {[0, 1, 2, 3].map(i => (
                <g key={`lr${i}`}>
                  <rect x={286} y={10 + i * 28} width={30} height={26} fill="#5588aa" stroke="#3a6a8a" strokeWidth={1} rx={1} />
                  <rect x={289} y={18 + i * 28} width={3} height={8} fill="#3a6a8a" rx={0.5} />
                  <rect x={292} y={12 + i * 28} width={18} height={3} fill="#4a7a9a" />
                </g>
              ))}
              {/* Finish line */}
              {Array.from({ length: 16 }).map((_, i) => (
                <rect key={`fl${i}`} x={40 + i * 15} y={14} width={15} height={6}
                  fill={i % 2 === 0 ? "#fff" : "#222"} opacity={0.5} />
              ))}
              <text x={160} y={11} textAnchor="middle" fontSize="6" fill="#ffcc44" fontFamily={PIXEL_FONT}
                stroke="#000" strokeWidth={1.5} paintOrder="stroke">▲ $72K NATIONAL AVG ▲</text>
              {/* Teacher sprite */}
              <g transform="translate(145, 70)">
                <ellipse cx={20} cy={54} rx={12} ry={3} fill="rgba(0,0,0,0.3)" />
                <rect x={10} y={20} width={20} height={24} fill="#5c8a4c" rx={2} />
                <rect x={12} y={6} width={16} height={16} fill="#f0c090" rx={2} />
                <rect x={12} y={4} width={16} height={8} fill="#6b3a2a" rx={2} />
                <rect x={14} y={12} width={5} height={4} fill="none" stroke="#333" strokeWidth={1} />
                <rect x={21} y={12} width={5} height={4} fill="none" stroke="#333" strokeWidth={1} />
                <rect x={29} y={20} width={8} height={10} fill="#cc4444" rx={1} />
                <rect x={30} y={21} width={6} height={8} fill="#eee" />
                <rect x={14} y={42} width={6} height={10} fill="#3a3a5c" rx={1} />
                <rect x={22} y={42} width={6} height={10} fill="#3a3a5c" rx={1} />
                <circle cx={20} cy={3} r={4} fill="#cc3333" />
              </g>
              {/* Obstacles */}
              <g transform="translate(60, 90)">
                <rect x={0} y={0} width={50} height={40} fill="#66bbdd" rx={3} stroke="#000" strokeWidth={1.5} />
                <rect x={3} y={3} width={44} height={34} fill="rgba(0,0,0,0.3)" rx={2} />
                <text x={25} y={18} textAnchor="middle" fontSize="12">🧊</text>
                <text x={25} y={30} textAnchor="middle" fontSize="5" fill="#fff" fontFamily={PIXEL_FONT}>PAY FREEZE</text>
              </g>
              <g transform="translate(220, 55)">
                <rect x={0} y={0} width={50} height={40} fill="#dd6688" rx={3} stroke="#000" strokeWidth={1.5} />
                <rect x={3} y={3} width={44} height={34} fill="rgba(0,0,0,0.3)" rx={2} />
                <text x={25} y={18} textAnchor="middle" fontSize="12">💸</text>
                <text x={25} y={30} textAnchor="middle" fontSize="5" fill="#fff" fontFamily={PIXEL_FONT}>VOUCHER</text>
              </g>
            </svg>
          </div>

          <div style={{ width: "100%" }}>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#5c8a4c", marginBottom: "6px", letterSpacing: "2px" }}>
              — ENDLESS RUNNER —
            </div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: "14px", color: "#66bbdd", textShadow: "2px 2px 0px #112233", lineHeight: "1.4" }}>
              NC TEACHER
            </div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: "14px", color: "#ffcc44", textShadow: "2px 2px 0px #332211", lineHeight: "1.4", marginBottom: "10px" }}>
              RUN
            </div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#8888aa", lineHeight: "1.9" }}>
              DODGE PAY FREEZES, VOUCHER BILLS, AND CLASS SIZES.{" "}
              <span style={{ color: "#dd6688" }}>THE FINISH LINE NEVER GETS CLOSER.</span>
            </div>
            <div style={{
              marginTop: "12px", fontFamily: PIXEL_FONT, fontSize: "7px",
              color: hovered ? "#33ff66" : "#555566",
              transition: "color 0.2s",
              animation: hovered ? undefined : "blink 1.5s infinite",
            }}>
              {hovered ? "▶ PRESS START" : "PRESS START"}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Bills Bills Bills portal card ───
function BillsBillsBillsCard() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href="/billsbillsbills" style={{ textDecoration: "none", display: "block" }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#0a0a1a",
          position: "relative",
          overflow: "hidden",
          borderLeft: "6px solid #ddaa33",
          boxShadow: hovered ? "12px 12px 0 rgba(0,0,0,0.1)" : "8px 8px 0 rgba(0,0,0,0.08)",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "transform 150ms ease, box-shadow 150ms ease",
          cursor: "pointer",
        }}
      >
        {/* Scanline overlay */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
          pointerEvents: "none", zIndex: 2,
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)",
          pointerEvents: "none", zIndex: 3,
        }} />

        <div style={{
          padding: "var(--space-md)", position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", gap: "var(--space-sm)",
        }}>
          {/* Space scene: house with shield vs incoming bills */}
          <div style={{ width: "100%" }}>
            <svg viewBox="0 0 320 180" style={{ width: "100%", imageRendering: "pixelated" }}>
              {/* Dark space background with gradient */}
              <defs>
                <radialGradient id="cardSpaceBg" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#12122a" />
                  <stop offset="100%" stopColor="#0a0a1a" />
                </radialGradient>
              </defs>
              <rect width="320" height="180" fill="url(#cardSpaceBg)" />
              {/* Stars */}
              {[20,55,90,130,175,210,250,285,40,145,195,270,310,65,115,235].map((x, i) => (
                <circle key={`s${i}`} cx={x} cy={(i * 29 + 11) % 170 + 5}
                  r={(i % 3 === 0) ? 1.2 : 0.8} fill="#fff" opacity={0.15 + (i % 4) * 0.07} />
              ))}
              {/* House with shield glow */}
              <g transform="translate(70, 60)">
                {/* Shield glow */}
                <circle cx={14} cy={16} r={28} fill="none" stroke="#ffcc44" strokeWidth={1.5} opacity={0.35} />
                <circle cx={14} cy={16} r={20} fill="#ffcc44" opacity={0.06} />
                {/* Roof */}
                <polygon points="14,0 0,12 28,12" fill="#cc5533" stroke="#992211" strokeWidth={1} />
                {/* Body */}
                <rect x={3} y={12} width={22} height={18} fill="#ddcc88" stroke="#aa9955" strokeWidth={1} />
                {/* Door */}
                <rect x={11} y={19} width={6} height={11} fill="#664422" />
                {/* Windows */}
                <rect x={5} y={15} width={5} height={5} fill="#88bbdd" stroke="#667788" strokeWidth={0.5} />
                <rect x={18} y={15} width={5} height={5} fill="#88bbdd" stroke="#667788" strokeWidth={0.5} />
              </g>
              {/* Incoming bills — tumbling */}
              <g transform="translate(160, 30) rotate(-15)">
                <rect x={-14} y={-11} width={28} height={22} fill="#5588aa" rx={3} stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
                <text x={0} y={2} textAnchor="middle" fontSize="7" fill="#fff" fontFamily={PIXEL_FONT}>$45</text>
              </g>
              <g transform="translate(210, 70) rotate(20)">
                <rect x={-19} y={-15} width={38} height={30} fill="#cc7733" rx={3} stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
                <text x={0} y={2} textAnchor="middle" fontSize="9" fill="#fff" fontFamily={PIXEL_FONT}>$150</text>
              </g>
              <g transform="translate(270, 50) rotate(-8)">
                <rect x={-25} y={-20} width={50} height={40} fill="#cc3333" rx={3} stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
                <text x={0} y={3} textAnchor="middle" fontSize="12" fill="#fff" fontFamily={PIXEL_FONT}>$400</text>
              </g>
              <g transform="translate(180, 130) rotate(12)">
                <rect x={-19} y={-15} width={38} height={30} fill="#dd7755" rx={3} stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
                <text x={0} y={2} textAnchor="middle" fontSize="8" fill="#fff" fontFamily={PIXEL_FONT}>$180</text>
              </g>
              {/* Paycheck drifting */}
              <g transform="translate(260, 145)">
                <rect x={-16} y={-10} width={32} height={20} rx={3} fill="#ddaa33" stroke="#aa8822" strokeWidth={1.5} />
                <text x={0} y={2} textAnchor="middle" fontSize="6" fill="#fff" fontFamily={PIXEL_FONT}>$200</text>
              </g>
              {/* Health bar at top */}
              <rect x={10} y={6} width={120} height={10} rx={2} fill="#1a1a2a" stroke="#333" strokeWidth={1} />
              <rect x={11} y={7} width={42} height={8} rx={1} fill="#dd3333" />
              <text x={70} y={14} textAnchor="middle" fontSize="5" fill="#fff" fontFamily={PIXEL_FONT}>$347</text>
            </svg>
          </div>

          <div style={{ width: "100%" }}>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#ddaa33", marginBottom: "6px", letterSpacing: "2px" }}>
              — SPACE DODGER —
            </div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: "14px", color: "#ff8866", textShadow: "2px 2px 0px #331a11", lineHeight: "1.4" }}>
              BILLS BILLS
            </div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: "14px", color: "#ffcc44", textShadow: "2px 2px 0px #332211", lineHeight: "1.4", marginBottom: "10px" }}>
              BILLS
            </div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#8888aa", lineHeight: "1.9" }}>
              DODGE RENT, GROCERIES, AND MEDICAL BILLS.{" "}
              <span style={{ color: "#ddaa33" }}>THE PAYCHECK CAN'T SAVE YOU.</span>
            </div>
            <div style={{
              marginTop: "12px", fontFamily: PIXEL_FONT, fontSize: "7px",
              color: hovered ? "#33ff66" : "#555566",
              transition: "color 0.2s",
              animation: hovered ? undefined : "blink 1.5s infinite",
            }}>
              {hovered ? "▶ PRESS START" : "PRESS START"}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <div
      className={`${bebasNeue.variable} ${barlow.variable} ${permanentMarker.variable}`}
      style={{
        "--orange": "#FF8A65", "--orange-bright": "#FF6D3F",
        "--magenta": "#E91E63", "--magenta-dark": "#C2185B",
        "--purple": "#4A148C", "--purple-deep": "#311B92",
        "--cream": "#FFF8F0", "--cream-dark": "#F5EDE4",
        "--charcoal": "#2D2D2D", "--slate": "#1F2933", "--white": "#FFFFFF",
        "--fd": `${bebasNeue.style.fontFamily}, 'Arial Black', sans-serif`,
        "--fb": `${barlow.style.fontFamily}, 'Segoe UI', sans-serif`,
        "--fa": `${permanentMarker.style.fontFamily}, cursive`,
        "--space-xs": "0.5rem", "--space-sm": "1rem", "--space-md": "2rem",
        "--space-lg": "4rem", "--space-xl": "6rem",
        fontFamily: `${barlow.style.fontFamily}, 'Segoe UI', sans-serif`, fontSize: "18px", lineHeight: 1.6,
        color: "var(--charcoal)", background: "var(--cream)",
        minHeight: "100vh", width: "100%",
      }}
    >
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        .home-page h1, .home-page h2, .home-page h3 {
          font-family: var(--fd); font-weight:400; line-height:1.1;
          margin:0 0 var(--space-sm); text-transform:uppercase; letter-spacing:0.02em;
        }
        .home-page h1 { font-size: clamp(3rem, 10vw, 7rem); }
        .home-page h2 { font-size: clamp(2rem, 6vw, 4rem); }
        .home-page p { margin: 0 0 var(--space-sm); }

        /* Site header — sticky, action bar tabs hang below */
        .home-site-header {
          position: sticky; top: 0; z-index: 1000;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.25));
        }
        .home-action-bar {
          position: absolute; top: 100%; right: 0; left: auto;
          display: flex; gap: 2px; z-index: auto;
        }
        .home-action-bar a {
          font-family: var(--fd); font-size: 1rem; text-transform: uppercase;
          letter-spacing: 0.06em; padding: 0.6rem 1.3rem; text-decoration: none;
          transition: background 150ms ease; white-space: nowrap;
        }
        .ab--donate {
          background: var(--orange); color: var(--charcoal);
          font-family: var(--fa) !important; font-size: 0.95rem !important;
          letter-spacing: 0.02em !important; text-transform: none !important;
        }
        .ab--donate:hover { background: var(--orange-bright); color: var(--charcoal); }
        .ab--volunteer { background: var(--magenta); color: var(--white); }
        .ab--volunteer:hover { background: var(--magenta-dark); color: var(--white); }
        .ab--touch { background: var(--white); color: var(--purple); }
        .ab--touch:hover { background: var(--cream); color: var(--purple-deep); }

        @media (max-width: 767px) {
          .home-action-bar { left: auto; width: auto; gap: 2px; }
          .home-action-bar a { flex: none; font-size: 0.75rem; padding: 0.5rem 0.75rem; }
          .ab--donate { font-size: 0.8rem !important; }
        }

        /* Nav bar */
        .home-nav {
          background: var(--slate); border-bottom: 3px solid var(--magenta);
        }
        .home-nav__inner {
          max-width: 1200px; margin: 0 auto; padding: 0 var(--space-md);
          display: flex; align-items: center; justify-content: space-between; height: 56px;
        }
        .home-nav__brand {
          display: flex; align-items: baseline; gap: 0.75rem;
          text-decoration: none; transform: rotate(-1deg); transition: transform 150ms ease; flex-shrink: 0;
        }
        .home-nav__brand:hover { transform: rotate(0deg); }
        .home-nav__name {
          font-family: var(--fd); font-size: 1.5rem; text-transform: uppercase;
          letter-spacing: 0.02em; color: var(--cream);
        }
        .home-nav__tagline { font-family: var(--fa); font-size: 0.9rem; color: var(--orange); }
        @media (max-width: 480px) { .home-nav__tagline { display: none; } }

        .home-nav__links { display: none; align-items: center; gap: 0.25rem; }
        @media (min-width: 768px) { .home-nav__links { display: flex; } }
        .home-nav__links a {
          font-family: var(--fd); font-size: 1.1rem; text-transform: uppercase;
          letter-spacing: 0.04em; color: var(--cream); text-decoration: none;
          padding: 0.5rem 0.75rem; position: relative; transition: color 150ms ease, transform 150ms ease;
        }
        .home-nav__links a:nth-child(odd) { transform: rotate(-0.8deg); }
        .home-nav__links a:nth-child(even) { transform: rotate(0.8deg); }
        .home-nav__links a:hover { color: var(--orange); transform: rotate(0deg) scale(1.05); }
        .home-nav__links a.nav--active { color: var(--orange); transform: rotate(0deg); }
        .home-nav__links a.nav--active::after {
          content: ''; position: absolute; bottom: 0; left: 0.75rem; right: 0.75rem;
          height: 3px; background: var(--orange); transform: rotate(-1.5deg);
        }
        .home-nav__links a.nav--who {
          font-family: var(--fa); text-transform: none; font-size: 1.15rem;
        }

        /* Hamburger */
        .home-hamburger {
          display: flex; flex-direction: column; justify-content: center; gap: 5px;
          width: 36px; height: 36px; background: none; border: none; cursor: pointer; padding: 4px;
        }
        @media (min-width: 768px) { .home-hamburger { display: none; } }
        .home-hamburger span { display: block; width: 100%; height: 3px; background: var(--cream); border-radius: 2px; }

        /* Mobile overlay */
        .home-mobile {
          position: fixed; inset: 0;
          background: linear-gradient(135deg, var(--purple-deep) 0%, var(--purple) 50%, var(--magenta-dark) 100%);
          z-index: 2000; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 1.25rem;
        }
        .home-mobile a {
          font-family: var(--fd); font-size: clamp(2rem, 8vw, 3rem);
          text-transform: uppercase; letter-spacing: 0.04em; color: var(--cream);
          text-decoration: none; transition: color 150ms ease;
        }
        .home-mobile a:hover { color: var(--orange); }
        .home-mobile a.mob--who { font-family: var(--fa); text-transform: none; }
        .home-mobile a.mob--active { color: var(--orange); }
        .home-mobile__close {
          position: absolute; top: 1.25rem; right: 1.25rem; background: none; border: none;
          color: var(--cream); font-size: 2.5rem; cursor: pointer; line-height: 1;
          width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
          transition: transform 150ms ease;
        }
        .home-mobile__close:hover { transform: rotate(90deg); }

        /* Page header */
        .home-page-header {
          background: linear-gradient(135deg, var(--purple-deep) 0%, var(--purple) 50%, var(--magenta-dark) 100%);
          color: var(--white); padding: var(--space-xl) var(--space-md) var(--space-lg);
          text-align: center; position: relative; overflow: hidden;
        }
        .home-page-header::before {
          content: ''; position: absolute; top: -50%; right: -20%; width: 80%; height: 150%;
          background: var(--orange); opacity: 0.08; transform: rotate(-15deg); pointer-events: none;
        }
        .home-page-header h1 {
          font-size: clamp(2.5rem, 8vw, 5rem); text-shadow: 4px 4px 0 rgba(0,0,0,0.2);
          position: relative; z-index: 1;
        }
        .home-page-header p {
          font-size: 1.4rem; opacity: 0.9; max-width: 600px; margin: 0 auto;
          position: relative; z-index: 1; line-height: 1.5;
        }

        /* Content section */
        .home-section { padding: var(--space-xl) 0; background: var(--cream); }
        @media (min-width: 768px) { .home-section { padding: var(--space-xl) 0; } }
        .home-container { max-width: 1200px; margin: 0 auto; padding: 0 var(--space-md); }
        .home-games-grid {
          display: grid; grid-template-columns: 1fr; gap: var(--space-md);
        }
        @media (min-width: 768px) {
          .home-games-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* Coming soon card */
        .home-coming-soon {
          background: var(--white); padding: var(--space-lg) var(--space-md);
          border-left: 6px solid var(--orange); box-shadow: 8px 8px 0 rgba(0,0,0,0.08);
          transition: transform 150ms ease, box-shadow 150ms ease;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .home-coming-soon:hover { transform: translateY(-4px); box-shadow: 12px 12px 0 rgba(0,0,0,0.1); }
        .home-coming-soon h3 { color: var(--purple); margin-bottom: var(--space-xs); }
        .home-coming-soon p { margin: 0; opacity: 0.7; }

        /* Page CTA */
        .home-page-cta {
          background: var(--cream-dark); padding: var(--space-xl) 0; text-align: center;
        }
        .home-page-cta h2 { color: var(--purple); margin-bottom: var(--space-sm); }
        .home-page-cta p { margin-bottom: var(--space-md); opacity: 0.9; }

        /* Involved */
        .home-involved {
          background: linear-gradient(135deg, var(--magenta-dark) 0%, var(--magenta) 100%);
          color: var(--white); padding: var(--space-xl) 0; text-align: center;
        }
        .home-involved h2 { margin-bottom: var(--space-sm); }
        .home-involved p { max-width: 600px; margin: 0 auto var(--space-md); opacity: 0.95; }

        /* Buttons */
        .home-cta-buttons { display: flex; flex-wrap: wrap; gap: var(--space-sm); justify-content: center; }
        .home-btn {
          display: inline-block; padding: 1rem 2rem; font-family: var(--fd);
          font-size: 1.25rem; text-transform: uppercase; letter-spacing: 0.05em;
          text-decoration: none; border: none; border-radius: 0; cursor: pointer; transition: all 150ms ease;
        }
        .home-btn--primary { background: var(--magenta); color: var(--white); transform: rotate(-1deg); }
        .home-btn--primary:hover { background: var(--magenta-dark); color: var(--white); transform: rotate(0deg) scale(1.02); }
        .home-btn--secondary { background: var(--orange); color: var(--charcoal); transform: rotate(1deg); }
        .home-btn--secondary:hover { background: var(--orange-bright); color: var(--charcoal); transform: rotate(0deg) scale(1.02); }
        .home-btn--outline { background: transparent; color: var(--white); border: 3px solid var(--white); }
        .home-btn--outline:hover { background: var(--white); color: var(--purple); }

        /* Footer */
        .home-footer { background: var(--slate); color: var(--cream); padding: var(--space-xl) 0 var(--space-lg); }
        .home-footer__content {
          display: grid; gap: var(--space-lg); margin-bottom: var(--space-lg);
          padding-bottom: var(--space-lg); border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        @media (min-width: 768px) { .home-footer__content { grid-template-columns: 1fr 1fr; } }
        .home-footer__tagline { font-family: var(--fa); font-size: 1.5rem; color: var(--orange); margin-bottom: var(--space-xs); }
        .home-footer__desc { opacity: 0.8; font-size: 0.95rem; margin: 0; }
        .home-footer__contact p { font-size: 0.875rem; opacity: 0.7; margin-bottom: var(--space-xs); }
        .home-footer__contact a { color: var(--orange); font-size: 1.1rem; font-weight: 600; text-decoration: none; }
        .home-footer__contact a:hover { color: var(--cream); }
        .home-footer__social { margin-top: var(--space-sm); display: flex; gap: 0.5rem; }
        @media (min-width: 768px) { .home-footer__social { justify-content: flex-end; } }
        .home-footer__social a {
          display: inline-flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; background: var(--orange);
          transition: transform 150ms ease, background 150ms ease;
        }
        .home-footer__social a:hover { background: var(--orange-bright); transform: scale(1.1); }
        .home-footer__social svg { width: 22px; height: 22px; fill: var(--charcoal); }
        .home-footer__bottom { text-align: center; }
        .home-footer__bottom p { font-size: 0.875rem; opacity: 0.5; margin: 0.25rem 0; }
        .home-footer__bottom p:last-child { font-size: 0.75rem; }
        @media (min-width: 768px) {
          .home-footer__main { text-align: left; }
          .home-footer__contact { text-align: right; }
        }
      `}</style>

      {/* ─── Site Header (sticky nav + action bar tabs) ─── */}
      <div className="home-site-header">
        <nav className="home-action-bar" aria-label="Quick actions">
          <a href="https://secure.actblue.com/donate/andybowline" className="ab--donate" target="_blank" rel="noopener">Donate</a>
          <a href={`${SITE}/volunteer.html`} className="ab--volunteer">Volunteer</a>
          <a href={`${SITE}/newsletter.html`} className="ab--touch">Get In Touch</a>
        </nav>
        <header className="home-nav">
          <div className="home-nav__inner">
            <a href={SITE} className="home-nav__brand">
              <span className="home-nav__name">Andy Bowline</span>
              <span className="home-nav__tagline">Can't Win. Yet.</span>
            </a>
            <nav className="home-nav__links" aria-label="Main navigation">
              <a href={`${SITE}/the-rigged-system.html`}>The System</a>
              <a href={`${SITE}/issues.html`}>Issues</a>
              <a href={`${SITE}/district31.html`}>District 31</a>
              <a href="/" className="nav--active">Games</a>
              <a href={`${SITE}/about.html`} className="nav--who">Meet Andy</a>
            </nav>
            <button className="home-hamburger" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
              <span /><span /><span />
            </button>
          </div>
        </header>
      </div>

      {/* ─── Mobile Menu ─── */}
      {menuOpen && (
        <div className="home-mobile" onClick={() => setMenuOpen(false)}>
          <button className="home-mobile__close" aria-label="Close menu">&times;</button>
          <a href={SITE}>Home</a>
          <a href={`${SITE}/the-rigged-system.html`}>The System</a>
          <a href={`${SITE}/issues.html`}>Issues</a>
          <a href={`${SITE}/district31.html`}>District 31</a>
          <a href="/" className="mob--active" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}>Games</a>
          <a href={`${SITE}/about.html`} className="mob--who">Meet Andy</a>
        </div>
      )}

      {/* ─── Page Header ─── */}
      <section className="home-page-header home-page">
        <h1>The Arcade</h1>
        <p>NC politics, but you can play it.<br />(You still can't win.)</p>
      </section>

      {/* ─── Games ─── */}
      <section className="home-section home-page">
        <div className="home-container">
          <div className="home-games-grid">
            <EarnYourSeatCard />
            <TeacherRunCard />
            <article className="home-coming-soon">
              <h3>More Games Coming</h3>
              <p>Democracy isn't a one-player game.</p>
            </article>
          </div>
        </div>
      </section>

      {/* ─── Get Involved ─── */}
      <section className="home-involved home-page">
        <div className="home-container" style={{ maxWidth: "800px" }}>
          <h2>So What Can You Do?</h2>
          <p>In a district this lopsided, every bit of effort punches above its weight.</p>
          <div className="home-cta-buttons">
            <a href="https://secure.actblue.com/donate/andybowline" className="home-btn home-btn--secondary" target="_blank" rel="noopener">Chip In $10</a>
            <a href={`${SITE}/volunteer.html`} className="home-btn home-btn--outline">Volunteer</a>
            <a href={`${SITE}/newsletter.html`} className="home-btn home-btn--outline">Stay Updated</a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="home-footer home-page">
        <div className="home-container">
          <div className="home-footer__content">
            <div className="home-footer__main">
              <p className="home-footer__tagline">Can't Win. Yet.</p>
              <p className="home-footer__desc">NC Senate District 31: Stokes County + parts of Forsyth County</p>
            </div>
            <div className="home-footer__contact">
              <p>Get in touch:</p>
              <a href="mailto:hello@andycantwin.com">hello@andycantwin.com</a>
              <div className="home-footer__social">
                <a href="https://www.facebook.com/andycantwin" target="_blank" rel="noopener" aria-label="Facebook">
                  <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.instagram.com/andycantwin/" target="_blank" rel="noopener" aria-label="Instagram">
                  <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="home-footer__bottom">
            <p>Paid for by Committee to Elect Andy Bowline</p>
            <p>&copy; 2026. Built with stubbornness and open-source tools.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
