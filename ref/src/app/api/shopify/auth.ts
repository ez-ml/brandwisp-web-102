// /app/api/shopify/initiate/route.ts or auth.js
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const shop = new URL(req.url).searchParams.get("shop");
  const userId = new URL(req.url).searchParams.get("userId");    // 👈 pass userId from frontend

  if (!shop || !userId) {
    return new NextResponse("Missing shop or userId", { status: 400 });
  }

  // Safety check
  if (!shop.endsWith(".myshopify.com")) {
    return new NextResponse("Invalid shop domain", { status: 400 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/shopify/callback`;

  // ✅ scopes updated as per your request
  const scopes = "read_products,write_products,read_content,write_content";

  const installUrl = `https://${shop}/admin/oauth/authorize` +
    `?client_id=${process.env.SHOPIFY_API_KEY}` +
    `&scope=${scopes}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${userId}`;    // ✅ pass BrandWisp Firebase userId as state

  return NextResponse.redirect(installUrl);
}
