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
import { usePathname, useRouter } from "next/navigation";
import favicon from "@/public/favicon.png";
import { Avatar } from "./ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { GetImgUrl } from "@/lib/cyberchat";
import { Button } from "./ui/button";
import { Compass, MessageSquare } from "lucide-react";
import { Kbd } from "./ui/kbd";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  excludePaths?: string[];
}

export default function AppSidebar({
  excludePaths = [],
  ...props
}: AppSidebarProps) {
  const { loginStatus, userInfo } = useAuth();
  const pathname = usePathname();
  const route = useRouter();
  const SIDEBAR_NAV_ITEMS = [
    {
      name: "发现新朋友",
      icon: <Compass />,
      href: "/home",
    },
    {
      name: "消息",
      icon: <MessageSquare />,
      href: "/home/message?title=消息",
    }
  ];
  // 检查当前路径是否在排除列表中
  const isExcludedPath = React.useMemo(() => {
    return excludePaths.some((path) => pathname.startsWith(path));
  }, [pathname, excludePaths]);

  // 如果在排除列表中，则不渲染 sidebar
  if (isExcludedPath) {
    return null;
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      className={cn("px-6!", props.className)}
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

        {/* 系统导航列表 */}
        <SidebarGroup>
          <SidebarMenu>
            {SIDEBAR_NAV_ITEMS.map((item, key) => (
              <SidebarMenuItem key={key}>
                <SidebarMenuButton
                  asChild
                  onClick={() => route.push(item.href)}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              onClick={() => route.push("/home/profile?title=个人中心")}
            >
              <div className="flex h-full w-full items-center gap-4 pb-2 select-none">
                <Avatar className="h-8 w-8">
                  {userInfo && userInfo.length > 0 ? (
                    <>
                      <AvatarImage
                        className="h-full w-full"
                        src={GetImgUrl(
                          "users",
                          "user_image-" + userInfo[0].id.toString(),
                          new Date()
                        )}
                        alt={userInfo[0].user_name}
                      />
                      <AvatarFallback>
                        {userInfo[0].user_name.substring(0, 2)}
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback>U</AvatarFallback>
                  )}
                </Avatar>
                <h1 className="text-md">{userInfo && userInfo[0].user_name}</h1>
                <Kbd>用户设置</Kbd>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
