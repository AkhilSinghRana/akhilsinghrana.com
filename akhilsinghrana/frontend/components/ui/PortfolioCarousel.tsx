"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PORTFOLIO_ITEMS } from "@/data/portfolio"

export default function PortfolioCarousel() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const go = (dir: number) => {
    setDirection(dir)
    setIndex((i) => (i + dir + PORTFOLIO_ITEMS.length) % PORTFOLIO_ITEMS.length)
  }

  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(() => go(1), 4000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [paused, index])

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  }

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        borderRadius: 14,
        overflow: "hidden",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Image area — fills all available space */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35 }}
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface)" }}
          >
            <img
              src={PORTFOLIO_ITEMS[index].image}
              alt={PORTFOLIO_ITEMS[index].title}
              style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block" }}
            />
            {/* Caption overlay */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "20px 16px 10px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.72))",
            }}>
              <p style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 500 }}>
                {PORTFOLIO_ITEMS[index].title}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Arrow buttons */}
        <button
          onClick={() => go(-1)}
          style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", padding: "6px", borderRadius: "50%", background: "rgba(0,0,0,0.55)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => go(1)}
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", padding: "6px", borderRadius: "50%", background: "rgba(0,0,0,0.55)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "8px 0", flexShrink: 0 }}>
        {PORTFOLIO_ITEMS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i) }}
            style={{
              borderRadius: 999,
              width: i === index ? 18 : 7,
              height: 7,
              background: i === index ? "var(--accent)" : "var(--muted)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.25s",
            }}
          />
        ))}
      </div>
    </div>
  )
}
