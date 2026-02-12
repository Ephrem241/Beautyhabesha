"use client";

import { useEffect, useRef } from "react";
import { updateEscortLastActive } from "@/app/dashboard/actions";

type EscortActivityPingProps = {
  isEscort: boolean;
};

export function EscortActivityPing({ isEscort }: EscortActivityPingProps) {
  const hasPinged = useRef(false);

  useEffect(() => {
    if (!isEscort || hasPinged.current) return;
    hasPinged.current = true;
    void updateEscortLastActive();
  }, [isEscort]);

  return null;
}
