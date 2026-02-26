import type { ReactNode } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import styles from "./Tabs.module.scss";

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

function Tabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  orientation = "horizontal",
  className,
}: TabsProps) {
  const rootClasses = [
    styles.tabsRoot,
    orientation === "vertical" && styles["tabsRoot--vertical"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <TabsPrimitive.Root
      className={rootClasses}
      defaultValue={defaultValue || tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      orientation={orientation}
    >
      <TabsPrimitive.List className={styles.tabsList}>
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={styles.tabsTrigger}
          >
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.value}
          value={tab.value}
          className={styles.tabsContent}
        >
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}

export default Tabs;
