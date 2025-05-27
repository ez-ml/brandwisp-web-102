import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { dbClient } from '@/lib/dbClient';

// Decode Firebase Admin key
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64!, 'base64').toString('utf-8')
);

// Initialize Firebase
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const cancelQuery = `
      UPDATE user_subscriptions 
      SET status = 'cancelled'
      WHERE user_id = $1
    `;

    await dbClient.query(cancelQuery, [userId]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Cancel Subscription Error:', err);
    return NextResponse.json({ error: 'Cancel failed', detail: err.message }, { status: 500 });
  }
}
