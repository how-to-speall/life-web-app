# Life Web App

A comprehensive life management web application built with Next.js and Supabase, designed to work seamlessly on both desktop and mobile devices.

## Features

### Current Implementation
- **Tasks Management**: Full CRUD operations for tasks
- **Mobile-First Design**: Responsive interface optimized for mobile use
- **Tab Navigation**: Easy switching between different life areas
- **Task Completion**: Visual feedback with radio buttons and strikethrough text
- **Deadline Support**: Optional due dates for tasks
- **Description Fields**: Rich task details

### Planned Features
- Notes management
- Goal tracking
- Habit formation

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Mobile**: Responsive design with touch-friendly interactions

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd life-web-app
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Run the following SQL to create the tasks table:

```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for demo purposes)
CREATE POLICY "Allow all operations" ON tasks FOR ALL USING (true);
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Tasks Tab

1. **Create Task**: Click the "Create Task" button to add a new task
   - Title is required
   - Description and deadline are optional
   
2. **Complete Task**: Click the radio button (circle) to mark a task as complete
   - Completed tasks show a checkmark and strikethrough text
   
3. **Delete Task**: Click the trash icon to remove a task

### Mobile Experience

The app is designed with mobile-first principles:
- Touch-friendly buttons and interactions
- Responsive layout that works on all screen sizes
- Optimized for one-handed use

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page with tabs
│   └── globals.css         # Global styles
├── lib/
│   └── supabase.ts         # Supabase client configuration
└── components/              # Reusable components (future)
```

## Development

### Adding New Features

1. **New Tab**: Add to the `tabs` array in `page.tsx`
2. **New Content**: Add conditional rendering for the new tab
3. **Database**: Create corresponding tables in Supabase

### Styling

The app uses Tailwind CSS for styling. All components are mobile-first and responsive.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Supabase configuration
3. Ensure all environment variables are set correctly
4. Check that the database table was created properly
