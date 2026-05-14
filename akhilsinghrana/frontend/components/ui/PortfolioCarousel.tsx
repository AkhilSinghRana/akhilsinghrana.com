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
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-64 md:h-80">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <img
              src={PORTFOLIO_ITEMS[index].image}
              alt={PORTFOLIO_ITEMS[index].title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute bottom-0 left-0 right-0 p-3"
              style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }}
            >
              <p className="text-white text-sm font-medium">{PORTFOLIO_ITEMS[index].title}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <button
        onClick={() => go(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full"
        style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full"
        style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
      >
        <ChevronRight size={16} />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 py-2">
        {PORTFOLIO_ITEMS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i) }}
            className="rounded-full transition-all"
            style={{
              width: i === index ? 16 : 6,
              height: 6,
              background: i === index ? "var(--accent)" : "var(--muted)",
            }}
          />
        ))}
      </div>
    </div>
  )
}
