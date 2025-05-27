import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    // Optional delay for realism
    await new Promise((res) => setTimeout(res, 400));

    return NextResponse.json({ reply: `Echo: ${message}` });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export const runtime = "edge"; // optional: to deploy on Vercel Edge Runtime
