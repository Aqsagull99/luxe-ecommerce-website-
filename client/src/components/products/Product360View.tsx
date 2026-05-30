import { useState, useRef, useCallback } from 'react'
import { RotateCw } from 'lucide-react'

interface Product360ViewProps {
  images: string[]
  alt?: string
}

export function Product360View({ images, alt = '360° View' }: Product360ViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const lastX = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    lastX.current = e.clientX
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || images.length === 0) return
    const dx = e.clientX - lastX.current
    if (Math.abs(dx) > 10) {
      const dir = dx > 0 ? -1 : 1
      setCurrentIndex((prev) => (prev + dir + images.length) % images.length)
      lastX.current = e.clientX
    }
  }, [images.length])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false
  }, [])

  if (images.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="relative aspect-square overflow-hidden rounded-sm bg-muted cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={images[currentIndex]}
        alt={`${alt} - View ${currentIndex + 1}`}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full text-xs text-muted-foreground">
        <RotateCw className="size-3" />
        <span>Drag to rotate 360°</span>
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-3/4 max-w-48">
        <input
          type="range"
          min={0}
          max={images.length - 1}
          value={currentIndex}
          onChange={(e) => setCurrentIndex(Number(e.target.value))}
          className="w-full accent-primary"
          aria-label="360° rotation slider"
        />
      </div>
    </div>
  )
}
