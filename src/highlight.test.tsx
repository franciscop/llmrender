import $ from "react-test";
import highlight from "./highlight";
import Markdown from "./index";

// Unit tests for highlight()
it("returns plain text for unknown language", () => {
  expect(highlight("hello", "unknown")).toEqual(["hello"]);
});

it("highlights a JS keyword", () => {
  const result = $(<p>{highlight("const x = 1", "js")}</p>);
  expect(result.find(".keyword").text()).toBe("const");
});

it("highlights a JS string", () => {
  const result = $(<p>{highlight('"hello"', "js")}</p>);
  expect(result.find(".string").text()).toBe('"hello"');
});

it("highlights a JS comment", () => {
  const result = $(<p>{highlight("// a comment", "js")}</p>);
  expect(result.find(".comment").text()).toBe("// a comment");
});

it("highlights a JS number", () => {
  const result = $(<p>{highlight("42", "js")}</p>);
  expect(result.find(".number").text()).toBe("42");
});

it("highlights multiple tokens", () => {
  const result = $(<p>{highlight("const x = 42", "js")}</p>);
  expect(result.find(".keyword").text()).toBe("const");
  expect(result.find(".number").text()).toBe("42");
});

it("highlights python keyword", () => {
  const result = $(<p>{highlight("def foo():", "py")}</p>);
  expect(result.find(".keyword").text()).toBe("def");
});

it("highlights python comment", () => {
  const result = $(<p>{highlight("# comment", "py")}</p>);
  expect(result.find(".comment").text()).toBe("# comment");
});

it("highlights css number with unit", () => {
  const result = $(<p>{highlight("margin: 10px", "css")}</p>);
  expect(result.find(".number").text()).toBe("10px");
});

it("highlights html tag", () => {
  const result = $(<p>{highlight("<div>", "html")}</p>);
  expect(result.find(".keyword").text()).toBe("<div");
});

it("highlights bash variable", () => {
  const result = $(<p>{highlight("echo $HOME", "bash")}</p>);
  expect(result.find(".number").text()).toBe("$HOME");
});

it("highlights bash keyword", () => {
  const result = $(<p>{highlight("if [ $x ]", "sh")}</p>);
  expect(result.find(".keyword").text()).toBe("if");
});

// JavaScript family aliases
it.each(["javascript", "ts", "typescript"])(
  "highlights keyword in %s",
  (lang) => {
    expect(
      $(<p>{highlight("const x = 1", lang)}</p>)
        .find(".keyword")
        .text(),
    ).toBe("const");
  },
);

// C family aliases — share JS patterns
it.each([
  "c",
  "cpp",
  "c++",
  "cs",
  "csharp",
  "java",
  "kotlin",
  "kt",
  "scala",
  "go",
  "rust",
  "rs",
  "swift",
  "php",
])("highlights comment in %s", (lang) => {
  expect(
    $(<p>{highlight("// note", lang)}</p>)
      .find(".comment")
      .text(),
  ).toBe("// note");
});

it.each(["c", "cpp", "rust", "go", "java"])(
  "highlights string in %s",
  (lang) => {
    expect(
      $(<p>{highlight('"hello"', lang)}</p>)
        .find(".string")
        .text(),
    ).toBe('"hello"');
  },
);

// Python family aliases
it.each(["python", "rb", "ruby", "yaml", "yml", "toml"])(
  "highlights comment in %s",
  (lang) => {
    expect(
      $(<p>{highlight("# note", lang)}</p>)
        .find(".comment")
        .text(),
    ).toBe("# note");
  },
);

// Data format aliases
it.each(["json", "jsonc"])("highlights number in %s", (lang) => {
  expect(
    $(<p>{highlight("42", lang)}</p>)
      .find(".number")
      .text(),
  ).toBe("42");
});

it("highlights string in sql", () => {
  expect(
    $(<p>{highlight('"value"', "sql")}</p>)
      .find(".string")
      .text(),
  ).toBe('"value"');
});

// CSS family aliases
it.each(["scss", "less"])("highlights number with unit in %s", (lang) => {
  expect(
    $(<p>{highlight("padding: 8px", lang)}</p>)
      .find(".number")
      .text(),
  ).toBe("8px");
});

// Markup aliases
it.each(["xml", "jsx", "tsx", "svelte", "vue"])(
  "highlights tag in %s",
  (lang) => {
    expect(
      $(<p>{highlight("<div>", lang)}</p>)
        .find(".keyword")
        .text(),
    ).toBe("<div");
  },
);

// Shell family aliases
it.each(["shell", "zsh", "fish", "dockerfile", "makefile"])(
  "highlights keyword in %s",
  (lang) => {
    expect(
      $(<p>{highlight("if true", lang)}</p>)
        .find(".keyword")
        .text(),
    ).toBe("if");
  },
);

// Operators
it("highlights JS operator", () => {
  expect(
    $(<p>{highlight("a === b", "js")}</p>)
      .find(".operator")
      .text(),
  ).toBe("===");
});

it("highlights JS arrow", () => {
  expect(
    $(<p>{highlight("x => x", "js")}</p>)
      .find(".operator")
      .text(),
  ).toBe("=>");
});

it("highlights Python operator", () => {
  expect(
    $(<p>{highlight("x ** 2", "py")}</p>)
      .find(".operator")
      .text(),
  ).toBe("**");
});

// Functions
it("highlights function call in JS", () => {
  expect(
    $(<p>{highlight("foo()", "js")}</p>)
      .find(".function")
      .text(),
  ).toBe("foo");
});

it("highlights function call in Python", () => {
  expect(
    $(<p>{highlight("print(x)", "py")}</p>)
      .find(".function")
      .text(),
  ).toBe("print");
});

// Types
it("highlights type/class name in JS", () => {
  expect(
    $(<p>{highlight("new MyClass()", "js")}</p>)
      .find(".type")
      .text(),
  ).toBe("MyClass");
});

it("highlights type in Python", () => {
  expect(
    $(<p>{highlight("class Animal:", "py")}</p>)
      .find(".type")
      .text(),
  ).toBe("Animal");
});

// Integration with Markdown
it("highlights code blocks via Markdown", () => {
  const $el = $(<Markdown>{"```js\nconst x = 1;\n```"}</Markdown>);
  expect($el.find("code").find(".keyword").text()).toBe("const");
  expect($el.find("code").find(".number").text()).toBe("1");
});

it("does not highlight code blocks without a language", () => {
  const $el = $(<Markdown>{"```\nconst x = 1;\n```"}</Markdown>);
  expect($el.find("code").find(".keyword").length).toBe(0);
});

it("escapes HTML tags inside inline code", () => {
  const result = $(
    <div>{highlight("<pre><code>hello</code></pre>", "js")}</div>,
  );

  expect(result.find("pre").length).toBe(0);
  expect(result.find("code").length).toBe(0);
  expect(result.find("span").length).toBe(6);

  expect(result.text()).toContain("<pre><code>hello</code></pre>");
});

it("does not create DOM elements from injected HTML in code", () => {
  const input = "`<script>alert(1)</script>`";

  const result = $(<p>{highlight(input, "js")}</p>);

  expect(result.find("script").length).toBe(0);
  expect(result.text()).toContain("<script>");
});

// diff language
it("highlights diff addition", () => {
  expect(
    $(<p>{highlight("+ added line", "diff")}</p>)
      .find(".string")
      .text(),
  ).toBe("+ added line");
});

it("highlights diff deletion", () => {
  expect(
    $(<p>{highlight("- removed line", "diff")}</p>)
      .find(".keyword")
      .text(),
  ).toBe("- removed line");
});

it("highlights diff hunk header", () => {
  expect(
    $(<p>{highlight("@@ -1,3 +1,4 @@", "diff")}</p>)
      .find(".comment")
      .text(),
  ).toBe("@@ -1,3 +1,4 @@");
});

it.each(["diff", "patch"])("recognises %s language alias", (lang) => {
  expect(
    $(<p>{highlight("+ line", lang)}</p>)
      .find(".string")
      .text(),
  ).toBe("+ line");
});

// SQL keywords
it("highlights SQL SELECT keyword", () => {
  expect(
    $(<p>{highlight("SELECT id FROM users", "sql")}</p>)
      .find(".keyword")
      .text(),
  ).toBe("SELECT");
});

it("highlights SQL FROM keyword", () => {
  expect(
    $(<p>{highlight("FROM users", "sql")}</p>)
      .find(".keyword")
      .text(),
  ).toBe("FROM");
});

it("highlights SQL keywords case-insensitively", () => {
  expect(
    $(<p>{highlight("from users", "sql")}</p>)
      .find(".keyword")
      .text(),
  ).toBe("from");
});

it("highlights SQL line comment", () => {
  expect(
    $(<p>{highlight("-- a comment", "sql")}</p>)
      .find(".comment")
      .text(),
  ).toBe("-- a comment");
});

// Number literals: hex, binary, and underscored
it("highlights hex number in JS", () => {
  expect(
    $(<p>{highlight("0xFF", "js")}</p>)
      .find(".number")
      .text(),
  ).toBe("0xFF");
});

it("highlights binary number in JS", () => {
  expect(
    $(<p>{highlight("0b1010", "js")}</p>)
      .find(".number")
      .text(),
  ).toBe("0b1010");
});

it("highlights number with underscores in JS", () => {
  expect(
    $(<p>{highlight("1_000_000", "js")}</p>)
      .find(".number")
      .text(),
  ).toBe("1_000_000");
});

it("highlights hex number in Python", () => {
  expect(
    $(<p>{highlight("0xFF", "py")}</p>)
      .find(".number")
      .text(),
  ).toBe("0xFF");
});

// Python decorators
it("highlights Python decorator", () => {
  expect(
    $(<p>{highlight("@property", "py")}</p>)
      .find(".keyword")
      .text(),
  ).toBe("@property");
});

it("highlights Python decorator with dotted name", () => {
  expect(
    $(<p>{highlight("@app.route", "py")}</p>)
      .find(".keyword")
      .text(),
  ).toBe("@app.route");
});

// Rust attributes
it("highlights Rust attribute opener as keyword", () => {
  expect(
    $(<p>{highlight("#[derive(Debug)]", "rust")}</p>)
      .find(".keyword")
      .text(),
  ).toContain("#[");
});
