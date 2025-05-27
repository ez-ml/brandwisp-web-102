"use client";
import { useState } from "react";

export default function PostBlogPage() {
  const [status, setStatus] = useState("");

  const handlePostBlog = async () => {
    setStatus("Posting...");
    try {
      const res = await fetch("/api/shopify/post-blog", {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`✅ Blog posted: ${data.blogId}`);
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setStatus(`❌ Exception: ${err}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Post Shopify Test Blog</h1>
      <button
        onClick={handlePostBlog}
        className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Post Test Blog
      </button>
      {status && <p className="mt-4 text-gray-700">{status}</p>}
    </div>
  );
}
