import { redirect } from "next/navigation";

/** Legacy category slugs → unified marketplace with filters */
export default async function MarketplaceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  redirect(`/marketplace?term=short&category=${encodeURIComponent(category)}`);
}
