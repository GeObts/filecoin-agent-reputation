import { z } from "zod/v4";

// --- Primitive schemas ---

export const ethereumAddress = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, "Invalid Ethereum address");

export const cidString = z
  .string()
  .min(1, "CID must not be empty")
  .max(200, "CID too long")
  .regex(/^[a-zA-Z0-9_\-+=/.]+$/, "CID contains invalid characters");

export const githubUsername = z
  .string()
  .regex(/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,37}[a-zA-Z0-9])?$/, "Invalid GitHub username");

// --- Request schemas ---

export const calculateReputationSchema = z.object({
  agentAddress: ethereumAddress,
  githubUsername: githubUsername.optional(),
});
