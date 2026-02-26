import { forwardRef } from "react";
import * as Select from "@radix-ui/react-select";
import { MdCheck, MdExpandMore } from "react-icons/md";
import styles from "./SelectBox.module.scss";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectBoxProps {
  width?: "full" | "half" | "third" | "quarter" | "auto";
  customWidth?: string; // e.g., "150px", "10rem"
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
}

const SelectBox = forwardRef<HTMLButtonElement, SelectBoxProps>(
  (
    {
      width = "full",
      customWidth,
      options,
      value,
      onValueChange,
      placeholder = "선택하세요",
      error = false,
      errorMessage,
      label,
      required = false,
      disabled = false,
      name,
    },
    ref
  ) => {
    const wrapperClasses = [
      styles.selectWrapper,
      !customWidth && styles[`selectWrapper--${width}`],
    ]
      .filter(Boolean)
      .join(" ");

    const triggerClasses = [
      styles.trigger,
      error && styles["trigger--error"],
      disabled && styles["trigger--disabled"],
    ]
      .filter(Boolean)
      .join(" ");

    const wrapperStyle = customWidth ? { width: customWidth } : undefined;

    return (
      <div className={wrapperClasses} style={wrapperStyle}>
        {label && (
          <label className={styles.label} htmlFor={name}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <Select.Root
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          name={name}
        >
          <Select.Trigger
            ref={ref}
            className={triggerClasses}
            aria-label={label || placeholder}
          >
            <Select.Value placeholder={placeholder} />
            <Select.Icon className={styles.icon}>
              <MdExpandMore size={20} />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              className={styles.content}
              position="popper"
              sideOffset={5}
            >
              <Select.Viewport className={styles.viewport}>
                {options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={styles.item}
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator className={styles.itemIndicator}>
                      <MdCheck size={16} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {error && errorMessage && (
          <span className={styles.errorMessage}>{errorMessage}</span>
        )}
      </div>
    );
  }
);

SelectBox.displayName = "SelectBox";

export default SelectBox;
