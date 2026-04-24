import type { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-col min-h-dvh">{children}</div>;
}
