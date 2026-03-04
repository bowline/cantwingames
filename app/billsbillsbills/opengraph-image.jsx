import { ImageResponse } from "next/og";

export const alt = "Bills Bills Bills — an unwinnable cost-of-living game";
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

  const bills = [
    { name: "RENT", cost: "$150", color: "#cc7733" },
    { name: "GROCERIES", cost: "$55", color: "#448866" },
    { name: "MEDICAL", cost: "$400", color: "#dd2222" },
    { name: "UTILITIES", cost: "$45", color: "#5588aa" },
    { name: "CHILDCARE", cost: "$180", color: "#dd7755" },
    { name: "INSURANCE", cost: "$140", color: "#cc6644" },
    { name: "MORTGAGE", cost: "$300", color: "#bb3344" },
    { name: "RX DRUGS", cost: "$120", color: "#bb5544" },
    { name: "TUITION", cost: "$350", color: "#cc3333" },
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
        {/* Scanline effect */}
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

        {/* === LEFT SIDE: Title + health bar + play button === */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "520px",
            padding: "40px",
            gap: "16px",
            position: "relative",
          }}
        >
          {/* Subtitle */}
          <div
            style={{
              fontFamily: pixelFont,
              fontSize: "10px",
              color: "#888899",
              letterSpacing: "3px",
              display: "flex",
            }}
          >
            — THE COST OF LIVING —
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
                fontSize: "36px",
                color: "#ff8866",
                textShadow: "4px 4px 0px #331a00",
                display: "flex",
              }}
            >
              BILLS
            </div>
            <div
              style={{
                fontFamily: pixelFont,
                fontSize: "36px",
                color: "#ffaa44",
                textShadow: "4px 4px 0px #332200",
                display: "flex",
              }}
            >
              BILLS
            </div>
            <div
              style={{
                fontFamily: pixelFont,
                fontSize: "36px",
                color: "#ffcc44",
                textShadow: "4px 4px 0px #333300",
                display: "flex",
              }}
            >
              BILLS
            </div>
          </div>

          {/* Health bar mock */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "340px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "24px",
                background: "#1a1a2a",
                border: "2px solid #333",
                borderRadius: "4px",
                position: "relative",
                display: "flex",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "35%",
                  height: "100%",
                  background: "#dd3333",
                  display: "flex",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: pixelFont,
                    fontSize: "10px",
                    color: "#fff",
                    display: "flex",
                  }}
                >
                  $347
                </span>
              </div>
            </div>
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
            HOW LONG CAN YOU SURVIVE?
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

        {/* === RIGHT SIDE: Bills bombardment scene === */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "680px",
            padding: "30px 40px 30px 20px",
            gap: "8px",
            position: "relative",
          }}
        >
          {/* Scene: house surrounded by bills */}
          <div
            style={{
              width: "580px",
              height: "440px",
              background: "radial-gradient(ellipse at center, #12122a 0%, #0a0a1a 100%)",
              borderRadius: "8px",
              border: "2px solid #222",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* Stars */}
            {[30, 80, 150, 220, 310, 400, 470, 520, 100, 350, 450, 250].map((x, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${x}px`,
                  top: `${((i * 71 + 23) % 400) + 20}px`,
                  width: `${i % 3 === 0 ? 3 : 2}px`,
                  height: `${i % 3 === 0 ? 3 : 2}px`,
                  background: "#fff",
                  borderRadius: "50%",
                  opacity: 0.2 + (i % 4) * 0.08,
                  display: "flex",
                }}
              />
            ))}

            {/* House in center */}
            <div
              style={{
                position: "absolute",
                left: "250px",
                top: "180px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Shield glow */}
              <div
                style={{
                  position: "absolute",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "3px solid #ffcc44",
                  opacity: 0.4,
                  top: "-10px",
                  left: "-10px",
                  display: "flex",
                }}
              />
              {/* Roof */}
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "35px solid transparent",
                  borderRight: "35px solid transparent",
                  borderBottom: "25px solid #cc5533",
                  display: "flex",
                }}
              />
              {/* Body */}
              <div
                style={{
                  width: "50px",
                  height: "40px",
                  background: "#ddcc88",
                  border: "2px solid #aa9955",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "22px",
                    background: "#664422",
                    display: "flex",
                  }}
                />
              </div>
            </div>

            {/* Bills scattered around */}
            {bills.map((bill, i) => {
              const angles = [30, 75, 120, 170, 210, 250, 290, 330, 5];
              const angle = angles[i] * (Math.PI / 180);
              const dist = 120 + (i % 3) * 50;
              const bx = 275 + Math.cos(angle) * dist;
              const by = 210 + Math.sin(angle) * dist;
              const rot = (i * 37 - 80) % 360;
              const isJumbo = bill.cost.replace("$", "") >= 300;
              const isMedium = !isJumbo && bill.cost.replace("$", "") >= 100;
              const w = isJumbo ? 100 : isMedium ? 80 : 60;
              const h = isJumbo ? 70 : isMedium ? 56 : 44;

              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${bx - w / 2}px`,
                    top: `${by - h / 2}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                    background: bill.color,
                    borderRadius: "6px",
                    border: "2px solid rgba(0,0,0,0.4)",
                    transform: `rotate(${rot}deg)`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: pixelFont,
                      fontSize: isJumbo ? "18px" : isMedium ? "14px" : "11px",
                      color: "#fff",
                      display: "flex",
                      textShadow: "1px 1px 0 rgba(0,0,0,0.5)",
                    }}
                  >
                    {bill.cost}
                  </span>
                  <span
                    style={{
                      fontFamily: pixelFont,
                      fontSize: "7px",
                      color: "rgba(255,255,255,0.7)",
                      display: "flex",
                      marginTop: "2px",
                    }}
                  >
                    {bill.name}
                  </span>
                </div>
              );
            })}

            {/* Paycheck */}
            <div
              style={{
                position: "absolute",
                left: "60px",
                top: "320px",
                width: "70px",
                height: "40px",
                background: "#ddaa33",
                borderRadius: "6px",
                border: "3px solid #aa8822",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: pixelFont,
                  fontSize: "12px",
                  color: "#fff",
                  display: "flex",
                }}
              >
                $200
              </span>
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
          <span
            style={{
              fontFamily: pixelFont,
              fontSize: "9px",
              color: "#555566",
            }}
          >
            SOURCES: BLS · CENSUS · KFF · ZILLOW 2024
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
