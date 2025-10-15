# MoryFlow Web 迁移复用方案

## 范围与约束
- 目标：在 Vite + React 单项目中实现 `docs/ai-chatbot-implementation-plan.md:5-31` 描述的 Supabase Chatbot。
- 多语言能力允许复用；笔记模块及相关 UI/状态全部排除。
- 新项目不引入 monorepo 结构，需将复用代码直接拷贝或改写到单仓库 `src/` 目录。
- 迁移时移除所有本地缓存（IndexedDB 等）。后端数据全部依赖 Supabase。

## 可复用模块概览
### 应用壳与导航
- **受保护路由与布局**：`AppShellLayout` 结合 `RequireAuth` 可提供登录态守卫与侧边布局（`apps/web/src/router/layouts/app-shell-layout.tsx:1-18`, `apps/web/src/router/components/require-auth.tsx:12-36`).
- **侧边栏框架**：`SidebarLayout` + `AppSidebar` 组件提供聊天主界面的响应式壳层和会话导航（`apps/web/components/layouts/sidebar-layout.tsx:1-29`, `apps/web/components/app-sidebar.tsx:21-145`).
  - 迁移时删除 `NavigationSection` 中与笔记/设置无关的入口，仅保留聊天、设置、语言切换等必要项。

### 聊天界面与交互
- **主容器**：`ChatContainer` 管理消息流、错误提示、自动滚动、初始消息注入逻辑，复用可直接满足计划中的聊天 UX（`apps/web/components/chat/chat-container.tsx:23-239`).
- **输入区与辅助 UI**：`ChatInput`、`ChatErrorDisplay`、`SimpleSearchToggle`、`ScrollToBottomButton` 等组件可直接复用，配合状态切换实现联网搜索开关与重试提示（`apps/web/components/chat/chat-input.tsx:34-197`, `apps/web/components/chat/chat-error-display.tsx:1-78`).
- **消息渲染**：`MessageList`、`MessageBubble`、`MarkdownMessage`、`VirtualMessageList` 提供流式、虚拟滚动、复制、重新生成、搜索引用展示能力（`apps/web/components/chat/message-list.tsx:1-63`, `apps/web/components/chat/message-bubble.tsx:1-140`, `apps/web/components/chat/virtual-message-list.tsx:25-170`).

### 会话状态与操作
- **Zustand Store**：`useConversationDataStore` 管理当前用户的会话/消息缓存，可直接搬迁作为前端状态层（`apps/web/lib/stores/conversation-data.ts:1-154`).
- **高阶 Hook**：`useConversationManager`、`useMessageSender`、`useConversationLoader`、`useStreamHandler`、`useSearchState` 提供分层架构；迁移时保留 Hook 结构，但需替换内部 data/service 调用（`apps/web/lib/hooks/useConversationManager.ts:52-239`, `apps/web/lib/hooks/conversation/useMessageSender.ts:32-187`).
- **会话操作 UI**：`ConversationHistory`、`ConversationList`、`RenameDialog`、`DeleteConfirmationDialog` 提供 rename/delete UI 与交互（`apps/web/components/sidebar/conversation-history.tsx:1-72`, `apps/web/components/conversation/conversation-list.tsx:1-88`).

### 认证与用户会话
- **Context 与 Provider**：`AuthProvider` + `useAuth` + `RequireAuth` 组合负责登录态检测、重定向、验证码流程（`apps/web/lib/contexts/auth.context.tsx:11-233`).
- **认证 UI**：`components/auth` 下的表单与布局可复用，需要移除或隐藏第三方登录入口以简化 Supabase 集成。

### 通用工具
- **异步状态与错误体系**：`useAsyncState`, `ChatError`, `CHAT_CONFIG`, `useVirtualScrolling` 提供统一 loading/错误/滚动逻辑，应直接迁移（`apps/web/lib/hooks/useAsyncState.ts:1-136`, `apps/web/lib/errors/chat-error.ts:1-152`, `apps/web/lib/constants/chat.ts:1-44`, `apps/web/lib/hooks/useVirtualScrolling.ts:1-49`).
- **国际化**：`lib/i18n-setup.ts` + `@moryflow/shared-i18n` translations，实现多语言 Hook 与资源加载（`apps/web/lib/i18n-setup.ts:1-200`). 迁移时将 `packages/shared-i18n/src` 精简复制到新仓库（如 `src/i18n/`），保留 `translations`、`hooks`、`components/I18nProvider` 等必要文件。

## 需剔除的模块
- 笔记相关所有目录：`components/notes`, `lib/stores/notes-*`, `lib/services/vector-sync.ts` 等。
- 音频、拖拽、搜索对话框等与核心聊天无关的 UI（保留后续扩展空间但默认不引用）。
- IndexedDB / `@moryflow/shared-storage` 等本地缓存实现。

## Supabase 替换策略
### 认证层
- 当前 `auth.service.ts` 依赖 `@moryflow/shared-api` 登录/注册接口与本地 token 缓存（`apps/web/lib/services/auth.service.ts:1-200`).
- Supabase 方案：在新项目中实现 `lib/services/supabase-auth.ts`：
  - 使用 `@supabase/supabase-js` 管理 email/password 注册、登录、Session 恢复、验证码（若需要 magic link 可扩展）。
  - 适配 `AuthProvider`：替换 `authService.signIn/signUp/signOut/sendVerificationCode/getCurrentUser/isAuthenticated` 的实现，并改用 Supabase session 监听。

### 会话与消息持久化
- 现有 `conversation-service.ts` + `useMessageSender` 通过 `@moryflow/shared-storage` (IndexedDB) 本地持久化并同步到 `@moryflow/shared-api`；迁移后直接使用 Supabase 表 (`conversations`, `messages`)：
  - 新建 `lib/services/supabase-conversations.ts`：封装 `ensureConversation`, `fetchConversations`, `fetchMessages`, `renameConversation`, `deleteConversation`, `upsertMessage` 调用。
  - `useMessageSender`/`useConversationLoader` 内调用改为 Supabase 版本；去掉 `storageApi` 依赖与临时 ID 生成逻辑，改为 Supabase 返回的 UUID 或使用 `crypto.randomUUID()` 作为前端临时占位。
  - Supabase Edge Function 完成 OpenAI 请求后写入消息表，实现最终数据落库。

### 流式响应 (SSE)
- 当前 `completionsStream` 通过 `@moryflow/shared-sse` 调用后端 `/v1/chat/completions` 并解析 OpenAI SSE（`apps/web/lib/api/conversation-web.ts:48-154`, `packages/shared-sse/src/web.ts:1-116`).
- Supabase 替换：
  - 在 Supabase Edge Function 中实现 OpenAI/Claude 流式代理，并返回兼容的 SSE 数据。
  - 在前端创建 `lib/api/supabase-stream.ts`，直接使用 `fetch` + `ReadableStream` 处理 SSE，沿用现有 `SSEEventHandlers` 接口即可。
  - 更新 `useStreamHandler` 注册的 handlers 以适配新的数据结构（若 payload 与现有 chunk 相同，仅替换导入路径即可）。

### 搜索/联网功能
- `useSearchState` 只管理前端开关与历史，不依赖 `@moryflow/shared-api`；若暂未提供联网搜索，可保留 UI 并禁用后端调用。

## @moryflow 依赖替换清单
| 现依赖 | 用途 | 迁移方案 |
| --- | --- | --- |
| `@moryflow/shared-api` | HTTP 客户端、认证、会话、SSE token | 使用 Supabase JS 客户端、`fetch`，自定义请求封装；移除 token 缓存改用 Supabase session。 |
| `@moryflow/shared-storage` | IndexedDB/SQLite 本地缓存 | 删除；所有会话/消息直接访问 Supabase 表。 |
| `@moryflow/shared-sse` | SSE 启动与解析 | 在项目内实现 `startChatStream`（基于 `fetch` + `ReadableStream`），保留 `SSEHandlers` 类型。 |
| `@moryflow/shared-i18n` | 多语言 hooks 与资源 | 将核心源码复制到新项目 `src/i18n/`，保留 hooks/Provider/translations，或改用 `react-i18next`。 |
| `@moryflow/shared-core` | `messageDocRef` 等工具 | 删除；直接使用 Supabase 行 ID。 |

## 推荐目录调整
```
src/
├── app/
│   ├── providers.tsx            # AuthProvider + I18nProvider
│   └── router/                  # AppRouter, RequireAuth
├── components/
│   ├── chat/                    # Chat UI (从 apps/web/components/chat 拷贝)
│   ├── sidebar/                 # 会话侧边栏组件
│   ├── auth/                    # 登录注册 UI
│   └── ui/                      # shadcn 组件（按需拷贝）
├── lib/
│   ├── supabase/                # Supabase 客户端与服务封装
│   │   ├── client.ts            # createClient + env
│   │   ├── auth.ts              # 替换 auth.service
│   │   ├── conversations.ts     # 替换 conversation-service
│   │   └── streaming.ts         # SSE fetch 工具
│   ├── contexts/                # AuthContext 等
│   ├── hooks/                   # useConversationManager 等（移除 shared-* 引用）
│   ├── stores/                  # Zustand store
│   ├── constants/               # CHAT_CONFIG 等
│   └── errors/                  # ChatError
├── i18n/                        # shared-i18n 精简代码 + translations
└── types/                       # Conversation/Message 类型
```

## 迁移步骤建议
1. **初始化基础项目**：创建新的 Vite + React + TypeScript + Supabase 项目，配置 Tailwind & shadcn。
2. **移除笔记模块**：拷贝 `apps/web` 组件时排除 `notes`、`audio`、`dnd` 等目录，清理侧边栏引用。
3. **复制 UI 与状态层**：将 `components/chat`, `components/sidebar`, `components/auth`, `lib/hooks`, `lib/stores`, `lib/constants`, `lib/errors`, `lib/i18n-setup.ts` 迁移到新目录，修正导入路径。
4. **实现 Supabase Service 层**：
   - 建立 `lib/supabase/client.ts`（`createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)`）。
   - 编写 `supabase-auth.ts`, `supabase-conversations.ts`, `supabase-messages.ts`，替换 Hook 内部调用。
   - 实现 `supabase-stream.ts`，封装 Edge Function `fetch` + SSE 解析逻辑。
5. **替换 Hook 中依赖**：在 `useConversationManager`、`useMessageSender`、`useStreamHandler` 中替换 `@moryflow/shared-*` 导入；保留乐观更新与错误处理结构。
6. **接入多语言**：将 `packages/shared-i18n/src` 精简复制到 `src/i18n/`，保持 `useTranslation` API 与现有组件兼容；配置语言资源加载方式（静态 JSON 或按需导入）。
7. **测试与清理**：确认登录、会话 CRUD、消息流、流式响应、国际化切换、错误提示全部可用；删除已不再使用的工具函数与类型。

## 后续考虑
- 流式 Edge Function 返回格式需与当前 `isChatCompletionChunk` 兼容，或调整 `useStreamHandler` 解析逻辑。
- 国际化资源应根据最终支持语言（中文/英文/日文/德文/阿拉伯语）裁剪，避免打包体积过大。
- 在 Supabase 端为 `conversations`、`messages` 实施计划中的 RLS、触发器与索引，匹配 `docs/ai-chatbot-implementation-plan.md` 定义。

## TODO（按执行顺序）
- [x] 初始化新的 Vite + React + TypeScript + Tailwind/shadcn 项目骨架。
- [x] 拷贝并整理 UI/状态层（聊天组件、侧边栏、认证 UI、Zustand、hooks、错误处理、i18n），去除 notes/audio 等多余模块，修正导入路径并移除 `@moryflow/shared-*` 依赖。
- [x] 调整路由与布局：接入 `AppRouter`、`AppShellLayout`、`RequireAuth`，确认多语言 Provider 正常运行。
  - 创建了 `src/router/layouts/app-shell-layout.tsx`（结合 RequireAuth + SidebarLayout）
  - 创建了 `src/router/layouts/auth-route-layout.tsx`（结合 PublicOnlyRoute + AuthLayout）
  - 创建了 `src/app/seo/seo.tsx` SEO 组件（基于 react-helmet-async）
  - 调整了页面文件路径：`home-page.tsx`、`not-found-page.tsx`，确保导出方式与路由配置匹配
  - 从路由中移除了 notes 相关代码和 `NotesStoreErrorWatcher`
  - 更新了 `App.tsx` 使用新的 `AppRouter`
  - 更新了 `main.tsx` 添加 `HelmetProvider`
  - 运行 `pnpm typecheck` 验证通过，无类型错误
- [x] 本地验证前端：确保界面编译通过、基础交互（创建对话、发送消息前的乐观更新、侧边栏导航、国际化切换）在无后端的 mock 环境下工作。
  - 修复了 `vite.config.ts` 中的 `client-error-logger` 插件引用
  - 安装缺失依赖：`react-helmet-async`、`zustand`、`@tanstack/react-virtual`、`motion`、`react-markdown`、`remark-gfm`、`@radix-ui/*` 等
  - 创建了缺失的 hook 文件：
    - `src/hooks/use-conversation-actions.ts` - 对话操作（重命名、删除）
    - `src/components/hooks/use-mobile.tsx` - 移动端检测
  - 修复了导入路径问题：将 `@/components/lib/utils` 改为 `@/lib/utils`
  - 简化了 `SidebarUserMenu` 组件，移除了设置对话框功能（非核心功能）
  - 开发服务器启动成功：`http://localhost:3000/`
  - TypeScript 类型检查通过：`pnpm typecheck` ✅
  - 生产构建成功：`pnpm build` ✅（输出 ~900KB gzipped）
- [ ] 构建 Supabase service 层：实现 `client.ts`、`supabase-auth.ts`、`supabase-conversations.ts`、`supabase-stream.ts`，替换 hooks 内部调用逻辑。
- [ ] 实现 Supabase Edge Function 处理 AI 流式回复，并与前端 SSE 解析对接。
- [ ] 配置 Supabase 数据库结构（表/索引/RLS/触发器）并与前端整合测试。
- [ ] 进行端到端测试（认证、会话 CRUD、流式响应、国际化），清理临时代码与依赖。
- [ ] review，整理不需要的代码，代码简洁


！！！！
使用 codex 开始写下面的逻辑
！！！！
