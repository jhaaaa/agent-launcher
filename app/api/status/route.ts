import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDeploymentStatus } from "@/lib/railway";

export async function GET() {
  const session = await getSession();
  const { railwayToken, deployResult } = session;

  if (!railwayToken || !deployResult) {
    return NextResponse.json({ error: "No deployment in progress" }, { status: 400 });
  }

  try {
    const deployment = await getDeploymentStatus(railwayToken, deployResult.serviceId);
    return NextResponse.json(deployment);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Status check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
