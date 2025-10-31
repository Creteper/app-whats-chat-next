# Whats Chat Next.js 应用

这是一个基于 Next.js 16 的智能聊天应用，支持与多个AI进行对话。

## 功能特性

- 🔐 用户登录认证系统
- 🤖 多AI聊天支持
- 💬 流式对话渲染（实时显示AI回复）
- 🔄 多AI供应商支持（DeepSeek、CyberChat）
- 🎯 智能提示词系统（自动替换角色信息）
- 📝 实时标签解析渲染
- 💾 客户端数据存储（localforage）
- 🍪 服务端Cookie认证
- 📱 响应式设计
- 🎨 现代化UI界面
- 📲 移动端悬浮导航栏
- 🔄 智能滚动检测

## 技术栈

- **框架**: Next.js 16.0.0 (Turbopack)
- **前端**: React 19.2.0
- **样式**: Tailwind CSS 4
- **存储**: localforage (客户端) + Cookies (服务端)
- **HTTP客户端**: Axios + Fetch API (流式请求)
- **AI服务**: DeepSeek API、CyberChat API
- **UI组件**: Radix UI
- **动画**: Motion/React
- **类型检查**: TypeScript 5

## 项目结构

```
app-whats-chat-next/
├── app/                    # Next.js App Router 页面
│   ├── home/              # 主应用页面
│   │   ├── chat/[id]/     # 聊天页面
│   │   ├── message/       # 消息页面
│   │   └── profile/       # 个人资料页面
│   ├── login/             # 登录页面
│   └── layout.tsx         # 根布局
├── components/            # React 组件
│   ├── ui/               # 基础UI组件
│   └── ...               # 业务组件
├── lib/                  # 工具库
│   ├── cyberchat.tsx     # CyberChat API客户端
│   ├── chats.ts          # DeepSeek API客户端
│   ├── propmt.ts         # 系统提示词模板
│   ├── prompt-builder.ts # 提示词构建工具
│   ├── chat-content.ts   # 聊天内容解析工具
│   ├── client-storage.ts # 客户端存储工具
│   ├── server-auth.ts    # 服务端认证工具
│   └── ...               # 其他工具
├── types/                # TypeScript 类型定义
└── public/               # 静态资源
```

## 核心功能说明

### 1. 用户认证系统

- **客户端存储**: 使用 `localforage` 在浏览器中存储用户信息
- **服务端认证**: 使用 Next.js Cookies API 在服务端获取用户信息
- **双重存储**: 登录时同时保存到 localforage 和 cookies

### 2. AI聊天功能

- **动态元数据**: 根据AI信息动态生成页面标题和描述
- **服务端渲染**: 在 `generateMetadata` 中安全地获取AI信息
- **流式对话**: 实时显示AI回复内容，提升用户体验
- **多供应商支持**: 支持切换不同的AI服务提供商
- **智能提示词**: 自动替换提示词中的角色信息
- **标签解析**: 实时解析并渲染特殊标签（如 speech、inner thoughts 等）
- **错误处理**: 完善的错误处理和降级方案

### 3. 存储策略

#### 客户端存储 (`lib/client-storage.ts`)
```typescript
// 安全地获取用户信息（仅在客户端）
export async function getClientUserInfo(): Promise<UserInfo | null>

// 安全地设置用户信息（仅在客户端）
export async function setClientUserInfo(userInfo: UserInfo): Promise<void>
```

#### 服务端认证 (`lib/server-auth.ts`)
```typescript
// 从 cookies 中获取用户信息
export async function getServerUserInfo(): Promise<UserInfo | null>

// 获取AI信息并生成标题
export async function getAiInfoAndTitle(aiId: string): Promise<{title: string, description: string}>
```

#### AI对话功能 (`lib/chats.ts`, `lib/prompt-builder.ts`)
```typescript
// DeepSeek API流式对话
export async function postChatUseDeepSeek(
  request: ChatCompletionRequest,
  onStreamChunk?: (chunk: StreamChunk) => void,
  onStreamComplete?: (fullContent: string) => void
): Promise<ChatCompletionResponse | null>

// 构建系统提示词
export function buildSystemPrompt(
  aiInfo: AgentItems,
  userName: string
): string
```

## 最近更新

### 移动端适配和提示词优化 (2024-12-31)

**功能**: 优化移动端场景信息展示和强化AI回复质量

**实现内容**:
1. **移动端场景信息展示**:
   - 使用 Sheet（抽屉）组件替代 Tooltip
   - 移动端点击"查看场景详情"按钮打开抽屉
   - 抽屉从底部滑出，占屏幕80%高度
   - 清晰的分类展示所有场景信息
   - 桌面端保持原有 Tooltip 悬停交互

2. **响应式设备检测**:
   - 自动检测屏幕宽度（< 768px 为移动端）
   - 监听窗口大小变化，动态切换展示方式
   - 确保在所有设备上都有良好体验

3. **UserPrompt 强化**:
   - 添加醒目的"重要提醒"区域
   - 明确要求必须包含心动程度和发情程度
   - 指定数值格式和范围（-100 ~ 99）
   - 强调两个数值缺一不可

**技术细节**:
- 使用 Radix UI Sheet 组件
- 窗口 resize 事件监听
- 条件渲染（移动端/桌面端）

### 实现完整的对话历史记录管理和场景信息UI优化 (2024-12-31)

**功能**: 实现智能对话历史管理系统和交互式场景信息展示

**实现内容**:
1. **对话历史记录管理**:
   - 记录区：实时追踪心动程度和发情程度
   - 回顾区：保存历史响应的 summary 内容
   - 记忆精炼区：保存 mem 标签中的场所、规则、称呼信息
   - 自动更新系统提示词，让AI保持上下文连贯

2. **用户提示词自动附加**:
   - 在用户消息后自动附加 UserPrompt
   - 不在界面中显示，仅用于指导AI回复
   - 动态替换 `{ai_name}` 占位符

3. **心动程度支持**:
   - 添加心动程度提取和显示
   - 与发情程度一起追踪情感变化
   - 在场景信息中使用不同图标区分

4. **交互式场景信息UI**:
   - 使用 Lucide 图标美化场景信息
   - Tooltip 悬停提示详细信息
   - 图标按钮式设计，更加紧凑美观
   - 图标映射：
     * 📍 MapPin - 场景
     * 👔 Shirt - 服饰
     * 🏃 Activity - 动作
     * 🛤️ Route - 事件
     * ❤️ Heart - 发情度（粉色）
     * ✨ Sparkles - 心动度（玫瑰色）

5. **多 speech 标签支持**:
   - 完整支持多个 `<speech>` 标签渲染
   - 只在最后一个 speech 后显示时间戳
   - 避免重复显示时间信息

**技术细节**:
- 使用 React 状态管理历史记录
- 正则表达式动态替换系统提示词
- Radix UI Tooltip 组件提供交互提示
- Lucide React 图标库
- 智能标签检测算法

### 优化AI对话标签渲染和样式 (2024-12-31)

**功能**: 完善 AI 对话中各类标签的解析和渲染，提升视觉体验

**实现内容**:
1. 添加了 `feature` 标签解析（即将要做的事）
2. 添加了 `mem` 标签解析（记忆总结）
3. 优化了所有标签的样式设计：
   - **speech**: 对话气泡样式，带阴影
   - **inner thoughts**: 淡红色斜体，左侧边框，emoji 图标 💭
   - **feature**: 蓝色主题，左侧边框，emoji 图标 ✨
   - **mem**: 紫色主题，可折叠，emoji 图标 📝
   - **summary**: 渐变背景，可折叠卡片，emoji 图标 📊
   - **text**: 淡化显示的普通文本
4. 支持深色模式自适应
5. 流式传输时添加动画效果（animate-pulse）

**技术细节**:
- 使用 Tailwind CSS 的多色彩主题系统
- 使用 HTML `<details>` 元素实现可折叠功能
- 支持浅色/深色模式切换
- 优化了文本换行和溢出处理

## 最近修复

### 修复服务端渲染错误 (2024-12-19)

**问题**: `generateMetadata` 函数中使用 `localforage` 导致 "No available storage method found" 错误

**解决方案**:
1. 创建了 `lib/server-auth.ts` 服务端认证工具
2. 使用 Next.js Cookies API 在服务端获取用户信息
3. 修改登录流程，同时保存到 localforage 和 cookies
4. 更新 `generateMetadata` 使用服务端安全的方案

**技术细节**:
- 避免了在服务端使用 `localforage`
- 保持了客户端和服务端的数据同步
- 实现了动态页面标题生成

### 修复 JSON.parse 错误 (2024-12-19)

**问题**: Cookie 中的 JSON 字符串导致 "Unterminated string" 错误

**解决方案**:
1. 简化 Cookie 存储，只保存必要的用户信息
2. 使用 `encodeURIComponent` 和 `decodeURIComponent` 处理特殊字符
3. 添加完善的错误处理和调试信息

**技术细节**:
- 避免了 Cookie 大小限制问题
- 实现了安全的编码/解码机制
- 添加了详细的调试日志

### 修复服务端 axios baseURL 错误 (2024-12-19)

**问题**: 服务端环境中 axios 使用相对路径导致 "Invalid URL" 错误

**解决方案**:
1. 在 `CyberChatAPI` 构造函数中检测服务端环境
2. 服务端使用完整的 URL (`https://cyberchat.vip/api/chat2/assets/data/`)
3. 客户端继续使用相对路径 (`/api/chat2/assets/data/`)

### 修复服务端 API 认证错误 (2024-12-19)

**问题**: 服务端环境中调用 API 导致 HTTP 406 错误，因为缺少必要的认证信息

**解决方案**:
1. 修改 `getAiInfoAndTitle` 避免在服务端调用外部 API
2. 创建 `DynamicTitle` 客户端组件动态更新页面标题
3. 服务端使用默认标题，客户端在 hydration 后更新

**技术细节**:
- 避免了服务端 API 调用的认证问题
- 实现了服务端渲染和客户端动态更新的混合方案
- 保持了良好的用户体验和 SEO 优化

### 实现移动端悬浮导航栏 (2024-12-19)

**功能**: 在手机端滚动时，当头部导航栏滚动到不可见时，显示悬浮的 tabbar

**实现方案**:
1. 创建了 `useElementVisibility` hook 监听元素可见性
2. 创建了 `FloatingTabBar` 组件提供悬浮导航
3. 使用 `IntersectionObserver` API 精确检测滚动状态
4. 添加了毛玻璃效果和流畅的动画过渡

**技术细节**:
- 使用 `IntersectionObserver` 监听头部可见性
- 实现了毛玻璃背景效果 (`backdrop-blur`)
- 支持安全区域适配 (`safe-area-inset-top`)
- 仅在移动端设备上启用悬浮功能

### 添加 Motion 动画效果 (2024-12-19)

**功能**: 为悬浮 tabbar 添加流畅的 motion 动画效果

**实现方案**:
1. 使用 `motion` 库实现进入/退出动画
2. 创建了动画配置系统 (`lib/motion-config.ts`)
3. 实现了微交互动画（按钮悬停、点击效果）
4. 添加了分层动画效果（不同元素不同延迟）

**技术细节**:
- 使用 `AnimatePresence` 管理组件进入/退出
- 实现了弹簧动画 (`spring`) 和缓动动画 (`ease`)
- 创建了可复用的动画按钮组件
- 优化了动画性能，使用配置化的动画参数

## 开发指南

### 环境要求

- Node.js 18+
- npm/yarn/pnpm

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm run start
```

## 部署

推荐使用 [Vercel](https://vercel.com) 进行部署，这是 Next.js 的官方部署平台。

## 注意事项

1. **服务端渲染**: 避免在服务端组件中使用 `localforage`
2. **Cookie安全**: 确保敏感信息在cookies中正确加密
3. **错误处理**: 所有异步操作都有适当的错误处理
4. **类型安全**: 使用TypeScript确保类型安全

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
