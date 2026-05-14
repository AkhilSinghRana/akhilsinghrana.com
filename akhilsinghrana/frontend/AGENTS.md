<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# akhilsinghrana.com Frontend — Architecture Guide

This section documents project-specific decisions for AI agents and contributors.
**Always read before making changes.**

---

## Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js App Router, `output: "export"` static |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animation | Framer Motion |
| Icons | Lucide React |
| Fonts | Sora (headings) + DM Sans (body) via `next/font/google` |

---

## Data Layer — Single Source of Truth

**All site content lives in `data/*.ts`. Never hardcode content inside components.**

```
data/
  about.ts          ← ABOUT_BIO (string[]), SKILLS (string[])
  publications.ts   ← PUBLICATIONS, EDUCATION
  blogs.ts          ← BLOGS (slug, title, summary, highlights, image)
  portfolio.ts      ← portfolio carousel items
  navigation.ts     ← sidebar nav items
```

- Components import from `data/*.ts` — they never define their own data arrays
- When adding content, edit `data/*.ts` only, then run `npm run export-content`

### RAG Content Pipeline (zero duplication)

```
data/*.ts  →  scripts/export-content.mjs  →  public/content/site-content.json
                                                      ↓
                                         backend RAG_Chat.py indexes this
```

- `prebuild` script auto-runs `export-content.mjs` before every `npm run build`
- After any `data/*.ts` change, rebuild the faiss_db (see checklist below)

### Blog HTML
Full blog HTML lives in `public/blogs/*.html` — indexed by RAG via `BSHTMLLoader`.
`data/blogs.ts` holds only metadata (title, slug, summary) for UI rendering.

---

## Theming — CSS Variables

**Never use hardcoded colors. Always use CSS custom properties.**

| Variable | Usage |
|----------|-------|
| `var(--bg)` | Page background |
| `var(--surface)` | Card / panel background |
| `var(--card-bg)` | Secondary card background |
| `var(--card-border)` | Card border |
| `var(--text)` | Primary text |
| `var(--muted)` | Dimmed / secondary text |
| `var(--accent)` | Cyan highlight `#22d3ee` |
| `var(--border)` | General border |

Dark mode = default (`:root`). Light mode = `.light` class on `<html>`.

---

## Layout Rules

- **Sidebar**: CSS `.sidebar { display: none }` default, `display: flex` at `@media (min-width: 768px)`. Do NOT use Tailwind `hidden md:flex` — conflicts with Framer Motion.
- **Main content**: `.main-content` CSS class handles responsive left margin.
- **Sections**: `.snap-section` = `height: 100vh` + scroll-snap.
- **Dot nav**: `.dotnav-hide-mobile` hides on mobile via CSS.

---

## Static Export Quirks

- `output: "export"` → no server-side routes, everything statically rendered
- `images: { unoptimized: true }` required
- `trailingSlash: true` required for Firebase Hosting
- Use `NEXT_PUBLIC_API_URL` for all backend calls (never Next.js API routes)

---

## Adding New Content — Checklist

**New blog:** add HTML to `public/blogs/`, add entry to `data/blogs.ts`, run export + rebuild DB.

**New publication:** add to `data/publications.ts`, add preview image, run export + rebuild DB.

**Bio/skills change:** edit `data/about.ts`, run export + rebuild DB.

**Rebuild faiss_db:**
```bash
cd /path/to/akhilsinghrana.com
uv run python3 -c "
import os, shutil
from dotenv import load_dotenv
load_dotenv('akhilsinghrana/backend/.env')
shutil.rmtree('./akhilsinghrana/backend/db/faiss_db', ignore_errors=True)
from akhilsinghrana.backend.RAG_Chat import RAGChat
RAGChat(recreateVectorDB=True, folder='./akhilsinghrana/frontend/public/blogs')
print('Done')
"
```
