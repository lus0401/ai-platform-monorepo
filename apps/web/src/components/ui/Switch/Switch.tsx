import { forwardRef } from "react";
import type { ElementRef } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import styles from "./Switch.module.scss";

export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(
  (
    {
      checked,
      onCheckedChange,
      label,
      disabled = false,
      name,
      required = false,
      size = "md",
      className,
    },
    ref
  ) => {
    const wrapperClasses = [styles.switchWrapper, className]
      .filter(Boolean)
      .join(" ");

    const rootClasses = [
      styles.switchRoot,
      styles[`switchRoot--${size}`],
      disabled && styles["switchRoot--disabled"],
    ]
      .filter(Boolean)
      .join(" ");

    const thumbClasses = [styles.switchThumb, styles[`switchThumb--${size}`]]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClasses}>
        <div className={styles.switchContainer}>
          <SwitchPrimitive.Root
            ref={ref}
            className={rootClasses}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            name={name}
          >
            <SwitchPrimitive.Thumb className={thumbClasses} />
          </SwitchPrimitive.Root>

          {label && (
            <label
              className={styles.label}
              htmlFor={name}
              onClick={() => !disabled && onCheckedChange?.(!checked)}
            >
              {label}
              {required && <span className={styles.required}>*</span>}
            </label>
          )}
        </div>
      </div>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;
