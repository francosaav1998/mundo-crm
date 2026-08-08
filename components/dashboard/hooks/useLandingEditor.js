"use client";

import { useCallback, useEffect, useState } from "react";
import { getLandingContent } from "@/lib/landing";
import { updateSellerConfig } from "@/lib/seller";

const DEFAULT_CONTENT = getLandingContent(null);

export function useLandingEditor({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [plans, setPlans] = useState([]);
  const [previewMode, setPreviewMode] = useState("desktop");
  const [sellerData, setSellerData] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    photo: "",
    bio: "",
    gender: "",
    footerText: "",
    metaPixelId: "",
    landingTheme: "light",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sellerRes, plansRes] = await Promise.all([
          fetch("/api/me/seller"),
          fetch("/api/me/plans"),
        ]);

        if (sellerRes.ok) {
          const s = await sellerRes.json();
          setSellerData(s);
          setContent(getLandingContent(s));
          updateSellerConfig({
            name: s.name,
            phone: s.phone,
            defaultMessage: s.defaultMessage || undefined,
          });
          setProfile({
            name: s.name || "",
            phone: s.phone || "",
            photo: s.photo || "",
            bio: s.bio || "",
            gender: s.gender || "",
            footerText: s.footerText || "",
            metaPixelId: s.metaPixelId || "",
            landingTheme: s.landingTheme || "light",
          });
        }

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setPlans(plansData);
        }
      } catch (err) {
        showToast(err.message || "Error al cargar editor");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const updateContent = useCallback((section, updates) => {
    setDirty(true);
    setContent((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
  }, []);

  const updateArrayItem = useCallback((section, key, index, value) => {
    setDirty(true);
    setContent((prev) => {
      const arr = [...(prev[section]?.[key] || [])];
      arr[index] = { ...arr[index], ...value };
      return { ...prev, [section]: { ...prev[section], [key]: arr } };
    });
  }, []);

  const addArrayItem = useCallback((section, key, template) => {
    setDirty(true);
    setContent((prev) => {
      const arr = [...(prev[section]?.[key] || []), template];
      return { ...prev, [section]: { ...prev[section], [key]: arr } };
    });
  }, []);

  const removeArrayItem = useCallback((section, key, index) => {
    setDirty(true);
    setContent((prev) => {
      const arr = [...(prev[section]?.[key] || [])];
      arr.splice(index, 1);
      return { ...prev, [section]: { ...prev[section], [key]: arr } };
    });
  }, []);

  const updateProfile = useCallback((updates) => {
    setDirty(true);
    setProfile((prev) => ({ ...prev, ...updates }));
    setSellerData((prev) => (prev ? { ...prev, ...updates } : null));
    if (updates.name !== undefined || updates.phone !== undefined) {
      updateSellerConfig({
        name: updates.name,
        phone: updates.phone,
      });
    }
  }, []);

  const updatePlan = useCallback((index, updates) => {
    setDirty(true);
    setPlans((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  }, []);

  const updatePlanFeature = useCallback((planIndex, featureIndex, value) => {
    setDirty(true);
    setPlans((prev) => {
      const next = [...prev];
      const features = [...(next[planIndex].features || [])];
      features[featureIndex] = { ...features[featureIndex], ...value };
      next[planIndex] = { ...next[planIndex], features };
      return next;
    });
  }, []);

  const addPlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nuevo plan",
          category: "internet",
          speed: "200",
          speedLabel: "Megas",
          price: "$12.990",
          features: [{ icon: "bi-check-circle-fill", text: "Característica del plan" }],
        }),
      });
      if (!res.ok) throw new Error("Error al crear plan");
      const newPlan = await res.json();
      setPlans((prev) => [...prev, newPlan]);
      return newPlan;
    } catch (err) {
      showToast(err.message || "Error al agregar plan");
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const removePlan = useCallback(async (index) => {
    const plan = plans[index];
    if (!plan?.id) return;
    try {
      const res = await fetch("/api/me/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, active: false }),
      });
      if (!res.ok) throw new Error("Error al eliminar plan");
      setPlans((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      showToast(err.message || "Error al eliminar plan");
    }
  }, [plans, showToast]);

  const addPlanFeature = useCallback((planIndex) => {
    setDirty(true);
    setPlans((prev) => {
      const next = [...prev];
      const features = [...(next[planIndex].features || []), { icon: "bi-check-circle-fill", text: "Nueva característica" }];
      next[planIndex] = { ...next[planIndex], features };
      return next;
    });
  }, []);

  const removePlanFeature = useCallback((planIndex, featureIndex) => {
    setDirty(true);
    setPlans((prev) => {
      const next = [...prev];
      const features = [...(next[planIndex].features || [])];
      features.splice(featureIndex, 1);
      next[planIndex] = { ...next[planIndex], features };
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const sellerRes = await fetch("/api/me/seller", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landingContent: content,
          name: profile.name,
          phone: profile.phone,
          photo: profile.photo,
          bio: profile.bio,
          gender: profile.gender,
          footerText: profile.footerText,
          metaPixelId: profile.metaPixelId,
          landingTheme: profile.landingTheme,
        }),
      });

      if (!sellerRes.ok) throw new Error("Error al guardar contenido");

      const planResults = await Promise.all(
        plans.map((plan, idx) =>
          fetch("/api/me/plans", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              planId: plan.id,
              active: plan.sellerActive !== false,
              order: idx,
              overrides: {
                title: plan.title,
                speed: plan.speed,
                speedLabel: plan.speedLabel,
                price: plan.price,
                priceSubtitle: plan.priceSubtitle,
                features: plan.features,
                featured: plan.featured,
                cta: plan.cta,
              },
            }),
          })
        )
      );

      if (planResults.some((r) => !r.ok)) throw new Error("Error al guardar planes");

      setDirty(false);
      showToast("Landing y planes guardados correctamente");
      return true;
    } catch (err) {
      showToast(err.message || "Error al guardar");
      return false;
    } finally {
      setSaving(false);
    }
  }, [content, plans, profile, showToast]);

  return {
    loading,
    saving,
    dirty,
    activeSection,
    setActiveSection,
    content,
    plans,
    profile,
    company: sellerData?.company || null,
    previewMode,
    setPreviewMode,
    sellerData,
    updateContent,
    updateArrayItem,
    addArrayItem,
    removeArrayItem,
    updateProfile,
    updatePlan,
    addPlan,
    removePlan,
    updatePlanFeature,
    addPlanFeature,
    removePlanFeature,
    save,
  };
}
