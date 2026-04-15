import type { ReactNode } from "react";
import KidsFooter from "@/components/kids/KidsFooter";

export default function KidsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="toca">
      {children}
      <KidsFooter />
    </div>
  );
}
