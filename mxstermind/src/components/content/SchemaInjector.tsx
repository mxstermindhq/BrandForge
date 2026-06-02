import type { SchemaInjectorProps } from "@/types/content";
import { buildPageSchema } from "@/lib/seo/schema";

type SchemaInjectorComponentProps = SchemaInjectorProps;

/** Injects valid Schema.org JSON-LD for the current page. */
export function SchemaInjector(props: SchemaInjectorComponentProps): React.JSX.Element {
  const schema = buildPageSchema(props);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
