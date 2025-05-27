import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import { generateId } from '@/lib/utils';
import { ProductIdeaService } from '@/lib/bigquery/productIdeas';

const bigquery = new BigQuery({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const TABLE_NAME = 'brandwisp-dev.brandwisp_db.product_ideas';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const id = generateId();
    const now = new Date();

    const idea = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await bigquery
      .dataset('brandwisp_db')
      .table('product_ideas')
      .insert([idea]);

    return NextResponse.json(idea);
  } catch (error) {
    console.error('Error creating product idea:', error);
    return NextResponse.json(
      { error: 'Failed to create product idea' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const query = `
      SELECT *
      FROM \`${TABLE_NAME}\`
      WHERE userId = @userId
      AND status != 'archived'
      ORDER BY createdAt DESC
    `;

    const options = {
      query,
      params: { userId },
    };

    const [rows] = await bigquery.query(options);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching product ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product ideas' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Idea ID is required' },
        { status: 400 }
      );
    }

    const query = `
      UPDATE \`${TABLE_NAME}\`
      SET status = 'archived', updatedAt = CURRENT_TIMESTAMP()
      WHERE id = @id
    `;

    const options = {
      query,
      params: { id },
    };

    await bigquery.query(options);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product idea:', error);
    return NextResponse.json(
      { error: 'Failed to delete product idea' },
      { status: 500 }
    );
  }
} 