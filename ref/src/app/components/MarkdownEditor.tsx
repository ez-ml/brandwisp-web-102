// components/MarkdownEditor.tsx
'use client';
import React from 'react';

export default function MarkdownEditor({ content, onChange }: { content: string; onChange: (v: string) => void }) {
  return (
    <textarea
      className="w-full h-[400px] bg-[#121212] text-white p-4 rounded-md border border-gray-600 focus:outline-none"
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Your blog content will appear here..."
    />
  );
}
