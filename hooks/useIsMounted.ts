// frontend/hooks/useIsMounted.ts
"use client";

import { useEffect, useState } from "react";

export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}