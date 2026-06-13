import type { BlogPost } from "../types";
import { post as completeGuideForumSellerReputation } from "./complete-guide-forum-seller-reputation";
import { post as discordServerBrandingForGrowth } from "./discord-server-branding-for-growth";
import { post as escrowFriendlyAgencyIntake } from "./escrow-friendly-agency-intake";
import { post as howToPickTheRightBrandforgeTier } from "./how-to-pick-the-right-brandforge-tier";
import { post as web3BrandingBuildingTrustDecentralizedMarkets } from "./web3-branding-building-trust-decentralized-markets";

/** Drop new posts in this folder and add one import + array entry in `posts/index.ts`. */
export const BLOG_POSTS_FROM_FILES: readonly BlogPost[] = [
  web3BrandingBuildingTrustDecentralizedMarkets,
  completeGuideForumSellerReputation,
  discordServerBrandingForGrowth,
  escrowFriendlyAgencyIntake,
  howToPickTheRightBrandforgeTier,
];
