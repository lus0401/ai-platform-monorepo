"use client";

import { forwardRef, useState } from "react";
import type { CSSProperties } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { MdCalendarToday } from "react-icons/md";
import styles from "./DatePicker.module.scss";
import "react-day-picker/dist/style.css";

export interface DatePickerProps {
  width?: "full" | "half" | "third" | "quarter" | "auto";
  customWidth?: string; // e.g., "200px", "15rem"
  mode?: "single" | "range";
  value?: Date | DateRange;
  onChange?: (date: Date | DateRange | undefined) => void;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  dateFormat?: string;
}

const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      width = "full",
      customWidth,
      mode = "single",
      value,
      onChange,
      placeholder = "날짜를 선택하세요",
      error = false,
      errorMessage,
      label,
      required = false,
      disabled = false,
      name,
      dateFormat = "yyyy-MM-dd",
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);

    const wrapperClasses = [
      styles.datePickerWrapper,
      !customWidth && styles[`datePickerWrapper--${width}`],
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

    const [tempRange, setTempRange] = useState<DateRange | undefined>();

    const handleSelect = (selectedDate: Date | undefined) => {
      if (mode === "single") {
        onChange?.(selectedDate);
        setIsOpen(false);
      } else {
        // range 모드 수동 관리
        if (!selectedDate) return;

        if (!tempRange?.from || (tempRange.from && tempRange.to)) {
          // 1. from이 없거나, from과 to가 모두 있으면 → from 새로 설정
          setTempRange({ from: selectedDate, to: undefined });
        } else if (tempRange.from && !tempRange.to) {
          // 2. from만 있고 to가 없으면
          if (selectedDate < tempRange.from) {
            // 역순이면 from을 새로운 날짜로 변경
            setTempRange({ from: selectedDate, to: undefined });
          } else {
            // 정순이면 to 설정
            setTempRange({ from: tempRange.from, to: selectedDate });
          }
        }
      }
    };

    const handleConfirm = () => {
      if (mode === "range") {
        onChange?.(tempRange);
        setIsOpen(false);
      }
    };

    const handleCancel = () => {
      setTempRange(value as DateRange | undefined);
      setIsOpen(false);
    };

    // Popover 열릴 때 임시 상태 초기화
    const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (open && mode === "range") {
        setTempRange(value as DateRange | undefined);
      }
    };

    const getDisplayValue = () => {
      if (!value) return "";

      if (mode === "single") {
        return format(value as Date, dateFormat, { locale: ko });
      } else {
        const range = value as DateRange;
        if (range.from) {
          if (range.to) {
            return `${format(range.from, dateFormat, {
              locale: ko,
            })} ~ ${format(range.to, dateFormat, { locale: ko })}`;
          }
          return format(range.from, dateFormat, { locale: ko });
        }
        return "";
      }
    };

    const displayValue = getDisplayValue();

    return (
      <div className={wrapperClasses} style={wrapperStyle}>
        {label && (
          <label className={styles.label} htmlFor={name}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
          <Popover.Trigger asChild>
            <button
              ref={ref}
              type="button"
              className={triggerClasses}
              disabled={disabled}
              aria-label={label || placeholder}
            >
              <span
                className={displayValue ? styles.value : styles.placeholder}
              >
                {displayValue || placeholder}
              </span>
              <MdCalendarToday className={styles.icon} size={18} />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className={styles.content}
              align="start"
              sideOffset={5}
            >
              {mode === "single" ? (
                <DayPicker
                  mode="single"
                  selected={value as Date}
                  onSelect={handleSelect}
                  locale={ko}
                  className={styles.calendar}
                  styles={{
                    root: {
                      "--rdp-accent-color": "var(--primary-500)",
                    } as CSSProperties,
                  }}
                />
              ) : (
                <>
                  <DayPicker
                    mode="single"
                    selected={tempRange?.from}
                    onSelect={handleSelect}
                    locale={ko}
                    className={styles.calendar}
                    styles={{
                      root: {
                        "--rdp-accent-color": "var(--primary-500)",
                      } as CSSProperties,
                    }}
                    modifiers={{
                      range_start: tempRange?.from ? [tempRange.from] : [],
                      range_end: tempRange?.to ? [tempRange.to] : [],
                      range_middle:
                        tempRange?.from && tempRange?.to
                          ? Array.from(
                              {
                                length:
                                  Math.ceil(
                                    (tempRange.to.getTime() -
                                      tempRange.from.getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  ) - 1,
                              },
                              (_, i) => {
                                const date = new Date(tempRange.from!);
                                date.setDate(date.getDate() + i + 1);
                                return date;
                              }
                            )
                          : [],
                    }}
                    modifiersClassNames={{
                      range_start: "rdp-day_range_start",
                      range_end: "rdp-day_range_end",
                      range_middle: "rdp-day_range_middle",
                    }}
                  />
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={handleCancel}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      className={styles.confirmBtn}
                      onClick={handleConfirm}
                    >
                      확인
                    </button>
                  </div>
                </>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {error && errorMessage && (
          <span className={styles.errorMessage}>{errorMessage}</span>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
