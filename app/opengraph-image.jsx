import { ImageResponse } from "next/og";

export const alt = "The Arcade — NC politics, but you can play it.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Load fonts with timeout protection — Vercel builds can't always reach Google Fonts
  const fetchFont = async (url) => {
    try {
      const css = await fetch(url).then((res) => res.text());
      const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
      return match ? fetch(match[1]).then((res) => res.arrayBuffer()) : null;
    } catch {
      return null;
    }
  };

  const [bebasData, pixelData] = await Promise.all([
    fetchFont("https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"),
    fetchFont("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"),
  ]);

  const fonts = [];
  if (bebasData) fonts.push({ name: "BebasNeue", data: bebasData, style: "normal", weight: 400 });
  if (pixelData) fonts.push({ name: "PressStart2P", data: pixelData, style: "normal", weight: 400 });

  const displayFont = bebasData ? "BebasNeue, sans-serif" : "sans-serif";
  const pixelFont = pixelData ? "PressStart2P, monospace" : "monospace";

  const games = [
    { title: "EARN YOUR SEAT", color: "#E91E63", accent: "#ff8866", icon: "🏛️", tag: "GERRYMANDERING SIM" },
    { title: "NC TEACHER RUN", color: "#5c8a4c", accent: "#66bbdd", icon: "🏃", tag: "ENDLESS RUNNER" },
    { title: "DARK MONEY", color: "#aa3333", accent: "#ffcc44", icon: "💰", tag: "WHACK-A-MOLE" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #311B92 0%, #4A148C 50%, #C2185B 100%)",
        }}
      >
        {/* Decorative orange slash */}
        <div
          style={{
            position: "absolute",
            top: "-30%",
            right: "-10%",
            width: "60%",
            height: "160%",
            background: "#FF8A65",
            opacity: 0.08,
            transform: "rotate(-15deg)",
            display: "flex",
          }}
        />

        {/* Top bar — campaign style */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 48px",
            background: "rgba(31, 41, 51, 0.6)",
            borderBottom: "4px solid #E91E63",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
            <span
              style={{
                fontFamily: displayFont,
                fontSize: "36px",
                color: "#FFF8F0",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Andy Bowline
            </span>
            <span
              style={{
                fontFamily: pixelFont,
                fontSize: "11px",
                color: "#FF8A65",
              }}
            >
              NC SENATE 31
            </span>
          </div>
          <span
            style={{
              fontFamily: pixelFont,
              fontSize: "10px",
              color: "rgba(255, 248, 240, 0.5)",
              letterSpacing: "2px",
            }}
          >
            GAMES.ANDYCANTWIN.COM
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            padding: "0 48px",
            gap: "36px",
          }}
        >
          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontFamily: displayFont,
                fontSize: "120px",
                color: "#FFF8F0",
                textTransform: "uppercase",
                letterSpacing: "4px",
                textShadow: "6px 6px 0 rgba(0,0,0,0.3)",
                lineHeight: 1,
              }}
            >
              The Arcade
            </span>
            <span
              style={{
                fontFamily: pixelFont,
                fontSize: "14px",
                color: "rgba(255, 248, 240, 0.7)",
                letterSpacing: "1px",
              }}
            >
              NC POLITICS, BUT YOU CAN PLAY IT.
            </span>
          </div>

          {/* Game cards row */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            {games.map((game) => (
              <div
                key={game.title}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "rgba(10, 10, 26, 0.7)",
                  borderLeft: `5px solid ${game.color}`,
                  padding: "20px 28px",
                  gap: "8px",
                  width: "320px",
                }}
              >
                <span style={{ fontSize: "32px", display: "flex" }}>{game.icon}</span>
                <span
                  style={{
                    fontFamily: pixelFont,
                    fontSize: "13px",
                    color: game.accent,
                    textAlign: "center",
                    display: "flex",
                  }}
                >
                  {game.title}
                </span>
                <span
                  style={{
                    fontFamily: pixelFont,
                    fontSize: "8px",
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "2px",
                    display: "flex",
                  }}
                >
                  {game.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <span
            style={{
              fontFamily: pixelFont,
              fontSize: "11px",
              color: "rgba(255, 248, 240, 0.35)",
            }}
          >
            (YOU STILL CAN'T WIN.)
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
