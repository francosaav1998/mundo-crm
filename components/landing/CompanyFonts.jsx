"use client";

import { useEffect } from "react";
import { getCompanyConfig } from "@/lib/company";

export default function CompanyFonts({ company }) {
  useEffect(() => {
    if (!company) return;
    const config = getCompanyConfig(company.slug);
    if (!config?.googleFontUrl) return;

    const id = `company-font-${company.slug}`;
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = config.googleFontUrl;
    document.head.appendChild(link);
  }, [company]);

  return null;
}
