import "./globals.css";
import { Press_Start_2P } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata = {
  metadataBase: new URL("https://games.andycantwin.com"),
  title: "Andy Can't Win Games",
  description: "Mini games about democracy, gerrymandering, and what happens when politicians don't have to earn your vote.",
  openGraph: {
    title: "Andy Can't Win Games",
    description: "Mini games about democracy, gerrymandering, and what happens when politicians don't have to earn your vote.",
    url: "https://games.andycantwin.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={pixelFont.variable} style={{ scrollbarGutter: "stable" }}>
      <body style={{ margin: 0, background: "#0a0a1a", minHeight: "100vh" }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
