// 新增一个解码 HTML 实体的函数
const decodeHtml = (html: string) => {
  // 1. 先将 <br> 和 <br/> 标签转换为换行符
  const decoded = html.replace(/<br\s*\/?>/gi, '\n');
  
  // 2. 然后解码 HTML 实体
  const textArea = document.createElement("textarea");
  textArea.innerHTML = decoded;
  return textArea.value;
};

// 优化后的标签解析函数（支持多个相同标签）
const parseTags = (content: string) => {
  const decodedContent = decodeHtml(content); // 先解码HTML实体
  const result: Array<{
    type: "text" | "speech" | "inner thoughts" | "summary" | "feature" | "mem";
    content: string;
  }> = [];

  // 正则：匹配所有标签对（支持 speech/inner thoughts/inner+thoughts/summary/feature/mem）
  // 分组1：标签名，分组2：标签内内容
  const tagPairRegex = /<(speech|inner thoughts|inner\+thoughts|summary|feature|mem)>([\s\S]*?)<\/\1>/g;
  let lastIndex = 0; // 记录上一次匹配结束的位置

  // 循环匹配所有标签对
  decodedContent.replace(tagPairRegex, (match, tagName, content, offset) => {
    // 提取标签前的普通文本
    if (offset > lastIndex) {
      result.push({
        type: "text",
        content: decodedContent.slice(lastIndex, offset).trim(),
      });
    }

    // 将 inner+thoughts 标准化为 inner thoughts
    const normalizedTagName = tagName === "inner+thoughts" ? "inner thoughts" : tagName;

    // 提取标签内的内容
    result.push({
      type: normalizedTagName as "speech" | "inner thoughts" | "summary" | "feature" | "mem",
      content: content.trim(),
    });

    lastIndex = offset + match.length; // 更新最后匹配位置
    return match; // replace函数要求的返回值（不影响结果）
  });

  // 提取最后一个标签后的普通文本
  if (lastIndex < decodedContent.length) {
    result.push({
      type: "text",
      content: decodedContent.slice(lastIndex).trim(),
    });
  }

  // 过滤空内容
  return result.filter((item) => item.content);
};

const extractSceneInfo = (content: string) => {
  const fields = [
    "场景",
    "服饰状态细节",
    "姿态动作",
    "事件信息提炼",
    "发情程度",
    "心动程度",
  ];

  // 1. 先解码HTML实体
  let decodedContent = decodeHtml(content);

  // 2. 移除所有HTML标签（包括<summary>、</summary>等）
  decodedContent = decodedContent.replace(/<\/?[^>]+>/g, "");

  // 3. 规范空白：仅压缩连续空白为单个空格，保留原有分号/标点
  decodedContent = decodedContent.replace(/\s+/g, " ").trim();

  const result: Record<string, string> = {};

  const nextFieldsPattern = `(场景|服饰状态细节|姿态动作|事件信息提炼|发情程度|心动程度)\s*[:：]`;

  fields.forEach((field) => {
    let regex;
    if (field === "发情程度" || field === "心动程度") {
      // 匹配"发情程度:值"或"心动程度:值"，允许值为数字、负数、中文
      regex = new RegExp(
        `${field}[:：]([-]?[0-9一二三四五六七八九十几中高低]+)`,
        "i"
      );
    } else {
      // 匹配当前字段到下一个"已知字段名"或字符串结束
      // 允许字段名与冒号间、以及字段值与下一个字段名之间存在空白和分隔符（；，、等）
      const currentField = `${field}\\s*[:：]\\s*`;
      const stopLookahead = `(?=\\s*[;；、，,]*\\s*${nextFieldsPattern}|$)`;
      regex = new RegExp(`${currentField}([\\s\\S]*?)${stopLookahead}`, "i");
    }

    const match = decodedContent.match(regex);
    if (match && match[1]) {
      // 清理内容：移除末尾的分号和空白
      const content = match[1]
        .trim()
        .replace(/[;；、，,]+$/, '')
        .trim();
      result[field] = content || "未提及";
    } else {
      result[field] = "未提及";
    }
  });

  return result;
};

const decodeImageUrl = (url: string) => {
  // 1. 先解码 URL（处理 &amp; 和 %26 等编码）
  let decodedUrl = url.replace(/&amp;/g, "&");
  decodedUrl = decodeURIComponent(decodedUrl);

  // 2. 替换域名：https://cyberchat.vip/ → /api/（本地 API 路径）
  return decodedUrl.replace("https://cyberchat.vip/", "/api/");
};

export { extractSceneInfo, parseTags, decodeHtml, decodeImageUrl };
