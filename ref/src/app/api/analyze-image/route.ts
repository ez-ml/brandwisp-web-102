import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type;

    const prompt = `
    You are an AI product analyst. Review this product image and return the following JSON:
    {
      "product_name": "...",
      "product_type": "...",
      "category": "...",
      "keywords": [...],
      "features": [...],
      "target_audience": "...",
      "visual_style": "...",
      "trend_signal": "...",
      "searchability_index": "...",
      "visual_appeal": "...",
      "competitive_niche": "...",
      "differentiator": "...",
      "summary": "..."
    }
    
    Instructions:
    1. "searchability_index". This should be one of: "Low", "Medium", or "High", based on how discoverable the product is via search (e.g., keyword presence, title quality, metadata cues).
    
    2. The "trend_signal" field should also be rated as "Low", "Medium", or "High", depending on current market alignment and trending interest for its category or ingredients.
    
    3. The "summary" must provide a detailed analysis, including:
       - The scope of this product in today’s market.
       - Potential challenges it might face (e.g., saturation, poor differentiation, packaging weakness).
       - An overall verdict on its market viability and recommendations for success.
    `;
    

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    const rawText = data.choices[0].message.content;

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("❌ analyze-image error:", err);
    return new Response(JSON.stringify({ error: "Image processing failed" }), {
      status: 500,
    });
  }
}
