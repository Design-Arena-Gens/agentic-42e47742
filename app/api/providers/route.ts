import { NextResponse } from "next/server";

import { getProviderAvailability } from "@/lib/providers";

export async function GET() {
  const providers = getProviderAvailability().map(
    ({ enabled, disabledReason, ...provider }) => ({
      ...provider,
      enabled,
      disabledReason,
    }),
  );

  return NextResponse.json({ providers });
}
