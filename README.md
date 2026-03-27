## Next.js Production Starter (Pages Router)

A modern, production-ready starter built with:

- Next.js (latest, Pages Router)
- TypeScript
- Tailwind CSS
- ESLint

## Project Structure

```
src/
  components/
    layout/
    ui/
  config/
  constants/
  lib/
  pages/
    api/
  styles/
  types/
```

## Getting Started

Install dependencies and run development:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Commands

```bash
# Lint
npm run lint

# Production build
npm run build

# Start production server
npm run start
```

## Best Practices Included

- Path aliases via `@/*`
- Reusable layout and UI components
- Centralized app configuration (`src/config`)
- Shared constants and types
- Utility helpers in `src/lib`

## Learn More

- [Next.js Pages Router Docs](https://nextjs.org/docs/pages)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Deployment

Deploy to your preferred platform (Vercel, Netlify, Docker, or custom server) using the `npm run build` output.
