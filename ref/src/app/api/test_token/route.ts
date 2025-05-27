import { adminDB } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const doc = await adminDB.doc("users/Test_102/shopify/store").get();
  const data = doc.exists ? doc.data() : null;

  if (!data) return NextResponse.json({ error: "No token found" }, { status: 404 });

  return NextResponse.json({ accessToken: data.accessToken });
}
