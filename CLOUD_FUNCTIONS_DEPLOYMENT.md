# Cloud Functions Deployment Guide

## 🚀 Deploy BrandWisp Cloud Functions

This guide will help you deploy the Cloud Functions for real store integration.

## Prerequisites

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Set Firebase Project
```bash
firebase use brandwisp-dev
```

## 📦 Manual Deployment Steps

### Step 1: Install Dependencies
```bash
cd functions
npm install
```

### Step 2: Set Environment Variables
```bash
firebase functions:config:set \
  bigquery.project_id="brandwisp-dev" \
  bigquery.dataset_id="analytics" \
  shopify.webhook_secret="your_webhook_secret_here"
```

### Step 3: Build TypeScript
```bash
npm run build
```

### Step 4: Deploy Functions
```bash
cd ..
firebase deploy --only functions
```

## 🤖 Automated Deployment

Use the provided script for automated deployment:

```bash
./scripts/deploy-functions.sh
```

## 🔧 Environment Variables

Set these environment variables for your functions:

```bash
# BigQuery Configuration
firebase functions:config:set bigquery.project_id="brandwisp-dev"
firebase functions:config:set bigquery.dataset_id="analytics"

# Shopify Configuration
firebase functions:config:set shopify.webhook_secret="your_actual_webhook_secret"
firebase functions:config:set shopify.api_key="your_shopify_api_key"
firebase functions:config:set shopify.api_secret="your_shopify_api_secret"

# Google Cloud Configuration (if needed)
firebase functions:config:set google.project_id="brandwisp-dev"
```

## 📋 Deployed Functions

After deployment, you'll have these functions:

### 1. `scheduledShopifySync`
- **Type**: Scheduled (Cron)
- **Schedule**: Every hour (`0 * * * *`)
- **Purpose**: Sync all connected Shopify stores
- **URL**: Not applicable (scheduled function)

### 2. `onStoreConnected`
- **Type**: Firestore Trigger
- **Trigger**: `stores/{storeId}` document write
- **Purpose**: Initial sync when a store is connected
- **URL**: Not applicable (triggered function)

### 3. `processShopifyWebhook`
- **Type**: HTTP Function
- **Purpose**: Process Shopify webhook events
- **URL**: `https://us-central1-brandwisp-dev.cloudfunctions.net/processShopifyWebhook`

## 🔗 Webhook Configuration

### Set up Shopify Webhooks

1. Go to your Shopify app settings
2. Add these webhook endpoints:

```
Product Create: https://us-central1-brandwisp-dev.cloudfunctions.net/processShopifyWebhook
Product Update: https://us-central1-brandwisp-dev.cloudfunctions.net/processShopifyWebhook
Order Create: https://us-central1-brandwisp-dev.cloudfunctions.net/processShopifyWebhook
Order Update: https://us-central1-brandwisp-dev.cloudfunctions.net/processShopifyWebhook
App Uninstall: https://us-central1-brandwisp-dev.cloudfunctions.net/processShopifyWebhook
```

3. Set webhook format to JSON
4. Use your webhook secret for verification

## 🧪 Testing Functions

### Test Scheduled Function
```bash
# Trigger manually for testing
firebase functions:shell
> scheduledShopifySync()
```

### Test Webhook Function
```bash
curl -X POST https://us-central1-brandwisp-dev.cloudfunctions.net/processShopifyWebhook \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: products/create" \
  -H "X-Shopify-Shop-Domain: test-store.myshopify.com" \
  -H "X-Shopify-Hmac-Sha256: your_hmac_here" \
  -d '{"id": "test-product"}'
```

### View Logs
```bash
firebase functions:log
```

## 📊 Monitoring

### Function Metrics
- Go to [Firebase Console](https://console.firebase.google.com)
- Navigate to Functions section
- Monitor execution count, errors, and duration

### BigQuery Data
- Check [BigQuery Console](https://console.cloud.google.com/bigquery)
- Verify data is being inserted into analytics tables

### Error Handling
- Functions automatically retry on failure
- Errors are logged to Firebase Functions logs
- Failed events can be manually reprocessed

## 🔒 Security

### IAM Permissions
Ensure your functions have these permissions:
- BigQuery Data Editor
- Firestore Service Agent
- Cloud Functions Service Agent

### Environment Variables
- Never commit secrets to version control
- Use Firebase Functions config for sensitive data
- Rotate webhook secrets regularly

## 🚨 Troubleshooting

### Common Issues

#### 1. BigQuery Permission Denied
```bash
# Set service account key
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
```

#### 2. Function Timeout
```bash
# Increase timeout in firebase.json
{
  "functions": {
    "timeout": "540s"
  }
}
```

#### 3. Memory Issues
```bash
# Increase memory allocation
{
  "functions": {
    "memory": "1GB"
  }
}
```

### Debug Commands
```bash
# Check function status
firebase functions:list

# View detailed logs
firebase functions:log --only processShopifyWebhook

# Test locally
firebase emulators:start --only functions
```

## 📈 Performance Optimization

### Best Practices
1. **Batch Operations**: Process multiple records together
2. **Error Handling**: Implement proper retry logic
3. **Monitoring**: Set up alerts for failures
4. **Caching**: Cache frequently accessed data
5. **Timeouts**: Set appropriate timeout values

### Scaling Considerations
- Functions auto-scale based on demand
- Monitor concurrent executions
- Consider using Pub/Sub for high-volume events
- Implement circuit breakers for external APIs

## 🔄 Updates and Maintenance

### Updating Functions
```bash
# Make changes to code
# Then redeploy
firebase deploy --only functions
```

### Rolling Back
```bash
# View deployment history
firebase functions:log

# Rollback if needed (manual process)
# Redeploy previous version
```

### Monitoring Health
- Set up Cloud Monitoring alerts
- Monitor BigQuery slot usage
- Track API rate limits
- Monitor function execution times

## 📞 Support

If you encounter issues:
1. Check the logs: `firebase functions:log`
2. Verify environment variables: `firebase functions:config:get`
3. Test locally: `firebase emulators:start`
4. Check BigQuery permissions and quotas
5. Verify Shopify webhook configuration

## 🎉 Success Verification

After deployment, verify:
- [ ] Functions appear in Firebase Console
- [ ] Scheduled function runs every hour
- [ ] Webhook function responds to test requests
- [ ] Data appears in BigQuery tables
- [ ] Store sync triggers work correctly
- [ ] Error handling works as expected

Your Cloud Functions are now ready for production! 🚀 