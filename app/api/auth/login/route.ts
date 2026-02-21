import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const session = await getSession();
  session.formData = {
    agentName: body.agentName,
    aiProvider: body.aiProvider,
    systemPrompt: body.systemPrompt,
    apiKey: body.apiKey,
  };
  await session.save();

  const state = randomBytes(16).toString("hex");
  const clientId = process.env.RAILWAY_CLIENT_ID!;
  const redirectUri = `${req.nextUrl.origin}/api/auth/callback`;

  const url = new URL("https://backboard.railway.com/oauth/auth");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "openid workspace:member");
  url.searchParams.set("state", state);

  return NextResponse.json({ url: url.toString() });
}
