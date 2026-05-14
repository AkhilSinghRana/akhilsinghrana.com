"use client"
import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ABOUT_BIO, SKILLS } from "@/data/about"

export default function AboutSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", paddingTop: 24, paddingBottom: 24, overflowY: "auto" }}>
      <motion.div
        style={{ width: "100%", maxWidth: 860, textAlign: "center" }}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55 }}
      >
        <h2 style={{ fontFamily: "var(--font-sora)", color: "var(--text)", fontSize: "2rem", fontWeight: 700, marginBottom: 6 }}>
          About Me
        </h2>
        <div style={{ width: 48, height: 3, background: "var(--accent)", margin: "0 auto 20px", borderRadius: 2 }} />

        <motion.div
          style={{ display: "flex", flexDirection: "column", gap: 12, color: "var(--muted)", fontSize: "0.94rem", lineHeight: 1.75, textAlign: "left" }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {ABOUT_BIO.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </motion.div>

        {/* Skills */}
        <motion.div
          style={{ marginTop: 28, marginBottom: 24 }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <h3 style={{ fontFamily: "var(--font-sora)", color: "var(--text)", fontSize: "1.1rem", fontWeight: 600, marginBottom: 16, textAlign: "center" }}>
            Skills &amp; Expertise
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {SKILLS.map((skill) => (
              <motion.span
                key={skill}
                style={{
                  padding: "7px 16px",
                  borderRadius: 999,
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  background: "rgba(34,211,238,0.08)",
                  color: "var(--accent)",
                  border: "1px solid rgba(34,211,238,0.25)",
                }}
                whileHover={{ scale: 1.06, background: "rgba(34,211,238,0.15)" } as never}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
