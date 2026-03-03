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

  const pacs = [
    { short: "NC FREEDOM", color: "#cc4444", amt: "$50K" },
    { short: "LIBERTY FIRST", color: "#4a9e4a", amt: "$250K" },
    { short: "BRIGHTER NC", color: "#dd8833", amt: "$100K" },
    { short: "FUTURE NC", color: "#8866bb", amt: "$500K" },
    { short: "HEARTLAND", color: "#66bbdd", amt: "$75K" },
    { short: "RISING TIDE", color: "#dd6688", amt: "$750K" },
    { short: "SOVEREIGN", color: "#cc8833", amt: "$150K" },
    { short: "TAXPAYER DEF", color: "#5588aa", amt: "$25K" },
    { short: "HERITAGE NC", color: "#44aa66", amt: "$500K" },
  ];

  // Which cells are "active" (showing money bags)
  const active = [0, 2, 4, 5, 7];

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

        {/* === LEFT SIDE: Title + dark money counter + play button === */}
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
          {/* Megacorp presents */}
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "10px",
              color: "#aa4444",
              letterSpacing: "3px",
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
              gap: "6px",
            }}
          >
            <div
              style={{
                fontFamily: pixelFont,
                fontSize: "38px",
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
                fontSize: "32px",
                color: "#ff8844",
                textShadow: "4px 4px 0px #331a00",
                display: "flex",
              }}
            >
              DARK MONEY
            </div>
          </div>

          {/* Dark money counter — the emotional hook */}
          <div
            style={{
              background: "#1a0a0a",
              border: "3px solid #aa3333",
              padding: "14px 28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span
              style={{
                fontFamily: pixelFont,
                fontSize: "9px",
                color: "#aa4444",
                display: "flex",
                letterSpacing: "2px",
              }}
            >
              DARK MONEY MOVED
            </span>
            <span
              style={{
                fontFamily: pixelFont,
                fontSize: "36px",
                color: "#ff4444",
                display: "flex",
              }}
            >
              $4.2M
            </span>
            <span
              style={{
                fontFamily: pixelFont,
                fontSize: "8px",
                color: "#884444",
                display: "flex",
              }}
            >
              YOU CAUGHT: $127K
            </span>
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
              display: "flex",
            }}
          >
            ▶ PLAY
          </div>
        </div>

        {/* === RIGHT SIDE: 3x3 grid, big and readable === */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "680px",
            padding: "30px 40px 30px 20px",
            gap: "12px",
          }}
        >
          {/* Timer bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: "580px",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: pixelFont,
                fontSize: "14px",
                color: "#ff4444",
                display: "flex",
              }}
            >
              ⏱ 8s
            </span>
            <span
              style={{
                fontFamily: pixelFont,
                fontSize: "10px",
                color: "#666",
                display: "flex",
                letterSpacing: "2px",
              }}
            >
              MEGACORP INC
            </span>
            <span
              style={{
                fontFamily: pixelFont,
                fontSize: "12px",
                color: "#66aa66",
                display: "flex",
              }}
            >
              3/19
            </span>
          </div>

          {/* The 3x3 grid */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              width: "580px",
              gap: "6px",
              background: "#111122",
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            {pacs.map((pac, i) => {
              const isActive = active.includes(i);
              return (
                <div
                  key={i}
                  style={{
                    width: "184px",
                    height: "150px",
                    background: isActive ? pac.color : "#0d0d1a",
                    border: isActive ? "3px solid #fff" : "3px solid #1a1a2e",
                    borderRadius: "6px",
                    display: "flex",
                    position: "relative",
                    opacity: isActive ? 0.9 : 1,
                    overflow: "hidden",
                  }}
                >
                  {isActive ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                      <div style={{ fontSize: "28px", display: "flex" }}>💰</div>
                      <div
                        style={{
                          fontFamily: pixelFont,
                          fontSize: "24px",
                          color: "#fff",
                          display: "flex",
                          textShadow: "2px 2px 0px rgba(0,0,0,0.4)",
                          marginTop: "4px",
                        }}
                      >
                        {pac.amt}
                      </div>
                      <div
                        style={{
                          fontFamily: pixelFont,
                          fontSize: "8px",
                          color: "rgba(255,255,255,0.7)",
                          display: "flex",
                          marginTop: "6px",
                        }}
                      >
                        {pac.short}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                      <div
                        style={{
                          fontFamily: pixelFont,
                          fontSize: "8px",
                          color: "#222233",
                          display: "flex",
                        }}
                      >
                        · · ·
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
          <span
            style={{
              fontFamily: pixelFont,
              fontSize: "9px",
              color: "#555566",
            }}
          >
            BASED ON NC HB 237 · SIGNED 2024
          </span>
          <span
            style={{
              fontFamily: pixelFont,
              fontSize: "10px",
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
