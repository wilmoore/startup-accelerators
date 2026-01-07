import { Command } from "commander";
import { randomUUID } from "node:crypto";
import chalk from "chalk";
import inquirer from "inquirer";
import { getOpportunities, addOpportunity } from "../../lib/store.js";
import type { Opportunity, OpportunityType, Stage } from "../../types/index.js";

export const opportunitiesCommand = new Command("opportunities")
  .alias("opp")
  .description("Manage funding opportunities");

opportunitiesCommand
  .command("list")
  .description("List all opportunities")
  .option("-t, --type <type>", "Filter by type (accelerator, grant, angel)")
  .option("-s, --stage <stage>", "Filter by stage accepted")
  .action(async (options) => {
    const typeMap: Record<string, "accelerators" | "grants" | "angels"> = {
      accelerator: "accelerators",
      grant: "grants",
      angel: "angels",
    };

    const opportunities = await getOpportunities(
      options.type ? typeMap[options.type] : undefined
    );

    if (opportunities.length === 0) {
      console.log(chalk.yellow("No opportunities found."));
      console.log(
        chalk.dim('Run "accelerate opportunities add" to add one.')
      );
      return;
    }

    // Filter by stage if provided
    let filtered = opportunities;
    if (options.stage) {
      filtered = opportunities.filter((o) =>
        o.stagesAccepted.includes(options.stage as Stage)
      );
    }

    console.log(chalk.bold(`\nFound ${filtered.length} opportunities:\n`));

    for (const opp of filtered) {
      const deadline = opp.deadline
        ? new Date(opp.deadline).toLocaleDateString()
        : "Rolling";
      const funding = opp.fundingAmount
        ? `$${opp.fundingAmount.min?.toLocaleString() ?? "?"}-${opp.fundingAmount.max?.toLocaleString() ?? "?"}`
        : "Varies";
      const equity = opp.equityTaken
        ? `${opp.equityTaken.min ?? "?"}%-${opp.equityTaken.max ?? "?"}%`
        : "N/A";

      console.log(chalk.cyan.bold(opp.name));
      console.log(
        `  ${chalk.dim("Type:")} ${opp.type} | ${chalk.dim("Deadline:")} ${deadline}`
      );
      console.log(
        `  ${chalk.dim("Funding:")} ${funding} | ${chalk.dim("Equity:")} ${equity}`
      );
      if (opp.focusAreas.length > 0) {
        console.log(
          `  ${chalk.dim("Focus:")} ${opp.focusAreas.slice(0, 3).join(", ")}`
        );
      }
      if (opp.url) {
        console.log(`  ${chalk.dim("URL:")} ${opp.url}`);
      }
      console.log();
    }
  });

opportunitiesCommand
  .command("add")
  .description("Add a new opportunity")
  .option("-i, --interactive", "Interactive mode", true)
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Opportunity name:",
        validate: (input: string) => input.length > 0 || "Name is required",
      },
      {
        type: "list",
        name: "type",
        message: "Type:",
        choices: ["accelerator", "grant", "angel"],
      },
      {
        type: "input",
        name: "description",
        message: "Description (optional):",
      },
      {
        type: "input",
        name: "url",
        message: "Website URL (optional):",
      },
      {
        type: "input",
        name: "applicationUrl",
        message: "Application URL (optional):",
      },
      {
        type: "input",
        name: "fundingMin",
        message: "Minimum funding amount (optional):",
        filter: (input: string) => (input ? parseInt(input, 10) : undefined),
      },
      {
        type: "input",
        name: "fundingMax",
        message: "Maximum funding amount (optional):",
        filter: (input: string) => (input ? parseInt(input, 10) : undefined),
      },
      {
        type: "input",
        name: "equityMin",
        message: "Minimum equity % (optional):",
        filter: (input: string) => (input ? parseFloat(input) : undefined),
      },
      {
        type: "input",
        name: "equityMax",
        message: "Maximum equity % (optional):",
        filter: (input: string) => (input ? parseFloat(input) : undefined),
      },
      {
        type: "input",
        name: "deadline",
        message: "Application deadline (YYYY-MM-DD, optional):",
      },
      {
        type: "checkbox",
        name: "stagesAccepted",
        message: "Stages accepted:",
        choices: ["idea", "pre-seed", "seed", "series-a", "series-b", "growth"],
      },
      {
        type: "input",
        name: "focusAreas",
        message: "Focus areas (comma-separated, optional):",
        filter: (input: string) =>
          input
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      },
      {
        type: "input",
        name: "location",
        message: "Location (optional):",
      },
      {
        type: "confirm",
        name: "remote",
        message: "Remote-friendly?",
        default: false,
      },
    ]);

    const opportunity: Opportunity = {
      id: randomUUID(),
      name: answers.name,
      type: answers.type as OpportunityType,
      description: answers.description || undefined,
      url: answers.url || undefined,
      applicationUrl: answers.applicationUrl || undefined,
      fundingAmount:
        answers.fundingMin || answers.fundingMax
          ? {
              min: answers.fundingMin,
              max: answers.fundingMax,
              currency: "USD",
            }
          : undefined,
      equityTaken:
        answers.equityMin || answers.equityMax
          ? {
              min: answers.equityMin,
              max: answers.equityMax,
            }
          : undefined,
      deadline: answers.deadline
        ? new Date(answers.deadline).toISOString()
        : undefined,
      stagesAccepted: answers.stagesAccepted as Stage[],
      focusAreas: answers.focusAreas,
      industries: [],
      location: answers.location || undefined,
      remote: answers.remote,
      requirements: [],
      benefits: [],
      createdAt: new Date().toISOString(),
    };

    await addOpportunity(opportunity);
    console.log(chalk.green(`\nAdded opportunity: ${opportunity.name}`));
  });

opportunitiesCommand
  .command("search")
  .description("Search opportunities by keyword")
  .argument("<keyword>", "Search keyword")
  .action(async (keyword: string) => {
    const opportunities = await getOpportunities();
    const lower = keyword.toLowerCase();

    const matches = opportunities.filter(
      (o) =>
        o.name.toLowerCase().includes(lower) ||
        o.description?.toLowerCase().includes(lower) ||
        o.focusAreas.some((f) => f.toLowerCase().includes(lower)) ||
        o.industries?.some((i) => i.toLowerCase().includes(lower))
    );

    if (matches.length === 0) {
      console.log(chalk.yellow(`No opportunities matching "${keyword}"`));
      return;
    }

    console.log(
      chalk.bold(`\nFound ${matches.length} matches for "${keyword}":\n`)
    );
    for (const opp of matches) {
      console.log(`  ${chalk.cyan(opp.name)} (${opp.type})`);
    }
  });
