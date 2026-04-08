"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const PIXEL_FONT = `var(--font-pixel), "Press Start 2P", monospace`;
const W = 360;
const H = 740;
const GREEN = "#33ff66";
const DIM_GREEN = "#1a8833";
const DARK = "#0a0a1a";
const PANEL_BG = "#0d1a0d";
const BORDER = "#1a3a1a";
const FAINT = "#0a2a0a";

// ─── PROFILES ────────────────────────────────────────────
const PROFILES = [
  {
    id: "teacher",
    name: "THE TEACHER",
    insurance: "State employee plan, high deductible",
    insuranceShort: "STATE PLAN",
    cash: 800,
    health: 100,
    difficulty: "MEDIUM",
    familyMember: "your daughter",
    familyLabel: "DAUGHTER",
    color: "#44aaff",
  },
  {
    id: "gig",
    name: "THE GIG WORKER",
    insurance: "Uninsured",
    insuranceShort: "UNINSURED",
    cash: 400,
    health: 100,
    difficulty: "HARD",
    familyMember: "yourself",
    familyLabel: "SELF",
    color: "#ff8844",
  },
  {
    id: "parent",
    name: "THE SINGLE PARENT",
    insurance: "Marketplace bronze plan",
    insuranceShort: "BRONZE PLAN",
    cash: 600,
    health: 100,
    difficulty: "MEDIUM-HARD",
    familyMember: "your son",
    familyLabel: "SON",
    color: "#dd66aa",
  },
  {
    id: "retiree",
    name: "THE RETIREE",
    insurance: "Medicare with gaps",
    insuranceShort: "MEDICARE",
    cash: 500,
    health: 80,
    difficulty: "MEDIUM",
    familyMember: "your spouse",
    familyLabel: "SPOUSE",
    color: "#aabb44",
  },
];

// ─── STOPS ───────────────────────────────────────────────
function getStops(profile) {
  const fm = profile.familyMember;
  const FM = fm.toUpperCase();

  return [
    // Stop 1: Something Feels Wrong
    {
      title: "STOP 1: SOMETHING FEELS WRONG",
      text: [
        `${FM} has been feeling off`,
        `for weeks. Fatigue. Pain`,
        `that won't go away.`,
        ``,
        `What do you do?`,
      ],
      choices: [
        { label: "GO TO DOCTOR", desc: "$50 · 3 days", money: -50, health: 0, days: 3, billItem: { name: "PRIMARY CARE VISIT", cost: 50 }, narrative: `You make an appointment. The next opening is in 3 days.` },
        { label: "WAIT AND SEE", desc: "Free · risky", money: 0, health: -15, days: 0, billItem: null, narrative: `You wait. The symptoms get worse. You lose two weeks before giving in and going anyway.` },
        { label: "GOOGLE IT", desc: "Free · 1 day", money: 0, health: -5, days: 1, billItem: null, narrative: `WebMD says it's either nothing or everything. You spend a day worrying, then call the doctor.` },
      ],
    },
    // Stop 2: The Doctor's Office
    {
      title: "STOP 2: THE DOCTOR'S OFFICE",
      text: [
        `The doctor says ${fm}`,
        `needs to see a specialist.`,
        ``,
        ...(profile.id === "teacher" ? [
          `Your state plan approves the`,
          `referral. You may proceed.`,
        ] : profile.id === "gig" ? [
          `"That'll be $220 for today."`,
          `No referral network. You're`,
          `on your own finding one.`,
        ] : profile.id === "parent" ? [
          `Prior authorization required.`,
          `Your insurer will review it.`,
          `Expect 5 business days.`,
        ] : [
          `Referral approved. But the`,
          `specialist doesn't accept`,
          `Medicare. You need another.`,
        ]),
      ],
      choices: profile.id === "teacher" ? [
        { label: "PROCEED", desc: "Approved", money: 0, health: 0, days: 1, billItem: null, narrative: `The referral goes through. One small victory.` },
      ] : profile.id === "gig" ? [
        { label: "PAY THE BILL", desc: "$220", money: -220, health: 0, days: 0, billItem: { name: "DOCTOR VISIT (UNINSURED)", cost: 220 }, narrative: `You pay cash. No receipt breakdown. No negotiation.` },
        { label: "ASK FOR DISCOUNT", desc: "Try it", money: -180, health: 0, days: 0, billItem: { name: "DOCTOR VISIT (CASH DISC.)", cost: 180 }, narrative: `They knock off $40. That's the best they can do.` },
      ] : profile.id === "parent" ? [
        { label: "WAIT FOR AUTH", desc: "5+ days", money: 0, health: -10, days: 5, billItem: null, narrative: `Five days. Then seven. On day nine, it's approved. ${FM} lost weight waiting.` },
        { label: "CALL INSURER", desc: "Burn a day", money: 0, health: -5, days: 3, billItem: null, narrative: `You spend 2 hours on hold. They expedite it. Only 3 days.` },
      ] : [
        { label: "FIND ANOTHER", desc: "3 days", money: 0, health: -5, days: 3, billItem: null, narrative: `You call 4 specialists. The third one takes Medicare. Appointment in 3 days.` },
        { label: "PAY OUT OF POCKET", desc: "$150", money: -150, health: 0, days: 1, billItem: { name: "SPECIALIST (OUT OF NETWORK)", cost: 150 }, narrative: `You pay cash to see the original specialist tomorrow.` },
      ],
    },
    // Stop 3: Finding a Specialist
    {
      title: "STOP 3: FINDING A SPECIALIST",
      text: [
        `The nearest specialist is`,
        `90 miles away.`,
        ``,
        `In 2024, 21 NC counties had`,
        `zero OB-GYNs. 25 had zero`,
        `psychiatrists.`,
      ],
      choices: [
        { label: "DRIVE 90 MILES", desc: "$40 gas · 1 day", money: -40, health: -5, days: 1, billItem: { name: "TRAVEL TO SPECIALIST", cost: 40 }, narrative: `3 hours round trip. ${FM} sleeps in the car. You miss a day of work.` },
        { label: "WAIT FOR LOCAL", desc: "6-week wait", money: 0, health: -30, days: 42, billItem: null, narrative: `Six weeks. ${FM} gets worse. By the time you're seen, the condition has progressed.` },
        { label: "GO TO THE ER", desc: "Cost TBD", money: 0, health: -5, days: 0, billItem: { name: "ER VISIT", cost: 0, deferred: true }, narrative: `The ER can't turn you away. They also can't tell you what it'll cost. The bill comes later.` },
      ],
    },
    // Stop 4: The Waiting Room
    {
      title: "STOP 4: THE WAITING ROOM",
      text: [
        `You sit in the waiting room`,
        `for 2 hours and 14 minutes.`,
        ``,
        `The specialist orders tests.`,
        `Blood work. Imaging. "Just`,
        `to be safe."`,
      ],
      choices: [
        { label: "GET THE TESTS", desc: "$200-$600", money: -(profile.id === "gig" ? 580 : profile.id === "parent" ? 340 : profile.id === "retiree" ? 280 : 220), health: 0, days: 5, billItem: null, billItemDynamic: true, narrative: `You get the tests. Results in 5 business days. Nobody calls on day 5. You call on day 7.` },
        { label: "ASK THE COST", desc: "Good luck", money: 0, health: 0, days: 1, billItem: null, narrative: `"It depends on your plan." You ask again. "We can't give you an exact number until it's processed." You get the tests anyway.`, forceTests: true, forceMoney: -(profile.id === "gig" ? 580 : profile.id === "parent" ? 340 : profile.id === "retiree" ? 280 : 220) },
        { label: "SKIP THE TESTS", desc: "Save money", money: 0, health: -20, days: 0, billItem: null, narrative: `You skip the tests. The specialist treats based on symptoms alone. They're guessing.` },
      ],
    },
    // Stop 5: The Diagnosis
    {
      title: "STOP 5: THE DIAGNOSIS",
      text: [
        `The diagnosis comes in.`,
        `Treatable. But only with`,
        `medication.`,
        ``,
        ...(profile.id === "gig" ? [
          `Without insurance, the`,
          `prescription is $400.`,
        ] : profile.id === "parent" ? [
          `Your plan requires "step`,
          `therapy" — try the cheap`,
          `drug first, even though the`,
          `doctor says it won't work.`,
        ] : profile.id === "retiree" ? [
          `Medicare Part D covers it.`,
          `But you're in the donut`,
          `hole. You pay full price.`,
        ] : [
          `Your plan covers generics.`,
          `The prescribed drug isn't`,
          `available as generic yet.`,
        ]),
      ],
      choices: [
        { label: "FILL PRESCRIPTION", desc: profile.id === "gig" ? "$400" : profile.id === "parent" ? "$80 (wrong drug)" : profile.id === "retiree" ? "$320" : "$180", money: profile.id === "gig" ? -400 : profile.id === "parent" ? -80 : profile.id === "retiree" ? -320 : -180, health: profile.id === "parent" ? 5 : 10, days: 0, billItem: null, billItemDynamic: true, narrative: profile.id === "parent" ? `You fill it. The doctor was right. It barely helps. You'll be back in 3 weeks for the drug they actually need.` : `You fill it. ${FM} starts improving within a week.` },
        { label: "ASK FOR GENERIC", desc: "$25-$80", money: profile.id === "gig" ? -60 : -25, health: 10, days: profile.id === "parent" ? 14 : 0, billItem: null, billItemDynamic: true, narrative: profile.id === "parent" ? `The insurer requires you to fail the cheap drug first. 14 more days.` : `The pharmacist finds a generic alternative. It works, mostly.` },
        { label: "CAN'T AFFORD IT", desc: "No treatment", money: 0, health: -25, days: 0, billItem: null, narrative: `You leave the pharmacy empty-handed. ${FM} will manage with rest and hope.` },
      ],
    },
    // Stop 6: The Bill
    {
      title: "STOP 6: THE BILL",
      isBillStop: true,
      text: [
        `An envelope arrives.`,
        ``,
        `"THIS IS NOT A BILL."`,
        ``,
        `Then another envelope.`,
        ``,
        `"THIS IS YOUR BILL."`,
      ],
      choices: [
        { label: "PAY IN FULL", desc: "If you can", money: 0, health: 0, days: 0, billItem: null, payBill: true, narrative: `You pay it. Your savings account reads $0.00. The provider sends a satisfaction survey.` },
        { label: "PAYMENT PLAN", desc: "$50/month", money: -50, health: 0, days: 0, billItem: { name: "PAYMENT PLAN FEE", cost: 50 }, payPlan: true, narrative: `$50 a month for the next 18 months. One missed payment resets the whole thing.` },
        { label: "DISPUTE THE BILL", desc: "30 days · 50/50", money: 0, health: -15, days: 30, billItem: null, dispute: true, narrative: `You write letters. You call. You wait. 30 days of stress.` },
      ],
    },
    // Stop 7: The Other Side
    {
      title: "STOP 7: THE OTHER SIDE",
      isFinal: true,
      text: [], // filled dynamically
      choices: [], // no choices — auto-advance to end screen
    },
  ];
}

// ─── END STATS ───────────────────────────────────────────
const END_STATS = [
  "100M+ Americans carry medical debt. It's the #1 cause of bankruptcy.",
  "In NC, 1 in 4 adults skipped care in 2023 because of cost.",
  "The average American spends $13,493/year on healthcare. Outcomes rank 30th globally.",
  "Rural NC residents drive 60+ miles for specialty care. Some just don't go.",
  "66.5% of all U.S. bankruptcies are tied to medical costs.",
  "NC has not expanded Medicaid to cover the gap. 600,000 fall in the coverage hole.",
  "Americans pay 2-3x more for prescriptions than any other wealthy country.",
  "In 2023, 27.6 million Americans had no health insurance at all.",
];

// ─── SCANLINES ───────────────────────────────────────────
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

// ─── TYPEWRITER TEXT ─────────────────────────────────────
function useTypewriter(lines, speed = 30) {
  const [displayed, setDisplayed] = useState([]);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!lines || lines.length === 0) {
      setDisplayed([]);
      setDone(true);
      return;
    }

    const fullText = lines.join("\n");
    let charIndex = 0;
    setDisplayed([]);
    setDone(false);

    intervalRef.current = setInterval(() => {
      charIndex++;
      const soFar = fullText.slice(0, charIndex);
      setDisplayed(soFar.split("\n"));
      if (charIndex >= fullText.length) {
        clearInterval(intervalRef.current);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [lines, speed]);

  const skip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (lines) setDisplayed(lines);
    setDone(true);
  }, [lines]);

  return { displayed, done, skip };
}

// ─── SVG WRAPPED TEXT ────────────────────────────────────
function TerminalText({ lines, x, y, fontSize = 6, fill = GREEN, lineHeight = 14 }) {
  return (
    <g>
      {lines.map((line, i) => (
        <text
          key={i}
          x={x}
          y={y + i * lineHeight}
          fontSize={fontSize}
          fill={fill}
          fontFamily={PIXEL_FONT}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

// ─── TITLE SCREEN ────────────────────────────────────────
function TitleScreen({ onStart }) {
  const [blink, setBlink] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 600);
    const c = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => { clearInterval(t); clearInterval(c); };
  }, []);

  const shareTitle = () => {
    const text = `The Care Trail — navigate the American healthcare system without going bankrupt.\n\nPlay it:\nhttps://games.andycantwin.com/caretrail`;
    const url = "https://games.andycantwin.com/caretrail";
    if (navigator.share) {
      navigator.share({ title: "The Care Trail", text, url }).catch(() => {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => alert("Link copied!")).catch(() => prompt("Copy this link:", url));
    } else {
      prompt("Copy this link:", url);
    }
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <rect width={W} height={H} fill={DARK} />

      {/* Terminal glow lines in background */}
      {[...Array(20)].map((_, i) => (
        <rect key={i} x={0} y={i * 37} width={W} height={1} fill={GREEN} opacity={0.03} />
      ))}

      {/* Terminal header */}
      <text x={20} y={80} fontSize="4.5" fill={DIM_GREEN} fontFamily={PIXEL_FONT}>
        {'>'} LOADING HEALTHCARE.SYS...
      </text>
      <text x={20} y={95} fontSize="4.5" fill={DIM_GREEN} fontFamily={PIXEL_FONT}>
        {'>'} COVERAGE: NOT FOUND
      </text>
      <text x={20} y={110} fontSize="4.5" fill={DIM_GREEN} fontFamily={PIXEL_FONT}>
        {'>'} DEDUCTIBLE: $8,000
      </text>
      <text x={20} y={125} fontSize="4.5" fill="#ff4444" fontFamily={PIXEL_FONT}>
        {'>'} ERROR: SYSTEM NOT DESIGNED FOR YOU
      </text>

      {/* Title */}
      <text x={W / 2} y={185} textAnchor="middle" fontSize="16" fill={GREEN} fontFamily={PIXEL_FONT}
        stroke="#0a2a0a" strokeWidth="3" paintOrder="stroke">
        THE CARE
      </text>
      <text x={W / 2} y={215} textAnchor="middle" fontSize="16" fill={GREEN} fontFamily={PIXEL_FONT}
        stroke="#0a2a0a" strokeWidth="3" paintOrder="stroke">
        TRAIL
      </text>

      {/* Subtitle */}
      <text x={W / 2} y={250} textAnchor="middle" fontSize="5" fill="#88cc88" fontFamily={PIXEL_FONT}>
        NAVIGATE THE AMERICAN
      </text>
      <text x={W / 2} y={264} textAnchor="middle" fontSize="5" fill="#88cc88" fontFamily={PIXEL_FONT}>
        HEALTHCARE SYSTEM.
      </text>
      <text x={W / 2} y={282} textAnchor="middle" fontSize="5.5" fill="#ff6666" fontFamily={PIXEL_FONT}>
        TRY NOT TO GO BANKRUPT.
      </text>

      {/* Blinking cursor */}
      <rect x={W / 2 + 80} y={270} width={8} height={2} fill={GREEN} opacity={cursorVisible ? 0.7 : 0} />

      {/* Start + Share buttons */}
      <g cursor="pointer" onClick={onStart}>
        <rect x={60} y={310} width={140} height={32} rx={3}
          fill={blink ? "#1a4a1a" : "#0d3a0d"} stroke={GREEN} strokeWidth={1} />
        <text x={130} y={331} textAnchor="middle" fontSize="11" fill={GREEN} fontFamily={PIXEL_FONT}>
          {'>'} START
        </text>
      </g>

      <g cursor="pointer" onClick={shareTitle}>
        <rect x={210} y={310} width={80} height={32} rx={3}
          fill="#dd6644" stroke="#ee7755" strokeWidth={1} />
        <text x={250} y={331} textAnchor="middle" fontSize="9" fill="#fff" fontFamily={PIXEL_FONT}>
          SHARE
        </text>
      </g>

      {/* Preview stats */}
      <rect x={20} y={370} width={W - 40} height={100} fill={PANEL_BG} rx={4} stroke={BORDER} strokeWidth={1} />
      <text x={W / 2} y={390} textAnchor="middle" fontSize="5" fill="#88cc88" fontFamily={PIXEL_FONT}>
        CHOOSE YOUR PATIENT:
      </text>
      {PROFILES.map((p, i) => (
        <g key={p.id}>
          <rect x={30} y={400 + i * 16} width={6} height={6} fill={p.color} rx={1} />
          <text x={42} y={406 + i * 16} fontSize="4.5" fill={p.color} fontFamily={PIXEL_FONT}>
            {p.name}
          </text>
          <text x={W - 30} y={406 + i * 16} textAnchor="end" fontSize="4" fill="#556655" fontFamily={PIXEL_FONT}>
            {p.difficulty}
          </text>
        </g>
      ))}

      {/* Sources */}
      <text x={W / 2} y={500} textAnchor="middle" fontSize="3.5" fill="#334433" fontFamily={PIXEL_FONT}>
        KFF · CENSUS BUREAU · NC DHHS · COMMONWEALTH FUND
      </text>
      <text x={W / 2} y={512} textAnchor="middle" fontSize="3.5" fill="#334433" fontFamily={PIXEL_FONT}>
        COSTS BASED ON ACTUAL NC HEALTHCARE DATA
      </text>

      {/* Donate button */}
      <a href="https://secure.actblue.com/donate/andybowline" target="_blank" rel="noopener noreferrer">
        <g cursor="pointer">
          <rect x={W / 2 - 135} y={535} width={270} height={38} rx={3}
            fill="#1a3a1a" stroke="#3a6a3a" strokeWidth={1.5} />
          <text x={W / 2} y={550} textAnchor="middle" fontSize="5" fill="#88dd88" fontFamily={PIXEL_FONT}>
            CHIP IN $5? YOUR COPAY WAS HIGHER.
          </text>
          <text x={W / 2} y={565} textAnchor="middle" fontSize="7" fill="#44ff44" fontFamily={PIXEL_FONT}>
            DONATE →
          </text>
        </g>
      </a>

      {/* Campaign link */}
      <a href="https://andycantwin.com" target="_blank" rel="noopener noreferrer">
        <text x={W / 2} y={600} textAnchor="middle" fontSize="4" fill={DIM_GREEN} fontFamily={PIXEL_FONT} cursor="pointer">
          ANDY BOWLINE · NC SENATE · DISTRICT 31
        </text>
        <text x={W / 2} y={614} textAnchor="middle" fontSize="4" fill={DIM_GREEN} fontFamily={PIXEL_FONT} cursor="pointer">
          CAN'T WIN. YET.
        </text>
      </a>

      {/* Tap to start */}
      <text x={W / 2} y={660} textAnchor="middle" fontSize="5" fill={GREEN} fontFamily={PIXEL_FONT}
        opacity={blink ? 0.8 : 0.3}>
        TAP TO START
      </text>
    </svg>
  );
}

// ─── SETUP SCREEN (Profile Select) ──────────────────────
function SetupScreen({ onSelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <rect width={W} height={H} fill={DARK} />

      {/* Terminal lines background */}
      {[...Array(20)].map((_, i) => (
        <rect key={i} x={0} y={i * 37} width={W} height={1} fill={GREEN} opacity={0.03} />
      ))}

      <text x={W / 2} y={45} textAnchor="middle" fontSize="8" fill={GREEN} fontFamily={PIXEL_FONT}>
        SELECT YOUR PATIENT
      </text>
      <text x={W / 2} y={65} textAnchor="middle" fontSize="4.5" fill="#558855" fontFamily={PIXEL_FONT}>
        EACH PATH IS DIFFERENT. NONE ARE EASY.
      </text>

      {PROFILES.map((p, i) => {
        const cardY = 85 + i * 155;
        const isSelected = selected === p.id;
        return (
          <g
            key={p.id}
            cursor="pointer"
            onClick={() => setSelected(p.id)}
            onDoubleClick={() => onSelect(p)}
          >
            <rect x={20} y={cardY} width={W - 40} height={140} rx={4}
              fill={isSelected ? "#0d2a0d" : PANEL_BG}
              stroke={isSelected ? GREEN : BORDER}
              strokeWidth={isSelected ? 2 : 1} />

            {/* Name + difficulty */}
            <text x={32} y={cardY + 20} fontSize="7" fill={p.color} fontFamily={PIXEL_FONT}>
              {p.name}
            </text>
            <text x={W - 32} y={cardY + 20} textAnchor="end" fontSize="5" fill="#556655" fontFamily={PIXEL_FONT}>
              {p.difficulty}
            </text>

            {/* Insurance */}
            <text x={32} y={cardY + 38} fontSize="4.5" fill="#88aa88" fontFamily={PIXEL_FONT}>
              INSURANCE: {p.insuranceShort}
            </text>

            {/* Stats */}
            <text x={32} y={cardY + 58} fontSize="5" fill={GREEN} fontFamily={PIXEL_FONT}>
              ${p.cash}
            </text>
            <text x={32} y={cardY + 70} fontSize="4" fill="#558855" fontFamily={PIXEL_FONT}>
              SAVINGS
            </text>

            <text x={130} y={cardY + 58} fontSize="5" fill="#ff6666" fontFamily={PIXEL_FONT}>
              {p.health}/100
            </text>
            <text x={130} y={cardY + 70} fontSize="4" fill="#558855" fontFamily={PIXEL_FONT}>
              HEALTH
            </text>

            <text x={230} y={cardY + 58} fontSize="5" fill="#aaaacc" fontFamily={PIXEL_FONT}>
              {p.familyLabel}
            </text>
            <text x={230} y={cardY + 70} fontSize="4" fill="#558855" fontFamily={PIXEL_FONT}>
              PATIENT
            </text>

            {/* Description */}
            <text x={32} y={cardY + 92} fontSize="4" fill="#667766" fontFamily={PIXEL_FONT}>
              {p.insurance.toUpperCase()}
            </text>

            {/* Flavor */}
            <text x={32} y={cardY + 110} fontSize="4" fill="#556655" fontFamily={PIXEL_FONT}>
              {p.id === "teacher" ? `${p.familyLabel} GETS SICK. YOU HAVE "GOOD" INSURANCE.` :
               p.id === "gig" ? "YOU GET SICK. YOU HAVE NO INSURANCE." :
               p.id === "parent" ? `${p.familyLabel} GETS SICK. YOUR PLAN COVERS ALMOST NOTHING.` :
               `${p.familyLabel} GETS SICK. MEDICARE HAS GAPS.`}
            </text>

            {/* Select indicator */}
            {isSelected && (
              <text x={W - 38} y={cardY + 130} textAnchor="end" fontSize="5" fill={GREEN} fontFamily={PIXEL_FONT}>
                {'>'} TAP AGAIN
              </text>
            )}
          </g>
        );
      })}

      {/* Confirm button — only when selected */}
      {selected && (
        <g cursor="pointer" onClick={() => onSelect(PROFILES.find(p => p.id === selected))}>
          <rect x={60} y={710} width={W - 120} height={0} rx={0} fill="transparent" />
        </g>
      )}
    </svg>
  );
}

// ─── PLAYING SCREEN (Stops) ─────────────────────────────
function PlayingScreen({ profile, onEnd }) {
  const [stopIndex, setStopIndex] = useState(0);
  const [health, setHealth] = useState(profile.health);
  const [money, setMoney] = useState(profile.cash);
  const [days, setDays] = useState(0);
  const [billItems, setBillItems] = useState([]);
  const [showChoices, setShowChoices] = useState(false);
  const [narrative, setNarrative] = useState(null);
  const [narrativeLines, setNarrativeLines] = useState(null);
  const [showBillReveal, setShowBillReveal] = useState(false);
  const [billRevealIndex, setBillRevealIndex] = useState(0);
  const [dead, setDead] = useState(false);
  const [erChosen, setErChosen] = useState(false);
  const [disputeWon, setDisputeWon] = useState(false);

  const stops = useRef(getStops(profile)).current;
  const currentStop = stops[stopIndex];

  const { displayed: typewriterLines, done: typewriterDone, skip: skipTypewriter } = useTypewriter(
    narrative ? null : currentStop.text,
    30
  );

  const { displayed: narrativeDisplayed, done: narrativeDone, skip: skipNarrative } = useTypewriter(
    narrativeLines,
    25
  );

  // Show choices after typewriter
  useEffect(() => {
    if (typewriterDone && !narrative && !currentStop.isBillStop && !currentStop.isFinal) {
      const t = setTimeout(() => setShowChoices(true), 300);
      return () => clearTimeout(t);
    }
  }, [typewriterDone, narrative, currentStop]);

  // Bill reveal animation
  useEffect(() => {
    if (showBillReveal && billRevealIndex < billItems.length) {
      const t = setTimeout(() => setBillRevealIndex(i => i + 1), 400);
      return () => clearTimeout(t);
    }
    if (showBillReveal && billRevealIndex >= billItems.length) {
      const t = setTimeout(() => setShowChoices(true), 800);
      return () => clearTimeout(t);
    }
  }, [showBillReveal, billRevealIndex, billItems.length]);

  // Auto-trigger bill reveal for Stop 6
  useEffect(() => {
    if (currentStop.isBillStop && typewriterDone && !narrative && !showBillReveal) {
      const t = setTimeout(() => setShowBillReveal(true), 500);
      return () => clearTimeout(t);
    }
  }, [currentStop.isBillStop, typewriterDone, narrative, showBillReveal]);

  // Final stop — compute outcome and auto-advance
  useEffect(() => {
    if (currentStop.isFinal && typewriterDone) {
      const t = setTimeout(() => {
        onEnd({ health, money, days, billItems, dead: false, profile });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [currentStop.isFinal, typewriterDone, health, money, days, billItems, onEnd, profile]);

  // Set final stop text dynamically
  useEffect(() => {
    if (currentStop.isFinal) {
      const fm = profile.familyMember.toUpperCase();
      const survived = health > 0;
      if (survived && money >= 0) {
        currentStop.text = [
          `${fm} survived.`,
          ``,
          `You are ${money <= 50 ? "nearly" : ""} broke.`,
          `The bills will keep coming.`,
          ``,
          `This is the system working`,
          `as designed.`,
        ];
      } else if (survived && money < 0) {
        currentStop.text = [
          `${fm} survived.`,
          ``,
          `You are $${Math.abs(money)} in debt.`,
          `The collection calls start`,
          `in 30 days.`,
          ``,
          `This is the system working`,
          `as designed.`,
        ];
      } else {
        currentStop.text = [
          `${fm} didn't make it.`,
          ``,
          `The condition was treatable.`,
          `The system was not.`,
        ];
      }
    }
  }, [stopIndex]);

  // Check for death
  useEffect(() => {
    if (health <= 0 && !dead) {
      setDead(true);
      const t = setTimeout(() => {
        onEnd({ health: 0, money, days, billItems, dead: true, profile });
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [health, dead, money, days, billItems, onEnd, profile]);

  const handleChoice = (choice) => {
    let newHealth = health + choice.health;
    let newMoney = money + choice.money;
    let newDays = days + choice.days;
    let newBillItems = [...billItems];

    // Handle ER deferred cost
    if (choice.billItem && choice.billItem.deferred) {
      setErChosen(true);
    } else if (choice.billItem) {
      newBillItems.push(choice.billItem);
    }

    // Handle dynamic bill items (tests, prescriptions)
    if (choice.billItemDynamic) {
      const cost = Math.abs(choice.money);
      if (cost > 0) {
        const name = stopIndex === 3 ? "LAB WORK + IMAGING" : "PRESCRIPTION";
        newBillItems.push({ name, cost });
      }
    }

    // Handle "ask cost" forcing tests
    if (choice.forceTests) {
      const cost = Math.abs(choice.forceMoney);
      newMoney = money + choice.forceMoney;
      newBillItems.push({ name: "LAB WORK + IMAGING", cost });
    }

    // ER cost added at bill stop
    if (currentStop.isBillStop && erChosen) {
      const erCost = profile.id === "gig" ? 2800 : profile.id === "parent" ? 1200 : profile.id === "retiree" ? 650 : 800;
      if (!newBillItems.find(b => b.name === "EMERGENCY ROOM VISIT")) {
        newBillItems.push({ name: "EMERGENCY ROOM VISIT", cost: erCost });
      }
    }

    // Handle bill-specific choices
    if (choice.payBill) {
      const totalBill = newBillItems.reduce((sum, b) => sum + b.cost, 0);
      newMoney = money - totalBill;
    }

    if (choice.dispute) {
      const won = Math.random() > 0.5;
      setDisputeWon(won);
      if (won) {
        // Remove $200 from largest bill item
        const sorted = [...newBillItems].sort((a, b) => b.cost - a.cost);
        if (sorted.length > 0) {
          sorted[0].cost = Math.max(0, sorted[0].cost - 200);
          newBillItems = sorted;
        }
      }
    }

    setHealth(Math.max(0, Math.min(100, newHealth)));
    setMoney(newMoney);
    setDays(newDays);
    setBillItems(newBillItems);
    setShowChoices(false);

    // Build narrative text
    let narText = choice.narrative;
    if (choice.dispute) {
      narText += disputeWon ? " They take $200 off." : " They don't budge.";
    }

    const narLines = [];
    const words = narText.split(" ");
    let line = "";
    for (const word of words) {
      if ((line + " " + word).length > 28) {
        narLines.push(line.trim());
        line = word;
      } else {
        line += " " + word;
      }
    }
    if (line.trim()) narLines.push(line.trim());

    setNarrative(true);
    setNarrativeLines(narLines);
  };

  const advanceStop = () => {
    setNarrative(null);
    setNarrativeLines(null);
    setShowBillReveal(false);
    setBillRevealIndex(0);
    setShowChoices(false);
    setStopIndex(i => i + 1);
  };

  if (dead) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill={DARK} />
        <text x={W / 2} y={300} textAnchor="middle" fontSize="7" fill="#ff4444" fontFamily={PIXEL_FONT}>
          {profile.familyMember.toUpperCase()}
        </text>
        <text x={W / 2} y={330} textAnchor="middle" fontSize="7" fill="#ff4444" fontFamily={PIXEL_FONT}>
          HAS DIED OF A
        </text>
        <text x={W / 2} y={360} textAnchor="middle" fontSize="7" fill="#ff4444" fontFamily={PIXEL_FONT}>
          PREVENTABLE CONDITION.
        </text>
        <text x={W / 2} y={410} textAnchor="middle" fontSize="5" fill="#884444" fontFamily={PIXEL_FONT}>
          DAY {days} · ${money} REMAINING
        </text>
      </svg>
    );
  }

  const totalBill = billItems.reduce((sum, b) => sum + b.cost, 0);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", display: "block" }}
      onClick={() => {
        if (!typewriterDone && !narrative) skipTypewriter();
        else if (narrative && !narrativeDone) skipNarrative();
      }}
    >
      <rect width={W} height={H} fill={DARK} />

      {/* Terminal lines background */}
      {[...Array(20)].map((_, i) => (
        <rect key={i} x={0} y={i * 37} width={W} height={1} fill={GREEN} opacity={0.02} />
      ))}

      {/* ─── TOP BAR (Resources) ─── */}
      <rect x={0} y={0} width={W} height={52} fill="#050d05" />
      <rect x={0} y={52} width={W} height={1} fill={DIM_GREEN} opacity={0.3} />

      {/* Health */}
      <text x={20} y={18} fontSize="4" fill="#558855" fontFamily={PIXEL_FONT}>HEALTH</text>
      <rect x={20} y={22} width={80} height={8} fill="#1a1a1a" rx={2} />
      <rect x={20} y={22} width={Math.max(0, 80 * (health / 100))} height={8}
        fill={health > 50 ? GREEN : health > 25 ? "#ccaa33" : "#ff4444"} rx={2} />
      <text x={20} y={42} fontSize="5" fill={health > 50 ? GREEN : health > 25 ? "#ccaa33" : "#ff4444"} fontFamily={PIXEL_FONT}>
        {health}/100
      </text>

      {/* Money */}
      <text x={130} y={18} fontSize="4" fill="#558855" fontFamily={PIXEL_FONT}>SAVINGS</text>
      <text x={130} y={42} fontSize="6" fill={money >= 0 ? GREEN : "#ff4444"} fontFamily={PIXEL_FONT}>
        {money < 0 ? `-$${Math.abs(money)}` : `$${money}`}
      </text>

      {/* Days */}
      <text x={250} y={18} fontSize="4" fill="#558855" fontFamily={PIXEL_FONT}>DAYS</text>
      <text x={250} y={42} fontSize="6" fill="#aaaacc" fontFamily={PIXEL_FONT}>
        {days}
      </text>

      {/* Profile tag */}
      <text x={W - 10} y={18} textAnchor="end" fontSize="3.5" fill={profile.color} fontFamily={PIXEL_FONT}>
        {profile.name}
      </text>

      {/* ─── STOP TITLE ─── */}
      <text x={20} y={82} fontSize="6" fill={GREEN} fontFamily={PIXEL_FONT}>
        {currentStop.title}
      </text>
      <rect x={20} y={87} width={W - 40} height={1} fill={DIM_GREEN} opacity={0.3} />

      {/* ─── NARRATIVE / TYPEWRITER TEXT ─── */}
      {!narrative && (
        <TerminalText
          lines={typewriterLines}
          x={20}
          y={112}
          fontSize={5.5}
          fill={GREEN}
          lineHeight={15}
        />
      )}

      {narrative && (
        <g>
          <TerminalText
            lines={narrativeDisplayed}
            x={20}
            y={112}
            fontSize={5.5}
            fill="#88cc88"
            lineHeight={15}
          />
          {narrativeDone && (
            <g cursor="pointer" onClick={(e) => { e.stopPropagation(); advanceStop(); }}>
              <rect x={W / 2 - 80} y={112 + narrativeDisplayed.length * 15 + 20} width={160} height={34} rx={3}
                fill="#1a4a1a" stroke={GREEN} strokeWidth={1} />
              <text x={W / 2} y={112 + narrativeDisplayed.length * 15 + 42}
                textAnchor="middle" fontSize="7" fill={GREEN} fontFamily={PIXEL_FONT}>
                {'>'} CONTINUE
              </text>
            </g>
          )}
        </g>
      )}

      {/* ─── BILL REVEAL (Stop 6) ─── */}
      {showBillReveal && !narrative && (
        <g>
          <rect x={20} y={230} width={W - 40} height={16 + Math.min(billRevealIndex, billItems.length) * 18 + (billRevealIndex >= billItems.length ? 24 : 0)}
            fill="#0a0a0a" rx={3} stroke="#333" strokeWidth={1} />
          <text x={30} y={244} fontSize="5" fill="#888888" fontFamily={PIXEL_FONT}>
            ITEMIZED CHARGES:
          </text>
          {billItems.slice(0, billRevealIndex).map((item, i) => (
            <g key={i}>
              <text x={30} y={264 + i * 18} fontSize="5" fill={GREEN} fontFamily={PIXEL_FONT}>
                {item.name}
              </text>
              <text x={W - 30} y={264 + i * 18} textAnchor="end" fontSize="5" fill="#ff6666" fontFamily={PIXEL_FONT}>
                ${item.cost}
              </text>
            </g>
          ))}
          {billRevealIndex >= billItems.length && (
            <g>
              <rect x={30} y={264 + billItems.length * 18} width={W - 60} height={1} fill="#555" />
              <text x={30} y={280 + billItems.length * 18} fontSize="6" fill="#ffffff" fontFamily={PIXEL_FONT}>
                TOTAL
              </text>
              <text x={W - 30} y={280 + billItems.length * 18} textAnchor="end" fontSize="6" fill="#ff4444" fontFamily={PIXEL_FONT}>
                ${totalBill}
              </text>
            </g>
          )}
        </g>
      )}

      {/* ─── CHOICES ─── */}
      {showChoices && !narrative && currentStop.choices.length > 0 && (
        <g>
          {currentStop.choices.map((choice, i) => {
            const choiceY = currentStop.isBillStop
              ? 290 + billItems.length * 18 + 30 + i * 52
              : Math.max(112 + (currentStop.text.length) * 15 + 30, 250) + i * 52;
            return (
              <g key={i} cursor="pointer" onClick={(e) => { e.stopPropagation(); handleChoice(choice); }}>
                <rect x={20} y={choiceY} width={W - 40} height={44} rx={3}
                  fill="#0d1a0d" stroke={DIM_GREEN} strokeWidth={1} />
                <text x={32} y={choiceY + 18} fontSize="6" fill={GREEN} fontFamily={PIXEL_FONT}>
                  {'>'} {choice.label}
                </text>
                <text x={32} y={choiceY + 34} fontSize="4.5" fill="#558855" fontFamily={PIXEL_FONT}>
                  {choice.desc}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* Final stop — auto-advance indicator */}
      {currentStop.isFinal && typewriterDone && (
        <text x={W / 2} y={112 + currentStop.text.length * 15 + 40} textAnchor="middle" fontSize="5" fill={DIM_GREEN} fontFamily={PIXEL_FONT}>
          ...
        </text>
      )}
    </svg>
  );
}

// ─── END SCREEN ──────────────────────────────────────────
function EndScreen({ stats }) {
  const [phase, setPhase] = useState(0);
  const statRef = useRef(END_STATS[Math.floor(Math.random() * END_STATS.length)]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 3000);
    const t3 = setTimeout(() => setPhase(3), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const totalCost = stats.billItems.reduce((sum, b) => sum + b.cost, 0);
  const survived = stats.health > 0 && !stats.dead;
  const fm = stats.profile.familyMember.toUpperCase();

  // Word-wrap the random stat
  const statWords = statRef.current.split(" ");
  const statLines = [];
  let statLine = "";
  for (const word of statWords) {
    if ((statLine + " " + word).length > 34) {
      statLines.push(statLine.trim());
      statLine = word;
    } else {
      statLine += " " + word;
    }
  }
  if (statLine.trim()) statLines.push(statLine.trim());

  const shareResult = () => {
    const outcome = survived ? "survived" : "didn't make it";
    const text = `I played The Care Trail as ${stats.profile.name}.\n\n${fm} ${outcome}.\nTotal cost: $${totalCost}\nDays: ${stats.days}\nHealth: ${stats.health}/100\n\nEvery obstacle in this game is real.\n\nhttps://games.andycantwin.com/caretrail`;
    const url = "https://games.andycantwin.com/caretrail";
    if (navigator.share) {
      navigator.share({ title: "The Care Trail", text, url }).catch(() => {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => alert("Link copied!")).catch(() => prompt("Copy this link:", url));
    } else {
      prompt("Copy this link:", url);
    }
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <rect width={W} height={H} fill={DARK} />

      {/* Terminal lines background */}
      {[...Array(20)].map((_, i) => (
        <rect key={i} x={0} y={i * 37} width={W} height={1} fill={GREEN} opacity={0.02} />
      ))}

      {/* Phase 0: Result header */}
      <text x={W / 2} y={50} textAnchor="middle" fontSize="8" fill={GREEN} fontFamily={PIXEL_FONT}
        stroke="#0a2a0a" strokeWidth="2" paintOrder="stroke">
        THE CARE TRAIL
      </text>

      {survived ? (
        <text x={W / 2} y={80} textAnchor="middle" fontSize="7" fill="#88cc88" fontFamily={PIXEL_FONT}>
          {fm} SURVIVED.
        </text>
      ) : (
        <g>
          <text x={W / 2} y={80} textAnchor="middle" fontSize="7" fill="#ff4444" fontFamily={PIXEL_FONT}>
            {fm} DIDN'T MAKE IT.
          </text>
          <text x={W / 2} y={98} textAnchor="middle" fontSize="5" fill="#884444" fontFamily={PIXEL_FONT}>
            THE CONDITION WAS TREATABLE.
          </text>
        </g>
      )}

      {/* Stats row */}
      <rect x={20} y={112} width={W - 40} height={68} fill={PANEL_BG} rx={4} stroke={BORDER} strokeWidth={1} />

      <text x={70} y={134} textAnchor="middle" fontSize="8" fill="#ff6666" fontFamily={PIXEL_FONT}>
        ${totalCost}
      </text>
      <text x={70} y={148} textAnchor="middle" fontSize="4" fill="#558855" fontFamily={PIXEL_FONT}>
        TOTAL COST
      </text>

      <text x={W / 2} y={134} textAnchor="middle" fontSize="8" fill="#aaaacc" fontFamily={PIXEL_FONT}>
        {stats.days}
      </text>
      <text x={W / 2} y={148} textAnchor="middle" fontSize="4" fill="#558855" fontFamily={PIXEL_FONT}>
        DAYS
      </text>

      <text x={290} y={134} textAnchor="middle" fontSize="8"
        fill={stats.health > 50 ? GREEN : stats.health > 0 ? "#ccaa33" : "#ff4444"} fontFamily={PIXEL_FONT}>
        {stats.health}
      </text>
      <text x={290} y={148} textAnchor="middle" fontSize="4" fill="#558855" fontFamily={PIXEL_FONT}>
        HEALTH
      </text>

      <text x={W / 2} y={172} textAnchor="middle" fontSize="4.5" fill={stats.profile.color} fontFamily={PIXEL_FONT}>
        {stats.profile.name} · {stats.profile.insuranceShort}
      </text>

      {/* Phase 1: "Every obstacle is real" */}
      {phase >= 1 && (
        <g>
          <rect x={20} y={192} width={W - 40} height={54} fill="#1a1a0a" rx={4} stroke="#3a3a1a" strokeWidth={1} />
          <text x={W / 2} y={214} textAnchor="middle" fontSize="5" fill="#ccaa44" fontFamily={PIXEL_FONT}>
            EVERY OBSTACLE IN THIS GAME
          </text>
          <text x={W / 2} y={230} textAnchor="middle" fontSize="5" fill="#ccaa44" fontFamily={PIXEL_FONT}>
            IS REAL. EVERY COST IS BASED ON
          </text>
          <text x={W / 2} y={240} textAnchor="middle" fontSize="5" fill="#ccaa44" fontFamily={PIXEL_FONT}>
            ACTUAL NC HEALTHCARE DATA.
          </text>
        </g>
      )}

      {/* Phase 2: Random stat */}
      {phase >= 2 && (
        <g>
          <rect x={20} y={258} width={W - 40} height={20 + statLines.length * 14} fill="#1a0a0a" rx={4} stroke="#3a1a1a" strokeWidth={1} />
          {statLines.map((sl, i) => (
            <text key={i} x={W / 2} y={276 + i * 14} textAnchor="middle" fontSize="5" fill="#ff8866" fontFamily={PIXEL_FONT}>
              {sl.toUpperCase()}
            </text>
          ))}
        </g>
      )}

      {/* Phase 3: CTAs */}
      {phase >= 3 && (
        <g>
          {/* Bill breakdown */}
          {stats.billItems.length > 0 && (
            <g>
              <rect x={20} y={310 + statLines.length * 14} width={W - 40}
                height={20 + stats.billItems.length * 14 + 18}
                fill="#0a0a0a" rx={3} stroke="#333" strokeWidth={1} />
              <text x={30} y={326 + statLines.length * 14} fontSize="4.5" fill="#888888" fontFamily={PIXEL_FONT}>
                YOUR BILLS:
              </text>
              {stats.billItems.map((item, i) => (
                <g key={i}>
                  <text x={30} y={342 + statLines.length * 14 + i * 14} fontSize="4" fill={GREEN} fontFamily={PIXEL_FONT}>
                    {item.name}
                  </text>
                  <text x={W - 30} y={342 + statLines.length * 14 + i * 14} textAnchor="end" fontSize="4" fill="#ff6666" fontFamily={PIXEL_FONT}>
                    ${item.cost}
                  </text>
                </g>
              ))}
            </g>
          )}

          {(() => {
            const billBlockH = stats.billItems.length > 0 ? 20 + stats.billItems.length * 14 + 24 : 0;
            const ctaY = 316 + statLines.length * 14 + billBlockH;
            return (
              <g>
                {/* Campaign link */}
                <a href="https://andycantwin.com" target="_blank" rel="noopener noreferrer">
                  <g cursor="pointer">
                    <rect x={20} y={ctaY} width={W - 40} height={50} rx={4}
                      fill="#0d1a2a" stroke="#336699" strokeWidth={2} />
                    <text x={W / 2} y={ctaY + 20} textAnchor="middle" fontSize="5" fill="#6699cc" fontFamily={PIXEL_FONT}>
                      ANDY BOWLINE · NC SENATE · DISTRICT 31
                    </text>
                    <text x={W / 2} y={ctaY + 38} textAnchor="middle" fontSize="6" fill="#88bbee" fontFamily={PIXEL_FONT}>
                      CAN'T WIN. YET.
                    </text>
                  </g>
                </a>

                {/* Share + Play Again */}
                <g cursor="pointer" onClick={shareResult}>
                  <rect x={20} y={ctaY + 62} width={150} height={30} rx={3}
                    fill="#dd6644" stroke="#ee7755" strokeWidth={1} />
                  <text x={95} y={ctaY + 82} textAnchor="middle" fontSize="9" fill="#fff" fontFamily={PIXEL_FONT}>
                    SHARE
                  </text>
                </g>
                <g cursor="pointer" onClick={() => window.location.reload()}>
                  <rect x={180} y={ctaY + 62} width={160} height={30} rx={3}
                    fill="#1a4a1a" stroke={GREEN} strokeWidth={1} />
                  <text x={260} y={ctaY + 82} textAnchor="middle" fontSize="8" fill={GREEN} fontFamily={PIXEL_FONT}>
                    PLAY AGAIN
                  </text>
                </g>

                {/* Donate */}
                <a href="https://secure.actblue.com/donate/andybowline" target="_blank" rel="noopener noreferrer">
                  <g cursor="pointer">
                    <rect x={20} y={ctaY + 104} width={W - 40} height={40} rx={3}
                      fill="#1a3a1a" stroke="#3a6a3a" strokeWidth={1.5} />
                    <text x={W / 2} y={ctaY + 120} textAnchor="middle" fontSize="5" fill="#88dd88" fontFamily={PIXEL_FONT}>
                      CHIP IN $5 TO FIX THE SYSTEM
                    </text>
                    <text x={W / 2} y={ctaY + 136} textAnchor="middle" fontSize="8" fill="#44ff44" fontFamily={PIXEL_FONT}>
                      DONATE →
                    </text>
                  </g>
                </a>

                {/* Source */}
                <text x={W / 2} y={ctaY + 162} textAnchor="middle" fontSize="3.5" fill="#334433" fontFamily={PIXEL_FONT}>
                  KFF · CENSUS BUREAU · NC DHHS · COMMONWEALTH FUND
                </text>
              </g>
            );
          })()}
        </g>
      )}
    </svg>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────
export default function CareTrail() {
  const [gameState, setGameState] = useState("title");
  const [profile, setProfile] = useState(null);
  const [endStats, setEndStats] = useState(null);

  const handleStart = useCallback(() => {
    setGameState("setup");
  }, []);

  const handleSelect = useCallback((p) => {
    setProfile(p);
    setGameState("playing");
  }, []);

  const handleEnd = useCallback((stats) => {
    setEndStats(stats);
    setGameState("ended");
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
        margin: "0 auto",
        height: "100dvh",
        maxHeight: "900px",
        background: DARK,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 40px rgba(0,0,0,0.8)",
      }}
    >
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

      {gameState === "title" && <TitleScreen onStart={handleStart} />}
      {gameState === "setup" && <SetupScreen onSelect={handleSelect} />}
      {gameState === "playing" && profile && <PlayingScreen profile={profile} onEnd={handleEnd} />}
      {gameState === "ended" && endStats && <EndScreen stats={endStats} />}
    </div>
  );
}
