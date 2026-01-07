import { Command } from "commander";
import { randomUUID } from "node:crypto";
import chalk from "chalk";
import inquirer from "inquirer";
import {
  getApplications,
  addApplication,
  updateApplication,
  getOpportunities,
  getProducts,
} from "../../lib/store.js";
import type { Application, ApplicationStatus } from "../../types/index.js";

const STATUS_COLORS: Record<ApplicationStatus, (text: string) => string> = {
  identified: chalk.gray,
  researching: chalk.blue,
  drafting: chalk.yellow,
  ready: chalk.cyan,
  submitted: chalk.magenta,
  interview: chalk.green,
  accepted: chalk.green.bold,
  rejected: chalk.red,
  withdrawn: chalk.gray,
  expired: chalk.red.dim,
};

export const applicationsCommand = new Command("applications")
  .alias("app")
  .description("Track your applications pipeline");

applicationsCommand
  .command("list")
  .description("List all applications")
  .option("-s, --status <status>", "Filter by status")
  .action(async (options) => {
    const applications = await getApplications();
    const opportunities = await getOpportunities();
    const products = await getProducts();

    // Create lookup maps
    const oppMap = new Map(opportunities.map((o) => [o.id, o]));
    const prodMap = new Map(products.map((p) => [p.id, p]));

    let filtered = applications;
    if (options.status) {
      filtered = applications.filter((a) => a.status === options.status);
    }

    if (filtered.length === 0) {
      console.log(chalk.yellow("No applications found."));
      console.log(chalk.dim('Run "accelerate applications add" to track one.'));
      return;
    }

    // Group by status
    const byStatus = new Map<ApplicationStatus, Application[]>();
    for (const app of filtered) {
      const list = byStatus.get(app.status) ?? [];
      list.push(app);
      byStatus.set(app.status, list);
    }

    console.log(chalk.bold(`\nApplication Pipeline (${filtered.length}):\n`));

    const statusOrder: ApplicationStatus[] = [
      "identified",
      "researching",
      "drafting",
      "ready",
      "submitted",
      "interview",
      "accepted",
      "rejected",
      "withdrawn",
      "expired",
    ];

    for (const status of statusOrder) {
      const apps = byStatus.get(status);
      if (!apps?.length) continue;

      const colorFn = STATUS_COLORS[status];
      console.log(colorFn(`■ ${status.toUpperCase()} (${apps.length})`));

      for (const app of apps) {
        const opp = oppMap.get(app.opportunityId);
        const prod = prodMap.get(app.productId);
        const deadline = app.deadline
          ? new Date(app.deadline).toLocaleDateString()
          : "No deadline";

        console.log(`  ${chalk.cyan(opp?.name ?? "Unknown")} → ${chalk.dim(prod?.name ?? "Unknown")}`);
        console.log(`    ${chalk.dim("Deadline:")} ${deadline}`);
        if (app.fitScore !== undefined) {
          console.log(`    ${chalk.dim("Fit score:")} ${app.fitScore}%`);
        }
      }
      console.log();
    }
  });

applicationsCommand
  .command("add")
  .description("Start tracking a new application")
  .action(async () => {
    const opportunities = await getOpportunities();
    const products = await getProducts();

    if (opportunities.length === 0) {
      console.log(chalk.yellow("No opportunities found. Add one first:"));
      console.log(chalk.dim("  accelerate opportunities add"));
      return;
    }

    if (products.length === 0) {
      console.log(chalk.yellow("No products found. Add one first:"));
      console.log(chalk.dim("  accelerate products add"));
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "opportunityId",
        message: "Select opportunity:",
        choices: opportunities.map((o) => ({
          name: `${o.name} (${o.type})`,
          value: o.id,
        })),
      },
      {
        type: "list",
        name: "productId",
        message: "Select product to apply with:",
        choices: products.map((p) => ({
          name: `${p.name} (${p.stage ?? "no stage"})`,
          value: p.id,
        })),
      },
      {
        type: "list",
        name: "status",
        message: "Initial status:",
        choices: [
          { name: "Identified - Just tracking", value: "identified" },
          { name: "Researching - Gathering requirements", value: "researching" },
          { name: "Drafting - Working on application", value: "drafting" },
        ],
        default: "identified",
      },
      {
        type: "input",
        name: "deadline",
        message: "Application deadline (YYYY-MM-DD, optional):",
      },
      {
        type: "number",
        name: "fitScore",
        message: "Fit score 0-100 (optional):",
      },
      {
        type: "input",
        name: "fitNotes",
        message: "Fit notes (optional):",
      },
    ]);

    const application: Application = {
      id: randomUUID(),
      opportunityId: answers.opportunityId,
      productId: answers.productId,
      status: answers.status as ApplicationStatus,
      statusHistory: [
        {
          status: answers.status as ApplicationStatus,
          date: new Date().toISOString(),
        },
      ],
      deadline: answers.deadline
        ? new Date(answers.deadline).toISOString()
        : undefined,
      fitScore: answers.fitScore || undefined,
      fitNotes: answers.fitNotes || undefined,
      followUps: [],
      contacts: [],
      createdAt: new Date().toISOString(),
    };

    await addApplication(application);

    const opp = opportunities.find((o) => o.id === answers.opportunityId);
    const prod = products.find((p) => p.id === answers.productId);

    console.log(chalk.green(`\nTracking application:`));
    console.log(`  ${chalk.cyan(opp?.name)} → ${prod?.name}`);
    console.log(chalk.dim(`  ID: ${application.id}`));
  });

applicationsCommand
  .command("update")
  .description("Update application status")
  .argument("<id>", "Application ID (partial match supported)")
  .action(async (idPartial: string) => {
    const applications = await getApplications();
    const opportunities = await getOpportunities();
    const products = await getProducts();

    // Find application by partial ID
    const app = applications.find((a) => a.id.startsWith(idPartial));

    if (!app) {
      console.log(chalk.red(`No application found matching: ${idPartial}`));
      return;
    }

    const opp = opportunities.find((o) => o.id === app.opportunityId);
    const prod = products.find((p) => p.id === app.productId);

    console.log(chalk.bold(`\nUpdating: ${opp?.name} → ${prod?.name}`));
    console.log(`Current status: ${STATUS_COLORS[app.status](app.status)}\n`);

    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "status",
        message: "New status:",
        choices: [
          { name: "Identified", value: "identified" },
          { name: "Researching", value: "researching" },
          { name: "Drafting", value: "drafting" },
          { name: "Ready to submit", value: "ready" },
          { name: "Submitted", value: "submitted" },
          { name: "Interview scheduled", value: "interview" },
          { name: "Accepted!", value: "accepted" },
          { name: "Rejected", value: "rejected" },
          { name: "Withdrawn", value: "withdrawn" },
          { name: "Expired", value: "expired" },
        ],
        default: app.status,
      },
      {
        type: "input",
        name: "note",
        message: "Add a note about this update (optional):",
      },
    ]);

    const updates: Partial<Application> = {
      status: answers.status as ApplicationStatus,
      statusHistory: [
        ...app.statusHistory,
        {
          status: answers.status as ApplicationStatus,
          date: new Date().toISOString(),
          note: answers.note || undefined,
        },
      ],
    };

    if (answers.status === "submitted" && !app.submittedAt) {
      updates.submittedAt = new Date().toISOString();
    }

    await updateApplication(app.id, updates);

    console.log(
      chalk.green(`\nUpdated status to: ${STATUS_COLORS[answers.status as ApplicationStatus](answers.status)}`)
    );
  });

applicationsCommand
  .command("stats")
  .description("Show application statistics")
  .action(async () => {
    const applications = await getApplications();

    if (applications.length === 0) {
      console.log(chalk.yellow("No applications tracked yet."));
      return;
    }

    const byStatus = new Map<ApplicationStatus, number>();
    for (const app of applications) {
      byStatus.set(app.status, (byStatus.get(app.status) ?? 0) + 1);
    }

    console.log(chalk.bold("\nApplication Statistics:\n"));
    console.log(`Total tracked: ${chalk.cyan(applications.length)}`);
    console.log();

    const active = ["identified", "researching", "drafting", "ready", "submitted", "interview"];
    const activeCount = active.reduce((sum, s) => sum + (byStatus.get(s as ApplicationStatus) ?? 0), 0);
    const acceptedCount = byStatus.get("accepted") ?? 0;
    const rejectedCount = byStatus.get("rejected") ?? 0;

    console.log(`Active pipeline: ${chalk.cyan(activeCount)}`);
    console.log(`Accepted: ${chalk.green(acceptedCount)}`);
    console.log(`Rejected: ${chalk.red(rejectedCount)}`);

    if (acceptedCount + rejectedCount > 0) {
      const successRate = Math.round((acceptedCount / (acceptedCount + rejectedCount)) * 100);
      console.log(`Success rate: ${chalk.yellow(successRate + "%")}`);
    }
  });
