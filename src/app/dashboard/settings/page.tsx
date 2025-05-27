'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Store,
  Settings,
  CreditCard,
  Bell,
  Shield,
  X,
  Plus,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { StoreConnection, StoreProvider, StoreValidationError } from '@/types/store';
import { StoreModel } from '@/lib/models/store';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stores' | 'profile' | 'billing'>('stores');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<StoreProvider>('shopify');
  const [storeDomain, setStoreDomain] = useState('');
  const [stores, setStores] = useState<StoreConnection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [profileSettings, setProfileSettings] = useState({
    name: '',
    email: '',
    notifications: {
      email: true,
      push: true,
      weekly: false
    },
    security: {
      twoFactor: false,
      sessionTimeout: '30'
    }
  });

  const [billingSettings, setBillingSettings] = useState({
    campaignBudget: '1000',
    autoRenew: true,
    maxSpend: '5000',
    alertThreshold: '80'
  });

  useEffect(() => {
    if (!user && !loading) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadStores();
    }
  }, [user]);

  // Add effect to handle URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const errorMsg = params.get('error');
    const shop = params.get('shop');

    if (success === 'true' && shop) {
      setError(null);
      setModalOpen(false); // Close the modal after successful connection
      loadStores(); // Reload stores list
    } else if (errorMsg) {
      setError(errorMsg);
    }

    // Clean up URL parameters
    if (success || errorMsg) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const loadStores = async () => {
    if (!user) return;
    try {
      const userStores = await StoreModel.getByUserId(user.uid);
      console.log('Loaded stores:', userStores); // Add logging
      setStores(userStores);
    } catch (err) {
      console.error('Error loading stores:', err);
      setError('Failed to load stores');
    }
  };

  const handleConnect = async () => {
    if (!user) return;
    setError(null);
    setIsConnecting(true);

    try {
      // Validate the store connection
      await StoreModel.validateNewConnection(user.uid, selectedProvider, storeDomain);

      // Initiate OAuth flow based on provider
      switch (selectedProvider) {
        case 'shopify': {
          let shop = storeDomain.trim().toLowerCase();
          // Remove https:// or http:// if present
          shop = shop.replace(/^https?:\/\//, '');
          // Add .myshopify.com if not present
          if (!shop.includes('.myshopify.com')) {
            shop = `${shop}.myshopify.com`;
          }
          const params = new URLSearchParams({
            shop,
            userId: user.uid,
            sync: 'true'
          });
          window.location.href = `/api/shopify/initiate?${params.toString()}`;
          break;
        }

        case 'amazon':
          window.location.href = `/api/amazon/initiate?userId=${user.uid}`;
          break;

        case 'etsy':
          window.location.href = `/api/etsy/initiate?userId=${user.uid}`;
          break;
      }
    } catch (err) {
      const validationError = err as StoreValidationError;
      setError(validationError.message || 'Failed to connect store');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (storeId: string) => {
    try {
      const response = await fetch('/api/stores/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to disconnect store');
      }

      // Reload the stores list after successful disconnection
      await loadStores();
      setError(null);
    } catch (err: any) {
      console.error('Error disconnecting store:', err);
      setError(err.message || 'Failed to disconnect store');
    }
  };

  const handleReconnect = async (store: StoreConnection) => {
    if (!user) return;
    setError(null);

    try {
      // Initiate OAuth flow for reconnection
      switch (store.provider) {
        case 'shopify':
          window.location.href = `/api/shopify/initiate?shop=${encodeURIComponent(store.storeUrl)}&userId=${user.uid}&storeId=${store.id}&reconnect=true`;
          break;

        case 'amazon':
          window.location.href = `/api/amazon/initiate?userId=${user.uid}&storeId=${store.id}&reconnect=true`;
          break;

        case 'etsy':
          window.location.href = `/api/etsy/initiate?userId=${user.uid}&storeId=${store.id}&reconnect=true`;
          break;
      }
    } catch (err) {
      console.error('Error reconnecting store:', err);
      setError('Failed to reconnect store');
    }
  };

  const handleSaveProfile = () => {
    // Save profile settings to backend
    alert('Profile settings saved!');
  };

  const handleSaveBilling = () => {
    // Save billing settings to backend
    alert('Billing settings saved!');
  };

  if (loading || !user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Settings Navigation */}
        <div className="flex space-x-4 mb-8">
          <Button
            variant={activeTab === 'stores' ? 'default' : 'outline'}
            onClick={() => setActiveTab('stores')}
            className="flex items-center space-x-2"
          >
            <Store className="w-4 h-4" />
            <span>Store Management</span>
          </Button>
          <Button
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            onClick={() => setActiveTab('profile')}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Profile Settings</span>
          </Button>
          <Button
            variant={activeTab === 'billing' ? 'default' : 'outline'}
            onClick={() => setActiveTab('billing')}
            className="flex items-center space-x-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Billing & Budget</span>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Store Management */}
        {activeTab === 'stores' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Connected Stores</h2>
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Store
                </Button>
              </div>

              <div className="space-y-4">
                {stores.map(store => (
                  <div key={store.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Store className="w-6 h-6" />
                      <div>
                        <p className="font-medium">{store.storeName}</p>
                        <p className="text-sm text-muted-foreground">
                          {store.provider.charAt(0).toUpperCase() + store.provider.slice(1)} • 
                          Connected on {new Date(store.createdAt).toLocaleDateString()} •
                          Status: <span className={store.status === 'connected' ? 'text-green-500' : 'text-yellow-500'}>
                            {store.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {store.status === 'disconnected' && (
                        <Button variant="outline" onClick={() => handleReconnect(store)}>
                          Reconnect
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        onClick={() => handleDisconnect(store.id)}
                        disabled={store.status === 'disconnected'}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ))}

                {stores.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No stores connected. Click "Connect Store" to add your first store.
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={profileSettings.name}
                    onChange={e => setProfileSettings(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={profileSettings.email}
                    onChange={e => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={profileSettings.notifications.email}
                    onCheckedChange={(checked: boolean) =>
                      setProfileSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                  <Switch
                    checked={profileSettings.notifications.push}
                    onCheckedChange={(checked: boolean) =>
                      setProfileSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, push: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Security</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch
                    checked={profileSettings.security.twoFactor}
                    onCheckedChange={(checked: boolean) =>
                      setProfileSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, twoFactor: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile}>Save Profile Settings</Button>
            </div>
          </div>
        )}

        {/* Billing Settings */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Campaign Budget</h2>
              <div className="space-y-4">
                <div>
                  <Label>Monthly Budget ($)</Label>
                  <Input
                    type="number"
                    value={billingSettings.campaignBudget}
                    onChange={e => setBillingSettings(prev => ({ ...prev, campaignBudget: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Maximum Spend Limit ($)</Label>
                  <Input
                    type="number"
                    value={billingSettings.maxSpend}
                    onChange={e => setBillingSettings(prev => ({ ...prev, maxSpend: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-renew Budget</Label>
                    <p className="text-sm text-muted-foreground">Automatically renew budget monthly</p>
                  </div>
                  <Switch
                    checked={billingSettings.autoRenew}
                    onCheckedChange={(checked: boolean) =>
                      setBillingSettings(prev => ({ ...prev, autoRenew: checked }))
                    }
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveBilling}>Save Billing Settings</Button>
            </div>
          </div>
        )}

        {/* Connect Store Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Connect a Store</h2>
                <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Store Platform</Label>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant={selectedProvider === 'shopify' ? 'default' : 'outline'}
                      onClick={() => setSelectedProvider('shopify')}
                      className="flex-1"
                    >
                      Shopify
                    </Button>
                    <Button
                      variant={selectedProvider === 'amazon' ? 'default' : 'outline'}
                      onClick={() => setSelectedProvider('amazon')}
                      className="flex-1"
                    >
                      Amazon
                    </Button>
                    <Button
                      variant={selectedProvider === 'etsy' ? 'default' : 'outline'}
                      onClick={() => setSelectedProvider('etsy')}
                      className="flex-1"
                    >
                      Etsy
                    </Button>
                  </div>
                </div>

                {selectedProvider === 'shopify' && (
                  <div>
                    <Label>Store Domain</Label>
                    <Input
                      value={storeDomain}
                      onChange={e => setStoreDomain(e.target.value)}
                      placeholder="yourstore.myshopify.com"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter your Shopify store domain
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConnect}
                    disabled={isConnecting || (selectedProvider === 'shopify' && !storeDomain)}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Store'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 