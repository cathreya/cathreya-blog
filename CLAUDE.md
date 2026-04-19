# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is Athreya Chandramouli's personal blog (`cathreya.com`), built on a fork of [Quartz v4](https://quartz.jzhao.xyz/) — a static site generator that turns a folder of Obsidian-flavored Markdown into a website. The repo doubles as an Obsidian vault (`.obsidian/` is committed), so edits to `content/` flow between Obsidian and the published site.

Deployment: GitHub Pages, triggered by pushes to the `v4` branch via `.github/workflows/deploy.yml` (runs `npx quartz build`, uploads `public/`). The branch name `v4` is both the tracking name of the upstream Quartz version and the deploy trigger — do not rename it.

## Commands

```bash
npx quartz build --serve     # local dev server at http://localhost:8080 with hot reload
npx quartz build             # one-shot build into ./public
npx quartz build --help      # all flags (--port, --concurrency, --fastRebuild, etc.)
npm run check                # tsc --noEmit + prettier --check (must pass before push)
npm run format               # prettier --write
npm test                     # runs tsx on quartz/util/path.test.ts and quartz/depgraph.test.ts
```

Node ≥ 18.14, npm ≥ 9.3.1. There is no bundler step outside of Quartz itself — `esbuild` is invoked internally by `quartz/bootstrap-cli.mjs`.

## Architecture

Two layers live side-by-side in this repo:

1. **The Quartz engine** under `quartz/` (upstream code — avoid editing unless intentionally customizing).
2. **This site's content and config** at the repo root: `content/`, `quartz.config.ts`, `quartz.layout.ts`, and any custom components under `quartz/components/`.

### Build pipeline (`quartz/build.ts`)

The pipeline is a plugin graph declared in `quartz.config.ts` under three phases that run in order:

- **transformers** (`quartz/plugins/transformers/`) — parse Markdown → mdast → hast. Each plugin can contribute `markdownPlugins`, `htmlPlugins`, `textTransform`, and `externalResources`. Key ones in use: `ObsidianFlavoredMarkdown` (wikilinks, callouts), `Latex` with KaTeX, `SyntaxHighlighting` via Shiki, `CrawlLinks` (resolves internal links — `markdownLinkResolution: "shortest"` means `[[foo]]` finds the shortest unique slug).
- **filters** (`quartz/plugins/filters/`) — decide `shouldPublish` per page. `RemoveDrafts` drops pages with `draft: true` in frontmatter.
- **emitters** (`quartz/plugins/emitters/`) — write files to `public/`. `ContentPage` (per-note HTML), `FolderPage`, `TagPage`, `ContentIndex` (sitemap + RSS), `Assets` (copies static files), `Static` (copies `quartz/static/`), `AliasRedirects` (for `aliases:` frontmatter).

Plugin contract lives in `quartz/plugins/types.ts`. When adding a plugin, register it in `quartz.config.ts`; unregistered plugins are dead code.

### Layout and components

`quartz.layout.ts` defines three layouts — `sharedPageComponents`, `defaultContentPageLayout`, `defaultListPageLayout` — plus a custom `indexPageLayout` used only for the landing page (renders `AboutMe` in the sidebar and a full `PostList` in the body). Components are Preact SFCs under `quartz/components/*.tsx`; each exports a `QuartzComponentConstructor` and can attach `.css` (SCSS module) and `.beforeDOMLoaded` / `.afterDOMLoaded` scripts.

Custom to this fork: `quartz/components/AboutMe.tsx` (bio + social links on the index page). Edit it here, not in `quartz.layout.ts`.

### Content

- `content/index.md` — landing page (uses `indexPageLayout`).
- `content/Posts/` — blog posts, dated filenames `YYYY-MM-DD-slug.md`. `indexPageLayout` filters for these via `slug.startsWith("Posts/")`.
- `content/about.md` — about page linked from `AboutMe`.
- `content/static/{img,pdf,notebooks}/` — assets. Reference them as `/static/pdf/foo.pdf` in Markdown; the `Assets` emitter copies them verbatim.
- Anything under `private/`, `templates/`, or `.obsidian/` is excluded by `ignorePatterns` in `quartz.config.ts`.

Frontmatter is YAML; common fields are `title`, `date`, `tags`, `draft`, `aliases`. `CreatedModifiedDate` prefers frontmatter dates over filesystem mtimes (`priority: ["frontmatter", "filesystem"]`).

### Paths and slugs

`quartz/util/path.ts` is the single source of truth for slug/path conversions (`FilePath`, `FullSlug`, `SimpleSlug`, etc. are branded types — don't cross them without the conversion helpers). Unit tests in `path.test.ts` cover the edge cases; run them after any change there.

## Conventions specific to this repo

- Math in posts uses KaTeX (`renderEngine: "katex"`). Display-math blocks must be fenced with `$$ ... $$` on their own lines — commits `dd79d5d` and `f2c17c2` fixed historical Jekyll/Obsidian syntax that broke the KaTeX parser, so be careful when pasting content from old Jekyll sources.
- PDF embeds use `<object>` tags pointing at the built asset path (e.g. `/static/pdf/foo.pdf`), not relative paths.
- `.gstack/` and `.claude/` are gitignored local tooling dirs — don't add them to commits.
- Prettier config is in `.prettierrc`; `.prettierignore` excludes generated/vendored paths. `npm run check` gates CI.
