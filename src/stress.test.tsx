import $ from "react-test";
import { readFileSync } from "fs";
import { join } from "path";
import Markdown from "./index";

const md = readFileSync(join(process.cwd(), "demo/node/test.md"), "utf-8");

// ---------------------------------------------------------------------------
// Full document
// ---------------------------------------------------------------------------

describe("full document", () => {
  it("renders without throwing", () => {
    expect(() => $(<Markdown>{md}</Markdown>)).not.toThrow();
  });

  it("has all 6 heading levels", () => {
    const el = $(<Markdown>{md}</Markdown>);
    for (const tag of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
      expect(el.find(tag).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("has expected element counts", () => {
    const el = $(<Markdown>{md}</Markdown>);
    expect(el.find("h1").length).toBe(2); // title + "# H1 with **bold**..." in headings section
    expect(el.find("h2").length).toBeGreaterThanOrEqual(8);
    expect(el.find("table").length).toBeGreaterThanOrEqual(6);
    expect(el.find("blockquote").length).toBeGreaterThan(5);
    expect(el.find("pre").length).toBeGreaterThan(12);
    expect(el.find(".math-inline").length).toBeGreaterThan(5);
    // $$...$$ in table cells and inline sentences renders as .math-display, not .math-block
    expect(el.find(".math-display").length).toBeGreaterThan(10);
    expect(el.find("li").length).toBeGreaterThan(25);
    expect(el.find("hr").length).toBeGreaterThanOrEqual(3);
    expect(el.find("ruby").length).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// Inline nesting
// ---------------------------------------------------------------------------

describe("inline nesting", () => {
  it("bold wrapping italic", () => {
    const el = $(<Markdown>{"**bold *italic* bold**"}</Markdown>);
    expect(el.find("strong em").text()).toBe("italic");
  });

  it("bold inside italic (*italic **bold** italic*) renders bold as strong", () => {
    const el = $(<Markdown>{"*italic **bold** italic*"}</Markdown>);
    expect(el.find("strong").text()).toBe("bold");
  });

  it("mixed delimiters: *outer _inner_ outer* keeps inner as nested em", () => {
    const el = $(<Markdown>{"*this is _nested_ emphasis*"}</Markdown>);
    expect(el.find("em em").text()).toBe("nested");
    expect(el.find("em").length).toBe(2);
  });

  it("strikethrough wrapping bold", () => {
    const el = $(<Markdown>{"~~**bold deleted**~~"}</Markdown>);
    expect(el.find("del strong").text()).toBe("bold deleted");
  });

  it("strikethrough wrapping italic", () => {
    const el = $(<Markdown>{"~~*italic deleted*~~"}</Markdown>);
    expect(el.find("del em").text()).toBe("italic deleted");
  });

  it("code span suppresses bold formatting", () => {
    const el = $(<Markdown>{"`**not bold**`"}</Markdown>);
    expect(el.find("code").text()).toBe("**not bold**");
    expect(el.find("strong").length).toBe(0);
  });

  it("code span suppresses italic formatting", () => {
    const el = $(<Markdown>{"`_not italic_`"}</Markdown>);
    expect(el.find("code").text()).toBe("_not italic_");
    expect(el.find("em").length).toBe(0);
  });

  it("code span suppresses strikethrough", () => {
    const el = $(<Markdown>{"`~~not struck~~`"}</Markdown>);
    expect(el.find("del").length).toBe(0);
  });

  it("bold directly adjacent to word characters", () => {
    const el = $(<Markdown>{"word**bold**word"}</Markdown>);
    expect(el.find("strong").text()).toBe("bold");
  });

  it("bold+italic shorthand with triple asterisks", () => {
    const el = $(<Markdown>{"***bold italic***"}</Markdown>);
    const inner = el.find("strong em").text();
    expect(inner).toBe("bold italic");
  });

  it("bold code span", () => {
    const el = $(<Markdown>{"**`bold code`**"}</Markdown>);
    expect(el.find("strong code").text()).toBe("bold code");
  });

  it("italic code span", () => {
    const el = $(<Markdown>{"*`italic code`*"}</Markdown>);
    expect(el.find("em code").text()).toBe("italic code");
  });

  it("multiple independent spans in one paragraph", () => {
    const el = $(<Markdown>{"**a** and **b** and *c* and *d*"}</Markdown>);
    expect(el.find("strong").length).toBe(2);
    expect(el.find("em").length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Links — edge cases
// ---------------------------------------------------------------------------

describe("links — edge cases", () => {
  it("Wikipedia URL with balanced parentheses (mathematics)", () => {
    const a = $(
      <Markdown>
        {"[Bracket](https://en.wikipedia.org/wiki/Bracket_(mathematics))"}
      </Markdown>,
    ).find("a");
    expect(a.attr("href")).toBe(
      "https://en.wikipedia.org/wiki/Bracket_(mathematics)",
    );
    expect(a.text()).toBe("Bracket");
  });

  it("Wikipedia URL with balanced parentheses (mathematics) no stray text", () => {
    const el = $(
      <Markdown>
        {"[Limit](https://en.wikipedia.org/wiki/Limit_(mathematics))"}
      </Markdown>,
    );
    expect(el.find("a").attr("href")).toBe(
      "https://en.wikipedia.org/wiki/Limit_(mathematics)",
    );
    expect(el.text()).not.toContain(")");
  });

  it("adjacent links produce two anchor elements", () => {
    const el = $(
      <Markdown>
        {"[first](https://example.com/1)[second](https://example.com/2)"}
      </Markdown>,
    );
    expect(el.find("a").length).toBe(2);
    expect(el.find("a:nth-child(1)").attr("href")).toBe(
      "https://example.com/1",
    );
    expect(el.find("a:nth-child(2)").attr("href")).toBe(
      "https://example.com/2",
    );
  });

  it("bold label inside link", () => {
    const el = $(
      <Markdown>{"[**bold label**](https://example.com)"}</Markdown>,
    );
    expect(el.find("a strong").text()).toBe("bold label");
  });

  it("italic label inside link", () => {
    const el = $(
      <Markdown>{"[*italic label*](https://example.com)"}</Markdown>,
    );
    expect(el.find("a em").text()).toBe("italic label");
  });

  it("code label inside link", () => {
    const el = $(<Markdown>{"[`code label`](https://example.com)"}</Markdown>);
    expect(el.find("a code").text()).toBe("code label");
  });

  it("fragment link", () => {
    const a = $(<Markdown>{"[jump to math](#math)"}</Markdown>).find("a");
    expect(a.attr("href")).toBe("#math");
    expect(a.text()).toBe("jump to math");
  });

  it("link with title attribute", () => {
    const a = $(
      <Markdown>{'[example](https://example.com "My site")'}</Markdown>,
    ).find("a");
    expect(a.attr("href")).toBe("https://example.com");
    expect(a.attr("title")).toBe("My site");
  });

  it("auto-detected bare URL becomes anchor", () => {
    const a = $(
      <Markdown>{"visit https://example.com/path?q=1 now"}</Markdown>,
    ).find("a");
    expect(a.attr("href")).toBe("https://example.com/path?q=1");
  });
});

// ---------------------------------------------------------------------------
// Headings with inline content
// ---------------------------------------------------------------------------

describe("headings with inline content", () => {
  it("h1 contains bold and italic", () => {
    const el = $(<Markdown>{"# Heading with **bold** and *italic*"}</Markdown>);
    expect(el.find("h1 strong").text()).toBe("bold");
    expect(el.find("h1 em").text()).toBe("italic");
  });

  it("h2 contains inline code", () => {
    const el = $(<Markdown>{"## Heading with `inline code`"}</Markdown>);
    expect(el.find("h2 code").text()).toBe("inline code");
  });

  it("h3 contains a link", () => {
    const el = $(
      <Markdown>{"### Heading with a [link](https://example.com)"}</Markdown>,
    );
    // headings wrap content in a self-anchor; select the external link explicitly
    expect(
      el
        .find("h3 a")
        .filter((a) => (a as HTMLAnchorElement).href.startsWith("https"))
        .attr("href"),
    ).toBe("https://example.com");
  });

  it("consecutive h3s all render", () => {
    const src = "### First\n### Second\n### Third";
    const el = $(<Markdown>{src}</Markdown>);
    expect(el.find("h3").length).toBe(3);
    expect(el.find("h3:nth-of-type(1)").text()).toBe("First");
    expect(el.find("h3:nth-of-type(2)").text()).toBe("Second");
    expect(el.find("h3:nth-of-type(3)").text()).toBe("Third");
  });
});

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

describe("lists", () => {
  it("task list: checked item has checked checkbox", () => {
    const src = "- [x] Done\n- [ ] Todo";
    const el = $(<Markdown>{src}</Markdown>);
    const checkboxes = el.find("input[type=checkbox]");
    expect(checkboxes.length).toBe(2);
    expect((checkboxes.get(0) as HTMLInputElement).checked).toBe(true);
    expect((checkboxes.get(1) as HTMLInputElement).checked).toBe(false);
  });

  it("task list item with bold text", () => {
    const el = $(<Markdown>{"- [x] Item with **bold** text"}</Markdown>);
    expect(el.find("li strong").text()).toBe("bold");
    expect(
      (el.find("input[type=checkbox]").get(0) as HTMLInputElement).checked,
    ).toBe(true);
  });

  it("task list item with link", () => {
    const el = $(
      <Markdown>{"- [ ] Item with a [link](https://example.com)"}</Markdown>,
    );
    expect(el.find("li a").attr("href")).toBe("https://example.com");
  });

  it("nested unordered list: child accessible via ul ul li", () => {
    const src = "- Level one\n  - Level two\n  - Also two";
    const el = $(<Markdown>{src}</Markdown>);
    expect(el.find("ul ul li").length).toBe(2);
    expect(el.find("ul ul li:nth-child(1)").text()).toBe("Level two");
    expect(el.find("ul ul li:nth-child(2)").text()).toBe("Also two");
  });

  it("ordered list with non-sequential numbers still renders as ol", () => {
    const src = "3. Bird\n1. McHale\n8. Parish";
    const el = $(<Markdown>{src}</Markdown>);
    expect(el.find("ol").length).toBe(1);
    expect(el.find("li").length).toBe(3);
  });

  it("bold inside list item", () => {
    const el = $(<Markdown>{"- **Bold item**"}</Markdown>);
    expect(el.find("li strong").text()).toBe("Bold item");
  });

  it("link inside list item", () => {
    const el = $(
      <Markdown>
        {'- Item with [a link](https://example.com "title")'}
      </Markdown>,
    );
    expect(el.find("li a").attr("href")).toBe("https://example.com");
    expect(el.find("li a").attr("title")).toBe("title");
  });

  it("three list items with mixed inline formatting", () => {
    const src = "- **bold**\n- *italic*\n- `code`";
    const el = $(<Markdown>{src}</Markdown>);
    expect(el.find("li").length).toBe(3);
    expect(el.find("li strong").text()).toBe("bold");
    expect(el.find("li em").text()).toBe("italic");
    expect(el.find("li code").text()).toBe("code");
  });
});

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

describe("tables", () => {
  it("left/center/right column alignment", () => {
    const src = "| L | C | R |\n|:--|:-:|--:|\n| a | b | c |";
    const el = $(<Markdown>{src}</Markdown>);
    const ths = el.find("th");
    expect((ths.get(0) as HTMLElement).style.textAlign).toBe("left");
    expect((ths.get(1) as HTMLElement).style.textAlign).toBe("center");
    expect((ths.get(2) as HTMLElement).style.textAlign).toBe("right");
    const tds = el.find("td");
    expect((tds.get(0) as HTMLElement).style.textAlign).toBe("left");
    expect((tds.get(1) as HTMLElement).style.textAlign).toBe("center");
    expect((tds.get(2) as HTMLElement).style.textAlign).toBe("right");
  });

  it("strong inside td", () => {
    const src = "| Col |\n|---|\n| **bold** |";
    expect(
      $(<Markdown>{src}</Markdown>)
        .find("td strong")
        .text(),
    ).toBe("bold");
  });

  it("em inside td", () => {
    const src = "| Col |\n|---|\n| *italic* |";
    expect(
      $(<Markdown>{src}</Markdown>)
        .find("td em")
        .text(),
    ).toBe("italic");
  });

  it("code inside td", () => {
    const src = "| Col |\n|---|\n| `code` |";
    expect(
      $(<Markdown>{src}</Markdown>)
        .find("td code")
        .text(),
    ).toBe("code");
  });

  it("del inside td", () => {
    const src = "| Col |\n|---|\n| ~~struck~~ |";
    expect(
      $(<Markdown>{src}</Markdown>)
        .find("td del")
        .text(),
    ).toBe("struck");
  });

  it("link inside td", () => {
    const src = "| Col |\n|---|\n| [ex](https://example.com) |";
    expect(
      $(<Markdown>{src}</Markdown>)
        .find("td a")
        .attr("href"),
    ).toBe("https://example.com");
  });

  it("inline math inside td", () => {
    const src = "| Eq |\n|---|\n| $x^2$ |";
    expect($(<Markdown>{src}</Markdown>).find("td .math-inline").length).toBe(
      1,
    );
  });
});

// ---------------------------------------------------------------------------
// Blockquotes
// ---------------------------------------------------------------------------

describe("blockquotes", () => {
  it("triple-nested blockquote renders three levels", () => {
    const src = "> Outer\n>\n> > Inner\n> >\n> > > Triple";
    const el = $(<Markdown>{src}</Markdown>);
    expect(
      el.find("blockquote blockquote blockquote").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("bold inside blockquote", () => {
    const el = $(<Markdown>{"> **bold**"}</Markdown>);
    expect(el.find("blockquote strong").text()).toBe("bold");
  });

  it("italic inside blockquote", () => {
    const el = $(<Markdown>{"> *italic*"}</Markdown>);
    expect(el.find("blockquote em").text()).toBe("italic");
  });

  it("code inside blockquote", () => {
    const el = $(<Markdown>{"> `code`"}</Markdown>);
    expect(el.find("blockquote code").text()).toBe("code");
  });

  it("del inside blockquote", () => {
    const el = $(<Markdown>{"> ~~struck~~"}</Markdown>);
    expect(el.find("blockquote del").text()).toBe("struck");
  });

  it("link inside blockquote", () => {
    const el = $(<Markdown>{"> [x](https://example.com)"}</Markdown>);
    expect(el.find("blockquote a").attr("href")).toBe("https://example.com");
  });

  it("ordered list inside blockquote", () => {
    const src = "> 1. First\n> 2. Second\n> 3. Third";
    const el = $(<Markdown>{src}</Markdown>);
    expect(el.find("blockquote ol").length).toBe(1);
    expect(el.find("blockquote li").length).toBe(3);
  });

  it("inline math inside blockquote", () => {
    const el = $(<Markdown>{"> The formula $x^2$"}</Markdown>);
    expect(el.find("blockquote .math-inline").length).toBe(1);
  });

  it("heading inside blockquote", () => {
    const el = $(<Markdown>{"> ## Quoted heading"}</Markdown>);
    expect(el.find("blockquote h2").text()).toBe("Quoted heading");
  });
});

// ---------------------------------------------------------------------------
// Code blocks — isolation
// ---------------------------------------------------------------------------

describe("code blocks — isolation", () => {
  it("three consecutive fenced blocks render as three pre elements", () => {
    const src = "```\na\n```\n```\nb\n```\n```\nc\n```";
    const el = $(<Markdown>{src}</Markdown>);
    expect(el.find("pre").length).toBe(3);
  });

  it("HTML inside a fenced block is not parsed as markup", () => {
    const src = "```\n<p>paragraph</p>\n<script>alert(1)</script>\n```";
    const el = $(<Markdown>{src}</Markdown>);
    expect(el.find("pre script").length).toBe(0);
    expect(el.find("pre p").length).toBe(0);
    expect(el.find("pre").text()).toContain("<p>paragraph</p>");
  });

  it("markdown inside a fenced block is not parsed", () => {
    const src =
      "```\n# Not a heading\n**not bold**\n[not a link](https://example.com)\n```";
    const el = $(<Markdown>{src}</Markdown>);
    expect(el.find("pre h1").length).toBe(0);
    expect(el.find("pre strong").length).toBe(0);
    expect(el.find("pre a").length).toBe(0);
    expect(el.find("pre").text()).toContain("# Not a heading");
  });

  it("math syntax inside a fenced block is not rendered", () => {
    const src = "```\n$x^2$\n$$\\frac{a}{b}$$\n```";
    const el = $(<Markdown>{src}</Markdown>);
    expect(el.find("pre .math-inline").length).toBe(0);
    expect(el.find("pre .math-block").length).toBe(0);
    expect(el.find("pre").text()).toContain("$x^2$");
  });

  it("indented (4-space) code block renders as pre", () => {
    const src =
      "paragraph before\n\n    const x = 42;\n    function foo() {}\n\nparagraph after";
    const el = $(<Markdown>{src}</Markdown>);
    expect(el.find("pre").length).toBe(1);
    expect(el.find("pre").text()).toContain("const x = 42;");
  });
});

// ---------------------------------------------------------------------------
// Math integration
// ---------------------------------------------------------------------------

describe("math integration", () => {
  it("multiple inline math spans in one paragraph", () => {
    const el = $(
      <Markdown>
        {"$E = mc^2$, $\\hat{x} \\in \\mathbb{R}^n$, $\\forall \\epsilon > 0$"}
      </Markdown>,
    );
    expect(el.find(".math-inline").length).toBe(3);
  });

  it("display math renders as math-block", () => {
    const el = $(
      <Markdown>
        {"$$\\int_{-\\infty}^{+\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}$$"}
      </Markdown>,
    );
    expect(el.find(".math-block").length).toBe(1);
    expect(el.find(".math-block math").length).toBe(1);
  });

  it("inline math inside a table cell", () => {
    const src = "| Formula |\n|---|\n| $a^2 + b^2 = c^2$ |";
    expect(
      $(<Markdown>{src}</Markdown>).find("td .math-inline math").length,
    ).toBe(1);
  });

  it("inline math inside a blockquote", () => {
    const el = $(
      <Markdown>
        {"The formula $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$ is quadratic."}
      </Markdown>,
    );
    expect(el.find(".math-inline").length).toBe(1);
  });

  it("inline math inside a heading", () => {
    const el = $(<Markdown>{"## Section $f(x) = x^2$"}</Markdown>);
    expect(el.find("h2 .math-inline").length).toBe(1);
  });

  it("inline math inside a list item", () => {
    const el = $(<Markdown>{"- The value is $x^2 + y^2 = r^2$"}</Markdown>);
    expect(el.find("li .math-inline").length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Escaping and special characters
// ---------------------------------------------------------------------------

describe("escaping and special characters", () => {
  it("escaped asterisks are not rendered as bold", () => {
    const el = $(<Markdown>{"\\*not bold\\*"}</Markdown>);
    expect(el.find("strong").length).toBe(0);
    expect(el.text()).toContain("*not bold*");
  });

  it("escaped underscores are not rendered as italic", () => {
    const el = $(<Markdown>{"\\_ not italic \\_"}</Markdown>);
    expect(el.find("em").length).toBe(0);
  });

  it("escaped brackets are not rendered as a markdown link", () => {
    // non-http target so auto-link doesn't fire on the URL either
    const el = $(<Markdown>{"\\[not a link\\](not-a-url)"}</Markdown>);
    expect(el.find("a").length).toBe(0);
    expect(el.text()).toContain("[not a link]");
  });

  it("escaped backtick is not rendered as code", () => {
    const el = $(<Markdown>{"\\`not code\\`"}</Markdown>);
    expect(el.find("code").length).toBe(0);
  });

  it("horizontal rules render as hr", () => {
    for (const rule of ["---", "***", "___"]) {
      const el = $(<Markdown>{rule}</Markdown>);
      expect(el.find("hr").length).toBe(1);
    }
  });
});

// ---------------------------------------------------------------------------
// Ruby / furigana
// ---------------------------------------------------------------------------

describe("ruby / furigana", () => {
  it("renders ruby element with rt", () => {
    const el = $(<Markdown>{"[東京]{とうきょう}"}</Markdown>);
    expect(el.find("ruby").length).toBe(1);
    expect(el.find("ruby rt").text()).toBe("とうきょう");
  });

  it("multiple ruby spans in one paragraph", () => {
    const el = $(
      <Markdown>{"[日本語]{にほんご} and [漢字]{かんじ}"}</Markdown>,
    );
    expect(el.find("ruby").length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Unicode pass-through
// ---------------------------------------------------------------------------

describe("unicode pass-through", () => {
  it("CJK characters render as-is", () => {
    const el = $(<Markdown>{"你好世界"}</Markdown>);
    expect(el.text()).toContain("你好世界");
  });

  it("Arabic characters render as-is", () => {
    const el = $(<Markdown>{"مرحبا"}</Markdown>);
    expect(el.text()).toContain("مرحبا");
  });

  it("emoji pass through", () => {
    const el = $(<Markdown>{"🎉 🚀 ✅ ❌"}</Markdown>);
    expect(el.text()).toContain("🎉");
    expect(el.text()).toContain("✅");
  });

  it("unicode math symbols as plain text (no LaTeX)", () => {
    const el = $(<Markdown>{"α β γ ∑ ∫ ≠ ≤ ≥ ∞"}</Markdown>);
    expect(el.text()).toContain("α");
    expect(el.text()).toContain("∞");
    expect(el.find(".math-inline").length).toBe(0);
  });
});
