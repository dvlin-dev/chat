export enum ErrorCode {
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_VERIFICATION_CODE_INVALID = 'AUTH_VERIFICATION_CODE_INVALID',
  AUTH_VERIFICATION_CODE_EXPIRED = 'AUTH_VERIFICATION_CODE_EXPIRED',
  AUTH_USER_EXISTS = 'AUTH_USER_EXISTS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  CONVERSATION_NOT_FOUND = 'CONVERSATION_NOT_FOUND',
  CONVERSATION_CREATE_FAILED = 'CONVERSATION_CREATE_FAILED',
  MESSAGE_SEND_FAILED = 'MESSAGE_SEND_FAILED',
  OPERATION_FAILED = 'OPERATION_FAILED',
  NOTE_NOT_FOUND = 'NOTE_NOT_FOUND',
  NOTE_ACCESS_DENIED = 'NOTE_ACCESS_DENIED',
  NOTE_CREATE_FAILED = 'NOTE_CREATE_FAILED',
  NOTE_UPDATE_FAILED = 'NOTE_UPDATE_FAILED',
  FILE_SIZE_TOO_LARGE = 'FILE_SIZE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED = 'FILE_TYPE_NOT_ALLOWED',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_UPDATE_FAILED = 'USER_UPDATE_FAILED',
  HTTP_500 = 'HTTP_500',
  HTTP_502 = 'HTTP_502',
  HTTP_503 = 'HTTP_503',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface HttpError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp?: string
  path?: string
}

export interface User {
  id: string
  email?: string
  username?: string
  avatarUrl?: string
  createdAt?: string
  updatedAt?: string
}

const AUTH_ERROR_CODES = new Set<string>([
  ErrorCode.AUTH_TOKEN_EXPIRED,
  ErrorCode.AUTH_TOKEN_INVALID,
  ErrorCode.AUTH_USER_NOT_FOUND,
  ErrorCode.AUTH_INVALID_CREDENTIALS,
  ErrorCode.AUTH_VERIFICATION_CODE_INVALID,
  ErrorCode.AUTH_VERIFICATION_CODE_EXPIRED,
  ErrorCode.AUTH_USER_EXISTS,
])

export function isAuthError(code: string): boolean {
  return AUTH_ERROR_CODES.has(code)
}

const SYSTEM_ERROR_CODES = new Set<string>([
  ErrorCode.SERVICE_UNAVAILABLE,
  ErrorCode.HTTP_500,
  ErrorCode.HTTP_502,
  ErrorCode.HTTP_503,
])

export function isSystemError(code: string): boolean {
  return SYSTEM_ERROR_CODES.has(code)
}

export function getHttpStatusFromErrorCode(code: string): number {
  switch (code) {
    case ErrorCode.PERMISSION_DENIED:
      return 403
    case ErrorCode.RESOURCE_NOT_FOUND:
    case ErrorCode.CONVERSATION_NOT_FOUND:
      return 404
    case ErrorCode.RATE_LIMIT_EXCEEDED:
      return 429
    case ErrorCode.HTTP_500:
      return 500
    case ErrorCode.HTTP_502:
      return 502
    case ErrorCode.HTTP_503:
      return 503
    default:
      return 400
  }
}
