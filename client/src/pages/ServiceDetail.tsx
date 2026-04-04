import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { Check } from "lucide-react";
import { services } from "@/data/services";
import { getServiceImage } from "@/pages/Services";
import TextReveal from "@/components/TextReveal";
import ImageReveal from "@/components/ImageReveal";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";
import StaggerReveal from "@/components/StaggerReveal";
import FloatingParticles from "@/components/FloatingParticles";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const META_ITEMS = (service: (typeof services)[number]) =>
  [
    { label: "Service type", value: service.serviceType },
    { label: "Industries", value: service.industries.slice(0, 4).join(", ") },
    { label: "Engagement size", value: service.engagementSize },
    { label: "Status", value: service.status },
    { label: "Delivery", value: "Remote" },
  ] as const;

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
      <div className="min-h-[50vh] bg-[var(--paper)] px-4 pt-[calc(72px+48px)] pb-24 text-left md:pt-[calc(80px+56px)]">
        <p className="text-sm text-[var(--muted-foreground)] md:text-base">Service not found.</p>
        <Link href="/services" className="cta-link mt-4 inline-block text-base font-medium md:text-lg">
          ← All services
        </Link>
      </div>
    );
  }

  const heroImage = getServiceImage(service, serviceIndex);
  const metaItems = META_ITEMS(service);

  return (
    <div className="bg-[var(--paper)] text-[var(--foreground)]">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="pt-[calc(72px+12px)] md:pt-[calc(80px+20px)]">
        <div className="container">
          <div className="max-w-[40rem] text-left">
            <Link
              href="/services?view=grid"
              className="cta-link inline-flex text-sm font-medium tracking-[0.02em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] md:text-[15px]"
            >
              ← All services
            </Link>

            <div className="mt-4 border-l-[3px] border-[var(--accent)] pl-4 md:mt-5 md:pl-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)] md:text-[13px] md:tracking-[0.12em]">
                {service.category}
              </p>
            </div>

            <TextReveal
              as="h1"
              className="mt-3 text-[clamp(1.625rem,4.2vw,2.65rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[var(--foreground)] md:mt-6 md:text-[clamp(1.875rem,3.5vw,3rem)] lg:whitespace-nowrap"
              stagger={0.045}
              onScroll={false}
            >
              {service.name}
            </TextReveal>

            <p
              className="gsap-reveal mt-1.5 text-[17px] leading-[1.65] text-[var(--ink-80)] md:mt-3 md:max-w-[36rem] md:text-[18px] md:leading-[1.7]"
              style={{ fontWeight: 400 }}
            >
              {service.shortDescription}
            </p>

            <div className="mt-5 md:mt-6">
              <MagneticButton
                as="a"
                href="/book-call"
                className="shine-on-hover inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-[13px] font-medium text-[var(--foreground)] no-underline shadow-sm transition-[box-shadow,border-color] hover:border-[var(--ink-12)] hover:shadow-md md:px-6 md:py-3 md:text-sm"
                strength={0.2}
              >
                Book a discovery call
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Full-bleed on md+ (outside .container), inset on small screens — matches earlier layout */}
        <div className="relative mt-11 -translate-y-2 pb-0 md:mt-14 md:-translate-y-4">
          <div className="relative isolate mx-3 overflow-hidden rounded-2xl md:mx-0 md:rounded-none">
            <ImageReveal
              src={heroImage}
              alt={service.name}
              direction="up"
              duration={1.3}
              parallax
              parallaxAmount={44}
              zoom={false}
              className="rounded-2xl md:rounded-none"
              style={{
                width: "100%",
                height: "min(62vh, 680px)",
                minHeight: 340,
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Meta + What it is + Problem (single stacked section) ─── */}
      <section className="overflow-x-hidden border-b border-[var(--border)] bg-[var(--paper)] py-12 md:py-16">
        <div className="container">
          {/* 1 — Metadata row (full container width so columns spread edge-to-edge) */}
          <StaggerReveal stagger={0.06} y={12}>
            <div className="grid w-full grid-cols-1 gap-8 pb-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-10 sm:pb-12 lg:grid-cols-5 lg:gap-x-6 lg:gap-y-0 lg:pb-14 xl:gap-x-10 2xl:gap-x-12">
              {metaItems.map((item, i) => (
                <div key={i} className="min-w-0">
                  <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)] md:text-[11px]">
                    {item.label}
                  </div>
                  <div className="mt-2 text-[14px] font-semibold leading-snug tracking-[-0.01em] text-[var(--foreground)] md:mt-2.5 md:text-[15px]">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </StaggerReveal>

          <div
            className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 border-t border-[var(--border)]"
            aria-hidden
          />

          <div className="max-w-[52rem] text-left lg:max-w-[56rem]">
            {/* 2 — What it is */}
            <article className="gsap-reveal pt-10 md:pt-12">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)] md:text-[1.75rem]">
                What it is
              </h2>
              <p className="mt-4 text-[15px] leading-[1.8] text-[var(--ink-80)] md:mt-5 md:text-[17px] md:leading-[1.78]">
                {service.fullDescription}
              </p>
            </article>
          </div>

          {/* Full-viewport-width divider (breaks out of max-width column) */}
          <div
            className="relative left-1/2 mt-12 w-screen max-w-[100vw] -translate-x-1/2 border-t border-[var(--border)] md:mt-14"
            aria-hidden
          />

          <div className="max-w-[52rem] text-left lg:max-w-[56rem]">
            {/* 3 — The problem it solves */}
            <article className="gsap-reveal pt-12 md:pt-14">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)] md:text-[1.75rem]">
                The problem it solves
              </h2>
              <p className="mt-4 text-[15px] leading-[1.8] text-[var(--ink-80)] md:mt-5 md:text-[17px] md:leading-[1.78]">
                {service.benefits}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Mid image (grey band — no padding; image fills band) ─ */}
      <div className="border-b border-[var(--border)] bg-[var(--paper-dark)]">
        <div className="w-full overflow-hidden">
          <ImageReveal
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=2000&q=80"
            alt=""
            direction="left"
            parallax
            parallaxAmount={36}
            zoom={false}
            className="rounded-none"
            style={{
              width: "100%",
              height: "min(52vh, 620px)",
              minHeight: 320,
            }}
          />
        </div>
      </div>

      {/* ── Automation + How we build + Deliverables ─────────────── */}
      <section className="overflow-x-hidden bg-[var(--paper)] py-16 md:py-24">
        <div className="container">
          <div className="max-w-[42rem] text-left">
            <article className="gsap-reveal">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)] md:text-[1.75rem]">
                What automation brings
              </h2>
              <StaggerReveal stagger={0.05} y={10}>
                <ul className="mt-8 grid list-none gap-3 p-0 md:mt-10 md:gap-4">
                  {service.automationPoints.map((point, i) => (
                    <li
                      key={i}
                      className="flex flex-nowrap items-center gap-4 rounded-xl border border-[var(--ink-6)] bg-[var(--card)] p-4 shadow-[0_1px_0_rgba(17,19,23,0.04)] md:gap-5 md:p-5"
                    >
                      <span
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-lg bg-[var(--accent-pale)] text-[11px] font-bold leading-none tabular-nums text-[var(--accent)] md:h-10 md:w-10 md:text-xs"
                        aria-hidden
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="min-w-0 flex-1 text-left text-[15px] leading-[1.7] text-[var(--ink-80)] md:text-[16px] md:leading-[1.75]">
                        {point}
                      </p>
                    </li>
                  ))}
                </ul>
              </StaggerReveal>
            </article>
          </div>

          <div
            className="relative left-1/2 mt-16 w-screen max-w-[100vw] -translate-x-1/2 border-t border-[var(--border)] md:mt-20"
            aria-hidden
          />

          {/* Full container width — body copy uses full readable line length across the section */}
          <article className="gsap-reveal w-full max-w-none pt-16 md:pt-20">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)] md:text-[1.75rem]">
              How we build it
            </h2>
            <p className="mt-5 max-w-none text-[15px] leading-[1.8] text-[var(--ink-80)] md:mt-6 md:text-[17px] md:leading-[1.78]">
              At WeSee, we approach {service.name.toLowerCase()} with a rigorous discovery-first methodology. We begin by
              mapping your current workflows, identifying bottlenecks, and defining clear success metrics before writing a
              single line of code.
            </p>
            <p className="mt-5 max-w-none text-[15px] leading-[1.8] text-[var(--ink-80)] md:mt-6 md:text-[17px] md:leading-[1.78]">
              Our team of AI engineers and strategists then design, build, and deploy the solution in iterative sprints —
              with full transparency and client collaboration at every stage. Post-launch, we provide ongoing optimization
              and support to ensure the system scales with your business.
            </p>
          </article>

          <div
            className="relative left-1/2 mt-16 w-screen max-w-[100vw] -translate-x-1/2 border-t border-[var(--border)] md:mt-20"
            aria-hidden
          />

          <div className="max-w-[42rem] pt-16 text-left md:pt-20">
            <article className="gsap-reveal">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)] md:text-[1.75rem]">
                Deliverables
              </h2>
              <StaggerReveal stagger={0.05} y={8}>
                <ul className="mt-8 grid list-none gap-3 p-0 md:mt-10 md:gap-3.5">
                  {service.deliverables.map((d, i) => (
                    <li
                      key={i}
                      className="flex gap-3.5 rounded-xl border border-[var(--ink-6)] bg-[var(--paper-dark)]/80 px-4 py-3.5 md:gap-4 md:px-5 md:py-4"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden />
                      </span>
                      <p className="min-w-0 text-[15px] leading-[1.7] text-[var(--ink-80)] md:text-[16px]">{d}</p>
                    </li>
                  ))}
                </ul>
              </StaggerReveal>
            </article>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#0c0c0c] py-20 md:py-28">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(201,168,76,0.12),transparent)]"
          aria-hidden
        />
        <FloatingParticles count={24} color="rgba(255, 255, 255, 0.035)" maxSize={2} speed={0.12} />
        <div className="container relative z-10">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 md:text-[11px]">Next step</p>
            <TextReveal
              as="h2"
              className="mt-4 text-center text-[clamp(1.5rem,4vw,2rem)] font-semibold leading-tight tracking-[-0.03em] text-white md:text-[2.125rem]"
              stagger={0.04}
              onScroll={false}
            >
              Interested in this service?
            </TextReveal>
            <p className="gsap-reveal mx-auto mt-5 max-w-md text-[15px] leading-[1.75] text-white/55 md:mt-6 md:text-[17px]">
              Book a free discovery call and we&apos;ll show you exactly how this can work for your business.
            </p>
            <MagneticButton
              as="a"
              href="/book-call"
              className="shine-on-hover mt-9 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-[13px] font-semibold text-[#0c0c0c] no-underline shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] transition-[transform,box-shadow] hover:shadow-[0_12px_40px_-6px_rgba(0,0,0,0.45)] md:mt-10 md:px-10 md:py-4 md:text-sm"
              strength={0.22}
            >
              Book a call ↗
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ── Related ──────────────────────────────────────────────── */}
      <div className="border-t border-[var(--border)] bg-[var(--paper)] py-14 md:py-20">
        <div className="container">
          <TextReveal
            as="h2"
            className="text-xl font-semibold tracking-[-0.02em] text-[var(--foreground)] md:text-2xl"
            stagger={0.04}
            onScroll={false}
          >
            Related services
          </TextReveal>
          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-[var(--border)] ring-1 ring-[var(--border)] md:mt-12 md:grid-cols-3">
            {services
              .filter((s) => s.categoryId === service.categoryId && s.id !== service.id)
              .slice(0, 3)
              .map((s, i) => (
                <TiltCard key={s.id} maxTilt={5} scale={1.01}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="block bg-[var(--card)] transition-colors hover:bg-[var(--paper-dark)] group"
                  >
                    <div className="img-hover-zoom h-[200px] md:h-[220px]">
                      <img
                        src={getServiceImage(s, i)}
                        alt={s.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="px-4 py-4 md:px-5 md:py-5">
                      <div className="text-base font-semibold tracking-[-0.02em] text-[var(--foreground)] transition-transform group-hover:translate-x-1 md:text-lg">
                        {s.name}
                      </div>
                      <div className="mt-1 text-[11px] text-[var(--muted-foreground)] md:text-xs">{s.category}</div>
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
