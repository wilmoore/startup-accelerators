#!/usr/bin/env node

import { Command } from "commander";
import { opportunitiesCommand } from "./commands/opportunities.js";
import { productsCommand } from "./commands/products.js";
import { applicationsCommand } from "./commands/applications.js";
import { scrapeCommand } from "./commands/scrape.js";

const program = new Command();

program
  .name("accelerate")
  .description(
    "Automate discovery and applications to startup accelerators, grants, and angel networks"
  )
  .version("0.1.0");

program.addCommand(opportunitiesCommand);
program.addCommand(productsCommand);
program.addCommand(applicationsCommand);
program.addCommand(scrapeCommand);

program.parse();
