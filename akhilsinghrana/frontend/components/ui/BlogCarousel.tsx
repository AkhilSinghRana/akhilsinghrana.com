"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BLOGS } from "@/data/blogs"

interface Props {
  onBlogOpen: (slug: string) => void
}

export default function BlogCarousel({ onBlogOpen }: Props) {
  const [start, setStart] = useState(0)
  const visible = 2

  const prev = () => setStart((s) => Math.max(0, s - 1))
  const next = () => setStart((s) => Math.min(BLOGS.length - visible, s + 1))

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-hidden">
        {BLOGS.slice(start, start + visible).map((blog) => (
          <motion.div
            key={blog.slug}
            className="flex-1 glass p-4 rounded-xl cursor-pointer min-w-0"
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => onBlogOpen(blog.slug)}
          >
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-36 object-cover rounded-lg mb-3"
            />
            <h3
              className="font-semibold text-sm mb-2 line-clamp-2"
              style={{ color: "var(--text)" }}
            >
              {blog.title}
            </h3>
            <p className="text-xs line-clamp-3 mb-3" style={{ color: "var(--muted)" }}>
              {blog.summary}
            </p>
            <button
              className="text-xs font-semibold"
              style={{ color: "var(--accent)" }}
            >
              Read More →
            </button>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center gap-3 mt-4">
        <button
          onClick={prev}
          disabled={start === 0}
          className="p-2 rounded-full transition-all disabled:opacity-30"
          style={{ background: "var(--surface)", color: "var(--text)" }}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={next}
          disabled={start >= BLOGS.length - visible}
          className="p-2 rounded-full transition-all disabled:opacity-30"
          style={{ background: "var(--surface)", color: "var(--text)" }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
