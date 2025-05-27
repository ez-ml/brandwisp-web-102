"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Calendar, Target, Settings, Play, Pause } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  type: 'discount' | 'promotion' | 'bundle';
  startDate: Date;
  endDate: Date;
  target: {
    stores: string[];
    products: string[];
  };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Sale 2024',
    status: 'active',
    type: 'discount',
    startDate: new Date(2024, 5, 1),
    endDate: new Date(2024, 7, 31),
    target: {
      stores: ['shopify-store-1'],
      products: ['product-1', 'product-2']
    },
    metrics: {
      impressions: 1200,
      clicks: 350,
      conversions: 45
    }
  },
  {
    id: '2',
    name: 'Bundle Deal',
    status: 'draft',
    type: 'bundle',
    startDate: new Date(2024, 6, 1),
    endDate: new Date(2024, 6, 30),
    target: {
      stores: ['shopify-store-1'],
      products: ['product-3', 'product-4']
    },
    metrics: {
      impressions: 0,
      clicks: 0,
      conversions: 0
    }
  }
];

export default function CampaignsPage() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const [activeTab, setActiveTab] = useState('all');

  const CampaignCard = ({ campaign }: { campaign: Campaign }) => (
    <Card key={campaign.id}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{campaign.name}</CardTitle>
          <CardDescription>
            {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)} Campaign
          </CardDescription>
        </div>
        <Button variant={campaign.status === 'active' ? 'destructive' : 'default'}>
          {campaign.status === 'active' ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Activate
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>Status</Label>
            <p className="font-medium capitalize">{campaign.status}</p>
          </div>
          <div>
            <Label>Duration</Label>
            <p className="font-medium">
              {campaign.startDate.toLocaleDateString()} - {campaign.endDate.toLocaleDateString()}
            </p>
          </div>
          <div>
            <Label>Products</Label>
            <p className="font-medium">{campaign.target.products.length} products</p>
          </div>
          <div>
            <Label>Performance</Label>
            <p className="font-medium">
              {campaign.metrics.conversions} conversions ({((campaign.metrics.conversions / campaign.metrics.clicks) * 100 || 0).toFixed(1)}% CVR)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {campaigns.filter(c => c.status === 'active').map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          {campaigns.filter(c => c.status === 'draft').map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </TabsContent>
      </Tabs>

      {/* Campaign Creation Form - This would typically be in a modal or separate route */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
          <CardDescription>
            Set up a new marketing campaign for your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input id="name" placeholder="Enter campaign name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Campaign Type</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="discount">Discount</option>
                  <option value="promotion">Promotion</option>
                  <option value="bundle">Bundle</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Products</Label>
              <div className="border rounded-md p-4">
                <Button variant="outline" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Products
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline">Save as Draft</Button>
              <Button>Create Campaign</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 