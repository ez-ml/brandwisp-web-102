import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { ProductShowcase } from './ProductShowcase';
import { BrandStory } from './BrandStory';
import { Testimonial } from './Testimonial';
import { HowToGuide } from './HowToGuide';
import { SocialProof } from './SocialProof';
import { Announcement } from './Announcement';

// Define the common props interface that all compositions will use
interface CommonCompositionProps {
  creativeId: string;
  template: string;
  platform: string;
  duration: number;
  assets: {
    images: string[];
    processedImages?: any[];
    logo?: string;
  };
  content: {
    headline: string;
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
    theme: string;
    animation: string;
    typography: string;
  };
  specifications: {
    width: number;
    height: number;
    fps: number;
    format: string;
    quality: string;
  };
  scene: {
    camera: { position: [number, number, number]; fov: number };
    lighting: {
      ambient: { intensity: number };
      directional: { intensity: number; position: [number, number, number] };
    };
    background: string;
  };
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ProductShowcase"
        component={ProductShowcase as any}
        durationInFrames={1800} // 60 seconds at 30fps
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          creativeId: 'sample',
          template: 'product-showcase',
          platform: 'facebook',
          duration: 60,
          assets: {
            images: [],
            processedImages: [],
          },
          content: {
            headline: 'Amazing Product',
            description: 'Discover the features that make this product special',
            callToAction: 'Shop Now',
            brandName: 'Your Brand',
            brandColors: {
              primary: '#7C3AED',
              secondary: '#EC4899',
            },
          },
          style: {
            theme: 'modern',
            animation: 'smooth',
            typography: 'sans-serif',
          },
          specifications: {
            width: 1280,
            height: 720,
            fps: 30,
            format: 'mp4',
            quality: 'high',
          },
          scene: {
            camera: { position: [0, 0, 5], fov: 75 },
            lighting: {
              ambient: { intensity: 0.4 },
              directional: { intensity: 0.8, position: [10, 10, 5] },
            },
            background: '#7C3AED',
          },
        } as CommonCompositionProps}
      />

      <Composition
        id="BrandStory"
        component={BrandStory as any}
        durationInFrames={2700} // 90 seconds at 30fps
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          creativeId: 'sample',
          template: 'brand-story',
          platform: 'facebook',
          duration: 90,
          assets: {
            images: [],
            processedImages: [],
          },
          content: {
            headline: 'Our Story',
            description: 'The journey that brought us here',
            callToAction: 'Learn More',
            brandName: 'Your Brand',
            brandColors: {
              primary: '#7C3AED',
              secondary: '#EC4899',
            },
          },
          style: {
            theme: 'elegant',
            animation: 'smooth',
            typography: 'serif',
          },
          specifications: {
            width: 1280,
            height: 720,
            fps: 30,
            format: 'mp4',
            quality: 'high',
          },
          scene: {
            camera: { position: [0, 0, 5], fov: 75 },
            lighting: {
              ambient: { intensity: 0.4 },
              directional: { intensity: 0.8, position: [10, 10, 5] },
            },
            background: '#7C3AED',
          },
        } as CommonCompositionProps}
      />

      <Composition
        id="Testimonial"
        component={Testimonial as any}
        durationInFrames={1350} // 45 seconds at 30fps
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          assets: { images: [] },
          content: {
            headline: 'Customer Love',
            description: 'See what our customers are saying',
            callToAction: 'Join Them',
            brandName: 'Your Brand',
            brandColors: {
              primary: '#7C3AED',
              secondary: '#EC4899',
            },
          },
          style: {
            theme: 'minimal',
            animation: 'subtle',
            typography: 'sans-serif',
          },
        }}
      />

      <Composition
        id="HowToGuide"
        component={HowToGuide as any}
        durationInFrames={2700} // 90 seconds at 30fps
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          assets: { images: [] },
          content: {
            headline: 'How To Guide',
            description: 'Step-by-step instructions',
            callToAction: 'Try It Now',
            brandName: 'Your Brand',
            brandColors: {
              primary: '#7C3AED',
              secondary: '#EC4899',
            },
          },
          style: {
            theme: 'professional',
            animation: 'dynamic',
            typography: 'sans-serif',
          },
        }}
      />

      <Composition
        id="SocialProof"
        component={SocialProof as any}
        durationInFrames={1350} // 45 seconds at 30fps
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          assets: { images: [] },
          content: {
            headline: 'Trusted by Thousands',
            description: 'Join our satisfied customers',
            callToAction: 'Get Started',
            brandName: 'Your Brand',
            brandColors: {
              primary: '#7C3AED',
              secondary: '#EC4899',
            },
          },
          style: {
            theme: 'modern',
            animation: 'smooth',
            typography: 'sans-serif',
          },
        }}
      />

      <Composition
        id="Announcement"
        component={Announcement as any}
        durationInFrames={900} // 30 seconds at 30fps
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          assets: { images: [] },
          content: {
            headline: 'Big Announcement',
            description: 'Something exciting is coming',
            callToAction: 'Learn More',
            brandName: 'Your Brand',
            brandColors: {
              primary: '#7C3AED',
              secondary: '#EC4899',
            },
          },
          style: {
            theme: 'bold',
            animation: 'energetic',
            typography: 'display',
          },
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot); 