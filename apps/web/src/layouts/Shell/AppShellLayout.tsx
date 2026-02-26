import { type ReactNode } from "react";
import styles from "./AppShellLayout.module.scss";

interface AppShellLayoutProps {
  children: ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function AppShellLayout({
  children,
  sidebarOpen,
  setSidebarOpen,
}: AppShellLayoutProps) {
  return (
    <div className={styles.appShell} data-sidebar-open={sidebarOpen}>
      {children}
    </div>
  );
}

