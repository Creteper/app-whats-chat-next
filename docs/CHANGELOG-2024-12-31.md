# 更新日志 - 2024年12月31日

## 🎉 重大更新：完整的对话历史记录管理系统

### 概述
本次更新实现了智能对话历史管理系统，支持心动程度追踪、场景信息交互式展示，以及多speech标签渲染等功能。

---

## ✨ 新增功能

### 1. 对话历史记录管理系统

实现了三个核心记录区域：

#### 📊 记录区
- **功能**: 实时追踪AI角色的情感状态
- **追踪内容**:
  - 心动程度 (-100 ~ 99)
  - 发情程度 (-100 ~ 99)
- **工作方式**: 
  - 从AI回复的 `<summary>` 标签中自动提取
  - 在下次对话时注入到系统提示词中
  - AI可以根据历史情感状态做出连贯反应

#### 📝 记忆精炼区
- **功能**: 保存关键的场景和规则信息
- **保存内容**:
  - 场所格局（如：卧室布局、教室座位等）
  - 双方约定的规则
  - 相互之间的称呼
- **数据来源**: 从 `<mem>` 标签中提取
- **作用**: 帮助AI保持角色一致性和场景连贯性

#### 🔄 回顾区
- **功能**: 保存历史对话的场景状态
- **保存内容**: 最近的 `<summary>` 标签完整内容
- **作用**: 让AI记住之前的场景细节

### 2. 心动程度支持

#### 提取和显示
- 在 `lib/chat-content.ts` 中添加心动程度提取逻辑
- 支持负数值（-100 ~ 99）
- 与发情程度并列显示

#### 视觉设计
- **图标**: ✨ Sparkles（玫瑰色）
- **区分**: 与发情程度的 ❤️ Heart（粉色）区分开
- **位置**: 在场景信息卡片和图标按钮中显示

### 3. 用户提示词自动附加

#### 功能说明
- 在每条用户消息后自动附加 `UserPrompt`
- 不在界面中显示，仅用于后端处理
- 动态替换 `{ai_name}` 占位符

#### 实现细节
```typescript
// 构建用户提示词
const userPrompt = buildUserPrompt(aiInfo.nik_name);
const userMessageWithPrompt = `${userMessage}\n\n${userPrompt}`;
```

#### UserPrompt 内容
```
（动作和话语仅可反馈{ai_name}的，{ai_name}的姿态动作50字左右，
{ai_name}说的话语在100字左右可以回复多个句子至少3句，但这最多不能超过5句，
每一句都是100字左右,每一句都需要使用<speech>标签并夹杂动作，
反馈必须严格遵守"交互区"的命令,不要忘记事件信息提炼,且不要遗漏心理活动。)
```

### 4. 交互式场景信息UI

#### 设计理念
将原本折叠的场景信息改为图标按钮 + Tooltip 的交互方式，更加现代和紧凑。

#### 图标映射
| 信息类型 | 图标 | 颜色 | 说明 |
|---------|------|------|------|
| 场景 | 📍 MapPin | 默认 | 当前所处位置 |
| 服饰 | 👔 Shirt | 默认 | 服饰状态细节 |
| 动作 | 🏃 Activity | 默认 | 姿态和动作 |
| 事件 | 🛤️ Route | 默认 | 事件信息链 |
| 发情度 | ❤️ Heart | 粉色 | 发情程度数值 |
| 心动度 | ✨ Sparkles | 玫瑰色 | 心动程度数值 |

#### 展示位置
- 在 `<feature>` 标签内容下方自动显示
- 只显示有值的信息（未提及的不显示）
- 悬停图标按钮显示详细内容

#### 用户体验
```
✨ 将要拿起水杯

[📍场景] [👔服饰] [🏃动作] [🛤️事件] [❤️发情度] [✨心动度]
   ↑ 悬停显示详细信息
```

### 5. 多 Speech 标签支持

#### 功能说明
- 完整支持在一次AI回复中使用多个 `<speech>` 标签
- 每个 `<speech>` 标签独立渲染为一个对话气泡
- 时间戳只在最后一个 speech 后显示

#### 实现逻辑
```typescript
const isLastSpeech = part.type === "speech" && 
  !array.slice(idx + 1).some(p => p.type === "speech");

{isLastSpeech && (
  <div className="text-xs text-muted-foreground mt-1">
    {new Date().toLocaleTimeString()}
  </div>
)}
```

#### 渲染效果
```
┌─────────────────────────┐
│ 你好，很高兴见到你！     │
└─────────────────────────┘

┌─────────────────────────┐
│ 今天天气真不错          │
└─────────────────────────┘

┌─────────────────────────┐
│ 我们出去走走吧？        │
└─────────────────────────┘
  10:30:45 AM
```

---

## 🔧 技术实现

### 1. 状态管理
```typescript
// 对话历史记录状态
const [emotionRecord, setEmotionRecord] = useState({ heart: 0, lust: 0 });
const [memoryRefined, setMemoryRefined] = useState("");
const [reviewArea, setReviewArea] = useState("");
```

### 2. 记录更新函数
```typescript
const updateRecordsFromAIResponse = (content: string) => {
  const sceneInfo = extractSceneInfo(content);
  
  // 更新情感记录
  const heartValue = parseInt(sceneInfo["心动程度"]) || 0;
  const lustValue = parseInt(sceneInfo["发情程度"]) || 0;
  setEmotionRecord({ heart: heartValue, lust: lustValue });

  // 更新记忆精炼区
  const memMatch = content.match(/<mem>([\s\S]*?)<\/mem>/);
  if (memMatch) setMemoryRefined(memMatch[1].trim());

  // 更新回顾区
  const summaryMatch = content.match(/<summary>([\s\S]*?)<\/summary>/);
  if (summaryMatch) setReviewArea(summaryMatch[1].trim());
};
```

### 3. 系统提示词动态更新
```typescript
// 在系统提示词中更新记录区
systemPrompt = systemPrompt.replace(
  /#### 记录区（存放最近一次的心动和发情程度）[\s\S]*?(?=####|$)/,
  `#### 记录区（存放最近一次的心动和发情程度）
* 心动程度：${emotionRecord.heart}
* 发情程度：${emotionRecord.lust}
`
);
```

### 4. Tooltip 组件使用
```typescript
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline" size="sm">
        <Heart className="h-3.5 w-3.5 text-pink-500" />
        <span className="text-xs">发情度</span>
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{sceneInfo["发情程度"]}</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## 📦 依赖更新

### 新增图标
```typescript
import { 
  MapPin,      // 场景位置
  Shirt,       // 服饰
  Activity,    // 动作
  Route,       // 事件
  Heart,       // 发情度
  Sparkles     // 心动度
} from "lucide-react";
```

### UI 组件
```typescript
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
```

---

## 📝 文档更新

### 更新的文档
1. `README.md` - 添加新功能说明
2. `docs/AI-TAGS-STYLE-GUIDE.md` - 更新标签使用指南
3. `docs/CHANGELOG-2024-12-31.md` - 本更新日志

### 新增内容
- 对话历史记录系统说明
- 心动程度和发情程度追踪机制
- 交互式场景信息UI使用方法
- 多 speech 标签渲染规则

---

## 🎨 样式优化

### 颜色主题
- **心动度**: `text-rose-500`（玫瑰色）
- **发情度**: `text-pink-500`（粉色）
- 两者使用不同颜色便于区分

### 图标按钮样式
```css
variant="outline"
size="sm"
className="h-8 gap-1.5"
```

### Tooltip 最大宽度
```css
max-w-xs  // 适合较长的服饰描述等
```

---

## ✅ 测试建议

### 功能测试
1. **对话连贯性测试**:
   - 发送多轮对话
   - 检查心动度和发情度是否正确更新
   - 验证AI是否根据历史情感状态做出反应

2. **记忆保持测试**:
   - 设定场所规则和称呼
   - 在后续对话中验证AI是否记住
   - 检查记忆精炼区的内容更新

3. **多 speech 标签测试**:
   - 让AI生成包含3-5个 speech 标签的回复
   - 检查每个标签是否独立渲染
   - 验证时间戳只在最后显示

4. **场景信息UI测试**:
   - 悬停每个图标按钮
   - 检查 Tooltip 内容是否正确
   - 验证未提及的信息不显示图标

### UI测试
- 不同屏幕尺寸下的显示效果
- 深色/浅色模式切换
- 图标按钮的响应速度
- Tooltip 显示位置和内容

---

## 🐛 已知问题

### 暂无已知问题

如发现问题，请及时反馈。

---

## 🔮 未来计划

### 潜在改进
1. **记录区持久化**: 将历史记录保存到 localforage
2. **记录区可视化**: 添加情感曲线图表
3. **记忆精炼区编辑**: 允许用户手动编辑记忆内容
4. **场景信息导出**: 支持导出场景信息为文本
5. **多轮对话分析**: 统计分析对话质量

---

## 👥 贡献者

- AI Assistant (Claude Sonnet 4.5)
- 用户需求和测试

---

## 📄 许可证

MIT License

---

**更新时间**: 2024年12月31日  
**版本**: v2.0.0  
**状态**: ✅ 已完成并测试

