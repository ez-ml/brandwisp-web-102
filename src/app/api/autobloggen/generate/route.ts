import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      topic,
      targetAudience,
      tone,
      keywords,
      blog_objective,
      cta,
      length,
    } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
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

    // Create a comprehensive prompt for topic-based blog generation
    const prompt = `Write a ${blog_objective?.toLowerCase() || 'informative'} blog post about "${topic}" with the following requirements:

Blog Requirements:
- Topic: ${topic}
- Objective: ${blog_objective || 'Educational'}
- Tone: ${tone || 'Friendly & Persuasive'}
- Target Audience: ${targetAudience || 'General Consumers'}
- Word Count: ${wordCount} words
- Keywords to include: ${Array.isArray(keywords) ? keywords.join(', ') : keywords || 'trending, popular, guide'}
- Call to Action: ${cta || 'Learn More'}

Please create an engaging, SEO-optimized blog post that:
1. Has an attention-grabbing headline related to the topic
2. Includes an engaging introduction that hooks the reader
3. Provides valuable, actionable information about the topic
4. Addresses the target audience's needs and interests
5. Uses the specified tone throughout
6. Naturally incorporates the provided keywords
7. Includes subheadings for better readability and SEO
8. Provides practical tips, insights, or solutions
9. Ends with a compelling call-to-action: "${cta || 'Learn More'}"
10. Is formatted in Markdown

The blog should be informative, engaging, and valuable to readers while maintaining the specified tone and objective.`;

    // Generate blog content using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content writer and digital marketing specialist who creates engaging, SEO-optimized blog posts on various topics. Your writing is informative, engaging, and provides genuine value to readers while achieving the specified objectives.',
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
    const title = titleLine ? titleLine.replace(/^#+\s*/, '') : topic;

    // Create excerpt from the first paragraph
    const contentWithoutTitle = blogContent.replace(/^#+.*\n/, '');
    const firstParagraph = contentWithoutTitle.split('\n\n')[0];
    const excerpt = firstParagraph.replace(/[#*]/g, '').slice(0, 150) + '...';

    return NextResponse.json({
      success: true,
      content: blogContent,
      title,
      excerpt,
      metadata: {
        wordCount: blogContent.split(' ').length,
        keywords: Array.isArray(keywords) ? keywords : [keywords].filter(Boolean),
        objective: blog_objective || 'Educational',
        tone: tone || 'Friendly & Persuasive',
        targetAudience: targetAudience || 'General Consumers',
        topic,
      },
    });

  } catch (error) {
    console.error('Topic blog generation error:', error);
    
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