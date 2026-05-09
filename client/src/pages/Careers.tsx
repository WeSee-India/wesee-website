import { useEffect, useRef, useState } from "react";
import TextReveal from "@/components/TextReveal";
import StaggerReveal from "@/components/StaggerReveal";
import MagneticButton from "@/components/MagneticButton";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Job = {
  title: string;
  location: string;
  skills: string;
  description: string;
};

const jobs: Job[] = [
  {
    title: "Blockchain Developer",
    location: "Mumbai",
    skills:
      "Blockchain, Solidity, Smart Contracts, Web3, ERC-4337, Multisig",

    description: `
We build decentralized systems where correctness isn't optional. We're hiring a Blockchain Developer to own smart contracts and the integrations around them - from Solidity and upgrade patterns to backend services, infra, and the database layer underneath.

The role
- Design, write, and ship Solidity contracts using UUPS upgradeability, with safe storage layouts and clean upgrade paths.
- Implement and integrate ERC-20, ERC-721, ERC-1155, and Soulbound Tokens for product features.
- Build ERC-4337 Account Abstraction flows: smart accounts, bundlers, paymasters, and gasless UX.
- Architect multisig setups (Safe, custom modules) for treasury, governance, and privileged operations.
- Use Tenderly daily for simulations, alerts, debugging reverts, and monitoring production traffic.
- Manage backend integrations with contracts and own database migrations as the schema evolves.
- Debug complex issues end-to-end across contracts, RPCs, backend systems, and frontend applications.

You should have
- Strong Solidity experience with deployed contracts on EVM mainnet or L2s.
- Real ERC-4337 experience beyond theoretical understanding.
- Hands-on experience with UUPS upgrades and storage-collision safety.
- Multisig architecture experience using Safe or custom modules.
- Daily comfort with Tenderly and debugging production issues.
- Strong understanding of ERC-20, ERC-721, ERC-1155, and Soulbound standards.
- Database migration experience in production environments.
- Excellent debugging and problem-solving skills.

Bonus
- Smart contract audit or security review experience.
- Cross-chain or intent-based system experience.
- Open-source contributions in the blockchain ecosystem.

We ship fast and don't tolerate sloppy contracts. If that's your speed, talk to us.
`,
  },

  {
    title: "Marketing Intern",
    location: "Mumbai",
    skills:
      "Digital Marketing, Content Strategy, Social Media, Branding",

    description: `
We build brands that people remember. We're hiring a Marketing Intern to work closely with the team on campaigns, audience growth, content strategy, and digital execution across platforms.

The role
- Assist in planning and executing marketing campaigns across Instagram, X, LinkedIn, and other digital platforms.
- Research trends, competitors, and audience behavior to improve campaign performance.
- Help with content planning, scheduling, and engagement strategies.
- Support branding, growth experiments, and community-building initiatives.
- Analyze campaign performance metrics and contribute ideas for improvement.
- Collaborate with design and content teams for campaign execution.

You should have
- Strong interest in digital marketing and brand growth.
- Familiarity with Instagram, X, LinkedIn, and short-form content trends.
- Good communication skills with a creative and analytical mindset.
- Understanding of audience engagement and online communities.
- Ability to adapt quickly and work in a fast-paced environment.

Bonus
- Experience managing social media pages or personal brands.
- Basic knowledge of Canva, Figma, or editing tools.
- Understanding of SEO, analytics, or paid advertising campaigns.

We move fast, experiment constantly, and care about ideas that actually work. If that sounds like your kind of environment, talk to us.
`,
  },

  {
    title: "Content Creator Intern",
    location: "Mumbai",
    skills:
      "Content Creation, Reels, Storytelling, Social Media",

    description: `
We create content designed to stop the scroll. We're hiring a Content Creator Intern to work on short-form videos, storytelling, creative concepts, and social-first content that connects with audiences.

The role
- Create engaging reels, short-form videos, posts, and social media content for digital platforms.
- Brainstorm creative ideas, hooks, trends, and storytelling formats.
- Collaborate with the marketing and design team on campaigns and brand communication.
- Stay updated with internet culture, trends, and evolving platform algorithms.
- Assist in scripting, shooting, editing, and publishing content.
- Help shape the brand's voice and online identity.

You should have
- Strong interest in content creation and social media culture.
- Understanding of Instagram Reels, TikTok-style editing, and audience retention.
- Creative mindset with strong storytelling instincts.
- Basic editing skills using tools like CapCut, Premiere Pro, VN, or similar.
- Confidence in experimenting with new content formats and ideas.

Bonus
- Experience growing a personal or theme page.
- Photography or videography skills.
- Understanding of viral content structures and social trends.

We care about creativity, speed, and originality - not boring corporate content. If you love creating things people actually watch, talk to us.
`,
  },

  {
    title: "Full Stack Developer Intern",
    location: "Mumbai",
    skills:
      "React, Node.js, APIs, Databases, Full Stack Development",

    description: `
We build products fast and iterate even faster. We're hiring a Full Stack Developer Intern to work across frontend, backend, APIs, and databases while contributing to real production systems.

The role
- Build and maintain frontend interfaces using modern frameworks like React.
- Develop backend services, APIs, and integrations using Node.js and related technologies.
- Work with databases, authentication systems, and cloud deployments.
- Collaborate with designers and developers to ship scalable product features.
- Debug issues across the full stack and improve application performance.
- Participate in testing, code reviews, and development workflows.

You should have
- Strong fundamentals in JavaScript and modern web development.
- Familiarity with React, Node.js, REST APIs, and databases.
- Understanding of responsive UI development and backend architecture.
- Ability to debug problems and learn quickly in a fast-moving environment.
- Passion for building real-world products and continuously improving.

Bonus
- Experience with TypeScript, Next.js, Firebase, MongoDB, or PostgreSQL.
- Knowledge of deployment platforms and cloud services.
- Personal projects, hackathons, or open-source contributions.

We value builders who take ownership, learn fast, and care about shipping quality products. If that's your mindset, talk to us.
`,
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
        const anim = gsap.fromTo(el, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
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
                      <div className="job-block" style={{ fontSize: 14, fontWeight: 400, color: "#3A3A3A", marginBottom: 12, marginTop: 4 }}>{job.location}</div>

                      <div className="job-block" style={{ fontSize: 12, fontWeight: 400, color: "#888888", letterSpacing: "0.1em", textTransform: "uppercase" }}>Skills</div>
                      <div className="job-block" style={{ fontSize: 14, fontWeight: 400, color: "#3A3A3A", marginTop: 4 }}>{job.skills}</div>

                      <div className="job-block" style={{ fontSize: 12, fontWeight: 400, color: "#888888", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 24 }}>Job Description</div>
                      <p className="job-block" style={{ fontSize: 15, fontWeight: 400, color: "#3A3A3A", lineHeight: 1.7, marginTop: 4, whiteSpace: "pre-line" }}>{job.description.trim()}</p>

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
