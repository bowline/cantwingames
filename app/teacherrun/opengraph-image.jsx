import { ImageResponse } from "next/og";

export const alt = "NC Teacher Run — an endless runner with no good ending";
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

  // Obstacle cards scattered in the background
  const obstacles = [
    { icon: "🧊", label: "PAY FREEZE", color: "#66bbdd", x: 30, y: 60, rot: -5 },
    { icon: "💸", label: "VOUCHER BILL", color: "#dd6688", x: 880, y: 50, rot: 4 },
    { icon: "🛒", label: "$1,632 SUPPLIES", color: "#dd8833", x: 50, y: 410, rot: 6 },
    { icon: "🚪", label: "COLLEAGUE QUIT", color: "#778899", x: 860, y: 420, rot: -4 },
    { icon: "👥", label: "CLASS SIZE: 34", color: "#8866bb", x: 30, y: 240, rot: -3 },
    { icon: "🛑", label: "NO BUDGET AGAIN", color: "#cc3333", x: 870, y: 230, rot: 3 },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1a1a2e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Hallway floor tiles */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, #3a3a4a 0px, #3a3a4a 48px, #32323f 48px, #32323f 96px)",
            opacity: 0.3,
            display: "flex",
          }}
        />

        {/* Lane dividers */}
        <div
          style={{
            position: "absolute",
            left: "400px",
            top: 0,
            bottom: 0,
            width: "2px",
            borderLeft: "2px dashed rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "800px",
            top: 0,
            bottom: 0,
            width: "2px",
            borderLeft: "2px dashed rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />

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

        {/* Floating obstacle cards */}
        {obstacles.map((obs) => (
          <div
            key={obs.label}
            style={{
              position: "absolute",
              left: obs.x,
              top: obs.y,
              background: obs.color,
              border: "3px solid #000",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transform: `rotate(${obs.rot}deg)`,
              opacity: 0.45,
            }}
          >
            <span style={{ fontSize: "22px" }}>{obs.icon}</span>
            <span
              style={{
                fontFamily: pixelFont,
                fontSize: "11px",
                color: "#fff",
              }}
            >
              {obs.label}
            </span>
          </div>
        ))}

        {/* Center content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            padding: "44px 64px",
            background: "rgba(26, 26, 46, 0.94)",
            border: "4px solid #444",
            position: "relative",
          }}
        >
          {/* Top bar — finish line */}
          <div
            style={{
              display: "flex",
              gap: "0px",
              marginBottom: "4px",
            }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "20px",
                  height: "8px",
                  background: i % 2 === 0 ? "#ffcc44" : "#333",
                  display: "flex",
                }}
              />
            ))}
          </div>

          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "14px",
              color: "#ffcc44",
              letterSpacing: "3px",
              display: "flex",
              opacity: 0.7,
            }}
          >
            ▲ $72K NATIONAL AVG ▲
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
                fontSize: "54px",
                color: "#ffcc44",
                textShadow: "4px 4px 0px #332200",
                display: "flex",
              }}
            >
              NC TEACHER RUN
            </div>
            <div
              style={{
                fontFamily: pixelFont,
                fontSize: "13px",
                color: "#778",
                display: "flex",
              }}
            >
              AN ENDLESS RUNNER WITH NO GOOD ENDING
            </div>
          </div>

          {/* Stats line */}
          <div
            style={{
              display: "flex",
              gap: "40px",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontFamily: pixelFont,
                  fontSize: "24px",
                  color: "#ff8866",
                  display: "flex",
                }}
              >
                43RD
              </span>
              <span
                style={{
                  fontFamily: pixelFont,
                  fontSize: "9px",
                  color: "#888",
                  display: "flex",
                }}
              >
                IN TEACHER PAY
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontFamily: pixelFont,
                  fontSize: "24px",
                  color: "#ff8866",
                  display: "flex",
                }}
              >
                10K+
              </span>
              <span
                style={{
                  fontFamily: pixelFont,
                  fontSize: "9px",
                  color: "#888",
                  display: "flex",
                }}
              >
                TEACHERS LEFT
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontFamily: pixelFont,
                  fontSize: "24px",
                  color: "#ff8866",
                  display: "flex",
                }}
              >
                $58K
              </span>
              <span
                style={{
                  fontFamily: pixelFont,
                  fontSize: "9px",
                  color: "#888",
                  display: "flex",
                }}
              >
                AVG SALARY
              </span>
            </div>
          </div>

          {/* Play button */}
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "18px",
              color: "#fff",
              background: "#dd6644",
              padding: "14px 44px",
              borderTop: "4px solid #ee7755",
              borderLeft: "4px solid #ee7755",
              borderBottom: "4px solid #aa4422",
              borderRight: "4px solid #aa4422",
              marginTop: "8px",
              display: "flex",
            }}
          >
            ▶ TAP TO START
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
