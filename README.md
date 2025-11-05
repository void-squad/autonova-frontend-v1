# Autonova Dashboard

React + Vite dashboard prototype for the Autonova platform. The project uses TypeScript, Tailwind CSS, shadcn/ui primitives, React Query, and React Router to provide a pleasant developer experience for building authenticated dashboards and landing pages.

## Prerequisites

- Node.js 18 or later (use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to install/manage versions)
- pnpm (recommended) or npm/yarn bun — install via `npm install -g pnpm`

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd autonova-dash

# Install dependencies (pnpm recommended)
pnpm install

# Start the dev server
pnpm dev
```

The app runs at http://localhost:5173 by default. Vite offers hot-module reloading for rapid iteration.

## Available Scripts

- `pnpm dev` – start the development server
- `pnpm build` – create a production build in `dist/`
- `pnpm preview` – locally preview the production build
- `pnpm lint` – run ESLint against the codebase

You can use the equivalent `npm` commands if you prefer npm (`npm run dev`, etc.).

## Project Structure

```
src/
	components/     # Reusable UI primitives and layout pieces
	contexts/       # React context providers (e.g., auth)
	hooks/          # Custom hooks
	lib/            # Utilities and API clients
	pages/          # Route-level views
```

Tailwind CSS styles live in `src/index.css`. Routing is configured in `src/App.tsx` using `react-router-dom`.

## Deployment

Run `pnpm build` to produce a production bundle in `dist/`. Deploy the generated files to any static hosting provider (Vercel, Netlify, GitHub Pages, etc.) or integrate the output into your preferred deployment pipeline.

## Contributing

1. Create a new branch for your feature or fix.
2. Install dependencies and run the dev server to test changes locally.
3. Open a pull request detailing the changes and testing performed.

## License

Specify your license here (e.g., MIT) or link to the appropriate file.
