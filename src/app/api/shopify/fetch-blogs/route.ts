import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');
    const userId = searchParams.get('userId');

    if (!shop || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: shop, userId' },
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

    // Fetch blogs from Shopify
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
    const blogs = blogsData.blogs || [];

    // Fetch articles for each blog
    const allArticles = [];
    
    for (const blog of blogs) {
      try {
        const articlesResponse = await fetch(
          `https://${shop}/admin/api/2023-10/blogs/${blog.id}/articles.json?limit=50`,
          {
            method: 'GET',
            headers: {
              'X-Shopify-Access-Token': storeCredentials.accessToken,
              'Content-Type': 'application/json',
            },
          }
        );

        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          const articles = articlesData.articles || [];
          
          // Add blog info to each article
          const articlesWithBlogInfo = articles.map((article: any) => ({
            ...article,
            blog_id: blog.id,
            blog_title: blog.title,
            blog_handle: blog.handle,
          }));
          
          allArticles.push(...articlesWithBlogInfo);
        }
      } catch (error) {
        console.error(`Error fetching articles for blog ${blog.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      blogs,
      articles: allArticles,
      total_blogs: blogs.length,
      total_articles: allArticles.length,
    });

  } catch (error) {
    console.error('Shopify fetch blogs error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch blogs from Shopify',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 