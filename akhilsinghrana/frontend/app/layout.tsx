import type { Metadata } from "next"
import { Sora, DM_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/providers/ThemeProvider"

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sora",
})
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Akhil Singh Rana",
  description: "Senior Machine Learning Engineer",
  icons: { icon: "/static/Extra/logo/ASR.gif" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
