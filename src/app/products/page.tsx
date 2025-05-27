"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Card as TremorCard, Title, Text } from "@tremor/react";
import { Search, ArrowUpDown } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  store: string;
  price: number;
  metrics: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    store: 'Electronics Store',
    price: 99.99,
    metrics: {
      views: 1200,
      clicks: 350,
      conversions: 45,
      revenue: 4499.55
    }
  },
  {
    id: '2',
    name: 'Smart Watch',
    store: 'Electronics Store',
    price: 199.99,
    metrics: {
      views: 800,
      clicks: 200,
      conversions: 30,
      revenue: 5999.70
    }
  },
  // Add more mock products as needed
];

const chartdata = [
  {
    name: "Wireless Headphones",
    "Click Rate": 29.2,
    "Conversion Rate": 3.75
  },
  {
    name: "Smart Watch",
    "Click Rate": 25.0,
    "Conversion Rate": 3.75
  },
  // Add more products for the chart
];

export default function ProductsPage() {
  const [products] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product | keyof Product['metrics'];
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: keyof Product | keyof Product['metrics']) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue = (sortConfig.key in a.metrics) 
      ? a.metrics[sortConfig.key as keyof Product['metrics']]
      : a[sortConfig.key as keyof Product];
    let bValue = (sortConfig.key in b.metrics)
      ? b.metrics[sortConfig.key as keyof Product['metrics']]
      : b[sortConfig.key as keyof Product];

    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredProducts = sortedProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.store.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Performance Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
          <CardDescription>
            Click-through and conversion rates by product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TremorCard>
            <Title>Performance Metrics</Title>
            <Text>Click-through and conversion rates for top products</Text>
            <BarChart
              className="h-72 mt-4"
              data={chartdata}
              index="name"
              categories={["Click Rate", "Conversion Rate"]}
              colors={["blue", "teal"]}
              valueFormatter={(number) => `${number}%`}
            />
          </TremorCard>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>
            Detailed performance metrics for all products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center">
                      Product Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('store')}>
                    <div className="flex items-center">
                      Store
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('price')}>
                    <div className="flex items-center">
                      Price
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('views')}>
                    <div className="flex items-center">
                      Views
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('clicks')}>
                    <div className="flex items-center">
                      Clicks
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('conversions')}>
                    <div className="flex items-center">
                      Conversions
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort('revenue')}>
                    <div className="flex items-center">
                      Revenue
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="bg-white border-b">
                    <td className="px-6 py-4 font-medium">{product.name}</td>
                    <td className="px-6 py-4">{product.store}</td>
                    <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">{product.metrics.views.toLocaleString()}</td>
                    <td className="px-6 py-4">{product.metrics.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4">{product.metrics.conversions.toLocaleString()}</td>
                    <td className="px-6 py-4">${product.metrics.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 