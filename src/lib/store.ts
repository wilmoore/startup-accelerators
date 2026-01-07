import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  OpportunityListSchema,
  ProductListSchema,
  ApplicationListSchema,
  type Opportunity,
  type OpportunityList,
  type Product,
  type ProductList,
  type Application,
  type ApplicationList,
} from "../types/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "..", "data");

const PATHS = {
  opportunities: {
    accelerators: join(DATA_DIR, "opportunities", "accelerators.json"),
    grants: join(DATA_DIR, "opportunities", "grants.json"),
    angels: join(DATA_DIR, "opportunities", "angels.json"),
  },
  products: join(DATA_DIR, "products", "products.json"),
  applications: join(DATA_DIR, "applications", "applications.json"),
} as const;

async function ensureDir(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

async function readJson<T>(
  filePath: string,
  schema: z.ZodSchema<T>,
  defaultValue: T
): Promise<T> {
  try {
    if (!existsSync(filePath)) {
      return defaultValue;
    }
    const content = await readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    return schema.parse(data);
  } catch {
    return defaultValue;
  }
}

async function writeJson<T>(filePath: string, data: T): Promise<void> {
  await ensureDir(filePath);
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Opportunity operations
function createDefaultOpportunityList(): OpportunityList {
  return {
    opportunities: [],
    lastUpdated: new Date().toISOString(),
  };
}

export async function getOpportunities(
  type?: "accelerators" | "grants" | "angels"
): Promise<Opportunity[]> {
  if (type) {
    const data = await readJson(
      PATHS.opportunities[type],
      OpportunityListSchema,
      createDefaultOpportunityList()
    );
    return data.opportunities as Opportunity[];
  }

  // Get all opportunities
  const all: Opportunity[] = [];
  for (const key of Object.keys(PATHS.opportunities) as Array<
    keyof typeof PATHS.opportunities
  >) {
    const data = await readJson(
      PATHS.opportunities[key],
      OpportunityListSchema,
      createDefaultOpportunityList()
    );
    all.push(...(data.opportunities as Opportunity[]));
  }
  return all;
}

export async function addOpportunity(opportunity: Opportunity): Promise<void> {
  const typeMap: Record<string, keyof typeof PATHS.opportunities> = {
    accelerator: "accelerators",
    grant: "grants",
    angel: "angels",
  };
  const fileKey = typeMap[opportunity.type];
  const filePath = PATHS.opportunities[fileKey];

  const data = await readJson(filePath, OpportunityListSchema, createDefaultOpportunityList());
  data.opportunities.push(opportunity);
  data.lastUpdated = new Date().toISOString();

  await writeJson(filePath, data);
}

// Product operations
function createDefaultProductList(): ProductList {
  return { products: [], lastUpdated: new Date().toISOString() };
}

export async function getProducts(): Promise<Product[]> {
  const data = await readJson(
    PATHS.products,
    ProductListSchema,
    createDefaultProductList()
  );
  return data.products as Product[];
}

export async function addProduct(product: Product): Promise<void> {
  const data = await readJson(
    PATHS.products,
    ProductListSchema,
    createDefaultProductList()
  );
  data.products.push(product);
  data.lastUpdated = new Date().toISOString();

  await writeJson(PATHS.products, data);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

// Application operations
function createDefaultApplicationList(): ApplicationList {
  return {
    applications: [],
    lastUpdated: new Date().toISOString(),
  };
}

export async function getApplications(): Promise<Application[]> {
  const data = await readJson(
    PATHS.applications,
    ApplicationListSchema,
    createDefaultApplicationList()
  );
  return data.applications as Application[];
}

export async function addApplication(application: Application): Promise<void> {
  const data = await readJson(
    PATHS.applications,
    ApplicationListSchema,
    createDefaultApplicationList()
  );
  data.applications.push(application);
  data.lastUpdated = new Date().toISOString();

  await writeJson(PATHS.applications, data);
}

export async function updateApplication(
  id: string,
  updates: Partial<Application>
): Promise<void> {
  const data = await readJson(
    PATHS.applications,
    ApplicationListSchema,
    createDefaultApplicationList()
  );

  const index = data.applications.findIndex((a) => a.id === id);
  if (index !== -1) {
    data.applications[index] = {
      ...data.applications[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    data.lastUpdated = new Date().toISOString();
    await writeJson(PATHS.applications, data);
  }
}
