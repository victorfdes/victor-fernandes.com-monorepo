"use client"

import React, { useEffect, useRef } from "react"

export default function Flashlight({ children }: Readonly<{ children: React.ReactNode }>) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      // Get mouse position relative to the container
      const { left, top } = container.getBoundingClientRect()
      const x = e.clientX - left
      const y = e.clientY - top

      // Update CSS variables directly on the DOM element
      container.style.setProperty("--x", `${x}px`)
      container.style.setProperty("--y", `${y}px`)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        // Define the "flashlight" mask using a radial gradient
        backgroundImage: `radial-gradient(
          circle 250px at var(--x, 50%) var(--y, 50%), 
          rgba(255, 255, 255, 0.03), 
          transparent 100%
        )`,
      }}
    >
      {/* Your actual content goes here */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
