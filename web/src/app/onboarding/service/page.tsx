import { redirect } from "next/navigation";

/** Listing creation is optional — use the account offers flow. */
export default function OnboardingServiceRedirect() {
  redirect("/account/listings/new");
}
