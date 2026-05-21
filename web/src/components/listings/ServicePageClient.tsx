"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ServiceDetailView } from "./ServiceDetailView";
import type { ServiceDetail } from "@/lib/service-types";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";

type ServicePageClientProps = {
  service: ServiceDetail;
  backHref: string;
  backLabel: string;
};

export function ServicePageClient({ service, backHref, backLabel }: ServicePageClientProps) {
  const { session } = useAuth();
  const { me } = useAuthMe();
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (!session?.user?.id || service.isOfficial) {
      setCanEdit(false);
      return;
    }
    setCanEdit(
      Boolean(
        me?.profile?.id &&
          service.ownerId &&
          String(me.profile.id) === String(service.ownerId),
      ),
    );
  }, [session, me, service.ownerId, service.isOfficial]);

  useEffect(() => {
    void apiFetch("/api/marketplace/views", {
      method: "POST",
      body: JSON.stringify({
        listingId: service.id,
        listingType: service.isOfficial ? "official" : "db",
      }),
    });
  }, [service.id, service.isOfficial]);

  return (
    <main className="forge-page pb-28">
      <div className="forge-container forge-page-inner">
        <Link href={backHref} className="forge-back-link">
          {backLabel}
        </Link>
        <ServiceDetailView service={service} canEdit={canEdit} />
      </div>
    </main>
  );
}
