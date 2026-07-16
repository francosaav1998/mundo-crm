"use client";

import { useSyncExternalStore } from "react";

function getSnapshot(query) {
  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return false;
}

function subscribe(query, callback) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(query);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

export function useMediaQuery(query) {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => getSnapshot(query),
    () => getServerSnapshot()
  );
}
