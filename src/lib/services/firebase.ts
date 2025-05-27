import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
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
      const campaignsQuery = query(
        collection(db, 'campaigns'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(campaignsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
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
      const imagesQuery = query(
        collection(db, 'images'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(imagesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImageAnalysis));
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
} 