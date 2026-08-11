import { readFileSync } from "fs";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "./index";

// Every renderBlock branch lands in an array, so each needs a key. React only
// complains at runtime, which the DOM-based tests never see.
const noKeyWarnings = (md: string) => {
  const errs: string[] = [];
  const orig = console.error;
  console.error = (...a: unknown[]) => errs.push(String(a[0]));
  renderToStaticMarkup(<Markdown rawHtml>{md}</Markdown>);
  console.error = orig;
  return errs.filter((e) => /key/i.test(e));
};

it("renders every block type without key warnings", () => {
  expect(
    noKeyWarnings(
      "# H\n\npara\n\n```js\nx\n```\n\n    indented\n\n- a\n- b\n\n1. a\n\n> q\n\n> [!NOTE]\n> n\n\n| a |\n|---|\n| b |\n\n---\n\n$$x$$\n\n<details>\n<summary>s</summary>\n\nb\n\n</details>\n\n<span>inline</span>",
    ),
  ).toEqual([]);
});

it("renders unresolved references without key warnings", () => {
  expect(noKeyWarnings("[missing] and [a][b]\n\n[other]: /u")).toEqual([]);
});

it("renders a custom highlighter's output without key warnings", () => {
  const errs: string[] = [];
  const orig = console.error;
  console.error = (...a: unknown[]) => errs.push(String(a[0]));
  renderToStaticMarkup(
    <Markdown highlight={(code) => <pre>{code}</pre>}>
      {"```js\na\n```\n\n```js\nb\n```"}
    </Markdown>,
  );
  console.error = orig;
  expect(errs.filter((e) => /key/i.test(e))).toEqual([]);
});

it("names no renderer package in a runtime import", () => {
  const files = [
    "blocks.tsx",
    "inline.tsx",
    "index.tsx",
    "utils.ts",
    "sanitize.ts",
    "math/renderMath.tsx",
    "highlight/highlight.tsx",
  ];
  const offenders = files.filter((f) =>
    readFileSync(new URL(f, import.meta.url), "utf8")
      .split("\n")
      .some((l) => /^import\s+(?!type\b)/.test(l) && /["']react/.test(l)),
  );
  expect(offenders).toEqual([]);
});
