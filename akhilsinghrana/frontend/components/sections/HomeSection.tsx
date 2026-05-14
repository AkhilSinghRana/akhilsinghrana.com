"use client"
import { motion, type Variants, type Transition } from "framer-motion"
import PortfolioCarousel from "@/components/ui/PortfolioCarousel"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: "easeOut" } as Transition,
  }),
}

export default function HomeSection() {
  return (
    // Single unified card filling the full area
    <motion.div
      custom={0} variants={fadeUp} initial="hidden" animate="visible"
      className="glass"
      style={{ height: "100%", display: "flex", flexDirection: "column", padding: "28px 36px 20px", overflow: "hidden" }}
    >
      {/* ── Intro strip ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-sora)", color: "var(--accent)", fontSize: "2.2rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 8 }}>
            Hi, There! 👋
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: 560 }}>
            I&apos;m glad you&apos;re here. This space is a little corner of the internet where I share my
            thoughts, experiences, and interests. Feel free to explore and don&apos;t hesitate to reach
            out — I&apos;m always interested in connecting with new people.
          </p>
        </div>
        <motion.div
          custom={1} variants={fadeUp} initial="hidden" animate="visible"
          style={{ display: "flex", gap: 12, flexShrink: 0 }}
        >
          <motion.button
            onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            style={{ padding: "10px 22px", borderRadius: 8, background: "var(--surface)", color: "var(--text)", fontSize: "0.88rem", fontWeight: 600, border: "1px solid var(--border)", cursor: "pointer" }}
            whileHover={{ scale: 1.04, borderColor: "var(--accent)" } as never}
            whileTap={{ scale: 0.97 }}
          >About Me</motion.button>
          <motion.button
            onClick={() => document.getElementById("blog")?.scrollIntoView({ behavior: "smooth" })}
            style={{ padding: "10px 22px", borderRadius: 8, background: "var(--accent)", color: "#0a0f1a", fontSize: "0.88rem", fontWeight: 700, border: "none", cursor: "pointer" }}
            whileHover={{ opacity: 0.88, scale: 1.04 } as never}
            whileTap={{ scale: 0.97 }}
          >My Blogs</motion.button>
        </motion.div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: "linear-gradient(to right, transparent, var(--accent), transparent)", opacity: 0.3, marginBottom: 18, flexShrink: 0 }} />

      {/* ── Portfolio section — fills remaining height ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <h2 style={{ fontFamily: "var(--font-sora)", color: "var(--text)", fontSize: "1.1rem", fontWeight: 700, textAlign: "center", marginBottom: 12, flexShrink: 0 }}>
          Portfolio Overview
        </h2>
        <div style={{ flex: 1, minHeight: 0 }}>
          <PortfolioCarousel />
        </div>
      </div>
    </motion.div>
  )
}
