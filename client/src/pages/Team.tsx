import { imgDims } from "@/data/imageSizes";
import { useEffect } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const directors = [
  {
    name: "Harsh Khanna",
    title: "Founder & CEO",
    bio: "Harsh founded WeSee in 2021 with the belief that AI automation should be accessible, measurable, and transformative. With a background in product engineering and growth marketing, he leads WeSee's strategic direction and client relationships.",
    photo: "/client/harsh.webp",
    linkedin: "https://www.linkedin.com/in/harshkhanna96/",
  },
  {
    name: "Takeshi",
    title: "Co Founder & Partner",
    bio: "Takeshi is a passionate crypto and blockchain enthusiast who leads Japanese client management at WeSee, ensuring strong relationships, clear communication, and seamless collaboration. He understands how to align business vision with client expectations, especially in fast-moving and innovation-driven markets.",
    photo: "/client/takeshi.webp",
    twitter: "https://x.com/S7_SECTORSEVEN",
  },
 
];

const engineeringTeam = [
  { name: "sanjeev vishwakarma", title: "Full Stack Developer", photo: "/services/sanjiv.webp" },
  { name: "yuvraj khanna", title: "graphic team lead", photo: "/client/yuvraj.webp" },
  { name: "deepak yadav", title: "full stack developer", photo: "/services/deepak.webp" },
  { name: "pranav ", title: "UX Designer", photo: "/client/pranav.webp" },
  { name: "virendra singh", title: "full stack developer", photo: "/client/virendra.jpg" },
  { name: "mani bajpai", title: "blockchain developer", photo: "/client/manii.webp" },
 
  { name: "Shravani shinde", title: "ai developer", photo: "/client/shravani.webp" },
  { name: "Anjali Singh", title: "ui/ux designer", photo: "/client/anjali.webp" },
  { name: "suhani tiwari", title: "full stack developer", photo: "/client/suhani.jpg" },
  
];

/** 2-2-1-2-2: outer pairs sit high, the middle photo sits low */
const teamColumns = [
  engineeringTeam.slice(0, 2),
  engineeringTeam.slice(2, 4),
  engineeringTeam.slice(4, 5),
  engineeringTeam.slice(5, 7),
  engineeringTeam.slice(7, 9),
];

const WORDMARK = "FOUNDERS";

export default function Team() {
  const reduceMotion = useReducedMotion();

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
    <div className="tm">
      {/* Wordmark, sized to the content width */}
      <div className="container tm-top">
        <div className="tm-meta">
          <span>WeSee — Leadership</span>
          <span>Mumbai · Tokyo</span>
        </div>
        <h1 className="tm-wordmark">
          <span className="sr-only">The founders and team behind WeSee</span>
          <span className="tm-wordmark-inner" aria-hidden>
            {WORDMARK.split("").map((ch, i) => (
              <motion.span
                key={i}
                className="tm-wordmark-letter"
                initial={reduceMotion ? false : { y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        </h1>
      </div>

      {/* Title on the left, one portrait card per founder on the right */}
      <section className="container tm-founders">
        <div className="tm-intro-copy">
          <h2 className="tm-intro-title">
            <span className="tm-circled">
              Meet
              <svg viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden>
                <motion.path
                  d="M112 8 C 46 4, 6 20, 8 44 C 10 68, 74 78, 128 72 C 178 66, 198 46, 190 28 C 180 8, 130 2, 84 8"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
                />
              </svg>
            </span>{" "}
            the founders
          </h2>
          <p className="tm-intro-sub">Mumbai roots, Tokyo reach</p>
        </div>

        {directors.map((d) => (
          <article key={d.name} className="tm-bio gsap-reveal">
            <div className="tm-bio-photo">
              <img {...imgDims(d.photo)} src={d.photo} alt={d.name} loading="eager" decoding="async" />
            </div>
            <div className="tm-bio-head">
              <svg className="tm-bio-arrow" viewBox="0 0 24 24" aria-hidden>
                <path d="M3 12h17M13 5l7 7-7 7" />
              </svg>
              <div>
                <h3 className="tm-bio-name">{d.name}</h3>
                <div className="tm-bio-role">{d.title}</div>
              </div>
            </div>
            <p className="tm-bio-text">{d.bio}</p>
            <div className="tm-bio-links">
              {"linkedin" in d && d.linkedin ? (
                <a href={d.linkedin} target="_blank" rel="noopener noreferrer" className="tm-pill" aria-label={`${d.name} on LinkedIn`}>
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                  </svg>
                </a>
              ) : null}
              {"twitter" in d && d.twitter ? (
                <a href={d.twitter} target="_blank" rel="noopener noreferrer" className="tm-pill" aria-label={`${d.name} on X`}>
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      {/* Team — headline with a staggered photo grid rising over it */}
      <section className="tm-team">
        <div className="container">
          <div className="tm-kicker">Since 2021</div>
          <h2 className="tm-team-title"><span>
            A team that
            <br />
            builds what's
            <br />
            next</span>
          </h2>
          <ul className="tm-grid">
            {teamColumns.map((col, c) => (
              <li key={c} className="tm-grid-col">
                {col.map((m) => (
                  <figure key={m.photo} className="tm-member gsap-reveal">
                    <div className="tm-member-photo">
                      <img {...imgDims(m.photo)} src={m.photo} alt={m.name.trim()} loading="lazy" decoding="async" />
                    </div>
                    <figcaption>
                      <span className="tm-member-name">{m.name.trim()}</span>
                      <span className="tm-member-role">{m.title}</span>
                    </figcaption>
                  </figure>
                ))}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container tm-cta">
        <p className="tm-cta-text">Want to build with us?</p>
        <Link href="/careers">
          <MagneticButton as="div" className="tm-cta-btn" strength={0.3}>
            Join our team
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M3 12h17M13 5l7 7-7 7" />
            </svg>
          </MagneticButton>
        </Link>
      </section>
    </div>
  );
}
