import { CountdownTimer } from './countdown-timer'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlashSaleBannerProps {
  endDate: string | Date
  title?: string
  description?: string
  className?: string
}

export function FlashSaleBanner({
  endDate,
  title = 'Flash Sale',
  description = 'Limited time offer on premium home decor',
  className,
}: FlashSaleBannerProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-sm bg-gradient-to-r from-destructive via-destructive/90 to-destructive/80 p-6 sm:p-8',
      className
    )}>
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 50%), radial-gradient(circle at 70% 50%, white 0%, transparent 50%)',
          }}
        />
      </div>
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-white/20 flex items-center justify-center">
            <Zap className="size-6 text-white" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-white">{title}</h3>
            <p className="text-white/80 text-sm">{description}</p>
          </div>
        </div>
        <CountdownTimer targetDate={endDate} label="Ends in" className="[&_div>div]:bg-white/20 [&_div>div]:border-white/30 [&_span]:text-white/80" />
      </div>
    </div>
  )
}
