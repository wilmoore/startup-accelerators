import { z } from "zod";
import { Stage } from "./opportunity.js";

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  tagline: z.string().optional(), // One-liner description
  description: z.string().optional(), // Longer description

  // Stage & industry
  stage: Stage.optional(),
  industries: z.array(z.string()).default([]),
  focusAreas: z.array(z.string()).default([]),

  // Team
  teamSize: z.number().int().positive().optional(),
  founders: z
    .array(
      z.object({
        name: z.string(),
        role: z.string().optional(),
        linkedin: z.string().url().optional(),
        bio: z.string().optional(),
      })
    )
    .default([]),

  // Timeline
  founded: z.string().optional(), // e.g., "2024-01" or "2024"
  incorporated: z.boolean().default(false),
  incorporationType: z.string().optional(), // e.g., "Delaware C-Corp"

  // Traction
  traction: z
    .object({
      users: z.number().optional(),
      revenue: z.number().optional(),
      mrr: z.number().optional(),
      arr: z.number().optional(),
      growth: z.string().optional(), // e.g., "20% MoM"
      highlights: z.array(z.string()).default([]),
    })
    .optional(),

  // Funding history
  fundingRaised: z
    .object({
      total: z.number().optional(),
      lastRound: z.string().optional(),
      investors: z.array(z.string()).default([]),
    })
    .optional(),

  // Assets
  website: z.string().url().optional(),
  pitchDeckUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),

  // Location
  location: z.string().optional(),
  remote: z.boolean().default(true),

  // Application content (reusable across applications)
  applicationContent: z
    .object({
      problemStatement: z.string().optional(),
      solution: z.string().optional(),
      uniqueValue: z.string().optional(),
      marketSize: z.string().optional(),
      businessModel: z.string().optional(),
      competition: z.string().optional(),
      whyNow: z.string().optional(),
      whyUs: z.string().optional(),
      askAmount: z.number().optional(),
      useOfFunds: z.string().optional(),
    })
    .optional(),

  // Metadata
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductListSchema = z.object({
  products: z.array(ProductSchema),
  lastUpdated: z.string().datetime(),
});

export type ProductList = z.infer<typeof ProductListSchema>;
