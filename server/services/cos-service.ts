/**
 * 腾讯云 COS (Cloud Object Storage) 服务
 *
 * 提供文件上传、删除、签名 URL 生成等功能
 */

import COS from 'cos-nodejs-sdk-v5';

// ============================================================================
// 配置和初始化
// ============================================================================

const cosConfig = {
  SecretId: process.env.COS_SECRET_ID || '',
  SecretKey: process.env.COS_SECRET_KEY || '',
  Bucket: process.env.COS_BUCKET || '',
  Region: process.env.COS_REGION || 'ap-guangzhou',
};

// 验证配置
if (!cosConfig.SecretId || !cosConfig.SecretKey || !cosConfig.Bucket) {
  console.warn('⚠️  COS 配置不完整，文件上传功能可能无法正常工作');
  console.warn('请检查环境变量: COS_SECRET_ID, COS_SECRET_KEY, COS_BUCKET');
}

// 初始化 COS 实例
const cos = new COS({
  SecretId: cosConfig.SecretId,
  SecretKey: cosConfig.SecretKey,
});

// ============================================================================
// 文件类型验证
// ============================================================================

/**
 * 允许的文件类型白名单
 */
const ALLOWED_FILE_TYPES = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  document: ['pdf', 'doc', 'docx', 'txt', 'md'],
};

/**
 * 所有允许的文件扩展名
 */
const ALLOWED_EXTENSIONS = [
  ...ALLOWED_FILE_TYPES.image,
  ...ALLOWED_FILE_TYPES.document,
];

/**
 * 最大文件大小（5MB）
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB in bytes

/**
 * 文件魔数（file signature）用于验证真实文件类型
 */
const FILE_MAGIC_NUMBERS: Record<string, RegExp> = {
  'jpg': /^\xFF\xD8\xFF/,
  'jpeg': /^\xFF\xD8\xFF/,
  'png': /^\x89\x50\x4E\x47/,
  'gif': /^GIF8[79]a/,
  'webp': /^RIFF....WEBP/,
  'pdf': /^%PDF/,
  'zip': /^PK\x03\x04/, // docx 文件实际上是 zip 格式
};

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 生成唯一的文件键
 * 格式: YYYY/MM/timestamp-random.ext
 *
 * @param filename - 原始文件名
 * @returns COS 对象键
 */
export function generateFileKey(filename: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = now.getTime();
  const random = Math.random().toString(36).substring(2, 8);

  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return `${year}/${month}/${timestamp}-${random}.${ext}`;
}

/**
 * 获取文件扩展名
 *
 * @param filename - 文件名
 * @returns 文件扩展名（小写）
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * 验证文件类型（通过扩展名）
 *
 * @param filename - 文件名
 * @returns 是否为允许的文件类型
 */
export function validateFileType(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * 验证文件大小
 *
 * @param size - 文件大小（字节）
 * @returns 是否在允许的大小范围内
 */
export function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

/**
 * 通过文件魔数验证真实文件类型
 *
 * @param buffer - 文件缓冲区
 * @param extension - 文件扩展名
 * @returns 文件魔数是否匹配
 */
export function validateFileMagicNumber(buffer: Buffer, extension: string): boolean {
  // 某些文件类型没有魔数验证，直接返回 true
  if (!(extension in FILE_MAGIC_NUMBERS)) {
    return true;
  }

  const magicNumber = FILE_MAGIC_NUMBERS[extension];
  return magicNumber.test(buffer.toString('binary').substring(0, 12));
}

/**
 * 获取文件的 MIME 类型
 *
 * @param filename - 文件名
 * @returns MIME 类型
 */
export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    md: 'text/markdown',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * 生成公开访问 URL
 *
 * @param key - COS 对象键
 * @returns 公开 URL
 */
export function getPublicUrl(key: string): string {
  const domain = `${cosConfig.Bucket}.cos.${cosConfig.Region}.myqcloud.com`;
  return `https://${domain}/${key}`;
}

// ============================================================================
// COS 操作函数
// ============================================================================

/**
 * 上传文件到 COS
 *
 * @param buffer - 文件缓冲区
 * @param filename - 原始文件名
 * @returns 上传结果（包含 URL 和 key）
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string
): Promise<{
  url: string;
  key: string;
}> {
  // 生成文件键
  const key = generateFileKey(filename);

  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Key: key,
        Body: buffer,
      },
      (err, data) => {
        if (err) {
          console.error('COS 上传失败:', err);
          reject(new Error('文件上传失败，请稍后重试'));
          return;
        }

        const url = getPublicUrl(key);
        console.log('✓ 文件上传成功:', key);
        resolve({ url, key });
      }
    );
  });
}

/**
 * 从 COS 删除文件
 *
 * @param key - COS 对象键
 * @returns 是否成功删除
 */
export async function deleteFile(key: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    cos.deleteObject(
      {
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Key: key,
      },
      (err, data) => {
        if (err) {
          console.error('COS 删除失败:', err);
          reject(new Error('文件删除失败'));
          return;
        }

        console.log('✓ 文件删除成功:', key);
        resolve(true);
      }
    );
  });
}

/**
 * 生成签名 URL（用于私有文件访问）
 *
 * @param key - COS 对象键
 * @param expiresIn - 过期时间（秒），默认 1 小时
 * @returns 签名 URL
 */
export async function getSignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  return new Promise((resolve, reject) => {
    cos.getObjectUrl(
      {
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Key: key,
        Sign: true,
        Expires: expiresIn,
      },
      (err, data) => {
        if (err) {
          console.error('生成签名 URL 失败:', err);
          reject(new Error('生成签名 URL 失败'));
          return;
        }

        resolve(data.Url);
      }
    );
  });
}

/**
 * 检查文件是否存在于 COS
 *
 * @param key - COS 对象键
 * @returns 文件是否存在
 */
export async function fileExists(key: string): Promise<boolean> {
  return new Promise((resolve) => {
    cos.headObject(
      {
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Key: key,
      },
      (err, data) => {
        if (err) {
          resolve(false);
          return;
        }
        resolve(true);
      }
    );
  });
}

// ============================================================================
// 导出配置和常量
// ============================================================================

export const cosServiceConfig = {
  maxSize: MAX_FILE_SIZE,
  allowedExtensions: ALLOWED_EXTENSIONS,
  allowedFileTypes: ALLOWED_FILE_TYPES,
};

export default cos;
