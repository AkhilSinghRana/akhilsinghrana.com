/**
 * export-content.mjs
 *
 * Build-time script: reads all data/*.ts files and writes
 * public/content/site-content.json for RAG indexing.
 *
 * Run: node scripts/export-content.mjs
 * Hooked into: "prebuild" in package.json (runs automatically before `npm run build`)
 *
 * RAG pipeline reads this file via TextLoader — no duplication,
 * single source of truth is always data/*.ts.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

// ── Inline data extraction (avoids TS compilation) ───────────────────────────
// We read the .ts files as text and eval the exported arrays via regex.
// This is intentionally simple — data files only export plain JS literals.

function extractExport(filePath, exportName) {
  const src = readFileSync(filePath, "utf-8")
  // Strip TS type annotations so JSON.parse-friendly eval works
  const stripped = src
    .replace(/export\s+const\s+\w+\s*:\s*[\w\[\]{}|&\s<>,]+\s*=/g, (m) =>
      m.replace(/:\s*[\w\[\]{}|&\s<>,]+\s*=/, " =")
    )
    .replace(/as\s+\w+/g, "")

  // Find the exported array/object
  const match = stripped.match(
    new RegExp(`export\\s+const\\s+${exportName}\\s*=\\s*([\\s\\S]+?)(?=\\nexport|$)`)
  )
  if (!match) return null
  try {
    // Use Function to evaluate the literal safely
    return new Function(`return ${match[1].trim().replace(/;?\s*$/, "")}`)()
  } catch {
    return null
  }
}

// ── Load all data ─────────────────────────────────────────────────────────────

const aboutBio = extractExport(join(root, "data/about.ts"), "ABOUT_BIO") ?? []
const skills = extractExport(join(root, "data/about.ts"), "SKILLS") ?? []
const publications = extractExport(join(root, "data/publications.ts"), "PUBLICATIONS") ?? []
const education = extractExport(join(root, "data/publications.ts"), "EDUCATION") ?? []
const blogs = extractExport(join(root, "data/blogs.ts"), "BLOGS") ?? []

// ── Build content document ────────────────────────────────────────────────────

const content = {
  about: {
    name: "Akhil Singh Rana",
    title: "Senior Machine Learning Scientist",
    bio: aboutBio,
    skills,
    contact: {
      email: "contact@akhilsinghrana.com",
      github: "github.com/akhilsinghrana",
      website: "akhilsinghrana.com",
    },
  },
  education: education.map((e) => ({
    degree: e.degree,
    school: e.school,
    years: e.years,
  })),
  publications: publications.map((p) => ({
    title: p.title,
    venue: p.venue,
    url: p.url,
  })),
  blogs: blogs.map((b) => ({
    title: b.title,
    summary: b.summary,
    slug: b.slug,
    highlights: b.highlights ?? [],
  })),
  // Flat text for easier RAG chunking
  text_summary: [
    `Akhil Singh Rana is a Senior Machine Learning Scientist.`,
    `Bio: ${aboutBio.join(" ")}`,
    `Skills: ${skills.join(", ")}.`,
    `Education: ${education.map((e) => `${e.degree} at ${e.school} (${e.years})`).join("; ")}.`,
    `Publications: ${publications.map((p) => `${p.title} (${p.venue})`).join("; ")}.`,
    `Blog posts: ${blogs.map((b) => b.title).join("; ")}.`,
  ].join("\n\n"),
}

// ── Write output ──────────────────────────────────────────────────────────────
// Write to backend/content/ so it is included in the Docker image.
// (frontend/ is excluded from Docker via .dockerignore)

const backendContentDir = join(root, "..", "backend", "content")
mkdirSync(backendContentDir, { recursive: true })
const backendOutPath = join(backendContentDir, "site-content.json")
writeFileSync(backendOutPath, JSON.stringify(content, null, 2))
console.log(`✅ site-content.json → backend/content/ (${blogs.length} blogs, ${publications.length} publications)`)
