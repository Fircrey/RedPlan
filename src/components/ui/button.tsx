import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]': variant === 'primary',
            'bg-[var(--color-surface-secondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]': variant === 'secondary',
            'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]': variant === 'ghost',
            'bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-hover)]': variant === 'danger',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className,
        )}
        disabled={disabled}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
