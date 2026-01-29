"use client";

import { useReportWebVitals } from "next/web-vitals";
import { usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";
import { reportWebVital, reportPageView } from "@/lib/analytics";

export function WebVitals() {
  const pathname = usePathname();

  useEffect(() => {
    reportPageView(pathname ?? "/", document.title);
  }, [pathname]);

  const handleMetric = useCallback(
    (metric: { name: string; value: number; id: string; rating?: string; delta: number }) => {
      reportWebVital(metric);
    },
    []
  );

  useReportWebVitals(handleMetric);
  return null;
}
