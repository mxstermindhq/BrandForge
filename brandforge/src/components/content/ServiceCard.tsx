import Link from "next/link";
import type { ServiceCardData } from "@/types/content";

type ServiceCardProps = {
  service: ServiceCardData;
};

export function ServiceCard({ service }: ServiceCardProps): React.JSX.Element {
  return (
    <Link
      href={service.href}
      className="group block rounded-md border border-b1 bg-s1 p-6 transition-colors hover:border-[var(--a-mid)]"
      data-cursor="hover"
    >
      <span className="font-mono text-xl text-accent-bright" aria-hidden>
        {service.icon}
      </span>
      <h3 className="mt-3 text-lg font-bold group-hover:text-accent-bright">{service.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{service.description}</p>
      <span className="mt-4 inline-block font-mono text-[10px] text-accent-bright">
        View service →
      </span>
    </Link>
  );
}
