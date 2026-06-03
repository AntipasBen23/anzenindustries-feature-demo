// Tells TypeScript that CSS files are valid side-effect imports.
// Required because next-env.d.ts references .next/types/routes.d.ts which
// doesn't exist until after the first build, leaving TS without CSS module types.
declare module '*.css';
