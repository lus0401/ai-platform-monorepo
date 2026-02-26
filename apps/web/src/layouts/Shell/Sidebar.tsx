"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.scss";
import { sidebarRoutes, settingsRoute, type RouteItem } from "@/app-routes";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  const getLinkClass = (path: string) =>
    pathname === path ? `${styles.navItem} ${styles.selected}` : styles.navItem;

  const renderMenuItems = (items: RouteItem[]) => {
    return items.map((item) => (
      <Link key={item.path} href={item.path} className={getLinkClass(item.path)}>
        <div>
          <span>{item.label}</span>
        </div>
      </Link>
    ));
  };

  return (
    <div className={styles.sideBar} data-open={isOpen}>
      <nav>
        {sidebarRoutes.map((group, index) => (
          <div key={`group-${group.path}`}>
            {index > 0 && <hr />}
            <div className={styles.menuGroup}>
              <p className={styles.category}>{group.label}</p>
              {group.children && renderMenuItems(group.children)}
            </div>
          </div>
        ))}
      </nav>
      <div className={styles.settingWrp}>
        <Link
          href={settingsRoute.path}
          className={getLinkClass(settingsRoute.path)}
        >
          <div>
            <img
              src="/images/icon-setting.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden
            />
            <span>{settingsRoute.label}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
