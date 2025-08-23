// COPY THIS ENTIRE FILE FROM: lib/useSmartScroll.ts
// Move the complete contents of lib/useSmartScroll.ts into this file 
import { useEffect, useLayoutEffect, useRef } from 'react';

export function useSmartScroll(deps: React.DependencyList) {
  const ref = useRef<HTMLDivElement | null>(null);
  const pinned = useRef(true);
  
  const isNearBottom = () => {
    const el = ref.current!;
    return (el.scrollHeight - el.scrollTop - el.clientHeight) < 16;
  };
  
  const toBottom = () => {
    const el = ref.current!;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  };
  
  useEffect(() => {
    const el = ref.current!;
    if (!el) return;
    
    const onScroll = () => {
      pinned.current = isNearBottom();
    };
    
    el.addEventListener('scroll', onScroll, { passive: true });
    
    const ro = new ResizeObserver(() => {
      if (pinned.current) toBottom();
    });
    
    ro.observe(el);
    
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, []);
  
  useLayoutEffect(() => {
    if (pinned.current) toBottom();
  }, deps);
  
  return ref;
} 
