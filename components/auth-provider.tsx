"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckLoginStatus, GetUserInfo } from "@/lib/cyberchat";
import { UserInfo } from "@/types/users";
// 定义不需要重定向到登录页面的路径
const EXCLUDE_AUTH_REDIRECT_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/not-found",
  "/error",
  "/global-error",
  "/maintenance",
];

// 定义 AuthContext 的类型
interface AuthContextType {
  loginStatus: boolean;
  setLoginStatus: React.Dispatch<React.SetStateAction<boolean>>;
  checkingStatus: boolean;
  userInfo: UserInfo | null;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>;
}

// 创建 Context
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Provider 组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loginStatus, setLoginStatus] = React.useState(false);
  const [userInfo, setUserInfo] = React.useState<UserInfo | null>(null);
  const [checkingStatus, setCheckingStatus] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const status = await CheckLoginStatus();
        setLoginStatus(status);

        const userInfo = await GetUserInfo();
        setUserInfo(userInfo);
      } catch (error) {
        console.error("Failed to check login status:", error);
        setLoginStatus(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 当登录状态改变时，如果未登录则重定向到登录页
  // 但要排除特定的路径（如错误页面）
  React.useEffect(() => {
    // 检查当前路径是否在排除列表中
    const isExcludedPath = EXCLUDE_AUTH_REDIRECT_PATHS.some((path) =>
      pathname.startsWith(path)
    );

    // 只有在检查完成、未登录且不在排除列表中时才重定向
    if (!checkingStatus && !loginStatus && !isExcludedPath) {
      router.push("/login");
    }
  }, [loginStatus, checkingStatus, router, pathname]);

  const value = {
    loginStatus,
    setLoginStatus,
    checkingStatus,
    userInfo,
    setUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 自定义 hook 用于访问 AuthContext
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}