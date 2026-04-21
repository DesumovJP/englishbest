import type { ReactNode } from "react";
import KidsFooter from "@/components/kids/KidsFooter";
import RotateHint from "@/components/kids/RotateHint";

export default function KidsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="toca">
      {children}
      <KidsFooter />
      <RotateHint />
    </div>
  );
}
