"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import SiteHead from "@/components/site-head";
import { usePathname } from "next/navigation";

interface AppLayoutProps {
  children: React.ReactNode;
  excludePaths: string[];
}

export function AppLayout({ children, excludePaths }: AppLayoutProps) {
  const pathname = usePathname();

  // 检查当前路径是否在排除列表中
  const isExcludedPath = React.useMemo(() => {
    return excludePaths.some((path) => pathname.startsWith(path));
  }, [pathname, excludePaths]);

  if (isExcludedPath) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar excludePaths={excludePaths} variant="inset" />
      <SidebarInset>
        <SiteHead />
        <div className="h-full pb-safe">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
