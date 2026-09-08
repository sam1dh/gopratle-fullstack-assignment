import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoPratle — Requirement Posting",
  description: "Post event requirements for planners, performers, and crew.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
