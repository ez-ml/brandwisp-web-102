import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { dbClient } from '@/lib/dbClient';

// 🔐 Initialize Firebase Admin
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64!, 'base64').toString('utf-8')
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const result = await dbClient.query(
      'SELECT * FROM user_subscriptions WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ subscription: null });
    }

    return NextResponse.json({ subscription: result.rows[0] });

  } catch (err: any) {
    console.error('Error fetching subscription:', err);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}
