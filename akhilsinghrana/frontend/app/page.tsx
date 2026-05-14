"use client"
import { useState } from "react"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"
import Sidebar from "@/components/Sidebar"
import DotNav from "@/components/DotNav"
import HomeSection from "@/components/sections/HomeSection"
import BlogSection from "@/components/sections/BlogSection"
import AboutSection from "@/components/sections/AboutSection"
import PublicationsSection from "@/components/sections/PublicationsSection"
import ChatWidget from "@/components/ChatWidget"
import ContactModal from "@/components/ContactModal"
import SupportModal from "@/components/SupportModal"
import BlogModal from "@/components/BlogModal"

export default function Page() {
  const [contactOpen, setContactOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [blogSlug, setBlogSlug] = useState<string | null>(null)
  const { isDark, toggle } = useTheme()

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Sidebar
        onContactOpen={() => setContactOpen(true)}
        onSupportOpen={() => setSupportOpen(true)}
      />

      {/* Fixed theme toggle — top right */}
      <button
        onClick={toggle}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        style={{
          position: "fixed",
          top: 16,
          right: 20,
          zIndex: 50,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
          transition: "all 0.2s",
        }}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Main content — responsive sidebar offset */}
      <main className="snap-container main-content" id="main-scroll">
        <section id="home" className="snap-section section-pad-home">
          <HomeSection />
        </section>
        <section id="blog" className="snap-section section-pad">
          <BlogSection onBlogOpen={setBlogSlug} />
        </section>
        <section id="about" className="snap-section section-pad" style={{ overflowY: "auto" }}>
          <AboutSection />
        </section>
        <section id="publications" className="snap-section section-pad">
          <PublicationsSection />
        </section>
      </main>

      <DotNav />
      <ChatWidget />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
      <BlogModal slug={blogSlug} onClose={() => setBlogSlug(null)} />
    </div>
  )
}
