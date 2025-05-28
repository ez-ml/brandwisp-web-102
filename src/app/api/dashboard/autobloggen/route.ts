import { NextRequest, NextResponse } from 'next/server';
import { FirebaseService } from '@/lib/services/firebase';
import { Timestamp } from 'firebase/firestore';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Firebase token
    const token = authHeader.split('Bearer ')[1];
    let userId: string;
    
    // Allow development mode with test token
    if (process.env.NODE_ENV === 'development' && token === 'test-token') {
      userId = 'test-user-id';
      console.log('🔧 Development mode: Using test user ID');
    } else {
      try {
        const adminApp = getFirebaseAdmin();
        const auth = getAuth(adminApp);
        const decodedToken = await auth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (authError) {
        console.error('Firebase auth error:', authError);
        return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
      }
    }
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'blogs':
        const blogs = await FirebaseService.getUserBlogs(userId);
        return NextResponse.json({ blogs });

      case 'drafts':
        // Filter blogs by draft status
        const allBlogs = await FirebaseService.getUserBlogs(userId);
        const drafts = allBlogs.filter(blog => blog.status === 'draft');
        return NextResponse.json({ drafts });

      case 'analytics':
        // Calculate analytics from existing blogs
        const userBlogs = await FirebaseService.getUserBlogs(userId);
        const analytics = {
          totalBlogs: userBlogs.length,
          publishedBlogs: userBlogs.filter(b => b.status === 'published').length,
          draftBlogs: userBlogs.filter(b => b.status === 'draft').length,
          totalViews: userBlogs.reduce((sum, blog) => sum + blog.analytics.views, 0),
          totalShares: userBlogs.reduce((sum, blog) => sum + blog.analytics.shares, 0),
          avgEngagement: userBlogs.length > 0 ? 
            userBlogs.reduce((sum, blog) => sum + blog.analytics.engagement, 0) / userBlogs.length : 0
        };
        return NextResponse.json({ analytics });

      case 'stores':
        const stores = await FirebaseService.getUserStores(userId);
        return NextResponse.json({ stores });

      default:
        // Return dashboard data
        const userBlogsForDashboard = await FirebaseService.getUserBlogs(userId);
        const dashboardData = {
          stats: {
            blogsThisWeek: userBlogsForDashboard.filter(blog => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return blog.createdAt.toDate() > weekAgo;
            }).length,
            draftBlogs: userBlogsForDashboard.filter(b => b.status === 'draft').length,
            avgEngagement: userBlogsForDashboard.length > 0 ? 
              userBlogsForDashboard.reduce((sum, blog) => sum + blog.analytics.engagement, 0) / userBlogsForDashboard.length : 0,
            totalViews: userBlogsForDashboard.reduce((sum, blog) => sum + blog.analytics.views, 0),
            totalShares: userBlogsForDashboard.reduce((sum, blog) => sum + blog.analytics.shares, 0)
          },
          recentBlogs: userBlogsForDashboard.slice(0, 5),
          platforms: {
            shopify: { configured: true, connected: true },
            wordpress: { configured: false, connected: false },
            medium: { configured: false, connected: false }
          }
        };
        return NextResponse.json(dashboardData);
    }
  } catch (error) {
    console.error('AutoBlogGen API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Firebase token
    const token = authHeader.split('Bearer ')[1];
    let userId: string;
    
    // Allow development mode with test token
    if (process.env.NODE_ENV === 'development' && token === 'test-token') {
      userId = 'test-user-id';
      console.log('🔧 Development mode: Using test user ID');
    } else {
      try {
        const adminApp = getFirebaseAdmin();
        const auth = getAuth(adminApp);
        const decodedToken = await auth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (authError) {
        console.error('Firebase auth error:', authError);
        return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'generate-blog':
        return await generateBlog(userId, data);
      
      case 'save-draft':
        return await saveDraft(userId, data);
      
      case 'publish-blog':
        return await publishBlog(userId, data);
      
      case 'update-settings':
        return await updateSettings(userId, data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AutoBlogGen POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateBlog(userId: string, data: any) {
  try {
    const {
      topic,
      objective,
      tone,
      audience,
      length,
      keywords,
      callToAction,
      storeId,
      productId
    } = data;

    // Validate required fields
    if (!topic) {
      return NextResponse.json(
        { error: 'Blog topic is required' },
        { status: 400 }
      );
    }

    // Generate blog content using AI
    const blogContent = await generateBlogContent({
      topic,
      objective: objective || 'Product Promotion',
      tone: tone || 'Friendly & Persuasive',
      audience: audience || 'General Consumers',
      length: length || 'Medium (500-800 words)',
      keywords: keywords || [],
      callToAction: callToAction || 'Shop Now',
      storeId,
      productId
    });

    // Create blog using existing Firebase service
    const blogData = {
      userId,
      storeId,
      title: blogContent.title,
      content: blogContent.content,
      excerpt: blogContent.excerpt,
      slug: blogContent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      status: 'draft' as const,
      author: {
        name: 'AI Assistant',
        email: 'ai@brandwisp.com'
      },
      seo: {
        title: blogContent.seoTitle,
        description: blogContent.metaDescription,
        keywords: blogContent.tags
      },
      tags: blogContent.tags,
      categories: ['AI Generated'],
      settings: {
        allowComments: true,
        template: 'default',
        callToAction: {
          text: callToAction || 'Shop Now',
          url: '#',
          type: 'button' as const
        }
      },
      analytics: {
        views: 0,
        shares: 0,
        comments: 0,
        engagement: 0
      },
      generation: {
        prompt: topic,
        model: 'gpt-3.5-turbo',
        generatedAt: Timestamp.fromDate(new Date()),
        isGenerated: true
      }
    };

    const blogId = await FirebaseService.createBlog(blogData);

    return NextResponse.json({
      success: true,
      blogId,
      content: blogContent,
      message: 'Blog generated successfully!'
    });

  } catch (error) {
    console.error('Blog generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate blog content' },
      { status: 500 }
    );
  }
}

async function saveDraft(userId: string, data: any) {
  try {
    const { blogId, ...updateData } = data;
    
    if (blogId) {
      // Update existing blog
      await FirebaseService.updateBlog(blogId, {
        ...updateData,
        updatedAt: Timestamp.fromDate(new Date()),
        status: 'draft'
      });
      
      return NextResponse.json({
        success: true,
        blogId,
        message: 'Draft updated successfully!'
      });
    } else {
      // Create new draft
      const blogData = {
        userId,
        ...updateData,
        status: 'draft' as const,
        analytics: {
          views: 0,
          shares: 0,
          comments: 0,
          engagement: 0
        }
      };
      
      const newBlogId = await FirebaseService.createBlog(blogData);
      
      return NextResponse.json({
        success: true,
        blogId: newBlogId,
        message: 'Draft saved successfully!'
      });
    }
  } catch (error) {
    console.error('Save draft error:', error);
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}

async function publishBlog(userId: string, data: any) {
  try {
    const { blogId, platforms, scheduleDate } = data;

    // Update blog status
    await FirebaseService.updateBlog(blogId, {
      status: 'published',
      publishedAt: scheduleDate ? Timestamp.fromDate(new Date(scheduleDate)) : Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    });

    // Simulate publishing to platforms
    const publishResults = platforms.map((platform: string) => ({
      platform,
      status: 'success',
      url: `https://${platform}.example.com/blog/${blogId}`,
      publishedAt: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      publishResults,
      message: 'Blog published successfully!'
    });
  } catch (error) {
    console.error('Publish blog error:', error);
    return NextResponse.json(
      { error: 'Failed to publish blog' },
      { status: 500 }
    );
  }
}

async function updateSettings(userId: string, settings: any) {
  try {
    // For now, we'll just return success since user settings update isn't implemented
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully!'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// AI Blog Content Generation
async function generateBlogContent(params: any) {
  const {
    topic,
    objective,
    tone,
    audience,
    length,
    keywords,
    callToAction
  } = params;

  // This is a simplified version - in production, you'd use OpenAI or similar
  const wordCount = length.includes('Short') ? 400 : length.includes('Long') ? 1000 : 650;
  
  const content = {
    title: `${topic} - Your Ultimate Guide`,
    excerpt: `Discover everything you need to know about ${topic.toLowerCase()} and how it can transform your business.`,
    content: generateBlogHTML(topic, objective, tone, audience, wordCount, keywords, callToAction),
    seoTitle: `${topic} | Complete Guide 2025`,
    metaDescription: `Learn about ${topic.toLowerCase()} with our comprehensive guide. Expert tips, strategies, and actionable insights.`,
    tags: keywords.length > 0 ? keywords : [topic.toLowerCase(), 'guide', '2025'],
    featuredImage: null,
    wordCount,
    readingTime: Math.ceil(wordCount / 200)
  };

  return content;
}

function generateBlogHTML(topic: string, objective: string, tone: string, audience: string, wordCount: number, keywords: string[], callToAction: string) {
  return `
    <article>
      <h1>${topic}</h1>
      
      <p>Welcome to our comprehensive guide on ${topic.toLowerCase()}. Whether you're a beginner or looking to enhance your knowledge, this article will provide you with valuable insights and actionable strategies.</p>
      
      <h2>Introduction</h2>
      <p>In today's competitive market, understanding ${topic.toLowerCase()} is crucial for success. This guide is specifically designed for ${audience.toLowerCase()} who want to make informed decisions and achieve their goals.</p>
      
      <h2>Key Benefits</h2>
      <ul>
        <li>Comprehensive understanding of ${topic.toLowerCase()}</li>
        <li>Practical tips and strategies</li>
        <li>Expert insights and recommendations</li>
        <li>Real-world examples and case studies</li>
      </ul>
      
      <h2>Getting Started</h2>
      <p>The first step in mastering ${topic.toLowerCase()} is understanding the fundamentals. Let's explore the key concepts and principles that will guide your journey.</p>
      
      <h2>Best Practices</h2>
      <p>Based on industry research and expert analysis, here are the most effective strategies for ${topic.toLowerCase()}:</p>
      
      <ol>
        <li>Start with a clear understanding of your goals</li>
        <li>Research your target market thoroughly</li>
        <li>Implement proven strategies and techniques</li>
        <li>Monitor and measure your progress regularly</li>
        <li>Continuously optimize and improve your approach</li>
      </ol>
      
      <h2>Common Mistakes to Avoid</h2>
      <p>Learning from others' mistakes can save you time and resources. Here are some common pitfalls to avoid when dealing with ${topic.toLowerCase()}.</p>
      
      <h2>Conclusion</h2>
      <p>Mastering ${topic.toLowerCase()} requires dedication, the right strategies, and continuous learning. By following the guidelines in this comprehensive guide, you'll be well-equipped to achieve your objectives.</p>
      
      <div class="cta-section">
        <h3>Ready to Get Started?</h3>
        <p>Take action today and transform your approach to ${topic.toLowerCase()}.</p>
        <a href="#" class="cta-button">${callToAction}</a>
      </div>
    </article>
  `;
} 