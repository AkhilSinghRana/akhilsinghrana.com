"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface Props {
  slug: string | null
  onClose: () => void
}

export default function BlogModal({ slug, onClose }: Props) {
  const [html, setHtml] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setHtml("")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    fetch(`${apiUrl}/api/blog/${slug}`)
      .then((r) => r.json())
      .then((data) => { setHtml(data.html || ""); setLoading(false) })
      .catch(() => { setHtml("<p>Failed to load blog.</p>"); setLoading(false) })
  }, [slug])

  return (
    <AnimatePresence>
      {slug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.7)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div
              className="flex items-center justify-between p-4 flex-shrink-0"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
                Blog Post
              </h3>
              <button onClick={onClose} style={{ color: "var(--muted)" }}>
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 rounded"
                      style={{ background: "var(--border)", width: `${80 - i * 5}%` }}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="prose prose-invert max-w-none"
                  style={{ color: "var(--text)" }}
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
