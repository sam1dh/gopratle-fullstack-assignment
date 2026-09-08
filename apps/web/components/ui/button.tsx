import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "submit";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius)] font-semibold text-[15px] tracking-[-0.01em] transition-all duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-75",
          "[&_.ic]:w-[17px] [&_.ic]:h-[17px]",
          variant === "default" &&
            "gradient-brand text-white shadow-[0_8px_20px_-8px_rgba(79,70,229,0.6)] hover:translate-y-[-1px] hover:shadow-[0_12px_26px_-8px_rgba(79,70,229,0.65)] active:translate-y-0",
          variant === "outline" &&
            "bg-white border border-border-strong text-foreground hover:border-[#b9c1d2] hover:bg-[#fafbfe]",
          variant === "ghost" &&
            "bg-white border border-border-strong text-foreground hover:border-[#b9c1d2] hover:bg-[#fafbfe]",
          variant === "destructive" &&
            "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          variant === "submit" &&
            "gradient-submit text-white shadow-[0_8px_20px_-8px_rgba(5,150,105,0.55)] hover:shadow-[0_12px_26px_-8px_rgba(5,150,105,0.6)]",
          size === "default" && "h-[47px] px-[22px]",
          size === "sm" && "h-9 px-3",
          size === "lg" && "h-[52px] px-8",
          size === "icon" && "h-[47px] w-[47px]",
          isLoading && "pointer-events-none",
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin-slow mr-2" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
