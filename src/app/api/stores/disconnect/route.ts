import { NextRequest, NextResponse } from 'next/server';
import { StoreModel } from '@/lib/models/store';

export async function POST(request: NextRequest) {
  try {
    const { storeId } = await request.json();

    if (!storeId) {
      return NextResponse.json(
        { error: 'Missing store ID' },
        { status: 400 }
      );
    }

    // Get the store to verify it exists
    const store = await StoreModel.getById(storeId);
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Disconnect the store
    await StoreModel.disconnect(storeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Store disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect store' },
      { status: 500 }
    );
  }
} 