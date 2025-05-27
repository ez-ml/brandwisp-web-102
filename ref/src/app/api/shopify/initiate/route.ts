import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const shop = url.searchParams.get("shop");
  const userId = url.searchParams.get("userId");
  const sync = url.searchParams.get("sync"); // optional param for future sync trigger

  if (!shop || !userId) {
    return new NextResponse("Missing shop or userId", { status: 400 });
  }

  if (!shop.endsWith(".myshopify.com")) {
    return new NextResponse("Invalid shop domain", { status: 400 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/shopify/callback`;
  const scopes = [
    "read_products",
    "write_products",
    "read_content",
    "write_content"
  ].join(",");

  // Optional state: send userId + sync flag
  const state = encodeURIComponent(JSON.stringify({ userId, sync }));

  const installUrl = `https://${shop}/admin/oauth/authorize` +
    `?client_id=${process.env.SHOPIFY_API_KEY}` +
    `&scope=${scopes}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}`;

  return NextResponse.redirect(installUrl);
}
