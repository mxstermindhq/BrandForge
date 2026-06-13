# BrandForge blog post template

Copy this file to `src/content/blog/posts/your-slug.ts`, register it in `posts/index.ts`, and run `npm run build`.

```typescript
import type { BlogPost } from "../index";

const p = (paragraphs: string[]) => ({ paragraphs });

export const post: BlogPost = {
  slug: "your-slug-here",
  title: "Your Post Title",
  metaTitle: "Your Post Title | BrandForge",
  metaDescription: "50–160 char description for SEO and AI extraction.",
  datePublished: "2026-06-13",
  readingTime: "10 min",
  category: "Guides",
  tags: ["tag-one", "tag-two"],
  ogImage: "/img/blog/your-slug-og.webp",
  sections: [
    { heading: "Section 1 — Hook", ...p(["Paragraph one.", "Paragraph two."]) },
    { heading: "Section 2", ...p(["Content. Link to [[service:brand-identity]] and [[portfolio:carspotlive]]."]) },
    { heading: "Section 3", ...p(["Content."]) },
    { heading: "Section 4", ...p(["Content."]) },
    { heading: "Section 5", ...p(["Content."]) },
    { heading: "Section 6", ...p(["Content."]) },
    { heading: "Section 7", ...p(["Content."]) },
    { heading: "Section 8 — Next steps", ...p(["CTA: /packages/ and Discord."]) },
  ],
  relatedServices: [
    { label: "Brand identity", href: "/services/brand-identity/" },
  ],
  relatedPortfolio: ["carspotlive"],
  relatedNiches: ["gaming-server-owners"],
  faqs: [
    { question: "Question operators ask?", answer: "Direct answer with /services/ link." },
    { question: "Second FAQ?", answer: "Answer." },
    { question: "Third FAQ?", answer: "Answer." },
    { question: "Fourth FAQ?", answer: "Answer." },
  ],
};
```

## Internal link placeholders

When drafting in Markdown, use these placeholders — replace before publishing:

| Placeholder | Resolves to |
|-------------|-------------|
| `[[service:brand-identity]]` | `/services/brand-identity/` |
| `[[portfolio:carspotlive]]` | `/portfolio/carspotlive/` |
| `[[niche:gaming-server-owners]]` | `/for/gaming-server-owners/` |
| `[[blog:what-is-geo-generative-engine-optimisation]]` | `/blog/what-is-geo-.../` |

## Checklist before merge

- [ ] `slug` is unique (run `npm run lint:content`)
- [ ] `metaDescription` is 50–165 characters
- [ ] 8+ sections with real operator value
- [ ] 4 FAQs with schema-friendly answers
- [ ] 2–3 internal links to services, portfolio, or niches
- [ ] `ogImage` path exists in `public/` (1200×630 WebP, < 200KB)
