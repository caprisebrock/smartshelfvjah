// COPY THIS ENTIRE FILE FROM: lib/utils.ts
// Move the complete contents of lib/utils.ts into this file 
// Simple debounced callback utility
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
  ): T {
    let timeoutId: NodeJS.Timeout;
    
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    }) as T;
  } 