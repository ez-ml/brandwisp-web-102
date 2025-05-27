import { NextRequest, NextResponse } from 'next/server';
import { getAccessTokenForShop } from '@/lib/shopify/utils'; // adjust path accordingly

export async function POST(req: NextRequest) {
  try {
    const { shop, title, body_html, userId } = await req.json();

    console.log("📥 Incoming data:", { shop, title });

    if (!shop || !title || !body_html || !userId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const accessToken = await getAccessTokenForShop(shop, userId);
    if (!accessToken) {
      return NextResponse.json({ error: 'No token found for shop' }, { status: 401 });
    }

    const blogsRes = await fetch(`https://${shop}/admin/api/2024-01/blogs.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    const blogsData = await blogsRes.json();
    console.log("📰 Blogs response:", blogsData);
    const blogId = blogsData.blogs?.[0]?.id;
    if (!blogId) return NextResponse.json({ error: 'No blogs found for this shop' }, { status: 404 });

    const postRes = await fetch(`https://${shop}/admin/api/2024-01/blogs/${blogId}/articles.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ article: { title, body_html } }),
    });

    const postData = await postRes.json();
    if (!postRes.ok) {
      return NextResponse.json({ error: 'Publish failed', detail: postData }, { status: 500 });
    }

    return NextResponse.json({ success: true, article: postData.article });
  } catch (err: any) {
    console.error("❌ Unexpected error:", err);
    return NextResponse.json({ error: 'Unexpected error', detail: err.message }, { status: 500 });
  }
}
