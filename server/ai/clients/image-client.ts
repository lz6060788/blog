/**
 * AI 图像生成客户端
 * 支持 OpenAI DALL-E 图像生成
 */

import OpenAI from 'openai'
import { AIProvider, ImageGenerationOptions } from '../types'

/**
 * 图像生成客户端类
 */
export class ImageGenerationClient {
  private client: OpenAI
  private provider: AIProvider
  private model: string

  constructor(options: {
    provider: AIProvider
    model: string
    apiKey: string
    baseUrl?: string
  }) {
    this.provider = options.provider
    this.model = options.model

    const clientConfig: OpenAI.ClientOptions = {
      apiKey: options.apiKey,
    }

    // 如果有自定义 baseUrl，使用它（某些兼容 API 需要）
    if (options.baseUrl) {
      clientConfig.baseURL = options.baseUrl
    }

    this.client = new OpenAI(clientConfig)
  }

  /**
   * 生成图像
   * @param prompt 图像生成提示词
   * @param options 图像生成选项
   * @returns 图像 URL
   */
  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<{ url: string; revisedPrompt?: string }> {
    const { size = '1024x1024', quality = 'standard', style = 'vivid', format = 'url' } = options

    try {
      // 根据模型选择生成方法
      if (this.model === 'dall-e-3' || this.model === 'dall-e-2') {
        return await this.generateDALL_E(prompt, { size, quality, style, format })
      }

      // 其他模型的图像生成可以在这里添加
      throw new Error(`Unsupported image generation model: ${this.model}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Image generation failed: ${errorMessage}`)
    }
  }

  /**
   * 使用 DALL-E 生成图像
   */
  private async generateDALL_E(
    prompt: string,
    options: {
      size: string
      quality: string
      style: string
      format: string
    }
  ): Promise<{ url: string; revisedPrompt?: string }> {
    const params: OpenAI.ImageGenerateParams = {
      model: this.model as 'dall-e-2' | 'dall-e-3',
      prompt,
      n: 1,
      size: options.size as OpenAI.ImageSize,
    }

    // DALL-E 3 支持额外的参数
    if (this.model === 'dall-e-3') {
      // @ts-ignore - quality 是 DALL-E 3 特有的参数
      params.quality = options.quality as 'standard' | 'hd'
      // @ts-ignore - style 是 DALL-E 3 特有的参数
      params.style = options.style as 'vivid' | 'natural'
    }

    const response = await this.client.images.generate(params)
    const data = response.data[0]

    if (data.url) {
      return {
        url: data.url,
        revisedPrompt: this.model === 'dall-e-3' ? (data as any).revised_prompt : undefined,
      }
    }

    // 如果返回的是 base64 数据
    if (data.b64_json) {
      // 将 base64 转换为 data URL
      const base64Data = data.b64_json
      const mimeType = this.getImageMimeType()
      return {
        url: `data:${mimeType};base64,${base64Data}`,
      }
    }

    throw new Error('No image data returned from API')
  }

  /**
   * 根据模型获取图像 MIME 类型
   */
  private getImageMimeType(): string {
    return 'image/png'
  }

  /**
   * 获取提供商信息
   */
  getProvider(): AIProvider {
    return this.provider
  }

  /**
   * 获取模型名称
   */
  getModel(): string {
    return this.model
  }
}

/**
 * 创建图像生成客户端的工厂函数
 * @param options 客户端配置选项
 * @returns 图像生成客户端实例
 */
export function createImageClient(options: {
  provider: AIProvider
  model: string
  apiKey: string
  baseUrl?: string
}): ImageGenerationClient {
  return new ImageGenerationClient(options)
}
