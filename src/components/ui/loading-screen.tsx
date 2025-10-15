import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingScreenProps {
  className?: string
  message?: string
  fullScreen?: boolean
}

export function LoadingScreen({ 
  className,
  message = 'Loading...',
  fullScreen = true
}: LoadingScreenProps) {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center',
        fullScreen && 'fixed inset-0 bg-background z-50',
        !fullScreen && 'w-full h-full min-h-[200px]',
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}