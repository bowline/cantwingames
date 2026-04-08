"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const PIXEL_FONT = `var(--font-pixel), "Press Start 2P", monospace`;
const GREEN = "#33ff66";
const DIM_GREEN = "#1a8833";
const DARK = "#0a0a1a";
const PANEL_BG = "#0d1a0d";
const BORDER = "#1a3a1a";

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

// ─── TERMINAL BACKGROUND LINES ──────────────────────────
function TerminalBgLines() {
  return (
    <>
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: i * 37,
            height: 1,
            background: GREEN,
            opacity: 0.03,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
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
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", position: "relative" }}>
      <TerminalBgLines />

      {/* Terminal header */}
      <div style={{ fontFamily: PIXEL_FONT, fontSize: 9, color: DIM_GREEN, lineHeight: "2", marginTop: 24 }}>
        <div>{">"} LOADING HEALTHCARE.SYS...</div>
        <div>{">"} COVERAGE: NOT FOUND</div>
        <div>{">"} DEDUCTIBLE: $8,000</div>
        <div style={{ color: "#ff4444" }}>{">"} ERROR: SYSTEM NOT DESIGNED FOR YOU</div>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: PIXEL_FONT,
        fontSize: 28,
        color: GREEN,
        textAlign: "center",
        marginTop: 28,
        lineHeight: "1.4",
        textShadow: "0 0 10px rgba(51,255,102,0.3)",
      }}>
        <div>THE CARE</div>
        <div>TRAIL</div>
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: PIXEL_FONT,
        fontSize: 10,
        color: "#88cc88",
        textAlign: "center",
        marginTop: 16,
        lineHeight: "2",
      }}>
        <div>NAVIGATE THE AMERICAN</div>
        <div>HEALTHCARE SYSTEM.</div>
        <div style={{ color: "#ff6666", fontSize: 10, marginTop: 4 }}>TRY NOT TO GO BANKRUPT.</div>
      </div>

      {/* Blinking cursor */}
      <div style={{
        width: 12,
        height: 3,
        background: GREEN,
        opacity: cursorVisible ? 0.7 : 0,
        margin: "4px auto 0",
      }} />

      {/* Start + Share buttons */}
      <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "center" }}>
        <button
          onClick={onStart}
          style={{
            fontFamily: PIXEL_FONT,
            fontSize: 16,
            color: GREEN,
            background: blink ? "#1a4a1a" : "#0d3a0d",
            border: `1px solid ${GREEN}`,
            borderRadius: 3,
            padding: "10px 32px",
            cursor: "pointer",
            minHeight: 48,
          }}
        >
          {">"} START
        </button>

        <button
          onClick={shareTitle}
          style={{
            fontFamily: PIXEL_FONT,
            fontSize: 14,
            color: "#fff",
            background: "#dd6644",
            border: "1px solid #ee7755",
            borderRadius: 3,
            padding: "10px 20px",
            cursor: "pointer",
            minHeight: 48,
          }}
        >
          SHARE
        </button>
      </div>

      {/* Preview stats */}
      <div style={{
        background: PANEL_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        padding: "12px 14px",
        marginTop: 20,
      }}>
        <div style={{
          fontFamily: PIXEL_FONT,
          fontSize: 9,
          color: "#88cc88",
          textAlign: "center",
          marginBottom: 10,
        }}>
          CHOOSE YOUR PATIENT:
        </div>
        {PROFILES.map((p) => (
          <div key={p.id} style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}>
            <div style={{ width: 8, height: 8, background: p.color, borderRadius: 2, flexShrink: 0 }} />
            <span style={{ fontFamily: PIXEL_FONT, fontSize: 9, color: p.color, flex: 1 }}>{p.name}</span>
            <span style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: "#556655" }}>{p.difficulty}</span>
          </div>
        ))}
      </div>

      {/* Sources */}
      <div style={{
        fontFamily: PIXEL_FONT,
        fontSize: 7,
        color: "#334433",
        textAlign: "center",
        marginTop: 16,
        lineHeight: "1.8",
      }}>
        <div>KFF · CENSUS BUREAU · NC DHHS · COMMONWEALTH FUND</div>
        <div>COSTS BASED ON ACTUAL NC HEALTHCARE DATA</div>
      </div>

      {/* Donate button */}
      <a
        href="https://secure.actblue.com/donate/andybowline"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          background: "#1a3a1a",
          border: "1.5px solid #3a6a3a",
          borderRadius: 3,
          padding: "10px 14px",
          marginTop: 16,
          textAlign: "center",
          textDecoration: "none",
        }}
      >
        <div style={{ fontFamily: PIXEL_FONT, fontSize: 9, color: "#88dd88", marginBottom: 4 }}>
          CHIP IN $5? YOUR COPAY WAS HIGHER.
        </div>
        <div style={{ fontFamily: PIXEL_FONT, fontSize: 12, color: "#44ff44" }}>
          DONATE →
        </div>
      </a>

      {/* Campaign link */}
      <a
        href="https://andycantwin.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          textAlign: "center",
          textDecoration: "none",
          marginTop: 16,
        }}
      >
        <div style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: DIM_GREEN }}>
          ANDY BOWLINE · NC SENATE · DISTRICT 31
        </div>
        <div style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: DIM_GREEN, marginTop: 4 }}>
          CAN'T WIN. YET.
        </div>
      </a>

      {/* Tap to start */}
      <div style={{
        fontFamily: PIXEL_FONT,
        fontSize: 10,
        color: GREEN,
        textAlign: "center",
        marginTop: 20,
        opacity: blink ? 0.8 : 0.3,
        paddingBottom: 16,
      }}>
        TAP TO START
      </div>
    </div>
  );
}

// ─── SETUP SCREEN (Profile Select) ──────────────────────
function SetupScreen({ onSelect }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", position: "relative" }}>
      <TerminalBgLines />

      <div style={{
        fontFamily: PIXEL_FONT,
        fontSize: 16,
        color: GREEN,
        textAlign: "center",
        marginTop: 8,
        marginBottom: 4,
      }}>
        SELECT YOUR PATIENT
      </div>
      <div style={{
        fontFamily: PIXEL_FONT,
        fontSize: 9,
        color: "#558855",
        textAlign: "center",
        marginBottom: 16,
      }}>
        EACH PATH IS DIFFERENT. NONE ARE EASY.
      </div>

      {PROFILES.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          style={{
            display: "block",
            width: "100%",
            background: PANEL_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 4,
            padding: "14px",
            marginBottom: 12,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {/* Name + difficulty */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: PIXEL_FONT, fontSize: 12, color: p.color }}>{p.name}</span>
            <span style={{ fontFamily: PIXEL_FONT, fontSize: 9, color: "#556655" }}>{p.difficulty}</span>
          </div>

          {/* Insurance */}
          <div style={{ fontFamily: PIXEL_FONT, fontSize: 9, color: "#88aa88", marginBottom: 10 }}>
            INSURANCE: {p.insuranceShort}
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: 11, color: GREEN }}>${p.cash}</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: "#558855" }}>SAVINGS</div>
            </div>
            <div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: 11, color: "#ff6666" }}>{p.health}/100</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: "#558855" }}>HEALTH</div>
            </div>
            <div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: 11, color: "#aaaacc" }}>{p.familyLabel}</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: "#558855" }}>PATIENT</div>
            </div>
          </div>

          {/* Description */}
          <div style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: "#667766", marginBottom: 6 }}>
            {p.insurance.toUpperCase()}
          </div>

          {/* Flavor */}
          <div style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: "#556655" }}>
            {p.id === "teacher" ? `${p.familyLabel} GETS SICK. YOU HAVE "GOOD" INSURANCE.` :
             p.id === "gig" ? "YOU GET SICK. YOU HAVE NO INSURANCE." :
             p.id === "parent" ? `${p.familyLabel} GETS SICK. YOUR PLAN COVERS ALMOST NOTHING.` :
             `${p.familyLabel} GETS SICK. MEDICARE HAS GAPS.`}
          </div>
        </button>
      ))}
    </div>
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

  // Use a ref for the dead flag to fix the death screen bug
  const deadRef = useRef(false);

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

  // Check for death — use ref to prevent cleanup from cancelling the timeout
  useEffect(() => {
    if (health <= 0 && !deadRef.current) {
      deadRef.current = true;
      setDead(true);
      const t = setTimeout(() => {
        onEnd({ health: 0, money, days, billItems, dead: true, profile });
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [health, money, days, billItems, onEnd, profile]);

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

    // Build narrative text — no manual word-wrapping needed for HTML
    let narText = choice.narrative;
    if (choice.dispute) {
      narText += disputeWon ? " They take $200 off." : " They don't budge.";
    }

    setNarrative(true);
    setNarrativeLines([narText]);
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
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        position: "relative",
      }}>
        <TerminalBgLines />
        <div style={{
          fontFamily: PIXEL_FONT,
          fontSize: 14,
          color: "#ff4444",
          textAlign: "center",
          lineHeight: "2",
        }}>
          <div>{profile.familyMember.toUpperCase()}</div>
          <div>HAS DIED OF A</div>
          <div>PREVENTABLE CONDITION.</div>
        </div>
        <div style={{
          fontFamily: PIXEL_FONT,
          fontSize: 10,
          color: "#884444",
          textAlign: "center",
          marginTop: 20,
        }}>
          DAY {days} · ${money} REMAINING
        </div>
      </div>
    );
  }

  const totalBill = billItems.reduce((sum, b) => sum + b.cost, 0);

  return (
    <>
      {/* ─── TOP BAR (Resources) ─── */}
      <div
        style={{
          background: "#050d05",
          borderBottom: `1px solid ${DIM_GREEN}33`,
          padding: "8px 16px 10px",
          flexShrink: 0,
          zIndex: 10,
        }}
        onClick={() => {
          if (!typewriterDone && !narrative) skipTypewriter();
          else if (narrative && !narrativeDone) skipNarrative();
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* Health */}
          <div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: "#558855", marginBottom: 4 }}>HEALTH</div>
            <div style={{
              width: 80,
              height: 8,
              background: "#1a1a1a",
              borderRadius: 2,
              marginBottom: 4,
              overflow: "hidden",
            }}>
              <div style={{
                width: `${Math.max(0, health)}%`,
                height: "100%",
                background: health > 50 ? GREEN : health > 25 ? "#ccaa33" : "#ff4444",
                borderRadius: 2,
                transition: "width 0.3s",
              }} />
            </div>
            <div style={{
              fontFamily: PIXEL_FONT,
              fontSize: 10,
              color: health > 50 ? GREEN : health > 25 ? "#ccaa33" : "#ff4444",
            }}>
              {health}/100
            </div>
          </div>

          {/* Money */}
          <div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: "#558855", marginBottom: 4 }}>SAVINGS</div>
            <div style={{
              fontFamily: PIXEL_FONT,
              fontSize: 12,
              color: money >= 0 ? GREEN : "#ff4444",
              marginTop: 12,
            }}>
              {money < 0 ? `-$${Math.abs(money)}` : `$${money}`}
            </div>
          </div>

          {/* Days */}
          <div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: "#558855", marginBottom: 4 }}>DAYS</div>
            <div style={{
              fontFamily: PIXEL_FONT,
              fontSize: 12,
              color: "#aaaacc",
              marginTop: 12,
            }}>
              {days}
            </div>
          </div>
        </div>

        {/* Profile tag */}
        <div style={{
          fontFamily: PIXEL_FONT,
          fontSize: 7,
          color: profile.color,
          textAlign: "right",
          marginTop: 2,
        }}>
          {profile.name}
        </div>
      </div>

      {/* ─── SCROLLABLE CONTENT ─── */}
      <div
        style={{ flex: 1, overflowY: "auto", padding: "16px", position: "relative" }}
        onClick={() => {
          if (!typewriterDone && !narrative) skipTypewriter();
          else if (narrative && !narrativeDone) skipNarrative();
        }}
      >
        <TerminalBgLines />

        {/* ─── STOP TITLE ─── */}
        <div style={{
          fontFamily: PIXEL_FONT,
          fontSize: 11,
          color: GREEN,
          marginBottom: 4,
        }}>
          {currentStop.title}
        </div>
        <div style={{ height: 1, background: `${DIM_GREEN}4d`, marginBottom: 16 }} />

        {/* ─── NARRATIVE / TYPEWRITER TEXT ─── */}
        {!narrative && (
          <div style={{
            fontFamily: PIXEL_FONT,
            fontSize: 11,
            color: GREEN,
            lineHeight: "2.2",
            minHeight: 60,
          }}>
            {typewriterLines.map((line, i) => (
              <div key={i}>{line || "\u00A0"}</div>
            ))}
          </div>
        )}

        {narrative && (
          <div>
            <div style={{
              fontFamily: PIXEL_FONT,
              fontSize: 11,
              color: "#88cc88",
              lineHeight: "2.2",
              minHeight: 60,
            }}>
              {narrativeDisplayed.map((line, i) => (
                <div key={i}>{line || "\u00A0"}</div>
              ))}
            </div>
            {narrativeDone && (
              <button
                onClick={(e) => { e.stopPropagation(); advanceStop(); }}
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: 240,
                  margin: "20px auto 0",
                  fontFamily: PIXEL_FONT,
                  fontSize: 14,
                  color: GREEN,
                  background: "#1a4a1a",
                  border: `1px solid ${GREEN}`,
                  borderRadius: 3,
                  padding: "12px 16px",
                  cursor: "pointer",
                  minHeight: 48,
                }}
              >
                {">"} CONTINUE
              </button>
            )}
          </div>
        )}

        {/* ─── BILL REVEAL (Stop 6) ─── */}
        {showBillReveal && !narrative && (
          <div style={{
            background: "#0a0a0a",
            border: "1px solid #333",
            borderRadius: 3,
            padding: "12px 14px",
            marginTop: 16,
          }}>
            <div style={{
              fontFamily: PIXEL_FONT,
              fontSize: 10,
              color: "#888888",
              marginBottom: 10,
            }}>
              ITEMIZED CHARGES:
            </div>
            {billItems.slice(0, billRevealIndex).map((item, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}>
                <span style={{ fontFamily: PIXEL_FONT, fontSize: 10, color: GREEN }}>{item.name}</span>
                <span style={{ fontFamily: PIXEL_FONT, fontSize: 10, color: "#ff6666" }}>${item.cost}</span>
              </div>
            ))}
            {billRevealIndex >= billItems.length && (
              <div>
                <div style={{ height: 1, background: "#555", margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: PIXEL_FONT, fontSize: 12, color: "#ffffff" }}>TOTAL</span>
                  <span style={{ fontFamily: PIXEL_FONT, fontSize: 12, color: "#ff4444" }}>${totalBill}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── CHOICES ─── */}
        {showChoices && !narrative && currentStop.choices.length > 0 && (
          <div style={{ marginTop: 20 }}>
            {currentStop.choices.map((choice, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); handleChoice(choice); }}
                style={{
                  display: "block",
                  width: "100%",
                  background: "#0d1a0d",
                  border: `1px solid ${DIM_GREEN}`,
                  borderRadius: 3,
                  padding: "12px 14px",
                  marginBottom: 10,
                  cursor: "pointer",
                  textAlign: "left",
                  minHeight: 48,
                }}
              >
                <div style={{ fontFamily: PIXEL_FONT, fontSize: 12, color: GREEN, marginBottom: 4 }}>
                  {">"} {choice.label}
                </div>
                <div style={{ fontFamily: PIXEL_FONT, fontSize: 9, color: "#558855" }}>
                  {choice.desc}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Final stop — auto-advance indicator */}
        {currentStop.isFinal && typewriterDone && (
          <div style={{
            fontFamily: PIXEL_FONT,
            fontSize: 10,
            color: DIM_GREEN,
            textAlign: "center",
            marginTop: 24,
          }}>
            ...
          </div>
        )}
      </div>
    </>
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
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", position: "relative" }}>
      <TerminalBgLines />

      {/* Phase 0: Result header */}
      <div style={{
        fontFamily: PIXEL_FONT,
        fontSize: 16,
        color: GREEN,
        textAlign: "center",
        marginTop: 8,
        textShadow: "0 0 8px rgba(51,255,102,0.3)",
      }}>
        THE CARE TRAIL
      </div>

      {survived ? (
        <div style={{
          fontFamily: PIXEL_FONT,
          fontSize: 14,
          color: "#88cc88",
          textAlign: "center",
          marginTop: 12,
        }}>
          {fm} SURVIVED.
        </div>
      ) : (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <div style={{ fontFamily: PIXEL_FONT, fontSize: 14, color: "#ff4444" }}>
            {fm} DIDN'T MAKE IT.
          </div>
          <div style={{ fontFamily: PIXEL_FONT, fontSize: 10, color: "#884444", marginTop: 6 }}>
            THE CONDITION WAS TREATABLE.
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{
        background: PANEL_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        padding: "14px",
        marginTop: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: 16, color: "#ff6666" }}>${totalCost}</div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: "#558855", marginTop: 4 }}>TOTAL COST</div>
          </div>
          <div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: 16, color: "#aaaacc" }}>{stats.days}</div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: "#558855", marginTop: 4 }}>DAYS</div>
          </div>
          <div>
            <div style={{
              fontFamily: PIXEL_FONT,
              fontSize: 16,
              color: stats.health > 50 ? GREEN : stats.health > 0 ? "#ccaa33" : "#ff4444",
            }}>
              {stats.health}
            </div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: "#558855", marginTop: 4 }}>HEALTH</div>
          </div>
        </div>
        <div style={{
          fontFamily: PIXEL_FONT,
          fontSize: 9,
          color: stats.profile.color,
          textAlign: "center",
          marginTop: 10,
        }}>
          {stats.profile.name} · {stats.profile.insuranceShort}
        </div>
      </div>

      {/* Phase 1: "Every obstacle is real" */}
      {phase >= 1 && (
        <div style={{
          background: "#1a1a0a",
          border: "1px solid #3a3a1a",
          borderRadius: 4,
          padding: "12px 14px",
          marginTop: 14,
          textAlign: "center",
        }}>
          <div style={{ fontFamily: PIXEL_FONT, fontSize: 10, color: "#ccaa44", lineHeight: "2" }}>
            EVERY OBSTACLE IN THIS GAME IS REAL. EVERY COST IS BASED ON ACTUAL NC HEALTHCARE DATA.
          </div>
        </div>
      )}

      {/* Phase 2: Random stat */}
      {phase >= 2 && (
        <div style={{
          background: "#1a0a0a",
          border: "1px solid #3a1a1a",
          borderRadius: 4,
          padding: "12px 14px",
          marginTop: 14,
          textAlign: "center",
        }}>
          <div style={{ fontFamily: PIXEL_FONT, fontSize: 10, color: "#ff8866", lineHeight: "2" }}>
            {statRef.current.toUpperCase()}
          </div>
        </div>
      )}

      {/* Phase 3: CTAs */}
      {phase >= 3 && (
        <div>
          {/* Bill breakdown */}
          {stats.billItems.length > 0 && (
            <div style={{
              background: "#0a0a0a",
              border: "1px solid #333",
              borderRadius: 3,
              padding: "12px 14px",
              marginTop: 14,
            }}>
              <div style={{
                fontFamily: PIXEL_FONT,
                fontSize: 9,
                color: "#888888",
                marginBottom: 8,
              }}>
                YOUR BILLS:
              </div>
              {stats.billItems.map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}>
                  <span style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: GREEN }}>{item.name}</span>
                  <span style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: "#ff6666" }}>${item.cost}</span>
                </div>
              ))}
            </div>
          )}

          {/* Campaign link */}
          <a
            href="https://andycantwin.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              background: "#0d1a2a",
              border: "2px solid #336699",
              borderRadius: 4,
              padding: "12px 14px",
              marginTop: 14,
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            <div style={{ fontFamily: PIXEL_FONT, fontSize: 9, color: "#6699cc", marginBottom: 6 }}>
              ANDY BOWLINE · NC SENATE · DISTRICT 31
            </div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: 12, color: "#88bbee" }}>
              CAN'T WIN. YET.
            </div>
          </a>

          {/* Share + Play Again */}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button
              onClick={shareResult}
              style={{
                flex: "0 0 auto",
                fontFamily: PIXEL_FONT,
                fontSize: 14,
                color: "#fff",
                background: "#dd6644",
                border: "1px solid #ee7755",
                borderRadius: 3,
                padding: "8px 20px",
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              SHARE
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                flex: 1,
                fontFamily: PIXEL_FONT,
                fontSize: 14,
                color: GREEN,
                background: "#1a4a1a",
                border: `1px solid ${GREEN}`,
                borderRadius: 3,
                padding: "8px 16px",
                cursor: "pointer",
                minHeight: 44,
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
            style={{
              display: "block",
              background: "#1a3a1a",
              border: "1.5px solid #3a6a3a",
              borderRadius: 3,
              padding: "10px 14px",
              marginTop: 14,
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            <div style={{ fontFamily: PIXEL_FONT, fontSize: 9, color: "#88dd88", marginBottom: 4 }}>
              CHIP IN $5 TO FIX THE SYSTEM
            </div>
            <div style={{ fontFamily: PIXEL_FONT, fontSize: 14, color: "#44ff44" }}>
              DONATE →
            </div>
          </a>

          {/* Source */}
          <div style={{
            fontFamily: PIXEL_FONT,
            fontSize: 7,
            color: "#334433",
            textAlign: "center",
            marginTop: 14,
            paddingBottom: 16,
          }}>
            KFF · CENSUS BUREAU · NC DHHS · COMMONWEALTH FUND
          </div>
        </div>
      )}
    </div>
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
