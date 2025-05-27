import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const jsonData = await req.json();

    const prompt = `
You are a product analyst AI assistant. Based on the given product data, perform the following tasks:

1. Validate these fields:
    - product_name
    - product_type
    - category
    - keywords
    - features
    - target_audience
    - visual_style

2. Score the product:
    - trend_signal: "High & rising" if keywords include "vitamin c", "collagen", "turmeric"
    - seo_metadata: "High" if product_name has > 4 words and 3+ keywords
    - visual_appeal: "Strong design" if features include dropper, glass bottle, premium packaging
    - competitive_niche: "Blue ocean" if product_type is niche (Serum, Mist, Inhaler)
    - differentiator: "Clearly defined" if 3+ strong features; else "Generic"

3. Return only this valid JSON:
{
  "product_name": "...",
  "product_type": "...",
  "category": "...",
  "keywords": [...],
  "features": [...],
  "target_audience": "...",
  "visual_style": "...",
  "trend_signal": "...",
  "seo_metadata": "...",
  "visual_appeal": "...",
  "competitive_niche": "...",
  "differentiator": "...",
  "summary": "One paragraph human-readable summary of product, uniqueness, and positioning."
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "user", content: prompt },
          { role: "user", content: `Input JSON:\n${JSON.stringify(jsonData, null, 2)}` }
        ],
        max_tokens: 1000,
        temperature: 0.2
      })
    });

    const data = await response.json();
    const rawText = data.choices[0].message.content;

    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
