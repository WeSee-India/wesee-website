import { useState, type CSSProperties, type FormEvent } from "react";
import { Link } from "wouter";

const fieldLabel: CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(17,19,23,0.85)",
  marginBottom: 8,
};

const inputBase: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  fontSize: 15,
  lineHeight: 1.4,
  color: "var(--ink)",
  background: "#fff",
  border: "1px solid rgba(17,19,23,0.12)",
  borderRadius: 8,
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const serifNote: CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 12,
  lineHeight: 1.55,
  color: "rgba(17,19,23,0.62)",
};

const linkRust = "#A0522D";

export default function BookCall() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [message, setMessage] = useState("");
  const [consentNonMarketing, setConsentNonMarketing] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormState("sending");
    setFormError("");
    const body = {
      name: name.trim(),
      email: email.trim(),
      company: businessType.trim(),
      service: "book-call",
      message: message.trim(),
      phone: phone.trim(),
      consentNonMarketing,
      consentMarketing,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSubmittedEmail(body.email);
      setFormState("success");
      setName("");
      setEmail("");
      setPhone("");
      setBusinessType("");
      setMessage("");
      setConsentNonMarketing(false);
      setConsentMarketing(false);
    } catch (err: unknown) {
      setFormState("error");
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <section
      className="section-pad page-enter"
      style={{
        minHeight: "calc(100svh - 140px)",
        background: "var(--paper)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 900,
            height: 900,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 60%)",
            top: "10%",
            left: "0%",
            transform: "translate(-40%, -10%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)",
            bottom: "-10%",
            right: "-10%",
          }}
        />
      </div>

      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="fade-up"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 26,
            alignItems: "start",
            animationDelay: "0.15s",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 40,
              minWidth: 0,
            }}
          >
            {/* Header */}
            <div
              className="fade-up"
              style={{
                maxWidth: 720,
                animationDelay: "0.05s",
              }}
            >
              <div className="section-label" style={{ marginBottom: 18 }}>
                Book a call
              </div>
              <h1
                style={{
                  fontSize: "clamp(32px, 4.4vw, 56px)",
                  fontWeight: 450,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.15,
                  color: "var(--ink)",
                  margin: 0,
                }}
              >
                Let&apos;s map the{" "}
                <span
                  style={{
                    fontStyle: "italic",
                    fontWeight: 288,
                    background:
                      "linear-gradient(110deg, #9C7A1E 0%, #C9A84C 45%, #E8C870 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    paddingRight: "8px",
                    backgroundClip: "text",
                  }}
                >
                  signal
                </span>{" "}
                inside your business.
              </h1>
              <p
                style={{
                  marginTop: 20,
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: "rgba(17,19,23,0.52)",
                  maxWidth: 520,
                }}
              >
                In 30 minutes, we&apos;ll understand your current systems, identify
                your highest–leverage automation opportunities, and outline a clear
                path to implementation.
              </p>
            </div>

            {/* Left: what to expect */}
            <div
              className="fade-up"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 22,
                animationDelay: "0.20s",
              }}
            >
              <div
                style={{
                  padding: "20px 22px",
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(17,19,23,0.06)",
                  boxShadow: "0 14px 40px rgba(17,19,23,0.06)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(17,19,23,0.50)",
                    marginBottom: 10,
                  }}
                >
                  In this call
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    fontSize: 14,
                    color: "rgba(17,19,23,0.70)",
                  }}
                >
                  {[
                    "Quick walkthrough of your current tools, workflows, and bottlenecks.",
                    "Identify 2–3 concrete automation or AI-agent opportunities.",
                    "Discuss feasibility, timelines, and potential ROI.",
                    "Decide together on next steps—if it makes sense for both sides.",
                  ].map((item) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          background: "rgba(201,168,76,0.18)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          color: "var(--accent)",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  padding: "18px 20px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.75)",
                  border: "1px solid rgba(17,19,23,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: 13,
                  color: "rgba(17,19,23,0.60)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 14,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 520,
                      fontSize: 13,
                      padding: "5px 10px",
                      borderRadius: 999,
                      background: "rgba(17,19,23,0.06)",
                      color: "rgba(17,19,23,0.75)",
                    }}
                  >
                    30 min discovery
                  </span>
                  <span
                    style={{
                      fontWeight: 520,
                      fontSize: 13,
                      padding: "5px 10px",
                      borderRadius: 999,
                      background: "rgba(201,168,76,0.10)",
                      color: "var(--accent)",
                    }}
                  >
                    Free. No obligation.
                  </span>
                </div>
                <div>
                  Prefer email instead?{" "}
                  <a
                    href="mailto:hr@weseegpt.com"
                    style={{
                      color: "var(--ink)",
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(17,19,23,0.30)",
                      paddingBottom: 1,
                    }}
                  >
                    hr@weseegpt.com
                  </a>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Link
                    href="/contact"
                    style={{
                      color: "var(--accent)",
                      textDecoration: "none",
                      fontWeight: 500,
                      borderBottom: "1px solid rgba(201,168,76,0.35)",
                      paddingBottom: 1,
                    }}
                  >
                    Full contact page →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right: contact form */}
          <div
            className="fade-up"
            style={{
              background: "rgba(255,255,255,0.85)",
              borderRadius: 18,
              border: "1px solid rgba(17,19,23,0.06)",
              boxShadow: "0 14px 40px rgba(17,19,23,0.06)",
              padding: "24px 22px 20px",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              animationDelay: "0.25s",
              display: "flex",
              flexDirection: "column",
            }}
          >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(17,19,23,0.50)",
                  marginBottom: 6,
                }}
              >
                Contact us
              </div>
              <h2
                style={{
                  margin: "0 0 20px",
                  fontSize: "clamp(20px, 2.5vw, 24px)",
                  fontWeight: 500,
                  letterSpacing: "-0.03em",
                  color: "var(--ink)",
                }}
              >
                Request a discovery call
              </h2>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label htmlFor="bookcall-name" style={fieldLabel}>
                    Full Name
                  </label>
                  <input
                    id="bookcall-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputBase}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(201,168,76,0.45)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(17,19,23,0.12)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="bookcall-email" style={fieldLabel}>
                    Business Email <span style={{ color: linkRust }}>*</span>
                  </label>
                  <input
                    id="bookcall-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputBase}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(201,168,76,0.45)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(17,19,23,0.12)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="bookcall-phone" style={fieldLabel}>
                    Phone <span style={{ color: linkRust }}>*</span>
                  </label>
                  <input
                    id="bookcall-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="Phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    style={inputBase}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(201,168,76,0.45)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(17,19,23,0.12)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="bookcall-business" style={fieldLabel}>
                    Business Type <span style={{ color: linkRust }}>*</span>
                  </label>
                  <input
                    id="bookcall-business"
                    name="businessType"
                    type="text"
                    autoComplete="organization"
                    placeholder="e.g. SaaS, agency, retail"
                    required
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    style={inputBase}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(201,168,76,0.45)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(17,19,23,0.12)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="bookcall-message" style={fieldLabel}>
                    Message <span style={{ color: linkRust }}>*</span>
                  </label>
                  <textarea
                    id="bookcall-message"
                    name="message"
                    rows={4}
                    required
                    placeholder="What would you like to cover on the call?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ ...inputBase, resize: "vertical", minHeight: 100 }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(201,168,76,0.45)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(17,19,23,0.12)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <label
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={consentNonMarketing}
                    onChange={(e) => setConsentNonMarketing(e.target.checked)}
                    style={{ marginTop: 3, width: 16, height: 16, accentColor: linkRust, flexShrink: 0 }}
                  />
                  <span style={serifNote}>
                  I agree to receive non-marketing texts from WeSee about AI automation and call scheduling. Msg frequency varies. Msg & data rates may apply. Reply STOP to opt out.
                  </span>
                </label>
                <label
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={consentMarketing}
                    onChange={(e) => setConsentMarketing(e.target.checked)}
                    style={{ marginTop: 3, width: 16, height: 16, accentColor: linkRust, flexShrink: 0 }}
                  />
                  <span style={serifNote}>
                  I agree to receive marketing messages from WeSee. Msg frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help.
                  </span>
                </label>

                {formState === "success" && (
                  <div
                    style={{
                      padding: "14px 16px",
                      background: "rgba(34, 120, 72, 0.08)",
                      border: "1px solid rgba(34, 120, 72, 0.22)",
                      borderRadius: 10,
                      color: "rgb(24, 100, 58)",
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    Thanks—we received your request. We&apos;ll follow up at {submittedEmail} shortly.
                  </div>
                )}
                {formState === "error" && (
                  <div
                    style={{
                      padding: "14px 16px",
                      background: "rgba(176, 44, 44, 0.06)",
                      border: "1px solid rgba(176, 44, 44, 0.2)",
                      borderRadius: 10,
                      color: "#9B2C2C",
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    {formError}
                  </div>
                )}

                {formState !== "success" && (
                  <button
                    type="submit"
                    disabled={formState === "sending"}
                    style={{
                      marginTop: 8,
                      width: "100%",
                      padding: "14px 20px",
                      fontSize: 15,
                      fontWeight: 600,
                      color: linkRust,
                      background: "#FFFBEB",
                      border: "1px solid rgba(160, 82, 45, 0.2)",
                      borderRadius: 10,
                      cursor: formState === "sending" ? "wait" : "pointer",
                      opacity: formState === "sending" ? 0.75 : 1,
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                  >
                    {formState === "sending" ? "Sending…" : "Book Free Discovery Call →"}
                  </button>
                )}

                <div
                  style={{
                    textAlign: "center",
                    marginTop: 4,
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: 13,
                  }}
                >
                
                </div>
              </form>
            </div>
        </div>
      </div>
    </section>
  );
}
