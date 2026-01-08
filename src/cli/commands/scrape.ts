import { Command } from "commander";
import chalk from "chalk";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scrapeNotionPage, inspectNotionPage, type NotionSource } from "../../scrapers/notion.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCES_DIR = join(__dirname, "..", "..", "..", "sources");

export const scrapeCommand = new Command("scrape")
  .description("Scrape opportunities from configured sources");

scrapeCommand
  .command("notion")
  .description("Scrape the Notion accelerator directory")
  .option("-i, --inspect", "Open browser for manual inspection instead of scraping")
  .action(async (options) => {
    const sourcePath = join(SOURCES_DIR, "notion-accelerator-directory.json");

    try {
      const sourceJson = await readFile(sourcePath, "utf-8");
      const source: NotionSource = JSON.parse(sourceJson);

      if (options.inspect) {
        console.log(chalk.blue("Opening browser for inspection..."));
        console.log(chalk.dim("Close the browser window when done."));
        await inspectNotionPage(source.url);
        return;
      }

      console.log(chalk.blue(`Scraping: ${source.name}`));
      console.log(chalk.dim(`URL: ${source.url}`));

      const result = await scrapeNotionPage(source);

      if (result.errors.length > 0) {
        console.log(chalk.red("\nErrors:"));
        for (const error of result.errors) {
          console.log(chalk.red(`  - ${error}`));
        }
      }

      if (result.opportunities.length > 0) {
        console.log(chalk.green(`\nFound ${result.opportunities.length} opportunities:`));
        for (const opp of result.opportunities.slice(0, 10)) {
          console.log(`  - ${opp.name}`);
        }
        if (result.opportunities.length > 10) {
          console.log(chalk.dim(`  ... and ${result.opportunities.length - 10} more`));
        }
      } else {
        console.log(chalk.yellow("\nNo opportunities found."));
        console.log(chalk.dim("The scraper may need to be customized for this page structure."));
        console.log(chalk.dim('Try: accelerate scrape notion --inspect'));
      }
    } catch (error) {
      console.log(chalk.red("Failed to load source configuration:"));
      console.log(chalk.red(error instanceof Error ? error.message : String(error)));
    }
  });

scrapeCommand
  .command("list-sources")
  .description("List configured data sources")
  .action(async () => {
    const sourcePath = join(SOURCES_DIR, "notion-accelerator-directory.json");

    try {
      const sourceJson = await readFile(sourcePath, "utf-8");
      const source = JSON.parse(sourceJson);

      console.log(chalk.bold("\nConfigured Sources:\n"));
      console.log(chalk.cyan(source.name));
      console.log(`  ${chalk.dim("Type:")} ${source.type}`);
      console.log(`  ${chalk.dim("Source:")} ${source.source}`);
      console.log(`  ${chalk.dim("URL:")} ${source.url}`);
      if (source.lastScraped) {
        console.log(`  ${chalk.dim("Last scraped:")} ${new Date(source.lastScraped).toLocaleString()}`);
      } else {
        console.log(`  ${chalk.dim("Last scraped:")} Never`);
      }
      console.log();
    } catch {
      console.log(chalk.yellow("No sources configured yet."));
    }
  });
