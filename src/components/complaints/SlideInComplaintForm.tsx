/**
 * Slide-in complaint form component with dark theme
 */

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComplaintForm } from "./ComplaintForm";

interface SlideInComplaintFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function SlideInComplaintForm({ isOpen, onClose, onSuccess }: SlideInComplaintFormProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the component is mounted before animating
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle transition end to unmount when closed
  const handleTransitionEnd = () => {
    if (!isVisible && onClose) {
      onClose();
    }
  };

  if (!isOpen && !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70">
      <div className="absolute inset-0" onClick={onClose}>
        {/* Backdrop */}
      </div>
      <div 
        className={`absolute right-0 top-0 bottom-0 w-full max-w-3xl bg-[#050b1a] text-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center p-4 border-b border-blue-900">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-950 mr-2 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Complaints
            </Button>
            
            <h2 className="text-xl font-bold text-blue-400 ml-4">Submit New Complaint</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <ComplaintForm 
              onSuccess={(id) => {
                if (onSuccess) onSuccess(id);
                onClose();
              }}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
