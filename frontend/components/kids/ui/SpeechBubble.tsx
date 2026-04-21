interface SpeechBubbleProps {
  text: string;
  subtext?: string;
  maxWidth?: number;
  size?: "sm" | "md";
  className?: string;
}

export function SpeechBubble({ text, subtext, maxWidth = 220, size = "md", className = "" }: SpeechBubbleProps) {
  const pad = size === "sm" ? "px-4 py-2" : "px-5 py-3";
  const ts  = size === "sm" ? "text-xs"   : "text-sm";
  return (
    <div className={`speech-bubble ${pad} text-center ${className}`} style={{ maxWidth }}>
      <p className={`font-black leading-snug text-ink ${ts}`}>{text}</p>
      {subtext && <p className="font-bold text-ink-faint text-[11px] leading-none mt-1">{subtext}</p>}
    </div>
  );
}
