/**
 * 文件上传相关类型定义
 */

// ============================================================================
// 上传请求类型
// ============================================================================

/**
 * 上传请求配置
 */
export interface UploadRequest {
  /** 文件数据 */
  file: File;
  /** 上传进度回调 */
  onProgress?: (progress: number) => void;
  /** 取消信号 */
  signal?: AbortSignal;
}

// ============================================================================
// 上传响应类型
// ============================================================================

/**
 * 上传成功响应
 */
export interface UploadResponse {
  /** 文件公开访问 URL */
  url: string;
  /** COS 对象键 */
  key: string;
  /** 原始文件名 */
  filename: string;
  /** 文件大小（字节） */
  size: number;
  /** MIME 类型 */
  type: string;
}

/**
 * 删除成功响应
 */
export interface DeleteResponse {
  /** 成功消息 */
  message: string;
}

// ============================================================================
// 错误类型
// ============================================================================

/**
 * 错误代码
 */
export const ERROR_CODES = {
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  INVALID_FILE_CONTENT: "INVALID_FILE_CONTENT",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * API 错误响应
 */
export interface ApiError {
  /** 错误代码 */
  error: ErrorCode | string;
  /** 错误消息 */
  message: string;
  /** 详细信息 */
  details?: unknown;
}

/**
 * 上传错误类
 */
export class UploadError extends Error {
  code: ErrorCode | string;
  details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "UploadError";
    this.code = error.error;
    this.details = error.details;
  }
}

// ============================================================================
// 错误消息映射
// ============================================================================

/**
 * 将 API 错误代码转换为用户友好的中文消息
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  FILE_TOO_LARGE: "文件大小超过 10MB 限制",
  INVALID_FILE_TYPE: "不支持的文件类型，请上传图片或文档",
  INVALID_FILE_CONTENT: "文件内容验证失败",
  UPLOAD_FAILED: "上传失败，请稍后重试",
  UNAUTHORIZED: "请先登录",
  FORBIDDEN: "您没有权限执行此操作",
  NOT_FOUND: "文件不存在",
  RATE_LIMIT_EXCEEDED: "上传过于频繁，请稍后再试",
};

/**
 * 获取用户友好的错误消息
 */
export function getErrorMessage(error: ApiError | UploadError | Error | unknown): string {
  if (error instanceof UploadError) {
    return ERROR_MESSAGES[error.code as ErrorCode] || error.message;
  }

  if (typeof error === "object" && error !== null && "error" in error) {
    const apiError = error as ApiError;
    return ERROR_MESSAGES[apiError.error as ErrorCode] || apiError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "发生未知错误";
}

// ============================================================================
// 文件验证类型
// ============================================================================

/**
 * 文件验证结果
 */
export interface FileValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误消息（无效时） */
  error?: string;
}

/**
 * 文件验证配置
 */
export interface FileValidationConfig {
  /** 最大文件大小（字节） */
  maxSize?: number;
  /** 允许的文件扩展名 */
  allowedExtensions?: string[];
}
