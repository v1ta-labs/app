'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary shadow-sm hover:shadow-md',
        secondary:
          'bg-surface text-text-primary hover:bg-elevated border border-border focus-visible:ring-primary',
        outline:
          'bg-transparent text-text-primary hover:bg-surface border border-border focus-visible:ring-primary',
        ghost: 'bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary',
        danger:
          'bg-error text-white hover:bg-error/90 focus-visible:ring-error shadow-sm hover:shadow-md',
        success:
          'bg-success text-white hover:bg-success/90 focus-visible:ring-success shadow-sm hover:shadow-md',
        warning:
          'bg-warning text-white hover:bg-warning/90 focus-visible:ring-warning shadow-sm hover:shadow-md',
        link: 'bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs',
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-md',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        full: 'rounded-full',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      radius: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  href?: string;
  target?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      radius,
      fullWidth,
      loading,
      loadingText,
      disabled,
      href,
      target,
      leftIcon,
      rightIcon,
      children,
      asChild,
      ...props
    },
    ref
  ) => {
    const classes = cn(buttonVariants({ variant, size, radius, fullWidth }), className);
    const isDisabled = disabled || loading;

    const content = (
      <>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </>
    );

    if (href && !isDisabled) {
      return (
        <Link
          href={href}
          target={target}
          className={classes}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        >
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} disabled={isDisabled} {...props}>
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Button Group
export interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  attached?: boolean;
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, className, orientation = 'horizontal', attached = false }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        attached &&
          orientation === 'horizontal' &&
          '[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg [&>button:not(:last-child)]:border-r-0',
        attached &&
          orientation === 'vertical' &&
          '[&>button]:rounded-none [&>button:first-child]:rounded-t-lg [&>button:last-child]:rounded-b-lg [&>button:not(:last-child)]:border-b-0',
        !attached && 'gap-2',
        className
      )}
    >
      {children}
    </div>
  )
);

ButtonGroup.displayName = 'ButtonGroup';

// Icon Button
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  icon: ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', ...props }, ref) => (
    <Button ref={ref} size={size} {...props}>
      {icon}
    </Button>
  )
);

IconButton.displayName = 'IconButton';
