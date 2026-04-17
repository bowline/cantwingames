import { ImageResponse } from "next/og";

export const alt = "Catch the Lame Duck — they lost, they're still voting";
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
  const pixel = fontData ? "PressStart2P, monospace" : "monospace";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(155deg, #1a0a2e 0%, #2a1048 100%)",
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* scanlines */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.14) 3px, rgba(0,0,0,0.14) 6px)",
            display: "flex",
          }}
        />

        {/* Left: scene with door and ducks */}
        <div
          style={{
            width: "500px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            gap: "24px",
            position: "relative",
          }}
        >
          {/* door sign */}
          <div
            style={{
              background: "#c9b787",
              padding: "10px 20px",
              border: "4px solid #241710",
              fontFamily: pixel,
              fontSize: "14px",
              color: "#241710",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span style={{ display: "flex" }}>NC SHORT SESSION</span>
            <span style={{ display: "flex", fontSize: "11px" }}>APRIL 21, 2026</span>
          </div>

          {/* door */}
          <div
            style={{
              width: "220px",
              height: "160px",
              background: "#3a2a1a",
              border: "8px solid #241710",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div style={{ width: "40%", height: "80%", border: "2px solid #5a4028", display: "flex" }} />
            <div style={{ width: "40%", height: "80%", border: "2px solid #5a4028", display: "flex", marginLeft: "8px" }} />
          </div>

          {/* three ducks in a row — one red-hat, one blue-hat, one plain */}
          <div style={{ display: "flex", gap: "24px", marginTop: "-20px" }}>
            {/* red hat lame duck */}
            <div style={{ display: "flex", position: "relative", width: "60px", height: "70px" }}>
              <div style={{
                position: "absolute", width: "34px", height: "8px", background: "#7a1a1a",
                top: "2px", left: "14px", borderRadius: "50%", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "30px", height: "14px", background: "#c62828",
                top: "0px", left: "16px", borderRadius: "14px 14px 0 0", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "14px", height: "4px", background: "#7a1a1a",
                top: "9px", left: "38px", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "36px", height: "32px", background: "#ffd23f",
                bottom: "8px", left: "10px", borderRadius: "50%", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "22px", height: "22px", background: "#ffd23f",
                top: "14px", left: "22px", borderRadius: "50%", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "4px", height: "4px", background: "#1a1a1a",
                top: "20px", left: "34px", borderRadius: "50%", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "14px", height: "6px", background: "#ff8a00",
                top: "22px", left: "42px", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "6px", height: "16px", background: "#c62828",
                bottom: "10px", left: "28px", display: "flex", clipPath: "polygon(50% 0, 0 100%, 100% 100%)",
              }} />
            </div>

            {/* blue hat lame duck */}
            <div style={{ display: "flex", position: "relative", width: "60px", height: "70px" }}>
              <div style={{
                position: "absolute", width: "34px", height: "8px", background: "#0f2f70",
                top: "2px", left: "14px", borderRadius: "50%", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "30px", height: "14px", background: "#1e4fa8",
                top: "0px", left: "16px", borderRadius: "14px 14px 0 0", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "14px", height: "4px", background: "#0f2f70",
                top: "9px", left: "38px", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "36px", height: "32px", background: "#ffd23f",
                bottom: "8px", left: "10px", borderRadius: "50%", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "22px", height: "22px", background: "#ffd23f",
                top: "14px", left: "22px", borderRadius: "50%", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "4px", height: "4px", background: "#1a1a1a",
                top: "20px", left: "34px", borderRadius: "50%", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "14px", height: "6px", background: "#ff8a00",
                top: "22px", left: "42px", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "6px", height: "16px", background: "#c62828",
                bottom: "10px", left: "28px", display: "flex", clipPath: "polygon(50% 0, 0 100%, 100% 100%)",
              }} />
            </div>

            {/* plain working duck */}
            <div style={{ display: "flex", position: "relative", width: "60px", height: "70px" }}>
              <div style={{
                position: "absolute", width: "36px", height: "32px", background: "#ffd23f",
                bottom: "8px", left: "10px", borderRadius: "50%", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "22px", height: "22px", background: "#ffd23f",
                top: "14px", left: "22px", borderRadius: "50%", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "4px", height: "4px", background: "#1a1a1a",
                top: "20px", left: "34px", borderRadius: "50%", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "14px", height: "6px", background: "#ff8a00",
                top: "22px", left: "42px", display: "flex",
              }} />
              <div style={{
                position: "absolute", width: "6px", height: "16px", background: "#c62828",
                bottom: "10px", left: "28px", display: "flex", clipPath: "polygon(50% 0, 0 100%, 100% 100%)",
              }} />
            </div>
          </div>
        </div>

        {/* Right: title + copy */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "40px 60px 40px 20px",
            gap: "28px",
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: "12px",
              color: "#e8556d",
              letterSpacing: "3px",
              display: "flex",
            }}
          >
            NC GENERAL ASSEMBLY
          </div>

          <div
            style={{
              fontFamily: pixel,
              fontSize: "58px",
              color: "#ffd23f",
              textShadow: "4px 4px 0 #c62828",
              lineHeight: 1.1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ display: "flex" }}>CATCH THE</span>
            <span style={{ display: "flex" }}>LAME DUCK</span>
          </div>

          <div
            style={{
              fontFamily: "sans-serif",
              fontSize: "26px",
              color: "#ffffff",
              lineHeight: 1.3,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ display: "flex" }}>8 legislators lost their primaries.</span>
            <span style={{ display: "flex", color: "#e8556d", marginTop: "6px" }}>
              They still vote until January.
            </span>
          </div>

          <div
            style={{
              fontFamily: pixel,
              fontSize: "13px",
              color: "#c5b5d9",
              letterSpacing: "2px",
              display: "flex",
            }}
          >
            30 SECONDS · NO WINNERS
          </div>
        </div>

        {/* bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "18px",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span style={{ fontFamily: pixel, fontSize: "10px", color: "#6a4a8a" }}>
            GAMES.ANDYCANTWIN.COM/LAMEDUCK
          </span>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
