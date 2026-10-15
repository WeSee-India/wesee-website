import { useEffect, useRef, useState } from "react";

type Team = "Engineering" | "Marketing" | "Content";

type Job = {
  slug: string;
  title: string;
  team: Team;
  type: "Full time" | "Internship";
  location: string;
  skills: string[];
  intro: string;
  role: string[];
  requirements: string[];
  bonus: string[];
  closing: string;
};

const HR_EMAIL = "hr@weseegpt.com";

const jobs: Job[] = [
  {
    slug: "blockchain-developer",
    title: "Blockchain Developer",
    team: "Engineering",
    type: "Full time",
    location: "Mumbai",
    skills: ["Solidity", "Smart Contracts", "Web3", "ERC-4337", "Multisig"],
    intro:
      "We build decentralized systems where correctness isn't optional. We're hiring a Blockchain Developer to own smart contracts and the integrations around them, from Solidity and upgrade patterns to backend services, infra and the database layer underneath.",
    role: [
      "Design, write and ship Solidity contracts using UUPS upgradeability, with safe storage layouts and clean upgrade paths.",
      "Implement and integrate ERC-20, ERC-721, ERC-1155 and Soulbound Tokens for product features.",
      "Build ERC-4337 Account Abstraction flows: smart accounts, bundlers, paymasters and gasless UX.",
      "Architect multisig setups (Safe, custom modules) for treasury, governance and privileged operations.",
      "Use Tenderly daily for simulations, alerts, debugging reverts and monitoring production traffic.",
      "Manage backend integrations with contracts and own database migrations as the schema evolves.",
      "Debug complex issues end to end across contracts, RPCs, backend systems and frontend applications.",
    ],
    requirements: [
      "Strong Solidity experience with deployed contracts on EVM mainnet or L2s.",
      "Real ERC-4337 experience beyond theoretical understanding.",
      "Hands on experience with UUPS upgrades and storage collision safety.",
      "Multisig architecture experience using Safe or custom modules.",
      "Daily comfort with Tenderly and debugging production issues.",
      "Strong understanding of ERC-20, ERC-721, ERC-1155 and Soulbound standards.",
      "Database migration experience in production environments.",
      "Excellent debugging and problem solving skills.",
    ],
    bonus: [
      "Smart contract audit or security review experience.",
      "Cross chain or intent based system experience.",
      "Open source contributions in the blockchain ecosystem.",
    ],
    closing: "We ship fast and don't tolerate sloppy contracts. If that's your speed, talk to us.",
  },
  {
    slug: "full-stack-developer-intern",
    title: "Full Stack Developer Intern",
    team: "Engineering",
    type: "Internship",
    location: "Mumbai",
    skills: ["React", "Node.js", "APIs", "Databases"],
    intro:
      "We build products fast and iterate even faster. We're hiring a Full Stack Developer Intern to work across frontend, backend, APIs and databases while contributing to real production systems.",
    role: [
      "Build and maintain frontend interfaces using modern frameworks like React.",
      "Develop backend services, APIs and integrations using Node.js and related technologies.",
      "Work with databases, authentication systems and cloud deployments.",
      "Collaborate with designers and developers to ship scalable product features.",
      "Debug issues across the full stack and improve application performance.",
      "Participate in testing, code reviews and development workflows.",
    ],
    requirements: [
      "Strong fundamentals in JavaScript and modern web development.",
      "Familiarity with React, Node.js, REST APIs and databases.",
      "Understanding of responsive UI development and backend architecture.",
      "Ability to debug problems and learn quickly in a fast moving environment.",
      "Passion for building real world products and continuously improving.",
    ],
    bonus: [
      "Experience with TypeScript, Next.js, Firebase, MongoDB or PostgreSQL.",
      "Knowledge of deployment platforms and cloud services.",
      "Personal projects, hackathons or open source contributions.",
    ],
    closing:
      "We value builders who take ownership, learn fast and care about shipping quality products. If that's your mindset, talk to us.",
  },
  {
    slug: "marketing-intern",
    title: "Marketing Intern",
    team: "Marketing",
    type: "Internship",
    location: "Mumbai",
    skills: ["Digital Marketing", "Content Strategy", "Social Media", "Branding"],
    intro:
      "We build brands that people remember. We're hiring a Marketing Intern to work closely with the team on campaigns, audience growth, content strategy and digital execution across platforms.",
    role: [
      "Assist in planning and executing marketing campaigns across Instagram, X, LinkedIn and other digital platforms.",
      "Research trends, competitors and audience behavior to improve campaign performance.",
      "Help with content planning, scheduling and engagement strategies.",
      "Support branding, growth experiments and community building initiatives.",
      "Analyze campaign performance metrics and contribute ideas for improvement.",
      "Collaborate with design and content teams for campaign execution.",
    ],
    requirements: [
      "Strong interest in digital marketing and brand growth.",
      "Familiarity with Instagram, X, LinkedIn and short form content trends.",
      "Good communication skills with a creative and analytical mindset.",
      "Understanding of audience engagement and online communities.",
      "Ability to adapt quickly and work in a fast paced environment.",
    ],
    bonus: [
      "Experience managing social media pages or personal brands.",
      "Basic knowledge of Canva, Figma or editing tools.",
      "Understanding of SEO, analytics or paid advertising campaigns.",
    ],
    closing:
      "We move fast, experiment constantly and care about ideas that actually work. If that sounds like your kind of environment, talk to us.",
  },
  {
    slug: "content-creator-intern",
    title: "Content Creator Intern",
    team: "Content",
    type: "Internship",
    location: "Mumbai",
    skills: ["Content Creation", "Reels", "Storytelling", "Social Media"],
    intro:
      "We create content designed to stop the scroll. We're hiring a Content Creator Intern to work on short form videos, storytelling, creative concepts and social first content that connects with audiences.",
    role: [
      "Create engaging reels, short form videos, posts and social media content for digital platforms.",
      "Brainstorm creative ideas, hooks, trends and storytelling formats.",
      "Collaborate with the marketing and design team on campaigns and brand communication.",
      "Stay updated with internet culture, trends and evolving platform algorithms.",
      "Assist in scripting, shooting, editing and publishing content.",
      "Help shape the brand's voice and online identity.",
    ],
    requirements: [
      "Strong interest in content creation and social media culture.",
      "Understanding of Instagram Reels, short video editing and audience retention.",
      "Creative mindset with strong storytelling instincts.",
      "Basic editing skills using tools like CapCut, Premiere Pro, VN or similar.",
      "Confidence in experimenting with new content formats and ideas.",
    ],
    bonus: [
      "Experience growing a personal or theme page.",
      "Photography or videography skills.",
      "Understanding of viral content structures and social trends.",
    ],
    closing:
      "We care about creativity, speed and originality, not boring corporate content. If you love creating things people actually watch, talk to us.",
  },
];

const TEAMS: { name: Team; blurb: string }[] = [
  { name: "Engineering", blurb: "Smart contracts, full stack apps and the systems behind our AI work." },
  { name: "Marketing", blurb: "Campaigns, audience growth and brand strategy across platforms." },
  { name: "Content", blurb: "Reels, short videos and stories that people actually watch." },
];

function TeamIcon({ team }: { team: Team | "Open" }) {
  const common = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (team === "Engineering") return <svg {...common}><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" /></svg>;
  if (team === "Marketing") return <svg {...common}><path d="M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1zM15 9a3 3 0 010 6M18 6a7 7 0 010 12" /></svg>;
  if (team === "Content") return <svg {...common}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3" /></svg>;
  return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
}

const initials = (title: string) => title.split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
const applyHref = (job?: Job) =>
  `mailto:${HR_EMAIL}?subject=${encodeURIComponent(job ? `Application: ${job.title}` : "Open application")}`;

export default function Careers() {
  const [team, setTeam] = useState<Team | "">("");
  const [active, setActive] = useState<Job | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLElement>(null);

  const stepsRef = useRef<HTMLElement>(null);
  const [stepsIn, setStepsIn] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Play the steps entrance once, when the section scrolls into view.
  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStepsIn(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Open/close the native dialog when a role is picked.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (active && !d.open) d.showModal();
    if (!active && d.open) d.close();
  }, [active]);

  const results = team ? jobs.filter((j) => j.team === team) : jobs;

  const pickTeam = (t: Team | "") => {
    setTeam(t);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="cr">
      {/* Hero with search */}
      <header className="cr-hero">
        <img
          className="cr-hero-img"
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=70"
          width={1600}
          height={1067}
          alt=""
        />
        <div className="container cr-hero-inner">
          <span className="cr-hero-kicker">Careers at WeSee</span>
          <h1 className="cr-hero-title">Build the AI systems businesses run on.</h1>

        </div>
      </header>

      {/* Teams */}
      <section className="container cr-section" aria-labelledby="cr-teams-title">
        <div className="cr-head">
          <h2 id="cr-teams-title">Choose your team</h2>
          <p>Small teams, real ownership. Every role ships work that clients use, from Mumbai.</p>
        </div>
        <div className="cr-teams">
          {TEAMS.map((t) => {
            const count = jobs.filter((j) => j.team === t.name).length;
            return (
              <button key={t.name} type="button" className="cr-team" onClick={() => pickTeam(t.name)}>
                <span className="cr-team-icon"><TeamIcon team={t.name} /></span>
                <span className="cr-team-name">{t.name}</span>
                <span className="cr-team-count">{count} open {count === 1 ? "role" : "roles"}</span>
                <span className="cr-team-blurb">{t.blurb}</span>
              </button>
            );
          })}
          <a className="cr-team" href={applyHref()}>
            <span className="cr-team-icon"><TeamIcon team="Open" /></span>
            <span className="cr-team-name">Open application</span>
            <span className="cr-team-count">Any team</span>
            <span className="cr-team-blurb">Don't see your role? Send us your CV and portfolio anyway.</span>
          </a>
        </div>
      </section>

      {/* Roles */}
      <section ref={listRef} className="container cr-section cr-roles" aria-labelledby="cr-roles-title">
        <div className="cr-head">
          <h2 id="cr-roles-title">Roles you may be interested in</h2>
          <p role="status">
            {results.length === jobs.length
              ? `${jobs.length} open roles in Mumbai.`
              : `Showing ${results.length} of ${jobs.length} roles${team ? ` in ${team}` : ""}.`}
            {team && (
              <button type="button" className="cr-clear" onClick={() => setTeam("")}>
                Show all
              </button>
            )}
          </p>
        </div>

        {results.length > 0 ? (
          <ul className="cr-jobs">
            {results.map((j) => (
              <li key={j.slug} className="cr-job">
                <span className="cr-job-mark" aria-hidden="true">{initials(j.title)}</span>
                <div className="cr-job-main">
                  <h3 className="cr-job-title">{j.title}</h3>
                  <p className="cr-job-team">WeSee · <strong>{j.team}</strong></p>
                  <ul className="cr-job-meta">
                    <li>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                      {j.location}
                    </li>
                    <li>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 5h16l-6 7v6l-4 2v-8z" /></svg>
                      {j.skills.slice(0, 3).join(", ")}
                    </li>
                  </ul>
                </div>
                <div className="cr-job-side">
                  <span className={`cr-job-type${j.type === "Full time" ? " cr-job-type--full" : ""}`}>{j.type}</span>
                  <button type="button" className="cr-job-view" onClick={() => setActive(j)}>
                    View role<span className="sr-only">: {j.title}</span> →
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="cr-empty">
            <p>No open roles in this team right now.</p>
            <a href={applyHref()}>Send an open application →</a>
          </div>
        )}
      </section>

      {/* How to apply */}
      <section ref={stepsRef} className={`cr-steps${stepsIn ? " is-in" : ""}`} aria-labelledby="cr-steps-title">
        <div className="container">
          <span className="cr-steps-kicker">How it works</span>
          <h2 id="cr-steps-title">Easiest way to apply</h2>
          <div className="cr-flow">
          {/* line through the three circles, with a pulse travelling along it */}
          <span className="cr-flow-line" aria-hidden="true"><span className="cr-flow-pulse" /></span>
          <ol>
            <li style={{ "--i": 0 } as React.CSSProperties}>
              <span className="cr-step-num">01</span>
              <h3>Find your role</h3>
              <p>Pick a role above, or send an open application if nothing fits yet.</p>
            </li>
            <li style={{ "--i": 1 } as React.CSSProperties}>
              <span className="cr-step-num">02</span>
              <h3>Send your application</h3>
              <p>Email your CV, a short motivation letter and your portfolio to <a href={applyHref()}>{HR_EMAIL}</a>.</p>
            </li>
            <li style={{ "--i": 2 } as React.CSSProperties}>
              <span className="cr-step-num">03</span>
              <h3>Meet the team</h3>
              <p>If there's a fit, we'll set up a conversation with the people you'd work with.</p>
            </li>
          </ol>
          </div>
          <a className="cr-steps-cta" href={applyHref()}>
            Email {HR_EMAIL}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* Role details */}
      <dialog ref={dialogRef} className="cr-dialog" aria-labelledby="cr-dialog-title" onClose={() => setActive(null)}>
        {active && (
          <div className="cr-dialog-inner">
            <button type="button" className="cr-dialog-close" onClick={() => setActive(null)} aria-label="Close role details">✕</button>
            <span className="cr-dialog-kicker">{active.team} · {active.type} · {active.location}</span>
            <h2 id="cr-dialog-title">{active.title}</h2>
            <ul className="cr-dialog-skills" aria-label="Skills">
              {active.skills.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <p className="cr-dialog-intro">{active.intro}</p>
            <h3>The role</h3>
            <ul>{active.role.map((r) => <li key={r}>{r}</li>)}</ul>
            <h3>You should have</h3>
            <ul>{active.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
            <h3>Bonus</h3>
            <ul>{active.bonus.map((r) => <li key={r}>{r}</li>)}</ul>
            <p className="cr-dialog-closing">{active.closing}</p>
            <a className="cr-dialog-apply" href={applyHref(active)}>Apply for this role</a>
            <p className="cr-dialog-note">Opens an email to {HR_EMAIL}. Attach your CV, motivation letter and portfolio.</p>
          </div>
        )}
      </dialog>
    </div>
  );
}
