import axios from "axios";
import { type AxiosInstance } from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import { setCookie } from "./cookies";
import { type UserInfo } from "@/types/users";
import { md5 } from "./md5";
import { AgentItems, AiChatItem, AiRecentItem } from "@/types/agent";
import { setClientUserInfo } from "./client-storage";

export type CyberChatUser = {
  username: string;
  password: string;
};

export type CyberChatLoadAIListParams = {
  ugroup: string;
  nsfw: string;
  type: string;
  not_in: string;
};

export interface CyberChatResponse {
  code: number;
  message: string;
  data: any;
}

// 为 AI 列表响应定义专门的接口
export interface CyberChatAIListResponse {
  code: number;
  message: string;
  data: AgentItems[];
}

// 聊天提示词加载响应
export interface CyberChatPromptResponse {
  originalContent: string;
  jsonData: string;
}

// DeepSeek 聊天响应
export interface CyberChatDeepResponse {
  response: string;
  promptTokens: number;
  completionTokens: number;
  account: string;
  resultArray: {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
      index: number;
      message: {
        role: string;
        content: string;
      };
      logprobs: null;
      finish_reason: string;
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
      prompt_tokens_details?: {
        cached_tokens: number;
      };
      prompt_cache_hit_tokens?: number;
      prompt_cache_miss_tokens?: number;
    };
    system_fingerprint: string;
  };
  time: number;
}

// 聊天日志插入参数
export interface CyberChatLogInsertParams {
  chat_id: string;
  user_input: string;
  ai_feedback: string;
  sl_id: string;
  sl_name: string;
  uid: string;
  uname: string;
  has_read: string;
  pre_summary: string;
  first_chat: string;
  ctype: string;
  prompt_tokens_chat: string;
  completion_tokens_chat: string;
  prompt_tokens_summary: string;
  completion_tokens_summary: string;
  chat_account: string;
  summary_account: string;
  chat_post_method: string;
  owner_id: string;
  consume: string;
  create_type: string;
  slfree: string;
  ai_feedback_x: string;
  permission: string;
  sex_score: string;
  dongzuo_text: string;
  img_url: string;
  quote_img_order: string;
  img_author: string;
  post_chat: string;
  time: string;
  emo: string;
  chat_table: string;
  u_5x_qinmi: string;
  today_chat_cnt: string;
}

// 聊天日志插入响应
export interface CyberChatLogInsertResponse {
  success: boolean;
}

// 微博/动态条目
export interface WeiboItem {
  id: number;
  log_time: string;
  slid: string;
  type: number;
  img_cnt: number;
  img_url: string;
  img_order: string | null;
  text_content: string | null;
  permission: number;
  content_type: string;
  nik_name: string;
  sl_intro: string;
  mask_relationship: string;
}

// 生成随机 User-Agent 的函数
function generateUserAgent(): string {
  const browsers = [
    {
      name: "Chrome",
      versions: [
        "98.0.4758.102",
        "99.0.4844.51",
        "100.0.4896.75",
        "101.0.4951.67",
      ],
    },
    {
      name: "Firefox",
      versions: ["97.0", "98.0", "99.0", "100.0"],
    },
    {
      name: "Safari",
      versions: ["15.3", "15.4", "15.5", "16.0"],
    },
  ];

  const operatingSystems = [
    "Windows NT 10.0; Win64; x64",
    "Macintosh; Intel Mac OS X 10_15_7",
    "X11; Linux x86_64",
  ];

  const randomBrowser = browsers[Math.floor(Math.random() * browsers.length)];
  const randomVersion =
    randomBrowser.versions[
      Math.floor(Math.random() * randomBrowser.versions.length)
    ];
  const randomOS =
    operatingSystems[Math.floor(Math.random() * operatingSystems.length)];

  if (randomBrowser.name === "Safari") {
    return `Mozilla/5.0 (${randomOS}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${randomVersion} Safari/605.1.15`;
  } else {
    return `Mozilla/5.0 (${randomOS}) AppleWebKit/537.36 (KHTML, like Gecko) ${randomBrowser.name}/${randomVersion} Safari/537.36`;
  }
}

export default class CyberChatAPI {
  private url: string;
  private axiosInstance: AxiosInstance;
  private cookieJar: CookieJar;
  private user: CyberChatUser = {} as CyberChatUser;
  public baseUrl: string;
  public ua: string;
  public userNameMd5: string = "";
  public passWordMd5: string = "";
  private serverUrl: string;

  // 构造函数
  constructor() {
    this.url = "/api/chat2/assets/data";
    this.serverUrl = "/chat2/assets/data";
    this.cookieJar = new CookieJar();
    this.baseUrl = "https://cyberchat.vip";
    console.log(this.baseUrl);
    // 生成随机 User-Agent
    const userAgent = generateUserAgent();
    this.ua = userAgent;

    // 检查是否在服务端环境
    const isServer = typeof window === "undefined";
    const baseURL = isServer ? `${this.baseUrl}${this.serverUrl}` : this.url;

    this.axiosInstance = wrapper(
      axios.create({
        baseURL: baseURL,
        timeout: 60000, // 增加到 60 秒，AI 生成需要更长时间
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": userAgent,
        },
        jar: this.cookieJar,
        withCredentials: true,
      })
    );
  }

  async login(user: CyberChatUser) {
    this.user = user;
    // 在登录时进行密码加密
    this.userNameMd5 = md5(this.user.username);
    this.passWordMd5 = md5(this.user.password);

    // 使用客户端存储工具
    await setClientUserInfo({} as UserInfo); // 这里需要实际的用户信息
    // 注意：localforage 的 setItem 调用需要在客户端进行
    if (typeof window !== "undefined") {
      const localforage = (await import("localforage")).default;
      await localforage.setItem("userNameMd5", this.userNameMd5);
      await localforage.setItem("passWordMd5", this.passWordMd5);
    }

    setCookie(this.cookieJar, "login_uid", this.userNameMd5, this.baseUrl);
    setCookie(this.cookieJar, "psd", this.passWordMd5, this.baseUrl);

    let response = await this.axiosInstance.post("/login.php", {
      uid: this.user.username,
      psd: this.passWordMd5,
    });

    const responseInterface: CyberChatResponse = {} as CyberChatResponse;
    responseInterface.code = response.status;

    if (response.status != 200) {
      responseInterface.message = "登录失败，请检查网络状态";
      return responseInterface;
    }

    responseInterface.data = response.data;

    // 修复比较逻辑，正确检查数据是否为空
    if (
      Array.isArray(responseInterface.data) &&
      responseInterface.data.length === 0
    ) {
      responseInterface.code = 400;
      responseInterface.message = "登录失败，请检查用户名或密码";
      return responseInterface;
    }

    response = await this.axiosInstance.post("/insert_login_log.php", {
      uid: this.userNameMd5,
      ua: this.ua,
    });
    responseInterface.message = "登录成功";

    return responseInterface;
  }

  async getUserInfo() {
    const response = await this.axiosInstance.post("/load_user_info.php", {
      uid: this.user.username,
    });

    return response.data as UserInfo;
  }

  async getAIList(
    pm: CyberChatLoadAIListParams
  ): Promise<CyberChatAIListResponse> {
    try {
      const response = await this.axiosInstance.post("/load_AI_list.php", pm);
      return {
        code: response.status,
        message: "success",
        data:
          response.data && Array.isArray(response.data) ? response.data : [],
      };
    } catch (error) {
      console.error("获取AI列表时出错:", error);
      return {
        code: 500,
        message: "获取AI列表失败",
        data: [],
      };
    }
  }

  async getAiInfo(sl_id: string, uid: string): Promise<AgentItems[]> {
    try {
      const response = await this.axiosInstance.post("/load_ai_info.php", {
        sl_id,
        uid,
      });
      console.log("获取AI信息:", response.data);
      return response.data as AgentItems[];
    } catch (error) {
      console.error("获取AI信息时出错:", error);
      return [];
    }
  }

  async getRecentChats(
    uid: string,
    cnt: number | "all"
  ): Promise<AiRecentItem[]> {
    try {
      const response = await this.axiosInstance.post("/load_recent_list.php", {
        uid,
        cnt: cnt.toString(),
      });

      return response.data as AiRecentItem[];
    } catch (error) {
      console.error("获取最近聊天列表时出错:", error);
      return [];
    }
  }

  async getChatLog(
    uid: string,
    slid: string,
    from: string,
    cnt: number,
    chat_table: string
  ) {
    return (
      await this.axiosInstance.post("/load_chat_log.php", {
        uid,
        slid,
        from,
        cnt,
        chat_table,
      })
    ).data as AiChatItem[];
  }

  /**
   * 重置聊天标签（清空聊天记录标记）
   * 仅需判断请求是否 200
   */
  async resetChatTag(uid: string, slid: string): Promise<boolean> {
    try {
      const resp = await this.axiosInstance.post("/reset_chat_tag.php", {
        uid,
        slid,
      });
      return resp.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * 加载聊天提示词
   * @param uid 用户ID
   * @param slid AI角色ID
   * @param chat_table 聊天表名
   * @returns 提示词数组，[0]为原始内容，[1]为包含json_data的对象
   */
  async loadChatPrompt(
    uid: string,
    slid: string,
    chat_table: string
  ): Promise<CyberChatPromptResponse[]> {
    try {
      const response = await this.axiosInstance.post("/load_chat_prompt.php", {
        uid,
        slid,
        chat_table,
      });

      // 响应是数组格式
      // 实际格式：[{json_data: '...', 0: '...'}]
      if (Array.isArray(response.data) && response.data.length > 0) {
        const firstItem = response.data[0];

        // 检查第一个元素是否有 json_data 字段
        if (
          typeof firstItem === "object" &&
          firstItem !== null &&
          "json_data" in firstItem
        ) {
          return [
            {
              originalContent: firstItem["0"] || firstItem.json_data,
              jsonData: firstItem.json_data,
            },
          ];
        }

        // 备用格式：[原始内容, {json_data}]
        if (response.data.length >= 2 && typeof response.data[1] === "object") {
          return [
            {
              originalContent: response.data[0],
              jsonData: response.data[1].json_data || response.data[0],
            },
          ];
        }

        console.warn("⚠️ loadChatPrompt 响应格式不符合预期");
      }

      return [];
    } catch (error) {
      console.error("加载聊天提示词时出错:", error);
      return [];
    }
  }

  /**
   * 通过 DeepSeek 发送聊天消息
   * @param text 系统提示词 + 最新用户消息的 JSON 数组格式文本
   * @param type 对话类型
   * @param today_chat_cnt 今日聊天次数
   * @returns DeepSeek API 响应
   */
  async postChatDeep(
    text: string,
    type: string = "low",
    today_chat_cnt: string = "0"
  ): Promise<CyberChatDeepResponse | null> {
    try {
      const response = await this.axiosInstance.post("/post_chat_deep.php", {
        text,
        type,
        today_chat_cnt,
      });

      return response.data as CyberChatDeepResponse;
    } catch (error) {
      console.error("发送 DeepSeek 聊天消息时出错:", error);
      return null;
    }
  }

  /**
   * 插入聊天日志到数据库
   * @param params 聊天日志参数
   * @returns 是否成功
   */
  async chatLogInsert(
    params: CyberChatLogInsertParams
  ): Promise<CyberChatLogInsertResponse> {
    try {
      const response = await this.axiosInstance.post(
        "/chat_log_insert.php",
        params
      );

      return response.data as CyberChatLogInsertResponse;
    } catch (error) {
      console.error("插入聊天日志时出错:", error);
      return { success: false };
    }
  }

  /**
   * 根据 SLID 加载 AI 发布的微博/动态
   * @param ls_id 角色 SLID（接口字段名为 ls_id）
   * @param cnt 返回条数
   */
  async loadWeiBoBySLID(sl_id: string, cnt: number): Promise<WeiboItem[]> {
    try {
      const resp = await this.axiosInstance.post("/load_weibo_by_slid.php", {
        sl_id,
        cnt,
      });
      if (resp.status === 200 && Array.isArray(resp.data)) {
        return resp.data as WeiboItem[];
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * 进入聊天前的初始化接口
   * @param uid 用户ID
   * @param slid 角色SLID
   */
  async loadChatSlcnt(uid: string, slid: string): Promise<boolean> {
    try {
      const resp = await this.axiosInstance.post("/load_chat_slcnt.php", {
        uid,
        slid,
      });
      return resp.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * 加载用户角色绘画信息
   */
  async loadUserJxj(params: {
    uid: string;
    slid: string;
    type: string;
    chat_table: string;
  }) {
    try {
      const resp = await this.axiosInstance.post("/load_user_jxj.php", params);
      return resp.data;
    } catch (error) {
      console.error("加载用户绘画信息失败:", error);
      return null;
    }
  }

  /**
   * 加载聊天前情提要
   */
  async loadChatPreSummary(params: {
    uid: string;
    slid: string;
    temp_umask_switch: string;
    temp_umask: string;
    temp_uname: string;
    append_text: string;
    today_chat_cnt: string;
    chat_table: string;
  }) {
    try {
      const resp = await this.axiosInstance.post(
        "/load_chat_pre_summary_v3.php",
        params
      );
      return resp.data;
    } catch (error) {
      console.error("加载聊天前情提要失败:", error);
      return null;
    }
  }

  /**
   * 生成AI角色图片
   */
  async postGennerImg(params: {
    changjing: string;
    fushi: string;
    dongzuo: string;
    sl_id: string;
    p1: string;
    p2: string;
    p3: string;
    p4: string;
    uid: string;
  }): Promise<{ url: string; state: string; statusCode?: number } | null> {
    try {
      const resp = await this.axiosInstance.post(
        "/post_genner_img.php",
        params
      );
      if (resp.status === 200 && resp.data && resp.data.url) {
        return resp.data;
      }
      return { url: "", state: String(resp.status || "") };
    } catch (error: any) {
      const statusCode = error?.response?.status;
      if (statusCode === 500) {
        return { url: "", state: "500", statusCode };
      }
      console.error("生成图片失败:", error);
      return { url: "", state: String(statusCode || "error"), statusCode };
    }
  }
}

export async function CheckLoginStatus() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const localforage = (await import("localforage")).default;
    const uid = await localforage.getItem("userNameMd5");
    return uid ? true : false;
  } catch (error) {
    console.error("检查登录状态失败:", error);
    return false;
  }
}

export async function GetUserInfo() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const localforage = (await import("localforage")).default;
    const uinfo = await localforage.getItem("userInfo");
    return uinfo as UserInfo;
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return null;
  }
}

export function GetImgUrl(type: string, name: string, date?: Date | number) {
  // 如果文件名已包含扩展名则不再追加
  const hasExt = /\.(png|jpg|jpeg|webp|gif)$/i.test(name);
  const base = `/api/chat2/assets/images/${type}/${
    hasExt ? name : `${name}.jpg`
  }`;
  if (!date) return base; // 不附带查询参数
  const ts = typeof date === "number" ? date : date.getTime();
  return `${base}?r=${ts}`;
}
