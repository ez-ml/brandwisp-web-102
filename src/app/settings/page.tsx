"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreConnectionCard } from "@/components/stores/StoreConnection";
import { Settings, CreditCard, Store } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Tabs defaultValue="stores" className="space-y-8">
        <TabsList>
          <TabsTrigger value="stores">
            <Store className="mr-2 h-4 w-4" />
            Store Connections
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="account">
            <Settings className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stores">
          <Card>
            <CardHeader>
              <CardTitle>Store Connections</CardTitle>
              <CardDescription>
                Manage your connected e-commerce stores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <StoreConnectionCard provider="shopify" />
                <StoreConnectionCard provider="amazon" />
                <StoreConnectionCard provider="etsy" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Current Plan</h3>
                    <p className="text-sm text-muted-foreground">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">$49/month</p>
                  </div>
                  <Button asChild>
                    <Link href="/plans">
                      Change Plan
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Payment Method</h3>
                    <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2024</p>
                  </div>
                  <Button variant="outline">Update</Button>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Billing History</h3>
                    <p className="text-sm text-muted-foreground">View and download past invoices</p>
                  </div>
                  <Button variant="outline">View History</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Profile Information</h3>
                    <p className="text-sm text-muted-foreground">Update your account details</p>
                  </div>
                  <Button variant="outline">Edit Profile</Button>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Email Preferences</h3>
                    <p className="text-sm text-muted-foreground">Manage notification settings</p>
                  </div>
                  <Button variant="outline">Update</Button>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Security</h3>
                    <p className="text-sm text-muted-foreground">Password and authentication settings</p>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
              </div>

              <div className="rounded-lg border p-4 border-destructive">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-destructive">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground">Delete account and data</p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 