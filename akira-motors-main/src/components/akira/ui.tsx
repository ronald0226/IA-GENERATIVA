import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { sound } from "./engineSound";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-deep shadow-[0_8px_24px_-6px_var(--color-primary)] active:translate-y-0.5",
  dark: "bg-foreground text-background hover:opacity-90 active:translate-y-0.5",
  outline:
    "border-2 border-foreground/30 text-foreground hover:border-primary hover:text-primary active:translate-y-0.5 bg-background/50",
  cyber:
    "bg-primary text-primary-foreground hover:bg-primary-deep relative overflow-hidden shadow-[0_0_20px_-3px_var(--color-primary)] active:translate-y-0.5 font-display tracking-widest",
};

export function AkButton({
  variant = "primary",
  className,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button
      onClick={(e) => {
        sound.playMechanicalClick();
        onClick?.(e);
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-40 cursor-pointer clip-cyber-corner select-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function Eyebrow({
  children,
  kanji,
}: {
  children: ReactNode;
  kanji?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5 text-xs font-bold uppercase tracking-[0.25em] text-primary">
      <span className="h-0.5 w-6 bg-primary" />
      <span>{children}</span>
      {kanji && (
        <span className="text-[10px] tracking-normal font-sans text-muted-foreground opacity-80">
          [{kanji}]
        </span>
      )}
    </div>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-display text-[clamp(2.2rem,5vw,4.5rem)] font-black uppercase leading-[0.92] tracking-tight text-foreground",
        className
      )}
    >
      {children}
    </h2>
  );
}

/**
 * Cyberpunk tactical HUD corner brackets
 */
export function HudBracket({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <div className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-primary" />
      <div className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-primary" />
      <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-primary" />
      <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-primary" />
    </div>
  );
}
