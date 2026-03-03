import { ImageResponse } from "next/og";

export const alt = "Catch the Dark Money — a dark money awareness game";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontData = await fetch(
    "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
  )
    .then((res) => res.text())
    .then((css) => {
      const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
      return match ? fetch(match[1]).then((res) => res.arrayBuffer()) : null;
    });

  const fonts = fontData
    ? [{ name: "PressStart2P", data: fontData, style: "normal", weight: 400 }]
    : [];

  const pixelFont = fontData ? "PressStart2P, monospace" : "monospace";

  const pacColors = [
    "#cc4444", "#4a9e4a", "#dd8833",
    "#8866bb", "#66bbdd", "#dd6688",
    "#cc8833", "#5588aa", "#44aa66",
  ];

  const activeCells = [1, 3, 4, 7]; // Which cells show money bags

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

        {/* Dark money counter floating top-right */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 60,
            background: "#1a0a0a",
            border: "3px solid #aa3333",
            padding: "12px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: pixelFont,
              fontSize: "10px",
              color: "#aa4444",
              display: "flex",
              marginBottom: "4px",
            }}
          >
            DARK MONEY MOVED
          </span>
          <span
            style={{
              fontFamily: pixelFont,
              fontSize: "28px",
              color: "#ff4444",
              display: "flex",
            }}
          >
            $4.2M
          </span>
        </div>

        {/* MEGACORP label floating top-left */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontFamily: pixelFont,
              fontSize: "12px",
              color: "#aa4444",
              letterSpacing: "3px",
              display: "flex",
            }}
          >
            MEGACORP INC
          </span>
          <span
            style={{
              fontFamily: pixelFont,
              fontSize: "9px",
              color: "#666",
              display: "flex",
            }}
          >
            ⏱ 30 SECONDS
          </span>
        </div>

        {/* Center content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            padding: "40px 60px",
            background: "rgba(10, 10, 26, 0.92)",
            border: "4px solid #3a3a5a",
            position: "relative",
          }}
        >
          {/* Subtitle */}
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "12px",
              color: "#aa4444",
              letterSpacing: "4px",
              display: "flex",
            }}
          >
            — MEGACORP INC PRESENTS —
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
                fontSize: "48px",
                color: "#ffcc44",
                textShadow: "4px 4px 0px #332200",
                display: "flex",
              }}
            >
              CATCH THE
            </div>
            <div
              style={{
                fontFamily: pixelFont,
                fontSize: "48px",
                color: "#ff8844",
                textShadow: "4px 4px 0px #331a00",
                display: "flex",
              }}
            >
              DARK MONEY
            </div>
          </div>

          {/* Mini 3x3 grid preview */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              width: "240px",
              gap: "4px",
            }}
          >
            {Array.from({ length: 9 }).map((_, i) => {
              const isActive = activeCells.includes(i);
              return (
                <div
                  key={i}
                  style={{
                    width: "76px",
                    height: "52px",
                    background: isActive ? pacColors[i] : "#0d0d1a",
                    border: isActive ? "2px solid #fff" : "2px solid #1a1a2e",
                    borderRadius: "4px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isActive ? 0.85 : 1,
                  }}
                >
                  {isActive && (
                    <>
                      <span style={{ fontSize: "14px", display: "flex" }}>💰</span>
                      <span
                        style={{
                          fontFamily: pixelFont,
                          fontSize: "8px",
                          color: "#fff",
                          display: "flex",
                        }}
                      >
                        $250K
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "11px",
              color: "#8888aa",
              display: "flex",
            }}
          >
            CAN YOU KEEP UP?
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
              marginTop: "4px",
              display: "flex",
            }}
          >
            ▶ PLAY
          </div>
        </div>

        {/* Bottom: HB 237 citation */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            display: "flex",
            gap: "24px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: pixelFont,
              fontSize: "10px",
              color: "#555566",
            }}
          >
            BASED ON NC HB 237 · SIGNED 2024
          </span>
          <span
            style={{
              fontFamily: pixelFont,
              fontSize: "11px",
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
