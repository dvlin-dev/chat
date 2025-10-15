import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

type UrlQuery = Record<string, string | string[]>

type UrlObject = {
  pathname?: string
  query?: Record<string, unknown>
  hash?: string
}

type Url = string | UrlObject

type NavigateOptions = {
  replace?: boolean
  state?: unknown
}

function toQueryRecord(searchParams: URLSearchParams): UrlQuery {
  const result: UrlQuery = {}
  searchParams.forEach((value, key) => {
    if (key in result) {
      const current = result[key]
      result[key] = Array.isArray(current) ? [...current, value] : [current, value]
    } else {
      result[key] = value
    }
  })
  return result
}

function buildSearch(query?: Record<string, unknown>): string {
  if (!query) return ''
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)))
    } else {
      params.set(key, String(value))
    }
  })
  const search = params.toString()
  return search ? `?${search}` : ''
}

function resolveUrl(url: Url, currentPath: string): string {
  if (typeof url === 'string') {
    return url
  }
  const pathname = url.pathname ?? currentPath
  const search = buildSearch(url.query)
  const hash = url.hash ? `#${url.hash.replace(/^#/, '')}` : ''
  return `${pathname}${search}${hash}`
}

export function useAppRouter() {
  const navigate = useNavigate()
  const location = useLocation()

  const query = useMemo(() => toQueryRecord(new URLSearchParams(location.search)), [location.search])

  const push = useCallback(
    (url: Url, _as?: Url, options?: NavigateOptions) => {
      const target = resolveUrl(url, location.pathname)
      navigate(target, { replace: options?.replace ?? false, state: options?.state })
      return Promise.resolve(true)
    },
    [navigate, location.pathname]
  )

  const replace = useCallback(
    (url: Url, as?: Url, options?: NavigateOptions) => {
      return push(url, as, { ...options, replace: true })
    },
    [push]
  )

  const back = useCallback(() => navigate(-1), [navigate])
  const forward = useCallback(() => navigate(1), [navigate])

  return {
    push,
    replace,
    back,
    forward,
    prefetch: async () => {},
    pathname: location.pathname,
    asPath: `${location.pathname}${location.search}${location.hash}`,
    query,
    isReady: true,
  }
}
