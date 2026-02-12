"use client";

import { memo } from "react";

export type ViewMode = "grid" | "swipe";

type ViewSwitcherProps = {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
};

export const ViewSwitcher = memo(function ViewSwitcher({
  currentView,
  onViewChange,
  className = "",
}: ViewSwitcherProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900/80 p-1 ${className}`.trim()}
      role="tablist"
      aria-label="View mode"
    >
      <button
        type="button"
        role="tab"
        aria-selected={currentView === "grid"}
        aria-controls="models-content"
        onClick={() => onViewChange("grid")}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
          currentView === "grid"
            ? "bg-emerald-500 text-emerald-950 shadow-sm"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
        <span className="hidden sm:inline">Grid</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={currentView === "swipe"}
        aria-controls="models-content"
        onClick={() => onViewChange("swipe")}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
          currentView === "swipe"
            ? "bg-emerald-500 text-emerald-950 shadow-sm"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
        <span className="hidden sm:inline">Swipe</span>
      </button>
    </div>
  );
});

