import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import ModeToggle from "./triggle-theme";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef } from "react";
import { useAuth } from "./auth-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useElementVisibility } from "@/hooks/use-scroll-visibility";
import { FloatingTabBar } from "./floating-tabbar";
import { AnimatePresence } from "motion/react";

export default function SiteHead() {
  const params = useSearchParams();
  const { userInfo } = useAuth();
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const isHeaderVisible = useElementVisibility(
    headerRef as React.RefObject<HTMLElement>,
    0.1
  );

  // 使用 useMemo 计算标题，避免在 effect 中设置状态
  const { title, type } = useMemo(() => {
    return {
      title: params.get("title") || "欢迎回来",
      type: params.get("type") || "text",
    };
  }, [params]);

  return (
    <>
      <header
        ref={headerRef}
        className="flex shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) justify-between px-6 py-4"
      >
        <div className="flex items-center gap-2">
          {(type == "chat" || type == "settings") && (
            <Button
              size={"icon"}
              variant={"ghost"}
              className="size-10"
              onClick={() => router.back()}
            >
              <ArrowLeft className="size-5!" />
            </Button>
          )}

          {title && userInfo && (
            <h1 className="text-3xl font-semibold">
              {title + (type == "chat" ? "" : ", " + userInfo[0].user_name)}
            </h1>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <SidebarTrigger className="size-10" />
          <ModeToggle />
          <Button
            size={"icon"}
            variant={"ghost"}
            className="size-10"
            onClick={() =>
              router.push("/home/settings?title=设置&type=settings")
            }
          >
            <Settings className="size-5!" />
          </Button>
        </div>
      </header>

      {/* 移动端悬浮 tabbar */}
      <AnimatePresence mode="wait">
        {isMobile && !isHeaderVisible && <FloatingTabBar />}
      </AnimatePresence>
    </>
  );
}
