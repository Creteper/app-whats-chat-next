"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import CreateNewAgentButton from "./create-new-agent";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useAuth } from "@/components/auth-provider";
import { usePathname } from "next/navigation";
import favicon from "@/public/favicon.png"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  excludePaths?: string[];
}

export default function AppSidebar({
  excludePaths = [],
  ...props
}: AppSidebarProps) {
  const { loginStatus } = useAuth();
  const pathname = usePathname();
  
  // 检查当前路径是否在排除列表中
  const isExcludedPath = React.useMemo(() => {
    return excludePaths.some(path => pathname.startsWith(path));
  }, [pathname, excludePaths]);

  // 如果在排除列表中，则不渲染 sidebar
  if (isExcludedPath) {
    return null;
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      className={cn("px-6", props.className)}
    >
      <SidebarHeader>
        <SidebarMenu>
          <div>
            <a
              href="#"
              className="w-full h-full flex items-center gap-2 flex-row"
            >
              <Image
                alt="WhatsChat"
                src={favicon}
                className="h-16 w-16"
                loading="eager"
              />
              <span className="text-xl font-semibold">Whats Chat</span>
            </a>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* 创建智能体按钮 */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <CreateNewAgentButton />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* 我的对话列表 */}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-full w-full items-center justify-center"></div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}