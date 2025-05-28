'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Store, Plus, ExternalLink, Settings, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Store {
  id: string;
  name: string;
  platform: string;
  url: string;
  status: 'connected' | 'pending' | 'error';
  lastSync: string;
}

export default function StoreRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([
    {
      id: '1',
      name: 'BrandWisp Demo Store',
      platform: 'shopify',
      url: 'brandwisp-demo.myshopify.com',
      status: 'connected',
      lastSync: '2025-01-28T10:30:00Z'
    }
  ]);

  const [formData, setFormData] = useState({
    storeName: '',
    platform: '',
    storeUrl: '',
    apiKey: '',
    apiSecret: '',
    description: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/stores/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newStore = await response.json();
        setStores(prev => [...prev, newStore]);
        setFormData({
          storeName: '',
          platform: '',
          storeUrl: '',
          apiKey: '',
          apiSecret: '',
          description: ''
        });
        toast.success('Store registered successfully!');
      } else {
        throw new Error('Failed to register store');
      }
    } catch (error) {
      toast.error('Failed to register store. Please try again.');
      console.error('Store registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStores(prev => prev.filter(store => store.id !== storeId));
        toast.success('Store removed successfully!');
      } else {
        throw new Error('Failed to delete store');
      }
    } catch (error) {
      toast.error('Failed to remove store. Please try again.');
      console.error('Store deletion error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'shopify': return '🛍️';
      case 'amazon': return '📦';
      case 'etsy': return '🎨';
      case 'woocommerce': return '🛒';
      case 'magento': return '🏪';
      default: return '🏬';
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] via-[#2D2A5E] to-[#1E1B4B] p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                Store Registration
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                Connect and manage your e-commerce stores
              </p>
            </div>
            <Badge variant="outline" className="text-purple-300 border-purple-400/30">
              {stores.length} Store{stores.length !== 1 ? 's' : ''} Connected
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Registration Form */}
            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Register New Store
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Add a new e-commerce store to your BrandWisp dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="storeName" className="text-purple-200">Store Name</Label>
                      <Input
                        id="storeName"
                        value={formData.storeName}
                        onChange={(e) => handleInputChange('storeName', e.target.value)}
                        placeholder="My Awesome Store"
                        className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform" className="text-purple-200">Platform</Label>
                      <Select value={formData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
                        <SelectTrigger className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E1B4B] border-[#3D3A6E]">
                          <SelectItem value="shopify">🛍️ Shopify</SelectItem>
                          <SelectItem value="amazon">📦 Amazon</SelectItem>
                          <SelectItem value="etsy">🎨 Etsy</SelectItem>
                          <SelectItem value="woocommerce">🛒 WooCommerce</SelectItem>
                          <SelectItem value="magento">🏪 Magento</SelectItem>
                          <SelectItem value="bigcommerce">🏬 BigCommerce</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="storeUrl" className="text-purple-200">Store URL</Label>
                    <Input
                      id="storeUrl"
                      value={formData.storeUrl}
                      onChange={(e) => handleInputChange('storeUrl', e.target.value)}
                      placeholder="mystore.myshopify.com"
                      className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="apiKey" className="text-purple-200">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={formData.apiKey}
                        onChange={(e) => handleInputChange('apiKey', e.target.value)}
                        placeholder="Enter API key"
                        className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="apiSecret" className="text-purple-200">API Secret</Label>
                      <Input
                        id="apiSecret"
                        type="password"
                        value={formData.apiSecret}
                        onChange={(e) => handleInputChange('apiSecret', e.target.value)}
                        placeholder="Enter API secret"
                        className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-purple-200">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of your store..."
                      className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registering Store...
                      </>
                    ) : (
                      <>
                        <Store className="h-4 w-4 mr-2" />
                        Register Store
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Connected Stores */}
            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  Connected Stores
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your registered e-commerce stores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stores.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No stores connected yet</p>
                      <p className="text-sm">Register your first store to get started</p>
                    </div>
                  ) : (
                    stores.map((store) => (
                      <div
                        key={store.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-[#1E1B4B]/50 border border-[#3D3A6E]/50 hover:bg-[#1E1B4B]/70 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">
                            {getPlatformIcon(store.platform)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{store.name}</h3>
                            <p className="text-sm text-gray-400 flex items-center">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {store.url}
                            </p>
                            <p className="text-xs text-gray-500">
                              Last sync: {new Date(store.lastSync).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(store.status)} text-white border-none`}
                          >
                            {store.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-purple-300"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStore(store.id)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integration Guide */}
          <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="text-purple-300">Integration Guide</CardTitle>
              <CardDescription className="text-gray-400">
                Step-by-step instructions for connecting your stores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Get API Credentials</h3>
                  <p className="text-sm text-gray-400">
                    Obtain API keys from your e-commerce platform's admin panel
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Register Store</h3>
                  <p className="text-sm text-gray-400">
                    Fill out the registration form with your store details
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Start Managing</h3>
                  <p className="text-sm text-gray-400">
                    Access all BrandWisp features for your connected stores
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 