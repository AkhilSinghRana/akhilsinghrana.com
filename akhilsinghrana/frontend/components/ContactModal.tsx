"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
}

export default function ContactModal({ open, onClose }: Props) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("message", message)
      const res = await fetch(`${apiUrl}/contact`, {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        setStatus("success")
        setName("")
        setEmail("")
        setMessage("")
        setTimeout(() => { setStatus("idle"); onClose() }, 2000)
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.7)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md rounded-xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}
              >
                Contact Me
              </h2>
              <button onClick={onClose} style={{ color: "var(--muted)" }}>
                <X size={20} />
              </button>
            </div>

            {status === "success" ? (
              <div
                className="text-center py-6"
                style={{ color: "var(--accent)" }}
              >
                ✓ Message sent successfully!
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition resize-none"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  />
                </div>
                {status === "error" && (
                  <p className="text-xs text-red-400">Failed to send. Please try again.</p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60 transition"
                  style={{ background: "var(--accent)", color: "#0a0f1a" }}
                >
                  {status === "sending" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
