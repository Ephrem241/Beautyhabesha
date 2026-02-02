"use client";

import dynamic from "next/dynamic";

const WebVitals = dynamic(
  () => import("./WebVitals").then((m) => m.WebVitals),
  { ssr: false }
);

export function WebVitalsClient() {
  return <WebVitals />;
}
