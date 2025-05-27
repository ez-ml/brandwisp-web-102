import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Step 1: Decode Firebase credentials
const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64!;
if (!base64) throw new Error('🔥 FIREBASE_SERVICE_ACCOUNT_B64 is not set');

const serviceAccount = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get('shop');
  const userId = searchParams.get('userId'); // ✅ You must pass userId in query param

  if (!shop || !userId) {
    return NextResponse.json({ error: 'Missing `shop` or `userId`' }, { status: 400 });
  }

  try {
    // ✅ Adjusted path to match your Firestore structure
    const tokenDocRef = db.doc(`users/${userId}/shopifyStores/${shop}`);
    const tokenSnap = await tokenDocRef.get();

    const accessToken = tokenSnap.exists ? tokenSnap.data()?.accessToken : null;

    if (!accessToken) {
      console.error("❌ Access token not found in Firestore for", shop);
      return NextResponse.json({ error: 'Access token not found' }, { status: 403 });
    }

    // ✅ Step 5: Fetch Blogs
    const blogsRes = await fetch(`https://${shop}/admin/api/2024-01/blogs.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    const blogsData = await blogsRes.json();
    if (!blogsRes.ok || !blogsData.blogs?.length) {
      return NextResponse.json({ error: 'No blogs found', detail: blogsData }, { status: 404 });
    }

    const blogId = blogsData.blogs[0].id;

    // ✅ Step 6: Fetch Articles
    const articlesRes = await fetch(`https://${shop}/admin/api/2024-01/blogs/${blogId}/articles.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    const articlesData = await articlesRes.json();
    if (!articlesRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch articles', detail: articlesData }, { status: 500 });
    }

    return NextResponse.json({ articles: articlesData.articles || [] });

  } catch (err: any) {
    console.error("🔥 Unexpected error:", err);
    return NextResponse.json({ error: 'Unexpected server error', detail: err.message }, { status: 500 });
  }
}
