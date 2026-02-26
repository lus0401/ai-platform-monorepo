"use client";

import { ReactNode, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.scss";
import Button from "@/components/ui/Button/Button";
import { sidebarRoutes } from "@/app-routes";
import { useApiMode } from "@/contexts/ApiModeContext";
import { useTheme } from "@/hooks/useTheme";
import { appConfig } from "@/common/config";

interface HeaderProps {
  onToggleSidebar: () => void;
  isOpen?: boolean;
}

function Icon({ src, alt = "" }: { src: string; alt?: string }) {
  return (
    <img src={src} alt={alt} width={20} height={20} className={styles.iconImg} />
  );
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const { isMockMode, toggleApiMode } = useApiMode();
  const { isDark, toggleTheme } = useTheme();

  const [logoError, setLogoError] = useState(false);

  const breadcrumbInfo = useMemo(() => {
    const currentPath = pathname;

    for (const group of sidebarRoutes) {
      if (group.children) {
        const matchedChild = group.children.find(
          (child) => currentPath === child.path || currentPath.startsWith(child.path + "/")
        );
        if (matchedChild) {
          return {
            groupLabel: group.label || "",
            menuLabel: matchedChild.label || "",
          };
        }
      }
    }

    return { groupLabel: "", menuLabel: "" };
  }, [pathname]);

  const showLogo = Boolean(appConfig.companyLogoUrl) && !logoError;

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <div>
          <Button
            icon={<Icon src="/images/icon-square_arrow_left.svg" />}
            variant="ghost"
            size="m"
            color="neutrals"
            clickFn={onToggleSidebar}
          />
          <div className={styles.service}>
            <Icon src="/images/symbol-fw.svg" alt={appConfig.name} />
            <Button
              icon={<Icon src="/images/icon-selector.svg" />}
              variant="ghost"
              size="t"
              color="neutrals"
            />
          </div>
        </div>
        <nav className={styles.breadcrumb}>
          <ol>
            <li>
              {showLogo ? (
                <img
                  src={appConfig.companyLogoUrl}
                  alt={appConfig.name}
                  className={styles.companyLogo}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className={styles.appName}>{appConfig.name}</span>
              )}
              <Icon src="/images/icon-chevron_right.svg" />
            </li>
            {breadcrumbInfo.groupLabel && (
              <li>
                <span>{breadcrumbInfo.groupLabel}</span>
                <Icon src="/images/icon-chevron_right.svg" />
              </li>
            )}
            {breadcrumbInfo.menuLabel && (
              <li>
                <span>{breadcrumbInfo.menuLabel}</span>
              </li>
            )}
          </ol>
        </nav>
      </div>
      <div className={styles.headerRight}>
        <div className={styles.apiModeToggle}>
          <span className={styles.apiModeLabel}>
            {isMockMode ? "Mock" : "API"}
          </span>
          <button
            className={`${styles.toggleSwitch} ${!isMockMode ? styles.active : ""}`}
            onClick={toggleApiMode}
            title={isMockMode ? "실제 API로 전환" : "목데이터로 전환"}
            type="button"
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
        <div className={styles.apiModeToggle}>
          <span className={styles.apiModeLabel}>
            {isDark ? "Dark" : "Light"}
          </span>
          <button
            className={`${styles.toggleSwitch} ${isDark ? styles.active : ""}`}
            onClick={toggleTheme}
            title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            type="button"
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
        <div className={styles.divider} />
        <DropdownButton variant="list" icon={<Icon src="/images/icon-bell.svg" />} />
        <DropdownButton variant="navlink" icon={<Icon src="/images/icon-bookmarks.svg" />} />
        <Button
          icon={<Icon src="/images/icon-help_circle.svg" />}
          variant="ghost"
          size="s"
          color="neutrals"
        />
        <DropdownButton variant="user" />
      </div>
    </div>
  );
}

interface DropdownButtonProps {
  variant: string;
  icon?: ReactNode;
}

function DropdownButton({ variant, icon }: DropdownButtonProps) {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className={styles.dropdownButton}>
      {variant === "user" ? (
        <button
          className={styles.avatar}
          onClick={() => setOpen(!isOpen)}
          type="button"
        >
          <span>길동</span>
        </button>
      ) : (
        <Button
          icon={icon}
          variant="ghost"
          size="s"
          color="neutrals"
          clickFn={() => setOpen(!isOpen)}
        />
      )}
      {variant === "alarm" && <span className={styles.badge}>1</span>}
      <div className={`${styles.dropdown} ${isOpen ? styles.open : ""}`}>
        {variant === "user" && (
          <div className={styles.userInfo}>
            <span>로그인 정보</span>
            <p>james@site.com</p>
          </div>
        )}
        <div className={styles.options}>
          {variant === "navlink" && (
            <Link href="/bookmarks" onClick={() => setOpen(false)}>
              <span>북마크1</span>
              <Icon src="/images/icon-chevron_right.svg" />
            </Link>
          )}
          {(variant === "user" || variant === "button") && (
            <button type="button">
              <span>로그아웃</span>
              <Icon src="/images/icon-chevron_right.svg" />
            </button>
          )}
          {variant === "list" && (
            <>
              <div>
                <span>Error1</span>
              </div>
              <div>
                <span>Error2</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
