// app/api/bigquery/products/route.ts
import { BigQuery } from '@google-cloud/bigquery';

export async function GET() {
  const bigquery = new BigQuery(); // Auth will be added below

  const query = `
    SELECT
      product_id,
      title,
      image_url,
      alt_text,
      caption,
      description
    FROM \`brandwisp-dev.shopify_export.products_flat_view\`
    LIMIT 100
  `;

  try {
    const [rows] = await bigquery.query({ query });
    return new Response(JSON.stringify({ products: rows }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('BigQuery query error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
