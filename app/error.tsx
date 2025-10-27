"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="relative min-h-screen bg-background">
      {/* 背景图片 */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url('/error-background.webp')]" />

      {/* 遮罩层 */}
      <div className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-2xl" />

      {/* 内容 */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 relative z-10">
        <h1 className="text-6xl font-bold text-primary mb-4">500</h1>
        <h2 className="text-2xl font-semibold mb-4">服务器错误</h2>
        <p className="text-muted-foreground mb-8">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}