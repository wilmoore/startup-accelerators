import { z } from "zod";

export const ApplicationStatus = z.enum([
  "identified", // Opportunity identified, not yet started
  "researching", // Gathering info about requirements
  "drafting", // Working on application content
  "ready", // Application ready to submit
  "submitted", // Application submitted
  "interview", // Invited to interview
  "accepted", // Accepted to program
  "rejected", // Application rejected
  "withdrawn", // We withdrew
  "expired", // Deadline passed without submission
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatus>;

export const FollowUpSchema = z.object({
  id: z.string().uuid(),
  date: z.string().datetime(),
  type: z.enum(["email", "call", "meeting", "note"]),
  summary: z.string(),
  nextAction: z.string().optional(),
  nextActionDate: z.string().datetime().optional(),
});

export type FollowUp = z.infer<typeof FollowUpSchema>;

export const ApplicationSchema = z.object({
  id: z.string().uuid(),
  opportunityId: z.string().uuid(),
  productId: z.string().uuid(),

  // Status tracking
  status: ApplicationStatus.default("identified"),
  statusHistory: z
    .array(
      z.object({
        status: ApplicationStatus,
        date: z.string().datetime(),
        note: z.string().optional(),
      })
    )
    .default([]),

  // Timeline
  deadline: z.string().datetime().optional(),
  submittedAt: z.string().datetime().optional(),
  responseReceivedAt: z.string().datetime().optional(),

  // Fit assessment
  fitScore: z.number().min(0).max(100).optional(),
  fitNotes: z.string().optional(),

  // Application materials (customized for this specific application)
  materials: z
    .object({
      answers: z.record(z.string(), z.string()).optional(), // Question -> Answer mapping
      pitchDeckUrl: z.string().url().optional(),
      videoUrl: z.string().url().optional(),
      additionalDocs: z
        .array(
          z.object({
            name: z.string(),
            url: z.string().url(),
          })
        )
        .default([]),
    })
    .optional(),

  // Communication
  followUps: z.array(FollowUpSchema).default([]),
  contacts: z
    .array(
      z.object({
        name: z.string(),
        role: z.string().optional(),
        email: z.string().email().optional(),
        linkedin: z.string().url().optional(),
      })
    )
    .default([]),

  // Notes
  notes: z.string().optional(),

  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type Application = z.infer<typeof ApplicationSchema>;

export const ApplicationListSchema = z.object({
  applications: z.array(ApplicationSchema),
  lastUpdated: z.string().datetime(),
});

export type ApplicationList = z.infer<typeof ApplicationListSchema>;
