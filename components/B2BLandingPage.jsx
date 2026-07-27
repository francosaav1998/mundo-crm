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

export default function B2BLandingPage({ content = DEFAULT_B2B_CONTENT }) {
  const c = content || DEFAULT_B2B_CONTENT;
  const { header, hero, companies: companiesCopy, benefits, cta, footer } = c;
  const proofs = Array.isArray(hero.proofs) ? hero.proofs : [];

  return <main className={styles.page}>
    <header className={styles.header}>
      <Link href="/" className={styles.brand}><b>m</b><span><strong>{header.brandName}</strong><small>{header.brandTag}</small></span></Link>
      <nav>{(header.navLinks || []).map((l) => <a key={l.id} href={`#${l.id}`}>{l.label}</a>)}</nav>
      <Link href="/dashboard/login" className={styles.login}>{header.loginLabel} <i className="bi bi-arrow-up-right"/></Link>
    </header>

    <section className={styles.hero} id="solucion">
      <div className={styles.copy}>
        <div className={styles.eyebrow}><span/> {hero.eyebrow}</div>
        <h1>{hero.title}<br/><em>{hero.titleHighlight}</em></h1>
        <p>{hero.description}</p>
        <div className={styles.actions}>
          <Link href="/registro" className={styles.primary}>{hero.ctaPrimary} <i className="bi bi-arrow-right"/></Link>
          <a href="#beneficios" className={styles.secondary}>{hero.ctaSecondary}</a>
        </div>
        <div className={styles.proof}>{proofs.map((p) => <span key={p}>● {p}</span>)}</div>
      </div>
      <div className={styles.visual}>
        <div className={styles.colorRail}/>
        <div className={styles.photo}>
          <Image src={hero.imageUrl} alt={hero.imageAlt || "Mundo CRM"} fill priority sizes="(max-width:900px) 92vw, 50vw"/>
          <div className={styles.shade}/>
          <div className={styles.metric}>
            <div><span>{hero.metricLabel}</span><small>{hero.metricTag}</small></div>
            <strong>{hero.metricValue}</strong>
            <div className={styles.bars}>{[42,68,52,84,64,92,76].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div>
            <footer><b>{hero.metricGrowth}</b><span>{hero.metricPeriod}</span></footer>
          </div>
        </div>
        <div className={styles.lead}><b>{String(hero.leadName || "?").slice(0, 1)}{(String(hero.leadName || "?").split(" ")[1] || "").slice(0, 1)}</b><span><small>{hero.leadLabel}</small><strong>{hero.leadName}</strong></span><i className="bi bi-check2"/></div>
      </div>
    </section>

    <section className={styles.companies} id="companias">
      <div className={styles.companyTitle}><span>{companiesCopy.eyebrow}</span><strong>{companiesCopy.title}</strong></div>
      <div className={styles.viewport}><div className={styles.track}>{[...companies,...companies].map((co,i)=><Logo company={co} key={co[0]+i}/>)}</div></div>
    </section>

    <section className={styles.benefits} id="beneficios">
      <div className={styles.heading}><span>{benefits.eyebrow}</span><h2>{benefits.title}<br/>{benefits.titleHighlight}</h2></div>
      <div className={styles.grid}>{(benefits.items || []).map((b,i)=><article key={`${b.title}-${i}`}><small>0{i+1}</small><i className={`bi ${b.icon}`}/><h3>{b.title}</h3><p>{b.description}</p></article>)}</div>
    </section>

    <section className={styles.cta}><span>{cta.eyebrow}</span><h2>{cta.title}<br/>{cta.titleHighlight}</h2><Link href="/registro">{cta.buttonLabel} <i className="bi bi-arrow-right"/></Link></section>
    <footer className={styles.footer}><Brand name={header.brandName} tag={header.brandTag}/><p>{footer.tagline}</p><span>{footer.copyright}</span></footer>
  </main>;
}
