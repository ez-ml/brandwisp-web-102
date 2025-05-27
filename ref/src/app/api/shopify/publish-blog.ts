import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}
const db = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { shop, title, body_html } = req.body;

  if (!shop || !title || !body_html) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 🔐 Retrieve access token from Firestore (assuming it's stored in: users/{uid}/shopifyStores/{shop})
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const storeDoc = await db.doc(`users/${userId}/shopifyStores/${shop}`).get();
    const storeData = storeDoc.data();

    if (!storeData || !storeData.accessToken) {
      return res.status(403).json({ error: 'Shopify store not linked or token missing' });
    }

    const accessToken = storeData.accessToken;

    // 📘 Get blog ID (default: first blog)
    const blogsRes = await fetch(`https://${shop}/admin/api/2024-01/blogs.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    const blogsData = await blogsRes.json();
    const blogId = blogsData.blogs?.[0]?.id;

    if (!blogId) return res.status(400).json({ error: 'No blog found in Shopify store' });

    // 🚀 Publish blog article
    const publishRes = await fetch(`https://${shop}/admin/api/2024-01/blogs/${blogId}/articles.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        article: {
          title,
          body_html,
        },
      }),
    });

    const publishData = await publishRes.json();

    if (!publishRes.ok) {
      console.error('❌ Shopify error:', publishData);
      return res.status(500).json({ error: 'Failed to publish blog' });
    }

    return res.status(200).json({ success: true, article: publishData.article });
  } catch (err: any) {
    console.error('Server Error:', err);
    return res.status(500).json({ error: 'Server Error', details: err.message });
  }
}
