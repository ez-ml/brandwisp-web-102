import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { shop, title, body_html } = await req.json();

    if (!shop || !title || !body_html) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    async function getAccessTokenForShop(shop: string): Promise<string> {
      // Replace with your real logic later
      return 'mock-shopify-access-token';
    }
    
    // Get Shopify token from your DB (mocked here)
    const accessToken = await getAccessTokenForShop(shop); // You must implement this

    const blogsRes = await fetch(`https://${shop}/admin/api/2024-01/blogs.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });
    const blogsData = await blogsRes.json();
    const blogId = blogsData.blogs?.[0]?.id;
    if (!blogId) return NextResponse.json({ error: 'No blog found' }, { status: 400 });

    const response = await fetch(`https://${shop}/admin/api/2024-01/blogs/${blogId}/articles.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ article: { title, body_html } }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: 'Shopify error', detail: data }, { status: 500 });
    }

    return NextResponse.json({ success: true, article: data.article });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Unexpected error', detail: err.message }, { status: 500 });
  }
}
