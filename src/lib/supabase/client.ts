import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'

export interface SupabaseEnvConfig {
  url: string
  anonKey: string
  autoRefreshToken?: boolean
  persistSession?: boolean
  detectSessionInUrl?: boolean
}

export interface SupabaseSession {
  accessToken: string
  refreshToken: string
  expiresAt?: number
}

type AuthStateListener = (session: Session | null) => void

let supabaseClient: SupabaseClient | null = null
let currentSession: Session | null = null

const authListeners = new Set<AuthStateListener>()
const DEFAULT_STORAGE_KEY = 'moryflow.supabase.auth.token'

function resolveEnvConfig(overrides?: Partial<SupabaseEnvConfig>): SupabaseEnvConfig {
  const url = overrides?.url ?? import.meta.env.VITE_SUPABASE_URL
  const anonKey = overrides?.anonKey ?? import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error('[Supabase] 缺少 VITE_SUPABASE_URL 环境变量')
  }
  if (!anonKey) {
    throw new Error('[Supabase] 缺少 VITE_SUPABASE_ANON_KEY 环境变量')
  }

  return {
    url,
    anonKey,
    autoRefreshToken: overrides?.autoRefreshToken ?? true,
    persistSession: overrides?.persistSession ?? true,
    detectSessionInUrl: overrides?.detectSessionInUrl ?? true,
  }
}

function initSupabaseClient(config?: SupabaseEnvConfig): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  const resolvedConfig = resolveEnvConfig(config)

  supabaseClient = createClient(resolvedConfig.url, resolvedConfig.anonKey, {
    auth: {
      autoRefreshToken: resolvedConfig.autoRefreshToken,
      persistSession: resolvedConfig.persistSession,
      detectSessionInUrl: resolvedConfig.detectSessionInUrl,
      storageKey: DEFAULT_STORAGE_KEY,
    },
  })

  // 初始化时同步一次会话
  void supabaseClient.auth.getSession().then(({ data }) => {
    currentSession = data.session ?? null
  })

  // 订阅会话变化并转发给业务层
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentSession = session ?? null
    for (const listener of authListeners) {
      try {
        listener(currentSession)
      } catch (error) {
        console.error('[Supabase] 触发会话监听器时出错:', error)
      }
    }
  })

  return supabaseClient
}

export function getSupabaseClient(): SupabaseClient {
  return initSupabaseClient()
}

export function createSupabaseClient(config?: SupabaseEnvConfig): SupabaseClient {
  return initSupabaseClient(config)
}

export function getCurrentSession(): Session | null {
  return currentSession
}

export function setAuthSession(session: SupabaseSession): Promise<{
  data: Session | null
  error: Error | null
}> {
  const client = getSupabaseClient()
  return client.auth
    .setSession({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    })
    .then(({ data, error }) => {
      if (error) {
        throw error
      }
      currentSession = data.session ?? null
      return { data: data.session ?? null, error: null }
    })
    .catch((err: Error) => {
      return { data: null, error: err }
    })
}

export function clearAuthSession(): Promise<void> {
  const client = getSupabaseClient()
  return client.auth.signOut().then(() => {
    currentSession = null
  })
}

export function onSupabaseAuthStateChange(listener: AuthStateListener): () => void {
  authListeners.add(listener)
  return () => {
    authListeners.delete(listener)
  }
}
