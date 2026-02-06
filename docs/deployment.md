# Deployment Guide

## Prerequisites

- GitHub account with this repo pushed
- Vercel account (free tier works)
- Supabase project with schema applied
- Environment variables ready

## Step 1: Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `docs/schema.sql`
3. Run the seed data: `npm run seed`
4. Copy your project URL and keys from Settings > API

## Step 2: Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
   - `OPENAI_API_KEY` - OpenAI API key
   - `N8N_WEBHOOK_SECRET` - A random secret string for webhook auth
   - `NEXT_PUBLIC_APP_URL` - Your deployed Vercel URL
4. Click Deploy

## Step 3: Verify Deployment

1. Visit your deployed URL
2. Check `/api/test-db` returns success
3. Navigate through all dashboard pages
4. Test the content validation API

## Step 4: Connect n8n

1. Update n8n environment variable `APP_URL` with your Vercel URL
2. Update `N8N_WEBHOOK_SECRET` to match your Vercel env
3. Import workflows from `n8n-workflows/`
4. Test each workflow manually
5. Activate workflows

## Troubleshooting

### Build Fails
- Check all TypeScript errors are resolved: `npm run build`
- Ensure all dependencies are in package.json

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check RLS policies if getting permission errors

### API Routes Return 500
- Check Vercel function logs for errors
- Verify environment variables are set correctly

### Webhooks Not Working
- Ensure `N8N_WEBHOOK_SECRET` matches between n8n and Vercel
- Check the webhook URL includes `/api/webhooks/` prefix
