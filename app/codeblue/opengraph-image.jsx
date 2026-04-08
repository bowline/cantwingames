import { ImageResponse } from "next/og";

export const alt = "Code Blue — same heart attack, different zip code";
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

  const levels = [
    { name: "URBAN", status: "♥ SURVIVED", time: "4 min", color: "#33ff66" },
    { name: "SUBURBAN", status: "♥ SURVIVED", time: "18 min", color: "#ffcc44" },
    { name: "RURAL", status: "✗ DECEASED", time: "-- min", color: "#ff4444" },
  ];

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
        {/* Scanlines */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 6px)",
            display: "flex",
          }}
        />

        {/* CRT vignette */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
            display: "flex",
          }}
        />

        {/* Left side: Title + road preview */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "520px",
            padding: "40px",
            gap: "20px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "42px",
              color: "#ff4444",
              textShadow: "4px 4px 0px #330000",
              display: "flex",
            }}
          >
            CODE BLUE
          </div>

          {/* Road with car */}
          <div
            style={{
              width: "180px",
              height: "200px",
              background: "#2a2a3a",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              borderLeft: "6px solid #0a2a0a",
              borderRight: "6px solid #0a2a0a",
            }}
          >
            {/* Lane dashes */}
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: `${i * 45 + 10}px`,
                  left: "50%",
                  marginLeft: "-2px",
                  width: "4px",
                  height: "25px",
                  background: "#5a5a7a",
                  display: "flex",
                }}
              />
            ))}
            {/* Car */}
            <div
              style={{
                width: "30px",
                height: "50px",
                background: "#ff8866",
                borderRadius: "4px 4px 2px 2px",
                position: "absolute",
                bottom: "30px",
                display: "flex",
              }}
            />
          </div>

          {/* Heart meter at 100% */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontFamily: pixelFont, fontSize: "20px", color: "#ff4444", display: "flex" }}>
              ♥
            </span>
            <div
              style={{
                width: "200px",
                height: "20px",
                background: "#1a1a2a",
                border: "2px solid #333",
                display: "flex",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, #ffcc44, #ff8866, #ff4444)",
                  display: "flex",
                }}
              />
            </div>
            <span style={{ fontFamily: pixelFont, fontSize: "12px", color: "#ff4444", display: "flex" }}>
              100%
            </span>
          </div>

          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "10px",
              color: "#ff4444",
              display: "flex",
              textAlign: "center",
            }}
          >
            NEAREST HOSPITAL: 47 MI
          </div>
        </div>

        {/* Right side: Results + tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "680px",
            padding: "40px 40px 40px 20px",
            gap: "24px",
          }}
        >
          {/* Results */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "#0d0d1a",
              border: "3px solid #1a1a2e",
              padding: "24px",
              borderRadius: "4px",
            }}
          >
            {levels.map((level, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: i < 2 ? "1px solid #1a1a2e" : "none",
                }}
              >
                <span style={{ fontFamily: pixelFont, fontSize: "14px", color: level.color, display: "flex", width: "140px" }}>
                  {level.name}
                </span>
                <span style={{ fontFamily: pixelFont, fontSize: "14px", color: level.color, display: "flex", width: "200px" }}>
                  {level.status}
                </span>
                <span style={{ fontFamily: pixelFont, fontSize: "14px", color: level.color, display: "flex" }}>
                  {level.time}
                </span>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontFamily: pixelFont, fontSize: "14px", color: "#ffffff", display: "flex" }}>
              Same heart attack. Same person.
            </span>
            <span style={{ fontFamily: pixelFont, fontSize: "12px", color: "#8888aa", display: "flex" }}>
              The only thing that changed
            </span>
            <span style={{ fontFamily: pixelFont, fontSize: "12px", color: "#8888aa", display: "flex" }}>
              was the zip code.
            </span>
          </div>

          {/* Play button */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
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
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "18px",
            left: 0, right: 0,
            display: "flex",
            justifyContent: "center",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <span style={{ fontFamily: pixelFont, fontSize: "9px", color: "#555566" }}>
            CDC · NC DHHS · AHA · CHARTIS
          </span>
          <span style={{ fontFamily: pixelFont, fontSize: "10px", color: "#555566" }}>
            GAMES.ANDYCANTWIN.COM
          </span>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
