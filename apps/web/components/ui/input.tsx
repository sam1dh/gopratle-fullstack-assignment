import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, prefix, suffix, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center", icon === undefined && prefix === undefined && suffix === undefined && "no-icon")}>
        {icon && (
          <span className="absolute left-[13px] w-[17px] h-[17px] text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
        {prefix && (
          <span className="absolute left-[14px] text-[15px] font-semibold text-foreground/60 pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground placeholder:text-[#a6adbf]",
            "transition-[border-color,box-shadow,background] duration-150",
            "hover:border-[#b9c1d2]",
            "focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon ? "pl-[41px] pr-[14px]" : prefix ? "pl-[34px] pr-[14px]" : suffix ? "pl-[14px] pr-[52px]" : "px-[14px]",
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-[14px] text-[13px] font-semibold text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
