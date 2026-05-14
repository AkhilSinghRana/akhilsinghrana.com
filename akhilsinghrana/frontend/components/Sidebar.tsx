"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, BookOpen, User, FileText, Menu, X } from "lucide-react"

const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

const LinkedinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

import { useActiveSection } from "@/hooks/useActiveSection"
import { NAV_ITEMS } from "@/data/navigation"

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home size={20} />,
  BookOpen: <BookOpen size={20} />,
  User: <User size={20} />,
  FileText: <FileText size={20} />,
}

const SECTION_IDS = ["home", "blog", "about", "publications"]

interface Props {
  onContactOpen: () => void
  onSupportOpen: () => void
}

export default function Sidebar({ onContactOpen, onSupportOpen }: Props) {
  const activeSection = useActiveSection(SECTION_IDS)
  const [mobileOpen, setMobileOpen] = useState(false)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setMobileOpen(false)
  }

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "24px 16px 20px" }}>
      {/* Profile */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
        <img
          src="/static/Extra/imgs/akhil-pp.jpg"
          alt="Akhil Singh Rana"
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            border: "3px solid var(--accent)",
            objectFit: "cover",
            marginBottom: 14,
            boxShadow: "0 0 24px rgba(34,211,238,0.35)",
          }}
        />
        <h2 style={{ fontFamily: "var(--font-sora)", color: "var(--text)", fontSize: "1.2rem", fontWeight: 700, textAlign: "center", marginBottom: 4 }}>
          Akhil Singh Rana
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "0.82rem", textAlign: "center", marginBottom: 12 }}>
          Senior Machine Learning Engineer
        </p>
        {/* Social links with text */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <a href="https://linkedin.com/in/akhilsinghrana" target="_blank" rel="noopener noreferrer"
            style={{ color: "#0a66c2", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", fontWeight: 600, textDecoration: "none", transition: "opacity 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <LinkedinIcon /> LinkedIn
          </a>
          <span style={{ color: "var(--muted)" }}>,</span>
          <a href="https://github.com/AkhilSinghRana" target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--text)", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", fontWeight: 600, textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
          >
            <GithubIcon /> Github
          </a>
          <span style={{ color: "var(--muted)" }}>,</span>
          <a href="https://orcid.org/0000-0001-9630-2051" target="_blank" rel="noopener noreferrer"
            style={{ color: "#a6ce39", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none", transition: "opacity 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            ORCID
          </a>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: "100%", height: 1, background: "var(--border)", marginBottom: 8 }} />

      {/* Nav — centered */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "11px 12px",
                borderRadius: 8,
                fontSize: "1rem",
                fontWeight: 500,
                width: "100%",
                border: "none",
                cursor: "pointer",
                color: isActive ? "var(--accent)" : "var(--muted)",
                background: isActive ? "rgba(34,211,238,0.08)" : "transparent",
                borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                transition: "color 0.15s, background 0.15s",
              }}
              whileHover={{ x: 3, color: "var(--text)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {ICON_MAP[item.icon]}
              {item.label}
            </motion.button>
          )
        })}
      </nav>

      {/* Divider */}
      <div style={{ width: "100%", height: 1, background: "var(--border)", margin: "12px 0" }} />

      {/* Buttons — side by side, both blue */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { label: "Contact Me", onClick: onContactOpen },
          { label: "Support My Work", onClick: onSupportOpen },
        ].map(({ label, onClick }) => (
          <motion.button
            key={label}
            onClick={onClick}
            style={{
              flex: 1,
              padding: "11px 6px",
              borderRadius: 8,
              background: "#2563eb",
              color: "#fff",
              fontSize: "0.85rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
            whileHover={{ scale: 1.03, background: "#1d4ed8" } as never}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.div
        className="sidebar"
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <SidebarContent />
      </motion.div>

      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg"
        style={{ background: "var(--surface)", color: "var(--text)" }}
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "rgba(0,0,0,0.5)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 left-0 h-full z-50 md:hidden"
              style={{ width: 260, background: "var(--surface)" }}
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button className="absolute top-4 right-4" style={{ color: "var(--muted)" }} onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
