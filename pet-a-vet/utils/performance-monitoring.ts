// This is a utility script to help test and debug performance issues in the marketplace

// Usage:
// 1. Import this file in any component you want to profile
// 2. Call initializePerformanceMonitoring() early in your app lifecycle
// 3. Use markPerformanceEvent() to mark key events in your code
// 4. View results in browser console or DevTools Performance tab

/**
 * Initialize performance monitoring for the application
 */
export function initializePerformanceMonitoring() {
  if (typeof window === "undefined") return;

  // Clear any existing marks/measures
  performance.clearMarks();
  performance.clearMeasures();

  // Mark initial load
  performance.mark("app-init");

  // Set up observer for Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`[Performance] LCP: ${lastEntry.startTime.toFixed(2)}ms`);
      lcpObserver.disconnect();
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

    // Set up observer for Cumulative Layout Shift
    let cumulativeCLS = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          cumulativeCLS += (entry as any).value;
        }
      }
      console.log(`[Performance] Current CLS: ${cumulativeCLS.toFixed(4)}`);
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });

    // Monitor long tasks
    const longTaskObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      for (const entry of entries) {
        console.warn(
          `[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`
        );
      }
    });
    longTaskObserver.observe({ type: "longtask", buffered: true });

    // Set up cleanup
    window.addEventListener("unload", () => {
      lcpObserver.disconnect();
      clsObserver.disconnect();
      longTaskObserver.disconnect();
    });
  } catch (e) {
    console.error("Error setting up performance observers:", e);
  }
}

/**
 * Mark a performance event in the application
 * @param name The name of the event to mark
 * @param measureFromLast Whether to measure time since the last mark
 */
export function markPerformanceEvent(name: string, measureFromLast = true) {
  if (typeof window === "undefined") return;

  const markName = `mark_${name}`;
  performance.mark(markName);

  if (measureFromLast) {
    try {
      const entries = performance.getEntriesByType("mark");
      if (entries.length > 1) {
        const previousMark = entries[entries.length - 2].name;
        const measureName = `${previousMark}_to_${markName}`;
        performance.measure(measureName, previousMark, markName);

        const measures = performance.getEntriesByName(measureName);
        if (measures.length > 0) {
          console.log(
            `[Performance] ${measureName}: ${measures[0].duration.toFixed(2)}ms`
          );
        }
      }
    } catch (e) {
      console.error("Error measuring performance:", e);
    }
  }
}

/**
 * Track component render time
 * @param componentName The name of the component to track
 * @param renderCount The current render count
 */
export function trackRender(componentName: string, renderCount: number) {
  console.log(`[Render] ${componentName} rendered (count: ${renderCount})`);
  markPerformanceEvent(`${componentName}_render_${renderCount}`, false);
}

/**
 * Track API call performance
 * @param apiName The name or URL of the API being called
 * @returns A function to call when the API call completes
 */
export function trackApiCall(apiName: string) {
  const startTime = performance.now();
  const markName = `api_${apiName}_start`;
  performance.mark(markName);

  return (success = true) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    const endMarkName = `api_${apiName}_${success ? "success" : "error"}`;
    performance.mark(endMarkName);
    performance.measure(`api_${apiName}_duration`, markName, endMarkName);

    console.log(
      `[API] ${apiName}: ${duration.toFixed(2)}ms (${
        success ? "success" : "error"
      })`
    );
  };
}

/**
 * Get a summary of all performance metrics
 */
export function getPerformanceSummary() {
  if (typeof window === "undefined") return {};

  const navigationEntry = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming;
  const paintEntries = performance.getEntriesByType("paint");

  const firstPaint = paintEntries.find((entry) => entry.name === "first-paint");
  const firstContentfulPaint = paintEntries.find(
    (entry) => entry.name === "first-contentful-paint"
  );

  return {
    navigationTiming: {
      timeToFirstByte: navigationEntry
        ? navigationEntry.responseStart - navigationEntry.requestStart
        : null,
      domContentLoaded: navigationEntry
        ? navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart
        : null,
      windowLoaded: navigationEntry
        ? navigationEntry.loadEventEnd - navigationEntry.fetchStart
        : null,
    },
    paintTiming: {
      firstPaint: firstPaint ? firstPaint.startTime : null,
      firstContentfulPaint: firstContentfulPaint
        ? firstContentfulPaint.startTime
        : null,
    },
    measures: performance.getEntriesByType("measure").map((measure) => ({
      name: measure.name,
      duration: measure.duration,
    })),
  };
}
