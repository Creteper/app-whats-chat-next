"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { DynamicTitle } from "@/components/dynamic-title";
import CyberChatAPI, { GetImgUrl } from "@/lib/cyberchat";
import { useAuth } from "./auth-provider";
import { useRouter } from "next/navigation";
import { Spinner } from "./ui/spinner";
import { AgentItems, AiChatItem } from "@/types/agent";
import { extractSceneInfo } from "@/lib/chat-content";
import { postChatUseDeepSeek, ChatMessage, StreamChunk } from "@/lib/chats";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt-builder";
import localforage from "localforage";
import { MessageItem } from "./chat/message-item";
import { StreamingMessage } from "./chat/streaming-message";
import { ChatInput } from "./chat/chat-input";

type ChatPageClientProps = {
  aiId: string;
};

export function ChatPageClient({ aiId }: ChatPageClientProps) {
  const cyberChatApi = useRef(new CyberChatAPI());
  const { userInfo, checkingStatus } = useAuth();
  const router = useRouter();
  const [aiInfo, setAiInfo] = useState<AgentItems | null>(null);
  const [chatList, setChatList] = useState<AiChatItem[]>([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [apiSetting, setApiSetting] = useState<string>("deepseek");
  
  // 对话历史记录管理
  const [emotionRecord, setEmotionRecord] = useState({ heart: 0, lust: 0 }); // 记录区：心动和发情程度
  const [memoryRefined, setMemoryRefined] = useState(""); // 记忆精炼区：场所、规则、称呼
  const [reviewArea, setReviewArea] = useState(""); // 回顾区：历史响应
  const [isMobile, setIsMobile] = useState(false); // 检测是否为移动端
  
  // 历史消息加载管理
  const [loadedMessageCount, setLoadedMessageCount] = useState(5); // 已加载的消息数量
  const [isLoadingMore, setIsLoadingMore] = useState(false); // 是否正在加载更多
  const [hasMoreMessages, setHasMoreMessages] = useState(true); // 是否还有更多消息
  const [initialScrollDone, setInitialScrollDone] = useState(false); // 初始滚动是否完成
  const [isGeneratingImage, setIsGeneratingImage] = useState(false); // 是否正在生成图片
  const [chatTable, setChatTable] = useState(""); // 聊天表名
  const [todayChatCount, setTodayChatCount] = useState("0"); // 今日聊天次数

  // 检测设备类型
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 加载API设置
  useEffect(() => {
    async function loadApiSetting() {
      const setting = await localforage.getItem("api_setting");
      if (setting) {
        setApiSetting(setting as string);
      }
    }
    loadApiSetting();
  }, []);

  useEffect(() => {
    // 等待认证状态检查完成
    if (checkingStatus) {
      return; // 等待认证检查完成
    }

    // 如果检查完成但没有用户信息，说明未登录
    if (!userInfo) {
      router.push("/login");
      return;
    }

    async function loadData() {
      if (!userInfo || userInfo.length === 0) {
        return;
      }

      try {
        // 获取AI信息
        console.log("获取AI信息:");
        const aiInfoResult = await cyberChatApi.current.getAiInfo(
          aiId,
          userInfo[0].uuid
        );
        console.log(aiInfoResult);

        if (aiInfoResult && aiInfoResult.length > 0) {
          setAiInfo(aiInfoResult[0]);
        } else {
          router.push("/home");
          return;
        }

        // 获取聊天记录
        const aiChatList = await cyberChatApi.current.getChatLog(
          userInfo[0].uuid,
          aiId,
          "load_chat_his",
          loadedMessageCount,
          userInfo[0].chat_table
        );

        // 设置聊天列表
        setChatList(aiChatList);
        
        // 保存聊天表名
        setChatTable(userInfo[0].chat_table);
        
        // 检查是否还有更多消息
        if (aiChatList.length < loadedMessageCount) {
          setHasMoreMessages(false);
        }

        console.log(aiChatList);
        setLoadingChat(false);
      } catch (error) {
        console.error("加载数据失败:", error);
      }
    }

    loadData();
  }, [aiId, userInfo, checkingStatus, router, loadedMessageCount]);

  // 加载更多历史消息
  const loadMoreMessages = useCallback(async () => {
    if (!userInfo || isLoadingMore || !hasMoreMessages) return;

    setIsLoadingMore(true);
    const newCount = loadedMessageCount + 5;

    try {
      const container = chatContainerRef.current;
      if (!container) return;

      // 保存当前第一条消息的位置作为锚点
      const firstMessage = container.querySelector('[data-message-id]');
      const firstMessageId = firstMessage?.getAttribute('data-message-id');
      
      // 加载更多消息
      const aiChatList = await cyberChatApi.current.getChatLog(
        userInfo[0].uuid,
        aiId,
        "load_chat_his",
        newCount,
        userInfo[0].chat_table
      );

      // 更新聊天列表
      setChatList(aiChatList);
      setLoadedMessageCount(newCount);

      // 检查是否还有更多消息
      if (aiChatList.length < newCount) {
        setHasMoreMessages(false);
      }

      // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (firstMessageId) {
            // 找到之前的第一条消息，滚动到该位置
            const targetMessage = container.querySelector(`[data-message-id="${firstMessageId}"]`);
            if (targetMessage) {
              targetMessage.scrollIntoView({ block: 'start', behavior: 'auto' });
            }
          }
        });
      });
    } catch (error) {
      console.error("加载更多消息失败:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [userInfo, isLoadingMore, hasMoreMessages, loadedMessageCount, aiId]);

  // 自动滚动到底部（仅在初始加载或发送新消息时）
  useEffect(() => {
    if (!initialScrollDone) {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
      setInitialScrollDone(true);
    } else if (streamingContent || (chatList.length > 0 && !isLoadingMore)) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatList, streamingContent, initialScrollDone, isLoadingMore]);

  // 监听滚动事件，检测是否滚动到顶部
  useEffect(() => {
    if (loadingChat) return;
    
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      
      // 检测是否滚动到顶部（距离顶部小于 50px）
      if (scrollTop < 50 && !isLoadingMore && hasMoreMessages) {
        loadMoreMessages();
      }
    };

    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [loadingChat, chatList.length, isLoadingMore, hasMoreMessages, loadMoreMessages, loadedMessageCount]);

  // 若内容不足以产生滚动，则自动继续加载，直到可滚动或无更多
  const autoLoadTriesRef = useRef(0);
  useEffect(() => {
    if (loadingChat || isLoadingMore || !hasMoreMessages) return;
    const container = chatContainerRef.current;
    if (!container) return;
    const hasScroll = container.scrollHeight > container.clientHeight;
    if (!hasScroll && autoLoadTriesRef.current < 5) {
      autoLoadTriesRef.current += 1;
      loadMoreMessages();
    }
  }, [loadingChat, chatList.length, isLoadingMore, hasMoreMessages, loadMoreMessages]);

  // 生成聊天消息ID和时间戳的辅助函数
  const generateChatTimestamp = () => {
    const timestamp = Date.now();
    return {
      chatId: timestamp.toString(),
      logtime: new Date(timestamp).toISOString(),
    };
  };

  // 生成AI图片
  const handleGenerateImage = async () => {
    if (!aiInfo || !userInfo || isGeneratingImage || isSending) return;
    
    setIsGeneratingImage(true);
    setIsSending(true);
    
    try {
      // 获取最近一条用户消息的原始内容（不包含提示词）
      const lastUserMessage = chatList.filter(c => c.role === "Human").slice(-1)[0];
      const tempUmask = lastUserMessage?.content || "";
      
      // 构建 append_text: AI名称 + 最近在微博发表的动态内容： + 微博内容
      const appendText = aiInfo.last_weibo 
        ? `${aiInfo.nik_name}最近在微博发表的动态内容：${aiInfo.last_weibo}`
        : "";
      
      // 1. 先调用 postGennerImg 生成图片
      // 从最近的聊天记录中提取场景信息
      const lastAIMessage = chatList.filter(c => c.role === "AI").slice(-1)[0];
      const sceneInfo = lastAIMessage ? extractSceneInfo(lastAIMessage.content) : {
        "场景": "",
        "服饰状态细节": "",
        "姿态动作": "",
      };
      
      // 确保字段不为"未提及"，如果是则使用空字符串
      const changjing = sceneInfo["场景"] && sceneInfo["场景"] !== "未提及" 
        ? `场景：${sceneInfo["场景"]}` 
        : "";
      const fushi = sceneInfo["服饰状态细节"] && sceneInfo["服饰状态细节"] !== "未提及"
        ? `服饰状态细节：${sceneInfo["服饰状态细节"]}`
        : "";
      const dongzuo = sceneInfo["姿态动作"] && sceneInfo["姿态动作"] !== "未提及"
        ? `姿态动作：${sceneInfo["姿态动作"]}`
        : "";
      
      const imageResult = await cyberChatApi.current.postGennerImg({
        changjing,
        fushi,
        dongzuo,
        sl_id: aiInfo.sl_id,
        p1: aiInfo.p1?.toString() || "1",
        p2: aiInfo.p2?.toString() || "1",
        p3: aiInfo.p3?.toString() || "1",
        p4: aiInfo.p4?.toString() || "1",
        uid: userInfo[0].id?.toString() || userInfo[0].uuid,
      });
      
      if (!imageResult || imageResult.state === "500" || !imageResult.url) {
        console.error("生成图片失败或返回500");
        setIsGeneratingImage(false);
        setIsSending(false);
        return;
      }
      
      console.log("🖼️ 图片生成成功:", imageResult);
      
      // 拼接图片地址
      const imgUrlPath = GetImgUrl("chat_photo_genner_small", imageResult.url);

      // 2. 加载用户角色绘画信息
      await cyberChatApi.current.loadUserJxj({
        uid: userInfo[0].uuid,
        slid: aiInfo.sl_id,
        type: "",
        chat_table: chatTable,
      });
      
      // 3. 加载聊天前情提要
      await cyberChatApi.current.loadChatPreSummary({
        uid: userInfo[0].uuid,
        slid: aiInfo.sl_id,
        temp_umask_switch: "0",
        temp_umask: tempUmask,
        temp_uname: userInfo[0].user_name,
        append_text: appendText,
        today_chat_cnt: todayChatCount,
        chat_table: chatTable,
      });
      
      // 4. 加载聊天提示词
      const prompts = await cyberChatApi.current.loadChatPrompt(
        userInfo[0].uuid,
        aiId,
        chatTable
      );

      if (!prompts || prompts.length === 0) {
        console.error("加载聊天提示词失败");
        setIsGeneratingImage(false);
        setIsSending(false);
        return;
      }

      // 5. 构建描述消息
      const descMessage = `你给${aiInfo.nik_name}展示了一个关于你自己的画面（即画面中的人物是你），内容如下：[场景：${sceneInfo["场景"] || ""}][服饰状态细节：${sceneInfo["服饰状态细节"] || ""}][姿态动作：${sceneInfo["姿态动作"] || ""}]（动作和话语仅可反馈${aiInfo.nik_name}的，${aiInfo.nik_name}的姿态动作50字左右，${aiInfo.nik_name}说的话语在70字左右并夹杂动作，反馈必须严格遵守"交互区"的命令,且不要遗漏心理活动。(不允许色情内容)`;

      // 6. 构建系统提示词
      let systemPrompt = buildSystemPrompt(aiInfo, userInfo[0].user_name);
      
      // 更新记录区
      systemPrompt = systemPrompt.replace(
        /#### 记录区（存放最近一次的心动和发情程度）[\s\S]*?(?=####|$)/,
        `#### 记录区（存放最近一次的心动和发情程度）
* 心动程度：${emotionRecord.heart}
* 发情程度：${emotionRecord.lust}
`
      );

      // 更新记忆精炼区
      if (memoryRefined) {
        systemPrompt = systemPrompt.replace(
          /#### 记忆精炼区（存放对话时的场所格局，规矩，称呼）[\s\S]*?(?=####|$)/,
          `#### 记忆精炼区（存放对话时的场所格局，规矩，称呼）
${memoryRefined}
`
        );
      }

      // 更新回顾区
      if (reviewArea) {
        systemPrompt = systemPrompt.replace(
          /#### 回顾区（存放历史响应）[\s\S]*?(?=####|$)/,
          `#### 回顾区（存放历史响应）
${reviewArea}
`
        );
      }

      // 7. 构建消息数组
      const messages = [
        {
          role: "system",
          content: systemPrompt,
        },
      ];

      // 添加最近的聊天历史（取最后10条）
      const recentChats = chatList.slice(-10);
      recentChats.forEach((chat) => {
        messages.push({
          role: chat.role === "Human" ? "user" : "assistant",
          content: chat.content,
        });
      });

      // 构建用户提示词并附加到用户消息后
      const userPrompt = buildUserPrompt(aiInfo.nik_name);
      const userMessageWithPrompt = `${descMessage}\n\n${userPrompt}`;

      // 添加当前用户消息（注意：这里 role 改为 system）
      messages.push({
        role: "user",
        content: userMessageWithPrompt,
      });

      // 8. 调用 post_chat_deep
      const response = await cyberChatApi.current.postChatDeep(
        JSON.stringify(messages),
        "low",
        todayChatCount
      );

      if (!response || !response.response) {
        console.error("AI 返回空响应");
        setIsGeneratingImage(false);
        setIsSending(false);
        return;
      }

      const aiResponse = response.response;

      // 更新记录区、记忆精炼区、回顾区
      updateRecordsFromAIResponse(aiResponse);

      // 9. 生成唯一ID和时间戳
      const { chatId, logtime } = generateChatTimestamp();

      // 提取 speech 标签内容（用于 ai_feedback_x）
      const speechMatches = aiResponse.match(/<speech>([\s\S]*?)<\/speech>/g);
      const speechContent = speechMatches
        ? speechMatches.map(m => m.replace(/<\/?speech>/g, '')).join(' ')
        : aiResponse;

      // 提取动作内容（feature 标签）
      const featureMatch = aiResponse.match(/<feature>([\s\S]*?)<\/feature>/);
      const dongzuoText = featureMatch ? featureMatch[1].trim() : "";

      // 提取场景信息
      const aiSceneInfo = extractSceneInfo(aiResponse);
      const sexScore = parseInt(aiSceneInfo["发情程度"]) || 0;

      // 10. chat_log_insert - 插入图片消息
      await cyberChatApi.current.chatLogInsert({
        chat_id: `img${chatId}`,
        user_input: descMessage,
        ai_feedback: aiResponse,
        sl_id: aiId,
        sl_name: aiInfo.nik_name,
        uid: userInfo[0].uuid,
        uname: userInfo[0].user_name,
        has_read: "1",
        pre_summary: "",
        first_chat: "0",
        ctype: "genner_img",
        prompt_tokens_chat: response.promptTokens.toString(),
        completion_tokens_chat: response.completionTokens.toString(),
        prompt_tokens_summary: "0",
        completion_tokens_summary: "0",
        chat_account: response.account,
        summary_account: "",
        chat_post_method: "",
        owner_id: "admin",
        consume: "1",
        create_type: "low",
        slfree: "0",
        ai_feedback_x: speechContent,
        permission: (aiInfo.permission || "237").toString(),
        sex_score: sexScore.toString(),
        dongzuo_text: dongzuoText,
        img_url: imgUrlPath,
        quote_img_order: "",
        img_author: "Human",
        post_chat: "assets/data/post_chat_deep.php",
        time: response.time.toString(),
        emo: "0",
        chat_table: chatTable,
        u_5x_qinmi: "0",
        today_chat_cnt: todayChatCount,
      });

      // 11. 添加到本地聊天列表展示
      // 先添加用户的描述消息
      const newUserMessage: AiChatItem = {
        chat_id: `user${chatId}`,
        new_id: "",
        logtime,
        name: userInfo[0].user_name,
        content: descMessage,
        role: "Human",
        ctype: "text",
        img_url: "",
        quote_img_order: "",
        img_author: "Human",
      };
      
      // 再添加图片消息
      const newImgMessage: AiChatItem = {
        chat_id: `img${chatId}`,
        new_id: "",
        logtime,
        name: userInfo[0].user_name,
        content: "",
        role: "Human",
        ctype: "genner_img",
        img_url: imgUrlPath,
        quote_img_order: "",
        img_author: "Human",
      };
      
      // 添加AI响应消息
      const newAiMessage: AiChatItem = {
        chat_id: `ai${chatId}`,
        new_id: "",
        logtime,
        name: aiInfo.nik_name,
        content: aiResponse,
        role: "AI",
        ctype: "chat",
        img_url: "",
        quote_img_order: "",
        img_author: "AI",
      };

      setChatList((prev) => [...prev, newUserMessage, newImgMessage, newAiMessage]);
      
      // 更新今日聊天次数
      const newTodayChatCount = (parseInt(todayChatCount) + 1).toString();
      setTodayChatCount(newTodayChatCount);
      
    } catch (error) {
      console.error("生成图片失败:", error);
    } finally {
      setIsGeneratingImage(false);
      setIsSending(false);
    }
  };

  // 发送消息函数
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending || !aiInfo || !userInfo) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    // 生成唯一ID和时间戳
    const { chatId, logtime } = generateChatTimestamp();

    // 添加用户消息到聊天列表
    const newUserMessage: AiChatItem = {
      chat_id: chatId,
      new_id: "",
      logtime: logtime,
      name: userInfo[0].user_name,
      content: userMessage,
      role: "Human",
      ctype: "text",
      img_url: "",
      quote_img_order: "",
      img_author: "Human",
    };

    setChatList((prev) => [...prev, newUserMessage]);

    try {
      // 判断使用哪个API
      if (apiSetting === "deepseek") {
        // 使用 DeepSeek API
        await handleDeepSeekChat(userMessage);
      } else if (apiSetting === "cyberchat") {
        // 使用 CyberChat API（非流式）
        await handleCyberChatChat(userMessage);
      } else {
        // TODO: 实现自定义 API 逻辑
        console.log("自定义 API 逻辑待实现");
        setIsSending(false);
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      setIsSending(false);
    }
  };

  // 从AI回复中提取并更新记录
  const updateRecordsFromAIResponse = (content: string) => {
    const sceneInfo = extractSceneInfo(content);
    
    console.log("🔍 提取的场景信息:", sceneInfo);
    
    // 更新情感记录（如果提取失败，保持原值）
    const heartValue = sceneInfo["心动程度"] !== "未提及" 
      ? parseInt(sceneInfo["心动程度"]) || emotionRecord.heart
      : emotionRecord.heart;
    const lustValue = sceneInfo["发情程度"] !== "未提及"
      ? parseInt(sceneInfo["发情程度"]) || emotionRecord.lust
      : emotionRecord.lust;
    
    setEmotionRecord({ heart: heartValue, lust: lustValue });

    // 提取mem标签内容更新记忆精炼区
    const memMatch = content.match(/<mem>([\s\S]*?)<\/mem>/);
    if (memMatch) {
      console.log("📝 提取到 mem 内容:", memMatch[1].trim());
      setMemoryRefined(memMatch[1].trim());
    } else {
      console.log("⚠️ 未找到 mem 标签");
    }

    // 提取summary标签内容更新回顾区
    const summaryMatch = content.match(/<summary>([\s\S]*?)<\/summary>/);
    if (summaryMatch) {
      console.log("📋 提取到 summary 内容:", summaryMatch[1].trim());
      setReviewArea(summaryMatch[1].trim());
    } else {
      console.log("⚠️ 未找到 summary 标签");
    }
  };

  // CyberChat 聊天处理（非流式）
  const handleCyberChatChat = async (userMessage: string) => {
    if (!aiInfo || !userInfo) return;

    // 显示加载状态（非流式，所以不显示实时内容）
    setIsStreaming(true);

    try {
      // 1. 加载聊天提示词
      const prompts = await cyberChatApi.current.loadChatPrompt(
        userInfo[0].uuid,
        aiId,
        userInfo[0].chat_table
      );

      if (!prompts || prompts.length === 0) {
        console.error("加载聊天提示词失败");
        setIsStreaming(false);
        setIsSending(false);
        return;
      }

      // 2. 构建系统提示词
      let systemPrompt = buildSystemPrompt(aiInfo, userInfo[0].user_name);
      
      // 更新记录区
      systemPrompt = systemPrompt.replace(
        /#### 记录区（存放最近一次的心动和发情程度）[\s\S]*?(?=####|$)/,
        `#### 记录区（存放最近一次的心动和发情程度）
* 心动程度：${emotionRecord.heart}
* 发情程度：${emotionRecord.lust}
`
      );

      // 更新记忆精炼区
      if (memoryRefined) {
        systemPrompt = systemPrompt.replace(
          /#### 记忆精炼区（存放对话时的场所格局，规矩，称呼）[\s\S]*?(?=####|$)/,
          `#### 记忆精炼区（存放对话时的场所格局，规矩，称呼）
${memoryRefined}
`
        );
      }

      // 更新回顾区
      if (reviewArea) {
        systemPrompt = systemPrompt.replace(
          /#### 回顾区（存放历史响应）[\s\S]*?(?=####|$)/,
          `#### 回顾区（存放历史响应）
${reviewArea}
`
        );
      }

      // 3. 构建消息数组（CyberChat 格式）
      const messages = [
        {
          role: "system",
          content: systemPrompt,
        },
      ];

      // 添加最近的聊天历史（取最后10条）
      const recentChats = chatList.slice(-10);
      recentChats.forEach((chat) => {
        messages.push({
          role: chat.role === "Human" ? "user" : "assistant",
          content: chat.content,
        });
      });

      // 构建用户提示词并附加到用户消息后
      const userPrompt = buildUserPrompt(aiInfo.nik_name);
      const userMessageWithPrompt = `${userMessage}\n\n${userPrompt}`;

      // 添加当前用户消息
      messages.push({
        role: "user",
        content: userMessageWithPrompt,
      });

      // 4. 调用 CyberChat API
      const response = await cyberChatApi.current.postChatDeep(
        JSON.stringify(messages),
        "low",
        "0"
      );

      if (!response || !response.response) {
        console.error("CyberChat API 返回空响应");
        setIsStreaming(false);
        setIsSending(false);
        return;
      }

      const aiResponse = response.response;

      // 5. 更新记录区、记忆精炼区、回顾区
      updateRecordsFromAIResponse(aiResponse);

      // 6. 生成唯一ID和时间戳
      const { chatId, logtime } = generateChatTimestamp();

      // 7. 提取 speech 标签内容（用于 ai_feedback_x）
      const speechMatches = aiResponse.match(/<speech>([\s\S]*?)<\/speech>/g);
      const speechContent = speechMatches
        ? speechMatches.map(m => m.replace(/<\/?speech>/g, '')).join(' ')
        : aiResponse;

      // 8. 提取动作内容（feature 标签）
      const featureMatch = aiResponse.match(/<feature>([\s\S]*?)<\/feature>/);
      const dongzuoText = featureMatch ? featureMatch[1].trim() : "";

      // 9. 提取场景信息
      const sceneInfo = extractSceneInfo(aiResponse);
      const sexScore = parseInt(sceneInfo["发情程度"]) || 0;

      // 10. 插入聊天日志到 CyberChat 数据库
      await cyberChatApi.current.chatLogInsert({
        chat_id: `t2ubrv${chatId}`,
        user_input: userMessage,
        ai_feedback: aiResponse,
        sl_id: aiId,
        sl_name: aiInfo.nik_name,
        uid: userInfo[0].uuid,
        uname: userInfo[0].user_name,
        has_read: "1",
        pre_summary: "",
        first_chat: "0",
        ctype: "chat",
        prompt_tokens_chat: response.promptTokens.toString(),
        completion_tokens_chat: response.completionTokens.toString(),
        prompt_tokens_summary: "0",
        completion_tokens_summary: "0",
        chat_account: response.account,
        summary_account: "",
        chat_post_method: "",
        owner_id: "admin",
        consume: "1",
        create_type: "low",
        slfree: "0",
        ai_feedback_x: speechContent,
        permission: (aiInfo.permission || "237").toString(),
        sex_score: sexScore.toString(),
        dongzuo_text: dongzuoText,
        img_url: "",
        quote_img_order: "",
        img_author: "",
        post_chat: "assets/data/post_chat_deep.php",
        time: response.time.toString(),
        emo: "0",
        chat_table: userInfo[0].chat_table,
        u_5x_qinmi: "0",
        today_chat_cnt: "0",
      });

      // 11. 添加AI消息到聊天列表
      const newAiMessage: AiChatItem = {
        chat_id: `t2ubrv${chatId}`,
        new_id: "",
        logtime: logtime,
        name: aiInfo.nik_name,
        content: aiResponse,
        role: "AI",
        ctype: "chat",
        img_url: "",
        quote_img_order: "",
        img_author: "AI",
      };

      setChatList((prev) => [...prev, newAiMessage]);
      setIsStreaming(false);
      setIsSending(false);
    } catch (error) {
      console.error("CyberChat API 调用失败:", error);
      setIsStreaming(false);
      setIsSending(false);
    }
  };

  // DeepSeek 聊天处理
  const handleDeepSeekChat = async (userMessage: string) => {
    if (!aiInfo || !userInfo) return;

    setIsStreaming(true);
    setStreamingContent("");

    // 构建系统提示词，包含历史记录区
    let systemPrompt = buildSystemPrompt(aiInfo, userInfo[0].user_name);
    
    // 在系统提示词中更新记录区
    systemPrompt = systemPrompt.replace(
      /#### 记录区（存放最近一次的心动和发情程度）[\s\S]*?(?=####|$)/,
      `#### 记录区（存放最近一次的心动和发情程度）
* 心动程度：${emotionRecord.heart}
* 发情程度：${emotionRecord.lust}
`
    );

    // 在系统提示词中更新记忆精炼区
    if (memoryRefined) {
      systemPrompt = systemPrompt.replace(
        /#### 记忆精炼区（存放对话时的场所格局，规矩，称呼）[\s\S]*?(?=####|$)/,
        `#### 记忆精炼区（存放对话时的场所格局，规矩，称呼）
${memoryRefined}
`
      );
    }

    // 在系统提示词中更新回顾区
    if (reviewArea) {
      systemPrompt = systemPrompt.replace(
        /#### 回顾区（存放历史响应）[\s\S]*?(?=####|$)/,
        `#### 回顾区（存放历史响应）
${reviewArea}
`
      );
    }

    // 构建消息历史
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // 添加最近的聊天历史（取最后10条）
    const recentChats = chatList.slice(-10);
    recentChats.forEach((chat) => {
      messages.push({
        role: chat.role === "Human" ? "user" : "assistant",
        content: chat.content,
      });
    });

    // 构建用户提示词并附加到用户消息后（不显示）
    const userPrompt = buildUserPrompt(aiInfo.nik_name);
    const userMessageWithPrompt = `${userMessage}\n\n${userPrompt}`;

    // 添加当前用户消息（带提示词）
    messages.push({
      role: "user",
      content: userMessageWithPrompt,
    });

    try {
      // 调用流式API
      await postChatUseDeepSeek(
        {
          messages,
          model: "deepseek-chat",
          stream: true,
          temperature: 0.7,
          max_tokens: 2048,
        },
        (chunk: StreamChunk) => {
          // 处理流式数据块
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            setStreamingContent((prev) => prev + content);
          }
        },
        (fullContent: string) => {
          // 流式传输完成
          console.log("流式传输完成，完整内容:", fullContent);

          // 更新记录区、记忆精炼区、回顾区
          updateRecordsFromAIResponse(fullContent);

          // 生成唯一ID和时间戳
          const { chatId, logtime } = generateChatTimestamp();

          // 添加AI消息到聊天列表
          const newAiMessage: AiChatItem = {
            chat_id: chatId,
            new_id: "",
            logtime: logtime,
            name: aiInfo.nik_name,
            content: fullContent,
            role: "AI",
            ctype: "text",
            img_url: "",
            quote_img_order: "",
            img_author: "AI",
          };

          setChatList((prev) => [...prev, newAiMessage]);
          setStreamingContent("");
          setIsStreaming(false);
          setIsSending(false);
        }
      );
    } catch (error) {
      console.error("DeepSeek API 调用失败:", error);
      setIsStreaming(false);
      setIsSending(false);
      setStreamingContent("");
    }
  };

  // 显示加载状态
  if (loadingChat) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] w-full overflow-hidden">
      {/* 固定顶部 - 标题 */}
      <div className="shrink-0">
      <DynamicTitle aiInfo={aiInfo} />
      </div>

      {/* 中间滚动区域 - 聊天消息（独立滚动）*/}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
      >
        <div className="p-4 space-y-4">
          {/* 加载更多指示器 */}
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner className="h-4 w-4" />
                <span>加载更多消息...</span>
                    </div>
                  </div>
          )}
          
          {/* 没有更多消息提示 */}
          {!hasMoreMessages && chatList.length > 0 && (
            <div className="flex justify-center py-2">
              <span className="text-xs text-muted-foreground">没有更多消息了</span>
                </div>
          )}
          
          {chatList.map((item: AiChatItem, index) => (
            <div key={index} data-message-id={item.chat_id}>
              <MessageItem
                handleGenerateImage={handleGenerateImage}
                item={item}
                userInfo={userInfo}
                aiInfo={aiInfo}
                isMobile={isMobile}
              />
              </div>
          ))}

          {/* 显示流式传输中的消息（DeepSeek）*/}
          {isStreaming && streamingContent && (
            <StreamingMessage content={streamingContent} aiInfo={aiInfo} />
          )}

          {/* 显示加载状态（CyberChat 非流式）*/}
          {isStreaming && !streamingContent && apiSetting === "cyberchat" && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 bg-muted px-4 py-3 rounded-lg">
                <Spinner className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  {aiInfo?.nik_name} 正在思考...
                </span>
                                </div>
                              </div>
          )}

          {/* 滚动锚点 */}
          <div ref={chatEndRef} />
                </div>
      </div>

      {/* 固定底部 - 输入框（在滚动容器外）*/}
      <div className="shrink-0 border-t bg-background">
        <ChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={handleSendMessage}
          onGenerateImage={handleGenerateImage}
          disabled={isSending}
          isGeneratingImage={isGeneratingImage}
        />
      </div>
    </div>
  );
}
