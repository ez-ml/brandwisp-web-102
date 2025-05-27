# Brandwisp Portal – Project Planning

This is an AI-powered Shopify merchant platform to manage campaigns, analyze product performance, and connect stores.

## Architecture

- **Frontend**: Next.js 14 (App Router)
- **Auth**: Firebase Authentication (email + Google login)
- **Data**: Firestore (users, stores), BigQuery (products, events)
- **Hosting**: Vercel
- **AI Coding Workflow**: MCP (Model Context Protocol)

## Modules

- ✅ Auth (Login/Register/Role middleware)
- 🟡 Shopify Store Connect/Disconnect/Reconnect
- ⬜ Campaign Builder
- ⬜ Product Performance Dashboard
- ⬜ Subscription Billing

## Shopify Integration

- OAuth with Shopify
- Store tokens stored in Firestore
- Support reconnect (create new token record)
- Webhook support (HMAC validation)
