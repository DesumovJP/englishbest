import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/session-context";
import { getSession } from "@/lib/auth-server";

const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  variable: "--font-nunito",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "EnglishBest — Уроки англійської онлайн",
    template: "%s · EnglishBest",
  },
  description:
    "Англійська для дітей, підлітків і дорослих. Живі уроки, ігрова мотивація, словничок і досягнення — від нуля до B2.",
  applicationName: "EnglishBest",
  appleWebApp: { title: "EnglishBest" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialSession = await getSession();
  return (
    <html lang="uk" className={nunito.variable}>
      <body className="min-h-dvh">
        <SessionProvider initialSession={initialSession}>{children}</SessionProvider>
      </body>
    </html>
  );
}
