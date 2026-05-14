"use client"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { BLOGS } from "@/data/blogs"

interface Props {
  onBlogOpen: (slug: string) => void
}

export default function BlogSection({ onBlogOpen }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const featured = BLOGS[0]

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", height: "100%", gap: 14 }}>

      {/* Featured blog — split layout: text left, image right */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55 }}
        onClick={() => onBlogOpen(featured.slug)}
        className="blog-featured-card"
        style={{
          flex: 1,
          cursor: "pointer",
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid var(--card-border)",
          background: "var(--card-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          minHeight: 0,
        }}
      >
        {/* Left: text content */}
        <div className="blog-featured-text" style={{ padding: "28px 28px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ color: "var(--accent)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14, display: "block" }}>
            ★ Featured Article
          </span>
          <h2 style={{ fontFamily: "var(--font-sora)", color: "var(--text)", fontSize: "1.75rem", fontWeight: 800, marginBottom: 14, lineHeight: 1.3 }}>
            {featured.title}
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.7, marginBottom: 18 }}>
            {featured.summary}
          </p>
          {featured.highlights.length > 0 && (
            <ul style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 24 }}>
              {featured.highlights.map((h, i) => (
                <li key={i} style={{ color: "var(--muted)", fontSize: "0.83rem", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--accent)", flexShrink: 0, fontWeight: 700 }}>✓</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
          <motion.span
            style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.92rem", display: "inline-flex", alignItems: "center", gap: 6, width: "fit-content" }}
            whileHover={{ x: 5 }}
          >
            Read Full Article →
          </motion.span>
        </div>

        {/* Right: image preview */}
        <div className="blog-featured-img" style={{ position: "relative", overflow: "hidden", background: "var(--surface)", borderLeft: "1px solid var(--card-border)" }}>
          <img
            src={featured.image}
            alt={featured.title}
            style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", padding: 20 }}
          />
          {/* subtle overlay fade on left edge */}
          <div style={{
            position: "absolute", inset: 0, left: 0,
            background: "linear-gradient(to right, var(--card-bg) 0%, transparent 18%)",
            pointerEvents: "none",
          }} />
        </div>
      </motion.div>

      {/* Mini blog cards */}
      <motion.div
        className="mini-blog-row"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45, delay: 0.2 }}
        style={{ gap: 14, flex: "0 0 auto" }}
      >
        {BLOGS.map((blog, idx) => (
          <motion.div
            key={blog.slug}
            onClick={() => onBlogOpen(blog.slug)}
            style={{
              flex: 1, cursor: "pointer", borderRadius: 14, padding: "14px 18px",
              background: "var(--card-bg)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
              border: "1px solid var(--card-border)", display: "flex", flexDirection: "column", gap: 6, color: "var(--text)",
            }}
            whileHover={{ y: -3, borderColor: "rgba(34,211,238,0.45)" } as never}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Blog {idx + 1}
            </span>
            <h3 style={{ fontFamily: "var(--font-sora)", color: "var(--text)", fontSize: "0.86rem", fontWeight: 600, lineHeight: 1.4 }}>
              {blog.title}
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "0.77rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {blog.summary}
            </p>
            <motion.span style={{ color: "var(--accent)", fontSize: "0.78rem", fontWeight: 600, marginTop: "auto" }} whileHover={{ x: 3 }}>
              Read More →
            </motion.span>
          </motion.div>
        ))}
      </motion.div>

    </div>
  )
}
