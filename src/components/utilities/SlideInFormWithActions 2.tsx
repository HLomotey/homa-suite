import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SlideInFormAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
  loading?: boolean;
}

interface SlideInFormWithActionsProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: SlideInFormAction[];
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'right' | 'left';
  showCloseButton?: boolean;
  className?: string;
  footerClassName?: string;
  onSubmit?: (e: React.FormEvent) => void;
}

const SlideInFormWithActions: React.FC<SlideInFormWithActionsProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions = [],
  size = 'md',
  position = 'right',
  showCloseButton = true,
  className,
  footerClassName,
  onSubmit
}) => {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[32rem]',
    xl: 'w-[40rem]',
    full: 'w-full max-w-4xl'
  };

  const positionClasses = {
    right: {
      container: 'justify-end',
      panel: 'translate-x-full',
      panelOpen: 'translate-x-0'
    },
    left: {
      container: 'justify-start',
      panel: '-translate-x-full',
      panelOpen: 'translate-x-0'
    }
  };

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Slide panel container */}
      <div className={cn(
        "fixed inset-y-0 flex max-w-full",
        positionClasses[position].container,
        position === 'right' ? 'right-0' : 'left-0'
      )}>
        <div
          className={cn(
            "relative flex h-full flex-col bg-gray-900 border-l border-gray-700 shadow-xl transition-transform duration-300 ease-in-out",
            sizeClasses[size],
            positionClasses[position].panel,
            isOpen && positionClasses[position].panelOpen,
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              {description && (
                <p className="mt-1 text-sm text-gray-400">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-4 h-8 w-8 p-0"
              >
                <X className="h-4 w-4 text-gray-400" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </div>

          {/* Content */}
          <form onSubmit={handleFormSubmit} className="flex flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {children}
            </div>

            {/* Footer with actions */}
            {actions.length > 0 && (
              <div className={cn(
                "border-t border-gray-700 px-6 py-4 bg-gray-800/50",
                footerClassName
              )}>
                <div className="flex justify-end space-x-3">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'default'}
                      onClick={action.onClick}
                      disabled={action.disabled || action.loading}
                      type={action.variant === 'default' ? 'submit' : 'button'}
                    >
                      {action.loading ? (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : null}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SlideInFormWithActions;
