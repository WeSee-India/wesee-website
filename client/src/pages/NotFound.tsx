import { Link } from "wouter";

// A checkerboard of 4s and 0s, so "404" reads along every row and down every column.
const ROWS = 14;
const COLS = 18;
const PAD = 2; // extra cells off-screen on each side, so sliding never reveals an edge
const CELL_W = 0.62; // em
const CELL_H = 0.78; // em

/*
  Each cycle: rows slide one cell sideways (alternate rows in opposite directions),
  hold, then columns slide one cell vertically (alternate columns opposite), hold.
  Each step flips the checkerboard, so after both steps the pattern matches the start
  and the reset to 0 is invisible. The four keyframe sets cover row/column parity.
*/
const step = (x: number, y: number) => `
  0%, 14% { transform: translate(0, 0); }
  38%, 52% { transform: translate(${x * CELL_W}em, 0); }
  76%, 100% { transform: translate(${x * CELL_W}em, ${y * CELL_H}em); }`;

export default function NotFound() {
  return (
    <section
      aria-labelledby="not-found-title"
      style={{ position: "relative", height: "100vh", minHeight: 520, overflow: "hidden", background: "#F8F8F6" }}
    >
      <style>{`
        @keyframes nf-ee {${step(1, 1)}}
        @keyframes nf-eo {${step(1, -1)}}
        @keyframes nf-oe {${step(-1, 1)}}
        @keyframes nf-oo {${step(-1, -1)}}
        .nf-cell {
          position: absolute;
          width: ${CELL_W}em;
          height: ${CELL_H}em;
          text-align: center;
          animation-duration: 4.2s;
          animation-iteration-count: infinite;
          animation-timing-function: cubic-bezier(0.83, 0, 0.17, 1);
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) { .nf-cell { animation: none !important; } }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          fontSize: "min(32vh, 34vw)",
          fontWeight: 700,
          lineHeight: CELL_H,
          letterSpacing: "-0.02em",
          color: "#111317",
          userSelect: "none",
        }}
      >
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const kf = `nf-${r % 2 ? "o" : "e"}${c % 2 ? "o" : "e"}`;
          return (
            <span
              key={i}
              className="nf-cell"
              style={{
                left: `${(c - PAD) * CELL_W}em`,
                top: `${(r - PAD) * CELL_H}em`,
                animationName: kf,
              }}
            >
              {(r + c) % 2 ? "0" : "4"}
            </span>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 40,
          width: "fit-content",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "10px 10px 10px 20px",
          background: "rgba(248, 248, 246, 0.9)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(17, 19, 23, 0.1)",
          borderRadius: 999,
          whiteSpace: "nowrap",
        }}
      >
        <h1 id="not-found-title" style={{ fontSize: 13, fontWeight: 500, color: "#111317", margin: 0 }}>
          Page not found
        </h1>
        <Link
          href="/"
          style={{
            padding: "10px 18px",
            background: "#111317",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 999,
            textDecoration: "none",
          }}
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
