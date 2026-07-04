"use client";

import { useCallback, useEffect, useState } from "react";

export function useStats({ search, statusFilter, dateFilter, customDate, initialStats = null }) {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        ...(search ? { search } : {}),
        ...(statusFilter !== "Todos" ? { status: statusFilter } : {}),
        ...(dateFilter !== "todos" ? { dateFilter } : {}),
        ...(customDate && dateFilter === "custom" ? { customDate } : {}),
      });
      const res = await fetch(`/api/leads/stats?${query.toString()}`);
      if (!res.ok) throw new Error("Error cargando estadísticas");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, dateFilter, customDate]);

  useEffect(() => {
    if (!stats) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      refresh();
    }
  }, [stats, refresh]);

  return { stats, loading, error, refresh };
}
