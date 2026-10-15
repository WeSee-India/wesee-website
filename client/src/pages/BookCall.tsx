import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useSearch } from "wouter";
import { services } from "@/data/services";
import { track } from "@/lib/analytics";

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
const errorRed = "#9B2C2C";
const CONTACT_EMAIL = "harsh.khanna@weseegpt.com";

type FieldKey = "name" | "email" | "phone" | "businessType" | "message";
type FieldErrors = Partial<Record<FieldKey, string>>;

const FIELD_ORDER: FieldKey[] = ["name", "email", "phone", "businessType", "message"];
const fieldId = (k: FieldKey) => `bookcall-${k === "businessType" ? "business" : k}`;

function validate(v: Record<FieldKey, string>): FieldErrors {
  const errors: FieldErrors = {};
  if (!v.name.trim()) errors.name = "Enter your full name.";
  if (!v.email.trim()) errors.email = "Enter your business email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()))
    errors.email = "Enter a valid email address, like name@company.com.";
  if (!/^\d{7,15}$/.test(v.phone)) errors.phone = "Enter your phone number with country code, digits only (7 to 15 digits).";
  if (!v.businessType.trim()) errors.businessType = "Tell us your business type, for example SaaS, agency or retail.";
  if (!v.message.trim()) errors.message = "Add a few words about what you want to cover on the call.";
  return errors;
}

/** Service names for the preselect, grouped by category, in catalogue order. */
const serviceGroups = services.reduce<{ category: string; items: { slug: string; name: string }[] }[]>((acc, s) => {
  const group = acc.find((g) => g.category === s.category);
  if (group) group.items.push({ slug: s.slug, name: s.name });
  else acc.push({ category: s.category, items: [{ slug: s.slug, name: s.name }] });
  return acc;
}, []);

const focusStyle = (e: { target: HTMLElement }) => {
  e.target.style.borderColor = "rgba(201,168,76,0.45)";
  e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.12)";
};
const blurStyle = (e: { target: HTMLElement }, invalid: boolean) => {
  e.target.style.borderColor = invalid ? errorRed : "rgba(17,19,23,0.12)";
  e.target.style.boxShadow = "none";
};

interface TextFieldProps {
  field: FieldKey;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  multiline?: boolean;
  type?: string;
  inputMode?: "numeric" | "text" | "email" | "tel";
  autoComplete?: string;
  placeholder?: string;
}

function TextField({ field, label, value, onChange, error, hint, multiline, type = "text", inputMode, autoComplete, placeholder }: TextFieldProps) {
  const id = fieldId(field);
  const describedBy = [hint && !error && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name: field,
    required: true,
    value,
    placeholder,
    "aria-required": true as const,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    onFocus: focusStyle,
    onBlur: (e: { target: HTMLElement }) => blurStyle(e, Boolean(error)),
    style: { ...inputBase, ...(error ? { borderColor: errorRed } : null) },
  };
  return (
    <div>
      <label htmlFor={id} style={fieldLabel}>
        {label} <span style={{ color: linkRust }} aria-hidden="true">*</span>
      </label>
      {multiline ? (
        <textarea
          {...common}
          rows={4}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...common.style, resize: "vertical", minHeight: 100 }}
        />
      ) : (
        <input {...common} type={type} inputMode={inputMode} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && !error && (
        <p id={`${id}-hint`} style={{ ...serifNote, margin: "6px 0 0" }}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.45, color: errorRed }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function BookCall() {
  const search = useSearch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [message, setMessage] = useState("");
  const [serviceSlug, setServiceSlug] = useState("");
  const [consentNonMarketing, setConsentNonMarketing] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // spam trap — must stay empty
  const openedAt = useRef(Date.now()); // spam trap — a person needs more than a second to fill this in
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submittedEmail, setSubmittedEmail] = useState("");
  const statusRef = useRef<HTMLDivElement>(null);
  const formStarted = useRef(false);

  // Fires once per visit, on the first interaction with any field. Reports no field values.
  const trackFormStart = () => {
    if (formStarted.current) return;
    formStarted.current = true;
    track("form_start", { form_name: "book_call" });
  };

  // /book?service=<slug> from a service page's CTA pre-selects that service. Unknown slugs are ignored.
  useEffect(() => {
    const slug = new URLSearchParams(search).get("service") ?? "";
    if (slug && services.some((s) => s.slug === slug)) setServiceSlug(slug);
  }, [search]);

  // Move focus to the result banner so screen-reader and keyboard users land on it.
  useEffect(() => {
    if ((formState === "success" || formState === "error") && !Object.values(fieldErrors).some(Boolean)) statusRef.current?.focus();
  }, [formState, fieldErrors]);

  const values: Record<FieldKey, string> = { name, email, phone, businessType, message };
  const setters: Record<FieldKey, (v: string) => void> = {
    name: setName,
    email: setEmail,
    phone: (v) => setPhone(v.replace(/\D/g, "")),
    businessType: setBusinessType,
    message: setMessage,
  };
  const update = (field: FieldKey) => (value: string) => {
    setters[field](value);
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Focus the first invalid field after the re-render (fields are disabled while sending).
  const focusNextInvalid = useRef(false);
  useEffect(() => {
    if (!focusNextInvalid.current || formState === "sending") return;
    focusNextInvalid.current = false;
    const first = FIELD_ORDER.find((k) => fieldErrors[k]);
    if (first) document.getElementById(fieldId(first))?.focus();
  }, [fieldErrors, formState]);
  const focusFirstInvalid = () => {
    focusNextInvalid.current = true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formState === "sending") return;

    const errors = validate(values);
    if (Object.keys(errors).length > 0) {
      track("form_submit_error", { form_name: "book_call", error_type: "validation", error_count: Object.keys(errors).length });
      setFieldErrors(errors);
      setFormState("error");
      setFormError("");
      focusFirstInvalid();
      return;
    }

    setFormState("sending");
    setFormError("");
    setFieldErrors({});
    const selectedService = services.find((s) => s.slug === serviceSlug);
    const body = {
      name: name.trim(),
      email: email.trim(),
      company: businessType.trim(),
      service: selectedService ? selectedService.name.slice(0, 100) : "book-call",
      message: message.trim(),
      phone: phone.trim(),
      consentNonMarketing,
      consentMarketing,
      honeypot,
      formAge: Date.now() - openedAt.current,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string> };
      if (!res.ok) {
        // Server-side field messages map back onto the same inputs (company is the Business Type field).
        const serverErrors: FieldErrors = {};
        for (const [key, msg] of Object.entries(data.fields ?? {})) {
          const k = (key === "company" ? "businessType" : key) as FieldKey;
          if (FIELD_ORDER.includes(k)) serverErrors[k] = msg;
        }
        if (Object.keys(serverErrors).length > 0) {
          track("form_submit_error", { form_name: "book_call", error_type: "validation", error_count: Object.keys(serverErrors).length });
          setFieldErrors(serverErrors);
          setFormState("error");
          focusFirstInvalid();
          return;
        }
        throw new Error(data.error || "Something went wrong on our side.");
      }
      track("form_submit_success", { form_name: "book_call", service: selectedService?.slug ?? "none" });
      formStarted.current = false;
      setSubmittedEmail(body.email);
      setFormState("success");
      setName("");
      setEmail("");
      setPhone("");
      setBusinessType("");
      setMessage("");
      setServiceSlug("");
      setConsentNonMarketing(false);
      setConsentMarketing(false);
      openedAt.current = Date.now();
    } catch (err: unknown) {
      track("form_submit_error", { form_name: "book_call", error_type: err instanceof TypeError ? "network" : "server" });
      // Entered data is kept so nothing needs retyping.
      setFormState("error");
      setFormError(
        err instanceof TypeError
          ? "We couldn't reach the server. Check your connection and press the button again, or email us directly."
          : `${err instanceof Error ? err.message : "Something went wrong."} Press the button to try again, or email us directly.`,
      );
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
                    href="mailto:harsh.khanna@weseegpt.com"
                    style={{
                      color: "var(--ink)",
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(17,19,23,0.30)",
                      paddingBottom: 1,
                    }}
                  >
                    harsh.khanna@weseegpt.com
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

              <form onSubmit={handleSubmit} onFocusCapture={trackFormStart} noValidate aria-busy={formState === "sending"} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Honeypot — hidden from people and assistive tech, bots fill it. No CAPTCHA, so nobody is blocked. */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
                  <label>
                    Leave this field empty
                    <input
                      type="text"
                      name="company_website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </label>
                </div>

                {formState === "success" ? (
                  <div
                    ref={statusRef}
                    tabIndex={-1}
                    role="status"
                    aria-live="polite"
                    style={{
                      padding: "18px 18px",
                      background: "rgba(34, 120, 72, 0.08)",
                      border: "1px solid rgba(34, 120, 72, 0.22)",
                      borderRadius: 10,
                      color: "rgb(24, 100, 58)",
                      fontSize: 14,
                      lineHeight: 1.55,
                      outline: "none",
                    }}
                  >
                    <strong style={{ display: "block", fontSize: 16, marginBottom: 4 }}>Request received</strong>
                    Thanks. We&apos;ll follow up at {submittedEmail} shortly.
                    <button
                      type="button"
                      onClick={() => setFormState("idle")}
                      style={{
                        display: "block",
                        marginTop: 12,
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        color: "rgb(24, 100, 58)",
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{ ...serifNote, margin: 0 }}>
                      Fields marked <span style={{ color: linkRust }}>*</span> are required.
                    </p>

                    {formState === "error" && (
                      <div
                        ref={statusRef}
                        tabIndex={-1}
                        role="alert"
                        style={{
                          padding: "14px 16px",
                          background: "rgba(176, 44, 44, 0.06)",
                          border: "1px solid rgba(176, 44, 44, 0.2)",
                          borderRadius: 10,
                          color: errorRed,
                          fontSize: 14,
                          lineHeight: 1.5,
                          outline: "none",
                        }}
                      >
                        {formError ? (
                          <>
                            {formError}{" "}
                            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: errorRed, fontWeight: 600 }}>
                              {CONTACT_EMAIL}
                            </a>
                          </>
                        ) : (
                          `Please fix ${Object.values(fieldErrors).filter(Boolean).length === 1 ? "the field" : "the fields"} marked below, then send again.`
                        )}
                      </div>
                    )}

                    <fieldset disabled={formState === "sending"} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
                      <TextField field="name" label="Full Name" autoComplete="name" value={name} onChange={update("name")} error={fieldErrors.name} />
                      <TextField field="email" label="Business Email" type="email" autoComplete="email" value={email} onChange={update("email")} error={fieldErrors.email} />
                      <TextField
                        field="phone"
                        label="Phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={phone}
                        onChange={update("phone")}
                        error={fieldErrors.phone}
                        hint="Digits only, with country code, e.g. 919876543210."
                      />
                      <TextField
                        field="businessType"
                        label="Business Type"
                        autoComplete="organization"
                        placeholder="e.g. SaaS, agency, retail"
                        value={businessType}
                        onChange={update("businessType")}
                        error={fieldErrors.businessType}
                      />

                      <div>
                        <label htmlFor="bookcall-service" style={fieldLabel}>
                          Service you&apos;re interested in <span style={{ ...serifNote, fontSize: 12 }}>(optional)</span>
                        </label>
                        <select
                          id="bookcall-service"
                          name="service"
                          value={serviceSlug}
                          onChange={(e) => setServiceSlug(e.target.value)}
                          onFocus={focusStyle}
                          onBlur={(e) => blurStyle(e, false)}
                          style={inputBase}
                        >
                          <option value="">Not sure yet / general discovery call</option>
                          {serviceGroups.map((g) => (
                            <optgroup key={g.category} label={g.category}>
                              {g.items.map((s) => (
                                <option key={s.slug} value={s.slug}>
                                  {s.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      <TextField
                        field="message"
                        label="Message"
                        multiline
                        placeholder="What would you like to cover on the call?"
                        value={message}
                        onChange={update("message")}
                        error={fieldErrors.message}
                      />

                      <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={consentNonMarketing}
                          onChange={(e) => setConsentNonMarketing(e.target.checked)}
                          style={{ marginTop: 3, width: 16, height: 16, accentColor: linkRust, flexShrink: 0 }}
                        />
                        <span style={serifNote}>
                          (Optional) I agree to receive non-marketing texts from WeSee about AI automation and call scheduling. Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out.
                        </span>
                      </label>
                      <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={consentMarketing}
                          onChange={(e) => setConsentMarketing(e.target.checked)}
                          style={{ marginTop: 3, width: 16, height: 16, accentColor: linkRust, flexShrink: 0 }}
                        />
                        <span style={serifNote}>
                          (Optional) I agree to receive marketing messages from WeSee. Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.
                        </span>
                      </label>
                    </fieldset>

                    <p style={{ ...serifNote, margin: 0 }}>
                      We use these details only to reply to your request. By sending this form you agree to our{" "}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: linkRust }}>
                        Privacy Policy
                      </a>{" "}
                      and{" "}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: linkRust }}>
                        Terms
                      </a>
                      .
                    </p>

                    <button
                      type="submit"
                      disabled={formState === "sending"}
                      style={{
                        marginTop: 4,
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
                    <span role="status" aria-live="polite" style={{ position: "absolute", left: "-9999px" }}>
                      {formState === "sending" ? "Sending your request" : ""}
                    </span>
                  </>
                )}
              </form>
            </div>
        </div>
      </div>
    </section>
  );
}
