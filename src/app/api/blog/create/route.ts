import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_name,
      product_description,
      product_features,
      keywords,
      blog_objective,
      tone,
      cta,
      length,
      target_audience,
      store_name,
      product_price,
      product_vendor,
    } = body;

    if (!product_name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    // Determine word count based on length
    const wordCounts: Record<string, string> = {
      'Short (300-500 words)': '300-500',
      'Medium (500-800 words)': '500-800',
      'Long-form (800+ words)': '800-1200',
      'Short': '300-500',
      'Medium': '500-800',
      'Long': '800-1200',
    };
    const wordCount = wordCounts[length] || '500-800';

    // Create a comprehensive prompt for blog generation
    const prompt = `Write a ${blog_objective.toLowerCase()} blog post about the product "${product_name}" with the following details:

Product Information:
- Name: ${product_name}
- Description: ${product_description || 'A high-quality product'}
- Features: ${Array.isArray(product_features) ? product_features.join(', ') : product_features || 'Great quality, excellent design'}
- Price: ${product_price ? `$${product_price}` : 'Competitive pricing'}
- Vendor: ${product_vendor || store_name || 'Quality Brand'}
- Store: ${store_name || 'Our Store'}

Blog Requirements:
- Objective: ${blog_objective}
- Tone: ${tone}
- Target Audience: ${target_audience}
- Word Count: ${wordCount} words
- Keywords to include: ${Array.isArray(keywords) ? keywords.join(', ') : keywords || 'quality, product, shopping'}
- Call to Action: ${cta}

Please create an engaging, SEO-optimized blog post that:
1. Has an attention-grabbing headline
2. Includes an engaging introduction
3. Highlights the product's key benefits and features
4. Addresses the target audience's needs and pain points
5. Uses the specified tone throughout
6. Naturally incorporates the provided keywords
7. Includes subheadings for better readability
8. Ends with a compelling call-to-action: "${cta}"
9. Is formatted in Markdown

The blog should be informative, persuasive, and valuable to readers while promoting the product effectively.`;

    // Generate blog content using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content writer and marketing specialist who creates engaging, SEO-optimized blog posts for e-commerce products. Your writing is compelling, informative, and drives conversions while providing genuine value to readers.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const blogContent = completion.choices[0]?.message?.content;

    if (!blogContent) {
      throw new Error('Failed to generate blog content');
    }

    // Extract title from the generated content (first line that starts with #)
    const lines = blogContent.split('\n');
    const titleLine = lines.find(line => line.startsWith('#'));
    const title = titleLine ? titleLine.replace(/^#+\s*/, '') : product_name;

    // Create excerpt from the first paragraph
    const contentWithoutTitle = blogContent.replace(/^#+.*\n/, '');
    const firstParagraph = contentWithoutTitle.split('\n\n')[0];
    const excerpt = firstParagraph.replace(/[#*]/g, '').slice(0, 150) + '...';

    return NextResponse.json({
      success: true,
      blog: blogContent,
      title,
      excerpt,
      metadata: {
        wordCount: blogContent.split(' ').length,
        keywords: Array.isArray(keywords) ? keywords : [keywords].filter(Boolean),
        objective: blog_objective,
        tone,
        targetAudience: target_audience,
        productName: product_name,
        storeName: store_name,
      },
    });

  } catch (error) {
    console.error('Blog generation error:', error);
    
    // Check if it's an OpenAI API error
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.',
          details: 'Blog generation requires OpenAI API access'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to generate blog content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 