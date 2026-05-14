"use client"
import { motion } from "framer-motion"
import { useActiveSection } from "@/hooks/useActiveSection"

const SECTIONS = ["home", "blog", "about", "publications"]

export default function DotNav() {
  const active = useActiveSection(SECTIONS)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
      {SECTIONS.map((id) => (
        <motion.button
          key={id}
          onClick={() => scrollTo(id)}
          title={id}
          animate={{
            width: active === id ? 10 : 6,
            height: active === id ? 10 : 6,
            background: active === id ? "var(--accent)" : "var(--muted)",
          }}
          className="rounded-full"
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      ))}
    </div>
  )
}
