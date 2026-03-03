/**
 * AI 图像生成客户端
 * 支持多种图像生成服务提供商
 */

import OpenAI, { type ClientOptions } from 'openai'
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
      const clientConfig: ClientOptions = {
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

      if (this.provider === AIProvider.QWEN) {
        if (this.model.startsWith('wanx')) {
          return await this.generateWanX(prompt, { size })
        }
        if (this.model.startsWith('qwen-image')) {
          return await this.generateQwenImage(prompt, { size })
        }
      }

      if (this.provider === AIProvider.GEMINI) {
        if (this.model.startsWith('imagen')) {
          return await this.generateImagen(prompt, { size })
        }
        if (this.model.startsWith('gemini-3')) {
          return await this.generateGemini3(prompt, { size })
        }
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
      size: size as '256x256' | '512x512' | '1024x1024' | '1536x1024' | '1024x1536',
    }

    // DALL-E 3 支持额外的参数
    if (this.model === 'dall-e-3') {
      // @ts-ignore - quality 是 DALL-E 3 特有的参数
      params.quality = quality as 'standard' | 'hd'
      // @ts-ignore - style 是 DALL-E 3 特有的参数
      params.style = style as 'vivid' | 'natural'
    }

    const response = await this.client.images.generate(params)
    const data = response.data?.[0]

    if (!data) {
      throw new Error('No image data returned from API')
    }

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
    // 通义万相 API 端点 (任务提交)
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
      },
      parameters: {
        size: `${width}*${height}`,
        n: 1,
        seed: Math.floor(Math.random() * 1000000),
      },
    }

    // 1. 提交生成任务
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-DashScope-Async': 'enable', // 显式启用异步
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`WanX API error (submission): ${response.status} ${errorText}`)
    }

    const data = await response.json()
    
    // 获取任务 ID
    const taskId = data.output?.task_id
    if (!taskId) {
      throw new Error('No task_id returned from WanX API')
    }

    // 2. 轮询任务状态
    const maxAttempts = 30 // 最大尝试次数 (30 * 2s = 60s)
    const delay = 2000 // 2秒

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, delay))

      const taskUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`
      const taskResponse = await fetch(taskUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!taskResponse.ok) {
        const errorText = await taskResponse.text()
        throw new Error(`WanX API error (polling): ${taskResponse.status} ${errorText}`)
      }

      const taskData = await taskResponse.json()
      const taskStatus = taskData.output?.task_status

      if (taskStatus === 'SUCCEEDED') {
        if (taskData.output.results && taskData.output.results.length > 0) {
          const imageUrl = taskData.output.results[0].url
          if (imageUrl) {
            return { url: imageUrl }
          }
        }
        throw new Error('Task succeeded but no image URL found')
      } else if (taskStatus === 'FAILED') {
        throw new Error(`WanX task failed: ${taskData.output?.message || 'Unknown error'}`)
      } else if (taskStatus === 'PENDING' || taskStatus === 'RUNNING') {
        // 继续轮询
        continue
      } else {
        throw new Error(`Unknown task status: ${taskStatus}`)
      }
    }

    throw new Error('WanX task timed out')
  }

  /**
   * 使用通义千问 (Qwen-Image) 生成图像
   */
  private async generateQwenImage(
    prompt: string,
    options: { size: string }
  ): Promise<{ url: string }> {
    // Qwen-Image API 端点 (多模态生成)
    const apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'

    // 解析尺寸，Qwen 使用 "1024*1024" 格式
    let size = options.size.replace('x', '*')
    if (!size.includes('*')) {
      size = '1024*1024' // Default
    }

    const requestBody = {
      model: this.model,
      input: {
        messages: [
          {
            role: 'user',
            content: [
              { text: prompt }
            ]
          }
        ]
      },
      parameters: {
        size: size,
        n: 1,
        prompt_extend: true,
        watermark: false,
        negative_prompt: "低分辨率，低画质，肢体畸形，手指畸形，画面过饱和，蜡像感，人脸无细节，过度光滑，画面具有AI感。构图混乱。文字模糊，扭曲。",
      },
    }

    console.log('[ImageGenerationClient.generateQwenImage] Request body:', JSON.stringify(requestBody, null, 2))

    // 1. 提交生成任务
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        // 'X-DashScope-Async': 'enable', // 暂时禁用异步以匹配 curl
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Qwen Image API error (submission): ${response.status} ${errorText}`)
    }

    const data = await response.json()
    
    // 获取任务 ID
    const taskId = data.output?.task_id
    if (!taskId) {
       // 检查是否直接返回结果
       if (data.output?.choices && data.output.choices[0]?.message?.content) {
         const content = data.output.choices[0].message.content
         const imageItem = Array.isArray(content) ? content.find((item: any) => item.image) : null
         if (imageItem && imageItem.image) {
           return { url: imageItem.image }
         }
       }
       throw new Error('No task_id or image returned from Qwen API')
    }

    // 2. 轮询任务状态
    const maxAttempts = 30 // 最大尝试次数 (30 * 2s = 60s)
    const delay = 2000 // 2秒

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, delay))

      const taskUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`
      const taskResponse = await fetch(taskUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!taskResponse.ok) {
        const errorText = await taskResponse.text()
        throw new Error(`Qwen Image API error (polling): ${taskResponse.status} ${errorText}`)
      }

      const taskData = await taskResponse.json()
      const taskStatus = taskData.output?.task_status

      if (taskStatus === 'SUCCEEDED') {
        // 解析结果
        const choices = taskData.output?.choices
        if (choices && choices.length > 0) {
           const message = choices[0].message
           if (message && message.content) {
             const imageItem = Array.isArray(message.content) 
               ? message.content.find((item: any) => item.image) 
               : (message.content.image ? message.content : null)
               
             if (imageItem && imageItem.image) {
               return { url: imageItem.image }
             }
           }
        }
        
        throw new Error('Task succeeded but no image URL found in Qwen response')
      } else if (taskStatus === 'FAILED') {
        throw new Error(`Qwen Image generation failed: ${taskData.output?.message || 'Unknown error'}`)
      } else if (taskStatus === 'PENDING' || taskStatus === 'RUNNING') {
        continue
      }
    }
    
    throw new Error('Qwen Image generation timed out')
  }

  /**
   * 使用 Gemini Imagen 生成图像
   */
  private async generateImagen(
    prompt: string,
    options: { size: string }
  ): Promise<{ url: string }> {
    // Gemini Imagen API 端点
    // 修正: 使用正确的 predict 端点和 payload 格式
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${this.model}:predict?key=${this.apiKey}`

    // 解析尺寸
    let aspectRatio = '1:1'
    if (options.size === '1792x1024') {
      aspectRatio = '16:9'
    } else if (options.size === '1024x1792') {
      aspectRatio = '9:16'
    } else if (options.size === '1200x675') {
      aspectRatio = '16:9'
    }

    // Imagen (Vertex AI / AI Studio) payload 格式
    const requestBody = {
      instances: [
        {
          prompt: prompt
        }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: aspectRatio,
      }
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

    // Gemini Imagen 返回格式 (predictions)
    if (data.predictions && data.predictions.length > 0) {
      const prediction = data.predictions[0]
      
      // 检查 bytesBase64Encoded
      if (prediction.bytesBase64Encoded) {
        const mimeType = prediction.mimeType || 'image/png'
        return { url: `data:${mimeType};base64,${prediction.bytesBase64Encoded}` }
      }
      
      // 某些版本可能直接返回 struct
      if (prediction.structValue && prediction.structValue.fields && prediction.structValue.fields.bytesBase64Encoded) {
         const base64Data = prediction.structValue.fields.bytesBase64Encoded.stringValue
         const mimeType = 'image/png' // 默认为 png
         return { url: `data:${mimeType};base64,${base64Data}` }
      }
    }

    throw new Error('No image data returned from Imagen API')
  }

  /**
   * 使用 Gemini 3 生成图像
   */
  private async generateGemini3(
    prompt: string,
    options: { size: string }
  ): Promise<{ url: string }> {
    // Gemini 3 API (generateContent)
    const baseUrl = this.baseUrl || 'https://generativelanguage.googleapis.com'
    const url = `${baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseModalities: ["IMAGE"]
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini 3 API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0].content?.parts
      if (parts) {
        const imagePart = parts.find((p: any) => p.inlineData)
        if (imagePart) {
          const mimeType = imagePart.inlineData.mimeType || 'image/png'
          return { url: `data:${mimeType};base64,${imagePart.inlineData.data}` }
        }
      }
    }

    throw new Error('No image data found in Gemini response')
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
