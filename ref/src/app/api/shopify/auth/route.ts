export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");
    if (!shop) return new Response("Missing shop param", { status: 400 });

    const scopes = [
      "read_products",
      "write_products",
      "read_content",
      "write_content"
    ];
  
    const redirectUri = encodeURIComponent("https://c502-2601-646-8002-5010-fdc2-9f41-4d27-3974.ngrok-free.app/api/shopify/callback");
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes.join(",")}&redirect_uri=${redirectUri}&state=123456`;
  
    return Response.redirect(installUrl);
  }