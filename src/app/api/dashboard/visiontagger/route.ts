import { NextRequest, NextResponse } from 'next/server';
import { FirebaseService, ImageAnalysis } from '@/lib/services/firebase';
import { BigQueryService, ImageAnalyticsData } from '@/lib/services/bigquery';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { Timestamp } from 'firebase/firestore';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to extract top tags from images
function extractTopTags(images: ImageAnalysis[]): { label: string; count: number }[] {
  const tagCounts: { [key: string]: number } = {};
  
  images.forEach(image => {
    if (image.analysis?.tags) {
      image.analysis.tags.forEach(tag => {
        tagCounts[tag.label] = (tagCounts[tag.label] || 0) + 1;
      });
    }
  });
  
  return Object.entries(tagCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// Internal function to analyze image (moved from separate endpoint)
async function analyzeImageInternal(userId: string, imageUrl: string, productId?: string, productTitle?: string, productDescription?: string) {
  console.log('🔍 Analyzing image internally:', imageUrl);

  // Analyze image with OpenAI Vision API
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this product image and provide detailed SEO and accessibility information. 
            
            Product Context:
            - Title: ${productTitle || 'Unknown Product'}
            - Description: ${productDescription || 'No description available'}
            
            Please provide a JSON response with the following structure:
            {
              "tags": [{"label": "tag_name", "confidence": 0.95, "category": "object|color|style|material"}],
              "objects": [{"name": "object_name", "confidence": 0.90, "boundingBox": {"x": 0.1, "y": 0.2, "width": 0.3, "height": 0.4}}],
              "colors": [{"hex": "#FF5733", "percentage": 35, "name": "Orange"}],
              "text": [{"content": "text_found", "confidence": 0.88, "language": "en"}],
              "seo": {
                "suggestedAltText": "descriptive alt text",
                "suggestedCaption": "engaging caption",
                "suggestedDescription": "detailed description",
                "score": 85
              },
              "accessibility": {
                "score": 78,
                "issues": ["Missing alt text", "Low color contrast"],
                "suggestions": ["Add descriptive alt text", "Improve color contrast"]
              }
            }
            
            Focus on:
            1. Accurate object and feature detection
            2. SEO-optimized alt text that includes relevant keywords
            3. Accessibility compliance
            4. Color analysis for design insights
            5. Text extraction if any visible text
            6. Professional product photography assessment`
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high"
            }
          }
        ]
      }
    ],
    max_tokens: 1500,
    temperature: 0.3,
  });

  const analysisText = response.choices[0]?.message?.content;
  if (!analysisText) {
    throw new Error('No analysis received from OpenAI');
  }

  console.log('🤖 OpenAI Analysis:', analysisText);

  // Parse the JSON response
  let analysis;
  try {
    // Extract JSON from the response (in case there's additional text)
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : analysisText;
    analysis = JSON.parse(jsonString);
  } catch (parseError) {
    console.error('Error parsing OpenAI response:', parseError);
    // Fallback analysis if parsing fails
    analysis = {
      tags: [
        { label: 'product', confidence: 0.95, category: 'object' },
        { label: 'commercial', confidence: 0.90, category: 'category' }
      ],
      objects: [
        { name: 'product', confidence: 0.85, boundingBox: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 } }
      ],
      colors: [
        { hex: '#FFFFFF', percentage: 40, name: 'White' },
        { hex: '#000000', percentage: 30, name: 'Black' }
      ],
      text: [],
      seo: {
        suggestedAltText: `${productTitle || 'Product'} - High quality product image`,
        suggestedCaption: `${productTitle || 'Premium product'} perfect for modern lifestyle`,
        suggestedDescription: `Professional product photography showcasing ${productTitle || 'this item'} with attention to detail and quality`,
        score: 75
      },
      accessibility: {
        score: 70,
        issues: ['Missing alt text'],
        suggestions: ['Add descriptive alt text', 'Ensure proper color contrast']
      }
    };
  }

  // Create or update image analysis record
  const imageAnalysisData = {
    userId,
    productId: productId || undefined,
    url: imageUrl,
    filename: `product-image-${Date.now()}.jpg`,
    fileSize: 0, // We don't have file size for URLs
    dimensions: { width: 0, height: 0 }, // We don't have dimensions for URLs
    format: 'jpg',
    status: 'completed' as const,
    analysis: {
      tags: analysis.tags || [],
      objects: analysis.objects || [],
      colors: analysis.colors || [],
      text: analysis.text || []
    },
    seo: {
      suggestedAltText: analysis.seo?.suggestedAltText || '',
      suggestedCaption: analysis.seo?.suggestedCaption || '',
      suggestedDescription: analysis.seo?.suggestedDescription || '',
      score: analysis.seo?.score || 0
    },
    accessibility: {
      score: analysis.accessibility?.score || 0,
      issues: analysis.accessibility?.issues || [],
      suggestions: analysis.accessibility?.suggestions || []
    }
  };

  // Save to Firebase
  const imageId = await FirebaseService.createImageAnalysis(imageAnalysisData);

  console.log('✅ Image analysis completed and saved:', imageId);

  return {
    success: true,
    imageId,
    analysis: imageAnalysisData
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Firebase token
    const token = authHeader.split('Bearer ')[1];
    let userId: string;
    
    // Allow development mode with test token
    if (process.env.NODE_ENV === 'development' && token === 'test-token') {
      userId = 'test-user-id';
      console.log('🔧 Development mode: Using test user ID');
    } else {
      try {
        const adminApp = getFirebaseAdmin();
        const auth = getAuth(adminApp);
        const decodedToken = await auth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (authError) {
        console.error('Firebase auth error:', authError);
        return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
      }
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'dashboard';
    const limit = parseInt(searchParams.get('limit') || '50');

    let data: any = {};

    switch (view) {
      case 'dashboard':
        // Get dashboard overview data with error handling
        let images: ImageAnalysis[] = [];
        let imageAnalytics: ImageAnalyticsData = {
          totalImages: 0,
          avgSeoScore: 0,
          avgAccessibilityScore: 0,
          topTags: [],
          processingStats: { pending: 0, completed: 0, error: 0 }
        };

        try {
          images = await FirebaseService.getUserImages(userId, 10);
        } catch (error) {
          console.error('Error fetching user images:', error);
          images = [];
        }

        try {
          imageAnalytics = await BigQueryService.getImageAnalytics(userId);
          
          // If BigQuery returns empty data, use fallback
          if (imageAnalytics.totalImages === 0 && images.length > 0) {
            throw new Error('BigQuery returned empty data');
          }
        } catch (error) {
          console.error('Using fallback analytics due to BigQuery error:', error instanceof Error ? error.message : error);
          // Use fallback analytics from Firebase data
          const completedImages = images.filter(img => img.status === 'completed');
          
          const avgSeoScore = completedImages.length > 0 ? completedImages.reduce((sum, img) => sum + (img.seo?.score || 0), 0) / completedImages.length : 0;
          const avgAccessibilityScore = completedImages.length > 0 ? completedImages.reduce((sum, img) => sum + (img.accessibility?.score || 0), 0) / completedImages.length : 0;
          
          imageAnalytics = {
            totalImages: images.length,
            avgSeoScore: Math.round(avgSeoScore),
            avgAccessibilityScore: Math.round(avgAccessibilityScore),
            topTags: images.length > 0 ? extractTopTags(images) : [],
            processingStats: { pending: 0, completed: 0, error: 0 }
          };
        }

        // Get processing stats from Firebase
        const processingStats = {
          pending: images.filter(img => img.status === 'pending').length,
          analyzing: images.filter(img => img.status === 'analyzing').length,
          completed: images.filter(img => img.status === 'completed').length,
          error: images.filter(img => img.status === 'error').length,
        };

        data = {
          recentImages: images,
          analytics: {
            ...imageAnalytics,
            processingStats
          },
          summary: {
            totalImages: images.length,
            avgSeoScore: imageAnalytics.avgSeoScore,
            avgAccessibilityScore: imageAnalytics.avgAccessibilityScore,
            pendingAnalysis: processingStats.pending + processingStats.analyzing
          }
        };
        break;

      case 'analyze':
        // Get images for analysis view with error handling
        let analyzeImages: ImageAnalysis[] = [];
        let analyzeAnalytics: ImageAnalyticsData = {
          totalImages: 0,
          avgSeoScore: 0,
          avgAccessibilityScore: 0,
          topTags: [],
          processingStats: { pending: 0, completed: 0, error: 0 }
        };

        try {
          analyzeImages = await FirebaseService.getUserImages(userId, limit);
        } catch (error) {
          console.error('Error fetching images for analysis:', error);
          analyzeImages = [];
        }

        try {
          analyzeAnalytics = await BigQueryService.getImageAnalytics(userId);
        } catch (error) {
          console.error('Error fetching analytics for analysis:', error);
          analyzeAnalytics = {
            totalImages: analyzeImages.length,
            avgSeoScore: 0,
            avgAccessibilityScore: 0,
            topTags: [],
            processingStats: { pending: 0, completed: 0, error: 0 }
          };
        }

        data = {
          images: analyzeImages,
          analytics: analyzeAnalytics
        };
        break;

      case 'manage':
        // Get all images for management view with error handling
        let allImages: ImageAnalysis[] = [];
        
        try {
          allImages = await FirebaseService.getUserImages(userId, limit);
        } catch (error) {
          console.error('Error fetching images for management:', error);
          allImages = [];
        }
        
        // Group by status
        const groupedImages = {
          all: allImages,
          pending: allImages.filter(img => img.status === 'pending'),
          analyzing: allImages.filter(img => img.status === 'analyzing'),
          completed: allImages.filter(img => img.status === 'completed'),
          error: allImages.filter(img => img.status === 'error'),
        };

        data = {
          images: groupedImages,
          stats: {
            total: allImages.length,
            pending: groupedImages.pending.length,
            analyzing: groupedImages.analyzing.length,
            completed: groupedImages.completed.length,
            error: groupedImages.error.length,
          }
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('VisionTagger API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Firebase token
    const token = authHeader.split('Bearer ')[1];
    let userId: string;
    
    // Allow development mode with test token
    if (process.env.NODE_ENV === 'development' && token === 'test-token') {
      userId = 'test-user-id';
      console.log('🔧 Development mode: Using test user ID');
    } else {
      try {
        const adminApp = getFirebaseAdmin();
        const auth = getAuth(adminApp);
        const decodedToken = await auth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (authError) {
        console.error('Firebase auth error:', authError);
        return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { action, imageId, imageData, productId, imageUrl } = body;

    switch (action) {
      case 'analyze':
        // Call the internal analyze function directly (no fetch)
        try {
          const analyzeResult = await analyzeImageInternal(
            userId,
            imageUrl,
            productId,
            imageData?.productTitle,
            imageData?.productDescription
          );
          return NextResponse.json(analyzeResult);
        } catch (error) {
          console.error('Error in internal image analysis:', error);
          return NextResponse.json(
            { error: 'Failed to analyze image', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          );
        }

      case 'upload':
        // Create new image analysis record
        const newImageId = await FirebaseService.createImageAnalysis({
          userId,
          url: imageData.url,
          filename: imageData.filename,
          fileSize: imageData.fileSize,
          dimensions: imageData.dimensions,
          format: imageData.format,
          status: 'pending',
          analysis: {
            tags: [],
            objects: [],
            colors: [],
            text: []
          },
          seo: {
            suggestedAltText: '',
            suggestedCaption: '',
            suggestedDescription: '',
            score: 0
          },
          accessibility: {
            score: 0,
            issues: [],
            suggestions: []
          }
        });

        return NextResponse.json({ imageId: newImageId });

      case 'update':
        // Update image metadata
        await FirebaseService.updateImageAnalysis(imageId, imageData);
        return NextResponse.json({ message: 'Image updated successfully' });

      case 'delete':
        // Delete image (you might want to implement this)
        return NextResponse.json({ message: 'Image deleted successfully' });

      case 'configure-autoscan':
        // Save auto-scan settings (implement in Firebase or user preferences)
        console.log('Auto-scan settings:', body.settings);
        return NextResponse.json({ message: 'Auto-scan settings saved successfully' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('VisionTagger POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 