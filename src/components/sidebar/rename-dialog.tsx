import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useCommonTranslation, useChatTranslation } from '@/lib/i18n-setup'

interface RenameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  value: string
  onChange: (value: string) => void
  onConfirm: () => void
  isLoading?: boolean
}

export function RenameDialog({
  open,
  onOpenChange,
  title,
  value,
  onChange,
  onConfirm,
  isLoading = false,
}: RenameDialogProps) {
  const tCommon = useCommonTranslation()
  const tChat = useChatTranslation()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              {tChat('titleLabel')}
            </Label>
            <Input
              id="title"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="col-span-3"
              maxLength={50}
              placeholder={tChat('newTitlePlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading && value.trim()) {
                  onConfirm()
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading || !value.trim()}>
            {isLoading ? tCommon('saving') : tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
