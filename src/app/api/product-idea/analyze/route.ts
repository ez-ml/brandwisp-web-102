import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get('title')?.toString() || '';
    const ideaText = formData.get('ideaText')?.toString() || '';
    const targetMarket = formData.get('targetMarket')?.toString() || '';
    const priceRange = formData.get('priceRange')?.toString() || '';
    const file = formData.get('file') as File | null;

    // Generate market analysis using OpenAI
    const marketAnalysisPrompt = `
      Analyze the following product idea and provide the analysis in valid JSON format only. No other text or explanation should be included.

      Product Details:
      ${title ? `Title: ${title}\n` : ''}
      ${ideaText ? `Description: ${ideaText}\n` : ''}
      ${targetMarket ? `Target Market: ${targetMarket}\n` : ''}
      ${priceRange ? `Price Range: ${priceRange}\n` : ''}
      ${file ? 'An image of the product was also provided.\n' : ''}

      Required JSON structure:
      {
        "trendSignal": "High|Medium|Low",
        "searchabilityIndex": "High|Medium|Low",
        "visualAppeal": "High|Medium|Low",
        "competitiveNiche": "High|Medium|Low",
        "marketSummary": "A detailed market analysis summary",
        "suggestedKeywords": ["keyword1", "keyword2", "etc"],
        "competitorInsights": [
          {
            "name": "Competitor Name",
            "price": "Price Range",
            "rating": 4.5,
            "marketShare": "15%"
          }
        ],
        "potentialMarkets": ["Market1", "Market2", "etc"]
      }

      Ensure the response is a valid JSON object with exactly these fields and format.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a market research expert. You must respond with only valid JSON data matching the specified structure. Do not include any other text or explanations."
        },
        {
          role: "user",
          content: marketAnalysisPrompt
        }
      ]
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No analysis generated');
    }

    try {
      const analysis = JSON.parse(content.trim());
      return NextResponse.json(analysis);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Invalid JSON response from analysis');
    }
  } catch (error) {
    console.error('Error analyzing product idea:', error);
    return NextResponse.json(
      { error: 'Failed to analyze product idea' },
      { status: 500 }
    );
  }
} 