import { useState, useEffect, useRef, useCallback } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      // Clear any previous timeout to prevent multiple executions
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Log for debugging
      console.log(`[useDebounce] Debouncing call with delay: ${delay}ms`);

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        console.log("[useDebounce] Executing debounced function");
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}
