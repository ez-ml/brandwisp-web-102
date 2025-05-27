"use client";

import { useState } from 'react';
import { StoreConnection } from '@/types/store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { StoreModel } from '@/lib/models/store';

interface StoreConnectionProps {
  store?: StoreConnection;
  provider: 'shopify' | 'amazon' | 'etsy';
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function StoreConnectionCard({ store, provider, onConnect, onDisconnect }: StoreConnectionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/${provider}?shop=${encodeURIComponent(window.location.origin)}`);
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Connection error:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!store) return;
    
    setIsLoading(true);
    try {
      await StoreModel.disconnect(store.id);
      onDisconnect?.();
    } catch (error) {
      console.error('Disconnection error:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconnect = async () => {
    if (!store) return;
    await handleConnect();
  };

  const getProviderTitle = () => {
    switch (provider) {
      case 'shopify':
        return 'Shopify Store';
      case 'amazon':
        return 'Amazon Store';
      case 'etsy':
        return 'Etsy Shop';
      default:
        return 'Store';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{getProviderTitle()}</CardTitle>
        <CardDescription>
          {store ? `Connected to ${store.storeName}` : `Connect your ${provider} store`}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {store && (
          <div className="space-y-2">
            <p className="text-sm">Status: {store.status}</p>
            <p className="text-sm">Store URL: {store.storeUrl}</p>
            {store.expiresAt && (
              <p className="text-sm">
                Expires: {new Date(store.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        {!store && (
          <Button
            onClick={handleConnect}
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect Store'}
          </Button>
        )}

        {store && store.status === 'connected' && (
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            disabled={isLoading}
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        )}

        {store && (store.status === 'disconnected' || store.status === 'expired') && (
          <Button
            onClick={handleReconnect}
            disabled={isLoading}
          >
            {isLoading ? 'Reconnecting...' : 'Reconnect'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 