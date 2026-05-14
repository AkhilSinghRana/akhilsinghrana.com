"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

const CoffeeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 21h18v-2H2M20 8h-2V5h2m0-2H4v10a4 4 0 004 4h6a4 4 0 004-4v-3h2a2 2 0 002-2V6a2 2 0 00-2-2m-2 7h-2v-2h2v2M6 7h2v2H6m4-2h2v2h-2"/>
  </svg>
)

const PaypalIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 00-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 00-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 00.554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 01.923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
  </svg>
)

interface Props {
  open: boolean
  onClose: () => void
}

export default function SupportModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.75)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full"
            style={{
              maxWidth: 560,
              background: "#1a1a1a",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            }}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 style={{ fontFamily: "var(--font-sora)", color: "var(--accent)", fontSize: "1.4rem", fontWeight: 700 }}>
                Support my work
              </h2>
              <button
                onClick={onClose}
                style={{ color: "#aaa", background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", lineHeight: 1, padding: 4 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Buy Me a Coffee card */}
              <div style={{ background: "#2a2a2a", borderRadius: 10, padding: "20px 22px" }}>
                <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>Buy Me a Coffee</h3>
                <p style={{ color: "#ccc", fontSize: "0.95rem", marginBottom: 16 }}>
                  Developers need cofee, Buy me a coffee to show your support:
                </p>
                <motion.a
                  href="https://www.buymeacoffee.com/akhilsinghrana"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#e05a1e",
                    color: "#fff",
                    padding: "13px 26px",
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: "1rem",
                    textDecoration: "none",
                  }}
                  whileHover={{ background: "#c94f18", scale: 1.03 } as never}
                  whileTap={{ scale: 0.97 }}
                >
                  <CoffeeIcon /> Buy Me a Coffee
                </motion.a>
              </div>

              {/* PayPal card */}
              <div style={{ background: "#2a2a2a", borderRadius: 10, padding: "20px 22px" }}>
                <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>PayPal</h3>
                <p style={{ color: "#ccc", fontSize: "0.95rem", marginBottom: 16 }}>
                  Support me via PayPal:
                </p>
                <motion.a
                  href="https://paypal.me/akhilsinghrana"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#f5a623",
                    color: "#fff",
                    padding: "13px 26px",
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: "1rem",
                    textDecoration: "none",
                  }}
                  whileHover={{ background: "#d4911e", scale: 1.03 } as never}
                  whileTap={{ scale: 0.97 }}
                >
                  <PaypalIcon /> Donate with PayPal
                </motion.a>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 24px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "flex-end" }}>
              <motion.button
                onClick={onClose}
                style={{
                  background: "#4a4a4a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 22px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                whileHover={{ background: "#5a5a5a" } as never}
                whileTap={{ scale: 0.97 }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
