"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { BLOGS } from "@/data/blogs"

interface Props {
  slug: string | null
  onClose: () => void
}

export default function BlogModal({ slug, onClose }: Props) {
  const [html, setHtml] = useState("")
  const [loading, setLoading] = useState(false)
  const blog = BLOGS.find((b) => b.slug === slug)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setHtml("")
    // Fetch directly from static public/blogs/ — no backend needed
    fetch(`/blogs/${slug}.html`)
      .then((r) => {
        if (!r.ok) throw new Error("not found")
        return r.text()
      })
      .then((data) => { setHtml(data); setLoading(false) })
      .catch(() => {
        // fallback: try backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        fetch(`${apiUrl}/api/blog/${slug}`)
          .then((r) => r.json())
          .then((data) => { setHtml(data.html || "<p>Blog content unavailable.</p>"); setLoading(false) })
          .catch(() => { setHtml("<p>Failed to load blog content.</p>"); setLoading(false) })
      })
  }, [slug])

  return (
    <AnimatePresence>
      {slug && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <motion.div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            style={{ position: "relative", width: "100%", maxWidth: 880, maxHeight: "90vh", borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--surface)", border: "1px solid var(--border)" }}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div>
                <h3 style={{ color: "var(--text)", fontFamily: "var(--font-sora)", fontWeight: 700, fontSize: "1rem", marginBottom: 2 }}>
                  {blog?.title ?? "Blog Post"}
                </h3>
                <p style={{ color: "var(--muted)", fontSize: "0.78rem" }}>akhilsinghrana.com</p>
              </div>
              <motion.button
                onClick={onClose}
                style={{ color: "var(--muted)", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                whileHover={{ color: "var(--text)" } as never}
              >
                <X size={16} />
              </motion.button>
            </div>
            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} style={{ height: 14, borderRadius: 4, background: "var(--border)", width: `${85 - i * 4}%`, animation: "pulse 1.5s infinite" }} />
                  ))}
                </div>
              ) : (
                <div
                  style={{ color: "var(--text)", lineHeight: 1.8, fontSize: "0.92rem" }}
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
