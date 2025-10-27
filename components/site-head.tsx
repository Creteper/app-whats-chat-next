import { icons, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import ModeToggle from "./triggle-theme";
export default function SiteHead() {
  return (
    <header className="flex shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) justify-between">
      <h1 className="text-3xl font-semibold">欢迎回来</h1>
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
