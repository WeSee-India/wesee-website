import { useEffect, useState, useRef } from "react";
import TextReveal from "@/components/TextReveal";
import ImageReveal from "@/components/ImageReveal";

import MagneticButton from "@/components/MagneticButton";
import ParticleWrapper from "@/components/ParticleWrapper";
import TiltCard from "@/components/TiltCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const contactTypes = [
  { label: "General enquiries", email: "hr@weseegpt.com", person: "WeSee Team", title: "General", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
  { label: "Business enquiries", email: "careers@weseegpt.com", person: "harsh khanna", title: "Founder & CEO", photo: "/client/harsh.webp" },
 
];

const offices = [
  { city: "Tokyo", country: "Japan", role: "Headquarters", address: "1 Chome-1-17 Nakameguro, Meguro City, Tokyo 153-0061, Japan", phone: "+81 0704 2332 201" ,map: "https://www.google.com/maps/place/Japan,+%E3%80%92153-0061+Tokyo,+Meguro+City,+Nakameguro,+1-ch%C5%8Dme%E2%88%921%E2%88%9217+%E3%83%9E%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%B3%E6%81%B5%E6%AF%94%E9%A0%88%E8%8B%91+102/@35.6439478,139.7037363,18.85z/data=!4m6!3m5!1s0x60188b47af800cd9:0x20304b16a49a858a!8m2!3d35.6442008!4d139.7034181!16s%2Fg%2F11vzdfqxf4?entry=ttu&g_ep=EgoyMDI2MDMzMC4wIKXMDSoASAFQAw%3D%3D"},
  { city: "Mumbai", country: "India", role: "Operations", address: "Hubtown Viva, 12th Floor, Saraswati Baug, Shankarwadi, Jogeshwari East, Mumbai, Maharashtra 400060", phone: "+91 8604 1091 07" ,map: "https://www.google.com/maps/place/Hubtown+Viva/@19.1313645,72.8531528,17z/data=!3m2!4b1!5s0x3be7b7d5b663c4ad:0x2f60ba818419208b!4m6!3m5!1s0x3be7b7cecfe0f0fd:0x82655eeb16d16558!8m2!3d19.1313594!4d72.8557277!16s%2Fg%2F11gjhnxbbv?entry=ttu&g_ep=EgoyMDI2MDMzMC4wIKXMDSoASAFQAw%3D%3D"},
 
];

export default function Contact() {
  const [openOffice, setOpenOffice] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", company: "", service: "", message: "" });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const contactCardsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const officeSectionRef = useRef<HTMLDivElement>(null);
  const officeContentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const localTriggers: ScrollTrigger[] = [];
    const timer = setTimeout(() => {
      // Form reveal animation with enhanced effects
      const reveals = document.querySelectorAll(".gsap-reveal");
      reveals.forEach((el) => {
        const anim = gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none"
            }
          }
        );
        if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
      });

      // Contact cards animation with rotation and blur
      if (contactCardsRef.current) {
        const cards = contactCardsRef.current.querySelectorAll(".contact-card");
        cards.forEach((card, i) => {
          const cardImg = card.querySelector("img");
          const cardContent = card.querySelector(".flex-1");

          // Card container animation
          const anim = gsap.fromTo(card,
            {
              opacity: 0,
              y: 30,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              delay: i * 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 90%",
                toggleActions: "play none none none"
              }
            }
          );
          if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);

          // Image animation
          if (cardImg) {
            gsap.fromTo(cardImg,
              { scale: 1.2, opacity: 0 },
              {
                scale: 1,
                opacity: 1,
                duration: 0.9,
                delay: i * 0.12 + 0.2,
                ease: "power2.out"
              }
            );
          }

          // Content animation
          if (cardContent) {
            gsap.fromTo(cardContent,
              { x: -20, opacity: 0 },
              {
                x: 0,
                opacity: 1,
                duration: 0.7,
                delay: i * 0.12 + 0.3,
                ease: "power3.out"
              }
            );
          }
        });
      }

      // Office accordion animation with enhanced effects
      if (officeSectionRef.current) {
        const officeItems = officeSectionRef.current.querySelectorAll(".office-item");
        officeItems.forEach((item, i) => {
          const anim = gsap.fromTo(item,
            {
              opacity: 0,
              y: 20,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              delay: i * 0.12,
              ease: "power3.out",
              scrollTrigger: {
                trigger: item,
                start: "top 90%",
                toggleActions: "play none none none"
              }
            }
          );
          if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
        });
      }

      // Form inputs staggered animation
      if (formRef.current) {
        const inputs = formRef.current.querySelectorAll("input, textarea, select");
        inputs.forEach((input, i) => {
          const anim = gsap.fromTo(input,
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              delay: i * 0.06,
              ease: "power2.out",
              scrollTrigger: {
                trigger: input,
                start: "top 92%",
                toggleActions: "play none none none"
              }
            }
          );
          if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
        });
      }

      // Button animation
      const submitButton = document.querySelector(".btn-fill-sweep");
      if (submitButton) {
        const anim = gsap.fromTo(submitButton,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: submitButton,
              start: "top 92%",
              toggleActions: "play none none none"
            }
          }
        );
        if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
      }
    }, 50);
    return () => { clearTimeout(timer); localTriggers.forEach(t => t.kill()); };
  }, []);

  // Office accordion expand/collapse animation
  useEffect(() => {
    officeContentRefs.current.forEach((el, i) => {
      if (!el) return;
      if (openOffice === i) {
        gsap.fromTo(el,
          { maxHeight: 0, opacity: 0, y: -20 },
          { maxHeight: 360, opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
        const children = el.querySelectorAll("div, a");
        children.forEach((child, idx) => {
          gsap.fromTo(child,
            { opacity: 0, x: -15 },
            { opacity: 1, x: 0, duration: 0.5, delay: idx * 0.1, ease: "power2.out" }
          );
        });
      } else {
        gsap.to(el, { maxHeight: 0, opacity: 0, y: -20, duration: 0.4, ease: "power2.in" });
      }
    });
  }, [openOffice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");
    setFormError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSubmittedEmail(formData.email);
      setFormState("success");
      setFormData({ name: "", email: "", company: "", service: "", message: "" });
    } catch (err: unknown) {
      setFormState("error");
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const inputStyle = (field: string) => ({
    width: "100%",
    padding: focusedField === field ? "12px 0 14px 0" : "14px 0",
    background: "none",
    fontSize: "clamp(14px, 1.5vw, 16px)",
    lineHeight: "1.5",
    color: "#1A1A1A",
    outline: "none",
    border: "none",
    borderBottom: focusedField === field ? "2px solid #1A1A1A" : "1px solid #E5E5E5",
    transition: "border-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease, transform 0.3s ease",
    transform: focusedField === field ? "translateX(2px)" : "translateX(0)",
  });

  return (
    <div className="contact-page" style={{ paddingTop: "clamp(48px, 6vw, 64px)" }}>
      <div className="section-padding">
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <span
              className="hidden md:inline-block"
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
              (01) CONTACT
            </span>
          </div>
          <TextReveal
            as="h1"
            className="contact-hero-title"
            style={{ fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.15 }}
            stagger={0.06}
            onScroll={false}
          >
            Get in touch.
          </TextReveal>
        </div>
      </div>

      <div style={{ width: "100%", height: "clamp(250px, 45vh, 400px)", overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=2000&q=80"
          alt="City"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          loading="lazy"
        />
      </div>

      {/* Contact types with hover effect */}
      <section className="section-padding">
        <div className="container">
          <div ref={contactCardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
            {contactTypes.map((ct) => (
              <ParticleWrapper key={ct.label}>
                <TiltCard maxTilt={5} scale={1.01}>
                  <a
                    href={`mailto:${ct.email}`}
                    className="contact-card group flex gap-4 md:gap-6 p-5 md:p-7 rounded-2xl transition-all duration-500 ease-out hover:bg-[#FAFAFA] hover:shadow-xl hover:scale-[1.02]"
                    style={{ cursor: "pointer", textDecoration: "none", background: "#FFFFFF", border: "1px solid #F0F0F0", transformStyle: "preserve-3d" }}
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, {
                        y: -4,
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                        duration: 0.4,
                        ease: "power2.out"
                      });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, {
                        y: 0,
                        boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
                        duration: 0.4,
                        ease: "power2.out"
                      });
                    }}
                  >
                    <div className="overflow-hidden rounded-xl relative" style={{ width: "clamp(64px, 8vw, 80px)", height: "clamp(64px, 8vw, 80px)", flexShrink: 0 }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                      <img
                        src={ct.photo}
                        alt={ct.person}
                        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)", transition: "filter 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
                        className="group-hover:!grayscale-0"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="group-hover:text-[#666666]"
                        style={{ fontSize: "clamp(10px, 1.2vw, 12px)", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888888", marginBottom: 10, transition: "color 0.3s ease" }}
                        onMouseEnter={(e) => {
                          gsap.to(e.currentTarget, { x: 2, duration: 0.3, ease: "power2.out" });
                        }}
                        onMouseLeave={(e) => {
                          gsap.to(e.currentTarget, { x: 0, duration: 0.3, ease: "power2.out" });
                        }}
                      >{ct.label}</div>
                      <div 
                        className="cta-link" 
                        style={{ fontSize: "clamp(15px, 1.8vw, 18px)", fontWeight: 600, color: "#1A1A1A", display: "block", marginBottom: 8, transition: "color 0.3s ease" }}
                        onMouseEnter={(e) => {
                          gsap.to(e.currentTarget, { scale: 1.02, x: 3, duration: 0.3, ease: "power2.out" });
                        }}
                        onMouseLeave={(e) => {
                          gsap.to(e.currentTarget, { scale: 1, x: 0, duration: 0.3, ease: "power2.out" });
                        }}
                      >{ct.email}</div>
                      <div style={{ fontSize: "clamp(13px, 1.5vw, 15px)", fontWeight: 400, color: "#666666", lineHeight: 1.6 }}>{ct.person} — {ct.title}</div>
                    </div>
                  </a>
                </TiltCard>
              </ParticleWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Offices accordion with smooth animation */}
      <section className="" style={{ borderTop: "1px solid #EEEEEE" }}>
        <div className="container">
          <TextReveal as="h2" className="section-heading" stagger={0.05}>
            Our offices.
          </TextReveal>
          <div ref={officeSectionRef} style={{ marginTop: "clamp(32px, 4vw, 48px)" }}>
            {offices.map((office, i) => (
              <div key={office.city} className="office-item" style={{ borderTop: i === 0 ? "none" : "1px solid #EEEEEE" }}>
                <ParticleWrapper>
                  <button
                    onClick={() => setOpenOffice(openOffice === i ? null : i)}
                    className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between group relative overflow-hidden"
                    style={{ padding: "clamp(20px, 3vw, 28px) clamp(16px, 2vw, 24px)", cursor: "pointer", background: "none", border: "none", textAlign: "left", transition: "background-color 0.3s ease", borderRadius: "12px" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div className="flex-1">
                      <span style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 600, color: "#1A1A1A", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", display: "inline-block" }} className="group-hover:translate-x-1">{office.city}</span>
                      <span style={{ fontSize: "clamp(13px, 1.5vw, 15px)", fontWeight: 400, color: "#888888", marginLeft: 12 }}>{office.country}</span>
                    </div>
                    <span style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 300, color: "#888888", transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s ease", transform: openOffice === i ? "rotate(45deg)" : "none", marginTop: "8px", alignSelf: "flex-start" }} className="sm:mt-0">{openOffice === i ? "×" : "+"}</span>
                  </button>
                </ParticleWrapper>
                <div 
                  ref={(el) => {
                    officeContentRefs.current[i] = el;
                  }}
                  style={{ maxHeight: openOffice === i ? 360 : 0, overflow: "hidden", opacity: openOffice === i ? 1 : 0 }}
                >
                  <div style={{ paddingBottom: "clamp(20px, 3vw, 28px)", paddingLeft: "clamp(16px, 2vw, 24px)" }}>
                    <div style={{ fontSize: "clamp(11px, 1.3vw, 13px)", fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{office.role}</div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <a
                        href={
                          office.map ??
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address.trim())}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${office.city} in maps`}
                        style={{
                          textDecoration: "none",
                          flexShrink: 0,
                          marginTop: 2,
                          lineHeight: 0,
                          transition: "transform 0.2s ease, opacity 0.2s ease",
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.08)";
                          e.currentTarget.style.opacity = "0.75";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.opacity = "1";
                        }}
                      >
                        <img
                          src="/locationsvg.svg"
                          alt=""
                          width={22}
                          height={22}
                          className="pointer-events-none block"
                          style={{ width: 22, height: 22 }}
                          aria-hidden
                        />
                      </a>
                      <div style={{ fontSize: "clamp(14px, 1.6vw, 16px)", fontWeight: 400, color: "#3A3A3A", lineHeight: 1.6, flex: 1, minWidth: 0 }}>
                        {office.address.trim()}
                      </div>
                    </div>
                    <a 
                      href={`tel:${office.phone.replace(/\s/g, "")}`} 
                      style={{ fontSize: "clamp(14px, 1.6vw, 16px)", fontWeight: 400, color: "#1A1A1A", textDecoration: "none", transition: "color 0.3s ease", display: "inline-block" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#666666";
                        gsap.to(e.currentTarget, { x: 3, duration: 0.3, ease: "power2.out" });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#1A1A1A";
                        gsap.to(e.currentTarget, { x: 0, duration: 0.3, ease: "power2.out" });
                      }}
                    >{office.phone}</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form with animated focus states */}
      <section className="section-padding" style={{ borderTop: "1px solid #EEEEEE" }}>
        <div className="container">
          <TextReveal as="h2" className="section-heading" stagger={0.05}>
            Or send us a message.
          </TextReveal>
          <form ref={formRef} onSubmit={handleSubmit} className="gsap-reveal" style={{ marginTop: "clamp(32px, 4vw, 48px)", maxWidth: "clamp(100%, 90vw, 720px)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <ParticleWrapper>
                <div>
                  <label style={{ fontSize: "clamp(10px, 1.2vw, 12px)", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: focusedField === "name" ? "#1A1A1A" : "#888888", display: "block", marginBottom: 12, transition: "color 0.3s ease" }}>{focusedField === "name" ? "Name *" : "Name"}</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    onFocus={(e) => {
                      setFocusedField("name");
                      gsap.to(e.currentTarget, { scale: 1.01, duration: 0.3, ease: "power2.out" });
                    }} 
                    onBlur={(e) => {
                      setFocusedField(null);
                      gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: "power2.out" });
                    }} 
                    style={inputStyle("name")} 
                    placeholder="Your full name" 
                  />
                </div>
              </ParticleWrapper>
              <ParticleWrapper>
                <div>
                  <label style={{ fontSize: "clamp(10px, 1.2vw, 12px)", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: focusedField === "email" ? "#1A1A1A" : "#888888", display: "block", marginBottom: 12, transition: "color 0.3s ease" }}>{focusedField === "email" ? "Email *" : "Email"}</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    onFocus={(e) => {
                      setFocusedField("email");
                      gsap.to(e.currentTarget, { scale: 1.01, duration: 0.3, ease: "power2.out" });
                    }} 
                    onBlur={(e) => {
                      setFocusedField(null);
                      gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: "power2.out" });
                    }} 
                    style={inputStyle("email")} 
                    placeholder="your.email@example.com" 
                  />
                </div>
              </ParticleWrapper>
            </div>
            <ParticleWrapper>
              <div style={{ marginTop: "clamp(20px, 3vw, 28px)" }}>
                <label style={{ fontSize: "clamp(10px, 1.2vw, 12px)", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: focusedField === "company" ? "#1A1A1A" : "#888888", display: "block", marginBottom: 12, transition: "color 0.3s ease" }}>Company</label>
                <input 
                  type="text" 
                  value={formData.company} 
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })} 
                  onFocus={(e) => {
                    setFocusedField("company");
                    gsap.to(e.currentTarget, { scale: 1.01, duration: 0.3, ease: "power2.out" });
                  }} 
                  onBlur={(e) => {
                    setFocusedField(null);
                    gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: "power2.out" });
                  }} 
                  style={inputStyle("company")} 
                  placeholder="Your company name" 
                />
              </div>
            </ParticleWrapper>
            <ParticleWrapper>
              <div style={{ marginTop: "clamp(20px, 3vw, 28px)" }}>
                <label style={{ fontSize: "clamp(10px, 1.2vw, 12px)", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: focusedField === "service" ? "#1A1A1A" : "#888888", display: "block", marginBottom: 12, transition: "color 0.3s ease" }}>Service of interest</label>
                <select 
                  value={formData.service} 
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })} 
                  onFocus={(e) => {
                    setFocusedField("service");
                    gsap.to(e.currentTarget, { scale: 1.01, duration: 0.3, ease: "power2.out" });
                  }} 
                  onBlur={(e) => {
                    setFocusedField(null);
                    gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: "power2.out" });
                  }} 
                  style={{ ...inputStyle("service"), cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231A1A1A' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px top 50%", paddingRight: "40px", paddingLeft: "12px" }}
                >
                  <option value="" style={{ paddingLeft: "12px" }}>Select a service</option>
                  <option value="ai-agents" style={{ paddingLeft: "12px" }}>AI Agents</option>
                  <option value="workflow-automation" style={{ paddingLeft: "12px" }}>Workflow Automation</option>
                  <option value="performance-marketing" style={{ paddingLeft: "12px" }}>Performance Marketing</option>
                  <option value="web-development" style={{ paddingLeft: "12px" }}>Web & App Development</option>
                  <option value="content-seo" style={{ paddingLeft: "12px" }}>Content & SEO</option>
                  <option value="crm" style={{ paddingLeft: "12px" }}>CRM & Sales Automation</option>
                  <option value="analytics" style={{ paddingLeft: "12px" }}>Analytics & BI</option>
                  <option value="consulting" style={{ paddingLeft: "12px" }}>AI Consulting</option>
                  <option value="other" style={{ paddingLeft: "12px" }}>Other</option>
                </select>
              </div>
            </ParticleWrapper>
            <ParticleWrapper>
              <div style={{ marginTop: "clamp(20px, 3vw, 28px)" }}>
                <label style={{ fontSize: "clamp(10px, 1.2vw, 12px)", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: focusedField === "message" ? "#1A1A1A" : "#888888", display: "block", marginBottom: 12, transition: "color 0.3s ease" }}>{focusedField === "message" ? "Message *" : "Message"}</label>
                <textarea 
                  rows={5} 
                  required 
                  value={formData.message} 
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
                  onFocus={(e) => {
                    setFocusedField("message");
                    gsap.to(e.currentTarget, { scale: 1.005, duration: 0.3, ease: "power2.out" });
                  }} 
                  onBlur={(e) => {
                    setFocusedField(null);
                    gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: "power2.out" });
                  }} 
                  style={{ ...inputStyle("message"), resize: "vertical", minHeight: "120px", lineHeight: "1.6" } as React.CSSProperties} 
                  placeholder="Tell us about your project..." 
                />
              </div>
            </ParticleWrapper>
            {formState === "success" && (
              <div style={{ marginTop: "clamp(28px, 4vw, 40px)", padding: "16px 20px", background: "#F0FAF4", border: "1px solid #BBE5CC", borderRadius: "8px", color: "#1A7A40", fontSize: 14, fontWeight: 500 }}>
                ✓ Message sent! We'll be in touch at {submittedEmail} soon.
              </div>
            )}
            {formState === "error" && (
              <div style={{ marginTop: "clamp(28px, 4vw, 40px)", padding: "16px 20px", background: "#FFF5F5", border: "1px solid #FFCCCC", borderRadius: "8px", color: "#C0392B", fontSize: 14, fontWeight: 500 }}>
                ✕ {formError}
              </div>
            )}
            {formState !== "success" && (
              <ParticleWrapper>
                <MagneticButton
                  as="button"
                  type="submit"
                  className="btn-fill-sweep"
                  disabled={formState === "sending"}
                  style={{ marginTop: "clamp(28px, 4vw, 40px)", padding: "clamp(14px, 2vw, 18px) clamp(28px, 4vw, 36px)", background: formState === "sending" ? "#555555" : "#1A1A1A", color: "#FFFFFF", fontSize: "clamp(12px, 1.4vw, 14px)", fontWeight: 500, border: "none", borderRadius: "8px", transition: "all 0.3s ease", cursor: formState === "sending" ? "not-allowed" : "pointer", boxShadow: "0 4px 12px rgba(26, 26, 26, 0.15)", opacity: formState === "sending" ? 0.7 : 1 }}
                  strength={0.2}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (formState === "sending") return;
                    gsap.to(e.currentTarget, { scale: 1.05, boxShadow: "0 8px 24px rgba(26, 26, 26, 0.25)", duration: 0.3, ease: "power2.out" });
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    gsap.to(e.currentTarget, { scale: 1, boxShadow: "0 4px 12px rgba(26, 26, 26, 0.15)", duration: 0.3, ease: "power2.out" });
                  }}
                >
                  {formState === "sending" ? "Sending..." : "Send message +"}
                </MagneticButton>
              </ParticleWrapper>
            )}
          </form>
        </div>
      </section>

      <ImageReveal
        src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=2000&q=80"
        alt="City"
        direction="up"
        parallax
        parallaxAmount={40}
        zoom={false}
        style={{ width: "100%", height: "clamp(280px, 35vh, 420px)" }}
      />
    </div>
  );
}
