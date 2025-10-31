"use client";

import { AiChatItem, AgentItems } from "@/types/agent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { decodeImageUrl } from "@/lib/chat-content";
import { AIMessageContent } from "./ai-message-content";
import { GetImgUrl } from "@/lib/cyberchat";

interface MessageItemProps {
  item: AiChatItem;
  userInfo: any;
  aiInfo: AgentItems | null;
  isMobile: boolean;
  handleGenerateImage: () => void;
}

/**
 * 聊天消息项组件
 * 包括用户消息和AI消息
 */
export function MessageItem({ item, userInfo, aiInfo, isMobile, handleGenerateImage }: MessageItemProps) {
  // 用户消息
  if (item.role === "Human") {
    return (
      <div className="flex justify-end">
        <div className="flex items-end gap-2 ml-10 md:max-w-[50%]">
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm">
              {userInfo && userInfo[0].user_name}
            </div>
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg rounded-br-sm wrap-break-word">
              {item.content}
            </div>
            <div className="text-xs text-muted-foreground mt-1 self-start">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
          <Avatar className="w-8 h-8 shrink-0 self-start">
            <AvatarImage src={GetImgUrl("users", "user_image-" + userInfo[0].id, new Date().getTime())} />
            <AvatarFallback className="text-xs">
              {userInfo ? userInfo[0].user_name?.charAt(0) : "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  // AI消息
  if (item.role === "AI") {
    return (
      <div className="flex justify-start group">
        <div className="flex items-end gap-2 md:max-w-[50%] mr-10">
          <Avatar className="w-8 h-8 shrink-0 self-start">
            <AvatarImage src={GetImgUrl("users", "avatar_" + aiInfo?.sl_id, new Date())} />
            <AvatarFallback className="text-xs">
              {aiInfo?.nik_name?.charAt(0) || "AI"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <div className="text-sm flex gap-2 items-center">
              <span>{aiInfo && aiInfo.nik_name}</span>
              <Button variant={"ghost"} size={"icon"} className="size-6" onClick={handleGenerateImage}>
                <ImageIcon className="size-4" />
              </Button>
            </div>
            {item.ctype == "genner_img" && (
              <Image
                src={decodeImageUrl(item.img_url)}
                alt={item.chat_id}
                width={1000}
                height={1000}
                className="w-full h-full rounded-md"
              />
            )}
            {/* AI消息内容渲染 */}
            <AIMessageContent content={item.content} isMobile={isMobile} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

