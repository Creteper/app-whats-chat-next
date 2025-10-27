"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Maintenance() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* 背景图片 */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url('/error-background.webp')]" />

      {/* 遮罩层 */}
      <div className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-2xl" />

      {/* 内容 */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 relative z-10">
        <h1 className="text-6xl font-bold text-primary mb-4">维护中...</h1>
      </div>
    </div>
  );
}
