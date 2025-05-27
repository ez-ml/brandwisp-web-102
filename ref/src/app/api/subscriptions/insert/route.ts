import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { dbClient } from '@/lib/dbClient';

// 🔐 Decode base64 Firebase Admin SDK credentials
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64!, 'base64').toString('utf8')
);

// 🏁 Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

export async function POST(req: NextRequest) {
    try {
      const token = req.headers.get('authorization')?.split('Bearer ')[1];
      if (!token) {
        return NextResponse.json({ error: 'Missing Firebase token' }, { status: 401 });
      }
  
      const decoded = await getAuth().verifyIdToken(token);
      const userId = decoded.uid;
  
      // 🛡️ Safe parse
      let body;
      try {
        body = await req.json();
      } catch (err) {
        return NextResponse.json({ error: 'Invalid or empty JSON body' }, { status: 400 });
      }
  
      const { plan_id, provider_customer_id, provider_subscription_id } = body;
      if (!plan_id || !provider_customer_id || !provider_subscription_id) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
  
      // 1️⃣ Ensure user exists
      await dbClient.query(
        `INSERT INTO users (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );
  
      // 2️⃣ Insert or update subscription
      await dbClient.query(
        `
        INSERT INTO user_subscriptions 
          (user_id, plan_id, payment_provider, provider_customer_id, provider_subscription_id, start_date, status)
        VALUES 
          ($1, $2, 'stripe', $3, $4, NOW(), 'active')
        ON CONFLICT (user_id) DO UPDATE SET
          plan_id = $2,
          provider_customer_id = $3,
          provider_subscription_id = $4,
          status = 'active'
        `,
        [userId, plan_id, provider_customer_id, provider_subscription_id]
      );
  
      return NextResponse.json({ success: true });
  
    } catch (err: any) {
      console.error('❌ Subscription Insert Error:', err);
      return NextResponse.json({ error: 'Failed', detail: err.message }, { status: 500 });
    }
  }
  