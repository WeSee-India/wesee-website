import { useEffect } from "react";
import ParticleWrapper from "@/components/ParticleWrapper";
import HoverParticles from "@/components/HoverParticles";

export default function BookCall() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://link.msgsndr.com/js/form_embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
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
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 40,
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

          {/* Layout: details + scheduler */}
          <div
            className="fade-up"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 26,
              animationDelay: "0.15s",
            }}
          >
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
                    href="mailto:support@weseegpt.com"
                    style={{
                      color: "var(--ink)",
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(17,19,23,0.30)",
                      paddingBottom: 1,
                    }}
                  >
                    support@weseegpt.com
                  </a>
                </div>
              </div>
            </div>

            {/* Right: LeadConnector iframe */}
            <div
              className="fade-up"
              style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: 18,
                border: "1px solid rgba(17,19,23,0.06)",
                boxShadow: "0 14px 40px rgba(17,19,23,0.06)",
                padding: "20px",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                animationDelay: "0.25s",
                display: "flex",
                flexDirection: "column",
                minHeight: "665px"
              }}
            >
              <iframe
                src="https://api.leadconnectorhq.com/widget/form/14xBiRHft1TRyKrSRlev"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "3px"
                }}
                id="inline-14xBiRHft1TRyKrSRlev" 
                data-layout="{'id':'INLINE'}"
                data-trigger-type="alwaysShow"
                data-trigger-value=""
                data-activation-type="alwaysActivated"
                data-activation-value=""
                data-deactivation-type="neverDeactivate"
                data-deactivation-value=""
                data-form-name="WeSee Discovery Call Form"
                data-height="665"
                data-layout-iframe-id="inline-14xBiRHft1TRyKrSRlev"
                data-form-id="14xBiRHft1TRyKrSRlev"
                title="WeSee Discovery Call Form"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

