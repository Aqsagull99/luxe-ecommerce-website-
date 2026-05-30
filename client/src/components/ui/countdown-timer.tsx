import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  targetDate: string | Date
  label?: string
  className?: string
  onEnd?: () => void
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-background border border-border rounded-sm px-3 py-2 min-w-[3rem] text-center">
        <span className="text-xl font-bold tabular-nums">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{label}</span>
    </div>
  )
}

export function CountdownTimer({ targetDate, label, className, onEnd }: CountdownTimerProps) {
  const calcRemaining = () => {
    const diff = new Date(targetDate).getTime() - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      total: diff,
    }
  }

  const [remaining, setRemaining] = useState(calcRemaining)

  useEffect(() => {
    const timer = setInterval(() => {
      const r = calcRemaining()
      setRemaining(r)
      if (r.total <= 0) {
        clearInterval(timer)
        onEnd?.()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (remaining.total <= 0) return null

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {label && <span className="text-xs font-medium text-destructive uppercase tracking-wider">{label}</span>}
      <div className="flex items-center gap-2">
        {remaining.days > 0 && <TimeUnit value={remaining.days} label="Days" />}
        {remaining.days > 0 && <span className="text-2xl font-bold text-muted-foreground">:</span>}
        <TimeUnit value={remaining.hours} label="Hrs" />
        <span className="text-2xl font-bold text-muted-foreground">:</span>
        <TimeUnit value={remaining.minutes} label="Min" />
        <span className="text-2xl font-bold text-muted-foreground">:</span>
        <TimeUnit value={remaining.seconds} label="Sec" />
      </div>
    </div>
  )
}
