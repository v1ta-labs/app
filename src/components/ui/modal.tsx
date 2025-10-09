'use client';

import { ReactNode, forwardRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const overlayVariants = cva('fixed inset-0 z-[9998]', {
  variants: {
    blur: {
      none: 'bg-black/40',
      sm: 'bg-black/50 backdrop-blur-sm',
      md: 'bg-black/60 backdrop-blur-md',
      lg: 'bg-black/70 backdrop-blur-lg',
    },
  },
  defaultVariants: {
    blur: 'md',
  },
});

const contentVariants = cva(
  'fixed z-[9999] bg-surface border-border focus:outline-none overflow-hidden',
  {
    variants: {
      size: {
        xs: 'w-full max-w-xs',
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-lg',
        xl: 'w-full max-w-xl',
        '2xl': 'w-full max-w-2xl',
        '3xl': 'w-full max-w-3xl',
        '4xl': 'w-full max-w-4xl',
        full: 'w-[95vw] h-[95vh] max-w-7xl',
      },
      position: {
        center: 'left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2',
        top: 'left-[50%] top-[5%] -translate-x-1/2',
        bottom: 'left-[50%] bottom-[5%] -translate-x-1/2',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-lg',
        md: 'rounded-xl',
        lg: 'rounded-2xl',
        xl: 'rounded-3xl',
        full: 'rounded-full',
      },
      border: {
        none: 'border-0',
        default: 'border',
        strong: 'border-2',
      },
      shadow: {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-xl',
        lg: 'shadow-2xl',
        glow: 'shadow-2xl shadow-primary/10',
      },
    },
    defaultVariants: {
      size: 'md',
      position: 'center',
      radius: 'lg',
      border: 'default',
      shadow: 'lg',
    },
  }
);

export interface ModalProps extends VariantProps<typeof contentVariants> {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  showClose?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
  blur?: VariantProps<typeof overlayVariants>['blur'];
  preventScroll?: boolean;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onOpenChange,
      children,
      showClose = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      size,
      position,
      radius,
      border,
      shadow,
      blur = 'md',
      className,
      overlayClassName,
      preventScroll = true,
    },
    ref
  ) => {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange} modal={preventScroll}>
        <Dialog.Portal>
          <Dialog.Overlay
            className={cn(
              overlayVariants({ blur }),
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              overlayClassName
            )}
          />
          <Dialog.Content
            ref={ref}
            className={cn(
              contentVariants({ size, position, radius, border, shadow }),
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]',
              className
            )}
            onPointerDownOutside={e => {
              if (!closeOnOverlayClick) e.preventDefault();
            }}
            onEscapeKeyDown={e => {
              if (!closeOnEscape) e.preventDefault();
            }}
          >
            {showClose && onOpenChange && (
              <Dialog.Close asChild>
                <button
                  className="absolute right-4 top-4 z-50 rounded-lg p-1.5 opacity-70 transition-all hover:opacity-100 hover:bg-elevated hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:pointer-events-none"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 text-text-secondary" />
                </button>
              </Dialog.Close>
            )}
            {children}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
);

Modal.displayName = 'Modal';

// Modal Header
export const ModalHeader = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string; centered?: boolean }
>(({ children, className, centered = false }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-2 px-6 pt-6 pb-4', centered && 'text-center', className)}
  >
    {children}
  </div>
));
ModalHeader.displayName = 'ModalHeader';

// Modal Title
export const ModalTitle = forwardRef<
  HTMLHeadingElement,
  { children: ReactNode; className?: string }
>(({ children, className }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn('text-2xl font-bold text-text-primary leading-tight', className)}
  >
    {children}
  </Dialog.Title>
));
ModalTitle.displayName = 'ModalTitle';

// Modal Description
export const ModalDescription = forwardRef<
  HTMLParagraphElement,
  { children: ReactNode; className?: string }
>(({ children, className }, ref) => (
  <Dialog.Description ref={ref} className={cn('text-sm text-text-tertiary', className)}>
    {children}
  </Dialog.Description>
));
ModalDescription.displayName = 'ModalDescription';

// Modal Body
export const ModalBody = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string; scrollable?: boolean; maxHeight?: string }
>(({ children, className, scrollable = false, maxHeight }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-6 py-4',
      scrollable && 'overflow-y-auto',
      maxHeight && `max-h-[${maxHeight}]`,
      className
    )}
  >
    {children}
  </div>
));
ModalBody.displayName = 'ModalBody';

// Modal Footer
export const ModalFooter = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string; align?: 'left' | 'center' | 'right' | 'between' }
>(({ children, className, align = 'right' }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex gap-2 px-6 pb-6 pt-4 border-t border-border/30',
      align === 'left' && 'justify-start',
      align === 'center' && 'justify-center',
      align === 'right' && 'justify-end',
      align === 'between' && 'justify-between',
      className
    )}
  >
    {children}
  </div>
));
ModalFooter.displayName = 'ModalFooter';

// Modal Section (for dividing content)
export const ModalSection = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string; bordered?: boolean }
>(({ children, className, bordered = false }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-6 py-4',
      bordered && 'border-t border-border/30 first:border-t-0',
      className
    )}
  >
    {children}
  </div>
));
ModalSection.displayName = 'ModalSection';
