/**
 * Analytics stub. Replace with your provider (GA4, Vercel Analytics, etc.).
 * - reportPageView: call on route change / initial load
 * - reportWebVital: call from useReportWebVitals for each metric
 * - reportEvent: custom events (e.g. click, conversion)
 */

export function reportPageView(url: string, title?: string): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[Analytics] page_view", { url, title });
  }
  // Example: window.gtag?.("config", "G-XXX", { page_path: url, page_title: title });
}

export function reportWebVital(metric: {
  name: string;
  value: number;
  id: string;
  rating?: string;
  delta: number;
}): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[Analytics] web_vital", metric.name, metric.value, metric.rating);
  }
  // Example GA4: window.gtag?.("event", metric.name, { value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value), event_label: metric.id, non_interaction: true });
}

export function reportEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[Analytics] event", name, params);
  }
  // Example: window.gtag?.("event", name, params);
}
