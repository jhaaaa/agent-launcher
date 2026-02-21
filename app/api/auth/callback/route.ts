import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", req.url));
  }

  const tokenRes = await fetch("https://backboard.railway.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.RAILWAY_CLIENT_ID!,
      client_secret: process.env.RAILWAY_CLIENT_SECRET!,
      redirect_uri: `${req.nextUrl.origin}/api/auth/callback`,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/?error=token_exchange_failed", req.url));
  }

  const { access_token } = await tokenRes.json();

  const session = await getSession();
  session.railwayToken = access_token;
  await session.save();

  return NextResponse.redirect(new URL("/deploying", req.url));
}
