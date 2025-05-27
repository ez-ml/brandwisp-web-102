export async function fetchProducts(shop: string, accessToken: string) {
    const res = await fetch(`https://${shop}/admin/api/2023-10/products.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json"
      }
    });
  
    const json = await res.json();
    return json.products || [];
  }
  

  