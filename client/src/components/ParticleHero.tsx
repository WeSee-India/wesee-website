import React, { useEffect, useRef } from "react"

interface Particle {
  originX: number
  originY: number
  x: number
  y: number
  vx: number
  vy: number
}

export default function ParticleHero({
  className = "",
  style = {},
}: {
  className?: string
  style?: React.CSSProperties
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const rafRef = useRef<number | null>(null)
  const sizeRef = useRef({ w: 0, h: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    const color = "#c9a84c"

    const resize = () => {
      const prevW = sizeRef.current.w || window.innerWidth
      const prevH = sizeRef.current.h || window.innerHeight
      const w = window.innerWidth
      const h = window.innerHeight

      sizeRef.current = { w, h }

      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Keep particle layout consistent across resizes by scaling positions.
      const sx = prevW ? w / prevW : 1
      const sy = prevH ? h / prevH : 1
      if (particles.current.length > 0 && (sx !== 1 || sy !== 1)) {
        particles.current = particles.current.map((p) => ({
          ...p,
          x: p.x * sx,
          y: p.y * sy,
          originX: p.originX * sx,
          originY: p.originY * sy,
        }))
      }
    }

    resize()
    window.addEventListener("resize", resize)

    // 🔥 MORE PARTICLES
    const COUNT = 420

    const restoreStrength = 0.02

    // Motion tuning
    const damping = 0.9
    const jitter = 0.03

    particles.current = Array.from({ length: COUNT }).map(() => ({
      originX: Math.random() * window.innerWidth,
      originY: Math.random() * window.innerHeight,
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
    }))
      .map((p) => ({ ...p, x: p.originX, y: p.originY }))

    const animate = () => {
      const w = sizeRef.current.w || window.innerWidth
      const h = sizeRef.current.h || window.innerHeight
      ctx.clearRect(0, 0, w, h)

      // Glow
      ctx.shadowBlur = 12
      ctx.shadowColor = color

      particles.current.forEach((p) => {
        // 1) Restore force toward origin (default behavior)
        const rdx = p.originX - p.x
        const rdy = p.originY - p.y
        p.vx += rdx * restoreStrength
        p.vy += rdy * restoreStrength

        // 2) Organic drift (small randomness) + damping
        p.vx += (Math.random() - 0.5) * jitter
        p.vy += (Math.random() - 0.5) * jitter
        p.vx *= damping
        p.vy *= damping

        // 3) Integrate position
        p.x += p.vx
        p.y += p.vy

        // Keep particles on-screen (no wrap; spring returns to origin)
        if (p.x < -20) p.x = -20
        if (p.x > w + 20) p.x = w + 20
        if (p.y < -20) p.y = -20
        if (p.y > h + 20) p.y = h + 20

        // 🎨 draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...style,
      }}
    />
  )
}