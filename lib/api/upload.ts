/**
 * 文件上传 API 客户端
 */

import axios, { AxiosProgressEvent } from "axios";
import type {
  UploadRequest,
  UploadResponse,
  DeleteResponse,
  ApiError,
  FileValidationResult,
  FileValidationConfig,
} from "@/lib/types/upload";

// ============================================================================
// 配置
// ============================================================================

const API_BASE_URL = "/api";

// 默认文件验证配置
const DEFAULT_VALIDATION_CONFIG: FileValidationConfig = {
  maxSize: 10 * 1024 * 1024, // 5MB
  allowedExtensions: ["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf", "doc", "docx", "txt", "md"],
};

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 验证文件
 */
export function validateFile(
  file: File,
  config: FileValidationConfig = DEFAULT_VALIDATION_CONFIG
): FileValidationResult {
  // 检查文件大小
  if (config.maxSize && file.size > config.maxSize) {
    return {
      valid: false,
      error: `文件大小超过 ${Math.floor(config.maxSize / 1024 / 1024)}MB 限制`,
    };
  }

  // 检查文件扩展名
  if (config.allowedExtensions) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!config.allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `不支持的文件类型，请上传：${config.allowedExtensions.join(", ")}`,
      };
    }
  }

  return { valid: true };
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ============================================================================
// API 客户端函数
// ============================================================================

/**
 * 上传文件
 *
 * @param request - 上传请求配置
 * @returns 上传响应
 * @throws UploadError
 */
export async function uploadFile(request: UploadRequest): Promise<UploadResponse> {
  const { file, onProgress, signal } = request;

  // 1. 客户端验证
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 2. 创建 FormData
  const formData = new FormData();
  formData.append("file", file);

  try {
    // 3. 发送请求
    const response = await axios.post<UploadResponse>(
      `${API_BASE_URL}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal,
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );

    return response.data;
  } catch (error) {
    // 4. 处理错误
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as ApiError;
      if (data) {
        throw {
          name: "UploadError",
          code: data.error,
          message: data.message,
          details: data.details,
        };
      }
      throw new Error(error.message || "上传失败，请稍后重试");
    }
    throw error;
  }
}

/**
 * 删除文件
 *
 * @param key - COS 对象键
 * @returns 删除响应
 * @throws Error
 */
export async function deleteFile(key: string): Promise<DeleteResponse> {
  try {
    const response = await axios.delete<DeleteResponse>(`${API_BASE_URL}/upload/${key}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as ApiError;
      if (data) {
        throw new Error(data.message);
      }
      throw new Error(error.message || "删除失败，请稍后重试");
    }
    throw error;
  }
}

/**
 * 批量上传文件
 *
 * @param files - 文件列表
 * @param onProgress - 总体进度回调
 * @param signal - 取消信号
 * @returns 上传结果数组
 */
export async function uploadMultipleFiles(
  files: File[],
  onProgress?: (overallProgress: number) => void,
  signal?: AbortSignal
): Promise<Array<{ success: boolean; data?: UploadResponse; error?: string }>> {
  const results: Array<{ success: boolean; data?: UploadResponse; error?: string }> = [];
  const totalFiles = files.length;
  let completedFiles = 0;

  for (const file of files) {
    try {
      const data = await uploadFile({
        file,
        onProgress: (fileProgress) => {
          // 计算总体进度
          if (onProgress) {
            const overallProgress = Math.floor(
              ((completedFiles * 100 + fileProgress) / totalFiles)
            );
            onProgress(Math.min(overallProgress, 100));
          }
        },
        signal,
      });

      results.push({ success: true, data });
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : "上传失败",
      });
    }

    completedFiles++;
  }

  return results;
}

// ============================================================================
// 导出
// ============================================================================

export default {
  uploadFile,
  deleteFile,
  uploadMultipleFiles,
  validateFile,
  getFileExtension,
  formatFileSize,
};
