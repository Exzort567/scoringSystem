import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";


export const metadata: Metadata = {
  title: "MM LNK 2025",
  description: "Scoring System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
