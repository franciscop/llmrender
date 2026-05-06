import $ from "react-test";
import Markdown from "./index";

it("renders normal links unchanged", () => {
  const a = $(<Markdown>[click](https://example.com)</Markdown>).find("a");
  expect(a.attr("href")).toBe("https://example.com");
});

it("renders anchor links unchanged", () => {
  const a = $(<Markdown>{"[Overview](#overview)"}</Markdown>).find("a");
  expect(a.attr("href")).toBe("#overview");
  expect(a.text()).toBe("Overview");
});

it("sanitizes javascript: links", () => {
  const a = $(<Markdown>{"[click](javascript:alert(1))"}</Markdown>).find("a");
  expect(a.attr("href")).toBe("#");
});

it("sanitizes javascript: links with mixed case", () => {
  const a = $(<Markdown>{"[click](JavaScript:alert(1))"}</Markdown>).find("a");
  expect(a.attr("href")).toBe("#");
});

it("sanitizes data: links", () => {
  const a = $(
    <Markdown>{"[click](data:text/html,<h1>hi</h1>)"}</Markdown>,
  ).find("a");
  expect(a.attr("href")).toBe("#");
});

it("sanitizes vbscript: links", () => {
  const a = $(<Markdown>{"[click](vbscript:msgbox(1))"}</Markdown>).find("a");
  expect(a.attr("href")).toBe("#");
});

it("sanitizes javascript: image src", () => {
  const img = $(<Markdown>{"![alt](javascript:alert(1))"}</Markdown>).find(
    "img",
  );
  expect(img.attr("src")).toBe("#");
});

it("sanitizes data: image src", () => {
  const img = $(
    <Markdown>{"![alt](data:image/png;base64,abc)"}</Markdown>,
  ).find("img");
  expect(img.attr("src")).toBe("#");
});

it("allows normal image src", () => {
  const img = $(<Markdown>![alt](https://example.com/img.png)</Markdown>).find(
    "img",
  );
  expect(img.attr("src")).toBe("https://example.com/img.png");
});

it("does not create <pre> element from inline backtick `<pre>`", () => {
  const root = $(<Markdown>{"in both `<pre>` and `<code>` tags"}</Markdown>);
  expect(root.find("pre").length).toBe(0);
  expect(root.find("code").get(0)!.textContent).toBe("<pre>");
});

it("does not create <script> element from inline backtick `<script>`", () => {
  const root = $(<Markdown>{"run `<script>alert(1)</script>` here"}</Markdown>);
  expect(root.find("script").length).toBe(0);
  expect(root.find("code").get(0)!.textContent).toBe(
    "<script>alert(1)</script>",
  );
});

it("does not create <img> element from inline backtick `<img>`", () => {
  const root = $(
    <Markdown>{"use `<img src=x onerror=alert(1)>` tag"}</Markdown>,
  );
  expect(root.find("img").length).toBe(0);
  expect(root.find("code").get(0)!.textContent).toBe(
    "<img src=x onerror=alert(1)>",
  );
});

it("does not inject HTML tags found in fenced code blocks", () => {
  const root = $(<Markdown>{"```\n<script>alert(1)</script>\n```"}</Markdown>);
  expect(root.find("script").length).toBe(0);
  expect(root.find("code").text()).toContain("<script>");
});

it("renders 4-space indented block as pre/code, not paragraph", () => {
  const root = $(<Markdown>{"    <script>alert(1)</script>"}</Markdown>);
  expect(root.find("script").length).toBe(0);
  expect(root.find("pre").length).toBe(1);
  expect(root.find("code").text()).toContain("<script>");
});

it("does not inject arbitrary HTML tags in 4-space indented blocks", () => {
  const payloads = [
    "    <img src=x onerror=alert(1)>",
    "    <svg onload=alert(1)>",
    "    <iframe src=javascript:alert(1)>",
  ];
  for (const payload of payloads) {
    const root = $(<Markdown>{payload}</Markdown>);
    expect(root.find("img").length, payload).toBe(0);
    expect(root.find("svg").length, payload).toBe(0);
    expect(root.find("iframe").length, payload).toBe(0);
    expect(root.find("pre").length, payload).toBe(1);
  }
});

it("does not inject HTML tags found in inline code", () => {
  const root = $(
    <Markdown>{"here is `<img src=x onerror=alert(1)>`"}</Markdown>,
  );
  expect(root.find("img").length).toBe(0);
  expect(root.find("code").text()).toContain("<img");
});
