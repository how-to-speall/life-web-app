# Setup Guide

## Quick Start

### 1. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**How to get these values:**
1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your project dashboard, click "Settings" in the sidebar
3. Click "API"
4. Copy the "Project URL" and "anon public" key

### 2. Database Setup

1. In your Supabase project, go to "SQL Editor"
2. Copy and paste the contents of `database-schema.sql`
3. Click "Run" to execute the SQL

### 3. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

### Common Issues

1. **"Supabase URL not found" error**
   - Make sure your `.env.local` file exists and has the correct values
   - Restart your development server after adding environment variables

2. **"Table doesn't exist" error**
   - Make sure you ran the SQL schema in Supabase
   - Check that the table name is exactly `tasks`

3. **App not loading**
   - Check browser console for errors
   - Verify your Supabase project is active and not paused

### Mobile Testing

To test on your phone:
1. Make sure your phone and computer are on the same WiFi network
2. Find your computer's local IP address (usually starts with 192.168.x.x)
3. On your phone, open: `http://YOUR_IP:3000`
4. Or use tools like ngrok for external access

## Next Steps

Once the basic setup is working:
1. Customize the app design in `src/app/page.tsx`
2. Add authentication for user-specific tasks
3. Implement the other tabs (Notes, Goals, Habits)
4. Add more task features like categories, priority, etc.
