import { BigQuery } from '@google-cloud/bigquery';

export async function GET() {
  const bigquery = new BigQuery();

  const query = `
    SELECT
      f.product_id,
      f.title,
      f.image_url,
      f.alt_text,
      f.caption,
      f.description,
      a.alt_text_suggested,
      a.caption_suggested,
      a.description_suggested,
      a.fix_status
    FROM \`brandwisp-dev.shopify_export.products_flat_view\` f
    LEFT JOIN \`brandwisp-dev.shopify_export.products_analysis_results\` a
    ON f.product_id = a.product_id
    LIMIT 100
  `;

  try {
    const [rows] = await bigquery.query({ query });
    return new Response(JSON.stringify({ products: rows }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error("Vision API error:", error);
    return new Response(JSON.stringify({ error: 'BigQuery failed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
