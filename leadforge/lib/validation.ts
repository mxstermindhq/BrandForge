import type { CampaignCreateInput, CampaignType } from "@/types";
import { getPlatformById } from "@/lib/constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && EMAIL_RE.test(email.trim());
}

export function validateRegister(body: unknown): {
  email: string;
  name: string;
  password: string;
} {
  const b = (body ?? {}) as Record<string, unknown>;
  if (!isValidEmail(b.email)) throw new ValidationError("Valid email required");
  if (typeof b.name !== "string" || b.name.trim().length === 0) {
    throw new ValidationError("Name is required");
  }
  if (typeof b.password !== "string" || b.password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }
  return {
    email: b.email.trim().toLowerCase(),
    name: b.name.trim(),
    password: b.password,
  };
}

export function validateLogin(body: unknown): {
  email: string;
  password: string;
} {
  const b = (body ?? {}) as Record<string, unknown>;
  if (!isValidEmail(b.email)) throw new ValidationError("Valid email required");
  if (typeof b.password !== "string" || b.password.length === 0) {
    throw new ValidationError("Password is required");
  }
  return { email: b.email.trim().toLowerCase(), password: b.password };
}

export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateCampaignInput(
  body: unknown,
  userId: string,
): Omit<CampaignCreateInput, "credits_used"> {
  const b = (body ?? {}) as Record<string, unknown>;

  const type = b.type === "b2b" || b.type === "b2c" ? (b.type as CampaignType) : null;
  if (!type) throw new ValidationError("type must be 'b2b' or 'b2c'");

  const requireStr = (key: string, label: string): string => {
    const v = b[key];
    if (typeof v !== "string" || v.trim().length === 0) {
      throw new ValidationError(`${label} is required`);
    }
    return v.trim();
  };

  const name = requireStr("name", "Campaign name");
  const product_name = requireStr("product_name", "Product name");
  const target_description = requireStr("target_description", "Target description");
  const price_point = requireStr("price_point", "Price point");

  const quantity = Number(b.quantity_requested);
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 5000) {
    throw new ValidationError("quantity_requested must be between 1 and 5000");
  }

  if (!Array.isArray(b.platforms) || b.platforms.length === 0) {
    throw new ValidationError("At least one platform is required");
  }
  const platforms = b.platforms.map(String);
  for (const id of platforms) {
    const platform = getPlatformById(id);
    if (!platform) throw new ValidationError(`Unknown platform: ${id}`);
    if (type === "b2b" && !platform.b2b) {
      throw new ValidationError(`${platform.name} is not valid for B2B`);
    }
    if (type === "b2c" && !platform.b2c) {
      throw new ValidationError(`${platform.name} is not valid for B2C`);
    }
  }

  return {
    user_id: userId,
    name,
    type,
    product_name,
    product_description:
      typeof b.product_description === "string" ? b.product_description.trim() : null,
    target_description,
    price_point,
    location: typeof b.location === "string" && b.location.trim() ? b.location.trim() : null,
    quantity_requested: Math.floor(quantity),
    platforms,
    enrich: b.enrich !== false, // default true
  };
}
