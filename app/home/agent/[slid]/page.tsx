"use client";

import { useAuth } from "@/components/auth-provider";
import ErrorBoundary from "@/components/error-boundary";
import { Spinner } from "@/components/ui/spinner";
import CyberChatAPI, { GetImgUrl, WeiboItem } from "@/lib/cyberchat";
import { AgentItems } from "@/types/agent";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Heart, MessageCircle, MapPin, Shirt, Palette } from "lucide-react";

export default function AgentDetailPage() {
  const { userInfo } = useAuth();
  const params = useParams<{ slid: string }>();
  const router = useRouter();
  const api = useRef(new CyberChatAPI());

  const [aiInfo, setAiInfo] = useState<AgentItems | null>(null);
  const [weibos, setWeibos] = useState<WeiboItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [count, setCount] = useState(10);
  const [isEnteringChat, setIsEnteringChat] = useState(false);

  const normalizeImg = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    // 相对路径走本地代理
    return `/api/${url.replace(/^\//, "")}`;
  };

  useEffect(() => {
    if (!userInfo || !params?.slid) return;

    const run = async () => {
      try {
        setIsLoading(true);
        const info = await api.current.getAiInfo(params.slid, userInfo[0].uuid);
        if (info && info.length > 0) setAiInfo(info[0]);

        const list = await api.current.loadWeiBoBySLID(params.slid, count);
        setWeibos(list);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [userInfo, params?.slid, count]);

  const loadMore = async () => {
    setLoadingMore(true);
    const next = count + 10;
    const list = await api.current.loadWeiBoBySLID(params.slid as string, next);
    setWeibos(list);
    setCount(next);
    setLoadingMore(false);
  };

  const handleEnterChat = async () => {
    if (!aiInfo || !userInfo) return;
    
    setIsEnteringChat(true);
    try {
      // 调用初始化接口
      await api.current.loadChatSlcnt(userInfo[0].uuid, aiInfo.sl_id);
      // 跳转到聊天页面
      router.push(`/home/chat/${aiInfo.sl_id}?title=${aiInfo.nik_name}&type=chat`);
    } catch (error) {
      console.error("进入聊天失败:", error);
    } finally {
      setIsEnteringChat(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner className="h-6 w-6" />
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  if (!aiInfo) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        未找到角色信息
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="px-6 py-4 space-y-6">
        {/* 顶部信息 */}
        <div className="flex items-start gap-4">
          <Image
            src={GetImgUrl("users", `avatar_${aiInfo.sl_id}`, new Date())}
            alt={aiInfo.nik_name}
            width={80}
            height={80}
            className="rounded-md object-cover"
          />
          <div className="min-w-0 grow">
            <div className="text-xl font-semibold">{aiInfo.nik_name}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {aiInfo.sl_intro || "这个角色很神秘，还没有简介~"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              关系：{aiInfo.mask_relationship || "未设置"}
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleEnterChat}
            disabled={isEnteringChat}
          >
            {isEnteringChat ? "正在进入..." : "进入对话"}
          </Button>
        </div>

        {/* 角色详情信息卡片 */}
        <div className="border rounded-lg p-4 space-y-3 bg-card">
          <div className="text-base font-semibold mb-2">角色信息</div>
          <div className="grid gap-3">
            {/* 背景 */}
            {aiInfo.mask_background && (
              <div className="flex items-start gap-2">
                <Palette className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0 grow">
                  <div className="text-xs text-muted-foreground">背景</div>
                  <div className="text-sm mt-0.5">{aiInfo.mask_background}</div>
                </div>
              </div>
            )}

            {/* 性别 */}
            {aiInfo.sl_sex && (
              <div className="flex items-start gap-2">
                <User className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0 grow">
                  <div className="text-xs text-muted-foreground">性别</div>
                  <div className="text-sm mt-0.5">{aiInfo.sl_sex}</div>
                </div>
              </div>
            )}

            {/* 性格 */}
            {aiInfo.mask_character && (
              <div className="flex items-start gap-2">
                <Heart className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0 grow">
                  <div className="text-xs text-muted-foreground">性格</div>
                  <div className="text-sm mt-0.5">{aiInfo.mask_character}</div>
                </div>
              </div>
            )}

            {/* 说话风格 */}
            {aiInfo.yuyan && (
              <div className="flex items-start gap-2">
                <MessageCircle className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0 grow">
                  <div className="text-xs text-muted-foreground">说话风格</div>
                  <div className="text-sm mt-0.5">{aiInfo.yuyan}</div>
                </div>
              </div>
            )}

            {/* 基础服饰 */}
            {aiInfo.fushi && (
              <div className="flex items-start gap-2">
                <Shirt className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0 grow">
                  <div className="text-xs text-muted-foreground">基础服饰</div>
                  <div className="text-sm mt-0.5">{aiInfo.fushi}</div>
                </div>
              </div>
            )}

            {/* 场景 */}
            {aiInfo.changsuo && (
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0 grow">
                  <div className="text-xs text-muted-foreground">场景</div>
                  <div className="text-sm mt-0.5">{aiInfo.changsuo}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 微博流 */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">TA 的动态</div>
          {weibos.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">暂无动态</div>
          ) : (
            <div className="grid gap-4">
              {weibos.map((w) => (
                <div key={w.id} className="border rounded-md p-3 space-y-2">
                  <div className="text-xs text-muted-foreground">
                    {new Date(w.log_time).toLocaleString("zh-CN")}
                  </div>
                  {w.text_content && (
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {w.text_content}
                    </div>
                  )}
                  {w.img_url && (
                    <Image
                      src={normalizeImg(w.img_url)}
                      alt={aiInfo.nik_name}
                      width={1080}
                      height={1080}
                      className="rounded-md w-full h-auto object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-center pt-2">
            <Button size="sm" variant="ghost" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "加载中..." : "加载更多"}
            </Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}


