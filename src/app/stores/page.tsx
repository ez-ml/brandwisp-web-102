import { StoreConnectionCard } from '@/components/stores/StoreConnection';
import { StoreModel } from '@/lib/models/store';

export default async function StoresPage() {
  const shopifyStores = await StoreModel.getByProvider('shopify');
  const shopifyStore = shopifyStores[0]; // For now, we'll just handle one store per provider

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Store Connections</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StoreConnectionCard
          provider="shopify"
          store={shopifyStore}
        />
        
        {/* Add more store providers here */}
        <StoreConnectionCard
          provider="amazon"
        />
        
        <StoreConnectionCard
          provider="etsy"
        />
      </div>
    </div>
  );
} 