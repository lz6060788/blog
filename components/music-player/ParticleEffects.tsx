'use client'

import { useEffect, useRef } from 'react'
import { useMusicStore } from '@/stores/music-store'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

interface ParticleEffectsProps {
  canvasId: string
  particleCount?: number
  particleColor?: string
  opacity?: number
}

export function ParticleEffects({
  canvasId,
  particleCount = 50,
  particleColor = '#ffffff',
  opacity = 0.6
}: ParticleEffectsProps) {
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const lastSpawnTimeRef = useRef(0)

  const isPlaying = useMusicStore((state) => state.isPlaying)

  useEffect(() => {
    const initTimer = requestAnimationFrame(() => {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement
      if (!canvas) {
        console.error('[ParticleEffects] Canvas not found:', canvasId)
        return
      }

      const rect = canvas.getBoundingClientRect()
      console.log('[ParticleEffects] Canvas diagnostics:', {
        id: canvasId,
        internalSize: { width: canvas.width, height: canvas.height },
        cssSize: { width: rect.width, height: rect.height },
      })

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('[ParticleEffects] Could not get canvas context')
        return
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const recordRadius = canvas.width / 4 // 50px from center for 200px canvas

      // Spawn a new particle from the center
      const spawnParticle = () => {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.3 + Math.random() * 0.5 // Speed for outward movement

        // Start from near the edge of the record
        const startRadius = recordRadius * 0.8

        particlesRef.current.push({
          x: centerX + Math.cos(angle) * startRadius,
          y: centerY + Math.sin(angle) * startRadius,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 100 + Math.random() * 100, // Particle lifespan
          size: 1.5 + Math.random() * 1 // 1.5-2.5px particle size
        })
      }

      let frameCount = 0

      const animate = (timestamp: number) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Spawn new particles based on music intensity
        const spawnRate = isPlaying ? 2 : 0 // Spawn 2 particles per frame when playing
        if (isPlaying && timestamp - lastSpawnTimeRef.current > (1000 / 60)) {
          for (let i = 0; i < spawnRate; i++) {
            if (particlesRef.current.length < particleCount) {
              spawnParticle()
            }
          }
          lastSpawnTimeRef.current = timestamp
        }

        // Update and draw particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const particle = particlesRef.current[i]

          // Update position
          particle.x += particle.vx
          particle.y += particle.vy
          particle.life++

          // Calculate opacity based on life
          const lifeProgress = particle.life / particle.maxLife
          const fadeOut = 1 - lifeProgress
          const currentOpacity = fadeOut * opacity * 0.3

          // Remove dead particles
          if (lifeProgress >= 1 || particle.x < 0 || particle.x > canvas.width ||
              particle.y < 0 || particle.y > canvas.height) {
            particlesRef.current.splice(i, 1)
            continue
          }

          // Draw particle (small 2px dots)
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = particleColor
          ctx.globalAlpha = Math.max(0, currentOpacity)
          ctx.fill()
          ctx.globalAlpha = 1
        }

        // Debug logging for first few frames
        if (frameCount < 10 && frameCount % 3 === 0) {
          console.log(`[ParticleEffects] Frame ${frameCount}: ${particlesRef.current.length} particles, isPlaying: ${isPlaying}`)
        }
        frameCount++

        animationRef.current = requestAnimationFrame(animate)
      }

      animate(0)
    })

    return () => {
      cancelAnimationFrame(initTimer)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [canvasId, isPlaying, particleCount, particleColor, opacity])

  return null
}
