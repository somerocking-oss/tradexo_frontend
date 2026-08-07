"use client";
// This shim is the alias target for "lucide-react" in next.config.ts.
// The "use client" directive tells Next.js to treat all lucide-react
// imports as client-side code, preventing the createContext crash that
// lucide-react v1.x causes when imported in React Server Components.
// Re-export directly from the package ESM subpath so client references
// (named exports for icons) are preserved in the React client manifest.
// Use explicit node_modules path to avoid resolver aliasing issues
// @ts-expect-error - import from node_modules explicit path (no declaration)
export * from "../../node_modules/lucide-react/dist/esm/lucide-react.mjs";
