// prompt-builder.ts
// 用于构建和替换系统提示词中的占位符
import { AgentItems } from "@/types/agent";
import { SystemPropmt, UserPropmt } from "./propmt";

/**
 * 替换系统提示词中的占位符
 * @param aiInfo AI角色信息
 * @param userName 用户名称
 * @returns 替换后的完整系统提示词
 */
export function buildSystemPrompt(
  aiInfo: AgentItems,
  userName: string
): string {
  let prompt = SystemPropmt;

  // 替换所有占位符
  const replacements: Record<string, string> = {
    "{ai_name}": aiInfo.nik_name || "AI",
    "{user_name}": userName || "用户",
    "{ai_info}": aiInfo.mask_background || "暂无背景信息",
    "{ai_personality}": aiInfo.mask_character || "暂无性格信息",
    "{ai_way_speaking}": aiInfo.yuyan || "正常说话方式",
    "{ai_init_space}": aiInfo.changsuo || "普通房间",
    "{ai_init_clothing}": aiInfo.fushi || "日常服饰",
    "{ai_relationship}": aiInfo.mask_relationship || "朋友",
  };

  // 执行替换
  Object.entries(replacements).forEach(([key, value]) => {
    prompt = prompt.replace(new RegExp(key, "g"), value);
  });

  return prompt;
}

/**
 * 构建用户提示词（附加到用户消息后，不显示）
 * @param aiName AI角色名称
 * @returns 替换后的用户提示词
 */
export function buildUserPrompt(aiName: string): string {
  return UserPropmt.replace(/{ai_name}/g, aiName);
}

