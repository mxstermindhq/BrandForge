import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string }>;
}) {
  const params = (await searchParams) || {};
  const plan = String(params.plan || "").trim();
  if (plan) {
    redirect(`/?plan=${encodeURIComponent(plan)}`);
  }
  redirect("/");
}
