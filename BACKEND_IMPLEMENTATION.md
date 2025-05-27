# Backend Implementation for Dashboard Modules

This document outlines the backend implementation for the VisionTagger, TrafficTrace, and CampaignWizard dashboard modules.

## Architecture Overview

The backend consists of:
- **Firebase Firestore**: Real-time document database for storing user data, campaigns, blogs, images, etc.
- **BigQuery**: Analytics warehouse for storing and querying large-scale analytics data
- **API Routes**: Next.js API routes that handle authentication and data fetching
- **Custom Hooks**: React hooks for data fetching and state management

## Services

### Firebase Service (`src/lib/services/firebase.ts`)
Handles all Firestore operations including:
- User profile management
- Store operations (Shopify, WooCommerce, etc.)
- Product data management
- Blog content management
- Campaign management
- Image analysis data

### BigQuery Service (`src/lib/services/bigquery.ts`)
Handles analytics queries including:
- Traffic analytics (page views, sessions, bounce rate)
- Geographic and device breakdown
- Campaign performance metrics
- Blog performance analytics
- Image analysis statistics
- Real-time metrics

## API Routes

### VisionTagger API (`/api/dashboard/visiontagger`)
- **GET**: Fetches image analysis data based on view (dashboard, analyze, manage)
- **POST**: Handles image upload and analysis requests

### TrafficTrace API (`/api/dashboard/traffictrace`)
- **GET**: Fetches traffic analytics data from BigQuery

### CampaignWizard API (`/api/dashboard/campaignwizard`)
- **GET**: Fetches campaign data from Firebase and performance metrics from BigQuery
- **POST**: Handles campaign creation, updates, and status changes

## Data Flow

1. **Authentication**: Firebase Auth tokens are verified on each API request
2. **Data Fetching**: Custom hooks (`useDashboardData`) fetch data from API routes
3. **Real-time Updates**: Firebase listeners provide real-time data updates
4. **Analytics**: BigQuery provides aggregated analytics data
5. **Caching**: Data is cached in React state and can be refreshed on demand

## Database Schema

### Firebase Collections
- `users`: User profiles with subscription and preferences
- `stores`: Connected e-commerce stores
- `campaigns`: Marketing campaigns with targeting and creatives
- `blogs`: Blog posts with SEO metadata
- `images`: Image analysis results with AI tags and scores

### BigQuery Tables
- `page_views`: Website traffic data
- `campaign_performance`: Campaign metrics and ROI
- `blog_performance`: Blog engagement and SEO metrics
- `image_analysis`: Image processing results
- `product_events`: E-commerce tracking events
- `user_sessions`: User behavior analytics

## Environment Variables Required

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# BigQuery
GOOGLE_APPLICATION_CREDENTIALS=
GOOGLE_CLOUD_PROJECT=
```

## Usage Examples

### Fetching VisionTagger Data
```typescript
import { useVisionTaggerData } from '@/hooks/useDashboardData';

const { data, loading, error, refetch } = useVisionTaggerData('dashboard');
```

### Creating a Campaign
```typescript
import { useDashboardMutation } from '@/hooks/useDashboardData';

const { mutate } = useDashboardMutation('campaignwizard');

await mutate({
  action: 'create',
  campaignData: {
    name: 'Summer Sale',
    platform: 'facebook',
    budget: { total: 1000, currency: 'USD' },
    // ... other campaign data
  }
});
```

## Error Handling

- API routes return standardized error responses
- Custom hooks handle loading states and errors
- UI components show loading spinners and error messages
- Retry functionality is available for failed requests

## Security

- All API routes require Firebase authentication
- User data is isolated by userId
- BigQuery queries are parameterized to prevent injection
- Environment variables are used for sensitive configuration

## Performance Considerations

- Data is fetched on-demand based on active view
- BigQuery queries are optimized with proper indexing
- Firebase queries use limits and pagination
- Real-time listeners are cleaned up properly
- Auto-refresh can be enabled for live data

## Future Enhancements

1. **Caching Layer**: Implement Redis for API response caching
2. **Data Pipeline**: Set up automated data sync between Firebase and BigQuery
3. **Real-time Analytics**: Use Firebase Functions for real-time metric updates
4. **Image Processing**: Integrate with Google Vision API for actual image analysis
5. **Campaign Automation**: Connect with platform APIs (Facebook, Google Ads)
6. **Blog Publishing**: Integrate with CMS platforms for automated publishing

## Testing

The backend can be tested with zero data initially. The UI will show:
- Empty states for no data
- Loading states while fetching
- Error states with retry options
- Placeholder data where appropriate

All dashboard layouts and functionality remain intact even with empty databases. 