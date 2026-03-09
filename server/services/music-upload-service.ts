/**
 * 音乐上传服务
 *
 * 处理音频文件上传、元数据提取和歌曲记录创建
 */

import { parseBuffer } from 'music-metadata';
import { uploadFile, generateFileKey, getFileExtension } from './cos-service';
import { db } from '@/server/db';
import { songs } from '@/server/db/schema';

// ============================================================================
// 音频文件格式支持
// ============================================================================

/**
 * 支持的音频格式
 */
export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'ogg', 'wav', 'flac', 'm4a', 'aac'];

/**
 * 最大音频文件大小（50MB）
 */
export const MAX_AUDIO_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// ============================================================================
// 接口定义
// ============================================================================

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  duration?: number; // 秒
  bitrate?: number;
  sampleRate?: number;
  format?: string;
}

export interface UploadMusicResult {
  songId: string;
  audioUrl: string;
  metadata: AudioMetadata;
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 验证音频文件格式
 *
 * @param filename - 文件名
 * @returns 是否为支持的音频格式
 */
export function validateAudioFormat(filename: string): boolean {
  const ext = getFileExtension(filename);
  return SUPPORTED_AUDIO_FORMATS.includes(ext);
}

/**
 * 验证音频文件大小
 *
 * @param size - 文件大小（字节）
 * @returns 是否在允许的大小范围内
 */
export function validateAudioSize(size: number): boolean {
  return size > 0 && size <= MAX_AUDIO_FILE_SIZE;
}

/**
 * 提取音频元数据
 *
 * @param buffer - 音频文件缓冲区
 * @returns 音频元数据
 */
export async function extractAudioMetadata(buffer: Buffer): Promise<AudioMetadata> {
  try {
    const metadata = await parseBuffer(buffer);

    console.log('提取的音频元数据:', {
      title: metadata.common.title,
      artist: metadata.common.artist,
      album: metadata.common.album,
      duration: metadata.format.duration,
      format: metadata.format.container,
      bitrate: metadata.format.bitrate,
      sampleRate: metadata.format.sampleRate,
    });

    return {
      title: metadata.common.title || undefined,
      artist: metadata.common.artist || undefined,
      album: metadata.common.album || undefined,
      duration: metadata.format.duration ? Math.round(metadata.format.duration) : undefined,
      bitrate: metadata.format.bitrate,
      sampleRate: metadata.format.sampleRate,
      format: metadata.format.container,
    };
  } catch (error) {
    console.error('提取音频元数据失败:', error);
    // 返回空对象而不是抛出错误，允许上传继续
    return {};
  }
}

/**
 * 上传音乐文件并创建歌曲记录
 *
 * @param buffer - 音频文件缓冲区
 * @param filename - 原始文件名
 * @param options - 额外选项
 * @returns 上传结果
 */
export async function uploadMusic(
  buffer: Buffer,
  filename: string,
  options: {
    title?: string;
    artist?: string;
    album?: string;
    lyrics?: string;
    duration?: number;
  } = {}
): Promise<UploadMusicResult> {
  // 1. 验证音频文件
  if (!validateAudioFormat(filename)) {
    throw new Error(`不支持的音频格式，仅支持: ${SUPPORTED_AUDIO_FORMATS.join(', ')}`);
  }

  if (!validateAudioSize(buffer.length)) {
    throw new Error(`音频文件过大，最大支持 ${MAX_AUDIO_FILE_SIZE / 1024 / 1024}MB`);
  }

  // 2. 提取音频元数据
  const metadata = await extractAudioMetadata(buffer);

  // 3. 上传到COS
  const { url: audioUrl, key } = await uploadFile(buffer, filename);

  // 4. 确定时长（优先使用客户端提供的时长，否则使用元数据中的时长）
  const finalDuration = options.duration || metadata.duration || 0;

  // 5. 创建歌曲记录
  const songId = crypto.randomUUID();

  const songData = {
    id: songId,
    title: options.title || metadata.title || filename,
    artist: options.artist || metadata.artist || '未知艺术家',
    album: options.album || metadata.album || null,
    duration: finalDuration || 0,
    audioUrl,
    lyrics: options.lyrics || null,
    fileSize: buffer.length,
    fileFormat: getFileExtension(filename),
    uploadStatus: 'completed',
    metadata: JSON.stringify({
      bitrate: metadata.bitrate,
      sampleRate: metadata.sampleRate,
      format: metadata.format,
    }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const [newSong] = await db.insert(songs).values(songData).returning();

  return {
    songId: newSong.id,
    audioUrl: newSong.audioUrl,
    metadata: {
      title: newSong.title,
      artist: newSong.artist,
      album: newSong.album || undefined,
      duration: newSong.duration,
      ...metadata,
    },
  };
}

/**
 * 从URL上传音乐
 *
 * @param url - 音频文件URL
 * @param options - 额外选项
 * @returns 上传结果
 */
export async function uploadMusicFromUrl(
  url: string,
  options: {
    title?: string;
    artist?: string;
    album?: string;
    lyrics?: string;
    filename?: string;
  } = {}
): Promise<UploadMusicResult> {
  try {
    // 从URL下载文件
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`下载音频文件失败: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = options.filename || url.split('/').pop() || 'audio.mp3';

    return uploadMusic(buffer, filename, options);
  } catch (error) {
    console.error('从URL上传音乐失败:', error);
    throw new Error('从URL上传音乐失败');
  }
}
