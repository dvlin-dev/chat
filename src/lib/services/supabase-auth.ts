import type { Session, AuthError as SupabaseAuthError, User as SupabaseUser } from '@supabase/supabase-js'
import { getSupabaseClient, onSupabaseAuthStateChange } from '@/lib/supabase/client'
import type { User } from '@/lib/types/api'

export type VerificationPurpose = 'signup' | 'login' | 'reset' | 'verify'

export interface SupabaseAuthResult {
  user: User
  session: Session
}

export interface VerificationResult {
  user: User | null
  session: Session | null
}

function mapSupabaseUser(user: SupabaseUser | null): User | null {
  if (!user) return null
  const metadata = user.user_metadata ?? {}
  const displayName =
    metadata.display_name ??
    metadata.full_name ??
    (user.email ? user.email.split('@')[0] : undefined)

  return {
    id: user.id,
    email: user.email ?? undefined,
    username: displayName,
    avatarUrl: metadata.avatar_url ?? undefined,
    createdAt: user.created_at,
    updatedAt: user.updated_at ?? user.created_at,
  }
}

export function subscribeAuthState(
  listener: (session: Session | null, user: User | null) => void
): () => void {
  return onSupabaseAuthStateChange((session) => {
    listener(session, mapSupabaseUser(session?.user ?? null))
  })
}

export async function getCurrentUser(): Promise<VerificationResult> {
  const client = getSupabaseClient()
  const { data, error } = await client.auth.getSession()
  if (error) {
    throw error
  }

  const session = data.session ?? null
  return {
    session,
    user: mapSupabaseUser(session?.user ?? null),
  }
}

export async function signInWithPassword(email: string, password: string): Promise<SupabaseAuthResult> {
  const client = getSupabaseClient()
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  if (!data.session) {
    throw new Error('Missing Supabase session in password sign in response')
  }

  const user = mapSupabaseUser(data.user)
  if (!user) {
    throw new Error('Missing Supabase user in password sign in response')
  }

  return {
    user,
    session: data.session,
  }
}

export async function signUpWithPassword(email: string, password: string, metadata?: Record<string, unknown>) {
  const client = getSupabaseClient()
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: import.meta.env.VITE_SUPABASE_AUTH_REDIRECT_URL,
    },
  })

  if (error) {
    throw error
  }

  if (!data.session || !data.user) {
    // Supabase may require email confirmation; return partial result
    return {
      session: data.session ?? null,
      user: mapSupabaseUser(data.user) ?? null,
      emailConfirmationRequired: !data.session,
    }
  }

  return {
    session: data.session,
    user: mapSupabaseUser(data.user),
    emailConfirmationRequired: false,
  }
}

export async function sendOtp(email: string, purpose: VerificationPurpose) {
  const client = getSupabaseClient()

  switch (purpose) {
    case 'signup': {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            verification_purpose: 'signup',
          },
        },
      })
      if (error) throw error
      return
    }
    case 'login':
    case 'verify':
    case 'reset': {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          data: {
            verification_purpose: purpose,
          },
        },
      })
      if (error) throw error
      return
    }
    default:
      throw new Error(`Unsupported verification purpose: ${purpose}`)
  }
}

function resolveOtpType(purpose: VerificationPurpose): 'signup' | 'email' | 'recovery' {
  switch (purpose) {
    case 'signup':
      return 'signup'
    case 'reset':
      return 'recovery'
    case 'login':
    case 'verify':
    default:
      return 'email'
  }
}

export async function verifyOtpCode(params: {
  email: string
  token: string
  purpose: VerificationPurpose
}): Promise<SupabaseAuthResult> {
  const client = getSupabaseClient()
  const type = resolveOtpType(params.purpose)

  const { data, error } = await client.auth.verifyOtp({
    email: params.email,
    token: params.token,
    type,
  })

  if (error) {
    throw error
  }

  if (!data.session) {
    throw new Error('Missing Supabase session after OTP verification')
  }

  const user = mapSupabaseUser(data.user)
  if (!user) {
    throw new Error('Missing Supabase user after OTP verification')
  }

  return {
    user,
    session: data.session,
  }
}

export async function updateUserProfile(updates: {
  password?: string
  displayName?: string
  avatarUrl?: string
}) {
  const client = getSupabaseClient()
  const payload: {
    password?: string
    data?: Record<string, unknown>
  } = {}

  if (updates.password) {
    payload.password = updates.password
  }

  if (updates.displayName || updates.avatarUrl) {
    payload.data = {
      ...(updates.displayName ? { display_name: updates.displayName } : {}),
      ...(updates.avatarUrl ? { avatar_url: updates.avatarUrl } : {}),
    }
  }

  if (!payload.password && !payload.data) {
    return
  }

  const { error } = await client.auth.updateUser(payload)
  if (error) {
    throw error
  }
}

export function mapSupabaseAuthError(error: SupabaseAuthError): SupabaseAuthError {
  return error
}
