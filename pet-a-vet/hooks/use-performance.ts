import { useEffect, useState } from "react";

type PerformanceMetrics = {
  timeToFirstByte: number | null;
  firstContentfulPaint: number | null;
  largestContentfulPaint: number | null;
  firstInputDelay: number | null;
  cumulativeLayoutShift: number | null;
};

export function usePerformanceMetrics(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    timeToFirstByte: null,
    firstContentfulPaint: null,
    largestContentfulPaint: null,
    firstInputDelay: null,
    cumulativeLayoutShift: null,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !("performance" in window)) {
      return;
    }

    // Navigation Timing API
    const getTimeToFirstByte = () => {
      const navigationEntry = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb =
          navigationEntry.responseStart - navigationEntry.requestStart;
        setMetrics((prev) => ({ ...prev, timeToFirstByte: ttfb }));
      }
    };

    // Paint Timing API
    const getPaintMetrics = () => {
      const paintEntries = performance.getEntriesByType("paint");
      const firstPaint = paintEntries.find(
        (entry) => entry.name === "first-paint"
      );
      const firstContentfulPaint = paintEntries.find(
        (entry) => entry.name === "first-contentful-paint"
      );

      if (firstContentfulPaint) {
        setMetrics((prev) => ({
          ...prev,
          firstContentfulPaint: firstContentfulPaint.startTime,
        }));
      }
    };

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        setMetrics((prev) => ({
          ...prev,
          largestContentfulPaint: lastEntry.startTime,
        }));
      }
    });

    // First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const firstInput = entries[0] as PerformanceEventTiming;
      if (firstInput) {
        setMetrics((prev) => ({
          ...prev,
          firstInputDelay: firstInput.processingStart - firstInput.startTime,
        }));
      }
    });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((entryList) => {
      let clsValue = 0;
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      setMetrics((prev) => ({ ...prev, cumulativeLayoutShift: clsValue }));
    });

    // Collect metrics
    getTimeToFirstByte();
    getPaintMetrics();

    // Start observing
    try {
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      fidObserver.observe({ type: "first-input", buffered: true });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      console.error("Performance observer error:", e);
    }

    // Cleanup
    return () => {
      try {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      } catch (e) {
        console.error("Error disconnecting observers:", e);
      }
    };
  }, []);

  return metrics;
}

// Additional utility to log render times for components
export function useRenderTiming(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      console.log(
        `[Performance] ${componentName} render time: ${renderTime.toFixed(2)}ms`
      );
    };
  }, [componentName]);
}

// Measure fetch performance
export function useApiPerformance() {
  return async (url: string, options?: RequestInit) => {
    const startTime = performance.now();
    try {
      const response = await fetch(url, options);
      const endTime = performance.now();
      console.log(
        `[API Performance] ${url} - ${(endTime - startTime).toFixed(2)}ms`
      );
      return response;
    } catch (error) {
      const endTime = performance.now();
      console.error(
        `[API Performance Error] ${url} - ${(endTime - startTime).toFixed(
          2
        )}ms`,
        error
      );
      throw error;
    }
  };
}
