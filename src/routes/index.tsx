import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";

import { submitContactAudit } from "@/server-fn/submit-contact-audit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Race Digital | Local business cleanup" },
      {
        name: "description",
        content:
          "I make local businesses look better online. Websites, photos, menus, social pages, and Google listings cleaned up for businesses that already do good work — but do not look it online.",
      },
      {
        property: "og:title",
        content: "Race Digital | Local business cleanup",
      },
      {
        property: "og:description",
        content:
          "I make local businesses look better online. Websites, photos, menus, social pages, and Google listings cleaned up so people trust what they see.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

function useScrollReveal() {
  useEffect(() => {
    const sections = document.querySelectorAll("main section.reveal");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      sections.forEach((s) => s.classList.add("reveal-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.09, rootMargin: "0px 0px -8% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
}

function Home() {
  useScrollReveal();
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Services />
        <Packages />
        <IdealClients />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("#top");
  const links = [
    ["Services", "#services"],
    ["Pricing", "#packages"],
    ["Contact", "#contact"],
  ] as const;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = ["#top", ...links.map(([, href]) => href)];
    const targets = sections
      .map((id) => document.querySelector(id))
      .filter((n): n is Element => Boolean(n));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-42% 0px -50% 0px", threshold: 0.01 },
    );

    targets.forEach((target) => io.observe(target));
    return () => io.disconnect();
  }, []);

  return (
    <header className={`font-ui site-header sticky top-0 z-50 ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-container flex h-[3.5rem] items-center justify-between gap-6 md:h-[4rem]">
        <a
          href="#top"
          className="text-[1rem] font-bold tracking-[-0.02em] text-[var(--foreground)] md:text-[1.035rem]"
        >
          Race Digital
        </a>
        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className={`nav-link text-[0.9075rem] font-semibold tracking-[0.02em] md:text-[0.925rem] ${activeSection === href ? "is-active" : ""}`}
              aria-current={activeSection === href ? "page" : undefined}
            >
              {label}
            </a>
          ))}
          <a href="#contact" className="btn-compact-primary">
            Get a quick audit
          </a>
        </nav>
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          className="rounded-[var(--radius)] border border-[var(--border-strong)] px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--foreground)] md:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open ? (
        <div className="border-t border-border bg-background px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className={`nav-link text-[0.9rem] font-semibold ${activeSection === href ? "is-active" : ""}`}
                aria-current={activeSection === href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ))}
            <a
              href="#contact"
              className="btn-compact-primary mt-1 justify-center text-center"
              onClick={() => setOpen(false)}
            >
              Get a quick audit
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function HeroSpotlight() {
  return (
    <div className="hero-spotlight-shell">
      <div className="hero-spotlight-inner grid grid-cols-1 sm:grid-cols-2">
        <div className="hero-panel-before">
          <div className="hero-panel-head">
            <span className="spotlight-label">Before</span>
          </div>
          <p className="hero-panel-lead hero-panel-lead-muted mt-[1.2rem]">
            Outdated. Messy. Hard to trust.
          </p>
          <div className="hero-mock-stack hero-mock-before">
            <span className="hero-mock-line hero-mock-line-1" />
            <span className="hero-mock-line hero-mock-line-2" />
            <span className="hero-mock-line hero-mock-line-3" />
            <div className="hero-mock-block-row">
              <span className="hero-mock-block hero-mock-block-wide" aria-hidden />
              <span className="hero-mock-block hero-mock-block-narrow" aria-hidden />
            </div>
            <p className="hero-mock-caption">
              <span className="hero-mock-caption-rule" aria-hidden />
              Last updated: 2016
            </p>
          </div>
        </div>
        <div className="hero-panel-after">
          <div className="hero-panel-head">
            <span className="spotlight-label spotlight-label-active">After</span>
          </div>
          <p className="hero-after-lead mt-[1.2rem]">Clean. Current. Easy to contact.</p>
          <div className="hero-mock-stack hero-mock-after">
            <span className="hero-mock-line hero-mock-line-1" />
            <span className="hero-mock-line hero-mock-line-2" />
            <span className="hero-mock-line hero-mock-line-3" />
            <div className="hero-mock-after-foot">
              <span className="cta-mini-pill">Book / call</span>
              <p className="hero-mock-after-hint">Hours visible. Photos current.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="hero-section border-b border-border">
      <div className="section-pad-y site-container">
        <div className="flex flex-col gap-11 lg:flex-row lg:items-start lg:justify-between lg:gap-[4.75rem]">
          <div className="max-w-2xl flex-1 lg:max-w-[min(40rem,calc(100%-1rem))]">
            <h1 className="heading-page max-w-[18ch]">
              I make local businesses look better online.
            </h1>
            <p className="section-intro mt-7 max-w-xl text-pretty text-[var(--muted-foreground)] lg:max-w-2xl">
              Websites, photos, menus, social pages, and Google listings cleaned up for businesses
              doing good work in real life but not showing it online.
            </p>
            <div className="mt-10 flex flex-wrap gap-3.5 md:gap-4">
              <a href="#contact" className="btn-primary">
                Get a quick audit
              </a>
              <a href="#services" className="btn-secondary">
                See services
              </a>
            </div>
            <p className="trust-micro mt-6 max-w-md md:mt-7">
              Simple fixes. Clear prices. Built for local businesses.
            </p>
          </div>
          <div className="w-full max-w-lg shrink-0 lg:max-w-[27rem] lg:pt-1">
            <HeroSpotlight />
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const list = [
    "Outdated website",
    "Stale social pages",
    "Weak or blurry photos",
    "Messy menus or flyers",
    "Thin Google listing",
    "Inconsistent branding",
  ];
  return (
    <section className="reveal border-b border-border">
      <div className="section-pad-y site-container">
        <p className="section-eyebrow mb-3">RECOGNITION</p>
        <h2 className="heading-section max-w-[22ch]">
          People judge your business before they walk in.
        </h2>
        <p className="section-intro mt-5 max-w-2xl text-[var(--muted-foreground)]">
          Most owners are busy running the business. But before people call, book, order, or visit,
          they check what they see online. If it looks abandoned, trust drops fast.
        </p>
        <ul className="problem-board reveal-stagger mt-10 grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {list.map((item) => (
            <li key={item} className="flex items-start gap-4 bg-card text-[var(--foreground)]">
              <span className="list-problem-marker" aria-hidden />
              <span className="pt-0.5 font-medium tracking-[0.01em]">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Services() {
  const items = [
    {
      cat: "WEB",
      t: "Simple website / landing page",
      d: "A clean page that tells people what you do, where you are, and how to contact you.",
    },
    {
      cat: "MEDIA",
      t: "Photo + video refresh",
      d: "Sharper visuals for your shop, food, work, products, space, or services.",
    },
    {
      cat: "PRINT",
      t: "Menu, flyer, and print cleanup",
      d: "Menus, flyers, and handouts that are easier to read and look more professional.",
    },
    {
      cat: "SOCIAL",
      t: "Social media visual refresh",
      d: "Profiles, covers, posts, and basic visuals cleaned up so the page doesn’t look dead.",
    },
    {
      cat: "LOCAL SEARCH",
      t: "Google Business polish",
      d: "Hours, categories, photos, services, and details cleaned up so your listing looks current.",
    },
    {
      cat: "BRAND",
      t: "Consistency cleanup",
      d: "Colors, wording, images, and basic layout brought into the same visual direction.",
    },
    {
      cat: "ONGOING",
      t: "Monthly updates",
      d: "Small updates, promos, graphics, and edits so things don’t slide back into looking old.",
    },
  ];
  return (
    <section id="services" className="reveal border-b border-border">
      <div className="section-pad-y site-container">
        <p className="section-eyebrow mb-3">SERVICES</p>
        <h2 className="heading-section">What I clean up.</h2>
        <p className="section-intro mt-5 max-w-2xl text-[var(--muted-foreground)]">
          Pick what you need. No giant agency process. No confusing marketing package.
        </p>
        <ul className="reveal-stagger mt-10 grid auto-rows-fr gap-[1.1rem] sm:grid-cols-2 md:gap-5">
          {items.map((item) => (
            <li key={item.t} className="service-card-service p-6 md:p-7 lg:p-[1.75rem]">
              <p className="service-cat">{item.cat}</p>
              <h3 className="mt-2.5">{item.t}</h3>
              <p className="service-card-body mt-2 flex-1 text-[var(--muted-foreground)]">
                {item.d}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Packages() {
  const tiers = [
    {
      name: "Starter Cleanup",
      range: "$500–$900",
      blurb: "A focused cleanup for businesses that only need the basics fixed.",
      cta: "Ask about starter",
      bullets: [
        "Simple landing page or site refresh",
        "Basic visual cleanup",
        "Social profile refresh",
        "Google Business polish",
      ],
    },
    {
      name: "Full Cleanup",
      range: "$1,000–$2,000",
      blurb:
        "The full cleanup for businesses whose website, visuals, menus, social pages, and listings all need to look more current.",
      featured: true,
      cta: "Request full cleanup",
      bullets: [
        "Website or landing page",
        "Photos or video",
        "Menu / flyer cleanup",
        "Social visuals",
        "Google Business polish",
        "Basic brand consistency",
      ],
    },
    {
      name: "Monthly Support",
      range: "$100–$500/mo",
      blurb: "Light ongoing help to keep your pages, promos, hours, and visuals up to date.",
      cta: "Ask about monthly",
      bullets: ["Posts and graphics", "Edits and promos", "Website tweaks", "Seasonal refreshes"],
    },
  ] as const;

  return (
    <section id="packages" className="reveal border-b border-border">
      <div className="section-pad-y site-container">
        <p className="section-eyebrow mb-3">PRICING</p>
        <h2 className="heading-section">Simple packages.</h2>
        <p className="section-intro mt-5 max-w-2xl text-[var(--muted-foreground)]">
          Clear ranges. Final price depends on what needs fixing.
        </p>
        <div className="reveal-stagger mt-10 grid gap-6 md:gap-7 lg:grid-cols-3 lg:items-stretch">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`simple-card flex h-full flex-col p-7 md:p-8 ${tier.featured ? "simple-card-featured md:col-span-2 lg:col-span-1" : ""}`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-x-6">
                <div>
                  {tier.featured ? <span className="badge-featured">RECOMMENDED</span> : null}
                  <h3 className="mt-2.5 tracking-[-0.03em] md:mt-3">{tier.name}</h3>
                </div>
                <p className="price-figure sm:text-right">{tier.range}</p>
              </div>
              <p className="mt-3 leading-relaxed text-[var(--muted-foreground)]">{tier.blurb}</p>
              <ul className="mt-7 space-y-3 leading-snug">
                {tier.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="pkg-dot" aria-hidden />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`btn-package mt-auto ${tier.featured ? "btn-package-highlight" : "btn-package-soft"}`}
              >
                {tier.cta}
              </a>
            </article>
          ))}
        </div>
        <p className="section-intro mt-9 max-w-2xl text-[var(--muted-foreground)] md:mt-10">
          No bloated retainers. No mystery packages. Scope first, then price.
        </p>
      </div>
    </section>
  );
}

function IdealClients() {
  const chips = [
    "restaurants",
    "barbers",
    "salons",
    "gyms",
    "auto shops",
    "contractors",
    "cafés",
    "local shops",
  ];
  return (
    <section className="reveal border-b border-border">
      <div className="section-pad-y site-container">
        <p className="section-eyebrow mb-3">FIT</p>
        <h2 className="heading-section">Best fit for local businesses.</h2>
        <p className="section-intro mt-5 max-w-2xl text-[var(--muted-foreground)]">
          Built for owners who are good in real life but know the online side needs work.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 md:gap-3.5">
          {chips.map((c) => (
            <span key={c} className="chip-trade">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const CONTACT_MAIL_FALLBACK_MESSAGE = "Email could not be sent. Check Resend setup.";

function Contact() {
  const id = useId();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSubmitting(true);
    try {
      const result = await submitContactAudit({
        data: {
          name: String(fd.get("name") ?? ""),
          business: String(fd.get("business") ?? ""),
          links: String(fd.get("links") ?? ""),
          needs: String(fd.get("needs") ?? ""),
          contact: String(fd.get("contact") ?? ""),
        },
      });

      if (result && typeof result === "object" && result.ok === true) {
        form.reset();
        setSent(true);
        return;
      }

      const errText =
        result &&
        typeof result === "object" &&
        result.ok === false &&
        typeof result.error === "string"
          ? result.error.trim()
          : "";

      setSubmitError(errText || CONTACT_MAIL_FALLBACK_MESSAGE);
    } catch {
      setSubmitError(CONTACT_MAIL_FALLBACK_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <section
        id="contact"
        className="contact-section reveal reveal-visible scroll-mt-28 border-b border-border"
      >
        <div className="section-pad-y site-container">
          <h2 className="heading-section">Thanks — I got it.</h2>
          <p className="section-intro mt-5 max-w-2xl text-[var(--muted-foreground)]">
            I&apos;ll review what you sent and reply soon. If something&apos;s broken (site down or
            wrong hours on Google), mention it in a follow‑up.
          </p>
          <button
            type="button"
            className="btn-secondary mt-10"
            onClick={() => {
              setSent(false);
              setSubmitError(null);
            }}
          >
            Send another message
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="contact-section reveal scroll-mt-28 border-b border-border">
      <div className="section-pad-y site-container">
        <p className="section-eyebrow mb-3">ACTION</p>
        <h2 className="heading-section">Want a quick blunt audit?</h2>
        <p className="section-intro mt-5 max-w-2xl text-[var(--muted-foreground)]">
          Send your business name and a link. I&apos;ll tell you what I&apos;d fix first.
        </p>

        <div className="contact-layout mt-10 grid lg:grid-cols-[minmax(0,min(40rem,100%))_auto] lg:items-start lg:justify-start">
          <form
            className="simple-form contact-main-form min-w-0 w-full max-w-[min(40rem,100%)]"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="space-y-6">
              <Field label="Name" htmlFor={`${id}-name`}>
                <input id={`${id}-name`} name="name" required maxLength={80} autoComplete="name" />
              </Field>
              <Field label="Business name" htmlFor={`${id}-business`}>
                <input
                  id={`${id}-business`}
                  name="business"
                  required
                  maxLength={120}
                  autoComplete="organization"
                />
              </Field>
              <Field label="Website or social link" htmlFor={`${id}-links`}>
                <input
                  id={`${id}-links`}
                  name="links"
                  maxLength={200}
                  placeholder="https:// or @handle"
                />
              </Field>
              <Field label="What do you need help with?" htmlFor={`${id}-needs`}>
                <textarea id={`${id}-needs`} name="needs" rows={4} maxLength={1200} />
              </Field>
              <Field label="Email / phone" htmlFor={`${id}-reach`}>
                <input
                  id={`${id}-reach`}
                  name="contact"
                  required
                  maxLength={120}
                  autoComplete="email"
                  placeholder="you@email.com"
                />
              </Field>
            </div>
            {submitError ? (
              <p className="contact-form-error" role="alert">
                {submitError}
              </p>
            ) : null}
            <button
              type="submit"
              className="btn-primary mt-10 w-full min-[480px]:w-auto"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? "Sending…" : "Request audit"}
            </button>
          </form>
          <aside
            className="contact-reassurance contact-reassurance-desktop hidden lg:block"
            role="note"
            aria-label="What happens after you send the form"
          >
            <p className="contact-reassurance-kicker">Quick note</p>
            <p className="contact-reassurance-text">
              Send the link. I&apos;ll give you a straight answer on what looks weak and what
              I&apos;d fix first.
            </p>
          </aside>
        </div>
        <aside
          className="contact-reassurance contact-reassurance-mobile lg:hidden"
          role="note"
          aria-label="What happens after you send the form"
        >
          <p className="contact-reassurance-kicker">Quick note</p>
          <p className="contact-reassurance-text">
            Send the link. I&apos;ll give you a straight answer on what looks weak and what I&apos;d
            fix first.
          </p>
        </aside>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <label htmlFor={htmlFor} className="label-field">
        {label}
      </label>
      {children}
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer-site border-t py-14 text-center md:py-16">
      <p className="footer-brand">Race Digital</p>
      <p className="footer-tag">Local business cleanup</p>
      <p className="footer-copy">© 2026</p>
    </footer>
  );
}
