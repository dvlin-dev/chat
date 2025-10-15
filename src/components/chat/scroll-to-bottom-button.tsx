import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScrollToBottomButtonProps {
  visible: boolean
  onClick: () => void
  className?: string
}

export function ScrollToBottomButton({ visible, onClick, className }: ScrollToBottomButtonProps) {
  if (!visible) return null

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className={cn(
        'rounded-full shadow-lg transition-all duration-200',
        'hover:scale-110 active:scale-95',
        className
      )}
    >
      <ChevronDown className="h-4 w-4" />
    </Button>
  )
}
