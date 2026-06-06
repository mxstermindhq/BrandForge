"use client";

import * as React from "react";
import { LeadsView } from "@/components/leads/LeadsView";

export default function LeadsPage(): React.JSX.Element {
  return (
    <div>
      <h1 className="font-display text-4xl font-light">Leads</h1>
      <p className="mt-1 text-tx-muted">All leads across your campaigns.</p>
      <div className="mt-8">
        <LeadsView />
      </div>
    </div>
  );
}
