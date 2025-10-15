# AI Chatbot 架构设计与实现方案

## 项目概述

本项目是一个基于 React + TypeScript 的现代化 AI 聊天应用，采用模块化架构设计，实现了用户认证、会话管理、流式对话、网络搜索增强等核心功能。

### 核心特性
- 用户认证系统（邮箱密码 + 验证码）
- 多会话管理（创建、切换、删除、重命名）
- 流式 AI 对话（实时响应展示）
- 网络搜索增强（可选的搜索功能）
- 响应式设计（桌面端 + 移动端）
- 国际化支持（en, zh-CN, ja, de, ar）
- 主题切换（深色/浅色模式）

---

## 技术架构

### 技术栈选型

**前端框架与工具**
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **路由**: React Router v7（基于 file-based routing）
- **UI 组件库**: shadcn/ui + Radix UI + Tailwind CSS
- **状态管理**: Zustand（轻量级状态管理）+ React Context（认证状态）
- **表单处理**: React Hook Form + Zod 验证
- **国际化**: react-i18next
- **通知系统**: Sonner Toast

**后端服务**（当前为占位实现，预留接口）
- **数据库**: 本地内存存储（Map 结构），预留 Supabase/PostgreSQL 接口
- **认证**: 本地 Token 管理，预留 Supabase Auth 接口
- **AI 服务**: 占位实现，预留 OpenAI/Claude API 接口
- **搜索服务**: 预留网络搜索 API 接口

---

## 核心架构设计

### 分层架构

```
┌─────────────────────────────────────────┐
│          用户界面层 (UI Layer)            │
│  Pages, Components, Layouts              │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│        业务逻辑层 (Logic Layer)           │
│  Custom Hooks, Managers, Controllers     │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│        数据层 (Data Layer)                │
│  Stores (Zustand), Context, Cache        │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│        服务层 (Service Layer)             │
│  API Services, Auth Service              │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│        工具层 (Utility Layer)             │
│  Helpers, Constants, Types               │
└─────────────────────────────────────────┘
```

### 目录结构

```
src/
├── pages/                          # 页面组件
│   ├── Home/                       # 首页（欢迎页）
│   ├── auth/                       # 认证页面
│   │   ├── sign-in-page.tsx
│   │   └── sign-up-page.tsx
│   ├── chat/                       # 聊天页面
│   │   └── chat-page.tsx
│   └── not-found/                  # 404 页面
│
├── components/                     # 组件库
│   ├── auth/                       # 认证相关组件
│   │   ├── auth-card.tsx           # 认证卡片容器
│   │   ├── email-password-form.tsx # 邮箱密码表单
│   │   ├── sign-in-form.tsx        # 登录表单
│   │   ├── sign-up-form.tsx        # 注册表单
│   │   ├── verification-form.tsx   # 验证码表单
│   │   └── with-auth.tsx           # 认证 HOC
│   │
│   ├── chat/                       # 聊天相关组件
│   │   ├── chat-container.tsx      # 聊天容器（核心组件）
│   │   ├── chat-input.tsx          # 消息输入框
│   │   ├── message-list.tsx        # 消息列表
│   │   ├── message-bubble.tsx      # 单条消息气泡
│   │   ├── markdown-message.tsx    # Markdown 渲染
│   │   ├── chat-scroll-manager.tsx # 滚动管理
│   │   ├── virtual-message-list.tsx# 虚拟滚动列表
│   │   ├── search-toggle.tsx       # 搜索开关
│   │   ├── search-status.tsx       # 搜索状态显示
│   │   ├── search-sources.tsx      # 搜索结果源
│   │   ├── streaming-indicator.tsx # 流式响应指示器
│   │   ├── loading-indicator.tsx   # 加载指示器
│   │   └── chat-error-*.tsx        # 错误处理组件
│   │
│   ├── conversation/               # 会话管理组件
│   │   ├── conversation-list.tsx   # 会话列表
│   │   ├── delete-confirmation-dialog.tsx
│   │   └── rename-dialog.tsx       # 重命名对话框
│   │
│   ├── sidebar/                    # 侧边栏组件
│   │   ├── conversation-history.tsx# 会话历史
│   │   ├── navigation-section.tsx  # 导航区域
│   │   ├── sidebar-logo.tsx        # Logo
│   │   └── sidebar-user-menu.tsx   # 用户菜单
│   │
│   ├── layouts/                    # 布局组件
│   │   ├── app-layout.tsx          # 应用主布局
│   │   ├── auth-layout.tsx         # 认证页面布局
│   │   └── sidebar-layout.tsx      # 侧边栏布局
│   │
│   ├── guards/                     # 路由守卫
│   │   └── auth-guard.tsx          # 认证守卫
│   │
│   └── ui/                         # shadcn UI 组件
│       └── (40+ 组件)
│
├── router/                         # 路由配置
│   ├── app-router.tsx              # 路由定义
│   ├── use-app-router.ts           # 路由 Hook（适配 React Router）
│   ├── components/
│   │   ├── require-auth.tsx        # 需要认证的路由
│   │   └── public-only-route.tsx   # 仅公开访问的路由
│   └── layouts/
│       ├── app-shell-layout.tsx    # 应用外壳
│       └── auth-route-layout.tsx   # 认证路由布局
│
├── lib/                            # 核心库
│   ├── hooks/                      # 自定义 Hooks
│   │   ├── conversation/           # 会话相关 Hooks
│   │   │   ├── useConversationLoader.ts  # 会话加载
│   │   │   ├── useMessageSender.ts       # 消息发送
│   │   │   ├── useStreamHandler.ts       # 流式处理
│   │   │   └── useSearchState.ts         # 搜索状态
│   │   ├── useConversationManager.ts     # 会话管理器（聚合）
│   │   ├── useAsyncState.ts              # 异步状态管理
│   │   ├── useVirtualScrolling.ts        # 虚拟滚动
│   │   └── use-mobile.tsx                # 移动端检测
│   │
│   ├── stores/                     # Zustand 状态管理
│   │   └── conversation-data.ts    # 会话数据 Store
│   │
│   ├── contexts/                   # React Context
│   │   └── auth.context.tsx        # 认证上下文
│   │
│   ├── services/                   # 服务层
│   │   ├── auth.service.ts         # 认证服务
│   │   └── conversation-service.ts # 会话服务
│   │
│   ├── api/                        # API 调用层
│   │   └── conversation-web.ts     # 会话 Web API
│   │
│   ├── types/                      # 类型定义
│   │   ├── api.ts                  # API 类型
│   │   └── conversation.ts         # 会话类型
│   │
│   ├── errors/                     # 错误处理
│   │   └── chat-error.ts           # 聊天错误类
│   │
│   ├── utils/                      # 工具函数
│   │   ├── conversation.ts         # 会话工具
│   │   ├── date.ts                 # 日期工具
│   │   ├── error-reporter.ts       # 错误上报
│   │   ├── global-stream-manager.ts# 全局流管理
│   │   └── resource-manager.ts     # 资源管理
│   │
│   ├── constants/                  # 常量配置
│   │   ├── chat.ts                 # 聊天常量
│   │   └── conversation.ts         # 会话常量
│   │
│   ├── metrics/                    # 性能指标
│   │   └── chat-metrics.ts         # 聊天指标收集
│   │
│   ├── i18n-setup.ts               # 国际化配置
│   └── supabase.ts                 # Supabase 客户端（占位）
│
└── i18n/                           # 国际化翻译文件
    └── translations/               # 按模块和语言组织
        ├── common/                 # 通用翻译
        ├── auth/                   # 认证翻译
        ├── chat/                   # 聊天翻译
        ├── error/                  # 错误翻译
        └── ...（共 10 个模块）
```

---

## 数据模型设计

### 核心数据结构

#### 1. 用户 (User)
```typescript
interface User {
  id: string                 // 用户唯一标识
  email?: string             // 邮箱
  username?: string          // 用户名
  avatarUrl?: string         // 头像 URL
  createdAt?: string         // 创建时间
  updatedAt?: string         // 更新时间
}
```

#### 2. 会话 (Conversation)
```typescript
interface Conversation {
  id: string                 // 会话唯一标识（UUID）
  userId?: string            // 所属用户 ID
  abstract?: string          // 会话标题/摘要
  createdAt: string          // 创建时间（ISO 8601）
  updatedAt: string          // 最后更新时间（ISO 8601）
}
```

**设计说明**：
- `id` 使用 UUID 确保全局唯一性
- `abstract` 存储会话标题，默认为 "New Chat"，可后续自动生成或手动修改
- `updatedAt` 用于排序会话列表（最近更新的在前）

#### 3. 消息 (Message)
```typescript
enum MessageRole {
  user = 'user',              // 用户消息
  assistant = 'assistant',    // AI 助手消息
  system = 'system'           // 系统消息（保留）
}

interface Message {
  id: string                  // 消息唯一标识
  conversationId: string      // 所属会话 ID
  content: string             // 消息内容
  role: MessageRole           // 消息角色
  createdAt: string           // 创建时间
  userId?: string             // 发送者 ID（用户消息）
  searchEvents?: SearchEvent[]// 关联的搜索事件（可选）
}
```

**设计说明**：
- 临时消息使用 `msg_` 或 `ai_` 前缀 + 随机字符串作为 ID
- 持久化消息使用数据库生成的 UUID
- `searchEvents` 仅在启用搜索时存在，关联到触发搜索的用户消息

#### 4. 搜索事件 (SearchEvent)
```typescript
interface SearchEvent {
  id: string                  // 搜索事件 ID
  conversationId: string      // 所属会话
  messageId?: string          // 触发搜索的消息 ID
  userId: string              // 发起用户
  query: string               // 搜索查询
  domain: string              // 搜索域（web/news/academic 等）
  language?: string           // 搜索语言
  timeRange?: string          // 时间范围
  resolvedEngines: string[]   // 使用的搜索引擎
  resultsCount: number        // 结果数量
  durationMs: number          // 搜索耗时（毫秒）
  cached: boolean             // 是否命中缓存
  topSources: SearchSource[]  // 顶部搜索结果
  error?: string              // 错误信息
  createdAt: string           // 创建时间
}

interface SearchSource {
  title: string               // 标题
  url: string                 // 链接
  snippet: string             // 摘要
  favicon?: string            // 网站图标
}
```

#### 5. 搜索状态 (SSESearchStatus)
```typescript
type SearchPhase = 'detected' | 'started' | 'progress' | 'complete' | 'error'

interface SSESearchStatus {
  type: 'search_status'       // 事件类型标识
  phase: SearchPhase          // 搜索阶段
  query: string               // 搜索查询
  domain?: string             // 搜索域
  language?: string           // 语言
  timeRange?: string          // 时间范围
  progress?: {
    fetchedItems?: number     // 已获取项数
    totalItems?: number       // 总项数
  }
  error?: string              // 错误信息
}
```

---

## 状态管理架构

### 1. 全局状态：Zustand Store

**ConversationDataStore**（纯数据存储）

```typescript
interface ConversationDataState {
  // 用户信息
  currentUserId: string | null

  // 会话数据（Map 结构：conversationId -> Conversation）
  conversations: Record<string, Conversation>
  currentConversationId: string | null

  // 当前会话的消息（数组）
  currentMessages: Message[]
}

interface ConversationDataActions {
  // 会话操作
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  removeConversation: (id: string) => void
  setConversations: (conversations: Conversation[]) => void
  setCurrentConversation: (conversationId: string | null) => void

  // 消息操作
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  removeMessage: (messageId: string) => void
  setMessages: (messages: Message[]) => void
  clearMessages: () => void

  // 重置
  reset: () => void
}
```

**设计原则**：
- **职责单一**：仅负责数据管理，不包含 API 调用和业务逻辑
- **不包含状态**：不存储加载状态、错误状态（由业务 Hook 管理）
- **性能优化**：会话使用 Map 结构提升查询性能，只保留当前会话的消息减少内存占用
- **不可变更新**：所有更新返回新对象，触发 React 重渲染

### 2. 认证状态：React Context

**AuthContext**（参考 Clerk 设计）

```typescript
interface AuthContextValue {
  // 状态
  user: User | null           // 当前用户
  isLoaded: boolean           // 是否加载完成
  isSignedIn: boolean         // 是否已登录（派生状态）

  // UI 状态
  error: AuthError | null     // 错误信息
  isLoading: boolean          // 加载中

  // 核心方法
  signIn: (credentials: SignInCredentials) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signOut: () => Promise<void>

  // 工具方法
  sendVerificationCode: (email: string, purpose: 'signup' | 'login' | 'reset') => Promise<void>
  clearError: () => void
  reload: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}
```

**设计亮点**：
- **多标签页同步**：监听 `storage` 事件同步登录状态
- **自定义事件**：通过 `auth:signout` 事件通知其他组件
- **自动重定向**：登录后跳转到原页面，退出后跳转到登录页
- **错误处理**：统一的错误状态管理

---

## 核心业务逻辑

### 1. 会话管理器 (useConversationManager)

**职责**：聚合所有会话相关的业务逻辑，提供统一的 API 接口

**组合的子 Hook**：
- `useConversationLoader`：加载会话列表和消息
- `useMessageSender`：发送消息的准备工作
- `useStreamHandler`：处理流式响应
- `useSearchState`：管理搜索状态

**API 接口**：
```typescript
interface ConversationManagerAPI {
  // 数据
  conversation: Conversation | null
  messages: Message[]

  // 状态
  isLoading: boolean
  isSending: boolean
  isDeleting: boolean
  isRefreshing: boolean
  error: ChatError | null

  // 搜索
  searchState: SearchState
  setSearchEnabled: (enabled: boolean) => void

  // 操作
  sendMessage: (content: string, options?: { enableWebSearch?: boolean }) => Promise<void>
  refreshMessage: (messageId: string) => Promise<void>
  deleteConversation: (conversationId: string) => Promise<void>
  stopGenerating: () => void
  clearError: () => void
}
```

### 2. 消息发送流程

**新会话发送流程**：
```
用户输入消息
    ↓
检查是否已登录
    ↓
创建新会话（本地 + 数据库）
    ↓
创建用户消息（临时 ID）
    ↓
保存用户消息到 Store（乐观更新）
    ↓
保存用户消息到数据库
    ↓
创建 AI 消息占位符（空内容）
    ↓
添加 AI 消息到 Store
    ↓
生成搜索配置（如果启用）
    ↓
调用流式 API（传递会话 ID + 消息列表 + 搜索配置）
    ↓
注册流清理函数到全局管理器
    ↓
更新 URL 到新会话（/chat/:conversationId）
    ↓
开始接收流式响应
    ↓
逐块更新 AI 消息内容（累积）
    ↓
流完成后保存完整 AI 消息到数据库
    ↓
完成
```

**现有会话发送流程**：
```
用户输入消息
    ↓
检查是否已登录
    ↓
创建用户消息（临时 ID）
    ↓
保存用户消息到 Store（乐观更新）
    ↓
保存用户消息到数据库
    ↓
创建 AI 消息占位符
    ↓
添加 AI 消息到 Store
    ↓
生成搜索配置
    ↓
调用流式 API
    ↓
注册流清理函数
    ↓
开始接收流式响应
    ↓
逐块更新 AI 消息内容
    ↓
流完成后保存到数据库
    ↓
更新会话的 updatedAt 时间戳
    ↓
完成
```

### 3. 流式响应处理

**SSE 事件处理器**：
```typescript
interface SSEEventHandlers {
  onContent?: (content: string) => void   // 接收内容片段
  onDone?: () => void                     // 流完成
  onError?: (error: Error) => void        // 流错误
}
```

**流式处理逻辑**：
1. **初始化**：创建空内容累积器（使用全局 Map 避免闭包问题）
2. **接收片段**：每次收到内容片段，累加到当前内容
3. **实时更新**：调用 `updateMessage` 更新 Store 中的消息内容
4. **完成处理**：保存完整内容到数据库，清理累积器
5. **错误处理**：显示错误消息，保留部分内容
6. **资源清理**：组件卸载或新流开始时清理旧流

**关键技术点**：
- **全局 Map 管理内容**：避免 React 闭包捕获旧值
- **流 ID 管理**：使用 `stream_${conversationId}_${messageId}` 格式唯一标识流
- **全局流管理器**：统一管理所有活跃流，支持批量清理
- **性能指标**：记录流开始、持续时间、错误率

### 4. 搜索增强功能

**搜索状态管理**：
```typescript
interface SearchState {
  enabled: boolean                      // 是否启用搜索
  currentStatus: SSESearchStatus | null // 当前搜索状态
  currentSources: SearchSource[]        // 当前搜索结果
}
```

**搜索流程**：
1. 用户通过搜索开关启用/禁用搜索
2. 发送消息时，将搜索配置传递给 API
3. 服务端检测到需要搜索时，发送 `search_status` 事件（detected → started → progress → complete）
4. 前端实时显示搜索进度（查询词、进度条）
5. 搜索完成后，发送 `search_sources` 事件（包含搜索结果）
6. 前端显示可折叠的搜索结果列表
7. 搜索事件关联到触发的用户消息

**UI 状态显示**：
- **detected**：显示 "检测到搜索需求"
- **started**：显示 "正在搜索: {query}"
- **progress**：显示进度条 "已获取 X/Y 项"
- **complete**：显示 "搜索完成，找到 N 个来源"
- **error**：显示错误信息

### 5. 消息刷新（重新生成）

**刷新逻辑**：
```
点击 AI 消息的刷新按钮
    ↓
找到该 AI 消息的索引
    ↓
向上查找最近的用户消息
    ↓
收集需要删除的消息（从用户消息开始到末尾）
    ↓
清理当前活跃的流连接
    ↓
从 Store 中删除这些消息
    ↓
重新发送找到的用户消息
    ↓
开始新的流式响应
    ↓
完成
```

**设计考虑**：
- 保留用户消息之前的所有历史（上下文保持完整）
- 删除用户消息及其之后的所有内容（包括 AI 回复）
- 重新发送时会创建新的临时消息和流

---

## 路由设计

### 路由表

```typescript
const routes = [
  {
    path: '/',
    element: <HomePage />,           // 首页（欢迎页）
    public: true                     // 未登录可访问
  },
  {
    path: '/sign-in',
    element: <SignInPage />,         // 登录页
    public: true,
    redirect: { if: 'authenticated', to: '/chat' }
  },
  {
    path: '/sign-up',
    element: <SignUpPage />,         // 注册页
    public: true,
    redirect: { if: 'authenticated', to: '/chat' }
  },
  {
    path: '/chat',
    element: <ChatPage />,           // 聊天主页（新会话）
    protected: true                  // 需要登录
  },
  {
    path: '/chat/:conversationId',
    element: <ChatPage />,           // 具体会话页
    protected: true
  },
  {
    path: '*',
    element: <NotFoundPage />        // 404 页面
  }
]
```

### 路由守卫逻辑

**RequireAuth（需要认证）**：
```
检查 user 是否存在
    ↓
如果未登录 → 重定向到 /sign-in?redirect={currentPath}
    ↓
如果已登录 → 渲染子组件
```

**PublicOnlyRoute（仅公开访问）**：
```
检查 user 是否存在
    ↓
如果已登录 → 重定向到 /chat
    ↓
如果未登录 → 渲染子组件
```

### URL 参数传递

**从首页到聊天页**：
1. 用户在首页输入消息
2. 存储消息到 `sessionStorage.initialMessage`
3. 存储搜索状态到 `sessionStorage.initialSearchEnabled`
4. 导航到 `/chat`（不带会话 ID）
5. ChatContainer 检测到初始消息 → 自动发送
6. 发送后自动导航到 `/chat/:newConversationId`

**登录重定向**：
- 登录页 URL：`/sign-in?redirect=/chat/abc123`
- 登录成功后自动跳转到 `redirect` 参数指定的页面

---

## 错误处理架构

### 错误分类

```typescript
enum ErrorCode {
  // 认证错误
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',

  // 权限错误
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  // 限流错误
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // 资源错误
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  CONVERSATION_NOT_FOUND = 'CONVERSATION_NOT_FOUND',

  // 操作错误
  MESSAGE_SEND_FAILED = 'MESSAGE_SEND_FAILED',
  CONVERSATION_CREATE_FAILED = 'CONVERSATION_CREATE_FAILED',

  // 系统错误
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  HTTP_500 = 'HTTP_500',
  HTTP_502 = 'HTTP_502',
  HTTP_503 = 'HTTP_503',

  // 未知错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

### ChatError 类

```typescript
class ChatError extends Error {
  code: ErrorCode                    // 错误码
  statusCode?: number                // HTTP 状态码
  details?: Record<string, unknown>  // 详细信息
  retryAfter?: number                // 重试延迟（毫秒）

  constructor(code: ErrorCode, message: string, options?: ErrorOptions)

  // 静态工厂方法
  static fromError(error: unknown): ChatError
  static fromResponse(response: Response): Promise<ChatError>

  // 工具方法
  isRetryable(): boolean             // 是否可重试
  getDefaultRetryDelay(): number     // 获取默认重试延迟
  toJSON(): object                   // 序列化
}
```

### 错误处理流程

**API 调用错误处理**：
```
调用 API
    ↓
发生错误
    ↓
判断错误类型（网络错误 / HTTP 错误 / 业务错误）
    ↓
转换为 ChatError
    ↓
根据错误码判断处理策略
    ↓
- 认证错误 → 清除 token，跳转登录页
- 限流错误 → 显示倒计时，禁用重试按钮
- 临时错误 → 提供重试按钮
- 永久错误 → 仅显示错误信息
    ↓
记录错误日志/指标
    ↓
更新 UI 状态
```

**错误 UI 显示**：
- **Toast 通知**：临时性、非阻塞性错误（网络请求失败）
- **错误对话框**：需要用户确认的错误（认证失败、权限不足）
- **内联错误**：表单验证错误
- **错误边界**：捕获 React 组件渲染错误

---

## 性能优化策略

### 1. 虚拟滚动

**启用条件**：
- 消息数量超过阈值（默认 50 条）
- 可通过配置强制启用/禁用

**实现逻辑**：
```typescript
useVirtualScrolling({
  items: messages,              // 消息列表
  itemHeight: 100,              // 预估每项高度
  overscan: 5,                  // 上下缓冲项数
  threshold: 50,                // 启用阈值
  forceEnable: false,           // 强制启用
  forceDisable: false           // 强制禁用
})
```

**返回值**：
- `virtualItems`：当前可见的项列表（带偏移量）
- `totalHeight`：总高度
- `shouldUseVirtual`：是否使用虚拟滚动

### 2. 状态优化

**避免不必要的重渲染**：
- 使用 `useMemo` 缓存计算结果
- 使用 `useCallback` 缓存函数引用
- 使用 `React.memo` 包装纯组件
- Zustand 状态选择器：只订阅需要的状态片段

**示例**：
```typescript
// 只订阅当前消息，不订阅整个 store
const messages = useConversationDataStore(state => state.currentMessages)
```

### 3. 代码分割

**路由级别分割**：
```typescript
const HomePage = lazy(() => import('@/pages/Home'))
const ChatPage = lazy(() => import('@/pages/chat/chat-page'))
const SignInPage = lazy(() => import('@/pages/auth/sign-in-page'))
```

**组件级别分割**：
- 大型组件（如 Markdown 渲染器）懒加载
- 非首屏组件延迟加载

### 4. 资源管理

**HookResourceManager**：
```typescript
class HookResourceManager {
  private disposables: Map<string, () => void>

  register(key: string, dispose: () => void): void
  unregister(key: string): void
  dispose(key: string): void
  disposeAll(): void
}
```

**用途**：
- 管理流连接的清理
- 管理定时器
- 管理事件监听器
- 组件卸载时自动清理

**GlobalStreamManager**：
```typescript
class GlobalStreamManager {
  private streams: Map<string, StreamCleanup>
  private resourceManager: HookResourceManager

  registerStream(id: string, cleanup: StreamCleanup): void
  cleanupStream(id: string): void
  cleanupAll(): void
  getResourceManager(): HookResourceManager
}
```

---

## 国际化方案

### 翻译资源组织

**模块化组织**：
```
i18n/translations/
├── common/           # 通用翻译（按钮、操作）
├── auth/             # 认证相关
├── chat/             # 聊天相关
├── error/            # 错误消息
├── validation/       # 表单验证
├── date/             # 日期格式
├── user/             # 用户相关
├── settings/         # 设置相关
├── status/           # 状态文本
├── note/             # 笔记相关
└── audio/            # 音频相关
```

**每个模块包含 5 种语言**：
- `en.ts`：英语
- `zh-CN.ts`：简体中文
- `ja.ts`：日语
- `de.ts`：德语
- `ar.ts`：阿拉伯语

### 使用方式

**Hook 调用**：
```typescript
// 通用翻译
const t = useCommonTranslation()
<Button>{t('actions.confirm')}</Button>

// 聊天翻译
const t = useChatTranslation()
<Placeholder>{t('input.placeholder')}</Placeholder>

// 错误翻译
const t = useErrorTranslation()
<Error>{t(`codes.${errorCode}`)}</Error>
```

**语言切换**：
```typescript
const { language, setLanguage } = useLanguage()
await setLanguage('en')  // 切换到英语
```

**日期格式化**：
```typescript
const { formatDate } = useFormatter()
formatDate(message.createdAt)  // 自动根据当前语言格式化
```

---

## UI/UX 设计原则

### 响应式布局

**桌面端（> 768px）**：
```
┌────────────────────────────────────────┐
│  Header / Navigation                    │
├──────────┬─────────────────────────────┤
│          │                              │
│ Sidebar  │     Chat Area                │
│ (260px)  │     (Flexible)               │
│          │                              │
│ - Logo   │  - Messages                  │
│ - New    │  - Virtual Scroll            │
│ - List   │  - Search Results            │
│ - User   │  - Input                     │
│          │                              │
└──────────┴─────────────────────────────┘
```

**移动端（< 768px）**：
```
┌────────────────────────┐
│  Header + Menu Toggle  │
├────────────────────────┤
│                        │
│  Chat Area (Full)      │
│                        │
│  - Messages            │
│  - Search Results      │
│  - Input               │
│                        │
└────────────────────────┘

Sidebar (Drawer):
┌────────────────┐
│ Sidebar        │
│ - New Chat     │
│ - History      │
│ - User Menu    │
└────────────────┘
```

### 交互细节

**自动滚动**：
- 加载历史消息 → 滚动到底部（无动画）
- 新消息到达 → 平滑滚动到底部
- 流式响应中 → 保持在底部
- 用户主动滚动 → 暂停自动滚动，显示 "滚动到底部" 按钮

**输入框行为**：
- 支持 Shift+Enter 换行
- Enter 发送消息
- 自动调整高度（最多 5 行）
- AI 回复完成后自动聚焦

**加载状态**：
- 会话列表加载 → 骨架屏
- 消息加载 → 居中 Loading 指示器
- 发送中 → 输入框禁用，显示停止按钮
- 流式响应 → 显示打字动画

**错误提示**：
- 轻量错误 → Toast（3 秒自动消失）
- 重要错误 → 对话框（需要确认）
- 限流错误 → 显示倒计时（禁用重试）

---

## 安全考虑

### 认证安全

**Token 管理**：
- Token 存储在 `localStorage.app_auth_token`
- 每次请求自动在 `Authorization: Bearer {token}` 中携带
- Token 过期自动跳转登录页
- 多标签页同步登录状态（storage 事件）

**密码策略**（前端验证）：
- 最短 8 位
- 至少包含大小写字母、数字
- 可选：特殊字符

### 数据安全

**前端防护**：
- React 自动转义输出（防 XSS）
- Markdown 渲染使用安全库（react-markdown + remark-gfm）
- 不使用 `dangerouslySetInnerHTML`
- 用户输入验证（Zod schema）

**API 安全**（后端实现）：
- Row Level Security（RLS）策略
- 用户只能访问自己的会话和消息
- API Key 存储在服务端环境变量
- 速率限制（防止滥用）

### 隐私保护

**数据隔离**：
- 每个用户只能看到自己的会话
- 删除会话时级联删除所有关联消息
- 不在前端日志中记录敏感信息

---

## 部署方案

### Cloudflare Pages 部署

**构建配置**：
```yaml
Build command: npm run build
Output directory: dist
Node version: 18+
Environment variables:
  - VITE_SUPABASE_URL (如果使用 Supabase)
  - VITE_SUPABASE_ANON_KEY
```

**路由配置**（`public/_redirects`）：
```
/*    /index.html   200
```

**Headers 配置**（`public/_headers`）：
```
/index.html
  Cache-Control: no-cache, no-store, must-revalidate

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

### 性能优化

**构建优化**：
```typescript
// vite.config.ts
{
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/*'],
          'i18n': ['react-i18next', 'i18next']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 生产环境移除 console
        drop_debugger: true
      }
    }
  }
}
```

**CDN 优化**：
- 静态资源永久缓存（带 hash）
- HTML 不缓存（确保最新版本）
- Brotli 压缩（Cloudflare 自动）
- HTTP/3（Cloudflare 自动）

---

## 监控与指标

### 性能指标

**聊天指标**（`chat-metrics.ts`）：
```typescript
// 流式响应指标
recordStreamStart()                          // 流开始
recordStreamDuration(durationMs, success)    // 流持续时间
recordStreamError(errorCode)                 // 流错误
recordStreamStopped()                        // 流手动停止

// 消息指标
recordMessageSent()                          // 消息发送
recordMessageReceived()                      // 消息接收
```

**错误上报**（`error-reporter.ts`）：
```typescript
reportError({
  error: ChatError,
  context: {
    conversationId: string,
    messageId: string,
    userId: string
  },
  severity: 'error' | 'warning' | 'info'
})
```

### 应用监控

**Cloudflare Analytics**：
- 访问量（PV/UV）
- 页面加载时间
- 资源加载性能
- 地理分布

**自定义事件**：
- 用户注册/登录
- 会话创建
- 消息发送
- 错误发生

---

## 后续扩展规划

### V2 功能

**内容增强**：
- 代码高亮（highlight.js）
- LaTeX 数学公式渲染（KaTeX）
- 图表绘制（Mermaid）
- 文件上传（图片、文档）

**交互增强**：
- 消息编辑
- 消息删除
- 消息复制
- 对话分享（生成分享链接）
- 对话导出（Markdown/PDF/JSON）

**搜索优化**：
- 历史消息全文搜索
- 会话标签系统
- 会话分组管理

### V3 功能

**多模型支持**：
- 模型选择（GPT-4, Claude, Gemini）
- 自定义 System Prompt
- 参数调整（temperature, top_p）

**高级功能**：
- 语音输入/输出（Web Speech API）
- 多模态输入（图片识别）
- 插件系统（Function Calling）
- Token 统计和配额管理
- Realtime 订阅（多设备同步）

---

## 开发规范

### 代码组织

**文件命名**：
- 组件文件：`PascalCase.tsx`（如 `ChatContainer.tsx`）
- Hook 文件：`use-camel-case.ts`（如 `use-conversation-manager.ts`）
- 工具文件：`kebab-case.ts`（如 `error-reporter.ts`）
- 类型文件：`kebab-case.ts`（如 `conversation.ts`）

**导入顺序**：
1. React 和第三方库
2. 路径别名导入（@/）
3. 相对路径导入
4. 类型导入（单独分组）

### 类型安全

**严格模式**：
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**避免 `any`**：
- 优先使用 `unknown`
- 使用类型守卫（type guard）
- 使用泛型约束

### 错误处理

**统一错误类**：
- 继承 `ChatError`
- 提供有意义的错误码
- 包含足够的上下文信息

**Try-Catch 原则**：
- 异步操作必须 try-catch
- 转换为 ChatError
- 记录日志
- 更新 UI 状态

---

## 总结

本文档详细描述了 AI Chatbot 应用的架构设计、数据模型、业务逻辑、状态管理、路由设计、错误处理、性能优化、国际化、安全考虑和部署方案。

**核心设计原则**：
1. **模块化**：职责清晰，低耦合高内聚
2. **类型安全**：TypeScript 严格模式，完善的类型定义
3. **性能优先**：虚拟滚动、代码分割、资源管理
4. **用户体验**：流式响应、乐观更新、自动滚动
5. **可扩展性**：预留接口、插件系统、多语言支持
6. **可维护性**：统一规范、清晰注释、完善文档

**技术亮点**：
- 基于 Zustand 的轻量级状态管理
- 流式响应的全局资源管理
- 乐观更新 + 错误回滚机制
- 虚拟滚动优化长列表性能
- 完善的错误处理和用户提示
- 多语言国际化支持（5 种语言）

该架构设计为生产级应用，具备良好的扩展性和维护性，可根据实际需求灵活调整和扩展功能。
