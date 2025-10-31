"use client";

import { Settings } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import ModeToggle from "./triggle-theme";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useAuth } from "./auth-provider";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { AnimatedBackButton, AnimatedIconButton } from "./animated-buttons";
import { motionConfig, animationVariants, animationDelays } from "@/lib/motion-config";

interface FloatingTabBarProps {
  className?: string;
}

export function FloatingTabBar({ className }: FloatingTabBarProps) {
  const params = useSearchParams();
  const { userInfo } = useAuth();
  
  const { title, type } = useMemo(() => {
    return {
      title: params.get("title") || "欢迎回来",
      type: params.get("type") || "text",
    };
  }, [params]);

  return (
    <motion.div 
      initial={animationVariants.floatingTabBarEnter.initial}
      animate={animationVariants.floatingTabBarEnter.animate}
      exit={animationVariants.floatingTabBarEnter.exit}
      transition={{
        type: "spring",
        ...motionConfig.spring
      }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        "border-b border-border/40",
        "flex items-center gap-2 px-4 py-3",
        "safe-area-inset-top", // 支持安全区域
        className
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {(type === "chat" || type === "settings") && (
          <motion.div
            initial={animationVariants.slideInLeft.initial}
            animate={animationVariants.slideInLeft.animate}
            transition={{ delay: animationDelays.backButton, ...motionConfig.fade }}
          >
            <AnimatedBackButton />
          </motion.div>
        )}

        {title && userInfo && (
          <motion.h1 
            initial={animationVariants.slideInLeft.initial}
            animate={animationVariants.slideInLeft.animate}
            transition={{ delay: animationDelays.title, ...motionConfig.fade }}
            className="text-lg font-semibold truncate"
          >
            <motion.span
              initial={animationVariants.titleFadeIn.initial}
              animate={animationVariants.titleFadeIn.animate}
              transition={{ delay: animationDelays.titleText, duration: 0.5 }}
            >
              {title + (type === "chat" ? "" : ", " + userInfo[0].user_name)}
            </motion.span>
          </motion.h1>
        )}
      </div>
      
      <motion.div 
        initial={animationVariants.slideInRight.initial}
        animate={animationVariants.slideInRight.animate}
        transition={{ delay: animationDelays.rightButtons, ...motionConfig.fade }}
        className="flex gap-1 items-center shrink-0"
      >
        <SidebarTrigger className="size-8" />
        <ModeToggle />
        <AnimatedIconButton>
          <Settings className="size-4" />
        </AnimatedIconButton>
      </motion.div>
    </motion.div>
  );
}
