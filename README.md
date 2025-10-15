# Vite + React + Supabase Template for AI Agents

Starter kit for AI agents that need a Vite 5 + React 18 + TypeScript + Supabase stack with lazy-loaded routing, TailwindCSS, and shadcn/ui.

## Template Scope

- Frontend: React Router v7, shadcn/ui, TailwindCSS, next-themes, Sonner, React Hook Form, Zod.
- Backend integration: `@supabase/supabase-js` is preinstalled. `src/lib/supabase.ts` exposes a ready-to-use client.
- Quality gates: ESLint 9 + TypeScript strict mode. Run `pnpm run typecheck` and `pnpm run lint` to validate changes.

## Project Initialization Structure

```
.
├── src/
│   ├── components/
│   │   ├── Lazy.tsx          # Suspense wrapper used by all lazy routes
│   │   ├── PageLoader.tsx    # Skeleton displayed while routes load
│   │   ├── ThemeProvider.tsx # next-themes wrapper enabling light/dark mode
│   │   └── ui/               # shadcn/ui building blocks; add new UI pieces here
│   ├── lib/
│   │   ├── supabase.ts       # Supabase singleton client reading env vars
│   │   └── utils.ts          # Shared helpers such as cn()
│   ├── pages/                # One folder per route; each exposes index.tsx as default export
│   │   ├── Home/
│   │   │   └── index.tsx     # HomePage example
│   │   └── NotFound/
│   │       └── index.tsx     # 404 fallback example
│   ├── routes/               # Browser router configuration; register all routes here
│   ├── App.tsx               # Injects ThemeProvider + RouterProvider
│   └── main.tsx              # React entry point mounting to #root
├── components.json           # shadcn/ui generator configuration
├── vite.config.ts            # Vite config with @ alias and HMR tweaks
├── tsconfig*.json            # TypeScript project/build configs
├── tailwind.config.js        # Tailwind theme tokens and plugins
├── postcss.config.js         # PostCSS pipeline setup
├── package.json              # Project metadata and scripts
└── pnpm-lock.yaml            # Locked dependency graph
```

## References

- React Router: https://reactrouter.com/
- shadcn/ui: https://ui.shadcn.com/
- TailwindCSS: https://tailwindcss.com/docs
- Supabase: https://supabase.com/docs
