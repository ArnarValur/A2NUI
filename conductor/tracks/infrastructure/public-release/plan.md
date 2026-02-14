# Public Release — a2nui.merkurial-studio.com

**Track ID:** `public-release`  
**Domain:** `infrastructure`  
**Created:** 2026-02-14  
**Status:** Not Started

---

## Overview

Take A2NUI live as an open-source contribution to the A2UI/Vue community. Deploy the documentation site and playground to `a2nui.merkurial-studio.com`, write a proper README, add showcase recipes/templates, and announce to the community.

---

## Phases

### Phase 1: Content & Showcase Polish

- [ ] Create 4–6 showcase "Recipes" (predefined JSONL templates demonstrating real-world use)
  - [ ] Booking Form recipe
  - [ ] Service Card recipe
  - [ ] Contact Form recipe
  - [ ] Settings Panel recipe
  - [ ] User Profile Card recipe (with Tabs)
  - [ ] Agent Dashboard Panel recipe
- [ ] Add a "Recipes" section to the docs site (new content collection or section under Components)
- [ ] Improve Playground empty state with recipe quick-load buttons
- [ ] Test all 18 components via Chat tab with Gemini prompts
- [ ] Fix any rendering edge cases discovered during testing

### Phase 2: Repo Cleanup & README

- [ ] Write production README.md at repo root (match actual API: `useA2uiSurface`, `A2uiRenderer`, `feed()`)
- [ ] Resolve naming: "Merkurial-Studio" consistently throughout
- [ ] Clean public-facing files (remove .docs/, conductor/ from published site — keep in repo)
- [ ] Add LICENSE file (MIT)
- [ ] Add CONTRIBUTING.md
- [ ] Create .gitignore entries for dev-only artifacts

### Phase 3: Static Build & Deployment

- [ ] Test `nuxt generate` — confirm full static build works
- [ ] Set up subdomain DNS: `a2nui.merkurial-studio.com` → hosting
- [ ] Choose hosting: Cloudflare Pages / Vercel / Netlify (confirm with user)
- [ ] Configure deployment pipeline (GitHub Actions or platform auto-deploy)
- [ ] Add custom favicon and OG image for social link previews
- [ ] Verify SEO meta on all pages (title, description, OG tags)

### Phase 4: Community Launch

- [ ] Flip GitHub repo to public
- [ ] Post in A2UI GitHub Discussions ("Show and Tell")
- [ ] Share on Nuxt Discord (#showcase or #community-projects)
- [ ] Write short post for DEV Community or X/Twitter
- [ ] Optional: Nuxt Modules registry listing (if packaged as module)

---

## Related Files

| File                                                        | Purpose                                        |
| ----------------------------------------------------------- | ---------------------------------------------- |
| `A2NUI/.docs/Building A2NUI For Agent-Driven Interfaces.md` | Original Gemini conversation with README draft |
| `conductor/todos-idea-list.md`                              | Recipe Engine & LUI ideas                      |
| `A2NUI/app/utils/a2ui/processor.ts`                         | Core JSONL processor                           |
| `A2NUI/app/composables/useA2uiSurface.ts`                   | Public API composable                          |
| `A2NUI/content/`                                            | Documentation content files                    |

---

## Notes

- The README draft from Gemini (in .docs/) uses aspirational API names (`useA2ui`, `A2NuiSurface`) — must update to match reality (`useA2uiSurface`, `A2uiRenderer`, `feed()`)
- `npm install @merkurial-studio/a2nui` is aspirational — currently a Nuxt app, not a distributable package. Phase 4 can explore Nuxt Module packaging.
- Caution level elevated: public release is a one-way door for reputation. Quality over speed.
- Let the docs site mature 1–2 days with recipe content before deploying.
