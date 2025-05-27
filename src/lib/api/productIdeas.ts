export interface ProductIdea {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  inputType: 'text' | 'image' | 'both';
  targetMarket?: string;
  priceRange?: string;
  analysis?: any;
  trendSignal?: string;
  searchabilityIndex?: string;
  visualAppeal?: string;
  competitiveNiche?: string;
  marketSummary?: string;
  suggestedKeywords?: string[];
  competitorInsights?: Array<{
    name: string;
    price: string;
    rating: number;
    marketShare: string;
  }>;
  potentialMarkets?: string[];
  status: 'draft' | 'analyzed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  metadata?: any;
}

export class ProductIdeaService {
  static async create(data: Omit<ProductIdea, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductIdea> {
    const response = await fetch('/api/product-ideas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create product idea');
    }

    const idea = await response.json();
    return {
      ...idea,
      createdAt: new Date(idea.created_at),
      updatedAt: new Date(idea.updated_at),
    };
  }

  static async getByUserId(userId: string): Promise<ProductIdea[]> {
    const response = await fetch(`/api/product-ideas?userId=${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch product ideas');
    }

    const ideas = await response.json();
    return ideas.map((idea: any) => ({
      ...idea,
      createdAt: new Date(idea.created_at),
      updatedAt: new Date(idea.updated_at),
    }));
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`/api/product-ideas?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete product idea');
    }
  }
} 