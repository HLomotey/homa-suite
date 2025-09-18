import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SlideInFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'right' | 'left';
  showCloseButton?: boolean;
  className?: string;
}

const SlideInForm: React.FC<SlideInFormProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  position = 'right',
  showCloseButton = true,
  className
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
    full: 'w-full'
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
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideInForm;
