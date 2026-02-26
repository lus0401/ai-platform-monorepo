"use client";

import { type ReactNode } from "react";
import styles from "./MainContent.module.scss";

interface AppMainProps {
  children: ReactNode;
}

export default function AppMain({ children }: AppMainProps) {
  return (
    <main className={styles.appMain}>
      <div className={styles.mainContent}>{children}</div>
    </main>
  );
}

