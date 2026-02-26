import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./Input.module.scss";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  width?: "full" | "half" | "third" | "quarter";
  error?: boolean;
  errorMessage?: string;
  label?: string;
  required?: boolean;
  name?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      width = "full",
      error = false,
      errorMessage,
      label,
      required = false,
      className,
      disabled,
      type = "text",
      name = "",
      ...props
    },
    ref
  ) => {
    const wrapperClasses = [
      styles.inputWrapper,
      styles[`inputWrapper--${width}`],
    ]
      .filter(Boolean)
      .join(" ");

    const inputClasses = [
      styles.input,
      error && styles["input--error"],
      disabled && styles["input--disabled"],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClasses}>
        {label && (
          <label className={styles.label} htmlFor={name}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          disabled={disabled}
          aria-invalid={error}
          aria-required={required}
          name={name}
          {...props}
        />
        {error && errorMessage && (
          <span className={styles.errorMessage}>{errorMessage}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
