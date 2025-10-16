# MoryFlow Chat 架构与 Supabase 集成计划

## 当前架构概览

### 项目目标
- 构建支持多会话的流式 AI 聊天体验，兼容桌面与移动端使用场景。
- 保持严格的类型安全与性能基线，为后续模型扩展与企业能力预留空间。
- 通过清晰的数据结构与职责边界，降低功能演进与团队协作的复杂度。

### 核心业务流程

#### 认证流程
- 首次进入应用时读取持久化凭证，校验通过后加载用户与会话数据。
- 支持邮箱 + 密码注册/登录（Supabase OTP + Password），成功后刷新访问令牌并同步本地状态。
- 退出登录时清理所有会话缓存与临时消息，回到访客态。

#### 会话生命周期
- 创建会话：通过 Supabase 插入记录并返回最终 ID，前端同步更新。
- 切换会话：加载目标摘要与最近消息，同时终止当前流式响应。
- 删除/重命名：调用 Supabase Service 层操作，前端乐观更新，失败回滚并提示。

#### 消息流转
- 用户输入后立即生成临时消息推送至列表，触发发送任务。
- Supabase Edge Function 返回流式 token 后累加至同一条 AI 消息，维持滚动定位。
- 响应完成或失败后更新消息状态，并在失败场景提供重试入口。

#### 个性化设置
- 国际化语言与主题划分为轻量级全局设置切片，持久化到本地存储。
- 模型参数（模型 ID、temperature 等）按会话维度保存，允许不同对话独立配置。

### 核心数据结构
```ts
type MessageRole = 'user' | 'assistant' | 'system'
type MessageStatus = 'pending' | 'streaming' | 'done' | 'error'

type TokenUsage = {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

interface User {
  id: string
  email?: string
  displayName?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

interface Conversation {
  id: string
  ownerId: string
  abstract: string
  createdAt: string
  updatedAt: string
  modelId: string
  temperature: number
}

interface Message {
  id: string
  conversationId: string
  role: MessageRole
  status: MessageStatus
  content: string
  createdAt: string
  tokenCount?: number
  metadata?: Record<string, unknown>
  error?: string
}
```

### 状态切片
```ts
interface ConversationDataState {
  currentUserId: string | null
  conversations: Record<string, Conversation>
  currentConversationId: string | null
  messagesByConversation: Record<string, Message[]>
}

interface UiState {
  isSidebarOpen: boolean
  activeComposerMode: 'chat' | 'prompt'
  language: 'en' | 'zh-CN' | 'ja' | 'de' | 'ar'
  theme: 'light' | 'dark' | 'system'
}

interface StreamingState {
  isSending: boolean
  inflightMessageId: string | null
  inflightController?: AbortController
  pendingRetryMessage?: Message
}
```

### 模块职责划分
- **UI 层**：页面与复用组件，负责展示数据与派发用户行为。
- **业务层**：自定义 Hook（聊天控制器、认证守卫等）串联状态与 service。
- **数据层**：Zustand store 与 React Context，确保状态来源单一且可追踪。
- **服务层**：认证、聊天与配置 API，统一处理请求、节流、缓存与错误映射。
- **工具层**：常量、类型、日志与格式化方法，供跨模块复用。

### 状态管理策略
- 会话与消息按会话 ID 归档；当前会话消息驻留内存，其余按需懒加载。
- 发送流程通过单例任务队列驱动，避免并发写入导致的竞态。
- UI 轻状态与数据状态分离，减少渲染扩散。
- SSE 与 Fetch 请求统一挂载可取消 controller，确保切换或终止时释放资源。

### 服务与接口边界
- 认证服务通过 Supabase 实现 `signIn`、`signUp`、`sendVerificationCode`、`signOut` 等能力，统一映射错误码。
- 聊天服务基于 Supabase 表管理会话与消息，封装 `ensureConversation`、`fetchMessages`、`appendMessage` 等方法。
- 流式服务使用 Supabase Edge Function，输出标准 `chunk/done/error` 事件供前端解析。

### 错误处理与监控
- 所有服务返回 `Result` 结构；UI 仅消费成功路径并在失败时渲染提示。
- 关键事件打点：登录、会话 CRUD、消息发送、流式失败。
- 性能指标：首屏渲染、首个 token 返回时间、长列表渲染耗时。

### 安全与合规
- 访问令牌保存在内存并按需刷新，刷新令牌通过 HttpOnly Cookie 管理。
- 删除会话、重置账号等敏感操作要求二次确认与审计日志。
- 国际化插值统一走安全模板，避免 XSS 风险。

### 长期演进路线
- **V1**：完成认证、基础会话管理与流式对话。
- **V2**：增强内容呈现（Markdown、代码高亮、Mermaid）与消息操作（编辑、导出）。
- **V3**：支持多模型切换、语音/多模态能力及插件扩展，配合配额与成本监控。
- **持续优化**：根据业务需要拓展观测指标，引入队列/缓存提升吞吐，增加企业级权限控制。

---

## Supabase 集成进度

- [x] 构建 Supabase service 层
  - `src/lib/supabase/client.ts` 提供统一 `createSupabaseClient`、会话存取、`onAuthStateChange` 事件。
  - `src/lib/services/supabase-auth.ts` + `auth.service.ts`：实现密码登录、验证码注册/登录、用户资料更新，统一错误码映射。
  - `src/lib/services/supabase-conversations.ts` 与 `conversation-service.ts`：会话/消息 CRUD 接入 Supabase 表。
  - `src/lib/services/supabase-stream.ts` + `completionsStream`：通过 Edge Function 获取 SSE，并在前端解析 `chunk/done/error`。
  - Hooks (`useConversationManager`, `useMessageSender`, `useStreamHandler`) 已切换到新服务实现，完成会话与消息数据拉取。

- [x] 实现 Supabase Edge Function 处理 AI 流式回复，并与前端 SSE 解析对接。
- [x] 配置 Supabase 数据库结构（表/索引/RLS/触发器）并完成前端整合测试。
- [ ] 进行端到端测试（认证、会话 CRUD、流式响应、国际化），清理临时代码与依赖。
- [ ] Review 并移除无用代码，保持仓库整洁。

### Supabase Edge Function：`chat-stream`
- 请求负载
  ```json
  {
    "conversationId": "uuid",
    "messages": [{ "role": "user", "content": "..." }],
    "userId": "uuid",
    "model": { "id": "gpt-4o-mini", "temperature": 0.2, "maxOutputTokens": 2048 }
  }
  ```
- 执行流程
  1. 通过 `auth.getUser()` 校验请求者，并确认 `conversationId` 归属本人。
  2. 调用模型供应商获取流式响应，逐片段写入 `event: chunk`。
  3. 响应完成前推送 `event: metadata`（token usage），结束时发送 `event: done`。
  4. 失败时写入 `messages` 表错误状态并发送 `event: error`。
  5. 成功后更新 `messages` 内容与 `token_count`，同步 `conversations.updated_at`。
- 辅助：`createUsageMeter()` 统计 prompt/completion token，`assertRlsOwnership()` 保证 RLS 环境下访问安全。

**实现说明**
- 位置：`supabase/functions/chat-stream/index.ts`。
- 鉴权：使用请求头携带的 Supabase JWT，二次校验会话归属，未经授权返回 401/403。
- 流式输出：优先调用 OpenAI（需配置 `OPENAI_API_KEY`），若缺省则返回占位回复；统一输出 `chunk` / `metadata` / `error` / `done` 事件。
- 错误处理：捕获上游或解析异常，通过 `event: error` 反馈到前端，并记录日志。

### 数据库结构与 RLS
- `profiles`
  - 列：`id uuid PK references auth.users`, `display_name text`, `avatar_url text`, `created_at timestamptz default now()`。
  - Policy：`select/update` 仅允许 `auth.uid() = id`；注册完成后由触发器自动插入。
- `conversations`
  - 列：`id uuid`, `owner_id uuid not null references auth.users`, `abstract text`, `model_id text`, `temperature real default 0.2`, `created_at timestamptz default now()`, `updated_at timestamptz default now()`。
  - 索引：`idx_conversations_owner_updated (owner_id, updated_at desc)`。
  - Policy：`select/insert/update/delete` 均限制 `owner_id = auth.uid()`。
  - 触发器：`moddatetime` 自动维护 `updated_at`。
- `messages`
  - 列：`id uuid`, `conversation_id uuid references conversations on delete cascade`, `owner_id uuid`, `role text`, `status text`, `content text`, `metadata jsonb`, `token_count integer`, `error text`, `created_at timestamptz default now()`。
  - 索引：`idx_messages_conversation_created (conversation_id, created_at)`, `idx_messages_owner_created (owner_id, created_at)`。
  - Policy：用户态要求 `owner_id = auth.uid()`；服务角色（Edge Function）插入助手消息需校验 `auth.jwt() ->> 'role' = 'service'`。
  - 触发器：`before insert` 若 `owner_id` 为空则填充 `auth.uid()`。
- 视图与统计
  - `conversation_summaries`：聚合最近消息摘要及 token 统计，供列表页快速展示。
  - `user_usage_daily`：按用户与日期汇总调用次数与 token 消耗，为配额与账单提供基础数据。
- 部署脚本
  ```sql
  create extension if not exists moddatetime;

  create trigger update_conversations_updated_at
    before update on conversations
    for each row execute procedure moddatetime (updated_at);

  create trigger populate_message_owner
    before insert on messages
    for each row execute procedure set_owner_from_auth();
  ``` 
  - `set_owner_from_auth()`：PL/pgSQL 函数从 `auth.uid()` 填充 `owner_id`，服务角色可显式传入值。

**实现说明**
- 迁移文件：`supabase/migrations/20241120000100_create_chat_tables.sql`。
- 包含 `profiles` 同步触发器、会话/消息表、RLS 策略、索引及 usage 汇总表。
- 视图 `conversation_summaries` 用于列表摘要（基于 `auth.uid()`），可配合 Supabase Row Level Security。

### 集成与验证计划
- 本地通过 `supabase db reset` + `supabase functions serve` 启动数据库与 Edge Function，配合 `supabase-js` mock 模型响应完成端到端测试。
- 前端 `AuthProvider`：拉取 `supabase.auth.getSession` → 写入状态 → 订阅 `onAuthStateChange`。
- `useConversationManager`：首屏并行加载会话与消息，完成后存入 Zustand。
- `useMessageSender`：`appendMessage` 插入用户消息，`completionsStream` 解析 SSE，结束时调用 `updateMessage` 持久化内容。
- 覆盖测试：认证注册/登录、会话 CRUD、流式消息成功与失败、RLS 拒绝跨用户访问、国际化切换后的读写能力。
