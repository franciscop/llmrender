import $ from "react-test";
import Markdown from "./index";

// rawHtml={true} — allow all tags, block dangerous attrs

it("renders inline span with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>{'hello <span class="hi">world</span>'}</Markdown>,
  );
  const span = root.find("span");
  expect(span.length).toBe(1);
  expect(span.attr("class")).toBe("hi");
  expect(span.text()).toBe("world");
});

it("renders inline sup and sub with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>{"H<sub>2</sub>O and x<sup>2</sup>"}</Markdown>,
  );
  expect(root.find("sub").text()).toBe("2");
  expect(root.find("sup").text()).toBe("2");
});

it("renders self-closing void tag with rawHtml={true}", () => {
  const root = $(<Markdown rawHtml={true}>{"<hr />"}</Markdown>);
  expect(root.find("hr").length).toBe(1);
});

it("does not render block void tag inline inside paragraph text", () => {
  const root = $(<Markdown rawHtml={true}>{"before<hr />after"}</Markdown>);
  // <hr> inside <p> is invalid DOM nesting — should be left as raw text
  expect(root.find("hr").length).toBe(0);
  expect(root.find("p").text()).toContain("before");
});

it("renders block-level single-line HTML with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>{'<div class="box">content</div>'}</Markdown>,
  );
  const div = root.find("div");
  expect(div.attr("class")).toBe("box");
  expect(div.text()).toBe("content");
});

// rawHtml allowlist — only listed tags/attrs pass through

it("allows listed tag with rawHtml allowlist", () => {
  const root = $(
    <Markdown rawHtml={{ mark: [] }}>
      {"text <mark>highlighted</mark> here"}
    </Markdown>,
  );
  expect(root.find("mark").length).toBe(1);
  expect(root.find("mark").text()).toBe("highlighted");
});

it("blocks unlisted tags with rawHtml allowlist", () => {
  const root = $(
    <Markdown rawHtml={{ mark: [] }}>
      {"text <span>not allowed</span> here"}
    </Markdown>,
  );
  expect(root.find("span").length).toBe(0);
});

it("allows only listed attributes with rawHtml allowlist", () => {
  const root = $(
    <Markdown rawHtml={{ span: ["class"] }}>
      {'<span class="ok" id="blocked">text</span>'}
    </Markdown>,
  );
  const span = root.find("span");
  expect(span.attr("class")).toBe("ok");
  expect(span.attr("id")).toBe(null);
});

it("blocks all HTML when rawHtml is false/undefined", () => {
  const root = $(
    <Markdown>{"hello <script>alert(1)</script> world"}</Markdown>,
  );
  expect(root.find("script").length).toBe(0);
});

// Security: dangerous attributes always blocked even with rawHtml={true}

it("blocks on* event handlers even with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>{'<img src="x" onerror="alert(1)" />'}</Markdown>,
  );
  const img = root.find("img");
  expect(img.length).toBe(1);
  expect(img.attr("onerror")).toBe(null);
  expect(img.attr("src")).toBe("x");
});

it("blocks javascript: href even with rawHtml={true}", () => {
  const root = $(
    <Markdown rawHtml={true}>
      {'<a href="javascript:alert(1)">click</a>'}
    </Markdown>,
  );
  const a = root.find("a");
  expect(a.length).toBe(1);
  expect(a.attr("href")).toBe(null);
});

it("blocks onclick even with rawHtml allowlist including the tag", () => {
  const root = $(
    <Markdown rawHtml={{ div: ["class", "onclick"] }}>
      {'<div class="x" onclick="alert(1)">text</div>'}
    </Markdown>,
  );
  const div = root.find("div");
  expect(div.attr("onclick")).toBe(null);
  expect(div.attr("class")).toBe("x");
});

// class → className mapping

it("maps class attribute to className", () => {
  const root = $(
    <Markdown rawHtml={true}>{'<span class="foo">bar</span>'}</Markdown>,
  );
  expect(root.find(".foo").length).toBe(1);
});
