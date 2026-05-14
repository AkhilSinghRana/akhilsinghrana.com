"use client"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { BLOGS } from "@/data/blogs"
import BlogCarousel from "@/components/ui/BlogCarousel"

interface Props {
  onBlogOpen: (slug: string) => void
}

export default function BlogSection({ onBlogOpen }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  const featured = BLOGS[0]

  return (
    <div ref={ref} className="flex flex-col h-full py-10">
      <motion.h2
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        Blogs
      </motion.h2>

      {/* Featured blog */}
      <motion.div
        className="glass flex flex-col md:flex-row gap-6 p-5 mb-8 cursor-pointer"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ y: -4, scale: 1.01 }}
        onClick={() => onBlogOpen(featured.slug)}
      >
        <img
          src={featured.image}
          alt={featured.title}
          className="w-full md:w-64 h-48 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex flex-col justify-center">
          <span
            className="text-xs font-semibold mb-2 uppercase tracking-wide"
            style={{ color: "var(--accent)" }}
          >
            Featured
          </span>
          <h3
            className="text-xl font-bold mb-3"
            style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}
          >
            {featured.title}
          </h3>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--muted)" }}>
            {featured.summary}
          </p>
          {featured.highlights.length > 0 && (
            <ul className="text-xs space-y-1">
              {featured.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
                  <span style={{ color: "var(--accent)" }}>✓</span> {h}
                </li>
              ))}
            </ul>
          )}
          <button
            className="mt-4 self-start text-sm font-semibold"
            style={{ color: "var(--accent)" }}
          >
            Read More →
          </button>
        </div>
      </motion.div>

      {/* Blog carousel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <BlogCarousel onBlogOpen={onBlogOpen} />
      </motion.div>
    </div>
  )
}
