import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  icon?: React.ReactNode;
  maxLength?: number;
  charCount?: number;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, icon, maxLength, charCount, ...props }, ref) => {
    return (
      <div className="relative flex items-start">
        {icon && (
          <span className="absolute left-[13px] top-[15px] w-[17px] h-[17px] text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
        <textarea
          ref={ref}
          maxLength={maxLength}
          className={cn(
            "w-full min-h-[118px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground placeholder:text-[#a6adbf] resize-y leading-[1.55]",
            "py-[13px] pr-[14px]",
            "transition-[border-color,box-shadow,background] duration-150",
            "hover:border-[#b9c1d2]",
            "focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon ? "pl-[41px]" : "pl-[14px]",
            className
          )}
          {...props}
        />
        {maxLength !== undefined && charCount !== undefined && (
          <span className="absolute right-3 bottom-[11px] text-xs text-muted-foreground bg-white/90 px-1 py-0.5 rounded-[6px]">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
