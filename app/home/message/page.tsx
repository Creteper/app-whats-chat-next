"use client";

import CyberChatAPI, { GetImgUrl } from "@/lib/cyberchat";
import { useAuth } from "@/components/auth-provider";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import ErrorBoundary from "@/components/error-boundary";
import { AiRecentItem } from "@/types/agent";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { useRouter } from "next/navigation";
 

export default function MessagePage() {
  const { userInfo } = useAuth();
  const cyberChatApi = useRef<CyberChatAPI>(new CyberChatAPI());
  const [recentChats, setRecentChats] = useState<AiRecentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const route = useRouter();
  useEffect(() => {
    async function getRecentChats() {
      if (userInfo) {
        setRecentChats(
          await cyberChatApi.current.getRecentChats(userInfo[0].uuid, "all")
        );
        setIsLoading(false);
      }
    }

    getRecentChats();
  }, [cyberChatApi, userInfo]);

  const handleResetChat = async (slid: string, name: string) => {
    if (!userInfo) return;
    const ok = window.confirm(`确认清空与“${name}”的聊天记录吗？此操作不可撤销。`);
    if (!ok) return;
    const success = await cyberChatApi.current.resetChatTag(userInfo[0].uuid, slid);
    if (success) {
      // 重新加载列表
      const list = await cyberChatApi.current.getRecentChats(userInfo[0].uuid, "all");
      setRecentChats(list);
    }
  };

  return (
    <div className="w-full h-full px-6">
      {isLoading ? (
        <div className="flex w-full h-full items-center justify-center">
          <Spinner />
          <span>加载聊天记录</span>
        </div>
      ) : (
        <ErrorBoundary>
          <div className="h-full w-full ">
            {recentChats.length > 0 ? (
              recentChats.map((item, key) => (
                <div
                  className="border border-border rounded-md w-full mt-2 px-4 py-3 flex items-center gap-3 hover:bg-accent active:bg-accent transition-colors"
                  key={key}
                >
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage
                      src={GetImgUrl(
                        "users",
                        "avatar_" + item.sl_id,
                        new Date(item.logtime)
                      )}
                    />
                    <AvatarFallback>{item.my_name}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 min-w-0 grow cursor-pointer" onClick={() => route.push(`/home/chat/${item.sl_id}?title=${item.my_name}&type=chat`)}>
                    <div className="text-md font-medium">{item.my_name}</div>
                    <div className="text-sm text-muted-foreground truncate min-w-0">
                      {item.my_content || "暂无消息"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.logtime).toLocaleDateString('zh-CN')}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleResetChat(item.sl_id, item.my_name); }}
                    >
                      清空
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>暂无聊天记录</EmptyTitle>
                </EmptyHeader>
                <EmptyDescription>去寻找你的 AI 朋友！</EmptyDescription>
                <EmptyContent>
                  <Button variant="outline" onClick={() => route.push("/home")}>
                    发现朋友
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
}
