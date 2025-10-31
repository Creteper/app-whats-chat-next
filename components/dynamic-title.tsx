"use client";

import { useEffect } from "react";
import { AgentItems } from "@/types/agent";

interface DynamicTitleProps {
  aiInfo: AgentItems | null;
}

export function DynamicTitle({ aiInfo }: DynamicTitleProps) {
  useEffect(() => {
    if (aiInfo && aiInfo.nik_name) {
      const newTitle = `Whats Chat - ${aiInfo.nik_name}`;
      document.title = newTitle;
      console.log("客户端：成功更新标题为:", newTitle);
    }
  }, [aiInfo]);
  
  return null; // 这个组件不渲染任何内容，只负责更新标题
}
