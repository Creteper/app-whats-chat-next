"use client";

import AgentCard from "@/components/agent-card";
import { useAuth } from "@/components/auth-provider";
import ErrorBoundary from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import CyberChatAPI from "@/lib/cyberchat";
import { AgentItems } from "@/types/agent";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const cyberChatApi = useRef(new CyberChatAPI());
  const { userInfo } = useAuth();
  const router = useRouter();
  const [hotRecommendations, setHotRecommendations] = useState<AgentItems[]>([]);
  const [aiList, setAiList] = useState<AgentItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNSFW, setIsNSFW] = useState(0);
  
  // 用于存储已加载的 sl_id
  const loadedIds = useRef<string[]>([]);

  // 用于懒加载的引用
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);
  
  // 单项入场动画（基于可视区域触发，兼容懒加载追加）
  const getItemAnimation = (index: number) => {
    // 将延迟限制在一个较小范围内，避免懒加载后索引很大导致长时间等待
    // 按每行/每批分组取模（例如 6 个为一组），并设置最大延迟上限
    const perGroup = 6; // 每组多少个卡片（可根据列数调整）
    const delay = Math.min((index % perGroup) * 0.05, 0.2);
    return {
      initial: { opacity: 0, y: 10 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.15 },
      transition: { duration: 0.25, delay, ease: [0.4, 0, 0.2, 1] as const },
    } as const;
  };

  // 获取AI列表的函数
  const fetchAIList = async (page: number = 1, isHotRecommendation: boolean = false, nsfw: number = 0) => {
    // 确保 userInfo 存在且有数据
    if (!userInfo || userInfo.length === 0) {
      return { data: [], hasMore: false };
    }

    try {
      // 构建 not_in 参数，格式为：,'id1','id2','id3'
      const notInParam = loadedIds.current.length > 0 
        ? ",'" + loadedIds.current.join("','") + "'" 
        : "";
      
      // 构建 type 参数 (new1, new2, new3...)
      const typeParam = page === 1 ? "new" : `new${page}`;
      
      const aiListResponse = await cyberChatApi.current.getAIList({
        ugroup: userInfo[0].group_type.toString(),
        nsfw: nsfw.toString(),
        type: typeParam,
        not_in: notInParam,
      });
      
      if (aiListResponse.code === 200 || aiListResponse.data) {
        // 如果是获取热门推荐，只需要前6个
        if (isHotRecommendation) {
          const hotData = aiListResponse.data.slice(0, 6);
          const hotIds = hotData.map(item => item.sl_id);
          loadedIds.current = [...loadedIds.current, ...hotIds];
          return { 
            data: hotData, 
            hasMore: aiListResponse.data.length > 6 
          };
        }
        
        // 更新已加载的 ID 列表
        const newIds = aiListResponse.data.map(item => item.sl_id);
        loadedIds.current = [...loadedIds.current, ...newIds];
        
        return { 
          data: aiListResponse.data, 
          hasMore: aiListResponse.data.length > 0 
        };
      } else {
        return { data: [], hasMore: false };
      }
    } catch (error: any) {
      toast.error(error.message);
      return { data: [], hasMore: false };
    }
  };

  // 初始加载
  useEffect(() => {
    // 创建一个标志来跟踪组件是否已卸载
    let isMounted = true;

    const getInitialAIList = async () => {
      if (!userInfo || userInfo.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // 获取热门推荐数据
        const hotResult = await fetchAIList(1, true, 1);
        // 获取发现新朋友的数据
        const discoverResult = await fetchAIList(1, false, 0);
        
        // 只有在组件仍然挂载时才更新状态
        if (isMounted) {
          setHotRecommendations(hotResult.data);
          setAiList(discoverResult.data);
          setHasMore(discoverResult.hasMore);
          setCurrentPage(1);
          setIsLoading(false);
        }
      } catch (error: any) {
        if (isMounted) {
          toast.error(error.message);
          setHotRecommendations([]);
          setAiList([]);
          setIsLoading(false);
        }
      }
    };

    getInitialAIList();

    // 清理函数：组件卸载时设置标志
    return () => {
      isMounted = false;
    };
  }, [userInfo]);

  // 懒加载实现
  const loadMoreData = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const result = await fetchAIList(nextPage, false);
      
      if (result.data.length > 0) {
        setAiList(prev => [...prev, ...result.data]);
        setCurrentPage(nextPage);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, userInfo]);

  // 设置交叉观察器实现懒加载
  useEffect(() => {
    if (isLoading) return;
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        loadMoreData();
      }
    }, {
      rootMargin: "100px" // 提前100px触发加载
    });

    if (lastItemRef.current) {
      observer.current.observe(lastItemRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
    };
  }, [isLoading, hasMore, isLoadingMore, loadMoreData]);

  return (
    <div className="px-6">
      {/* 热门推荐部分 */}
      <h1 className="text-lg mb-4">❤️ 禁止孤独的季节！🍂</h1>
      {isLoading ? (
        <div>
          <Spinner className="h-5 w-5 mx-auto" />
          <div className="text-center py-8 text-gray-500">
            加载热门推荐中...
          </div>
        </div>
      ) : (
        <ErrorBoundary>
          {hotRecommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无热门推荐</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {hotRecommendations.map((agentItem, key) => (
                <motion.div
                  key={key}
                  initial={getItemAnimation(key).initial}
                  whileInView={getItemAnimation(key).whileInView}
                  viewport={getItemAnimation(key).viewport}
                  transition={getItemAnimation(key).transition}
                  onClick={() => router.push(`/home/agent/${agentItem.sl_id}?title=${agentItem.nik_name}&type=chat`)}
                  className="cursor-pointer"
                >
                  <AgentCard agentItem={agentItem} />
                </motion.div>
              ))}
            </div>
          )}
        </ErrorBoundary>
      )}

      {/* 发现新朋友部分 */}
      <div className="flex items-center justify-between mt-8 mb-4">
        <h1 className="text-lg">发现新朋友</h1>
        {!isLoading && (
          <Button
            size={"sm"}
            variant={"ghost"}
            onClick={() => {}}
          >
            查看全部
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
      {isLoading ? (
        <div>
          <Spinner className="h-5 w-5 mx-auto" />
          <div className="text-center py-8 text-gray-500">
            你的friends在来的路上
          </div>
        </div>
      ) : (
        <ErrorBoundary>
          <>
            {aiList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂未发现新朋友</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {aiList.map((agentItem, key) => {
                    const anim = getItemAnimation(key);
                    // 为最后一个元素添加引用以实现懒加载
                    if (key === aiList.length - 1) {
                      return (
                      <motion.div
                          ref={lastItemRef}
                          key={key}
                          initial={anim.initial}
                          whileInView={anim.whileInView}
                          viewport={anim.viewport}
                          transition={anim.transition}
                        onClick={() => router.push(`/home/agent/${agentItem.sl_id}?title=${agentItem.nik_name}&type=chat`)}
                        className="cursor-pointer"
                        >
                          <AgentCard agentItem={agentItem} />
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={key}
                        initial={anim.initial}
                        whileInView={anim.whileInView}
                        viewport={anim.viewport}
                        transition={anim.transition}
                        onClick={() => router.push(`/home/agent/${agentItem.sl_id}?title=${agentItem.nik_name}&type=chat`)}
                        className="cursor-pointer"
                      >
                        <AgentCard agentItem={agentItem} />
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* 加载指示器 */}
                {isLoadingMore && (
                  <div className="flex justify-center mt-6">
                    <Spinner className="h-5 w-5" />
                  </div>
                )}
                
                {!hasMore && aiList.length > 0 && (
                  <div className="text-center py-4 text-gray-500">
                    没有更多数据了
                  </div>
                )}
              </>
            )}
          </>
        </ErrorBoundary>
      )}
    </div>
  );
}