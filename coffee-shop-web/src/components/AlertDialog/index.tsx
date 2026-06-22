'use client'

import type { ReactNode } from 'react'
import { X } from 'lucide-react'

import {
  AlertDialog as ShadCNAlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import { Button } from '@/components/ui/button'

interface AlertDialogProps {
  title: string
  description?: ReactNode
  errorMessage?: string | null
  textButton?: string
  textCancel?: string
  textAction?: string
  open?: boolean
  isLoading?: boolean
  onOpenChange?: (open?: boolean) => void
  onClickAction?: () => void
  onClickCancel?: () => void
  children?: ReactNode
  'data-testid'?: string
}

const AlertDialog = ({
  title,
  description,
  errorMessage,
  textButton = '',
  textCancel = 'Cancel',
  textAction = 'Continue',
  open = false,
  isLoading = false,
  onOpenChange,
  onClickAction,
  onClickCancel,
  children,
  'data-testid': dataTestId,
}: AlertDialogProps) => {
  return (
    <ShadCNAlertDialog open={open} onOpenChange={onOpenChange}>
      {textButton && (
        <AlertDialogTrigger className="p-0">
          <Button
            disabled={isLoading}
            data-testid="btn-confirm"
            variant="ghost"
            className="p-0 h-auto hover:bg-transparent"
          >
            {textButton}
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent
        data-testid={dataTestId}
        className="max-w-md gap-0 overflow-hidden rounded-3xl border-0 p-0 bg-background text-card-foreground shadow-xl ring-1 ring-border/40 sm:max-w-lg"
      >
        <div className="relative px-6 pb-4 pt-8">
          <AlertDialogCancel
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isLoading}
            aria-label="Close dialog"
            data-testid="btn-close"
            onClick={onClickCancel}
            className="absolute top-4 right-4 z-10 size-9 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </AlertDialogCancel>
          <AlertDialogHeader className="place-items-start gap-2 text-left sm:place-items-start sm:pr-10 sm:text-left">
            <AlertDialogTitle className="text-2xl font-bold text-foreground">
              {title}
            </AlertDialogTitle>
            {description && (
              <AlertDialogDescription className="text-left text-sm text-muted-foreground">
                {description}
              </AlertDialogDescription>
            )}
            {errorMessage && (
              <p
                role="alert"
                className="text-left text-sm font-medium text-destructive"
              >
                {errorMessage}
              </p>
            )}
          </AlertDialogHeader>
          {Boolean(children) && (
            <div className="mt-5 w-full text-left text-card-foreground">
              {children}
            </div>
          )}
        </div>
        <AlertDialogFooter className="mx-0 mb-0 flex flex-row items-center justify-between gap-3 rounded-none border-t border-border/40 bg-transparent px-6 py-4 sm:flex-row sm:justify-between">
          <AlertDialogCancel
            variant="ghost"
            data-testid="btn-cancel"
            disabled={isLoading}
            onClick={onClickCancel}
            className="h-12 w-auto shrink-0 px-1 font-bold text-foreground shadow-none hover:bg-transparent hover:opacity-90"
          >
            {textCancel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            data-testid="btn-continue"
            disabled={isLoading}
            loading={isLoading}
            onClick={onClickAction}
            className="h-12 w-auto shrink-0 px-8 font-bold"
          >
            {textAction}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </ShadCNAlertDialog>
  )
}

export default AlertDialog
