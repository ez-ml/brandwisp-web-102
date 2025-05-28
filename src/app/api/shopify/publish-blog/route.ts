import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shop, title, body_html, userId, tags, summary } = body;

    if (!shop || !title || !body_html || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: shop, title, body_html, userId' },
        { status: 400 }
      );
    }

    // Get user's store credentials from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const storeCredentials = userData.stores?.find((store: any) => 
      store.storeUrl === shop || store.storeUrl === `${shop}.myshopify.com`
    );

    if (!storeCredentials || !storeCredentials.accessToken) {
      return NextResponse.json(
        { error: 'Store credentials not found or invalid' },
        { status: 401 }
      );
    }

    // Prepare the blog post data for Shopify
    const blogPostData = {
      article: {
        title,
        body_html,
        summary: summary || title,
        tags: Array.isArray(tags) ? tags.join(', ') : tags || '',
        published: true,
        author: userData.displayName || 'AutoBlogGen',
      }
    };

    // Get the blog ID (we'll use the main blog for the store)
    const blogsResponse = await fetch(
      `https://${shop}/admin/api/2023-10/blogs.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': storeCredentials.accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!blogsResponse.ok) {
      const error = await blogsResponse.text();
      console.error('Failed to fetch blogs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch store blogs' },
        { status: 500 }
      );
    }

    const blogsData = await blogsResponse.json();
    const mainBlog = blogsData.blogs?.[0];

    if (!mainBlog) {
      return NextResponse.json(
        { error: 'No blog found in store. Please create a blog in your Shopify admin first.' },
        { status: 400 }
      );
    }

    // Create the blog article
    const articleResponse = await fetch(
      `https://${shop}/admin/api/2023-10/blogs/${mainBlog.id}/articles.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': storeCredentials.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogPostData),
      }
    );

    if (!articleResponse.ok) {
      const error = await articleResponse.text();
      console.error('Failed to create article:', error);
      return NextResponse.json(
        { error: 'Failed to publish blog article to Shopify' },
        { status: 500 }
      );
    }

    const articleData = await articleResponse.json();
    const article = articleData.article;

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        handle: article.handle,
        url: `https://${shop}/blogs/${mainBlog.handle}/${article.handle}`,
        published_at: article.published_at,
        created_at: article.created_at,
        blog_id: mainBlog.id,
        blog_title: mainBlog.title,
      },
      message: 'Blog article published successfully to Shopify',
    });

  } catch (error) {
    console.error('Shopify blog publishing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to publish blog to Shopify',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 