import { NextRequest, NextResponse } from 'next/server';
import { FirebaseService } from '@/lib/services/firebase';
import { BigQueryService } from '@/lib/services/bigquery';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { Timestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Firebase token
    const token = authHeader.split('Bearer ')[1];
    const adminApp = getFirebaseAdmin();
    const auth = getAuth(adminApp);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'dashboard';
    const limit = parseInt(searchParams.get('limit') || '50');

    let data: any = {};

    switch (view) {
      case 'dashboard':
        // Get dashboard overview data
        const [images, imageAnalytics] = await Promise.all([
          FirebaseService.getUserImages(userId, 10), // Recent images
          BigQueryService.getImageAnalytics(userId)
        ]);

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
        // Get images for analysis view
        data = {
          images: await FirebaseService.getUserImages(userId, limit),
          analytics: await BigQueryService.getImageAnalytics(userId)
        };
        break;

      case 'manage':
        // Get all images for management view
        const allImages = await FirebaseService.getUserImages(userId, limit);
        
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
    const adminApp = getFirebaseAdmin();
    const auth = getAuth(adminApp);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { action, imageId, imageData } = body;

    switch (action) {
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

      case 'analyze':
        // Update image status to analyzing
        await FirebaseService.updateImageAnalysis(imageId, {
          status: 'analyzing'
        });

        // Here you would trigger the actual AI analysis
        // For now, we'll simulate it with mock data
        setTimeout(async () => {
          await FirebaseService.updateImageAnalysis(imageId, {
            status: 'completed',
            analysis: {
              tags: [
                { label: 'product', confidence: 0.95, category: 'object' },
                { label: 'fashion', confidence: 0.87, category: 'category' },
                { label: 'clothing', confidence: 0.92, category: 'type' }
              ],
              objects: [
                {
                  name: 'shirt',
                  confidence: 0.89,
                  boundingBox: { x: 0.1, y: 0.2, width: 0.6, height: 0.7 }
                }
              ],
              colors: [
                { hex: '#FF5733', percentage: 35, name: 'Orange' },
                { hex: '#3366FF', percentage: 25, name: 'Blue' },
                { hex: '#FFFFFF', percentage: 40, name: 'White' }
              ]
            },
            seo: {
              suggestedAltText: 'Orange and blue shirt on white background',
              suggestedCaption: 'Stylish casual shirt perfect for everyday wear',
              suggestedDescription: 'High-quality cotton shirt with modern design',
              score: 85
            },
            accessibility: {
              score: 78,
              issues: ['Missing alt text', 'Low color contrast'],
              suggestions: ['Add descriptive alt text', 'Improve color contrast']
            },
                         analyzedAt: Timestamp.now()
          });
        }, 2000);

        return NextResponse.json({ message: 'Analysis started' });

      case 'update':
        // Update image metadata
        await FirebaseService.updateImageAnalysis(imageId, imageData);
        return NextResponse.json({ message: 'Image updated successfully' });

      case 'delete':
        // Delete image (you might want to implement this)
        return NextResponse.json({ message: 'Image deleted successfully' });

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