import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "./index";
import spec from "./spec.commonmark.json";

// Compliance scoreboard against the CommonMark 0.31.2 spec suite. Full
// compliance is a non-goal (it needs an AST parser), so this asserts the pass
// count never drops. Raise BASELINE whenever a change improves it.
const BASELINE = 233;

type Example = {
  markdown: string;
  html: string;
  example: number;
  section: string;
};

// Ignore differences that render identically in a browser: cmark keeps soft
// line breaks as newlines where React joins with a space, React escapes quotes
// as entities, attribute order differs, and llmrender wraps heading text in an
// anchor by design. <pre> is masked first so real code whitespace survives.
function normalize(html: string) {
  const pres: string[] = [];
  let s = html.replace(/<pre[\s\S]*?<\/pre>/g, (m) => {
    pres.push(m.replace(/\n(<\/code>)/, "$1").replace(/\n(<\/pre>)/, "$1"));
    return " " + (pres.length - 1) + " ";
  });
  s = s.replace(
    /<h([1-6]) id="[^"]*"><a href="#[^"]*">([\s\S]*?)<\/a><\/h\1>/g,
    "<h$1>$2</h$1>",
  );
  s = s.replace(/\s+/g, " ").replace(/> </g, "><").trim();
  s = s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');
  s = s.replace(/<(br|hr|img|wbr|col)([^>]*?)\s*\/>/g, "<$1$2>");
  s = s.replace(
    /<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z_:-][\w:.-]*(?:="[^"]*")?)+)\s*>/g,
    (_, tag, attrs) => {
      const list: string[] =
        attrs.match(/[a-zA-Z_:-][\w:.-]*(?:="[^"]*")?/g) ?? [];
      return "<" + tag + " " + list.sort().join(" ") + ">";
    },
  );
  return s.replace(/ (\d+) /g, (_, i) => pres[+i]);
}

function render(markdown: string) {
  return renderToStaticMarkup(<Markdown>{markdown}</Markdown>)
    .replace(/^<div>/, "")
    .replace(/<\/div>$/, "");
}

it("does not regress against the CommonMark spec suite", () => {
  const sections: Record<string, { pass: number; total: number }> = {};
  let passed = 0;

  for (const example of spec as Example[]) {
    const section = (sections[example.section] ??= { pass: 0, total: 0 });
    section.total++;
    let actual: string;
    try {
      actual = normalize(render(example.markdown));
    } catch {
      continue;
    }
    if (actual === normalize(example.html)) {
      passed++;
      section.pass++;
    }
  }

  const breakdown = Object.entries(sections)
    .sort((a, b) => a[1].pass / a[1].total - b[1].pass / b[1].total)
    .map(([name, s]) => `  ${s.pass}/${s.total} ${name}`)
    .join("\n");

  expect(
    passed,
    `CommonMark compliance dropped to ${passed}/${spec.length}.\n${breakdown}`,
  ).toBeGreaterThanOrEqual(BASELINE);
});
