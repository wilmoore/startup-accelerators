/**
 * Notion page scraper for extracting accelerator data
 *
 * Notion pages are JS-rendered, so we use Playwright to load
 * the page and extract data from the rendered DOM.
 */

import { chromium, type Browser, type Page } from "playwright";
import type { Opportunity } from "../types/index.js";

export interface NotionSource {
  name: string;
  source: string;
  type: "notion";
  url: string;
  description?: string;
  requiresJsRendering: boolean;
}

export interface ScrapeResult {
  opportunities: Partial<Opportunity>[];
  errors: string[];
  scrapedAt: string;
}

/**
 * Scrape a Notion page for accelerator data
 *
 * This is a skeleton implementation. The actual parsing logic
 * will depend on the specific structure of the Notion page.
 */
export async function scrapeNotionPage(source: NotionSource): Promise<ScrapeResult> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();

    // Navigate and wait for content to load
    await page.goto(source.url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait for Notion content to render
    await page.waitForSelector('[data-block-id]', { timeout: 10000 });

    // Extract data - this will need to be customized based on page structure
    const opportunities = await extractOpportunitiesFromPage(page);

    return {
      opportunities,
      errors: [],
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      opportunities: [],
      errors: [`Failed to scrape ${source.url}: ${message}`],
      scrapedAt: new Date().toISOString(),
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Extract opportunity data from a Notion page
 *
 * This is a placeholder that needs to be customized based on
 * the actual structure of the Notion page being scraped.
 */
async function extractOpportunitiesFromPage(page: Page): Promise<Partial<Opportunity>[]> {
  // Notion tables typically use these selectors
  // This will need adjustment based on actual page structure

  const opportunities: Partial<Opportunity>[] = [];

  // Try to find table rows
  const rows = await page.$$('.notion-table-view-row, .notion-collection-item');

  for (const row of rows) {
    try {
      // Extract text from cells - adjust selectors as needed
      const cells = await row.$$('.notion-table-view-cell');
      const cellTexts = await Promise.all(
        cells.map(cell => cell.textContent())
      );

      // Map cell data to opportunity fields
      // This mapping needs to be customized based on column order
      if (cellTexts.length > 0 && cellTexts[0]) {
        opportunities.push({
          name: cellTexts[0].trim(),
          // Add more field mappings based on actual column structure
          source: "notion-accelerator-directory",
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      // Skip rows that can't be parsed
      continue;
    }
  }

  return opportunities;
}

/**
 * Interactive scraper that opens a browser for manual inspection
 * Useful for understanding page structure before automating
 */
export async function inspectNotionPage(url: string): Promise<void> {
  const browser = await chromium.launch({
    headless: false, // Show browser for inspection
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  console.log("Browser opened for inspection. Close manually when done.");
  console.log("Useful commands in DevTools Console:");
  console.log('  document.querySelectorAll(".notion-table-view-row")');
  console.log('  document.querySelectorAll("[data-block-id]")');

  // Keep browser open until manually closed
  await new Promise(() => {});
}
