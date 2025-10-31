"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { AgentItems } from "@/types/agent";
import { parseTags } from "@/lib/chat-content";
import { Sparkles } from "lucide-react";
import { GetImgUrl } from "@/lib/cyberchat";

interface StreamingMessageProps {
  content: string;
  aiInfo: AgentItems | null;
}

/**
 * 流式传输消息组件
 * 实时显示AI正在生成的内容
 */
export function StreamingMessage({ content, aiInfo }: StreamingMessageProps) {
  if (!content) return null;

  return (
    <div className="flex justify-start group">
      <div className="flex items-end gap-2 max-w-[75%] sm:max-w-[60%] md:max-w-[50%] mr-10">
        <Avatar className="w-8 h-8 shrink-0 self-start">
          <AvatarImage src={GetImgUrl("users", "avatar_" + aiInfo?.sl_id, new Date())} />
          <AvatarFallback className="text-xs">
            {aiInfo?.nik_name?.charAt(0) || "AI"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <div className="text-sm flex gap-2 items-center">
            <span>{aiInfo && aiInfo.nik_name}</span>
            <Spinner className="h-4 w-4" />
          </div>
          {/* 实时解析并渲染流式内容 */}
          <>
            {parseTags(content).map((part, idx) => {
              const uniqueKey = `streaming_${idx}`;
              
              // 对话内容
              if (part.type === "speech") {
                return (
                  <div
                    key={uniqueKey}
                    className="bg-muted text-foreground px-4 py-3 rounded-lg rounded-bl-sm wrap-break-words overflow-hidden whitespace-pre-wrap shadow-sm animate-pulse"
                  >
                    {part.content}
                  </div>
                );
              } 
              
              // 内心想法
              else if (part.type === "inner thoughts") {
                return (
                  <div
                    key={uniqueKey}
                    className="italic text-rose-500/70 dark:text-rose-400/60 py-2 px-3 bg-rose-50/30 dark:bg-rose-950/20 rounded-lg border-l-2 border-rose-300 dark:border-rose-700 wrap-break-words overflow-hidden whitespace-pre-wrap animate-pulse"
                  >
                    💭 {part.content}
                  </div>
                );
              } 
              
              // 即将要做的事
              else if (part.type === "feature") {
                return (
                  <div
                    key={uniqueKey}
                    className="text-blue-600/80 dark:text-blue-400/70 py-2 px-3 bg-blue-50/30 dark:bg-blue-950/20 rounded-lg border-l-2 border-blue-300 dark:border-blue-700 wrap-break-words overflow-hidden whitespace-pre-wrap text-sm animate-pulse"
                  >
                    <Sparkles className="inline h-3.5 w-3.5 mr-1" />
                    {part.content}
                  </div>
                );
              } 
              
              // 记忆总结
              else if (part.type === "mem") {
                return (
                  <div
                    key={uniqueKey}
                    className="text-purple-600/80 dark:text-purple-400/70 py-2 px-3 bg-purple-50/30 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800 text-sm animate-pulse"
                  >
                    📝 记忆总结中...
                  </div>
                );
              } 
              
              // 场景总结
              else if (part.type === "summary") {
                return (
                  <div
                    key={uniqueKey}
                    className="mt-2 p-3 bg-linear-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800 text-sm animate-pulse"
                  >
                    📊 场景信息生成中...
                  </div>
                );
              } 
              
              // 普通文本
              else if (part.type === "text") {
                return (
                  <div
                    key={uniqueKey}
                    className="text-muted-foreground/70 py-1 px-2 rounded wrap-break-words overflow-hidden whitespace-pre-wrap text-sm"
                  >
                    {part.content}
                  </div>
                );
              }
            })}
          </>
        </div>
      </div>
    </div>
  );
}

