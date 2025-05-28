import React from 'react';
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Sequence,
} from 'remotion';

interface ProductShowcaseProps {
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
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  assets,
  content,
  style,
  specifications,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Animation timings
  const introEnd = fps * 2; // 2 seconds intro
  const imageDisplayDuration = fps * 3; // 3 seconds per image
  const outroStart = durationInFrames - fps * 3; // 3 seconds outro

  // Background gradient animation
  const backgroundOpacity = interpolate(
    frame,
    [0, introEnd, outroStart, durationInFrames],
    [0, 1, 1, 0],
    {
      easing: Easing.inOut(Easing.ease),
    }
  );

  // Title animation
  const titleTranslateY = interpolate(
    frame,
    [0, introEnd],
    [100, 0],
    {
      easing: Easing.out(Easing.back(1.7)),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const titleOpacity = interpolate(
    frame,
    [0, introEnd / 2, introEnd],
    [0, 0, 1],
    {
      easing: Easing.inOut(Easing.ease),
    }
  );

  // Get current image index based on frame
  const currentImageIndex = Math.floor(
    (frame - introEnd) / imageDisplayDuration
  ) % (assets.images.length || 1);

  // Image animation
  const imageScale = interpolate(
    frame % imageDisplayDuration,
    [0, imageDisplayDuration / 4, (imageDisplayDuration * 3) / 4, imageDisplayDuration],
    [0.8, 1, 1, 1.1],
    {
      easing: Easing.inOut(Easing.ease),
    }
  );

  const imageOpacity = interpolate(
    frame % imageDisplayDuration,
    [0, imageDisplayDuration / 8, (imageDisplayDuration * 7) / 8, imageDisplayDuration],
    [0, 1, 1, 0],
    {
      easing: Easing.inOut(Easing.ease),
    }
  );

  // CTA animation (appears in the last 5 seconds)
  const ctaStart = durationInFrames - fps * 5;
  const ctaOpacity = interpolate(
    frame,
    [ctaStart, ctaStart + fps],
    [0, 1],
    {
      easing: Easing.out(Easing.ease),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const ctaScale = interpolate(
    frame,
    [ctaStart, ctaStart + fps],
    [0.8, 1],
    {
      easing: Easing.out(Easing.back(1.7)),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill>
      {/* Background Gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${content.brandColors.primary}, ${content.brandColors.secondary})`,
          opacity: backgroundOpacity,
        }}
      />

      {/* Product Images */}
      {assets.images && assets.images.length > 0 && frame > introEnd && frame < outroStart && (
        <AbsoluteFill
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px',
          }}
        >
          <div
            style={{
              transform: `scale(${imageScale})`,
              opacity: imageOpacity,
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              maxWidth: '60%',
              maxHeight: '60%',
            }}
          >
            <Img
              src={assets.images[currentImageIndex]}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* Brand Name */}
      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '60px',
        }}
      >
        <div
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            opacity: titleOpacity,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            fontFamily: style.typography === 'serif' ? 'serif' : 'sans-serif',
          }}
        >
          {content.brandName}
        </div>
      </AbsoluteFill>

      {/* Main Headline */}
      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: '40px',
        }}
      >
        <div
          style={{
            transform: `translateY(${titleTranslateY}px)`,
            opacity: titleOpacity,
            textAlign: 'center',
            color: 'white',
            maxWidth: '80%',
          }}
        >
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              margin: '0 0 20px 0',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
              fontFamily: style.typography === 'serif' ? 'serif' : 'sans-serif',
              lineHeight: 1.2,
            }}
          >
            {content.headline}
          </h1>
          <p
            style={{
              fontSize: '24px',
              margin: '0',
              opacity: 0.9,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
              fontFamily: style.typography === 'serif' ? 'serif' : 'sans-serif',
              lineHeight: 1.4,
            }}
          >
            {content.description}
          </p>
        </div>
      </AbsoluteFill>

      {/* Call to Action */}
      {frame >= ctaStart && (
        <AbsoluteFill
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingBottom: '80px',
          }}
        >
          <div
            style={{
              transform: `scale(${ctaScale})`,
              opacity: ctaOpacity,
              background: 'white',
              color: content.brandColors.primary,
              padding: '20px 40px',
              borderRadius: '50px',
              fontSize: '28px',
              fontWeight: 'bold',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
              fontFamily: style.typography === 'serif' ? 'serif' : 'sans-serif',
            }}
          >
            {content.callToAction}
          </div>
        </AbsoluteFill>
      )}

      {/* Decorative Elements */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
        }}
      >
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => {
          const particleDelay = i * 0.5 * fps;
          const particleOpacity = interpolate(
            frame,
            [particleDelay, particleDelay + fps, durationInFrames - fps, durationInFrames],
            [0, 0.6, 0.6, 0],
            {
              easing: Easing.inOut(Easing.ease),
            }
          );
          
          const particleY = interpolate(
            frame,
            [particleDelay, durationInFrames],
            [specifications.height + 50, -50],
            {
              easing: Easing.linear,
            }
          );

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${10 + i * 15}%`,
                top: particleY,
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'white',
                opacity: particleOpacity,
              }}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}; 