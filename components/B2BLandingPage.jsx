"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./B2BLandingPage.module.css";
import { DEFAULT_B2B_CONTENT } from "@/lib/b2b-content";

const companies = [
  ["Mundo", null], ["VTR", "/company-logos/vtr.webp"],
  ["Claro", "/company-logos/claro.png"], ["WOM", "/company-logos/wom.png"],
  ["Entel", "/company-logos/entel.jpg"], ["Movistar", "/company-logos/movistar.png"],
];

function Logo({ company }) {
  return <span className={styles.logoCard}>{company[1] ? <Image src={company[1]} alt={`Logo ${company[0]}`} width={150} height={62} /> : <span className={styles.mundoLogo}><b>m</b>MUNDO</span>}</span>;
}

function Brand({ name, tag }) {
  return (
    <div className={styles.brand}>
      <b>m</b>
      <span><strong>{name}</strong><small>{tag}</small></span>
    </div>
  );
}

function Editable({ as: Tag = "span", path, section, children, className, isPreview }) {
  if (!isPreview) {
    return <Tag className={className}>{children}</Tag>;
  }

  const sendTextEdit = (value) => {
    window.parent?.postMessage(
      { type: "B2B_PREVIEW_TEXT_EDIT", payload: { path, value } },
      window.location.origin
    );
  };

  const selectSection = (e) => {
    e.stopPropagation();
    if (section) {
      window.parent?.postMessage(
        { type: "B2B_PREVIEW_SECTION_SELECTED", sectionId: section },
        window.location.origin
      );
    }
  };

  return (
    <Tag
      className={`${className || ""} ${styles.editable}`}
      contentEditable
      suppressContentEditableWarning
      onClick={selectSection}
      onBlur={(e) => sendTextEdit(e.currentTarget.textContent)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    >
      {children}
    </Tag>
  );
}

function EditableLink({ href, className, children, isPreview, path, section }) {
  if (!isPreview) {
    return <Link href={href} className={className}>{children}</Link>;
  }
  return (
    <span
      className={`${className || ""} ${styles.editable}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (section) {
          window.parent?.postMessage(
            { type: "B2B_PREVIEW_SECTION_SELECTED", sectionId: section },
            window.location.origin
          );
        }
      }}
    >
      {children}
    </span>
  );
}

export default function B2BLandingPage({ content = DEFAULT_B2B_CONTENT, isPreview = false }) {
  const c = content || DEFAULT_B2B_CONTENT;
  const { header, hero, companies: companiesCopy, benefits, cta, footer } = c;
  const proofs = Array.isArray(hero.proofs) ? hero.proofs : [];

  const sectionClick = (sectionId) => (e) => {
    if (!isPreview) return;
    // Solo seleccionar si el clic no fue en un editable.
    if (e.target.closest(`.${styles.editable}`)) return;
    window.parent?.postMessage(
      { type: "B2B_PREVIEW_SECTION_SELECTED", sectionId },
      window.location.origin
    );
  };

  return <main className={styles.page}>
    <header className={styles.header} onClick={sectionClick("header")}>
      <EditableLink href="/" className={styles.brand} isPreview={isPreview} section="header">
        <b>m</b>
        <span>
          <Editable as="strong" path="header.brandName" isPreview={isPreview}>{header.brandName}</Editable>
          <Editable as="small" path="header.brandTag" isPreview={isPreview}>{header.brandTag}</Editable>
        </span>
      </EditableLink>
      <nav>
        {(header.navLinks || []).map((l, i) => (
          <a key={l.id} href={`#${l.id}`} onClick={(e) => { if (isPreview) { e.preventDefault(); e.stopPropagation(); window.parent?.postMessage({ type: "B2B_PREVIEW_SECTION_SELECTED", sectionId: "header" }, window.location.origin); } }}>
            <Editable path={`header.navLinks.${i}.label`} isPreview={isPreview}>{l.label}</Editable>
          </a>
        ))}
      </nav>
      <EditableLink href="/dashboard/login" className={styles.login} isPreview={isPreview} section="header">
        <Editable path="header.loginLabel" isPreview={isPreview}>{header.loginLabel}</Editable> <i className="bi bi-arrow-up-right"/>
      </EditableLink>
    </header>

    <section className={styles.hero} id="solucion" onClick={sectionClick("hero")}>
      <div className={styles.copy}>
        <div className={styles.eyebrow}><span/> <Editable path="hero.eyebrow" isPreview={isPreview}>{hero.eyebrow}</Editable></div>
        <h1>
          <Editable path="hero.title" isPreview={isPreview}>{hero.title}</Editable>
          <br/>
          <Editable as="em" path="hero.titleHighlight" isPreview={isPreview}>{hero.titleHighlight}</Editable>
        </h1>
        <p><Editable path="hero.description" isPreview={isPreview}>{hero.description}</Editable></p>
        <div className={styles.actions}>
          <EditableLink href="/registro" className={styles.primary} isPreview={isPreview} section="hero">
            <Editable path="hero.ctaPrimary" isPreview={isPreview}>{hero.ctaPrimary}</Editable> <i className="bi bi-arrow-right"/>
          </EditableLink>
          <EditableLink href="#beneficios" className={styles.secondary} isPreview={isPreview} section="hero">
            <Editable path="hero.ctaSecondary" isPreview={isPreview}>{hero.ctaSecondary}</Editable>
          </EditableLink>
        </div>
        <div className={styles.proof}>{proofs.map((p, i) => <span key={i}>● <Editable path={`hero.proofs.${i}`} isPreview={isPreview}>{p}</Editable></span>)}</div>
      </div>
      <div className={styles.visual}>
        <div className={styles.colorRail}/>
        <div className={styles.photo}>
          <Image src={hero.imageUrl} alt={hero.imageAlt || "Mundo CRM"} fill priority sizes="(max-width:900px) 92vw, 50vw"/>
          <div className={styles.shade}/>
          <div className={styles.metric} onClick={sectionClick("hero")}>
            <div>
              <span><Editable path="hero.metricLabel" isPreview={isPreview}>{hero.metricLabel}</Editable></span>
              <small><Editable path="hero.metricTag" isPreview={isPreview}>{hero.metricTag}</Editable></small>
            </div>
            <strong><Editable path="hero.metricValue" isPreview={isPreview}>{hero.metricValue}</Editable></strong>
            <div className={styles.bars}>{[42,68,52,84,64,92,76].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div>
            <footer>
              <b><Editable path="hero.metricGrowth" isPreview={isPreview}>{hero.metricGrowth}</Editable></b>
              <span><Editable path="hero.metricPeriod" isPreview={isPreview}>{hero.metricPeriod}</Editable></span>
            </footer>
          </div>
        </div>
        <div className={styles.lead} onClick={sectionClick("hero")}>
          <b>{String(hero.leadName || "?").slice(0, 1)}{(String(hero.leadName || "?").split(" ")[1] || "").slice(0, 1)}</b>
          <span>
            <small><Editable path="hero.leadLabel" isPreview={isPreview}>{hero.leadLabel}</Editable></small>
            <strong><Editable path="hero.leadName" isPreview={isPreview}>{hero.leadName}</Editable></strong>
          </span>
          <i className="bi bi-check2"/>
        </div>
      </div>
    </section>

    <section className={styles.companies} id="companias" onClick={sectionClick("companies")}>
      <div className={styles.companyTitle}>
        <span><Editable path="companies.eyebrow" isPreview={isPreview}>{companiesCopy.eyebrow}</Editable></span>
        <strong><Editable path="companies.title" isPreview={isPreview}>{companiesCopy.title}</Editable></strong>
      </div>
      <div className={styles.viewport}><div className={styles.track}>{[...companies,...companies].map((co,i)=><Logo company={co} key={co[0]+i}/>)}</div></div>
    </section>

    <section className={styles.benefits} id="beneficios" onClick={sectionClick("benefits")}>
      <div className={styles.heading}>
        <span><Editable path="benefits.eyebrow" isPreview={isPreview}>{benefits.eyebrow}</Editable></span>
        <h2>
          <Editable path="benefits.title" isPreview={isPreview}>{benefits.title}</Editable>
          <br/>
          <Editable path="benefits.titleHighlight" isPreview={isPreview}>{benefits.titleHighlight}</Editable>
        </h2>
      </div>
      <div className={styles.grid}>
        {(benefits.items || []).map((b, i) => (
          <article key={`${b.title}-${i}`} onClick={sectionClick("benefits")}>
            <small>0{i+1}</small>
            <i className={`bi ${b.icon}`}/>
            <h3><Editable path={`benefits.items.${i}.title`} isPreview={isPreview}>{b.title}</Editable></h3>
            <p><Editable path={`benefits.items.${i}.description`} isPreview={isPreview}>{b.description}</Editable></p>
          </article>
        ))}
      </div>
    </section>

    <section className={styles.cta} onClick={sectionClick("cta")}>
      <span><Editable path="cta.eyebrow" isPreview={isPreview}>{cta.eyebrow}</Editable></span>
      <h2>
        <Editable path="cta.title" isPreview={isPreview}>{cta.title}</Editable>
        <br/>
        <Editable path="cta.titleHighlight" isPreview={isPreview}>{cta.titleHighlight}</Editable>
      </h2>
      <EditableLink href="/registro" isPreview={isPreview} section="cta">
        <Editable path="cta.buttonLabel" isPreview={isPreview}>{cta.buttonLabel}</Editable> <i className="bi bi-arrow-right"/>
      </EditableLink>
    </section>

    <footer className={styles.footer} onClick={sectionClick("footer")}>
      <Brand name={header.brandName} tag={header.brandTag}/>
      <p><Editable path="footer.tagline" isPreview={isPreview}>{footer.tagline}</Editable></p>
      <span><Editable path="footer.copyright" isPreview={isPreview}>{footer.copyright}</Editable></span>
    </footer>
  </main>;
}
