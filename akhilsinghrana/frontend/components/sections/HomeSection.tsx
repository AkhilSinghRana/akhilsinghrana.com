"use client"
import { motion, type Variants, type Transition } from "framer-motion"
import PortfolioCarousel from "@/components/ui/PortfolioCarousel"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" } as Transition,
  }),
}

export default function HomeSection() {
  return (
    <div className="flex flex-col md:flex-row items-center gap-10 h-full">
      {/* Left: hero text */}
      <div className="flex-1 flex flex-col justify-center">
        <motion.h1
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-4xl md:text-5xl font-extrabold mb-4"
          style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}
        >
          Hi, There!{" "}
          <span style={{ color: "var(--accent)" }}>👋</span>
        </motion.h1>
        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-base leading-relaxed mb-6"
          style={{ color: "var(--muted)", maxWidth: 480 }}
        >
          I&apos;m glad you&apos;re here. This space is a little corner of the internet where I
          share my thoughts, experiences, and interests. I&apos;m a Senior Machine Learning
          Engineer specializing in Computer Vision, Remote Sensing, and AI research. Feel
          free to explore my work and get in touch!
        </motion.p>
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex gap-4 flex-wrap"
        >
          <button
            onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all"
            style={{ background: "var(--accent)", color: "#0a0f1a" }}
          >
            Read more about me
          </button>
          <button
            onClick={() => document.getElementById("blog")?.scrollIntoView({ behavior: "smooth" })}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all"
            style={{ border: "1px solid var(--accent)", color: "var(--accent)", background: "transparent" }}
          >
            My Blogs
          </button>
        </motion.div>
      </div>

      {/* Right: portfolio carousel */}
      <div className="flex-1 w-full max-w-lg">
        <PortfolioCarousel />
      </div>
    </div>
  )
}
