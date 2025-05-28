import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface HowToGuideProps {
  assets: { 
    images: string[]; 
  };
  content: {
    headline: string;
    description: string;
    callToAction: string;
    brandName: string;
    brandColors: { 
      primary: string; 
      secondary: string; 
    };
  };
  style: { 
    theme: string;
    animation: string;
    typography: string; 
  };
}

export const HowToGuide: React.FC<HowToGuideProps> = ({ content, style }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const opacity = interpolate(frame, [0, fps, durationInFrames - fps, durationInFrames], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ 
      background: `linear-gradient(135deg, ${content.brandColors.primary}, ${content.brandColors.secondary})`,
      display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
      padding: '60px', textAlign: 'center', opacity 
    }}>
      <h1 style={{ fontSize: '64px', color: 'white', margin: '0 0 40px 0', fontFamily: style.typography === 'serif' ? 'serif' : 'sans-serif' }}>
        {content.headline}
      </h1>
      <p style={{ fontSize: '28px', color: 'white', maxWidth: '800px', fontFamily: style.typography === 'serif' ? 'serif' : 'sans-serif' }}>
        {content.description}
      </p>
    </AbsoluteFill>
  );
}; 