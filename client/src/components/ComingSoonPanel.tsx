import { Link } from "wouter";

/** Honest empty state for collection pages (case studies, projects) before approved entries exist. */
export default function ComingSoonPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="coming-soon">
      <span className="coming-soon-dot" aria-hidden="true" />
      <h2>{title}</h2>
      <p>{body}</p>
      <div className="coming-soon-actions">
        <Link href="/book" className="cs-btn cs-btn--dark">Book a discovery call</Link>
        <Link href="/services" className="cs-btn">Explore our services</Link>
      </div>
    </div>
  );
}
