import { BigQuery } from '@google-cloud/bigquery';
import { generateId } from '@/lib/utils';
import type { ProductIdea as ProductIdeaType } from '@/lib/api/productIdeas';

type CreateProductIdeaData = {
  userId: string;
  inputType: 'text' | 'image' | 'both';
  status: 'draft' | 'analyzed' | 'archived';
  title?: string;
  description?: string;
  imageUrl?: string;
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
  tags?: string[];
  metadata?: any;
};

interface BigQueryProductIdea {
  id: string;
  userId: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  inputType: string;
  targetMarket: string | null;
  priceRange: string | null;
  analysis: string | null;
  trendSignal: string | null;
  searchabilityIndex: string | null;
  visualAppeal: string | null;
  competitiveNiche: string | null;
  marketSummary: string | null;
  suggestedKeywords: string[] | null;
  competitorInsights: string | null;
  potentialMarkets: string[] | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  tags: string[] | null;
  metadata: string | null;
}

class BigQueryError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'BigQueryError';
  }
}

const bigquery = new BigQuery({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

export class ProductIdeaService {
  private static readonly TABLE_NAME = `${process.env.GOOGLE_CLOUD_PROJECT}.brandwisp_db.product_ideas`;

  private static createProductIdea(data: CreateProductIdeaData): ProductIdeaType {
    const id = generateId();
    const now = new Date();

    return {
      id,
      userId: data.userId,
      inputType: data.inputType,
      status: data.status,
      createdAt: now,
      updatedAt: now,
      title: data.title || '',
      description: data.description || '',
      imageUrl: data.imageUrl,
      targetMarket: data.targetMarket || '',
      priceRange: data.priceRange || '',
      analysis: data.analysis,
      trendSignal: data.trendSignal || '',
      searchabilityIndex: data.searchabilityIndex || '',
      visualAppeal: data.visualAppeal || '',
      competitiveNiche: data.competitiveNiche || '',
      marketSummary: data.marketSummary || '',
      suggestedKeywords: data.suggestedKeywords || [],
      competitorInsights: data.competitorInsights || [],
      potentialMarkets: data.potentialMarkets || [],
      tags: data.tags || [],
      metadata: data.metadata,
    };
  }

  static async create(data: CreateProductIdeaData): Promise<ProductIdeaType> {
    try {
      const idea = this.createProductIdea(data);
      const bqData = this.transformForBigQuery(idea);

      await bigquery
        .dataset('brandwisp_db')
        .table('product_ideas')
        .insert([bqData]);

      return idea;
    } catch (error) {
      throw new BigQueryError('Failed to create product idea', error);
    }
  }

  static async update(id: string, data: Partial<ProductIdeaType>): Promise<void> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      const bqData = this.transformForBigQuery(updateData as ProductIdeaType);
      const updateFields = Object.entries(bqData)
        .filter(([_, value]) => value !== undefined)
        .map(([key, _]) => `${key} = @${key}`)
        .join(', ');

      const query = `
        UPDATE \`${this.TABLE_NAME}\`
        SET ${updateFields}
        WHERE id = @id
      `;

      const options = {
        query,
        params: {
          ...bqData,
          id,
        },
      };

      await bigquery.query(options);
    } catch (error) {
      throw new BigQueryError('Failed to update product idea', error);
    }
  }

  static async getById(id: string): Promise<ProductIdeaType | null> {
    try {
      const query = `
        SELECT *
        FROM \`${this.TABLE_NAME}\`
        WHERE id = @id
        LIMIT 1
      `;

      const options = {
        query,
        params: { id },
      };

      const [rows] = await bigquery.query(options);
      return rows[0] ? this.transformFromBigQuery(rows[0]) : null;
    } catch (error) {
      throw new BigQueryError('Failed to get product idea by ID', error);
    }
  }

  static async getByUserId(userId: string): Promise<ProductIdeaType[]> {
    try {
      const query = `
        SELECT *
        FROM \`${this.TABLE_NAME}\`
        WHERE userId = @userId
        ORDER BY createdAt DESC
      `;

      const options = {
        query,
        params: { userId },
      };

      const [rows] = await bigquery.query(options);
      return (rows as BigQueryProductIdea[]).map(this.transformFromBigQuery);
    } catch (error) {
      throw new BigQueryError('Failed to get product ideas by user ID', error);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const query = `
        DELETE FROM \`${this.TABLE_NAME}\`
        WHERE id = @id
      `;

      const options = {
        query,
        params: { id },
      };

      await bigquery.query(options);
    } catch (error) {
      throw new BigQueryError('Failed to delete product idea', error);
    }
  }

  private static transformForBigQuery(idea: ProductIdeaType): BigQueryProductIdea {
    return {
      id: idea.id,
      userId: idea.userId,
      title: idea.title || null,
      description: idea.description || null,
      imageUrl: idea.imageUrl || null,
      inputType: idea.inputType,
      targetMarket: idea.targetMarket || null,
      priceRange: idea.priceRange || null,
      analysis: idea.analysis ? JSON.stringify(idea.analysis) : null,
      trendSignal: idea.trendSignal || null,
      searchabilityIndex: idea.searchabilityIndex || null,
      visualAppeal: idea.visualAppeal || null,
      competitiveNiche: idea.competitiveNiche || null,
      marketSummary: idea.marketSummary || null,
      suggestedKeywords: idea.suggestedKeywords || null,
      competitorInsights: idea.competitorInsights ? JSON.stringify(idea.competitorInsights) : null,
      potentialMarkets: idea.potentialMarkets || null,
      status: idea.status,
      createdAt: idea.createdAt.toISOString(),
      updatedAt: idea.updatedAt.toISOString(),
      tags: idea.tags || null,
      metadata: idea.metadata ? JSON.stringify(idea.metadata) : null,
    };
  }

  private static transformFromBigQuery(row: BigQueryProductIdea): ProductIdeaType {
    if (!row.id || !row.userId || !row.inputType || !row.status) {
      throw new Error('Invalid row data: missing required fields');
    }

    return {
      id: row.id,
      userId: row.userId,
      title: row.title || undefined,
      description: row.description || undefined,
      imageUrl: row.imageUrl || undefined,
      inputType: row.inputType as ProductIdeaType['inputType'],
      targetMarket: row.targetMarket || undefined,
      priceRange: row.priceRange || undefined,
      analysis: row.analysis ? JSON.parse(row.analysis) : undefined,
      trendSignal: row.trendSignal || undefined,
      searchabilityIndex: row.searchabilityIndex || undefined,
      visualAppeal: row.visualAppeal || undefined,
      competitiveNiche: row.competitiveNiche || undefined,
      marketSummary: row.marketSummary || undefined,
      suggestedKeywords: row.suggestedKeywords || [],
      competitorInsights: row.competitorInsights ? JSON.parse(row.competitorInsights) : [],
      potentialMarkets: row.potentialMarkets || [],
      status: row.status as ProductIdeaType['status'],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      tags: row.tags || [],
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }
} 