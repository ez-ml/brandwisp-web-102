// app/api/pricing/plans/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// ✅ Use environment variables (set these in .env.local)
const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: Number(process.env.PG_PORT) || 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT plan_id, name, price_monthly, price_yearly, features, is_active
      FROM plans
      WHERE is_active = TRUE
      ORDER BY price_monthly ASC;
    `);
    client.release();

    return NextResponse.json({ success: true, plans: result.rows });
  } catch (err: any) {
    console.error('[PricingPlansAPI]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
