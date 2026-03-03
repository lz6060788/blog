'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { uploadFile, deleteFile as apiDeleteFile, validateFile } from '@/lib/api/upload'
import type { UploadResponse } from '@/lib/types/upload'
import { getErrorMessage } from '@/lib/types/upload'

/**
 * 文件上传状态
 */
interface UploadState {
  /** 是否正在上传 */
  isUploading: boolean
  /** 上传进度 (0-100) */
  progress: number
  /** 错误消息 */
  error: string | null
  /** 上传结果 */
  result: UploadResponse | null
}

/**
 * useFileUpload Hook 返回值
 */
interface UseFileUploadReturn {
  /** 上传状态 */
  state: UploadState
  /** 上传单个文件 */
  upload: (file: File) => Promise<UploadResponse | null>
  /** 上传多个文件 */
  uploadMultiple: (files: File[]) => Promise<Array<UploadResponse | null>>
  /** 删除文件 */
  deleteFile: (key: string) => Promise<void>
  /** 重置状态 */
  reset: () => void
  /** 取消上传 */
  cancel: () => void
}

/**
 * 文件上传 Hook
 *
 * @returns 上传功能和状态
 *
 * @example
 * ```tsx
 * const { state, upload, reset } = useFileUpload()
 *
 * const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0]
 *   if (file) {
 *     upload(file)
 *   }
 * }
 * ```
 */
export function useFileUpload(): UseFileUploadReturn {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    result: null,
  })

  // 使用 ref 来存储 AbortController，以便取消请求
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      result: null,
    })
  }, [])

  /**
   * 取消上传
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: '上传已取消',
      }))
    }
  }, [])

  /**
   * 上传单个文件
   */
  const upload = useCallback(async (file: File): Promise<UploadResponse | null> => {
    // 1. 客户端验证
    const validation = validateFile(file)
    if (!validation.valid) {
      setState({
        isUploading: false,
        progress: 0,
        error: validation.error || '文件验证失败',
        result: null,
      })
      toast.error(validation.error || '文件验证失败')
      return null
    }

    // 2. 重置状态并开始上传
    setState({
      isUploading: true,
      progress: 0,
      error: null,
      result: null,
    })

    // 3. 创建新的 AbortController
    abortControllerRef.current = new AbortController()

    try {
      // 4. 上传文件
      const result = await uploadFile({
        file,
        signal: abortControllerRef.current.signal,
        onProgress: (progress) => {
          setState(prev => ({
            ...prev,
            progress,
          }))
        },
      })

      // 5. 上传成功
      setState({
        isUploading: false,
        progress: 100,
        error: null,
        result,
      })

      toast.success('文件上传成功')
      return result
    } catch (error) {
      // 6. 处理错误
      const errorMessage = getErrorMessage(error)

      setState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        result: null,
      })

      // 如果不是用户取消的错误，显示错误提示
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error(errorMessage)
      }

      return null
    } finally {
      abortControllerRef.current = null
    }
  }, [])

  /**
   * 上传多个文件
   */
  const uploadMultiple = useCallback(async (files: File[]): Promise<Array<UploadResponse | null>> => {
    if (files.length === 0) {
      toast.error('请选择要上传的文件')
      return []
    }

    setState({
      isUploading: true,
      progress: 0,
      error: null,
      result: null,
    })

    const results: Array<UploadResponse | null> = []
    const totalFiles = files.length
    let completedFiles = 0

    for (const file of files) {
      try {
        const result = await uploadFile({
          file,
          onProgress: (fileProgress) => {
            // 计算总体进度
            const overallProgress = Math.floor(
              ((completedFiles * 100 + fileProgress) / totalFiles)
            )
            setState(prev => ({
              ...prev,
              progress: Math.min(overallProgress, 100),
            }))
          },
        })

        results.push(result)
        completedFiles++
      } catch (error) {
        results.push(null)
        completedFiles++
        console.error('文件上传失败:', error)
      }
    }

    // 计算成功和失败的数量
    const successCount = results.filter(r => r !== null).length
    const failCount = results.filter(r => r === null).length

    setState({
      isUploading: false,
      progress: 100,
      error: failCount > 0 ? `${failCount} 个文件上传失败` : null,
      result: null,
    })

    if (failCount === 0) {
      toast.success(`成功上传 ${successCount} 个文件`)
    } else if (successCount > 0) {
      toast(`${successCount} 个文件上传成功，${failCount} 个失败`, { icon: '⚠️' })
    } else {
      toast.error('所有文件上传失败')
    }

    return results
  }, [])

  /**
   * 删除文件
   */
  const deleteFile = useCallback(async (key: string): Promise<void> => {
    try {
      await apiDeleteFile(key)
      toast.success('文件删除成功')
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
      throw error
    }
  }, [])

  return {
    state,
    upload,
    uploadMultiple,
    deleteFile,
    reset,
    cancel,
  }
}

export default useFileUpload
