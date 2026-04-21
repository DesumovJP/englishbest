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
  title: "EnglishBest — Learn English Online",
  description: "Fun, effective English learning for kids, teens, and adults.",
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
