import { z } from "zod";

export const OpportunityType = z.enum(["accelerator", "grant", "angel"]);
export type OpportunityType = z.infer<typeof OpportunityType>;

export const Stage = z.enum([
  "idea",
  "pre-seed",
  "seed",
  "series-a",
  "series-b",
  "growth",
]);
export type Stage = z.infer<typeof Stage>;

export const OpportunitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: OpportunityType,
  description: z.string().optional(),
  url: z.string().url().optional(),
  applicationUrl: z.string().url().optional(),

  // Funding details
  fundingAmount: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().default("USD"),
    })
    .optional(),
  equityTaken: z
    .object({
      min: z.number().min(0).max(100).optional(),
      max: z.number().min(0).max(100).optional(),
    })
    .optional(),

  // Timeline
  deadline: z.string().datetime().optional(),
  applicationWindow: z
    .object({
      opens: z.string().datetime().optional(),
      closes: z.string().datetime().optional(),
    })
    .optional(),
  cohortStart: z.string().datetime().optional(),
  programDuration: z.string().optional(), // e.g., "3 months", "12 weeks"

  // Targeting
  focusAreas: z.array(z.string()).default([]),
  stagesAccepted: z.array(Stage).default([]),
  industries: z.array(z.string()).default([]),

  // Location
  location: z.string().optional(),
  remote: z.boolean().default(false),

  // Additional info
  requirements: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  notes: z.string().optional(),

  // Metadata
  source: z.string().optional(), // Where we found this opportunity
  sourceUrl: z.string().url().optional(),
  lastUpdated: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;

export const OpportunityListSchema = z.object({
  opportunities: z.array(OpportunitySchema),
  lastUpdated: z.string().datetime(),
});

export type OpportunityList = z.infer<typeof OpportunityListSchema>;
