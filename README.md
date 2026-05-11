# timp

A calm focus timer + reflection journal that visually tracks meaningful work over time.

> GitHub contributions, but for your actual work and growth.

## Features

- 🍅 Pomodoro-style timer with customizable intervals
- 📝 Session reflections and journaling
- 🔥 Contribution heatmap showing focus consistency
- 📊 Weekly and monthly analytics
- 🏷️ Tag-based session categorization
- 🔐 Google & GitHub authentication

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **State:** Zustand
- **Animations:** Framer Motion
- **Charts:** Nivo

## Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/timp.git
cd timp

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your Supabase credentials

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase project credentials:

- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon/public key

## License

[MIT](LICENSE)
