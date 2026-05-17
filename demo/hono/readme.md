# Using Hono JSX with React libraries (e.g. for SSR)

**Problem**

When using a pre-built npm library that internally uses `react/jsx-runtime` (e.g. for a `<Fragment>`), it cannot be rendered by Hono's JSX serializer. Hono's `toStringToBuffer` expects its own JSX element objects but receives React element objects (`{ $$typeof, type, props, key }`), causing a runtime crash.

**What we tried**

- `bunfig.toml` `[alias]`: only affects Bun's transpiler, not runtime module resolution for pre-built `.js` files
- `jsxImportSource = "hono/jsx"` in `bunfig.toml`: same limitation, only redirects the JSX transform for source files Bun compiles, not for already-built code
- `hono/jsx/jsx-runtime` has no default export, so a direct alias would break the import anyway

**How it works in `@server/next`**

I'm writing `@server/next`, the next version of `server`, and I've solved it by serializing React element objects (still early alpha), basically making it React-compatible.

PS, I got inspired by Hono to add JSX support, thanks a lot! That's why I wanted to suggest supporting `react/jsx-runtime` so Hono users benefit as well!

**What would fix it for Hono**

Either:

1. Hono's HTML serializer recognizes and handles React element objects (by checking `$$typeof`)
2. Hono documents a supported way to alias `react/jsx-runtime` to `hono/jsx/jsx-runtime` at runtime (not just transpile time)
3. A `renderToString`-style adapter that accepts React elements and produces an HTML string Hono can serve

**Context**

I'm also building `llmrender`, a React Markdown renderer. We'd like to support Hono for SSR without requiring users to ship a full React SSR stack. It works with @server/next but not with Hono and digging this seems to be the issue.
