/**
 * AI 图像生成客户端
 * 支持多种图像生成服务提供商
 */

import OpenAI from 'openai'
import { AIProvider, ImageGenerationOptions } from '../types'

/**
 * 图像生成客户端类
 */
export class ImageGenerationClient {
  private client: OpenAI | null
  private provider: AIProvider
  private model: string
  private apiKey: string
  private baseUrl?: string

  constructor(options: {
    provider: AIProvider
    model: string
    apiKey: string
    baseUrl?: string
  }) {
    this.provider = options.provider
    this.model = options.model
    this.apiKey = options.apiKey
    this.baseUrl = options.baseUrl

    // 只为支持的提供商初始化 OpenAI 客户端
    // 通义万相等使用兼容 API 的提供商
    if (this.provider === AIProvider.OPENAI || this.provider === AIProvider.QWEN) {
      const clientConfig: OpenAI.ClientOptions = {
        apiKey: options.apiKey,
      }

      // 如果有自定义 baseUrl，使用它（某些兼容 API 需要）
      if (options.baseUrl) {
        clientConfig.baseURL = options.baseUrl
      }

      this.client = new OpenAI(clientConfig)
    } else {
      this.client = null
    }
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
    const { size = '1024x1024' } = options

    try {
      // 根据提供商选择生成方法
      if (this.provider === AIProvider.OPENAI && (this.model === 'dall-e-3' || this.model === 'dall-e-2')) {
        return await this.generateDALL_E(prompt, options)
      }

      if (this.provider === AIProvider.QWEN && this.model.startsWith('wanx')) {
        return await this.generateWanX(prompt, { size })
      }

      if (this.provider === AIProvider.GEMINI && this.model.startsWith('imagen')) {
        return await this.generateImagen(prompt, { size })
      }

      // 其他模型的图像生成
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
    options: ImageGenerationOptions
  ): Promise<{ url: string; revisedPrompt?: string }> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
    }

    const { size = '1024x1024', quality = 'standard', style = 'vivid' } = options

    const params: OpenAI.ImageGenerateParams = {
      model: this.model as 'dall-e-2' | 'dall-e-3',
      prompt,
      n: 1,
      size: size as OpenAI.ImageSize,
    }

    // DALL-E 3 支持额外的参数
    if (this.model === 'dall-e-3') {
      // @ts-ignore - quality 是 DALL-E 3 特有的参数
      params.quality = quality as 'standard' | 'hd'
      // @ts-ignore - style 是 DALL-E 3 特有的参数
      params.style = style as 'vivid' | 'natural'
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
      const base64Data = data.b64_json
      return {
        url: `data:image/png;base64,${base64Data}`,
      }
    }

    throw new Error('No image data returned from API')
  }

  /**
   * 使用通义万相生成图像
   */
  private async generateWanX(
    prompt: string,
    options: { size: string }
  ): Promise<{ url: string }> {
    // 通义万相 API 端点
    const apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis'

    // 解析尺寸
    let width = 1024
    let height = 1024
    if (options.size === '1792x1024') {
      width = 1792
      height = 1024
    } else if (options.size === '1024x1792') {
      width = 1024
      height = 1792
    } else if (options.size === '1200x675') {
      width = 1200
      height = 675
    }

    const requestBody = {
      model: this.model,
      input: {
        prompt: prompt,
        size: `${width}*${height}`,
        n: 1,
      },
      parameters: {
        seed: Math.floor(Math.random() * 1000000),
      },
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`WanX API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()

    // 通义万相返回格式
    if (data.output && data.output.results && data.output.results.length > 0) {
      const imageUrl = data.output.results[0].url
      if (imageUrl) {
        // 通义万相返回的 URL 可能是临时的，需要处理
        // 直接返回 URL，后续会在 cover service 中下载并上传到 COS
        return { url: imageUrl }
      }
    }

    throw new Error('No image data returned from WanX API')
  }

  /**
   * 使用 Gemini Imagen 生成图像
   */
  private async generateImagen(
    prompt: string,
    options: { size: string }
  ): Promise<{ url: string }> {
    // Gemini Imagen API 端点
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${this.model}:predict?key=${this.apiKey}`

    // 解析尺寸
    let aspectRatio = '1:1'
    if (options.size === '1792x1024' || options.size === '1024x1792') {
      aspectRatio = '16:9'
    } else if (options.size === '1200x675') {
      aspectRatio = '16:9'
    }

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
      // Imagen 特定参数
      aspectRatio: aspectRatio,
      numberOfImages: 1,
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Imagen API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()

    // Gemini Imagen 返回格式
    // 根据 API 文档，返回的是 JSON 格式，包含 base64 编码的图片
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0]
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            // 返回 base64 图片数据
            const base64Data = part.inlineData.data
            const mimeType = part.inlineData.mimeType || 'image/png'
            return { url: `data:${mimeType};base64,${base64Data}` }
          }
        }
      }
    }

    throw new Error('No image data returned from Imagen API')
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
