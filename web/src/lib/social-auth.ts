/**
 * Social Authentication utilities for LinkedIn and X (Twitter) OAuth
 * These work with Supabase Auth and connect to the backend API
 */

import { getSupabaseBrowser } from "./supabase/browser";

export type SocialProvider = "linkedin" | "twitter" | "google";

interface LinkedInProfile {
  sub: string; // Unique ID
  name: string; // Full name
  given_name: string;
  family_name: string;
  email?: string;
  email_verified?: boolean;
  picture?: string; // Profile photo URL
  locale?: string;
}

interface LinkedInHeadline {
  "ugcPost:author": string;
  localized?: {
    en_US?: string;
    [key: string]: string | undefined;
  };
}

interface LinkedInSkills {
  elements?: Array<{
    skill?: {
      name?: string;
    };
  }>;
}

interface LinkedInLocation {
  localized?: {
    en_US?: string;
    [key: string]: string | undefined;
  };
  preferredLocale?: {
    country: string;
    language: string;
  };
}

export interface LinkedInProfileData {
  full_name: string;
  headline?: string;
  profile_photo?: string;
  location?: string;
  top_skills: string[];
  email?: string;
}

export interface TwitterProfileData {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
  description?: string;
  location?: string;
  verified?: boolean;
}

/**
 * Initiate LinkedIn OAuth login
 * Supabase handles the OAuth flow, backend captures profile data on callback
 */
export async function signInWithLinkedIn() {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error("Supabase not initialized");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "linkedin_oidc", // Use LinkedIn OIDC provider
    options: {
      redirectTo: `${window.location.origin}/auth/callback?provider=linkedin`,
      scopes: "openid profile email w_member_social", // Request profile and basic sharing
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Initiate X (Twitter) OAuth login
 */
export async function signInWithTwitter() {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error("Supabase not initialized");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "twitter",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?provider=twitter`,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Fetch LinkedIn profile data after OAuth completion
 * This is called by the auth callback handler to pre-fill profile
 */
export async function fetchLinkedInProfile(accessToken: string): Promise<LinkedInProfileData | null> {
  try {
    // Fetch basic profile from LinkedIn API
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    if (!profileRes.ok) {
      console.error("LinkedIn profile fetch failed:", await profileRes.text());
      return null;
    }

    const profile: LinkedInProfile = await profileRes.json();

    // Build profile data
    const result: LinkedInProfileData = {
      full_name: profile.name,
      profile_photo: profile.picture,
      email: profile.email,
      top_skills: [],
    };

    // Try to fetch additional profile data (headline, skills, location)
    // Note: These require additional permissions beyond basic profile
    try {
      // Attempt to fetch skills (requires r_basicprofile or r_skills scope)
      const skillsRes = await fetch(
        "https://api.linkedin.com/v2/skills?q=owners&owners=urn:li:person:" + profile.sub,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );

      if (skillsRes.ok) {
        const skillsData: LinkedInSkills = await skillsRes.json();
        result.top_skills =
          skillsData.elements?.map((e) => e.skill?.name).filter(Boolean) as string[];
      }
    } catch {
      // Skills fetch is optional
    }

    return result;
  } catch (error) {
    console.error("Error fetching LinkedIn profile:", error);
    return null;
  }
}

/**
 * Pre-fill specialist profile with LinkedIn data
 * Called during onboarding after LinkedIn OAuth
 */
export async function prefillProfileWithLinkedIn(
  userId: string,
  linkedInData: LinkedInProfileData
): Promise<boolean> {
  try {
    const supabase = getSupabaseBrowser();
    if (!supabase) return false;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: linkedInData.full_name,
        headline: linkedInData.headline,
        avatar_url: linkedInData.profile_photo,
        location: linkedInData.location,
        skills: linkedInData.top_skills.slice(0, 10), // Limit to 10 skills
        linkedin_imported_at: new Date().toISOString(),
        linkedin_imported_data: linkedInData,
      })
      .eq("id", userId);

    if (error) {
      console.error("Error pre-filling profile:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in prefillProfileWithLinkedIn:", error);
    return false;
  }
}

/**
 * Get social login button styles/config
 */
export function getSocialLoginConfig(provider: SocialProvider) {
  const configs: Record<
    SocialProvider,
    { label: string; icon: string; bgColor: string; textColor: string; hoverBg: string }
  > = {
    linkedin: {
      label: "Continue with LinkedIn",
      icon: "linkedin",
      bgColor: "#0077b5",
      textColor: "#ffffff",
      hoverBg: "#005885",
    },
    twitter: {
      label: "Continue with X",
      icon: "twitter",
      bgColor: "#000000",
      textColor: "#ffffff",
      hoverBg: "#333333",
    },
    google: {
      label: "Continue with Google",
      icon: "google",
      bgColor: "#ffffff",
      textColor: "#000000",
      hoverBg: "#f2f2f2",
    },
  };

  return configs[provider];
}

/**
 * Social Login Button component configuration
 */
export const socialProviders: SocialProvider[] = ["google", "linkedin", "twitter"];
