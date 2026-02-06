# n8n Workflows - Minecraft Horror Factory

## Importing Workflows

1. Open your n8n instance (self-hosted or n8n Cloud).
2. Go to **Workflows** in the left sidebar.
3. Click the **"..."** menu (top-right) and select **Import from File**.
4. Select one of the JSON files from this directory.
5. Repeat for each workflow.

Import them in order since later workflows depend on data created by earlier ones:

| File | Workflow | Schedule |
|------|----------|----------|
| `1-daily-generation.json` | Content concept generation via GPT-4o | Daily at 2 AM |
| `2-veo-generation.json` | Video generation via Veo 2 API | Daily at 4 AM |
| `3-auto-publishing.json` | Post to TikTok and YouTube Shorts | Daily at 6 AM and 6 PM |
| `4-analytics-collection.json` | Collect view/engagement stats | Daily at 11 PM |
| `5-weekly-revenue.json` | Revenue aggregation and reporting | Mondays at 9 AM |

## Required Credentials

Set up the following credentials in n8n (**Settings > Credentials**) before activating:

### Supabase API
- **Type:** Supabase API
- **Host:** Your Supabase project URL (e.g., `https://xxx.supabase.co`)
- **Service Role Key:** Found in Supabase Dashboard > Settings > API > `service_role` key
- Used by workflows: 2, 3, 4, 5

### OpenAI API
- **Type:** OpenAI API
- **API Key:** Your OpenAI API key with GPT-4o access
- Used by workflow: 1

### TikTok Content Publishing API (optional)
- **Type:** OAuth2 or Header Auth
- **Scopes:** `video.publish`, `video.upload`, `user.info.stats`
- Used by workflows: 3, 4, 5
- Note: Requires TikTok Developer account with Content Publishing API access

### YouTube Data API v3 / YouTube Analytics API (optional)
- **Type:** OAuth2
- **Scopes:** `youtube.upload`, `youtube.readonly`, `yt-analytics.readonly`
- Used by workflows: 3, 4, 5
- Note: Requires Google Cloud project with YouTube APIs enabled

## Environment Variables

Set these in n8n under **Settings > Variables** (or via `N8N_` environment variables):

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_URL` | Base URL of the Next.js app | `https://your-app.vercel.app` |

These are referenced in HTTP Request nodes as `{{ $env.APP_URL }}`.

## Workflow Details

### 1. Daily Content Generation
Fetches top-performing viral patterns from the app API, sends them to GPT-4o to generate 2 new content concepts, then validates each concept against brand guidelines and viral potential scoring. Approved concepts are saved to the `content_queue` table; rejected ones are logged.

### 2. Veo Video Generation
Picks up approved content from the queue and sends the `veo_prompt` to the Veo 2 API to generate short-form video. The resulting video URL is stored and the content status is updated to `generated`. The Veo API call is a placeholder -- update the endpoint and authentication once your API access is provisioned.

### 3. Auto Publishing
Runs twice daily at peak engagement times. Selects the highest-scoring generated content, branches it to both TikTok and YouTube Shorts, posts the video, inserts a `published_content` record, and updates the content status to `posted`.

### 4. Analytics Collection
Queries all content published in the last 30 days, fetches current stats from TikTok and YouTube APIs, normalizes the data, and updates the `published_content` table. If any content crosses the 100K view viral threshold, it logs an alert.

### 5. Weekly Revenue Report
Runs every Monday morning. Fetches revenue data from TikTok Creator Fund, YouTube AdSense, and the app's product/affiliate revenue endpoint. Inserts records into `revenue_sources`, generates a summary report, and sends it to the app API.

## Notes

- All workflows are imported in an **inactive** state. Activate them individually after verifying credentials and testing with manual executions.
- Use the **Manual Execution** button in n8n to test each workflow before enabling the schedule trigger.
- The TikTok and YouTube API endpoints are placeholders. Replace them with actual endpoints and configure proper OAuth flows for your accounts.
- All times are in the timezone configured in your n8n instance settings.
