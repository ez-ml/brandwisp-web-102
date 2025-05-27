# 📦 MCP Task: Implement Shopify Connect Store Flow

## Objective
Build a full Shopify Store Connection flow using Firebase and Firestore.

---

## Files to Generate

1. `/connect-store` page:
   - A button that initiates Shopify OAuth (redirects to Shopify auth URL)
   - Displays connection status (connected/disconnected)
   - Uses Firebase auth context

2. `/api/oauth/shopify/route.ts`:
   - Handles callback from Shopify
   - Reads `code` and `shop` from query
   - Exchanges code for access token (mock if needed)
   - Saves token, shop domain, and user ID in Firestore `stores` collection
   - Marks status = `connected`

3. `stores` Firestore model:
   - userId
   - shopDomain
   - accessToken
   - scope
   - createdAt
   - status (`connected` or `disconnected`)

4. `tests/e2e/store-connect.spec.ts`:
   - Simulates a user clicking "Connect Store"
   - Mocks the redirect + confirms Firestore is updated

---

## Constraints

- Use Firebase Auth for current user context
- Token storage must be under Firestore `stores/{userId}_{shopDomain}`
- OAuth redirect URL = `/api/oauth/shopify`
- Include error handling and UI feedback
- Code must follow `.globalrules`

---

## After Completion

- Mark all tasks as complete in TASK.md
- Append module notes in PLANNING.md
- Write commit message: `🔗 Add Shopify Store Connect Flow with OAuth`
