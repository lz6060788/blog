import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const SALT_LENGTH = 16
const TAG_LENGTH = 16

/**
 * 从环境变量获取加密密钥
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }

  // 如果是十六进制字符串，转换为 Buffer
  const keyBuffer = Buffer.from(key, 'hex')
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(
      `ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (64 hex characters), got ${keyBuffer.length} bytes`
    )
  }

  return keyBuffer
}

/**
 * 加密文本
 * @param text 要加密的文本
 * @returns 加密后的文本（格式：salt:iv:tag:encrypted）
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey()
  const salt = crypto.randomBytes(SALT_LENGTH)
  const iv = crypto.randomBytes(IV_LENGTH)

  // 使用 PBKDF2 派生密钥
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, 'sha256')

  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const tag = cipher.getAuthTag()

  // 格式：salt:iv:tag:encrypted
  return [
    salt.toString('hex'),
    iv.toString('hex'),
    tag.toString('hex'),
    encrypted,
  ].join(':')
}

/**
 * 解密文本
 * @param encryptedText 加密的文本（格式：salt:iv:tag:encrypted）
 * @returns 解密后的原始文本
 */
export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey()

  const parts = encryptedText.split(':')
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted text format')
  }

  const [saltHex, ivHex, tagHex, encrypted] = parts
  const salt = Buffer.from(saltHex, 'hex')
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')

  // 使用 PBKDF2 派生密钥
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, 'sha256')

  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * 脱敏 API Key
 * @param apiKey 原始 API Key
 * @returns 脱敏后的 API Key（只显示前 4 个字符）
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 4) {
    return '****'
  }
  return `${apiKey.slice(0, 4)}****`
}

/**
 * 验证 API Key 格式（基本验证）
 * @param apiKey API Key
 * @param provider 提供商
 * @returns 是否有效
 */
export function validateApiKeyFormat(apiKey: string, provider: string): boolean {
  if (!apiKey || apiKey.length < 20) {
    return false
  }

  // 不同提供商的前缀验证
  switch (provider) {
    case 'deepseek':
      return apiKey.startsWith('sk-')
    case 'openai':
      return apiKey.startsWith('sk-')
    case 'moonshot':
      return apiKey.startsWith('sk-')
    case 'zhipu':
    case 'qwen':
    case 'baichuan':
      // 这些提供商的格式可能不同，不做严格前缀验证
      return apiKey.length >= 32
    default:
      return true
  }
}
