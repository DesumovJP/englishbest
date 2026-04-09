import type { ReactNode } from "react";
import DemoBar from "@/components/atoms/DemoBar";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <DemoBar />
      {children}
    </div>
  );
}
