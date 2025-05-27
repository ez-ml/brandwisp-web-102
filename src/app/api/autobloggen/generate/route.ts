import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { topic, targetAudience, tone, keywords } = await req.json();

    const blogPrompt = `
      Write a comprehensive blog post about:
      Topic: ${topic}
      Target Audience: ${targetAudience}
      Tone: ${tone}
      Keywords to include: ${keywords.join(', ')}

      The blog post should be well-structured with:
      1. Engaging introduction
      2. Main content with subheadings
      3. Practical examples or case studies
      4. Actionable takeaways
      5. Conclusion
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert content writer who creates engaging and informative blog posts."
        },
        {
          role: "user",
          content: blogPrompt
        }
      ]
    });

    // Process the generated content
    const blogPost = {
      title: topic,
      content: completion.choices[0].message.content,
      status: 'draft',
      createdAt: new Date(),
      metadata: {
        readingTime: Math.ceil(completion.choices[0].message.content?.split(' ').length / 200), // Approx. reading time in minutes
        keywords: keywords,
        seoScore: 85, // Simulated SEO score
        targetAudience,
        tone
      }
    };

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error('Error generating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to generate blog post' },
      { status: 500 }
    );
  }
} 