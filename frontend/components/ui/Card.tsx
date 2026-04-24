import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "surface" | "elevated" | "outline" | "kids";
type Padding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
  interactive?: boolean;
}

const variantClasses: Record<Variant, string> = {
  surface: "bg-surface-raised border border-border rounded-card",
  elevated: "bg-surface-raised rounded-card shadow-card",
  outline: "bg-transparent border border-border rounded-card",
  kids: "bg-surface-raised rounded-3xl border-2 border-kid-border shadow-card-md",
};

const paddingClasses: Record<Padding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  variant = "surface",
  padding = "md",
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        interactive && "transition-shadow hover:shadow-card-md cursor-pointer",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-between gap-3 mb-3", className)} {...rest} />;
}

function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)} {...rest} />;
}

function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2 mt-4 pt-3 border-t border-border", className)} {...rest} />;
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
