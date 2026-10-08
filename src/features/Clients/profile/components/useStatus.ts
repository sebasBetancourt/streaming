import { useCallback, useEffect, useRef, useState } from "react";

export interface Status {
  kind: "success" | "error";
  text: string;
}

/** Mensaje de éxito/error propio de cada sección; el de éxito se borra solo. */
export function useStatus(successMs = 5000) {
  const [status, setStatus] = useState<Status | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const clear = useCallback(() => {
    clearTimeout(timer.current);
    setStatus(null);
  }, []);
  const success = useCallback(
    (text: string) => {
      clearTimeout(timer.current);
      setStatus({ kind: "success", text });
      timer.current = setTimeout(() => setStatus(null), successMs);
    },
    [successMs],
  );
  const fail = useCallback((e: unknown) => {
    clearTimeout(timer.current);
    setStatus({ kind: "error", text: e instanceof Error ? e.message : String(e) });
  }, []);

  return { status, clear, success, fail };
}
