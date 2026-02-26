import { type ReactNode } from "react";
import styles from "./AppContent.module.scss";

interface AppContentProps {
  children: ReactNode;
}

export default function AppContent({ children }: AppContentProps) {
  return <div className={styles.appContent}>{children}</div>;
}

