"use client";

import { MapPin, Shirt, Activity, Route, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type SceneInfo = Record<string, string>;

interface SceneInfoDisplayProps {
  sceneInfo: SceneInfo;
  isMobile: boolean;
}

/**
 * 场景信息展示组件
 * 桌面端：使用 Tooltip 悬停显示
 * 移动端：使用 Sheet 抽屉显示
 */
export function SceneInfoDisplay({ sceneInfo, isMobile }: SceneInfoDisplayProps) {
  const hasAny = [
    "场景",
    "服饰状态细节",
    "姿态动作",
    "事件信息提炼",
    "发情程度",
    "心动程度",
  ].some((k) => sceneInfo[k] && sceneInfo[k] !== "未提及");

  if (isMobile) {
    // 移动端：使用 Sheet
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            查看场景详情
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>场景信息</SheetTitle>
            <SheetDescription>
              当前场景的详细状态信息
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 p-6">
            {sceneInfo["场景"] !== "未提及" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span>场景</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">{sceneInfo["场景"]}</p>
              </div>
            )}
            {sceneInfo["服饰状态细节"] !== "未提及" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Shirt className="h-4 w-4 text-purple-500" />
                  <span>服饰</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">{sceneInfo["服饰状态细节"]}</p>
              </div>
            )}
            {sceneInfo["姿态动作"] !== "未提及" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span>动作</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">{sceneInfo["姿态动作"]}</p>
              </div>
            )}
            {sceneInfo["事件信息提炼"] !== "未提及" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Route className="h-4 w-4 text-amber-500" />
                  <span>事件</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">{sceneInfo["事件信息提炼"]}</p>
              </div>
            )}
            {sceneInfo["发情程度"] !== "未提及" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span>发情程度</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">{sceneInfo["发情程度"]}</p>
              </div>
            )}
            {sceneInfo["心动程度"] !== "未提及" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Sparkles className="h-4 w-4 text-rose-500" />
                  <span>心动程度</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">{sceneInfo["心动程度"]}</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // 桌面端：使用 Tooltip
  if (!hasAny) {
    // 桌面端且没有任何字段命中时，提供回退按钮打开明细
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">查看场景详情</Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[380px] max-w-[85vw]">
          <SheetHeader>
            <SheetTitle>场景信息</SheetTitle>
            <SheetDescription>当前场景的详细状态信息</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 p-4">
            <p className="text-sm text-muted-foreground">未检测到结构化的场景字段，但以下为原始解析结果：</p>
            <div className="space-y-2 text-sm">
              <div>场景：{sceneInfo["场景"] || "未提及"}</div>
              <div>服饰：{sceneInfo["服饰状态细节"] || "未提及"}</div>
              <div>动作：{sceneInfo["姿态动作"] || "未提及"}</div>
              <div>事件：{sceneInfo["事件信息提炼"] || "未提及"}</div>
              <div>发情度：{sceneInfo["发情程度"] || "未提及"}</div>
              <div>心动度：{sceneInfo["心动程度"] || "未提及"}</div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex gap-2 flex-wrap">
        {sceneInfo["场景"] !== "未提及" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-xs">场景</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{sceneInfo["场景"]}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {sceneInfo["服饰状态细节"] !== "未提及" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <Shirt className="h-3.5 w-3.5" />
                <span className="text-xs">服饰</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{sceneInfo["服饰状态细节"]}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {sceneInfo["姿态动作"] !== "未提及" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                <span className="text-xs">动作</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{sceneInfo["姿态动作"]}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {sceneInfo["事件信息提炼"] !== "未提及" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <Route className="h-3.5 w-3.5" />
                <span className="text-xs">事件</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{sceneInfo["事件信息提炼"]}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {sceneInfo["发情程度"] !== "未提及" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <Heart className="h-3.5 w-3.5 text-pink-500" />
                <span className="text-xs">发情度</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{sceneInfo["发情程度"]}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {sceneInfo["心动程度"] !== "未提及" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-xs">心动度</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{sceneInfo["心动程度"]}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

