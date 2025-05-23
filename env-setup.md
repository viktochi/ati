# Environment Setup for Subscription System

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Database
DATABASE_URL="your_database_url_here"

# Clerk Authentication
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"

# Stripe Configuration
STRIPE_API_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_webhook_secret_here"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_ID="your_admin_user_id"
```

## How to get STRIPE_WEBHOOK_SECRET:

1. Go to your Stripe Dashboard
2. Navigate to Developers > Webhooks
3. Create a new webhook endpoint pointing to: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
5. Copy the webhook signing secret and use it as `STRIPE_WEBHOOK_SECRET`

## Testing the Subscription System:

1. Make sure all environment variables are set
2. Test Stripe webhook locally using Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. The webhook secret from the CLI can be used for local testing

## Common Issues:

- If webhooks aren't working, check that `STRIPE_WEBHOOK_SECRET` is set correctly
- Make sure your webhook endpoint is publicly accessible for production
- Verify that the webhook events are configured correctly in Stripe Dashboard 