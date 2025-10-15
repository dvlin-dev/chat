/**
 * 搜索状态管理 Hook
 * 管理聊天中的搜索功能状态
 */

import { useState, useCallback } from 'react'
import type { SSESearchStatus, SSESearchSources, WebSearchConfig } from '@/lib/types/api'

export interface SearchState {
  enabled: boolean
  currentStatus: SSESearchStatus | null
  currentSources: SSESearchSources | null
  searchHistory: Array<{
    query: string
    sources: SSESearchSources
    timestamp: string
  }>
}

export interface UseSearchStateReturn {
  searchState: SearchState
  setSearchEnabled: (enabled: boolean) => void
  handleSearchStatus: (status: SSESearchStatus) => void
  handleSearchSources: (sources: SSESearchSources) => void
  clearSearchState: () => void
  getSearchParams: () => {
    enableWebSearch: boolean
  }
}

export function useSearchState(): UseSearchStateReturn {
  const [searchState, setSearchState] = useState<SearchState>({
    enabled: false,
    currentStatus: null,
    currentSources: null,
    searchHistory: [],
  })

  const setSearchEnabled = useCallback((enabled: boolean) => {
    setSearchState((prev) => ({ ...prev, enabled }))
  }, [])

  const handleSearchStatus = useCallback((status: SSESearchStatus) => {
    setSearchState((prev) => ({
      ...prev,
      currentStatus: status,
    }))
  }, [])

  const handleSearchSources = useCallback((sources: SSESearchSources) => {
    setSearchState((prev) => {
      // 添加到搜索历史
      const newHistory = [
        ...prev.searchHistory,
        {
          query: prev.currentStatus?.query || '',
          sources,
          timestamp: new Date().toISOString(),
        },
      ].slice(-10) // 只保留最近10条

      return {
        ...prev,
        currentSources: sources,
        searchHistory: newHistory,
      }
    })
  }, [])

  const clearSearchState = useCallback(() => {
    setSearchState((prev) => ({
      ...prev,
      currentStatus: null,
      currentSources: null,
    }))
  }, [])

  const getSearchParams = useCallback(() => {
    const params = {
      enableWebSearch: searchState.enabled,
    }
    return params
  }, [searchState.enabled])

  return {
    searchState,
    setSearchEnabled,
    handleSearchStatus,
    handleSearchSources,
    clearSearchState,
    getSearchParams,
  }
}
