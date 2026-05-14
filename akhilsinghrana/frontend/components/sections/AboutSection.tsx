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
  const inView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div ref={ref} className="flex flex-col h-full py-10 max-w-3xl">
      <motion.h2
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        About Me
      </motion.h2>

      <motion.div
        className="space-y-4 text-base leading-relaxed mb-8"
        style={{ color: "var(--muted)" }}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <p>
          Hi, I&apos;m Akhil Singh Rana, a Senior Machine Learning Engineer with deep
          expertise in Computer Vision and Remote Sensing applications. I have been
          working in the field for over 8 years, building solutions that bridge the gap
          between cutting-edge research and practical deployment.
        </p>
        <p>
          My work primarily revolves around satellite imagery analysis, where I develop
          models for land use classification, change detection, and crop phenology
          monitoring. I have a strong passion for Generative AI — particularly GANs and
          Diffusion Models — and their applications in scientific domains.
        </p>
        <p>
          Over the years, I have contributed to published research in AGU, IEEE, ISPRS,
          and Remote Sensing journals, tackling problems like SAR-to-Optical translation
          and self-supervised learning for Earth observation.
        </p>
        <p>
          Beyond research, I enjoy building developer tools and web applications that
          make AI more accessible. This website itself features an AI-powered chatbot
          backed by a RAG pipeline using Llama 3.1 and ChromaDB — no API keys required
          for users.
        </p>
        <p>
          I completed my Master&apos;s in Computer Science (AI &amp; Intelligent Systems)
          at TU Kaiserslautern and my Bachelor&apos;s at ITM University. I am always eager
          to collaborate on interesting projects at the intersection of AI and geospatial
          science.
        </p>
        <p>
          When I&apos;m not writing code or training models, you&apos;ll find me exploring
          new hiking trails, reading about space exploration, or experimenting with
          home-cooked recipes. I believe a curious mind and a healthy body are the
          foundation of great engineering.
        </p>
        <p>
          Feel free to reach out if you want to discuss research, collaboration
          opportunities, or just want to say hi. I&apos;m always happy to connect with
          like-minded people from around the world.
        </p>
        <p>
          This site is built with Next.js, React, TypeScript, Tailwind CSS, and Framer
          Motion — all open-source technologies I love and advocate for. The backend
          runs on FastAPI with a LangGraph-powered RAG pipeline.
        </p>
      </motion.div>

      {/* Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}
        >
          Skills &amp; Expertise
        </h3>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: "rgba(34,211,238,0.1)",
                color: "var(--accent)",
                border: "1px solid var(--border)",
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
