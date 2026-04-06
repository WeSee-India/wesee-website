import { useEffect } from "react";
import { Link, useParams } from "wouter";
import {
  BarChart3,
  Check,
  ChevronLeft,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { defaultServiceGrowthComparisonChart, services } from "@/data/services";
import { getServiceImage } from "@/pages/Services";
import TextReveal from "@/components/TextReveal";
import ImageReveal from "@/components/ImageReveal";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";
import StaggerReveal from "@/components/StaggerReveal";
import FloatingParticles from "@/components/FloatingParticles";
import ServiceImpactMetrics from "@/components/ServiceImpactMetrics";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SCOPE_ICONS: LucideIcon[] = [
  Smartphone,
  MessageSquare,
  Workflow,
  ShieldCheck,
  BarChart3,
  LayoutDashboard,
  Sparkles,
];

function parseDeliverable(text: string): { title: string; subtitle?: string } {
  const em = text.split(/\s[—–]\s/);
  if (em.length >= 2) {
    return { title: em[0].trim(), subtitle: em.slice(1).join(" — ").trim() };
  }
  const idx = text.indexOf(" - ");
  if (idx > 0 && idx < 96) {
    return { title: text.slice(0, idx).trim(), subtitle: text.slice(idx + 3).trim() };
  }
  return { title: text };
}

function defaultServiceFaqs(service: (typeof services)[number]): { question: string; answer: string }[] {
  const name = service.name;
  return [
    {
      question: `How long does it take to implement ${name}?`,
      answer:
        "Timelines depend on scope, integrations, and your team’s availability. Most engagements begin with discovery followed by sprint-based delivery. After a discovery call we’ll give you a clear timeline and milestones.",
    },
    {
      question: "What do we need from you to get started?",
      answer:
        "Usually access to stakeholders for discovery, your current workflows, and the tools you use (CRM, ads, helpdesk, etc.). We align on success metrics and priorities before we build.",
    },
    {
      question: "Can this work with our existing systems?",
      answer:
        "Yes. We design integrations around your stack and document what’s in scope for your engagement, so data flows where you already work.",
    },
    {
      question: "Do you offer support after launch?",
      answer:
        "We offer ongoing optimization and support options so the solution keeps performing as your business grows. What’s included is spelled out in your proposal.",
    },
    {
      question: `How does pricing work for ${name}?`,
      answer:
        "Pricing reflects scope, integrations, and timeline. Book a free discovery call and we’ll walk through your needs and a tailored estimate.",
    },
  ];
}

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const service = services.find((s) => s.slug === slug);
  const serviceIndex = services.findIndex((s) => s.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    const localTriggers: ScrollTrigger[] = [];
    const timer = setTimeout(() => {
      const reveals = document.querySelectorAll(".gsap-reveal");
      reveals.forEach((el) => {
        const anim = gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
          }
        );
        if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
      });
    }, 50);
    return () => {
      clearTimeout(timer);
      localTriggers.forEach((t) => t.kill());
    };
  }, [slug]);

  if (!service) {
    return (
      <div className="container min-h-[50vh] bg-[var(--paper)] pt-[calc(72px+48px)] pb-24 text-left md:pt-[calc(80px+56px)]">
        <p className="text-sm text-neutral-600 md:text-base">Service not found.</p>
        <Link
          href="/services"
          className="mt-4 inline-flex items-center gap-1 text-base font-medium text-neutral-900 no-underline hover:opacity-80 md:text-lg"
        >
          <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
          Services
        </Link>
      </div>
    );
  }

  const heroImage = getServiceImage(service, serviceIndex);
  const growthChartConfig = service.growthComparisonChart ?? defaultServiceGrowthComparisonChart;

  /** Same vertical rhythm as the old dashed dividers (`my-8 md:my-10`). */
  const sectionGap = <div className="my-8 md:my-10" aria-hidden />;

  return (
    <div className="service-detail-page bg-white text-neutral-900 md:bg-[var(--paper)] md:text-[var(--foreground)]">
      {/* ── Hero (mobile: back → image → title → CTA) ─────── */}
      <section className="overflow-x-hidden pt-[calc(72px+8px)] md:pt-[calc(80px+20px)]">
        <div className="container">
          <Link
            href="/services?view=grid"
            className="inline-flex items-center gap-0.5 text-[15px] font-medium text-neutral-600 no-underline transition-colors hover:text-neutral-900 md:text-[var(--muted-foreground)] md:hover:text-[var(--foreground)]"
          >
            <ChevronLeft className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
            Services
          </Link>

          <div className="relative mt-6 md:mt-8">
            <div className="relative isolate overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
              <ImageReveal
                src={heroImage}
                alt={service.name}
                direction="up"
                duration={1.3}
                parallax
                parallaxAmount={44}
                zoom={false}
                className="rounded-2xl h-[min(52vh,380px)] min-h-[260px] md:h-[min(52vh,560px)] md:min-h-[320px]"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div className="mt-6 w-full md:mt-8">
            <p className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 md:mb-3 md:block md:text-[13px]">
              {service.category}
            </p>

            <h1 className="min-w-0 max-w-full break-words text-[1.65rem] font-bold leading-[1.2] tracking-[-0.03em] text-neutral-900 md:hidden">
              {service.name}
            </h1>
            <TextReveal
              as="h1"
              className="service-detail-hero-title hidden min-w-0 max-w-full break-words md:block"
              style={{ fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.15 }}
              stagger={0.06}
              onScroll={false}
            >
              {service.name}
            </TextReveal>

            <p className="mt-2 text-[15px] leading-relaxed text-neutral-600 md:mt-3 md:text-[18px] md:leading-[1.7] md:text-[var(--ink-80)]">
              {service.shortDescription}
            </p>
          </div>
        </div>
      </section>

      {/* ── What it is + problem ─────────────────────────────────── */}
      <section className="overflow-x-hidden bg-white pt-6 pb-6 md:bg-[var(--paper)] md:pt-8 md:pb-8">
        <div className="container">
          <div className="w-full text-left">
            <article className="gsap-reveal">
              <h2 className="text-lg font-bold tracking-[-0.02em] text-neutral-900 md:text-2xl md:font-semibold md:text-[var(--foreground)] md:text-[1.75rem]">
              What You Get
              </h2>
              <p className="mt-3 text-[15px] leading-[1.75] text-neutral-600 md:mt-5 md:text-[17px] md:leading-[1.78] md:text-[var(--ink-80)]">
                {service.fullDescription}
              </p>
            </article>
          </div>

          {sectionGap}

          <div className="w-full text-left">
            <article className="gsap-reveal">
              <h2 className="text-lg font-bold tracking-[-0.02em] text-neutral-900 md:text-2xl md:font-semibold md:text-[var(--foreground)] md:text-[1.75rem]">
              How This Benefits Your Business
              </h2>
              <p className="mt-3 text-[15px] leading-[1.75] text-neutral-600 md:mt-5 md:text-[17px] md:leading-[1.78] md:text-[var(--ink-80)]">
                {service.benefits}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Automation + How we build + Scope ─────────────────── */}
      <section className="overflow-x-hidden bg-white pt-4 pb-10 md:bg-[var(--paper)] md:pt-6 md:pb-24">
        <div className="container">
          {service.automationPoints.length > 0 ? (
            <>
              <div className="w-full text-left">
                <article className="gsap-reveal">
                  <h2 className="text-lg font-bold tracking-[-0.02em] text-neutral-900 md:text-2xl md:font-semibold md:text-[var(--foreground)] md:text-[1.75rem]">
                    What automation brings
                  </h2>
                  <ul className="relative mt-6 list-none space-y-0 p-0 md:mt-10">
                    {service.automationPoints.map((point, i) => {
                      const isLast = i === service.automationPoints.length - 1;
                      return (
                        <li key={i} className="relative flex gap-3 pb-6 last:pb-0 md:gap-4">
                          {!isLast && (
                            <span
                              className="absolute left-[15px] top-9 bottom-0 w-px bg-neutral-200 md:bg-[var(--border)]"
                              aria-hidden
                            />
                          )}
                          <span
                            className="relative z-[1] inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 text-neutral-900 md:border-[var(--border)] md:bg-[var(--card)]"
                            aria-hidden
                          >
                            <Check className="h-4 w-4" strokeWidth={2.5} />
                          </span>
                          <p className="min-w-0 flex-1 pt-1 text-left text-[15px] leading-[1.65] text-neutral-600 md:pt-0.5 md:text-[16px] md:leading-[1.75] md:text-[var(--ink-80)]">
                            {point}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              </div>
            </>
          ) : null}

          {sectionGap}

          <article className="gsap-reveal w-full max-w-none">
            <h2 className="text-lg font-bold tracking-[-0.02em] text-neutral-900 md:text-2xl md:font-semibold md:text-[var(--foreground)] md:text-[1.75rem]">
              Our Approach
            </h2>
            <p className="mt-3 max-w-none text-[15px] leading-[1.75] text-neutral-600 md:mt-6 md:text-[17px] md:leading-[1.78] md:text-[var(--ink-80)]">
              At WeSee, we approach {service.name.toLowerCase()} with a rigorous discovery-first methodology. We begin by
              mapping your current workflows, identifying bottlenecks, and defining clear success metrics before writing a
              single line of code.
            </p>
            <p className="mt-4 max-w-none text-[15px] leading-[1.75] text-neutral-600 md:mt-6 md:text-[17px] md:leading-[1.78] md:text-[var(--ink-80)]">
              Our team of AI engineers and strategists then design, build, and deploy the solution in iterative sprints —
              with full transparency and client collaboration at every stage. Post-launch, we provide ongoing optimization
              and support to ensure the system scales with your business.
            </p>
          </article>

          <div className="w-full mt-10 pt-0 text-left md:mt-14">
            <article className="gsap-reveal">
              <h2 className="text-lg font-bold tracking-[-0.02em] text-neutral-900 md:text-2xl md:font-semibold md:text-[var(--foreground)] md:text-[1.75rem]">
                Scope of work
              </h2>
              <StaggerReveal stagger={0.05} y={8}>
                <ul className="mt-6 flex list-none flex-col gap-5 p-0 md:mt-10 md:gap-6">
                  {service.deliverables.map((d, i) => {
                    const { title, subtitle } = parseDeliverable(d);
                    const Icon = SCOPE_ICONS[i % SCOPE_ICONS.length];
                    return (
                      <li
                        key={i}
                        className={`flex min-w-0 flex-nowrap gap-3.5 md:gap-4 ${subtitle ? "items-start" : "items-center"}`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-800 md:border-[var(--border)] md:bg-[var(--paper)] md:text-[var(--foreground)] ${subtitle ? "mt-0.5" : ""}`}
                          aria-hidden
                        >
                          <Icon className="h-[1.125rem] w-[1.125rem] md:h-5 md:w-5" strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-bold leading-snug text-neutral-900 md:text-base md:text-[var(--foreground)]">
                            {title}
                          </p>
                          {subtitle ? (
                            <p className="mt-1 text-[13px] font-normal leading-relaxed text-neutral-500 md:text-sm md:text-[var(--muted-foreground)]">
                              {subtitle}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </StaggerReveal>
            </article>
          </div>

          {sectionGap}

          <article className="gsap-reveal w-full max-w-none text-left">
            <ServiceImpactMetrics config={growthChartConfig} />
          </article>

          {sectionGap}

          <div className="w-full pt-0 text-left">
            <article className="gsap-reveal">
              <h2 className="text-lg font-bold tracking-[-0.02em] text-neutral-900 md:text-2xl md:font-semibold md:text-[var(--foreground)] md:text-[1.75rem]">
                Frequently asked questions
              </h2>
              <Accordion
                type="single"
                collapsible
                className="mt-6 w-full md:mt-10"
              >
                {(service.faqs ?? defaultServiceFaqs(service)).map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="border-neutral-200 md:border-[var(--border)]"
                  >
                    <AccordionTrigger className="text-left text-[15px] font-semibold leading-snug text-neutral-900 hover:no-underline md:text-base md:font-medium md:text-[var(--foreground)] [&[data-state=open]]:text-neutral-900 md:[&[data-state=open]]:text-[var(--foreground)]">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[15px] leading-[1.75] text-neutral-600 md:text-[16px] md:text-[var(--ink-80)]">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </article>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-neutral-200 bg-neutral-50 py-14 md:border-white/10 md:bg-[#0c0c0c] md:py-28">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(201,168,76,0.12),transparent)] max-md:hidden"
          aria-hidden
        />
        <FloatingParticles count={24} color="rgba(255, 255, 255, 0.035)" maxSize={2} speed={0.12} className="max-md:hidden" />
        <div className="relative z-10 container">
          <div className="mx-auto max-w-xl text-center md:max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 md:text-[11px] md:text-white/45">
              Next step
            </p>
            <TextReveal
              as="h2"
              className="mt-3 text-[clamp(1.35rem,4vw,2rem)] font-semibold leading-tight tracking-[-0.03em] text-neutral-900 md:mt-4 md:text-white md:text-[2.125rem]"
              stagger={0.04}
              onScroll={false}
            >
              Interested in this service?
            </TextReveal>
            <p className="gsap-reveal mx-auto mt-4 max-w-md text-[15px] leading-[1.75] text-neutral-600 md:mt-6 md:text-[17px] md:text-white/55">
              Book a free discovery call and we&apos;ll show you exactly how this can work for your business.
            </p>
            <MagneticButton
              as="a"
              href="/book-call"
              className="shine-on-hover mt-8 inline-flex items-center justify-center rounded-full border border-neutral-200 bg-neutral-900 px-8 py-3.5 text-[13px] font-semibold text-white no-underline shadow-sm transition-[transform,box-shadow] hover:bg-neutral-800 md:mt-10 md:border-0 md:bg-white md:px-10 md:py-4 md:text-sm md:font-semibold md:text-[#0c0c0c] md:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] md:hover:shadow-[0_12px_40px_-6px_rgba(0,0,0,0.45)]"
              strength={0.22}
            >
              Book a call ↗
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ── Related ──────────────────────────────────────────────── */}
      <div className="border-t border-neutral-200 bg-white py-12 md:border-[var(--border)] md:bg-[var(--paper)] md:py-20">
        <div className="container">
          <TextReveal
            as="h2"
            className="text-lg font-bold tracking-[-0.02em] text-neutral-900 md:text-2xl md:font-semibold md:text-[var(--foreground)]"
            stagger={0.04}
            onScroll={false}
          >
            Related services
          </TextReveal>
          <div className="mt-8 grid grid-cols-1 gap-3 overflow-hidden rounded-2xl md:mt-12 md:grid-cols-3 md:gap-px md:bg-[var(--border)] md:ring-1 md:ring-[var(--border)]">
            {services
              .filter((s) => s.categoryId === service.categoryId && s.id !== service.id)
              .slice(0, 3)
              .map((s, i) => (
                <TiltCard key={s.id} maxTilt={5} scale={1.01} className="h-full min-h-0">
                  <Link
                    href={`/services/${s.slug}`}
                    className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-colors hover:bg-neutral-50 md:rounded-none md:border-0 md:bg-[var(--card)] md:hover:bg-[var(--paper-dark)] group"
                  >
                    <div className="img-hover-zoom h-[180px] shrink-0 md:h-[220px]">
                      <img
                        src={getServiceImage(s, i)}
                        alt={s.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col px-4 py-4 md:px-5 md:py-5">
                      <div className="text-base font-semibold tracking-[-0.02em] text-neutral-900 transition-transform group-hover:translate-x-1 md:text-lg md:text-[var(--foreground)]">
                        {s.name}
                      </div>
                      <div className="mt-1 text-[11px] text-neutral-500 md:text-xs md:text-[var(--muted-foreground)]">
                        {s.category}
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
