import { icons, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import ModeToggle from "./triggle-theme";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function SiteHead() {
  const params = useSearchParams();
  
  // 使用 useMemo 计算标题，避免在 effect 中设置状态
  const title = useMemo(() => {
    return params.get("title") || "欢迎回来";
  }, [params]);

  return (
    <header className="flex shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) justify-between">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <div className="flex gap-2 items-center">
        <SidebarTrigger className="size-10" />
        <ModeToggle />
        <Button size={"icon"} variant={"ghost"} className="size-10">
          <Settings className="size-5!" />
        </Button>
      </div>
    </header>
  );
}