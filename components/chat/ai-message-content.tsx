"use client";

import { parseTags, extractSceneInfo } from "@/lib/chat-content";
import { SceneInfoDisplay } from "./scene-info-display";
import { Sparkles } from "lucide-react";

interface AIMessageContentProps {
  content: string;
  isMobile: boolean;
}

/**
 * AI消息内容渲染组件
 * 解析标签并渲染不同类型的内容
 */
export function AIMessageContent({ content, isMobile }: AIMessageContentProps) {
  const parsedContent = parseTags(content);
  const sceneInfo = extractSceneInfo(content);

  return (
    <>
      {parsedContent.map((part, idx, array) => {
        const uniqueKey = `part_${idx}`;
        // 检查是否是最后一个 speech 标签
        const isLastSpeech = part.type === "speech" && 
          !array.slice(idx + 1).some(p => p.type === "speech");
        
        // 对话内容 - 使用气泡样式，支持多个 speech 标签
        if (part.type === "speech") {
          return (
            <div key={uniqueKey} className="w-full">
              <div className="bg-muted text-foreground px-4 py-3 rounded-lg rounded-bl-sm wrap-break-words overflow-hidden whitespace-pre-wrap shadow-sm">
                {part.content}
              </div>
              {/* 只在最后一个 speech 标签后显示时间戳 */}
              {isLastSpeech && (
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleTimeString()}
                </div>
              )}
            </div>
          );
        } 
        
        // 内心想法 - 使用斜体和淡红色
        else if (part.type === "inner thoughts") {
          return (
            <div
              key={uniqueKey}
              className="italic text-rose-500/70 dark:text-rose-400/60 py-2 px-3 bg-rose-50/30 dark:bg-rose-950/20 rounded-lg border-l-2 border-rose-300 dark:border-rose-700 wrap-break-words overflow-hidden whitespace-pre-wrap"
            >
              💭 {part.content}
            </div>
          );
        } 
        
        // 即将要做的事 - 使用蓝色主题，并显示场景信息图标
        else if (part.type === "feature") {
          return (
            <div key={uniqueKey} className="space-y-2">
              <div className="text-blue-600/80 dark:text-blue-400/70 py-2 px-3 bg-blue-50/30 dark:bg-blue-950/20 rounded-lg border-l-2 border-blue-300 dark:border-blue-700 wrap-break-words overflow-hidden whitespace-pre-wrap text-sm">
                <Sparkles className="inline h-3.5 w-3.5 mr-1" />
                {part.content}
              </div>
              {/* 场景信息展示 */}
              <SceneInfoDisplay sceneInfo={sceneInfo} isMobile={isMobile} />
            </div>
          );
        } 
        
        // 记忆总结 - 使用紫色主题，可折叠
        else if (part.type === "mem") {
          return (
            <details
              key={uniqueKey}
              className="text-purple-600/80 dark:text-purple-400/70 py-2 px-3 bg-purple-50/30 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800 text-sm"
            >
              <summary className="cursor-pointer font-medium hover:text-purple-700 dark:hover:text-purple-300">
                📝 记忆总结
              </summary>
              <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-800 whitespace-pre-wrap">
                {part.content}
              </div>
            </details>
          );
        } 
        
        // 场景总结 - 使用卡片样式展示
        else if (part.type === "summary") {
          return (
            <details
              key={uniqueKey}
              className="mt-2 p-3 bg-linear-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800 text-sm"
            >
              <summary className="cursor-pointer font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300">
                📊 场景信息
              </summary>
              <div className="mt-3 space-y-2 text-muted-foreground">
                {sceneInfo["场景"] !== "未提及" && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-amber-600 dark:text-amber-500 min-w-16">场景：</span>
                    <span>{sceneInfo["场景"]}</span>
                  </div>
                )}
                {sceneInfo["服饰状态细节"] !== "未提及" && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-amber-600 dark:text-amber-500 min-w-16">服饰：</span>
                    <span>{sceneInfo["服饰状态细节"]}</span>
                  </div>
                )}
                {sceneInfo["姿态动作"] !== "未提及" && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-amber-600 dark:text-amber-500 min-w-16">动作：</span>
                    <span>{sceneInfo["姿态动作"]}</span>
                  </div>
                )}
                {sceneInfo["事件信息提炼"] !== "未提及" && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-amber-600 dark:text-amber-500 min-w-16">事件：</span>
                    <span>{sceneInfo["事件信息提炼"]}</span>
                  </div>
                )}
                {sceneInfo["发情程度"] !== "未提及" && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-amber-600 dark:text-amber-500 min-w-16">发情度：</span>
                    <span className="inline-flex items-center gap-1">
                      {sceneInfo["发情程度"]}
                      <span className="text-xs text-pink-500">❤️</span>
                    </span>
                  </div>
                )}
                {sceneInfo["心动程度"] !== "未提及" && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-amber-600 dark:text-amber-500 min-w-16">心动度：</span>
                    <span className="inline-flex items-center gap-1">
                      {sceneInfo["心动程度"]}
                      <span className="text-xs text-rose-500">✨</span>
                    </span>
                  </div>
                )}
              </div>
            </details>
          );
        } 
        
        // 普通文本 - 淡化显示
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
  );
}

