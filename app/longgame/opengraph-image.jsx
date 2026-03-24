import { ImageResponse } from "next/og";

export const alt = "The Leandro Long Game — 32 years of school funding gridlock";
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

  const pixelFont = fontData ? "PressStart2P, monospace" : "monospace";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a1a",
          display: "flex",
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
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 6px)",
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
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
            display: "flex",
          }}
        />

        {/* LEFT: Title + stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "550px",
            padding: "40px",
            gap: "20px",
            position: "relative",
          }}
        >
          {/* Presents */}
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "10px",
              color: "#886644",
              letterSpacing: "3px",
              display: "flex",
            }}
          >
            — CAN'T WIN GAMES —
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                fontFamily: pixelFont,
                fontSize: "36px",
                color: "#ffcc44",
                textShadow: "4px 4px 0px #332200",
                display: "flex",
              }}
            >
              THE LEANDRO
            </div>
            <div
              style={{
                fontFamily: pixelFont,
                fontSize: "36px",
                color: "#ff8844",
                textShadow: "4px 4px 0px #331a00",
                display: "flex",
              }}
            >
              LONG GAME
            </div>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "14px",
              color: "#8888aa",
              display: "flex",
            }}
          >
            32 YEARS. ONE COURT. YOUR VOTE.
          </div>

          {/* Stats box */}
          <div
            style={{
              background: "#1a1a2a",
              border: "3px solid #3a3a5a",
              padding: "14px 28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", gap: "40px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontFamily: pixelFont, fontSize: "28px", color: "#ffcc44", display: "flex" }}>$5.6B</span>
                <span style={{ fontFamily: pixelFont, fontSize: "8px", color: "#888899", display: "flex" }}>PLAN</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontFamily: pixelFont, fontSize: "28px", color: "#ff4444", display: "flex" }}>$0</span>
                <span style={{ fontFamily: pixelFont, fontSize: "8px", color: "#888899", display: "flex" }}>DELIVERED</span>
              </div>
            </div>
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
              display: "flex",
            }}
          >
            ▶ PLAY
          </div>
        </div>

        {/* RIGHT: Cave scene */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "650px",
            padding: "30px",
            position: "relative",
          }}
        >
          {/* Cave container */}
          <div
            style={{
              width: "580px",
              height: "480px",
              background: "#0d0806",
              borderRadius: "8px",
              border: "3px solid #3a2a1a",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Money at top */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontFamily: pixelFont, fontSize: "32px", color: "#ffdd44", display: "flex" }}>$</span>
              <span style={{ fontFamily: pixelFont, fontSize: "40px", color: "#ffee66", display: "flex" }}>$</span>
              <span style={{ fontFamily: pixelFont, fontSize: "28px", color: "#44dd44", display: "flex" }}>$</span>
            </div>
            <span style={{ fontFamily: pixelFont, fontSize: "10px", color: "#ffcc44", display: "flex" }}>$5.6B LEANDRO PLAN</span>

            {/* Rock layer */}
            <div
              style={{
                width: "100%",
                height: "200px",
                background: "#3a2a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <span style={{ fontFamily: pixelFont, fontSize: "12px", color: "#6a5a4a", display: "flex" }}>32 YEARS OF ROCK</span>
            </div>

            {/* Player */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "24px", height: "32px", background: "#ddaa77", borderRadius: "4px", display: "flex" }} />
              <span style={{ fontFamily: pixelFont, fontSize: "10px", color: "#aa8866", display: "flex" }}>YOU</span>
            </div>

            {/* Speech bubbles */}
            <div style={{ display: "flex", gap: "20px", position: "absolute", bottom: "80px", left: "20px", right: "20px" }}>
              <div
                style={{
                  background: "#2a2244",
                  border: "2px solid #6644aa",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  flex: 1,
                }}
              >
                <span style={{ fontFamily: pixelFont, fontSize: "7px", color: "#aa88dd", display: "flex" }}>LEGISLATURE</span>
                <span style={{ fontFamily: pixelFont, fontSize: "8px", color: "#ddddee", display: "flex" }}>WAITING ON COURTS</span>
              </div>
              <div
                style={{
                  background: "#1a2a3a",
                  border: "2px solid #4488aa",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  flex: 1,
                }}
              >
                <span style={{ fontFamily: pixelFont, fontSize: "7px", color: "#88bbdd", display: "flex" }}>COURT</span>
                <span style={{ fontFamily: pixelFont, fontSize: "8px", color: "#ddddee", display: "flex" }}>WAITING ON LEGISLATURE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "18px",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <span style={{ fontFamily: pixelFont, fontSize: "9px", color: "#555566" }}>
            LEANDRO V. STATE (1994)
          </span>
          <span style={{ fontFamily: pixelFont, fontSize: "10px", color: "#555566" }}>
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
