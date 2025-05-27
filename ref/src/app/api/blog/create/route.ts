// File: /app/api/blog/create/route.ts
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();

    const {
      product_name,
      product_description,
      product_features,
      keywords,
      blog_objective,
      tone,
      cta,
      length
    } = formData;

    const blogPrompt = `
You are an expert eCommerce copywriter and content strategist. Craft a ${length.toLowerCase()} blog post with a ${tone.toLowerCase()} tone, aimed at achieving the objective: "${blog_objective}". Incorporate a compelling call-to-action: "${cta}".

Focus on the product: "${product_name}".

Product Details:
- Description: ${product_description}
- Features: ${product_features.join(", ")}
- Keywords: ${keywords.join(", ")}

Structure the blog post as follows:

1. **Title**: Create an SEO-optimized, attention-grabbing title that includes relevant keywords.

2. **Introduction**: Provide a captivating opening that introduces the product and its relevance to the target audience.

3. **Body**:
   - **Feature Highlights**: Elaborate on the product features and their benefits.
   - **Use Cases**: Describe scenarios where the product solves specific problems or enhances the user's experience.
   - **Customer Testimonials**: Include hypothetical or real testimonials to build trust and credibility.
   - **Visual Elements**: Suggest appropriate images, infographics, or videos that would complement the content and enhance understanding.

4. **Conclusion**: Summarize the key points and reinforce the product's value proposition.

5. **Call-to-Action (CTA)**: Encourage readers to take a specific action, such as making a purchase or subscribing to a newsletter.

Ensure the content is engaging, informative, and encourages user interaction. Format the blog with proper headings, short paragraphs, and bullet points where appropriate to enhance readability.
`;


    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "user", content: blogPrompt }
        ],
        max_tokens: 1200,
        temperature: 0.7,
      }),
    });

    const completion = await openaiResponse.json();

    const generatedBlog = completion.choices[0]?.message?.content || "Failed to generate blog content.";

    return new Response(JSON.stringify({ blog: generatedBlog }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Unknown error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
