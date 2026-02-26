"use client";

import type {
  ReactNode,
  ButtonHTMLAttributes,
  MouseEvent,
} from "react";
import styles from "./Button.module.scss";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "color"> {
  text?: string;
  icon?: ReactNode;
  variant: "filled" | "outlined" | "light" | "ghost";
  size: "t" | "es" | "s" | "m" | "l" | "el" | "h";
  color: "primary" | "neutrals" | "info" | "success" | "warning" | "error";
  isRound?: boolean;
  /** @deprecated Prefer standard `onClick` */
  clickFn?: () => void;
}

export default function Button(props: ButtonProps) {
  const {
    text,
    icon,
    variant,
    size,
    color,
    isRound,
    disabled,
    clickFn,
    onClick,
    type = "button",
    className,
    ...rest
  } = props;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    clickFn?.();
    onClick?.(e);
  };

  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    styles[color],
    isRound ? styles.round : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={classNames}
      {...rest}
    >
      {icon}
      {text != null && text !== "" ? <span>{text}</span> : null}
    </button>
  );
}
