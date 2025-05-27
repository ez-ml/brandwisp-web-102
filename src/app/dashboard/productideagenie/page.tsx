"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ProductIdeaService, ProductIdea } from '@/lib/api/productIdeas';
import {
  Loader2,
  Sparkles,
  Brain,
  TrendingUp,
  Search,
  Target,
  Image as ImageIcon,
  BarChart,
  CheckCircle,
  Save,
  List,
  X,
  Plus,
} from 'lucide-react';

const genieImg = '/images/genie.png';

interface IdeaAnalysis {
  trendSignal: 'High' | 'Medium' | 'Low';
  searchabilityIndex: 'High' | 'Medium' | 'Low';
  visualAppeal: 'High' | 'Medium' | 'Low';
  competitiveNiche: 'High' | 'Medium' | 'Low';
  marketSummary: string;
  suggestedKeywords: string[];
  competitorInsights: {
    name: string;
    price: string;
    rating: number;
    marketShare: string;
  }[];
  potentialMarkets: string[];
}

const getColorForLevel = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'high':
      return 'bg-emerald-500 text-white';
    case 'medium':
      return 'bg-amber-400 text-black';
    case 'low':
      return 'bg-rose-500 text-white';
    default:
      return 'bg-slate-500 text-white';
  }
};

export default function ProductIdeaGeniePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ideaText, setIdeaText] = useState('');
  const [ideaTitle, setIdeaTitle] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'both'>('text');
  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);
  const [savedIdeas, setSavedIdeas] = useState<ProductIdea[]>([]);
  const [showSavedIdeas, setShowSavedIdeas] = useState(false);

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleAnalyze = async () => {
    try {
      setIsLoading(true);

      if (!ideaTitle) {
        toast.error('Please provide a title for your idea');
        return;
      }

      const formData = new FormData();
      formData.append('title', ideaTitle);
      formData.append('targetMarket', targetMarket);
      formData.append('priceRange', priceRange);

      if (activeTab === 'text' || activeTab === 'both') {
        if (!ideaText) {
          toast.error('Please describe your product idea');
          return;
        }
        formData.append('ideaText', ideaText);
      }

      if (activeTab === 'image' || activeTab === 'both') {
        if (!imageFile) {
          toast.error('Please upload an image');
          return;
        }
        formData.append('file', imageFile);
      }

      const response = await fetch('/api/product-idea/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze product idea');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to analyze product idea. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIdea = async () => {
    try {
      if (!user) {
        toast.error('Please sign in to save ideas');
        return;
      }

      if (!analysis) {
        toast.error('Please analyze your idea first');
        return;
      }

      const idea = await ProductIdeaService.create({
        userId: user.uid,
        title: ideaTitle,
        description: ideaText,
        imageUrl: imagePreview || undefined,
        inputType: activeTab,
        targetMarket,
        priceRange,
        analysis,
        trendSignal: analysis.trendSignal,
        searchabilityIndex: analysis.searchabilityIndex,
        visualAppeal: analysis.visualAppeal,
        competitiveNiche: analysis.competitiveNiche,
        marketSummary: analysis.marketSummary,
        suggestedKeywords: analysis.suggestedKeywords,
        competitorInsights: analysis.competitorInsights,
        potentialMarkets: analysis.potentialMarkets,
        status: 'analyzed',
      });

      toast.success('Product idea saved successfully!');
      loadSavedIdeas();
    } catch (error) {
      console.error('Error saving idea:', error);
      toast.error('Failed to save product idea');
    }
  };

  const loadSavedIdeas = async () => {
    if (!user) return;
    try {
      const ideas = await ProductIdeaService.getByUserId(user.uid);
      setSavedIdeas(ideas);
    } catch (error) {
      console.error('Error loading saved ideas:', error);
      toast.error('Failed to load saved ideas');
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await ProductIdeaService.delete(id);
      toast.success('Idea deleted successfully');
      loadSavedIdeas();
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error('Failed to delete idea');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Product Idea Genie 🧞
            </h1>
            <p className="text-slate-400 mt-2">Transform your product concepts into market-ready opportunities</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSavedIdeas(!showSavedIdeas)}
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              {showSavedIdeas ? <X className="h-4 w-4 mr-2" /> : <List className="h-4 w-4 mr-2" />}
              {showSavedIdeas ? 'Close Ideas' : 'Saved Ideas'}
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || (!ideaText && !imageFile)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Analyze Idea
            </Button>
          </div>
        </div>

        {showSavedIdeas ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedIdeas.map((idea) => (
              <Card key={idea.id} className="bg-[#1E1B4B]/50 border-purple-500/20 p-6 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg text-white">{idea.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteIdea(idea.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {idea.imageUrl && (
                  <div className="mb-4">
                    <img src={idea.imageUrl} alt={idea.title} className="w-full h-40 object-cover rounded-lg" />
                  </div>
                )}
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{idea.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {idea.suggestedKeywords?.slice(0, 3).map((keyword, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                      #{keyword}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-xs">
                    <span className="text-slate-400">Trend Signal:</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full ${getColorForLevel(idea.trendSignal || '')}`}>
                      {idea.trendSignal}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400">Market:</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full ${getColorForLevel(idea.competitiveNiche || '')}`}>
                      {idea.competitiveNiche}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
            <Card
              className="bg-[#1E1B4B]/30 border-purple-500/20 p-6 flex items-center justify-center cursor-pointer hover:bg-[#1E1B4B]/50 transition-colors"
              onClick={() => setShowSavedIdeas(false)}
            >
              <div className="text-center">
                <Plus className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-purple-400">Add New Idea</p>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Input Section */}
            <div className="space-y-6">
              <Card className="bg-[#1E1B4B]/50 border-purple-500/20 p-6 backdrop-blur-sm">
                <div className="flex justify-left mb-8 relative">
                  <div className="relative inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/10 to-red-500/20 blur-3xl" />
                  <Image
                    src={genieImg}
                    width={180}
                    height={180}
                    alt="Genie"
                    className="relative drop-shadow-[0_0_25px_rgba(147,51,234,0.8)]"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Idea Title</label>
                    <Input
                      placeholder="Give your idea a catchy title..."
                      value={ideaTitle}
                      onChange={(e) => setIdeaTitle(e.target.value)}
                      className="bg-[#2D2A5E]/50 border-purple-500/20 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={activeTab === 'text' ? 'default' : 'outline'}
                      className={
                        activeTab === 'text'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                          : 'text-purple-400 border-purple-500/30 hover:bg-purple-500/10'
                      }
                      onClick={() => setActiveTab('text')}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Text
                    </Button>
                    <Button
                      variant={activeTab === 'image' ? 'default' : 'outline'}
                      className={
                        activeTab === 'image'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                          : 'text-purple-400 border-purple-500/30 hover:bg-purple-500/10'
                      }
                      onClick={() => setActiveTab('image')}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Image
                    </Button>
                    <Button
                      variant={activeTab === 'both' ? 'default' : 'outline'}
                      className={
                        activeTab === 'both'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                          : 'text-purple-400 border-purple-500/30 hover:bg-purple-500/10'
                      }
                      onClick={() => setActiveTab('both')}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Both
                    </Button>
                  </div>

                  {(activeTab === 'text' || activeTab === 'both') && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Describe Your Product Idea</label>
                      <Textarea
                        className="min-h-[150px] bg-[#2D2A5E]/50 border-purple-500/20 text-white placeholder:text-slate-500"
                        placeholder="Describe your product idea in detail..."
                        value={ideaText}
                        onChange={(e) => setIdeaText(e.target.value)}
                      />
                    </div>
                  )}

                  {(activeTab === 'image' || activeTab === 'both') && (
                    <div
                      className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer bg-[#2D2A5E]/30"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      />
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                      <p className="text-slate-400">
                        Drag and drop your product image or sketch, or click to browse
                      </p>
                      {imagePreview && (
                        <div className="mt-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full max-h-[200px] object-contain rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Target Market</label>
                      <Input
                        placeholder="e.g., Young professionals"
                        className="bg-[#2D2A5E]/50 border-purple-500/20 text-white placeholder:text-slate-500"
                        value={targetMarket}
                        onChange={(e) => setTargetMarket(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Price Range</label>
                      <Input
                        placeholder="e.g., $50-100"
                        className="bg-[#2D2A5E]/50 border-purple-500/20 text-white placeholder:text-slate-500"
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Panel - Analysis Section */}
            {analysis ? (
              <div className="space-y-6">
                <Card className="bg-[#1E1B4B]/50 border-purple-500/20 p-6 backdrop-blur-sm">
                  <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Market Analysis
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Trend Signal', value: analysis.trendSignal },
                      { label: 'Searchability', value: analysis.searchabilityIndex },
                      { label: 'Visual Appeal', value: analysis.visualAppeal },
                      { label: 'Competition', value: analysis.competitiveNiche },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-[#2D2A5E]/30 p-4 rounded-lg border border-purple-500/20">
                        <p className="text-sm text-slate-400 mb-1">{item.label}</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getColorForLevel(item.value)}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-[#1E1B4B]/50 border-purple-500/20 p-6 backdrop-blur-sm">
                  <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Market Summary
                  </h2>
                  <p className="text-slate-300 mb-4">{analysis.marketSummary}</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.suggestedKeywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </Card>

                <Card className="bg-[#1E1B4B]/50 border-purple-500/20 p-6 backdrop-blur-sm">
                  <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Competitor Analysis
                  </h2>
                  <div className="space-y-3">
                    {analysis.competitorInsights.map((competitor, idx) => (
                      <div key={idx} className="bg-[#2D2A5E]/30 p-3 rounded-lg border border-purple-500/20 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-white">{competitor.name}</p>
                          <p className="text-sm text-slate-400">Price: {competitor.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-amber-400">★ {competitor.rating}</p>
                          <p className="text-sm text-slate-400">{competitor.marketShare} share</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-[#1E1B4B]/50 border-purple-500/20 p-6 backdrop-blur-sm">
                  <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Next Steps
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      onClick={handleSaveIdea}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Idea
                    </Button>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Target className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <Search className="h-4 w-4 mr-2" />
                      Market Research
                    </Button>
                    <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                      <BarChart className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="bg-[#1E1B4B]/50 border-purple-500/20 p-6 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  How Product Idea Genie Works
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">AI-Powered Analysis</h3>
                      <p className="text-sm text-slate-400">Our AI evaluates your idea's market potential</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Market Trends</h3>
                      <p className="text-sm text-slate-400">Get insights on current market trends and demands</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Competitive Analysis</h3>
                      <p className="text-sm text-slate-400">Understand your competition and market position</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Action Steps</h3>
                      <p className="text-sm text-slate-400">Get clear next steps to bring your idea to life</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 