import type { ReactNode } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { MdExpandMore } from "react-icons/md";
import styles from "./Accordion.module.scss";

export interface AccordionItem {
  value: string;
  title: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean; // single 모드에서 모두 닫을 수 있는지
  className?: string;
}

const Accordion = ({
  items,
  type = "single",
  defaultValue,
  value,
  onValueChange,
  collapsible = true,
  className,
}: AccordionProps) => {
  const rootClasses = [styles.accordion, className].filter(Boolean).join(" ");

  if (type === "single") {
    return (
      <AccordionPrimitive.Root
        type="single"
        className={rootClasses}
        defaultValue={defaultValue as string}
        value={value as string}
        onValueChange={onValueChange as (value: string) => void}
        collapsible={collapsible}
      >
        {items.map((item) => (
          <AccordionPrimitive.Item
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={styles.accordionItem}
          >
            <AccordionPrimitive.Header className={styles.accordionHeader}>
              <AccordionPrimitive.Trigger className={styles.accordionTrigger}>
                <span className={styles.accordionTitle}>{item.title}</span>
                <MdExpandMore className={styles.accordionIcon} size={24} />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className={styles.accordionContent}>
              <div className={styles.accordionContentInner}>
                {item.content}
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    );
  }

  return (
    <AccordionPrimitive.Root
      type="multiple"
      className={rootClasses}
      defaultValue={defaultValue as string[]}
      value={value as string[]}
      onValueChange={onValueChange as (value: string[]) => void}
    >
      {items.map((item) => (
        <AccordionPrimitive.Item
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className={styles.accordionItem}
        >
          <AccordionPrimitive.Header className={styles.accordionHeader}>
            <AccordionPrimitive.Trigger className={styles.accordionTrigger}>
              <span className={styles.accordionTitle}>{item.title}</span>
              <MdExpandMore className={styles.accordionIcon} size={24} />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className={styles.accordionContent}>
            <div className={styles.accordionContentInner}>{item.content}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
};

export default Accordion;

