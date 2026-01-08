# 003. Use Playwright for Notion Scraping

Date: 2026-01-07

## Status

Accepted

## Context

The Startup Accelerator Directory is hosted on Notion, which renders content client-side via JavaScript. Traditional HTTP-based scraping tools cannot access the rendered content.

## Decision

Use Playwright for scraping Notion pages because:
- Full browser automation with headless Chrome
- Waits for JavaScript rendering to complete
- Access to rendered DOM after client-side hydration
- Can handle dynamic content loading
- Provides `--inspect` mode for developing selectors

## Consequences

**Positive:**
- Reliably scrapes JS-rendered content
- Headless mode for automated scraping
- Headed mode available for debugging
- Cross-browser support if needed

**Negative:**
- Heavy dependency (~150MB+ for browser binaries)
- Slower than HTTP-based scraping
- Requires browser installation via `npx playwright install`
- More resource-intensive than fetch-based approaches

## Alternatives Considered

1. **Notion API**: Would require database access permissions from page owner
2. **Cheerio + fetch**: Cannot execute JavaScript, won't work for Notion
3. **Puppeteer**: Similar capability but Playwright has better API and multi-browser support
4. **Selenium**: Heavier, more complex setup

## Related

- Planning: `.plan/.done/feature-accelerator-pipeline-foundation/`
- Scraper: `src/scrapers/notion.ts`
