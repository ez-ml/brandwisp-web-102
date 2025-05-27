'use client';

import { useEffect, useState } from 'react';
import Layout from '../../components/dashboard/DashboardLayout';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import AutoBlogGenNewPage from './new/page'; // overlay import

export default function AutoBlogGenDashboardPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showNewBlogModal, setShowNewBlogModal] = useState(false);
  const storeDomain = 'ss-armatics.myshopify.com';

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/shopify/fetch-blogs?shop=${storeDomain}&userId=${userId}`);
        const data = await response.json();
        setBlogs(Array.isArray(data.articles) ? data.articles : []);
      } catch {
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [userId]);

  const blogsThisWeek = blogs.filter(blog => {
    const createdAt = new Date(blog.created_at);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return createdAt > oneWeekAgo;
  });

  const topBlog = blogs.length > 0 ? blogs[0] : null;

  return (
    <Layout>
      <div className="bg-[#1E1B4B] text-white min-h-screen px-6 py-10">
        <h1 className="text-4xl font-bold mb-2">AutoBlogGen</h1>
        <p className="text-white/70 mb-10">AI-Powered Blog & Product Content Automation</p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#2A2153] p-6 rounded-xl shadow">
            <h3 className="text-sm font-semibold mb-2 text-purple-300">Blogs Generated This Week</h3>
            <p className="text-4xl font-bold">{blogsThisWeek.length}</p>
          </div>
          <div className="bg-[#2A2153] p-6 rounded-xl shadow">
            <h3 className="text-sm font-semibold mb-2 text-purple-300">Top Performing Blog</h3>
            <p className="text-purple-400">{topBlog?.title || 'No blogs available'}</p>
          </div>
          <div className="bg-[#2A2153] p-6 rounded-xl shadow">
            <h3 className="text-sm font-semibold mb-2 text-purple-300">Click-through Rate</h3>
            <p className="text-2xl font-bold text-green-400">5.2%</p>
          </div>
        </div>

        <div className="mb-8">
          <button
            className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-full font-semibold"
            onClick={() => setShowNewBlogModal(true)}
          >
            Generate New Blog Now
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">Recent Auto-Generated Posts</h2>
        {loading ? (
          <p>Loading...</p>
        ) : blogs.length === 0 ? (
          <p>No blogs found.</p>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog, idx) => (
              <div key={idx} className="bg-[#2A2153] p-4 rounded-xl shadow flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{blog.title}</h3>
                  <p className="text-sm text-white/70">{blog.body_html?.slice(0, 80).replace(/<[^>]+>/g, '')}...</p>
                </div>
                <p className="text-sm text-white/50">{new Date(blog.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Overlay Modal */}
        {showNewBlogModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-start pt-12 overflow-auto">
            <div className="bg-[#1E1B4B] w-full max-w-5xl p-6 rounded-2xl relative shadow-2xl">
              <button
                onClick={() => setShowNewBlogModal(false)}
                className="absolute top-4 right-4 text-white bg-[#7C3AED] hover:bg-purple-700 p-2 rounded-full"
              >
                ✕
              </button>
              <AutoBlogGenNewPage />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
