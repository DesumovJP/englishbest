import type { ReactNode } from "react";
import KidsFooter from "@/components/kids/KidsFooter";
import RotateHint from "@/components/kids/RotateHint";
import { KidsSettingsMenu } from "@/components/kids/KidsSettingsMenu";

export default function KidsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="toca">
      {children}
      <KidsSettingsMenu />
      <KidsFooter />
      <RotateHint />
    </div>
  );
}
