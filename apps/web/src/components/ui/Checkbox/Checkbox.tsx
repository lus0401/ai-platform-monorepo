import { forwardRef } from "react";
import type { ElementRef } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { MdCheck } from "react-icons/md";
import styles from "./Checkbox.module.scss";

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    {
      checked,
      onCheckedChange,
      label,
      disabled = false,
      name,
      required = false,
      error = false,
      errorMessage,
      size = "md",
      className,
    },
    ref
  ) => {
    const wrapperClasses = [styles.checkboxWrapper, className]
      .filter(Boolean)
      .join(" ");

    const rootClasses = [
      styles.checkboxRoot,
      styles[`checkboxRoot--${size}`],
      error && styles["checkboxRoot--error"],
      disabled && styles["checkboxRoot--disabled"],
    ]
      .filter(Boolean)
      .join(" ");

    const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;

    return (
      <div className={wrapperClasses}>
        <div className={styles.checkboxContainer}>
          <CheckboxPrimitive.Root
            ref={ref}
            className={rootClasses}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            name={name}
            required={required}
          >
            <CheckboxPrimitive.Indicator className={styles.checkboxIndicator}>
              <MdCheck size={iconSize} />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>

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

        {error && errorMessage && (
          <span className={styles.errorMessage}>{errorMessage}</span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
