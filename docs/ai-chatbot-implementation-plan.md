# AI Chatbot 实现方案

## 项目概述

构建一个基于 React + Supabase 的 AI Chatbot 应用，支持用户注册/登录、会话管理、实时对话等功能。

## 功能需求

### 1. 用户认证模块
- ✅ 用户注册（邮箱 + 密码）
- ✅ 用户登录
- ✅ 用户退出登录
- ✅ 密码重置（可选，后期添加）
- ✅ Session 持久化

### 2. 聊天功能模块
- ✅ 创建新对话
- ✅ 查看对话历史列表
- ✅ 发送消息
- ✅ 接收 AI 回复（流式输出）
- ✅ 删除对话
- ✅ 重命名对话（可选）
- ✅ 消息历史记录

### 3. UI/UX 功能
- ✅ 响应式设计（移动端 + 桌面端）
- ✅ 深色/浅色主题切换（已有 ThemeProvider）
- ✅ 加载状态提示
- ✅ 错误处理和提示
- ✅ 流式回复展示

## 技术架构

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **路由**: React Router v7
- **UI 组件**: shadcn/ui + Tailwind CSS
- **状态管理**: React Context + Hooks
- **表单验证**: React Hook Form + Zod
- **HTTP 客户端**: Fetch API
- **通知**: Sonner (已集成)

### 后端服务
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **实时更新**: Supabase Realtime (可选)
- **AI 服务**: OpenAI API 

## 数据库设计

### 1. Users 表 (由 Supabase Auth 自动管理)
Supabase Auth 自动提供 `auth.users` 表，包含：
- id (UUID)
- email
- created_at
- 等...

### 2. conversations 表
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

-- 启用 RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能访问自己的对话
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);
```

### 3. messages 表
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at ASC);

-- 启用 RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能访问自己对话中的消息
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );
```

### 4. 自动更新 updated_at 触发器
```sql
-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用到 conversations 表
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 页面和路由设计

### 路由结构
```
/                          # 首页（未登录显示介绍，已登录重定向到 /chat）
/auth/login                # 登录页面
/auth/register             # 注册页面
/chat                      # 聊天主界面（需要登录）
/chat/:conversationId      # 具体对话页面（需要登录）
```

### 页面组件结构
```
src/
├── pages/
│   ├── Home/              # 首页（欢迎页）
│   │   └── index.tsx
│   ├── Auth/              # 认证相关页面
│   │   ├── Login.tsx      # 登录页
│   │   └── Register.tsx   # 注册页
│   ├── Chat/              # 聊天主页面
│   │   └── index.tsx
│   └── NotFound/          # 404 页面
│       └── index.tsx
```

## 组件设计

### 1. 需要创建的业务组件

#### 认证组件
- `LoginForm`: 登录表单
- `RegisterForm`: 注册表单
- `AuthLayout`: 认证页面布局

#### 聊天组件
- `ChatLayout`: 聊天页面主布局（侧边栏 + 主内容区）
- `Sidebar`: 侧边栏（对话列表 + 新建对话按钮）
- `ConversationList`: 对话列表
- `ConversationItem`: 单个对话项
- `ChatArea`: 聊天区域
- `MessageList`: 消息列表
- `Message`: 单条消息组件
- `ChatInput`: 消息输入框
- `UserMenu`: 用户下拉菜单
- `ProtectedRoute`: 路由守卫组件

### 2. 需要添加的 shadcn/ui 组件

当前已有组件：
- ✅ alert
- ✅ button
- ✅ card
- ✅ dialog
- ✅ dropdown-menu
- ✅ form
- ✅ input
- ✅ label
- ✅ select
- ✅ sonner (toast)

需要添加的组件：
```bash
# 添加以下 shadcn 组件
npx shadcn@latest add avatar      # 用户头像
npx shadcn@latest add scroll-area # 滚动区域
npx shadcn@latest add separator   # 分隔线
npx shadcn@latest add skeleton    # 加载骨架屏
npx shadcn@latest add textarea    # 多行文本输入
npx shadcn@latest add tooltip     # 提示框
```

## AI API 集成方案

### 架构设计（Supabase Edge Functions）

#### 核心逻辑流程

**请求处理流程**:
1. 验证用户身份（通过 Authorization header）
2. 验证 conversationId 属于当前用户（防止越权）
3. 保存用户消息到 messages 表
4. 检查是否为首条消息，若是则自动生成对话标题
5. 调用 OpenAI/Claude API 获取流式响应
6. 记录请求日志（userId、conversationId、时间戳）
7. 返回流式响应给前端

**前端处理流程**:
1. 调用 Edge Function
2. 实时读取流式响应并更新 UI
3. 收集完整响应后保存到 messages 表
4. 更新 conversation 的 updated_at 时间戳

#### 安全控制

- ✅ CORS 配置（允许前端域名）
- ✅ 用户身份验证（必须登录）
- ✅ 数据权限校验（RLS + Edge Function 双重验证）
- ✅ API Key 存储在服务端环境变量
- ✅ 错误处理和日志记录

#### 性能优化

- ✅ 流式响应（提升用户体验）
- ✅ 消息分页加载（避免一次加载过多数据）
- ✅ 请求日志异步写入（不阻塞主流程）
- ✅ 数据库索引优化（conversation_id、created_at）

## 实现步骤

### Phase 1: 基础设置 (1-2 小时)
1. ✅ 在 Supabase Dashboard 创建数据库表
2. ✅ 安装缺失的 shadcn 组件
3. ✅ 创建基础目录结构
4. ✅ 配置环境变量（AI API Key）

### Phase 2: 用户认证 (2-3 小时)
1. ✅ 创建 AuthContext 和 Provider
2. ✅ 实现登录页面 (LoginForm)
3. ✅ 实现注册页面 (RegisterForm)
4. ✅ 实现 ProtectedRoute 路由守卫
5. ✅ 添加用户菜单和退出登录功能
6. ✅ 测试认证流程

### Phase 3: 聊天界面 (3-4 小时)
1. ✅ 创建 ChatLayout 主布局
2. ✅ 实现 Sidebar（对话列表）
3. ✅ 实现 ChatArea（消息展示区）
4. ✅ 实现 ChatInput（消息输入）
5. ✅ 样式调整（响应式设计）

### Phase 4: 对话管理 (2-3 小时)
1. ✅ 实现创建新对话
2. ✅ 实现切换对话
3. ✅ 实现删除对话
4. ✅ 实现加载对话历史
5. ✅ 添加空状态提示

### Phase 5: AI 集成 (3-4 小时)
1. ✅ 创建 Supabase Edge Function（或选择其他方案）
2. ✅ 实现消息发送逻辑
3. ✅ 实现流式响应处理
4. ✅ 添加加载状态和错误处理
5. ✅ 测试 AI 对话功能

### Phase 6: 优化和完善 (2-3 小时)
1. ✅ 添加消息复制功能
2. ✅ 添加重新生成回复功能（可选）
3. ✅ 优化加载性能
4. ✅ 添加错误边界
5. ✅ 完善 UI 细节
6. ✅ 移动端适配测试

**总计**: 约 13-19 小时

## 安全考虑

### 1. 认证安全
- ✅ 使用 Supabase Auth（已有安全保障）
- ✅ 密码强度验证（前端 + Supabase 配置）
- ✅ Session 自动过期和刷新

### 2. 数据安全
- ✅ 启用 Supabase RLS（Row Level Security）
- ✅ 所有表都配置适当的 RLS 策略
- ✅ 防止用户访问其他用户的数据

### 3. API 安全
- ✅ API Key 存储在服务端（Edge Functions 环境变量）
- ✅ 前端不暴露 API Key
- ✅ 请求速率限制（Supabase 层面）

### 4. XSS 防护
- ✅ React 自动转义输出
- ✅ 消息内容使用安全的渲染方式
- ✅ 避免使用 dangerouslySetInnerHTML

## 环境变量配置

### .env 文件
```bash
# Supabase
VITE_SUPABASE_URL=https://wnqbfuoghfaefnidspia.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI API (用于 Edge Function，不要放在前端)
# OPENAI_API_KEY=sk-xxx           # 在 Supabase Dashboard 配置
# ANTHROPIC_API_KEY=sk-ant-xxx    # 在 Supabase Dashboard 配置
```

## 项目文件结构（完成后）

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthLayout.tsx
│   ├── chat/
│   │   ├── ChatLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ConversationList.tsx
│   │   ├── ConversationItem.tsx
│   │   ├── ChatArea.tsx
│   │   ├── MessageList.tsx
│   │   ├── Message.tsx
│   │   ├── ChatInput.tsx
│   │   └── UserMenu.tsx
│   ├── ui/                        # shadcn 组件
│   ├── Lazy.tsx
│   ├── PageLoader.tsx
│   ├── ThemeProvider.tsx
│   └── ProtectedRoute.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── ChatContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useChat.ts
│   ├── useConversations.ts
│   └── useMessages.ts
├── lib/
│   ├── supabase.ts
│   ├── api.ts                     # API 调用封装
│   └── utils.ts
├── pages/
│   ├── Home/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── Chat/
│   │   └── index.tsx
│   └── NotFound/
├── types/
│   └── index.ts                   # TypeScript 类型定义
├── routes/
│   └── index.tsx
├── App.tsx
└── main.tsx
```

## API 设计

### 数据操作逻辑

#### 1. 认证流程
- **注册**: email + password → Supabase Auth 自动创建 auth.users 记录
- **登录**: 验证凭据 → 返回 JWT token → 前端存储 token
- **登出**: 清除本地 session → 清除 Supabase session
- **Session 持久化**: Supabase SDK 自动处理 token 刷新

#### 2. 对话管理逻辑
- **创建对话**: 插入 conversations 表（默认标题 "New Chat"）
- **获取列表**: 按 updated_at 降序查询（最近更新的在前）
- **删除对话**: CASCADE 删除（自动删除关联的 messages）
- **更新标题**: 手动修改或自动生成（取首条消息前30字符）
- **切换对话**: 加载对应的 messages 列表

#### 3. 消息处理逻辑
- **分页加载**: 每页 50 条，按 created_at 升序（最早的在前）
- **发送消息**:
  1. 前端乐观更新 UI（先显示用户消息）
  2. 调用 Edge Function
  3. 流式接收 AI 响应并实时更新
  4. 完成后保存完整的 AI 响应到数据库
- **消息存储**: user 和 assistant 角色的消息都保存到 messages 表

#### 4. Edge Function 调用
- **输入**: messages 数组（包含历史对话）+ conversationId
- **输出**: 流式响应（Server-Sent Events 或 ReadableStream）
- **错误处理**: 网络错误、API 限流、认证失败等

## UI 设计参考

### 布局
- **桌面端**: 左侧固定宽度侧边栏（260-280px）+ 右侧主内容区
- **移动端**: 侧边栏可收起，主内容区全屏

### 颜色主题
使用 shadcn/ui 默认主题变量:
- `background`: 主背景色
- `foreground`: 主文字色
- `muted`: 次要背景色
- `border`: 边框色
- `primary`: 主题色（按钮、链接等）

### 组件样式参考
- **消息气泡**: 用户消息右对齐（蓝色），AI 回复左对齐（灰色）
- **侧边栏**: 深色背景，对话列表项悬浮效果
- **输入框**: 圆角边框，带发送按钮

## 测试计划

### 功能测试
1. ✅ 用户注册流程
2. ✅ 用户登录流程
3. ✅ 创建新对话
4. ✅ 发送消息和接收回复
5. ✅ 切换对话
6. ✅ 删除对话
7. ✅ 退出登录

### 边界测试
1. ✅ 未登录访问 /chat 自动跳转登录页
2. ✅ 已登录访问 /auth/login 自动跳转聊天页
3. ✅ 空对话状态提示
4. ✅ 网络错误处理
5. ✅ API 调用失败处理

### 性能测试
1. ✅ 长对话列表加载性能
2. ✅ 大量消息滚动性能
3. ✅ 流式响应展示流畅度

## 后续扩展功能

### V2 功能
- 🔄 消息编辑和删除
- 🔄 代码高亮显示
- 🔄 Markdown 渲染
- 🔄 文件上传（图片、文档）
- 🔄 对话分享功能
- 🔄 对话搜索

### V3 功能
- 🔄 多模型选择（GPT-4, Claude, etc）
- 🔄 System Prompt 自定义
- 🔄 Token 使用统计
- 🔄 对话导出（Markdown, PDF）
- 🔄 语音输入/输出
- 🔄 多语言支持

## 参考资源

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Anthropic Claude API](https://docs.anthropic.com/)

## 总结

这是一个完整的、生产级别的 AI Chatbot 实现方案，包含：
- ✅ 完整的用户认证系统
- ✅ 安全的数据存储和访问控制
- ✅ 现代化的 UI/UX 设计
- ✅ 可扩展的架构设计
- ✅ 详细的实现步骤

预计总开发时间：**13-19 小时**（单人开发）

建议按照 Phase 1-6 的顺序逐步实现，每个阶段完成后进行测试，确保功能正常后再进入下一阶段。
