import { ImageResponse } from "next/og";

export const alt = "Earn Your Seat — a gerrymandering awareness game";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  let fontData = null;
  try {
    const css = await fetch("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap").then((r) => r.text());
    const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
    fontData = match ? await fetch(match[1]).then((r) => r.arrayBuffer()) : null;
  } catch {}

  const fonts = fontData
    ? [{ name: "PressStart2P", data: fontData, style: "normal", weight: 400 }]
    : [];

  const pixelFont = fontData
    ? "PressStart2P, monospace"
    : "monospace";

  // Issue labels for the floating cards
  const issues = [
    { icon: "📚", label: "TEACHERS LEAVING", x: 40, y: 90, rot: -4 },
    { icon: "🏥", label: "CLINICS CLOSING", x: 820, y: 70, rot: 3 },
    { icon: "💰", label: "PROPERTY TAX +12%", x: 60, y: 430, rot: 5 },
    { icon: "⚡", label: "POWER BILLS UP", x: 850, y: 440, rot: -3 },
    { icon: "🎓", label: "VOUCHER $ DIVERTED", x: 40, y: 260, rot: -2 },
    { icon: "👮", label: "4 DEPUTIES TOTAL", x: 870, y: 260, rot: 4 },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a1a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Scanline effect */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 6px)",
            display: "flex",
          }}
        />

        {/* CRT vignette */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
            display: "flex",
          }}
        />

        {/* Floating issue cards */}
        {issues.map((issue) => (
          <div
            key={issue.label}
            style={{
              position: "absolute",
              left: issue.x,
              top: issue.y,
              background: "#1a1a2e",
              border: "3px solid #3a3a5a",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transform: `rotate(${issue.rot}deg)`,
              opacity: 0.5,
            }}
          >
            <span style={{ fontSize: "18px" }}>{issue.icon}</span>
            <span
              style={{
                fontFamily: pixelFont,
                fontSize: "10px",
                color: "#ff8866",
              }}
            >
              {issue.label}
            </span>
          </div>
        ))}

        {/* Center content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            padding: "48px 60px",
            background: "rgba(10, 10, 26, 0.92)",
            border: "4px solid #3a3a5a",
            position: "relative",
          }}
        >
          {/* Subtitle */}
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "16px",
              color: "#6a8a6a",
              letterSpacing: "4px",
              display: "flex",
            }}
          >
            — DISTRICT 31 PRESENTS —
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <div
              style={{
                fontFamily: pixelFont,
                fontSize: "52px",
                color: "#ff8866",
                textShadow: "4px 4px 0px #331a11",
                display: "flex",
              }}
            >
              EARN YOUR
            </div>
            <div
              style={{
                fontFamily: pixelFont,
                fontSize: "52px",
                color: "#ffaa44",
                textShadow: "4px 4px 0px #332211",
                display: "flex",
              }}
            >
              SEAT
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "14px",
              color: "#8888aa",
              textAlign: "center",
              lineHeight: 1.8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span style={{ display: "flex" }}>
              YOU ARE A STATE SENATOR IN A GERRYMANDERED DISTRICT.
            </span>
            <span style={{ color: "#aa6633", display: "flex" }}>
              TRY TO REPRESENT YOUR VOTERS.
            </span>
          </div>

          {/* Play button */}
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "18px",
              color: "#ccffcc",
              background: "#4a8844",
              padding: "14px 40px",
              borderTop: "4px solid #5a9955",
              borderLeft: "4px solid #5a9955",
              borderBottom: "4px solid #2a5522",
              borderRight: "4px solid #2a5522",
              marginTop: "8px",
              display: "flex",
            }}
          >
            ▶ PLAY
          </div>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            display: "flex",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: pixelFont,
              fontSize: "13px",
              color: "#555566",
            }}
          >
            GAMES.ANDYCANTWIN.COM
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    }
  );
}
