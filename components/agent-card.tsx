import { GetImgUrl } from "@/lib/cyberchat";
import { cn } from "@/lib/utils";
import { type AgentItems } from "@/types/agent";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import React, { useEffect, useRef } from "react";
import { getMiddleEllipsisText } from "@/lib/get-middle-ellipsis-text";

interface AgentCardProps extends React.ComponentProps<"div"> {
  agentItem: AgentItems;
}

export default function AgentCard({ agentItem, ...props }: AgentCardProps) {
  const isMobile = useIsMobile();
  const webBoRef = useRef<React.ComponentRef<"p">>(null);
  useEffect(() => {
    if (webBoRef.current == null) return;

    webBoRef.current.innerHTML = "";
    const font = window.getComputedStyle(webBoRef.current).font;
    const maxWitdh = webBoRef.current.offsetWidth;
    let weboText;
    if (isMobile) {
      weboText = "暂无 Whats 帖";
      if (agentItem.last_weibo) {
        weboText = agentItem.last_weibo;
      } else weboText = agentItem.sl_intro;
    } else {
      weboText = "暂无介绍";
      if (agentItem.sl_intro) weboText = agentItem.sl_intro;
    }
    webBoRef.current.innerHTML = getMiddleEllipsisText(
      weboText,
      maxWitdh,
      font
    );
  }, [agentItem, isMobile]);

  return (
    <div className="pb-4">
      <div
        className={cn(
          "border rounded-md shadow-sm transition-shadow",
          props.className
        )}
      >
        <div
          className={"w-full h-32 rounded-md bg-cover"}
          style={{
            backgroundImage: `url(${GetImgUrl(
              "users",
              "avatar_" + agentItem.sl_id,
              new Date(agentItem.create_time)
            )})`,
          }}
        >
          <div className="w-full h-full hover:bg-black/50 hover:backdrop-blur-sm transition-all rounded-md relative">
            {isMobile && (
              <Badge
                variant="default"
                className=" rounded-md absolute right-2 top-2"
              >
                <span className="text-xs">{agentItem.mask_relationship}</span>
              </Badge>
            )}

            <div className="w-full h-full flex flex-col p-4 gap-2 hover:opacity-100 opacity-0 transition-opacity">
              <div className="flex items-center gap-4">
                <Avatar className="size-10">
                  <AvatarImage
                    src={GetImgUrl(
                      "users",
                      "avatar_" + agentItem.sl_id,
                      new Date(agentItem.create_time)
                    )}
                  />
                  <AvatarFallback>{agentItem.nik_name}</AvatarFallback>
                </Avatar>
                <p className="text-xl">{agentItem.nik_name}</p>
              </div>
              <span className="text-xs text-ellipsis overflow-hidden">
                {agentItem.last_weibo ? agentItem.last_weibo : "未发布 Whats 帖"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-full flex flex-col justify-center pt-2 gap-2">
        <div className="max-w-full flex gap-1 flex-nowrap items-center">
          <Avatar>
            <AvatarImage
              src={GetImgUrl(
                "users",
                "avatar_" + agentItem.sl_id,
                new Date(agentItem.create_time)
              )}
            />
            <AvatarFallback>{agentItem.nik_name}</AvatarFallback>
          </Avatar>
          <h1 className="text-lg"></h1>
          <span className="text-sm text-ellipsis overflow-hidden text-nowrap bg-secondary text-foreground rounded-sm px-1 py-0.5">
            {agentItem.nik_name}
          </span>
          {isMobile == false && (
            <span className="text-sm text-ellipsis overflow-hidden text-nowrap bg-primary text-primary-foreground rounded-sm px-1 py-0.5">
              {agentItem.mask_relationship}
            </span>
          )}
        </div>
        {isMobile && (
          <p className="text-sm" data-slot="whats blog" ref={webBoRef}></p>
        )}
        {!isMobile && (
          <p className="text-sm" data-slot="desp" ref={webBoRef}></p>
        )}
      </div>
    </div>
  );
}
