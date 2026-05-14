"use client"
import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { PUBLICATIONS, EDUCATION } from "@/data/publications"

export default function PublicationsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  const [hovered, setHovered] = useState(0)

  return (
    <div ref={ref} className="flex flex-col h-full py-10">
      <motion.h2
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        Publications
      </motion.h2>

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Left: preview image */}
        <motion.div
          className="md:w-72 flex-shrink-0"
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="sticky top-10">
            <img
              src={PUBLICATIONS[hovered].preview}
              alt={PUBLICATIONS[hovered].title}
              className="w-full rounded-xl object-cover"
              style={{ border: "1px solid var(--border)", maxHeight: 300 }}
            />
          </div>
        </motion.div>

        {/* Right: list */}
        <div className="flex-1 flex flex-col gap-8">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {PUBLICATIONS.map((pub, i) => (
              <div
                key={i}
                className="p-4 rounded-xl cursor-pointer transition-all"
                style={{
                  background: hovered === i ? "rgba(34,211,238,0.06)" : "transparent",
                  border: `1px solid ${hovered === i ? "var(--accent)" : "var(--border)"}`,
                }}
                onMouseEnter={() => setHovered(i)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full mr-2"
                      style={{ background: "rgba(34,211,238,0.15)", color: "var(--accent)" }}
                    >
                      {pub.venue}
                    </span>
                    <p
                      className="text-sm font-medium mt-2 leading-snug"
                      style={{ color: "var(--text)" }}
                    >
                      {pub.title}
                    </p>
                  </div>
                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 mt-1"
                    style={{ color: "var(--accent)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Education */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3
              className="text-xl font-bold mb-4"
              style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}
            >
              Education
            </h3>
            <div className="space-y-3">
              {EDUCATION.map((edu, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                    {edu.degree}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    {edu.school} · {edu.years}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
