import { ImageResponse } from "next/og";

export const alt = "The Care Trail — navigate the American healthcare system";
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

  const stops = [
    { num: 1, name: "SOMETHING FEELS WRONG", cost: "$50" },
    { num: 2, name: "THE DOCTOR'S OFFICE", cost: "$220" },
    { num: 3, name: "FINDING A SPECIALIST", cost: "$40" },
    { num: 4, name: "THE WAITING ROOM", cost: "$450" },
    { num: 5, name: "THE DIAGNOSIS", cost: "$280" },
    { num: 6, name: "THE BILL", cost: "$1,515" },
    { num: 7, name: "THE OTHER SIDE", cost: "???" },
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

        {/* Left side: Title + outcome */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "520px",
            padding: "40px",
            gap: "24px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "36px",
              color: "#33ff66",
              textShadow: "4px 4px 0px #003300",
              display: "flex",
            }}
          >
            THE CARE
          </div>
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "36px",
              color: "#33ff66",
              textShadow: "4px 4px 0px #003300",
              display: "flex",
              marginTop: "-12px",
            }}
          >
            TRAIL
          </div>

          {/* Death message */}
          <div
            style={{
              background: "#1a0a0a",
              border: "3px solid #aa3333",
              padding: "16px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontFamily: pixelFont,
                fontSize: "11px",
                color: "#ff4444",
                display: "flex",
                textAlign: "center",
              }}
            >
              YOU HAVE DIED OF A
            </span>
            <span
              style={{
                fontFamily: pixelFont,
                fontSize: "11px",
                color: "#ff4444",
                display: "flex",
                textAlign: "center",
              }}
            >
              PREVENTABLE CONDITION
            </span>
          </div>

          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "9px",
              color: "#8888aa",
              display: "flex",
              textAlign: "center",
            }}
          >
            NAVIGATE THE HEALTHCARE
          </div>
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "9px",
              color: "#8888aa",
              display: "flex",
              textAlign: "center",
              marginTop: "-16px",
            }}
          >
            SYSTEM. TRY NOT TO GO
          </div>
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "9px",
              color: "#8888aa",
              display: "flex",
              textAlign: "center",
              marginTop: "-16px",
            }}
          >
            BANKRUPT. (YOU WILL.)
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

        {/* Right side: Trail stops */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "680px",
            padding: "40px 40px 40px 20px",
            gap: "8px",
          }}
        >
          {stops.map((stop, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 16px",
                background: i === 5 ? "#2a0a0a" : "#0d0d1a",
                border: i === 5 ? "2px solid #aa3333" : "2px solid #1a1a2e",
                borderRadius: "4px",
              }}
            >
              <span
                style={{
                  fontFamily: pixelFont,
                  fontSize: "10px",
                  color: "#33ff66",
                  display: "flex",
                  minWidth: "24px",
                }}
              >
                {stop.num}.
              </span>
              <span
                style={{
                  fontFamily: pixelFont,
                  fontSize: "10px",
                  color: i === 5 ? "#ff4444" : "#33ff66",
                  display: "flex",
                  flex: "1",
                }}
              >
                {stop.name}
              </span>
              <span
                style={{
                  fontFamily: pixelFont,
                  fontSize: "10px",
                  color: i === 5 ? "#ff4444" : "#ff8866",
                  display: "flex",
                }}
              >
                {stop.cost}
              </span>
            </div>
          ))}
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
            BASED ON REAL NC HEALTHCARE DATA
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
