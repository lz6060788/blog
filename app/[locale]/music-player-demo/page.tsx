'use client'

import { useState, useEffect, useRef } from 'react'
import { MusicPlayer } from '@/components/music-player/MusicPlayer'

export default function MusicPlayerDemoPage() {
  const [glowColor, setGlowColor] = useState('#ffffff')
  const [glowIntensity, setGlowIntensity] = useState(0.6)
  const [fps, setFps] = useState(0)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(Date.now())

  // FPS counter for performance monitoring
  useEffect(() => {
    const updateFps = () => {
      frameCountRef.current++
      const currentTime = Date.now()
      const elapsed = currentTime - lastTimeRef.current

      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed))
        frameCountRef.current = 0
        lastTimeRef.current = currentTime
      }

      requestAnimationFrame(updateFps)
    }

    const animationId = requestAnimationFrame(updateFps)
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            音乐播放器演示
          </h1>
          <p className="text-lg text-gray-300">
            音乐播放器 UI 原型测试页面
          </p>
          <p className="text-sm text-gray-400 mt-2">
            点击右下角的播放器图标展开完整界面
          </p>
        </div>

        {/* Glow Effect Control Panel */}
        <div className="max-w-md mx-auto mb-12 p-6 rounded-2xl" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 className="text-xl font-semibold text-white mb-4">光晕参数调节</h2>

          <div className="space-y-4">
            {/* Color Picker */}
            <div>
              <label className="block text-sm text-white/80 mb-2">
                光晕颜色: {glowColor}
              </label>
              <div className="flex gap-2">
                {['#ffffff', '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setGlowColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                      glowColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={glowColor}
                  onChange={(e) => setGlowColor(e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
              </div>
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-sm text-white/80 mb-2">
                光晕强度: {glowIntensity.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={glowIntensity}
                onChange={(e) => setGlowIntensity(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <p className="text-xs text-white/60 mt-4">
            注意：光晕效果需要在展开播放器并播放音乐后才能看到
          </p>
        </div>

        {/* Music Player Component */}
        <MusicPlayer
          glowColor={glowColor}
          glowIntensity={glowIntensity}
        />

        {/* Performance Monitor */}
        <div className="fixed top-4 right-4 px-4 py-2 rounded-lg" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.18)'
        }}>
          <p className="text-white text-sm font-mono">
            FPS: <span className={fps >= 50 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'}>{fps}</span>
          </p>
          <p className="text-white/60 text-xs mt-1">Performance Monitor</p>
        </div>

        {/* Demo Info */}
        <div className="mt-24 max-w-2xl mx-auto text-white">
          <h2 className="text-2xl font-semibold mb-4">功能演示</h2>
          <ul className="space-y-2 text-gray-300">
            <li>✓ 拟态玻璃背景效果</li>
            <li>✓ 播放器收起/展开切换</li>
            <li>✓ 唱片旋转动画</li>
            <li>✓ 唱片边缘呼吸光晕</li>
            <li>✓ 歌词显示和滚动</li>
            <li>✓ 播放列表管理</li>
            <li>✓ 进度条和音量控制</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
