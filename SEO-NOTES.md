# Position Quest SEO and brand alignment

Reviewed 2026-09-06. Sources: https://www.techwebster.com/ , https://www.techwebster.com/products/code-editor , https://in.linkedin.com/company/tech-webster . Public search results were inspected; these are not Search Console ranking or traffic measurements.

Brand assets copied from the company website: logo-white.svg, favicon.ico, apple-touch-icon.png, and Latin Inter / JetBrains Mono font subsets. Palette: orange #FF7F00, near-black #0A0A0A, charcoal #171717, white #FAFAFA, muted gray #A8A8AD. Keep the product drafting grid while using company typography and branding.

Primary topic: CSS positioning game. Supporting topics: learn CSS position, interactive CSS challenges, relative vs absolute positioning, fixed positioning, z-index practice. Brand: Position Quest by TechWebster. These are relevance-based choices, not measured keyword volumes. Company service/location terms appear only in the studio attribution. Google ignores meta keywords: https://developers.google.com/search/docs/crawling-indexing/special-tags .

Implemented: self-canonical product URL, description, social metadata and preview image, linked Organization/WebSite/WebApplication/WebPage JSON-LD, visible educational content, links to company/products/code editor, robots.txt and sitemap.xml. No invented reviews, ratings or certifications in schema.

Validation: serve with python3 -m http.server 8000, then TEST_URL=http://localhost:8000/play/ node test-e2e.mjs. HTTP is required for local font loading. Browser checks cover desktop/mobile overflow, font loading and JSON-LD parsing. No field Core Web Vitals or ranking improvements are claimed.

After deployment: verify the production canonical, asset responses and absence of noindex headers; submit https://css-positions.techwebster.com/sitemap.xml in Search Console and inspect the homepage. Add Position Quest to the main company products hub and link to this subdomain from a dedicated product page. That company-site change is outside this repository. Monitor actual search queries before expanding content.

## Landing and gameplay routes

The homepage now contains the product hero, a static CSS illustration, Play game link, and studio footer. It loads no game JavaScript. Gameplay lives at /play/ with a self-canonical URL, an updated application URL in JSON-LD, and a return link. Both URLs are in the sitemap. The landing page retains crawlable product copy; splitting the pages does not itself guarantee higher rankings. Desktop and mobile navigation, direct gameplay reload, and all 25 gameplay checks passed.

Hero motion: the crawlable heading is “Learn CSS positioning.” A decorative typing line rotates learning phrases; screen readers receive the stable heading. The offset preview synchronizes numeric values and box transforms, pauses in hidden tabs, supports a pause button, and stops for reduced-motion preferences. No animation library is loaded. Verified value/transform agreement, pause/resume, reduced-motion behavior, mobile layout, and landing-to-game navigation.
