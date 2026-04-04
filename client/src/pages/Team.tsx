import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { animate, motion, useAnimationFrame, useMotionValue } from "framer-motion";
import TextReveal from "@/components/TextReveal";
import TiltCard from "@/components/TiltCard";
import StaggerReveal from "@/components/StaggerReveal";
import MagneticButton from "@/components/MagneticButton";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const directors = [
  {
    name: "Harsh khanna",
    title: "Founder & CEO",
    bio: "Harsh founded WeSee in 2024 with the belief that AI automation should be accessible, measurable, and transformative. With a background in product engineering and growth marketing, he leads WeSee's strategic direction and client relationships.",
    email: "harsh.khanna@weseegpt.com",
    photo: "/client/harsh.webp",
    linkedin: "https://www.linkedin.com/in/harshkhanna96/",
  },
  {
    name: "Takeshi",
    title: "Co Founder & Partner",
    bio: "Takeshi is a passionate crypto and blockchain enthusiast who leads Japanese client management at WeSee, ensuring strong relationships, clear communication, and seamless collaboration. He understands how to align business vision with client expectations, especially in fast-moving and innovation-driven markets.",
      email: "takeshi.shoyama@weseegpt.com",
      photo: "/client/takeshi.webp",
    
  },
 
];

const engineeringTeam = [
  { name: "sanjeev vishwakarma", title: "Full Stack Developer", photo: "/services/sanjiv.webp" },
  { name: "yuvraj khanna", title: "graphic team lead", photo: "/client/yuvraj.webp" },
  { name: "deepak yadav", title: "full stack developer", photo: "/services/deepak.webp" },
  { name: "pranav ", title: "UX Designer", photo: "/client/pranav.webp" },
  { name: "virendra singh", title: "full stack developer", photo: "/client/virendra.png" },
  { name: "mani bajpai", title: "blockchain developer", photo: "/client/manii.png" },
 
  { name: "Shravani shinde", title: "ai developer", photo: "/client/shravani.png" },
  { name: "Anjali Singh", title: "ui/ux designer", photo: "/client/anjali.png" },
  { name: "suhani tiwari", title: "full stack developer", photo: "/client/suhani.png" },
  
];

const marqueePeople = engineeringTeam.map((m) => ({
  name: m.name,
  title: m.title,
  photo: m.photo,
}));

const ARC_MAX_LIFT = 36;
const ARC_MAX_TILT = 7;
/** Top padding so center lift + tilt stays inside overflow clip */
const MARQUEE_VIEWPORT_PAD_TOP = ARC_MAX_LIFT + 24;
/** Horizontal speed (px per second) for the marquee */
const MARQUEE_SPEED_PX_PER_SEC = 42;
/** Repeat the team cycle this many times in one loop strip (grown until strip ≥ viewport) */
const MAX_STRIP_COPIES = 12;

function repeatMarqueePeople(people: typeof marqueePeople, copies: number) {
  if (copies <= 1) return people;
  return Array.from({ length: copies }, () => people).flat();
}

function wrapMarqueeOffset(x: number, loopWidth: number): number {
  if (loopWidth <= 0) return x;
  let v = x;
  while (v <= -loopWidth) v += loopWidth;
  while (v > 0) v -= loopWidth;
  return v;
}

const TeamMarqueeHero = () => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [stripCopies, setStripCopies] = useState(() =>
    Math.max(2, Math.min(MAX_STRIP_COPIES, Math.ceil(1400 / Math.max(160, marqueePeople.length * 120))))
  );
  const stripPeople = useMemo(
    () => repeatMarqueePeople(marqueePeople, stripCopies),
    [stripCopies]
  );

  const [loopW, setLoopW] = useState(0);
  const loopWRef = useRef(0);
  const offsetX = useMotionValue(0);
  const cardSmoothRef = useRef(new WeakMap<HTMLElement, { y: number; r: number }>());
  const animControlsRef = useRef<ReturnType<typeof animate> | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartClientXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);

  useEffect(() => {
    loopWRef.current = loopW;
  }, [loopW]);

  useLayoutEffect(() => {
    if (marqueePeople.length === 0) return;
    const vp = viewportRef.current;
    const row = measureRef.current;
    if (!vp || !row) return;

    let raf = 0;
    const measureAndMaybeGrow = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vw = vp.clientWidth;
        const sw = row.offsetWidth;
        if (sw > 0) {
          const next = Math.round(sw);
          setLoopW((prev) => {
            if (next <= 0) return prev;
            if (prev > 0 && Math.abs(next - prev) < 2) return prev;
            return next;
          });
        }
        if (sw > 0 && vw > 0 && sw < vw + 32) {
          setStripCopies((n) => (n < MAX_STRIP_COPIES ? n + 1 : n));
        }
      });
    };

    const ro = new ResizeObserver(measureAndMaybeGrow);
    ro.observe(vp);
    ro.observe(row);
    measureAndMaybeGrow();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [stripCopies]);

  const startMarqueeAnimation = useCallback(
    (fromOffset?: number) => {
      const w = Math.round(loopWRef.current);
      if (w <= 0) return;
      animControlsRef.current?.stop();
      const start =
        fromOffset !== undefined ? Math.round(wrapMarqueeOffset(fromOffset, w)) : 0;
      offsetX.set(start);
      const end = start - w;
      const controls = animate(offsetX, [start, end], {
        ease: "linear",
        duration: w / MARQUEE_SPEED_PX_PER_SEC,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
      });
      animControlsRef.current = controls;
    },
    [offsetX]
  );

  useEffect(() => {
    if (loopW <= 0) return;
    if (isDraggingRef.current) return;
    const vp = viewportRef.current;
    if (vp && loopW < vp.clientWidth + 16 && stripCopies < MAX_STRIP_COPIES) return;
    startMarqueeAnimation(0);
    return () => animControlsRef.current?.stop();
  }, [loopW, stripCopies, startMarqueeAnimation]);

  const onPointerDownMarquee = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const w = Math.round(loopWRef.current);
    if (w <= 0) return;
    isDraggingRef.current = true;
    animControlsRef.current?.stop();
    dragStartClientXRef.current = e.clientX;
    dragStartOffsetRef.current = offsetX.get();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMoveMarquee = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const w = Math.round(loopWRef.current);
    if (w <= 0) return;
    const dx = e.clientX - dragStartClientXRef.current;
    offsetX.set(wrapMarqueeOffset(dragStartOffsetRef.current + dx, w));
  };

  const onPointerUpMarquee = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const w = Math.round(loopWRef.current);
    if (w <= 0) return;
    const wrapped = wrapMarqueeOffset(offsetX.get(), w);
    offsetX.set(wrapped);
    startMarqueeAnimation(wrapped);
  };

  useAnimationFrame((_, delta) => {
    const dt = Math.min(delta, 48) / 1000;
    const smooth = 1 - Math.exp(-14 * dt);

    const root = viewportRef.current;
    if (!root) return;
    const cards = root.querySelectorAll<HTMLElement>("[data-marquee-card]");
    if (!cards.length) return;
    const rr = root.getBoundingClientRect();
    const midX = rr.left + rr.width / 2;
    const half = Math.max(rr.width / 2, 1);
    cards.forEach((el) => {
      const cr = el.getBoundingClientRect();
      const cx = cr.left + cr.width / 2;
      let norm = (cx - midX) / half;
      norm = Math.max(-1, Math.min(1, norm));
      const lift = (1 - norm * norm) * ARC_MAX_LIFT;
      const tilt = norm * ARC_MAX_TILT;
      const targetY = -lift;
      let sm = cardSmoothRef.current.get(el);
      if (!sm) {
        sm = { y: targetY, r: tilt };
        cardSmoothRef.current.set(el, sm);
      }
      sm.y += (targetY - sm.y) * smooth;
      sm.r += (tilt - sm.r) * smooth;
      el.style.transform = `translate3d(0, ${sm.y}px, 0) rotate(${sm.r}deg)`;
    });
  });

  return (
    <div
      className="relative mt-10 w-full overflow-hidden rounded-[2rem] text-[#1a1a1a]"
      style={{ backgroundColor: "#FCFAF2" }}
    >
      <div className="relative px-4 pb-6 pt-14 sm:px-8 sm:pb-10 sm:pt-20 md:px-12">
       

        <div className="mx-auto max-w-4xl text-center">
          <span
            className="inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-wide sm:text-sm"
            style={{ backgroundColor: "#F5E6A8", color: "#3d3d2a" }}
          >
            Meet the people behind WeSee
          </span>
          <h2
            className="mt-6 font-semibold leading-[1.08] tracking-tight"
            style={{ fontSize: "clamp(2rem, 5.5vw, 3.75rem)" }}
          >
            Build with a team that ships.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#4a4a4a] sm:text-lg">
            From leadership to engineering and design, we combine craft and automation so your product moves forward
            without friction.
          </p>
        </div>
      </div>

      <div
        ref={viewportRef}
        role="region"
        aria-label="Team gallery — drag horizontally to explore"
        title="Drag to scroll"
        className="relative w-full cursor-grab touch-none overflow-hidden pb-10 select-none active:cursor-grabbing sm:pb-14"
        style={{ paddingTop: MARQUEE_VIEWPORT_PAD_TOP }}
        onPointerDown={onPointerDownMarquee}
        onPointerMove={onPointerMoveMarquee}
        onPointerUp={onPointerUpMarquee}
        onPointerCancel={onPointerUpMarquee}
      >
        <motion.div
          className="flex w-max will-change-transform"
          style={{ x: offsetX, backfaceVisibility: "hidden" }}
        >
          <div ref={measureRef} className="flex shrink-0 items-end gap-3 sm:gap-5 md:gap-6 px-3 sm:px-6">
            {stripPeople.map((person, i) => (
              <div
                key={`a-${i}-${person.photo}`}
                data-marquee-card
                className="shrink-0 origin-bottom will-change-transform [backface-visibility:hidden]"
                style={{ width: "clamp(7.5rem, 22vw, 11rem)" }}
              >
                <div
                  className="overflow-hidden shadow-lg shadow-black/5"
                  style={{
                    aspectRatio: "9 / 16",
                    borderRadius: "clamp(1.25rem, 4vw, 2rem)",
                  }}
                >
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="h-full w-full object-cover object-[center_28%]"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex shrink-0 items-end gap-3 sm:gap-5 md:gap-6 px-3 sm:px-6" aria-hidden>
            {stripPeople.map((person, i) => (
              <div
                key={`b-${i}-${person.photo}`}
                data-marquee-card
                className="shrink-0 origin-bottom will-change-transform [backface-visibility:hidden]"
                style={{ width: "clamp(7.5rem, 22vw, 11rem)" }}
              >
                <div
                  className="overflow-hidden shadow-lg shadow-black/5"
                  style={{
                    aspectRatio: "9 / 16",
                    borderRadius: "clamp(1.25rem, 4vw, 2rem)",
                  }}
                >
                  <img
                    src={person.photo}
                    alt=""
                    className="h-full w-full object-cover object-[center_28%]"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default function Team() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const localTriggers: ScrollTrigger[] = [];
    const timer = setTimeout(() => {
      const reveals = document.querySelectorAll(".gsap-reveal");
      reveals.forEach((el) => {
        const anim = gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" }
        });
        if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
      });
    }, 50);
    return () => { clearTimeout(timer); localTriggers.forEach(t => t.kill()); };
  }, []);

  const teamHeroCollage = [
    {
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80",
      alt: "Team collaborating around a table",
      objectPosition: "center 38%",
    },
    {
      src: "/tropy.jpg",
      alt: "Discussion and gestures in a meeting",
      objectPosition: "center 55%",
    },
    {
      src: "/team.jpg",
      alt: "WeSee team celebrating a win",
      objectPosition: "center 42%",
    },
    {
      src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=80",
      alt: "Colleagues working together",
      objectPosition: "center 40%",
    },
  ] as const;

  return (
    <div style={{ paddingTop: 64 }}>
      {/* Hero: soft backdrop + headline beside collage on large screens */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[min(72vh,640px)] bg-gradient-to-b from-[#F5F3EE] via-[#FAFAF8] to-transparent"
          aria-hidden
        />
        <div className="section-padding relative pb-6 sm:pb-10">
          <div className="container">
            <div className="grid items-start gap-10 lg:gap-12 xl:grid-cols-12 xl:gap-14">
              <div className="xl:col-span-5 xl:pt-2">
                <TextReveal
                  as="h1"
                  style={{
                    fontSize: "clamp(40px, 5.2vw, 68px)",
                    fontWeight: 700,
                    color: "#1A1A1A",
                    lineHeight: 1.12,
                  }}
                  stagger={0.06}
                  onScroll={false}
                >
                  We are a community of builders.
                </TextReveal>
                <p
                  className="gsap-reveal mt-5 text-[15px] leading-relaxed text-[#5A5A5A] sm:text-base sm:leading-relaxed"
                  style={{ maxWidth: 520 }}
                >
                  We ship intelligent systems with an ambitious, collaborative spirit — across industries, time zones, and disciplines.
                </p>
                <p
                  className="gsap-reveal mt-4 text-[13px] font-medium uppercase tracking-[0.14em] text-[#9A9A9A]"
                  style={{ maxWidth: 520 }}
                >
                  Engineering · Design · Operations
                </p>
              </div>

              {/* 2×2 collage — uniform tiles so no cell looks “chopped”; hover: blurred bg + sharp inset */}
              <div className="xl:col-span-7">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  {teamHeroCollage.map((img, i) => (
                    <div
                      key={img.src}
                      className="group relative aspect-[5/4] cursor-pointer overflow-hidden rounded-2xl bg-[#E8E8E5] shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.04] sm:aspect-[4/3] sm:rounded-[1.25rem]"
                    >
                      <div
                        className="absolute inset-0 opacity-0 transition-opacity duration-400 ease-out group-hover:opacity-100"
                        aria-hidden
                      >
                        <img
                          src={img.src}
                          alt=""
                          className="block h-full w-full scale-105 object-cover"
                          style={{ filter: "blur(14px)", objectPosition: img.objectPosition }}
                        />
                      </div>
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="absolute inset-0 block h-full w-full object-cover transition-transform duration-400 ease-out group-hover:scale-95 sm:rounded-[1.25rem]"
                        style={{ transformOrigin: "center center", objectPosition: img.objectPosition }}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership — TiltCard + hover grayscale-to-color */}
      <section className="section-padding">
        <div className="container">
          <TextReveal as="h2" className="section-heading" stagger={0.05}>
            Leadership.
          </TextReveal>
          <StaggerReveal stagger={0.15} y={30} style={{ marginTop: 48 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
              {directors.map((d) => (
                <TiltCard key={d.name} maxTilt={5} scale={1.01}>
                  <div className="group">
                    <div className="group relative overflow-hidden cursor-pointer rounded-2xl w-full max-w-[320px] md:max-w-[420px] mx-auto" style={{ aspectRatio: "280/400", borderRadius: 16 }}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-out" aria-hidden>
                        <img src={d.photo} alt="" className="w-full h-full object-cover block scale-105" style={{ filter: "blur(14px)" }} />
                      </div>
                      <img
                        src={d.photo}
                        alt={d.name}
                        className="absolute inset-0 w-full h-full object-cover block transition-transform duration-400 ease-out group-hover:scale-90"
                        style={{ transformOrigin: "center center" }}
                      />
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 20, fontWeight: 600, color: "#1A1A1A" }}>{d.name}</div>
                      <div style={{ fontSize: 14, fontWeight: 400, color: "#888888", marginTop: 4 }}>{d.title}</div>
                      <p style={{ fontSize: 14, fontWeight: 400, color: "#3A3A3A", lineHeight: 1.7, marginTop: 12 }}>{d.bio}</p>
                      <div className="flex flex-col items-start gap-2" style={{ marginTop: 12 }}>
                        {"linkedin" in d && d.linkedin ? (
                          <a href={d.linkedin} target="_blank" rel="noopener noreferrer" className="cta-link" style={{ fontSize: 13, color: "#1A1A1A" }}>
                            LinkedIn
                          </a>
                        ) : null}
                        <span style={{ fontSize: 13, color: "#888888" }}>{d.email}</span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </StaggerReveal>
        </div>
      </section>

      {/* Team — marquee gallery */}
      <section className="section-padding" style={{ borderTop: "1px solid #EEEEEE" }}>
        <div className="container">
          <TeamMarqueeHero />
        </div>
      </section>

      <section className="section-padding" style={{ borderTop: "1px solid #EEEEEE" }}>
        <div className="container">
          <Link href="/careers">
            <MagneticButton as="div" className="cta-link" style={{ fontSize: 18, fontWeight: 600, cursor: "pointer" }} strength={0.3}>
              Join our team +
            </MagneticButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
