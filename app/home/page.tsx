"use client";

import AgentCard from "@/components/agent-card";
import { useAuth } from "@/components/auth-provider";
import ErrorBoundary from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import CyberChatAPI from "@/lib/cyberchat";
import { AgentItems } from "@/types/agent";
import { useEffect, useState, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function HomePage() {
  const cyberChatApi = useRef(new CyberChatAPI());
  const { userInfo } = useAuth();
  const [aiList, setAiList] = useState<AgentItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 创建一个标志来跟踪组件是否已卸载
    let isMounted = true;

    async function getAIList() {
      // 确保 userInfo 存在且有数据
      if (!userInfo || userInfo.length === 0) {
        return;
      }

      try {
        const aiListResponse = await cyberChatApi.current.getAIList({
          ugroup: userInfo[0].group_type.toString(),
          nsfw: "0",
          type: "new",
          not_in: "",
        });
        setIsLoading(false);
        // 只有在组件仍然挂载时才更新状态
        if (isMounted) {
          if (aiListResponse.code === 200 || aiListResponse.data) {
            setAiList(aiListResponse.data);

          } else {
            setAiList([]);
          }
        }
      } catch (error: any) {
        // 忽略取消的请求错误
        if (isMounted) {
          toast.error(error.message)
          // 发生错误时设置为空数组
          setAiList([]);
        }
      }
    }

    getAIList();

    // 清理函数：组件卸载时设置标志
    return () => {
      isMounted = false;
    };
  }, [userInfo]);

  return (
    <>
      <h1 className="text-lg mb-4">发现新朋友</h1>

      {isLoading ? (
        <div>
          <Spinner className="h-5 w-5 mx-auto" />
          <div className="text-center py-8 text-gray-500">你的女友在来的路上</div>
        </div>
      ) : (
        <ErrorBoundary>
          {aiList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂未发现新朋友</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {aiList.map((agentItem, key) => {
                return (
                  <div key={key}>
                    <AgentCard agentItem={agentItem} />
                  </div>
                );
              })}
            </div>
          )}
        </ErrorBoundary>
      )}
    </>
  );
}
