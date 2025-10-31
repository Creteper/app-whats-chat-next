"use client";

import { motion } from "motion/react";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motionConfig, animationVariants } from "@/lib/motion-config";

interface AnimatedBackButtonProps {
  className?: string;
}

export function AnimatedBackButton({ className }: AnimatedBackButtonProps) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={animationVariants.buttonHover.hover}
      whileTap={animationVariants.buttonHover.tap}
      transition={{ type: "spring", ...motionConfig.microInteraction }}
    >
      <Button 
        size="icon" 
        variant="ghost" 
        className={`size-8 shrink-0 ${className}`}
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
      </Button>
    </motion.div>
  );
}

interface AnimatedIconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AnimatedIconButton({ 
  children, 
  onClick, 
  className = "", 
  size = "md" 
}: AnimatedIconButtonProps) {
  const sizeClasses = {
    sm: "size-6",
    md: "size-8", 
    lg: "size-10"
  };

  return (
    <motion.div
      whileHover={animationVariants.buttonHover.hover}
      whileTap={animationVariants.buttonHover.tap}
      transition={{ type: "spring", ...motionConfig.microInteraction }}
    >
      <Button 
        size="icon" 
        variant="ghost" 
        className={`${sizeClasses[size]} shrink-0 ${className}`}
        onClick={onClick}
      >
        {children}
      </Button>
    </motion.div>
  );
}
