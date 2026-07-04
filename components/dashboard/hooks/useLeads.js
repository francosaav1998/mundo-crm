"use client";

import { useCallback, useRef, useState } from "react";

export function useLeads(initialLeads = [], initialTotal = 0) {
  const [leads, setLeads] = useState(initialLeads);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearchState] = useState("");
  const [statusFilter, setStatusFilterState] = useState("Todos");
  const [dateFilter, setDateFilterState] = useState("todos");
  const [customDate, setCustomDateState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filtersRef = useRef({ search: "", statusFilter: "Todos", dateFilter: "todos", customDate: "" });

  const buildQuery = useCallback((pageNum, overrides = {}) => {
    const current = filtersRef.current;
    const query = new URLSearchParams({
      page: String(pageNum),
      limit: String(limit),
      ...(overrides.search !== undefined
        ? overrides.search
          ? { search: overrides.search }
          : {}
        : current.search
        ? { search: current.search }
        : {}),
      ...(overrides.statusFilter !== undefined
        ? overrides.statusFilter !== "Todos"
          ? { status: overrides.statusFilter }
          : {}
        : current.statusFilter !== "Todos"
        ? { status: current.statusFilter }
        : {}),
      ...(overrides.dateFilter !== undefined
        ? { dateFilter: overrides.dateFilter }
        : { dateFilter: current.dateFilter }),
      ...(overrides.customDate !== undefined
        ? overrides.customDate && overrides.dateFilter === "custom"
          ? { customDate: overrides.customDate }
          : {}
        : current.customDate && current.dateFilter === "custom"
        ? { customDate: current.customDate }
        : {}),
    });
    return query;
  }, [limit]);

  const fetchLeads = useCallback(async (pageNum, overrides = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildQuery(pageNum, overrides);
      const res = await fetch(`/api/leads?${query.toString()}`);
      if (!res.ok) throw new Error("Error cargando leads");

      const data = await res.json();
      setLeads(data.leads);
      setTotal(data.total);
      setPage(data.page);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  const setSearch = useCallback((value) => {
    setSearchState(value);
    filtersRef.current.search = value;
    fetchLeads(1, { search: value });
  }, [fetchLeads]);

  const setStatusFilter = useCallback((value) => {
    setStatusFilterState(value);
    filtersRef.current.statusFilter = value;
    fetchLeads(1, { statusFilter: value });
  }, [fetchLeads]);

  const setDateFilter = useCallback((value) => {
    setDateFilterState(value);
    filtersRef.current.dateFilter = value;
    fetchLeads(1, { dateFilter: value, customDate: filtersRef.current.customDate });
  }, [fetchLeads]);

  const setCustomDate = useCallback((value) => {
    setCustomDateState(value);
    filtersRef.current.customDate = value;
    if (filtersRef.current.dateFilter === "custom") {
      fetchLeads(1, { customDate: value });
    }
  }, [fetchLeads]);

  const goToPage = useCallback((newPage) => {
    fetchLeads(newPage);
  }, [fetchLeads]);

  const refresh = useCallback(() => {
    fetchLeads(page);
  }, [fetchLeads, page]);

  const updateLead = useCallback((updatedLead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
  }, []);

  const addLeads = useCallback((newLeads) => {
    setLeads((prev) => [...newLeads, ...prev]);
    setTotal((prev) => prev + newLeads.length);
  }, []);

  return {
    leads,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    customDate,
    setCustomDate,
    loading,
    error,
    goToPage,
    refresh,
    updateLead,
    addLeads,
  };
}
