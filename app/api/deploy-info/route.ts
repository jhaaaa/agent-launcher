import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  const { deployResult } = session;

  if (!deployResult) {
    return NextResponse.json({ error: "No deployment found" }, { status: 404 });
  }

  return NextResponse.json({
    projectId: deployResult.projectId,
    walletKey: deployResult.walletKey,
    dbEncryptionKey: deployResult.dbEncryptionKey,
  });
}
