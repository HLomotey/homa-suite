import { useEffect } from 'react';
import { useClickLogger } from '@/hooks/analytics/useClickLogger';
import { useAuth } from '@/components/auth';

/**
 * GlobalClickTracker - A component that tracks all clicks throughout the application
 * This component should be added near the root of your application
 */
export function GlobalClickTracker() {
  const { logClick } = useClickLogger();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    // Function to handle clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Skip tracking on specific elements if needed
      if (target.hasAttribute('data-no-track')) {
        return;
      }
      
      // Extract information about the clicked element
      const elementId = target.id || '';
      const elementClass = Array.from(target.classList).join(' ') || '';
      
      // Try to determine component name from closest data attribute
      let componentName = '';
      let element: HTMLElement | null = target;
      
      while (element && !componentName) {
        if (element.dataset.componentName) {
          componentName = element.dataset.componentName;
          break;
        }
        element = element.parentElement;
      }
      
      // Get the action (can be customized with data attributes)
      const action = target.dataset.action || 'click';
      
      // Log the click
      logClick({
        elementId,
        elementClass,
        action,
        componentName,
        pageTitle: document.title
      });
    };
    
    // Add click listener to document
    document.addEventListener('click', handleClick);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [logClick, user]);
  
  // This component doesn't render anything
  return null;
}
