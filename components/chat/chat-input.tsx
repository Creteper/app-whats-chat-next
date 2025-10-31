"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onGenerateImage?: () => void;
  disabled: boolean;
  isGeneratingImage?: boolean;
}

/**
 * 聊天输入组件
 * 包含输入框、生成图片按钮和发送按钮
 */
export function ChatInput({ 
  value, 
  onChange, 
  onSend, 
  onGenerateImage,
  disabled,
  isGeneratingImage = false 
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 h-16">
      <div className="flex gap-2 items-center">
        {onGenerateImage && (
          <Button
            size="sm"
            variant="outline"
            onClick={onGenerateImage}
            disabled={disabled || isGeneratingImage}
          >
            <ImagePlus className="size-4" />
          </Button>
        )}
        <Input
          placeholder="输入内容..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <Button
          size="sm"
          onClick={onSend}
          disabled={disabled || !value.trim()}
        >
          {disabled ? "发送中..." : "发送"}
        </Button>
      </div>
    </div>
  );
}

