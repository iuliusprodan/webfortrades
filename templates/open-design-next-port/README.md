# Open Design Next.js port template

This folder is a **README-only** reference. It does not contain runnable code.

Use when porting an Open Design artifact into `sites/<slug>/`.

## Read first

1. `docs/open-design-to-vercel-recipe.md` - full workflow
2. `docs/open-design-next-porting-notes.md` - Greens file mappings
3. `docs/open-design-deploy-checklist.md` - gate checklist

## Reference implementation

Copy patterns from the canonical successful port:

```
sites/greens-precise-plumbing-heating-ltd/
```

Key files to mirror:

- `app/page.tsx` - artifact markup as JSX
- `app/layout.tsx` - next/font, metadata, JSON-LD, build marker
- `app/globals.css` - Tailwind layers + artifact CSS
- `components/SiteEnhancements.tsx` - scroll reveal (optional)
- `tailwind.config.ts` - safelist for style gate
- `public/assets/images/` - real photos only

## Validate before deploy

```bash
npm run od:check -- --slug <slug>
npm run build:site -- --slug <slug>
```

Do not deploy if artifact check fails.
