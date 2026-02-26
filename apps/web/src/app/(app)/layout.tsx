"use client";

import { useState } from "react";
import { AppShellLayout, AppHeader, AppContent, AppSidebar, AppMain } from "@/layouts/Shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <AppShellLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <AppSidebar isOpen={sidebarOpen} />
      <AppContent>
        <AppHeader onToggleSidebar={toggleSidebar} isOpen={sidebarOpen} />
        <AppMain>{children}</AppMain>
      </AppContent>
    </AppShellLayout>
  );
}