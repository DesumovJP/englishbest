import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  src?: string | null;
  name: string;
  size?: Size;
}

const sizeClasses: Record<Size, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-xl",
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ src, name, size = "md", className, ...rest }: AvatarProps) {
  return (
    <div
      aria-label={name}
      className={cn(
        "rounded-full flex items-center justify-center overflow-hidden font-bold bg-primary text-white flex-shrink-0",
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
