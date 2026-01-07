import { Command } from "commander";
import { randomUUID } from "node:crypto";
import chalk from "chalk";
import inquirer from "inquirer";
import { getProducts, addProduct, getProduct } from "../../lib/store.js";
import type { Product, Stage } from "../../types/index.js";

export const productsCommand = new Command("products")
  .alias("prod")
  .description("Manage your product/startup profiles");

productsCommand
  .command("list")
  .description("List all products")
  .action(async () => {
    const products = await getProducts();

    if (products.length === 0) {
      console.log(chalk.yellow("No products found."));
      console.log(chalk.dim('Run "accelerate products add" to add one.'));
      return;
    }

    console.log(chalk.bold(`\nYour products (${products.length}):\n`));

    for (const product of products) {
      console.log(chalk.cyan.bold(product.name));
      if (product.tagline) {
        console.log(`  ${chalk.italic(product.tagline)}`);
      }
      console.log(
        `  ${chalk.dim("Stage:")} ${product.stage ?? "Not set"} | ${chalk.dim("Team:")} ${product.teamSize ?? "?"}`
      );
      if (product.industries.length > 0) {
        console.log(`  ${chalk.dim("Industries:")} ${product.industries.join(", ")}`);
      }
      if (product.traction) {
        const traction = [];
        if (product.traction.users) traction.push(`${product.traction.users.toLocaleString()} users`);
        if (product.traction.mrr) traction.push(`$${product.traction.mrr.toLocaleString()} MRR`);
        if (product.traction.revenue) traction.push(`$${product.traction.revenue.toLocaleString()} revenue`);
        if (traction.length > 0) {
          console.log(`  ${chalk.dim("Traction:")} ${traction.join(" | ")}`);
        }
      }
      if (product.website) {
        console.log(`  ${chalk.dim("Website:")} ${product.website}`);
      }
      console.log();
    }
  });

productsCommand
  .command("add")
  .description("Add a new product/startup profile")
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Product/startup name:",
        validate: (input: string) => input.length > 0 || "Name is required",
      },
      {
        type: "input",
        name: "tagline",
        message: "One-line tagline:",
      },
      {
        type: "editor",
        name: "description",
        message: "Full description (opens editor):",
      },
      {
        type: "list",
        name: "stage",
        message: "Current stage:",
        choices: [
          { name: "Idea", value: "idea" },
          { name: "Pre-seed", value: "pre-seed" },
          { name: "Seed", value: "seed" },
          { name: "Series A", value: "series-a" },
          { name: "Series B", value: "series-b" },
          { name: "Growth", value: "growth" },
        ],
      },
      {
        type: "input",
        name: "industries",
        message: "Industries (comma-separated):",
        filter: (input: string) =>
          input
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      },
      {
        type: "input",
        name: "focusAreas",
        message: "Focus areas / technologies (comma-separated):",
        filter: (input: string) =>
          input
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      },
      {
        type: "number",
        name: "teamSize",
        message: "Team size:",
      },
      {
        type: "input",
        name: "founded",
        message: "Founded (YYYY or YYYY-MM):",
      },
      {
        type: "confirm",
        name: "incorporated",
        message: "Incorporated?",
        default: false,
      },
      {
        type: "input",
        name: "website",
        message: "Website URL:",
      },
      {
        type: "input",
        name: "location",
        message: "Location:",
      },
      {
        type: "confirm",
        name: "remote",
        message: "Remote team?",
        default: true,
      },
    ]);

    // Ask about traction
    const tractionAnswers = await inquirer.prompt([
      {
        type: "confirm",
        name: "hasTraction",
        message: "Add traction metrics?",
        default: false,
      },
    ]);

    let traction: Product["traction"] | undefined;
    if (tractionAnswers.hasTraction) {
      const tractionData = await inquirer.prompt([
        {
          type: "number",
          name: "users",
          message: "Number of users (optional):",
        },
        {
          type: "number",
          name: "mrr",
          message: "Monthly recurring revenue $ (optional):",
        },
        {
          type: "number",
          name: "revenue",
          message: "Total revenue $ (optional):",
        },
        {
          type: "input",
          name: "growth",
          message: "Growth rate (e.g., '20% MoM'):",
        },
        {
          type: "input",
          name: "highlights",
          message: "Key highlights (comma-separated):",
          filter: (input: string) =>
            input
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
        },
      ]);

      traction = {
        users: tractionData.users || undefined,
        mrr: tractionData.mrr || undefined,
        revenue: tractionData.revenue || undefined,
        growth: tractionData.growth || undefined,
        highlights: tractionData.highlights,
      };
    }

    const product: Product = {
      id: randomUUID(),
      name: answers.name,
      tagline: answers.tagline || undefined,
      description: answers.description?.trim() || undefined,
      stage: answers.stage as Stage,
      industries: answers.industries,
      focusAreas: answers.focusAreas,
      teamSize: answers.teamSize || undefined,
      founders: [],
      founded: answers.founded || undefined,
      incorporated: answers.incorporated,
      traction,
      website: answers.website || undefined,
      location: answers.location || undefined,
      remote: answers.remote,
      createdAt: new Date().toISOString(),
    };

    await addProduct(product);
    console.log(chalk.green(`\nAdded product: ${product.name}`));
    console.log(chalk.dim(`ID: ${product.id}`));
  });

productsCommand
  .command("show")
  .description("Show details for a product")
  .argument("<id>", "Product ID")
  .action(async (id: string) => {
    const product = await getProduct(id);

    if (!product) {
      console.log(chalk.red(`Product not found: ${id}`));
      return;
    }

    console.log(chalk.bold.cyan(`\n${product.name}`));
    if (product.tagline) {
      console.log(chalk.italic(product.tagline));
    }
    console.log();

    if (product.description) {
      console.log(chalk.dim("Description:"));
      console.log(product.description);
      console.log();
    }

    console.log(chalk.dim("Details:"));
    console.log(`  Stage: ${product.stage ?? "Not set"}`);
    console.log(`  Team size: ${product.teamSize ?? "?"}`);
    console.log(`  Founded: ${product.founded ?? "?"}`);
    console.log(`  Incorporated: ${product.incorporated ? "Yes" : "No"}`);
    console.log(`  Location: ${product.location ?? "Not set"}`);
    console.log(`  Remote: ${product.remote ? "Yes" : "No"}`);

    if (product.industries.length > 0) {
      console.log(`  Industries: ${product.industries.join(", ")}`);
    }
    if (product.focusAreas.length > 0) {
      console.log(`  Focus areas: ${product.focusAreas.join(", ")}`);
    }
    if (product.website) {
      console.log(`  Website: ${product.website}`);
    }

    if (product.traction) {
      console.log();
      console.log(chalk.dim("Traction:"));
      if (product.traction.users) console.log(`  Users: ${product.traction.users.toLocaleString()}`);
      if (product.traction.mrr) console.log(`  MRR: $${product.traction.mrr.toLocaleString()}`);
      if (product.traction.revenue) console.log(`  Revenue: $${product.traction.revenue.toLocaleString()}`);
      if (product.traction.growth) console.log(`  Growth: ${product.traction.growth}`);
      if (product.traction.highlights?.length) {
        console.log(`  Highlights: ${product.traction.highlights.join(", ")}`);
      }
    }

    console.log();
    console.log(chalk.dim(`ID: ${product.id}`));
    console.log(chalk.dim(`Created: ${new Date(product.createdAt).toLocaleString()}`));
  });
