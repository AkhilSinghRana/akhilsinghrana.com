"use client"
import { useRef, useState, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { PUBLICATIONS, EDUCATION } from "@/data/publications"

export default function PublicationsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const [hovered, setHovered] = useState(0)
  const [paused, setPaused] = useState(false)

  // Auto-scroll through publications
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setHovered((i) => (i + 1) % PUBLICATIONS.length), 3500)
    return () => clearInterval(id)
  }, [paused])

  return (
    <div ref={ref} className="pub-layout" style={{ display: "flex", height: "100%", gap: 28 }}>

      {/* Left: large PDF-viewer mockup — fills full height */}
      <motion.div
        className="pub-viewer"
        style={{ flex: "0 0 44%", height: "100%", display: "flex", flexDirection: "column" }}
        initial={{ opacity: 0, x: -30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.55, delay: 0.1 }}
      >
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,211,238,0.2)",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Browser chrome bar */}
          <div style={{ background: "#f1f5f9", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e" }} />
            <div style={{ flex: 1, height: 20, borderRadius: 4, background: "#e2e8f0", marginLeft: 8 }} />
          </div>
          {/* Paper preview — fills remaining height */}
          <motion.img
            key={hovered}
            src={PUBLICATIONS[hovered].preview}
            alt={PUBLICATIONS[hovered].title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1, width: "100%", objectFit: "contain", objectPosition: "top center", display: "block" }}
          />
        </div>
      </motion.div>

      {/* Right: publications list + education — scrollable */}
      <div
        style={{ flex: 1, height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 28 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.15 }}
        >
          <h2 style={{ fontFamily: "var(--font-sora)", color: "var(--accent)", fontSize: "1.7rem", fontWeight: 700, marginBottom: 6 }}>
            Publications
          </h2>
          <div style={{ height: 2, background: "linear-gradient(to right, var(--accent), transparent)", borderRadius: 1, marginBottom: 18 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {PUBLICATIONS.map((pub, i) => (
              <motion.div
                key={i}
                onMouseEnter={() => setHovered(i)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: hovered === i ? "rgba(34,211,238,0.07)" : "transparent",
                  borderLeft: `3px solid ${hovered === i ? "var(--accent)" : "transparent"}`,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  transition: "background 0.2s, border-color 0.2s",
                }}
                whileHover={{ x: 2 }}
              >
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent)", background: "rgba(34,211,238,0.12)", padding: "2px 8px", borderRadius: 999 }}>
                    {pub.venue}
                  </span>
                  <p style={{ color: hovered === i ? "var(--text)" : "var(--muted)", fontSize: "0.88rem", lineHeight: 1.5, marginTop: 5, transition: "color 0.2s" }}>
                    {pub.title}
                  </p>
                </div>
                <a href={pub.url} target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--accent)", flexShrink: 0, marginTop: 4 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={14} />
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 style={{ fontFamily: "var(--font-sora)", color: "var(--accent)", fontSize: "1.7rem", fontWeight: 700, marginBottom: 6 }}>
            Education
          </h2>
          <div style={{ height: 2, background: "linear-gradient(to right, var(--accent), transparent)", borderRadius: 1, marginBottom: 18 }} />
          {EDUCATION.map((edu, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ color: "var(--accent)", marginTop: 4, flexShrink: 0 }}>•</span>
              <div>
                <p style={{ color: "var(--text)", fontSize: "0.9rem", fontWeight: 500 }}>{edu.degree}</p>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 2 }}>- {edu.school} ({edu.years})</p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  )
}
