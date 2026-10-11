"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Loads data and exposes loading / error / data. `reload(true)` refreshes without a skeleton. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean }>({
    data: null,
    error: null,
    loading: true,
  });
  const [tick, setTick] = useState(0);
  const silent = useRef(false);

  useEffect(() => {
    let cancelled = false;
    if (!silent.current) setState((s) => ({ ...s, loading: true, error: null }));
    silent.current = false;
    fn()
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((e) => !cancelled && setState({ data: null, error: e instanceof Error ? e.message : "Something went wrong. Please try again.", loading: false }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback((quiet = false) => {
    silent.current = quiet;
    setTick((t) => t + 1);
  }, []);

  return { ...state, reload };
}
