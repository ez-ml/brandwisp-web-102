# BrandWisp Web Platform

A comprehensive digital marketing and brand management platform built with Next.js.

## Features

- **Product Idea Genie**: AI-powered product idea analysis and validation
- **AutoBlogGen**: Automated blog post generation with SEO optimization
- **Vision Tagger**: AI-powered image analysis and tagging
- **Traffic Trace**: Website traffic analysis and insights
- **Campaign Wizard**: Marketing campaign management and optimization
- **Product Pulse**: Product performance tracking and analytics

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API
- Recharts for data visualization
- Sonner for toast notifications

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/brandwisp-web.git
cd brandwisp-web
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example` and add your API keys:
```bash
cp .env.example .env
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions and helpers
└── styles/               # Global styles
```

## API Integration

The platform uses several APIs for different features:

- OpenAI API for AI-powered features
- (Future) Google Analytics API for traffic analysis
- (Future) Social Media APIs for campaign management
- (Future) Market Research APIs for competitor analysis

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to your preferred hosting platform (Vercel recommended):
```bash
vercel deploy
```

## Environment Variables

Required environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXTAUTH_SECRET`: Random string for authentication
- `NEXTAUTH_URL`: Your application URL
- Additional API keys as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
