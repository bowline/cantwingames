import { useState, useEffect, useRef, useCallback } from "react";

const PIXEL_FONT = `"Press Start 2P", monospace`;

// Issues that pop up during gameplay
const ISSUES = [
  { id: 1, icon: "📚", label: "TEACHERS LEAVING STATE", stat: "43rd in pay" },
  { id: 2, icon: "🏥", label: "MEDICAID SHORTFALL", stat: "$319M gap" },
  { id: 3, icon: "🏫", label: "RURAL CLINIC CLOSING", stat: "1 in 5 may shut" },
  { id: 4, icon: "💰", label: "PROPERTY TAX INCREASE", stat: "+12% this year" },
  { id: 5, icon: "⚡", label: "POWER BILL WENT UP", stat: "Duke made $4.9B" },
  { id: 6, icon: "🏭", label: "DATA CENTER APPROVED", stat: "Despite 100s opposing" },
  { id: 7, icon: "🎓", label: "VOUCHER $ TO PRIVATE", stat: "92% already enrolled" },
  { id: 8, icon: "🏗️", label: "ROADS CRUMBLING", stat: "$100M fix, 4yr wait" },
  { id: 9, icon: "👮", label: "4 DEPUTIES ON PATROL", stat: "Entire county" },
  { id: 10, icon: "💊", label: "DENTISTS REFUSING PATIENTS", stat: "Can't afford to stay" },
  { id: 11, icon: "🏠", label: "HOMEOWNERS SQUEEZED", stat: "State cut revenue" },
  { id: 12, icon: "📉", label: "CORP TAX → $0 BY 2030", stat: "$2B/yr lost" },
];

const RESPONSES = [
  "Noted.\nNo further action required.",
  "Thank you for your input. ✓",
  "Added to next session's\nagenda.",
  "Forwarded to the\nappropriate committee.",
  "Your concern has\nbeen received.",
  "A study has been\ncommissioned.",
  "This will be reviewed\nat a later date.",
  "Acknowledged.\nFile updated.",
];

// Pixel art desk scene as SVG
function DeskScene({ issuesIgnored, issuesResponded }) {
  return (
    <svg viewBox="0 0 320 200" style={{ width: "100%", imageRendering: "pixelated" }}>
      {/* Floor */}
      <rect x="0" y="140" width="320" height="60" fill="#5c4a3a" />
      <rect x="0" y="140" width="320" height="2" fill="#4a3a2a" />
      {/* Floor tiles */}
      {[...Array(8)].map((_, i) => (
        <rect key={`ft${i}`} x={i * 40} y="140" width="1" height="60" fill="#4a3a2a" opacity="0.2" />
      ))}
      
      {/* Wall */}
      <rect x="0" y="0" width="320" height="140" fill="#8b9bb4" />
      
      {/* Wall pattern - subtle */}
      {[...Array(8)].map((_, i) => (
        <rect key={`wp${i}`} x={i * 40} y="0" width="2" height="140" fill="#8290a8" opacity="0.3" />
      ))}
      
      {/* Window */}
      <rect x="20" y="20" width="60" height="50" fill="#2a2a3a" />
      <rect x="22" y="22" width="56" height="46" fill="#4a6a8a" />
      <rect x="22" y="22" width="27" height="22" fill="#5a7a9a" />
      <rect x="51" y="22" width="27" height="22" fill="#4a6a8a" />
      <rect x="22" y="46" width="27" height="22" fill="#4a6a8a" />
      <rect x="51" y="46" width="27" height="22" fill="#5a7a9a" />
      <rect x="49" y="22" width="2" height="46" fill="#2a2a3a" />
      <rect x="22" y="44" width="56" height="2" fill="#2a2a3a" />
      
      {/* Flag on wall */}
      <rect x="250" y="15" width="2" height="55" fill="#6a5a4a" />
      <rect x="252" y="15" width="30" height="20" fill="#cc3333" />
      <rect x="252" y="22" width="30" height="6" fill="#eeeeee" />
      <rect x="252" y="28" width="30" height="7" fill="#3355aa" />
      
      {/* Desk */}
      <rect x="40" y="110" width="240" height="8" fill="#8b6b4a" />
      <rect x="40" y="118" width="240" height="4" fill="#7a5a3a" />
      <rect x="44" y="122" width="8" height="24" fill="#7a5a3a" />
      <rect x="268" y="122" width="8" height="24" fill="#7a5a3a" />
      
      {/* Chair back */}
      <rect x="130" y="80" width="60" height="8" fill="#3a3a4a" />
      <rect x="134" y="72" width="52" height="10" fill="#4a4a5a" />
      
      {/* Senator body - suit jacket */}
      <rect x="142" y="92" width="36" height="24" fill="#2a3a5a" />
      {/* Suit lapels */}
      <rect x="142" y="92" width="8" height="18" fill="#222e48" />
      <rect x="170" y="92" width="8" height="18" fill="#222e48" />
      {/* Tie */}
      <rect x="158" y="92" width="4" height="16" fill="#aa2233" />
      {/* Shirt collar */}
      <rect x="154" y="90" width="12" height="4" fill="#dddddd" />
      
      {/* Senator head */}
      <rect x="150" y="76" width="20" height="16" fill="#d4a574" />
      {/* Hair */}
      <rect x="148" y="74" width="24" height="6" fill="#888899" />
      <rect x="148" y="74" width="4" height="10" fill="#888899" />
      <rect x="168" y="74" width="4" height="10" fill="#888899" />
      {/* Eyes - looking at phone / away from papers */}
      <rect x="154" y="82" width="3" height="3" fill="#2a2a3a" />
      <rect x="163" y="82" width="3" height="3" fill="#2a2a3a" />
      {/* Slight smirk */}
      <rect x="156" y="87" width="8" height="2" fill="#c49464" />
      
      {/* Senator arms on desk */}
      <rect x="120" y="106" width="24" height="6" fill="#2a3a5a" />
      <rect x="176" y="106" width="24" height="6" fill="#2a3a5a" />
      {/* Hands */}
      <rect x="118" y="106" width="6" height="5" fill="#d4a574" />
      <rect x="196" y="106" width="6" height="5" fill="#d4a574" />
      
      {/* Phone in hand */}
      <rect x="194" y="98" width="10" height="16" fill="#1a1a2a" rx="1" />
      <rect x="195" y="99" width="8" height="12" fill="#3355aa" />
      
      {/* Chair seat */}
      <rect x="138" y="116" width="44" height="6" fill="#4a4a5a" />
      <rect x="136" y="122" width="4" height="22" fill="#3a3a3a" />
      <rect x="180" y="122" width="4" height="22" fill="#3a3a3a" />
      
      {/* Nameplate on desk */}
      <rect x="60" y="106" width="50" height="8" fill="#c9a84c" />
      <text x="85" y="113" textAnchor="middle" fill="#3a2a1a" fontSize="5" fontFamily={PIXEL_FONT}>SENATOR</text>
      
      {/* Paper stack on desk - grows with ignored issues */}
      {[...Array(Math.min(issuesIgnored, 12))].map((_, i) => {
        const baseX = 220;
        const xJitter = ((i * 7 + 3) % 5) - 2;
        const rotation = ((i * 13 + 5) % 15) - 7;
        return (
          <g key={`paper${i}`}>
            <rect 
              x={baseX + xJitter} 
              y={104 - i * 2.5} 
              width="28" 
              height="14" 
              fill={i % 3 === 0 ? "#f0e8d8" : i % 3 === 1 ? "#e8e0d0" : "#f5edd5"} 
              stroke="#ccc0a8"
              strokeWidth="0.5"
              transform={`rotate(${rotation}, ${baseX + 14 + xJitter}, ${111 - i * 2.5})`}
            />
            {/* Little text lines on paper */}
            <rect 
              x={baseX + xJitter + 4} 
              y={104 - i * 2.5 + 4} 
              width="16" 
              height="1" 
              fill="#bbaa88" 
              opacity="0.5"
              transform={`rotate(${rotation}, ${baseX + 14 + xJitter}, ${111 - i * 2.5})`}
            />
            <rect 
              x={baseX + xJitter + 4} 
              y={104 - i * 2.5 + 7} 
              width="12" 
              height="1" 
              fill="#bbaa88" 
              opacity="0.5"
              transform={`rotate(${rotation}, ${baseX + 14 + xJitter}, ${111 - i * 2.5})`}
            />
          </g>
        );
      })}
      
      {/* Papers on floor if > 8 ignored */}
      {issuesIgnored > 8 && [...Array(Math.min(issuesIgnored - 8, 6))].map((_, i) => (
        <rect 
          key={`floor${i}`}
          x={240 + i * 8 + ((i * 11) % 5)} 
          y={148 + ((i * 7) % 8)} 
          width="18" 
          height="12" 
          fill={i % 2 === 0 ? "#e8e0d0" : "#f0e8d8"}
          opacity="0.7"
          transform={`rotate(${((i * 23) % 40) - 20}, ${249 + i * 8}, ${154})`}
        />
      ))}
      
      {/* Coffee mug */}
      <rect x="70" y="100" width="12" height="14" fill="#cc6644" rx="1" />
      <rect x="82" y="103" width="5" height="8" fill="none" stroke="#cc6644" strokeWidth="2" rx="2" />
      <rect x="72" y="102" width="8" height="2" fill="#4a2a1a" />
      
      {/* Monitor/Computer */}
      <rect x="90" y="86" width="24" height="20" fill="#2a2a3a" rx="1" />
      <rect x="92" y="88" width="20" height="16" fill="#1a3a2a" />
      <text x="102" y="98" textAnchor="middle" fill="#33cc66" fontSize="4" fontFamily={PIXEL_FONT}>R+25</text>
      <rect x="98" y="106" width="8" height="4" fill="#3a3a4a" />
      <rect x="94" y="110" width="16" height="2" fill="#3a3a4a" />
    </svg>
  );
}

// Pixel-style button component
function PixelButton({ children, onClick, variant = "default", disabled = false, style = {} }) {
  const colors = {
    ignore: { bg: "#aa2222", shadow: "#771111", text: "#ffcccc", hoverBg: "#cc3333" },
    respond: { bg: "#2255aa", shadow: "#113377", text: "#ccddff", hoverBg: "#3366bb" },
    default: { bg: "#4a8844", shadow: "#2a5522", text: "#ccffcc", hoverBg: "#5a9955" },
    cta: { bg: "#cc8833", shadow: "#995511", text: "#fff8e0", hoverBg: "#dd9944" },
  };
  const c = colors[variant];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: PIXEL_FONT,
        fontSize: "10px",
        padding: "8px 16px",
        background: c.bg,
        color: c.text,
        border: "none",
        borderBottom: `4px solid ${c.shadow}`,
        borderRight: `4px solid ${c.shadow}`,
        borderTop: `4px solid ${c.hoverBg}`,
        borderLeft: `4px solid ${c.hoverBg}`,
        cursor: disabled ? "default" : "pointer",
        imageRendering: "pixelated",
        opacity: disabled ? 0.5 : 1,
        transition: "transform 0.1s",
        ...style,
      }}
      onMouseDown={(e) => {
        if (!disabled) e.target.style.transform = "translateY(2px)";
      }}
      onMouseUp={(e) => {
        e.target.style.transform = "translateY(0)";
      }}
    >
      {children}
    </button>
  );
}

// Scanline overlay
function Scanlines() {
  return (
    <div style={{
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      pointerEvents: "none",
      zIndex: 100,
    }} />
  );
}

// Vote counter display
function VoteCounter({ votes, margin }) {
  return (
    <div style={{
      background: "#1a1a2a",
      border: "4px solid #3a3a5a",
      borderRadius: "2px",
      padding: "8px 12px",
      textAlign: "center",
      minWidth: "160px",
    }}>
      <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#6a8a6a", marginBottom: "4px" }}>
        VOTES SECURED
      </div>
      <div style={{ fontFamily: PIXEL_FONT, fontSize: "18px", color: "#33ff66", letterSpacing: "2px" }}>
        {votes.toLocaleString()}
      </div>
      <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#aa6633", marginTop: "4px" }}>
        MARGIN: R+{margin}
      </div>
    </div>
  );
}

// Issue card that pops up
function IssueCard({ issue, onIgnore, onRespond, ignoreScale, respondScale, entering }) {
  return (
    <div style={{
      background: "#2a2a3a",
      border: "4px solid #5a5a7a",
      borderBottom: "4px solid #3a3a5a",
      borderRight: "4px solid #3a3a5a",
      padding: "12px",
      maxWidth: "300px",
      width: "100%",
      animation: entering ? "slideIn 0.3s ease-out" : undefined,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
        <span style={{ fontSize: "20px" }}>{issue.icon}</span>
        <div>
          <div style={{ fontFamily: PIXEL_FONT, fontSize: "9px", color: "#ff8866", lineHeight: "1.4" }}>
            ⚠ {issue.label}
          </div>
          <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#8888aa", marginTop: "4px" }}>
            {issue.stat}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "8px" }}>
        <PixelButton 
          variant="respond" 
          onClick={onRespond}
          style={{ 
            fontSize: `${Math.max(6, 10 * respondScale)}px`,
            padding: `${Math.max(4, 8 * respondScale)}px ${Math.max(8, 16 * respondScale)}px`,
          }}
        >
          RESPOND
        </PixelButton>
        <PixelButton 
          variant="ignore" 
          onClick={onIgnore}
          style={{ 
            fontSize: `${Math.min(14, 10 * ignoreScale)}px`,
            padding: `${Math.min(14, 8 * ignoreScale)}px ${Math.min(24, 16 * ignoreScale)}px`,
          }}
        >
          IGNORE
        </PixelButton>
      </div>
    </div>
  );
}

// Response message overlay
function ResponseMessage({ text, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);
  
  return (
    <div style={{
      background: "#1a1a2a",
      border: "4px solid #5a5a7a",
      padding: "16px",
      maxWidth: "280px",
      width: "100%",
      textAlign: "center",
      animation: "fadeIn 0.3s ease-out",
    }}>
      <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#44aa44", marginBottom: "8px" }}>
        ✓ ACKNOWLEDGED
      </div>
      <div style={{ fontFamily: PIXEL_FONT, fontSize: "8px", color: "#8888aa", lineHeight: "1.6", whiteSpace: "pre-line" }}>
        {text}
      </div>
      <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#555566", marginTop: "12px" }}>
        NOTHING CHANGED ·  VOTES UNAFFECTED
      </div>
    </div>
  );
}

// Title screen
function TitleScreen({ onStart }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      gap: "24px",
      padding: "20px",
      animation: "fadeIn 0.5s ease-out",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: PIXEL_FONT, fontSize: "10px", color: "#6a8a6a", marginBottom: "8px", letterSpacing: "3px" }}>
          — DISTRICT 31 PRESENTS —
        </div>
        <h1 style={{ 
          fontFamily: PIXEL_FONT, 
          fontSize: "22px", 
          color: "#ff8866",
          margin: "0 0 4px 0",
          lineHeight: "1.4",
          textShadow: "3px 3px 0px #331a11",
        }}>
          EARN YOUR
        </h1>
        <h1 style={{ 
          fontFamily: PIXEL_FONT, 
          fontSize: "22px", 
          color: "#ffaa44",
          margin: "0",
          lineHeight: "1.4",
          textShadow: "3px 3px 0px #332211",
        }}>
          SEAT
        </h1>
      </div>
      
      <div style={{ width: "200px" }}>
        <DeskScene issuesIgnored={3} issuesResponded={0} />
      </div>
      
      <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#8888aa", textAlign: "center", lineHeight: "1.8" }}>
        YOU ARE A STATE SENATOR<br/>
        IN A GERRYMANDERED DISTRICT.<br/>
        <span style={{ color: "#aa6633" }}>TRY TO REPRESENT YOUR VOTERS.</span>
      </div>
      
      <PixelButton variant="default" onClick={onStart} style={{ fontSize: "12px", padding: "12px 32px" }}>
        ▶ START
      </PixelButton>
      
      <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#555566", animation: "blink 1.5s infinite" }}>
        PRESS START
      </div>
    </div>
  );
}

// End screen
function EndScreen({ stats, onRestart, onShare }) {
  const [showStats, setShowStats] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  
  useEffect(() => {
    const t1 = setTimeout(() => setShowStats(true), 800);
    const t2 = setTimeout(() => setShowMessage(true), 2000);
    const t3 = setTimeout(() => setShowCTA(true), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      gap: "16px",
      padding: "20px",
      textAlign: "center",
    }}>
      {/* Confetti pixels */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100px", overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(30)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: `${4 + Math.random() * 6}px`,
            height: `${4 + Math.random() * 6}px`,
            background: ["#ff4444", "#4444ff", "#ffaa33", "#33ff66", "#ff66aa", "#66aaff"][i % 6],
            left: `${Math.random() * 100}%`,
            animation: `confettiFall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
            opacity: 0.8,
          }} />
        ))}
      </div>
      
      <div style={{ animation: "fadeIn 0.5s ease-out" }}>
        <div style={{ fontFamily: PIXEL_FONT, fontSize: "8px", color: "#33ff66", marginBottom: "8px", letterSpacing: "2px" }}>
          ★ ★ ★ WINNER ★ ★ ★
        </div>
        <div style={{ fontFamily: PIXEL_FONT, fontSize: "16px", color: "#ffaa44", textShadow: "2px 2px 0px #332211" }}>
          CONGRATULATIONS!
        </div>
        <div style={{ fontFamily: PIXEL_FONT, fontSize: "9px", color: "#ff8866", marginTop: "8px" }}>
          YOU WON RE-ELECTION
        </div>
      </div>
      
      {showStats && (
        <div style={{
          background: "#1a1a2a",
          border: "4px solid #3a3a5a",
          padding: "12px 20px",
          animation: "fadeIn 0.5s ease-out",
        }}>
          <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#6a8a6a", marginBottom: "8px" }}>
            SESSION STATS
          </div>
          <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
            <div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "16px", color: "#ff4444" }}>{stats.ignored}</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#aa6666" }}>IGNORED</div>
            </div>
            <div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "16px", color: "#4488ff" }}>{stats.responded}</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#6688aa" }}>TRIED</div>
            </div>
            <div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "16px", color: "#33ff66" }}>0</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "6px", color: "#66aa66" }}>SOLVED</div>
            </div>
          </div>
        </div>
      )}
      
      {showMessage && (
        <div style={{ animation: "fadeIn 1s ease-out", maxWidth: "300px" }}>
          <div style={{ fontFamily: PIXEL_FONT, fontSize: "8px", color: "#ccccdd", lineHeight: "1.8", marginBottom: "8px" }}>
            YOU DIDN'T HAVE TO DO ANYTHING.
          </div>
          <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#8888aa", lineHeight: "1.8" }}>
            THIS IS WHAT HAPPENS WHEN<br/>
            MAPS ARE DRAWN SO POLITICIANS<br/>
            DON'T HAVE TO EARN YOUR VOTE.
          </div>
        </div>
      )}
      
      {showCTA && (
        <div style={{ animation: "fadeIn 1s ease-out", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <a 
            href="https://andycantwin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: "none", cursor: "pointer" }}
          >
            <div style={{
              background: "#1a2a1a",
              border: "3px solid #3a5a3a",
              padding: "12px 16px",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#5a8a5a"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#3a5a3a"}
            >
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "9px", color: "#ffaa44", marginBottom: "6px" }}>
                ANDY BOWLINE
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#88aa88", marginBottom: "4px" }}>
                NC SENATE · DISTRICT 31
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "8px", color: "#ff8866" }}>
                CAN'T WIN. YET.
              </div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "7px", color: "#66aaff", marginTop: "6px" }}>
                ANDYCANTWIN.COM
              </div>
            </div>
          </a>
          
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            <PixelButton variant="cta" onClick={onShare}>
              SHARE
            </PixelButton>
            <PixelButton variant="respond" onClick={onRestart}>
              PLAY AGAIN
            </PixelButton>
          </div>
          <a 
            href="https://secure.actblue.com/donate/andybowline" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: "none", width: "100%", maxWidth: "280px" }}
          >
            <PixelButton variant="default" onClick={() => {}} style={{ width: "100%", fontSize: "9px", padding: "10px 16px" }}>
              CHIP IN $10 TO FIX THIS
            </PixelButton>
          </a>
        </div>
      )}
    </div>
  );
}

// Main game component
export default function EarnYourSeat() {
  const [gameState, setGameState] = useState("title"); // title, playing, response, ended
  const [votes, setVotes] = useState(0);
  const [currentIssueIndex, setCurrentIssueIndex] = useState(0);
  const [issuesIgnored, setIssuesIgnored] = useState(0);
  const [issuesResponded, setIssuesResponded] = useState(0);
  const [responseText, setResponseText] = useState("");
  const [issueCount, setIssueCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [ignoreScale, setIgnoreScale] = useState(1);
  const [respondScale, setRespondScale] = useState(1);
  const [entering, setEntering] = useState(false);
  const [margin] = useState(25);
  const shuffledIssues = useRef([]);
  
  // Shuffle issues on game start
  const startGame = useCallback(() => {
    const shuffled = [...ISSUES].sort(() => Math.random() - 0.5);
    shuffledIssues.current = shuffled;
    setGameState("playing");
    setVotes(0);
    setCurrentIssueIndex(0);
    setIssuesIgnored(0);
    setIssuesResponded(0);
    setIssueCount(0);
    setTimeLeft(30);
    setIgnoreScale(1);
    setRespondScale(1);
    setEntering(true);
  }, []);
  
  // Vote counter always goes up
  useEffect(() => {
    if (gameState !== "playing" && gameState !== "response") return;
    const interval = setInterval(() => {
      setVotes(v => v + Math.floor(Math.random() * 400) + 300);
    }, 300);
    return () => clearInterval(interval);
  }, [gameState]);
  
  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing" && gameState !== "response") return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameState("ended");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);
  
  const nextIssue = useCallback(() => {
    setEntering(true);
    setCurrentIssueIndex(i => (i + 1) % shuffledIssues.current.length);
    setIssueCount(c => c + 1);
    setTimeout(() => setEntering(false), 300);
  }, []);
  
  const handleIgnore = useCallback(() => {
    setIssuesIgnored(i => i + 1);
    setIgnoreScale(1);
    setRespondScale(1);
    nextIssue();
  }, [nextIssue]);
  
  const handleRespond = useCallback(() => {
    setIssuesResponded(r => r + 1);
    setResponseText(RESPONSES[Math.floor(Math.random() * RESPONSES.length)]);
    setGameState("response");
  }, []);
  
  const handleResponseDone = useCallback(() => {
    setGameState("playing");
    nextIssue();
  }, [nextIssue]);
  
  const handleShare = useCallback(() => {
    const text = `I tried to make my state senator do something for 30 seconds. Nothing worked. They still won.\n\nPlay "Earn Your Seat" and see what gerrymandering feels like.\n\nandycantwin.com`;
    if (navigator.share) {
      navigator.share({ title: "Earn Your Seat", text, url: "https://andycantwin.com" });
    } else {
      navigator.clipboard?.writeText(text);
    }
  }, []);
  
  const currentIssue = shuffledIssues.current[currentIssueIndex] || ISSUES[0];
  
  return (
    <div style={{
      width: "100%",
      maxWidth: "420px",
      margin: "0 auto",
      height: "100vh",
      maxHeight: "750px",
      background: "#0a0a1a",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 0 40px rgba(0,0,0,0.8)",
    }}>
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120px) rotate(360deg); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
      
      <Scanlines />
      
      {/* CRT border effect */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: "4px",
        boxShadow: "inset 0 0 60px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.3)",
        pointerEvents: "none",
        zIndex: 101,
      }} />
      
      {gameState === "title" && <TitleScreen onStart={startGame} />}
      
      {(gameState === "playing" || gameState === "response") && (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "12px" }}>
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{
              fontFamily: PIXEL_FONT,
              fontSize: "7px",
              color: "#aa6633",
            }}>
              <span style={{ color: "#ff4444", animation: "pulse 1s infinite" }}>●</span> TERM IN SESSION
            </div>
            <div style={{
              fontFamily: PIXEL_FONT,
              fontSize: "9px",
              color: timeLeft <= 10 ? "#ff4444" : "#6a8a6a",
              animation: timeLeft <= 10 ? "blink 0.5s infinite" : undefined,
            }}>
              {timeLeft}s
            </div>
          </div>
          
          {/* Desk scene */}
          <div style={{ width: "100%", marginBottom: "8px" }}>
            <DeskScene issuesIgnored={issuesIgnored} issuesResponded={issuesResponded} />
          </div>
          
          {/* Vote counter */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
            <VoteCounter votes={votes} margin={margin} />
          </div>
          
          {/* Issue or response */}
          <div style={{ display: "flex", justifyContent: "center", flex: 1, alignItems: "flex-start" }}>
            {gameState === "playing" && (
              <IssueCard
                issue={currentIssue}
                onIgnore={handleIgnore}
                onRespond={handleRespond}
                ignoreScale={ignoreScale}
                respondScale={respondScale}
                entering={entering}
              />
            )}
            {gameState === "response" && (
              <ResponseMessage text={responseText} onDone={handleResponseDone} />
            )}
          </div>
          
          {/* Bottom stats */}
          <div style={{
            display: "flex",
            justifyContent: "space-around",
            padding: "8px 0",
            borderTop: "2px solid #2a2a3a",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "12px", color: "#ff4444" }}>{issuesIgnored}</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "5px", color: "#aa6666" }}>IGNORED</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "12px", color: "#4488ff" }}>{issuesResponded}</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "5px", color: "#6688aa" }}>TRIED</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "12px", color: "#33ff66" }}>0</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: "5px", color: "#66aa66" }}>SOLVED</div>
            </div>
          </div>
        </div>
      )}
      
      {gameState === "ended" && (
        <EndScreen
          stats={{ ignored: issuesIgnored, responded: issuesResponded }}
          onRestart={startGame}
          onShare={handleShare}
        />
      )}
    </div>
  );
}
