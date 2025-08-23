import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface SmartTooltipProps {
  message: string;
  id: string; // Unique identifier for the tooltip
  children: React.ReactNode;
}

export default function SmartTooltip({ message, id, children }: SmartTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if this tooltip has already been shown this session
    const storageKey = `shownSmartTooltip-${id}`;
    const hasBeenShown = localStorage.getItem(storageKey);
    
    if (!hasBeenShown) {
      setShouldShow(true);
      // Show tooltip after a brief delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [id]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Mark as shown for this session
    localStorage.setItem(`shownSmartTooltip-${id}`, 'true');
  };

  if (!shouldShow || !isVisible) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      
      {/* Tooltip */}
      <div className="absolute top-0 right-0 z-50 transform translate-x-2 -translate-y-2">
        <div className="bg-purple-600 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs animate-bounce-gentle">
          <div className="flex items-start gap-2">
            <Sparkles className="w-3 h-3 text-purple-200 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="leading-relaxed">{message}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-purple-200 hover:text-white transition-colors flex-shrink-0"
              aria-label="Dismiss tip"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          {/* Arrow pointing to the element */}
          <div className="absolute top-1/2 left-0 transform -translate-x-1 -translate-y-1/2">
            <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-purple-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
