import { NextRequest, NextResponse } from 'next/server';
import WordPressService from '@/lib/services/wordpress';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, excerpt, tags, categories, credentials } = body;

    if (!credentials?.url || !credentials?.username || !credentials?.password) {
      return NextResponse.json(
        { error: 'WordPress credentials are required' },
        { status: 400 }
      );
    }

    const wpService = new WordPressService({
      url: credentials.url,
      username: credentials.username,
      password: credentials.password,
    });

    // Test connection first
    const connectionTest = await wpService.testConnection();
    if (!connectionTest.success) {
      return NextResponse.json(
        { error: `WordPress connection failed: ${connectionTest.message}` },
        { status: 401 }
      );
    }

    // Create categories if they don't exist
    let categoryIds: number[] = [];
    if (categories && categories.length > 0) {
      try {
        const existingCategories = await wpService.getCategories();
        const existingCategoryNames = existingCategories.map(cat => cat.name.toLowerCase());
        
        for (const categoryName of categories) {
          const lowerCaseName = categoryName.toLowerCase();
          const existingCategory = existingCategories.find(
            cat => cat.name.toLowerCase() === lowerCaseName
          );
          
          if (existingCategory) {
            categoryIds.push(existingCategory.id);
          } else {
            // Create new category
            const newCategory = await wpService.createCategory(categoryName);
            categoryIds.push(newCategory.id);
          }
        }
      } catch (error) {
        console.error('Error handling categories:', error);
        // Continue without categories if there's an error
      }
    }

    // Create tags if they don't exist
    let tagIds: number[] = [];
    if (tags && tags.length > 0) {
      try {
        const existingTags = await wpService.getTags();
        const existingTagNames = existingTags.map(tag => tag.name.toLowerCase());
        
        for (const tagName of tags) {
          const lowerCaseName = tagName.toLowerCase();
          const existingTag = existingTags.find(
            tag => tag.name.toLowerCase() === lowerCaseName
          );
          
          if (existingTag) {
            tagIds.push(existingTag.id);
          } else {
            // Create new tag
            const newTag = await wpService.createTag(tagName);
            tagIds.push(newTag.id);
          }
        }
      } catch (error) {
        console.error('Error handling tags:', error);
        // Continue without tags if there's an error
      }
    }

    // Create the post
    const postData = {
      title,
      content,
      excerpt,
      status: 'publish' as const,
      categories: categoryIds.length > 0 ? categoryIds : undefined,
      tags: tagIds.length > 0 ? tagIds : undefined,
    };

    const result = await wpService.createPost(postData);

    return NextResponse.json({
      success: true,
      post: {
        id: result.id,
        title: result.title.rendered,
        link: result.link,
        status: result.status,
        date: result.date,
      },
      message: 'Blog post published successfully to WordPress',
    });

  } catch (error) {
    console.error('WordPress publishing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to publish to WordPress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const username = searchParams.get('username');
  const password = searchParams.get('password');

  if (!url || !username || !password) {
    return NextResponse.json(
      { error: 'Missing WordPress credentials' },
      { status: 400 }
    );
  }

  try {
    const wpService = new WordPressService({ url, username, password });
    const connectionTest = await wpService.testConnection();

    return NextResponse.json({
      success: connectionTest.success,
      message: connectionTest.message,
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      },
      { status: 500 }
    );
  }
} 