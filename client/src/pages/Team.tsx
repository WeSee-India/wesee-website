import { useEffect, useRef, useState } from "react";
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
    title: "Head of AI Engineering",
    bio: "Takeshi  leads WeSee's AI engineering team, overseeing the development of conversational AI agents, workflow automation systems, and custom integrations. With deep expertise in LangChain, OpenAI, and enterprise AI architecture, she ensures every solution is production-ready.",
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

const TeamMarqueeHero = () => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [loopW, setLoopW] = useState(0);
  const offsetX = useMotionValue(0);
  const cardSmoothRef = useRef(new WeakMap<HTMLElement, { y: number; r: number }>());

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setLoopW(el.offsetWidth));
    ro.observe(el);
    setLoopW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (loopW <= 0) return;
    offsetX.set(0);
    const controls = animate(offsetX, [0, -loopW], {
      ease: "linear",
      duration: loopW / MARQUEE_SPEED_PX_PER_SEC,
      repeat: Infinity,
      repeatType: "loop",
    });
    return () => controls.stop();
  }, [loopW, offsetX]);

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
      el.style.transform = `translateY(${sm.y}px) rotate(${sm.r}deg)`;
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
        className="relative w-full overflow-hidden pb-10 sm:pb-14"
        style={{ paddingTop: MARQUEE_VIEWPORT_PAD_TOP }}
      >
        <motion.div className="flex w-max will-change-transform" style={{ x: offsetX }}>
          <div ref={measureRef} className="flex shrink-0 items-end gap-3 sm:gap-5 md:gap-6 px-3 sm:px-6">
            {marqueePeople.map((person, i) => (
              <div
                key={`a-${i}`}
                data-marquee-card
                className="shrink-0 origin-bottom will-change-transform"
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
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex shrink-0 items-end gap-3 sm:gap-5 md:gap-6 px-3 sm:px-6" aria-hidden>
            {marqueePeople.map((person, i) => (
              <div
                key={`b-${i}`}
                data-marquee-card
                className="shrink-0 origin-bottom will-change-transform"
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
                    loading="lazy"
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

  return (
    <div style={{ paddingTop: 64 }}>
      <div className="section-padding">
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span
              className="hidden sm:inline-block"
              style={{
                width: 24,
                height: 1,
                background: "#C9A84C",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#999999",
              }}
            >
              (01) TEAM
            </span>
          </div>
          <TextReveal as="h1" style={{ fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.15 }} stagger={0.06} onScroll={false}>
            We are a community of builders.
          </TextReveal>
          <p className="body-text gsap-reveal" style={{ marginTop: 24, maxWidth: 640 }}>
            To work at WeSee means to build intelligent systems in an ambitious and relentless spirit — transcending industries and disciplines.
          </p>
        </div>
      </div>

      {/* 2x2 team collage — hover: blurred bg + smaller sharp center image */}
      <div className="container">
        <div className="grid grid-cols-2 gap-1 sm:gap-2">
          {[
            { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80", h: "clamp(180px, 30vw, 320px)" },
            { src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80", h: "clamp(140px, 22vw, 220px)" },
            { src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80", h: "clamp(140px, 22vw, 220px)" },
            { src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80", h: "clamp(180px, 30vw, 320px)" },
          ].map((img, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl bg-[#E8E8E5] cursor-pointer"
              style={{ height: img.h, borderRadius: 16 }}
            >
              {/* Blurred background — same image, visible on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-out"
                aria-hidden
              >
                <img
                  src={img.src}
                  alt=""
                  className="w-full h-full object-cover block scale-105"
                  style={{ filter: "blur(14px)" }}
                />
              </div>
              {/* Sharp center image — shrinks on hover to reveal blurred bg */}
              <img
                src={img.src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover block transition-transform duration-400 ease-out group-hover:scale-95 rounded-[20px]"
                style={{ transformOrigin: "center center" }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

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
