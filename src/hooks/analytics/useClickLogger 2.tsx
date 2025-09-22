import * as React from 'react';
import { useCallback } from 'react';
import { ClickLogService } from '@/integration/supabase/services/clickLogService';

export function useClickLogger() {
  const logClick = useCallback((data: {
    elementId?: string;
    elementClass?: string;
    action: string;
    componentName?: string;
    pageTitle?: string;
  }) => {
    const clickLogService = ClickLogService.getInstance();
    clickLogService.logClick(data);
  }, []);

  return { logClick };
}

// Higher-order component to automatically log clicks on elements
export function withClickLogging<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  return (props: P) => {
    const { logClick } = useClickLogger();
    
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      // Extract information about the clicked element
      const target = e.target as HTMLElement;
      const elementId = target.id || '';
      const elementClass = Array.from(target.classList).join(' ') || '';
      const action = 'click';
      
      // Log the click
      logClick({
        elementId,
        elementClass,
        action,
        componentName,
        pageTitle: document.title
      });
    };
    
    return (
      <div onClick={handleClick}>
        <Component {...props} />
      </div>
    );
  };
}
