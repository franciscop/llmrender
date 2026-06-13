# Contributing to LLMRender

Thanks for your interest in improving LLMRender! Contributions are very welcome: bug reports, tests, docs, and code.

## Small is a feature

One of the main goals of this library is to **remain small**. The entire bundle (Markdown parsing, syntax highlighting, LaTeX→MathML, and sanitization) is ~8 KB gzipped with zero dependencies, and that is a core part of why people choose it over remark/rehype or markdown-it.

This means every code addition must balance the usability it brings against the code size it adds:

- A fix or feature that helps most users and adds a few hundred bytes? Great.
- A niche option that adds kilobytes? It probably belongs in user-land instead: the `highlight`, `math`, and `rawHtml` props already accept custom functions, so many extensions can live outside the library.
- Adding a runtime dependency is off the table; the dependency count is zero and stays zero.

When you submit a PR that changes `src/`, please measure the impact and include it in the PR description:

```sh
npm run build   # rebuilds index.min.js
npm run size    # prints the gzipped size in bytes
```

If a feature can't be made small, opening an issue to discuss the trade-off before writing code will save you time.

## Development

```sh
git clone https://github.com/franciscop/llmrender.git
cd llmrender
npm install
npm start       # vitest in watch mode
```

Other scripts:

```sh
npm test        # full test suite with coverage
npm run lint    # typecheck with tsc
npm run build   # build index.min.js + index.d.ts + format with prettier
npm run size    # gzipped size of index.min.js
```

## Guidelines

- **Never import from `"react"` at runtime.** Only `import type { ... } from "react"` is allowed in `src/`. A runtime import (e.g. `import { createElement } from "react"`) bypasses the build's external config and bundles all of React into the output, more than doubling the gzip size. If you need to work around a JSX type error, use a spread cast instead: `<mspace {...({ width } as any)} />`.
- **Add tests.** Every fix or feature should come with tests next to the code it touches (`src/*.test.tsx`). Run `npm test` and `npm run lint` before pushing.
- **Be careful with `src/sanitize.ts`.** It is security-sensitive (XSS, URL schemes, tag/attribute allowlists). Changes there need tests in `src/security.test.tsx` proving the attack they block.
- **Match the existing style.** Prettier handles formatting (`npm run build` runs it); keep comments sparse and reserve them for non-obvious constraints.
- **Keep PRs focused.** One fix or feature per PR is much easier to review and merge.
- **Markdown behavior**: LLMRender targets the Markdown that LLMs actually emit (GitHub Flavored Markdown, LaTeX math, streaming-friendly parsing of unclosed blocks) rather than full CommonMark compliance. Edge cases should degrade gracefully, not add parser complexity.

## Reporting issues

Open an issue at https://github.com/franciscop/llmrender/issues with a minimal Markdown snippet that reproduces the problem and what you expected to render. A failing test case is even better.
