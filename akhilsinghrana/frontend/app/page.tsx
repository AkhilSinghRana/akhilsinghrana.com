"use client"
import { useState } from "react"
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

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar
        onContactOpen={() => setContactOpen(true)}
        onSupportOpen={() => setSupportOpen(true)}
      />
      <main
        className="flex-1 overflow-y-auto snap-container"
        style={{ marginLeft: 0 }}
      >
        <div style={{ marginLeft: 0 }} className="md:ml-[260px]">
          <section id="home" className="snap-section min-h-screen px-6 md:px-12 py-10 flex items-center">
            <div className="w-full">
              <HomeSection />
            </div>
          </section>
          <section id="blog" className="snap-section min-h-screen px-6 md:px-12">
            <BlogSection onBlogOpen={setBlogSlug} />
          </section>
          <section id="about" className="snap-section min-h-screen px-6 md:px-12">
            <AboutSection />
          </section>
          <section id="publications" className="snap-section min-h-screen px-6 md:px-12">
            <PublicationsSection />
          </section>
        </div>
      </main>
      <DotNav />
      <ChatWidget />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
      <BlogModal slug={blogSlug} onClose={() => setBlogSlug(null)} />
    </div>
  )
}
