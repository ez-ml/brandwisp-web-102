// src/app/api/set-custom-claims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { verifyIdToken } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = await verifyIdToken(token);
    const email = decoded.email;

    // Example: Set admin role for a specific email
    if (email === 'admin@example.com') {
      await getAuth().setCustomUserClaims(decoded.uid, { role: 'admin' });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
