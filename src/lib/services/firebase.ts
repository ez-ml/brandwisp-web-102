import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types based on our schema
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodStart: Timestamp;
    currentPeriodEnd: Timestamp;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
    dashboard: {
      defaultView: string;
      widgets: string[];
    };
  };
  usage: {
    apiCalls: number;
    storageUsed: number;
    lastReset: Timestamp;
  };
  connectedAccounts: {
    shopify?: {
      storeUrl: string;
      accessToken: string;
      connectedAt: Timestamp;
    };
    google?: {
      accountId: string;
      refreshToken: string;
      connectedAt: Timestamp;
    };
    facebook?: {
      accountId: string;
      accessToken: string;
      connectedAt: Timestamp;
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Store {
  id: string;
  userId: string;
  name: string;
  platform: 'shopify' | 'woocommerce' | 'magento' | 'custom';
  url: string;
  credentials: {
    accessToken: string;
    apiKey?: string;
    secretKey?: string;
  };
  settings: {
    currency: string;
    timezone: string;
    language: string;
  };
  status: 'active' | 'inactive' | 'error';
  lastSync: Timestamp;
  trafficTracking?: {
    enabled: boolean;
    trackingCode: string;
    connectedAt: Date;
    lastDataUpdate: Date;
    settings: {
      timezone: string;
      currency: string;
      goals: Array<{
        name: string;
        value: number;
        type: 'conversion' | 'engagement' | 'lead';
      }>;
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Product {
  id: string;
  storeId: string;
  externalId: string;
  title: string;
  description: string;
  handle: string;
  vendor: string;
  productType: string;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  images: {
    id: string;
    src: string;
    altText?: string;
    width: number;
    height: number;
    position: number;
  }[];
  variants: {
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    sku: string;
    inventory: number;
    weight?: number;
    options: Record<string, string>;
  }[];
  seo: {
    title?: string;
    description?: string;
    keywords: string[];
  };
  analytics: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  syncedAt: Timestamp;
}

export interface Blog {
  id: string;
  userId: string;
  storeId?: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt?: Timestamp;
  scheduledAt?: Timestamp;
  author: {
    name: string;
    email: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
  };
  tags: string[];
  categories: string[];
  featuredImage?: {
    url: string;
    altText: string;
    caption?: string;
  };
  settings: {
    allowComments: boolean;
    template: string;
    callToAction?: {
      text: string;
      url: string;
      type: 'button' | 'link';
    };
  };
  analytics: {
    views: number;
    shares: number;
    comments: number;
    engagement: number;
  };
  generation: {
    prompt?: string;
    model?: string;
    generatedAt?: Timestamp;
    isGenerated: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Campaign {
  id: string;
  userId: string;
  storeId?: string;
  name: string;
  platform: 'facebook' | 'instagram' | 'google' | 'tiktok' | 'linkedin' | 'twitter' | 'youtube';
  type: 'image' | 'video' | 'carousel' | 'collection';
  objective: 'brand-awareness' | 'reach' | 'traffic' | 'engagement' | 'lead-generation' | 'conversions' | 'sales';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'error';
  budget: {
    total: number;
    daily?: number;
    spent: number;
    currency: string;
  };
  schedule: {
    startDate: Timestamp;
    endDate?: Timestamp;
    timezone: string;
  };
  targeting: {
    audience: string;
    demographics: {
      ageMin?: number;
      ageMax?: number;
      genders?: string[];
      locations?: string[];
      languages?: string[];
    };
    interests: string[];
    behaviors: string[];
    customAudiences?: string[];
  };
  creatives: {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    headline?: string;
    description?: string;
    callToAction?: string;
    performance?: {
      impressions: number;
      clicks: number;
      ctr: number;
      cpc: number;
      conversions: number;
    };
  }[];
  metrics: {
    impressions: number;
    reach: number;
    clicks: number;
    ctr: number;
    cpc: number;
    engagement: number;
    conversions: number;
    revenue: number;
    roas: number;
    lastUpdated: Timestamp;
  };
  externalIds: {
    [platform: string]: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ImageAnalysis {
  id: string;
  userId: string;
  storeId?: string;
  productId?: string;
  url: string;
  filename: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
  format: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  analysis: {
    tags: {
      label: string;
      confidence: number;
      category: string;
    }[];
    objects: {
      name: string;
      confidence: number;
      boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }[];
    colors: {
      hex: string;
      percentage: number;
      name: string;
    }[];
    text?: {
      content: string;
      confidence: number;
      language: string;
    }[];
  };
  seo: {
    currentAltText?: string;
    suggestedAltText: string;
    currentCaption?: string;
    suggestedCaption: string;
    currentDescription?: string;
    suggestedDescription: string;
    score: number;
  };
  accessibility: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  createdAt: Timestamp;
  analyzedAt?: Timestamp;
  updatedAt: Timestamp;
}

// TrafficTrace interfaces
export interface Website {
  id: string;
  userId: string;
  domain: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  trackingCode: string;
  connectedAt: Timestamp;
  lastDataUpdate: Timestamp;
  settings: {
    timezone: string;
    currency: string;
    goals: {
      name: string;
      value: number;
      type: 'conversion' | 'engagement' | 'lead';
    }[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TrafficAnalytics {
  id: string;
  userId: string;
  websiteId: string;
  date: Timestamp;
  metrics: {
    visitors: number;
    uniqueVisitors: number;
    pageViews: number;
    sessions: number;
    bounceRate: number;
    avgSessionDuration: number;
    newVisitorRate: number;
    returningVisitorRate: number;
    conversions: number;
    revenue: number;
  };
  sources: {
    organic: number;
    direct: number;
    social: number;
    referral: number;
    email: number;
    paid: number;
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  topPages: {
    path: string;
    views: number;
    avgTime: number;
  }[];
  geographic: {
    country: string;
    visitors: number;
    sessions: number;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RealTimeTraffic {
  id: string;
  userId: string;
  websiteId: string;
  timestamp: Timestamp;
  activeUsers: number;
  currentPageViews: number;
  topActivePages: {
    path: string;
    activeUsers: number;
  }[];
  topReferrers: {
    source: string;
    activeUsers: number;
  }[];
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TrafficGoal {
  id: string;
  userId: string;
  websiteId: string;
  name: string;
  type: 'conversion' | 'engagement' | 'lead';
  value: number;
  conditions: {
    type: 'url' | 'event' | 'duration';
    operator: 'equals' | 'contains' | 'exceeds';
    value: string | number;
  }[];
  isActive: boolean;
  completions: number;
  conversionRate: number;
  totalValue: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TrafficAlert {
  id: string;
  userId: string;
  websiteId: string;
  name: string;
  type: 'traffic_drop' | 'traffic_spike' | 'bounce_rate' | 'conversion_drop';
  condition: {
    metric: string;
    operator: 'exceeds' | 'decreases_by' | 'increases_by';
    value: number;
    period: 'hour' | 'day' | 'week';
  };
  isActive: boolean;
  lastTriggered: Timestamp | null;
  notifications: {
    email: boolean;
    push: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class FirebaseService {
  // User Profile Operations
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() as UserProfile : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Store Operations
  static async getUserStores(userId: string): Promise<Store[]> {
    try {
      const storesQuery = query(
        collection(db, 'stores'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(storesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
    } catch (error) {
      console.error('Error getting user stores:', error);
      return [];
    }
  }

  static async getStore(storeId: string): Promise<Store | null> {
    try {
      const storeDoc = await getDoc(doc(db, 'stores', storeId));
      return storeDoc.exists() ? { id: storeDoc.id, ...storeDoc.data() } as Store : null;
    } catch (error) {
      console.error('Error getting store:', error);
      return null;
    }
  }

  static async createStore(storeData: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'stores'), {
        ...storeData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  }

  static async updateStore(storeId: string, data: Partial<Store>): Promise<void> {
    try {
      await updateDoc(doc(db, 'stores', storeId), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating store:', error);
      throw error;
    }
  }

  // Product Operations
  static async getStoreProducts(storeId: string, limitCount = 50): Promise<Product[]> {
    try {
      const productsQuery = query(
        collection(db, 'stores', storeId, 'products'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(productsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      console.error('Error getting store products:', error);
      return [];
    }
  }

  static async getProduct(storeId: string, productId: string): Promise<Product | null> {
    try {
      const productDoc = await getDoc(doc(db, 'stores', storeId, 'products', productId));
      return productDoc.exists() ? { id: productDoc.id, ...productDoc.data() } as Product : null;
    } catch (error) {
      console.error('Error getting product:', error);
      return null;
    }
  }

  // Blog Operations
  static async getUserBlogs(userId: string, limitCount = 50): Promise<Blog[]> {
    try {
      const blogsQuery = query(
        collection(db, 'blogs'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(blogsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
    } catch (error) {
      console.error('Error getting user blogs:', error);
      return [];
    }
  }

  static async getBlog(blogId: string): Promise<Blog | null> {
    try {
      const blogDoc = await getDoc(doc(db, 'blogs', blogId));
      return blogDoc.exists() ? { id: blogDoc.id, ...blogDoc.data() } as Blog : null;
    } catch (error) {
      console.error('Error getting blog:', error);
      return null;
    }
  }

  static async createBlog(blogData: Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'blogs'), {
        ...blogData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }

  static async updateBlog(blogId: string, data: Partial<Blog>): Promise<void> {
    try {
      await updateDoc(doc(db, 'blogs', blogId), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  }

  // Campaign Operations
  static async getUserCampaigns(userId: string, limitCount = 50): Promise<Campaign[]> {
    try {
      // Use a simpler query without orderBy to avoid index requirements
      const campaignsQuery = query(
        collection(db, 'campaigns'),
        where('userId', '==', userId),
        limit(limitCount)
      );
      const snapshot = await getDocs(campaignsQuery);
      const campaigns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
      
      // Sort in memory by createdAt (descending)
      return campaigns.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error getting user campaigns:', error);
      return [];
    }
  }

  static async getCampaign(campaignId: string): Promise<Campaign | null> {
    try {
      const campaignDoc = await getDoc(doc(db, 'campaigns', campaignId));
      return campaignDoc.exists() ? { id: campaignDoc.id, ...campaignDoc.data() } as Campaign : null;
    } catch (error) {
      console.error('Error getting campaign:', error);
      return null;
    }
  }

  static async createCampaign(campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'campaigns'), {
        ...campaignData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  static async updateCampaign(campaignId: string, data: Partial<Campaign>): Promise<void> {
    try {
      await updateDoc(doc(db, 'campaigns', campaignId), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  // Image Analysis Operations
  static async getUserImages(userId: string, limitCount = 50): Promise<ImageAnalysis[]> {
    try {
      // Use a simpler query without orderBy to avoid index requirements
      const imagesQuery = query(
        collection(db, 'images'),
        where('userId', '==', userId),
        limit(limitCount)
      );
      const snapshot = await getDocs(imagesQuery);
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImageAnalysis));
      
      // Sort in memory by createdAt (descending)
      return images.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error getting user images:', error);
      return [];
    }
  }

  static async getImageAnalysis(imageId: string): Promise<ImageAnalysis | null> {
    try {
      const imageDoc = await getDoc(doc(db, 'images', imageId));
      return imageDoc.exists() ? { id: imageDoc.id, ...imageDoc.data() } as ImageAnalysis : null;
    } catch (error) {
      console.error('Error getting image analysis:', error);
      return null;
    }
  }

  static async createImageAnalysis(imageData: Omit<ImageAnalysis, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'images'), {
        ...imageData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating image analysis:', error);
      throw error;
    }
  }

  static async updateImageAnalysis(imageId: string, data: Partial<ImageAnalysis>): Promise<void> {
    try {
      await updateDoc(doc(db, 'images', imageId), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating image analysis:', error);
      throw error;
    }
  }

  // Save or update a product
  static async saveProduct(storeId: string, productData: any): Promise<void> {
    try {
      const productRef = doc(db, 'stores', storeId, 'products', productData.id);
      
      const product = {
        ...productData,
        storeId,
        syncedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Check if product exists
      const existingProduct = await getDoc(productRef);
      if (!existingProduct.exists()) {
        product.createdAt = Timestamp.now();
      }

      // Use setDoc instead of updateDoc to handle both create and update
      await setDoc(productRef, product, { merge: true });
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  }

  // TrafficTrace Operations
  static async getUserWebsites(userId: string): Promise<Website[]> {
    try {
      const websitesQuery = query(
        collection(db, 'websites'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(websitesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Website));
    } catch (error) {
      console.error('Error getting user websites:', error);
      return [];
    }
  }

  static async getWebsite(websiteId: string): Promise<Website | null> {
    try {
      const websiteDoc = await getDoc(doc(db, 'websites', websiteId));
      return websiteDoc.exists() ? { id: websiteDoc.id, ...websiteDoc.data() } as Website : null;
    } catch (error) {
      console.error('Error getting website:', error);
      return null;
    }
  }

  static async createWebsite(websiteData: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'websites'), {
        ...websiteData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating website:', error);
      throw error;
    }
  }

  static async updateWebsite(websiteId: string, data: Partial<Website>): Promise<void> {
    try {
      await updateDoc(doc(db, 'websites', websiteId), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating website:', error);
      throw error;
    }
  }

  static async getTrafficAnalytics(userId: string, websiteId?: string, days = 30): Promise<TrafficAnalytics[]> {
    try {
      // Use simpler query to avoid composite index requirement
      let analyticsQuery;

      if (websiteId) {
        analyticsQuery = query(
          collection(db, 'traffic_analytics'),
          where('userId', '==', userId),
          where('websiteId', '==', websiteId)
        );
      } else {
        analyticsQuery = query(
          collection(db, 'traffic_analytics'),
          where('userId', '==', userId)
        );
      }

      const snapshot = await getDocs(analyticsQuery);
      const allResults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrafficAnalytics));
      
      // Filter by date range in memory
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startTime = startDate.getTime();
      
      const filteredResults = allResults.filter(item => {
        const itemDate = item.date?.toDate?.() || (item.date instanceof Date ? item.date : new Date());
        return itemDate.getTime() >= startTime;
      });
      
      // Sort in memory by date (descending)
      return filteredResults.sort((a, b) => {
        const aTime = (a.date?.toDate?.() || (a.date instanceof Date ? a.date : new Date())).getTime();
        const bTime = (b.date?.toDate?.() || (b.date instanceof Date ? b.date : new Date())).getTime();
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error getting traffic analytics:', error);
      return [];
    }
  }

  static async getRealTimeTraffic(userId: string, websiteId: string): Promise<RealTimeTraffic | null> {
    try {
      // Use simpler query without orderBy to avoid composite index
      const realtimeQuery = query(
        collection(db, 'realtime_traffic'),
        where('userId', '==', userId),
        where('websiteId', '==', websiteId)
      );
      const snapshot = await getDocs(realtimeQuery);
      
      if (snapshot.empty) {
        return null;
      }
      
      // Get the most recent record by sorting in memory
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RealTimeTraffic));
      const sortedResults = results.sort((a, b) => {
        const aTime = (a.timestamp?.toDate?.() || (a.timestamp instanceof Date ? a.timestamp : new Date())).getTime();
        const bTime = (b.timestamp?.toDate?.() || (b.timestamp instanceof Date ? b.timestamp : new Date())).getTime();
        return bTime - aTime;
      });
      
      return sortedResults[0] || null;
    } catch (error) {
      console.error('Error getting real-time traffic:', error);
      return null;
    }
  }

  static async getTrafficGoals(userId: string, websiteId: string): Promise<TrafficGoal[]> {
    try {
      // Use simpler query without orderBy to avoid composite index
      const goalsQuery = query(
        collection(db, 'traffic_goals'),
        where('userId', '==', userId),
        where('websiteId', '==', websiteId)
      );
      const snapshot = await getDocs(goalsQuery);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrafficGoal));
      
      // Sort in memory by createdAt (descending)
      return results.sort((a, b) => {
        const aTime = (a.createdAt?.toDate?.() || (a.createdAt instanceof Date ? a.createdAt : new Date())).getTime();
        const bTime = (b.createdAt?.toDate?.() || (b.createdAt instanceof Date ? b.createdAt : new Date())).getTime();
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error getting traffic goals:', error);
      return [];
    }
  }

  static async createTrafficGoal(goalData: Omit<TrafficGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'traffic_goals'), {
        ...goalData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating traffic goal:', error);
      throw error;
    }
  }

  static async updateTrafficGoal(goalId: string, data: Partial<TrafficGoal>): Promise<void> {
    try {
      await updateDoc(doc(db, 'traffic_goals', goalId), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating traffic goal:', error);
      throw error;
    }
  }

  static async getTrafficAlerts(userId: string, websiteId?: string): Promise<TrafficAlert[]> {
    try {
      // Use simpler query without orderBy to avoid composite index
      let alertsQuery;

      if (websiteId) {
        alertsQuery = query(
          collection(db, 'traffic_alerts'),
          where('userId', '==', userId),
          where('websiteId', '==', websiteId)
        );
      } else {
        alertsQuery = query(
          collection(db, 'traffic_alerts'),
          where('userId', '==', userId)
        );
      }

      const snapshot = await getDocs(alertsQuery);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrafficAlert));
      
      // Sort in memory by createdAt (descending)
      return results.sort((a, b) => {
        const aTime = (a.createdAt?.toDate?.() || (a.createdAt instanceof Date ? a.createdAt : new Date())).getTime();
        const bTime = (b.createdAt?.toDate?.() || (b.createdAt instanceof Date ? b.createdAt : new Date())).getTime();
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error getting traffic alerts:', error);
      return [];
    }
  }

  static async createTrafficAlert(alertData: Omit<TrafficAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'traffic_alerts'), {
        ...alertData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating traffic alert:', error);
      throw error;
    }
  }

  static async updateTrafficAlert(alertId: string, data: Partial<TrafficAlert>): Promise<void> {
    try {
      await updateDoc(doc(db, 'traffic_alerts', alertId), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating traffic alert:', error);
      throw error;
    }
  }
} 