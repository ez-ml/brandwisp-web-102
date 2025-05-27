import { adminDB } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");
  const userId = req.nextUrl.searchParams.get("userId");

  if (!shop || !userId) {
    return new NextResponse("Missing shop or userId", { status: 400 });
  }

  try {
    const docSnap = await adminDB.doc(`users/${userId}/shopifyStores/${shop}`).get();


    if (!docSnap.exists) {
      return new NextResponse("No store found", { status: 404 });
    }

    const { accessToken } = docSnap.data();
    const res = await fetch(`https://${shop}/admin/api/2024-04/products.json`, {
      headers: { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" },
    });

    if (res.status === 401) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await res.json();
    return NextResponse.json({ products: data.products });
  } catch {
    return new NextResponse("Internal error", { status: 500 });
  }
}