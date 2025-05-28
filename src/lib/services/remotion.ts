import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { getCompositions } from '@remotion/renderer';
import * as THREE from 'three';
import path from 'path';
import fs from 'fs/promises';

export interface CreativeGenerationRequest {
  template: 'product-showcase' | 'brand-story' | 'testimonial' | 'how-to' | 'social-proof' | 'announcement';
  platform: 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'linkedin' | 'twitter';
  duration: number; // in seconds (30-90)
  assets: {
    images: string[]; // URLs to product images
    logo?: string; // Brand logo URL
    backgroundMusic?: string; // Background music URL
  };
  content: {
    headline: string;
    subheadline?: string;
    description: string;
    callToAction: string;
    brandName: string;
    brandColors: {
      primary: string;
      secondary: string;
      accent?: string;
    };
  };
  style: {
    theme: 'modern' | 'minimal' | 'bold' | 'elegant' | 'playful' | 'professional';
    animation: 'smooth' | 'dynamic' | 'subtle' | 'energetic';
    typography: 'sans-serif' | 'serif' | 'display' | 'script';
  };
  specifications: {
    width: number;
    height: number;
    fps: number;
    format: 'mp4' | 'webm' | 'gif';
    quality: 'high' | 'medium' | 'low';
  };
}

export interface GeneratedCreative {
  id: string;
  url: string;
  thumbnail: string;
  duration: number;
  fileSize: number;
  format: string;
  specifications: {
    width: number;
    height: number;
    fps: number;
  };
  metadata: {
    template: string;
    platform: string;
    generatedAt: Date;
    renderTime: number; // in seconds
  };
}

type PlatformSpecs = {
  [key: string]: {
    width: number;
    height: number;
    fps: number;
    format: 'mp4' | 'webm' | 'gif';
    quality: 'high' | 'medium' | 'low';
  };
};

type CompositionMap = {
  [key: string]: string;
};

type CodecMap = {
  [key: string]: 'h264' | 'h265' | 'vp8' | 'vp9';
};

type QualityMap = {
  [key: string]: number;
};

export class RemotionCreativeService {
  private static readonly COMPOSITIONS_DIR = path.join(process.cwd(), 'src/remotion/compositions');
  private static readonly OUTPUT_DIR = path.join(process.cwd(), 'public/generated-creatives');
  private static readonly TEMP_DIR = path.join(process.cwd(), 'temp/remotion');

  /**
   * Generate a creative video using Remotion
   */
  static async generateCreative(request: CreativeGenerationRequest): Promise<GeneratedCreative> {
    const startTime = Date.now();
    const creativeId = `creative_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Ensure output directories exist
      await this.ensureDirectories();

      // Prepare composition input props
      const inputProps = await this.prepareCompositionProps(request, creativeId);

      // Get the appropriate composition based on template
      const compositionId = this.getCompositionId(request.template);

      // Bundle the Remotion project
      const bundleLocation = await bundle({
        entryPoint: path.join(this.COMPOSITIONS_DIR, 'index.tsx'),
        webpackOverride: (config) => {
          // Add Three.js support
          config.module?.rules?.push({
            test: /\.(glb|gltf)$/,
            use: {
              loader: 'file-loader',
              options: {
                outputPath: 'assets/models/',
              },
            },
          });
          return config;
        },
      });

      // Get composition details
      const compositions = await getCompositions(bundleLocation, {
        inputProps,
      });

      const composition = compositions.find((c) => c.id === compositionId);
      if (!composition) {
        throw new Error(`Composition ${compositionId} not found`);
      }

      // Calculate duration in frames
      const durationInFrames = Math.round(request.duration * request.specifications.fps);

      // Render the video
      const outputPath = path.join(this.OUTPUT_DIR, `${creativeId}.${request.specifications.format}`);
      
      await renderMedia({
        composition: {
          ...composition,
          durationInFrames,
          fps: request.specifications.fps,
          width: request.specifications.width,
          height: request.specifications.height,
        },
        serveUrl: bundleLocation,
        codec: this.getCodec(request.specifications.format),
        outputLocation: outputPath,
        inputProps,
        imageFormat: 'jpeg',
        onProgress: (progress) => {
          console.log(`Rendering progress: ${Math.round(progress.progress * 100)}%`);
        },
      });

      // Generate thumbnail
      const thumbnailPath = await this.generateThumbnail(bundleLocation, composition, inputProps, creativeId);

      // Get file size
      const stats = await fs.stat(outputPath);
      const fileSize = stats.size;

      // Calculate render time
      const renderTime = (Date.now() - startTime) / 1000;

      // Create the result
      const result: GeneratedCreative = {
        id: creativeId,
        url: `/generated-creatives/${creativeId}.${request.specifications.format}`,
        thumbnail: `/generated-creatives/${creativeId}_thumbnail.jpg`,
        duration: request.duration,
        fileSize,
        format: request.specifications.format,
        specifications: {
          width: request.specifications.width,
          height: request.specifications.height,
          fps: request.specifications.fps,
        },
        metadata: {
          template: request.template,
          platform: request.platform,
          generatedAt: new Date(),
          renderTime,
        },
      };

      console.log(`Creative generated successfully: ${creativeId} (${renderTime}s)`);
      return result;

    } catch (error) {
      console.error('Error generating creative:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to generate creative: ${errorMessage}`);
    }
  }

  /**
   * Generate multiple variations of a creative
   */
  static async generateVariations(
    baseRequest: CreativeGenerationRequest,
    variations: Partial<CreativeGenerationRequest>[]
  ): Promise<GeneratedCreative[]> {
    const results: GeneratedCreative[] = [];

    for (const variation of variations) {
      const request = { ...baseRequest, ...variation };
      const creative = await this.generateCreative(request);
      results.push(creative);
    }

    return results;
  }

  /**
   * Get platform-specific specifications
   */
  static getPlatformSpecs(platform: string): CreativeGenerationRequest['specifications'] {
    const specs: PlatformSpecs = {
      facebook: { width: 1280, height: 720, fps: 30, format: 'mp4', quality: 'high' },
      instagram: { width: 1080, height: 1080, fps: 30, format: 'mp4', quality: 'high' },
      'instagram-story': { width: 1080, height: 1920, fps: 30, format: 'mp4', quality: 'high' },
      youtube: { width: 1920, height: 1080, fps: 30, format: 'mp4', quality: 'high' },
      tiktok: { width: 1080, height: 1920, fps: 30, format: 'mp4', quality: 'high' },
      linkedin: { width: 1280, height: 720, fps: 30, format: 'mp4', quality: 'high' },
      twitter: { width: 1280, height: 720, fps: 30, format: 'mp4', quality: 'medium' },
    };

    return specs[platform] || specs.facebook;
  }

  /**
   * Get available templates with their descriptions
   */
  static getAvailableTemplates() {
    return [
      {
        id: 'product-showcase',
        name: 'Product Showcase',
        description: '30-60s video highlighting product features with 3D animations',
        duration: { min: 30, max: 60 },
        style: 'Modern & Clean',
        platforms: ['facebook', 'instagram', 'youtube'],
        features: ['3D product rotation', 'Feature callouts', 'Smooth transitions'],
      },
      {
        id: 'brand-story',
        name: 'Brand Story',
        description: '60-90s narrative about your brand with cinematic feel',
        duration: { min: 60, max: 90 },
        style: 'Cinematic',
        platforms: ['facebook', 'instagram', 'youtube', 'tiktok'],
        features: ['Storytelling flow', 'Emotional music', 'Brand integration'],
      },
      {
        id: 'testimonial',
        name: 'Customer Testimonial',
        description: '30-45s customer review showcase with authentic feel',
        duration: { min: 30, max: 45 },
        style: 'Authentic & Personal',
        platforms: ['facebook', 'instagram', 'linkedin'],
        features: ['Quote animations', 'Customer photos', 'Trust indicators'],
      },
      {
        id: 'how-to',
        name: 'How-To Guide',
        description: '45-90s educational content with step-by-step visuals',
        duration: { min: 45, max: 90 },
        style: 'Educational',
        platforms: ['youtube', 'tiktok', 'instagram'],
        features: ['Step indicators', 'Clear instructions', 'Visual guides'],
      },
      {
        id: 'social-proof',
        name: 'Social Proof',
        description: '30-45s showcasing reviews, ratings, and user content',
        duration: { min: 30, max: 45 },
        style: 'Trustworthy',
        platforms: ['facebook', 'instagram', 'google'],
        features: ['Review animations', 'Star ratings', 'User photos'],
      },
      {
        id: 'announcement',
        name: 'Announcement',
        description: '15-30s for new products, sales, or important updates',
        duration: { min: 15, max: 30 },
        style: 'Bold & Attention-grabbing',
        platforms: ['facebook', 'instagram', 'twitter', 'tiktok'],
        features: ['Bold typography', 'Countdown timers', 'Urgency elements'],
      },
    ];
  }

  // Private helper methods

  private static async ensureDirectories(): Promise<void> {
    const dirs = [this.OUTPUT_DIR, this.TEMP_DIR];
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  private static async prepareCompositionProps(
    request: CreativeGenerationRequest,
    creativeId: string
  ): Promise<any> {
    // Download and process assets
    const processedAssets = await this.processAssets(request.assets, creativeId);

    return {
      creativeId,
      template: request.template,
      platform: request.platform,
      duration: request.duration,
      assets: processedAssets,
      content: request.content,
      style: request.style,
      specifications: request.specifications,
      // Add Three.js scene configuration
      scene: {
        camera: {
          position: [0, 0, 5],
          fov: 75,
        },
        lighting: {
          ambient: { intensity: 0.4 },
          directional: { intensity: 0.8, position: [10, 10, 5] },
        },
        background: request.content.brandColors.primary,
      },
    };
  }

  private static async processAssets(assets: CreativeGenerationRequest['assets'], creativeId: string): Promise<any> {
    // TODO: Implement asset downloading and processing
    // For now, return the assets as-is
    return {
      images: assets.images,
      logo: assets.logo,
      backgroundMusic: assets.backgroundMusic,
      // Add processed versions for 3D scenes
      processedImages: assets.images.map((url, index) => ({
        url,
        texture: `${creativeId}_texture_${index}`,
        processed: true,
      })),
    };
  }

  private static getCompositionId(template: string): string {
    const compositionMap: CompositionMap = {
      'product-showcase': 'ProductShowcase',
      'brand-story': 'BrandStory',
      'testimonial': 'Testimonial',
      'how-to': 'HowToGuide',
      'social-proof': 'SocialProof',
      'announcement': 'Announcement',
    };

    return compositionMap[template] || 'ProductShowcase';
  }

  private static getCodec(format: string): 'h264' | 'h265' | 'vp8' | 'vp9' {
    const codecMap: CodecMap = {
      mp4: 'h264',
      webm: 'vp9',
      gif: 'h264', // Will be converted to GIF later
    };

    return codecMap[format] || 'h264';
  }

  private static getQualityValue(quality: string): number {
    const qualityMap: QualityMap = {
      high: 90,
      medium: 70,
      low: 50,
    };

    return qualityMap[quality] || 70;
  }

  private static async generateThumbnail(
    bundleLocation: string,
    composition: any,
    inputProps: any,
    creativeId: string
  ): Promise<string> {
    const thumbnailPath = path.join(this.OUTPUT_DIR, `${creativeId}_thumbnail.jpg`);

    // Render a single frame as thumbnail (frame 30 for a good representative frame)
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: thumbnailPath,
      inputProps,
      frame: 30, // Use frame 30 for a good representative thumbnail
      imageFormat: 'jpeg',
    });

    return thumbnailPath;
  }

  /**
   * Clean up temporary files
   */
  static async cleanup(creativeId: string): Promise<void> {
    try {
      const files = [
        path.join(this.OUTPUT_DIR, `${creativeId}.mp4`),
        path.join(this.OUTPUT_DIR, `${creativeId}.webm`),
        path.join(this.OUTPUT_DIR, `${creativeId}_thumbnail.jpg`),
      ];

      for (const file of files) {
        try {
          await fs.unlink(file);
        } catch {
          // File doesn't exist, ignore
        }
      }
    } catch (error) {
      console.error('Error cleaning up files:', error);
    }
  }

  /**
   * Get creative generation status
   */
  static async getGenerationStatus(creativeId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    estimatedTimeRemaining?: number;
  }> {
    // TODO: Implement status tracking
    return {
      status: 'completed',
      progress: 100,
    };
  }
} 