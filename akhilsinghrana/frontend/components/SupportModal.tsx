"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, Coffee, Heart } from "lucide-react"

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
            style={{ background: "rgba(0,0,0,0.7)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-sm rounded-xl p-6 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <button
              className="absolute top-4 right-4"
              style={{ color: "var(--muted)" }}
              onClick={onClose}
            >
              <X size={20} />
            </button>
            <h2
              className="text-xl font-bold mb-2"
              style={{ fontFamily: "var(--font-sora)", color: "var(--text)" }}
            >
              Support My Work
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              If you find my work useful, consider supporting me!
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.buymeacoffee.com/akhilsinghrana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition"
                style={{ background: "#FFDD00", color: "#000" }}
              >
                <Coffee size={18} />
                Buy Me a Coffee
              </a>
              <a
                href="https://www.paypal.me/akhilsinghrana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition"
                style={{ background: "#003087", color: "#fff" }}
              >
                <Heart size={18} />
                Donate with PayPal
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
