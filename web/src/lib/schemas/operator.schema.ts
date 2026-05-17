import { z } from "zod";

const FaqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const CuratedOperatorSchema = z.object({
  username: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  yearsExp: z.number().min(0).max(50),
  availability: z.enum(["available-now", "available", "limited", "unavailable"]),
  amanahScore: z.number().min(0).max(100),
  completionRate: z.number().min(0).max(100),
  bio: z.string().max(280),
  bestResult: z.string().max(140),
  wontTakeOn: z.string().max(140),
  startingPrice: z.string(),
  pricingModel: z.string(),
  skills: z.array(z.string()).max(6),
  idealClient: z.string().max(100),
  workStyle: z.string().max(100),
  typicalTimeline: z.string().max(80),
  proofLink: z.string().url().optional(),
  faq: z.array(FaqItemSchema).max(6),
  isVerified: z.boolean(),
  layoutSpan: z.enum(["featured", "standard", "compact"]),
  displayOrder: z.number(),
});

export type CuratedOperator = z.infer<typeof CuratedOperatorSchema>;
