import { adminDB } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const shop = url.searchParams.get("shop");
  const code = url.searchParams.get("code");
  const rawState = url.searchParams.get("state");

  if (!shop || !code || !rawState) {
    return new Response("Missing parameters", { status: 400 });
  }

  // Parse state: either plain userId or JSON { userId, sync }
  let userId = rawState;
  let sync = false;

  try {
    const parsed = JSON.parse(rawState);
    if (parsed.userId) {
      userId = parsed.userId;
      sync = parsed.sync === 'true' || parsed.sync === true;
    }
  } catch {
    // fallback to legacy format where state is just userId
  }

  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY!,
        client_secret: process.env.SHOPIFY_API_SECRET!,
        code,
      }),
    });

    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;

    if (!accessToken) {
      return new Response("Shopify token fetch failed", { status: 502 });
    }

    // Save accessToken and connection info to Firestore
    const storeRef = adminDB.doc(`users/${userId}/shopifyStores/${shop}`);
    await storeRef.set({
      shop,
      accessToken,
      connectedAt: new Date().toISOString(),
      platform: "Shopify",
    });

    // Optional: sync shop metadata and products if requested
    if (sync) {
      const shopInfoRes = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });
      const shopInfo = await shopInfoRes.json();

      const productsRes = await fetch(`https://${shop}/admin/api/2023-10/products.json?limit=250`, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });
      const productsJson = await productsRes.json();

      // Update store metadata
      await storeRef.set({
        name: shopInfo.shop?.name || shop,
        email: shopInfo.shop?.email || "",
        primaryDomain: shopInfo.shop?.domain || shop,
        ...shopInfo.shop,
      }, { merge: true });

      // Store products
      const batch = adminDB.batch();
      for (const product of productsJson.products || []) {
        const productRef = storeRef.collection("products").doc(product.id.toString());
        batch.set(productRef, product);
      }
      await batch.commit();
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stores`);
  } catch (error) {
    console.error("Shopify callback error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
