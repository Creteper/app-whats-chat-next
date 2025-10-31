import { cookies } from "next/headers";

// 定义简化的用户信息类型（用于 cookie 存储）
type BasicUserInfo = {
  uuid: string;
  user_name: string;
};

/**
 * 服务端安全的用户信息获取
 * 使用 Next.js cookies API 在服务端获取用户信息
 */

/**
 * 从 cookies 中获取用户信息
 */
export async function getServerUserInfo(): Promise<BasicUserInfo | null> {
  try {
    const cookieStore = await cookies();
    const userInfoCookie = cookieStore.get("userInfo");
    
    if (!userInfoCookie) {
      console.log("未找到 userInfo cookie");
      return null;
    }
    
    // 解码 cookie 值
    const decodedValue = decodeURIComponent(userInfoCookie.value);
    console.log("解码后的值前100个字符:", decodedValue);
    
    // 检查 JSON 字符串是否完整
    const cookieValue = decodedValue.trim();
    if (!cookieValue.startsWith('[') && !cookieValue.startsWith('{')) {
      console.error("Cookie 值不是有效的 JSON 格式");
      return null;
    }
    
    // 尝试解析 JSON
    const parsed = JSON.parse(cookieValue);
    console.log("成功解析用户信息:", parsed);
    return parsed as BasicUserInfo;
  } catch (error) {
    console.error("获取服务端用户信息失败:", error);
    return null;
  }
}

/**
 * 从 cookies 中获取用户名MD5
 */
export async function getServerUserNameMd5(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const userNameMd5Cookie = cookieStore.get("userNameMd5");
    
    return userNameMd5Cookie?.value || null;
  } catch (error) {
    console.error("获取服务端用户名MD5失败:", error);
    return null;
  }
}

/**
 * 检查服务端登录状态
 */
export async function checkServerLoginStatus(): Promise<boolean> {
  const userNameMd5 = await getServerUserNameMd5();
  return userNameMd5 ? true : false;
}

/**
 * 获取AI信息并生成标题
 */
export async function getAiInfoAndTitle(aiId: string): Promise<{ title: string; description: string }> {
  try {
    const userInfo = await getServerUserInfo();
    
    // 检查是否有基本的用户信息（现在 userInfo 是简化的对象，不是数组）
    if (!userInfo || !userInfo.uuid) {
      console.log("未找到有效的用户信息，使用默认标题");
      return {
        title: "",
        description: ""
      };
    }
    
    // 在服务端环境中，我们不调用外部 API，因为缺少必要的认证信息
    // 而是使用默认标题，让客户端在 hydration 后动态更新
    console.log("服务端环境，使用默认标题，客户端将动态更新");
    return {
      title: `Whats Chat - AI Chat ${aiId}`,
      description: "与AI进行智能对话"
    };
  } catch (error) {
    console.error("获取AI信息失败:", error);
    return {
      title: `Whats Chat - AI Chat ${aiId}`,
      description: "与AI进行智能对话"
    };
  }
}
  