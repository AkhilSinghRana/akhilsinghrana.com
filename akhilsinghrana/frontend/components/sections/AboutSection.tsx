"use client"
import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const SKILLS = [
  "AI/ML", "Computer Vision", "GANs", "Satellite Imagery",
  "Foundational Models", "PyTorch", "Python", "Remote Sensing",
  "LLMs", "RAG", "LangChain",
]

export default function AboutSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", paddingTop: 24, paddingBottom: 24, overflowY: "auto" }}>
      <motion.div
        style={{ width: "100%", maxWidth: 860, textAlign: "center" }}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55 }}
      >
        <h2 style={{ fontFamily: "var(--font-sora)", color: "var(--text)", fontSize: "2rem", fontWeight: 700, marginBottom: 6 }}>
          About Me
        </h2>
        <div style={{ width: 48, height: 3, background: "var(--accent)", margin: "0 auto 20px", borderRadius: 2 }} />

        <motion.div
          style={{ display: "flex", flexDirection: "column", gap: 12, color: "var(--muted)", fontSize: "0.94rem", lineHeight: 1.75, textAlign: "left" }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <p>
            As a <strong style={{ color: "var(--text)" }}>Senior Machine Learning Scientist</strong> with a passion for pushing the boundaries of AI and computer vision, I&apos;ve dedicated my career to developing cutting-edge solutions that bridge the gap between theoretical research and real-world applications.
          </p>
          <p>
            With over <strong style={{ color: "var(--text)" }}>8 years of experience</strong>, I&apos;ve led projects ranging from creating the largest Earth Observation dataset (RAPIDAI4EO) to engineering multi-modal models that significantly improved agricultural yield forecasting. My expertise spans foundational model development, generative adversarial networks (GANs), deep reinforcement learning, and scalable machine learning systems.
          </p>
          <p>
            At <strong style={{ color: "var(--text)" }}>Planet Labs</strong>, I&apos;ve spearheaded the development of large-scale foundational models for satellite imagery, securing substantial funding for innovative projects and driving cross-functional collaborations. My previous roles at Airbus Defence and Space and Avira honed my skills in radar processing, image-to-image translation, and privacy-enhancing technologies.
          </p>
          <p>
            I&apos;m particularly passionate about computer vision applications in AR/VR, having worked on real-time scene understanding, 3D reconstruction, and object tracking. My research has been published in respected journals and presented at international conferences.
          </p>
          <p>
            As a technical leader, I thrive on mentoring junior engineers, fostering a culture of innovation, and translating complex AI concepts into impactful products. I&apos;m always excited to tackle new challenges that push the boundaries of what&apos;s possible in machine learning and computer vision.
          </p>
          <p>
            When I&apos;m not diving into code or brainstorming new AI architectures, you can find me exploring the latest developments in AR/VR technologies or contributing to open-source projects. I&apos;m constantly seeking new opportunities to apply my expertise to solve complex, real-world problems.
          </p>
        </motion.div>

        {/* Skills */}
        <motion.div
          style={{ marginTop: 28, marginBottom: 24 }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <h3 style={{ fontFamily: "var(--font-sora)", color: "var(--text)", fontSize: "1.1rem", fontWeight: 600, marginBottom: 16, textAlign: "center" }}>
            Skills &amp; Expertise
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {SKILLS.map((skill) => (
              <motion.span
                key={skill}
                style={{
                  padding: "7px 16px",
                  borderRadius: 999,
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  background: "rgba(34,211,238,0.08)",
                  color: "var(--accent)",
                  border: "1px solid rgba(34,211,238,0.25)",
                }}
                whileHover={{ scale: 1.06, background: "rgba(34,211,238,0.15)" } as never}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
