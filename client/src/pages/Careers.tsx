import { useEffect, useRef, useState } from "react";
import TextReveal from "@/components/TextReveal";
import StaggerReveal from "@/components/StaggerReveal";
import MagneticButton from "@/components/MagneticButton";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const jobs = [
  {
    title: "Marketing Intern",
    location: "Mumbai ",
    skills: "Digital Marketing, Content Planning, Social Media",
    profile: "Pursuing or recently completed a degree in Marketing, Business, or related field. Strong communication skills with a creative and analytical mindset. Eagerness to learn and execute real-world marketing strategies.",
    description: "Assist in building and executing marketing campaigns across digital platforms. Work on content planning, social media growth, and audience engagement while learning real-world marketing strategies.",
  },
  {
    title: "Content Creator Intern",
    location: "Mumbai ",
    skills: "Content Creation, Reels, Storytelling, Social Media",
    profile: "Strong interest in content creation and social media trends. Ability to think creatively and collaborate with cross-functional teams. Basic understanding of brand communication and audience engagement.",
    description: "Create engaging content for social media and digital platforms. Work closely with the team to develop creative ideas, reels, posts, and storytelling that align with the brand.",
  },
  {
    title: "Full Stack Developer Intern",
    location: "Mumbai ",
    skills: "React, Node.js, APIs, Databases",
    profile: "Currently pursuing or recently completed a degree in Computer Science or related field. Familiar with frontend and backend development concepts. Passion for building real-world products and learning modern development workflows.",
    description: "Support the development of web applications across frontend and backend. Work with modern frameworks, APIs, and real-world projects while gaining hands-on experience.",
  },
  {
    title: "Blockchain Developer ",
    location: "Mumbai ",
    skills: "Blockchain, Smart Contracts, Web3 Integrations",
    profile: "0-2 years of experience building and deploying blockchain-based solutions. Proficiency with smart contract development and decentralized application architecture. Strong problem-solving skills for scalable and secure systems.",
    description: "Build and maintain blockchain-based applications and smart contracts. Work on decentralized systems, integrations, and scalable solutions in a fast-paced environment.",
  },
  
 
];

export default function Careers() {
  const [openJob, setOpenJob] = useState<number | null>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Stagger animate accordion content when a job opens
  useEffect(() => {
    if (openJob === null) return;
    const el = contentRefs.current[openJob];
    if (!el) return;
    const blocks = el.querySelectorAll(".job-block");
    gsap.fromTo(blocks, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power2.out" });
  }, [openJob]);

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
    <div className="careers-page" style={{ paddingTop: 20 }}>
      <div className="section-padding">
        <div className="container">
          <TextReveal
            as="h1"
            className="careers-hero-title"
            style={{ fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.15 }}
            stagger={0.06}
            onScroll={false}
          >
            Careers.
          </TextReveal>
          <p className="body-text gsap-reveal" style={{ marginTop: 24 }}>
            Please send your application with a motivation letter, CV and portfolio to:
          </p>
          <a href="mailto:hr@weseegpt.com" className="cta-link gsap-reveal" style={{ fontSize: 18, fontWeight: 600, color: "#1A1A1A", textDecoration: "none", display: "inline-block", marginTop: 8 }}>hr@weseegpt.com</a>
        </div>
      </div>

      <div
        style={{
          width: "calc(100% - clamp(24px, 6vw, 64px))",
          margin: "clamp(12px, 2.5vw, 24px) auto",
          height: "clamp(240px, 40vh, 380px)",
          overflow: "hidden",
          borderRadius: 16,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=2000&q=80"
          alt="Team"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          loading="lazy"
        />
      </div>

      <section style={{ paddingTop: 40, paddingBottom: 16 }}>
        <div className="container">
          <TextReveal as="h2" className="section-heading careers-team-heading" stagger={0.05}>
            Become part of the WeSee team.
          </TextReveal>
        </div>
      </section>

      {/* Job accordion with staggered reveal and animated expand */}
      <section style={{ paddingBottom: 48 }}>
        <div className="container">
          <StaggerReveal stagger={0.1} y={15}>
            {jobs.map((job, i) => (
              <div key={job.title} style={{ borderTop: "1px solid #EEEEEE" }}>
                <button
                  onClick={() => setOpenJob(openJob === i ? null : i)}
                  className="w-full flex items-center justify-between group"
                  style={{ padding: "24px 0", cursor: "pointer", background: "none", border: "none", textAlign: "left" }}
                >
                  <div>
                    <span
                      className="careers-job-title group-hover:translate-x-2"
                      style={{ fontSize: 20, fontWeight: 600, color: "#1A1A1A", transition: "transform 0.3s ease", display: "inline-block" }}
                    >
                      {job.title}
                    </span>
                  </div>
                  <span
                    className="careers-job-toggle-icon"
                    style={{ fontSize: 24, fontWeight: 300, color: "#888888", transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)", transform: openJob === i ? "rotate(45deg)" : "none" }}
                  >
                    +
                  </span>
                </button>
                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: openJob === i ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <div style={{ minHeight: 0, overflow: "hidden" }}>
                    <div
                      ref={(el) => { contentRefs.current[i] = el; }}
                      style={{ paddingBottom: 32 }}
                    >
                      <div className="job-block" style={{ fontSize: 12, fontWeight: 400, color: "#888888", letterSpacing: "0.1em", textTransform: "uppercase" }}>Location</div>
                      <div className="job-block" style={{ fontSize: 14, fontWeight: 400, color: "#3A3A3A", marginBottom: 12, marginTop: 4  }}>{job.location}</div>

                      <div className="job-block" style={{ fontSize: 12, fontWeight: 400, color: "#888888", letterSpacing: "0.1em", textTransform: "uppercase" }}>Skills</div>
                      <div className="job-block" style={{ fontSize: 14, fontWeight: 400, color: "#3A3A3A", marginTop: 4 }}>{job.skills}</div>

                      <div className="job-block" style={{ fontSize: 12, fontWeight: 400, color: "#888888", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 24 }}>Your Profile</div>
                      <p className="job-block" style={{ fontSize: 15, fontWeight: 400, color: "#3A3A3A", lineHeight: 1.7, marginTop: 4 }}>{job.profile}</p>

                      <div className="job-block" style={{ fontSize: 12, fontWeight: 400, color: "#888888", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 24 }}>Job Description</div>
                      <p className="job-block" style={{ fontSize: 15, fontWeight: 400, color: "#3A3A3A", lineHeight: 1.7, marginTop: 4 }}>{job.description}</p>

                      <div className="job-block" style={{ marginTop: 24 }}>
                        <MagneticButton
                          as="a"
                          href="mailto:hr@weseegpt.com"
                          className="btn-fill-sweep"
                          style={{ display: "inline-block", padding: "12px 24px", background: "#1A1A1A", color: "#FFFFFF", fontSize: 13, fontWeight: 500, textDecoration: "none" }}
                          strength={0.2}
                        >
                          Apply now +
                        </MagneticButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #EEEEEE" }} />
          </StaggerReveal>
        </div>
      </section>
    </div>
  );
}
