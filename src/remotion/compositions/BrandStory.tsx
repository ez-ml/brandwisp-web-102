import React from 'react';
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

interface BrandStoryProps {
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

export const BrandStory: React.FC<BrandStoryProps> = ({
  assets,
  content,
  style,
  specifications,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Story sections
  const sectionDuration = durationInFrames / 3;
  const currentSection = Math.floor(frame / sectionDuration);

  // Background animation
  const backgroundOpacity = interpolate(
    frame,
    [0, fps, durationInFrames - fps, durationInFrames],
    [0, 1, 1, 0],
    { easing: Easing.inOut(Easing.ease) }
  );

  // Text animation
  const textOpacity = interpolate(
    frame % sectionDuration,
    [0, fps / 2, sectionDuration - fps / 2, sectionDuration],
    [0, 1, 1, 0],
    { easing: Easing.inOut(Easing.ease) }
  );

  const storyTexts = [
    { title: "Our Beginning", text: content.description },
    { title: "Our Journey", text: `${content.brandName} has been dedicated to excellence` },
    { title: "Our Future", text: content.callToAction }
  ];

  return (
    <AbsoluteFill>
      {/* Background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(45deg, ${content.brandColors.primary}, ${content.brandColors.secondary})`,
          opacity: backgroundOpacity,
        }}
      />

      {/* Images */}
      {assets.images && assets.images.length > 0 && (
        <AbsoluteFill
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Img
            src={assets.images[currentSection % assets.images.length]}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.3,
            }}
          />
        </AbsoluteFill>
      )}

      {/* Story Text */}
      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: '60px',
          textAlign: 'center',
        }}
      >
        <div style={{ opacity: textOpacity, color: 'white' }}>
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              margin: '0 0 40px 0',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
              fontFamily: style.typography === 'serif' ? 'serif' : 'sans-serif',
            }}
          >
            {content.headline}
          </h1>
          <h2
            style={{
              fontSize: '48px',
              margin: '0 0 30px 0',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)',
              fontFamily: style.typography === 'serif' ? 'serif' : 'sans-serif',
            }}
          >
            {storyTexts[currentSection]?.title}
          </h2>
          <p
            style={{
              fontSize: '28px',
              lineHeight: 1.6,
              maxWidth: '800px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)',
              fontFamily: style.typography === 'serif' ? 'serif' : 'sans-serif',
            }}
          >
            {storyTexts[currentSection]?.text}
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}; 