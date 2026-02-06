# Deployment Guide

## Prerequisites

- GitHub account with this repo pushed
- Railway account (free trial or paid)
- Supabase project with schema applied
- Environment variables ready

## Step 1: Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `docs/schema.sql`
3. Run the seed data locally: `npm run seed`
4. Copy your project URL and keys from **Settings > API**

## Step 2: Deploy to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and click **New Project**
3. Select **Deploy from GitHub repo** and pick this repository
4. Railway will auto-detect the `Dockerfile` and begin building
5. Go to your service's **Variables** tab and add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `OPENAI_API_KEY` | OpenAI API key |
| `N8N_WEBHOOK_SECRET` | A random secret string for webhook auth |
| `NEXT_PUBLIC_APP_URL` | Your Railway public URL (set after first deploy) |

6. Go to **Settings > Networking** and click **Generate Domain** to get a public URL
7. Copy that URL and set it as `NEXT_PUBLIC_APP_URL`, then redeploy

## Step 3: Verify Deployment

1. Visit your Railway public URL
2. Check `https://your-app.up.railway.app/api/health` returns `{"status":"ok"}`
3. Check `https://your-app.up.railway.app/api/test-db` returns success
4. Navigate through all dashboard pages

## Step 4: Connect n8n

1. Set the n8n environment variable `APP_URL` to your Railway URL
2. Set `N8N_WEBHOOK_SECRET` to match the value in Railway
3. Import workflows from `n8n-workflows/`
4. Test each workflow manually
5. Activate workflows

## How It Works

- **`railway.toml`** tells Railway to use the Dockerfile builder
- **`Dockerfile`** builds a multi-stage image using Next.js standalone output (~120 MB vs ~1 GB)
- Railway injects `PORT` at runtime; the app binds to `0.0.0.0:$PORT`
- Health checks hit `/api/health` so Railway knows the service is alive
- On failure Railway auto-restarts up to 3 times

## Troubleshooting

### Build Fails
- Check the build logs in Railway's **Deployments** tab
- Run `npm run build` locally to reproduce errors
- Ensure all dependencies are in `package.json` (not just devDependencies)

### App Crashes on Start
- Check **Logs** in Railway for the error
- Verify all required environment variables are set
- The health check endpoint at `/api/health` should respond within 120 seconds

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Ensure the Supabase project isn't paused (free tier pauses after inactivity)
- Check RLS policies if getting permission errors

### Webhooks Not Working
- Ensure `N8N_WEBHOOK_SECRET` matches between n8n and Railway
- Use the full URL: `https://your-app.up.railway.app/api/webhooks/...`

### Custom Domain
- In Railway, go to **Settings > Networking > Custom Domain**
- Add your domain and configure DNS as instructed
- Update `NEXT_PUBLIC_APP_URL` to your custom domain and redeploy
