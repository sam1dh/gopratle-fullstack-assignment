import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, icon, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center", !icon && "no-icon")}>
        {icon && (
          <span className="absolute left-[13px] w-[17px] h-[17px] text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground cursor-pointer",
            "appearance-none",
            "pr-[38px]",
            "transition-[border-color,box-shadow,background] duration-150",
            "hover:border-[#b9c1d2]",
            "focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon ? "pl-[41px]" : "pl-[14px]",
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238a93a8' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 13px center",
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
