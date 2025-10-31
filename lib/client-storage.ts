import localforage from "localforage";
import { UserInfo } from "@/types/users";

/**
 * 客户端存储工具函数
 * 这些函数只能在客户端使用，不能在服务端渲染中使用
 */

/**
 * 检查是否在客户端环境
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * 安全地获取用户信息（仅在客户端）
 */
export async function getClientUserInfo(): Promise<UserInfo | null> {
  if (!isClient()) {
    return null;
  }
  
  try {
    return await localforage.getItem("userInfo");
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return null;
  }
}

/**
 * 安全地设置用户信息（仅在客户端）
 */
export async function setClientUserInfo(userInfo: UserInfo): Promise<void> {
  if (!isClient()) {
    return;
  }
  
  try {
    await localforage.setItem("userInfo", userInfo);
  } catch (error) {
    console.error("设置用户信息失败:", error);
  }
}

/**
 * 安全地获取用户名MD5（仅在客户端）
 */
export async function getClientUserNameMd5(): Promise<string | null> {
  if (!isClient()) {
    return null;
  }
  
  try {
    return await localforage.getItem("userNameMd5");
  } catch (error) {
    console.error("获取用户名MD5失败:", error);
    return null;
  }
}

/**
 * 安全地获取密码MD5（仅在客户端）
 */
export async function getClientPasswordMd5(): Promise<string | null> {
  if (!isClient()) {
    return null;
  }
  
  try {
    return await localforage.getItem("passWordMd5");
  } catch (error) {
    console.error("获取密码MD5失败:", error);
    return null;
  }
}

/**
 * 检查登录状态（仅在客户端）
 */
export async function checkClientLoginStatus(): Promise<boolean> {
  if (!isClient()) {
    return false;
  }
  
  try {
    const uid = await localforage.getItem("userNameMd5");
    return uid ? true : false;
  } catch (error) {
    console.error("检查登录状态失败:", error);
    return false;
  }
}
