// app/api/bigquery/traffictrace/route.ts
import { BigQuery } from '@google-cloud/bigquery';

export async function GET() {
  const bigquery = new BigQuery();

  const trafficSourceQuery = `
    SELECT
      CASE
        WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
        WHEN referrer LIKE '%google%' THEN 'Organic Search'
        WHEN referrer LIKE '%facebook%' THEN 'Social'
        WHEN referrer LIKE '%instagram%' THEN 'Social'
        WHEN referrer LIKE '%bing%' THEN 'Organic Search'
        WHEN referrer LIKE '%t.co%' OR referrer LIKE '%twitter%' THEN 'Social'
        WHEN referrer LIKE '%adwords%' OR referrer LIKE '%utm_medium=paid%' THEN 'Paid Search'
        ELSE 'Referral'
      END AS name,
      COUNT(*) AS value
    FROM \`brandwisp-dev.shopify_export.flattened_tracking_events\`
    WHERE event = 'page_viewed'
    GROUP BY name
    ORDER BY value DESC
    LIMIT 10
  `;

  const topPagesQuery = `
    SELECT
      url AS page,
      COUNT(*) AS views
    FROM \`brandwisp-dev.shopify_export.flattened_tracking_events\`
    WHERE event = 'page_viewed'
    GROUP BY page
    ORDER BY views DESC
    LIMIT 10
  `;

  try {
    const [trafficSources] = await bigquery.query({ query: trafficSourceQuery });
    const [topPages] = await bigquery.query({ query: topPagesQuery });

    return new Response(JSON.stringify({ trafficSources, topPages, utmBreakdown: [] }), {
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
