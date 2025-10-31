import React from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Bug } from "lucide-react";
import { Button } from "./ui/button";
import { refresh } from "next/cache";
import { useRouter } from "next/navigation";
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}


class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // 更新 state 使下一次渲染可以显示降级 UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级 UI
      return (
        this.props.fallback || (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant={"icon"}>
                <Bug className="text-destructive" />
              </EmptyMedia>
              <EmptyTitle>遇到一些错误</EmptyTitle>
              <EmptyDescription>
                choo, 哦豁，程序出错了，请稍后再试。
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => window.location.reload()}>重试</Button>
            </EmptyContent>
          </Empty>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
