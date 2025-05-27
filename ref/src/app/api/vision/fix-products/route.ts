// /app/api/vision/fix-product/route.ts
import { NextRequest } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery();

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return new Response(JSON.stringify({ error: 'Missing productId' }), { status: 400 });
    }

    const updateQuery = `
      UPDATE \`brandwisp-dev.shopify_export.products_analysis_results\`
      SET fix_status = 'fixed',
          analysis_timestamp = CURRENT_TIMESTAMP()
      WHERE product_id = @productId
    `;

    const options = {
      query: updateQuery,
      params: { productId },
    };

    await bigquery.query(options);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('❌ Fix update failed:', err);
    return new Response(JSON.stringify({ error: 'Fix failed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
