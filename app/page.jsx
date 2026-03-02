import Link from "next/link";

const PIXEL_FONT = `var(--font-pixel), "Press Start 2P", monospace`;

const games = [
  {
    slug: "earnyourseat",
    title: "EARN YOUR SEAT",
    description: "You're a state senator in a gerrymandered district. Try to represent your voters.",
    icon: "🏛️",
  },
];

export default function Home() {
  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "0 auto",
        padding: "40px 20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontFamily: PIXEL_FONT,
            fontSize: "16px",
            color: "#ff8866",
            margin: "0 0 8px 0",
            lineHeight: 1.6,
            textShadow: "3px 3px 0px #331a11",
          }}
        >
          ANDY CAN'T WIN
        </h1>
        <div
          style={{
            fontFamily: PIXEL_FONT,
            fontSize: "9px",
            color: "#ffaa44",
            textShadow: "2px 2px 0px #332211",
          }}
        >
          GAMES
        </div>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
        {games.map((game) => (
          <Link
            key={game.slug}
            href={`/${game.slug}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: "#1a1a2a",
                border: "4px solid #3a3a5a",
                borderBottom: "4px solid #2a2a3a",
                borderRight: "4px solid #2a2a3a",
                padding: "16px",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "24px" }}>{game.icon}</span>
                <div>
                  <div
                    style={{
                      fontFamily: PIXEL_FONT,
                      fontSize: "10px",
                      color: "#ffaa44",
                      marginBottom: "6px",
                    }}
                  >
                    {game.title}
                  </div>
                  <div
                    style={{
                      fontFamily: PIXEL_FONT,
                      fontSize: "7px",
                      color: "#8888aa",
                      lineHeight: 1.6,
                    }}
                  >
                    {game.description}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontFamily: PIXEL_FONT,
                  fontSize: "7px",
                  color: "#33ff66",
                  textAlign: "right",
                  marginTop: "8px",
                }}
              >
                ▶ PLAY
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div
        style={{
          fontFamily: PIXEL_FONT,
          fontSize: "6px",
          color: "#555566",
          textAlign: "center",
          lineHeight: 1.8,
        }}
      >
        NC SENATE · DISTRICT 31
        <br />
        <a
          href="https://andycantwin.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#66aaff", textDecoration: "none" }}
        >
          ANDYCANTWIN.COM
        </a>
      </div>
    </div>
  );
}
