'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRealStoreData } from '@/hooks/useRealStoreData';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { collection, getDocs, query, where, orderBy, limit, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import dynamic from 'next/dynamic';
import { marked } from 'marked';
import {
  Loader2,
  PenLine,
  Image as ImageIcon,
  Link as LinkIcon,
  Edit3,
  Eye,
  Calendar,
  TrendingUp,
  BarChart3,
  Users,
  Target,
  Sparkles,
  FileText,
  Settings,
  Plus,
  X,
  Check,
  Clock,
  Globe,
  Zap,
  Store,
  Package,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Share2,
  MessageSquare,
  Heart,
  BookOpen,
  Rss,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled';
  platform: 'shopify' | 'wordpress' | 'medium' | 'multiple';
  storeId?: string;
  storeName?: string;
  productId?: string;
  productName?: string;
  publishedAt?: Date;
  scheduledAt?: Date;
  author: {
    name: string;
    email: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  tags: string[];
  categories: string[];
  analytics: {
    views: number;
    shares: number;
    comments: number;
    engagement: number;
    ctr: number;
  };
  generation: {
    prompt?: string;
    model?: string;
    generatedAt?: Date;
    isGenerated: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface BlogMetrics {
  date: string;
  posts: number;
  views: number;
  engagement: number;
  ctr: number;
  shares: number;
}

interface PlatformConfig {
  id: string;
  name: string;
  enabled: boolean;
  credentials?: {
    url?: string;
    username?: string;
    password?: string;
    apiKey?: string;
  };
  settings?: {
    autoPublish?: boolean;
    defaultCategory?: string;
    defaultTags?: string[];
  };
}

const COLORS = {
  primary: '#7C3AED',
  secondary: '#EC4899',
  tertiary: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export default function AutoBlogGenPage() {
  const { user } = useAuth();
  const { stores, products: realProducts, loading: storesLoading, error: storesError } = useRealStoreData();
  
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'manage' | 'settings'>('dashboard');
  
  // Blog creation states
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [topic, setTopic] = useState('');
  const [blogObjective, setBlogObjective] = useState('Product Promotion');
  const [tone, setTone] = useState('Friendly & Persuasive');
  const [cta, setCTA] = useState('Shop Now');
  const [length, setLength] = useState('Medium');
  const [targetAudience, setTargetAudience] = useState('General Consumers');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['shopify']);
  
  // Generated blog states
  const [generatedBlog, setGeneratedBlog] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Blog management states
  const [blogFilter, setBlogFilter] = useState<'all' | 'published' | 'draft'>('all');
  
  // Blog management states
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogMetrics, setBlogMetrics] = useState<BlogMetrics[]>([]);
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfig[]>([
    {
      id: 'shopify',
      name: 'Shopify',
      enabled: true,
      settings: { autoPublish: true, defaultTags: ['product', 'ecommerce'] }
    },
    {
      id: 'wordpress',
      name: 'WordPress',
      enabled: false,
      credentials: { url: '', username: '', password: '' },
      settings: { autoPublish: false, defaultCategory: 'Blog', defaultTags: ['content'] }
    },
    {
      id: 'medium',
      name: 'Medium',
      enabled: false,
      credentials: { apiKey: '' },
      settings: { autoPublish: false, defaultTags: ['technology', 'business'] }
    }
  ]);

  // Real-time data fetching
  const fetchBlogData = async () => {
    if (!user) return;
    
    try {
      // Check if user and user.email exist before making queries
      if (!user?.email) {
        console.log('User email not available, skipping blog data fetch');
        return;
      }

      // Get Firebase ID token for authentication
      const token = await user.getIdToken();
      
      // Fetch published blogs from Firestore
      const blogsQuery = query(
        collection(db, 'blogs'),
        where('author.email', '==', user.email),
        limit(50)
      );
      
      const blogsSnapshot = await getDocs(blogsQuery);
      const blogsData = blogsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        publishedAt: doc.data().publishedAt?.toDate(),
        scheduledAt: doc.data().scheduledAt?.toDate(),
      })) as BlogPost[];
      
      // Sort by createdAt in JavaScript instead of Firestore
      blogsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setBlogs(blogsData);
      
      // Generate metrics from real blog data
      const metrics = generateMetricsFromBlogs(blogsData);
      setBlogMetrics(metrics);
      
      // Fetch real Shopify blogs for connected stores
      await fetchShopifyBlogs(token);
      
    } catch (error) {
      console.error('Error fetching blog data:', error);
    }
  };

  useEffect(() => {
    fetchBlogData();
  }, [user]);

  const fetchShopifyBlogs = async (token: string) => {
    if (!user || stores.length === 0) return;
    
    try {
      const shopifyBlogs: any[] = [];
      
      for (const store of stores) {
        if (store.status === 'connected' && store.provider === 'shopify') {
          try {
            const response = await fetch(`/api/shopify/fetch-blogs?shop=${store.storeUrl}&userId=${user.uid}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            if (response.ok) {
              const data = await response.json();
              const storeBlogs = (data.articles || []).map((article: any) => ({
                id: `shopify_${article.id}`,
                title: article.title,
                content: article.body_html,
                excerpt: article.summary || article.body_html?.replace(/<[^>]+>/g, '').slice(0, 150) + '...',
                status: 'published' as const,
                platform: 'shopify' as const,
                storeId: store.id,
                storeName: store.storeName,
                publishedAt: new Date(article.created_at),
                author: {
                  name: article.author || 'AutoBlogGen',
                  email: user.email || '',
                },
                seo: {
                  title: article.title,
                  description: article.summary || '',
                  keywords: article.tags?.split(',') || [],
                },
                tags: article.tags?.split(',') || [],
                categories: [],
                analytics: {
                  views: Math.floor(Math.random() * 1000) + 100, // Simulated for now
                  shares: Math.floor(Math.random() * 50) + 5,
                  comments: Math.floor(Math.random() * 20) + 1,
                  engagement: Math.random() * 0.1 + 0.02,
                  ctr: Math.random() * 0.05 + 0.01,
                },
                generation: {
                  isGenerated: article.author === 'AutoBlogGen',
                },
                createdAt: new Date(article.created_at),
                updatedAt: new Date(article.updated_at),
              }));
              
              shopifyBlogs.push(...storeBlogs);
            }
          } catch (error) {
            console.error(`Error fetching blogs for store ${store.storeName}:`, error);
          }
        }
      }
      
      // Merge with existing blogs (avoid duplicates)
      setBlogs(prevBlogs => {
        const existingIds = new Set(prevBlogs.map(blog => blog.id));
        const newBlogs = shopifyBlogs.filter(blog => !existingIds.has(blog.id));
        return [...prevBlogs, ...newBlogs].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      
    } catch (error) {
      console.error('Error fetching Shopify blogs:', error);
    }
  };

  // Fetch products from store subcollections
  const fetchStoreProducts = async (storeId: string) => {
    try {
      const productsRef = collection(db, 'stores', storeId, 'products');
      const productsSnap = await getDocs(productsRef);
      
      const products: any[] = [];
      productsSnap.forEach(doc => {
        products.push({ id: doc.id, storeId, ...doc.data() });
      });
      
      return products;
    } catch (error) {
      console.error('Error fetching store products:', error);
      return [];
    }
  };

  // Enhanced product fetching for all stores
  const [allStoreProducts, setAllStoreProducts] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchAllProducts = async () => {
      if (stores.length === 0) return;
      
      const allProducts: any[] = [];
      for (const store of stores) {
        if (store.status === 'connected') {
          const storeProducts = await fetchStoreProducts(store.id);
          allProducts.push(...storeProducts.map(p => ({ ...p, storeName: store.storeName })));
        }
      }
      
      setAllStoreProducts(allProducts);
    };

    fetchAllProducts();
  }, [stores]);

  const generateMetricsFromBlogs = (blogsData: BlogPost[]): BlogMetrics[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayBlogs = blogsData.filter(blog => 
        blog.createdAt && blog.createdAt.toISOString().split('T')[0] === date
      );
      
      const totalViews = dayBlogs.reduce((sum, blog) => sum + (blog.analytics?.views || 0), 0);
      const totalShares = dayBlogs.reduce((sum, blog) => sum + (blog.analytics?.shares || 0), 0);
      const avgEngagement = dayBlogs.length > 0 
        ? dayBlogs.reduce((sum, blog) => sum + (blog.analytics?.engagement || 0), 0) / dayBlogs.length
        : 0;
      const avgCtr = dayBlogs.length > 0
        ? dayBlogs.reduce((sum, blog) => sum + (blog.analytics?.ctr || 0), 0) / dayBlogs.length
        : 0;

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        posts: dayBlogs.length,
        views: totalViews,
        engagement: avgEngagement,
        ctr: avgCtr,
        shares: totalShares,
      };
    });
  };

  const getStoreProducts = (storeId: string) => {
    return allStoreProducts.filter(product => product.storeId === storeId);
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  // Add useEffect for escape key handling
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && generatedBlog) {
        setGeneratedBlog(null);
        setEditing(false);
      }
    };

    if (generatedBlog) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [generatedBlog]);

  const handleSaveDraft = async () => {
    if (!generatedBlog) return;

    const content = generatedBlog;
    const title = content.split('\n')[0].replace(/^#+\s*/, '') || topic || 'New Blog Post';
    const excerpt = content.replace(/^#+\s*.*\n/, '').slice(0, 150) + '...';

    try {
      const blogData: Partial<BlogPost> = {
        title,
        content,
        excerpt,
        status: 'draft',
        platform: selectedPlatforms.length === 1 ? selectedPlatforms[0] as any : 'multiple',
        storeId: selectedStore || undefined,
        storeName: stores.find(s => s.id === selectedStore)?.storeName,
        productId: selectedProduct ? allStoreProducts.find(p => p.title === selectedProduct)?.id : undefined,
        productName: selectedProduct || undefined,
        author: {
          name: user?.displayName || 'AutoBlogGen User',
          email: user?.email || '',
        },
        seo: {
          title,
          description: excerpt,
          keywords,
        },
        tags: keywords,
        categories: [blogObjective],
        analytics: {
          views: 0,
          shares: 0,
          comments: 0,
          engagement: 0,
          ctr: 0,
        },
        generation: {
          prompt: `${blogObjective} - ${tone} - ${targetAudience}`,
          model: 'gpt-4',
          generatedAt: new Date(),
          isGenerated: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save the blog to Firestore
      const docRef = await addDoc(collection(db, 'blogs'), blogData);
      console.log('Blog saved as draft with ID:', docRef.id);

      // Refresh the blog list
      await fetchBlogData();

      // Show success message
      alert('Blog saved as draft successfully!');
      
    } catch (error) {
      console.error('Error saving blog as draft:', error);
      alert('Failed to save blog as draft. Please try again.');
    }
  };

  const handleGenerateBlog = async () => {
    setIsGenerating(true);
    setGeneratedBlog(null);

    try {
      // Get Firebase ID token for authentication
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      let blogRequestBody;
      let selectedProductData = null;

      if (selectedStore && selectedProduct) {
        // Find the selected product from real products
        selectedProductData = allStoreProducts.find(p => 
          p.storeId === selectedStore && p.title === selectedProduct
        );

        if (selectedProductData) {
          blogRequestBody = {
            product_name: selectedProductData.title,
            product_description: selectedProductData.description,
            product_features: selectedProductData.tags,
            keywords: keywords.length > 0 ? keywords : selectedProductData.tags,
            blog_objective: blogObjective,
            tone,
            cta,
            length,
            target_audience: targetAudience,
            store_name: selectedProductData.storeName,
            product_price: selectedProductData.variants?.[0]?.price,
            product_vendor: selectedProductData.vendor,
          };
        } else {
          // Fallback to API if product not found in real data
          const res = await fetch(`/api/shopify/products?shop=${selectedStore}&userId=${user?.uid}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await res.json();
          const product = data.products?.find((p: any) => p.title === selectedProduct) || {};

          blogRequestBody = {
            product_name: product.title || selectedProduct,
            product_description: product.description || "A great product loved by customers.",
            product_features: product.tags || ["Great design", "Eco-friendly"],
            keywords: keywords.length > 0 ? keywords : (product.tags || ["trending", "sale"]),
            blog_objective: blogObjective,
            tone,
            cta,
            length,
            target_audience: targetAudience,
          };
        }

        const blogRes = await fetch('/api/dashboard/autobloggen', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'generate-blog',
            topic,
            objective: blogObjective,
            tone,
            audience: targetAudience,
            length,
            keywords,
            callToAction: cta,
            storeId: selectedStore,
            productId: selectedProduct ? allStoreProducts.find(p => p.title === selectedProduct)?.id : undefined
          }),
        });

        const blogData = await blogRes.json();
        if (blogData.success) {
          setGeneratedBlog(blogData.content.content);
        } else {
          throw new Error(blogData.error || 'Failed to generate blog');
        }
      } else {
        // Topic-based blog generation
        const blogRes = await fetch('/api/dashboard/autobloggen', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'generate-blog',
            topic,
            objective: blogObjective,
            tone,
            audience: targetAudience,
            length,
            keywords,
            callToAction: cta,
            storeId: selectedStore,
            productId: selectedProduct ? allStoreProducts.find(p => p.title === selectedProduct)?.id : undefined
          }),
        });

        const blogData = await blogRes.json();
        if (blogData.success) {
          setGeneratedBlog(blogData.content.content);
        } else {
          throw new Error(blogData.error || 'Failed to generate blog');
        }
      }
    } catch (error) {
      console.error('Error generating blog:', error);
      alert('An error occurred while generating the blog.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishBlog = async () => {
    if (!generatedBlog) return;

    // Pre-publish validation
    const validationErrors: string[] = [];
    
    for (const platform of selectedPlatforms) {
      if (platform === 'shopify' && !selectedStore) {
        validationErrors.push('Shopify: Please select a store');
      }
      if (platform === 'wordpress') {
        const wordpressConfig = platformConfigs.find(p => p.id === 'wordpress');
        if (!wordpressConfig?.enabled) {
          validationErrors.push('WordPress: Platform not enabled in Settings');
        } else if (!wordpressConfig.credentials?.url) {
          validationErrors.push('WordPress: Site URL not configured in Settings');
        }
      }
      if (platform === 'medium') {
        const mediumConfig = platformConfigs.find(p => p.id === 'medium');
        if (!mediumConfig?.enabled) {
          validationErrors.push('Medium: Platform not enabled in Settings');
        } else if (!mediumConfig.credentials?.apiKey) {
          validationErrors.push('Medium: API key not configured in Settings');
        }
      }
    }
    
    if (validationErrors.length > 0) {
      alert(`Please fix the following issues before publishing:\n\n${validationErrors.join('\n')}`);
      return;
    }

    setIsPublishing(true);
    const content = generatedBlog;
    const title = content.split('\n')[0].replace(/^#+\s*/, '') || topic || 'New Blog Post';
    const excerpt = content.replace(/^#+\s*.*\n/, '').slice(0, 150) + '...';

    try {
      // Get Firebase ID token for authentication
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const publishResults: any[] = [];

      // Save to Firestore first
      const blogData: Partial<BlogPost> = {
        title,
        content,
        excerpt,
        status: 'published',
        platform: selectedPlatforms.length === 1 ? selectedPlatforms[0] as any : 'multiple',
        storeId: selectedStore || undefined,
        storeName: stores.find(s => s.id === selectedStore)?.storeName,
        productId: selectedProduct ? allStoreProducts.find(p => p.title === selectedProduct)?.id : undefined,
        productName: selectedProduct || undefined,
        publishedAt: new Date(),
        author: {
          name: user?.displayName || 'AutoBlogGen User',
          email: user?.email || '',
        },
        seo: {
          title,
          description: excerpt,
          keywords,
        },
        tags: keywords,
        categories: [blogObjective],
        analytics: {
          views: 0,
          shares: 0,
          comments: 0,
          engagement: 0,
          ctr: 0,
        },
        generation: {
          prompt: `${blogObjective} - ${tone} - ${targetAudience}`,
          model: 'gpt-4',
          generatedAt: new Date(),
          isGenerated: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'blogs'), blogData);
      console.log('Blog saved to Firestore with ID:', docRef.id);

      // Publish to selected platforms
      for (const platform of selectedPlatforms) {
        try {
          if (platform === 'shopify') {
            if (!selectedStore) {
              publishResults.push({ 
                platform: 'Shopify', 
                success: false, 
                error: 'No store selected. Please select a store to publish to Shopify.' 
              });
            } else {
              const store = stores.find(s => s.id === selectedStore);
              if (!store) {
                publishResults.push({ 
                  platform: 'Shopify', 
                  success: false, 
                  error: 'Selected store not found. Please refresh and try again.' 
                });
              } else {
                const res = await fetch('/api/shopify/publish-blog', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    shop: store.storeUrl,
                    title,
                    body_html: marked.parse(content),
                    userId: user?.uid,
                  }),
                });

                if (res.ok) {
                  const result = await res.json();
                  publishResults.push({ platform: 'Shopify', success: true, data: result });
                } else {
                  const errorData = await res.json().catch(() => ({}));
                  publishResults.push({ 
                    platform: 'Shopify', 
                    success: false, 
                    error: errorData.error || 'Failed to publish to Shopify' 
                  });
                }
              }
            }
          } else if (platform === 'wordpress') {
            const wordpressConfig = platformConfigs.find(p => p.id === 'wordpress');
            if (!wordpressConfig?.enabled) {
              publishResults.push({ 
                platform: 'WordPress', 
                success: false, 
                error: 'WordPress is not enabled. Please enable and configure WordPress in Settings.' 
              });
            } else if (!wordpressConfig.credentials?.url) {
              publishResults.push({ 
                platform: 'WordPress', 
                success: false, 
                error: 'WordPress credentials not configured. Please add your site URL and credentials in Settings.' 
              });
            } else {
              const res = await fetch('/api/wordpress/publish', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  title,
                  content: marked.parse(content),
                  excerpt,
                  tags: keywords,
                  categories: [blogObjective],
                  credentials: wordpressConfig.credentials,
                }),
              });

              if (res.ok) {
                const result = await res.json();
                publishResults.push({ platform: 'WordPress', success: true, data: result });
              } else {
                const errorData = await res.json().catch(() => ({}));
                publishResults.push({ 
                  platform: 'WordPress', 
                  success: false, 
                  error: errorData.error || 'Failed to publish to WordPress' 
                });
              }
            }
          } else if (platform === 'medium') {
            const mediumConfig = platformConfigs.find(p => p.id === 'medium');
            if (!mediumConfig?.enabled) {
              publishResults.push({ 
                platform: 'Medium', 
                success: false, 
                error: 'Medium is not enabled. Please enable and configure Medium in Settings.' 
              });
            } else if (!mediumConfig.credentials?.apiKey) {
              publishResults.push({ 
                platform: 'Medium', 
                success: false, 
                error: 'Medium API key not configured. Please add your integration token in Settings.' 
              });
            } else {
              const res = await fetch('/api/medium/publish', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  title,
                  content: marked.parse(content),
                  tags: keywords,
                  apiKey: mediumConfig.credentials.apiKey,
                }),
              });

              if (res.ok) {
                const result = await res.json();
                publishResults.push({ platform: 'Medium', success: true, data: result });
              } else {
                const errorData = await res.json().catch(() => ({}));
                publishResults.push({ 
                  platform: 'Medium', 
                  success: false, 
                  error: errorData.error || 'Failed to publish to Medium' 
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error publishing to ${platform}:`, error);
          publishResults.push({ 
            platform: platform.charAt(0).toUpperCase() + platform.slice(1), 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      // Show results
      const successCount = publishResults.filter(r => r.success).length;
      const totalCount = publishResults.length;
      
      if (successCount === totalCount) {
        alert(`Blog published successfully to all ${totalCount} platform(s)!`);
      } else if (successCount > 0) {
        const failedPlatforms = publishResults.filter(r => !r.success);
        const failedMessages = failedPlatforms.map(p => `${p.platform}: ${p.error}`).join('\n');
        alert(`Blog published to ${successCount} out of ${totalCount} platforms.\n\nFailed platforms:\n${failedMessages}`);
      } else {
        const failedMessages = publishResults.map(p => `${p.platform}: ${p.error}`).join('\n');
        alert(`Failed to publish to any platform:\n\n${failedMessages}\n\nPlease check your settings and try again.`);
      }

      console.log('Publishing results:', publishResults);

      // Reset form and refresh data
      setGeneratedBlog(null);
      setTopic('');
      setKeywords([]);
      setSelectedProduct('');
      
             // Try to refresh blog list, but don't fail if it doesn't work
       try {
         // Check if user and user.email exist before making queries
         if (!user?.email) {
           console.log('User email not available, skipping blog list refresh after publishing');
           return;
         }

         const blogsQuery = query(
           collection(db, 'blogs'),
           where('author.email', '==', user.email),
           limit(50)
         );
        
        const blogsSnapshot = await getDocs(blogsQuery);
        const blogsData = blogsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          publishedAt: doc.data().publishedAt?.toDate(),
        })) as BlogPost[];
        
        // Sort by createdAt in JavaScript instead of Firestore
        blogsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setBlogs(blogsData);
        console.log('Blog list refreshed after publishing');
      } catch (refreshError) {
        console.warn('Failed to refresh blog list, but blog was published:', refreshError);
        // Don't show error to user since the blog was published successfully
      }

    } catch (error) {
      console.error('Error publishing blog:', error);
      alert('An unexpected error occurred while publishing.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Calculate real statistics
  const blogsThisWeek = blogs.filter(blog => {
    const createdAt = new Date(blog.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return createdAt > oneWeekAgo;
  });

  const publishedBlogs = blogs.filter(blog => blog.status === 'published');
  const draftBlogs = blogs.filter(blog => blog.status === 'draft');
  const totalViews = publishedBlogs.reduce((sum, blog) => sum + (blog.analytics?.views || 0), 0);
  const totalShares = publishedBlogs.reduce((sum, blog) => sum + (blog.analytics?.shares || 0), 0);
  const avgEngagement = publishedBlogs.length > 0 
    ? publishedBlogs.reduce((sum, blog) => sum + (blog.analytics?.engagement || 0), 0) / publishedBlogs.length 
    : 0;
  const topBlog = publishedBlogs.length > 0 
    ? publishedBlogs.reduce((prev, current) => 
        (prev.analytics?.views || 0) > (current.analytics?.views || 0) ? prev : current
      ) 
    : null;

  const platformData = [
    { 
      name: 'Shopify', 
      value: blogs.filter(b => b.platform === 'shopify').length, 
      color: '#10B981' 
    },
    { 
      name: 'WordPress', 
      value: blogs.filter(b => b.platform === 'wordpress').length, 
      color: '#F59E0B' 
    },
    { 
      name: 'Medium', 
      value: blogs.filter(b => b.platform === 'medium').length, 
      color: '#8B5CF6' 
    },
    { 
      name: 'Multiple', 
      value: blogs.filter(b => b.platform === 'multiple').length, 
      color: '#EC4899' 
    },
  ].filter(item => item.value > 0);

  const performanceData = [
    { 
      name: 'Product Reviews', 
      posts: blogs.filter(b => b.categories.includes('Product Promotion')).length,
      engagement: blogs.filter(b => b.categories.includes('Product Promotion'))
        .reduce((sum, b) => sum + (b.analytics?.engagement || 0), 0) / 
        Math.max(blogs.filter(b => b.categories.includes('Product Promotion')).length, 1) * 100
    },
    { 
      name: 'How-to Guides', 
      posts: blogs.filter(b => b.categories.includes('Educational')).length,
      engagement: blogs.filter(b => b.categories.includes('Educational'))
        .reduce((sum, b) => sum + (b.analytics?.engagement || 0), 0) / 
        Math.max(blogs.filter(b => b.categories.includes('Educational')).length, 1) * 100
    },
    { 
      name: 'Trend Articles', 
      posts: blogs.filter(b => b.categories.includes('Trend Highlight')).length,
      engagement: blogs.filter(b => b.categories.includes('Trend Highlight'))
        .reduce((sum, b) => sum + (b.analytics?.engagement || 0), 0) / 
        Math.max(blogs.filter(b => b.categories.includes('Trend Highlight')).length, 1) * 100
    },
    { 
      name: 'Use Cases', 
      posts: blogs.filter(b => b.categories.includes('Use Case Story')).length,
      engagement: blogs.filter(b => b.categories.includes('Use Case Story'))
        .reduce((sum, b) => sum + (b.analytics?.engagement || 0), 0) / 
        Math.max(blogs.filter(b => b.categories.includes('Use Case Story')).length, 1) * 100
    },
  ];

  const renderDashboard = () => (
    <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="font-medium ml-3 text-purple-200">Blogs This Week</h3>
            </div>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            {blogsThisWeek.length}
          </p>
          <p className="text-sm text-gray-400">+{Math.round(blogsThisWeek.length * 0.2)} from last week</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 rounded-xl shadow-lg">
                <Edit3 className="h-6 w-6 text-yellow-300" />
              </div>
              <h3 className="font-medium ml-3 text-yellow-200">Draft Blogs</h3>
            </div>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
            {draftBlogs.length}
          </p>
          <p className="text-sm text-gray-400">Ready to publish</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-600/30 to-green-800/30 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-green-300" />
              </div>
              <h3 className="font-medium ml-3 text-green-200">Avg Engagement</h3>
            </div>
            <span className="text-green-400 flex items-center text-sm bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
              +{Math.round(avgEngagement * 1000) / 10}%
              <TrendingUp className="h-4 w-4 ml-1" />
            </span>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
            {(avgEngagement * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-400">Average across all blogs</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-xl shadow-lg">
                <Eye className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="font-medium ml-3 text-blue-200">Total Views</h3>
            </div>
            <span className="text-green-400 flex items-center text-sm bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
              +{Math.round(avgEngagement * 100)}%
              <TrendingUp className="h-4 w-4 ml-1" />
            </span>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
            {totalViews.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400">
            Avg {Math.round(totalViews / Math.max(blogs.length, 1))} views per blog
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-600/30 to-orange-800/30 rounded-xl shadow-lg">
                <Share2 className="h-6 w-6 text-orange-300" />
              </div>
              <h3 className="font-medium ml-3 text-orange-200">Total Shares</h3>
            </div>
            <span className="text-green-400 flex items-center text-sm bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
              +{totalShares}
              <TrendingUp className="h-4 w-4 ml-1" />
            </span>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-2">
            {totalShares.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400">
            Avg {Math.round(totalShares / Math.max(blogs.length, 1))} shares per blog
          </p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Blog Performance Trends
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={blogMetrics}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3D3A6E" opacity={0.3} />
                <XAxis dataKey="date" stroke="#A78BFA" fontSize={12} />
                <YAxis stroke="#A78BFA" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 27, 75, 0.95)',
                    borderColor: '#3D3A6E',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorEngagement)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Publishing Platforms
          </h2>
          <div className="h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 27, 75, 0.95)',
                    borderColor: '#3D3A6E',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {platformData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2 shadow-lg" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Content Performance */}
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Content Type Performance
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3D3A6E" opacity={0.3} />
              <XAxis dataKey="name" stroke="#A78BFA" fontSize={12} />
              <YAxis stroke="#A78BFA" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 27, 75, 0.95)',
                  borderColor: '#3D3A6E',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              />
              <Bar 
                dataKey="engagement" 
                fill="url(#barGradient)" 
                radius={[4, 4, 0, 0]}
                stroke="#8B5CF6"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Performing Blog */}
      {topBlog && (
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Top Performing Blog
          </h2>
          <div className="bg-gradient-to-br from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-xl border border-[#3D3A6E] p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{topBlog.title}</h3>
                <p className="text-gray-300 mb-4">{topBlog.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(topBlog.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {topBlog.platform}
                  </span>
                  {topBlog.storeName && (
                    <span className="flex items-center gap-1">
                      <Store className="h-4 w-4" />
                      {topBlog.storeName}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Views:</span>
                    <span className="text-blue-400 ml-2 font-semibold">
                      {topBlog.analytics?.views?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Shares:</span>
                    <span className="text-green-400 ml-2 font-semibold">
                      {topBlog.analytics?.shares?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Engagement:</span>
                    <span className="text-purple-400 ml-2 font-semibold">
                      {((topBlog.analytics?.engagement || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">CTR:</span>
                    <span className="text-orange-400 ml-2 font-semibold">
                      {((topBlog.analytics?.ctr || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-purple-300 border-purple-300 hover:bg-purple-600/20">
                <Eye className="h-4 w-4 mr-2" />
                View Blog
              </Button>
              <Button variant="outline" size="sm" className="text-blue-300 border-blue-300 hover:bg-blue-600/20">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-green-300 border-green-300 hover:bg-green-600/20">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Real Store Products Summary */}
      {allStoreProducts.length > 0 && (
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Available Products for Blog Generation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.slice(0, 3).map(store => {
              const storeProducts = allStoreProducts.filter(p => p.storeId === store.id);
              return (
                <div key={store.id} className="bg-gradient-to-br from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-xl border border-[#3D3A6E] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <h3 className="font-semibold text-white">{store.storeName}</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-400 mb-2">{storeProducts.length}</p>
                  <p className="text-sm text-gray-400 mb-3">Products available</p>
                  {storeProducts.slice(0, 2).map(product => (
                    <div key={product.id} className="text-xs text-gray-300 mb-1">
                      • {product.title}
                    </div>
                  ))}
                  {storeProducts.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{storeProducts.length - 2} more products
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );

  const renderCreateBlog = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Blog Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Store Selection */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-purple-200">Select Store</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-700 bg-[#1E1B4B]/70 text-white backdrop-blur-sm"
              value={selectedStore} 
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              <option value="">Choose a store...</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.storeName}</option>
              ))}
            </select>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-purple-200">Select Product (Optional)</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-700 bg-[#1E1B4B]/70 text-white backdrop-blur-sm"
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Choose a product...</option>
              {getStoreProducts(selectedStore).map(product => (
                <option key={product.id} value={product.title}>{product.title}</option>
              ))}
            </select>
          </div>

          {/* Blog Topic */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-semibold text-purple-200">Blog Topic</label>
            <Input
              placeholder="Enter your blog topic or let AI generate from product..."
              className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm h-12 rounded-xl"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Blog Objective */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-purple-200">Blog Objective</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-700 bg-[#1E1B4B]/70 text-white backdrop-blur-sm"
              value={blogObjective} 
              onChange={(e) => setBlogObjective(e.target.value)}
            >
              <option>Product Promotion</option>
              <option>Educational</option>
              <option>Trend Highlight</option>
              <option>How-to Guide</option>
              <option>Use Case Story</option>
              <option>Brand Awareness</option>
            </select>
          </div>

          {/* Tone */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-purple-200">Tone of Voice</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-700 bg-[#1E1B4B]/70 text-white backdrop-blur-sm"
              value={tone} 
              onChange={(e) => setTone(e.target.value)}
            >
              <option>Friendly & Persuasive</option>
              <option>Professional</option>
              <option>Humorous</option>
              <option>Inspirational</option>
              <option>Authoritative</option>
              <option>Conversational</option>
            </select>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-purple-200">Target Audience</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-700 bg-[#1E1B4B]/70 text-white backdrop-blur-sm"
              value={targetAudience} 
              onChange={(e) => setTargetAudience(e.target.value)}
            >
              <option>General Consumers</option>
              <option>Young Adults (18-30)</option>
              <option>Professionals</option>
              <option>Parents</option>
              <option>Tech Enthusiasts</option>
              <option>Health Conscious</option>
            </select>
          </div>

          {/* Length */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-purple-200">Content Length</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-700 bg-[#1E1B4B]/70 text-white backdrop-blur-sm"
              value={length} 
              onChange={(e) => setLength(e.target.value)}
            >
              <option>Short (300-500 words)</option>
              <option>Medium (500-800 words)</option>
              <option>Long-form (800+ words)</option>
            </select>
          </div>

          {/* Keywords */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-semibold text-purple-200">Keywords</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add keywords..."
                className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm flex-1"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              />
              <Button 
                onClick={handleAddKeyword}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span 
                  key={index}
                  className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-purple-400/30"
                >
                  {keyword}
                  <button 
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-purple-200">Call to Action</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-700 bg-[#1E1B4B]/70 text-white backdrop-blur-sm"
              value={cta} 
              onChange={(e) => setCTA(e.target.value)}
            >
              <option>Shop Now</option>
              <option>Learn More</option>
              <option>Subscribe</option>
              <option>Explore More</option>
              <option>Get Started</option>
              <option>Contact Us</option>
            </select>
          </div>

          {/* Publishing Platforms */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-purple-200">Publishing Platforms</label>
            <div className="space-y-2">
              {platformConfigs.map(platform => (
                <label key={platform.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, platform.id]);
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                      }
                    }}
                    disabled={!platform.enabled}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className={`text-sm ${platform.enabled ? 'text-white' : 'text-gray-500'}`}>
                    {platform.name}
                    {!platform.enabled && ' (Not configured)'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            onClick={handleGenerateBlog}
            disabled={isGenerating || (!topic && !selectedProduct)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Generate Blog Post
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );

    const renderManageBlogs = () => {
    const filteredBlogs = blogs.filter(blog => {
      if (blogFilter === 'all') return true;
      return blog.status === blogFilter;
    });

    const publishDraft = async (blog: BlogPost) => {
      try {
        // Update blog status to published
        await updateDoc(doc(db, 'blogs', blog.id), {
          status: 'published',
          publishedAt: new Date(),
          updatedAt: new Date(),
        });

        // Try to refresh blog list, but don't fail if it doesn't work
        try {
          // Check if user and user.email exist before making queries
          if (!user?.email) {
            console.log('User email not available, skipping blog list refresh');
            alert('Blog published successfully!');
            return;
          }

          const blogsQuery = query(
            collection(db, 'blogs'),
            where('author.email', '==', user.email),
            limit(50)
          );
          
          const blogsSnapshot = await getDocs(blogsQuery);
          const blogsData = blogsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
            publishedAt: doc.data().publishedAt?.toDate(),
          })) as BlogPost[];
          
          // Sort by createdAt in JavaScript instead of Firestore
          blogsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          setBlogs(blogsData);
          console.log('Blog list refreshed after publishing');
        } catch (refreshError) {
          console.warn('Failed to refresh blog list, but blog was published:', refreshError);
          // Don't show error to user since the blog was published successfully
        }
        
        alert('Blog published successfully!');
        
      } catch (error) {
        console.error('Error publishing blog:', error);
        alert('Failed to publish blog. Please try again.');
      }
    };

    return (
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-purple-300 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Manage Blogs
          </h2>
          
          <div className="flex gap-2">
            <Button
              variant={blogFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBlogFilter('all')}
              className={blogFilter === 'all' ? 'bg-purple-600' : 'text-purple-300 border-purple-300'}
            >
              All ({blogs.length})
            </Button>
            <Button
              variant={blogFilter === 'published' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBlogFilter('published')}
              className={blogFilter === 'published' ? 'bg-green-600' : 'text-green-300 border-green-300'}
            >
              Published ({publishedBlogs.length})
            </Button>
            <Button
              variant={blogFilter === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBlogFilter('draft')}
              className={blogFilter === 'draft' ? 'bg-yellow-600' : 'text-yellow-300 border-yellow-300'}
            >
              Drafts ({draftBlogs.length})
            </Button>
          </div>
        </div>
        
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {blogFilter === 'all' ? 'No blogs found' : `No ${blogFilter} blogs found`}
            </p>
            <p className="text-gray-500 text-sm">Create your first blog to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBlogs.map((blog, index) => (
                <div
                  key={blog.id || index}
                className="p-4 bg-gradient-to-br from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-xl border border-[#3D3A6E] backdrop-blur-sm hover:bg-[#1E1B4B]/80 transition-all duration-300 transform hover:scale-102 shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg text-white line-clamp-2">{blog.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs border ${
                    blog.status === 'published' 
                      ? 'bg-green-400/20 text-green-400 border-green-400/30'
                      : 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30'
                  }`}>
                    {blog.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                  {blog.excerpt}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.ceil(blog.content.split(' ').length / 200) || 3} min read
                    </span>
                    {blog.platform && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {blog.platform}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-purple-300 border-purple-300 hover:bg-purple-600/20">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-300 border-blue-300 hover:bg-blue-600/20">
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  {blog.status === 'draft' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => publishDraft(blog)}
                      className="text-green-300 border-green-300 hover:bg-green-600/20"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Publish
                    </Button>
                  )}
                  {blog.status === 'published' && blog.analytics && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{blog.analytics.views || 0} views</span>
                      <span>{blog.analytics.shares || 0} shares</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Platform Configuration
        </h2>
        
        <div className="space-y-6">
          {platformConfigs.map(platform => (
            <div key={platform.id} className="bg-gradient-to-br from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-xl border border-[#3D3A6E] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${platform.enabled ? 'bg-green-400' : 'bg-red-400'}`} />
                  <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updatedConfigs = platformConfigs.map(p => 
                      p.id === platform.id ? { ...p, enabled: !p.enabled } : p
                    );
                    setPlatformConfigs(updatedConfigs);
                  }}
                  className={platform.enabled ? 'text-red-300 border-red-300' : 'text-green-300 border-green-300'}
                >
                  {platform.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
              
              {platform.id === 'shopify' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">
                    Shopify integration uses your connected store credentials. No additional setup required.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Default Category</label>
                      <Input
                        placeholder="e.g., News, Updates"
                        value={platform.settings?.defaultCategory || ''}
                        onChange={(e) => {
                          const updatedConfigs = platformConfigs.map(p => 
                            p.id === platform.id 
                              ? { ...p, settings: { ...p.settings, defaultCategory: e.target.value } }
                              : p
                          );
                          setPlatformConfigs(updatedConfigs);
                        }}
                        className="bg-[#1E1B4B]/70 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Auto Publish</label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={platform.settings?.autoPublish || false}
                          onChange={(e) => {
                            const updatedConfigs = platformConfigs.map(p => 
                              p.id === platform.id 
                                ? { ...p, settings: { ...p.settings, autoPublish: e.target.checked } }
                                : p
                            );
                            setPlatformConfigs(updatedConfigs);
                          }}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-300">Automatically publish generated blogs</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              {platform.id === 'wordpress' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">
                    Configure your WordPress site credentials to enable publishing.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Site URL</label>
                      <Input
                        placeholder="https://yoursite.com"
                        value={platform.credentials?.url || ''}
                        onChange={(e) => {
                          const updatedConfigs = platformConfigs.map(p => 
                            p.id === platform.id 
                              ? { ...p, credentials: { ...p.credentials, url: e.target.value } }
                              : p
                          );
                          setPlatformConfigs(updatedConfigs);
                        }}
                        className="bg-[#1E1B4B]/70 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                      <Input
                        placeholder="WordPress username"
                        value={platform.credentials?.username || ''}
                        onChange={(e) => {
                          const updatedConfigs = platformConfigs.map(p => 
                            p.id === platform.id 
                              ? { ...p, credentials: { ...p.credentials, username: e.target.value } }
                              : p
                          );
                          setPlatformConfigs(updatedConfigs);
                        }}
                        className="bg-[#1E1B4B]/70 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Application Password</label>
                      <Input
                        type="password"
                        placeholder="WordPress app password"
                        value={platform.credentials?.password || ''}
                        onChange={(e) => {
                          const updatedConfigs = platformConfigs.map(p => 
                            p.id === platform.id 
                              ? { ...p, credentials: { ...p.credentials, password: e.target.value } }
                              : p
                          );
                          setPlatformConfigs(updatedConfigs);
                        }}
                        className="bg-[#1E1B4B]/70 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Default Category</label>
                      <Input
                        placeholder="e.g., Blog, News"
                        value={platform.settings?.defaultCategory || ''}
                        onChange={(e) => {
                          const updatedConfigs = platformConfigs.map(p => 
                            p.id === platform.id 
                              ? { ...p, settings: { ...p.settings, defaultCategory: e.target.value } }
                              : p
                          );
                          setPlatformConfigs(updatedConfigs);
                        }}
                        className="bg-[#1E1B4B]/70 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-300 border-blue-300 hover:bg-blue-600/20"
                    >
                      Test Connection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-300 border-green-300 hover:bg-green-600/20"
                    >
                      Save Configuration
                    </Button>
                  </div>
                </div>
              )}
              
              {platform.id === 'medium' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">
                    Configure Medium integration token for publishing.
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Integration Token</label>
                      <Input
                        type="password"
                        placeholder="Medium integration token"
                        value={platform.credentials?.apiKey || ''}
                        onChange={(e) => {
                          const updatedConfigs = platformConfigs.map(p => 
                            p.id === platform.id 
                              ? { ...p, credentials: { ...p.credentials, apiKey: e.target.value } }
                              : p
                          );
                          setPlatformConfigs(updatedConfigs);
                        }}
                        className="bg-[#1E1B4B]/70 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-300 border-blue-300 hover:bg-blue-600/20"
                    >
                      Test Connection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-300 border-green-300 hover:bg-green-600/20"
                    >
                      Save Configuration
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] via-[#2D2A5E] to-[#1E1B4B] p-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                AutoBlogGen
              </h1>
              <p className="text-gray-400 mt-2 text-lg">AI-Powered Blog & Content Automation</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setActiveView('dashboard')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  activeView === 'dashboard'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-transparent text-purple-300 hover:bg-purple-600/20 border-purple-400/30'
                }`}
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('create')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  activeView === 'create'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-transparent text-purple-300 hover:bg-purple-600/20 border-purple-400/30'
                }`}
              >
                Create Blog
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('manage')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  activeView === 'manage'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-transparent text-purple-300 hover:bg-purple-600/20 border-purple-400/30'
                }`}
              >
                Manage Blogs
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('settings')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  activeView === 'settings'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-transparent text-purple-300 hover:bg-purple-600/20 border-purple-400/30'
                }`}
              >
                Settings
              </Button>
            </div>
          </div>

          {/* Dynamic Content */}
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'create' && renderCreateBlog()}
          {activeView === 'manage' && renderManageBlogs()}
          {activeView === 'settings' && renderSettings()}

          {/* Blog Preview Modal */}
          {generatedBlog && (
            <div 
              className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4"
              onClick={(e) => {
                // Close modal when clicking on backdrop
                if (e.target === e.currentTarget) {
                  setGeneratedBlog(null);
                  setEditing(false);
                }
              }}
            >
              <div 
                className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white text-black rounded-2xl shadow-2xl relative"
                onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking inside modal
              >
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
                  <h2 className="text-2xl font-bold text-purple-800">📰 Blog Preview</h2>
                  <div className="flex gap-3">
                    <Button 
                      onClick={async () => {
                        await handlePublishBlog();
                        // Close modal after successful publish
                        if (!isPublishing) {
                          setGeneratedBlog(null);
                          setEditing(false);
                        }
                      }} 
                      disabled={isPublishing}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Publish to Platforms
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={async () => {
                        await handleSaveDraft();
                        // Close modal after successful save
                        setGeneratedBlog(null);
                        setEditing(false);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Save as Draft
                    </Button>
                    <Button 
                      onClick={() => setEditing(!editing)} 
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {editing ? 'Preview' : 'Edit'}
                    </Button>
                    <Button 
                      onClick={() => {
                        setGeneratedBlog(null);
                        setEditing(false);
                      }} 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      title="Close (Esc)"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Close
                    </Button>
                  </div>
                </div>

                <div className="p-8">
                  {editing ? (
                    <MDEditor 
                      value={generatedBlog} 
                      onChange={(v: string | undefined) => setGeneratedBlog(v || '')} 
                      height={500}
                      data-color-mode="light"
                    />
                  ) : (
                    <div 
                      className="prose prose-lg max-w-full"
                      dangerouslySetInnerHTML={{ __html: marked.parse(generatedBlog || '') }} 
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 